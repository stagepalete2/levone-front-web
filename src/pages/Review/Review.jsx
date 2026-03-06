import { useEffect, useState } from 'react'
// Импортируем компонент фона и анимацию
import PageBackground from '../../components/PageBackground/PageBackground'
// Проверьте путь к вашему файлу анимации
import reviewBgAnimation from '../../assets/background/light/welcome otziv 1 2 3 A.json'

import ModalManager from '../../components/Modal/Manager'
import DefaultMessage from '../../components/Review/DefaultMessage/DefaultMessage'
import Form from '../../components/Review/Form/Form'
import SuccessMessage from '../../components/Review/SuccessMessage/SuccessMessage'

import { useModal, useParams } from '../../zustand'
import styles from './Review.module.scss'

const PAGE_ID = 'review'

const Review = () => {
	const [view, setView] = useState('form')
	const [review, setReview] = useState('')
	const table = useParams((state) => state.table)
	const pushModal = useModal((state) => state.pushModal)
	
	useEffect(() => {
		if (table == null || table === 'undefined') {
			pushModal({
				pageId: PAGE_ID,
				modal: {
					type: "block",
				},
			});
		}
	}, [table, pushModal])

	return (
		<div className={styles.wrap}>
            <PageBackground animationData={reviewBgAnimation} />

            <div className={styles.content}>
			    {view === 'form' && <Form setView={setView} review={review} setReview={setReview}/>}
			    {view === 'defaultm' && <DefaultMessage setView={setView} setReview={setReview}/>}
			    {view === 'successm' && <SuccessMessage setView={setView} review={review} setReview={setReview}/>}
            </div>

			<ModalManager pageId={PAGE_ID}/>
		</div>
	)
}

export default Review