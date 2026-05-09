import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-white/[0.05] rounded-xl ${className}`}
          style={{
            animationDelay: `${i * 100}ms`,
            animationDuration: '1.5s'
          }}
        />
      ))}
    </>
  );
};

export default Skeleton;
