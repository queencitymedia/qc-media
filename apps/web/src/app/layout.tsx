export const metadata = { title: "QC Media", description: "Hands-free Agent UI" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{fontFamily:"system-ui,Segoe UI,Arial",margin:0,padding:"24px"}}>
        <header style={{marginBottom:"16px",display:"flex",gap:"12px",alignItems:"baseline"}}>
          <h1 style={{margin:0}}>QC Media</h1>
          <span style={{opacity:.7}}>App Router . Offers demo</span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}