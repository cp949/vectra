/**
 * Rect Contains Point
 *
 * 화면 고정 사각 영역(zone)과 draggable 점 핸들 1개를 두고, 점을 drag하면
 * `containsPoint(zone, point)`이 그 점이 사각 영역 안에 있는지 매 프레임 boolean으로 판정한다.
 * 안에 있으면 hit 색, 밖이면 clear 색으로 바뀌어 "이 점(포인터/오브젝트)이 사각 영역(버튼/존)
 * 위에 있는가?"라는 hit-test 작업 흐름을 보인다. closed boundary를 포함하므로 변 위에 정확히
 * 올린 점도 inside다.
 *
 * - Rects.containsPoint: point가 rect의 closed boundary(left/right/top/bottom edge 포함) 안에
 *   있으면 true를 반환한다. empty rect(width <= 0 또는 height <= 0)는 false. boolean을 직접
 *   반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Rects from '@cp949/vectra/rect';

type XY = { x: number; y: number };
type Rect = { x: number; y: number; width: number; height: number };

const CLEAR_COLOR = 0x60a5fa; // 밖: 파랑
const HIT_COLOR = 0xf87171; // 안: 빨강
const M = 16; // 화면 가장자리 margin (px)
const GRAB_R = 16; // point handle 잡기 반경 (px)

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

  // 고정 사각 영역 (조작 대상 아님). width/height가 고정 양수라 empty rect(false)는 미발생.
  const zone: Rect = { x: 300, y: 150, width: 220, height: 160 };
  // hit-test 대상이 되는 주 drag 점 (조작 대상 1개).
  const point: XY = { x: 410, y: 220 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // point handle 근처를 누르면 잡는다
    const dx = p.x - point.x;
    const dy = p.y - point.y;
    grabbed = dx * dx + dy * dy <= GRAB_R * GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // point를 화면 안으로 clamp → 항상 finite 입력 (NaN/Infinity 회피)
    point.x = Math.max(M, Math.min(size.width - M, p.x));
    point.y = Math.max(M, Math.min(size.height - M, p.y));
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
    // 핵심 호출: 점이 사각 영역(변 위 포함)에 있으면 true. 변에 정확히 올리면 closed
    // boundary 포함이라 그 순간 색이 전환된다.
    const inside = Rects.containsPoint(zone, point);
    const stateColor = inside ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 사각 영역: 옅은 fill + 테두리 stroke (inside면 hit 색)
    g.rect(zone.x, zone.y, zone.width, zone.height).fill({ color: stateColor, alpha: 0.12 });
    g.rect(zone.x, zone.y, zone.width, zone.height).stroke({ color: stateColor, width: 3, alpha: 0.95 });

    // 점 핸들 (잡으면 더 크게)
    g.circle(point.x, point.y, grabbed ? 9 : 7).fill({ color: stateColor });

    label.text = [
      `inside : ${inside ? 'yes' : 'no '}`,
      `point  : (${point.x.toFixed(0)}, ${point.y.toFixed(0)})`,
      'drag the point into the zone',
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
