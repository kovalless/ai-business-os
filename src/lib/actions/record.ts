import { desc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db/client";
import { businessMembers, documentLinks, documents, notes } from "@/lib/db/schema";
import { formatShortDate } from "@/lib/utils";

export type WorkspaceDoc = {
  id: string;
  title: string;
  kind: "document" | "playbook" | "meeting" | "process";
  updated: string;
  owner: string;
  body: string;
  pinned: boolean;
  links: string[];
};

export type WorkspaceNote = {
  id: string;
  title: string;
  kind: "process" | "supplier" | "pricing" | "decision" | "person";
  updated: string;
  body: string;
  usedBy?: string;
  byMachine: boolean;
};

// One function, not two separate listDocuments/listNotes: resolving
// document_links to display titles (replacing the mock Doc.links:
// string[] of titles) genuinely needs both documents and notes fetched
// together, since a link can point at either. Splitting this into
// separate exports would just mean re-fetching one of them internally.
//
// Wrapped in cache() — called from both the root layout (Aperture's
// search index needs the notes) and this room's own page.
export const getKnowledgeBase = cache(async (businessId: string): Promise<{ documents: WorkspaceDoc[]; notes: WorkspaceNote[] }> => {
  const [documentRows, noteRows] = await Promise.all([
    db
      .select({
        id: documents.id,
        title: documents.title,
        kind: documents.kind,
        updatedAt: documents.updatedAt,
        body: documents.body,
        pinned: documents.pinned,
        ownerName: businessMembers.displayName,
      })
      .from(documents)
      .leftJoin(businessMembers, eq(businessMembers.id, documents.ownerMemberId))
      .where(eq(documents.businessId, businessId))
      .orderBy(desc(documents.updatedAt)),
    db.select().from(notes).where(eq(notes.businessId, businessId)).orderBy(desc(notes.updatedAt)),
  ]);

  const docTitleById = new Map(documentRows.map((d) => [d.id, d.title]));
  const noteTitleById = new Map(noteRows.map((n) => [n.id, n.title]));

  const docIds = documentRows.map((d) => d.id);
  const linkRows = docIds.length
    ? await db.select().from(documentLinks).where(inArray(documentLinks.documentId, docIds))
    : [];

  const linksByDocId = new Map<string, string[]>();
  for (const link of linkRows) {
    const title = link.linkedNoteId
      ? noteTitleById.get(link.linkedNoteId)
      : link.linkedDocumentId
        ? docTitleById.get(link.linkedDocumentId)
        : undefined;
    if (!title) continue;
    const existing = linksByDocId.get(link.documentId) ?? [];
    existing.push(title);
    linksByDocId.set(link.documentId, existing);
  }

  const documentsOut: WorkspaceDoc[] = documentRows.map((d) => ({
    id: d.id,
    title: d.title,
    kind: d.kind,
    updated: formatShortDate(d.updatedAt),
    owner: d.ownerName ?? "",
    body: d.body,
    pinned: d.pinned,
    links: linksByDocId.get(d.id) ?? [],
  }));

  const notesOut: WorkspaceNote[] = noteRows.map((n) => ({
    id: n.id,
    title: n.title,
    kind: n.kind,
    updated: formatShortDate(n.updatedAt),
    body: n.body,
    usedBy: n.usedBy ?? undefined,
    byMachine: n.byMachine,
  }));

  return { documents: documentsOut, notes: notesOut };
});
