import type { SegmentSubdivideOptions } from '../types';
import type { Segment, SegmentWritable } from '../types/flat-shapes.internal';

/**
 * segment를 `count` 기준으로 균등 N분할해 outSegments에 새 plain segment object로 기록하고 반환한다.
 *
 * `split*`의 단일 `t` 2분할과 다르게 normalized `i / count`와 `(i + 1) / count` 기준 균등 N분할
 * collection output이다. outSegments는 먼저 clear된 뒤 결과 segment가 push되며 같은 outSegments를
 * 반환한다.
 *
 * - `count` 기본값은 `2`다. positive integer가 아니면(`< 1`, non-integer, non-finite) `RangeError`로
 *   fail-fast한다.
 * - `count === 1`은 원본 segment 1개 복제와 같다.
 * - 인접 sub-segment의 공유점은 같은 좌표값을 갖는다. 시작점은 정확히 `a`, 끝점은 정확히 `b`다.
 * - zero-length segment도 실패가 아니라 `count`개의 zero-length segment를 만든다.
 *
 * finite 검증은 하지 않는다. endpoint 좌표가 non-finite(NaN/±Infinity)이면 throw하지 않고 JS 산술
 * 결과를 그대로 기록한다(시작/끝점은 산술 없이 `a`/`b`를 그대로 보존한다). `-0` canonicalization은
 * `split*`처럼 하지 않는다.
 *
 * input/output aliasing이 가능하므로 clear 전에 source endpoint를 scalar로 snapshot한다. outSegments가
 * 입력 선분을 원소로 포함해도 결과를 보존한다. 출력 segment는 매번 새 plain object
 * `{ x1, y1, x2, y2 }`로 push한다(기존 segment object 재사용 없음).
 *
 * @param outSegments 분할 결과를 기록할 선분 배열
 * @param segment 분할할 segment
 * @param options `count`(positive integer, 기본 `2`) 분할 옵션
 * @throws {RangeError} `count`가 positive integer가 아니면 던진다.
 */
export function subdivideInto(
  outSegments: SegmentWritable[],
  segment: Segment,
  options?: SegmentSubdivideOptions
): SegmentWritable[] {
  const count = options?.count ?? 2;
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError(`segment.subdivideInto: count는 positive integer여야 한다 (받음: ${count})`);
  }

  // input/output aliasing 안전: clear 전에 source endpoint를 scalar로 snapshot한다.
  const ax = segment.x1;
  const ay = segment.y1;
  const bx = segment.x2;
  const by = segment.y2;

  const dx = bx - ax;
  const dy = by - ay;

  // 공유점 일관성과 endpoint 정확 보존을 위해 분할 vertex를 한 번만 계산한다.
  // index 0/count는 산술 없이 a/b를 그대로 써서 0 * ±Infinity = NaN 오염을 피한다.
  const vx: number[] = new Array(count + 1);
  const vy: number[] = new Array(count + 1);
  vx[0] = ax;
  vy[0] = ay;
  vx[count] = bx;
  vy[count] = by;
  for (let i = 1; i < count; i++) {
    const t = i / count;
    vx[i] = ax + t * dx;
    vy[i] = ay + t * dy;
  }

  outSegments.length = 0;

  for (let i = 0; i < count; i++) {
    outSegments.push({
      x1: vx[i],
      y1: vy[i],
      x2: vx[i + 1],
      y2: vy[i + 1],
    });
  }

  return outSegments;
}
