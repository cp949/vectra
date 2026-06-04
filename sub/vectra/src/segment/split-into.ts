import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentSplitWritable, SegmentWritable, XYWritable } from '../types';

/**
 * segment를 normalized `t` 기준으로 left/right 두 segment로 분할해 out에 기록하고 out을 반환한다.
 *
 * `t`는 `[0, 1]`로 clamp한다. `t <= 0`이면 `left`는 zero-length `a -> a`, `right`는 원본 `a -> b`다.
 * `t >= 1`이면 `left`는 원본 `a -> b`, `right`는 zero-length `b -> b`다. `0 < t < 1`이면 분할점
 * `p = a + t * (b - a)`로 `left = a -> p`, `right = p -> b`다. `left.b`와 `right.a`는 같은 좌표값을
 * 갖는다.
 *
 * zero-length segment도 실패가 아니다. 두 output 모두 zero-length가 된다. `t`가 non-finite이면
 * `RangeError`로 fail-fast한다(`pointAtTInto`의 unclamped/non-finite pass-through 정책과 무관한
 * `splitInto` 내부 정책이다). segment endpoint 좌표가 non-finite(NaN/±Infinity)이면 arithmetic
 * 결과도 그대로 기록된다. input/output aliasing이 가능하므로 source endpoint를 write 전에 모두
 * scalar로 읽는다(`out.left === line`이나 nested endpoint alias도 안전하다).
 *
 * @param out 분할 결과를 기록할 writable multi-output
 * @param line 분할할 segment
 * @param t normalized 분할 위치. `[0, 1]`로 clamp한다. non-finite면 `RangeError`
 */
export function splitInto<
  Out extends SegmentSplitWritable<SegmentWritable<XYWritable, XYWritable>, SegmentWritable<XYWritable, XYWritable>>,
>(out: Out, line: SegmentLike, t: number): Out {
  if (!Number.isFinite(t)) {
    throw new RangeError(`segment.splitInto: t는 finite number여야 한다 (받음: ${t})`);
  }

  // aliasing 안전: out.left/out.right/line이 endpoint object를 공유해도 결과를 보존하도록
  // source 좌표를 write 전에 모두 읽는다.
  const ax = readX(readSegmentA(line));
  const ay = readY(readSegmentA(line));
  const bx = readX(readSegmentB(line));
  const by = readY(readSegmentB(line));

  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;

  if (clamped <= 0) {
    writeXY(out.left.a, ax, ay);
    writeXY(out.left.b, ax, ay);
    writeXY(out.right.a, ax, ay);
    writeXY(out.right.b, bx, by);
    return out;
  }

  if (clamped >= 1) {
    writeXY(out.left.a, ax, ay);
    writeXY(out.left.b, bx, by);
    writeXY(out.right.a, bx, by);
    writeXY(out.right.b, bx, by);
    return out;
  }

  const px = ax + clamped * (bx - ax);
  const py = ay + clamped * (by - ay);

  writeXY(out.left.a, ax, ay);
  writeXY(out.left.b, px, py);
  writeXY(out.right.a, px, py);
  writeXY(out.right.b, bx, by);
  return out;
}
