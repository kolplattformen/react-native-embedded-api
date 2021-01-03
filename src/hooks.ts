import { createStore, combineReducers, Action } from 'redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CalendarItem, Child, Classmate, MenuItem, NewsItem, Notification, ScheduleItem, User } from '@skolplattformen/embedded-api/dist/types'
import { useEffect, useState } from 'react'
import api from './api'

type EntityActionType = 'CALL_API' | 'CALL_CACHE' | 'UPDATE_FROM_API' | 'UPDATE_FROM_CACHE' | 'API_ERROR'
interface EntityAction<T> extends Action<EntityActionType> {
  entity: string
  payload?: T
  error?: Error
  key: string
}
interface EntityActions<T> {
  getFromApi: () => EntityAction<T>
  getFromCache: () => EntityAction<T>
}
interface Map<T> {
  [key: string]: T
}
interface State<T> {
  data?: T
  status: 'pending' | 'loading' | 'loaded'
  error?: SerializedError
}
interface ReloadableState<T> extends State<T> {
  reload: () => Promise<void>
}
interface StateMap<T> extends Map<State<T>> { }

const createEntityReducer = <T>(entity: string) => (
  (state: StateMap<T> = {}, action: EntityAction<T>): StateMap<T> => {
    if (action.entity !== entity) return state
    const current = state[action.key] || { status: 'pending' }
    switch (action.type) {
      case 'CALL_API': {
        return {
          ...state,
          [action.key]: {
            ...current,
            status: 'loading',
            error: undefined,
          }
        }
      }
      case 'UPDATE_FROM_CACHE': {
        return {
          ...state,
          [action.key]: {
            ...current,
            data: action.payload,
          }
        }
      }
      case 'UPDATE_FROM_API': {
        return {
          ...state,
          [action.key]: {
            ...current,
            status: 'loaded',
            data: action.payload,
            error: undefined
          }
        }
      }
      case 'API_ERROR': {
        return {
          ...state,
          [action.key]: {
            ...current,
            status: 'pending',
            error: {
              name: action.error.name,
              message: action.error.message,
              stack: action.error.stack
            }
          }
        }
      }
      default: return state
    }
  }
)
const reducers = {
  calendar: createEntityReducer<CalendarItem[]>('calendar'),
  children: createEntityReducer<Child[]>('children'),
  classmates: createEntityReducer<Classmate[]>('classmates'),
  image: createEntityReducer<Blob>('image'),
  menu: createEntityReducer<MenuItem[]>('menu'),
  news: createEntityReducer<NewsItem[]>('news'),
  notifications: createEntityReducer<Notification[]>('notifications'),
  schedule: createEntityReducer<ScheduleItem[]>('schedule'),
  user: createEntityReducer<User>('user'),
}
let store
export const rebuildStore = () => { store = createStore(combineReducers(reducers)) }
rebuildStore()

const createActions = <T, A extends any[]>(
  entity: string,
  apiCall: (...args: A) => Promise<T>,
  keyFunc: (...args: A) => string,
): EntityActions<T> => {
  const getFromApi = (...args: A) => {
    const key = keyFunc(...args)
    const itemName = `${entity}_${key}`
    apiCall(...args)
      .then((res) => {
        const action: EntityAction<T> = {
          entity,
          key,
          type: 'UPDATE_FROM_API',
          payload: res
        }
        store.dispatch(action)
        return res
      })
      .then((res) => {
        return AsyncStorage
          .setItem(itemName, JSON.stringify(res))
          .catch((err) => console.error(err))
      })
      .catch((err) => {
        const action: EntityAction<T> = {
          entity,
          key,
          type: 'API_ERROR',
          error: err
        }
        store.dispatch(action)
      })
    const action: EntityAction<T> = {
      entity,
      key,
      type: 'CALL_API',
    }
    return action
  }
  const getFromCache = (...args: A) => {
    const key = keyFunc(...args)
    const itemName = `${entity}_${key}`
    AsyncStorage
      .getItem(itemName)
      .then((res) => {
        if (!res) return
        const data: T = JSON.parse(res)
        const action: EntityAction<T> = {
          entity,
          key,
          type: 'UPDATE_FROM_CACHE',
          payload: data,
        }
        store.dispatch(action)
      })
      .catch((err) => console.error(err))

    const action: EntityAction<T> = {
      entity,
      key,
      type: 'CALL_CACHE',
    }
    return action
  }
  return { getFromApi, getFromCache }
}

const createHook = <T, A extends any[]>(
  entity: string,
  apiCall: (...args: A) => Promise<T>,
  keyFunc: (...args: A) => string,
  empty: T
) => (...args: A): ReloadableState<T> => {
  let isMounted = false

  const getState = () => (
    store.getState()[entity][keyFunc(...args)] || { status: 'pending', data: empty }
  )
  const { getFromApi, getFromCache } = createActions<T, A>(entity, apiCall, keyFunc)

  const initial = getState()
  const [state, setState] = useState<State<T>>(initial)

  // Listen for changes in the store
  store.subscribe(() => {
    if (!isMounted) return

    const newState = getState()
    if (JSON.stringify(state) !== JSON.stringify(newState)) {
      setState(newState)
    }
  })

  // Load data from cache and API
  const reload = async (force = true) => {
    // allready loading or done
    if (state.status === 'loading' || (state.status === 'loaded' && !force)) {
      return
    }

    // first load
    if (state.status === 'pending') {
      const action = getFromCache()
      store.dispatch(action)
    }

    // call api
    const action = getFromApi()
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

export const useCalendar = createHook<CalendarItem[], [Child]>(
  'calendar', (child) => api.getCalendar(child), (child) => child.id, []
)
export const useChildList = createHook<Child[], []>(
  'children', () => api.getChildren(), () => 'all', []
)
export const useClassmates = createHook<Classmate[], [Child]>(
  'classmates', (child) => api.getClassmates(child), (child) => child.id, []
)
export const useImage = createHook<Image, [string]>(
  'image', (imageUrl) => api.getImage(imageUrl), (imageUrl) => imageUrl, {}
)
export const useMenu = createHook<MenuItem[], [Child]>(
  'menu', (child) => api.getMenu(child), (child) => child.id, []
)
export const useNews = createHook<NewsItem[], [Child]>(
  'news', (child) => api.getNews(child), (child) => child.id, []
)
export const useNotifications = createHook<Notification[], [Child]>(
  'notifications', (child) => api.getNotifications(child), (child) => child.id, []
)
export const useSchedule = createHook<ScheduleItem[], [Child]>(
  'schedule', (child, from, to) => api.getSchedule(child), (child) => child.id, []
)
