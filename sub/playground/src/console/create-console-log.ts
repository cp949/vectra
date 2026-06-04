import type { CreateConsoleLogInput, PlaygroundConsoleLog } from './types';

/** console-feed 렌더러가 소비할 수 있는 로그 항목을 만든다 */
export function createConsoleLog(input: CreateConsoleLogInput): PlaygroundConsoleLog {
  return {
    id: input.id,
    method: input.method,
    data: [...input.data],
    timestamp: input.timestamp,
  };
}
