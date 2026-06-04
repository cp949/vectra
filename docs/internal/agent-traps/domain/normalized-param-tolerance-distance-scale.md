# normalized parameter tolerance에 거리-스케일 epsilon을 직접 쓰지 않는다

태그: `geometry`, `tolerance`, `epsilon`, `parameter`, `float64`, `scale`

## 함정

`[0, 1]` 같은 normalized parameter 축의 근접 판정에 거리-스케일 `epsilon`을 그대로 쓴다.

`epsilon`은 보통 거리 스케일 tolerance다(좌표 차이, `epsilon * epsilon`으로 제곱 거리 비교).
normalized parameter `t`는 무차원이라 같은 `epsilon`을 `t` 축 tolerance로 쓰면 실제 거리
tolerance가 `epsilon × (구간 길이)`로 부풀거나 줄어든다.

edge-local parameter `tEdge ∈ [0, 1]`의 vertex 근접 판정이 대표 사례다.

```ts
// 나쁨: tEdge(무차원)에 거리 스케일 epsilon을 직접 적용
const edgeTol = epsilon;
if (tEdge < -edgeTol || tEdge > 1 + edgeTol) continue;       // 포함 경계
const atVertex = tEdge <= edgeTol || tEdge >= 1 - edgeTol;   // vertex touch 분류
```

edge 길이 `L`에서 `edgeTol = epsilon`은 거리 `epsilon × L`의 slop이다. `L = 1e9`,
`epsilon = 1e-9`면 거리 slop이 `1` unit이 된다.

## 증상

- 긴 edge polygon에서 line이 polygon **밖**을 지나는데 가짜 `touch` hit이 잡힌다.
  예: edge 길이 `1e9`, 수직 line x=-0.5 → `tEdge = -5e-10`이 `-edgeTol = -1e-9`보다 커서
  포함되고 vertex touch로 분류된다. 실제 점은 polygon 위가 아니다.
- 같은 polygon **내부** transversal 교점(x=0.5)이 `cross`가 아닌 `touch`로 오분류된다.
  `tEdge = 5e-10 <= edgeTol = 1e-9`라서 vertex 근방으로 잘못 판정된다.
- 작은 좌표 fixture(단위 사각형 size 4)만 테스트하면 `edgeTol = epsilon`과 거리 환산 tolerance가
  둘 다 미세해 버그가 드러나지 않는다.

## 방지

normalized parameter 축의 tolerance는 거리 tolerance를 구간 길이로 나눠 환산한다.

```ts
// 좋음: 거리 epsilon을 edge 길이로 나눠 param 축으로 환산
const edgeLen = Math.sqrt(ex * ex + ey * ey);
const edgeTol = edgeLen > 0 ? epsilon / edgeLen : epsilon;
if (tEdge < -edgeTol || tEdge > 1 + edgeTol) continue;
const atVertex = tEdge <= edgeTol || tEdge >= 1 - edgeTol;
```

- param 축 tolerance = `거리 epsilon / 구간 길이`. 근접 판정이 구간 길이와 무관하게 일정한
  거리(~epsilon) 기준이 된다.
- 구간 길이가 0이면(`edgeLen = 0`) 환산이 불가능하다. 단, 그 분기 도달 가능성을 먼저 확인한다.
  예: edge cross product가 `0`이 되면 zero-length edge는 parallel branch로 빠지므로
  non-parallel branch의 `edgeLen > 0` fallback은 dead-but-safe다.
- 테스트는 큰 좌표(`1e9` 규모) fixture로 거리 환산을 강제 검증한다. polygon 밖/내부 양쪽,
  cross/touch 분류 양쪽을 고정한다.

## 관련 작업

- `_works/S10-RM-006/20260530-01-line-polygon-visibility/02-작업결과.md`
  - 사후 리뷰 수정 1: `polygon-line-intersections.ts`의 `edgeTol = epsilon`을
    `epsilon / sqrt(edgeLenSq)`로 환산. 긴 edge polygon 밖 가짜 touch hit, 내부 cross→touch
    오분류 수정. 회귀 테스트 `line/polygon kernel edge cases`(큰 edge 밖/내부) 추가.
