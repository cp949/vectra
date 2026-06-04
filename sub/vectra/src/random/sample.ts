import type { RandomSource } from './random';
import { sampleInto } from './sample-into';

/**
 * 배열에서 replacement 없이 최대 `count`개 항목을 뽑아 새 배열로 반환한다.
 *
 * 입력 배열은 변경하지 않는다. `count`가 입력 길이를 초과하면 가능한 모든 항목을 반환한다.
 *
 * @param items - 샘플링 대상 배열. 읽기 전용.
 * @param count - 선택할 최대 항목 수. `0..0xffffffff` safe integer여야 한다.
 * @param rng - 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 * @throws {RangeError} count가 유효한 sample count가 아니면 던진다.
 */
export const sample = <T>(items: readonly T[], count: number, rng?: RandomSource): T[] =>
  sampleInto([], items, count, rng);
