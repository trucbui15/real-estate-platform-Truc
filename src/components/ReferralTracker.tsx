"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { captureReferralToken } from "@/lib/referral";

function TrackerContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      captureReferralToken();
    }
  }, [searchParams]);

  return null;
}

export default function ReferralTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
