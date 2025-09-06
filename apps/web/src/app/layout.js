export const metadata = { title: "Queen City Media" };


import Navbar from "@/components/navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
