"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

// Realistic rotating Earth. Put a NASA Blue Marble / Visible Earth equirectangular map
// (2:1 ratio, for example 2048x1024) at public/earth.jpg. If the file is missing,
// a plain dark-blue sphere with the same shading is shown.
export default function EarthGlobe({ size = 330 }: { size?: number }) {
  const [ok, setOk] = useState(true);
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: size, height: size }} aria-hidden>
      {/* atmosphere */}
      <div className="absolute rounded-full" style={{ inset: -14, background: "radial-gradient(circle, transparent 60%, rgba(70,170,255,0.35) 68%, rgba(70,170,255,0.12) 78%, transparent 90%)", filter: "blur(3px)" }} />
      <div className="relative h-full w-full overflow-hidden rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #1d6fb8, #07203f 60%, #020814)", boxShadow: "0 0 70px 6px rgba(56,150,255,0.35)" }}>
        {ok && (
          <div
            className="earth-spin absolute inset-0"
            style={
              {
                backgroundImage: "url(/earth.jpg)",
                backgroundSize: "auto 100%",
                backgroundRepeat: "repeat-x",
                "--earth-w": `${size * 2}px`,
              } as CSSProperties
            }
          />
        )}
        {/* hidden probe so a missing texture falls back cleanly */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/earth.jpg" alt="" className="hidden" onError={() => setOk(false)} />
        {/* sphere shading: dark limb, soft terminator, specular highlight */}
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22), transparent 38%), radial-gradient(circle at 38% 34%, transparent 42%, rgba(0,6,20,0.55) 78%, rgba(0,3,12,0.95) 100%)" }} />
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 28px 4px rgba(120,190,255,0.45)" }} />
      </div>
    </div>
  );
}
