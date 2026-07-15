import { useState } from "react";
import type { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { AuthUser } from "../../auth/cognito";
import {
  addMovieLike,
  searchMovies,
  type MovieSearchResult,
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

function fieldValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function MovieResultCard({
  isLiked,
  isSavingLike,
  likeError,
  movie,
  onLike,
}: {
  isLiked: boolean;
  isSavingLike: boolean;
  likeError: string | null;
  movie: MovieSearchResult;
  onLike: (movie: MovieSearchResult) => void;
}) {
  return (
    <Card className="movie-result-card" variant="outlined">
      <CardContent>
        <div className="movie-result-header">
          <Typography className="movie-result-title" component="h2" variant="h6">
            {movie.title || movie.original_title || "Untitled"}
          </Typography>
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
        {likeError && (
          <Alert severity="error" className="movie-like-alert">
            {likeError}
          </Alert>
        )}
        <dl className="movie-detail-list">
          <div>
            <dt>ID</dt>
            <dd>{fieldValue(movie.id)}</dd>
          </div>
          <div>
            <dt>Original title</dt>
            <dd>{fieldValue(movie.original_title)}</dd>
          </div>
          <div>
            <dt>Original language</dt>
            <dd>{fieldValue(movie.original_language)}</dd>
          </div>
          <div>
            <dt>Release date</dt>
            <dd>{fieldValue(movie.release_date)}</dd>
          </div>
          <div>
            <dt>Adult</dt>
            <dd>{fieldValue(movie.adult)}</dd>
          </div>
          <div>
            <dt>Video</dt>
            <dd>{fieldValue(movie.video)}</dd>
          </div>
          <div>
            <dt>Vote average</dt>
            <dd>{fieldValue(movie.vote_average)}</dd>
          </div>
          <div>
            <dt>Vote count</dt>
            <dd>{fieldValue(movie.vote_count)}</dd>
          </div>
          <div>
            <dt>Popularity</dt>
            <dd>{fieldValue(movie.popularity)}</dd>
          </div>
          <div>
            <dt>Genre IDs</dt>
            <dd>{movie.genre_ids.length ? movie.genre_ids.join(", ") : "-"}</dd>
          </div>
          <div>
            <dt>Poster path</dt>
            <dd>{fieldValue(movie.poster_path)}</dd>
          </div>
          <div>
            <dt>Backdrop path</dt>
            <dd>{fieldValue(movie.backdrop_path)}</dd>
          </div>
          <div className="movie-detail-full">
            <dt>Overview</dt>
            <dd>{fieldValue(movie.overview)}</dd>
          </div>
        </dl>
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
              onLike={handleLike}
            />
          );
        })}
      </section>
    </main>
  );
}
