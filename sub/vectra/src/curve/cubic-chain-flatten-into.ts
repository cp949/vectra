import { readX, readY } from '../internal/xy';
import type { FlattenOptions, XYInput, XYObjectWritable } from '../types';
import { appendFlattenedCubic } from './cubic-flatten.internal';

/**
 * 연결된 cubic Bezier control point chain을 polyline point collection으로 근사해 out에 기록하고 out을 반환한다.
 *
 * `points`는 `[p0, c1, c2, p1, c1, c2, p2, ...]` 형식이다. 첫 4개가 첫 segment를 이루고,
 * 이후 3개마다 직전 segment 끝점을 시작점으로 공유하는 segment가 이어진다.
 * 유효 length는 `4 + 3n` (n >= 0)이다.
 *
 * out을 clear(length=0)한 뒤 각 segment를 `cubicFlattenInto`와 같은 adaptive subdivision으로 flatten한다.
 * 첫 segment는 모든 점을 push하고, 두 번째 segment부터는 시작점(직전 segment 끝점과 같은 연결점)을 생략해
 * 연결점이 한 번만 나오게 한다. result point는 입력 point를 재사용하지 않는 새 plain object다.
 *
 * `points.length < 4`이면 out을 clear하고 빈 배열을 반환한다.
 * `points.length >= 4`이면서 `(points.length - 4) % 3 !== 0`이면 `RangeError`로 실패한다.
 * `RangeError` 발생 시 out 보존(atomicity)은 보장하지 않는다.
 * 좌표 값은 검증 없이 사용하므로 NaN/Infinity는 결과 좌표로 그대로 전파된다.
 *
 * @param out polyline point를 push할 XYObjectWritable 배열. 기존 내용은 clear된다.
 * @param points cubic control point chain
 * @param options flatten 옵션
 * @param options.flatness 선형 근사 허용 geometric error. 기본값: 0.5
 * @param options.maxRecursion subdivision 재귀 깊이 상한. 기본값: 32
 * @returns out
 */
export function cubicChainFlattenInto(
  out: XYObjectWritable[],
  points: readonly XYInput[],
  options?: FlattenOptions
): XYObjectWritable[] {
  const flatness = options?.flatness ?? 0.5;
  const maxRecursion = options?.maxRecursion ?? 32;
  const n = points.length;

  out.length = 0;

  if (n < 4) return out;
  if ((n - 4) % 3 !== 0) {
    throw new RangeError(`cubicChainFlattenInto: points.length must be 4 + 3n, got ${n}`);
  }

  // 유효 length n = 4 + 3k이므로 segment 수는 k + 1 = (n - 1) / 3이다.
  const segmentCount = (n - 1) / 3;
  for (let s = 0; s < segmentCount; s++) {
    const base = s * 3;
    const p0 = points[base];
    const p1 = points[base + 1];
    const p2 = points[base + 2];
    const p3 = points[base + 3];

    appendFlattenedCubic(
      out,
      readX(p0),
      readY(p0),
      readX(p1),
      readY(p1),
      readX(p2),
      readY(p2),
      readX(p3),
      readY(p3),
      flatness,
      maxRecursion,
      s === 0
    );
  }

  return out;
}
