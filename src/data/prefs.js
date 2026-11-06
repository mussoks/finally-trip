export const COMPANIONS = [
  { id: 'solo', label: '혼자', emoji: '🎧', color: 'sky' },
  { id: 'partner', label: '배우자·연인', emoji: '💞', color: 'bubble' },
  { id: 'family', label: '아이와 함께', emoji: '🧸', color: 'mango' },
  { id: 'parents', label: '부모님 모시고', emoji: '🌷', color: 'mint' },
];

export const DAYS = [
  { id: 3, label: '2박 3일', sub: '연차 1일 + 주말', color: 'mango' },
  { id: 4, label: '3박 4일', sub: '연차 2일 + 주말', color: 'tomato' },
  { id: 5, label: '4박 5일', sub: '연차 3일 + 주말', color: 'grape' },
];

export const STAMINA = [
  { id: 1, label: '5천 보', sub: '쉬엄쉬엄', color: 'mint' },
  { id: 2, label: '1만 보', sub: '적당히', color: 'sky' },
  { id: 3, label: '2만 보', sub: '아직 쌩쌩', color: 'tomato' },
];

export const SCOPES = [
  { id: 'any', label: '어디든 좋아요', color: 'grape' },
  { id: 'domestic', label: '국내로', color: 'mint' },
  { id: 'abroad', label: '해외로', color: 'sky' },
];

export const DEST_STAMINA_LABEL = { 1: '걷기 적음', 2: '걷기 보통', 3: '많이 걸어요' };

export const labelOf = (list, id) => list.find((x) => x.id === id)?.label ?? '';
