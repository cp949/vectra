/**
 * Circle Circle Overlap
 *
 * 화면 고정 circle A와 draggable circle B를 두고, B를 drag하면 두 원반(disk)이 겹치는지 매 프레임
 * 판정한다. 겹치면 두 원과 center↔center 연결선이 hit 색으로, 떨어지면 clear 색으로 바뀌어
 * "두 원이 충돌(겹침)하는가?"라는 collision / hit-test 작업 흐름을 보인다. 연결선 길이(centerDist)와
 * 두 반지름 합(sumRadii)을 함께 표시해 `centerDist ≤ rA+rB`라는 판정 식 자체를 드러낸다.
 *
 * - Intersects.intersectsCircleCircle: 두 circle이 겹치거나 접하면 true를 반환한다. centerDist² ≤
 *   (rA+rB)²로 판정하는 closed disk overlap 검사다. 한 원이 다른 원을 완전히 포함해도 true이며
 *   (경계 교차가 아니라 disk 겹침 판정), 외접(접점)도 true다. radius ≤ 0이면 false. boolean을 직접
 *   반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Circle = { center: XY; radius: number };

const CLEAR_COLOR = 0x60a5fa; // 안 겹침: 파랑
const HIT_COLOR = 0xf87171; // 겹침: 빨강
const EDGE_COLOR = 0xfbbf24; // 외접(경계) 근처: 노랑
const M = 16; // 화면 가장자리 margin (px)
const EDGE_EPS = 1.5; // |centerDist - sumRadii| 이내면 외접 경계로 본다 (px, 표시용)

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

  // circle A: 화면 고정 (조작 대상 아님)
  const circleA: Circle = { center: { x: 275, y: 220 }, radius: 95 };
  // circle B: 주 drag 대상. center만 옮기고 radius는 고정
  const circleB: Circle = { center: { x: 480, y: 215 }, radius: 70 };

  let grabbed = false;
  let grabDX = 0; // pointer와 circleB.center의 오프셋 (drag 중 유지)
  let grabDY = 0;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // circle B 안쪽(disk)을 누르면 잡는다
    const dx = p.x - circleB.center.x;
    const dy = p.y - circleB.center.y;
    grabbed = dx * dx + dy * dy <= circleB.radius * circleB.radius;
    if (grabbed) {
      grabDX = p.x - circleB.center.x;
      grabDY = p.y - circleB.center.y;
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    const r = circleB.radius;
    // center B를 화면 안으로 clamp → 항상 finite 입력 (NaN/Infinity 회피)
    circleB.center.x = Math.max(M + r, Math.min(size.width - M - r, p.x - grabDX));
    circleB.center.y = Math.max(M + r, Math.min(size.height - M - r, p.y - grabDY));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 원 하나를 옅은 채움 + 외곽선으로 그린다
  const drawCircle = (c: Circle, color: number, lineW: number): void => {
    g.circle(c.center.x, c.center.y, c.radius).fill({ color, alpha: 0.16 }).stroke({ color, width: lineW });
    g.circle(c.center.x, c.center.y, 3).fill({ color }); // center dot
  };

  const fmt = (n: number): string => n.toFixed(0).padStart(4);

  const render = (): void => {
    // 핵심 호출: 두 원반이 겹치거나 접하면 true (closed disk overlap)
    const overlap = Intersects.intersectsCircleCircle(circleA, circleB);

    // 판정 식의 두 항을 표시용으로 inline 계산한다 (별도 domain import 없이 같은 비교를 분해)
    const dx = circleB.center.x - circleA.center.x;
    const dy = circleB.center.y - circleA.center.y;
    const centerDist = Math.hypot(dx, dy);
    const sumRadii = circleA.radius + circleB.radius;
    // 외접(centerDist ≈ sumRadii) 경계는 따로 노랑으로 강조한다 (접점도 overlap=true인 경계 상태)
    const onEdge = Math.abs(centerDist - sumRadii) <= EDGE_EPS;
    const stateColor = onEdge ? EDGE_COLOR : overlap ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // center↔center 연결선: 길이가 centerDist, 색이 판정 상태
    g.moveTo(circleA.center.x, circleA.center.y)
      .lineTo(circleB.center.x, circleB.center.y)
      .stroke({ color: stateColor, width: 2, alpha: 0.9 });

    // 두 원을 같은 상태 색으로 칠한다 (겹침 여부가 색으로 드러남)
    drawCircle(circleA, stateColor, 2);
    drawCircle(circleB, stateColor, grabbed ? 3 : 2);

    label.text = [
      `overlap   : ${overlap ? 'yes' : 'no '}   drag circle B`,
      `centerDist: ${fmt(centerDist)}`,
      `sumRadii  : ${fmt(sumRadii)}`,
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
