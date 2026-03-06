
import { useActiveQuest, useClient, useQuest, useQuestCooldown } from '../../../zustand'
import getQuestCooldown from '../../endpoints/get/quest.cooldown.api'
import postSubmitQuest from '../../endpoints/post/submitquest.api'

const useSubmitQuest = () => {

	const removeActiveQuest = useActiveQuest((state) => state.removeActiveQuest)
	const setComplete = useQuest((state) => state.setComplete)
	const addCoins = useClient((state) => state.addCoins)
	const setCooldown = useQuestCooldown((state) => state.setQuestCooldown)

	const submit = async ({vk_user_id, branch, quest_id, code, employee_id}) => {
		try {
			const response = await postSubmitQuest({vk_user_id, branch, quest_id, code, employee_id})
			if (response.code) {
				return response
			}

			if (response.id) {
				removeActiveQuest()
				addCoins(response.quest.reward)
				setComplete(response.quest.id)
			}

			const cooldownResponse = await getQuestCooldown({ branch: branch, vk_user_id: vk_user_id })
			if (cooldownResponse) {
				setCooldown(cooldownResponse)
			}
		} catch (error) {
			console.log(error)
		}
	}

	return { submit }
}

export default useSubmitQuest