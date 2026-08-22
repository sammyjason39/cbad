import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : CBAD Backend API
// Nodes   : 8  |  Connections: 6
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// HealthWebhook                      webhook
// GetQwenModels                      httpRequest
// FormatHealthResponse               code
// RespondHealth                      respondToWebhook
// ChatWebhook                        webhook
// PostQwenChat                       httpRequest
// FormatChatResponse                 code
// RespondChat                        respondToWebhook
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// HealthWebhook
//    → GetQwenModels
//      → FormatHealthResponse
//        → RespondHealth
// ChatWebhook
//    → PostQwenChat
//      → FormatChatResponse
//        → RespondChat
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'kT1iFHmxaJUYdYN7',
    name: 'CBAD Backend API',
    active: true,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class CbadBackendApiWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'a4c86e52-4adf-4976-9e90-28de8d140912',
        webhookId: 'a8f3c2d1-5e4b-4a9c-8d1e-2f6b9c0a1d2e',
        name: 'Health Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 0],
    })
    HealthWebhook = {
        httpMethod: 'GET',
        path: 'a8f3c2d1-5e4b-4a9c-8d1e-2f6b9c0a1d2e',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        id: '54a758ce-e79a-4c9c-a63b-530dc1f7ec77',
        name: 'Get Qwen Models',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [240, 0],
    })
    GetQwenModels = {
        method: 'GET',
        url: '={{ ($env.QWEN_API_BASE || "https://ws-pvflth6kss1o2my2.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1").replace(/\\/$/, "") + "/models" }}',
        authentication: 'none',
        sendHeaders: true,
        specifyHeaders: 'keypair',
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: '=Bearer {{ $env.QWEN_API_KEY }}',
                },
            ],
        },
        options: {
            response: {
                response: {
                    responseFormat: 'json',
                },
            },
            timeout: 15000,
        },
    };

    @node({
        id: '8799503b-d360-423f-999c-a6d7580215be',
        name: 'Format Health Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [480, 0],
    })
    FormatHealthResponse = {
        mode: 'runOnceForAllItems',
        language: 'javaScript',
        jsCode: `const model = $env.QWEN_MODEL || 'qwen3.7-plus';
const input = $input.first()?.json ?? {};
const models = Array.isArray(input.data)
  ? input.data.map((m) => m.id || m.name).filter(Boolean)
  : [];

return [{
  online: models.length > 0,
  models,
  model,
  provider: 'qwen',
  error: models.length > 0 ? null : 'upstream_unavailable',
}];`,
    };

    @node({
        id: '3c93ea7d-71e1-4217-ab59-708b0231cd1d',
        name: 'Respond Health',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.5,
        position: [720, 0],
    })
    RespondHealth = {
        respondWith: 'firstIncomingItem',
        options: {
            responseHeaders: {
                entries: [
                    {
                        name: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        name: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, OPTIONS',
                    },
                    {
                        name: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization',
                    },
                ],
            },
        },
    };

    @node({
        id: 'f6d9d7b9-1135-4687-93c5-0fb9b4a369bd',
        webhookId: 'b9e4d3c2-6f5a-4b0d-9e2f-3a7c8d9e0f1b',
        name: 'Chat Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 280],
    })
    ChatWebhook = {
        httpMethod: 'POST',
        path: 'b9e4d3c2-6f5a-4b0d-9e2f-3a7c8d9e0f1b',
        responseMode: 'responseNode',
        options: {},
    };

    @node({
        id: '48660d22-88c1-4fb4-a0bb-dee8e472d3c5',
        name: 'Post Qwen Chat',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.4,
        position: [240, 280],
    })
    PostQwenChat = {
        method: 'POST',
        url: '={{ ($env.QWEN_API_BASE || "https://ws-pvflth6kss1o2my2.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1").replace(/\\/$/, "") + "/chat/completions" }}',
        authentication: 'none',
        sendHeaders: true,
        specifyHeaders: 'keypair',
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: '=Bearer {{ $env.QWEN_API_KEY }}',
                },
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
            ],
        },
        sendBody: true,
        contentType: 'json',
        specifyBody: 'json',
        jsonBody: `={{
      JSON.stringify({
        model: $env.QWEN_MODEL || 'qwen3.7-plus',
        messages: $json.body?.messages ?? [],
        stream: false,
      })
    }}`,
        options: {
            response: {
                response: {
                    responseFormat: 'json',
                },
            },
            timeout: 120000,
        },
    };

    @node({
        id: '0cf2d1cb-7830-4918-9e81-aa1f0c9f3999',
        name: 'Format Chat Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [480, 280],
    })
    FormatChatResponse = {
        mode: 'runOnceForAllItems',
        language: 'javaScript',
        jsCode: `const upstream = $input.first()?.json ?? {};
const content = upstream?.choices?.[0]?.message?.content ?? '';
if (!content) {
  const err = upstream?.error?.message || upstream?.message || 'Empty response from Qwen';
  throw new Error(err);
}
return [{ content }];`,
    };

    @node({
        id: 'e4e8db97-22d9-42e0-98e6-538018d999e0',
        name: 'Respond Chat',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.5,
        position: [720, 280],
    })
    RespondChat = {
        respondWith: 'firstIncomingItem',
        options: {
            responseHeaders: {
                entries: [
                    {
                        name: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        name: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, OPTIONS',
                    },
                    {
                        name: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization',
                    },
                ],
            },
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.HealthWebhook.out(0).to(this.GetQwenModels.in(0));
        this.GetQwenModels.out(0).to(this.FormatHealthResponse.in(0));
        this.FormatHealthResponse.out(0).to(this.RespondHealth.in(0));
        this.ChatWebhook.out(0).to(this.PostQwenChat.in(0));
        this.PostQwenChat.out(0).to(this.FormatChatResponse.in(0));
        this.FormatChatResponse.out(0).to(this.RespondChat.in(0));
    }
}
