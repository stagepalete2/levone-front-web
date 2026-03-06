
import { useInventory, useInventoryCooldown } from '../../../zustand'
import getInventoryCooldown from '../../endpoints/get/inventory.cooldown.api'
import postActivatePrize from '../../endpoints/post/activateprize.api'

const useActivate = () => {
	const activateItem = useInventory((state) => state.activateItem)
	const setInventoryCooldown = useInventoryCooldown((state) => state.setInventoryCooldown)

	const activate = async ({vk_user_id, branch, inventory_id, code}) => {
		try {
			const response = await postActivatePrize({
				vk_user_id: vk_user_id,
				branch: branch,
				inventory_id: inventory_id,
				code: code
			})

			if (response.id) {
				activateItem(response)
			}

			const cooldownResponse = await getInventoryCooldown({
				vk_user_id: vk_user_id,
				branch: branch
			})
			if (cooldownResponse) {
				setInventoryCooldown(cooldownResponse)
			}
			return response
		} catch (error) {
			console.log(error)
		}
	}

	return { activate }

}

export default useActivate