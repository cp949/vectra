/** 예제를 식별하는 고유 ID */
export type PlaygroundExampleId = string;

/** 예제의 표시 상태 */
export type PlaygroundExampleStatus = 'ready' | 'draft' | 'disabled';

/** 예제 소스 코드 정보 */
export interface PlaygroundExampleSource {
  readonly language: 'ts';
  readonly code: string;
}

/**
 * 단일 playground 예제 메타데이터
 *
 * `RuntimeSeed`는 예제 실행 시 주입할 초기 데이터 형태를 나타낸다.
 */
export interface PlaygroundExample<RuntimeSeed = unknown> {
  readonly id: PlaygroundExampleId;
  readonly title: string;
  readonly description?: string;
  readonly categoryId: string;
  readonly source: PlaygroundExampleSource;
  /** 예제가 사용하는 모듈 specifier 목록 */
  readonly imports?: readonly string[];
  readonly tags?: readonly string[];
  readonly status?: PlaygroundExampleStatus;
  readonly runtimeSeed?: RuntimeSeed;
}

/** 예제를 묶는 카테고리 */
export interface PlaygroundCategory {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  /** 카테고리 목록에서 표시 순서 */
  readonly order: number;
  readonly defaultExpanded?: boolean;
}
