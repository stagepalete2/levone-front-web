import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import getBirthdayPrizes from '../../../api/endpoints/get/birthday.prizes.api'
import postBirthdayPrize from '../../../api/endpoints/post/birthday.prize.post.api'
import { useClient, useInventory, useParams } from '../../../zustand'
import styles from './Modal.module.scss'

const Modal = ({ onClose, onPrizeClaimed }) => {
	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)
	const addItem = useInventory((state) => state.addItem)

	const [prizes, setPrizes] = useState([])
	const [loading, setLoading] = useState(true)
	const [claiming, setClaiming] = useState(false)
	const [selectedId, setSelectedId] = useState(null)

	useEffect(() => {
		const fetchPrizes = async () => {
			try {
				const data = await getBirthdayPrizes({
					branch,
					vk_user_id: client?.vk_user_id
				})
				if (Array.isArray(data)) setPrizes(data)
			} catch (e) {
				console.error(e)
			} finally {
				setLoading(false)
			}
		}
		fetchPrizes()
	}, [branch, client])

	const handleSelectPrize = async (prize) => {
		if (claiming) return
		setSelectedId(prize.id)
		setClaiming(true)
		try {
			const response = await postBirthdayPrize({
				vk_user_id: client?.vk_user_id,
				branch,
				product_id: prize.id
			})
			if (response?.id) {
				addItem(response)
				onPrizeClaimed?.()
				onClose?.()
			}
		} catch (e) {
			console.error(e)
			setSelectedId(null)
		} finally {
			setClaiming(false)
		}
	}

	return createPortal(
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<span className={styles.emoji}>🎂</span>
					<p className={styles.title}>С ДНЁМ РОЖДЕНИЯ!</p>
					<p className={styles.subtitle}>Выберите один подарок</p>
				</div>

				<div className={styles.body}>
					{loading ? (
						<div className={styles.loading}>Загрузка подарков...</div>
					) : prizes.length === 0 ? (
						<div className={styles.loading}>Подарков нет</div>
					) : (
						<div className={styles.prizes}>
							{prizes.map((prize) => (
								<div
									key={prize.id}
									className={`${styles.prize} ${selectedId === prize.id ? styles.selected : ''}`}
									onClick={() => handleSelectPrize(prize)}
								>
									<img src={prize.image} alt={prize.name} className={styles.prizeImage} />
									<div className={styles.prizeInfo}>
										{prize.name}
									</div>
									<button
										className={styles.selectBtn}
										disabled={claiming}
									>
										{selectedId === prize.id && claiming ? '...' : 'ВЫБРАТЬ'}
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal
