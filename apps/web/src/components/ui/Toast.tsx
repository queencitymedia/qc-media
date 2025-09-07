"use client";
import { useEffect, useState } from "react";

export default function Toast({ msg, onDone, ms=2200 }:{ msg:string; onDone?:()=>void; ms?:number }) {
  const [show,setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setShow(false); onDone?.(); }, ms);
    return () => clearTimeout(t);
  }, [ms, onDone]);
  if (!show) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-xl shadow-lg text-sm">
      {msg}
    </div>
  );
}