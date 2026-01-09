# CLAUDE.md

## How to work
- Start with a brief plan (3–7 bullets) before changing code.
- Prefer small, incremental changes over large refactors.
- If requirements are unclear, state assumptions explicitly instead of guessing.

## Commit Messages
- Use Conventional Commits for messages.
- Prefer short, single-line commit messages by default.
- Add a commit body only when explaining non-obvious decisions or performance tradeoffs.
- Do not include AI attribution footers (e.g., Co-Authored-By) unless I explicitly ask. This is to keep commits clean - AI Attribution will be added in a deliverable document/README.
- Make sure to show the proposed commit message and wait for explicit approval before running the git commit command.


## Optimize for:
- Problem-solving: reproduce issues, identify bottlenecks, and explain root cause before proposing changes.
- Performance: prefer query efficiency, indexing, and reduced payloads; measure before/after.
- Code quality: clean changes, good naming, minimal complexity.
- Commit history: make regular, meaningful commits that tell the story.
- UI/UX: make data easy to read (formatting, labels, loading states).

## Safety & correctness
- Do not introduce security risks (e.g., SQL injection, unsafe input handling).
- Do not log secrets or sensitive data.
- Validate external inputs at boundaries.

## When unsure
- Offer 1–2 options with tradeoffs and pick one with justification.
