import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DateTime } from 'luxon'
import api from './api'
import { useSchedule, rebuildStore } from './hooks'

jest.mock('./api', () => ({
  getSchedule: jest.fn()
}))

describe('useSchedule', () => {
  let response = [{ id: '2' }]
  beforeEach(() => {
    api.getSchedule.mockReturnValue(new Promise((resolve, reject) => {
      setTimeout(() => {
        if (response instanceof Error) reject(response)
        else resolve(response)
      }, 20)
    }))
  })
  afterEach(() => rebuildStore())
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
      const { waitForNextUpdate: wait1 } = renderHook(() => useSchedule(child, from, to))
      const { waitForNextUpdate: wait2 } = renderHook(() => useSchedule(child, from, to))

      await wait1()
      await wait1()
      await wait2()
      await wait2()

      expect(api.getSchedule).toHaveBeenCalledTimes(1)
    })
  })
})
