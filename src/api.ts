import init from '@skolplattformen/embedded-api'
import CookieManager from '@react-native-community/cookies'

const api = init(fetch, () => { CookieManager.clearAll() })
export default api
