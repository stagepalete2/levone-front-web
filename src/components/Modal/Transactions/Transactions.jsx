import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import getTransactions from '../../../api/endpoints/get/transactions.api'
import { useClient, useLogo, useParams } from '../../../zustand'
import styles from './Transactions.module.scss'

// Simple inline SVG icons replacing @vkontakte/icons
const IconCancel = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 8L20 20M20 8L8 20" stroke="black" strokeWidth="2" strokeLinecap="round"/>
    </svg>
)

const IconNewsfeed = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
)

const Transactions = ({ open, setOpen }) => {
    const client = useClient((state) => state.client)
    const branch = useParams((state) => state.branch)
    const coin = useLogo((state) => state.coin)
    const [transactions, setTransactions] = useState([])

    const fetchTransactions = async () => {
        try {
            const response = await getTransactions({
                branch: branch,
                vk_user_id: client.vk_user_id
            })
            setTransactions(Array.isArray(response) ? response : [])
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (open) {
            fetchTransactions()
        }
    }, [open])

    const formatDateTime = (isoString) => {
        const date = new Date(isoString)
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: date.toLocaleDateString()
        }
    }

    const getTitle = (item) => {
        if (item.description) return item.description

        switch (item.source) {
            case 'SHOP': return 'Магазин подарков'
            case 'GAME': return 'Игра Memory'
            case 'QUEST': return 'Выполнение задания'
            case 'ADMIN': return 'Начисление администратором'
            case 'INITIAL': return 'Приветственный бонус'
            default: return 'Операция'
        }
    }

    const onClose = () => {
        setOpen(false)
    }

    if (!open) return null

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div style={{ flex: 1 }} />
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
                        <IconCancel />
                    </button>
                </div>

                <div className={styles.wrap}>
                    <div className={styles.balanceHeader}>
                        <span className={styles.label}>БАЛАНС:</span>
                        <div className={styles.balanceBadge}>
                            <span className={styles.value}>★ {client?.coins_balance || 0}</span>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <IconNewsfeed />
                            <span className={styles.title}>ОПЕРАЦИИ</span>
                        </div>

                        <div className={styles.list}>
                            {transactions.length > 0 ? transactions.map((item) => {
                                const { time, date } = formatDateTime(item.created_on)
                                const isExpense = item.type === 'ТРАТА'
                                const title = getTitle(item)

                                return (
                                    <div key={item.id || item.created_on} className={styles.item}>
                                        <div className={styles.info}>
                                            <div className={styles.datetime}>
                                                {time}<br />
                                                {date}
                                            </div>
                                            <div className={styles.name}>{title}</div>
                                        </div>

                                        <div className={styles.amountBadge}>
                                            <span className={`${styles.amountText} ${isExpense ? styles.negative : styles.positive}`}>
                                                ★
                                                {isExpense ? '-' : '+'}{item.amount}
                                            </span>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                                    История пуста
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default Transactions