# 참고 프로젝트 예제 방향

예제 작업 진입점은 [README.md](./README.md)다.

이 문서는 과거 reference learning 자료와 로컬 참고 source를 예제 후보로 사용할 때의 방향을 정리한다.

참고 프로젝트는 예제 씨앗이다. 예제를 그대로 port하지 않는다.

## 선택 기준

우선순위가 높은 seed:

- 실제 graphics / editor / geometry 작업 흐름이 분명하다.
- `vectra` 제품 범위 API로 계산 부분을 재구성할 수 있다.
- renderer나 framework state를 걷어내도 예제 가치가 남는다.
- 여러 public leaf 함수가 자연스럽게 조합된다.

우선순위가 낮은 seed:

- 제품 비범위 성격이 강하다.
- physics, scene graph, editor state ownership이 핵심이다.
- 원본 library object model을 그대로 가져와야 의미가 생긴다.
- 단순 API 나열에 가깝다.

## 제품 비범위 제외

다음 작업 흐름은 예제에서 제외한다.

- polygon holes / winding / boolean
- offset / simplification / triangulation
- path stroke / outline expansion
- spatial index
- broad-phase acceleration
- query ranking

reference project에 해당 예제가 있어도 지금은 사용하지 않는다.

## 1순위 후보

### `paper.js`

참고 위치: `/work/thrd/paper.js`

방향:

- path / curve editor 작업 흐름
- control point, tangent, normal, split, closest point, bounds, transform
- renderer/editor object model은 제외하고 geometry 계산만 `vectra`로 재구성

적합 산출물:

- `apps/pixi-demo`: 정적 curve/path measurement, draggable control points, pointer closest point, animated marker

주 domain:

- `curve`
- `path`
- `bounds`
- `matrix`
- `segment`
- `vec`
- `intersects` light relation

제외:

- Path boolean
- CompoundPath topology
- item tree / selection state / style

초기 후보:

- Bezier inspector
- path closest-point preview
- curve split / tangent / normal preview
- transformed bounds and local hit-test

### `p5.js`

참고 위치: `/work/thrd/p5.js`

방향:

- creative coding vector 작업 흐름
- heading, angle, steering, seeded scatter, easing motion
- p5 renderer state와 angle mode는 가져오지 않는다.

적합 산출물:

- `apps/pixi-demo`: vector / angle 시각화, steering, easing motion, interactive pointer follow

주 domain:

- `vec`
- `angle`
- `random`
- `easing`
- `math`
- `interpolation`

제외:

- p5 instance lifecycle
- renderer mode
- 3D vector / WebGL matrix 작업 흐름

초기 후보:

- vector steering field
- angle and orientation visualizer
- seeded scatter plot
- easing motion comparison

### `d3-shape`

참고 위치: `/work/thrd/d3-shape`

방향:

- generated curve / path 비교
- Catmull-Rom, cardinal, B-Spline, arc, radial coordinate 변환
- d3 generator/accessor API는 그대로 가져오지 않는다.

적합 산출물:

- `apps/pixi-demo`: curve family comparison, arc/radial preview
- 문서 recipe: path generation input/output 설명

주 domain:

- `curve`
- `interpolation`
- `path`
- `angle`
- `svg-path`

제외:

- stack layout
- area stack mutation
- d3 context protocol port

초기 후보:

- Catmull-Rom / cardinal / B-Spline comparison
- arc endpoint / center parameter preview
- radial line sample

## 2순위 후보

### `svg-path-commander`, `svg-pathdata`

방향:

- SVG path parse / normalize / serialize / point-at-length 작업 흐름
- adapter boundary를 보여준다.

적합 산출물:

- `apps/pixi-demo`
- 문서 recipe

주 domain:

- `svg-path`
- `path`
- `curve`
- `adapter`

제외:

- morphing
- path outline / stroke expansion

### `maker.js`

방향:

- CAD-like measurement, model bounds, outline construction의 가벼운 부분
- 실제 CAD model graph는 가져오지 않는다.

적합 산출물:

- `apps/pixi-demo`

주 domain:

- `segment`
- `circle`
- `arc` 계열 curve 함수
- `bounds`
- `matrix`

제외:

- model tree ownership
- boolean / outline expansion

### `phaser`, `pixijs`

방향:

- pointer interaction, hit-test, transform, display geometry
- renderer는 Pixi demo가 맡고 계산은 `vectra`가 맡는다.

적합 산출물:

- `apps/pixi-demo`

주 domain:

- `bounds`
- `rect`
- `circle`
- `ellipse`
- `polygon`
- `matrix`
- `editor-geometry`

제외:

- renderer object lifecycle
- scene graph ownership
- broad-phase acceleration

## 보류 후보

### `flatten-js`

좋은 참고 대상이지만 intersection / relation / topology 성격이 강하다.

사용 가능:

- Stage 1~3의 distance, closest point, light relation 비교

보류:

- polygon topology
- boolean
- relation graph

### `martinez`, `clipper2-ts`, `polygon-clipping`

제품 비범위 성격이 강하다. 예제 seed에서 제외한다.

### `matter-js`, `planck-js`

physics engine context가 강하다.

사용 가능:

- ray / segment query의 시각적 영감
- bounds view 이동 같은 단순 geometry 작업 흐름

보류:

- physics simulation
- collision broad-phase
- body lifecycle

### `turf`

geo domain 성격이 강하다.

사용 가능:

- point-in-polygon, nearest-on-line 같은 2D screen geometry로 번역 가능한 가벼운 작업 흐름

보류:

- spatial query
- geo projection
- indexing

## 새 예제 후보 작성 형식

`recommended.md`에 구체 후보를 추가할 때 아래 형식을 사용한다.

```md
- reference: `paper.js`
- 작업 흐름: Bezier control point inspector
- 권장 산출물: `pixi-demo`
- 관련 domain: `curve`, `bounds`, `vec`
- 대표 함수: `curve/quadraticPointAtInto`, `curve/quadraticTangentAtInto`
- 제품 비범위 포함 여부: 없음
- 설명: draggable control point에서 point/tangent/normal/bounds를 보여준다.
```

대표 함수는 전체 커버리지 목록이 아니다. 예제의 중심 API만 적는다.
