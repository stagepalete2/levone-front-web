

import { useCatalogCooldown, useClient, useInventory } from '../../../zustand'
import getCatalogCooldown from '../../endpoints/get/catalog.cooldown.api'
import postBuyItem from '../../endpoints/post/buyitem.api'

const useBuy = () => {
	const addItem = useInventory((state) => state.addItem)
	const removeCoins = useClient((state) => state.removeCoins)
	const setCatalogCooldown = useCatalogCooldown((state) => state.setCatalogCooldown)

	const buy = async ({ vk_user_id, branch, product_id }) => {
		try {
			const response = await postBuyItem({
				vk_user_id: vk_user_id,
				branch: branch,
				product_id: product_id
			})

			if (response.id) {
				addItem(response)
				removeCoins(response.price)
			}

			const cooldownResponse = await getCatalogCooldown({ vk_user_id: vk_user_id, branch: branch })
			if (cooldownResponse) {
				setCatalogCooldown(cooldownResponse)
			}

		} catch (error) {
			console.log(error)
		}
	}

	return { buy }
}

export default useBuy