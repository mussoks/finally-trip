import { useState } from 'react';
import { BadgeCheck, MapPin, PartyPopper, UtensilsCrossed } from 'lucide-react';
import { SectionTitle } from './ui.jsx';
import { shortDate, todayKey } from '../lib/holidays.js';
import { ymd } from '../lib/remote.js';

function Thumb({ src, alt }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="grid h-28 w-full place-items-center bg-paper text-soft" aria-hidden>
        <MapPin size={24} strokeWidth={2.4} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="h-28 w-full object-cover"
    />
  );
}

const range = (f) => {
  const s = ymd(f.start);
  const e = ymd(f.end);
  if (!s) return '';
  return e && e !== s ? `${shortDate(s)} ~ ${shortDate(e)}` : shortDate(s);
};

/** 한국관광공사 TourAPI 데이터 (빌드할 때 받아 둔 것) */
export default function TourSection({ data, trip, fetchedAt }) {
  const today = todayKey();
  // 받아 온 데이터 모양이 예상과 달라도 화면이 멈추지 않게, 배열·제목 있는 항목만 써요.
  const list = (v) => (Array.isArray(v) ? v.filter((it) => it && typeof it.title === 'string' && it.title) : []);
  const spots = list(data?.spots).slice(0, 8);
  const foods = list(data?.foods).slice(0, 6);

  const festivals = list(data?.festivals)
    .map((f) => {
      const s = ymd(f.start);
      const e = ymd(f.end) ?? s;
      const during = Boolean(trip && s && s <= trip.end && e >= trip.start);
      return { ...f, s, e, during };
    })
    .filter((f) => f.s && f.e >= today)
    .sort((a, b) => Number(b.during) - Number(a.during) || a.s.localeCompare(b.s))
    .slice(0, 5);

  if (!spots.length && !foods.length && !festivals.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle icon={BadgeCheck} color="sky">
        한국관광공사 실제 데이터
      </SectionTitle>

      {festivals.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1.5 font-bold text-ink">
            <PartyPopper size={18} strokeWidth={2.6} /> 축제·행사
          </h3>
          <ul className="sticker overflow-hidden rounded-[24px] bg-card text-ink">
            {festivals.map((f, i) => (
              <li key={f.id ?? f.title} className={`flex gap-3 px-4 py-3 ${i > 0 ? 'border-t-2 border-dashed border-rule' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug">{f.title}</p>
                  <p className="text-[13px] text-soft">
                    {range(f)}
                    {f.addr && ` · ${f.addr}`}
                  </p>
                </div>
                {f.during && (
                  <span className="sticker-sm h-fit shrink-0 rotate-3 rounded-lg bg-mango px-2 py-0.5 text-[12px] font-bold text-onpop">여행 중!</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {spots.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1.5 font-bold text-ink">
            <MapPin size={18} strokeWidth={2.6} /> 관광공사 추천 명소
          </h3>
          <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-3 pt-1">
            {spots.map((p) => (
              <li key={p.id ?? p.title} className="sticker-sm w-[168px] shrink-0 snap-start overflow-hidden rounded-2xl bg-card text-ink">
                <Thumb src={p.thumb || p.image} alt={p.title} />
                <div className="border-t-2 border-line p-2.5">
                  <p className="text-[14px] font-bold leading-snug">{p.title}</p>
                  {p.addr && <p className="mt-0.5 truncate text-[12px] text-soft">{p.addr}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {foods.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="flex items-center gap-1.5 font-bold text-ink">
            <UtensilsCrossed size={18} strokeWidth={2.6} /> 관광공사 등록 음식점
          </h3>
          <ul className="sticker overflow-hidden rounded-[24px] bg-card text-ink">
            {foods.map((f, i) => (
              <li key={f.id ?? f.title} className={`px-4 py-3 ${i > 0 ? 'border-t-2 border-dashed border-rule' : ''}`}>
                <p className="font-bold leading-snug">{f.title}</p>
                {f.addr && <p className="text-[13px] text-soft">{f.addr}</p>}
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-soft">관광공사에 등록된 가게예요. 현지인 단골집인지는 아직 따로 확인하지 않았어요.</p>
        </div>
      )}

      <p className="text-[12px] text-soft">
        자료 제공: 한국관광공사 TourAPI{fetchedAt ? ` · ${fetchedAt.slice(0, 10)} 기준` : ''}
      </p>
    </section>
  );
}
