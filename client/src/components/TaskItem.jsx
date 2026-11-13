import { useState } from 'react';

function formatWhen(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TaskItem({ task, onToggle, onUpdate, onDelete, busyId }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const busy = busyId === task._id;

  function startEdit() {
    setTitle(task.title);
    setDescription(task.description || '');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setTitle(task.title);
    setDescription(task.description || '');
  }

  async function saveEdit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || busy) return;
    await onUpdate(task._id, {
      title: trimmed,
      description: description.trim(),
    });
    setEditing(false);
  }

  async function handleDelete() {
    if (busy) return;
    const ok = window.confirm(`Delete “${task.title}”?`);
    if (!ok) return;
    await onDelete(task._id);
  }

  if (editing) {
    return (
      <li className={`task-item is-editing${busy ? ' is-busy' : ''}`}>
        <form className="edit-form" onSubmit={saveEdit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            disabled={busy}
            aria-label="Edit title"
            autoFocus
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={2}
            disabled={busy}
            aria-label="Edit description"
            placeholder="Notes"
          />
          <div className="edit-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !title.trim()}>
              Save
            </button>
            <button type="button" className="text-btn" onClick={cancelEdit} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={`task-item${task.completed ? ' is-done' : ''}${busy ? ' is-busy' : ''}`}>
      <label className="check">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          disabled={busy}
          aria-label={`Mark “${task.title}” as ${task.completed ? 'open' : 'done'}`}
        />
        <span className="check-box" aria-hidden="true" />
      </label>

      <div className="task-body">
        <div className="task-main">
          <p className="task-title">{task.title}</p>
          <time className="task-meta" dateTime={task.createdAt}>
            {formatWhen(task.createdAt)}
          </time>
        </div>
        {task.description ? <p className="task-desc">{task.description}</p> : null}
      </div>

      <div className="task-actions">
        <button type="button" className="icon-btn" onClick={startEdit} disabled={busy} title="Edit">
          Edit
        </button>
        <button
          type="button"
          className="icon-btn icon-btn-danger"
          onClick={handleDelete}
          disabled={busy}
          title="Delete"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
