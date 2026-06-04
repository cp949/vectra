# 계획서 도메인 현황 작성 시 barrel 파일 미확인

태그: `planning`, `barrel`, `domain-survey`, `function-list`

## 함정

계획서 "사전 검토: 도메인 현황" 섹션에서 기존 함수 목록을 기억이나 추정으로 작성하는 실수.
실제 barrel(`index.ts`)을 읽지 않으면 존재하지 않는 함수가 포함되거나, 실제 함수가 누락된다.

```
# 함정 예시 (01-계획.md 사전 검토)
- 기존 boolean query: `containsPoint`, `containsRect`, `containsCircle`,
  `intersectsCircle`, `intersectsRect`, `intersectsSegment`   ← 실제로 없는 함수
- 기존 relation: `isDegenerate`, `isParallel`, `isCollinear`,
  `intersectsInfiniteLine`, `singleIntersectionInto`           ← intersectsInfiniteLine 없음
```

## 증상

- TASK-01 같은 policy 확정 TASK가 "기존 `intersects` 함수와의 일관성"을 근거로 잘못된 정책을 도출한다.
- 계획서를 읽은 구현 agent가 존재하지 않는 함수에 의존하는 코드를 작성한다.
- 사전 검토 목록과 실제 barrel이 달라 혼란이 발생한다.

## 방지

계획서 작성 시 도메인 현황 섹션에 함수 목록을 적기 전에 반드시 barrel 파일을 직접 읽는다.

```sh
# circle 도메인 확인
cat sub/vectra/src/circle/index.ts

# infinite-line 도메인 확인
cat sub/vectra/src/infinite-line/index.ts
```

목록을 barrel 출력에서 복사하거나, 기재 후 barrel과 diff 확인을 거친다.

동시에, 계획서 범위 표와 "구현/조사 방향" 섹션에 같은 함수 시그니처를 적는 경우 두 섹션이
서로 일치하는지 작성 직후 교차 확인한다 (예: 범위 표에 `sagitta(circle, chordLength)`, 구현
방향에 `centralAngle` 추천이 공존하면 모순).

## 관련 작업

- `_works/S3-RM-027/20260522-01-circle-line-follow-up/` (01-계획.md 사전 검토 리뷰)
