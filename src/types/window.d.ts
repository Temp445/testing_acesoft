// This file is used to declare global types for the LinkedIn tracking script.
// Require tsconfig.json to include this file in the compilation.
// tsconfig.json should have "include": ["src/types/window.d.ts"] or ["types/*.d.ts"]

type GTMEvent = {
    event: string;
    [key: string]: string | number | boolean | undefined;
};

declare global {
    interface Window {
        _linkedin_data_partner_ids?: string[];              // Array of LinkedIn partner IDs
        _linkedin_partner_id?: string;                      // LinkedIn partner ID
        lintrk?: (action: 'track', data: { conversion_id: string | number }) => void;       // LinkedIn tracking function
        dataLayer: GTMEvent[]; // Record<string, any>[];           // for GTM tracking
    }
}

export { };
