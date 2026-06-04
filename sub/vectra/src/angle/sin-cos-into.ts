/**
 * angle의 sin/cos 값을 out에 기록하고 out을 반환한다.
 *
 * non-finite angle은 RangeError를 던진다.
 *
 * @param out sin/cos 값을 기록할 writable output
 * @param angle sin/cos를 계산할 각도(라디안)
 */
export function sinCosInto<Out extends { sin: number; cos: number }>(out: Out, angle: number): Out {
  if (!Number.isFinite(angle)) {
    throw new RangeError('angle arguments must be finite numbers');
  }

  out.sin = Math.sin(angle);
  out.cos = Math.cos(angle);

  return out;
}
