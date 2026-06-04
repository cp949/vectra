import type { Message, Methods } from '@cp949/console-feed';

/** playground에서 표시하는 console-feed 호환 로그 항목 */
export interface PlaygroundConsoleLog extends Message {
  /** 로그 항목 식별자 */
  readonly id: string;
  /** console 메서드 */
  readonly method: Methods;
  /** console 인자 목록 */
  readonly data: unknown[];
  /** 로그 발생 시각 */
  readonly timestamp: string;
}

/** console log 생성 입력 */
export interface CreateConsoleLogInput {
  /** 로그 항목 식별자 */
  readonly id: string;
  /** console 메서드 */
  readonly method: Methods;
  /** console 인자 목록 */
  readonly data: unknown[];
  /** 로그 발생 시각 */
  readonly timestamp: string;
}
