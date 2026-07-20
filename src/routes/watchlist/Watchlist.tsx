import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import type { AuthUser } from "../../auth/cognito";
import { fetchWatchlist, type WatchlistItem, type WatchlistStatus } from "../../api/movies";
import { MovieCard } from "../../components/MovieCard";

type MovieListProps = {
  authUser: AuthUser | null;
  emptyMessage: string;
  loadingMessage: string;
  status: WatchlistStatus;
  title: string;
};

type WatchlistProps = {
  authUser: AuthUser | null;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Movie list failed to load.";
}

function MovieList({
  authUser,
  emptyMessage,
  loadingMessage,
  status,
  title,
}: MovieListProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(authUser !== null);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    let isMounted = true;
    fetchWatchlist(authUser, status)
      .then((watchlistItems) => {
        if (isMounted) {
          setItems(watchlistItems);
        }
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(errorMessage(caughtError));
          setItems([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authUser, status]);

  return (
    <main className="page watchlist-page">
      <p className="eyebrow">Movies</p>
      <h1>{title}</h1>

      {isLoading && (
        <Alert severity="info" className="movie-search-alert">
          {loadingMessage}
        </Alert>
      )}
      {error && <Alert severity="error" className="movie-search-alert">{error}</Alert>}
      {!isLoading && !error && items.length === 0 && (
        <Alert severity="info" className="movie-search-alert">
          {emptyMessage}
        </Alert>
      )}

      <section className="movie-results" aria-label={`${title} movies`}>
        {items.map((item) =>
          item.movie ? (
            <MovieCard
              key={`${item.movieId}-${item.status}`}
              movie={item.movie}
              watchlistStatus={item.status}
            />
          ) : null,
        )}
      </section>
    </main>
  );
}

export function Watchlist({ authUser }: WatchlistProps) {
  return (
    <MovieList
      authUser={authUser}
      emptyMessage="Your watchlist is empty."
      loadingMessage="Loading watchlist."
      status="want_to_watch"
      title="Watchlist"
    />
  );
}

export function Watched({ authUser }: WatchlistProps) {
  return (
    <MovieList
      authUser={authUser}
      emptyMessage="You have not marked any movies watched yet."
      loadingMessage="Loading watched movies."
      status="watched"
      title="Watched"
    />
  );
}
