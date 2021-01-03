import { createStore, combineReducers } from 'redux'
import { CalendarItem, Child } from '@skolplattformen/embedded-api/dist/types'
import { Hook, ReloadableState, Part, State } from './types'
import api from './api'
import { createPart } from './store'
import { useEffect, useState } from 'react'

const children = createPart<Child[], []>(
  'children',
  () => 'all',
  () => api.getChildren(),
  []
)

const calendar = createPart<CalendarItem[], [Child]>(
  'calendar',
  c => c.id,
  (c) => api.getCalendar(c),
  []
)

const reducers = combineReducers({
  children: children.slice.reducer,
  calendar: calendar.slice.reducer,
})
const store = createStore(reducers)
type Store = typeof store

const createHook = <R, A extends any[]>(
  part: Part<R, A>,
  store: Store,
  getState: (key: string) => State<R>
): Hook<R, A> => (...args: A): ReloadableState<R> => {
  const initialState = getState(part.argsToKey(...args)) || part.initialState
  const [state, setState] = useState(initialState)

  store.subscribe(() => {
    const newState = getState(part.argsToKey(...args))
    if (JSON.stringify(newState.data) !== JSON.stringify(state.data)) {
      setState(newState)
    }
  })

  const reload = async (force = true) => {
    if (state.status === 'loading' || (state.status === 'loaded' && !force)) {
      return
    }
    store.dispatch(part.thunk(...args))
  }

  useEffect(() => { reload(false) }, args)

  return {
    ...state,
    reload
  }
}

export const useChildList = createHook<Child[], []>(
  children, store, (key) => store.getState().children[key]
)

export const useCalendar = createHook<CalendarItem[], [Child]>(
  calendar, store, (key) => store.getState()[key]
)
