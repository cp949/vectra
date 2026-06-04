/**
 * Circle Infinite Line Hit
 *
 * 화면 고정 pivot을 지나는 무한 직선의 방향을 aim 핸들로 돌리면, 그 직선이 고정 원(closed disk)에
 * 닿는지 매 프레임 boolean으로 판정한다. 닿으면 hit 색, 비껴가면 clear 색으로 바뀌어 "이 직선이
 * 원에 닿는가?"(infinite line vs circle hit-test)라는 작업 흐름을 보인다. 직선은 pivot의 앞·뒤
 * 양쪽으로 무한히 뻗으므로, aim을 원 반대로 돌려도 backward 연장선이 원을 지나면 hit=yes다.
 * forward(t ≥ 0)만 뻗는 ray와 달리 direction을 180° 뒤집어도 같은 직선이라 판정이 바뀌지 않는다.
 *
 * - Intersects.intersectsCircleInfiniteLine: circle과 infinite line이 교차하거나 접하면 true를
 *   반환한다. closed disk 판정이라 tangent(접점)도 true이고, radius ≤ 0이면 false다. boolean을
 *   직접 반환해 *Into companion이 없으므로 그대로 호출한다.
 */

import * as Intersects from '@cp949/vectra/intersects';

type XY = { x: number; y: number };
type Circle = { center: XY; radius: number };

const CLEAR_COLOR = 0x60a5fa; // 안 닿음: 파랑
const HIT_COLOR = 0xf87171; // 닿음: 빨강
const M = 16; // 화면 가장자리 margin (px)
const GRAB_R = 16; // aim 핸들 잡기 반경 (px)
const LINE_LEN = 2000; // 직선을 화면 밖까지 늘리는 길이 (px)

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

  // 직선이 항상 지나는 고정 pivot (조작 대상 아님). disk 밖에 둬 양방향 hit가 보이게 한다.
  const pivot: XY = { x: 150, y: 360 };
  // 직선 방향을 정하는 주 drag 대상. direction = aim − pivot.
  const aim: XY = { x: 470, y: 150 };
  // 고정 원형 타깃 (조작 대상 아님). radius는 고정 양수라 degenerate(radius ≤ 0) 미발생.
  const circle: Circle = { center: { x: 470, y: 240 }, radius: 70 };

  let grabbed = false;

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: PointerEvent): void => {
    const p = getCanvasXY(e);
    // aim 핸들 근처를 누르면 잡는다 (aim이 유일한 조작 대상)
    const dx = p.x - aim.x;
    const dy = p.y - aim.y;
    grabbed = dx * dx + dy * dy <= GRAB_R * GRAB_R;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const p = getCanvasXY(e);
    // aim을 화면 안으로 clamp → 항상 finite 입력 (NaN/Infinity 회피)
    aim.x = Math.max(M, Math.min(size.width - M, p.x));
    aim.y = Math.max(M, Math.min(size.height - M, p.y));
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
    // infinite line 입력: pivot을 지나 (aim − pivot) 방향으로 양쪽 무한히 뻗는 직선
    const dir: XY = { x: aim.x - pivot.x, y: aim.y - pivot.y };
    const infiniteLine = { origin: pivot, direction: dir };

    // 핵심 호출: 직선이 원(closed disk)에 닿으면 true (접점 tangent도 true).
    // aim을 pivot에 겹치면 direction zero라 직선이 ill-defined되는 degenerate는 핸들을
    // pivot과 떨어뜨려 두므로 발생하지 않는다.
    const hit = Intersects.intersectsCircleInfiniteLine(circle, infiniteLine);
    const stateColor = hit ? HIT_COLOR : CLEAR_COLOR;

    // 직선 그리기용 단위벡터 (그리기 전용 inline 계산, vectra 관계 아님)
    const len = Math.hypot(dir.x, dir.y) || 1;
    const ux = (dir.x / len) * LINE_LEN;
    const uy = (dir.y / len) * LINE_LEN;
    // pivot에서 앞(+)·뒤(−) 양쪽으로 연장한 두 끝점 → 무한 직선임을 보인다
    const aend: XY = { x: pivot.x + ux, y: pivot.y + uy };
    const bend: XY = { x: pivot.x - ux, y: pivot.y - uy };

    g.clear();
    g.rect(0, 0, size.width, size.height).fill({ color: 0x0f172a });

    // 원형 타깃: 채움 + 둘레 stroke (closed disk라 둘레 접점도 hit)
    g.circle(circle.center.x, circle.center.y, circle.radius).fill({ color: stateColor, alpha: 0.18 });
    g.circle(circle.center.x, circle.center.y, circle.radius).stroke({ color: stateColor, width: 3, alpha: 0.95 });
    g.circle(circle.center.x, circle.center.y, 3).fill({ color: stateColor });

    // 무한 직선: bend → aend (양방향). aim을 원 반대로 돌려도 반대쪽이 원을 지나면 hit
    g.moveTo(bend.x, bend.y).lineTo(aend.x, aend.y).stroke({ color: stateColor, width: 2, alpha: 0.85 });

    // pivot dot과 aim 핸들 (잡으면 더 크게)
    g.circle(pivot.x, pivot.y, 6).fill({ color: 0xfacc15 });
    g.circle(aim.x, aim.y, grabbed ? 9 : 7).fill({ color: 0xe2e8f0 });

    // 직선 각도 (diagnostics 표시용 inline, 같은 직선 입력의 분해)
    const lineDeg = (Math.atan2(dir.y, dir.x) * 180) / Math.PI;

    label.text = [
      `hit   : ${hit ? 'yes' : 'no '}`,
      `angle : ${lineDeg.toFixed(1)}°`,
      'drag the aim handle to rotate the line',
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
