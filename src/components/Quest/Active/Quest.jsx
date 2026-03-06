import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'
import { useActiveQuest, useClient, useParams } from '../../../zustand'

import useSubmitQuest from '../../../api/handlers/quest/submit.handler'
import { getTimeLeft } from '../../../helpers/time'

// Убедитесь, что путь и файл анимации верные
import questAnimation from '../../../assets/Chel time.json'

import Countdown from '../../Countdown/Countdown'
import styles from './Quest.module.scss'

const Quest = () => {
    const client = useClient((state) => state.client)
    const activeQuest = useActiveQuest((state) => state.activeQuest)
    const removeActiveQuest = useActiveQuest((state) => state.removeActiveQuest)
    const branch = useParams((state) => state.branch)

    useEffect(() => {
        console.log(activeQuest)
    }, [activeQuest])

    const [shake, setShake] = useState(false)
    const [isError, setIsError] = useState(false)
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [servedBy, setServedBy] = useState(null)

    const { submit } = useSubmitQuest()

    const questItem = activeQuest?.quest || activeQuest

    const onComplete = () => {
        removeActiveQuest()
    }

    const triggerError = () => {
        setShake(true)
        setIsError(true)

        setTimeout(() => setShake(false), 500)

        setTimeout(() => setIsError(false), 2000)
    }

    const handleSubmit = async () => {
        if (code.length < 5) {
            triggerError()
            return
        }

        try {
            setIsLoading(true)
            const response = await submit({
                vk_user_id: client.vk_user_id,
                branch: branch,
                quest_id: activeQuest.quest.id,
                code: code,
                employee_id: servedBy
            })

            console.log(response)

            if (response.status === 200) {
                removeActiveQuest()
            } else {
                triggerError()
            }
        } catch (e) {
            console.error(e)
            triggerError()
        } finally {
            setIsLoading(false)
        }
    }

    const CloseIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )

    const handleInputChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 5)
        setCode(val)
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>

                <div className={styles.closeBtn} onClick={() => removeActiveQuest()}>
                    <CloseIcon />
                </div>

                <h2 className={styles.headerTitle}>
                    ЗАДАНИЕ<br />
                    {questItem.name}
                </h2>

                <div className={styles.animationWrapper}>
                    <Lottie animationData={questAnimation} loop={false} className={styles.lottieAnim} />
                </div>

                <div className={styles.whiteCard}>
                    {activeQuest?.activated_at && activeQuest?.duration && (
                        <div className={styles.timerWrapper}>
                            <Countdown
                                duration={getTimeLeft(
                                    activeQuest.activated_at,
                                    activeQuest.duration,
                                    import.meta.env.VITE_TZ
                                )}
                                onComplete={onComplete}
                            />
                        </div>
                    )}

                    <p className={styles.description}>
                        {questItem.description}
                    </p>

                    <div className={`${styles.inputContainer} ${shake ? styles.shake : ''} ${isError ? styles.error : ''}`}>
                        <input
                            type="tel"
                            className={styles.hiddenInput}
                            value={code}
                            onChange={handleInputChange}
                        />

                        <div className={styles.visualLayer}>
                            <span className={styles.label}>
                                {isError ? 'НЕВЕРНЫЙ КОД' : 'ВВЕДИТЕ КОД'}
                            </span>
                            <div className={styles.pinGrid}>
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className={styles.pinCell}>
                                        {code[index] || ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    className={styles.submitButton}
                    disabled={isLoading}
                    onClick={handleSubmit}
                >
                    {isLoading ? '...' : 'СДАТЬ ЗАДАНИЕ'}
                </button>

            </div>
        </div>
    )
}

export default Quest