/**
 * bump curve helper의 공유 internal.
 *
 * bump X/Y의 cubic control point 정책을 적용해 cubic segment를 생성한다.
 * public bump leaf는 이 helper만 공유하고 서로를 직접 import하지 않는다.
 */
import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/** bump control point가 펴지는 축. 'x'는 수평 bump, 'y'는 수직 bump. */
export type BumpAxis = 'x' | 'y';

/**
 * bump cubic Bezier segment를 flat number[]로 생성한다.
 *
 * 'x'는 c1=(midX,y0), c2=(midX,y1) (midX=(x0+x1)/2),
 * 'y'는 c1=(x0,midY), c2=(x1,midY) (midY=(y0+y1)/2) control point를 쓴다.
 * non-finite 좌표는 산술 결과 그대로 pass-through한다. 호출자는 points.length >= 2를 보장한다.
 *
 * @param points bump curve가 통과할 입력 point 배열
 * @param axis bump control point가 펴지는 축
 * @returns cubic segment flat 배열과 segment 수
 */
export function bumpCubicSegments(
  points: readonly XYInput[],
  axis: BumpAxis
): { segments: number[]; segCount: number } {
  const n = points.length;
  const segCount = n - 1;
  const segments = new Array<number>(segCount * 8);

  for (let i = 0; i < segCount; i++) {
    const x0 = readX(points[i]);
    const y0 = readY(points[i]);
    const x1 = readX(points[i + 1]);
    const y1 = readY(points[i + 1]);
    const o = i * 8;
    segments[o] = x0;
    segments[o + 1] = y0;
    if (axis === 'x') {
      const midX = (x0 + x1) / 2;
      segments[o + 2] = midX;
      segments[o + 3] = y0;
      segments[o + 4] = midX;
      segments[o + 5] = y1;
    } else {
      const midY = (y0 + y1) / 2;
      segments[o + 2] = x0;
      segments[o + 3] = midY;
      segments[o + 4] = x1;
      segments[o + 5] = midY;
    }
    segments[o + 6] = x1;
    segments[o + 7] = y1;
  }

  return { segments, segCount };
}
