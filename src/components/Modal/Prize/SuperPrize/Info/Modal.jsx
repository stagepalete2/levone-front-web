
import useActivateSuperPrize from '../../../../../api/handlers/inventory/activatesuperprize.handler'

import { createPortal } from 'react-dom'
import { useClient, useLogo, useModal, useParams } from '../../../../../zustand'
import styles from './Modal.module.scss'

const Modal = ({ super_prize, prize, onClose }) => {

	const client = useClient((state) => state.client)
	const popModal = useModal((state) => state.popModal)
	const pushModal = useModal((state) => state.pushModal)
	const clearQueue = useModal((state) => state.clearQueue)
	const branch = useParams((state) => state.branch)

	const logotype = useLogo((state) => state.logotype)

	const { activate } = useActivateSuperPrize()

	const handleBack = () => {
		popModal({ pageId: 'inventory' })
		pushModal({
			pageId: 'inventory',
			modal: {
				type: 'superprize',
				props: { super_prize: super_prize }
			}
		})
	}

	const handlePick = async () => {
		try {
			const response = await activate({ vk_user_id: client.vk_user_id, branch: branch, product_id: prize.id, super_prize: super_prize })
			clearQueue({ pageId: 'inventory' })
		} catch (error) {
			console.log(error)
		}
	}

	return createPortal(
		<div className={styles.overlay} onClick={() => handleBack()}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<div className={styles.control}>
						<img src="/icons/close_purple.png" alt="close" className={styles.close} onClick={() => handleBack()} />
					</div>
				</div>

				<div className={styles.body}>
					<p className={styles.text}>Выберите Приз</p>

					<div className={styles.detailCard}>
						<img src={`${prize.image}`} alt="" />
						<p className={styles.title}>
							{prize.name}
						</p>
					</div>
					<div className={styles.buttons}>
						<button className={`${styles.button} ${styles.handle}`} onClick={() => handlePick()}>Забрать</button>
						<button className={`${styles.button} ${styles.back}`} onClick={() => handleBack()}>Назад</button>
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal