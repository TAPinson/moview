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
  movie?: MovieSearchResult | null;
};

export type WatchlistStatus = "want_to_watch" | "watching" | "watched";

export type WatchlistEntry = {
  userId: number;
  movieId: number;
  status: WatchlistStatus;
};

export type WatchlistItem = WatchlistEntry & {
  addedAt: string;
  watchedAt: string | null;
  notes: string | null;
  movie?: MovieSearchResult | null;
};

export type MovieInvitationInput = {
  friendUserId: number;
  movieId: number;
  startsAt: string;
  timezone: string;
  durationMinutes: number;
  location: string | null;
  message: string | null;
  idempotencyKey: string;
};

export type MovieInvitation = {
  id: number;
  createdByUserId: number;
  friendUserId: number;
  movieId: number;
  startsAt: string;
  endsAt: string;
  timezone: string;
  eventSummary: string;
  location: string | null;
  message: string | null;
  calendarSequence: number;
  status: "pending" | "sending" | "sent" | "failed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  cancelledAt: string | null;
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

export type MovieResultPage = {
  page: number;
  totalPages: number;
  results: MovieSearchResult[];
};

export async function fetchMoviesByGenre(
  authUser: AuthUser,
  genreId: number | null,
  page: number,
  includeAdult = false,
  personId: number | null = null,
  certification: string | null = null,
): Promise<MovieResultPage> {
  const data = await graphQLRequest<{ movies: { byGenre: MovieResultPage } }>(
    authUser,
    `
      query MoviesByGenre($genreId: Int, $page: Int!, $includeAdult: Boolean!, $personId: Int, $certification: String) {
        movies {
          byGenre(genreId: $genreId, page: $page, includeAdult: $includeAdult, personId: $personId, certification: $certification) {
            page
            totalPages
            results {
              poster_path adult overview release_date genre_ids id original_title
              original_language title backdrop_path popularity vote_count video vote_average
            }
          }
        }
      }
    `,
    { genreId, page, includeAdult, personId, certification },
  );

  return data.movies.byGenre;
}

export type MoviePerson = {
  id: number;
  name: string;
  department: string | null;
};

export async function searchMoviePeople(
  authUser: AuthUser,
  query: string,
  includeAdult: boolean,
): Promise<MoviePerson[]> {
  const data = await graphQLRequest<{ movies: { people: MoviePerson[] } }>(
    authUser,
    `query MoviePeople($query: String!, $includeAdult: Boolean!) {
      movies {
        people(query: $query, includeAdult: $includeAdult) {
          id name department
        }
      }
    }`,
    { query, includeAdult },
  );
  return data.movies.people;
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

export async function removeMovieLike(
  authUser: AuthUser,
  movieId: number,
): Promise<boolean> {
  const data = await graphQLRequest<{ removeLike: boolean }>(
    authUser,
    `
      mutation RemoveLike($movieId: Int!) {
        removeLike(movieId: $movieId)
      }
    `,
    { movieId },
  );

  return data.removeLike;
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

export async function removeMovieFromWatchlist(
  authUser: AuthUser,
  movieId: number,
): Promise<boolean> {
  const data = await graphQLRequest<{ removeFromWatchlist: boolean }>(
    authUser,
    `
      mutation RemoveFromWatchlist($movieId: Int!) {
        removeFromWatchlist(movieId: $movieId)
      }
    `,
    { movieId },
  );

  return data.removeFromWatchlist;
}

export async function fetchLikedMovies(authUser: AuthUser): Promise<MovieLike[]> {
  const data = await graphQLRequest<{
    users: { likes: MovieLike[] };
  }>(
    authUser,
    `
      query Likes {
        users {
          likes {
            userId
            movieId
            createdAt
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
  );

  return data.users.likes;
}

export async function fetchWatchlistEntries(
  authUser: AuthUser,
): Promise<WatchlistEntry[]> {
  const data = await graphQLRequest<{
    users: { watchlistEntries: WatchlistEntry[] };
  }>(
    authUser,
    `
      query WatchlistEntries {
        users {
          watchlistEntries {
            userId
            movieId
            status
          }
        }
      }
    `,
  );

  return data.users.watchlistEntries;
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

export async function fetchSharedWatchlist(
  authUser: AuthUser,
  friendUserId: number,
): Promise<WatchlistItem[]> {
  const data = await graphQLRequest<{
    users: { sharedWatchlist: WatchlistItem[] };
  }>(
    authUser,
    `
      query SharedWatchlist($friendUserId: Int!) {
        users {
          sharedWatchlist(friendUserId: $friendUserId) {
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
    { friendUserId },
  );

  return data.users.sharedWatchlist;
}

export async function sendMovieInvitation(
  authUser: AuthUser,
  input: MovieInvitationInput,
): Promise<MovieInvitation> {
  const data = await graphQLRequest<{
    sendMovieInvitation: MovieInvitation;
  }>(
    authUser,
    `
      mutation SendMovieInvitation($input: MovieInvitationInput!) {
        sendMovieInvitation(input: $input) {
          id
          createdByUserId
          friendUserId
          movieId
          startsAt
          endsAt
          timezone
          eventSummary
          location
          message
          calendarSequence
          status
          createdAt
          updatedAt
          sentAt
          cancelledAt
        }
      }
    `,
    { input },
  );

  return data.sendMovieInvitation;
}
