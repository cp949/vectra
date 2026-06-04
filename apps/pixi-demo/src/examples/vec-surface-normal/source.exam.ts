/**
 * Vec Surface Normal
 *
 * 화면 고정 anchor(표면/벽 위 한 점)에서 direction 핸들 1개를 drag하면 `normalLeft`이
 * 표면 방향 벡터(anchor→handle)에 수직인 **단위 법선**을 다시 계산한다. 핸들을 멀리/가까이
 * 끌어도 법선 arrow 길이는 항상 일정하고(단위 벡터라 크기가 정규화됨) 표면 방향에 대해 항상
 * 90°를 이뤄, "표면/벽의 방향에서 바깥 법선(수직 단위 벡터)을 얻는다"는 작업 흐름을 보인다.
 *
 * - Vectors.normalLeft: input 벡터의 CCW 수직 방향 `(-y, x)`를 normalize한 단위 법선을 새
 *   object로 반환한다. zero vector 입력이면 throw 없이 (0,0)을 반환한다. drag당 1회 단발
 *   결과라 allocating companion을 그대로 호출한다(out-buffer scaffold 미사용).
 */

import * as Vectors from '@cp949/vectra/vec';

type XY = { x: number; y: number };

const ANCHOR_COLOR = 0x94a3b8; // 고정 anchor(표면 위 점) marker: 연회색 (조작 대상 아님)
const SURFACE_COLOR = 0x334155; // 표면 방향선 anchor→handle(실제 거리 전체): 어두운 회색
const NORMAL_COLOR = 0x34d399; // 단위 법선 arrow(고정 길이): 청록
const HANDLE_COLOR = 0xa78bfa; // direction 핸들(주 조작 대상): 보라
const WARN_COLOR = 0xf97316; // 핸들을 anchor에 겹침 → 법선 (0,0) 붕괴 warn: 주황
const HANDLE_R = 7; // 핸들 반지름 (px)
const MARGIN = 24; // 핸들 화면 clamp margin (px)
const NORMAL_LEN = 96; // 단위 법선을 그릴 고정 길이 (px) — 거리와 무관함을 보이는 핵심 상수
const DEGEN_EPS = 2; // 방향 붕괴 판정 임계 (px)

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

  // 고정 anchor(표면/벽 위 한 점). 법선의 시작점이며 조작 대상이 아니다
  const anchor: XY = { x: 260, y: 250 };

  // direction 핸들: 유일한 drag 대상. 표면 방향(anchor→handle) 하나를 정한다
  const handle: XY = { x: 520, y: 250 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let normal: XY = { x: 0, y: 0 }; // 표면 방향에 수직인 단위 법선
  let normalTip: XY = { x: 0, y: 0 }; // anchor + normal·NORMAL_LEN (법선 arrow 끝점)
  let dirLen = 0; // |anchor→handle| 표면 방향 길이 (법선에는 영향 없음, degenerate 판정용)
  let normalDeg = 0; // 단위 법선의 각 (= atan2(normal), 같은 벡터의 방향 표현)
  let normalLen = 0; // |normal| (단위라 항상 1, 붕괴 시 0)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → 표면 방향이 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 표면 방향 벡터 (anchor→handle). 길이는 drag 거리에 따라 변한다
    const dir: XY = { x: handle.x - anchor.x, y: handle.y - anchor.y };

    // 단일 핵심 관계: 표면 방향에 수직인 단위 법선. 입력 길이는 정규화되어 사라진다
    normal = Vectors.normalLeft(dir);

    // 단위 법선을 고정 길이 NORMAL_LEN으로 시각화 → 핸들이 멀어도 arrow 길이는 그대로
    normalTip = { x: anchor.x + normal.x * NORMAL_LEN, y: anchor.y + normal.y * NORMAL_LEN };

    dirLen = Math.hypot(dir.x, dir.y); // degenerate 판정용 (방향 붕괴)
    normalLen = Math.hypot(normal.x, normal.y); // 단위 길이 불변(1) 확인용, 붕괴 시 0
    normalDeg = (Math.atan2(normal.y, normal.x) * 180) / Math.PI; // 같은 단위 법선의 방향 표현
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // direction 핸들 근처를 누르면 잡는다 (핸들이 유일한 조작 대상)
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
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 핸들을 anchor에 겹치면 방향이 0이 되어 법선이 (0,0)으로 붕괴 → warn
    const degenerate = dirLen <= DEGEN_EPS;
    const normalStroke = degenerate ? WARN_COLOR : NORMAL_COLOR;

    // 표면 방향선: anchor→handle 실제 거리 전체 (법선 arrow와의 길이 대비 = 수직만 남기고 크기 버림)
    g.moveTo(anchor.x, anchor.y).lineTo(handle.x, handle.y).stroke({ color: SURFACE_COLOR, width: 2 });

    if (!degenerate) {
      // 직각(⟂) 표식: anchor 코너에서 표면 방향·법선 두 축으로 작은 정사각형을 그려 90°를 보인다
      const q = 14; // 직각 표식 변 길이 (px)
      const ux = (handle.x - anchor.x) / dirLen; // 표면 방향 단위 벡터
      const uy = (handle.y - anchor.y) / dirLen;
      const c1x = anchor.x + ux * q;
      const c1y = anchor.y + uy * q;
      const c2x = anchor.x + normal.x * q;
      const c2y = anchor.y + normal.y * q;
      g.moveTo(c1x, c1y)
        .lineTo(c1x + normal.x * q, c1y + normal.y * q)
        .lineTo(c2x, c2y)
        .stroke({ color: 0x475569, width: 1 });
    }

    // 법선 arrow 몸통: anchor → normalTip (단위 방향·고정 길이)
    g.moveTo(anchor.x, anchor.y).lineTo(normalTip.x, normalTip.y).stroke({ color: normalStroke, width: 4 });

    if (!degenerate) {
      // 화살촉: normalTip에서 법선 반대로 두 갈래. normal에 수직인 (−normal.y, normal.x)로 벌린다
      const back = 14; // 화살촉 뒤로 물러나는 길이 (px)
      const wing = 8; // 화살촉 좌우 벌림 (px)
      const bx = normalTip.x - normal.x * back;
      const by = normalTip.y - normal.y * back;
      const wx = -normal.y; // normal에 수직인 단위 벡터
      const wy = normal.x;
      g.moveTo(normalTip.x, normalTip.y)
        .lineTo(bx + wx * wing, by + wy * wing)
        .stroke({ color: normalStroke, width: 4 });
      g.moveTo(normalTip.x, normalTip.y)
        .lineTo(bx - wx * wing, by - wy * wing)
        .stroke({ color: normalStroke, width: 4 });
    }

    // 고정 anchor(표면 위 점) marker
    g.circle(anchor.x, anchor.y, 6).fill({ color: ANCHOR_COLOR });

    // direction 핸들 (주 조작 대상)
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: HANDLE_COLOR, width: grabbed ? 3 : 2 });

    // 표면 방향과 법선 사이 각 (항상 90°, 붕괴 시 방향 미정으로 NaN)
    const perpDeg = degenerate ? Number.NaN : 90;

    label.text = [
      `n   : (${normal.x.toFixed(2)}, ${normal.y.toFixed(2)})   drag the handle`,
      `⟂   : ${perpDeg.toFixed(0)}°`,
      `|n| : ${normalLen.toFixed(2)}${degenerate ? '  (collapsed)' : '  (unit)'}`,
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
