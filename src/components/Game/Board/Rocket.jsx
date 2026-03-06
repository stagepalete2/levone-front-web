import { useMemo, useRef, useState } from 'react'
import usePlayGame from '../../../api/handlers/game/rocketgame.handler'
import { useAuth, useClient, useParams, useView } from '../../../zustand'
import styles from './Rocket.module.scss'

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
    const setView = useView((state) => state.setView);

    const { fetchGameResult, processGameResult } = usePlayGame();

    const [isFlying, setIsFlying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [displayAltitude, setDisplayAltitude] = useState(0);

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

    const handleLaunch = async () => {
        if (isFlying || isLoading) return;

        const isAuthed = useAuth.getState().isAuthenticated;

        // If not authenticated, run a demo game with guaranteed super prize
        if (!isAuthed) {
            const demoResponse = {
                type: 'prize',
                reward: { id: 'demo', name: 'Супер Приз' },
                _isDemo: true, // marker for processGameResult
            };
            runFlightAnimation(1500, demoResponse);
            return;
        }

        setIsLoading(true);

        const response = await fetchGameResult({
            vk_user_id: client?.vk_user_id || 0,
            branch: branch
        });

        setIsLoading(false);

        if (!response) return;

        let targetAltitude = 200; // default → +300

        if (response.type === 'prize') {
            // Джекпот — максимальная высота
            targetAltitude = 1500;
        } else if (response.type === 'code') {
            targetAltitude = 1350;
        } else if (response.type === 'coin') {
            const amount = Number(response.reward);
            if (amount >= 2000)      targetAltitude = 1200; // +2000
            else if (amount >= 1000) targetAltitude = 900;  // +1000
            else if (amount >= 700)  targetAltitude = 500;  // +700
            else                     targetAltitude = 200;  // +300
        }

        runFlightAnimation(targetAltitude, response);
    };

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
            setView('intro');
            await processGameResult(serverResponse, {
                vk_user_id: client?.vk_user_id || 0,
                branch: branch
            });
        }, 500);
    };

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
                <button
                    className={styles.launchBtn}
                    onClick={handleLaunch}
                    disabled={isFlying || isLoading}
                >
                    {isLoading ? '...' : (isFlying ? 'ПОЛЕТ' : 'ПУСК')}
                </button>
            </div>
        </div>
    );
};

export default Rocket;