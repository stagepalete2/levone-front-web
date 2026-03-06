import { useState } from 'react'
import { useNavigation } from '../../hooks/useHandleNavigation'
import { useClient, usePromotions } from '../../zustand'

// 1. Импортируем фон и анимацию
import PageBackground from '../../components/PageBackground/PageBackground'
// ВАЖНО: Проверьте имя файла. Если файла нет, используйте любой существующий для теста
import profileBgAnimation from '../../assets/background/light/profile_bg.json'

import Transactions from '../../components/Modal/Transactions/Transactions'
import UserInfo from '../../components/Profile/UserInfo/UserInfo'
import styles from './Profile.module.scss'

const PROMOTIONS = [
    {
        id: 1,
        title: "только в кафе LevOne Ленина",
        discount: "10% скидка",
        dates: "22,23 февраля",
        image: null // Здесь могла быть картинка
    },
    {
        id: 2,
        title: "при заказе от 5000",
        discount: "Десерт в подарок",
        dates: "до 8 марта",
        image: null
    },
    {
        id: 3,
        title: "счастливые часы",
        discount: "2 кофе по цене 1",
        dates: "Пн-Пт 08:00-11:00",
        image: null
    }
]

const Profile = () => {
    const client = useClient((state) => state.client)
    const promotions = usePromotions((state) => state.promotions)

    const { handleNavigation } = useNavigation()

    const [open, setOpen] = useState(false)

    const openTransactions = () => {
        handleNavigation('/transactions')
    }
    return (
        <>
            {/* 2. Добавляем фон */}
            <PageBackground animationData={profileBgAnimation} />

            <div className={styles.wrap}>
                <UserInfo client={client} />

                {/* Блок баланса */}
                <div className={styles.balanceContainer} onClick={openTransactions}>
                    <span className={styles.label}>БАЛАНС:</span>
                    <div className={styles.valueBadge}>
                        <span className={styles.star}>★</span>
                        <span className={styles.count}>{client?.coins_balance || 0}</span>
                    </div>
                </div>

                {/* Меню навигации */}
                <div className={styles.menu}>
                    <button className={styles.menuBtn} onClick={() => handleNavigation('/quest')}>
                        <img src="/images/calendar.png" alt="calendar" className={styles.icon} />
                        <span className={styles.text}>СПИСОК ЗАДАНИЙ</span>
                    </button>
                </div>

                {/* CTA Кнопка (Фиолетовая) */}
                <div className={styles.promoWrapper}>
                    <a
                        href="https://t.me/levoniiio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.promoBtn}
                    >
                        ХОЧУ ЛЕВЕЛUP<br />В СВОЕ КАФЕ
                    </a>
                </div>

                {promotions.length > 0 && (
                    <div className={styles.promoSection}>
                        <h3 className={styles.sectionTitle}>НЕ ПРОПУСТИ АКЦИИ</h3>

                        <div className={styles.promoSlider}>
                            {promotions.map((promo) => (
                                <div key={promo.id} className={styles.promoCard}>
                                    {/* Левая белая часть */}
                                    <div className={styles.cardLeft}>
                                        <div className={styles.brandText}>LevOne</div>
                                        <div className={styles.promoText}>{promo.title}</div>
                                        <div className={styles.illustrationPlaceholder}></div>
                                    </div>

                                    {/* Правая желтая часть */}
                                    <div className={styles.cardRight}>
                                        <div className={styles.discountTitle}>{promo.discount}</div>
                                        <div className={styles.dates}>{promo.dates}</div>
                                        <div className={styles.subText}>{promo.title}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Transactions open={open} setOpen={setOpen} />
        </>
    )
}

export default Profile