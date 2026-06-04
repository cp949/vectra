/**
 * Ray Contains Point
 *
 * 화면 고정 forward ray(origin O + 고정 방향)와 질의 점 핸들 P 1개를 두고, P를 drag하면
 * `containsPoint(ray, P, tol)`이 "P가 ray 위에 (허용 오차 tol 안에서) 있는가"를 매 drag마다
 * boolean으로 판정한다. ray는 forward(`t >= 0`)만 뻗으므로 P가 허용 band 안이면서 O 앞쪽일 때만
 * on(true)이 되고, band를 벗어나거나 O 뒤로 끌면 off(false)가 된다. "포인터/탭이 시선·레이저·발사
 * 경로(ray) 위에 허용 오차 안에서 놓였는지 판정한다"(ray pick / hit-test with tolerance) 작업
 * 흐름을 보인다.
 *
 * 핵심 관계는 점 P → forward ray membership(boolean) 하나뿐이다. 핵심 구별점은 출력이 점이나
 * 거리가 아니라 boolean membership이고 forward(`t >= 0`)만 포함한다는 것이다. 최근접점(closestPoint,
 * 점 출력)을 보이는 ray-closest-point, ray×도형 교차(boolean)를 보이는 ray hit-test 예제와 출력
 * 성격이 다르다. triangle/rect의 영역 membership과 같은 boolean 판정 패턴이지만 "영역"이 두께 tol의
 * forward 1D corridor라는 점이 다르다.
 *
 * - Rayx.containsPoint: ray membership boolean. supporting line까지 거리가 `tol` 이내이고
 *   forward(`t >= 0`)면 true. 세 번째 인자 epsilon이 허용 오차다(기본 1e-9는 화면상 의미가 없어
 *   시각 tol을 명시 전달한다). boolean을 직접 반환해 `*Into` companion이 없고 그대로 호출한다.
 *
 * t(부호 있는 투영 parameter)·perp(supporting line까지 수직 거리)는 같은 membership 판정을
 * parameter·거리로 읽은 inline 분해 read이지 두 번째 관계가 아니다. perp는 unclamped 수직 거리라
 * forward clamp가 걸리는 거리 함수로 대체할 수 없어 inline 산술로 도출하고, t도 같은 투영 계산에서
 * inline으로 얻어 두 번째 API를 끌어오지 않는다.
 */

import * as Rayx from '@cp949/vectra/ray';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const RAY_COLOR = 0x38bdf8; // forward ray(t>=0): 하늘색
const BACK_COLOR = 0x1e293b; // backward 연장선(ray 아님): 어두운 회청색
const BAND_COLOR = 0x334155; // 허용 band(±tol corridor) 경계선: 흐린 회청색
const ORIGIN_COLOR = 0x64748b; // ray origin O (고정): 회색
const DROP_COLOR = 0x94a3b8; // P→supporting line 수직 drop line: 밝은 회색
const ON_COLOR = 0xa3e635; // on ray(membership true): 연두
const OFF_COLOR = 0x94a3b8; // off(membership false): 회색 (warn 아님)
const HANDLE_R = 7; // P 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const RAY_LEN = 900; // forward ray 그리기 길이 (화면 밖까지)
const BACK_LEN = 120; // backward 연장선 그리기 길이
const TOL = 12; // 허용 오차 epsilon = band 절반 두께 (px)

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

  // 고정 forward ray: origin O + 고정 방향(우상향). 조작 대상이 아니다
  const ray = { origin: { x: 200, y: 320 }, direction: { x: 0.82, y: -0.57 } };
  // 그리기용 단위 방향/법선 (고정 direction이라 1회만 계산)
  const dlen = Math.hypot(ray.direction.x, ray.direction.y);
  const ux = ray.direction.x / dlen; // ray 방향 단위 벡터
  const uy = ray.direction.y / dlen;
  const nx = -uy; // ray 방향에 수직인 단위 벡터(법선)
  const ny = ux;

  // 질의 점 핸들 P: 유일한 drag 대상
  const handle: XY = { x: 470, y: 150 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let onRay = false; // containsPoint 판정 결과(boolean)
  let t = 0; // 부호 있는 투영 parameter (음수면 origin 뒤)
  let perp = 0; // supporting line까지 수직 거리(unclamped)
  let foot: XY = { x: 0, y: 0 }; // supporting line 위 P 투영점

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
    // 단일 핵심 관계: 점 P → forward ray membership. tol 안 + forward면 true
    onRay = Rayx.containsPoint(ray, handle, TOL);
    // 같은 판정을 parameter/거리로 읽는 inline 분해 read (왜 on/off인지 설명)
    const relx = handle.x - ray.origin.x;
    const rely = handle.y - ray.origin.y;
    t = relx * ux + rely * uy; // ray 방향 투영(부호 있음, 음수=뒤쪽)
    perp = Math.abs(relx * nx + rely * ny); // 법선 방향 거리 = supporting line까지 수직 거리
    foot = { x: ray.origin.x + t * ux, y: ray.origin.y + t * uy };
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
    const tipX = ox + ux * RAY_LEN;
    const tipY = oy + uy * RAY_LEN;

    // backward 연장선: ray가 forward만임을 강조 (ray 아님, band도 없음)
    g.moveTo(ox, oy)
      .lineTo(ox - ux * BACK_LEN, oy - uy * BACK_LEN)
      .stroke({ color: BACK_COLOR, width: 1 });

    // 허용 band(±TOL corridor): membership 영역 = epsilon tol의 의미. forward 반만 그린다
    g.moveTo(ox + nx * TOL, oy + ny * TOL)
      .lineTo(tipX + nx * TOL, tipY + ny * TOL)
      .stroke({ color: BAND_COLOR, width: 1 });
    g.moveTo(ox - nx * TOL, oy - ny * TOL)
      .lineTo(tipX - nx * TOL, tipY - ny * TOL)
      .stroke({ color: BAND_COLOR, width: 1 });
    // band 시작 cap: origin에서 corridor가 열린다는 표시
    g.moveTo(ox + nx * TOL, oy + ny * TOL)
      .lineTo(ox - nx * TOL, oy - ny * TOL)
      .stroke({ color: BAND_COLOR, width: 1 });

    // forward ray(t>=0): 실선 중심선
    g.moveTo(ox, oy).lineTo(tipX, tipY).stroke({ color: RAY_COLOR, width: 2 });

    // P→supporting line 수직 drop line: perp의 의미. forward(t>=0)일 때만 그린다
    // (t<0이면 발이 origin 뒤라 forward ray membership과 무관)
    if (t >= 0) {
      g.moveTo(handle.x, handle.y).lineTo(foot.x, foot.y).stroke({ color: DROP_COLOR, width: 1 });
    }

    // ray origin O (고정)
    g.circle(ox, oy, 5).fill({ color: ORIGIN_COLOR });

    // 점 핸들 P (주 조작 대상): membership true면 ON(연두), false면 OFF(회색)
    const stateColor = onRay ? ON_COLOR : OFF_COLOR;
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: stateColor, width: grabbed ? 3 : 2 });

    // off 사유를 t/perp로 구분: 뒤쪽(t<0)인지 band 밖(perp>tol)인지
    const status = onRay ? 'on ray (within tol)' : t < 0 ? 'off (behind origin)' : 'off (outside band)';

    // diagnostics: 단일 membership 판정을 상태·parameter·수직 거리로 읽는다 (3개)
    label.text = [
      `status: ${status}   drag P`,
      `t     : ${t.toFixed(1)}`,
      `perp  : ${perp.toFixed(1)} (tol ${TOL})`,
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
