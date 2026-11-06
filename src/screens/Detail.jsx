import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Binoculars,
  CalendarDays,
  Expand,
  Footprints,
  Lightbulb,
  MessagesSquare,
  Shuffle,
  Sparkles,
  Store,
  Sun,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { MatchBadge, Pill, PopButton, SectionTitle, TopBar } from '../components/ui.jsx';
import { TAG_LABELS } from '../data/foods.js';
import { DEST_STAMINA_LABEL } from '../data/prefs.js';
import { buildItinerary, itineraryNote } from '../lib/itinerary.js';
import { travelShort } from '../lib/match.js';
import { KIND_BG, POP_BG } from '../lib/pop.js';
import { travelIcon } from './Results.jsx';

function ItemList({ items }) {
  return (
    <ul className="sticker overflow-hidden rounded-[24px] bg-card text-ink">
      {items.map((it, i) => (
        <li key={it.title} className={`px-4 py-3.5 ${i > 0 ? 'border-t-2 border-dashed border-rule' : ''}`}>
          <p className="font-bold">{it.title}</p>
          <p className="text-[14px] text-soft">{it.note}</p>
        </li>
      ))}
    </ul>
  );
}

function OrderCard({ phrase, lang, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${lang} 주문 카드`}
      className="fixed inset-0 z-50 flex flex-col bg-mango text-onpop"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        paddingLeft: 'max(20px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      <div className="mx-auto flex w-full max-w-[560px] items-center justify-between gap-3">
        <span className="sticker-sm rounded-xl bg-card px-3 py-1.5 text-[14px] font-bold text-ink">점원에게 이 화면을 보여주세요</span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="press sticker-sm grid h-11 w-11 place-items-center rounded-full bg-card text-ink"
        >
          <X size={22} strokeWidth={3} />
        </button>
      </div>
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-5 text-center">
        <p className="font-local text-[clamp(40px,12vw,76px)] font-bold leading-[1.15]">{phrase.local}</p>
        {phrase.read && <p className="text-[20px] font-bold">[{phrase.read}]</p>}
        <p className="sticker-sm rounded-2xl bg-card px-4 py-2 text-[18px] font-bold text-ink">{phrase.ko}</p>
      </div>
    </motion.div>
  );
}

export default function Detail({ dest, prefs, onBack, onGacha }) {
  const [phrase, setPhrase] = useState(null);
  const plan = useMemo(() => buildItinerary(dest, prefs), [dest, prefs]);
  const TravelIcon = travelIcon(dest);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <TopBar onBack={onBack} />
        <motion.section
          initial={{ scale: 0.94, rotate: -1.5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          className={`sticker rounded-[32px] p-6 text-onpop ${POP_BG[dest.color]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="sticker-sm grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-card text-[36px] leading-none" aria-hidden>
              {dest.emoji}
            </span>
            <MatchBadge value={dest.match} className="rotate-6" />
          </div>
          <p className="mt-4 text-[14px] font-bold">
            {dest.country} · {dest.domestic ? '국내' : '해외'}
          </p>
          <h1 className="font-display text-[52px] leading-none">{dest.city}</h1>
          <p className="mt-3 text-[17px] font-medium">{dest.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill icon={TravelIcon}>{travelShort(dest)}</Pill>
            <Pill icon={Footprints}>{DEST_STAMINA_LABEL[dest.stamina]}</Pill>
            <Pill icon={Sun}>{dest.best}</Pill>
          </div>
          {dest.points.length > 0 && (
            <p className="mt-4 text-[14px] font-bold">
              궁합 포인트: {dest.points.map((t) => `#${TAG_LABELS[t]}`).join(' ')}
            </p>
          )}
        </motion.section>
      </div>

      <section className="flex flex-col gap-3">
        <SectionTitle icon={UtensilsCrossed} color="tomato">
          이건 꼭 먹어요
        </SectionTitle>
        <ItemList items={dest.eat} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle icon={Binoculars} color="sky">
          여기는 꼭 가요
        </SectionTitle>
        <ItemList items={dest.see} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle icon={Store} color="mint">
          현지인 픽
        </SectionTitle>
        <div className="sticker rounded-[24px] bg-mint p-4 text-onpop">
          <p className="text-[18px] font-bold">{dest.local.title}</p>
          <p className="text-[15px]">{dest.local.note}</p>
          <p className="mt-3 border-t-2 border-dashed border-line pt-3 text-[13px] font-bold">
            관광객 줄 말고 동네 사람들 줄을 따라가요. 앞으로 실제 현지인 리뷰 비율로 골라 드릴 예정이에요.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle icon={Sparkles} color="grape">
          문화 한 스푼
        </SectionTitle>
        <ItemList items={[dest.culture, dest.night]} />
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle icon={CalendarDays} color="mango">
          {prefs.days - 1}박 {prefs.days}일 일정
        </SectionTitle>
        <p className="text-[14px] font-bold text-soft">{itineraryNote(prefs)}</p>
        <ol className="flex flex-col gap-4">
          {plan.map((day, i) => (
            <li key={i} className="sticker rounded-[24px] bg-card p-4 text-ink">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-ink px-2.5 py-0.5 font-display text-[14px] text-paper tabular-nums">DAY {i + 1}</span>
                <span className="font-bold">{day.label}</span>
              </div>
              <ol className="mt-3 flex flex-col gap-2.5">
                {day.slots.map((s, j) => (
                  <li key={j} className="flex gap-3">
                    <span
                      className={`h-fit w-[58px] shrink-0 rounded-lg border-2 border-line py-0.5 text-center text-[12px] font-bold ${KIND_BG[s.kind]} ${s.kind === 'move' ? 'text-ink' : 'text-onpop'}`}
                    >
                      {s.time}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold leading-snug">{s.title}</p>
                      {s.note && <p className="text-[14px] text-soft">{s.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      {dest.phrases && (
        <section className="flex flex-col gap-3">
          <SectionTitle icon={MessagesSquare} color="bubble">
            {dest.domestic ? '사투리 한 마디' : '주문 카드'}
          </SectionTitle>
          <p className="text-[14px] font-bold text-soft">
            {dest.domestic ? `${dest.phrases.lang}로 인사해 보세요.` : `${dest.phrases.lang}를 몰라도 눌러서 보여주면 돼요.`}
          </p>
          <ul className="flex flex-col gap-2.5">
            {dest.phrases.items.map((p) => (
              <li key={p.ko}>
                <button
                  type="button"
                  onClick={() => setPhrase(p)}
                  className="press sticker-sm flex w-full items-center gap-3 rounded-2xl bg-card px-4 py-3 text-left text-ink"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-soft">{p.ko}</span>
                    <span className="font-local block text-[19px] font-bold">{p.local}</span>
                    {p.read && <span className="block text-[13px] text-soft">{p.read}</span>}
                  </span>
                  <Expand size={20} strokeWidth={2.6} aria-label="크게 보기" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <SectionTitle icon={Lightbulb} color="sky">
          알아두면 좋아요
        </SectionTitle>
        <div className="sticker rounded-[24px] bg-card p-4 text-ink">
          <p>{dest.tip}</p>
          <p className="mt-2 text-[14px] text-soft">
            추천 시기: {dest.best} · 이동: {dest.travel}
          </p>
        </div>
      </section>

      <PopButton color="grape" onClick={onGacha}>
        <Shuffle size={20} strokeWidth={2.8} /> 다른 곳도 뽑아 볼래요
      </PopButton>

      <AnimatePresence>
        {phrase && <OrderCard phrase={phrase} lang={dest.phrases.lang} onClose={() => setPhrase(null)} />}
      </AnimatePresence>
    </div>
  );
}
