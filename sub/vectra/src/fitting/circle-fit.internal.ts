/**
 * fitting domain이 쓰는 algebraic least-squares circle fit core helper.
 *
 * `linalg` public leaf를 import하지 않고 domain-local 3x3 Gauss-Jordan solver로 normal equation을
 * 푼다. `fitCircleToPoints*`가 공유한다.
 */

/** `fitCircleAlgebraic`의 결과. center 좌표와 radius를 담는다. */
export interface CircleFit {
  /** circle center x. `-0`은 `0`으로 canonicalize. */
  readonly centerX: number;

  /** circle center y. `-0`은 `0`으로 canonicalize. */
  readonly centerY: number;

  /** circle radius. strict positive finite. */
  readonly radius: number;
}

/**
 * partial pivoting을 쓰는 3x3 Gauss-Jordan solver. `m * x = b`를 풀어 `x`를 반환한다.
 *
 * 어떤 단계의 pivot 절대값이 `epsilon` 이하이면 singular로 보고 `undefined`. elimination/division 중
 * non-finite가 생겨도 `undefined`. `m`/`b`는 helper 내부에서 복사해 caller 배열을 mutate하지 않는다.
 *
 * @param m row-major 3x3 coefficient matrix
 * @param b length 3 우변 vector
 * @param epsilon singular pivot 판정 tolerance
 */
function solve3x3(
  m: readonly (readonly number[])[],
  b: readonly number[],
  epsilon: number
): [number, number, number] | undefined {
  const a = [
    [m[0][0], m[0][1], m[0][2], b[0]],
    [m[1][0], m[1][1], m[1][2], b[1]],
    [m[2][0], m[2][1], m[2][2], b[2]],
  ];

  for (let col = 0; col < 3; col++) {
    let pivot = col;
    for (let r = col + 1; r < 3; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) {
        pivot = r;
      }
    }
    if (Math.abs(a[pivot][col]) <= epsilon) {
      return undefined;
    }
    if (pivot !== col) {
      const tmp = a[pivot];
      a[pivot] = a[col];
      a[col] = tmp;
    }
    const pivotValue = a[col][col];
    for (let r = 0; r < 3; r++) {
      if (r === col) {
        continue;
      }
      const factor = a[r][col] / pivotValue;
      for (let c = col; c < 4; c++) {
        const updated = a[r][c] - factor * a[col][c];
        if (!Number.isFinite(updated)) {
          return undefined;
        }
        a[r][c] = updated;
      }
    }
  }

  const x0 = a[0][3] / a[0][0];
  const x1 = a[1][3] / a[1][1];
  const x2 = a[2][3] / a[2][2];
  if (!Number.isFinite(x0) || !Number.isFinite(x1) || !Number.isFinite(x2)) {
    return undefined;
  }
  return [x0, x1, x2];
}

/**
 * finite point collection에 algebraic least-squares circle fit을 수행한다.
 *
 * 방정식 `x^2 + y^2 + d*x + e*y + f = 0`의 normal equation `(A^T A) [d, e, f] = A^T b`를 3x3 solver로
 * 푼다. point를 centroid 기준으로 평행이동한 좌표에서 local center `(-d/2, -e/2)`와 radius
 * `sqrt(localCenter.x^2 + localCenter.y^2 - f)`를 계산한 뒤 center를 원래 frame으로 되돌린다. 큰
 * 좌표에서 normal matrix가 catastrophic cancellation으로 거짓 singular가 되는 것을 막는다.
 *
 * normal matrix가 singular(collinear, rank-deficient, duplicate-heavy)하거나, radius squared가
 * `epsilon` 이하이거나, 결과가 non-finite이면 `undefined`. caller가 point 수 `>= 3`과 finite 좌표를
 * 보장한다.
 *
 * @param xs materialize된 finite x 좌표. length `>= 3`
 * @param ys materialize된 finite y 좌표. length `>= 3`
 * @param epsilon singular/degenerate radius 판정 tolerance
 */
export function fitCircleAlgebraic(
  xs: readonly number[],
  ys: readonly number[],
  epsilon: number
): CircleFit | undefined {
  const n = xs.length;

  // centroid로 평행이동해 normal equation의 cancellation을 줄인다. center는 마지막에 되돌린다.
  let meanX = 0;
  let meanY = 0;
  for (let i = 0; i < n; i++) {
    meanX += xs[i];
    meanY += ys[i];
  }
  meanX /= n;
  meanY /= n;

  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  let sz = 0;
  let sxz = 0;
  let syz = 0;
  for (let i = 0; i < n; i++) {
    const x = xs[i] - meanX;
    const y = ys[i] - meanY;
    const z = x * x + y * y;
    sx += x;
    sy += y;
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
    sz += z;
    sxz += x * z;
    syz += y * z;
  }

  // eq: d*x + e*y + f = -z. normal equation 우변은 -A^T z. (centered frame)
  const matrix = [
    [sxx, sxy, sx],
    [sxy, syy, sy],
    [sx, sy, n],
  ];
  const rhs = [-sxz, -syz, -sz];

  const solution = solve3x3(matrix, rhs, epsilon);
  if (solution === undefined) {
    return undefined;
  }

  const [d, e, f] = solution;
  // centered frame center. radius는 frame 이동에 불변이다.
  const localCenterX = -d / 2;
  const localCenterY = -e / 2;
  const radiusSquared = localCenterX * localCenterX + localCenterY * localCenterY - f;
  if (!Number.isFinite(radiusSquared) || radiusSquared <= epsilon) {
    return undefined;
  }
  const radius = Math.sqrt(radiusSquared);
  if (!Number.isFinite(radius) || radius === 0) {
    return undefined;
  }

  // center를 원래 frame으로 되돌린다.
  const centerX = localCenterX + meanX;
  const centerY = localCenterY + meanY;
  if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) {
    return undefined;
  }

  return {
    centerX: centerX === 0 ? 0 : centerX,
    centerY: centerY === 0 ? 0 : centerY,
    radius,
  };
}
