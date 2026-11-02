/**
 * Demo in-memory inbox for contact form submissions, shown in the admin panel.
 * TODO(contact API): persist to Supabase `contact_messages` when the
 * database layer lands.
 */

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

const inbox: ContactMessage[] = [];

export function addInboxMessage(entry: {
  name: string;
  email: string;
  message: string;
}) {
  inbox.unshift({
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    ...entry,
  });
}

export function getInbox(): ContactMessage[] {
  return inbox;
}
