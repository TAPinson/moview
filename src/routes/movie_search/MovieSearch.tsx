import { useState } from "react";
import type { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import type { AuthUser } from "../../auth/cognito";
import { MovieCard } from "../../components/MovieCard";
import {
  addMovieLike,
  addMovieToWatchlist,
  markMovieWatched,
  searchMovies,
  type MovieSearchResult,
  type WatchlistStatus,
} from "../../api/movies";

type MovieSearchProps = {
  authUser: AuthUser | null;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Movie search failed.";
}

export function MovieSearch({ authUser }: MovieSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedMovieIds, setLikedMovieIds] = useState<Set<number>>(() => new Set());
  const [savingLikeMovieId, setSavingLikeMovieId] = useState<number | null>(null);
  const [likeErrors, setLikeErrors] = useState<Record<number, string>>({});
  const [watchlistStatuses, setWatchlistStatuses] = useState<Record<number, WatchlistStatus>>({});
  const [savingWatchlistActions, setSavingWatchlistActions] = useState<
    Record<number, "want_to_watch" | "watched">
  >({});
  const [watchlistErrors, setWatchlistErrors] = useState<Record<number, string>>({});
  const [isSearching, setIsSearching] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authUser || !query.trim()) {
      return;
    }

    setError(null);
    setIsSearching(true);

    try {
      const movies = await searchMovies(authUser, query.trim());
      setResults(movies);
      setLikeErrors({});
      setWatchlistErrors({});
      setHasSearched(true);
    } catch (caughtError) {
      setError(errorMessage(caughtError));
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleLike(movie: MovieSearchResult) {
    if (!authUser || movie.id === null) {
      return;
    }

    setSavingLikeMovieId(movie.id);
    setLikeErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[movie.id as number];
      return nextErrors;
    });

    try {
      await addMovieLike(authUser, movie.id);
      setLikedMovieIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.add(movie.id as number);
        return nextIds;
      });
    } catch (caughtError) {
      setLikeErrors((currentErrors) => ({
        ...currentErrors,
        [movie.id as number]: errorMessage(caughtError),
      }));
    } finally {
      setSavingLikeMovieId(null);
    }
  }

  async function handleAddToWatchlist(movie: MovieSearchResult) {
    await saveWatchlistStatus(movie, "want_to_watch");
  }

  async function handleMarkWatched(movie: MovieSearchResult) {
    await saveWatchlistStatus(movie, "watched");
  }

  async function saveWatchlistStatus(
    movie: MovieSearchResult,
    status: "want_to_watch" | "watched",
  ) {
    if (!authUser || movie.id === null) {
      return;
    }

    const movieId = movie.id;
    setSavingWatchlistActions((currentActions) => ({
      ...currentActions,
      [movieId]: status,
    }));
    setWatchlistErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[movieId];
      return nextErrors;
    });

    try {
      const item =
        status === "watched"
          ? await markMovieWatched(authUser, movieId)
          : await addMovieToWatchlist(authUser, movieId);
      setWatchlistStatuses((currentStatuses) => ({
        ...currentStatuses,
        [item.movieId]: item.status,
      }));
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
    <main className="page movie-search-page">
      <p className="eyebrow">Movies</p>
      <h1>Movie Search</h1>
      <form className="movie-search-form" onSubmit={handleSubmit}>
        <TextField
          label="Search movies"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && <Alert severity="error" className="movie-search-alert">{error}</Alert>}
      {hasSearched && !error && results.length === 0 && (
        <Alert severity="info" className="movie-search-alert">
          No results found.
        </Alert>
      )}

      <section className="movie-results" aria-label="Movie search results">
        {results.map((movie, index) => {
          const movieKey = movie.id ?? `${movie.title}-${index}`;
          return (
            <MovieCard
              key={movieKey}
              isLiked={movie.id !== null && likedMovieIds.has(movie.id)}
              isSavingLike={movie.id !== null && savingLikeMovieId === movie.id}
              likeError={movie.id !== null ? likeErrors[movie.id] : null}
              movie={movie}
              onAddToWatchlist={handleAddToWatchlist}
              onLike={handleLike}
              onMarkWatched={handleMarkWatched}
              watchlistError={movie.id !== null ? watchlistErrors[movie.id] : null}
              watchlistSavingAction={
                movie.id !== null ? savingWatchlistActions[movie.id] ?? null : null
              }
              watchlistStatus={
                movie.id !== null ? watchlistStatuses[movie.id] ?? null : null
              }
            />
          );
        })}
      </section>
    </main>
  );
}
