import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Educação Adventista Centro-Oeste | Matrículas Abertas",
    template: "%s | Educação Adventista Centro-Oeste",
  },
  description:
    "Matrículas abertas na Rede de Educação Adventista no Centro-Oeste: DF, Goiás, Mato Grosso, Mato Grosso do Sul e Tocantins. Encontre uma escola perto de você.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={cn("h-full antialiased font-sans", jakarta.variable)}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
