# Adding a New Topic (Example: SVG Node Update)

This guide shows the end-to-end steps to introduce a new event topic into the system. We use the recently added `canvas.component.update.svg-node.requested` topic as the concrete example.

---

## 1. Pick the Topic Naming

Use the pattern: `<domain>.<component>.<action>[.<sub-scope>].<phase>`

Example: `canvas.component.update.svg-node.requested`

- `canvas.component` – domain + component family
- `update` – high-level action
- `svg-node` – sub-scope (specialization)
- `requested` – phase (initiated by UI / user intent)

Keep names short, specific, and consistent with existing topics.

---

## 2. Decide Interaction vs. Topic

A topic that triggers a sequence must have a corresponding interaction route (`interaction-manifest.json` / `json-interactions/*`). Notify-only topics (no sequence) keep `routes: []`.

`canvas.component.update.svg-node.requested` triggers logic (update + refresh) so it needs:

- A sequence JSON
- A handlers file exporting the functions used by beats
- A route entry mapping the interaction key to the sequence id

---

## 3. Add the Sequence JSON

File: `json-sequences/canvas-component/update.svg-node.json`
Defines beats:

1. Update attribute (`updateSvgNodeAttribute`)
2. Refresh Control Panel (`refreshControlPanel`)

Register it in `json-sequences/canvas-component/index.json`:

```json
{
  "file": "update.svg-node.json",
  "handlersPath": "/plugins/canvas-component/symphonies/update/update.svg-node.symphony.ts"
}
```

---

## 4. Export Handlers

File already existed: `plugins/canvas-component/symphonies/update/update.svg-node.symphony.ts`
Exports:

```ts
export const handlers = { updateSvgNodeAttribute, refreshControlPanel };
```

---

## 5. Register Interaction Route

Add to both manifests:

- `interaction-manifest.json`
- `json-interactions/canvas-component.json`

Key: `canvas.component.update.svg-node` → sequence `canvas-component-update-svg-node-symphony` and plugin `CanvasComponentSvgNodeUpdatePlugin`.

Note: The interaction key omits the trailing `.requested` phase. That suffix lives only in the topic name.

---

## 6. Topic Derivation (no manual manifests)

Topics are now derived exclusively from plugin-served sequence JSON. You do NOT add topic entries in this repo.

What to do instead:
- Ensure your sequence JSON (in the plugin package) has a stable `id` that maps to the desired topic name (the generator converts kebab-case to dot notation and appends `.requested` for orchestration sequences).
- Export that sequence from the plugin’s `json-sequences/index.json` so it is synced to `public/json-sequences/`.
- Run `npm run pre:manifests` locally; the generator will rebuild `topics-manifest.json` from the served sequences.

If a topic is missing, verify the sequence file exists under `public/json-sequences/<plugin>/` and its `id` matches the intended topic naming (see rules in `scripts/derive-external-topics.js`).

---

## 7. Update ESLint Topic Rule (If Needed)

If the new topic key is missing during development you'll see: `Unknown topic: <key>` from the runtime or ESLint rule `topics-keys`. Ensure the topic is added before publishing in code.

---

## 8. Use the Topic in Code

`SvgNodeInspector` publishes:

```ts
await EventRouter.publish(
  "canvas.component.update.svg-node.requested",
  { id, path, attribute, value },
  conductor
);
```

Publishing requires the topic to exist in the manifest; otherwise the runtime throws `Unknown topic`.

---

## 9. (Optional) Add Tests

Create or extend tests under `__tests__` to cover:

- Successful publish → handlers run
- Validation of payload (missing fields)
- Security / whitelist behavior (as in `svg-node-update.spec.ts`)

---

## 10. Security / Whitelisting

All attribute changes must pass a whitelist (`ALLOWED_SVG_ATTRIBUTES`) inside `update.svg-node.stage-crew.ts`. Extend this set when supporting new attributes.

---

## 11. Checklist Summary

- [x] Sequence JSON created
- [x] Sequence registered in index
- [x] Handlers exported
- [x] Interaction route added
- [x] Code publishing the topic updated / created
- [x] Tests reference (or added)
- [x] Docs updated (this file + `svg-node-selection.md` reference already existed)

---

## 12. Common Pitfalls

| Issue                      | Cause                                                 | Fix                                                            |
| -------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| `Unknown topic` error      | Topic not in `topics-manifest.json` (or cached build) | Add entry + restart dev server                                 |
| Sequence not firing        | Interaction route missing                             | Add key to `interaction-manifest.json` & `json-interactions/*` |
| Handler not found          | Missing export name mismatch                          | Ensure handler id matches sequence JSON `handler` string       |
| Attribute silently ignored | Not in whitelist                                      | Extend `ALLOWED_SVG_ATTRIBUTES`                                |

---

## 13. Adding Another New Topic (Template)

1. Name: `domain.component.action[.scope].phase`
2. Sequence JSON (if routed) + register in index
3. Handlers file export
4. Interaction route (without phase suffix)
5. Topics manifest entries (root + component-specific)
6. Publish via `EventRouter.publish(<topic>, payload, conductor)`
7. Add tests & docs

Copy the SVG node update as a working reference.

---

## 14. Verification Steps After Adding

1. Restart dev server (ensures fresh manifests load)
2. Run `npm run lint` (eslint rule should pass)
3. Run focused tests if added (e.g. `npm test -- svg-node-update`)
4. Manually trigger the UI action and watch console for errors

---

Questions? Open a design note under `docs/design-reviews/` with the proposed topic set before implementing for broad changes.
