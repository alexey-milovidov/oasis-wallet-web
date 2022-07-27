/* tslint:disable */
/* eslint-disable */
/**
 * Oasisscan API
 * https://github.com/bitcat365/oasisscan-backend#readme
 *
 * The version of the OpenAPI document: 1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface OperationsRow
 */
export interface OperationsRow {
    /**
     * 
     * @type {string}
     * @memberof OperationsRow
     */
    txHash: string;
    /**
     * 
     * @type {number}
     * @memberof OperationsRow
     */
    height: number;
    /**
     * 
     * @type {string}
     * @memberof OperationsRow
     */
    method: OperationsRowMethodEnum;
    /**
     * 
     * @type {string}
     * @memberof OperationsRow
     */
    fee: string;
    /**
     * 
     * @type {string}
     * @memberof OperationsRow
     */
    amount: string | null;
    /**
     * 
     * @type {string}
     * @memberof OperationsRow
     */
    shares?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof OperationsRow
     */
    add: boolean;
    /**
     * 
     * @type {number}
     * @memberof OperationsRow
     */
    timestamp: number;
    /**
     * 
     * @type {number}
     * @memberof OperationsRow
     */
    time: number;
    /**
     * 
     * @type {boolean}
     * @memberof OperationsRow
     */
    status: boolean;
    /**
     * 
     * @type {string}
     * @memberof OperationsRow
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof OperationsRow
     */
    to: string | null;
    /**
     * ParaTime only
     * @type {string}
     * @memberof OperationsRow
     */
    runtimeId?: string;
}

/**
* @export
* @enum {string}
*/
export enum OperationsRowMethodEnum {
    StakingTransfer = 'staking.Transfer',
    StakingAddEscrow = 'staking.AddEscrow',
    StakingReclaimEscrow = 'staking.ReclaimEscrow',
    StakingAmendCommissionSchedule = 'staking.AmendCommissionSchedule',
    StakingAllow = 'staking.Allow',
    StakingWithdraw = 'staking.Withdraw',
    RoothashExecutorCommit = 'roothash.ExecutorCommit',
    RoothashExecutorProposerTimeout = 'roothash.ExecutorProposerTimeout',
    RegistryRegisterEntity = 'registry.RegisterEntity',
    RegistryRegisterNode = 'registry.RegisterNode',
    RegistryRegisterRuntime = 'registry.RegisterRuntime',
    GovernanceCastVote = 'governance.CastVote',
    GovernanceSubmitProposal = 'governance.SubmitProposal',
    BeaconPvssCommit = 'beacon.PVSSCommit',
    BeaconPvssReveal = 'beacon.PVSSReveal',
    BeaconVrfProve = 'beacon.VRFProve'
}

export function OperationsRowFromJSON(json: any): OperationsRow {
    return OperationsRowFromJSONTyped(json, false);
}

export function OperationsRowFromJSONTyped(json: any, ignoreDiscriminator: boolean): OperationsRow {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'txHash': json['txHash'],
        'height': json['height'],
        'method': json['method'],
        'fee': json['fee'],
        'amount': json['amount'],
        'shares': !exists(json, 'shares') ? undefined : json['shares'],
        'add': json['add'],
        'timestamp': json['timestamp'],
        'time': json['time'],
        'status': json['status'],
        'from': json['from'],
        'to': json['to'],
        'runtimeId': !exists(json, 'runtimeId') ? undefined : json['runtimeId'],
    };
}

export function OperationsRowToJSON(value?: OperationsRow | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'txHash': value.txHash,
        'height': value.height,
        'method': value.method,
        'fee': value.fee,
        'amount': value.amount,
        'shares': value.shares,
        'add': value.add,
        'timestamp': value.timestamp,
        'time': value.time,
        'status': value.status,
        'from': value.from,
        'to': value.to,
        'runtimeId': value.runtimeId,
    };
}


