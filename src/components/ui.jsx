import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { POP_BG } from '../lib/pop.js';

export function PopButton({ color = 'tomato', className = '', children, ...props }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className={`press sticker flex min-h-[56px] items-center justify-center gap-2 rounded-2xl px-6 text-[17px] font-bold text-onpop disabled:cursor-not-allowed disabled:opacity-50 ${POP_BG[color]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({ className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`press sticker-sm flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-card px-5 font-bold text-ink ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`font-display text-[26px] leading-none text-ink ${className}`}>
      드디어<span className="text-tomato">!</span>
    </span>
  );
}

export function TopBar({ onBack, step, total = 3 }) {
  return (
    <div className="flex h-[72px] items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="press sticker-sm grid h-11 w-11 place-items-center rounded-full bg-card text-ink"
        >
          <ArrowLeft size={20} strokeWidth={2.8} />
        </button>
      ) : (
        <span className="w-11" />
      )}
      {step ? (
        <div className="flex items-center gap-1.5" aria-label={`${total}단계 중 ${step}단계`}>
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-3 rounded-full border-2 border-line transition-all ${i < step ? 'w-8 bg-tomato' : 'w-3 bg-card'}`}
            />
          ))}
        </div>
      ) : (
        <Wordmark />
      )}
      <span className="w-11" />
    </div>
  );
}

export function MatchBadge({ value, size = 'lg', className = '' }) {
  const big = size === 'lg';
  return (
    <div
      className={`sticker-sm grid shrink-0 place-items-center rounded-full bg-card text-ink ${big ? 'h-[84px] w-[84px]' : 'h-[66px] w-[66px]'} ${className}`}
    >
      <div className="text-center leading-none">
        <span className={`font-display tabular-nums ${big ? 'text-[26px]' : 'text-[20px]'}`}>{value}%</span>
        <span className="mt-1 block text-[10px] font-bold tracking-wide">입맛 궁합</span>
      </div>
    </div>
  );
}

export function Pill({ icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-card px-3 py-1 text-[13px] font-bold text-ink ${className}`}>
      {Icon && <Icon size={14} strokeWidth={2.6} />}
      {children}
    </span>
  );
}

export function OptionChip({ selected, color, onClick, children, className = '' }) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      animate={{ rotate: selected ? -2 : 0, scale: selected ? 1.02 : 1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 520, damping: 16 }}
      className={`press flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-3 py-2.5 text-center font-bold ${selected ? `sticker ${POP_BG[color]} text-onpop` : 'sticker-sm bg-card text-ink'} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function SectionTitle({ icon: Icon, color = 'mango', children }) {
  return (
    <h2 className="flex items-center gap-2.5 font-display text-[22px] leading-tight text-ink">
      <span className={`sticker-sm grid h-9 w-9 shrink-0 place-items-center rounded-xl text-onpop ${POP_BG[color]}`}>
        <Icon size={18} strokeWidth={2.6} />
      </span>
      {children}
    </h2>
  );
}
