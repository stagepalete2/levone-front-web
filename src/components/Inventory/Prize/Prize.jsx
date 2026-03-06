import { useInventoryCooldown } from '../../../zustand'
import styles from './Prize.module.scss'

const Prize = ({ item, click, isUsed = false }) => {

    // Получаем глобальное состояние перезарядки
    const cooldown = useInventoryCooldown((state) => state.inventoryCooldown)

    let buttonLabel = 'ИСПОЛЬЗОВАТЬ'
    let isDisabled = false
    let extraClass = ''

    console.log(item)

    if (item.is_active) {
        // Если предмет активен (таймер запущен)
        buttonLabel = 'КУПОН'
    } else if (isUsed) {
        // Если предмет уже использован (в истории)
        buttonLabel = 'ИСПОЛЬЗОВАН'
        isDisabled = true
        extraClass = styles.cardUsed
    } else if (cooldown?.is_active) {
        // Если действует глобальная перезарядка на открытие подарков
        buttonLabel = 'ПЕРЕЗАРЯДКА'
        isDisabled = true
        extraClass = styles.cardCooldown
    }

    return (
        <div
            className={`${styles.card} ${extraClass}`}
            onClick={() => !isDisabled && click(item)}
        >
            <div className={styles.imageWrapper}>
                <img
                    src={`${item.product_image}`}
                    alt={item.product_name}
                    loading='lazy'
                />
                <button
                    className={styles.actionButton}
                    disabled={isDisabled}
                    onClick={(e) => {
                        e.stopPropagation()
                        click(item)
                    }}
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    )
}

export default Prize