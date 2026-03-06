
import { useClient, useParams } from '../../../zustand'
import unsetGameCooldown from '../../endpoints/post/unsetgamecooldown.api'

const useUnsetGameCooldown = () => {
	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)


	const unset = async () => {
		try {
			const response = await unsetGameCooldown({
				vk_user_id: client.vk_user_id,
				branch: branch
			})
		} catch (error) {
			console.log(error)
		}
	}

	return { unset }

}

export default useUnsetGameCooldown