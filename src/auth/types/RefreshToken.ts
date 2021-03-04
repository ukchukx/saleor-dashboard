/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { AccountErrorCode } from "./../../types/globalTypes";

// ====================================================
// GraphQL mutation operation: RefreshToken
// ====================================================

export interface RefreshToken_tokenRefresh_errors {
  __typename: "AccountError";
  code: AccountErrorCode;
  field: string | null;
  message: string | null;
}

export interface RefreshToken_tokenRefresh {
  __typename: "RefreshToken";
  token: string | null;
  errors: RefreshToken_tokenRefresh_errors[];
}

export interface RefreshToken {
  tokenRefresh: RefreshToken_tokenRefresh | null;
}

export interface RefreshTokenVariables {
  token: string;
}
