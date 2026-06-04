/**
 * XYInput + Writable Output 빠른 시작
 *
 * object `{ x, y }`와 tuple `[x, y]` 양쪽 좌표 입력으로 두 점을 더하고 절반으로
 * 줄여 중점을 구한 뒤, 두 점과 중점, tuple output 점, 두 점 사이 거리를 화면에 보여준다.
 *
 * - Vectors.add / scale: 단발성 object 결과를 새 object로 반환
 * - Vectors.addInto: tuple output에 직접 기록하는 writable out 시연
 * - Vectors.distance: 두 점 사이 거리를 scalar로 직접 반환
 */
import * as Vectors from '@cp949/vectra/vec';

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { size, draw } = runtime;
  const cx = size.width / 2;
  const cy = size.height / 2;

  draw.clear(ctx, '#1e1e1e');

  // object 형태 XYInput: { x, y }
  const a = { x: cx - 80, y: cy };
  const b = { x: cx + 80, y: cy - 60 };

  // tuple 형태 XYInput: [x, y]  (XYWritable도 겸한다)
  const offset: [number, number] = [0, 50];

  // add — 두 점의 합을 새 object로 반환한다
  const sum = Vectors.add(a, b);

  // scale — sum * 0.5 를 새 object로 반환한다
  const mid = Vectors.scale(sum, 0.5);

  // distance — scalar 결과는 직접 반환한다
  const dist = Vectors.distance(a, b);

  // addInto에 tuple out 사용 — tuple도 XYWritable이다
  Vectors.addInto(offset, mid, offset);

  // 렌더링
  draw.segment(ctx, { a, b }, { color: '#64748b', width: 1 });
  draw.point(ctx, a, { color: '#38bdf8', radius: 7 });
  draw.point(ctx, b, { color: '#f472b6', radius: 7 });
  draw.point(ctx, mid, { color: '#4ade80', radius: 6 });
  draw.point(ctx, offset, { color: '#fb923c', radius: 4 });

  // 라벨
  draw.label(ctx, 'a  (object XYInput)', { x: a.x, y: a.y - 14 }, { color: '#38bdf8' });
  draw.label(ctx, 'b  (object XYInput)', { x: b.x, y: b.y - 14 }, { color: '#f472b6' });
  draw.label(ctx, 'mid = scale(add(a,b), 0.5)', { x: mid.x + 8, y: mid.y - 8 }, { color: '#4ade80' });
  draw.label(ctx, 'offset  (tuple out)', { x: offset[0], y: offset[1] - 10 }, { color: '#fb923c' });
  draw.label(ctx, `distance(a, b) = ${dist.toFixed(1)}`, { x: cx - 100, y: cy + 80 }, { color: '#e2e8f0' });
}
