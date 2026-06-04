/**
 * Vector Rotate Around
 *
 * 화면 중앙 pivot은 고정하고 source 점 하나만 drag한다. 매 프레임 angle이 일정 각속도로 커지면서
 * source를 pivot 기준으로 회전한 점이 pivot 중심 orbit(반지름 = pivot↔source 거리) 위를 따라간다.
 * source를 pivot에서 멀리/가까이 끌면 orbit 반지름이 그대로 바뀐다.
 *
 * - Vectors.rotateAround: source를 pivot 기준 CCW로 angle만큼 회전한 점. orbit 위 현재 위치.
 * - Vectors.distance: pivot↔source Euclidean 거리. orbit 원의 반지름.
 * - Angles.wrapRadiansPositive / radToDeg: 누적 angle을 [0, 2π) → degree로 변환해 표시.
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

  // pivot은 화면 중앙에 고정한다 (회전 기준점)
  const pivot: XY = { x: size.width / 2, y: size.height / 2 };
  // source는 사용자가 드래그하는 유일한 주 대상 (orbit 반지름을 정한다)
  const source: XY = { x: size.width / 2 + 150, y: size.height / 2 };

  // 매 프레임 누적되는 회전각 (일정 각속도로 sweep)
  let angle = 0;
  const ANGULAR_SPEED = 0.018;

  const HIT_RADIUS = 20;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(source.x - p.x, source.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // source를 화면 안으로 clamp
    source.x = Math.max(20, Math.min(size.width - 20, p.x));
    source.y = Math.max(20, Math.min(size.height - 20, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  const render = (): void => {
    // 각도를 일정 속도로 누적해 회전을 구동한다
    angle += ANGULAR_SPEED;

    // orbit 반지름 = pivot에서 source까지의 거리
    const radius = Vectors.distance(pivot, source);
    // source를 pivot 기준으로 angle만큼 회전한 현재 위치
    const rotated = Vectors.rotateAround(source, pivot, angle);
    // 누적 angle을 [0, 2π)로 감싼 뒤 degree로 변환 (표시용)
    const deg = Angles.radToDeg(Angles.wrapRadiansPositive(angle));

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // pivot 중심 orbit 원 (rotated 점이 항상 이 원 위에 있다)
    g.circle(pivot.x, pivot.y, radius).stroke({ color: 0x334155, width: 1, alpha: 0.9 });

    // source -> pivot 기준선 (회전 시작 위치를 가리킨다)
    g.moveTo(pivot.x, pivot.y).lineTo(source.x, source.y).stroke({ color: 0x475569, width: 1, alpha: 0.7 });
    // pivot -> rotated 반지름선 (현재 회전 위치를 가리킨다)
    g.moveTo(pivot.x, pivot.y).lineTo(rotated.x, rotated.y).stroke({ color: 0xfacc15, width: 2 });

    // pivot 마커 (회전 기준점)
    g.circle(pivot.x, pivot.y, 5).fill({ color: 0xe2e8f0 });
    // source 마커 (drag 대상, orbit 반지름 결정)
    g.circle(source.x, source.y, grabbed ? 9 : 7).fill({ color: 0x94a3b8 });
    g.circle(source.x, source.y, HIT_RADIUS).stroke({ color: 0x94a3b8, width: 1, alpha: 0.16 });
    // rotated 마커 (회전 결과, orbit 위를 따라간다)
    g.circle(rotated.x, rotated.y, 7).fill({ color: 0xfacc15 });

    label.text = [
      `angle  : ${fmt(deg)} deg   drag source`,
      `radius : ${fmt(radius)} px`,
      `rotated: ${fmt(rotated.x)}, ${fmt(rotated.y)}`,
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
