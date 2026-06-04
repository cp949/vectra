import type { ReactElement, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateSplitPercent } from './split-resize';

/** `SplitWorkspace` 컴포넌트 props */
export interface SplitWorkspaceProps {
  readonly editor: ReactNode;
  readonly preview: ReactNode;
  readonly consoleDock: ReactNode;
  readonly isPreviewExpanded: boolean;
}

/** editor/preview 분할 영역과 console dock을 배치하는 컨테이너 */
export function SplitWorkspace({ editor, preview, consoleDock, isPreviewExpanded }: SplitWorkspaceProps): ReactElement {
  const [splitPercent, setSplitPercent] = useState(44);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const resizeSplit = useCallback((pointerClientX: number) => {
    const rect = splitContainerRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setSplitPercent(
      calculateSplitPercent({
        containerLeft: rect.left,
        containerWidth: rect.width,
        pointerClientX,
      })
    );
  }, []);

  useEffect(() => {
    if (!isDraggingSplit) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onPointerMove = (event: PointerEvent): void => resizeSplit(event.clientX);
    const onPointerUp = (): void => setIsDraggingSplit(false);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [isDraggingSplit, resizeSplit]);

  const handleSplitPointerDown = (event: ReactPointerEvent<HTMLHRElement>): void => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeSplit(event.clientX);
    setIsDraggingSplit(true);
  };

  return (
    <section style={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', minHeight: 0, overflow: 'hidden' }}>
      <div
        ref={splitContainerRef}
        style={{
          display: 'grid',
          gridTemplateColumns: isPreviewExpanded ? '1fr' : `${splitPercent}% 8px minmax(0, 1fr)`,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {isPreviewExpanded ? null : <div style={{ minHeight: 0, overflow: 'hidden' }}>{editor}</div>}
        {isPreviewExpanded ? null : (
          <hr
            aria-label="Resize editor and preview"
            aria-orientation="vertical"
            aria-valuemax={70}
            aria-valuemin={30}
            aria-valuenow={Math.round(splitPercent)}
            tabIndex={0}
            onPointerDown={handleSplitPointerDown}
            style={{
              margin: 0,
              cursor: 'col-resize',
              background: isDraggingSplit ? '#38bdf8' : '#1e293b',
              border: 0,
              borderLeft: '1px solid #0f172a',
              borderRight: '1px solid #0f172a',
              touchAction: 'none',
            }}
          />
        )}
        <div style={{ minHeight: 0, overflow: 'hidden' }}>{preview}</div>
      </div>
      {consoleDock}
    </section>
  );
}
