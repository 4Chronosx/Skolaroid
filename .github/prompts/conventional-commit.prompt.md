---
name: conventional-commit
description: 'Prompt and workflow for generating conventional commit messages using a structured XML format. Guides users to create standardized, descriptive commit messages in line with the Conventional Commits specification, including instructions, examples, and validation.'
model: GPT-4o (copilot)
---

### Instructions

```xml
	<description>This file contains a prompt template for generating conventional commit messages. It provides instructions, examples, and formatting guidelines to help users write standardized, descriptive commit messages in accordance with the Conventional Commits specification.</description>
```

### Workflow

**Follow these steps:**

1. Run `git status` to review changed files.
2. Run `git diff` or `git diff --cached` to inspect changes.
3. Stage your changes with `git add <file>`.
4. Construct your commit message using the following XML structure.
5. **IMPORTANT:** Ensure all lines (subject, body, footer) are ≤100 characters.
6. After generating your commit message, Copilot will automatically run the following command in your integrated terminal (no confirmation needed):

```bash
git commit -m "type(scope): description"
```

7. Just execute this prompt and Copilot will handle the commit for you in the terminal.

### Commit Message Structure

```xml
<commit-message>
	<type>feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert</type>
	<scope>()</scope>
	<description>A short, imperative summary of the change (max 100 chars)</description>
	<body>(optional: more detailed explanation - EACH LINE max 100 chars)</body>
	<footer>(optional: e.g. BREAKING CHANGE: details, or issue references)</footer>
</commit-message>
```

**IMPORTANT:** This project enforces a 100-character maximum line length for ALL commit message lines (subject, body, and footer). Keep each line concise or split longer explanations across multiple short lines.

### Examples

```xml
<examples>
	<example>feat(parser): add ability to parse arrays</example>
	<example>fix(ui): correct button alignment</example>
	<example>docs: update README with usage instructions</example>
	<example>refactor: improve performance of data processing</example>
	<example>chore: update dependencies</example>
	<example>feat!: send email on registration (BREAKING CHANGE: email service required)</example>
	<example-with-body>
		fix(prisma): resolve duplicate fields and add missing relations

		Body: Removed duplicate fields. Added missing relations.
		(Each line under 100 characters)
	</example-with-body>
</examples>
```

### Validation

```xml
<validation>
	<type>Must be one of the allowed types. See <reference>https://www.conventionalcommits.org/en/v1.0.0/#specification</reference></type>
	<scope>Optional, but recommended for clarity.</scope>
	<description>Required. Use the imperative mood (e.g., "add", not "added"). Max 100 chars.</description>
	<body>Optional. Use for additional context. EACH LINE must be ≤100 characters.</body>
	<footer>Use for breaking changes or issue references. Max 100 chars per line.</footer>
	<line-length>ALL lines (subject, body, footer) must not exceed 100 characters.</line-length>
</validation>
```

### Final Step

```xml
<final-step>
	<cmd>git commit -m "type(scope): description"</cmd>
	<cmd-with-body>git commit -m "type(scope): description" -m "Short body message under 100 chars."</cmd-with-body>
	<note>Replace with your constructed message. Keep all lines ≤100 characters.</note>
	<tip>If body is too long, break into multiple short sentences or omit the body entirely.</tip>
	<tip>Use concise language: "Fixed X. Added Y." instead of longer descriptions.</tip>
</final-step>
```
