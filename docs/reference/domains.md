# Domain 지도

`vectra`는 domain subpath로 기능을 나눈다.
이 문서는 모든 leaf function 목록이 아니라 필요한 기능을 찾기 위한 지도다.

| Domain | Import | 책임 |
| --- | --- | --- |
| `vec` | `@cp949/vectra/vec` | 2D vector arithmetic, length, distance, angle, projection, transform |
| `segment` | `@cp949/vectra/segment` | 유한 endpoint line 계산, length, midpoint, projection, closest point |
| `rect` | `@cp949/vectra/rect` | `x/y/width/height` rectangle 계산, layout, contain/fit |
| `bounds` | `@cp949/vectra/bounds` | min/max AABB 계산, union, intersection, transform |
| `capsule` | `@cp949/vectra/capsule` | segment + radius shape 계산 |
| `circle` | `@cp949/vectra/circle` | 원의 area, circumference, tangent, closest point, bounds |
| `ellipse` | `@cp949/vectra/ellipse` | 타원 primitive, bounds, closest point, transform-adjacent 계산 |
| `matrix` | `@cp949/vectra/matrix` | 2D affine transform matrix |
| `polyline` | `@cp949/vectra/polyline` | polyline length, sampling, closest point, simplification |
| `polygon` | `@cp949/vectra/polygon` | lightweight simple polygon 계산, area, centroid, containment |
| `triangle` | `@cp949/vectra/triangle` | triangle constructor, centers, classification, relation |
| `oriented-rect` | `@cp949/vectra/oriented-rect` | 회전 rectangle 계산 |
| `pose2` | `@cp949/vectra/pose2` | 2D pose transform |
| `intersects` | `@cp949/vectra/intersects` | cross-shape intersection and relation |
| `random` | `@cp949/vectra/random` | injected `rng?: () => number` 기반 random helper |
| `random-state` | `@cp949/vectra/random-state` | 명시적 random generator state |
| `path` | `@cp949/vectra/path` | path command data, traversal, bounds, closest point |
| `math` | `@cp949/vectra/math` | scalar math helper, polynomial solver |
| `curve` | `@cp949/vectra/curve` | Bezier, arc, Catmull-Rom, B-Spline 계산 |
| `svg-path` | `@cp949/vectra/svg-path` | SVG path string parse/serialize adapter |
| `infinite-line` | `@cp949/vectra/infinite-line` | 무한 직선 계산 |
| `ray` | `@cp949/vectra/ray` | ray 계산 |
| `angle` | `@cp949/vectra/angle` | radian 기반 angle helper, wrap, sweep, interpolation |
| `interpolation` | `@cp949/vectra/interpolation` | scalar/point interpolation |
| `easing` | `@cp949/vectra/easing` | scalar easing function catalog |
| `adapter` | `@cp949/vectra/adapter` | SVG points 등 외부 format 변환 |
| `editor-geometry` | `@cp949/vectra/editor-geometry` | snapping, handle, editor-oriented pure geometry |
| `linalg` | `@cp949/vectra/linalg` | general numeric linear algebra |
| `calculus` | `@cp949/vectra/calculus` | finite difference, derivative, integral helper |
| `statistics` | `@cp949/vectra/statistics` | descriptive statistics, covariance, least squares |
| `grid` | `@cp949/vectra/grid` | rectangular grid coordinate helper |
| `hex-grid` | `@cp949/vectra/hex-grid` | hex grid coordinate, neighbor, distance helper |
| `motion` | `@cp949/vectra/motion` | motion-related scalar/vector helper |
| `noise` | `@cp949/vectra/noise` | noise function helper |
| `sdf` | `@cp949/vectra/sdf` | signed distance function helper |
| `fitting` | `@cp949/vectra/fitting` | fitting and approximation helper |

## 관련 문서

- [Import 방식](../guides/imports.md)
- [Output과 Into](../guides/outputs-and-into.md)
- [Input과 Shape](../guides/inputs-and-shapes.md)
- [Import map](./import-map.md)
