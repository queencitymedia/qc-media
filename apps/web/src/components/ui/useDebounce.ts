"use client";
import { useEffect, useState } from "react";
export default function useDebounce<T>(value:T, delay=350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}