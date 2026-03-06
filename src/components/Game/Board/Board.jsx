
import { useEffect, useMemo } from 'react'
import { useClient, useParams, usePlay, useView } from '../../../zustand'

import { getTimeLeft } from '../../../helpers/time'
import Countdown from '../../Countdown/Countdown'

import usePlayGame from '../../../api/handlers/game/playgame.handler'
import styles from './Board.module.scss'

const GAME = {
	gridSize: 4,
	totalTime: 60,
	minRevealMs: 650,
	emojis: ["🍣", "🍕", "🥗", "🍔", "🍤", "🍜", "🍰", "🥟", "🍙", "🌮", "🍟", "🥐", "🧀", "🍗", "🍩", "🍎"],
	storageKey: "nanotechnology-v1.2"
};

function shuffle(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}



const PAGE_ID = 'game'

const Board = () => {
	const branch = useParams((state) => state.branch)
	const client = useClient((state) => state.client)
	const view = useView((state) => state.view)
	const setView = useView((state) => state.setView)

	const { start, duration, cards, revealed, matches, moves, isBusy } = usePlay((state) => state.play);
	const setStart = usePlay((state) => state.setStart)
	const setCards = usePlay((state) => state.setCards)
	const setMoves = usePlay((state) => state.setMoves)
	const setMatches = usePlay((state) => state.setMatches)
	const setRevealed = usePlay((state) => state.setRevealed)
	const setIsBusy = usePlay((state) => state.setIsBusy)
	const resetGame = usePlay((state) => state.resetGame)

	const pairsCount = (GAME.gridSize * GAME.gridSize) / 2;

	const deck = useMemo(() => {
		const base = shuffle(GAME.emojis).slice(0, pairsCount);
		const doubled = shuffle([...base, ...base]).map((v, idx) => ({ id: idx + 1, key: v, state: "hidden" }));
		return doubled;
	}, [pairsCount]);

	const startGame = () => {
		const startTime = new Date().toISOString();
		setStart(startTime);
		setCards(deck);
		setView("game");
		setMoves(0);
		setMatches(0);
		setRevealed([]);
		setIsBusy(false);
	};

	useEffect(() => {
		if (!start) {
			startGame()
		}
	}, [start])

	const { play } = usePlayGame()

	useEffect(() => {
		if (matches === pairsCount) {
			resetGame()
			setView('intro')
			play({ vk_user_id: client.vk_user_id, branch: branch }).then((response) => {
				console.log(response)
			})
		}
	}, [matches, pairsCount, resetGame, setView, play, branch])

	const onCardClick = (card) => {
		if (isBusy || view !== "game") return;
		if (card.state !== "hidden") return;
		if (revealed.length === 2) return;

		const updatedCards = cards.map((c) =>
			c.id === card.id ? { ...c, state: "shown" } : c
		);

		setCards(updatedCards);
		const newRevealed = [...revealed, card.id];
		setRevealed(newRevealed);

		if (newRevealed.length === 2) {
			const nextMoves = moves + 1;
			setMoves(nextMoves);
			const [aId, bId] = newRevealed;
			const a = updatedCards.find((c) => c.id === aId);
			const b = updatedCards.find((c) => c.id === bId);

			if (a && b && a.key === b.key) {
				setTimeout(() => {
					const updatedCards = cards.map((c) =>
						c.id === aId || c.id === bId ? { ...c, state: "matched" } : c
					);
					setCards(updatedCards);
					setRevealed([]);
					const next = matches + 1;
					setMatches(next);
				}, 160);
			} else {
				setIsBusy(true);
				setTimeout(() => {
					const hiddenCards = cards.map((c) =>
						c.id === aId || c.id === bId ? { ...c, state: "hidden" } : c
					);
					setCards(hiddenCards);
					setRevealed([]);
					setIsBusy(false);
				}, GAME.minRevealMs);
			}
		}
	};

	const onComplete = () => {
		setGameCooldownInterface({ vk_user_id: client.vk_user_id, branch: branch }).then((prom) => {
			setView('intro')
			resetGame()
		})
	}

	const CardView = ({ card }) => {
		const visible = card.state !== "hidden"
		const matched = card.state === "matched"

		return (
			<button
				onClick={() => onCardClick(card)}
				className={`${styles.gameCard} 
					${visible ? styles.visible : ""} 
					${matched ? styles.matched : ""}`}
				aria-label={visible ? card.key : "закрытая карта"}
				disabled={matched}
			>
				<span className={`${styles.content} ${visible ? styles.visible : ""}`}>
					{card.key}
				</span>

				{!visible && <span className={styles.overlay} />}
			</button>
		)
	}



	return (
		<div className={styles.gameWrap}>
			<div className={styles.card}>
				<div className={styles.timer}>
					<Countdown
						duration={getTimeLeft(start, duration, import.meta.env.VITE_TZ)}
						onComplete={() => onComplete()}
						color='white'
					/>
				</div>
				<div className={styles.stats}>
					Ходы: <span>{moves}</span> • Пары: <span>{matches}/{pairsCount}</span>
				</div>
			</div>

			<div className={styles.grid}>
				{cards.map((card) => (
					<div key={card.id} className={styles.cell}>
						<CardView card={card} />
					</div>
				))}
			</div>
		</div>
	)
}

export default Board