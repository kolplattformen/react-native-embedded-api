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
  it('calls through to login', () => {
    const { login } = useApi()
    login('pnr')

    expect(api.login).toHaveBeenCalledWith('pnr')
  })
})
