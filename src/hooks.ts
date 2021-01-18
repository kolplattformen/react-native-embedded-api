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
import { createAction } from './actions'
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

    let mounted = false

    const initial = getState()
    const [state, setState] = useState<State<T>>(initial)

    // Listen for changes in the store
    store.subscribe(() => {
      if (!mounted) return

      const newState = getState()
      if (newState && JSON.stringify(state) !== JSON.stringify(newState)) {
        if (!newState.data) newState.data = empty
        setState(newState)
      }
    })

    // Load data from cache and API
    const reload = async (force = true) => {
      // not logged in
      if (!api.isLoggedIn) return

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

    const sessionListener = () => {
      if (!mounted) return
      if (api.isLoggedIn) {
        reload(false)
      } else {
        setState({ status: 'pending', data: empty })
      }
    }

    useEffect(() => {
      mounted = true
      api.on('login', sessionListener)
      api.on('logout', sessionListener)

      if (api.isLoggedIn) reload(false)
      return () => {
        mounted = false
        api.off('login', sessionListener)
        api.off('logout', sessionListener)
      }
    }, args)

    return { ...state, reload }
  }
)

// Hooks
export const useApi = () => {
  let mounted = false
  const [isLoggedIn, setIsLoggedIn] = useState(api.isLoggedIn)
  const [isFake, setIsFake] = useState(api.isFake)
  const [cookie, setCookie] = useState(api.getSessionCookie())

  const sessionListener = () => {
    if (!mounted) return
    setIsLoggedIn(api.isLoggedIn)
    setIsFake(api.isFake)
    if (!api.isFake) {
      setCookie(api.isLoggedIn ? api.getSessionCookie() : undefined)
    }
  }

  useEffect(() => {
    mounted = true
    api.on('login', sessionListener)
    api.on('logout', sessionListener)

    return () => {
      mounted = false
      api.off('login', sessionListener)
      api.off('logout', sessionListener)
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
  'children', () => api.getChildren(), () => api.getPersonalNumber() || '', [],
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
  'user', () => api.getUser(), () => api.getPersonalNumber() || '', {},
)
