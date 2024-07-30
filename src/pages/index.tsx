import * as Tabs from '@radix-ui/react-tabs'
import { useReducer, useEffect } from 'react'
import { CreateTodoForm } from '@/client/components/CreateTodoForm'
import { TodoList } from '@/client/components/TodoList'
import { api } from '@/utils/client/api'

/**
 * QUESTION 6:
 * -----------
 * Implement quick filter/tab feature so that we can quickly find todos with
 * different statuses ("pending", "completed", or both). The UI should look like
 * the design on Figma.
 *
 * NOTE:
 *  - For this question, you must use RadixUI Tabs component. Its Documentation
 *  is linked below.
 *
 * Documentation references:
 *  - https://www.radix-ui.com/docs/primitives/components/tabs
 */

const initStates = {
  todoStatus: [
    {
      id: 1,
      status: "All",
      queryStatus: ['completed', 'pending'],
    },
    {
      id: 2,
      status: "Pending",
      queryStatus: ['pending']
    },
    {
      id: 3,
      status: "Completed",
      queryStatus: ['completed']
    }
  ],
  selectedTab: "all",
  queryStatus: ['completed', 'pending'],
  dataTodos: []
}

const action = {
  SET_SELECTED_TAB: (payload: any) => ({
    type: 'SET_SELECTED_TAB',
    payload
  }),
  SET_DATA_API: (payload: any[]) => ({
    type: 'SET_DATA_API',
    payload
  }),
  UPDATE_TODO: (payload: { id: number, status: 'completed' | 'pending' }) => ({
    type: 'UPDATE_TODO',
    payload
  }),
  DELETE_TODO: (payload: number) => ({
    type: 'DELETE_TODO',
    payload
  })
}

const reducer = (state: typeof initStates, action: { type: string, payload: any }) => {
  switch (action.type) {
    case 'SET_SELECTED_TAB':
      return {
        ...state,
        selectedTab: action.payload,
        queryStatus: state.todoStatus.find((item) => item.status.toLocaleLowerCase() === action.payload.toLocaleLowerCase())?.queryStatus
      }
    case 'SET_DATA_API':
      const data = action.payload.sort((a: number, b: number) => - (a.id - b.id))

      console.log("data", data)
      return {
        ...state,
        dataTodos: action.payload
      }
    case 'UPDATE_TODO':
      const { dataTodos } = state
      const status = action.payload.status
      const newDataTodos = dataTodos.map((item: any) => {
        if (item.id === action.payload.todoId) {
          return {
            ...item,
            status: status,
          }
        }
        return item
      })
      if (state.selectedTab === 'all') {
        return {
          ...state,
          dataTodos: newDataTodos
        }
      }
      return {
        ...state,
        dataTodos: newDataTodos.filter((item: any) => item.id !== action.payload.todoId)
      }

    case 'DELETE_TODO':
      const dataTodosAfterDelete = state.dataTodos.filter((item: any) => item.id !== action.payload)
      return {
        ...state,
        dataTodos: dataTodosAfterDelete
      }
    default:
      return state
  }
}

const Index = () => {
  const [state, dispatch] = useReducer(reducer, initStates)
  const { queryStatus } = state;
  const { data: dataTodos = [] } = api.todo.getAll.useQuery({
    statuses: queryStatus,
  });
  const { mutate: updateTodoStatus } = api.todoStatus.update.useMutation()
  const { mutate: deleteTodo } = api.todo.delete.useMutation()

  useEffect(() => {
    dispatch(action.SET_DATA_API(dataTodos))
  }, [dataTodos])

  const handleSelectedTab = (value) => {
    const valueNormalize = value.toLowerCase()
    dispatch(action.SET_SELECTED_TAB(valueNormalize))
  }

  const handleUpdateTodoList = (todoId: number, status: 'completed' | 'pending') => {
    const data = {
      todoId: todoId,
      status,

    }
    updateTodoStatus(data)
    dispatch(action.UPDATE_TODO(data))
  }

  const handleDeleteTodo = (todoId: number) => {
    deleteTodo({
      id: todoId,
    })
    dispatch(action.DELETE_TODO(todoId))

  }

  const renderCSSButton = (selectedTab: string, item: string) => {
    if (selectedTab.toLocaleLowerCase() === item.toLocaleLowerCase()) {
      return "bg-gray-800 text-white"
    } else {
      return "bg-white text-gray-700"
    }
  }

  return (
    <main className="mx-auto w-[480px] pt-12">
      <div className="rounded-12 bg-white p-8 shadow-sm">
        <h1 className="text-center text-4xl font-extrabold text-gray-900">
          Todo App
        </h1>

        <Tabs.Root value={state.selectedTab} onValueChange={(value) => handleSelectedTab(value)}>
          <Tabs.List className="flex pt-5">
            {state.todoStatus.map((item) => (
              <Tabs.Trigger
                key={item.id}
                value={item.status}
                className={`flex border text-14 border-gray-200 justify-center items-center rounded-full px-32 py-2 mr-3 font-700 ${renderCSSButton(state.selectedTab, item.status)}`}
              >
                {item.status}
              </Tabs.Trigger>
            ))}

          </Tabs.List>
          <div className="pt-10">
            <TodoList
              dataTodos={state.dataTodos}
              selectedTab={state.selectedTab}
              handleUpdateTodoList={handleUpdateTodoList}
              handleDeleteTodo={handleDeleteTodo}
            />
          </div>

          <div className="pt-10">
            <CreateTodoForm />
          </div>
        </Tabs.Root>
      </div>
    </main>
  )
}

export default Index
