---
description: "Guidelines for writing Node.js and JavaScript code with Vitest testing"
applyTo: '**/*.js, **/*.mjs, **/*.cjs'
---

# Code Generation Guidelines

# Commands
- Run tests with `npm test`

## Project Guardrails
- Prefer the simplest change that satisfies the request; avoid broadening scope without confirmation
- Keep tests aligned to the current data format unless the user explicitly asks for legacy coverage
- Do not remove or replace requested tests; adjust them to the current format instead
- When a change might alter behavior outside the asked scope, pause and confirm

## Coding standards
- Use JavaScript with ES2022 features and Node.js (20+) ESM modules
- Use Node.js built-in modules and avoid external dependencies where possible
- Ask the user if you require any additional dependencies before adding them
- Always use async/await for asynchronous code
- Keep the code simple and maintainable
- Use descriptive variable and function names
- Do not add comments except for the classes and larger functions, the code should be self-explanatory
- Never use `null`, always use `undefined` for optional values
- Prefer functions over classes, use classes for grouping and when new renderable "windows" should be shown

## Folders
- Ignore the _dist_ folder as that is rendered data
- When adding text that will be rendered on the DOM, use localization in the _lang_ folder

## Testing
- Use Vitest for testing, `npm test`
- Write tests for all new features and bug fixes
- Ensure tests cover edge cases and error handling
- NEVER change the original code to make it easier to test, instead, write tests that cover the original code as it is

## Documentation
- When adding new features or making significant changes, update the README.md file where necessary

## User interactions
- Ask questions if you are unsure about the implementation details, design choices, or need clarification on the requirements
- Always answer in the same language as the question, but use english for the generated content like code, comments or docs
