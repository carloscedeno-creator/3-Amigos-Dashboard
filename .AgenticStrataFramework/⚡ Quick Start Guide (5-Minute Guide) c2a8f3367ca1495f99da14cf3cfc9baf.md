# ⚡ Quick Start Guide (5-Minute Guide)

**Time:** 5 Minutes | **Goal:** Verify the Agentic Loop

<aside>
🎯

**For new developers:** This guide takes you from "Zero" to "Hello World" in under 5 minutes. Follow each step exactly as described.

</aside>

---

# 1. 🏗️ Scaffold the Brain (The Setup)

Don't create folders manually. Copy and paste this command in your terminal (project root) to generate the **Strata Topology** instantly.

```bash
mkdir -p .cursor/rules docs/specs docs/reference docs/done_specs logs src/scripts
touch .cursor/rules/global.mdc logs/progress.txt src/scripts/agents.md
echo "# Strata Memory" > src/scripts/agents.md
```

---

# 2. 📜 The Input Contract (Hello World)

Create the file `docs/specs/stories.json`. This is your first **Input Contract**.

**Copy this exact block:**

```json
{
  "epic": "System Initialization",
  "status": "active",
  "stories": [
    {
      "id": "INIT-001",
      "description": "Create a Hello World script to verify the Strata Agentic Engine execution.",
      "files_to_touch": ["src/scripts/hello_strata.ts", "package.json"],
      "acceptance_criteria": [
        "File 'src/scripts/hello_strata.ts' exists",
        "The script prints exactly: 'Strata Agentic Engine: ONLINE'",
        "A 'package.json' script 'start:strata' runs this file",
        "Running 'npm run start:strata' succeeds without errors"
      ],
      "passes": false
    }
  ]
}
```

---

# 3. 🔄 Execute the PPRE Cycle (The "How-To")

Follow this cycle **exactly** to complete the story above.

### Phase 1: PRIME 🧠

- Open Chat (Command+L)
- Drag/Attach: `docs/specs/stories.json` and `.cursor/rules/global.mdc`
- **Prompt:** "Read the active story in stories.json. Do not code yet."

### Phase 2: PLAN 📝

- **Prompt:** "Create a step-by-step plan to implement story INIT-001. Output as Markdown."
- **Human Review:** Verify the plan includes creating the `ts` file and editing `package.json`

### Phase 3: RESET (The Kill Switch) 🛑

- **Action:** Press `Command+K` (or use `/clear` / New Chat)
- **Why:** We eliminate conversation noise to restore the Agent's IQ to 100% [Source: Cole Medin]

<aside>
⚠️

**CRITICAL:** Do not skip this step. RESET is mandatory between Plan and Execution. If you skip it, code quality drops by 40%.

</aside>

### Phase 4: EXECUTE 🚀

- Paste the **Approved Plan** (copied from Phase 2) into the new chat
- **Prompt:** "Execute this plan. Verify against the acceptance criteria in stories.json. If successful, update 'passes' to true."

---

# 4. ✅ Certification Quiz

Before committing to production, verify you understand the rules:

- [ ]  **Where does intelligence live?** (Answer: In [`agents.md`](http://agents.md) files, NOT in chat)
- [ ]  **When do I Reset?** (Answer: ALWAYS between Plan and Execution)
- [ ]  **When is my work done?** (Answer: When `stories.json` says `true` AND I've updated [`agents.md`](http://agents.md) with learnings)

<aside>
🎓

**Mandatory Certification**
To complete your onboarding, you must pass the official framework quiz:
[Take the Quiz](https://forms.gle/ABvRg4qtwXCZZdqB7)

</aside>

---

# 🚀 Next Steps

The quick start guide is complete. For advanced technical documentation, see:

- [Core Technical Specification](Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md) - Complete system topology
- [PRD Template & Creation Guide](PRD%20Template%20&%20Creation%20Guide%202c60d2a752124229a1230002eadbafba.md) - How to create stories.json from PRDs
- PDFs in [Documentation Folder](Documentation%20Folder%202eaacc211ff1801b82b1f4c2f2d9b8ff.md) - Complete Developer Handbook

---

# 🔗 Related Resources

- [Core Technical Specification](Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md) - System topology and architecture
- [PRD Template & Creation Guide](PRD%20Template%20&%20Creation%20Guide%202c60d2a752124229a1230002eadbafba.md) - Write correct stories.json files
- [Learning Resources & References](Learning%20Resources%20&%20References%2059c24ed933d449a8ab26223067c280df.md) - External tools and tutorials
- [Certification Quiz](https://forms.gle/ABvRg4qtwXCZZdqB7) - Validate your understanding

<aside>
✅

**You've completed the Quick Start Guide!**
You're now ready to work with the Strata Dev Framework. Remember to complete the certification quiz before making your first commit.

</aside>