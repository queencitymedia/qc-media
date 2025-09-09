import { headers } from "next/headers";

/** Compute an absolute origin for server-side fetches (Next 15: await headers() is async). */
export async function getBaseUrl() {
  const hdrs = await await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? `localhost:${process.env.PORT ?? "3000"}`;
  const proto = (process.env.VERCEL || process.env.NODE_ENV === "production") ? "https" : "http";
  return `${proto}://${host}`;
}