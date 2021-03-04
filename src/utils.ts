import { JWTError } from "./auth/errors";

export const getJWTErrorByCode = (errorCode: JWTError) => ({ extensions }) =>
  extensions?.exception?.code === errorCode;
