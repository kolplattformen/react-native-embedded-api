import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useMenu } from './hooks'
import { clearStore } from './store'

describe('useMenu', () => {
  let resolve
  let reject
  beforeEach(() => {
    api.getMenu.mockReturnValue(new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    }))
  })
  afterEach(() => { act(clearStore) })
  const child = { id: 'id' }
  it('data defaults to empty array', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMenu(child))
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual([])
    })
  })
  it('data returns contents of async storage', async () => {
    const items = [{ id: '1' }]
    await AsyncStorage.setItem('menu_id', JSON.stringify(items))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMenu(child))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(items)
    })
  })
  it('data changes to contents of api on load', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('menu_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMenu(child))
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
    await AsyncStorage.setItem('menu_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useMenu(child))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const response = { id: '2' }
      resolve(response)
      await waitForNextUpdate()

      const data = JSON.parse(await AsyncStorage.getItem('menu_id'))
      expect(data).toEqual(response)
    })
  })
  it('status defaults to pending', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMenu(child))
      await waitForNextUpdate()

      const { status } = result.current
      expect(status).toEqual('pending')
    })
  })
  it('calls api.getMenu', async () => {
    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useMenu(child))

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getMenu).toHaveBeenCalledWith(child)
    })
  })
  it('only calls api.getMenu once', async () => {
    await act(async () => {
      renderHook(() => useMenu(child))
      renderHook(() => useMenu(child))

      await new Promise((r) => setTimeout(r, 50))

      expect(api.getMenu).toHaveBeenCalledTimes(1)
    })
  })
  it('handles api load error', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('menu_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useMenu(child))
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
