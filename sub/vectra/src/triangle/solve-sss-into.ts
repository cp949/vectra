/** 세 내각(radian)을 기록할 수 있는 writable output type. */
export interface AngleSet {
  /** 변 a의 대각(radian) */
  a: number;
  /** 변 b의 대각(radian) */
  b: number;
  /** 변 c의 대각(radian) */
  c: number;
}

/**
 * 세 변의 길이 a, b, c로 삼각형의 세 내각(radian)을 계산해 out에 기록한다.
 *
 * 삼각형 불등식(a + b > c, b + c > a, a + c > b)을 만족하고 세 변이 양수인 경우에만
 * 내각을 out에 기록하고 out을 반환한다. invalid triangle이면 out을 수정하지 않고
 * false를 반환한다. non-finite 또는 <= 0인 변 길이도 invalid로 처리한다.
 *
 * 공식(코사인 법칙):
 * - `angleA = acos((b² + c² - a²) / (2bc))`
 * - `angleB = acos((a² + c² - b²) / (2ac))`
 * - `angleC = π - angleA - angleB`
 *
 * @param out 세 내각을 기록할 writable output
 * @param a 변 a의 길이
 * @param b 변 b의 길이
 * @param c 변 c의 길이
 */
export function solveSssInto<Out extends AngleSet>(out: Out, a: number, b: number, c: number): Out | false {
  if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(b) || b <= 0 || !Number.isFinite(c) || c <= 0) {
    return false;
  }

  // 삼각형 불등식
  if (a >= b + c || b >= a + c || c >= a + b) {
    return false;
  }

  const cosA = (b * b + c * c - a * a) / (2 * b * c);
  const cosB = (a * a + c * c - b * b) / (2 * a * c);

  const angleA = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const angleB = Math.acos(Math.max(-1, Math.min(1, cosB)));
  const angleC = Math.PI - angleA - angleB;

  out.a = angleA;
  out.b = angleB;
  out.c = angleC;

  return out;
}
