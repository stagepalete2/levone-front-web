



import axios from 'axios'
import { useCompany } from '../../../zustand'

const postClient = async ({vk_user_id, branch, name, lastname, sex}) => {
	const domain = useCompany.getState().domain

	try {
		const response = await axios.post(`https://${domain}/api/v1/client/`, {
			vk_user_id: vk_user_id, 
			name: name,
			lastname: lastname,
			branch_id: branch,
			sex: sex
		})
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

export default postClient