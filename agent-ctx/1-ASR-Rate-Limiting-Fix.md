# Task ID: 1 — ASR Rate Limiting Fix

## Agent: ASR Rate Limiting Fix

## Task: Fix ASR rate limiting issues — add server-side queue, retry logic, and client-side cooldown

### Work Log

- Read and analyzed current ASR route (`/api/ai/asr/route.ts`) and `InterviewCoach.tsx`
- **ASR Route Changes** (`/api/ai/asr/route.ts`):
  - Added module-level request queue system (`enqueueAsrRequest`/`dequeueAsrRequest`):
    - `MAX_CONCURRENT_ASR = 1` (processes one ASR request at a time)
    - `MAX_QUEUE_SIZE = 5` (pending requests beyond this get HTTP 429)
    - Queue uses Promise-based wait mechanism — queued requests resolve when a slot opens
  - Added `asrWithRetry()` function for server-side retry with exponential backoff:
    - Max 2 retries, 1s initial delay (1s, 2s backoff)
    - Non-retryable errors (unsupported format, duration limit) throw immediately
    - Logs retry attempts with `console.warn` for debugging
  - Modified POST handler to:
    - Enqueue request before processing (returns 429 if queue too long)
    - Use `asrWithRetry` instead of direct `zai.audio.asr.create` call
    - Call `dequeueAsrRequest` in `finally` block to always release the queue slot

- **InterviewCoach.tsx Changes**:
  - Updated `fetchWithRetry()` to also retry on HTTP 429 and 5xx:
    - HTTP 429 (rate limiting): longer backoff — 2s, 4s, 8s
    - HTTP 5xx (server errors): standard backoff — 500ms, 1s, 2s
    - Non-retryable HTTP errors (4xx except 429): return response as-is
    - Network errors: existing behavior preserved (retry with exponential backoff)
  - Added `lastRecordingEndTimeRef = useRef<number>(0)` for recording cooldown
  - Added cooldown check in `startRecording()`:
    - After `stopTTS()`, checks if at least 1500ms have passed since last recording ended
    - If not, shows "Please wait a moment before recording again..." feedback message and returns early
    - Prevents rapid successive ASR calls that trigger rate limits
  - Set `lastRecordingEndTimeRef.current = Date.now()` in `mediaRecorder.onstop` after tracks are stopped

- Ran lint check — no new errors in modified files (only pre-existing errors in unrelated mini-services files)
- Dev server running successfully on port 3000

### Stage Summary

- **Server-side**: ASR requests are now queued (1 concurrent, max 5 pending), with retry on transient errors
- **Server-side**: Queue overflow returns HTTP 429, which client-side `fetchWithRetry` handles with longer backoff
- **Client-side**: `fetchWithRetry` now retries on 429 and 5xx (previously only retried network errors)
- **Client-side**: Recording cooldown (1500ms) prevents rapid successive ASR calls from triggering rate limits
- All changes are backward-compatible — no breaking changes to API contract
