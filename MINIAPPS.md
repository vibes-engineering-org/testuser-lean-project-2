# Farcaster Mini Apps SDK Reference

This document provides a comprehensive reference for the Farcaster Mini Apps SDK actions and features.

## SDK Actions

### ready

**Description:** Hides the Splash Screen. Must be called when your mini app is ready to be displayed.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
await sdk.actions.ready()
```

**Parameters:**
- `disableNativeGestures` (optional, boolean, default: `false`): Disable native gestures. Use this if your frame uses gestures that conflict with native gestures like swipe to dismiss.

**Return Value:** `void`

**Notes:** This is required and should be called on mount. Never remove this effect from your app initialization.

---

### close

**Description:** Closes the mini app.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
await sdk.actions.close()
```

**Return Value:** `void`

---

### addMiniApp

**Description:** Prompts the user to add the app to their Farcaster Mini Apps collection.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
await sdk.actions.addMiniApp()
```

**Return Value:** `void`

**Requirements:**
- App's domain must exactly match the domain in the manifest file
- Cannot use tunnel domains (ngrok, localtunnel)
- App must be deployed to the domain specified in `farcaster.json`
- For local development, use the preview tool

**Errors:**
- `RejectedByUser`: User declined to add the Mini App
- `InvalidDomainManifestJson`: Issues with manifest file (tunnel domain, domain mismatch, missing/malformed manifest)

---

### signIn

**Description:** Request a "Sign in with Farcaster (SIWF)" credential from the user, enabling authentication for a mini app.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
const result = await sdk.actions.signIn({
  nonce,
  acceptAuthAddress: true
})
```

**Parameters:**
- `nonce` (string, required): A random string to prevent replay attacks. Must be at least 8 alphanumeric characters.
- `acceptAuthAddress` (boolean, default: `true`): Determines if an Auth Address signed message is acceptable. Set to `false` if verification method doesn't support auth addresses.

**Return Value:**
```typescript
type SignInResult = {
  signature: string;
  message: string;
}
```

**Error Handling:**
```javascript
try {
  const result = await sdk.actions.signIn({ nonce, acceptAuthAddress: true })
} catch (error) {
  if (error.name === 'RejectedByUser') {
    // Handle user rejection
  }
}
```

**Notes:** Requires sending the message to your server for verification.

---

### composeCast

**Description:** Open the cast composer with a suggested cast. The user will be able to modify the cast before posting it.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
const result = await sdk.actions.composeCast({
  text,
  embeds,
  channelKey,
  parent,
  close,
})
```

**Parameters:**
- `text` (optional, string): Suggested text for the cast body. Supports mentions using @farcaster format.
- `embeds` (optional, array): Suggested embeds. Maximum of two embeds allowed.
- `parent` (optional): Suggested parent cast. Format: `{ type: 'cast'; hash: string }`
- `close` (optional, boolean): Determines if app should close after action.
- `channelKey` (optional, string): Specifies channel for cast posting.

**Return Value:**
```typescript
{
  cast: {
    hash: string;
    channelKey?: string;
  } | null
}
```

**Example:**
```javascript
const result = await sdk.actions.composeCast({
  text: "I just learned how to compose a cast",
  embeds: ["https://miniapps.farcaster.xyz/docs/sdk/actions/compose-cast"],
  channelKey: "farcaster"
})

if (result?.cast) {
  console.log(result.cast.hash)
  console.log(result.cast.channelKey)
}
```

---

### openUrl

**Description:** Opens an external URL. Can be used to deeplink users within mobile Farcaster clients.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
// Pass URL as a string
await sdk.actions.openUrl(url)
// Or pass URL as an object
await sdk.actions.openUrl({ url: 'https://farcaster.xyz' })
```

**Parameters:**
- `url` (string): A string representing the web address to open.

**Return Value:** `void`

---

### viewProfile

**Description:** Displays a user's Farcaster profile.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
await sdk.actions.viewProfile({ fid })
```

**Parameters:**
- `fid` (number, required): Farcaster ID of the user whose profile to view.

**Return Value:** `void`

---

### viewCast

**Description:** Open a specific cast in the Farcaster client. This navigates the user to view the full cast with its replies and reactions.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
await sdk.actions.viewCast({
  hash: castHash,
  close: true // optional
})
```

**Parameters:**
- `hash` (string, required): The hash of the cast to view from the Farcaster protocol.
- `close` (boolean, optional): Whether the app should close after opening the cast view.

**Return Value:** `Promise<void>`

---

### swapToken

**Description:** Open the swap form with pre-filled tokens. The user will be able to modify the swap before executing the transaction.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
await sdk.actions.swapToken({
  sellToken,
  buyToken,
  sellAmount,
})
```

**Parameters:**
- `sellToken` (optional, string): CAIP-19 asset ID (e.g., `"eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`)
- `buyToken` (optional, string): CAIP-19 asset ID (e.g., `"eip155:10/native"`)
- `sellAmount` (optional, string): Sell token amount as numeric string (e.g., `"1000000"` for 1 USDC)

**Return Value:**
```typescript
// Successful swap
{
  success: true;
  swap: {
    // transaction identifiers
  }
}

// Failed swap
{
  success: false;
  reason: string; // e.g., "rejected_by_user"
  error?: any;
}
```

---

### sendToken

**Description:** Open the send form with a pre-filled token and recipient. The user will be able to modify the send before executing the transaction.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
await sdk.actions.sendToken({
  token,
  amount,
  recipientFid,
  recipientAddress,
})
```

**Parameters:**
- `token` (optional, string): CAIP-19 asset ID (e.g., `"eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`)
- `amount` (optional, string): Token amount as numeric string (e.g., `"1000000"` for 1 USDC)
- `recipientAddress` (optional, string): Recipient's blockchain address (e.g., `"0xd8da6bf26964af9d7eed9e03e53415d37aa96045"`)
- `recipientFid` (optional, number): Recipient's Farcaster ID (e.g., `3`)

**Return Value:**
```typescript
// Successful send
{
  success: true;
  // transaction details
}

// Failed send
{
  success: false;
  reason: string; // e.g., "rejected_by_user", "send_failed"
  error?: any;
}
```

---

### viewToken

**Description:** Displays a token.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'
await sdk.actions.viewToken({ token })
```

**Parameters:**
- `token` (string, required): CAIP-19 asset ID (e.g., `"eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`)

**Return Value:** `void`

---

## Haptics

Provides haptic feedback to enhance user interactions through physical sensations. The haptics API includes three methods for different types of feedback: impact, notification, and selection.

**Usage:**
```javascript
import { sdk } from '@farcaster/miniapp-sdk'

// Trigger impact feedback
await sdk.haptics.impactOccurred('medium')

// Trigger notification feedback
await sdk.haptics.notificationOccurred('success')

// Trigger selection feedback
await sdk.haptics.selectionChanged()
```

### impactOccurred

Triggers impact feedback, useful for simulating physical impacts.

**Parameters:**
- `type`: `'light' | 'medium' | 'heavy' | 'soft' | 'rigid'`
  - `light`: A light impact
  - `medium`: A medium impact
  - `heavy`: A heavy impact
  - `soft`: A soft, dampened impact
  - `rigid`: A sharp, rigid impact

**Example:**
```javascript
// Trigger when user taps a button
await sdk.haptics.impactOccurred('light')

// Trigger for more significant actions
await sdk.haptics.impactOccurred('heavy')
```

---

### notificationOccurred

Triggers notification feedback, ideal for indicating task outcomes.

**Parameters:**
- `type`: `'success' | 'warning' | 'error'`
  - `success`: Indicates a successful operation
  - `warning`: Indicates a warning or caution
  - `error`: Indicates an error or failure

**Example:**
```javascript
// After successful action
await sdk.haptics.notificationOccurred('success')

// When showing a warning
await sdk.haptics.notificationOccurred('warning')

// On error
await sdk.haptics.notificationOccurred('error')
```

---

### selectionChanged

Triggers selection feedback, perfect for UI element selections.

**Example:**
```javascript
// When user selects an item from a list
await sdk.haptics.selectionChanged()

// When toggling a switch
await sdk.haptics.selectionChanged()
```

---

### Haptics Availability

Haptic feedback availability depends on the client device and platform. You can check if haptics are supported using the `getCapabilities()` method:

```javascript
import { sdk } from '@farcaster/miniapp-sdk'

const capabilities = await sdk.getCapabilities()

// Check if specific haptic methods are supported
if (capabilities.includes('haptics.impactOccurred')) {
  await sdk.haptics.impactOccurred('medium')
}

if (capabilities.includes('haptics.notificationOccurred')) {
  await sdk.haptics.notificationOccurred('success')
}

if (capabilities.includes('haptics.selectionChanged')) {
  await sdk.haptics.selectionChanged()
}
```

### Best Practices

- **Match intensity to action**: Use light feedback for minor actions, heavy for significant ones
- **Provide visual feedback too**: Not all devices support haptics
- **Check availability**: Always verify haptic support before using
- **Consider context**: Some users may have haptics disabled in their device settings
- **Use frequently**: Haptics can be used frequently to enhance user experience and provide physical feedback for interactions