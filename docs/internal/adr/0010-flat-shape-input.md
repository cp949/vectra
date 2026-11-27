# ADR 0010: v2 도형 입력과 출력의 shape를 고정한다

상태: 승인

## 배경

v1의 공유 좌표 reader는 tuple과 여러 객체 shape가 섞이면 V8 inline cache가 megamorphic이 된다. 원 163개의 모든 쌍을 검사하는 장면에서 v1은 입력 오염 시 419.3µs가 걸렸다. 객체 전용 실험에서는 같은 장면에 29.0µs가 걸렸다. 평평한 객체와 숫자 인자를 비교한 원 쌍 실험에서는 둘 다 25.8µs였다.

## 결정

각 함수는 입력마다 한 가지 shape를 받는다. 좌표 tuple, `XYInput`, shape 선택용 overload와 union을 제거한다. 도형 필드를 직접 읽고 쓴다. 공유 좌표 reader와 writer, `*XY` 스칼라 함수는 제거한다.

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
| `Pose2Like` | `{ px, py, angle }`. |
| `MatrixLike` | `{ a, b, c, d, tx, ty }`. tuple만 없앤다. |
| `GridCellLike`, `HexAxialLike`, `HexCubeLike`, `HexOffsetLike` | 객체만 남긴다. |
| `CurveLike` | `{ kind, x0, y0, x1, y1, x2, y2 }`. cubic은 `x3, y3`를 더한다. |
| `PolygonLike`, `PolylineLike` | polygon은 interleaved `number[]`, polyline은 `{x,y}[]`. |
| `*Writable` | 입력과 같은 평평한 shape. |

중심은 `cx, cy`를 쓴다. 끝점은 SVG처럼 `x1, y1, x2, y2`를 쓴다. 방향 기반 도형은 `ox, oy, dx, dy`를 쓴다. `Pose2`는 `px, py`를 써서 점 입력과 구조를 구분한다. 점과 필드가 겹치는 도형을 점으로 전달하면 점 함수에 여러 객체 shape가 들어갈 수 있다.

Polygon 점 목록은 `[x0, y0, x1, y1, …]` 순서로 좌표를 저장한다. Polyline 점 목록은 순서대로 `{ x, y }`를 저장한다. Node.js v24.21.0에서 polygon의 `containsPoint`와 `area`는 측정한 세 크기에서 interleaved `number[]`가 가장 빨랐다. Polyline의 길이는 256점과 2,048점에서 `{x,y}[]`가 가장 빨랐다. 입력 생성과 형식 변환은 측정에서 제외했다.

반환 객체와 `Into`의 writable output은 입력과 같은 shape를 쓴다. `Into`는 기존 반환 계약을 유지한다. 전달받은 출력 객체를 반환하는 함수는 그 객체의 구체 타입을 보존한다. 검증, 기본값, 경계 정책, epsilon은 v1과 같다. 정밀도 기준은 [정밀도 정책](../precision.md)을 따른다.

v2 입력 타입은 `Point`, `Circle`, `Segment`처럼 도형 이름을 그대로 쓴다. 전환 중 v1의 `Like`와 `Tuple` 타입 이름을 유지해 v2 타입과 구분한다.

이 결정은 [ADR 0003](0003-input-types.md)과 [ADR 0006](0006-xy-writable-output-policy.md)을 대체한다.
