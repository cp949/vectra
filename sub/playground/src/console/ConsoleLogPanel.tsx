import { Console } from '@cp949/console-feed';
import type { CSSProperties, ReactElement } from 'react';
import type { PlaygroundConsoleLog } from './types';

/** `ConsoleLogPanel` 컴포넌트 props */
export interface ConsoleLogPanelProps {
  /** 표시할 console 로그 목록 */
  readonly logs: readonly PlaygroundConsoleLog[];
  /** 로그 삭제 콜백 */
  readonly onClear?: () => void;
  /** 패널 숨김 콜백 */
  readonly onHide?: () => void;
  /** 패널 제목 */
  readonly title?: string;
  /** 빈 상태 문구 */
  readonly emptyMessage?: string;
  /** 루트 요소 style */
  readonly style?: CSSProperties;
}

/** sandbox console 로그를 표시하는 공용 패널 */
export function ConsoleLogPanel({
  logs,
  onClear,
  onHide,
  title = 'Console',
  emptyMessage = '로그 없음',
  style,
}: ConsoleLogPanelProps): ReactElement {
  return (
    <section
      aria-label={title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: '#111827',
        color: '#e5e7eb',
        fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace',
        ...style,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: '0 0 32px',
          padding: '0 8px',
          borderBottom: '1px solid #374151',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700 }}>{title}</span>
        <span style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={onClear} style={buttonStyle}>
            Clear
          </button>
          <button type="button" onClick={onHide} style={buttonStyle}>
            Hide
          </button>
        </span>
      </header>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          userSelect: 'text',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ padding: '8px 10px', color: '#9ca3af', fontSize: 12 }}>{emptyMessage}</div>
        ) : (
          <Console logs={[...logs]} variant="dark" logGrouping={false} />
        )}
      </div>
    </section>
  );
}

/** 작은 console 패널 버튼의 공통 style */
const buttonStyle: CSSProperties = {
  border: '1px solid #4b5563',
  borderRadius: 4,
  background: '#1f2937',
  color: '#e5e7eb',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 11,
  lineHeight: '20px',
  padding: '0 8px',
};
