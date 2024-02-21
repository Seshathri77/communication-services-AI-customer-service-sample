// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import '../styles/HomePage.css';
import { ChatDetailsData, getChatDetails } from '../utils/ChatClientDetails';
import { clearCacheHistory } from '../utils/CacheHistoryDetails';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../authConfig';

/**
 * HomeScreen has two states:
 * 1. Showing start chat button
 * 2. Showing spinner after clicking start chat
 *
 * @param props
 */
export default (): JSX.Element => {
  const [chatData, setChatData] = useState<ChatDetailsData>();
  const { instance, accounts } = useMsal();
  const activeAccount = instance.getActiveAccount();
  useEffect(() => {
    console.log('Account', activeAccount);
    getChatDetails(localStorage.getItem('accessToken') ?? '')
      .then((apiData) => {
        setChatData(apiData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  async function acquireAccessToken() {
    try {
      const account = instance.getActiveAccount();
      instance
        .acquireTokenSilent({
          account: account ?? undefined,
          scopes: ['openid', 'profile', 'api://f01a7dc2-a3a4-4950-9bc6-38a37dd8724b/User.ReadWrite.All']
        })
        .then((response) => {
          localStorage.setItem('accessToken', response.accessToken);
          console.log('Access token:', response.accessToken);
          getChatDetails(response.accessToken)
            .then((apiData) => {
              setChatData(apiData);
              localStorage.setItem('chatThreadId', apiData.threadId);
            })
            .catch((error) => {
              console.error('Error fetching data:', error);
            });
          return response.accessToken;
        });
    } catch (error) {
      console.error('Error acquiring token:', error);
    }
  }

  // logout function
  async function logOut() {
    instance.logoutPopup();
    await handleClearHistory();
  }

  async function handleClearHistory() {
    const response = await clearCacheHistory();
    if (response) {
      alert('Cache history cleared.');
    } else {
      alert('failed.');
    }
  }

  async function onClickLogin() {
    try {
      const loginResponse = await instance.loginPopup();
      localStorage.clear();
      console.log('Login Response', loginResponse);
      acquireAccessToken();
    } catch (error) {
      console.error('Error Login', error);
    }
  }

  const displayHomeScreen = (): JSX.Element => {
    return (
      <div className="home-container">
        <nav>
          <div className="logo">
            <b>Customer </b> Support
          </div>
          <div className="right-items">
            <a href="#" className="language">
              English
            </a>
            <AuthenticatedTemplate>
              <a href="#" className="user">
                Hi! {activeAccount?.name}
              </a>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <a href="#" className="login" onClick={onClickLogin}>
                Login
              </a>
            </UnauthenticatedTemplate>
            <a className="clear-history-btn" onClick={logOut}>
              Clear History
            </a>
          </div>
        </nav>
        {chatData && <Chat {...chatData} userId={chatData.identity} />}
      </div>
    );
  };

  return displayHomeScreen();
};
