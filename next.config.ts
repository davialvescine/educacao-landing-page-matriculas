import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deploy em container no Coolify — gera server.js autocontido.
  output: "standalone",
  // Otimização de imagem fica a cargo do cache da Cloudflare na frente da VPS.
  images: { unoptimized: true },
};

export default nextConfig;
