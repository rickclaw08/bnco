# Telnyx SIP Wiring to OpenAI Realtime API
**Date:** 2026-03-01
**Status:** IN PROGRESS

## Key Info Gathered
- **OpenAI Project ID:** `proj_KNNgXdlGfYaGHtYwjxo54Awt`
- **OpenAI Organization:** brandon-liao-llc
- **OpenAI SIP Endpoint:** `sip:proj_KNNgXdlGfYaGHtYwjxo54Awt@sip.api.openai.com;transport=tls`
- **Telnyx Phone:** +1-614-926-0190 (Number ID: 2906196976741647386)
- **Telnyx API Key ID:** KEY019CAAC100C475BFC84046BB85CD733F (value unknown/encrypted)

## Architecture Goal
```
Caller -> Telnyx (+1-614-926-0190) -> SIP Forward -> OpenAI SIP Endpoint
                                                          |
                                                    (webhook fires)
                                                          |
                                                    [Fly.io Server]
                                                    - Accept/reject call
                                                    - Monitor WebSocket
                                                    - Tool execution
```

## Steps
1. [IN PROGRESS] Get Telnyx API key value (or create new one)
2. [ ] List/find Call Control Application ID
3. [ ] Assign phone number to the Voice App
4. [ ] Configure SIP forwarding to OpenAI endpoint
5. [ ] Ensure webhook server handles Telnyx events (not just OpenAI events)
6. [ ] Test end-to-end call flow

## Progress Log
- Retrieved OpenAI Project ID from API response headers: `proj_KNNgXdlGfYaGHtYwjxo54Awt`
- Existing SIP migration code in `receptionist-mvp/sip-migration/` - designed for Twilio SIP trunking, will need Telnyx adaptation
- The .env has Twilio creds but no Telnyx creds yet
