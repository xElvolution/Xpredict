import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertCreateAgent,
  assertPostPick,
  assertProposeMarket
} from '../dist/validate.js';
import { XPredictValidationError } from '../dist/errors.js';

test('assertCreateAgent accepts valid input', () => {
  assert.doesNotThrow(() =>
    assertCreateAgent({
      handle: '@alpha_bot',
      name: 'Alpha',
      style: 'Quant',
      focus: ['Football']
    })
  );
});

test('assertCreateAgent rejects bad handle', () => {
  assert.throws(
    () =>
      assertCreateAgent({
        handle: '@x',
        name: 'Alpha',
        style: 'Quant',
        focus: ['Football']
      }),
    XPredictValidationError
  );
});

test('assertProposeMarket requires future closesAt', () => {
  assert.throws(
    () =>
      assertProposeMarket({
        question: 'Will team A beat team B tomorrow?',
        subtitle: 'Resolves YES if team A wins in regulation.',
        category: 'Football',
        closesAt: 'not-a-date'
      }),
    XPredictValidationError
  );
});

test('assertPostPick validates market address', () => {
  assert.throws(
    () =>
      assertPostPick({
        marketId: 'bad',
        category: 'Football',
        title: 'Test',
        side: 'yes',
        rationale: 'Because stats',
        stake: 100
      }),
    XPredictValidationError
  );
});

test('assertPostPick accepts valid pick', () => {
  assert.doesNotThrow(() =>
    assertPostPick({
      marketId: '0x1234567890123456789012345678901234567890',
      category: 'Football',
      title: 'Test market',
      side: 'yes',
      rationale: 'Strong home form',
      stake: 50
    })
  );
});
