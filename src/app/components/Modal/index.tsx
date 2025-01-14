import { createContext, useCallback, useContext, useState } from 'react'
import { Box, Button, Layer, Paragraph } from 'grommet'
import { useTranslation } from 'react-i18next'
import { Alert, Checkmark, Close } from 'grommet-icons'
import { ModalHeader } from 'app/components/Header'

interface Modal {
  title: string
  description: string
  handleConfirm: () => void
  isDangerous: boolean
}

interface ModalContainerProps {
  modal: Modal
  closeModal: () => void
}

interface ModalContextProps {
  launchModal: (modal: Modal) => void
  closeModal: () => void
}

interface ModalProviderProps {
  children: React.ReactNode
}

const ModalContext = createContext<ModalContextProps>({} as ModalContextProps)

const ModalContainer = ({ modal, closeModal }: ModalContainerProps) => {
  const { t } = useTranslation()
  const confirm = useCallback(() => {
    modal.handleConfirm()
    closeModal()
  }, [closeModal, modal])

  return (
    <Layer modal onEsc={closeModal} onClickOutside={closeModal} background="background-front">
      <Box margin="medium">
        <ModalHeader>{modal.title}</ModalHeader>
        <Paragraph fill>{modal.description}</Paragraph>
        <Box direction="row" gap="small" justify="between" pad={{ top: 'large' }}>
          <Button
            label={t('common.cancel', 'Cancel')}
            onClick={closeModal}
            secondary
            icon={<Close size="18px" />}
          />
          <Button
            label={t('common.confirm', 'Confirm')}
            onClick={confirm}
            disabled={modal.isDangerous}
            primary={modal.isDangerous}
            color={modal.isDangerous ? 'status-error' : ''}
            icon={modal.isDangerous ? <Alert size="18px" /> : <Checkmark size="18px" />}
          />
        </Box>
      </Box>
    </Layer>
  )
}

const ModalProvider = (props: ModalProviderProps) => {
  const [modal, setModal] = useState<Modal | null>(null)
  const closeModal = useCallback(() => {
    setModal(null)
  }, [])

  return (
    <ModalContext.Provider value={{ closeModal, launchModal: setModal }}>
      {props.children}
      {modal && <ModalContainer modal={modal} closeModal={closeModal} />}
    </ModalContext.Provider>
  )
}

const useModal = () => {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }

  return context
}

export { ModalProvider, useModal }
