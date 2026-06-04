# signed distance 수식: 분자에 절대값을 씌워 부호 소거

태그: `signed-distance`, `cross-product`, `formula`, `infinite-line`

## 함정

`signedDistanceToPoint`처럼 부호를 보존해야 하는 함수 구현 시, unsigned 거리 함수에서 수식을
복사하면서 분자에 절대값(`|...|`)을 그대로 두는 실수.

```ts
// 함정: 분자에 절대값을 씌워 부호가 소거된다
const dist = Math.abs(cross(d, delta)) / len; // unsigned — 부호 없음

// 의도한 형태: 절대값 없이 cross product 그대로
const signed = cross(d, delta) / len; // signed — 좌측 양수 / 우측 음수
```

계획서나 주석에 `|cross(d, p-o)| / |d|`처럼 적으면 분자 `|...|`가 절대값으로 읽혀
구현자가 `Math.abs(cross(...))` / `len`으로 코드를 작성한다.

## 증상

- `signedDistanceToPoint`가 항상 양수를 반환한다.
- `side` 함수에서 좌측/우측 구분이 불가능하다.
- 테스트에서 양의 기댓값만 확인하면 통과해버린다.

## 방지

signed distance 수식을 계획서나 주석에 적을 때 분모(`|d|`)와 분자(`cross(d, p-o)`)를 명확히 구분한다.

```
올바른 표기: cross(d, p-o) / |d|
틀린 표기:   |cross(d, p-o)| / |d|   ← 분자 절대값이 부호를 소거
```

테스트에 반드시 양수 케이스와 음수 케이스를 함께 포함한다.

```ts
// 반드시 포함할 케이스
signedDistanceToPoint(line, leftPoint)   // 양수
signedDistanceToPoint(line, rightPoint)  // 음수
signedDistanceToPoint(line, onLine)      // 0 근방
```

## 관련 작업

- `_works/S3-RM-027/20260522-01-circle-line-follow-up/` (TASK-03 계획서 리뷰)
