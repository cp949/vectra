import packageJson from '../../../../sub/vectra/package.json' with { type: 'json' };

const VECTRA_PACKAGE_NAME = packageJson.name;

function packageExportSpecifiers(): string[] {
  return Object.keys(packageJson.exports).map((key) => {
    return key === '.' ? VECTRA_PACKAGE_NAME : `${VECTRA_PACKAGE_NAME}/${key.slice(2)}`;
  });
}

/** playground에서 허용하는 vectra import specifier 목록. */
export const PIXI_ALLOWED_SPECIFIERS: readonly string[] = packageExportSpecifiers();

/**
 * sandbox runtime에 실제로 등록하는 vectra module key.
 *
 * compileForSandbox는 import specifier를 그대로 `__modules__` key로 참조한다.
 * 패키지 exports가 domain barrel만 열기 때문에 leaf specifier는 allowlist에서 거부된다.
 */
export const PIXI_RUNTIME_MODULE_SPECIFIERS: readonly string[] = PIXI_ALLOWED_SPECIFIERS;
