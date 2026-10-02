import { useEffect, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Autocomplete from "@mui/material/Autocomplete";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import type { AuthUser } from "../../auth/cognito";
import {
  addMovieLike,
  addMovieToWatchlist,
  fetchLikedMovies,
  fetchMoviesByGenre,
  fetchWatchlistEntries,
  markMovieWatched,
  searchMoviePeople,
  type MoviePerson,
  type MovieSearchResult,
  type WatchlistStatus,
} from "../../api/movies";
import { MovieCard } from "../../components/MovieCard";
import movieGenres from "../../data/movieGenres.json";

type BrowseProps = { authUser: AuthUser | null };
type WatchlistAction = "want_to_watch" | "watched";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The movie could not be updated.";
}

export function Browse({ authUser }: BrowseProps) {
  const [includeAdult, setIncludeAdult] = useState(false);
  const [certification, setCertification] = useState("");
  const [person, setPerson] = useState<MoviePerson | null>(null);
  const [personQuery, setPersonQuery] = useState("");
  const [people, setPeople] = useState<MoviePerson[]>([]);
  const [isSearchingPeople, setIsSearchingPeople] = useState(false);
  const [peopleError, setPeopleError] = useState<string | null>(null);
  const personId = person?.id ?? null;
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(movieGenres.genres[0].id);
  const [movies, setMovies] = useState<MovieSearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedMovieIds, setLikedMovieIds] = useState<Set<number>>(() => new Set());
  const [savingLikeMovieId, setSavingLikeMovieId] = useState<number | null>(null);
  const [likeErrors, setLikeErrors] = useState<Record<number, string>>({});
  const [watchlistStatuses, setWatchlistStatuses] = useState<Record<number, WatchlistStatus>>({});
  const [savingWatchlistActions, setSavingWatchlistActions] = useState<Record<number, WatchlistAction>>({});
  const [watchlistErrors, setWatchlistErrors] = useState<Record<number, string>>({});
  const selectedGenre = movieGenres.genres.find(({ id }) => id === selectedGenreId);

  useEffect(() => {
    let isCurrent = true;
    if (!authUser || personQuery.trim().length < 2) return;
    const timer = window.setTimeout(() => {
      setIsSearchingPeople(true);
      searchMoviePeople(authUser, personQuery.trim(), includeAdult)
        .then((matches) => {
          if (isCurrent) setPeople(matches);
        })
        .catch((caughtError: unknown) => {
          if (isCurrent) setPeopleError(errorMessage(caughtError));
        })
        .finally(() => {
          if (isCurrent) setIsSearchingPeople(false);
        });
    }, 300);
    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [authUser, personQuery, includeAdult]);

  useEffect(() => {
    if (!authUser) return;
    let isCurrent = true;

    Promise.all([
      fetchMoviesByGenre(authUser, selectedGenreId, page, includeAdult, personId, certification || null),
      fetchWatchlistEntries(authUser),
      fetchLikedMovies(authUser),
    ])
      .then(([moviePage, entries, likes]) => {
        if (!isCurrent) return;
        setMovies(moviePage.results);
        setTotalPages(Math.min(moviePage.totalPages, 500));
        setWatchlistStatuses(Object.fromEntries(entries.map((entry) => [entry.movieId, entry.status])));
        setLikedMovieIds(new Set(likes.map((like) => like.movieId)));
      })
      .catch((caughtError: unknown) => {
        if (isCurrent) {
          setMovies([]);
          setError(errorMessage(caughtError));
        }
      })
      .finally(() => { if (isCurrent) setIsLoading(false); });

    return () => { isCurrent = false; };
  }, [authUser, selectedGenreId, page, includeAdult, personId, certification]);

  function resetResults() {
    setIsLoading(true);
    setError(null);
    setLikeErrors({});
    setWatchlistErrors({});
    setPage(1);
  }

  async function handleLike(movie: MovieSearchResult) {
    if (!authUser || movie.id === null) return;
    const movieId = movie.id;
    setSavingLikeMovieId(movieId);
    setLikeErrors((current) => { const next = { ...current }; delete next[movieId]; return next; });
    try {
      await addMovieLike(authUser, movieId);
      setLikedMovieIds((current) => new Set(current).add(movieId));
    } catch (caughtError) {
      setLikeErrors((current) => ({ ...current, [movieId]: errorMessage(caughtError) }));
    } finally {
      setSavingLikeMovieId(null);
    }
  }

  async function saveWatchlistStatus(movie: MovieSearchResult, status: WatchlistAction) {
    if (!authUser || movie.id === null) return;
    const movieId = movie.id;
    setSavingWatchlistActions((current) => ({ ...current, [movieId]: status }));
    setWatchlistErrors((current) => { const next = { ...current }; delete next[movieId]; return next; });
    try {
      const item = status === "watched"
        ? await markMovieWatched(authUser, movieId)
        : await addMovieToWatchlist(authUser, movieId);
      setWatchlistStatuses((current) => ({ ...current, [item.movieId]: item.status }));
    } catch (caughtError) {
      setWatchlistErrors((current) => ({ ...current, [movieId]: errorMessage(caughtError) }));
    } finally {
      setSavingWatchlistActions((current) => { const next = { ...current }; delete next[movieId]; return next; });
    }
  }

  function changePage(nextPage: number) {
    setIsLoading(true);
    setError(null);
    setPage(nextPage);
  }

  return (
    <main className="page browse-page">
      <h1>Browse movies</h1>
      <p className="browse-intro">Explore popular movies by genre or cast or crew member.</p>
      <section className="browse-filters" aria-label="Browse filters">
        <div className="browse-filter-controls">
        <Autocomplete
          className="browse-person-filter"
          size="small"
          fullWidth
          slotProps={{ paper: { className: "browse-people-menu" } }}
          options={people}
          value={person}
          inputValue={personQuery}
          loading={isSearchingPeople}
          filterOptions={(options) => options}
          getOptionLabel={(option) => option.name}
          getOptionKey={(option) => option.id}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option) => (
            <li {...props}>
              {option.name}{option.department ? ` — ${option.department}` : ""}
            </li>
          )}
          noOptionsText={personQuery.trim().length < 2
            ? "Type at least two characters"
            : "No people found"}
          onInputChange={(_, value) => {
            setPersonQuery(value);
            setPeople([]);
            setPeopleError(null);
            setIsSearchingPeople(false);
          }}
          onChange={(_, value) => {
            if (value?.id === person?.id) return;
            resetResults();
            setPerson(value);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Cast or crew member" placeholder="Search a name" />
          )}
        />
        <TextField
          select
          label="Age rating (US)"
          value={certification}
          className="browse-rating-filter"
          size="small"
          fullWidth
          slotProps={{ select: { MenuProps: { slotProps: { paper: { className: "browse-filter-menu" } } } } }}
          onChange={(event) => {
            resetResults();
            setCertification(event.target.value);
          }}
        >
          <MenuItem value="">Any rating</MenuItem>
          {["G", "PG", "PG-13", "R", "NC-17"].map((rating) => (
            <MenuItem key={rating} value={rating}>{rating}</MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          className="browse-adult-filter"
          label="Include adult entries"
          control={<Switch size="small" checked={includeAdult} onChange={(_, checked) => {
            resetResults();
            setIncludeAdult(checked);
            setPerson(null);
            setPersonQuery("");
            setPeople([]);
            setPeopleError(null);
            setIsSearchingPeople(false);
          }} />}
        />
        </div>
        <p className="browse-filter-hint">
          Choose a US rating or search a person. Selecting a person searches across all genres.
        </p>
      </section>
      {peopleError && <Alert severity="error">{peopleError}</Alert>}
      {!person && <div className="genre-list" aria-label="Movie genres">
        <Chip label="All genres" clickable
          color={selectedGenreId === null ? "primary" : "default"}
          variant={selectedGenreId === null ? "filled" : "outlined"}
          aria-pressed={selectedGenreId === null}
          onClick={() => {
            if (selectedGenreId === null) return;
            resetResults();
            setSelectedGenreId(null);
          }} />
        {movieGenres.genres.map((genre) => (
          <Chip key={genre.id} label={genre.name} clickable
            color={genre.id === selectedGenreId ? "primary" : "default"}
            variant={genre.id === selectedGenreId ? "filled" : "outlined"}
            aria-pressed={genre.id === selectedGenreId}
            onClick={() => {
              if (genre.id === selectedGenreId) return;
              setIsLoading(true);
              setError(null);
              setLikeErrors({});
              setWatchlistErrors({});
              setPage(1);
              setSelectedGenreId(genre.id);
            }} />
        ))}
      </div>}
      <section className="browse-results" aria-labelledby="browse-results-heading">
        <h2 id="browse-results-heading">
          {person ? `Movies with ${person.name}` : selectedGenre?.name ?? "All genres"}
        </h2>
        {isLoading && <div className="movie-list-progress" role="status" aria-label="Loading movies"><CircularProgress size={36} /></div>}
        {error && <Alert severity="error">{error}</Alert>}
        {!isLoading && !error && movies.length === 0 && <Alert severity="info">
          No movies found for these filters.
        </Alert>}
        {!isLoading && !error && <div className="movie-results" aria-live="polite">
          {movies.map((movie, index) => {
            const movieId = movie.id;
            return <MovieCard
              key={movieId ?? `${movie.title}-${index}`}
              movie={movie}
              isLiked={movieId !== null && likedMovieIds.has(movieId)}
              isSavingLike={movieId !== null && savingLikeMovieId === movieId}
              likeError={movieId !== null ? likeErrors[movieId] : null}
              onLike={handleLike}
              onAddToWatchlist={(selectedMovie) => saveWatchlistStatus(selectedMovie, "want_to_watch")}
              onMarkWatched={(selectedMovie) => saveWatchlistStatus(selectedMovie, "watched")}
              watchlistError={movieId !== null ? watchlistErrors[movieId] : null}
              watchlistSavingAction={movieId !== null ? savingWatchlistActions[movieId] ?? null : null}
              watchlistStatus={movieId !== null ? watchlistStatuses[movieId] ?? null : null}
            />;
          })}
        </div>}
        {!error && totalPages > 1 && (
          <nav className="browse-pagination" aria-label="Browse result pages">
            <IconButton aria-label="Previous page" disabled={isLoading || page <= 1} onClick={() => changePage(page - 1)}>
              <ChevronLeftIcon />
            </IconButton>
            <span aria-live="polite">Page {page} of {totalPages}</span>
            <IconButton aria-label="Next page" disabled={isLoading || page >= totalPages} onClick={() => changePage(page + 1)}>
              <ChevronRightIcon />
            </IconButton>
          </nav>
        )}
      </section>
    </main>
  );
}
