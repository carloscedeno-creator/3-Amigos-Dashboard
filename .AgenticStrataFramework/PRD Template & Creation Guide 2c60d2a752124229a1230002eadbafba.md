# PRD Template & Creation Guide

**Version:** 1.0 | **Type:** Spec-Driven Development Template

<aside>
🎯

This guide shows you how to create **professional Product Requirements Documents (PRDs)** in 30 minutes using AI, aligned with the Strata Dev Framework's spec-driven development philosophy.

**What you'll get:** A complete PRD ready to be converted into `stories.json` for atomic execution.

</aside>

---

# 📦 What's Inside

**2 AI Prompts + This Guide = Complete PRD System**

1. **ChatGPT Scaffold Prompt** - Creates PRD structure + Claude prompt
2. **Claude Generation Prompt** - Generates detailed 15-20 page PRD
3. **Review & Polish Prompt** - Reviews and improves your PRD
4. **Strata Conversion Guide** - How to convert PRD → `stories.json`

That's it! No complex setup, no multiple documents to manage.

---

# 🚀 How It Works (4 Simple Steps)

## Step 1: Generate Your PRD Creation Prompt (5 minutes)

**Using ChatGPT (GPT-4 recommended):**

### Scaffold Prompt Template

```markdown
You are a senior product manager creating a PRD for a new AI project.

Project Description: [YOUR PROJECT DESCRIPTION HERE]

Create a comprehensive prompt for Claude that will generate a complete PRD with these sections:

1. Executive Summary
2. Problem Statement
3. Solution Overview
4. User Personas
5. Technical Architecture
6. Functional Requirements (as user stories)
7. API Specifications
8. Implementation Plan
9. Success Metrics
10. Risk Assessment

The PRD must follow the Strata Dev Framework principles:
- Spec-driven (PRD is source of truth)
- Atomic decomposition (requirements broken into verifiable units)
- Binary acceptance criteria (Pass/Fail only)
- Implementation-ready (developers can start immediately)

Format the prompt so Claude will generate a 15-20 page professional document.
```

**Action:**

1. Replace `[YOUR PROJECT DESCRIPTION HERE]` with your project
2. Paste into ChatGPT
3. **Result:** Complete prompt ready for Claude

## Step 2: Generate Your PRD (5 minutes)

**Using Claude:**

1. Copy ChatGPT's entire response
2. Paste directly into Claude chat
3. **Result:** 15-20 page professional PRD

<aside>
💡

**Pro Tip:** Claude Pro generates faster, but any tier works. If the response is cut off, simply type "continue" to get the rest.

</aside>

## Step 3: Review & Polish (5 minutes)

**Using ChatGPT again:**

### Review Prompt Template

```markdown
Review this PRD for completeness and quality. Check for:

1. Vague requirements (flag anything that isn't binary/verifiable)
2. Missing technical details
3. Unrealistic timelines
4. Gaps in user stories or acceptance criteria
5. Missing API specifications
6. Unclear success metrics

Provide specific suggestions for improvement.

PRD:
[PASTE YOUR PRD HERE]
```

**Action:**

1. Paste your PRD from Claude
2. Apply ChatGPT's suggestions
3. **Result:** Production-ready PRD

## Step 4: Convert to Stories.json (15 minutes)

Now convert your PRD into atomic, executable stories.

### Conversion Prompt for ChatGPT

```markdown
Convert this PRD into a stories.json file following the Strata Dev Framework format.

For each functional requirement, create atomic stories that:
- Are completable in ONE context window (1 file or 1 function)
- Have binary acceptance criteria (Pass/Fail only)
- Specify exact files to touch
- Are ordered by dependency

Format:
{
  "epic": "Epic Name",
  "stories": [
    {
      "id": "EPIC-01",
      "description": "Atomic task description",
      "files_to_touch": ["path/to/file.ts"],
      "acceptance_criteria": [
        "Specific, binary criterion 1",
        "Specific, binary criterion 2"
      ],
      "passes": false
    }
  ]
}

PRD:
[PASTE YOUR PRD HERE]
```

**Result:** Ready-to-execute `stories.json` file

**Total Time: 30 minutes**

**Total Effort: 4 copy-paste operations**

---

# ✅ What You Get

After 30 minutes, you'll have a comprehensive PRD with:

### 📄 Documentation

- **Executive Summary** - Clear vision and objectives
- **Problem Statement** - Market-backed pain points
- **Solution Overview** - Technical approach and differentiators
- **User Personas** - Detailed target user profiles
- **Technical Architecture** - Complete system design

### 🔧 Implementation Ready

- **Functional Requirements** - User stories with acceptance criteria
- **API Specifications** - Endpoints and data models
- **Implementation Plan** - Sprint timeline and team needs
- **Success Metrics** - Measurable KPIs and targets
- **Risk Assessment** - Identified risks with mitigation strategies

### ⚙️ Strata Framework Integration

- **stories.json** - Atomic, executable tasks
- **Binary Acceptance Criteria** - No ambiguity
- **File-level Granularity** - Agent knows exactly what to touch
- **PPRE Cycle Ready** - Can start Prime → Plan → Reset → Execute immediately

---

# 🛠️ What You Need

## Required Tools

- **ChatGPT** (GPT-4 access recommended)
- **Claude** (any tier works, Pro is faster)
- **Text Editor** (for saving your PRD and stories.json)

## No Setup Required

- ❌ No Claude Projects to configure
- ❌ No complex prompt engineering
- ❌ No multiple documents to track
- ❌ No technical knowledge needed

---

# 💡 Pro Tips for Better Results

## For Your Project Description

**Be specific about:**

- ✅ Target users and main goal
- ✅ Key integrations or platforms
- ✅ Constraints (budget, timeline, team size)
- ✅ **Focus on WHAT you're building**, not HOW

### Example Descriptions

**Good Examples ✅**

*"A commercial furniture design assistant that generates 3D renders using real, in-stock SKUs from our catalog. Target users are furniture dealers creating proposals for corporate clients. Must integrate with existing PIM system and validate pricing/availability in real-time."*

*"An AI-powered code review system that checks PRs against our .cursor/rules/global.mdc constitution and suggests updates to [agents.md](http://agents.md) files when bugs are fixed. For engineering teams using the Strata Dev Framework."*

**Bad Examples ❌**

*"An AI thing that helps people"*

*"A chatbot using machine learning"*

---

# 🎯 Success Indicators

## Your PRD is ready when:

- ✅ **15+ pages** of detailed content
- ✅ **All 10 sections** are comprehensive
- ✅ **Developers can start building** from your specs
- ✅ **ChatGPT review** shows only minor improvements needed
- ✅ **stories.json** has 10-30 atomic stories
- ✅ **All acceptance criteria** are binary (Pass/Fail)

## Red Flags 🚩

- 🚩 **Under 10 pages** - Too generic or missing details
- 🚩 **Vague requirements** - "User-friendly interface" instead of specific user stories
- 🚩 **No technical specs** - Developers can't estimate effort
- 🚩 **Impossible timeline** - 6 months of work planned for 6 weeks
- 🚩 **Subjective criteria** - "Should look modern" instead of "Uses Tailwind class rounded-lg"

---

# 🔄 Common Customizations

Add these to your ChatGPT Scaffold Prompt for specific needs:

### For MVPs

*"Focus on MVP features only. Mark advanced features as 'Phase 2'. Prioritize time-to-market over feature completeness."*

### For Startups

*"Include investor pitch elements and clear monetization strategy. Focus on market differentiation and competitive analysis."*

### For Enterprise

*"Include compliance requirements (SOC2, GDPR, OWASP) and enterprise features like SSO, audit logs, and role-based access control."*

### For Agentic Systems

*"Include guardrails, confidence gates, HITL/EITL decision points, and fallback strategies. Define MCP tools and context management approach."*

---

# 🚨 Troubleshooting

## Problem: ChatGPT scaffold too generic

**Solution:** Add more specific context about your industry, users, and main goal. Include technical constraints upfront.

## Problem: Claude PRD missing technical details

**Solution:** Ask Claude to "expand the technical architecture section with more implementation details, including tech stack, data flow, and integration points."

## Problem: PRD doesn't feel like your project

**Solution:** Include your specific use case, target market, and key differentiators in the initial description. Mention your company's domain (e.g., "commercial furniture", "e-commerce").

## Problem: Timeline seems unrealistic

**Solution:** Specify your team size and timeline constraints in the ChatGPT prompt. Example: "We have 2 full-time engineers and need to launch MVP in 6 weeks."

## Problem: stories.json has stories that are too big

**Solution:** Ask ChatGPT to "break down any story that requires changes to more than 2 files into smaller atomic stories."

---

# 🎯 After Your PRD is Complete

## Immediate Next Steps (Week 1)

1. **Share with stakeholders** - Get feedback and approval
2. **Technical review** - Have @Christian Mejia or tech lead assess feasibility
3. **User validation** - Show to 5-10 potential customers
4. **MVP scoping** - Identify minimum viable features
5. **Save to docs/specs/** - Store [`prd.md`](http://prd.md) and `stories.json` in your repo

## Development Ready (Month 1)

- **Development team** can start building using PPRE cycle
- **User stories** ready for sprint planning
- **Success metrics** defined for tracking progress
- **Risk mitigation** plans in place
- [**agents.md](http://agents.md) files** can start accumulating lessons learned

---

# 📖 Example: Login Feature PRD to Stories.json

## PRD Excerpt

**Functional Requirement 3.1: User Authentication**

Users must be able to log in using email and password. The system must validate credentials, generate JWT tokens, and handle failed login attempts.

**Acceptance Criteria:**

- User can submit email and password
- System validates credentials against database
- On success: JWT token returned with 24hr expiration
- On failure: Clear error message shown
- After 5 failed attempts: Account locked for 15 minutes

## Converted to stories.json

```json
{
  "epic": "User Authentication",
  "stories": [
    {
      "id": "AUTH-01",
      "description": "Create Login Form Component",
      "files_to_touch": ["src/components/LoginForm.tsx"],
      "acceptance_criteria": [
        "Component exports 'LoginForm'",
        "Contains email input field with type='email'",
        "Contains password input field with type='password'",
        "Contains submit button",
        "Submit button is disabled when fields are empty"
      ],
      "passes": false
    },
    {
      "id": "AUTH-02",
      "description": "Create login API endpoint",
      "files_to_touch": ["src/api/auth.ts"],
      "acceptance_criteria": [
        "POST /api/auth/login endpoint exists",
        "Accepts JSON body with email and password",
        "Returns 200 + JWT token on valid credentials",
        "Returns 401 on invalid credentials",
        "JWT token has 24hr expiration"
      ],
      "passes": false
    },
    {
      "id": "AUTH-03",
      "description": "Add failed login attempt tracking",
      "files_to_touch": ["src/api/auth.ts", "src/models/user.ts"],
      "acceptance_criteria": [
        "failed_attempts counter exists in User model",
        "Counter increments on failed login",
        "Counter resets to 0 on successful login",
        "Returns 429 (Too Many Requests) after 5 failures",
        "Lock expires after 15 minutes"
      ],
      "passes": false
    }
  ]
}
```

**Notice:**

- Each story touches 1-2 files maximum
- All criteria are binary (you can verify Pass/Fail)
- Stories are ordered by dependency
- Ready for PPRE cycle execution

---

# 📈 Expected ROI

## Time Savings

- **Traditional PRD creation:** 2-3 weeks
- **With this system:** 30 minutes
- **Time saved:** 95%+ reduction

## Quality Improvements

- **Professional formatting** from day one
- **Comprehensive coverage** of all critical sections
- **Technical depth** typically requiring senior PM experience
- **Consistent quality** across all projects
- **Framework-aligned** - Ready for Strata Dev workflow

## Risk Reduction

- **Clear specifications** reduce misunderstandings
- **Binary criteria** eliminate "definition of done" debates
- **Atomic stories** prevent scope creep
- **Early validation** catches issues before coding

---

# 🔗 Integration with Strata Dev Framework

## PRD as "The Constitution" for Your Feature

<aside>
⚙️

Remember from [Core Technical Specification](Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md): **The Chat History is ephemeral; the PRD is the absolute truth.**

</aside>

### How PRD Fits in the Framework

1. **Phase 1: The Blueprint (PRD)** ← You are here
    - Create PRD using this guide (30 min)
    - Get stakeholder approval
    - Store in `docs/specs/[prd.md](http://prd.md)`
2. **Phase 2: Atomic Decomposition**
    - Convert PRD → `stories.json` (15 min)
    - Validate atomicity (each story = 1 context window)
    - Ensure binary acceptance criteria
3. **Phase 3: PPRE Execution**
    - Run [autopilot.sh](http://autopilot.sh) or manual PPRE cycles
    - Prime → Plan → Reset → Execute
    - Update [`agents.md`](http://agents.md) with lessons learned

### PRD Maintenance

**When to update your PRD:**

- ❌ **NOT** every time you fix a bug (that goes in [`agents.md`](http://agents.md))
- ✅ **YES** when requirements change or scope shifts
- ✅ **YES** when stakeholders request new features
- ✅ **YES** when technical constraints force architecture changes

**Version control:**

- Keep PRD in git alongside code
- Use semantic versioning (v1.0, v1.1, v2.0)
- Archive old versions in `docs/done_specs/` when major version changes

---

# 💼 Use Cases

This system works for:

- 🏢 **Enterprise Features** - Planning major feature additions
- 🚀 **Startup MVPs** - Rapid prototyping and validation
- 🤖 **Agentic Systems** - Designing AI agent workflows
- 🔧 **Platform Tools** - Internal tooling and automation
- 📊 **Data Pipelines** - ETL and data processing systems
- 🌐 **API Services** - Microservices and backend APIs

---

# 🎯 Remember

**The key to success:** Be specific in your project description. The more context you provide about your users, goals, and constraints, the better your PRD will be.

**This isn't magic:** It's a systematic process that combines the strengths of ChatGPT (structure) and Claude (depth) to create professional documentation in minutes instead of weeks.

**Start now:** Pick your next feature or project and run through the process. Your first PRD will be ready in 30 minutes.

---

<aside>
🔗

**Related Framework Resources:**

- [Strata Dev Framework The compounding AI Playbook](Strata%20Dev%20Framework%20The%20compounding%20AI%20Playbook%202eaacc211ff180fa90d5d8d118437f9f.md) - Implementation guide
- [Core Technical Specification](Core%20Technical%20Specification%2061087d4cd5cd48d2a9a58048d24689d7.md) - PRD → stories.json workflow
- Framework Overview PDF - Philosophy of spec-driven development
- The Complete Developer Handbook - Advanced PRD patterns
</aside>

---

*Happy building! 🚀*