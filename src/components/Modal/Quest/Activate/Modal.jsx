import Lottie from 'lottie-react'
import { createPortal } from 'react-dom'
import useActivateQuest from '../../../../api/handlers/quest/activate.handler'
import animation from '../../../../assets/Chel phone.json'
import { useClient, useParams } from '../../../../zustand'

import styles from './Modal.module.scss'

const Modal = ({ quest, onClose }) => {

	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)

	const { activate } = useActivateQuest()

	const handleStartQuest = async () => {
		await activate({
			vk_user_id: client.vk_user_id,
			branch: branch,
			quest_id: quest?.id
		})
		onClose()
	}

	return createPortal(
		<div className={styles.overlay} onClick={() => onClose()}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>

				<button className={styles.closeBtn} onClick={() => onClose()}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>

				<div className={styles.header}>
					<span className={styles.subTitle}>ЗАДАНИЕ</span>
					<h3 className={styles.title}>{quest.name}</h3>
				</div>

				<div className={styles.animationWrapper}>
					<Lottie animationData={animation} loop={false} className={styles.lottieAnim} />
				</div>

				<div className={styles.content}>
					<div className={styles.innerContent}>
						<p>
							{quest.description}
						</p>
						<hr />
						<div className={styles.warning}>
							<img src="/icons/mark.png" alt="" />
							<p>
								У ВАС ЕСТЬ <b className={styles.highlight}>30 МИНУТ</b>, ЧТОБЫ ВЫПОЛНИТЬ ЗАДАНИЕ И ПОКАЗАТЬ РЕЗУЛЬТАТ ОФИЦИАНТУ.
							</p>
						</div>

					</div>
					<button className={styles.startButton} onClick={() => handleStartQuest()}>
						НАЧАТЬ
					</button>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal