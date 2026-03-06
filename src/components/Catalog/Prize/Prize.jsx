import { useCatalogCooldown } from '../../../zustand'
import styles from './Prize.module.scss'

const Prize = ({ item, click }) => {

    const cooldown = useCatalogCooldown((state) => state.catalogCooldown)

    // Если на перезарядке, блокируем клик
    const handleClick = () => {
        if (!cooldown?.is_active) {
            click(item)
        }
    }



    return (
        <div className={`${styles.card} ${cooldown?.is_active ? styles.disabled : ''}`} onClick={handleClick}>
            <div className={styles.imageWrapper}>
                <img
                    src={`${item.image}`}
                    alt={item.name}
                    loading='lazy'
                />
                <div className={styles.infoBlock}>
                    {item.name}
                </div>
                <div className={`${styles.priceBlock} ${cooldown?.is_active ? styles.disabled : ''}`}>
                    {cooldown?.is_active ? (
                        <span className={styles.cooldown}>Перезарядка</span>
                    ) : (
                        <span>★ {item.price}</span>
                    )}
                </div>
            </div>


        </div>
    )
}

export default Prize