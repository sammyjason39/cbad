import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Linkedin Professional Photo Generator
// Nodes   : 19  |  Connections: 9
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// StickyNote                         stickyNote
// OnFormSubmission                   formTrigger
// HttpRequest                        httpRequest
// EditFields                         set
// If_                                if
// Wait                               wait
// Form                               form
// ImageGeneration                    httpRequest
// StickyNote1                        stickyNote
// StickyNote2                        stickyNote
// UploadFile                         googleDrive
// StickyNote3                        stickyNote
// StickyNote4                        stickyNote
// StickyNote5                        stickyNote
// StickyNote6                        stickyNote
// StickyNote7                        stickyNote
// EditAnImage                        googleGemini
// Form1                              form
// StickyNote8                        stickyNote
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// OnFormSubmission
//    → UploadFile
//      → EditFields
//        → ImageGeneration
//          → HttpRequest
//            → If_
//              → Form
//             .out(1) → Wait
//                → HttpRequest (↩ loop)
// EditAnImage
//    → Form1
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '09JgV9wQklf6iMDl',
    name: 'Linkedin Professional Photo Generator',
    active: false,
    settings: { executionOrder: 'v1', callerPolicy: 'workflowsFromSameOwner', availableInMCP: false },
})
export class LinkedinProfessionalPhotoGeneratorWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '627d680b-9ddc-4612-9853-def3f79b31fc',
        name: 'Sticky Note',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-896, -336],
    })
    StickyNote = {
        content: `## LinkedIn Professional Photo Generator

Generate foto profile linkedin dari foto sehari-hari mu. Upload photo di dalam form dan tunggu bbrp saat, dan kamu akan dapat hasil photo yang siap dipakai!.

### Step-by-step
Di workflow ini kita menggunakan Nano Banana sebagai image generator.
Free 50 Credit. Bisa generate up to 10+ Gambar Nano Banana.
1. Buat Akun Pada [Nano Banana API](https://nanobananaapi.ai/)
2. Dapatkan API Key -> Pasang Sebagai Credential (Gunakan Bearer)

#### Opsi dengan Node Gemini (versi lebih sederhana
(Perlu akun Google Cloud dengan Free Credit / Berbayar)
1.  Click link [berikut](https://aistudio.google.com/)
2. Login dengan email yang sama dengan email terdaftar di Google Cloud (Pastikan sudah terdaftar di google cloud agar bisa menggunakan free creditnya)
3. Ke menu project -> Import project yang sudah dibuat dari Google Cloud
4. Ke API Key, generate new API Key.`,
        height: 672,
        width: 320,
        color: 7,
    };

    @node({
        id: 'f5b40258-98ec-4ccc-9406-5b0eddabf6c2',
        webhookId: 'ae59cf01-e42d-449e-b6fd-72ec78920c13',
        name: 'On form submission',
        type: 'n8n-nodes-base.formTrigger',
        version: 2.3,
        position: [-432, -208],
    })
    OnFormSubmission = {
        formTitle: 'Nano Banana Photo Generator',
        formDescription:
            'Workflow ini dapat bantu kamu generate photo professional. Upload photo sehari-hari kamu dan AI yang akan generate photo professional buat kamu, bisa dipakai di linkedin, dipakai buat photo CV, photo profile WA, dan lain-lain',
        formFields: {
            values: [
                {
                    fieldLabel: 'Upload Photo mu',
                    fieldType: 'file',
                    multipleFiles: false,
                    requiredField: true,
                },
            ],
        },
        responseMode: 'lastNode',
        options: {},
    };

    @node({
        id: 'e896d2ff-dedb-48c8-a989-c914a330d0b4',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [464, -208],
    })
    HttpRequest = {
        url: 'https://api.nanobananaapi.ai/api/v1/nanobanana/record-info',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpBearerAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'taskId',
                    value: '={{ $json.data.taskId }}',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'f2fd0e8e-fade-4179-9f2f-28e620b95cf7',
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [32, -208],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: 'e07c0668-85ff-46f2-a852-d0d58c778c55',
                    name: 'link',
                    value: '=https://lh3.googleusercontent.com/d/{{ $json.id }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        id: '9a4a7b88-9c9a-4245-8b98-fade6bb718c6',
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [704, -208],
    })
    If_ = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'f24888c5-42e9-4d9f-a26b-8f4905f130e1',
                    leftValue: '={{ $json.data.successFlag }}',
                    rightValue: 1,
                    operator: {
                        type: 'number',
                        operation: 'equals',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: '2971c114-cb29-468b-98a5-e6c5eb06fb73',
        webhookId: '2f640efc-15be-4996-ad22-e04fc917ce72',
        name: 'Wait',
        type: 'n8n-nodes-base.wait',
        version: 1.1,
        position: [880, -32],
    })
    Wait = {};

    @node({
        id: 'a89dde48-dda6-43ac-9669-b0f36167f2cc',
        webhookId: 'c5bbf86e-7533-4144-a55b-df5dd669aa40',
        name: 'Form',
        type: 'n8n-nodes-base.form',
        version: 2.3,
        position: [960, -224],
    })
    Form = {
        operation: 'completion',
        respondWith: 'redirect',
        redirectUrl: '={{ $json.data.response.resultImageUrl }}',
        options: {},
    };

    @node({
        id: 'e35b2931-4ef8-4806-8b76-4d654404fce4',
        name: 'Image Generation',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [240, -208],
    })
    ImageGeneration = {
        method: 'POST',
        url: 'https://api.nanobananaapi.ai/api/v1/nanobanana/generate',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpBearerAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: `={
  "prompt": "Transform this photo into a polished profile shot for linkedin maintaining the exact facial features and identity. Subject framed chest-up with headroom, eyes looking directly at camera while body angles slightly away. White t-shirt with black formal suit, open smile. Bright Office background. Eyes angle perspective with soft shot with 85mm lens aesthetic with depth of field - sharp focus on eyes, soft bokeh background. Natural skin texture with visible hair detail. Bright, airy feel. Make subject look great and accurate to their original appearance.",
  "numImages": 1,
  "type": "IMAGETOIAMGE",
  "image_size": "2:3",
  "callBackUrl": "https:test.com",
  "imageUrls":"{{ $json.link }}"
}`,
        options: {},
    };

    @node({
        id: 'feb5439a-364a-4caa-98c1-fec2cbf80c28',
        name: 'Sticky Note1',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-512, -336],
    })
    StickyNote1 = {
        content: `## Form Trigger
Upload photo disini`,
        height: 288,
        color: 7,
    };

    @node({
        id: '1314c78d-71b5-4ae9-95da-4697318ecf5a',
        name: 'Sticky Note2',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-256, -336],
    })
    StickyNote2 = {
        content: `### Upload Photo ke Google Drive
Kita gunakan drive sebagai tempat menyimpan gambar sementara`,
        height: 288,
        width: 224,
        color: 7,
    };

    @node({
        id: 'f6dfb971-d3fa-4997-b99f-45490d9c0c79',
        name: 'Upload file',
        type: 'n8n-nodes-base.googleDrive',
        version: 3,
        position: [-192, -208],
    })
    UploadFile = {
        inputDataFieldName: 'Upload_Photo_mu',
        name: "={{ $json['Upload Photo mu'].filename }}_{{ $json.submittedAt }}",
        driveId: {
            __rl: true,
            value: 'My Drive',
            mode: 'list',
            cachedResultName: 'My Drive',
            cachedResultUrl: 'https://drive.google.com/drive/my-drive',
        },
        folderId: {
            __rl: true,
            value: '143H0xI-wCuoRZUzgTfMLXnejrSvXyznn',
            mode: 'list',
            cachedResultName: 'Workflow N8N',
            cachedResultUrl: 'https://drive.google.com/drive/folders/143H0xI-wCuoRZUzgTfMLXnejrSvXyznn',
        },
        options: {},
    };

    @node({
        id: '8c5f4915-2e5e-40cd-b709-f1e63ca88695',
        name: 'Sticky Note3',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-16, -336],
    })
    StickyNote3 = {
        content: `### Edit Link Google Drive
Return link yang bisa diambil platform lain`,
        height: 288,
        width: 192,
        color: 7,
    };

    @node({
        id: '5a6896f1-0c6e-43d6-bdd0-fe665b1b2a82',
        name: 'Sticky Note4',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [192, -336],
    })
    StickyNote4 = {
        content: `### Generate Gambar - Nano Banana
Kirim Prompt, ratio, mode yang diinginkan, juga link sumber photo`,
        height: 288,
        width: 192,
        color: 7,
    };

    @node({
        id: '3ae5ddad-b0e6-4780-9a9a-b9c320dd0183',
        name: 'Sticky Note5',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [416, -336],
    })
    StickyNote5 = {
        content: '### Cek Status Image Generation',
        height: 288,
        width: 192,
        color: 7,
    };

    @node({
        id: '501e2110-b1e3-42d8-9197-5f2d3d556940',
        name: 'Sticky Note6',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [656, -336],
    })
    StickyNote6 = {
        content: `### Conditional
Kirim ke Form jika gambar sudah berhasil di generate,tunggu 5 detik jika belum`,
        height: 288,
        width: 192,
        color: 7,
    };

    @node({
        id: 'cc8e502f-9600-45b5-ad26-5f2387c96c90',
        name: 'Sticky Note7',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [912, -336],
    })
    StickyNote7 = {
        content: `### Tutup Form
Kirim link ke dalam form`,
        height: 288,
        width: 192,
        color: 7,
    };

    @node({
        id: '3727dd6e-aadf-4e8d-96ab-9ad100e8f6cb',
        name: 'Edit an image',
        type: '@n8n/n8n-nodes-langchain.googleGemini',
        version: 1.1,
        position: [-64, 48],
    })
    EditAnImage = {
        resource: 'image',
        operation: 'edit',
        modelId: {
            __rl: true,
            value: 'models/gemini-2.5-flash-image',
            mode: 'list',
            cachedResultName: 'models/gemini-2.5-flash-image (Nano Banana)',
        },
        prompt: 'Transform this photo into a polished profile shot for linkedin maintaining the exact facial features and identity. Subject framed chest-up with headroom, eyes looking directly at camera while body angles slightly away. White t-shirt with black formal suit, open smile. Bright Office background. Eyes angle perspective with soft shot with 85mm lens aesthetic with depth of field - sharp focus on eyes, soft bokeh background. Natural skin texture with visible hair detail. Bright, airy feel. Make subject look great and accurate to their original appearance.',
        images: {
            values: [
                {
                    binaryPropertyName: 'Upload_Photo_mu',
                },
            ],
        },
        options: {
            binaryPropertyOutput: 'output',
        },
    };

    @node({
        id: 'd0f5b0d2-f267-457b-8723-9eaa85705681',
        webhookId: '4a764525-e6c6-46e6-a9fa-f1abd09eaa27',
        name: 'Form1',
        type: 'n8n-nodes-base.form',
        version: 2.4,
        position: [176, 48],
    })
    Form1 = {
        operation: 'completion',
        respondWith: 'returnBinary',
        completionTitle: 'Berikut adalah photo mu yang sudah diedit',
        inputDataFieldName: 'output',
        options: {},
    };

    @node({
        id: '96f27c08-c545-412a-93e0-b0556c01c381',
        name: 'Sticky Note8',
        type: 'n8n-nodes-base.stickyNote',
        version: 1,
        position: [-512, 16],
    })
    StickyNote8 = {
        content: `## Menggunakan Node Gemini
#### (Versi Lebih sederhana)
Sambungkan node Form Trigger 
Langsung Ke Node Gemini`,
        height: 192,
        width: 880,
        color: 7,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.OnFormSubmission.out(0).to(this.UploadFile.in(0));
        this.EditFields.out(0).to(this.ImageGeneration.in(0));
        this.HttpRequest.out(0).to(this.If_.in(0));
        this.If_.out(0).to(this.Form.in(0));
        this.If_.out(1).to(this.Wait.in(0));
        this.Wait.out(0).to(this.HttpRequest.in(0));
        this.ImageGeneration.out(0).to(this.HttpRequest.in(0));
        this.UploadFile.out(0).to(this.EditFields.in(0));
        this.EditAnImage.out(0).to(this.Form1.in(0));
    }
}
