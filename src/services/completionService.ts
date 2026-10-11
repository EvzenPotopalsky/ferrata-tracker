import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseCompletion, validateCompletion } from "@/lib/validation";
import type { FerrataCompletion } from "@/types/completion";

export async function getUserCompletions(
  userId: string,
): Promise<FerrataCompletion[]> {
  const snapshot = await getDocs(
    collection(db, "users", userId, "completedFerratas"),
  );
  return snapshot.docs.map((item) => parseCompletion(item.id, item.data()));
}

export async function getUserCompletion(
  userId: string,
  ferrataId: string,
): Promise<FerrataCompletion | null> {
  const snapshot = await getDoc(
    doc(db, "users", userId, "completedFerratas", ferrataId),
  );
  return snapshot.exists()
    ? parseCompletion(snapshot.id, snapshot.data())
    : null;
}

export async function saveFerrataCompletion(
  userId: string,
  completion: FerrataCompletion,
): Promise<void> {
  const error = validateCompletion(completion.completedAt, completion.note);
  if (error) throw new Error(error);
  const completionRef = doc(
    db,
    "users",
    userId,
    "completedFerratas",
    completion.ferrataId,
  );
  await setDoc(completionRef, {
    completedAt: completion.completedAt,
    note: completion.note.trim(),
  });
}

export async function deleteFerrataCompletion(
  userId: string,
  ferrataId: string,
): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "completedFerratas", ferrataId));
}
