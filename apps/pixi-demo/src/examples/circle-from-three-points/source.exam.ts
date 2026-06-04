/**
 * Circle From Three Points
 *
 * 화면 고정 두 점 A·B와 점 핸들 C 1개를 두고, C를 drag하면 `fromThreePoints(A, B, C)`이 세 점을
 * 모두 지나는 외접원(circumscribed circle)을 매 drag마다 다시 구성한다. C를 옮기면 외접원의 중심과
 * 반지름이 따라 바뀌고, C를 A·B를 잇는 직선 위로 끌어 세 점이 일직선이 되면 세 점을 지나는 원이
 * 정의되지 않아(반지름 무한대) 함수가 undefined를 반환해 warn 상태로 전환된다. "원 위를 지나야 하는
 * 세 점에서 그 원을 복원한다"(circumcircle 구성)는 작업 흐름을 보인다.
 *
 * - Circlex.fromThreePoints: 세 점을 지나는 외접원 `{center, radius}`를 새 object로 반환한다.
 *   세 점이 일직선/중복/비유한이면 외접원이 없어 undefined를 반환한다. 단발 object 결과라 allocating
 *   companion을 그대로 호출한다.
 */

import * as Circlex from '@cp949/vectra/circle';

type XY = { x: number; y: number };

const BG_COLOR = 0x0f172a; // 배경: 짙은 남색
const FIXED_COLOR = 0x64748b; // 고정 점 A·B (조작 대상 아님): 회색
const TRI_COLOR = 0x334155; // 세 입력 점을 잇는 보조 삼각형: 어두운 회색
const CIRCLE_COLOR = 0x38bdf8; // 외접원 둘레: 하늘색
const SPOKE_COLOR = 0x1e293b; // center→꼭짓점 등반지름 spoke (분해 표시): 어두운 회청색
const CENTER_COLOR = 0xa3e635; // 외접원 중심 marker: 연두
const WARN_COLOR = 0xf87171; // 세 점 일직선(외접원 정의 불가) warn: 빨강
const HANDLE_COLOR = 0xa78bfa; // 점 핸들 C (주 조작 대상): 보라
const HANDLE_R = 7; // C 핸들 반지름 (px)
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

  // 고정 두 점 A·B: 외접원이 지나야 하는 점이지만 조작 대상이 아니다
  const a: XY = { x: 230, y: 300 };
  const b: XY = { x: 490, y: 300 };

  // 점 핸들 C: 유일한 drag 대상. 세 번째 통과 점이다
  const handle: XY = { x: 360, y: 140 };

  // drag 시에만 갱신하는 state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let circle: { center: XY; radius: number } | undefined; // 외접원 (정의 불가면 undefined)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → C가 항상 finite (비유한 입력 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  const rebuild = (): void => {
    // 단일 핵심 관계: 세 점 → 외접원. 일직선/중복이면 undefined를 그대로 warn 신호로 쓴다
    // (별도 일직선 판정 산술을 두지 않는다)
    circle = Circlex.fromThreePoints(a, b, handle);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // C 핸들 근처를 누르면 잡는다 (C가 유일한 조작 대상)
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

    // 세 입력 점을 잇는 보조 삼각형: 외접원이 지나는 점들을 드러내는 표시
    const triStroke = circle ? TRI_COLOR : WARN_COLOR;
    g.moveTo(a.x, a.y)
      .lineTo(b.x, b.y)
      .lineTo(handle.x, handle.y)
      .lineTo(a.x, a.y)
      .stroke({ color: triStroke, width: 1 });

    if (circle) {
      // 외접원 둘레: 세 점을 모두 지난다
      g.circle(circle.center.x, circle.center.y, circle.radius).stroke({ color: CIRCLE_COLOR, width: 2 });

      // center→세 꼭짓점 spoke: 길이가 모두 같은 반지름 r임을 보이는 분해 표시 (두 번째 관계 아님)
      for (const p of [a, b, handle]) {
        g.moveTo(circle.center.x, circle.center.y).lineTo(p.x, p.y).stroke({ color: SPOKE_COLOR, width: 1 });
      }

      // 외접원 중심 marker
      g.circle(circle.center.x, circle.center.y, 4).fill({ color: CENTER_COLOR });
    }

    // 고정 두 점 A·B
    g.circle(a.x, a.y, 5).fill({ color: FIXED_COLOR });
    g.circle(b.x, b.y, 5).fill({ color: FIXED_COLOR });

    // 점 핸들 C (주 조작 대상): 외접원 정의 불가면 warn 색으로 강조
    g.circle(handle.x, handle.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: BG_COLOR })
      .stroke({ color: circle ? HANDLE_COLOR : WARN_COLOR, width: grabbed ? 3 : 2 });

    // diagnostics: 단일 외접원 출력을 중심·반지름·상태로 읽는다 (3개)
    label.text = [
      `center: ${circle ? `(${circle.center.x.toFixed(1)}, ${circle.center.y.toFixed(1)})` : '—'}   drag C`,
      `r     : ${circle ? circle.radius.toFixed(1) : '—'}`,
      `status: ${circle ? 'ok' : 'collinear (no circle)'}`,
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
