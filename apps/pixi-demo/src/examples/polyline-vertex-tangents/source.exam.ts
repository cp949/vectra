/**
 * Polyline Vertex Tangents
 *
 * 화면 고정 경로(polyline)에서 apex vertex 1개를 drag하면 각 vertex의 진행 방향(tangent)
 * 화살표가 다시 매끄럽게 정렬된다. "경로를 따라 진행 방향 마커/화살표를 배치"하는 작업 흐름을
 * 보인다.
 *
 * - Polylines.tangents: 각 vertex의 진행 방향(unit tangent)을 새 배열로 반환한다. 내부 vertex는
 *   인접 두 edge unit 방향의 합을 정규화하고, 끝 vertex는 인접 edge 1개 방향을 쓴다. 인접 방향이
 *   정확히 상쇄되면 {0,0}(degenerate)을 돌려 index 정렬을 유지한다.
 */

import * as Polylines from '@cp949/vectra/polyline';

type XY = { x: number; y: number };

// apex(주 drag 대상) vertex index. 나머지 vertex는 고정
const APEX = 2;
// 각 vertex에 그릴 tangent 화살표 길이(px). 고정값(조작 대상 아님)
const ARROW_LEN = 46;
// vertex 잡기 판정 반경(px)
const GRAB_RADIUS = 18;

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

  // 고정 경로. apex(index 2)만 drag로 움직이고 나머지는 고정이라 단일 조작 대상 유지
  // PolylineLike는 XY[]를 그대로 받으므로 points 배열을 그대로 polyline 입력으로 쓴다
  const points: XY[] = [
    { x: 110, y: 320 },
    { x: 250, y: 170 },
    { x: 380, y: 250 }, // apex (초기 위치)
    { x: 510, y: 140 },
    { x: 600, y: 300 },
    { x: 660, y: 200 },
  ];

  // tangent 결과 저장. geometry 계산은 apex drag 시에만 하고 render는 이 배열만 그린다
  let tangents: XY[] = Polylines.tangents(points);

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // apex와의 거리로 잡기 판정 (apex만 잡힌다)
    grabbed = Math.hypot(points[APEX].x - p.x, points[APEX].y - p.y) <= GRAB_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // apex를 화면 안으로 clamp (항상 finite → non-finite pass-through 미발생)
    points[APEX].x = Math.max(12, Math.min(size.width - 12, p.x));
    points[APEX].y = Math.max(56, Math.min(size.height - 12, p.y));
    // 경로가 바뀐 시점에만 tangent 재계산 (drag hot path에서만 vectra 호출)
    tangents = Polylines.tangents(points);
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
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 경로 stroke
    for (let i = 0; i < points.length; i++) {
      if (i === 0) g.moveTo(points[i].x, points[i].y);
      else g.lineTo(points[i].x, points[i].y);
    }
    g.stroke({ color: 0x475569, width: 2.5 });

    // 각 vertex의 tangent 화살표 (핵심 관계: per-vertex 진행 방향)
    for (let i = 0; i < points.length; i++) {
      const v = points[i];
      const t = tangents[i];
      const mag = Math.hypot(t.x, t.y);
      const isApex = i === APEX;

      // mag 0 = degenerate(인접 방향 상쇄). 화살표 없이 warn 점만 찍는다
      if (mag === 0) {
        g.circle(v.x, v.y, 6).fill({ color: 0xf59e0b });
        continue;
      }

      // tangent는 unit 방향이라 고정 길이를 곱해 화살표 끝점을 만든다
      const ex = v.x + t.x * ARROW_LEN;
      const ey = v.y + t.y * ARROW_LEN;
      const color = isApex ? 0x4ade80 : 0x38bdf8;

      g.moveTo(v.x, v.y)
        .lineTo(ex, ey)
        .stroke({ color, width: isApex ? 3 : 2 });

      // 화살촉. tangent 방향에 ±150° 회전한 두 짧은 선
      const ang = Math.atan2(t.y, t.x);
      const head = 9;
      for (const da of [Math.PI * 0.83, -Math.PI * 0.83]) {
        g.moveTo(ex, ey)
          .lineTo(ex + Math.cos(ang + da) * head, ey + Math.sin(ang + da) * head)
          .stroke({ color, width: isApex ? 3 : 2 });
      }

      // vertex 점. apex는 크게 강조
      g.circle(v.x, v.y, isApex ? (grabbed ? 8 : 6) : 3.5).fill({ color });
    }

    // diagnostics: apex tangent 각도/크기. 각도는 atan2 inline (별도 domain import 없음)
    const ta = tangents[APEX];
    const apexMag = Math.hypot(ta.x, ta.y);
    const apexDeg = apexMag === 0 ? 'none' : `${((Math.atan2(ta.y, ta.x) * 180) / Math.PI).toFixed(1)}°`;

    label.text = [
      `vertices  : ${points.length}   drag apex`,
      `apex tan° : ${apexDeg}`,
      `apex |t|  : ${apexMag.toFixed(3)}`,
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
