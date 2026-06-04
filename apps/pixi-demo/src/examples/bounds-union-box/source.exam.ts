/**
 * Bounds Union Box
 *
 * 화면 고정 box A와 draggable box B를 두고, box B를 drag하면 두 box를 모두 감싸는 최소 합집합
 * AABB가 매 프레임 갱신된다. 합집합 box의 네 변은 각각 A 또는 B의 좌표에서 오며(componentwise
 * min/max), 변 색으로 어느 box가 그 변을 결정했는지 보인다. B를 A 안으로 완전히 넣으면 합집합은
 * A와 같아지고 B는 어느 변에도 기여하지 않는다(가시 상태이지 두 번째 관계가 아니다).
 *
 * - Bounds.expandToIncludeBoundsInto: box A와 B를 모두 포함하는 최소 AABB를 out buffer에 기록한다.
 *   min은 두 box min의 성분별 최소, max는 성분별 최대다. allocating companion이 없어 *Into를 쓰고
 *   ticker render hot path에서 out buffer 1개를 재사용한다(out === input aliasing 안전).
 */

import * as Bounds from '@cp949/vectra/bounds';

type XY = { x: number; y: number };
type Box = { min: XY; max: XY };

const A_COLOR = 0x60a5fa; // box A 색 (고정)
const B_COLOR = 0xf472b6; // box B 색 (draggable)
const M = 16; // 화면 가장자리 margin (px)

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

  // box A: 화면 고정 AABB (조작 대상 아님). min<max로 항상 valid하게 둔다
  const boxA: Box = { min: { x: 170, y: 150 }, max: { x: 360, y: 300 } };

  // box B: 주 drag 대상. 크기는 고정하고 위치(min)만 옮긴다
  const BW = 160;
  const BH = 110;
  const boxB: Box = { min: { x: 430, y: 240 }, max: { x: 430 + BW, y: 240 + BH } };

  // 합집합 결과 buffer. 매 프레임 같은 object에 재기록한다 (allocating companion 없음)
  const unionOut: Box = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };

  let grabbed = false;
  let grabDX = 0; // pointer와 boxB.min의 x 오프셋 (drag 중 유지)
  let grabDY = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // box B 내부를 누르면 잡는다
    grabbed = p.x >= boxB.min.x && p.x <= boxB.max.x && p.y >= boxB.min.y && p.y <= boxB.max.y;
    if (grabbed) {
      grabDX = p.x - boxB.min.x;
      grabDY = p.y - boxB.min.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // box B를 화면 안으로 clamp (min<max 유지 → inverted bounds degenerate 회피)
    const minX = Math.max(M, Math.min(size.width - M - BW, p.x - grabDX));
    const minY = Math.max(M, Math.min(size.height - M - BH, p.y - grabDY));
    boxB.min.x = minX;
    boxB.min.y = minY;
    boxB.max.x = minX + BW;
    boxB.max.y = minY + BH;
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 옅은 채움 + 외곽선으로 입력 box를 그린다
  const drawBox = (box: Box, color: number, alpha: number, lineW: number): void => {
    const w = box.max.x - box.min.x;
    const h = box.max.y - box.min.y;
    g.rect(box.min.x, box.min.y, w, h)
      .fill({ color, alpha: alpha * 0.18 })
      .stroke({ color, width: lineW, alpha });
  };

  // 합집합의 한 변을 owner box 색으로 그린다 (componentwise min/max 분해를 시각화)
  const drawEdge = (x1: number, y1: number, x2: number, y2: number, owner: number): void => {
    g.moveTo(x1, y1).lineTo(x2, y2).stroke({ color: owner, width: 3 });
  };

  const fmt = (n: number): string => n.toFixed(0).padStart(4);

  const render = (): void => {
    // 핵심 호출: A와 B를 모두 포함하는 최소 AABB. min=성분별 min, max=성분별 max
    Bounds.expandToIncludeBoundsInto(unionOut, boxA, boxB);

    // 각 union 극값을 어느 box가 결정했는지 판정. 함수와 같은 비교를 써서 tie 처리까지 맞춘다
    // (min: b<o ? A : B, max: b>o ? A : B → 동일 좌표면 둘 다 B(other)를 택함)
    const ownerMinX = boxA.min.x < boxB.min.x ? A_COLOR : B_COLOR;
    const ownerMinY = boxA.min.y < boxB.min.y ? A_COLOR : B_COLOR;
    const ownerMaxX = boxA.max.x > boxB.max.x ? A_COLOR : B_COLOR;
    const ownerMaxY = boxA.max.y > boxB.max.y ? A_COLOR : B_COLOR;
    const tag = (c: number): string => (c === A_COLOR ? 'A' : 'B');

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 입력 box A(고정)와 box B(draggable, grab 시 외곽선 강조)
    drawBox(boxA, A_COLOR, 0.85, 1.5);
    drawBox(boxB, B_COLOR, grabbed ? 1 : 0.85, grabbed ? 2.5 : 1.5);

    // 합집합 box: 옅은 기준 외곽선을 깔고, 네 변을 owner 색으로 덧칠한다
    const uw = unionOut.max.x - unionOut.min.x;
    const uh = unionOut.max.y - unionOut.min.y;
    g.rect(unionOut.min.x, unionOut.min.y, uw, uh).stroke({ color: 0x334155, width: 1, alpha: 0.6 });
    // left/right 세로 변, top/bottom 가로 변을 각 owner 색으로
    drawEdge(unionOut.min.x, unionOut.min.y, unionOut.min.x, unionOut.max.y, ownerMinX); // left  (min.x)
    drawEdge(unionOut.max.x, unionOut.min.y, unionOut.max.x, unionOut.max.y, ownerMaxX); // right (max.x)
    drawEdge(unionOut.min.x, unionOut.min.y, unionOut.max.x, unionOut.min.y, ownerMinY); // top   (min.y)
    drawEdge(unionOut.min.x, unionOut.max.y, unionOut.max.x, unionOut.max.y, ownerMaxY); // bottom(max.y)

    label.text = [
      `union: ${fmt(uw)} × ${fmt(uh)}   drag box B`,
      `min  : x<-${tag(ownerMinX)}  y<-${tag(ownerMinY)}`,
      `max  : x<-${tag(ownerMaxX)}  y<-${tag(ownerMaxY)}`,
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
