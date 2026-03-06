// components/Profile/UserInfo/UserInfo.jsx
import styles from './UserInfo.module.scss'

const UserInfo = ({ client }) => {
    // Вычисляем процент уровня (заглушка или реальная логика)
    // Например, если current_exp = 50, а next_level_exp = 100, то width = 50%
    const progressWidth = client?.level_progress ? `${client.level_progress}%` : '30%'

    return (
        <div className={styles.container}>
            <div className={styles.avatarWrapper}>
                {client?.photo ? (
                    <img src={client.photo} alt="Avatar" className={styles.avatar} />
                ) : (
                    <div className={styles.avatarPlaceholder}>
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                    </div>
                )}
            </div>

            <h2 className={styles.name}>
                ПРИВЕТ, {client?.name ? client?.name.toUpperCase() : 'ГОСТЬ'}
            </h2>
        </div>
    )
}

export default UserInfo