"use client";

import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

const INITIAL_ORGANIZATIONS = [
  {
    id: "ORG-001",
    companyKey: "MantraCare",
    name: "MantraCare",
    website: "mantra.care",
    contactNumber: "+91 9999999999",
    contactEmail: "contact@mantra.care",
    reportingType: "Webhook",
    webhooks: [
      { id: 1, name: "OTP-Report", service: "OTP", url: "https://workflows.mantracare.com/webhook/mantraotp-msg91", event: "On Report Received" },
      { id: 2, name: "OTP-failed", service: "OTP", url: "https://workflows.mantracare.com/webhook/mantraotp-msg91", event: "On Failed Events" },
      { id: 3, name: "otp-delivered", service: "OTP", url: "https://workflows.mantracare.com/webhook/mantraotp-msg91", event: "On Delivered Events" },
    ],
    emailReports: [
      { id: 1, name: "Daily Summary", service: "Email", emailAddress: "admin@mantra.care", event: "Daily Digest" },
    ]
  },
  {
    id: "ORG-002",
    companyKey: "MantraAssist",
    name: "MantraAssist",
    website: "mantraassist.com",
    contactNumber: "+91 8888888888",
    contactEmail: "support@mantraassist.com",
    reportingType: "Email",
    webhooks: [],
    emailReports: [
      { id: 2, name: "Weekly Report", service: "Email", emailAddress: "reports@mantraassist.com", event: "Weekly Summary" }
    ]
  },
  {
    id: "ORG-003",
    companyKey: "EyeMantra",
    name: "EyeMantra",
    website: "eyemantra.in",
    contactNumber: "+91 7777777777",
    contactEmail: "appointment@eyemantra.in",
    reportingType: "Webhook",
    webhooks: [],
    emailReports: []
  }
];

const MOCK_DATA = {
  MantraCare: {
    templates: {
      "Signup": { 
        status: "Active",
        subject: "Welcome to MantraCare!", 
        email: "<h1>Welcome to MantraCare!</h1><p>Hi {{client_name}},</p><p>We are thrilled to have you on board. Explore our app to get started.</p>", 
        text: "Welcome to MantraCare, {{client_name}}! We are thrilled to have you on board. Explore our app to get started." 
      },
      "Meeting Scheduled": { 
        status: "Active",
        subject: "Your Meeting is Scheduled", 
        email: "<h1>Meeting Scheduled</h1><p>Hi {{client_name}},</p><p>Your meeting with {{provider_name}} is scheduled for {{session_date}} at {{session_time}}.</p>", 
        text: "Hi {{client_name}}, your meeting with {{provider_name}} is scheduled for {{session_date}} at {{session_time}}." 
      },
      "Profile Edited": { 
        status: "Draft",
        subject: "Profile Updated", 
        email: "<h1>Profile Updated</h1><p>Hi {{client_name}},</p><p>Your profile has been successfully updated.</p>", 
        text: "Hi {{client_name}}, your profile has been successfully updated." 
      },
    },
    triggers: [
      { id: 1, name: "thankyou page", eventType: "Page View", filterField: "Page URL", filterCondition: "contains thanks", tags: 1, lastEdited: "3 years ago" },
      { id: 2, name: "order completed", eventType: "Purchase", filterField: "Order Status", filterCondition: "equals complete", tags: 2, lastEdited: "1 year ago" },
      { id: 3, name: "signup success", eventType: "Sign Up", filterField: "Account Source", filterCondition: "any", tags: 0, lastEdited: "2 months ago" }
    ],
    notifications: [
      { 
        id: 10045, 
        status: "Active",
        templateName: "Signup",
        userType: "Client", 
        name: "Welcome Series 1", 
        description: "Welcome Series 1", 
        type: "App", 
        appNotificationType: "App Screen", 
        actionScreen: "Home", 
        action: "Open App > Home", 
        emailProvider: "Sendgrid", 
        senderEmail: "donotreply@mantra.care", 
        emailSubject: "", 
        emailContent: "", 
        smsContent: "", 
        service: "Therapy", 
        orderPurchased: "Yes", 
        trigger: "signup success", 
        displayTrigger: "Instantly on signup success [Therapy]", 
        timing: "Instantly", 
        eventType: "One-time", 
        scheduleDate: "", 
        scheduleTime: "", 
        scheduleTimezone: "IST (GMT+5:30)", 
        recurringFrequency: "Weekly", 
        recurringDays: [], 
        recurringTime: "", 
        recurringTimezone: "IST (GMT+5:30)", 
        monthlySchedules: [{ id: 1, date: "", time: "", timezone: "IST (GMT+5:30)" }], 
        visibleToAll: true, 
        selectedServices: ["Therapy"], 
        selectedCorporates: [], 
        appTextContent: "Welcome to Mantra Care!", 
        campaignType: "timebased", 
        category: "Client" 
      },
      { 
        id: 10046, 
        status: "Active",
        templateName: "Meeting Scheduled",
        userType: "Client", 
        name: "Follow up after 2 days", 
        description: "Follow up after 2 days", 
        type: "Email", 
        appNotificationType: "App Screen", 
        actionScreen: "Home", 
        action: "Email Notification", 
        emailProvider: "Sendgrid", 
        senderEmail: "donotreply@mantra.care", 
        emailSubject: "Checking in on your progress!", 
        emailContent: "<p>Hi {{client_name}}, it's been 2 days. How are you doing?</p>", 
        smsContent: "", 
        service: "Therapy", 
        orderPurchased: "Yes", 
        trigger: "signup success", 
        displayTrigger: "2 Days post signup success [Therapy]", 
        timing: "2 Days", 
        eventType: "One-time", 
        scheduleDate: "", 
        scheduleTime: "", 
        scheduleTimezone: "IST (GMT+5:30)", 
        recurringFrequency: "Weekly", 
        recurringDays: [], 
        recurringTime: "", 
        recurringTimezone: "IST (GMT+5:30)", 
        monthlySchedules: [{ id: 1, date: "", time: "", timezone: "IST (GMT+5:30)" }], 
        visibleToAll: true, 
        selectedServices: ["Therapy"], 
        selectedCorporates: [], 
        appTextContent: "", 
        campaignType: "timebased", 
        category: "Client" 
      },
      {
        id: 10047,
        status: "Paused",
        templateName: "Profile Edited",
        userType: "Client",
        name: "Profile Update Confirmation",
        description: "Sent whenever user updates emergency contact",
        type: "SMS",
        appNotificationType: "",
        actionScreen: "",
        action: "SMS Alert",
        emailProvider: "",
        senderEmail: "",
        emailSubject: "",
        emailContent: "",
        smsContent: "Hi {{client_name}}, your profile was updated successfully.",
        service: "Therapy",
        orderPurchased: "No",
        trigger: "thankyou page",
        displayTrigger: "Instantly on profile update",
        timing: "Instantly",
        eventType: "One-time",
        scheduleDate: "",
        scheduleTime: "",
        scheduleTimezone: "IST (GMT+5:30)",
        recurringFrequency: "",
        recurringDays: [],
        recurringTime: "",
        recurringTimezone: "",
        monthlySchedules: [],
        visibleToAll: true,
        selectedServices: ["Therapy"],
        selectedCorporates: [],
        appTextContent: "",
        campaignType: "automated",
        category: "Client"
      }
    ],
    logs: [
      { id: 101, notificationId: 10045, sentTo: "USR-001 / Device-X", serviceType: "App Notification", event: "Sent", timestamp: "2026-08-08 09:15:00", error: "", templateId: "TPL-892" },
      { id: 102, notificationId: 10045, sentTo: "USR-001 / Device-X", serviceType: "App Notification", event: "Viewed", timestamp: "2026-08-08 09:20:00", error: "", templateId: "TPL-892" },
      { id: 103, notificationId: 10046, sentTo: "alex.turner@gmail.com", serviceType: "Email", event: "Sent", timestamp: "2026-08-09 11:00:00", error: "", templateId: "TPL-893" },
      { id: 104, notificationId: 10046, sentTo: "alex.turner@gmail.com", serviceType: "Email", event: "Received", timestamp: "2026-08-09 11:01:05", error: "", templateId: "TPL-893" },
      { id: 105, notificationId: 10046, sentTo: "alex.turner@gmail.com", serviceType: "Email", event: "Viewed", timestamp: "2026-08-09 11:45:10", error: "", templateId: "TPL-893" },
      { id: 106, notificationId: 10047, sentTo: "+91 9876543210", serviceType: "SMS", event: "Sent", timestamp: "2026-08-10 14:10:00", error: "", templateId: "TPL-894" },
      { id: 107, notificationId: 10047, sentTo: "+91 9876543210", serviceType: "SMS", event: "Received", timestamp: "2026-08-10 14:10:08", error: "", templateId: "TPL-894" },
      { id: 108, notificationId: 10047, sentTo: "+1 415-555-0101", serviceType: "SMS", event: "Skipped", timestamp: "2026-08-11 10:05:00", reason: "Country not Added in provider", templateId: "TPL-894" },
      { id: 109, notificationId: 10046, sentTo: "bounced-user@invalid.domain", serviceType: "Email", event: "Failed", timestamp: "2026-08-12 12:30:00", error: "Domain DNS resolution failed (NXDOMAIN)", templateId: "TPL-893" },
      { id: 110, notificationId: 10045, sentTo: "USR-004 / Device-Y", serviceType: "App Notification", event: "Sent", timestamp: "2026-08-13 16:40:00", error: "", templateId: "TPL-892" },
      { id: 111, notificationId: 10045, sentTo: "USR-004 / Device-Y", serviceType: "App Notification", event: "Received", timestamp: "2026-08-13 16:40:12", error: "", templateId: "TPL-892" },
      { id: 112, notificationId: 10046, sentTo: "clara.b@workplace.co", serviceType: "Email", event: "Sent", timestamp: "2026-08-14 08:30:00", error: "", templateId: "TPL-893" },
      { id: 113, notificationId: 10046, sentTo: "clara.b@workplace.co", serviceType: "Email", event: "Received", timestamp: "2026-08-14 08:31:00", error: "", templateId: "TPL-893" },
      { id: 114, notificationId: 10047, sentTo: "+91 9988776655", serviceType: "SMS", event: "Sent", timestamp: "2026-08-15 13:20:00", error: "", templateId: "TPL-894" },
      { id: 115, notificationId: 10047, sentTo: "+91 9988776655", serviceType: "SMS", event: "Failed", timestamp: "2026-08-15 13:20:15", error: "Carrier rejected: DND active on handset", templateId: "TPL-894" },
      { id: 116, notificationId: 10045, sentTo: "USR-008 / Device-Z", serviceType: "App Notification", event: "Sent", timestamp: "2026-08-16 10:00:00", error: "", templateId: "TPL-892" },
      { id: 117, notificationId: 10045, sentTo: "USR-008 / Device-Z", serviceType: "App Notification", event: "Viewed", timestamp: "2026-08-16 10:15:00", error: "", templateId: "TPL-892" },
      { id: 118, notificationId: 10046, sentTo: "david.miller@startup.org", serviceType: "Email", event: "Sent", timestamp: "2026-08-17 09:00:00", error: "", templateId: "TPL-893" },
      { id: 119, notificationId: 10046, sentTo: "david.miller@startup.org", serviceType: "Email", event: "Received", timestamp: "2026-08-17 09:00:10", error: "", templateId: "TPL-893" },
      { id: 120, notificationId: 10047, sentTo: "+91 9123456780", serviceType: "SMS", event: "Sent", timestamp: "2026-08-18 15:45:00", error: "", templateId: "TPL-894" },
      { id: 121, notificationId: 10047, sentTo: "+91 9123456780", serviceType: "SMS", event: "Received", timestamp: "2026-08-18 15:45:04", error: "", templateId: "TPL-894" },
      { id: 122, notificationId: 10046, sentTo: "emma.watson@domain.net", serviceType: "Email", event: "Skipped", timestamp: "2026-08-19 11:15:00", reason: "User unsubscribed from communications", templateId: "TPL-893" },
      { id: 123, notificationId: 10045, sentTo: "USR-012 / Device-W", serviceType: "App Notification", event: "Sent", timestamp: "2026-08-20 09:30:00", error: "", templateId: "TPL-892" },
      { id: 124, notificationId: 10045, sentTo: "USR-012 / Device-W", serviceType: "App Notification", event: "Viewed", timestamp: "2026-08-20 10:02:00", error: "", templateId: "TPL-892" },
      { id: 125, notificationId: 10046, sentTo: "frank.lin@acme.inc", serviceType: "Email", event: "Sent", timestamp: "2026-08-21 14:00:00", error: "", templateId: "TPL-893" },
      { id: 126, notificationId: 10046, sentTo: "frank.lin@acme.inc", serviceType: "Email", event: "Received", timestamp: "2026-08-21 14:00:45", error: "", templateId: "TPL-893" },
      { id: 127, notificationId: 10047, sentTo: "+91 9777123456", serviceType: "SMS", event: "Sent", timestamp: "2026-08-22 17:10:00", error: "", templateId: "TPL-894" },
      { id: 128, notificationId: 10047, sentTo: "+91 9777123456", serviceType: "SMS", event: "Failed", timestamp: "2026-08-22 17:10:20", error: "Gateway timeout from SMS aggregator", templateId: "TPL-894" },
      { id: 129, notificationId: 10045, sentTo: "USR-015 / Device-V", serviceType: "App Notification", event: "Sent", timestamp: "2026-08-23 08:45:00", error: "", templateId: "TPL-892" },
      { id: 130, notificationId: 10045, sentTo: "USR-015 / Device-V", serviceType: "App Notification", event: "Received", timestamp: "2026-08-23 08:45:10", error: "", templateId: "TPL-892" },
      { id: 131, notificationId: 10046, sentTo: "grace.hopper@code.edu", serviceType: "Email", event: "Sent", timestamp: "2026-08-24 10:20:00", error: "", templateId: "TPL-893" },
      { id: 132, notificationId: 10046, sentTo: "grace.hopper@code.edu", serviceType: "Email", event: "Received", timestamp: "2026-08-24 10:20:30", error: "", templateId: "TPL-893" },
      { id: 133, notificationId: 10046, sentTo: "grace.hopper@code.edu", serviceType: "Email", event: "Viewed", timestamp: "2026-08-24 11:05:00", error: "", templateId: "TPL-893" },
      { id: 134, notificationId: 10047, sentTo: "+91 9666543210", serviceType: "SMS", event: "Sent", timestamp: "2026-08-25 12:00:00", error: "", templateId: "TPL-894" },
      { id: 135, notificationId: 10047, sentTo: "+91 9666543210", serviceType: "SMS", event: "Received", timestamp: "2026-08-25 12:00:06", error: "", templateId: "TPL-894" },
      { id: 136, notificationId: 10045, sentTo: "USR-019 / Device-U", serviceType: "App Notification", event: "Sent", timestamp: "2026-08-26 15:30:00", error: "", templateId: "TPL-892" },
      { id: 137, notificationId: 10045, sentTo: "USR-019 / Device-U", serviceType: "App Notification", event: "Viewed", timestamp: "2026-08-26 16:10:00", error: "", templateId: "TPL-892" },
      { id: 138, notificationId: 10046, sentTo: "henry.f@autos.corp", serviceType: "Email", event: "Sent", timestamp: "2026-08-27 09:10:00", error: "", templateId: "TPL-893" },
      { id: 139, notificationId: 10046, sentTo: "henry.f@autos.corp", serviceType: "Email", event: "Received", timestamp: "2026-08-27 09:10:40", error: "", templateId: "TPL-893" },
      { id: 140, notificationId: 10046, sentTo: "spam-trap@honey.pot", serviceType: "Email", event: "Failed", timestamp: "2026-08-28 13:50:00", error: "550 5.7.1 Service unavailable; Client host blocked", templateId: "TPL-893" },
      { id: 141, notificationId: 10047, sentTo: "+1 650-555-0188", serviceType: "SMS", event: "Skipped", timestamp: "2026-08-29 11:20:00", reason: "Country not Added in provider", templateId: "TPL-894" },
      { id: 142, notificationId: 10045, sentTo: "USR-022 / Device-T", serviceType: "App Notification", event: "Sent", timestamp: "2026-08-30 14:00:00", error: "", templateId: "TPL-892" },
      { id: 143, notificationId: 10045, sentTo: "USR-022 / Device-T", serviceType: "App Notification", event: "Received", timestamp: "2026-08-30 14:00:15", error: "", templateId: "TPL-892" },
      { id: 144, notificationId: 10046, sentTo: "iris.m@health.org", serviceType: "Email", event: "Sent", timestamp: "2026-08-31 16:25:00", error: "", templateId: "TPL-893" },
      { id: 145, notificationId: 10046, sentTo: "iris.m@health.org", serviceType: "Email", event: "Received", timestamp: "2026-08-31 16:26:00", error: "", templateId: "TPL-893" },
      { id: 146, notificationId: 10046, sentTo: "iris.m@health.org", serviceType: "Email", event: "Viewed", timestamp: "2026-08-31 17:15:00", error: "", templateId: "TPL-893" },
      { id: 147, notificationId: 10047, sentTo: "+91 9555123456", serviceType: "SMS", event: "Sent", timestamp: "2026-09-01 10:15:00", error: "", templateId: "TPL-894" },
      { id: 148, notificationId: 10047, sentTo: "+91 9555123456", serviceType: "SMS", event: "Received", timestamp: "2026-09-01 10:15:04", error: "", templateId: "TPL-894" },
      { id: 149, notificationId: 10045, sentTo: "USR-027 / Device-S", serviceType: "App Notification", event: "Sent", timestamp: "2026-09-02 11:40:00", error: "", templateId: "TPL-892" },
      { id: 150, notificationId: 10045, sentTo: "USR-027 / Device-S", serviceType: "App Notification", event: "Viewed", timestamp: "2026-09-02 12:30:00", error: "", templateId: "TPL-892" },
      { id: 151, notificationId: 10046, sentTo: "james.k@fintech.io", serviceType: "Email", event: "Sent", timestamp: "2026-09-03 14:10:00", error: "", templateId: "TPL-893" },
      { id: 152, notificationId: 10046, sentTo: "james.k@fintech.io", serviceType: "Email", event: "Received", timestamp: "2026-09-03 14:10:35", error: "", templateId: "TPL-893" },
      { id: 153, notificationId: 10047, sentTo: "+91 9444987654", serviceType: "SMS", event: "Sent", timestamp: "2026-09-04 09:20:00", error: "", templateId: "TPL-894" },
      { id: 154, notificationId: 10047, sentTo: "+91 9444987654", serviceType: "SMS", event: "Received", timestamp: "2026-09-04 09:20:05", error: "", templateId: "TPL-894" },
      { id: 155, notificationId: 10045, sentTo: "USR-031 / Device-R", serviceType: "App Notification", event: "Sent", timestamp: "2026-09-05 13:00:00", error: "", templateId: "TPL-892" },
      { id: 156, notificationId: 10045, sentTo: "USR-031 / Device-R", serviceType: "App Notification", event: "Received", timestamp: "2026-09-05 13:00:12", error: "", templateId: "TPL-892" },
      { id: 157, notificationId: 10046, sentTo: "karen.page@legal.com", serviceType: "Email", event: "Sent", timestamp: "2026-09-06 15:30:00", error: "", templateId: "TPL-893" },
      { id: 158, notificationId: 10046, sentTo: "karen.page@legal.com", serviceType: "Email", event: "Received", timestamp: "2026-09-06 15:30:50", error: "", templateId: "TPL-893" },
      { id: 159, notificationId: 10046, sentTo: "karen.page@legal.com", serviceType: "Email", event: "Viewed", timestamp: "2026-09-06 16:15:00", error: "", templateId: "TPL-893" },
      { id: 160, notificationId: 10047, sentTo: "+91 9333112233", serviceType: "SMS", event: "Sent", timestamp: "2026-09-07 08:45:00", error: "", templateId: "TPL-894" },
      { id: 161, notificationId: 10047, sentTo: "+91 9333112233", serviceType: "SMS", event: "Received", timestamp: "2026-09-07 08:45:06", error: "", templateId: "TPL-894" },
      { id: 162, notificationId: 10045, sentTo: "USR-035 / Device-Q", serviceType: "App Notification", event: "Sent", timestamp: "2026-09-07 10:10:00", error: "", templateId: "TPL-892" },
      { id: 163, notificationId: 10045, sentTo: "USR-035 / Device-Q", serviceType: "App Notification", event: "Viewed", timestamp: "2026-09-07 10:25:00", error: "", templateId: "TPL-892" },
    ],
    emailSettings: {
      providers: [{ id: 1, connectionName: "MantraCare Sendgrid", provider: "Sendgrid", details: { authToken: "sg.mantracare" } }],
      emailIds: [
        { id: 1, email: "clients@mantra.care", providerId: 1, priority: "High" },
        { id: 2, email: "provider@mantra.care", providerId: 1, priority: "Normal" }
      ]
    },
    smsSettings: {
      providers: [{ id: 1, connectionName: "Mantra Twilio", provider: "Twilio", details: { accountSid: "AC...", authToken: "..." } }],
      numbers: [
        { id: 1, number: "+91 9999999999", providerId: 1, priority: "High" }
      ],
      senderIds: [
        { id: 1, route: "Transactional", senderId: "MANTRA", peId: "1234567890" }
      ]
    }
  },
  MantraAssist: {
    templates: {
      "User Signup": { 
        status: "Active",
        subject: "Welcome to MantraAssist!", 
        email: "<h1>Welcome!</h1><p>Hi {{client_name}},</p><p>Thanks for signing up for our AI Receptionist service.</p>", 
        text: "Hi {{client_name}}, welcome to MantraAssist! Your AI Receptionist is ready." 
      },
      "Number Added": { 
        status: "Active",
        subject: "Virtual Number Configured", 
        email: "<h1>Number Added</h1><p>Your new virtual number {{number}} is now active.</p>", 
        text: "Your new virtual number {{number}} is now active on MantraAssist." 
      },
      "Credits Topped Up": { 
        status: "Active",
        subject: "Credits Added Successfully", 
        email: "<h1>Payment Received</h1><p>Your account has been credited with {{credits}}.</p>", 
        text: "Success! {{credits}} credits have been added to your MantraAssist account." 
      },
      "Low Credits Reminder": { 
        status: "Active",
        subject: "Action Required: Low Credits", 
        email: "<h1>Low Credits Warning</h1><p>You have less than {{credits}} credits remaining. Top up to avoid service interruption.</p>", 
        text: "Warning: Your MantraAssist credits are running low. Please top up soon." 
      },
      "New Team Added": { 
        status: "Draft",
        subject: "Team Member Added", 
        email: "<h1>Team Updated</h1><p>{{member_name}} has been added to your workspace.</p>", 
        text: "{{member_name}} has been added to your workspace." 
      },
    },
    triggers: [
      { id: 4, name: "account created", eventType: "Sign Up", filterField: "Plan", filterCondition: "equals Pro", tags: 1, lastEdited: "1 week ago" },
      { id: 5, name: "low credits", eventType: "Billing", filterField: "Credits", filterCondition: "less than 100", tags: 2, lastEdited: "3 days ago" },
      { id: 6, name: "number added", eventType: "Configuration", filterField: "Status", filterCondition: "equals Active", tags: 0, lastEdited: "2 months ago" }
    ],
    notifications: [
      { 
        id: 2001, 
        status: "Active",
        templateName: "Low Credits Reminder",
        userType: "Client", 
        name: "Low Credits Warning", 
        description: "Triggered when credits < 100", 
        type: "Email", 
        appNotificationType: "", 
        actionScreen: "", 
        action: "Email Notification", 
        emailProvider: "Sendgrid", 
        senderEmail: "support@mantraassist.com", 
        emailSubject: "Low Credits", 
        emailContent: "<p>Please recharge your account.</p>", 
        smsContent: "", 
        service: "AI Receptionist", 
        orderPurchased: "Yes", 
        trigger: "low credits", 
        displayTrigger: "Instantly on low credits", 
        timing: "Instantly", 
        eventType: "One-time", 
        scheduleDate: "", 
        scheduleTime: "", 
        scheduleTimezone: "IST (GMT+5:30)", 
        recurringFrequency: "", 
        recurringDays: [], 
        recurringTime: "", 
        recurringTimezone: "", 
        monthlySchedules: [], 
        visibleToAll: true, 
        selectedServices: [], 
        selectedCorporates: [], 
        appTextContent: "", 
        campaignType: "automated", 
        category: "Billing" 
      },
      {
        id: 2002,
        status: "Active",
        templateName: "Number Added",
        userType: "Client",
        name: "Virtual Number Provisioned",
        description: "Alert when new DID is attached",
        type: "SMS",
        appNotificationType: "",
        actionScreen: "",
        action: "SMS Notification",
        emailProvider: "",
        senderEmail: "",
        emailSubject: "",
        emailContent: "",
        smsContent: "Your virtual number is active on MantraAssist.",
        service: "AI Receptionist",
        orderPurchased: "Yes",
        trigger: "number added",
        displayTrigger: "Instantly on number configured",
        timing: "Instantly",
        eventType: "One-time",
        scheduleDate: "",
        scheduleTime: "",
        scheduleTimezone: "IST (GMT+5:30)",
        recurringFrequency: "",
        recurringDays: [],
        recurringTime: "",
        recurringTimezone: "",
        monthlySchedules: [],
        visibleToAll: true,
        selectedServices: [],
        selectedCorporates: [],
        appTextContent: "",
        campaignType: "automated",
        category: "Configuration"
      }
    ],
    logs: [
      { id: 201, notificationId: 2001, sentTo: "founder@startupone.com", serviceType: "Email", event: "Sent", timestamp: "2026-08-09 10:00:00", error: "", templateId: "TPL-304" },
      { id: 202, notificationId: 2001, sentTo: "founder@startupone.com", serviceType: "Email", event: "Received", timestamp: "2026-08-09 10:00:40", error: "", templateId: "TPL-304" },
      { id: 203, notificationId: 2001, sentTo: "founder@startupone.com", serviceType: "Email", event: "Viewed", timestamp: "2026-08-09 10:15:00", error: "", templateId: "TPL-304" },
      { id: 204, notificationId: 2002, sentTo: "+1 415-555-2671", serviceType: "SMS", event: "Sent", timestamp: "2026-08-11 12:30:00", error: "", templateId: "TPL-305" },
      { id: 205, notificationId: 2002, sentTo: "+1 415-555-2671", serviceType: "SMS", event: "Received", timestamp: "2026-08-11 12:30:05", error: "", templateId: "TPL-305" },
      { id: 206, notificationId: 2001, sentTo: "billing@acmecorp.us", serviceType: "Email", event: "Sent", timestamp: "2026-08-13 14:20:00", error: "", templateId: "TPL-304" },
      { id: 207, notificationId: 2001, sentTo: "billing@acmecorp.us", serviceType: "Email", event: "Received", timestamp: "2026-08-13 14:20:50", error: "", templateId: "TPL-304" },
      { id: 208, notificationId: 2001, sentTo: "billing@acmecorp.us", serviceType: "Email", event: "Viewed", timestamp: "2026-08-13 15:00:00", error: "", templateId: "TPL-304" },
      { id: 209, notificationId: 2002, sentTo: "+44 20 7946 0991", serviceType: "SMS", event: "Skipped", timestamp: "2026-08-15 16:30:00", reason: "Country not Added in provider", templateId: "TPL-305" },
      { id: 210, notificationId: 2001, sentTo: "finance@globex.org", serviceType: "Email", event: "Sent", timestamp: "2026-08-17 08:45:00", error: "", templateId: "TPL-304" },
      { id: 211, notificationId: 2001, sentTo: "finance@globex.org", serviceType: "Email", event: "Failed", timestamp: "2026-08-17 08:45:20", error: "554 5.4.14 Hop count exceeded - possible mail loop", templateId: "TPL-304" },
      { id: 212, notificationId: 2002, sentTo: "+1 415-555-8902", serviceType: "SMS", event: "Sent", timestamp: "2026-08-19 11:10:00", error: "", templateId: "TPL-305" },
      { id: 213, notificationId: 2002, sentTo: "+1 415-555-8902", serviceType: "SMS", event: "Received", timestamp: "2026-08-19 11:10:04", error: "", templateId: "TPL-305" },
      { id: 214, notificationId: 2001, sentTo: "ops@initech.com", serviceType: "Email", event: "Sent", timestamp: "2026-08-21 13:40:00", error: "", templateId: "TPL-304" },
      { id: 215, notificationId: 2001, sentTo: "ops@initech.com", serviceType: "Email", event: "Received", timestamp: "2026-08-21 13:40:30", error: "", templateId: "TPL-304" },
      { id: 216, notificationId: 2001, sentTo: "ops@initech.com", serviceType: "Email", event: "Viewed", timestamp: "2026-08-21 14:15:00", error: "", templateId: "TPL-304" },
      { id: 217, notificationId: 2002, sentTo: "+1 415-555-4421", serviceType: "SMS", event: "Sent", timestamp: "2026-08-23 15:00:00", error: "", templateId: "TPL-305" },
      { id: 218, notificationId: 2002, sentTo: "+1 415-555-4421", serviceType: "SMS", event: "Failed", timestamp: "2026-08-23 15:00:15", error: "Carrier rejected: Unknown destination subscriber", templateId: "TPL-305" },
      { id: 219, notificationId: 2001, sentTo: "ceo@umbrella.corp", serviceType: "Email", event: "Sent", timestamp: "2026-08-25 09:30:00", error: "", templateId: "TPL-304" },
      { id: 220, notificationId: 2001, sentTo: "ceo@umbrella.corp", serviceType: "Email", event: "Received", timestamp: "2026-08-25 09:30:45", error: "", templateId: "TPL-304" },
      { id: 221, notificationId: 2001, sentTo: "accounting@hooli.xyz", serviceType: "Email", event: "Sent", timestamp: "2026-08-27 11:20:00", error: "", templateId: "TPL-304" },
      { id: 222, notificationId: 2001, sentTo: "accounting@hooli.xyz", serviceType: "Email", event: "Received", timestamp: "2026-08-27 11:20:25", error: "", templateId: "TPL-304" },
      { id: 223, notificationId: 2001, sentTo: "accounting@hooli.xyz", serviceType: "Email", event: "Viewed", timestamp: "2026-08-27 12:00:00", error: "", templateId: "TPL-304" },
      { id: 224, notificationId: 2002, sentTo: "+1 312-555-0144", serviceType: "SMS", event: "Sent", timestamp: "2026-08-29 14:00:00", error: "", templateId: "TPL-305" },
      { id: 225, notificationId: 2002, sentTo: "+1 312-555-0144", serviceType: "SMS", event: "Received", timestamp: "2026-08-29 14:00:06", error: "", templateId: "TPL-305" },
      { id: 226, notificationId: 2001, sentTo: "payments@vehement.org", serviceType: "Email", event: "Sent", timestamp: "2026-08-31 10:15:00", error: "", templateId: "TPL-304" },
      { id: 227, notificationId: 2001, sentTo: "payments@vehement.org", serviceType: "Email", event: "Received", timestamp: "2026-08-31 10:15:30", error: "", templateId: "TPL-304" },
      { id: 228, notificationId: 2002, sentTo: "+1 206-555-0177", serviceType: "SMS", event: "Sent", timestamp: "2026-09-02 16:45:00", error: "", templateId: "TPL-305" },
      { id: 229, notificationId: 2002, sentTo: "+1 206-555-0177", serviceType: "SMS", event: "Received", timestamp: "2026-09-02 16:45:05", error: "", templateId: "TPL-305" },
      { id: 230, notificationId: 2001, sentTo: "tech@cyberdyne.co", serviceType: "Email", event: "Sent", timestamp: "2026-09-04 12:00:00", error: "", templateId: "TPL-304" },
      { id: 231, notificationId: 2001, sentTo: "tech@cyberdyne.co", serviceType: "Email", event: "Received", timestamp: "2026-09-04 12:00:40", error: "", templateId: "TPL-304" },
      { id: 232, notificationId: 2001, sentTo: "tech@cyberdyne.co", serviceType: "Email", event: "Viewed", timestamp: "2026-09-04 12:50:00", error: "", templateId: "TPL-304" },
      { id: 233, notificationId: 2002, sentTo: "+1 617-555-0199", serviceType: "SMS", event: "Sent", timestamp: "2026-09-06 09:30:00", error: "", templateId: "TPL-305" },
      { id: 234, notificationId: 2002, sentTo: "+1 617-555-0199", serviceType: "SMS", event: "Received", timestamp: "2026-09-06 09:30:05", error: "", templateId: "TPL-305" },
      { id: 235, notificationId: 2001, sentTo: "billing@wayne.ent", serviceType: "Email", event: "Sent", timestamp: "2026-09-07 09:00:00", error: "", templateId: "TPL-304" },
      { id: 236, notificationId: 2001, sentTo: "billing@wayne.ent", serviceType: "Email", event: "Received", timestamp: "2026-09-07 09:00:25", error: "", templateId: "TPL-304" },
      { id: 237, notificationId: 2001, sentTo: "billing@wayne.ent", serviceType: "Email", event: "Viewed", timestamp: "2026-09-07 09:40:00", error: "", templateId: "TPL-304" },
    ],
    emailSettings: {
      providers: [{ id: 1, connectionName: "MantraAssist SES", provider: "SES", details: { clientId: "AKIAIOSFODNN7EXAMPLE", secretKey: "wJalrXU" } }],
      emailIds: [
        { id: 1, email: "contact@mantraassist.com", providerId: 1, priority: "High" }
      ]
    },
    smsSettings: {
      providers: [{ id: 1, connectionName: "MSG91 Main", provider: "MSG91", details: { authToken: "..." } }],
      numbers: [
        { id: 1, number: "+91 8888888888", providerId: 1, priority: "High" }
      ],
      senderIds: []
    }
  },
  EyeMantra: {
    templates: {
      "Appointment Booked": { 
        status: "Active",
        subject: "Appointment Confirmed", 
        email: "<h1>Booking Confirmed</h1><p>Hi {{client_name}}, your appointment at EyeMantra Hospital PaschimVihar is confirmed.</p>", 
        text: "Hi {{client_name}}, your appointment at EyeMantra Hospital PaschimVihar is confirmed." 
      },
      "Surgery Payment Received": { 
        status: "Active",
        subject: "Payment Receipt", 
        email: "<h1>Payment Successful</h1><p>We have received your payment for the eye surgery.</p>", 
        text: "We have received your payment for the eye surgery at EyeMantra." 
      },
      "Arrival at Hospital": { 
        status: "Active",
        subject: "Welcome to EyeMantra", 
        email: "<h1>Welcome</h1><p>Please proceed to the reception for your checkup.</p>", 
        text: "Welcome to EyeMantra! Please proceed to the reception." 
      },
      "Surgery Completed": { 
        status: "Active",
        subject: "Post-Surgery Instructions", 
        email: "<h1>Surgery Successful</h1><p>Here are your post-surgery care instructions...</p>", 
        text: "Your surgery was successful! Please check your email for care instructions." 
      },
      "Post-Surgery Checkup": { 
        status: "Active",
        subject: "Checkup Reminder", 
        email: "<h1>Reminder</h1><p>Your post-surgery checkup is scheduled for tomorrow.</p>", 
        text: "Reminder: Your post-surgery checkup is scheduled for tomorrow at EyeMantra." 
      },
      "Feedback Request": { 
        status: "Draft",
        subject: "How was your experience?", 
        email: "<h1>Feedback</h1><p>Please rate your surgery experience.</p>", 
        text: "Please rate your experience at EyeMantra Hospital." 
      },
    },
    triggers: [
      { id: 7, name: "appointment booked", eventType: "Booking", filterField: "Location", filterCondition: "equals PaschimVihar", tags: 3, lastEdited: "5 hours ago" },
      { id: 8, name: "surgery completed", eventType: "Medical", filterField: "Procedure", filterCondition: "any", tags: 1, lastEdited: "1 day ago" },
      { id: 9, name: "payment received", eventType: "Billing", filterField: "Amount", filterCondition: "greater than 0", tags: 0, lastEdited: "1 month ago" }
    ],
    notifications: [
      { 
        id: 3001, 
        status: "Active",
        templateName: "Appointment Booked",
        userType: "Patient", 
        name: "Pre-surgery instructions", 
        description: "Sent 2 days before surgery", 
        type: "SMS", 
        appNotificationType: "", 
        actionScreen: "", 
        action: "SMS Notification", 
        emailProvider: "", 
        senderEmail: "", 
        emailSubject: "", 
        emailContent: "", 
        smsContent: "Please remember to fast for 12 hours before your eye surgery.", 
        service: "Cataract Surgery", 
        orderPurchased: "Yes", 
        trigger: "appointment booked", 
        displayTrigger: "2 Days before surgery", 
        timing: "Scheduled", 
        eventType: "One-time", 
        scheduleDate: "", 
        scheduleTime: "", 
        scheduleTimezone: "IST (GMT+5:30)", 
        recurringFrequency: "", 
        recurringDays: [], 
        recurringTime: "", 
        recurringTimezone: "", 
        monthlySchedules: [], 
        visibleToAll: true, 
        selectedServices: [], 
        selectedCorporates: [], 
        appTextContent: "", 
        campaignType: "automated", 
        category: "Patient" 
      },
      {
        id: 3002,
        status: "Active",
        templateName: "Post-Surgery Checkup",
        userType: "Patient",
        name: "Post-Surgery Checkup Reminder",
        description: "Sent 1 day after procedure",
        type: "SMS",
        appNotificationType: "",
        actionScreen: "",
        action: "SMS Reminder",
        emailProvider: "",
        senderEmail: "",
        emailSubject: "",
        emailContent: "",
        smsContent: "Reminder: Your post-surgery checkup is scheduled for tomorrow at EyeMantra.",
        service: "LASIK",
        orderPurchased: "Yes",
        trigger: "surgery completed",
        displayTrigger: "1 Day after surgery",
        timing: "Scheduled",
        eventType: "One-time",
        scheduleDate: "",
        scheduleTime: "",
        scheduleTimezone: "IST (GMT+5:30)",
        recurringFrequency: "",
        recurringDays: [],
        recurringTime: "",
        recurringTimezone: "",
        monthlySchedules: [],
        visibleToAll: true,
        selectedServices: [],
        selectedCorporates: [],
        appTextContent: "",
        campaignType: "automated",
        category: "Patient"
      }
    ],
    logs: [
      { id: 301, notificationId: 3001, sentTo: "+91 9811122334", serviceType: "SMS", event: "Sent", timestamp: "2026-08-10 08:00:00", error: "", templateId: "TPL-901" },
      { id: 302, notificationId: 3001, sentTo: "+91 9811122334", serviceType: "SMS", event: "Received", timestamp: "2026-08-10 08:00:04", error: "", templateId: "TPL-901" },
      { id: 303, notificationId: 3001, sentTo: "+91 9811199999", serviceType: "SMS", event: "Sent", timestamp: "2026-08-12 08:05:00", error: "", templateId: "TPL-901" },
      { id: 304, notificationId: 3001, sentTo: "+91 9811199999", serviceType: "SMS", event: "Failed", timestamp: "2026-08-12 08:05:15", error: "Number unreachable / out of coverage", templateId: "TPL-901" },
      { id: 305, notificationId: 3002, sentTo: "+91 9711144556", serviceType: "SMS", event: "Sent", timestamp: "2026-08-14 09:30:00", error: "", templateId: "TPL-902" },
      { id: 306, notificationId: 3002, sentTo: "+91 9711144556", serviceType: "SMS", event: "Received", timestamp: "2026-08-14 09:30:05", error: "", templateId: "TPL-902" },
      { id: 307, notificationId: 3001, sentTo: "+91 9911188776", serviceType: "SMS", event: "Sent", timestamp: "2026-08-16 08:15:00", error: "", templateId: "TPL-901" },
      { id: 308, notificationId: 3001, sentTo: "+91 9911188776", serviceType: "SMS", event: "Received", timestamp: "2026-08-16 08:15:04", error: "", templateId: "TPL-901" },
      { id: 309, notificationId: 3002, sentTo: "+91 9611100223", serviceType: "SMS", event: "Sent", timestamp: "2026-08-18 10:00:00", error: "", templateId: "TPL-902" },
      { id: 310, notificationId: 3002, sentTo: "+91 9611100223", serviceType: "SMS", event: "Received", timestamp: "2026-08-18 10:00:06", error: "", templateId: "TPL-902" },
      { id: 311, notificationId: 3001, sentTo: "+1 408-555-0123", serviceType: "SMS", event: "Skipped", timestamp: "2026-08-20 11:30:00", reason: "Country not Added in provider", templateId: "TPL-901" },
      { id: 312, notificationId: 3002, sentTo: "+91 9511133445", serviceType: "SMS", event: "Sent", timestamp: "2026-08-22 09:10:00", error: "", templateId: "TPL-902" },
      { id: 313, notificationId: 3002, sentTo: "+91 9511133445", serviceType: "SMS", event: "Received", timestamp: "2026-08-22 09:10:04", error: "", templateId: "TPL-902" },
      { id: 314, notificationId: 3001, sentTo: "+91 9411155667", serviceType: "SMS", event: "Sent", timestamp: "2026-08-24 08:00:00", error: "", templateId: "TPL-901" },
      { id: 315, notificationId: 3001, sentTo: "+91 9411155667", serviceType: "SMS", event: "Received", timestamp: "2026-08-24 08:00:05", error: "", templateId: "TPL-901" },
      { id: 316, notificationId: 3002, sentTo: "+91 9311177889", serviceType: "SMS", event: "Sent", timestamp: "2026-08-26 10:15:00", error: "", templateId: "TPL-902" },
      { id: 317, notificationId: 3002, sentTo: "+91 9311177889", serviceType: "SMS", event: "Failed", timestamp: "2026-08-26 10:15:20", error: "Carrier rejected: Blacklisted spam score", templateId: "TPL-902" },
      { id: 318, notificationId: 3001, sentTo: "+91 9211199001", serviceType: "SMS", event: "Sent", timestamp: "2026-08-28 08:20:00", error: "", templateId: "TPL-901" },
      { id: 319, notificationId: 3001, sentTo: "+91 9211199001", serviceType: "SMS", event: "Received", timestamp: "2026-08-28 08:20:05", error: "", templateId: "TPL-901" },
      { id: 320, notificationId: 3002, sentTo: "+91 9111122334", serviceType: "SMS", event: "Sent", timestamp: "2026-08-30 09:40:00", error: "", templateId: "TPL-902" },
      { id: 321, notificationId: 3002, sentTo: "+91 9111122334", serviceType: "SMS", event: "Received", timestamp: "2026-08-30 09:40:04", error: "", templateId: "TPL-902" },
      { id: 322, notificationId: 3001, sentTo: "+91 9011144556", serviceType: "SMS", event: "Sent", timestamp: "2026-09-01 08:30:00", error: "", templateId: "TPL-901" },
      { id: 323, notificationId: 3001, sentTo: "+91 9011144556", serviceType: "SMS", event: "Received", timestamp: "2026-09-01 08:30:04", error: "", templateId: "TPL-901" },
      { id: 324, notificationId: 3002, sentTo: "+91 8911166778", serviceType: "SMS", event: "Sent", timestamp: "2026-09-03 10:00:00", error: "", templateId: "TPL-902" },
      { id: 325, notificationId: 3002, sentTo: "+91 8911166778", serviceType: "SMS", event: "Received", timestamp: "2026-09-03 10:00:06", error: "", templateId: "TPL-902" },
      { id: 326, notificationId: 3001, sentTo: "+91 8811188990", serviceType: "SMS", event: "Sent", timestamp: "2026-09-05 08:10:00", error: "", templateId: "TPL-901" },
      { id: 327, notificationId: 3001, sentTo: "+91 8811188990", serviceType: "SMS", event: "Received", timestamp: "2026-09-05 08:10:05", error: "", templateId: "TPL-901" },
      { id: 328, notificationId: 3002, sentTo: "+91 8711100112", serviceType: "SMS", event: "Sent", timestamp: "2026-09-07 09:15:00", error: "", templateId: "TPL-902" },
      { id: 329, notificationId: 3002, sentTo: "+91 8711100112", serviceType: "SMS", event: "Received", timestamp: "2026-09-07 09:15:04", error: "", templateId: "TPL-902" },
    ],
    emailSettings: {
      providers: [{ id: 1, connectionName: "EyeMantra Brevo", provider: "Brevo", details: { apiKey: "xkeysib-eyemantra" } }],
      emailIds: [
        { id: 1, email: "appointment@eyemantra.in", providerId: 1, priority: "High" },
        { id: 2, email: "clients@eyemantra.in", providerId: 1, priority: "Normal" }
      ]
    },
    smsSettings: {
      providers: [{ id: 1, connectionName: "BulkSMSGateway Default", provider: "BulkSMSGateway", details: { userName: "...", password: "..." } }],
      numbers: [
        { id: 1, number: "+91 7777777777", providerId: 1, priority: "High" }
      ],
      senderIds: []
    }
  }
};

export function NotificationProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState("MantraCare");
  const [organizations, setOrganizations] = useState(INITIAL_ORGANIZATIONS);
  const [allData, setAllData] = useState(MOCK_DATA);

  // Derived state with safe fallback for empty/new companies
  const activeData = allData[selectedCompany] || {
    templates: {},
    triggers: [],
    notifications: [],
    logs: [],
    emailSettings: { providers: [], emailIds: [] },
    smsSettings: { providers: [], numbers: [], senderIds: [] }
  };

  const templates = activeData.templates || {};
  const triggers = activeData.triggers || [];
  const notifications = activeData.notifications || [];
  const logs = activeData.logs || [];
  const emailSettings = activeData.emailSettings || { providers: [], emailIds: [] };
  const smsSettings = activeData.smsSettings || { providers: [], numbers: [], senderIds: [] };

  const addOrganization = (newOrg) => {
    // Determine unique id e.g. ORG-004
    const existingNums = organizations.map(o => {
      const match = o.id.match(/ORG-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const nextNum = (existingNums.length > 0 ? Math.max(...existingNums) : 0) + 1;
    const newId = `ORG-${String(nextNum).padStart(3, "0")}`;

    // Clean company key (fallback to sanitized name)
    const companyKey = (newOrg.companyKey || newOrg.name.replace(/[^a-zA-Z0-9]/g, "")).trim();

    const createdOrg = {
      id: newId,
      companyKey,
      name: newOrg.name || companyKey,
      website: newOrg.website || "",
      contactNumber: newOrg.contactNumber || "",
      contactEmail: newOrg.contactEmail || "",
      reportingType: newOrg.reportingType || "Webhook",
      webhooks: newOrg.webhooks || [],
      emailReports: newOrg.emailReports || []
    };

    setOrganizations(prev => [...prev, createdOrg]);

    // Create new empty company entry in allData
    setAllData(prev => ({
      ...prev,
      [companyKey]: {
        templates: {},
        triggers: [],
        notifications: [],
        logs: [],
        emailSettings: { providers: [], emailIds: [] },
        smsSettings: { providers: [], numbers: [], senderIds: [] }
      }
    }));

    return createdOrg;
  };

  const updateOrganization = (id, updatedFields) => {
    setOrganizations(prev => prev.map(org => org.id === id ? { ...org, ...updatedFields } : org));
  };

  const deleteOrganization = (id) => {
    setOrganizations(prev => {
      const remaining = prev.filter(org => org.id !== id);
      // If the currently selected company was deleted, switch to the first remaining org
      const deletedOrg = prev.find(org => org.id === id);
      if (deletedOrg && deletedOrg.companyKey === selectedCompany && remaining.length > 0) {
        setSelectedCompany(remaining[0].companyKey);
      }
      return remaining;
    });
  };

  const addNotification = (newNotification) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany] || {
        templates: {}, triggers: [], notifications: [], logs: [],
        emailSettings: { providers: [], emailIds: [] },
        smsSettings: { providers: [], numbers: [], senderIds: [] }
      };
      const maxId = companyData.notifications && companyData.notifications.length > 0 
        ? Math.max(...companyData.notifications.map(n => n.id)) 
        : 10000;
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          notifications: [...companyData.notifications, { id: maxId + 1, status: "Active", ...newNotification }]
        }
      };
    });
  };

  const deleteNotification = (id) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany];
      if (!companyData) return prev;
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          notifications: companyData.notifications.filter(n => n.id !== id)
        }
      };
    });
  };

  const updateNotification = (id, updatedNotification) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany];
      if (!companyData) return prev;
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          notifications: companyData.notifications.map(n => n.id === id ? { ...n, ...updatedNotification } : n)
        }
      };
    });
  };

  const addTrigger = (newTrigger) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany] || {
        templates: {}, triggers: [], notifications: [], logs: [],
        emailSettings: { providers: [], emailIds: [] },
        smsSettings: { providers: [], numbers: [], senderIds: [] }
      };
      const maxId = companyData.triggers && companyData.triggers.length > 0 
        ? Math.max(...companyData.triggers.map(t => t.id)) 
        : 0;
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          triggers: [...companyData.triggers, { id: maxId + 1, ...newTrigger }]
        }
      };
    });
  };

  const deleteTrigger = (id) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany];
      if (!companyData) return prev;
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          triggers: companyData.triggers.filter(t => t.id !== id)
        }
      };
    });
  };

  const updateTrigger = (id, updatedTrigger) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany];
      if (!companyData) return prev;
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          triggers: companyData.triggers.map(t => t.id === id ? { ...t, ...updatedTrigger } : t)
        }
      };
    });
  };

  const updateEmailSettings = (newEmailSettings) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany] || {};
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          emailSettings: newEmailSettings
        }
      };
    });
  };

  const updateSmsSettings = (newSmsSettings) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany] || {};
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          smsSettings: newSmsSettings
        }
      };
    });
  };

  const addTemplate = (templateName, templateData) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany] || {
        templates: {}, triggers: [], notifications: [], logs: [],
        emailSettings: { providers: [], emailIds: [] },
        smsSettings: { providers: [], numbers: [], senderIds: [] }
      };
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          templates: {
            ...companyData.templates,
            [templateName]: templateData
          }
        }
      };
    });
  };

  const updateTemplate = (oldName, newName, templateData) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany] || { templates: {} };
      const newTemplates = { ...companyData.templates };
      if (oldName !== newName) {
        delete newTemplates[oldName];
      }
      newTemplates[newName] = templateData;
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          templates: newTemplates
        }
      };
    });
  };

  const deleteTemplate = (templateName) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany] || { templates: {} };
      const newTemplates = { ...companyData.templates };
      delete newTemplates[templateName];
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          templates: newTemplates
        }
      };
    });
  };

  const updateTemplateStatus = (templateName, newStatus) => {
    setAllData(prev => {
      const companyData = prev[selectedCompany] || { templates: {} };
      const existingTpl = companyData.templates[templateName];
      if (!existingTpl) return prev;
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          templates: {
            ...companyData.templates,
            [templateName]: {
              ...existingTpl,
              status: newStatus
            }
          }
        }
      };
    });
  };

  const addLog = (logEntry) => {
    const newLog = {
      id: logEntry.id || Date.now(),
      notificationId: logEntry.notificationId || ("TEST-" + Math.floor(1000 + Math.random() * 9000)),
      serviceType: logEntry.serviceType || "Email",
      event: logEntry.event || "Sent",
      status: logEntry.status || "Delivered",
      sentTo: logEntry.sentTo || "user@example.com",
      timestamp: logEntry.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 19),
      payload: logEntry.payload || "",
      templateName: logEntry.templateName || "",
      isTest: logEntry.isTest !== undefined ? logEntry.isTest : true,
      ...logEntry
    };

    setAllData(prev => {
      const companyData = prev[selectedCompany] || { logs: [] };
      const currentLogs = companyData.logs || [];
      return {
        ...prev,
        [selectedCompany]: {
          ...companyData,
          logs: [newLog, ...currentLogs]
        }
      };
    });
    return newLog;
  };

  return (
    <NotificationContext.Provider
      value={{ 
        selectedCompany, setSelectedCompany,
        organizations, allData,
        addOrganization, updateOrganization, deleteOrganization,
        templates, notifications, logs, triggers, emailSettings, smsSettings,
        addNotification, deleteNotification, updateNotification,
        addTrigger, deleteTrigger, updateTrigger,
        updateEmailSettings, updateSmsSettings,
        addTemplate, updateTemplate, deleteTemplate, updateTemplateStatus,
        addLog
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
