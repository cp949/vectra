import type { PathCommand, PathMeasurementOptions } from '../types/index';
import { length } from './length';
import { splitAtLengthInto } from './split-at-length-into';

/**
 * commands에서 normalized ratio `[start, end]` 구간을 추출하여 out에 기록하고 out을 반환한다.
 *
 * `start`, `end`는 `[0, 1]` 비율이다. 거리 단위가 아니라 normalized parameter다.
 *
 * - `start`, `end`는 모두 `[0, 1]`로 clamp한다.
 * - `clamped start > clamped end` → out clear만 (empty path).
 * - `clamped start === 0 && clamped end === 1` → 전체 path를 그대로 복사.
 * - empty path 또는 drawing segment가 없는 move-only path (`totalLength === 0`) → out clear만.
 * - `out.length = 0` 후 push 방식으로 채운다.
 * - `out`과 `commands`가 같은 배열이어도 안전하다 (aliasing 허용).
 *
 * NaN start/end는 JS 비교 결과를 따른다. `clamped > clamped` 비교 결과가 false이므로 명시적 throw가
 * 없고, `splitAtLengthInto`의 NaN 동작이 그대로 흐른다 (outA에 전체, outB empty 등). caller 책임.
 *
 * 내부 구현: `splitAtLengthInto`를 두 번 적용한다. 1) `start * totalLength` 위치에서 split하여
 * suffix(`splitB`)를 얻고, 2) suffix에 대해 `(end - start) * totalLength` 위치에서 다시 split하여
 * 앞부분이 partial 결과다.
 *
 * Segment-level split 정책은 `splitAtLengthInto` JSDoc을 참고한다.
 *
 * @param out partial 결과를 기록할 mutable PathCommand 배열
 * @param commands 원본 path command sequence (absolute 전제)
 * @param start normalized ratio 시작값 (`[0, 1]`로 clamp)
 * @param end normalized ratio 끝값 (`[0, 1]`로 clamp)
 * @param options flatten 옵션 (flatness, maxRecursion)
 * @returns 기록이 완료된 out (입력과 동일한 참조)
 */
export function partialInto<Out extends PathCommand[]>(
  out: Out,
  commands: readonly PathCommand[],
  start: number,
  end: number,
  options?: PathMeasurementOptions
): Out {
  // aliasing 대비: out === commands인 경우 clear 전에 snapshot
  const snapshot = commands === (out as readonly PathCommand[]) ? Array.from(commands) : commands;

  out.length = 0;

  if (snapshot.length === 0) {
    return out;
  }

  const cs = Math.max(0, Math.min(1, start));
  const ce = Math.max(0, Math.min(1, end));

  if (cs > ce || cs === ce) {
    return out;
  }

  const total = length(snapshot, options);
  if (!(total > 0)) {
    // totalLength === 0 또는 NaN(degenerate)도 empty 결과로 처리한다.
    return out;
  }

  if (cs === 0 && ce === 1) {
    for (const cmd of snapshot) {
      out.push(cmd as Out[number]);
    }
    return out;
  }

  // 1단계: snapshot을 start 위치에서 split → suffix를 얻는다.
  const head: PathCommand[] = [];
  const suffix: PathCommand[] = [];
  splitAtLengthInto(head, suffix, snapshot, cs * total, options);

  // suffix의 길이는 (1 - cs) * total. partial 길이는 (ce - cs) * total.
  // suffix에서 (ce - cs) * total 위치에서 다시 split → 앞부분이 partial.
  const partial: PathCommand[] = [];
  const tail: PathCommand[] = [];
  splitAtLengthInto(partial, tail, suffix, (ce - cs) * total, options);

  for (const cmd of partial) {
    out.push(cmd as Out[number]);
  }
  return out;
}
