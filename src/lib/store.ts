import { create } from "zustand";
import { type APIUser } from "discord-api-types/v10";

interface TokenState {
  tokens: string[];
  addTokens: (tokens: string[]) => void;
  removeToken: (token: string) => void;
  setTokens: (tokens: string[]) => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  tokens: [],
  addTokens: (tokens: string[]) =>
    set((state) => ({ tokens: [...new Set([...state.tokens, ...tokens])] })),
  removeToken: (token: string) =>
    set((state) => ({ tokens: state.tokens.filter((t) => t !== token) })),
  setTokens: (tokens: string[]) =>
    set(() => ({ tokens: [...new Set(tokens)] })),
}));

export type Account = {
  user: APIUser & { phone?: string };
  tokens: string[];
};

interface AccountState {
  accounts: Account[];
  addAccount: (account: Account) => void;
  removeAccount: (account: Account) => void;
  addAccounts: (accounts: Account[]) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  addAccount: (account) =>
    set((state) => {
      const existingAccount = state.accounts.find(
        (acc) => acc.user.id === account.user.id
      );
      if (existingAccount) {
        return {
          accounts: state.accounts.map((acc) => {
            if (acc.user.id === account.user.id) {
              return {
                ...acc,
                tokens: [...acc.tokens, ...account.tokens],
              };
            }

            return acc;
          }),
        };
      }

      return { accounts: [...state.accounts, account] };
    }),
  removeAccount: (account) =>
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc !== account),
    })),
  addAccounts: (accounts) =>
    set((state) => ({ accounts: [...state.accounts, ...accounts] })),
}));
