
import { useAuth, useClient } from '../../../zustand'
import postClient from '../../endpoints/post/client.api'

const useClientHandler = () => {
	const setClient = useClient((state) => state.setClient)

	const getClient = async ({ branch }) => {
		try {
			const vkUser = useAuth.getState().vkUser

			if (!vkUser?.id) {
				console.warn('VK user info missing — cannot continue')
				return
			}

			console.log(vkUser)

			const client = await postClient({
				vk_user_id: vkUser.id,
				branch: branch,
				name: vkUser.first_name,
				lastname: vkUser.last_name,
				sex: vkUser.sex
			})

			console.log(client)

			if (client) {
				setClient(client)
			}

			return client
		} catch (error) {
			console.log(error)
		}
	}

	return { getClient }
}

export default useClientHandler