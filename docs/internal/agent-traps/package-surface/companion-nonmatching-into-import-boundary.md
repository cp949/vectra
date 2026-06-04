# 이름이 다른 Into를 위임하는 companion은 import-boundary 자동 면제가 안 된다

태그: `companion`, `Into`, `import-boundary`, `package-surface`, `API-011`

## 함정

allocating companion이 대응 `*Into` leaf를 import하는 것은 API-011 예외로 허용된다. 하지만
`scripts/check-public-import-boundary.mjs`의 `isCompanionDelegation` 휴리스틱은
`toBase === fromBase + '-into'` **정확 일치**만 자동 면제한다.

companion 이름과 Into base 이름이 다르면 면제되지 않고 value import count에 잡힌다.

```txt
copy        → copyInto              (copy-into)            ✅ 자동 면제 (정확 일치)
identity    → identityInto          (identity-into)        ✅ 자동 면제
preMultiply → preMultiplyInto       (pre-multiply-into)    ✅ 자동 면제
translation → translationMatrixInto (translation-matrix-into)  ❌ 면제 안 됨
scaling     → scalingMatrixInto     (scaling-matrix-into)      ❌ 면제 안 됨
translate   → appendTranslateInto   (append-translate-into)    ❌ 면제 안 됨
scale       → appendScaleInto       (append-scale-into)        ❌ 면제 안 됨
rotate      → appendRotateInto      (append-rotate-into)       ❌ 면제 안 됨
```

builder 계열(`translationMatrixInto`, `scalingMatrixInto`, `rotationMatrixInto`)과 append 계열
(`appendTranslateInto` 등)의 companion이 짧은 이름(`translation`, `translate`)을 가질 때 발생한다.
기존 baseline에 섞으면 무관한 public leaf import까지 통과시킨다. 명시 예외로만 허용한다.

## 증상

```
# Public Import Boundary Check
value imports: 231 / 226
new public leaf imports detected
```

focused `typecheck` / `lint` / `test`는 모두 통과하므로 개발 중에는 드러나지 않고, 최종
`pnpm verify`(`import-boundary:check` task)에서야 실패한다.

## 방지

- companion을 추가하기 전에 대응 Into의 파일 base 이름이 `<companion>-into`와 정확히 일치하는지
  확인한다. 일치하지 않으면 import-boundary 자동 면제 대상이 아니다.
- 비일치 위임 companion을 추가하면 `scripts/check-public-import-boundary.mjs`의
  `companionDelegationAliases`에 `from leaf → to Into leaf`를 명시한다. `maxValuePublicImports`
  baseline은 올리지 않는다. 추가 함수가 모두 `<base>-into` 정확 일치이면 예외와 baseline 변경이
  필요 없다.
- 개발 중 focused 검증만으로는 안 잡히므로, companion을 다수 추가했다면 closeout 전에
  `pnpm verify`(또는 `pnpm --filter ... build && node scripts/check-public-import-boundary.mjs`)로
  미리 확인한다.

## 관련 작업

- `_works/S10-RM-001/20260529-01-matrix-companion-export-audit/함정.md` — matrix companion 8개 추가 시 발견.
  `translation`/`scaling`/`translate`/`scale`/`rotate` 5개가 비일치 위임이라
  `companionDelegationAliases` 명시 예외에 추가.
