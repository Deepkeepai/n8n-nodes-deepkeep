import {
  IExecuteFunctions,
  INodeExecutionData,
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

/**
 * DeepKeep n8n community node.
 *
 * Uses the same OpenAI-compatible moderation endpoints as the LangChain
 * integration and keeps an arbitrary authorized API call escape hatch.
 */
export class DeepKeep implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'DeepKeep',
    name: 'deepKeep',
    icon: {
      light: 'file:deepkeep.svg',
      dark: 'file:deepkeep.svg',
    },
    group: ['transform'],
    version: 1,
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
            name: 'Moderation',
            value: 'moderation',
          },
        ],
        default: 'moderation',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: { resource: ['moderation'] },
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
        displayName: 'Model',
        name: 'model',
        type: 'string',
        required: true,
        default: '',
        description: 'DeepKeep firewall ID to send as the OpenAI-compatible model field',
        displayOptions: {
          show: {
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
        placeholder: '/api/v3/openai/moderations/pre',
        description:
          'Enter the path relative to the configured DeepKeep base URL. For example, <code>/api/v3/openai/moderations/pre</code>.',
        displayOptions: {
          show: {
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
            resource: ['moderation'],
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
            resource: ['moderation'],
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
            resource: ['moderation'],
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
            resource: ['moderation'],
            operation: ['makeApiCall'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('deepKeepApi');
    const baseURL = String(credentials.baseUrl).replace(/\/+$/, '');

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        if (resource === 'moderation' && operation === 'preModeration') {
          const model = this.getNodeParameter('model', i) as string;
          const input = this.getNodeParameter('input', i) as string;
          const title = this.getNodeParameter('title', i, '') as string;
          const chat = this.getNodeParameter('chat', i, '') as string;

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
            pairedItem: { item: i },
          });
        } else if (resource === 'moderation' && operation === 'postModeration') {
          const model = this.getNodeParameter('model', i) as string;
          const output = this.getNodeParameter('output', i) as string;
          const title = this.getNodeParameter('title', i, '') as string;
          const chat = this.getNodeParameter('chat', i, '') as string;

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
            pairedItem: { item: i },
          });
        } else if (resource === 'moderation' && operation === 'makeApiCall') {
          const userUrl = this.getNodeParameter('url', i) as string;
          const method = this.getNodeParameter(
            'method',
            i,
          ) as IHttpRequestMethods;
          const headersParam = this.getNodeParameter('headers', i, {}) as {
            parameter?: Array<{ key: string; value: string }>;
          };
          const queryParam = this.getNodeParameter(
            'queryParameters',
            i,
            {},
          ) as {
            parameter?: Array<{ key: string; value: string }>;
          };
          const bodyText = this.getNodeParameter('body', i, '') as string;

          const userPath = userUrl.replace(/^\/+/, '');
          const fullUrl = `${baseURL}/${userPath}`;

          const headers: Record<string, string> = {};
          for (const row of headersParam.parameter ?? []) {
            if (row.key) headers[row.key] = row.value;
          }
          const qs: Record<string, string> = {};
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

          const fullResponse =
            await this.helpers.httpRequestWithAuthentication.call(
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
              headers: (fullResponse as {
                headers: Record<string, string>;
              }).headers,
              body: parsedBody as IDataObject | IDataObject[] | string,
            },
            pairedItem: { item: i },
          });
        } else {
          throw new NodeOperationError(
            this.getNode(),
            `Unsupported combination: resource="${resource}", operation="${operation}"`,
            { itemIndex: i },
          );
        }
      } catch (error) {
        const statusCode =
          (error as { httpCode?: number; response?: { status?: number } })
            ?.httpCode ??
          (error as { httpCode?: number; response?: { status?: number } })
            ?.response?.status;

        let wrappedError;
        if (statusCode === 429) {
          wrappedError = new NodeOperationError(
            this.getNode(),
            'Too many requests. Check if the rate limit is exceeded, or if the firewall is warming up.',
            { itemIndex: i },
          );
        } else if (
          error instanceof NodeApiError ||
          error instanceof NodeOperationError
        ) {
          wrappedError = error;
        } else {
          wrappedError = new NodeApiError(this.getNode(), error as JsonObject, {
            itemIndex: i,
          });
        }

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
