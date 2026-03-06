import { useNavigation } from '../../../hooks/useHandleNavigation'
import styles from './Testimonial.module.scss'

const Testimonial = () => {
	const {handleNavigation} = useNavigation()

	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<img src='/icons/icq.png' className={styles.icon} />
				<span className={styles.title}>ОТЗЫВЫ</span>
			</div>

			<div className={styles.cardBody}>
				<div className={styles.textBlock}>
					АДМИНИСТРАТОР<br/>
					СРАЗУ ЖЕ ПОЛУЧИТ<br/>
					ВАШ ОТЗЫВ
				</div>
				
				<button className={styles.reviewButton} onClick={() => {handleNavigation('/review')}}>
					ОСТАВИТЬ ОТЗЫВ
				</button>
			</div>
		</div>
	)
}

export default Testimonial