import axios from 'axios'
import { useCompany } from '../../../zustand'

const postActivateDelivery = async ({ vk_user_id, branch, code }) => {
    const domain = useCompany.getState().domain

    // Убираем try-catch здесь, пусть ошибки обрабатывает хук (useActivateDelivery).
    // Это делает код чище, и мы можем читать error.response.status в хуке.
    const response = await axios.post(`https://${domain}/api/v1/delivery/code/`, {
        vk_user_id: vk_user_id,
        branch: branch,
        short_code: code // Важно: поле должно совпадать с ожиданием сериалайзера (short_code)
    })

    return response // Возвращаем ВЕСЬ объект axios, а не только data
}

export default postActivateDelivery