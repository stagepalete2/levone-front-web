import styles from './TransactionItem.module.scss'

const TransactionItem = ({ item, isLast }) => {
    
    const formatDateTime = (isoString) => {
        const date = new Date(isoString)
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: date.toLocaleDateString()
        }
    }

    console.log(item)

    const { time, date } = formatDateTime(item.created_on)

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
    
    const title = getTitle(item)
    const isNegative = item.type === 'ТРАТА' || item.amount < 0
    const amountText = isNegative ? `-${item.amount}` : `+${item.amount}`

    return (
        <div className={`${styles.item} ${isLast ? styles.last : ''}`}>
            <div className={styles.info}>
                <div className={styles.dateTime}>
                    <span>{time}</span>
                    <span>{date}</span>
                </div>
                <div className={styles.title}>{title}</div>
            </div>
            
            <div className={`${styles.amountBadge} ${isNegative ? styles.negative : styles.positive}`}>
                <span className={styles.star}>★</span>
                {amountText}
            </div>
        </div>
    )
}

export default TransactionItem