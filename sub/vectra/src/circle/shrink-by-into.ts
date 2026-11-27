import type { Circle, CircleWritable } from '../types/flat-shapes.internal';
import { expandByInto } from './expand-by-into';

/**
 * circle의 radius에서 amount를 뺀 결과를 out에 기록하고 out을 반환한다.
 *
 * center는 그대로 복사된다. amount가 음수이면 radius가 늘어난다. 결과 radius에 clamp를
 * 적용하지 않는다. input과 out이 같은 object여도 안전하다.
 *
 * NaN/Infinity amount는 out.r에 그대로 전파된다. amount가 음수인 경우와 결과 radius가
 * 음수가 되는 경우는 caller 책임이다.
 *
 * @param out 결과를 기록할 원 객체
 * @param circle 기준 circle
 * @param amount radius에서 뺄 값 (음수 허용)
 */
export function shrinkByInto<Out extends CircleWritable>(out: Out, circle: Circle, amount: number): Out {
  return expandByInto(out, circle, -amount);
}
