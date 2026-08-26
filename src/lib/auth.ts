import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";

/**
 * Autenticação do painel (Better Auth).
 *
 * - Login por e-mail e senha; cadastro público desativado: só um
 *   administrador cria contas, de dentro do painel.
 * - Papéis: "admin" (vê tudo e gerencia a equipe) e "user", exibido como
 *   coordenador (vê apenas os leads das regiões em `regioes`).
 * - "Desativar usuário" usa o banimento do plugin admin.
 */

/**
 * Papel no banco: "admin" ou "user". "user" é o coordenador de região
 * (nome interno do plugin admin; a interface mostra "Coordenador").
 */
export const PAPEL_PADRAO = "user";

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
  basePath: "/api/auth",

  emailAndPassword: {
    enabled: true,
    // O cadastro fica habilitado no núcleo para o servidor poder criar o
    // primeiro administrador; a rota pública /api/auth/sign-up/email é
    // bloqueada no handler (src/app/api/auth/[...all]/route.ts).
    disableSignUp: false,
    minPasswordLength: 8,
  },

  session: {
    expiresIn: 60 * 60 * 12, // 12 horas
    updateAge: 60 * 60, // renova a cada hora de uso
  },

  user: {
    additionalFields: {
      // Regiões que um coordenador enxerga (vazio para admin).
      regioes: {
        type: "string[]",
        required: false,
        defaultValue: [],
        input: true,
        returned: true,
      },
    },
  },

  plugins: [
    admin({
      adminRoles: ["admin"],
      defaultRole: PAPEL_PADRAO,
      bannedUserMessage:
        "Seu acesso ao painel foi desativado. Fale com o administrador.",
    }),
  ],

  advanced: {
    cookiePrefix: "ea-painel",
  },
});

export type Sessao = typeof auth.$Infer.Session;
