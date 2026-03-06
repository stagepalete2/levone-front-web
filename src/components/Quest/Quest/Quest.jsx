import styles from './Quest.module.scss'

const Quest = ({ item, click }) => {
    
    // Статус: если задание выполнено, иконка серая, иначе желтая
    const isCompleted = item.completed; 
    
    // Используем description или короткое описание, если есть
    const description = item.description;

    return (
        <div className={styles.item} onClick={() => click(item)}>
            {/* 1. Иконка слева (Кружок в баббле) */}
            <div className={styles.iconContainer}>
                <div className={`${styles.bubbleIcon} ${!isCompleted ? styles.active : ''}`}>
                    <div className={styles.circle}></div>
                </div>
            </div>

            {/* 2. Контент по центру */}
            <div className={styles.content}>
                <h3 className={styles.title}>{item.name}</h3>
                <p className={styles.description}>
                    {description}
                </p>
            </div>

            {/* 3. Награда справа */}
            <div className={styles.rewardBadge}>
                <span className={styles.star}>★</span>
                <span className={styles.amount}>+{item.reward}</span>
            </div>
        </div>
    )
}

export default Quest