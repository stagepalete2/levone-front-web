import { getTimeLeft } from '../../../helpers/time'
import Countdown from '../../Countdown/Countdown'

import { useEffect } from 'react'
import { useInventory } from '../../../zustand'
import styles from './ActivePrize.module.scss'

const ActivePrize = ({ item, click }) => {

    const deactivateItem = useInventory((state) => state.deactivateItem)

    useEffect(() => {
        console.log(item)
    }, [item])

    const handleComplete = () => {
        deactivateItem(item)
    }

    return (
        <div className={styles.card} onClick={() => click(item)}>
            <div className={styles.imageWrapper}>
                <img
                    src={`${item.product_image}`}
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
                        duration={getTimeLeft(
                            item.activated_at,
                            item.duration,
                            import.meta.env.VITE_TZ
                        )}
                        color='white'
                        onComplete={() => handleComplete()}
                    />
                </div>
            </div>
        </div>
    )
}

export default ActivePrize