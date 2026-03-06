import { useAuth, useClient, useGameCooldown, useModal, useSuperPrize } from '../../../zustand'
import getGameCooldown from '../../endpoints/get/game.cooldown.api'
import postPlayGame from '../../endpoints/post/playgame.api'

const usePlayGame = () => {
	const addSuperPrize = useSuperPrize((state) => state.addSuperPrize)
	const setCooldown = useGameCooldown((state) => state.setGameCooldown)
	const addCoins = useClient((state) => state.addCoins)
	const client = useClient((state) => state.client)
	const pushModal = useModal((state) => state.pushModal)

	// ЭТАП 1: Только получение данных (для запуска ракеты)
	const fetchGameResult = async ({ vk_user_id, branch, code = '', employee_id }) => {
		try {
			const response = await postPlayGame({
				vk_user_id: vk_user_id,
				branch: branch,
				code: code,
				employee_id: employee_id
			})
			return response;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	// ЭТАП 2: Показ результата (вызывается после анимации)
	const processGameResult = async (response, { vk_user_id, branch }) => {
		if (!response) return;

		const isAuthenticated = useAuth.getState().isAuthenticated

		// Demo play for unauthenticated users — show prize with auth trigger
		if (response._isDemo) {
			pushModal({
				pageId: 'game',
				modal: {
					type: 'prize',
					props: { prize: response, isDemo: true }
				}
			});
			return;
		}

		// Логика модалок и обновления стейта
		if (response.type === 'prize') {
			const modalConfig = {
				type: 'prize',
				props: { prize: response }
			};

			const taskWrapper = {
				type: 'task',
				props: {},
				nextModal: modalConfig
			};

			const finalModal = (!client.is_joined_community || !client.is_allowed_message)
				? taskWrapper
				: modalConfig;

			pushModal({ pageId: 'game', modal: finalModal });
			addSuperPrize(response.reward);
		}

		if (response.type === 'coin') {
			const modalConfig = {
				type: 'prize',
				props: { prize: response }
			};

			const taskWrapper = {
				type: 'task',
				props: {},
				nextModal: modalConfig
			};

			const finalModal = (!client.is_joined_community || !client.is_allowed_message)
				? taskWrapper
				: modalConfig;

			pushModal({ pageId: 'game', modal: finalModal });
			addCoins(response.reward);
		}

		if (response.type === 'code') {
			const modalConfig = {
				type: 'code',
				props: { prize: response } // Передаем response, даже если там нет суммы, модалка сама решит
			};

			// Для кода (type: code) сервер может не прислать reward, поэтому props пустой или с response
			const codeModalSimple = {
				type: 'code',
				props: {}
			};

			const taskWrapper = {
				type: 'task',
				props: {},
				nextModal: modalConfig // Или codeModalSimple, зависит от вашей реализации модалки Code
			};

			const finalModal = (!client.is_joined_community || !client.is_allowed_message)
				? taskWrapper
				: codeModalSimple;

			pushModal({ pageId: 'game', modal: finalModal });
		}

		// Обновляем кулдаун в конце
		try {
			const cooldownResponse = await getGameCooldown({
				vk_user_id: vk_user_id,
				branch: branch
			})
			if (cooldownResponse) {
				setCooldown(cooldownResponse)
			}
		} catch (e) {
			console.error("Cooldown error", e);
		}
	}

	return { fetchGameResult, processGameResult }
}

export default usePlayGame