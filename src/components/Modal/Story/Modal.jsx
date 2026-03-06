import { useState } from 'react'
import { createPortal } from 'react-dom'
import usePostStory from '../../../api/handlers/game/poststory.handler'
import { useBranch } from '../../../zustand'
import styles from './Modal.module.scss'

const Modal = ({ onClose }) => {
    const branch = useBranch((state) => state.branch)
    // Сохраняем логику выбора картинки для сторис
    const [imageUrl, setImageUrl] = useState(
        branch?.story 
            ? branch.story 
            : `${import.meta.env.VITE_BACKEND_DOMAIN}/static/images/fallback_story.png`
    )
    
    // Логотип для отображения (если нужен, можно вернуть, но в новом дизайне он часто лишний)
    // const logotype = useLogo((state) => state.logotype)

    const { post } = usePostStory()

    const handleUnlock = async () => {
        try {
            const data = await post({ image: imageUrl })
            if (data.result) {
                onClose()
            }
        } catch (error) {
            console.log(error)
        }
    }

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                
                <button className={styles.closeIconBtn} onClick={onClose}>
                    <svg width="12" height="12" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 1L1 13M1 1L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <h2 className={styles.title}>Поделись в ВК!</h2>
                
                <p className={styles.subtitle}>
                    Опубликуй сторис, чтобы испытать<br/>удачу прямо сейчас!
                </p>

                <div className={styles.illustration}>
                    <div className={styles.iconCircle}>
                        <img src="/icons/story.png" alt="Story Icon" />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button 
                        className={`${styles.button} ${styles.unlock}`} 
                        onClick={handleUnlock}
                    >
                        Опубликовать
                    </button>
                    
                    <button 
                        className={`${styles.button} ${styles.close}`} 
                        onClick={onClose}
                    >
                        В следующий раз
                    </button>
                </div>
            </div>
        </div>,
		document.body
	)
}

export default Modal