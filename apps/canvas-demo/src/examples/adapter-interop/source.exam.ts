/**
 * Adapter Interop
 *
 * 같은 polygon을 두 외부 표현(SVG `points` 문자열, Float32Array)에서 읽어 동일 도형으로 그리고,
 * flat 좌표 배열에 affine matrix를 적용한 변환 결과를 원본 위에 겹쳐 그린다.
 * 외부 좌표 데이터를 vectra 전용 타입으로 변환하지 않고 그대로 읽어 계산하고,
 * 결과를 다시 외부 표현(SVG 문자열)으로 직렬화하는 interop 흐름을 보여준다.
 *
 * - Adapters.parseSvgPointsInto: SVG `points` 문자열 → 점 배열 (companion 없음 → *Into)
 * - Adapters.pointsToString: 점 배열 → "x y x y ..." 문자열 (SVG points 호환, round-trip 무손실 확인)
 * - Adapters.fromFloat32ArrayInto: Float32Array → 점 배열 (companion 없음 → *Into)
 * - Adapters.toFloat32Array: 점 배열 → 새 Float32Array (allocating)
 * - Adapters.transformFlatCoords: flat [x0,y0,...] + matrix → 변환된 새 flat 배열 (allocating)
 * - Adapters.decodeFlatCoordsInto: flat 배열 → 점 배열 (tolerant decode, companion 없음 → *Into)
 *
 * parse/from 계열은 out 타입이 collection이라 allocating companion이 없으므로 buffer 1개씩에 *Into로
 * 기록한다. toFloat32Array / transformFlatCoords는 단발성 결과라 allocating companion을 쓴다.
 */
import * as Adapters from '@cp949/vectra/adapter';
import * as Matrices from '@cp949/vectra/matrix';

// 세 패널이 공유하는 house pentagon (offset만 다른 같은 도형)
// Panel 1: SVG points 문자열 입력
const svgInput = '40,220 40,170 90,140 140,170 140,220';

// Panel 2: 같은 도형을 Float32Array로 표현 (x+260)
const f32Input = new Float32Array([300, 220, 300, 170, 350, 140, 400, 170, 400, 220]);

// Panel 3: 같은 도형을 점 객체로 표현 (x+500). 변환 데모용 원본
const base3 = [
  { x: 540, y: 220 },
  { x: 540, y: 170 },
  { x: 590, y: 140 },
  { x: 640, y: 170 },
  { x: 640, y: 220 },
];

export function draw(ctx: CanvasRenderingContext2D, runtime: CanvasRuntime): void {
  const { draw: d } = runtime;

  d.clear(ctx, '#1e1e1e');

  d.label(ctx, 'Adapter interop', { x: 24, y: 30 }, { color: '#e2e8f0', font: '14px sans-serif' });
  d.label(
    ctx,
    'Bring your own geometry: 외부 좌표 표현을 변환 없이 그대로 읽어 계산한다',
    { x: 24, y: 50 },
    { color: '#94a3b8', font: '12px monospace' }
  );

  // ── Panel 1: SVG points 문자열 입력 ──
  const pts1: { x: number; y: number }[] = [];
  Adapters.parseSvgPointsInto(pts1, svgInput);
  d.polygon(ctx, { points: pts1 }, { fill: 'rgba(56,189,248,0.2)', stroke: '#38bdf8', strokeWidth: 1.5 });
  d.label(ctx, 'SVG points 문자열', { x: 40, y: 100 }, { color: '#38bdf8', font: '12px monospace' });
  d.label(ctx, 'parseSvgPointsInto', { x: 40, y: 118 }, { color: '#7dd3fc', font: '11px monospace' });

  // round-trip: 다시 문자열로 직렬화해 무손실 확인 (SVG points 호환 grammar)
  const roundTrip = Adapters.pointsToString(pts1);
  d.label(ctx, `→ pointsToString:`, { x: 40, y: 250 }, { color: '#94a3b8', font: '11px monospace' });
  d.label(ctx, roundTrip, { x: 40, y: 266 }, { color: '#cbd5e1', font: '11px monospace' });

  // ── Panel 2: Float32Array 입력 (동일 도형) ──
  const pts2: { x: number; y: number }[] = [];
  Adapters.fromFloat32ArrayInto(pts2, f32Input);
  d.polygon(ctx, { points: pts2 }, { fill: 'rgba(249,115,22,0.2)', stroke: '#f97316', strokeWidth: 1.5 });
  d.label(ctx, 'Float32Array', { x: 300, y: 100 }, { color: '#f97316', font: '12px monospace' });
  d.label(ctx, 'fromFloat32ArrayInto', { x: 300, y: 118 }, { color: '#fdba74', font: '11px monospace' });
  d.label(ctx, '동일 도형 (같은 입력의 다른 표현)', { x: 300, y: 250 }, { color: '#94a3b8', font: '11px monospace' });

  // ── Panel 3: flat coord transform ──
  // 원본 polygon
  d.polygon(ctx, { points: base3 }, { stroke: '#64748b', strokeWidth: 1.5 });

  // 점 배열 → flat Float32Array → flat number[]
  const flat = Array.from(Adapters.toFloat32Array(base3));

  // panel3 center 기준 rotate(25°) + scale(0.85) 합성 행렬: T(c) * R * S * T(-c)
  const cx = 590;
  const cy = 180;
  const T = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  const R = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  const S = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  const Tneg = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
  const m = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

  Matrices.translationMatrixInto(T, { x: cx, y: cy });
  Matrices.rotationMatrixInto(R, Matrices.degToRad(25));
  Matrices.scalingMatrixInto(S, 0.85, 0.85);
  Matrices.translationMatrixInto(Tneg, { x: -cx, y: -cy });
  Matrices.multiplyInto(m, T, R);
  Matrices.multiplyInto(m, m, S);
  Matrices.multiplyInto(m, m, Tneg);

  // flat 좌표에 matrix 적용 → 변환된 flat 반환 → 다시 점 배열로 읽어 그리기
  const transformedFlat = Adapters.transformFlatCoords(flat, m);
  const pts3: { x: number; y: number }[] = [];
  Adapters.decodeFlatCoordsInto(pts3, transformedFlat);
  d.polygon(ctx, { points: pts3 }, { fill: 'rgba(167,139,250,0.2)', stroke: '#a78bfa', strokeWidth: 1.5 });

  d.label(ctx, 'flat coord transform', { x: 540, y: 100 }, { color: '#a78bfa', font: '12px monospace' });
  d.label(ctx, 'toFloat32Array →', { x: 540, y: 118 }, { color: '#c4b5fd', font: '11px monospace' });
  d.label(ctx, 'transformFlatCoords →', { x: 540, y: 134 }, { color: '#c4b5fd', font: '11px monospace' });
  d.label(ctx, 'decodeFlatCoordsInto', { x: 540, y: 150 }, { color: '#c4b5fd', font: '11px monospace' });
  d.label(ctx, 'rotate 25° + scale 0.85', { x: 540, y: 250 }, { color: '#94a3b8', font: '11px monospace' });
}
