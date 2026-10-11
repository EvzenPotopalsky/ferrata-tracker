import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/auth";
import { getUserCompletions } from "@/services/completionService";
import { getFerratas } from "@/services/ferrataService";
import { summarizeProgress } from "@/lib/progress";
import { usePageTitle } from "@/lib/usePageTitle";
import type { FerrataCompletion } from "@/types/completion";
import type { Ferrata } from "@/types/ferrata";

export default function ProgressPage() {
  const { user, isAuthLoading } = useAuth();
  const [completions, setCompletions] = useState<FerrataCompletion[]>([]);
  const [ferratas, setFerratas] = useState<Ferrata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.uid;
  usePageTitle("My progress");

  useEffect(() => {
    if (isAuthLoading || !userId) return;
    let isActive = true;
    async function loadProgress(id: string) {
      try {
        const [records, catalog] = await Promise.all([
          getUserCompletions(id),
          getFerratas(),
        ]);
        if (isActive) {
          setCompletions(records);
          setFerratas(catalog);
        }
      } catch {
        if (isActive)
          setError(
            "We couldn't load your progress. Please refresh to try again.",
          );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    loadProgress(userId);
    return () => {
      isActive = false;
    };
  }, [userId, isAuthLoading]);

  const {
    completedFerratas,
    countryCounts,
    difficultyCounts,
    difficultyRanks,
  } = summarizeProgress(completions, ferratas);
  const unavailableCount = completedFerratas.filter(
    (item) => !item.ferrata,
  ).length;

  return (
    <>
      <section className="hero" aria-labelledby="journal-title">
        <p className="eyebrow">Your trail journal</p>
        <h1 id="journal-title">My progress</h1>
        <p>
          A look back at the routes you've climbed and the places you've
          explored.
        </p>
      </section>
      {isAuthLoading ? (
        <p role="status" className="muted section">
          Checking your account…
        </p>
      ) : !user ? (
        <div className="panel section">
          <h2>Your journal starts here.</h2>
          <p className="muted mt-3">Log in to see your completed ferratas.</p>
          <Link to="/auth" className="button mt-4">
            Log in
          </Link>
        </div>
      ) : isLoading ? (
        <p role="status" className="muted section">
          Loading your progress…
        </p>
      ) : error ? (
        <p role="alert" className="error section">
          {error}
        </p>
      ) : (
        <>
          <dl className="stats section">
            <div className="panel">
              <dt className="muted">Completed ferratas</dt>
              <dd>{completions.length}</dd>
            </div>
            <div className="panel">
              <dt className="muted">Countries visited</dt>
              <dd>{Object.keys(countryCounts).length}</dd>
            </div>
            <div className="panel">
              <dt className="muted">Difficulties tried</dt>
              <dd>{Object.keys(difficultyCounts).length}</dd>
            </div>
          </dl>
          {unavailableCount > 0 && (
            <p className="hint mt-4">
              {unavailableCount} completed{" "}
              {unavailableCount === 1 ? "route is" : "routes are"} no longer in
              the catalog. Your total includes them; country and difficulty
              counts use available route details.
            </p>
          )}
          <div className="breakdowns section">
            <section aria-labelledby="country-title">
              <h2 id="country-title">By country</h2>
              {Object.keys(countryCounts).length === 0 ? (
                <p className="muted mt-3">No country totals yet.</p>
              ) : (
                <ul className="count-list">
                  {Object.entries(countryCounts)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([country, count]) => (
                      <li key={country}>
                        <span>{country}</span>
                        <span>{count}</span>
                      </li>
                    ))}
                </ul>
              )}
            </section>
            <section aria-labelledby="difficulty-title">
              <h2 id="difficulty-title">By difficulty</h2>
              {Object.keys(difficultyCounts).length === 0 ? (
                <p className="muted mt-3">No difficulty totals yet.</p>
              ) : (
                <ul className="count-list">
                  {Object.entries(difficultyCounts)
                    .sort(
                      ([a], [b]) =>
                        difficultyRanks[a] - difficultyRanks[b] ||
                        a.localeCompare(b),
                    )
                    .map(([difficulty, count]) => (
                      <li key={difficulty}>
                        <span>Grade {difficulty}</span>
                        <span>{count}</span>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </div>
          <section className="section" aria-labelledby="completed-title">
            <h2 id="completed-title">Completed ferratas</h2>
            <p className="muted mt-2">Your latest climbs first.</p>
            {completions.length === 0 ? (
              <div className="panel mt-4">
                <p>You haven't marked any ferratas as completed yet.</p>
                <Link to="/" className="button mt-4">
                  Explore ferratas
                </Link>
              </div>
            ) : (
              <ul className="route-grid">
                {completedFerratas.map(({ completion, ferrata }) => (
                  <li key={completion.ferrataId} className="panel">
                    <h3>{ferrata?.name ?? "Route no longer available"}</h3>
                    {ferrata && (
                      <>
                        <p className="muted mt-2">
                          {ferrata.region}, {ferrata.country}
                        </p>
                        <span className="badge mt-3">
                          Grade {ferrata.difficulty}
                        </span>
                      </>
                    )}
                    <p className="mt-3">
                      Completed on{" "}
                      <time dateTime={completion.completedAt}>
                        {new Date(
                          `${completion.completedAt}T00:00:00`,
                        ).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    </p>
                    {completion.note && (
                      <p className="muted mt-3 whitespace-pre-wrap">
                        {completion.note}
                      </p>
                    )}
                    {ferrata && (
                      <Link
                        to={`/ferratas/${encodeURIComponent(ferrata.id)}`}
                        className="inline-block mt-4 underline"
                      >
                        View route
                        <span className="sr-only">: {ferrata.name}</span>{" "}
                        <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}
