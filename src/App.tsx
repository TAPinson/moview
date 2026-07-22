import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import type { ReactNode } from "react";
import PersonIcon from "@mui/icons-material/Person";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import { Home } from "./routes/home/Home";
import { Login } from "./routes/login/Login";
import { Profile } from "./routes/profile/Profile";
import { MovieSearch } from "./routes/movie_search/MovieSearch";
import { Watched, Watchlist } from "./routes/watchlist/Watchlist";
import { Likes } from "./routes/likes/Likes";
import { Browse } from "./routes/browse/Browse";
import { Friends } from "./routes/friends/Friends";
import { Shared } from "./routes/shared/Shared";
import {
  getCurrentAuthUser,
  signOut as signOutUser,
  type AuthUser,
} from "./auth/cognito";
import {
  clearStoredUserProfile,
  fetchCurrentUserProfile,
  loadStoredUserProfile,
  type UserProfile,
} from "./api/profile";

type ProtectedRouteProps = {
  user: AuthUser | null;
  isAuthReady: boolean;
  children: ReactNode;
};

function ProtectedRoute({ user, isAuthReady, children }: ProtectedRouteProps) {
  if (!isAuthReady) {
    return <main className="page">Loading...</main>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() =>
    loadStoredUserProfile(),
  );
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const isLoggedIn = user !== null;
  const isAccountMenuOpen = accountMenuAnchor !== null;

  useEffect(() => {
    let isMounted = true;

    getCurrentAuthUser()
      .then(async (currentUser) => {
        if (!isMounted) {
          return;
        }

        setUser(currentUser);
        if (!currentUser) {
          clearStoredUserProfile();
          setUserProfile(null);
          return;
        }

        const profile = await fetchCurrentUserProfile(currentUser);
        if (isMounted) {
          setUserProfile(profile);
        }
      })
      .catch(() => {
        if (isMounted) {
          signOutUser();
          clearStoredUserProfile();
          setUser(null);
          setUserProfile(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAuthenticated(authUser: AuthUser) {
    const profile = await fetchCurrentUserProfile(authUser);
    setUser(authUser);
    setUserProfile(profile);
  }

  function handleProfileUpdated(profile: UserProfile) {
    setUserProfile(profile);
  }

  function handleAccountMenuOpen(event: MouseEvent<HTMLButtonElement>) {
    setAccountMenuAnchor(event.currentTarget);
  }

  function handleAccountMenuClose() {
    setAccountMenuAnchor(null);
  }

  function handleLogout() {
    handleAccountMenuClose();
    signOutUser();
    clearStoredUserProfile();
    setUser(null);
    setUserProfile(null);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="sidebar-header">
          <NavLink className="brand" to="/home" aria-label="Moview home">
            <span className="brand-mark" aria-hidden="true">
              A
            </span>
            <span>Moview</span>
          </NavLink>
        </div>

        {isLoggedIn && (
          <nav>
            <NavLink to="/browse" title="Browse">
              <span className="nav-icon" aria-hidden="true">B</span>
              <span>Browse</span>
            </NavLink>
            <NavLink to="/movie_search" title="Movie Search">
              <span className="nav-icon" aria-hidden="true">
                M
              </span>
              <span>Movie Search</span>
            </NavLink>
            <NavLink to="/watchlist" title="Watchlist">
              <span className="nav-icon" aria-hidden="true">
                W
              </span>
              <span>Watchlist</span>
            </NavLink>
            <NavLink to="/shared" title="Shared">
              <span className="nav-icon" aria-hidden="true">
                S
              </span>
              <span>Shared</span>
            </NavLink>
            <NavLink to="/likes" title="Likes">
              <span className="nav-icon" aria-hidden="true">
                L
              </span>
              <span>Likes</span>
            </NavLink>
            <NavLink to="/watched" title="Watched">
              <span className="nav-icon" aria-hidden="true">
                V
              </span>
              <span>Watched</span>
            </NavLink>
          </nav>
        )}
      </aside>

      <section className="content-area">
        <header className="top-header">
          <div className="header-actions">
            {isLoggedIn ? (
              <>
                <IconButton
                  id="account-menu-button"
                  className="account-menu-button"
                  aria-label="Account menu"
                  aria-controls={isAccountMenuOpen ? "account-menu" : undefined}
                  aria-haspopup="menu"
                  aria-expanded={isAccountMenuOpen ? "true" : undefined}
                  onClick={handleAccountMenuOpen}
                >
                  <PersonIcon fontSize="small" />
                </IconButton>
                <Menu
                  id="account-menu"
                  anchorEl={accountMenuAnchor}
                  open={isAccountMenuOpen}
                  onClose={handleAccountMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{
                    list: { "aria-labelledby": "account-menu-button" },
                  }}
                >
                  <MenuItem
                    onClick={handleAccountMenuClose}
                    component={NavLink}
                    to="/friends"
                  >
                    Friends
                  </MenuItem>
                  <MenuItem
                    onClick={handleAccountMenuClose}
                    component={NavLink}
                    to="/profile"
                  >
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                className="account-menu-button"
                aria-label="Sign in"
                component={NavLink}
                to="/login"
              >
                <PersonOffIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <Home userProfile={userProfile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <Friends authUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <Browse authUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie_search"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <MovieSearch authUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <Watchlist authUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shared"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <Shared authUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/likes"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <Likes authUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watched"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <Watched authUser={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <Profile
                  authUser={user}
                  userProfile={userProfile}
                  onProfileUpdated={handleProfileUpdated}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <Login
                isAuthReady={isAuthReady}
                user={user}
                onAuthenticated={handleAuthenticated}
              />
            }
          />
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />}
          />
        </Routes>
      </section>
    </div>
  );
}

export default App;
