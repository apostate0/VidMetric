const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string;
const BASE = 'https://www.googleapis.com/youtube/v3';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoItem {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  durationFmt: string;
  views: number;
  likes: number;
  comments: number;
  viewsPerDay: number;
  daysSincePublished: number;
  isTrending: boolean;
  trend: number[];
}

export interface ChannelInfo {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  uploadsPlaylistId: string;
  customUrl?: string;
}

export type DateFilter = '7d' | '30d' | 'all';
export type SortKey = 'views' | 'viewsPerDay' | 'likes' | 'date';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '0:00';
  const h = parseInt(m[1] || '0');
  const mn = parseInt(m[2] || '0');
  const s = parseInt(m[3] || '0');
  if (h > 0) return `${h}:${String(mn).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${mn}:${String(s).padStart(2, '0')}`;
}

function daysSince(dateStr: string): number {
  return Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000));
}

function makeTrend(vpd: number, days: number): number[] {
  const pts = 6;
  return Array.from({ length: pts }, (_, i) => {
    const progress = i / (pts - 1);
    const jitter = 0.8 + Math.random() * 0.4;
    return Math.round(vpd * progress * jitter);
  });
}

async function ytFetch(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'YouTube API error');
  return data;
}

// ─── Channel Resolution ───────────────────────────────────────────────────────

export async function resolveChannelId(input: string): Promise<string> {
  let raw = input.trim().replace(/\/+$/, '');

  // Extract path segment from full URLs
  const urlMatch = raw.match(/youtube\.com\/(@[\w.-]+|channel\/(UC[\w-]{22})|c\/([\w.-]+)|user\/([\w.-]+))/i);
  if (urlMatch) raw = urlMatch[1] ?? urlMatch[2] ?? urlMatch[3] ?? urlMatch[4];

  // Already a channel ID
  if (/^UC[\w-]{22}$/.test(raw)) return raw;

  // @handle lookup
  const handle = raw.startsWith('@') ? raw : `@${raw}`;
  const data = await ytFetch(
    `${BASE}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${API_KEY}`
  );
  if (data.items?.length) return data.items[0].id;

  // Fallback: search
  const searchData = await ytFetch(
    `${BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(raw)}&maxResults=1&key=${API_KEY}`
  );
  if (searchData.items?.length) return searchData.items[0].snippet.channelId;

  throw new Error(`Could not find channel "${input}". Try pasting the full YouTube channel URL.`);
}

// ─── Channel Metadata ─────────────────────────────────────────────────────────

export async function fetchChannelInfo(channelId: string): Promise<ChannelInfo> {
  const data = await ytFetch(
    `${BASE}/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${API_KEY}`
  );
  if (!data.items?.length) throw new Error('Channel not found.');
  const ch = data.items[0];
  return {
    id: ch.id,
    title: ch.snippet.title,
    thumbnail: ch.snippet.thumbnails?.high?.url ?? ch.snippet.thumbnails?.default?.url ?? '',
    subscriberCount: parseInt(ch.statistics.subscriberCount ?? '0'),
    videoCount: parseInt(ch.statistics.videoCount ?? '0'),
    viewCount: parseInt(ch.statistics.viewCount ?? '0'),
    uploadsPlaylistId: ch.contentDetails.relatedPlaylists.uploads,
    customUrl: ch.snippet.customUrl,
  };
}

// ─── Videos ───────────────────────────────────────────────────────────────────

async function fetchPlaylistVideoIds(
  playlistId: string,
  publishedAfter?: Date
): Promise<string[]> {
  const ids: string[] = [];
  let pageToken = '';

  while (ids.length < 50) {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      key: API_KEY,
      ...(pageToken ? { pageToken } : {}),
    });
    const data = await ytFetch(`${BASE}/playlistItems?${params}`);
    if (!data.items) break;
    for (const item of data.items) {
      const pub = item.snippet.publishedAt as string;
      if (publishedAfter && new Date(pub) < publishedAfter) return ids;
      ids.push(item.snippet.resourceId.videoId as string);
    }
    pageToken = data.nextPageToken ?? '';
    if (!pageToken) break;
  }
  return ids;
}

async function fetchVideoDetails(videoIds: string[]): Promise<VideoItem[]> {
  const results: VideoItem[] = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const data = await ytFetch(
      `${BASE}/videos?part=snippet,statistics,contentDetails&id=${chunk.join(',')}&key=${API_KEY}`
    );
    for (const v of (data.items ?? [])) {
      const pub: string = v.snippet.publishedAt;
      const days = daysSince(pub);
      const views = parseInt(v.statistics.viewCount ?? '0');
      const vpd = Math.round(views / days);
      results.push({
        id: v.id,
        title: v.snippet.title,
        publishedAt: pub,
        thumbnail: v.snippet.thumbnails?.high?.url ?? v.snippet.thumbnails?.medium?.url ?? '',
        durationFmt: parseDuration(v.contentDetails.duration),
        views,
        likes: parseInt(v.statistics.likeCount ?? '0'),
        comments: parseInt(v.statistics.commentCount ?? '0'),
        viewsPerDay: vpd,
        daysSincePublished: days,
        isTrending: false,
        trend: makeTrend(vpd, days),
      });
    }
  }
  return results;
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

export async function fetchChannelVideos(
  channelId: string,
  dateFilter: DateFilter = '30d'
): Promise<VideoItem[]> {
  const publishedAfter =
    dateFilter === '7d'  ? new Date(Date.now() - 7  * 86_400_000) :
    dateFilter === '30d' ? new Date(Date.now() - 30 * 86_400_000) :
    undefined;

  const info = await fetchChannelInfo(channelId);
  const ids = await fetchPlaylistVideoIds(info.uploadsPlaylistId, publishedAfter);
  if (!ids.length) return [];

  const videos = await fetchVideoDetails(ids);

  // Mark trending (>1.5× channel avg views/day)
  const avg = videos.reduce((s, v) => s + v.viewsPerDay, 0) / videos.length;
  return videos.map(v => ({ ...v, isTrending: v.viewsPerDay > avg * 1.5 }));
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function exportCSV(videos: VideoItem[], channelTitle: string): void {
  const headers = ['Title', 'Published', 'Views', 'Likes', 'Comments', 'Views/Day', 'Days Old', 'Trending'];
  const rows = videos.map(v => [
    `"${v.title.replace(/"/g, '""')}"`,
    formatDate(v.publishedAt),
    v.views,
    v.likes,
    v.comments,
    v.viewsPerDay,
    v.daysSincePublished,
    v.isTrending ? 'Yes' : 'No',
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${channelTitle.replace(/\s/g, '_')}_vidmetrics.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
