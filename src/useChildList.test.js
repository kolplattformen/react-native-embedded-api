import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { rebuildStore, useChildList } from './hooks'

jest.mock('./api', () => ({
  getChildren: jest.fn(),
}))

describe('useChildList', () => {
  const response = [{ id: '2' }]
  beforeEach(() => {
    api.getChildren.mockReturnValue(new Promise((resolve, reject) => {
      setTimeout(() => {
        if (response instanceof Error) reject(response)
        else resolve(response)
      }, 20)
    }))
  })
  afterEach(() => rebuildStore())
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
      const { waitForNextUpdate: wait1 } = renderHook(() => useChildList())
      const { waitForNextUpdate: wait2 } = renderHook(() => useChildList())

      await wait1()
      await wait1()
      await wait2()
      await wait2()

      expect(api.getChildren).toHaveBeenCalledWith()
    })
  })
})
