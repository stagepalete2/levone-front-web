
import { createPortal } from 'react-dom'
import { useLogo, useModal } from '../../../../zustand'
import styles from './Modal.module.scss'

const Modal = ({ super_prize, onClose }) => {

	const popModal = useModal((state) => state.popModal)
	const pushModal = useModal((state) => state.pushModal)

	const logotype = useLogo((state) => state.logotype)

	const handleOpenInfo = (prize) => {
		popModal({ pageId: 'inventory' })
		pushModal({
			pageId: 'inventory',
			modal: {
				type: 'superprizeinfo',
				props: { super_prize: super_prize, prize: prize }
			}
		})
	}


	return createPortal(
		<div className={styles.overlay} onClick={() => onClose()}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<div className={styles.header}>
					<div className={styles.control}>
						<img src="/icons/close_purple.png" alt="close" className={styles.close} onClick={() => onClose()} />
					</div>
				</div>

				<div className={styles.body}>
					<p className={styles.text}>Выберите Приз!</p>

					<div className={styles.prizes}>
						{super_prize?.prizes?.map((item, index) => (
							<div key={item.id} className={styles.prize} onClick={() => handleOpenInfo(item)}>
								<img src={`${item.image}`} alt="" />
								<p className={styles.info}>
									{item.name}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default Modal