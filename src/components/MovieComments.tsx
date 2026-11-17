import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import type { AuthUser } from "../auth/cognito";
import {
  addMovieComment,
  deleteMovieComment,
  fetchMovieComments,
  type MovieCommentPage,
} from "../api/movies";

type Props = {
  authUser: AuthUser;
  movieId: number;
  title: string;
  onClose: () => void;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Comments could not be updated.";
}

export function MovieComments({ authUser, movieId, title, onClose }: Props) {
  const [page, setPage] = useState<MovieCommentPage | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const bodyLength = Array.from(body).length;

  useEffect(() => {
    let current = true;
    fetchMovieComments(authUser, movieId)
      .then((result) => {
        if (current) setPage(result);
      })
      .catch((reason: unknown) => {
        if (current) setError(errorMessage(reason));
      })
      .finally(() => {
        if (current) setBusy(false);
      });
    return () => {
      current = false;
    };
  }, [authUser, movieId, retry]);

  async function postComment() {
    if (busy || !page || !body.trim() || bodyLength > 2000) return;
    setBusy(true);
    setError(null);
    try {
      const comment = await addMovieComment(authUser, movieId, body);
      setPage((current) =>
        current
          ? { ...current, comments: [comment, ...current.comments] }
          : current,
      );
      setBody("");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(commentId: number) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const removed = await deleteMovieComment(authUser, commentId);
      if (!removed) {
        throw new Error("Comment was already removed or cannot be deleted.");
      }
      setPage((current) =>
        current
          ? {
              ...current,
              comments: current.comments.filter((item) => item.id !== commentId),
            }
          : current,
      );
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  async function loadMore() {
    if (busy || !page?.nextCursor) return;
    setBusy(true);
    setError(null);
    try {
      const result = await fetchMovieComments(
        authUser,
        movieId,
        page.nextCursor,
      );
      setPage((current) => ({
        comments: [...(current?.comments ?? []), ...result.comments],
        nextCursor: result.nextCursor,
      }));
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Comments — {title}</DialogTitle>
      <DialogContent aria-busy={busy}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Visible to all signed-in users.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {busy && <Typography role="status">Loading…</Typography>}

        {!page && !busy && (
          <Button onClick={() => {
            setBusy(true);
            setError(null);
            setRetry((value) => value + 1);
          }}>
            Retry
          </Button>
        )}

        {page?.comments.length === 0 && (
          <Typography>No comments yet.</Typography>
        )}

        {page?.comments.map((comment) => (
          <Box
            component="article"
            key={comment.id}
            sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Typography variant="subtitle2">
              @{comment.author.username}
            </Typography>
            <Typography
              component="time"
              dateTime={comment.createdAt}
              variant="caption"
            >
              {new Date(comment.createdAt).toLocaleString()}
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {comment.body}
            </Typography>
            {comment.canDelete && (
              <Button
                size="small"
                color="error"
                disabled={busy}
                onClick={() => void removeComment(comment.id)}
              >
                Delete comment
              </Button>
            )}
          </Box>
        ))}

        {page?.nextCursor && (
          <Button disabled={busy} onClick={() => void loadMore()}>
            Load more
          </Button>
        )}

        <Box component="form" onSubmit={(event) => {
          event.preventDefault();
          void postComment();
        }} sx={{ mt: 2 }}>
          <TextField
            label="Your comment"
            multiline
            minRows={3}
            fullWidth
            value={body}
            disabled={busy || !page}
            onChange={(event) => setBody(event.target.value)}
            error={bodyLength > 2000}
            helperText={`${bodyLength}/2,000 characters`}
          />
          <Button
            type="submit"
            disabled={busy || !page || !body.trim() || bodyLength > 2000}
            sx={{ mt: 1 }}
          >
            Post comment
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
