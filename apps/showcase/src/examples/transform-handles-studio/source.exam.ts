import * as Bounds from '@cp949/vectra/bounds';
import * as EditorGeometry from '@cp949/vectra/editor-geometry';
import * as Matrix from '@cp949/vectra/matrix';
import * as PIXI from 'pixi.js';

type HandlePoint = Parameters<typeof EditorGeometry.resizeHandlesInto>[0][number];
type Runtime = {
  app: PIXI.Application;
  size: { width: number; height: number };
  pointer: { x: number; y: number };
};

export async function setup({ app, size, pointer }: Runtime) {
  // 초기 bounds (화면 중앙 사각형)
  const bounds = {
    minX: size.width * 0.25,
    minY: size.height * 0.25,
    maxX: size.width * 0.75,
    maxY: size.height * 0.75,
  };

  const HANDLE_R = 8;

  // 현재 너비/높이 (constrainResize 입력으로 사용)
  function currentWH() {
    return {
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
    };
  }

  let dragging: {
    handleId: HandlePoint['id'];
    startBounds: typeof bounds;
    startPointer: { x: number; y: number };
  } | null = null;

  const gfx = new PIXI.Graphics();
  app.stage.addChild(gfx);
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  function getHandles() {
    const handles: HandlePoint[] = [];
    EditorGeometry.resizeHandlesInto(handles, bounds, () => ({ x: 0, y: 0 }));
    return handles;
  }

  function hitHandle(x: number, y: number): HandlePoint['id'] | null {
    for (const h of getHandles()) {
      const dx = h.point.x - x;
      const dy = h.point.y - y;
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
    const tb = Bounds.transformInto(Bounds.createBounds(), bounds, mat);

    const w = Bounds.width(tb);
    const h = Bounds.height(tb);

    // 사각형
    gfx.rect(tb.minX, tb.minY, w, h).fill({ color: 0x3b82f6, alpha: 0.2 }).stroke({ color: 0x60a5fa, width: 2 });

    // 핸들 8개
    for (const handle of getHandles()) {
      gfx
        .circle(handle.point.x, handle.point.y, HANDLE_R)
        .fill({ color: 0xf8fafc })
        .stroke({ color: 0x3b82f6, width: 2 });
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
        startBounds: { ...bounds },
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
    const next = { ...sb };
    if (id.includes('w')) next.minX = sb.minX + dx;
    if (id.includes('e')) next.maxX = sb.maxX + dx;
    if (id.includes('n')) next.minY = sb.minY + dy;
    if (id.includes('s')) next.maxY = sb.maxY + dy;

    // constrainResize로 최소 크기 보장 (50×50)
    const currentSize = {
      width: sb.maxX - sb.minX,
      height: sb.maxY - sb.minY,
    };
    const proposedSize = {
      width: next.maxX - next.minX,
      height: next.maxY - next.minY,
    };
    const constrained = EditorGeometry.constrainResize(currentSize, proposedSize, {
      aspectLocked: false,
      minWidth: 50,
      minHeight: 50,
      maxWidth: Infinity,
      maxHeight: Infinity,
    });

    // constrained 결과를 bounds에 반영
    if (id.includes('e')) next.maxX = next.minX + constrained.width;
    if (id.includes('w')) next.minX = next.maxX - constrained.width;
    if (id.includes('s')) next.maxY = next.minY + constrained.height;
    if (id.includes('n')) next.minY = next.maxY - constrained.height;

    bounds.minX = next.minX;
    bounds.minY = next.minY;
    bounds.maxX = next.maxX;
    bounds.maxY = next.maxY;
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
