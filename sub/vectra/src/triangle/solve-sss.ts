import { type AngleSet, solveSssInto } from './solve-sss-into';

/**
 * 세 변의 길이 a, b, c로 삼각형의 세 내각(radian)을 계산해 새 AngleSet으로 반환한다.
 *
 * valid triangle이면 세 내각이 채워진 AngleSet을 반환한다. invalid triangle이면
 * undefined를 반환한다. invalid 조건은 `solveSssInto`와 동일하다.
 *
 *
 * finite/non-finite 입력과 결과 처리 정책은 `solveSssInto`와 동일하다.
 * @param a 변 a의 길이
 * @param b 변 b의 길이
 * @param c 변 c의 길이
 */
export function solveSss(a: number, b: number, c: number): AngleSet | undefined {
  const out: AngleSet = { a: 0, b: 0, c: 0 };
  const result = solveSssInto(out, a, b, c);
  return result === false ? undefined : out;
}
