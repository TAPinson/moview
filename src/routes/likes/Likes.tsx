import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import type { AuthUser } from "../../auth/cognito";
import { fetchLikedMovies, type MovieLike } from "../../api/movies";
import { MovieCard } from "../../components/MovieCard";

type LikesProps = {
  authUser: AuthUser | null;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Liked movies failed to load.";
}

export function Likes({ authUser }: LikesProps) {
  const [likes, setLikes] = useState<MovieLike[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(authUser !== null);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    let isMounted = true;
    fetchLikedMovies(authUser)
      .then((likedMovies) => {
        if (isMounted) {
          setLikes(likedMovies);
        }
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(errorMessage(caughtError));
          setLikes([]);
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
  }, [authUser]);

  return (
    <main className="page likes-page">
      <h1>Likes</h1>

      {isLoading && (
        <div className="movie-list-progress" role="status" aria-label="Loading movies">
          <CircularProgress size={32} />
        </div>
      )}
      {error && <Alert severity="error" className="movie-search-alert">{error}</Alert>}
      {!isLoading && !error && likes.length === 0 && (
        <Alert severity="info" className="movie-search-alert">
          You have not liked any movies yet.
        </Alert>
      )}

      <section className="movie-results" aria-label="Liked movies">
        {likes.map((like) =>
          like.movie ? (
            <MovieCard key={`${like.movieId}-${like.createdAt}`} movie={like.movie} />
          ) : null,
        )}
      </section>
    </main>
  );
}
