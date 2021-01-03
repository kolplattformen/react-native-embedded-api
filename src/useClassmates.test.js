import { renderHook } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useClassmates } from './hooks'

jest.mock('./api', () => ({
  getClassmates: jest.fn()
}))

describe.skip('useClassmates', () => {
  const child = { sdsId: 'sdsId' }
  it('data defaults to empty array', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useClassmates(child))

    const [data] = result.current
    expect(data).toEqual([])

    await waitForNextUpdate()
  })
  it('data returns contents of async storage', async () => {
    const classmates = [{ id: '1' }]
    await AsyncStorage.setItem('classmates_sdsId', JSON.stringify(classmates))

    const { result, waitForNextUpdate } = renderHook(() => useClassmates(child))
    await waitForNextUpdate()

    const [data] = result.current
    expect(data).toEqual(classmates)
  })
  it('data changes to contents of api on load', async () => {
    const cachedClassmates = [{ id: '1' }]
    const newClassmates = [{ id: '2' }]
    await AsyncStorage.setItem('classmates_sdsId', JSON.stringify(cachedClassmates))
    api.getClassmates.mockResolvedValue(newClassmates)

    const { result, waitForNextUpdate } = renderHook(() => useClassmates(child))
    await waitForNextUpdate()

    const [data] = result.current
    expect(data).toEqual(newClassmates)
  })
  it('stores contents of api in cache', async () => {
    const cachedClassmates = [{ id: '1' }]
    const newClassmates = [{ id: '2' }]
    await AsyncStorage.setItem('classmates_sdsId', JSON.stringify(cachedClassmates))
    api.getClassmates.mockResolvedValue(newClassmates)

    const { waitForNextUpdate } = renderHook(() => useClassmates(child))
    await waitForNextUpdate()

    const data = JSON.parse(await AsyncStorage.getItem('classmates_sdsId'))
    expect(data).toEqual(newClassmates)
  })
  it('isLoading defaults to true', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useClassmates(child))

    const [, isLoading] = result.current
    expect(isLoading).toEqual(true)

    await waitForNextUpdate()
  })
  it('calls api.getClassmates', async () => {
    const { waitForNextUpdate } = renderHook(() => useClassmates(child))

    await waitForNextUpdate()

    expect(api.getClassmates).toHaveBeenCalledWith(child)
  })
})
