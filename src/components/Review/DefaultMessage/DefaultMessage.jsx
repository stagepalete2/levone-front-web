import Lottie from 'lottie-react'
import styles from './DefaultMessage.module.scss'

// Укажите здесь путь к вашей анимации (где персонаж держит звезду)
import starAnimation from '../../../assets/star.json'

const Message = ({setView, setReview}) => {

	const handleBack = () => {
		setReview('')
		setView('form')
	}

	return (
		<div className={styles.wrap}>
            <div className={styles.content}>                
                <div className={styles.textBlock}>
                    <h2 className={styles.title}>СПАСИБО ЗА ВАШ ОТЗЫВ!</h2>
                    <p className={styles.subtitle}>МЕНЕДЖЕР УЖЕ ПОЛУЧИЛ ЕГО</p>
                </div>

                {/* Блок с Lottie анимацией */}
                <div className={styles.image}>
                    <Lottie 
                        animationData={starAnimation} 
                        loop={false} 
                        className={styles.lottieAnim} 
                    />
                </div>

                <button id="backBtn" className={styles.button} onClick={() => handleBack()}>
                    ВЕРНУТЬСЯ
                </button>
            </div>
		</div>
	)
}

export default Message