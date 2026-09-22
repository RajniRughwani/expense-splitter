# Shared tab

A small expense splitter for a group. Plain JavaScript, browser local storage, and Node’s built-in test runner. No packages to install.

## Run

Requires Node.js 20 or newer.

```sh
npm start
# Open http://localhost:3000
npm test
npm run check
```

Use `PORT=3001 npm start` if port 3000 is occupied. Use **Reset demo** to clear the browser’s saved group.

## Intended behaviour

- Add people, record expenses, choose a payer and one or more people sharing the cost.
- The payer can be included in the split or pay entirely for other people.
- Positive balances mean money owed to that person; negative balances mean money they owe. Group balances must sum to zero.
- Store currency in whole pennies. Shares must add up exactly to the expense amount. Allocate any remainder pennies, one each, in the expense’s stored participant order.
- Edits must update both expense details and summary immediately, including amount, payer and sharing changes.
- Removing someone excludes them from future expenses. Existing expenses, allocations and balances must remain intact, with historical people identifiable. Historical expenses can still be edited.
- Data persists in the current browser after reload. No accounts, backend database, currency conversion or unequal splits.

## Project map

- `src/model.js`: state operations and accounting
- `src/summary.js`: summary selection
- `src/app.js`: browser rendering and events
- `test/model.test.js`: existing smoke tests
- `server.js`: local static server

## Your task · 20 minutes

This expense-splitting app runs, but users report incorrect results. Inspect the existing project, reproduce the problems, and fix them.

Reported issues:

- A £90 expense shared by three people sometimes produces the wrong balances.
- Editing an expense can leave the summary showing the old amount.
- Deleting a participant can make an existing expense disappear from the totals.
- Splitting £10 among three people can produce totals that do not add up to £10.

Preserve the existing app and its intended behaviour. Add focused tests for the bugs you fix, run the relevant checks, and explain the root causes and any remaining limitations.
