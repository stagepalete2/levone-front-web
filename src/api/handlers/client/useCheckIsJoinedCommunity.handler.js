import { checkVkGroupMembership } from '../../../services/vkApi'
import { useAuth, useClient } from '../../../zustand.js'
import patchClient from '../../endpoints/patch/updateclient.api.js'

export const useCheckIsJoinedCommunity = () => {
	const setIsJoinedCommunity = useClient((state) => state.setIsJoinedCommunity)

	const checkIsJoinedCommunity = async ({ vk_id, branch, group_id }) => {
		try {
			const groupIdInt = parseInt(group_id)
			if (!groupIdInt || isNaN(groupIdInt)) return

			const vkToken = useAuth.getState().vkToken
			if (!vkToken) return

			const isMember = await checkVkGroupMembership(vkToken, groupIdInt, vk_id)
			try {
				const response = await patchClient({ vk_id: vk_id, branch_id: branch, is_joined_community: isMember })
				if (response) {
					setIsJoinedCommunity(isMember)
				}
			} catch (error) {
				console.log(error)
			}
		} catch (error) {
			console.log(error)
		}
	}

	return { checkIsJoinedCommunity }
}
