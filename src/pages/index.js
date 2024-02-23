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
      <div className="bg-white rounded-lg shadow p-4 mt-5">
        <ul className="space-y-2">{todoList}</ul>
      </div>
    </>
  )
}
