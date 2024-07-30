import { useState, useEffect, useRef } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import autoAnimate from '@formkit/auto-animate';
import type { SVGProps } from 'react';

/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */

export const TodoList = (props: any) => {
  const { dataTodos, handleUpdateTodoList, handleDeleteTodo } = props
  const [parent, enableAnimations] = useAutoAnimate()
  const [show, setShow] = useState(false)
  const [itemId, setItemId] = useState(0)
  const parent2 = useRef(null)

  useEffect(() => {
    parent2.current && autoAnimate(parent2.current)
  }, [parent2])
  const reveal = (itemId: number) => {
    setShow(!show)
    setItemId(itemId)
  }

  const renderCSS = (status: 'completed' | 'pending') => {
    if (status === 'completed') {
      return 'line-through text-gray-500 bg-darker'
    }
    return 'text-gray-700'
  }

  return (
    <ul className="grid grid-cols-1 gap-y-3" ref={parent}>
      {dataTodos && dataTodos.length > 0 ? dataTodos.map((todo: any) => (
        <li key={todo.id}>
          <div className={`flex items-center rounded-12 border border-gray-200 p-custom shadow-sm ${renderCSS(todo.status)} overflow-hidden`}>
            <Checkbox.Root
              id={String(todo.id)}
              onClick={() => {
                handleUpdateTodoList(todo.id, todo.status === 'completed' ? 'pending' : 'completed')
              }}
              checked={todo.status === 'completed'}
              className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
            >
              <Checkbox.Indicator>
                <CheckIcon className="h-4 w-4 text-white" />
              </Checkbox.Indicator>
            </Checkbox.Root>

            <label
              className={`block pl-3 font-medium font-inter flex-1 text-gray-900 truncate`}
              htmlFor={String(todo.id)}
            >
              {todo.body}

            </label>
            <button
              className="ml-auto p-1 hover:text-red-600"
              aria-label="Delete"
            >
              <XMarkIcon
                onClick={() =>
                  handleDeleteTodo(todo.id)
                }
                className="h-5 w-5" />
            </button>
          </div>
          {/* <div className=''>Xem thêm
          </div>
          <textarea className='w-full' disabled={true} value={todo.body}> </textarea> */}
          {todo.body.length >= 30 ?
            <div ref={parent2} className='flex flex-col '>
              <strong className="dropdown-label cursor-pointer" onClick={() => reveal(todo.id)}>Show More</strong>
              {show && todo.id === itemId &&
                <div
                  className="dropdown-content">
                  <textarea className='w-full' disabled={true} value={todo.body}> </textarea>
                </div>}
            </div>
            : <></>}
        </li>
      )) : <>
        <div>
          <p className="text-gray-700">You have no {props.selectedTab !== 'all' && props.selectedTab} tasks in your to-do list. </p>
        </div>
      </>
      }
    </ul >
  )
}

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
