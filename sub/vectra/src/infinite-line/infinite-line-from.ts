import type { InfiniteLineLike, InfiniteLineWritable, XYInput } from '../types';
import { copyInto } from './copy-into';
import { createInfiniteLine } from './create-infinite-line';

/** `InfiniteLineLike` source의 component를 새 plain object로 복사해 반환한다. */
export function infiniteLineFrom(line: InfiniteLineLike): InfiniteLineWritable;
/** origin/direction component를 새 plain object로 복사해 반환한다. */
export function infiniteLineFrom(origin: XYInput, direction: XYInput): InfiniteLineWritable;
export function infiniteLineFrom(lineOrOrigin: InfiniteLineLike | XYInput, direction?: XYInput): InfiniteLineWritable {
  // 두 overload 모두 copyInto에 위임한다. 인자 union을 직접 전달하면 overload 매칭이 좁아지므로 분기한다
  if (direction === undefined) {
    return copyInto(createInfiniteLine(), lineOrOrigin as InfiniteLineLike);
  }
  return copyInto(createInfiniteLine(), lineOrOrigin as XYInput, direction);
}
