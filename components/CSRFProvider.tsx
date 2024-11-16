'use client';

import { useEffect } from 'react';
import CSRF from 'csrf';

const csrf = new CSRF();

export function CSRFProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const setupCSRF = async () => {
            // Generate a new session secret if not exists
            let sessionSecret = sessionStorage.getItem('csrfSecret');
            if (!sessionSecret) {
                sessionSecret = csrf.secretSync();
                sessionStorage.setItem('csrfSecret', sessionSecret);
            }

            // Generate CSRF token
            const token = csrf.create(sessionSecret);

            // Add token to all fetch/supabase requests
            const originalFetch = window.fetch;
            window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
                if (!init) init = {};
                if (!init.headers) init.headers = {};

                Object.assign(init.headers, {
                    'X-CSRF-Token': token
                });

                return originalFetch.call(this, input, init);
            };
        };

        setupCSRF();
    }, []);

    return <>{children}</>;
}; 