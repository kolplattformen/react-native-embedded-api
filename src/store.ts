import {
  CalendarItem, Child, Classmate, MenuItem, NewsItem, ScheduleItem, User,
} from '@skolplattformen/embedded-api/dist/types'
import {
  applyMiddleware, combineReducers, createStore,
} from 'redux'
import { createEntityReducer, createSessionReducer } from './reducers'
import { entityMiddleware } from './middleware'

const createReducers = () => combineReducers({
  session: createSessionReducer(),
  calendar: createEntityReducer<CalendarItem[]>('calendar'),
  children: createEntityReducer<Child[]>('children'),
  classmates: createEntityReducer<Classmate[]>('classmates'),
  menu: createEntityReducer<MenuItem[]>('menu'),
  news: createEntityReducer<NewsItem[]>('news'),
  notifications: createEntityReducer<Notification[]>('notifications'),
  schedule: createEntityReducer<ScheduleItem[]>('schedule'),
  user: createEntityReducer<User>('user'),
})
const middleware = applyMiddleware(entityMiddleware)

const store = createStore(createReducers(), middleware)
export const clearStore = () => {
  store.dispatch({ type: 'CLEAR' })
}

export default store
