import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useCalendar } from './hooks'
import { clearStore } from './store'

describe('useCalendar', () => {
  let resolve
  let reject
  beforeEach(() => {
    api.getCalendar.mockReturnValue(new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    }))
  })
  afterEach(() => { act(clearStore) })
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

      const response = { id: '2' }
      resolve(response)
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

      const response = { id: '2' }
      resolve(response)
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
      renderHook(() => useCalendar(child))
      renderHook(() => useCalendar(child))

      await new Promise((r) => setTimeout(r, 50))

      expect(api.getCalendar).toHaveBeenCalledTimes(1)
    })
  })
  it('handles api load error', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('calendar_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCalendar(child))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const err = new Error('message')
      reject(err)
      await waitForNextUpdate()

      const { error } = result.current
      expect(error.message).toEqual(err.message)
    })
  })
})
