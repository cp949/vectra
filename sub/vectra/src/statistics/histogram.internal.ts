/**
 * histogram / digitize / bincount 공유 helper의 re-export 배럴.
 *
 * integer/edge/range 검증(`histogram-validate.internal`), bin edge 산출(`histogram-edges.internal`),
 * bin lookup + count(`histogram-count.internal`)로 분할된 helper를 한 진입점으로 모은다. 소비처
 * (`histogramBinEdges`, `histogramInto`, `histogram`, `bincountInto`, `digitizeInto`,
 * `normalizeMinMaxInto`)의 import 경로 `./histogram.internal`을 보존한다.
 */

export { computeHistogramCounts, findBinIndex } from './histogram-count.internal';
export {
  buildUniformBinEdges,
  DEFAULT_BIN_COUNT,
  resolveHistogramBinEdges,
  scanFiniteMinMax,
} from './histogram-edges.internal';
export {
  assertExplicitBinEdges,
  assertExplicitRange,
  assertNonNegativeSafeInteger,
  assertPositiveSafeInteger,
} from './histogram-validate.internal';
