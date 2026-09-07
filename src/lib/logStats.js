// Shared log-stat helpers used by the Dashboard and Analytics pages so the
// dispatch de-duplication / delivery-rate math lives in exactly one place.

export const isDateInRange = (timestampStr, range) => {
  if (!timestampStr) return false;
  if (range === "All Time") return true;

  const logDate = new Date(timestampStr.replace(" ", "T"));
  if (isNaN(logDate.getTime())) return true;

  const now = new Date();
  const diffTime = now.getTime() - logDate.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);

  if (range === "This Year") {
    return logDate.getFullYear() === now.getFullYear();
  }
  if (range === "Today") {
    return logDate.toDateString() === now.toDateString() || diffDays <= 1;
  }
  if (range === "Last 7 Days") {
    return diffDays <= 7;
  }
  if (range === "Last 30 Days") {
    return diffDays <= 30;
  }
  return true;
};

// Groups log rows into unique message dispatches (one message per recipient per
// day) and derives the primary delivery metrics from them.
export const computeDispatchSummary = (
  logs,
  { dateRange, channelFilter = "All", notificationFilter = "All", searchQuery = "" } = {}
) => {
  const map = new Map();

  logs.forEach(log => {
    if (!isDateInRange(log.timestamp, dateRange)) return;

    if (channelFilter !== "All") {
      if (channelFilter === "App Notification" && log.serviceType !== "App Notification" && log.serviceType !== "App") return;
      if (channelFilter !== "App Notification" && log.serviceType !== channelFilter) return;
    }

    if (notificationFilter !== "All") {
      if (String(log.notificationId) !== String(notificationFilter)) return;
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const sentToMatch = (log.sentTo || "").toLowerCase().includes(query);
      const templateMatch = (log.templateId || "").toLowerCase().includes(query);
      const logIdMatch = String(log.id).includes(query);
      if (!sentToMatch && !templateMatch && !logIdMatch) return;
    }

    const day = (log.timestamp || "").slice(0, 10);
    const key = `${log.notificationId || "0"}_${log.sentTo || "unknown"}_${day}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        events: new Set(),
        status: "Sent"
      });
    }

    const entry = map.get(key);
    entry.events.add(log.event);
    if (entry.events.has("Viewed")) entry.status = "Viewed";
    else if (entry.events.has("Received") || entry.events.has("Delivered")) entry.status = "Received";
    else if (entry.events.has("Failed")) entry.status = "Failed";
    else if (entry.events.has("Skipped")) entry.status = "Skipped";
    else if (entry.events.has("Sent")) entry.status = "Sent";
  });

  const items = Array.from(map.values());
  const totalAttempted = items.filter(d => d.status !== "Skipped").length;
  const delivered = items.filter(d => d.status === "Received" || d.status === "Viewed").length;
  const failed = items.filter(d => d.status === "Failed").length;
  const skipped = items.filter(d => d.status === "Skipped").length;

  const deliveryRate = totalAttempted > 0 ? Math.min(100, Math.round((delivered / totalAttempted) * 100)) : 100;
  const failureRate = totalAttempted > 0 ? Math.min(100, Math.round((failed / totalAttempted) * 100)) : 0;

  return {
    totalAttempted,
    delivered,
    failed,
    skipped,
    deliveryRate,
    failureRate
  };
};