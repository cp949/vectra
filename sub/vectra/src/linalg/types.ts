/** general numeric vector input. nested `readonly number[]` 형태로만 받는다. */
export type VecLike = readonly number[];

/** vector output을 기록할 mutable `number[]` storage. */
export type VecWritable = number[];

/** general numeric matrix input. row-major nested `readonly (readonly number[])[]` 형태로만 받는다. */
export type MatLike = readonly (readonly number[])[];

/** matrix output을 기록할 mutable `number[][]` storage. */
export type MatWritable = number[][];

/**
 * matrix 크기 `[rows, columns]`.
 *
 * 두 값 모두 비음의 safe integer다. one-sided zero shape(`[m, 0]`, `[0, n]`)는 nested array로
 * 표현할 수 없으므로 public input으로 받지 않는다. 빈 matrix는 `[0, 0]`만 허용한다.
 */
export type MatrixShape = readonly [rows: number, columns: number];

/**
 * sparse vector entry 하나. `index`는 비음의 safe integer다.
 *
 * sparse 표현에서 같은 `index`가 두 번 등장하면 재구성 함수가 `RangeError`를 던진다.
 */
export interface SparseVectorEntry {
  /** 0-based vector entry index */
  readonly index: number;

  /** entry 값 */
  readonly value: number;
}

/**
 * sparse matrix entry 하나. `row`/`column`은 비음의 safe integer다.
 *
 * sparse 표현에서 같은 `(row, column)`이 두 번 등장하면 재구성 함수가 `RangeError`를 던진다.
 */
export interface SparseMatrixEntry {
  /** 0-based row index */
  readonly row: number;

  /** 0-based column index */
  readonly column: number;

  /** entry 값 */
  readonly value: number;
}

/**
 * norm 계산 옵션.
 *
 * `p` 미지정 또는 `undefined`이면 Euclidean norm(`p = 2`)을 사용한다. `p`를 지정할 경우
 * `pNorm` 정책과 동일하게 `p >= 1`인 finite number만 허용한다.
 */
export interface NormOptions {
  /** 사용할 p-norm 차수. 기본 `2`. `p >= 1` finite number만 허용한다. */
  p?: number;
}

/**
 * row echelon, RREF, Gauss-Jordan, determinant, rank, inverse에서 공유하는 pivot 옵션.
 *
 * `epsilon`은 partial pivoting 후보의 absolute value가 zero pivot인지 판정하는 tolerance다.
 * 미지정 또는 `undefined`이면 default(`1e-9`)를 사용한다. 0 이상 finite number만 허용한다.
 * input/result finite validation에는 사용하지 않는다. pivot 판정과 elimination 잔여 cleanup에만
 * 영향을 준다.
 */
export interface PivotOptions {
  /** pivot zero 판정 허용 오차. 기본 `1e-9`. 0 이상 finite number만 허용한다. */
  readonly epsilon?: number;
}

/**
 * sparse 변환 옵션.
 *
 * `epsilon` 미지정 또는 `undefined`이면 exact zero(`epsilon = 0`) 기준으로 sparse 항목을 추출한다.
 * `Math.abs(value) > epsilon`인 entry만 sparse 표현에 남는다. `epsilon`은 비음의 finite number여야 한다.
 */
export interface SparseOptions {
  /** zero 판정 허용 오차. 기본 `0`. */
  epsilon?: number;
}

/**
 * `singularValueDecomposition`의 thin SVD 결과.
 *
 * rectangular matrix `A`(`m x n`)에 대해 `A = U * diag(singularValues) * V^T`를 만족하는 fixed
 * plain object 표현이다.
 *
 * - `leftSingularVectors`는 `m x rank` orthonormal column matrix `U`. column-orthonormal:
 *   `U^T * U = I_rank`.
 * - `singularValues`는 길이 `rank`의 positive singular value 배열. descending 정렬.
 * - `rightSingularVectors`는 `n x rank` orthonormal column matrix `V`. column-orthonormal:
 *   `V^T * V = I_rank`. 각 column은 첫 strict non-zero entry가 양수가 되도록 sign이 고정된다.
 * - `rank`는 `sigma > epsilon` 조건을 만족하는 singular value 개수.
 *
 * `rank === 0`이면 세 collection 모두 `[]`이고 `rank = 0`이다. 모든 결과는 input matrix 참조를
 * 공유하지 않는 fresh storage이며 `-0`이 남지 않는다.
 *
 * repeated singular value의 basis 방향은 Jacobi 결과에 의존한다(특정 회전을 강제하지 않는다).
 * reconstruction과 orthogonality는 보존된다.
 */
export interface SingularValueDecomposition {
  readonly leftSingularVectors: number[][];
  readonly singularValues: number[];
  readonly rightSingularVectors: number[][];
  readonly rank: number;
}

/**
 * `eig`의 thin eigen decomposition 결과. real spectrum만 표현한다.
 *
 * - `values`는 길이 `n`의 real eigenvalue 배열. symmetric 경로는 Jacobi 결과 순서, nonsymmetric
 *   2x2 distinct 경로는 closed form 순서(`(trace + sqrtD) / 2`가 먼저)를 그대로 따른다.
 *   정렬되지 않는다.
 * - `vectors`는 `n x n` column matrix. `vectors[row][i]`는 `values[i]`에 대응하는 eigenvector의
 *   `row`-번째 entry다. `vectors.length === n`, `vectors[row].length === values.length === n`을
 *   항상 만족한다. 각 column은 unit norm이고 첫 strict non-zero entry가 양수다.
 *
 * `values`와 `vectors`는 input matrix 참조를 공유하지 않는 fresh storage이며 `-0`이 남지 않는다.
 *
 * `n === 0`이면 `{ values: [], vectors: [] }`다.
 */
export interface EigenDecomposition {
  readonly values: number[];
  readonly vectors: number[][];
}

/**
 * iterative numerical solver의 공통 옵션.
 *
 * 세 tolerance는 의미가 분리되어 있다. 같은 epsilon 한 값으로 모든 분기를 처리하면 작은 입력에서
 * 분기를 잘못 선택한다.
 *
 * - `maxIterations`: 반복 상한. positive safe integer. 0 이하, 비정수, safe integer 범위 밖은
 *   `RangeError`. 미지정 시 default `100`. 이 횟수 안에 수렴하지 않으면 결과 미생성으로
 *   `undefined`를 반환한다.
 * - `tolerance`: 반복 convergence 판정. 0 이상 finite number. NaN, Infinity, 음수는 `RangeError`.
 *   미지정 시 default `1e-10`. Jacobi off-diagonal max abs가 이 값 이하이면 수렴으로 본다.
 *   input/result finite validation에는 사용하지 않는다.
 * - `epsilon`: zero/rank/nullspace/cleanup 판정. 0 이상 finite number. NaN, Infinity, 음수는
 *   `RangeError`. 미지정 시 default `1e-9`. 2x2 discriminant clamp 경계, symmetry 지원 여부,
 *   nullspace pivot 판정, sigma rank 판정, result zero cleanup에 쓰인다. input/result finite
 *   validation에는 사용하지 않는다.
 */
export interface IterationOptions {
  /** 반복 상한. 기본 `100`. positive safe integer만 허용한다. */
  readonly maxIterations?: number;

  /** convergence 판정 허용 오차. 기본 `1e-10`. 0 이상 finite number만 허용한다. */
  readonly tolerance?: number;

  /** zero/rank/cleanup 판정 허용 오차. 기본 `1e-9`. 0 이상 finite number만 허용한다. */
  readonly epsilon?: number;
}

/**
 * matrix exponential 옵션.
 *
 * `expInto`/`exp`는 scaling-and-squaring + Taylor series로 `e^matrix`를 계산한다. 다음 옵션은
 * convergence 판정과 scaling 횟수에만 영향을 주며 input/result finite validation에는 사용하지 않는다.
 *
 * - `maxTerms`: Taylor series 최대 항 수. positive safe integer. 기본 `64`. 0 이하, 비정수,
 *   safe integer 범위 밖은 `RangeError`. 이 항 수 안에 수렴하지 않으면 `RangeError`.
 * - `tolerance`: Taylor term의 infinity norm이 이 값 이하가 되면 수렴으로 본다. 0 이상 finite number.
 *   기본 `1e-12`. NaN, Infinity, 음수는 `RangeError`. result 전체 zero cleanup에는 사용하지 않는다.
 * - `scalingThreshold`: matrix infinity norm이 이 값 이하가 되도록 `A / 2^s`로 scale한다.
 *   positive finite number. 기본 `0.5`. 0 이하, NaN, Infinity는 `RangeError`.
 */
export interface MatrixExponentialOptions {
  /** Taylor series 최대 항 수. 기본 `64`. positive safe integer만 허용한다. */
  readonly maxTerms?: number;

  /** Taylor term infinity norm이 이 값 이하면 수렴으로 본다. 기본 `1e-12`. 0 이상 finite number만 허용한다. */
  readonly tolerance?: number;

  /** matrix infinity norm이 이 값 이하가 되도록 scale한다. 기본 `0.5`. positive finite number만 허용한다. */
  readonly scalingThreshold?: number;
}

/**
 * Cholesky factorization 결과. symmetric positive-definite matrix `A`에 대해 `A = L * L^T`를
 * 만족하는 lower triangular `number[][]` 표현이다.
 *
 * - `lower`는 lower triangular `number[][]`. upper 영역(`column > row`)은 정확히 `0`이며 diagonal은
 *   양수다.
 *
 * `lower`는 input matrix 참조를 공유하지 않는 fresh storage이며 `-0`이 남지 않는다.
 */
export interface CholeskyDecomposition {
  readonly lower: number[][];
}

/**
 * `qrDecomposition` 옵션.
 *
 * `epsilon`은 column의 정규직교 norm이 zero인지 판정하는 tolerance다. 미지정 또는 `undefined`이면
 * default(`1e-9`)를 사용한다. 0 이상 finite number만 허용한다. input/result finite validation에는
 * 사용하지 않는다. zero norm 판정과 result zero cleanup에만 영향을 준다.
 */
export interface QROptions {
  /** zero norm 판정 허용 오차. 기본 `1e-9`. 0 이상 finite number만 허용한다. */
  readonly epsilon?: number;
}

/**
 * thin QR factorization 결과. rectangular matrix `A`(`m x n`)에 대해 `A = Q * R`를 만족하는
 * fixed plain object 표현이다.
 *
 * - `orthogonal`은 `m x r` orthonormal column matrix `Q`. `r === rank`. column-orthonormal:
 *   `Q^T * Q = I_r`.
 * - `upper`는 `r x n` upper coefficient matrix `R`. dependent column index `j`에 대해
 *   `upper[0..rank-1][j]`는 그 시점까지 누적된 정규직교 column에 대한 projection coefficient를
 *   보존하며, 새 `upper` row는 추가되지 않는다(dependent column은 rank 증가를 일으키지 않는다).
 * - `rank`는 linearly independent column 개수. zero column과 dependent column은 rank에서
 *   제외한다.
 *
 * sign convention: 각 step에서 정규직교화된 vector의 첫 non-zero entry가 양수가 되도록 column
 * sign을 fix한다. 음수일 경우 `Q` column과 `R` row 모두 sign이 뒤집힌다.
 *
 * `rank === 0`이면 `orthogonal === []`, `upper === []`이다. `orthogonal`/`upper`에는 `-0`이 남지
 * 않는다.
 */
export interface QRDecomposition {
  readonly orthogonal: number[][];
  readonly upper: number[][];
  readonly rank: number;
}

/**
 * solver-oriented LU factorization 결과. `P * A = L * U`의 fixed plain object 표현.
 *
 * - `lower`는 lower triangular `number[][]`. diagonal entry는 모두 `1`이며 upper 영역
 *   (`column > row`)은 `0`이다.
 * - `upper`는 upper triangular `number[][]`. lower 영역(`column < row`)은 `0`이다.
 * - `permutation[i]`는 factorized row `i`가 원본 matrix의 어느 row에서 왔는지 가리키는
 *   비음의 safe integer 배열이다. `permutation`은 `[0, n)` 범위의 순열이며 길이는 `n`이다.
 * - `swaps`는 partial pivoting이 일으킨 row swap 횟수다. determinant sign 계산 등에 사용한다.
 *
 * `lower`, `upper`에는 `-0`이 남지 않는다.
 */
export interface LUFactorization {
  readonly lower: number[][];
  readonly upper: number[][];
  readonly permutation: number[];
  readonly swaps: number;
}

/**
 * `slogDet`의 sign과 log-absolute determinant.
 *
 * determinant의 abs와 log를 분리해 매우 큰/작은 |det| 행렬에서도 overflow / underflow 없이 결과를
 * 표현한다.
 *
 * - `sign`: determinant 부호. non-singular에서는 `1` 또는 `-1`. singular에서는 `0`.
 * - `logAbsDet`: `Math.log(Math.abs(det))`. non-singular에서는 finite real number. singular에서는
 *   `Number.NEGATIVE_INFINITY`(`Math.log(0)`)로 표현한다. 이 값은 정의된 결과이며 input/result
 *   validation 오류가 아니다.
 *
 * `det = sign * Math.exp(logAbsDet)`를 만족한다(`sign === 0`이면 `det === 0`).
 */
export interface SLogDetResult {
  readonly sign: -1 | 0 | 1;
  readonly logAbsDet: number;
}

/**
 * linear system `A * x = b`의 solver 결과 union.
 *
 * - `unique`: pivot column 수가 unknown count와 같고 inconsistent row가 없는 경우. `solution`은
 *   각 unknown의 값을 담는 새 `number[]`다. `A`의 row/column shape와 무관하게 분류된다.
 * - `overdetermined`: `A.rows > A.columns`이고 pivot column 수가 unknown count와 같으며
 *   inconsistent row가 없는 경우. `solution`과 `residual = ||A * x - b||₂`를 함께 반환한다.
 * - `underdetermined`: inconsistent row가 없고 pivot column 수가 unknown count보다 작은 경우.
 *   free variable parameterization을 만들지 않고 RREF의 deep copy와 `pivotColumns`만 반환한다.
 *   `pivotColumns`는 ascending 정렬된 coefficient column index다.
 * - `inconsistent`: coefficient가 모두 zero인데 RHS abs가 `epsilon`보다 큰 row가 존재해 해가 없는
 *   경우. RREF의 deep copy를 반환한다.
 *
 * 모든 분기에서 `solution`과 `rref`에는 `-0`이 남지 않는다.
 */
export type LinearSolveResult =
  | { readonly type: 'unique'; readonly solution: number[] }
  | { readonly type: 'overdetermined'; readonly solution: number[]; readonly residual: number }
  | { readonly type: 'underdetermined'; readonly rref: number[][]; readonly pivotColumns: number[] }
  | { readonly type: 'inconsistent'; readonly rref: number[][] };
