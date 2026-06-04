import type { XYObjectWritable } from '../types';

/**
 * cubic flatness 기준 측정 helper.
 * 제어점 p1, p2가 p0-p3 직선에서 얼마나 벗어나는지 계산한다.
 *
 * d1 = |3p1 - 2p0 - p3|, d2 = |3p2 - p0 - 2p3|
 * flatness = max(d1, d2) — subdivision depth estimator
 */
function measureFlatness(
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number
): number {
  const d1x = 3 * p1x - 2 * p0x - p3x;
  const d1y = 3 * p1y - 2 * p0y - p3y;
  const d2x = 3 * p2x - p0x - 2 * p3x;
  const d2y = 3 * p2y - p0y - 2 * p3y;
  const d1 = Math.hypot(d1x, d1y);
  const d2 = Math.hypot(d2x, d2y);
  return Math.max(d1, d2);
}

/**
 * adaptive subdivision으로 flat sub-segment의 시작점을 out에 push한다.
 * 마지막 끝점은 push하지 않는다 (최상위 호출자가 담당한다).
 */
function pushFlatStarts(
  out: XYObjectWritable[],
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  flatness: number,
  depth: number,
  maxDepth: number
): void {
  if (depth >= maxDepth || measureFlatness(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) < flatness) {
    out.push({ x: p0x, y: p0y });
    return;
  }

  // t=0.5에서 de Casteljau 분할
  const lerpP01x = (p0x + p1x) * 0.5;
  const lerpP01y = (p0y + p1y) * 0.5;
  const lerpP12x = (p1x + p2x) * 0.5;
  const lerpP12y = (p1y + p2y) * 0.5;
  const lerpP23x = (p2x + p3x) * 0.5;
  const lerpP23y = (p2y + p3y) * 0.5;

  const lerpP012x = (lerpP01x + lerpP12x) * 0.5;
  const lerpP012y = (lerpP01y + lerpP12y) * 0.5;
  const lerpP123x = (lerpP12x + lerpP23x) * 0.5;
  const lerpP123y = (lerpP12y + lerpP23y) * 0.5;

  const midX = (lerpP012x + lerpP123x) * 0.5;
  const midY = (lerpP012y + lerpP123y) * 0.5;

  pushFlatStarts(out, p0x, p0y, lerpP01x, lerpP01y, lerpP012x, lerpP012y, midX, midY, flatness, depth + 1, maxDepth);
  pushFlatStarts(out, midX, midY, lerpP123x, lerpP123y, lerpP23x, lerpP23y, p3x, p3y, flatness, depth + 1, maxDepth);
}

/**
 * `pushFlatStarts`와 동일하게 분할하되, 이 segment의 첫 시작점(p0)만 생략한다.
 * chain flatten에서 직전 segment 끝점과 중복되는 연결점을 다시 push하지 않기 위해 쓴다.
 */
function pushFlatStartsSkippingFirst(
  out: XYObjectWritable[],
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  flatness: number,
  depth: number,
  maxDepth: number
): void {
  if (depth >= maxDepth || measureFlatness(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) < flatness) {
    // flat 판정: 생략 대상인 p0뿐이므로 아무 점도 push하지 않는다.
    return;
  }

  const lerpP01x = (p0x + p1x) * 0.5;
  const lerpP01y = (p0y + p1y) * 0.5;
  const lerpP12x = (p1x + p2x) * 0.5;
  const lerpP12y = (p1y + p2y) * 0.5;
  const lerpP23x = (p2x + p3x) * 0.5;
  const lerpP23y = (p2y + p3y) * 0.5;

  const lerpP012x = (lerpP01x + lerpP12x) * 0.5;
  const lerpP012y = (lerpP01y + lerpP12y) * 0.5;
  const lerpP123x = (lerpP12x + lerpP23x) * 0.5;
  const lerpP123y = (lerpP12y + lerpP23y) * 0.5;

  const midX = (lerpP012x + lerpP123x) * 0.5;
  const midY = (lerpP012y + lerpP123y) * 0.5;

  // 왼쪽 절반의 첫 점은 여전히 생략 대상 p0이므로 skip 분기를 유지한다.
  pushFlatStartsSkippingFirst(
    out,
    p0x,
    p0y,
    lerpP01x,
    lerpP01y,
    lerpP012x,
    lerpP012y,
    midX,
    midY,
    flatness,
    depth + 1,
    maxDepth
  );
  // 오른쪽 절반의 첫 점은 내부 분할점(mid)이므로 정상 push한다.
  pushFlatStarts(out, midX, midY, lerpP123x, lerpP123y, lerpP23x, lerpP23y, p3x, p3y, flatness, depth + 1, maxDepth);
}

/**
 * 하나의 cubic Bezier segment를 adaptive subdivision으로 flatten해 out에 append한다.
 *
 * out을 clear하지 않는다. flat sub-segment 시작점들을 순서대로 push한 뒤 마지막에 끝점 p3를 push한다.
 * `includeStart`가 false이면 이 segment의 시작점 p0를 생략한다 (chain 연결점 중복 방지).
 * 좌표 값은 검증 없이 그대로 사용하므로 NaN/Infinity는 결과 좌표로 전파된다.
 */
export function appendFlattenedCubic(
  out: XYObjectWritable[],
  p0x: number,
  p0y: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  p3x: number,
  p3y: number,
  flatness: number,
  maxRecursion: number,
  includeStart: boolean
): void {
  if (includeStart) {
    pushFlatStarts(out, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, flatness, 0, maxRecursion);
  } else {
    pushFlatStartsSkippingFirst(out, p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, flatness, 0, maxRecursion);
  }
  out.push({ x: p3x, y: p3y });
}
