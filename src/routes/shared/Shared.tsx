import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import type { AuthUser } from "../../auth/cognito";
import {
  fetchAcceptedFriends,
  type Friendship,
} from "../../api/friends";
import {
  fetchSharedWatchlist,
  sendMovieInvitation,
  type MovieSearchResult,
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

function defaultStartTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 60);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function movieTitle(movie: MovieSearchResult) {
  return movie.title || movie.original_title || "Untitled";
}

let invitationKeySequence = 0;

function createIdempotencyKey() {
  invitationKeySequence += 1;
  const values = new Uint32Array(4);
  globalThis.crypto?.getRandomValues?.(values);
  return `invitation-${Array.from(values).join("-")}-${invitationKeySequence}`;
}

export function Shared({ authUser }: SharedProps) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | "">("");
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationMovie, setInvitationMovie] =
    useState<MovieSearchResult | null>(null);
  const [startsAt, setStartsAt] = useState(defaultStartTime);
  const [durationMinutes, setDurationMinutes] = useState(150);
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<string | null>(null);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const selectedFriend = friends.find(
    ({ user }) => user.id === selectedFriendId,
  );

  function openInvitation(movie: MovieSearchResult) {
    setInvitationMovie(movie);
    setStartsAt(defaultStartTime());
    setDurationMinutes(150);
    setLocation("");
    setMessage("");
    setInvitationError(null);
    setIdempotencyKey(createIdempotencyKey());
  }

  function closeInvitation() {
    if (!isSendingInvitation) {
      setInvitationMovie(null);
      setInvitationError(null);
    }
  }

  async function handleInvitationSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    if (
      !authUser ||
      !selectedFriend ||
      !invitationMovie ||
      invitationMovie.id === null
    ) {
      return;
    }

    const selectedDate = new Date(startsAt);
    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.getTime() <= new Date().getTime()
    ) {
      setInvitationError("Choose a future date and time.");
      return;
    }

    setInvitationError(null);
    setInvitationStatus(null);
    setIsSendingInvitation(true);

    try {
      await sendMovieInvitation(authUser, {
        friendUserId: selectedFriend.user.id,
        movieId: invitationMovie.id,
        startsAt: selectedDate.toISOString(),
        timezone: browserTimezone(),
        durationMinutes,
        location: location.trim() || null,
        message: message.trim() || null,
        idempotencyKey,
      });
      setInvitationStatus(
        `Invitation sent for ${movieTitle(invitationMovie)}.`,
      );
      setInvitationMovie(null);
    } catch (caughtError) {
      setInvitationError(errorMessage(caughtError));
    } finally {
      setIsSendingInvitation(false);
    }
  }

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
              setInvitationMovie(null);
              setInvitationStatus(null);
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

      {invitationStatus && (
        <Alert severity="success" className="shared-alert">
          {invitationStatus}
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
              onSchedule={openInvitation}
            />
          ) : null,
        )}
      </section>
      <Dialog
        open={invitationMovie !== null}
        onClose={closeInvitation}
        className="movie-invitation-dialog"
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleInvitationSubmit}>
          <DialogTitle>Plan movie night</DialogTitle>
          <DialogContent>
            {invitationMovie && selectedFriend && (
              <p className="movie-invitation-summary">
                Invite {friendName(selectedFriend)} to watch{" "}
                <strong>{movieTitle(invitationMovie)}</strong>.
              </p>
            )}
            <div className="movie-invitation-fields">
              <TextField
                label="Date and time"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Duration in minutes"
                type="number"
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(Number(event.target.value))
                }
                required
                fullWidth
                slotProps={{
                  htmlInput: { min: 15, max: 480, step: 15 },
                }}
              />
              <TextField
                label="Location or streaming service"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                fullWidth
              />
              <TextField
                label="Message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 2000 } }}
                multiline
                minRows={3}
                fullWidth
              />
              <p className="movie-invitation-timezone">
                Time zone: {browserTimezone()}
              </p>
              {invitationError && (
                <Alert severity="error">{invitationError}</Alert>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              type="button"
              onClick={closeInvitation}
              disabled={isSendingInvitation}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSendingInvitation}
            >
              {isSendingInvitation ? "Sending..." : "Send invitation"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </main>
  );
}
