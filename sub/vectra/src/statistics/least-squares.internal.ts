/**
 * least-squares solver helper의 re-export 배럴.
 *
 * 옵션/finite 검증(`least-squares-validate.internal`)과 QR-based core solver
 * (`least-squares-core.internal`)로 분할된 helper를 한 진입점으로 모은다. 소비처
 * (`solveOverdeterminedSystem`, `calculateLinearLeastSquares` 등)의 import 경로
 * `./least-squares.internal`을 보존한다.
 */

export { solveLeastSquares } from './least-squares-core.internal';
export { DEFAULT_LEAST_SQUARES_EPSILON, resolveLeastSquaresEpsilon } from './least-squares-validate.internal';
