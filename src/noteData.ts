export type Note = { id: string; body: string; next: string; createdAt: number };

export function decodeNotes(value: string | null): Note[] {
  if (value === null) return [];

  const notes: unknown = JSON.parse(value);
  if (!Array.isArray(notes) || !notes.every((note) =>
    note && typeof note.id === 'string' && typeof note.body === 'string' &&
    typeof note.next === 'string' && Number.isFinite(note.createdAt)
  )) {
    throw new Error('Invalid note data');
  }

  return notes;
}
