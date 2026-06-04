import type { SegmentLike, SegmentSubdivideOptions, SegmentWritable } from '../types';
import { subdivideInto } from './subdivide-into';

/**
 * segment를 `count` 기준으로 균등 N분할한 새 plain segment 배열을 반환한다.
 *
 * 대응 `subdivideInto`와 정책이 같다. `split*`의 단일 `t` 2분할과 다르게 normalized `i / count`와
 * `(i + 1) / count` 기준 균등 N분할이다.
 *
 * - `count` 기본값은 `2`다. positive integer가 아니면(`< 1`, non-integer, non-finite) `RangeError`로
 *   fail-fast한다.
 * - `count === 1`은 원본 segment 1개 복제와 같다.
 * - 인접 sub-segment의 공유점은 같은 좌표값을 갖는다. 시작점은 정확히 `a`, 끝점은 정확히 `b`다.
 * - zero-length segment도 실패가 아니라 `count`개의 zero-length segment를 반환한다.
 *
 * finite 검증은 하지 않는다. endpoint 좌표가 non-finite(NaN/±Infinity)이면 throw하지 않고 JS 산술
 * 결과를 그대로 반환한다(시작/끝점은 산술 없이 `a`/`b`를 그대로 보존한다). buffer 재사용이 필요하면
 * `subdivideInto`를 사용한다. 매번 새 array를 할당하므로 caller-visible aliasing/clear 우려가 없다.
 * 분할 vertex 계산, output clear, input/output aliasing 세부 정책은 대응 `subdivideInto`를 따른다.
 *
 * @param segment 분할할 segment
 * @param options `count`(positive integer, 기본 `2`) 분할 옵션
 * @throws {RangeError} `count`가 positive integer가 아니면 던진다.
 */
export function subdivide(segment: SegmentLike, options?: SegmentSubdivideOptions): SegmentWritable[] {
  return subdivideInto([], segment, options);
}
