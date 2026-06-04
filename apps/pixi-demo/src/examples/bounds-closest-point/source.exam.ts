/**
 * Bounds Closest Point
 *
 * 화면 고정 사각 영역 box(AABB)와 질의 점 핸들 P 1개를 두고, P를 drag하면
 * `closestPoint(box, P)`이 닫힌 AABB 위 P 최근접점(foot)을 매 drag마다 다시 구한다. P를 box
 * 밖으로 끌면 foot가 가장 가까운 변(수선의 발) 또는 모서리에 axis별 clamp로 안착하고, P를 box
 * 안으로 끌면 foot=P(거리 0)가 되어 "닫힌 사각 영역에서 한 점에 가장 가까운 점을 찾는다"는
 * 작업 흐름을 보인다.
 *
 * - Bounds.closestPoint: (box, P)에서 닫힌 AABB 위 P 최근접점을 새 { x, y } object로 반환한다.
 *   각 축을 [min, max]로 독립 clamp한 좌표라 한 축만 벗어나면 변 위, 두 축 모두 벗어나면 모서리,
 *   내부 point면 P 그대로다. drag당 단발 결과라 allocating closestPoint를 쓰고 closestPointInto
 *   out-buffer scaffold는 만들지 않는다.
 */

import * as Bounds from '@cp949/vectra/bounds';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const BOX_FILL = 0x1e293b; // box 내부 채움: 어두운 회청색
const BOX_COLOR = 0x64748b; // 고정 box 둘레: 회색 (조작 대상 아님)
const P_COLOR = 0xa78bfa; // 질의 점 P: 보라 (주 조작 대상)
const INSIDE_COLOR = 0xf87171; // P가 box 안(foot=P, 거리 0): 빨강
const DROP_COLOR = 0x38bdf8; // P→foot drop line·foot marker 강조: 하늘색
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const GRAB_PAD = 14; // 핸들 잡기 허용 여유 (px)

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

  // 고정 box(AABB): 최근접점을 탐색할 기준 영역. 조작 대상이 아니다
  const box = { min: { x: 280, y: 170 }, max: { x: 460, y: 320 } };

  // 질의 점 P: 유일한 drag 대상. 화면 어디로든 끌 수 있다
  let p: XY = { x: 560, y: 110 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let foot: XY = { x: 0, y: 0 }; // closestPoint 출력 = 닫힌 AABB 위 P 최근접점
  let dist = 0; // |P − foot| = 같은 관계를 거리로 읽은 inline 분해 (distanceToPoint 미호출)
  let inside = false; // dist === 0 → P가 box 안 (foot=P), inline 판정 (containsPoint 미호출)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // P를 화면 안으로 clamp → 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (q: XY): XY => ({
    x: Math.max(MARGIN, Math.min(size.width - MARGIN, q.x)),
    y: Math.max(MARGIN, Math.min(size.height - MARGIN, q.y)),
  });

  const rebuild = (): void => {
    // 단일 핵심 관계: 닫힌 AABB 위 P 최근접점 (고정 valid box라 undefined 미반환)
    foot = Bounds.closestPoint(box, p) ?? p;

    // dist·inside는 같은 closestPoint 관계의 inline 분해 (별도 distanceToPoint·containsPoint 미호출)
    dist = Math.hypot(p.x - foot.x, p.y - foot.y);
    inside = dist === 0; // 내부/경계 point면 foot=P라 거리 0
  };

  const onPointerDown = (e: PointerEvent): void => {
    const q = clampToScreen(getCanvasXY(e));
    // P 근처를 누르면 잡는다 (P가 유일한 조작 대상)
    grabbed = Math.hypot(q.x - p.x, q.y - p.y) <= GRAB_PAD + 6;
    if (grabbed) {
      p = q;
      rebuild();
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    p = clampToScreen(getCanvasXY(e));
    rebuild();
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  rebuild(); // 초기 state 1회 계산

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    const bw = box.max.x - box.min.x;
    const bh = box.max.y - box.min.y;

    // 고정 box: P가 내부면 둘레를 contact 색으로 전환(foot=P가 box 위에 놓였음)
    g.rect(box.min.x, box.min.y, bw, bh)
      .fill({ color: BOX_FILL })
      .stroke({ color: inside ? INSIDE_COLOR : BOX_COLOR, width: 2 });

    // P가 밖일 때만 drop line·foot marker: 선분 길이가 곧 dist (내부면 foot=P라 그릴 게 없음)
    if (!inside) {
      g.moveTo(p.x, p.y).lineTo(foot.x, foot.y).stroke({ color: DROP_COLOR, width: 2 });
      g.circle(foot.x, foot.y, 5).fill({ color: DROP_COLOR }); // box 위 최근접점
    }

    // 질의 점 P (주 조작 대상): grab 시 크게. 내부면 contact 색
    g.circle(p.x, p.y, grabbed ? 7 : 5).fill({ color: inside ? INSIDE_COLOR : P_COLOR });

    label.text = [
      `foot  : (${foot.x.toFixed(0)}, ${foot.y.toFixed(0)})   drag P`,
      `dist  : ${dist.toFixed(1)}`,
      `status: ${inside ? 'inside (foot = P)' : 'outside'}`,
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
