/**
 * Segment Snap
 *
 * pointer를 segment 위 최근접 점으로 snap하고 pointer에서 그 점까지 선을 그으며,
 * 투영 비율 t와 거리, segment 길이를 표시한다.
 *
 * - Segments.closestPoint: pointer에서 segment 위 최근접 snap 점 계산
 * - Segments.projectionT: pointer의 segment 투영 위치를 [0, 1] 비율로 반환
 * - Segments.distanceToPoint: pointer에서 segment까지 거리 측정
 * - Segments.length: segment 길이 계산
 */
import * as Segments from '@cp949/vectra/segment';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { segment, pointer, draw: d } = runtime;

  d.clear(ctx, '#1e1e1e');

  // segment를 먼저 그린다
  d.segment(ctx, segment, { color: '#64748b', width: 2 });

  // endpoint 점
  d.point(ctx, segment.a, { color: '#94a3b8', radius: 5 });
  d.point(ctx, segment.b, { color: '#94a3b8', radius: 5 });

  // closestPoint: pointer에서 segment 위 가장 가까운 점을 반환한다
  const snap = Segments.closestPoint(segment, pointer);

  // pointer → snap 연결선 (점선 효과 — setLineDash 미지원이면 solid)
  d.segment(ctx, { a: pointer, b: snap }, { color: '#475569', width: 1 });

  // snap point 강조
  d.point(ctx, snap, { color: '#4ade80', radius: 8 });

  // pointer
  d.point(ctx, pointer, { color: '#f472b6', radius: 5 });

  // scalar 값 계산
  const t = Segments.projectionT(segment, pointer); // [0, 1] 범위 projection ratio
  const dist = Segments.distanceToPoint(segment, pointer);
  const segLen = Segments.length(segment);

  // 라벨
  d.label(ctx, 'snap = closestPoint(seg, pointer)', { x: snap.x + 10, y: snap.y - 10 }, { color: '#4ade80' });
  d.label(ctx, 'pointer', { x: pointer.x + 8, y: pointer.y - 8 }, { color: '#f472b6' });
  d.label(ctx, `t = projectionT(seg, pointer) = ${t.toFixed(3)}`, { x: 20, y: 30 }, { color: '#e2e8f0' });
  d.label(ctx, `distance = ${dist.toFixed(1)} px`, { x: 20, y: 50 }, { color: '#e2e8f0' });
  d.label(ctx, `segment length = ${segLen.toFixed(1)} px`, { x: 20, y: 70 }, { color: '#e2e8f0' });
}
