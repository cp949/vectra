# ADR 0010: v2 도형 입력과 출력의 shape를 고정한다

상태: 승인

## 배경

- 여러 객체 shape를 받는 공유 좌표 reader는 V8 inline cache를 megamorphic으로 만든다.
- Node.js v24.21.0의 원 163개 쌍 비교에서 여러 shape를 먼저 호출한 뒤 객체 전용 실험은 29.0µs, v1은 419.3µs가 걸렸다.
- 같은 Node.js 환경의 모듈 내 원 쌍 비교에서 평평한 객체와 숫자 인자는 각각 25.8µs가 걸렸다.

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

- Node.js v24.21.0에서 입력 생성을 제외하고 목록당 32·256·2048점을 비교했다.
- polygon `area`는 interleaved `number[]`가 `{ x, y }[]`보다 시간이 27–48% 짧았다.
- polygon `containsPoint`의 두 형식 차이는 3.4% 이하였다. 형식 선택 근거가 아니다.
- 256점과 2048점 polyline 길이 계산은 `{ x, y }[]`가 `number[]`보다 시간이 7–12% 짧았다.
- polygon과 polyline 사이 변환 비용은 측정하지 않았다.

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
