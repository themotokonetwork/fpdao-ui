import { writable, get, Writable, Readable, Updater, Subscriber, Invalidator, Unsubscriber } from "svelte/store";
import type { Principal } from "@dfinity/principal";
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { StoicIdentity } from "ic-stoic-identity";
import { AccountIdentifier } from "@dfinity/nns";
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";
import {
  ledger,
  createActor as createLedgerActor,
  idlFactory as ledgerIdlFactory,
  canisterId as ledgerCanisterId,
} from "./declarations/ledger";
import {createActor} from './create-actor';

export type AuthState = {
  isAuthed: "stoic" | "plug" | "bitfinity" | null;
  principal: Principal | null;
  accountId: string;
  isLoading: boolean;
  balance: number;
};

class AuthStoreClass implements Readable<AuthState> {
  state: Writable<AuthState>;
  whitelist: string[] = [];
  host: string = '';
  ledgerActor: typeof ledger;
  stoicIdentity: Identity & { accounts(): string };

  constructor({ host, whitelist }: { host?: string; whitelist?: string[]; }) {
    this.host = host || (process.env.DFX_NETWORK === "local" ? "http://localhost:4943" : "https://icp0.io");
    this.whitelist = whitelist || [];

    this.state = writable<AuthState>(this.getDefaultState());
    this.ledgerActor = createLedgerActor(ledgerCanisterId, {
      agentOptions: {host: this.host},
    });
  }

  getDefaultState(): AuthState {
    return {
      isAuthed: null,
      principal: null,
      accountId: "",
      isLoading: false,
      balance: 0,
    };
  }

  subscribe(run: Subscriber<AuthState>, invalidate?: Invalidator<AuthState>): Unsubscriber {
    return this.state.subscribe(run, invalidate);
  }

  update(updater: Updater<AuthState>) {
    return this.state.update(updater);
  }

  set(value: AuthState) {
    return this.state.set(value);
  }

  // create an actor using the currently connected wallet
  async createActor<T extends Actor>(canisterId: string, idlFactory: InterfaceFactory): Promise<T> {
    const store = get({ subscribe: this.state.subscribe });

    if (store.isAuthed === "stoic") {
      return createActor(canisterId, idlFactory, {
        agentOptions: {
          identity: this.stoicIdentity,
          host: this.host,
        },
      });
    }
    else if (store.isAuthed === "plug") {
      return (await window.ic?.plug.createActor({
        canisterId: ledgerCanisterId,
        interfaceFactory: idlFactory,
      })) as T;
    }
    else if (store.isAuthed === "bitfinity") {
      return (await window.ic.bitfinityWallet.createActor({
        canisterId: ledgerCanisterId,
        interfaceFactory: idlFactory,
        host: this.host,
      })) as T;
    }
    else {
      return createActor(canisterId, idlFactory, {
        agentOptions: {
          host: this.host,
        },
      });
    }
  }

  async checkConnections() {
    await this.checkStoicConnection();
    await this.checkPlugConnection();
    await this.checkBitfinityConnection();
  }

  async checkStoicConnection() {
    StoicIdentity.load().then(async (identity) => {
      if (identity !== false) {
        // ID is a already connected wallet!
        await this.stoicConnect();
      }
    });
  }

  async checkPlugConnection() {
    const connected = await window.ic?.plug?.isConnected();
    if (connected) {
      console.log("plug connection detected");
      await this.plugConnect();
    }
  }

  async checkBitfinityConnection() {
    const connected = await window.ic?.bitfinityWallet?.isConnected();
    if (connected) {
      console.log("bitfinity connection detected");
      await this.bitfinityConnect();
    }
  }

  async stoicConnect() {
    StoicIdentity.load().then(async (identity) => {
      if (identity !== false) {
        // ID is a already connected wallet!
      } else {
        // No existing connection, lets make one!
        identity = await StoicIdentity.connect();
      }
      this.stoicIdentity = identity;
      this.initStoic();
    });
  }

  async initStoic() {
    console.trace("initStoic");

    this.ledgerActor = createLedgerActor(ledgerCanisterId, {
      agentOptions: {
        identity: this.stoicIdentity,
        host: this.host,
      },
    });

    if (!this.ledgerActor) {
      console.warn("couldn't create actors");
      return;
    }

    // the stoic agent provides an `accounts()` method that returns
    // accounts assocaited with the principal
    let accounts = JSON.parse(await this.stoicIdentity.accounts());

    this.state.update((state) => ({
      ...state,
      principal: this.stoicIdentity.getPrincipal(),
      accountId: accounts[0].address, // we take the default account associated with the identity
      isAuthed: "stoic",
    }));

    await this.updateBalance();
  }

  async plugConnect() {
    // check if plug is installed in the browser
    if (window.ic?.plug === undefined) {
      window.open("https://plugwallet.ooo/", "_blank");
      return;
    }

    // check if plug is connected
    const plugConnected = await window.ic?.plug?.isConnected();
    if (!plugConnected) {
      try {
        await window.ic?.plug.requestConnect({
          whitelist: this.whitelist,
          host: this.host,
        });
        console.log("plug connected");
      } catch (e) {
        console.warn(e);
        return;
      }
    }

    await this.initPlug();
  }

  async initPlug() {
    // check wether agent is present
    // if not create it
    if (!window.ic?.plug?.agent) {
      console.warn("no agent found");
      const result = await window.ic?.plug?.createAgent({
        whitelist: this.whitelist,
        host: this.host,
      });
      result
        ? console.log("agent created")
        : console.warn("agent creation failed");
    }
    // check of if createActor method is available
    if (!window.ic?.plug?.createActor) {
      console.warn("no createActor found");
      return;
    }

    // Fetch root key for certificate validation during development
    if (process.env.DFX_NETWORK !== "ic") {
      await window.ic.plug.agent.fetchRootKey().catch((err) => {
        console.warn(
          "Unable to fetch root key. Check to ensure that your local replica is running"
        );
        console.error(err);
      });
    }

    const principal = await window.ic.plug.agent.getPrincipal();

    this.state.update((state) => ({
      ...state,
      principal,
      accountId: window.ic.plug.sessionManager.sessionData.accountId,
      isAuthed: "plug",
    }));

    await this.updateBalance();

    console.log("plug is authed");
  }

  async bitfinityConnect() {
    // check if bitfinity is installed in the browser
    if (window.ic?.bitfinityWallet === undefined) {
      window.open("https://wallet.infinityswap.one/", "_blank");
      return;
    }

    // check if bitfinity is connected
    const bitfinityConnected = await window.ic?.bitfinityWallet?.isConnected();
    if (!bitfinityConnected) {
      try {
        await window.ic?.bitfinityWallet.requestConnect({ whitelist: this.whitelist });
        console.log("bitfinity connected");
      } catch (e) {
        console.warn(e);
        return;
      }
    }

    await this.initBitfinity();
  }

  async initBitfinity() {
    this.ledgerActor = (await window.ic.bitfinityWallet.createActor({
      canisterId: ledgerCanisterId,
      interfaceFactory: ledgerIdlFactory,
      host: this.host,
    })) as typeof ledger;

    if (!this.ledgerActor) {
      console.warn("couldn't create actors");
      return;
    }

    const principal = await window.ic.bitfinityWallet.getPrincipal();
    const accountId = await window.ic.bitfinityWallet.getAccountID();

    this.state.update((state) => ({
      ...state,
      principal,
      accountId,
      isAuthed: "bitfinity",
    }));

    await this.updateBalance();

    console.log("bitfinity is authed");
  }

  async updateBalance() {
    const store = get({ subscribe: this.state.subscribe });
    let balance: number = 0;

    if (store.isAuthed === "plug") {
      let result = await window.ic.plug.requestBalance();
      let ICP = result.find((asset) => asset.symbol === "ICP");
      if (ICP) {
        balance = ICP.amount;
      }
    } else if (store.isAuthed === "stoic") {
      let res = await this.ledgerActor.account_balance({
        account: AccountIdentifier.fromHex(store.accountId).toNumbers(),
      });
      balance = Number(res.e8s / 100000000n);
    } else if (store.isAuthed === "bitfinity") {
      if (process.env.DFX_NETWORK !== "ic") {
        let res = await this.ledgerActor.account_balance({
          account: AccountIdentifier.fromHex(store.accountId).toNumbers(),
        });
        balance = Number(res.e8s / 100000000n);
      } else {
        let result = await window.ic.bitfinityWallet.getUserAssets();
        let ICP = result.find((asset) => asset.symbol === "ICP");
        if (ICP) {
          balance = Number(BigInt(ICP.balance) / 100000000n);
        }
      }
    }
    console.log("balance", balance);
    this.state.update((prevState) => ({ ...prevState, balance }));
  }

  async transfer(toAddress: string, amount: bigint) {
    const store = get({ subscribe: this.state.subscribe });

    if (store.isAuthed === "plug") {
      let height = await window.ic.plug.requestTransfer({
        to: toAddress,
        amount: Number(amount),
        opts: {
          fee: 10000,
        },
      });
      console.log("sent", height);
    } else if (store.isAuthed === "stoic" || store.isAuthed === "bitfinity") {
      console.log("transfer...");
      let res = await this.ledgerActor.transfer({
        from_subaccount: [],
        to: AccountIdentifier.fromHex(toAddress).toNumbers(),
        amount: { e8s: amount },
        fee: { e8s: 10000n },
        memo: 0n,
        created_at_time: [],
      });
      console.log("sent", res);
    }
    await this.updateBalance();
    console.log("updated balance");
  }

  async disconnect() {
    const store = get({ subscribe: this.state.subscribe });
    if (store.isAuthed === "stoic") {
      StoicIdentity.disconnect();
    } else if (store.isAuthed === "plug") {
      // awaiting this fails, promise never returns
      window.ic.plug.disconnect();
    } else if (store.isAuthed === "bitfinity") {
      await window.ic.bitfinityWallet.disconnect();
    }

    console.log("disconnected");

    this.state.update((prevState) => {
      return {
        ...this.getDefaultState(),
      };
    });
  }
}

declare global {
  interface Window {
    ic: {
      bitfinityWallet: {
        requestConnect: (options?: {
          whitelist?: string[];
          timeout?: number;
        }) => Promise<{ derKey: Uint8Array; rawKey: Uint8Array }>;
        isConnected: () => Promise<boolean>;
        createActor: (options: {
          canisterId: string;
          interfaceFactory: InterfaceFactory;
          host: string;
        }) => Promise<Actor>;
        getPrincipal: () => Promise<Principal>;
        disconnect: () => Promise<boolean>;
        getAccountID: () => Promise<string>;
        getUserAssets: () => Promise<
          {
            id: string;
            name: string;
            fee: string;
            symbol: string;
            balance: string;
            decimals: number;
            hide: boolean;
            isTestToken: boolean;
            logo: string;
            standard: string;
          }[]
        >;
      };
      plug: {
        agent: HttpAgent;
        sessionManager: {
          sessionData: {
            accountId: string;
          };
        };
        getPrincipal: () => Promise<Principal>;
        deleteAgent: () => void;
        requestConnect: (options?: {
          whitelist?: string[];
          host?: string;
        }) => Promise<any>;
        createActor: (options: {}) => Promise<Actor>;
        isConnected: () => Promise<boolean>;
        disconnect: () => Promise<void>;
        createAgent: (args?: {
          whitelist: string[];
          host?: string;
        }) => Promise<undefined>;
        requestBalance: () => Promise<
          Array<{
            amount: number;
            canisterId: string | null;
            image: string;
            name: string;
            symbol: string;
            value: number | null;
          }>
        >;
        requestTransfer: (arg: {
          to: string;
          amount: number;
          opts?: {
            fee?: number;
            memo?: string;
            from_subaccount?: number;
            created_at_time?: {
              timestamp_nanos: number;
            };
          };
        }) => Promise<{ height: number }>;
      };
    };
  }
}

export let createAuthStore = ({ host, whitelist }: { host?: string; whitelist?: string[]; }): AuthStore => {
  return new AuthStoreClass({host, whitelist});
}

export type AuthStore = AuthStoreClass & Readable<AuthState>;