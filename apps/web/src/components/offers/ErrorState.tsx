
'use client';
export default function ErrorState({ message = "Something went wrong." }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-red-200/40 bg-red-50/50 p-4 text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
      <p className="font-semibold">Error</p>
      <p className="text-sm opacity-80">{message}</p>
    </div>
  );
}
