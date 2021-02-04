import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { act, renderHook } from '@testing-library/react-hooks'
import api from './api'
import { useChildList, useUser } from './hooks'
import { ApiProvider, useApi } from './context'

jest.mock('@skolplattformen/embedded-api',
  () => jest.requireActual('@skolplattformen/embedded-api'))

describe('useApi - fake mode', () => {
  const wrapper = ({ children }) => <ApiProvider>{children}</ApiProvider>
  afterEach(async () => {
    api.isLoggedIn = false
    api.isFake = false
  })
  const pnr = '121212121212'
  it('status.token is "fake"', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi(), { wrapper })
      await waitForNextUpdate()

      const { login } = result.current
      const loginStatus = await login(pnr)

      expect(loginStatus.token).toEqual('fake')
    })
  })
  it('sets isLoggedIn to true', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi(), { wrapper })
      await waitForNextUpdate()

      const { login } = result.current
      await login(pnr)
      await waitForNextUpdate()

      expect(result.current.isLoggedIn).toEqual(true)
    })
  })
  it('sets isFake to true', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi(), { wrapper })
      await waitForNextUpdate()
      expect(result.current.isFake).toEqual(false)

      const { login } = result.current
      await login(pnr)
      await waitForNextUpdate()

      expect(result.current.isFake).toEqual(true)
    })
  })
  it('returns fake data', async () => {
    await act(async () => {
      const { result: apiResult, waitForNextUpdate: waitApi } = renderHook(() => useApi(), { wrapper })
      await waitApi()

      const { login } = apiResult.current
      await login(pnr)
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

      const { result: apiResult, waitForNextUpdate: waitApi } = renderHook(() => useApi(), { wrapper })
      await waitApi()

      const { login } = apiResult.current
      await login(pnr)

      renderHook(() => useUser())
      await new Promise((res) => setTimeout(res, 50))
      expect(AsyncStorage.getItem).not.toHaveBeenCalled()

      spy.mockRestore()
    })
  })
  it('does not store in cache', async () => {
    await act(async () => {
      const spy = jest.spyOn(AsyncStorage, 'setItem')

      const { result: apiResult, waitForNextUpdate: waitApi } = renderHook(() => useApi(), { wrapper })
      await waitApi()

      const { login } = apiResult.current
      await login(pnr)

      renderHook(() => useUser())
      await new Promise((res) => setTimeout(res, 50))
      expect(AsyncStorage.setItem).not.toHaveBeenCalled()

      spy.mockRestore()
    })
  })
})
