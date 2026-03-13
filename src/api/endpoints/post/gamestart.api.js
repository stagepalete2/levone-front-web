import axios from 'axios'
import { useCompany } from '../../../zustand'

// Phase 1: open game session, get session_token + score (1-10)
// Returns { session_token, score } or { needs_code: true } or null on error
const postGameStart = async ({ vk_user_id, branch, code = '' }) => {
	const domain = useCompany.getState().domain

	try {
		const response = await axios.post(`https://${domain}/api/v1/game/start/`, {
			vk_id: vk_user_id,
			branch_id: branch,
			code: code
		})
		return response.data
	} catch (error) {
		if (error.response) {
			console.error('[Game Start] API error:', error.response.data)

			// 409 = cooldown active → { expires_at, seconds_remaining }
			if (error.response.status === 409) {
				throw error
			}
			if (error.response.status === 404) {
				return null
			}

			throw new Error(error.response.data?.detail || error.response.data?.error || 'Request failed')
		} else if (error.request) {
			throw new Error('No response from server')
		} else {
			throw new Error(error.message)
		}
	}
}

export default postGameStart
