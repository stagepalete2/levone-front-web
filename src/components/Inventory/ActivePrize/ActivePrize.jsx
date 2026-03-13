import Countdown from '../../Countdown/Countdown'

import { useInventory } from '../../../zustand'
import styles from './ActivePrize.module.scss'

const ActivePrize = ({ item, click }) => {

    const deactivateItem = useInventory((state) => state.deactivateItem)

    const handleComplete = () => {
        deactivateItem(item)
    }

    return (
        <div className={styles.card} onClick={() => click(item)}>
            <div className={styles.imageWrapper}>
                <img
                    src={item.product_image_url || '/images/placeholder.png'}
                    alt={item.product_name}
                    loading='lazy'
                />
            </div>

            <div className={styles.bottomBar}>
                <div className={styles.info}>
                    <span className={styles.name}>
                        {item.product_name}
                    </span>
                </div>

                {/* Таймер в серой плашке */}
                <div className={styles.timerBadge}>
                    <Countdown
                        duration={item.expires_at ? Math.max(0, new Date(item.expires_at).getTime() - Date.now()) : 0}
                        color='white'
                        onComplete={() => handleComplete()}
                    />
                </div>
            </div>
        </div>
    )
}

export default ActivePrize