import { ArrowRight } from 'lucide-react';
import { OptionChip, PopButton, TopBar } from '../components/ui.jsx';
import { COMPANIONS, DAYS, SCOPES, STAMINA } from '../data/prefs.js';
import { shortDate } from '../lib/holidays.js';

function Group({ title, hint, children }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 flex items-baseline gap-2">
        <span className="font-display text-[22px] text-ink">{title}</span>
        {hint && <span className="text-[13px] font-bold text-soft">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

export default function Prefs({ prefs, trip, onChange, onNext, onBack }) {
  const set = (k, v) => onChange({ ...prefs, [k]: v });
  const ready = Boolean(prefs.companion);

  return (
    <div className="flex flex-col gap-7 pb-10">
      <TopBar onBack={onBack} step={2} />

      <div>
        <h1 className="font-display text-[34px] leading-tight text-ink">어떤 여행이 좋아요?</h1>
        <p className="mt-1 text-soft">고르는 대로 이동 시간과 일정 강도를 맞춰 드려요.</p>
      </div>

      <Group title="누구랑 가요?">
        <div className="grid grid-cols-2 gap-3">
          {COMPANIONS.map((c) => (
            <OptionChip key={c.id} selected={prefs.companion === c.id} color={c.color} onClick={() => set('companion', c.id)}>
              <span className="text-2xl leading-none" aria-hidden>
                {c.emoji}
              </span>
              <span className="mt-1">{c.label}</span>
            </OptionChip>
          ))}
        </div>
      </Group>

      <Group title="며칠 쉴 수 있어요?">
        {trip && (
          <p className="sticker-sm rounded-xl bg-card px-3 py-2 text-[14px] font-bold text-ink">
            고른 연휴: {shortDate(trip.start)} ~ {shortDate(trip.end)} ({trip.length}일)
            {trip.length > 5 && <span className="block text-[12px] font-medium text-soft">일정은 최대 4박 5일까지 짜 드려요.</span>}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2.5">
          {DAYS.map((d) => (
            <OptionChip key={d.id} selected={prefs.days === d.id} color={d.color} onClick={() => set('days', d.id)}>
              <span>{d.label}</span>
              <span className="text-[11px] font-medium">{d.sub}</span>
            </OptionChip>
          ))}
        </div>
      </Group>

      <Group title="하루에 몇 걸음?" hint="솔직하게요">
        <div className="grid grid-cols-3 gap-2.5">
          {STAMINA.map((s) => (
            <OptionChip key={s.id} selected={prefs.stamina === s.id} color={s.color} onClick={() => set('stamina', s.id)}>
              <span>{s.label}</span>
              <span className="text-[11px] font-medium">{s.sub}</span>
            </OptionChip>
          ))}
        </div>
      </Group>

      <Group title="어디로 갈까요?">
        <div className="grid grid-cols-3 gap-2.5">
          {SCOPES.map((s) => (
            <OptionChip key={s.id} selected={prefs.scope === s.id} color={s.color} onClick={() => set('scope', s.id)}>
              <span className="text-[15px]">{s.label}</span>
            </OptionChip>
          ))}
        </div>
      </Group>

      <div className="flex flex-col gap-2">
        <PopButton onClick={onNext} disabled={!ready}>
          음식 고르러 가기 <ArrowRight size={20} strokeWidth={2.8} />
        </PopButton>
        {!ready && <p className="text-center text-[14px] font-bold text-soft">누구랑 가는지 먼저 골라 주세요</p>}
      </div>
    </div>
  );
}
