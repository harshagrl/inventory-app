import { redirect } from "next/navigation";

// The home page simply redirects to the dashboard.
// If the user is not logged in, the middleware will
// catch them at /dashboard and redirect to /login.
export default function Home() {
  redirect("/dashboard");
}
