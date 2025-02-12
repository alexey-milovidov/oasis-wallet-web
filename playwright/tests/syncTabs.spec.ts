import { test, expect, Page, Route } from '@playwright/test'
import { mockApi } from '../utils/mockApi'
import { warnSlowApi } from '../utils/warnSlowApi'
import { expectNoFatal } from '../utils/expectNoFatal'
import {
  password,
  privateKeyAddress,
  privateKeyAddressPretty,
  privateKey2,
  privateKey2AddressPretty,
} from '../utils/test-inputs'
import { addPersistedStorage, clearPersistedStorage } from '../utils/storage'
import { fillPrivateKeyWithoutPassword, fillPrivateKeyAndPassword } from '../utils/fillPrivateKey'

test.beforeEach(async ({ context, page }) => {
  await warnSlowApi(context)
  await mockApi(context, 0)
  await clearPersistedStorage(page)
})

test.afterEach(async ({ context }, testInfo) => {
  await expectNoFatal(context, testInfo)
})

test.describe('syncTabs', () => {
  test.describe('lock second tab after locking wallet', () => {
    test('unpersisted', async ({ page, context }) => {
      await page.goto('/open-wallet/private-key')
      await fillPrivateKeyWithoutPassword(page, {
        persistenceCheckboxChecked: false,
        persistenceCheckboxDisabled: false,
      })
      await expect(page.getByTestId('account-selector')).toBeVisible()

      const tab2 = await context.newPage()
      await testLockingIsSynced(page, tab2)
    })

    test('persisted', async ({ page, context }) => {
      await page.goto('/open-wallet/private-key')
      await fillPrivateKeyAndPassword(page)
      await expect(page.getByTestId('account-selector')).toBeVisible()

      const tab2 = await context.newPage()
      await testLockingIsSynced(page, tab2)
      await expect(page.getByRole('button', { name: 'Unlock' })).toBeVisible()
      await expect(tab2.getByRole('button', { name: 'Unlock' })).toBeVisible()
    })

    test('incognito', async ({ page, context }) => {
      await addPersistedStorage(page)
      await page.goto('/')
      await page.getByRole('button', { name: 'Continue without the profile' }).click()
      await expect(page.getByTestId('account-selector')).toBeHidden()

      const tab2 = await context.newPage()
      await tab2.goto('/')
      await expect(tab2.getByRole('button', { name: 'Unlock' })).toBeHidden()
      await tab2.goto('/open-wallet/private-key')
      await fillPrivateKeyWithoutPassword(tab2, {
        persistenceCheckboxChecked: false,
        persistenceCheckboxDisabled: true,
      })
      await expect(tab2.getByTestId('account-selector')).toBeVisible()
      await expect(page.getByTestId('account-selector')).toBeVisible()

      await testLockingIsSynced(page, tab2)
      await expect(page.getByRole('button', { name: 'Unlock' })).toBeVisible()
      await expect(tab2.getByRole('button', { name: 'Unlock' })).toBeVisible()
    })

    async function testLockingIsSynced(page: Page, tab2: Page) {
      // Second tab should sync the opened wallet
      await tab2.goto('/')
      await expect(tab2.getByTestId('account-selector')).toBeVisible()
      await tab2.getByRole('link', { name: 'Wallet' }).click()
      await expect(tab2).toHaveURL(new RegExp(`/account/${privateKeyAddress}`))
      await expect(tab2.getByTestId('account-balance-summary')).toContainText('ROSE')

      // Second tab should not get stuck on loading after first tab closes wallet
      await page.getByRole('button', { name: /(Close wallet)|(Lock profile)/ }).click()
      await expect(page.getByText('Loading account')).toBeHidden()
      await expect(page.getByTestId('account-selector')).toBeHidden()
      await expect(tab2.getByText('Loading account')).toBeHidden()
      await expect(tab2.getByTestId('account-selector')).toBeHidden()
    }
  })

  test.describe('switch network and open second tab', () => {
    test('unpersisted', async ({ page, context }) => {
      await page.goto('/open-wallet/private-key')
      await fillPrivateKeyWithoutPassword(page, {
        persistenceCheckboxChecked: false,
        persistenceCheckboxDisabled: false,
      })
      const tab2 = await context.newPage()
      await testSyncingNetwork(page, tab2)
    })

    test('persisted', async ({ page, context }) => {
      await addPersistedStorage(page)
      await page.goto('/')
      await page.getByPlaceholder('Enter your password here').fill(password)
      await page.keyboard.press('Enter')
      const tab2 = await context.newPage()
      await testSyncingNetwork(page, tab2)
    })

    test('incognito', async ({ page, context }) => {
      await addPersistedStorage(page)
      await page.goto('/')
      await page.getByRole('button', { name: 'Continue without the profile' }).click()
      const tab2 = await context.newPage()
      await tab2.goto('/open-wallet/private-key')
      await fillPrivateKeyWithoutPassword(tab2, {
        persistenceCheckboxChecked: false,
        persistenceCheckboxDisabled: true,
      })
      await testSyncingNetwork(page, tab2)
    })

    async function testSyncingNetwork(page: Page, tab2: Page) {
      await expect(page.getByTestId('network-selector')).toHaveText('Mainnet')
      await page.getByTestId('network-selector').click()
      await page.getByRole('menuitem', { name: 'Testnet' }).click()
      await expect(page.getByTestId('network-selector')).toHaveText('Testnet')

      await tab2.goto('/')
      await expect(tab2.getByTestId('account-selector')).toBeVisible()
      await expect(page.getByTestId('network-selector')).toHaveText('Testnet')
      await expect(tab2.getByTestId('network-selector')).toHaveText('Testnet')

      await page.getByTestId('network-selector').click()
      await page.getByRole('menuitem', { name: 'Mainnet' }).click()
      await expect(page.getByTestId('network-selector')).toHaveText('Mainnet')
      await expect(tab2.getByTestId('network-selector')).toHaveText('Mainnet')
    }
  })

  test.describe('switching account should not sync', () => {
    test('unpersisted', async ({ page, context }) => {
      await page.goto('/open-wallet/private-key')
      await fillPrivateKeyWithoutPassword(page, {
        persistenceCheckboxChecked: false,
        persistenceCheckboxDisabled: false,
      })
      const tab2 = await context.newPage()
      await testSelectedAccountNotSync(page, tab2)
    })

    test('persisted', async ({ page, context }) => {
      await addPersistedStorage(page)
      await page.goto('/')
      await page.getByPlaceholder('Enter your password here').fill(password)
      await page.keyboard.press('Enter')
      const tab2 = await context.newPage()
      await testSelectedAccountNotSync(page, tab2)
    })

    test('incognito', async ({ page, context }) => {
      await addPersistedStorage(page)
      await page.goto('/')
      await page.getByRole('button', { name: 'Continue without the profile' }).click()
      const tab2 = await context.newPage()
      await tab2.goto('/open-wallet/private-key')
      await fillPrivateKeyWithoutPassword(tab2, {
        persistenceCheckboxChecked: false,
        persistenceCheckboxDisabled: true,
      })
      await testSelectedAccountNotSync(page, tab2)
    })

    async function testSelectedAccountNotSync(page: Page, tab2: Page) {
      await tab2.goto('/')
      await tab2.getByTestId('account-selector').click()
      await expect(tab2.getByRole('checkbox', { checked: true })).toContainText(privateKeyAddressPretty) // Synced on load

      await page.getByRole('link', { name: /Home/ }).click()
      await page.getByRole('button', { name: /Open wallet/ }).click()
      await page.getByRole('button', { name: /Private key/ }).click()
      await page.getByPlaceholder('Enter your private key here').fill(privateKey2)
      await page.keyboard.press('Enter')
      await page.getByTestId('account-selector').click()

      await expect(page.getByRole('checkbox', { checked: true })).toContainText(privateKey2AddressPretty)
      await expect(tab2.getByRole('checkbox', { checked: true })).toContainText(privateKeyAddressPretty) // Not synced

      await page.getByRole('checkbox', { name: new RegExp(privateKeyAddressPretty) }).click()
      await page.getByTestId('account-selector').click()
      await page.getByRole('checkbox', { name: new RegExp(privateKey2AddressPretty) }).click()
      await page.getByTestId('account-selector').click()

      await expect(page.getByRole('checkbox', { checked: true })).toContainText(privateKey2AddressPretty)
      await expect(tab2.getByRole('checkbox', { checked: true })).toContainText(privateKeyAddressPretty) // Not synced

      await tab2.goto('/')
      await tab2.getByTestId('account-selector').click()
      await expect(tab2.getByRole('checkbox', { checked: true })).toContainText(privateKey2AddressPretty) // Synced on load
    }
  })

  test('TODO opening from private key and locking in second tab should not crash', async ({
    page,
    context,
  }) => {
    // TODO: https://github.com/oasisprotocol/oasis-wallet-web/pull/975#discussion_r1019567305
    test.fail()

    await addPersistedStorage(page)
    await page.goto('/')
    await page.getByPlaceholder('Enter your password here').fill(password)
    await page.keyboard.press('Enter')
    await page.getByRole('link', { name: /Home/ }).click()
    await page.getByRole('button', { name: /Open wallet/ }).click()
    await page.getByRole('button', { name: /Private key/ }).click()
    const tab2 = await context.newPage()
    await tab2.goto('/')

    // Delay getBalance so addWallet is called after wallet is locked.
    let grpcBalance: Route
    await page.route('**/oasis-core.Staking/Account', route => (grpcBalance = route))

    await page.getByPlaceholder('Enter your private key here').fill(privateKey2)
    await page.keyboard.press('Enter')
    await tab2.getByRole('button', { name: /Lock profile/ }).click()
    await grpcBalance!.fulfill({
      contentType: 'application/grpc-web-text+proto',
      body: 'AAAAAAGggAAAAB5ncnBjLXN0YXR1czowDQpncnBjLW1lc3NhZ2U6DQo=',
    })

    await expect(page.getByTestId('fatalerror-stacktrace')).toBeHidden()
  })
})
