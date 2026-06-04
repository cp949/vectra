import { expect, test } from 'vitest';
import * as sourceBarrel from '../../src/easing/index';
import { easingLeafExports } from './_fixtures/easing-leaf-exports';
import { assertFunctionDomainSubpathExports } from './_helpers/domain-subpath-contract';

assertFunctionDomainSubpathExports({
  domain: 'easing',
  sourceBarrel,
  leafExports: easingLeafExports,
});

test('same-domain duplicate alias를 export하지 않는다', async () => {
  const sameDomainAliasNames = [
    'quadraticIn',
    'quadraticOut',
    'quadraticInOut',
    'exponentialIn',
    'exponentialOut',
    'exponentialInOut',
    'circularIn',
    'circularOut',
    'circularInOut',
    'easeInSine',
    'easeOutSine',
    'easeInOutSine',
    'easeInQuad',
    'easeOutQuad',
    'easeInOutQuad',
    'easeInCubic',
    'easeOutCubic',
    'easeInOutCubic',
    'easeInQuart',
    'easeOutQuart',
    'easeInOutQuart',
    'easeInQuint',
    'easeOutQuint',
    'easeInOutQuint',
    'easeInExpo',
    'easeOutExpo',
    'easeInOutExpo',
    'easeInCirc',
    'easeOutCirc',
    'easeInOutCirc',
    'easeInBack',
    'easeOutBack',
    'easeInOutBack',
    'easeInBounce',
    'easeOutBounce',
    'easeInOutBounce',
    'easeInElastic',
    'easeOutElastic',
    'easeInOutElastic',
  ];

  for (const fnName of sameDomainAliasNames) {
    expect(fnName in sourceBarrel).toBe(false);
  }
});
