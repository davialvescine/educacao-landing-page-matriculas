"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { MAPA_PATHS } from "@/data/mapa-paths";

export interface PinMapa {
  slug: string;
  rotulo: string;
  contagem: number;
  x: number;
  y: number;
}

/* Espaço do SVG oficial: viewBox 1735×2048. */
const CX = 867.5;
const CY = 1024;
const ESCALA = 0.0016;
const PROFUNDIDADE = 80;

const CLICAVEIS: Record<string, string> = {
  to: "tocantins",
  go: "goias",
  df: "distrito-federal",
  ms: "mato-grosso-do-sul",
};

function useGeometrias() {
  return useMemo(() => {
    const geoms: Record<string, THREE.ExtrudeGeometry[]> = {};
    for (const [chave, ds] of Object.entries(MAPA_PATHS)) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg">${ds
        .map((d) => `<path d="${d}"/>`)
        .join("")}</svg>`;
      const parsed = new SVGLoader().parse(svg);
      geoms[chave] = parsed.paths.flatMap((p) =>
        SVGLoader.createShapes(p).map(
          (forma) =>
            new THREE.ExtrudeGeometry(forma, {
              depth: PROFUNDIDADE,
              bevelEnabled: true,
              bevelThickness: 10,
              bevelSize: 8,
              bevelSegments: 2,
            }),
        ),
      );
    }
    return geoms;
  }, []);
}

function Estado({
  chave,
  geometrias,
  onNavegar,
}: {
  chave: string;
  geometrias: THREE.ExtrudeGeometry[];
  onNavegar?: () => void;
}) {
  const grupo = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  const clicavel = Boolean(onNavegar);

  const [matTopo, matLado] = useMemo(() => {
    const topo = new THREE.MeshStandardMaterial({
      color: "#f2b541",
      metalness: 0.12,
      roughness: 0.5,
    });
    const lado = new THREE.MeshStandardMaterial({
      color: "#8a6114",
      metalness: 0.2,
      roughness: 0.65,
    });
    return [topo, lado];
  }, []);

  useEffect(() => {
    matTopo.color.set(hover ? "#f9dd6b" : "#f2b541");
    document.body.style.cursor = hover && clicavel ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover, clicavel, matTopo]);

  useFrame((_, delta) => {
    if (!grupo.current) return;
    const alvo = hover && clicavel ? 55 : 0;
    grupo.current.position.z = THREE.MathUtils.damp(
      grupo.current.position.z,
      alvo,
      6,
      delta,
    );
  });

  return (
    <group
      ref={grupo}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onNavegar?.();
      }}
    >
      {geometrias.map((g, i) => (
        <mesh key={i} geometry={g} material={[matTopo, matLado]} />
      ))}
    </group>
  );
}

function Cena({ pins }: { pins: PinMapa[] }) {
  const router = useRouter();
  const geoms = useGeometrias();
  const externo = useRef<THREE.Group>(null);
  const entrada = useRef(0);

  useFrame((state, delta) => {
    if (!externo.current) return;
    entrada.current = Math.min(entrada.current + delta, 1.4);
    const t = THREE.MathUtils.smoothstep(entrada.current / 1.4, 0, 1);
    const alvoY = THREE.MathUtils.lerp(-0.5, 0.14, t);
    const p = state.pointer;
    externo.current.rotation.x = THREE.MathUtils.damp(
      externo.current.rotation.x,
      -0.42 + p.y * 0.1,
      4,
      delta,
    );
    externo.current.rotation.y = THREE.MathUtils.damp(
      externo.current.rotation.y,
      p.x * 0.22,
      4,
      delta,
    );
    externo.current.position.y = THREE.MathUtils.damp(
      externo.current.position.y,
      alvoY + Math.sin(state.clock.elapsedTime * 0.6) * 0.03,
      4,
      delta,
    );
  });

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[2.5, 3, 4]} intensity={1.7} color="#fff3d6" />
      <pointLight position={[-3, -2, 2.5]} intensity={0.7} color="#5372ec" />
      <group ref={externo} scale={[ESCALA, -ESCALA, ESCALA]} rotation={[-0.42, 0, 0]}>
        <group position={[-CX, -CY, 0]}>
          {Object.keys(MAPA_PATHS).map((chave) => (
            <Estado
              key={chave}
              chave={chave}
              geometrias={geoms[chave]}
              onNavegar={
                CLICAVEIS[chave]
                  ? () => router.push(`/${CLICAVEIS[chave]}`)
                  : undefined
              }
            />
          ))}
          {pins.map((pin) => (
            <Html
              key={pin.slug}
              position={[pin.x, pin.y, PROFUNDIDADE + 40]}
              center
              zIndexRange={[30, 0]}
            >
              <a
                href={`/${pin.slug}`}
                className="group flex -translate-y-1 flex-col items-center gap-1 whitespace-nowrap"
                aria-label={`${pin.rotulo}, ${pin.contagem} unidades`}
              >
                <span className="block h-3.5 w-3.5 rounded-full border-[3px] border-brand-950 bg-gold-400 shadow-[0_0_14px_rgba(248,192,56,0.9)] transition-transform group-hover:scale-125" />
                <span className="rounded-full border border-gold-400/50 bg-brand-950/95 px-3 py-1 text-[11px] font-extrabold text-white shadow-lg transition-colors group-hover:border-gold-400">
                  {pin.rotulo} · {pin.contagem}
                </span>
              </a>
            </Html>
          ))}
        </group>
      </group>
    </>
  );
}

/** Mapa oficial extrudado em 3D real: luz, bevel, tilt com o mouse,
 *  estados que levantam no hover e navegação por clique. */
export default function Mapa3D({ pins }: { pins: PinMapa[] }) {
  return (
    <div className="mx-auto h-[600px] w-full max-w-[760px] xl:h-[660px]">
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Cena pins={pins} />
      </Canvas>
    </div>
  );
}
