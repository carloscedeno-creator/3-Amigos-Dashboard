# Core Technical Specification

**Version:** 1.0 | **Type:** System Architecture & Workflow Protocol

<aside>
📋

This document serves as the **technical reference manual** for implementing the Strata Dev Framework in your codebase. It consolidates all architectural decisions, directory structures, and workflow protocols into a single source of truth.

</aside>

---

# 1. Philosophy: Compounding Agentic Engineering

The Strata Framework shifts development from a linear **"Feature Factory"** model to an **Exponential System Evolution** model.

### Core Principles

**Spec-Driven Development**

- No code is written without a rigorous, approved specification (PRD)
- The Chat History is ephemeral; the PRD is the absolute truth
- Location: `docs/specs/[prd.md](http://prd.md)`

**Atomic Execution**

- Work is broken down into binary units (Atoms) verifiable by scripts
- Each atom must be completable in ONE agent context window
- Binary acceptance criteria only (Pass/Fail)

**Compounding Context**

- Every bug fixed or lesson learned must be "codified" into the system's memory
- `.mdc` rules for style/architecture decisions
- [`agents.md`](http://agents.md) for tactical knowledge and gotchas
- Ensures the same error never occurs twice

---

# 2. The Strata Directory Structure

All projects **MUST** strictly adhere to this standardized topology to ensure agent autonomy.

### Complete Directory Tree

```
project-root/
├── .cursor/
│   └── rules/
│       └── global.mdc       # The "Constitution": Tech stack, critical constraints
├── logs/
│   └── progress.txt         # Short-Term Memory: Active PPRE cycle logs
├── scripts/
│   └── sdd/
│       └── [autopilot.sh](http://autopilot.sh)     # The Engine: Automates Plan → Reset → Execute loop
├── docs/
│   ├── specs/               # INPUT LAYER
│   │   ├── [prd.md](http://prd.md)           # Source of Truth (Business Logic)
│   │   └── stories.json     # Executable Atoms with Binary Acceptance Criteria
│   ├── reference/           # CONTEXT SHARDING (Loaded on-demand only)
│   │   ├── api_[guidelines.md](http://guidelines.md)
│   │   ├── db_[schema.md](http://schema.md)
│   │   └── ui_[patterns.md](http://patterns.md)
│   └── done_specs/          # ARCHIVE: Completed stories.json files
└── src/
    └── components/
        └── [agents.md](http://agents.md)        # Long-Term Memory: Tacit knowledge & bug prevention
```

### Component Roles

**`.cursor/rules/global.mdc`** - The Constitution

- Always loaded by the AI
- Contains universal, high-level rules
- Must be < 200 lines to prevent context overload
- Examples: "Use TypeScript", "No console.logs in production"

**`logs/progress.txt`** - Short-Term Memory

- Session-level continuity between PPRE cycles
- Format: `[YYYY-MM-DD HH:MM] ✅/❌ STORY-ID: Description`
- Cleared or archived after epic completion

**`scripts/sdd/[autopilot.sh](http://autopilot.sh)`** - The Execution Engine

- Automates the PPRE cycle
- Enforces the Kill Switch (context reset)
- Handles git commits and story verification

**`docs/specs/[prd.md](http://prd.md)`** - The Blueprint

- Single source of truth for business logic
- Must include: Mission, Technical Architecture, Data Dictionary, Implementation Plan
- Overrides chat history in all conflicts

**`docs/specs/stories.json`** - The Execution Contract

- Array of atomic tasks
- Each story has binary `acceptance_criteria`
- Agent self-verifies and marks `passes: true/false`

**`docs/reference/*.md`** - Context Sharding Layer

- Loaded **on-demand only**
- Prevents "Context Poisoning"
- Example: Load `auth_[flow.md](http://flow.md)` only when working on auth

**`src/**/[agents.md](http://agents.md)` - Long-Term Memory

- Fractal: Lives in every relevant directory
- Contains: Critical Lessons, Known Issues, Local Conventions, Dependencies
- Date-stamped entries for timeline tracking

---

# 3. The Workflows

## Phase 1: The Blueprint (PRD)

**Rule:** The Chat History is ephemeral; the PRD is the absolute truth.

**Location:** `docs/specs/[prd.md](http://prd.md)`

**Required Sections:**

1. **Mission:** What problem are we solving?
2. **Technical Architecture:** High-level system design
3. **Data Dictionary:** All entities, fields, relationships
4. **Implementation Plan:** Step-by-step breakdown

**Validation:** PRD must be approved by stakeholders before any coding begins.

## Phase 2: Atomic Decomposition

**Action:** Convert [`prd.md`](http://prd.md) into `docs/specs/stories.json`

**The Atomicity Rule:**

- A "Story" must be small enough to be completed in **one single agent context window**
- Approximately 1 file or 1 function
- If it requires "figuring things out", it's research, not a story

**Validation:**

- Every story MUST have an `acceptance_criteria` array
- Criteria must be **Binary (Pass/Fail)**
- Vague criteria (e.g., "Make it look good") are **prohibited**

**Example Story:**

```json
{
  "id": "AUTH-03",
  "description": "Add JWT token validation middleware",
  "files_to_touch": ["src/middleware/auth.ts"],
  "acceptance_criteria": [
    "Middleware function named 'validateJWT' exists",
    "Returns 401 status code for invalid tokens",
    "Attaches decoded user object to req.user on success"
  ],
  "passes": false
}
```

## Phase 3: The PPRE Execution Loop

Agents must not "vibe code." They must follow the **PPRE Cycle** enforced by `scripts/sdd/[autopilot.sh](http://autopilot.sh)`:

### 1. PRIME

- Load **only** the current story from `stories.json`
- Load relevant `docs/reference/` files
- Do NOT load the entire chat history

### 2. PLAN

- Generate a specific implementation plan in the chat
- Plan is saved to context
- Human reviews and approves the plan

### 3. RESET (The Kill Switch) ⚠️

- **Critical:** Clear the context window/chat history
- This prevents "Context Rot"
- Only the approved Plan and relevant files remain in context

### 4. EXECUTE

- Write code based strictly on the Plan and Story constraints
- No improvisation or "creative interpretation"
- Follow binary acceptance criteria exactly

### 5. VERIFY

- Agent checks its own code against `acceptance_criteria`
- Each criterion must evaluate to Pass or Fail
- No partial passes allowed

### 6. COMMIT

- If all criteria pass: Set `"passes": true` in JSON
- Log to `logs/progress.txt` with timestamp
- Git commit with story ID in message
- If any criterion fails: Update [`agents.md`](http://agents.md) with lesson learned

---

# 4. Context Management Strategy

## Context Sharding

To prevent "Context Poisoning" (confusing the AI with too much info), we strictly separate context:

**Global Context** (`.cursor/rules/global.mdc`)

- Always loaded
- Contains strictly high-level rules
- Examples: "Use TypeScript", "No console.logs in production", "Follow PPRE cycle"
- Constraint: < 200 lines

**On-Demand Context** (`docs/reference/`)

- Loaded **only** when requested
- Mechanism: If working on Auth, load `docs/reference/auth_[flow.md](http://flow.md)`
- Do NOT load `ui_[components.md](http://components.md)` when working on Auth
- Prevents information overload

## Memory Systems

**Short-Term Memory** (`logs/progress.txt`)

- **Question it answers:** "What did I just do?"
- **Purpose:** Maintain continuity between PPRE cycles without bloating context
- **Format:** Timestamped log entries
- **Lifespan:** Current epic or sprint

**Long-Term Memory** (`src/**/[agents.md](http://agents.md)`)

- **Question it answers:** "What have I learned?"
- **Purpose:** Store project-specific nuances and prevent repeated errors
- **Lifespan:** Permanent (until architecture change)
- **Examples:**
    - "This API endpoint requires a specific header format"
    - "Button.tsx has a known z-index issue with Modal.tsx"
    - "Use react-hook-form with zod validation for all forms"

---

# 5. System Evolution (The "Compounding" Effect)

When a bug or failure occurs during the PPRE Loop:

### Step 1: Fix the Code

- This is **Linear work**
- Solves the immediate problem
- Does NOT prevent future occurrences

### Step 2: MANDATORY - Update the System

- This is **Exponential work**
- Ensures the system learns

**Decision Tree:**

**If it was a logic error:**

- → Update `src/**/[agents.md](http://agents.md)` with a warning
- Example: "Warning: The `/users` API returns strings for IDs, not numbers"

**If it was a style error:**

- → Update `.cursor/rules/global.mdc`
- Example: "All API calls must use the centralized `apiClient` wrapper"

**If it was a process error:**

- → Update `docs/reference/[workflow.md](http://workflow.md)`
- Example: "Always run type-check before committing"

<aside>
⚠️

**Mandate:** If you fix a bug manually and do not update a `.md` file, you have **failed the protocol**. The system has not learned.

</aside>

### Objective

The system must be **smarter at the end of the day** than it was at the start.

---

# 6. Implementation Instructions

### For Your Repository

**1. Save this specification:**

- Create a file: `docs/strata_[framework.md](http://framework.md)`
- Copy the directory structure and workflow protocols
- Customize for your tech stack

**2. Reference in your Constitution:**

- In `.cursor/rules/global.mdc`, add at the top:
    
    ```
    YOU MUST FOLLOW THE ARCHITECTURE AND WORKFLOWS DEFINED IN `docs/strata_[framework.md](http://framework.md)`.
    ```
    

**3. Use as Context:**

- When starting a new feature or PRD:
    - Drag `docs/strata_[framework.md](http://framework.md)` into the chat
    - This tells the Agent "who it is" and how to work

**4. Automate with [autopilot.sh](http://autopilot.sh):**

- Create `scripts/sdd/[autopilot.sh](http://autopilot.sh)` to enforce PPRE cycle
- Script should:
    - Read `stories.json`
    - Loop through stories with `passes: false`
    - Invoke AI with PRIME → PLAN → RESET → EXECUTE
    - Verify and commit

---

<aside>
🔗

**Related Resources:**

- [Strata Dev Framework The compounding AI Playbook](Strata%20Dev%20Framework%20The%20compounding%20AI%20Playbook%202eaacc211ff180fa90d5d8d118437f9f.md) - Implementation guide
- Framework Overview PDF - Philosophy deep dive
- The Complete Developer Handbook - Advanced patterns
- PPRE Cycle PDF - Detailed workflow breakdown
</aside>