# uncovered alias leaf는 개념이 비어 있다는 뜻이 아니다

태그: `examples`, `pixi-demo`, `coverage`, `selection`

## 함정

`pnpm examples:coverage`의 uncovered leaf 목록만 보고 새 예제 대상을 고르면, 그 leaf가 다른 covered
함수의 **alias / companion / 다른 도메인 래퍼**일 때 개념이 이미 완전히 커버됐는데도 중복 예제를
만들게 된다.

예: `vec/moveToward`는 coverage상 uncovered였지만, 실제로는 `interpolation/moveTowardPoint`의 도메인
alias다. 그리고 `interpolation/moveTowardPoint`는 `cursor-chase` 예제가 이미 시연하고 있었다(등속
seek + 정확 도착 + 도착 반경, out-buffer 재사용까지 동일). `vec/moveToward` 예제를 만들면 namespace만
다른 같은 개념의 복제가 된다.

leaf coverage는 "이 leaf 이름이 어느 예제에 등장하는가"를 셀 뿐, "이 계산 개념이 시연됐는가"를 세지
않는다. alias·companion·shared kernel은 이름이 달라 따로 uncovered로 잡힌다.

## 증상

- 후보 leaf의 source가 다른 leaf로 곧장 위임한다(`return otherDomainFn(...)` 한 줄짜리 alias).
- 후보 함수와 같은 내부 kernel을 쓰는 함수가 이미 covered다.
- 작성 중인 예제의 화면 설계가 기존 예제와 거의 같아진다(같은 조작 대상, 같은 diagnostics).
- 기존 예제와의 차이를 적으려는데 "namespace가 다르다" "import 경로가 다르다" 외에 geometry 관계
  차이를 못 적는다.

## 방지

새 예제 leaf를 확정하기 전에 다음을 확인한다.

1. 후보 leaf의 source를 연다. 다른 함수로 위임하는 alias/companion이면 그 **delegate 함수**의 coverage를
   본다.
2. delegate(또는 후보 자신)를 기존 예제 source가 쓰는지 grep한다.

   ```sh
   grep -rl "moveTowardPoint\|moveToward" apps/*/src/examples/*/source.exam.ts
   ```

3. 같은 계산 개념을 보이는 예제가 이미 있으면 새 예제를 만들지 않고 연결만 남긴다(README "기존 예제가
   이미 충분히 설명하는 함수는 새 예제를 만들지 않고 연결만 남긴다").

coverage gap은 backlog 신호일 뿐 중복 예제를 정당화하지 않는다. uncovered가 가리키는 것은 "이 leaf
이름"이지 "비어 있는 개념"이 아니다.

## 계획서 체크

`01-계획.md`의 "기존 예제와 분리" 항목에 geometry 관계 차이를 한 문장으로 적을 수 있어야 한다.
차이가 namespace/import 경로뿐이면 중복이므로 다른 leaf를 고른다.

## 발견 맥락

- `_works/S1-RM-013/20260525-82-segment-point-at-length-example/`:
  처음 `vec/moveToward`를 후보로 잡았으나 `cursor-chase`가 이미 `interpolation/moveTowardPoint`를
  시연 중임을 확인하고 폐기, `segment/pointAtLength`(어느 예제도 쓰지 않는 빈 개념)로 전환했다.
