import React, { createContext, FC, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { LoginStatusChecker } from '@skolplattformen/embedded-api'
import api from './api'

type LoginEvent = 'login' | 'logout'
interface ApiEventEmitter {
  on: (event: LoginEvent, listener: () => void) => ApiEventEmitter,
  off: (event: LoginEvent, listener: () => void) => ApiEventEmitter,
}

export interface ApiContext extends ApiEventEmitter {
  isLoggedIn: boolean,
  isFake: boolean,
  cookie?: string | null,
  login: (personalNumber: string) => Promise<LoginStatusChecker>,
  logout: () => Promise<void>,
}

const Context = createContext<ApiContext>({
  isLoggedIn: false,
  isFake: false,
  login: (personalNumber: string) => api.login(personalNumber),
  logout: () => api.logout(),
  on: (event, listener) => api.on(event, listener),
  off: (event, listener) => api.off(event, listener),
})

export const ApiProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(api.isLoggedIn)
  const [isFake, setIsFake] = useState(api.isFake)
  const [cookie, setCookie] = useState(api.getSessionCookie())

  let mounted = false

  const sessionListener = () => {
    if (!mounted) return
    setIsLoggedIn(api.isLoggedIn)
    setIsFake(api.isFake)
    if (!api.isFake) {
      setCookie(api.isLoggedIn ? api.getSessionCookie() : undefined)
    }
  }

  useEffect(() => {
    mounted = true
    api.on('login', sessionListener)
    api.on('logout', sessionListener)

    return () => {
      mounted = false
      api.off('login', sessionListener)
      api.off('logout', sessionListener)
    }
  }, [])

  const value: ApiContext = {
    isLoggedIn,
    isFake,
    cookie,
    login: (personalNumber: string) => api.login(personalNumber),
    logout: () => api.logout(),
    on: (event, listener) => api.on(event, listener),
    off: (event, listener) => api.off(event, listener),
  }

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}

export const useApi = () => useContext(Context)
