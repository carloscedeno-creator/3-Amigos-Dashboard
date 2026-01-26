# 📦 Example Repository

**Status:** 🟢 Live Sample | **Stack:** React + TypeScript + Node
**Objective:** A "clean slate" repository demonstrating the Strata file topology.

<aside>
👨‍💻

**For Developers:** This page contains the exact files you need to upload to a repo called `strata-reference-impl` to have your "Golden Sample". Copy and paste each file as-is.

</aside>

---

# 1. 📂 Directory Structure

**Create this exact structure in your repository:**

```
.
├── .cursor/
│   └── rules/
│       └── global.mdc       # The Constitution
├── docs/
│   ├── specs/
│   │   └── stories.json     # Input Contract
│   └── reference/
│       ├── auth_[flow.md](http://flow.md)
│       └── ui_[standards.md](http://standards.md)
├── logs/
│   └── progress.txt         # Short-Term Memory
├── scripts/
│   └── [autopilot.sh](http://autopilot.sh)         # The Engine
└── src/
    ├── components/
    │   └── [agents.md](http://agents.md)        # Long-Term Memory (UI)
    └── api/
        └── [agents.md](http://agents.md)        # Long-Term Memory (Backend)
```

---

# 2. 📄 Critical Artifacts

## 🏛️ `.cursor/rules/global.mdc` (The Constitution)

```markdown
---
description: GLOBAL STRATA LAWS - ALWAYS ACTIVE
globs: *
---
# 🏗️ Strata Constitution

1. **Zero Hallucination:** You DO NOT write code 
   without a Plan.
2. **The Memory Rule:** Before editing ANY folder, 
   you MUST read the `[agents.md](http://agents.md)` file inside it.
3. **Atomic Execution:** Execute strictly one story 
   from `stories.json` at a time.
4. **Binary Verification:** You are done ONLY when 
   the `acceptance_criteria` in `stories.json` are met.
5. **Context Hygiene:** Do not load documentation 
   files unless specifically required by the Plan.

## 🛑 Forbidden Patterns
- No `console.log` in production.
- No class components (Function components only).
- No direct CSS files (Tailwind only).
```

## 🧠 `src/components/[agents.md](http://agents.md)` (Memory Example: UI)

```markdown
# 🧠 Agent Memory: Components Layer

## ⚠️ Critical Lessons (DO NOT REPEAT MISTAKES)
- **2023-11-01:** The `Button` component crashes if 
  `isLoading` is undefined. Always provide a default 
  `false`.
- **2023-11-05:** We use `lucide-react` for icons. 
  Do NOT import from `react-icons`.

## 📌 Standards
- All components must export as **Named Exports** 
  (e.g., `export function Button`).
- Props must be defined via a TypeScript `interface`.
```

## 🧠 `src/api/[agents.md](http://agents.md)` (Memory Example: Backend)

```markdown
# 🧠 Agent Memory: API Layer

## ⚠️ Critical Lessons
- **2023-12-10:** The `fetch` wrapper does not 
  automatically parse 204 No Content. Check status 
  before `res.json()`.
- **2023-12-12:** Auth tokens must be passed in the 
  header `X-Strata-Auth`, NOT `Authorization`.

## 🔒 Security
- Never log full request bodies in error handlers.
```

## 📜 `docs/specs/stories.json` (The Contract)

```json
{
  "epic": "User Dashboard V1",
  "stories": [
    {
      "id": "DASH-01",
      "description": "Scaffold the Dashboard layout 
                      with a sidebar navigation.",
      "files_to_touch": [
        "src/layout/DashboardLayout.tsx", 
        "src/App.tsx"
      ],
      "acceptance_criteria": [
        "Layout renders a sidebar on the left (w-64)",
        "Sidebar contains links to 'Home' and 'Settings'",
        "Main content area renders children props",
        "Mobile view hides sidebar behind hamburger menu"
      ],
      "passes": true
    },
    {
      "id": "DASH-02",
      "description": "Create UserProfile card component 
                      fetching data from API.",
      "files_to_touch": [
        "src/components/UserProfile.tsx", 
        "src/api/user.ts"
      ],
      "acceptance_criteria": [
        "Component accepts `userId` prop",
        "Fetches data from `/api/users/:id`",
        "Displays user avatar (rounded-full)",
        "Displays 'Loading...' state while fetching",
        "Handles 404 error gracefully with 
         'User not found' message"
      ],
      "passes": false
    }
  ]
}
```

## 📝 `logs/progress.txt` (Short-Term Memory)

```
[2023-10-25 09:00] SYSTEM INIT: Strata Framework v2.0
[2023-10-25 09:15] COMPLETED DASH-01: Layout Scaffold.
[2023-10-25 09:15] NOTE: encountered z-index issue on 
                    sidebar, added rule to 
                    src/layout/[agents.md](http://agents.md).
[2023-10-25 09:20] STARTED DASH-02: User Profile 
                    Component.
```

## 🔧 `scripts/[autopilot.sh](http://autopilot.sh)` (The Engine)

Use the complete script from the Autopilot Script Example page.

---

# 3. 📖 [README.md](http://README.md) (Setup Guide)

```markdown
# 🏗️ Strata Example Project

This repository demonstrates the **Strata Dev Framework** 
architecture.

## 🚀 How to Run "The Loop"

1. **Install Dependencies:**
```

npm install && brew install jq

```

2. **Check the Contract:**
   Open `docs/specs/stories.json`. 
   Find first story where `"passes": false`.

3. **Start Autopilot:**
```

./scripts/[autopilot.sh](http://autopilot.sh)

```

4. **Manual Intervention:**
   If not using the script, follow the **PPRE Cycle**:
   - **PRIME:** Drag `stories.json` + `global.mdc` 
                into Chat.
   - **PLAN:** Ask for a plan.
   - **RESET:** `Cmd+K` to wipe memory.
   - **EXECUTE:** Paste the plan and code.

## 🧠 Memory Locations

- **Global Rules:** `.cursor/rules/global.mdc`
- **Folder Specific:** Look for `[agents.md](http://agents.md)` in any 
                       directory.

## 📘 Documentation

For complete framework documentation, visit the main 
framework pages.

## 🎓 Certification

Complete the [Strata Certification Quiz]
([https://forms.gle/ABvRg4qtwXCZZdqB7](https://forms.gle/ABvRg4qtwXCZZdqB7)) to validate 
your understanding.
```

---

# 🚀 Implementation Steps

### Step 1: Create the Repository

1. Go to GitHub and create new public repo: 
    
    `strata-reference-impl`
    
2. Clone locally:
    
    ```bash
    git clone [https://github.com/YOUR-USERNAME/strata-reference-impl.git](https://github.com/YOUR-USERNAME/strata-reference-impl.git)
    cd strata-reference-impl
    ```
    

### Step 2: Copy All Files

1. Copy all files from this page to the repo
2. Create the exact directory structure
3. Make [`autopilot.sh`](http://autopilot.sh) executable:
    
    ```bash
    chmod +x scripts/[autopilot.sh](http://autopilot.sh)
    ```
    

### Step 3: Commit & Push

```bash
git add .
git commit -m "feat: initial Strata reference 
                   implementation"
git push origin main
```

### Step 4: Link in Documentation

Once created, add the link to:

- [Learning Resources & References](Learning%20Resources%20&%20References%2059c24ed933d449a8ab26223067c280df.md)
- This page (links section below)

---

# 🔗 Repository Link

<aside>
👉

**🚧 Pending:** Once the repo is created, add the link here:

[`https://github.com/YOUR-ORG/strata-reference-impl`](https://github.com/YOUR-ORG/strata-reference-impl)

</aside>

---

# 🔗 Related Resources

- [Core Technical Specification](Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md) - Detailed explanation of each component
- [PRD Template & Creation Guide](PRD%20Template%20&%20Creation%20Guide%202c60d2a752124229a1230002eadbafba.md) - How to create more stories.json
- [Learning Resources & References](Learning%20Resources%20&%20References%2059c24ed933d449a8ab26223067c280df.md) - External tools and tutorials
- [Certification Quiz](https://forms.gle/ABvRg4qtwXCZZdqB7) - Validate your understanding

<aside>
✅

**Pro Tip:** This repo is your perfect "starting point". Clone it every time you start a new Strata project and you'll have the complete structure ready in seconds.

</aside>