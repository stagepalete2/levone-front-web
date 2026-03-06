import { useClient } from '../../../zustand'


const useCheckIsAllowedMessageFromCimmunity = () => {

	const client = useClient((state) => state.client)

	const checkIsAllowedMessageFromCimmunity = async ({group_id}) => {
		try {
		} catch (error) {
			console.log(error)
		}
	}
}

export default useCheckIsAllowedMessageFromCimmunity