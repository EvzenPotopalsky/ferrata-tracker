import { Link } from "react-router";
import { usePageTitle } from "@/lib/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Page not found");
  return (
    <div className="page-narrow panel">
      <p className="eyebrow muted">404</p>
      <h1 className="mt-4">This trail ends here.</h1>
      <p className="muted mt-4">
        We couldn't find that page. Head back to explore the routes.
      </p>
      <Link className="button mt-6" to="/">
        Explore ferratas
      </Link>
    </div>
  );
}
