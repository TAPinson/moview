import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import type { AuthUser } from "../../auth/cognito";
import {
  fetchWatchlist,
  markMovieWatched,
  removeMovieFromWatchlist,
  type MovieSearchResult,
  type WatchlistItem,
  type WatchlistStatus,
} from "../../api/movies";
import { MovieCard } from "../../components/MovieCard";

type MovieListProps = {
  authUser: AuthUser | null;
  emptyMessage: string;
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
  status,
  title,
}: MovieListProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [watchlistErrors, setWatchlistErrors] = useState<Record<number, string>>({});
  const [savingWatchlistActions, setSavingWatchlistActions] = useState<
    Record<number, "watched" | "remove">
  >({});
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
          setWatchlistErrors({});
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

  async function handleRemoveFromWatchlist(movie: MovieSearchResult) {
    if (!authUser || movie.id === null) {
      return;
    }

    const movieId = movie.id;
    setSavingWatchlistActions((currentActions) => ({
      ...currentActions,
      [movieId]: "remove",
    }));
    setWatchlistErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[movieId];
      return nextErrors;
    });

    try {
      await removeMovieFromWatchlist(authUser, movieId);
      setItems((currentItems) =>
        currentItems.filter((item) => item.movieId !== movieId),
      );
    } catch (caughtError) {
      setWatchlistErrors((currentErrors) => ({
        ...currentErrors,
        [movieId]: errorMessage(caughtError),
      }));
    } finally {
      setSavingWatchlistActions((currentActions) => {
        const nextActions = { ...currentActions };
        delete nextActions[movieId];
        return nextActions;
      });
    }
  }

  async function handleMarkWatched(movie: MovieSearchResult) {
    if (!authUser || movie.id === null || status !== "want_to_watch") {
      return;
    }

    const movieId = movie.id;
    setSavingWatchlistActions((currentActions) => ({
      ...currentActions,
      [movieId]: "watched",
    }));
    setWatchlistErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[movieId];
      return nextErrors;
    });

    try {
      await markMovieWatched(authUser, movieId);
      setItems((currentItems) =>
        currentItems.filter((item) => item.movieId !== movieId),
      );
    } catch (caughtError) {
      setWatchlistErrors((currentErrors) => ({
        ...currentErrors,
        [movieId]: errorMessage(caughtError),
      }));
    } finally {
      setSavingWatchlistActions((currentActions) => {
        const nextActions = { ...currentActions };
        delete nextActions[movieId];
        return nextActions;
      });
    }
  }

  return (
    <main className="page watchlist-page">
      <h1>{title}</h1>

      {isLoading && (
        <div className="movie-list-progress" role="status" aria-label="Loading movies">
          <CircularProgress size={32} />
        </div>
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
              onMarkWatched={
                status === "want_to_watch" ? handleMarkWatched : undefined
              }
              onRemoveFromWatchlist={handleRemoveFromWatchlist}
              watchlistError={watchlistErrors[item.movieId] ?? null}
              watchlistSavingAction={
                savingWatchlistActions[item.movieId] ?? null
              }
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
      status="watched"
      title="Watched"
    />
  );
}
