/**
 * VK OAuth Service
 * Handles VK authentication via popup window with OAuth 2.0 implicit flow.
 */

const VK_AUTH_URL = 'https://oauth.vk.com/authorize'
const VK_APP_ID = import.meta.env.VITE_VK_APP_ID || '53418653'

// Storage key for persisting auth data
const AUTH_STORAGE_KEY = 'levone_vk_auth'

/**
 * Get the redirect URI for OAuth callback
 */
function getRedirectUri() {
	return `${window.location.origin}${window.location.pathname}`
}

/**
 * Save auth data to sessionStorage
 */
export function saveAuthData(data) {
	try {
		sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
	} catch (e) {
		console.warn('Failed to save auth data:', e)
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
		// Check if token is still valid (has expires_in)
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
 * Check if current page is an OAuth callback (redirect back from VK)
 */
export function checkOAuthCallback() {
	const hash = window.location.hash
	if (hash && hash.includes('access_token=')) {
		const authData = parseVkAuthHash(hash)
		if (authData) {
			// Restore original hash params (company, branch, etc.)
			const savedHash = sessionStorage.getItem('levone_pre_auth_hash')
			if (savedHash) {
				sessionStorage.removeItem('levone_pre_auth_hash')
				window.history.replaceState(null, '', window.location.pathname + savedHash)
			} else {
				window.history.replaceState(null, '', window.location.pathname + window.location.search)
			}
			return authData
		}
	}
	return null
}

/**
 * Initiate VK OAuth login via popup
 * @param {object} options
 * @param {string} options.scope - VK permissions (default: basic)
 * @returns {Promise<{access_token, user_id, expires_in}>}
 */
export function loginWithVk(options = {}) {
	const { scope = 'friends,groups' } = options

	// Save current hash before redirect (in case popup is blocked)
	sessionStorage.setItem('levone_pre_auth_hash', window.location.hash)

	return new Promise((resolve, reject) => {
		const redirectUri = getRedirectUri()

		const params = new URLSearchParams({
			client_id: VK_APP_ID,
			redirect_uri: redirectUri,
			display: 'popup',
			scope: scope,
			response_type: 'token',
			v: '5.199',
		})

		const authUrl = `${VK_AUTH_URL}?${params.toString()}`

		// Open popup
		const width = 680
		const height = 520
		const left = window.screenX + (window.outerWidth - width) / 2
		const top = window.screenY + (window.outerHeight - height) / 2

		const popup = window.open(
			authUrl,
			'vk_auth',
			`width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
		)

		if (!popup) {
			// Popup blocked - use redirect flow instead
			window.location.href = authUrl
			return
		}

		// Poll popup for redirect
		const pollTimer = setInterval(() => {
			try {
				if (!popup || popup.closed) {
					clearInterval(pollTimer)
					reject(new Error('VK auth popup was closed'))
					return
				}

				// Check if popup redirected back to our domain
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
				// Cross-origin error — popup is still on VK domain, keep polling
			}
		}, 200)

		// Timeout after 5 minutes
		setTimeout(() => {
			clearInterval(pollTimer)
			if (popup && !popup.closed) {
				popup.close()
			}
			reject(new Error('VK auth timeout'))
		}, 300000)
	})
}

/**
 * Parse bdate string from VK profile
 * VK returns bdate in formats: "D.M.YYYY" or "D.M" (if year is hidden)
 * @param {string} bdate - e.g. "15.3.1990" or "15.3"
 * @returns {string|null} - "YYYY-MM-DD" format or null
 */
export function parseVkBdate(bdate) {
	if (!bdate) return null
	const parts = bdate.split('.')
	if (parts.length !== 3) return null // No year = incomplete date

	const day = parts[0].padStart(2, '0')
	const month = parts[1].padStart(2, '0')
	const year = parts[2]

	// Validate
	if (year.length !== 4) return null
	const date = new Date(`${year}-${month}-${day}`)
	if (isNaN(date.getTime())) return null

	return `${year}-${month}-${day}`
}
