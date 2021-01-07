// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import {
  CalendarItem,
  Child,
  Classmate,
  MenuItem,
  NewsItem,
  Notification,
  ScheduleItem,
  User,
} from '@skolplattformen/embedded-api/dist/types'
import api from './api'
import { ReloadableState, State } from './types'
import { createAction, createSessionAction } from './actions'
import store from './store'

interface ApiCall<T, A extends any[]> { (...args: A): Promise<T> }
interface KeyFunc<A extends any[]> { (...args: A): string }

// eslint-disable-next-line max-len
const createEntityHook = <T, A extends any[]>(entity: string, apiCall: ApiCall<T, A>, keyFunc: KeyFunc<A>, empty: T) => (
  (...args: A): ReloadableState<T> => {
    const getState = (): State<T> => {
      const state: any = store.getState()
      return state[entity][keyFunc(...args)] || { status: 'pending', data: empty }
    }

    let isMounted = false

    const initial = getState()
    const [state, setState] = useState<State<T>>(initial)

    // Listen for changes in the store
    store.subscribe(() => {
      if (!isMounted) return

      const newState = getState()
      if (newState && JSON.stringify(state) !== JSON.stringify(newState)) {
        if (!newState.data) newState.data = empty
        setState(newState)
      }
    })

    // Load data from cache and API
    const reload = async (force = true) => {
      // allready loading or done
      if (state.status === 'loading' || (state.status === 'loaded' && !force)) {
        return
      }

      // first load - call cache
      if (state.status === 'pending') {
        const action = createAction<T>('CALL_CACHE', {
          entity,
          key: keyFunc(...args),
        })
        store.dispatch(action)
      }

      // call api
      const action = createAction<T>('CALL_API', {
        entity,
        key: keyFunc(...args),
        apiCall: () => apiCall(...args),
      })
      store.dispatch(action)
    }

    useEffect(() => {
      isMounted = true
      reload(false)
      return () => {
        isMounted = false
      }
    }, args)

    return { ...state, reload }
  }
)

api.on('login', () => store.dispatch(createSessionAction('LOGIN', { isFake: api.isFake })))
api.on('logout', () => store.dispatch(createSessionAction('LOGOUT')))

// Hooks
export const useApi = () => {
  let isMounted = false
  const [isLoggedIn, setIsLoggedIn] = useState(api.isLoggedIn)
  const [isFake, setIsFake] = useState(api.isFake)
  const [cookie, setCookie] = useState(api.getSessionCookie())

  store.subscribe(() => {
    if (!isMounted) return

    const newState = store.getState().session
    if (newState.isLoggedIn !== isLoggedIn) {
      setIsLoggedIn(newState.isLoggedIn)
    }
    if (newState.isFake !== isFake) {
      setIsFake(newState.isFake)
    }
    if (!newState.isFake) {
      setCookie(newState.isLoggedIn ? api.getSessionCookie() : undefined)
    }
  })

  useEffect(() => {
    isMounted = true
    return () => {
      isMounted = false
    }
  }, [])

  return {
    isLoggedIn,
    isFake,
    cookie,
    login: (personalNumber: string) => api.login(personalNumber),
    logout: () => api.logout(),
    on: (event: 'login' | 'logout', listener: () => any) => api.on(event, listener),
    once: (event: 'login' | 'logout', listener: () => any) => api.once(event, listener),
    off: (event: 'login' | 'logout', listener: () => any) => api.off(event, listener),
  }
}
export const useCalendar = createEntityHook<CalendarItem[], [Child]>(
  'calendar', (child) => api.getCalendar(child), (child) => child.id, [],
)
export const useChildList = createEntityHook<Child[], []>(
  'children', () => api.getChildren(), () => 'all', [],
)
export const useClassmates = createEntityHook<Classmate[], [Child]>(
  'classmates', (child) => api.getClassmates(child), (child) => child.id, [],
)
export const useMenu = createEntityHook<MenuItem[], [Child]>(
  'menu', (child) => api.getMenu(child), (child) => child.id, [],
)
export const useNews = createEntityHook<NewsItem[], [Child]>(
  'news', (child) => api.getNews(child), (child) => child.id, [],
)
export const useNotifications = createEntityHook<Notification[], [Child]>(
  'notifications', (child) => api.getNotifications(child), (child) => child.id, [],
)
export const useSchedule = createEntityHook<ScheduleItem[], [Child, DateTime, DateTime]>(
  'schedule',
  (child, from, to) => api.getSchedule(child, from, to),
  (child, from, to) => [child.id, from.toISODate(), to.toISODate()].join('_'),
  [],
)
export const useUser = createEntityHook<User | null, []>(
  'user', () => api.getUser(), () => 'me', {},
)
