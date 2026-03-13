import axios from 'axios'
import { useCompany } from '../../../zustand'

// Phase 2: claim reward after animation
// Returns { type: 'coin', reward: N } or { type: 'super_prize', reward: { super_prize_id, available_products } }
const postGameClaim = async ({ session_token, employee_id }) => {
	const domain = useCompany.getState().domain

	try {
		const body = { session_token }
		if (employee_id) body.employee_id = employee_id

		const response = await axios.post(`https://${domain}/api/v1/game/claim/`, body)
		return response.data
	} catch (error) {
		if (error.response) {
			console.error('[Game Claim] API error:', error.response.data)

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

export default postGameClaim
