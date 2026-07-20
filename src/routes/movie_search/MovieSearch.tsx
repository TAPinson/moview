import { useState } from "react";
import type { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import movieGenres from "../../data/movieGenres.json";
import movieLanguages from "../../data/movieLanguages.json";
import type { AuthUser } from "../../auth/cognito";
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

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

function moviePosterUrl(posterPath: string | null) {
  return posterPath ? `${TMDB_POSTER_BASE_URL}${posterPath}` : null;
}

const MOVIE_GENRE_NAMES = new Map(
  movieGenres.genres.map((genre) => [genre.id, genre.name]),
);

function genreNamesValue(genreIds: number[]) {
  if (!genreIds.length) {
    return "-";
  }

  return genreIds
    .map((genreId) => MOVIE_GENRE_NAMES.get(genreId) ?? String(genreId))
    .join(", ");
}

const MOVIE_LANGUAGE_NAMES = new Map(
  movieLanguages.map((language) => [
    language.iso_639_1,
    language.english_name || language.iso_639_1,
  ]),
);

function languageNameValue(languageCode: string | null | undefined) {
  if (!languageCode) {
    return "-";
  }

  return MOVIE_LANGUAGE_NAMES.get(languageCode) ?? languageCode;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Movie search failed.";
}

function fieldValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function releaseDateValue(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return value;
  }

  return `${match[2]}/${match[3]}/${match[1]}`;
}

function MovieResultCard({
  isLiked,
  isSavingLike,
  likeError,
  movie,
  onAddToWatchlist,
  onLike,
  onMarkWatched,
  watchlistError,
  watchlistStatus,
  watchlistSavingAction,
}: {
  isLiked: boolean;
  isSavingLike: boolean;
  likeError: string | null;
  movie: MovieSearchResult;
  onAddToWatchlist: (movie: MovieSearchResult) => void;
  onLike: (movie: MovieSearchResult) => void;
  onMarkWatched: (movie: MovieSearchResult) => void;
  watchlistError: string | null;
  watchlistStatus: WatchlistStatus | null;
  watchlistSavingAction: "want_to_watch" | "watched" | null;
}) {
  const isInWatchlist =
    watchlistStatus === "want_to_watch" || watchlistStatus === "watched";
  const isWatched = watchlistStatus === "watched";
  const posterUrl = moviePosterUrl(movie.poster_path);
  const title = movie.title || movie.original_title || "Untitled";

  return (
    <Card className="movie-result-card" variant="outlined">
      <CardContent>
        <div className="movie-result-header">
          <Typography className="movie-result-title" component="h2" variant="h6">
            {title}
          </Typography>
          <div className="movie-result-actions">
            <Button
              type="button"
              variant={isInWatchlist ? "outlined" : "contained"}
              size="small"
              disabled={watchlistSavingAction !== null || isInWatchlist || movie.id === null}
              onClick={() => onAddToWatchlist(movie)}
            >
              {watchlistSavingAction === "want_to_watch"
                ? "Saving..."
                : isInWatchlist
                  ? "In watchlist"
                  : "Add to watchlist"}
            </Button>
            <Button
              type="button"
              variant={isWatched ? "outlined" : "contained"}
              size="small"
              disabled={watchlistSavingAction !== null || isWatched || movie.id === null}
              onClick={() => onMarkWatched(movie)}
            >
              {watchlistSavingAction === "watched" ? "Saving..." : "Watched"}
            </Button>
            <Button
              type="button"
              variant={isLiked ? "outlined" : "contained"}
              size="small"
              disabled={isSavingLike || isLiked || movie.id === null}
              onClick={() => onLike(movie)}
            >
              {isSavingLike ? "Saving..." : isLiked ? "Liked" : "Like"}
            </Button>
          </div>
        </div>
        {(likeError || watchlistError) && (
          <Alert severity="error" className="movie-like-alert">
            {watchlistError || likeError}
          </Alert>
        )}
        <div className="movie-result-body">
          {posterUrl ? (
            <img className="movie-poster" src={posterUrl} alt={`${title} poster`} />
          ) : (
            <div className="movie-poster-placeholder" aria-label="No poster available">
              No poster
            </div>
          )}
          <dl className="movie-detail-list">
            <div>
              <dt>Language</dt>
              <dd>{languageNameValue(movie.original_language)}</dd>
            </div>
            <div>
              <dt>Release date</dt>
              <dd>{releaseDateValue(movie.release_date)}</dd>
            </div>
            <div>
              <dt>Vote average</dt>
              <dd>
                {fieldValue(movie.vote_average)}
                {movie.vote_count !== null && movie.vote_count !== undefined && (
                  <span className="movie-vote-count">({movie.vote_count})</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Genres</dt>
              <dd>{genreNamesValue(movie.genre_ids)}</dd>
            </div>
            <div className="movie-detail-full">
              <dt>Overview</dt>
              <dd>{fieldValue(movie.overview)}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
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
            <MovieResultCard
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
