import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div 
      className={`animate-pulse bg-white/5 rounded-xl ${className}`} 
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="glass-bg p-4 rounded-2xl border border-white/5 h-full">
      <Skeleton className="h-48 w-full mb-4 rounded-xl" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
};

export const ListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-bg p-4 rounded-2xl flex gap-4 items-center">
           <Skeleton className="w-12 h-12 rounded-full" />
           <div className="flex-1">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-1/4" />
           </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;