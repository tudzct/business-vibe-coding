# Figma Link Review

## Purpose and usage

This file is the sole downstream mapping authority for the frozen offline Figma dataset. Do not edit the immutable use-case files under `docs/01-inception/use-cases/` or the API contracts under `docs/01-inception/api-contracts/` to refresh design evidence.

On 2026-09-28, the researcher supplied this canonical file:

- File: `100ms UI Kit - Video Conferencing and Live Streaming UI Kit (Community)`
- File key: `lCvn1rB7IdRchqAuEatJJp`
- Researcher-supplied entry URL: `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=4732-52930&p=f&t=j36NZHD1FHTtsjeD-0`

The entry URL opens the `Hello World` page, but browser inspection of the same confirmed file exposed twelve child pages under `Live Streaming` and `Video Conferencing`. Their page IDs were recorded by opening each page and reading the resulting Figma URL. These twelve verified pages, not the entry page and not IDs from another file, are the approved capture authority below.

## Use-case and API coverage

| UC | Use case | Source UC | Primary page | Additional approved pages | Related APIs | Replacement URL |
|---|---|---|---|---|---|---|
| UC-001 | Review Join Preview and Permissions | `docs/01-inception/use-cases/uc-01-review-join-preview-and-permissions.md` | `6007:51245` | `6066:89728`, `6066:89006` | `NOT_APPLICABLE` (client-local) | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-51245` |
| UC-002 | Join a Session | `docs/01-inception/use-cases/uc-02-join-a-session.md` | `6007:49584` | `6066:89727`, `6012:44409`, `6066:89005` | `API-SESSION-JOIN`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-49584` |
| UC-003 | Start a Live Stream | `docs/01-inception/use-cases/uc-03-start-a-live-stream.md` | `6007:49584` | `6007:86770`, `6012:90506` | `API-LIVE-STREAM-CONTROL`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-49584` |
| UC-004 | Stop a Live Stream | `docs/01-inception/use-cases/uc-04-stop-a-live-stream.md` | `6007:86770` | `6012:90506` | `API-LIVE-STREAM-CONTROL`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-86770` |
| UC-005 | Watch a Live Stream | `docs/01-inception/use-cases/uc-05-watch-a-live-stream.md` | `6007:49584` | `6012:44409` | `API-LIVE-STREAM-VIEW`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-49584` |
| UC-006 | Request Stage Access | `docs/01-inception/use-cases/uc-06-request-stage-access.md` | `6007:49584` | `6007:86770`, `6012:90506` | `API-STAGE-REQUEST-CREATE`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-49584` |
| UC-007 | Respond to a Stage Request | `docs/01-inception/use-cases/uc-07-respond-to-a-stage-request.md` | `6007:86770` | `6012:90506` | `API-STAGE-REQUEST-CREATE`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-86770` |
| UC-008 | View Session Participants | `docs/01-inception/use-cases/uc-08-view-session-participants.md` | `6007:86770` | `6007:55138`, `6012:90506`, `6012:52233` | `API-PARTICIPANT-LIST`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-86770` |
| UC-009 | Send a Chat Message | `docs/01-inception/use-cases/uc-09-send-a-chat-message.md` | `6007:86770` | `6007:55138`, `6012:90506`, `6012:52233` | `API-CHAT-MESSAGE-CREATE`, `API-CHAT-MESSAGE-LIST` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-86770` |
| UC-010 | Send an Emoji Reaction | `docs/01-inception/use-cases/uc-10-send-an-emoji-reaction.md` | `6007:55138` | None | `API-REACTION-CREATE`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-55138` |
| UC-011 | Share Presentation Content | `docs/01-inception/use-cases/uc-11-share-presentation-content.md` | `6007:86770` | `6007:55138`, `6007:77656`, `6012:52233` | `API-CONTENT-SHARE-CONTROL`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-86770` |
| UC-012 | Configure Audio and Video Devices | `docs/01-inception/use-cases/uc-12-configure-audio-and-video-devices.md` | `6007:49584` | `6066:89727`, `6066:89005` | `API-PREFERENCES-UPDATE`, `API-SESSION-JOIN`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-49584` |
| UC-013 | Select a Virtual Background | `docs/01-inception/use-cases/uc-13-select-a-virtual-background.md` | `6007:49584` | None | `API-PREFERENCES-UPDATE`, `API-SESSION-JOIN`, `API-BACKGROUND-LIST`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-49584` |
| UC-014 | Change Session Layout | `docs/01-inception/use-cases/uc-14-change-session-layout.md` | `6007:96234` | `6012:102740`, `6007:77656`, `6012:78022` | `API-PREFERENCES-UPDATE`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-96234` |
| UC-015 | Pin or Spotlight a Participant | `docs/01-inception/use-cases/uc-15-pin-or-spotlight-a-participant.md` | `6007:55138` | `6012:78022` | `API-PREFERENCES-UPDATE`, `API-SPOTLIGHT-UPDATE`, `API-PARTICIPANT-LIST`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-55138` |
| UC-016 | Control Session Recording | `docs/01-inception/use-cases/uc-16-control-session-recording.md` | `6007:55138` | `6012:90506`, `6012:52233` | `API-RECORDING-CONTROL`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-55138` |
| UC-017 | Leave a Session | `docs/01-inception/use-cases/uc-17-leave-a-session.md` | `6007:86770` | `6007:55138`, `6012:90506`, `6012:52233` | `API-SESSION-DEPARTURE`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-86770` |
| UC-018 | End a Session for Everyone | `docs/01-inception/use-cases/uc-18-end-a-session-for-everyone.md` | `6007:86770` | `6007:55138`, `6012:90506`, `6012:52233` | `API-SESSION-DEPARTURE`, `API-SESSION-STATE` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-86770` |

## Unique approved capture pages

Capture each exact file-key/page-ID pair once, then reference it from every applicable UC and API mapping.

| Product | Page | Node ID | Replacement URL |
|---|---|---|---|
| Live Streaming | Desktop / Preview | `6007:49584` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-49584` |
| Live Streaming | Desktop / Features | `6007:86770` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-86770` |
| Live Streaming | Desktop / Layouts | `6007:96234` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-96234` |
| Live Streaming | Mobile / Preview | `6012:44409` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6012-44409` |
| Live Streaming | Mobile / Features | `6012:90506` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6012-90506` |
| Live Streaming | Mobile / Layouts | `6012:102740` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6012-102740` |
| Video Conferencing | Desktop / Preview | `6066:89727` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6066-89727` |
| Video Conferencing | Desktop / Features | `6007:55138` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-55138` |
| Video Conferencing | Desktop / Layouts | `6007:77656` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-77656` |
| Video Conferencing | Mobile / Preview | `6066:89005` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6066-89005` |
| Video Conferencing | Mobile / Features | `6012:52233` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6012-52233` |
| Video Conferencing | Mobile / Layouts | `6012:78022` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6012-78022` |

## UC-001 approved capture sections

These section IDs were verified from plugin metadata inside the approved Preview pages. UC-001 uses these bounded sections as its complete offline capture units instead of treating each zero-sized Page/Canvas as one renderable design node.

| Product | Section | Parent page | Node ID | Replacement URL |
|---|---|---|---|---|
| Live Streaming | Preview Flow - Broadcaster | Desktop / Preview `6007:49584` | `6007:51245` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6007-51245` |
| Video Conferencing | Preview Flow | Desktop / Preview `6066:89727` | `6066:89728` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6066-89728` |
| Video Conferencing | Preview Flow | Mobile / Preview `6066:89005` | `6066:89006` | `https://www.figma.com/design/lCvn1rB7IdRchqAuEatJJp/100ms-UI-Kit---Video-Conferencing-and-Live-Streaming-UI-Kit--Community-?node-id=6066-89006` |

## Dataset capture conditions

- All 18 current frozen UC files have one exact primary replacement mapping.
- The 15 API contracts are covered through the `Related APIs` mappings; UC-001 remains explicitly client-local.
- All approved pages were verified in the researcher-confirmed file through the visible Figma Pages sidebar.
- Capture must deduplicate the twelve exact file-key/page-ID pairs. UC-001 additionally resolves to its three verified section-level capture units above.
- A page is complete only when every artifact in `resource/figma-design-dataset/CAPTURE-SPEC.md` exists and all checksums pass.
- Do not store cookies, OAuth tokens, credentials, or short-lived Figma asset URLs.
