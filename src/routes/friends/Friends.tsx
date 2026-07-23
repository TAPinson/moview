import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import type { AuthUser } from "../../auth/cognito";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  fetchFriendLists,
  findUsers,
  removeFriend,
  sendFriendRequest,
  type FriendLists,
  type PublicUserProfile,
} from "../../api/friends";

type FriendsProps = { authUser: AuthUser | null };
type Action = (authUser: AuthUser, userId: number) => Promise<unknown>;
const EMPTY_LISTS: FriendLists = { friends: [], incoming: [], outgoing: [] };

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Friend action failed.";
}

function displayName(user: PublicUserProfile) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.username;
}

function UserCard({ user, actions }: { user: PublicUserProfile; actions: ReactNode }) {
  return (
    <Card className="friend-card" variant="outlined">
      <CardContent className="friend-card-content">
        <div className="friend-identity">
          <Avatar
            className="friend-avatar"
            src={user.profilePhotoUrl ?? undefined}
            alt={displayName(user)}
          >
            {displayName(user).charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <h3>{displayName(user)}</h3>
            <p>@{user.username}</p>
          </div>
        </div>
        <div className="friend-actions">{actions}</div>
      </CardContent>
    </Card>
  );
}

export function Friends({ authUser }: FriendsProps) {
  const [lists, setLists] = useState<FriendLists>(EMPTY_LISTS);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PublicUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) return;
    let isCurrent = true;
    fetchFriendLists(authUser)
      .then((result) => { if (isCurrent) setLists(result); })
      .catch((caughtError) => { if (isCurrent) setError(errorMessage(caughtError)); })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [authUser]);

  async function refreshLists() {
    if (!authUser) return;
    setLists(await fetchFriendLists(authUser));
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authUser || !query.trim()) return;
    setError(null);
    setIsSearching(true);
    try {
      setSearchResults(await findUsers(authUser, query.trim()));
    } catch (caughtError) {
      setError(errorMessage(caughtError));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function runAction(action: Action, userId: number) {
    if (!authUser) return;
    setError(null);
    setSavingUserId(userId);
    try {
      await action(authUser, userId);
      setSearchResults((current) => current.filter((user) => user.id !== userId));
      await refreshLists();
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <main className="page friends-page">
      <h1>Friends</h1>
      <form className="friend-search-form" onSubmit={handleSearch}>
        <TextField label="Find by username" value={query} onChange={(event) => setQuery(event.target.value)} required fullWidth />
        <IconButton
          className="friend-search-button"
          type="submit"
          aria-label={isSearching ? "Searching for people" : "Search for people"}
          disabled={isSearching}
        >
          <PersonSearchIcon />
        </IconButton>
      </form>
      {error && <Alert severity="error" className="friends-alert">{error}</Alert>}
      {searchResults.length > 0 && <section className="friend-section" aria-labelledby="people-heading">
        <h2 id="people-heading">People</h2>
        <div className="friend-grid">{searchResults.map((user) => <UserCard key={user.id} user={user} actions={
          <IconButton aria-label={`Send friend request to ${user.username}`} disabled={savingUserId === user.id} onClick={() => runAction(sendFriendRequest, user.id)}><PersonAddIcon /></IconButton>
        } />)}</div>
      </section>}
      {isLoading ? <div className="movie-list-progress" role="status" aria-label="Loading friends"><CircularProgress size={36} /></div> : <>
        <section className="friend-section" aria-labelledby="requests-heading">
          <h2 id="requests-heading">Requests <span>{lists.incoming.length}</span></h2>
          {lists.incoming.length === 0 ? <p>No incoming friend requests.</p> : <div className="friend-grid">{lists.incoming.map(({ user }) => <UserCard key={user.id} user={user} actions={<>
            <IconButton color="primary" aria-label={`Accept ${user.username}`} disabled={savingUserId === user.id} onClick={() => runAction(acceptFriendRequest, user.id)}><CheckIcon /></IconButton>
            <IconButton color="error" aria-label={`Decline ${user.username}`} disabled={savingUserId === user.id} onClick={() => runAction(declineFriendRequest, user.id)}><CloseIcon /></IconButton>
          </>} />)}</div>}
        </section>
        <section className="friend-section" aria-labelledby="friends-heading">
          <h2 id="friends-heading">Your friends <span>{lists.friends.length}</span></h2>
          {lists.friends.length === 0 ? <p>You have not added any friends yet.</p> : <div className="friend-grid">{lists.friends.map(({ user }) => <UserCard key={user.id} user={user} actions={
            <IconButton color="error" aria-label={`Remove ${user.username}`} disabled={savingUserId === user.id} onClick={() => runAction(removeFriend, user.id)}><PersonRemoveIcon /></IconButton>
          } />)}</div>}
        </section>
        <section className="friend-section" aria-labelledby="sent-heading">
          <h2 id="sent-heading">Sent requests <span>{lists.outgoing.length}</span></h2>
          {lists.outgoing.length === 0 ? <p>No pending sent requests.</p> : <div className="friend-grid">{lists.outgoing.map(({ user }) => <UserCard key={user.id} user={user} actions={
            <IconButton aria-label={`Cancel request to ${user.username}`} disabled={savingUserId === user.id} onClick={() => runAction(cancelFriendRequest, user.id)}><CloseIcon /></IconButton>
          } />)}</div>}
        </section>
      </>}
    </main>
  );
}
