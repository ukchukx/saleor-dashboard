import { IMessageContext } from "@saleor/components/messages";
import { User } from "@saleor/fragments/types/User";
import useLocalStorage from "@saleor/hooks/useLocalStorage";
import ApolloClient from "apollo-client";
import { MutableRefObject } from "react";
import { IntlShape } from "react-intl";

import { AUTH_PLUGIN_STORAGE_KEY } from "../utils";
import { useExternalAuthProvider } from "./useExternalAuthProvider";
import { useSaleorAuthProvider } from "./useSaleorAuthProvider";

export interface UseAuthProvider {
  logout: () => void;
  tokenAuthLoading: boolean;
  tokenVerifyLoading: boolean;
  user?: User;
  autologinPromise?: MutableRefObject<Promise<any>>;
}
export interface UseAuthProviderOpts {
  intl: IntlShape;
  notify: IMessageContext;
  apolloClient: ApolloClient<any>;
}

export function useAuthProvider(opts: UseAuthProviderOpts) {
  const [authPluginData, setAuthPluginData] = useLocalStorage(
    AUTH_PLUGIN_STORAGE_KEY,
    {
      plugin: undefined
    }
  );

  const handleSetAuthPlugin = (plugin?: string) =>
    setAuthPluginData({ plugin });

  const providerOpts = {
    authPlugin: authPluginData.plugin,
    setAuthPlugin: handleSetAuthPlugin,
    ...opts
  };

  const saleorAuth = useSaleorAuthProvider(providerOpts);

  const externalAuth = useExternalAuthProvider(providerOpts);

  const loginAuth = {
    login: saleorAuth.login,
    loginByExternalPlugin: externalAuth.loginByExternalPlugin,
    loginByToken: saleorAuth.loginByToken,
    requestLoginByExternalPlugin: externalAuth.requestLoginByExternalPlugin
  };

  if (authPluginData.plugin) {
    return {
      ...externalAuth,
      ...loginAuth
    };
  }

  return {
    ...saleorAuth,
    ...loginAuth
  };
}
