# RAG Search CLI

Command-line tool for searching the OgraphX-RAG system using semantic search.

## Usage

### Using npm script (recommended)

```powershell
npm run rag:search -- "your query here"
```

### Using Python directly

```powershell
python scripts/rag-search.py "your query here"
```

## Examples

### Search for symbols (default)

```powershell
npm run rag:search -- "canvas selection handler"
npm run rag:search -- "vector store search" --limit 5
```

### Search for sequences

```powershell
npm run rag:search -- "indexing workflow" --type sequence
```

### Search for handlers

```powershell
npm run rag:search -- "drag event" --type handler
```

### Discover patterns

```powershell
npm run rag:search -- "indexing" --type pattern
```

### Adjust similarity threshold

```powershell
npm run rag:search -- "component" --threshold 0.5
```

### Get JSON output

```powershell
npm run rag:search -- "search" --json
```

## Options

- `--type` - Type of search: `symbol`, `sequence`, `handler`, or `pattern` (default: `symbol`)
- `--limit` - Maximum number of results (default: 10)
- `--threshold` - Minimum similarity threshold 0.0-1.0 (default: 0.3)
- `--json` - Output raw JSON instead of formatted results

## How It Works

1. Creates a temporary Vitest test file
2. Runs the test which:
   - Initializes the vector store
   - Indexes OgraphX artifacts from `packages/ographx/.ographx/artifacts/rag-system`
   - Performs the semantic search
   - Outputs results as JSON
3. Parses the JSON output and formats it for display
4. Cleans up the temporary test file

## Requirements

- Python 3.x
- Node.js and npm
- All project dependencies installed (`npm install`)

