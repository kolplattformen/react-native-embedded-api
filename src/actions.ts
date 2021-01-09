import {
  DataAction, EntityAction, EntityActionData, EntityActionType, ApiState,
} from './types'

export const createAction = <T>(type: EntityActionType, data: EntityActionData<T>): EntityAction<T> => ({
  type,
  ...data,
})
