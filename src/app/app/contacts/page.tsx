"use client";
import { useState } from "react";
import { Mail, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { useCollection } from "@/lib/useCollection";
import type { Contact } from "@/lib/constants";
import {
  Button,
  Card,
  EmptyState,
  Input,
  SectionTitle,
} from "@/components/app/ui";

export default function ContactsPage() {
  const { items, loading, create, update, remove } =
    useCollection<Contact>("/api/contacts");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div>
      <SectionTitle
        kicker="People & numbers"
        right={
          <Button variant="soft" onClick={() => setAdding((v) => !v)}>
            <Plus size={15} /> Add contact
          </Button>
        }
      >
        Contacts
      </SectionTitle>

      {adding && (
        <ContactEditor
          onCancel={() => setAdding(false)}
          onSave={async (data) => {
            await create(data);
            setAdding(false);
          }}
        />
      )}

      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : items.length === 0 ? (
        <EmptyState>No contacts yet.</EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((c) =>
            editingId === c.id ? (
              <ContactEditor
                key={c.id}
                contact={c}
                onCancel={() => setEditingId(null)}
                onSave={async (data) => {
                  await update(c.id, data);
                  setEditingId(null);
                }}
              />
            ) : (
              <Card key={c.id} className="group p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-serif text-lg text-walnut">{c.name}</div>
                    {c.role && (
                      <div className="text-xs text-dust">{c.role}</div>
                    )}
                  </div>
                  <div className="flex opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => setEditingId(c.id)}
                      className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="cursor-pointer p-1.5 text-walnut/40 hover:text-terracotta"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone.replace(/[^0-9+]/g, "")}`}
                      className="flex items-center gap-2 text-sm text-walnut hover:text-terracotta"
                    >
                      <Phone size={14} className="text-moss" />
                      {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-2 text-sm text-walnut hover:text-terracotta"
                    >
                      <Mail size={14} className="text-moss" />
                      {c.email}
                    </a>
                  )}
                  {c.notes && (
                    <p className="pt-1 text-xs leading-relaxed text-walnut/60">
                      {c.notes}
                    </p>
                  )}
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function ContactEditor({
  contact,
  onSave,
  onCancel,
}: {
  contact?: Contact;
  onSave: (data: Partial<Contact>) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(contact?.name ?? "");
  const [role, setRole] = useState(contact?.role ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");

  async function save() {
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      role: role.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
    });
  }

  return (
    <Card className="mb-4 space-y-2.5 bg-linen/40 p-4 sm:col-span-2">
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <button
          onClick={onCancel}
          className="cursor-pointer p-1.5 text-walnut/40 hover:text-walnut"
        >
          <X size={16} />
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      </div>
      <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!name.trim()}>
          {contact ? "Save" : "Add"}
        </Button>
      </div>
    </Card>
  );
}
