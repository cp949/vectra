# Changelog

이 프로젝트의 주요 변경 사항을 기록한다.

형식은 [Keep a Changelog](https://keepachangelog.com/)를 따른다.
배포하는 패키지 `@cp949/vectra`는 Semantic Versioning을 따른다.

## [Unreleased]

- Node.js 최소 지원 버전을 24.18로 상향한다. 런타임 코드는 바뀌지 않는다.
- 빌드 도구를 tsup에서 tsdown으로 교체한다. 공개 entry와 export는 그대로다. chunk 파일 이름만 달라진다.
- 개발 의존성을 같은 메이저 안에서 갱신한다. vitest는 5로 올린다.
- 배포에 `release-it`을 도입한다. [RELEASING.md](RELEASING.md)를 본다.
