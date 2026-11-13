import { useState } from 'react';

export default function TaskForm({ onSubmit, busy }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || busy) return;

    await onSubmit({
      title: trimmed,
      description: description.trim(),
    });
    setTitle('');
    setDescription('');
    setShowNotes(false);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="composer-row">
        <input
          id="task-title"
          name="title"
          className="composer-title"
          type="text"
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          disabled={busy}
          autoComplete="off"
          aria-label="Task title"
          required
        />
        <button type="submit" className="btn btn-primary" disabled={busy || !title.trim()}>
          {busy ? 'Adding…' : 'Add'}
        </button>
      </div>

      {showNotes || description ? (
        <textarea
          id="task-description"
          name="description"
          className="composer-notes"
          placeholder="Notes (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          rows={2}
          disabled={busy}
          aria-label="Task notes"
        />
      ) : (
        <button
          type="button"
          className="text-btn notes-toggle"
          onClick={() => setShowNotes(true)}
          disabled={busy}
        >
          + Add notes
        </button>
      )}
    </form>
  );
}
