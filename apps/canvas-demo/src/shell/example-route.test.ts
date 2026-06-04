import { describe, expect, it } from 'vitest';
import { EXAMPLES } from '../examples/catalog';
import { getExampleRoute, toExamplePath } from './example-route';

describe('canvas example route', () => {
  it('/ 경로는 index route로 해석한다', () => {
    expect(getExampleRoute('/', EXAMPLES)).toEqual({ kind: 'index' });
  });

  it('/segment-snap 경로는 Segment Snap example route로 해석한다', () => {
    const route = getExampleRoute('/segment-snap', EXAMPLES);

    expect(route.kind).toBe('example');
    if (route.kind !== 'example') return;
    expect(route.example.id).toBe('segment-snap');
    expect(route.example.title).toBe('Segment Snap');
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
    expect(toExamplePath('segment-snap')).toBe('/segment-snap');
  });
});
