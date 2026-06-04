/**
 * Triangle Contains Point
 *
 * 화면 고정 triangle과 draggable probe 점을 두고, probe를 drag하면 점이 삼각형 안에 있는지 매 프레임
 * 판정한다. 내부면 triangle fill이 hit 색, 외부면 clear 색으로 바뀌어 "이 삼각형을 가리키는가?"라는
 * picking / selection hit-test 작업 흐름을 보인다.
 *
 * - Triangles.containsPoint: 세 꼭짓점이 만드는 면 안에 point가 있으면 boolean으로 true를 반환한다.
 *   closed boundary 정책이라 edge·vertex 위 point도 true다(경계를 별 상태로 나누려면 classifyPoint를
 *   쓴다). degenerate triangle(collinear, signed area 2x === 0)은 항상 false(여기선 고정 non-degenerate라
 *   미발생). boolean을 직접 반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Triangles from '@cp949/vectra/triangle';

type XY = { x: number; y: number };

const CLEAR_COLOR = 0x60a5fa; // 외부: 파랑
const HIT_COLOR = 0xf87171; // 내부: 빨강
const M = 16; // 화면 가장자리 margin (px) → probe 입력을 항상 finite로 유지
const GRAB_R = 18; // probe 잡기 반경 (px)

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

  // 고정 scalene triangle (조작 대상 아님). 세 변 길이가 모두 달라 형태가 또렷하다.
  // non-degenerate(세 점이 한 직선 위에 있지 않음)라 degenerate→false 분기는 발생하지 않는다.
  const triangle = {
    a: { x: 250, y: 110 }, // 위쪽 꼭짓점
    b: { x: 540, y: 250 }, // 오른쪽 아래 꼭짓점
    c: { x: 210, y: 350 }, // 왼쪽 아래 꼭짓점
  };

  // probe (유일 drag 대상). 초기 위치는 삼각형 밖 위쪽
  const probe: XY = { x: 380, y: 60 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // probe와의 거리로 잡기 판정
    grabbed = Math.hypot(probe.x - p.x, probe.y - p.y) <= GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // probe를 화면 안으로 clamp (자유 이동, 축 제약 없음)
    probe.x = Math.max(M, Math.min(size.width - M, p.x));
    probe.y = Math.max(M + 28, Math.min(size.height - M, p.y));
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const render = (): void => {
    // 핵심 호출: probe가 삼각형 면 안(경계 포함)에 있는지 boolean으로 판정
    const inside = Triangles.containsPoint(triangle, probe);

    // 내부면 hit(빨강), 외부면 clear(파랑)
    const stateColor = inside ? HIT_COLOR : CLEAR_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // triangle 면을 채우고(판정 결과 색) 같은 외곽에 stroke를 덧그린다
    g.poly([triangle.a.x, triangle.a.y, triangle.b.x, triangle.b.y, triangle.c.x, triangle.c.y]);
    g.fill({ color: stateColor, alpha: inside ? 0.32 : 0.14 });
    g.poly([triangle.a.x, triangle.a.y, triangle.b.x, triangle.b.y, triangle.c.x, triangle.c.y]);
    g.stroke({ color: stateColor, width: 2.5, alpha: 0.95 });

    // probe (유일 drag 대상). 내부 판정 색으로 칠해 fill과 상태를 일치시킨다
    g.circle(probe.x, probe.y, grabbed ? 9 : 7).fill({ color: 0xf8fafc });
    g.circle(probe.x, probe.y, grabbed ? 9 : 7).stroke({ color: stateColor, width: 2 });

    label.text = [
      `inside : ${inside ? 'yes' : 'no '}`,
      `probe  : (${probe.x.toFixed(0)}, ${probe.y.toFixed(0)})`,
      'drag the probe in and out of the triangle',
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
