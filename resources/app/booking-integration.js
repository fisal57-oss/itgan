// Itgan booking integration: receives beneficiary requests and optionally syncs with shared PHP API.
(function () {
  const INBOX_KEY = 'itgan_external_booking_requests_v1';
  const API_KEY = 'itgan_integration_api_url';

  function readInbox() { try { return JSON.parse(localStorage.getItem(INBOX_KEY) || '[]'); } catch (_) { return []; } }
  function writeInbox(items) { localStorage.setItem(INBOX_KEY, JSON.stringify(items)); }
  function value(params, key) { return (params.get(key) || '').trim(); }
  function apiUrl() { try { return (localStorage.getItem(API_KEY) || '').trim(); } catch (_) { return ''; } }

  function receiveFromUrl() {
    const params = new URLSearchParams(location.search);
    const requestId = value(params, 'requestId');
    if (!requestId) return null;
    const request = {
      requestId, id: requestId, eventId: value(params, 'eventId') || null,
      source: value(params, 'source') || 'almasrah-beneficiary', status: value(params, 'status') || 'pending',
      eventTitle: value(params, 'eventTitle'), bookingDate: value(params, 'date'), venueName: value(params, 'venue'),
      contactName: value(params, 'contactName'), phone: value(params, 'mobile'), orgName: value(params, 'department'),
      timeSlot: value(params, 'timeSlot'), expectedGuests: Number(value(params, 'expectedGuests') || 0),
      receivedAt: new Date().toISOString()
    };
    const inbox = readInbox();
    const index = inbox.findIndex(x => x.requestId === requestId);
    if (index >= 0) inbox[index] = { ...inbox[index], ...request }; else inbox.unshift(request);
    writeInbox(inbox);
    window.dispatchEvent(new CustomEvent('itgan:external-booking-received', { detail: request }));
    return request;
  }

  async function fetchRemoteRequests() {
    const url = apiUrl(); if (!url) return readInbox();
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Integration API HTTP ${response.status}`);
    const data = await response.json();
    const rows = (data.requests || []).map(r => ({
      requestId: r.request_id, id: r.request_id, eventId: r.event_id || null, source: r.source,
      status: r.status, orgName: r.org_name, contactName: r.contact_name, phone: r.phone,
      eventTitle: r.event_title, bookingDate: r.booking_date, timeSlot: r.time_slot,
      venueName: r.venue_name, expectedGuests: r.expected_attendees, updatedAt: r.updated_at
    }));
    writeInbox(rows); return rows;
  }

  async function updateRemoteStatus(requestId, status) {
    const url = apiUrl();
    if (!url) return null;
    const response = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, status }) });
    if (!response.ok) throw new Error(`Integration API HTTP ${response.status}`);
    return response.json();
  }

  window.ITGAN_BOOKING_INTEGRATION = {
    inboxKey: INBOX_KEY, getRequests: readInbox, receiveFromUrl, fetchRemoteRequests, updateRemoteStatus,
    configureApi(url) { const clean = String(url || '').trim(); if (clean) localStorage.setItem(API_KEY, clean); else localStorage.removeItem(API_KEY); return clean; },
    getApiUrl: apiUrl
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', receiveFromUrl, { once: true }); else receiveFromUrl();
})();
