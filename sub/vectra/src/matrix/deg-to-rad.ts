/**
 * degree angle을 radian angle로 변환한다.
 *
 * @param degrees radian으로 변환할 degree 값
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
