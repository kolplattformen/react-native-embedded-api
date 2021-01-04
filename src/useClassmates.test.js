import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useClassmates, rebuildStore } from './hooks'

jest.mock('./api', () => ({
  getClassmates: jest.fn(),
}))

describe('useClassmates', () => {
  const response = [{ id: '2' }]
  beforeEach(() => {
    api.getClassmates.mockReturnValue(new Promise((resolve, reject) => {
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
      const { result, waitForNextUpdate } = renderHook(() => useClassmates(child))
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual([])
    })
  })
  it('data returns contents of async storage', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('classmates_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useClassmates(child))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(cachedItems)
    })
  })
  it('data changes to contents of api on load', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('classmates_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useClassmates(child))
      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(response)
    })
  })
  it('stores contents of api in cache', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('classmates_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useClassmates(child))
      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()

      const data = JSON.parse(await AsyncStorage.getItem('classmates_id'))
      expect(data).toEqual(response)
    })
  })
  it('status defaults to pending', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useClassmates(child))
      await waitForNextUpdate()

      const { status } = result.current
      expect(status).toEqual('pending')
    })
  })
  it('calls api.getClassmates', async () => {
    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useClassmates(child))

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getClassmates).toHaveBeenCalledWith(child)
    })
  })
  it('only calls api.getClassmates once', async () => {
    await act(async () => {
      const { waitForNextUpdate: wait1 } = renderHook(() => useClassmates(child))
      const { waitForNextUpdate: wait2 } = renderHook(() => useClassmates(child))

      await wait1()
      await wait1()
      await wait2()
      await wait2()

      expect(api.getClassmates).toHaveBeenCalledTimes(1)
    })
  })
})
