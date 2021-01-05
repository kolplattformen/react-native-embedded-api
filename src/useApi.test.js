import { renderHook, act } from '@testing-library/react-hooks'
import { EventEmitter } from 'events'
import api from './api'
import { useApi } from './hooks'

jest.mock('./api', () => ({
  isLoggedIn: false,
  login: jest.fn(),
  logout: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  getSessionCookie: jest.fn(),
}))

describe('useApi', () => {
  let status
  let emitter
  beforeEach(() => {
    emitter = new EventEmitter()
    status = {}
    api.login.mockResolvedValue(status)
    api.on.mockImplementation((...args) => emitter.on(...args))
    api.off.mockImplementation((...args) => emitter.on(...args))
    api.getSessionCookie.mockReturnValue(undefined)
  })
  describe('#login', () => {
    it('calls through to login', () => {
      const { result } = renderHook(() => useApi())
      const { login } = result.current
      login('pnr')

      expect(api.login).toHaveBeenCalledWith('pnr')
    })
    it('returns the status checker', async () => {
      const { result } = renderHook(() => useApi())
      const { login } = result.current
      const _status = await login('pnr')

      expect(_status).toEqual(status)
    })
    it('rejects if login fails', async () => {
      const error = new Error()
      api.login.mockRejectedValue(error)

      const { result } = renderHook(() => useApi())
      const { login } = result.current
      await expect(login()).rejects.toThrow(error)
    })
  })
  describe('.isLoggedIn', () => {
    it('defaults to false if api.isLoggedIn = false', () => {
      const { result } = renderHook(() => useApi())
      const { isLoggedIn } = result.current

      expect(isLoggedIn).toEqual(false)
    })
    it('defaults to true if api.isLoggedIn = true', () => {
      api.isLoggedIn = true
      const { result } = renderHook(() => useApi())
      const { isLoggedIn } = result.current

      expect(isLoggedIn).toEqual(true)
      api.isLoggedIn = false
    })
    it('changes to true on(`login`)', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi())

      expect(result.current.isLoggedIn).toEqual(false)

      await act(async () => {
        emitter.emit('login')
        await waitForNextUpdate()

        expect(result.current.isLoggedIn).toEqual(true)
      })
    })
    it('changes to false on(`logout`)', async () => {
      api.isLoggedIn = true
      const { result, waitForNextUpdate } = renderHook(() => useApi())

      expect(result.current.isLoggedIn).toEqual(true)

      await act(async () => {
        emitter.emit('logout')
        await waitForNextUpdate()

        expect(result.current.isLoggedIn).toEqual(false)
      })
    })
  })

  describe('.cookie', () => {
    it('defaults to undefined', () => {
      const { result } = renderHook(() => useApi())
      const { cookie } = result.current

      expect(cookie).toEqual(undefined)
    })
    it('defaults to true if session cookie exists', () => {
      api.getSessionCookie.mockReturnValue('cookie')

      const { result } = renderHook(() => useApi())
      const { cookie } = result.current

      expect(cookie).toEqual('cookie')
    })
    it('updates value on(`login`)', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useApi())

      expect(result.current.cookie).toEqual(undefined)

      await act(async () => {
        api.getSessionCookie.mockReturnValue('cookie')
        emitter.emit('login')
        await waitForNextUpdate()

        expect(result.current.cookie).toEqual('cookie')
      })
    })
    it('changes to false on(`logout`)', async () => {
      api.getSessionCookie.mockReturnValue('cookie')
      const { result, waitForNextUpdate } = renderHook(() => useApi())

      expect(result.current.cookie).toEqual('cookie')

      await act(async () => {
        emitter.emit('logout')
        await waitForNextUpdate()

        expect(result.current.cookie).toEqual(undefined)
      })
    })
  })
  describe('#logout', () => {
    it('calls through to logout', () => {
      const { result } = renderHook(() => useApi())
      const { logout } = result.current
      logout()

      expect(api.logout).toHaveBeenCalledWith()
    })
    it('rejects if logout fails', async () => {
      const error = new Error()
      api.logout.mockRejectedValue(error)

      const { result } = renderHook(() => useApi())
      const { logout } = result.current
      await expect(logout()).rejects.toThrow(error)
    })
  })
})