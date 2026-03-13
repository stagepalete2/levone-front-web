import { useClient, useGameCooldown, useModal, useSuperPrize } from '../../../zustand'
import getGameCooldown from '../../endpoints/get/game.cooldown.api'
import postGameClaim from '../../endpoints/post/gameclaim.api'
import postGameStart from '../../endpoints/post/gamestart.api'

const usePlayGame = () => {
	const addSuperPrize = useSuperPrize((state) => state.addSuperPrize)
	const setCooldown = useGameCooldown((state) => state.setGameCooldown)
	const addCoins = useClient((state) => state.addCoins)
	const pushModal = useModal((state) => state.pushModal)

	// Phase 1: start game session → { session_token, score } | { needs_code: true } | null
	const fetchGameResult = async ({ vk_user_id, branch, code = '' }) => {
		try {
			const response = await postGameStart({ vk_user_id, branch, code })
			return response
		} catch (error) {
			console.error('[fetchGameResult]', error)
			return null
		}
	}

	// Phase 2: claim reward after animation, then show modal
	const processGameResult = async (startResponse, { vk_user_id, branch, employee_id }) => {
		if (!startResponse) return

		// Demo play for unauthenticated users
		if (startResponse._isDemo) {
			pushModal({
				pageId: 'game',
				modal: {
					type: 'prize',
					props: { prize: startResponse, isDemo: true }
				}
			})
			return
		}

		// Claim the actual reward from backend
		const claimResponse = await postGameClaim({
			session_token: startResponse.session_token,
			employee_id
		})

		if (!claimResponse) return

		const currentClient = useClient.getState().client
		const needsTask = !currentClient?.is_joined_community || !currentClient?.is_allowed_message

		if (claimResponse.type === 'super_prize') {
			const modalConfig = {
				type: 'prize',
				props: { prize: { type: 'prize', reward: claimResponse.reward } }
			}
			const finalModal = needsTask ? { type: 'task', props: {}, nextModal: modalConfig } : modalConfig
			pushModal({ pageId: 'game', modal: finalModal })
			addSuperPrize(claimResponse.reward)
		}

		if (claimResponse.type === 'coin') {
			const modalConfig = {
				type: 'prize',
				props: { prize: claimResponse }
			}
			const finalModal = needsTask ? { type: 'task', props: {}, nextModal: modalConfig } : modalConfig
			pushModal({ pageId: 'game', modal: finalModal })
			addCoins(Number(claimResponse.reward))
		}

		// Refresh cooldown
		try {
			const cooldownResponse = await getGameCooldown({ vk_user_id, branch })
			if (cooldownResponse) setCooldown(cooldownResponse)
		} catch (e) {
			console.error('[Cooldown refresh]', e)
		}
	}

	return { fetchGameResult, processGameResult }
}

export default usePlayGame
