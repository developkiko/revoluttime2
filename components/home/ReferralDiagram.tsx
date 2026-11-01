import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

const NODES = [
  { key: "you", cx: 200, cy: 60, r: 36, delay: 0 },
  { key: "referral1", cx: 340, cy: 180, r: 30, delay: 0.5 },
  { key: "referral2", cx: 280, cy: 320, r: 30, delay: 1 },
  { key: "referral3", cx: 120, cy: 320, r: 30, delay: 1.5 },
  { key: "referral4", cx: 60, cy: 180, r: 30, delay: 2 },
] as const;

const PENTAGON_EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
];

/**
 * Five-node referral diagram carried over from revoluttimenew ("Почему
 * выбирают нас" block): pentagon of animated dashed lines with "you" in the
 * middle of the top edge and four referral nodes.
 */
export async function ReferralDiagram() {
  const t = await getTranslations("home.diagram");

  return (
    <div className="rt-diagram-wrapper">
      <div aria-hidden className="rt-diagram-bg" />
      <svg viewBox="0 0 400 400" className="rt-diagram" role="img">
        <defs>
          <filter id="rt-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {PENTAGON_EDGES.map(([from, to], index) => (
          <line
            key={index}
            x1={NODES[from].cx}
            y1={NODES[from].cy}
            x2={NODES[to].cx}
            y2={NODES[to].cy}
            className="rt-diagram-line"
            style={{ animationDelay: `${index * 0.3}s` }}
          />
        ))}

        {NODES.map((node) => (
          <Link key={node.key} href="/partner" className="cursor-pointer">
            <g
              className="rt-diagram-node"
              style={{ animationDelay: `${node.delay}s` }}
            >
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                className="rt-node-circle"
                filter="url(#rt-glow)"
              />
              <text
                x={node.cx}
                y={node.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="rt-node-text"
              >
                {t(node.key)}
              </text>
            </g>
          </Link>
        ))}
      </svg>
    </div>
  );
}
