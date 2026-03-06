
import axios from 'axios'
import { useCompany } from '../../../zustand'

const postActivatePrize = async ({ vk_user_id, branch, inventory_id, code }) => {
	const domain = useCompany.getState().domain

	try {
		const body = {
			vk_user_id: vk_user_id,
			branch_id: branch,
			inventory_id: inventory_id
		}
		if (code !== undefined) {
			body.code = code
		}
		const response = await axios.post(`https://${domain}/api/v1/inventory/activate/`, body)
		return response.data
	} catch (error) {
		if (error.response) {
			console.error("API error:", error.response.data);

			if (error.response.status === 404) {
				return null;
			}

			throw new Error(error.response.data?.error || "Request failed");
		} else if (error.request) {
			throw new Error("No response from server");
		} else {
			throw new Error(error.message);
		}
	}
}

export default postActivatePrize