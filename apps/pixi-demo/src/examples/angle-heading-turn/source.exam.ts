/**
 * Angle Heading Turn
 *
 * 중심에서 pointer 방향으로 회전하는 세 화살표가 같은 시작 각도에서 출발해 서로 다른 방식으로
 * 목표 heading을 추적한다. pointer를 중심 뒤쪽(±π 경계)으로 넘기면 naive 보간 화살표가 먼 길로
 * 한 바퀴 도는 동안 shortest 화살표는 최단 호로 따라간다.
 *
 * - Angles.fromVector: pointer 방향 벡터에서 목표 heading 추출
 * - Angles.shortestLerpAngle: [-π, π) wrap을 적용한 최단 호 보간 (cyan)
 * - Angles.lerpAngle: wrap 없는 단순 선형 보간, 경계에서 long-way 회전 (pink)
 * - Angles.moveTowardAngle: 고정 회전율로 목표를 향해 회전 (green)
 * - Angles.toUnitVectorInto: 각 facing을 화살표 끝점 단위벡터로 변환
 * - Angles.angleDelta / directedAngleDelta / turnDirection: 남은 호·raw 델타·회전 방향 라벨
 */

import * as Angles from '@cp949/vectra/angle';

const ARROW_LEN = 150;
const SMOOTH = 0.08;
const MAX_TURN = 0.04;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const canvas = app.canvas as HTMLCanvasElement;
  const W = app.screen.width;
  const H = app.screen.height;
  const cx = W / 2;
  const cy = H / 2;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // 세 마커는 같은 시작 facing에서 출발한다
  let shortestFacing = 0;
  let naiveFacing = 0;
  let moveTowardFacing = 0;

  const pointer = { x: cx + 160, y: cy };

  const onPointerMove = (e: PointerEvent): void => {
    // canvas CSS 크기가 screen 크기(W,H)와 다를 수 있어 비율로 보정한다
    const rect = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) * (W / rect.width);
    pointer.y = (e.clientY - rect.top) * (H / rect.height);
  };
  canvas.addEventListener('pointermove', onPointerMove);

  // 화살표 끝점 단위벡터 buffer (매 프레임 재기록 hot path)
  const tip = { x: 0, y: 0 };

  const drawArrow = (facing: number, color: number): void => {
    Angles.toUnitVectorInto(tip, facing);
    const ex = cx + tip.x * ARROW_LEN;
    const ey = cy + tip.y * ARROW_LEN;
    // 화살촉 좌우 날개를 위해 수직 벡터(-ny, nx) 사용
    const wx = -tip.y;
    const wy = tip.x;
    g.moveTo(cx, cy).lineTo(ex, ey).stroke({ color, width: 3, alpha: 0.95 });
    g.moveTo(ex, ey)
      .lineTo(ex - tip.x * 16 + wx * 8, ey - tip.y * 16 + wy * 8)
      .lineTo(ex - tip.x * 16 - wx * 8, ey - tip.y * 16 - wy * 8)
      .closePath()
      .fill({ color });
  };

  const fmt = (rad: number): string => Angles.radToDeg(rad).toFixed(1).padStart(7);

  const render = (): void => {
    // deltaTime은 프레임 단위(60fps에서 ≈1.0). 탭 복귀 시 dt 폭주를 막기 위해 clamp.
    const dt = Math.min(app.ticker.deltaTime, 2);
    g.clear();

    const target = Angles.fromVector({ x: pointer.x - cx, y: pointer.y - cy });

    shortestFacing = Angles.shortestLerpAngle(shortestFacing, target, SMOOTH * dt);
    naiveFacing = Angles.lerpAngle(naiveFacing, target, SMOOTH * dt);
    moveTowardFacing = Angles.moveTowardAngle(moveTowardFacing, target, MAX_TURN * dt);

    // 표시용 facing을 [-π, π)로 정규화 (naive는 누적으로 범위를 벗어날 수 있음)
    shortestFacing = Angles.wrapRadians(shortestFacing);
    naiveFacing = Angles.wrapRadians(naiveFacing);
    moveTowardFacing = Angles.wrapRadians(moveTowardFacing);

    // 기준 원과 중심
    g.circle(cx, cy, ARROW_LEN).stroke({ color: 0x334155, width: 1 });
    g.circle(cx, cy, 4).fill({ color: 0x94a3b8 });

    // 목표 heading 점선 보조선 (pointer 방향)
    Angles.toUnitVectorInto(tip, target);
    g.moveTo(cx, cy)
      .lineTo(cx + tip.x * ARROW_LEN, cy + tip.y * ARROW_LEN)
      .stroke({ color: 0x64748b, width: 1, alpha: 0.6 });

    drawArrow(moveTowardFacing, 0x4ade80);
    drawArrow(naiveFacing, 0xf472b6);
    drawArrow(shortestFacing, 0x7dd3fc);

    // pointer 마커
    g.circle(pointer.x, pointer.y, 6).fill({ color: 0xfbbf24 });

    const dir = Angles.turnDirection(shortestFacing, target);
    const dirLabel = dir === 1 ? 'CCW(+1)' : dir === -1 ? 'CW(-1)' : 'straight(0)';
    label.text = [
      `target heading   : ${fmt(target)}°`,
      `shortest (cyan)  : ${fmt(shortestFacing)}°  remaining ${fmt(Angles.angleDelta(shortestFacing, target))}°`,
      `naive    (pink)  : ${fmt(naiveFacing)}°  raw      ${fmt(Angles.directedAngleDelta(naiveFacing, target))}°`,
      `moveTo   (green) : ${fmt(moveTowardFacing)}°  (fixed turn rate)`,
      `turnDirection    : ${dirLabel}`,
    ].join('\n');
  };

  app.ticker.add(render);

  return () => {
    app.ticker.remove(render);
    canvas.removeEventListener('pointermove', onPointerMove);
    label.destroy();
    g.destroy();
  };
}
