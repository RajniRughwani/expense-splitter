import { createInitialState, addParticipant, saveExpense, deleteExpense, removeParticipant, allocateShares } from './model.js';
import { createSummarySelector } from './summary.js';
const storageKey = 'shared-tab-v1';
let state;
try { state = JSON.parse(localStorage.getItem(storageKey)) || createInitialState(); } catch { state = createInitialState(); }
let editingId = null;
const selectSummary = createSummarySelector();
const $ = selector => document.querySelector(selector);
const money = cents => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(cents / 100);
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const personName = id => state.participants.find(p => p.id === id)?.name || 'Former participant';
function commit(next) { state = next; localStorage.setItem(storageKey, JSON.stringify(state)); render(); }
function attempt(action) { $('#message').textContent = ''; try { action(); } catch (error) { $('#message').textContent = error.message; } }
function renderForm() {
  const expense = state.expenses.find(e => e.id === editingId);
  const form = $('#expense-form');
  form.elements.title.value = expense?.title || '';
  form.elements.amount.value = expense ? (expense.amountCents / 100).toFixed(2) : '';
  const ids = [...new Set([...state.participants.map(p => p.id), ...(expense?.participantIds || []), ...(expense ? [expense.payerId] : [])])];
  form.elements.payerId.innerHTML = ids.map(id => `<option value="${escape(id)}">${escape(personName(id))}</option>`).join('');
  if (expense) form.elements.payerId.value = expense.payerId;
  $('#sharing').innerHTML = ids.map(id => `<label><input type="checkbox" name="shared" value="${escape(id)}" ${!expense || expense.participantIds.includes(id) ? 'checked' : ''}>${escape(personName(id))}</label>`).join('');
  $('#form-heading').textContent = expense ? 'Edit expense' : 'Add an expense';
  $('#save').textContent = expense ? 'Save changes' : 'Add expense';
  $('#cancel').hidden = !expense;
}
function render() {
  $('#people').innerHTML = state.participants.map(p => `<li><span>${escape(p.name)}</span><button class="link" data-remove-person="${escape(p.id)}" aria-label="Remove ${escape(p.name)}">Remove</button></li>`).join('');
  const summary = selectSummary(state);
  $('#total').textContent = money(summary.totalCents);
  $('#balances').innerHTML = Object.entries(summary.balances).map(([id, cents]) => `<li><span>${escape(personName(id))}</span><strong>${money(cents)}</strong></li>`).join('');
  $('#expenses').innerHTML = state.expenses.length ? state.expenses.map(e => `<article class="expense"><div class="expense-head"><strong>${escape(e.title)}</strong><strong>${money(e.amountCents)}</strong></div><p>Paid by ${escape(personName(e.payerId))}<br>${allocateShares(e).map(s => `${escape(personName(s.participantId))}: ${money(s.cents)}`).join(' · ')}</p><button class="secondary" data-edit="${escape(e.id)}">Edit</button><button class="link" data-delete="${escape(e.id)}">Delete</button></article>`).join('') : '<p class="hint">No expenses yet. Add your first shared cost.</p>';
  renderForm();
}
$('#person-form').addEventListener('submit', event => { event.preventDefault(); attempt(() => { commit(addParticipant(state, event.target.elements.name.value)); event.target.reset(); }); });
$('#expense-form').addEventListener('submit', event => {
  event.preventDefault();
  attempt(() => {
    const data = new FormData(event.target);
    const next = saveExpense(state, { id: editingId, title: data.get('title'), amount: data.get('amount'), payerId: data.get('payerId'), participantIds: data.getAll('shared') });
    editingId = null;
    commit(next);
  });
});
$('#cancel').addEventListener('click', () => { editingId = null; renderForm(); });
document.addEventListener('click', event => attempt(() => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.edit) { editingId = button.dataset.edit; renderForm(); $('#expense-form').elements.title.focus(); }
  if (button.dataset.delete) { if (editingId === button.dataset.delete) editingId = null; commit(deleteExpense(state, button.dataset.delete)); }
  if (button.dataset.removePerson) commit(removeParticipant(state, button.dataset.removePerson));
}));
$('#reset').addEventListener('click', () => { if (confirm('Clear this browser’s expenses and reset the group?')) { editingId = null; commit(createInitialState()); } });
render();
