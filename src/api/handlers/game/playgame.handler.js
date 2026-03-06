import { useClient, useGameCooldown, useModal, useSuperPrize } from '../../../zustand'
import getGameCooldown from '../../endpoints/get/game.cooldown.api'
import postPlayGame from '../../endpoints/post/playgame.api'


const usePlayGame = () => {

	const addSuperPrize = useSuperPrize((state) => state.addSuperPrize)
	const setCooldown = useGameCooldown((state) => state.setGameCooldown)
	const addCoins = useClient((state) => state.addCoins)
	const client = useClient((state) => state.client)

	const pushModal = useModal((state) => state.pushModal)

	const play = async ({ vk_user_id, branch, code = '', employee_id }) => {
		try {
			const response = await postPlayGame({
				vk_user_id: vk_user_id,
				branch: branch,
				code: code,
				employee_id: employee_id
			})


			if (response.type === 'prize') {
				if (!client.is_joined_community || !client.is_allowed_message) {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'task',
							props: {},
							nextModal: {
								type: 'prize',
								props: {
									prize: response
								}
							}
						}
					})
				} else {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'prize',
							props: {
								prize: response
							}
						}
					})
				}

				addSuperPrize(response.reward)

				const cooldownResponse = await getGameCooldown({
					vk_user_id: vk_user_id,
					branch: branch
				})
				if (cooldownResponse) {
					setCooldown(cooldownResponse)
				}
			}

			if (response.type === 'coin') {
				if (!client.is_joined_community || !client.is_allowed_message) {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'task',
							props: {},
							nextModal: {
								type: 'prize',
								props: {
									prize: response
								}
							}
						}
					})
				} else {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'prize',
							props: {
								prize: response
							}
						}
					})
				}
				addCoins(response.reward)

				const cooldownResponse = await getGameCooldown({
					vk_user_id: vk_user_id,
					branch: branch
				})
				if (cooldownResponse) {
					setCooldown(cooldownResponse)
				}
			}

			if (response.type === 'code') {
				if (!client.is_joined_community || !client.is_allowed_message) {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'task',
							props: {},
							nextModal: {
								type: 'code',
								props: {
									prize: response
								}
							}
						}
					})
				} else {
					pushModal({
						pageId: 'game',
						modal: {
							type: 'code',
							props: {}
						}
					})
				}

				const cooldownResponse = await getGameCooldown({
					vk_user_id: vk_user_id,
					branch: branch
				})
				if (cooldownResponse) {
					setCooldown(cooldownResponse)
				}
			}

			return response
		} catch (error) {

		}
	}

	return { play }

}

export default usePlayGame