/**
 * Matrix Mirror Reflection
 *
 * 화면 중앙 고정 pivot을 통과하는 거울 축 handle을 pivot 둘레로 drag하면, 고정 source 도형이
 * 그 축에 대해 반사(mirror)된 결과가 갱신된다. 반사는 orientation을 뒤집으므로 source가 ccw면
 * reflected는 cw가 되고, determinant는 항상 -1이다.
 *
 * - Matrix.reflectionInto: 거울 축 방향각 θ로 원점 통과 축 반사 행렬 기록
 * - Matrix.translationMatrixInto: pivot으로 축을 옮기는 ±pivot 보정 translation 기록
 * - Matrix.multiplyInto: T(+pivot) ∘ reflection ∘ T(-pivot)을 합성해 pivot 기준 반사 행렬 생성
 * - Matrix.transformPointInto: 합성 행렬을 source corner에 적용해 reflected corner 계산
 * - Matrix.determinant: 반사 행렬의 행렬식(-1)으로 winding 뒤집힘을 수치로 확인
 */

import * as Matrix from '@cp949/vectra/matrix';

type XY = { x: number; y: number };

export function setup(runtime: PixiRuntime): () => void {
  const { PIXI, app, size } = runtime;

  const g = new PIXI.Graphics();
  app.stage.addChild(g);

  const label = new PIXI.Text({
    text: '',
    style: { fill: 0x94a3b8, fontFamily: 'monospace', fontSize: 13 },
  });
  label.position.set(16, 16);
  app.stage.addChild(label);

  // 거울 축이 지나는 pivot (화면 중앙 고정)
  const pivot: XY = { x: size.width / 2, y: size.height / 2 };

  // 반사 대상 source 도형: 비대칭 arrow 폴리곤. 비대칭이라 반사 시 좌우/winding 뒤집힘이 보인다
  const source: XY[] = [
    { x: pivot.x - 200, y: pivot.y - 70 },
    { x: pivot.x - 60, y: pivot.y - 70 },
    { x: pivot.x - 60, y: pivot.y - 110 },
    { x: pivot.x + 10, y: pivot.y - 40 },
    { x: pivot.x - 60, y: pivot.y + 30 },
    { x: pivot.x - 60, y: pivot.y - 10 },
    { x: pivot.x - 200, y: pivot.y - 10 },
  ];

  // 거울 축 방향각(radian). 처음엔 약간 기울인 축으로 효과를 바로 보인다
  let axisAngle = (25 * Math.PI) / 180;

  const HIT_TOLERANCE = 16;
  const HANDLE_DIST = 150; // pivot에서 축 handle까지 거리(고정)
  let grabbed = false;

  // 매 프레임 재기록하는 held buffer (allocation-free hot path)
  const refl = Matrix.createMatrix(); // 원점 통과 축 반사
  const tNeg = Matrix.createMatrix(); // T(-pivot)
  const tPos = Matrix.createMatrix(); // T(+pivot)
  const tmp = Matrix.createMatrix(); // reflection ∘ T(-pivot)
  const matrix = Matrix.createMatrix(); // 최종 M = T(+pivot) ∘ reflection ∘ T(-pivot)
  const reflected = source.map(() => ({ x: 0, y: 0 }));

  const getCanvasXY = (e: PointerEvent): XY => {
    const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // 현재 axisAngle로 pivot 기준 반사 행렬을 만들고 source corner를 reflected로 변환한다
  const rebuild = (): void => {
    // 원점 통과 축 반사. pivot 통과로 옮기려면 ±pivot translation으로 감싼다
    Matrix.reflectionInto(refl, axisAngle);
    Matrix.translationMatrixInto(tNeg, { x: -pivot.x, y: -pivot.y });
    Matrix.translationMatrixInto(tPos, { x: pivot.x, y: pivot.y });
    // multiplyInto(out, left, right)는 point 기준 right 먼저 적용 → 안쪽부터 합성
    Matrix.multiplyInto(tmp, refl, tNeg); // reflection ∘ T(-pivot)
    Matrix.multiplyInto(matrix, tPos, tmp); // T(+pivot) ∘ (reflection ∘ T(-pivot))
    for (let i = 0; i < source.length; i++) {
      Matrix.transformPointInto(reflected[i], matrix, source[i]);
    }
  };

  // 축 handle의 현재 화면 위치 (pivot에서 axisAngle 방향으로 HANDLE_DIST)
  const handlePos = (): XY => ({
    x: pivot.x + Math.cos(axisAngle) * HANDLE_DIST,
    y: pivot.y + Math.sin(axisAngle) * HANDLE_DIST,
  });

  const onPointerDown = (e: PointerEvent): void => {
    const cursor = getCanvasXY(e);
    const h = handlePos();
    const dx = cursor.x - h.x;
    const dy = cursor.y - h.y;
    grabbed = dx * dx + dy * dy <= HIT_TOLERANCE * HIT_TOLERANCE;
  };

  const onPointerMove = (e: PointerEvent): void => {
    if (!grabbed) return;
    const cursor = getCanvasXY(e);
    // 커서와 pivot이 이루는 각으로 거울 축 방향을 역산한다
    axisAngle = Math.atan2(cursor.y - pivot.y, cursor.x - pivot.x);
  };

  const onPointerUp = (): void => {
    grabbed = false;
  };

  const canvas = app.canvas as HTMLCanvasElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);

  const toDeg = (r: number): number => Math.round((r * 180) / Math.PI);

  // 표시용 signed area(2배). 부호로 winding(ccw/cw)을 읽는다. vectra API를 늘리지 않는다
  const signedArea2 = (pts: XY[]): number => {
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      s += a.x * b.y - b.x * a.y;
    }
    return s;
  };

  const drawPoly = (pts: XY[]): void => {
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
  };

  const render = (): void => {
    rebuild();
    const h = handlePos();

    g.clear();

    // 거울 축을 pivot 통과 직선으로 화면 끝까지 연장
    const far = size.width + size.height;
    const ux = Math.cos(axisAngle);
    const uy = Math.sin(axisAngle);
    g.moveTo(pivot.x - ux * far, pivot.y - uy * far)
      .lineTo(pivot.x + ux * far, pivot.y + uy * far)
      .stroke({ color: 0xf59e0b, width: 2, alpha: 0.8 });

    // source 도형(파랑)
    drawPoly(source);
    g.fill({ color: 0x38bdf8, alpha: 0.14 }).stroke({ color: 0x38bdf8, width: 2 });

    // reflected 도형(분홍) — winding이 뒤집힌 거울상
    drawPoly(reflected);
    g.fill({ color: 0xf472b6, alpha: 0.14 }).stroke({ color: 0xf472b6, width: 2 });

    // pivot marker와 축 handle
    g.circle(pivot.x, pivot.y, 4).fill({ color: 0xe2e8f0 });
    g.circle(h.x, h.y, grabbed ? 9 : 7).fill({ color: 0xf59e0b });

    // diagnostics: 축 각도, 반사 행렬식(-1), source↔reflected winding 부호 뒤집힘
    const det = Matrix.determinant(matrix);
    const srcCcw = signedArea2(source) > 0;
    const refCcw = signedArea2(reflected) > 0;
    label.text = [
      `axis θ  : ${toDeg(axisAngle)}°   drag handle`,
      `det     : ${det.toFixed(3)}`,
      `winding : src ${srcCcw ? 'ccw' : 'cw'} -> ref ${refCcw ? 'ccw' : 'cw'}`,
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
