export const environment = {
  production: false,
  apiBaseUrl: 'https://api.dev.hrpolicyassistant.internal',

  // AWS Cognito (Amplify) — fill in with real values from the User Pool.
  // While userPoolId is left as a placeholder, AuthService falls back to an
  // in-memory mock auth provider so the UI can be built/demoed without live infra.
  cognito: {
    region: 'us-east-1',
    userPoolId: '',
    userPoolClientId: '',
  },
};
