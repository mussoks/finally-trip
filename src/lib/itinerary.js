import { effectiveStamina } from './match.js';

const MIDDLE_LABELS = ['본격 여행', '느긋한 하루', '하루 더'];

const slot = (time, kind, item, override = {}) => ({ time, kind, title: item.title, note: item.note, ...override });

const NAP = { time: '오후', kind: 'nap', title: '숙소 낮잠', note: '진짜로 자도 돼요. 이것도 일정이에요.' };
const STROLL = { time: '해질녘', kind: 'see', title: '골목 산책', note: '지도 끄고 발길 닿는 대로 걸어요' };
const FREE = { time: '오전', kind: 'rest', title: '늦잠 자고 자유 일정', note: '제일 좋았던 곳을 한 번 더 가도 좋아요' };

/**
 * 체력 맞춤 일정을 만들어요.
 * - 5천 보: 매일 오후에 숙소 낮잠
 * - 1만 보: 오후에 쉬는 일정이나 볼거리 하나
 * - 2만 보: 해질녘 일정까지 하나 더
 * 현지인 픽은 첫 본격 여행일에, 그 가게가 붐비는 끼니(local.when)에 넣어요.
 */
export function buildItinerary(dest, prefs) {
  const s = effectiveStamina(prefs);
  const seeQ = [...dest.see];
  const eatQ = dest.eat.slice(1);
  let repeat = 0;
  const nextEat = (time) => {
    if (eatQ.length) return slot(time, 'eat', eatQ.shift());
    const again = dest.eat[repeat++ % dest.eat.length];
    return slot(time, 'eat', again, { title: `한 번 더, ${again.title}`, note: '생각나면 또 먹는 게 여행이죠' });
  };

  const plan = [];

  const first = [
    { time: '오후', kind: 'move', title: '도착 · 숙소 체크인', note: dest.travel },
    slot('저녁', 'eat', dest.eat[0]),
  ];
  if (s >= 2) first.push(slot('밤', 'night', dest.night));
  plan.push({ label: '도착하는 날', slots: first });

  const middle = prefs.days - 2;
  const localWhen = dest.local.when ?? '저녁';

  for (let k = 0; k < middle; k++) {
    const isLast = k === middle - 1;
    const hasLocal = k === 0;
    const slots = [];

    if (hasLocal && localWhen === '아침') slots.push(slot('아침', 'local', dest.local));

    slots.push(seeQ.length ? slot('오전', 'see', seeQ.shift()) : FREE);

    slots.push(hasLocal && localWhen === '점심' ? slot('점심', 'local', dest.local) : nextEat('점심'));

    let afternoon;
    if (s === 1) afternoon = NAP;
    else if (k % 2 === 1 && seeQ.length) afternoon = slot('오후', 'see', seeQ.shift());
    else afternoon = slot('오후', 'rest', dest.rest);
    slots.push(afternoon);

    if (s === 3) slots.push(afternoon.kind === 'rest' ? STROLL : slot('해질녘', 'rest', dest.rest));

    if (hasLocal && localWhen === '저녁') slots.push(slot('저녁', 'local', dest.local));
    else if (isLast) slots.push(slot('밤', 'night', dest.night));
    else slots.push(nextEat('저녁'));

    plan.push({ label: middle > 1 && isLast ? '마지막 밤' : MIDDLE_LABELS[k] ?? '하루 더', slots });
  }

  plan.push({
    label: '돌아가는 날',
    slots: [
      slot('오전', 'local', dest.bye, { kind: 'culture' }),
      { time: '오후', kind: 'move', title: '집으로', note: '수고했어요. 다음 휴가도 금방 와요.' },
    ],
  });

  return plan;
}

export function itineraryNote(prefs) {
  if (prefs.companion === 'parents') return '부모님 체력을 생각해서 오후는 여유 있게 잡았어요.';
  if (prefs.stamina === 1) return '하루 5천 보 기준이라 매일 낮잠 시간을 넣었어요.';
  if (prefs.stamina === 2) return '하루 1만 보 기준, 오후엔 쉬거나 한 곳만 더 가요.';
  return '하루 2만 보 기준으로 꽉 채웠어요. 힘들면 하나씩 빼도 돼요.';
}
