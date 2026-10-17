export {
  DEFAULT_ITERATION_EPSILON,
  DEFAULT_ITERATION_MAX,
  DEFAULT_ITERATION_TOLERANCE,
  type ResolvedIterationOptions,
  resolveIterationOptions,
} from '../internal/iteration-options';
export {
  applyColumnSignConvention,
  isSymmetricFiniteMatrix,
  type JacobiEigenResult,
  jacobiSymmetricEigen,
  twoByTwoRealEigenvalues,
} from './jacobi-eigen-core.internal';
