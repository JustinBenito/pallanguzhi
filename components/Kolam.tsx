/**
 * Traditional South Indian Kolam patterns for decoration
 */

interface KolamProps {
  className?: string;
  side?: "left" | "right";
}

export const Kolam = ({ className = "", side = "left" }: KolamProps) => {
  const transform = side === "right" ? "scale(-1, 1)" : "";

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={{ transform }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer square pattern */}
      <rect
        x="20"
        y="20"
        width="80"
        height="80"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />

      {/* Inner diamond */}
      <path
        d="M 60 30 L 90 60 L 60 90 L 30 60 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />

      {/* Center circle */}
      <circle
        cx="60"
        cy="60"
        r="15"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />

      {/* Dots at corners */}
      <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="100" cy="20" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="20" cy="100" r="2" fill="currentColor" opacity="0.4" />
      <circle cx="100" cy="100" r="2" fill="currentColor" opacity="0.4" />

      {/* Connecting curves */}
      <path
        d="M 40 20 Q 30 30 20 40"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M 80 20 Q 90 30 100 40"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M 40 100 Q 30 90 20 80"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M 80 100 Q 90 90 100 80"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Inner decorative elements */}
      <circle cx="60" cy="40" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="60" cy="80" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="40" cy="60" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="80" cy="60" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
};

export const KolamPattern2 = ({ className = "", side = "left" }: KolamProps) => {
  const transform = side === "right" ? "scale(-1, 1)" : "";

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={{ transform }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lotus-like pattern */}
      <circle
        cx="60"
        cy="60"
        r="30"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.4"
      />

      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 60 + Math.cos(rad) * 30;
        const y = 60 + Math.sin(rad) * 30;
        const outerX = 60 + Math.cos(rad) * 45;
        const outerY = 60 + Math.sin(rad) * 45;

        return (
          <path
            key={i}
            d={`M ${x} ${y} Q ${outerX} ${outerY} ${
              60 + Math.cos(rad + 0.4) * 30
            } ${60 + Math.sin(rad + 0.4) * 30}`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
        );
      })}

      {/* Center decoration */}
      <circle cx="60" cy="60" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="60" cy="60" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
};
