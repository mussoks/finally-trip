// 빌드할 때 scripts/fetch-data.mjs 가 만든 공공데이터 파일을 읽어요.
// 파일이 없거나 형식이 이상하면 null 을 돌려주고, 앱은 내장 데이터로 동작해요.

async function getJson(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function validTour(t) {
  if (!isObj(t) || !isObj(t.destinations)) return null;
  return t;
}

function validHolidays(h) {
  if (!isObj(h) || !Array.isArray(h.years) || !isObj(h.days)) return null;
  return h;
}

export async function loadRemote() {
  const [tour, holidays] = await Promise.all([getJson('./data/tour.json'), getJson('./data/holidays.json')]);
  return { tour: validTour(tour), holidays: validHolidays(holidays) };
}

/** TourAPI 날짜 "20270915" → "2027-09-15" */
export const ymd = (s) => (/^\d{8}$/.test(String(s)) ? `${String(s).slice(0, 4)}-${String(s).slice(4, 6)}-${String(s).slice(6, 8)}` : null);
