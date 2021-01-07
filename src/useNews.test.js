import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useNews } from './hooks'
import { clearStore } from './store'

describe('useNews', () => {
  let resolve
  let reject
  beforeEach(() => {
    api.getNews.mockReturnValue(new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    }))
  })
  afterEach(() => { act(clearStore) })
  const child = { id: 'id' }
  it('data defaults to empty array', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useNews(child))
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual([])
    })
  })
  it('data returns contents of async storage', async () => {
    const items = [{ id: '1' }]
    await AsyncStorage.setItem('news_id', JSON.stringify(items))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useNews(child))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(items)
    })
  })
  it('data changes to contents of api on load', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('news_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useNews(child))
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
    await AsyncStorage.setItem('news_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useNews(child))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const response = { id: '2' }
      resolve(response)
      await waitForNextUpdate()

      const data = JSON.parse(await AsyncStorage.getItem('news_id'))
      expect(data).toEqual(response)
    })
  })
  it('status defaults to pending', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useNews(child))
      await waitForNextUpdate()

      const { status } = result.current
      expect(status).toEqual('pending')
    })
  })
  it('calls api.getNews', async () => {
    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useNews(child))

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getNews).toHaveBeenCalledWith(child)
    })
  })
  it('only calls api.getNews once', async () => {
    await act(async () => {
      renderHook(() => useNews(child))
      renderHook(() => useNews(child))

      await new Promise((r) => setTimeout(r, 50))

      expect(api.getNews).toHaveBeenCalledTimes(1)
    })
  })
  it('handles api load error', async () => {
    const cachedItems = [{ id: '1' }]
    await AsyncStorage.setItem('news_id', JSON.stringify(cachedItems))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useNews(child))
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
