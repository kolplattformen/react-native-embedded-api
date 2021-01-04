import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useApi, rebuildStore } from './hooks'

jest.mock('./api', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
}))

describe('useApi', () => {
  let status
  beforeEach(() => {
    status = {}
    api.login.mockResolvedValue(status)
  })
  describe('#login', () => {
    it('calls through to login', () => {
      const { login } = useApi()
      login('pnr')

      expect(api.login).toHaveBeenCalledWith('pnr')
    })
    it('returns the status checker', async () => {
      const { login } = useApi()
      const result = await login('pnr')

      expect(result).toEqual(status)
    })
    it('rejects if login fails', async () => {
      const error = new Error()
      api.login.mockRejectedValue(error)

      const { login } = useApi()
      await expect(login()).rejects.toThrow(error)
    })
  })
  describe('#logout', () => {
    it('calls through to logout', () => {
      const { logout } = useApi()
      logout()

      expect(api.logout).toHaveBeenCalledWith()
    })
    it('rejects if logout fails', async () => {
      const error = new Error()
      api.logout.mockRejectedValue(error)

      const { logout } = useApi()
      await expect(logout()).rejects.toThrow(error)
    })
  })
})
