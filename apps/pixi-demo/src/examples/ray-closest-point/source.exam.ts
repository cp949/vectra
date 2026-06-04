/**
 * Ray Closest Point
 *
 * 화면 고정 forward ray(origin O + 고정 방향)와 질의 점 핸들 P 1개를 두고, P를 drag하면
 * `closestPoint(ray, P)`가 ray 위에서 P와 가장 가까운 점(foot)을 매 drag마다 다시 구한다. ray는
 * forward(`t >= 0`)만 뻗으므로 P가 O 앞쪽에 있으면 발이 ray 위 수선의 발에 놓이고, P를 O 뒤로 끌면
 * 발이 ray를 벗어날 수 없어 origin O에 달라붙는다(clamp). "임의의 점을 forward ray로 투영한
 * 최근접점을 구한다"(origin clamp)는 작업 흐름을 보인다.
 *
 * - Rayx.closestPoint: ray 위 P 최근접점 `{x, y}`를 새 object로 반환한다. parameter `t`를 `[0, ∞)`로
 *   clamp하므로 P가 origin 뒤(t<0)면 발이 origin이 된다. 단발 drag 결과라 allocating companion을
 *   그대로 호출한다.
 * - Rayx.projectionT: 같은 관계의 unclamped parametric `t`. `t<0`이 곧 "origin 뒤로 투영"이라
 *   clamp가 일어나는 조건을 드러내는 분해 read다(두 번째 관계 아님).
 * - Rayx.distanceToPoint: 같은 관계의 최단 거리 scalar. clamp 후 발까지의 거리다(두 번째 관계 아님).
 */

import * as Rayx from '@cp949/vectra/ray';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const RAY_COLOR = 0x38bdf8; // forward ray(t>=0): 하늘색
const BACK_COLOR = 0x1e293b; // backward 연장선(ray 아님): 어두운 회청색
const ORIGIN_COLOR = 0x64748b; // ray origin O (고정): 회색
const DROP_COLOR = 0x94a3b8; // P→foot drop line: 밝은 회색
const FOOT_COLOR = 0xa3e635; // ray 위 최근접점 foot: 연두
const CLAMP_COLOR = 0xfbbf24; // origin clamp(t<0) accent: 호박색 (warn 아님)
const HANDLE_COLOR = 0xa78bfa; // 점 핸들 P (주 조작 대상): 보라
const HANDLE_R = 7; // P 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const RAY_LEN = 900; // forward ray 그리기 길이 (화면 밖까지)
const BACK_LEN = 120; // backward 연장선 그리기 길이
const TICK = 12; // 직각 marker 한 변 길이 (px)

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

  // 고정 forward ray: origin O + 단위에 가까운 고정 방향(우상향). 조작 대상이 아니다
  const ray = { origin: { x: 210, y: 320 }, direction: { x: 0.82, y: -0.57 } };
  // 그리기용 단위 방향 (고정 direction이라 1회만 계산)
  const dlen = Math.hypot(ray.direction.x, ray.direction.y);
  const ux = ray.direction.x / dlen;
  const uy = ray.direction.y / dlen;

  // 질의 점 핸들 P: 유일한 drag 대상
  const handle: XY = { x: 470, y: 150 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let foot: XY = { x: 0, y: 0 }; // ray 위 최근접점
  let t = 0; // unclamped 투영 parameter (음수면 origin clamp)
  let dist = 0; // P → 최근접점 최단 거리

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → P가 항상 finite (비유한 입력 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 단일 핵심 관계: 점 P → forward ray 최근접점. closestPoint가 t를 [0,∞)로 clamp한다
    foot = Rayx.closestPoint(ray, handle);
    // 같은 관계를 parameter/거리로 읽는 분해 read (clamp 조건과 거리)
    t = Rayx.projectionT(ray, handle);
    dist = Rayx.distanceToPoint(ray, handle);
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

    const ox = ray.origin.x;
    const oy = ray.origin.y;
    const clamped = t < 0; // origin 뒤로 투영 → foot가 origin에 clamp

    // backward 연장선(faint dashed 대신 faint 실선): ray가 forward만임을 강조 (ray 아님)
    g.moveTo(ox, oy)
      .lineTo(ox - ux * BACK_LEN, oy - uy * BACK_LEN)
      .stroke({ color: BACK_COLOR, width: 1 });

    // forward ray(t>=0): 실선 arrow
    const tipX = ox + ux * RAY_LEN;
    const tipY = oy + uy * RAY_LEN;
    g.moveTo(ox, oy).lineTo(tipX, tipY).stroke({ color: RAY_COLOR, width: 2 });

    // P → foot drop line: 최근접 관계의 분해 표시
    g.moveTo(handle.x, handle.y).lineTo(foot.x, foot.y).stroke({ color: DROP_COLOR, width: 1 });

    // 직각 marker: on-ray(t>=0)일 때만 그린다. clamp면 P→origin이 수직이 아니라 생략한다
    if (!clamped) {
      // foot 기준 ray 방향(±u)과 P 쪽 수직 방향(±perp)으로 작은 ㄱ자 marker
      const px = -uy; // ray 방향에 수직인 단위 벡터
      const py = ux;
      const side = (handle.x - foot.x) * px + (handle.y - foot.y) * py >= 0 ? 1 : -1;
      const ax = foot.x - ux * TICK; // ray 방향(뒤쪽)으로 한 변
      const ay = foot.y - uy * TICK;
      const bx = ax + side * px * TICK; // 거기서 P 쪽 수직으로 한 변
      const by = ay + side * py * TICK;
      const cx = foot.x + side * px * TICK;
      const cy = foot.y + side * py * TICK;
      g.moveTo(ax, ay).lineTo(bx, by).lineTo(cx, cy).stroke({ color: DROP_COLOR, width: 1 });
    }

    // ray origin O (고정)
    g.circle(ox, oy, 5).fill({ color: ORIGIN_COLOR });

    // 최근접점 foot: clamp면 호박색(origin에 붙음), on-ray면 연두
    g.circle(foot.x, foot.y, 5).fill({ color: clamped ? CLAMP_COLOR : FOOT_COLOR });

    // 점 핸들 P (주 조작 대상)
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    // diagnostics: 단일 최근접 관계를 parameter·거리·상태로 읽는다 (3개)
    label.text = [
      `t     : ${t.toFixed(2)}   drag P`,
      `dist  : ${dist.toFixed(1)}`,
      `status: ${clamped ? 'behind -> origin (clamped)' : 'on ray'}`,
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
