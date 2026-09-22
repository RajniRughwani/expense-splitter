import { calculateSummary } from './model.js';

export function createSummarySelector() {
  let previousKey;
  let previousResult;
  return state => {
    const key = `${state.participants.length}:${state.expenses.length}`;
    if (key !== previousKey) {
      previousResult = calculateSummary(state);
      previousKey = key;
    }
    return previousResult;
  };
}
