import { readSegmentA, readSegmentB } from '../internal/segment';
import { readX, readY, writeXY } from '../internal/xy';
import type { SegmentLike, SegmentWritable, XYInput, XYWritable } from '../types';

/**
 * line endpoint를 out에 복사하고 out을 반환한다. input/output aliasing 허용.
 *
 * @param out 결과를 기록할 writable segment output
 * @param lineOrA 복사할 segment. 또는 (a, b) 형식으로 두 점을 개별 전달 가능
 * @param b 끝점. lineOrA를 시작점(XYInput)으로 전달할 때 함께 지정
 */
export function copyInto<Out extends SegmentWritable<XYWritable, XYWritable>>(out: Out, line: SegmentLike): Out;
export function copyInto<Out extends SegmentWritable<XYWritable, XYWritable>>(out: Out, a: XYInput, b: XYInput): Out;
export function copyInto<Out extends SegmentWritable<XYWritable, XYWritable>>(
  out: Out,
  lineOrA: SegmentLike | XYInput,
  b?: XYInput
): Out {
  // aliasing에서도 안전하도록 모든 좌표를 읽은 뒤 기록한다
  const a = b === undefined ? readSegmentA(lineOrA as SegmentLike) : (lineOrA as XYInput);
  const bPoint = b === undefined ? readSegmentB(lineOrA as SegmentLike) : b;
  const ax = readX(a);
  const ay = readY(a);
  const bx = readX(bPoint);
  const by = readY(bPoint);
  writeXY(out.a, ax, ay);
  writeXY(out.b, bx, by);
  return out;
}
