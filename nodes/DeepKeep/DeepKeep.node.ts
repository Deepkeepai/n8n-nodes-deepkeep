import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  NodeConnectionTypes,
  NodeApiError,
  NodeOperationError,
} from 'n8n-workflow';
import type {
  IDataObject,
  IHttpRequestMethods,
  JsonObject,
} from 'n8n-workflow';

export class DeepKeep implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DeepKeep',
    name: 'deepKeep',
    icon: {
      light: 'file:deepkeep-light.svg',
      dark: 'file:deepkeep-dark.svg',
    },
    group: ['transform'],
    version: [1, 2],
    usableAsTool: true,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the DeepKeep AI Firewall API',
    defaults: {
      name: 'DeepKeep',
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'deepKeepApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Firewall Conversation',
            value: 'firewallConversation',
          },
        ],
        default: 'firewallConversation',
        displayOptions: {
          show: {
            '@version': [1],
          },
        },
      },
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Moderation',
            value: 'moderation',
          },
        ],
        default: 'moderation',
        displayOptions: {
          show: {
            '@version': [2],
          },
        },
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            '@version': [1],
            resource: ['firewallConversation'],
          },
        },
        options: [
          {
            name: 'Check Input',
            value: 'checkInput',
            description: 'Check prompt against defined guardrails',
            action: 'Check prompt against defined guardrails',
          },
          {
            name: 'Create Conversation',
            value: 'createConversation',
            description: 'Create a new conversation in a firewall',
            action: 'Create a new conversation in a firewall',
          },
          {
            name: 'Make API Call',
            value: 'makeApiCall',
            description: 'Performs an arbitrary authorized API call',
            action: 'Perform an arbitrary authorized API call',
          },
        ],
        default: 'checkInput',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            '@version': [2],
            resource: ['moderation'],
          },
        },
        options: [
          {
            name: 'Pre Moderation',
            value: 'preModeration',
            description: 'Check model input against DeepKeep guardrails',
            action: 'Check model input against deep keep guardrails',
          },
          {
            name: 'Post Moderation',
            value: 'postModeration',
            description: 'Check model output against DeepKeep guardrails',
            action: 'Check model output against deep keep guardrails',
          },
          {
            name: 'Make API Call',
            value: 'makeApiCall',
            description: 'Performs an arbitrary authorized API call',
            action: 'Perform an arbitrary authorized API call',
          },
        ],
        default: 'preModeration',
      },
      {
        displayName: 'Firewall Name or ID',
        name: 'firewallId',
        type: 'options',
        typeOptions: {
          loadOptionsMethod: 'listFirewalls',
        },
        required: true,
        default: '',
        description:
          'The Firewall containing the guardrails. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        displayOptions: {
          show: {
            '@version': [1],
            resource: ['firewallConversation'],
            operation: ['checkInput', 'createConversation'],
          },
        },
      },
      {
        displayName: 'Conversation ID',
        name: 'conversationId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the Conversation',
        displayOptions: {
          show: {
            '@version': [1],
            resource: ['firewallConversation'],
            operation: ['checkInput'],
          },
        },
      },
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        required: true,
        default: '',
        typeOptions: { rows: 4 },
        description: 'The text content to be checked by the firewall',
        displayOptions: {
          show: {
            '@version': [1],
            resource: ['firewallConversation'],
            operation: ['checkInput'],
          },
        },
      },
      {
        displayName: 'Return Full Response (Enable Logs)',
        name: 'logs',
        type: 'boolean',
        default: false,
        description:
          'Whether to log the request and return all detected violations in the response. When disabled, the response may include only the primary violation.',
        displayOptions: {
          show: {
            '@version': [1],
            resource: ['firewallConversation'],
            operation: ['checkInput'],
          },
        },
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        required: true,
        default: '',
        description: 'DeepKeep firewall ID to send as the OpenAI-compatible model field',
        displayOptions: {
          show: {
            '@version': [2],
            resource: ['moderation'],
            operation: ['preModeration', 'postModeration'],
          },
        },
      },
      {
        displayName: 'Input',
        name: 'input',
        type: 'string',
        required: true,
        default: '',
        typeOptions: { rows: 4 },
        description: 'The input text to check before sending it to a model',
        displayOptions: {
          show: {
            '@version': [2],
            resource: ['moderation'],
            operation: ['preModeration'],
          },
        },
      },
      {
        displayName: 'Output',
        name: 'output',
        type: 'string',
        required: true,
        default: '',
        typeOptions: { rows: 4 },
        description: 'The model output text to check before returning it downstream',
        displayOptions: {
          show: {
            '@version': [2],
            resource: ['moderation'],
            operation: ['postModeration'],
          },
        },
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Optional request title sent to DeepKeep',
        displayOptions: {
          show: {
            '@version': [2],
            resource: ['moderation'],
            operation: ['preModeration', 'postModeration'],
          },
        },
      },
      {
        displayName: 'Chat',
        name: 'chat',
        type: 'string',
        default: '',
        description: 'Optional chat identifier or context sent to DeepKeep',
        displayOptions: {
          show: {
            '@version': [2],
            resource: ['moderation'],
            operation: ['preModeration', 'postModeration'],
          },
        },
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        placeholder: '/v2/firewalls',
        description:
          'Enter the part of the URL that comes after the legacy API base. For example, /v2/firewalls.',
        displayOptions: {
          show: {
            '@version': [1],
            resource: ['firewallConversation'],
            operation: ['makeApiCall'],
          },
        },
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        placeholder: '/api/v3/openai/moderations/pre',
        description:
          'Enter the path relative to the configured DeepKeep base URL. For example, /api/v3/openai/moderations/pre.',
        displayOptions: {
          show: {
            '@version': [2],
            resource: ['moderation'],
            operation: ['makeApiCall'],
          },
        },
      },
      {
        displayName: 'Method',
        name: 'method',
        type: 'options',
        required: true,
        default: 'GET',
        options: [
          { name: 'DELETE', value: 'DELETE' },
          { name: 'GET', value: 'GET' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
        ],
        displayOptions: {
          show: {
            operation: ['makeApiCall'],
          },
        },
      },
      {
        displayName: 'Headers',
        name: 'headers',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Header',
        description: 'You do not have to add authorization headers; the DeepKeep API credentials do that automatically',
        default: {
          parameter: [{ key: 'Content-Type', value: 'application/json' }],
        },
        options: [
          {
            name: 'parameter',
            displayName: 'Header',
            values: [
              {
                displayName: 'Key',
                name: 'key',
                type: 'string',
                default: '',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
        displayOptions: {
          show: {
            operation: ['makeApiCall'],
          },
        },
      },
      {
        displayName: 'Query String',
        name: 'queryParameters',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Parameter',
        default: {},
        options: [
          {
            name: 'parameter',
            displayName: 'Parameter',
            values: [
              {
                displayName: 'Key',
                name: 'key',
                type: 'string',
                default: '',
              },
              {
                displayName: 'Value',
                name: 'value',
                type: 'string',
                default: '',
              },
            ],
          },
        ],
        displayOptions: {
          show: {
            operation: ['makeApiCall'],
          },
        },
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        default: '',
        typeOptions: { rows: 5 },
        description:
          'Raw request body. Format it yourself (usually JSON). Leave empty for methods that do not need a body.',
        displayOptions: {
          show: {
            operation: ['makeApiCall'],
          },
        },
      },
    ],
  };

  methods = {
    loadOptions: {
      async listFirewalls(
        this: ILoadOptionsFunctions,
      ): Promise<INodePropertyOptions[]> {
        const credentials = await this.getCredentials('deepKeepApi');
        const baseURL = legacyBaseUrl(credentials);

        const doRequest = async (): Promise<unknown> =>
          this.helpers.httpRequestWithAuthentication.call(
            this,
            'deepKeepApi',
            {
              method: 'POST',
              url: `${baseURL}/v2/firewalls/search`,
              qs: { page: 1, size: 100 },
              headers: { 'Content-Type': 'application/json' },
              body: '{"query":[]}',
              json: false,
            },
          );

        let raw: unknown;
        try {
          raw = await doRequest();
        } catch (error) {
          const status = getStatusCode(error);
          if (status === 429) {
            throw new NodeOperationError(
              this.getNode(),
              'DeepKeep is rate-limited or warming up. Reopen the dropdown to retry.',
            );
          }
          throw new NodeOperationError(
            this.getNode(),
            `Could not list firewalls: ${(error as Error).message}`,
          );
        }

        const response =
          typeof raw === 'string' ? JSON.parse(raw) : (raw as IDataObject);

        const items = ((response as { data?: unknown[] })?.data ?? []) as Array<{
          id: string;
          name: string;
        }>;

        return items.slice(0, 100).map((firewall) => ({
          name: firewall.name,
          value: firewall.id,
        }));
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('deepKeepApi');
    const nodeVersion = this.getNode().typeVersion;

    for (let i = 0; i < items.length; i++) {
      try {
        if (nodeVersion === 1) {
          await executeLegacyOperation.call(this, credentials, returnData, i);
        } else {
          await executeModerationOperation.call(this, credentials, returnData, i);
        }
      } catch (error) {
        const wrappedError = wrapDeepKeepError.call(this, error, i);

        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (wrappedError as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }

        throw wrappedError;
      }
    }

    return [returnData];
  }
}

async function executeLegacyOperation(
  this: IExecuteFunctions,
  credentials: IDataObject,
  returnData: INodeExecutionData[],
  itemIndex: number,
): Promise<void> {
  const resource = this.getNodeParameter('resource', itemIndex) as string;
  const operation = this.getNodeParameter('operation', itemIndex) as string;
  const baseURL = legacyBaseUrl(credentials);

  if (!baseURL) {
    throw new NodeOperationError(
      this.getNode(),
      'DeepKeep Subdomain is required for node version 1.',
      { itemIndex },
    );
  }

  if (resource === 'firewallConversation' && operation === 'checkInput') {
    const firewallId = this.getNodeParameter('firewallId', itemIndex) as string;
    const conversationId = this.getNodeParameter(
      'conversationId',
      itemIndex,
    ) as string;
    const content = this.getNodeParameter('content', itemIndex) as string;
    const logs = this.getNodeParameter('logs', itemIndex) as boolean;

    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'deepKeepApi',
      {
        method: 'POST',
        url: `${baseURL}/v2/firewalls/${encodeURIComponent(
          firewallId,
        )}/conversation/${encodeURIComponent(conversationId)}/check_user_input`,
        body: { content, logs },
        json: true,
      },
    );

    returnData.push({
      json: { results: response },
      pairedItem: { item: itemIndex },
    });
  } else if (resource === 'firewallConversation' && operation === 'createConversation') {
    const firewallId = this.getNodeParameter('firewallId', itemIndex) as string;

    const rawResponse = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'deepKeepApi',
      {
        method: 'POST',
        url: `${baseURL}/v2/firewalls/${encodeURIComponent(
          firewallId,
        )}/conversation`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
        json: false,
      },
    );

    const response =
      typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;

    returnData.push({
      json: response,
      pairedItem: { item: itemIndex },
    });
  } else if (resource === 'firewallConversation' && operation === 'makeApiCall') {
    await executeMakeApiCall.call(this, baseURL, returnData, itemIndex);
  } else {
    throw new NodeOperationError(
      this.getNode(),
      `Unsupported combination: resource="${resource}", operation="${operation}"`,
      { itemIndex },
    );
  }
}

async function executeModerationOperation(
  this: IExecuteFunctions,
  credentials: IDataObject,
  returnData: INodeExecutionData[],
  itemIndex: number,
): Promise<void> {
  const resource = this.getNodeParameter('resource', itemIndex) as string;
  const operation = this.getNodeParameter('operation', itemIndex) as string;
  const baseURL = currentBaseUrl(credentials);

  if (!baseURL) {
    throw new NodeOperationError(
      this.getNode(),
      'DeepKeep Base URL is required for node version 2.',
      { itemIndex },
    );
  }

  if (resource === 'moderation' && operation === 'preModeration') {
    const model = this.getNodeParameter('model', itemIndex) as string;
    const input = this.getNodeParameter('input', itemIndex) as string;
    const title = this.getNodeParameter('title', itemIndex, '') as string;
    const chat = this.getNodeParameter('chat', itemIndex, '') as string;

    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'deepKeepApi',
      {
        method: 'POST',
        url: `${baseURL}/api/v3/openai/moderations/pre`,
        body: { model, input, title, chat },
        json: true,
      },
    );

    returnData.push({
      json: response,
      pairedItem: { item: itemIndex },
    });
  } else if (resource === 'moderation' && operation === 'postModeration') {
    const model = this.getNodeParameter('model', itemIndex) as string;
    const output = this.getNodeParameter('output', itemIndex) as string;
    const title = this.getNodeParameter('title', itemIndex, '') as string;
    const chat = this.getNodeParameter('chat', itemIndex, '') as string;

    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'deepKeepApi',
      {
        method: 'POST',
        url: `${baseURL}/api/v3/openai/moderations/post`,
        body: { model, output, title, chat },
        json: true,
      },
    );

    returnData.push({
      json: response,
      pairedItem: { item: itemIndex },
    });
  } else if (resource === 'moderation' && operation === 'makeApiCall') {
    await executeMakeApiCall.call(this, baseURL, returnData, itemIndex);
  } else {
    throw new NodeOperationError(
      this.getNode(),
      `Unsupported combination: resource="${resource}", operation="${operation}"`,
      { itemIndex },
    );
  }
}

async function executeMakeApiCall(
  this: IExecuteFunctions,
  baseURL: string,
  returnData: INodeExecutionData[],
  itemIndex: number,
): Promise<void> {
  const userUrl = this.getNodeParameter('url', itemIndex) as string;
  const method = this.getNodeParameter(
    'method',
    itemIndex,
  ) as IHttpRequestMethods;
  const headersParam = this.getNodeParameter('headers', itemIndex, {}) as {
    parameter?: Array<{ key: string; value: string }>;
  };
  const queryParam = this.getNodeParameter('queryParameters', itemIndex, {}) as {
    parameter?: Array<{ key: string; value: string }>;
  };
  const bodyText = this.getNodeParameter('body', itemIndex, '') as string;
  const userPath = userUrl.replace(/^\/+/, '');
  const fullUrl = `${baseURL}/${userPath}`;
  const headers: Record<string, string> = {};
  const qs: Record<string, string> = {};

  for (const row of headersParam.parameter ?? []) {
    if (row.key) headers[row.key] = row.value;
  }
  for (const row of queryParam.parameter ?? []) {
    if (row.key) qs[row.key] = row.value;
  }

  const requestOptions: {
    method: IHttpRequestMethods;
    url: string;
    headers: Record<string, string>;
    qs: Record<string, string>;
    body?: string;
    returnFullResponse: boolean;
    json: boolean;
  } = {
    method,
    url: fullUrl,
    headers,
    qs,
    returnFullResponse: true,
    json: false,
  };

  if (bodyText && bodyText.length > 0) {
    requestOptions.body = bodyText;
  }

  const fullResponse = await this.helpers.httpRequestWithAuthentication.call(
    this,
    'deepKeepApi',
    requestOptions,
  );

  let parsedBody: unknown = (fullResponse as { body: unknown }).body;
  if (typeof parsedBody === 'string' && parsedBody.length > 0) {
    try {
      parsedBody = JSON.parse(parsedBody);
    } catch {
      // Not JSON - leave as string.
    }
  }

  returnData.push({
    json: {
      statusCode: (fullResponse as { statusCode: number }).statusCode,
      headers: (fullResponse as { headers: Record<string, string> }).headers,
      body: parsedBody as IDataObject | IDataObject[] | string,
    },
    pairedItem: { item: itemIndex },
  });
}

function legacyBaseUrl(credentials: IDataObject): string {
  const subDomain = String(credentials.subDomain ?? '').trim();
  if (subDomain) {
    return `https://api.${subDomain}.deepkeep.ai/api`;
  }

  const baseUrl = currentBaseUrl(credentials);
  return baseUrl ? `${baseUrl}/api` : '';
}

function currentBaseUrl(credentials: IDataObject): string {
  return String(credentials.baseUrl ?? '').trim().replace(/\/+$/, '');
}

function getStatusCode(error: unknown): number | undefined {
  return (
    (error as { httpCode?: number; response?: { status?: number } })
      ?.httpCode ??
    (error as { httpCode?: number; response?: { status?: number } })
      ?.response?.status
  );
}

function wrapDeepKeepError(
  this: IExecuteFunctions,
  error: unknown,
  itemIndex: number,
): Error {
  const statusCode = getStatusCode(error);

  if (statusCode === 429) {
    return new NodeOperationError(
      this.getNode(),
      'Too many requests. Check if the rate limit is exceeded, or if the firewall is warming up.',
      { itemIndex },
    );
  }

  if (error instanceof NodeApiError || error instanceof NodeOperationError) {
    return error;
  }

  return new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
}
