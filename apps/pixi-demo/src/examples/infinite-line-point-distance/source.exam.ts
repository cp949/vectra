/**
 * Infinite Line Point Distance
 *
 * 화면 고정 무한 직선(양방향으로 끝없이 뻗는 guide line)과 점 핸들 P 1개를 두고, P를 drag하면
 * `distanceToPoint(line, P)`이 점에서 직선까지의 부호 없는 수직 거리 d를 매 프레임 다시 계산한다.
 * P를 직선 가까이 끌면 d가 줄어 직선에 닿는(contact) 상태로 바뀌어 "이 점이 기준 guide line에서
 * 얼마나 벗어나 있는가"(alignment / proximity probe)라는 작업 흐름을 보인다.
 *
 * - InfiniteLinex.distanceToPoint: (line, P)에서 점까지의 부호 없는 수직 거리를 number로 직접
 *   반환한다. 양방향 무한 직선이라 d=0이 되는 곳은 직선 위 한 점뿐이고 "내부 영역"이 없다. scalar를
 *   직접 반환해 *Into companion이 없으므로 그대로 호출한다. 출력이 부호 있는 거리/side
 *   (signedDistanceToPoint)나 foot 점(projectPoint)이 아니라 단일 unsigned 거리인 점이
 *   다중 관계 workbench·형제 예제와의 구별점이다.
 */

import * as InfiniteLinex from '@cp949/vectra/infinite-line';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const LINE_COLOR = 0x64748b; // 무한 직선(떨어져 있을 때): 회색
const CONTACT_COLOR = 0xf87171; // P가 직선에 닿았을 때(거리 ≤ tol) 강조: 빨강
const CLEAR_COLOR = 0x38bdf8; // 수직 선분·직선 위 발 강조: 하늘색
const HANDLE_COLOR = 0xa78bfa; // 점 핸들 P (주 조작 대상): 보라
const HANDLE_R = 7; // P 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const TOP_MARGIN = 64; // 상단 label 영역을 피하는 clamp margin (px)
const ON_LINE_TOL = 2; // 색 표시 전용 visual threshold(px). distanceToPoint 인자가 아니다

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

  // 고정 무한 직선: 거리를 측정할 기준 guide line. 조작 대상이 아니다.
  // direction은 non-zero라 degenerate(directionLengthSq===0→origin-point 거리) 분기는 미발생.
  // object literal({ origin, direction }) structural Like 입력으로 구성한다.
  const line = {
    origin: { x: 200, y: 330 }, // 직선이 지나는 한 점
    direction: { x: 320, y: -150 }, // 직선 방향(정규화 불필요, distanceToPoint이 길이로 나눔)
  };

  // 점 핸들 P: 유일한 drag 대상. 직선까지의 수직 거리를 측정할 점이다
  const handle: XY = { x: 540, y: 130 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let d = 0; // 점 → 직선까지의 부호 없는 수직 거리 (distanceToPoint 출력)
  let onLine = false; // d <= ON_LINE_TOL → 시각상 직선에 닿음
  let foot: XY = { x: 0, y: 0 }; // 직선 위 수선의 발 (같은 투영 산술 inline, projectPoint 미호출)

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

  const rebuild = (): void => {
    // 단일 핵심 관계: 점 → 무한 직선까지의 부호 없는 수직 거리
    d = InfiniteLinex.distanceToPoint(line, handle);
    onLine = d <= ON_LINE_TOL; // 색 표시 전용 판정 (d는 항상 참 거리)

    // 수선의 발 foot: P를 직선에 투영한 점. distanceToPoint이 쓰는 것과 같은 투영 산술을 inline으로
    // 구해 projectPoint(두 번째 API)를 끌어오지 않는다.
    const dx = line.direction.x;
    const dy = line.direction.y;
    const lenSq = dx * dx + dy * dy; // 고정 non-zero direction이라 0 아님
    const t = ((handle.x - line.origin.x) * dx + (handle.y - line.origin.y) * dy) / lenSq;
    foot = { x: line.origin.x + t * dx, y: line.origin.y + t * dy };
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

  // 무한 직선을 화면 양 끝까지 늘린 두 끝점을 구한다(시각화 전용, 충분히 큰 길이로 외삽)
  const lineEndpoints = (): [XY, XY] => {
    const dx = line.direction.x;
    const dy = line.direction.y;
    const len = Math.hypot(dx, dy);
    const k = (size.width + size.height) / len; // 화면을 확실히 가로지르는 배율
    return [
      { x: line.origin.x - dx * k, y: line.origin.y - dy * k },
      { x: line.origin.x + dx * k, y: line.origin.y + dy * k },
    ];
  };

  const render = (): void => {
    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: BG_COLOR });

    // 닿음 여부에 따라 직선 색 전환: 닿으면 contact, 아니면 평소 색
    const lineStroke = onLine ? CONTACT_COLOR : LINE_COLOR;

    // 고정 무한 직선 (양방향 외삽)
    const [p0, p1] = lineEndpoints();
    g.moveTo(p0.x, p0.y).lineTo(p1.x, p1.y).stroke({ color: lineStroke, width: 2 });

    if (!onLine) {
      // 수직 선분: 직선 위 발 → P. 이 선분 길이가 곧 거리 d다
      g.moveTo(foot.x, foot.y).lineTo(handle.x, handle.y).stroke({ color: CLEAR_COLOR, width: 2 });

      // 직선 위 수선의 발 marker (거리 d가 측정되는 발)
      g.circle(foot.x, foot.y, 5).fill({ color: CLEAR_COLOR });

      // 직각 marker: 수직임을 표시 (foot에서 직선 방향·수선 방향으로 작은 ㄱ자)
      const len = Math.hypot(line.direction.x, line.direction.y);
      const ux = line.direction.x / len; // 직선 단위 방향
      const uy = line.direction.y / len;
      const nx = (handle.x - foot.x) / d; // 수선 단위 방향 (foot→P)
      const ny = (handle.y - foot.y) / d;
      const s = 12; // 직각 marker 변 길이 (px)
      const c1: XY = { x: foot.x + ux * s, y: foot.y + uy * s };
      const c2: XY = { x: c1.x + nx * s, y: c1.y + ny * s };
      const c3: XY = { x: foot.x + nx * s, y: foot.y + ny * s };
      g.moveTo(c1.x, c1.y).lineTo(c2.x, c2.y).lineTo(c3.x, c3.y).stroke({ color: CLEAR_COLOR, width: 1 });
    }

    // 점 핸들 P (주 조작 대상): 닿으면 contact 색으로 강조
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: onLine ? CONTACT_COLOR : HANDLE_COLOR, width: grabbed ? 3 : 2 });

    label.text = [`d     : ${d.toFixed(1)}   drag P`, `status: ${onLine ? 'on line (touching)' : 'off line'}`].join(
      '\n'
    );
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
