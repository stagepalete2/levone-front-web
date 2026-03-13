import { useClient, useGameCooldown, useModal, useSuperPrize } from '../../../zustand'
import getGameCooldown from '../../endpoints/get/game.cooldown.api'
import postGameStart from '../../endpoints/post/gamestart.api'
import postGameClaim from '../../endpoints/post/gameclaim.api'


const usePlayGame = () => {

	const addSuperPrize = useSuperPrize((state) => state.addSuperPrize)
	const setCooldown = useGameCooldown((state) => state.setGameCooldown)
	const addCoins = useClient((state) => state.addCoins)

	const pushModal = useModal((state) => state.pushModal)

	const play = async ({ vk_user_id, branch, code = '', employee_id }) => {
		try {
			const client = useClient.getState().client

			// Phase 1: start game session
			const startResponse = await postGameStart({
				vk_user_id: vk_user_id,
				branch: branch,
				code: code
			})

			if (!startResponse) return null

			// Backend needs daily code
			if (startResponse.needs_code) {
				pushModal({
					pageId: 'game',
					modal: {
						type: 'code',
						props: {}
					}
				})
				return startResponse
			}

			// Phase 2: claim reward
			const response = await postGameClaim({
				session_token: startResponse.session_token,
				employee_id: employee_id || undefined
			})

			if (!response) return null

			if (response.type === 'super_prize') {
				if (!client?.is_joined_community || !client?.is_allowed_message) {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'task',
							props: {},
							nextModal: {
								type: 'prize',
								props: { prize: response }
							}
						}
					})
				} else {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'prize',
							props: { prize: response }
						}
					})
				}

				addSuperPrize(response.reward)
			}

			if (response.type === 'coin') {
				if (!client?.is_joined_community || !client?.is_allowed_message) {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'task',
							props: {},
							nextModal: {
								type: 'prize',
								props: { prize: response }
							}
						}
					})
				} else {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'prize',
							props: { prize: response }
						}
					})
				}
				addCoins(response.reward)
			}

			const cooldownResponse = await getGameCooldown({
				vk_user_id: vk_user_id,
				branch: branch
			})
			if (cooldownResponse) {
				setCooldown(cooldownResponse)
			}

			return response
		} catch (error) {
			console.error('[PlayGame] error:', error)
		}
	}

	return { play }

}

export default usePlayGame
