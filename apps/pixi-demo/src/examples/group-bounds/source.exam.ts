/**
 * Group Bounds
 *
 * 화면에 흩어진 도형 묶음(고정 4개 + draggable 1개)을 두고, draggable box 1개를 끌면
 * groupBounds가 전체를 한 번에 감싸는 최소 AABB(selection bounding box)를 다시 계산한다.
 * 에디터에서 여러 도형을 선택한 채 그중 하나를 옮기면 다중 선택 핸들 박스가 전체를 다시
 * 감싸도록 갱신되는 작업 흐름을 보인다.
 *
 * - EditorGeometry.groupBounds: bounds 배열 전체를 감싸는 최소 union AABB를 한 호출로 계산한다.
 *   drag 시에만 1회 호출하는 단발 결과라 allocating companion을 쓴다(프레임당 할당 없음).
 *   어느 box가 selection box 경계를 정하는지(extremal)는 box 좌표와 group 좌표를 inline 비교한
 *   같은 group 관계의 분해 표시다.
 */

import * as EditorGeometry from '@cp949/vectra/editor-geometry';

type XY = { x: number; y: number };
type Box = { min: XY; max: XY };

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

  // selection 멤버. 모두 valid box(min < max)라 inverted(min>max) 경로는 미발생(주석만).
  // 마지막 box가 사용자가 끄는 유일한 주 대상이고 나머지 4개는 selection의 고정 멤버다.
  const boxes: Box[] = [
    { min: { x: 110, y: 90 }, max: { x: 200, y: 162 } },
    { min: { x: 300, y: 66 }, max: { x: 384, y: 128 } },
    { min: { x: 470, y: 150 }, max: { x: 562, y: 262 } },
    { min: { x: 168, y: 268 }, max: { x: 252, y: 348 } },
    { min: { x: 352, y: 206 }, max: { x: 440, y: 292 } }, // draggable
  ];
  const DRAG_INDEX = boxes.length - 1;

  // group AABB 결과 buffer. drag 시에만 groupBounds로 다시 채운다.
  let group: Box = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };

  // selection 전체를 감싸는 최소 AABB를 한 배열 호출로 계산한다.
  // 빈 입력/length<1이면 undefined지만 고정 5개라 미발생 → if(b) 가드만 둔다.
  const recompute = (): void => {
    const b = EditorGeometry.groupBounds(boxes);
    if (b) group = b;
  };
  recompute();

  let grabbed = false;
  let grabDx = 0;
  let grabDy = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    const d = boxes[DRAG_INDEX];
    // draggable box 안을 눌렀을 때만 grab. grab 지점과 box min의 offset을 기억한다.
    if (p.x >= d.min.x && p.x <= d.max.x && p.y >= d.min.y && p.y <= d.max.y) {
      grabbed = true;
      grabDx = p.x - d.min.x;
      grabDy = p.y - d.min.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    const d = boxes[DRAG_INDEX];
    const w = d.max.x - d.min.x;
    const h = d.max.y - d.min.y;
    // box 크기는 유지하고 위치만 이동. 화면 안으로 clamp해 좌표가 항상 finite다(NaN/Infinity 미발생).
    const nx = Math.max(0, Math.min(size.width - w, p.x - grabDx));
    const ny = Math.max(0, Math.min(size.height - h, p.y - grabDy));
    d.min.x = nx;
    d.min.y = ny;
    d.max.x = nx + w;
    d.max.y = ny + h;
    // 도형이 움직였을 때만 group AABB를 다시 계산한다(hot path 아님).
    recompute();
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(0).padStart(4);

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    const gw = group.max.x - group.min.x;
    const gh = group.max.y - group.min.y;

    // selection box(group AABB) 채움 + 외곽선. 단일 groupBounds 출력을 그대로 그린다.
    g.rect(group.min.x, group.min.y, gw, gh).fill({ color: 0x172554, alpha: 0.45 });
    g.rect(group.min.x, group.min.y, gw, gh).stroke({ color: 0x60a5fa, width: 1.5 });

    // 각 멤버 box를 그린다.
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      // extremal: 이 box가 group AABB 네 변 중 하나라도 정하는가. 같은 group 관계의 inline 분해다.
      const pinsEdge =
        b.min.x === group.min.x || b.max.x === group.max.x || b.min.y === group.min.y || b.max.y === group.max.y;
      const isDrag = i === DRAG_INDEX;
      // 경계를 정하는 box는 밝게, 안쪽에만 있는 box는 어둡게(selection box 결정 요인 표시).
      const fill = isDrag ? 0xfbbf24 : pinsEdge ? 0x38bdf8 : 0x334155;
      g.rect(b.min.x, b.min.y, b.max.x - b.min.x, b.max.y - b.min.y)
        .fill({ color: fill, alpha: isDrag ? 0.9 : 0.8 })
        .stroke({ color: 0xe2e8f0, width: isDrag ? 2 : 1, alpha: isDrag ? 0.9 : 0.4 });
    }

    // selection handle: group AABB 네 모서리 작은 사각형(에디터 선택 박스 느낌, 출력의 렌더일 뿐).
    const HS = 5;
    const corners: XY[] = [
      { x: group.min.x, y: group.min.y },
      { x: group.max.x, y: group.min.y },
      { x: group.max.x, y: group.max.y },
      { x: group.min.x, y: group.max.y },
    ];
    for (const c of corners) {
      g.rect(c.x - HS, c.y - HS, HS * 2, HS * 2).fill({ color: 0xe2e8f0 });
    }

    label.text = [
      `items : ${boxes.length}        drag amber box`,
      `width : ${fmt(gw)} px`,
      `height: ${fmt(gh)} px`,
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
