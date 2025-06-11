// isso é do posthog que usei no meu projeto pessoal, favor desconsiderar
import posthog from "posthog-js"

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  capture_pageview: 'history_change',
  capture_pageleave: true, // Enable pageleave capture
  capture_exceptions: true, // Enable capturing exceptions (Error Tracking)
  debug: false,
});
