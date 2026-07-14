import { appSyncGraphqlUrl, type AuthUser } from "../auth/cognito";

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  admin: boolean;
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

export async function fetchCurrentUserProfile(
  authUser: AuthUser,
): Promise<UserProfile> {
  if (!appSyncGraphqlUrl) {
    throw new Error("Missing AppSync configuration. Set VITE_APPSYNC_GRAPHQL_URL.");
  }

  const response = await fetch(appSyncGraphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: authUser.idToken,
    },
    body: JSON.stringify({
      query: `
        query Me {
          me {
            id
            username
            email
            admin
            firstName
            lastName
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Profile request failed with status ${response.status}.`);
  }

  const body = (await response.json()) as GraphQLResponse<{ me: UserProfile }>;
  if (body.errors?.length) {
    throw new Error(body.errors[0]?.message || "Profile request failed.");
  }

  if (!body.data?.me) {
    throw new Error("Profile request did not return a user profile.");
  }

  saveUserProfile(body.data.me);
  return body.data.me;
}
