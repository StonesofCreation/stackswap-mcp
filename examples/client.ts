/**
 * Minimal StackSwap MCP client — plain JSON-RPC over HTTP, no SDK.
 *
 * Run with: `npx tsx examples/client.ts`
 *
 * Demonstrates the three calls every MCP client needs to make:
 *   1. initialize — negotiate protocol version
 *   2. tools/list — discover what tools the server offers
 *   3. tools/call — invoke a specific tool with arguments
 */

const ENDPOINT = 'https://stackswap.ai/api/mcp'

type JsonRpcResponse =
  | { jsonrpc: '2.0'; id: number; result: unknown }
  | { jsonrpc: '2.0'; id: number; error: { code: number; message: string } }

async function rpc(method: string, params?: unknown, id = 1): Promise<unknown> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  })
  const body = (await res.json()) as JsonRpcResponse
  if ('error' in body) {
    throw new Error(`${method} failed: ${body.error.message}`)
  }
  return body.result
}

async function main() {
  // 1. Initialize — clients MUST call this first per the MCP spec.
  const init = (await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'stackswap-mcp-example', version: '0.1.0' },
  })) as { protocolVersion: string; serverInfo: { name: string; version: string } }
  console.log(`Connected to ${init.serverInfo.name} ${init.serverInfo.version}`)
  console.log(`Protocol: ${init.protocolVersion}\n`)

  // 2. List the tools the server exposes.
  const list = (await rpc('tools/list')) as { tools: Array<{ name: string; description: string }> }
  console.log(`Available tools (${list.tools.length}):`)
  for (const t of list.tools) {
    console.log(`  - ${t.name}`)
  }
  console.log()

  // 3. Call a tool. find_overlaps is the most demonstrative — it returns
  //    real savings numbers from StackSwap's curated overlap registry.
  const result = (await rpc('tools/call', {
    name: 'find_overlaps',
    arguments: { tools: ['HubSpot', 'Salesforce', 'Outreach', 'ZoomInfo'] },
  })) as { content: Array<{ type: string; text: string }>; isError?: boolean }

  console.log('find_overlaps result:')
  console.log('─'.repeat(60))
  console.log(result.content[0]?.text ?? '<no text>')
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
