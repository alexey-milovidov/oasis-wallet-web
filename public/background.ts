import { wrapStore } from 'webext-redux'
import { applyMiddleware, compose, createStore, combineReducers } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { takeEvery, put, call } from 'typed-redux-saga'
import { createLogger } from 'redux-logger'
// src/app/state/wallet/saga.ts
import { hdkey } from '@oasisprotocol/client'
import { publicKeyToAddress, uint2hex } from 'app/lib/helpers'

const initialState /*: AccountState*/ = {
  address: '',
  liquid_balance: 0,

  accountError: null,
  transactions: [],
  transactionsError: null,
  loading: true,

  // webext-redux example
  value: 0,
}

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'counter/incremented':
      console.log('counter/incremented')
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

// TODO: createSlice from utils/@reduxjs/toolkit
// TODO: useInjectReducer
// TODO: src/state/wallet/types.ts
function walletReducer(state = { wallets: [] }, action) {
  switch (action.type) {
    case 'addWallet':
      return { wallets: [...state.wallets, action.payload] }
    default:
      return state
  }
}

function* rootWalletSaga() {
  console.log('rootWalletSaga')
  // Wait for an openWallet action (Mnemonic, Private Key, Ledger) and add them if requested
  yield* takeEvery('counter/incremented', openWalletFromMnemonic)
}

export function* openWalletFromMnemonic({ payload: mnemonic }: PayloadAction<string>) {
  console.log('openWalletFromMnemonic')

  const signer = yield* call(hdkey.HDKey.getAccountSigner, mnemonic)
  const privateKey = uint2hex(signer.secretKey)
  // const type = WalletType.Mnemonic
  const publicKeyBytes = signer.publicKey
  const publicKey = uint2hex(publicKeyBytes)

  const walletAddress = yield* call(publicKeyToAddress, publicKeyBytes!)
  // const balance = yield* call(getBalance, publicKeyBytes)

  yield* put({
    type: 'addWallet',
    payload: { address: walletAddress },
  })
}

const configureStore = ({ initialState, services }) => {
  // @ts-ignore
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose

  const middleware = [
    createLogger({
      collapsed: true,
      diff: true,
    }),
  ]
  const sagaMiddleware = createSagaMiddleware()
  const enhancer = composeEnhancers(applyMiddleware(...middleware, sagaMiddleware))

  const store = createStore(combineReducers({ counterReducer, walletReducer }), initialState, enhancer)

  let sagaTask = sagaMiddleware.run(rootWalletSaga, services)

  return store
}

const AuthService = undefined
const NotifyService = undefined

// let store = createStore(counterReducer)
const store = configureStore({ initialState, services: { AuthService, NotifyService } })

wrapStore(store)
