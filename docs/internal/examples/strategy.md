# 예제 운영 전략

예제 작업 진입점은 [README.md](./README.md)다.

이 문서는 `apps/pixi-demo`, legacy `apps/canvas-demo`, `docs/internal/examples/*`에 예제를 추가하거나
정리할 때 따르는 운영 원칙을 정한다.

## 결정

예제는 커버리지를 위해 만들지 않는다.

예제는 실제 프로젝트에서 쓰일 수 있는 geometry 작업 흐름을 보여준다. public leaf 함수 커버리지는
예제 선택을 돕는 참고 신호로만 사용한다.

실행 예제는 화면 목적이 한 문장으로 설명되어야 한다.

```txt
사용자가 <무엇을 조작/관찰>하면 <어떤 geometry 관계>가 바뀌는지 보여준다.
```

이 문장이 안 나오면 실행 예제로 만들지 않는다.

이 문장이 나오더라도 관계가 여러 개면 실행 예제로 만들지 않는다. 예를 들어
`crop box를 드래그하면 contain/cover fit, square crop, safe area, rotated AABB가 함께 바뀐다`는
한 문장처럼 보이지만 실제로는 4개 예제 후보를 한 화면에 합친 것이다. 이런 경우에는 가장 중요한
관계 1개만 남기거나 문서 recipe로 낮춘다.

## 목표

- `vectra`가 renderer가 아니라 computation catalog라는 점을 보여준다.
- 다양한 범위의 geometry/math function catalog라는 정체성을 예제로 확인한다.
- 유명한 geometry / graphics / editor 작업 흐름을 `vectra` public API로 재구성한다.
- 예제가 늘어날수록 public leaf 함수가 자연스럽게 한 번 이상 호출되도록 한다.
- 아직 예제에 등장하지 않은 함수 cluster를 보고 다음 예제 후보를 고른다.

## 비목표

- 모든 public 함수를 처음부터 강제로 예제에 배치하지 않는다.
- 의미 없는 함수 호출을 추가하지 않는다.
- 파라미터를 넣고 return value나 output mutation만 보여주는 단순 호출 예제를 만들지 않는다.
- 한 domain의 API inventory를 한 화면에 모아 coverage만 채우는 예제를 만들지 않는다.
- reference project의 예제를 그대로 port하지 않는다.
- renderer, scene graph, editor state, history, physics behavior를 `vectra` 책임처럼 보이게 만들지
  않는다.

## 제품 비범위

예제에서는 vectra가 구현하지 않는 API나 작업 흐름을 추가하지 않는다.

제외:

- polygon holes / winding / boolean
- polygon offset / simplification / triangulation / topology repair
- path stroke / outline / cap / join / dash assembly
- spatial index / broad-phase acceleration / query result ranking

reference project는 계속 참고할 수 있다. 다만 topology, boolean, offset, triangulation,
spatial index, broad-phase, query-ranking 작업 흐름은 예제 범위에서 제외한다.

## 예제 추가 방식

예제 추가는 다음 순서로 진행한다.

```txt
reference project 또는 실제 작업 흐름 선택
→ `vectra`가 담당할 계산 부분만 추출
→ `pixi-demo` 또는 문서 recipe 중 산출물 선택
→ 실제 필요한 public leaf 함수만 사용
→ 사용된 함수와 연결을 문서에 기록
→ 남은 커버리지 gap을 다음 후보 선정에 참고
```

커버리지 gap은 backlog 신호다. test 실패가 아니다.

예제 계획 중 API cluster가 커지면 먼저 작업 흐름 기준으로 쪼갠다. 예를 들어 circle domain의
containment, distance/closest point, transform 비교는 한 장면에 합치지 않고 별도 예제로 둔다.

작업 흐름 기준으로도 다음 중 하나에 걸리면 쪼갠다.

- 사용자가 조작하는 주 대상이 2개 이상이다.
- 화면에서 색상/선/preview 종류를 설명 없이 구분하기 어렵다.
- label에 보여줘야 할 핵심 값이 4개 이상이다.
- 중심 API가 6개 이상이다.
- 예제 제목이 `A and B`, `A comparison lab`, `A transform stack`처럼 여러 관계를 암시한다.

## 커버리지 기준

커버리지 대상은 public leaf module이다.

포함:

- `sub/vectra/src/<domain>/<function>.ts`

제외:

- `*.internal.ts`
- `index.ts`
- `types.ts`
- `sub/vectra/src/internal/*`
- 아직 구현되지 않은 API surface 후보
- domain barrel export 자체
- 제품 비범위 API

100% 커버리지는 목표지만 강제 조건은 아니다. 커버리지 누락은 에러가 아니다.

권장 도구:

- `pnpm examples:coverage`는 누락/중복/분류만 출력하고 exit code `0`을 반환한다.
- `pnpm examples:coverage:write`는 `docs/internal/examples/coverage.md`를 갱신한다.
- `pnpm examples:coverage:strict`는 uncovered public leaf가 있으면 exit code `1`을 반환한다.
- demo app은 커버리지 누락이 있어도 실행된다.
- allocating companion과 `*Into` companion이 같은 계산을 공유하면 둘 중 하나의 의미 있는 사용을
  양쪽 coverage로 인정한다.

## 커버리지 인정 기준

함수 호출은 아래 조건을 만족할 때 커버리지로 인정한다.

- 예제 작업 흐름에서 필요한 계산이다.
- 호출 이유를 한 문장으로 설명할 수 있다.
- 결과가 화면, interaction, diagnostics, measurement table, recipe assertion 중 하나에 영향을 준다.
- 같은 결과를 이미 더 명확한 함수로 보여주고 있다면 중복 호출을 피한다.

커버리지로 인정하지 않는 예:

- “커버리지를 채우기 위한” 독립 호출
- 결과를 사용하지 않는 호출
- 임의 파라미터로 호출하고 값만 표시하는 예
- 예제 주제와 무관한 helper 호출
- 화면만 보고 중심 질문을 알 수 없는 API inventory 예제

## 산출물 선택

### `apps/pixi-demo`

신규 실행 예제의 기본 위치다. 정적 비교도 Pixi scene으로 구현한다.

적합:

- 입력 / 출력 shape 비교
- bounds, projection, closest point, distance
- matrix transform 결과
- path / curve sampling
- random sampling 결과
- SVG path parse / serialize preview
- pointer drag
- resize / rotate handle
- hover hit-test
- animated marker
- local/world transform interaction
- editor-like snapping / guide preview

Pixi는 렌더링과 이벤트만 담당한다. geometry 계산은 `vectra` public API로 처리한다.

### `apps/canvas-demo`

legacy 예제 유지보수에만 사용한다. 새 예제를 추가하지 않는다.

### recipe 문서

짧은 코드 조각과 설명으로 충분한 작업 흐름에 사용한다.

적합:

- renderer가 필요 없는 scalar 계산
- import pattern 설명
- 작은 API 조합
- edge case나 numeric policy 설명

## 예제 유형

### 대표 예제

사용자가 먼저 보는 예제다. 시각적 완성도와 작업 흐름 설명을 우선한다.

### 작업 흐름

실제 프로젝트 작업 흐름을 보여주는 예제다. 커버리지 증가의 주력이다.

### 문서 recipe

문서와 짧은 코드로 충분한 예제다.

### 커버리지 전용

기본적으로 금지한다.

다만 실제 작업 흐름 설명이 가능하고, 화면보다 report/table이 더 적합한 경우에는 허용한다.

## 참고 프로젝트 사용 원칙

참고 프로젝트는 예제 씨앗이다. port 대상이 아니다.

원칙:

- 원본 예제의 핵심 작업 흐름만 가져온다.
- `vectra` structural input / `Into` output / scalar return 정책에 맞게 다시 작성한다.
- 외부 project의 object model, renderer state, scene graph ownership을 가져오지 않는다.
- license나 source attribution이 필요한 수준의 복제를 하지 않는다.
- 제품 비범위 작업 흐름은 제외한다.

## 문서 역할

- [recommended.md](./recommended.md): 구체화된 예제 후보 backlog
- [wishlist.md](./wishlist.md): 사용자가 남기는 source file path inbox
- [reference-seeds.md](./reference-seeds.md): reference project별 예제 방향
- `coverage.md`: public leaf 커버리지 현황. 생성 또는 수동 관리 가능

## 초기 진행 방향

처음부터 모든 예제를 계획하지 않는다.

초기에는 2~3개 reference 계열만 seed로 구체화한다.

추천 순서:

1. `paper.js` 계열
   - path / curve editor 작업 흐름
   - `curve`, `path`, `bounds`, `matrix`, `vec` 커버리지에 유리
2. `p5.js` 계열
   - creative coding vector 작업 흐름
   - `vec`, `angle`, `random`, `easing`, `math` 커버리지에 유리
3. `d3-shape` 계열
   - generated curve / path comparison
   - `curve`, `interpolation`, `path`, `svg-path` 커버리지에 유리

나머지 reference project는 [reference-seeds.md](./reference-seeds.md)에 방향만 기록하고, 실제
예제 계획은 커버리지 gap과 필요에 따라 나중에 구체화한다.
