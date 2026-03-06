// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
// import { ruRU } from "@mui/x-date-pickers/locales"
// import dayjs from "dayjs"
// import 'dayjs/locale/ru'
// import { useState } from 'react'
// import { createPortal } from 'react-dom'

// import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"

// import useUpdateClientHandler from '../../../api/handlers/client/useUpdateClient.handler'
// import { useClient, useLogo, useParams } from '../../../zustand'
// import styles from './Modal.module.scss'

// const calendarStyle = {
// 	width: "100%",
// 	maxWidth: 260,
// 	backgroundColor: "transparent",
// 	color: "#fff",

// 	"& .MuiPickersCalendarHeader-root": {
// 		color: "#fff",
// 	},
// 	"& .MuiPickersCalendarHeader-label": {
// 		color: "#fff",
// 	},
// 	"& .MuiPickersCalendarHeader-switchViewIcon": {
// 		color: "#fff",
// 	},
// 	"& .MuiTypography-root": {
// 		color: "#fff",
// 	},
// 	"& .MuiSvgIcon-root": {
// 		color: "#fff",
// 	},

// 	"& .MuiDayCalendar-weekDayLabel": {
// 		color: "rgba(255, 255, 255, 0.6)",
// 	},

// 	"& .MuiPickersDay-root": {
// 		color: "#fff",
// 		"&.Mui-selected": {
// 			backgroundColor: "#c276e1",
// 			color: "#fff",
// 			"&:hover": { backgroundColor: "#ad5dc9" },
// 		},
// 		"&.MuiPickersDay-today": {
// 			borderColor: "#d4e43e",
// 			color: "#fff",
// 		},
// 	},

// 	"& .MuiPickersSlideTransition-root": { minHeight: '200px' },

// 	"& .MuiYearCalendar-root": {
// 		width: '100%',
// 		maxWidth: 'none',
// 		display: 'grid',
// 		gridTemplateColumns: 'repeat(3, 1fr)',
// 		gap: '8px'
// 	},

// 	"& .MuiPickersYear-yearButton": {
// 		color: "#fff",
// 		width: '100%',
// 		margin: 0,
// 		fontSize: "1rem",
// 		height: '40px',
// 		"&.Mui-selected": {
// 			backgroundColor: "#fbcc56",
// 			color: "#000",
// 		},
// 		"&:not(.Mui-selected)": {
// 			color: "#fff",
// 		}
// 	},

// 	"& .MuiMonthCalendar-root": {
// 		width: "100%",
// 		display: "grid",
// 		gridTemplateColumns: "repeat(3, 1fr)",
// 		gap: "8px",
// 		padding: "0 10px",
// 	},

// 	"& .MuiPickersMonth-monthButton": {
// 		color: "#fff",
// 		width: "100%",
// 		margin: 0,

// 		"&:not(.Mui-selected)": {
// 			color: "#fff",
// 		},

// 		"&.Mui-selected": {
// 			backgroundColor: "#2e77d2",
// 			color: "#fff",
// 		},
// 	},
// }

// const Modal = ({ onClose }) => {
// 	const client = useClient((state) => state.client)
// 	const branch = useParams((state) => state.branch)
// 	const [birth, setBirth] = useState(dayjs())
// 	const { updateClient } = useUpdateClientHandler()
// 	const logotype = useLogo((state) => state.logotype)

// 	const handleSubmit = async () => {
// 		if (!birth) return
// 		try {
// 			await updateClient({
// 				vk_user_id: client.vk_user_id,
// 				branch: branch,
// 				birth_date: birth.format("YYYY-MM-DD")
// 			})
// 			if (onClose) onClose();
// 		} catch (error) {
// 			console.log(error)
// 		}
// 	}

// 	return createPortal(
// 		<div className={styles.overlay}>
// 			<div className={styles.modal}>
// 				<div className={styles.header}>
// 					<img
// 						src={logotype !== null ? `${import.meta.env.VITE_BACKEND_DOMAIN}${logotype}` : '/LevelUpLogo.png'}
// 						alt="Logotype"
// 						className={styles.logotype}
// 					/>
// 				</div>

// 				<div className={styles.body}>
// 					<h3 className={styles.title}>ДЕНЬ РОЖДЕНИЯ 🎂</h3>
// 					<p className={styles.subtitle}>Укажите дату, чтобы получить подарок!</p>

// 					<div className={styles.calendarWrapper}>
// 						<LocalizationProvider
// 							dateAdapter={AdapterDayjs}
// 							adapterLocale="ru"
// 							localeText={ruRU.components.MuiLocalizationProvider.defaultProps.localeText}
// 						>
// 							<DateCalendar
// 								className={styles.calendar}
// 								value={birth}
// 								onChange={(newValue) => setBirth(newValue)}
// 								openTo="year"
// 								views={['year', 'month', 'day']}
// 								maxDate={dayjs()}
// 								sx={calendarStyle}
// 							/>
// 						</LocalizationProvider>
// 					</div>

// 					<p className={styles.warning}>
// 						Изменить дату позже будет невозможно
// 					</p>

// 					<button className={styles.submitButton} onClick={handleSubmit}>
// 						ПОДТВЕРДИТЬ
// 					</button>
// 				</div>
// 			</div>
// 		</div>,
// 		document.body
// 	)
// }

// export default Modal

import dayjs from "dayjs"
import 'dayjs/locale/ru'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import useUpdateClientHandler from '../../../api/handlers/client/useUpdateClient.handler'
import { useClient, useLogo, useParams } from '../../../zustand'
import styles from './Modal.module.scss'

// Месяцы в родительном падеже
const MONTHS = [
	'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
	'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
];

const ITEM_HEIGHT = 40;

// Компонент одной колонки барабана
const WheelColumn = ({ items, value, onChange, label }) => {
	const rootRef = useRef(null);
	// ✅ Флаг: МЫ сами программно скроллим — игнорируем эти onScroll события
	const isProgrammatic = useRef(false);
	const snapTimerRef = useRef(null);

	// Прокрутка к индексу без рекурсии
	const scrollToIndex = useCallback((index, behavior = 'auto') => {
		const el = rootRef.current;
		if (!el) return;
		isProgrammatic.current = true;
		el.scrollTo({ top: index * ITEM_HEIGHT, behavior });
		// Сбрасываем флаг после того, как скролл гарантированно завершится
		const delay = behavior === 'smooth' ? 400 : 50;
		setTimeout(() => { isProgrammatic.current = false; }, delay);
	}, []);

	// Синхронизация скролла при изменении value извне (смена month→days пересчитал список)
	useEffect(() => {
		const index = items.indexOf(value);
		if (index !== -1) scrollToIndex(index, 'auto');
	}, [value, items]); // scrollToIndex стабилен, не нужен в deps

	const handleScroll = useCallback(() => {
		// ✅ Игнорируем события от нашего собственного scrollTo
		if (isProgrammatic.current) return;

		if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

		snapTimerRef.current = setTimeout(() => {
			const el = rootRef.current;
			if (!el) return;

			const index = Math.round(el.scrollTop / ITEM_HEIGHT);
			const safeIndex = Math.max(0, Math.min(index, items.length - 1));

			// Прилипаем — это программный скролл, onScroll будет проигнорирован
			scrollToIndex(safeIndex, 'smooth');

			if (items[safeIndex] !== value) {
				onChange(items[safeIndex]);
			}
		}, 80);
	}, [items, value, onChange, scrollToIndex]);

	// Очистка при размонтировании
	useEffect(() => {
		return () => { if (snapTimerRef.current) clearTimeout(snapTimerRef.current); };
	}, []);

	// Клик по элементу — прокрутка к нему
	const handleItemClick = useCallback((item, index) => {
		scrollToIndex(index, 'smooth');
		onChange(item);
	}, [onChange, scrollToIndex]);

	return (
		<div className={styles.wheelColumn}>
			<div
				className={styles.scrollContainer}
				ref={rootRef}
				onScroll={handleScroll}
			>
				<div className={styles.paddingItem} />
				{items.map((item, index) => (
					<div
						key={`${label}-${item}`}
						className={`${styles.wheelItem} ${item === value ? styles.selected : ''}`}
						onClick={() => handleItemClick(item, index)}
					>
						{item}
					</div>
				))}
				<div className={styles.paddingItem} />
			</div>
		</div>
	);
};

const Modal = ({ onClose }) => {
    const client = useClient((state) => state.client)
    const branch = useParams((state) => state.branch)
    const { updateClient } = useUpdateClientHandler()
    const logotype = useLogo((state) => state.logotype)

    const [selectedDate, setSelectedDate] = useState(dayjs());

    const [day, setDay] = useState(selectedDate.date());
    const [monthIndex, setMonthIndex] = useState(selectedDate.month());
    const [year, setYear] = useState(selectedDate.year());

    const years = useMemo(() => {
        const currentYear = dayjs().year();
        const startYear = 1950;
        return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i).reverse();
    }, []);

    const days = useMemo(() => {
        // ИСХОДНИК ОШИБКИ 1: Перешли на безопасный new Date() вместо строк
        const daysInMonth = dayjs(new Date(year, monthIndex, 1)).daysInMonth();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }, [year, monthIndex]);

    useEffect(() => {
        // Снова используем безопасный new Date()
        const maxDays = dayjs(new Date(year, monthIndex, 1)).daysInMonth();
        let safeDay = day;
        if (day > maxDays) {
            safeDay = maxDays;
            setDay(safeDay);
        }

        // ИСХОДНИК ОШИБКИ 2: Создаем дату с нуля, чтобы избежать перескока месяцев (бага 31-го числа)
        const newDate = dayjs(new Date(year, monthIndex, safeDay));
        setSelectedDate(newDate);
    }, [day, monthIndex, year]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // ИСХОДНИК ОШИБКИ 3: Предотвращаем случайный сабмит родительских форм
        
        // Защита от отправки пустых данных
        if (!selectedDate || !client?.vk_user_id) {
            console.error("Клиент не загружен или дата не выбрана");
            return;
        }

        try {
            await updateClient({
                vk_user_id: client.vk_user_id,
                branch: branch,
                birth_date: selectedDate.format("YYYY-MM-DD")
            })
            if (onClose) onClose();
        } catch (error) {
            // Теперь ошибка будет явно видна (лучше вывести её пользователю через Toast/Alert)
            console.error("Ошибка при сохранении дня рождения:", error);
        }
    }

    const logoSrc = logotype
        ? `${import.meta.env.VITE_BACKEND_DOMAIN}${logotype}`
        : '/LevelUpLogo.png';

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <img
                        src={logoSrc}
                        alt="Logotype"
                        className={styles.logotype}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/LevelUpLogo.png';
                        }}
                    />
                </div>

                <div className={styles.body}>
                    <h3 className={styles.title}>ДЕНЬ РОЖДЕНИЯ 🎂</h3>
                    <p className={styles.subtitle}>Укажите дату, чтобы получить подарок!</p>

                    <div className={styles.pickerWrapper}>
                        <div className={styles.highlightBar}></div>

                        <WheelColumn
                            items={days}
                            value={day}
                            onChange={setDay}
                            label="day"
                        />

                        <WheelColumn
                            items={MONTHS}
                            value={MONTHS[monthIndex]}
                            onChange={(val) => setMonthIndex(MONTHS.indexOf(val))}
                            label="month"
                        />

                        <WheelColumn
                            items={years}
                            value={year}
                            onChange={setYear}
                            label="year"
                        />
                    </div>

                    <p className={styles.warning}>
                        Изменить дату позже будет невозможно
                    </p>

                    {/* Добавлен onClick с объектом события e */}
                    <button className={styles.submitButton} onClick={handleSubmit}>
                        ПОДТВЕРДИТЬ
                    </button>

                    <button
                        className={styles.skipButton}
                        onClick={() => { if (onClose) onClose(); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: 14,
                            marginTop: 10,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: '8px 16px',
                        }}
                    >
                        Пропустить
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default Modal