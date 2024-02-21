import {
    useState,
    useCallback,
} from 'react';

import { AuthError, InteractionType } from '@azure/msal-browser';
import { useMsal, useMsalAuthentication } from "@azure/msal-react";

/**
 * Custom hook to call a web API using bearer token obtained from MSAL
 * @param {PopupRequest} msalRequest 
 * @returns 
 */
const useFetchWithMsal = (msalRequest: any) => {
    const { instance } = useMsal();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const { result, error: msalError } = useMsalAuthentication(InteractionType.Popup, {
        ...msalRequest,
        account: instance.getActiveAccount(),
        redirectUri: '/redirect'
    });

    /**
     * Execute a fetch request with the given options
     * @param {string} method: GET, POST, PUT, DELETE
     * @param {String} endpoint: The endpoint to call
     * @param {Object} data: The data to send to the endpoint, if any 
     * @returns JSON response
     */
    const execute = async (method: string, endpoint: string, data = null) => {
        if (msalError) {
            return;
        }

        if (result) {
            try {
                let response = null;

                const headers = new Headers();
                const bearer = `Bearer ${result.accessToken}`;            
                headers.append("Authorization", bearer);

                if (data) headers.append('Content-Type', 'application/json');

                let options = {
                    method: method,
                    headers: headers,
                    body: data ? JSON.stringify(data) : null,
                };

                setIsLoading(true);

                response = await (await fetch(endpoint, options)).json();
                setData(response);

                setIsLoading(false);
                return response;
            } catch (e) {
                setIsLoading(false);
                throw e;
            }
        }
    };

    return {
        isLoading,
        error,
        data,
        execute: useCallback(execute, [result, msalError]), // to avoid infinite calls when inside a `useEffect`
    };
};

export default useFetchWithMsal;