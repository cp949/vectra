import { deriveFunctionLeafExportsForDomain } from '../_helpers/source-surface';

/**
 * random domain leaf subpath 목록.
 *
 * 수동 목록 대신 source leaf export에서 contract fixture를 파생한다.
 */
export const randomLeafExports = deriveFunctionLeafExportsForDomain('random');
