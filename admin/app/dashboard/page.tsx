'use client';

import { Suspense } from 'react';
import DashboardContent from '@/components/DashboardContent';

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="text-white text-center py-10">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
