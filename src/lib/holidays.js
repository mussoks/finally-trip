import { BUNDLED_HOLIDAYS } from '../data/holidays.js';

// 날짜는 모두 UTC 자정 기준 숫자로 다뤄서 시간대·서머타임 영향을 없애요.
const DAY = 86400000;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

export const parseKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const toKey = (t) => {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

export const todayKey = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

export const addDays = (key, n) => toKey(parseKey(key) + n * DAY);

/** "9. 11(토)" */
export function shortDate(key) {
  const d = new Date(parseKey(key));
  return `${d.getUTCMonth() + 1}. ${d.getUTCDate()}(${WEEKDAY[d.getUTCDay()]})`;
}

/** "2027. 9. 11(토)" */
export function longDate(key) {
  return `${key.slice(0, 4)}. ${shortDate(key)}`;
}

export const weekdayOf = (key) => WEEKDAY[new Date(parseKey(key)).getUTCDay()];

/**
 * 내장 데이터 + (있으면) API 데이터. API가 받아 온 해는 API 데이터만 써요.
 * remote: { years: [2027, 2028], days: { 'YYYY-MM-DD': '이름' } }
 */
export function mergeHolidays(remote) {
  const apiYears = new Set((remote?.years ?? []).map(String));
  const days = {};
  for (const [k, v] of Object.entries(BUNDLED_HOLIDAYS.days)) {
    if (!apiYears.has(k.slice(0, 4))) days[k] = v;
  }
  for (const [k, v] of Object.entries(remote?.days ?? {})) days[k] = v;

  const lastApiYear = Math.max(0, ...[...apiYears].map(Number));
  const to = lastApiYear && `${lastApiYear}-12-31` > BUNDLED_HOLIDAYS.to ? `${lastApiYear}-12-31` : BUNDLED_HOLIDAYS.to;
  const source = apiYears.size ? `한국천문연구원 특일 정보 (${[...apiYears].sort().join(', ')}년)` : BUNDLED_HOLIDAYS.source;
  return { days, to, source };
}

/** from ~ to 날짜마다 쉬는 날인지 표시 */
export function buildCalendar(fromKey, toKeyStr, holidayDays) {
  const out = [];
  for (let t = parseKey(fromKey), end = parseKey(toKeyStr); t <= end; t += DAY) {
    const key = toKey(t);
    const dow = new Date(t).getUTCDay();
    const holiday = holidayDays[key] ?? null;
    const weekend = dow === 0 || dow === 6;
    out.push({ key, dow, weekend, holiday, off: weekend || Boolean(holiday) });
  }
  return out;
}

/**
 * 연차 budget일 이하로 가장 길게 쉬는 구간을 찾아요.
 * - 시작점은 "바로 전날이 출근일"인 날만 봐요 (전날도 쉬는 날이면 더 앞에서 시작하는 게 항상 나아요).
 * - 각 시작점에서 연차를 budget개까지 써서 끝까지 늘려요.
 * - 겹치는 구간은 더 좋은 것 하나만 남겨요.
 */
export function bestWindows(calendar, budget, { limit = 6, minLength = 3 } = {}) {
  const n = calendar.length;
  const candidates = [];

  for (let i = 0; i < n; i++) {
    if (i > 0 && calendar[i - 1].off) continue;
    let used = 0;
    let j = i;
    while (j < n) {
      const cost = calendar[j].off ? 0 : 1;
      if (used + cost > budget) break;
      used += cost;
      j++;
    }
    const end = j - 1;
    if (end < i) continue;
    const slice = calendar.slice(i, end + 1);
    // 쉬는 날이 하루도 없는 구간(연차만 연속)은 빼요.
    if (!slice.some((d) => d.off)) continue;
    const length = end - i + 1;
    if (length < minLength) continue;
    candidates.push({
      start: calendar[i].key,
      end: calendar[end].key,
      length,
      leave: slice.filter((d) => !d.off).map((d) => d.key),
      holidays: [...new Set(slice.map((d) => d.holiday).filter(Boolean).map((h) => h.replace(/^대체공휴일\((.+)\)$/, '$1').replace(/ 연휴$/, '')))],
      days: slice,
    });
  }

  // 길수록, 같은 길이면 연차를 덜 쓸수록, 그다음엔 빠를수록
  candidates.sort((a, b) => b.length - a.length || a.leave.length - b.leave.length || a.start.localeCompare(b.start));

  const picked = [];
  for (const c of candidates) {
    if (picked.some((p) => !(c.end < p.start || c.start > p.end))) continue;
    picked.push(c);
    if (picked.length >= limit) break;
  }
  return picked;
}
