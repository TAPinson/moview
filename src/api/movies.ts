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

export type MovieLike = {
  userId: number;
  movieId: number;
  createdAt: string;
};

export type WatchlistStatus = "want_to_watch" | "watching" | "watched";

export type WatchlistItem = {
  userId: number;
  movieId: number;
  status: WatchlistStatus;
  addedAt: string;
  watchedAt: string | null;
  notes: string | null;
  movie?: MovieSearchResult | null;
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
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const body = (await response.json()) as GraphQLResponse<T>;
  if (body.errors?.length) {
    throw new Error(body.errors[0]?.message || "Request failed.");
  }

  if (!body.data) {
    throw new Error("Request did not return data.");
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

export async function addMovieLike(
  authUser: AuthUser,
  movieId: number,
): Promise<MovieLike> {
  const data = await graphQLRequest<{ addLike: MovieLike }>(
    authUser,
    `
      mutation AddLike($movieId: Int!) {
        addLike(movieId: $movieId) {
          userId
          movieId
          createdAt
        }
      }
    `,
    { movieId },
  );

  return data.addLike;
}

export async function addMovieToWatchlist(
  authUser: AuthUser,
  movieId: number,
): Promise<WatchlistItem> {
  const data = await graphQLRequest<{ addToWatchlist: WatchlistItem }>(
    authUser,
    `
      mutation AddToWatchlist($movieId: Int!) {
        addToWatchlist(movieId: $movieId) {
          userId
          movieId
          status
          addedAt
          watchedAt
          notes
        }
      }
    `,
    { movieId },
  );

  return data.addToWatchlist;
}

export async function markMovieWatched(
  authUser: AuthUser,
  movieId: number,
): Promise<WatchlistItem> {
  const data = await graphQLRequest<{ markWatched: WatchlistItem }>(
    authUser,
    `
      mutation MarkWatched($movieId: Int!) {
        markWatched(movieId: $movieId) {
          userId
          movieId
          status
          addedAt
          watchedAt
          notes
        }
      }
    `,
    { movieId },
  );

  return data.markWatched;
}


export async function fetchWatchlist(
  authUser: AuthUser,
  status?: WatchlistStatus,
): Promise<WatchlistItem[]> {
  const data = await graphQLRequest<{
    users: { watchlist: WatchlistItem[] };
  }>(
    authUser,
    `
      query Watchlist($status: WatchlistStatus) {
        users {
          watchlist(status: $status) {
            userId
            movieId
            status
            addedAt
            watchedAt
            notes
            movie {
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
      }
    `,
    { status },
  );

  return data.users.watchlist;
}
