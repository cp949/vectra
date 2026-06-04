# 위임 함수 JSDoc에 하위 위임이 이미 배제한 경로 기술 금지

태그: `jsdoc`, `delegation`, `dead-branch`, `misleading`

## 함정

함수가 내부적으로 strict sub-function에 위임할 때, sub-function이 이미 처리/거부하는
케이스를 상위 함수 JSDoc에 "가능한 동작"으로 기술하면 오해를 유발한다.

```ts
// 함정: parsePathDataInto(strict)가 이미 Move 없는 data를 거부하므로
// "암묵적 origin move prepend" 경로는 도달 불가능하다.
// 그런데 JSDoc에 splitSubpathsInto의 동작 그대로를 기술했다.

/**
 * ...
 * subpath 분리 정책은 splitSubpathsInto와 동일하다
 * (MoveCommand 기준 분리, 첫 command가 MoveCommand가 아니면 암묵적 origin move prepend).  ← ✗
 */
export function parseSubpathsInto(...) {
  if (!parsePathDataInto(tmp, data)) return false; // Move 없으면 여기서 false
  splitSubpathsInto(subpathsOut, tmp);             // 항상 Move로 시작하는 sequence만 도달
}
```

## 증상

- JSDoc을 읽는 사람이 "origin(0,0) 위치에 암묵적 Move가 prepend될 수 있다"고 오해한다.
- sub-function의 strict 조건을 모르는 caller가 잘못된 fallback 로직을 짜거나
  불필요한 방어 코드를 추가한다.

## 방지

위임 함수 JSDoc 작성 시:

1. 내부적으로 호출하는 sub-function이 어떤 입력을 거부하는지 먼저 확인한다.
2. sub-function이 이미 배제한 경로는 상위 함수 JSDoc에 기술하지 않는다.
3. "sub-function 정책과 동일하다"고 전체를 인용하는 대신, 상위 함수의 실제 동작 범위만 기술한다.

```ts
// 수정 예
/**
 * ...
 * 내부적으로 parsePathDataInto로 strict parse 후 splitSubpathsInto로 분리한다.
 * subpath 분리는 MoveCommand 기준이며 splitSubpathsInto 정책과 동일하다.
 * strict parse 단계에서 Move 없이 시작하는 data는 실패하므로, parse 성공 후에는
 * 항상 MoveCommand로 시작하는 sequence만 splitSubpathsInto에 전달된다.  ← ✓ 실제 범위 기술
 */
```

## 발견 경위

`S2-RM-013` 리뷰-수정 중 발견. `parseSubpathsInto` JSDoc의 "암묵적 origin move prepend" 문구가
`parsePathDataInto` strict 거부로 인해 도달 불가능한 경로를 기술하고 있었다.
