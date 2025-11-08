using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core.Models;

/// <summary>
/// Represents a single beat (event/action) in a sequence.
/// </summary>
public class Beat : IBeat
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Event { get; set; } = string.Empty;
    public Delegate? Handler { get; set; }
    public object? Dynamics { get; set; }
    public object? Timing { get; set; }
    public object? ErrorHandling { get; set; }
    public object? Data { get; set; }
}

/// <summary>
/// Represents a movement (group of beats) in a sequence.
/// </summary>
public class Movement : IMovement
{
    private readonly List<IBeat> _beats = new();

    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public IReadOnlyList<IBeat> Beats => _beats.AsReadOnly();

    public void AddBeat(IBeat beat)
    {
        if (beat == null)
            throw new ArgumentNullException(nameof(beat));
        _beats.Add(beat);
    }

    public void RemoveBeat(IBeat beat)
    {
        if (beat == null)
            throw new ArgumentNullException(nameof(beat));
        _beats.Remove(beat);
    }
}

/// <summary>
/// Represents a complete orchestration sequence.
/// </summary>
public class Sequence : ISequence
{
    private readonly List<IMovement> _movements = new();

    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public IReadOnlyList<IMovement> Movements => _movements.AsReadOnly();

    public void AddMovement(IMovement movement)
    {
        if (movement == null)
            throw new ArgumentNullException(nameof(movement));
        _movements.Add(movement);
    }

    public void RemoveMovement(IMovement movement)
    {
        if (movement == null)
            throw new ArgumentNullException(nameof(movement));
        _movements.Remove(movement);
    }

    public IEnumerable<IBeat> GetAllBeats()
    {
        return _movements.SelectMany(m => m.Beats);
    }
}

/// <summary>
/// Registry for managing sequences.
/// </summary>
public class SequenceRegistry : ISequenceRegistry
{
    private readonly Dictionary<string, ISequence> _sequences = new();
    private readonly ReaderWriterLockSlim _lock = new();

    public void Register(ISequence sequence)
    {
        if (sequence == null)
            throw new ArgumentNullException(nameof(sequence));
        if (string.IsNullOrEmpty(sequence.Id))
            throw new ArgumentException("Sequence ID cannot be empty", nameof(sequence));

        _lock.EnterWriteLock();
        try
        {
            _sequences[sequence.Id] = sequence;
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public void Unregister(string sequenceId)
    {
        if (string.IsNullOrEmpty(sequenceId))
            throw new ArgumentNullException(nameof(sequenceId));

        _lock.EnterWriteLock();
        try
        {
            _sequences.Remove(sequenceId);
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public ISequence? Get(string sequenceId)
    {
        if (string.IsNullOrEmpty(sequenceId))
            throw new ArgumentNullException(nameof(sequenceId));

        _lock.EnterReadLock();
        try
        {
            return _sequences.TryGetValue(sequenceId, out var sequence) ? sequence : null;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public bool Has(string sequenceId)
    {
        if (string.IsNullOrEmpty(sequenceId))
            throw new ArgumentNullException(nameof(sequenceId));

        _lock.EnterReadLock();
        try
        {
            return _sequences.ContainsKey(sequenceId);
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public IEnumerable<ISequence> GetAll()
    {
        _lock.EnterReadLock();
        try
        {
            return _sequences.Values.ToList();
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public IEnumerable<ISequence> GetByCategory(string category)
    {
        if (string.IsNullOrEmpty(category))
            throw new ArgumentNullException(nameof(category));

        _lock.EnterReadLock();
        try
        {
            return _sequences.Values
                .Where(s => s.Category == category)
                .ToList();
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }
}

