import { describe, expect, it } from 'vitest';
import { EXAMPLES } from '../examples/catalog';
import { getExampleRoute, toExamplePath } from './example-route';

describe('pixi demo examples', () => {
  it('shell v2를 위한 선택된 예제 source를 유지한다', () => {
    const first = EXAMPLES[0];

    expect(first?.source.language).toBe('ts');
    expect(first?.source.code.length).toBeGreaterThan(100);
  });
});

describe('pixi example route', () => {
  it('/ 경로는 index route로 해석한다', () => {
    expect(getExampleRoute('/', EXAMPLES)).toEqual({ kind: 'index' });
  });

  it('/orbit-segment 경로는 Orbit Segment example route로 해석한다', () => {
    const route = getExampleRoute('/orbit-segment', EXAMPLES);

    expect(route.kind).toBe('example');
    if (route.kind !== 'example') return;
    expect(route.example.id).toBe('orbit-segment');
    expect(route.example.title).toBe('Orbit Segment');
  });

  it('/missing-example 경로는 not-found route로 해석한다', () => {
    expect(getExampleRoute('/missing-example', EXAMPLES)).toEqual({
      kind: 'not-found',
      requestedId: 'missing-example',
    });
  });

  it('/bad_slug 경로는 not-found route로 해석한다', () => {
    expect(getExampleRoute('/bad_slug', EXAMPLES)).toEqual({
      kind: 'not-found',
      requestedId: 'bad_slug',
    });
  });

  it('malformed percent-encoded 경로는 not-found route로 해석한다', () => {
    expect(getExampleRoute('/%E0%A4%A', EXAMPLES)).toEqual({
      kind: 'not-found',
      requestedId: '%E0%A4%A',
    });
  });

  it('example id를 URL path로 변환한다', () => {
    expect(toExamplePath('orbit-segment')).toBe('/orbit-segment');
  });
});
