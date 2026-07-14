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
import { About } from "./routes/about/About";
import { Login } from "./routes/login/Login";
import { Profile } from "./routes/profile/Profile";
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
            <NavLink to="/home" title="Home">
              <span className="nav-icon" aria-hidden="true">
                H
              </span>
              <span>Home</span>
            </NavLink>
            <NavLink to="/profile" title="Profile">
              <span className="nav-icon" aria-hidden="true">
                P
              </span>
              <span>Profile</span>
            </NavLink>
            <NavLink to="/about" title="About">
              <span className="nav-icon" aria-hidden="true">
                A
              </span>
              <span>About</span>
            </NavLink>
          </nav>
        )}
      </aside>

      <section className="content-area">
        <header className="top-header">
          <div>
            <p className="header-kicker">Workspace</p>
            <h2>Moview</h2>
          </div>
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
            path="/about"
            element={
              <ProtectedRoute user={user} isAuthReady={isAuthReady}>
                <About />
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
