import init from '@skolplattformen/embedded-api'
import CookieManager from '@react-native-community/cookies'

// eslint-disable-next-line no-empty
const api = init(fetch, () => { try { CookieManager.clearAll() } catch (_) { } })
export default api
