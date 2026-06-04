/**
 * Polyline Distance Probe
 *
 * 화면 고정 polyline(stroke)과 draggable probe point를 두고, probe를 drag하면 probe에서 polyline
 * 까지의 최단 거리를 잰다. 거리가 threshold 이하이면 stroke를 hit로 강조해 "pointer가 stroke
 * 근처인가?"라는 proximity hit-test를 보인다. probe 중심 반지름=거리 원이 polyline에 정확히
 * 접해 그 값이 최단 거리임을 시각적으로 증명한다.
 *
 * - Polylines.distanceToPoint: probe에서 polyline의 모든 segment까지 거리를 비교해 최솟값을 반환한다.
 *   scalar 반환이라 *Into companion이 없고, hit 판정·distance ring 반지름·diagnostics에 같은 값을 쓴다.
 */

import * as Polylines from '@cp949/vectra/polyline';

type XY = { x: number; y: number };

// threshold(px). 이 값 이하이면 stroke 근처(hit)로 판정한다. 고정값(조작 대상 아님)
const THRESHOLD = 48;
const HIT_RADIUS = 22;

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

  // 고정 polyline. segment 길이가 제각각인 zigzag stroke (조작 대상 아님)
  // PolylineLike는 XY[]를 그대로 받으므로 points 배열을 그대로 polyline 입력으로 쓴다
  const points: XY[] = [
    { x: 110, y: 120 },
    { x: 250, y: 300 },
    { x: 360, y: 150 },
    { x: 470, y: 330 },
    { x: 560, y: 180 },
    { x: 640, y: 280 },
  ];

  // probe (주 drag 대상). 초기 위치는 stroke에서 떨어진 곳이라 처음엔 near=false
  const probe: XY = { x: 360, y: 60 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe와의 거리로 잡기 판정
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe를 화면 안으로 clamp (자유 이동, 축 제약 없음)
    probe.x = Math.max(12, Math.min(size.width - 12, p.x));
    probe.y = Math.max(40, Math.min(size.height - 12, p.y));
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
    // 핵심 호출: probe에서 polyline까지 최단 거리. 모든 segment 중 최솟값을 반환한다
    // (empty polyline이면 Infinity, single-point/zero-length면 첫 point까지 거리, 동거리면 앞 segment 우선.
    //  여기선 고정 6-vertex라 모두 미발생)
    const d = Polylines.distanceToPoint(points, probe);

    // 같은 거리 값으로 hit 판정 (두 번째 관계가 아니라 distance에 대한 비교)
    const near = d <= THRESHOLD;
    const strokeColor = near ? 0x4ade80 : 0x64748b;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 polyline stroke. near이면 hit 강조색
    for (let i = 0; i < points.length; i++) {
      if (i === 0) g.moveTo(points[i].x, points[i].y);
      else g.lineTo(points[i].x, points[i].y);
    }
    g.stroke({ color: strokeColor, width: near ? 4 : 2.5 });
    // vertex dot (stroke 형태 보조 표시, 조작 대상 아님)
    for (let i = 0; i < points.length; i++) {
      g.circle(points[i].x, points[i].y, 3).fill({ color: 0x334155 });
    }

    // threshold ring: probe 중심 고정 반지름 원 (hit 경계선, 점선 느낌의 옅은 외곽)
    g.circle(probe.x, probe.y, THRESHOLD).stroke({ color: 0x475569, width: 1, alpha: 0.6 });

    // distance ring: probe 중심 반지름=최단거리 원. polyline에 접해 최솟값을 증명한다
    // (probe가 stroke 위에 정확히 오면 d≈0이라 점으로 붕괴)
    if (d > 0.5) {
      g.circle(probe.x, probe.y, d).stroke({ color: near ? 0x4ade80 : 0x38bdf8, width: 1.5 });
    }

    // probe (유일 drag 대상)
    g.circle(probe.x, probe.y, grabbed ? 9 : 7).fill({ color: near ? 0x4ade80 : 0x38bdf8 });

    label.text = [
      `distance  : ${d.toFixed(1)} px   drag probe`,
      `threshold : ${THRESHOLD} px`,
      `near      : ${near ? 'yes' : 'no'}`,
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
