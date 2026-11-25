# readonly tuple narrowing

태그: `typescript`, `tuple`, `type-guard`

## 함정

`readonly [number, number]` 같은 readonly tuple이 포함된 union에서는 `Array.isArray`를 직접
조건식으로 쓰는 것만으로 object branch가 원하는 형태로 좁혀지지 않을 수 있다.

## 증상

tuple branch가 아닌 곳에서 object property에 접근할 때 `tsc --noEmit`이 다음 형태의 오류를
낸다.

```txt
Property 'x' does not exist on type 'XYInput'.
Property 'x' does not exist on type 'XYTuple'.
```

## 방지

좌표를 읽는 internal helper에서는 `Array.isArray` type guard로 tuple branch와 object branch를 분리한다.

```ts
function isXYTuple(input: XYInput): input is readonly [number, number] {
  return Array.isArray(input);
}
```

`readX`/`readY`를 field 우선(`const x = input.x; return x !== undefined ? x : input[0]`)으로 바꾸지 않는다.

- 단일 모양 입력만 쓰는 미세 벤치에서는 field 우선이 약 3배 빠르다.
- `readX`는 라이브러리 전체가 공유한다. `input.x` 인라인 캐시가 tuple, 객체, class instance를 모두 보면 느려진다.
- 그러면 tuple polyline 순회가 느려진다. `pointAtLengthInto` 1000회가 21.7ms에서 28ms로, `sampleFixedCount`가 15.1ms에서 19.6ms로 늘었다.
- 같은 tuple 순회가 모양 1종 0.63ns, 2종 3.1ns, 3종 4.2ns, 8종 9.9ns/호출이다. `Array.isArray`는 2.0~2.4ns로 일정하다.
- `Array.isArray`가 tuple 경로와 object 경로의 인라인 캐시를 나눈다.
- 변형 `i[0]` 우선, `i.length === 2` 판별도 오염된 프로세스에서 `Array.isArray`보다 느렸다.

공유 reader가 느린 이유는 다른 호출자의 입력 모양이 캐시를 오염시키는 것이다. 한 함수 가족만 부르는 전용 reader 파일로 나누면 이 오염을 피한다.

- 전용 reader는 `Array.isArray` 우선으로 쓴다. field 우선은 같은 가족을 객체와 tuple로 섞어 부르면 느려진다.
- polygon `area` 계열 1000회(24점): 공유 reader 약 1.7ms, 전용 field 우선 약 0.17ms(단일 모양)·0.8~0.9ms(섞음), 전용 `Array.isArray` 우선 약 0.3ms(모든 경우).
- `ray*HitT`의 전용 reader는 field 우선이다. 전용 reader를 만들 때는 같은 가족에 모양을 섞은 프로세스를 먼저 재고 방식을 고른다.

짧은 함수는 reader 파일 대신 함수 안에서 판별한다(`vec` 산술 함수, ray 점 반환 함수).

- `Array.isArray`로 입력과 output이 모두 object인지 먼저 본다. 맞으면 `a.x`를 함수 본문에서 직접 읽는다. 아니면 별도 함수로 보낸다.
- 이 함수의 `.x` 인라인 캐시에는 object 모양만 남는다. tuple은 캐시에 들어가지 않는다. 입력 해석은 공유 reader와 같다.
- 배열 경로는 `readX`를 부르지 않고 `Array.isArray`로 직접 판별한다. 배열 경로를 reader 호출로 쓰면 inlining 예산을 먼저 쓴다.
- 배열 경로가 warm-up에서 자주 불리면 V8이 그 경로를 object 경로 대신 inline한다. 호출자 안의 주 함수가 inline되지 않는다.
- 은하 3000(subInto, lengthSq, addScaledInto), 다른 함수와 같은 함수를 여러 모양으로 먼저 부른 프로세스: 배열 경로가 reader 호출이면 이전 구현의 약 0.86배, 직접 판별이면 약 1.45배다.

## 관련 작업

- `S1-RM-001: Internal XY primitive helpers`
