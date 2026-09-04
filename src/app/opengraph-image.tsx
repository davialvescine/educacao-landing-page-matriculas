import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getRegioesSite } from "@/lib/rede";

/**
 * Arte de compartilhamento da campanha (1200 × 630).
 * É a imagem que aparece quando alguém cola o link do site no WhatsApp,
 * no Instagram ou no Facebook. Todas as rotas herdam esta arte, então o
 * card sai igual em qualquer página compartilhada.
 *
 * Gerada no build: nada aqui depende da requisição.
 */

export const alt =
  "Educação Adventista Centro-Oeste: matrículas abertas para 2027";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const publico = (...caminho: string[]) => join(process.cwd(), "public", ...caminho);

// Lidos uma vez, no escopo do módulo: não dependem da requisição.
const [fonteMedia, fonteBold, selo130] = await Promise.all([
  readFile(publico("fontes", "plus-jakarta-sans-500.ttf")),
  readFile(publico("fontes", "plus-jakarta-sans-800.ttf")),
  readFile(publico("imagens", "campanha", "selo-130-anos.png")),
]);

const png = (dados: Buffer) => `data:image/png;base64,${dados.toString("base64")}`;

const NAVY = "#050c42";
const OURO = "#f8c038";
const OURO_CLARO = "#f8e068";

export default function Image() {
  const totalEscolas = getRegioesSite().reduce((n, e) => n + e.escolas.length, 0);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: NAVY,
          fontFamily: "Jakarta",
          position: "relative",
        }}
      >
        {/* Brilho dourado no canto, como no hero da campanha */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 780,
            height: 780,
            borderRadius: 780,
            backgroundImage:
              "radial-gradient(circle, rgba(248,192,56,0.30) 0%, rgba(248,192,56,0) 68%)",
          }}
        />

        {/* Tarja da campanha */}
        <div
          style={{
            width: "100%",
            height: 14,
            backgroundImage: `linear-gradient(90deg, ${OURO_CLARO} 0%, ${OURO} 55%, #f8a010 100%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "56px 68px 52px",
          }}
        >
          {/* Topo: selo de matrículas + selo dos 130 anos */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                backgroundColor: OURO,
                color: NAVY,
                fontSize: 25,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                padding: "13px 30px",
                borderRadius: 999,
              }}
            >
              Matrículas abertas 2027
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={png(selo130)} alt="" width={228} height={74} />
          </div>

          {/* Chamada */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 76,
                fontWeight: 800,
                letterSpacing: -2.6,
                lineHeight: 1.04,
                color: "#ffffff",
              }}
            >
              <span>Educando gerações</span>
              <span style={{ color: OURO_CLARO }}>com valores pra vida</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 27,
                fontWeight: 500,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.76)",
                maxWidth: 880,
              }}
            >
              {totalEscolas} escolas cristãs no DF, Goiás, Mato Grosso, Mato
              Grosso do Sul e Tocantins — da Educação Infantil ao Ensino Médio.
            </div>
          </div>

          {/* Rodapé: endereço do site + assinatura da campanha */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "2px solid rgba(255,255,255,0.14)",
              paddingTop: 26,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 25,
                fontWeight: 800,
                letterSpacing: -0.3,
                color: OURO,
              }}
            >
              educaadventistacentrooeste.com.br
            </div>
            {/* A arte da assinatura é navy e sumiria no fundo: vai como texto. */}
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: -0.3,
                color: "rgba(255,255,255,0.62)",
              }}
            >
              #MuitoAlémdoEnsino
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Jakarta", data: fonteMedia, style: "normal", weight: 500 },
        { name: "Jakarta", data: fonteBold, style: "normal", weight: 800 },
      ],
    },
  );
}
