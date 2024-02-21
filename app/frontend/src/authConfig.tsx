// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogLevel } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: 'f01a7dc2-a3a4-4950-9bc6-38a37dd8724b',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: '/',
    postLogoutRedirectUri: '/',
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      }
    }
  }
};

export const loginRequest = {
  scopes: []
};

export const silentRequest = {
  scopes: ['openid', 'profile'],
  loginHint: 'example@domain.net'
};
