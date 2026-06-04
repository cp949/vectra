# API inventory 예제는 사용자 작업 흐름이 없으면 실패한다

태그: `examples`, `pixi-demo`, `ux`, `coverage`

## 함정

coverage gap을 줄이기 위해 한 domain의 여러 API 결과를 한 장면에 모으면, 실행 결과만 보고
무엇을 하려는 예제인지 알 수 없어진다.

```txt
기준 원 + 포함 판정 + bounds 내접 원 + expand/shrink/scale/translate + closest point + tangent
```

이런 장면은 API 호출 목록은 많지만 사용자가 따라갈 작업 흐름이 없다. Pixi로 구현해도 문제가
사라지지 않는다. renderer 문제가 아니라 예제 설계 문제다.

사용자 작업 흐름이 있더라도 너무 많은 preview를 합치면 같은 실패가 된다.

```txt
crop box + contain + cover + square crop + safe area + rotated AABB + dirty bounds
```

이 예제는 "crop을 조작한다"는 흐름이 있어 보이지만 실제 학습 대상은 여러 개다. 사용자는 색상과
label을 해석하기 전까지 무엇을 봐야 하는지 알 수 없다. 이 경우 coverage 목적의 API inventory와
동일하게 실패로 본다.

## 증상

- 화면을 봐도 예제의 목적을 한 문장으로 말할 수 없다.
- `contains=true`, `distance=...` 같은 diagnostics가 어떤 도형 관계를 설명하는지 즉시 연결되지 않는다.
- 도형, 라벨, 보조선이 모두 의미 있어 보이지만 우선순위가 없다.
- 예제가 "사용 상황"이 아니라 "함수 호출 inventory"처럼 보인다.
- 사용자는 코드를 읽기 전에는 학습할 내용과 조작할 대상을 알 수 없다.
- 예제 제목이 `lab`, `stack`, `workbench`, `comparison`인데 실제로는 여러 독립 관계를 한 화면에
  섞고 있다.
- 상단 주석의 중심 API 목록이 6개 이상이다.
- label에 핵심 값이 4개 이상 들어가고, 각 값이 서로 다른 geometry 관계를 설명한다.

## 방지

새 실행 예제를 계획할 때 먼저 화면 목적을 한 문장으로 적는다.

```txt
사용자가 <무엇을 조작/관찰>하면 <어떤 geometry 관계>가 바뀌는지 보여준다.
```

이 문장이 안 나오면 실행 예제로 만들지 않는다. 문서 recipe나 후속 후보로 보류한다.

한 예제는 하나의 주 작업 흐름만 가진다.

- containment playground: 기준 원 안팎으로 원/rect/point를 드래그하며 포함 판정만 보여준다.
- distance/closest point: 두 원 사이 거리와 closest point만 보여준다.
- transform comparison: expand/shrink/scale/translate 결과 비교만 보여준다.

여러 API cluster를 동시에 다뤄야 하면 예제를 쪼갠다. coverage를 위해 한 장면에 합치지 않는다.

복잡도 상한:

- 조작 주 대상: 1개
- 핵심 geometry 관계: 1개
- 중심 API: 5개 이하
- diagnostics 값: 3개 이하
- preview 종류: 원본 + 결과 1개가 기본, 비교가 주제일 때만 결과 2개까지 허용

이 상한을 넘기려면 구현하지 말고 먼저 예제를 분리한다.

## 계획서 체크

`01-계획.md`의 목표 또는 예제 개요에 다음 항목을 반드시 확인한다.

- 화면 목적 한 문장.
- 사용자가 조작하거나 관찰할 주 대상 1개.
- diagnostics가 연결되는 도형 관계.
- 중심 API 5개 이하. 초과하면 어떤 예제로 분리할지 적는다.
- diagnostics 값 3개 이하. 초과하면 화면에서 제거하거나 별도 recipe로 낮춘다.
- 제외할 관련 API 목록. 특히 같은 domain의 인접 API라도 현재 작업 흐름과 무관하면 제외한다.

## 발견 맥락

- `_works/S1-RM-013/20260524-12-circle-region-operations-example/`:
  `circle-region-operations`가 circle API coverage는 채웠지만 실행 결과만 보면 목적을 알기 어려운
  API inventory 예제가 되었다.
- `_works/S1-RM-013/20260524-31-rect-crop-transform-lab-example/`:
  `rect-crop-transform-lab`는 crop 조작 흐름이 있었지만 contain/cover/square/safe-area/rotation/dirty
  bounds를 한 화면에 합쳐 학습 대상이 분산됐다. 구현 전에 복잡도 gate로 차단해야 했다.
