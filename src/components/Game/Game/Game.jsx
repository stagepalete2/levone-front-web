
import { useGameCooldown, useView } from '../../../zustand'
import Countdown from '../../Countdown/Countdown'

import styles from './Game.module.scss'

const Game = () => {

	const setView = useView((state) => state.setView)
	const cooldown = useGameCooldown((state) => state.gameCooldown)
	const unsetCooldown = useGameCooldown((state) => state.unsetGameCooldown)

	const onComplete = () => {
		unsetCooldown()
	}

	const startGame = () => {
		setView('game')
	}

	return (
		<div className={styles.card}>
			<div className={styles.card_header}>
				📜 Правила
			</div>

			<div className={styles.card_body}>
				<ul className={styles.list}>
					<li className={styles.item}>
						На поле <strong>4×4</strong> спрятаны 8 пар блюд.
					</li>
					<li className={styles.item}>
						Открывай по две карточки и находи совпадения.
					</li>
					<li className={styles.item}>
						Таймер: <strong>3 минуты</strong>
					</li>
				</ul>
				<div className={styles.start}>
					{/* <button className={styles.button}>
						🚀 Начать игру
					</button> */}
					{cooldown?.is_active === true
						? (
							<button className={styles.button}>
								<img src="/icons/clock.png" alt="Clock" style={{ width: 25, height: 25 }} />
								<Countdown duration={(cooldown.seconds_remaining ?? 0) * 1000} color='text-dark' onComplete={() => onComplete()} />
							</button>
						) : (
							<button className={styles.button} onClick={() => startGame()}>
								🚀 Начать игру
							</button>
						)
					}
				</div>
			</div>
		</div>
	)
}

export default Game