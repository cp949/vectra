import { assertFiniteNumbers } from './range.internal';

/** toFixedPrecision의 options object 형태. */
export interface ToFixedPrecisionOptions {
  /** 소수점 이하 자릿수. 기본값 6. */
  digits: number;
}

/**
 * value를 지정한 소수점 자릿수로 반올림한 부동소수점을 반환한다.
 *
 * `parseFloat(value.toFixed(digits))`로 계산한다. digits 기본값은 6이다.
 * value는 finite number여야 한다.
 *
 * @param value 반올림할 scalar 값
 * @param digitsOrOptions 소수점 자릿수 또는 options object. 생략 시 6.
 */
export function toFixedPrecision(value: number, digitsOrOptions?: number | ToFixedPrecisionOptions): number {
  assertFiniteNumbers([value]);

  let digits = 6;

  if (digitsOrOptions !== undefined) {
    if (typeof digitsOrOptions === 'number') {
      digits = digitsOrOptions;
    } else {
      digits = digitsOrOptions.digits;
    }
  }

  return parseFloat(value.toFixed(digits));
}
