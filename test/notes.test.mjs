import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeNotes } from '../src/noteData.ts';

test('local records round-trip, with nothing written for a missing storage entry', () => {
  const notes = [{ id: '1', body: '交付时间', next: '', createdAt: 1764028800000 }];
  assert.deepEqual(decodeNotes(JSON.stringify(notes)), notes);
  assert.deepEqual(decodeNotes(null), []);
});

test('unreadable storage throws so it cannot be overwritten as an empty list', () => {
  assert.throws(() => decodeNotes('bad json'));
  assert.throws(() => decodeNotes('[{"id":"1","body":8}]'));
  assert.throws(() => decodeNotes('{}'));
});
