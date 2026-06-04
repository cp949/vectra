# ADR 0003: Structural Coordinate Input 허용

상태: 승인

## 배경

Geometry data는 다른 라이브러리나 포맷에서 자주 온다. 모든 좌표를 사용 전에
`vectra` 전용 좌표 객체로 변환하도록 요구하면 API가 번거로워진다.

## 결정

좌표형 API는 object form과 tuple form을 모두 받는다.

```ts
export interface XYLike {
  readonly x: number;
  readonly y: number;
}

export type XYTuple = readonly [x: number, y: number];
export type XYInput = XYLike | XYTuple;
```

지원 입력:

```txt
{ x, y }
[x, y]
```

숫자 나열 overload는 public input shape에 포함하지 않는다.

## 결과

- `vectra`는 plain object 및 외부 라이브러리와 자연스럽게 호환된다.
- 출력은 `Into` 함수가 받는 writable structural object에 기록한다.
- 내부 input normalization은 작고 빠르며 일관되게 test한다.
