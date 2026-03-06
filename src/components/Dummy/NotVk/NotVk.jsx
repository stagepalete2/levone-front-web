
import styles from './NotVk.module.scss'

const VkLogo = () => (
	<svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
		<path d="M16.71 23.66c-8.41 0-13.21-5.76-13.4-15.34h4.21c.13 7.02 3.23 10 5.68 10.62V8.32h3.97v6.05c2.42-.26 4.96-3.03 5.82-6.05h3.97c-.66 3.72-3.44 6.49-5.42 7.62 1.98.9 5.12 3.31 6.32 7.72h-4.38c-.93-2.9-3.26-5.14-6.31-5.45v5.45h-.46z"/>
	</svg>
)

const NotVk = () => {

	return (
		<div className={styles.wrap}>
			<img src="/LevelUpLogo.png" alt="Логотип" className={styles.logotype}/>
			<hr className={styles.divider} />
			<a
				className={styles.button}
				href="https://levonework.ru"
				target="_blank"
				rel="noopener noreferrer"
			>
				<VkLogo />
				Перейти на сайт
			</a>
		</div>
	)
}

export default NotVk