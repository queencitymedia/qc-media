export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
