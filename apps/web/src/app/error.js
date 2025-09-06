"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-red-50 text-red-800">
        <div className="p-6 rounded-xl bg-white shadow space-y-4 text-center">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <p className="opacity-80">{error?.message}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
