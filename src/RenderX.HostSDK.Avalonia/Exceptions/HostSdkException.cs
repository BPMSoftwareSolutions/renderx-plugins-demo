namespace RenderX.HostSDK.Avalonia.Exceptions;

/// <summary>
/// Base exception for all Host SDK errors.
/// </summary>
public class HostSdkException : Exception
{
    /// <summary>
    /// Initializes a new instance of the HostSdkException class.
    /// </summary>
    public HostSdkException()
    {
    }

    /// <summary>
    /// Initializes a new instance of the HostSdkException class with a specified error message.
    /// </summary>
    /// <param name="message">The message that describes the error.</param>
    public HostSdkException(string message) : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of the HostSdkException class with a specified error message
    /// and a reference to the inner exception that is the cause of this exception.
    /// </summary>
    /// <param name="message">The error message that explains the reason for the exception.</param>
    /// <param name="innerException">The exception that is the cause of the current exception.</param>
    public HostSdkException(string message, Exception innerException) : base(message, innerException)
    {
    }
}

/// <summary>
/// Exception thrown when there is an error bridging between C# and JavaScript.
/// </summary>
public class JsBridgeException : HostSdkException
{
    /// <summary>
    /// Initializes a new instance of the JsBridgeException class.
    /// </summary>
    public JsBridgeException()
    {
    }

    /// <summary>
    /// Initializes a new instance of the JsBridgeException class with a specified error message.
    /// </summary>
    /// <param name="message">The message that describes the error.</param>
    public JsBridgeException(string message) : base(message)
    {
    }

    /// <summary>
    /// Initializes a new instance of the JsBridgeException class with a specified error message
    /// and a reference to the inner exception that is the cause of this exception.
    /// </summary>
    /// <param name="message">The error message that explains the reason for the exception.</param>
    /// <param name="innerException">The exception that is the cause of the current exception.</param>
    public JsBridgeException(string message, Exception innerException) : base(message, innerException)
    {
    }
}

/// <summary>
/// Exception thrown when a topic is not found in the manifest.
/// </summary>
public class TopicNotFoundException : HostSdkException
{
    /// <summary>
    /// Gets the topic key that was not found.
    /// </summary>
    public string TopicKey { get; }

    /// <summary>
    /// Initializes a new instance of the TopicNotFoundException class.
    /// </summary>
    /// <param name="topicKey">The topic key that was not found.</param>
    public TopicNotFoundException(string topicKey)
        : base($"Topic not found: {topicKey}")
    {
        TopicKey = topicKey;
    }

    /// <summary>
    /// Initializes a new instance of the TopicNotFoundException class with a specified error message.
    /// </summary>
    /// <param name="topicKey">The topic key that was not found.</param>
    /// <param name="message">The message that describes the error.</param>
    public TopicNotFoundException(string topicKey, string message) : base(message)
    {
        TopicKey = topicKey;
    }

    /// <summary>
    /// Initializes a new instance of the TopicNotFoundException class with a specified error message
    /// and a reference to the inner exception that is the cause of this exception.
    /// </summary>
    /// <param name="topicKey">The topic key that was not found.</param>
    /// <param name="message">The error message that explains the reason for the exception.</param>
    /// <param name="innerException">The exception that is the cause of the current exception.</param>
    public TopicNotFoundException(string topicKey, string message, Exception innerException)
        : base(message, innerException)
    {
        TopicKey = topicKey;
    }
}

/// <summary>
/// Exception thrown when a component is not found in the inventory.
/// </summary>
public class ComponentNotFoundException : HostSdkException
{
    /// <summary>
    /// Gets the component ID that was not found.
    /// </summary>
    public string ComponentId { get; }

    /// <summary>
    /// Initializes a new instance of the ComponentNotFoundException class.
    /// </summary>
    /// <param name="componentId">The component ID that was not found.</param>
    public ComponentNotFoundException(string componentId)
        : base($"Component not found: {componentId}")
    {
        ComponentId = componentId;
    }

    /// <summary>
    /// Initializes a new instance of the ComponentNotFoundException class with a specified error message.
    /// </summary>
    /// <param name="componentId">The component ID that was not found.</param>
    /// <param name="message">The message that describes the error.</param>
    public ComponentNotFoundException(string componentId, string message) : base(message)
    {
        ComponentId = componentId;
    }

    /// <summary>
    /// Initializes a new instance of the ComponentNotFoundException class with a specified error message
    /// and a reference to the inner exception that is the cause of this exception.
    /// </summary>
    /// <param name="componentId">The component ID that was not found.</param>
    /// <param name="message">The error message that explains the reason for the exception.</param>
    /// <param name="innerException">The exception that is the cause of the current exception.</param>
    public ComponentNotFoundException(string componentId, string message, Exception innerException)
        : base(message, innerException)
    {
        ComponentId = componentId;
    }
}

/// <summary>
/// Exception thrown when a CSS class is not found in the registry.
/// </summary>
public class CssClassNotFoundException : HostSdkException
{
    /// <summary>
    /// Gets the CSS class name that was not found.
    /// </summary>
    public string ClassName { get; }

    /// <summary>
    /// Initializes a new instance of the CssClassNotFoundException class.
    /// </summary>
    /// <param name="className">The CSS class name that was not found.</param>
    public CssClassNotFoundException(string className)
        : base($"CSS class not found: {className}")
    {
        ClassName = className;
    }

    /// <summary>
    /// Initializes a new instance of the CssClassNotFoundException class with a specified error message.
    /// </summary>
    /// <param name="className">The CSS class name that was not found.</param>
    /// <param name="message">The message that describes the error.</param>
    public CssClassNotFoundException(string className, string message) : base(message)
    {
        ClassName = className;
    }

    /// <summary>
    /// Initializes a new instance of the CssClassNotFoundException class with a specified error message
    /// and a reference to the inner exception that is the cause of this exception.
    /// </summary>
    /// <param name="className">The CSS class name that was not found.</param>
    /// <param name="message">The error message that explains the reason for the exception.</param>
    /// <param name="innerException">The exception that is the cause of the current exception.</param>
    public CssClassNotFoundException(string className, string message, Exception innerException)
        : base(message, innerException)
    {
        ClassName = className;
    }
}

