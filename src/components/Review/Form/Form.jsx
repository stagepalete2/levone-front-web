import { useState } from 'react'
import useSendReview from '../../../api/handlers/review/send.handler'
import { useClient, useParams } from '../../../zustand'
import styles from './Form.module.scss'

const Form = ({ review, setReview, setView }) => {
    const [rating, setRating] = useState(0)
    const [phone, setPhone] = useState('')
    const client = useClient((state) => state.client)
    const branch = useParams((state) => state.branch)
    const table = useParams((state) => state.table)
    const { send } = useSendReview()

    const [hover, setHover] = useState(0);
    const [shake, setShake] = useState(false)

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        let x = value.match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
        let formatted = "+7" + (x[2] ? " (" + x[2] : "") + (x[3] ? ") " + x[3] : "") + (x[4] ? "-" + x[4] : "") + (x[5] ? "-" + x[5] : "");
        setPhone(formatted);
    };

    const handleSubmit = async () => {
        if (!phone || !review || !rating || rating === 0) {
            setShake(true);
            return;
        }
        if (rating < 5) setView('defaultm');
        if (rating === 5) setView('successm');

        try {
            await send({
                vk_user_id: client.vk_user_id,
                branch: branch,
                rating: rating,
                phone: phone,
                table: table,
                review: review
            })
        } catch (error) { console.log(error) }
    }

    return (
        <div className={styles.formContainer}>
            <div className={styles.headerTitle}>
                <img src="/icons/icq.png" alt="" />
                <span>ОЦЕНИТЕ ВАШЕ ПОСЕЩЕНИЕ:</span>
            </div>

            <div className={styles.ratingBox}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <img
                        key={star}
                        src="/icons/newstar.png"
                        className={`${styles.star} ${star <= (hover || rating) ? styles.active_star : ""}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                    />
                ))}
            </div>

            <div className={styles.inputsBlock}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Ваше имя:</label>
                    <input type="text" className={styles.formControl} placeholder={client.name} disabled />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Номер телефона:</label>
                    <input type="tel" placeholder='+7 (999) 999-99-99' onChange={handlePhoneChange} value={phone} className={styles.formControl} />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Ваш отзыв:</label>
                    <textarea rows={4} placeholder='ТЕКСТ' onChange={(e) => setReview(e.target.value)} value={review} className={styles.formControl} />
                </div>

                <button type="button" className={styles.sendBtn} onClick={handleSubmit}>
                    {shake ? "Заполните все поля" : "ОТПРАВИТЬ"}
                </button>
            </div>
        </div>
    )
}

export default Form