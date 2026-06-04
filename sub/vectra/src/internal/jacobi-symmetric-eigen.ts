/** raw symmetric Jacobi eigen helper option. caller가 matrix 검증과 결과 cleanup 정책을 소유한다. */
export interface JacobiSymmetricEigenRawOptions {
  readonly maxIterations: number;
  readonly tolerance: number;
  readonly errorPrefix: string;
}

/** raw symmetric Jacobi eigen 결과. zero cleanup과 sign convention은 caller가 적용한다. */
export interface JacobiSymmetricEigenRawResult {
  /** Jacobi 종료 시점의 diagonal entry. */
  readonly values: number[];

  /** column matrix 형태의 eigenvector. `vectors[row][i]`가 `values[i]`에 대응한다. */
  readonly vectors: number[][];
}

/**
 * symmetric finite square matrix에 cyclic Jacobi rotation을 적용해 raw eigenvalue/eigenvector를 계산한다.
 *
 * caller는 `matrix`가 rectangular, square, finite, symmetric이고 `n >= 1`임을 보장한다. 입력 matrix는
 * mutate하지 않는다. 수렴 실패는 `undefined`를 반환한다.
 *
 * @param matrix symmetric finite square matrix
 * @param n matrix 크기
 * @param options 검증된 Jacobi 반복 옵션과 error message prefix
 */
export function jacobiSymmetricEigenRaw(
  matrix: readonly (readonly number[])[],
  n: number,
  options: JacobiSymmetricEigenRawOptions
): JacobiSymmetricEigenRawResult | undefined {
  const { maxIterations, tolerance, errorPrefix } = options;

  const working = copySquareMatrix(matrix, n);
  const vectors = identityMatrix(n);

  for (let iter = 0; iter < maxIterations; iter++) {
    const pivot = findMaxOffDiagonal(working, n);
    if (pivot.maxAbs <= tolerance) {
      return { values: extractDiagonal(working, n), vectors };
    }

    const rotation = computeJacobiRotation(working, pivot.p, pivot.q, errorPrefix);
    applyRotationToWorking(working, n, pivot.p, pivot.q, rotation, errorPrefix);
    applyRotationToVectors(vectors, n, pivot.p, pivot.q, rotation, errorPrefix);
  }

  return undefined;
}

function copySquareMatrix(matrix: readonly (readonly number[])[], n: number): number[][] {
  const working: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const src = matrix[r];
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = src[c];
    }
    working[r] = row;
  }
  return working;
}

function identityMatrix(n: number): number[][] {
  const vectors: number[][] = new Array(n);
  for (let r = 0; r < n; r++) {
    const row = new Array<number>(n);
    for (let c = 0; c < n; c++) {
      row[c] = r === c ? 1 : 0;
    }
    vectors[r] = row;
  }
  return vectors;
}

interface OffDiagonalPivot {
  readonly p: number;
  readonly q: number;
  readonly maxAbs: number;
}

function findMaxOffDiagonal(working: readonly (readonly number[])[], n: number): OffDiagonalPivot {
  let p = 0;
  let q = 1;
  let maxAbs = 0;
  for (let i = 0; i < n - 1; i++) {
    const rowI = working[i];
    for (let j = i + 1; j < n; j++) {
      const abs = Math.abs(rowI[j]);
      if (abs > maxAbs) {
        maxAbs = abs;
        p = i;
        q = j;
      }
    }
  }
  return { p, q, maxAbs };
}

interface JacobiRotation {
  readonly c: number;
  readonly s: number;
}

function computeJacobiRotation(
  working: readonly (readonly number[])[],
  p: number,
  q: number,
  errorPrefix: string
): JacobiRotation {
  const app = working[p][p];
  const aqq = working[q][q];
  const apq = working[p][q];

  const theta = (aqq - app) / (2 * apq);
  if (!Number.isFinite(theta)) {
    throw new RangeError(`${errorPrefix} produced non-finite theta at (${p}, ${q}), got ${String(theta)}`);
  }
  const denomMag = Math.abs(theta) + Math.hypot(theta, 1);
  if (!Number.isFinite(denomMag) || denomMag === 0) {
    throw new RangeError(`${errorPrefix} produced non-finite denominator at (${p}, ${q}), got ${String(denomMag)}`);
  }
  const t = theta >= 0 ? 1 / denomMag : -1 / denomMag;
  const c = 1 / Math.hypot(t, 1);
  const s = t * c;
  if (!Number.isFinite(c) || !Number.isFinite(s)) {
    throw new RangeError(`${errorPrefix} produced non-finite (c, s) at (${p}, ${q}), got (${String(c)}, ${String(s)})`);
  }
  return { c, s };
}

function applyRotationToWorking(
  working: number[][],
  n: number,
  p: number,
  q: number,
  rotation: JacobiRotation,
  errorPrefix: string
): void {
  const { c, s } = rotation;
  const app = working[p][p];
  const aqq = working[q][q];
  const apq = working[p][q];

  const newApp = c * c * app - 2 * s * c * apq + s * s * aqq;
  const newAqq = s * s * app + 2 * s * c * apq + c * c * aqq;
  if (!Number.isFinite(newApp) || !Number.isFinite(newAqq)) {
    throw new RangeError(
      `${errorPrefix} produced non-finite diagonal at (${p}, ${q}), got (${String(newApp)}, ${String(newAqq)})`
    );
  }
  working[p][p] = newApp;
  working[q][q] = newAqq;
  working[p][q] = 0;
  working[q][p] = 0;

  // 양방향 값을 같은 값으로 강제 대입해 rotation 이후에도 symmetry를 보존한다.
  for (let i = 0; i < n; i++) {
    if (i === p || i === q) continue;
    const aip = working[i][p];
    const aiq = working[i][q];
    const newAip = c * aip - s * aiq;
    const newAiq = s * aip + c * aiq;
    if (!Number.isFinite(newAip) || !Number.isFinite(newAiq)) {
      throw new RangeError(
        `${errorPrefix} produced non-finite off-diagonal at (${i}, ${p}/${q}), got (${String(newAip)}, ${String(newAiq)})`
      );
    }
    working[i][p] = newAip;
    working[p][i] = newAip;
    working[i][q] = newAiq;
    working[q][i] = newAiq;
  }
}

function applyRotationToVectors(
  vectors: number[][],
  n: number,
  p: number,
  q: number,
  rotation: JacobiRotation,
  errorPrefix: string
): void {
  const { c, s } = rotation;
  for (let r = 0; r < n; r++) {
    const vRow = vectors[r];
    const vrp = vRow[p];
    const vrq = vRow[q];
    const newVrp = c * vrp - s * vrq;
    const newVrq = s * vrp + c * vrq;
    if (!Number.isFinite(newVrp) || !Number.isFinite(newVrq)) {
      throw new RangeError(
        `${errorPrefix} produced non-finite eigenvector entry at (${r}, ${p}/${q}), got (${String(newVrp)}, ${String(newVrq)})`
      );
    }
    vRow[p] = newVrp;
    vRow[q] = newVrq;
  }
}

function extractDiagonal(working: readonly (readonly number[])[], n: number): number[] {
  const values = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    values[i] = working[i][i];
  }
  return values;
}
