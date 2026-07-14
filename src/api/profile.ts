import { appSyncGraphqlUrl, type AuthUser } from "../auth/cognito";

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  admin: boolean;
  firstName: string | null;
  lastName: string | null;
};

export type UpdateUserProfileInput = {
  username: string;
  firstName: string | null;
  lastName: string | null;
};

const PROFILE_STORAGE_KEY = "moview:userProfile";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

export function loadStoredUserProfile(): UserProfile | null {
  const rawProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!rawProfile) {
    return null;
  }

  try {
    return JSON.parse(rawProfile) as UserProfile;
  } catch {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearStoredUserProfile() {
  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
}

async function graphQLRequest<T>(
  authUser: AuthUser,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!appSyncGraphqlUrl) {
    throw new Error("Missing AppSync configuration. Set VITE_APPSYNC_GRAPHQL_URL.");
  }

  const response = await fetch(appSyncGraphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: authUser.idToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Profile request failed with status ${response.status}.`);
  }

  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(body.errors[0]?.message || "Profile request failed.");
  }

  if (!body.data) {
    throw new Error("Profile request did not return data.");
  }

  return body.data;
}

const USER_PROFILE_FIELDS = `
  id
  username
  email
  admin
  firstName
  lastName
`;

export async function fetchCurrentUserProfile(
  authUser: AuthUser,
): Promise<UserProfile> {
  const data = await graphQLRequest<{ users: { profile: UserProfile } }>(
    authUser,
    `
      query Profile {
        users {
          profile {
            ${USER_PROFILE_FIELDS}
          }
        }
      }
    `,
  );

  saveUserProfile(data.users.profile);
  return data.users.profile;
}

export async function updateUserProfile(
  authUser: AuthUser,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  const data = await graphQLRequest<{ updateUser: UserProfile }>(
    authUser,
    `
      mutation UpdateUser($input: UpdateUserProfileInput!) {
        updateUser(input: $input) {
          ${USER_PROFILE_FIELDS}
        }
      }
    `,
    { input },
  );

  saveUserProfile(data.updateUser);
  return data.updateUser;
}
