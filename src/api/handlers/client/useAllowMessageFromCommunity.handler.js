import { useClient, useParams } from '../../../zustand'
import patchClient from '../../endpoints/patch/updateclient.api'



export const useAllowMessageFromCommunity = () => {
	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)
	const setIsAllowedMessageFromCommunity = useClient((state) => state.setIsAllowedMessageFromCommunity)

	const allowMessageFromCommunity = async ({ group_id }) => {
		try {
			if (client) {
				// On website, we can't programmatically request message permission.
				// Open VK group messages page and optimistically mark as allowed.
				window.open(`https://vk.com/im?sel=-${group_id}`, '_blank')

				try {
					const response = await patchClient({
						vk_id: client.vk_id || client.vk_user_id,
						branch_id: branch,
						is_allowed_message: true
					})
					if (response) {
						setIsAllowedMessageFromCommunity(true)
					}
				} catch (error) {
					console.log(error)
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	return { allowMessageFromCommunity }
}