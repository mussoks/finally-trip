import { FOODS } from '../data/foods.js';

const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** 스와이프 기록 → 좋아한 태그 / 패스한 태그 개수 */
export function tasteProfile(decisions) {
  const like = {};
  const pass = {};
  for (const { id, like: liked } of decisions) {
    const food = FOOD_BY_ID[id];
    if (!food) continue;
    const bucket = liked ? like : pass;
    for (const t of food.tags) bucket[t] = (bucket[t] || 0) + 1;
  }
  return { like, pass };
}

/** 체력: 부모님과 가면 최대 '1만 보'로 낮춰요 */
export const effectiveStamina = (prefs) => (prefs.companion === 'parents' ? Math.min(prefs.stamina, 2) : prefs.stamina);

export function scoreDestination(dest, profile, prefs) {
  const { like, pass } = profile;

  // 1) 입맛: 좋아한 태그가 그 도시에서 얼마나 강한지 (0~1)
  let raw = 0;
  let max = 0;
  for (const [t, c] of Object.entries(like)) {
    raw += (dest.foods[t] || 0) * c;
    max += 3 * c;
  }
  let food = max ? raw / max : 0.5;

  // 패스한 태그가 강한 도시는 조금 깎아요
  let minus = 0;
  let passMax = 0;
  for (const [t, c] of Object.entries(pass)) {
    minus += (dest.foods[t] || 0) * c;
    passMax += 3 * c;
  }
  if (passMax) food -= 0.25 * (minus / passMax);

  // 2) 현실 조건: 휴가 길이 대비 이동 시간, 체력, 동행
  let fit = 0;
  if (prefs.days === 3) {
    if (dest.hours > 5) fit -= 0.25;
    else if (dest.hours > 3.2) fit -= 0.12;
  } else if (prefs.days === 4 && dest.hours > 5.5) {
    fit -= 0.06;
  }
  const s = effectiveStamina(prefs);
  if (dest.stamina > s) fit -= 0.08 * (dest.stamina - s);
  if (prefs.companion === 'parents' && dest.hours <= 2.5) fit += 0.05;
  if (prefs.companion === 'family' && dest.hours <= 4.6 && dest.stamina <= 2) fit += 0.03;

  const total = clamp(food + fit, 0, 1);
  const match = Math.round(58 + 41 * total);

  // 궁합 포인트: 내가 좋아한 것 중 이 도시가 잘하는 것
  const points = Object.entries(like)
    .filter(([t]) => (dest.foods[t] || 0) >= 2)
    .sort((a, b) => (dest.foods[b[0]] || 0) * b[1] - (dest.foods[a[0]] || 0) * a[1])
    .slice(0, 3)
    .map(([t]) => t);

  return { ...dest, match, points };
}

export function rankDestinations(destinations, profile, prefs) {
  return destinations
    .filter((d) => prefs.scope === 'any' || (prefs.scope === 'domestic' ? d.domestic : !d.domestic))
    .map((d) => scoreDestination(d, profile, prefs))
    .sort((a, b) => b.match - a.match || a.hours - b.hours);
}

/** 캡슐 뽑기: 궁합이 높을수록 잘 나와요 */
export function weightedPick(ranked, avoidId) {
  const pool = ranked.length > 1 ? ranked.filter((d) => d.id !== avoidId) : ranked;
  const weights = pool.map((d) => Math.max(1, d.match - 50) ** 2);
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export const travelShort = (dest) => {
  const i = dest.travel.indexOf('약');
  return i >= 0 ? dest.travel.slice(i) : dest.travel;
};
