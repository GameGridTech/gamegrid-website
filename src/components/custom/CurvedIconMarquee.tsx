"use client";

// CurvedIconMarquee: animates a row of app icons along a curved SVG path
// Edit tips:
// - Default look/behavior: tweak default props (height, radius, arc, speed, gap, iconSize, inset, offsetY)
// - Images: pass `images` prop or edit fallback `srcs` list below
// - Responsiveness: adjust `responsive` rules (min/max and settings) to override defaults at widths
// - Animation speed: change `speed` (seconds per loop) or per-item animationDelay formula
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  height?: number;      // container height (px)
  radius?: number;      // circle radius; bigger => shallower arc
  arc?: number;         // degrees of the visible arc (e.g., 60–80 for a bump)
  speed?: number;       // seconds for one loop
  gap?: number;         // px between tiles
  iconSize?: number;    // square tile size
  inset?: number;       // how far the path extends OFF the left/right (px)
  images?: string[];
  offsetY?: number;     // additional vertical offset for the arc (px)
  responsive?: Array<{
    min?: number;       // apply when track width >= min
    max?: number;       // apply when track width <= max
    settings: Partial<Pick<Props, "height"|"radius"|"arc"|"gap"|"iconSize"|"inset"|"offsetY"|"speed">>;
  }>;
};

export default function CurvedIconMarquee({
  height = 260,
  radius = 620,
  arc = 70,
  speed = 18,
  gap = 24,
  iconSize = 112,
  inset = 160,
  images,
  offsetY = 0,
  responsive = [],
}: Props) {
  const srcs = useMemo(
    () =>
      images?.length
        ? images
        : [
            "/section-2/app icons/51WY7cDgvjAnHyR2Gry7geHI.jpeg",
            "/section-2/app icons/5Puoz9XAUZoBSsMbmbXezf25Jq4.jpeg",
            "/section-2/app icons/7BbAV4C8h7iIWKdLSFwGZQztTw.jpeg",
            "/section-2/app icons/DhUTkPGW0gWmz4hz5lZ62BS4rE.jpeg",
            "/section-2/app icons/gtsLstRnv2zT5fVEwk5S8RktX4.jpeg",
            "/section-2/app icons/isM3DqOZZApt7bs8i3Z8V5Z3ROM.jpeg",
            "/section-2/app icons/jiMI5CUeRrAvFO7t5rzT5d5Iik.jpeg",
            "/section-2/app icons/oiwJGY7LYutJACfrO9SQF7qV9fA.jpeg",
            "/section-2/app icons/orrHAM0af6flwN979ZOG6wbdzCg.jpeg",
            "/section-2/app icons/QyGuM43oh8i4yGjCDL85NbGpo.jpeg",
            "/section-2/app icons/rC3Z7rxzMGRUgpWihf84wS1oQ.jpeg",
            "/section-2/app icons/SgZaFtxBZPMGVb2SEKlO3fiU.jpeg",
            "/section-2/app icons/STxEugn312YToO1IrJrIuDll90.jpeg",
            "/section-2/app icons/ttxpecqovvTAroL5mzL2XhUPyu8.jpeg",
            "/section-2/app icons/YA0eUClyaLyH4aelMPsMzTCkPI.jpeg",
          ],
    [images]
  );

  // Measure track width: drives geometry/responsive overrides
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState<number>(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setTrackWidth(w);
      }
    });
    ro.observe(el);
    setTrackWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Compute effective settings from width + responsive rules
  const eff = useMemo(() => {
    const w = trackWidth || 0;
    const rule = responsive.find(r => {
      const minOk = r.min == null || w >= r.min;
      const maxOk = r.max == null || w <= r.max;
      return minOk && maxOk;
    });
    const s = rule?.settings || {};
    return {
      height: s.height ?? height,
      radius: s.radius ?? radius,
      arc: s.arc ?? arc,
      speed: s.speed ?? speed,
      gap: s.gap ?? gap,
      iconSize: s.iconSize ?? iconSize,
      inset: s.inset ?? inset,
      offsetY: s.offsetY ?? offsetY,
    };
  }, [trackWidth, responsive, height, radius, arc, speed, gap, iconSize, inset, offsetY]);

  // Build arc path string; clamps radius so icons stay within container height
  const pathData = useMemo(() => {
    const w = trackWidth || 1000;
    const cx = w / 2;
    const rEff = Math.min(eff.radius, Math.max(20, eff.height - eff.iconSize * 0.5 - 8));
    const cy = rEff + eff.iconSize * 0.5 + eff.offsetY; // push down so top tiles remain visible, plus extra offset

    const startDeg = 90 + eff.arc / 2;
    const endDeg = 90 - eff.arc / 2;

    const toXY = (deg: number) => {
      const rad = (deg * Math.PI) / 180;
      return { x: cx + eff.radius * Math.cos(rad), y: cy - eff.radius * Math.sin(rad) };
    };
    const p0 = toXY(startDeg);
    const p1 = toXY(endDeg);
    const laf = eff.arc > 180 ? 1 : 0;

    return {
      d: `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${rEff} ${rEff} 0 ${laf} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
      width: w,
    };
  }, [eff.arc, eff.radius, eff.height, eff.iconSize, eff.offsetY, trackWidth]);

  // Duplicate enough tiles to fully cover the path without gaps
  const tiles = useMemo(() => {
    const approxArcLen = (Math.PI * Math.min(eff.radius, Math.max(20, eff.height - eff.iconSize * 0.5 - 8)) * eff.arc) / 180;
    const perTile = eff.iconSize + eff.gap;
    const need = Math.max(srcs.length, Math.ceil(approxArcLen / perTile) + 3);
    const arr: string[] = [];
    for (let i = 0; i < need; i++) arr.push(srcs[i % srcs.length]);
    return arr;
  }, [srcs, eff.radius, eff.arc, eff.iconSize, eff.gap, eff.height]);

  return (
    <div
      className="relative"
      style={{
        height: eff.height,
        width: "100%",
        overflow: "hidden", // keep icons inside card
      }}
    >
      {/* Track wider than container: lets items enter/exit from the sides */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        ref={trackRef}
        style={{
          width: `calc(100% + ${eff.inset * 2}px)`,
          height: eff.height,
          pointerEvents: "none", // allow overlays above to capture pointer
        }}
      >
        <div
          className="relative"
          style={{
            width: "100%",
            height: "100%",
            // expose variables to CSS
            // @ts-expect-error -- CSS custom properties not typed in React
            "--marquee-speed": `${eff.speed}s`,
          }}
        >
          {tiles.map((src, i) => (
            <div
              key={`${i}-${src}`}
              className="curved-item"
              style={{
                animationDelay: `-${(i * (eff.speed / 10)).toFixed(3)}s`, // edit formula to stagger differently
              }}
            >
              <div
                className="tile"
                style={{
                  width: eff.iconSize,
                  height: eff.iconSize,
                  marginRight: eff.gap,
                }}
              >
                <Image
                  src={src}
                  alt="" // supply alt if needed for accessibility
                  fill
                  className="object-cover"
                  sizes={`${eff.iconSize}px`}
                />
              </div>
            </div>
          ))}

          {/* CSS: offset-path animation controlling curved movement */}
          <style>{`
            .curved-item {
              position: absolute;
              top: 0; left: 0;
              offset-path: path('${pathData.d}');
              animation: travel var(--marquee-speed) linear infinite;
              offset-rotate: 0deg; /* keep icons upright */
              transform: translate(0, -50%); /* vertically center tile on path */
              will-change: offset-distance;
            }

            @keyframes travel {
              from { offset-distance: 0%; }
              to   { offset-distance: 100%; }
            }

            .tile {
              position: relative;
              display: inline-flex;
              border-radius: 24px;          /* app-icon rounded square */
              overflow: hidden;
              box-shadow: 0 16px 36px rgba(0,0,0,0.35);
              transform: none;               /* no rotation */
              background: #111;
            }
            .tile:nth-child(2n) { transform: none; }
          `}</style>
        </div>
      </div>
    </div>
  );
}
