# 주석 작성 규칙

이 문서는 `vectra` source code의 주석 작성 기준을 정의한다. 주석의 목표는 코드 양을
늘리는 것이 아니라, public API와 internal helper의 계산 계약을 IDE hover와 source review에서
일관되게 이해할 수 있게 하는 것이다.

## 기본 원칙

- 주석은 한국어로 짧고 단정하게 작성한다.
- `clamp`, `aliasing`, `tie-break`, `degenerate`, `epsilon`, `subpath`, `barrel`처럼
  억지로 번역하면 더 어색한 기술 용어는 영어 그대로 쓴다.
- 구현을 그대로 읽어주는 설명보다 계산 의도, 호출 계약, 예외적인 경계 조건을 우선한다.
- 이름과 타입만으로 충분히 자명한 내용에는 주석을 붙이지 않는다.
- 구현 중에는 작업 진행 메모를 source 주석으로 남길 수 있다. 완료 전에는 public API 계약,
  내부 계산 의도, 유지보수에 필요한 주석만 남기고 임시 메모를 정리한다.

## Public 함수

public leaf module에서 export하는 함수는 선언 바로 위에 TSDoc `/** ... */` 주석을 둔다.

주석에는 보통 다음을 적는다.

- 무엇을 계산하거나 기록하는지
- 모든 parameter의 `@param` 설명
- empty, zero-length, inverted bounds 같은 degenerate 입력 처리
- `clamp` / `unclamp` 여부
- closed boundary 포함 여부
- `epsilon` 또는 tolerance 의미
- `Into` 함수의 output mutation과 반환 규칙
- `false` 반환 시 `out`을 수정하지 않는지 여부
- input/output aliasing 허용 여부
- 동률 처리 같은 tie-break 정책

public 함수의 모든 parameter는 `@param`으로 설명한다. `@param`은 타입을 반복하지 않고,
도메인 의미, 단위, 범위, clamp 여부, mutation 여부, aliasing 가능성처럼 호출자가 알아야 할
계약을 적는다. 이름만으로 자명한 `out`, `input`, `point`도 생략하지 않는다.

`@param`은 dash 구분자 없이 `@param 이름 설명` 형식으로 적는다. 프로젝트 다수 표준이며
`@param 이름 - 설명` 형식은 사용하지 않는다. 기존 leaf에 dash 형식이 남아 있더라도 새 leaf는
dash 없는 형식으로 작성한다.

예:

```ts
/**
 * polyline과 point 사이 최단 거리를 반환한다.
 *
 * empty polyline은 Infinity를 반환한다.
 * 동거리 closest segment는 앞쪽 segment를 우선한다.
 *
 * @param polyline 거리를 측정할 polyline
 * @param point polyline까지의 거리를 측정할 point
 */
export function distanceToPoint(polyline: PolylineLike, point: XYInput): number {
  // ...
}
```

## Overload 함수

여러 input 분기를 가진 overload 함수는 JSDoc 첫 줄에 모든 분기를 한 문장으로 보여준다.
한쪽 분기만 설명하고 다른 분기를 `@param`으로 미루지 않는다.

좋은 예:

```ts
/**
 * number input은 `0..n-1` 정수 순열을, array input은 셔플된 원소 순열을 새 배열로 반환한다.
 *
 * array input은 mutate하지 않는다.
 *
 * @param arrayOrLength 순열로 만들 length 또는 셔플 원본 배열. 읽기 전용.
 * @param rng 난수 생성 함수. 생략하면 default entropy source를 사용한다.
 */
export function permutation(arrayOrLength: number, rng?: RandomSource): number[];
export function permutation<T>(arrayOrLength: readonly T[], rng?: RandomSource): T[];
```

피할 예:

```ts
/**
 * 셔플된 원소 순열을 새 배열로 반환한다.   ← array 분기만 설명, number 분기는 누락
 *
 * @param arrayOrLength 길이 또는 배열
 */
```

## Into 함수

object result를 기록하는 `Into` 함수는 output 계약을 주석에 드러낸다.

- 일반적인 `Into` 함수는 `out`에 결과를 기록하고 같은 `out`을 반환한다.
- boolean primary `Into` 예외 함수는 성공 여부를 반환한다.
- 실패 시 `out`을 수정하지 않는 함수는 그 계약을 명시한다.
- input과 output이 같은 object여도 안전한 경우 aliasing 허용을 명시한다.

예:

```ts
/**
 * polyline에서 index번째 segment를 out에 기록한다.
 *
 * invalid index, empty polyline, single-point polyline에서는 false를 반환하고 out을 수정하지 않는다.
 *
 * @param out segment를 기록할 writable output
 * @param polyline segment를 읽을 polyline
 * @param index 읽을 segment index
 */
export function segmentAtInto(
  out: FiniteLineWritable<XYWritable, XYWritable>,
  polyline: PolylineLike,
  index: number,
): boolean {
  // ...
}
```

## Internal helper

`src/internal`의 helper도 export되어 여러 leaf module에서 공유된다면 TSDoc을 둔다. public API보다
짧게 쓰되, 호출자가 보장해야 하는 전제와 degenerate 처리는 남긴다.

예:

```ts
/**
 * point의 segment 위 clamped projection parameter t를 반환한다.
 *
 * t는 [0, 1]로 clamp되며, zero-length segment는 0을 반환한다.
 */
export function segClampedT(...) {
  // ...
}
```

## 함수 본문 주석

함수 본문 안에서는 `/** ... */` 블록 주석을 쓰지 않고 `// ...` 라인 주석을 사용한다.
라인 주석은 분기나 계산 블록의 의도를 설명할 때만 둔다.

좋은 예:

```ts
// strict <로 동거리일 때 앞쪽 segment를 유지한다.
if (dSq < bestDistSq) {
  bestDistSq = dSq;
}
```

피할 예:

```ts
// bestDistSq에 dSq를 대입한다.
bestDistSq = dSq;
```

## 타입 주석

public type, interface, enum은 이름만으로 도메인 의미가 충분히 드러나지 않으면 TSDoc을 둔다.
프로퍼티 주석은 타입 반복보다 단위, 상태값, nullable 의도, storage 정책을 설명한다.

프로퍼티 주석이 2개 이상이면 각 프로퍼티 사이에 빈 줄을 둔다.

```ts
interface BoundsWritable {
  /** 왼쪽 위 corner storage */
  min: XYWritable;

  /** 오른쪽 아래 corner storage */
  max: XYWritable;
}
```

## 파일 상단 주석

단일 public 함수만 담은 leaf module은 파일명과 함수명이 역할을 설명하므로 파일 상단 주석을
생략한다. 여러 helper가 모여 있거나 파일의 책임이 함수명만으로 드러나지 않는 경우에만 파일
상단 TSDoc을 사용한다.

## 금지 또는 정리 대상

- 완료된 작업에 남아 있는 `TASK-04에서 구현` 같은 작업 진행 메모
- `API-008`, `API-012` 같은 API 정책 ID를 source 주석에 적는 것. 정책 참조는 API 설계 문서,
  API surface 문서, 작업 문서에만 둔다.
- `S3-RM-029`, `S7-RM-004` 같은 roadmap item ID를 source 주석에 적는 것. roadmap 참조는
  ROADMAP, 프로젝트 상태, 작업 문서에만 둔다. 본 규칙은 `src/`에 한정한다. test 파일은
  작업 추적을 위해 RM ID 사용을 허용한다.
- 구현 한 줄을 그대로 반복하는 주석
- 실제 동작과 어긋난 오래된 주석
- public 함수 위의 여러 줄 `//` 계약 주석
- 함수 본문 내부의 `/** ... */` 블록 주석
