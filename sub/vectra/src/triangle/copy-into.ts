import { readTriangleA, readTriangleB, readTriangleC } from '../internal/triangle';
import { readX, readY, writeXY } from '../internal/xy';
import type { TriangleLike, TriangleWritable, XYInput, XYWritable } from '../types';

/** triangle을 out에 복사하고 out을 반환한다. */
export function copyInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  triangle: TriangleLike
): Out;
/** 세 XYInput을 out에 복사하고 out을 반환한다. */
export function copyInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  a: XYInput,
  b: XYInput,
  c: XYInput
): Out;
export function copyInto<Out extends TriangleWritable<XYWritable, XYWritable, XYWritable>>(
  out: Out,
  triangleOrA: TriangleLike | XYInput,
  b?: XYInput,
  c?: XYInput
): Out {
  // aliasing에서도 안전하도록 모든 좌표를 읽은 뒤 기록한다
  let ax: number;
  let ay: number;
  let bx: number;
  let by: number;
  let cx: number;
  let cy: number;

  if (b !== undefined && c !== undefined) {
    // 세 XYInput 형태
    const a = triangleOrA as XYInput;
    ax = readX(a);
    ay = readY(a);
    bx = readX(b);
    by = readY(b);
    cx = readX(c);
    cy = readY(c);
  } else {
    // TriangleLike 형태
    const t = triangleOrA as TriangleLike;
    const ta = readTriangleA(t);
    const tb = readTriangleB(t);
    const tc = readTriangleC(t);
    ax = readX(ta);
    ay = readY(ta);
    bx = readX(tb);
    by = readY(tb);
    cx = readX(tc);
    cy = readY(tc);
  }

  writeXY(out.a, ax, ay);
  writeXY(out.b, bx, by);
  writeXY(out.c, cx, cy);
  return out;
}
