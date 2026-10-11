import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseFerrata } from "@/lib/validation";
import type { Ferrata } from "@/types/ferrata";

export async function getFerratas(): Promise<Ferrata[]> {
  const snapshot = await getDocs(collection(db, "ferratas"));
  return snapshot.docs.map((item) => parseFerrata(item.id, item.data()));
}

export async function getFerrataById(id: string): Promise<Ferrata | null> {
  const snapshot = await getDoc(doc(db, "ferratas", id));
  return snapshot.exists() ? parseFerrata(snapshot.id, snapshot.data()) : null;
}
