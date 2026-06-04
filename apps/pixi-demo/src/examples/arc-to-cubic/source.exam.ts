/**
 * Arc To Cubic
 *
 * 화면 중앙 고정 원호의 끝 handle을 center 둘레로 drag하면 sweep이 커지고, 그 호를 cubic Bezier
 * curve 목록으로 근사한 결과가 실시간으로 갱신된다. sweep이 90°를 넘을 때마다 cubic segment가
 * 하나씩 늘어, 원호는 cubic 1개로 정확히 표현되지 않으므로 ≤90° 조각으로 나눠 근사한다는 점을
 * 드러낸다.
 *
 * - Curves.arcToCubicInto: center form arc를 maxAngle(기본 π/2) 이하 segment로 나눠 각 segment를
 *   cubic Bezier(p0, p1, p2, p3)로 근사해 out 배열에 기록한다(중심 관계).
 * - Curves.arcSampleInto: 같은 호를 dense polyline으로 샘플해 근사 곡선 아래 참조선으로 깔아
 *   근사 정확도를 보인다.
 * - Angles.radToDeg: sweep과 분할당 각을 degree로 표시한다.
 */

import * as Angles from '@cp949/vectra/angle';
import * as Curves from '@cp949/vectra/curve';

type XY = { x: number; y: number };
type Cubic = { p0: XY; p1: XY; p2: XY; p3: XY };

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

  // 원호 중심은 화면 중앙 고정, rx === ry 라 원형 호, 기울기 없음, 시작각 0 고정
  const cx = size.width / 2;
  const cy = size.height / 2;
  const radius = 140;
  const startAngle = 0;
  // 끝각(주 drag 결과). 초기 sweep은 약 200° 라 segment 3개 상태로 시작
  let endAngle = (200 * Math.PI) / 180;

  // arcToCubicInto/arcPointAtTInto는 endAngle - startAngle 로 방향·크기를 직접 계산하고
  // sweep boolean 은 무시한다. 타입 요구 때문에 값만 채운다(계산에 영향 없음).
  const arc = {
    cx,
    cy,
    rx: radius,
    ry: radius,
    xRotation: 0,
    startAngle,
    endAngle,
    sweep: true,
  };

  // ticker hot path: 매 프레임 다시 계산하므로 out 배열 1개씩 재사용해 프레임당 재할당을 피한다
  const cubicsOut: Cubic[] = [];
  const arcPointsOut: XY[] = [];

  // 끝 handle 화면 좌표 (호 끝점). startAngle 이 0 이라 endAngle 위치의 원 위 점
  const handleX = (): number => cx + radius * Math.cos(endAngle);
  const handleY = (): number => cy + radius * Math.sin(endAngle);

  const HIT_RADIUS = 22;
  let grabbed = false;
  // 직전 프레임의 raw 각도. delta 를 unwrap 누적해 sweep 을 360° 너머로도 키운다
  let lastRaw = endAngle;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(handleX() - p.x, handleY() - p.y) <= HIT_RADIUS;
    // 잡는 순간 기준 raw 각도를 맞춰 첫 delta 점프를 막는다
    if (grabbed) lastRaw = Math.atan2(p.y - cy, p.x - cx);
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    const raw = Math.atan2(p.y - cy, p.x - cx);
    // 프레임 간 각도 차이를 (-π, π] 로 unwrap 해 누적 (atan2 의 ±π 경계 점프 제거)
    let delta = raw - lastRaw;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    else if (delta < -Math.PI) delta += 2 * Math.PI;
    lastRaw = raw;
    // sweep 을 0.02~2π 로 clamp: 0 이면 빈 배열, 2π 초과면 한 바퀴 넘어 자기 겹침
    endAngle = Math.max(0.02, Math.min(2 * Math.PI, endAngle + delta));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    arc.endAngle = endAngle;

    // 핵심 호출: 호를 ≤maxAngle(기본 π/2) cubic Bezier 목록으로 근사
    Curves.arcToCubicInto(cubicsOut, arc);
    // 참조용 true arc: dense polyline 으로 같은 호를 샘플
    Curves.arcSampleInto(arcPointsOut, arc, 96);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // center 점
    g.circle(cx, cy, 3).fill({ color: 0x64748b });

    // 참조 true arc (faint 굵은 회색): 근사 곡선이 거의 겹쳐 정확도를 보인다
    for (let i = 0; i < arcPointsOut.length; i++) {
      const pt = arcPointsOut[i];
      if (i === 0) g.moveTo(pt.x, pt.y);
      else g.lineTo(pt.x, pt.y);
    }
    g.stroke({ color: 0x475569, width: 6, alpha: 0.6 });

    // cubic 근사 곡선 (밝은 청록): 각 segment 를 bezierCurveTo 로 그린다
    for (let i = 0; i < cubicsOut.length; i++) {
      const c = cubicsOut[i];
      g.moveTo(c.p0.x, c.p0.y).bezierCurveTo(c.p1.x, c.p1.y, c.p2.x, c.p2.y, c.p3.x, c.p3.y);
    }
    g.stroke({ color: 0x22d3ee, width: 2 });

    // segment 구조: control handle 선(p0-p1, p2-p3), control point(p1/p2), junction(p0/p3)
    for (let i = 0; i < cubicsOut.length; i++) {
      const c = cubicsOut[i];
      g.moveTo(c.p0.x, c.p0.y).lineTo(c.p1.x, c.p1.y).stroke({ color: 0xf59e0b, width: 1, alpha: 0.7 });
      g.moveTo(c.p3.x, c.p3.y).lineTo(c.p2.x, c.p2.y).stroke({ color: 0xf59e0b, width: 1, alpha: 0.7 });
      g.circle(c.p1.x, c.p1.y, 3).fill({ color: 0xf59e0b });
      g.circle(c.p2.x, c.p2.y, 3).fill({ color: 0xf59e0b });
      // junction(segment 경계)은 흰 점으로 강조 — sweep 90° 마다 하나씩 늘어난다
      g.circle(c.p0.x, c.p0.y, 4).fill({ color: 0xe2e8f0 });
    }
    // 마지막 segment 끝 junction
    const last = cubicsOut[cubicsOut.length - 1];
    if (last) g.circle(last.p3.x, last.p3.y, 4).fill({ color: 0xe2e8f0 });

    // 끝 handle (주 대상)
    g.circle(handleX(), handleY(), grabbed ? 9 : 7).fill({ color: 0x4ade80 });

    const sweepDeg = Angles.radToDeg(endAngle - startAngle);
    const segCount = cubicsOut.length;
    label.text = [
      `sweep   : ${sweepDeg.toFixed(1)} deg`,
      `segments: ${segCount}`,
      `per seg : ${(sweepDeg / segCount).toFixed(1)} deg  (<= 90)`,
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
