import AsyncStorage from '@react-native-async-storage/async-storage'
import { AnyAction, Dispatch, Middleware } from 'redux'
import { createAction } from './actions'
import { EntityAction } from './types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const entityMiddleware: Middleware<any, any, Dispatch<AnyAction>> = (api) => (
  (dispatch) => (
    (action: EntityAction<any>) => {
      switch (action.type) {
        case 'CALL_API':
          if (action.apiCall) {
            action.apiCall()
              .then((res) => {
                const updateAction = createAction<any>('UPDATE_FROM_API', {
                  entity: action.entity,
                  key: action.key,
                  payload: res,
                })
                dispatch(updateAction)
                const cacheKey = `${action.entity}_${action.key}`
                const cacheContent = JSON.stringify(res)
                AsyncStorage
                  .setItem(cacheKey, cacheContent)
                  .catch(() => { })
              })
              .catch((err) => {
                const errorAction = createAction<any>('API_ERROR', {
                  entity: action.entity,
                  key: action.key,
                  payload: { message: err.message, stack: err.stack, name: err.name },
                })
                dispatch(errorAction)
              })
          }
          break
        case 'CALL_CACHE':
          AsyncStorage.getItem(`${action.entity}_${action.key}`)
            .then((res) => {
              if (res) {
                const updateAction = createAction<any>('UPDATE_FROM_CACHE', {
                  entity: action.entity,
                  key: action.key,
                  payload: JSON.parse(res),
                })
                dispatch(updateAction)
              }
            })
          break
        case 'LOGOUT':
          dispatch({ type: 'CLEAR' })
          break
        default:
          // Do nothing
          break
      }
      return dispatch(action)
    }
  )
)
