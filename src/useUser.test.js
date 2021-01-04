import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useUser, rebuildStore } from './hooks'

jest.mock('./api', () => ({
  getUser: jest.fn(),
}))

describe('useUser', () => {
  const response = { id: '2' }
  beforeEach(() => {
    api.getUser.mockReturnValue(new Promise((resolve, reject) => {
      setTimeout(() => {
        if (response instanceof Error) reject(response)
        else resolve(response)
      }, 20)
    }))
  })
  afterEach(() => rebuildStore())
  it('data defaults to null', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useUser())
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(null)
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
      const { waitForNextUpdate: wait1 } = renderHook(() => useUser())
      const { waitForNextUpdate: wait2 } = renderHook(() => useUser())

      await wait1()
      await wait1()
      await wait2()
      await wait2()

      expect(api.getUser).toHaveBeenCalledTimes(1)
    })
  })
})
