# n8n-nodes-deepkeep

An [n8n](https://n8n.io) community node for the [DeepKeep](https://deepkeep.ai) AI Firewall API.

Use it in your workflows to check LLM inputs and outputs against DeepKeep guardrails and make arbitrary authorized calls to any DeepKeep API endpoint.

## Installation

### Via the n8n UI (self-hosted or Cloud once verified)

In your n8n instance, go to **Settings → Community Nodes → Install**, paste `n8n-nodes-deepkeep`, and click **Install**.

### Manually (self-hosted)

From your n8n root directory:

```bash
npm install n8n-nodes-deepkeep
```

Make sure `N8N_COMMUNITY_PACKAGES_ENABLED=true` (default in recent versions), then restart n8n.

## Credentials

Create a **DeepKeep API** credential with:

| Field    | Value                                                                 |
| -------- | --------------------------------------------------------------------- |
| Base URL | The base URL of your DeepKeep instance, without a trailing slash.      |
| API Key  | Your DeepKeep API key. Sent as the `X-API-Key` header on every request. |

The credential is tested against `GET /health`.

## Operations

All operations live under the **Moderation** resource.

### Pre moderation

Checks model input against the guardrails defined on a DeepKeep firewall.

- **Model** — DeepKeep firewall ID. Sent as the OpenAI-compatible `model` field.
- **Input** — the text to check.
- **Title** — optional request title.
- **Chat** — optional chat identifier or context.

Calls `POST /api/v3/openai/moderations/pre` with:

```json
{"model":"input-firewall-id","input":"hello","title":"","chat":""}
```

### Post moderation

Checks model output against the guardrails defined on a DeepKeep firewall.

- **Model** — DeepKeep firewall ID. Sent as the OpenAI-compatible `model` field.
- **Output** — the text to check.
- **Title** — optional request title.
- **Chat** — optional chat identifier or context.

Calls `POST /api/v3/openai/moderations/post` with:

```json
{"model":"output-firewall-id","output":"hello","title":"","chat":""}
```

### Make API call

An escape hatch that lets you call any DeepKeep endpoint with the configured credentials.

- **URL** — path relative to the configured Base URL (e.g. `/api/v3/openai/moderations/pre`).
- **Method** — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- **Headers** — optional key/value rows. `Content-Type: application/json` is included by default.
- **Query Parameters** — optional key/value rows.
- **Body** — raw request body (usually JSON).

Returns `{ statusCode, headers, body }`. `body` is parsed as JSON when possible, otherwise passed through as a string. Non-2xx responses are returned in the envelope rather than thrown.

## Migration from 0.1.x

Version 0.2.0 updates this node to the same OpenAI-compatible DeepKeep API calls used by the LangChain integration.

- Replace the old **Subdomain** credential with **Base URL**.
- Replace legacy conversation operations with **Pre Moderation** and **Post Moderation**.
- Use your DeepKeep firewall ID in the **Model** field.
- The legacy `Create Conversation` operation and conversation-based `Check Input` operation are removed.

## Local development

See the sibling `n8n-deepkeep/` folder in the source repository for a Docker Compose setup that runs n8n locally with this package mounted as a custom node.

## License

[MIT](./LICENSE)

## Support

- DeepKeep documentation: https://deepkeep.ai
- Issues: please file on this repository
- Contact: contact@deepkeep.ai
