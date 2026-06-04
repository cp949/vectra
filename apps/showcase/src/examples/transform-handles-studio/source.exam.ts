import * as Bounds from '@cp949/vectra/bounds';
import * as EditorGeometry from '@cp949/vectra/editor-geometry';
import * as Matrix from '@cp949/vectra/matrix';
import * as PIXI from 'pixi.js';

type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
  pointer: { x: number; y: number };
};

type ResizeHandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export async function setup({ app, size, pointer }: Runtime) {
  // 초기 bounds (화면 중앙 사각형)
  const bounds = {
    min: { x: size.width * 0.25, y: size.height * 0.25 },
    max: { x: size.width * 0.75, y: size.height * 0.75 },
  };

  const HANDLE_R = 8;

  // 현재 너비/높이 (constrainResize 입력으로 사용)
  function currentWH() {
    return {
      width: bounds.max.x - bounds.min.x,
      height: bounds.max.y - bounds.min.y,
    };
  }

  let dragging: {
    handleId: ResizeHandleId;
    startBounds: typeof bounds;
    startPointer: { x: number; y: number };
  } | null = null;

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  // resizeHandlesInto: factory 필요. 반환값은 { id, point: { x, y } }[]
  function getHandles(): { id: ResizeHandleId; x: number; y: number }[] {
    const out: { id: ResizeHandleId; point: { x: number; y: number } }[] = [];
    EditorGeometry.resizeHandlesInto(out as any, bounds, () => ({
      x: 0,
      y: 0,
    }));
    return out.map((p) => ({ id: p.id, x: p.point.x, y: p.point.y }));
  }

  function hitHandle(x: number, y: number): ResizeHandleId | null {
    for (const h of getHandles()) {
      const dx = h.x - x;
      const dy = h.y - y;
      if (dx * dx + dy * dy <= HANDLE_R * HANDLE_R * 4) return h.id;
    }
    return null;
  }

  function draw() {
    gfx.clear();
    // 텍스트 제거
    for (const child of [...app.stage.children]) {
      if (child instanceof PIXI.Text) child.destroy();
    }

    // 변환 행렬로 bounds transform (identity → 그대로)
    const mat = Matrix.createMatrix();
    Matrix.identityInto(mat);
    const tb = Bounds.transformInto({ min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }, bounds, mat);

    const w = Bounds.width(tb);
    const h = Bounds.height(tb);

    // 사각형
    gfx.rect(tb.min.x, tb.min.y, w, h).fill({ color: 0x3b82f6, alpha: 0.2 }).stroke({ color: 0x60a5fa, width: 2 });

    // 핸들 8개
    for (const handle of getHandles()) {
      gfx.circle(handle.x, handle.y, HANDLE_R).fill({ color: 0xf8fafc }).stroke({ color: 0x3b82f6, width: 2 });
    }

    // bounds 중심에 치수 표시
    const center = Bounds.centerInto({ x: 0, y: 0 }, bounds);
    const bw = Bounds.width(bounds);
    const bh = Bounds.height(bounds);

    const label = new PIXI.Text({
      text: `${Math.round(bw)} \xd7 ${Math.round(bh)}`,
      style: { fontSize: 14, fill: 0xf8fafc, align: 'center' },
    });
    label.anchor.set(0.5);
    label.x = center.x;
    label.y = center.y;
    app.stage.addChild(label);
  }

  app.stage.on('pointerdown', (e) => {
    const id = hitHandle(e.global.x, e.global.y);
    if (id) {
      dragging = {
        handleId: id,
        startBounds: { min: { ...bounds.min }, max: { ...bounds.max } },
        startPointer: { x: e.global.x, y: e.global.y },
      };
    }
  });

  app.stage.on('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.global.x - dragging.startPointer.x;
    const dy = e.global.y - dragging.startPointer.y;
    const sb = dragging.startBounds;
    const id = dragging.handleId;

    // 핸들별 bounds 직접 갱신 (단순 drag 매핑)
    const next = { min: { ...sb.min }, max: { ...sb.max } };
    if (id.includes('w')) next.min.x = sb.min.x + dx;
    if (id.includes('e')) next.max.x = sb.max.x + dx;
    if (id.includes('n')) next.min.y = sb.min.y + dy;
    if (id.includes('s')) next.max.y = sb.max.y + dy;

    // constrainResize로 최소 크기 보장 (50×50)
    const currentSize = {
      width: sb.max.x - sb.min.x,
      height: sb.max.y - sb.min.y,
    };
    const proposedSize = {
      width: next.max.x - next.min.x,
      height: next.max.y - next.min.y,
    };
    const constrained = EditorGeometry.constrainResize(currentSize, proposedSize, { minWidth: 50, minHeight: 50 });

    // constrained 결과를 bounds에 반영
    if (id.includes('e')) next.max.x = next.min.x + constrained.width;
    if (id.includes('w')) next.min.x = next.max.x - constrained.width;
    if (id.includes('s')) next.max.y = next.min.y + constrained.height;
    if (id.includes('n')) next.min.y = next.max.y - constrained.height;

    bounds.min.x = next.min.x;
    bounds.min.y = next.min.y;
    bounds.max.x = next.max.x;
    bounds.max.y = next.max.y;
    draw();
  });

  app.stage.on('pointerup', () => {
    dragging = null;
  });
  app.stage.on('pointerupoutside', () => {
    dragging = null;
  });

  draw();
  return () => gfx.destroy();
}
