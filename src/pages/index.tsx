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
interface Todo {
  id: number;
  body: string;
  status: 'completed' | 'pending';

}

interface TodoStatus {
  id: number;
  status: string;
  queryStatus: ('completed' | 'pending')[];
}

interface State {
  todoStatus: TodoStatus[];
  selectedTab: string;
  queryStatus: ('completed' | 'pending')[];
  dataTodos: Todo[];
  loading: boolean;
  error: string | null;
}

interface SetSelectedTabAction {
  type: 'SET_SELECTED_TAB';
  payload: string;
}

interface SetDataApiAction {
  type: 'SET_DATA_API';
  payload: Todo[];
}

interface UpdateTodoAction {
  type: 'UPDATE_TODO';
  payload: {
    todoId: number;
    status: 'completed' | 'pending';
  };
}

interface DeleteTodoAction {
  type: 'DELETE_TODO';
  payload: number;
}

interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}
interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string | null;
}

type Action = SetSelectedTabAction | SetDataApiAction | UpdateTodoAction | DeleteTodoAction | SetLoadingAction | SetErrorAction;

const initStates: State = {
  todoStatus: [
    {
      id: 1,
      status: 'All',
      queryStatus: ['completed', 'pending'],
    },
    {
      id: 2,
      status: 'Pending',
      queryStatus: ['pending'],
    },
    {
      id: 3,
      status: 'Completed',
      queryStatus: ['completed'],
    },
  ],
  selectedTab: 'all',
  queryStatus: ['completed', 'pending'],
  dataTodos: [],
  loading: true,
  error: null,
};

const action = {
  SET_SELECTED_TAB: (payload: string): SetSelectedTabAction => ({
    type: 'SET_SELECTED_TAB',
    payload,
  }),
  SET_LOADING: (payload: boolean): SetLoadingAction => ({
    type: 'SET_LOADING',
    payload,
  }),
  SET_ERROR: (payload: string | null): SetErrorAction => ({
    type: 'SET_ERROR',
    payload,
  }),
  SET_DATA_API: (payload: Todo[]): SetDataApiAction => ({
    type: 'SET_DATA_API',
    payload,
  }),
  UPDATE_TODO: (payload: { todoId: number; status: 'completed' | 'pending' }): UpdateTodoAction => ({
    type: 'UPDATE_TODO',
    payload,
  }),
  DELETE_TODO: (payload: number): DeleteTodoAction => ({
    type: 'DELETE_TODO',
    payload,
  }),
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SELECTED_TAB':
      return {
        ...state,
        selectedTab: action.payload,
        queryStatus: state.todoStatus.find((item) => item.status.toLowerCase() === action.payload.toLowerCase())?.queryStatus || [],
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_DATA_API':
      const sortedData = action.payload.sort((a, b) => b.id - a.id);
      return {
        ...state,
        dataTodos: sortedData,
      };
    case 'UPDATE_TODO':
      const { dataTodos } = state;
      const newDataTodos = dataTodos.map((item) => {
        if (item.id === action.payload.todoId) {
          return {
            ...item,
            status: action.payload.status,
          };
        }
        return item;
      });
      return {
        ...state,
        dataTodos: state.selectedTab === 'all' ? newDataTodos : newDataTodos.filter((item) => item.id !== action.payload.todoId),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        dataTodos: state.dataTodos.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
};

const Index = () => {
  const [state, dispatch] = useReducer(reducer, initStates)
  const { queryStatus } = state;
  const { data: dataTodos = [], isLoading, isError, error: queryError } = api.todo.getAll.useQuery({
    statuses: queryStatus,
  });
  const { mutate: updateTodoStatus } = api.todoStatus.update.useMutation()
  const { mutate: deleteTodo } = api.todo.delete.useMutation()

  useEffect(() => {
    let error: string | null = null;
    let loading = false;

    if (isLoading) {
      loading = true;
    } else if (isError) {
      error = queryError?.message || 'An error while loading data';
    } else {
      dispatch(action.SET_DATA_API(dataTodos));
    }
    dispatch(action.SET_LOADING(loading));
    dispatch(action.SET_ERROR(error));
  }, [dataTodos, isLoading, isError, queryError]);


  const handleSelectedTab = (value: string) => {
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
            {state.error ? (
              <div className="text-center text-red-500">{state.error}</div>
            ) : state.loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : (
              <TodoList
                dataTodos={state.dataTodos}
                selectedTab={state.selectedTab}
                handleUpdateTodoList={handleUpdateTodoList}
                handleDeleteTodo={handleDeleteTodo}
              />
            )}
          </div>

          {state.selectedTab !== 'completed' ? (
            <div className="pt-10">
              <CreateTodoForm />
            </div>

          ) :
            <div className="pt-10">
              <p className="text-center text-gray-700">
                Change to &quot;Pending or All&quot; tab to create new todo
              </p>
            </div>
          }
        </Tabs.Root>
      </div>
    </main>
  )
}

export default Index
