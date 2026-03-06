/**
 * VK API Service
 * Makes VK API calls via JSONP to avoid CORS restrictions.
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
 * Get VK user info
 * @param {string} accessToken
 * @returns {Promise<{id, first_name, last_name, sex, bdate}>}
 */
export async function getVkUserInfo(accessToken) {
	const result = await vkApiCall('users.get', {
		access_token: accessToken,
		fields: 'sex,bdate,photo_200',
	})
	return result?.[0] || null
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
