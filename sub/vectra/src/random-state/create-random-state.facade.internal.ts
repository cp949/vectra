import { angle } from '../random/angle';
import { bernoulli } from '../random/bernoulli';
import { beta } from '../random/beta';
import { binomial } from '../random/binomial';
import { choice } from '../random/choice';
import { createRng } from '../random/create-rng';
import { direction } from '../random/direction';
import { directionInto } from '../random/direction-into';
import { dirichlet } from '../random/dirichlet';
import { dirichletInto } from '../random/dirichlet-into';
import { exponential } from '../random/exponential';
import { float } from '../random/float';
import { gamma } from '../random/gamma';
import { geometric } from '../random/geometric';
import { haltonSequence } from '../random/halton-sequence';
import { haltonSequenceInto } from '../random/halton-sequence-into';
import { int } from '../random/int';
import { logNormal } from '../random/log-normal';
import { multivariateNormal } from '../random/multivariate-normal';
import { multivariateNormalInto } from '../random/multivariate-normal-into';
import { normal } from '../random/normal';
import { permutation } from '../random/permutation';
import { pickUnique } from '../random/pick-unique';
import { pickUniqueInto } from '../random/pick-unique-into';
import { pointInBounds } from '../random/point-in-bounds';
import { pointInBoundsInto } from '../random/point-in-bounds-into';
import { pointInCircle } from '../random/point-in-circle';
import { pointInCircleInto } from '../random/point-in-circle-into';
import { pointInEllipse } from '../random/point-in-ellipse';
import { pointInEllipseInto } from '../random/point-in-ellipse-into';
import { pointInPolygon } from '../random/point-in-polygon';
import { pointInPolygonInto } from '../random/point-in-polygon-into';
import { pointInRect } from '../random/point-in-rect';
import { pointInRectInto } from '../random/point-in-rect-into';
import { pointInRectOutside } from '../random/point-in-rect-outside';
import { pointInRectOutsideInto } from '../random/point-in-rect-outside-into';
import { pointInTriangle } from '../random/point-in-triangle';
import { pointInTriangleInto } from '../random/point-in-triangle-into';
import { pointOnCircle } from '../random/point-on-circle';
import { pointOnCircleInto } from '../random/point-on-circle-into';
import { pointOnPath } from '../random/point-on-path';
import { pointOnPathInto } from '../random/point-on-path-into';
import { pointOnPolyline } from '../random/point-on-polyline';
import { pointOnPolylineInto } from '../random/point-on-polyline-into';
import { pointOnSegment } from '../random/point-on-segment';
import { pointOnSegmentInto } from '../random/point-on-segment-into';
import { poisson } from '../random/poisson';
import { type RandomSource, random } from '../random/random';
import { randomIndex } from '../random/random-index';
import { randomUint32 } from '../random/random-uint32';
import { rangePermutation } from '../random/range-permutation';
import { rangePermutationInto } from '../random/range-permutation-into';
import { sample } from '../random/sample';
import { sampleInto } from '../random/sample-into';
import { secureRandomSource } from '../random/secure-random-source';
import { shuffle } from '../random/shuffle';
import { shuffleInPlace } from '../random/shuffle-in-place';
import { shuffleInto } from '../random/shuffle-into';
import { sign } from '../random/sign';
import { sobolSequence } from '../random/sobol-sequence';
import { sobolSequenceInto } from '../random/sobol-sequence-into';
import { standardNormal } from '../random/standard-normal';
import { triangular } from '../random/triangular';
import { uniform } from '../random/uniform';
import { uniqueIndices } from '../random/unique-indices';
import { uniqueIndicesInto } from '../random/unique-indices-into';
import { weightedChoice } from '../random/weighted-choice';
import { weightedPointOnPath } from '../random/weighted-point-on-path';
import { weightedPointOnPathInto } from '../random/weighted-point-on-path-into';
import { weightedPointOnPolyline } from '../random/weighted-point-on-polyline';
import { weightedPointOnPolylineInto } from '../random/weighted-point-on-polyline-into';
import { weightedProbability } from '../random/weighted-probability';
import { weightedRandomIndex } from '../random/weighted-random-index';
import { weightedShuffle } from '../random/weighted-shuffle';
import type { RandomState } from './create-random-state.types.internal';

export type RandomStateRngPicker = (rng?: RandomSource) => RandomSource | undefined;

type PermutationWrapper = {
  (arrayOrLength: number, rng?: RandomSource): number[];
  <T>(arrayOrLength: readonly T[], rng?: RandomSource): T[];
  <T>(arrayOrLength: number | readonly T[], rng?: RandomSource): number[] | T[];
};

const callPermutation = permutation as PermutationWrapper;

function permutationWithRng(arrayOrLength: number, rng?: RandomSource): number[];
function permutationWithRng<T>(arrayOrLength: readonly T[], rng?: RandomSource): T[];
function permutationWithRng<T>(arrayOrLength: number | readonly T[], rng?: RandomSource): number[] | T[];
function permutationWithRng<T>(arrayOrLength: number | readonly T[], rng?: RandomSource): number[] | T[] {
  return callPermutation(arrayOrLength, rng);
}

export const createRandomStateFacade = (pick: RandomStateRngPicker): RandomState => ({
  createRng,
  random: (rng) => random(pick(rng)),
  randomUint32,
  secureRandomSource,
  float: (min, max, rng) => float(min, max, pick(rng)),
  int: (min, max, rng) => int(min, max, pick(rng)),
  sign: (rng) => sign(pick(rng)),
  angle: (rng) => angle(pick(rng)),

  directionInto: (out, length, rng) => directionInto(out, length, pick(rng)),
  direction: (length, rng) => direction(length, pick(rng)),
  pointOnSegmentInto: (out, segment, rng) => pointOnSegmentInto(out, segment, pick(rng)),
  pointOnSegment: (segment, rng) => pointOnSegment(segment, pick(rng)),
  pointInRectInto: (out, rect, rng) => pointInRectInto(out, rect, pick(rng)),
  pointInRect: (rect, rng) => pointInRect(rect, pick(rng)),
  pointInRectOutsideInto: (out, outer, inner, rng) => pointInRectOutsideInto(out, outer, inner, pick(rng)),
  pointInRectOutside: (outer, inner, rng) => pointInRectOutside(outer, inner, pick(rng)),
  pointInBoundsInto: (out, bounds, rng) => pointInBoundsInto(out, bounds, pick(rng)),
  pointInBounds: (bounds, rng) => pointInBounds(bounds, pick(rng)),
  pointInCircleInto: (out, circle, rng) => pointInCircleInto(out, circle, pick(rng)),
  pointInCircle: (circle, rng) => pointInCircle(circle, pick(rng)),
  pointOnCircleInto: (out, circle, rng) => pointOnCircleInto(out, circle, pick(rng)),
  pointOnCircle: (circle, rng) => pointOnCircle(circle, pick(rng)),
  pointInTriangleInto: (out, a, b, c, rng) => pointInTriangleInto(out, a, b, c, pick(rng)),
  pointInTriangle: (a, b, c, rng) => pointInTriangle(a, b, c, pick(rng)),
  pointInEllipseInto: (out, ellipse, rng) => pointInEllipseInto(out, ellipse, pick(rng)),
  pointInEllipse: (ellipse, rng) => pointInEllipse(ellipse, pick(rng)),
  pointInPolygonInto: (out, polygon, rng) => pointInPolygonInto(out, polygon, pick(rng)),
  pointInPolygon: (polygon, rng) => pointInPolygon(polygon, pick(rng)),
  pointOnPolylineInto: (out, polyline, rng) => pointOnPolylineInto(out, polyline, pick(rng)),
  pointOnPolyline: (polyline, rng) => pointOnPolyline(polyline, pick(rng)),
  pointOnPathInto: (out, commands, rng) => pointOnPathInto(out, commands, pick(rng)),
  pointOnPath: (commands, rng) => pointOnPath(commands, pick(rng)),
  weightedPointOnPolylineInto: (out, polyline, weights, rng) =>
    weightedPointOnPolylineInto(out, polyline, weights, pick(rng)),
  weightedPointOnPolyline: (polyline, weights, rng) => weightedPointOnPolyline(polyline, weights, pick(rng)),
  weightedPointOnPathInto: (out, commands, weights, rng) => weightedPointOnPathInto(out, commands, weights, pick(rng)),
  weightedPointOnPath: (commands, weights, rng) => weightedPointOnPath(commands, weights, pick(rng)),
  haltonSequence,
  haltonSequenceInto,
  sobolSequence,
  sobolSequenceInto,

  choice: (items, rng) => choice(items, pick(rng)),
  weightedChoice: (items, weights, rng) => weightedChoice(items, weights, pick(rng)),
  weightedRandomIndex: (weights, rng) => weightedRandomIndex(weights, pick(rng)),
  weightedProbability: (weight, rng) => weightedProbability(weight, pick(rng)),
  shuffleInPlace: (items, rng) => shuffleInPlace(items, pick(rng)),
  shuffleInto: (out, items, rng) => shuffleInto(out, items, pick(rng)),
  shuffle: (items, rng) => shuffle(items, pick(rng)),
  randomIndex: (length, rng) => randomIndex(length, pick(rng)),
  sample: (items, count, rng) => sample(items, count, pick(rng)),
  sampleInto: (out, items, count, rng) => sampleInto(out, items, count, pick(rng)),
  rangePermutationInto: (out, length, rng) => rangePermutationInto(out, length, pick(rng)),
  rangePermutation: (length, rng) => rangePermutation(length, pick(rng)),
  uniqueIndicesInto: (out, count, max, rng) => uniqueIndicesInto(out, count, max, pick(rng)),
  uniqueIndices: (count, max, rng) => uniqueIndices(count, max, pick(rng)),
  pickUniqueInto: (out, items, count, rng) => pickUniqueInto(out, items, count, pick(rng)),
  pickUnique: (items, count, rng) => pickUnique(items, count, pick(rng)),
  permutation: <T>(arrayOrLength: number | readonly T[], rng?: RandomSource): number[] | T[] =>
    permutationWithRng(arrayOrLength, pick(rng)),
  weightedShuffle: (items, weights, rng) => weightedShuffle(items, weights, pick(rng)),

  uniform: (min, max, rng) => uniform(min, max, pick(rng)),
  bernoulli: (p, rng) => bernoulli(p, pick(rng)),
  standardNormal: (rng) => standardNormal(pick(rng)),
  normal: (mean, stddev, rng) => normal(mean, stddev, pick(rng)),
  exponential: (scale, rng) => exponential(scale, pick(rng)),
  triangular: (left, mode, right, rng) => triangular(left, mode, right, pick(rng)),
  poisson: (lambda, rng) => poisson(lambda, pick(rng)),
  binomial: (trials, p, rng) => binomial(trials, p, pick(rng)),
  geometric: (p, rng) => geometric(p, pick(rng)),
  logNormal: (mean, sigma, rng) => logNormal(mean, sigma, pick(rng)),
  gamma: (shape, scale, rng) => gamma(shape, scale, pick(rng)),
  beta: (alpha, betaShape, rng) => beta(alpha, betaShape, pick(rng)),

  dirichletInto: (out, alpha, rng) => dirichletInto(out, alpha, pick(rng)),
  dirichlet: (alpha, rng) => dirichlet(alpha, pick(rng)),
  multivariateNormalInto: (out, mean, covariance, rng) => multivariateNormalInto(out, mean, covariance, pick(rng)),
  multivariateNormal: (mean, covariance, rng) => multivariateNormal(mean, covariance, pick(rng)),
});
