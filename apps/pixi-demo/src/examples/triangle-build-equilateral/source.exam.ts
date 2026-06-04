/**
 * Triangle Build Equilateral
 *
 * 고정 origin 정점 A 둘레로 정점 B 핸들 1개를 drag하면 buildEquilateral이 정삼각형을 다시
 * 구성한다. 핸들 위치가 한 변 길이(side)와 방향(angle)을 함께 정하므로, 도형 전체가 강체로
 * 회전·스케일된다. "정삼각형을 세운다(set square / 정삼각 도형 구성)" 작업 흐름을 보인다.
 *
 * - Triangles.buildEquilateral: origin·side·angle로 정삼각형을 만든다. a=origin,
 *   b=origin + side·(cos angle, sin angle), c=origin + side·(cos(angle+60°), sin(angle+60°)).
 *   세 변 |AB|=|BC|=|CA| 등길이는 이 구성의 정의 성질을 드러내는 분해 표시이지 두 번째 관계가 아니다.
 */

import * as Triangles from '@cp949/vectra/triangle';

type XY = { x: number; y: number };

const TRI_COLOR = 0x34d399; // 정상 정삼각형: 초록
const WARN_COLOR = 0xf87171; // side≈0 degenerate(B가 A에 겹침): 빨강
const ORIGIN_COLOR = 0x60a5fa; // 고정 origin 정점 A: 파랑
const RADIUS_COLOR = 0x475569; // A→B 방향 guide: faint
const M = 16; // 화면 가장자리 margin (px) → pointer를 항상 finite로 유지
const GRAB_R = 18; // 정점 B 핸들 잡기 반경 (px)
const DEGEN_EPS = 2; // side ≤ 이 값이면 세 vertex가 겹친 degenerate로 보고 warn 처리 (px)

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

  // 고정 origin 정점 A (조작 대상 아님). 정삼각형의 첫 vertex이자 회전·스케일 기준점.
  const origin: XY = { x: 360, y: 250 };

  // 정점 B 화면 좌표 state. 초기값은 A 오른쪽 위 → 초기 side·angle을 정한다.
  let bx = origin.x + 150;
  let by = origin.y - 60;

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
    // pointer를 화면 안으로 clamp → 좌표는 항상 finite → side·angle도 finite
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
  const deg = (rad: number): string => ((rad * 180) / Math.PI).toFixed(1);

  const render = (): void => {
    // 핸들 위치 → side(A→B 거리)와 angle(A→B 방향)을 함께 정한다.
    const side = Math.hypot(bx - origin.x, by - origin.y);
    const angle = Math.atan2(by - origin.y, bx - origin.x);

    // 핵심 호출: origin + side + angle → 정삼각형. drag로 정해진 한 변만 입력한다.
    // drag당 1회 단발 결과라 allocating companion을 쓴다(ticker render는 state만 그림).
    const tri = Triangles.buildEquilateral(origin, side, angle);

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // A→B 반지름 guide: 핸들이 origin 둘레를 도는 "강체 회전·스케일" 기준임을 드러낸다.
    g.moveTo(origin.x, origin.y).lineTo(tri.b.x, tri.b.y).stroke({ color: RADIUS_COLOR, width: 1, alpha: 0.7 });

    // side ≈ 0이면 세 vertex가 한 점에 겹친 degenerate → warn 색으로 강조.
    const degenerate = side <= DEGEN_EPS;
    const stateColor = degenerate ? WARN_COLOR : TRI_COLOR;

    // 정삼각형 면 + 외곽선
    const poly = [tri.a.x, tri.a.y, tri.b.x, tri.b.y, tri.c.x, tri.c.y];
    g.poly(poly).fill({ color: stateColor, alpha: degenerate ? 0.12 : 0.22 });
    g.poly(poly).stroke({ color: stateColor, width: 2.5, alpha: 0.95 });

    // 고정 origin 정점 A marker
    g.circle(origin.x, origin.y, 5).fill({ color: ORIGIN_COLOR });

    // 정점 B 핸들 (유일 drag 대상)
    g.circle(tri.b.x, tri.b.y, grabbed ? 10 : 8).fill({ color: 0xf8fafc });
    g.circle(tri.b.x, tri.b.y, grabbed ? 10 : 8).stroke({ color: stateColor, width: 2 });

    // 세 변 길이: 정삼각형이라 항상 |AB|≈|BC|≈|CA|(같은 구성의 정의 성질, Math.hypot inline).
    const legAB = Math.hypot(tri.b.x - tri.a.x, tri.b.y - tri.a.y);
    const legBC = Math.hypot(tri.c.x - tri.b.x, tri.c.y - tri.b.y);
    const legCA = Math.hypot(tri.a.x - tri.c.x, tri.a.y - tri.c.y);

    label.text = [
      'equilateral from origin + side   drag vertex B',
      `side  : ${fmt(side)}${degenerate ? '  (collapsed)' : ''}`,
      `angle : ${deg(angle)}°`,
      `sides : ${fmt(legAB)} = ${fmt(legBC)} = ${fmt(legCA)}`,
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
