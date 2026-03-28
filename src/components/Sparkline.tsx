import { motion } from 'motion/react';

interface SparklineProps {
  data: number[];
  color?: string;
  className?: string;
  height?: number;
}

export const Sparkline = ({ data, color = "var(--color-primary)", className = "", height = 40 }: SparklineProps) => {
  const max = Math.max(...data);
  
  return (
    <div className={`flex items-end gap-[2px] ${className}`} style={{ height }}>
      {data.map((val, i) => {
        const h = (val / max) * 100;
        const isLast = i === data.length - 1;
        
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="w-full rounded-t-sm"
            style={{ 
              backgroundColor: isLast ? color : `${color}33`,
              boxShadow: isLast ? `0 0 10px ${color}66` : 'none'
            }}
          />
        );
      })}
    </div>
  );
};
