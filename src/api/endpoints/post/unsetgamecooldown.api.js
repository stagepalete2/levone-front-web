import axios from 'axios'
import { useCompany } from '../../../zustand'

const unsetGameCooldown = async ({vk_user_id, branch}) => {
	const domain = useCompany.getState().domain

	try {
		const response = await axios.delete(`https://${domain}/api/v1/game/cooldown/`, {
				params: {
				vk_user_id: vk_user_id,
				branch: branch
			}
		})
		return response.data
	} catch (error) {
		console.log(error)
	}
}

export default unsetGameCooldown