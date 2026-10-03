import { useEffect, useState } from "react";
import "./TaskManager.css";

function TaskManager({ user }) {
  const today = new Date();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDateFromString = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const todayString = formatDate(today);

  const [activePage, setActivePage] = useState("dashboard");

  const [tasks, setTasks] = useState([]);

  const [selectedDate, setSelectedDate] = useState(todayString);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: todayString,
    time: "",
    priority: "Medium",
    category: "Personal",
  });
  useEffect(() => {
  const fetchTasks = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `https://react-login-project-jy61.vercel.app/tasks/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message || "Unable to fetch tasks");
        return;
      }

      const formattedTasks = data.map((task) => ({
        ...task,
        id: task._id
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.log("Fetch tasks error:", error);
    }
  };

  fetchTasks();
}, [user]);

  /* =========================
     STATISTICS
  ========================= */

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  /* =========================
     CALENDAR
  ========================= */

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
  });

  const year = currentMonth.getFullYear();

  const firstDay = new Date(
    year,
    currentMonth.getMonth(),
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const previousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  const goToToday = () => {
    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    setSelectedDate(todayString);
  };

  const getDateString = (day) => {
    return formatDate(
      new Date(year, currentMonth.getMonth(), day)
    );
  };

  const getTasksForDate = (date) => {
    return tasks.filter((task) => task.date === date);
  };

  const selectedDateTasks = tasks.filter(
    (task) => task.date === selectedDate
  );

  /* =========================
     TASK FUNCTIONS
  ========================= */

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const openAddForm = (date = selectedDate) => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      date: date || todayString,
      time: "",
      priority: "Medium",
      category: "Personal",
    });

    setShowForm(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title,
      description: task.description,
      date: task.date,
      time: task.time,
      priority: task.priority,
      category: task.category,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
  if (e) {
  e.preventDefault();
}
  if (!form.title.trim()) {
    return;
  }

  try {
    if (editingTask) {
      // Update existing task
      const response = await fetch(
        `https://react-login-project-jy61.vercel.app/tasks/${editingTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message || "Unable to update task");
        return;
      }

      const updatedTask = {
        ...data.task,
        id: data.task._id,
      };

      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? updatedTask : task
        )
      );

      setSelectedDate(form.date);
    } else {
      
        // Create new task
      const response = await fetch(
        "https://react-login-project-jy61.vercel.app/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            completed: false,
            userId: user.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log(data.message || "Unable to create task");
        return;
      }

      const newTask = {
        ...data.task,
        id: data.task._id,
      };

      setTasks([...tasks, newTask]);
      setSelectedDate(form.date);
    }

    closeForm();
  } catch (error) {
    console.log("Task save error:", error);
  }
};
  /* =========================
     FILTERED TASKS
  ========================= */

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      task.description.toLowerCase().includes(searchText);

    const matchesPriority =
      priorityFilter === "All" ||
      task.priority === priorityFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      task.category === categoryFilter;

    return (
      matchesSearch &&
      matchesPriority &&
      matchesCategory
    );
  });

  /* =========================
     PROGRESS
  ========================= */

  const progressCircle = 2 * Math.PI * 42;

  const progressOffset =
    progressCircle -
    (completionPercentage / 100) * progressCircle;

  /* =========================
     CALENDAR COMPONENT
  ========================= */

  const CalendarView = () => {
    return (
      <div className="calendar-page">

        <div className="page-title-row">

          <div>
            <p className="page-small-title">
              Calendar
            </p>

            <h1>
              Plan your schedule
            </h1>

            <p className="page-description">
              Select a date to view and manage your tasks.
            </p>
          </div>

          <button
            className="header-add-button"
            onClick={() => openAddForm(selectedDate)}
          >
            + Add Task
          </button>

        </div>

        <div className="calendar-layout">

          <div className="large-calendar-card">

            <div className="calendar-header">

              <div>
                <h2>
                  {monthName} {year}
                </h2>

                <p>
                  {selectedDateTasks.length} task
                  {selectedDateTasks.length !== 1
                    ? "s"
                    : ""}{" "}
                  on selected date
                </p>
              </div>

              <div className="calendar-controls">

                <button onClick={previousMonth}>
                  ‹
                </button>

                <button
                  className="today-button"
                  onClick={goToToday}
                >
                  Today
                </button>

                <button onClick={nextMonth}>
                  ›
                </button>

              </div>

            </div>

            <div className="weekdays">

              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>

            </div>

            <div className="calendar-grid">

              {calendarDays.map((day, index) => {

                if (!day) {
                  return (
                    <div
                      className="calendar-day empty"
                      key={index}
                    />
                  );
                }

                const dateString =
                  getDateString(day);

                const dateTasks =
                  getTasksForDate(dateString);

                const isSelected =
                  selectedDate === dateString;

                const isToday =
                  todayString === dateString;

                return (
                  <button
                    className={`calendar-day ${
                      isSelected ? "selected" : ""
                    } ${
                      isToday ? "calendar-today" : ""
                    }`}
                    key={dateString}
                    onClick={() =>
                      setSelectedDate(dateString)
                    }
                  >

                    <span className="day-number">
                      {day}
                    </span>

                    {dateTasks.length > 0 && (
                      <>
                        <div className="task-dots">

                          {dateTasks
                            .slice(0, 3)
                            .map((task) => (
                              <span
                                key={task.id}
                                className={`task-dot ${task.priority.toLowerCase()}`}
                              />
                            ))}

                        </div>

                        <small>
                          {dateTasks.length} task
                          {dateTasks.length > 1
                            ? "s"
                            : ""}
                        </small>
                      </>
                    )}

                  </button>
                );
              })}

            </div>

          </div>


          {/* SELECTED DATE TASKS */}

          <div className="date-task-panel">

            <div className="date-panel-header">

              <div>
                <span>Selected date</span>

                <h2>
                  {getDateFromString(
                    selectedDate
                  ).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </h2>
              </div>

              <button
                onClick={() =>
                  openAddForm(selectedDate)
                }
              >
                +
              </button>

            </div>

            <div className="date-task-list">

              {selectedDateTasks.length === 0 ? (

                <div className="no-date-task">

                  <div className="empty-icon">
                    ✓
                  </div>

                  <h3>
                    No tasks
                  </h3>

                  <p>
                    Nothing planned for this date.
                  </p>

                  <button
                    onClick={() =>
                      openAddForm(selectedDate)
                    }
                  >
                    Create task
                  </button>

                </div>

              ) : (

                selectedDateTasks.map((task) => (

                  <div
                    className={`date-task ${
                      task.completed
                        ? "date-task-completed"
                        : ""
                    }`}
                    key={task.id}
                  >

                    <button
                      className={`task-check ${
                        task.completed
                          ? "checked"
                          : ""
                      }`}
                      onClick={() =>
                        toggleComplete(task.id)
                      }
                    >
                      {task.completed ? "✓" : ""}
                    </button>

                    <div className="date-task-info">

                      <h4>
                        {task.title}
                      </h4>

                      <p>
                        {task.time || "No time"} •{" "}
                        {task.category}
                      </p>

                    </div>

                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>

                    <button
                      className="icon-action edit"
                      onClick={() =>
                        openEditForm(task)
                      }
                    >
                      ✎
                    </button>

                    <button
                      className="icon-action delete"
                      onClick={() =>
                        deleteTask(task.id)
                      }
                    >
                      🗑
                    </button>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      </div>
    );
  };


  /* =========================
     TASKS VIEW
  ========================= */

  const TasksView = () => {
    return (
      <div className="tasks-page">

        <div className="page-title-row">

          <div>
            <p className="page-small-title">
              My Tasks
            </p>

            <h1>
              Manage your tasks
            </h1>

            <p className="page-description">
              Keep track of everything you need to get done.
            </p>
          </div>

          <button
            className="header-add-button"
            onClick={() => openAddForm(selectedDate)}
          >
            + Add Task
          </button>

        </div>


        {/* TASK TOOLBAR */}

        <div className="task-toolbar">

          <div className="task-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="task-filter-buttons">

            <button
              className={
                priorityFilter === "All"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setPriorityFilter("All")
              }
            >
              All
            </button>

            <button
              className={
                priorityFilter === "High"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setPriorityFilter("High")
              }
            >
              High
            </button>

            <button
              className={
                priorityFilter === "Medium"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setPriorityFilter("Medium")
              }
            >
              Medium
            </button>

            <button
              className={
                priorityFilter === "Low"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setPriorityFilter("Low")
              }
            >
              Low
            </button>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="All">
                All Categories
              </option>

              <option value="Project">
                Project
              </option>

              <option value="College">
                College
              </option>

              <option value="Learning">
                Learning
              </option>

              <option value="Personal">
                Personal
              </option>
            </select>

          </div>

        </div>


        {/* TASK SUMMARY */}

        <div className="task-summary">

          <div>
            <strong>
              {totalTasks}
            </strong>

            <span>Total Tasks</span>
          </div>

          <div>
            <strong>
              {pendingTasks}
            </strong>

            <span>Pending</span>
          </div>

          <div>
            <strong>
              {completedTasks}
            </strong>

            <span>Completed</span>
          </div>

          <div>
            <strong>
              {completionPercentage}%
            </strong>

            <span>Progress</span>
          </div>

        </div>


        {/* TASK LIST */}

        <div className="full-task-list">

          {filteredTasks.length === 0 ? (

            <div className="empty-task">

              <div>✓</div>

              <h3>
                No tasks found
              </h3>

              <p>
                Try another filter or create a new task.
              </p>

            </div>

          ) : (

            filteredTasks.map((task) => (

              <div
                className={`full-task-card ${
                  task.completed
                    ? "completed-card"
                    : ""
                }`}
                key={task.id}
              >

                <button
                  className={`task-check ${
                    task.completed
                      ? "checked"
                      : ""
                  }`}
                  onClick={() =>
                    toggleComplete(task.id)
                  }
                >
                  {task.completed ? "✓" : ""}
                </button>


                <div className="full-task-content">

                  <div className="full-task-top">

                    <div>

                      <h3>
                        {task.title}
                      </h3>

                      <p>
                        {task.description ||
                          "No description"}
                      </p>

                    </div>

                    <span
                      className={`priority-badge ${task.priority.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>

                  </div>


                  <div className="full-task-meta">

                    <span>
                      📅{" "}
                      {getDateFromString(
                        task.date
                      ).toLocaleDateString()}
                    </span>

                    <span>
                      🕐{" "}
                      {task.time || "No time"}
                    </span>

                    <span>
                      📁 {task.category}
                    </span>

                  </div>

                </div>


                <div className="task-actions">

                  <button
                    className="edit-action"
                    onClick={() =>
                      openEditForm(task)
                    }
                  >
                    ✎
                  </button>

                  <button
                    className="delete-action"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    🗑
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>
    );
  };


  /* =========================
     DASHBOARD VIEW
  ========================= */

  const DashboardView = () => {
    return (
      <div className="dashboard-page">

        <div className="page-title-row">

          <div>

            <p className="page-small-title">
              Dashboard
            </p>

            <h1>
              Let's get things done.
            </h1>

            <p className="page-description">
              Here's your productivity overview.
            </p>

          </div>

          <button
            className="header-add-button"
            onClick={() => openAddForm(selectedDate)}
          >
            + Add Task
          </button>

        </div>


        {/* DASHBOARD CARDS */}

        <div className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="stat-card-icon purple">
              #
            </div>

            <div>
              <span>Total tasks</span>
              <strong>{totalTasks}</strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="stat-card-icon orange">
              ◷
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingTasks}</strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="stat-card-icon green">
              ✓
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedTasks}</strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="stat-card-icon blue">
              %
            </div>

            <div>
              <span>Completion</span>
              <strong>{completionPercentage}%</strong>
            </div>

          </div>

        </div>


        <div className="dashboard-grid">

          {/* MINI CALENDAR */}

          <div className="dashboard-calendar-card">

            <div className="dashboard-card-heading">

              <div>
                <h2>
                  Calendar
                </h2>

                <p>
                  Your schedule at a glance
                </p>
              </div>

              <button
                onClick={() =>
                  setActivePage("calendar")
                }
              >
                View calendar →
              </button>

            </div>

            <div className="mini-calendar">

              <div className="mini-calendar-header">

                <strong>
                  {monthName} {year}
                </strong>

                <div>
                  <button onClick={previousMonth}>
                    ‹
                  </button>

                  <button onClick={nextMonth}>
                    ›
                  </button>
                </div>

              </div>


              <div className="mini-weekdays">

                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>

              </div>


              <div className="mini-calendar-grid">

                {calendarDays.map((day, index) => {

                  if (!day) {
                    return (
                      <div
                        key={index}
                        className="mini-day empty"
                      />
                    );
                  }

                  const dateString =
                    getDateString(day);

                  const hasTask =
                    getTasksForDate(dateString)
                      .length > 0;

                  return (
                    <button
                      key={dateString}
                      className={`mini-day ${
                        dateString === todayString
                          ? "today"
                          : ""
                      } ${
                        dateString === selectedDate
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedDate(
                          dateString
                        );
                        setActivePage(
                          "calendar"
                        );
                      }}
                    >

                      {day}

                      {hasTask && (
                        <span />
                      )}

                    </button>
                  );
                })}

              </div>

            </div>

          </div>


          {/* PROGRESS */}

          <div className="dashboard-progress-card">

            <div className="dashboard-card-heading">

              <div>
                <h2>
                  Your progress
                </h2>

                <p>
                  Overall task completion
                </p>
              </div>

            </div>


            <div className="dashboard-progress-content">

              <div className="large-progress-ring">

                <svg
                  width="150"
                  height="150"
                  viewBox="0 0 160 160"
                >

                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    className="progress-background"
                  />

                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    className="progress-circle"
                    strokeDasharray={
                      2 * Math.PI * 62
                    }
                    strokeDashoffset={
                      2 * Math.PI * 62 -
                      (completionPercentage / 100) *
                        (2 * Math.PI * 62)
                    }
                  />

                </svg>

                <div>
                  <strong>
                    {completionPercentage}%
                  </strong>

                  <span>
                    completed
                  </span>
                </div>

              </div>


              <div className="progress-details">

                <div>
                  <strong>
                    {completedTasks}
                  </strong>

                  <span>
                    Completed
                  </span>
                </div>

                <div>
                  <strong>
                    {pendingTasks}
                  </strong>

                  <span>
                    Pending
                  </span>
                </div>

                <div>
                  <strong>
                    {totalTasks}
                  </strong>

                  <span>
                    Total
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    );
  };


  /* =========================
     MAIN RETURN
  ========================= */

  return (
    <div className="task-app">

      {/* SIDEBAR */}

      <aside className="task-sidebar">

        <div className="brand">

          <div className="brand-icon">
            ✓
          </div>

          <div>
            <h2>TaskFlow</h2>
            <span>Task Manager</span>
          </div>

        </div>


        <nav className="sidebar-menu">

          <button
            className={`menu-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <span className="menu-icon">
              ▦
            </span>

            Dashboard
          </button>


          <button
            className={`menu-item ${
              activePage === "tasks"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("tasks")
            }
          >
            <span className="menu-icon">
              ✓
            </span>

            My Tasks
          </button>


          <button
            className={`menu-item ${
              activePage === "calendar"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("calendar")
            }
          >
            <span className="menu-icon">
              ◫
            </span>

            Calendar
          </button>


          <button
            className="menu-item"
            onClick={() => {
              setPriorityFilter("High");
              setActivePage("tasks");
            }}
          >
            <span className="menu-icon">
              ★
            </span>

            Priority
          </button>


          <button
            className="menu-item"
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <span className="menu-icon">
              ⚙
            </span>

            Settings
          </button>

        </nav>


        <div className="create-task-box">

          <h3>
            Create task
          </h3>

          <p>
            Stay organized and productive
          </p>

          <button
            className="create-task-button"
            onClick={() => openAddForm(selectedDate)}
          >
            +
          </button>

        </div>


        <div className="sidebar-profile">

          <div className="profile-avatar">
            R
          </div>

          <div>
            <strong>
              Risha
            </strong>

            <span>
              Student
            </span>
          </div>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="task-main">

        <header className="task-topbar">

          <div className="topbar-left">

            <span>
              TaskFlow
            </span>

          </div>

          <div className="topbar-right">

            <span className="notification">
              🔔
            </span>

            <div className="top-avatar">
              R
            </div>

          </div>

        </header>


        {activePage === "dashboard" && (
          <DashboardView />
        )}

        {activePage === "tasks" && (
          <TasksView />
        )}

        {activePage === "calendar" && (
          <CalendarView />
        )}

      </main>


      {/* MODAL */}

      {showForm && (

        <div className="modal-overlay">

          <div className="task-modal">

            <div className="modal-header">

              <div>

                <span>
                  {editingTask
                    ? "UPDATE TASK"
                    : "NEW TASK"}
                </span>

                <h2>
                  {editingTask
                    ? "Edit your task"
                    : "Create a new task"}
                </h2>

                <p>
                  Add the details you need to stay organized.
                </p>

              </div>

              <button
                className="close-modal"
                onClick={closeForm}
              >
                ×
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="form-group">

                <label>
                  Task title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Add a short description..."
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                />

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Time
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="form-row">

                <div className="form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>
                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="Personal">
                      Personal
                    </option>

                    <option value="Project">
                      Project
                    </option>

                    <option value="College">
                      College
                    </option>

                    <option value="Learning">
                      Learning
                    </option>
                  </select>

                </div>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
  type="button"
  className="save-button"
  style={{
    position: "relative",
    zIndex: 9999,
    pointerEvents: "auto"
  }}
  onClick={() => {
    console.log("CREATE BUTTON CLICKED");
    handleSubmit();
  }}
>
  {editingTask ? "Update Task" : "Create Task"}
</button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default TaskManager;