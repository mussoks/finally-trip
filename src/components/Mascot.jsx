import { motion } from 'framer-motion';

/**
 * 넥타이 풀어헤친 캐리어, '짐이'.
 * mood: happy | wow | sleepy | love
 */
export default function Mascot({ mood = 'happy', size = 140, bob = true, body = 'var(--mango)', className = '' }) {
  const line = 'var(--line)';
  return (
    <motion.svg
      viewBox="0 0 120 132"
      width={size}
      height={size * 1.1}
      role="img"
      aria-label="넥타이 풀린 캐리어 캐릭터"
      className={className}
      animate={bob ? { y: [0, -6, 0], rotate: [0, -2, 0, 2, 0] } : undefined}
      transition={bob ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* 바퀴 */}
      <circle cx="34" cy="118" r="8" fill={line} />
      <circle cx="86" cy="118" r="8" fill={line} />
      {/* 손잡이 */}
      <rect x="42" y="4" width="36" height="24" rx="10" fill="none" stroke={line} strokeWidth="6" />
      {/* 몸통 */}
      <rect x="12" y="20" width="96" height="92" rx="24" fill={body} stroke={line} strokeWidth="4" />
      {/* 여행 스티커 */}
      <circle cx="91" cy="38" r="9" fill="var(--sky)" stroke={line} strokeWidth="3" />
      <circle cx="91" cy="38" r="3.2" fill="var(--card)" />
      <rect x="18" y="92" width="18" height="12" rx="4" fill="var(--mint)" stroke={line} strokeWidth="2.5" transform="rotate(-12 27 98)" />

      {/* 볼터치 */}
      <ellipse cx="32" cy="72" rx="7" ry="4.5" fill="var(--bubble)" opacity="0.9" />
      <ellipse cx="88" cy="72" rx="7" ry="4.5" fill="var(--bubble)" opacity="0.9" />

      {/* 눈 */}
      {mood === 'sleepy' ? (
        <g fill="none" stroke={line} strokeWidth="4" strokeLinecap="round">
          <path d="M37 60 Q44 65 51 60" />
          <path d="M69 60 Q76 65 83 60" />
        </g>
      ) : mood === 'love' ? (
        <g fill="var(--tomato)" stroke={line} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M44 66 C35 59 37 51 44 55 C51 51 53 59 44 66 Z" />
          <path d="M76 66 C67 59 69 51 76 55 C83 51 85 59 76 66 Z" />
        </g>
      ) : (
        <g>
          <ellipse cx="44" cy="58" rx={mood === 'wow' ? 6.5 : 5.5} ry={mood === 'wow' ? 8.5 : 7.5} fill={line} />
          <ellipse cx="76" cy="58" rx={mood === 'wow' ? 6.5 : 5.5} ry={mood === 'wow' ? 8.5 : 7.5} fill={line} />
          <circle cx="46" cy="55" r="1.9" fill="#ffffff" />
          <circle cx="78" cy="55" r="1.9" fill="#ffffff" />
        </g>
      )}

      {/* 입 */}
      {mood === 'wow' ? (
        <ellipse cx="60" cy="78" rx="6" ry="7.5" fill={line} />
      ) : mood === 'sleepy' ? (
        <path d="M53 77 Q60 81 67 77" fill="none" stroke={line} strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M49 73 Q60 90 71 73 Z" fill={line} stroke={line} strokeWidth="2" strokeLinejoin="round" />
      )}

      {/* 풀어헤친 넥타이 */}
      <g transform="rotate(16 60 90)">
        <path d="M54 87 H66 L63 94 H57 Z" fill="var(--grape)" stroke={line} strokeWidth="3" strokeLinejoin="round" />
        <path d="M57 94 H63 L67 111 L60 119 L53 111 Z" fill="var(--grape)" stroke={line} strokeWidth="3" strokeLinejoin="round" />
      </g>

      {mood === 'sleepy' && (
        <text x="100" y="18" fontFamily="var(--font-display)" fontSize="16" fill="var(--text)">
          z
        </text>
      )}
    </motion.svg>
  );
}
