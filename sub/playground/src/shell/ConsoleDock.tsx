import type { ReactElement, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ConsoleLogPanel } from '../console/ConsoleLogPanel';
import type { PlaygroundConsoleLog } from '../console/types';
import { calculatePanelHeight } from './split-resize';

/** `ConsoleDock` 컴포넌트 props */
export interface ConsoleDockProps {
  readonly logs: readonly PlaygroundConsoleLog[];
  readonly isOpen: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  readonly onClear: () => void;
}

/** 최소화 상태 status bar와 펼침 상태 console 패널을 전환하는 dock */
export function ConsoleDock({ logs, isOpen, onOpen, onClose, onClear }: ConsoleDockProps): ReactElement {
  const errorCount = logs.filter((log) => log.method === 'error').length;
  const warnCount = logs.filter((log) => log.method === 'warn').length;
  const [panelHeight, setPanelHeight] = useState(160);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  const resizePanel = useCallback((pointerClientY: number) => {
    const rect = dockRef.current?.parentElement?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setPanelHeight(
      calculatePanelHeight({
        containerTop: rect.top,
        containerHeight: rect.height,
        pointerClientY,
      })
    );
  }, []);

  useEffect(() => {
    if (!isDraggingPanel) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const onPointerMove = (event: PointerEvent): void => resizePanel(event.clientY);
    const onPointerUp = (): void => setIsDraggingPanel(false);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDraggingPanel, resizePanel]);

  const handleResizePointerDown = (event: ReactPointerEvent<HTMLHRElement>): void => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizePanel(event.clientY);
    setIsDraggingPanel(true);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        style={{
          height: 30,
          border: '1px solid #334155',
          background: '#020617',
          color: '#cbd5e1',
          cursor: 'pointer',
          textAlign: 'left',
          padding: '0 10px',
        }}
      >
        Console · {logs.length} logs · {warnCount} warnings · {errorCount} errors
      </button>
    );
  }

  return (
    <div ref={dockRef} style={{ height: panelHeight, minHeight: 96, display: 'grid', gridTemplateRows: '8px 1fr' }}>
      <hr
        aria-label="Resize console"
        aria-orientation="horizontal"
        aria-valuemin={96}
        aria-valuenow={Math.round(panelHeight)}
        tabIndex={0}
        onPointerDown={handleResizePointerDown}
        style={{
          margin: 0,
          cursor: 'row-resize',
          background: isDraggingPanel ? '#38bdf8' : '#1e293b',
          border: 0,
          borderTop: '1px solid #0f172a',
          borderBottom: '1px solid #0f172a',
          touchAction: 'none',
        }}
      />
      <ConsoleLogPanel logs={logs} onClear={onClear} onHide={onClose} style={{ minHeight: 0 }} />
    </div>
  );
}
