import { useEffect, useState } from 'react'
import getTransactions from '../../api/endpoints/get/transactions.api'
import transactionBg from '../../assets/background/light/transactions_bg.json'
import PageBackground from '../../components/PageBackground/PageBackground'
import TransactionItem from '../../components/Transactions/TransactionItem'
import { useClient, useParams } from '../../zustand'
import styles from './Transactions.module.scss'

const Transactions = () => {
    const client = useClient((state) => state.client)
    const branch = useParams((state) => state.branch)
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
        fetchTransactions()
    }, [])

    return (
        <div className={styles.wrap}>
            <PageBackground animationData={transactionBg} />
            <div className={styles.balanceRow}>
                <span className={styles.label}>БАЛАНС:</span>
                <div className={styles.badge}>
                    <span className={styles.icon}>★</span>
                    <span className={styles.value}>{client?.coins_balance || 0}</span>
                </div>
            </div>

            <div className={styles.questCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.innerHeader}>
                        <span className={styles.headerIcon}>
                            <img src="/icons/check.png" alt="" />
                        </span>
                        <span className={styles.headerTitle}>ОПЕРАЦИИ</span>
                    </div>
                </div>

                <div className={styles.cardBody}>
                    {transactions.length > 0 ? (
                        <div className={styles.transactionsList}>
                            {transactions.map((item, idx) => (
                                <TransactionItem
                                    key={item.id || idx}
                                    item={item}
                                    isLast={idx === transactions.length - 1}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>История операций пуста</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Transactions