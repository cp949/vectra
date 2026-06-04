/**
 * Cursor Chase
 *
 * 추적 마커가 매 프레임 cursor를 향해 고정 최대 거리(maxStep)만큼 이동한다. cursor까지 남은
 * 거리가 maxStep 이하가 되면 마커는 cursor에 정확히 붙어 멈추고 그 지점을 넘어가지 않는다.
 * 점선 원은 도착 판정 반경(= 한 프레임 최대 이동 거리)을 나타내고, cursor가 그 원 밖으로
 * 멀어지면 마커가 다시 등속으로 따라간다.
 *
 * - Interpolation.moveTowardPointInto: 추적 마커 위치 buffer를 매 프레임 같은 object에 재기록해
 *   target 방향으로 maxStep만큼 이동시키고, 남은 거리가 maxStep 이하이면 target으로 snap한다.
 *   chaser 위치는 프레임 사이에 유지되는 state라 hot path로 *Into를 쓴다 (out === current 안전).
 * - Vectors.distance: cursor까지 남은 거리 diagnostics.
 */

import * as Interpolation from '@cp949/vectra/interpolation';
import * as Vectors from '@cp949/vectra/vec';

const MAX_STEP = 3.2;

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app } = runtime;

  const canvas = app.canvas as HTMLCanvasElement;
  const W = app.screen.width;
  const H = app.screen.height;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0xe2e8f0, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // cursor(target). 시작 위치는 화면 우상단.
  const target = { x: W * 0.72, y: H * 0.36 };

  // 추적 마커 위치. 프레임 사이 유지되는 state buffer (hot path로 매 프레임 재기록).
  const chaser = { x: W * 0.25, y: H * 0.66 };

  const onPointerMove = (e: PointerEvent): void => {
    // canvas CSS 크기가 screen 크기(W,H)와 다를 수 있어 비율로 보정한다
    const rect = canvas.getBoundingClientRect();
    target.x = (e.clientX - rect.left) * (W / rect.width);
    target.y = (e.clientY - rect.top) * (H / rect.height);
  };
  canvas.addEventListener('pointermove', onPointerMove);

  const fmt = (n: number): string => n.toFixed(1).padStart(7);

  const render = (): void => {
    // deltaTime은 프레임 단위(60fps에서 ≈1.0). 탭 복귀 시 dt 폭주를 막기 위해 clamp.
    const dt = Math.min(app.ticker.deltaTime, 2);
    const step = MAX_STEP * dt;

    const distBefore = Vectors.distance(chaser, target);

    // 같은 chaser buffer에 결과를 재기록한다 (out === current 안전)
    Interpolation.moveTowardPointInto(chaser, chaser, target, step);

    g.clear();

    // 도착 판정 반경: 남은 거리가 이 안이면 이번 프레임에 target으로 snap한다
    g.circle(target.x, target.y, step).stroke({ color: 0x475569, width: 1, alpha: 0.9 });

    // chaser -> target 연결선 (남은 거리)
    g.moveTo(chaser.x, chaser.y).lineTo(target.x, target.y).stroke({ color: 0x334155, width: 1, alpha: 0.7 });

    // target(cursor) 마커
    g.circle(target.x, target.y, 6).fill({ color: 0xfbbf24 });

    // 추적 마커
    g.circle(chaser.x, chaser.y, 9).fill({ color: 0x7dd3fc });

    const arrived = distBefore <= step;
    label.text = [
      `distance : ${fmt(distBefore)} px`,
      `max step : ${fmt(step)} px/frame`,
      `arrived  : ${arrived ? 'yes (snap to cursor)' : 'no  (constant speed)'}`,
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
