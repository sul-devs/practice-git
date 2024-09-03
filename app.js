// Confirmation screen
const confirmationScreen = document.querySelector("#confirmation-screen")

// Review your tasks
const taskListScreen = document.querySelector("#task-list-screen")
const taskList = document.querySelector("#task-list")
const addAnotherTaskBtn = document.querySelector(".add-another-task-btn")
const reviewTasksBtn = document.querySelector(".review-tasks-btn")
let task

// module: setupDatabase
const setupDatabase = () => {
  let db

  const openRequest = window.indexedDB.open("prioritasker-db", 1)

  openRequest.addEventListener("error", () => {
    console.error(`Database failed to open`)
  })
  openRequest.addEventListener("success", () => {
    console.log("Database is open")
    db = openRequest.result
    updateDisplayOfTasks()
  })
  openRequest.addEventListener("upgradeneeded", (e) => {
    db = e.target.result
    const objectStore = db.createObjectStore("prioritasker-os", {
      keyPath: "id",
      autoIncrement: true,
    })

    objectStore.createIndex("contents", "contents", { unique: false })
    objectStore.createIndex("quadrant", "quadrant", { unique: false })
    objectStore.createIndex("isComplete", "isComplete", { unique: false })

    console.log("Database setup complete")
  })
}
// *

// addTaskScreen
const submitTaskScreen = document.querySelector("#add-task-screen")
const input = document.querySelector("#input")
const submitTaskForm = document.querySelector("#submit-task-form")

const taskRecordObject = {}

const submitTask = function (e) {
  e.preventDefault()
  task = input.value.trim()
  quizTitle.textContent = `${task}`
  submitTaskScreen.classList.add("hidden")
  submitQuizScreen.classList.remove("hidden")
  taskRecordObject.contents = `${task}`
  taskRecordObject.isComplete = false
}

submitTaskForm.addEventListener("submit", submitTask)

// answerQuizScreen
const submitQuizScreen = document.querySelector("#quiz-screen")
const submitQuizForm = document.querySelector("#submit-quiz-form")
const quizTitle = document.querySelector(".quiz-title")

// module: calcTaskDirection
const calcTaskDirection = function () {
  const urgent = document.getElementById("urgent")
  const notUrgent = document.getElementById("not-urgent")
  const important = document.getElementById("important")
  const notImportant = document.getElementById("not-important")
  const urgentChecked = urgent.checked
  const notUrgentChecked = notUrgent.checked
  const importantChecked = important.checked
  const notImportantChecked = notImportant.checked
  if (urgentChecked && importantChecked) {
    return "Do Now"
  } else if (notUrgentChecked && importantChecked) {
    return "Schedule"
  } else if (urgentChecked && notImportantChecked) {
    return "Delegate"
  } else {
    return "Delete"
  }
}

// module: addTaskToDB
const addtaskRecordObjectToDatabase = function () {
  const transaction = db.transaction(["prioritasker-os"], "readwrite")
  const objectStore = transaction.objectStore("prioritasker-os")
  const addRequest = objectStore.add(taskRecordObject)

  addRequest.addEventListener("success", () => {
    input.value = ""
  })

  transaction.addEventListener("complete", () => {
    console.log("Transaction is complete: database modification finished.")
  })
}

// module: deleteTask
function deleteTask(e) {
  const taskId = Number(e.target.parentNode.getAttribute("task-id"))
  const transaction = db.transaction(["prioritasker-os"], "readwrite")
  const objectStore = transaction.objectStore("prioritasker-os")
  const deleteRequest = objectStore.delete(taskId)

  transaction.addEventListener("complete", () => {
    e.target.parentNode.parentNode.removeChild(e.target.parentNode)
    console.log(`Task ${taskId} has been deleted.`)
    if (!taskList.firstChild) {
      const li = document.createElement("li")
      li.textContent = "You have 0 tasks."
      taskList.appendChild(li)
    }
  })
}

const submitQuiz = function () {
  taskRecordObject.quadrant = computeTaskDirections()

  addtaskRecordObjectToDatabase()
  updateDisplayOfTasks()
}
submitQuizForm.addEventListener("submit", submitQuiz)

// module: renderTasks
function updateDisplayOfTasks() {
  const taskCard = document.createElement("li")
  const taskDirections = document.createElement("span")
  const taskText = document.createElement("p")
  const deleteTaskBtn = document.createElement("button")
  const editTaskBtn = document.createElement("button")
  const completeTaskBtn = document.createElement("button")

  while (taskList.firstChild) {
    taskList.removeChild(taskList.firstChild)
  }

  const objectStore = db

    .transaction("prioritasker-os")
    .objectStore("prioritasker-os")

  objectStore.openCursor().addEventListener("success", (event) => {
    const cursor = event.target.result
    if (cursor) {
      taskCard.classList.add("task-card")
      taskDirections.classList.add("task-directions")
      taskDirections.textContent = cursor.value.quadrant
      // Colours quadrant tag in card
      switch (taskDirections.textContent) {
        case "Do Now":
          taskDirections.classList.add("do-now")
          break
        case "Schedule":
          taskDirections.classList.add("schedule")
          break
        case "Delegate":
          taskDirections.classList.add("delegate")
          break
        case "Delete":
          taskDirections.classList.add("delete")
          break
      }

      // Task text
      taskText.classList.add("task-text")
      taskText.textContent = cursor.value.contents

      // Buttons
      deleteTaskBtn.classList.add("delete-task-btn", "btn")
      deleteTaskBtn.textContent = "Delete"
      editTaskBtn.classList.add("edit-task-btn", "btn")
      editTaskBtn.textContent = "Edit"
      completeTaskBtn.classList.add("complete-task-btn", "btn")
      completeTaskBtn.textContent = "Complete"

      // Compose task card
      taskCard.append(
        taskText,
        taskDirections,
        editTaskBtn,
        completeTaskBtn,
        deleteTaskBtn
      )

      taskCard.setAttribute("task-id", cursor.value.id)
      taskList.appendChild(taskCard)

      // Manage task buttons
      deleteTaskBtn.addEventListener("click", deleteTask)
      editTaskBtn.addEventListener("click", editTask)
      completeTaskBtn.addEventListener("click", completeTask)

      // Keep iterating through records
      cursor.continue()
    } else {
      // Message if user 0 tasks
      if (!taskList.firstChild) {
        const li = document.createElement("li")
        li.textContent = "You have 0 tasks."
        taskList.appendChild(li)
      }
      // Report when tasks have been rendered
      console.log("All available tasks have been displayed")
    }
  })
}

// Go to review task list screen
reviewTasksBtn.addEventListener("click", () => {
  confirmationScreen.classList.add("hidden")
  taskListScreen.classList.remove("hidden")
})

// Add another task
addAnotherTaskBtn.addEventListener("click", () => {
  confirmationScreen.classList.add("hidden")
  submitTaskScreen.classList.remove("hidden")
})

// Edit task
function editTask(e) {}

// Complete task
function completeTask(e) {}
