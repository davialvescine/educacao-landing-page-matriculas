import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Só lógica pura: as regras que decidem para qual associação o lead vai,
 * qual WhatsApp cada unidade mostra e qual cidade a página anuncia.
 *
 * Sem jsdom e sem testing-library de propósito — não há teste de componente
 * aqui, e dependência que ninguém usa é peso morto no projeto.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
