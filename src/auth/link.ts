import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-client-preset";
import { fromPromise } from "apollo-link";
import { setContext } from "apollo-link-context";
import { ErrorResponse, onError } from "apollo-link-error";
import { MutationOptions } from "react-apollo";

import {
  getAuthPluginFromStorage,
  getTokens,
  removeTokens,
  setAuthToken
} from ".";
import { JWTError } from "./errors";
import {
  externalTokenRefreshMutation,
  tokenRefreshMutation
} from "./mutations";
import { ExternalRefreshToken } from "./types/ExternalRefreshToken";
import { ExternalVerifyTokenVariables } from "./types/ExternalVerifyToken";
import { RefreshToken, RefreshTokenVariables } from "./types/RefreshToken";

type ClientApollo = ApolloClient<NormalizedCacheObject>;

export interface ResponseError extends ErrorResponse {
  networkError?: Error & {
    statusCode?: number;
    bodyText?: string;
  };
}

const isExternalAuth = () => !!getAuthPluginFromStorage();

const getJWTErrorByCode = (errorCode: JWTError) => ({ extensions }) =>
  extensions?.exception?.code === errorCode;

function refreshToken(apolloClient: ClientApollo) {
  const authPlugin = getAuthPluginFromStorage();
  const token = getTokens().refresh;

  const externalMutationData: MutationOptions<
    ExternalRefreshToken,
    ExternalVerifyTokenVariables
  > = {
    mutation: externalTokenRefreshMutation,
    variables: {
      input: JSON.stringify({ refreshToken: token }),
      pluginId: authPlugin
    }
  };

  const internalMutationData: MutationOptions<
    RefreshToken,
    RefreshTokenVariables
  > = {
    mutation: tokenRefreshMutation,
    variables: {
      token
    }
  };

  const mutationData = isExternalAuth()
    ? externalMutationData
    : internalMutationData;

  // @ts-ignore
  return apolloClient.mutate(mutationData);
}

const extractTokenFromTokenRefresh = function<
  T = RefreshToken | ExternalRefreshToken
>(data: T): string | null {
  // data needs conversion to unknown first in order to be converted to proper type
  return ((data as unknown) as RefreshToken).tokenRefresh
    ? ((data as unknown) as RefreshToken).tokenRefresh.token
    : ((data as unknown) as ExternalRefreshToken).externalRefresh.token;
};

export const errorLink = (apolloClient: ClientApollo) =>
  onError(
    ({ graphQLErrors, networkError, operation, forward }: ResponseError) => {
      console.log(111, { apolloClient });
      if (!!graphQLErrors) {
        const isUnauthorized = networkError?.statusCode === 401;

        const isTokenInvalid = graphQLErrors.some(
          getJWTErrorByCode(JWTError.invalid)
        );

        const isTokenExpired = graphQLErrors.some(
          getJWTErrorByCode(JWTError.expired)
        );

        if (isUnauthorized || isTokenInvalid) {
          removeTokens();
        }

        if (isTokenExpired) {
          return fromPromise(refreshToken(apolloClient)).flatMap(data => {
            setAuthToken(extractTokenFromTokenRefresh(data), false);
            return forward(operation);
          });
        }
      }
    }
  );

export const tokenLink = setContext((_, context) => {
  const authToken = getTokens().auth;

  return {
    ...context,
    headers: {
      ...context.headers,
      Authorization: authToken ? `JWT ${authToken}` : null
    }
  };
});
