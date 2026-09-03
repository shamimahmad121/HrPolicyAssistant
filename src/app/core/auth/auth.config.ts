import { Amplify } from 'aws-amplify';
import { environment } from '../../../environments/environment';

/** True once a real Cognito User Pool has been configured in environment.ts. */
export const isCognitoConfigured = !!environment.cognito.userPoolId && !!environment.cognito.userPoolClientId;

export function configureAmplify(): void {
  if (!isCognitoConfigured) {
    return;
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: environment.cognito.userPoolId,
        userPoolClientId: environment.cognito.userPoolClientId,
      },
    },
  });
}
