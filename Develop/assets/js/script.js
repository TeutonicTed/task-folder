// Retrieve tasks and nextId from localStorage


let taskList = JSON.parse(localStorage.getItem("projects")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || [];
const submitBtn = document.querySelector ("#submit-button");

const projectNameInputEl = $("#task-name-input")
const projectTypeInputEl = $("#project-type-input")
const projectDateInputEl = $("#taskDueDate")

function readProjectsFromStorage(task){
  
  return JSON.parse(localStorage.getItem("projects")) || []
}

function saveProjectsToStorage(task) {
    localStorage.setItem('projects', JSON.stringify(task));
  }



// Create a function to create a task card
function createTaskCard(project) {
    const taskCard = $('<div>')
        .addClass('card project-card draggable my-3')
        .attr('data-project-id', project.id);
  
    const cardHeader = $('<div>').addClass('card-header h4').text(project.name);
  
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(project.type);
    const cardDueDate = $('<p>').addClass('card-text').text(project.dueDate);

    const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-project-id', project.id);
    cardDeleteBtn.on('click', handleDeleteTask);
 
  if (project.dueDate && project.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(project.dueDate, 'DD/MM/YYYY');

   
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }
  

    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);
    return taskCard;
  
}


// Create a function to render the task list and make cards draggable
function renderTaskList() {
    const projects = readProjectsFromStorage();
    console.log(projects)

  // ? Empty existing project cards out of the lanes
  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

 
  for (let project of projects) {
    if (project.status === 'to-do') {
      todoList.append(createTaskCard(project));
    } else if (project.status === 'in-progress') {
      inProgressList.append(createTaskCard(project));
    } else if (project.status === 'done') {
      doneList.append(createTaskCard(project));
    }
  }

 
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,

    helper: function (e) {

      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
    
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// Create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

  
  const projectName = projectNameInputEl.val().trim();
  const projectType = projectTypeInputEl.val(); // don't need to trim select input
  const projectDate = projectDateInputEl.val(); // yyyy-mm-dd format


  const newProject = {
    id: crypto.randomUUID(),
    name: projectName,
    type: projectType,
    dueDate: projectDate,
    status: 'to-do',
  }
  

  const projects = readProjectsFromStorage();
  projects.push(newProject);
  console.log(projects);


  saveProjectsToStorage(projects);


  renderTaskList();

  projectNameInputEl.val('');
  projectTypeInputEl.val('');
  projectDateInputEl.val('');
}

// Create a function to handle deleting a task
function handleDeleteTask(event){
    const projectId = $(this).attr('data-project-id');
    const projects = readProjectsFromStorage();

    console.log(projectId);

 
  projects.forEach((project) => {
    if (project.id === projectId) {
      projects.splice(projects.indexOf(project), 1);
    }
  });


  saveProjectsToStorage(projects);


  renderTaskList(projects);
}





// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {

  const projects = readProjectsFromStorage();


  const taskId = ui.draggable[0].dataset.projectId;
  console.log(ui.draggable[0].dataset)


  const newStatus = event.target.id;
  console.log(newStatus)

  for (let project of projects) {
    console.log(project.id + "|" + taskId)

    if (project.id === taskId) {
      project.status = newStatus;
    }
  }

  localStorage.setItem('projects', JSON.stringify(projects));
  renderTaskList();
}


submitBtn.addEventListener('click', handleAddTask);


// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

    renderTaskList();

  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });


  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
    
 
   });   
});

