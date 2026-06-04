import * as sourceBarrel from '../../src/editor-geometry/index';
import { editorGeometryLeafExports } from './_fixtures/editor-geometry-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'editor-geometry',
  sourceBarrel,
  leafExports: editorGeometryLeafExports,
  includeDist: true,
  dedupeExpectedExports: true,
});
