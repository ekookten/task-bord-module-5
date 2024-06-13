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
  const taskCard = $(`
    <div class="card mb-3 draggable" data-id="${task.id}">
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

  const cardDeleteBtn = taskCard.find(".delete-task");

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "YYYY-MM-DD");
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  return taskCard;
}

// Render the task list and make cards draggable
function renderTaskList() {
  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  // loop through tasks and create task cards for each status
  for (let task of taskList) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,
    // function to clone the card being dragged so that the original card remains in place
    helper: function (e) {
      // check if the target of the drag event is the card itself or a child element if it is the card itself, clone it, otherwise find the parent card and clone that
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");
      return original.clone().css({
        maxWidth: original.outerWidth(),
      });
    },
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
    dueDate: $("#taskDueDate").val(), // Ensure dueDate is in YYYY-MM-DD format
    status: "to-do",
  };

  console.log("Adding task:", task); // Debugging log

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
  const taskId = ui.draggable.data("id");
  const newStatus = event.target.id;

  for (let task of taskList) {
    // update the task status of the dragged card
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
    }
  }

  saveToLocalStorage();
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#taskForm").submit(handleAddTask);

  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });

  $("#taskDueDate").datepicker({
    dateFormat: "yy-mm-dd", // Ensure the date picker uses the same format
  });
});
