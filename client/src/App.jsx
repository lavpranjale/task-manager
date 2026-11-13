import { useCallback, useEffect, useMemo, useState } from 'react';
import { createTask, deleteTask, fetchTasks, updateTask } from './api/tasks';
import ConfirmModal from './components/ConfirmModal';
import FilterBar from './components/FilterBar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './styles.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadTasks = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchTasks('all');
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Could not load tasks');
      if (!silent) setTasks([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const counts = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    return {
      all: tasks.length,
      active: tasks.length - completed,
      completed,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.completed);
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  const summary = useMemo(() => {
    if (!tasks.length) return 'No tasks yet';
    return `${counts.active} open · ${counts.completed} done`;
  }, [tasks.length, counts]);

  async function handleCreate(payload) {
    setCreating(true);
    setError('');
    try {
      await createTask(payload);
      if (filter === 'completed') setFilter('all');
      await loadTasks({ silent: true });
    } catch (err) {
      setError(err.message || 'Could not create task');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(task) {
    setBusyId(task._id);
    setError('');
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await updateTask(task._id, { completed: !task.completed });
    } catch (err) {
      setTasks(previous);
      setError(err.message || 'Could not update task');
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpdate(id, updates) {
    setBusyId(id);
    setError('');
    try {
      await updateTask(id, updates);
      await loadTasks({ silent: true });
    } catch (err) {
      setError(err.message || 'Could not save changes');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete._id;
    const previous = tasks;

    setDeleting(true);
    setError('');
    // Remove immediately so empty state appears without a loading flash.
    setTasks((prev) => prev.filter((t) => t._id !== id));
    setPendingDelete(null);

    try {
      await deleteTask(id);
    } catch (err) {
      setTasks(previous);
      setError(err.message || 'Could not delete task');
    } finally {
      setDeleting(false);
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <div className="backdrop" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand">Taskflow</p>
            <p className="brand-sub">Personal task board</p>
          </div>
        </div>
        <p className="summary" aria-live="polite">{summary}</p>
      </header>

      <main className="shell">
        <section className="composer" aria-label="Create task">
          <TaskForm onSubmit={handleCreate} busy={creating} />
        </section>

        <section className="board" aria-label="Task list">
          <div className="board-header">
            <FilterBar value={filter} onChange={setFilter} counts={counts} />
            <button
              type="button"
              className="text-btn"
              onClick={() => loadTasks()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {error ? (
            <div className="banner banner-error" role="alert">
              <span>{error}</span>
              <button type="button" className="text-btn" onClick={() => loadTasks()}>
                Retry
              </button>
            </div>
          ) : null}

          <TaskList
            tasks={visibleTasks}
            loading={loading}
            filter={filter}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onRequestDelete={setPendingDelete}
            busyId={busyId}
          />
        </section>
      </main>

      <footer className="footer">
        <span>Built with React, Express, and MongoDB</span>
      </footer>

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete this task?"
        message={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed permanently. This can’t be undone.`
            : ''
        }
        confirmLabel="Delete task"
        busy={deleting}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
