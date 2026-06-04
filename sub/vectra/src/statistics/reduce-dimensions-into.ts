import {
  assertOrientation,
  assertRectangularMatrix,
  commitRectangularMatrixInto,
  materializeVariables,
} from './matrix.internal';
import { computePcaCore } from './pca-core.internal';
import { resolvePCAOptions } from './pca-options.internal';
import type { DimensionReductionOptions } from './types';
import { assertVarianceMode } from './validate.internal';

/**
 * `data`의 PCA projection을 `out`에 기록한다.
 *
 * `data`는 row-major `readonly (readonly number[])[]`다. top-level 또는 row가 array가 아니면
 * `TypeError`. ragged matrix는 `RangeError`. 모든 entry는 finite number여야 한다. 위반 시
 * `RangeError`. validation 정책과 PCA 옵션(`orientation`/`mode`/`useCorrelation`/`maxIterations`/
 * `tolerance`/`epsilon`)은 `pca`와 동일하다.
 *
 * `options.dimensions`는 유지할 principal component 개수다. positive safe integer가 아니면
 * `RangeError`. PCA 결과 `rank`보다 크면 `RangeError`. `dimensions === rank`는 모든 component를
 * 유지한다.
 *
 * PCA decomposition이 수렴 실패 등으로 결과를 만들지 못하면 `RangeError`를 던진다.
 *
 * 결과 matrix는 항상 row=observation, column=component shape다. input orientation과 무관하다.
 * `orientation: "columns"`(기본)이면 input row가 observation이라 `output[r][k]`는 input row `r`의
 * projection이다. `orientation: "rows"`이면 input column이 observation이라 `output[c][k]`는 input
 * column `c`의 projection이다. observation count가 `0`인 입력은 PCA 단계에서 `RangeError`로
 * 표면화된다. variable count가 `0`이면 `dimensions > 0` 정책 위반으로 `RangeError`.
 *
 * 각 observation `x`에 대해 `centered[v] = x[v] - means[v]`, `useCorrelation: true`이면
 * `centered[v] /= standardDeviations[v]`, `projection[k] = sum_v components[k][v] * centered[v]`를
 * 계산한다. 누적 sum / centering / scaling / projection 결과가 non-finite면 `RangeError`.
 *
 * 결과 entry의 `-0`은 `0`으로 canonicalize한다. validation 또는 산술 실패 시 `out`은 호출 전 상태를
 * 유지한다(모든 산술이 끝난 뒤 commit). `out`과 `data`가 같은 nested array여도 안전하다(commit
 * 단계에서 fresh row 배열로 교체). 반환값은 `out`이다.
 *
 * @param out projection matrix를 기록할 writable storage. 호출 전 길이는 무시되고 commit 후 결과
 *   matrix로 교체된다.
 * @param data projection 대상 matrix. row-major rectangular finite number matrix.
 * @param options 옵션. `dimensions` 필수. 그 외 옵션은 `PCAOptions`와 동일하다.
 */
export function reduceDimensionsInto(
  out: number[][],
  data: readonly (readonly number[])[],
  options: DimensionReductionOptions
): number[][] {
  // dimensions를 먼저 표면적으로 검증해 잘못된 dimensions에서도 일관된 RangeError를 던진다.
  const dimensionsRaw = options.dimensions;
  if (!Number.isSafeInteger(dimensionsRaw) || dimensionsRaw <= 0) {
    throw new RangeError(`options.dimensions must be a positive safe integer, got ${String(dimensionsRaw)}`);
  }
  const dimensions = dimensionsRaw;

  // orientation/mode/PCA 옵션을 동일한 helper로 직접 검증한다. pca() 호출을 통한 우회 검증과 달리
  // 본 함수는 computePcaCore를 직접 호출하므로 검증을 여기서 일관되게 수행해야 한다.
  const orientation = options.orientation ?? 'columns';
  assertOrientation(orientation, 'options.orientation');
  const mode = options.mode ?? 'population';
  assertVarianceMode(mode, 'options.mode');
  const resolved = resolvePCAOptions(options, 'options');

  const { rowCount, columnCount } = assertRectangularMatrix(data, 'data');

  // observation count 계산. orientation: "columns"는 row가 observation, "rows"는 column이 observation.
  // variable count가 0이면 dimensions > 0 정책을 만족시킬 수 없으므로 materialize 전에 RangeError.
  const observationCount = orientation === 'columns' ? rowCount : columnCount;
  const earlyVariableCount = orientation === 'columns' ? columnCount : rowCount;
  if (earlyVariableCount === 0) {
    throw new RangeError(`data has no variables (variable count is 0); cannot reduce to dimensions (${dimensions})`);
  }

  const { variables, sampleCount, variableCount } = materializeVariables(data, rowCount, columnCount, orientation);

  // pca의 sample count 분기와 동일한 정책으로 sample 수를 검증한다. caller 함수명을 그대로 노출해
  // 디버깅에서 reduceDimensions 진입점임을 즉시 식별할 수 있게 한다.
  if (sampleCount === 0) {
    throw new RangeError(`reduceDimensions requires sample count >= 1 when variable count > 0, got 0`);
  }
  if (mode === 'sample' && sampleCount < 2) {
    throw new RangeError(`sample reduceDimensions requires sample count >= 2, got ${sampleCount}`);
  }

  const core = computePcaCore(variables, variableCount, sampleCount, mode, resolved);
  if (core === undefined) {
    throw new RangeError(
      `reduceDimensions could not project: PCA decomposition failed to converge within options.maxIterations`
    );
  }

  if (dimensions > core.rank) {
    throw new RangeError(`options.dimensions (${dimensions}) exceeds PCA rank (${core.rank})`);
  }

  const { components, means, standardDeviations } = core;

  // observation count가 0이면 빈 matrix commit. variable count > 0 && sample count === 0은 위에서
  // RangeError로 처리하므로 여기서 도달할 수 없다. 방어 가드로 둔다.
  if (observationCount === 0) {
    out.length = 0;
    return out;
  }

  // temp[observation][component] shape의 projection buffer를 할당한다.
  const temp: number[][] = new Array(observationCount);
  for (let o = 0; o < observationCount; o++) {
    temp[o] = new Array<number>(dimensions);
  }

  // 각 observation에 대해 centered = x - mean, optional scaling, projection sum.
  for (let o = 0; o < observationCount; o++) {
    for (let k = 0; k < dimensions; k++) {
      const componentRow = components[k];
      let sum = 0;
      for (let v = 0; v < variableCount; v++) {
        // variables[v][o] = orientation에 맞춰 v번째 variable의 o번째 observation 값.
        const rawValue = variables[v][o];
        let centered = rawValue - means[v];
        if (!Number.isFinite(centered)) {
          throw new RangeError(
            `centered value at observation ${o}, variable ${v} must be finite, got ${String(centered)}`
          );
        }
        if (standardDeviations !== undefined) {
          centered = centered / standardDeviations[v];
          if (!Number.isFinite(centered)) {
            throw new RangeError(
              `scaled centered value at observation ${o}, variable ${v} must be finite, got ${String(centered)}`
            );
          }
        }
        const term = componentRow[v] * centered;
        if (!Number.isFinite(term)) {
          throw new RangeError(
            `projection term at observation ${o}, component ${k}, variable ${v} must be finite, got ${String(term)}`
          );
        }
        sum += term;
        if (!Number.isFinite(sum)) {
          throw new RangeError(
            `projection sum at observation ${o}, component ${k} must be finite, got ${String(sum)} at variable ${v}`
          );
        }
      }
      temp[o][k] = sum;
    }
  }

  // commit. out과 data가 같은 nested array일 수 있어 fresh row 배열로 교체하고 -0은 0으로
  // canonicalize한다. commitSymmetricMatrixInto와 동일한 atomicity 패턴.
  commitRectangularMatrixInto(out, temp, observationCount, dimensions);
  return out;
}
