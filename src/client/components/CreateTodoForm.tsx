import { FormEvent, useState } from 'react'

import { api } from '@/utils/client/api'

/**
 * QUESTION 1:
 * -----------
 * Style the "Add" button so that it looks like the design in Figma.
 *
 * NOTE: You must use tailwindcss and className. Do not use other methods (eg.
 * inline styles, separate css files, css modules, etc.) unless absolutely
 * necessary. This applies to all styling-related questions in this assignment.
 *
 * Documentation references:
 *  - https://tailwindcss.com
 *  - https://www.youtube.com/watch?v=mr15Xzb1Ook
 *
 *
 *
 * QUESTION 2:
 * -----------
 * Currently our form is not keyboard accessible. Users cannot hit
 * <Enter> right after typing to submit the form (add new todo). Fix this issue.
 */

export const CreateTodoForm = () => {
  const [todoBody, setTodoBody] = useState('')

  const apiContext = api.useContext()

  const { mutate: createTodo, isLoading: isCreatingTodo } =
    api.todo.create.useMutation({
      onSuccess: () => {
        apiContext.todo.getAll.refetch()
      },
    })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createTodo({
      body: todoBody.trim(),
    })
    setTodoBody('')
  }

  return (
    <form className="group flex items-center justify-between rounded-12 border border-gray-200 py-2 pr-4 focus-within:border-gray-400"
      onSubmit={handleSubmit}
    >
      <label htmlFor={TODO_INPUT_ID} className="sr-only">
        Add todo
      </label>

      <input
        id={TODO_INPUT_ID}
        type="text"
        placeholder="Add todo"
        value={todoBody}
        onChange={(e) => {
          setTodoBody(e.target.value)
        }}
        className="flex-1 px-4 text-base placeholder:text-gray-400 focus:outline-none"
      />
      <button
        className='flex cursor-pointer justify-center items-center rounded-full px-5 py-2 bg-gray-800 text-white font-700 text-14'
        type="submit"
        disabled={isCreatingTodo}
      >
        Add
      </button>


    </form >
  )
}

const TODO_INPUT_ID = 'todo-input-id'
