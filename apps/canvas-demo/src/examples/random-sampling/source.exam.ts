/**
 * Random Sampling
 *
 * polygon의 bounds 안에서 주입된 rng로 무작위 점을 뽑아 내부 점은 초록, 기각 점은
 * 회색으로 찍고, 수용 비율로 Monte Carlo 면적 추정값을 실제 면적과 비교 출력한다.
 *
 * - Polygons.bounds: 샘플링 범위가 되는 polygon bounds 측정
 * - Random.pointInBoundsInto: 주입 rng로 bounds 내 결정적 무작위 점 생성
 * - Polygons.containsPoint: 후보 점의 polygon 내부 포함 여부로 수용·기각 판정
 * - Polygons.area: Monte Carlo 추정값과 비교할 실제 면적 계산
 */
import * as Polygons from '@cp949/vectra/polygon';
import * as Random from '@cp949/vectra/random';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { polygon, rng, draw: d } = runtime;

  d.clear(ctx, '#1e1e1e');

  // polygon의 bounding bounds를 구한다
  const b = Polygons.bounds(polygon);

  // polygon 렌더링
  d.polygon(ctx, polygon, { fill: 'rgba(56, 189, 248, 0.08)', stroke: '#38bdf8', strokeWidth: 1.5 });
  d.bounds(ctx, b, { fill: 'none', stroke: '#334155', strokeWidth: 1 });

  // rejection sampling: bounds 내 랜덤 점 중 polygon 내부 점만 수집한다
  // runtime.rng는 injected random source이다 (0 ~ 1 uniform)
  const candidates = 400;
  let accepted = 0;
  const candidate = { x: 0, y: 0 };

  for (let i = 0; i < candidates; i++) {
    // pointInBoundsInto — rng를 주입하여 결정적 샘플링이 가능하다
    Random.pointInBoundsInto(candidate, b, rng);

    if (Polygons.containsPoint(polygon, candidate)) {
      // polygon 내부 점: 초록
      d.point(ctx, { x: candidate.x, y: candidate.y }, { color: '#4ade80', radius: 2 });
      accepted++;
    } else {
      // 기각 점: 회색 (더 작게)
      d.point(ctx, { x: candidate.x, y: candidate.y }, { color: '#1e293b', radius: 1 });
    }
  }

  // Monte Carlo area 추정
  const boundsArea = (b.max.x - b.min.x) * (b.max.y - b.min.y);
  const estimatedArea = boundsArea * (accepted / candidates);
  const actualArea = Math.abs(Polygons.area(polygon));

  // 정보 라벨
  d.label(ctx, `rejection sampling: ${accepted}/${candidates} points inside`, { x: 20, y: 30 }, { color: '#4ade80' });
  d.label(ctx, `Monte Carlo area estimate: ${estimatedArea.toFixed(0)} px²`, { x: 20, y: 50 }, { color: '#e2e8f0' });
  d.label(ctx, `actual area: ${actualArea.toFixed(0)} px²`, { x: 20, y: 70 }, { color: '#94a3b8' });
  d.label(ctx, 'runtime.rng = injected RandomSource', { x: 20, y: 90 }, { color: '#475569' });
}
