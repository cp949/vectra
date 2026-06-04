/**
 * Segment Ellipse Exit
 *
 * 타원 내부에 한쪽 끝(A)이 고정된 probe 선분의 바깥쪽 끝(B)을 드래그하면, 그 선분이 타원 경계를
 * 통과하는 단 하나의 지점(exit point)을 매 프레임 다시 계산해 경계 위 marker로 그린다. B를 타원 안으로
 * 끌어 선분 전체가 내부에 들어가면(contained) 통과 지점이 없어 marker가 사라진다. "내부 기준점에서 뻗은
 * 선분이 경계를 어디서 벗어나는가"(boundary exit probe)라는 작업 흐름을 보인다.
 *
 * - Intersects.singleIntersectionSegmentEllipse: segment와 ellipse의 교점이 **정확히 1개일 때만** 그 점을
 *   새 object로 반환하고, 0개(contained)거나 2개(가로지름)면 undefined를 반환한다. A가 타원 내부에
 *   고정되어 있어 B가 바깥이면 경계를 한 번만 통과 → 항상 단일 exit point, B가 안쪽이면 contained →
 *   undefined가 되는 binary 동작이 곧 이 `singleIntersection` semantic의 시연이다. 단발성 결과라
 *   allocating companion을 매 프레임 직접 호출한다(*Into out-object scaffold 불필요).
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Ellipse = { center: XY; radiusX: number; radiusY: number };

const EXIT_COLOR = 0xf87171; // 경계 통과(exit): 빨강
const INSIDE_COLOR = 0x60a5fa; // 선분 전체 내부(contained): 파랑
const M = 16; // 화면 가장자리 margin (px)
const GRAB_R = 16; // B handle 잡기 반경 (px)

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

  // 고정 타원 (조작 대상 아님). radiusX ≠ radiusY라 원이 아닌 타원 경계로 통과점을 본다.
  const ellipse: Ellipse = { center: { x: 380, y: 230 }, radiusX: 170, radiusY: 110 };

  // 선분 내부 anchor A (조작 대상 아님). 타원 내부에 고정 → 항상 "교점 정확히 1개" case로 유도.
  const a: XY = { x: 340, y: 250 };
  // 선분 바깥 끝 B. 주 drag 대상. 시작 위치는 타원 밖 우측.
  const b: XY = { x: 620, y: 150 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // B handle 근처를 누르면 잡는다
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    grabbed = dx * dx + dy * dy <= GRAB_R * GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // B를 화면 안으로 clamp → 항상 finite 입력 (NaN/Infinity 회피)
    b.x = Math.max(M, Math.min(size.width - M, p.x));
    b.y = Math.max(M, Math.min(size.height - M, p.y));
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
    // segment 입력: 내부 anchor A → 드래그 끝 B
    const segment = { a, b };

    // 핵심 호출: 선분이 타원 경계를 정확히 한 번 통과하면 그 exit point, 아니면 undefined.
    // A가 내부 고정이므로 B 바깥 ⇒ 점 1개, B 안쪽 ⇒ contained(undefined).
    const exit = Intersects.singleIntersectionSegmentEllipse(segment, ellipse);
    const hit = exit !== undefined;
    const stateColor = hit ? EXIT_COLOR : INSIDE_COLOR;

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 타원 경계 (closed region). exit가 있으면 경계를 통과했음을 색으로 강조.
    g.ellipse(ellipse.center.x, ellipse.center.y, ellipse.radiusX, ellipse.radiusY).stroke({
      color: stateColor,
      width: 3,
      alpha: 0.9,
    });
    g.ellipse(ellipse.center.x, ellipse.center.y, ellipse.radiusX, ellipse.radiusY).fill({
      color: stateColor,
      alpha: 0.08,
    });

    // probe 선분 A → B
    g.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color: stateColor, width: 2, alpha: 0.85 });

    // 내부 anchor A (고정 기준점)
    g.circle(a.x, a.y, 5).fill({ color: 0xfacc15 });
    // 드래그 끝 B (잡으면 더 크게)
    g.circle(b.x, b.y, grabbed ? 9 : 7).fill({ color: 0xe2e8f0 });

    // exit point marker: 선분이 경계를 통과하는 단일 교점
    if (exit) {
      g.circle(exit.x, exit.y, 6).fill({ color: EXIT_COLOR });
      g.circle(exit.x, exit.y, 10).stroke({ color: EXIT_COLOR, width: 2, alpha: 0.7 });
    }

    label.text = [
      `state : ${hit ? 'exit' : 'contained'}`,
      `exit  : ${exit ? `(${exit.x.toFixed(1)}, ${exit.y.toFixed(1)})` : '—'}`,
      'drag B; pull it inside the ellipse to remove the exit point',
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
