import { registerAs } from '@nestjs/config';

function parseDeploymentIds(raw: string | undefined): string[] {
  if (!raw || raw.trim().length === 0) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      'LTI_V1P3_DEPLOYMENT_IDS must be a valid JSON array of strings, e.g. ["59:7c9c..."]',
    );
  }

  if (
    !Array.isArray(parsed) ||
    !parsed.every((id): id is string => typeof id === 'string')
  ) {
    throw new Error('LTI_V1P3_DEPLOYMENT_IDS must be a JSON array of strings');
  }

  return parsed.map((id) => id.trim()).filter((id) => id.length > 0);
}

export const AuthConfig = registerAs('auth', () => ({
  ltiv1p3: {
    clientId: process.env.LTI_V1P3_CLIENT_ID,
    deploymentIds: parseDeploymentIds(process.env.LTI_V1P3_DEPLOYMENT_IDS),
    oidcAuthUrl: process.env.LTI_V1P3_OIDC_AUTH_URL,
    jwksUrl: process.env.LTI_V1P3_JWKS_URL,
    issuer: process.env.LTI_V1P3_ISSUER,
    secret: process.env.LTI_V1P3_SECRET,
  },
  oauth2: {
    clientId: process.env.CANVAS_OAUTH2_CLIENT_ID,
    clientSecret: process.env.CANVAS_OAUTH2_CLIENT_SECRET,
  },
}));
