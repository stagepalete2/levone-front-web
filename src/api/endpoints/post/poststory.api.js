import axios from 'axios'
import { useCompany } from '../../../zustand'

const postStory = async ({ vk_id, branch_id }) => {
	const domain = useCompany.getState().domain

	try {
		const response = await axios.post(`https://${domain}/api/v1/vk/story/`, {
			vk_id,
			branch_id
		})
		return response.data
	} catch (error) {
		if (error.response) {
			console.error('[Story] API error:', error.response.data)
			throw new Error(error.response.data?.detail || 'Request failed')
		} else if (error.request) {
			throw new Error('No response from server')
		} else {
			throw new Error(error.message)
		}
	}
}

export default postStory
