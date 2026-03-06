import { useRouteNavigator } from "../lib/router"
import { useParams } from '../zustand'; // Проверь путь к стору

export function useNavigation() {
  const routeNavigator = useRouteNavigator()

  // Достаем текущие значения из стора
  const company = useParams((state) => state.company)
  const branch = useParams((state) => state.branch)
  const table = useParams((state) => state.table)
  const delivery = useParams((state) => state.delivery)

  /**
   * @param {string} newPath - Путь для перехода (например, '/')
   * @param {object} paramsOverride - Объект для перезаписи параметров. 
   * Передай null или '', чтобы удалить параметр из URL. 
   */
  const handleNavigation = (newPath, paramsOverride = {}) => {
    if (!newPath) return

    // 1. Собираем все текущие параметры
    const currentParams = {
      company,
      branch,
      table,
      delivery
    }

    // 2. Объединяем с новыми (перезаписываем)
    const finalParams = { ...currentParams, ...paramsOverride }

    // 3. Очищаем ключи, которые не имеют реального значения
    Object.keys(finalParams).forEach(key => {
      // Если значение null, undefined или пустая строка — удаляем
      if (finalParams[key] === null || finalParams[key] === undefined || finalParams[key] === '') {
        delete finalParams[key]
      }
    })

    // 4. Пушим в роутер
    routeNavigator.push({ pathname: newPath, search: finalParams })
  }

  return { handleNavigation }
}