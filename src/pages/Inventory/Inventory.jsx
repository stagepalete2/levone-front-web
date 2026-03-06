import { useEffect, useMemo, useState } from 'react'
import inventoryBgAnimation from '../../assets/background/light/my_gift2_A.json'
import ActivePrize from '../../components/Inventory/ActivePrize/ActivePrize'
import BirthdayPrize from '../../components/Inventory/BirthdayPrize/BirthdayPrize'
import Prize from '../../components/Inventory/Prize/Prize'
import SuperPrize from '../../components/Inventory/SuperPrize/SuperPrize'
import BirthdayModal from '../../components/Modal/Birthday/Modal.jsx'
import ModalManager from '../../components/Modal/Manager'
import Nav from '../../components/Nav/Nav'

import PageBackground from '../../components/PageBackground/PageBackground'
import { useNavigation } from '../../hooks/useHandleNavigation'
import { useBirthday, useInventory, useInventoryCooldown, useModal, useSuperPrize } from '../../zustand'
import styles from './Inventory.module.scss'

const PAGE_ID = 'inventory'

const Inventory = () => {
    const items = useInventory((state) => state.items)
    const super_prize_items = useSuperPrize((state) => state.superPrizes)
    const cooldown = useInventoryCooldown((state) => state.inventoryCooldown)
    const { handleNavigation } = useNavigation()
    const [showBirthdayModal, setShowBirthdayModal] = useState(false)
    const birthdayStatus = useBirthday((state) => state.birthdayStatus)
    const setBirthdayStatus = useBirthday((state) => state.setBirthdayStatus)
    const isNavLocked = useBirthday((state) => state.isNavLocked)
    

    const pushModal = useModal((state) => state.pushModal)

    const { activeItems, availableItems, usedItems, birthdayItems } = useMemo(() => {
        const active = []
        const available = []
        const used = []
        const birthday = []

        items.forEach(item => {
            if (item.status === 'ACTIVE') {
            active.push(item)
            } else if (item.status === 'EXPIRED') {
            used.push(item)
            } else if (item.acquired_from === 'BIRTHDAY_PRIZE') {
            birthday.push(item)
            } else {
            available.push(item)
            }
        })
        return { activeItems: active, availableItems: available, usedItems: used, birthdayItems: birthday }
    }, [items])

    const totalCount = (super_prize_items?.length || 0) + availableItems.length + activeItems.length

    const handleActivatePrize = (prize) => {
        if (prize.status === 'ACTIVE') {
            handleNavigation('/coupon')
            return
        }
        if (prize.acquired_from === 'BIRTHDAY_PRIZE') {
            pushModal({
            pageId: PAGE_ID,
                modal: {
                    type: 'birthdayactivate',
                    props: { prize: prize }
                }
            })
            return
        }
        if (cooldown?.is_active || prize.last_activated_at) {
            return
        }
        pushModal({
            pageId: PAGE_ID,
            modal: {
            type: 'activate',
            props: { prize: prize }
            }
        })
    }

    const handleActivateSuperPrize = (super_prize) => {
        pushModal({
            pageId: PAGE_ID,
            modal: {
                type: 'superprize',
                props: { super_prize: super_prize }
            }
        })
    }

    useEffect(() => {
        if (
            birthdayStatus?.is_birthday_mode === true &&
            birthdayStatus?.already_claimed === false
        ) {
            setShowBirthdayModal(true)
        }
    }, [birthdayStatus])

    const handleBirthdayPrizeClaimed = () => {
        setShowBirthdayModal(false)
        setBirthdayStatus({ ...birthdayStatus, already_claimed: true }) // ← ключевое
        if (isNavLocked) {
            handleNavigation('/inventory')
        }
    }

    return (
        <>
            {showBirthdayModal && (
				<BirthdayModal
					onClose={() => setShowBirthdayModal(false)}
					onPrizeClaimed={handleBirthdayPrizeClaimed}
				/>
			)}
            <div className={styles.wrap}>
                
                <PageBackground animationData={inventoryBgAnimation} />
                <Nav />
                <div className={styles.pageHeader}>
                    <h1 className={styles.title}>МОИ<br />ПОДАРКИ</h1>
                    <div className={styles.counterBadge}>
                        <img src='/icons/GIFT.png' className={styles.icon} />
                        <span className={styles.count}>{totalCount} шт.</span>
                    </div>
                </div>

                <div className={styles.content}>

                    {activeItems.length > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>АКТИВНЫЕ</h2>
                            {activeItems.map((item) => (
                                <ActivePrize key={item.id} item={item} click={handleActivatePrize} />
                            ))}
                            <div className={styles.divider} />
                        </div>
                    )}

                    <div className={styles.grid}>
                        {birthdayItems.map((item) => (
                            <BirthdayPrize key={item.id} item={item} click={handleActivatePrize} />
                        ))}
                        
                        {super_prize_items && super_prize_items.map((item) => (
                            <SuperPrize key={item.id} super_prize={item} click={handleActivateSuperPrize} />
                        ))}

                        {availableItems.map((item) => (
                            <Prize key={item.id} item={item} click={handleActivatePrize} />
                        ))}
                    </div>

                    {usedItems.length > 0 && (
                        <div className={styles.usedSection}>
                            <div className={styles.divider} />
                            <h2 className={styles.usedTitle}>ИСПОЛЬЗОВАННЫЕ</h2>
                            <div className={styles.grid}>
                                {usedItems.map((item) => (
                                    <Prize key={item.id} item={item} click={handleActivatePrize} isUsed={true} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <ModalManager pageId={PAGE_ID} />
            </div>
        </>
    )
}

export default Inventory