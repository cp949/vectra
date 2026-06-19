/**
 * matrix covariance/correlation helper의 re-export 배럴.
 *
 * 입력 검증(`matrix-validate.internal`), variable materialize + centered 통계
 * (`matrix-stats.internal`), buffer 할당 + commit(`matrix-commit.internal`)로 분할된 helper를
 * 한 진입점으로 모은다. 소비처(`covarianceMatrixInto`, `correlationMatrixInto`, pca/multivariate
 * core, `least-squares-core.internal` 등)의 import 경로 `./matrix.internal`을 보존한다.
 */

export {
  allocateSquareMatrixBuffer,
  commitRectangularMatrixInto,
  commitSymmetricMatrixInto,
} from './matrix-commit.internal';
export {
  computeCenteredDeltas,
  computeCenteredProductSum,
  computeVariableMean,
  materializeVariables,
} from './matrix-stats.internal';
export { assertOrientation, assertRectangularMatrix } from './matrix-validate.internal';
