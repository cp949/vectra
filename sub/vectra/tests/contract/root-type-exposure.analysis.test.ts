/**
 * Root entry calculus/random/statistics/motion/noise type export 계약 테스트.
 */

import { describe, test } from 'vitest';
import type {
  BincountOptions,
  CovarianceMatrixOptions,
  DerivativeOptions,
  DigitizeOptions,
  DimensionReductionOptions,
  Fbm2Options,
  HaltonSequenceOptions,
  HistogramOptions,
  HistogramResult,
  LeastSquaresOptions,
  LeastSquaresResult,
  LinspaceOptions,
  MahalanobisOptions,
  MoveTowardResult,
  MultivariateDerivativeOptions,
  Noise2,
  Noise2Options,
  NormalizeMinMaxOptions,
  PCAOptions,
  PCAResult,
  SobolSequenceOptions,
  StandardizeOptions,
  VarianceOptions,
  WhiteningOptions,
} from '../../src/index';
import type { MoveTowardResult as MotionMoveTowardResult } from '../../src/motion';
import type {
  Fbm2Options as NoiseFbm2Options,
  Noise2 as NoiseNoise2,
  Noise2Options as NoiseNoise2Options,
} from '../../src/noise';

function expectAssignable<T>(value: T): T {
  return value;
}

describe('root analysis type exposure 계약', () => {
  test('root entry가 calculus option type을 노출한다', () => {
    expectAssignable<LinspaceOptions>({});
    expectAssignable<LinspaceOptions>({ endpoint: false });
    expectAssignable<DerivativeOptions>({});
    expectAssignable<DerivativeOptions>({ method: 'forward' });
    expectAssignable<DerivativeOptions>({ method: 'backward' });
    expectAssignable<DerivativeOptions>({ method: 'central' });
    expectAssignable<MultivariateDerivativeOptions>({});
    expectAssignable<MultivariateDerivativeOptions>({ method: 'central' });
    expectAssignable<MultivariateDerivativeOptions>({ method: 'forward' });
    expectAssignable<MultivariateDerivativeOptions>({ method: 'backward' });
    expectAssignable<MultivariateDerivativeOptions>({ step: 1e-4 });
    expectAssignable<MultivariateDerivativeOptions>({ step: [1e-4, 1e-5] as const });
  });

  test('root entry가 motion result type을 노출한다', () => {
    expectAssignable<MoveTowardResult>({ value: 6, reached: false });
    expectAssignable<MoveTowardResult>({ value: 10, reached: true });
  });

  test('motion domain entry가 result type을 노출한다', () => {
    expectAssignable<MotionMoveTowardResult>({ value: 6, reached: false });
    expectAssignable<MotionMoveTowardResult>({ value: 10, reached: true });
  });

  test('root entry가 noise field/option type을 노출한다', () => {
    const sample: Noise2 = (x, y) => x + y;
    expectAssignable<Noise2>(sample);
    expectAssignable<Noise2Options>({});
    expectAssignable<Noise2Options>({ seed: 42 });
    expectAssignable<Noise2Options>({ seed: 'vectra' });
    expectAssignable<Fbm2Options>({});
    expectAssignable<Fbm2Options>({ seed: 1, octaves: 4, lacunarity: 2, gain: 0.5 });
  });

  test('noise domain entry가 field/option type을 노출한다', () => {
    const sample: NoiseNoise2 = (x, y) => x - y;
    expectAssignable<NoiseNoise2>(sample);
    expectAssignable<NoiseNoise2Options>({ seed: 7 });
    expectAssignable<NoiseFbm2Options>({ octaves: 2 });
  });

  test('root entry가 random low-discrepancy option type을 노출한다', () => {
    expectAssignable<HaltonSequenceOptions>({});
    expectAssignable<HaltonSequenceOptions>({ startIndex: 1, bases: [2, 3, 5] as const });
    expectAssignable<SobolSequenceOptions>({});
    expectAssignable<SobolSequenceOptions>({ startIndex: 1 });
  });

  test('root entry가 statistics scalar option type을 노출한다', () => {
    expectAssignable<VarianceOptions>({});
    expectAssignable<VarianceOptions>({ mode: 'population' });
    expectAssignable<VarianceOptions>({ mode: 'sample' });
    expectAssignable<StandardizeOptions>({});
    expectAssignable<StandardizeOptions>({ mode: 'sample' });
    expectAssignable<NormalizeMinMaxOptions>({});
    expectAssignable<NormalizeMinMaxOptions>({ range: [-1, 1] as const });
    expectAssignable<MahalanobisOptions>({});
    expectAssignable<MahalanobisOptions>({ epsilon: 1e-9 });
    expectAssignable<WhiteningOptions>({});
    expectAssignable<WhiteningOptions>({
      orientation: 'rows',
      mode: 'sample',
      epsilon: 1e-12,
    });
  });

  test('root entry가 statistics linear algebra result/option type을 노출한다', () => {
    expectAssignable<LeastSquaresOptions>({});
    expectAssignable<LeastSquaresOptions>({ epsilon: 1e-9 });
    expectAssignable<LeastSquaresResult>({
      coefficients: [1, 2],
      residual: 0,
      rank: 2,
    });
    expectAssignable<CovarianceMatrixOptions>({});
    expectAssignable<CovarianceMatrixOptions>({ orientation: 'columns' });
    expectAssignable<CovarianceMatrixOptions>({ orientation: 'rows' });
    expectAssignable<CovarianceMatrixOptions>({ mode: 'sample', orientation: 'rows' });
    expectAssignable<PCAOptions>({});
    expectAssignable<PCAOptions>({ useCorrelation: true });
    expectAssignable<PCAResult>({
      components: [
        [1, 0],
        [0, 1],
      ],
      explainedVariance: [2, 1],
      explainedVarianceRatio: [2 / 3, 1 / 3],
      means: [0, 0],
      rank: 2,
    });
    expectAssignable<DimensionReductionOptions>({ dimensions: 1 });
  });

  test('root entry가 statistics histogram/counting type을 노출한다', () => {
    expectAssignable<HistogramOptions>({});
    expectAssignable<HistogramOptions>({ bins: 5 });
    expectAssignable<HistogramOptions>({ bins: [0, 1, 2, 3] as const });
    expectAssignable<HistogramOptions>({ range: [0, 10] as const });
    expectAssignable<HistogramResult>({ counts: [1, 2, 3], binEdges: [0, 1, 2, 3] });
    expectAssignable<DigitizeOptions>({});
    expectAssignable<BincountOptions>({});
    expectAssignable<BincountOptions>({ minLength: 5 });
  });
});
