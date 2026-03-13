import styles from './BirthdayPrize.module.scss'

const BirthdayPrize = ({ item, click, isUsed = false }) => {
	let buttonLabel = 'ИСПОЛЬЗОВАТЬ'
	let isDisabled = false
	let extraClass = ''

	if (item.status === 'active') {
		buttonLabel = 'КУПОН'
	} else if (isUsed || item.status === 'expired' || item.status === 'used') {
		buttonLabel = 'ИСПОЛЬЗОВАН'
		isDisabled = true
		extraClass = styles.cardUsed
	}

	return (
		<div
			className={`${styles.card} ${extraClass}`}
			onClick={() => !isDisabled && click(item)}
		>
			<div className={styles.birthdayBadge}>🎂 ДР</div>

			<div className={styles.imageWrapper}>
				<img
					src={item.product_image_url || '/images/placeholder.png'}
					alt={item.product_name}
					loading='lazy'
				/>
				<button
					className={styles.actionButton}
					disabled={isDisabled}
					onClick={(e) => {
						e.stopPropagation()
						if (!isDisabled) click(item)
					}}
				>
					{buttonLabel}
				</button>
			</div>
		</div>
	)
}

export default BirthdayPrize
