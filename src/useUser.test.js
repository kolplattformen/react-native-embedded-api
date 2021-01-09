import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useUser } from './hooks'
import { clearStore } from './store'

describe('useUser', () => {
  let resolve
  let reject
  beforeEach(() => {
    api.isLoggedIn = true
    api.getUser.mockReturnValue(new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    }))
  })
  afterEach(() => { act(clearStore) })
  it('data defaults to empty object', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser())
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual({})
    })
  })
  it('data returns contents of async storage', async () => {
    const cachedUser = { id: '1' }
    await AsyncStorage.setItem('user_me', JSON.stringify(cachedUser))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser())
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(cachedUser)
    })
  })
  it('data changes to contents of api on load', async () => {
    const cachedUser = { id: '1' }
    await AsyncStorage.setItem('user_me', JSON.stringify(cachedUser))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser())
      await waitForNextUpdate()
      await waitForNextUpdate()

      const response = { id: '2' }
      resolve(response)
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(response)
    })
  })
  it('stores contents of api in cache', async () => {
    const cachedUser = { id: '1' }
    await AsyncStorage.setItem('user_me', JSON.stringify(cachedUser))

    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useUser())
      await waitForNextUpdate()
      await waitForNextUpdate()

      const response = { id: '2' }
      resolve(response)
      await waitForNextUpdate()

      const data = JSON.parse(await AsyncStorage.getItem('user_me'))
      expect(data).toEqual(response)
    })
  })
  it('status defaults to pending', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser())
      await waitForNextUpdate()

      const { status } = result.current
      expect(status).toEqual('pending')
    })
  })
  it('calls api.getUser', async () => {
    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useUser())

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getUser).toHaveBeenCalledWith()
    })
  })
  it('only calls api.getUser once', async () => {
    await act(async () => {
      renderHook(() => useUser())
      renderHook(() => useUser())

      await new Promise((r) => setTimeout(r, 50))

      expect(api.getUser).toHaveBeenCalledTimes(1)
    })
  })
  it('handles api load error', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('user_me', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser())
      await waitForNextUpdate()
      await waitForNextUpdate()

      const err = new Error('message')
      reject(err)
      await waitForNextUpdate()

      const { error } = result.current
      expect(error.message).toEqual(err.message)
    })
  })
})
