// Shared content-rendering helpers used by the test-send flows and the seeded
// log payloads. Sample values keep placeholders readable in previews.

export const SAMPLE_VARIABLE_MAP = {
  client_name: "Jordan Lee",
  order_id: "ORD-98231",
  provider_name: "Dr. Amara Singh",
  session_date: "Aug 20, 2026",
  session_time: "10:30 AM",
  session_link: "https://meet.mantra.care/session/jordan-lee",
  number: "+1 (800) 555-0199",
  credits: "250",
  member_name: "Alex Taylor"
};

export const substituteVariables = (text, vars = SAMPLE_VARIABLE_MAP) => {
  if (!text) return "";
  let result = text;
  Object.entries(vars).forEach(([key, val]) => {
    result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val);
  });
  return result;
};

export const renderSubstitutedEmail = (htmlContent, vars = SAMPLE_VARIABLE_MAP) => {
  if (!htmlContent) return "<p style='color:#64748b;font-style:italic;'>No email HTML configured for this template.</p>";
  let result = htmlContent;
  Object.entries(vars).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, `<span style="background-color:#fef08a;color:#854d0e;padding:1px 5px;border-radius:3px;font-weight:600;">${val}</span>`);
  });
  return result;
};

export const renderSubstitutedText = (text, vars = SAMPLE_VARIABLE_MAP) => {
  if (!text) return "";
  let result = text;
  Object.entries(vars).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, val);
  });
  return result;
};