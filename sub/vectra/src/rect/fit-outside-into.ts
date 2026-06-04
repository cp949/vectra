import { readRectHeight, readRectWidth, readRectX, readRectY } from '../internal/rect';
import type { RectLike, RectWritable } from '../types';

/**
 * target의 aspect ratio를 유지하면서 container를 완전히 덮는 rect를 out에 기록한다.
 *
 * cover 모드 결과로, 한 축은 container와 같고 다른 축은 더 길어 container 밖으로
 * 튀어나올 수 있다. 결과는 container 중심에 정렬된다. target 또는 container가
 * empty(`width <= 0` 또는 `height <= 0`)이면 out에 container를 그대로 복사한다.
 * out과 target/container가 같은 object여도 안전하다.
 *
 * @param out fit 결과 rect를 기록할 writable output
 * @param target aspect ratio와 size를 제공하는 source rect. 위치(x/y)는 결과에 반영되지 않는다.
 * @param container 덮을 대상 container rect
 */
export function fitOutsideInto<Out extends RectWritable>(out: Out, target: RectLike, container: RectLike): Out {
  // aliasing 안전 - 모든 입력을 먼저 읽은 후 기록한다
  const tw = readRectWidth(target);
  const th = readRectHeight(target);
  const cx = readRectX(container);
  const cy = readRectY(container);
  const cw = readRectWidth(container);
  const ch = readRectHeight(container);

  // empty target 또는 empty container → container 복사
  if (tw <= 0 || th <= 0 || cw <= 0 || ch <= 0) {
    out.x = cx;
    out.y = cy;
    out.width = cw;
    out.height = ch;
    return out;
  }

  const targetRatio = tw / th;
  const containerRatio = cw / ch;

  // cover: 더 큰 scale로 container 전체를 target이 덮도록 한다
  const scale = targetRatio <= containerRatio ? cw / tw : ch / th;
  const scaledW = tw * scale;
  const scaledH = th * scale;

  out.x = cx + (cw - scaledW) / 2;
  out.y = cy + (ch - scaledH) / 2;
  out.width = scaledW;
  out.height = scaledH;
  return out;
}
