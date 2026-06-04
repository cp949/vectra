import { describe, expect, it } from 'vitest';
import { assertUniqueExampleIds, findExampleById, isExampleIdSlug } from './ids';
import type { PlaygroundExample } from './types';

const example = (id: string): PlaygroundExample => ({
  id,
  title: id,
  categoryId: 'test',
  source: { language: 'ts', code: '' },
});

describe('example id helpers', () => {
  it('normal slug id를 허용한다', () => {
    expect(isExampleIdSlug('quick-start')).toBe(true);
    expect(isExampleIdSlug('a0-b1-c2')).toBe(true);
    expect(isExampleIdSlug('orbit1')).toBe(true);
  });

  it('invalid slug id를 거부한다', () => {
    expect(isExampleIdSlug('Quick-Start')).toBe(false);
    expect(isExampleIdSlug('quick_start')).toBe(false);
    expect(isExampleIdSlug('-quick-start')).toBe(false);
    expect(isExampleIdSlug('quick-start-')).toBe(false);
    expect(isExampleIdSlug('quick--start')).toBe(false);
    expect(isExampleIdSlug('')).toBe(false);
  });

  it('invalid slug id를 만나면 예외를 던진다', () => {
    expect(() => assertUniqueExampleIds([example('quick_start')])).toThrowError('Invalid example id slug: quick_start');
  });

  it('duplicate id를 만나면 예외를 던진다', () => {
    expect(() => assertUniqueExampleIds([example('quick-start'), example('quick-start')])).toThrowError(
      'Duplicate example id: quick-start'
    );
  });

  it('id로 example을 찾는다', () => {
    const examples = [example('quick-start'), example('segment-snap')];

    expect(findExampleById(examples, 'segment-snap')).toBe(examples[1]);
    expect(findExampleById(examples, 'missing')).toBeUndefined();
  });
});
