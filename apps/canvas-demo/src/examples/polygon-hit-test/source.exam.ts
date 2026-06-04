/**
 * Polygon Hit Test
 *
 * pointer 위치가 polygon 내부인지에 따라 fill 색을 바꾸고, 경계 위 가장 가까운
 * 점까지 선을 그으며, 경계까지의 거리와 면적을 표시한다.
 *
 * - Polygons.containsPoint: pointer의 polygon 내부 포함 여부 판정
 * - Polygons.closestPoint: polygon 경계 위 최근접 snap 점 계산
 * - Polygons.distanceToPoint: pointer에서 경계까지의 거리 측정
 * - Polygons.bounds: polygon의 axis-aligned bounds 측정
 * - Polygons.area: polygon 면적 계산
 */
import * as Polygons from '@cp949/vectra/polygon';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { polygon, pointer, draw: d } = runtime;

  d.clear(ctx, '#1e1e1e');

  // containsPoint: polygon이 point를 포함하는지 반환한다
  const inside = Polygons.containsPoint(polygon, pointer);

  // polygon 렌더링 (hit 여부에 따라 fill 색상 변경)
  d.polygon(ctx, polygon, {
    fill: inside ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.12)',
    stroke: inside ? '#4ade80' : '#f87171',
    strokeWidth: 2,
  });

  // closestPoint: polygon 경계에서 가장 가까운 점을 새 object로 반환한다
  const snap = Polygons.closestPoint(polygon, pointer) ?? pointer;
  const snapX = Array.isArray(snap) ? snap[0] : snap.x;
  const snapY = Array.isArray(snap) ? snap[1] : snap.y;

  // pointer → snap 선
  d.segment(ctx, { a: pointer, b: snap }, { color: '#475569', width: 1 });

  // snap point 강조
  d.point(ctx, snap, { color: '#fb923c', radius: 7 });

  // pointer
  d.point(ctx, pointer, { color: inside ? '#4ade80' : '#f87171', radius: 6 });

  // polygon bounds
  const b = Polygons.bounds(polygon);
  d.bounds(ctx, b, { fill: 'none', stroke: '#334155', strokeWidth: 1 });

  // 스칼라 값
  const dist = Polygons.distanceToPoint(polygon, pointer);
  const polyArea = Polygons.area(polygon);

  // 정보 라벨
  const statusColor = inside ? '#4ade80' : '#f87171';
  const statusText = inside ? 'INSIDE' : 'OUTSIDE';
  d.label(ctx, `containsPoint → ${statusText}`, { x: 20, y: 30 }, { color: statusColor });
  d.label(ctx, `closestPoint on boundary → (${snapX.toFixed(0)}, ${snapY.toFixed(0)})`, { x: 20, y: 50 }, { color: '#fb923c' });
  d.label(ctx, `distance to boundary = ${dist.toFixed(1)} px`, { x: 20, y: 70 }, { color: '#e2e8f0' });
  d.label(ctx, `area = ${Math.abs(polyArea).toFixed(0)} px²`, { x: 20, y: 90 }, { color: '#94a3b8' });
}
