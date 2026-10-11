import { useEffect, useRef, useState, type SubmitEvent } from "react";
import {
  deleteFerrataCompletion,
  getUserCompletion,
  saveFerrataCompletion,
} from "@/services/completionService";
import {
  MAX_NOTE_LENGTH,
  todayLocal,
  validateCompletion,
} from "@/lib/validation";
import type { FerrataCompletion } from "@/types/completion";

type CompletionFormProps = {
  userId: string;
  ferrataId: string;
  ferrataName: string;
};

export default function CompletionForm({
  userId,
  ferrataId,
  ferrataName,
}: CompletionFormProps) {
  const [completion, setCompletion] = useState<FerrataCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completedAt, setCompletedAt] = useState("");
  const [note, setNote] = useState("");
  const [action, setAction] = useState<"save" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const isBusy = action !== null;

  useEffect(() => {
    let isActive = true;
    async function loadCompletion() {
      try {
        const record = await getUserCompletion(userId, ferrataId);
        if (isActive) {
          setCompletion(record);
          setCompletedAt(record?.completedAt ?? "");
          setNote(record?.note ?? "");
        }
      } catch {
        if (isActive)
          setLoadError(
            "We couldn't load your progress. Please refresh to try again.",
          );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    loadCompletion();
    return () => {
      isActive = false;
    };
  }, [userId, ferrataId]);

  function clearFeedback() {
    setError(null);
    setMessage("");
  }

  async function handleSave(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;
    clearFeedback();
    const validationError = validateCompletion(completedAt, note);
    if (validationError) {
      setError(validationError);
      return;
    }

    const record = { ferrataId, completedAt, note: note.trim() };
    setAction("save");
    try {
      await saveFerrataCompletion(userId, record);
      setCompletion(record);
      setNote(record.note);
      setMessage("Your completion has been saved.");
    } catch {
      setError(
        "We couldn't save your completion. Your changes are still here; please try again.",
      );
    } finally {
      setAction(null);
    }
  }

  async function handleDelete() {
    if (isBusy || !completion) return;
    if (!window.confirm(`Remove your completion record for ${ferrataName}?`))
      return;
    clearFeedback();
    setAction("delete");
    try {
      await deleteFerrataCompletion(userId, ferrataId);
      setCompletion(null);
      setCompletedAt("");
      setNote("");
      setMessage("Your completion has been removed.");
      dateRef.current?.focus();
    } catch {
      setError("We couldn't remove your completion. Please try again.");
    } finally {
      setAction(null);
    }
  }

  if (isLoading)
    return (
      <p role="status" className="muted mt-4">
        Loading your progress…
      </p>
    );
  if (loadError)
    return (
      <p role="alert" className="error mt-4">
        {loadError}
      </p>
    );

  return (
    <form
      onSubmit={handleSave}
      className="form-stack mt-4"
      aria-label="Ferrata completion"
    >
      <p className="muted">
        {completion
          ? "Completed. You can update your date or note below."
          : "Climbed this route? Add it to your journal."}
      </p>
      <div>
        <label htmlFor="completed-at">Date completed (required)</label>
        <input
          ref={dateRef}
          id="completed-at"
          name="completedAt"
          type="date"
          required
          max={todayLocal()}
          value={completedAt}
          readOnly={isBusy}
          aria-describedby="date-hint"
          onChange={(event) => {
            setCompletedAt(event.target.value);
            clearFeedback();
          }}
        />
        <p id="date-hint" className="hint">
          Choose today or an earlier date.
        </p>
      </div>
      <div>
        <label htmlFor="completion-note">
          Note <span className="muted">(optional)</span>
        </label>
        <textarea
          id="completion-note"
          name="note"
          rows={3}
          maxLength={MAX_NOTE_LENGTH}
          value={note}
          readOnly={isBusy}
          aria-describedby="note-hint"
          placeholder="How was the route?"
          onChange={(event) => {
            setNote(event.target.value);
            clearFeedback();
          }}
        />
        <p id="note-hint" className="hint">
          Only visible to your account. Up to {MAX_NOTE_LENGTH} characters.
        </p>
      </div>
      <p role="alert" className="error feedback">
        {error}
      </p>
      <p role="status" className="success feedback">
        {isBusy
          ? action === "save"
            ? "Saving completion…"
            : "Removing completion…"
          : message}
      </p>
      <div className="actions">
        <button type="submit" disabled={isBusy} className="button">
          {action === "save"
            ? "Saving…"
            : completion
              ? "Update completion"
              : "Mark as completed"}
        </button>
        {completion && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            className="button button-danger"
          >
            {action === "delete" ? "Removing…" : "Remove completion"}
          </button>
        )}
      </div>
    </form>
  );
}
