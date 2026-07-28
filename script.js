/**
 * TO-DO APP - PREMIUM PRODUCTIVITY SUITE ENGINE
 * Core Vanilla JavaScript Application Module (ES6+)
 */

'use strict';

/* ==========================================================================
   1. APPLICATION STATE & STORAGE ENGINE
   ========================================================================== */
const STORAGE_KEYS = {
  TASKS: 'todo_tasks_v1',
  CATEGORIES: 'todo_categories_v1',
  PREFERENCES: 'todo_preferences_v1',
  ACTIVITIES: 'todo_activities_v1'
};

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Study', 'Shopping', 'Fitness'];

const SAMPLE_TASKS = [
  {
    id: 'task-101',
    title: '🚀 Launch To-Do App Specs',
    description: 'Finalize glassmorphism & neumorphism design system, verify mobile layout breakpoints, and test local storage sync.',
    priority: 'Urgent',
    category: 'Work',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    recurring: 'none',
    tags: ['sprint', 'design', 'v1.0'],
    colorLabel: '#8b5cf6',
    estimatedTime: 60,
    notes: 'Key focus areas: dark theme transitions and canvas charts.',
    subtasks: [
      { id: 'sub-1', text: 'Design Glassmorphism Cards', completed: true },
      { id: 'sub-2', text: 'Implement Web Audio Chimes', completed: true },
      { id: 'sub-3', text: 'Validate Mobile Bottom Navigation', completed: false }
    ],
    isCompleted: false,
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    isDeleted: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'task-102',
    title: '📚 Review System Architecture & Clean Code Rules',
    description: 'Ensure modular ES6+ functions without external framework dependencies.',
    priority: 'High',
    category: 'Study',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '10:00',
    recurring: 'daily',
    tags: ['architecture', 'javascript'],
    colorLabel: '#3b82f6',
    estimatedTime: 45,
    notes: 'Verify event listeners and keyboard shortcut bindings.',
    subtasks: [
      { id: 'sub-4', text: 'Review Drag and Drop API', completed: true },
      { id: 'sub-5', text: 'Audit Canvas API rendering loop', completed: false }
    ],
    isCompleted: false,
    isPinned: true,
    isFavorite: false,
    isArchived: false,
    isDeleted: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now()
  },
  {
    id: 'task-103',
    title: '🛒 Weekly Fresh Grocery Shopping',
    description: 'Purchase organic fruits, almond milk, proteins, and espresso beans.',
    priority: 'Medium',
    category: 'Shopping',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    dueTime: '17:30',
    recurring: 'weekly',
    tags: ['lifestyle'],
    colorLabel: '#10b981',
    estimatedTime: 30,
    notes: '',
    subtasks: [],
    isCompleted: true,
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    isDeleted: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 7200000,
    completedAt: Date.now() - 7200000
  },
  {
    id: 'task-104',
    title: '🏋️ High-Intensity Interval Training Workout',
    description: '45-minute HIIT cardio and core stability routine.',
    priority: 'Low',
    category: 'Fitness',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '19:00',
    recurring: 'daily',
    tags: ['health', 'fitness'],
    colorLabel: '#f97316',
    estimatedTime: 45,
    notes: 'Hydrate well before and after training session.',
    subtasks: [],
    isCompleted: false,
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isDeleted: false,
    createdAt: Date.now() - 14400000,
    updatedAt: Date.now() - 14400000
  }
];

const MOTIVATION_QUOTES = [
  '"Small daily actions compound into extraordinary achievements."',
  '"Focus on being productive instead of busy."',
  '"Your future is created by what you do today, not tomorrow."',
  '"Done is better than perfect."',
  '"Success is the sum of small efforts repeated day in and day out."'
];

// Centralized Application State
const AppState = {
  tasks: [],
  categories: [],
  preferences: {
    theme: 'dark',
    accent: 'purple',
    fontSize: '15px'
  },
  activities: [],
  
  // UI Transient Filters & Views
  currentFilter: 'all',          // all | today | week | overdue | pinned | favorites | completed | archived | trash
  currentCategory: 'all',
  currentPriorityFilter: 'all',
  sortBy: 'priority',            // priority | dueDate | alphabetical | created | updated
  searchQuery: '',
  layoutView: 'list',            // list | grid
  selectedCalendarDate: null,    // 'YYYY-MM-DD' or null
  selectedTaskId: null,
  lastDeletedTask: null,
  
  // Pomodoro Engine State
  pomodoro: {
    mode: 'work',                // work | break
    workTime: 1500,              // 25 mins
    breakTime: 300,              // 5 mins
    timeLeft: 1500,
    isRunning: false,
    intervalId: null,
    sessionCount: 1
  },

  // Focus Overlay State
  ambientAudioCtx: null,
  ambientOscillator: null,
  isAmbientPlaying: false
};

/* Load state from LocalStorage or populate default sample data */
function initAppState() {
  const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (storedTasks) {
    try {
      AppState.tasks = JSON.parse(storedTasks);
    } catch (e) {
      AppState.tasks = SAMPLE_TASKS;
    }
  } else {
    AppState.tasks = SAMPLE_TASKS;
    saveTasksToStorage();
  }

  const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (storedCategories) {
    try {
      AppState.categories = JSON.parse(storedCategories);
    } catch (e) {
      AppState.categories = DEFAULT_CATEGORIES;
    }
  } else {
    AppState.categories = DEFAULT_CATEGORIES;
    saveCategoriesToStorage();
  }

  const storedPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  if (storedPrefs) {
    try {
      AppState.preferences = { ...AppState.preferences, ...JSON.parse(storedPrefs) };
    } catch (e) {}
  }

  const storedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  if (storedActivities) {
    try {
      AppState.activities = JSON.parse(storedActivities);
    } catch (e) {
      AppState.activities = [];
    }
  }

  applyPreferences();
}

function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(AppState.tasks));
}

function saveCategoriesToStorage() {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(AppState.categories));
}

function savePreferencesToStorage() {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(AppState.preferences));
}

function saveActivitiesToStorage() {
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(AppState.activities));
}

function logActivity(text) {
  const activityItem = {
    id: 'act-' + Date.now(),
    text,
    timestamp: Date.now()
  };
  AppState.activities.unshift(activityItem);
  if (AppState.activities.length > 30) AppState.activities.pop();
  saveActivitiesToStorage();
  renderActivityFeed();
}

/* Apply Theme & Accent Color Preferences */
function applyPreferences() {
  document.documentElement.setAttribute('data-theme', AppState.preferences.theme);
  document.documentElement.setAttribute('data-accent', AppState.preferences.accent);
  document.documentElement.style.fontSize = AppState.preferences.fontSize;

  const themeText = document.getElementById('themeToggleText');
  if (themeText) {
    themeText.textContent = AppState.preferences.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  const segLight = document.getElementById('segThemeLight');
  const segDark = document.getElementById('segThemeDark');
  if (segLight && segDark) {
    segLight.classList.toggle('active', AppState.preferences.theme === 'light');
    segDark.classList.toggle('active', AppState.preferences.theme === 'dark');
  }

  document.querySelectorAll('.accent-swatch').forEach(swatch => {
    swatch.classList.toggle('active', swatch.dataset.accentColor === AppState.preferences.accent);
  });
}

/* ==========================================================================
   2. WEB AUDIO API SOUND & CONFETTI CELEBRATION ENGINE
   ========================================================================== */
function playChimeSound(type = 'success') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'complete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch (e) {
    // Silent catch if audio is blocked
  }
}

function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ec4899', '#f59e0b'];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 14,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360
    });
  }

  let animationFrame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
      if (p.alpha > 0.01) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.alpha -= 0.015;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }
  animate();
}

/* ==========================================================================
   3. TOAST NOTIFICATIONS SYSTEM
   ========================================================================== */
function showToast(message, type = 'info', actionLabel = null, actionCallback = null) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const textSpan = document.createElement('span');
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  if (actionLabel && typeof actionCallback === 'function') {
    const actionBtn = document.createElement('button');
    actionBtn.className = 'toast-undo-btn';
    actionBtn.textContent = actionLabel;
    actionBtn.addEventListener('click', () => {
      actionCallback();
      toast.remove();
    });
    toast.appendChild(actionBtn);
  }

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

/* ==========================================================================
   4. TASK CONTROLLER & CRUD LOGIC
   ========================================================================== */
function getFilteredTasks() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return AppState.tasks.filter(task => {
    // View Category Filter
    if (AppState.currentFilter === 'trash') {
      if (!task.isDeleted) return false;
    } else {
      if (task.isDeleted) return false;
      if (AppState.currentFilter === 'archived' && !task.isArchived) return false;
      if (AppState.currentFilter !== 'archived' && task.isArchived) return false;
    }

    if (AppState.currentFilter === 'today') {
      if (task.dueDate !== todayStr || task.isCompleted) return false;
    } else if (AppState.currentFilter === 'week') {
      if (!task.dueDate || task.isCompleted) return false;
      const taskDate = new Date(task.dueDate);
      const diffDays = (taskDate - now) / (1000 * 3600 * 24);
      if (diffDays < -1 || diffDays > 7) return false;
    } else if (AppState.currentFilter === 'overdue') {
      if (!task.dueDate || task.isCompleted) return false;
      if (task.dueDate >= todayStr) return false;
    } else if (AppState.currentFilter === 'pinned') {
      if (!task.isPinned) return false;
    } else if (AppState.currentFilter === 'favorites') {
      if (!task.isFavorite) return false;
    } else if (AppState.currentFilter === 'completed') {
      if (!task.isCompleted) return false;
    }

    // Category Filter
    if (AppState.currentCategory !== 'all') {
      if (task.category !== AppState.currentCategory) return false;
    }

    // Priority Filter
    if (AppState.currentPriorityFilter !== 'all') {
      if (task.priority !== AppState.currentPriorityFilter) return false;
    }

    // Selected Calendar Date Filter
    if (AppState.selectedCalendarDate) {
      if (task.dueDate !== AppState.selectedCalendarDate) return false;
    }

    // Search Query Filter
    if (AppState.searchQuery.trim() !== '') {
      const q = AppState.searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchCat = task.category.toLowerCase().includes(q);
      const matchTags = task.tags.some(tag => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchCat && !matchTags) return false;
    }

    return true;
  }).sort((a, b) => {
    // Sorting Pipeline
    if (AppState.sortBy === 'priority') {
      const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (AppState.sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (AppState.sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    } else if (AppState.sortBy === 'created') {
      return b.createdAt - a.createdAt;
    } else if (AppState.sortBy === 'updated') {
      return b.updatedAt - a.updatedAt;
    }
    return 0;
  });
}

/* Save / Edit Task from Modal */
function handleSaveTask(event) {
  event.preventDefault();

  const id = document.getElementById('taskIdInput').value;
  const title = document.getElementById('taskTitleInput').value.trim();
  let category = document.getElementById('taskCategorySelect').value;
  if (category === 'Custom') {
    const customVal = document.getElementById('customCategoryInput').value.trim();
    if (customVal) {
      category = customVal;
      if (!AppState.categories.includes(category)) {
        AppState.categories.push(category);
        saveCategoriesToStorage();
        renderCategories();
      }
    } else {
      category = 'Work';
    }
  }

  const priority = document.getElementById('taskPrioritySelect').value;
  const dueDate = document.getElementById('taskDueDateInput').value;
  const dueTime = document.getElementById('taskDueTimeInput').value;
  const recurring = document.getElementById('taskRecurrenceSelect').value;
  const tagsRaw = document.getElementById('taskTagsInput').value;
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
  const estimatedTime = parseInt(document.getElementById('taskEstTimeInput').value) || 0;
  const description = document.getElementById('taskDescriptionInput').value.trim();

  // Active color dot
  const activeColorDot = document.querySelector('.color-dot.active');
  const colorLabel = activeColorDot ? activeColorDot.dataset.color : '#8b5cf6';

  // Subtasks from Modal list
  const modalSubtaskItems = document.querySelectorAll('.modal-subtask-item');
  const subtasks = [];
  modalSubtaskItems.forEach((el, idx) => {
    subtasks.push({
      id: el.dataset.subId || `sub-${Date.now()}-${idx}`,
      text: el.dataset.text,
      completed: el.dataset.completed === 'true'
    });
  });

  if (id) {
    // Update existing task
    const taskIndex = AppState.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      AppState.tasks[taskIndex] = {
        ...AppState.tasks[taskIndex],
        title,
        category,
        priority,
        dueDate,
        dueTime,
        recurring,
        tags,
        colorLabel,
        estimatedTime,
        description,
        subtasks,
        updatedAt: Date.now()
      };
      logActivity(`Updated task "${title}"`);
      showToast('Task updated successfully', 'success');
    }
  } else {
    // Create new task
    const newTask = {
      id: 'task-' + Date.now(),
      title,
      description,
      priority,
      category,
      dueDate,
      dueTime,
      recurring,
      tags,
      colorLabel,
      estimatedTime,
      notes: '',
      subtasks,
      isCompleted: false,
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    AppState.tasks.unshift(newTask);
    logActivity(`Created task "${title}"`);
    showToast('New task added!', 'success');
    playChimeSound('success');
  }

  saveTasksToStorage();
  closeTaskModal();
  renderAll();
}

function toggleTaskComplete(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.isCompleted = !task.isCompleted;
  task.completedAt = task.isCompleted ? Date.now() : null;
  task.updatedAt = Date.now();

  saveTasksToStorage();

  if (task.isCompleted) {
    playChimeSound('complete');
    triggerConfetti();
    logActivity(`Completed task "${task.title}"`);
    showToast(`Task completed! 🎉`, 'success', 'Undo', () => {
      task.isCompleted = false;
      task.completedAt = null;
      saveTasksToStorage();
      renderAll();
    });
  } else {
    logActivity(`Marked "${task.title}" as pending`);
    showToast(`Task marked as pending`, 'info');
  }

  renderAll();
}

function toggleTaskPin(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.isPinned = !task.isPinned;
  task.updatedAt = Date.now();
  saveTasksToStorage();
  showToast(task.isPinned ? 'Task pinned to top' : 'Task unpinned', 'info');
  renderAll();
}

function toggleTaskFavorite(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.isFavorite = !task.isFavorite;
  task.updatedAt = Date.now();
  saveTasksToStorage();
  showToast(task.isFavorite ? 'Added to Favorites' : 'Removed from Favorites', 'info');
  renderAll();
}

function duplicateTask(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const duplicated = {
    ...JSON.parse(JSON.stringify(task)),
    id: 'task-' + Date.now(),
    title: `${task.title} (Copy)`,
    isCompleted: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  AppState.tasks.unshift(duplicated);
  saveTasksToStorage();
  logActivity(`Duplicated task "${task.title}"`);
  showToast('Task duplicated!', 'success');
  renderAll();
}

function archiveTask(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.isArchived = !task.isArchived;
  task.updatedAt = Date.now();
  saveTasksToStorage();
  showToast(task.isArchived ? 'Task moved to Archive' : 'Task restored from Archive', 'info');
  renderAll();
}

function promptDeleteTask(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  AppState.selectedTaskId = taskId;
  document.getElementById('deleteTaskTitle').textContent = `"${task.title}"`;
  const modalSubtext = document.getElementById('deleteModalSubtext');
  
  if (AppState.currentFilter === 'trash' || task.isDeleted) {
    modalSubtext.textContent = 'This task will be permanently deleted.';
  } else {
    modalSubtext.textContent = 'This task will be moved to Trash where it can be restored.';
  }

  document.getElementById('deleteModalOverlay').classList.remove('hidden');
}

function confirmDeleteTask() {
  const taskId = AppState.selectedTaskId;
  if (!taskId) return;

  const index = AppState.tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    const task = AppState.tasks[index];
    if (AppState.currentFilter === 'trash' || task.isDeleted) {
      // Permanent Delete
      AppState.lastDeletedTask = AppState.tasks.splice(index, 1)[0];
      logActivity(`Permanently deleted task "${task.title}"`);
      showToast('Task permanently deleted', 'warning');
    } else {
      // Soft Delete to Trash
      task.isDeleted = true;
      task.updatedAt = Date.now();
      logActivity(`Moved task "${task.title}" to Trash`);
      showToast('Task moved to Trash', 'warning', 'Undo', () => {
        task.isDeleted = false;
        saveTasksToStorage();
        renderAll();
      });
    }
  }

  saveTasksToStorage();
  document.getElementById('deleteModalOverlay').classList.add('hidden');
  AppState.selectedTaskId = null;
  renderAll();
}

function toggleSubtask(taskId, subId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks) return;
  const sub = task.subtasks.find(s => s.id === subId);
  if (!sub) return;

  sub.completed = !sub.completed;
  task.updatedAt = Date.now();
  saveTasksToStorage();
  renderAll();
}

/* ==========================================================================
   5. UI RENDER ENGINE
   ========================================================================== */
function renderAll() {
  renderTasks();
  renderStats();
  renderCategories();
  renderCalendar();
  renderCanvasChart();
  renderActivityFeed();
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  const pinnedList = document.getElementById('pinnedTasksList');
  const mainList = document.getElementById('mainTasksList');
  const pinnedSection = document.getElementById('pinnedSection');
  const emptyState = document.getElementById('emptyState');

  pinnedList.innerHTML = '';
  mainList.innerHTML = '';

  const pinnedTasks = filteredTasks.filter(t => t.isPinned && !t.isCompleted);
  const regularTasks = filteredTasks.filter(t => !t.isPinned || t.isCompleted);

  if (pinnedTasks.length > 0) {
    pinnedSection.classList.remove('hidden');
    pinnedTasks.forEach(task => pinnedList.appendChild(createTaskCardDOM(task)));
  } else {
    pinnedSection.classList.add('hidden');
  }

  if (regularTasks.length > 0) {
    regularTasks.forEach(task => mainList.appendChild(createTaskCardDOM(task)));
  }

  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  // Task Count Text & Title
  document.getElementById('currentTaskCount').textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`;
  
  const filterTitles = {
    all: 'All Tasks',
    today: "Today's Focus",
    week: 'This Week',
    overdue: 'Overdue Tasks',
    pinned: 'Pinned Tasks',
    favorites: 'Favorite Tasks',
    completed: 'Completed Tasks',
    archived: 'Archived Tasks',
    trash: 'Trash Bin'
  };
  document.getElementById('currentViewTitle').textContent = filterTitles[AppState.currentFilter] || 'Tasks';

  // Sidebar Counters
  updateSidebarBadges();
}

function createTaskCardDOM(task) {
  const card = document.createElement('div');
  card.className = `task-card ${task.isCompleted ? 'completed' : ''}`;
  card.dataset.id = task.id;
  card.draggable = true;
  card.style.setProperty('--task-color', task.colorLabel || 'var(--accent)');

  // Drag and Drop Event Listeners
  card.addEventListener('dragstart', handleDragStart);
  card.addEventListener('dragover', handleDragOver);
  card.addEventListener('drop', handleDrop);
  card.addEventListener('dragend', handleDragEnd);

  const isOverdue = task.dueDate && !task.isCompleted && (task.dueDate < new Date().toISOString().split('T')[0]);

  // Priority Pill CSS Mapping
  const priorityClass = task.priority.toLowerCase();

  // Subtask Progress Math
  let subtaskHTML = '';
  if (task.subtasks && task.subtasks.length > 0) {
    const doneCount = task.subtasks.filter(s => s.completed).length;
    const percent = Math.round((doneCount / task.subtasks.length) * 100);
    subtaskHTML = `
      <div class="subtasks-progress-bar" title="${doneCount} of ${task.subtasks.length} subtasks done">
        <div class="subtasks-progress-fill" style="width: ${percent}%;"></div>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="drag-handle" title="Drag to reorder">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
    </div>

    <label class="checkbox-wrapper" title="Toggle task completion">
      <input type="checkbox" ${task.isCompleted ? 'checked' : ''} onchange="toggleTaskComplete('${task.id}')" />
      <span class="checkmark">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke-width="3" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </span>
    </label>

    <div class="task-main">
      <div class="task-header-row">
        <h3 class="task-title">${escapeHTML(task.title)}</h3>
      </div>
      
      ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}

      <div class="task-meta-row">
        <span class="meta-pill priority-pill ${priorityClass}">${getPriorityIcon(task.priority)} ${task.priority}</span>
        <span class="meta-pill cat-pill"><span class="cat-dot" style="background:${task.colorLabel || 'var(--accent)'};"></span>${escapeHTML(task.category)}</span>
        
        ${task.dueDate ? `
          <span class="meta-pill ${isOverdue ? 'overdue-pill' : ''}">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${task.dueDate} ${task.dueTime ? '@ ' + task.dueTime : ''}
          </span>
        ` : ''}

        ${task.tags && task.tags.length ? task.tags.map(t => `<span class="meta-pill tag-pill">#${escapeHTML(t)}</span>`).join('') : ''}
      </div>

      ${subtaskHTML}
    </div>

    <div class="task-actions">
      <button class="action-btn ${task.isPinned ? 'active-pin' : ''}" onclick="toggleTaskPin('${task.id}')" title="Pin task">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14l-1.5-6H6.5z"></path><path d="M9 11V4a3 3 0 0 1 6 0v7"></path></svg>
      </button>
      <button class="action-btn ${task.isFavorite ? 'active-fav' : ''}" onclick="toggleTaskFavorite('${task.id}')" title="Favorite">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </button>
      <button class="action-btn" onclick="openEditTaskModal('${task.id}')" title="Edit Task">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>
      <button class="action-btn" onclick="duplicateTask('${task.id}')" title="Duplicate Task">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button class="action-btn delete-btn" onclick="promptDeleteTask('${task.id}')" title="Delete Task">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `;

  return card;
}

function getPriorityIcon(priority) {
  if (priority === 'Urgent') return '🔥';
  if (priority === 'High') return '⚡';
  if (priority === 'Medium') return '🔹';
  return '🌱';
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* Render Dashboard Hero & Stats */
function renderStats() {
  const activeTasks = AppState.tasks.filter(t => !t.isDeleted && !t.isArchived);
  const total = activeTasks.length;
  const completed = activeTasks.filter(t => t.isCompleted).length;
  const pending = total - completed;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = activeTasks.filter(t => !t.isCompleted && t.dueDate && t.dueDate < todayStr).length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statOverdue').textContent = overdue;

  // Circular Progress Math
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('circularProgressText').textContent = `${percent}%`;
  document.getElementById('progressSubtext').textContent = `${completed} of ${total} tasks done`;
  document.getElementById('sidebarProgressText').textContent = `${percent}% Done Today`;

  const circularPath = document.getElementById('circularProgressPath');
  if (circularPath) {
    circularPath.setAttribute('stroke-dasharray', `${percent}, 100`);
  }
}

function updateSidebarBadges() {
  const activeTasks = AppState.tasks.filter(t => !t.isDeleted && !t.isArchived);
  const todayStr = new Date().toISOString().split('T')[0];

  document.getElementById('badgeAll').textContent = activeTasks.length;
  document.getElementById('badgeToday').textContent = activeTasks.filter(t => t.dueDate === todayStr && !t.isCompleted).length;
  document.getElementById('badgeWeek').textContent = activeTasks.filter(t => t.dueDate && !t.isCompleted).length;
  document.getElementById('badgeOverdue').textContent = activeTasks.filter(t => !t.isCompleted && t.dueDate && t.dueDate < todayStr).length;
  document.getElementById('badgePinned').textContent = activeTasks.filter(t => t.isPinned && !t.isCompleted).length;
  document.getElementById('badgeFavorites').textContent = activeTasks.filter(t => t.isFavorite).length;
  document.getElementById('badgeCompleted').textContent = activeTasks.filter(t => t.isCompleted).length;
  document.getElementById('badgeArchived').textContent = AppState.tasks.filter(t => t.isArchived && !t.isDeleted).length;
  document.getElementById('badgeTrash').textContent = AppState.tasks.filter(t => t.isDeleted).length;
}

function renderCategories() {
  const listContainer = document.getElementById('categoriesList');
  const selectFilter = document.getElementById('categoryFilterSelect');
  if (!listContainer || !selectFilter) return;

  listContainer.innerHTML = '';
  selectFilter.innerHTML = '<option value="all">All Categories</option>';

  const catColors = {
    Work: '#8b5cf6',
    Personal: '#3b82f6',
    Study: '#10b981',
    Shopping: '#f97316',
    Fitness: '#ec4899'
  };

  AppState.categories.forEach(cat => {
    const color = catColors[cat] || '#64748b';

    // Sidebar Category Button
    const btn = document.createElement('button');
    btn.className = `category-pill-btn ${AppState.currentCategory === cat ? 'active' : ''}`;
    btn.innerHTML = `
      <span><span class="cat-dot" style="background:${color};"></span>${escapeHTML(cat)}</span>
    `;
    btn.addEventListener('click', () => {
      AppState.currentCategory = AppState.currentCategory === cat ? 'all' : cat;
      renderCategories();
      renderTasks();
      // Auto close mobile drawer on selection
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('sidebarBackdrop').classList.remove('active');
    });
    listContainer.appendChild(btn);

    // Toolbar Filter Select Option
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (AppState.currentCategory === cat) option.selected = true;
    selectFilter.appendChild(option);
  });
}

/* Dynamic Interactive Calendar */
let currentCalYear = new Date().getFullYear();
let currentCalMonth = new Date().getMonth();

function renderCalendar() {
  const monthYearTitle = document.getElementById('calMonthYearTitle');
  const grid = document.getElementById('calendarDaysGrid');
  if (!monthYearTitle || !grid) return;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  monthYearTitle.textContent = `${monthNames[currentCalMonth]} ${currentCalYear}`;

  grid.innerHTML = '';

  const firstDayIndex = new Date(currentCalYear, currentCalMonth, 1).getDay();
  const lastDay = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
  const prevMonthLastDay = new Date(currentCalYear, currentCalMonth, 0).getDate();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Previous month padding days
  for (let x = firstDayIndex; x > 0; x--) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day other-month';
    dayDiv.textContent = prevMonthLastDay - x + 1;
    grid.appendChild(dayDiv);
  }

  // Current month days
  for (let day = 1; day <= lastDay; day++) {
    const dayDiv = document.createElement('div');
    const monthFormatted = String(currentCalMonth + 1).padStart(2, '0');
    const dayFormatted = String(day).padStart(2, '0');
    const dateStr = `${currentCalYear}-${monthFormatted}-${dayFormatted}`;

    dayDiv.className = 'cal-day';
    if (dateStr === todayStr) dayDiv.classList.add('today');
    if (dateStr === AppState.selectedCalendarDate) dayDiv.classList.add('active-selected');

    dayDiv.textContent = day;

    // Check if tasks exist on this date
    const tasksOnDate = AppState.tasks.filter(t => !t.isDeleted && t.dueDate === dateStr);
    if (tasksOnDate.length > 0) {
      const dot = document.createElement('span');
      dot.className = 'task-dot';
      if (tasksOnDate.some(t => !t.isCompleted && dateStr < todayStr)) {
        dot.classList.add('overdue-dot');
      }
      dayDiv.appendChild(dot);
    }

    dayDiv.addEventListener('click', () => {
      if (AppState.selectedCalendarDate === dateStr) {
        AppState.selectedCalendarDate = null;
        document.getElementById('clearCalendarFilterBtn').style.display = 'none';
      } else {
        AppState.selectedCalendarDate = dateStr;
        document.getElementById('clearCalendarFilterBtn').style.display = 'block';
      }
      renderCalendar();
      renderTasks();
    });

    grid.appendChild(dayDiv);
  }
}

/* Custom HTML5 Canvas Productivity Chart */
function renderCanvasChart() {
  const canvas = document.getElementById('productivityChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.parentElement.clientWidth || 300;
  canvas.height = 160;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = [4, 6, 8, 5, 9, 7, 10]; 
  const maxValue = 12;

  const padding = 25;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const barWidth = (chartWidth / days.length) * 0.45;
  const stepX = chartWidth / days.length;

  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#8b5cf6';

  days.forEach((day, idx) => {
    const val = values[idx];
    const barHeight = (val / maxValue) * chartHeight;
    const x = padding + idx * stepX + stepX / 2 - barWidth / 2;
    const y = canvas.height - padding - barHeight;

    // Draw Bar with rounded top
    const grad = ctx.createLinearGradient(0, y, 0, canvas.height - padding);
    grad.addColorStop(0, accentColor);
    grad.addColorStop(1, 'rgba(139, 92, 246, 0.1)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
    ctx.fill();

    // Draw Day Labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(day, x + barWidth / 2, canvas.height - 8);
  });
}

function renderActivityFeed() {
  const container = document.getElementById('activityTimeline');
  if (!container) return;

  container.innerHTML = '';
  if (AppState.activities.length === 0) {
    container.innerHTML = '<span class="text-muted-sm text-center">No recent activity</span>';
    return;
  }

  AppState.activities.slice(0, 8).forEach(act => {
    const div = document.createElement('div');
    div.className = 'activity-item';
    const timeAgo = formatTimeAgo(act.timestamp);
    div.innerHTML = `
      <span class="act-dot"></span>
      <div class="act-info">
        <span class="act-text">${escapeHTML(act.text)}</span>
        <span class="act-time">${timeAgo}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function formatTimeAgo(timestamp) {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

/* ==========================================================================
   6. DRAG AND DROP HANDLERS
   ========================================================================== */
let draggedTaskId = null;

function handleDragStart(e) {
  draggedTaskId = this.dataset.id;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedTaskId);
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(e) {
  e.preventDefault();
  const targetCard = e.currentTarget;
  const targetId = targetCard.dataset.id;

  if (draggedTaskId && targetId && draggedTaskId !== targetId) {
    const fromIdx = AppState.tasks.findIndex(t => t.id === draggedTaskId);
    const toIdx = AppState.tasks.findIndex(t => t.id === targetId);

    if (fromIdx !== -1 && toIdx !== -1) {
      const [movedTask] = AppState.tasks.splice(fromIdx, 1);
      AppState.tasks.splice(toIdx, 0, movedTask);
      saveTasksToStorage();
      renderTasks();
    }
  }
  return false;
}

function handleDragEnd() {
  this.classList.remove('dragging');
  draggedTaskId = null;
}

/* ==========================================================================
   7. POMODORO TIMER ENGINE & FOCUS MODE
   ========================================================================== */
function updatePomodoroUI() {
  const mins = String(Math.floor(AppState.pomodoro.timeLeft / 60)).padStart(2, '0');
  const secs = String(AppState.pomodoro.timeLeft % 60).padStart(2, '0');
  const timeStr = `${mins}:${secs}`;

  document.getElementById('pomoTimeDisplay').textContent = timeStr;
  document.getElementById('focusClockDisplay').textContent = timeStr;

  const totalTime = AppState.pomodoro.mode === 'work' ? AppState.pomodoro.workTime : AppState.pomodoro.breakTime;
  const progressRatio = AppState.pomodoro.timeLeft / totalTime;
  const strokeOffset = 283 * (1 - progressRatio);

  const circle = document.getElementById('pomoProgressCircle');
  if (circle) circle.setAttribute('stroke-dashoffset', strokeOffset);
}

function startPomodoro() {
  if (AppState.pomodoro.isRunning) {
    clearInterval(AppState.pomodoro.intervalId);
    AppState.pomodoro.isRunning = false;
    document.getElementById('pomoStartBtn').innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    document.getElementById('focusTogglePlayBtn').textContent = 'Resume Session';
  } else {
    AppState.pomodoro.isRunning = true;
    document.getElementById('pomoStartBtn').innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    document.getElementById('focusTogglePlayBtn').textContent = 'Pause Session';

    AppState.pomodoro.intervalId = setInterval(() => {
      if (AppState.pomodoro.timeLeft > 0) {
        AppState.pomodoro.timeLeft--;
        updatePomodoroUI();
      } else {
        clearInterval(AppState.pomodoro.intervalId);
        AppState.pomodoro.isRunning = false;
        playChimeSound('complete');

        if (AppState.pomodoro.mode === 'work') {
          showToast('Pomodoro session completed! Time for a short break.', 'success');
          AppState.pomodoro.mode = 'break';
          AppState.pomodoro.timeLeft = AppState.pomodoro.breakTime;
          AppState.pomodoro.sessionCount++;
          document.getElementById('pomoModeLabel').textContent = 'Short Break';
        } else {
          showToast('Break finished! Ready to focus?', 'info');
          AppState.pomodoro.mode = 'work';
          AppState.pomodoro.timeLeft = AppState.pomodoro.workTime;
          document.getElementById('pomoModeLabel').textContent = 'Work Session';
        }
        document.getElementById('pomodoroSessionBadge').textContent = `Session ${AppState.pomodoro.sessionCount}`;
        updatePomodoroUI();
      }
    }, 1000);
  }
}

function resetPomodoro() {
  clearInterval(AppState.pomodoro.intervalId);
  AppState.pomodoro.isRunning = false;
  AppState.pomodoro.timeLeft = AppState.pomodoro.mode === 'work' ? AppState.pomodoro.workTime : AppState.pomodoro.breakTime;
  document.getElementById('pomoStartBtn').innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
  updatePomodoroUI();
}

function openFocusMode() {
  const activeTask = AppState.tasks.find(t => t.isPinned && !t.isCompleted) || AppState.tasks.find(t => !t.isCompleted);
  document.getElementById('focusTaskTitle').textContent = activeTask ? activeTask.title : 'Deep Work & Concentration';
  document.getElementById('focusOverlay').classList.remove('hidden');
}

/* ==========================================================================
   8. MODAL WINDOWS CONTROLLER
   ========================================================================== */
function openCreateTaskModal() {
  document.getElementById('taskIdInput').value = '';
  document.getElementById('modalTitle').textContent = 'Create New Task';
  document.getElementById('taskForm').reset();
  document.getElementById('modalSubtasksList').innerHTML = '';
  document.getElementById('customCategoryGroup').classList.add('hidden');
  document.getElementById('taskModalOverlay').classList.remove('hidden');
}

function openEditTaskModal(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('taskIdInput').value = task.id;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  document.getElementById('taskTitleInput').value = task.title;
  
  if (DEFAULT_CATEGORIES.includes(task.category)) {
    document.getElementById('taskCategorySelect').value = task.category;
    document.getElementById('customCategoryGroup').classList.add('hidden');
  } else {
    document.getElementById('taskCategorySelect').value = 'Custom';
    document.getElementById('customCategoryGroup').classList.remove('hidden');
    document.getElementById('customCategoryInput').value = task.category;
  }

  document.getElementById('taskPrioritySelect').value = task.priority;
  document.getElementById('taskDueDateInput').value = task.dueDate || '';
  document.getElementById('taskDueTimeInput').value = task.dueTime || '';
  document.getElementById('taskRecurrenceSelect').value = task.recurring || 'none';
  document.getElementById('taskTagsInput').value = task.tags ? task.tags.join(', ') : '';
  document.getElementById('taskEstTimeInput').value = task.estimatedTime || '';
  document.getElementById('taskDescriptionInput').value = task.description || '';

  // Render modal subtasks list
  const subList = document.getElementById('modalSubtasksList');
  subList.innerHTML = '';
  if (task.subtasks) {
    task.subtasks.forEach(sub => {
      subList.appendChild(createModalSubtaskDOM(sub.id, sub.text, sub.completed));
    });
  }

  document.getElementById('taskModalOverlay').classList.remove('hidden');
}

function closeTaskModal() {
  document.getElementById('taskModalOverlay').classList.add('hidden');
}

function createModalSubtaskDOM(id, text, completed = false) {
  const div = document.createElement('div');
  div.className = 'modal-subtask-item';
  div.dataset.subId = id;
  div.dataset.text = text;
  div.dataset.completed = completed;

  div.innerHTML = `
    <span>${escapeHTML(text)}</span>
    <button type="button" class="btn-text-sm text-danger" onclick="this.parentElement.remove()">&times; Remove</button>
  `;
  return div;
}

/* ==========================================================================
   9. EXPORT & IMPORT BACKUP SYSTEM
   ========================================================================== */
function exportBackupData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `todo_tasks_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Backup JSON exported successfully', 'success');
}

function importBackupData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported && Array.isArray(imported.tasks)) {
        AppState.tasks = imported.tasks;
        if (Array.isArray(imported.categories)) AppState.categories = imported.categories;
        if (imported.preferences) AppState.preferences = imported.preferences;
        
        saveTasksToStorage();
        saveCategoriesToStorage();
        savePreferencesToStorage();
        applyPreferences();
        renderAll();
        showToast('Backup imported successfully!', 'success');
      } else {
        showToast('Invalid backup file format', 'error');
      }
    } catch (err) {
      showToast('Error parsing JSON backup file', 'error');
    }
  };
  reader.readAsText(file);
}

/* ==========================================================================
   10. EVENT LISTENERS & INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initAppState();
  renderAll();
  updatePomodoroUI();

  // Sidebar Views Filters
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.currentFilter = btn.dataset.filter;
      renderTasks();

      // Mobile auto-close sidebar drawer
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('sidebarBackdrop').classList.remove('active');
    });
  });

  // Mobile Hamburger Menu
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  document.getElementById('openSidebarBtn')?.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    backdrop.classList.add('active');
  });
  document.getElementById('closeSidebarBtn')?.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('active');
  });
  backdrop?.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    backdrop.classList.remove('active');
  });

  // Mobile Bottom Navigation Bar Buttons
  document.querySelectorAll('.bottom-nav-item').forEach(navBtn => {
    navBtn.addEventListener('click', () => {
      document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
      navBtn.classList.add('active');

      const view = navBtn.dataset.view;
      if (view === 'dashboard') {
        AppState.currentFilter = 'all';
        renderTasks();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (view === 'today') {
        AppState.currentFilter = 'today';
        renderTasks();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    backdrop.classList.add('active');
  });

  // Search Box
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      AppState.searchQuery = e.target.value;
      clearSearchBtn.classList.toggle('hidden', e.target.value === '');
      renderTasks();
    }, 200);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    AppState.searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderTasks();
  });

  // Toolbar Filters
  document.getElementById('priorityFilterSelect')?.addEventListener('change', (e) => {
    AppState.currentPriorityFilter = e.target.value;
    renderTasks();
  });

  document.getElementById('categoryFilterSelect')?.addEventListener('change', (e) => {
    AppState.currentCategory = e.target.value;
    renderCategories();
    renderTasks();
  });

  document.getElementById('sortBySelect')?.addEventListener('change', (e) => {
    AppState.sortBy = e.target.value;
    renderTasks();
  });

  // View Switcher (List / Grid)
  document.getElementById('listViewBtn')?.addEventListener('click', () => {
    AppState.layoutView = 'list';
    document.getElementById('listViewBtn').classList.add('active');
    document.getElementById('gridViewBtn').classList.remove('active');
    document.getElementById('mainTasksList').className = 'tasks-wrapper list-layout';
  });

  document.getElementById('gridViewBtn')?.addEventListener('click', () => {
    AppState.layoutView = 'grid';
    document.getElementById('gridViewBtn').classList.add('active');
    document.getElementById('listViewBtn').classList.remove('active');
    document.getElementById('mainTasksList').className = 'tasks-wrapper grid-layout';
  });

  // Modals Open / Close
  document.getElementById('openCreateTaskModalBtn')?.addEventListener('click', openCreateTaskModal);
  document.getElementById('emptyStateActionBtn')?.addEventListener('click', openCreateTaskModal);
  document.getElementById('mobileAddBtn')?.addEventListener('click', openCreateTaskModal);
  document.getElementById('closeTaskModalBtn')?.addEventListener('click', closeTaskModal);
  document.getElementById('cancelTaskModalBtn')?.addEventListener('click', closeTaskModal);
  document.getElementById('taskForm')?.addEventListener('submit', handleSaveTask);

  // Subtasks Add Step in Modal
  document.getElementById('addSubtaskBtn')?.addEventListener('click', () => {
    const input = document.getElementById('newSubtaskInput');
    const text = input.value.trim();
    if (text) {
      document.getElementById('modalSubtasksList').appendChild(createModalSubtaskDOM(`sub-${Date.now()}`, text));
      input.value = '';
    }
  });

  // Category select custom display
  document.getElementById('taskCategorySelect')?.addEventListener('change', (e) => {
    document.getElementById('customCategoryGroup').classList.toggle('hidden', e.target.value !== 'Custom');
  });

  // Color dot picker selection
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // Delete Confirmation Modal
  document.getElementById('closeDeleteModalBtn')?.addEventListener('click', () => {
    document.getElementById('deleteModalOverlay').classList.add('hidden');
  });
  document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
    document.getElementById('deleteModalOverlay').classList.add('hidden');
  });
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDeleteTask);

  // Settings Modal
  document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
    document.getElementById('settingsModalOverlay').classList.remove('hidden');
  });
  document.getElementById('closeSettingsModalBtn')?.addEventListener('click', () => {
    document.getElementById('settingsModalOverlay').classList.add('hidden');
  });

  // Theme Switches
  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    AppState.preferences.theme = AppState.preferences.theme === 'dark' ? 'light' : 'dark';
    savePreferencesToStorage();
    applyPreferences();
  });
  document.getElementById('segThemeLight')?.addEventListener('click', () => {
    AppState.preferences.theme = 'light';
    savePreferencesToStorage();
    applyPreferences();
  });
  document.getElementById('segThemeDark')?.addEventListener('click', () => {
    AppState.preferences.theme = 'dark';
    savePreferencesToStorage();
    applyPreferences();
  });

  // Accent Colors
  document.querySelectorAll('.accent-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      AppState.preferences.accent = swatch.dataset.accentColor;
      savePreferencesToStorage();
      applyPreferences();
      renderCanvasChart();
    });
  });

  // Font Size
  document.getElementById('fontSizeSelect')?.addEventListener('change', (e) => {
    AppState.preferences.fontSize = e.target.value;
    savePreferencesToStorage();
    applyPreferences();
  });

  // Data Export & Import
  document.getElementById('exportDataBtn')?.addEventListener('click', exportBackupData);
  document.getElementById('importDataTriggerBtn')?.addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });
  document.getElementById('importFileInput')?.addEventListener('change', importBackupData);

  document.getElementById('resetAllDataBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all tasks and preferences?')) {
      localStorage.clear();
      AppState.tasks = SAMPLE_TASKS;
      AppState.categories = DEFAULT_CATEGORIES;
      saveTasksToStorage();
      saveCategoriesToStorage();
      renderAll();
      showToast('App data reset to default', 'info');
    }
  });

  // Pomodoro Controls
  document.getElementById('pomoStartBtn')?.addEventListener('click', startPomodoro);
  document.getElementById('pomoResetBtn')?.addEventListener('click', resetPomodoro);
  document.getElementById('pomoModeWorkBtn')?.addEventListener('click', () => {
    AppState.pomodoro.mode = 'work';
    AppState.pomodoro.timeLeft = AppState.pomodoro.workTime;
    document.getElementById('pomoModeLabel').textContent = 'Work Session';
    updatePomodoroUI();
  });
  document.getElementById('pomoModeBreakBtn')?.addEventListener('click', () => {
    AppState.pomodoro.mode = 'break';
    AppState.pomodoro.timeLeft = AppState.pomodoro.breakTime;
    document.getElementById('pomoModeLabel').textContent = 'Short Break';
    updatePomodoroUI();
  });

  // Calendar Month Nav
  document.getElementById('calPrevMonthBtn')?.addEventListener('click', () => {
    currentCalMonth--;
    if (currentCalMonth < 0) {
      currentCalMonth = 11;
      currentCalYear--;
    }
    renderCalendar();
  });

  document.getElementById('calNextMonthBtn')?.addEventListener('click', () => {
    currentCalMonth++;
    if (currentCalMonth > 11) {
      currentCalMonth = 0;
      currentCalYear++;
    }
    renderCalendar();
  });

  document.getElementById('clearCalendarFilterBtn')?.addEventListener('click', () => {
    AppState.selectedCalendarDate = null;
    document.getElementById('clearCalendarFilterBtn').style.display = 'none';
    renderCalendar();
    renderTasks();
  });

  // Focus Mode
  document.getElementById('quickFocusBtn')?.addEventListener('click', openFocusMode);
  document.getElementById('mobileTimerBtn')?.addEventListener('click', openFocusMode);
  document.getElementById('exitFocusBtn')?.addEventListener('click', () => {
    document.getElementById('focusOverlay').classList.add('hidden');
  });
  document.getElementById('focusTogglePlayBtn')?.addEventListener('click', startPomodoro);

  // Motivational Quote Refresh
  document.getElementById('refreshQuoteBtn')?.addEventListener('click', () => {
    const randomQuote = MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)];
    document.getElementById('quoteText').textContent = randomQuote;
  });

  // Keyboard Shortcuts Handler
  document.addEventListener('keydown', (e) => {
    // Ctrl + N (New Task)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      openCreateTaskModal();
    }
    // Ctrl + F (Focus Search)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      searchInput.focus();
    }
    // Esc (Close Modals)
    if (e.key === 'Escape') {
      closeTaskModal();
      document.getElementById('settingsModalOverlay').classList.add('hidden');
      document.getElementById('deleteModalOverlay').classList.add('hidden');
      document.getElementById('focusOverlay').classList.add('hidden');
    }
  });

  // Window resize re-renders chart
  window.addEventListener('resize', renderCanvasChart);
});
