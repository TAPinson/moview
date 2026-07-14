import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  type CognitoUserSession,
  type ISignUpResult,
} from "amazon-cognito-identity-js";

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

export const appSyncGraphqlUrl = import.meta.env.VITE_APPSYNC_GRAPHQL_URL;

export type AuthUser = {
  email: string;
  idToken: string;
  accessToken: string;
};

function requireAuthConfig() {
  if (!userPoolId || !clientId) {
    throw new Error(
      "Missing Cognito configuration. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID.",
    );
  }
}

function userPool() {
  requireAuthConfig();

  return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
}

function cognitoUser(email: string) {
  return new CognitoUser({
    Username: email.trim().toLowerCase(),
    Pool: userPool(),
  });
}

function authUserFromSession(email: string, session: CognitoUserSession): AuthUser {
  return {
    email,
    idToken: session.getIdToken().getJwtToken(),
    accessToken: session.getAccessToken().getJwtToken(),
  };
}

export function getCurrentAuthUser(): Promise<AuthUser | null> {
  requireAuthConfig();

  const currentUser = userPool().getCurrentUser();
  if (!currentUser) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    currentUser.getSession((error: Error | null, session: CognitoUserSession | null) => {
      if (error || !session?.isValid()) {
        currentUser.signOut();
        resolve(null);
        return;
      }

      resolve(authUserFromSession(currentUser.getUsername(), session));
    });
  });
}

export function signUp(email: string, password: string): Promise<ISignUpResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const attributes = [
    new CognitoUserAttribute({
      Name: "email",
      Value: normalizedEmail,
    }),
  ];

  return new Promise((resolve, reject) => {
    userPool().signUp(normalizedEmail, password, attributes, [], (error, result) => {
      if (error || !result) {
        reject(error ?? new Error("Sign up failed."));
        return;
      }

      resolve(result);
    });
  });
}

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cognitoUser(email).confirmRegistration(code.trim(), true, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cognitoUser(email).resendConfirmationCode((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export function signIn(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = cognitoUser(normalizedEmail);
  const authDetails = new AuthenticationDetails({
    Username: normalizedEmail,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(authUserFromSession(normalizedEmail, session)),
      onFailure: reject,
    });
  });
}

export function signOut() {
  const currentUser = userPool().getCurrentUser();
  currentUser?.signOut();
}
