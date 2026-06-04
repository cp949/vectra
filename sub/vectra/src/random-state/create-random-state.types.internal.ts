import type { RandomSeed } from '../random/create-rng';
import type { RandomSource } from '../random/random';
import type { HaltonSequenceOptions, SobolSequenceOptions } from '../random/types';
import type { WeightedProbabilitySample } from '../random/weighted-probability';
import type {
  BoundsLike,
  CircleLike,
  EllipseLike,
  PathCommand,
  PolygonLike,
  PolylineLike,
  RectLike,
  SegmentLike,
  XYInput,
  XYWritable,
} from '../types';

/**
 * `random` domain 함수를 thin wrapper로 묶은 stateful facade.
 *
 * 각 method는 동명 `random` 함수와 같은 인자 순서를 유지하며 마지막 `rng?` override를 받는다.
 * `rng`를 제공하면 instance 내부 RNG를 소비하지 않고 override만 사용한다.
 * `rng`를 생략하면 instance 내부 RNG(seeded 인 경우) 또는 기존 helper default entropy source를
 * 사용한다.
 */
export interface RandomState {
  createRng(seed: RandomSeed): RandomSource;
  random(rng?: RandomSource): number;
  randomUint32(): number;
  secureRandomSource(): RandomSource;
  float(min: number, max: number, rng?: RandomSource): number;
  int(min: number, max: number, rng?: RandomSource): number;
  sign(rng?: RandomSource): -1 | 1;
  angle(rng?: RandomSource): number;

  directionInto<Out extends XYWritable>(out: Out, length?: number, rng?: RandomSource): Out;
  direction(length?: number, rng?: RandomSource): { x: number; y: number };
  pointOnSegmentInto<Out extends XYWritable>(out: Out, segment: SegmentLike, rng?: RandomSource): Out;
  pointOnSegment(segment: SegmentLike, rng?: RandomSource): { x: number; y: number };
  pointInRectInto<Out extends XYWritable>(out: Out, rect: RectLike, rng?: RandomSource): boolean;
  pointInRect(rect: RectLike, rng?: RandomSource): { x: number; y: number } | undefined;
  pointInRectOutsideInto<Out extends XYWritable>(
    out: Out,
    outer: RectLike,
    inner: RectLike,
    rng?: RandomSource
  ): boolean;
  pointInRectOutside(outer: RectLike, inner: RectLike, rng?: RandomSource): { x: number; y: number } | undefined;
  pointInBoundsInto<Out extends XYWritable>(out: Out, bounds: BoundsLike, rng?: RandomSource): boolean;
  pointInBounds(bounds: BoundsLike, rng?: RandomSource): { x: number; y: number } | undefined;
  pointInCircleInto<Out extends XYWritable>(out: Out, circle: CircleLike, rng?: RandomSource): boolean;
  pointInCircle(circle: CircleLike, rng?: RandomSource): { x: number; y: number } | undefined;
  pointOnCircleInto<Out extends XYWritable>(out: Out, circle: CircleLike, rng?: RandomSource): boolean;
  pointOnCircle(circle: CircleLike, rng?: RandomSource): { x: number; y: number } | undefined;
  pointInTriangleInto<Out extends XYWritable>(out: Out, a: XYInput, b: XYInput, c: XYInput, rng?: RandomSource): Out;
  pointInTriangle(a: XYInput, b: XYInput, c: XYInput, rng?: RandomSource): { x: number; y: number };
  pointInEllipseInto<Out extends XYWritable>(out: Out, ellipse: EllipseLike, rng?: RandomSource): boolean;
  pointInEllipse(ellipse: EllipseLike, rng?: RandomSource): { x: number; y: number } | undefined;
  pointInPolygonInto<Out extends XYWritable>(out: Out, polygon: PolygonLike, rng?: RandomSource): boolean;
  pointInPolygon(polygon: PolygonLike, rng?: RandomSource): { x: number; y: number } | undefined;
  pointOnPolylineInto<Out extends XYWritable>(out: Out, polyline: PolylineLike, rng?: RandomSource): boolean;
  pointOnPolyline(polyline: PolylineLike, rng?: RandomSource): { x: number; y: number } | undefined;
  pointOnPathInto<Out extends XYWritable>(out: Out, commands: readonly PathCommand[], rng?: RandomSource): boolean;
  pointOnPath(commands: readonly PathCommand[], rng?: RandomSource): { x: number; y: number } | undefined;
  weightedPointOnPolylineInto<Out extends XYWritable>(
    out: Out,
    polyline: PolylineLike,
    weights: readonly number[],
    rng?: RandomSource
  ): boolean;
  weightedPointOnPolyline(
    polyline: PolylineLike,
    weights: readonly number[],
    rng?: RandomSource
  ): { x: number; y: number } | undefined;
  weightedPointOnPathInto<Out extends XYWritable>(
    out: Out,
    commands: readonly PathCommand[],
    weights: readonly number[],
    rng?: RandomSource
  ): boolean;
  weightedPointOnPath(
    commands: readonly PathCommand[],
    weights: readonly number[],
    rng?: RandomSource
  ): { x: number; y: number } | undefined;
  haltonSequence(count: number, dimension: number, options?: HaltonSequenceOptions): number[][];
  haltonSequenceInto<Out extends number[][]>(
    out: Out,
    count: number,
    dimension: number,
    options?: HaltonSequenceOptions
  ): Out;
  sobolSequence(count: number, dimension: number, options?: SobolSequenceOptions): number[][];
  sobolSequenceInto<Out extends number[][]>(
    out: Out,
    count: number,
    dimension: number,
    options?: SobolSequenceOptions
  ): Out;

  choice<T>(items: readonly T[], rng?: RandomSource): T | undefined;
  weightedChoice<T>(items: readonly T[], weights: readonly number[], rng?: RandomSource): T | undefined;
  weightedRandomIndex(weights: readonly number[], rng?: RandomSource): number;
  weightedProbability(weight: (param: number) => number, rng?: RandomSource): WeightedProbabilitySample;
  shuffleInPlace<T>(items: T[], rng?: RandomSource): T[];
  shuffleInto<T, Out extends T[]>(out: Out, items: readonly T[], rng?: RandomSource): Out;
  shuffle<T>(items: readonly T[], rng?: RandomSource): T[];
  randomIndex(length: number, rng?: RandomSource): number | undefined;
  sample<T>(items: readonly T[], count: number, rng?: RandomSource): T[];
  sampleInto<T, Out extends T[]>(out: Out, items: readonly T[], count: number, rng?: RandomSource): Out;
  rangePermutationInto<Out extends number[]>(out: Out, length: number, rng?: RandomSource): Out;
  rangePermutation(length: number, rng?: RandomSource): number[];
  uniqueIndicesInto<Out extends number[]>(out: Out, count: number, max: number, rng?: RandomSource): Out;
  uniqueIndices(count: number, max: number, rng?: RandomSource): number[];
  pickUniqueInto<T, Out extends T[]>(out: Out, items: readonly T[], count: number, rng?: RandomSource): Out;
  pickUnique<T>(items: readonly T[], count: number, rng?: RandomSource): T[];
  permutation(length: number, rng?: RandomSource): number[];
  permutation<T>(items: readonly T[], rng?: RandomSource): T[];
  weightedShuffle<T>(items: readonly T[], weights: readonly number[], rng?: RandomSource): T[];

  uniform(min: number, max: number, rng?: RandomSource): number;
  bernoulli(p: number, rng?: RandomSource): boolean;
  standardNormal(rng?: RandomSource): number;
  normal(mean: number, stddev: number, rng?: RandomSource): number;
  exponential(scale: number, rng?: RandomSource): number;
  triangular(left: number, mode: number, right: number, rng?: RandomSource): number;
  poisson(lambda: number, rng?: RandomSource): number;
  binomial(trials: number, p: number, rng?: RandomSource): number;
  geometric(p: number, rng?: RandomSource): number;
  logNormal(mean: number, sigma: number, rng?: RandomSource): number;
  gamma(shape: number, scale?: number, rng?: RandomSource): number;
  beta(alpha: number, betaShape: number, rng?: RandomSource): number;

  dirichletInto<Out extends number[]>(out: Out, alpha: readonly number[], rng?: RandomSource): Out;
  dirichlet(alpha: readonly number[], rng?: RandomSource): number[];
  multivariateNormalInto<Out extends number[]>(
    out: Out,
    mean: readonly number[],
    covariance: readonly (readonly number[])[],
    rng?: RandomSource
  ): Out;
  multivariateNormal(mean: readonly number[], covariance: readonly (readonly number[])[], rng?: RandomSource): number[];
}
