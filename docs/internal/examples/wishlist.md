# 예제 Wishlist

이 문서는 모든 public 함수에 예제를 붙이기 위한 목록이 아니다.
사용자가 "이 함수는 언제 쓰는지 모르겠다"고 느낀 함수 묶음을 모아, 필요한 것만 문서 recipe
또는 `apps/pixi-demo` 예제로 만든다.

예제 작업 진입점은 [README.md](./README.md)다.
예제 추가 원칙은 [strategy.md](./strategy.md)를 따른다. 제품 비범위 예제는 추가하지 않는다.

agent가 작업 중 추천하고 싶은 기본 예제나 알려진 좋은 예제 후보는
[recommended.md](./recommended.md)에 남긴다.

## 운영 규칙

- 예제는 함수 단위가 아니라 사용 상황 단위로 만든다.
- 하나의 예제는 여러 함수를 함께 설명할 수 있다.
- 신규 실행 예제는 정적/interactive 여부와 무관하게 `apps/pixi-demo` 예제로 만든다.
- `apps/canvas-demo`는 기존 예제 유지보수에만 사용한다.
- 짧은 설명과 코드 조각으로 충분한 함수는 `docs/internal/examples/` recipe로 만든다.
- 기존 예제가 이미 충분히 설명하는 함수는 새 예제를 만들지 않고 연결만 남긴다.
- 사용자는 `Needed` 섹션에 궁금한 source file path만 남긴다.
- agent는 `Needed` 항목을 분석해 관련 함수, 예제 형태, 산출물을 정한 뒤 `Planned` 섹션으로 옮긴다.
- `Planned` 항목이 예제나 recipe로 구현되면 `Done` 섹션으로 이동하고 연결을 기록한다.
- 설명은 선택 사항이다. 설명을 쓰기 부담스러우면 쓰지 않는다.
- 관련 함수는 이름 충돌을 피하기 위해 `module/functionName` 형태로 적는다.
- 구현된 항목의 `연결` 필드는 `canvas-demo:<exampleId>` 또는 `pixi-demo:<exampleId>` 형식으로
  적고, 필요하면 source path를 괄호로 덧붙인다. 형식 정의는 [README.md](./README.md)의 `Example ID`
  섹션을 따른다.

## 예제 앱 역할

### `apps/pixi-demo`

신규 실행 예제를 담당한다.

- Pixi `Application`과 ticker 기반 update loop를 사용한다.
- 정적 비교, pointer drag, 선택 상태, animation, scene object, resize/rotate handle을 모두 이 앱에서
  처리한다.
- Pixi는 렌더링과 이벤트만 담당하고, geometry 계산은 `vectra` public API로 처리한다.

## 상태

- `Needed`: 사용자가 예제가 필요하다고 느낀 source file path inbox. 사용자는 판단하지 않는다.
- `Planned`: agent가 관련 함수와 만들 예제 형태를 판정한 사용자 요청 항목.
- `Done`: 예제나 recipe가 연결된 항목.
- `Skipped`: 기존 문서나 예제로 충분해서 새 예제를 만들지 않는 항목.

## 요청 목록

### Needed

현재 없음.

### Planned

현재 없음.

### Done

- 관련 함수: `curve/quadraticHullInto`
- 구현 산출물: `canvas-demo`
- 연결: `canvas-demo:quadratic-hull` (`apps/canvas-demo/src/examples/quadratic-hull`)
- 설명: control polygon과 de Casteljau hull 구성을 정적으로 그린다. t=0.5에서 lerp 보간선과 곡선 위 pointAt를 강조하고, t=0.25/0.75 marker로 hull이 곡선을 추적하는 흐름을 보여준다.

### Skipped

현재 없음.

## 작성 기준

사용자는 `Needed`에 파일 경로만 추가한다.

좋은 항목:

```md
- 파일: `sub/vectra/src/curve/arc-bounds-into.ts`
```

피할 항목:

```md
- 파일: `arcBoundsInto`
```

agent는 `Needed`의 파일을 읽고 `Planned`에 다음 형태로 옮긴다. `설명`은 선택 사항이다.

```md
- 관련 함수: `curve/arcBoundsInto`
- 권장 산출물: `pixi-demo`
- 연결: 예정
- 설명: 선택 사항
```

구현이 끝나면 `연결`을 `canvas-demo:<exampleId>` 또는 `pixi-demo:<exampleId>` 형식으로 갱신하고
`Done` 섹션으로 옮긴다.

```md
- 관련 함수: `curve/arcBoundsInto`
- 권장 산출물: `pixi-demo`
- 연결: `pixi-demo:arc-bounds` (`apps/pixi-demo/src/examples/arc-bounds`)
```
