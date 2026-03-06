import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import useBuy from '../../../api/handlers/catalog/buy.handler'
import { useClient, useParams } from '../../../zustand'
import styles from './Modal.module.scss'

const Modal = ({ selected, setSelected }) => {
	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)

	const [shake, setShake] = useState(false)
	const { buy } = useBuy()

	useEffect(() => {
		console.log(selected)
	}, [selected])

	// Сброс анимации тряски
	useEffect(() => {
		if (shake) {
			const timeout = setTimeout(() => setShake(false), 500)
			return () => clearTimeout(timeout)
		}
	}, [shake])

	// Логика покупки
	const buyItem = async () => {
		if (!client || !selected) return

		// Проверка баланса
		if (Number(client.coins_balance) < Number(selected.price)) {
			setShake(true)
			return
		}

		try {
			await buy({
				vk_user_id: client.vk_user_id,
				branch: branch,
				product_id: selected.id
			})
			setSelected(null) // Закрываем окно после покупки
		} catch (error) {
			console.error(error)
		}
	}

	// Если ничего не выбрано, не рендерим ничего
	if (!selected) return null

	// Рендерим через Портал поверх всего приложения
	return createPortal(
		<div className={styles.overlay} onClick={() => setSelected(null)}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				{/* Кнопка закрытия */}
				<button className={styles.closeBtn} onClick={() => setSelected(null)}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>

				<div className={styles.header}>
					<h3 className={styles.title}>{selected.name}</h3>
				</div>

				<div className={styles.outerWrapper}>
					<div className={styles.imageWrapper}>
						<img
							src={`${selected.image}`}
							alt={selected.name}
							className={styles.image}
						/>
						<div className={styles.description}>
							{selected.description}
						</div>
					</div>
				</div>

				<div className={styles.content}>

					<div className={styles.warningBox}>
						<div className={styles.icon}>!</div>
						<p className={styles.warningText}>
							Вы можете выбрать <span>ОДНО</span> блюдо в день.
							Остальные будут доступны через 24 часа.
						</p>
					</div>

					<button
						className={`${styles.buyBtn} ${shake ? styles.shake : ''}`}
						onClick={buyItem}
					>
						{shake ? 'Недостаточно Монет!' : `КУПИТЬ ЗА ${selected.price} ★`}
					</button>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal