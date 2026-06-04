import type { PlaygroundExampleId } from '@repo/playground';
import type { ReactElement } from 'react';

interface ExampleNotFoundPageProps {
  requestedId: PlaygroundExampleId;
  onOpenIndex: () => void;
}

export function ExampleNotFoundPage({ requestedId, onOpenIndex }: ExampleNotFoundPageProps): ReactElement {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#020617',
        color: '#e5e7eb',
      }}
    >
      <section style={{ maxWidth: 520 }}>
        <h1 style={{ margin: '0 0 12px', fontSize: 36, lineHeight: 1.1 }}>예제를 찾을 수 없습니다</h1>
        <p style={{ margin: '0 0 20px', color: '#cbd5e1' }}>요청한 예제 ID: {requestedId}</p>
        <button
          type="button"
          onClick={onOpenIndex}
          style={{
            padding: '10px 14px',
            border: '1px solid #38bdf8',
            borderRadius: 8,
            background: '#0f172a',
            color: '#e5e7eb',
            cursor: 'pointer',
          }}
        >
          예제 목록으로 돌아가기
        </button>
      </section>
    </main>
  );
}
