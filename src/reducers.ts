import { SerializedError } from '@reduxjs/toolkit'
import {
  EntityAction, StateDictionary,
} from './types'

export const createEntityReducer = <T>(entity: string) => (
  (state: StateDictionary<T> = {}, action: EntityAction<T>): StateDictionary<T> => {
    if (action.type === 'CLEAR') return {}
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
          },
        }
      }
      case 'UPDATE_FROM_CACHE': {
        return {
          ...state,
          [action.key]: {
            ...current,
            data: action.payload as T,
          },
        }
      }
      case 'UPDATE_FROM_API': {
        return {
          ...state,
          [action.key]: {
            ...current,
            status: 'loaded',
            data: action.payload as T,
            error: undefined,
          },
        }
      }
      case 'API_ERROR': {
        return {
          ...state,
          [action.key]: {
            ...current,
            status: 'pending',
            error: action.payload as SerializedError,
          },
        }
      }
      default: return state
    }
  }
)
