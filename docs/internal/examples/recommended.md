# 추천 예제 후보

이 문서는 agent가 코드를 작업하면서 발견한 기본 예제나 알려진 좋은 예제 후보를 모은다.
사용자가 직접 궁금해서 추가한 요청은 [wishlist.md](./wishlist.md)에 둔다.

예제 작업 진입점은 [README.md](./README.md)다.
예제 추가 원칙은 [strategy.md](./strategy.md)를 따른다. reference project별 seed는
[reference-seeds.md](./reference-seeds.md)를 따른다.

모든 public 함수에 예제를 붙이는 것이 목표가 아니다. 하나의 예제가 여러 함수를 함께 설명해도
충분하면 새 예제를 만들지 않는다.

## 운영 규칙

- 기본 사용법, API 철학, 유명한 geometry 시각화, demo로 보여주면 좋은 패턴을 남긴다.
- 한 번 계산해서 그리면 충분한 예제는 `apps/canvas-demo` 후보로 둔다.
- tick/update loop, pointer drag, animation, scene state가 필요한 예제는 `apps/pixi-demo` 후보로 둔다.
- 구현되면 `Done`으로 옮기고 연결을 기록한다.
- 설명은 선택 사항이지만, 추천 예제는 왜 좋은 후보인지 짧게 남기면 나중에 고르기 쉽다.

## Planned

현재 없음.

## Done

- reference: editor rotation handle / dial constraints
- 작업 흐름: rotation control dial (average, bisect, clamp, snap, sweep를 같은 회전 핸들에서 비교)
- 관련 함수: `angle/averageAngle`, `angle/fromVector`, `angle/bisectAngle`, `angle/clampAngle`,
  `angle/sweepAngle`, `angle/isReflexSweep`, `angle/octant`, `editor-geometry/snapAngle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rotation-control-dial` (`apps/pixi-demo/src/examples/rotation-control-dial`)
- 설명: 회전 핸들 하나를 drag하면 raw ray와 함께 평균 방향, 최단 이등분, clamp, snap, sweep 상태가
  nested ray로 갱신된다. 기존 angle 단독 dial 계열은 기본 탐색에서 숨기고 이 예제로 대표한다.

- reference: circular progress / arc measurement tools
- 작업 흐름: circular measurement lab (sagitta, sector area, turn marker, orbit segment hit 비교)
- 관련 함수: `circle/sagitta`, `circle/sectorArea`, `circle/pointAtAngleInto`,
  `circle/pointAtTurnInto`, `circle/closestPointInto`, `segment/pointAtTInto`,
  `intersects/intersectsCircleSegment`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circular-measurement-lab` (`apps/pixi-demo/src/examples/circular-measurement-lab`)
- 설명: 원 위 progress handle을 drag해 arc height와 sector area를 읽고, turn marker와 orbit segment 접촉을
  같은 원형 measurement 작업판에서 비교한다.

- reference: path editor sampling / proximity debug
- 작업 흐름: curve sampling workbench (flatten, arclength scrub, segment distance, polyline walker, path probe)
- 관련 함수: `curve/arcFlattenInto`, `curve/arcTAtLength`, `curve/arcPointAtTInto`,
  `curve/arcLengthAtT`, `segment/pointAtLengthInto`, `segment/length`,
  `polyline/pointAtLengthRatioInto`, `polyline/tangents`, `polyline/distanceToPoint`,
  `path/closestPoint`, `path/distanceToPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:curve-sampling-workbench` (`apps/pixi-demo/src/examples/curve-sampling-workbench`)
- 설명: tolerance/progress handle로 arc flatten 품질, arclength marker, segment ruler, polyline walker,
  path proximity probe를 함께 갱신한다. curve/path sampling 계열 단독 예제의 대표 workbench다.

- reference: game/editor raycast debug panel
- 작업 흐름: raycast workbench (같은 forward ray로 AABB, circle, wall segment, cubic path target 비교)
- 관련 함수: `intersects/intersectsBoundsRay`, `intersects/intersectsCircleRay`,
  `intersects/intersectsRaySegment`, `intersects/rayCubicIntersections`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:raycast-workbench` (`apps/pixi-demo/src/examples/raycast-workbench`)
- 설명: emitter aim handle을 drag하면 bounds/circle/segment boolean hit와 cubic path hit marker가 한 화면에서
  갱신된다. ray target별 단독 예제는 기본 탐색에서 숨기고 이 workbench로 대표한다.

- reference: steering / vector control handles
- 작업 흐름: vector control workbench (aim direction, ray distance, set length, clamp length 비교)
- 관련 함수: `vec/directionTo`, `vec/pointOnRay`, `vec/setLengthInto`, `vec/clampLengthInto`,
  `vec/length`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vector-control-workbench` (`apps/pixi-demo/src/examples/vector-control-workbench`)
- 설명: target handle을 drag하면 raw vector에서 unit aim, signed ray point, fixed-length vector, clamped-length
  vector가 함께 갱신된다.

- reference: collision response / wall normal debug
- 작업 흐름: vector collision response (incoming velocity를 normal 기준 slide, bounce, projection으로 비교)
- 관련 함수: `vec/slideInto`, `vec/reflectInto`, `vec/projectOn`, `vec/reflectAcrossNormal`,
  `vec/length`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vector-collision-response` (`apps/pixi-demo/src/examples/vector-collision-response`)
- 설명: incoming velocity handle을 drag해 wall normal에 대한 slide, bounce, tangent projection, normal reflection을
  같은 collision response 작업판에서 비교한다.

- reference: motion preview / interpolation scrubber
- 작업 흐름: motion interpolation workbench (point lerp, orbit rotate, direction slerp를 같은 t로 비교)
- 관련 함수: `vec/lerpInto`, `vec/rotateAroundInto`, `vec/slerpInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:motion-interpolation-workbench`
  (`apps/pixi-demo/src/examples/motion-interpolation-workbench`)
- 설명: 하단 t scrubber를 움직이면 point interpolation, pivot orbit, direction interpolation이 같은 progress로
  갱신된다. vector motion primitive 단독 예제는 이 workbench로 대표한다.

- reference: CAD/editor segment construction
- 작업 흐름: segment construction lab (angle origin, circle diameter, midpoint anchor, normal rib 비교)
- 관련 함수: `segment/fromAngleInto`, `segment/fromCircleInto`,
  `segment/fromMidpointAngleLengthInto`, `segment/fromNormalInto`, `segment/midpoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-construction-lab` (`apps/pixi-demo/src/examples/segment-construction-lab`)
- 설명: angle handle을 drag해 origin 기준 segment, circle diameter, midpoint anchored segment, base normal rib을
  같은 construction board에서 비교한다.

- reference: CAD/editor triangle construction and diagnostics
- 작업 흐름: triangle construction lab (equilateral, right, base/apex, base/height, centers, side classification)
- 관련 함수: `triangle/buildEquilateral`, `triangle/buildRight`, `triangle/fromSegmentApex`,
  `triangle/fromSegmentHeight`, `triangle/centroid`, `triangle/incenter`, `triangle/circumcenter`,
  `triangle/orthocenter`, `triangle/triangleFrom`, `triangle/isEquilateral`, `triangle/isIsosceles`,
  `segment/length`, `vec/distance`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-construction-lab` (`apps/pixi-demo/src/examples/triangle-construction-lab`)
- 설명: apex handle을 drag하며 여러 triangle constructor와 center diagnostics, side classification을 같은
  construction lab에서 비교한다.

- reference: UI frame layout, editor selection/group bounds
- 작업 흐름: rect layout workbench (include point, uniform inflate, split pane, union bounds 비교)
- 관련 함수: `rect/expandToIncludePointInto`, `rect/inflateInto`, `rect/halves`,
  `bounds/expandToIncludeBoundsInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-layout-workbench` (`apps/pixi-demo/src/examples/rect-layout-workbench`)
- 설명: 네 행에 selection grow, padding/margin inflate, split pane divider, group selection bounds를 배치하고
  각 행의 주황 handle을 drag하면 layout rect가 in-place로 다시 계산된다. 기존
  `rect-expand-to-include-point`, `rect-uniform-inflate`, `rect-halves-split`, `bounds-union-box` 단독 예제는
  기본 탐색에서 숨기고 이 workbench로 대표한다.

- reference: editor/game proximity debug overlay
- 작업 흐름: clearance closest point lab (probe와 장애물 사이 최근접점/clearance 비교)
- 관련 함수: `bounds/closestPoint`, `circle/distanceToPoint`, `triangle/closestPoint`, `path/closestPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:clearance-closest-point-lab`
  (`apps/pixi-demo/src/examples/clearance-closest-point-lab`)
- 설명: AABB, circle, triangle, path 네 행에 probe handle을 두고 drag하면 각 도형까지의 최근접점 또는
  clearance가 다시 계산된다. probe에서 nearest까지의 선분이 거리이고, circle 행은 keep-out zone 내부/경계에서
  clearance 0으로 contact 상태가 된다. 기존 `bounds-closest-point`, `circle-point-clearance`,
  `triangle-closest-point`, `path-closest-point` 단독 예제는 기본 탐색에서 숨기고 이 lab으로 대표한다.

- reference: game/editor collision debug overlay
- 작업 흐름: shape hitbox lab (pointer, circle, triangle, segment hitbox를 같은 판정판에서 비교)
- 관련 함수: `rect/containsPoint`, `intersects/intersectsCircleRect`,
  `intersects/intersectsRectTriangle`, `intersects/intersectsSegmentSegment`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:shape-hitbox-lab` (`apps/pixi-demo/src/examples/shape-hitbox-lab`)
- 설명: 네 개의 행에 UI zone, 원형 cursor, 삼각형 sprite hitbox, link segment crossing을 배치하고 각 행의
  주황 handle을 drag하면 해당 predicate가 다시 계산되어 hit/clear 색이 바뀐다. 핵심 목적은 leaf 함수
  하나씩을 따로 보여주는 것이 아니라, 실제 충돌 판정/디버그 화면에서 shape pair별 predicate를 고르는
  작업 흐름을 보여주는 것이다. 기존 `rect-contains-point`, `circle-rect-overlap`,
  `triangle-rect-overlap`, `segment-segment-cross` 단독 예제는 기본 탐색에서 숨기고 이 lab으로 대표한다.

- reference: 에디터 좌표를 device pixel 격자에 스냅 (crisp rendering / pixel snapping)
- 작업 흐름: pixel grid align (raw point를 device pixel 격자에 정렬, dpr로 격자 간격 조정)
- 관련 함수: `editor-geometry/pixelAlign`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:pixel-grid-align` (`apps/pixi-demo/src/examples/pixel-grid-align`)
- 설명: 확대한 device pixel 격자 위에서 raw point handle 1개만 drag한다. 핵심 관계는 "(raw point, dpr) →
  device-pixel aligned point" 1개뿐이다. `pixelAlign`은 `round(coord*dpr)/dpr`로 좌표를 device pixel(격자
  간격 `1/dpr`)에 정렬하므로, 아래 dpr knob(1·2·3)을 바꾸면 격자가 촘촘해지고 정렬 결과도 그 격자 교점에
  다시 붙는다. layout 격자/다른 object guide에 배치하는 `grid-snap-bracket`·`editor-snap-guides-lab`와 달리
  snap 대상이 **device pixel lattice**이고 간격이 `devicePixelRatio`로 결정된다는 점이 주제다. dpr knob은
  격자 간격을 설명하는 보조 control이지 두 번째 조작 대상이 아니다.

- reference: 내부 기준점에서 뻗은 선분의 경계 통과점 탐지 (editor boundary exit / 시야 경계 probe)
- 작업 흐름: segment ellipse exit (타원 내부 고정 anchor에서 뻗은 선분이 타원 경계를 통과하는 단일 exit point)
- 관련 함수: `intersects/singleIntersectionSegmentEllipse`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-ellipse-exit` (`apps/pixi-demo/src/examples/segment-ellipse-exit`)
- 설명: 타원과 내부 anchor A는 고정, 바깥 끝 B 1개만 drag한다. 핵심 관계는 "(segment, ellipse) → 단일 교점"
  1개뿐이다. `singleIntersectionSegmentEllipse`는 교점이 **정확히 1개일 때만** 점을 반환(0개 contained·2개
  가로지름이면 undefined)하므로, A를 내부에 고정해 "B 바깥 ⇒ exit point 1개 / B 안쪽 ⇒ contained" binary로
  유도해 그 semantic을 가르친다. 도형 겹침 boolean인 `ellipse-circle-overlap`·`ellipse-rect-overlap`이나 타원
  위 최근접점 `ellipse-closest-point`와 달리 경계 통과 **좌표**를 산출하고, 무한선 vs 원 `circle-infinite-line-hit`
  과 달리 finite segment vs ellipse의 "교점 정확히 1개" case가 주제다.

- reference: 곡선 path raycast, 곡선 segment 충돌점 탐지 (editor guide / game 시선판정)
- 작업 흐름: ray cubic hits (forward ray가 cubic Bezier 곡선과 만나는 교차점 산출)
- 관련 함수: `intersects/rayCubicIntersections`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ray-cubic-hits` (`apps/pixi-demo/src/examples/ray-cubic-hits`)
- 설명: 왼쪽 고정 emitter의 aim handle 1개만 drag한다. 핵심 관계는 "(ray, cubic 곡선) → 교차점들" 1개뿐이다.
  곡선은 고정(`bezierCurveTo`로 그림, renderer 책임)이고, `rayCubicIntersections`가 forward ray(tA ≥ 0) hit만
  남겨 곡선 위 명중점을 marker로 그린다. 빔이 곡선을 비껴가면 0개, S자 곡선을 가로지르면 최대 3개. ray vs
  직선/볼록 도형 boolean hit `ray-circle-hit`·`ray-bounds-hit`·`ray-segment-hit`와 달리 곡선 교차점 **좌표**를
  산출하고, 곡선 제어점/곡선-곡선 교차가 주제인 `bezier-intersection-workbench`·`bezier-control-inspector`와
  달리 곡선을 고정해 두고 ray가 주 조작 대상이다.

- reference: broad-phase collision AABB, dirty-rect, sprite world bounds (editor/game)
- 작업 흐름: rotated box AABB (회전된 객체를 감싸는 axis-aligned bounding box 산출)
- 관련 함수: `bounds/transform`, `matrix/rotationAroundPoint`, `matrix/transformPoints`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:bounds-rotated-aabb` (`apps/pixi-demo/src/examples/bounds-rotated-aabb`)
- 설명: 중심 둘레의 회전 handle 1개만 drag한다. 핵심 관계는 "(사각형, 회전 matrix) → AABB" 1개뿐이다.
  `rotationAroundPoint(center, angle)`로 중심 회전 matrix를 만들고, `transformPoints`로 회전된 네 꼭짓점
  (입력 시각화)을, `bounds/transform`으로 그 꼭짓점을 감싸는 AABB(출력)를 구한다. 0°·90°에서 AABB는
  원래 사각형과 같고 45° 근처에서 가장 크게 부푼다. 합집합 bounds `group-bounds`·`bounds-union-box`와
  달리 단일 객체 변환 AABB이고, matrix 변환 자체가 주제인 `matrix-*`·`transform-handles`·`rotate-handle`와
  달리 변환 결과 AABB가 중심 출력이다.

- reference: CSS `object-fit: contain` / `object-fit: cover`, 이미지/썸네일 배치
- 작업 흐름: content fit workbench (같은 frame에서 contain은 letterbox, cover는 overflow crop)
- 관련 함수: `rect/fitInside`, `rect/fitOutside`, `matrix/fitRect`, `matrix/transformPointInto`, `matrix/transformBounds`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:content-fit-workbench` (`apps/pixi-demo/src/examples/content-fit-workbench`)
- 설명: 같은 content rect와 같은 draggable frame을 두고 contain/cover를 나란히 비교한다. contain은
  `fitInside`와 `fitRect`로 전체 콘텐츠를 frame 안에 보존해 letterbox를 만들고, cover는 `fitOutside`로
  frame을 완전히 덮은 뒤 mask로 넘친 영역을 crop한다. 함수 자체보다 이미지/썸네일 배치에서 contain과
  cover를 고르는 실제 작업 흐름이 주제다. 기존 `frame-fit-content`와 `rect-cover-fit` 단독 예제를 이
  예제로 통합했다.

- reference: `figma`, `geogebra`, editor의 star/burst shape 작성
- 작업 흐름: star polygon spikes (outer/inner 두 반지름 교차로 별 외곽선 구성 = star polygon vertices)
- 관련 함수: `polygon/starPolygon`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:star-polygon-spikes` (`apps/pixi-demo/src/examples/star-polygon-spikes`)
- 설명: 위쪽 슬라이더로 inner/outer 반지름 비율(r/R)만 drag한다. 핵심 관계는 "두 반지름의 교차에서
  별 꼭짓점을 구성한다" 1개뿐이다. `starPolygon(center, R*ratio, R, points)`이 outer/inner 교차
  꼭짓점 `2*points`개로 별 외곽선을 만들고, 비율을 줄이면 더 뾰족한 별, 1.0에 가까우면 정 2N각형에
  근접함을 보인다. 변 수 N을 바꾸는 `regular-polygon-construct`와 달리 별 고유 파라미터인 inner
  비율이 주 변수다.

- reference: 경로 추종/오토파일럿 HUD
- 작업 흐름: cross-track deviation (고정 진행선에 대한 차량의 수직 편차 = cross-track error)
- 관련 함수: `vec/rejectFrom`, `vec/sub`, `vec/length`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:cross-track-deviation` (`apps/pixi-demo/src/examples/cross-track-deviation`)
- 설명: 화면을 가로지르는 고정 heading 직선과 그 위 anchor를 두고, 차량 점 1개만 drag한다. 핵심
  관계는 "변위에서 heading 방향 성분을 제거한 수직 편차" 1개뿐이다. `sub(vehicle, anchor)`로 변위
  `d`를 얻고 `rejectFrom(d, heading)`으로 heading에 수직인 성분(cross-track error 벡터)을 분리한다.
  `sub(vehicle, rej)`로 편차를 빼면 진행선 위 최근접점(foot)이 나오고, `length(rej)`이 진행선까지의
  직각 거리다. 화면에는 차량→foot 수선 1개만 그려 단일 관계를 유지하고, along-track(projection)
  거리는 두 번째 관계라 표시하지 않는다(`vec-scalar-projection`이 담당). diagnostics는
  cross-track(px)·side(left/right) 2개이며 side는 같은 편차의 부호를 plain 스칼라(heading×d cross
  부호)로 읽은 표시일 뿐 별도 API가 아니다. `rejectFrom`은 그동안 어떤 예제에서도 쓰이지 않은
  uncovered leaf였고, 이 예제가 첫 연결이다. 형제 구별: `vector-projection-reflection-lab`은
  projection과 reflection을 함께 다루는 legacy lab이고, 이 예제는 그중 수직 성분(rejection) 단일
  관계만 떼어낸 focused 예제다. heading은 고정 단위벡터이고 차량은 화면 안 px로 clamp해 입력이 항상
  finite다. 결과를 프레임마다 한 번 그리는 데만 쓰고 buffer를 hot-path로 재사용하지 않으므로
  allocating companion(`sub`, `rejectFrom`)을 그대로 쓴다. `@cp949/vectra/vec` namespace는 기존
  예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `unity`, 계기/HUD 위젯
- 작업 흐름: remap gauge needle (선형 입력 노브 위치 → 계기 바늘 각도, 입력 범위와 출력 범위가 서로 다른 선형 변환)
- 관련 함수: `math/remap`, `math/clamp`, `vec/fromAngle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:remap-gauge-needle` (`apps/pixi-demo/src/examples/remap-gauge-needle`)
- 설명: pivot 위 게이지 호와 그 아래 수평 입력 트랙을 두고, 트랙 위 노브 1개를 좌우로 drag하면 그
  px 위치를 `remap(knobX, trackL, trackR, A_START, A_END)`으로 바늘 각도 범위로 선형 변환한다. 핵심
  관계는 노브 위치 → 바늘 각도 1개뿐이고, 입력 범위(px)와 출력 범위(radian)가 서로 다르다는 점이
  remap의 요지다. 노브를 트랙 양끝 너머로 끌면 `remap`이 clamp하지 않으므로 raw 바늘이 호 밖으로
  외삽되고, 같은 순간 `clamp(knobX, trackL, trackR)`을 같은 remap에 넣은 marker는 호 끝에 고정돼
  외삽 vs clamp 두 정책을 한 장면에서 대비한다(`inverse-lerp-track`의 raw vs clamped 패턴 계승).
  `vec/fromAngle`이 각도 → 단위 방향으로 바늘 끝점을 잡는다. 형제 구별: `inverse-lerp-track`은 한
  number line에서 값→비율 t를 읽고, `angle-snap-dial`/`angle-octant-dial`/`angle-unit-compass`는
  각도 자체를 양자화/분류하지만, 여기서는 angle이 선형 입력의 remap 출력일 뿐 양자화하지 않는다.
  diagnostics는 pos(%)·angle(°)·state(in range/extrapolated) 3개로 같은 remap 관계의 분해 읽기이고
  `PIXI.Text`로만 출력한다. pos(%)는 트랙 비율을 plain 산술로 읽은 표시이지 별도 단위 remap이 아니다
  (두 번째 관계 금지). 노브 x를 화면 안으로 clamp해 remap 입력은 항상 finite, source range는
  `trackL < trackR` 고정이라 충족한다. `remap`/`clamp`는 number 반환이라 `*Into` companion이 없어
  그대로 호출하고, drag 시에만 state를 갱신해 ticker render는 저장 state만 그린다. 이 예제는
  `math/remap`을 단독 주제로 가르치는 연결이다. `@cp949/vectra/math`·`@cp949/vectra/vec` namespace는 기존
  예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, 공학 단면 계산
- 작업 흐름: circle tank fill (수평 원통 탱크/파이프 단면이 수위에 따라 채워지는 활꼴 단면적 = circular segment area)
- 관련 함수: `circle/segmentArea`, `circle/area`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-tank-fill` (`apps/pixi-demo/src/examples/circle-tank-fill`)
- 설명: 화면 중앙 고정 원(원통 탱크 단면)에 수위 선 1개를 두고 위아래로 drag하면, 바닥에서의 깊이
  d로 잠긴 호의 중심각 θ = 2·acos((R−d)/R)을 plain JS로 유도해 `segmentArea(circle, θ)`이 수면 아래
  잠긴 활꼴 단면적 A = ½·r²·(|θ|−sin|θ|)를 매 drag마다 다시 구하고, 그 영역을 채워 그린다. 핵심
  관계는 수위 → 잠긴 활꼴 단면적 1개뿐이다. `segmentArea`가 |θ| 기준이고 θ>π에서 major segment를
  정상 반환하므로 절반 초과 수위(d>R)도 분기 없이 맞다. fill %는 같은 단면적을 disk 대비 비율로 읽은
  분해라 분모로 `area`(πr²)만 추가로 쓴다. 수면 선(현)은 렌더링으로만 그리고 폭을 `chordLength`로
  계산해 찍지 않는다(두 번째 관계 금지). 형제 circle 예제와 구별: 두 반지름과 호가 감싼 부채꼴 넓이
  `circle-sector-area`(`sectorArea`, ½·r²·|θ|), 현에서 호 정점까지의 높이 `circle-sagitta`
  (`sagitta`, r(1−cos(θ/2)))와 달리 여기서는 현(수면)과 호가 감싼 **활꼴의 넓이**가 중심이고,
  인터랙션도 둘레 endpoint 핸들 drag가 아니라 수직 수위 선 drag다. diagnostics는 depth(px)·area(px²)·
  fill(%) 3개로 모두 같은 활꼴 단면적 관계의 분해 읽기이고 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  원은 고정 R>0·수위는 clamp 후 `acos`로 유도해 항상 finite이므로 `segmentArea`/`area`의 empty
  circle(r<=0 → 0) 경로는 미발생한다. scalar(number) 반환이라 `*Into` companion이 없어 그대로 호출하고
  ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다. `circle/segmentArea` leaf의 첫
  연결이다. `@cp949/vectra/circle` namespace는 다른 circle 예제가 이미 sandbox allowlist 2배열에
  등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `unity`, `figma`
- 작업 흐름: angle average direction (여러 방향각의 원형 평균 = circular mean of directions, ±180° 경계를 넘어 합성)
- 관련 함수: `angle/averageAngle`, `angle/fromVector`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:angle-average-direction` (`apps/pixi-demo/src/examples/angle-average-direction`)
- 설명: 화면 중앙 고정 center 둘레 ring에 방향 핸들 3개를 두고, 가장 가까운 핸들을 ring 위로 투영하며
  drag하면 각 핸들의 center 기준 방향각을 `fromVector`로 구해 `averageAngle([a0,a1,a2])`이 세 방향의
  원형 평균(sin 합·cos 합 방향)을 매 프레임 다시 구해 밝은 needle로 그린다. 핵심 관계는 N개 방향각의
  원형 평균 방향 1개뿐이다. 같은 입력의 단순 산술평균 `(a0+a1+a2)/3`은 plain JS로 계산한 ghost
  needle로 흐리게 겹쳐 그려, +170°/-160°처럼 ±180° 경계를 가로지르는 방향에서 산술평균이 엉뚱한 쪽을
  가리키는 동안 원형 평균은 올바른 합성 방향을 가리키는 대비를 보인다(ghost는 같은 원형 평균 관계가
  왜 필요한지 설명하는 분해 표시이지 두 번째 vectra 관계가 아니다 — wrap 보정을 일부러 하지 않는다).
  형제 angle 예제와 구별: 두 각 사이 방향이 정해진 sweep 크기 `angle-directed-sweep`(`sweepAngle`),
  두 각 최단 호 이등분 `angle-bisect-shortest`(`bisectAngle`), 한 각 분류/가공
  `angle-octant-dial`(`octant`)·`angle-snap-dial`(`snapAngle`)·`angle-clamp-range`(`clampAngle`)와 달리
  여기서는 **여러 각을 하나로 합치는 원형 평균**이 중심이다. diagnostics는 mean(deg)·naive(deg)·
  delta(deg, 두 평균 최단 각차) 3개로 모두 같은 원형 평균 관계의 분해 읽기이고 `PIXI.Text`로만 출력한다
  (`g.text` 미사용). 핸들은 항상 3개(비지 않음)·각은 `fromVector`(atan2) 결과라 항상 finite이므로
  `averageAngle`의 empty/ non-finite `RangeError`는 미발생하고, 완전 상쇄(sin/cos 합 0 → 0 반환)
  degenerate는 주석으로만 둔다(억지 throw 금지). scalar(number) 반환이라 `*Into` companion이 없어 그대로
  호출하고 ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다. `angle/averageAngle`·
  `angle/fromVector` leaf의 첫 연결이다. `@cp949/vectra/angle` namespace는 다른 angle 예제가 이미 sandbox
  allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `figma`, `unity`
- 작업 흐름: angle directed sweep (고정 시작각에서 끝각까지 한 방향(CCW)으로 휩쓴 회전량과 major/minor arc 분류 = directed angular sweep + reflex detection)
- 관련 함수: `angle/sweepAngle`, `angle/isReflexSweep`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:angle-directed-sweep` (`apps/pixi-demo/src/examples/angle-directed-sweep`)
- 설명: 화면 중앙 고정 피벗에 고정 시작 ray(from)를 두고 끝 ray 핸들 1개를 피벗 둘레로 drag하면
  `sweepAngle(from, to, 'ccw')`가 from에서 to까지 CCW 방향으로 휩쓴 회전량 s를 `[0, 2π)`로 매 프레임
  다시 구해 그 각폭만큼 wedge를 채운다. 핵심 관계는 두 각 사이의 방향이 정해진 sweep 크기 s 하나뿐이다.
  `isReflexSweep(from, to, 'ccw')`는 같은 sweep이 반원(π)을 넘는 major arc인지 판정해 wedge 강조 색을
  가르는 같은 관계의 분해 판정이지 두 번째 관계가 아니다(채운 wedge·호 stroke·시작/끝 ray·핸들도 모두
  같은 s의 분해 표시). pixi `arc`가 증가 각 방향으로 그리므로 `arc(from, from+s)` span이 정확히 s가
  되도록 그려 끝각 ray가 핸들 방향(to)과 시각적으로 일치한다. 형제 angle 예제와 구별: 두 각 **최단
  호**(≤π)를 **각 1개**로 이등분하는 `angle-bisect-shortest`(`bisectAngle`), 한 각을 8등분면 bucket으로
  **분류**하는 `angle-octant-dial`(`octant`), 한 각을 눈금/구간으로 가공하는
  `angle-snap-dial`(`snapAngle`)·`angle-clamp-range`(`clampAngle`)와 달리 여기서는 **두 각 사이 방향이
  정해진 [0,2π) sweep 크기 + reflex 분류**가 중심이다. CW sweep 토글
  (`clockwiseSweep`/`counterClockwiseSweep`)은 두 번째 조작/관계가 되어 복잡도 gate에 걸리므로 CCW 한
  방향만 유지한다(두 번째 API 미추가). diagnostics는 sweep(deg)·reflex(yes/no)·direction(ccw) 3개로 모두
  같은 sweep의 분해 읽기이고 `PIXI.Text`로만 출력한다(`g.text` 미사용). from은 고정 finite·to는 atan2
  (화면 clamp 핸들) 결과라 항상 finite이므로 `sweepAngle`/`isReflexSweep`의 non-finite `RangeError`는
  미발생하고 degenerate(`from===to`·full-turn → s=0, reflex=false)는 주석으로만 둔다(억지 throw/ warn 색
  금지). scalar(number/boolean) 반환이라 `*Into` companion이 없어 그대로 호출하고 ticker render는 저장
  state만 그려 프레임당 vectra 할당이 없다. `angle/sweepAngle`·`angle/isReflexSweep` leaf의 첫 연결이다.
  `@cp949/vectra/angle` namespace는 다른 angle 예제가 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `figma`, `unity`
- 작업 흐름: infinite line point distance (점에서 양방향 무한 직선까지의 부호 없는 수직 거리 = point-to-infinite-line distance, 내부 영역 없음)
- 관련 함수: `infinite-line/distanceToPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:infinite-line-point-distance` (`apps/pixi-demo/src/examples/infinite-line-point-distance`)
- 설명: 화면 고정 무한 직선(양방향 guide line)과 점 핸들 P 1개를 두고, P를 drag하면
  `distanceToPoint(line, P)`이 점에서 직선까지의 부호 없는 수직 거리 d를 매 프레임 다시 계산한다. P를
  직선 가까이 끌면 d가 줄어 contact 색으로 전환돼 "이 점이 기준 guide line에서 얼마나 벗어나
  있는가"(alignment / proximity probe) 작업 흐름을 보인다. 핵심 관계는 점 → 무한 직선 수직 거리 d
  하나뿐이다. 핵심 구별점은 **양방향 무한 직선이라 d=0이 직선 위 한 점뿐이고 "내부 영역"이
  없다**는 것이다: 같은 `distanceToPoint` 이름을 쓰는 영역 clearance `circle-point-clearance`·
  `bounds-point-clearance`·`triangle-point-clearance`는 입력이 면적이라 내부면 0인 반면 여기서는
  직선이라 내부가 없다. 부호 있는 거리 + side + foot + 두 직선 교점을 한 화면에 묶는 다중 관계
  workbench `infinite-line-diagnostics-lab`(`signedDistanceToPoint`·`side`·`projectPoint`·
  `singleIntersection`)와 정반대로 여기서는 단일 unsigned scalar 거리 하나만 중심 출력이고, 직선/ray
  위 **점**(foot)을 반환하는 `segment-supporting-line-foot`(`nearestPointOnSupportingLine`)·
  `ray-closest-point`(`closestPoint`)·forward ray **boolean** membership `ray-contains-point`
  (`containsPoint`)와도 출력 성격이 다르다. 직선 위 수선의 발·foot→P 수직 선분·직각 marker는 단일
  거리 d의 분해 표시이지 두 번째 관계가 아니다. foot는 `distanceToPoint`이 쓰는 것과 같은 투영
  산술을 inline으로 구해 `projectPoint`(두 번째 API)를 끌어오지 않는다(두 번째 API 미추가). contact
  색은 거리 ≤ visual tol(`ON_LINE_TOL`, 색 표시 전용)일 때만 켜고 보고하는 d는 항상 참 거리다(tol은
  `distanceToPoint` 인자가 아님). 별도 domain import 없이 단일 infinite-line domain을 유지하고 직선은
  object literal(`{origin, direction}`), P는 `{x, y}`로 구성한다. degenerate(`directionLengthSq===0`
  →origin-point 거리, 고정 non-zero direction이라 미발생)·NaN/Infinity 좌표(P 화면 clamp + 고정
  finite 직선이라 미발생)는 주석으로만 둔다. `distanceToPoint`은 finite 입력에서 throw하지 않아 라이브
  warn 색을 억지로 만들지 않는다(`circle-point-clearance`·`triangle-point-clearance` 선례).
  diagnostics는 d·status 2개만 표시한다. number를 직접 반환해 `*Into` companion이 없어 그대로
  호출하고, ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다. 영역 clearance
  `circle-point-clearance`·`bounds-point-clearance`·`triangle-point-clearance`, 다중 관계
  `infinite-line-diagnostics-lab`, 직선/ray 위 점 `segment-supporting-line-foot`·`ray-closest-point`,
  forward ray boolean `ray-contains-point`과 분리한 "점 → 무한 직선 수직 거리(point-to-infinite-line
  distance)" 단일 개념 예제로, `infinite-line/distanceToPoint` leaf의 첫 연결이다. diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/infinite-line` namespace는
  `infinite-line-diagnostics-lab`·`circle-infinite-line-hit`가 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `unity`, `pixijs`, `geogebra`
- 작업 흐름: ray contains point (점이 forward ray 위에 허용 오차 안에서 + origin 앞쪽에 놓였는지 판정 = ray pick / hit-test with tolerance)
- 관련 함수: `ray/containsPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ray-contains-point` (`apps/pixi-demo/src/examples/ray-contains-point`)
- 설명: 화면 고정 forward ray(origin O + 고정 방향)와 질의 점 핸들 P 1개를 두고, P를 drag하면
  `containsPoint(ray, P, tol)`이 "P가 ray 위에 허용 오차 tol 안에서, 그리고 forward(`t≥0`)에 있는가"를
  매 drag마다 boolean으로 판정한다. P가 허용 band 안이면서 O 앞쪽일 때만 on(true)이 되고, band를
  벗어나거나 O 뒤로 끌면 off(false)가 되어 "포인터/탭이 시선·레이저·발사 경로(ray) 위에 허용 오차
  안에서 놓였는지 판정한다"(ray pick / hit-test with tolerance) 작업 흐름을 보인다. 핵심 관계는 점 P →
  forward ray membership(boolean) 하나뿐이다. 핵심 구별점은 **출력이 점이나 거리가 아니라 boolean
  membership이고 forward(`t≥0`)만 포함**한다는 것이다: 같은 고정 ray·점 핸들 drag를 쓰는 형제
  `ray-closest-point`(`closestPoint`, ray 위 최근접점 **점** 출력)와 정반대로 여기서는 boolean 한 개가
  중심 출력이고, ray×도형 교차 boolean을 주는 hit-test 패밀리(`ray-circle-hit`·`ray-segment-hit`·
  `ray-bounds-hit`)와 달리 입력이 도형이 아니라 **점**이며 forward 1D corridor membership이다.
  triangle/rect의 영역 membership `triangle-contains-point`·`rect-contains-point`와 같은 boolean 판정
  패턴이지만 "영역"이 면이 아니라 두께 tol의 **forward 직선 corridor**라는 점이 다르다. 허용 band(±tol
  corridor)·P→supporting line 수직 drop line·backward 연장선은 단일 membership 판정의 분해 표시이지
  두 번째 관계가 아니다. epsilon 기본값 `1e-9`는 화면상 의미가 없어 시각 tol(12px)을 명시 전달해
  `containsPoint`의 epsilon 파라미터 역할(허용 오차)을 드러낸다. `t`(부호 있는 투영 parameter, 음수면
  origin 뒤)·`perp`(supporting line까지 수직 거리)는 같은 membership 판정을 parameter·거리로 읽은
  inline 분해 diagnostics이지 두 번째 관계가 아니다. perp는 supporting line까지의 **unclamped** 수직
  거리라 t를 `[0,∞)`로 clamp하는 거리 함수로 대체할 수 없어 inline 산술로 도출하고, t도 같은 투영
  계산에서 inline으로 얻어 두 번째 API를 끌어오지 않는다(두 번째 API 미추가). 별도 domain import 없이
  단일 ray domain을 유지하고 ray는 object literal(`{origin, direction}`), P는 `{x, y}`로 구성한다.
  degenerate ray(`directionLengthSq===0`)→origin 일치 여부로 환원(고정 non-zero direction이라 미발생)·
  NaN/Infinity 좌표(P 화면 clamp + 고정 finite ray라 미발생)는 주석으로만 둔다. `containsPoint`은 finite
  입력에서 throw하지 않아 라이브 warn 색을 억지로 만들지 않는다(off는 회색 중립 전환, warn 아님;
  `ray-closest-point`·`vec-clamp-region` 선례). diagnostics는 status·t·perp 3개만 표시한다. boolean을
  직접 반환해 `*Into` companion이 없어 그대로 호출하고, ticker render는 저장 state만 그려 프레임당
  vectra 할당이 없다. ray 위 최근접점 `ray-closest-point`(`closestPoint`), ray×도형 교차
  `ray-circle-hit`·`ray-segment-hit`·`ray-bounds-hit`, 영역 membership `triangle-contains-point`·
  `rect-contains-point`와 분리한 "점 → forward ray membership(hit-test with tolerance)" 단일 개념
  예제로, `ray/contains-point` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/ray` namespace는 `ray-closest-point`·`ray-cast` 등이 이미 sandbox allowlist
  2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `unity`, `geogebra`
- 작업 흐름: triangle point clearance (점에서 삼각형 keep-out 영역까지의 부호 없는 최단 여유 거리 = point-to-triangle clearance, 내부면 0)
- 관련 함수: `triangle/distanceToPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-point-clearance` (`apps/pixi-demo/src/examples/triangle-point-clearance`)
- 설명: 화면 고정 non-degenerate scalene 삼각형 keep-out 영역과 점 핸들 P 1개를 두고, P를 drag하면
  `distanceToPoint(triangle, P)`이 점에서 삼각형 영역까지의 부호 없는 최단 여유 거리 d를 매 프레임 다시
  계산한다. P가 영역 밖이면 가장 가까운 변까지의 gap이 곧 d이고, P를 영역 안으로 끌면 d=0이 되어
  contact 색으로 전환돼 "이 점이 삼각형 금지 구역에서 얼마나 떨어져 있는가, 닿았는가"(clearance /
  proximity probe) 작업 흐름을 보인다. 핵심 관계는 점 → 삼각형 영역 여유 거리 d 하나뿐이다. 핵심
  구별점은 **출력이 점(closestPoint)이나 boolean(containsPoint)이 아니라 scalar 여유 거리(내부면 0)**
  라는 것이다: 같은 삼각형·동일 drag 상호작용을 쓰는 trio에서 형제 `triangle-closest-point`
  (`closestPoint`, 점 출력)·`triangle-contains-point`(`containsPoint`, boolean 출력)와 출력 성격만
  다르고, 영역이 사각형(AABB)인 `bounds-point-clearance`(`bounds/distanceToPoint`)·원인
  `circle-point-clearance`(`circle/distanceToPoint`)와 같은 clearance 패밀리지만 입력 영역이
  **삼각형**이라 최근접 feature가 변(edge) 또는 꼭짓점(vertex)에 안착한다. 둘레 위 최근접점 foot·
  clearance 선분·edge label(AB/BC/CA)은 단일 거리 d의 분해 표시이지 두 번째 관계가 아니다. foot는 세
  변 segment를 `[0,1]` clamp한 inline 점 중 최소 거리로 구하고 `closestPoint`를 호출하지 않는다
  (두 번째 API 미추가, distanceToPoint의 edge 환원과 같은 산술). 별도 domain import 없이 단일 triangle
  domain을 유지하고 삼각형은 `{a,b,c}`, P는 `{x,y}` object literal로 구성한다. 내부/경계→0(throw 없이
  valid 반환, 붕괴 아님; inside면 clearance 선분 미표시)·collinear→segment 환원·세 vertex 동일→vertex
  거리·NaN/Infinity 좌표(P 화면 clamp + 고정 non-degenerate 삼각형이라 미발생)는 주석으로만 둔다.
  `distanceToPoint`은 finite·non-degenerate 입력에서 throw하지 않고 내부에서 0을 valid 반환하므로
  라이브 warn 색을 억지로 만들지 않는다(내부 0은 contact 색 전환으로 자연스럽게 드러난다,
  `circle-point-clearance`·`bounds-point-clearance` 선례). diagnostics는 d·status·edge 3개만 표시한다.
  number를 직접 반환해 `*Into` companion이 없어 그대로 호출하고, ticker render는 저장 state만 그려
  프레임당 vectra 할당이 없다. 삼각형 위 최근접 point `triangle-closest-point`(`closestPoint`),
  점∈삼각형 boolean `triangle-contains-point`(`containsPoint`), 점→사각 영역 여유 거리
  `bounds-point-clearance`(`bounds/distanceToPoint`), 점→원형 zone 여유 거리 `circle-point-clearance`
  (`circle/distanceToPoint`)와 분리한 "점 → 삼각형 영역 여유 거리(clearance)" 단일 개념 예제로,
  `triangle/distanceToPoint` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/triangle` namespace는 `triangle-closest-point`·`triangle-contains-point` 등이
  이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `figma`, `unity`
- 작업 흐름: circle sector area (중심각으로 결정되는 부채꼴 영역의 넓이 = circular sector area)
- 관련 함수: `circle/sectorArea`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-sector-area` (`apps/pixi-demo/src/examples/circle-sector-area`)
- 설명: 화면 고정 원(center C + 반지름 R)과 고정 부채꼴 시작 반지름을 두고, 끝 반지름 핸들 B 1개를
  원 둘레로 drag하면 `sectorArea(circle, θ)`가 두 반지름과 호가 둘러싼 부채꼴 넓이 A = ½·r²·|θ|를 매
  drag마다 다시 구한다. B를 옮기면 중심각 θ와 채워진 부채꼴 영역이 함께 자라/줄어 "두 반지름 사이
  호가 감싼 영역의 넓이를 구한다"(circular sector area) 작업 흐름을 보인다. 채워진 wedge 자체가
  반환된 넓이 A의 영역 표시다. 핵심 관계는 중심각 θ → 부채꼴 넓이 A 하나뿐이다. 핵심 구별점은
  **출력이 1D 높이(sagitta)나 거리가 아니라 2D 영역의 넓이**라는 것이다: 같은 drag 상호작용을 쓰는
  형제 `circle-sagitta`(`sagitta`)가 θ → 활꼴 높이(현→호 1D 거리, 시각이 선분)인 반면 sector-area는
  θ → 넓이(2D, 시각이 채워진 wedge)이고, 두 원 둘레 사이 거리 `circle-circle-clearance`·점→원 거리
  `circle-point-clearance`(`distanceToCircle`·`distanceToPoint`, clearance)·세 점 외접원
  `circle-from-three-points`(`fromThreePoints`)·접선 구성 `circle-tangent-construction`과도 출력
  성격(넓이 vs 거리/도형)이 다르다. θ°·area·fill(% = θ/2π)은 같은 단일 sector 관계를 입력 각·출력
  넓이·disk 대비 비율로 읽은 분해 diagnostics이지 두 번째 관계가 아니고, 채워진 wedge·두 반지름·호도
  같은 출력의 분해 표시이지 두 번째 관계가 아니다. fill%는 `θ/2π` inline으로 구해 disk-area API
  (`area`)를 끌어오지 않는다(두 번째 API 미추가). 별도 domain import 없이 단일 circle domain을
  유지하고 원은 object literal(`{center, radius}`), 시작점·B는 inline 산술로 구성한다. empty circle
  (`radius ≤ 0`)→0(고정 양수 R이라 미발생)·θ→0(B→시작, A→0)·θ→2π(A→πR², 전체 disk)·NaN/Infinity
  centralAngle pass-through(B 화면 clamp + 고정 finite 원이라 atan2 항상 finite, 미발생)는 주석으로만
  둔다. `sectorArea`는 finite 입력에서 throw하지 않아 라이브 warn 색을 억지로 만들지 않는다
  (`circle-sagitta`·`regular-polygon-construct` 선례). diagnostics는 theta·area·fill 3개만 표시한다.
  number를 직접 반환해 `*Into` companion이 없어 그대로 호출하고, ticker render는 저장 state만 그려
  프레임당 vectra 할당이 없다. 활꼴 높이 `circle-sagitta`(`sagitta`), 두 원/점 거리
  `circle-circle-clearance`·`circle-point-clearance`, 세 점 외접원 `circle-from-three-points`, 접선
  구성 `circle-tangent-construction`과 분리한 "중심각 → 부채꼴 넓이(circular sector area)" 단일 개념
  예제로, `circle/sectorArea` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/circle` namespace는 `circle-sagitta`·`circle-point-clearance` 등이 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `unity`, `figma`
- 작업 흐름: angle octant dial (입력 방향을 8개 45° 부채꼴 중 어느 등분면(0..7)에 속하는지 분류 = direction sector classification)
- 관련 함수: `angle/octant`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:angle-octant-dial` (`apps/pixi-demo/src/examples/angle-octant-dial`)
- 설명: 화면 중앙 고정 피벗 둘레에 8개 45° 부채꼴을 깔고, 입력 needle 핸들 1개를 피벗 둘레로 drag하면
  `octant(angle)`이 그 방향이 어느 등분면 bucket(0..7)에 속하는지 매 프레임 분류해 활성 부채꼴 하나만
  밝게 강조한다. needle은 항상 강조 부채꼴 안에 놓여 "방향을 8등분면 중 하나로 분류한다"(direction
  sector classification) 작업 흐름을 보인다. 핵심 관계는 angle → octant bucket index 하나뿐이다. 핵심
  구별점은 **출력이 양자화된 각이 아니라 이산 분류 index(0..7)**라는 것이다: needle을 가까운 눈금 각으로
  이동시키는 `angle-snap-dial`(`snapAngle`)과 달리 octant는 needle을 그대로 두고 어느 부채꼴에 속하는지만
  판정하고, 허용 구간 경계로 clamp하는 `angle-clamp-range`(`clampAngle`)·두 각 중점을 구성하는
  `angle-bisect-shortest`(`bisectAngle`)와 달리 단일 각의 이산 분류다. (x, y) 부호 기반 4사분면을
  분류하는 `vec-quadrant`(`vec/quadrant`)와 달리 입력이 각(radian)이고 8등분면(45° bucket)이며,
  vec-quadrant가 축 위 degenerate에서 `0`을 반환하는 것과 달리 octant는 `wrapRadiansPositive` 기준
  half-open bucket이라 경계각이 다음 bucket에 포함되고 항상 0..7을 반환한다(축 degenerate 없음). 8개
  부채꼴 fill·경계 spoke·needle은 같은 단일 octant 출력의 분해 표시이지 두 번째 관계가 아니다. 부채꼴
  그리기와 octant 함수가 같은 `wrapRadiansPositive` 기준 각이라 강조 부채꼴이 항상 needle을 포함한다
  (별도 좌표 보정 없음, 두 번째 API 미추가). angle°·octant(0..7)·range([lo,hi)°)는 같은 octant 관계를
  입력 각·분류 index·bucket 경계로 읽은 분해 diagnostics이지 두 번째 관계가 아니고, range는 `idx`에서
  inline 도(degree) 환산으로 구한다. 별도 domain import 없이 단일 angle domain을 유지하고 피벗·needle은
  inline 산술로 구성한다. 경계각은 half-open이라 다음 bucket에 포함되고 `2π` equivalent는 `0`(붕괴 아님,
  정상 분류)·non-finite → RangeError(atan2 화면 clamp 핸들이라 항상 finite, 미발생)는 주석으로만 둔다.
  `octant`은 finite 입력에서 throw하지 않아 라이브 warn 색을 억지로 만들지 않는다(`angle-clamp-range`·
  `angle-snap-dial` 선례). diagnostics는 angle·octant·range 3개만 표시한다. number(0..7)를 직접 반환해
  `*Into` companion이 없어 그대로 호출하고, ticker render는 저장 state만 그려 프레임당 vectra 할당이
  없다. 눈금 snap `angle-snap-dial`(`snapAngle`)·구간 clamp `angle-clamp-range`(`clampAngle`)·두 각
  이등분 `angle-bisect-shortest`(`bisectAngle`)·4사분면 분류 `vec-quadrant`(`vec/quadrant`)와 분리한
  "각 → 8등분면 이산 분류(direction sector classification)" 단일 개념 예제로, `angle/octant` leaf의 첫
  연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/angle` namespace는
  `angle-clamp-range`·`angle-snap-dial`·`angle-bisect-shortest` 등이 이미 sandbox allowlist 2배열에
  등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `figma`, `unity`
- 작업 흐름: angle bisect shortest (두 각 사이 더 짧은 호를 절반으로 가르는 이등분 각 = shortest-path angle bisector)
- 관련 함수: `angle/bisectAngle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:angle-bisect-shortest` (`apps/pixi-demo/src/examples/angle-bisect-shortest`)
- 설명: 화면 중앙 고정 피벗에 고정 기준 ray A와 입력 ray B 핸들 1개를 두고, B를 피벗 둘레로 drag하면
  `bisectAngle(A, b)`가 A와 b 사이의 **더 짧은 호**를 정확히 절반으로 가르는 이등분 각 m을 매 프레임
  다시 계산한다. B를 어느 쪽으로 끌든 이등분선은 항상 두 ray 사이의 짧은 호 한가운데에 놓여 "두
  방향 사이의 (최단 경로) 각 이등분선을 구한다"는 classic angle bisector 작업 흐름을 보인다. 핵심
  관계는 (A, b) → 최단 호 이등분 각 하나뿐이다. 핵심 구별점은 **두 각의 최단 호 이등분 구성**이라는
  것이다: N개 각의 원형 평균(sin/cos 합 방향)을 구하는 `angle/averageAngle`과 달리 입력이 두 각이고
  출력이 shortest signed delta의 절반이라 항상 더 짧은 호 위에 놓이며(averageAngle은 N≥2 임의 개수에
  vector mean이고 완전 상쇄 시 0 반환), 입력을 허용 구간 경계로 clamp하는 `angle-clamp-range`
  (`clampAngle`)·고정 눈금으로 양자화하는 `angle-snap-dial`(`snapAngle`)·한 각을 목표로 t 보간 회전
  하는 `angle-heading-turn`(`moveTowardAngle`/`lerpAngle`)과도 관계가 다르다(clamp/snap/보간 아닌
  중점 구성). input b°·bisect m°·half(|delta|/2)°는 같은 단일 bisectAngle 출력을 입력각·결과각·절반
  호 크기로 읽은 분해 diagnostics이지 두 번째 관계가 아니고, 짧은 호 wedge·두 절반 호(A→m, m→b 같은
  색으로 |A→m|=|m→b| 드러냄)·기준/입력/이등분 needle도 같은 출력의 분해 표시이지 두 번째 관계가
  아니다. delta는 `2 * (m - A)` inline으로 도출해(`bisectAngle`이 결과를 wrap하지 않아 항등 성립)
  `angleDelta`를 재호출하지 않는다(두 번째 API 미추가). 별도 domain import 없이 단일 angle domain을
  유지하고 피벗·기준각·needle은 inline 산술로 구성하며 도 환산도 inline이다. antipodal(`|delta|=π`)→
  `angleDelta` 정책상 `-π`로 감겨 이등분선이 CW 90° 쪽으로 결정되고 drag로 antipodal을 가로지르면 더
  짧은 호가 반대편으로 바뀌며 이등분선이 자연히 넘어간다(documented 정상 동작, 붕괴 아님)·non-finite→
  RangeError(고정 finite A + atan2 화면 clamp 핸들이라 항상 finite, 미발생)는 주석으로만 둔다.
  `bisectAngle`은 finite 입력에서 throw하지 않아 라이브 warn 색을 억지로 만들지 않는다
  (`angle-clamp-range`·`vec-midpoint` 선례). diagnostics는 b·m·half 3개만 표시한다. number를 직접
  반환해 `*Into` companion이 없어 그대로 호출하고, ticker render는 저장 state만 그려 프레임당 vectra
  할당이 없다. N개 각 원형 평균 `angle/averageAngle`, 구간 clamp `angle-clamp-range`, 눈금 snap
  `angle-snap-dial`, 목표 회전 보간 `angle-heading-turn`과 분리한 "두 각 → 최단 호 이등분(angle
  bisector)" 단일 개념 예제로, `angle/bisectAngle` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/angle` namespace는 `angle-clamp-range`·`angle-snap-dial`
  등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `unity`, `geogebra`
- 작업 흐름: bounds point clearance (점에서 사각 keep-out 영역(AABB)까지의 부호 없는 최단 여유 거리 = point-to-AABB clearance, 내부면 0)
- 관련 함수: `bounds/distanceToPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:bounds-point-clearance` (`apps/pixi-demo/src/examples/bounds-point-clearance`)
- 설명: 화면 고정 사각 keep-out zone(AABB)과 점 핸들 P 1개를 두고, P를 drag하면 `distanceToPoint(box, P)`이
  점에서 사각 영역까지의 부호 없는 최단 여유 거리 d를 매 프레임 다시 계산한다. P가 zone 밖이면 둘레까지의
  gap이 곧 d이고, P를 zone 안으로 끌면 d=0이 되어 contact 색으로 전환돼 "이 점이 사각 금지 구역에서 얼마나
  떨어져 있는가, 닿았는가"(clearance / proximity probe) 작업 흐름을 보인다. 핵심 관계는 점 → AABB 여유 거리
  d 하나뿐이다. 핵심 구별점은 **출력이 점이 아니라 scalar 여유 거리(내부면 0)이고 입력 영역이 사각형(AABB)**
  이라는 것이다: 같은 box에서 최근접점 **point**를 반환하는 형제 `bounds-closest-point`(`closestPoint`,
  point 출력)와 정반대로 여기서는 scalar d가 중심 출력이고 둘레 최근접점은 inline 분해이며, 점→**원** 여유
  거리를 읽는 `circle-point-clearance`(`circle/distanceToPoint`)와 달리 영역이 사각형이라 최근접점이 축별
  clamp로 변(edge) 또는 모서리(corner)에 안착한다. inside/outside boolean만 주는 `rect-contains-point`
  (`containsPoint`)와 달리 경계까지의 거리를 수로 읽는다(0이 곧 내부). 둘레 위 최근접점 foot·clearance 선분은
  단일 거리 d의 의미를 드러내는 분해 표시이지 두 번째 관계가 아니다. foot는 P를 축별 [min,max]로 독립 clamp한
  inline 점으로 구하고 `closestPoint`를 호출하지 않는다(두 번째 API 미추가). gap(dx, dy)(= P − foot 축별 성분,
  d = hypot(dx, dy))는 같은 distanceToPoint 관계를 축별 gap으로 읽은 inline 분해 diagnostics이지 두 번째
  관계가 아니다. 별도 domain import 없이 단일 bounds domain을 유지하고 box는 object literal(`{min, max}`),
  P는 `{x, y}`로 구성한다. P를 box 안으로 끌어 겹침→d=0(throw 없이 valid 반환, 붕괴 아님; foot=P라 clearance
  선분 미표시)·empty bounds(`min>max`)→Infinity(고정 valid box라 미발생)·NaN/Infinity 좌표(P 화면 clamp +
  고정 finite box라 미발생)는 주석으로만 둔다. `distanceToPoint`은 finite·non-empty 입력에서 throw하지 않고
  내부에서 0을 valid 반환하므로 라이브 warn 색을 억지로 만들지 않는다(내부 0은 contact 색 전환으로 자연스럽게
  드러난다, `circle-point-clearance`·`rect-contains-point` 선례). diagnostics는 d·status·gap 3개만 표시한다.
  number를 직접 반환해 `*Into` companion이 없어 그대로 호출하고, ticker render는 저장 state만 그려 프레임당
  vectra 할당이 없다. 같은 box 최근접 point `bounds-closest-point`(`closestPoint`), 점→원 여유 거리
  `circle-point-clearance`(`circle/distanceToPoint`), 점∈사각형 `rect-contains-point`(`containsPoint`)와
  분리한 "점 → 사각 영역 여유 거리(clearance)" 단일 개념 예제로, `bounds/distanceToPoint` leaf의 첫 연결이다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/bounds` namespace는 `bounds-closest-point`
  ·`bounds-union-box`가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `figma`, `unity`
- 작업 흐름: regular polygon construct (중심·외접원 반지름·변 수에서 정 N각형 꼭짓점 구성 = parametric regular polygon construction)
- 관련 함수: `polygon/regularPolygon`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:regular-polygon-construct` (`apps/pixi-demo/src/examples/regular-polygon-construct`)
- 설명: 위쪽 슬라이더 핸들 1개로 변 수 `N`(3..12 정수)을 정하면 `regularPolygon(center, R, N)`이 고정
  외접원 위에 정 N각형 꼭짓점을 구성해 다시 그린다. 슬라이더를 끌면 같은 외접원 위에서 변 수만 바뀌며
  삼각형→사각형→…으로 정다각형이 새로 구성돼 "파라미터(center·반지름·변 수)에서 정다각형 꼭짓점을
  구성한다"(parametric regular polygon construction) 작업 흐름을 보인다. 핵심 관계는 `(center, R, sides)
  → 정 N각형 꼭짓점` 하나뿐이다. 핵심 구별점은 **출력이 도형(꼭짓점 list)인 구성**이라는 것이다: 임의
  point list polygon의 centroid·inside/outside·boundingCircle을 읽는 `polygon-metrics-workbench`
  (`polygonFrom`·`centroid`·`classifyPoint`, 분석 방향)와 정반대로 여기서는 파라미터가 입력이고 정다각형이
  출력이며, polygon transform/winding을 보이는 `polygon-transform-orientation-lab`(`transformPoints`·
  `signedArea`)과도 관계가 다르다(변환이 아니라 구성). inner/outer 두 반지름으로 별 다각형을 만드는 형제
  `starPolygon`(2-radius)·close vertex를 추가하는 path 도메인 `path/regularPolygonCommandsInto`와도 분리
  된다. sides·circumR(외접원 반지름)·edge(출력 꼭짓점 0·1 사이 거리)는 같은 단일 구성 출력을 변 수·
  외접원·변 길이로 읽은 분해 diagnostics이지 두 번째 관계가 아니고, 외접원 guide·center dot·꼭짓점 dot·
  첫 꼭짓점 강조도 같은 정다각형 출력의 분해 표시이지 두 번째 관계가 아니다. edge는 반환된 `poly[0]`·
  `poly[1]` 사이를 inline `Math.hypot`으로 재 등간격 출력을 드러낸다(두 번째 API 미추가). 별도 domain
  import 없이 단일 polygon domain을 유지하고 center는 `{x, y}`, 외접원 반지름·startAngle은 고정 상수로
  둔다. `sides < 3`/non-integer → 빈 points(슬라이더가 정수 3..12 clamp라 미발생)·finite `radius ≤ 0` →
  모든 꼭짓점 center로 모임(고정 양수 R이라 미발생)·non-finite radius/startAngle → NaN/Infinity 꼭짓점
  pass-through(고정 finite 값이라 미발생)는 주석으로만 둔다. `regularPolygon`은 throw하지 않고 valid
  파라미터에서 항상 정다각형을 반환하므로 라이브 warn 색을 억지로 만들지 않는다(`vec-from-angle`·
  `vec-midpoint` 선례). diagnostics는 sides·circumR·edge 3개만 표시한다. `{ points }` object를 반환하고
  N 변경당 1회 단발 rebuild라 allocating `regularPolygon`을 쓴다(`regularPolygonInto` out-buffer scaffold
  미사용, `vec-midpoint`의 `midpoint` 선례, allocating 호출이 `regularPolygonInto` companion도 커버).
  ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다. 임의 polygon 분석
  `polygon-metrics-workbench`, polygon transform/winding `polygon-transform-orientation-lab`, 별 다각형
  `starPolygon`, path 명령 `path/regularPolygonCommandsInto`와 분리한 "파라미터 → 정 N각형 꼭짓점 구성"
  단일 개념 예제로, `polygon/regularPolygon`/`regularPolygonInto` leaf의 첫 연결이다. diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/polygon` namespace는 `polygon-metrics-workbench`
  등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `unity`, `geogebra`, `p5.js`
- 작업 흐름: math ping pong (끝없이 증가하는 입력 raw를 [0,L]로 reflect-fold = 상한에서 되돌리는 왕복 삼각파)
- 관련 함수: `math/pingPong`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:math-ping-pong` (`apps/pixi-demo/src/examples/math-ping-pong`)
- 설명: 가로 트랙 scrubber 핸들 1개로 입력 `raw`를 정하면 `pingPong(raw, L)`이 그 값을 닫힌 구간 `[0, L]`로
  접어(fold) 출력한다. raw를 L 너머로 끌면 출력이 0으로 점프하지 않고 **되돌아와** 0↔L을 일정 속도로
  왕복해 "끝없이 커지는 입력을 한 구간으로 가두되 상한에서 되돌리는(ping-pong) 값을 만든다"는 작업
  흐름을 보인다. 핵심 관계는 raw → `[0,L]` reflect-fold 하나뿐이다. 핵심 구별점은 **상한에서 wrap(점프)이
  아니라 reflect(되돌림)**라는 것이다: 정수 raw를 ring index로 cyclic wrap(L→0 점프, 불연속 톱니)하는
  `wrap-int-ring`(`wrapIntInclusive`/`wrapIntHalfOpen`)과 달리 pingPong은 상한에서 연속 삼각파로
  되돌아오고(L→0이 점프가 아니라 꺾임), 구간 내 값을 0..1로 정규화하는 `inverse-lerp-track`
  (`inverseLerp`)·진행도(0→1)를 곡선/계단/표로 shape하는 `easing-motion-timing`·`stepped-timing-track`·
  `sample-table-lookup`과도 출력 성격(unbounded 입력의 주기 fold)이 다르다. 삼각파 곡선·scrubber→곡선
  marker 수직 guide·0·L 값 축은 같은 단일 fold 관계의 좌표 plot이지 두 번째 관계가 아니다. 곡선은
  raw·L이 고정이라 정점마다 `pingPong`을 호출해 1회 precompute하고(곡선 자체가 함수 출력), drag 시에만
  marker 값 `pingPong(raw, L)`을 1회 다시 계산한다. 별도 domain import 없이 단일 math domain을 유지하고
  raw 범위에 음수 일부를 포함해 fold가 단순 clamp가 아니라 positive-modulo 대칭 reflect임을 드러낸다.
  `length ≤ 0`/`2*length` non-finite → RangeError(고정 양수 작은 L이라 미발생)·`raw` non-finite →
  RangeError(scrubber를 raw 범위로 clamp, 항상 finite 매핑이라 미발생)는 주석으로만 둔다. `pingPong`은
  valid 입력에서 throw하지 않아 라이브 warn 색을 억지로 만들지 않는다(`wrap-int-ring`·`inverse-lerp-track`
  선례). diagnostics는 raw·pong·length(period 2L) 3개만 표시한다. number를 직접 반환해 `*Into` companion이
  없어 그대로 호출하고, ticker render는 저장 state·precompute 곡선만 그려 프레임당 vectra 할당이 없다.
  `path-morph`가 `pingPong`을 시간 driver로 부수적으로 쓰지만 그 예제는 path morph가 중심이라 pingPong을
  설명하지 않는다. 정수 cyclic wrap `wrap-int-ring`, 값 정규화 역보간 `inverse-lerp-track`, 진행도 shape
  `easing-motion-timing`·`stepped-timing-track`·`sample-table-lookup`과 분리한 "unbounded 입력 →
  `[0,L]` reflect-fold(왕복 삼각파)" 단일 개념 예제로, `math/ping-pong` leaf의 첫 설명 연결이다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/math` namespace는 `wrap-int-ring`
  등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `unity`, `geogebra`, `pixijs`
- 작업 흐름: ray closest point (점을 forward ray로 투영한 최근접점 = origin clamp 역투영, t<0이면 origin)
- 관련 함수: `ray/closestPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ray-closest-point` (`apps/pixi-demo/src/examples/ray-closest-point`)
- 설명: 화면 고정 forward ray(origin O + 고정 방향)와 질의 점 핸들 P 1개를 두고, P를 drag하면
  `closestPoint(ray, P)`이 ray 위 P 최근접점(foot)을 매 drag마다 다시 구한다. ray는 forward(`t ≥ 0`)만
  뻗으므로 P가 O 앞이면 발이 수선의 발에 놓이고, P를 O 뒤로 끌면 발이 ray를 벗어날 수 없어 origin O에
  달라붙어(clamp) "임의의 점을 forward ray로 투영한 최근접점을 구한다"(origin clamp 역투영) 작업 흐름을
  보인다. 핵심 관계는 점 P → forward ray 최근접점 하나뿐이다. 핵심 구별점은 **forward ray의 한쪽
  (origin) clamp**다: infinite-line에 unclamped로 투영하는 `segment-supporting-line-foot`
  (`nearestPointOnSupportingLine`, 양끝 무한)과 달리 backward 쪽만 origin으로 clamp되고 forward는
  무한하며, 주어진 t의 forward 점을 **구성**하는 정반대 방향 `vec-point-on-ray`(`pointOnRay`)와도 관계
  방향이 반대다(구성이 아니라 역투영). ray hit-test 패밀리(`ray-circle-hit`·`ray-segment-hit`·
  `ray-bounds-hit`, boolean 판정)와 달리 점/거리 투영이다. `t`(projectionT, unclamped — 음수면 clamp)·
  `dist`(distanceToPoint)·status(on ray / behind→origin)는 같은 단일 최근접 관계를 parameter·거리·상태로
  읽은 분해 diagnostics이지 두 번째 관계가 아니다(`segment-supporting-line-foot`의 foot+signedDistance+
  side 3-API 분해 선례). foot dot·P→foot drop line·직각 marker도 같은 관계의 분해 표시이고, 직각 marker는
  on-ray(`t ≥ 0`, 진짜 수직)일 때만 그린다(clamp면 P→origin이 수직이 아니라 생략). unclamped 수선의 발을
  반환하는 형제 `Rayx.projectPoint`는 clamp 없는 두 번째 표현이라 의도적으로 그리지 않는다. 별도 domain
  import 없이 단일 ray domain을 유지하고 ray는 object literal(`{origin, direction}`), P는 `{x, y}`로
  구성한다. direction zero-vector(degenerate ray→origin 거리 반환)는 고정 non-zero direction이라 미발생·
  NaN/Infinity 좌표(P 화면 clamp + 고정 finite ray라 미발생)는 주석으로만 둔다. origin clamp는
  `closestPoint`의 documented 정상 동작(붕괴 아님)이라 warn 색이 아니라 일반 accent(호박색) 전환으로
  드러낸다(`vec-clamp-region` 선례). diagnostics는 t·dist·status 3개만 표시한다. `{x, y}` object를 반환하고
  단발 drag rebuild라 allocating `closestPoint`를 쓴다(`closestPointInto` out-buffer scaffold 미사용,
  `vec-midpoint`의 `midpoint` 선례, allocating 호출이 `closestPointInto` companion도 커버). ticker render는
  저장 state만 그려 프레임당 vectra 할당이 없다. forward 점 구성 `vec-point-on-ray`(`pointOnRay`),
  infinite-line unclamped 발 `segment-supporting-line-foot`(`nearestPointOnSupportingLine`), ray hit-test
  `ray-circle-hit`·`ray-segment-hit`·`ray-bounds-hit`과 분리한 "점 → forward ray 최근접점(origin clamp)"
  단일 개념 예제로, `ray/closestPoint`/`closestPointInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/ray` namespace는 `ray-cast`·`ray-intersection-lab` 등이 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `unity`, `geogebra`
- 작업 흐름: circle circle clearance (두 원(disk) 사이의 부호 없는 최단 여유 거리 = circle-to-circle clearance, overlap이면 0)
- 관련 함수: `circle/distanceToCircle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-circle-clearance` (`apps/pixi-demo/src/examples/circle-circle-clearance`)
- 설명: 화면 고정 원 A와 드래그 원 B(center만 핸들)를 두고, B를 drag하면 `distanceToCircle(A, B)`이 두
  원 둘레 사이의 부호 없는 최단 여유 거리 d를 매 프레임 다시 계산한다. 두 원이 떨어져 있으면 둘레
  사이의 gap이 곧 d이고, B를 A에 겹치면 d=0이 되어 contact 색으로 전환돼 "두 원형 영역이 서로 얼마나
  떨어져 있는가, 닿았는가"(circle-to-circle clearance) 작업 흐름을 보인다. 핵심 관계는 원 A ↔ 원 B 여유
  거리 d 하나뿐이다. 핵심 구별점은 **입력 B가 점이 아니라 radius를 가진 disk**라는 것이다: 점에서 고정
  원까지 여유 거리를 읽는 `circle-point-clearance`(`distanceToPoint`, 점 입력)와 달리 여기서는 두 disk의
  둘레 gap(d = |C| − rA − rB)을 읽고, overlap boolean만 주는 `circle-circle-overlap`
  (`intersectsCircleCircle`)과 달리 그 gap의 크기를 수로 읽는다(0이 곧 overlap). 두 둘레 위 최근접점·
  clearance 선분·center↔center 연결선은 단일 거리 d의 의미를 드러내는 분해 표시이지 두 번째 관계가
  아니다. 두 발은 center 연결선 단위벡터로 `centerA + dir·rA`·`centerB − dir·rB` inline 산술로 구하고
  `closestPoint`를 호출하지 않는다(두 번째 API 미추가). |C|(두 center 거리, d = max(0, |C| − rA − rB))는
  같은 distanceToCircle 관계를 center 거리로 읽은 inline 분해 diagnostics이지 두 번째 관계가 아니다. 별도
  domain import 없이 단일 circle domain을 유지하고 두 원은 object literal(`{center, radius}`)로 구성한다.
  B를 A에 겹침(`|C| ≤ rA + rB`)→d=0(throw 없이 valid 반환, 붕괴 아님)·두 center 겹침(`|C|=0`)→overlap이라
  clearance 선분을 안 그려 방향 정의 불가가 무관·empty circle(`radius ≤ 0`)→center point 취급(고정 양수
  radius라 미발생)·NaN/Infinity 좌표(B center 화면 clamp + 고정 finite A/B radius라 미발생)는 주석으로만
  둔다. `distanceToCircle`은 finite 입력에서 throw하지 않고 overlap에서 0을 valid 반환하므로 라이브 warn
  색을 억지로 만들지 않는다(overlap은 contact 색 전환으로 자연스럽게 드러난다, `circle-point-clearance`·
  `rect-contains-point` 선례). diagnostics는 d·status·|C| 3개만 표시한다. number를 직접 반환해 `*Into`
  companion이 없어 그대로 호출하고, ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다. 점→고정
  원 여유 거리 `circle-point-clearance`(`distanceToPoint`), 두 원 겹침 boolean `circle-circle-overlap`,
  접선 구성 `circle-tangent-construction`, 세 점 → 외접원 `circle-from-three-points`(`fromThreePoints`)와
  분리한 "두 원 → 둘레 사이 여유 거리(clearance)" 단일 개념 예제로, `circle/distanceToCircle` leaf의 첫
  연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/circle` namespace는
  `circle-point-clearance`·`circle-tangent-construction` 등이 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `paper.js`, `figma`
- 작업 흐름: circle from three points (원 위를 지나는 세 점에서 외접원을 복원 = circumcircle 구성, 세 점 일직선이면 정의 불가)
- 관련 함수: `circle/fromThreePoints`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-from-three-points` (`apps/pixi-demo/src/examples/circle-from-three-points`)
- 설명: 화면 고정 두 점 A·B와 점 핸들 C 1개를 두고, C를 drag하면 `fromThreePoints(A, B, C)`이 세 점을
  모두 지나는 외접원(circumscribed circle)을 매 drag마다 다시 구성한다. C를 옮기면 외접원의 중심과
  반지름이 따라 바뀌고, C를 A·B 직선 위로 끌어 세 점이 일직선이 되면 세 점을 지나는 원이 정의되지
  않아(반지름 무한대) 함수가 undefined를 반환해 warn 상태로 전환돼 "원 위를 지나야 하는 세 점에서
  그 원을 복원한다"(circumcircle 구성) 작업 흐름을 보인다. 핵심 관계는 세 점 → 외접원 하나뿐이다.
  핵심 구별점은 **점들로부터 원을 구성**한다는 것이다: 점에서 고정 원까지 여유 거리를 읽는
  `circle-point-clearance`(`distanceToPoint`, 원이 입력)와 정반대로 여기서는 원이 출력이고,
  점↔원 hit/overlap 패밀리(`circle-circle-overlap`·`ray-circle-hit`·`circle-infinite-line-hit`)와도
  관계 방향이 반대다(판정이 아니라 구성). 단일 draggable 핸들 C와 고정 A·B로 "주 조작 대상 1개"
  gate를 지키면서 세 점 입력을 유지한다. center(x,y)·r·status는 같은 단일 외접원 출력을 중심·반지름·
  정의 가능 여부로 읽은 분해 diagnostics이지 두 번째 관계가 아니고, center→세 꼭짓점 등반지름 spoke·
  세 점 보조 삼각형도 같은 외접원 출력의 분해 표시이지 두 번째 관계가 아니다. 별도 domain import 없이
  단일 circle domain을 유지하고 A·B·C는 `{x, y}` object literal로 구성한다. collinear / duplicate /
  non-finite → undefined는 함수 documented 동작이고, C를 A·B 직선 위로 끌면 collinear가 자연히 일어나
  라이브 warn 색(status="collinear (no circle)")으로 드러난다(억지 warn이 아닌 실제 degenerate 시연,
  `vec-surface-normal`·`vec-wall-bounce`의 라이브 degenerate warn 선례). C 중복(C=A 또는 C=B)도 같은
  undefined warn 경로로 흡수된다. NaN/Infinity 좌표(C 화면 clamp + 고정 finite A·B라 미발생)는 주석
  으로만 둔다. diagnostics는 center·r·status 3개만 표시한다. `{center, radius}` object를 반환하고
  단발 drag rebuild라 allocating `fromThreePoints`를 쓴다(`fromThreePointsInto` out-buffer scaffold
  미사용, `vec-midpoint`의 `midpoint` 선례, allocating 호출이 `fromThreePointsInto` companion도 커버).
  ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다. 점→고정 원 여유 거리
  `circle-point-clearance`(`distanceToPoint`), 두 원 겹침 `circle-circle-overlap`, forward ray × 원
  `ray-circle-hit`, 무한 직선 × 원 `circle-infinite-line-hit`, 접선 구성 `circle-tangent-construction`과
  분리한 "세 점 → 외접원(circumcircle 구성)" 단일 개념 예제로, `circle/fromThreePoints`/
  `fromThreePointsInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/circle` namespace는 `circle-point-clearance`·`circle-tangent-construction` 등이 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `unity`, `geogebra`
- 작업 흐름: circle point clearance (점에서 원형 keep-out zone까지의 부호 없는 최단 여유 거리 = clearance / proximity probe, 내부면 0)
- 관련 함수: `circle/distanceToPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-point-clearance` (`apps/pixi-demo/src/examples/circle-point-clearance`)
- 설명: 화면 고정 원형 keep-out zone과 점 핸들 P 1개를 두고, P를 drag하면 `distanceToPoint(circle, P)`이
  점에서 원까지의 부호 없는 최단 여유 거리 d를 매 프레임 다시 계산한다. P가 zone 밖이면 둘레까지의 gap이
  곧 d이고, P를 zone 안으로 끌면 d=0이 되어 contact 색으로 전환돼 "이 점이 원형 금지 구역에서 얼마나
  떨어져 있는가, 닿았는가"(clearance / proximity probe) 작업 흐름을 보인다. 핵심 관계는 점 → 원까지 여유
  거리 d 하나뿐이다. 핵심 구별점은 **출력이 점이 아니라 scalar 여유 거리(내부면 0으로 clamp)**라는 것이다:
  원 위 최근접 점을 반환하는 `closestPoint`(점 출력)와 달리 여기서는 그 gap의 크기 d 한 개가 중심 출력이고,
  inside/outside boolean만 주는 `containsPoint`와 달리 경계까지의 거리를 수로 읽는다. 둘레 위 최근접점·
  clearance 선분·center→발 반지름 guide는 단일 거리 d의 의미를 드러내는 분해 표시이지 두 번째 관계가
  아니다. 최근접점은 `center + (P−center)/|CP| · r` inline 산술로 구하고 `closestPoint`를 호출하지 않는다
  (두 번째 API 미추가). |CP|(center까지 거리, d = max(0, |CP| − r))는 같은 distanceToPoint 관계를 center
  거리로 읽은 inline 분해 diagnostics이지 두 번째 관계가 아니다. 별도 domain import 없이 단일 circle domain을
  유지하고 circle은 object literal(`{center, radius}`), P는 `{x, y}`로 구성한다. P를 center에 겹침(`|CP|=0`)→
  내부라 d=0이고 clearance 선분을 안 그려 무관·empty circle(`radius ≤ 0`)→center까지 거리(고정 양수 radius라
  미발생)·NaN/Infinity 좌표(P 화면 clamp + 고정 finite circle이라 미발생)는 주석으로만 둔다. `distanceToPoint`은
  finite 입력에서 throw하지 않고 내부에서 0을 valid 반환하므로 라이브 warn 색을 억지로 만들지 않는다(내부 0은
  contact 색 전환으로 자연스럽게 드러난다, `rect-contains-point`·`midpoint` 선례). diagnostics는 d·status·|CP|
  3개만 표시한다. number를 직접 반환해 `*Into` companion이 없어 그대로 호출하고, ticker render는 저장 state만
  그려 프레임당 vectra 할당이 없다. 점↔점 거리 `distance-metrics`·`snap-distance-ruler`, 점 ∈ 사각 영역
  `rect-contains-point`, 원 위 최근접 점 `closestPoint`와 분리한 "점 → 원형 zone 여유 거리(clearance)" 단일
  개념 예제로, `circle/distanceToPoint` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/circle` namespace는 `circle-tangent-construction` 등이 이미 sandbox allowlist 2배열에
  등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `unity`, `figma`
- 작업 흐름: angle clamp range (입력 각을 고정 허용 부채꼴(CCW 구간)로 제한 = rotation limit / joint 각도 구속)
- 관련 함수: `angle/clampAngle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:angle-clamp-range` (`apps/pixi-demo/src/examples/angle-clamp-range`)
- 설명: 화면 중앙 고정 피벗 둘레에 고정 허용 각도 구간(CCW 부채꼴 `[START, END]`)을 두고, 입력
  handle 1개를 피벗 둘레로 drag하면 `clampAngle(raw, START, END)`이 피벗→handle 방향 각을 그 허용
  구간으로 clamp한 출력 각을 매 프레임 다시 계산한다. 구간 안이면 출력 needle이 입력을 그대로
  따라가고(자유), 구간 밖으로 끌면 가장 가까운 경계(start 또는 end)에 달라붙어 "각을 허용 회전
  한계 안으로 잡아둔다"(rotation limit / joint 각도 구속) 작업 흐름을 보인다. 핵심 관계는 raw 각 →
  허용 구간 clamp 출력 각 하나뿐이다. 핵심 구별점은 **연속 구간 경계로의 clamp**다: 연속 각을
  고정 간격 눈금으로 양자화하는 step snap `angle-snap-dial`(`snapAngle`)과 달리, clampAngle은
  양자화하지 않고 구간 **안에서는 입력 그대로**, **밖에서만** 가까운 경계로 당긴다. 벡터 길이를
  band로 가두는 `vec-clamp-length-band`(`clampLength`)·점을 box로 가두는 `vec-clamp-region`
  (`clampInto`)과 같은 clamp 계열이지만 대상이 **원형 각도 구간**이라 wrap을 고려한 경계 거리
  비교가 핵심이다. input°·output°·status(inside/→start/→end)는 모두 같은 단일 clamp 출력을 입력
  각·결과 각·상태로 읽은 분해 diagnostics이지 두 번째 관계가 아니다(`angle-snap-dial`의 raw/snap
  분해 선례). 허용 부채꼴 fill·두 경계 ray·raw→output 당김 호도 같은 clamp 관계의 분해 표시이지
  두 번째 관계가 아니다. 별도 domain import 없이 단일 angle domain을 유지하고 피벗·구간·needle은
  inline 산술로 구성하며 각도→도 환산도 inline이다(두 번째 API 미추가). radial 2D handle을 atan2로
  각으로 바꾸는 것은 `from-angle-scalar-input-not-point` 함정이 아니다: 그 함정은 `fromAngle`처럼
  입력이 순수 스칼라 각인데 2D 핸들이 `directionTo`와 동치가 되는 경우이고, clampAngle은 입력도
  출력도 각이며 구간 경계 clamp가 점 연산으로 환원되지 않아 radial handle이 각도 picker의 정석이다
  (`angle-snap-dial` 직계 선례). zero-length interval(`START===END`)→start 반환(고정
  non-degenerate 구간이라 미발생)·tie distance→start 우선(documented 동작)·NaN/Infinity→RangeError
  (handle 화면 clamp + 고정 finite 구간이라 atan2 항상 finite, 미발생)는 주석으로만 둔다. clamp는
  정상 동작(붕괴 아님)이라 라이브 warn 색을 억지로 만들지 않는다(`vec-clamp-region`·
  `vec-clamp-length-band` 선례). diagnostics는 input·output·status 3개만 표시한다. number를 직접
  반환해 `*Into` companion이 없어 그대로 호출하고, render hot path에 누적 state·buffer가 없어
  프레임당 vectra 할당이 없다. step snap `angle-snap-dial`(`snapAngle`)·각 heading 회전
  `angle-heading-turn`·단위 나침반 `angle-unit-compass`·벡터 길이 band `vec-clamp-length-band`·점
  box clamp `vec-clamp-region`과 분리한 "각 → 허용 CCW 구간 clamp(rotation limit)" 단일 개념
  예제로, `angle/clampAngle` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/angle` namespace는 `angle-heading-turn` 등이 이미 sandbox allowlist
  2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `p5.js`, `unity`, `geogebra`
- 작업 흐름: vec scalar projection (벡터를 기준 축에 투영한 부호 있는 스칼라 좌표 t = 축 위 1D 위치)
- 관련 함수: `vec/projectScalar`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-scalar-projection` (`apps/pixi-demo/src/examples/vec-scalar-projection`)
- 설명: 화면 고정 원점 O와 고정 기준 축 b를 두고, 점 핸들 A 1개를 drag하면
  `projectScalar(a, b)`이 벡터 a(O→A)를 축 b에 투영한 부호 있는 스칼라 좌표
  t = dot(a,b)/|b|²를 매번 다시 계산한다. 축 위 t·b 지점에 수선의 발을 찍고 A→발 수직 drop
  line과 직각 marker로 t의 의미를 드러내, A를 축 뒤로 끌면 t<0, 축 tip(t=1) 너머로 끌면 t>1이
  되어 "한 벡터를 기준 축에 투영한 부호 있는 스칼라 좌표를 읽는다"(scalar projection) 작업 흐름을
  보인다. 핵심 관계는 벡터 a → 축 b 위 스칼라 좌표 t 하나뿐이다. 핵심 구별점은 **출력이 벡터가
  아니라 부호 있는 스칼라(축 좌표)**라는 것이다: 투영 **벡터**(projectOn)와 unit-normal 반사를
  함께 그리는 묶음 lab `vector-projection-reflection-lab`과 달리, 여기서는 a를 축을 따라 읽은 1D
  좌표 t 한 개가 중심 출력이다. 수직 성분을 남기는 `rejectFrom`/`slide`(둘은 수학적으로 동일,
  이미 `vec-wall-slide`가 `slide` 커버)와 정반대로 projectScalar는 축 **방향 성분의 스칼라 크기**만
  읽어, 중복 후보였던 rejection 예제를 배제하고 distinct 가치를 확보한다. t·b 수선의 발·수직 drop
  line·직각 marker는 t의 의미를 드러내는 같은 단일 출력의 분해 표시이지 두 번째 관계가 아니다
  (`vec-aim-direction`의 dir/angle/|dir| 선례). |a|·θ(a와 b 사이 각)도 같은 projectScalar 관계를
  길이·각으로 읽은 inline 분해 diagnostics이지 두 번째 관계가 아니다. 별도 domain import 없이 단일
  vec domain을 유지하고 O·A·축 모두 `{x, y}` object literal / inline 산술로 구성한다. b zero
  vector→0(축 b는 고정 non-zero라 미발생)·a zero vector(A를 O에 겹침)→t=0(throw 없이 valid
  scalar 반환, 붕괴 아님; θ만 정의 불가라 "—"로 가드)·NaN/Infinity(A 화면 clamp + 고정 finite
  O/b라 미발생)는 주석으로만 둔다. `projectScalar`는 finite 입력에서 throw하지 않고 a=0도 t=0을
  valid 반환하므로 라이브 warn 색을 억지로 만들지 않는다(`midpoint`·`rect-contains-point` 선례).
  diagnostics는 t·|a|·θ 3개만 표시한다. number를 직접 반환해 `*Into` companion이 없어 그대로
  호출하고(drag 시 rebuild 1회), ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다.
  투영 벡터·반사 묶음 lab `vector-projection-reflection-lab`(`projectOn`·`reflectAcrossNormal`),
  벽 미끄러짐(=rejection) `vec-wall-slide`(`slide`)와 분리한 "벡터 → 기준 축 위 부호 스칼라 좌표
  (scalar projection)" 단일 개념 예제로, `vec/projectScalar` leaf의 첫 연결이다. diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/vec` namespace는 다수 vec 예제가 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `pixijs`, `phaser`
- 작업 흐름: circle infinite line hit (무한 직선이 원(closed disk)에 닿는가 = infinite line vs circle hit-test boolean)
- 관련 함수: `intersects/intersectsCircleInfiniteLine`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-infinite-line-hit` (`apps/pixi-demo/src/examples/circle-infinite-line-hit`)
- 설명: 화면 고정 pivot을 지나는 무한 직선의 방향을 aim 핸들 1개로 돌리면
  `intersectsCircleInfiniteLine(circle, infiniteLine)`이 그 직선이 고정 원(closed disk)에 닿는지
  매 프레임 boolean으로 판정한다. 닿으면 hit 색, 비껴가면 clear 색으로 바뀌어 "이 직선이 원에
  닿는가?"(infinite line vs circle hit-test) 작업 흐름을 보인다. 핵심 관계는 직선 ∩ 원 하나뿐이다.
  핵심 구별점은 **양방향으로 무한**한 직선이라는 것이다: forward(t ≥ 0)만 뻗는 ray로 원을 쏘는
  `ray-circle-hit`(`intersectsCircleRay`)과 달리, 직선은 pivot의 앞·뒤 양쪽으로 무한히 연장돼 aim을
  원 반대로 돌려도 backward 연장선이 원을 지나면 hit=yes가 되고, direction을 180° 뒤집어도 같은
  직선이라 판정이 바뀌지 않는다. overlap/hit 패밀리가 shape pair·ray vs infinite-line마다 예제를
  분리해 온 선례(circle 패밀리 `circle-circle-overlap`·`circle-rect-overlap`, forward ray 패밀리
  `ray-circle-hit`·`ray-segment-hit`·`ray-bounds-hit`)를 따라, infinite-line × circle shape pair를
  분리한다. boolean predicate라 분해할 scalar가 없어 diagnostics는 hit(yes/no)·직선 angle°·drag
  안내만 두고, 교점 좌표·진입/이탈 점·접점은 복잡도 gate를 깨는 두 번째 표현이라 의도적으로 그리지
  않는다(`ray-circle-hit`·`triangle-rect-overlap` 선례). 별도 domain import 없이 단일 intersects
  domain을 유지하고 circle은 object literal(`{center, radius}`), infiniteLine은 `{origin, direction}`로
  구성한다. `radius ≤ 0`→false(고정 양수 radius라 미발생)·direction zero-vector(aim을 pivot에
  겹침→직선 ill-defined; 핸들을 pivot과 떨어뜨려 둬 미발생)·NaN/Infinity 좌표(aim 화면 clamp + 고정
  finite pivot/circle이라 미발생)는 주석으로만 둔다. `intersectsCircleInfiniteLine`은 finite 입력에서
  실패하지 않아 라이브 warn 색을 억지로 만들지 않는다(`ray-circle-hit`·`ray-bounds-hit` 선례). closed
  disk 포함(둘레 tangent도 true)은 접하는 순간 색 전환으로 드러난다. boolean 반환이라 `*Into`
  companion이 없어 그대로 호출하고 render hot path에 vectra 할당이 없다. forward ray × circle
  `ray-circle-hit`(`intersectsCircleRay`), forward ray × segment `ray-segment-hit`, forward ray × AABB
  `ray-bounds-hit`, 두 원 `circle-circle-overlap`, 원↔AABB `circle-rect-overlap`과 분리한 "무한 직선 ×
  circle 교차 boolean(infinite line vs circle hit-test)" 단일 개념 예제로,
  `intersects/intersectsCircleInfiniteLine` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/intersects` namespace는 다수 overlap·ray 예제가 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `pixijs`, `phaser`, `figma`
- 작업 흐름: rect segment cross (유한 선분이 사각 영역(AABB)을 가로지르는가 = segment vs AABB hit-test boolean)
- 관련 함수: `intersects/intersectsRectSegment`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-segment-cross` (`apps/pixi-demo/src/examples/rect-segment-cross`)
- 설명: 화면 고정 사각 영역(AABB)과 끝점 핸들 1개를 가진 유한 선분을 두고, 끝점 B를 drag하면
  `intersectsRectSegment(rect, seg)`이 그 선분이 사각 영역을 가로지르는지 매 프레임 boolean으로
  판정한다. 가로지르면 선분·사각형이 hit 색, 비껴가면 clear 색으로 바뀌어 "이 선분(벽/경로 구간)이
  사각 영역(타일/존)을 가로지르는가?"라는 hit-test 작업 흐름을 보인다. 핵심 관계는 선분 ∩ 사각형
  하나뿐이다. 핵심 구별점은 **양끝이 유한한 선분**이라는 것이다: forward(t ≥ 0) half-line인 ray로
  영역을 쏘는 `ray-bounds-hit`(`intersectsBoundsRay`)·`ray-segment-hit`(`intersectsRaySegment`)과 달리
  선분은 두 끝점 사이로만 닿으므로, 끝점 B를 영역 앞에서 멈추면 그 방향으로 연장해도 닿을 영역에
  hit=no가 되어 half-line과 분리된다. overlap/hit 패밀리가 shape pair마다 예제를 분리해 온 선례(circle
  패밀리 `circle-circle-overlap`·`circle-rect-overlap`, ellipse 패밀리 `ellipse-circle-overlap`·
  `ellipse-rect-overlap`, triangle `triangle-rect-overlap`, 두 AABB `bounds-bounds-overlap`, 점∈사각형
  `rect-contains-point`)를 따라, segment × rect(AABB) shape pair를 분리한다. 두 유한 선분 교차
  `segment-segment-cross`(`intersectsSegmentSegment`)와 달리 segment × rect(4변+면적)다. boolean
  predicate라 분해할 scalar가 없어 diagnostics는 cross(yes/no) + shape 파라미터(rect w×h·segment
  length)만 두고, 교점 좌표·rect edge crossing·진입/이탈 점은 복잡도 gate를 깨는 두 번째 표현이라
  의도적으로 그리지 않는다(`triangle-rect-overlap`이 SAT 분리축을 그리지 않은 선례, `ray-segment-hit`의
  boolean-only 선례). segment의 supporting line(무한 연장) 표시는 infinite-line × rect라는 별도 관계라
  끌어오지 않는다. 별도 domain import 없이 단일 intersects domain을 유지하고 rect는 object literal
  (`{x, y, width, height}`), segment는 `{a, b}`로 구성한다. empty rect(`width/height ≤ 0`)→false는 고정
  양수 dim이라 미발생·zero-length segment(`a===b`)는 A 고정·B 화면 clamp라 미발생·NaN/Infinity
  좌표(끝점 B 화면 clamp + 고정 finite A·rect라 미발생)는 주석으로만 둔다. `intersectsRectSegment`은
  finite·non-empty 입력에서 실패하지 않아 라이브 warn 색을 억지로 만들지 않는다
  (`triangle-rect-overlap`·`ellipse-rect-overlap` 선례). closed boundary 포함(접점도 true)은 접하는
  순간 색 전환으로 드러난다. diagnostics는 cross·rect·seg 3개만 표시한다. boolean 반환이라 `*Into`
  companion이 없어 그대로 호출하고 render hot path에 vectra 할당이 없다. 두 원 `circle-circle-overlap`,
  원↔AABB `circle-rect-overlap`, 타원↔원 `ellipse-circle-overlap`, 타원↔AABB `ellipse-rect-overlap`,
  삼각형↔AABB `triangle-rect-overlap`, 두 삼각형 `triangle-triangle-overlap`, 두 AABB
  `bounds-bounds-overlap`, rect⊇rect 포함 `rect-contains-rect`, 점∈사각형 `rect-contains-point`,
  forward ray↔AABB `ray-bounds-hit`, forward ray↔segment `ray-segment-hit`, 두 유한 선분
  `segment-segment-cross`와 분리한 "유한 선분 × rect 가로지름 boolean(segment vs AABB hit-test)" 단일
  개념 예제로, overlap/hit 패밀리에 segment × AABB shape pair를 더한 `intersects/intersectsRectSegment`
  leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/intersects` namespace는 다수 overlap·ray 예제가 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `p5.js`, `geogebra`, `figma`
- 작업 흐름: vec midpoint (두 점의 중점 = center / balance point 구성)
- 관련 함수: `vec/midpoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-midpoint` (`apps/pixi-demo/src/examples/vec-midpoint`)
- 설명: 화면 고정 anchor A에서 point 핸들 B 1개를 drag하면 `midpoint(A, B)`가 두 점의 중점 M을
  다시 계산한다. B를 어디로 끌든 M은 항상 A와 B의 정확히 가운데에 놓이고 양쪽 절반 구간
  (A–M, M–B)을 같은 색으로 그려 두 절반 길이(|AM|=|MB|)가 같음을 드러내, "두 점의 중심
  (center / balance point)을 구한다"는 작업 흐름을 보인다. 핵심 관계는 두 점 → 중점 하나뿐이다.
  핵심 구별점은 **파라미터가 없는 고정 중심**이라는 것이다: 가변 t로 직선 위 보간점 family를
  sweep하는 `vec-lerp-points`(`lerp`, 두 끝점 모두 drag)와 달리 midpoint은 t=0.5 고정 중심이라
  파라미터가 개입하지 않고, midpoint를 **입력**으로 받아 대칭 segment를 구성하는 정반대 방향의
  `segment-from-midpoint`(`fromMidpointAngleLength`)과도 분리된다. mid(x,y)·|AB|·half(=|AM|=|MB|)는
  모두 같은 단일 `midpoint` 출력을 점·전체거리·절반거리 형태로 읽은 분해 diagnostics이지 두 번째
  관계가 아니다(`vec-aim-direction`의 dir/angle/|dir| 선례). 별도 domain import 없이 단일 vec
  domain을 유지하고 A·B·M 모두 `{x, y}` object literal로 구성한다. 라이브 degenerate warn 없음:
  B를 A에 겹치면(`|AB|≈0`) `midpoint`이 throw 없이 M=A=B를 반환해 세 점이 한 점으로 모이는 게
  자체로 드러나므로 라이브 warn 색을 억지로 만들지 않는다(`group-bounds`·`segment-from-circle`
  선례). NaN/Infinity 좌표(B 핸들 화면 clamp + 고정 finite A라 미발생)는 주석으로만 둔다.
  diagnostics는 mid(x,y)·|AB|·half 3개만 표시한다. drag당 1회 단발 object 결과라 allocating
  `midpoint`을 쓴다(`midpointInto` out-buffer scaffold 미사용, `vec-aim-direction`의 `directionTo`
  선례, allocating 호출이 `midpointInto` companion도 커버). ticker render는 저장 state만 그려
  프레임당 vectra 할당이 없다. 가변 t 직선 보간 `vec-lerp-points`(`lerp`), midpoint 입력 대칭
  segment 구성 `segment-from-midpoint`(`fromMidpointAngleLength`)과 분리한 "두 점 → 중점
  (center / balance point)" 단일 개념 예제로, `vec/midpoint`/`midpointInto` leaf의 첫 연결이다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/vec` namespace는 다수
  vec 예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `pixijs`, `phaser`
- 작업 흐름: triangle rect overlap (삼각형 hitbox가 사각 영역(AABB)에 닿는가 = collision / hit-test boolean)
- 관련 함수: `intersects/intersectsRectTriangle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-rect-overlap` (`apps/pixi-demo/src/examples/triangle-rect-overlap`)
- 설명: 화면 고정 사각 영역(AABB)과 draggable 삼각형 hitbox를 두고, 삼각형을 drag하면
  `intersectsRectTriangle(rect, triangle)`이 두 도형이 겹치거나 접하는지 매 프레임 boolean으로
  판정한다. 겹치면 삼각형·사각형이 hit 색, 떨어지면 clear 색으로 바뀌어 "이 삼각형 hitbox
  (스파이크/돛/스프라이트)가 사각 영역(타일/패널/존)에 닿는가?"라는 collision / hit-test 작업
  흐름을 보인다. 핵심 관계는 삼각형 ∩ 사각형 하나뿐이다. overlap 패밀리가 shape pair마다 예제를
  분리해 온 선례(circle 패밀리 `circle-circle-overlap`·`circle-rect-overlap`, ellipse 패밀리
  `ellipse-circle-overlap`·`ellipse-rect-overlap`)를 따라, triangle도 `triangle-triangle-overlap`
  (삼각형 vs 삼각형)에 이어 triangle × rect(AABB) shape pair를 분리한다. boolean predicate라
  분해할 scalar가 없어 diagnostics는 overlap(yes/no) + shape 파라미터(rect w×h·triangle bbox w×h)만
  두고, SAT 분리축 투영·교점 좌표·rect edge crossing은 복잡도 gate를 깨는 두 번째 표현이라 의도적으로
  그리지 않는다(`triangle-triangle-overlap`이 SAT 분리축을 그리지 않은 직계 선례, `ray-circle-hit`의
  boolean-only 선례). 별도 domain import 없이 단일 intersects domain을 유지하고 삼각형은 object
  literal(`{a, b, c}`), rect는 `{x, y, width, height}`로 구성한다. empty rect(`width/height ≤ 0`)→
  false는 고정 양수 dim이라 미발생·degenerate triangle(면적 0·non-finite vertex)→false는 고정
  non-degenerate 모양을 평행이동만 하므로 미발생·NaN/Infinity 좌표(삼각형 기준점 화면 clamp +
  고정 finite rect라 미발생)는 주석으로만 둔다. `intersectsRectTriangle`은 finite·non-degenerate
  입력에서 실패하지 않아 라이브 warn 색을 억지로 만들지 않는다(`ellipse-rect-overlap`·
  `triangle-triangle-overlap` 선례). closed boundary 포함(접점도 true)은 접하는 순간 색 전환으로
  드러난다. diagnostics는 overlap·rect·tri 3개만 표시한다. boolean 반환이라 `*Into` companion이 없어
  그대로 호출하고 render hot path에 vectra 할당이 없다. 두 원 `circle-circle-overlap`, 원↔AABB
  `circle-rect-overlap`, 타원↔원 `ellipse-circle-overlap`, 타원↔AABB `ellipse-rect-overlap`, 두 삼각형
  `triangle-triangle-overlap`, 두 AABB `bounds-bounds-overlap`, rect⊇rect 포함 `rect-contains-rect`,
  점∈삼각형 `triangle-contains-point`와 분리한 "triangle × rect 겹침 boolean(collision / hit-test)"
  단일 개념 예제로, overlap 패밀리에 triangle × AABB shape pair를 더한
  `intersects/intersectsRectTriangle` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다
  (`g.text` 미사용). `@cp949/vectra/intersects` namespace는 다수 overlap·ray 예제가 이미 sandbox
  allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `pixijs`, `phaser`, `p5.js`
- 작업 흐름: random point on segment (선분을 따라 균일 난수 점을 흩뿌리는 파티클 emit = uniform sampling on a segment)
- 관련 함수: `random/pointOnSegment`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:random-point-on-segment` (`apps/pixi-demo/src/examples/random-point-on-segment`)
- 설명: 화면 고정 spawn edge(선분)에서 한 끝점 핸들 1개를 drag하면 매 프레임 `pointOnSegment(seg)`이
  그 live 선분 위에 균일 난수 점을 emit한다. 끝점을 옮기면 새 점들이 항상 live 선분을 따라
  균일하게 뿌려져, "한 선분(spawn edge)을 따라 파티클을 균일하게 emit한다"(uniform sampling on a
  segment)는 작업 흐름을 보인다. 핵심 관계는 선분 → 선분 위 균일 난수 점 하나뿐이다. 점마다
  retain되는 distinct 결과라 allocating `pointOnSegment`을 쓴다(`pointOnSegmentInto` out-buffer
  scaffold 미사용; 단일 reused buffer를 매 프레임 재기록하는 `cursor-chase`의 `moveTowardPointInto`
  hot path와 대비되는, retain되는 scatter라 allocating이 맞는 경우). 점은 array 상한 `MAX_POINTS`로
  FIFO 제거하고 최신일수록 진하게(alpha 램프) 그려 흐르는 emit를 보이지만, fade/FIFO는 emit
  rendering 정책일 뿐 두 번째 관계가 아니다. 베르누이 시행 빈도 수렴 `bernoulli-trial-tally`(확률
  수렴 viz)와 달리 공간 균일 샘플링이라 random 도메인에서 구별되는 첫 geometry sampling 예제다.
  `t∈[0,1)` 반열림이라 b 끝점은 정확히 샘플되지 않고, `a===b`(끝점 겹침)면 `pointOnSegment`이
  endpoint를 throw 없이 반환해 점들이 한 점으로 모이는 게 자체로 드러나므로 라이브 warn 색을
  억지로 만들지 않는다(`group-bounds`·`segment-from-circle` 선례). 끝점 화면 clamp + default rng가
  finite t라 NaN/Infinity는 미발생(주석으로만). diagnostics는 points(현재/MAX)·edge len·drag 안내
  3개만 표시한다. rect/circle/triangle 등 다른 sampling 도형은 별도 도형이라 끌어오지 않는다.
  `random/point-on-segment` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/random` namespace는 `bernoulli-trial-tally` 등이 이미 sandbox allowlist
  2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `unity`, `pixijs`, `p5.js`
- 작업 흐름: vec from angle (스칼라 각 θ → 단위 방향 벡터 = polar→cartesian 단위 방향 구성)
- 관련 함수: `vec/fromAngle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-from-angle` (`apps/pixi-demo/src/examples/vec-from-angle`)
- 설명: 화면 위쪽 수평 각도 슬라이더 핸들 1개를 drag하면 슬라이더 위치(1 DOF)가 스칼라 각
  θ∈[0,2π)로 매핑되고 `fromAngle(θ)`가 그 각의 단위 방향 벡터 `(cos θ, sin θ)`를 단위원 위에
  다시 구성한다. 슬라이더를 끌면 단위 벡터 arrow가 단위원을 쓸며 회전하고 길이는 항상 `|dir|=1`로
  일정해, "각도값 하나에서 단위 방향을 만든다"(polar→cartesian unit direction)는 구성 작업 흐름을
  보인다. 핵심 관계는 스칼라 각 → 단위 방향 벡터 하나뿐이다. 핵심 구별점은 **입력이 점이 아닌 순수
  각도값**이라는 것이다: 두 점에서 방향을 얻는 `directionTo`(`vec-aim-direction`)와 달리 fromAngle은
  점 쌍이 개입하지 않아, 입력을 2D 핸들에서 `atan2`로 뽑으면 `directionTo(center, handle)`과 동치가
  되어 fromAngle 고유 가치가 사라지는 함정을 슬라이더(스칼라 입력)로 차단한다(신규 함정
  `from-angle-scalar-input-not-point` 등록). angle°(=θ를 도로 표시)·dir(cos,sin)·|dir|(=1)은 모두
  같은 단일 `fromAngle` 출력을 각·성분·길이 형태로 읽은 분해 diagnostics이지 두 번째 관계가 아니다
  (`vec-aim-direction`의 dir/angle/|dir|, `vec-surface-normal`의 n/⟂/|n| 선례와 같다). 0° 기준 ray
  (+x 방향 faint)는 각도 원점을 보이는 보조선이지 두 번째 관계가 아니다. 별도 domain import 없이 단일
  vec domain을 유지하고 슬라이더·단위원은 inline 산술로 구성한다. 라이브 degenerate warn 없음:
  `fromAngle`은 항상 길이 1 단위 벡터를 반환하고 throw/붕괴가 없어 라이브 warn 색을 억지로 만들지
  않는다(`group-bounds`·`segment-from-circle` 선례). non-finite 각(슬라이더 위치를 트랙 범위로 clamp +
  `*2π` 매핑이라 항상 finite)은 주석으로만 둔다. diagnostics는 angle°·dir(cos,sin)·|dir|=1 3개만
  표시한다. 슬라이더 변경당 1회 단발 object 결과라 allocating `fromAngle`을 쓴다(`fromAngleInto`
  out-buffer scaffold 미사용, `vec-aim-direction`의 `directionTo`·`vec-surface-normal`의 `normalLeft`
  선례, allocating 호출이 `fromAngleInto` companion도 커버). ticker render는 저장 state만 그려 프레임당
  vectra 할당이 없다. 두 점 → 단위 방향(look-at) `vec-aim-direction`(`directionTo`), 표면 방향 → 수직
  단위 법선 `vec-surface-normal`(`normalLeft`), 두 방향 보간 `vec-slerp-direction`(`slerp`), heading 각
  `angle-heading-turn`/`angle-unit-compass`(angle domain), 벡터 → 극좌표 역변환 `polar-coordinate-plot`
  (`toPolar`)과 분리한 "스칼라 각 → 단위 방향 벡터(polar→cartesian unit direction)" 단일 개념 예제로,
  `vec/fromAngle`/`fromAngleInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/vec` namespace는 다수 vec 예제가 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `paper.js`, `figma`
- 작업 흐름: segment supporting line foot (점을 선분의 지지직선(무한 연장)에 투영한 수선의 발 = unclamped projection / foot of perpendicular)
- 관련 함수: `segment/nearestPointOnSupportingLine`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-supporting-line-foot` (`apps/pixi-demo/src/examples/segment-supporting-line-foot`)
- 설명: 화면 고정 선분(edge)에서 point 핸들 1개를 drag하면 `nearestPointOnSupportingLine(seg, point)`이
  그 점을 선분의 **supporting infinite line**(끝점 너머로 무한 연장된 직선)에 투영한 수선의 발을
  다시 계산한다. 점을 선분 끝점 바깥으로 끌면 발이 선분을 벗어나 연장선(faint) 위에 놓여,
  endpoint에 갇히는 clamp형 최근점(`closestPoint`)과 달리 "점을 지지직선에 unclamped로 투영한다"는
  작업 흐름을 보인다. 핵심 관계는 점 → 지지직선 위 수선의 발 하나뿐이다. foot(점)·dist(부호
  거리)·side(L/R/on)는 같은 "점 vs 지지직선" 관계를 점·scalar·부호 형태로 읽은 분해 diagnostics이지
  두 번째 관계가 아니다(`vec-aim-direction`의 dir/angle/|dir|, `vec-surface-normal`의 n/⟂/|n| 선례와
  같다). dist는 `signedDistanceToSupportingLine`, side는 `sideOfSupportingLine`이 같은 segment 도메인
  지지직선 관계로 제공한다. 발에는 직각(⟂) marker를 그려 수선이 직선과 90°임을 보인다. 별도 domain
  import 없이 단일 segment domain을 유지하고 선분은 object literal(`{a, b}`)로 구성한다. zero-length
  선분(점 무관 시작점 반환, signed/side=0)은 선분이 고정 non-zero라 미발생·NaN/Infinity 좌표(point
  핸들 화면 clamp + 고정 finite 선분이라 미발생)는 주석으로만 둔다. `nearestPointOnSupportingLine`은
  finite 입력에서 throw하지 않고, 점이 직선 위(dist≈0)는 warn이 아니라 side="on"으로 자연스럽게
  드러나므로 라이브 warn 색을 억지로 만들지 않는다(`group-bounds`·`segment-from-circle` 선례).
  diagnostics는 foot(x,y)·dist·side 3개만 표시한다. drag당 1회 단발 object 결과라 allocating
  `nearestPointOnSupportingLine`을 쓴다(`nearestPointOnSupportingLineInto` out-buffer scaffold 미사용,
  `segment-from-circle`·`segment-from-normal` 선례, allocating 호출이 companion도 커버). ticker render는
  저장 state만 그려 프레임당 vectra 할당이 없다. endpoint-clamp 최근점·base 위 직각 rib
  `segment-from-normal`(`fromNormal`)·중심 대칭 지름 `segment-from-circle`(`fromCircle`)·유한 선분 교점
  `segment-intersection-point`·무한선 진단 묶음 `infinite-line-diagnostics-lab`(infinite-line domain의
  projectPoint/side)과 분리한 "점 → 선분 지지직선 수선의 발(unclamped projection)" 단일 개념 예제로,
  `segment/nearestPointOnSupportingLine`/`nearestPointOnSupportingLineInto` leaf의 첫 연결이다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/segment` namespace는 다수
  segment 예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `pixijs`, `phaser`, `unity`
- 작업 흐름: ray circle hit (emitter에서 쏜 forward 빔이 원형 타깃(closed disk)에 명중하는가 = raycast vs circle boolean)
- 관련 함수: `intersects/intersectsCircleRay`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ray-circle-hit` (`apps/pixi-demo/src/examples/ray-circle-hit`)
- 설명: 화면 고정 emitter에서 쏜 빔(forward ray, t ≥ 0)의 방향을 aim handle 1개로 돌리면
  `intersectsCircleRay(circle, ray)`가 그 빔이 고정 원(closed disk)에 명중하는지 매 프레임
  boolean으로 판정한다. 명중하면 hit 색, 비껴가면 clear 색으로 바뀌어 "이 forward 빔이 원형
  타깃에 명중하는가?"(raycast vs circle)라는 작업 흐름을 보인다. ray는 forward(t ≥ 0)만 뻗으므로
  빔을 원 반대로 돌리면 backward 연장선이 원을 지나도 hit=no인 점이 무한 직선
  (`intersectsCircleInfiniteLine`)과 구별되는 핵심이며, `ray-segment-hit`·`ray-bounds-hit`의
  forward 구별과 같은 단일 성질이다. 타깃 도형만 다른 ray 예제와 분리한다: segment 타깃
  `ray-segment-hit`(`intersectsRaySegment`), AABB 타깃 `ray-bounds-hit`(`intersectsBoundsRay`),
  360° sweep nearest-hit `ray-cast`, 두 ray 교점 `ray-intersection-lab`. ray·circle 모두 object
  literal(`{origin, direction}`·`{center, radius}`)로 구성해 별도 domain import 없이 단일
  intersects domain을 유지한다. boolean predicate라 분해할 scalar가 없어 diagnostics는
  hit(yes/no)·aim°·drag 안내만 두고, 교점 좌표·진입/이탈 t·nearest entry point는 복잡도 gate를
  깨는 두 번째 표현이라 의도적으로 그리지 않는다(`ray-segment-hit`·`ray-bounds-hit` 직계 선례).
  `radius ≤ 0`→false(고정 양수 radius라 미발생)·origin이 disk 내부→true(closed disk, emitter를
  원 밖에 둬 forward/backward 구별이 보임)·direction zero-vector(aim을 emitter에 겹침→점 환원
  containment)·NaN/Infinity(aim 화면 clamp + 고정 finite emitter/circle이라 미발생)는 주석으로만
  둔다. closed disk 포함(둘레 접점도 true)은 접하는 순간 색 전환으로 드러난다.
  `intersectsCircleRay`은 finite·non-degenerate 입력에서 실패하지 않아 라이브 warn 색을 억지로
  만들지 않는다(`ray-bounds-hit`·`ellipse-rect-overlap` 선례). boolean 반환이라 `*Into` companion이
  없어 그대로 호출하고 render hot path에 vectra 할당이 없다. "forward ray × circle 교차 boolean
  (raycast vs circle)" 단일 개념 예제로, `intersects/intersectsCircleRay` leaf의 첫 연결이다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/intersects` namespace는
  다수 overlap·ray 예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `unity`, `pixijs`, `paper.js`
- 작업 흐름: vec surface normal (표면/벽 방향 벡터 → 그에 수직인 단위 법선 = surface normal / 바깥 법선)
- 관련 함수: `vec/normalLeft`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-surface-normal` (`apps/pixi-demo/src/examples/vec-surface-normal`)
- 설명: 화면 고정 anchor(표면/벽 위 한 점)에서 direction 핸들 1개를 drag하면 `normalLeft(dir)`이
  표면 방향 벡터(anchor→handle)에 수직인 단위 법선을 다시 계산한다. 핸들을 멀리/가까이 끌어도
  법선 arrow 길이는 항상 NORMAL_LEN으로 일정하고(단위 벡터라 거리가 정규화됨) 표면 방향에 대해
  항상 90°를 이뤄, "표면/벽의 방향에서 바깥 법선(수직 단위 벡터)을 얻는다"는 작업 흐름을 보인다.
  핵심 관계는 방향 벡터 → 수직 단위 법선 하나뿐이다. anchor 코너 직각(⟂) 표식·고정 길이(|n|=1)·
  법선 각은 모두 같은 단일 `normalLeft` 출력을 직각 marker·`Math.hypot`/`atan2` inline으로 드러내는
  분해 표시이지 두 번째 관계가 아니다(`vec-aim-direction`의 dir+angle+|dir|, `segment-from-normal`의
  직각 marker 선례와 같다). `normalLeft`는 CCW `(-y, x)`를 normalize하므로 CW 형제 `normalRight`
  `(y, -x)`는 두 번째 출력(두 번째 관계)이라 의도적으로 그리지 않는다. 별도 domain import 없이 단일
  vec domain을 유지하고 표면 방향·법선 모두 inline 산술로 구성한다. 핸들을 anchor에 겹침
  (`|dir| ≤ DEGEN_EPS=2px`)면 `normalLeft`가 throw 없이 `(0,0)`을 반환해 법선 arrow가 0 길이로 붕괴한
  zero vector degenerate를 warn 색으로 라이브 강조한다(함수 documented 동작, `vec-aim-direction`·
  `vec-wall-slide`의 zero-length 붕괴 warn 선례). NaN/Infinity pass-through(핸들 화면 clamp라 항상
  finite)는 주석으로만 둔다. `normalLeft`는 finite 입력에서 throw하지 않아 zero 붕괴 외 라이브 warn
  색을 억지로 만들지 않는다(`vec-aim-direction` 선례). diagnostics는 n(unit x,y)·⟂(=90°, 붕괴 시 NaN)·
  |n|(=1, 붕괴 시 0) 3개만 표시한다. drag당 1회 단발 object 결과라 allocating `normalLeft`를 쓴다
  (`normalLeftInto` out-buffer scaffold 미사용, `vec-aim-direction`의 `directionTo`·`vec-wall-slide`의
  `slide` 선례, allocating 호출이 `normalLeftInto` companion도 커버). ticker render는 저장 state만 그려
  프레임당 vectra 할당이 없다. 두 점 → 단위 방향(look-at) `vec-aim-direction`(`directionTo`), 벽 법선
  반사 `vec-wall-bounce`(`reflect`), 법선 성분 제거 미끄러짐 `vec-wall-slide`(`slide`), base 위 직각 rib
  구성 `segment-from-normal`(`fromNormal`, segment domain)과 분리한 "방향 벡터 → 수직 단위 법선
  (CCW)" 단일 개념 예제로, `vec/normalLeft`/`normalLeftInto` leaf의 첫 연결이다. diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/vec` namespace는 다수 vec 예제가 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `pixijs`, `phaser`
- 작업 흐름: rect contains point (점이 고정 사각 영역 안에 있는가 = UI 버튼/존 hit-test boolean)
- 관련 함수: `rect/containsPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-contains-point` (`apps/pixi-demo/src/examples/rect-contains-point`)
- 설명: 화면 고정 사각 영역(zone)과 draggable 점 핸들 1개를 두고, 점을 drag하면
  `containsPoint(zone, point)`이 그 점이 사각 영역 안에 있는지 매 프레임 boolean으로 판정한다.
  안에 있으면 zone과 점이 hit 색, 밖이면 clear 색으로 바뀌어 "이 점(포인터/오브젝트)이 사각
  영역(버튼/존) 위에 있는가?"라는 hit-test 작업 흐름을 보인다. 핵심 관계는 점 ∈ 사각 영역
  하나뿐이다. closed boundary 포함(변 위 점도 inside)은 변에 닿는 순간 색 전환으로 드러나고,
  점→네 변 거리/slack 분해나 가장 가까운 edge는 복잡도 gate를 깨는 두 번째 표현이자
  `vec-clamp-region`(점을 box로 clamp)과 화면이 겹쳐 의도적으로 그리지 않는다. 별도 domain
  import 없이 단일 rect domain을 유지하고 zone은 object literal(`{x, y, width, height}`)로
  구성한다. empty rect(`width ≤ 0`·`height ≤ 0`)→false는 고정 양수 dim이라 미발생·
  NaN/Infinity 좌표(점 화면 clamp + 고정 finite rect라 미발생)는 주석으로만 둔다.
  `containsPoint`는 finite 입력에서 throw하지 않아 라이브 warn 색을 억지로 만들지 않는다
  (`ray-bounds-hit`·`ellipse-rect-overlap` 선례). diagnostics는 inside(yes/no)·point(x,y)·
  drag 안내 3개만 표시한다. boolean 반환이라 `*Into` companion이 없어 그대로 호출하고 render
  hot path에 vectra 할당이 없다. rect⊇rect 완전 포함 `rect-contains-rect`(`containsRect`,
  RectLike vs RectLike), 삼각형 포함 `triangle-contains-point`, 점을 box로 가두는
  `vec-clamp-region`(`clampInto`), shape-shape overlap 패밀리(`circle-rect-overlap`·
  `ellipse-rect-overlap`·`bounds-bounds-overlap`)와 분리한 "점 ∈ 사각 영역 hit-test boolean"
  단일 개념 예제로, `rect/containsPoint` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/rect` namespace는 `rect-perimeter-walk`·
  `rect-halves-split` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이
  없다.

- reference: `phaser`, `pixijs`, `unity`
- 작업 흐름: vec wall bounce (입사 빔을 고정 벽 법선에 대해 반사 = 거울/레이저/당구 bounce, 입사각=반사각·속력 보존)
- 관련 함수: `vec/reflect`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-wall-bounce` (`apps/pixi-demo/src/examples/vec-wall-bounce`)
- 설명: 화면 고정 벽(충돌 표면)에 입사 빔의 source 핸들 1개를 drag하면 `reflect(v, normal)`이 입사
  벡터를 벽 법선에 대해 반사한 반사 빔을 다시 계산한다. 핸들을 어디로 끌든 반사 빔은 입사각과
  같은 각으로 법선 반대편으로 튀어 나가고 속력(길이)은 보존돼, 거울/레이저/당구처럼 벽에서 튕기는
  bounce 작업 흐름을 보인다. 핵심 관계는 입사 벡터 → 벽 법선 반사 하나뿐이다. 입사각=반사각(법선
  기준)·속력 보존은 같은 단일 `reflect` 출력을 입사·반사 벡터에서 각각 독립으로 `atan2`/내적/
  `Math.hypot` inline 계산해 같은 수로 드러내는 분해 표시이지 두 번째 관계가 아니다(`vec-aim-direction`의
  dir+angle+|dir|, `vec-wall-slide`의 slid+normal 성분 inline 분해 선례와 같다). `reflect`는 **임의 길이
  normal**을 받으므로(`v − 2·dot(v,n)/|n|²·n`) 벽 방향에서 만든 **정규화하지 않은** raw normal을 그대로
  넘겨, 이미 `reflect`**Across**Normal(unit normal 전제)을 쓰는 `vector-projection-reflection-lab`과 구별되는
  `reflect` 고유 성질을 시연한다. 거울축 얇은 법선 guide line은 입사각=반사각의 기준축을 보이는 보조선이지
  두 번째 관계가 아니다(`vec-aim-direction`의 faint raw line 선례). 별도 domain import 없이 단일 vec
  domain을 유지하고 입사 벡터·벽·법선 모두 object literal/inline로 구성한다. source 핸들을 impact 점에
  겹침(`|v| ≤ DEGEN_EPS=2px`)면 `reflect`가 `(0,0)`을 반환해 입사·반사 빔이 점으로 붕괴한 zero-length
  degenerate를 warn 색으로 라이브 강조한다(함수는 zero 벡터를 valid 반환, `vec-aim-direction`·
  `vec-wall-slide`의 zero-length 붕괴 warn 선례). `lengthSq(normal)===0`→vector 복사(벽 고정 non-zero라
  미발생)·NaN/Infinity pass-through(핸들 화면 clamp + 고정 finite anchor/normal이라 미발생)는 주석으로만
  둔다. `reflect`는 finite 입력에서 throw하지 않아 zero-length 외 라이브 warn 색을 억지로 만들지 않는다
  (`segment-from-circle`·`ray-bounds-hit` 선례). diagnostics는 in°·out°(=in)·speed(보존) 3개만 표시한다.
  drag당 1회 단발 object 결과라 allocating `reflect`를 쓴다(`reflectInto` out-buffer scaffold 미사용,
  `vec-wall-slide`의 `slide`·`vec-aim-direction`의 `directionTo` 선례, allocating 호출이 `reflectInto`
  companion도 커버). ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다. 법선 성분 제거(벽 따라
  미끄러짐) `vec-wall-slide`(`slide`), unit normal 반사·투영 묶음 lab `vector-projection-reflection-lab`
  (`reflectAcrossNormal`·`projectOn`), 단위 방향 조준 `vec-aim-direction`(`directionTo`)과 분리한 "입사
  벡터 → 벽 법선 반사(거울 bounce, 임의 길이 normal)" 단일 개념 예제로, `vec/reflect`/`reflectInto` leaf의
  첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/vec` namespace는
  다수 vec 예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `paper.js`, `figma`
- 작업 흐름: triangle from segment apex (고정 밑변 + 자유 apex 정점 → 일반 삼각형 구성)
- 관련 함수: `triangle/fromSegmentApex`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-from-segment-apex` (`apps/pixi-demo/src/examples/triangle-from-segment-apex`)
- 설명: 화면 고정 밑변(base segment) 위에서 apex 정점 핸들 1개를 자유롭게(2 DOF) drag하면
  `fromSegmentApex(base, apex)`가 base 두 끝점(a,b)과 apex(c)로 일반 삼각형을 다시 구성한다.
  apex를 어디로 끌든 base 두 변은 고정이라 "고정 밑변에 자유 꼭짓점을 얹어 임의 삼각형을
  세운다"는 구성 작업 흐름을 보인다. apex가 1 DOF(base 수직축 구속, signed height)인
  `triangle-from-segment-height`의 **이등변** 구성과 달리 apex가 **자유 2 DOF**라 **일반**
  삼각형이라는 점에서 분리된다(distinct DOF·도형류). 핵심 관계는 triangle = base + apex 하나뿐이다.
  세 변 길이 |AB|(고정 base)·|AC|·|BC|는 `triangle-build-equilateral`이 세 변 등길이를 inline으로
  보인 선례처럼 같은 단일 구성의 분해 표시이지 두 번째 관계가 아니다(|AB|는 setup 1회 inline,
  |AC|·|BC|는 `Math.hypot` inline). 별도 domain import 없이 단일 triangle domain을 유지하고 base는
  object literal(`{a, b}`), apex는 `{x, y}`로 구성한다. apex가 base 지지선 위(collinear)면 면적 0
  flat 삼각형이 되는 degenerate를 base 지지선까지 부호 거리 `|cross|/baseLen ≤ DEGEN_EPS=2px`로
  warn 색으로 라이브 강조한다(함수는 면적 0 삼각형을 그대로 valid 기록, cross는 inline). base
  zero-length(고정 positive라 미발생)·NaN/Infinity 좌표(apex 화면 clamp + 고정 finite base라 미발생)는
  주석으로만 둔다. `fromSegmentApex`은 finite 입력에서 throw하지 않아 collinear 외 라이브 warn 색을
  억지로 만들지 않는다(`triangle-from-segment-height` 선례). diagnostics는 AB·AC·BC 3개만 표시한다.
  drag당 1회 단발 object 결과라 allocating `fromSegmentApex`를 쓴다(`fromSegmentApexInto` out-buffer
  scaffold 미사용, `triangle-from-segment-height`·`triangle-build-equilateral` 선례, allocating 호출이
  `fromSegmentApexInto` companion도 커버). ticker render는 저장 apex state만 그려 프레임당 vectra
  할당이 없다. 이등변 height 구성 `triangle-from-segment-height`(`fromSegmentHeight`), 정삼각형 강체
  `triangle-build-equilateral`, 직각삼각형 `triangle-build-right`, **주어진** 삼각형의 center/중선/
  분류/포함/겹침 `triangle-centers`/`triangle-medians-concurrency`/`triangle-barycentric-lab`/
  `triangle-side-classification`/`triangle-closest-point`/`triangle-contains-point`/
  `triangle-triangle-overlap`과 분리한 "base segment + 자유 apex → 일반 삼각형 구성" 단일 개념
  예제로, `triangle/fromSegmentApex`/`fromSegmentApexInto` leaf의 첫 연결이다. diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/triangle` namespace는
  `triangle-from-segment-height`·`triangle-centers` 등이 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `pixijs`, `phaser`, `unity`
- 작업 흐름: ray bounds hit (emitter에서 쏜 forward 빔이 사각 영역(AABB)에 들어가는가 = raycast vs AABB / 영역 진입 boolean)
- 관련 함수: `intersects/intersectsBoundsRay`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ray-bounds-hit` (`apps/pixi-demo/src/examples/ray-bounds-hit`)
- 설명: 화면 고정 emitter에서 쏜 빔(forward ray, t ≥ 0)의 방향을 aim handle 1개로 돌리면
  `intersectsBoundsRay(zone, ray)`가 그 빔이 고정 사각 영역(AABB)에 들어가는지 매 프레임 boolean으로
  판정한다. 들어가면 hit 색, 비껴가면 clear 색으로 바뀌어 "이 forward 빔이 사각 영역에 들어가는가?"
  (raycast vs AABB / broad-phase 영역 진입)라는 작업 흐름을 보인다. ray는 forward(t ≥ 0)만 뻗으므로
  빔을 영역 반대로 돌리면 backward 연장선이 영역을 지나도 hit=no인 점이 무한 직선
  (`intersectsBoundsInfiniteLine`)·두 AABB 겹침(`bounds-bounds-overlap`)과 구별되는 핵심이며,
  `ray-segment-hit`의 forward 구별과 같은 단일 성질이다. ray·bounds 모두 object literal
  (`{origin, direction}`·`{min, max}`)로 구성해 별도 domain import 없이 단일 intersects domain을
  유지한다. boolean predicate라 분해할 scalar가 없어 diagnostics는 hit(yes/no) + aim 각도 2개와 drag
  안내만 두고, 교점 좌표·진입/이탈 t·nearest entry point는 복잡도 gate를 깨는 두 번째 표현이자
  `ray-cast`의 visibility 구성과 화면이 겹쳐 의도적으로 그리지 않는다(`ray-segment-hit` 직계 선례).
  inverted bounds(min>max)→false(고정 valid box라 미발생)·closed boundary 포함(접점도 true, 색 전환으로
  드러남)·direction zero-vector(aim을 emitter에 겹침→점 환원 containment)·NaN/Infinity(aim 화면 clamp +
  고정 finite emitter/box라 미발생)는 주석으로만 둔다. `intersectsBoundsRay`은 finite·non-inverted
  입력에서 실패하지 않아 라이브 warn 색을 억지로 만들지 않는다(`ellipse-rect-overlap`·`group-bounds`
  선례). diagnostics는 hit·aim°·drag 안내만 표시한다. boolean 반환이라 `*Into` companion이 없어 그대로
  호출하고 render hot path에 vectra 할당이 없다. forward ray × 유한 segment `ray-segment-hit`
  (`intersectsRaySegment`), 360° sweep nearest-hit `ray-cast`(`singleIntersectionSegmentRayInto`), 두 ray
  교점 `ray-intersection-lab`(`Rayx.singleIntersection`), 두 AABB 겹침 `bounds-bounds-overlap`,
  rect⊇rect 포함 `rect-contains-rect`(`containsRect`)와 분리한 "forward ray × AABB 교차 boolean
  (raycast vs AABB)" 단일 개념 예제로, `intersects/intersectsBoundsRay` leaf의 첫 연결이다. diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/intersects` namespace는 다수 overlap·ray
  예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `p5.js`, `pixijs`, `phaser`
- 작업 흐름: vec aim direction (고정 source에서 target을 향하는 단위 방향 벡터 = look-at / 조준 방향)
- 관련 함수: `vec/directionTo`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-aim-direction` (`apps/pixi-demo/src/examples/vec-aim-direction`)
- 설명: 화면 고정 source(눈/포탑)에서 target 핸들 1개를 drag하면 `directionTo(source, target)`이
  source→target 단위 방향 벡터를 다시 계산한다. target을 멀리/가까이 끌어도 aim arrow 길이는 항상
  AIM_LEN으로 일정해(단위 벡터라 거리가 정규화됨), "source가 target을 바라보는 방향(look-at /
  조준)을 단위 벡터로 얻는다"는 작업 흐름을 보인다. 핵심 관계는 source→target 단위 방향 하나뿐이다.
  faint raw line(source→target 실제 거리 전체)과 고정 길이 aim arrow의 길이 대비는 "방향은 유지,
  크기는 버림"이라는 같은 단일 관계의 inline 분해 표시이지 두 번째 관계가 아니다(`vec-wall-slide`의
  slid·normal inline 분해 선례와 같다). 별도 domain import 없이 단일 vec domain을 유지하고, angle은
  `atan2(dir)`·|dir|은 `Math.hypot(dir)` inline으로 같은 단위 벡터의 방향·길이를 드러낸다. target을
  source에 겹침(`dist ≤ DEGEN_EPS=2px`)면 `directionTo`가 throw 없이 `(0,0)`을 반환해 aim arrow가
  0 길이로 붕괴한 degenerate를 warn 색으로 라이브 강조한다(함수 documented 동작). NaN/Infinity
  pass-through(target 화면 clamp라 finite)는 주석으로만 둔다. diagnostics는 dir(unit x,y)·angle°·
  |dir|(=1, 붕괴 시 0) 3개만 표시한다. drag당 1회 단발 object 결과라 allocating `directionTo`를 쓴다
  (`directionToInto` out-buffer scaffold 미사용, `vec-wall-slide`의 `slide` 선례, allocating 호출이
  `directionToInto` companion도 커버). ticker render는 저장 state만 그려 프레임당 vectra 할당이 없다.
  두 방향 사이 보간 `vec-slerp-direction`(`slerp`), heading 각 `angle-heading-turn`/`angle-unit-compass`
  (angle domain), distance 기반 추적 `cursor-chase`, ray 위 부호 거리 점 `vec-point-on-ray`와 분리한
  "두 점 → 단위 방향 벡터(look-at / 조준)" 단일 개념 예제로, `vec/directionTo`/`directionToInto` leaf의
  첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/vec` namespace는
  다수 vec 예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `pixijs`, `phaser`, `geogebra`
- 작업 흐름: ray segment hit (emitter에서 쏜 forward 빔이 벽 segment를 가로지르는가 = line-of-sight / 레이저 빔 차단 boolean)
- 관련 함수: `intersects/intersectsRaySegment`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ray-segment-hit` (`apps/pixi-demo/src/examples/ray-segment-hit`)
- 설명: 화면 고정 emitter에서 쏜 빔(forward ray, t ≥ 0)의 방향을 aim handle 1개로 돌리면
  `intersectsRaySegment(ray, wall)`이 그 빔이 고정 벽 segment를 가로지르는지 매 프레임 boolean으로
  판정한다. 맞으면 hit 색, 비껴가면 clear 색으로 바뀌어 "이 시선/레이저 빔이 벽에 막히는가?"라는
  line-of-sight 작업 흐름을 보인다. ray는 forward(t ≥ 0)만 뻗으므로 빔을 벽 반대로 돌리면 backward
  연장선이 벽을 지나도 hit=no인 점이 두 유한 선분 교차(`segment-segment-cross`)와 구별되는 핵심이다.
  boolean predicate라 분해할 scalar가 없어 diagnostics는 hit(yes/no) + aim 각도 2개와 drag 안내만 두고,
  교점 좌표·nearest hit point는 복잡도 gate를 깨는 두 번째 표현이자 `ray-cast`의 visibility 구성과 화면이
  겹쳐 의도적으로 그리지 않는다. ray는 object literal(`{origin, direction}`)로 구성해 별도 domain import
  없이 단일 intersects domain을 유지한다. direction zero-vector(aim을 emitter에 겹침)→점 환원
  containment·zero-length wall(고정 non-zero라 미발생)·NaN/Infinity(aim 화면 clamp + 고정 finite
  emitter/wall이라 미발생)는 주석으로만 둔다. `intersectsRaySegment`은 finite 입력에서 실패하지 않아
  라이브 warn 색을 억지로 만들지 않는다(`segment-segment-cross` 선례). 360° sweep nearest-hit visibility
  `ray-cast`(`singleIntersectionSegmentRayInto`), 두 ray 교점 `ray-intersection-lab`
  (`Rayx.singleIntersection`), ray 위 부호 거리 점 `vec-point-on-ray`(`Vectorx.pointOnRay`), 두 유한 선분
  교차 `segment-segment-cross`(`intersectsSegmentSegment`)와 분리한 "forward ray × 유한 segment 교차
  boolean(line-of-sight)" 단일 개념 예제로, `intersects/intersectsRaySegment` leaf의 첫 연결이다. boolean
  반환이라 `*Into` companion이 없어 그대로 호출하고 render hot path에 vectra 할당이 없다. diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/intersects` namespace는 다수 overlap 예제가
  이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `pixijs`, `phaser`
- 작업 흐름: ellipse rect overlap (타원형 hitbox가 사각 영역(AABB)에 닿는가 = collision / hit-test boolean)
- 관련 함수: `intersects/intersectsEllipseRect`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ellipse-rect-overlap` (`apps/pixi-demo/src/examples/ellipse-rect-overlap`)
- 설명: 화면 고정 사각 영역(AABB)과 draggable 타원형 cursor를 두고, 타원을 drag하면
  `intersectsEllipseRect(ellipse, rect)`가 두 도형이 겹치거나 접하는지 매 프레임 boolean으로 판정한다.
  겹치면 두 도형이 hit 색, 떨어지면 clear 색으로 바뀌어 "이 타원형 hitbox(스프라이트/패들)가 사각
  영역(타일/존/버튼)에 닿는가?"라는 collision / hit-test 작업 흐름을 보인다. circle 패밀리가
  `circle-circle-overlap`·`circle-rect-overlap`로 shape pair를 분리한 선례를 따라, ellipse도
  `ellipse-circle-overlap`에 이어 ellipse × rect(AABB) shape pair를 분리한다. 타원은 비균등 반경이라
  `circle-rect-overlap`처럼 "rect 안 최근접점 + dist ≤ r" 단일 scalar로 분해되지 않는, 원↔AABB와
  구별되는 겹침 판정이다. boolean predicate라 분해할 scalar가 없어 diagnostics는 overlap(yes/no) +
  shape 파라미터(axes rx×ry·rect w×h)만 두고, ellipse boundary 최근접점·rect edge crossing·단위공간
  거리 분해는 복잡도 gate를 깨는 두 번째 표현이자 `ellipse-closest-point`와 화면이 겹쳐 의도적으로
  그리지 않는다(`ellipse-circle-overlap` 직계 선례, `circle-rect-overlap`의 nearest point/dist 분해를
  ellipse로 옮기지 않는다). 별도 domain import 없이 단일 intersects domain을 유지하고 ellipse는 object
  literal(`{center, radiusX, radiusY}`), rect는 `{x, y, width, height}`로 구성한다.
  degenerate(`rx ≤ 0`·`ry ≤ 0`·`width/height ≤ 0`)→false는 고정 양수라 미발생·NaN/Infinity
  좌표(ellipse center 화면 clamp + 고정 finite rect라 미발생)는 주석으로만 둔다.
  `intersectsEllipseRect`은 finite·non-degenerate 입력에서 실패하지 않아 라이브 warn 색을 억지로
  만들지 않는다(`ellipse-circle-overlap`·`group-bounds` 선례). closed boundary 포함(접점도 true)은
  접하는 순간 색 전환으로 드러나고, 별도 edge 색은 내부 거리 계산이 필요한 두 번째 표현이라 두지
  않는다. diagnostics는 overlap·axes·rect 3개만 표시한다. boolean 반환이라 `*Into` companion이 없어
  그대로 호출하고 render hot path에 vectra 할당이 없다. 두 원 `circle-circle-overlap`, 원↔AABB
  `circle-rect-overlap`, 타원↔원 `ellipse-circle-overlap`, 두 삼각형 `triangle-triangle-overlap`,
  두 AABB `bounds-bounds-overlap`, rect⊇rect 포함 `rect-contains-rect`, ellipse 단일 도형 관계
  `ellipse-closest-point`/`ellipse-foci-sum`/`ellipse-from-rect`/`ellipse-inspector`/
  `ellipse-uniform-expand`와 분리한 "ellipse × rect 겹침 boolean(collision / hit-test)" 단일 개념
  예제로, overlap 패밀리에 ellipse × AABB shape pair를 더한 `intersects/intersectsEllipseRect` leaf의
  첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/intersects` namespace는 다수 overlap 예제가 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `figma`, `pixijs`, `phaser`
- 작업 흐름: ellipse circle overlap (타원형 충돌체와 원형 충돌체가 닿는가 = collision / hit-test boolean)
- 관련 함수: `intersects/intersectsEllipseCircle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ellipse-circle-overlap` (`apps/pixi-demo/src/examples/ellipse-circle-overlap`)
- 설명: 화면 고정 타원(ellipse)과 draggable 원형 cursor를 두고, 원을 drag하면
  `intersectsEllipseCircle(ellipse, circle)`이 두 도형이 겹치거나 접하는지 매 프레임 boolean으로
  판정한다. 겹치면 두 도형이 hit 색, 떨어지면 clear 색으로 바뀌어 "이 원형 cursor(공/브러시)가
  타원형 영역(충돌체/존)에 닿는가?"라는 collision / hit-test 작업 흐름을 보인다. 타원은 비균등
  반경이라 두 중심 거리 한 번으로 판정할 수 없어 원↔원과 구별되는 겹침 판정이다(타원 단위 공간
  포함·타원 경계 최근접점까지 거리). boolean predicate라 분해할 scalar가 없어 diagnostics는
  overlap(yes/no) + shape 파라미터(circle radius·ellipse rx×ry)만 두고, 타원 경계 최근접점이나
  단위공간 거리 분해는 복잡도 gate를 깨는 두 번째 표현이자 `ellipse-closest-point`와 화면이 겹쳐
  의도적으로 그리지 않는다(`triangle-triangle-overlap`이 SAT 분리축 투영을 그리지 않은 선례와
  같다). 별도 domain import 없이 단일 intersects domain을 유지하고 ellipse는 object literal
  (`{center, radiusX, radiusY}`)로 구성한다. degenerate(`rx ≤ 0`·`ry ≤ 0`·`r ≤ 0`)→false는 고정
  양수라 미발생·NaN/Infinity 좌표(circle center 화면 clamp + 고정 finite ellipse라 미발생)는
  주석으로만 둔다. `intersectsEllipseCircle`은 finite·non-degenerate 입력에서 실패하지 않아
  라이브 warn 색을 억지로 만들지 않는다(`group-bounds` 선례). closed boundary 포함(접점도 true)은
  접하는 순간 색 전환으로 드러나고, 별도 edge 색은 내부 거리 계산이 필요한 두 번째 표현이라 두지
  않는다. diagnostics는 overlap·radius·axes 3개만 표시한다. boolean 반환이라 `*Into` companion이
  없어 그대로 호출하고 render hot path에 vectra 할당이 없다. 두 원 `circle-circle-overlap`(center
  거리), 원↔AABB `circle-rect-overlap`(rect 최근접점), 두 삼각형 `triangle-triangle-overlap`(SAT),
  두 AABB `bounds-bounds-overlap`(축 구간), 두 선분 `segment-segment-cross`, ellipse 단일 도형
  관계 `ellipse-closest-point`/`ellipse-foci-sum`/`ellipse-from-rect`/`ellipse-inspector`/
  `ellipse-uniform-expand`와 분리한 "ellipse × circle 겹침 boolean(collision / hit-test)" 단일
  개념 예제로, overlap 패밀리에 ellipse shape pair를 더한 `intersects/intersectsEllipseCircle`
  leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/intersects` namespace는 다수 overlap 예제가 이미 sandbox allowlist 2배열에
  등록해 allowlist·runner-html 변경이 없다.

- reference: `phaser`, `pixijs`, `unity`
- 작업 흐름: vec wall slide (벽으로 파고드는 성분을 제거해 벽을 따라 미끄러짐 = 게임 충돌 응답 wall-slide)
- 관련 함수: `vec/slide`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-wall-slide` (`apps/pixi-demo/src/examples/vec-wall-slide`)
- 설명: 화면 고정 벽(충돌 표면) 위 anchor에서 velocity tip 핸들 1개를 drag하면 `slide(v, normal)`이
  이동 벡터 `v`(=handle−anchor)에서 벽으로 파고드는 normal 성분을 제거한 slid 벡터를 다시 계산한다.
  핸들을 어디로 끌든 slid는 항상 벽 방향(직선)에 평행해, 벽에 부딪힌 오브젝트가 멈추지 않고 벽을
  따라 미끄러지는 게임 충돌 응답 작업 흐름을 보인다. slid가 벽 방향에 평행하다는 것·제거된 normal
  성분(`v − slid`, 벽에 수직)은 모두 같은 slide 관계의 inline 분해 표시이지 두 번째 관계가 아니다
  (별도 domain import 없이 inline 산술, normal도 벽 방향 `(−d.y, d.x)` inline. `vec-clamp-region`의
  축 분해 inline, `segment-from-normal`의 foot·수선 분해 inline 선례와 같다). 별도 domain import
  없이 단일 vec domain을 유지한다. velocity가 벽에 거의 수직(normal에 평행)이면 slid가 0으로 붕괴해
  벽을 따라 못 움직이는 head-on degenerate를 `|slid| ≤ DEGEN_EPS=2px`로 warn 색으로 라이브 강조한다
  (함수는 zero 벡터를 valid 반환, `segment-from-normal`의 zero-length rib warn 선례). `lengthSq(normal)
  === 0`→vector 그대로 복사(벽 고정 non-zero 길이라 미발생)·NaN/Infinity pass-through(handle 화면
  clamp + 고정 finite anchor/normal이라 미발생)는 주석으로만 둔다. diagnostics는 in°·slide(|slid|)·
  into(제거된 signed 거리) 3개만 표시한다. drag당 1회 단발 object 결과라 allocating `slide`를 쓴다
  (`slideInto` out-buffer scaffold 미사용, `segment-from-circle`·`segment-from-midpoint` 선례,
  allocating 호출이 `slideInto` companion도 커버). ticker render는 저장 state만 그려 프레임당 vectra
  할당이 없다. normal에 대해 입사 벡터를 **반사**(2·dot)하는 `vector-projection-reflection-lab`
  (`reflectAcrossNormal`·`projectOn`), 반지름 band clamp `vec-clamp-length-band`, 사각 영역 clamp
  `vec-clamp-region`, 한 직선(축) lock `constrain-drag-axis-lock`과 분리한 "이동 벡터 → 벽 따라
  미끄러지는 성분(slide / 1·dot rejection)" 단일 개념 예제로, `vec/slide`/`slideInto` leaf의 첫
  연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/vec` namespace는
  다수 vec 예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `paper.js`
- 작업 흐름: segment from circle (원의 중심을 지나는 지름 선분을 각도로 회전 구성 = 컴퍼스/제도 지름 긋기)
- 관련 함수: `segment/fromCircle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-from-circle` (`apps/pixi-demo/src/examples/segment-from-circle`)
- 설명: 화면 고정 원(circle) 둘레에서 angle 핸들 1개를 drag하면 `fromCircle(circle, angle)`이
  원의 중심을 지나는 지름(diameter) 선분을 그 angle 방향으로 다시 구성한다. 핸들이 지름 방향각
  하나만 정하므로(`atan2(handle − center)` inline) 두 끝점 a = center − dir·r, b = center + dir·r는
  항상 원 둘레 위에, 중심은 항상 두 끝점의 중점에, 길이는 항상 `2r`로 고정되어 "컴퍼스/제도에서
  원의 지름을 각도만 돌려 긋는다"는 구성 작업 흐름을 보인다. 두 끝점이 원 위(`|c→a|=|c→b|=r`)·
  중심이 중점·길이 `2r`는 모두 같은 지름 구성의 정의 성질을 두 끝점 marker·중심 marker·
  `Math.hypot` inline radius로 드러내는 분해 표시이지 두 번째 관계가 아니다(별도 domain import 없이
  inline 산술, `segment-from-midpoint`의 두 radius 등거리 `Math.hypot` inline, `triangle-build-equilateral`의
  세 변 등길이 inline 선례와 같다). 별도 domain import 없이 단일 segment domain을 유지한다. 라이브
  degenerate warn 없음: 원 반지름이 고정 양수라 `fromCircle`이 finite 입력에서 실패하지 않고 항상
  길이 `2r > 0`인 지름을 반환해 라이브 warn 색을 억지로 만들지 않는다(`group-bounds` 선례). `r ≤ 0`→
  zero-length(`a = b = center`)·NaN/Infinity 입력 pass-through(angle은 핸들 화면 clamp + `atan2`라 항상
  finite, circle은 고정 finite)는 주석으로만 둔다. diagnostics는 angle°·len(=2r)·radius(`|c→a|`,`|c→b|`)
  3개만 표시한다. drag당 1회 단발 object 결과라 allocating `fromCircle`을 쓴다(`fromCircleInto` out-buffer
  scaffold 미사용, `segment-from-midpoint`·`segment-from-normal` 선례, allocating 호출이 `fromCircleInto`
  companion도 커버). ticker render는 저장된 지름 state만 그려 프레임당 vectra 할당이 없다. 임의 pivot
  중심 대칭 구성 `segment-from-midpoint`(`fromMidpointAngleLength`, 자유 length), 시작점+각도 구성
  `segment-angle-builder`(`fromAngle`+`centerOn`), base 위 직각 rib `segment-from-normal`(`fromNormal`),
  월드 원점 회전 `segment-rotate-origin`(`rotate`), circle domain 접선 `circle-tangent-construction`과
  분리한 "circle + angle → 중심을 지나는 지름 선분 구성(끝점 원 위 구속·길이 2r 고정)" 단일 개념
  예제로, `segment/fromCircle`/`fromCircleInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/segment` namespace는 다수 segment 예제가 이미 sandbox
  allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `pixijs`, `phaser`
- 작업 흐름: group bounds (도형 묶음 전체를 한 배열 호출로 감싸는 selection bounding box = editor 다중 선택 박스)
- 관련 함수: `editor-geometry/groupBounds`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:group-bounds` (`apps/pixi-demo/src/examples/group-bounds`)
- 설명: 화면에 흩어진 도형 묶음(고정 4개 + draggable 1개)을 두고, amber box 1개를 drag하면
  `groupBounds(boxes)`가 전체를 한 번에 감싸는 최소 union AABB(selection bounding box)를 다시
  계산한다. 에디터에서 여러 도형을 선택한 채 그중 하나를 옮기면 다중 선택 핸들 박스가 전체를
  다시 감싸도록 갱신되는 작업 흐름을 보인다. 어느 box가 selection box 경계를 정하는지(extremal)는
  box 좌표와 group 좌표를 inline 비교(`box.min.x === group.min.x` 등)한 같은 group 관계의 분해
  표시이지 두 번째 관계가 아니다(`vec-clamp-region`의 축 분해 inline, `bounds-union-box`의 변 분해
  inline 선례와 같다). selection box 네 모서리 handle 사각형은 단일 `groupBounds` 출력의 렌더일
  뿐이다. 별도 domain import 없이 단일 editor-geometry domain을 유지한다. 빈 입력/`length<1`→
  `undefined`(고정 5개라 미발생, `if (b)` 가드만)·inverted bounds(min>max, valid box로 구성해
  미발생)·NaN/Infinity 좌표(draggable box 화면 clamp로 finite라 미발생)는 주석으로만 둔다.
  `groupBounds`는 finite 입력에서 실패하지 않아 라이브 warn 색을 억지로 만들지 않는다. diagnostics는
  items(N)·width·height 3개만 표시한다. drag 시에만 1회 호출하는 단발 object 결과라 allocating
  `groupBounds`를 쓴다(`groupBoundsInto` out-buffer scaffold 미사용, `triangle-from-segment-height`·
  `polyline-vertex-tangents` 선례, allocating 호출이 `groupBoundsInto` companion도 커버). ticker
  render는 저장된 group state만 그려 프레임당 vectra 할당이 없다. 두 box **pairwise** union의 변
  기여 분해 `bounds-union-box`(`expandToIncludeBoundsInto`, bounds domain), 사방 균등 분배
  `distribute-equal-gaps`, rect⊇rect 포함 `rect-contains-rect`, 두 AABB 겹침 `bounds-bounds-overlap`과
  분리한 "N개 묶음 → 한 배열 호출 selection bounds(group AABB)" 단일 개념 예제로,
  `editor-geometry/groupBounds`/`groupBoundsInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/editor-geometry` namespace는 `snap-distance-ruler` 등이
  이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `p5.js`, `phaser`, `pixijs`
- 작업 흐름: vec clamp region (handle 좌표를 고정 사각 영역 안으로 성분별 clamp = play-area / viewport 가두기)
- 관련 함수: `vec/clampInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-clamp-region` (`apps/pixi-demo/src/examples/vec-clamp-region`)
- 설명: 화면 중앙 고정 사각 영역(region box) 위에서 handle 1개를 자유롭게 drag하면
  `clampInto(out, handle, min, max)`가 handle 좌표를 region `min`/`max`로 성분별 clamp한 marker를
  매 프레임 기록한다. handle을 region 밖으로 끌어도 marker는 각 축이 `[minX,maxX]`·`[minY,maxY]`에
  독립으로 갇혀 항상 region 안(경계 포함)에 머물러 "오브젝트를 재생 영역/뷰포트 안에 가둔다"는 위치
  clamp 작업 흐름을 보인다. 어느 축이 clamp됐는지(`marker.x !== handle.x` inline 비교)로 붙은 변을
  밝게 그리고 state를 inside(0축)/edge(1축)/corner(2축)로 색 분해하는 것은 모두 같은 단일 clamp 관계의
  분해 표시이지 두 번째 관계가 아니다(`bounds-bounds-overlap`의 두 축 막대, `rect-contains-rect`의 네 변
  slack inline 분해 선례와 같다). 별도 domain import 없이 단일 vec domain을 유지한다(축 분해는 좌표
  비교 inline). clamp precondition `min<=max`는 region이 고정 valid box라 항상 충족(min>max→결과
  undefined는 주석만), zero-area region(minX==maxX)→한 축 점 붕괴(고정 non-zero라 미발생, 주석만),
  non-finite pass-through(handle 화면 clamp로 항상 finite라 미발생, 주석만)다. clamp는 finite 입력에서
  실패하지 않아 라이브 warn 색을 억지로 만들지 않는다. diagnostics는 raw(x,y)·clamp(x,y)·state 3개만
  표시한다. 매 프레임 clamp하는 hot path라 allocating `clamp` 대신 `clampInto` out-buffer 1개를
  재사용한다(allocating 호출이 `clamp` companion도 커버). 방향 보존 **반지름(길이)** band clamp
  `vec-clamp-length-band`(`clampLengthInto`), 한 **직선(축)** lock `constrain-drag-axis-lock`, rect⊇rect
  **boolean** 포함 `rect-contains-rect`(`containsRect`), 가이드·정점 **snap** 후보 비교
  `editor-snap-guides-lab`와 분리한 "점 → 사각 영역(box, 성분별 독립) clamp" 단일 개념 예제로,
  `vec/clamp`/`clampInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/vec` namespace는 다수 vec 예제가 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `figma`, `paper.js`
- 작업 흐름: snap distance ruler (anchor→handle 측정 길이를 step 눈금으로 snap = 치수/리사이즈 길이 스냅)
- 관련 함수: `editor-geometry/snapDistance`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:snap-distance-ruler` (`apps/pixi-demo/src/examples/snap-distance-ruler`)
- 설명: 화면 좌측 고정 anchor에서 end handle 1개를 drag하면 `snapDistance(rawLen, STEP=40)`가
  anchor→handle 측정 길이(`rawLen`=Math.hypot inline)를 가장 가까운 step 눈금으로 snap한 marker를
  anchor→handle 방향 자(ruler) 위에 놓는다. handle을 부드럽게 끌어도 snap marker는 40px 눈금 사이를
  건너뛰며 딸깍 떨어지듯 움직여 "에디터/CAD에서 치수·리사이즈 길이를 일정 간격으로 스냅"하는 작업
  흐름을 보인다. faint raw line(anchor→handle)·bright snap line(anchor→snapEnd)·자 위 step 눈금·snap된
  눈금 강조는 모두 같은 `snapDistance` 관계의 분해 표시이지 두 번째 관계가 아니다(`angle-snap-dial`이
  한 각도 snap을 raw/snap needle·눈금·호로, `grid-snap-bracket`이 한 snap을 floor/ceil/nearest로
  분해한 선례와 같다). 별도 domain import 없이 단일 editor-geometry domain을 유지한다(방향·길이는
  `Math.atan2`/`Math.hypot` inline). `snapDistance`는 validation이 없고 precondition은 `step` finite·
  `!=0`인데 STEP은 고정 양수 상수라 항상 충족하며, `rawLen`은 pointer 화면 clamp + hypot이라 항상
  finite·non-negative라 non-finite pass-through가 미발생함은 주석으로만 둔다. `rawLen ≤ DEGEN_EPS=2px`
  (handle을 anchor에 겹침)면 `snapDistance`가 0으로 snap돼 marker가 anchor에 붕괴한 zero-length 측정
  degenerate를 warn 색으로 라이브 강조한다(함수는 0을 valid 반환, 방향 미정 fallback `{1,0}`은
  snappedLen=0이라 위치에 영향 없음). raw가 두 눈금 정확히 중간이면 내부 round가 +방향으로 올림
  (tie→큰 길이)·음수 거리(rawLen≥0이라 미발생)는 주석으로만 둔다. diagnostics는 raw(px)·snapped(px)·
  step(px) 3개만 표시한다. scalar 반환이라 `*Into` companion이 없어 그대로 쓰고 render hot path에
  vectra 할당이 없다. 위치 grid snap floor/ceil/nearest `grid-snap-bracket`, 각도 step snap
  `angle-snap-dial`, 점→가이드/그리드/정점/세그먼트 후보 비교 snap `editor-snap-guides-lab`,
  matrix 회전+step snap 묶음 `rotate-handle`과 분리한 "연속 거리(길이) → 이산 step snap" 단일 개념
  예제로, snap 패밀리의 세 번째 양(거리)이자 `editor-geometry/snapDistance` leaf의 첫 연결이다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/editor-geometry` namespace는
  `angle-snap-dial`/`rotate-handle` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html
  변경이 없다.

- reference: `geogebra`, `paper.js`
- 작업 흐름: segment from normal (base segment 위 한 점에서 base에 직각인 rib 세우기 = 척추→갈비 / 수직 tick)
- 관련 함수: `segment/fromNormal`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-from-normal` (`apps/pixi-demo/src/examples/segment-from-normal`)
- 설명: 화면 고정 base segment(spine) 위에서 rib tip 핸들 1개를 drag하면 `fromNormal(base, t, length)`가
  base 위 foot에서 base에 직각인 rib(segment)를 다시 구성한다. 핸들을 base 직선에 투영한 위치가
  foot 파라미터 `t`(= clamp01(((p−a)·d)/L²))를, base 직선까지의 부호 있는 수선 거리가
  `length`(= (p−a)·n, left normal 기준)를 정하므로 rib는 base를 어떻게 두든 항상 base에 수직이다.
  "척추(spine) 위 한 점에서 갈비(rib) / 수직 tick을 세운다"는 구성 작업 흐름을 보인다. `d·n=0`이라
  `length`는 t clamp와 무관하게 핸들의 base 직선까지 부호 있는 수선 거리와 같고, foot `a'`는 항상
  base 위(`pointAtT`)다. rib⟂base 직각(90°)과 foot가 base 위 `pointAtT`라는 것은 **같은 구성의 정의
  성질**을 foot marker·직각 정사각형 표식·`atan2` inline 사잇각으로 드러내는 분해 표시이지 두 번째
  관계가 아니다(`triangle-build-right`의 코너 직각 marker, `triangle-build-equilateral`의 세 변 등길이
  inline 선례와 같다). length 부호로 left(청록)/right(호박) normal 측이 바뀌는 것도 같은 단일 함수의
  documented 분기다(`vec-set-length`의 up/down 색, `triangle-from-segment-height`의 signed height 측
  뒤집기 선례). 별도 domain import 없이 단일 segment domain을 유지한다. `|length| ≤ DEGEN_EPS=2px`
  (핸들을 base 직선에 겹침)면 rib가 base 위 한 점으로 붕괴한 zero-length(면적 0) degenerate를 warn
  색으로 라이브 강조한다(함수는 zero-length rib를 valid 반환). base zero-length→normal 미정(고정
  non-zero라 미발생)·t extrapolation(t<0|t>1, t를 `[0,1]`로 clamp해 foot가 항상 base 위라 미발생,
  함수는 t를 clamp 안 함)·NaN/Infinity 입력(핸들 화면 margin clamp + 유한 base라 finite라 미발생)은
  주석으로만 둔다. diagnostics는 t(0..1)·len(signed px)·⟂(rib↔base 사잇각, 항상 90°) 3개만 표시한다.
  drag당 1회 단발 object 결과라 allocating `fromNormal`을 쓴다(`fromNormalInto` out-buffer scaffold
  미사용, `segment-from-midpoint`·`segment-rotate-origin` 선례, allocating 호출이 `fromNormalInto`
  companion도 커버). midpoint 중심 대칭 구성 `segment-from-midpoint`(`fromMidpointAngleLength`),
  시작점+각도 구성 `segment-angle-builder`(`fromAngle`+`centerOn`), 월드 원점 회전
  `segment-rotate-origin`(`rotate`), 절대 거리 marker `segment-point-at-length`, normal **parallel
  offset** lab `segment-offset-normal-lab`(`translate`), 점→직선 **projection foot** 단독
  `infinite-line-diagnostics-lab`(`projectPoint`)과 분리한 "base + t + normal length → 직각 rib 구성"
  단일 개념 예제로, `segment/fromNormal`/`fromNormalInto` leaf의 첫 연결이다. diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/segment` namespace는 다수 segment 예제가
  이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `pixijs`, `vscode`
- 작업 흐름: rect halves split (frame rect를 draggable divider 기준 좌/우 두 패널로 분할 = split-pane / divider)
- 관련 함수: `rect/halves`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-halves-split` (`apps/pixi-demo/src/examples/rect-halves-split`)
- 설명: 화면 고정 frame rect 위에서 divider 핸들 1개를 좌우로 drag하면 `halves(frame, { ratio })`가
  frame을 좌/우 두 패널(first/second)로 다시 분할한다. divider의 x가 곧 분할 ratio이자 두 패널의 공통
  변이라 divider를 옮기면 두 패널 width가 동시에 바뀌어 "split-pane / divider를 끌어 두 패널 비율을
  조절한다"라는 레이아웃 분할 작업 흐름을 보인다. 두 패널을 2색으로 칠하는 것은 단일 split의 출력을
  그대로 그린 것이지 두 번째 관계가 아니고, ratio%·left/right width도 같은 split을 별도 domain import
  없이 frame width와 `-`로 inline 분해한 표시다(`rect-quadrants-split`의 cols/rows ratio inline 분해,
  `rect-contains-rect`의 네 변 slack inline 분해 선례와 같다). divider x를 frame 안으로 clamp해 ratio를
  `[0,1]`로 강제하므로 두 패널 width가 항상 ≥0이고 `halves`의 `RangeError`(ratio가 `[0,1]` 밖/NaN)가
  미발생한다. 변에 붙으면(ratio→0/1) 한 패널이 0 width로 붕괴(면적 0 패널)해 `min(first.width,
  second.width)≤DEGEN_EPS=2px`면 divider를 warn 색으로 라이브 강조한다(ratio 0/1 경계도 valid). axis는
  `'x'`(좌/우) 고정이라 `axis` `RangeError`·negative-dim rect raw 산식은 주석으로만 둔다. diagnostics는
  split(ratio%)·left(first.width)·right(second.width) 3개만 표시한다. drag당 1회 단발 nested object
  결과라 allocating `halves`를 쓴다(`halvesInto` out-buffer scaffold 미사용, `rect-quadrants-split`·
  `rect-contains-rect` 선례, allocating 호출이 companion도 커버). split point 기준 4분할
  `rect-quadrants-split`(2D 점→4 cell), 사방 inflate `rect-uniform-inflate`, 비대칭 point 확장
  `rect-expand-to-include-point`, 둘레 균등 parameterize `rect-perimeter-walk`, rect⊇rect 완전 포함
  boolean `rect-contains-rect`와 분리한 "frame rect → divider ratio 기준 좌/우 2분할" 단일 개념 예제로,
  `rect/halves`/`halvesInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/rect` namespace는 `rect-perimeter-walk` 등이 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `paper.js`, `figma`
- 작업 흐름: segment from midpoint (고정 pivot(midpoint)을 중심으로 양쪽 대칭으로 뻗는 막대 구성 = dimension bar / balance beam)
- 관련 함수: `segment/fromMidpointAngleLength`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-from-midpoint` (`apps/pixi-demo/src/examples/segment-from-midpoint`)
- 설명: 화면 고정 pivot(midpoint) 둘레로 endpoint B 핸들 1개를 drag하면 `fromMidpointAngleLength(pivot,
  angle, length)`가 pivot을 중심으로 양쪽 대칭으로 뻗는 막대(segment)를 다시 구성한다. 핸들 위치가 한 변
  길이 `half`(=|pivot→handle|)와 방향 `angle`(=atan2(handle−pivot))을 함께 정하고, `length=2·half`라
  pivot은 항상 두 끝점의 중점에 고정된다. "중심을 정해두고 양쪽으로 같은 길이씩 뻗는 dimension bar /
  balance beam을 각도만 돌려 배치"하는 구성 작업 흐름을 보인다. a=pivot−dir·half, b=pivot+dir·half라
  b는 핸들, a는 핸들을 pivot 기준 점대칭한 점이고 두 radius |pivot→a|=|pivot→b|=half가 항상 같다. 이
  두 끝점 등거리는 중심 대칭 구성의 정의 성질을 `Math.hypot` inline과 pivot→끝점 radius line으로 드러내는
  분해 표시이지 두 번째 관계가 아니다(`triangle-build-equilateral`의 세 변 등길이 `Math.hypot` inline,
  `segment-rotate-origin`의 회전 후 길이 불변 inline 선례와 같다). 별도 domain import 없이 단일 segment
  domain을 유지한다. `half=|pivot→handle| ≤ DEGEN_EPS=2px`(핸들을 pivot에 겹침)면 두 끝점이 pivot에 겹친
  zero-length(면적 0) degenerate를 warn 색으로 라이브 강조한다(함수는 length=0이면 midpoint zero-length
  segment를 valid하게 반환). 음수 length(핸들 거리는 ≥0이라 미발생, 함수는 음수 length를 clamp하지 않고
  각도 반대로 뒤집음)·NaN/Infinity 입력(핸들 화면 margin clamp + atan2라 angle·length 항상 finite라
  미발생)·a가 CCW/CW(y-down 좌표)는 주석으로만 둔다. diagnostics는 angle°·length(전체)·half(|mid→a|=
  |mid→b|) 3개만 표시한다. drag당 1회 단발 object 결과라 allocating `fromMidpointAngleLength`를 쓴다
  (`fromMidpointAngleLengthInto` out-buffer scaffold 미사용, `segment-rotate-origin`·
  `triangle-build-equilateral` 선례, allocating 호출이 `fromMidpointAngleLengthInto` companion도 커버).
  start origin 구성+별도 anchor 재정렬 `segment-angle-builder`(fromAngle+centerOn, 두 segment), 월드
  원점 기준 회전 `segment-rotate-origin`(rotate), normal offset lab `segment-offset-normal-lab`, 절대
  거리 marker `segment-point-at-length`, 유한 선분 교차 `segment-intersection-point`와 분리한 "midpoint
  + angle + length → 중심 대칭 segment 구성" 단일 개념 예제로, `segment/fromMidpointAngleLength`/
  `fromMidpointAngleLengthInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/segment` namespace는 `segment-angle-builder` 등이 이미 sandbox allowlist 2배열에
  등록해 allowlist·runner-html 변경이 없다.

- reference: `figma`, `pixijs`, `phaser`
- 작업 흐름: rect quadrants split (frame rect를 draggable split point 기준 4 사분면 cell로 분할 = quad-view splitter / 4-up 패널)
- 관련 함수: `rect/quadrants`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-quadrants-split` (`apps/pixi-demo/src/examples/rect-quadrants-split`)
- 설명: 화면 고정 frame rect 위에서 split point 핸들 1개를 drag하면 `quadrants(frame, split)`가 frame을
  4개 사분면 cell(nw/ne/se/sw)로 다시 분할한다. split point가 곧 4 cell의 공통 corner라 점을 옮기면 네 cell
  크기가 동시에 바뀌어 "quad-view splitter / 4-up 패널을 한 점으로 나눈다"라는 레이아웃 분할 작업 흐름을
  보인다. 4 cell을 4색으로 칠하는 것은 단일 partition의 출력을 그대로 그린 것이지 두 번째 관계가 아니고,
  cols/rows ratio도 같은 partition을 별도 domain import 없이 `-`로 inline 분해한 표시다(`rect-contains-rect`의
  네 변 slack inline 분해, `bounds-bounds-overlap`의 두 축 구간 inline 분해 선례와 같다). split point를 frame
  안으로 clamp하므로 네 cell width/height가 항상 ≥0이고, 변에 붙으면 한 column/row가 0으로 붕괴(면적 0 cell)해
  `min(wNW,wNE)≤DEGEN_EPS=2px`(세로 분할선) 또는 `min(hNW,hSW)≤DEGEN_EPS`(가로 분할선)면 해당 분할선을 warn
  색으로 라이브 강조한다(변 위 분할도 valid 경계). `center`가 rect 밖→negative dim(`quadrants`는 정규화하지
  않으나 clamp로 미발생)·empty rect→raw 산식(고정 양수라 미발생)·NaN/Infinity center(frame clamp라 finite)는
  주석으로만 둔다. diagnostics는 split(ratioX%,ratioY%)·cols(wNW|wNE)·rows(hNW|hSW) 3개만 표시한다. drag당 1회
  단발 nested object 결과라 allocating `quadrants`를 쓴다(`quadrantsInto` out-buffer scaffold 미사용,
  `rect-contains-rect`·`segment-rotate-origin` 선례, allocating 호출이 companion도 커버). 2분할 `rect/halves`,
  사방 inflate `rect-uniform-inflate`, 비대칭 point 확장 `rect-expand-to-include-point`, 둘레 균등 parameterize
  `rect-perimeter-walk`, rect⊇rect 완전 포함 boolean `rect-contains-rect`, content fit `content-fit-workbench`와
  분리한 "frame rect → split point 기준 4 사분면 분할" 단일 개념 예제로, `rect/quadrants`/`quadrantsInto` leaf의
  첫 연결이다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/rect` namespace는
  `rect-perimeter-walk` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `figma`
- 작업 흐름: triangle build right (직각 vertex origin + 두 직교 leg width/height + 방향 → 직각삼각형 구성)
- 관련 함수: `triangle/buildRight`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-build-right` (`apps/pixi-demo/src/examples/triangle-build-right`)
- 설명: 화면 고정 직각 vertex A 둘레로 정점 B 핸들 1개를 drag하면 `buildRight(A, width, HEIGHT, angle)`가
  매 drag마다 직각삼각형을 다시 구성한다. 핸들 위치가 한 leg 길이 `width`(=|A→pointer|)와 방향
  `angle`(=atan2(pointer−A))을 함께 정하고, 다른 leg `height`는 고정 상수(130px)라 도형이 회전·스케일돼도
  A의 직각은 항상 90°다. "직각삼각형을 세운다" 작업 흐름을 보인다. a=origin, b=origin+width·(cos angle,
  sin angle), c=origin+height·(−sin angle, cos angle)로 두 leg AB·AC가 직교해 A 내각이 90°다. 이 직각은
  직각삼각형 구성의 정의 성질을 코너 정사각형 marker와 angle@A 라벨(atan2 inline)로 드러내는 분해 표시이지
  두 번째 관계가 아니다(`triangle-build-equilateral`이 세 변 등길이 |AB|=|BC|=|CA|를 `Math.hypot` inline으로,
  `triangle-from-segment-height`가 이등변 두 다리 |AC|=|BC|를 inline으로 보인 선례와 같다). 별도 domain
  import 없이 단일 triangle domain을 유지한다. `width ≤ DEGEN_EPS=2px`(B를 A에 겹침)면 b가 a에 붕괴한 면적 0
  degenerate를 warn 색으로 라이브 강조한다. 음수 width/height(width는 거리라 ≥0·height는 고정 양수라
  미발생)·`height=0` degenerate(고정 양수라 미발생)·NaN/Infinity 입력(pointer 화면 margin clamp + atan2라
  width·angle 항상 finite라 미발생)·c가 CCW(`left=(-sin,cos)`, y-down이라 시각적 CW)는 주석으로만 둔다.
  diagnostics는 width(|AB|)·height(|AC|)·angle@A(90°) 3개만 표시한다. drag당 단발 object 결과라 allocating
  `buildRight`를 쓴다(`buildRightInto` out-buffer scaffold 미사용, `triangle-build-equilateral`·
  `triangle-from-segment-height`·`segment-rotate-origin` 선례, allocating 호출이 companion도 커버). 정삼각형
  강체 구성 `triangle-build-equilateral`, 밑변+높이 이등변 구성 `triangle-from-segment-height`, **주어진**
  삼각형의 center/median/분류/포함/겹침 `triangle-centers`/`triangle-medians-concurrency`/
  `triangle-barycentric-lab`/`triangle-side-classification`/`triangle-closest-point`/`triangle-contains-point`/
  `triangle-triangle-overlap`, SSS solve `triangle-solver-excircles-lab`과 분리한 "origin(직각) + 직교 leg +
  angle → 직각삼각형 구성" 단일 개념 예제로, `triangle/buildRight`/`buildRightInto` leaf의 첫 연결이다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/triangle` namespace는
  `triangle-centers` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `figma`
- 작업 흐름: triangle build equilateral (origin + 한 변 길이 + 방향 → 정삼각형 강체 구성)
- 관련 함수: `triangle/buildEquilateral`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-build-equilateral` (`apps/pixi-demo/src/examples/triangle-build-equilateral`)
- 설명: 화면 고정 origin 정점 A 둘레로 정점 B 핸들 1개를 drag하면 `buildEquilateral(A, side, angle)`가
  매 drag마다 정삼각형을 다시 구성한다. 핸들 위치가 한 변 길이 `side`(= |A→pointer|)와 방향
  `angle`(= atan2(pointer − A))을 함께 정하므로, 도형 전체가 강체로 회전·스케일된다. "정삼각형을
  세운다(set square / 정삼각 도형 구성)" 작업 흐름을 보인다. a=origin, b=origin + side·(cos angle,
  sin angle), c=origin + side·(cos(angle+60°), sin(angle+60°))로 b·c가 모두 A에서 같은 거리에 60°
  간격으로 놓여 세 변 |AB|=|BC|=|CA|가 항상 같다. 이 세 변 등길이는 정삼각형 **구성의 정의 성질**을
  `Math.hypot` inline으로 드러내는 분해 표시이지 두 번째 관계가 아니다(`triangle-from-segment-height`가
  이등변의 두 다리 |AC|=|BC|를 inline으로 보인 선례와 같다). 별도 domain import 없이 단일 triangle
  domain을 유지한다. `side ≤ DEGEN_EPS=2px`(B를 A에 겹침)면 세 vertex가 한 점에 겹친 degenerate를
  warn 색으로 라이브 강조한다. 음수 sideLength(side는 거리라 ≥ 0이라 미발생)·NaN/Infinity 입력
  (pointer 화면 margin clamp라 side·angle 항상 finite)·c가 CCW(y-down이라 시각적 CW)임은 주석으로만
  둔다. diagnostics는 side·angle°·sides(|AB|=|BC|=|CA|) 3개만 표시한다. drag당 1회 단발 object
  결과라 allocating `buildEquilateral`을 쓴다(`buildEquilateralInto` out-buffer scaffold 미사용,
  `triangle-from-segment-height`·`segment-rotate-origin` 선례). 이등변을 base+height로 세우는
  `triangle-from-segment-height`, **주어진** 삼각형의 center/median/분류/포함/겹침을 다루는
  `triangle-centers`/`triangle-medians-concurrency`/`triangle-barycentric-lab`/
  `triangle-side-classification`/`triangle-closest-point`/`triangle-contains-point`/
  `triangle-triangle-overlap`, SSS solve `triangle-solver-excircles-lab`과 분리한 "origin + side +
  angle → 정삼각형 강체 구성" 단일 개념 예제로, `triangle/buildEquilateral`/`buildEquilateralInto`
  leaf의 첫 연결이다(allocating 호출이 companion도 커버). diagnostics는 `PIXI.Text`로만 출력한다
  (`g.text` 미사용). `@cp949/vectra/triangle` namespace는 `triangle-centers` 등이 이미 sandbox
  allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다. (선정 시 후보였던 `ellipse/fromBounds`는
  `ellipse-from-rect`의 내접 ellipse 구성과 같은 개념, `path/isClockwise`는
  `polygon-transform-orientation-lab`의 winding과 겹쳐, `triangle/fromSegmentApex`는
  `triangle-from-segment-height`와 화면이 거의 동일해 모두 `alias-leaf-duplicate-concept` 회피로 제외.)

- reference: `figma`, `pixijs`, `phaser`
- 작업 흐름: rect contains rect (자식 박스가 부모 프레임 안에 완전 포함 = layout / safe area / clip 판정)
- 관련 함수: `rect/containsRect`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-contains-rect` (`apps/pixi-demo/src/examples/rect-contains-rect`)
- 설명: 화면 고정 부모 프레임 A와 draggable 자식 박스 B(크기 고정, 위치만 이동)를 두고, B를 drag하면
  `containsRect(a, b)`가 B가 A의 closed boundary 안에 완전히 포함되는지 매 프레임 boolean으로 판정한다.
  완전히 들어오면 contained 색, 한 변이라도 삐져나오면 clear 색으로 바뀌어 "자식이 부모 프레임/safe
  area 안에 다 들어왔는가?"라는 layout / clip 판정 작업 흐름을 보인다. 완전 포함은 네 변 부등식
  (B.left≥A.left AND B.right≤A.right AND B.top≥A.top AND B.bottom≤A.bottom)이 모두 성립함이므로, A의 네
  변을 변별 slack 색(만족 초록·접촉 노랑·위반 빨강)으로 칠해 어느 변이 포함을 깨는지 드러낸다. 이 네 변
  분해와 min slack은 같은 포함 판정의 inline 분해 표시이지 두 번째 관계가 아니다(별도 domain import 없이
  `+`/`-`로 계산해 단일 API·단일 관계 유지, `bounds-bounds-overlap`의 x축·y축 막대, `circle-rect-overlap`의
  nearest point·dist inline 분해 선례와 같다). 변끼리 정확히 닿은 채 포함된 경계(slack ≈ 0,
  `EDGE_EPS=1.5px`)는 노랑으로 강조해 접촉도 포함 = true인 closed boundary임을 보인다. other(B) empty
  (w≤0/h≤0)→true·rect(A) empty→B도 empty일 때만 true는 고정 양수 크기라 미발생(주석만), 좌표는 화면
  margin clamp라 항상 finite(B는 A가 아니라 화면에 clamp해 overflow가 도달 가능)다. diagnostics는
  inside·margin(min slack signed)·tight(여유 최소 변) 3개만 표시한다. 두 AABB **겹침**(touch)
  `bounds-bounds-overlap`, 두 AABB **합집합** box `bounds-union-box`, 원↔AABB 겹침 `circle-rect-overlap`,
  점↔shape 포함 `triangle-contains-point`·`path-fill-hit-test`, circle ⊇ rect(다른 도메인)
  `circle-transform-stack`의 `Circlex.containsRect`와 분리한 "rect ⊇ rect 완전 포함 boolean" 단일 개념
  예제로, `rect/containsRect` leaf의 첫 연결이다. boolean 반환이라 `*Into` companion이 없어 그대로 쓰고
  render hot path에 vectra 할당이 없다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/rect` namespace는 `rect-perimeter-walk` 등이 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `pixijs`, `phaser`, `figma`
- 작업 흐름: triangle triangle overlap (두 삼각형 겹침 = convex polygon collision / hit-test 판정)
- 관련 함수: `intersects/intersectsTriangleTriangle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-triangle-overlap` (`apps/pixi-demo/src/examples/triangle-triangle-overlap`)
- 설명: 화면 고정 scalene 삼각형 A와 draggable 삼각형 B(모양 고정, 평행이동만)를 두고, B를 drag하면
  `intersectsTriangleTriangle(a, b)`가 두 삼각형이 겹치거나 접하는지 SAT(분리축 정리)로 매 프레임
  boolean 판정한다. 겹치면 두 삼각형이 hit 색, 떨어지면 clear 색으로 바뀌어 "두 볼록 도형(충돌체)이
  서로 닿는가?"라는 collision / hit-test 작업 흐름을 보인다. boolean predicate라 분해할 scalar가 없어
  diagnostics는 overlap(yes/no) 1개와 drag 안내만 두고, SAT 6개 분리축 투영은 복잡도 gate를 깨는 두
  번째 표현이라 의도적으로 그리지 않는다(`segment-segment-cross`·`triangle-contains-point`가 boolean을
  색 전환만으로 보인 선례와 같다). degenerate 삼각형(collinear, signed area 2× === 0)→false와 non-finite
  vertex→false는 A·B를 고정 non-degenerate·화면 margin clamp로 구성해 미발생(주석만), 끝점 공유·edge
  접촉도 true인 closed boundary다. B 내부 grab 판정은 추가 도메인 import 없이 inline 부호 테스트(세 변
  cross product 동일 부호)로 해 중심 API를 `intersectsTriangleTriangle` 1개로 유지한다(두 번째 관계
  금지). 두 원 `circle-circle-overlap`, 원↔AABB `circle-rect-overlap`, 두 선분 `segment-segment-cross`,
  두 AABB `bounds-bounds-overlap`, 점↔삼각형 포함 boolean `triangle-contains-point`, 점→삼각형 최근접점
  `triangle-closest-point`와 분리한 "두 삼각형 겹침 boolean(polygon-polygon SAT)" 단일 개념 예제로,
  `intersects/intersectsTriangleTriangle` leaf의 첫 연결이다. boolean 반환이라 `*Into` companion이 없어
  그대로 쓰고 render hot path에 vectra 할당이 없다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/intersects` namespace는 `circle-circle-overlap` 등이 이미 sandbox allowlist
  2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `geogebra`, `paper.js`
- 작업 흐름: triangle from segment height (밑변 segment + 높이로 이등변 삼각형 구성 = gable/tent 세우기)
- 관련 함수: `triangle/fromSegmentHeight`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-from-segment-height` (`apps/pixi-demo/src/examples/triangle-from-segment-height`)
- 설명: 고정 수평 base segment(a (220,250), b (500,250)) 위에서 apex handle 1개를 base에 수직인
  normal 축을 따라 drag하면 `fromSegmentHeight(base, height)`가 base midpoint에서 그 signed
  height만큼 떨어진 apex로 이등변 삼각형(a=base.a, b=base.b, c=midpoint + h·normal)을 다시
  구성한다. "밑변 위에 높이 h인 이등변 삼각형 세우기(gable/tent)" 구성 작업 흐름을 보인다. pointer를
  normal 축으로 투영해 signed height를 정하므로 apex는 축에 구속되고, height 부호가 곧 방향이라
  handle을 base 너머로 끌면 음수 height가 되어 apex가 base 반대쪽에 생긴다(clamp 없음). 두 다리
  |AC|·|BC|는 항상 같은 길이(이등변)이고, 이 등길이는 같은 구성 관계의 분해 표시이지 두 번째 관계가
  아니다(`segment-rotate-origin`이 회전 시 길이 불변을, `triangle-medians-concurrency`가 2:1을 함께
  보인 선례와 같다). 다리 길이는 `Math.hypot` inline으로 계산해 `@cp949/vectra/vec`·`segment` 추가
  import 없이 단일 triangle domain을 유지하고, base 길이는 고정 상수라 setup에서 1회만 계산한다.
  `|height| ≤ DEGEN_EPS=2px`면 apex가 base 위에 놓여 면적 0 collinear 삼각형이 되는 degenerate를
  warn 색으로 라이브 강조한다(함수는 base length가 positive면 성공하므로 valid). base length
  0/NaN/Infinity → undefined는 base가 고정 finite positive라 미발생(`if (tri)` 가드로 노출),
  NaN/Infinity height는 handle 화면 clamp로 미발생, `side` option(left/right) 대신 height 부호로
  방향을 표현함은 모두 주석으로만 둔다. diagnostics는 height(signed)·base(len)·legs(|AC|=|BC|) 3개만
  표시한다. geometry 계산은 drag 시에만 1회 수행하고 ticker render는 저장된 triangle state만 그려
  프레임당 vectra 할당이 없으므로 hot path가 아니다 → allocating `fromSegmentHeight`를 그대로
  쓴다(`fromSegmentHeightInto` out-buffer scaffold 미사용, `segment-rotate-origin`·
  `polyline-vertex-tangents` 선례). 자유 apex point 구성 `fromSegmentApex`, center·중선 성질
  `triangle-centers`/`triangle-medians-concurrency`, 점↔삼각형 판정 `triangle-contains-point`/
  `triangle-closest-point`/`triangle-barycentric-lab`, 변 길이 분류 `triangle-side-classification`
  (어느 것도 삼각형을 구성하지 않음)과 분리한 "밑변+높이 → 이등변 삼각형 구성" 단일 개념 예제로,
  `triangle/fromSegmentHeight`/`fromSegmentHeightInto` leaf의 첫 연결이다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/triangle` namespace는 `triangle-centers` 등이 이미 sandbox
  allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `paper.js`, `geogebra`
- 작업 흐름: triangle medians concurrency (세 중선이 무게중심에서 공점, 각 중선을 2:1 분할)
- 관련 함수: `triangle/medians`, `triangle/centroid`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-medians-concurrency` (`apps/pixi-demo/src/examples/triangle-medians-concurrency`)
- 설명: 화면 위 삼각형의 세 꼭짓점을 자유롭게 drag하면 각 꼭짓점에서 맞은편 변 midpoint로 향하는
  세 중선(median)을 `mediansInto`가 nested writable container에 한 번에 다시 기록하고, `centroidInto`가
  세 중선이 만나는 무게중심을 계산한다. 삼각형 모양을 어떻게 바꿔도 세 중선은 항상 한 점(무게중심)에서
  만나고, 그 점이 각 중선을 꼭짓점:중점 = 2:1로 나눈다는 고전 기하 성질을 라이브로 보인다. 무게중심
  marker는 세 중선의 교점이고, 중선 A에 대해 `|AG| : |G·midpoint|` 비율을 `Math.hypot` inline으로 측정해
  diagnostics에 "2.00 : 1"로 표시한다. 무게중심·공점성·2:1 분할은 모두 같은 median concurrency 관계의
  분해 표시이지 두 번째 관계가 아니다(`circle-circle-overlap`의 centerDist inline 분해, `triangle-closest-point`의
  inside/edge 분해 선례와 같다). collinear/동일 꼭짓점 degenerate도 `mediansInto`/`centroidInto`가 산식 그대로
  적용해 실패 없이 valid하며 2:1도 성립함, 꼭짓점은 화면 margin clamp라 항상 finite여서 non-finite
  pass-through 미발생, 단수 `median`의 invalid key→false는 `mediansInto`만 써서 N/A임은 모두 주석으로만 둔다.
  diagnostics는 centroid(x,y)·ratio·drag 안내 3개만 표시한다. centroid/incenter/circumcenter와 in/circumcircle을
  묶어 marker로만 보이고 중선을 그리지 않는 `triangle-centers`, classify+barycentric weight `triangle-barycentric-lab`,
  변 길이 분류 `triangle-side-classification`, 점↔삼각형 판정 `triangle-contains-point`/`triangle-closest-point`와
  분리한 "세 중선의 공점성(무게중심·2:1)" 단일 개념 예제로, `triangle/medians`/`mediansInto` leaf의 첫 연결이다.
  ticker render hot path라 allocating `medians`/`centroid` 대신 `mediansInto` nested buffer 1개와 `centroidInto`
  out-buffer 1개를 재사용한다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/triangle`
  namespace는 `triangle-centers` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: polyline vertex tangents (경로 각 vertex의 진행 방향(tangent) = 경로 따라 방향 마커/화살표 배치)
- 관련 함수: `polyline/tangents`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:polyline-vertex-tangents` (`apps/pixi-demo/src/examples/polyline-vertex-tangents`)
- 설명: 화면 고정 경로(6 vertex polyline)에서 apex vertex 1개만 drag해 경로 모양을 바꾸면
  `tangents(polyline)`가 각 vertex의 진행 방향(unit tangent)을 다시 계산해 vertex마다 방향 화살표를
  매끄럽게 다시 정렬한다. "경로를 따라 진행 방향 마커/화살표를 배치"하는 작업 흐름을 보인다. 내부
  vertex는 인접 두 edge unit 방향의 합을 정규화(부드러운 진행 방향), 양 끝 vertex는 인접 edge 1개
  방향을 쓴다. per-vertex 화살표는 같은 tangent 관계의 정점별 분해 표시이지 두 번째 관계가 아니다
  (`polyline-distance-probe`가 한 거리 관계를 ring으로 보인 선례와 같다). apex를 두 인접 edge가 정확히
  180° 접히도록 끌면 인접 unit 방향이 상쇄되어 apex tangent가 `{0,0}`이 되는 degenerate를 라이브로
  처리하고(warn 점, 화살표 생략), 정상 vertex는 정규화되어 `|t| == 1`이다. vertex < 2는 고정 6-vertex라
  미발생, 모든 좌표는 화면 margin clamp라 항상 finite여서 non-finite pass-through 미발생은 주석으로만
  둔다. diagnostics는 vertices·apex tan°·apex |t| 3개만 표시한다. 각도 라벨은 `Math.atan2` inline으로
  계산해 `@cp949/vectra/vec`·`@cp949/vectra/angle` 추가 import 없이 단일 polyline domain을 유지한다.
  점→polyline 최단 거리 `polyline-distance-probe`, arclength 파라미터화 `polyline-length-ratio`/
  `polyline-path-walk`, 점의 직선 side/signed distance `orientation-predicate`/
  `infinite-line-diagnostics-lab`, 목표 추적 방향 `vector-steering-field`/`cursor-chase`와 분리한
  "polyline vertex별 진행 방향" 단일 개념 예제로, `polyline/tangents`/`tangentsInto` leaf의 첫 연결이다.
  geometry 계산은 apex drag 시에만 1회 수행하고 ticker render는 저장 state만 그려 프레임당 vectra
  할당이 없다(`segment-rotate-origin` 선례). 단발 배열 결과라 allocating `tangents`를 그대로 쓴다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/polyline` namespace는
  `polyline-distance-probe` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `paper.js`, `figma`
- 작업 흐름: triangle closest point (점 → 삼각형 최근접점 스냅 = collision push-out / surface snap)
- 관련 함수: `triangle/closestPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-closest-point` (`apps/pixi-demo/src/examples/triangle-closest-point`)
- 설명: 화면 고정 scalene triangle과 draggable probe를 두고, probe를 drag하면 `closestPoint(triangle,
  probe)`가 삼각형 위에서 probe에 가장 가까운 점을 새 point로 돌려준다. 그 점에 marker를 스냅하고
  probe↔최근접점 연결선을 그려, "점을 도형 표면으로 밀어내기(push-out) / 표면 스냅"이라는 collision
  해소·snapping 작업 흐름을 보인다. probe가 삼각형 안이면 최근접점은 probe 자신이라 거리 0(inside,
  green)이고 연결선이 점으로 붕괴하며, 밖이면 세 변 AB·BC·CA의 clamped 최근접점 중 가장 가까운 변 위로
  투영된다(edge, amber). 이 inside/edge 구분과 연결선 거리(`Math.hypot`)는 모두 같은 최근접 관계의
  분해 표시이지 두 번째 관계가 아니다(`vec-set-length`가 한 set 관계를 up/down으로, `ellipse-closest-point`가
  거리를 함께 보인 선례와 같다). 내부/경계 point는 좌표 그대로(거리 0), degenerate triangle(collinear,
  세 vertex 동일 포함)은 closed area로 보지 않고 세 segment 최단점으로 환원하지만 고정 non-degenerate
  scalene이라 미발생, 동거리 tie-break는 strict `<`로 AB→BC→CA 순서를 유지하나 외부 코너 근처에서만
  의미라 시각화하지 않음, probe는 화면 margin clamp라 항상 finite여서 non-finite pass-through 미발생은
  모두 주석으로만 둔다. diagnostics는 distance·nearest(x,y)·region(inside/edge) 3개만 표시한다. 점→삼각형
  포함 **boolean** `triangle-contains-point`(containsPoint), classify+barycentric weight
  `triangle-barycentric-lab`, ellipse 경계 최근접점 `ellipse-closest-point`, 곡선 path 최근접점
  `path-closest-point`와 분리한 "점 → 삼각형 최근접점 스냅" 단일 개념 예제로, `triangle/closestPoint`/
  `closestPointInto` leaf의 첫 연결이다. 프레임당 1점 단발 결과라 allocating `closestPoint`를
  쓴다(`ellipse-closest-point`·`path-closest-point` 선례). diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/triangle` namespace는 `triangle-contains-point`/`triangle-barycentric-lab`가 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `p5.js`, `pixijs`
- 작업 흐름: vec set length (벡터 길이를 고정 target으로 set, 방향 보존 = 일정 속도 방향 제어 / magnitude set)
- 관련 함수: `vec/setLengthInto`, `vec/length`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-set-length` (`apps/pixi-demo/src/examples/vec-set-length`)
- 설명: 화면 중앙 고정 origin에서 velocity handle 1개를 자유롭게 drag하면 `setLengthInto(out, raw,
  SPEED)`가 raw 벡터의 방향은 보존하고 길이만 고정 `SPEED=140`으로 덮어쓴 결과를 매 프레임 갱신한다.
  결과 marker는 입력 길이가 길든 짧든 항상 반지름 `SPEED` 링 위에 놓여, 스틱을 얼마나 기울이든 같은
  속력으로 움직이는 twin-stick "일정 속도 방향 제어" 작업 흐름을 보인다. 입력이 `SPEED`보다 짧으면 링
  바깥으로 늘리고(scaled up, amber), 길면 링 안쪽으로 줄이며(scaled down, blue), 정확히 같으면 그대로
  통과한다(at target, green). 이 up/down 구분은 같은 set 관계의 scale factor(`SPEED/len`) 분해 표시이지
  두 번째 관계가 아니다(`vec-clamp-length-band`가 한 clamp를 pass/pull-in/push-out으로 분해한 선례와
  같다). handle을 origin에 정확히 겹쳐 길이 0이 되면 방향이 없어 `(0,0)`에 머무는 zero degenerate(red)를
  라이브로 처리하고, 길이가 정확히 `SPEED`면 통과(경계 포함), targetLength precondition(finite
  non-negative)은 고정 양수 상수라 항상 충족, non-finite 입력 pass-through는 handle 화면 clamp로
  미발생은 주석으로만 둔다. diagnostics는 raw len·out len(항상 == SPEED)·dir° 3개만 표시한다. 길이
  **band** `[min,max]` clamp(통과 구간·링 2개)인 `vec-clamp-length-band`, 방향 보간 `vec-slerp-direction`,
  projection/reflection 종합 lab `vector-projection-reflection-lab`과 분리한 "방향 보존 + 임의 고정 길이
  set(통과 구간 없음·링 1개)" 단일 개념 예제로, `vec/setLength`/`setLengthInto` leaf의 첫 연결이다.
  ticker render hot path라 allocating `setLength` 대신 `setLengthInto` out-buffer 1개를 재사용한다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/vec` namespace는 다수 vec
  예제가 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다. (선정 시 후보였던
  `vec/reflect`는 covered `reflectAcrossNormal`과 같은 반사 개념, `vec/slide`·`rejectFrom`은
  projection-reflection-lab과 겹치는 projection family, `vec/rotate`는 기존 회전 예제와 겹쳐 모두
  `alias-leaf-duplicate-concept` 회피로 제외.)

- reference: `pixijs`, `phaser`, `figma`
- 작업 흐름: bounds bounds overlap (두 AABB 겹침 = collision / hit-test 판정)
- 관련 함수: `intersects/intersectsBoundsBounds`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:bounds-bounds-overlap` (`apps/pixi-demo/src/examples/bounds-bounds-overlap`)
- 설명: 화면 고정 박스 A(AABB)와 draggable 박스 B를 두고, B를 drag하면 `intersectsBoundsBounds(a, b)`가
  두 AABB가 겹치거나 접하는지 boolean으로 판정한다. 겹치면 두 박스가 hit 색, 떨어지면 clear 색으로
  바뀌어 "두 사각형(버튼/충돌체)이 서로 닿는가?"라는 collision / hit-test 작업 흐름을 보인다. AABB
  겹침은 "x축 구간이 겹치고 AND y축 구간이 겹친다"(분리축)이므로, 하단 x축 막대·우측 y축 막대로 두 1D
  구간 겹침을 함께 그려 판정 식 자체를 드러낸다. 이 두 축 막대는 같은 비교의 inline 분해이지 두 번째
  관계가 아니다(별도 domain import 없이 `Math.max/min`으로 계산해 단일 API·단일 관계 유지,
  `circle-rect-overlap`의 nearest point·dist inline 분해 선례와 같다). 한 축 겹침이 정확히 0인 접촉
  (`|축 겹침| ≤ EDGE_EPS=1.5px`)은 노랑으로 강조해 변끼리 접점도 overlap=true인 closed boundary임을
  보이고, A 안에 B가 완전히 포함되어도 true인 containment 상태를 주석으로 명시한다. inverted bounds
  (min > max) → false는 B를 항상 valid(min < max)로 구성·clamp해 미발생(주석만), 두 박스 좌표는 화면
  margin clamp로 항상 finite다. diagnostics는 overlap·x-axis·y-axis 3개만 표시한다. 두 원 겹침
  `circle-circle-overlap`, 원 ↔ AABB 겹침 `circle-rect-overlap`, 두 선분 교차 `segment-segment-cross`,
  두 AABB **합집합** box `bounds-union-box`(`expandToIncludeBoundsInto`)와 분리한 "두 AABB 겹침
  boolean" 단일 개념 예제로, `intersects/intersectsBoundsBounds` leaf의 첫 연결이다. boolean 반환이라
  `*Into` companion이 없어 그대로 쓴다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/intersects` namespace는 `circle-circle-overlap` 등이 이미 sandbox allowlist 2배열에
  등록해 allowlist·runner-html 변경이 없다.

- reference: `paper.js`, `maker.js`
- 작업 흐름: segment point at length (segment 시작점 기준 절대 거리로 점 배치, clamp ↔ extrapolate 정책)
- 관련 함수: `segment/pointAtLengthInto`, `segment/pointAtLength`, `segment/length`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-point-at-length` (`apps/pixi-demo/src/examples/segment-point-at-length`)
- 설명: 하단 distance 트랙의 scrubber 1개를 drag해 거리 d(px)를 정하면, 고정 segment 위
  `pointAtLengthInto(seg, d)` marker가 시작점에서 d만큼 떨어진 위치를 가리킨다. d가 [0, length] 안이면
  marker가 segment 위에 놓이고(in range, green), 범위 밖이면 기본 clamp marker는 가까운 끝점에 멈추는
  반면 `{clamp:false}` ghost marker는 supporting line(segment를 무한 연장한 직선)을 따라 끝점 너머로
  나간다(clamped, amber). clamp marker·extrapolate ghost·supporting line guide·트랙의 in-range zone은
  모두 같은 `pointAtLength` 관계의 두 정책(clamp ↔ extrapolate) 분해 표시이지 두 번째 관계가 아니다
  (선례: `grid-snap-bracket` floor/ceil/nearest, `wrap-int-ring` inclusive/half-open). zero-length
  segment → 항상 시작점, d=NaN → extrapolation NaN 좌표, non-finite pass-through는 고정 non-zero
  segment·scrubber finite clamp라 미발생(주석만), 경계 d=0→start·d=length→end 포함. diagnostics는
  distance·length·mode 3개만 표시한다. polyline **비율**(t∈[0,1]) walk `polyline-length-ratio`/
  `polyline-path-walk`, rect 둘레 `rect-perimeter-walk`, curve 호 `arc-length-parameterize`, ray 위
  부호 거리 점 `vec-point-on-ray`, segment **구성** `segment-angle-builder`와 분리한 "단일 segment 위
  절대 거리 marker + clamp 정책" 단일 개념 예제로, `segment/pointAtLength` leaf의 첫 연결이다. hot path
  marker 2개는 `pointAtLengthInto` out-buffer 재사용, supporting line guide 양 끝점은 고정이라 setup
  1회 allocating `pointAtLength(..., {clamp:false})`로 계산(`rect-perimeter-walk` 선례). diagnostics는
  `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/segment` namespace는 다수 segment 예제가
  이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다. (선정 시 처음 잡은
  `vec/moveToward`가 `cursor-chase`의 `interpolation/moveTowardPoint`와 같은 개념임을 확인해 폐기 →
  [alias-leaf-duplicate-concept](../agent-traps/examples/alias-leaf-duplicate-concept.md) 함정 등록.)

- reference: `figma`, `paper.js`
- 작업 흐름: angle snap dial (연속 회전 각도를 step 눈금으로 snap = 에디터 shift 회전 각도 스냅)
- 관련 함수: `editor-geometry/snapAngle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:angle-snap-dial` (`apps/pixi-demo/src/examples/angle-snap-dial`)
- 설명: 화면 중앙 고정 피벗 둘레의 angle handle 1개를 drag하면 피벗→handle 방향의 연속 raw 각도를
  `snapAngle(raw, STEP=15°)`가 가장 가까운 step 눈금으로 snap한 needle을 매 프레임 갱신한다. handle을
  부드럽게 돌려도 snap needle은 15° 눈금 사이를 건너뛰며 딸깍 떨어지듯 움직여 "에디터에서 shift를
  누른 채 회전할 때의 각도 스냅" 작업 흐름을 보인다. dial 둘레 24개 step 눈금 중 snap된 눈금만 밝게
  강조하고, faint raw needle·bright snap needle·둘 사이 호로 snap이 입력을 얼마나 당겼는지 드러낸다.
  이 raw/snap/호/눈금은 모두 같은 snap 관계의 분해 표시이지 두 번째 관계가 아니다(`grid-snap-bracket`이
  한 snap을 floor/ceil/nearest로 분해한 선례와 같다). STEP은 360°를 24등분(정수)하는 고정 양수 상수라
  `snapAngle` precondition(finite, !=0)을 항상 만족하고 ±180° wrap에서 눈금이 일관되며, raw는 pointer
  화면 clamp + `atan2`라 항상 `(-π,π]` finite여서 non-finite pass-through가 미발생함은 주석으로만
  명시한다. raw가 두 눈금 정확히 중간이면 `Math.round`가 +방향으로 올림(tie→큰 각도)함도 주석으로 둔다.
  diagnostics는 raw°·snapped°·step° 3개만 표시한다. 위치 grid snap floor/ceil/nearest인
  `grid-snap-bracket`, matrix 회전+step snap을 묶은 `rotate-handle`(rotateHandlesInto 중심), 각도
  wrap/단위 변환 `angle-unit-compass`, 위치 축 잠금 `constrain-drag-axis-lock`과 분리한 "연속 각도 →
  이산 step snap" 단일 개념 예제로, `editor-geometry/snapAngle` leaf의 첫 연결이다. scalar 반환이라
  `*Into` companion이 없어 그대로 쓴다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용).
  `@cp949/vectra/editor-geometry` namespace는 `constrain-drag-axis-lock`/`rotate-handle` 등이 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `p5.js`, `pixijs`
- 작업 흐름: vec clamp length band (벡터 길이를 [min,max] band로 clamp, 방향 보존 = velocity speed cap / magnitude limiter)
- 관련 함수: `vec/clampLengthInto`, `vec/length`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-clamp-length-band` (`apps/pixi-demo/src/examples/vec-clamp-length-band`)
- 설명: 화면 중앙 고정 origin에서 velocity handle 1개를 자유롭게 drag하면 `clampLengthInto(out, raw,
  R_MIN, R_MAX)`가 raw 벡터의 방향은 보존하고 길이만 `[R_MIN=70, R_MAX=190]` band로 제한한 결과를
  매 프레임 갱신한다. 길이가 band 안이면 그대로 통과(green, raw==clamped), `R_MAX`보다 길면 max
  링으로 pull-in(blue), `R_MIN`보다 짧으면 min 링으로 push-out(amber)한다. 두 동심 링이 허용 band를
  그려 "통과/pull-in/push-out"이 모두 같은 `clampLength` 함수의 분기임을 드러낸다(같은 관계의 분해
  표시이지 두 번째 관계가 아니다). 입력·출력 길이는 `length`로 읽어 band와의 대소를 보인다. handle을
  origin에 정확히 겹쳐 길이 0이 되면 방향이 없어 min push-out이 불가능해 `(0,0)`에 머무는 zero
  degenerate(red)를 주석으로 명시하고, 길이가 정확히 `R_MIN`/`R_MAX`면 통과(경계 포함), non-finite
  입력 pass-through는 handle 화면 clamp로 미발생, precondition `0<=min<=max` finite은 고정 상수라
  항상 충족도 주석으로만 둔다. diagnostics는 raw len·clamped len·state 3개만 표시한다. 방향 보간
  `vec-slerp-direction`, projection/reflection 종합 lab `vector-projection-reflection-lab`, 고정 길이
  set(`setLength`)과 분리한 "길이 band clamp(방향 보존)" 단일 개념 예제로, `vec/clampLength`/
  `clampLengthInto` leaf의 첫 연결이다. ticker render hot path라 allocating `clampLength` 대신
  `clampLengthInto` out-buffer 1개를 재사용한다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text`
  미사용). `@cp949/vectra/vec` namespace는 다수 vec 예제가 이미 sandbox allowlist 2배열에 등록해
  allowlist·runner-html 변경이 없다.

- reference: `phaser`, `pixijs`, `figma`
- 작업 흐름: rect perimeter walk (t∈[0,1] parameter로 rect 경계 위 점 균등 arclength 파라미터화)
- 관련 함수: `rect/perimeterPointInto`, `rect/perimeterPoints`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-perimeter-walk` (`apps/pixi-demo/src/examples/rect-perimeter-walk`)
- 설명: 고정 비정방형 rect(320×170) 경계 위에서 ticker가 t를 0→1로 연속 순환시키면
  `perimeterPointInto`로 계산한 marker가 clockwise로 균등 거리씩 이동한다. setup에서 1회만
  `perimeterPoints(rect, { count: 8 })`로 계산한 8개 ghost dot이 꼭짓점이 아닌 위치에 분포해
  "t = 둘레 전체 대비 누적 거리 비율(균등 arclength)"임을 드러낸다. 4개 꼭짓점 참조점(faint blue)을
  ghost dot(faint amber)과 나란히 그려 비정방형에서 등간격 t ≠ corner임을 시각적으로 보인다.
  t=0(=1, wrap) → top-left, t=0.5 → bottom-right(width+height = perimeter/2로 항상 성립)는 주석만.
  t=NaN|Infinity는 ticker가 finite만 생성해 미발생(주석만). empty rect → top-left raw 반환은 고정 양수라
  미발생(주석만). `perimeterPoints` count ≤ 0 또는 비정수 → RangeError는 고정 양수 정수라 미발생(주석만).
  diagnostics는 t·x·y 3개만 표시한다. ticker hot path에서 `perimeterPointInto` out-buffer 1개를
  재사용하고 ghost dot은 rect 고정이라 setup 1회 allocating `perimeterPoints`로 미리 계산한다.
  `rect-uniform-inflate`(사방 inflate)·`rect-expand-to-include-point`(비대칭 point 확장)와 분리한
  "경계 위 점 균등 parameterization" 단일 개념 예제로, `rect/perimeterPoint`/`perimeterPointInto` +
  `rect/perimeterPoints`/`perimeterPointsInto` leaf의 첫 연결이다. `@cp949/vectra/rect` namespace는
  기존 rect 예제들이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `pixijs`, `phaser`, `figma`
- 작업 흐름: circle rect overlap (원반 ↔ AABB 겹침 = collision / hit-test 판정)
- 관련 함수: `intersects/intersectsCircleRect`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-rect-overlap` (`apps/pixi-demo/src/examples/circle-rect-overlap`)
- 설명: 화면 고정 사각형(AABB)과 draggable 원형 cursor를 두고, 원을 drag하면
  `intersectsCircleRect(circle, rect)`가 원반과 AABB가 겹치거나 접하는지 boolean으로 판정한다.
  겹치면 원·사각형·연결선이 hit 색, 떨어지면 clear 색으로 바뀌어 "이 원형 cursor(브러시/공)가
  사각형(버튼/벽)에 닿는가?"라는 collision / hit-test 작업 흐름을 보인다. rect 안에서 center에
  가장 가까운 점(center를 rect 범위로 clamp)과 그 거리 `dist`를 함께 그려 판정 식 `dist ≤ radius`
  자체를 드러내며, 이 nearest point·dist는 같은 비교의 inline 분해이지 두 번째 관계가 아니다
  (별도 domain import 없이 `Math.max/min`·`Math.hypot`으로 계산해 단일 API·단일 관계 유지,
  `circle-circle-overlap`의 centerDist/sumRadii inline 분해 선례와 같다). 외접(`dist ≈ radius`,
  `EDGE_EPS=1.5px`) 경계는 노랑으로 강조해 접점도 overlap=true인 closed boundary임을 보이고,
  center가 rect 내부면 nearest==center로 dist=0이라 항상 true인 containment 상태를 주석으로 명시한다.
  `radius ≤ 0`이나 `width/height ≤ 0` → false는 고정 양수라 미발생(주석만), center는 화면 margin
  clamp로 항상 finite다. diagnostics는 overlap·dist·radius 3개만 표시한다. 두 원 겹침
  `circle-circle-overlap`, 두 선분 교차 `segment-segment-cross`, 점 → 삼각형/path 포함
  `triangle-contains-point`·`path-fill-hit-test`와 분리한 "원 ↔ AABB 겹침" 단일 개념 예제로,
  `intersects/intersectsCircleRect` leaf의 첫 연결이다. boolean 반환이라 `*Into` companion이 없어
  그대로 쓴다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/intersects`
  namespace는 `circle-circle-overlap` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·
  runner-html 변경이 없다.

- reference: `paper.js`, `figma`
- 작업 흐름: triangle contains point (점 → 삼각형 포함 판정 = picking / selection hit-test)
- 관련 함수: `triangle/containsPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-contains-point` (`apps/pixi-demo/src/examples/triangle-contains-point`)
- 설명: 화면 고정 scalene triangle과 draggable probe 점을 두고, probe를 drag하면 `containsPoint(triangle, probe)`가
  점이 삼각형 면 안(경계 포함)에 있는지 boolean으로 판정한다. 내부면 triangle fill·stroke가 hit 색, 외부면 clear
  색으로 바뀌어 "이 삼각형을 가리키는가?"라는 picking / selection hit-test 작업 흐름을 보인다. boolean predicate라
  분해할 scalar가 없어 diagnostics는 inside(yes/no)·probe(x,y) 2개와 drag 안내만 둔다. closed boundary 정책이라
  edge·vertex 위 점도 true이고(boundary를 별 상태로 나누려면 `classifyPoint`를 쓴다 — 두 번째 관계라 제외),
  degenerate triangle(collinear, signed area 2x === 0)은 false인데 고정 non-degenerate scalene이라 미발생, probe는
  화면 margin clamp로 항상 finite는 모두 주석으로만 명시한다. inside/on-edge/outside 분류 + barycentric weight를
  묶은 `triangle-barycentric-lab`(classifyPoint), 변 길이 분류 `triangle-side-classification`, 점 → 채워진 path 포함
  `path-fill-hit-test`(containsPoint), shape↔shape boolean `circle-circle-overlap`·`segment-segment-cross`와 분리한
  "점 → 삼각형 포함" 단일 개념 예제로, `triangle/containsPoint` leaf의 첫 연결이다. boolean 반환이라 `*Into`
  companion이 없어 그대로 쓴다. diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/triangle`
  namespace는 `triangle-barycentric-lab` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `paper.js`, `maker.js`
- 작업 흐름: segment rotate origin (segment를 월드 원점(0,0) 기준 강체 회전)
- 관련 함수: `segment/rotate`, `segment/length`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-rotate-origin` (`apps/pixi-demo/src/examples/segment-rotate-origin`)
- 설명: 화면 원점 marker O 둘레의 angle handle을 drag하면 O에서 떨어진 고정 base segment가 그 각도만큼
  `rotate(base, angle)`로 회전한다. `rotate`는 회전 중심 파라미터가 없어 항상 월드 원점(0,0) 기준이라(임의
  center 기준은 `rotateAround`), 원점에서 떨어진 segment는 방향뿐 아니라 위치까지 통째로 "궤도"를 돈다. O→두
  끝점 radius line으로 두 끝점이 같은 반지름으로 원점을 도는 "원점 기준"임을 드러내고, θ=0 base ghost로 회전
  전/후를 대비한다. 회전된 segment에 `length`를 호출해 강체 회전이라 길이가 angle과 무관하게 상수임을 라이브로
  증명한다(같은 관계의 분해 표시이지 두 번째 관계가 아니다). radian·CCW(화면 y-down이라 시각적으로는 CW),
  zero-length나 NaN은 고정 non-zero base라 미발생(주석만). 조작 대상은 angle handle 1개뿐이고 궤도 반지름으로
  투영해 위치가 아닌 각도만 조절한다. diagnostics는 angle·length·drag 안내 3개만 둔다. 점을 임의 center 기준
  회전하는 `vec-rotate-around`, matrix transform `rotate-handle`, segment를 임의 center 기준 회전하는
  `segment-offset-normal-lab`(rotateAround)와 분리한 "원점 기준 segment 회전" 단일 개념 예제로, `segment/rotate`/
  `rotateInto` leaf의 첫 연결이다. drag당 1회 단발 object 결과라 allocating `rotate`를 그대로 쓰고 render는 저장
  state만 그려 프레임당 vectra 할당이 없다(`constrain-drag-axis-lock` 선례). `@cp949/vectra/segment` namespace는
  `segment-angle-builder` 등이 이미 sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `paper.js`, `figma`
- 작업 흐름: path fill hit test (점 → 채워진 path 포함 판정 = picking / selection hit-test)
- 관련 함수: `path/containsPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:path-fill-hit-test` (`apps/pixi-demo/src/examples/path-fill-hit-test`)
- 설명: 직선 변 1개 + cubic 2개로 곡선을 섞은 고정 closed path(단일 subpath)와 draggable probe 점을
  두고, probe를 drag하면 `containsPoint(commands, probe)`가 even-odd fill rule로 점이 채워진 면 내부인지
  boolean으로 판정한다. 내부면 path fill·stroke가 hit 색, 외부면 clear 색으로 바뀌어 "이 채워진 vector
  도형 안을 가리키는가?"라는 picking / selection hit-test 작업 흐름을 보인다. boolean predicate라 분해할
  scalar가 없어 diagnostics는 inside(yes/no)·probe(x,y) 2개와 drag 안내만 둔다. 곡선은 함수 내부에서
  flatten(default flatness 0.5)해 비교하므로 boundary 근처 결과는 flatness에 따라 달라질 수 있고, edge 위
  점은 true(boundary-inclusive)다(boundary를 별 상태로 나누려면 `classifyPoint`를 쓴다 — 두 번째 관계라
  제외). close 없는 open subpath → 닫힌 면적 없음 → false, empty path → false(고정 closed라 미발생), 다중
  subpath even-odd 홀(crossing 합산)은 단일 subpath라 무관은 모두 주석으로만 명시한다. probe는 화면 margin
  clamp로 항상 finite다. 점 → path 최근접점 스냅인 `path-closest-point`(closestPoint), point-in-triangle인
  `triangle-barycentric-lab`(classifyPoint), shape↔shape boolean인 `circle-circle-overlap`·
  `segment-segment-cross`와 분리한 "점 → 채워진 path 포함" 단일 개념 예제로, `path/containsPoint` leaf의
  첫 연결이다. boolean 반환이라 `*Into` companion이 없어 그대로 쓴다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/path` namespace는 `path-morph`/`path-closest-point`가 이미
  sandbox allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: segment segment cross (두 선분 교차 = link-crossing / collision boolean hit-test)
- 관련 함수: `intersects/intersectsSegmentSegment`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-segment-cross` (`apps/pixi-demo/src/examples/segment-segment-cross`)
- 설명: 화면 고정 선분 A와 draggable 선분 B를 두고, B의 자유 끝점을 drag하면 `intersectsSegmentSegment(A, B)`가
  두 선분이 만나는지 boolean으로 판정한다. 교차하면 두 선분과 끝점이 hit 색, 떨어지면 clear 색으로 바뀌어
  "두 선분이 서로 가로지르는가?"라는 link-crossing / collision hit-test 작업 흐름을 보인다. boolean predicate라
  분해할 scalar가 없어 diagnostics는 `intersect`(yes/no) 1개와 drag 안내만 두고, 교점 좌표·교차 분류(touch·
  collinear 라벨링)는 두 번째 관계라 의도적으로 제외한다(교점 좌표는 `segment-intersection-point`가 이미 소유).
  평행(서로 다른 직선)→false, collinear 겹침→true, 끝점만 닿음(touch)→true(closed), 두 끝점을 겹쳐
  zero-length가 된 B→점으로 환원해 A containment로 판정하는 degenerate 정책은 주석으로만 명시한다(끝점은 화면
  margin clamp로 항상 finite). 교점 좌표를 보이는 `segment-intersection-point`, ray↔segment 교차
  `intersects-ray-segment`와 분리한 "두 선분 교차 boolean" 단일 개념 예제로, `intersects/intersectsSegmentSegment`
  leaf의 첫 연결이자 `circle-circle-overlap`에 이은 `intersects` domain 두 번째 예제다. boolean 반환이라 `*Into`
  companion이 없어 그대로 쓴다. `@cp949/vectra/intersects` namespace는 `circle-circle-overlap`이 sandbox
  allowlist 2배열에 이미 등록해 allowlist·runner-html 변경이 없다.

- reference: `pixijs`, `phaser`
- 작업 흐름: circle circle overlap (두 원반 겹침 = collision / hit-test 판정)
- 관련 함수: `intersects/intersectsCircleCircle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-circle-overlap` (`apps/pixi-demo/src/examples/circle-circle-overlap`)
- 설명: 화면 고정 circle A와 draggable circle B를 두고, B를 drag하면 `intersectsCircleCircle(A, B)`가
  두 원반(closed disk)이 겹치거나 접하는지 boolean으로 판정한다. 판정 결과에 따라 두 원과 center↔center
  연결선이 clear/hit 색으로 바뀌어 충돌 판정을 보인다. 연결선 길이 `centerDist`와 `sumRadii`(=rA+rB)를
  함께 표시해 판정 식 `centerDist ≤ rA+rB` 자체를 드러내며, 이 두 값은 같은 비교의 분해 표시이지 두
  번째 관계가 아니다(별도 domain import 없이 `Math.hypot`으로 inline 계산해 단일 API·단일 관계 유지).
  외접(`centerDist ≈ sumRadii`) 경계는 노랑으로 강조해 접점도 overlap=true인 closed boundary임을 보이고,
  한 원이 다른 원을 완전히 포함해도 true인 disk overlap 판정(경계 교차가 아님)임을 주석으로 명시한다.
  `radius ≤ 0` → false는 고정 양수 반지름이라 미발생(주석만), center B는 화면 margin clamp로 항상 finite다.
  diagnostics는 overlap·centerDist·sumRadii 3개만 표시한다. boolean predicate라 `*Into` companion이 없어
  그대로 쓴다. `intersects` domain의 첫 예제이자 `intersects/intersectsCircleCircle` leaf의 첫 연결이다.
  `@cp949/vectra/intersects` namespace는 sandbox allowlist 2배열에 이미 등록돼 allowlist·runner-html 변경이
  없다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: path closest point (점 → 곡선 포함 path 최근접점 스냅)
- 관련 함수: `path/closestPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:path-closest-point` (`apps/pixi-demo/src/examples/path-closest-point`)
- 설명: 직선 + cubic 2개로 이루어진 고정 open path와 draggable probe 점을 두고, probe를 drag하면
  `closestPoint(commands, probe)`가 path 위에서 probe에 가장 가까운 점을 새 point로 돌려준다. 그 점에
  marker를 snap하고 probe↔nearest 연결선을 그려, 연결선이 곡선에 (거의) 수직(perpendicular foot)임을
  보인다. 곡선은 내부에서 flatten해 모든 draw segment를 비교하므로 nearest는 flatten 근사 polyline 위
  점이다. empty path → undefined(고정 non-empty라 미발생, `if (nearest)` 가드로 노출), move-only path →
  첫 move 위치, 동거리 candidate → 앞쪽 segment 우선, 다중 subpath gap segment 제외(단일 subpath라
  무관)는 주석으로만 명시한다. diagnostics는 probe(x,y)·nearest(x,y)·distance(px) 3개만 표시한다. 직선
  polyline에서 scalar 거리만 보이는 `polyline-distance-probe`(distance ring), ellipse 경계 최근접점
  `ellipse-closest-point`와 분리한 "곡선 포함 path 최근접점 스냅" 단일 개념 예제로, `path/closestPoint`
  leaf의 첫 연결이다. 프레임당 1점 단발 결과라 allocating `closestPoint`를 쓴다(`ellipse-closest-point`
  선례). threshold/hit-test 개념은 도입하지 않는다(가치는 proximity 판정이 아니라 점 위치 스냅).
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/path` namespace는
  `path-morph`가 이미 sandbox에 등록해 allowlist 변경이 없다.

- reference: `pixijs`, `paper.js`
- 작업 흐름: matrix lerp blend (두 keyframe transform component-wise 보간 = matrix tween)
- 관련 함수: `matrix/lerpInto`, `matrix/transformPointInto`, `matrix/determinant`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:matrix-lerp-blend` (`apps/pixi-demo/src/examples/matrix-lerp-blend`)
- 설명: 하단 slider t를 drag하면 고정 keyframe transform A(center (220,210), 0°, scale 0.9)·
  B(center (520,210), 150°, scale 1.5)를 `lerpInto(out, A, B, t)`가 `a,b,c,d,tx,ty` 각 성분 독립으로
  선형 보간한 matrix를 만들고, 그 matrix로 변환한 비대칭 arrow 도형이 갱신된다. translation(tx,ty)은
  직선으로 선형 이동(center marker가 A↔B 직선 위를 미끄러짐)하지만, 회전+스케일 성분은 분리 보간되지
  않아 중간 t에서 도형이 비강체로 수축하고 det가 endpoint det(0.81→2.25)의 선형 보간보다 훨씬 낮게
  떨어진다(t=0.5 부근 det≈0.18). 이 dip은 같은 component-wise 보간 관계의 성질이지 두 번째 관계가
  아니다(A·B ghost는 같은 보간의 두 endpoint로, `vec-lerp-points`가 끝점 A·B를 보인 형태와 같다).
  `lerp`는 t를 clamp하지 않으므로 slider 범위를 [-0.2,1.2]로 두어 extrapolation을 보이고, t가 NaN/
  Infinity면 결과가 정의되지 않는 caller 책임은 slider가 finite t만 만들어 회피한다(주석). 회전차를
  150°로 잡아 det dip을 또렷이 보이되 180°+동일 scale의 완전 붕괴(det=0)는 피하며, det가 0에 근접하면
  채움/stroke를 warn 색으로 바꿔 near-degenerate 수축을 강조한다(주석). 수평 shear `matrix-shear-transform`·
  축 반사 `matrix-mirror-reflection`·contain fit `content-fit-workbench`와 분리한 "두 transform 사이
  component-wise 보간(matrix tween)" 단일 개념 예제로, `matrix/lerp`/`lerpInto` leaf의 첫 연결이다.
  ticker render hot path라 allocating `lerp` 대신 `lerpInto` blend buffer 1개를 재사용하고, A·B ghost
  정점은 keyframe 고정이라 setup에서 1회만 변환한다. diagnostics는 t·det·center 3개만 표시한다.
  diagnostics는 `PIXI.Text`로만 출력한다(`g.text` 미사용). `@cp949/vectra/matrix` namespace는
  `matrix-shear-transform`/`matrix-mirror-reflection`/`content-fit-workbench`가 이미 sandbox에 등록해
  allowlist 변경이 없다.

- reference: `figma`, `pixijs`
- 작업 흐름: bounds union box (두 AABB 합집합 = 그룹 bounding box)
- 관련 함수: `bounds/expandToIncludeBoundsInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:bounds-union-box` (`apps/pixi-demo/src/examples/bounds-union-box`)
- 설명: 화면 고정 box A와 draggable box B를 두고, box B를 drag하면 두 box를 모두 포함하는 최소
  합집합 AABB가 매 프레임 갱신된다. `expandToIncludeBoundsInto`는 min을 두 box min의 성분별 최소,
  max를 성분별 최대로 계산한다. 합집합 box의 네 변 stroke를 각 변을 결정한 box(A|B) 색으로 칠해
  componentwise min/max 선택을 드러내고(같은 관계의 분해 표시이지 두 번째 관계가 아니다), B를 A
  안으로 완전히 넣으면 합집합 == A가 되어 B가 어느 변에도 기여하지 않는 가시 상태를 보인다. 함수는
  raw min/max만 적용하고 inverted bounds를 정규화하지 않으므로 box를 항상 valid(min<max)하게 구성·
  clamp해 degenerate를 회피한다(주석만). tie(좌표 동일)는 함수가 min/max 모두 other(=B)를 택하므로
  owner 판정도 같은 비교(`A<B?A:B`, `A>B?A:B`)로 맞춘다. diagnostics는 union(W×H)·min(x/y owner)·
  max(x/y owner) 3개만 표시한다. 점 1개 비대칭 확장인 `rect-expand-to-include-point`, 사방 균일
  offset인 `rect-uniform-inflate`, 점집합 tight box인 canvas `selection-bounds`와 분리한 "두 box
  합집합" 단일 개념 예제로, `bounds/expandToIncludeBoundsInto` leaf의 첫 연결이자 bounds domain 첫
  pixi 예제다. allocating companion이 없어 `*Into`를 그대로 쓰고 ticker render hot path에서 out-buffer
  1개를 재사용한다. `@cp949/vectra/bounds`는 신규 namespace라 `pixi-module-specifiers.ts` allowlist·
  runtime 2배열에 새로 등록했다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: polyline distance probe (점 → polyline 최단 거리 proximity hit-test)
- 관련 함수: `polyline/distanceToPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:polyline-distance-probe` (`apps/pixi-demo/src/examples/polyline-distance-probe`)
- 설명: 화면 고정 zigzag polyline(stroke)과 draggable probe point를 두고, probe를 drag하면
  `distanceToPoint(points, probe)`가 probe에서 polyline의 모든 segment까지 거리를 비교해 최솟값을
  반환한다. probe 중심 반지름=거리 원이 polyline에 정확히 접해 그 값이 최단 거리임을 시각적으로
  증명하고(closest point API 없이 scalar만으로 최솟값 표현), 고정 threshold 반지름 원과 비교해
  `d <= threshold`이면 stroke를 hit 강조색으로 칠해 "pointer가 stroke 근처인가?"라는 proximity
  hit-test 사용자 작업을 보인다. threshold 비교는 같은 거리 값에 대한 판정이지 두 번째 관계가
  아니다(`grid-snap-bracket`이 한 snap 관계를 floor/ceil/nearest로 보인 형태와 같다). empty
  polyline은 Infinity, single-point/모든 segment length 0인 polyline은 첫 point까지 거리, 동거리
  closest segment는 앞쪽 우선이라는 정책은 고정 6-vertex라 미발생이며 주석으로만 명시한다. probe를
  stroke 위에 정확히 올리면 d≈0이라 distance ring이 점으로 붕괴한다. diagnostics는 distance·
  threshold·near 3개만 표시한다. arclength 샘플링 lab `polyline-path-walk`·normalized ratio walk
  `polyline-length-ratio`와 분리한 "점→polyline 최단 거리" 단일 개념 예제로, `polyline/distanceToPoint`
  leaf의 첫 연결이다. scalar 반환이라 `*Into` companion이 없어 그대로 쓴다. `@cp949/vectra/polyline`
  namespace는 `polyline-path-walk`/`polyline-length-ratio`가 이미 sandbox에 등록해 allowlist 변경이 없다.

- reference: `p5.js`, `pixijs`
- 작업 흐름: wrap int ring (정수 raw를 cyclic ring 인덱스로 wrap, 닫힘/반열림 range convention 대비)
- 관련 함수: `math/wrapIntInclusive`, `math/wrapIntHalfOpen`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:wrap-int-ring` (`apps/pixi-demo/src/examples/wrap-int-ring`)
- 설명: 정수 슬롯 ring(0..7) 아래 가로 트랙에서 scrubber를 drag해 정수 `raw`(ring 범위 밖 음수/큰 값
  포함)를 정하면, 같은 raw를 두 wrap 함수가 ring 인덱스로 감싼다. `wrapIntInclusive(raw,0,7)`은
  closed range `[0,7]`(span 8)이라 슬롯 8개 전부에 도달하고, `wrapIntHalfOpen(raw,0,7)`은 half-open
  `[0,7)`(span 7)이라 상한 슬롯(=7)을 제외해 raw=7이 0으로 접힌다. 두 결과가 갈리면 두 슬롯을 연결선으로
  잇고, 슬롯 7은 half-open이 절대 못 닿아 warn 윤곽으로 표시한다. raw가 ring 범위 밖이어도 positive
  modulo로 항상 유효 슬롯으로 감기고(raw=-1 → inclusive 7, half-open 6), 트랙의 `[0,7]` in-range zone이
  "그 밖 정수도 ring으로 돌아온다"를 대비한다. 두 함수는 safe integer만 받으므로 scrubber 위치를
  `Math.round`로 정수화하고 min/max는 고정 정수다(비정수면 RangeError). diagnostics는 raw·inclusive·
  half-open 3개만 표시한다. 비-cyclic scalar grid snap floor/ceil/nearest인 `grid-snap-bracket`,
  각도 wrap인 `angle-unit-compass`와 분리한 "정수 cyclic ring index wrap" 단일 개념 예제로,
  `math/wrapIntInclusive`/`wrapIntHalfOpen` leaf의 첫 연결이다. 두 함수는 같은 cyclic wrap 관계의 두
  범위 규약(span이 1 다름)이라 `grid-snap-bracket`이 한 snap 관계를 세 방향으로 보인 형태와 같다.
  scalar 반환이라 `*Into` companion이 없어 그대로 쓴다. `@cp949/vectra/math` namespace는
  `grid-snap-bracket`이 이미 sandbox에 등록해 allowlist 변경이 없다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: ellipse uniform expand (단일 delta로 두 반지름 동시 확장/축소, 0-clamp 붕괴)
- 관련 함수: `ellipse/expandByInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ellipse-uniform-expand` (`apps/pixi-demo/src/examples/ellipse-uniform-expand`)
- 설명: 화면 중앙 고정 base ellipse(center (360,220), rx=170, ry=95)에 세로 트랙 handle 1개를
  drag해 단일 delta를 정하면 `expandByInto`가 `radiusX += delta`, `radiusY += delta`로 두 반지름을
  같은 절대량만큼 동시에 키우거나(margin band) 줄인(deflate) 동심 ellipse를 갱신한다. center는
  delta와 무관하게 고정되고, rx≠ry라 같은 절대 delta가 두 반지름에 더해질 때 이심률이 바뀐다.
  +x축·+y축 radial delta 화살표가 두 축이 같은 delta로 이동함을 보인다. `expandByInto`는 결과
  radius가 음수이면 0으로 clamp하므로(음수 반지름 없음), delta=-ry(=-95)에서 ry=0(가로 선분으로
  붕괴), delta=-rx(=-170)에서 rx=0(점으로 붕괴)에 정확히 닿고 그 아래로 더 내려도 0에 머문다.
  이는 결과 width/height를 clamp하지 않아 음수 크기로 붕괴(inversion)하는 `rect-uniform-inflate`의
  no-clamp 정책과 반대다(같은 uniform offset 관계지만 도메인·degenerate 정책이 다르다). 0-radius는
  `g.ellipse`가 그리지 못해 선/점 fallback으로 붕괴를 그리고 warn 색으로 표시한다. diagnostics는
  delta·radiusX·radiusY 3개만 표시한다. 반지름 개별 편집인 `ellipse-inspector`, 박스 내접 구성인
  `ellipse-from-rect`, 경계 최근접점인 `ellipse-closest-point`, rect 도메인 uniform inflate인
  `rect-uniform-inflate`와 분리한 "단일 delta uniform radius offset" 단일 개념 예제로,
  `ellipse/expandBy`/`expandByInto` leaf의 첫 연결이다. ticker render hot path라 allocating
  `expandBy` 대신 `expandByInto` out-buffer 1개를 재사용한다. `@cp949/vectra/ellipse` namespace는
  `ellipse-inspector`/`ellipse-foci-sum`/`ellipse-from-rect`/`ellipse-closest-point`가 이미 sandbox에
  등록해 allowlist 변경이 없다.

- reference: `p5.js`, `d3-shape`
- 작업 흐름: sample table lookup (균등 간격 scalar 표에서 t∈[0,1] 위치 값을 linear 보간 조회)
- 관련 함수: `interpolation/sampleTableAt`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:sample-table-lookup` (`apps/pixi-demo/src/examples/sample-table-lookup`)
- 설명: 균등 간격 scalar 표(7개)를 꺾은선 그래프로 깔고, 가로 트랙의 probe scrubber를 drag하면
  `(probe.x-left)/plotW`로 환산한 t∈[0,1]을 `sampleTableAt(table, t)`가 표에서 linear 보간 조회해
  꺾은선 위 marker로 표시한다. 각 sample은 parameter 위치 t=i/(n-1)(균등 간격)에 놓이고, sample을
  잇는 꺾은선이 sampleTableAt가 보간하는 경로 그 자체다. probe.x를 그래프 폭으로 clamp해 t가 항상
  [0,1]이라 기본 extrapolate:false clamp 정책과 일치하고 외삽 분기는 미발생(주석 명시), t=0→첫
  sample/t=1→마지막 sample에 정확히 닿는다. 기본 linear 모드만 쓰고 nearest/extrapolate/table 편집은
  두 번째 관계라 의도적으로 제외한다. diagnostics는 t·value·segment(lower -> upper) 3개만 표시한다.
  단일 구간 정규화 `inverse-lerp-track`, 두 점 직선 보간 `vec-lerp-points`, 2D quad 매핑
  `bilinear-warp-grid`, 연속 함수 timing `easing-*`과 분리한 "이산 표 → 연속 보간 조회" 단일 개념
  예제로, `interpolation/sampleTableAt` leaf의 첫 연결이다. scalar 반환이라 `*Into` companion이 없어
  그대로 쓴다. `@cp949/vectra/interpolation` namespace는 `cursor-chase`/`bilinear-warp-grid`/
  `inverse-lerp-track`이 이미 sandbox에 등록해 allowlist 변경이 없다.

- reference: `figma`, `pixijs`
- 작업 흐름: distribute equal gaps (양 끝 anchor 사이 중간 박스 등간격 분배)
- 관련 함수: `editor-geometry/distributeEquallyInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:distribute-equal-gaps` (`apps/pixi-demo/src/examples/distribute-equal-gaps`)
- 설명: 박스 5개 중 오른쪽 anchor를 drag하면 `distributeEquallyInto(bounds, 'gap-x')`가 정렬상 첫/
  마지막(양 끝 anchor)을 제외한 중간 3개를 인접 간격이 균등해지는 target top-left로 재분배한다.
  양 끝 anchor는 출력에 포함되지 않아 이동하지 않고, anchor를 멀리 끌수록 균등 간격이 커진다.
  중간 source 슬롯은 일부러 흩어둔 ghost로 깔아 "messy 입력 → 균등 출력" 변화를 보이고, 인접
  bracket 4개가 모두 같은 값(=핵심 관계 증거)을 표시한다. 오른쪽 anchor를 가깝게 끌어 가용 폭이
  중간 박스 너비 합보다 작아지면 equalGap이 음수가 되어 중간 박스가 겹치고(IEEE-754 silent) warn
  색으로 표시된다. 입력 bounds < 3이면 0 반환 + 빈 out(여기선 5개라 미발생, 주석만)이고, 입력
  minVal 오름차순 정렬이라 box4.left를 box3 source보다 크게 clamp해 마지막 anchor 지위를 유지한다.
  diagnostics는 gap·span·boxes 3개만 표시한다. 축 잠금 드래그인 `constrain-drag-axis-lock`,
  resize인 `transform-handles`, 회전인 `rotate-handle`, point snap인 `editor-snap-guides-lab`과
  분리한 등간격 분배 단일 개념 예제로, `editor-geometry/distributeEquallyInto` leaf의 첫 연결이다.
  collection 출력 + caller factory라 allocating companion이 없어 `*Into`를 그대로 쓰고, `targets`
  배열과 3-slot point pool을 render hot path에서 재사용한다. `@cp949/vectra/editor-geometry`
  namespace는 `constrain-drag-axis-lock`/`rotate-handle`/`editor-snap-guides-lab`/`transform-handles`가
  이미 sandbox에 등록해 allowlist 변경이 없다.

- reference: `paper.js`, `p5.js`
- 작업 흐름: ellipse closest point (probe → ellipse 경계 최근접점, normal의 발)
- 관련 함수: `ellipse/closestPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ellipse-closest-point` (`apps/pixi-demo/src/examples/ellipse-closest-point`)
- 설명: 화면 고정 ellipse(rx≠ry) 경계에서 draggable probe에 가장 가까운 점을 `closestPoint`로 찾아
  marker로 스냅하고, probe↔경계점 연결선이 최단 거리를 보인다. rx≠ry라 최근접점은 center→probe
  방사선이 닿는 곳이 아니라 ellipse normal의 발이며(연결선이 경계에 수직), 내부 변환에
  Newton-Raphson 반복이 쓰인다. probe를 ellipse 안으로 끌어도 marker는 경계 위에 남고(내부 점도
  경계로 투영), probe===center이면 θ₀=0 tie-break으로 (cx+radiusX, cy)에 스냅하는 정책을 주석으로
  명시한다. empty ellipse(rx≤0||ry≤0 → center 반환)는 고정 ellipse가 non-empty라 미발생이라 주석만
  둔다. diagnostics는 distance·θ(deg) 2개만 표시한다. 반지름 핸들 편집인 `ellipse-inspector`,
  bounding box 구성인 `ellipse-from-rect`, 초점 거리합인 `ellipse-foci-sum`과 분리한 경계 최근접점
  단일 개념 예제다. allocating `ellipse/closestPoint` leaf의 첫 연결이다(`closestPointInto`는
  `ellipse-inspector`가 이미 사용). probe→경계점은 프레임당 1점 단발 결과라 allocating `closestPoint`를
  쓴다(`ellipse-from-rect`의 `fromRect` 단발 선례). `@cp949/vectra/ellipse` namespace는
  `ellipse-inspector`/`ellipse-foci-sum`/`ellipse-from-rect`가 이미 sandbox에 등록해 allowlist 변경이
  없다.

- reference: `figma`, `pixijs`
- 작업 흐름: constrain drag axis lock (drag-start anchor 기준 우세 축 잠금 드래그)
- 관련 함수: `editor-geometry/constrainDrag`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:constrain-drag-axis-lock` (`apps/pixi-demo/src/examples/constrain-drag-axis-lock`)
- 설명: 박스를 drag하면 `constrainDrag(from, to, { axisLock: 'auto' })`가 drag 시작 anchor(`from`)
  기준으로 우세 축을 골라 이동을 잠근다. |dx| > |dy|이면 수평(y 고정), 아니면 수직(x 고정)으로
  잠겨 박스가 anchor를 지나는 두 가이드 축 중 하나 위에만 머문다. 드래그 도중 dx/dy 우세가 바뀌면
  잠금 축도 라이브로 뒤집힌다. raw 목적지 ghost 박스와 actual 박스를 잇는 연결선이 잠금으로 0이 된
  수직/수평 성분을 보이고, 현재 잠긴 가이드 축만 밝게 강조한다. dx===dy===0(이동 없음)이면 lock
  none으로 to를 그대로 두고, dx===dy(대각선 동률)이면 `dx>dy` 미성립이라 수직 잠금(x 고정)으로
  가는 경계 정책을 주석에 명시한다. `containIn`(영역 클램프)은 별개 관계라 의도적으로 제외하고
  화면 밖 방지용 margin clamp만 표현용으로 둔다. diagnostics는 lock·dx·dy 3개만 표시한다. point
  snap dispatcher인 `editor-snap-guides-lab`, resize인 `transform-handles`, 회전인 `rotate-handle`과
  분리한 축 잠금 드래그 단일 개념 예제로, `editor-geometry/constrainDrag`/`constrainDragInto` leaf의
  첫 연결이다. 박스 위치는 pointermove당 1회 단발 계산이라 allocating `constrainDrag`를 쓴다
  (`vec-rotate-around`의 `rotateAround` 단발 호출 선례). `@cp949/vectra/editor-geometry` namespace는
  `rotate-handle`/`editor-snap-guides-lab`/`transform-handles`가 이미 sandbox 2경계에 등록해 allowlist
  변경이 없다.

- reference: `paper.js`, `d3-shape`
- 작업 흐름: arc length parameterize (arc length 거리 → 파라미터 t 역매핑, 타원에서 비선형)
- 관련 함수: `curve/arcTAtLength`, `curve/arcPointAtTInto`, `curve/arcLengthAtT`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:arc-length-parameterize` (`apps/pixi-demo/src/examples/arc-length-parameterize`)
- 설명: 고정 타원 호(rx≠ry) 위에서 ticker가 ratio r을 등속으로 0↔1 ping-pong시키면 `arcTAtLength`로
  거리(=r×total)를 t로 역매핑한 marker가 등속(등호장)으로 호를 걷는다. 오른쪽 aspect knob 1개로
  ry를 [MIN_RY, rx]에서 바꿔 원(ry=rx)↔타원(ry<rx)을 오가며, 등거리 ghost dot(0/.25/.5/.75/1)이
  등각이 아닌 등호장 위치에 분포함을 보인다. 원이면 등각=등호장이라 ghost와 marker가 t==ratio로
  선형 일치하고, 타원이면 t≠ratio로 갈라져 "arc length↔t 매핑이 비선형"임을 드러낸다(같은 관계의
  표현이지 두 번째 관계가 아니다). `arcTAtLength`는 distance를 [0,total]로 clamp하므로 r=0/r=1이 호
  양 끝에 정확히 닿고, ry를 MIN_RY>0으로 clamp해 degenerate(rx≤0||ry≤0 → t=0, point=center)를 원천
  차단한다. diagnostics는 ratio·t·total 3개만 표시하고, ratio 대비 t 차이가 비선형성의 수치 증거다.
  정적 multi-API probe인 `canvas-demo:arc-length-probe`(arcLengthAtT/arcPointAtLength/tangent/normal
  묶음)와 분리한 arc length→t 단일 개념 예제로, `curve/arcTAtLength` leaf의 첫 연결이다. ticker hot
  path + ghost loop + 호 stroke라 allocating companion이 없는 `arcPointAtTInto` out-buffer 3개를
  재사용한다. `@cp949/vectra/curve` namespace는 `arc-flatten`/`arc-to-cubic`이 이미 sandbox에 등록해
  allowlist 변경이 없다.

- reference: `d3-random`, `p5.js`
- 작업 흐름: bernoulli trial tally (확률 p의 베르누이 시행 누적 → 경험적 성공 빈도가 p로 수렴)
- 관련 함수: `random/bernoulli`, `random/createRng`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:bernoulli-trial-tally` (`apps/pixi-demo/src/examples/bernoulli-trial-tally`)
- 설명: 오른쪽 세로 track의 p knob 1개를 drag해 성공 확률 [0,1]을 정하면, ticker가 매 프레임 그 확률로
  `bernoulli(p, rng)` 시행을 누적해 success(true)/false 카운트에 쌓고, 경험적 성공 빈도 막대가 그 위에
  깐 p 기준선(dashed)으로 수렴한다(대수의 법칙). success 막대와 complement(false) 막대를 0..1 frame
  안에 그려 비율을 읽게 하고, p 기준선은 같은 관계의 목표값 표현이지 두 번째 관계가 아니다. p를 바꾸면
  누적 tally와 rng stream을 같은 seed로 리셋해 새 p에서 수렴 과정을 다시 보인다. p<=0이면 항상 false
  (success=0), p>=1이면 항상 true(success=1)인 결정적 끝을 knob 경고색으로 드러내고, knob clamp가
  `bernoulli`의 [0,1] finite 요구(밖이면 RangeError)를 항상 만족시킨다는 점을 주석으로 명시한다.
  diagnostics는 p·success freq(경험적)·samples 3개만 표시한다. 연속분포 histogram인
  `normal-distribution-histogram`(매 프레임 reseed 정적 분포)·2D scatter인
  `canvas:random-distribution-sampling`과 분리한 이산 베르누이 시행 단일 개념 예제로, `random/bernoulli`
  leaf의 첫 연결이다. `bernoulli`는 boolean scalar 반환이라 *Into companion이 없어 그대로 쓴다. LLN
  수렴은 stateful animation이라 매 프레임 reseed하지 않고 stream을 누적한다(p 변경 시에만 리셋).
  `@cp949/vectra/random` namespace는 `normal-distribution-histogram`이 이미 sandbox에 등록해 allowlist
  변경이 없다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: vec point on ray (origin + normalize(direction) × 부호 distance → ray 위 점)
- 관련 함수: `vec/pointOnRay`, `vec/normalize`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-point-on-ray` (`apps/pixi-demo/src/examples/vec-point-on-ray`)
- 설명: 화면 중앙 고정 origin에서 방향 handle 1개를 drag해 ray 각도를 바꾸고, ticker가 distance를
  sin으로 -RANGE↔+RANGE 등속 왕복시키면 `pointOnRay`로 계산한 marker가 그 ray 위를 부호 거리만큼
  미끄러진다. distance가 음수면 marker가 origin을 지나 반대편(backward, 색 구분)으로 가 부호 거리를
  드러낸다. `pointOnRay`는 direction을 내부에서 정규화하므로 handle을 origin에서 멀리/가까이 끌어
  dir len을 바꿔도 marker의 origin 거리는 항상 |distance|와 같다(같은 관계의 표현이지 두 번째 관계가
  아니다). origin에서 `normalize(dir)` unit tick과 forward(solid)/backward(faint) ray line을 그려
  방향이 정규화됨을 보인다. handle을 origin에 겹쳐 zero-length direction을 만들면 `pointOnRay`가
  undefined를 반환해 marker를 숨기고 handle을 경고색으로 표시하는 degenerate 정책을 주석으로 명시한다.
  diagnostics는 distance(부호)·marker |from origin|(= |distance|)·dir len(무시됨) 3개만 표시한다.
  segment t 파라미터화(`segment/pointAtT`, [0,1] 유한)·ray 교차(`ray-cast`/`ray-intersection-lab`)·
  회전(`vec-rotate-around`)과 분리한 ray 위 부호 거리 점 단일 개념 예제로, `vec/pointOnRay`/
  `pointOnRayInto` leaf의 첫 연결이다. marker는 프레임당 1점 단발 결과라 allocating `pointOnRay`를
  쓴다. `@cp949/vectra/vec` namespace는 다수 vec 예제가 이미 sandbox 2경계에 등록해 allowlist 변경이
  없다.

- reference: `paper.js`, `d3-shape`
- 작업 흐름: polyline length ratio (normalized arclength ratio → polyline 위 point, 등비율=등거리)
- 관련 함수: `polyline/pointAtLengthRatioInto`, `polyline/length`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:polyline-length-ratio` (`apps/pixi-demo/src/examples/polyline-length-ratio`)
- 설명: segment 길이가 제각각인 5-vertex polyline 위에서 ticker가 ratio t를 등속으로 0↔1 왕복시키면
  `pointAtLengthRatioInto`로 계산한 marker가 등속(등거리)으로 경로를 걷는다. 꼭짓점을 drag해 경로
  모양을 바꿔도 t는 같은 시간에 0→1을 완주하고, 등비율(0/.25/.5/.75/1) ghost dot은 vertex가 아닌
  등거리 위치로 다시 분포해 "normalized arclength ratio = 전체 길이 대비 거리 비율(등비율=등거리)"을
  드러낸다(같은 관계의 표현이지 두 번째 관계가 아니다). ratio는 함수 내부에서 [0,1]로 clamp되고
  t=0/t=1이 첫/끝 vertex에 정확히 닿으며, 꼭짓점을 이웃에 겹쳐 zero-length segment를 만들면 arclength가
  그 칸을 0으로 건너뛰어 marker가 멈추지 않는 정책을 주석으로 명시한다. diagnostics는 ratio·covered
  (= t×total)·total length 3개만 표시한다. 절대 거리 파라미터화(`pointAtLength`)·sample·simplify·
  closest·tangent를 묶은 기존 multi-API lab `polyline-path-walk`와 분리한 normalized ratio 단일 개념
  예제로, `polyline/pointAtLengthRatio`/`pointAtLengthRatioInto` leaf의 첫 연결이다. ticker hot path +
  등비율 dot loop라 allocating `pointAtLengthRatio` 대신 `*Into` out-buffer 2개(marker·ghost)를
  재사용한다. `@cp949/vectra/polyline` namespace는 `polyline-path-walk`가 이미 sandbox 2경계에 등록해
  allowlist 변경이 없다.

- reference: `paper.js`, `d3-shape`
- 작업 흐름: arc flatten (center form 원호 → flatness tolerance 기반 adaptive polyline 근사)
- 관련 함수: `curve/arcFlattenInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:arc-flatten` (`apps/pixi-demo/src/examples/arc-flatten`)
- 설명: 화면 고정 semicircle 원호를 `arcFlattenInto`로 adaptive subdivision 근사하고, 오른쪽 flatness
  슬라이더 knob 1개를 drag해 chord-error 허용오차를 바꾸면 polyline segment 수와 arc-polyline 최대
  gap이 함께 변한다. 위(fine)로 끌면 segment가 촘촘해 gap이 작고, 아래(coarse)로 끌면 segment가
  줄며 gap이 커지다가, MAX_FLAT(>semicircle sagitta=radius)에서 전체 호가 단일 chord(segment 1개)로
  붕괴해 "tolerance가 크면 근사가 거칠어진다"는 정책을 드러낸다. 원호(rx===ry, xRotation=0)라 arc gap을
  `|hypot(점-center) - radius|`로 정확히 측정해 최악 segment midpoint에 radial 표시를 그린다. diagnostics는
  flatness·segments·max gap 3개만 표시한다. 참조용 true arc는 같은 `arcFlattenInto`를 작은 flatness(0.05)로
  호출해 faint하게 깔아 근사 대비를 보인다(같은 관계의 정확도 표현이지 두 번째 관계가 아니다). cubic
  Bezier 근사인 `arc-to-cubic`, 고정 개수 sampling이나 길이 파라미터화(`arc-length-probe`)와 분리한 adaptive
  flatten 단일 개념 예제로, `curve/arcFlatten`/`arcFlattenInto` leaf의 첫 연결이다. ticker render hot path라
  allocating `arcFlatten` 대신 `arcFlattenInto` out-buffer를 재사용한다. `@cp949/vectra/curve` namespace는
  `arc-to-cubic`이 이미 sandbox에 등록해 allowlist 변경이 없다.

- reference: `css steps()`, `gsap`
- 작업 흐름: stepped timing track (등속 t → 계단형 steps() timing)
- 관련 함수: `easing/steps`, `segment/pointAtTInto`, `interpolation/remap`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:stepped-timing-track` (`apps/pixi-demo/src/examples/stepped-timing-track`)
- 설명: 진행도 t가 등속으로 차오르는 동안 같은 t를 `steps(t, count, 'end')`로 변환해 트랙 위
  marker가 `count`개의 이산 위치만 밟으며 이동한다. count handle을 위아래로 drag하면 계단 수가
  바뀌어 marker가 더 잘게/듬성 밟고, 왼쪽 graph의 staircase 곡선도 같이 촘촘해진다. `direction:
  'end'`는 `floor(t*count)/count`라 t∈[0,1)에서 최대 `(count-1)/count`까지만 가고 t=1에서만 정확히
  1로 snap하므로, RUN 뒤 HOLD 구간(t=1)에서 marker가 마지막 칸으로 튀는 end-riser 동작을 드러낸다.
  `count`는 양의 정수 ≥ 1 요구라 handle 값을 `Math.round`로 정수화하고 1~12로 clamp한다(위반 시
  RangeError). diagnostics는 count·t·stepped 3개만 표시한다. smooth easing 곡선 cycling 비교인
  `easing-motion-timing`과 분리한 discrete stepped timing 단일 개념 예제로, `easing/steps` leaf의
  첫 연결이다. `@cp949/vectra/easing`·`interpolation`·`segment` namespace는 `easing-motion-timing`이
  이미 sandbox에 등록해 allowlist 변경이 없다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: grid snap bracket (값을 감싸는 grid 칸 경계쌍 floor/ceil + nearest)
- 관련 함수: `math/snapFloor`, `math/snapCeil`, `math/snapTo`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:grid-snap-bracket` (`apps/pixi-demo/src/examples/grid-snap-bracket`)
- 설명: 트랙 위 probe 값을 drag하면 그 값을 감싸는 grid 칸의 아래 경계(`snapFloor`)와 위 경계
  (`snapCeil`)가 강조되고, 둘 중 가까운 칸(`snapTo`)이 nearest marker로 표시된다. 세 함수는 같은
  grid snap 관계의 세 방향(내림·올림·반올림)이라 `distance-metrics`가 한 거리 관계를 세 척도로 보인
  형태와 같다(두 번째 관계가 아니다). gap handle을 끌면 grid 칸 폭이 바뀌어 같은 probe가 다른 칸에
  맞춰진다(snap 해상도 편집 보조 handle). probe가 tick에 정확히 닿으면 floor=ceil=nearest가 되어
  bracket 폭이 0으로 붕괴하는 경계 동작을 드러내고, gap을 GAP_MIN(16px)으로 clamp해 `gap>0` 요구
  (`gap<=0`이면 RangeError)와 0폭 grid를 막는다. `snapTo`는 `Math.round` 기반이라 칸 정중앙은
  위쪽 칸으로 반올림(half-up)한다. diagnostics는 floor·ceil·nearest 3개만 표시한다. scalar 변환
  종합인 `canvas:math-value-mapping`(remap/clamp/roundTo/snapTo), 2D point snap dispatcher인
  `pixi:editor-snap-guides-lab`과 분리한 1D grid snap 단일 개념 예제로, `math/snapFloor`·`math/snapCeil`
  leaf의 첫 연결이자 `math/snapTo`의 nearest 기준 보강이다. `@cp949/vectra/math` namespace는
  기존 예제가 이미 sandbox 4경계에 등록해 allowlist 변경이 없다.

- reference: `p5.js`, `d3-random`
- 작업 흐름: normal distribution histogram (seed 고정 RNG 정규분포 샘플 → 1D 히스토그램)
- 관련 함수: `random/createRng`, `random/normal`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:normal-distribution-histogram` (`apps/pixi-demo/src/examples/normal-distribution-histogram`)
- 설명: seed가 고정된 `createRng`로 매 프레임 같은 z-sequence를 재생산하고, `normal(mean, stddev, rng)`로
  transform한 정규분포 scalar 샘플을 1D 히스토그램으로 그린다. mean handle을 drag하면 분포가 통째로
  이동하고(stddev handle은 폭을 유지하며 따라감), stddev handle을 drag하면 폭이 넓어지거나 좁아진다.
  같은 관계의 기준선으로 이론 정규분포 pdf 곡선을 히스토그램 면적에 맞춰 faint하게 깔아 샘플이 분포를
  따름을 보인다(두 번째 관계가 아니다). stddev를 0까지 좁히면 `normal`이 항상 mean을 반환해 모든 샘플이
  한 bin에 모이는 spike가 되어 stddev=0 정책을 드러낸다(mean 수직선을 경고색으로 표시). diagnostics는
  mean·stddev·samples 3개만 표시한다. 2D 공간 scatter인 `canvas-demo:random-distribution-sampling`과
  분리한 scalar 1D 분포 단일 개념 예제로, random domain의 첫 pixi 예제이자 `random/normal`·`random/createRng`
  leaf의 첫 연결이다. `@cp949/vectra/random` namespace는 `vector-steering-field`에서 이미 sandbox에
  등록돼 allowlist 변경이 없다.

- reference: `paper.js`, `d3-shape`
- 작업 흐름: arc to cubic (center form 원호 → ≤90° cubic Bezier 목록 근사)
- 관련 함수: `curve/arcToCubicInto`, `curve/arcSampleInto`, `angle/radToDeg`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:arc-to-cubic` (`apps/pixi-demo/src/examples/arc-to-cubic`)
- 설명: 화면 중앙 고정 원호의 끝 handle을 center 둘레로 drag하면 sweep이 커지고, `arcToCubicInto`가
  호를 `maxAngle`(기본 π/2) 이하 segment로 나눠 각 segment를 cubic Bezier(p0~p3)로 근사한다.
  sweep이 90°를 넘을 때마다 cubic segment가 하나씩 늘어, 원호는 cubic 1개로 정확히 표현되지 않으므로
  ≤90° 조각으로 나눠 근사한다는 점을 junction dot 증가로 드러낸다. `arcSampleInto`로 만든 dense
  polyline(true arc)을 근사 곡선 아래 faint하게 깔아 근사가 원호와 거의 일치함을 보인다(같은 관계의
  정확도 표현이지 두 번째 관계가 아니다). segment마다 control handle 선과 control point(p1/p2)를
  그려 근사 구조를 설명한다. diagnostics는 sweep°·segment count·per-segment°(≤90 유지) 3개만
  표시한다. 제어점 수동 편집인 `cubic-bezier-inspector`, endpoint↔center form 변환인
  `canvas-demo:svg-arc-parameterization`과 분리한 arc→cubic 근사 단일 개념 예제로,
  `curve/arcToCubic`/`arcToCubicInto` leaf의 첫 연결이다. ticker render hot path라 allocating
  `arcToCubic` 대신 `arcToCubicInto` out-array를 재사용한다.

- reference: `phaser`, `pixijs`
- 작업 흐름: rect expand to include point (point 포함 최소 확장 box)
- 관련 함수: `rect/expandToIncludePointInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-expand-to-include-point` (`apps/pixi-demo/src/examples/rect-expand-to-include-point`)
- 설명: 화면 중앙 고정 base rect를 draggable probe point가 포함되도록 최소 확장한다.
  `expandToIncludePointInto`가 `min(x, px)`/`max(right, px)` 산식으로 point가 넘어선 변(들)만
  키워(비대칭) 결과 box를 만들고, 이동한 변에만 delta 화살표가 생겨 사방 동시 이동하는
  `rect-uniform-inflate`와 대비된다. probe가 base 안이면 결과 = base라 화살표가 사라지고
  inside=yes로 표시돼 expand-only(절대 줄지 않음, empty 분기 없음) 정책을 드러낸다. diagnostics는
  inside·width·height 3개만 표시한다. 대칭 inflate인 `rect-uniform-inflate`, point set tight box
  재계산인 `canvas-demo:selection-bounds`(`bounds/fromPointsInto`)와 분리한 비대칭 point 확장 단일
  개념 예제로, `rect/expandToIncludePointInto` leaf의 첫 연결이다. companion(allocating
  `expandToIncludePoint`)이 없어 `*Into`를 그대로 쓰고 ticker render에서 out-buffer 1개를 재사용한다.

- reference: `phaser`, `pixijs`
- 작업 흐름: rect uniform inflate (단일 amount 사방 균일 inflate/deflate margin box)
- 관련 함수: `rect/inflateInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rect-uniform-inflate` (`apps/pixi-demo/src/examples/rect-uniform-inflate`)
- 설명: 화면 중앙 고정 base rect의 오른쪽 트랙에서 inflate handle 1개를 drag하면 단일 amount로
  사방을 동일하게 넓히거나(margin) 좁힌(deflate) box가 갱신된다. `inflateInto`는 `x-=a`, `y-=a`,
  `w+=2a`, `h+=2a`로 모든 변을 같은 amount만큼 이동하며, 네 변 중점의 delta 화살표로 균일 이동을
  강조한다. `inflateInto`는 결과 width/height를 clamp하지 않으므로 deflate가 `amount<-min(w,h)/2`를
  넘으면 음수 크기로 붕괴(inversion)해 no-clamp degenerate 정책을 드러낸다(그리기는 정규화 extent를
  경고색으로, diagnostics는 음수 원본값을 그대로 표시). diagnostics는 amount·width·height 3개만
  표시한다. contain/cover/crop fit과 region algebra인 `canvas-demo:rect-layout-fitting`,
  source→frame contain fit인 `content-fit-workbench`와 분리한 uniform inflate 단일 개념 예제로,
  rect domain의 첫 pixi 예제이자 `rect/inflateInto` leaf의 첫 연결이다. companion(`rect/inflate`)이
  없어 `inflateInto`를 그대로 쓰고 ticker render에서 out-buffer 1개를 재사용한다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: vector orthogonal check (두 벡터 직교 90° 판정)
- 관련 함수: `vec/isOrthogonal`, `vec/normalize`, `vec/angleBetween`, `vec/dot`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-orthogonal-check` (`apps/pixi-demo/src/examples/vec-orthogonal-check`)
- 설명: 공통 고정 원점에서 뻗은 두 벡터의 끝점 handle A·B를 drag하면 두 벡터가 서로 직교(90°)
  하는지 판정하고, 직교일 때만 원점 코너에 직각 marker를 그려 강조한다. `isOrthogonal`의 epsilon은
  dot product 절대값 기준이라 입력 크기에 비례하므로 `normalize`로 단위 벡터를 만든 뒤
  `sin(±4°)`을 epsilon으로 넘겨 "90°에서 ±tol 이내"라는 각도 허용오차로 만든다(기본 epsilon=0은
  float drag에서 정확히 dot=0이 되지 않아 절대 직교로 잡히지 않는 eps=0 함정 회피). handle을 원점에
  겹치면 zero vector라 `isOrthogonal`이 false, `normalize`가 (0,0), `angleBetween`이 0을 반환해
  NaN 없이 not orthogonal로 그린다. diagnostics는 dot(unit)·angle(deg)·orthogonal 3개만 표시한다.
  projection foot인 `vector-projection-reflection-lab`, turn test인 `orientation-predicate`와 분리한
  직교 판정 단일 개념 예제로, `vec/isOrthogonal` leaf의 첫 연결이다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: ellipse from rect (bounding box → 내접 ellipse 구성)
- 관련 함수: `ellipse/fromRect`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ellipse-from-rect` (`apps/pixi-demo/src/examples/ellipse-from-rect`)
- 설명: 박스 두 코너 handle을 drag하면 그 박스에 내접하는 axis-aligned ellipse가 갱신된다.
  `fromRect`는 center=박스 중심, radiusX=width/2, radiusY=height/2로 구성하고 네 변 중점에서 박스에
  접한다(Canvas/SVG "ellipse in box" 모델). `fromRect`는 rect를 정규화하지 않으므로 코너를 반대편
  너머로 끌어 width 또는 height가 0 이하가 되면 해당 축 반지름이 0으로 접혀(ellipse가 선으로 붕괴)
  부호 민감 degenerate 정책을 드러낸다. diagnostics는 center·radiusX·radiusY 3개만 표시한다.
  반지름 핸들 편집인 `ellipse-inspector`, 초점 거리합 구성인 `ellipse-foci-sum`과 분리한 bounding
  box 구성 단일 개념 예제로, ellipse fromRect leaf의 첫 연결이다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: triangle side classification (변 길이 같음 기반 equilateral/isosceles/scalene 분류)
- 관련 함수: `triangle/triangleFrom`, `triangle/isEquilateral`, `triangle/isIsosceles`, `vec/distance`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-side-classification` (`apps/pixi-demo/src/examples/triangle-side-classification`)
- 설명: 꼭짓점 3개를 drag하면 세 변 길이를 비교해 equilateral / isosceles / scalene을 분류하고,
  같은 길이로 판정된 변을 같은 색과 합동 tick으로 강조한다. `isEquilateral`/`isIsosceles`의 기본
  epsilon은 0(정확한 같음)이라 float drag에서는 절대 같아지지 않으므로 가시적 절대 tolerance
  (eps=14px)를 명시적으로 넘기고, equilateral ⊂ isosceles 관계에 맞춰 equilateral을 먼저 판정한다.
  diagnostics는 세 변 길이(|AB|·|BC|·|CA|) 3개만 표시한다. 각 종류(acute/right/obtuse) 분류인
  `triangle-barycentric-lab`, 변→각 solver인 `triangle-solver-excircles-lab`과 분리한 변 길이 같음
  단일 개념 예제로, triangle isEquilateral/isIsosceles/triangleFrom leaf의 첫 연결이다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: inverse lerp track (구간 내 값 정규화 역보간)
- 관련 함수: `interpolation/inverseLerp`, `interpolation/inverseLerpClamped`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:inverse-lerp-track` (`apps/pixi-demo/src/examples/inverse-lerp-track`)
- 설명: 시작 bound A·끝 bound B가 정한 구간 [A, B] 위에서 probe knob을 drag하면 그 위치 값이
  구간에서 차지하는 비율 t를 0↔1로 읽는다(역보간). probe를 bound 바깥으로 끌면 raw t가 0 미만/1
  초과가 되어 extrapolation을 드러내고, 같은 순간 clamped t는 가까운 bound에 고정된 marker로
  표시돼 `inverseLerp`(no-clamp)와 `inverseLerpClamped`(clamp) 두 정책을 한 장면에서 대비한다.
  inverseLerp는 ordered range를 요구하므로 bound drag를 `A.x < B.x`로 clamp한다. diagnostics는
  t raw·t clamp·value 3개만 표시한다. 정방향 lerp/remap/midpoint 비교나 2D projection을 넣지 않는
  scalar 정규화 단일 개념 예제로, `vec-lerp-points`가 보인 "t → 점"의 역방향("값 → t")이며
  interpolation inverseLerp/inverseLerpClamped leaf의 첫 연결이다.

- reference: `pixijs`, `paper.js`
- 작업 흐름: matrix mirror reflection (pivot 통과 축 반사)
- 관련 함수: `matrix/reflectionInto`, `matrix/translationMatrixInto`, `matrix/multiplyInto`, `matrix/transformPointInto`, `matrix/determinant`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:matrix-mirror-reflection` (`apps/pixi-demo/src/examples/matrix-mirror-reflection`)
- 설명: 화면 중앙 고정 pivot을 통과하는 거울 축 handle을 pivot 둘레로 drag하면 고정 source
  비대칭 도형이 그 축에 대해 반사된 거울상으로 갱신된다. `reflection`은 원점 통과 축 반사라
  `T(+pivot) ∘ reflection ∘ T(-pivot)`로 pivot 통과 축으로 보정한다. 반사는 orientation을
  뒤집으므로 `determinant`가 -1이고 source ccw → reflected cw로 winding이 뒤집힌다. diagnostics는
  axis θ·det·winding 3개만 표시한다. 회전/스케일/skew/fit 비교를 넣지 않는 반사 단일 affine
  primitive 예제로, `matrix-shear-transform`/`content-fit-workbench`이 의도적으로 제외한
  `matrix/reflection`과 `matrix/determinant` leaf의 첫 연결이다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: vector quadrant (원점 기준 축 사분면 분류)
- 관련 함수: `vec/quadrant`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-quadrant` (`apps/pixi-demo/src/examples/vec-quadrant`)
- 설명: 화면 중앙 고정 원점 기준으로 probe를 drag하면 원점→probe 벡터가 몇 사분면(Ⅰ~Ⅳ)에
  있는지 `quadrant` 번호로 분류하고 해당 영역만 밝게 강조한다. probe를 축 위로 끌면 번호가 0이
  되어 어느 영역도 강조하지 않고 축을 강조해 "축 위" degenerate 정책을 드러낸다. diagnostics는
  quadrant·sign x·sign y 3개만 표시한다. `orientation-predicate`의 line-relative turn test와 달리
  axis-relative 4분류 단일 개념 예제로, vec quadrant leaf의 첫 연결이다. y-up 수학 관례에 맞추려
  벡터 생성 시 화면 y를 뒤집어 표시 사분면과 반환 번호를 일치시킨다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: vector point lerp (두 점 사이 직선 보간)
- 관련 함수: `vec/lerp`, `vec/distance`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-lerp-points` (`apps/pixi-demo/src/examples/vec-lerp-points`)
- 설명: 끝점 A·B 두 개를 drag하면 ticker가 t를 0↔1로 왕복시켜 보간점이 직선 A→B를 일정 속도로
  따라간다. 등간격 t 샘플 dot이 직선 위 등거리로 놓여 "일정 t 간격 = 일정 거리 간격"임을 보이고,
  끝점 바깥 옅은 ghost 점으로 lerp의 no-clamp/extrapolation 정책을 드러낸다. diagnostics는
  t·보간점(x, y)·A→보간점 거리 3개만 표시한다. slerp 호(`vec-slerp-direction`)·회전
  (`vec-rotate-around`)·등속 추적(`cursor-chase`)·양선형(`bilinear-warp-grid`) 비교를 넣지 않는
  직선 보간 단일 개념 예제로, vec lerp leaf의 첫 연결이다. `vec-slerp-direction`이 의도적으로
  제외한 직선 보간을 별도 예제로 채운다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: orientation predicate (방향 직선 A→B 기준 점 C의 ccw/cw/on turn test)
- 관련 함수: `vec/orientation`, `vec/isCollinear`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:orientation-predicate` (`apps/pixi-demo/src/examples/orientation-predicate`)
- 설명: probe C를 drag하면 직선 A→B 기준 `orientation` 부호로 ccw(파랑)/cw(분홍)/on(노랑)을
  분류하고, 같은 부호로 삼각형 ABC를 칠해 "orientation 값 = 삼각형 ABC 부호 면적의 2배"임을
  한 장면에 묶는다. A·B handle을 끌면 판정 기준 직선이 바뀐다. `isCollinear`의 epsilon은 cross
  product(px²) tolerance라 직선 근처에서 on으로 잡힌다. diagnostics는 orient·turn·collinear
  3개만 표시한다. projection foot나 두 직선 교차, 무한선 도메인 비교를 넣지 않는 turn test 단일
  개념 예제로, vec orientation/isCollinear leaf의 첫 연결이다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: polar coordinate plot (극좌표 (r, theta) → fromPolar 점 작도)
- 관련 함수: `vec/fromPolar`, `vec/toPolar`, `angle/radToDeg`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:polar-coordinate-plot` (`apps/pixi-demo/src/examples/polar-coordinate-plot`)
- 설명: 중앙 고정 원점에서 handle 1개를 drag하면 center→handle 벡터를 `toPolar`로 (r, theta)로
  읽고, 같은 theta 위에서 반지름을 0.25→1.0으로 키워 가며 `fromPolar`로 stepped 작도점을 찍는다.
  k=1 작도점은 handle과 정확히 겹쳐 toPolar↔fromPolar 왕복 일치를 보여준다. diagnostics는 r,
  theta(deg), 작도점(x, y) 3개만 표시한다. 각도 snap(`rotate-handle`/`angle-unit-compass`)이나
  orbit 회전(`vec-rotate-around`)을 넣지 않는 극좌표 작도 단일 개념 예제로, vec fromPolar leaf의
  첫 연결이다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: vector direction slerp (두 방향 사이 구면 보간 호)
- 관련 함수: `vec/slerp`, `vec/normalize`, `vec/angleBetween`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-slerp-direction` (`apps/pixi-demo/src/examples/vec-slerp-direction`)
- 설명: 고정 center 기준 방향 handle A·B 두 개를 drag하면 ticker가 t를 0↔1로 왕복시켜 slerp로
  보간된 단위 방향이 두 방향 사이 최단 호를 일정 각속도로 따라간다. 등간격 t dot으로 호 위 등각
  간격을 보여주고, diagnostics는 t·omega(호 각)·heading 3개만 표시한다. lerp 직선 보간 비교나
  `vec-rotate-around`의 회전을 넣지 않는 구면 보간 단일 개념 예제로, vec slerp leaf의 첫 연결이다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: segment intersection point (두 유한 선분 단일 교차)
- 관련 함수: `segment/singleIntersection`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-intersection-point` (`apps/pixi-demo/src/examples/segment-intersection-point`)
- 설명: 선분 A·B의 끝점 4개를 drag해 두 선분이 양쪽 범위 안에서 실제로 겹칠 때만 노란 교점 marker가
  뜬다. 한쪽 선분을 연장해야만 만나는 위치로 끌면 marker가 사라져 "무한 직선이 아니라 유한 선분"임을
  드러낸다. diagnostics는 status(cross/none)·교점 x·y 3개만 표시한다. collinear/overlap 구간이나
  무한선(`infinite-line-diagnostics-lab`)·ray(`ray-intersection-lab`) 비교를 넣지 않는 유한 segment
  교차 단일 개념 예제로, segment domain 교차 leaf의 첫 연결이다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: vector rotate around (pivot 기준 점 회전 orbit)
- 관련 함수: `vec/rotateAround`, `vec/distance`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vec-rotate-around` (`apps/pixi-demo/src/examples/vec-rotate-around`)
- 설명: 화면 중앙 고정 pivot 기준으로 draggable source 점을 ticker가 일정 각속도로 회전해, 회전된
  점이 pivot 중심 orbit(반지름 = pivot↔source 거리) 위를 따라간다. source를 끌면 orbit 반지름이
  바뀐다. diagnostics는 angle·radius·rotated 좌표 3개만 표시한다. 원점 회전(`rotate`) 비교를 넣지
  않는 pivot 회전 단일 개념 예제로, matrix 회전을 쓰는 `rotate-handle`과 달리 vec 회전 primitive를
  직접 호출하는 첫 연결이다.

- reference: `p5.js`
- 작업 흐름: distance metrics (Euclidean / Manhattan / Chebyshev 등거리 윤곽 비교)
- 관련 함수: `vec/distance`, `vec/distanceSq`, `vec/manhattanDistance`, `vec/chebyshevDistance`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:distance-metrics` (`apps/pixi-demo/src/examples/distance-metrics`)
- 설명: 중앙 고정 anchor에서 draggable probe까지의 거리를 세 척도로 계산해 probe를 지나는 등거리
  윤곽(Euclidean=원, Manhattan=마름모, Chebyshev=정사각형)을 그린다. diagnostics는 euclidean(보조로
  distanceSq)·manhattan·chebyshev 3개만 표시한다. 세 윤곽은 같은 probe를 지나는 한 관계(거리 척도)의
  표현으로, length 계열·다중 anchor·Minkowski p 비교를 추가하지 않는 거리 척도 단일 개념 예제다.
  `cursor-chase`(positional move-toward)와 달리 vec 거리 척도 leaf의 첫 연결이다.

- reference: `pixijs`, `paper.js`
- 작업 흐름: matrix shear transform (pivot 행 기준 수평 skewX)
- 관련 함수: `matrix/skewXInto`, `matrix/translationMatrixInto`, `matrix/multiplyInto`, `matrix/transformPointInto`, `matrix/createMatrix`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:matrix-shear-transform` (`apps/pixi-demo/src/examples/matrix-shear-transform`)
- 설명: 상단 edge handle을 좌우로 drag해 base 행을 pivot 축으로 사각형을 수평 shear해 평행사변형을 만든다. `skewXInto`가 `c=tan(θ)`만 채운 shear matrix를 만들고, `-c·pivotY` 보정 translation과 합성해 base 고정 shear를 적용한다. diagnostics는 skewX angle, matrix c component, 상단 변위만 표시한다. 회전/스케일/fit을 보여주는 기존 matrix 예제(`rotate-handle`, `polygon-transform-orientation-lab`, `content-fit-workbench`)와 분리한 shear 단일 affine primitive 예제로, `content-fit-workbench`가 의도적으로 제외한 skew leaf의 첫 연결이다.

- reference: `phaser`, `pixijs`
- 작업 흐름: rotate handle (anchor pivot rotation + step snap)
- 관련 함수: `editor-geometry/rotateHandlesInto`, `editor-geometry/anchorPoint`, `editor-geometry/constrainRotate`, `matrix/rotationAroundPointInto`, `matrix/transformPointInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:rotate-handle` (`apps/pixi-demo/src/examples/rotate-handle`)
- 설명: box 위 rotate handle 1개를 drag해 center anchor를 pivot으로 box를 회전한다. raw 각도가 15° 격자에 tolerance(±6°) 이내로 가까우면 그 격자 각도로 snap되고, snap 발동 시 handle 색이 바뀐다. diagnostics는 raw 각도, 적용 각도, snap on/off만 표시한다. 기존 `transform-handles`(rotate handle 명시적 제외)·`editor-snap-guides-lab`(point snap)과 분리한 회전 단일 작업 흐름 예제로, editor-geometry 회전 leaf의 첫 연결이다.

- reference: `phaser`, `pixijs`
- 작업 흐름: content fit workbench (source rect → target frame contain/cover fit 비교)
- 관련 함수: `matrix/fitRect`, `matrix/transformPointInto`, `matrix/transformBounds`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:content-fit-workbench` (`apps/pixi-demo/src/examples/content-fit-workbench`)
- 설명: 대상 프레임의 corner handle 2개를 drag해 고정 source 도형을 contain/cover 두 방식으로 맞춘다. `fitRect`가 계산한 transform을 정점마다 적용해 contain 쪽 letterbox AABB를 표시하고, cover 쪽은 `fitOutside` 결과를 frame mask로 crop한다. 기존 contain 단독 예제는 cover와 비교할 때 실제 선택 기준이 더 분명해져 `content-fit-workbench`로 통합했다.

- reference: `p5.js`, `paper.js`
- 작업 흐름: bilinear warp grid (unit square → quad bilinear mapping)
- 관련 함수: `interpolation/bilerpPoint`, `interpolation/bilerpPointInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:bilinear-warp-grid` (`apps/pixi-demo/src/examples/bilinear-warp-grid`)
- 설명: corner handle 4개를 drag해 만든 quad 안으로 unit grid `(tx, ty)`가 bilinear 보간으로 매핑되는 격자선을 그리고, 애니메이션 probe가 `(tx, ty)`를 추적한다. diagnostics는 tx, ty, probe 좌표만 표시한다. bilinear 좌표 매핑 단일 개념 예제로, lerp/easing/sample 등 다른 interpolation 흐름과 분리한다.

- reference: `p5.js`, `phaser`
- 작업 흐름: cursor chase (constant-speed follow + arrival snap)
- 관련 함수: `interpolation/moveTowardPointInto`, `vec/distance`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:cursor-chase` (`apps/pixi-demo/src/examples/cursor-chase`)
- 설명: 추적 마커가 매 프레임 cursor를 향해 고정 최대 거리만큼 이동하고, 남은 거리가 그 최대 거리 이하이면 cursor에 정확히 붙어 overshoot 없이 멈춘다. diagnostics는 distance, max step, arrived만 표시한다. `angle-heading-turn`(scalar 각도 회전)·`vector-steering-field`(flow field)와 구분되는 positional move-toward 예제.

- 작업 흐름: segment angle builder
- 관련 함수: `segment/fromAngle`, `segment/fromAngleInto`, `segment/centerOn`, `segment/centerOnInto`, `segment/midpoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-angle-builder` (`apps/pixi-demo/src/examples/segment-angle-builder`)
- 설명: 방향 handle을 drag해 시작점, angle, length로 source segment를 만들고 midpoint anchor에 정렬한 결과를 갱신한다. diagnostics는 angle, length, midpoint error만 표시해 기존 `segment-offset-normal-lab`의 projection/offset/rotation 흐름과 분리한다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: infinite line diagnostics lab
- 관련 함수: `infinite-line/fromSegment`, `infinite-line/fromSegmentInto`, `infinite-line/projectPoint`, `infinite-line/projectPointInto`, `infinite-line/projectionT`, `infinite-line/signedDistanceToPoint`, `infinite-line/side`, `infinite-line/containsPoint`, `infinite-line/singleIntersection`, `infinite-line/singleIntersectionInto`, `infinite-line/reverse`, `infinite-line/reverseInto`, `infinite-line/direction`, `infinite-line/directionInto`, `infinite-line/origin`, `infinite-line/originInto`, `infinite-line/copyInto`, `infinite-line/createInfiniteLine`, `infinite-line/isParallel`, `infinite-line/isCollinear`, `infinite-line/isDegenerate`, `infinite-line/distanceToPointSq`, `infinite-line/pointAtTInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:infinite-line-diagnostics-lab` (`apps/pixi-demo/src/examples/infinite-line-diagnostics-lab`)
- 설명: 두 무한선의 origin/direction handle과 probe point를 drag해 line A 기준 projection foot, signed distance, side, 단일 교점과 parallel/collinear/degenerate 상태를 진단한다. 기존 정적 `canvas-demo:infinite-line-projection`을 대체하지 않고 interactive line editing diagnostics workflow를 추가한다.

- reference: `paper.js`
- 작업 흐름: Bezier intersection workbench
- 관련 함수: `curve/quadraticLineIntersectionsInto`, `curve/cubicLineIntersectionsInto`, `curve/quadraticQuadraticIntersectionsInto`, `curve/quadraticCubicIntersectionsInto`, `curve/cubicCubicIntersectionsInto`, `curve/cubicSelfIntersectionsInto`, `curve/cubicSample`, `curve/cubicSampleInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:bezier-intersection-workbench` (`apps/pixi-demo/src/examples/bezier-intersection-workbench`)
- 설명: quadratic/cubic Bezier control point와 기준 line handle을 drag해 line hit, curve-pair hit, cubic self-intersection hit의 위치와 parameter를 비교한다. 기존 quadratic/cubic analysis lab의 closest/split/length 흐름과 분리해 intersection debugging workflow를 보여준다.

- reference: `paper.js`
- 작업 흐름: quadratic curve analysis lab
- 관련 함수: `curve/quadraticClosestPoint`, `curve/quadraticClosestPointInto`, `curve/quadraticBounds`, `curve/quadraticBoundsInto`, `curve/quadraticSplit`, `curve/quadraticSplitInto`, `curve/quadraticPart`, `curve/quadraticPartInto`, `curve/quadraticFlatten`, `curve/quadraticFlattenInto`, `curve/quadraticSample`, `curve/quadraticSampleInto`, `curve/quadraticLength`, `curve/quadraticLengthAtT`, `curve/quadraticTAtLength`, `curve/quadraticCurvatureAt`, `curve/quadraticDerivativeAtInto`, `curve/quadraticExtrema`, `curve/quadraticElevateToCubic`, `curve/quadraticElevateToCubicInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:quadratic-curve-analysis-lab` (`apps/pixi-demo/src/examples/quadratic-curve-analysis-lab`)
- 설명: quadratic Bezier 제어점, probe 점, split handle을 drag해 closest point, tight bounds, split/part curve, adaptive flatten/sample marker, length diagnostics, cubic degree elevation preview를 비교한다. 기존 `bezier-control-inspector`의 hull/tangent/normal 중심 흐름과 분리한 quadratic analysis 예제다.

- reference: `d3-shape`, `paper.js`
- 작업 흐름: spline path comparison lab
- 관련 함수: `curve/catmullRomPath`, `curve/catmullRomPointAtT`, `curve/cardinalPath`, `curve/cardinalPointAtT`, `curve/bsplinePath`, `curve/bsplinePointAtT`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:spline-path-comparison-lab` (`apps/pixi-demo/src/examples/spline-path-comparison-lab`)
- 설명: control point와 closed toggle을 drag해 Catmull-Rom, Cardinal, B-Spline의 cubic path 변환 결과와 animated probe marker를 비교한다. 기존 정적 `point-list-curve-comparison`의 polyline sampling 비교와 분리해 path command 생성 workflow를 보여준다.

- reference: `pixijs`, `paper.js`
- 작업 흐름: segment contact gates lab
- 관련 함수: `intersects/intersectsCircleSegment`, `intersects/intersectsBoundsSegment`, `intersects/intersectsTriangleSegment`, `intersects/singleIntersectionSegmentCircle`, `intersects/singleIntersectionSegmentBounds`, `intersects/singleIntersectionSegmentTriangle`, `intersects/intersectsCircleBounds`, `intersects/intersectsCircleTriangle`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:segment-contact-gates-lab` (`apps/pixi-demo/src/examples/segment-contact-gates-lab`)
- 설명: path segment와 circle/bounds/triangle gate를 drag해 boolean 교차 판정과 단일 접점 marker를 비교한다. segment endpoint의 sensor circle도 gate와 겹침 여부를 표시해 moving object contact gate 흐름을 보여준다.

- reference: `paper.js`
- 작업 흐름: cubic curve analysis lab
- 관련 함수: `curve/cubicClosestPoint`, `curve/cubicClosestPointInto`, `curve/cubicSplit`, `curve/cubicSplitInto`, `curve/cubicPart`, `curve/cubicPartInto`, `curve/cubicFlatten`, `curve/cubicFlattenInto`, `curve/cubicLength`, `curve/cubicLengthAtT`, `curve/cubicTAtLength`, `curve/cubicCurvatureAt`, `curve/cubicDerivativeAtInto`, `curve/cubicSecondDerivativeAtInto`, `curve/cubicExtrema`, `curve/cubicInflections`, `curve/cubicClassify`, `curve/cubicIsFlatEnough`, `curve/cubicIsLinear`, `curve/cubicIsStraight`, `curve/cubicIsSimple`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:cubic-curve-analysis-lab` (`apps/pixi-demo/src/examples/cubic-curve-analysis-lab`)
- 설명: cubic Bezier 제어점, probe 점, split handle을 drag해 closest point, split/part curve, adaptive flatten polyline, length/classification diagnostics를 비교한다. 기존 `cubic-bezier-inspector`의 hull/tangent/bounds 중심 흐름과 분리한 curve analysis 예제다.

- reference: `p5.js`, `pixijs`
- 작업 흐름: vector projection and reflection lab
- 관련 함수: `vec/normalize`, `vec/perpendicular`, `vec/projectOn`, `vec/sub`, `vec/reflectAcrossNormal`, `vec/angleBetween`, `vec/directedAngle`, `vec/dot`, `vec/cross`, `vec/toPolar`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:vector-projection-reflection-lab` (`apps/pixi-demo/src/examples/vector-projection-reflection-lab`)
- 설명: incident vector 끝점과 surface normal handle을 drag해 tangent projection, normal rejection, reflected vector, angle/dot/cross/polar 진단을 실시간 비교한다. `projectOn`과 `reflectAcrossNormal`의 unit direction 전제를 normal handle 정규화 흐름으로 함께 보여준다.

- reference: `paper.js`, `d3-shape`
- 작업 흐름: ellipse parametric geometry (point, tangent, bounds)
- 관련 함수: `ellipse/pointAtAngleInto`, `ellipse/tangentAtInto`, `ellipse/normalAtInto`, `ellipse/closestPointInto`, `ellipse/containsPoint`, `ellipse/fociInto`, `ellipse/boundsInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ellipse-inspector` (`apps/pixi-demo/src/examples/ellipse-inspector`)
- 설명: axis-aligned ellipse의 반지름 핸들과 probe 점을 드래그해 경계 marker, tangent/normal, closest point, focus, bounds를 확인한다. 기존 Planned의 정적 다중 ellipse 후보는 실제 구현된 interactive ellipse 예제로 흡수했다.

- 작업 흐름: ellipse foci distance-sum construction
- 관련 함수: `ellipse/fromFoci`, `ellipse/pointAtTurn`, `ellipse/distanceToPoint`, `ellipse/eccentricity`, `ellipse/containsPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ellipse-foci-sum` (`apps/pixi-demo/src/examples/ellipse-foci-sum`)
- 설명: 수평 guide 위 두 초점과 경계 handle을 drag해 초점까지의 거리합으로 생성되는 axis-aligned ellipse를 갱신한다. diagnostics는 거리합, 경계 오차, 이심률만 표시한다.

- reference: `paper.js`, `pixijs`
- 작업 흐름: triangle barycentric point classification lab
- 관련 함수: `triangle/classifyPoint`, `triangle/barycentric`, `triangle/altitudeInto`, `triangle/orthocenterInto`, `triangle/bounds`, `triangle/area`, `triangle/perimeter`, `triangle/signedArea`, `triangle/isClockwise`, `triangle/isCounterClockwise`, `triangle/isDegenerate`, `triangle/isAcute`, `triangle/isRight`, `triangle/isObtuse`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-barycentric-lab` (`apps/pixi-demo/src/examples/triangle-barycentric-lab`)
- 설명: 삼각형 꼭짓점과 probe 점을 drag해 inside/on-edge/outside 분류, barycentric weight, altitude 3개, orthocenter, bounds, orientation/type 진단을 실시간 비교한다.

- reference: `paper.js`, `maker.js`
- 작업 흐름: triangle solver and excircle construction lab
- 관련 함수: `triangle/solveSss`, `triangle/solveSssInto`, `triangle/solveAsa`, `triangle/solveAsaInto`, `triangle/excenters`, `triangle/excentersInto`, `triangle/excircles`, `triangle/excirclesInto`, `triangle/interiorAngles`, `triangle/interiorAnglesInto`, `triangle/sideAt`, `triangle/sideAtInto`, `triangle/medialTriangle`, `triangle/medialTriangleInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-solver-excircles-lab` (`apps/pixi-demo/src/examples/triangle-solver-excircles-lab`)
- 설명: 원본 삼각형 꼭짓점을 drag해 변 길이 기반 SSS 각도 계산과 A/B 각도+AB 변 기반 ASA 재구성 preview를 비교한다. 원본 삼각형의 방심/방접원과 medial triangle을 함께 표시해 solver와 파생 triangle construction 흐름을 분리해서 보여준다.

- reference: `paper.js`, `phaser`, `pixijs`
- 작업 흐름: polygon transform and orientation lab
- 관련 함수: `polygon/translatePoints`, `polygon/transformPoints`, `polygon/reversePoints`, `polygon/signedArea`, `polygon/edgeAt`, `matrix/rotationAroundPoint`, `matrix/scaleAroundPoint`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:polygon-transform-orientation-lab` (`apps/pixi-demo/src/examples/polygon-transform-orientation-lab`)
- 설명: source polygon 꼭짓점과 transform 핸들을 드래그해 오른쪽 복제 polygon의 이동, pivot 기준 회전/스케일, mirror 후 reverse winding preview를 비교한다. edge 방향 marker와 signed area 진단으로 point order가 transform과 reverse에서 어떻게 바뀌는지 확인한다.

- 예제: `shape-intersection-matrix` (`canvas-demo`)
  - 관련 domain: `intersects`
  - 사용 함수: `intersectsCircleCircle`, `intersectsCircleRect`, `intersectsCircleSegment`, `intersectsRectRect`
  - 완료: 2026-05-23

- reference: `p5.js`, `paper.js`
- 작업 흐름: random distribution sampling (rect / circle / polygon / boundary)
- 관련 함수: `random/createRng`, `random/pointInRect`, `random/pointInCircle`, `random/pointOnCircle`, `random/pointInPolygon`, `random/direction`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:random-distribution-sampling` (`apps/canvas-demo/src/examples/random-distribution-sampling`)
- 설명: seeded RNG로 동일 결과를 재현하면서 4개 패널에 rect 내부 scatter, circle 내부 scatter, circle 경계 샘플, polygon 내부 scatter를 정적으로 그린다. random domain 전용 첫 예제.

- reference: `maker.js`, `paper.js`
- 작업 흐름: circle tangent construction (외부 점 접선 + 두 원 공통접선)
- 관련 함수: `circle/tangentPointsFromExternalInto`, `circle/tangentAnglesInto`, `circle/pointAtAngleInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:circle-tangent-construction` (`apps/pixi-demo/src/examples/circle-tangent-construction`)
- 설명: 좌 패널은 원 1개와 드래그 가능한 외부 점에서 접선 2개와 접점을 작도하고, 점을 원 안으로 끌면 접선이 사라진다. 우 패널은 드래그 가능한 두 원의 outer/inner 공통접선을 작도하고, 두 원이 겹치면 inner가, 한 원이 다른 원을 포함하면 outer가 사라진다. circle domain 전용 첫 예제(orbit-segment는 circle을 곁다리로만 사용)로 degenerate에서 접선 개수가 줄어드는 정책을 한 장면에 시연.

- reference: `svg-pathdata`, `gl-matrix` (flat coord interop)
- 작업 흐름: external coordinate interop (SVG points / Float32Array / flat number[] ↔ vectra input)
- 관련 함수: `adapter/parseSvgPointsInto`, `adapter/pointsToString`, `adapter/fromFloat32ArrayInto`, `adapter/toFloat32Array`, `adapter/transformFlatCoords`, `adapter/decodeFlatCoordsInto`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:adapter-interop` (`apps/canvas-demo/src/examples/adapter-interop`)
- 설명: 같은 polygon을 SVG `points` 문자열과 Float32Array 두 외부 표현에서 읽어 동일 도형으로 그리고, pointsToString round-trip 무손실을 라벨로 확인한다. flat coord에 rotate+scale matrix를 적용한 변환 결과를 원본 위에 겹쳐 adapter와 matrix 함수가 함께 쓰이는 catalog 폭을 한 장면에 시연. adapter domain 전용 첫 예제.

- reference: `p5.js`
- 작업 흐름: heading turn with shortest-angle interpolation
- 관련 함수: `angle/shortestLerpAngle`, `angle/lerpAngle`, `angle/moveTowardAngle`, `angle/fromVector`, `angle/toUnitVectorInto`, `angle/angleDelta`, `angle/directedAngleDelta`, `angle/turnDirection`, `angle/wrapRadians`, `angle/radToDeg`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:angle-heading-turn` (`apps/pixi-demo/src/examples/angle-heading-turn`)
- 설명: 같은 시작 각도에서 출발한 세 화살표가 pointer heading을 추적한다. shortestLerpAngle(최단 호)·lerpAngle(naive 선형)·moveTowardAngle(고정 회전율)을 동시에 돌려 ±π wrap 경계에서 naive가 먼 길로 한 바퀴 도는 동작을 보여준다. angleDelta/directedAngleDelta/turnDirection 라벨로 남은 호·raw 델타·회전 방향을 표시한다. angle domain 전용 첫 예제(vector-steering-field와 달리 scalar angle 보간 중심).

- reference: `p5.js`
- 작업 흐름: angle unit compass and sector membership
- 관련 함수: `angle/fromVector`, `angle/radToDeg`, `angle/radToTurn`, `angle/degToRad`, `angle/degToTurn`, `angle/turnToRad`, `angle/turnToDeg`, `angle/wrapRadians`, `angle/wrapRadiansPositive`, `angle/wrapDegrees`, `angle/wrapDegreesPositive`, `angle/isAngleBetween`, `angle/nearAngle`, `angle/sinCos`, `angle/sinCosInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:angle-unit-compass` (`apps/pixi-demo/src/examples/angle-unit-compass`)
- 설명: compass pointer와 sector boundary handle 2개를 drag해 heading의 degree/radian/turn 표현, signed/positive wrap, sector 포함 여부, 45도 snap target 근접 여부, sin/cos projection을 한 화면에서 비교한다.

- reference: `phaser`, `pixijs`
- 작업 흐름: rect layout fitting (contain / cover / square crop + region algebra)
- 관련 함수: `rect/fitInside`, `rect/fitOutside`, `rect/toSquare`, `rect/intersectionInto`, `rect/unionInto`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:rect-layout-fitting` (`apps/canvas-demo/src/examples/rect-layout-fitting`)
- 설명: 같은 16:9 content를 같은 container box에 맞추는 contain/cover/square crop 3개 패널과, 겹치는 두 region의 clip 교집합·merged redraw bounds를 정적으로 그린다. rect domain 전용 첫 예제.

- 작업 흐름: polyline path walk with simplification
- 관련 함수: `polyline/length`, `polyline/pointAtLengthInto`, `polyline/sampleFixedCountInto`, `polyline/sampleUniformInto`, `polyline/simplifyInto`, `polyline/closestPointInto`, `polyline/tangentAtIndexInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:polyline-path-walk` (`apps/pixi-demo/src/examples/polyline-path-walk`)
- 설명: 꼭짓점을 drag로 편집하고 하단 slider로 RDP simplify tolerance를 조정해 simplification 전/후를 오버레이 비교한다. 균등 sample marker, 고정 개수 marker, path walker, closest point를 tick마다 갱신한다. polyline domain 전용 첫 예제.

- reference: `flubber`, `d3-interpolate-path`
- 작업 흐름: SVG path morph (두 path 사이 보간)
- 관련 함수: `path/normalizeCommandsInto`, `path/equalizeSegmentsInto`, `path/flattenInto`, `easing/cubicInOut`, `interpolation/lerpPointInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:path-morph` (`apps/pixi-demo/src/examples/path-morph`)
- 설명: 두 path command list를 `normalizeCommandsInto`로 정규화하고 `equalizeSegmentsInto`로 command 수를 맞춘 뒤, tick마다 easing된 `t`로 중간 path를 그린다. `flattenInto` 결과를 sample marker로 표시해 path 전체 morph 흐름을 보여준다.

- 작업 흐름: infinite line projection and intersection
- 관련 함수: `infinite-line/createInfiniteLine`, `infinite-line/fromSegmentInto`, `infinite-line/pointAt`, `infinite-line/singleIntersectionInto`, `infinite-line/isParallel`, `infinite-line/isCollinear`, `infinite-line/projectPointInto`, `infinite-line/distanceToPoint`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:infinite-line-projection` (`apps/canvas-demo/src/examples/infinite-line-projection`)
- 설명: 선분 3개에서 무한선을 파생하고 교점, 평행/공선 판별, 점 투영과 거리를 한 장면에 정적으로 그린다. infinite-line domain 전용 첫 예제.

- 관련 함수: `finite-line/project`, `finite-line/closestPointInto`, `finite-line/distanceToPoint`, `finite-line/length`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:segment-snap` (`apps/canvas-demo/src/examples/segment-snap`)

- 관련 함수: `bounds/fromPointsInto`, `bounds/toRectInto`, `bounds/centerInto`, `bounds/width`, `bounds/height`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:selection-bounds` (`apps/canvas-demo/src/examples/selection-bounds`)

- 관련 함수: `circle/pointAtAngleInto`, `circle/closestPointInto`, `intersects/intersects-circle-segment`, `segment/pointAtInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:orbit-segment` (`apps/pixi-demo/src/examples/orbit-segment`)

- 관련 함수: `curve/catmullRomPolylineInto`, `curve/cardinalPolylineInto`, `curve/bsplinePolylineInto`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:point-list-curve-comparison` (`apps/canvas-demo/src/examples/point-list-curve-comparison`)

- 관련 함수: `curve/quadraticPointAtInto`, `curve/quadraticTangentAtInto`, `curve/quadraticNormalAtInto`, `curve/quadraticHullInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:bezier-control-inspector` (`apps/pixi-demo/src/examples/bezier-control-inspector`)

- reference: `paper.js`
- 작업 흐름: cubic Bezier control point inspector
- 관련 함수: `curve/cubicPointAtInto`, `curve/cubicTangentAtInto`, `curve/cubicNormalAtInto`, `curve/cubicHullInto`, `curve/cubicBoundsInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:cubic-bezier-inspector` (`apps/pixi-demo/src/examples/cubic-bezier-inspector`)
- 설명: 제어점 4개를 drag해 cubic Bezier 곡선을 실시간 갱신한다. de Casteljau 1·2단계 hull 보조선, animated t의 point/tangent/normal marker, 그리고 extrema 기반 tight bounds box를 매 프레임 표시한다. `bezier-control-inspector`(quadratic form)와 구별되는 cubic form 예제로, bounds box가 quadratic 예제 대비 추가 가치다.

- reference: `p5.js`
- 작업 흐름: vector steering field
- 구현: `apps/pixi-demo/src/examples/vector-steering-field/`
- 예제 ID: `vector-steering-field`

- reference: `svg-path-commander`, `svg-pathdata`
- 작업 흐름: SVG path inspect and sample
- 관련 함수: `svg-path/parsePathDataInto`, `svg-path/pathDataToString`, `svg-path/optimizePathDataString`, `path/bounds`, `path/length`, `path/pointAtLengthInto`, `path/propertiesAtLength`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:svg-path-inspect-sample` (`apps/canvas-demo/src/examples/svg-path-inspect-sample`)

- 관련 함수: `ray/fromAngleInto`, `intersects/single-intersection-segment-ray-into`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ray-cast` (`apps/pixi-demo/src/examples/ray-cast`)
- 설명: draggable 광원에서 사방으로 ray를 sweep해 벽 segment의 nearest hit을 이어 가시 영역을 그린다.

- 작업 흐름: ray-ray forward intersection lab
- 관련 함수: `ray/rayFrom`, `ray/createRay`, `ray/copyInto`, `ray/singleIntersectionInto`, `ray/singleIntersection`, `ray/reverse`, `ray/distanceToPointSq`, `ray/isDegenerate`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:ray-intersection-lab` (`apps/pixi-demo/src/examples/ray-intersection-lab`)
- 설명: 두 ray의 origin과 direction handle을 drag해 forward 방향 단일 교점, backward 불일치, degenerate ray의 점 취급을 실시간 확인한다.

- 관련 함수: `easing/linear`, `easing/quadOut`, `easing/cubicInOut`, `easing/backOut`, `easing/bounceOut`, `easing/elasticOut`, `segment/pointAtInto`, `interpolation/remap`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:easing-motion-timing` (`apps/pixi-demo/src/examples/easing-motion-timing`)
- 설명: 진행도를 선택된 easing 함수로 변환해 segment 위 marker를 구동하고 등속 marker와 비교한다. 좌측에 현재 easing 곡선과 진행 점을 그린다. 한 주기마다 easing 함수를 순환한다.

- 관련 함수: `triangle/centroidInto`, `triangle/incenterInto`, `triangle/circumcenterInto`, `triangle/incircleInto`, `triangle/circumcircleInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:triangle-centers` (`apps/pixi-demo/src/examples/triangle-centers`)
- 설명: 세 꼭짓점을 드래그하면 centroid/incenter/circumcenter와 incircle/circumcircle이 실시간 갱신된다. collinear에서 외심/외접원이 false로 빠지는 동작을 함께 보여준다.

- reference: `phaser`, `pixijs`
- 작업 흐름: editor-like hit-test and transform handles
- 관련 함수: `editor-geometry/resizeHandlesInto`, `editor-geometry/handleAtPoint`, `editor-geometry/transformFromHandlesInto`, `editor-geometry/constrainResize`, `matrix/transformBoundsInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:transform-handles` (`apps/pixi-demo/src/examples/transform-handles`)
- 설명: resize handle drag를 affine matrix로 환산해 box에 적용하고 최소 크기로 보정한다. rotate handle과
  broad-phase는 제외한다.

- reference: `maker.js`
- 작업 흐름: CAD-like measurement preview
- 관련 함수: `vec/distance`, `vec/angleBetween`, `segment/length`, `segment/angle`, `circle/area`, `circle/circumference`, `curve/arcLength`, `curve/arcSampleInto`, `bounds/fromPointsInto`, `bounds/width`, `bounds/height`, `bounds/centerInto`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:cad-measurement-preview` (`apps/canvas-demo/src/examples/cad-measurement-preview`)
- 설명: 선분 치수선(extension line+tick+거리 라벨), 두 선분 사이 각도 호, 원 반지름/지름/면적/둘레, center-form 호 길이, 전체 model bounds box를 한 장면에 정적으로 측정해 그린다. model graph는 가져오지 않는다. boolean/outline 제외.

- reference: `d3-shape`
- 작업 흐름: SVG arc endpoint ↔ center parameterization preview
- 관련 함수: `curve/endpointArcToCenterInto`, `curve/centerArcToEndpointInto`, `curve/correctEndpointArcRadiiInto`, `curve/arcSampleInto`, `curve/arcBoundsInto`, `curve/arcMiddle`
- 권장 산출물: `canvas-demo`
- 연결: `canvas-demo:svg-arc-parameterization` (`apps/canvas-demo/src/examples/svg-arc-parameterization`)
- 설명: SVG `A` endpoint form arc를 center form으로 변환해 호·중심·반지름선·bounds를 정적으로 그린다. 좌측은 rotated ellipse arc 변환과 center→endpoint round-trip 오차, 우측은 out-of-range radii의 `correctEndpointArcRadiiInto` 보정 전/후 비교.

- 작업 흐름: Hermite spline builder with tangent drag
- 관련 함수: `interpolation/cubicHermite`, `interpolation/tangentCardinal`, `interpolation/sampleParametersInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:hermite-spline-builder` (`apps/pixi-demo/src/examples/hermite-spline-builder`)
- 설명: endpoint와 tangent handle을 drag해 cubic Hermite curve를 실시간 갱신한다. `tangentCardinal`로 자동 cardinal tangent preview도 함께 표시해 수동 tangent와 비교한다. `bezier-control-inspector`(Bézier form 제어점)와 구별되는 Hermite form(위치+접선) 예제.

- reference: `pixijs`, `paper.js`
- 작업 흐름: editor snap guides lab
- 관련 함수: `editor-geometry/snapPointToGrid`, `editor-geometry/snapPointToGuides`,
  `editor-geometry/snapPointToVertices`, `editor-geometry/snapPointToSegments`,
  `editor-geometry/magneticSnap`, `editor-geometry/snapPoint`, `editor-geometry/alignmentGuidesInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:editor-snap-guides-lab` (`apps/pixi-demo/src/examples/editor-snap-guides-lab`)
- 설명: 점 handle을 드래그해 static object의 vertex/segment/alignment guide 후보를 tolerance 안에서 비교하고,
  hit가 없으면 grid fallback으로 보정한다. 같은 후보 목록을 `magneticSnap`/`snapPoint` 결과와 나란히
  표시해 editor snapping dispatcher와 개별 snap 함수의 차이를 확인한다.

- reference: `p5.js`, `pixijs`
- 작업 흐름: bias curve (b 파라미터로 진행 곡선을 저값 또는 고값 쪽으로 shaping)
- 관련 함수: `easing/bias`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:easing-bias-curve` (`apps/pixi-demo/src/examples/easing-bias-curve`)
- 설명: b 파라미터 수평 핸들을 drag하면 `bias(t, b)` 출력 곡선이 저값(b < 0.5) 또는 고값(b > 0.5)
  쪽으로 휘어지는 변화를 graph와 segment 위 marker로 동시에 확인한다. b === 0.5가 linear와 일치한다는
  것을 graph 중앙 눈금으로 드러낸다. `easing-motion-timing`(기본 timing 곡선 순환)·`stepped-timing-track`
  (이산 계단 timing)과 구별되는 "파라미터 하나가 shaping 방향을 바꾼다"는 Schlick bias 단일 개념 예제로,
  `easing/bias` leaf의 첫 연결이다. amount가 (0,1) open bound 요구라 핸들 값을 0.01~0.99로 clamp해
  RangeError를 방지한다. scalar 반환이라 `*Into` companion이 없어 그대로 쓴다. diagnostics는 `PIXI.Text`로만
  출력한다(`g.text` 미사용). `@cp949/vectra/easing` namespace는 `easing-motion-timing`이 이미 sandbox
  allowlist 2배열에 등록해 allowlist·runner-html 변경이 없다.

## Skipped

현재 없음.
