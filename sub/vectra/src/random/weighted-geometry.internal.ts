import { type RandomSource, random } from './random';

function nextRepresentableNumber(value: number): number {
  if (!Number.isFinite(value)) return value;
  if (value === 0) return Number.MIN_VALUE;

  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setFloat64(0, value);
  let hi = view.getUint32(0);
  let lo = view.getUint32(4);

  if (value > 0) {
    if (lo === 0xffffffff) {
      lo = 0;
      hi++;
    } else {
      lo++;
    }
  } else if (lo === 0) {
    lo = 0xffffffff;
    hi--;
  } else {
    lo--;
  }

  view.setUint32(0, hi);
  view.setUint32(4, lo);
  return view.getFloat64(0);
}

/**
 * weighted geometry sampling의 weight 배열 구조를 검증한다.
 *
 * `weights.length`가 geometry source segment count와 다르거나 weight가 non-negative finite
 * number가 아니면 `RangeError`를 던진다. RNG를 소비하지 않는다.
 *
 * @param weights segment별 caller 가중치 배열
 * @param segmentCount geometry source segment count (polyline: points.length-1, path: drawing segment 수)
 * @param fnName 에러 메시지 prefix로 쓸 호출 함수 이름
 */
export function validateGeometryWeights(weights: readonly number[], segmentCount: number, fnName: string): void {
  if (weights.length !== segmentCount) {
    throw new RangeError(`${fnName}: weights 길이(${weights.length})는 segment 수(${segmentCount})와 같아야 한다.`);
  }
  for (const weight of weights) {
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError(`${fnName}: weight는 non-negative finite number여야 한다. 받은 값: ${weight}`);
    }
  }
}

/**
 * segment arc-length와 검증된 weight로 weighted selection을 수행해 geometry 시작점부터의 절대
 * arc-length offset을 반환한다.
 *
 * `effective[i] = segLengths[i] * weights[i]`. effective 합계가 `0`이거나 non-finite이면
 * `RangeError`를 던진다. zero-length segment는 effective `0`으로 선택 대상이 아니다.
 *
 * RNG를 1회 소비해 `threshold = random(rng) * totalEffective`를 만든다. threshold가 속한 segment를
 * 고르고, threshold 잔여를 segment arc-length로 환산해 length-uniform local offset을 만든다.
 * 선택된 segment 안의 point는 추가 RNG 소비 없이 절대 offset으로 표현된다.
 *
 * 호출자는 이 함수 호출 전에 geometry가 samplable(positive finite total length)임과 weight 구조가
 * 유효함을 보장한다. `segLengths`와 `weights`는 같은 길이여야 한다.
 *
 * @param segLengths segment별 arc-length 배열 (positive finite total을 가정)
 * @param weights 검증된 segment별 가중치 배열 (segLengths와 같은 길이)
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다
 * @param fnName 에러 메시지 prefix로 쓸 호출 함수 이름
 * @param nudgeBoundaryOffset true이면 segment boundary 선택 시 다음 representable arc-length를 반환한다
 */
export function weightedSegmentOffset(
  segLengths: readonly number[],
  weights: readonly number[],
  rng: RandomSource | undefined,
  fnName: string,
  nudgeBoundaryOffset = false
): number {
  let totalEffective = 0;
  for (let i = 0; i < segLengths.length; i++) {
    totalEffective += (segLengths[i] as number) * (weights[i] as number);
  }

  if (!Number.isFinite(totalEffective) || totalEffective <= 0) {
    throw new RangeError(`${fnName}: effective weight 합계는 finite하고 0보다 커야 한다.`);
  }

  const threshold = random(rng) * totalEffective;

  let cumulativeEffective = 0;
  let cumulativeLength = 0;
  for (let i = 0; i < segLengths.length; i++) {
    const segLength = segLengths[i] as number;
    const effective = segLength * (weights[i] as number);
    // strict `<`: threshold가 segment 경계에 정확히 닿으면 다음 segment에 귀속한다.
    if (effective > 0 && threshold < cumulativeEffective + effective) {
      const localFraction = (threshold - cumulativeEffective) / effective;
      if (nudgeBoundaryOffset && i > 0 && localFraction === 0) {
        return nextRepresentableNumber(cumulativeLength);
      }
      return cumulativeLength + localFraction * segLength;
    }
    cumulativeEffective += effective;
    cumulativeLength += segLength;
  }

  // floating-point 보정: 마지막 positive effective segment 끝점으로 귀속한다.
  let tailLength = 0;
  for (let i = segLengths.length - 1; i >= 0; i--) {
    const segLength = segLengths[i] as number;
    if (segLength * (weights[i] as number) > 0) {
      return cumulativeLength - tailLength;
    }
    tailLength += segLength;
  }

  // totalEffective > 0 검증을 통과했으므로 positive effective segment가 반드시 존재한다.
  throw new RangeError(`${fnName}: effective weight 합계는 0보다 커야 한다.`);
}
