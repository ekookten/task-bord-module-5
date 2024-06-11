// Retrieve tasks and nextId from localStorage or set defaults
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Save tasks and nextId to localStorage
function saveToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// Create a task card
function createTaskCard(task) {
  return $(`
    <div class="card mb-3" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${dayjs(
          task.dueDate
        ).format("MMM D, YYYY")}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);
}

// Render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty();

  taskList.forEach((task) => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard);
  });

  $(".card").draggable({
    revert: "invalid",
    helper: "clone",
  });

  $(".lane").droppable({
    accept: ".card",
    drop: handleDrop,
  });

  $(".delete-task").click(handleDeleteTask);
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const task = {
    id: generateTaskId(),
    title: $("#taskTitle").val(),
    description: $("#taskDescription").val(),
    dueDate: $("#taskDueDate").val(),
    status: "to-do",
  };

  taskList.push(task);
  saveToLocalStorage();
  renderTaskList();

  $("#formModal").modal("hide");
  $("#taskForm")[0].reset();
}

// Handle deleting a task
function handleDeleteTask(event) {
  const card = $(event.target).closest(".card");
  const taskId = card.data("id");

  taskList = taskList.filter((task) => task.id !== taskId);
  saveToLocalStorage();
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const card = ui.draggable;
  const taskId = card.data("id");
  const newStatus = $(this).attr("id").split("-")[0];

  taskList = taskList.map((task) =>
    task.id === taskId ? { ...task, status: newStatus } : task
  );

  saveToLocalStorage();
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#taskDueDate").datepicker();

  $("#taskForm").submit(handleAddTask);
});
