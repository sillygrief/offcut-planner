import { fileURLToPath } from 'node:url';
import { start } from './lib/server.mjs';
import { run, validate } from './core.mjs';
export * from './core.mjs';
export const spec = { ...{
  "slug": "offcut",
  "repo": "offcut-planner",
  "owner": "sillygrief",
  "title": "Offcut Planner",
  "purpose": "Turn measured workshop stock into a traceable cutting plan",
  "workflow": "A Kite procurement agent can purchase a cutting plan; measured stock, damaged zones and operator locks constrain the computation.",
  "colors": [
    "#f3efe5",
    "#23333a",
    "#a83f12"
  ],
  "required": [
    "stock",
    "demand"
  ],
  "sample": {
    "stock": [
      {
        "id": "A-01",
        "length": 1000,
        "section": "A",
        "damaged": []
      }
    ],
    "demand": [
      {
        "id": "beam",
        "length": 300,
        "quantity": 3,
        "section": "A"
      }
    ],
    "kerf": 3
  },
  "changed": "Locks now fix the exact stock and start coordinate. Cutting spans include kerf, and damaged areas cannot be consumed by either a piece or its cut.",
  "limits": "One-dimensional stock only; each piece is cut off once. No structural safety, tool control or optimality guarantee.",
  "version": "0.2.0",
  "inputSchema": {
    "type": "object",
    "required": [
      "stock",
      "demand"
    ],
    "properties": {
      "stock": {
        "type": "array"
      },
      "demand": {
        "type": "array"
      },
      "kerf": {
        "type": "integer"
      }
    }
  }
}, run, validate };
if (process.argv[1] === fileURLToPath(import.meta.url)) start(spec);

