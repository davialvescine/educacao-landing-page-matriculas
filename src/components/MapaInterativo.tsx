"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { PinMapa } from "@/components/Mapa3D";

const Mapa3D = dynamic(() => import("@/components/Mapa3D"), { ssr: false });

/** Desktop com motion habilitado ganha o mapa 3D; o resto fica com o SVG leve. */
export default function MapaInterativo({
  pins,
  fallback,
}: {
  pins: PinMapa[];
  fallback: React.ReactNode;
}) {
  const [modo3d, setModo3d] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    const semMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setModo3d(desktop && !semMotion);
  }, []);

  return modo3d ? <Mapa3D pins={pins} /> : <>{fallback}</>;
}
