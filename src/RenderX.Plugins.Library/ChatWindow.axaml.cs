using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace RenderX.Plugins.Library;

/// <summary>
/// Chat window - displays chat messages and input for AI interactions
/// </summary>
public partial class ChatWindow : UserControl
{
    public static readonly RoutedEvent<RoutedEventArgs> MessageSentEvent =
        RoutedEvent.Register<ChatWindow, RoutedEventArgs>(
            nameof(MessageSent),
            RoutingStrategies.Bubble);

    public event EventHandler<RoutedEventArgs>? MessageSent
    {
        add => AddHandler(MessageSentEvent, value);
        remove => RemoveHandler(MessageSentEvent, value);
    }

    public static readonly StyledProperty<List<(string Author, string Content)>> MessagesProperty =
        AvaloniaProperty.Register<ChatWindow, List<(string, string)>>(
            nameof(Messages),
            new List<(string, string)>());

    public List<(string Author, string Content)> Messages
    {
        get => GetValue(MessagesProperty);
        set => SetValue(MessagesProperty, value);
    }

    private string _chatHistoryPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "RenderX",
        "chat_history.json");

    public ChatWindow()
    {
        InitializeComponent();
        LoadChatHistory();
        UpdateMessages();
        AttachKeyHandlers();
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        base.OnPropertyChanged(change);
        if (change.Property == MessagesProperty)
        {
            UpdateMessages();
        }
    }

    private void OnSendClick(object? sender, RoutedEventArgs e)
    {
        var input = this.FindControl<TextBox>("MessageInput");
        if (input != null && !string.IsNullOrWhiteSpace(input.Text))
        {
            var userMessage = input.Text;
            Messages.Add(("User", userMessage));
            input.Text = "";

            // Show messages area and hide welcome screen
            ShowMessagesArea();

            // Auto-scroll to bottom
            AutoScrollToBottom();

            // Save chat history
            SaveChatHistory();

            RaiseEvent(new RoutedEventArgs(MessageSentEvent));
        }
    }

    private void UpdateMessages()
    {
        var messagesControl = this.FindControl<ItemsControl>("MessagesItemsControl");
        if (messagesControl != null)
        {
            messagesControl.ItemsSource = Messages;
        }

        // Show/hide welcome screen based on message count
        if (Messages.Count == 0)
        {
            ShowWelcomeScreen();
        }
        else
        {
            ShowMessagesArea();
        }
    }

    private void ShowWelcomeScreen()
    {
        var welcomeScreen = this.FindControl<Border>("WelcomeScreen");
        var messagesScrollViewer = this.FindControl<ScrollViewer>("MessagesScrollViewer");

        if (welcomeScreen != null)
            welcomeScreen.IsVisible = true;
        if (messagesScrollViewer != null)
            messagesScrollViewer.IsVisible = false;
    }

    private void ShowMessagesArea()
    {
        var welcomeScreen = this.FindControl<Border>("WelcomeScreen");
        var messagesScrollViewer = this.FindControl<ScrollViewer>("MessagesScrollViewer");

        if (welcomeScreen != null)
            welcomeScreen.IsVisible = false;
        if (messagesScrollViewer != null)
            messagesScrollViewer.IsVisible = true;
    }

    private void AutoScrollToBottom()
    {
        var scrollViewer = this.FindControl<ScrollViewer>("MessagesScrollViewer");
        if (scrollViewer != null)
        {
            scrollViewer.ScrollToEnd();
        }
    }

    private void AttachKeyHandlers()
    {
        var input = this.FindControl<TextBox>("MessageInput");
        if (input != null)
        {
            input.KeyDown += (s, e) =>
            {
                if (e.Key == Key.Return)
                {
                    OnSendClick(null, new RoutedEventArgs());
                    e.Handled = true;
                }
                else if (e.Key == Key.Escape)
                {
                    input.Text = "";
                    e.Handled = true;
                }
            };
        }
    }

    /// <summary>
    /// Show AI availability hint when AI is not configured
    /// </summary>
    public void ShowAIAvailabilityHint()
    {
        var hint = this.FindControl<Border>("AIAvailabilityHint");
        if (hint != null)
        {
            hint.IsVisible = true;
        }
    }

    /// <summary>
    /// Hide AI availability hint when AI is configured
    /// </summary>
    public void HideAIAvailabilityHint()
    {
        var hint = this.FindControl<Border>("AIAvailabilityHint");
        if (hint != null)
        {
            hint.IsVisible = false;
        }
    }

    private void SaveChatHistory()
    {
        try
        {
            var directory = Path.GetDirectoryName(_chatHistoryPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            var json = JsonSerializer.Serialize(Messages, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_chatHistoryPath, json);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error saving chat history: {ex.Message}");
        }
    }

    private void LoadChatHistory()
    {
        try
        {
            if (File.Exists(_chatHistoryPath))
            {
                var json = File.ReadAllText(_chatHistoryPath);
                var messages = JsonSerializer.Deserialize<List<(string, string)>>(json);
                if (messages != null)
                {
                    Messages = messages;
                }
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading chat history: {ex.Message}");
        }
    }

    private void OnNewChatClick(object? sender, RoutedEventArgs e)
    {
        Messages.Clear();
        UpdateMessages();
        SaveChatHistory();

        var input = this.FindControl<TextBox>("MessageInput");
        if (input != null)
        {
            input.Focus();
        }
    }

    private void OnClearHistoryClick(object? sender, RoutedEventArgs e)
    {
        Messages.Clear();
        UpdateMessages();
        SaveChatHistory();
    }
}

