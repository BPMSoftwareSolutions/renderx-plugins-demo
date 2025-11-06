using Xunit;

// Disable parallel execution; UI E2E tests should run one at a time to avoid window focus/automation conflicts
[assembly: CollectionBehavior(DisableTestParallelization = true)]

