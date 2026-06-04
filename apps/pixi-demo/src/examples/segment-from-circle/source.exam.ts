/**
 * Segment From Circle
 *
 * 화면 고정 원(circle) 둘레에서 angle 핸들 1개를 drag하면 `fromCircle`이 원의 중심을 지나는
 * 지름(diameter) 선분을 그 angle 방향으로 다시 구성한다. 핸들이 지름 방향각 하나만 정하므로
 * 두 끝점은 항상 원 둘레 위에, 중심은 항상 두 끝점의 중점에 놓이고 길이는 항상 2r이다.
 * "컴퍼스/제도에서 원의 지름을 각도만 돌려 긋는다"는 구성 작업 흐름을 보인다.
 *
 * - Segments.fromCircle: (circle, angle)에서 dir = (cos angle, sin angle), a = center − dir·r,
 *   b = center + dir·r인 지름 선분을 새 object로 구성한다. drag당 1회 단발 결과라 allocating
 *   companion을 그대로 호출한다(out-buffer scaffold 미사용).
 */

import * as Segments from '@cp949/vectra/segment';

type XY = { x: number; y: number };
type Segment = { a: XY; b: XY };

const CIRCLE_COLOR = 0x475569; // 고정 원 둘레: 회색 (조작 대상 아님)
const DIAMETER_COLOR = 0x38bdf8; // 구성된 지름 선분: 하늘색
const CENTER_COLOR = 0x94a3b8; // 원 중심(= 지름의 중점) marker: 연회색
const ENDPOINT_COLOR = 0xa78bfa; // 지름 끝점 a(handle 반대쪽) marker: 보라
const HANDLE_R = 7; // angle 핸들 반지름 (px)
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

  // 화면 고정 원. center·radius 모두 고정이라 지름 길이는 항상 2r (조작 대상 아님)
  const circle = { center: { x: 360, y: 220 }, radius: 150 };

  // angle 핸들: 주 drag 대상. 지름 방향각 angle 하나를 정한다
  const handle: XY = { x: 540, y: 220 };

  // drag 시에만 갱신하는 geometry state (ticker render는 이 state만 읽어 프레임당 할당 없음)
  let diameter: Segment = { a: { x: 0, y: 0 }, b: { x: 0, y: 0 } };
  let angleDeg = 0; // 지름 방향각 (도)
  let radiusA = 0; // |center → a| (항상 r: 끝점이 원 위라는 정의 성질)
  let radiusB = 0; // |center → b| (항상 r)

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const r = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  // 핸들을 화면 안으로 clamp → atan2 입력이 항상 finite (non-finite pass-through 미발생)
  const clampToScreen = (p: XY): void => {
    handle.x = Math.max(MARGIN, Math.min(size.width - MARGIN, p.x));
    handle.y = Math.max(MARGIN, Math.min(size.height - MARGIN, p.y));
  };

  // 핸들 위치에서 지름 방향각을 뽑아 지름 선분을 다시 구성한다 (drag 1회마다 호출)
  const rebuild = (): void => {
    // 지름 방향각: 중심에서 핸들로 향하는 각 (radius·거리와 무관, 방향만 사용)
    const angle = Math.atan2(handle.y - circle.center.y, handle.x - circle.center.x);
    angleDeg = (angle * 180) / Math.PI;
    // 핵심 호출: 중심을 지나 angle 방향으로 뻗는 지름 선분 (b = center + dir·r, a = center − dir·r)
    diameter = Segments.fromCircle(circle, angle) as Segment;
    // 두 끝점의 중심까지 거리를 inline으로 측정해 "끝점이 원 위(= r)"임을 확인 (별도 import 없음)
    radiusA = Math.hypot(diameter.a.x - circle.center.x, diameter.a.y - circle.center.y);
    radiusB = Math.hypot(diameter.b.x - circle.center.x, diameter.b.y - circle.center.y);
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // 지름 끝점 b(= angle 방향 끝점) 근처를 누르면 잡는다 (b가 유일한 조작 대상)
    grabbed = Math.hypot(p.x - diameter.b.x, p.y - diameter.b.y) <= HANDLE_R + 16;
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

    // 고정 원 둘레
    g.circle(circle.center.x, circle.center.y, circle.radius).stroke({ color: CIRCLE_COLOR, width: 2 });

    // 구성된 지름 선분: a → b (중심을 지난다)
    g.moveTo(diameter.a.x, diameter.a.y).lineTo(diameter.b.x, diameter.b.y).stroke({ color: DIAMETER_COLOR, width: 3 });

    // 원 중심(= 지름의 중점) marker
    g.circle(circle.center.x, circle.center.y, 4).fill({ color: CENTER_COLOR });

    // 지름 끝점 a (handle 반대쪽, 항상 원 위)
    g.circle(diameter.a.x, diameter.a.y, 5).fill({ color: ENDPOINT_COLOR });

    // angle 핸들 (= 지름 끝점 b, 항상 원 위)
    g.circle(diameter.b.x, diameter.b.y, grabbed ? HANDLE_R + 2 : HANDLE_R)
      .fill({ color: 0x0f172a })
      .stroke({ color: DIAMETER_COLOR, width: grabbed ? 3 : 2 });

    label.text = [
      `angle : ${angleDeg.toFixed(1)}°   drag endpoint`,
      `len   : ${(radiusA + radiusB).toFixed(0)} px  (= 2r)`,
      `radius: |c→a|=${radiusA.toFixed(0)}  |c→b|=${radiusB.toFixed(0)}`,
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
