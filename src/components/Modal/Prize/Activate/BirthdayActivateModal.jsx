import { useState } from 'react'
import { createPortal } from 'react-dom'
import useActivate from '../../../../api/handlers/catalog/activate.handler'
import { useNavigation } from '../../../../hooks/useHandleNavigation'
import { useClient, useParams } from '../../../../zustand'
import styles from './BirthdayActivateModal.module.scss'

const BirthdayActivateModal = ({ prize, onClose }) => {
	const { handleNavigation } = useNavigation()
	const client = useClient((state) => state.client)
	const branch = useParams((state) => state.branch)

	const { activate } = useActivate()

	const [code, setCode] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [isError, setIsError] = useState(false)
	const [shake, setShake] = useState(false)

	const triggerError = () => {
		setShake(true)
		setIsError(true)
		setTimeout(() => setShake(false), 500)
		setTimeout(() => setIsError(false), 2000)
	}

	const handleInputChange = (e) => {
		const val = e.target.value.replace(/\D/g, '').slice(0, 5)
		setCode(val)
	}

	const handleActivate = async () => {
		if (code.length < 5) {
			triggerError()
			return
		}

		try {
			setIsLoading(true)
			const response = await activate({
				vk_user_id: client.vk_id || client.vk_user_id,
				branch: branch,
				inventory_id: prize.id,
				code: code
			})

			if (response && response.id) {
				onClose()
				handleNavigation('/coupon')
			} else {
				triggerError()
			}
		} catch (e) {
			console.error(e)
			triggerError()
		} finally {
			setIsLoading(false)
		}
	}

	return createPortal(
		<div className={styles.overlay} onClick={() => onClose()}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<button className={styles.closeBtn} onClick={() => onClose()}>
					×
				</button>

				<div className={styles.birthdayHeader}>
					<span className={styles.emoji}>🎂</span>
					<p className={styles.title}>{prize.product_name}</p>
				</div>

				<div className={styles.cardWrapper}>
					<div className={styles.imageArea}>
						<img
							src={prize.product_image_url || "/images/placeholder.png"}
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
								ЖМИТЕ "АКТИВИРОВАТЬ" <br />
								ЕСЛИ ВЫ УЖЕ НА МЕСТЕ ИЛИ <br />
								НАПРАВЛЯЕТЕСЬ ТУДА.
							</p>
						</div>
					</div>


					<div className={styles.codeSection}>
						<p className={styles.codeLabel}>ПОДАРОК КО ДНЮ РОЖДЕНИЯ</p>
						<p className={styles.codeSubLabel}>ВВЕДИТЕ КОД ДНЯ ДЛЯ АКТИВАЦИИ</p>

						<div className={`${styles.inputContainer} ${shake ? styles.shake : ''} ${isError ? styles.inputError : ''}`}>
							<input
								type="tel"
								className={styles.hiddenInput}
								value={code}
								onChange={handleInputChange}
								autoFocus
							/>
							<div className={styles.visualLayer}>
								<span className={styles.inputLabel}>
									{isError ? 'НЕВЕРНЫЙ КОД' : 'ВВЕДИТЕ КОД'}
								</span>
								<div className={styles.pinGrid}>
									{[...Array(5)].map((_, index) => (
										<div key={index} className={styles.pinCell}>
											{code[index] || ''}
										</div>
									))}
								</div>
							</div>
						</div>

						<button
							className={styles.button}
							onClick={handleActivate}
							disabled={isLoading}
						>
							{isLoading ? '...' : 'АКТИВИРОВАТЬ ПОДАРОК 🎁'}
						</button>
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}

export default BirthdayActivateModal
