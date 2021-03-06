-----
This repo. is deprecated and has been archived. Use https://github.com/kolplattformen/api-hooks instead!
-----

# @skolplattformen/react-native-embedded-api

1. [Installing](#installing)
1. [Login / logout](#login--logout)
1. [Get data](#get-data)
1. [Fake mode](#fake-mode)


## Installing

```npm i -S @skolplattformen/react-native-embedded-api```

```yarn add @skolplattformen/react-native-embedded-api```

## ApiProvider

In order to use api hooks, you must wrap your app in an ApiProvider

```javascript
import React from 'react'
import { ApiProvider } from '@skolplattformen/react-native-embedded-api'
import { RootComponent } from './components/root

export default () => (
  <ApiProvider>
    <RootComponent />
  </ApiProvider>
)
```

## Login / logout

```javascript
import { useApi } from '@skolplattformen/react-native-embedded-api'

export default function LoginController () {
  const { login, logout, on, isLoggedIn } = useApi()

  on('login', () => { /* do login stuff */ })
  on('logout', () => { /* do logout stuff */ })

  const [personalNumber, setPersonalNumber] = useState()
  const [bankIdStatus, setBankIdStatus] = useState('')

  const doLogin = async () => {
    const status = await login(personalNumber)

    openBankID(status.token)

    status.on('PENDING', () => { setBankIdStatus('BankID app not yet opened') })
    status.on('USER_SIGN', () => { setBankIdStatus('BankID app is open') })
    status.on('OK', () => { setBankIdStatus('BankID signed. NOTE! User is NOT yet logged in!') })
    status.on('ERROR', (err) => { setBankIdStatus('BankID failed') })
  })

  return (
    <View>
      <Input value={personalNumber} onChange={(value) = setPersonalNumber(value)} />
      <Button onClick={() => doLogin()}>
      <Text>{bankIdStatus}</Text>
      <Text>Logged in: {isLoggedIn}</Text>
    </View>
  )
}
```

## Get data

1. [General](#general)
1. [useCalendar](#usecalendar)
1. [useChildList](#usechildList)
1. [useClassmates](#useclassmates)
1. [useMenu](#usemenu)
1. [useNews](#usenews)
1. [useNotifications](#usenotifications)
1. [useSchedule](#useschedule)
1. [useUser](#useuser)

### General

The data hooks return a `State<T>` object exposing the following properties:

| Property | Description                      |
|----------|----------------------------------|
| `status` | `pending` `loading` `loaded`     |
| `data`   | The requested data               |
| `error`  | Error from the API call if any   |
| `reload` | Function that triggers a reload  |

The hook will return a useable default for data at first (usually empty `[]`).
It then checks the cache (`AsyncStorage`) for any value and, if exists, updates data.
Simultaneously the API is called. This only automatically happens once during the
lifetime of the app. If several instances of the same hook are used, the data will be
shared and only one API call made.
When `reload` is called, a new API call will be made and all hook instances will have
their `status`, `data` and `error` updated.

### useCalendar

```javascript
import { useCalendar } from '@skolplattformen/react-native-embedded-api'

export default function CalendarComponent ({ selectedChild }) => {
  const { status, data, error, reload } = useCalendar(selectedChild)
  
  return (
    <View>
      { status === 'loading' && <Spinner />}
      { error && <Text>{ error.message }</Text>}
      { data.map((item) => (
        <CalendarItem item={item} />
      ))}
      { status !== 'loading' && status !== 'pending' && <Button onClick={() => reload()}> }
    </View>
  )
}
```

### useChildList

```javascript
import { useChildList } from '@skolplattformen/react-native-embedded-api'

export default function ChildListComponent () => {
  const { status, data, error, reload } = useChildList()
  
  return (
    <View>
      { status === 'loading' && <Spinner />}
      { error && <Text>{ error.message }</Text>}
      { data.map((child) => (
        <Text>{child.firstName} {child.lastName}</Text>
      ))}
      { status !== 'loading' && status !== 'pending' && <Button onClick={() => reload()}> }
    </View>
  )
}
```

### useClassmates

```javascript
import { useClassmates } from '@skolplattformen/react-native-embedded-api'

export default function ClassmatesComponent ({ selectedChild }) => {
  const { status, data, error, reload } = useClassmates(selectedChild)
  
  return (
    <View>
      { status === 'loading' && <Spinner />}
      { error && <Text>{ error.message }</Text>}
      { data.map((classmate) => (
        <Classmate item={classmate} />
      ))}
      { status !== 'loading' && status !== 'pending' && <Button onClick={() => reload()}> }
    </View>
  )
}
```

### useMenu

```javascript
import { useMenu } from '@skolplattformen/react-native-embedded-api'

export default function MenuComponent ({ selectedChild }) => {
  const { status, data, error, reload } = useMenu(selectedChild)
  
  return (
    <View>
      { status === 'loading' && <Spinner />}
      { error && <Text>{ error.message }</Text>}
      { data.map((item) => (
        <MenuItem item={item} />
      ))}
      { status !== 'loading' && status !== 'pending' && <Button onClick={() => reload()}> }
    </View>
  )
}
```

### useNews

```javascript
import { useNews } from '@skolplattformen/react-native-embedded-api'

export default function NewsComponent ({ selectedChild }) => {
  const { status, data, error, reload } = useNews(selectedChild)
  
  return (
    <View>
      { status === 'loading' && <Spinner />}
      { error && <Text>{ error.message }</Text>}
      { data.map((item) => (
        <NewsItem item={item} />
      ))}
      { status !== 'loading' && status !== 'pending' && <Button onClick={() => reload()}> }
    </View>
  )
}
```

To display image from `NewsItem`:

```javascript
import { useApi } from '@skolplattformen/react-native-embedded-api'

export default function NewsItem ({ item }) => {
  const { cookie } = useApi()
  
  return (
    <View>
      { cookie &&
        <Image source={{ uri: item.fullImageUrl, headers: { cookie } }} /> }
    </View>
  )
}
```

### useNotifications

```javascript
import { useNotifications } from '@skolplattformen/react-native-embedded-api'

export default function NotificationsComponent ({ selectedChild }) => {
  const { status, data, error, reload } = useNotifications(selectedChild)
  
  return (
    <View>
      { status === 'loading' && <Spinner />}
      { error && <Text>{ error.message }</Text>}
      { data.map((item) => (
        <Notification item={item} />
      ))}
      { status !== 'loading' && status !== 'pending' && <Button onClick={() => reload()}> }
    </View>
  )
}
```

To show content of `NotificationItem` url:

```javascript
import { useApi } from '@skolplattformen/react-native-embedded-api'
import { WebView } from 'react-native-webview'

export default function Notification ({ item }) => {
  const { cookie } = useApi()
  
  return (
    <View>
      <WebView source={{ uri: item.url, headers: { cookie }}} />
    </View>
  )
}
```

### useSchedule

```javascript
import { DateTime } from 'luxon'
import { useSchedule } from '@skolplattformen/react-native-embedded-api'

export default function ScheduleComponent ({ selectedChild }) => {
  const from = DateTime.local()
  const to = DateTime.local.plus({ week: 1 })
  const { status, data, error, reload } = useSchedule(selectedChild, from, to)
  
  return (
    <View>
      { status === 'loading' && <Spinner />}
      { error && <Text>{ error.message }</Text>}
      { data.map((item) => (
        <ScheduleItem item={item} />
      ))}
      { status !== 'loading' && status !== 'pending' && <Button onClick={() => reload()}> }
    </View>
  )
}
```

### useUser

```javascript
import { useUser } from '@skolplattformen/react-native-embedded-api'

export default function UserComponent () => {
  const { status, data, error, reload } = useUser()
  
  return (
    <View>
      { status === 'loading' && <Spinner />}
      { error && <Text>{ error.message }</Text>}
      { data &&
        <>
          <Text>{data.firstName} {data.lastName}</Text>
          <Text>{data.email}</Text>
        </>
      }
      { status !== 'loading' && status !== 'pending' && <Button onClick={() => reload()}> }
    </View>
  )
}
```

## Fake mode

To make testing easier, fake mode can be enabled at login. Just use any of the magic
personal numbers: `12121212121212`, `201212121212` or `1212121212`.
The returned login status will have `token` set to `'fake'`.

```javascript
import { useApi } from '@skolplattformen/react-native-embedded-api'


import { useApi } from '@skolplattformen/react-native-embedded-api'

export default function LoginController () {
  const { login, logout, on, isLoggedIn } = useApi()

  const [personalNumber, setPersonalNumber] = useState()
  const [bankIdStatus, setBankIdStatus] = useState('')

  on('login', () => { /* do login stuff */ })
  on('logout', () => { /* do logout stuff */ })

  const doLogin = async () => {
    const status = await login(personalNumber)

    if (status.token !== 'fake') {
      openBankID(status.token)
    } else {
      // Login will succeed
      // All data will be faked
      // No server calls will be made
    }
  })

  return (
    <View>
      <Input value={personalNumber} onChange={(value) = setPersonalNumber(value)} />
      <Button onClick={() => doLogin()}>
      <Text>{bankIdStatus}</Text>
      <Text>Logged in: {isLoggedIn}</Text>
    </View>
  )
}
```
