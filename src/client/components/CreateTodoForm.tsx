import type { FormEvent } from 'react'; // type

import React, { useState } from 'react'; // builtin

import { api } from '@/utils/client/api'; // internal
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

interface InputValidationProps {
  name: string
  onChanged: (name: string, value: string, msgError: string) => void
  onFocus?: () => void
  onKeyUp?: () => void
  handleEnter?: () => void
  handleBlur?: () => void
  required?: boolean
  requiredMsg?: string
  minLength?: number
  minLengthMsg?: string
  maxLength?: number
  maxLengthMsg?: string
}

const useInputValidation = (props: InputValidationProps) => {
  const [isValid, setIsValid] = useState<boolean>(true)
  const [msgInvalid, setMsgInvalid] = useState<string>('')
  const [value, setValue] = useState<string>('')

  const onlySpaces = (str: string) => str.trim().length === 0

  const validateInput = (value: string) => {
    let msg = ''
    if (value == null || value === '' || onlySpaces(value)) {
      if (props.required) {
        msg = props.requiredMsg ? props.requiredMsg : CONSTANTS.MSG_REQUIRED
      }
    } else {
      if (props.minLength && value.length < props.minLength) {
        msg = props.minLengthMsg
          ? props.minLengthMsg
          : CONSTANTS.MSG_MIN_LENGTH_INVALID.replace(
            '##',
            props.minLength.toString()
          )
      } else if (props.maxLength && value.length > props.maxLength) {
        msg = props.maxLengthMsg
          ? props.maxLengthMsg
          : CONSTANTS.MSG_MAX_LENGTH_INVALID.replace(
            '##',
            props.maxLength.toString()
          )
      }
    }
    return msg
  }

  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const msgError = validateInput(newValue)
    setIsValid(msgError === '')
    setMsgInvalid(msgError)
    setValue(newValue)
    props.onChanged(props.name, newValue, msgError)
  }

  const handleFocus = () => {
    if (props.onFocus) {
      props.onFocus()
    }
  }

  const handleKeyUp = () => {
    if (props.onKeyUp) {
      props.onKeyUp()
    }
  }

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && props.handleEnter) {
      setValue('')
      props.handleEnter()
    }
  }

  const handleBlur = () => {
    if (props.handleBlur) {
      props.handleBlur()
    }
  }

  return {
    isValid,
    msgInvalid,
    value,
    handleChanged,
    handleFocus,
    handleKeyUp,
    handleEnter,
    handleBlur,
    validateInput,
  }
}

export const CreateTodoForm: React.FC = () => {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const apiContext = api.useContext()

  const { mutate: createTodo, isLoading: isCreatingTodo } =
    api.todo.create.useMutation({
      onSuccess: () => {
        apiContext.todo.getAll.refetch()
        setError('')
      },
      onError: () => {
        setError('Failed to create todo')
      },
    })

  const _handleFocus = () => {
    const formInputElement = document.getElementById('form_create_to_do')
    if (formInputElement) {
      formInputElement.classList.remove('border-[#f96a74]')
    }
  }

  const _handleBlur = () => {
    const formInputElement = document.getElementById('form_create_to_do')
    if (formInputElement && error) {
      formInputElement.classList.add('border-[#f96a74]')
    }
  }
  const {
    handleChanged,
    handleFocus,
    handleKeyUp,
    handleEnter,
    handleBlur,
    validateInput,
  } = useInputValidation({
    name: 'toDo',
    onChanged: (name, value, msgError) => {
      setValue(value)
      setError(msgError)
    },
    handleBlur: _handleBlur,
    onFocus: _handleFocus,
    required: true,
    requiredMsg: 'This field cannot be empty',
    minLength: 2,
    maxLength: 50,
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validateInput(value)) {
      setError(validateInput(value))
      return
    }
    createTodo({
      body: value.trim(),
    })
    setValue('')
  }

  return (
    <div>
      <form
        id="form_create_to_do"
        className="group flex items-center justify-between rounded-12 border border-gray-200 py-2 pr-4 focus-within:border-gray-400"
        onSubmit={handleSubmit}
      >
        <label htmlFor={TODO_INPUT_ID} className="sr-only">
          Add todo
        </label>

        <input
          id={TODO_INPUT_ID}
          type="text"
          placeholder="Add todo"
          value={value}
          onChange={handleChanged}
          onFocus={handleFocus}
          onKeyUp={handleKeyUp}
          onKeyDown={handleEnter}
          onBlur={handleBlur}
          className="flex-1 px-4 text-base placeholder:text-gray-400 focus:outline-none"
        />
        <button
          className="font-700 text-14 flex cursor-pointer items-center justify-center rounded-full bg-gray-800 px-5 py-2 text-white"
          type="submit"
          disabled={isCreatingTodo}
        >
          Add
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-[#e53e3e] ">{error}</p>}
    </div>
  )
}

const TODO_INPUT_ID = 'todo-input-id'
const CONSTANTS = {
  MSG_REQUIRED: 'This field is required.',
  MSG_MIN_LENGTH_INVALID: 'Minimum length is ##',
  MSG_MAX_LENGTH_INVALID: 'Maximum length is ##',
}