const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// In-memory task store: { id, title, owner }
const tasks = [];

exports.createTask = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  if (!title) return next(new AppError('Title is required', 400));
  const task = { id: `${Date.now()}`, title, owner: req.user.id };
  tasks.push(task);
  res.status(201).json({ status: 'success', data: { task } });
});

exports.getTasks = catchAsync(async (req, res) => {
  const userTasks = tasks.filter(t => t.owner === req.user.id);
  res.json({ status: 'success', results: userTasks.length, data: { tasks: userTasks } });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return next(new AppError('Task not found', 404));
  if (tasks[idx].owner !== req.user.id) return next(new AppError('Not authorized to delete this task', 403));
  tasks.splice(idx, 1);
  res.status(204).json({ status: 'success', data: null });
});

exports._tasks = tasks;
