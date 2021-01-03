import {
  createAsyncThunk,
  createSlice,
  SliceCaseReducers
} from '@reduxjs/toolkit'
import {
  ApiCall,
  ArgsToKey,
  StateMap,
  Part,
  ThunkArgs
} from './types'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const createPart = <R, A extends any[]>(
  name: string,
  argsToKey: ArgsToKey<A>,
  apiCall: ApiCall<R, A>,
  initialState: R
): Part<R, A> => {
  const thunk = createAsyncThunk<R, ThunkArgs<A>>(name, async ([args]): Promise<R> => (
    apiCall(...args)
  ))

  const slice = createSlice<StateMap<R>, SliceCaseReducers<StateMap<R>>, string>({
    name,
    initialState: {},
    reducers: {},
    extraReducers: (builder) => {
      const resolveKey = <T extends any[]>([args, argsToKey]: ThunkArgs<T>) => argsToKey(...args)
      builder.addCase(thunk.pending, (state, action) => {
        const key = resolveKey(action.meta.arg)
        state[key] = {
          data: undefined,
          status: 'loading',
          error: undefined,
        }
      })

      builder.addCase(thunk.fulfilled, (state, action) => {
        const key = resolveKey(action.meta.arg)
        state[key] = {
          data: action.payload,
          status: 'loaded',
          error: undefined,
        }
      })

      builder.addCase(thunk.rejected, (state, action) => {
        const key = resolveKey(action.meta.arg)
        state[key] = {
          data: undefined,
          status: 'loaded',
          error: action.error
        }
      })
    }
  })

  return {
    thunk: (...args: A) => thunk([args, argsToKey]),
    slice,
    argsToKey,
    initialState: {
      status: 'pending',
      data: initialState,
    }
  }
}
