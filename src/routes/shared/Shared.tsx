import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { AuthUser } from "../../auth/cognito";
import {
  fetchAcceptedFriends,
  type Friendship,
} from "../../api/friends";
import {
  fetchSharedWatchlist,
  type WatchlistItem,
} from "../../api/movies";
import { MovieCard } from "../../components/MovieCard";

type SharedProps = {
  authUser: AuthUser | null;
};

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The shared watchlist could not be loaded.";
}

function friendName(friendship: Friendship) {
  const { user } = friendship;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name ? `${name} (@${user.username})` : `@${user.username}`;
}

export function Shared({ authUser }: SharedProps) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | "">("");
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFriend = friends.find(
    ({ user }) => user.id === selectedFriendId,
  );

  useEffect(() => {
    if (!authUser) {
      return;
    }

    let isCurrent = true;
    fetchAcceptedFriends(authUser)
      .then((result) => {
        if (isCurrent) {
          setFriends(result);
        }
      })
      .catch((caughtError) => {
        if (isCurrent) {
          setError(errorMessage(caughtError));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingFriends(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [authUser]);

  useEffect(() => {
    if (!authUser || selectedFriendId === "") {
      return;
    }

    let isCurrent = true;
    fetchSharedWatchlist(authUser, selectedFriendId)
      .then((result) => {
        if (isCurrent) {
          setItems(result);
        }
      })
      .catch((caughtError) => {
        if (isCurrent) {
          setItems([]);
          setError(errorMessage(caughtError));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingMovies(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [authUser, selectedFriendId]);

  return (
    <main className="page shared-page">
      <h1>Shared watchlist</h1>
      <p className="shared-intro">
        Select a friend to find movies you both want to watch.
      </p>

      {isLoadingFriends ? (
        <div
          className="movie-list-progress"
          role="status"
          aria-label="Loading friends"
        >
          <CircularProgress size={32} />
        </div>
      ) : friends.length === 0 ? (
        <Alert severity="info" className="shared-alert">
          Add a friend before looking for shared movies.
        </Alert>
      ) : (
        <FormControl className="shared-friend-select">
          <InputLabel id="shared-friend-label">Friend</InputLabel>
          <Select
            labelId="shared-friend-label"
            label="Friend"
            value={selectedFriendId}
            onChange={(event) => {
              setItems([]);
              setError(null);
              setIsLoadingMovies(true);
              setSelectedFriendId(Number(event.target.value));
            }}
          >
            {friends.map((friendship) => (
              <MenuItem
                key={friendship.user.id}
                value={friendship.user.id}
              >
                {friendName(friendship)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {error && (
        <Alert severity="error" className="shared-alert">
          {error}
        </Alert>
      )}

      {isLoadingMovies && (
        <div
          className="movie-list-progress"
          role="status"
          aria-label="Loading shared movies"
        >
          <CircularProgress size={32} />
        </div>
      )}

      {!isLoadingMovies &&
        selectedFriend &&
        !error &&
        items.length === 0 && (
          <Alert severity="info" className="shared-alert">
            You and @{selectedFriend.user.username} do not have any movies
            in common yet.
          </Alert>
        )}

      <section
        className="movie-results"
        aria-label="Shared watchlist movies"
      >
        {items.map((item) =>
          item.movie ? (
            <MovieCard
              key={item.movieId}
              movie={item.movie}
              watchlistStatus={item.status}
            />
          ) : null,
        )}
      </section>
    </main>
  );
}
