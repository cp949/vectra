/**
 * Triangle Point Clearance
 *
 * 화면 고정 삼각형 keep-out 영역과 점 핸들 P 1개를 두고, P를 drag하면 `distanceToPoint(triangle, P)`이
 * 점에서 삼각형 영역까지의 부호 없는 최단 여유 거리(clearance)를 매 프레임 다시 계산한다. P가 영역
 * 밖이면 가장 가까운 변까지의 gap이 곧 그 거리이고, P를 영역 안으로 끌면 거리가 0이 되어 "이 점이
 * 삼각형 금지 구역에서 얼마나 떨어져 있는가, 닿았는가"(clearance / proximity probe)라는 작업 흐름을
 * 보인다.
 *
 * - Trianglex.distanceToPoint: (triangle, P)에서 점까지의 부호 없는 최단 거리를 number로 직접 반환한다.
 *   P가 삼각형 내부나 경계 위면 0을 반환한다. scalar를 직접 반환해 *Into companion이 없으므로 그대로
 *   호출한다. 출력이 점(closestPoint)이나 boolean(containsPoint)이 아니라 scalar 거리인 점이 형제
 *   예제와의 구별점이다.
 */

import * as Trianglex from '@cp949/vectra/triangle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const ZONE_FILL = 0x1e293b; // keep-out 영역 내부 채움: 어두운 회청색
const ZONE_COLOR = 0x64748b; // 삼각형 외곽선(밖일 때): 회색
const CONTACT_COLOR = 0xf87171; // P가 영역 안/경계(거리 0)일 때 강조: 빨강
const CLEAR_COLOR = 0x38bdf8; // clearance 선분·둘레 최근접점 강조: 하늘색
const HANDLE_COLOR = 0xa78bfa; // 점 핸들 P (주 조작 대상): 보라
const HANDLE_R = 7; // P 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const TOP_MARGIN = 64; // 상단 label 영역을 피하는 clamp margin (px)

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

  // 고정 non-degenerate scalene 삼각형: 거리를 측정할 대상 영역. 조작 대상이 아니다.
  // 세 점이 한 직선 위가 아니라 degenerate(segment 환원·세 vertex 동일) 분기는 발생하지 않는다.
  const triangle = {
    a: { x: 250, y: 130 }, // 위쪽 꼭짓점
    b: { x: 560, y: 250 }, // 오른쪽 아래 꼭짓점
    c: { x: 230, y: 370 }, // 왼쪽 아래 꼭짓점
  };

  // 세 변을 (start, end) 쌍과 label로 묶어둔다. foot는 이 세 변 segment clamp 중 최소 거리로 구한다.
  const edges: { s: XY; e: XY; name: string }[] = [
    { s: triangle.a, e: triangle.b, name: 'AB' },
    { s: triangle.b, e: triangle.c, name: 'BC' },
    { s: triangle.c, e: triangle.a, name: 'CA' },
  ];

  // 점 핸들 P: 유일한 drag 대상. 삼각형까지의 여유 거리를 측정할 점이다
  const handle: XY = { x: 620, y: 110 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let d = 0; // 점 → 삼각형까지의 부호 없는 최단 여유 거리 (distanceToPoint 출력, 내부면 0)
  let inside = false; // d <= 0 → P가 영역 내부/경계 위
  let foot: XY = { x: 0, y: 0 }; // 둘레 위 최근접점 (세 변 segment clamp 중 최소 거리 점)
  let nearEdge = ''; // foot가 놓인 변 이름 (AB/BC/CA) — 같은 관계의 분해 읽기

  let grabbed = false;

  const getCanvasXY = (ev: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → P가 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(TOP_MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  // 한 변 segment(s→e) 위에서 P에 가장 가까운 clamped 점. distanceToPoint의 edge 환원과 같은 산술.
  const closestOnEdge = (s: XY, e: XY, p: XY): XY => {
    const ex = e.x - s.x;
    const ey = e.y - s.y;
    const lenSq = ex * ex + ey * ey;
    // 변 길이 0(고정 non-degenerate 삼각형이라 미발생)이면 시작점 반환
    if (lenSq === 0) return { x: s.x, y: s.y };
    // 투영 파라미터 t를 [0,1]로 clamp → segment 양 끝을 벗어나지 않는다(꼭짓점 안착 허용)
    let t = ((p.x - s.x) * ex + (p.y - s.y) * ey) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return { x: s.x + ex * t, y: s.y + ey * t };
  };

  const rebuild = (): void => {
    // 단일 핵심 관계: 점 → 삼각형까지의 부호 없는 최단 여유 거리 (내부/경계면 0)
    d = Trianglex.distanceToPoint(triangle, handle);
    inside = d <= 0; // distanceToPoint은 내부/경계에서 0을 valid 반환

    // 둘레 위 최근접점 foot: 세 변 segment clamp 점 중 P에 가장 가까운 것 (inline, closestPoint 미호출)
    // distanceToPoint이 외부에서 반환하는 거리와 같은 변 환원이라 두 번째 API가 아니다.
    let bestSq = Infinity;
    for (const edge of edges) {
      const c = closestOnEdge(edge.s, edge.e, handle);
      const dx = handle.x - c.x;
      const dy = handle.y - c.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < bestSq) {
        bestSq = distSq;
        foot = c;
        nearEdge = edge.name;
      }
    }
  };

  const onPointerDown = (ev: PointerEvent): void => {
    const p = getCanvasXY(ev);
    // P 핸들 근처를 누르면 잡는다 (P가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - handle.x, p.y - handle.y) <= HANDLE_R + 16;
    if (grabbed) {
      clampToScreen(p);
      rebuild();
    }
  };

  const onPointerMove = (ev: PointerEvent): void => {
    if (!grabbed) return;
    clampToScreen(getCanvasXY(ev));
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

    // 닿음 여부에 따라 외곽선 색 전환: 안/경계(거리 0)면 contact, 밖이면 평소 색
    const zoneStroke = inside ? CONTACT_COLOR : ZONE_COLOR;

    // 고정 삼각형 keep-out 영역
    const poly = [triangle.a.x, triangle.a.y, triangle.b.x, triangle.b.y, triangle.c.x, triangle.c.y];
    g.poly(poly).fill({ color: ZONE_FILL });
    g.poly(poly).stroke({ color: zoneStroke, width: 2 });

    if (!inside) {
      // clearance 선분: 둘레 최근접점 → P. 이 선분 길이가 곧 거리 d다
      g.moveTo(foot.x, foot.y).lineTo(handle.x, handle.y).stroke({ color: CLEAR_COLOR, width: 2 });

      // 둘레 위 최근접점 marker (거리 d가 측정되는 변 위 발)
      g.circle(foot.x, foot.y, 5).fill({ color: CLEAR_COLOR });
    }

    // 점 핸들 P (주 조작 대상): 닿으면 contact 색으로 강조
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: inside ? CONTACT_COLOR : HANDLE_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `d     : ${d.toFixed(1)}   drag P`,
      `status: ${inside ? 'inside (touching)' : 'outside'}`,
      `edge  : ${inside ? '—' : nearEdge}`,
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
