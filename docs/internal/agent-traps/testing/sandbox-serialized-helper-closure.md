# Sandbox 직렬화 함수의 클로저 helper 누락

태그: `testing`, `sandbox`, `examples`, `serialization`

## 함정

iframe sandbox에 API object를 주입하기 위해 메서드를 `Function#toString()`으로 직렬화하면,
원본 모듈의 클로저는 함께 넘어가지 않는다.

메서드 본문이 `readSegmentA`, `readBoundsMin` 같은 module-local helper를 참조하면, iframe 안에는
해당 helper를 별도로 삽입해야 한다. TypeScript typecheck와 원본 모듈 unit test는 통과해도
sandbox 런타임에서만 깨질 수 있다.

## 증상

예제 앱에서 compile은 성공하지만 preview diagnostics에 다음 형태의 런타임 오류가 뜬다.

```txt
readSegmentA is not defined
```

또는 새 draw API 메서드만 빈 화면/오류가 나고, 같은 메서드를 원본 모듈에서 직접 호출하는 테스트는
통과한다.

## 방지

직렬화 대상 메서드가 참조하는 helper를 추가하거나 변경할 때는 runner helper 문자열도 함께 갱신한다.

Canvas demo 기준:

- 원본 구현: `apps/canvas-demo/src/canvas/draw.ts`
- iframe helper 직렬화: `apps/canvas-demo/src/canvas/serialize-draw-api.ts`
- 회귀 테스트: `apps/canvas-demo/src/canvas/draw.test.ts`

새 draw API 메서드나 helper를 추가하면, 원본 호출 테스트만 만들지 말고 직렬화된 API를 `new Function`
환경에서 실행하는 테스트를 추가한다. 이 테스트는 iframe처럼 원본 모듈 클로저가 없는 환경을 재현한다.

## 관련 작업

- `canvas-demo:quick-start`에서 `draw.segment()` 실행 시 `readSegmentA is not defined` 발생.
