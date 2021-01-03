import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useCalendar, rebuildStore } from './hooks'

jest.mock('./api', () => ({
  getCalendar: jest.fn()
}))

describe('useCalendar', () => {
  let response = [{ id: '2' }]
  beforeEach(() => {
    api.getCalendar.mockReturnValue(new Promise((resolve, reject) => {
      setTimeout(() => {
        if (response instanceof Error) reject(response)
        else resolve(response)
      }, 20)
    }))
  })
  afterEach(() => rebuildStore())
  const child = { id: 'id' }
  it('data defaults to empty array', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual([])
    })
  })
  it('data returns contents of async storage', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('calendar_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(cachedItems)
    })
  })
  it('data changes to contents of api on load', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('calendar_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))
      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(response)
    })
  })
  it('stores contents of api in cache', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('calendar_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useCalendar(child))
      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()

      const data = JSON.parse(await AsyncStorage.getItem('calendar_id'))
      expect(data).toEqual(response)
    })
  })
  it('status defaults to pending', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))
      await waitForNextUpdate()

      const { status } = result.current
      expect(status).toEqual('pending')
    })
  })
  it('calls api.getCalendar', async () => {
    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useCalendar(child))

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getCalendar).toHaveBeenCalledWith(child)
    })
  })
  it('only calls api.getCalendar once', async () => {
    await act(async () => {
      const { waitForNextUpdate: wait1 } = renderHook(() => useCalendar(child))
      const { waitForNextUpdate: wait2 } = renderHook(() => useCalendar(child))

      await wait1()
      await wait1()
      await wait2()
      await wait2()

      expect(api.getCalendar).toHaveBeenCalledTimes(1)
    })
  })
})
