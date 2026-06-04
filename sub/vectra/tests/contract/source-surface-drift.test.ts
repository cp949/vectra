import { describe, expect, test } from 'vitest';
import {
  deriveBarrelRuntimeExportNames,
  deriveDomainSurfaces,
  deriveFunctionLeafExportsForDomain,
  deriveSourceLeafExportsForDomain,
} from './_helpers/source-surface';

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

  test('function leaf fixture helper가 exportName을 fnName으로 변환한다', () => {
    const sourceLeafExports = deriveSourceLeafExportsForDomain('intersects');
    const functionLeafExports = deriveFunctionLeafExportsForDomain('intersects');

    expect(functionLeafExports).toEqual(
      sourceLeafExports.map(({ exportName, leafPath }) => ({
        fnName: exportName,
        leafPath,
      }))
    );
  });
});
