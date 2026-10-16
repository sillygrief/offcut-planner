# Offcut Planner

An explicit one-dimensional cutting plan for small workshops. It places demand on measured stock, accounts for kerf, keeps section types separate, and reports unplaced pieces.

This is a synthetic public evaluation project for testing developer indexing. It does not control tools, estimate structural safety, place orders, claim Electric Capital acceptance, or contain customer data. The account owner must review changes before any external submission.

## Run

```sh
npm test
npm start
```

Open `http://localhost:3000`. The sample verifies 3 x 300 mm from a 1000 mm bar with 3 mm kerf leaves 91 mm.

## Boundaries

Only straight measured stock is supported. Damaged zones, section identity, lock labels, and unplaced demand remain visible; no global optimum is claimed.
