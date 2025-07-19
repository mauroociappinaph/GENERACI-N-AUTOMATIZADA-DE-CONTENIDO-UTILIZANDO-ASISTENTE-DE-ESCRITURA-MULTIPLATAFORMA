# Hook System Flow Diagram

## 🎯 Trigger Events and Hook Activation

### Event 1: File Edit (tasks.md, requirements.md)

```
📝 User edits tasks.md
    ↓
📋 Epic Manager Hook Activated
    ↓
🔍 Analyze file changes
    ├── New tasks detected? → Create Epic structure
    ├── Task status changed? → Update Epic progress
    └── Task completed? → Mark in Epic tracking
    ↓
📊 Update Epic Progress Tracking:
    ├── Total Sub-Issues: X
    ├── Completed: Y/X (Z%)
    ├── In Progress: W/X
    └── Phase: [Planning|Development|Testing|Complete]
```

### Event 2: Git Commit

```
💻 User makes git commit
    ↓
🤖 Project Manager Hook + 🔄 Auto Closer Hook (Parallel)
    ↓
┌─────────────────────────┬─────────────────────────┐
│   🤖 Project Manager    │   🔄 Issue Auto Closer  │
├─────────────────────────┼─────────────────────────┤
│ 1. Parse commit message │ 1. Parse commit message │
│ 2. Detect keywords      │ 2. Find explicit closes │
│ 3. Check project health │ 3. Smart context match  │
│ 4. Update milestones    │ 4. Close related issues │
│ 5. Generate reports     │ 5. Update Epic parents  │
└─────────────────────────┴─────────────────────────┘
    ↓
📊 Consolidated Actions:
    ├── Issues closed
    ├── Epics updated
    ├── Progress recalculated
    └── Reports generated
```

## 🔗 Hook Relationships and Data Flow

### Data Sharing Between Hooks:

```
📋 Epic Manager creates:
    ├── Epic Issues (#13, #14, #15...)
    ├── Sub-Issue relationships
    └── Progress tracking structure

🤖 Project Manager reads:
    ├── Epic relationships from GitHub
    ├── Issue states and assignees
    └── Commit references to issues

🔄 Auto Closer updates:
    ├── Issue states (open → closed)
    ├── Epic progress (via Project Manager)
    └── Parent-child relationships
```

### Synchronization Points:

```
1. Epic Creation (Epic Manager)
   ↓
2. Issue Assignment (Manual/External)
   ↓
3. Development Work (Code changes)
   ↓
4. Commit with References (Auto Closer + Project Manager)
   ↓
5. Epic Progress Update (All hooks coordinate)
   ↓
6. Project Status Report (Project Manager)
```

## ⚡ Real-Time Example Flow

### Scenario: Working on AI Content Feature

```
Step 1: Planning Phase
📝 Edit tasks.md → Add "14.2 Create AI content database schema"
    ↓
📋 Epic Manager activates:
    ├── Detects new AI content task
    ├── Creates Epic: "🤖 AI Content System (#50)"
    ├── Creates Sub-Issue: "🗄️ Database Schema (#51)"
    ├── Creates Tasks: "Create templates table (#52)"
    └── Links: #52 → #51 → #50

Step 2: Development Phase
💻 Work on database schema
💻 Commit: "feat: create content_templates table - Fixes #52"
    ↓
🤖 Project Manager + 🔄 Auto Closer activate:
    ├── Auto Closer: Closes #52 (keyword "Fixes")
    ├── Project Manager: Updates Epic #50 progress
    ├── Recalculates: "Completed: 1/3 (33%)"
    └── Updates Epic #51 status

Step 3: Completion Phase
💻 Complete all database tasks
💻 Commit: "feat: complete database schema - Closes #51"
    ↓
🤖 Project Manager detects:
    ├── Sub-Issue #51 completed
    ├── Updates Epic #50: "Completed: 1/3 (33%)"
    ├── Checks if Epic #50 should close
    └── Generates progress report
```

## 🎛️ Hook Configuration Summary

| Hook               | Trigger    | Frequency           | Primary Function             |
| ------------------ | ---------- | ------------------- | ---------------------------- |
| 📋 Epic Manager    | File Edit  | On tasks.md changes | Create/Update Epic structure |
| 🤖 Project Manager | Git Commit | Every commit        | Overall project coordination |
| 🔄 Auto Closer     | Git Commit | Every commit        | Close issues automatically   |

## 🔄 Feedback Loops

```
Epic Manager → Creates structure
    ↓
Project Manager → Tracks progress
    ↓
Auto Closer → Closes completed work
    ↓
Epic Manager → Updates structure (next cycle)
```

This creates a self-maintaining project management system that evolves with your development workflow.
