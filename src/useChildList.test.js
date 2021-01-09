import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useChildList } from './hooks'
import { clearStore } from './store'

describe('useChildList', () => {
  let resolve
  let reject
  beforeEach(() => {
    api.isLoggedIn = true
    api.getChildren.mockReturnValue(new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    }))
  })
  afterEach(() => { act(clearStore) })
  it('data defaults to empty array', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChildList())
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual([])
    })
  })
  it('data returns contents of async storage', async () => {
    const cached = [{ id: '1' }]
    await AsyncStorage.setItem('children_all', JSON.stringify(cached))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChildList())
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(cached)
    })
  })
  it('data changes to contents of api on load', async () => {
    const cachedChildren = [{ id: '1' }]
    await AsyncStorage.setItem('children_all', JSON.stringify(cachedChildren))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChildList())
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
    const cachedChildren = [{ id: '1' }]
    await AsyncStorage.setItem('children_all', JSON.stringify(cachedChildren))

    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useChildList())
      await waitForNextUpdate()
      await waitForNextUpdate()

      const response = { id: '2' }
      resolve(response)
      await waitForNextUpdate()

      const data = JSON.parse(await AsyncStorage.getItem('children_all'))
      expect(data).toEqual(response)
    })
  })
  it('status defaults to pending', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChildList())
      await waitForNextUpdate()

      const { status } = result.current
      expect(status).toEqual('pending')
    })
  })
  it('calls api.getChildren', async () => {
    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useChildList())

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getChildren).toHaveBeenCalledWith()
    })
  })
  it('only calls api.getChildren once', async () => {
    await act(async () => {
      renderHook(() => useChildList())
      renderHook(() => useChildList())

      await new Promise((r) => setTimeout(r, 50))

      expect(api.getChildren).toHaveBeenCalledWith()
    })
  })
  it('handles api load error', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('children_all', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useChildList())
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
