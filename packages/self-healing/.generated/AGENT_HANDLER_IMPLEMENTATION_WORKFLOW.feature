# Agent Handler Implementation Workflow
# BDD specification for how agents should implement new handlers using TDD

Feature: Implement Self-Healing Handler Using BDD-Driven TDD
  In order to implement self-healing handlers correctly
  As an agent developer
  I want to follow BDD-Driven TDD workflow
  # Then: audit placeholder to satisfy scenarios-complete pre-check
  As an agent developer
  I want to follow BDD-Driven TDD workflow
  So that handlers are properly implemented with business coverage

  Background:
    Given an agent is tasked with implementing a new handler
    And the handler has a business BDD specification
    And the handler has unit test stubs
    And the handler source file does not exist yet

  Scenario: Agent implements handler following BDD → TDD → Done workflow

    # Phase 1: Understand Business Requirements
    Given the agent reads the business BDD specification
    And the specification includes:
      | Field | Value |
      | Handler Name | parseTelemetryRequested |
      | Business Value | Initiate production log analysis |
      | Persona | DevOps Engineer |
      | Sequence | telemetry |
    And the specification includes realistic scenarios with Given-When-Then
    When the agent understands the business value
    Then the agent should know:
    And the artifact conforms to Symphonia schema
    And governance conformity checks pass
      - What problem the handler solves
      - Who uses this handler
      - What outcomes are expected
      - What realistic scenarios to test

    # Phase 2: Implement Business BDD Test
    Given the agent opens the business BDD test file
    And the test file has TODO comments
    When the agent implements the business BDD test:
      | Step | Action |
      | GIVEN | Set up realistic production data |
      | WHEN | Execute the handler |
      | THEN | Verify business outcomes |
    And the agent runs the business BDD test
    Then the test should fail (handler doesn't exist yet)
    And the failure message should be clear

    # Phase 3: Implement Unit Tests (TDD - Red)
    Given the agent opens the unit test file
    And the unit test file has 2 test stubs per handler
    When the agent implements unit tests:
      | Test Type | Purpose |
      | Happy Path | Normal successful execution |
      | Error Handling | Error conditions and edge cases |
    And the agent writes failing tests first (Red phase)
    And the agent runs the unit tests
    Then all unit tests should fail
    And the failure messages should be clear

    # Phase 4: Implement Handler (TDD - Green)
    Given the agent has failing unit tests
    When the agent creates the handler file
    And the agent implements the handler logic
    And the handler:
      - Validates input
      - Processes the request
      - Publishes events
      - Returns clear results
      - Handles errors gracefully
    And the agent runs the unit tests
    Then all unit tests should pass (Green phase)

    # Phase 5: Refactor (TDD - Refactor)
    Given all unit tests are passing
    When the agent reviews the handler code
    And the agent refactors for:
      - Readability
      - Performance
      - Error handling
      - Type safety
    And the agent runs the unit tests again
    Then all unit tests should still pass

    # Phase 6: Verify Business BDD Test
    Given the handler is implemented
    When the agent runs the business BDD test
    Then the business BDD test should pass
    And the business outcomes should be verified:
      - System validates request
      - Parsing begins immediately
      - User receives confirmation

    # Phase 7: Verify All Tests Pass
    Given the handler is implemented
    When the agent runs all tests:
      | Test Suite | Command |
      | Business BDD | npm test -- __tests__/business-bdd-handlers |
      | Unit Tests | npm test -- __tests__/telemetry.parse.spec.ts |
      | All Tests | npm test |
    And the agent verifies lint:
      | Command | Expected |
      | npm run lint | 0 errors |
    Then all tests should pass
    And lint should pass
    And the handler is ready for code review

    # Phase 8: Code Review & Merge
    Given all tests pass
    And lint passes
    When the agent commits changes
    And the agent creates a pull request
    And the code is reviewed
    And the code is approved
    Then the agent merges the pull request
    And the handler is deployed

  Scenario: Agent encounters failing business BDD test

    Given the agent has implemented a handler
    And the business BDD test is failing
    When the agent reviews the failure
    Then the agent should:
      - Read the business outcome expectations
      - Verify the handler produces correct results
      - Check event publishing
      - Validate business value is achieved
    And the agent should fix the handler
    And the agent should re-run the test
    And the test should pass

  Scenario: Agent encounters failing unit test

    Given the agent has implemented a handler
    And a unit test is failing
    When the agent reviews the failure
    Then the agent should:
      - Understand what the test expects
      - Verify the handler logic
      - Check error handling
      - Validate input validation
    And the agent should fix the handler
    And the agent should re-run the test
    And the test should pass

  Scenario: Agent encounters lint errors

    Given the agent has implemented a handler
    And lint reports errors
    When the agent runs npm run lint
    Then the agent should:
      - Review the lint errors
      - Fix code style issues
      - Ensure type safety
      - Follow project conventions
    And the agent should re-run lint
    And lint should pass

  Scenario: Agent implements multiple handlers in sequence

    Given the agent has 67 handlers to implement
    When the agent implements handlers one at a time:
      | Handler | Status |
      | parseTelemetryRequested | Done |
      | loadLogFiles | In Progress |
      | extractTelemetryEvents | Not Started |
      | ... | ... |
    And the agent follows BDD → TDD → Done workflow for each
    Then all handlers should be implemented
    And all tests should pass
    And all lint should pass
    And the system is ready for production

  Scenario: Agent uses generation scripts to regenerate specs

    Given the agent needs to regenerate business specs
    When the agent runs:
      | Command | Purpose |
      | node scripts/generate-comprehensive-business-bdd-specs.js | Generate business specs |
      | node scripts/generate-handler-business-bdd-tests.js | Generate handler tests |
      | node scripts/generate-business-bdd-test-files.js | Generate sequence tests |
    Then the specifications should be regenerated
    And the test files should be regenerated
    And existing implementations should not be affected
    And the agent can continue implementation

  Scenario: Agent avoids confusion with deprecated scripts

    Given the agent is implementing handlers
    When the agent looks for generation scripts
    Then the agent should find:
      - generate-comprehensive-business-bdd-specs.js ✅
      - generate-handler-business-bdd-tests.js ✅
      - generate-business-bdd-test-files.js ✅
    And the agent should NOT find:
      - generate-self-healing-tests.js ❌ (removed)
      - generate-self-healing-test-stubs.js ❌ (removed)
      - generate-bdd-specifications.js ❌ (removed)
      - generate-bdd-test-files.js ❌ (removed)
    And the agent should use only the 3 business-focused scripts
    And the agent should not get confused

  Scenario: Agent understands the complete workflow

    Given an agent is new to the project
    When the agent reads HANDLER_IMPLEMENTATION_WORKFLOW.md
    Then the agent should understand:
      - Phase 1: Understand business BDD spec
      - Phase 2: Implement business BDD test
      - Phase 3: Implement unit tests (TDD - Red)
      - Phase 4: Implement handler (TDD - Green)
      - Phase 5: Refactor (TDD - Refactor)
      - Phase 6: Verify business BDD test
      - Phase 7: Verify all tests pass
      - Phase 8: Code review & merge
    And the agent should know:
      - Where to find business specs
      - Where to find test files
      - How to run tests
      - How to verify lint
      - What quality standards to meet
    And the agent should be ready to implement handlers

