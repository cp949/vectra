/**
 * Circle Point Clearance
 *
 * 화면 고정 원형 keep-out zone과 점 핸들 P 1개를 두고, P를 drag하면 `distanceToPoint(circle, P)`이
 * 점에서 원까지의 부호 없는 최단 여유 거리(clearance)를 매 프레임 다시 계산한다. P가 zone 밖이면
 * 둘레까지의 gap이 곧 그 거리이고, P를 zone 안으로 끌면 거리가 0이 되어 "이 점이 원형 금지 구역에서
 * 얼마나 떨어져 있는가, 닿았는가"(clearance / proximity probe)라는 작업 흐름을 보인다.
 *
 * - Circlex.distanceToPoint: (circle, P)에서 점까지의 부호 없는 최단 거리를 number로 직접 반환한다.
 *   P가 원 내부나 경계 위면 0을 반환한다. scalar를 직접 반환해 *Into companion이 없으므로 그대로
 *   호출한다.
 */

import * as Circlex from '@cp949/vectra/circle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const ZONE_FILL = 0x1e293b; // keep-out zone 내부 채움: 어두운 회청색
const ZONE_COLOR = 0x64748b; // zone 둘레(밖일 때): 회색
const CONTACT_COLOR = 0xf87171; // P가 zone 안/경계(거리 0)일 때 강조: 빨강
const CLEAR_COLOR = 0x38bdf8; // clearance 선분·둘레 최근접점 강조: 하늘색
const RADIUS_COLOR = 0x334155; // center→최근접점 반지름 guide: 어두운 회색
const CENTER_COLOR = 0x94a3b8; // 고정 center marker: 연회색 (조작 대상 아님)
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

  // 고정 원형 keep-out zone: 거리를 측정할 대상 도형. 조작 대상이 아니다
  const circle = { center: { x: 320, y: 240 }, radius: 90 };

  // 점 핸들 P: 유일한 drag 대상. 원까지의 여유 거리를 측정할 점이다
  const handle: XY = { x: 470, y: 150 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let d = 0; // 점 → 원까지의 부호 없는 최단 여유 거리 (distanceToPoint 출력, 내부면 0)
  let centerDist = 0; // |CP| = center까지의 거리 (같은 관계의 inline 분해 표시)
  let inside = false; // d <= 0 → P가 zone 내부/경계 위
  let foot: XY = { x: 0, y: 0 }; // 둘레 위 최근접점 = center + (P−center)/|CP| · r

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
    // 단일 핵심 관계: 점 → 원까지의 부호 없는 최단 여유 거리 (내부/경계면 0)
    d = Circlex.distanceToPoint(circle, handle);

    // |CP|는 같은 관계를 center 기준 거리로 읽은 inline 분해 (d = max(0, |CP| − r))
    const dx = handle.x - circle.center.x;
    const dy = handle.y - circle.center.y;
    centerDist = Math.hypot(dx, dy);
    inside = d <= 0; // distanceToPoint은 내부/경계에서 0을 valid 반환

    // 둘레 위 최근접점: center에서 P 방향 단위벡터를 반지름만큼 뻗은 점 (inline, closestPoint 미호출)
    // P가 center에 정확히 겹치면(|CP|=0) 방향이 정의 불가 → 내부라 clearance 선분을 안 그리므로 무관
    if (centerDist > 0) {
      foot = {
        x: circle.center.x + (dx / centerDist) * circle.radius,
        y: circle.center.y + (dy / centerDist) * circle.radius,
      };
    }
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

    // 닿음 여부에 따라 zone 둘레 색 전환: 안/경계(거리 0)면 contact, 밖이면 평소 색
    const zoneStroke = inside ? CONTACT_COLOR : ZONE_COLOR;

    // 고정 원형 keep-out zone
    g.circle(circle.center.x, circle.center.y, circle.radius)
      .fill({ color: ZONE_FILL })
      .stroke({ color: zoneStroke, width: 2 });

    if (!inside) {
      // center→최근접점 반지름 guide: 최근접점이 반지름 위에 있음을 흐리게 보인다
      g.moveTo(circle.center.x, circle.center.y).lineTo(foot.x, foot.y).stroke({ color: RADIUS_COLOR, width: 1 });

      // clearance 선분: 둘레 최근접점 → P. 이 선분 길이가 곧 거리 d다
      g.moveTo(foot.x, foot.y).lineTo(handle.x, handle.y).stroke({ color: CLEAR_COLOR, width: 2 });

      // 둘레 위 최근접점 marker (거리 d가 측정되는 원 위 발)
      g.circle(foot.x, foot.y, 5).fill({ color: CLEAR_COLOR });
    }

    // 고정 center marker
    g.circle(circle.center.x, circle.center.y, 4).fill({ color: CENTER_COLOR });

    // 점 핸들 P (주 조작 대상): 닿으면 contact 색으로 강조
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: inside ? CONTACT_COLOR : HANDLE_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `d     : ${d.toFixed(1)}   drag P`,
      `status: ${inside ? 'inside (touching)' : 'outside'}`,
      `|CP|  : ${centerDist.toFixed(1)}  (r = ${circle.radius})`,
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
