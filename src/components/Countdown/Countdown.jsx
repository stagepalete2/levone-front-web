import { useEffect, useRef, useState } from 'react'

const Countdown = ({ duration, onComplete, color, className='' }) => {
	const [timeLeft, setTimeLeft] = useState(duration)
	const targetTimeRef = useRef(Date.now() + duration)
	const onCompleteRef = useRef(onComplete)

	let countdownProps = {
		style : {
			color: 'black',
			fontWeight: 'bold'
		}
	}

	if (color==='white'){
		countdownProps.style.color = 'white'
	}

	useEffect(() => {
		targetTimeRef.current = Date.now() + duration
		setTimeLeft(duration)
	}, [duration])

	useEffect(() => {
		onCompleteRef.current = onComplete
	}, [onComplete])

	useEffect(() => {
		const interval = setInterval(() => {
			const diff = targetTimeRef.current - Date.now()
			setTimeLeft(Math.max(0, diff))

			if (diff <= 0) {
				clearInterval(interval)
				if (onCompleteRef.current) onCompleteRef.current()
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [duration])

	const formatTime = (ms) => {
		const totalSeconds = Math.floor(ms / 1000)
		const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
		const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
		const seconds = String(totalSeconds % 60).padStart(2, '0')
		return `${hours}:${minutes}:${seconds}`
	}

	return <span style={countdownProps.style} className={className}>{formatTime(timeLeft)}</span>
}

export default Countdown