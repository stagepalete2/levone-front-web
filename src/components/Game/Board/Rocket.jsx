import { useMemo, useRef, useState } from 'react'
import usePlayGame from '../../../api/handlers/game/rocketgame.handler'
import { useAuth, useClient, useParams, useView } from '../../../zustand'
import styles from './Rocket.module.scss'

// score (1-10) from backend → target altitude for animation
function scoreToAltitude(score) {
    if (score >= 10) return 1500
    if (score >= 9)  return 1350
    if (score >= 8)  return 1200
    if (score >= 6)  return 900
    if (score >= 4)  return 500
    return 200
}

// Конфигурация уровней
const PRIZE_LEVELS = [
    { altitude: 200,  label: '+300',    icon: '🪙' },
    { altitude: 500,  label: '+700',    icon: '🪙' },
    { altitude: 900,  label: '+1000',   icon: '🪙' },
    { altitude: 1200, label: '+2000',   icon: '🪙' },
    { altitude: 1350, label: 'CODE',    icon: '🔒' },
    { altitude: 1500, label: 'JACKPOT', icon: '🏆', type: 'jackpot' },
];

const MAX_ALTITUDE = 1500;

function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const Rocket = () => {
    const branch = useParams((state) => state.branch);
    const client = useClient((state) => state.client);
    const setView = useView((state) => state.setView)

    const { fetchGameResult, processGameResult } = usePlayGame()

    const [isFlying, setIsFlying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [displayAltitude, setDisplayAltitude] = useState(0)
    const [needsCode, setNeedsCode] = useState(false)
    const [codeInput, setCodeInput] = useState('')

    const rocketRef = useRef(null);
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const flameRef = useRef(null);

    const BASE_BOTTOM_OFFSET = 200;

    const stars = useMemo(() => {
        return new Array(40).fill(0).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 2
        }));
    }, []);

    const handleLaunch = async (codeOverride = '') => {
        if (isFlying || isLoading) return

        const isAuthed = useAuth.getState().isAuthenticated

        // Unauthenticated: demo flight, always max altitude
        if (!isAuthed) {
            const demoResponse = { type: 'prize', reward: { id: 'demo', name: 'Приз' }, _isDemo: true }
            runFlightAnimation(1500, demoResponse)
            return
        }

        setIsLoading(true)

        const startResponse = await fetchGameResult({
            vk_user_id: client?.vk_id || client?.vk_user_id || 0,
            branch,
            code: codeOverride || codeInput
        })

        setIsLoading(false)

        if (!startResponse) return

        // Backend requires daily code (3rd+ game)
        if (startResponse.needs_code) {
            setNeedsCode(true)
            return
        }

        setNeedsCode(false)
        setCodeInput('')
        runFlightAnimation(scoreToAltitude(startResponse.score || 1), startResponse)
    }

    const handleCodeSubmit = () => {
        if (codeInput.trim()) handleLaunch(codeInput.trim())
    }

    const runFlightAnimation = (targetAltitude, serverResponse) => {
        setIsFlying(true);
        if (flameRef.current) flameRef.current.classList.add(styles.active);

        const trackHeight = trackRef.current ? trackRef.current.offsetHeight : 400;
        const targetPx = (targetAltitude / MAX_ALTITUDE) * trackHeight;

        const maxOvershoot = targetPx * 1.05;
        const ascentDur = 2000;
        const hoverDur = 500;
        const descentDur = 1000;

        let startTimestamp = null;
        let phase = 'ascending';
        let phaseStart = null;

        const animate = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            if (!phaseStart) phaseStart = timestamp;

            const elapsed = timestamp - phaseStart;
            let currentPos = 0;
            let finished = false;

            if (phase === 'ascending') {
                const progress = Math.min(elapsed / ascentDur, 1);
                const eased = easeOutExpo(progress);
                currentPos = eased * maxOvershoot;

                if (progress >= 1) {
                    phase = 'hovering';
                    phaseStart = timestamp;
                }
            } else if (phase === 'hovering') {
                const wobble = Math.sin(elapsed / 50) * 3;
                currentPos = maxOvershoot + wobble;

                if (elapsed >= hoverDur) {
                    phase = 'descending';
                    phaseStart = timestamp;
                    if (flameRef.current) flameRef.current.classList.remove(styles.active);
                }
            } else if (phase === 'descending') {
                const progress = Math.min(elapsed / descentDur, 1);
                const eased = easeInOutQuad(progress);
                currentPos = maxOvershoot - (maxOvershoot - targetPx) * eased;

                if (progress >= 1) {
                    finished = true;
                    currentPos = targetPx;
                }
            }

            if (rocketRef.current) {
                rocketRef.current.style.bottom = `${currentPos + BASE_BOTTOM_OFFSET}px`;
            }

            const currentAltVal = Math.round((currentPos / trackHeight) * MAX_ALTITUDE);
            setDisplayAltitude(currentAltVal > 0 ? currentAltVal : 0);

            if (!finished) {
                requestAnimationFrame(animate);
            } else {
                finishGame(serverResponse);
            }
        };

        requestAnimationFrame(animate);
    };

    const finishGame = async (serverResponse) => {
        setTimeout(async () => {
            setIsFlying(false)
            setView('intro')
            await processGameResult(serverResponse, {
                vk_user_id: client?.vk_id || client?.vk_user_id || 0,
                branch
            })
        }, 500)
    }

    return (
        <div className={styles.gameContainer} ref={containerRef}>
            <div className={styles.stars}>
                {stars.map(s => (
                    <div
                        key={s.id}
                        className={styles.star}
                        style={{
                            left: `${s.left}%`,
                            top: `${s.top}%`,
                            width: `${s.size}px`,
                            height: `${s.size}px`,
                            animationDelay: `${s.delay}s`
                        }}
                    />
                ))}
            </div>

            <div className={styles.altitudeDisplay}>
                <div className={`${styles.altitudeValue} ${displayAltitude % 200 === 0 && displayAltitude > 0 ? styles.boost : ''}`}>
                    {displayAltitude}
                </div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>МЕТРОВ</div>
                <div className={styles.altitudeBar}>
                    <div
                        className={styles.altitudeFill}
                        style={{ height: `${(displayAltitude / MAX_ALTITUDE) * 100}%` }}
                    />
                </div>
            </div>

            <div className={styles.trackContainer} ref={trackRef}>
                <div className={styles.trackLine}></div>
                {PRIZE_LEVELS.map((lvl) => (
                    <div
                        key={lvl.altitude}
                        className={`${styles.prizeZone} ${lvl.type === 'jackpot' ? styles.jackpot : ''} ${displayAltitude >= lvl.altitude ? styles.active : ''}`}
                        style={{ bottom: `${(lvl.altitude / MAX_ALTITUDE) * 100}%` }}
                    >
                        <span className={styles.prizeLabel}>{lvl.label}</span>
                        <span>{lvl.icon}</span>
                    </div>
                ))}
            </div>

            <div className={styles.rocketContainer} ref={rocketRef}>
                <div className={styles.rocketEmoji}>🚀</div>
                <div className={styles.flame} ref={flameRef}></div>
            </div>

            <div className={styles.launchArea}>
                {needsCode ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <p style={{ color: 'white', fontSize: 13, textAlign: 'center', margin: 0 }}>
                            Введите код дня
                        </p>
                        <input
                            type="text"
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value)}
                            placeholder="12345"
                            maxLength={10}
                            style={{
                                padding: '8px 16px', borderRadius: 20, border: 'none',
                                textAlign: 'center', fontSize: 18, width: 120, letterSpacing: 4
                            }}
                        />
                        <button
                            className={styles.launchBtn}
                            onClick={handleCodeSubmit}
                            disabled={!codeInput.trim()}
                        >
                            ПУСК
                        </button>
                    </div>
                ) : (
                    <button
                        className={styles.launchBtn}
                        onClick={() => handleLaunch()}
                        disabled={isFlying || isLoading}
                    >
                        {isLoading ? '...' : (isFlying ? 'ПОЛЕТ' : 'ПУСК')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Rocket;