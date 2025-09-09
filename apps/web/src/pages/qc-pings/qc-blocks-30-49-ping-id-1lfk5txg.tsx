import React from 'react';

export default function QcPing(){
  return (
    <main style={{padding:'2rem',fontFamily:'system-ui,Segoe UI,Roboto'}}>
      <h1>QC Ping</h1>
      <p><b>Title:</b> </p>
      <p><b>ID:</b> </p>
      <p><b>Description:</b> </p>
      <p>Rendered: {new Date().toLocaleString()}</p>
    </main>
  );
}