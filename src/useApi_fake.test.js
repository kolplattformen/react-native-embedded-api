import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, renderHook } from '@testing-library/react-hooks'
import api from './api'
import { useApi, useChildList, useUser } from './hooks'

jest.mock('@skolplattformen/embedded-api',
  () => jest.requireActual('@skolplattformen/embedded-api'))

describe('useApi - fake mode', () => {
  afterEach(() => act(() => api.logout()))
  const pnr = '121212121212'
  it('status.token is "fake"', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi())
      await waitForNextUpdate()

      const { login } = result.current
      const loginStatus = await login(pnr)

      expect(loginStatus.token).toEqual('fake')
    })
  })
  it('sets isLoggedIn to true', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi())
      await waitForNextUpdate()

      expect(result.current.isLoggedIn).toEqual(false)

      const { login } = result.current
      login(pnr)
      await waitForNextUpdate()

      expect(result.current.isLoggedIn).toEqual(true)
    })
  })
  it('sets isFake to true', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi())
      await waitForNextUpdate()

      expect(result.current.isFake).toEqual(false)

      const { login } = result.current
      login(pnr)
      await waitForNextUpdate()

      expect(result.current.isFake).toEqual(true)
    })
  })
  it('returns fake data', async () => {
    await act(async () => {
      const { result: apiResult, waitForNextUpdate: waitApi } = renderHook(() => useApi())
      await waitApi()

      const { login } = apiResult.current
      login(pnr)
      await waitApi()

      const { result: userResult, waitForNextUpdate: waitUser } = renderHook(() => useUser())
      await waitUser()
      expect(userResult.current.data.firstName).toEqual('Namn')

      const { result: childResult, waitForNextUpdate: waitChildren } = renderHook(() => useChildList())
      await waitChildren()
      expect(childResult.current.data).toHaveLength(2)
    })
  })
  it('does not load from cache', async () => {
    await act(async () => {
      const spy = jest.spyOn(AsyncStorage, 'getItem')

      const { result: apiResult, waitForNextUpdate: waitApi } = renderHook(() => useApi())
      await waitApi()

      const { login } = apiResult.current
      login(pnr)
      await waitApi()

      const { waitForNextUpdate: waitUser } = renderHook(() => useUser())
      await waitUser()
      expect(AsyncStorage.getItem).not.toHaveBeenCalled()

      spy.mockRestore()
    })
  })
  it('does not store in cache', async () => {
    await act(async () => {
      const spy = jest.spyOn(AsyncStorage, 'setItem')

      const { result: apiResult, waitForNextUpdate: waitApi } = renderHook(() => useApi())
      await waitApi()

      const { login } = apiResult.current
      login(pnr)
      await waitApi()

      const { waitForNextUpdate: waitUser } = renderHook(() => useUser())
      await waitUser()
      expect(AsyncStorage.setItem).not.toHaveBeenCalled()

      spy.mockRestore()
    })
  })
})
