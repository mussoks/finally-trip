const KEY = 'finally-trip:v1';

// 시크릿 창이나 저장소가 막힌 환경에서도 앱은 그대로 동작해야 해요.
export function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 저장 못 해도 괜찮아요 */
  }
}

export function buzz(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* 진동 미지원 */
  }
}
