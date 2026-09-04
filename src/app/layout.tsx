import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import CapturaUtm from "@/components/CapturaUtm";
import MetaPixel from "@/components/MetaPixel";
import { GA_ID, META_PIXEL_ID, SITE_NOME, SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NOME} | Matrículas Abertas 2027`,
    template: `%s | ${SITE_NOME}`,
  },
  description:
    "Matrículas abertas 2027 na Rede de Educação Adventista do Centro-Oeste: 39 escolas particulares cristãs no DF, Goiás, Mato Grosso, Mato Grosso do Sul e Tocantins, da Educação Infantil ao Ensino Médio. Encontre a escola mais perto de você.",
  keywords: [
    "escola particular",
    "colégio adventista",
    "escola adventista",
    "matrícula 2027",
    "escola cristã",
    "educação infantil",
    "ensino fundamental",
    "ensino médio",
    "Brasília",
    "Goiânia",
    "Campo Grande",
    "Cuiabá",
    "Palmas",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NOME,
    title: `${SITE_NOME} | Matrículas Abertas 2027`,
    description:
      "39 escolas particulares cristãs no Centro-Oeste, da Educação Infantil ao Ensino Médio. 130 anos educando gerações com valores pra vida.",
    // A imagem vem de src/app/opengraph-image.tsx, herdada por todas as rotas.
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={cn("h-full antialiased font-sans", jakarta.variable)}>
      {/* Marca "há JS" antes da primeira pintura, para o CSS poder esconder
          o que a revelação por rolagem vai mostrar. Sem JS a classe não
          existe e tudo aparece. Inline e minúsculo de propósito: se fosse
          um módulo, a página pintaria antes dele rodar. */}
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <CapturaUtm />
        {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
        {META_PIXEL_ID ? <MetaPixel pixelId={META_PIXEL_ID} /> : null}
      </body>
    </html>
  );
}
