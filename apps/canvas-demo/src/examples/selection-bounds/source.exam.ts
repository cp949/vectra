/**
 * Selection Bounds
 *
 * 선택된 여러 점을 모두 감싸는 axis-aligned bounds를 약간 확장해 그리고, 그 중점과
 * rect 좌표·너비·높이 같은 측정값을 함께 표시한다.
 *
 * - Bounds.fromPointsInto: 점 목록을 모두 포함하는 bounds 계산
 * - Bounds.toRect: bounds를 rect 표현으로 변환
 * - Bounds.centerInto: bounds 중점 계산
 * - Bounds.width / height: bounds 너비·높이 측정
 */
import * as Bounds from '@cp949/vectra/bounds';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { size, draw: d } = runtime;

  d.clear(ctx, '#1e1e1e');

  // drag-like point selection 시뮬레이션 — 실제 편집기에서는 드래그로 수집된다
  const points = [
    { x: 120, y: 80 },
    { x: 300, y: 60 },
    { x: 480, y: 140 },
    { x: 400, y: 280 },
    { x: 160, y: 320 },
    { x: 80, y: 200 },
    { x: 260, y: 180 },
  ];

  // 모든 점을 포함하는 bounds 계산
  // fromPointsInto — points를 포함하는 axis-aligned bounds를 out에 기록한다
  const b = { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  Bounds.fromPointsInto(b, points);

  // bounds → rect 변환
  const r = Bounds.toRect(b);

  // 중점
  const center = { x: 0, y: 0 };
  Bounds.centerInto(center, b);

  // scalar 쿼리
  const w = Bounds.width(b);
  const h = Bounds.height(b);

  // bounds 렌더링 (약간 확장하여 표시)
  const padded = {
    min: { x: b.min.x - 8, y: b.min.y - 8 },
    max: { x: b.max.x + 8, y: b.max.y + 8 },
  };
  d.bounds(ctx, padded, { fill: 'rgba(56, 189, 248, 0.08)', stroke: '#38bdf8', strokeWidth: 1.5 });

  // 개별 점 렌더링
  for (const p of points) {
    d.point(ctx, p, { color: '#f472b6', radius: 6 });
  }

  // 중점 표시
  d.point(ctx, center, { color: '#4ade80', radius: 5 });

  // 정보 라벨
  d.label(ctx, `bounds: (${b.min.x}, ${b.min.y}) → (${b.max.x}, ${b.max.y})`, { x: 20, y: 30 }, { color: '#38bdf8' });
  d.label(ctx, `rect: x=${r.x}, y=${r.y}, w=${w.toFixed(0)}, h=${h.toFixed(0)}`, { x: 20, y: 50 }, { color: '#e2e8f0' });
  d.label(ctx, `center = (${center.x.toFixed(0)}, ${center.y.toFixed(0)})`, { x: center.x + 8, y: center.y - 10 }, { color: '#4ade80' });
  d.label(ctx, `${points.length} points selected`, { x: 20, y: size.height - 20 }, { color: '#94a3b8' });
}
