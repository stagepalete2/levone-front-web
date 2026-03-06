
import { useClient, useModal } from '../../../zustand'
import patchClient from '../../endpoints/patch/updateclient.api'

const useUpdateClientHandler = () => {
	const setBirthDate = useClient((state) => state.setBirthDate)
	const clearQueue = useModal((state) => state.clearQueue)

	const updateClient = async ({ vk_user_id, branch, birth_date }) => {
		try {

			const client = await patchClient({
				vk_user_id: vk_user_id,
				branch_id: branch,
				birth_date: birth_date
			})

			if (client) {
				setBirthDate(client.birth_date)
				clearQueue({
					pageId: 'game'
				})
			}
		} catch (error) {
			console.log(error)
		}
	}

	return { updateClient }
}

export default useUpdateClientHandler