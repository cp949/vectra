import { deriveFunctionLeafExportsForDomain } from '../_helpers/source-surface';

/**
 * path domain leaf subpath 목록.
 *
 * 수동 목록 대신 source leaf export에서 contract fixture를 파생한다.
 */
export const pathLeafExports = deriveFunctionLeafExportsForDomain('path');
