import Lottie from 'lottie-react'; // Импорт Lottie
import { useEffect, useMemo } from 'react'
import ModalManager from '../../components/Modal/Manager'
import { getTimeLeft } from '../../helpers/time'
import { useNavigation } from '../../hooks/useHandleNavigation'
import { useInventory } from '../../zustand'

import Countdown from '../../components/Countdown/Countdown'

// Убедитесь, что путь правильный. Если вы положили файл в другую папку, поправьте путь.
import confettiAnimation from '../../assets/Confetti.json'

const PAGE_ID = 'coupon'

import 'bootstrap/dist/css/bootstrap.min.css'
import styles from './Coupon.module.scss'

const Item = ({ onClose }) => {
    const items = useInventory((state) => state.items)
    const deactivateItem = useInventory((state) => state.deactivateItem)

    const activeItem = useMemo(() => {
        return items.find((item) => item.status === 'ACTIVE')
    }, [items])

    useEffect(() => {
        console.log('active', activeItem)
    }, [activeItem])

    const CloseIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )

    return (
        <div className={styles.card}>
            <div className={styles.closeBtn} onClick={onClose}>
                <CloseIcon />
            </div>

            <div className={styles.headerTitle}>ВЫИГРЫШ</div>

            <div className={styles.imageContainer}>
                {activeItem?.product_image ? (
                    <img
                        src={`${activeItem.product_image}`}
                        className={styles.productImg}
                        alt="Prize"
                    />
                ) : (
                    <div className={styles.placeholderImg}>Нет фото</div>
                )}
                <div className={styles.whiteBoxx}>
                    <p className={styles.productName}>{activeItem?.product_name || 'Название товара'}</p>
                </div>
            </div>


            <div className={styles.whiteBox}>
                <p className={styles.timerLabel}>КУПОН АКТИВЕН</p>
                <Countdown
                    duration={getTimeLeft(activeItem?.activated_at, activeItem?.duration, import.meta.env.VITE_TZ)}
                    color='#2C2C2C'
                    onComplete={() => onComplete()}
                />
            </div>
        </div>
    )
}

const Coupon = () => {
    const { handleNavigation } = useNavigation()

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.lottieContainer}>
                <Lottie animationData={confettiAnimation} loop={true} />
            </div>

            <h3 className={styles.pageTitle}>
                ПОКАЖИ ЭТОТ КУПОН<br />
                СОТРУДНИКУ ЗАВЕДЕНИЯ
            </h3>

            <Item onClose={() => handleNavigation('/inventory')} />

            <ModalManager pageId={PAGE_ID} />
        </div>
    )
}

export default Coupon