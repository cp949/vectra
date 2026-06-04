import { deriveFunctionLeafExportsForDomain } from '../_helpers/source-surface';

/**
 * fitting domain leaf subpath 목록.
 *
 * 수동 목록 대신 source leaf export에서 파생한다.
 * 이 파일은 contract test와 agent가 기대하는 `*-leaf-exports.ts` 진입점을 보존한다.
 */
export const fittingLeafExports = deriveFunctionLeafExportsForDomain('fitting');
