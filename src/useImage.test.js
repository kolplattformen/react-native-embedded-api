import { renderHook, act } from '@testing-library/react-hooks'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'
import { useImage, rebuildStore } from './hooks'
import Blob from 'node-blob'

jest.mock('./api', () => ({
  getImage: jest.fn()
}))

describe('useImage', () => {
  let response = new Blob()
  beforeEach(() => {
    api.getImage.mockReturnValue(new Promise((resolve, reject) => {
      setTimeout(() => {
        if (response instanceof Error) reject(response)
        else resolve(response)
      }, 20)
    }))
  })
  afterEach(() => rebuildStore())
  const imageUrl = 'foobar.jpeg'
  it('data defaults to null', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useImage(imageUrl))
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(null)
    })
  })
  it.skip('data returns contents of async storage', async () => {
    const cachedImage = new Blob()
    await AsyncStorage.setItem('image_foobar.jpeg', JSON.stringify(cachedImage))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useImage(imageUrl))
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(cachedImage)
    })
  })
  it('data changes to contents of api on load', async () => {
    const cachedImage = new Blob()
    await AsyncStorage.setItem('image_foobar.jpeg', JSON.stringify(cachedImage))

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useImage(imageUrl))
      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()

      const { data } = result.current
      expect(data).toEqual(response)
    })
  })
  it.skip('stores contents of api in cache', async () => {
    const cachedImage = new Blob()
    await AsyncStorage.setItem('image_foobar.jpeg', JSON.stringify(cachedImage))

    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useImage(imageUrl))
      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()

      const data = JSON.parse(await AsyncStorage.getItem('image_foobar.jpeg'))
      expect(data).toEqual(response)
    })
  })
  it('status defaults to pending', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(() => useImage(imageUrl))
      await waitForNextUpdate()

      const { status } = result.current
      expect(status).toEqual('pending')
    })
  })
  it('calls api.getImage', async () => {
    await act(async () => {
      const { waitForNextUpdate } = renderHook(() => useImage(imageUrl))

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getImage).toHaveBeenCalledWith(imageUrl)
    })
  })
  it('only calls api.getImage once', async () => {
    await act(async () => {
      const { waitForNextUpdate: wait1 } = renderHook(() => useImage(imageUrl))
      const { waitForNextUpdate: wait2 } = renderHook(() => useImage(imageUrl))

      await wait1()
      await wait1()
      await wait2()
      await wait2()

      expect(api.getImage).toHaveBeenCalledTimes(1)
    })
  })
})
