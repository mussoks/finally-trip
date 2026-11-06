// 공공데이터포털 API에서 실제 데이터를 받아 public/data/*.json 으로 저장해요.
//
//   DATA_GO_KR_KEY=발급받은_일반인증키 npm run fetch-data
//
// - 한국관광공사 국문 관광정보 서비스 (KorService2): 국내 여행지의 명소·음식점·축제
// - 한국천문연구원 특일 정보 (SpcdeInfoService): 공휴일
//
// 키가 없거나 호출이 실패해도 종료 코드는 0이에요. 앱은 내장 데이터로 그대로 동작하고,
// 받은 데이터가 있을 때만 화면에 더 보여줘요. 실패 이유는 로그에 남겨요.

import { mkdir, writeFile } from 'node:fs/promises';

const OUT_DIR = new URL('../public/data/', import.meta.url);
const TOUR_BASE = process.env.TOUR_API_BASE || 'https://apis.data.go.kr/B551011/KorService2';
const SPCDE_BASE = process.env.SPCDE_API_BASE || 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService';
const APP_NAME = 'finally-trip';

// 공공데이터포털은 Encoding 키와 Decoding 키를 둘 다 줘요. 어느 쪽을 넣어도 되게 풀어서 써요.
const rawKey = (process.env.DATA_GO_KR_KEY || '').trim();
const KEY = rawKey.includes('%') ? decodeURIComponent(rawKey) : rawKey;

// 국내 여행지: 시도·시군구 이름으로 법정동 코드를 찾고, 실패하면 좌표 반경 검색으로 바꿔요.
// addr 는 결과가 정말 그 지역인지 주소로 한 번 더 거르는 키워드예요.
const DOMESTIC = [
  { id: 'jeju', sido: ['제주'], sigungu: null, addr: ['제주'], centers: [[126.5312, 33.4996], [126.5601, 33.2541], [126.93, 33.458]] },
  { id: 'busan', sido: ['부산'], sigungu: null, addr: ['부산'], centers: [[129.0756, 35.1796], [129.1635, 35.1631]] },
  { id: 'gyeongju', sido: ['경상북도', '경북'], sigungu: ['경주'], addr: ['경주'], centers: [[129.2247, 35.8562]] },
  { id: 'gangneung', sido: ['강원'], sigungu: ['강릉'], addr: ['강릉'], centers: [[128.8761, 37.7519]] },
  { id: 'yeosu', sido: ['전라남도', '전남'], sigungu: ['여수'], addr: ['여수'], centers: [[127.6622, 34.7604]] },
];

const CONTENT = { spot: '12', food: '39' };
const log = (...a) => console.log('[fetch-data]', ...a);

async function call(base, op, params, keyParam = 'serviceKey') {
  const url = new URL(`${base}/${op}`);
  url.search = new URLSearchParams({ [keyParam]: KEY, _type: 'json', ...params }).toString();
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    // 키 오류 등은 _type=json 이어도 XML로 올 때가 있어요.
    const reason = text.match(/<returnAuthMsg>([^<]+)/)?.[1] || text.match(/<resultMsg>([^<]+)/)?.[1] || text.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`${op}: HTTP ${res.status}, ${reason}`);
  }
  const header = json?.response?.header;
  if (header && !['0000', '00'].includes(String(header.resultCode))) {
    throw new Error(`${op}: ${header.resultCode} ${header.resultMsg}`);
  }
  const body = json?.response?.body ?? {};
  // 결과가 없으면 items 가 "" 이고, 1건이면 item 이 배열이 아니라 객체로 와요.
  const raw = body.items?.item ?? [];
  return { items: Array.isArray(raw) ? raw : [raw], total: Number(body.totalCount ?? 0) };
}

const tour = (op, params) => call(TOUR_BASE, op, { MobileOS: 'ETC', MobileApp: APP_NAME, ...params });

const https = (u) => (typeof u === 'string' && u ? u.replace(/^http:\/\//, 'https://') : '');
const matchesAddr = (item, words) => words.some((w) => String(item.addr1 || '').includes(w));

function slim(it) {
  return {
    id: String(it.contentid ?? ''),
    title: String(it.title ?? '').trim(),
    addr: String(it.addr1 ?? '').trim(),
    image: https(it.firstimage),
    thumb: https(it.firstimage2),
    tel: String(it.tel ?? '').trim(),
    x: Number(it.mapx) || null,
    y: Number(it.mapy) || null,
    copyright: it.cpyrhtDivCd || null,
  };
}

const codeOf = (it) => String(it.code ?? it.lDongSignguCd ?? it.lDongRegnCd ?? '');
const nameOf = (it) => String(it.name ?? it.lDongSignguNm ?? it.lDongRegnNm ?? '');

let sidoCache = null;
async function resolveLdong(dest) {
  sidoCache ??= (await tour('ldongCode2', { numOfRows: '100', pageNo: '1' })).items;
  const sido = sidoCache.find((it) => dest.sido.some((w) => nameOf(it).includes(w)));
  if (!sido) throw new Error(`시도 코드 못 찾음: ${dest.sido.join('/')}`);
  const params = { lDongRegnCd: codeOf(sido) };
  if (dest.sigungu) {
    const { items } = await tour('ldongCode2', { lDongRegnCd: codeOf(sido), numOfRows: '100', pageNo: '1' });
    const sgg = items.find((it) => dest.sigungu.some((w) => nameOf(it).includes(w)));
    if (!sgg) throw new Error(`시군구 코드 못 찾음: ${dest.sigungu.join('/')}`);
    params.lDongSignguCd = codeOf(sgg);
  }
  return params;
}

async function listFor(dest, region, contentTypeId, want) {
  // 1) 법정동 코드로 지역 목록 (대표 이미지 있는 것, 수정일순)
  if (region) {
    try {
      const { items } = await tour('areaBasedList2', { ...region, contentTypeId, arrange: 'Q', numOfRows: String(want * 2), pageNo: '1' });
      const hit = items.filter((it) => matchesAddr(it, dest.addr));
      if (hit.length >= 3) return hit.slice(0, want);
    } catch (e) {
      log(`  ${dest.id} areaBasedList2 실패: ${e.message}`);
    }
  }
  // 2) 좌표 반경 20km 검색으로 대신
  const seen = new Map();
  for (const [mapX, mapY] of dest.centers) {
    try {
      const { items } = await tour('locationBasedList2', { mapX: String(mapX), mapY: String(mapY), radius: '20000', contentTypeId, numOfRows: String(want), pageNo: '1' });
      for (const it of items) if (matchesAddr(it, dest.addr)) seen.set(String(it.contentid), it);
    } catch (e) {
      log(`  ${dest.id} locationBasedList2 실패: ${e.message}`);
    }
  }
  return [...seen.values()].slice(0, want);
}

async function fetchFestivals(todayYmd) {
  // searchFestival2 는 지역 코드로 거르면 0건이 오는 사례가 있어서 전국을 받아 주소로 걸러요.
  const all = [];
  for (let page = 1; page <= 8; page++) {
    const { items, total } = await tour('searchFestival2', { eventStartDate: todayYmd, numOfRows: '100', pageNo: String(page), arrange: 'A' });
    all.push(...items);
    if (all.length >= total || items.length === 0) break;
  }
  return all;
}

async function fetchTour() {
  const now = new Date();
  const todayYmd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const destinations = {};

  let festivals = [];
  try {
    festivals = await fetchFestivals(todayYmd);
    log(`축제 ${festivals.length}건 (전국)`);
  } catch (e) {
    log(`축제 실패: ${e.message}`);
  }

  for (const dest of DOMESTIC) {
    let region = null;
    try {
      region = await resolveLdong(dest);
    } catch (e) {
      log(`  ${dest.id} 법정동 코드 실패, 좌표 검색으로 대신해요: ${e.message}`);
    }
    const spots = (await listFor(dest, region, CONTENT.spot, 8)).map(slim);
    const foods = (await listFor(dest, region, CONTENT.food, 6)).map(slim);
    const fests = festivals
      .filter((it) => matchesAddr(it, dest.addr))
      .map((it) => ({ ...slim(it), start: String(it.eventstartdate ?? ''), end: String(it.eventenddate ?? '') }))
      .slice(0, 10);
    log(`${dest.id}: 명소 ${spots.length} · 음식점 ${foods.length} · 축제 ${fests.length}`);
    if (spots.length || foods.length || fests.length) destinations[dest.id] = { spots, foods, festivals: fests };
  }

  return Object.keys(destinations).length
    ? { source: '한국관광공사 TourAPI (KorService2)', fetchedAt: now.toISOString(), destinations }
    : null;
}

async function fetchHolidays() {
  const thisYear = new Date().getFullYear();
  const years = [];
  const days = {};
  for (const year of [thisYear, thisYear + 1]) {
    const found = {};
    try {
      for (let m = 1; m <= 12; m++) {
        const { items } = await call(
          SPCDE_BASE,
          'getRestDeInfo',
          { solYear: String(year), solMonth: String(m).padStart(2, '0'), numOfRows: '50' },
          'ServiceKey',
        );
        for (const it of items) {
          const d = String(it.locdate ?? '');
          if (it.isHoliday === 'Y' && /^\d{8}$/.test(d)) found[`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`] = String(it.dateName ?? '공휴일');
        }
      }
    } catch (e) {
      log(`${year}년 공휴일 실패: ${e.message}`);
      continue;
    }
    // 아직 발표 전인 해는 거의 비어 있어요. 너무 적으면 내장 데이터를 쓰게 둬요.
    if (Object.keys(found).length < 12) {
      log(`${year}년 공휴일 ${Object.keys(found).length}일 → 아직 발표 전으로 보고 건너뛰어요`);
      continue;
    }
    years.push(year);
    Object.assign(days, found);
    log(`${year}년 공휴일 ${Object.keys(found).length}일`);
  }
  return years.length ? { source: '한국천문연구원 특일 정보', fetchedAt: new Date().toISOString(), years, days } : null;
}

async function main() {
  if (!KEY) {
    log('DATA_GO_KR_KEY 가 없어서 건너뛰어요. 앱은 내장 데이터로 동작해요.');
    return;
  }
  await mkdir(OUT_DIR, { recursive: true });

  const [tourData, holidayData] = await Promise.all([
    fetchTour().catch((e) => (log(`관광 데이터 실패: ${e.message}`), null)),
    fetchHolidays().catch((e) => (log(`공휴일 실패: ${e.message}`), null)),
  ]);

  if (tourData) {
    await writeFile(new URL('tour.json', OUT_DIR), JSON.stringify(tourData));
    log('public/data/tour.json 저장');
  }
  if (holidayData) {
    await writeFile(new URL('holidays.json', OUT_DIR), JSON.stringify(holidayData));
    log('public/data/holidays.json 저장');
  }
}

main().catch((e) => {
  log(`예상하지 못한 오류: ${e.message}`);
});
