# FPDAO UI

Shared FPDAO UI components

## How to start using fpdao-ui

1. Run `npm install fpdao-ui`

2. Add `"./node_modules/fpdao-ui/**/*"` to `content` in `tailwind.config.cjs`

3. Create AuthStore
```js
import { AuthStore, createAuthStore } from 'fpdao-ui/auth-store';

let authStore = createAuthStore({
  whitelist: [], // canister ids...
  host: process.env.DFX_NETWORK !== "ic" ? "http://localhost:4943" : "https://icp0.io",
});
```

4. In `App.svelte` check wallet connections
```js
onMount(async () => {
  await authStore.checkConnections();
});
```

## Include styles
```js
import "fpdao-ui/styles/global.css";
```

## Use svelte componentes
```js
import Footer from "fpdao-ui/components/Footer.svelte";

<Footer {authState}></Footer>
```

## Include favicon
```html
<link rel="icon" type="image/svg+xml" href="/node_modules/fpdao-ui/images/fpd-logo.svg" />
```

## Transfer ICP using a connected wallet
```js
await authStore.transfer("<account-id>", <amount-e8s>);
```