/**
 * Transform Handles
 *
 * 사각형(unrotated AABB)의 8개 resize handle을 드래그하면, 그 드래그가 나타내는
 * affine transform을 matrix로 환산해 box에 적용하고 최소 크기로 보정한다.
 * Shift를 누른 채 corner handle을 끌면 등비례로 잠긴다.
 *
 * - EditorGeometry.resizeHandlesInto: bounds의 8개 handle 좌표를 buffer 하나에 기록
 * - EditorGeometry.handleAtPoint: 커서에서 tolerance 이내 가장 가까운 handle 선택
 * - EditorGeometry.transformFromHandlesInto: handle drag → affine matrix 환산
 * - Matrix.transformBoundsInto: 그 matrix를 bounds 네 corner에 적용해 새 AABB 산출
 * - EditorGeometry.constrainResize: 산출된 크기를 최소 크기 규칙으로 보정
 */

import * as EditorGeometry from '@cp949/vectra/editor-geometry';
import * as Matrix from '@cp949/vectra/matrix';

// editor-geometry barrel은 handle id 타입을 re-export하지 않으므로 예제에서 직접 둔다
type ResizeHandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type HandleId = ResizeHandleId | 'rotate';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  // 크기 readout 라벨
  const label = new PIXI.Text({
    text: '',
    style: { fill: 0x94a3b8, fontFamily: 'monospace', fontSize: 13 },
  });
  app.stage.addChild(label);

  // 편집 대상 box: unrotated AABB
  const bounds = { min: { x: 260, y: 150 }, max: { x: 460, y: 290 } };

  // resizeHandlesInto 출력 buffer (매 프레임 재기록)
  const handles: { id: HandleId; point: { x: number; y: number } }[] = [];
  const makePoint = (): { x: number; y: number } => ({ x: 0, y: 0 });

  // transform 중간 buffer
  const matrix = Matrix.createMatrix();
  const rawBounds = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };

  // resize 제약
  const MIN_SIZE = 28;
  const HIT_TOLERANCE = 14;
  const HANDLE_RADIUS = 5;

  // 현재 잡은 handle (resize handle만 grab 대상)
  let grabbed: ResizeHandleId | undefined;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  /** pointerdown: 커서 위치의 handle을 잡는다. */
  const onPointerDown = (e: PointerEvent): void => {
    const cursor = getCanvasXY(e);
    EditorGeometry.resizeHandlesInto(handles, bounds, makePoint);
    const id = EditorGeometry.handleAtPoint(handles, cursor, HIT_TOLERANCE);
    // handleAtPoint는 'rotate'도 반환할 수 있으나 이 예제 handle은 resize 8개뿐이다
    grabbed = id === 'rotate' ? undefined : id;
  };

  /** pointermove: 잡은 handle을 따라 box를 resize한다. */
  const onPointerMove = (e: PointerEvent): void => {
    if (grabbed === undefined) return;
    const cursor = getCanvasXY(e);

    // handle drag → affine matrix. Shift면 corner를 등비례로 잠근다.
    const ok = EditorGeometry.transformFromHandlesInto(
      matrix,
      { bounds, handle: grabbed, to: cursor },
      { aspectLocked: e.shiftKey }
    );
    if (!ok) return;

    // matrix를 bounds에 적용한 미보정 AABB
    Matrix.transformBoundsInto(rawBounds, matrix, bounds);

    const curW = bounds.max.x - bounds.min.x;
    const curH = bounds.max.y - bounds.min.y;
    const proposedW = rawBounds.max.x - rawBounds.min.x;
    const proposedH = rawBounds.max.y - rawBounds.min.y;

    // 최소 크기 보정
    const size = EditorGeometry.constrainResize(
      { width: curW, height: curH },
      { width: proposedW, height: proposedH },
      { minWidth: MIN_SIZE, minHeight: MIN_SIZE }
    );

    // handle 대각 anchor(고정 변)를 기준으로 보정된 크기를 재배치한다
    const hasE = grabbed.includes('e');
    const hasW = grabbed.includes('w');
    const hasN = grabbed.includes('n');
    const hasS = grabbed.includes('s');

    if (hasE) {
      bounds.max.x = bounds.min.x + size.width;
    } else if (hasW) {
      bounds.min.x = bounds.max.x - size.width;
    }
    if (hasS) {
      bounds.max.y = bounds.min.y + size.height;
    } else if (hasN) {
      bounds.min.y = bounds.max.y - size.height;
    }
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    EditorGeometry.resizeHandlesInto(handles, bounds, makePoint);

    g.clear();

    // box (반투명 채움 + 외곽선)
    const w = bounds.max.x - bounds.min.x;
    const h = bounds.max.y - bounds.min.y;
    g.rect(bounds.min.x, bounds.min.y, w, h)
      .fill({ color: 0x38bdf8, alpha: 0.12 })
      .stroke({ color: 0x38bdf8, width: 2 });

    // 8개 resize handle (grab 중이면 강조)
    for (const handle of handles) {
      const active = handle.id === grabbed;
      g.rect(handle.point.x - HANDLE_RADIUS, handle.point.y - HANDLE_RADIUS, HANDLE_RADIUS * 2, HANDLE_RADIUS * 2).fill(
        { color: active ? 0xf59e0b : 0xe2e8f0 }
      );
    }

    label.text = `${Math.round(w)} × ${Math.round(h)}`;
    label.x = bounds.min.x;
    label.y = bounds.min.y - 22;
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    g.destroy();
    label.destroy();
  };
}
