// components/UI/PageBackground/PageBackground.jsx
import Lottie from 'lottie-react'
import { useEffect, useRef } from 'react'
import styles from './PageBackground.module.scss'

const PageBackground = ({ animationData }) => {
    const lottieRef = useRef()

    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.setSpeed(2.5) 
        }
    }, [])

    return (
        <div className={styles.backgroundContainer}>
            <Lottie 
                lottieRef={lottieRef}
                animationData={animationData} 
                loop={false} 
                rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice' 
                }}
                className={styles.lottie}
            />
        </div>
    );
};

export default PageBackground;