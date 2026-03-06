import { useEffect, useState } from 'react'
import Prize from '../../components/Catalog/Prize/Prize'
import Buy from '../../components/Modal/Buy/Modal'
import ModalManager from '../../components/Modal/Manager'
import Nav from '../../components/Nav/Nav'
import { useCatalog, useCatalogCooldown, useClient } from '../../zustand'

// 1. Импортируем компонент фона и нужную анимацию
import catalogBgAnim from '../../assets/background/light/my_gift2_A.json'
import PageBackground from '../../components/PageBackground/PageBackground'

import styles from './Catalog.module.scss'

const PAGE_ID = 'catalog'

const Catalog = () => {
    const client = useClient((state) => state.client)
    const items = useCatalog((state) => state.items)
    const cooldown = useCatalogCooldown((state) => state.catalogCooldown)


    useEffect(() => {
        console.log(items)
    }, [items])

    const [selectedItem, setSelectedItem] = useState(null)

    const selectItem = (item) => {
        if (!cooldown?.is_active) {
            setSelectedItem(item)
        }
    }

    return (
        <div className={styles.wrap}>
            {/* 2. Вставляем фон самым первым элементом */}
            <PageBackground animationData={catalogBgAnim} />
            {/* Весь остальной контент оборачиваем в div или просто следим за z-index */}
            <Nav />
            <div className={styles.innerContent}>

                {/* Шапка: Заголовок + Баланс */}
                <div className={styles.header}>
                    <div className={styles.titleBlock}>
                        <h1 className={styles.title}>МАГАЗИН<br />ПОДАРКОВ</h1>
                    </div>

                    <div className={styles.balanceBadge}>
                        <span className={styles.value}>★ {client?.coins_balance || 0}</span>
                    </div>
                </div>

                <div className={styles.content}>
                    {items && items.map((item) => (
                        <Prize key={item.id} item={item} click={selectItem} />
                    ))}
                </div>
            </div>

            <Buy selected={selectedItem} setSelected={setSelectedItem} />
            <ModalManager pageId={PAGE_ID} />
        </div>
    )
}

export default Catalog