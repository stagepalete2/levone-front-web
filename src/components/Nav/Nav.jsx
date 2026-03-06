import { useActiveVkuiLocation } from '../../lib/router'
import { useNavigation } from '../../hooks/useHandleNavigation'
import Lottie from 'lottie-react'

import styles from './Nav.module.scss'
import lightButAnimation from '../../assets/light_but.json'

const Nav = () => {
	const location = useActiveVkuiLocation();
	const { handleNavigation } = useNavigation()
	const activePanel = location.panel;

	// ВАЖНО: preserveAspectRatio: 'none' растягивает анимацию по всему блоку
	const lottieOptions = {
		animationData: lightButAnimation,
		loop: true,
		autoplay: true,
		rendererSettings: {
			preserveAspectRatio: 'none'
		}
	};

	const AnimatedBorder = () => (
		<div className={styles.lottie_border_layer}>
			<Lottie
				{...lottieOptions}
				style={{ width: '100%', height: '100%' }}
			/>
		</div>
	);

	return (
		<div className={styles.nav}>
			<button
				className={`${styles.link} ${activePanel === 'inventory' ? styles.selected : ''}`}
				onClick={() => { handleNavigation("/inventory") }}
			>
				{/* Слой анимации */}
				{activePanel === 'inventory' && <AnimatedBorder />}

				{/* Слой контента */}
				<div className={styles.inner_content}>
					<span className={styles.text}>Мои подарки</span>
				</div>
			</button>

			<button
				className={`${styles.link} ${activePanel === 'catalog' ? styles.selected : ''}`}
				onClick={() => { handleNavigation("/catalog") }}
			>
				{/* Слой анимации */}
				{activePanel === 'catalog' && <AnimatedBorder />}

				{/* Слой контента */}
				<div className={styles.inner_content}>
					<span className={styles.text}>Магазин подарков</span>
				</div>
			</button>
		</div>
	)
}

export default Nav