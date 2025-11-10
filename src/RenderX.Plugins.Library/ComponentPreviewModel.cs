using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Linq;

namespace RenderX.Plugins.Library;

/// <summary>
/// Model for component preview data extracted from JSON component definitions.
/// Matches packages/library/src/ui/preview.model.ts functionality.
/// </summary>
public class ComponentPreviewModel
{
    public string Tag { get; set; } = "div";
    public List<string> Classes { get; set; } = new();
    public string? Text { get; set; }
    public string? CssText { get; set; }
    public string? CssTextLibrary { get; set; }
    public Dictionary<string, string> CssVars { get; set; } = new();
    public Dictionary<string, string>? Attributes { get; set; }
    public string Icon { get; set; } = "🧩";
    public string Name { get; set; } = "Component";
    public string Description { get; set; } = "Component description";

    /// <summary>
    /// Computes preview model from component JSON data.
    /// Extracts template, CSS variables, icon, and metadata.
    /// </summary>
    public static ComponentPreviewModel ComputePreviewModel(JsonNode? componentJson)
    {
        var model = new ComponentPreviewModel();

        if (componentJson == null)
        {
            return model;
        }

        try
        {
            // Extract template information
            var template = componentJson["template"] ?? componentJson["ui"]?["template"];
            if (template is JsonObject templateObj)
            {
                // Extract tag
                if (template["tag"] is JsonValue tagValue && tagValue.TryGetValue<string>(out var tag))
                {
                    model.Tag = !string.IsNullOrWhiteSpace(tag) ? tag : "div";
                }

                // Extract classes
                if (template["classes"] is JsonArray classesArray)
                {
                    model.Classes = classesArray
                        .Where(c => c is JsonValue)
                        .Select(c => c?.ToString() ?? "")
                        .Where(c => !string.IsNullOrWhiteSpace(c))
                        .ToList();
                }

                // Extract text
                if (template["text"] is JsonValue textValue && textValue.TryGetValue<string>(out var text))
                {
                    model.Text = text;
                }

                // Extract CSS text
                if (template["css"] is JsonValue cssValue && cssValue.TryGetValue<string>(out var css))
                {
                    model.CssText = !string.IsNullOrWhiteSpace(css) ? css : null;
                }

                // Extract library CSS text
                if (template["cssLibrary"] is JsonValue cssLibValue && cssLibValue.TryGetValue<string>(out var cssLib))
                {
                    model.CssTextLibrary = !string.IsNullOrWhiteSpace(cssLib) ? cssLib : null;
                }

                // Extract attributes (including data-icon and data-description)
                if (template["attributes"] is JsonObject attrsObj)
                {
                    model.Attributes = new Dictionary<string, string>();
                    foreach (var kvp in attrsObj)
                    {
                        if (kvp.Value is JsonValue jsonValue)
                        {
                            model.Attributes[kvp.Key] = jsonValue.ToString();
                        }
                    }
                }

                // Extract CSS variables from template.cssVariables and template.cssVariablesLibrary
                var baseVars = new Dictionary<string, string>();
                if (template["cssVariables"] is JsonObject cssVarsObj)
                {
                    foreach (var kvp in cssVarsObj)
                    {
                        if (kvp.Value is JsonValue jsonValue)
                        {
                            baseVars[kvp.Key] = jsonValue.ToString();
                        }
                    }
                }

                var libVars = new Dictionary<string, string>();
                if (template["cssVariablesLibrary"] is JsonObject cssVarsLibObj)
                {
                    foreach (var kvp in cssVarsLibObj)
                    {
                        if (kvp.Value is JsonValue jsonValue)
                        {
                            libVars[kvp.Key] = jsonValue.ToString();
                        }
                    }
                }

                // Merge with library overrides winning (matching web behavior)
                model.CssVars = MergeCssVariables(baseVars, libVars);
            }

            // Alternative path: ui.styles.variables and ui.styles.library.variables
            var uiStyles = componentJson["ui"]?["styles"];
            if (uiStyles != null)
            {
                var baseVars = new Dictionary<string, string>();
                if (uiStyles["variables"] is JsonObject varsObj)
                {
                    foreach (var kvp in varsObj)
                    {
                        if (kvp.Value is JsonValue jsonValue)
                        {
                            baseVars[kvp.Key] = jsonValue.ToString();
                        }
                    }
                }

                var libVars = new Dictionary<string, string>();
                if (uiStyles["library"]?["variables"] is JsonObject libVarsObj)
                {
                    foreach (var kvp in libVarsObj)
                    {
                        if (kvp.Value is JsonValue jsonValue)
                        {
                            libVars[kvp.Key] = jsonValue.ToString();
                        }
                    }
                }

                if (baseVars.Count > 0 || libVars.Count > 0)
                {
                    model.CssVars = MergeCssVariables(baseVars, libVars);
                }

                // Extract library CSS from ui.styles.library.css
                if (uiStyles["library"]?["css"] is JsonValue libCssValue && 
                    libCssValue.TryGetValue<string>(out var libCss))
                {
                    model.CssTextLibrary = !string.IsNullOrWhiteSpace(libCss) ? libCss : model.CssTextLibrary;
                }

                // Extract base CSS from ui.styles.css
                if (uiStyles["css"] is JsonValue baseCssValue && 
                    baseCssValue.TryGetValue<string>(out var baseCss))
                {
                    model.CssText = !string.IsNullOrWhiteSpace(baseCss) ? baseCss : model.CssText;
                }
            }

            // Extract icon (priority: template.attributes.data-icon > ui.icon.value > metadata.icon)
            if (model.Attributes?.TryGetValue("data-icon", out var dataIcon) == true)
            {
                model.Icon = dataIcon;
            }
            else if (componentJson["ui"]?["icon"]?["value"] is JsonValue iconValue && 
                     iconValue.TryGetValue<string>(out var icon))
            {
                model.Icon = icon;
            }
            else if (componentJson["metadata"]?["icon"] is JsonValue metaIconValue && 
                     metaIconValue.TryGetValue<string>(out var metaIcon))
            {
                model.Icon = metaIcon;
            }

            // Extract name (priority: name > template.name > metadata.name)
            if (componentJson["name"] is JsonValue nameValue && nameValue.TryGetValue<string>(out var name))
            {
                model.Name = name;
            }
            else if (template?["name"] is JsonValue templateNameValue && 
                     templateNameValue.TryGetValue<string>(out var templateName))
            {
                model.Name = templateName;
            }
            else if (componentJson["metadata"]?["name"] is JsonValue metaNameValue && 
                     metaNameValue.TryGetValue<string>(out var metaName))
            {
                model.Name = metaName;
            }

            // Extract description (priority: template.attributes.data-description > metadata.description)
            if (model.Attributes?.TryGetValue("data-description", out var dataDesc) == true)
            {
                model.Description = dataDesc;
            }
            else if (componentJson["metadata"]?["description"] is JsonValue descValue && 
                     descValue.TryGetValue<string>(out var desc))
            {
                model.Description = desc;
            }
            else
            {
                model.Description = $"{model.Name} component";
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error parsing component JSON: {ex.Message}");
        }

        return model;
    }

    /// <summary>
    /// Merges CSS variables with library overrides winning.
    /// Ensures all variable names have -- prefix.
    /// </summary>
    private static Dictionary<string, string> MergeCssVariables(
        Dictionary<string, string> baseVars,
        Dictionary<string, string> libVars)
    {
        var merged = new Dictionary<string, string>();

        // Add base variables
        foreach (var kvp in baseVars)
        {
            var key = kvp.Key.StartsWith("--") ? kvp.Key : $"--{kvp.Key}";
            merged[key] = kvp.Value;
        }

        // Add library variables (overriding base)
        foreach (var kvp in libVars)
        {
            var key = kvp.Key.StartsWith("--") ? kvp.Key : $"--{kvp.Key}";
            merged[key] = kvp.Value;
        }

        return merged;
    }

    /// <summary>
    /// Parses component JSON from string.
    /// </summary>
    public static ComponentPreviewModel ParseComponentJson(string jsonString)
    {
        try
        {
            var jsonNode = JsonNode.Parse(jsonString);
            return ComputePreviewModel(jsonNode);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error parsing component JSON string: {ex.Message}");
            return new ComponentPreviewModel();
        }
    }
}
