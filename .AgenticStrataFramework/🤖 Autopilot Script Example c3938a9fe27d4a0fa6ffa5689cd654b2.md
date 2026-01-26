# 🤖 Autopilot Script Example

**Status:** 🟢 Production Ready | **Dependency:** `jq` (JSON Processor)
**Mission:** Enforce the PPRE Cycle and automate the administrative overhead of the Ralph Protocol.

<aside>
⚙️

**What is this?** This script is the practical implementation of the "Ralph Loop" mentioned in the documentation. It automates state management (`stories.json`), logging (`progress.txt`), and version control, leaving humans only the task of operating the Agent.

</aside>

---

# 1. 📜 The Complete Script

**File location:** `scripts/[autopilot.sh](http://autopilot.sh)`

**Part 1 - Configuration & Setup:**

```bash
#!/bin/bash

# --- CONFIGURATION ---
SPECS_FILE="docs/specs/stories.json"
PROGRESS_FILE="logs/progress.txt"
MEMORY_FILE="src/scripts/[agents.md](http://agents.md)"

# --- CHECK DEPENDENCIES ---
if ! command -v jq &> /dev/null; then
    echo "❌ Error: 'jq' is not installed."
    echo "Run 'brew install jq' or 'sudo apt install jq'."
    exit 1
fi

echo "🚀 Strata Autopilot Engine: ONLINE"
echo "-----------------------------------"
```

**Part 2 - The Ralph Loop:**

```bash
# --- THE RALPH LOOP ---
while true; do
    # 1. READ: Find first story where passes == false
    CURRENT_STORY=$(jq -r '.stories[] | select(.passes==false) | .id + ": " + .description' $SPECS_FILE | head -n 1)
    STORY_ID=$(echo "$CURRENT_STORY" | cut -d':' -f1)

    # 2. CHECK: If no stories left, exit
    if [ -z "$STORY_ID" ]; then
        echo "🎉 All stories completed!"
        exit 0
    fi

    echo "🤖 CURRENT TARGET: $CURRENT_STORY"
    echo "📋 INSTRUCTIONS FOR AGENT:"
    echo "   1. Prime: Read story $STORY_ID"
    echo "   2. Plan: Generate implementation plan"
    echo "   3. RESET CONTEXT (Ctrl+K)"
    echo "   4. Execute"
```

**Part 3 - Human Verification & Success:**

```bash
# 3. INTERVENTION: Wait for human/agent
read -p ">> Did agent verify acceptance criteria? (y/n): " RESULT

if [ "$RESULT" == "y" ]; then
    # 4. SUCCESS PROTOCOL
    echo "✅ Marking $STORY_ID as DONE..."

    # Update JSON (atomic write)
    tmp=$(mktemp)
    jq --arg id "$STORY_ID" '(.stories[] | select(.id == $id)).passes = true' $SPECS_FILE > "$tmp" && mv "$tmp" $SPECS_FILE

    # Log to Short-Term Memory
    echo "[$(date)] COMPLETED $STORY_ID" >> $PROGRESS_FILE

    # Git Checkpoint
    git add .
    git commit -m "feat($STORY_ID): completed via Strata Autopilot"

    echo "💾 Progress Saved. Loading next atom..."
    echo "-----------------------------------"
```

**Part 4 - Failure Protocol:**

```bash
    else
        # 5. FAILURE PROTOCOL
        echo "🛑 STOP."
        echo "⚠️  Update '[agents.md](http://agents.md)' with failure reason."
        read -p ">> Codified the lesson? (Press Enter)"
        echo "🔄 Restarting cycle for $STORY_ID..."
        echo "-----------------------------------"
    fi
done
```

---

# 2. 🔍 Line-by-Line Explanation

| Line | Concept | Technical Explanation |
| --- | --- | --- |
| `18` | **The Infinite Loop** | Script runs until no tasks remain. Simulates "Autonomous Agent" behavior. |
| `20` | **Atomic Selection** | Uses `jq` to find first `false` item. Forces **Sequential Execution**. |
| `24` | **Exit Condition** | Empty `STORY_ID` means `stories.json` is 100% complete. |
| `37` | **Human-in-the-Loop** | Acts as "Gatekeeper". Waits for human validation before proceeding. |
| `43` | **State Mutation** | Rewrites JSON "in-place", changing `false` to `true`. Updates the Contract. |
| `51` | **Auto-Commit** | Automatic commit per story. Ensures granular, clean Git history. |
| `58` | **Forced Evolution** | Blocks progress until human confirms [`agents.md`](http://agents.md) update. Prevents "brute forcing". |

---

# 3. ⚙️ Customization Examples

### For Automated Tests (CI/CD)

Replace line 37 with:

```bash
echo "🧪 Running Tests..."
if npm test; then
    RESULT="y"
else
    RESULT="n"
fi
```

### For Python Projects

Change configuration:

```bash
SPECS_FILE="requirements/stories.json"
MEMORY_FILE="app/api/[agents.md](http://agents.md)"
```

### For Silent Mode (Advanced)

```bash
claude --prompt "Execute story $STORY_ID from $SPECS_FILE. Output only code."
```

---

# 4. 🚑 Common Problems

### Problem: `command not found: jq`

- **Cause:** JSON processor not installed
- **Solution:** Run `brew install jq` (Mac) or `sudo apt-get install jq` (Linux/WSL)

### Problem: `Permission denied`

- **Cause:** Script not executable
- **Solution:** Run `chmod +x scripts/[autopilot.sh](http://autopilot.sh)`

### Problem: Script deletes JSON

- **Cause:** Syntax error in `stories.json`
- **Solution:** Validate JSON with `jq . docs/specs/stories.json` before running

---

# 🔗 Related Resources

- [Core Technical Specification](Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md) - Understand the Ralph Loop conceptually
- [PRD Template & Creation Guide](PRD%20Template%20&%20Creation%20Guide%202c60d2a752124229a1230002eadbafba.md) - Create valid stories.json
- [Learning Resources & References](Learning%20Resources%20&%20References%2059c24ed933d449a8ab26223067c280df.md) - External tools
- [Certification Quiz](https://forms.gle/ABvRg4qtwXCZZdqB7) - Validate PPRE cycle understanding

<aside>
🎓

**Before using in production**, ensure your team has completed the certification quiz.

</aside>