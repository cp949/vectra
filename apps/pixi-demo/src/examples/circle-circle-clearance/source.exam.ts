/**
 * Circle Circle Clearance
 *
 * 화면 고정 원 A와 드래그 원 B(center만 핸들)를 두고, B를 drag하면 `distanceToCircle(A, B)`이
 * 두 원(disk) 사이의 부호 없는 최단 여유 거리(clearance)를 매 프레임 다시 계산한다. 두 원이
 * 떨어져 있으면 둘레 사이의 gap이 곧 그 거리이고, B를 A에 겹치면 거리가 0이 되어 "두 원형 영역이
 * 서로 얼마나 떨어져 있는가, 닿았는가"(circle-to-circle clearance)라는 작업 흐름을 보인다.
 *
 * - Circlex.distanceToCircle: (A, B)에서 둘레 사이의 부호 없는 최단 거리를 number로 직접 반환한다.
 *   두 원이 겹치거나 접하면 0을 반환한다. scalar를 직접 반환해 *Into companion이 없으므로 그대로
 *   호출한다.
 */

import * as Circlex from '@cp949/vectra/circle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const ZONE_FILL = 0x1e293b; // 원 내부 채움: 어두운 회청색
const A_COLOR = 0x64748b; // 고정 원 A 둘레(분리 시): 회색
const B_COLOR = 0xa78bfa; // 드래그 원 B 둘레(분리 시): 보라 (주 조작 대상)
const CONTACT_COLOR = 0xf87171; // 두 원이 겹침/접촉(거리 0)일 때 강조: 빨강
const CLEAR_COLOR = 0x38bdf8; // clearance 선분·둘레 최근접점 강조: 하늘색
const LINK_COLOR = 0x334155; // center↔center 연결선 guide: 어두운 회색
const CENTER_COLOR = 0x94a3b8; // center marker: 연회색
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const GRAB_PAD = 16; // 핸들 잡기 허용 여유 (px)

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

  // 고정 원 A: 거리를 측정할 기준 도형. 조작 대상이 아니다
  const circleA = { center: { x: 300, y: 240 }, radius: 80 };

  // 드래그 원 B: center가 유일한 drag 대상. radius는 고정이라 모양은 평행이동만 한다
  const circleB = { center: { x: 480, y: 150 }, radius: 45 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let d = 0; // 두 원 둘레 사이의 부호 없는 최단 여유 거리 (distanceToCircle 출력, overlap이면 0)
  let centerDist = 0; // |C| = 두 center 사이 거리 (같은 관계의 inline 분해, d = max(0, |C| − rA − rB))
  let overlap = false; // d <= 0 → 두 원이 겹치거나 접촉
  let footA: XY = { x: 0, y: 0 }; // A 둘레 위 최근접점 = centerA + dir·rA
  let footB: XY = { x: 0, y: 0 }; // B 둘레 위 최근접점 = centerB − dir·rB

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // B center를 화면 안으로 clamp → 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    circleB.center.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    circleB.center.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 단일 핵심 관계: 두 원 둘레 사이의 부호 없는 최단 여유 거리 (overlap이면 0)
    d = Circlex.distanceToCircle(circleA, circleB);

    // |C|는 같은 관계를 center 거리로 읽은 inline 분해 (d = max(0, |C| − rA − rB))
    const dx = circleB.center.x - circleA.center.x;
    const dy = circleB.center.y - circleA.center.y;
    centerDist = Math.hypot(dx, dy);
    overlap = d <= 0; // distanceToCircle은 overlap/접촉에서 0을 valid 반환

    // 두 둘레 위 최근접점: center 연결선 단위벡터를 각 반지름만큼 뻗은 점 (inline, closestPoint 미호출)
    // overlap이면 d=0이라 clearance 선분을 안 그리므로 |C|=0(center 겹침)으로 방향이 정의 불가해도 무관
    if (centerDist > 0) {
      const ux = dx / centerDist;
      const uy = dy / centerDist;
      footA = { x: circleA.center.x + ux * circleA.radius, y: circleA.center.y + uy * circleA.radius };
      footB = { x: circleB.center.x - ux * circleB.radius, y: circleB.center.y - uy * circleB.radius };
    }
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // B center 근처를 누르면 잡는다 (B가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - circleB.center.x, p.y - circleB.center.y) <= circleB.radius + GRAB_PAD;
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

    // 겹침 여부에 따라 둘레 색 전환: overlap/접촉(거리 0)이면 contact, 분리면 평소 색
    const aStroke = overlap ? CONTACT_COLOR : A_COLOR;
    const bStroke = overlap ? CONTACT_COLOR : B_COLOR;

    // 고정 원 A
    g.circle(circleA.center.x, circleA.center.y, circleA.radius)
      .fill({ color: ZONE_FILL })
      .stroke({ color: aStroke, width: 2 });

    if (!overlap) {
      // center↔center 연결선: 두 최근접점이 이 직선 위에 있음을 흐리게 보인다
      g.moveTo(circleA.center.x, circleA.center.y)
        .lineTo(circleB.center.x, circleB.center.y)
        .stroke({ color: LINK_COLOR, width: 1 });

      // clearance 선분: A 둘레 최근접점 → B 둘레 최근접점. 이 선분 길이가 곧 거리 d다
      g.moveTo(footA.x, footA.y).lineTo(footB.x, footB.y).stroke({ color: CLEAR_COLOR, width: 2 });

      // 각 둘레 위 최근접점 marker (거리 d가 측정되는 두 발)
      g.circle(footA.x, footA.y, 5).fill({ color: CLEAR_COLOR });
      g.circle(footB.x, footB.y, 5).fill({ color: CLEAR_COLOR });
    }

    // 드래그 원 B (주 조작 대상): grab 시 둘레를 굵게
    g.circle(circleB.center.x, circleB.center.y, circleB.radius)
      .fill({ color: ZONE_FILL })
      .stroke({ color: bStroke, width: grabbed ? 3 : 2 });

    // 두 center marker
    g.circle(circleA.center.x, circleA.center.y, 4).fill({ color: CENTER_COLOR });
    g.circle(circleB.center.x, circleB.center.y, 4).fill({ color: CENTER_COLOR });

    label.text = [
      `d     : ${d.toFixed(1)}   drag B`,
      `status: ${overlap ? 'overlap (touching)' : 'apart'}`,
      `|C|   : ${centerDist.toFixed(1)}  (rA = ${circleA.radius}, rB = ${circleB.radius})`,
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
