import { appSyncGraphqlUrl, type AuthUser } from "../auth/cognito";

export type MovieSearchResult = {
  poster_path: string | null;
  adult: boolean | null;
  overview: string | null;
  release_date: string | null;
  genre_ids: number[];
  id: number | null;
  original_title: string | null;
  original_language: string | null;
  title: string | null;
  backdrop_path: string | null;
  popularity: number | null;
  vote_count: number | null;
  video: boolean | null;
  vote_average: number | null;
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

  if (!response.ok) {
    throw new Error(`Movie search failed with status ${response.status}.`);
  }

  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(body.errors[0]?.message || "Movie search failed.");
  }

  if (!body.data) {
    throw new Error("Movie search did not return data.");
  }

  return body.data;
}

export async function searchMovies(
  authUser: AuthUser,
  searchText: string,
): Promise<MovieSearchResult[]> {
  const data = await graphQLRequest<{
    movies: { search: MovieSearchResult[] };
  }>(
    authUser,
    `
      query MovieSearch($query: String!) {
        movies {
          search(query: $query) {
            poster_path
            adult
            overview
            release_date
            genre_ids
            id
            original_title
            original_language
            title
            backdrop_path
            popularity
            vote_count
            video
            vote_average
          }
        }
      }
    `,
    { query: searchText },
  );

  return data.movies.search;
}
