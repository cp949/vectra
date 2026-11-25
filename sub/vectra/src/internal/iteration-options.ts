/** 반복 옵션 default. caller가 미지정 옵션을 받았을 때 사용한다. */
export const DEFAULT_ITERATION_MAX = 100;

/** Jacobi 기본 반복 상한의 sweep 수. 1 sweep은 `n * (n - 1) / 2`회 rotation이다. */
export const DEFAULT_JACOBI_SWEEPS = 10;
export const DEFAULT_ITERATION_TOLERANCE = 1e-10;
export const DEFAULT_ITERATION_EPSILON = 1e-9;

/** 반복 옵션의 입력 모양. 도메인 옵션 타입(`IterationOptions`, `PCAOptions` 등)이 구조적으로 만족한다. */
interface IterationOptionsInput {
  readonly maxIterations?: number;
  readonly tolerance?: number;
  readonly epsilon?: number;
}

/**
 * 검증/분류된 반복 옵션. caller가 매번 다시 검사하지 않도록 결과로 묶어 전달한다.
 *
 * `maxIterations`가 `undefined`이면 사용자가 지정하지 않은 것이다. Jacobi caller가 matrix 크기로
 * `defaultJacobiMaxIterations`를 계산해 채운다.
 */
export interface ResolvedIterationOptions {
  readonly maxIterations: number | undefined;
  readonly tolerance: number;
  readonly epsilon: number;
}

/**
 * 반복 옵션의 세 필드를 검증해 default를 채운 `ResolvedIterationOptions`를 만든다.
 *
 * 검증 순서는 `maxIterations` → `tolerance` → `epsilon`이며, 어느 필드 실패도 `RangeError`다.
 * matrix/vector 입력 검증보다 먼저 호출한다.
 *
 * @param options 사용자 옵션. `undefined`이면 모든 필드에 default를 사용한다.
 * @param name error message에 사용할 옵션 인자 이름
 */
export function resolveIterationOptions(
  options: IterationOptionsInput | undefined,
  name: string
): ResolvedIterationOptions {
  const maxIterations = options?.maxIterations;
  if (maxIterations !== undefined && (!Number.isSafeInteger(maxIterations) || maxIterations <= 0)) {
    throw new RangeError(`${name}.maxIterations must be a positive safe integer, got ${String(maxIterations)}`);
  }

  const tolerance = options?.tolerance;
  let resolvedTolerance: number;
  if (tolerance === undefined) {
    resolvedTolerance = DEFAULT_ITERATION_TOLERANCE;
  } else {
    if (!Number.isFinite(tolerance) || tolerance < 0) {
      throw new RangeError(`${name}.tolerance must be a finite number >= 0, got ${String(tolerance)}`);
    }
    resolvedTolerance = tolerance;
  }

  const epsilon = options?.epsilon;
  let resolvedEpsilon: number;
  if (epsilon === undefined) {
    resolvedEpsilon = DEFAULT_ITERATION_EPSILON;
  } else {
    if (!Number.isFinite(epsilon) || epsilon < 0) {
      throw new RangeError(`${name}.epsilon must be a finite number >= 0, got ${String(epsilon)}`);
    }
    resolvedEpsilon = epsilon;
  }

  return { maxIterations, tolerance: resolvedTolerance, epsilon: resolvedEpsilon };
}

/**
 * `maxIterations`를 지정하지 않은 Jacobi 호출의 반복 상한을 matrix 크기 `n`으로 계산한다.
 *
 * 규칙: `max(DEFAULT_ITERATION_MAX, DEFAULT_JACOBI_SWEEPS * n * (n - 1) / 2)`.
 * 반복 한 번은 rotation 한 번이고 1 sweep은 `n * (n - 1) / 2`회다. 무작위 조밀 matrix는
 * 1.0 ~ 2.2 n² 회(약 2 ~ 4.4 sweep)에서 수렴한다. 상한은 그 두 배 이상이다.
 * `n <= 5`에서는 이전 고정 기본값 `100`과 같다.
 *
 * @param n matrix 크기
 */
export function defaultJacobiMaxIterations(n: number): number {
  return Math.max(DEFAULT_ITERATION_MAX, (DEFAULT_JACOBI_SWEEPS * n * (n - 1)) / 2);
}
