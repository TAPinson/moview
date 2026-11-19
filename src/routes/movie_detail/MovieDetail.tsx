import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import type { AuthUser } from "../../auth/cognito";
import { MovieCard } from "../../components/MovieCard";
import { MovieComments } from "../../components/MovieComments";
import {
  addMovieLike,
  addMovieToWatchlist,
  fetchMovie,
  markMovieWatched,
  removeMovieFromWatchlist,
  removeMovieLike,
  type MovieDetails,
} from "../../api/movies";

type Action = "like" | "unlike" | "watchlist" | "watched" | "remove";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Movie could not be updated.";
}

export function MovieDetail({ authUser }: { authUser: AuthUser | null }) {
  const { movieId: value = "" } = useParams();
  const movieId = Number(value);

  if (
    !/^[1-9]\d*$/.test(value)
    || !Number.isSafeInteger(movieId)
    || movieId > 2147483647
  ) {
    return (
      <main className="page">
        <h1>Invalid movie link</h1>
        <Link to="/browse">Browse movies</Link>
      </main>
    );
  }

  if (!authUser) return null;

  return (
    <MovieDetailContent
      key={`${movieId}:${authUser.idToken}`}
      authUser={authUser}
      movieId={movieId}
    />
  );
}

function MovieDetailContent({
  authUser,
  movieId,
}: {
  authUser: AuthUser;
  movieId: number;
}) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    fetchMovie(authUser, movieId)
      .then((result) => {
        if (current) setDetails(result);
      })
      .catch((error: unknown) => {
        if (current) setLoadError(errorMessage(error));
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [authUser, movieId, retry]);

  function retryLoad() {
    setLoading(true);
    setLoadError(null);
    setRetry((value) => value + 1);
  }

  async function runAction(action: Action) {
    if (saving || !details) return;
    setSaving(true);
    setActionError(null);

    try {
      const changes: Partial<MovieDetails> = {};

      switch (action) {
        case "like":
          await addMovieLike(authUser, movieId);
          changes.isLiked = true;
          break;
        case "unlike":
          if (!await removeMovieLike(authUser, movieId)) {
            throw new Error("Like was already removed. Reload to check its status.");
          }
          changes.isLiked = false;
          break;
        case "watchlist":
          changes.watchlistStatus = (
            await addMovieToWatchlist(authUser, movieId)
          ).status;
          break;
        case "watched":
          changes.watchlistStatus = (
            await markMovieWatched(authUser, movieId)
          ).status;
          break;
        case "remove":
          if (!await removeMovieFromWatchlist(authUser, movieId)) {
            throw new Error("Movie was already removed. Reload to check its status.");
          }
          changes.watchlistStatus = null;
          break;
      }

      setDetails((current) => current ? { ...current, ...changes } : current);
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const movie = details?.movie;
  const title = movie?.title || movie?.original_title || "Untitled";

  return (
    <main className="page movie-detail-page">
      <Link className="movie-detail-back" to="/browse">Browse movies</Link>

      {loading ? (
        <p role="status">Loading movie…</p>
      ) : loadError ? (
        <>
          <h1>Movie could not be loaded</h1>
          <Alert severity="error">{loadError}</Alert>
          <Button onClick={retryLoad}>Retry</Button>
        </>
      ) : !details || !movie ? (
        <>
          <h1>Movie unavailable</h1>
          <p>This movie could not be found or is temporarily unavailable.</p>
          <Button onClick={retryLoad}>Try again</Button>
        </>
      ) : (
        <>
          <MovieCard
            authUser={authUser}
            movie={movie}
            detailPage
            watchlistStatus={details.watchlistStatus}
          />

          <section className="movie-detail-controls" aria-label="Your movie actions">
            <Button
              disabled={saving}
              variant={details.isLiked ? "contained" : "outlined"}
              onClick={() => void runAction(details.isLiked ? "unlike" : "like")}
            >
              {details.isLiked ? "Unlike" : "Like"}
            </Button>

            {!details.watchlistStatus && (
              <Button disabled={saving} onClick={() => void runAction("watchlist")}>
                Add to watchlist
              </Button>
            )}

            {details.watchlistStatus !== "watched" && (
              <Button disabled={saving} onClick={() => void runAction("watched")}>
                Mark watched
              </Button>
            )}

            {details.watchlistStatus && (
              <Button
                disabled={saving}
                color="error"
                onClick={() => void runAction("remove")}
              >
                Remove from my list
              </Button>
            )}

            {saving && <span role="status">Saving…</span>}
          </section>

          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}

          <MovieComments
            inline
            authUser={authUser}
            movieId={movieId}
            title={title}
          />
        </>
      )}
    </main>
  );
}
