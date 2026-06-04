/**
 * Matrix Transform
 *
 * 중앙에 놓인 원본 rect와, translation·rotation·scaling을 한 행렬로 합성해 변환한
 * rotated rect outline 및 그 AABB를 함께 그리고, 합성 행렬 성분과 변환된 원점을 표시한다.
 *
 * - Matrices.translationMatrixInto / rotationMatrixInto / scalingMatrixInto: 기본 변환 행렬 생성
 * - Matrices.degToRad: 회전 각을 라디안으로 변환
 * - Matrices.multiplyInto: 두 행렬을 합성해 단일 변환 행렬 구성
 * - Matrices.transformRectInto: 합성 행렬로 rect corner를 변환한 AABB 계산
 * - Matrices.transformPointInto: 합성 행렬로 원점 좌표 변환
 */
import * as Matrices from '@cp949/vectra/matrix';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { size, rect, draw: d } = runtime;
  const cx = size.width / 2;
  const cy = size.height / 2;

  d.clear(ctx, '#1e1e1e');

  // 원본 rect (중앙 기준)
  d.rect(
    ctx,
    { x: rect.x + cx, y: rect.y + cy, width: rect.width, height: rect.height },
    {
      fill: 'rgba(100, 116, 139, 0.2)',
      stroke: '#475569',
      strokeWidth: 1,
    }
  );
  d.label(ctx, 'original rect', { x: rect.x + cx, y: rect.y + cy - 8 }, { color: '#94a3b8' });

  // 행렬 조합: T(cx, cy) * R(30deg) * S(1.4, 0.9)
  // multiplyInto(out, left, right) — point에 right를 먼저 적용하고 left를 나중에 적용한다
  const T = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  const R = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  const S = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  const TR = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  const TRS = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

  Matrices.translationMatrixInto(T, { x: cx, y: cy });
  Matrices.rotationMatrixInto(R, Matrices.degToRad(30));
  Matrices.scalingMatrixInto(S, 1.4, 0.9);

  // T * R → TR, 이후 TR * S → TRS
  Matrices.multiplyInto(TR, T, R);
  Matrices.multiplyInto(TRS, TR, S);

  // transformRectInto는 rotated rect 자체가 아니라 transformed corner를 감싼 AABB를 반환한다
  const transformedBounds = { x: 0, y: 0, width: 0, height: 0 };
  Matrices.transformRectInto(transformedBounds, TRS, rect);

  const x2 = rect.x + rect.width;
  const y2 = rect.y + rect.height;
  const transformedRect = {
    points: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
  };
  Matrices.transformPointInto(transformedRect.points[0], TRS, { x: rect.x, y: rect.y });
  Matrices.transformPointInto(transformedRect.points[1], TRS, { x: x2, y: rect.y });
  Matrices.transformPointInto(transformedRect.points[2], TRS, { x: x2, y: y2 });
  Matrices.transformPointInto(transformedRect.points[3], TRS, { x: rect.x, y: y2 });

  d.rect(ctx, transformedBounds, { fill: 'rgba(56, 189, 248, 0.08)', stroke: '#0ea5e9', strokeWidth: 1 });
  d.polygon(ctx, transformedRect, { fill: 'rgba(56, 189, 248, 0.18)', stroke: '#38bdf8', strokeWidth: 2 });
  d.label(ctx, 'T * R(30°) * S(1.4, 0.9)', { x: transformedBounds.x + 4, y: transformedBounds.y - 10 }, { color: '#38bdf8' });

  // 원점과 변환된 중점 연결
  const origin = { x: 0, y: 0 };
  const transformedOrigin = { x: 0, y: 0 };
  Matrices.transformPointInto(transformedOrigin, TRS, origin);
  d.point(ctx, transformedOrigin, { color: '#4ade80', radius: 5 });

  // 행렬 값 정보
  d.label(ctx, `TRS.a=${TRS.a.toFixed(3)}  .b=${TRS.b.toFixed(3)}`, { x: 20, y: 30 }, { color: '#e2e8f0' });
  d.label(ctx, `TRS.c=${TRS.c.toFixed(3)}  .d=${TRS.d.toFixed(3)}`, { x: 20, y: 50 }, { color: '#e2e8f0' });
  d.label(ctx, `TRS.tx=${TRS.tx.toFixed(1)}  .ty=${TRS.ty.toFixed(1)}`, { x: 20, y: 70 }, { color: '#e2e8f0' });
}
