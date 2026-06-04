import { deriveFunctionLeafExportsForDomain } from '../_helpers/source-surface';

/**
 * intersects domain leaf subpath 목록.
 *
 * intersects는 함수 수가 많고 변경 빈도가 높아서 수동 목록 대신 source leaf export에서 파생한다.
 * 이 파일은 다른 contract test와 agent가 기대하는 `*-leaf-exports.ts` 진입점을 보존한다.
 */
export const intersectsLeafExports = deriveFunctionLeafExportsForDomain('intersects');
