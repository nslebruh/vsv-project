import { useAuthProvider } from "./firebase/context/auth";

export const LandingPage = () => {
  const user = useAuthProvider();
  return (
    <>
      <h1>Home</h1>
      <br />
      {!user ? <p>Not logged in</p> : <p>Logged in as {user.email}</p>}
    </>
  );
};
