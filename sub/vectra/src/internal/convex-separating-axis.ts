/**
 * 한 다각형의 변 법선 축 중 `other`와 투영 구간이 분리되는 축이 있으면 true를 반환한다.
 *
 * triangle-triangle, rect-triangle, bounds-triangle SAT leaf가 공유하는 kernel이다.
 *
 * - 변 i→i+1(마지막은 0으로 wrap)마다 법선 `n = (-dy, dx)`를 만든다. 정규화하지 않는다.
 * - `polygon`과 `other`의 모든 꼭짓점을 `vx * nx + vy * ny`로 투영한다.
 * - `maxP < minO || maxO < minP`이면 그 축에서 분리된 것으로 보고 즉시 true를 반환한다.
 * - 구간이 끝점에서 맞닿으면(`max === min`) 분리가 아니다. closed boundary는 겹침으로 본다.
 * - 모든 축에서 분리되지 않으면 false를 반환한다. 변이 없는 `polygon`(길이 < 4)도 false다.
 *
 * `other`의 변 법선은 검사하지 않는다. 양쪽 다각형의 축이 모두 필요하면 caller가 인자를 바꿔 두 번 호출한다.
 *
 * NaN guard를 두지 않는다. `p < min`, `p > max`는 NaN이면 false라서 NaN 투영값이 구간에서 빠진다.
 * 한쪽 투영값이 전부 NaN이면 구간이 `[Infinity, -Infinity]`로 남아 대개 분리로 판정된다.
 * 기존 leaf의 출력을 그대로 보존하려는 동작이므로 guard를 넣으면 출력이 바뀐다.
 *
 * caller는 `polygon.length`가 짝수이고 `other` 길이도 짝수임을 보장한다.
 * 호출마다 평탄 배열 `[x0, y0, x1, y1, ...]`을 만드는 비용은 caller가 진다.
 *
 * @param polygon 변 법선을 축으로 쓸 다각형 꼭짓점 평탄 배열
 * @param other 같은 축에 투영할 다각형 꼭짓점 평탄 배열
 * @returns 분리 축이 하나라도 있으면 true
 */
export function hasSeparatingEdgeNormal(polygon: ArrayLike<number>, other: ArrayLike<number>): boolean {
  const n = polygon.length;
  for (let i = 0; i < n; i += 2) {
    const j = i + 2 === n ? 0 : i + 2;
    const nx = -(polygon[j + 1] - polygon[i + 1]);
    const ny = polygon[j] - polygon[i];

    let minP = Infinity;
    let maxP = -Infinity;
    for (let k = 0; k < n; k += 2) {
      const p = polygon[k] * nx + polygon[k + 1] * ny;
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;
    }
    let minO = Infinity;
    let maxO = -Infinity;
    for (let k = 0; k < other.length; k += 2) {
      const p = other[k] * nx + other[k + 1] * ny;
      if (p < minO) minO = p;
      if (p > maxO) maxO = p;
    }
    if (maxP < minO || maxO < minP) return true;
  }
  return false;
}
