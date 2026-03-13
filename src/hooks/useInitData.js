import { useCallback, useEffect, useState } from 'react'

import { useActiveQuest, useAuth, useBirthday, useBranch, useCatalog, useCatalogCooldown, useCompany, useEmployee, useGameCooldown, useGroup, useInventory, useInventoryCooldown, useLogo, useParams, usePromotions, useQuest, useQuestCooldown, useSuperPrize } from '../zustand'

import getActiveQuest from '../api/endpoints/get/activequest.api'
import getBirthdayStatus from '../api/endpoints/get/birthday.status.api'
import getBranch from '../api/endpoints/get/branch.api'
import getCatalog from '../api/endpoints/get/catalog.api'
import getCatalogCooldown from '../api/endpoints/get/catalog.cooldown.api'
import getCompany from '../api/endpoints/get/company.api'
import getEmployees from '../api/endpoints/get/employees.api'
import getGameCooldown from '../api/endpoints/get/game.cooldown.api'
import getInventory from '../api/endpoints/get/inventory.api'
import getInventoryCooldown from '../api/endpoints/get/inventory.cooldown.api'
import getPromotions from '../api/endpoints/get/promotions.api'
import getQuest from '../api/endpoints/get/quest.api'
import getQuestCooldown from '../api/endpoints/get/quest.cooldown.api'
import getSuperPrize from '../api/endpoints/get/superprize.api'

import patchClient from '../api/endpoints/patch/updateclient.api'
import { useCheckIsJoinedCommunity } from '../api/handlers/client/useCheckIsJoinedCommunity.handler'
import useClientHandler from '../api/handlers/client/useClient.handler'
import useInitParams from './useInitParams'
import { parseVkBdate } from '../services/vkAuth'

const useInitData = () => {
	const [isLoading, setIsLoading] = useState(false)
	const [isParamsLoaded, setIsParamsLoaded] = useState(false)
	const [isInviteLink, setIsInviteLink] = useState(false)
	const [isEmployee, setIsEmployee] = useState(false)
	const [initError, setInitError] = useState(null)
	const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false) // true после первого вызова loadData

	// Params & Handlers
	const { company, branch, table, is_referral, delivery, from, birthday } = useInitParams()
	const { getClient } = useClientHandler()
	const { checkIsJoinedCommunity } = useCheckIsJoinedCommunity()

	// Zustand Setters
	const setCompany = useCompany((state) => state.setCompany)
	const setBranch = useBranch((state) => state.setBranch)
	const setCatalog = useCatalog((state) => state.setCatalog)
	const setInventory = useInventory((state) => state.setInventory)
	const setSuperPrize = useSuperPrize((state) => state.setSuperPrize)
	const setQuests = useQuest((state) => state.setQuests)
	const setActiveQuest = useActiveQuest((state) => state.setActiveQuest)
	const setGroup = useGroup((state) => state.setGroup)
	const setLogo = useLogo((state) => state.setLogo)
	const setEmployees = useEmployee((state) => state.setEmployees)
	const setPromotions = usePromotions((state) => state.setPromotions)
	const setBirthdayStatus = useBirthday((state) => state.setBirthdayStatus)
	const setNavLocked = useBirthday((state) => state.setNavLocked)

	const setCatalogCooldown = useCatalogCooldown((state) => state.setCatalogCooldown)
	const setInventoryCooldown = useInventoryCooldown((state) => state.setInventoryCooldown)
	const setQuestCooldown = useQuestCooldown((state) => state.setQuestCooldown)
	const setGameCooldown = useGameCooldown((state) => state.setGameCooldown)

	const setTableId = useParams((state) => state.setTable)
	const setCompanyId = useParams((state) => state.setCompany)
	const setBranchId = useParams((state) => state.setBranch)
	const setDelivery = useParams((state) => state.setDelivery)

	useEffect(() => {
		// Если флагов доставки и рефералки больше нет, но экран блокировки висит — убираем его
		if (!delivery && !is_referral && isInviteLink) {
			setIsInviteLink(false)
		}
	}, [delivery, is_referral, isInviteLink])

	const loadData = useCallback(async () => {
		setHasAttemptedLoad(true)

		if (!company || !branch) {
			console.warn('[InitData] Missing params! company:', company, 'branch:', branch,
				'URL hash:', window.location.hash,
				'localStorage:', localStorage.getItem('levone_init_params'))
			setInitError('Не удалось определить заведение. Попробуйте перейти по ссылке заново.')
			setIsLoading(false)
			return
		}

		console.log('[InitData] Loading data for company:', company, 'branch:', branch)

		setIsLoading(true)
		setInitError(null)

		try {
			// 1. Получаем Компанию (возвращает только {domain, name})
			const companyResponse = await getCompany({ company: company })
			if (!companyResponse?.domain) {
				throw new Error("Company not found")
			}

			setCompany(companyResponse.domain)
			setCompanyId(company)
			setBranchId(branch)
			setTableId(table)
			setDelivery(Boolean(delivery))

			// 2. Получаем Клиента
			const client = await getClient({ branch })
			if (!client?.id) {
				throw new Error("Client creation failed")
			}

			// 2.5. Авто-сохранение даты рождения из профиля ВК
			if (!client.birth_date) {
				const vkUser = useAuth.getState().vkUser
				if (vkUser?.bdate) {
					const parsedBdate = parseVkBdate(vkUser.bdate)
					if (parsedBdate) {
						try {
							await patchClient({
								vk_id: client.vk_id || client.vk_user_id,
								branch_id: branch,
								birth_date: parsedBdate
							})
							// Update client in zustand with the new birth_date
							client.birth_date = parsedBdate
						} catch (err) {
							console.warn('Failed to auto-save VK bdate:', err)
						}
					}
				}
			}

			// 3. Получаем Филиал
			const branchResponse = await getBranch({ branch: branch })
			if (!branchResponse?.id) {
				throw new Error("Branch not found")
			}

			setBranch({
				id: branchResponse.id,
				name: branchResponse.name,
				yandex_map: branchResponse.yandex_map,
				gis_map: branchResponse.gis_map,
				story: branchResponse.story_image_url,
				logotype_image: branchResponse.logotype_url,
				coin_image: branchResponse.coin_icon_url
			})

			// Логотип и монета — из branch response
			setLogo({
				logotype: branchResponse.logotype_url,
				coin: branchResponse.coin_icon_url,
			})

			// Группа ВК — из branch response
			setGroup({
				group_name: branchResponse.vk_group_name,
				group_id: branchResponse.vk_group_id
			})

			// 4. Логика Рефералов и Доставки (ВАЖНО: не делаем return, чтобы данные грузились дальше)
			if (is_referral && from) {
				await patchClient({
					vk_id: client.vk_id || client.vk_user_id,
					branch_id: branch,
					is_reffered: Boolean(is_referral),
					invited_by: from
				})
				setIsInviteLink(true)
			}

			if (delivery) {
				setIsInviteLink(true)
			}

			// 5. Проверка сообщества
			await checkIsJoinedCommunity({
				vk_id: client.vk_id || client.vk_user_id,
				branch: branch,
				group_id: branchResponse.vk_group_id
			})

			// 6. Загрузка основных данных (параллельно)
			const [
				catalogResponse,
				inventoryResponse,
				superPrizeResponse,
				questResponse,
				activeQuestResponse,
				catalogCooldownResponse,
				inventoryCooldownResponse,
				questCooldownResponse,
				gameCooldownResponse,
				employeesResponse,
				promotionsResponse,
				birthdayStatusResponse
			] = await Promise.all([
				getCatalog({ branch }),
				getInventory({ branch, vk_user_id: client.vk_id || client.vk_user_id }),
				getSuperPrize({ branch, vk_user_id: client.vk_id || client.vk_user_id }),
				getQuest({ branch, vk_user_id: client.vk_id || client.vk_user_id }),
				getActiveQuest({ branch, vk_user_id: client.vk_id || client.vk_user_id }),
				getCatalogCooldown({ branch, vk_user_id: client.vk_id || client.vk_user_id }),
				getInventoryCooldown({ branch, vk_user_id: client.vk_id || client.vk_user_id }),
				getQuestCooldown({ branch, vk_user_id: client.vk_id || client.vk_user_id }),
				getGameCooldown({ branch, vk_user_id: client.vk_id || client.vk_user_id }),
				getEmployees({ branch }),
				getPromotions({ branch }),
				getBirthdayStatus({
					branch,
					vk_user_id: client.vk_id || client.vk_user_id
				})
			])

			// 7. Сохранение данных в Zustand
			if (catalogResponse) setCatalog(catalogResponse);
			if (inventoryResponse) setInventory(inventoryResponse);
			if (superPrizeResponse) setSuperPrize(superPrizeResponse);
			if (questResponse) setQuests(questResponse);
			if (activeQuestResponse) setActiveQuest(activeQuestResponse);
			if (catalogCooldownResponse) setCatalogCooldown(catalogCooldownResponse);
			if (inventoryCooldownResponse) setInventoryCooldown(inventoryCooldownResponse);
			if (questCooldownResponse) setQuestCooldown(questCooldownResponse);
			if (gameCooldownResponse) setGameCooldown(gameCooldownResponse);
			if (employeesResponse) setEmployees(employeesResponse)
			if (promotionsResponse) setPromotions(promotionsResponse)
			if (birthdayStatusResponse) {
				setBirthdayStatus(birthdayStatusResponse)
			}

			// 8. Проверка сотрудника
			if (employeesResponse) {
				const isUserEmployee = employeesResponse.some(
					(employee) => (employee.vk_id || employee.vk_user_id) === (client.vk_id || client.vk_user_id)
				);
				setIsEmployee(isUserEmployee);
			}

			// Успех!
			setIsParamsLoaded(true)

			if (birthday) {
				setNavLocked(true)
			}

		} catch (error) {
			console.error("Critical Init Error:", error?.message || error,
				'| company:', company, 'branch:', branch)
			setIsParamsLoaded(false)
			setInitError(`Ошибка загрузки: ${error?.message || 'Проверьте соединение'}`)
		} finally {
			setIsLoading(false)
		}
	}, [
		company, branch, table, is_referral, from, delivery,
		setCompany, setGroup, setBranch, setTableId, setCompanyId, setBranchId,
		setCatalog, setInventory, setSuperPrize, setQuests, setActiveQuest,
		setCatalogCooldown, setInventoryCooldown, setQuestCooldown, setGameCooldown,
		setEmployees, setPromotions, setLogo, setDelivery, setBirthdayStatus, setNavLocked, birthday,
		getClient, checkIsJoinedCommunity
	])

	return { isLoading, isParamsLoaded, isInviteLink, isEmployee, initError, hasAttemptedLoad, loadData }
}

export default useInitData
