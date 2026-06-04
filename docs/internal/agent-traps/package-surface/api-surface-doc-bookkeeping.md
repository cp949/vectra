# API surface 문서 bookkeeping 누적

태그: `package-surface`, `documentation`, `governance`, `companion-matrix`

## 함정

과거 API surface domain 문서를 갱신할 때 두 가지 반복 실수가 함께 발생한다.

### 1. "보류 / 추가 / 삭제" 표에 `implemented` 행 누적

함수를 구현했을 때 같은 문서 상단의 "구현 완료" 표에 행을 추가하면서
"보류 / 추가 / 삭제" 표의 기존 `planned` 행을 `implemented`로 판정만 바꾸고 그대로 둔다.
두 표에 동일 함수가 중복으로 적힌다.

```md
## 구현 완료
| `implemented` | `fromArray6Into`, `fromArray6`, `toArray6Into`, `toArray6` | array serialization |

## 보류 / 추가 / 삭제
| `fromArray6`, `toArray6` | `implemented` | S3-RM-026 TASK-02 완료 |  ← 중복
```

### 2. 보조 plain-text barrel catalog drift

API surface domain 문서 본문에 "현재 `sub/vectra/src/<domain>` barrel은 다음을 re-export한다"
같은 plain-text code block이 별도 catalog로 있을 때, 신규 함수를 "구현 완료"
표와 "API 상세" 표에는 추가하면서 plain-text block은 잊고 갱신하지 않는다.

```md
## API 상세

현재 `sub/vectra/src/random` barrel은 ... 다음 type도 re-export한다.

\`\`\`txt
random
float
int
...
weightedChoice
weightedRandomIndex
weightedProbability    ← weightedShuffle 누락
shuffleInPlace
\`\`\`
```

barrel index에는 이미 새 leaf가 있고 "구현 완료" 표도 갱신됐는데 보조 catalog만 stale.
같은 누락이 라운드마다 1~2건씩 누적되어 새 reader가 "어느 list가 canonical인지" 모르게 된다.

### 3. Companion 분류 표에 반환 타입 카테고리 다른 행 혼합

"Companion 함수 분류 (API-007)" 표는 반환 타입별 소단원("Matrix output", "Point/vector output",
"Rect/bounds output")으로 묶인다. 새로 추가한 함수의 반환 타입이 array tuple 같이 기존
소단원에 맞지 않는데도 가까운 Matrix output 표에 끼워 넣고 companion 열을 `—`로 두고
비고에 "companion은 `toArray6`"라고 적는 실수.

```md
Matrix output (반환 타입 `{ a; b; c; d; tx; ty }`):
| `toArray6Into` | — | `[number, ..., number]` | array output: companion은 `toArray6` |  ← 헤더와 행 어긋남
```

## 증상

- 같은 함수가 두 표에 적혀 단일 source 원칙이 깨진다. 다음 sweep에서 한 쪽만 갱신하면 drift.
- companion 분류 표의 열-비고 모순. 자동 검사/리뷰 신뢰도 저하.
- 새로 들어오는 reader가 어느 표가 canonical인지 판단하지 못한다.
- "후속 후보 상세 근거" code block에 구현된 함수가 후보로 남아 stale 후보처럼 보인다.

## 방지

함수 구현 후 API surface 문서를 갱신할 때:

1. **단일 source 원칙**: 구현 완료된 함수는 "구현 완료" 표 한 곳에만 두고, "보류 / 추가 / 삭제"
   표에서는 `implemented`로 옮기지 말고 행을 삭제한다. "보류 / 추가 / 삭제" 표는
   triage 후보만 유지한다. (예외: `implemented-review` 같이 추가 governance가 남은 경우만 유지)
2. **보조 plain-text catalog 동기화**: domain 문서에 plain-text barrel re-export block이
   별도로 있다면, 신규 leaf 추가 시 함께 갱신한다. 갱신을 누락하면 다음 sweep에서 누적 drift가
   발생한다. canonical은 항상 "구현 완료" 표지만, 보조 block을 두기로 결정한 도메인은 같은
   commit에서 같이 동기화한다. 보조 block 유지가 부담이면 해당 도메인 문서에서 plain-text
   block 자체를 제거하고 "구현 완료" 표와 "API 상세" 표만으로 운영한다.
3. **반환 타입 카테고리 분리**: Companion 분류 표에 추가하려는 함수의 반환 타입이 기존 소단원
   헤더("Matrix output", "Point/vector output", "Rect/bounds output")와 맞지 않으면
   같은 형식의 새 소단원("Array output (반환 타입 mutable number tuple)" 등)을 추가하고
   거기로 옮긴다. companion 열은 비우지 않는다.
4. **stale code block 안내**: "후속 후보 상세 근거" 같은 보존형 code block에 구현된 함수가
   포함되어 있으면, 그 섹션 시작 부분에 "canonical 상태는 본 문서 상단 '구현 완료' 표를 참고한다"
   같은 안내 메모를 한 줄 추가해 stale-but-historical 의도를 명시한다.
5. **출처 태그 일관성**: 같은 TASK에서 추가한 행은 비고의 출처 태그(`S3-RM-026` 등)를 모두
   채운다. 일부만 태그하면 후속 sweep에서 누락된 줄을 찾기 어렵다.
6. **boolean-primary Into 예외 함수의 companion 반환 타입 오기재**: Companion 분류 표의
   "companion 반환 타입" 열은 항상 companion 함수의 반환 타입이다. `averageInto`처럼
   boolean-primary Into 예외인 경우 Into 반환 타입(`boolean`)과 companion 반환 타입
   (`XYObjectWritable | undefined`)이 다르다. "companion 반환 타입" 열에 Into 반환 타입인
   `boolean`을 오기재하지 않는다. companion(`average`)의 반환 타입을 기재하고 비고에
   "boolean-primary Into 예외" 설명을 추가한다.

## 관련 작업

- `_works/S3-RM-026/20260522-01-matrix-follow-up/` Round 1 review에서 발견.
  - `matrix2d.md` "보류 / 추가 / 삭제" 표에 `implemented` 행 3개 중복 누적 → 제거
  - `matrix2d.md` "Companion 함수 분류"의 Matrix output 표에 `toArray*Into` array output 행이
    섞임 → 별도 "Array output" 소단원 분리
  - `matrix2d.md` "후속 후보 상세 근거" code block에 구현된 함수가 후보로 남음 → canonical 위치
    안내 메모 추가
- `_works/S1-RM-015/20260524-01-random-permutation-secure-source/` 사후 리뷰 4·5라운드에서
  발견. `random2.md` 본문 plain-text barrel re-export block에 신규 4개 leaf
  (`secureRandomSource`, `randomUint32`, `permutation`, `weightedShuffle`) 누락 →
  4·5라운드에서 추가. 이전 TASK 누적분 4개도 누락 상태로 follow-up cleanup으로 분리.
