import packageJson from '../../../../sub/vectra/package.json' with { type: 'json' };

const VECTRA_PACKAGE_NAME = packageJson.name;

function packageExportSpecifiers(): string[] {
  return Object.keys(packageJson.exports).map((key) => {
    return key === '.' ? VECTRA_PACKAGE_NAME : `${VECTRA_PACKAGE_NAME}/${key.slice(2)}`;
  });
}

const VECTRA_PACKAGE_EXPORT_SPECIFIERS = packageExportSpecifiers();

/** playground에서 허용하는 showcase import specifier 목록. */
export const SHOWCASE_ALLOWED_SPECIFIERS: readonly string[] = ['pixi.js', ...VECTRA_PACKAGE_EXPORT_SPECIFIERS];

/**
 * sandbox runtime에 실제로 등록하는 vectra module key.
 * pixi.js는 별도 pixiSandboxPlugin이 번들하므로 제외한다.
 */
export const SHOWCASE_RUNTIME_MODULE_SPECIFIERS: readonly string[] = SHOWCASE_ALLOWED_SPECIFIERS.filter(
  (s) => s !== 'pixi.js'
);
