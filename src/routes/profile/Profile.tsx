import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import type { AuthUser } from "../../auth/cognito";
import type { UserProfile } from "../../api/profile";
import {
  fetchCurrentUserProfile,
  updateUserProfile,
  uploadProfilePhoto,
} from "../../api/profile";

type ProfileProps = {
  authUser: AuthUser | null;
  userProfile: UserProfile | null;
  onProfileUpdated: (profile: UserProfile) => void;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Profile update failed.";
}

export function Profile({
  authUser,
  userProfile,
  onProfileUpdated,
}: ProfileProps) {
  const [username, setUsername] = useState(userProfile?.username ?? "");
  const [firstName, setFirstName] = useState(userProfile?.firstName ?? "");
  const [lastName, setLastName] = useState(userProfile?.lastName ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  function handlePhotoSelected(file: File | null) {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(file);
    setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null);
    setStatus(null);
    setError(null);
  }

  async function handlePhotoUpload() {
    if (!authUser || !photoFile) return;
    setStatus(null);
    setError(null);
    setIsUploadingPhoto(true);
    try {
      await uploadProfilePhoto(authUser, photoFile);
      const refreshedProfile = await fetchCurrentUserProfile(authUser);
      onProfileUpdated(refreshedProfile);
      handlePhotoSelected(null);
      setStatus("Profile photo uploaded.");
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authUser) {
      return;
    }

    setStatus(null);
    setError(null);
    setIsSaving(true);

    try {
      await updateUserProfile(authUser, {
        username: username.trim(),
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
      });
      const refreshedProfile = await fetchCurrentUserProfile(authUser);
      onProfileUpdated(refreshedProfile);
      setStatus("Profile saved.");
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page profile-page">
      <p className="eyebrow">Account</p>
      <h1>Profile</h1>
      <div className="profile-photo-editor">
        <Avatar
          className="profile-photo-preview"
          src={photoPreviewUrl ?? userProfile?.profilePhotoUrl ?? undefined}
          alt="Profile"
        />
        <div className="profile-photo-controls">
          <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>
            Choose photo
            <input
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                handlePhotoSelected(event.target.files?.[0] ?? null)
              }
            />
          </Button>
          <Button
            variant="contained"
            disabled={!photoFile || isUploadingPhoto}
            onClick={handlePhotoUpload}
          >
            {isUploadingPhoto ? "Uploading..." : "Upload photo"}
          </Button>
          <p>JPEG, PNG, or WebP. Maximum 5 MB.</p>
        </div>
      </div>
      <form className="profile-form" onSubmit={handleSubmit}>
        <TextField
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          fullWidth
        />
        <TextField
          label="First name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          fullWidth
        />
        <TextField
          label="Last name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          fullWidth
        />
        {status && <Alert severity="success">{status}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </form>
    </main>
  );
}
