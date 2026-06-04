import { lineFamilyIntersects, segmentToLineFamilyParam } from '../internal/line-family';
import { readX, readY } from '../internal/xy';
import type { XYInput } from '../types';

/**
 * closed ring의 non-adjacent edge pair가 교차/접촉/overlap하는지 판정한다.
 *
 * edge i는 `pts[i]` → `pts[(i + 1) % n]` segment다(implicit closed ring). ring에서 인접한 edge
 * pair는 정상적으로 한 vertex를 공유하므로 검사에서 제외한다. 첫 edge와 마지막 edge도 첫 vertex를
 * 공유하는 인접 edge다. non-adjacent edge pair는 단일 교점, endpoint touch, collinear overlap을
 * 모두 self-intersection으로 본다. repair나 normalize는 하지 않으므로, vertex가 4개 이상인 ring에서
 * consecutive repeated point가 만든 zero-length edge는 양옆 non-adjacent edge가 같은 점을 공유하게
 * 만들어 self-intersection으로 판정된다. non-adjacent edge pair가 존재하지 않는 `n < 4`는 항상
 * false다.
 * 판정은 line-family segment intersection을 쓴다. epsilon은 두 edge 방향 벡터 cross product 절대값
 * 임계값이며 normalize되지 않는다. 따라서 좌표 scale에 의존한다: 큰 epsilon에서는 near-parallel edge가
 * collinear overlap으로 합쳐지고, 매우 작은 좌표 scale에서는 실제 교차도 cross가 epsilon 이하가 되어
 * parallel로 합쳐질 수 있다. 이는 `intersectsSegmentSegment`의 epsilon 의미와 같다.
 *
 * 이 helper로 `isSelfIntersecting`과 `isSimple`이 public 함수끼리 import하지 않고 같은 kernel을
 * 공유한다.
 *
 * @param pts polygon vertex 배열 (implicit closed ring으로 순회)
 * @param epsilon cross product 절대값 임계값 (normalize되지 않음)
 */
export function ringSelfIntersects(pts: readonly XYInput[], epsilon: number): boolean {
  const n = pts.length;
  if (n < 4) return false;

  // edge별 line-family param을 한 번만 만들어 O(n²) pair 비교에서 재사용한다.
  const edges: ReturnType<typeof segmentToLineFamilyParam>[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    edges.push(segmentToLineFamilyParam(readX(pts[i]), readY(pts[i]), readX(pts[j]), readY(pts[j])));
  }

  for (let i = 0; i < n; i++) {
    // j는 i + 2부터 시작한다. (i, i + 1) edge pair는 인접 edge다.
    for (let j = i + 2; j < n; j++) {
      // edge 0과 edge n-1은 첫 vertex를 공유하는 인접 edge다.
      if (i === 0 && j === n - 1) continue;
      if (lineFamilyIntersects(edges[i], edges[j], epsilon)) return true;
    }
  }
  return false;
}

/**
 * implicit closed ring에 zero-length edge가 있는지 판정한다.
 *
 * edge i는 `pts[i]` → `pts[(i + 1) % n]` segment다. epsilon은 길이(거리) 단위 임계값이며,
 * edge length squared가 `epsilon * epsilon` 이하면 zero-length로 본다. caller는 cross product
 * 단위 epsilon을 그대로 넘기지 않는다. `isSimple`은 segment domain의 `isZeroLength`처럼 고정
 * DEFAULT_EPSILON 길이 임계값으로 호출한다.
 *
 * @param pts polygon vertex 배열 (implicit closed ring으로 순회)
 * @param epsilon zero-length edge 길이(거리) 임계값
 */
export function ringHasZeroLengthEdge(pts: readonly XYInput[], epsilon: number): boolean {
  const n = pts.length;
  if (n === 0) return false;

  const thresholdSq = epsilon * epsilon;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = readX(pts[j]) - readX(pts[i]);
    const dy = readY(pts[j]) - readY(pts[i]);
    if (dx * dx + dy * dy <= thresholdSq) return true;
  }
  return false;
}
