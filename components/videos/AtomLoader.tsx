/** Атом H₂ — брендированный SVG-лоадер (Фаза B, владелец: «атом-лоадер»).
 *  Чистый SVG с нативной SMIL-анимацией (animateMotion): никаких CSS-
 *  keyframes в globals.css и зависимостей — можно использовать в любом
 *  месте (страницы видео/стримов, загрузчик, спиннеры). Цвета тянутся
 *  из дизайн-токенов (--primary), поэтому работают в обеих темах.
 */

interface AtomLoaderProps {
  /** Размер квадрата в px (по умолчанию 120). */
  size?: number;
  className?: string;
  /** Скорость оборота электрона в секундах. */
  spinSeconds?: number;
}

export function AtomLoader({ size = 120, className, spinSeconds = 2.4 }: AtomLoaderProps) {
  // Полуоси орбит и радиус электрона; эллипсы наклонены ±60°.
  const rx = 52;
  const ry = 18;
  // Путь эллипса для animateMotion: из правой точки эллипса вокруг центра.
  const orbitPath = `M ${120 - rx} 60 a ${rx} ${ry} 0 1 1 ${rx * 2} 0 a ${rx} ${ry} 0 1 1 ${-rx * 2} 0`;
  const spin = `${spinSeconds}s`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="H₂"
      className={className}
    >
      <defs>
        <radialGradient id="atom-h2-core" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
          <stop offset="70%" stopColor="var(--primary)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {/* Свечение вокруг ядра */}
      <circle cx="60" cy="60" r="26" fill="var(--primary)" opacity="0.12" />

      {/* Две наклонные орбиты */}
      <g transform="rotate(60 60 60)">
        <ellipse cx="60" cy="60" rx={rx} ry={ry} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
        <g>
          <circle r="5" fill="var(--primary)">
            <animateMotion dur={spin} repeatCount="indefinite" path={orbitPath} />
          </circle>
        </g>
      </g>
      <g transform="rotate(-60 60 60)">
        <ellipse cx="60" cy="60" rx={rx} ry={ry} fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
        <circle r="5" fill="var(--primary)" opacity="0.85">
          <animateMotion dur={spin} begin={`-${spinSeconds / 2}s`} repeatCount="indefinite" path={orbitPath} />
        </circle>
      </g>

      {/* Ядро с H₂ */}
      <circle cx="60" cy="60" r="17" fill="url(#atom-h2-core)" />
      <text
        x="60"
        y="61"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="700"
        fill="#ffffff"
      >
        H₂
      </text>
    </svg>
  );
}
