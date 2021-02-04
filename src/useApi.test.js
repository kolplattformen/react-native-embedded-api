import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import api from './api'
import { useApi, ApiProvider } from './context'

describe('useApi', () => {
  let status
  let emitter
  const wrapper = ({ children }) => <ApiProvider>{children}</ApiProvider>
  beforeEach(() => {
    emitter = api.emitter
    status = {}
    api.login.mockResolvedValue(status)
    api.getSessionCookie.mockReturnValue(undefined)
  })
  afterEach(async () => {
    api.isLoggedIn = false
    api.isFake = false
  })
  describe('#login', () => {
    it('calls through to login', async () => {
      await act(async () => {
        const { result, waitForNextUpdate } = renderHook(() => useApi(), { wrapper })
        await waitForNextUpdate()
        const { login } = result.current
        login('pnr')

        expect(api.login).toHaveBeenCalledWith('pnr')
      })
    })
    it('returns the status checker', async () => {
      const { result } = renderHook(() => useApi(), { wrapper })
      const { login } = result.current
      const loginStatus = await login('pnr')

      expect(loginStatus).toEqual(status)
    })
    it('rejects if login fails', async () => {
      const error = new Error()
      api.login.mockRejectedValue(error)

      const { result } = renderHook(() => useApi(), { wrapper })
      const { login } = result.current
      await expect(login()).rejects.toThrow(error)
    })
  })
  describe('.isLoggedIn', () => {
    it('defaults to false if api.isLoggedIn = false', () => {
      const { result } = renderHook(() => useApi(), { wrapper })
      const { isLoggedIn } = result.current

      expect(isLoggedIn).toEqual(false)
    })
    it('defaults to true if api.isLoggedIn = true', () => {
      api.isLoggedIn = true
      const { result } = renderHook(() => useApi(), { wrapper })
      const { isLoggedIn } = result.current

      expect(isLoggedIn).toEqual(true)
      api.isLoggedIn = false
    })
    it.skip('changes to true on(`login`)', async () => {
      await act(async () => {
        api.isLoggedIn = false
        const { result, waitForNextUpdate } = renderHook(() => useApi(), { wrapper })

        await waitForNextUpdate()
        expect(result.current.isLoggedIn).toEqual(false)

        api.isLoggedIn = true
        emitter.emit('login')
        await waitForNextUpdate()

        expect(result.current.isLoggedIn).toEqual(true)
      })
    })
    it.skip('changes to false on(`logout`)', async () => {
      await act(async () => {
        api.isLoggedIn = true
        const { result, waitForNextUpdate } = renderHook(() => useApi(), { wrapper })

        await waitForNextUpdate()
        expect(result.current.isLoggedIn).toEqual(true)

        api.isLoggedIn = false
        emitter.emit('logout')

        expect(result.current.isLoggedIn).toEqual(false)
      })
    })
  })
  describe('.cookie', () => {
    it('defaults to undefined', () => {
      const { result } = renderHook(() => useApi(), { wrapper })
      const { cookie } = result.current

      expect(cookie).toEqual(undefined)
    })
    it('defaults to cookie if session cookie exists', () => {
      api.getSessionCookie.mockReturnValue('cookie')

      const { result } = renderHook(() => useApi(), { wrapper })
      const { cookie } = result.current

      expect(cookie).toEqual('cookie')
    })
    it.skip('updates value on(`login`)', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi(), { wrapper })

      expect(result.current.cookie).toEqual(undefined)

      await act(async () => {
        api.getSessionCookie.mockReturnValue('cookie')
        emitter.emit('login')
        await waitForNextUpdate()

        expect(result.current.cookie).toEqual('cookie')
      })
    })
    it.skip('changes to false on(`logout`)', async () => {
      api.isLoggedIn = true
      api.getSessionCookie.mockReturnValue('cookie')
      const { result, waitForNextUpdate } = renderHook(() => useApi(), { wrapper })

      expect(result.current.cookie).toEqual('cookie')

      await act(async () => {
        api.isLoggedIn = false
        emitter.emit('logout')
        await waitForNextUpdate()

        expect(result.current.cookie).toEqual(undefined)
      })
    })
  })
  describe('#logout', () => {
    it('calls through to logout', () => {
      const { result } = renderHook(() => useApi(), { wrapper })
      const { logout } = result.current
      logout()

      expect(api.logout).toHaveBeenCalledWith()
    })
    it('rejects if logout fails', async () => {
      const error = new Error()
      api.logout.mockRejectedValue(error)

      const { result } = renderHook(() => useApi(), { wrapper })
      const { logout } = result.current
      await expect(logout()).rejects.toThrow(error)
    })
  })
})
