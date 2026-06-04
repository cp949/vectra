/**
 * Constrain Drag Axis Lock
 *
 * 박스를 drag하면 `axisLock: 'auto'`가 drag 시작 anchor 기준으로 우세 축 하나를 골라 이동을
 * 잠근다. |dx| > |dy|이면 수평(y 고정), 아니면 수직(x 고정)으로 잠겨, 박스가 anchor를 지나는
 * 두 가이드 축 중 하나 위에만 머문다. 드래그 도중 우세 축이 바뀌면 잠금 축도 라이브로 뒤집힌다.
 *
 * - EditorGeometry.constrainDrag: drag 시작 anchor(from)와 proposed 목적지(to)를 받아 우세 축
 *   잠금으로 보정한 박스 origin을 반환한다. 우세 축 판정 기준점이 from이다.
 */

import * as EditorGeometry from '@cp949/vectra/editor-geometry';

type XY = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  const BOX_W = 90;
  const BOX_H = 64;
  const MARGIN = 12;

  // 박스 origin(top-left). 사용자가 끄는 유일한 주 대상
  const box: XY = { x: size.width / 2 - BOX_W / 2, y: size.height / 2 - BOX_H / 2 };
  // drag 시작 anchor. axisLock='auto'의 우세 축 판정 기준점 (드래그 동안 고정)
  const from: XY = { x: box.x, y: box.y };
  // 잠금 적용 전 raw 목적지 (pointer - grabOffset). ghost 박스로 그린다
  const rawTo: XY = { x: box.x, y: box.y };
  // pointerdown 시점 박스 origin과 pointer의 차이 (박스가 튀지 않게)
  const grab: XY = { x: 0, y: 0 };
  let dragging = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const insideBox = (p: XY): boolean => p.x >= box.x && p.x <= box.x + BOX_W && p.y >= box.y && p.y <= box.y + BOX_H;

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    if (!insideBox(p)) return;
    dragging = true;
    // anchor를 현재 박스 origin으로 고정 → 이후 dx/dy는 이 점 기준으로 측정된다
    from.x = box.x;
    from.y = box.y;
    grab.x = p.x - box.x;
    grab.y = p.y - box.y;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!dragging) return;
    const p = getCanvasXY(e);
    // raw 목적지. 영역 클램프 옵션은 별개 관계라 쓰지 않고, 화면 밖 방지용 margin clamp만 한다(표현용)
    rawTo.x = Math.max(MARGIN, Math.min(size.width - MARGIN - BOX_W, p.x - grab.x));
    rawTo.y = Math.max(MARGIN, Math.min(size.height - MARGIN - BOX_H, p.y - grab.y));
    // 핵심 호출: 우세 축 잠금으로 보정한 박스 origin (allocating, pointermove당 1회 단발)
    const next = EditorGeometry.constrainDrag(from, rawTo, { axisLock: 'auto' });
    box.x = next.x;
    box.y = next.y;
  };

  const onPointerUp = (): void => {
    dragging = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(0).padStart(6);

  const render = (): void => {
    // dx/dy는 anchor(from) 기준 raw 목적지 변위. |dx|>|dy|이면 수평 잠금
    const dx = rawTo.x - from.x;
    const dy = rawTo.y - from.y;
    // axisLock='auto' 판정 재현: dx===dy===0이면 잠금 없음, dx>dy이면 수평, 아니면(동률 포함) 수직
    let lock: 'horizontal' | 'vertical' | 'none' = 'none';
    if (dragging && (dx !== 0 || dy !== 0)) {
      lock = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // anchor 통과 두 가이드 축(수평/수직). 현재 잠긴 축만 밝게 강조한다
    const hActive = lock === 'horizontal';
    const vActive = lock === 'vertical';
    g.moveTo(0, from.y + BOX_H / 2)
      .lineTo(size.width, from.y + BOX_H / 2)
      .stroke({ color: hActive ? 0x38bdf8 : 0x334155, width: hActive ? 2 : 1 });
    g.moveTo(from.x + BOX_W / 2, 0)
      .lineTo(from.x + BOX_W / 2, size.height)
      .stroke({ color: vActive ? 0x38bdf8 : 0x334155, width: vActive ? 2 : 1 });

    // ghost 박스: 잠금 전 raw 목적지. 잠금으로 0이 된 성분을 actual과의 연결선으로 보인다
    if (dragging) {
      g.rect(rawTo.x, rawTo.y, BOX_W, BOX_H).stroke({ color: 0x475569, width: 1, alpha: 0.7 });
      g.moveTo(rawTo.x + BOX_W / 2, rawTo.y + BOX_H / 2)
        .lineTo(box.x + BOX_W / 2, box.y + BOX_H / 2)
        .stroke({ color: 0xf472b6, width: 1, alpha: 0.8 });
    }

    // actual 박스: 잠긴 origin. 잠겨 있으면 한 가이드 축 위에 정확히 놓인다
    g.rect(box.x, box.y, BOX_W, BOX_H).fill({ color: dragging ? 0x4ade80 : 0x64748b });
    g.rect(box.x, box.y, BOX_W, BOX_H).stroke({ color: 0xe2e8f0, width: 1.5 });

    // anchor 점 (drag-start origin = 우세 축 판정 기준)
    g.circle(from.x + BOX_W / 2, from.y + BOX_H / 2, 4).fill({ color: 0xfbbf24 });

    label.text = [
      `lock: ${lock.padStart(10)}   drag the box`,
      `dx  : ${fmt(dx)} px`,
      `dy  : ${fmt(dy)} px   (|dx|>|dy| → horizontal, else vertical)`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointerleave', onPointerUp);
    label.destroy();
    g.destroy();
  };
}
