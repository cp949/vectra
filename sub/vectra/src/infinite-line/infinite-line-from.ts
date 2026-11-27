import type { InfiniteLine, InfiniteLineWritable } from '../types/flat-shapes.internal';
import { copyInto } from './copy-into';
import { createInfiniteLine } from './create-infinite-line';

/** 무한 직선의 좌표를 새 객체로 복사해 반환한다. */
export function infiniteLineFrom(line: InfiniteLine): InfiniteLineWritable {
  return copyInto(createInfiniteLine(), line);
}
