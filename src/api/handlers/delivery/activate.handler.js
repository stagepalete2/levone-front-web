import postActivateDelivery from "../../endpoints/post/activatedelivery.api"

const useActivateDelivery = () => {
    const activate = async ({ vk_user_id, branch, code }) => {
        try {
            const response = await postActivateDelivery({ vk_user_id, branch, code })

            // Теперь response.status существует
            if (response.status === 200) {
                return true
            }
            return false

        } catch (error) {
            // Обработка ошибок от Axios
            if (error.response) {
                // Сервер ответил кодом ошибки (404, 403, 400)
                console.error("Server Error:", error.response.status, error.response.data);

                // Опционально: можно возвращать разные коды ошибок, 
                // чтобы показывать разные сообщения в Modal
            } else {
                // Ошибка сети или другая
                console.error("Network Error:", error);
            }
            return false
        }
    }

    return { activate }
}

export default useActivateDelivery