import { describe, expect, test } from 'vitest';
import { deriveBarrelRuntimeExportNames, deriveDomainSurfaces } from './_helpers/source-surface';

describe('source surface drift', () => {
  test('source leaf runtime exports가 fixture에서 누락되지 않는다', async () => {
    const surfaces = await deriveDomainSurfaces();

    expect(surfaces.length).toBeGreaterThan(0);

    for (const { domain, sourceLeafExports, fixtureLeafExports } of surfaces) {
      expect(fixtureLeafExports, domain).toEqual(sourceLeafExports);
    }
  });

  test('source leaf runtime exports가 domain barrel에서 누락되지 않는다', async () => {
    const surfaces = await deriveDomainSurfaces();

    for (const { domain, sourceLeafExports } of surfaces) {
      const sourceExportNames = sourceLeafExports.map(({ exportName }) => exportName).sort();

      expect(deriveBarrelRuntimeExportNames(domain), domain).toEqual(sourceExportNames);
    }
  });
});
