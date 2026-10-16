import { describe, expect, test } from 'vitest';
import { deriveBarrelRuntimeExportNames, deriveDomainSurfaces } from './_helpers/source-surface';

// src 전체 TS 파싱은 테스트 본문 대신 수집 단계에서 한 번만 한다.
// 다른 *-subpaths 테스트도 fixture 정적 import로 수집 단계에서 파싱한다.
// 본문에 두면 병렬 부하에서 testTimeout 5000ms를 넘긴다.
const surfaces = await deriveDomainSurfaces();

describe('source surface drift', () => {
  test('source leaf runtime exports가 fixture에서 누락되지 않는다', () => {
    expect(surfaces.length).toBeGreaterThan(0);

    for (const { domain, sourceLeafExports, fixtureLeafExports } of surfaces) {
      expect(fixtureLeafExports, domain).toEqual(sourceLeafExports);
    }
  });

  test('source leaf runtime exports가 domain barrel에서 누락되지 않는다', () => {
    for (const { domain, sourceLeafExports } of surfaces) {
      const sourceExportNames = sourceLeafExports.map(({ exportName }) => exportName).sort();

      expect(deriveBarrelRuntimeExportNames(domain), domain).toEqual(sourceExportNames);
    }
  });
});
