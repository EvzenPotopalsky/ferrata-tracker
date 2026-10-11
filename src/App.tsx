import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getFerratas } from "@/services/ferrataService";
import { usePageTitle } from "@/lib/usePageTitle";
import type { Ferrata } from "@/types/ferrata";

export default function App() {
  const [ferratas, setFerratas] = useState<Ferrata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortOption, setSortOption] = useState("name");
  usePageTitle("Explore ferratas");

  useEffect(() => {
    let isActive = true;
    async function loadFerratas() {
      try {
        const data = await getFerratas();
        if (isActive) setFerratas(data);
      } catch {
        if (isActive)
          setError(
            "We couldn't load the ferratas. Please refresh to try again.",
          );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    loadFerratas();
    return () => {
      isActive = false;
    };
  }, []);

  const difficulties = [
    ...new Set(
      [...ferratas]
        .sort((a, b) => a.difficultyRank - b.difficultyRank)
        .map((ferrata) => ferrata.difficulty),
    ),
  ];
  const filteredFerratas = ferratas.filter(
    (ferrata) =>
      selectedDifficulty === "all" || ferrata.difficulty === selectedDifficulty,
  );
  const sortedFerratas = [...filteredFerratas].sort((a, b) => {
    if (sortOption === "difficulty-asc") {
      return (
        a.difficultyRank - b.difficultyRank || a.name.localeCompare(b.name)
      );
    }
    if (sortOption === "difficulty-desc") {
      return (
        b.difficultyRank - a.difficultyRank || a.name.localeCompare(b.name)
      );
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <section className="hero" aria-labelledby="explore-title">
        <p className="eyebrow">Your trail journal</p>
        <h1 id="explore-title">One climb at a time.</h1>
        <p>
          Discover via ferratas and keep a record of the routes, places and
          moments along the way.
        </p>
        <svg
          className="hero-art"
          viewBox="0 0 300 160"
          aria-hidden="true"
          fill="none"
        >
          <path
            d="M0 160 100 10 190 145 235 70 300 160M60 70l40 25 30-40"
            stroke="currentColor"
            strokeWidth="3"
          />
        </svg>
      </section>
      <section className="section" aria-labelledby="catalog-title">
        <h2 id="catalog-title">Explore ferratas</h2>
        {isLoading && (
          <p role="status" className="muted mt-4">
            Loading ferratas…
          </p>
        )}
        {error && (
          <p role="alert" className="error mt-4">
            {error}
          </p>
        )}
        {!isLoading && !error && ferratas.length === 0 && (
          <p className="muted mt-4">No ferratas have been added yet.</p>
        )}
        {!isLoading && !error && ferratas.length > 0 && (
          <>
            <div className="filters">
              <div>
                <label htmlFor="difficulty-filter">Difficulty</label>
                <select
                  id="difficulty-filter"
                  value={selectedDifficulty}
                  onChange={(event) =>
                    setSelectedDifficulty(event.target.value)
                  }
                >
                  <option value="all">All difficulties</option>
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sort-option">Sort by</label>
                <select
                  id="sort-option"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value)}
                >
                  <option value="name">Name A–Z</option>
                  <option value="difficulty-asc">Easiest first</option>
                  <option value="difficulty-desc">Hardest first</option>
                </select>
              </div>
            </div>
            <p role="status" className="hint mt-4">
              {sortedFerratas.length}{" "}
              {sortedFerratas.length === 1 ? "route" : "routes"} found
            </p>
            {sortedFerratas.length === 0 ? (
              <p className="muted mt-4">No ferratas match this difficulty.</p>
            ) : (
              <ul className="route-grid">
                {sortedFerratas.map((ferrata) => (
                  <li key={ferrata.id}>
                    <Link
                      to={`/ferratas/${encodeURIComponent(ferrata.id)}`}
                      className="route-card h-full"
                      aria-label={ferrata.name}
                    >
                      <span className="badge">Grade {ferrata.difficulty}</span>
                      <h3 className="mt-4">{ferrata.name}</h3>
                      <p className="muted text-sm">
                        {ferrata.region}, {ferrata.country}
                      </p>
                      <p className="text-sm">{ferrata.description}</p>
                      <p className="muted text-sm">
                        {ferrata.lengthM} m · View route{" "}
                        <span aria-hidden="true">→</span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </>
  );
}
