import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Box } from 'grommet'
import { StatusGood } from 'grommet-icons'
import { ParaTimeContent } from '../ParaTimeContent'
import { ParaTimeFormFooter } from '../ParaTimeFormFooter'
import { useParaTimes } from '../useParaTimes'

export const TransactionSummary = () => {
  const { t } = useTranslation()
  const { isDepositing, isEvmcParaTime, paraTimeName, clearTransactionForm, ticker, transactionForm } =
    useParaTimes()

  return (
    <ParaTimeContent
      description={
        <Trans
          i18nKey="paraTimes.summary.description"
          t={t}
          values={{
            address: transactionForm.recipient,
            paratimeType: isEvmcParaTime ? t('paraTimes.common.evmcType', '(EVMc)') : '',
            paraTime: paraTimeName,
            preposition: isDepositing
              ? t('paraTimes.summary.into', 'into')
              : t('paraTimes.summary.from', 'from'),
            ticker,
            value: transactionForm.amount,
          }}
          defaults="You have successfully transferred <strong>{{value}} {{ticker}}</strong> tokens {{preposition}} the following wallet on the <strong>{{paraTime}}</strong> {{paratimeType}} ParaTime: <strong>{{address}}</strong>"
        />
      }
    >
      <Box margin={{ bottom: 'medium' }}>
        <StatusGood size="80px" color="successful-label" />
      </Box>

      <ParaTimeFormFooter
        primaryLabel={t('paraTimes.summary.navigate', 'Navigate to ParaTimes Transfers')}
        primaryAction={clearTransactionForm}
        withNotice={isEvmcParaTime}
      />
    </ParaTimeContent>
  )
}
