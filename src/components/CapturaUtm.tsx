"use client";

import { useEffect } from "react";
import { capturarUtm } from "@/lib/campanha-client";

/** Captura utm_source/medium/campaign (e gclid/fbclid) na chegada. */
export default function CapturaUtm() {
  useEffect(() => {
    capturarUtm();
  }, []);
  return null;
}
