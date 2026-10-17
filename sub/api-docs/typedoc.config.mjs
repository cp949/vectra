import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const vectraRoot = new URL('../vectra/', import.meta.url);
const { exports: packageExports } = JSON.parse(readFileSync(new URL('package.json', vectraRoot), 'utf8'));

// 문서 대상은 package.json exports와 같다. './package.json'은 모듈이 아니므로 제외한다.
const entryPoints = Object.keys(packageExports)
  .filter((subpath) => subpath !== './package.json')
  .map((subpath) => {
    const srcDir = subpath === '.' ? 'src' : `src/${subpath.slice(2)}`;
    return fileURLToPath(new URL(`${srcDir}/index.ts`, vectraRoot));
  });

export default {
  name: '@cp949/vectra',
  entryPoints,
  entryPointStrategy: 'resolve',
  tsconfig: './tsconfig.json',
  // 타입 검사는 @cp949/vectra의 typecheck가 소유한다. 여기서는 node 타입 없이 문서만 만든다.
  skipErrorChecking: true,
  out: './docs-api',
  // option 타입은 domain barrel에서 export하지 않는다. 공개 surface는 문서 때문에 바꾸지 않는다.
  validation: { notExported: false },
  readme: 'none',
  githubPages: true,
};
