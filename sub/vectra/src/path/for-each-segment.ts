import type { PathCommand, PathMeasurementOptions, PathSegment } from '../types/index';
import { forEachDrawSegment } from './path-segments.internal';

/**
 * commands를 순회하며 drawing segment마다 visitor를 호출한다.
 *
 * MoveCommand는 visitor 호출 없이 subpath start로만 기록된다. 직전이 MoveCommand인
 * 상태에서 만난 CloseCommand는 zero-length no-op이므로 visitor를 호출하지 않는다.
 * 그 외 CloseCommand는 `kind: 'close'` segment로 visitor에 노출되며,
 * `startsSubpath`는 항상 `false`로 채워서 호출한다 (close는 subpath 시작이 될 수 없다).
 *
 * - empty path → visitor 호출 없이 반환
 * - 첫 command가 MoveCommand 아님 → 암묵적 origin (0,0)이 subpath start
 * - consecutive MoveCommand → 마지막 MoveCommand가 subpath start
 * - CloseCommand 직후 draw → subpath start가 current point로 재사용
 *
 * visitor 정책:
 *
 * - visitor 내부 exception은 catch하지 않고 그대로 caller로 propagate한다.
 * - visitor는 input `commands` 배열을 mutate하지 않아야 한다. mutate해도 본 함수는
 *   방어하지 않으며 결과는 undefined behavior다.
 * - 전달된 `PathSegment` object는 lifetime이 보장되지 않으며 mutate하지 않는다.
 *   매 호출마다 새 wrapper object가 전달되지만 `command` 필드는 input array의
 *   `PathCommand` reference이므로 mutate 시 input commands까지 영향이 갈 수 있다.
 *   caller가 segment 정보를 보관해야 하면 필요한 필드를 복사한다.
 * - method 참조로 visitor를 전달하면 `this` binding이 손실될 수 있다. caller는
 *   arrow function 또는 `.bind()`로 처리한다.
 *
 * non-finite numeric 입력은 그대로 흘려보낸다.
 *
 * @param commands 순회할 path command sequence
 * @param visitor drawing segment마다 호출될 callback
 * @param _options 향후 옵션 확장 여지를 위한 placeholder (현재 미사용)
 */
export function forEachSegment(
  commands: readonly PathCommand[],
  visitor: (segment: PathSegment) => void,
  _options?: PathMeasurementOptions
): void {
  forEachDrawSegment(commands, (seg) => {
    if (seg.kind === 'close') {
      // internal DrawSegment의 close variant에는 startsSubpath 필드가 없다.
      // public PathSegment는 항상 startsSubpath: false로 노출한다.
      visitor({
        kind: 'close',
        fromX: seg.fromX,
        fromY: seg.fromY,
        command: seg.command,
        startsSubpath: false,
        subpathStartX: seg.subpathStartX,
        subpathStartY: seg.subpathStartY,
      });
      return;
    }
    visitor(seg);
  });
}
