import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAllowMessageFromCommunity } from '../../../api/handlers/client/useAllowMessageFromCommunity.handler'
import { useJoinCommunity } from '../../../api/handlers/client/useJoinCommunity.handler'
import { useClient, useGroup } from '../../../zustand'
import styles from './Modal.module.scss'

const Modal = ({ onClose }) => {
    const [shake, setShake] = useState(false)
    // Локальные переопределения состояний тасков (для возможности отмены)
    const [localOverrides, setLocalOverrides] = useState({})

    const { joinCommunity } = useJoinCommunity()
    const { allowMessageFromCommunity } = useAllowMessageFromCommunity()

    const group = useGroup((state) => state.group)
    const client = useClient((state) => state.client)
    const setIsJoinedCommunity = useClient((state) => state.setIsJoinedCommunity)
    const setIsAllowedMessageFromCommunity = useClient((state) => state.setIsAllowedMessageFromCommunity)

    const tasks = [
        {
            id: 0,
            title: "Вступить в наше сообщество",
            defaultComplete: client?.is_joined_community || client?.branches?.is_joined_community,
            onCheck: () => joinCommunity({ group_id: parseInt(group?.group_id) }),
            onUncheck: () => {
                // Снимаем локально — VK не позволяет программно покинуть группу
                setIsJoinedCommunity(false)
            },
        },
        {
            id: 1,
            title: "Разрешить отправку сообщений",
            defaultComplete: client?.is_allowed_message || client?.branches?.is_allowed_message,
            onCheck: () => allowMessageFromCommunity({ group_id: parseInt(group?.group_id) }),
            onUncheck: () => {
                // Снимаем локально — VK не позволяет программно отозвать разрешение
                setIsAllowedMessageFromCommunity(false)
            },
        }
    ]

    // Получаем актуальное состояние таска с учётом локального переопределения
    const getTaskStatus = (task) => {
        if (localOverrides[task.id] !== undefined) return localOverrides[task.id]
        return Boolean(task.defaultComplete)
    }

    // Обработчик клика по таску
    const handleTaskClick = (task) => {
        const isCurrentlyDone = getTaskStatus(task)

        if (isCurrentlyDone) {
            // Снимаем отметку
            setLocalOverrides((prev) => ({ ...prev, [task.id]: false }))
            task.onUncheck?.()
        } else {
            // Ставим отметку через оригинальный handler
            // Сначала ставим локально оптимистично
            setLocalOverrides((prev) => ({ ...prev, [task.id]: true }))
            task.onCheck?.()
        }
    }

    useEffect(() => {
        if (shake) {
            const timeout = setTimeout(() => setShake(false), 1000)
            return () => clearTimeout(timeout)
        }
    }, [shake])

    const handleMainButtonClick = () => {
        const allDone = tasks.every((task) => getTaskStatus(task))

        if (allDone) {
            onClose()
        } else {
            setShake(true)
        }
    }

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.logoContainer}>
                <img src='/LevelUpLogo.png' alt="Logo" />
            </div>

            <h2 className={styles.title}>
                ТВОЙ ПОДАРОК<br />УЖЕ ЖДЁТ!
            </h2>

            <div className={styles.taskList}>
                {tasks.map((task) => {
                    const isDone = getTaskStatus(task)
                    return (
                        <div
                            key={task.id}
                            className={styles.taskRow}
                            onClick={() => handleTaskClick(task)}
                        >
                            <div className={`${styles.checkbox} ${isDone ? styles.checked : ''}`} />
                            <span className={styles.taskLabel}>{task.title}</span>
                        </div>
                    )
                })}
            </div>

            <button
                className={`${styles.mainButton} ${shake ? styles.shake : ''}`}
                onClick={handleMainButtonClick}
            >
                РАЗРЕШИТЬ
            </button>
        </div>,
        document.body
    )
}

export default Modal