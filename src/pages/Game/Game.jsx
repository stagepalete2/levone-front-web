import { useEffect, useState } from 'react'
import gameBgAnimation from '../../assets/background/light/welcome win1 2 3 A.json'
import Testimonial from '../../components/Game/Testimonial/Testimonial'
import ModalManager from '../../components/Modal/Manager'
// Убедитесь, что путь к компоненту верный
import PageBackground from '../../components/PageBackground/PageBackground'

import Countdown from '../../components/Countdown/Countdown'
import Rocket from '../../components/Game/Board/Rocket'
import { useAuth, useClient, useGameCooldown, useHasShownPostStory, useModal, useParams, usePlay, useView } from '../../zustand'
import styles from './Game.module.scss'

const PAGE_ID = 'game'

const Intro = () => {
	const setStart = usePlay((state) => state.setStart)
	const setView = useView((state) => state.setView)
	const cooldown = useGameCooldown((state) => state.gameCooldown)
	const unsetGameCooldown = useGameCooldown((state) => state.unsetGameCooldown)
	const pushModal = useModal((state) => state.pushModal)

	const client = useClient((state) => state.client)

	const openStoryModal = () => {
		pushModal({
			pageId: PAGE_ID,
			modal: { type: "poststory" },
		});
	}

	const startGame = () => {
		setStart(null)
		setView('game')
	}

	const onComplete = () => {
		unsetGameCooldown()
	}

	return (
		<>
			<div className={styles.text}>
				<h2>ИГРАЙ И ЗАБИРАЙ<br />СКИДКУ</h2>
			</div>

			<div className={styles.content}>
				<div className={styles.rulesCard}>
					<div className={styles.cardTitle}>ПРАВИЛА</div>

					<div className={styles.cardDescription}>
						Ракета ждёт — жми и выигрывай!
					</div>

					<div className={styles.cardIcon}>
						<span>🚀</span>
					</div>
					{cooldown?.is_active ? (
						cooldown?.is_active && !client?.is_story_uploaded ? (
							<button className={styles.playButton} onClick={() => openStoryModal()}>
								Сыграть еще?
							</button>
						) : (
							<button className={styles.playButton}>
								<Countdown
									duration={(cooldown.seconds_remaining ?? 0) * 1000}
									onComplete={() => onComplete()}
									color='black'
								/>
							</button>
						)
					) : (
						<button className={styles.playButton} onClick={startGame}>
							НАЧАТЬ
						</button>
					)}
				</div>

				<Testimonial />
			</div>
		</>
	)
}

const Game = () => {
	const view = useView((state) => state.view)
	const setView = useView((state) => state.setView)
	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)
	const cooldown = useGameCooldown((state) => state.gameCooldown)
	const hasShownPostStory = useHasShownPostStory((state) => state.hasShownPostStory);
	const setHasShownPostStory = useHasShownPostStory((state) => state.setHasShownPostStory)
	const pushModal = useModal((state) => state.pushModal)
	const isAuthenticated = useAuth((state) => state.isAuthenticated)
	const [birthModalShown, setBirthModalShown] = useState(false)

	useEffect(() => {
		if (!isAuthenticated) {
			// Неавторизованный — сразу ракета (демо)
			if (view === 'intro') setView('game')
			return
		}
		// Авторизованный: кулдаун загружен
		if (cooldown === null) return // ждём загрузки
		if (!cooldown.is_active && view === 'intro') {
			// Кулдауна нет — сразу в игру
			setView('game')
		}
		// Кулдаун активен — остаёмся на intro (главная страница с таймером)
	}, [isAuthenticated, cooldown, view, setView])

	useEffect(() => {
		if (hasShownPostStory || !client || !cooldown) return;

		if (client.birth_date && !client.isStoryUploaded && cooldown?.is_active) {

			const timer = setTimeout(() => {
				pushModal({
					pageId: PAGE_ID,
					modal: { type: "poststory" },
				});
				setHasShownPostStory(true);
			}, 3000);

			return () => clearTimeout(timer);
		}
	}, [client, cooldown, hasShownPostStory, pushModal, setHasShownPostStory]);

	// Birth date modal — only for authenticated users who don't have birth_date
	// and only if VK profile also doesn't have bdate (auto-saved during init)
	// Track birthModalShown so "Пропустить" prevents re-appearing
	useEffect(() => {
		if (!isAuthenticated || !client || !branch) return;
		if (birthModalShown) return; // Already shown this session

		if (!client.birth_date) {
			// Show birth date modal with skip button after a short delay
			const timer = setTimeout(() => {
				pushModal({
					pageId: PAGE_ID,
					modal: { type: 'birth' }
				})
				setBirthModalShown(true)
			}, 500)
			return () => clearTimeout(timer)
		}
	}, [client, branch, isAuthenticated, birthModalShown])

	

	return (
		<>
			<div className={styles.wrap}>
				<PageBackground animationData={gameBgAnimation} />
				{view === 'intro' && <Intro />}
				{view === 'game' && <Rocket />}
			</div>
			<ModalManager pageId={PAGE_ID} />
		</>
	)
}

export default Game