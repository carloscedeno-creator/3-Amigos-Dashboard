# 🔧 Troubleshooting Guide

**Purpose:** Common debugging scenarios for the Strata Dev Framework
**Audience:** Developers experiencing issues with the PPRE cycle, context management, or framework implementation

<aside>
🚨

**Before reporting a bug:** 90% of framework problems are due to not strictly following the process. Review this guide first.

</aside>

---

# 🤖 Problem 1: "Agent doesn't follow PPRE cycle"

### Symptoms

- Agent starts coding without making a plan
- Agent "guesses" requirements not in `stories.json`
- Generated code doesn't meet acceptance criteria
- Agent refactors unrelated code

### Diagnosis

The agent is in **"Vibe Coding Mode"** because it didn't receive explicit PPRE cycle instructions. Without structured context, the LLM falls back to default behavior: write code immediately.

### Solution

**Step 1: Verify `global.mdc` exists**

```bash
ls -la .cursor/rules/global.mdc
```

If it doesn't exist, create it with the template from the Quick Start Guide.

**Step 2: Force PPRE cycle explicitly**

Use these **exact** prompts in each chat:

**PRIME:**

```
Read the active story in docs/specs/stories.json. 
Also read .cursor/rules/global.mdc.
Do NOT code yet. Just confirm you understand.
```

**PLAN:**

```
Create a step-by-step implementation plan.
Output as Markdown. Include:
1. Files to create/modify
2. Dependencies to check
3. Acceptance criteria to verify
```

**RESET:** Press `Cmd+K` (Mac) or `Ctrl+K` (Windows). **Mandatory.**

**EXECUTE:**

```
[Paste plan here]

Execute this plan. After completion, verify against 
acceptance criteria and update stories.json.
```

**Step 3: If problem persists**

- Close and reopen Cursor completely
- Verify no multiple chat tabs open
- Check for old `.cursorrules` in project root

---

# 🧠 Problem 2: "Context Decay still happening"

### Symptoms

- Agent "forgets" decisions made 5 minutes ago
- Agent asks same question multiple times
- Agent introduces bugs already fixed
- Code quality degrades in long chats

### Diagnosis

You're experiencing **Context Window Pollution**. Each message consumes tokens. At context limit (100k-200k tokens), the model starts "forgetting" information at the beginning.

### Solution

**Cause #1: Not doing RESET**

- **Golden rule:** ALWAYS RESET between PLAN and EXECUTE
- If chat has 20+ messages, you're doing something wrong

**Cause #2: Not using [`agents.md`](http://agents.md)**

The file system is "permanent brain". Chat is "volatile RAM".

✅ **Correct:**

```markdown
# src/components/[agents.md](http://agents.md)

## ⚠️ Critical Lessons Learned
- **2026-01-16:** API returns user IDs as strings, 
  not numbers. Always cast to Number().
```

❌ **Incorrect:** Letting agent fix same bug 3 times without documenting.

**Cause #3: Stories too large**

If story touches 10+ files, it's not atomic. Split it:

❌ **Bad:**

```json
{"id": "AUTH-01", 
 "description": "Implement complete auth system"}
```

✅ **Good:**

```json
[
  {"id": "AUTH-01a", "description": "Create login UI"},
  {"id": "AUTH-01b", "description": "Add validation"},
  {"id": "AUTH-01c", "description": "Connect to API"}
]
```

**Cause #4: Dragging large PDFs into chat**

- Extract relevant text to `.md` in `docs/reference/`
- Drag small `.md` instead of full PDF

---

# 📋 Problem 3: "Stories.json not validating"

### Symptoms

- Error: `Unexpected token` when running autopilot
- Agent doesn't find stories marked `false`
- Script says "All complete" but tasks remain
- Acceptance criteria not being evaluated

### Diagnosis

JSON is strict. A syntax error breaks the entire file.

### Solution

**Step 1: Validate syntax**

Online: [jsonlint.com](http://jsonlint.com)

Terminal:

```bash
jq . docs/specs/stories.json
```

**Step 2: Common errors**

❌ **Extra comma:**

```json
{"stories": [
  {"id": "TASK-01", "passes": false},
]}
```

❌ **Wrong quotes on booleans:**

```json
{"passes": "false"}  // Wrong (string)
{"passes": false}    // Correct (boolean)
```

**Step 3: Valid template**

```json
{
  "epic": "Feature Name",
  "status": "active",
  "stories": [
    {
      "id": "FEAT-001",
      "description": "Short description",
      "files_to_touch": ["src/file.ts"],
      "acceptance_criteria": [
        "Criterion 1",
        "Criterion 2"
      ],
      "passes": false
    }
  ]
}
```

**Step 4: Automate validation**

Add pre-commit hook:

```bash
# .git/hooks/pre-commit
#!/bin/bash
jq . docs/specs/stories.json > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ stories.json is invalid JSON!"
    exit 1
fi
```

---

# 📝 Problem 4: "[Agents.md](http://Agents.md) not being updated"

### Symptoms

- Agent makes same mistake multiple times
- [`agents.md`](http://agents.md) files empty or outdated
- Team doesn't know what lessons learned
- No "compounding" (system doesn't get smarter)

### Diagnosis

"System Evolution" protocol not being followed. Developers fix bugs without codifying learning.

### Solution

**Step 1: Understand evolution protocol**

When you find a bug:

1. **DO NOT fix it silently**
2. Open [`agents.md`](http://agents.md) in relevant folder
3. Add entry with date + lesson
4. **Then** fix the bug
5. Commit both changes together

**Step 2: Correct structure**

```markdown
# 🧠 Agent Memory: [Module Name]

## ⚠️ Critical Lessons Learned

- **2026-01-16:** The `formatDate()` utility expects 
  ISO strings, not Date objects. Always convert first.
- **2026-01-14:** Never mutate props directly. 
  Clone first with `structuredClone()`.

## 🚫 Forbidden Patterns

- Do NOT use `any` type in this module.
- Do NOT import from `@/utils/deprecated`.

## 📚 Context

- This module interfaces with legacy Python API
- Date formats must match backend: YYYY-MM-DD
- All IDs are UUIDs (strings), never integers
```

**Step 3: Template for new modules**

```bash
mkdir src/new-module
cat > src/new-module/[agents.md](http://agents.md) << 'EOF'
# 🧠 Agent Memory: New Module

## ⚠️ Critical Lessons Learned

(None yet - new module)

## 🚫 Forbidden Patterns

(To be defined)
EOF
```

---

# ❓ FAQ: Common Errors

### Q1: "Agent changed my tech stack"

**Cause:** `global.mdc` doesn't define tech stack

**Solution:** Add "Tech Stack Standards" section:

```markdown
## 4. Tech Stack Standards (IMMUTABLE)
- Language: TypeScript 5.0+
- Framework: Next.js 14 (App Router)
- Styling: TailwindCSS (NO CSS-in-JS)
- State: Zustand (NO Redux)
- Testing: Vitest (NO Jest)
```

---

### Q2: "Autopilot stuck in loop"

**Cause:** Story has `passes: true` but script detects `false`

**Solution:** Look for invisible characters:

```bash
cat -A docs/specs/stories.json | grep "passes"
```

---

### Q3: "Agent hallucinates functions"

**Cause:** Agent assumes libraries not installed

**Solution:** Force verification in plan:

```
Before planning, check package.json for dependencies.
Do NOT assume any library is installed.
```

---

### Q4: "Auto-commits breaking workflow"

**Cause:** Script commits without review

**Solution:** Modify script to stage instead:

```bash
git add .
echo "✅ Changes staged. Review manually."
```

---

### Q5: "Team not following framework"

**Cause:** Lack of accountability

**Solution:** Implement gates:

1. Pre-commit hook validating `stories.json` and [`agents.md`](http://agents.md)
2. PR template requiring story link
3. Mandatory certification: [Take Quiz](https://forms.gle/ABvRg4qtwXCZZdqB7)

---

### Q6: "Framework too slow for hotfixes"

**Cause:** Scope misunderstanding. Framework is for features, not emergencies.

**Solution:** Create bypass protocol:

```markdown
# HOTFIX Exception Protocol

For CRITICAL production bugs only:
1. Fix immediately (skip PPRE)
2. Within 24h: Create retro story in done_specs/
3. Document in [agents.md](http://agents.md) what caused bug
4. Add preventive rule to global.mdc if applicable
```

---

# 🆘 Still Stuck?

<aside>
💬

**Escalation Path**

1. **First:** Review Quick Start Guide for basic concepts
2. **Second:** Consult [Core Technical Specification](Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md) for architecture
3. **Third:** Check all documentation in [Documentation Folder](Documentation%20Folder%202eaacc211ff1801b82b1f4c2f2d9b8ff.md)
4. **Last Resort:** Contact Guardian Team with:
    - Current `stories.json`
    - Last error logs
    - Screenshot of chat when it failed
</aside>

---

# 🔗 Related Resources

- [Core Technical Specification](Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md) - Framework architecture
- [PRD Template & Creation Guide](PRD%20Template%20&%20Creation%20Guide%202c60d2a752124229a1230002eadbafba.md) - Write correct stories.json
- [Learning Resources & References](Learning%20Resources%20&%20References%2059c24ed933d449a8ab26223067c280df.md) - External tools
- [Certification Quiz](https://forms.gle/ABvRg4qtwXCZZdqB7) - Validate understanding

<aside>
✅

**Pro Tip:** 90% of problems solved by strictly following PPRE cycle. If in doubt, go back to basics: Prime → Plan → **RESET** → Execute.

</aside>