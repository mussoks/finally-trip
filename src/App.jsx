import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { DESTINATIONS } from './data/destinations.js';
import { mergeHolidays } from './lib/holidays.js';
import { rankDestinations, tasteProfile } from './lib/match.js';
import { loadRemote } from './lib/remote.js';
import { load, save } from './lib/storage.js';
import Intro from './screens/Intro.jsx';
import Years from './screens/Years.jsx';
import Prefs from './screens/Prefs.jsx';
import Swipe from './screens/Swipe.jsx';
import Results from './screens/Results.jsx';
import Detail from './screens/Detail.jsx';
import Gacha from './screens/Gacha.jsx';
import Holidays from './screens/Holidays.jsx';

const DEFAULT = {
  screen: 'intro',
  years: 12,
  prefs: { companion: null, days: 4, stamina: 2, scope: 'any' },
  decisions: [],
  detailId: null,
  backTo: 'results',
  leave: 2,
  trip: null, // { start, end, length, leave: [...] }
  holidaysBack: 'intro',
};

// "예시 결과 먼저 구경하기"용 샘플 답변
const SAMPLE = {
  ...DEFAULT,
  screen: 'results',
  years: 15,
  prefs: { companion: 'partner', days: 4, stamina: 1, scope: 'any' },
  decisions: [
    { id: 'broth', like: true },
    { id: 'spicysour', like: false },
    { id: 'sushi', like: false },
    { id: 'dumpling', like: true },
    { id: 'street', like: true },
    { id: 'bbq', like: false },
    { id: 'tropical', like: true },
    { id: 'seafood', like: false },
    { id: 'curry', like: false },
    { id: 'gukbap', like: false },
    { id: 'cafe', like: true },
    { id: 'beer', like: true },
  ],
};

const SCREENS = ['intro', 'years', 'prefs', 'swipe', 'results', 'detail', 'gacha', 'holidays'];

function restore() {
  const saved = load();
  if (!saved || !SCREENS.includes(saved.screen)) return DEFAULT;
  const merged = { ...DEFAULT, ...saved, prefs: { ...DEFAULT.prefs, ...saved.prefs } };
  if (merged.screen === 'gacha') merged.screen = 'results';
  if (merged.screen === 'detail' && !merged.detailId) merged.screen = 'results';
  return merged;
}

const clampDays = (n) => Math.min(5, Math.max(3, n));

export default function App() {
  const [s, setS] = useState(restore);
  const [remote, setRemote] = useState({ tour: null, holidays: null });
  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));

  useEffect(() => save(s), [s]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [s.screen, s.detailId]);
  useEffect(() => {
    let alive = true;
    loadRemote().then((r) => alive && setRemote(r));
    return () => {
      alive = false;
    };
  }, []);

  const profile = useMemo(() => tasteProfile(s.decisions), [s.decisions]);
  const ranked = useMemo(() => rankDestinations(DESTINATIONS, profile, s.prefs), [profile, s.prefs]);
  const holidays = useMemo(() => mergeHolidays(remote.holidays), [remote.holidays]);
  const detail = ranked.find((d) => d.id === s.detailId) ?? null;

  const openDetail = (id, backTo = 'results') => set({ screen: 'detail', detailId: id, backTo });
  const openHolidays = (from) => set({ screen: 'holidays', holidaysBack: from });
  const pickTrip = (w) =>
    setS((prev) => ({
      ...prev,
      trip: { start: w.start, end: w.end, length: w.length, leave: w.leave },
      prefs: { ...prev.prefs, days: clampDays(w.length) },
      screen: prev.decisions.length > 0 ? 'results' : 'years',
    }));

  const resultsProps = {
    years: s.years,
    prefs: s.prefs,
    ranked,
    trip: s.trip,
    onOpen: (id) => openDetail(id),
    onGacha: () => set({ screen: 'gacha' }),
    onHolidays: () => openHolidays('results'),
    onRedoFood: () => set({ screen: 'swipe', decisions: [] }),
    onRestart: () => setS(DEFAULT),
  };

  let view;
  switch (s.screen) {
    case 'years':
      view = <Years years={s.years} onChange={(years) => set({ years })} onNext={() => set({ screen: 'prefs' })} onBack={() => set({ screen: 'intro' })} />;
      break;
    case 'prefs':
      view = (
        <Prefs
          prefs={s.prefs}
          trip={s.trip}
          onChange={(prefs) => set({ prefs })}
          onNext={() => set({ screen: 'swipe' })}
          onBack={() => set({ screen: 'years' })}
        />
      );
      break;
    case 'swipe':
      view = (
        <Swipe
          decisions={s.decisions}
          onDecide={(id, like) => setS((prev) => ({ ...prev, decisions: [...prev.decisions, { id, like }] }))}
          onUndo={() => setS((prev) => ({ ...prev, decisions: prev.decisions.slice(0, -1) }))}
          onDone={() => set({ screen: 'results' })}
          onBack={() => set({ screen: 'prefs' })}
        />
      );
      break;
    case 'results':
      view = <Results {...resultsProps} />;
      break;
    case 'detail':
      view = detail ? (
        <Detail
          dest={detail}
          prefs={s.prefs}
          trip={s.trip}
          tour={remote.tour}
          onBack={() => set({ screen: s.backTo === 'gacha' ? 'gacha' : 'results' })}
          onGacha={() => set({ screen: 'gacha' })}
          onHolidays={() => openHolidays('results')}
        />
      ) : (
        <Results {...resultsProps} />
      );
      break;
    case 'gacha':
      view = <Gacha ranked={ranked} onPick={(id) => openDetail(id, 'gacha')} onBack={() => set({ screen: 'results' })} />;
      break;
    case 'holidays':
      view = (
        <Holidays
          holidays={holidays}
          leave={s.leave}
          onLeave={(leave) => set({ leave })}
          trip={s.trip}
          onPick={pickTrip}
          onClearTrip={() => set({ trip: null })}
          onBack={() => set({ screen: SCREENS.includes(s.holidaysBack) ? s.holidaysBack : 'intro' })}
        />
      );
      break;
    default:
      view = <Intro onStart={() => set({ screen: 'years' })} onSample={() => setS(SAMPLE)} onHolidays={() => openHolidays('intro')} />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="gutter mx-auto w-full max-w-[480px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={s.screen + (s.screen === 'detail' ? s.detailId : '')}
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          >
            {view}
          </motion.main>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
