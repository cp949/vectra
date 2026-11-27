import type { SegmentSplitWritable } from '../types';
import type { Segment } from '../types/flat-shapes.internal';

/**
 * segment를 normalized `t` 기준으로 left/right 두 segment로 분할해 out에 기록하고 out을 반환한다.
 *
 * 시작점을 `A`, 끝점을 `B`라 한다. `t`는 `[0, 1]`로 clamp한다.
 * - `t <= 0`: `left`는 zero-length `A -> A`, `right`는 원본 `A -> B`다.
 * - `t >= 1`: `left`는 원본 `A -> B`, `right`는 zero-length `B -> B`다.
 * - `0 < t < 1`: 분할점 `P = A + t * (B - A)`로 `left = A -> P`, `right = P -> B`다.
 * - 왼쪽 선분의 끝점과 오른쪽 선분의 시작점은 같은 좌표값을 갖는다.
 *
 * zero-length segment도 실패가 아니다. 두 output 모두 zero-length가 된다. `t`가 non-finite이면
 * `RangeError`로 fail-fast한다(`pointAtTInto`의 unclamped/non-finite pass-through 정책과 무관한
 * `splitInto` 내부 정책이다). segment endpoint 좌표가 non-finite(NaN/±Infinity)이면 arithmetic
 * 결과도 그대로 기록된다. input/output aliasing이 가능하므로 source endpoint를 write 전에 모두
 * scalar로 읽는다(`out.left === line`도 안전하다).
 *
 * @param out 분할 결과를 기록할 객체
 * @param line 분할할 segment
 * @param t normalized 분할 위치. `[0, 1]`로 clamp한다. non-finite면 `RangeError`
 */
export function splitInto<Out extends SegmentSplitWritable>(out: Out, line: Segment, t: number): Out {
  if (!Number.isFinite(t)) {
    throw new RangeError(`segment.splitInto: t는 finite number여야 한다 (받음: ${t})`);
  }

  // aliasing 안전: 출력 선분이 입력 선분과 같은 객체여도 결과를 보존하도록
  // source 좌표를 write 전에 모두 읽는다.
  const ax = line.x1;
  const ay = line.y1;
  const bx = line.x2;
  const by = line.y2;

  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;

  if (clamped <= 0) {
    out.left.x1 = ax;
    out.left.y1 = ay;
    out.left.x2 = ax;
    out.left.y2 = ay;
    out.right.x1 = ax;
    out.right.y1 = ay;
    out.right.x2 = bx;
    out.right.y2 = by;
    return out;
  }

  if (clamped >= 1) {
    out.left.x1 = ax;
    out.left.y1 = ay;
    out.left.x2 = bx;
    out.left.y2 = by;
    out.right.x1 = bx;
    out.right.y1 = by;
    out.right.x2 = bx;
    out.right.y2 = by;
    return out;
  }

  const px = ax + clamped * (bx - ax);
  const py = ay + clamped * (by - ay);

  out.left.x1 = ax;
  out.left.y1 = ay;
  out.left.x2 = px;
  out.left.y2 = py;
  out.right.x1 = px;
  out.right.y1 = py;
  out.right.x2 = bx;
  out.right.y2 = by;
  return out;
}
