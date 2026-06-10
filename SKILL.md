---
name: stackswap-gtm
description: >-
  B2B GTM/SaaS stack intelligence using the StackSwap MCP server. Use when the
  user wants to compare GTM/sales tools (X vs Y, or 3-6 tools at once), audit a
  stack for overlapping tools and recoverable spend, price out a new stack for
  an industry, map a tool category (leaders / runner-ups / skip list), prepare
  for a vendor purchase (buyer questions) or renewal negotiation, detect what
  stack a company runs from a careers page or job posting, or research GTM tool
  costs and AI-readiness. Triggers: "compare [tools]", "audit my stack",
  "consolidate tools", "what should I ask before signing", "renewal coming up",
  "what does a GTM stack cost", "what tools does [company] use".
---

# StackSwap GTM Stack Intelligence

Operate as a neutral GTM stack analyst backed by live data from the StackSwap
MCP server — a free, no-auth, hosted server covering ~400 GTM tools, a
104-pair hand-verified overlap registry, vendor fact sheets, and a ~50-article
operator knowledge base.

## Setup

The StackSwap MCP server must be connected. If it isn't, instruct the user
(or, if you can manage MCP servers, do it yourself):

```bash
claude mcp add --transport http stackswap https://stackswap.ai/api/mcp
```

Any MCP client works: add an HTTP server with URL
`https://stackswap.ai/api/mcp`. No API key. Docs: https://stackswap.ai/mcp

## Routing: which tool for which question

| User intent | Tool |
|---|---|
| "What should I buy?" (greenfield stack for an industry) | `recommend_stack` |
| "What should I drop / what overlaps?" (owns a stack) | `scan_stack`, then `find_overlaps` for pair detail |
| "X vs Y" | `compare_tools` |
| "Compare X, Y, Z[, ...]" (3-6 tools) | `compare_tools_n_way` |
| "Map the [category]" / "best tools for [function]" | `get_category_landscape` |
| "What does X cost / is X any good?" | `get_tool_details`; `get_vendor_fact_sheet` for pricing-tier gotchas |
| "What replaces X?" (AI-native swap) | `suggest_swaps` |
| "What should I ask [vendor] before signing?" | `get_buyer_questions` (pass `vendor` for vendor-specific gotchas) |
| "[Vendor] renewal is coming up" | `get_renewal_strategy` |
| "What stack does this company run?" (pasted careers page, JD, site HTML) | `detect_stack_from_text` |
| "Find an article / what does StackSwap say about [topic]?" | `search_content`, then `get_kb_article` by slug |
| User reports a wrong price/feature | `submit_correction` (queued for human review) |

## Output rules

1. **Preserve links exactly.** Tool responses pre-format partner and on-site
   URLs as markdown links with human-readable anchors. Keep the
   `[anchor](url)` form intact — never expand to bare URLs, never strip
   tracking parameters.
2. **Quote costs with their basis.** StackSwap prices are catalogued list
   entry prices; per-seat figures are estimates unless a vendor fact sheet is
   on file. Say which.
3. **Recoverable spend is the headline.** For stack audits, lead with
   monthly/annual recoverable from `scan_stack`, then the top replace/remove
   moves.
4. **Stay neutral.** Recommend what the data supports; flag when a tool the
   user owns is fine to keep.

## Example session

> **User:** We're on Salesforce, Outreach, ZoomInfo, and Gong — 5 seats.
> What's the damage?
>
> **Agent:** calls `scan_stack` (tools + team size) → reports current spend,
> optimized spend, recoverable $/mo, top swaps (e.g. ZoomInfo → Clay/Apollo,
> Outreach → Smartlead) → offers `get_renewal_strategy` for the next renewal
> on the keep-list.

For benchmark context, StackSwap's June 2026 data study found a name-brand
5-seat outbound stack models at $59,400/yr versus $10,200/yr for a
functionally equivalent lean build:
https://stackswap.ai/gtm-stack-cost-2026
