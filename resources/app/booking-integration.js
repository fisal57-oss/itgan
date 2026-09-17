// Itgan <-> Almasrah booking integration via Supabase Edge Function.
(function () {
  const INBOX_KEY = 'itgan_external_booking_requests_v1';
  const ADMIN_KEY_STORAGE = 'itgan_booking_admin_key';
  const API_URL = 'https://qrytzuqlsvfsjukcvrdg.supabase.co/functions/v1/booking-requests';

  function readInbox() { try { return JSON.parse(localStorage.getItem(INBOX_KEY) || '[]'); } catch (_) { return []; } }
  function writeInbox(items) { localStorage.setItem(INBOX_KEY, JSON.stringify(items)); }
  function adminKey() { try { return (localStorage.getItem(ADMIN_KEY_STORAGE) || '').trim(); } catch (_) { return ''; } }
  function headers(json = false) {
    const h = { Accept: 'application/json', 'x-admin-key': adminKey() };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  async function fetchRemoteRequests() {
    if (!adminKey()) throw new Error('admin_key_required');
    const response = await fetch(API_URL, { headers: headers() });
    if (!response.ok) throw new Error(`Integration API HTTP ${response.status}`);
    const data = await response.json();
    const rows = (data.requests || []).map(r => ({
      requestId: r.request_id, id: r.request_id, eventId: r.event_id || null, source: r.source,
      status: r.status, orgName: r.org_name, contactName: r.contact_name, phone: r.phone,
      eventTitle: r.event_title, bookingDate: r.booking_date, timeSlot: r.time_slot,
      venueName: r.venue_name, venueLocation: r.venue_location, expectedGuests: r.expected_attendees,
      equipments: r.equipments || [], notes: r.notes || '', createdAt: r.created_at, updatedAt: r.updated_at
    }));
    writeInbox(rows);
    return rows;
  }

  async function updateRemoteStatus(requestId, status) {
    if (!adminKey()) throw new Error('admin_key_required');
    const response = await fetch(API_URL, {
      method: 'PATCH', headers: headers(true), body: JSON.stringify({ requestId, status })
    });
    if (!response.ok) throw new Error(`Integration API HTTP ${response.status}`);
    const result = await response.json();
    const rows = readInbox().map(r => r.requestId === requestId ? { ...r, status: result.status || status, eventId: result.eventId || r.eventId || null, updatedAt: result.updatedAt || new Date().toISOString() } : r);
    writeInbox(rows);
    return result;
  }

  window.ITGAN_BOOKING_INTEGRATION = {
    inboxKey: INBOX_KEY,
    apiUrl: API_URL,
    getRequests: readInbox,
    fetchRemoteRequests,
    updateRemoteStatus,
    setAdminKey(value) {
      const clean = String(value || '').trim();
      if (clean) localStorage.setItem(ADMIN_KEY_STORAGE, clean); else localStorage.removeItem(ADMIN_KEY_STORAGE);
      return clean;
    },
    getAdminKey: adminKey
  };
})();
