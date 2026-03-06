/**
 * VK ID OAuth 2.1 Service (через @vkid/sdk v2.6+)
 * 
 * SDK сам управляет:
 *   - PKCE (code_verifier хранится в cookie, переживает redirect)
 *   - Обмен code → access_token (через fetch на id.vk.ru/oauth2/auth)
 *   - Все домены уже .vk.ru
 * 
 * Поток:
 *   1. VKID Config.init() — инициализация с app_id и redirectUrl
 *   2. VKID Auth.login() — redirect на id.vk.ru/authorize
 *   3. Юзер авторизуется
 *   4. VK редиректит на redirect_uri?code=...&device_id=...&state=...
 *   5. VKID Auth.exchangeCode(code, device_id) — обмен на access_token
 *   6. Токен сохраняется, юзер-инфо запрашивается через api.vk.ru
 */

import { Auth, Config, ConfigAuthMode } from '@vkid/sdk'

const VK_APP_ID = parseInt(import.meta.env.VITE_VK_APP_ID || '54473505')

// Storage key
const AUTH_STORAGE_KEY = 'levone_vk_auth'

let vkidInitialized = false

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
 * Должна вызываться ДО login() и exchangeCode().
 * Безопасно вызывать несколько раз — повторно не инициализирует.
 */
function ensureVkidInit() {
	if (vkidInitialized) return

	const redirectUri = getRedirectUri()

	Config.init({
		app: VK_APP_ID,
		redirectUrl: redirectUri,
		mode: ConfigAuthMode.Redirect,
	})

	vkidInitialized = true
	console.log('[VK Auth] SDK init OK — app:', VK_APP_ID, 'redirect:', redirectUri)
}

// ============ Auth Data Storage ============

export function saveAuthData(data) {
	try {
		sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
	} catch (e) {
		console.warn('[VK Auth] Failed to save auth data:', e)
	}
}

export function loadAuthData() {
	try {
		const stored = sessionStorage.getItem(AUTH_STORAGE_KEY)
		if (!stored) return null
		const data = JSON.parse(stored)
		if (data.expires_at && Date.now() > data.expires_at) {
			sessionStorage.removeItem(AUTH_STORAGE_KEY)
			return null
		}
		return data
	} catch (e) {
		return null
	}
}

export function clearAuthData() {
	sessionStorage.removeItem(AUTH_STORAGE_KEY)
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

	if (!code) {
		return null
	}

	console.log('[VK Auth] Callback detected — exchanging code for token...')

	ensureVkidInit()

	try {
		// SDK берёт code_verifier из cookie (сохранён при login())
		const tokenData = await Auth.exchangeCode(code, deviceId)

		if (!tokenData || !tokenData.access_token) {
			console.error('[VK Auth] exchangeCode failed:', tokenData)
			return null
		}

		console.log('[VK Auth] Token OK, user_id:', tokenData.user_id)

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
		const savedHash = sessionStorage.getItem('levone_pre_auth_hash')
		sessionStorage.removeItem('levone_pre_auth_hash')

		const cleanUrl =
			window.location.origin +
			window.location.pathname +
			(savedHash || '#/')

		console.log('[VK Auth] Clean redirect →', cleanUrl)
		window.location.replace(cleanUrl)
		return 'redirecting'

	} catch (err) {
		console.error('[VK Auth] exchangeCode error:', err)
		return null
	}
}

// ============ Login ============

/**
 * Запуск авторизации через VK ID.
 * 
 * SDK сам:
 *   - Генерирует code_verifier, сохраняет в cookie
 *   - Формирует URL с code_challenge
 *   - Делает location.assign() на VK ID
 */
export async function loginWithVk(options = {}) {
	// Сохраняем текущий hash (чтобы вернуться после авторизации)
	sessionStorage.setItem('levone_pre_auth_hash', window.location.hash)

	ensureVkidInit()

	console.log('[VK Auth] Starting login...')

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
