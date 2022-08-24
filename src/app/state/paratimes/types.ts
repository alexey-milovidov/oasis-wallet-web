import { StringifiedBigInt } from 'types/StringifiedBigInt'
import { ParaTime } from '../../../config'

export enum TransactionFormSteps {
  TransferType,
  ParaTimeSelection,
  TransactionRecipient,
  TransactionAmount,
  TransactionConfirmation,
  TransactionSummary,
}

export enum TransactionTypes {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
}

export interface TransactionForm {
  amount: string
  confirmation: boolean
  paraTime?: ParaTime
  privateKey: string
  recipient: string
  type: TransactionTypes | undefined
}

export interface ParaTimesState {
  balance: StringifiedBigInt
  isLoading: boolean
  transactionForm: TransactionForm
  transactionFormStep: TransactionFormSteps
}

export type OasisAddressBalancePayload = {
  address: string
  paraTime: ParaTime
}

export type EvmcBalancePayload = {
  privateKey: string
  paraTime: ParaTime
}

export type Runtime = {
  address: string
  id: string
  decimals: number
}

export type ParaTimeTransaction = Pick<TransactionForm, 'amount' | 'recipient' | 'type'>
