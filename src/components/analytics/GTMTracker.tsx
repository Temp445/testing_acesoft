// components/analytics/GTMTracker.tsx   Next.js Google Tag Manager tracker component
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/gtm';

export function GTMTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const url = pathname + searchParams.toString();
        pageview(url);
    }, [pathname, searchParams]);

    return null;
}
