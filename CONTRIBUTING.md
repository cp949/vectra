# 기여 안내

## 이슈

- 버그와 기능 요청은 [GitHub Issues](https://github.com/cp949/vectra/issues)에 올린다.
- 버그는 재현 입력, 관찰한 결과, 기대한 결과를 적는다.
- 기능 요청은 사용 시나리오를 적는다.
- PR만으로 기능을 요청하지 않는다. 이슈를 먼저 연다.
- 보안 문제는 공개 이슈로 올리지 않는다. [SECURITY.md](./SECURITY.md)를 따른다.

## 개발 환경

- Node.js `>=24.18.0`
- pnpm `10.17.1`

```sh
pnpm install
```

## 검증

수정한 package의 명령을 먼저 실행한다.

```sh
pnpm --filter @cp949/vectra typecheck
pnpm --filter @cp949/vectra lint
pnpm --filter @cp949/vectra test
```

변경을 올리기 전에 루트에서 전체 검증을 실행한다.

```sh
pnpm verify
```

## 변경 기준

- 패키지 사용자에게 보이는 변경은 `CHANGELOG.md`의 `## [Unreleased]`에 항목을 추가한다.
- 제품 범위와 비범위는 [제품 범위](./docs/internal/product-scope.md)를 따른다.
- API 형태와 `Into` 규칙은 [API 설계](./docs/internal/api-design.md)를 따른다.
- 주석과 문서 문장 규칙은 [writing-styles](./docs/agents/writing-styles.md)를 따른다.

## 내부 문서

설계, 정책, 검증 절차의 전체 색인은 [docs/internal/README.md](./docs/internal/README.md)에 있다.
