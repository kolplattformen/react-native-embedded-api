import { EventEmitter } from 'events'

const emitter = new EventEmitter()

const api = {
  emitter,
  isLoggedIn: false,
  login: jest.fn(),
  logout: jest.fn(),
  on: jest.fn().mockImplementation((...args) => emitter.on(...args)),
  off: jest.fn().mockImplementation((...args) => emitter.off(...args)),

  getSessionCookie: jest.fn(),
  getPersonalNumber: jest.fn(),

  getCalendar: jest.fn(),
  getChildren: jest.fn(),
  getClassmates: jest.fn(),
  getMenu: jest.fn(),
  getNews: jest.fn(),
  getNotifications: jest.fn(),
  getSchedule: jest.fn(),
  getUser: jest.fn(),
}
const init = jest.fn().mockReturnValue(api)

export default init
