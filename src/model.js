export function createInitialState() {
  return {
    participants: [{ id: 'alex', name: 'Alex' }, { id: 'blair', name: 'Blair' }, { id: 'casey', name: 'Casey' }],
    expenses: [],
  };
}

export function amountToCents(value) {
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error('Enter a positive amount with at most two decimal places.');
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 100000000) throw new Error('Amount must be between £0.01 and £1,000,000.');
  return cents;
}

export function addParticipant(state, name) {
  name = name.trim();
  if (!name) throw new Error('Enter a name.');
  return { ...state, participants: [...state.participants, { id: crypto.randomUUID(), name }] };
}

export function saveExpense(state, input) {
  const existing = input.id && state.expenses.find(e => e.id === input.id);
  if (input.id && !existing) throw new Error('Expense not found.');
  const known = new Set(state.participants.map(p => p.id));
  const allowed = new Set([...known, ...(existing?.participantIds || []), ...(existing ? [existing.payerId] : [])]);
  if (!input.title.trim()) throw new Error('Enter a description.');
  if (!allowed.has(input.payerId)) throw new Error('Choose a payer.');
  if (!input.participantIds.length || input.participantIds.some(id => !allowed.has(id))) throw new Error('Choose who shared this expense.');
  const expense = {
    id: existing?.id || crypto.randomUUID(),
    title: input.title.trim(),
    amountCents: amountToCents(input.amount),
    payerId: input.payerId,
    participantIds: [...new Set(input.participantIds)],
  };
  return { ...state, expenses: existing ? state.expenses.map(e => e.id === expense.id ? expense : e) : [...state.expenses, expense] };
}

export function deleteExpense(state, id) {
  return { ...state, expenses: state.expenses.filter(e => e.id !== id) };
}

export function removeParticipant(state, id) {
  return { ...state, participants: state.participants.filter(p => p.id !== id) };
}

export function allocateShares(expense) {
  const share = Math.round(expense.amountCents / expense.participantIds.length);
  return expense.participantIds.map(participantId => ({ participantId, cents: share }));
}

export function calculateSummary(state) {
  const balances = Object.fromEntries(state.participants.map(p => [p.id, 0]));
  let totalCents = 0;
  for (const expense of state.expenses) {
    if (!(expense.payerId in balances) || expense.participantIds.some(id => !(id in balances))) continue;
    totalCents += expense.amountCents;
    const shares = allocateShares(expense);
    const payerShare = shares.find(s => s.participantId === expense.payerId)?.cents || 0;
    balances[expense.payerId] += expense.amountCents - payerShare;
    for (const share of shares) balances[share.participantId] -= share.cents;
  }
  return { totalCents, balances };
}
