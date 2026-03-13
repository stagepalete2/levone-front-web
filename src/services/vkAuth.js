/**
 * VK ID OAuth 2.1 Service (через @vkid/sdk v2.6+)
 * 
 * ВАЖНО: SDK v2.6 имеет баг — не сохраняет code_verifier в cookie.
 * Поэтому мы сами генерируем state + codeVerifier, сохраняем в localStorage,
 * и передаём в Config.init при каждой инициализации.
 * 
 * Поток:
 *   1. Генерируем state + codeVerifier, сохраняем в localStorage
 *   2. VKID Config.init() с app_id, redirectUrl, state, codeVerifier
 *   3. VKID Auth.login() — redirect на id.vk.ru/authorize
 *   4. Юзер авторизуется
 *   5. VK редиректит на redirect_uri?code=...&device_id=...&state=...
 *   6. Восстанавливаем codeVerifier из localStorage
 *   7. Config.init() с тем же codeVerifier → Auth.exchangeCode()
 *   8. Токен сохраняется
 */

import { Auth, Config, ConfigAuthMode } from '@vkid/sdk'

const VK_APP_ID = parseInt(import.meta.env.VITE_VK_APP_ID || '54473505')

// Storage keys
const AUTH_STORAGE_KEY = 'levone_vk_auth'
const PKCE_STORAGE_KEY = 'levone_vk_pkce'


// ============ PKCE Helpers ============

/**
 * Генерация случайной строки для state / codeVerifier
 */
function generateRandomString(length = 64) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
	const array = new Uint8Array(length)
	crypto.getRandomValues(array)
	return Array.from(array, byte => chars[byte % chars.length]).join('')
}

/**
 * Сохранить PKCE данные (state + codeVerifier) в localStorage
 */
function savePkceData(state, codeVerifier) {
	const data = { state, codeVerifier, ts: Date.now() }
	try { localStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(data)) } catch(e) {}
	try { sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(data)) } catch(e) {}
}

/**
 * Загрузить PKCE данные из localStorage
 */
function loadPkceData() {
	try {
		let stored = localStorage.getItem(PKCE_STORAGE_KEY)
		if (!stored) stored = sessionStorage.getItem(PKCE_STORAGE_KEY)
		if (!stored) return null
		const data = JSON.parse(stored)
		// PKCE данные действительны 10 минут
		if (Date.now() - data.ts > 10 * 60 * 1000) {
			clearPkceData()
			return null
		}
		return data
	} catch(e) {
		return null
	}
}

function clearPkceData() {
	try { localStorage.removeItem(PKCE_STORAGE_KEY) } catch(e) {}
	try { sessionStorage.removeItem(PKCE_STORAGE_KEY) } catch(e) {}
}

// ============ Init ============

function getRedirectUri() {
	if (import.meta.env.VITE_VK_REDIRECT_URI) {
		return import.meta.env.VITE_VK_REDIRECT_URI
	}
	let uri = window.location.origin + window.location.pathname
	uri = uri.replace(/([^:])\/\//g, '$1/')
	return uri
}

/**
 * Инициализация VK ID SDK.
 * Каждый раз передаём state и codeVerifier.
 * @param {string|null} codeVerifier — если передан, используем его (для callback)
 * @param {string|null} state — если передан, используем его
 */
function initVkid(codeVerifier, state) {
	const redirectUri = getRedirectUri()

	const initParams = {
		app: VK_APP_ID,
		redirectUrl: redirectUri,
		mode: ConfigAuthMode.Redirect,
	}

	if (state) {
		initParams.state = state
	}
	if (codeVerifier) {
		initParams.codeVerifier = codeVerifier
	}

	Config.init(initParams)

	console.log('[VK Auth] SDK init OK — app:', VK_APP_ID, 'redirect:', redirectUri, 'state:', state ? 'yes' : 'no', 'codeVerifier:', codeVerifier ? 'yes' : 'no')
}

// ============ Auth Data Storage ============

export function saveAuthData(data) {
	try {
		sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
	} catch (e) {
		console.warn('[VK Auth] Failed to save auth data to session:', e)
	}
	try {
		localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
	} catch (e) {
		console.warn('[VK Auth] Failed to save auth data to local:', e)
	}
}

export function loadAuthData() {
	try {
		// Пробуем sessionStorage, потом localStorage
		let stored = sessionStorage.getItem(AUTH_STORAGE_KEY)
		if (!stored) {
			stored = localStorage.getItem(AUTH_STORAGE_KEY)
		}
		if (!stored) return null
		const data = JSON.parse(stored)
		if (data.expires_at && Date.now() > data.expires_at) {
			sessionStorage.removeItem(AUTH_STORAGE_KEY)
			localStorage.removeItem(AUTH_STORAGE_KEY)
			return null
		}
		return data
	} catch (e) {
		return null
	}
}

export function clearAuthData() {
	sessionStorage.removeItem(AUTH_STORAGE_KEY)
	try { localStorage.removeItem(AUTH_STORAGE_KEY) } catch(e) {}
}

// ============ OAuth Callback ============

/**
 * Проверяет, вернулся ли юзер с VK ID после авторизации.
 * 
 * VK ID возвращает query-параметры: ?code=...&device_id=...&state=...
 * 
 * Если code найден:
 *   1. Инициализируем SDK
 *   2. Auth.exchangeCode(code, device_id) → access_token
 *   3. Сохраняем токен
 *   4. Чистим URL, делаем redirect на чистую страницу
 * 
 * @returns {Promise<'redirecting'|null>}
 */
export async function checkOAuthCallback() {
	const urlParams = new URLSearchParams(window.location.search)
	const code = urlParams.get('code')
	const deviceId = urlParams.get('device_id')
	// State из URL — это то, что VK вернул нам обратно.
	// Передаём его в Config, чтобы SDK не жаловался на несоответствие.
	const stateFromUrl = urlParams.get('state')

	if (!code) {
		return null
	}

	console.log('[VK Auth] Callback detected — exchanging code for token...')

	// Восстанавливаем codeVerifier, сохранённый перед redirect
	const pkceData = loadPkceData()
	if (!pkceData?.codeVerifier) {
		console.error('[VK Auth] No saved codeVerifier found! PKCE will fail.')
	}

	// Используем state из URL (не из storage) — они всегда совпадут.
	// codeVerifier берём из storage — он нужен для PKCE и не передаётся в URL.
	initVkid(pkceData?.codeVerifier || null, stateFromUrl || pkceData?.state || null)

	try {
		const tokenData = await Auth.exchangeCode(code, deviceId)

		if (!tokenData || !tokenData.access_token) {
			console.error('[VK Auth] exchangeCode failed:', tokenData)
			clearPkceData()
			return null
		}

		console.log('[VK Auth] Token OK, user_id:', tokenData.user_id)
		clearPkceData()

		const authData = {
			access_token: tokenData.access_token,
			user_id: typeof tokenData.user_id === 'number'
				? tokenData.user_id
				: parseInt(tokenData.user_id),
			expires_in: tokenData.expires_in,
			expires_at: Date.now() + (tokenData.expires_in || 3600) * 1000,
		}

		saveAuthData(authData)

		// Восстанавливаем оригинальный hash (company, branch, table)
		// Пробуем sessionStorage, потом localStorage (fallback для VK WebView)
		let savedHash = sessionStorage.getItem('levone_pre_auth_hash')
		if (!savedHash) {
			try { savedHash = localStorage.getItem('levone_pre_auth_hash') } catch(e) {}
		}
		sessionStorage.removeItem('levone_pre_auth_hash')
		try { localStorage.removeItem('levone_pre_auth_hash') } catch(e) {}

		const cleanUrl =
			window.location.origin +
			window.location.pathname +
			(savedHash || '#/')

		console.log('[VK Auth] Clean redirect →', cleanUrl)
		window.location.replace(cleanUrl)
		return 'redirecting'

	} catch (err) {
		console.error('[VK Auth] exchangeCode error:', err)
		clearPkceData()
		return null
	}
}

// ============ Login ============

/**
 * Запуск авторизации через VK ID.
 * 
 * 1. Генерируем state + codeVerifier
 * 2. Сохраняем в localStorage (переживает redirect)
 * 3. Инициализируем SDK с этими параметрами
 * 4. Auth.login() → redirect на VK ID
 */
export async function loginWithVk(options = {}) {
	// Сохраняем текущий hash (чтобы вернуться после авторизации)
	// Дублируем в localStorage — sessionStorage ненадёжен в VK WebView
	const currentHash = window.location.hash
	sessionStorage.setItem('levone_pre_auth_hash', currentHash)
	try { localStorage.setItem('levone_pre_auth_hash', currentHash) } catch(e) {}

	// Генерируем PKCE параметры и сохраняем
	const state = generateRandomString(32)
	const codeVerifier = generateRandomString(64)
	savePkceData(state, codeVerifier)

	// Инициализируем SDK с нашими PKCE параметрами
	initVkid(codeVerifier, state)

	console.log('[VK Auth] Starting login with state:', state.substring(0, 8) + '...')

	// SDK делает redirect (mode: Redirect)
	await Auth.login()

	// Страница уходит — промис никогда не разрешится
	return new Promise(() => {})
}

// ============ Helpers ============

/**
 * Parse bdate string from VK profile
 * VK: "D.M.YYYY" or "D.M" (без года)
 * @returns {string|null} "YYYY-MM-DD" or null
 */
export function parseVkBdate(bdate) {
	if (!bdate) return null
	const parts = bdate.split('.')
	if (parts.length !== 3) return null

	const day = parts[0].padStart(2, '0')
	const month = parts[1].padStart(2, '0')
	const year = parts[2]

	if (year.length !== 4) return null
	const date = new Date(`${year}-${month}-${day}`)
	if (isNaN(date.getTime())) return null

	return `${year}-${month}-${day}`
}
