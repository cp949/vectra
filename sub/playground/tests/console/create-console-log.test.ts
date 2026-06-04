import { describe, expect, it } from 'vitest';
import { createConsoleLog } from '../../src/console/create-console-log';

describe('createConsoleLog', () => {
  it('console-feed Message 형태의 로그 항목을 만든다', () => {
    const log = createConsoleLog({
      id: 'log-1',
      method: 'log',
      data: ['hello', { count: 2 }],
      timestamp: '2026-05-17T00:00:00.000Z',
    });

    expect(log).toEqual({
      id: 'log-1',
      method: 'log',
      data: ['hello', { count: 2 }],
      timestamp: '2026-05-17T00:00:00.000Z',
    });
  });
});
