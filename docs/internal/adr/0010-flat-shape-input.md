# ADR 0010: v2 도형 입력과 출력의 shape를 고정한다

상태: 승인

## 배경

- v1의 공유 좌표 reader는 tuple과 여러 객체 shape를 함께 본다.
- 앱 어디서든 다른 shape가 들어오면 V8 inline cache가 megamorphic이 된다. 그러면 reader를 쓰는 모든 함수가 느려진다.
- 원 163개의 모든 쌍 장면(Node.js 24.21, 실제 `dist`):
  - v1: 깨끗한 상태 120.5µs, 다른 함수가 여러 shape를 본 뒤 419.3µs.
  - 객체 전용 실험: 깨끗한 상태 35.2µs, 같은 오염 뒤 29.0µs.
- 같은 모듈 안 원 쌍 비교: 중첩 객체 29.2µs, 평평한 객체 25.8µs, 숫자 인자 25.8µs.

## 결정

- 각 함수는 입력마다 shape 하나만 받는다.
- 좌표 tuple, `XYInput`, shape 선택용 overload와 union을 없앤다.
- 함수는 도형 필드를 직접 읽고 쓴다.
- 공유 좌표 reader와 writer를 없앤다. `*XY` 스칼라 함수도 없앤다.

| v1 | v2 |
| --- | --- |
| `XYInput` (`XYLike \| XYTuple`) | `{ x, y }` |
| `CircleLike` | `{ cx, cy, r }` |
| `EllipseLike` | `{ cx, cy, rx, ry }` |
| `RotatedEllipseLike` | `{ cx, cy, rx, ry, rotation }` |
| `CenterArcLike` | 그대로. 이미 평평하다. |
| `SegmentLike` | `{ x1, y1, x2, y2 }` |
| `CapsuleLike` | `{ x1, y1, x2, y2, r }` |
| `TriangleLike` | `{ x1, y1, x2, y2, x3, y3 }` |
| `RayLike` | `{ ox, oy, dx, dy }` |
| `InfiniteLineLike` | `{ ox, oy, dx, dy }` |
| `BoundsLike` | `{ minX, minY, maxX, maxY }` |
| `RectLike` | `{ x, y, width, height }`. tuple만 없앤다. |
| `OrientedRectLike` | `{ cx, cy, width, height, angle }` |
| `Pose2Like` | `{ px, py, angle }` |
| `MatrixLike` | `{ a, b, c, d, tx, ty }`. tuple만 없앤다. |
| `GridCellLike`, `HexAxialLike`, `HexCubeLike`, `HexOffsetLike` | 객체만 남긴다. |
| `CurveLike` | `{ kind, x0, y0, x1, y1, x2, y2 }`. cubic은 `x3, y3`를 더한다. |
| `PolygonLike` | interleaved `number[]`: `[x0, y0, x1, y1, …]` |
| `PolylineLike` | `{ x, y }[]` |
| `*Writable` | 입력과 같은 평평한 shape. |

### 필드 이름

- 중심 기반 도형은 `cx, cy`를 쓴다.
- 끝점 기반 도형은 SVG처럼 `x1, y1, x2, y2`를 쓴다.
- 방향 기반 도형은 `ox, oy, dx, dy`를 쓴다.
- `Pose2`는 `px, py`를 쓴다. 점 입력과 구조를 구분한다.
- 이유: 점과 필드가 겹치는 도형을 점 함수에 넘기면 점 함수가 여러 shape를 본다.
- `Rect { x, y, width, height }`는 점과 필드가 겹친다. 점 함수에 넘기지 않는다.

### 점 목록

- polygon과 polyline은 형식이 다르다. 측정한 연산에서 빠른 쪽을 골랐다.
- 측정: Node.js 24.21. 목록 8개, 점 32·256·2048개. 입력 생성은 제외했다.
  - polygon `area`: interleaved `number[]`가 `{x,y}[]`보다 시간이 27–48% 짧다.
  - polygon `containsPoint`: `number[]`와 `{x,y}[]`의 차이가 0.5–3.4%다. 측정 오차 범위다. `Float64Array`는 5–7% 길다.
  - polyline 길이: 256점과 2048점에서 `{x,y}[]`가 `number[]`보다 시간이 7–12% 짧다.

| 연산 | 점/목록 | `{x,y}[]` | `number[]` | `Float64Array` |
| --- | ---: | ---: | ---: | ---: |
| containsPoint | 32 | 6.630 | 6.539 | 6.996 |
| containsPoint | 256 | 49.929 | 49.661 | 52.018 |
| containsPoint | 2048 | 382.406 | 369.711 | 393.528 |
| area | 32 | 0.598 | 0.402 | 0.490 |
| area | 256 | 4.864 | 2.548 | 3.333 |
| area | 2048 | 26.533 | 19.382 | 25.068 |
| length | 32 | 0.927 | 0.868 | 1.061 |
| length | 256 | 28.903 | 32.742 | 45.015 |
| length | 2048 | 240.267 | 259.079 | 363.473 |

단위는 목록 8개 한 번당 µs다. 각 조합은 별도 프로세스 9라운드 최솟값이다.
- 두 형식 사이 변환 비용은 재지 않았다.
  - 변환이 필요한 곳: `intersects/intersects-polygon-polyline`, `internal/polygon-relation`, `random`, path flatten 결과를 polygon으로 쓰는 곳.
  - 이 파일들을 바꿀 때 변환 비용을 잰다.

### 출력

- 반환 객체와 `Into`의 writable output은 입력과 같은 shape다.
- `Into`의 반환 계약은 v1과 같다. 전달받은 출력 객체를 그 구체 타입 그대로 반환한다.

### 검증

- 검증, 기본값, 경계 정책, epsilon은 v1과 같다.
- 정밀도 기준은 [정밀도 정책](../precision.md)을 따른다.

### 타입 이름

- v2 입력 타입은 도형 이름을 그대로 쓴다. 예: `Point`, `Circle`, `Segment`.
- 전환 중에는 v1의 `Like`, `Tuple` 타입 이름을 남긴다. v2 타입과 구분하기 위해서다.

## 결과

- 한 함수 안의 inline cache는 그 함수를 부른 쪽의 shape만 본다.
- 호출처는 한 함수에 한 객체 shape만 넘긴다.
  - 필드 순서가 다르거나 필드가 더 많은 객체를 섞어 넘기면 그 함수가 megamorphic이 된다.
  - 단독 측정에서 섞어 넘긴 경우가 약 10배 느렸다.
  - v2는 이 경우를 막지 못한다. JSDoc과 문서로 알린다.
- 이 결정은 [ADR 0003](0003-input-types.md)과 [ADR 0006](0006-xy-writable-output-policy.md)을 대체한다.
