"use client";
import { useState } from "react";

export default function Confirm({
  onConfirm, onCancel, text="Are you sure?",
}: { onConfirm:()=>void; onCancel:()=>void; text?:string }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 w-[320px] space-y-3 shadow">
        <h3 className="font-semibold">Confirm</h3>
        <p className="text-sm text-gray-700">{text}</p>
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-1.5 rounded-lg border" onClick={onCancel}>Cancel</button>
          <button className="px-3 py-1.5 rounded-lg bg-black text-white" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}