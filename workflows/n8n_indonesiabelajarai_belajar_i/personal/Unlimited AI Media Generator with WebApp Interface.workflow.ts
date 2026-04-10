import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Unlimited AI Media Generator with WebApp Interface
// Nodes   : 22  |  Connections: 16
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// GenerateAnImage                    googleGemini
// RespondToWebhook                   respondToWebhook
// AiAgent                            agent                      [AI]
// GoogleGeminiChatModel              lmChatGoogleGemini         [ai_languageModel]
// Serpapi                            toolSerpApi                [ai_tool]
// HttpRequest                        httpRequest
// Wait                               wait
// HttpRequest1                       httpRequest
// If_                                if
// AiAgent1                           agent                      [AI]
// GoogleGeminiChatModel1             lmChatGoogleGemini         [ai_languageModel]
// NanoBananaWebhook                  webhook
// LyricMakerWebhook                  webhook
// RespondToLyricMaker                respondToWebhook
// SunoAiWebhook                      webhook
// RespondToSunoAiWebhook             respondToWebhook
// Veo3Webhook                        webhook
// RespondToWebhook1                  respondToWebhook
// Generate169Video                   googleGemini
// Generate916Video                   googleGemini
// If1                                if
// StickyNote                         stickyNote
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// NanoBananaWebhook
//    → GenerateAnImage
//      → RespondToWebhook
// LyricMakerWebhook
//    → AiAgent
//      → RespondToLyricMaker
// SunoAiWebhook
//    → AiAgent1
//      → HttpRequest
//        → Wait
//          → HttpRequest1
//            → If_
//              → RespondToSunoAiWebhook
//             .out(1) → Wait (↩ loop)
// Veo3Webhook
//    → If1
//      → Generate169Video
//        → RespondToWebhook1
//     .out(1) → Generate916Video
//        → RespondToWebhook1 (↩ loop)
//
// AI CONNECTIONS
// AiAgent.uses({ ai_languageModel: GoogleGeminiChatModel, ai_tool: [Serpapi] })
// AiAgent1.uses({ ai_languageModel: GoogleGeminiChatModel1 })
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '4fML1MhpGoiIz89r',
    name: 'Unlimited AI Media Generator with WebApp Interface',
    active: false,
    settings: {
        executionOrder: 'v1',
        callerPolicy: 'workflowsFromSameOwner',
        errorWorkflow: 'aF_w3QXU-rmK3QyxhZc8S',
        availableInMCP: false,
    },
})
export class UnlimitedAiMediaGeneratorWithWebappInterfaceWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '874d528b-3421-4944-bc9c-c2c5836168f3',
        name: 'Generate an image',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1.1,
        position: [208, 0],
    })
    GenerateAnImage = {
        resource: 'image',
        modelId: {
            __rl: true,
            value: 'models/gemini-3-pro-image-preview',
            mode: 'list',
            cachedResultName: 'models/gemini-3-pro-image-preview (Nano Banana Pro)',
        },
        prompt: `=Generate {{ $json.body.prompt }}
with {{ $json.body.style }} style
Ratio (W X H): {{ $json.body.width }} X {{ $json.body.height }}`,
        options: {},
    };

    @node({
        id: 'f644b787-ab10-4c99-908d-bfa99ece26f5',
        name: 'Respond to Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.5,
        position: [416, 0],
    })
    RespondToWebhook = {
        respondWith: 'binary',
        options: {},
    };

    @node({
        id: '80afec99-7d51-4f94-9237-f8d020f07327',
        name: 'AI Agent',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 3.1,
        position: [208, 224],
    })
    AiAgent = {
        promptType: 'define',
        text: `=You are an expert Songwriter specialized in prompting for **Suno AI (v5)**. You can use SERP API as Searching tools whenever needed.

### INPUT DATA
- **Theme:** {{$json.body.theme}}
- **Genre:** {{$json.body.genre}}
- **Mood:** {{$json.body.mood}}
- **Language Request:** {{$json.body.language}}
- **Target Duration:** {{$json.body.duration}} seconds

---

### STEP 1: LANGUAGE LOGIC GATE
Check the **Language Request** and follow the matching path:

**PATH A: IF "Mix" / "Multilanguage" (e.g., K-Pop)**
   - **Strategy:** Mix **English** and the **Target Language** (e.g., Korean).
   - **Script Rule:** Use **NATIVE SCRIPTS ONLY** (Hangul for Korean, Kanji for Japanese). 
   - **CONSTRAINT:** Do NOT include Romanization or pronunciation guides in brackets.
     - *Bad:* \`사랑해 (Saranghae)\`
     - *Good:* \`사랑해\`

**PATH B: IF Specific Language**
   - **Strategy:** Write entirely in that language using **NATIVE SCRIPTS**.
   - *Indonesian:* Standard Bahasa Indonesia.
   - *Chinese:* Hanzi.
   - *Japanese:* Kanji/Hiragana/Katakana.

---

### STEP 2: DURATION LOGIC GATE (CRITICAL)
You must select the structure based on the **Target Duration** to ensure the song length fits.

**OPTION 1: SHORT (< 60 Seconds)**
   *Goal: A quick snippet or jingle.*
   1. **[Intro]** (Instrumental tag only)
   2. **[Verse]** (4 lines)
   3. **[Chorus]** (4 lines)
   4. **[Outro]** (Fade out)

**OPTION 2: MEDIUM (60 - 120 Seconds)**
   *Goal: A standard radio edit.*
   1. **[Intro]** (Short)
   2. **[Verse 1]** (4 lines)
   3. **[Chorus]** (4-6 lines)
   4. **[Verse 2]** (4 lines)
   5. **[Chorus]** (Repeat Hook)
   6. **[Outro]** (Fade out)

**OPTION 3: LONG (> 120 Seconds)**
   *Goal: A full length song.*
   1. **[Intro]** (Mood setting)
   2. **[Verse 1]** (4 lines)
   3. **[Chorus]** (4-6 lines)
   4. **[Verse 2]** (4 lines)
   5. **[Chorus]** (Repeat Hook)
   6. **[Bridge]** (Tempo change/High note, 4 lines)
   7. **[Chorus]** (Final energetic drop)
   8. **[Outro]** (Extended fade)

---

### SUNO FORMATTING RULES
1. **METATAGS:** Use square brackets \`[]\` to guide the AI (e.g., \`[Melodic Intro]\`, \`[Rap Verse]\`, \`[Guitar Solo]\`).
2. **NO LINE PREFIXES:** Do **NOT** put \`[ko]\`, \`[id]\`, or \`[en]\` at the start of lines.
3. **NO MARKDOWN:** Do NOT use triple backticks (\`\`\`).
4. **NO PARENTHESES:** No \`(pronunciation)\` guides.

### OUTPUT EXAMPLE (For "Mix" Input)
[Intro]
[Soft Piano Build]

[Verse 1]
차가운 바람이 불어와
Walking down this lonely street again
내 마음속에 비가 내려
But I can't find the words to say

[Chorus]
You are my Starlight
밤하늘 빛나는 별
Don't let me go
영원히 함께해

[Outro]
[Fade to Silence]

### FINAL INSTRUCTION
Generate the lyrics now based on the **Language Path** and **Duration Option**. Output raw text only.`,
        options: {},
    };

    @node({
        id: '8d8efaa6-a321-425f-be4e-5cbb956188c4',
        name: 'Google Gemini Chat Model',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [176, 448],
    })
    GoogleGeminiChatModel = {
        modelName: 'models/gemini-3-flash-preview',
        options: {},
    };

    @node({
        id: '51938752-2544-483d-a445-f20c619bcfc1',
        name: 'SerpAPI',
        type: '@n8n/n8n-nodes-langchain.toolSerpApi',
        version: 1,
        position: [368, 448],
    })
    Serpapi = {
        options: {},
    };

    @node({
        id: 'cf2a9989-2c03-40e2-a2e2-0e746315b199',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [576, 656],
    })
    HttpRequest = {
        method: 'POST',
        url: 'https://api.sunoapi.org/api/v1/generate',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpBearerAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "customMode": true,
  "instrumental": false,
  "model": "V5",
  "callBackUrl": "https://api.example.com/callback",
  "prompt": {{ $('Suno AI Webhook').item.json.body.lyrics.toJsonString() }},
  "style": "{{ $('Suno AI Webhook').item.json.body.genre }} {{ $('Suno AI Webhook').item.json.body.mood }}",
  "title": "{{ $json.output }}",
  "personaId": "persona_123",
  "negativeTags": "Heavy Metal, Upbeat Drums",
  "vocalGender": "m",
  "styleWeight": 0.65,
  "weirdnessConstraint": 0.65,
  "audioWeight": 0.65
} `,
        options: {},
    };

    @node({
        id: '998eaf76-22df-4ed7-b68e-f25a79121144',
        webhookId: '501bf72f-5034-4433-8226-92cf0677c169',
        name: 'Wait',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [784, 656],
    })
    Wait = {
        amount: 15,
    };

    @node({
        id: 'f5e9d292-0077-45c5-a6f5-861ba4454eb9',
        name: 'HTTP Request1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.3,
        position: [992, 656],
    })
    HttpRequest1 = {
        url: 'https://api.sunoapi.org/api/v1/generate/record-info',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpBearerAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'taskId',
                    value: "={{ $('HTTP Request').item.json.data.taskId }}",
                },
            ],
        },
        options: {},
    };

    @node({
        id: '8060e83f-2ea5-45d2-b4a6-e47ed876a72d',
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [1200, 656],
    })
    If_ = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: 'c7d65ad3-e76e-40ce-80bd-8fb0526d3f55',
                    leftValue: '={{ $json.data.status }}',
                    rightValue: 'SUCCESS',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'c36eb636-433d-43da-9278-693d0462a8b6',
        name: 'AI Agent1',
        type: '@n8n/n8n-nodes-langchain.agent',
        version: 3.1,
        position: [208, 656],
    })
    AiAgent1 = {
        promptType: 'define',
        text: '=User Lyrics : {{ $json.body.lyrics }}',
        options: {
            systemMessage:
                'You are a Top Tier Music Producer, given the lyrics generated by user, create a good sound catching TItle for the Song. Generate only one  best song title that you can generate without any additional infos or chat.',
        },
    };

    @node({
        id: 'e4f84df7-0449-4d09-90e2-03be4c0364da',
        name: 'Google Gemini Chat Model1',
        type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
        version: 1,
        position: [160, 864],
    })
    GoogleGeminiChatModel1 = {
        modelName: 'models/gemini-3-flash-preview',
        options: {},
    };

    @node({
        id: '3c7d70a1-601e-4eac-9625-85303fe982f1',
        webhookId: '34d4244b-1dd3-4218-9a46-6dec8b27fe0b',
        name: 'Nano Banana Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 0],
    })
    NanoBananaWebhook = {
        httpMethod: 'POST',
        path: '34d4244b-1dd3-4218-9a46-6dec8b27fe0b',
        responseMode: 'responseNode',
        options: {
            rawBody: true,
        },
    };

    @node({
        id: '312be3eb-7808-492a-853c-0394d11c5cb8',
        webhookId: 'f7979f14-1595-4bbf-b183-e3c3c666ae53',
        name: 'Lyric Maker Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 224],
    })
    LyricMakerWebhook = {
        httpMethod: 'POST',
        path: 'f7979f14-1595-4bbf-b183-e3c3c666ae53',
        responseMode: 'responseNode',
        options: {
            rawBody: true,
        },
    };

    @node({
        id: '1c0dde04-b7ea-4320-be0b-8cedec0cc39b',
        name: 'Respond to Lyric Maker',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.5,
        position: [560, 224],
    })
    RespondToLyricMaker = {
        options: {},
    };

    @node({
        id: '3b41e8e6-0800-4b65-8014-1c70106b32b6',
        webhookId: '5b2a0cde-e177-44ed-9d58-f2abe2cc0dc4',
        name: 'Suno AI Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 656],
    })
    SunoAiWebhook = {
        httpMethod: 'POST',
        path: '5b2a0cde-e177-44ed-9d58-f2abe2cc0dc4',
        responseMode: 'responseNode',
        options: {
            rawBody: true,
        },
    };

    @node({
        id: 'da17cafd-7b73-46a3-a8cf-3c6f3e68b1a4',
        name: 'Respond to Suno AI Webhook',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.5,
        position: [1504, 640],
    })
    RespondToSunoAiWebhook = {
        options: {},
    };

    @node({
        id: 'd8a9ae54-437d-4d96-a1a0-7cea0439faa5',
        webhookId: '5f16cf0e-7643-4061-bf43-42329d496b12',
        name: 'VEO 3 Webhook',
        type: 'n8n-nodes-base.webhook',
        version: 2.1,
        position: [0, 1088],
    })
    Veo3Webhook = {
        httpMethod: 'POST',
        path: '5f16cf0e-7643-4061-bf43-42329d496b12',
        responseMode: 'responseNode',
        options: {
            rawBody: true,
        },
    };

    @node({
        id: 'c438bd26-821d-4089-8870-80d6ccc442fd',
        name: 'Respond to Webhook1',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.5,
        position: [656, 1088],
    })
    RespondToWebhook1 = {
        respondWith: 'binary',
        options: {},
    };

    @node({
        id: '8b1523de-9d52-4a08-b5c0-e335ce1667ff',
        name: 'Generate 16:9 Video',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1.1,
        position: [416, 1008],
    })
    Generate169Video = {
        resource: 'video',
        modelId: {
            __rl: true,
            value: 'models/veo-3.1-fast-generate-preview',
            mode: 'list',
            cachedResultName: 'models/veo-3.1-fast-generate-preview',
        },
        prompt: '={{ $json.body.prompt }}, {{ $json.body.style }} style',
        options: {
            durationSeconds: '={{ $json.body.duration }}',
            aspectRatio: '16:9',
        },
    };

    @node({
        id: '832fe8bd-f413-4f86-9f97-2a0a28b57dc4',
        name: 'Generate 9:16 Video',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1.1,
        position: [416, 1200],
    })
    Generate916Video = {
        resource: 'video',
        modelId: {
            __rl: true,
            value: 'models/veo-3.1-fast-generate-preview',
            mode: 'list',
            cachedResultName: 'models/veo-3.1-fast-generate-preview',
        },
        prompt: '={{ $json.body.prompt }}, {{ $json.body.style }} style',
        options: {
            durationSeconds: '={{ $json.body.duration }}',
            aspectRatio: '9:16',
        },
    };

    @node({
        id: '38de129f-6c5d-4b10-abcb-1d90aa42e591',
        name: 'If1',
        type: 'n8n-nodes-base.if',
        version: 2.3,
        position: [224, 1088],
    })
    If1 = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 3,
            },
            conditions: [
                {
                    id: '297aa55b-6d1d-4642-9401-551b2d2aac87',
                    leftValue: '={{ $json.body.ratio }}',
                    rightValue: '=16:9',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '9dfa3a9a-5183-4407-afe1-7c56a342a95e',
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-608, 0],
    })
    StickyNote = {
        content: `# 🚀 Unlimited AI Media Generator

Workflow n8n untuk otomasi pembuatan Gambar, Video, Lirik, dan Musik secara masif melalui integrasi API Gemini & Suno.

---

### 📂 Jalur Utama (Main Paths)

1. **Image (Nano Banana)**
   * Node: \`Gemini 3 Pro Image\`
   * Fungsi: Generate gambar custom style & ratio.
   * Output: Direct Binary.

2. **Lyric Maker**
   * Node: \`AI Agent (Gemini 3 Flash)\`
   * Logika: Struktur lirik otomatis (Short/Medium/Long) & support Multilanguage script (Hangul/Kanji).

3. **Music (Suno AI v5)**
   * Node: \`HTTP Request\` + \`Polling Loop\`
   * Logika: Generate musik -> Wait 15 detik -> Check Status SUCCESS -> Return Result.
   * Fitur: Auto-generate judul lagu via AI Producer.

4. **Video (VEO 3.1)**
   * Node: \`Gemini Video\`
   * Logika: Auto-switch ratio 16:9 (Lanskap) atau 9:16 (Portrait).

---

### ⚙️ Konfigurasi & Setup

* **Setup API Google** : 'Google Gemini PALM API' Key dari [AI Studio](https://aistudio.google.com/api-keys)
* **Setup API Suno** : Dari platform [Suno API](https://sunoapi.org/)
* **Webhook:** Aktifkan workflow dan gunakan URL POST dari node Trigger paling kiri.
* **Git:** [https://github.com/indonesiabelajarai/unlimited-ai-media-generator.git](https://github.com/indonesiabelajarai/unlimited-ai-media-generator.git)
* **Demo:** [unlimitedai.indonesiabelajarai.com](unlimitedai.indonesiabelajarai.com)

---

### 📈 Untuk Pengembangan Lanjutan
Anda dapat mengembangkan web application ini dari 0 ataupun meningkatkan yang sudah ada dengan cara Vibe coding. 
Berikut bbrp Tools Vibecoding yang kami rekomendasikan : 
- Menggunakan [emergent.sh](https://app.emergent.sh/?via=belajarai-n8n), platform Vibe Coding terbaik saat ini (Dapat generate FullStack Web App, Mobile App, dan Landing Page). Ada Free Version (Mendapatkan 10 Credit per hari)
- Menggunakan IDE Berbasis AI Code Agent Seperti [Google Anti Gravity](https://antigravity.google/)
- Menggunakan CLI Based AI Code Agent Seperti 
[Claude Code](https://claude.com/product/claude-code)`,
        height: 1520,
        width: 384,
        color: 7,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.GenerateAnImage.out(0).to(this.RespondToWebhook.in(0));
        this.AiAgent.out(0).to(this.RespondToLyricMaker.in(0));
        this.HttpRequest.out(0).to(this.Wait.in(0));
        this.Wait.out(0).to(this.HttpRequest1.in(0));
        this.HttpRequest1.out(0).to(this.If_.in(0));
        this.If_.out(0).to(this.RespondToSunoAiWebhook.in(0));
        this.If_.out(1).to(this.Wait.in(0));
        this.AiAgent1.out(0).to(this.HttpRequest.in(0));
        this.NanoBananaWebhook.out(0).to(this.GenerateAnImage.in(0));
        this.LyricMakerWebhook.out(0).to(this.AiAgent.in(0));
        this.SunoAiWebhook.out(0).to(this.AiAgent1.in(0));
        this.Veo3Webhook.out(0).to(this.If1.in(0));
        this.Generate169Video.out(0).to(this.RespondToWebhook1.in(0));
        this.If1.out(0).to(this.Generate169Video.in(0));
        this.If1.out(1).to(this.Generate916Video.in(0));
        this.Generate916Video.out(0).to(this.RespondToWebhook1.in(0));

        this.AiAgent.uses({
            ai_languageModel: this.GoogleGeminiChatModel.output,
            ai_tool: [this.Serpapi.output],
        });
        this.AiAgent1.uses({
            ai_languageModel: this.GoogleGeminiChatModel1.output,
        });
    }
}
