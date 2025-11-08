namespace MusicalConductor.Core.Interfaces;

/// <summary>
/// Execution priority for sequences.
/// </summary>
public enum SequencePriority
{
    /// <summary>
    /// Highest priority - execute immediately.
    /// </summary>
    HIGH = 3,

    /// <summary>
    /// Normal priority - execute in order.
    /// </summary>
    NORMAL = 2,

    /// <summary>
    /// Chained priority - execute after current sequence.
    /// </summary>
    CHAINED = 1,

    /// <summary>
    /// Low priority - execute last.
    /// </summary>
    LOW = 0
}

/// <summary>
/// Represents a single event/action in a sequence.
/// </summary>
public interface IBeat
{
    /// <summary>
    /// Unique identifier for this beat.
    /// </summary>
    string Id { get; }

    /// <summary>
    /// Event name to emit.
    /// </summary>
    string Event { get; }

    /// <summary>
    /// Handler function to execute.
    /// </summary>
    Delegate? Handler { get; }

    /// <summary>
    /// Dynamics/metadata for this beat.
    /// </summary>
    object? Dynamics { get; }

    /// <summary>
    /// Timing information.
    /// </summary>
    object? Timing { get; }

    /// <summary>
    /// Error handling configuration.
    /// </summary>
    object? ErrorHandling { get; }

    /// <summary>
    /// Data to pass to the handler.
    /// </summary>
    object? Data { get; }
}

/// <summary>
/// Represents a group of beats (movements) in a sequence.
/// </summary>
public interface IMovement
{
    /// <summary>
    /// Unique identifier for this movement.
    /// </summary>
    string Id { get; }

    /// <summary>
    /// Name of this movement.
    /// </summary>
    string Name { get; }

    /// <summary>
    /// Beats in this movement.
    /// </summary>
    IReadOnlyList<IBeat> Beats { get; }
}

/// <summary>
/// Represents a complete orchestration sequence.
/// </summary>
public interface ISequence
{
    /// <summary>
    /// Unique identifier for this sequence.
    /// </summary>
    string Id { get; }

    /// <summary>
    /// Name of this sequence.
    /// </summary>
    string Name { get; }

    /// <summary>
    /// Description of what this sequence does.
    /// </summary>
    string? Description { get; }

    /// <summary>
    /// Category/classification of this sequence.
    /// </summary>
    string? Category { get; }

    /// <summary>
    /// Movements (groups of beats) in this sequence.
    /// </summary>
    IReadOnlyList<IMovement> Movements { get; }

    /// <summary>
    /// Get all beats in this sequence.
    /// </summary>
    /// <returns>Flattened list of all beats</returns>
    IEnumerable<IBeat> GetAllBeats();
}

/// <summary>
/// Registry for managing sequences.
/// </summary>
public interface ISequenceRegistry
{
    /// <summary>
    /// Register a sequence.
    /// </summary>
    /// <param name=\"sequence\">Sequence to register</param>
    void Register(ISequence sequence);

    /// <summary>
    /// Unregister a sequence.
    /// </summary>
    /// <param name=\"sequenceId\">ID of sequence to unregister</param>
    void Unregister(string sequenceId);

    /// <summary>
    /// Get a sequence by ID.
    /// </summary>
    /// <param name=\"sequenceId\">ID of sequence</param>
    /// <returns>Sequence or null if not found</returns>
    ISequence? Get(string sequenceId);

    /// <summary>
    /// Check if a sequence is registered.
    /// </summary>
    /// <param name=\"sequenceId\">ID of sequence</param>
    /// <returns>True if registered</returns>
    bool Has(string sequenceId);

    /// <summary>
    /// Get all registered sequences.
    /// </summary>
    /// <returns>Collection of sequences</returns>
    IEnumerable<ISequence> GetAll();

    /// <summary>
    /// Get sequences by category.
    /// </summary>
    /// <param name=\"category\">Category name</param>
    /// <returns>Sequences in category</returns>
    IEnumerable<ISequence> GetByCategory(string category);
}

