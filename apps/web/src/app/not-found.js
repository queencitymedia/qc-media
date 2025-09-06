export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">404 - Page Not Found</h2>
        <p className="opacity-70">Sorry, we couldn’t find the page you’re looking for.</p>
        <a href="/" className="text-blue-600 hover:underline">Go back home</a>
      </div>
    </main>
  );
}
