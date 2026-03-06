import { copyToClipboard } from '../../../services/vkApi'
import Lottie from 'lottie-react'; // Импорт компонента Lottie
import { useEffect, useState } from 'react'

import { useBranch } from '../../../zustand'
// Укажите правильный путь к вашему JSON файлу
import successAnimation from '../../../assets/cool.json'

import styles from './SuccessMessage.module.scss'

const Message = ({review, setReview, setView}) => {
    const branch = useBranch((state) => state.branch)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const copyReview = async () => {
        if (!review) {
            setError('Сначала напишите отзыв')
            return
        }
        try {
            const res = await copyToClipboard(review)
            if (res) setSuccess('Отзыв скопирован')
        } catch (err) { console.log(err) }
    };

    const handleBack = () => {
        setReview('')
        setView('form')
    }

    useEffect(() => {
        if (error || success) {
            const timeout = setTimeout(() => { setError(''); setSuccess(''); }, 1500)
            return () => clearTimeout(timeout)
        }
    }, [error, success])

    return (
        <div className={styles.wrap}>
            <div className={styles.content}>
                <div className={styles.textBlock}>
                    <h2 className={styles.title}>СПАСИБО!</h2>
                    <h2 className={styles.title}>ПОМОГИТЕ НАМ СТАТЬ ЛУЧШЕ</h2>
                    <p className={styles.subtitle}>ОПУБЛИКУЙТЕ СВОЙ ОТЗЫВ НА ЯНДЕКС.КАРТАХ ИЛИ 2ГИС</p>
                </div>

                {/* Блок с Lottie анимацией */}
                <div className={styles.animationWrapper}>
                    <Lottie 
                        animationData={successAnimation} 
                        loop={false} 
                        className={styles.lottieAnim} 
						
                    />
                </div>

                <button className={styles.copyBtn} onClick={copyReview}>
                    {error || success || "СКОПИРОВАТЬ ОТЗЫВ"}
                </button>

                <div className={styles.links}>
                    <a className={styles.link} href={branch.gis_map} target="_blank" rel="noreferrer">
                        <img src="/icons/2gis-logo.jpg" alt="2GIS" />
                    </a>
                    <a className={styles.link} href={branch.yandex_map} target="_blank" rel="noreferrer">
                        <img src="/icons/yandex-logo.png" alt="Yandex" />
                    </a>
                </div>

                <button className={styles.backBtn} onClick={handleBack}>
                    ВЕРНУТЬСЯ
                </button>
            </div>
        </div>
    )
}

export default Message