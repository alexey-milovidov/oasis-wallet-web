import { AddEscrowForm } from 'app/components/AddEscrowForm'
import { Validator, ValidatorDetails } from 'app/state/staking/types'
import { Box } from 'grommet'
import React from 'react'

import { ValidatorInformations } from './ValidatorInformations'

interface ValidatorProps {
  data: Validator
  details: ValidatorDetails | null
  walletIsOpen: boolean
}
export const ValidatorItem = (props: ValidatorProps) => {
  const walletIsOpen = props.walletIsOpen
  const validator = props.data
  const details = props.details

  return (
    <Box pad="medium" background="background-contrast" data-testid="validator-item">
      <ValidatorInformations validator={validator} details={details} />
      {walletIsOpen && (
        <AddEscrowForm
          validatorAddress={validator.address}
          validatorStatus={validator.status}
          validatorRank={validator.rank}
        />
      )}
    </Box>
  )
}
