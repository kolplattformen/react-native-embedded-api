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
