import React, { useEffect } from 'react'
import ModalManager from '../../components/Modal/Manager'
import ActiveQuest from '../../components/Quest/Active/Quest'
import QuestItem from '../../components/Quest/Quest/Quest'

// 1. Импортируем фон
import PageBackground from '../../components/PageBackground/PageBackground'
// Укажите верный путь к JSON анимации для заданий
import questBgAnimation from '../../assets/background/light/animation-quest.json'

import { useActiveQuest, useClient, useModal, useQuest, useQuestCooldown } from '../../zustand'

import styles from './Quest.module.scss'

const PAGE_ID = 'quest'

const Quest = () => {
    const client = useClient((state) => state.client)
    const items = useQuest((state) => state.items)
    const activequest = useActiveQuest((state) => state.activeQuest)
    const cooldown = useQuestCooldown((state) => state.questCooldown)

    const pushModal = useModal((state) => state.pushModal)

    const handleActivateQuest = (quest) => {
        if (!quest.completed) {
            pushModal({
                pageId: PAGE_ID,
                modal: {
                    type: 'activatequest',
                    props: { quest: quest }
                }
            })
        }
    }

    useEffect(() => {
        if (cooldown && cooldown?.is_active && !activequest?.id) {
            pushModal({
                pageId: PAGE_ID,
                modal: {
                    type: 'cooldown',
                    props: {}
                }
            })
        }
    }, [cooldown, activequest, pushModal])

    return (
        <div className={styles.wrap}>
            {/* 2. Фон на задний план */}
            <PageBackground animationData={questBgAnimation} />

            {activequest?.id ? (
                <div className={styles.activeQuestWrapper}>
                    <ActiveQuest />
                </div>
            ) : (
                <>
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
                                    <img src="/icons/calendar-light.png" alt="" />
                                </span>
                                <span className={styles.headerTitle}>СПИСОК ЗАДАНИЙ</span>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            {items && items.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <QuestItem
                                        item={item}
                                        click={handleActivateQuest}
                                    />
                                    {/* Выводим HR только если это НЕ последний элемент */}
                                    {index < items.length - 1 && <hr />}
                                </React.Fragment>
                            ))}

                            {(!items || items.length === 0) && (
                                <div className={styles.emptyState}>
                                    Заданий пока нет
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <ModalManager pageId={PAGE_ID} />
        </div>
    )
}

export default Quest