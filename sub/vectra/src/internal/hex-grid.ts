/**
 * hex-grid domain leaf module이 공유하는 coordinate reader와 validator.
 *
 * public hex conversion/query helper가 axial/cube coordinate를 같은 정책으로 읽고 검증하도록
 * 이 internal primitive를 통한다. public leaf끼리 서로 import하지 않고 여기로 공유 계산을 내린다.
 */

import type {
  HexAxialLike,
  HexAxialWritable,
  HexCubeLike,
  HexLayoutLike,
  HexOffsetLayout,
  HexOffsetLike,
  HexOrientation,
} from '../types';
import { readX, readY } from './xy';

/** axial input이 tuple이면 true를 반환한다. */
function isHexAxialTuple(axial: HexAxialLike): axial is readonly [number, number] {
  return Array.isArray(axial);
}

/** cube input이 tuple이면 true를 반환한다. */
function isHexCubeTuple(cube: HexCubeLike): cube is readonly [number, number, number] {
  return Array.isArray(cube);
}

/** offset input이 tuple이면 true를 반환한다. */
function isHexOffsetTuple(offset: HexOffsetLike): offset is readonly [number, number] {
  return Array.isArray(offset);
}

/**
 * HexAxialLike input에서 q 성분을 읽는다.
 *
 * tuple input은 index 0을, object input은 q field를 읽는다.
 *
 * @param axial q 성분을 읽을 structural axial coordinate
 */
export function readHexAxialQ(axial: HexAxialLike): number {
  return isHexAxialTuple(axial) ? axial[0] : axial.q;
}

/**
 * HexAxialLike input에서 r 성분을 읽는다.
 *
 * tuple input은 index 1을, object input은 r field를 읽는다.
 *
 * @param axial r 성분을 읽을 structural axial coordinate
 */
export function readHexAxialR(axial: HexAxialLike): number {
  return isHexAxialTuple(axial) ? axial[1] : axial.r;
}

/**
 * HexCubeLike input에서 q 성분을 읽는다.
 *
 * tuple input은 index 0을, object input은 q field를 읽는다.
 *
 * @param cube q 성분을 읽을 structural cube coordinate
 */
export function readHexCubeQ(cube: HexCubeLike): number {
  return isHexCubeTuple(cube) ? cube[0] : cube.q;
}

/**
 * HexCubeLike input에서 r 성분을 읽는다.
 *
 * tuple input은 index 1을, object input은 r field를 읽는다.
 *
 * @param cube r 성분을 읽을 structural cube coordinate
 */
export function readHexCubeR(cube: HexCubeLike): number {
  return isHexCubeTuple(cube) ? cube[1] : cube.r;
}

/**
 * HexCubeLike input에서 s 성분을 읽는다.
 *
 * tuple input은 index 2를, object input은 s field를 읽는다.
 *
 * @param cube s 성분을 읽을 structural cube coordinate
 */
export function readHexCubeS(cube: HexCubeLike): number {
  return isHexCubeTuple(cube) ? cube[2] : cube.s;
}

/**
 * HexOffsetLike input에서 column index를 읽는다.
 *
 * tuple input은 index 0을, object input은 col field를 읽는다.
 *
 * @param offset column index를 읽을 structural offset coordinate
 */
export function readHexOffsetCol(offset: HexOffsetLike): number {
  return isHexOffsetTuple(offset) ? offset[0] : offset.col;
}

/**
 * HexOffsetLike input에서 row index를 읽는다.
 *
 * tuple input은 index 1을, object input은 row field를 읽는다.
 *
 * @param offset row index를 읽을 structural offset coordinate
 */
export function readHexOffsetRow(offset: HexOffsetLike): number {
  return isHexOffsetTuple(offset) ? offset[1] : offset.row;
}

/**
 * axial coordinate 두 성분이 safe integer인지 검증한다.
 *
 * `NaN`, `Infinity`, `-Infinity`, non-integer float, safe integer 범위를 벗어난 값은 모두
 * `RangeError`다. neighbor/iteration 후속 helper가 `q + 1` 같은 step을 안전하게 적용하도록 unsafe
 * integer를 막는다.
 *
 * @param q 검증할 axial q 성분
 * @param r 검증할 axial r 성분
 */
export function validateHexAxialSafeInteger(q: number, r: number): void {
  if (!Number.isSafeInteger(q) || !Number.isSafeInteger(r)) {
    throw new RangeError(`hex axial q/r must be safe integers, got (${String(q)}, ${String(r)})`);
  }
}

/**
 * cube coordinate 세 성분이 safe integer인지 검증한다.
 *
 * `NaN`, `Infinity`, `-Infinity`, non-integer float, safe integer 범위를 벗어난 값은 모두
 * `RangeError`다.
 *
 * @param q 검증할 cube q 성분
 * @param r 검증할 cube r 성분
 * @param s 검증할 cube s 성분
 */
export function validateHexCubeSafeInteger(q: number, r: number, s: number): void {
  if (!Number.isSafeInteger(q) || !Number.isSafeInteger(r) || !Number.isSafeInteger(s)) {
    throw new RangeError(`hex cube q/r/s must be safe integers, got (${String(q)}, ${String(r)}, ${String(s)})`);
  }
}

/**
 * cube coordinate가 `q + r + s === 0` invariant를 만족하는지 검증한다.
 *
 * integer cube helper는 이 invariant를 강제한다. fractional rounding 입력만 drift를 허용하고 round
 * 단계에서 invariant를 복원한다.
 *
 * @param q 검증할 cube q 성분
 * @param r 검증할 cube r 성분
 * @param s 검증할 cube s 성분
 */
export function validateHexCubeZeroSum(q: number, r: number, s: number): void {
  if (q + r + s !== 0) {
    throw new RangeError(
      `hex cube coordinate must satisfy q + r + s === 0, got (${String(q)}, ${String(r)}, ${String(s)})`
    );
  }
}

/**
 * 계산된 hex coordinate 성분이 safe integer인지 검증한다.
 *
 * 입력 safe integer 합/차가 safe integer 범위를 벗어나면(예: `s = -q - r` overflow) `RangeError`다.
 *
 * @param value 검증할 계산 결과 성분
 * @param label 오류 메시지에 쓸 성분 이름
 */
export function validateHexComputedSafeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`hex computed ${label} must be a safe integer, got ${String(value)}`);
  }
}

/**
 * offset coordinate 두 성분이 safe integer인지 검증한다.
 *
 * `NaN`, `Infinity`, `-Infinity`, non-integer float, safe integer 범위를 벗어난 값은 모두
 * `RangeError`다.
 *
 * @param col 검증할 offset column index
 * @param row 검증할 offset row index
 */
export function validateHexOffsetSafeInteger(col: number, row: number): void {
  if (!Number.isSafeInteger(col) || !Number.isSafeInteger(row)) {
    throw new RangeError(`hex offset col/row must be safe integers, got (${String(col)}, ${String(row)})`);
  }
}

const HEX_OFFSET_LAYOUTS: readonly HexOffsetLayout[] = ['odd-r', 'even-r', 'odd-q', 'even-q'];

/**
 * offset layout convention이 허용된 값인지 검증한다.
 *
 * `"odd-r" | "even-r" | "odd-q" | "even-q"` 외 값은 `RangeError`다. offset conversion은 default
 * layout을 두지 않으므로 caller가 항상 명시한다.
 *
 * @param layout 검증할 offset layout convention
 */
export function validateHexOffsetLayout(layout: HexOffsetLayout): void {
  if (!HEX_OFFSET_LAYOUTS.includes(layout)) {
    throw new RangeError(`hex offset layout must be one of ${HEX_OFFSET_LAYOUTS.join(', ')}, got ${String(layout)}`);
  }
}

/**
 * safe integer의 parity(`0` 또는 `1`)를 비트 연산 없이 반환한다.
 *
 * `n & 1`은 피연산자를 int32로 강제 변환해 `2^31` 이상 safe integer에서 잘못된 결과를 낸다.
 * `((n % 2) + 2) % 2`는 음수 safe integer에서도 항상 `0` 또는 `1`을 반환한다.
 *
 * @param n parity를 구할 safe integer
 */
export function hexParity(n: number): number {
  return ((n % 2) + 2) % 2;
}

/**
 * HexLayoutLike input에서 origin x 성분을 읽는다. origin이 없으면 0을 반환한다.
 *
 * @param layout origin을 읽을 structural layout spec
 */
export function readHexLayoutOriginX(layout: HexLayoutLike): number {
  return layout.origin != null ? readX(layout.origin) : 0;
}

/**
 * HexLayoutLike input에서 origin y 성분을 읽는다. origin이 없으면 0을 반환한다.
 *
 * @param layout origin을 읽을 structural layout spec
 */
export function readHexLayoutOriginY(layout: HexLayoutLike): number {
  return layout.origin != null ? readY(layout.origin) : 0;
}

/**
 * HexLayoutLike input에서 orientation을 읽는다. 생략하면 `"pointy"`를 반환한다.
 *
 * @param layout orientation을 읽을 structural layout spec
 */
export function readHexLayoutOrientation(layout: HexLayoutLike): HexOrientation {
  return layout.orientation ?? 'pointy';
}

/**
 * layout size가 positive finite number인지 검증한다.
 *
 * `0`, 음수, `NaN`, `Infinity`, `-Infinity`는 모두 `RangeError`다.
 *
 * @param size 검증할 layout size
 */
export function validateHexLayoutSize(size: number): void {
  if (!Number.isFinite(size) || size <= 0) {
    throw new RangeError(`hex layout size must be a positive finite number, got ${String(size)}`);
  }
}

/**
 * layout orientation이 `"pointy"` 또는 `"flat"`인지 검증한다.
 *
 * 그 외 값은 `RangeError`다.
 *
 * @param orientation 검증할 orientation
 */
export function validateHexOrientation(orientation: HexOrientation): void {
  if (orientation !== 'pointy' && orientation !== 'flat') {
    throw new RangeError(`hex layout orientation must be "pointy" or "flat", got ${String(orientation)}`);
  }
}

/**
 * coordinate/origin 두 성분이 finite인지 검증한다.
 *
 * `NaN`, `Infinity`, `-Infinity`는 `RangeError`다. axial/world point/origin이 같은 finite 정책을
 * 공유하도록 이 helper를 통해 검증한다.
 *
 * @param a 검증할 첫 성분
 * @param b 검증할 둘째 성분
 * @param label 오류 메시지에 쓸 값 이름
 */
export function validateHexFinite(a: number, b: number, label: string): void {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new RangeError(`hex ${label} must have finite components, got (${String(a)}, ${String(b)})`);
  }
}

/**
 * 계산된 hex coordinate 성분이 finite인지 검증한다.
 *
 * 큰 size/coordinate 곱이 overflow해 `Infinity`가 되는 경우를 `RangeError`로 막는다.
 *
 * @param a 검증할 계산 결과 첫 성분
 * @param b 검증할 계산 결과 둘째 성분
 * @param label 오류 메시지에 쓸 값 이름
 */
export function validateHexComputedFinite(a: number, b: number, label: string): void {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new RangeError(`hex computed ${label} must be finite, got (${String(a)}, ${String(b)})`);
  }
}

/** 계산 결과 `-0`을 `0`으로 canonicalize한다. */
export function hexCanonicalZero(n: number): number {
  return n === 0 ? 0 : n;
}

/**
 * HexAxialWritable에 q/r을 기록하고 out을 반환한다.
 *
 * @param out axial coordinate를 기록할 writable output
 * @param q 기록할 axial q 성분
 * @param r 기록할 axial r 성분
 */
export function writeHexAxial<Out extends HexAxialWritable>(out: Out, q: number, r: number): Out {
  out.q = q;
  out.r = r;
  return out;
}

/**
 * round input이 cube shape이면 true를 반환한다.
 *
 * tuple input은 길이 3을, object input은 `s` property 존재를 cube로 본다.
 *
 * @param input 분류할 axial 또는 cube coordinate
 */
export function isHexCubeInput(input: HexAxialLike | HexCubeLike): input is HexCubeLike {
  return Array.isArray(input) ? input.length === 3 : 's' in input;
}

/**
 * round/distance input 세 성분이 finite인지 검증한다.
 *
 * fractional rounding 입력은 integer를 요구하지 않지만 `NaN`, `Infinity`, `-Infinity`는 모두
 * `RangeError`다.
 *
 * @param q 검증할 q 성분
 * @param r 검증할 r 성분
 * @param s 검증할 s 성분
 */
export function validateHexCoordinateFinite(q: number, r: number, s: number): void {
  if (!Number.isFinite(q) || !Number.isFinite(r) || !Number.isFinite(s)) {
    throw new RangeError(`hex coordinate must have finite q/r/s, got (${String(q)}, ${String(r)}, ${String(s)})`);
  }
}

/**
 * fractional cube `(fq, fr, fs)`를 nearest integer axial coordinate로 round해 out에 기록하고 out을
 * 반환한다.
 *
 * Red Blob Games cube rounding을 사용한다. 세 성분을 각각 round한 뒤 rounding delta가 가장 큰 성분을
 * 나머지로부터 다시 계산해 `q + r + s === 0`을 복원한다. axial `{ q, r }`만 기록하고 `s`는 drop한다.
 * round 결과 q/r과 implicit `s = -q - r`가 safe integer가 아니면 `RangeError`다. 결과 `-0`은
 * `0`으로 canonicalize한다.
 *
 * @param out nearest integer axial coordinate를 기록할 writable output
 * @param fq fractional cube q 성분
 * @param fr fractional cube r 성분
 * @param fs fractional cube s 성분
 */
export function hexRoundCubeIntoAxial<Out extends HexAxialWritable>(out: Out, fq: number, fr: number, fs: number): Out {
  const [q, r] = hexRoundCubePair(fq, fr, fs);
  return writeHexAxial(out, q, r);
}

/**
 * fractional cube `(fq, fr, fs)`를 nearest integer axial coordinate pair `[q, r]`로 round한다.
 *
 * Red Blob Games cube rounding을 사용한다. 세 성분을 각각 round한 뒤 rounding delta가 가장 큰 성분을
 * 나머지로부터 다시 계산해 `q + r + s === 0`을 복원하고 axial `[q, r]`만 반환한다. round 결과 q/r과
 * implicit `s = -q - r`가 safe integer가 아니면 `RangeError`다. 결과 `-0`은 `0`으로 canonicalize한다.
 * out에 기록하지 않고 pair를 반환하므로 단일 axial helper와 line traversal이 같은 round 정책을
 * 공유한다.
 *
 * @param fq fractional cube q 성분
 * @param fr fractional cube r 성분
 * @param fs fractional cube s 성분
 */
export function hexRoundCubePair(fq: number, fr: number, fs: number): readonly [number, number] {
  let rq = Math.round(fq);
  let rr = Math.round(fr);
  const rs = Math.round(fs);
  const qDiff = Math.abs(rq - fq);
  const rDiff = Math.abs(rr - fr);
  const sDiff = Math.abs(rs - fs);

  // rounding delta가 가장 큰 성분을 나머지 두 성분으로부터 다시 계산해 q + r + s === 0을 복원한다.
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }

  validateHexComputedSafeInteger(rq, 'q');
  validateHexComputedSafeInteger(rr, 'r');
  validateHexComputedSafeInteger(-rq - rr, 's');

  return [hexCanonicalZero(rq), hexCanonicalZero(rr)];
}

/**
 * neighbor/ring/line traversal이 공유하는 axial direction vector.
 *
 * index `0..5`는 Red Blob Games clockwise axial direction order다. `0:E(+1,0)`, `1:NE(+1,-1)`,
 * `2:NW(0,-1)`, `3:W(-1,0)`, `4:SW(-1,+1)`, `5:SE(0,+1)`. wraparound는 제공하지 않는다.
 */
export const HEX_AXIAL_DIRECTIONS: readonly (readonly [number, number])[] = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];

/**
 * direction index가 `0..5` safe integer인지 검증한다.
 *
 * `-1`, `6`, non-integer float, `NaN`, `Infinity`, `-Infinity`는 모두 `RangeError`다. neighbor
 * helper가 direction vector를 안전하게 lookup하도록 정수성과 범위를 함께 강제한다.
 *
 * @param direction 검증할 direction index
 */
export function validateHexDirection(direction: number): void {
  if (!Number.isSafeInteger(direction) || direction < 0 || direction > 5) {
    throw new RangeError(`hex direction must be an integer in 0..5, got ${String(direction)}`);
  }
}

/**
 * ring radius가 non-negative safe integer인지 검증한다.
 *
 * `-1`, non-integer float, `NaN`, `Infinity`, `-Infinity`는 모두 `RangeError`다. radius `0`은
 * 허용하며 center 한 개를 반환하는 degenerate ring을 뜻한다.
 *
 * @param radius 검증할 ring radius
 */
export function validateHexRadius(radius: number): void {
  if (!Number.isSafeInteger(radius) || radius < 0) {
    throw new RangeError(`hex ring radius must be a non-negative safe integer, got ${String(radius)}`);
  }
}

/**
 * hex collection 길이가 안전한 array length 범위 안인지 검증한다.
 *
 * radius/distance가 큰 traversal이 만드는 cell 개수가 safe integer가 아니거나 JS array 최대 길이
 * `0xffffffff`를 넘으면 `RangeError`다. 거대한 allocation 시도를 build 직전에 미리 막는다.
 *
 * @param count 검증할 collection cell 개수
 */
export function validateHexCollectionCount(count: number): void {
  if (!Number.isSafeInteger(count) || count < 0 || count > 0xffffffff) {
    throw new RangeError(
      `hex collection length must be a safe array length within 0..${0xffffffff}, got ${String(count)}`
    );
  }
}

/**
 * 계산된 axial coordinate 목록을 검증한 뒤 성공 시에만 out에 commit한다.
 *
 * 모든 coordinate q/r이 safe integer인지 먼저 검증한다. 하나라도 unsafe면(`Number.MAX_SAFE_INTEGER`
 * 초과 합 등) `RangeError`를 던지고 out을 수정하지 않는다. validation을 모두 통과하면 out을 비우고
 * 각 coordinate를 `-0` canonicalize한 새 plain `{ q, r }` object로 push한 뒤 같은 out을 반환한다.
 *
 * @param out collection을 기록할 writable array
 * @param coords commit할 계산된 `[q, r]` 목록
 */
export function commitHexAxialCollection(
  out: HexAxialWritable[],
  coords: readonly (readonly [number, number])[]
): HexAxialWritable[] {
  for (const coord of coords) {
    validateHexComputedSafeInteger(coord[0], 'q');
    validateHexComputedSafeInteger(coord[1], 'r');
  }
  out.length = 0;
  for (const coord of coords) {
    out.push({ q: hexCanonicalZero(coord[0]), r: hexCanonicalZero(coord[1]) });
  }
  return out;
}

/**
 * 두 scalar `a`, `b`를 parameter `t`로 linear interpolation한다.
 *
 * `a + (b - a) * t`를 반환한다. line traversal이 cube 성분별 interpolation에 같은 공식을 쓰도록
 * 이 primitive로 내린다.
 *
 * @param a 시작 성분
 * @param b 끝 성분
 * @param t `0..1` interpolation parameter
 */
export function hexLerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * axial 또는 cube input을 검증된 integer cube 성분 `[q, r, s]`로 읽는다.
 *
 * cube input은 safe integer와 `q + r + s === 0` invariant를 검증한다. axial input은 safe integer를
 * 검증하고 `s = -q - r`로 cube화하며 계산된 `s`가 safe integer 범위를 벗어나면 `RangeError`다.
 *
 * @param input cube로 읽을 axial 또는 cube coordinate
 */
export function toHexCubeChecked(input: HexAxialLike | HexCubeLike): readonly [number, number, number] {
  if (isHexCubeInput(input)) {
    const q = readHexCubeQ(input);
    const r = readHexCubeR(input);
    const s = readHexCubeS(input);
    validateHexCubeSafeInteger(q, r, s);
    validateHexCubeZeroSum(q, r, s);
    return [q, r, s];
  }

  const q = readHexAxialQ(input);
  const r = readHexAxialR(input);
  validateHexAxialSafeInteger(q, r);
  const s = -q - r;
  validateHexComputedSafeInteger(s, 's');
  return [q, r, s];
}
