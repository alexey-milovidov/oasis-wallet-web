import * as oasis from '@oasisprotocol/client'
import { Account } from 'app/state/account/types'
import { DebondingDelegation, Delegation, Validator } from 'app/state/staking/types'
import { Transaction, TransactionType } from 'app/state/transaction/types'
import { parseStringValueToInt } from 'app/lib/helpers'
import {
  AccountsApi,
  AccountsRow,
  Configuration,
  DelegationRow,
  DebondingDelegationRow,
  OperationsListApi,
  ValidatorRow,
  OperationsRow,
  OperationsRowMethodEnum,
} from 'vendors/oasisscan/index'

import { throwAPIErrors, sortByStatus } from './helpers'

export function getOasisscanAPIs(url: string | 'https://api.oasisscan.com/mainnet') {
  const explorerConfig = new Configuration({
    basePath: url,
    ...throwAPIErrors,
  })

  const accounts = new AccountsApi(explorerConfig)
  const operations = new OperationsListApi(explorerConfig)

  async function getAccount(address: string): Promise<Account> {
    const account = await accounts.getAccount({ accountId: address })
    if (!account || account.code !== 0) throw new Error('Wrong response code') // TODO
    return parseAccount(account.data)
  }

  async function getAllValidators(): Promise<Validator[]> {
    const validators = await accounts.getValidatorsList({ pageSize: 500 })
    if (!validators || validators.code !== 0) throw new Error('Wrong response code') // TODO
    return parseValidatorsList(validators.data.list)
  }

  async function getTransactionsList(params: { accountId: string; limit: number }): Promise<Transaction[]> {
    const transactionsList = await operations.getTransactionsList({
      address: params.accountId,
      size: params.limit,
      runtime: false,
    })
    if (!transactionsList || transactionsList.code !== 0) throw new Error('Wrong response code') // TODO
    return parseTransactionsList(transactionsList.data.list)
  }

  async function getDelegations(params: { accountId: string; nic: oasis.client.NodeInternal }): Promise<{
    delegations: Delegation[]
    debonding: DebondingDelegation[]
  }> {
    const delegations = await accounts.getDelegations({ address: params.accountId, size: 500 })
    const debonding = await accounts.getDebondingDelegations({ address: params.accountId, size: 500 })
    if (!delegations || delegations.code !== 0) throw new Error('Wrong response code') // TODO
    if (!debonding || debonding.code !== 0) throw new Error('Wrong response code') // TODO

    return {
      delegations: parseDelegations(delegations.data.list),
      debonding: parseDebonding(debonding.data.list),
    }
  }

  return { accounts, operations, getAccount, getAllValidators, getTransactionsList, getDelegations }
}

export function parseAccount(account: AccountsRow): Account {
  return {
    address: account.address,
    available: parseStringValueToInt(account.available),
    delegations: parseStringValueToInt(account.escrow),
    debonding: parseStringValueToInt(account.debonding),
    total: parseStringValueToInt(account.total),
  }
}

export function parseValidatorsList(validators: ValidatorRow[]): Validator[] {
  return validators
    .map(v => {
      const parsed: Validator = {
        address: v.entityAddress,
        name: v.name ?? undefined,
        nodeAddress: v.nodeAddress,
        escrow: parseStringValueToInt(v.escrow),
        current_rate: v.commission,
        status: v.status ? 'active' : 'inactive',
        media: {
          email_address: v.email ?? undefined,
          logotype: v.icon ?? undefined,
          twitter_acc: v.twitter ?? undefined,
          website_link: v.website ?? undefined,
        },
        rank: v.rank,
      }
      return parsed
    })
    .sort(sortByStatus)
}

export const transactionMethodMap: { [k in OperationsRowMethodEnum]: TransactionType } = {
  [OperationsRowMethodEnum.StakingTransfer]: TransactionType.StakingTransfer,
  [OperationsRowMethodEnum.StakingTransfer]: TransactionType.StakingTransfer,
  [OperationsRowMethodEnum.StakingAddEscrow]: TransactionType.StakingAddEscrow,
  [OperationsRowMethodEnum.StakingReclaimEscrow]: TransactionType.StakingReclaimEscrow,
  [OperationsRowMethodEnum.StakingAmendCommissionSchedule]: TransactionType.StakingAmendCommissionSchedule,
  [OperationsRowMethodEnum.StakingAllow]: TransactionType.StakingAllow,
  [OperationsRowMethodEnum.StakingWithdraw]: TransactionType.StakingWithdraw,
  [OperationsRowMethodEnum.RoothashExecutorCommit]: TransactionType.RoothashExecutorCommit,
  [OperationsRowMethodEnum.RoothashExecutorProposerTimeout]: TransactionType.RoothashExecutorProposerTimeout,
  [OperationsRowMethodEnum.RegistryRegisterEntity]: TransactionType.RegistryRegisterEntity,
  [OperationsRowMethodEnum.RegistryRegisterNode]: TransactionType.RegistryRegisterNode,
  [OperationsRowMethodEnum.RegistryRegisterRuntime]: TransactionType.RegistryRegisterRuntime,
  [OperationsRowMethodEnum.GovernanceCastVote]: TransactionType.GovernanceCastVote,
  [OperationsRowMethodEnum.GovernanceSubmitProposal]: TransactionType.GovernanceSubmitProposal,
  [OperationsRowMethodEnum.BeaconPvssCommit]: TransactionType.BeaconPvssCommit,
  [OperationsRowMethodEnum.BeaconPvssReveal]: TransactionType.BeaconPvssReveal,
  [OperationsRowMethodEnum.BeaconVrfProve]: TransactionType.BeaconVrfProve,
}

export function parseTransactionsList(transactionsList: OperationsRow[]): Transaction[] {
  return transactionsList.map(t => {
    const parsed: Transaction = {
      amount: t.amount == null ? undefined : parseStringValueToInt(t.amount),
      fee: parseStringValueToInt(t.fee),
      from: t.from,
      hash: t.txHash,
      level: t.height,
      status: t.status,
      timestamp: t.timestamp,
      to: t.to ?? undefined,
      type: transactionMethodMap[t.method],
    }
    return parsed
  })
}

export function parseDelegations(delegations: DelegationRow[]): Delegation[] {
  return delegations.map(delegation => {
    const parsed: Delegation = {
      amount: parseStringValueToInt(delegation.amount).toString(),
      shares: parseStringValueToInt(delegation.shares).toString(),
      validatorAddress: delegation.validatorAddress,
    }
    return parsed
  })
}
export function parseDebonding(debonding: DebondingDelegationRow[]): DebondingDelegation[] {
  return debonding.map(debonding => {
    // TODO: use amount field, or share price when it is available. Until then,
    // using price=1 is inaccurate if debonding pool gets slashed.
    const sharePrice = 1
    const parsed: DebondingDelegation = {
      amount: (parseStringValueToInt(debonding.shares) * sharePrice).toString(),
      shares: parseStringValueToInt(debonding.shares).toString(),
      validatorAddress: debonding.validatorAddress,
      epoch: debonding.debondEnd,
    }
    return parsed
  })
}
