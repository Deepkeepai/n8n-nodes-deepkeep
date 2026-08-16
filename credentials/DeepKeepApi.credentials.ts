import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * DeepKeep API credentials.
 *
 * Mirrors the current OpenAI-compatible DeepKeep API integrations:
 *  - Two fields: baseUrl (plain text) + apiKey (secret).
 *  - Auth header: X-API-Key: <apiKey> on every request.
 *  - Connection test: GET <baseUrl>/health.
 */
export class DeepKeepApi implements ICredentialType {
  name = 'deepKeepApi';
  displayName = 'DeepKeep API';
  documentationUrl = 'https://deepkeep.ai/docs/api';
  icon = {
    light: 'file:../nodes/DeepKeep/deepkeep-light.svg',
    dark: 'file:../nodes/DeepKeep/deepkeep-dark.svg',
  } as const;

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: '',
      required: true,
      placeholder: 'https://api.deepkeep.example',
      description:
        'Enter the base URL of your DeepKeep instance, without a trailing slash',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Enter the API Key provided by DeepKeep',
    },
  ];

  /**
   * Injects X-API-Key into every outgoing request automatically.
   */
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
        'Content-Type': 'application/json',
      },
    },
  };

  /**
   * Powers the "Connect" / "Test" button in the credentials dialog.
   * Success = 2xx response; n8n surfaces any non-2xx status as an error.
   */
  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/health',
      method: 'GET',
    },
  };
}
