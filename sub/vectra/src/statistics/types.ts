/**
 * `variance`/`standardDeviation`의 옵션.
 *
 * `mode`는 denominator 정책이다. `"population"`이면 `n`, `"sample"`이면 `n - 1`을 사용한다.
 * 기본값은 `"population"`이다. `mode: "sample"`이면 `values.length === 1`에서 `RangeError`다
 * (빈 배열은 mode와 무관하게 length === 0 분기에서 `RangeError`).
 */
export interface VarianceOptions {
  /** denominator 정책. 기본 `"population"`. */
  readonly mode?: 'population' | 'sample';
}

/**
 * `standardize`/`standardizeInto`의 옵션.
 *
 * `mode`는 `standardDeviation` 계산의 denominator 정책이다. `"population"`이면 `n`,
 * `"sample"`이면 `n - 1`을 사용한다. 기본값은 `"population"`이다. `mode: "sample"`이면
 * `values.length === 1`에서 `RangeError`다. `values.length === 0`은 `mode: "sample"`이어도
 * `[]` no-op transform이다(length === 0 분기가 sample 검증보다 먼저 실행).
 */
export interface StandardizeOptions {
  /** standardDeviation denominator 정책. 기본 `"population"`. */
  readonly mode?: 'population' | 'sample';
}

/**
 * `covarianceMatrix`/`covarianceMatrixInto` / `correlationMatrix`/`correlationMatrixInto`의 옵션.
 *
 * `mode`는 denominator 정책으로 `VarianceOptions`와 같다. `"population"`이면 `n`, `"sample"`이면
 * `n - 1`을 사용한다.
 *
 * `orientation`은 `data` matrix의 row/column 해석이다. `"columns"`는 row를 observation, column을
 * variable로 본다(기본). `"rows"`는 row를 variable, column을 observation으로 본다.
 *
 * `orientation`이 `"columns"`/`"rows"`가 아니면 `RangeError`다. variable count가 `0`이면 `[]`을
 * 반환하고 sample count가 `0`인데 variable count가 `> 0`이면 `RangeError`다. `mode: "sample"`에서
 * sample count가 `< 2`이면 `RangeError`다.
 */
export interface CovarianceMatrixOptions extends VarianceOptions {
  /** matrix row/column 해석. 기본 `"columns"`. */
  readonly orientation?: 'columns' | 'rows';
}

/**
 * `pca`의 옵션. `CovarianceMatrixOptions`의 `orientation`/`mode`를 그대로 사용하고 PCA 고유 옵션을 추가한다.
 *
 * `useCorrelation` 기본 `false`다. `false`이면 centered covariance matrix를, `true`이면 각 variable을
 * 표준편차로 나눠 표준화한 뒤 covariance(=correlation) matrix를 분해한다. `useCorrelation: true`에서
 * variance가 `0`인 variable이 있으면 `RangeError`.
 *
 * `maxIterations`는 symmetric eigen 반복의 최대 sweep 수다. positive safe integer가 아니면
 * `RangeError`. 기본 `100`. `maxIterations` 안에 수렴하지 못하면 `undefined`를 반환한다.
 *
 * `tolerance`는 반복 수렴 판정에만 사용한다. 0 이상 finite number가 아니면 `RangeError`. 기본 `1e-10`.
 *
 * `epsilon`은 rank 판정, negative eigenvalue clamp, zero cleanup에만 사용한다. input/result finite
 * validation에는 사용하지 않는다. 0 이상 finite number가 아니면 `RangeError`. 기본 `1e-9`.
 */
export interface PCAOptions extends CovarianceMatrixOptions {
  /** correlation 기반 PCA 사용 여부. 기본 `false`. */
  readonly useCorrelation?: boolean;

  /** symmetric eigen 반복의 최대 sweep 수. 기본 `100`. */
  readonly maxIterations?: number;

  /** 반복 수렴 판정 tolerance. 기본 `1e-10`. */
  readonly tolerance?: number;

  /** rank 판정 / negative eigenvalue clamp / zero cleanup tolerance. 기본 `1e-9`. */
  readonly epsilon?: number;
}

/**
 * `pca`의 결과.
 *
 * `components`는 row=component, column=original variable인 matrix다. row 수는 `rank`와 같다.
 * 각 row는 unit vector이고 첫 strict non-zero loading이 양수가 되도록 sign이 고정된다.
 *
 * `explainedVariance`는 각 component의 variance contribution이며 descending 순서다. length는
 * `rank`와 같다. `explainedVarianceRatio`는 같은 길이이고 합이 `1`이 되도록 정규화된다 (rank가
 * `0`이면 `[]`).
 *
 * `means`는 항상 variable 평균 배열이다. variable count가 `0`이면 `[]`.
 *
 * `standardDeviations`는 `useCorrelation: true`일 때만 채워진다. 그 외에는 `undefined`다. 채워질
 * 경우 length는 variable 수와 같다.
 *
 * `rank`는 `epsilon` 기준 strict positive eigenvalue 개수다. `0` 이상 variable count 이하 정수다.
 *
 * 모든 numeric entry의 `-0`은 `Object.is(value, -0)` 기준으로 `0`으로 canonicalize된다.
 */
export interface PCAResult {
  /** principal component matrix. row=component, column=original variable. */
  readonly components: number[][];

  /** 각 component의 variance contribution. descending 순서. */
  readonly explainedVariance: number[];

  /** 각 component의 variance contribution 비율. 합이 `1`(rank > 0). */
  readonly explainedVarianceRatio: number[];

  /** 각 variable의 평균. */
  readonly means: number[];

  /** `useCorrelation: true`일 때 각 variable의 표준편차. 그 외에는 `undefined`. */
  readonly standardDeviations?: number[];

  /** strict positive eigenvalue 개수. */
  readonly rank: number;
}

/**
 * `reduceDimensions`/`reduceDimensionsInto`의 옵션. `PCAOptions`를 그대로 확장하고 유지할 component
 * 개수를 `dimensions`로 받는다.
 *
 * `dimensions`는 positive safe integer다. 0, 음수, non-integer, `Infinity`, `NaN`은 모두
 * `RangeError`. PCA decomposition 결과 `rank`보다 크면 `RangeError`. `dimensions === rank`는 모든
 * component를 유지한다. PCA decomposition이 수렴 실패 등으로 결과를 만들지 못하면 `RangeError`로
 * 변환된다(`reduceDimensions*`는 결과 matrix를 반드시 반환해야 한다).
 *
 * PCA 자체의 검증(`orientation`/`mode`/`useCorrelation`/`maxIterations`/`tolerance`/`epsilon`)은
 * `PCAOptions`와 동일하다.
 */
export interface DimensionReductionOptions extends PCAOptions {
  /** 유지할 principal component 개수. positive safe integer, `<= rank`. */
  readonly dimensions: number;
}

/**
 * `solveOverdeterminedSystem` / `calculateLinearLeastSquares` / `calculateGeneralLeastSquares`의 옵션.
 *
 * `epsilon`은 QR rank-deficient 판정에만 사용한다. input/result finite validation, residual 계산,
 * 결과 coefficient의 signed-zero canonicalize에는 사용하지 않는다(signed-zero는 `Object.is`로 strict
 * 판정한다). 0 이상 finite number여야 하며 위반 시 `RangeError`. 미지정 시 default(`1e-9`)를 사용한다.
 */
export interface LeastSquaresOptions {
  /** QR rank-deficient 판정 tolerance. 기본 `1e-9`. */
  readonly epsilon?: number;
}

/**
 * `histogram`/`histogramInto`/`histogramBinEdges`의 옵션.
 *
 * `bins`는 두 가지 의미를 가진다.
 *
 *  - `number`: bin 개수. positive safe integer(`>= 1`). non-integer, `0`, 음수, `Infinity`, `NaN`은 모두 `RangeError`.
 *  - `readonly number[]`: explicit bin edge 배열. length `>= 2`, 모든 entry는 finite number, strictly increasing이어야 한다.
 *    위반 시 `RangeError`(top-level 또는 entry가 array/number가 아니면 `TypeError`).
 *
 * `bins`가 number도 array도 아니면 `TypeError`(타입 위반은 `TypeError`, 값 위반은 `RangeError`로 분기).
 *
 * `bins`가 explicit edge 배열이면 `range`는 silent ignore된다(explicit edge가 우선). 동시 지정해도 오류는 아니다.
 * 이 경우 `range`는 검증 자체를 거치지 않아 invalid range tuple(`[NaN, 1]` 등)도 무시된다 — caller는 명시적으로 둘 중 하나만 넘기는 것을 권장한다.
 *
 * `range`는 `[min, max]` tuple이며 explicit lower/upper bound다. 두 entry는 finite number여야 하고 `min < max`이어야 한다.
 * 위반 시 `RangeError`. `range`가 지정되면 `values` 중 `min` 미만 또는 `max` 초과인 entry는 `RangeError`로 거부한다
 * (out-of-range는 silent ignore가 아니다).
 *
 * `range`가 지정되지 않고 `bins`가 `number`이면 edge는 `[min(values), max(values)]` 기반으로 균등하게 생성한다.
 * `max === min`이면 deterministic하게 `[v - 0.5, v + 0.5]`을 사용한다. 빈 `values` + `bins: number`는 `RangeError`다.
 *
 * 기본 `bins`는 `10`이다.
 */
export interface HistogramOptions {
  /** bin 개수 또는 explicit bin edge 배열. 기본 `10`. */
  readonly bins?: number | readonly number[];

  /** explicit `[min, max]` range. 지정 시 out-of-range value는 `RangeError`. */
  readonly range?: readonly [number, number];
}

/**
 * `histogram`의 결과.
 *
 * `counts`는 각 bin의 entry 개수 배열이며 length는 `binEdges.length - 1`이다.
 * 모든 entry는 non-negative safe integer다. 누적 count가 safe integer 범위를 벗어나면 `RangeError`로 거부한다.
 *
 * `binEdges`는 bin 경계 배열이며 length는 `counts.length + 1`이다.
 *
 * 모든 numeric entry의 `-0`은 `0`으로 canonicalize된다.
 */
export interface HistogramResult {
  /** 각 bin의 entry 개수. length === `binEdges.length - 1`. */
  readonly counts: number[];

  /** bin 경계 배열. length === `counts.length + 1`. ascending order. */
  readonly binEdges: number[];
}

/**
 * `digitize`/`digitizeInto`의 옵션.
 *
 * 현재 옵션 필드는 없다. 미래에 inclusivity 정책 옵션을 추가할 가능성을 위해 type을 분리한다.
 *
 * 모든 bin은 `[edge[i], edge[i+1])` half-open이고, 마지막 bin만 right-inclusive `[lastLower, lastUpper]`이다.
 * `value < binEdges[0]` 또는 `value > binEdges[lastIndex]`이면 `RangeError`다.
 */
export interface DigitizeOptions {
  /** 미래 확장 자리. 현재 미사용. */
  readonly _reserved?: never;
}

/**
 * `bincount`/`bincountInto`의 옵션.
 *
 * `minLength`는 결과 배열의 최소 길이다. number가 아니면 `TypeError`, non-negative safe integer가 아니면 `RangeError`.
 * `minLength`가 지정되면 결과 length는 `max(minLength, maxLabel + 1)`이다(빈 입력이면 `minLength`).
 * 미지정이면 결과 length는 `maxLabel + 1`(빈 입력이면 `0`)이다.
 */
export interface BincountOptions {
  /** 결과 배열의 최소 길이. non-negative safe integer. */
  readonly minLength?: number;
}

/**
 * `normalizeMinMax`/`normalizeMinMaxInto`의 옵션.
 *
 * `range`는 출력의 `[targetMin, targetMax]`다. 두 entry는 finite이고 `targetMin < targetMax`이어야 한다.
 * 위반 시 `RangeError`. top-level이 array가 아니거나 entry가 number가 아니면 `TypeError`.
 * 미지정 시 기본 `[0, 1]`.
 *
 * 입력 `values`의 `max === min`(zero input range)이면 결과는 같은 길이로 `range[0]`(`targetMin`)을 채운다.
 * 단일 entry 입력도 zero input range로 본다. 기본 range `[0, 1]`에서는 zero vector와 같지만 custom range에서는
 * `targetMin`을 채운다(`standardize`의 zero stddev는 항상 `0` fill이라는 점과 다르다 — 정의역이 다르기 때문).
 *
 * 빈 입력(`values.length === 0`)은 `[]`을 반환한다(no-op transform). 옵션 검증은 빈 입력에서도 fail-fast다.
 */
export interface NormalizeMinMaxOptions {
  /** 출력 `[targetMin, targetMax]`. 기본 `[0, 1]`. */
  readonly range?: readonly [number, number];
}

/**
 * `mahalanobisDistance`의 옵션.
 *
 * `epsilon`은 covariance matrix의 symmetry 허용 오차와 SPD 판정 tolerance다. 0 이상 finite number여야 하며 위반 시 `RangeError`.
 * 기본 `1e-9`. `epsilon`은 input/result finite validation이나 distance 산술에 사용하지 않는다(tolerance-split).
 *
 *  - `|cov[i][j] - cov[j][i]|`가 `epsilon`을 초과하면 non-symmetric으로 `RangeError`.
 *  - Cholesky pivot squared 값(`L[k][k]^2 = cov[k][k] - Σ_{j<k} L[k][j]^2`)이 `epsilon` 이하이면 singular/non-SPD로 `RangeError`.
 */
export interface MahalanobisOptions {
  /** symmetry/SPD 판정 tolerance. 기본 `1e-9`. */
  readonly epsilon?: number;
}

/**
 * `whiten`/`whitenInto`의 옵션.
 *
 * `orientation`은 입력 matrix의 row/column 해석이다. `"columns"`는 row=observation, column=variable(기본).
 * `"rows"`는 row=variable, column=observation. `"columns"`/`"rows"`가 아니면 `RangeError`.
 * 결과 matrix의 shape는 입력 orientation을 그대로 유지한다.
 *
 * `mode`는 sample covariance denominator 정책이다. `"population"`(기본, denominator `n`) / `"sample"`(denominator `n - 1`).
 * 위반 시 `RangeError`. `mode: "sample"`에서 sample count `< 2`이면 `RangeError`.
 *
 * `epsilon`은 SPD 판정 tolerance다. 0 이상 finite number여야 하며 위반 시 `RangeError`. 기본 `1e-9`.
 * `epsilon`은 input/result finite validation에 사용하지 않는다(tolerance-split). Cholesky pivot squared 값
 * (`L[k][k]^2 = cov[k][k] - Σ_{j<k} L[k][j]^2`)이 `epsilon` 이하이면 non-SPD/singular로 `RangeError`.
 * `mahalanobisDistance`와 달리 symmetry 검증은 수행하지 않는다 — covariance matrix를 함수가 직접 산출하므로 항상 symmetric이 보장된다.
 */
export interface WhiteningOptions {
  /** matrix row/column 해석. 기본 `"columns"`. */
  readonly orientation?: 'columns' | 'rows';

  /** covariance denominator 정책. 기본 `"population"`. */
  readonly mode?: 'population' | 'sample';

  /** SPD 판정 tolerance. 기본 `1e-9`. */
  readonly epsilon?: number;
}

/**
 * least-squares solver의 결과.
 *
 * `coefficients`는 length가 column 수와 같은 fresh `number[]`이며 `-0`은 `0`으로 canonicalize한다.
 * `residual`은 비음의 finite number로 `||A * coefficients - b||₂`다. `rank`는 입력 column 수와 같다
 * (rank-deficient는 결과 자체가 `undefined`로 반환되어 본 type에 포함되지 않는다).
 */
export interface LeastSquaresResult {
  /** least-squares solution coefficient 배열. */
  readonly coefficients: number[];

  /** `||A * coefficients - b||₂` 값. 비음의 finite number. */
  readonly residual: number;

  /** column rank. 결과가 반환되는 경우 입력 column 수와 같다. */
  readonly rank: number;
}
