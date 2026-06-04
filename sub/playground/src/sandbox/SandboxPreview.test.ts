import { describe, expect, it } from 'vitest';
import { PLAYGROUND_SANDBOX_PERMISSIONS } from './SandboxPreview';

describe('SandboxPreview sandbox 권한', () => {
  it('srcdoc iframe origin이 null이 되지 않도록 same-origin을 허용한다', () => {
    expect(PLAYGROUND_SANDBOX_PERMISSIONS).toBe('allow-scripts allow-same-origin');
  });
});
