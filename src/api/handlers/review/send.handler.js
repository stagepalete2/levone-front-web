
import postSendReview from '../../endpoints/post/sendreview.api'

const useSendReview = () => {

	const send = async ({ vk_user_id, branch, rating, phone, table, review }) => {
		try {
			const response = await postSendReview({
				vk_user_id: vk_user_id, 
				branch: branch, 
				rating: rating, 
				phone: phone, 
				table: table, 
				review: review
			})
		} catch (error) {
			console.log(error)
		}
	}

	return { send }
}

export default useSendReview