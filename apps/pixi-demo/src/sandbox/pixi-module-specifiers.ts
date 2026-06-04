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
 * compileForSandbox는 namespace import를 그대로 domain barrel key로 참조하고,
 * leaf import는 domain barrel key로 변환한다.
 * 예: `@cp949/vectra/circle/closest-point-into` → `__modules__['@cp949/vectra/circle']`
 */
export const PIXI_RUNTIME_MODULE_SPECIFIERS: readonly string[] = PIXI_ALLOWED_SPECIFIERS;
