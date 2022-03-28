import React, { useState } from 'react'
import { render } from 'react-dom'
import { Provider, useStore, useSelector } from 'react-redux'
import { Store } from 'webext-redux'

const App = () => {
  const store = useStore()
  const [rawMnemonic, setRawMnemonic] = useState('')
  const onClick = ev => {
    store.dispatch({ type: 'counter/incremented' }).then(() => console.log(store.getState().counterReducer))
  }
  // const val = useSelector(state => state.value)
  const wallets = useSelector(state => state.walletReducer.wallets)
  return (
    <div>
      Enter your keyphrase
      <input value={rawMnemonic} onChange={e => setRawMnemonic(e.target.value)} />
      <button onClick={onClick}>Open my wallet</button>
      {wallets.map((w, i) => <div key={i}>Wallet: {w.address}</div>)}
    </div>
  )
}

const store = new Store()

// wait for the store to connect to the background page
store.ready().then(() => {
  // The store implements the same interface as Redux's store
  // so you can use tools like `react-redux` no problem!
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  )
})
