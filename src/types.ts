import {
  AsyncThunkAction, SerializedError, Slice, SliceCaseReducers,
} from '@reduxjs/toolkit'

export interface State<T> {
  data?: T
  status: 'pending' | 'loading' | 'loaded'
  error?: SerializedError
}

export interface Map<T> {
  [key: string]: T
}

export interface StateMap<T> extends Map<State<T>> { }

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
  slice: Slice<Map<State<R>>, SliceCaseReducers<Map<State<R>>>>
  argsToKey: ArgsToKey<A>
  initialState: State<R>
}

export interface ReloadableState<T> extends State<T> {
  reload: () => Promise<void>
}

export interface Hook<R, A extends any[]> {
  (...args: A): ReloadableState<R>
}
