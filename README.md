# StackSwap MCP

A hosted [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI clients access to [StackSwap](https://stackswap.ai)'s B2B SaaS GTM stack intelligence — tool catalog, vendor fact sheets, overlap detection, AI-native swap suggestions, stack audits, n-way comparisons, category landscapes, buyer questions, renewal-negotiation playbooks, and a full-text operator knowledge base.

**Live endpoint:** `https://stackswap.ai/api/mcp`
**Docs:** [stackswap.ai/mcp](https://stackswap.ai/mcp)
**Status:** Free, no API key, stateless. 17 tools — 16 read-only + 1 write (`submit_correction`, queued for human review).

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

Seventeen tools across eight domains. Schemas are in [`schemas/tools.json`](./schemas/tools.json) (extracted directly from the live `tools/list` response).

### Catalog

| Tool | What it does |
|---|---|
| `search_tools` | Fuzzy-search ~400 GTM tools by name. Returns each match with monthly cost and a StackSwap partner sign-up link when applicable. |
| `get_tool_details` | Full StackSwap profile for a single tool: cost (catalog + per-seat with confidence), AI-readiness score, category, common overlaps, swap-registry status. |
| `get_vendor_fact_sheet` | Full vendor fact sheet (GTM Decision Schema v1.0.0): pricing tiers with gotchas, integration depth scores, AI capabilities + customer-data-for-training disclosure. |

### Stack analysis

| Tool | What it does |
|---|---|
| `find_overlaps` | Given a stack, return the redundant pairs StackSwap has hand-verified (104-pair overlap registry) with consolidation savings. |
| `suggest_swaps` | Per-tool AI-native replacement recommendations (Outreach → Smartlead, ZoomInfo → Apollo) with annual savings and reasoning. |
| `scan_stack` | Preview StackScan: tools + team size + industry in, current spend / optimized spend / monthly-annual recoverable / headless gaps out. |
| `recommend_partner` | Given a need ("outbound", "CRM", "automation"), return StackSwap's recommended partner(s) with positioning. |
| `recommend_stack` | Reference starter stack for an industry vertical with per-tool cost, total spend, AI-readiness and headless-readiness scores. |

### Compare

| Tool | What it does |
|---|---|
| `compare_tools` | Head-to-head: cost delta, AI-readiness, headless-readiness (MCP/API callability), overlap status, and a recommended pick with reasoning. |
| `compare_tools_n_way` | 2–6 tools side-by-side in one markdown matrix — cost, AI-readiness, headless-readiness, overlaps within the set, StackSwap pick. |

### Content

| Tool | What it does |
|---|---|
| `search_content` | Full-text search across ~50 first-party operator articles on stack architecture, AI-native swaps, RevOps, and decision frameworks. |
| `get_kb_article` | Fetch a knowledge-base article's full body as markdown, with canonical URL, category, and last-modified date. |

### Categories

| Tool | What it does |
|---|---|
| `get_category_landscape` | Full map of one GTM category — leaders, runner-ups, skip/replace candidates — with cost, AI-readiness, swap-registry status per tool. |

### Detect

| Tool | What it does |
|---|---|
| `detect_stack_from_text` | Infer a GTM stack from freeform text (careers page, job posting, site HTML, RFP, DevTools network tab). Ranked matches with confidence levels. |

### Decision support

| Tool | What it does |
|---|---|
| `get_buyer_questions` | 10–20 questions to ask a vendor before signing, with "why it matters" and red-flag answers. Vendor-specific gotchas when you pass a vendor. |
| `get_renewal_strategy` | Renewal-negotiation playbook per vendor: leverage points, price-anchor alternatives, calibrated discount ask, walkaway script, timing window. |

### Write

| Tool | What it does |
|---|---|
| `submit_correction` | Submit a catalog correction (pricing, features, gotchas, scores). Queued for admin review — never propagates to user-facing surfaces unreviewed. |

---

## Example usage

Once installed, ask any of the following in your AI client and it will route to the right tool:

| Operator question | Tool that fires |
|---|---|
| "Find me a cold-email tool" | `recommend_partner` |
| "What does Smartlead cost?" | `get_tool_details` |
| "Smartlead vs Apollo for outbound?" | `compare_tools` |
| "Compare Smartlead, Instantly, Apollo, and Lemlist" | `compare_tools_n_way` |
| "Map the whole sales-engagement category" | `get_category_landscape` |
| "What should I ask Apollo before signing?" | `get_buyer_questions` |
| "My Salesforce renewal is in 60 days — what's my leverage?" | `get_renewal_strategy` |
| "What stack does this company run?" (paste a careers page) | `detect_stack_from_text` |
| "What overlaps if I'm on HubSpot + Salesforce + Outreach?" | `find_overlaps` |
| "Audit my stack: HubSpot, Salesforce, Outreach, ZoomInfo, Gong" | `scan_stack` |
| "Find StackSwap's article on data ethics in outbound" | `search_content` |

Tool descriptions are model-readable, so you don't need to know the tool names — the model picks based on the question.

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
- **Always current** — the underlying tool catalog, overlap registry, vendor fact sheets, and swap data update as the StackSwap product evolves
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
