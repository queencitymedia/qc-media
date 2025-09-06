import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  // This belongs at the top level in Next 15+
  outputFileTracingRoot: join(__dirname, "../../"),
};

export default nextConfig;
