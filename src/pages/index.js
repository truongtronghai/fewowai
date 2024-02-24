import { useRef, useState, useEffect } from "react"

export default function Home() {
  const fakeUserId = 5
  const urlGetTodos = `https://dummyjson.com/todos/user/${fakeUserId}`

  const urlAddTodo = `https://dummyjson.com/todos/add`
  const [cache, setCache] = useState([])
  const [todoList, setTodoList] = useState(null)
  const inputTitle = useRef(null)
  const inputDesc = useRef(null)
  const [isDisabled, setIsDisabled] = useState(true)
  const [whatIsChecked, setWhatIsChecked] = useState(1)

  useEffect(() => {
    const dataTodoList = localStorage.getItem("todos")
    setIsDisabled(true)
    if (dataTodoList === null) {
      fetch(urlGetTodos)
        .then((res) => res.json())
        .then((data) => {
          const todos = data.todos.map((item) => {
            return { ...item, todo: item.todo + "|fake description" }
          })
          localStorage.setItem("todos", JSON.stringify(todos))

          setCache(todos)
        })
    } else {
      setCache(JSON.parse(dataTodoList))
    }
  }, [])

  useEffect(() => {
    console.log("Cache changed ===> ", cache)
    localStorage.setItem("todos", JSON.stringify(cache))
    updateTodoList(cache)
  }, [cache])

  const updateTodoList = (todos) => {
    setTodoList(
      todos.map((item) => {
        return (
          <li key={item.id} className="border-b-2 border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.completed}
                className="mr-2"
                onChange={() => handleChangeCheckbox(item.id)}
              />
              <div className="flex flex-col grow">
                <input
                  id={`title${item.id}`}
                  className={`${item.completed ? "line-through" : ""}`}
                  defaultValue={item.todo.split("|")[0]}
                />
                <input
                  id={`desc${item.id}`}
                  className={`${
                    item.completed ? "line-through" : ""
                  } text-gray-300`}
                  defaultValue={item.todo.split("|")[1]}
                />
              </div>
              <button
                className="ml-2 rounded bg-blue-500 text-white w-14 hover:bg-blue-800 mr-1"
                onClick={() => handleEditItem(item.id)}
              >
                Update
              </button>
              <button
                className="rounded bg-orange-500 text-white w-14 hover:bg-orange-800"
                onClick={() => handleDeleteItem(item.id)}
              >
                Delete
              </button>
            </div>
          </li>
        )
      })
    )
  }
  const handleAddItem = () => {
    fetch(urlAddTodo, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo: `${inputTitle.current.value}|${inputDesc.current.value}`,
        completed: false,
        userId: fakeUserId
      })
    })
      .then((res) => res.json())
      .then((todo) => {
        // need this variable to make saving to localStorage exactly because setCache() is async
        const newdata = [
          ...cache,
          { ...todo, id: Math.floor(Math.random() * 1000) }
        ]

        setCache(newdata)
        localStorage.setItem("todos", JSON.stringify(newdata))
        inputTitle.current.value = ""
        inputDesc.current.value = ""
        setIsDisabled(true)
        setWhatIsChecked(1)
      })
  }
  const handleEditItem = (todoId) => {
    const titleInput = document.getElementById(`title${todoId}`)
    const descInput = document.getElementById(`desc${todoId}`)
    const tmpArr = [...cache]

    if (titleInput.value.trim() === "") {
      titleInput.value = titleInput.defaultValue
      return
    }

    if (
      titleInput.value.trim() !== titleInput.defaultValue ||
      descInput.value.trim() !== descInput.defaultValue
    ) {
      tmpArr[
        tmpArr.findIndex((e) => e.id == todoId)
      ].todo = `${titleInput.value}|${descInput.value}`
      setCache(tmpArr)
    }
  }
  const handleDeleteItem = (todoId) => {
    const tmpArr = [...cache]
    tmpArr.splice(
      tmpArr.findIndex((e) => e.id == todoId),
      1
    )
    setCache(tmpArr)
  }
  const handleChangeCheckbox = (todoId) => {
    const tmpArr = [...cache]
    const i = tmpArr.findIndex((e) => e.id == todoId)
    tmpArr[i].completed = !tmpArr[i].completed
    updateTodoList(tmpArr)
    setCache(tmpArr)
  }

  const checkValidAdd = (ev) => {
    if (ev.target.value.trim() === "") {
      setIsDisabled(true)
      ev.target.classList.add("border-[#ff0000]")
    } else {
      setIsDisabled(false)
      ev.target.classList.remove("border-[#ff0000]")
    }
  }

  const handleFilter = (ev) => {
    const choices = {
      all: 1,
      completed: 2,
      pending: 3
    }
    setWhatIsChecked(choices[ev.target.value])

    const tmpArr = cache.filter((e) => {
      switch (ev.target.value) {
        case "all":
          return true
        case "completed":
          return e.completed === true
        case "pending":
          return e.completed === false
      }
    })
    updateTodoList(tmpArr)
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Wow Todo List</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col gap-x-2">
          <input
            type="text"
            placeholder="Title"
            className="w-full border rounded p-2 mb-2"
            ref={inputTitle}
            onBlur={checkValidAdd}
          />
          <input
            type="text"
            placeholder="Description"
            className="w-full border rounded p-2 mb-2"
            ref={inputDesc}
          />
          <button
            className={`rounded w-24 mb-2 text-white  ${
              isDisabled
                ? "bg-gray-500 cursor-not-allowed focus:outline-none disabled:opacity-75"
                : "bg-blue-500 hover:bg-blue-800"
            }`}
            onClick={handleAddItem}
            disabled={isDisabled}
          >
            Add
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-white rounded-lg shadow p-4 mt-5">
        <div className="flex flex-row justify-end">
          <div className="flex flex-row justify-between gap-1 rounded-lg bg-slate-100 p-2 shadow">
            <span>Filter : </span>
            <div className="flex items-center">
              <label
                htmlFor="filterAll"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                All
              </label>
              <input
                className="w-4 h-4 ml-1 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="radio"
                value="all"
                id="filterAll"
                name="filter"
                checked={whatIsChecked == 1}
                onChange={handleFilter}
              />
            </div>
            <div className="flex items-center">
              <label
                htmlFor="filterCompleted"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Completed
              </label>
              <input
                className="w-4 h-4 ml-1 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="radio"
                value="completed"
                id="filterCompleted"
                name="filter"
                checked={whatIsChecked == 2}
                onChange={handleFilter}
              />
            </div>
            <div className="flex items-center">
              <label
                htmlFor="filterPending"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Pending
              </label>
              <input
                className="w-4 h-4 ml-1 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="radio"
                value="pending"
                id="filterPending"
                name="filter"
                checked={whatIsChecked == 3}
                onChange={handleFilter}
              />
            </div>
          </div>
        </div>
        <ul className="my-2 space-y-2">{todoList}</ul>
      </div>
    </>
  )
}
