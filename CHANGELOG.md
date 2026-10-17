# Changelog

이 프로젝트의 주요 변경 사항을 기록한다.

형식은 [Keep a Changelog](https://keepachangelog.com/)를 따른다.
배포하는 패키지 `@cp949/vectra`는 Semantic Versioning을 따른다.

## [Unreleased]

- linalg `rowEchelonForm`과 `rowEchelonFormInto`가 `-0` 입력에서 `-0`을 남기던 문제를 고친다. JSDoc 약속대로 `0`을 반환한다.
- curve GL5 적분 상수를 소수 10자리에서 double 정밀도의 정확한 값으로 고친다. 곡선 길이와 `tAtLength` 결과가 약 1e-10 달라진다. 직선 곡선의 길이가 chord와 일치한다.

## [1.1.0] - 2026-10-17

- Node.js 최소 지원 버전을 24.18로 상향한다. 런타임 코드는 바뀌지 않는다.
- 빌드 도구를 tsup에서 tsdown으로 교체한다. 공개 entry와 export는 그대로다.
- dist를 root와 domain barrel 단위로만 만든다. leaf 단위 dist 파일은 없어진다. 패키지 파일은 6,079개에서 212개로, 압축 크기는 2.3 MB에서 1.6 MB로 줄어든다. `exports`를 우회해 `dist/<domain>/<leaf>.js`를 직접 import하던 코드는 domain subpath(`@cp949/vectra/<domain>`)로 바꿔야 한다.
- 개발 의존성을 같은 메이저 안에서 갱신한다. vitest는 5로 올린다.
- 배포에 `release-it`을 도입한다. [RELEASING.md](RELEASING.md)를 본다.
