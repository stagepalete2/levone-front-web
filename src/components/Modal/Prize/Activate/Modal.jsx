import { createPortal } from 'react-dom'
import useActivate from '../../../../api/handlers/catalog/activate.handler'
import { useNavigation } from '../../../../hooks/useHandleNavigation'
import { useClient, useParams } from '../../../../zustand'
import styles from './Modal.module.scss'

const Modal = ({ prize, onClose }) => {
	const { handleNavigation } = useNavigation()
	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)

	const { activate } = useActivate()

	const handleActivate = async () => {
		await activate({
			vk_user_id: client.vk_user_id,
			branch: branch,
			inventory_id: prize.id
		})
		onClose()
		handleNavigation('/coupon')
	}

	return createPortal(
		<div className={styles.overlay} onClick={() => onClose()}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				{/* Кнопка закрытия */}
				<button className={styles.closeBtn} onClick={() => onClose()}>
					×
				</button>

				<div className={styles.header}>
					<p className={styles.title}>{prize.product_name}</p>
				</div>

				<div className={styles.cardWrapper}>
					<div className={styles.imageArea}>
						<img
							src={`${prize.product_image}`}
							className={styles.productImage}
							alt={prize.product_name}
						/>
					</div>
					<div className={styles.warningRow}>
						<div className={styles.iconWrapper}>
							<img src="/icons/warning.png" alt="!" className={styles.icon} />
						</div>

						<div className={styles.textWrapper}>
							<p className={styles.warningText}>
								ПОДАРОК БУДЕТ ДЕЙСТВОВАТЬ <br />
								ТОЛЬКО 40 МИНУТ.
							</p>
							<p className={styles.subText}>
								ЖМИТЕ "ИСПОЛЬЗОВАТЬ" <br />
								ЕСЛИ ВЫ УЖЕ НА МЕСТЕ ИЛИ <br />
								НАПРАВЛЯЕТЕСЬ ТУДА.
							</p>
						</div>
					</div>
					<button className={styles.button} onClick={() => handleActivate()}>
						ИСПОЛЬЗОВАТЬ
					</button>


				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal