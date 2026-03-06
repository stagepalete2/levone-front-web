
import axios from 'axios'
import { useCompany } from '../../../zustand'

const getSuperPrize = async ({ branch, vk_user_id }) => {
	const domain = useCompany.getState().domain
	try {
		const response = await axios.get(`https://${domain}/api/v1/super-prize/`, {
			params: { branch_id: branch, vk_user_id }
		});
		return response.data;
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
};

export default getSuperPrize;
