# StackSwap MCP

A hosted [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI clients access to [StackSwap](https://stackswap.ai)'s B2B SaaS GTM stack intelligence — tool catalog, overlap detection, AI-native swap suggestions, stack audits, and partner recommendations.

**Live endpoint:** `https://stackswap.ai/api/mcp`
**Docs:** [stackswap.ai/mcp](https://stackswap.ai/mcp)
**Status:** Free, no API key, stateless, read-only.

This repo contains **public documentation, JSON schemas, and an example client** for the hosted MCP server. The server itself is closed-source — it runs as part of [stackswap.ai](https://stackswap.ai) and wraps the same scan engine and tool catalog that powers the web product.

---

## Install

### Claude Code

```bash
claude mcp add --transport http stackswap https://stackswap.ai/api/mcp
```

For user-scope (available in every session, not just one project):

```bash
claude mcp add --transport http --scope user stackswap https://stackswap.ai/api/mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "stackswap": {
      "url": "https://stackswap.ai/api/mcp",
      "transport": "http"
    }
  }
}
```

Restart Claude Desktop. A tools indicator appears in the chat compose box.

### Cursor / ChatGPT Desktop / Other MCP clients

Add a new HTTP MCP server with URL `https://stackswap.ai/api/mcp`. No authentication.

---

## Tools

Eight read-only tools. Schemas are in [`schemas/tools.json`](./schemas/tools.json) (extracted directly from the live `tools/list` response).

| Tool | What it does |
|---|---|
| `search_tools` | Fuzzy-search ~400 GTM tools by name. Returns each match with monthly cost and a StackSwap partner sign-up link when applicable. |
| `find_overlaps` | Given a stack, return the 104 curated overlap pairs StackSwap has hand-verified, with consolidation savings. |
| `suggest_swaps` | For each input tool, return StackSwap's AI-native replacement recommendation (when one exists) with annual savings and reasoning. |
| `scan_stack` | Preview StackScan: pass tools + team size + industry, get back monthly/annual recoverable spend and the top 5 replace/remove opportunities. |
| `recommend_partner` | Given a need (e.g. "outbound", "CRM", "automation"), return StackSwap's recommended affiliate partner with sign-up URL and implementation hours. |
| `compare_tools` | Head-to-head comparison of two GTM tools. Returns cost delta, AI-readiness delta, overlap warning, and a recommended pick with reasoning. |
| `recommend_stack` | StackSwap's reference starter stack for a given industry vertical, with per-tool cost and total monthly/annual spend. |
| `get_tool_details` | Full StackSwap profile on a single tool: cost, AI-readiness, common overlaps, swap registry status, partner status. |

---

## Example usage

Once installed, ask any of the following in your AI client and Claude will route to the right tool:

| Operator question | Tool that fires |
|---|---|
| "Find me a cold-email tool" | `recommend_partner` |
| "What does Smartlead cost?" | `get_tool_details` |
| "Smartlead vs Apollo for outbound?" | `compare_tools` |
| "Build a stack for a marketing agency, 10-25 people" | `recommend_stack` |
| "What overlaps if I'm on HubSpot + Salesforce + Outreach?" | `find_overlaps` |
| "What AI-native tool replaces ZoomInfo?" | `suggest_swaps` |
| "Audit my current stack: HubSpot, Salesforce, Outreach, ZoomInfo, Gong" | `scan_stack` |
| "Show me tools matching 'attribution'" | `search_tools` |

Tool descriptions are model-readable, so you don't need to know the tool names — Claude picks based on the question.

---

## Example client

A minimal TypeScript example that connects, lists tools, and runs `find_overlaps` is in [`examples/client.ts`](./examples/client.ts).

```bash
npx tsx examples/client.ts
```

The protocol is plain JSON-RPC 2.0 over HTTP — any language with a JSON parser and an HTTP client can call it.

---

## Endpoint details

| | |
|---|---|
| **JSON-RPC URL** | `POST https://stackswap.ai/api/mcp` |
| **Server descriptor** | `GET https://stackswap.ai/api/mcp` (returns name, version, tool list) |
| **Protocol versions** | `2025-06-18`, `2025-03-26`, `2024-11-05` |
| **Transport** | Streamable HTTP, stateless |
| **Auth** | None |
| **Rate limit** | None (reasonable use) |
| **CORS** | `*` |

---

## Why hosted, not stdio

StackSwap's MCP server runs inside the existing [stackswap.ai](https://stackswap.ai) Next.js application as a single route handler. Hosting it ourselves means:

- **No install friction** — one `claude mcp add` line, no npm/pip dependency
- **Always current** — the underlying tool catalog, overlap registry, and swap data update as the StackSwap product evolves
- **Zero local compute** — the scan engine runs server-side; clients just send JSON-RPC

The trade-off: it requires an internet connection, and we (StackSwap) see request volume and tool-call patterns. We don't store conversation data or user identifiers — the endpoint is stateless.

---

## Requests, issues, feedback

Open an issue if you want a tool added, a behavior changed, or you've hit a bug. The MCP surface is shaped by what operators actually ask about.

Contact: [nick@stackswap.ai](mailto:nick@stackswap.ai)

---

## License

MIT — see [LICENSE](./LICENSE).

This license covers the public documentation, JSON schemas, and example clients in this repository. It does not cover the closed-source server implementation that runs at `stackswap.ai/api/mcp`.
