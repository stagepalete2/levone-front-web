
import { useModal } from '../../zustand'

import BirthDateModal from './Birth/Modal'
import BlockModal from './Block/Modal'
import CooldownModal from './Cooldown/Modal'
import BirthdayActivateModal from './Prize/Activate/BirthdayActivateModal'
import ActivateModal from './Prize/Activate/Modal'
import CodeModal from './Prize/Code/Modal'
import PrizeModal from './Prize/Modal'
import SuperPrizeInfo from './Prize/SuperPrize/Info/Modal'
import ActivateSuperPrizeModal from './Prize/SuperPrize/Modal'
import ActivateQuest from './Quest/Activate/Modal'
import PostStoryModal from './Story/Modal'
import TaskModal from './Task/Modal'

const ModalManager = ({ pageId }) => {
  const queue = useModal((state) => state.queues[pageId]) || []
  const popModal = useModal((state) => state.popModal)
  const pushModal = useModal((state) => state.pushModal)

  const currentModal = queue[0]
  if (!currentModal) return null

  const {
    type,
    props,
    onOk,
    afterOk,
    onClose,
    afterClose,
    nextModal
  } = currentModal

  const closeModal = () => {
    onClose?.()
    popModal({ pageId })
    afterClose?.()

    if (nextModal) {
      pushModal({ pageId, modal: nextModal })
    }
  }

  const handleOk = async () => {
    await onOk?.()
    afterOk?.()
    closeModal()
  }

  const modalProps = {
    ...props,
    onClose: closeModal,
    onOk: handleOk
  }

  switch (type) {
    case 'block':
      return <BlockModal {...modalProps} />
    case 'cooldown':
      return <CooldownModal {...modalProps} />
    case 'activate':
      return <ActivateModal {...modalProps} />
    case 'activatequest':
      return <ActivateQuest {...modalProps} />
    case 'task':
      return <TaskModal {...modalProps} />
    case 'prize':
      return <PrizeModal {...modalProps} />
    case 'code':
      return <CodeModal {...modalProps} />
    case 'superprize':
      return <ActivateSuperPrizeModal {...modalProps} />
    case 'superprizeinfo':
      return <SuperPrizeInfo {...modalProps} />
    case 'birth':
      return <BirthDateModal {...modalProps} />
    case 'poststory':
      return <PostStoryModal {...modalProps} />
    case 'birthdayactivate':
      return <BirthdayActivateModal {...modalProps} />
    default:
      return null
  }
}

export default ModalManager