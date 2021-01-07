import {
  DataAction, EntityAction, EntityActionData, EntityActionType, ApiState,
} from './types'

export const createSessionAction = (type: 'LOGIN' | 'LOGOUT', data?: ApiState): DataAction<ApiState> => ({
  type,
  data,
})

export const createAction = <T>(type: EntityActionType, data: EntityActionData<T>): EntityAction<T> => ({
  type,
  ...data,
})
