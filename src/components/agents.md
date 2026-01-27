# 🧠 Agent Memory: Components Layer

## ⚠️ Critical Lessons (DO NOT REPEAT MISTAKES)

_This file stores project-specific knowledge, conventions, and lessons learned for the components directory._

## 📌 Standards

- All components must export as **Named Exports** (e.g., `export function Button`).
- Props must be defined via a TypeScript `interface`.
- Use functional components only (no class components).

## 🔧 Conventions

- Component files should be PascalCase (e.g., `UserProfile.tsx`)
- One component per file
- Place shared types in a `types.ts` file in the same directory
- **2026-01-27:** All UI copy (labels, placeholders, messages) must be in English across components.

## 📝 Notes

_Add date-stamped entries here as you encounter issues or establish patterns:_

```
Example format:
- **2026-01-26:** The Button component crashes if isLoading is undefined. Always provide a default false.
- **2026-01-26:** We use lucide-react for icons. Do NOT import from react-icons.
```
