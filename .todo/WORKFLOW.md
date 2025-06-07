# SkyGit Task Management Workflow

## Overview
This document outlines the workflow for managing tasks in the SkyGit project using our PROJECT_TODO.md master list and detailed task files.

## Directory Structure
```
/
├── PROJECT_TODO.md          # Master task list with links
├── PROJECT_PRIORITIES.md    # Current priority tasks
├── CLAUDE.md               # AI assistant instructions
└── .todo/                  # Detailed task files
    ├── WORKFLOW.md         # This file
    ├── TASK_TEMPLATE.md    # Template for new tasks
    └── P{phase}-{number}-{name}.md  # Individual task files
```

## Task File Naming Convention
`P{phase}-{number}-{task-name}.md`

Examples:
- `P1-001-file-upload.md`
- `P2-003-conversation-export.md`
- `P3-012-voice-messages.md`

## Workflow Steps

### 1. Task Planning
1. Add new tasks to PROJECT_TODO.md under appropriate phase
2. Use checkbox format: `- [ ] Task description → [Details](.todo/P{phase}-{number}-{name}.md)`
3. Update PROJECT_PRIORITIES.md if task is high priority

### 2. Task Breakdown
1. Before starting any task, create detailed subtask file in `.todo/` directory
2. Use TASK_TEMPLATE.md as starting point
3. Break down task into specific, actionable subtasks
4. Define clear acceptance criteria
5. Identify dependencies and blockers

### 3. Task Review
1. Share subtask breakdown for review
2. Get approval before starting implementation
3. Update any requirements based on feedback

### 4. Implementation
1. Update task status to "In Progress"
2. Check off subtasks as completed
3. Update progress log regularly
4. Document any blockers or questions

### 5. Completion
1. Ensure all acceptance criteria are met
2. Update task status to "Completed"
3. Check off task in PROJECT_TODO.md
4. Move to "Completed Tasks" section if appropriate

## Task States
- **Not Started**: Task planned but not begun
- **In Progress**: Actively being worked on
- **Completed**: All criteria met and tested
- **Blocked**: Cannot proceed due to dependencies

## Best Practices
1. Always create detailed subtask file before starting
2. Keep PROJECT_PRIORITIES.md updated with current focus
3. Document blockers and questions in task files
4. Update progress logs for transparency
5. Link related tasks to show dependencies

## For AI Assistants
When asked to work on a task from PROJECT_TODO.md:
1. Check if detailed subtask file exists
2. If not, create one using TASK_TEMPLATE.md
3. Present subtask breakdown for approval
4. Only proceed with implementation after approval