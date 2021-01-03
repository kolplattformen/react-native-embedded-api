import { renderHook } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useCalendar } from './hooks'

jest.mock('./api', () => ({
  getCalendar: jest.fn()
}))

describe.skip('useCalendar', () => {
  const child = { id: 'id' }
  it('data defaults to empty array', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))

    const [data] = result.current
    expect(data).toEqual([])

    await waitForNextUpdate()
  })
  it('data returns contents of async storage', async () => {
    const items = [{ id: '1' }]
    await AsyncStorage.setItem('calendar_id', JSON.stringify(items))

    const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))
    await waitForNextUpdate()

    const [data] = result.current
    expect(data).toEqual(items)
  })
  it('data changes to contents of api on load', async () => {
    const cachedItems = [{ id: '1' }]
    const newItems = [{ id: '2' }]
    await AsyncStorage.setItem('calendar_id', JSON.stringify(cachedItems))
    api.getCalendar.mockResolvedValue(newItems)

    const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))
    await waitForNextUpdate()

    const [data] = result.current
    expect(data).toEqual(newItems)
  })
  it('stores contents of api in cache', async () => {
    const cachedItems = [{ id: '1' }]
    const newItems = [{ id: '2' }]
    await AsyncStorage.setItem('calendar_id', JSON.stringify(cachedItems))
    api.getCalendar.mockResolvedValue(newItems)

    const { waitForNextUpdate } = renderHook(() => useCalendar(child))
    await waitForNextUpdate()

    const data = JSON.parse(await AsyncStorage.getItem('calendar_id'))
    expect(data).toEqual(newItems)
  })
  it('isLoading defaults to true', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))

    const [, isLoading] = result.current
    expect(isLoading).toEqual(true)

    await waitForNextUpdate()
  })
  it('calls api.getCalendar', async () => {
    const { waitForNextUpdate } = renderHook(() => useCalendar(child))

    await waitForNextUpdate()

    expect(api.getCalendar).toHaveBeenCalledWith(child)
  })
  it.skip('only calls api.getCalendar once', async () => {
    console.log('useCalendar 1')
    const { waitForNextUpdate: wait1 } = renderHook(() => useCalendar(child))
    await wait1()
    console.log('useCalendar 2')
    const { waitForNextUpdate: wait2 } = renderHook(() => useCalendar(child))
    await wait2()

    expect(api.getCalendar).toHaveBeenCalledTimes(1)
  })
})
