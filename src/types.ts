import {
  Action, AsyncThunkAction, SerializedError, Slice, SliceCaseReducers, Dictionary,
} from '@reduxjs/toolkit'

// eslint-disable-next-line max-len
export type EntityActionType = 'CALL_API' | 'UPDATE_FROM_API' | 'CALL_CACHE' | 'UPDATE_FROM_CACHE' | 'API_ERROR'

export interface ApiState {
  isFake: boolean
}
export interface DataAction<T> extends Action<string> {
  data?: T
}
export interface EntityActionData<T> {
  entity: string
  key: string
  payload?: T | SerializedError
  apiCall?: () => Promise<T>
}
export interface EntityAction<T> extends EntityActionData<T>, Action<EntityActionType | string> { }

export interface State<T> {
  data?: T
  status: 'pending' | 'loading' | 'loaded'
  error?: SerializedError
}
export interface ReloadableState<T> extends State<T> {
  reload: () => Promise<void>
}
export interface StateDictionary<T> extends Dictionary<State<T>> { }

export interface Session {
  isLoggedIn: boolean
  isFake: boolean
}

export interface ArgsToKey<T extends any[]> {
  (...args: T): string
}

export interface ThunkArgs<T extends any[]> extends Array<any> {
  0: T
  1: ArgsToKey<T>
}

export interface ApiCall<R, A extends any[]> {
  (...args: A): Promise<R>
}

export interface ThunkCall<R, A extends any[]> {
  (...args: A): AsyncThunkAction<R, ThunkArgs<A>, {}>
}

export interface Part<R, A extends any[]> {
  thunk: ThunkCall<R, A>
  slice: Slice<Dictionary<State<R>>, SliceCaseReducers<Dictionary<State<R>>>>
  argsToKey: ArgsToKey<A>
  initialState: State<R>
}

export interface Hook<R, A extends any[]> {
  (...args: A): ReloadableState<R>
}
