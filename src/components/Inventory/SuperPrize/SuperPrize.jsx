import styles from './SuperPrize.module.scss'

const SuperPrize = ({ super_prize, click }) => {
    return (
        <div className={styles.card} onClick={() => click(super_prize)}>
            <div className={styles.imageWrapper}>
                <img
                    src="/images/SuperPuperPrize.png"
                    alt="Super Prize"
                    className={styles.image}
                    onError={(e) => e.target.style.display = 'none'}
                />
                <h3 className={styles.title}>СУПЕР ПРИЗ</h3>
                <button className={styles.actionButton} onClick={(e) => {
                    e.stopPropagation()
                    click(super_prize)
                }}>
                    АКТИВИРОВАТЬ
                </button>
            </div>

        </div>
    )
}

export default SuperPrize