# 개별 leaf 테스트 파일에 파일 overview 주석 누락

태그: `test-style`, `file-overview`, `block-comment`, `consistency`

## 함정

leaf 단위로 새 테스트 파일을 추가할 때 파일 상단의 `/** ... */` overview 블록 주석을 누락하기
쉽다. 테스트 자체는 통과하므로 CI에서 걸리지 않고 리뷰 단계에서만 발견된다.

같은 TASK 배치 내에서도 먼저 작성한 테스트 파일에 주석을 붙이고 나중에 작성한 파일에 빠뜨리는
식으로 절반만 적용되는 경우가 많다 (S3-RM-025에서 bounds 테스트 2개에는 있었고 rect 테스트 6개
에는 없었다).

## 형식

```ts
/**
 * <domain>.<fnName> — 한 줄 요약 설명.
 *
 * 검증: 주요 케이스 나열 (e.g., 정상 동작, degenerate 입력, aliasing, 반환값).
 */
```

첫 줄: `<domain>.<fnName> — <무엇을 계산/기록하는지 한 줄>`.
두 번째 단락: `검증: ` 접두사로 시작하는 핵심 test scenario 열거.

## 방지

새 leaf 테스트 파일을 만들 때 imports 위에 `/** ... */` overview 주석을 먼저 작성한다.
같은 배치의 형제 테스트 파일을 한 번 열어 주석 형식을 확인하고 맞춘다.

**기존 파일 수정 시에도 동일하게 적용한다.** 기존 테스트 파일에 테스트를 추가하거나 내용을
변경할 때 파일 개요 주석이 없으면 같은 커밋에서 추가한다. "신규 파일을 만들 때만" 해당하는
규칙이 아니다.

## 관련 작업

- `_works/S3-RM-034/20260524-01-vec-component-simple-follow-up/` Round 1 review에서 발견.
  - `arithmetic.test.ts`(기존 파일): `directionToInto`/`normalLeftInto`/`normalRightInto` 테스트
    추가 시 파일 개요 주석이 없었음 → 파일 수정 시에도 없으면 추가로 확장.
