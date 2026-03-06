
import { useActiveQuest, useQuestCooldown } from '../../../zustand'
import getQuestCooldown from '../../endpoints/get/quest.cooldown.api'
import postActivateQuest from '../../endpoints/post/activatequest.api'

const useActivateQuest = () => {
	const setActiveQuest = useActiveQuest((state) => state.setActiveQuest)
	const setQuestCooldown = useQuestCooldown((state) => state.setQuestCooldown)

	const activate = async ({vk_user_id, branch, quest_id}) => {
		try {
			const response = await postActivateQuest({vk_user_id, branch, quest_id})

			if (response.id) {
				setActiveQuest(response)
			}

			const cooldown = getQuestCooldown({vk_user_id, branch})
			if (cooldown) {
				setQuestCooldown(cooldown)
			}
		} catch (error) {
			console.log(error)
		}
	}

	return {activate}
}

export default useActivateQuest