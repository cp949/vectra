/**
 * `linspace`/`linspaceInto`의 옵션.
 *
 * `endpoint`가 `true`(기본값)이면 마지막 entry로 `xMax`를 포함하고, denominator는 `binCount - 1`이다.
 * `false`이면 마지막 entry로 `xMax`를 포함하지 않고, denominator는 `binCount`다. 두 경우 모두
 * `binCount === 1`이면 결과는 `[xMin]`으로 고정한다.
 */
export interface LinspaceOptions {
  /** 마지막 entry로 `xMax`를 포함할지 여부. 기본 `true`. */
  readonly endpoint?: boolean;
}

/**
 * `derivative`/`derivativeInto`의 옵션.
 *
 * `method`는 finite-difference 방식이다. middle row에서 `"forward"`는 `(y[i + 1] - y[i]) / dx`,
 * `"backward"`는 `(y[i] - y[i - 1]) / dx`, `"central"`은 `(y[i + 1] - y[i - 1]) / (2 * dx)`를 사용한다.
 * boundary row(`i === 0`, `i === binCount - 1`)는 method와 무관하게 one-sided fallback으로 계산한다.
 * 기본값은 `"central"`이다.
 */
export interface DerivativeOptions {
  /** finite-difference 방식. 기본 `"central"`. */
  readonly method?: 'forward' | 'backward' | 'central';
}

/**
 * `gradient`/`gradientInto` 등 multivariate finite-difference helper의 옵션.
 *
 * `method`는 partial derivative 방식이다. `"forward"`는 `(f(x + h_i e_i) - f(x)) / h_i`,
 * `"backward"`는 `(f(x) - f(x - h_i e_i)) / h_i`, `"central"`은
 * `(f(x + h_i e_i) - f(x - h_i e_i)) / (2 h_i)`를 사용한다. 기본값은 `"central"`이다.
 * `step`은 finite-difference perturbation magnitude이며 derivative tolerance가 아니다.
 * scalar number이면 모든 축에 같은 step을 적용하고, length가 `point.length`와 같은 vector이면
 * 축별 step을 적용한다. scalar와 vector entry 모두 positive finite number여야 한다.
 * 미지정 시 기본값은 `1e-5`다.
 */
export interface MultivariateDerivativeOptions {
  /** finite-difference 방식. 기본 `"central"`. */
  readonly method?: 'forward' | 'backward' | 'central';

  /** finite-difference perturbation magnitude. 기본 `1e-5`. positive finite number 또는 길이가 `point.length`와 같은 positive finite vector. */
  readonly step?: number | readonly number[];
}
