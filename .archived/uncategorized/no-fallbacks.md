---
type: "manual"
description: "Example description"
---

Do not use fallbacks in implementation because they hide issues in the architecture and ultimately create anti-patterns and confusion
Instead, investigate and establish an evidence-based root cause and solution to the problem before proceeding with implementation.
When code is implemented to solve an issue but doesn't work, remove the code if it doesn't actually serve a purpose in the solution. We don't want bloat in the codebase because bloat makes code hard to maintain.