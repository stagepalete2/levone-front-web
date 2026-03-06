/**
 * VK API Service
 * Makes VK API calls via JSONP to avoid CORS restrictions.
 * Falls back to VK ID /oauth2/user_info if JSONP fails.
 */

let callbackCounter = 0

/**
 * Call VK API method via JSONP
 * @param {string} method - VK API method name (e.g. 'users.get')
 * @param {object} params - method parameters (access_token included)
 * @returns {Promise}
 */
export function vkApiCall(method, params = {}) {
	return new Promise((resolve, reject) => {
		const callbackName = `__vk_cb_${Date.now()}_${callbackCounter++}`
		const script = document.createElement('script')

		const queryParams = {
			...params,
			callback: callbackName,
			v: '5.199',
		}

		const queryString = Object.entries(queryParams)
			.filter(([, v]) => v !== undefined && v !== null)
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join('&')

		script.src = `https://api.vk.ru/method/${method}?${queryString}`

		const cleanup = () => {
			delete window[callbackName]
			if (script.parentNode) {
				script.parentNode.removeChild(script)
			}
		}

		// Timeout after 10 seconds
		const timer = setTimeout(() => {
			cleanup()
			reject(new Error(`VK API timeout: ${method}`))
		}, 10000)

		window[callbackName] = (data) => {
			clearTimeout(timer)
			cleanup()
			if (data.error) {
				reject(data.error)
			} else {
				resolve(data.response)
			}
		}

		script.onerror = () => {
			clearTimeout(timer)
			cleanup()
			reject(new Error(`VK API request failed: ${method}`))
		}

		document.head.appendChild(script)
	})
}

/**
 * Get user info from VK ID /oauth2/user_info endpoint.
 * Works reliably with VK ID OAuth 2.1 tokens (unlike legacy api.vk.ru).
 * @param {string} accessToken
 * @returns {Promise<{id, first_name, last_name, sex, bdate, photo_200}>}
 */
async function getVkIdUserInfo(accessToken) {
	const response = await fetch('https://id.vk.com/oauth2/user_info', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ access_token: accessToken }),
	})

	if (!response.ok) {
		throw new Error(`VK ID user_info failed: ${response.status}`)
	}

	const data = await response.json()

	if (data.error) {
		throw new Error(`VK ID user_info error: ${data.error}`)
	}

	const user = data.user || data

	// Normalize to the same shape as users.get response
	return {
		id: Number(user.user_id || user.id),
		first_name: user.first_name || '',
		last_name: user.last_name || '',
		sex: user.sex != null ? Number(user.sex) : 0,
		bdate: user.birthday || user.bdate || null,
		photo_200: user.avatar || user.photo_200 || '',
	}
}

/**
 * Get VK user info
 * Tries legacy api.vk.ru first, falls back to VK ID /oauth2/user_info
 * @param {string} accessToken
 * @returns {Promise<{id, first_name, last_name, sex, bdate, photo_200}>}
 */
export async function getVkUserInfo(accessToken) {
	// Strategy 1: Legacy VK API via JSONP
	try {
		const result = await vkApiCall('users.get', {
			access_token: accessToken,
			fields: 'sex,bdate,photo_200',
		})
		if (result?.[0]?.id) {
			console.log('[VK API] users.get OK via JSONP')
			return result[0]
		}
	} catch (err) {
		console.warn('[VK API] JSONP users.get failed, trying VK ID endpoint:', err.message || err)
	}

	// Strategy 2: VK ID /oauth2/user_info (always works with VK ID tokens)
	try {
		const user = await getVkIdUserInfo(accessToken)
		if (user?.id) {
			console.log('[VK API] user_info OK via VK ID endpoint')
			return user
		}
	} catch (err) {
		console.error('[VK API] VK ID user_info also failed:', err.message || err)
	}

	return null
}

/**
 * Get VK group info
 * @param {string} accessToken
 * @param {number} groupId
 * @returns {Promise}
 */
export async function getVkGroupInfo(accessToken, groupId) {
	try {
		const result = await vkApiCall('groups.getById', {
			access_token: accessToken,
			group_id: groupId,
		})
		return result?.groups?.[0] || result?.[0] || null
	} catch (err) {
		console.warn('getVkGroupInfo error:', err)
		return null
	}
}

/**
 * Check if user is member of a group
 * @param {string} accessToken
 * @param {number} groupId
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export async function checkVkGroupMembership(accessToken, groupId, userId) {
	try {
		const result = await vkApiCall('groups.isMember', {
			access_token: accessToken,
			group_id: groupId,
			user_id: userId,
		})
		return result === 1 || result === true
	} catch (err) {
		console.warn('checkVkGroupMembership error:', err)
		return false
	}
}

/**
 * Copy text to clipboard (replaces VKWebAppCopyText)
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(text)
			return true
		}
		// Fallback for older browsers
		const textarea = document.createElement('textarea')
		textarea.value = text
		textarea.style.position = 'fixed'
		textarea.style.left = '-9999px'
		document.body.appendChild(textarea)
		textarea.select()
		document.execCommand('copy')
		document.body.removeChild(textarea)
		return true
	} catch (err) {
		console.error('Copy to clipboard failed:', err)
		return false
	}
}
