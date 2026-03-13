import { useClient, useGameCooldown, useParams } from '../../../zustand'
import postStory from '../../endpoints/post/poststory.api'
import unsetGameCooldown from '../../endpoints/post/unsetgamecooldown.api'



const usePostStory = () => {
	const client = useClient((state) => state.client)
	const company = useParams((state) => state.company)
	const branch = useParams((state) => state.branch)
	const setIsStoryUploaded = useClient((state) => state.setIsStoryUploaded)
	const resetGameCooldown = useGameCooldown((state) => state.resetGameCooldown)

	const post = async ({ image }) => {
		try {
			// On website, we can't use VK Story Box.
			// Open VK share dialog instead.
			const shareUrl = `${window.location.origin}${window.location.pathname}#/?company=${company}&branch=${branch}&is_referral=true&from=${client.id}`
			const vkShareUrl = `https://vk.ru/share.php?url=${encodeURIComponent(shareUrl)}&image=${encodeURIComponent(image)}`

			const shareWindow = window.open(vkShareUrl, '_blank', 'width=600,height=400')

			// Optimistically mark story as uploaded after a delay
			// (we can't know for sure if they actually shared)
			if (shareWindow) {
				const res = await postStory({
					vk_id: client.vk_id || client.vk_user_id,
					branch_id: branch
				})
				if (res) {
					setIsStoryUploaded(true)
					resetGameCooldown()
					const deleteresponse = await unsetGameCooldown({
						vk_user_id: client.vk_id || client.vk_user_id,
						branch: branch
					})
					if (deleteresponse) {
						console.log(deleteresponse)
					}
				}
			}

			return { result: true }
		} catch (error) {
			console.log(error)
		}
	}

	return { post }
}

export default usePostStory