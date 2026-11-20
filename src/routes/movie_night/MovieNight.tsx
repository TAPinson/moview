import { useEffect, useState } from "react";
import { Alert, Avatar, Button, Card, CardContent, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import {
  listMovieNights,
  respondToMovieNight,
  type MovieNightDecision,
  type MovieNightInvitation,
} from "../../api/movies";
import type { AuthUser } from "../../auth/cognito";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function MovieNight({ authUser }: { authUser: AuthUser }) {
  const [invitations, setInvitations] = useState<MovieNightInvitation[] | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    listMovieNights(authUser).then(
      (result) => { if (active) setInvitations(result); },
      () => { if (active) setError("Couldn’t load your movie nights."); },
    );
    return () => { active = false; };
  }, [authUser]);

  async function respond(id: number, decision: MovieNightDecision) {
    setSaving(true);
    setError("");
    try {
      const saved = await respondToMovieNight(authUser, id, decision);
      setInvitations(await listMovieNights(authUser));
      if (!saved) setError("This invitation is no longer awaiting your response.");
    } catch {
      setError("Couldn’t update the invitation. Reload the page to check its status.");
    } finally {
      setSaving(false);
    }
  }

  const items = invitations ?? [];
  const sections = [
    {
      title: "Needs your response",
      items: items.filter((item) => item.incoming && item.response === "awaiting"),
    },
    {
      title: "Upcoming",
      items: items.filter((item) => item.response === "accepted"),
    },
    {
      title: "Sent invites",
      items: items.filter((item) => !item.incoming && item.response !== "accepted"),
    },
  ];

  return (
    <main className="page movie-night-page">
      <h1>Movie Night</h1>
      {error && <Alert severity="error">{error}</Alert>}
      {!invitations && !error && (
        <div className="movie-list-progress" role="status" aria-label="Loading movie nights">
          <CircularProgress size={36} />
        </div>
      )}
      {invitations && sections.every((section) => !section.items.length) && (
        <p>No movie nights to show. <Link to="/shared">Find a movie to watch together</Link>.</p>
      )}
      {sections.filter((section) => section.items.length > 0).map((section) => (
        <section className="friend-section" key={section.title}>
          <h2>{section.title}</h2>
          <div className="friend-grid">
            {section.items.map((item) => {
              const needsResponse = item.incoming && item.response === "awaiting";
              const participantLabel = item.response === "accepted"
                ? "With"
                : item.incoming ? "Invited by" : "Invited";

              return (
                <Card component="article" className="friend-card movie-night-card" variant="outlined" key={item.id}>
                  <CardContent className="movie-night-card-content">
                    <h3>{item.eventSummary}</h3>
                    <div className="friend-identity movie-night-participant">
                      <Avatar
                        className="friend-avatar"
                        src={item.friendProfilePhotoUrl ?? undefined}
                        aria-hidden="true"
                      >
                        {item.friendName.charAt(0).toUpperCase()}
                      </Avatar>
                      <p>{participantLabel} {item.friendName}</p>
                    </div>
                    <p><time dateTime={item.startsAt}>{dateFormat.format(new Date(item.startsAt))}</time></p>
                    {item.location && <p>{item.location}</p>}
                    {item.message && <p className="movie-night-message">{item.message}</p>}
                    {needsResponse ? (
                      <div className="friend-actions movie-night-actions">
                        <Button size="small" className="movie-night-accept" variant="contained" disableElevation
                          disabled={saving} onClick={() => void respond(item.id, "accepted")}>
                          Accept
                        </Button>
                        <Button size="small" className="movie-night-decline" variant="outlined"
                          disabled={saving} onClick={() => void respond(item.id, "declined")}>
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <span className="movie-night-status" data-response={item.response}>
                        {item.response === "accepted" ? "Confirmed" :
                          item.response === "declined" ? "Declined" : "Awaiting reply"}
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
