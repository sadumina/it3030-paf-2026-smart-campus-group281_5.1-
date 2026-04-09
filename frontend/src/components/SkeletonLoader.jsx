import React from 'react';

export const SkeletonKPICard = () => (
  <div className="rounded-lg border-2 border-slate-300 bg-slate-200 p-4 animate-pulse">
    <div className="h-3 w-24 rounded bg-slate-300"></div>
    <div className="mt-2 h-8 w-32 rounded bg-slate-300"></div>
    <div className="mt-1 h-3 w-20 rounded bg-slate-300"></div>
  </div>
);

export const SkeletonChart = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 animate-pulse dark:bg-slate-800 dark:border-slate-700">
    <div className="h-4 w-48 rounded bg-slate-300 dark:bg-slate-600"></div>
    <div className="mt-4 space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="h-8 w-full rounded bg-slate-200 dark:bg-slate-600"></div>
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonTable = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 animate-pulse dark:bg-slate-800 dark:border-slate-700">
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 w-32 rounded bg-slate-300 dark:bg-slate-600"></div>
          <div className="h-4 w-48 rounded bg-slate-300 dark:bg-slate-600"></div>
          <div className="h-4 w-24 rounded bg-slate-300 dark:bg-slate-600"></div>
        </div>
      ))}
    </div>
  </div>
);
