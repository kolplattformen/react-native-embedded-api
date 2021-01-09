import {
  EntityAction, EntityActionData, EntityActionType,
} from './types'

export const createAction = <T>(type: EntityActionType, data: EntityActionData<T>): EntityAction<T> => ({
  type,
  ...data,
})
