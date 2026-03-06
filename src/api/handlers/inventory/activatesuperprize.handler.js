import { useInventory, useSuperPrize } from '../../../zustand'
import postActivateSuperPrize from '../../endpoints/post/activatesuperprize.api'


const useActivateSuperPrize = () => {

	const addItem = useInventory((state) => state.addItem)
	const activateSuperPrize = useSuperPrize((state) => state.activateSuperPrize)

	const activate = async ({vk_user_id, branch, product_id, super_prize}) => {
		try {
			const response = await postActivateSuperPrize({
				vk_user_id: vk_user_id, 
				branch: branch, 
				product_id: product_id
			})

			if (response.id) {
				addItem(response)
				activateSuperPrize(super_prize.id)
			}
		} catch (error) {
			console.log(error)
		}
 	}

	return { activate }

}

export default useActivateSuperPrize