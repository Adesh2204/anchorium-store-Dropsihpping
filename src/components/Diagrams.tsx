import { DIM } from "@/lib/lamp-geometry";

/**
 * Technical line drawings of the lamp, drawn from the same dimension constants as
 * the 3D model — so the diagram and the geometry can never disagree.
 * Used for the "dimensions" and "rear / charging port" gallery frames, where the
 * supplier listing gives us numbers but not photographs.
 */

const S = 3.1; // mm -> svg units

export function DimensionsDiagram({ className = "" }: { className?: string }) {
  const w = DIM.baseW * S;
  const h = DIM.coverTopY * S;
  const baseH = DIM.baseH * S;
  const coverW = DIM.coverRTop * 2 * S;
  const pad = 62;
  const vbW = w + pad * 2 + 96;
  const vbH = h + pad * 2 + 60;

  const x = pad + 60;
  const y = pad;
  const cx = x + w / 2;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className={className} role="img" aria-label="AuraGlow technical drawing: 70 mm wide, 145 mm tall, 66 mm cover diameter, 48 mm base">
      <rect x="0" y="0" width={vbW} height={vbH} fill="#FFF9ED" />
      <g stroke="#171510" strokeWidth="1.5" fill="none">
        {/* base with soft corners */}
        <rect x={x} y={y + h - baseH} width={w} height={baseH} rx={DIM.baseCorner * S} />
        {/* cover */}
        <rect x={cx - coverW / 2} y={y} width={coverW} height={h - baseH + 8} rx={7} />
        <line x1={cx - coverW / 2} y1={y + h - baseH} x2={cx + coverW / 2} y2={y + h - baseH} strokeDasharray="4 4" opacity=".45" />
        {/* filament */}
        <path
          d={`M${cx} ${y + 12} C ${cx + 34} ${y + 70}, ${cx + 22} ${y + h - baseH - 70}, ${cx} ${y + h - baseH - 52} C ${cx - 22} ${y + h - baseH - 70}, ${cx - 34} ${y + 70}, ${cx} ${y + 12}`}
          stroke="#D6A441"
          strokeWidth="2"
        />
        <circle cx={cx} cy={y + h - baseH - 52} r="5" fill="#D6A441" stroke="none" />
        {/* touch control */}
        <circle cx={cx} cy={y + h - baseH / 2} r={DIM.buttonR * S} stroke="#171510" opacity=".8" />
      </g>

      {/* dimension lines */}
      <g stroke="#B9862A" strokeWidth="1" fill="none">
        <line x1={x + w + 34} y1={y} x2={x + w + 34} y2={y + h} />
        <path d={`M${x + w + 29} ${y + 6} l5 -6 l5 6M${x + w + 29} ${y + h - 6} l5 6 l5 -6`} />
        <line x1={x} y1={y + h + 34} x2={x + w} y2={y + h + 34} />
        <path d={`M${x + 6} ${y + h + 29} l-6 5 l6 5M${x + w - 6} ${y + h + 29} l6 5 l-6 5`} />
        <line x1={cx - coverW / 2} y1={y - 26} x2={cx + coverW / 2} y2={y - 26} />
      </g>
      <g fill="#171510" fontFamily="ui-sans-serif, system-ui" fontSize="15" letterSpacing="1.4">
        <text x={x + w + 46} y={y + h / 2 - 4}>145 mm</text>
        <text x={x + w / 2 - 26} y={y + h + 58}>70 mm</text>
        <text x={cx - 30} y={y - 34}>Ø 66 mm</text>
        <text x={x + w + 46} y={y + h / 2 + 16} fontSize="12" fill="#6b6152">48 mm base</text>
      </g>
      <text x={pad} y={vbH - 14} fontSize="11" fill="#8a7f6c" letterSpacing="2.2" fontFamily="ui-sans-serif, system-ui">
        FRONT ELEVATION · DRAWN FROM THE LISTED 70 × 70 × 145 MM ENVELOPE
      </text>
    </svg>
  );
}

export function PortDiagram({ className = "" }: { className?: string }) {
  const w = DIM.baseW * S;
  const baseH = 44 * S * 0.62;
  const pad = 70;
  const vbW = w + pad * 2 + 150;
  const vbH = baseH + pad * 2 + 70;
  const x = pad;
  const y = pad;
  const cx = x + w / 2;
  const portW = DIM.portW * S;
  const portH = DIM.portH * S;
  const py = y + baseH - DIM.portY * S * 0.62 - portH / 2;

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className={className} role="img" aria-label="Rear view diagram showing the USB Type-C inlet recess centred on the rear face of the base">
      <rect width={vbW} height={vbH} fill="#171510" />
      <g stroke="#F4E4B8" strokeWidth="1.5" fill="none">
        <rect x={x} y={y} width={w} height={baseH} rx={DIM.baseCorner * S * 0.7} />
        <rect x={cx - DIM.coverRTop * S} y={y - 12} width={DIM.coverRTop * 2 * S} height={16} rx={6} opacity=".5" />
        <rect x={cx - portW / 2} y={py} width={portW} height={portH} rx={portH / 2} fill="#0e0d0b" stroke="#D6A441" />
      </g>
      <g stroke="#D6A441" strokeWidth="1" fill="none">
        <path d={`M${cx + portW / 2 + 8} ${py + portH / 2} H${x + w + 60}`} />
        <circle cx={x + w + 64} cy={py + portH / 2} r="3" fill="#D6A441" stroke="none" />
      </g>
      <g fontFamily="ui-sans-serif, system-ui" fill="#F4E4B8">
        <text x={x + w + 76} y={py + portH / 2 - 6} fontSize="14" letterSpacing="1">
          USB Type-C inlet
        </text>
        <text x={x + w + 76} y={py + portH / 2 + 12} fontSize="11.5" fill="#b7ab92">
          Listed as the charging interface.
        </text>
        <text x={x + w + 76} y={py + portH / 2 + 28} fontSize="11.5" fill="#b7ab92">
          Recess position to be confirmed
        </text>
        <text x={x + w + 76} y={py + portH / 2 + 44} fontSize="11.5" fill="#b7ab92">
          against the physical unit.
        </text>
      </g>
      <text x={pad} y={vbH - 22} fontSize="11" fill="#8a7f6c" letterSpacing="2.2" fontFamily="ui-sans-serif, system-ui">
        REAR ELEVATION · BASE ONLY · NOT A PHOTOGRAPH
      </text>
    </svg>
  );
}
