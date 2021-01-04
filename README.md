# @skolplattformen/react-native-embedded-api

## Installing

```npm i -S @skolplattformen/react-native-embedded-api```

```yarn add @skolplattformen/react-native-embedded-api```

## Using

### Login / logout

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
    // open BankID using status.token
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
