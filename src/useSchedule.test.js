import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DateTime } from 'luxon'
import api from './api'
import { useSchedule } from './hooks'
import { clearStore } from './store'

describe('useSchedule', () => {
  let resolve
  let reject
  beforeEach(() => {
    api.isLoggedIn = true
    api.getSchedule.mockReturnValue(new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    }))
  })
  afterEach(() => { act(clearStore) })
  const child = { id: 'id' }
  const from = DateTime.fromISO('2021-01-01')
  const to = DateTime.fromISO('2021-01-08')
  it('data defaults to empty array', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useSchedule(child, from, to))
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual([])
    })
  })
  it('data returns contents of async storage', async () => {
    const items = [{ id: '1' }]
    await AsyncStorage.setItem('schedule_id_2021-01-01_2021-01-08', JSON.stringify(items))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useSchedule(child, from, to))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(items)
    })
  })
  it('data changes to contents of api on load', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('schedule_id_2021-01-01_2021-01-08', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useSchedule(child, from, to))
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
    await AsyncStorage.setItem('schedule_id_2021-01-01_2021-01-08', JSON.stringify(cachedItems))

    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useSchedule(child, from, to))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const response = { id: '2' }
      resolve(response)
      await waitForNextUpdate()

      const data = JSON.parse(await AsyncStorage.getItem('schedule_id_2021-01-01_2021-01-08'))
      expect(data).toEqual(response)
    })
  })
  it('status defaults to pending', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useSchedule(child, from, to))
      await waitForNextUpdate()

      const { status } = result.current
      expect(status).toEqual('pending')
    })
  })
  it('calls api.getSchedule', async () => {
    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useSchedule(child, from, to))

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getSchedule).toHaveBeenCalledWith(child, from, to)
    })
  })
  it('only calls api.getSchedule once', async () => {
    await act(async () => {
      renderHook(() => useSchedule(child, from, to))
      renderHook(() => useSchedule(child, from, to))

      await new Promise((r) => setTimeout(r, 50))

      expect(api.getSchedule).toHaveBeenCalledTimes(1)
    })
  })
  it('handles api load error', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('schedule_id_2021-01-01_2021-01-08', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useSchedule(child, from, to))
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
