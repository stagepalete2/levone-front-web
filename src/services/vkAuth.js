/**
 * VK OAuth Service
 * 
 * Поток авторизации:
 * 
 * МОБИЛКА (QR → телефон):
 *   1. Редирект на oauth.vk.com/authorize?display=mobile
 *   2. ВК АВТОМАТИЧЕСКИ:
 *      - Если есть приложение ВК → открывает его → "Разрешить" → назад в браузер
 *      - Если нет приложения → форма входа в браузере → "Разрешить" → назад
 *   3. VK редиректит на redirect_uri#access_token=...
 *   4. checkOAuthCallback() ловит токен, сохраняет, восстанавливает hash
 * 
 * ДЕСКТОП:
 *   1. Popup окно с oauth.vk.com
 *   2. Пользователь авторизуется / жмёт "Разрешить"
 *   3. Popup возвращается на redirect_uri#access_token=...
 *   4. Родительское окно ловит токен из popup, закрывает его
 * 
 * ВАЖНО: redirect_uri ДОЛЖЕН ТОЧНО совпадать с настройками VK-приложения!
 * Установите VITE_VK_REDIRECT_URI в .env файле.
 */

const VK_AUTH_URL = 'https://oauth.vk.com/authorize'
const VK_APP_ID = import.meta.env.VITE_VK_APP_ID || '54473505'

// Storage key for persisting auth data
const AUTH_STORAGE_KEY = 'levone_vk_auth'

/**
 * Get the redirect URI for OAuth callback.
 * 
 * ПРИОРИТЕТ:
 * 1. VITE_VK_REDIRECT_URI из .env (рекомендуется — гарантированно совпадает с VK)
 * 2. Авто: origin + pathname (нормализованный)
 * 
 * ВАЖНО: Этот URI должен ТОЧНО совпадать с полем "Доверенный redirect URI"
 * в настройках VK-приложения на https://dev.vk.com
 */
function getRedirectUri() {
	// 1. Из .env — самый надёжный вариант
	if (import.meta.env.VITE_VK_REDIRECT_URI) {
		return import.meta.env.VITE_VK_REDIRECT_URI
	}

	// 2. Авто — origin + pathname
	let uri = window.location.origin + window.location.pathname

	// Нормализуем двойные слеши (кроме протокола)
	uri = uri.replace(/([^:])\/\//g, '$1/')

	return uri
}

/**
 * Save auth data to sessionStorage
 */
export function saveAuthData(data) {
	try {
		sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
	} catch (e) {
		console.warn('[VK Auth] Failed to save auth data:', e)
	}
}

/**
 * Load auth data from sessionStorage
 */
export function loadAuthData() {
	try {
		const stored = sessionStorage.getItem(AUTH_STORAGE_KEY)
		if (!stored) return null
		const data = JSON.parse(stored)
		// Token expired?
		if (data.expires_at && Date.now() > data.expires_at) {
			sessionStorage.removeItem(AUTH_STORAGE_KEY)
			return null
		}
		return data
	} catch (e) {
		return null
	}
}

/**
 * Clear auth data
 */
export function clearAuthData() {
	sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

/**
 * Parse VK OAuth response from URL hash
 * VK returns: #access_token=TOKEN&expires_in=SECONDS&user_id=ID
 */
function parseVkAuthHash(hash) {
	if (!hash || hash.length < 2) return null
	const params = new URLSearchParams(hash.substring(1))
	const accessToken = params.get('access_token')
	const expiresIn = params.get('expires_in')
	const userId = params.get('user_id')

	if (!accessToken) return null

	return {
		access_token: accessToken,
		user_id: parseInt(userId),
		expires_in: parseInt(expiresIn),
		expires_at: Date.now() + parseInt(expiresIn) * 1000,
	}
}

/**
 * Check if current page URL contains VK OAuth callback (access_token in hash).
 * 
 * Вызывается при загрузке. Если VK перенаправил сюда с токеном:
 * 1. Парсим и сохраняем токен в sessionStorage
 * 2. Восстанавливаем оригинальный hash (company, branch, etc.)
 * 3. location.replace → чистая перезагрузка
 * 
 * @returns {'redirecting'|null}
 */
export function checkOAuthCallback() {
	const hash = window.location.hash

	if (!hash || !hash.includes('access_token=')) {
		return null
	}

	const authData = parseVkAuthHash(hash)
	if (!authData) {
		console.warn('[VK Auth] Found access_token in hash but failed to parse')
		return null
	}

	console.log('[VK Auth] OAuth callback detected, user_id:', authData.user_id)

	// Сохраняем токен — переживёт reload
	saveAuthData(authData)

	// Восстанавливаем оригинальный hash (company, branch, table)
	const savedHash = sessionStorage.getItem('levone_pre_auth_hash')
	sessionStorage.removeItem('levone_pre_auth_hash')

	// Чистый URL без access_token
	const cleanUrl =
		window.location.origin +
		window.location.pathname +
		window.location.search +
		(savedHash || '#/')

	console.log('[VK Auth] Redirecting to clean URL:', cleanUrl)

	// Replace — кнопка "назад" не вернёт на URL с токеном
	window.location.replace(cleanUrl)
	return 'redirecting'
}

/**
 * Detect mobile device
 */
function isMobile() {
	return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
		navigator.userAgent
	)
}

/**
 * Initiate VK OAuth login.
 * 
 * МОБИЛКА:
 *   - display=mobile → ВК показывает мобильную страницу
 *   - Если у юзера есть приложение ВК → ВК сам откроет его → "Разрешить"
 *   - Если нет → покажет форму входа в браузере → "Разрешить"
 *   - После → редирект обратно на redirect_uri
 *   - НЕ показывает логин/пароль если приложение ВК установлено!
 * 
 * ДЕСКТОП:
 *   - Popup → display=popup
 *   - Fallback на redirect если popup заблокирован
 */
export function loginWithVk(options = {}) {
	const { scope = 'groups' } = options

	// Сохраняем текущий hash (company, branch, table и т.д.)
	sessionStorage.setItem('levone_pre_auth_hash', window.location.hash)

	const redirectUri = getRedirectUri()

	const params = new URLSearchParams({
		client_id: VK_APP_ID,
		redirect_uri: redirectUri,
		display: isMobile() ? 'mobile' : 'popup',
		scope: scope,
		response_type: 'token',
		v: '5.199',
		// revoke=1 — всегда показывать "Разрешить" (не auto-approve)
		revoke: '1',
	})

	const authUrl = `${VK_AUTH_URL}?${params.toString()}`

	// === DEBUG LOG — поможет найти проблему с redirect_uri ===
	console.log('[VK Auth] ========= OAUTH DEBUG =========')
	console.log('[VK Auth] App ID:', VK_APP_ID)
	console.log('[VK Auth] Redirect URI:', redirectUri)
	console.log('[VK Auth] Current URL:', window.location.href)
	console.log('[VK Auth] Scope:', scope)
	console.log('[VK Auth] Display:', isMobile() ? 'mobile' : 'popup')
	console.log('[VK Auth] Full auth URL:', authUrl)
	console.log('[VK Auth] ================================')
	console.log('[VK Auth] ⚠️  Если ошибка "redirect_uri is incorrect":')
	console.log('[VK Auth]    Зайдите на https://dev.vk.com → Приложения → ID', VK_APP_ID)
	console.log('[VK Auth]    В поле "Доверенный redirect URI" добавьте:', redirectUri)
	console.log('[VK Auth] ================================')

	// ===== МОБИЛКА — всегда redirect =====
	if (isMobile()) {
		window.location.href = authUrl
		return new Promise(() => {}) // Страница уходит
	}

	// ===== ДЕСКТОП — popup с fallback =====
	return new Promise((resolve, reject) => {
		const width = 680
		const height = 520
		const left = window.screenX + (window.outerWidth - width) / 2
		const top = window.screenY + (window.outerHeight - height) / 2

		const popup = window.open(
			authUrl,
			'vk_auth',
			`width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
		)

		if (!popup || popup.closed || typeof popup.closed === 'undefined') {
			console.warn('[VK Auth] Popup blocked, falling back to redirect')
			window.location.href = authUrl
			return
		}

		const pollTimer = setInterval(() => {
			try {
				if (!popup || popup.closed) {
					clearInterval(pollTimer)
					reject(new Error('VK auth popup was closed'))
					return
				}

				const popupUrl = popup.location.href
				if (popupUrl && popupUrl.startsWith(redirectUri)) {
					clearInterval(pollTimer)
					const hash = popup.location.hash
					popup.close()

					const authData = parseVkAuthHash(hash)
					if (authData) {
						saveAuthData(authData)
						resolve(authData)
					} else {
						reject(new Error('Failed to parse VK auth response'))
					}
				}
			} catch (e) {
				// Cross-origin — popup ещё на VK
			}
		}, 200)

		setTimeout(() => {
			clearInterval(pollTimer)
			if (popup && !popup.closed) popup.close()
			reject(new Error('VK auth timeout'))
		}, 300000)
	})
}

/**
 * Parse bdate string from VK profile
 * VK: "D.M.YYYY" or "D.M" (year hidden)
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
