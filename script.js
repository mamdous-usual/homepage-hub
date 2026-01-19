// =============================================
// Productivity Core
// Author : Mamdous
// =============================================

// DOM Elements
const elements = {
  // Time & Date
  currentTime: document.getElementById('currentTime'),
  currentDate: document.getElementById('currentDate'),
  
  // Countdown
  nextYear: document.getElementById('nextYear'),
  months: document.getElementById('months'),
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
  yearProgress: document.getElementById('yearProgress'),
  progressText: document.getElementById('progressText'),
  
  // Theme
  themeToggle: document.getElementById('themeToggle'),
  
  // Pomodoro
  pomodoroDisplay: document.getElementById('pomodoroDisplay'),
  pomodoroStatus: document.getElementById('pomodoroStatus'),
  pomodoroStart: document.getElementById('pomodoroStart'),
  pomodoroPause: document.getElementById('pomodoroPause'),
  pomodoroReset: document.getElementById('pomodoroReset'),
  pomodoroCount: document.getElementById('pomodoroCount'),
  modeBtns: document.querySelectorAll('.mode-btn'),
  
  // Todo
  todoInput: document.getElementById('todoInput'),
  addTodoBtn: document.getElementById('addTodo'),
  todoList: document.getElementById('todoList'),
  todoCount: document.getElementById('todoCount'),
  clearCompletedBtn: document.getElementById('clearCompleted'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  
  // Greeting
  greeting: document.getElementById('greeting'),
  quote: document.getElementById('quote'),
  
  // Footer
  setAsHome: document.getElementById('setAsHome')
};

// =============================================
// Theme Management
// =============================================
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
    elements.themeToggle.addEventListener('click', () => this.toggle());
  },
  
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },
  
  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
};

// =============================================
// Time & Date Display
// =============================================
const TimeDisplay = {
  init() {
    this.update();
    setInterval(() => this.update(), 1000);
  },
  
  update() {
    const now = new Date();
    
    // Format time
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    elements.currentTime.textContent = now.toLocaleTimeString('en-US', timeOptions);
    
    // Format date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);
    
    // Update page title with time
    document.title = `${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - New Year Countdown`;
  }
};

// =============================================
// Countdown Timer
// =============================================
const Countdown = {
  targetYear: null,
  
  init() {
    this.calculateTargetYear();
    this.update();
    setInterval(() => this.update(), 1000);
  },
  
  calculateTargetYear() {
    const now = new Date();
    this.targetYear = now.getFullYear() + 1;
    elements.nextYear.textContent = this.targetYear;
  },
  
  update() {
    const now = new Date();
    const newYear = new Date(this.targetYear, 0, 1, 0, 0, 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    
    // Check if we've passed the target
    if (now >= newYear) {
      this.calculateTargetYear();
      this.celebrate();
      return;
    }
    
    const diff = newYear - now;
    
    // Calculate time units
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(totalDays / 30.44); // Average days per month
    const days = Math.floor(totalDays % 30.44);
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Update display
    elements.months.textContent = this.padZero(months);
    elements.days.textContent = this.padZero(days);
    elements.hours.textContent = this.padZero(hours);
    elements.minutes.textContent = this.padZero(minutes);
    elements.seconds.textContent = this.padZero(seconds);
    
    // Update progress bar
    const totalYearMs = newYear - startOfYear;
    const elapsedMs = now - startOfYear;
    const progress = (elapsedMs / totalYearMs) * 100;
    
    elements.yearProgress.style.width = `${progress}%`;
    elements.progressText.textContent = `${progress.toFixed(2)}% of ${now.getFullYear()} completed`;
  },
  
  padZero(num) {
    return num.toString().padStart(2, '0');
  },
  
  celebrate() {
    document.querySelector('.countdown-section').classList.add('celebrating');
    showNotification('🎉 Happy New Year! ' + this.targetYear, 'success');
    this.createConfetti();
    setTimeout(() => {
      document.querySelector('.countdown-section').classList.remove('celebrating');
    }, 5000);
  },
  
  createConfetti() {
    const colors = ['#5e81ac', '#81a1c1', '#88c0d0', '#8fbcbb', '#a3be8c', '#ebcb8b', '#bf616a'];
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
      }, i * 30);
    }
  }
};

// =============================================
// Pomodoro Timer
// =============================================
const Pomodoro = {
  timeLeft: 25 * 60, // 25 minutes in seconds
  totalTime: 25 * 60,
  isRunning: false,
  interval: null,
  currentMode: 'work',
  sessionsCompleted: 0,
  
  init() {
    this.loadState();
    this.updateDisplay();
    this.attachEventListeners();
    // If timer was running before refresh, resume countdown
    if (this.isRunning) {
      this.start(true); // true = restoring
    }
  },
  
  loadState() {
    // Sessions completed
    const savedSessions = localStorage.getItem('pomodoroSessions');
    if (savedSessions) {
      this.sessionsCompleted = parseInt(savedSessions, 10);
      elements.pomodoroCount.textContent = this.sessionsCompleted;
    }
    // Timer state
    const savedState = localStorage.getItem('pomodoroState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.timeLeft = state.timeLeft ?? 25 * 60;
        this.totalTime = state.totalTime ?? 25 * 60;
        this.currentMode = state.currentMode ?? 'work';
        this.isRunning = state.isRunning ?? false;
      } catch (e) {
        // Ignore parse errors, use defaults
      }
    }
  },
  
  saveState() {
    localStorage.setItem('pomodoroSessions', this.sessionsCompleted.toString());
    // Save timer state
    localStorage.setItem('pomodoroState', JSON.stringify({
      timeLeft: this.timeLeft,
      totalTime: this.totalTime,
      currentMode: this.currentMode,
      isRunning: this.isRunning
    }));
  },
  
  attachEventListeners() {
    elements.pomodoroStart.addEventListener('click', () => this.start());
    elements.pomodoroPause.addEventListener('click', () => this.pause());
    elements.pomodoroReset.addEventListener('click', () => this.reset());
    
    elements.modeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        const time = parseInt(e.target.dataset.time, 10);
        this.setMode(mode, time);
        
        elements.modeBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
  },
  
  setMode(mode, minutes) {
    this.currentMode = mode;
    this.timeLeft = minutes * 60;
    this.totalTime = minutes * 60;
    this.isRunning = false;
    clearInterval(this.interval);
    this.updateDisplay();
    this.updateButtons(false);
    this.updateStatus();
    this.saveState();
  },
  
  start(restoring = false) {
    if (this.isRunning && !restoring) return;
    this.isRunning = true;
    this.updateButtons(true);
    this.updateStatus();
    this.saveState();
    this.interval = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      this.saveState();
      if (this.timeLeft <= 0) {
        this.complete();
      }
    }, 1000);
  },
  
  pause() {
    this.isRunning = false;
    clearInterval(this.interval);
    this.updateButtons(false);
    elements.pomodoroStatus.textContent = 'Paused';
    this.saveState();
  },
  
  reset() {
    this.isRunning = false;
    clearInterval(this.interval);
    const activeBtn = document.querySelector('.mode-btn.active');
    const time = parseInt(activeBtn.dataset.time, 10);
    this.timeLeft = time * 60;
    this.totalTime = time * 60;
    this.updateDisplay();
    this.updateButtons(false);
    this.updateStatus();
    this.saveState();
  },
  
  complete() {
    this.isRunning = false;
    clearInterval(this.interval);
    if (this.currentMode === 'work') {
      this.sessionsCompleted++;
      elements.pomodoroCount.textContent = this.sessionsCompleted;
      showNotification('🍅 Great work! Time for a break.', 'success');
      this.playSound();
      this.sendBrowserNotification('Pomodoro Complete!', 'Great work! Time for a break.');
    } else {
      showNotification('⏰ Break over! Ready to focus?', 'warning');
      this.playSound();
      this.sendBrowserNotification('Break Over!', 'Ready to focus?');
    }
    this.updateButtons(false);
    elements.pomodoroStatus.textContent = 'Session completed!';
    this.saveState();
  },
  
  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    elements.pomodoroDisplay.textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },
  
  updateButtons(running) {
    elements.pomodoroStart.disabled = running;
    elements.pomodoroPause.disabled = !running;
  },
  
  updateStatus() {
    const statusMessages = {
      work: this.isRunning ? '🎯 Focus time!' : 'Ready to focus',
      short: this.isRunning ? '☕ Short break' : 'Ready for short break',
      long: this.isRunning ? '🌴 Long break' : 'Ready for long break'
    };
    elements.pomodoroStatus.textContent = statusMessages[this.currentMode];
  },
  
  playSound() {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  },
  
  sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.svg' });
    }
  }
};

// =============================================
// Todo List
// =============================================
const TodoList = {
  todos: [],
  filter: 'all',
  
  init() {
    this.loadTodos();
    this.render();
    this.attachEventListeners();
  },
  
  loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
      this.todos = JSON.parse(saved);
    }
  },
  
  saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  },
  
  attachEventListeners() {
    // Add todo
    elements.addTodoBtn.addEventListener('click', () => this.addTodo());
    elements.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
    
    // Filters
    elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.filter = e.target.dataset.filter;
        elements.filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.render();
      });
    });
    
    // Clear completed
    elements.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
  },
  
  addTodo() {
    const text = elements.todoInput.value.trim();
    if (!text) return;
    
    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    this.todos.unshift(todo);
    this.saveTodos();
    this.render();
    elements.todoInput.value = '';
  },
  
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  },
  
  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.render();
  },
  
  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    this.saveTodos();
    this.render();
  },
  
  getFilteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  },
  
  render() {
    const filteredTodos = this.getFilteredTodos();
    
    if (filteredTodos.length === 0) {
      elements.todoList.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 11l3 3L22 4"></path>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <p>${this.filter === 'all' ? 'No tasks yet. Add one above!' : `No ${this.filter} tasks`}</p>
        </div>
      `;
    } else {
      elements.todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="TodoList.toggleTodo(${todo.id})"></div>
          <span class="todo-text">${this.escapeHtml(todo.text)}</span>
          <button class="todo-delete" onclick="TodoList.deleteTodo(${todo.id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </li>
      `).join('');
    }
    
    // Update count
    const activeTodos = this.todos.filter(t => !t.completed).length;
    elements.todoCount.textContent = `${activeTodos} ${activeTodos === 1 ? 'task' : 'tasks'} remaining`;
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// =============================================
// Greeting & Quotes
// =============================================
const Greeting = {
  quotes: [
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "Everything you've ever wanted is on the other side of fear. - George Addair",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "Act as if what you do makes a difference. It does. - William James",
    "What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
    "Start where you are. Use what you have. Do what you can. - Arthur Ashe",
    "The secret of getting ahead is getting started. - Mark Twain",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Quality is not an act, it is a habit. - Aristotle"
  ],
  
  init() {
    this.updateGreeting();
    this.showRandomQuote();
    // Update greeting every minute
    setInterval(() => this.updateGreeting(), 60000);
  },
  
  updateGreeting() {
    const hour = new Date().getHours();
    let greetingText = '';
    
    if (hour >= 5 && hour < 12) {
      greetingText = '🌅 Good Morning!';
    } else if (hour >= 12 && hour < 17) {
      greetingText = '☀️ Good Afternoon!';
    } else if (hour >= 17 && hour < 21) {
      greetingText = '🌆 Good Evening!';
    } else {
      greetingText = '🌙 Good Night!';
    }
    
    elements.greeting.textContent = greetingText;
  },
  
  showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    elements.quote.textContent = `"${this.quotes[randomIndex]}"`;
  }
};

// =============================================
// Notification System
// =============================================
function showNotification(message, type = 'success') {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// =============================================
// Request Notification Permission
// =============================================
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// =============================================
// Set as Homepage Helper
// =============================================
function setupHomepageLink() {
  if (elements.setAsHome) {
    elements.setAsHome.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification('To set as homepage: Go to your browser settings → Homepage → Enter this URL', 'warning');
    });
  }
}

// =============================================
// Initialize Everything
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  TimeDisplay.init();
  Countdown.init();
  Pomodoro.init();
  TodoList.init();
  Greeting.init();
  requestNotificationPermission();
  setupHomepageLink();
});

// Make TodoList methods accessible globally for onclick handlers
window.TodoList = TodoList;
