/**
 * Bounds Point Clearance
 *
 * 화면 고정 사각 keep-out zone(AABB)과 점 핸들 P 1개를 두고, P를 drag하면
 * `distanceToPoint(box, P)`이 점에서 사각 영역까지의 부호 없는 최단 여유 거리(clearance)를 매
 * 프레임 다시 계산한다. P가 zone 밖이면 둘레까지의 gap이 곧 그 거리이고, P를 zone 안으로 끌면
 * 거리가 0이 되어 "이 점이 사각 금지 구역에서 얼마나 떨어져 있는가, 닿았는가"(clearance /
 * proximity probe)라는 작업 흐름을 보인다.
 *
 * - Boundsx.distanceToPoint: (box, P)에서 닫힌 AABB까지의 부호 없는 최단 거리를 number로 직접
 *   반환한다. P가 box 내부나 경계 위면 0을 반환한다. 한 축만 벗어나면 가까운 변까지 수직 거리,
 *   두 축 모두 벗어나면 가까운 모서리까지 거리다. scalar를 직접 반환해 *Into companion이 없으므로
 *   그대로 호출한다.
 */

import * as Boundsx from '@cp949/vectra/bounds';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const ZONE_FILL = 0x1e293b; // keep-out zone 내부 채움: 어두운 회청색
const ZONE_COLOR = 0x64748b; // zone 둘레(밖일 때): 회색
const CONTACT_COLOR = 0xf87171; // P가 zone 안/경계(거리 0)일 때 강조: 빨강
const CLEAR_COLOR = 0x38bdf8; // clearance 선분·둘레 최근접점 강조: 하늘색
const HANDLE_COLOR = 0xa78bfa; // 점 핸들 P (주 조작 대상): 보라
const HANDLE_R = 7; // P 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)

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

  // 고정 사각 keep-out zone(AABB): 거리를 측정할 대상 영역. 조작 대상이 아니다
  const box = { min: { x: 280, y: 170 }, max: { x: 460, y: 320 } };

  // 점 핸들 P: 유일한 drag 대상. box까지의 여유 거리를 측정할 점이다
  const handle: XY = { x: 560, y: 110 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let d = 0; // 점 → box까지의 부호 없는 최단 여유 거리 (distanceToPoint 출력, 내부면 0)
  let inside = false; // d === 0 → P가 zone 내부/경계 위
  let foot: XY = { x: 0, y: 0 }; // 둘레 위 최근접점 = P를 축별 [min, max]로 clamp한 점
  let gx = 0; // P − foot 의 x 성분 (같은 관계를 축별 gap으로 읽은 inline 분해)
  let gy = 0; // P − foot 의 y 성분 (d = hypot(gx, gy))

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → P가 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 단일 핵심 관계: 점 → 닫힌 AABB까지의 부호 없는 최단 여유 거리 (내부/경계면 0)
    d = Boundsx.distanceToPoint(box, handle);
    inside = d === 0; // distanceToPoint은 내부/경계에서 0을 valid 반환

    // 둘레 위 최근접점: P를 각 축 [min, max]로 독립 clamp (inline, closestPoint 미호출)
    // 한 축만 벗어나면 변 위, 두 축 모두 벗어나면 모서리, 내부면 foot=P가 된다
    foot = {
      x: Math.max(box.min.x, Math.min(box.max.x, handle.x)),
      y: Math.max(box.min.y, Math.min(box.max.y, handle.y)),
    };

    // 축별 gap: d = hypot(gx, gy) 임을 드러내는 inline 분해 (distanceToPoint 재호출 아님)
    gx = handle.x - foot.x;
    gy = handle.y - foot.y;
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // P 핸들 근처를 누르면 잡는다 (P가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - handle.x, p.y - handle.y) <= HANDLE_R + 16;
    if (grabbed) {
      clampToScreen(p);
      rebuild();
    }
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    clampToScreen(getCanvasXY(e));
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

    // 고정 box: P가 내부/경계면 둘레를 contact 색으로 전환(거리 0)
    g.rect(box.min.x, box.min.y, bw, bh)
      .fill({ color: ZONE_FILL })
      .stroke({ color: inside ? CONTACT_COLOR : ZONE_COLOR, width: 2 });

    // P가 밖일 때만 clearance 선분·foot marker: 선분 길이가 곧 d (내부면 foot=P라 그릴 게 없음)
    if (!inside) {
      g.moveTo(foot.x, foot.y).lineTo(handle.x, handle.y).stroke({ color: CLEAR_COLOR, width: 2 });
      g.circle(foot.x, foot.y, 5).fill({ color: CLEAR_COLOR }); // 둘레 위 최근접점
    }

    // 점 핸들 P (주 조작 대상): grab 시 크게. 닿으면 contact 색
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: inside ? CONTACT_COLOR : HANDLE_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `d     : ${d.toFixed(1)}   drag P`,
      `status: ${inside ? 'inside (touching)' : 'outside'}`,
      `gap   : (${gx.toFixed(1)}, ${gy.toFixed(1)})`,
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
