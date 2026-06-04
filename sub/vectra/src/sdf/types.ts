import type { XYInput } from '../types';

/**
 * 2D point를 signed distance 값으로 매핑하는 callable signed-distance 함수.
 *
 * interior는 음수, boundary는 `0`, exterior는 양수다. primitive SDF helper를 이 형태로 감싸
 * boolean composition의 입력으로 쓸 수 있다.
 */
export type Sdf2 = (point: XYInput) => number;
