
'use client';
export default function LoadingSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-10 rounded-2xl bg-gray-200/50 dark:bg-gray-800/50" />
      ))}
    </div>
  );
}
