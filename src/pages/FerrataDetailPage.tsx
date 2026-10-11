import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "@/context/auth";
import CompletionForm from "@/components/CompletionForm";
import { getFerrataById } from "@/services/ferrataService";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Ferrata } from "@/types/ferrata";

export default function FerrataDetailPage() {
  const { ferrataId } = useParams();
  const { user, isAuthLoading } = useAuth();
  const [ferrata, setFerrata] = useState<Ferrata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  usePageTitle(ferrata?.name ?? "Ferrata details");

  useEffect(() => {
    let isActive = true;
    async function loadFerrata() {
      try {
        const data = ferrataId ? await getFerrataById(ferrataId) : null;
        if (isActive) setFerrata(data);
      } catch {
        if (isActive)
          setError(
            "We couldn't load this ferrata. Please refresh to try again.",
          );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    loadFerrata();
    return () => {
      isActive = false;
    };
  }, [ferrataId]);

  return (
    <div className="page-narrow">
      <Link to="/">← Back to ferratas</Link>
      {isLoading && (
        <>
          <h1 className="mt-6">Ferrata details</h1>
          <p role="status" className="muted mt-4">
            Loading ferrata…
          </p>
        </>
      )}
      {error && (
        <>
          <h1 className="mt-6">Ferrata details</h1>
          <p role="alert" className="error mt-4">
            {error}
          </p>
        </>
      )}
      {!isLoading && !error && !ferrata && (
        <>
          <h1 className="mt-6">Ferrata not found</h1>
          <p className="muted mt-4">
            This route may have been removed from the catalog.
          </p>
        </>
      )}
      {!isLoading && !error && ferrata && (
        <article className="panel mt-6">
          <p className="eyebrow muted">
            {ferrata.region}, {ferrata.country}
          </p>
          <h1 className="mt-4">{ferrata.name}</h1>
          <dl className="details">
            <div>
              <dt>Difficulty</dt>
              <dd>{ferrata.difficulty}</dd>
            </div>
            <div>
              <dt>Length</dt>
              <dd>{ferrata.lengthM} m</dd>
            </div>
            {ferrata.elevationGainM !== undefined && (
              <div>
                <dt>Elevation gain</dt>
                <dd>{ferrata.elevationGainM} m</dd>
              </div>
            )}
          </dl>
          <p>{ferrata.description}</p>
          <a
            href={ferrata.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 underline"
          >
            Official route information <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <section className="divider" aria-labelledby="progress-title">
            <h2 id="progress-title">Your progress</h2>
            {isAuthLoading ? (
              <p role="status" className="muted mt-4">
                Checking your account…
              </p>
            ) : user ? (
              <CompletionForm
                key={`${user.uid}:${ferrata.id}`}
                userId={user.uid}
                ferrataId={ferrata.id}
                ferrataName={ferrata.name}
              />
            ) : (
              <p className="muted mt-4">
                <Link to="/auth">Log in</Link> to track this ferrata.
              </p>
            )}
          </section>
        </article>
      )}
    </div>
  );
}
