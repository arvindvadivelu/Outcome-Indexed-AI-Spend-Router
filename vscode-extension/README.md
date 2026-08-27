# Outcome Router for VSCode & Continue.dev

Connect your IDE directly to the Outcome-Indexed AI Spend Router to automatically delegate code completions and refactoring tasks between **Ollama local models (0$ cost)** and **Claude 3.5 Sonnet / DeepSeek Coder** based on code complexity.

## Continue.dev Configuration

Add to your `~/.continue/config.json`:

```json
{
  "models": [
    {
      "title": "Outcome Router (Optimized)",
      "provider": "openai",
      "model": "auto",
      "apiKey": "oir_live_your_key",
      "apiBase": "http://localhost:8000/api/v1"
    }
  ]
}
```
