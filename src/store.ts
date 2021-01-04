import {
  createAsyncThunk,
  createSlice,
  Draft,
  SliceCaseReducers,
} from '@reduxjs/toolkit'
import {
  ApiCall,
  ArgsToKey,
  StateMap,
  Part,
  ThunkArgs,
} from './types'

export const createPart = <R, A extends any[]>(
  name: string,
  argsToKey: ArgsToKey<A>,
  apiCall: ApiCall<R, A>,
  initialState: R,
): Part<R, A> => {
  const thunk = createAsyncThunk<R, ThunkArgs<A>>(name, async ([args]): Promise<R> => (
    apiCall(...args)
  ))

  const slice = createSlice<StateMap<R>, SliceCaseReducers<StateMap<R>>, string>({
    name,
    initialState: {},
    reducers: {},
    extraReducers: (builder) => {
      const resolveKey = <T extends any[]>([args, resolve]: ThunkArgs<T>) => resolve(...args)
      builder.addCase(thunk.pending, (state, action) => {
        const key = resolveKey(action.meta.arg)
        state[key] = {
          ...state[key],
          status: 'loading',
          error: undefined,
        }
      })

      builder.addCase(thunk.fulfilled, (state, action) => {
        const key = resolveKey(action.meta.arg)
        state[key] = {
          ...state[key],
          data: action.payload as Draft<R>,
          status: 'loaded',
          error: undefined,
        }
      })

      builder.addCase(thunk.rejected, (state, action) => {
        const key = resolveKey(action.meta.arg)
        state[key] = {
          ...state[key],
          status: 'pending',
          error: action.error,
        }
      })
    },
  })

  return {
    thunk: (...args: A) => thunk([args, argsToKey]),
    slice,
    argsToKey,
    initialState: {
      status: 'pending',
      data: initialState,
    },
  }
}
