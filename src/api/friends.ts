import { appSyncGraphqlUrl, type AuthUser } from "../auth/cognito";

export type PublicUserProfile = {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
};

export type Friendship = {
  user: PublicUserProfile;
  status: "pending" | "accepted";
  createdAt: string;
  updatedAt: string;
};

export type FriendLists = {
  friends: Friendship[];
  incoming: Friendship[];
  outgoing: Friendship[];
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

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
  if (!response.ok) throw new Error(`Friend request failed with status ${response.status}.`);

  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) throw new Error(body.errors[0]?.message || "Friend request failed.");
  if (!body.data) throw new Error("Friend request did not return data.");
  return body.data;
}

const PUBLIC_USER_FIELDS = "id username firstName lastName";
const FRIENDSHIP_FIELDS = `
  status
  createdAt
  updatedAt
  user { ${PUBLIC_USER_FIELDS} }
`;

export async function fetchFriendLists(authUser: AuthUser): Promise<FriendLists> {
  const data = await graphQLRequest<{
    users: {
      friends: Friendship[];
      incomingFriendRequests: Friendship[];
      outgoingFriendRequests: Friendship[];
    };
  }>(authUser, `
    query FriendLists {
      users {
        friends { ${FRIENDSHIP_FIELDS} }
        incomingFriendRequests { ${FRIENDSHIP_FIELDS} }
        outgoingFriendRequests { ${FRIENDSHIP_FIELDS} }
      }
    }
  `);

  return {
    friends: data.users.friends,
    incoming: data.users.incomingFriendRequests,
    outgoing: data.users.outgoingFriendRequests,
  };
}

export async function findUsers(
  authUser: AuthUser,
  query: string,
): Promise<PublicUserProfile[]> {
  const data = await graphQLRequest<{ users: { findUsers: PublicUserProfile[] } }>(
    authUser,
    `query FindUsers($query: String!) {
      users { findUsers(query: $query) { ${PUBLIC_USER_FIELDS} } }
    }`,
    { query },
  );
  return data.users.findUsers;
}

async function friendshipMutation(
  authUser: AuthUser,
  field: "sendFriendRequest" | "acceptFriendRequest",
  userId: number,
): Promise<Friendship> {
  const data = await graphQLRequest<Record<string, Friendship>>(
    authUser,
    `mutation FriendshipAction($userId: Int!) {
      ${field}(userId: $userId) { ${FRIENDSHIP_FIELDS} }
    }`,
    { userId },
  );
  return data[field];
}

async function booleanMutation(
  authUser: AuthUser,
  field: "declineFriendRequest" | "cancelFriendRequest" | "removeFriend",
  userId: number,
): Promise<boolean> {
  const data = await graphQLRequest<Record<string, boolean>>(
    authUser,
    `mutation FriendshipAction($userId: Int!) { ${field}(userId: $userId) }`,
    { userId },
  );
  return data[field];
}

export const sendFriendRequest = (authUser: AuthUser, userId: number) =>
  friendshipMutation(authUser, "sendFriendRequest", userId);
export const acceptFriendRequest = (authUser: AuthUser, userId: number) =>
  friendshipMutation(authUser, "acceptFriendRequest", userId);
export const declineFriendRequest = (authUser: AuthUser, userId: number) =>
  booleanMutation(authUser, "declineFriendRequest", userId);
export const cancelFriendRequest = (authUser: AuthUser, userId: number) =>
  booleanMutation(authUser, "cancelFriendRequest", userId);
export const removeFriend = (authUser: AuthUser, userId: number) =>
  booleanMutation(authUser, "removeFriend", userId);
