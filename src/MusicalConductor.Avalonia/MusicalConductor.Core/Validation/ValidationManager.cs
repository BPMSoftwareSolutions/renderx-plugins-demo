using Microsoft.Extensions.Logging;

namespace MusicalConductor.Core.Validation;

/// <summary>
/// ValidationManager - Aggregates pre-execution validations
/// Performs comprehensive validation before sequence execution
/// </summary>
public class ValidationManager
{
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public int ErrorCount { get; set; }
        public int WarningCount { get; set; }
    }

    private readonly ILogger<ValidationManager> _logger;
    private readonly object _lock = new();

    public ValidationManager(ILogger<ValidationManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Validate a sequence before execution
    /// </summary>
    public ValidationResult ValidateSequence(string sequenceName, object sequenceData)
    {
        lock (_lock)
        {
            var result = new ValidationResult { IsValid = true };

            // Perform validation checks
            ValidateSequenceName(sequenceName, result);
            ValidateSequenceData(sequenceData, result);
            ValidateSequenceStructure(sequenceName, result);

            // Log validation summary
            if (result.IsValid)
            {
                _logger.LogInformation(
                    "✅ ValidationManager: Sequence {SequenceName} validation passed",
                    sequenceName);
            }
            else
            {
                _logger.LogWarning(
                    "❌ ValidationManager: Sequence {SequenceName} validation failed (Errors={ErrorCount}, Warnings={WarningCount})",
                    sequenceName,
                    result.ErrorCount,
                    result.WarningCount);
            }

            return result;
        }
    }

    /// <summary>
    /// Validate multiple sequences
    /// </summary>
    public ValidationResult ValidateSequences(List<(string Name, object Data)> sequences)
    {
        lock (_lock)
        {
            var aggregatedResult = new ValidationResult { IsValid = true };

            foreach (var (name, data) in sequences)
            {
                var result = ValidateSequence(name, data);
                if (!result.IsValid)
                {
                    aggregatedResult.IsValid = false;
                    aggregatedResult.Errors.AddRange(result.Errors);
                    aggregatedResult.Warnings.AddRange(result.Warnings);
                    aggregatedResult.ErrorCount += result.ErrorCount;
                    aggregatedResult.WarningCount += result.WarningCount;
                }
            }

            // Log aggregated validation summary
            _logger.LogInformation(
                "📋 ValidationManager: Batch validation completed (Total={Total}, Valid={Valid}, Errors={Errors})",
                sequences.Count,
                sequences.Count - aggregatedResult.ErrorCount,
                aggregatedResult.ErrorCount);

            return aggregatedResult;
        }
    }

    private void ValidateSequenceName(string sequenceName, ValidationResult result)
    {
        if (string.IsNullOrWhiteSpace(sequenceName))
        {
            result.IsValid = false;
            result.Errors.Add("Sequence name cannot be empty");
            result.ErrorCount++;
        }
    }

    private void ValidateSequenceData(object sequenceData, ValidationResult result)
    {
        if (sequenceData == null)
        {
            result.IsValid = false;
            result.Errors.Add("Sequence data cannot be null");
            result.ErrorCount++;
        }
    }

    private void ValidateSequenceStructure(string sequenceName, ValidationResult result)
    {
        // Placeholder for structure validation
        // This would check for required fields, proper nesting, etc.
    }

    /// <summary>
    /// Log validation lifecycle start
    /// </summary>
    public void LogValidationStart(string sequenceName)
    {
        _logger.LogDebug("📋 ValidationManager: Starting validation for sequence {SequenceName}", sequenceName);
    }

    /// <summary>
    /// Log validation lifecycle end
    /// </summary>
    public void LogValidationEnd(string sequenceName, bool isValid)
    {
        var status = isValid ? "PASSED" : "FAILED";
        _logger.LogDebug("📋 ValidationManager: Validation completed for sequence {SequenceName} - Status: {Status}", sequenceName, status);
    }

    /// <summary>
    /// Log validation warning
    /// </summary>
    public void LogValidationWarning(string sequenceName, string warning)
    {
        _logger.LogWarning("⚠️ ValidationManager: Validation warning for {SequenceName}: {Warning}", sequenceName, warning);
    }
}

