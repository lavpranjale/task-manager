import TaskItem from './TaskItem';

export default function TaskList({
  tasks,
  loading,
  filter,
  onToggle,
  onUpdate,
  onDelete,
  busyId,
}) {
  if (loading) {
    return (
      <div className="state-panel" role="status">
        <div className="spinner" aria-hidden="true" />
        <p>Loading tasks…</p>
      </div>
    );
  }

  if (!tasks.length) {
    const title =
      filter === 'completed'
        ? 'Nothing completed yet'
        : filter === 'active'
          ? 'Inbox zero'
          : 'No tasks yet';
    const copy =
      filter === 'completed'
        ? 'Mark something done and it will show up here.'
        : filter === 'active'
          ? 'Everything on this board is finished.'
          : 'Use the composer above to capture the first item.';

    return (
      <div className="state-panel is-empty">
        <div className="empty-mark" aria-hidden="true" />
        <p className="empty-title">{title}</p>
        <p className="empty-copy">{copy}</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          busyId={busyId}
        />
      ))}
    </ul>
  );
}
