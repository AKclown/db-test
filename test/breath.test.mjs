import assert from 'node:assert/strict';
import test from 'node:test';
import { breathAt } from '../src/breath.ts';

test('a minute starts with an inhale, cycles, and ends without another prompt', () => {
  assert.deepEqual(breathAt(0), { phase: 'inhale', seconds: 60, scale: 0 });
  assert.equal(breathAt(3999).phase, 'inhale');
  assert.deepEqual(breathAt(4000), { phase: 'exhale', seconds: 56, scale: 1 });
  assert.ok(Math.abs(breathAt(6000).scale - 0.5) < 0.0001);
  assert.equal(breathAt(8000).phase, 'inhale');
  assert.equal(breathAt(59999).seconds, 1);
  assert.deepEqual(breathAt(60000), { phase: 'done', seconds: 0, scale: 0 });
});
