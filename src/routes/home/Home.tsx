import type { UserProfile } from "../../api/profile";

type HomeProps = {
  userProfile: UserProfile | null;
};

export function Home({ userProfile }: HomeProps) {
  return (
    <main className="page">
      <h1>Welcome to Moview</h1>
      {userProfile && (
        <p>
          Signed in as {userProfile.username} ({userProfile.email})
        </p>
      )}
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
        vulputate velit non lectus efficitur, at laoreet risus finibus.
        Suspendisse potenti.
      </p>
      <p>
        Curabitur tristique sem vitae magna interdum, nec dignissim risus
        facilisis. Donec at nibh in arcu aliquam tincidunt vitae quis magna.
      </p>
    </main>
  );
}
