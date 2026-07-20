import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import movieGenres from "../data/movieGenres.json";
import movieLanguages from "../data/movieLanguages.json";
import type { MovieSearchResult, WatchlistStatus } from "../api/movies";

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w342";

type MovieCardProps = {
  isLiked?: boolean;
  isSavingLike?: boolean;
  likeError?: string | null;
  movie: MovieSearchResult;
  onAddToWatchlist?: (movie: MovieSearchResult) => void;
  onLike?: (movie: MovieSearchResult) => void;
  onMarkWatched?: (movie: MovieSearchResult) => void;
  watchlistError?: string | null;
  watchlistStatus?: WatchlistStatus | null;
  watchlistSavingAction?: "want_to_watch" | "watched" | null;
};

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

function watchlistStatusLabel(status: WatchlistStatus | null | undefined) {
  if (status === "want_to_watch") {
    return "Want to watch";
  }

  if (status === "watched") {
    return "Watched";
  }

  if (status === "watching") {
    return "Watching";
  }

  return null;
}

export function MovieCard({
  isLiked = false,
  isSavingLike = false,
  likeError = null,
  movie,
  onAddToWatchlist,
  onLike,
  onMarkWatched,
  watchlistError = null,
  watchlistStatus = null,
  watchlistSavingAction = null,
}: MovieCardProps) {
  const isInWatchlist =
    watchlistStatus === "want_to_watch" || watchlistStatus === "watched";
  const isWatched = watchlistStatus === "watched";
  const canAddToWatchlist = Boolean(
    onAddToWatchlist && !isInWatchlist && movie.id !== null,
  );
  const canMarkWatched = Boolean(onMarkWatched && !isWatched && movie.id !== null);
  const canLike = Boolean(onLike && !isLiked && movie.id !== null);
  const posterUrl = moviePosterUrl(movie.poster_path);
  const statusLabel = watchlistStatusLabel(watchlistStatus);
  const title = movie.title || movie.original_title || "Untitled";
  const hasActions =
    canAddToWatchlist ||
    canMarkWatched ||
    canLike ||
    watchlistSavingAction !== null ||
    isSavingLike;

  return (
    <Card className="movie-result-card" variant="outlined">
      <CardContent>
        <div className="movie-result-header">
          <div>
            <Typography className="movie-result-title" component="h2" variant="h6">
              {title}
            </Typography>
            {statusLabel && <p className="movie-watchlist-status">{statusLabel}</p>}
          </div>
          {hasActions && (
            <div className="movie-result-actions">
              {onAddToWatchlist &&
                (canAddToWatchlist || watchlistSavingAction === "want_to_watch") && (
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={watchlistSavingAction !== null}
                    onClick={() => onAddToWatchlist(movie)}
                  >
                    {watchlistSavingAction === "want_to_watch"
                      ? "Saving..."
                      : "Add to watchlist"}
                  </Button>
                )}
              {onMarkWatched &&
                (canMarkWatched || watchlistSavingAction === "watched") && (
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={watchlistSavingAction !== null}
                    onClick={() => onMarkWatched(movie)}
                  >
                    {watchlistSavingAction === "watched" ? "Saving..." : "Watched"}
                  </Button>
                )}
              {onLike && (canLike || isSavingLike) && (
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  disabled={isSavingLike}
                  onClick={() => onLike(movie)}
                >
                  {isSavingLike ? "Saving..." : "Like"}
                </Button>
              )}
            </div>
          )}
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
