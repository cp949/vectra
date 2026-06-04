/**
 * Polar Coordinate Plot
 *
 * 화면 중앙 center를 극좌표 원점으로 고정하고 handle 1개를 drag한다. center→handle 벡터를
 * 극좌표 (r, theta)로 읽은 뒤, 같은 theta 방향(bearing) 위에서 반지름을 키워 가며 fromPolar로
 * stepped 작도점을 찍는다. 마지막 작도점(r 전체)은 handle과 정확히 겹쳐 toPolar↔fromPolar
 * 왕복이 일치함을 보여준다.
 *
 * - Vectors.toPolar: center 기준 handle 벡터를 극좌표 (r, theta)로 분해. bearing과 반지름을 읽는다.
 * - Vectors.fromPolar: (반지름, theta)로 직교좌표 점을 작도. 같은 bearing 위 작도점을 만든다.
 * - Angles.radToDeg: theta(라디안)를 표시용 degree로 변환.
 */

import * as Angles from '@cp949/vectra/angle';
import * as Vectors from '@cp949/vectra/vec';

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

  // center는 극좌표 원점으로 화면 중앙에 고정한다
  const center: XY = { x: size.width / 2, y: size.height / 2 };

  // handle은 사용자가 끄는 유일한 주 대상 (center→handle이 극좌표를 정의한다)
  const handle: XY = { x: center.x + 170, y: center.y - 90 };

  // 같은 bearing 위 작도점을 찍을 반지름 비율 (0.25 → 1.0, k=1은 handle과 겹친다)
  const STEPS = [0.25, 0.5, 0.75, 1];
  // 폴라 그리드 backdrop 동심원 반지름 (장식, 극좌표 읽기 보조)
  const RINGS = [60, 120, 180];

  const HIT_RADIUS = 22;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // handle 근처를 누르면 잡는다
    grabbed = Math.hypot(handle.x - p.x, handle.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 잡은 handle을 화면 안으로 clamp
    handle.x = Math.max(20, Math.min(size.width - 20, p.x));
    handle.y = Math.max(20, Math.min(size.height - 20, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(8);

  const render = (): void => {
    // center를 원점으로 옮긴 handle 벡터 (극좌표 입력)
    const delta: XY = { x: handle.x - center.x, y: handle.y - center.y };
    // 벡터를 극좌표로 분해한다. r ≥ 0, theta는 +x축 기준 (-π, π]
    const polar = Vectors.toPolar(delta);
    // pixi 화면은 y축이 아래로 향하므로 theta는 화면상 시계방향으로 보인다 (좌표 그대로 사용)
    const thetaDeg = Angles.radToDeg(polar.theta);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 폴라 그리드 동심원 (반지름 눈금 보조)
    for (const ring of RINGS) {
      g.circle(center.x, center.y, ring).stroke({ color: 0x1e293b, width: 1, alpha: 0.9 });
    }
    // 폴라 그리드 30° spoke (각도 눈금 보조)
    for (let a = 0; a < 360; a += 30) {
      const rad = (a * Math.PI) / 180;
      const ex = center.x + Math.cos(rad) * 190;
      const ey = center.y + Math.sin(rad) * 190;
      g.moveTo(center.x, center.y).lineTo(ex, ey).stroke({ color: 0x1e293b, width: 1, alpha: 0.55 });
    }

    // 반지름 r 가이드 원 (handle이 항상 이 원 위에 있다)
    g.circle(center.x, center.y, polar.r).stroke({ color: 0x334155, width: 1.5, alpha: 0.9 });

    // +x축 기준 angle arc (theta를 시각화). 작은 반지름 호로 부채꼴 표시
    const arcR = 34;
    g.moveTo(center.x + arcR, center.y);
    g.arc(center.x, center.y, arcR, 0, polar.theta, polar.theta < 0).stroke({
      color: 0x38bdf8,
      width: 2,
    });
    // +x축 기준선 (theta 측정 기준)
    g.moveTo(center.x, center.y)
      .lineTo(center.x + 70, center.y)
      .stroke({ color: 0x475569, width: 1 });

    // center→handle spoke (현재 bearing)
    g.moveTo(center.x, center.y).lineTo(handle.x, handle.y).stroke({ color: 0x64748b, width: 1.5 });

    let last: XY = center;
    // 같은 theta 위에서 반지름을 키워 가며 fromPolar로 작도점을 찍는다
    for (const k of STEPS) {
      const p = Vectors.fromPolar(polar.r * k, polar.theta);
      // fromPolar 결과는 center 기준 오프셋이므로 center로 옮겨 화면 좌표로 만든다
      const px = center.x + p.x;
      const py = center.y + p.y;
      g.circle(px, py, k === 1 ? 6 : 4).fill({ color: k === 1 ? 0xfacc15 : 0x94a3b8 });
      last = { x: px, y: py };
    }

    // center 마커 (극좌표 원점)
    g.circle(center.x, center.y, 5).fill({ color: 0xe2e8f0 });
    // handle drag 마커 (잡으면 커진다)
    g.circle(handle.x, handle.y, grabbed ? 9 : 7).fill({ color: 0xf97316 });
    g.circle(handle.x, handle.y, HIT_RADIUS).stroke({ color: 0xf97316, width: 1, alpha: 0.16 });

    label.text = [
      `r      : ${fmt(polar.r)}        drag handle`,
      `theta  : ${fmt(thetaDeg)} deg`,
      `plot   : ${fmt(last.x - center.x)}, ${fmt(last.y - center.y)}`,
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
