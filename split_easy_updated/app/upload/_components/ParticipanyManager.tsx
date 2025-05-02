// ParticipantManager.tsx
import React, { useState } from "react";
import { X, Plus, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type Participant = {
  id: string;
  name: string;
};

export type ParticipantManagerProps = {
  participants: Participant[];
  setParticipants: (ps: Participant[]) => void;
};

export default function ParticipantManager({
  participants,
  setParticipants,
}: ParticipantManagerProps) {
  const [newParticipantName, setNewParticipantName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const createUniqueId = () => Math.random().toString(36).substring(2, 9);

  const addParticipant = () => {
    const name = newParticipantName.trim();
    if (name) {
      setParticipants([...participants, { id: createUniqueId(), name }]);
      setNewParticipantName("");
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const startEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (name) {
      setParticipants(
        participants.map((p) => (p.id === editingId ? { ...p, name } : p))
      );
    }
    setEditingId(null);
    setEditingName("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Participants</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
          >
            {editingId === p.id ? (
              <>
                <Input
                  //   size="sm"
                  className="w-24"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                <Button
                  size="sm"
                  onClick={saveEdit}
                  disabled={!editingName.trim()}
                >
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span>{p.name}</span>
                <button
                  onClick={() => startEdit(p)}
                  className="ml-2 h-4 w-4 hover:bg-muted flex items-center justify-center rounded-full"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => removeParticipant(p.id)}
                  className="ml-1 h-4 w-4 hover:bg-muted flex items-center justify-center rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="New name…"
          value={newParticipantName}
          onChange={(e) => setNewParticipantName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addParticipant();
          }}
        />
        <Button onClick={addParticipant}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
