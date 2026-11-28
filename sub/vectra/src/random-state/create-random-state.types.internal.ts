import type { RandomSeed } from '../random/create-rng';
import type { RandomSource } from '../random/random';
import type { HaltonSequenceOptions, SobolSequenceOptions } from '../random/types';
import type { WeightedProbabilitySample } from '../random/weighted-probability';
import type { PathCommand } from '../types';
import type {
  Bounds,
  Circle,
  Ellipse,
  PointWritable,
  Polygon,
  Polyline,
  Rect,
  Segment,
  Triangle,
} from '../types/flat-shapes.internal';

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

  directionInto<Out extends PointWritable>(out: Out, length?: number, rng?: RandomSource): Out;
  direction(length?: number, rng?: RandomSource): PointWritable;
  pointOnSegmentInto<Out extends PointWritable>(out: Out, segment: Segment, rng?: RandomSource): Out;
  pointOnSegment(segment: Segment, rng?: RandomSource): PointWritable;
  pointInRectInto(out: PointWritable, rect: Rect, rng?: RandomSource): boolean;
  pointInRect(rect: Rect, rng?: RandomSource): PointWritable | undefined;
  pointInRectOutsideInto(out: PointWritable, outer: Rect, inner: Rect, rng?: RandomSource): boolean;
  pointInRectOutside(outer: Rect, inner: Rect, rng?: RandomSource): PointWritable | undefined;
  pointInBoundsInto(out: PointWritable, bounds: Bounds, rng?: RandomSource): boolean;
  pointInBounds(bounds: Bounds, rng?: RandomSource): PointWritable | undefined;
  pointInCircleInto(out: PointWritable, circle: Circle, rng?: RandomSource): boolean;
  pointInCircle(circle: Circle, rng?: RandomSource): PointWritable | undefined;
  pointOnCircleInto(out: PointWritable, circle: Circle, rng?: RandomSource): boolean;
  pointOnCircle(circle: Circle, rng?: RandomSource): PointWritable | undefined;
  pointInTriangleInto<Out extends PointWritable>(out: Out, triangle: Triangle, rng?: RandomSource): Out;
  pointInTriangle(triangle: Triangle, rng?: RandomSource): PointWritable;
  pointInEllipseInto(out: PointWritable, ellipse: Ellipse, rng?: RandomSource): boolean;
  pointInEllipse(ellipse: Ellipse, rng?: RandomSource): PointWritable | undefined;
  pointInPolygonInto(out: PointWritable, polygon: Polygon, rng?: RandomSource): boolean;
  pointInPolygon(polygon: Polygon, rng?: RandomSource): PointWritable | undefined;
  pointOnPolylineInto(out: PointWritable, polyline: Polyline, rng?: RandomSource): boolean;
  pointOnPolyline(polyline: Polyline, rng?: RandomSource): PointWritable | undefined;
  pointOnPathInto(out: PointWritable, commands: readonly PathCommand[], rng?: RandomSource): boolean;
  pointOnPath(commands: readonly PathCommand[], rng?: RandomSource): PointWritable | undefined;
  weightedPointOnPolylineInto(
    out: PointWritable,
    polyline: Polyline,
    weights: readonly number[],
    rng?: RandomSource
  ): boolean;
  weightedPointOnPolyline(
    polyline: Polyline,
    weights: readonly number[],
    rng?: RandomSource
  ): PointWritable | undefined;
  weightedPointOnPathInto(
    out: PointWritable,
    commands: readonly PathCommand[],
    weights: readonly number[],
    rng?: RandomSource
  ): boolean;
  weightedPointOnPath(
    commands: readonly PathCommand[],
    weights: readonly number[],
    rng?: RandomSource
  ): PointWritable | undefined;
  haltonSequence(count: number, dimension: number, options?: HaltonSequenceOptions): number[][];
  haltonSequenceInto(out: number[][], count: number, dimension: number, options?: HaltonSequenceOptions): number[][];
  sobolSequence(count: number, dimension: number, options?: SobolSequenceOptions): number[][];
  sobolSequenceInto(out: number[][], count: number, dimension: number, options?: SobolSequenceOptions): number[][];

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
  rangePermutationInto(out: number[], length: number, rng?: RandomSource): number[];
  rangePermutation(length: number, rng?: RandomSource): number[];
  uniqueIndicesInto(out: number[], count: number, max: number, rng?: RandomSource): number[];
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

  dirichletInto(out: number[], alpha: readonly number[], rng?: RandomSource): number[];
  dirichlet(alpha: readonly number[], rng?: RandomSource): number[];
  multivariateNormalInto(
    out: number[],
    mean: readonly number[],
    covariance: readonly (readonly number[])[],
    rng?: RandomSource
  ): number[];
  multivariateNormal(mean: readonly number[], covariance: readonly (readonly number[])[], rng?: RandomSource): number[];
}
