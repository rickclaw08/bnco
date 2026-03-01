# Telnyx Setup - 2026-03-01

## Goal
Replace Twilio (voice blocked due to Trust Hub review) with Telnyx SIP Trunking to route inbound calls to OpenAI Realtime API SIP Connector.

## Architecture
```
Caller -> Telnyx Phone Number -> Telnyx SIP Connection -> OpenAI SIP Endpoint
                                                              |
                                                        (webhook fires)
                                                              |
                                                        [Our Server on Fly.io]
                                                        - Accept/reject call
                                                        - Monitoring WebSocket
                                                        - Tool execution
```

## OpenAI SIP Endpoint
- Format: `sip:PROJECT_ID@sip.api.openai.com;transport=tls`
- Need: OpenAI Project ID from dashboard

## Status
- [ ] Create Telnyx account (rickclaw08@gmail.com / MGO Data LLC)
- [ ] Identity verification
- [ ] Buy US phone number
- [ ] Create SIP Connection with outbound routing to OpenAI SIP endpoint
- [ ] Assign phone number to SIP Connection
- [ ] Test inbound call flow
- [ ] Document credentials and config

## Research Notes

### Telnyx SIP Trunking Architecture
- **SIP Connections** handle inbound traffic and authentication
- **Outbound Voice Profiles** handle outbound call routing
- Authentication methods: Credentials, IP address, FQDN
- Supports UDP, TCP, TLS transport protocols
- Can set webhook URLs on connections for call events
- IP Connections support `outbound` config for call routing
- Failover: Two signaling IPs per region, automatic retry

### Key Insight for Our Use Case
For our use case (inbound calls forwarded to OpenAI SIP), we need:
1. A Telnyx SIP Connection (IP-based) configured with inbound routing
2. The connection needs to forward/originate calls to OpenAI's SIP endpoint
3. Telnyx equivalent of Twilio's "Origination URI" on SIP Trunk

### Telnyx API Endpoints
- Create IP Connection: `POST /v2/ip_connections`
- Create Credential Connection: `POST /v2/credential_connections`
- Transport protocol options: UDP, TCP, TLS (we need TLS for OpenAI)
- Webhook event URL configurable per connection

---

## Setup Steps (In Progress)

### Step 1: Account Creation
Starting at https://telnyx.com/sign-up

**Credentials Used:**
- Email: rickclaw08@gmail.com
- First Name: Rick
- Last Name: Claw
- Password: kk0VJ2Zv6jl51sBMoOQK
- Account Type: Business
- Accepted Terms & Conditions

**Status:** Account created via Google Sign-In (freemium). Magic link received and clicked.
- Telnyx sent magic link to rickclaw08@gmail.com
- Token: 019caabd-de76-7471-ac61-abc10bb7ff76
- Portal URL: https://portal.telnyx.com
- **NOTE:** Used Freemium login flow with magic link. Account is now active and logged into portal.
- Password set: kk0VJ2Zv6jl51s!BMoOQK (may not be needed since using magic link auth)
- Login method: Freemium > email magic link to rickclaw08@gmail.com
- Portal dashboard accessible at https://portal.telnyx.com/
- **Account Status: ACTIVE** ✅

### Step 2: Phone Number
- **Number: +1-614-926-0190** ✅
- Type: Local (US)
- Status: Active
- Location: Columbus, OH area (614 area code)
- Number ID: 2906196976741647386
- Features: Voice available
- Connection: Not yet assigned (needs SIP connection)
- Cost: $0.00/month (trial tier)
- NOTE: Account already had this number from the first signup attempt. Trial accounts limited to 1 number order.
