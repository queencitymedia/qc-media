import React from 'react';
import Link from 'next/link';

export default function QcPingsIndex(){
  const items = [    { slug: 'qc-plan-install-ping-id-qrhqozgf', title: 'QC Plan Install Ping', id: 'id-qrhqozgf' },
    { slug: 'qc-plan-install-ping-id-wik36p0k', title: 'QC Plan Install Ping', id: 'id-wik36p0k' },
    { slug: 'qc-blocks-feed-ping-id-zgbirg74', title: 'QC Blocks Feed Ping', id: 'id-zgbirg74' },
    { slug: 'qc-span-feed-ping-id-z4517f2j', title: 'QC Span Feed Ping', id: 'id-z4517f2j' },
    { slug: 'qc-blocks-30-49-ping-id-1lfk5txg', title: 'QC Blocks 30-49 Ping', id: 'id-1lfk5txg' },
  ];
  return (
    <main style={{padding:'2rem',fontFamily:'system-ui,Segoe UI,Roboto'}}>
      <h1>QC Pings</h1>
      <ul>
        {items.map(x => (
          <li key={x.slug} style={{margin:'0.5rem 0'}}>
            <Link href={/qc-pings/}>{x.title} — <code>{x.id}</code></Link>
          </li>
        ))}
      </ul>
    </main>
  );
}