import { Component } from 'react';
import { clearSaved } from '../lib/storage.js';

/**
 * 화면을 그리다 오류가 나면 하얀 화면 대신 무슨 일인지 보여주고 복구 버튼을 줘요.
 * 오류 문구는 그대로 보여줘서 사용자가 알려주기 쉽게 해요.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[finally-trip] 화면 오류', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const detail = `${error?.name ?? 'Error'}: ${error?.message ?? String(error)}`;
    return (
      <div className="flex flex-col gap-4 py-10" role="alert">
        <h1 className="font-display text-[30px] leading-tight text-ink">화면을 그리다가 문제가 생겼어요</h1>
        <p className="text-soft">아래 문구를 알려주시면 바로 고칠게요. 다시 시도하거나 처음부터 시작할 수 있어요.</p>
        <pre className="sticker-sm overflow-x-auto whitespace-pre-wrap rounded-2xl bg-card p-4 text-[13px] text-ink">{detail}</pre>
        <button
          type="button"
          onClick={() => {
            this.setState({ error: null });
            this.props.onReset?.();
          }}
          className="press sticker min-h-[52px] rounded-2xl bg-mango px-5 font-bold text-onpop"
        >
          이전 화면으로 돌아가기
        </button>
        <button
          type="button"
          onClick={() => {
            clearSaved();
            window.location.reload();
          }}
          className="press sticker-sm min-h-[48px] rounded-2xl bg-card px-5 font-bold text-ink"
        >
          저장된 선택을 지우고 처음부터
        </button>
      </div>
    );
  }
}
