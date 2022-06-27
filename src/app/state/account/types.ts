import { Transaction } from 'app/state/transaction/types'
import { ErrorPayload } from 'types/errors'

export interface BalanceDetails {
  available: number | null

  /** This is delayed by 20 seconds on oasisscan and 5 seconds on oasismonitor. */
  debonding: number | null
  /** This is delayed by 20 seconds on oasisscan and 5 seconds on oasismonitor. */
  delegations: number | null
  /** This is delayed by 20 seconds on oasisscan and 5 seconds on oasismonitor. */
  total: number | null
}

export interface Account extends BalanceDetails {
  address: string
}

/* --- STATE --- */
export interface AccountState extends Account {
  loading: boolean
  accountError?: ErrorPayload
  transactions: Transaction[]
  transactionsError?: ErrorPayload
}
