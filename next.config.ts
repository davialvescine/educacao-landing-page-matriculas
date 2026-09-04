import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deploy em container no Coolify — gera server.js autocontido.
  output: "standalone",
  // Otimização de imagem fica a cargo do cache da Cloudflare na frente da VPS.
  images: { unoptimized: true },

  // O Mato Grosso virou uma página só. As rotas das duas associações já
  // podem estar indexadas ou circulando em link, então apontam para lá em
  // 301 — inclusive as páginas de unidade, que mudaram de prefixo.
  async redirects() {
    return [
      { source: "/leste-mt", destination: "/mato-grosso", permanent: true },
      { source: "/oeste-mt", destination: "/mato-grosso", permanent: true },
      {
        source: "/leste-mt/:escola",
        destination: "/mato-grosso/:escola",
        permanent: true,
      },
      {
        source: "/oeste-mt/:escola",
        destination: "/mato-grosso/:escola",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
