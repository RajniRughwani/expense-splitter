import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, amountToCents, saveExpense, deleteExpense, allocateShares, calculateSummary } from '../src/model.js';

test('new group starts with three people and no spending', () => {
  const state = createInitialState();
  assert.equal(state.participants.length, 3);
  assert.deepEqual(calculateSummary(state), { totalCents: 0, balances: { alex: 0, blair: 0, casey: 0 } });
});
test('amounts are stored in pennies', () => {
  assert.equal(amountToCents('10.01'), 1001);
  assert.throws(() => amountToCents('10.001'));
  assert.throws(() => amountToCents('-1'));
});
test('expense can be created, edited and removed', () => {
  const original = createInitialState();
  const input = { title: 'Dinner', amount: '90', payerId: 'alex', participantIds: ['alex', 'blair', 'casey'] };
  const added = saveExpense(original, input);
  assert.equal(original.expenses.length, 0);
  assert.equal(added.expenses[0].amountCents, 9000);
  const edited = saveExpense(added, { ...input, id: added.expenses[0].id, amount: '60' });
  assert.equal(edited.expenses[0].amountCents, 6000);
  assert.equal(deleteExpense(edited, edited.expenses[0].id).expenses.length, 0);
});
test('an evenly divisible expense has equal shares', () => {
  assert.deepEqual(allocateShares({ amountCents: 9000, participantIds: ['alex', 'blair', 'casey'] }).map(s => s.cents), [3000, 3000, 3000]);
});
