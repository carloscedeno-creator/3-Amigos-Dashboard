#!/bin/bash

# --- CONFIGURATION ---
SPECS_FILE="docs/specs/stories.json"
PROGRESS_FILE="logs/progress.txt"
MEMORY_FILE="src/scripts/agents.md"

# --- CHECK DEPENDENCIES ---
if ! command -v jq &> /dev/null; then
    echo "❌ Error: 'jq' is not installed."
    echo "Run 'brew install jq' or 'sudo apt install jq'."
    exit 1
fi

echo "🚀 Strata Autopilot Engine: ONLINE"
echo "-----------------------------------"

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
    else
        # 5. FAILURE PROTOCOL
        echo "🛑 STOP."
        echo "⚠️  Update 'agents.md' with failure reason."
        read -p ">> Codified the lesson? (Press Enter)"
        echo "🔄 Restarting cycle for $STORY_ID..."
        echo "-----------------------------------"
    fi
done
