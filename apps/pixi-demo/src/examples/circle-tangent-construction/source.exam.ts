/**
 * Circle Tangent Construction
 *
 * 좌측은 원 하나와 드래그 가능한 외부 점에서 접선 2개와 접점을 작도한다. 점을 원 안으로
 * 끌면 접선이 사라진다. 우측은 드래그 가능한 두 원의 공통접선(outer/inner)을 작도한다.
 * 두 원이 겹치면 inner가, 한 원이 다른 원을 포함하면 outer가 사라진다.
 *
 * - Circles.tangentPointsFromExternalInto: 외부 점에서 원까지의 접점 2개 계산 (점이 원 안이면 0개)
 * - Circles.tangentAnglesInto: 두 원의 공통접선 각도 계산 (outer 기본, inner는 inner=true)
 * - Circles.pointAtAngleInto: 접선 각도로부터 각 원 위의 접점 좌표 계산
 */

import * as Circles from '@cp949/vectra/circle';

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // 좌 패널: 고정 원 + 드래그 가능한 외부 점
  const fromCircle = { center: { x: 180, y: 240 }, radius: 70 };
  const external = { x: 320, y: 120 };

  // 우 패널: 드래그 가능한 두 원
  const circleA = { center: { x: 480, y: 180 }, radius: 55 };
  const circleB = { center: { x: 620, y: 300 }, radius: 35 };

  // 출력 buffer (매 프레임 재기록 hot path)
  const externalTangents: { x: number; y: number }[] = [];
  const outerAngles: number[] = [];
  const innerAngles: number[] = [];
  const touchA = { x: 0, y: 0 };
  const touchB = { x: 0, y: 0 };

  const HIT_TOLERANCE = 18;

  // 드래그 핸들: 외부 점과 두 원 center
  const handles = [external, circleA.center, circleB.center];
  let grabbed: { x: number; y: number } | undefined;

  const getCanvasXY = (e: PointerEvent): { x: number; y: number } => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const { x, y } = getCanvasXY(e);
    for (const h of handles) {
      if (Math.hypot(h.x - x, h.y - y) < HIT_TOLERANCE) {
        grabbed = h;
        return;
      }
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const { x, y } = getCanvasXY(e);
    grabbed.x = Math.max(20, Math.min(700, x));
    grabbed.y = Math.max(20, Math.min(420, y));
  };

  const onPointerUp = (): void => {
    grabbed = undefined;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  // 한 접선 각도로 두 원 위 접점을 잇는 공통접선을 그린다.
  // outer는 두 원 모두 같은 각도, inner는 circleB가 반대편(θ + π) 접점이다.
  const drawCommonTangents = (angles: number[], color: number, inner: boolean): void => {
    for (const angle of angles) {
      Circles.pointAtAngleInto(touchA, circleA, angle);
      Circles.pointAtAngleInto(touchB, circleB, inner ? angle + Math.PI : angle);
      g.moveTo(touchA.x, touchA.y).lineTo(touchB.x, touchB.y).stroke({ color, width: 1.5 });
      g.circle(touchA.x, touchA.y, 4).fill(color);
      g.circle(touchB.x, touchB.y, 4).fill(color);
    }
  };

  const render = (): void => {
    Circles.tangentPointsFromExternalInto(externalTangents, fromCircle, external);
    Circles.tangentAnglesInto(outerAngles, circleA, circleB, false);
    Circles.tangentAnglesInto(innerAngles, circleA, circleB, true);

    g.clear();

    // 좌 패널: 원 + 외부 점 접선
    g.circle(fromCircle.center.x, fromCircle.center.y, fromCircle.radius).stroke({ color: 0x64748b, width: 2 });
    for (const t of externalTangents) {
      g.moveTo(external.x, external.y).lineTo(t.x, t.y).stroke({ color: 0xfacc15, width: 1.5 });
      g.circle(t.x, t.y, 4).fill(0xfacc15);
    }
    g.circle(external.x, external.y, 6).fill(0xf472b6);

    // 우 패널: 두 원 + 공통접선
    g.circle(circleA.center.x, circleA.center.y, circleA.radius).stroke({ color: 0x64748b, width: 2 });
    g.circle(circleB.center.x, circleB.center.y, circleB.radius).stroke({ color: 0x64748b, width: 2 });
    drawCommonTangents(outerAngles, 0x38bdf8, false);
    drawCommonTangents(innerAngles, 0x4ade80, true);
    g.circle(circleA.center.x, circleA.center.y, 6).fill(0xf472b6);
    g.circle(circleB.center.x, circleB.center.y, 6).fill(0xf472b6);

    const leftMsg =
      externalTangents.length > 0 ? `외부 점 접선 ${externalTangents.length}개` : '점이 원 안 — 접선 없음';
    const rightMsg = `outer ${outerAngles.length} / inner ${innerAngles.length} — 분홍 점을 드래그`;
    label.text = `${leftMsg}   |   ${rightMsg}`;
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
