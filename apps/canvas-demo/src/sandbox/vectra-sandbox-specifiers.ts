import packageJson from '../../../../sub/vectra/package.json' with { type: 'json' };

const VECTRA_PACKAGE_NAME = packageJson.name;

function packageExportSpecifiers(): string[] {
  return Object.keys(packageJson.exports).map((key) => {
    return key === '.' ? VECTRA_PACKAGE_NAME : `${VECTRA_PACKAGE_NAME}/${key.slice(2)}`;
  });
}

/** sandbox iframe에 실제로 주입하는 vectra public package export specifier 목록 */
export const VECTRA_SANDBOX_BARREL_SPECIFIERS: readonly string[] = packageExportSpecifiers();

/**
 * playground에서 허용하는 vectra import specifier 목록.
 *
 * compileForSandbox의 allowedSpecifiers로 전달한다.
 */
export const VECTRA_ALLOWED_SPECIFIERS: readonly string[] = VECTRA_SANDBOX_BARREL_SPECIFIERS;
