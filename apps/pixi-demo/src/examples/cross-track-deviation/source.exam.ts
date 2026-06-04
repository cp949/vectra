/**
 * Cross-Track Deviation
 *
 * 화면을 가로지르는 고정 진행선(heading) 위를 따라가야 하는 차량을 드래그한다. 차량을 진행선에서
 * 옆으로 끌면, anchor→차량 변위에서 진행 방향 성분을 제거한 나머지(rejection)가 진행선까지의
 * 직각 거리, 즉 cross-track error로 나타난다. 차량에서 그 편차를 다시 빼면 진행선 위 최근접점(foot)이다.
 *
 * - Vectors.sub: anchor→차량 변위 d. 그리고 foot = 차량 - 편차로 진행선 위 발을 구하는 데 재사용.
 * - Vectors.rejectFrom: 변위 d에서 heading 방향 성분을 제거한 수직 편차 벡터(cross-track error).
 * - Vectors.length: 수직 편차 벡터의 크기(px) = 진행선까지의 직각 거리.
 */

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

  // 진행선 기준점(anchor)은 화면 중앙에 고정한다
  const anchor: XY = { x: size.width / 2, y: size.height / 2 };
  // 진행 방향(heading)은 고정 단위벡터다 (약 -18°, 살짝 우상향)
  const TH = (-18 * Math.PI) / 180;
  const heading: XY = { x: Math.cos(TH), y: Math.sin(TH) };

  // 차량은 사용자가 드래그하는 유일한 주 대상. 시작은 진행선에서 살짝 벗어난 위치.
  const vehicle: XY = { x: size.width * 0.62, y: size.height * 0.34 };

  const HIT_RADIUS = 20;
  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    // canvas CSS 크기가 screen 크기와 다를 수 있어 비율로 보정한다
    return {
      x: (e.clientX - rect.left) * (size.width / rect.width),
      y: (e.clientY - rect.top) * (size.height / rect.height),
    };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    grabbed = Math.hypot(vehicle.x - p.x, vehicle.y - p.y) <= HIT_RADIUS;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // 차량을 화면 안으로 clamp (항상 finite px 유지)
    vehicle.x = Math.max(16, Math.min(size.width - 16, p.x));
    vehicle.y = Math.max(16, Math.min(size.height - 16, p.y));
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

  // 진행선은 anchor에서 heading 양방향으로 화면 밖까지 길게 뻗는다
  const LINE = Math.max(size.width, size.height);
  const lineA: XY = { x: anchor.x - heading.x * LINE, y: anchor.y - heading.y * LINE };
  const lineB: XY = { x: anchor.x + heading.x * LINE, y: anchor.y + heading.y * LINE };

  const render = (): void => {
    // anchor→차량 변위
    const d = Vectors.sub(vehicle, anchor);
    // 변위에서 heading 방향 성분을 제거한 수직 편차 = cross-track error 벡터
    const rej = Vectors.rejectFrom(d, heading);
    // 차량에서 편차를 빼면 진행선 위 최근접점(foot)
    const foot = Vectors.sub(vehicle, rej);
    // 편차 크기 = 진행선까지의 직각 거리
    const crossTrack = Vectors.length(rej);
    // 부호 있는 옆거리로 좌/우 판정 (heading×변위의 2D cross 부호)
    const sideValue = heading.x * d.y - heading.y * d.x;
    const side = crossTrack < 0.5 ? 'on track' : sideValue > 0 ? 'right' : 'left';

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 고정 진행선(heading line)
    g.moveTo(lineA.x, lineA.y).lineTo(lineB.x, lineB.y).stroke({ color: 0x334155, width: 1.5 });

    // 차량 -> foot 수선 (cross-track error 벡터, 강조)
    g.moveTo(vehicle.x, vehicle.y).lineTo(foot.x, foot.y).stroke({ color: 0xf472b6, width: 2 });

    // anchor 마커 (진행선 기준점)
    g.circle(anchor.x, anchor.y, 4).fill({ color: 0x64748b });
    // foot 마커 (진행선 위 최근접점)
    g.circle(foot.x, foot.y, 5).fill({ color: 0xfacc15 });
    // 차량 마커 (drag 대상)
    g.circle(vehicle.x, vehicle.y, HIT_RADIUS).stroke({ color: 0x7dd3fc, width: 1, alpha: 0.16 });
    g.circle(vehicle.x, vehicle.y, grabbed ? 9 : 7).fill({ color: 0x7dd3fc });

    label.text = ['drag vehicle', `cross-track: ${fmt(crossTrack)} px`, `side       : ${side}`].join('\n');
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
