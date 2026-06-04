/**
 * Triangle Build Right
 *
 * 고정 직각 vertex A 둘레로 정점 B 핸들 1개를 drag하면 buildRight가 직각삼각형을 다시 구성한다.
 * 핸들 위치가 한 leg 길이(width)와 방향(angle)을 함께 정하고, 다른 leg(height)는 고정이라
 * 도형이 회전·스케일돼도 A의 직각은 항상 90°다. "직각삼각형을 세운다" 작업 흐름을 보인다.
 *
 * - Triangles.buildRight: origin·width·height·angle로 직각삼각형을 만든다. a=origin,
 *   b=origin + width·(cos angle, sin angle), c=origin + height·(-sin angle, cos angle).
 *   두 leg AB·AC가 직교해 A 내각이 항상 90°인 것이 이 구성의 정의 성질을 드러내는 분해 표시이지
 *   두 번째 관계가 아니다.
 */

import * as Triangles from '@cp949/vectra/triangle';

type XY = { x: number; y: number };

const TRI_COLOR = 0x34d399; // 정상 직각삼각형: 초록
const WARN_COLOR = 0xf87171; // width≈0 degenerate(B가 A에 겹침): 빨강
const ORIGIN_COLOR = 0x60a5fa; // 고정 직각 vertex A: 파랑
const RADIUS_COLOR = 0x475569; // A→B 방향 guide: faint
const SQUARE_COLOR = 0xfbbf24; // A 코너 직각 표시 정사각형: amber
const M = 16; // 화면 가장자리 margin (px) → pointer를 항상 finite로 유지
const GRAB_R = 18; // 정점 B 핸들 잡기 반경 (px)
const DEGEN_EPS = 2; // width ≤ 이 값이면 b가 a에 붕괴한 degenerate로 보고 warn 처리 (px)
const HEIGHT = 130; // 고정 leg 길이(origin→c). drag하지 않는 두 번째 leg.
const SQUARE_S = 18; // 직각 표시 정사각형 한 변 길이 (px)

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

  // 고정 직각 vertex A (조작 대상 아님). 직각삼각형의 직각 꼭짓점이자 회전·스케일 기준점.
  const origin: XY = { x: 360, y: 300 };

  // 정점 B 화면 좌표 state. 초기값은 A 오른쪽 위 → 초기 width·angle을 정한다.
  let bx = origin.x + 170;
  let by = origin.y - 50;

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 정점 B 핸들과의 거리로 잡기 판정
    grabbed = Math.hypot(bx - p.x, by - p.y) <= GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // pointer를 화면 안으로 clamp → 좌표는 항상 finite → width·angle도 finite
    bx = Math.max(M, Math.min(size.width - M, p.x));
    by = Math.max(M, Math.min(size.height - M, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const fmt = (n: number): string => n.toFixed(1);

  const render = (): void => {
    // 핸들 위치 → width(A→B 거리)와 angle(A→B 방향)을 함께 정한다. height는 고정 상수.
    const width = Math.hypot(bx - origin.x, by - origin.y);
    const angle = Math.atan2(by - origin.y, bx - origin.x);

    // 핵심 호출: origin + width + height + angle → 직각삼각형. drag로 정한 한 leg만 입력한다.
    // 단발 object 결과라 allocating companion을 쓴다(out-buffer 재사용 hot path 아님).
    // 음수 width/height·NaN/Infinity는 clamp/validation 없이 산술 그대로 흐르지만, width는 거리라
    // ≥0, height는 고정 양수, angle은 atan2라 finite → 라이브 미발생.
    const tri = Triangles.buildRight(origin, width, HEIGHT, angle);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // A→B 반지름 guide: 핸들이 origin 둘레를 도는 "강체 회전·스케일" 기준임을 드러낸다.
    g.moveTo(origin.x, origin.y).lineTo(tri.b.x, tri.b.y).stroke({ color: RADIUS_COLOR, width: 1, alpha: 0.7 });

    // width ≈ 0이면 b가 a에 붕괴한 면적 0 degenerate → warn 색으로 강조.
    const degenerate = width <= DEGEN_EPS;
    const stateColor = degenerate ? WARN_COLOR : TRI_COLOR;

    // 직각삼각형 면 + 외곽선
    const poly = [tri.a.x, tri.a.y, tri.b.x, tri.b.y, tri.c.x, tri.c.y];
    g.poly(poly).fill({ color: stateColor, alpha: degenerate ? 0.12 : 0.22 });
    g.poly(poly).stroke({ color: stateColor, width: 2.5, alpha: 0.95 });

    // A 코너 직각 표시 정사각형: 두 leg 단위 방향을 따라 작은 정사각형을 그려 A 내각이 90°(직교)임을
    // 드러낸다. 이는 직각삼각형 구성의 정의 성질을 보이는 inline 분해이지 두 번째 관계가 아니다.
    if (!degenerate) {
      const abLen = Math.hypot(tri.b.x - tri.a.x, tri.b.y - tri.a.y);
      const acLen = Math.hypot(tri.c.x - tri.a.x, tri.c.y - tri.a.y);
      const ux = (tri.b.x - tri.a.x) / abLen; // A→B 단위 방향
      const uy = (tri.b.y - tri.a.y) / abLen;
      const vx = (tri.c.x - tri.a.x) / acLen; // A→C 단위 방향(AB와 직교)
      const vy = (tri.c.y - tri.a.y) / acLen;
      g.moveTo(tri.a.x + ux * SQUARE_S, tri.a.y + uy * SQUARE_S)
        .lineTo(tri.a.x + (ux + vx) * SQUARE_S, tri.a.y + (uy + vy) * SQUARE_S)
        .lineTo(tri.a.x + vx * SQUARE_S, tri.a.y + vy * SQUARE_S)
        .stroke({ color: SQUARE_COLOR, width: 2, alpha: 0.95 });
    }

    // 고정 직각 vertex A marker
    g.circle(origin.x, origin.y, 5).fill({ color: ORIGIN_COLOR });

    // 정점 B 핸들 (유일 drag 대상)
    g.circle(tri.b.x, tri.b.y, grabbed ? 10 : 8).fill({ color: 0xf8fafc });
    g.circle(tri.b.x, tri.b.y, grabbed ? 10 : 8).stroke({ color: stateColor, width: 2 });

    // 두 leg 길이와 A 내각: 직각삼각형이라 A 내각은 항상 90°(두 leg 직교, atan2 inline).
    const legAB = Math.hypot(tri.b.x - tri.a.x, tri.b.y - tri.a.y);
    const legAC = Math.hypot(tri.c.x - tri.a.x, tri.c.y - tri.a.y);
    // A에서 두 leg 사이 각: 두 방향 벡터의 atan2 차이를 [0,180]로 환산. 항상 90°.
    const angAB = Math.atan2(tri.b.y - tri.a.y, tri.b.x - tri.a.x);
    const angAC = Math.atan2(tri.c.y - tri.a.y, tri.c.x - tri.a.x);
    let cornerDeg = Math.abs(((angAB - angAC) * 180) / Math.PI);
    if (cornerDeg > 180) cornerDeg = 360 - cornerDeg;

    label.text = [
      'right triangle from origin + width + height   drag vertex B',
      `width : ${fmt(width)}${degenerate ? '  (collapsed)' : ''}`,
      `height: ${fmt(legAC)}`,
      `angle@A: ${fmt(cornerDeg)}°`,
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
