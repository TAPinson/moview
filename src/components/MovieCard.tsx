import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatListBulletedAddIcon from "@mui/icons-material/FormatListBulletedAdd";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
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
  onRemoveFromWatchlist?: (movie: MovieSearchResult) => void;
  onRemoveLike?: (movie: MovieSearchResult) => void;
  watchlistError?: string | null;
  watchlistStatus?: WatchlistStatus | null;
  watchlistSavingAction?: "want_to_watch" | "watched" | "remove" | null;
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
  onRemoveFromWatchlist,
  onRemoveLike,
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
  const canRemoveFromWatchlist = Boolean(
    onRemoveFromWatchlist && isInWatchlist && movie.id !== null,
  );
  const canLike = Boolean(onLike && !isLiked && movie.id !== null);
  const canRemoveLike = Boolean(onRemoveLike && isLiked && movie.id !== null);
  const posterUrl = moviePosterUrl(movie.poster_path);
  const statusLabel = watchlistStatusLabel(watchlistStatus);
  const title = movie.title || movie.original_title || "Untitled";
  const hasActions =
    canAddToWatchlist ||
    canMarkWatched ||
    canRemoveFromWatchlist ||
    canLike ||
    canRemoveLike ||
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
                  <IconButton
                    type="button"
                    size="small"
                    color="primary"
                    disabled={watchlistSavingAction !== null}
                    aria-label={
                      watchlistSavingAction === "want_to_watch"
                        ? "Adding movie to watchlist"
                        : "Add movie to watchlist"
                    }
                    onClick={() => onAddToWatchlist(movie)}
                  >
                    <FormatListBulletedAddIcon fontSize="small" />
                  </IconButton>
                )}
              {onMarkWatched &&
                (canMarkWatched || watchlistSavingAction === "watched") && (
                  <IconButton
                    type="button"
                    size="small"
                    color="primary"
                    disabled={watchlistSavingAction !== null}
                    aria-label={
                      watchlistSavingAction === "watched"
                        ? "Marking movie watched"
                        : "Mark movie watched"
                    }
                    onClick={() => onMarkWatched(movie)}
                  >
                    <AssignmentTurnedInIcon fontSize="small" />
                  </IconButton>
                )}
              {onRemoveFromWatchlist &&
                (canRemoveFromWatchlist || watchlistSavingAction === "remove") && (
                  <IconButton
                    type="button"
                    size="small"
                    color="error"
                    disabled={watchlistSavingAction !== null}
                    aria-label={
                      watchlistSavingAction === "remove"
                        ? "Removing movie"
                        : "Remove movie"
                    }
                    onClick={() => onRemoveFromWatchlist(movie)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              {onRemoveLike && (canRemoveLike || isSavingLike) && (
                <IconButton
                  type="button"
                  size="small"
                  color="error"
                  disabled={isSavingLike}
                  aria-label={isSavingLike ? "Removing liked movie" : "Remove liked movie"}
                  onClick={() => onRemoveLike(movie)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
              {onLike && (canLike || isSavingLike) && (
                <IconButton
                  type="button"
                  size="small"
                  color="primary"
                  disabled={isSavingLike}
                  aria-label={isSavingLike ? "Liking movie" : "Like movie"}
                  onClick={() => onLike(movie)}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
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
