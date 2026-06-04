/**
 * Random Distribution Sampling
 *
 * 4개 패널에서 rect/circle/circle경계/polygon 영역에 점을 고르게 분산한다.
 * seeded RNG로 실행할 때마다 동일한 분포를 재현한다.
 *
 * - Random.createRng: seed 기반 결정적 RNG 생성
 * - Random.pointInRect: rect 내부 균등 분포
 * - Random.pointInCircle: circle 내부 균등 분포
 * - Random.pointOnCircle: circle 경계 균등 샘플
 * - Random.pointInPolygon: polygon 내부 균등 분포 (rejection sampling)
 * - Random.direction: 균등 random unit direction
 */
import * as Random from '@cp949/vectra/random';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { draw: d } = runtime;

  d.clear(ctx, '#1e1e1e');

  // 패널별 독립 seeded RNG — 패널 순서나 실행 환경이 달라도 동일 분포 재현
  const rng1 = Random.createRng(42);
  const rng2 = Random.createRng(43);
  const rng3 = Random.createRng(44);
  const rng4 = Random.createRng(45);

  // ── Panel 1 (좌상): pointInRect — rect 내부 균등 scatter ──
  const rect = { x: 50, y: 62, width: 290, height: 118 };
  d.rect(ctx, rect, { fill: 'rgba(56,189,248,0.06)', stroke: '#334155', strokeWidth: 1 });
  d.label(ctx, 'pointInRect', { x: 30, y: 37 }, { color: '#38bdf8', font: '12px monospace' });
  d.label(ctx, '200pt · uniform in rect', { x: 30, y: 53 }, { color: '#475569', font: '11px monospace' });

  for (let i = 0; i < 200; i++) {
    const pt = Random.pointInRect(rect, rng1);
    if (pt) d.point(ctx, pt, { color: '#38bdf8', radius: 1.5 });
  }

  // ── Panel 2 (우상): pointInCircle — circle 내부 균등 scatter ──
  const circle2 = { center: { x: 565, y: 118 }, radius: 68 };
  d.circle(ctx, circle2, { fill: 'rgba(251,146,60,0.06)', stroke: '#334155', strokeWidth: 1 });
  d.label(ctx, 'pointInCircle', { x: 400, y: 37 }, { color: '#fb923c', font: '12px monospace' });
  d.label(ctx, '200pt · uniform in circle', { x: 400, y: 53 }, { color: '#475569', font: '11px monospace' });

  for (let i = 0; i < 200; i++) {
    const pt = Random.pointInCircle(circle2, rng2);
    if (pt) d.point(ctx, pt, { color: '#fb923c', radius: 1.5 });
  }

  // direction 화살표 — circle 중심에서 random unit direction 4개
  const rngDir2 = Random.createRng(242);
  const c2 = circle2.center;
  for (let i = 0; i < 4; i++) {
    const dir = Random.direction(1, rngDir2);
    const tip = { x: c2.x + dir.x * 48, y: c2.y + dir.y * 48 };
    d.segment(ctx, { a: c2, b: tip }, { color: '#f97316', width: 1.5 });
    d.point(ctx, tip, { color: '#f97316', radius: 3 });
  }
  d.point(ctx, c2, { color: '#64748b', radius: 2 });

  // ── Panel 3 (좌하): pointOnCircle — circle 경계 균등 샘플 ──
  const circle3 = { center: { x: 195, y: 322 }, radius: 68 };
  d.circle(ctx, circle3, { fill: 'rgba(74,222,128,0.04)', stroke: '#334155', strokeWidth: 1 });
  d.label(ctx, 'pointOnCircle', { x: 30, y: 247 }, { color: '#4ade80', font: '12px monospace' });
  d.label(ctx, '80pt · uniform on boundary', { x: 30, y: 263 }, { color: '#475569', font: '11px monospace' });

  for (let i = 0; i < 80; i++) {
    const pt = Random.pointOnCircle(circle3, rng3);
    if (pt) d.point(ctx, pt, { color: '#4ade80', radius: 2.5 });
  }

  // direction 화살표 — circle 중심에서 random unit direction 3개
  const rngDir3 = Random.createRng(243);
  const c3 = circle3.center;
  for (let i = 0; i < 3; i++) {
    const dir = Random.direction(1, rngDir3);
    d.segment(ctx, { a: c3, b: { x: c3.x + dir.x * 40, y: c3.y + dir.y * 40 } }, { color: '#86efac', width: 1 });
  }
  d.point(ctx, c3, { color: '#64748b', radius: 2 });

  // ── Panel 4 (우하): pointInPolygon — convex 정오각형 내부 균등 scatter ──
  // 정오각형 사용 — rejection sampling overhead 최소화
  const cx4 = 565;
  const cy4 = 322;
  const r4 = 68;
  const pentagonPoints: { x: number; y: number }[] = Array.from({ length: 5 }, (_, i) => {
    const a = (2 * Math.PI * i) / 5 - Math.PI / 2;
    return { x: cx4 + r4 * Math.cos(a), y: cy4 + r4 * Math.sin(a) };
  });
  const pentagon = { points: pentagonPoints };

  d.polygon(ctx, pentagon, { fill: 'rgba(167,139,250,0.06)', stroke: '#334155', strokeWidth: 1 });
  d.label(ctx, 'pointInPolygon', { x: 400, y: 247 }, { color: '#a78bfa', font: '12px monospace' });
  d.label(ctx, '200pt · uniform in polygon', { x: 400, y: 263 }, { color: '#475569', font: '11px monospace' });

  for (let i = 0; i < 200; i++) {
    const pt = Random.pointInPolygon(pentagon, rng4);
    if (pt) d.point(ctx, pt, { color: '#a78bfa', radius: 1.5 });
  }
}
