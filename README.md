# @skolplattformen/react-native-embedded-api

## Installing

```npm i -S @skolplattformen/react-native-embedded-api```

```yarn add @skolplattformen/react-native-embedded-api```

## Using

### Login / logout

```javascript
import { useApi } from '@skolplattformen/react-native-embedded-api'

const { login, logout, on } = useApi()
on('login', () => { /* do login stuff */ })
on('logout', () => { /* do logout stuff */ })

const status = await login('my personal number')
// open BankID using status.token
status.on('PENDING', () => { /* BankID app not yet opened */ })
status.on('USER_SIGN', () => { /* BankID app is open */ })
status.on('OK', () => { /* BankID signed. NOTE! User is NOT yet logged in! */ })
status.on('ERROR', (err) => { /* BankID failed */ })
```

### Get data

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


#### useChildList

```javascript
import { useChildList } from '@skolplattformen/react-native-embedded-api'

export default function ChildList () => {
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
