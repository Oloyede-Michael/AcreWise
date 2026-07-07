import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  ArrowLeftRight, 
  Key, 
  Terminal, 
  Play, 
  Search, 
  Plus, 
  Compass, 
  Star, 
  ShieldAlert, 
  CheckCircle2, 
  LogOut, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Coins,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Code2,
  Lock,
  UserCheck,
  CreditCard,
  ArrowDownCircle,
  Receipt,
  ToggleLeft,
  ToggleRight,
  Info,
  Clock,
  ArrowRight,
  Send,
  Sliders,
  DollarSign,
  Zap,
  PhoneCall,
  Smartphone,
  Eye,
  Tv,
  Trash2,
  Tv2,
  Check,
  SmartphoneNfc,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  FolderLock,
  Download,
  Share2,
  Mail,
  User
} from 'lucide-react';

import { APIS_METADATA } from './apis_metadata';

const CONFIG = {
  parentAccountId: "f666ef9b-888e-4799-85ce-acb505b28023",
  subAccountId: "5a6c217c-010f-4c90-9517-382c9ec46595",
  clientKey: "e5e85b13-f560-4643-814e-c87435dbbc15",
  secretKey: "8/doS7Q3w77EANpk3vpgSrc05hhOiRWp3eBs01sXyZ1AmovtZUXlmrxie+xnEF2tR4q79t0IFufMD1d4JrkT8g=="
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // landing, login, dashboard
  const [userRole, setUserRole] = useState('tenant'); // landlord, tenant (restricted by userProfile.role)
  
  // Tab states
  const [landlordTab, setLandlordTab] = useState('overview'); // overview, properties, leases, escrow, unmatched, payouts, terminals, chat, developer
  const [tenantTab, setTenantTab] = useState('my-rent'); // my-rent, marketplace, receipts, chat

  // Profile Session States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [registerRole, setRegisterRole] = useState('TENANT');
  const [authMode, setAuthMode] = useState('login'); // login, register
  const [userProfile, setUserProfile] = useState(null); // { email, role, name }
  
  // Database Data States
  const [properties, setProperties] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [escrowTxns, setEscrowTxns] = useState([]);
  const [unmatchedPayments, setUnmatchedPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Chatroom States
  const [activeChatPropertyId, setActiveChatPropertyId] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInputText, setChatInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Receipts Vault
  const [userReceipts, setUserReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Caretaker Modal
  const [showCaretakerModal, setShowCaretakerModal] = useState(false);
  const [caretakerPropId, setCaretakerPropId] = useState('');
  const [caretakerForm, setCaretakerForm] = useState({ name: '', email: '', phone: '' });

  // Tenant marketplace purchase
  const [selectedMarketplaceProp, setSelectedMarketplaceProp] = useState(null);

  // Claims & Linking already owned houses
  const [claimVaNumber, setClaimVaNumber] = useState('');
  const [inviteTenantEmail, setInviteTenantEmail] = useState('');

  // Selected items
  const [selectedTenancyId, setSelectedTenancyId] = useState(null);
  
  // Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutTenancy, setCheckoutTenancy] = useState(null);
  const [checkoutOption, setCheckoutOption] = useState('exact'); // exact, partial, overpaid, custom
  const [customPayAmount, setCustomPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('flash'); // flash, card
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // null, otp_prompt, success, error
  const [checkoutOtp, setCheckoutOtp] = useState('');
  const [checkoutFlashAcct, setCheckoutFlashAcct] = useState(null);
  const [checkoutCardForm, setCheckoutCardForm] = useState({ name: '', number: '', expiry: '', cvv: '', pin: '' });
  
  // Tokenized Saved Cards
  const [tokenizedCards, setTokenizedCards] = useState([
    { id: "card_tok_1", cardToken: "tok_visa_4242", last4: "4242", brand: "Visa", expiry: "12/28" },
    { id: "card_tok_2", cardToken: "tok_mc_9981", last4: "9981", brand: "Mastercard", expiry: "09/27" }
  ]);
  const [selectedSavedCard, setSelectedSavedCard] = useState('');

  // POS Terminals State
  const [posTerminals, setPosTerminals] = useState([
    { id: "term_9921a", terminalId: "2NMB0987", serialNumber: "SN-9988210", status: "ACTIVE", dateAssigned: "2026-06-15T10:00:00.000Z" },
    { id: "term_8812c", terminalId: "2NMB1124", serialNumber: "SN-9988215", status: "ACTIVE", dateAssigned: "2026-06-20T14:30:00.000Z" }
  ]);
  const [fetchingTerminals, setFetchingTerminals] = useState(false);

  // Payouts & Utilities Tab States
  // Payout Sub-states
  const [payoutBankCode, setPayoutBankCode] = useState('058');
  const [payoutAcctNumber, setPayoutAcctNumber] = useState('');
  const [payoutVerifiedName, setPayoutVerifiedName] = useState('');
  const [payoutVerifying, setPayoutVerifying] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutPin, setPayoutPin] = useState('');
  const [payoutResult, setPayoutResult] = useState(null);

  // FX Conversion Sub-states
  const [fxAmount, setFxAmount] = useState('50000');
  const [fxTargetCurrency, setFxTargetCurrency] = useState('USD');
  const [fxExchangeId, setFxExchangeId] = useState('');
  const [fxRate, setFxRate] = useState(null);
  const [fxOtp, setFxOtp] = useState('');
  const [fxStep, setFxStep] = useState(1); // 1: input, 2: OTP
  const [fxResult, setFxResult] = useState('');

  // Utilities sub-states
  const [utilityType, setUtilityType] = useState('electricity'); // electricity, airtime, cable, betting
  const [discoCode, setDiscoCode] = useState('IKEDC');
  const [meterNumber, setMeterNumber] = useState('');
  const [meterOwner, setMeterOwner] = useState('');
  const [utilityAmount, setUtilityAmount] = useState('5000');
  const [utilityToken, setUtilityToken] = useState('');
  
  const [airtimeCarrier, setAirtimeCarrier] = useState('MTN');
  const [airtimePhone, setAirtimePhone] = useState('');
  const [airtimePlan, setAirtimePlan] = useState('airtime'); // airtime, data
  const [dataPlanCode, setDataPlanCode] = useState('mtn_10gb');

  // Cable TV Sub-states
  const [tvProvider, setTvProvider] = useState('DSTV');
  const [tvSmartcard, setTvSmartcard] = useState('');
  const [tvVerifiedName, setTvVerifiedName] = useState('');
  const [tvVerifying, setTvVerifying] = useState(false);
  const [tvPackageCode, setTvPackageCode] = useState('dstv_compact');
  const [tvResult, setTvResult] = useState('');

  // Betting Sub-states
  const [betProvider, setBetProvider] = useState('SportyBet');
  const [betCustomerId, setBetCustomerId] = useState('');
  const [betVerifiedName, setBetVerifiedName] = useState('');
  const [betVerifying, setBetVerifying] = useState(false);
  const [betAmount, setBetAmount] = useState('2000');
  const [betResult, setBetResult] = useState('');

  // Webhook Logs Console Tab and Items
  const [simulatorSubTab, setSimulatorSubTab] = useState('playground'); 
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([
    {
      id: "log_init_1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      eventType: "payment_success",
      reference: "tx_nomba_rec_4021",
      amount: 1200000,
      status: 200,
      reconciliation: "MATCHED",
      target: "va_eko_atlantic_rent",
      details: "Exact amount matched tenancy. Next due date advanced by 1 month."
    },
    {
      id: "log_init_2",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      eventType: "payment_success",
      reference: "tx_nomba_rec_8819",
      amount: 1000000,
      status: 200,
      reconciliation: "UNDERPAID",
      target: "va_lekki_villa_rent",
      details: "Shortfall of ₦2,500,000 recorded in arrears balance ledger."
    }
  ]);

  // API Playground States
  const [selectedApiIndex, setSelectedApiIndex] = useState(0);
  const [requestBodyInput, setRequestBodyInput] = useState('');
  const [apiResponseOutput, setApiResponseOutput] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Modals
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showTenancyModal, setShowTenancyModal] = useState(false);
  const [showMeterModal, setShowMeterModal] = useState(false);
  const [isProvisioningVa, setIsProvisioningVa] = useState(false);

  // Meter Linking States
  const [meterModalPropertyId, setMeterModalPropertyId] = useState('');
  const [meterFormNumber, setMeterFormNumber] = useState('');
  const [meterFormProvider, setMeterFormProvider] = useState('IKEDC');

  // Forms
  const [newProp, setNewProp] = useState({ title: '', type: 'RENT', status: 'LISTED', area: 'Lekki', buildingType: 'Penthouse', price: '2400000', totalUnits: '1', landlordName: 'Chinedu Okafor', landlordEmail: 'chinedu@acrewise.com', landlordPhone: '+2348031234567', imageUrl: '', firstPaymentAmount: '', paymentFrequency: 'ANNUAL', annualProjections: ['','','','',''], ownershipDocumentUrl: '' });
  const [newTenancy, setNewTenancy] = useState({ propertyId: '', tenantId: '', rentAmount: '1200000', frequency: 'MONTHLY', nextDueDate: '2026-08-01', nombaVirtualAccountId: '' });

  // Marketplace FX Converter
  const [mktFxRate, setMktFxRate] = useState(null);
  const [mktFxCurrency, setMktFxCurrency] = useState('USD');
  const [mktFxLoading, setMktFxLoading] = useState(false);

  const FX_CURRENCIES = ['USD','EUR','GBP','CAD','AUD','JPY','CNY','INR','ZAR','GHS'];

  async function fetchMarketplaceRate(currency) {
    setMktFxLoading(true);
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=NGN&to=${currency}`);
      const data = await res.json();
      setMktFxRate(data.rates[currency] || null);
    } catch { setMktFxRate(null); }
    setMktFxLoading(false);
  }

  useEffect(() => { fetchMarketplaceRate(mktFxCurrency); }, [mktFxCurrency]);

  // Web Crypto HMAC-SHA256 signing utility
  async function calculateSignature(hashingPayload, secretKey) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(hashingPayload);

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["sign"]
    );

    const signatureBuffer = await window.crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );

    const hashArray = new Uint8Array(signatureBuffer);
    let binaryString = "";
    for (let i = 0; i < hashArray.length; i++) {
      binaryString += String.fromCharCode(hashArray[i]);
    }
    return window.btoa(binaryString);
  }

  // --- REST / Webhook Simulator & Sandbox Helpers ---

  useEffect(() => {
    if (APIS_METADATA[selectedApiIndex]) {
      setRequestBodyInput(JSON.stringify(APIS_METADATA[selectedApiIndex].requestBody, null, 2));
    }
  }, [selectedApiIndex]);

  async function executePaymentSimulation(amount, virtualAccountId) {
    const transactionId = "tx_" + Math.random().toString(36).substring(2, 12);
    const requestId = "req_" + Math.random().toString(36).substring(2, 12);
    const timestamp = new Date().toISOString();
    
    const payload = {
      eventType: "payment_success",
      requestId: requestId,
      userId: "user_hackathon_2026",
      walletId: "wallet_reflow_live",
      transactionId: transactionId,
      type: "payout",
      time: timestamp,
      responseCode: "00",
      timestamp: timestamp,
      amount: amount,
      virtualAccountId: virtualAccountId
    };

    const hashString = `payment_success:${requestId}:user_hackathon_2026:wallet_reflow_live:${transactionId}:payout:${timestamp}:00:${timestamp}`;
    const signature = await calculateSignature(hashString, CONFIG.secretKey);

    try {
      const res = await fetch('/api/webhooks/nomba', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Nomba-Signature': signature
        },
        body: JSON.stringify(payload)
      });
      
      await loadData();
      
      const newLog = {
        id: "log_" + Math.random().toString(36).substring(2, 12),
        timestamp: new Date().toISOString(),
        eventType: "payment_success",
        reference: transactionId,
        amount: amount,
        status: res.status,
        reconciliation: amount >= 1200000 ? "MATCHED" : "UNDERPAID",
        target: virtualAccountId,
        details: `Simulated inbound payment to VA ${virtualAccountId} of ₦${amount.toLocaleString()}. Status: ${res.status}`,
        payload: JSON.stringify(payload, null, 2)
      };
      setWebhookLogs(prev => [newLog, ...prev]);
    } catch (err) {
      console.error("Simulation trigger failed:", err);
    }
  }

  async function handleExecutePlaygroundApi() {
    setApiLoading(true);
    setApiResponseOutput(null);
    const api = APIS_METADATA[selectedApiIndex];
    
    let bodyObj = {};
    try {
      bodyObj = JSON.parse(requestBodyInput || '{}');
    } catch(e) {
      alert("Invalid JSON format.");
      setApiLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: api.name,
          method: api.method,
          url: api.url,
          body: bodyObj,
          mockResponse: api.responseBody
        })
      });
      const data = await res.json();
      setApiResponseOutput(data);
    } catch (err) {
      setApiResponseOutput({ error: "Failed to connect to Sandbox execution server." });
    }
    setApiLoading(false);
  }

  function handleAutofillMeterSelection(propertyId) {
    if (!propertyId) return;
    const prop = properties.find(p => p.id === propertyId);
    if (prop && prop.meterNumber) {
      setMeterNumber(prop.meterNumber);
      setDiscoCode(prop.meterProvider || 'IKEDC');
      setMeterOwner("Auto-filled from: " + prop.title);
    } else {
      alert("No meter linked to selected property.");
    }
  }

  async function handleCreateTenancy(e) {
    e.preventDefault();
    setLoading(true);
    const mutation = `
      mutation {
        createTenancy(
          propertyId: "${newTenancy.propertyId}",
          tenantId: "${newTenancy.tenantId || 'tenant@reflow.com'}",
          rentAmount: ${parseFloat(newTenancy.rentAmount)},
          frequency: "${newTenancy.frequency}",
          nextDueDate: "${newTenancy.nextDueDate}",
          nombaVirtualAccountId: "${newTenancy.nombaVirtualAccountId}"
        ) {
          id
        }
      }
    `;
    const data = await fetchGraphQL(mutation);
    if (data && data.createTenancy) {
      setShowTenancyModal(false);
      setNewTenancy({ propertyId: '', tenantId: '', rentAmount: '1200000', frequency: 'MONTHLY', nextDueDate: '2026-08-01', nombaVirtualAccountId: '' });
      await loadData();
      alert("Agreement established and virtual account mapped!");
    } else {
      alert("Establishment failed.");
    }
    setLoading(false);
  }

  // GraphQL Helper
  async function fetchGraphQL(query, variables = {}) {
    try {
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      const result = await res.json();
      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
      }
      return result.data;
    } catch (err) {
      console.error("GraphQL network error:", err);
      return null;
    }
  }

  // Load database
  async function loadData() {
    setLoading(true);
    const query = `
      query {
        getProperties {
          id
          title
          type
          status
          verificationStatus
          meterNumber
          meterProvider
          area
          buildingType
          price
          caretakerName
          caretakerEmail
          caretakerPhone
          totalUnits
          availableUnits
          imageUrl
          firstPaymentAmount
          paymentFrequency
          annualProjections
          isAssured
          landlord {
            id
            name
            email
            phone
          }
        }
        getTenancies {
          id
          tenantId
          rentAmount
          frequency
          nextDueDate
          balance
          nombaVirtualAccountId
          property {
            id
            title
            meterNumber
            meterProvider
            area
            buildingType
            price
            caretakerName
            caretakerEmail
            caretakerPhone
            landlord {
              name
            }
          }
        }
        getEscrowTransactions {
          id
          buyerId
          amountHeld
          status
          nombaVirtualAccountId
          property {
            id
            title
            landlord {
              name
            }
          }
        }
        getUnmatchedQueue {
          id
          amount
          nombaReference
          matchedStatus
          receivedAt
        }
      }
    `;
    const data = await fetchGraphQL(query);
    if (data) {
      setProperties(data.getProperties || []);
      setTenancies(data.getTenancies || []);
      setEscrowTxns(data.getEscrowTransactions || []);
      setUnmatchedPayments(data.getUnmatchedQueue || []);
      
      if (data.getTenancies && data.getTenancies.length > 0 && !selectedTenancyId) {
        setSelectedTenancyId(data.getTenancies[0].id);
      }
    }
    setLoading(false);
  }

  // Load Receipts & Chats
  useEffect(() => {
    if (userProfile) {
      loadReceipts();
    }
  }, [userProfile]);

  // Load Chat Messages
  useEffect(() => {
    if (activeChatPropertyId) {
      loadChatMessages(activeChatPropertyId);
    }
  }, [activeChatPropertyId]);

  async function loadReceipts() {
    if (!userProfile) return;
    const query = `
      query {
        getReceipts(tenantEmail: "${userProfile.email}") {
          id
          title
          category
          amount
          reference
          details
          tenantEmail
          createdAt
        }
      }
    `;
    const data = await fetchGraphQL(query);
    if (data) {
      setUserReceipts(data.getReceipts || []);
    }
  }

  async function loadChatMessages(propertyId) {
    setChatLoading(true);
    const query = `
      query {
        getChatMessages(propertyId: "${propertyId}") {
          id
          senderEmail
          senderRole
          message
          createdAt
        }
      }
    `;
    const data = await fetchGraphQL(query);
    if (data) {
      setChatMessages(data.getChatMessages || []);
    }
    setChatLoading(false);
  }

  // Seed demo
  async function seedDemoData() {
    setLoading(true);
    const landlordMutation = `
      mutation {
        createLandlord(name: "Chinedu Okafor", email: "chinedu@acrewise.com", phone: "+234 803 123 4567") {
          id
        }
      }
    `;
    const landlordData = await fetchGraphQL(landlordMutation);
    if (!landlordData || !landlordData.createLandlord) {
      setLoading(false);
      return;
    }
    const landlordId = landlordData.createLandlord.id;

    // Use full listProperty mutation to seed with area, type, and price
    const prop1Mutation = `
      mutation {
        listProperty(
          landlordId: "${landlordId}", 
          title: "Eko Atlantic Towers, Apt 4B", 
          type: "RENT", 
          status: "LISTED",
          area: "Eko Atlantic",
          buildingType: "High-Rise Apartment",
          price: 1200000.0
        ) { id }
      }
    `;
    const prop2Mutation = `
      mutation {
        listProperty(
          landlordId: "${landlordId}", 
          title: "Lekki Peninsula Villa, Phase 1", 
          type: "RENT", 
          status: "LET",
          area: "Lekki Phase 1",
          buildingType: "Duplex Villa",
          price: 3500000.0
        ) { id }
      }
    `;
    const prop3Mutation = `
      mutation {
        listProperty(
          landlordId: "${landlordId}", 
          title: "Banana Island Mansion", 
          type: "SALE", 
          status: "UNDER_ESCROW",
          area: "Banana Island",
          buildingType: "Penthouse Mansion",
          price: 45000000.0
        ) { id }
      }
    `;

    const p1 = await fetchGraphQL(prop1Mutation);
    const p2 = await fetchGraphQL(prop2Mutation);
    const p3 = await fetchGraphQL(prop3Mutation);

    if (p1 && p1.listProperty) {
      const t1Mutation = `
        mutation {
          createTenancy(
            propertyId: "${p1.listProperty.id}",
            tenantId: "tenant@acrewise.com",
            rentAmount: 1200000.0,
            frequency: "MONTHLY",
            nextDueDate: "2026-08-01",
            nombaVirtualAccountId: "va_eko_atlantic_rent"
          ) { id }
        }
      `;
      await fetchGraphQL(t1Mutation);
    }

    if (p2 && p2.listProperty) {
      const t2Mutation = `
        mutation {
          createTenancy(
            propertyId: "${p2.listProperty.id}",
            tenantId: "tenant2@acrewise.com",
            rentAmount: 3500000.0,
            frequency: "ANNUAL",
            nextDueDate: "2026-07-15",
            nombaVirtualAccountId: "va_lekki_villa_rent"
          ) { id }
        }
      `;
      await fetchGraphQL(t2Mutation);
    }

    if (p3 && p3.listProperty) {
      const eMutation = `
        mutation {
          createEscrowTransaction(
            propertyId: "${p3.listProperty.id}",
            buyerId: "buyer@acrewise.com",
            amountHeld: 45000000.0,
            nombaVirtualAccountId: "va_banana_island_escrow"
          ) { id }
        }
      `;
      await fetchGraphQL(eMutation);
    }

    await loadData();
    setLoading(false);
  }

  // Claim Tenancy / Register Rented House
  async function handleClaimTenancy(e) {
    e.preventDefault();
    if (!claimVaNumber) {
      alert("Enter a virtual account ID!");
      return;
    }
    setLoading(true);
    // Find tenancy matching VA
    const matched = tenancies.find(t => t.nombaVirtualAccountId === claimVaNumber);
    if (!matched) {
      alert("No active lease matches this Virtual Account Reference.");
      setLoading(false);
      return;
    }
    // Update tenant email via createTenancy override mapping
    const mutation = `
      mutation {
        createTenancy(
          propertyId: "${matched.property.id}",
          tenantId: "${userProfile.email}",
          rentAmount: ${matched.rentAmount},
          frequency: "${matched.frequency}",
          nextDueDate: "${matched.nextDueDate}",
          nombaVirtualAccountId: "${matched.nombaVirtualAccountId}"
        ) {
          id
        }
      }
    `;
    const data = await fetchGraphQL(mutation);
    if (data) {
      setClaimVaNumber('');
      await loadData();
      alert("Rented property claimed and successfully mapped to your profile!");
    } else {
      alert("Mapping failed.");
    }
    setLoading(false);
  }

  // Profile Register / Login
  async function handleUserProfileLogin(e) {
    e.preventDefault();
    if (!loginEmail) {
      alert("Please enter a valid email address!");
      return;
    }
    setLoading(true);

    if (authMode === 'login') {
      const loginQuery = `
        query {
          getUserProfile(email: "${loginEmail.toLowerCase()}") {
            id
            email
            role
            name
          }
        }
      `;
      const data = await fetchGraphQL(loginQuery);
      if (data && data.getUserProfile) {
        const profile = data.getUserProfile;
        setUserProfile(profile);
        setUserRole(profile.role.toLowerCase()); // Auto-set active role
        setCurrentView('dashboard');
        await loadData();
      } else {
        alert("No profile found with this email. Please switch to the Register tab to create your profile.");
      }
    } else {
      const registerMutation = `
        mutation {
          registerUserProfile(
            email: "${loginEmail.toLowerCase()}", 
            name: "${loginName || loginEmail.split('@')[0]}",
            role: "${registerRole}"
          ) {
            id
            email
            role
            name
          }
        }
      `;
      const data = await fetchGraphQL(registerMutation);
      if (data && data.registerUserProfile) {
        const profile = data.registerUserProfile;
        setUserProfile(profile);
        setUserRole(profile.role.toLowerCase()); // Auto-set active role
        setCurrentView('dashboard');
        await loadData();
      } else {
        alert("Authentication portal failed to load profile.");
      }
    }
    setLoading(false);
  }

  // Upgrade to Landlord
  async function handleUpgradeProfile() {
    if (!userProfile) return;
    setLoading(true);
    const upgradeMutation = `
      mutation {
        upgradeToLandlord(email: "${userProfile.email}") {
          id
          email
          role
          name
        }
      }
    `;
    const data = await fetchGraphQL(upgradeMutation);
    if (data && data.upgradeToLandlord) {
      const updatedProfile = data.upgradeToLandlord;
      setUserProfile(updatedProfile);
      setUserRole('landlord'); // Switch to landlord role
      alert("Upgrade successful! Landlord core tools are now fully unlocked.");
    } else {
      alert("Could not process role upgrade.");
    }
    setLoading(false);
  }

  // GraphQL Property Meter linking mutation trigger
  async function handleLinkMeter(e) {
    e.preventDefault();
    setLoading(true);
    const linkMutation = `
      mutation {
        linkPropertyMeter(
          propertyId: "${meterModalPropertyId}",
          meterNumber: "${meterFormNumber}",
          meterProvider: "${meterFormProvider}"
        ) {
          id
          meterNumber
          meterProvider
        }
      }
    `;
    const data = await fetchGraphQL(linkMutation);
    if (data && data.linkPropertyMeter) {
      setShowMeterModal(false);
      setMeterFormNumber('');
      await loadData();
      alert("Utility meter successfully linked and mapped!");
    } else {
      alert("Failed to link meter.");
    }
    setLoading(false);
  }

  // Submit Listing Property (extended with area, buildingType, price, image, payment schedule)
  async function handleListProperty(e) {
    e.preventDefault();
    setLoading(true);

    const landlordMutation = `
      mutation {
        createLandlord(name: "${userProfile.name}", email: "${userProfile.email}", phone: "+23480000000") {
          id
        }
      }
    `;
    const landlordData = await fetchGraphQL(landlordMutation);
    if (landlordData && landlordData.createLandlord) {
      const landlordId = landlordData.createLandlord.id;
      const projStr = JSON.stringify(newProp.annualProjections.map(v => parseFloat(v)||0));
      const hasOwnerDoc = newProp.ownershipDocumentUrl && newProp.ownershipDocumentUrl.trim();
      const propMutation = `
        mutation {
          listProperty(
            landlordId: "${landlordId}",
            title: "${newProp.title}",
            type: "${newProp.type}",
            status: "${newProp.status}",
            area: "${newProp.area}",
            buildingType: "${newProp.buildingType}",
            price: ${parseFloat(newProp.price)},
            totalUnits: ${parseInt(newProp.totalUnits) || 1}
            ${newProp.imageUrl ? `, imageUrl: "${newProp.imageUrl}"` : ''}
            ${newProp.firstPaymentAmount ? `, firstPaymentAmount: ${parseFloat(newProp.firstPaymentAmount)}` : ''}
            , paymentFrequency: "${newProp.paymentFrequency}"
            , annualProjections: "${projStr.replace(/"/g,'\\"')}"
            ${hasOwnerDoc ? `, ownershipDocumentUrl: "${newProp.ownershipDocumentUrl}"` : ''}
          ) {
            id
          }
        }
      `;
      const propData = await fetchGraphQL(propMutation);
      if (propData && propData.listProperty) {
        const propId = propData.listProperty.id;
        if (inviteTenantEmail) {
          const generatedVa = "va_" + Math.random().toString(36).substring(2, 10);
          const tenancyMutation = `
            mutation {
              createTenancy(
                propertyId: "${propId}",
                tenantId: "${inviteTenantEmail.toLowerCase()}",
                rentAmount: ${parseFloat(newProp.price)},
                frequency: "${newProp.paymentFrequency}",
                nextDueDate: "2026-08-01",
                nombaVirtualAccountId: "${generatedVa}"
              ) { id }
            }
          `;
          await fetchGraphQL(tenancyMutation);
          setInviteTenantEmail('');
        }
        setShowPropertyModal(false);
        await loadData();
      }
    }
    setLoading(false);
  }

  // Assign Caretaker Submit
  async function handleAssignCaretaker(e) {
    e.preventDefault();
    setLoading(true);
    const mutation = `
      mutation {
        assignPropertyCaretaker(
          propertyId: "${caretakerPropId}",
          name: "${caretakerForm.name}",
          email: "${caretakerForm.email}",
          phone: "${caretakerForm.phone}"
        ) {
          id
          caretakerName
        }
      }
    `;
    const data = await fetchGraphQL(mutation);
    if (data && data.assignPropertyCaretaker) {
      setShowCaretakerModal(false);
      setCaretakerForm({ name: '', email: '', phone: '' });
      await loadData();
      alert("Caretaker assigned and mapped successfully!");
    } else {
      alert("Failed to map caretaker.");
    }
    setLoading(false);
  }

  // Send Locked Chat Room Message
  async function handleSendChatMessage(e) {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    const msgMutation = `
      mutation {
        sendChatMessage(
          propertyId: "${activeChatPropertyId}",
          senderEmail: "${userProfile.email}",
          senderRole: "${userRole.toUpperCase()}",
          message: "${chatInputText}"
        ) {
          id
        }
      }
    `;
    const data = await fetchGraphQL(msgMutation);
    if (data && data.sendChatMessage) {
      setChatInputText('');
      await loadChatMessages(activeChatPropertyId);
    }
  }

  // Provision Virtual Account directly using Sandbox Executor
  async function handleProvisionVirtualAccount() {
    setIsProvisioningVa(true);
    const mockVirtualAcctSpec = APIS_METADATA.find(a => a.name === "Create virtual account for a sub account");
    const accountRef = "ref_" + Math.random().toString(36).substring(2, 12);
    
    const requestBody = {
      accountRef: accountRef,
      accountName: "AcreWise Tenant VA",
      bvn: "12345678"
    };

    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mockVirtualAcctSpec.name,
          method: mockVirtualAcctSpec.method,
          url: `/v1/accounts/virtual/${CONFIG.subAccountId}`,
          body: requestBody,
          mockResponse: mockVirtualAcctSpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        const generatedVa = data.data.bankAccountNumber;
        setNewTenancy({ ...newTenancy, nombaVirtualAccountId: generatedVa });
        alert(`Successfully provisioned virtual account! \nAccount Number: ${generatedVa}\nBank Name: ${data.data.bankName}`);
      } else {
        alert("Nomba Virtual Account service returned an error status.");
      }
    } catch (err) {
      alert("Failed to connect to Nomba Virtual Account service.");
    }
    setIsProvisioningVa(false);
  }

  // Fetch POS terminals assigned to Sub account
  async function fetchNombaTerminals() {
    setFetchingTerminals(true);
    const terminalsSpec = APIS_METADATA.find(a => a.name === "Fetch terminals assigned to a sub account");
    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: terminalsSpec.name,
          method: terminalsSpec.method,
          url: `/v1/terminals/sub-account/${CONFIG.subAccountId}`,
          body: {},
          mockResponse: terminalsSpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        const mapped = data.data.map((term, i) => ({
          id: "term_sandbox_" + i,
          terminalId: term.terminalId || `2NMB${1000 + i}`,
          serialNumber: term.serialNumber || `SN-${9988000 + i}`,
          status: term.status || "ACTIVE",
          dateAssigned: new Date().toISOString()
        }));
        setPosTerminals(mapped);
        alert("Successfully synced POS Terminal rosters from Nomba Sandbox!");
      }
    } catch(err) {
      alert("Could not load sub-account terminals.");
    }
    setFetchingTerminals(false);
  }

  // Landlord Bank verification lookup
  async function handleBankLookup() {
    if (!payoutAcctNumber || payoutAcctNumber.length !== 10) {
      alert("Enter a valid 10-digit account number!");
      return;
    }
    setPayoutVerifying(true);
    setPayoutVerifiedName('');
    const lookupSpec = APIS_METADATA.find(a => a.name === "Perform bank account lookup");
    
    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lookupSpec.name,
          method: lookupSpec.method,
          url: lookupSpec.url,
          body: {
            accountNumber: payoutAcctNumber,
            bankCode: payoutBankCode
          },
          mockResponse: lookupSpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        setPayoutVerifiedName(data.data.accountName);
      } else {
        alert("Verification failed. Check account credentials.");
      }
    } catch(err) {
      alert("Lookup lookup failed.");
    }
    setPayoutVerifying(false);
  }

  // Confirm payout transfer
  async function handleConfirmPayout(e) {
    e.preventDefault();
    if (!payoutVerifiedName) {
      alert("Please verify recipient account coordinates first!");
      return;
    }
    setLoading(true);
    const transferSpec = APIS_METADATA.find(a => a.name === "Perform bank account transfer from the sub account");

    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: transferSpec.name,
          method: transferSpec.method,
          url: transferSpec.url,
          body: {
            subAccountId: CONFIG.subAccountId,
            amount: parseFloat(payoutAmount),
            accountNumber: payoutAcctNumber,
            accountName: payoutVerifiedName,
            bankCode: payoutBankCode,
            merchantTxRef: "UNQ_" + Math.random().toString(36).substring(2, 10),
            narration: "AcreWise Rent Payout"
          },
          mockResponse: transferSpec.responseBody
        })
      });
      const data = await res.json();
      setPayoutResult(data);
      
      // Save Receipt
      await saveReceipt("Bank Transfer Payout", "RENT", parseFloat(payoutAmount), data.data.id || "tx_payout", `Transfer of ₦${payoutAmount} to ${payoutVerifiedName}`);

      alert(`Transfer Completed! Ref: ${data.data.id}. Status: ${data.description}`);
      setPayoutAmount('');
      setPayoutAcctNumber('');
      setPayoutVerifiedName('');
    } catch(err) {
      alert("Transfer failed.");
    }
    setLoading(false);
  }

  // FX Convert rates lookup
  async function handleFxConvert() {
    setLoading(true);
    const fxSpec = APIS_METADATA.find(a => a.name === "Convert money");
    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fxSpec.name,
          method: fxSpec.method,
          url: fxSpec.url,
          body: {
            fromCurrency: "NGN",
            toCurrency: fxTargetCurrency,
            amount: parseFloat(fxAmount)
          },
          mockResponse: fxSpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        setFxExchangeId(data.data.exchangeId);
        setFxRate(data.data.rate);
        setFxStep(2); // Prompt OTP
      }
    } catch (err) {
      alert("FX Rate fetch failed.");
    }
    setLoading(false);
  }

  // Confirm FX conversion
  async function handleConfirmFx() {
    setLoading(true);
    const authSpec = APIS_METADATA.find(a => a.name === "Authorize exchange");
    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authSpec.name,
          method: authSpec.method,
          url: authSpec.url,
          body: {
            exchangeId: fxExchangeId,
            otp: fxOtp
          },
          mockResponse: authSpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        setFxResult(`Exchange Authorized! Converted ₦${fxAmount} at rate ${fxRate}. Target Balance Credited.`);
        
        // Save Receipt
        await saveReceipt("Currency Conversion", "RENT", parseFloat(fxAmount), fxExchangeId, `Converted NGN to ${fxTargetCurrency} at rate ${fxRate}`);

        setFxStep(1);
        setFxOtp('');
      }
    } catch(err) {
      alert("Verification failed.");
    }
    setLoading(false);
  }

  // Check meter owner
  async function handleCheckMeter() {
    if (!meterNumber) {
      alert("Enter a valid meter number!");
      return;
    }
    setMeterOwner("Loading...");
    setTimeout(() => {
      setMeterOwner("Verified Renter - Meter ID: " + meterNumber);
    }, 1000);
  }

  // Save receipt to locker
  async function saveReceipt(title, category, amount, reference, details) {
    if (!userProfile) return;
    const mutation = `
      mutation {
        createReceipt(
          title: "${title}",
          category: "${category}",
          amount: ${parseFloat(amount)},
          reference: "${reference}",
          details: "${details}",
          tenantEmail: "${userProfile.email}"
        ) {
          id
        }
      }
    `;
    await fetchGraphQL(mutation);
    await loadReceipts();
  }

  // Vend electricity tokens
  async function handleVendElectricity(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
      const tokens = Array.from({length: 5}, () => Math.floor(1000 + Math.random() * 9000)).join('-');
      setUtilityToken(tokens);
      setLoading(false);

      // Save Receipt
      await saveReceipt("Electricity Token Purchase", "UTILITY", parseFloat(utilityAmount), "MTR_" + Math.random().toString(36).substring(2, 10), `Electricity disco: ${discoCode}. Meter: ${meterNumber}. Token: ${tokens}`);

      alert("Electricity Token generated successfully!");
    }, 1500);
  }

  // Buy Airtime/Data
  async function handleVendAirtime(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      const reference = "AIR_" + Math.random().toString(36).substring(2, 10);
      
      // Save Receipt
      await saveReceipt("Mobile Airtime / Data", "UTILITY", 3000, reference, `Vended to ${airtimePhone} under plan: ${airtimePlan}`);

      alert(`Successfully vended ${airtimePlan === 'airtime' ? 'Airtime' : 'Data bundle'} to ${airtimePhone}!`);
      setAirtimePhone('');
    }, 1200);
  }

  // Verify Cable TV Smartcard
  async function handleVerifyCableTv() {
    if (!tvSmartcard) {
      alert("Enter a smartcard number!");
      return;
    }
    setTvVerifying(true);
    setTvVerifiedName('');
    const tvSpec = APIS_METADATA.find(a => a.name === "Verify customer TV service details");
    if (!tvSpec) {
      setTimeout(() => {
        setTvVerifiedName("Animashaun Chinedu (DSTV Compact Premium)");
        setTvVerifying(false);
      }, 800);
      return;
    }
    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tvSpec.name,
          method: tvSpec.method,
          url: tvSpec.url,
          body: {
            cardNumber: tvSmartcard,
            service: tvProvider
          },
          mockResponse: tvSpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        setTvVerifiedName(data.data.name);
      }
    } catch(err) {
      alert("Verification failed.");
    }
    setTvVerifying(false);
  }

  // Vend Cable TV Sub
  async function handleVendCableTv(e) {
    e.preventDefault();
    if (!tvVerifiedName) {
      alert("Verify card details first!");
      return;
    }
    setLoading(true);
    const tvVendSpec = APIS_METADATA.find(a => a.name === "Vend TV service subscription");
    if (!tvVendSpec) {
      setTimeout(async () => {
        const reference = "TV_ORD_" + Math.floor(100000 + Math.random() * 900000);
        setTvResult(`Cable TV subscription active! Receipt: ${reference}`);
        
        // Save Receipt
        await saveReceipt("Cable TV Subscription", "CABLE", 5100, reference, `Vended to Smartcard: ${tvSmartcard} (${tvProvider}) Package: ${tvPackageCode}`);

        setTvSmartcard('');
        setTvVerifiedName('');
        setLoading(false);
      }, 1000);
      return;
    }
    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tvVendSpec.name,
          method: tvVendSpec.method,
          url: tvVendSpec.url,
          body: {
            cardNumber: tvSmartcard,
            amount: 5100,
            packageCode: tvPackageCode
          },
          mockResponse: tvVendSpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        setTvResult(`Cable TV subscription active! Receipt: ${data.data.orderId}`);
        
        // Save Receipt
        await saveReceipt("Cable TV Subscription", "CABLE", 5100, data.data.orderId, `Vended to Smartcard: ${tvSmartcard} (${tvProvider})`);

        setTvSmartcard('');
        setTvVerifiedName('');
      }
    } catch(err) {
      alert("Vending failed.");
    }
    setLoading(false);
  }

  // Verify Betting ID
  async function handleVerifyBetId() {
    if (!betCustomerId) {
      alert("Enter a customer account ID!");
      return;
    }
    setBetVerifying(true);
    setBetVerifiedName('');
    const betVerifySpec = APIS_METADATA.find(a => a.name === "Verify betting customer details");
    if (!betVerifySpec) {
      setTimeout(() => {
        setBetVerifiedName("Okafor Daniel (SportyBet Player Account)");
        setBetVerifying(false);
      }, 800);
      return;
    }
    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: betVerifySpec.name,
          method: betVerifySpec.method,
          url: betVerifySpec.url,
          body: {
            customerId: betCustomerId,
            provider: betProvider
          },
          mockResponse: betVerifySpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        setBetVerifiedName(data.data.customerName);
      }
    } catch(err) {
      alert("Customer check failed.");
    }
    setBetVerifying(false);
  }

  // Vend Betting Topup
  async function handleVendBetting(e) {
    e.preventDefault();
    if (!betVerifiedName) {
      alert("Verify customer account first!");
      return;
    }
    setLoading(true);
    const betVendSpec = APIS_METADATA.find(a => a.name === "Vend betting wallet top up");
    if (!betVendSpec) {
      setTimeout(async () => {
        const reference = "BET_TXN_" + Math.floor(100000 + Math.random() * 900000);
        setBetResult(`Betting Wallet Topup Successful! Ref: ${reference}`);
        
        // Save Receipt
        await saveReceipt("Betting Wallet Credit", "BETTING", parseFloat(betAmount), reference, `Credited betting account: ${betCustomerId} (${betProvider})`);

        setBetCustomerId('');
        setBetVerifiedName('');
        setLoading(false);
      }, 1000);
      return;
    }
    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: betVendSpec.name,
          method: betVendSpec.method,
          url: betVendSpec.url,
          body: {
            customerId: betCustomerId,
            amount: parseFloat(betAmount),
            provider: betProvider
          },
          mockResponse: betVendSpec.responseBody
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        setBetResult(`Betting Wallet Topup Successful! Ref: ${data.data.transactionRef}`);
        
        // Save Receipt
        await saveReceipt("Betting Wallet Credit", "BETTING", parseFloat(betAmount), data.data.transactionRef, `Credited betting account: ${betCustomerId} (${betProvider})`);

        setBetCustomerId('');
        setBetVerifiedName('');
      }
    } catch(err) {
      alert("Betting payment failed.");
    }
    setLoading(false);
  }

  // Revoke tokenized card credentials
  async function handleRevokeCardToken(tokenId) {
    if (confirm("Are you sure you want to revoke this saved card tokenized authorization?")) {
      const delCardSpec = APIS_METADATA.find(a => a.name === "Delete tokenized card data");
      try {
        await fetch('/api/nomba-sandbox/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: delCardSpec.name,
            method: delCardSpec.method,
            url: delCardSpec.url,
            body: { cardToken: tokenId },
            mockResponse: delCardSpec.responseBody
          })
        });
        setTokenizedCards(prev => prev.filter(c => c.cardToken !== tokenId));
        alert("Card token revoked successfully and card details removed.");
      } catch(err) {
        alert("Failed to delete tokenized card.");
      }
    }
  }

  // Checkout modal pay
  async function handleCheckoutPortalPay() {
    let amt = checkoutTenancy.rentAmount;
    if (checkoutOption === 'partial') amt = checkoutTenancy.rentAmount * 0.75;
    if (checkoutOption === 'overpaid') amt = checkoutTenancy.rentAmount * 1.25;
    if (checkoutOption === 'custom') amt = parseFloat(customPayAmount) || 0;

    setIsPaying(true);

    if (payMethod === 'flash') {
      // Flash payment
      const flashSpec = APIS_METADATA.find(a => a.name === "Fetch checkout Flash account number for transfer payment.");
      try {
        const res = await fetch('/api/nomba-sandbox/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: flashSpec.name,
            method: flashSpec.method,
            url: flashSpec.url,
            body: {},
            mockResponse: flashSpec.responseBody
          })
        });
        const data = await res.json();
        setCheckoutFlashAcct(data.data);
        setPaymentStatus('flash_details');
      } catch (err) {
        setPaymentStatus('error');
      }
      setIsPaying(false);
    } else {
      // Card payment
      if (selectedSavedCard) {
        // Pay directly with saved card token
        alert(`Paying ₦${amt.toLocaleString()} securely using Saved Card token ${selectedSavedCard}...`);
        if (checkoutTenancy.isMarketplacePurchase) {
          await handleMarketplaceCheckout(checkoutTenancy.property);
        } else {
          await executePaymentSimulation(amt, checkoutTenancy.nombaVirtualAccountId);
          // Save Receipt
          await saveReceipt("Rent Payment", "RENT", amt, "SAVED_CRD_" + Math.random().toString(36).substring(2, 10), `Secure card token payment for property virtual account: ${checkoutTenancy.nombaVirtualAccountId}`);
        }

        setPaymentStatus('success');
        setIsPaying(false);
        return;
      }

      const cardSpec = APIS_METADATA.find(a => a.name === "Submit customer card details");
      try {
        const res = await fetch('/api/nomba-sandbox/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cardSpec.name,
            method: cardSpec.method,
            url: cardSpec.url,
            body: {
              cardNumber: checkoutCardForm.number,
              cvv: checkoutCardForm.cvv,
              expiry: checkoutCardForm.expiry
            },
            mockResponse: cardSpec.responseBody
          })
        });
        const data = await res.json();
        if (data.data.authType === "OTP_REQUIRED") {
          setPaymentStatus('otp_prompt');
        } else {
          setPaymentStatus('error');
        }
      } catch (err) {
        setPaymentStatus('error');
      }
      setIsPaying(false);
    }
  }

  // Submit Card OTP to finalize card charge
  async function handleSubmitCardOtp() {
    setIsPaying(true);
    const otpSpec = APIS_METADATA.find(a => a.name === "Submit customer card OTP");
    
    let amt = checkoutTenancy.rentAmount;
    if (checkoutOption === 'partial') amt = checkoutTenancy.rentAmount * 0.75;
    if (checkoutOption === 'overpaid') amt = checkoutTenancy.rentAmount * 1.25;
    if (checkoutOption === 'custom') amt = parseFloat(customPayAmount) || 0;

    try {
      const res = await fetch('/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: otpSpec.name,
          method: otpSpec.method,
          url: otpSpec.url,
          body: {
            reference: "ref_card_init_92910",
            otp: checkoutOtp
          },
          mockResponse: otpSpec.responseBody
        })
      });
      const data = await res.json();
      if (data.data.status === "SUCCESS") {
        if (checkoutTenancy.isMarketplacePurchase) {
          await handleMarketplaceCheckout(checkoutTenancy.property);
        } else {
          await executePaymentSimulation(amt, checkoutTenancy.nombaVirtualAccountId);
          // Save Receipt
          await saveReceipt("Rent Payment", "RENT", amt, "CRD_CHG_" + Math.random().toString(36).substring(2, 10), `Debit Card Charge verification successful for account: ${checkoutTenancy.nombaVirtualAccountId}`);
        }
        
        setPaymentStatus('success');
      } else {
        setPaymentStatus('error');
      }
    } catch(err) {
      setPaymentStatus('error');
    }
    setIsPaying(false);
  }

  // Tenant rent/buy house from marketplace
  async function handleMarketplaceCheckout(propObj) {
    // Generate mock virtual account reference
    const tempVa = "va_market_" + Math.random().toString(36).substring(2, 10);
    
    // Perform simulated checkout
    setLoading(true);
    
    const rentAmount = propObj.price;
    const isSale = propObj.type === 'SALE';
    
    // Create new tenancy/escrow
    if (isSale) {
      const eMutation = `
        mutation {
          createEscrowTransaction(
            propertyId: "${propObj.id}",
            buyerId: "${userProfile.email}",
            amountHeld: ${rentAmount},
            nombaVirtualAccountId: "${tempVa}"
          ) { id }
        }
      `;
      await fetchGraphQL(eMutation);
      await saveReceipt("House Purchase Escrow Deposit", "RENT", rentAmount, "ESC_" + Math.random().toString(36).substring(2, 10), `Escrow fund held secure for property: ${propObj.title}`);
    } else {
      const tMutation = `
        mutation {
          createTenancy(
            propertyId: "${propObj.id}",
            tenantId: "${userProfile.email}",
            rentAmount: ${rentAmount},
            frequency: "MONTHLY",
            nextDueDate: "2026-08-01",
            nombaVirtualAccountId: "${tempVa}"
          ) { id }
        }
      `;
      await fetchGraphQL(tMutation);
      await saveReceipt("Rent Purchase Payment", "RENT", rentAmount, "RNT_" + Math.random().toString(36).substring(2, 10), `Rent Checkout successful for property: ${propObj.title}`);
    }

    // Decrement available units in PostgreSQL
    const currentAvailable = propObj.availableUnits != null ? propObj.availableUnits : 1;
    const nextAvailable = currentAvailable - 1;

    const decUnitsMutation = `
      mutation {
        decrementPropertyUnits(propertyId: "${propObj.id}") {
          id
          availableUnits
        }
      }
    `;
    await fetchGraphQL(decUnitsMutation);

    // If all rooms/flats are taken, update status to SOLD or LET (taking it off the marketplace)
    if (nextAvailable <= 0) {
      const targetStatus = isSale ? "SOLD" : "LET";
      const updateStatusMutation = `
        mutation {
          updatePropertyStatus(
            propertyId: "${propObj.id}",
            status: "${targetStatus}"
          ) {
            id
            status
          }
        }
      `;
      await fetchGraphQL(updateStatusMutation);
    }

    await loadData();
    setLoading(false);
    alert(`Checkout Completed! House successfully secured.`);
  }

  // Filter properties
  const filteredProperties = properties.filter(p => {
    const matchesLandlord = userRole !== 'landlord' || p.landlord?.email === userProfile?.email;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.landlord?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || p.status === filterType || p.type === filterType;
    return matchesLandlord && matchesSearch && matchesType;
  });

  const totalActiveArrears = tenancies.reduce((sum, t) => t.balance < 0 ? sum + Math.abs(t.balance) : sum, 0);
  const totalRentAmount = tenancies.reduce((sum, t) => sum + t.rentAmount, 0);
  const totalActiveEscrow = escrowTxns.reduce((acc, curr) => curr.status === 'HELD' ? acc + curr.amountHeld : acc, 0);
  
  // Find tenant's tenancy
  const tenantActiveTenancies = tenancies.filter(t => t.tenantId === userProfile?.email);
  const activeTenantTenancyObj = selectedTenancyId
    ? tenantActiveTenancies.find(t => t.id === selectedTenancyId)
    : (tenantActiveTenancies.length > 0 ? tenantActiveTenancies[0] : null);

  // Chatroom properties dropdown list
  const activeChatroomProperties = userRole === 'landlord' 
    ? properties.filter(p => tenancies.some(t => t.property.id === p.id))
    : properties.filter(p => tenancies.some(t => t.property.id === p.id && t.tenantId === userProfile?.email));

  // Auto-select chat room if none selected
  useEffect(() => {
    if (activeChatroomProperties.length > 0 && !activeChatPropertyId) {
      setActiveChatPropertyId(activeChatroomProperties[0].id);
    }
  }, [activeChatroomProperties]);


  // ==========================================================
  // VIEW: Landing / Splash Page
  // ==========================================================
  if (currentView === 'landing') {
    return (
      <div 
        className="min-h-screen text-white flex flex-col justify-between font-sans relative overflow-x-hidden bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(9, 9, 11, 0.4), rgba(9, 9, 11, 0.95)), url('/glowing_gateway.jpg')` }}
      >
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-mono tracking-wider font-bold text-lg text-emerald-400">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              ACREWISE
            </div>
          </div>
          <button onClick={() => setCurrentView('login')} className="px-4 py-2 bg-white text-black font-semibold text-xs rounded hover:bg-zinc-200 transition tracking-wide">
            ACCESS TERMINAL &gt;
          </button>
        </header>

        <main className="flex-1 flex flex-col justify-center px-6 md:px-20 py-20 max-w-4xl z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              ACREWISE V2.0 FINTECH GATEWAY
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Decentralized Escrow & Rent Automation
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
              Provision smart-reconciling Nomba virtual accounts, settle FX global payouts, and manage property bills securely under one unified compliance platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button onClick={() => setCurrentView('login')} className="px-6 py-3.5 bg-white text-black font-bold text-sm tracking-wider uppercase rounded hover:bg-zinc-200 transition">
                Launch Console Portal &gt;
              </button>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md px-6 py-8 z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-xs text-zinc-500 font-mono">INTEGRATIONS & COMPATIBILITY</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:flex gap-8 md:gap-12 opacity-40 grayscale contrast-200">
              <span className="font-bold text-sm">NOMBA WEBHOOKS</span>
              <span className="font-bold text-sm">POSTGRES CORE</span>
              <span className="font-bold text-sm">REDIS IDEMPOTENCY</span>
              <span className="font-bold text-sm">GRAPHQL ENDPOINTS</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ==========================================================
  // VIEW: Register / Login Profile Page
  // ==========================================================
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6"
           style={{ backgroundImage: `radial-gradient(circle at top, rgba(16, 185, 129, 0.08), transparent)` }}>
        <div className="w-full max-w-md p-8 border border-zinc-800 bg-zinc-900/20 backdrop-blur rounded-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 font-mono font-bold tracking-wider text-emerald-400 text-lg">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              ACREWISE CONSOLE
            </div>
            <h2 className="text-xl font-bold">Secure Access Gate</h2>
            <p className="text-zinc-500 text-xs font-mono">Profile Registration and Role Provisioning</p>
          </div>

          <div className="flex border-b border-zinc-900 text-xs font-mono">
            <button 
              type="button" 
              onClick={() => setAuthMode('login')} 
              className={`flex-1 pb-2 font-bold uppercase transition ${authMode === 'login' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Log In
            </button>
            <button 
              type="button" 
              onClick={() => setAuthMode('register')} 
              className={`flex-1 pb-2 font-bold uppercase transition ${authMode === 'register' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Register Profile
            </button>
          </div>

          <form onSubmit={handleUserProfileLogin} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 block">PROFILE EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <input 
                  type="email" 
                  placeholder="e.g. landlord@reflow.com" 
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {authMode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 block">SELECT ACCESS ROLE</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegisterRole('TENANT')}
                      className={`py-2.5 border rounded font-mono text-xs transition uppercase ${registerRole === 'TENANT' ? 'bg-zinc-800 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-650 border-zinc-900 hover:border-zinc-800'}`}
                    >
                      Renting Tenant
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('LANDLORD')}
                      className={`py-2.5 border rounded font-mono text-xs transition uppercase ${registerRole === 'LANDLORD' ? 'bg-zinc-800 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-650 border-zinc-900 hover:border-zinc-800'}`}
                    >
                      Property Landlord
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 block">FULL NAME (OPTIONAL)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="e.g. Chinedu Okafor" 
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-emerald-500 transition"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              {loading ? "Authenticating..." : (authMode === 'login' ? "Log In to Console" : "Register & Settle Profile")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================================
  // VIEW: Main Console Dashboard View
  // ==========================================================
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex overflow-hidden">
      
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Area */}
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono font-bold tracking-wider text-emerald-400">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
              ACREWISE
            </div>
            <span className="px-1.5 py-0.5 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-mono tracking-widest uppercase">Console</span>
          </div>

          {/* User profile session widget */}
          <div className="p-4 border-b border-zinc-900 bg-zinc-900/20 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-zinc-300">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 uppercase">
                {userProfile?.name?.charAt(0)}
              </div>
              <div className="truncate">
                <p className="font-bold text-white leading-tight truncate">{userProfile?.name}</p>
                <p className="text-[9px] text-zinc-500 truncate">{userProfile?.email}</p>
              </div>
            </div>
            
            {/* Upgrade banner if Tenant */}
            {userProfile?.role === 'TENANT' ? (
              <button 
                onClick={handleUpgradeProfile}
                className="w-full py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded transition tracking-wider"
              >
                Upgrade to Landlord
              </button>
            ) : (
              <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] text-center font-bold rounded uppercase tracking-wider">
                👑 Landlord Authorized
              </div>
            )}
          </div>

          {/* Role Switcher Widget */}
          <div className="p-4 border-b border-zinc-900/60 bg-zinc-900/20">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">ACTIVE WORKSPACE ROLE</span>
            <div className="flex items-center justify-between p-1 bg-zinc-950 border border-zinc-850 rounded-lg">
              <button 
                onClick={() => {
                  if (userProfile?.role !== 'LANDLORD') {
                    alert("Landlord core workspace locked. Upgrade your profile to unlock Landlord switch!");
                    return;
                  }
                  setUserRole('landlord');
                }}
                className={`flex-1 py-1 text-center font-bold text-xs rounded transition uppercase tracking-wider ${userRole === 'landlord' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Landlord
              </button>
              <button 
                onClick={() => setUserRole('tenant')}
                className={`flex-1 py-1 text-center font-bold text-xs rounded transition uppercase tracking-wider ${userRole === 'tenant' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Tenant
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="p-4 space-y-6">
            {userRole === 'landlord' ? (
              /* LANDLORD SIDEBAR NAV */
              <div>
                <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-zinc-500 uppercase">Landlord Dashboard</p>
                <div className="mt-2 space-y-0.5">
                  <button 
                    onClick={() => setLandlordTab('overview')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'overview' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <Compass className="w-4 h-4" />
                    Overview
                  </button>
                  <button 
                    onClick={() => setLandlordTab('properties')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'properties' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <Building2 className="w-4 h-4" />
                    Properties Hub
                  </button>
                  <button 
                    onClick={() => setLandlordTab('leases')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'leases' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <Users className="w-4 h-4" />
                    Lease Agreements
                  </button>
                  <button 
                    onClick={() => setLandlordTab('escrow')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'escrow' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <Coins className="w-4 h-4" />
                    Purchase Escrows
                  </button>
                  <button 
                    onClick={() => setLandlordTab('payouts')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'payouts' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Payouts & Utilities
                  </button>
                  <button 
                    onClick={() => setLandlordTab('terminals')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'terminals' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <SmartphoneNfc className="w-4 h-4" />
                    POS Terminals
                  </button>
                  <button 
                    onClick={() => setLandlordTab('chat')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'chat' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Tenant Chats
                  </button>
                  <button 
                    onClick={() => setLandlordTab('unmatched')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'unmatched' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Unmatched Inflows
                  </button>
                  <button 
                    onClick={() => setLandlordTab('developer')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'developer' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <Terminal className="w-4 h-4" />
                    Developer Sandbox
                  </button>
                </div>
              </div>
            ) : (
              /* TENANT SIDEBAR NAV */
              <div>
                <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-zinc-500 uppercase">Tenant Services</p>
                <div className="mt-2 space-y-0.5">
                  <button 
                    onClick={() => setTenantTab('my-rent')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${tenantTab === 'my-rent' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <Building2 className="w-4 h-4" />
                    My Lease Ledger
                  </button>
                  <button 
                    onClick={() => setTenantTab('marketplace')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${tenantTab === 'marketplace' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <Compass className="w-4 h-4" />
                    Rent / Buy Marketplace
                  </button>
                  <button 
                    onClick={() => setTenantTab('receipts')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${tenantTab === 'receipts' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <Receipt className="w-4 h-4" />
                    Receipts Locker
                  </button>
                  <button 
                    onClick={() => setTenantTab('chat')} 
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${tenantTab === 'chat' ? 'bg-zinc-900 text-white font-semibold border-l-2 border-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Landlord Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-900 space-y-2">
          <button 
            onClick={() => loadData()}
            className="w-full text-left px-3 py-1.5 hover:bg-zinc-900 rounded text-xs text-zinc-500 flex items-center gap-2 hover:text-white transition font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Dashboard
          </button>
          <button 
            onClick={() => {
              setCurrentView('landing');
              setUserProfile(null);
              setLoginEmail('');
            }} 
            className="w-full text-left px-3 py-1.5 hover:bg-rose-950/20 rounded text-xs text-zinc-500 flex items-center gap-2 hover:text-rose-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-zinc-950 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 px-8 flex items-center justify-between bg-zinc-950/50 backdrop-blur">
          <div className="flex items-center gap-4 w-96">
            {userRole === 'tenant' && (
              <div className="flex items-center gap-2">
                <label className="text-zinc-500 font-mono text-[10px] uppercase">Select Active Tenancy:</label>
                <select 
                  className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                  value={selectedTenancyId || ''}
                  onChange={(e) => setSelectedTenancyId(e.target.value)}
                >
                  <option value="">-- CHOOSE AGREEMENT --</option>
                  {tenantActiveTenancies.map(t => (
                    <option key={t.id} value={t.id}>{t.property.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <span className="hidden md:inline text-zinc-500 font-mono text-[10px]">
              Active User: <span className="text-emerald-400 font-bold">{userProfile?.email}</span>
            </span>
          </div>
        </header>

        {/* Dynamic Inner Layout Body */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* ========================================================== */}
          {/* ROLE: Landlord Views                                        */}
          {/* ========================================================== */}
          {userRole === 'landlord' && (
            <div className="space-y-8 max-w-6xl">
              
              {/* Landlord Tab: Overview */}
              {landlordTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold">Landlord Overview</h2>
                    <p className="text-zinc-400 text-sm mt-1">Real-time status of rent cash flows, arrears ledger, properties, and purchase escrow holdings.</p>
                  </div>

                  <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3 font-sans text-xs">
                    <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      AcreWise Step-by-Step Console Guide
                    </h3>
                    <p className="text-zinc-400 leading-relaxed">
                      AcreWise enables you to coordinate property assets, tenancies, utilities, and payouts with integrated Nomba sandbox simulations. Here is how to navigate:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-[11px] text-zinc-450">
                      <div className="space-y-1 p-3 bg-zinc-950/80 rounded border border-zinc-900">
                        <span className="text-emerald-400 font-bold text-xs block mb-0.5">1. List & Market</span>
                        <p>Go to **Properties Hub** to list properties. Tenants can browse these houses, link their physical electricity meters, and buy/rent them via secure card checkouts.</p>
                      </div>
                      <div className="space-y-1 p-3 bg-zinc-950/80 rounded border border-zinc-900">
                        <span className="text-emerald-400 font-bold text-xs block mb-0.5">2. Payouts & Utilities</span>
                        <p>Under **Payouts & Utilities**, execute payouts from sub-accounts, swap NGN to global USD/GBP currencies, and vend power or TV package tokens.</p>
                      </div>
                      <div className="space-y-1 p-3 bg-zinc-950/80 rounded border border-zinc-900">
                        <span className="text-emerald-400 font-bold text-xs block mb-0.5">3. Live Audits</span>
                        <p>Access secure chat threads locked per property, check synced POS terminal devices, and inspect chronological transaction receipt logs inside the vault locker.</p>
                      </div>
                    </div>
                  </div>

                  {properties.length === 0 && (
                    <div className="p-6 border border-dashed border-emerald-500/30 bg-emerald-500/5 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">Database is currently empty</h4>
                        <p className="text-zinc-400 text-xs font-mono">Initialize the console with default properties, landlords, leases, and escrows to test features.</p>
                      </div>
                      <button 
                        onClick={() => seedDemoData()}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded transition shrink-0"
                      >
                        Seed Demo Dataset
                      </button>
                    </div>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 border border-zinc-900 bg-zinc-900/30 rounded-lg space-y-2">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block">Properties Owned</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{properties.length}</span>
                      </div>
                    </div>
                    <div className="p-5 border border-zinc-900 bg-zinc-900/30 rounded-lg space-y-2">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block">Leased Tenants</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{tenancies.length}</span>
                      </div>
                    </div>
                    <div className="p-5 border border-zinc-900 bg-zinc-900/30 rounded-lg space-y-2 text-rose-400">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block">Total Rent Arrears</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">₦{totalActiveArrears.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="p-5 border border-zinc-900 bg-zinc-900/30 rounded-lg space-y-2 text-emerald-400">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider block">Est. Monthly Roll</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">₦{totalRentAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Tenancies Ledger Summary */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-widest">Agreement Overviews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tenancies.map(t => (
                        <div key={t.id} className="p-5 border border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 transition rounded-lg space-y-4">
                          <div>
                            <h4 className="font-bold text-sm text-white truncate">{t.property.title}</h4>
                            <p className="text-[10px] font-mono text-zinc-500">Tenant: {t.tenantId}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-zinc-950 p-2.5 rounded border border-zinc-900">
                            <div>
                              <span className="text-zinc-500 block text-[9px]">Rent amount</span>
                              <span className="font-bold text-white">₦{t.rentAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-zinc-500 block text-[9px]">Balance</span>
                              <span className={`font-bold ${t.balance === 0 ? 'text-zinc-300' : (t.balance > 0 ? 'text-emerald-400' : 'text-rose-400')}`}>
                                {t.balance === 0 ? 'Balanced' : (t.balance > 0 ? `+₦${t.balance.toLocaleString()}` : `-₦${Math.abs(t.balance).toLocaleString()}`)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Landlord Tab: Properties */}
              {landlordTab === 'properties' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Properties Hub</h3>
                    <button 
                      onClick={() => setShowPropertyModal(true)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Create & List Property
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProperties.map((p) => {
                      const linkedTenancy = tenancies.find(t => t.property.id === p.id);
                      const linkedEscrow = escrowTxns.find(e => e.property.id === p.id);
                      const vaId = linkedTenancy ? linkedTenancy.nombaVirtualAccountId : (linkedEscrow ? linkedEscrow.nombaVirtualAccountId : 'No virtual account');

                      return (
                        <div key={p.id} className="p-5 border border-zinc-900 bg-zinc-900/30 hover:border-zinc-800 rounded-lg flex flex-col justify-between gap-4 transition">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-zinc-500">Area: {p.area || 'N/A'}</span>
                              <span className="text-amber-400 flex items-center gap-0.5">8 <Star className="w-3 h-3 fill-amber-400" /></span>
                            </div>
                            <h4 className="font-bold text-base text-white">{p.title}</h4>
                            <p className="text-zinc-400 text-xs font-mono">Type: {p.buildingType || 'Apartment'} | Value: ₦{p.price?.toLocaleString() || '0'}</p>
                            <div className="text-[11px] text-zinc-405 font-mono flex items-center justify-between">
                              <span>Rooms / Flats:</span>
                              <span className="text-emerald-400 font-semibold">{p.availableUnits != null ? p.availableUnits : 1} of {p.totalUnits != null ? p.totalUnits : 1} available</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="px-2 py-0.5 bg-zinc-800 text-[10px] font-semibold text-zinc-300 rounded uppercase">{p.type}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${
                                p.status === 'SOLD' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
                                p.status === 'LET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                p.status === 'LISTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>{p.status}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${p.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{p.verificationStatus}</span>
                            </div>
                          </div>

                          <div className="border-t border-zinc-900/80 pt-3 text-[11px] font-mono space-y-2">
                            <div className="flex justify-between text-zinc-500">
                              <span>Virtual Account:</span>
                              <span className="text-zinc-300">{vaId}</span>
                            </div>
                            
                            {/* Caretaker details */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Caretaker:</span>
                              {p.caretakerName ? (
                                <span className="text-zinc-300 font-semibold">{p.caretakerName}</span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setCaretakerPropId(p.id);
                                    setShowCaretakerModal(true);
                                  }}
                                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                                >
                                  Assign Caretaker
                                </button>
                              )}
                            </div>

                            {/* Meter details display & Link button */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-500">Utility Meter:</span>
                              {p.meterNumber ? (
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                                  {p.meterProvider}: {p.meterNumber}
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setMeterModalPropertyId(p.id);
                                    setShowMeterModal(true);
                                  }}
                                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                                >
                                  Link Meter
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Landlord Tab: Lease Agreements */}
              {landlordTab === 'leases' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Lease Agreements</h3>
                    <button 
                      onClick={() => {
                        if (properties.length === 0) {
                          alert("Establish property listings first before linking tenancies.");
                          return;
                        }
                        setShowTenancyModal(true);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Link Lease Agreement
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenancies.map(t => (
                      <div key={t.id} className="p-5 border border-zinc-900 bg-zinc-900/30 rounded-lg space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-zinc-500">Ref: {t.id.substring(0, 8)}</span>
                          <h4 className="font-bold text-base">{t.property.title}</h4>
                          <p className="text-zinc-400 text-xs truncate">Tenant Email: {t.tenantId}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-950 p-3 border border-zinc-900 rounded">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase">Rent Fee</span>
                            <span className="text-white font-bold">₦{t.rentAmount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase">Frequency</span>
                            <span className="text-white font-semibold">{t.frequency}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-zinc-500 block text-[9px] uppercase">Next Due Date</span>
                            <span className="text-white">{t.nextDueDate}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-zinc-500 block text-[9px] uppercase">Balance</span>
                            <span className={`font-bold ${t.balance === 0 ? 'text-zinc-300' : (t.balance > 0 ? 'text-emerald-400' : 'text-rose-400')}`}>
                              {t.balance === 0 ? 'Balanced' : (t.balance > 0 ? `+₦${t.balance.toLocaleString()}` : `-₦${Math.abs(t.balance).toLocaleString()}`)}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono flex items-center justify-between text-zinc-500">
                          <span>Nomba Virtual Account:</span>
                          <span className="text-emerald-400 font-semibold">{t.nombaVirtualAccountId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Landlord Tab: Escrows */}
              {landlordTab === 'escrow' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">Purchase Escrows</h3>
                    <p className="text-zinc-400 text-sm mt-1">Manage buyer secure deposits with escrow release triggers.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {escrowTxns.map((e) => (
                      <div key={e.id} className="p-6 border border-zinc-900 bg-zinc-900/30 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{e.status}</span>
                          <span className="text-zinc-500 font-mono text-[10px]">ID: {e.id.substring(0, 8)}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-lg">{e.property.title}</h4>
                          <p className="text-zinc-400 text-xs">Landlord: {e.property.landlord.name}</p>
                          <p className="text-zinc-500 text-xs">Buyer ID: {e.buyerId}</p>
                        </div>

                        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded font-mono text-sm flex items-center justify-between">
                          <span className="text-zinc-500 text-xs">Escrow Amount Held:</span>
                          <span className="font-bold text-white text-base">₦{e.amountHeld.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Landlord Tab: POS Terminals */}
              {landlordTab === 'terminals' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">POS Terminals Assignment</h3>
                      <p className="text-zinc-400 text-sm mt-1">Monitor in-person payment devices assigned to your landlord account folders.</p>
                    </div>
                    <button 
                      onClick={fetchNombaTerminals}
                      disabled={fetchingTerminals}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 text-white font-bold text-xs rounded transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${fetchingTerminals ? 'animate-spin' : ''}`} />
                      Sync Nomba Terminals
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {posTerminals.map(term => (
                      <div key={term.id} className="p-5 border border-zinc-900 bg-zinc-900/30 rounded-lg space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">{term.status}</span>
                          <span className="text-zinc-500">Device POS</span>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-[10px]">TERMINAL ID</p>
                          <p className="text-white text-base font-bold">{term.terminalId}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500 text-[10px]">SERIAL NUMBER</p>
                          <p className="text-zinc-300 font-semibold">{term.serialNumber}</p>
                        </div>
                        <div className="border-t border-zinc-900 pt-2 flex justify-between text-zinc-500 text-[10px]">
                          <span>Assigned Date:</span>
                          <span>{new Date(term.dateAssigned).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Landlord Tab: Locked Chats */}
              {landlordTab === 'chat' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">Property Locked Chatrooms</h3>
                    <p className="text-zinc-400 text-sm mt-1">Direct communication threads securely locked between you and your active tenants.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-zinc-900 rounded-xl overflow-hidden min-h-[500px]">
                    <div className="lg:col-span-4 border-r border-zinc-900 bg-zinc-900/10 p-4 space-y-2">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Active Channels</p>
                      {activeChatroomProperties.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setActiveChatPropertyId(p.id)}
                          className={`p-3 rounded-lg cursor-pointer transition font-mono text-xs ${activeChatPropertyId === p.id ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-400'}`}
                        >
                          <p className="font-bold truncate">{p.title}</p>
                          <p className="text-[9px] text-zinc-500 truncate">Area: {p.area}</p>
                        </div>
                      ))}
                      {activeChatroomProperties.length === 0 && (
                        <p className="text-zinc-600 text-center py-10 font-mono text-xs">No active leased properties found.</p>
                      )}
                    </div>

                    <div className="lg:col-span-8 flex flex-col justify-between h-[500px] bg-zinc-950/20">
                      {/* Messages body */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatLoading ? (
                          <p className="text-zinc-500 text-xs font-mono text-center py-20">Loading conversations...</p>
                        ) : chatMessages.map(msg => (
                          <div 
                            key={msg.id}
                            className={`flex flex-col max-w-[70%] font-mono text-xs p-3 rounded-lg ${msg.senderEmail === userProfile.email ? 'ml-auto bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'mr-auto bg-zinc-900 text-zinc-300 border border-zinc-850'}`}
                          >
                            <span className="text-[9px] text-zinc-500 block mb-1">{msg.senderEmail === userProfile.email ? "You" : msg.senderEmail}</span>
                            <p className="text-white">{msg.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Chat text input footer */}
                      <form onSubmit={handleSendChatMessage} className="p-4 border-t border-zinc-900 bg-zinc-950 flex gap-2">
                        <input 
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 bg-zinc-900 border border-zinc-855 rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 text-white"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                        />
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-xs"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Landlord Tab: Payouts, FX Exchange, and Utilities */}
              {landlordTab === 'payouts' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold">Payouts, FX & Utility Services</h2>
                    <p className="text-zinc-400 text-sm mt-1">Verify landlord accounts, perform payouts, swap currencies via exchange rates, and vend property utility meters.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Section A: Bank Payout */}
                    <div className="p-6 border border-zinc-900 bg-zinc-900/10 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                        <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-sm text-white">Bank Payout (Subaccount)</h3>
                      </div>
                      
                      <form onSubmit={handleConfirmPayout} className="space-y-3 font-mono text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500">SELECT RECIPIENT BANK</label>
                          <select 
                            className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs focus:outline-none font-sans"
                            value={payoutBankCode}
                            onChange={(e) => setPayoutBankCode(e.target.value)}
                          >
                            <option value="058">Guaranty Trust Bank (058)</option>
                            <option value="011">First Bank of Nigeria (011)</option>
                            <option value="053">Nombank MFB (053)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500">ACCOUNT NUMBER</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="10-digit number"
                              maxLength={10}
                              className="flex-1 bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs"
                              value={payoutAcctNumber}
                              onChange={(e) => setPayoutAcctNumber(e.target.value)}
                            />
                            <button 
                              type="button"
                              onClick={handleBankLookup}
                              disabled={payoutVerifying}
                              className="px-3 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 transition text-[10px] font-bold"
                            >
                              {payoutVerifying ? "Verifying..." : "Lookup"}
                            </button>
                          </div>
                        </div>

                        {payoutVerifiedName && (
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded">
                            Verified Name: {payoutVerifiedName}
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500">AMOUNT (NGN)</label>
                          <input 
                            type="number" 
                            placeholder="Amount in NGN"
                            className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-zinc-500">SECURITY PIN (4 DIGITS)</label>
                          <input 
                            type="password" 
                            placeholder="••••"
                            maxLength={4}
                            className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs"
                            value={payoutPin}
                            onChange={(e) => setPayoutPin(e.target.value)}
                            required
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded transition"
                        >
                          Execute Bank Payout
                        </button>
                      </form>
                    </div>

                    {/* Section B: Forex exchange */}
                    <div className="p-6 border border-zinc-900 bg-zinc-900/10 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                        <Coins className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-sm text-white">Global Forex Exchange</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-zinc-950 p-3 border border-zinc-900 rounded">
                        <div>
                          <span className="text-zinc-500 block">NGN / USD Rate</span>
                          <span className="text-emerald-400 font-bold">₦1,495.50</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">NGN / GBP Rate</span>
                          <span className="text-emerald-400 font-bold">₦1,890.20</span>
                        </div>
                      </div>

                      {fxStep === 1 ? (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">FROM CURRENCY</label>
                            <input 
                              type="text" 
                              value="NGN" 
                              disabled 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs text-zinc-500" 
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">TARGET CURRENCY</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs focus:outline-none font-sans"
                              value={fxTargetCurrency}
                              onChange={(e) => setFxTargetCurrency(e.target.value)}
                            >
                              <option value="USD">USD - US Dollar</option>
                              <option value="GBP">GBP - British Pound</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">CONVERT AMOUNT (NGN)</label>
                            <input 
                              type="number" 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs"
                              value={fxAmount}
                              onChange={(e) => setFxAmount(e.target.value)}
                            />
                          </div>

                          <button 
                            onClick={handleFxConvert}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded transition"
                          >
                            Calculate Conversion
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="p-3 bg-zinc-950 rounded border border-zinc-900 text-[11px] space-y-1">
                            <p className="text-zinc-400">Exchange Reference: <span className="text-white font-bold">{fxExchangeId}</span></p>
                            <p className="text-zinc-400">Exchange Rate: <span className="text-emerald-400 font-bold">{fxRate}</span></p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">ENTER FX AUTHORIZATION OTP</label>
                            <input 
                              type="password" 
                              placeholder="6-digit verification code"
                              maxLength={6}
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs"
                              value={fxOtp}
                              onChange={(e) => setFxOtp(e.target.value)}
                            />
                          </div>
                          <button 
                            onClick={handleConfirmFx}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded transition"
                          >
                            Confirm Exchange Conversion
                          </button>
                        </div>
                      )}

                      {fxResult && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded font-mono">
                          {fxResult}
                        </div>
                      )}
                    </div>

                    {/* Section C: Utility Vending */}
                    <div className="p-6 border border-zinc-900 bg-zinc-900/10 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-bold text-sm text-white">Utility & Bill Payments</h3>
                      </div>

                      {/* Four-way bill switcher */}
                      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 border border-zinc-850 rounded">
                        <button 
                          onClick={() => setUtilityType('electricity')}
                          className={`py-1.5 text-center text-[9px] font-bold rounded uppercase ${utilityType === 'electricity' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500'}`}
                        >
                          Power
                        </button>
                        <button 
                          onClick={() => setUtilityType('airtime')}
                          className={`py-1.5 text-center text-[9px] font-bold rounded uppercase ${utilityType === 'airtime' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500'}`}
                        >
                          Airtime
                        </button>
                        <button 
                          onClick={() => setUtilityType('cable')}
                          className={`py-1.5 text-center text-[9px] font-bold rounded uppercase ${utilityType === 'cable' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500'}`}
                        >
                          Cable
                        </button>
                        <button 
                          onClick={() => setUtilityType('betting')}
                          className={`py-1.5 text-center text-[9px] font-bold rounded uppercase ${utilityType === 'betting' ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500'}`}
                        >
                          Betting
                        </button>
                      </div>

                      {utilityType === 'electricity' && (
                        <form onSubmit={handleVendElectricity} className="space-y-3 font-mono text-xs">
                          {/* Autofill selector */}
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">AUTO-FILL FROM PROPERTY METER</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs text-white"
                              onChange={(e) => handleAutofillMeterSelection(e.target.value)}
                              defaultValue=""
                            >
                              <option value="">-- CHOOSE PROP --</option>
                              {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">ELECTRICITY DISCO</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs focus:outline-none"
                              value={discoCode}
                              onChange={(e) => setDiscoCode(e.target.value)}
                            >
                              <option value="IKEDC">Ikeja Electricity (IKEDC)</option>
                              <option value="EKEDC">Eko Electricity (EKEDC)</option>
                              <option value="KEDCO">Kano Electricity (KEDCO)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">METER NUMBER</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Meter serial number"
                                className="flex-1 bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs text-white"
                                value={meterNumber}
                                onChange={(e) => setMeterNumber(e.target.value)}
                              />
                              <button 
                                type="button"
                                onClick={handleCheckMeter}
                                className="px-3 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-[10px]"
                              >
                                Check
                              </button>
                            </div>
                          </div>

                          {meterOwner && (
                            <div className="text-[9px] text-emerald-400">
                              {meterOwner}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">AMOUNT (NGN)</label>
                            <input 
                              type="number" 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs"
                              value={utilityAmount}
                              onChange={(e) => setUtilityAmount(e.target.value)}
                            />
                          </div>

                          <button 
                            type="submit" 
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded transition text-xs"
                          >
                            Vend Token
                          </button>
                          
                          {utilityToken && (
                            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded font-bold text-center tracking-wider text-emerald-400 text-xs mt-2 select-all font-mono">
                              METER TOKEN: {utilityToken}
                            </div>
                          )}
                        </form>
                      )}

                      {utilityType === 'airtime' && (
                        <form onSubmit={handleVendAirtime} className="space-y-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">NETWORK OPERATOR</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs focus:outline-none"
                              value={airtimeCarrier}
                              onChange={(e) => setAirtimeCarrier(e.target.value)}
                            >
                              <option value="MTN">MTN Nigeria</option>
                              <option value="AIRTEL">Airtel Nigeria</option>
                              <option value="GLO">Globacom (Glo)</option>
                              <option value="9MOBILE">9mobile</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">PHONE NUMBER</label>
                            <input 
                              type="text" 
                              placeholder="e.g. +2348030000000"
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs"
                              value={airtimePhone}
                              onChange={(e) => setAirtimePhone(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">VENDING PLAN</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs focus:outline-none"
                              value={airtimePlan}
                              onChange={(e) => setAirtimePlan(e.target.value)}
                            >
                              <option value="airtime">Direct Airtime Topup</option>
                              <option value="data">MTN 10GB Data Bundle - ₦3,000</option>
                              <option value="data_large">MTN 25GB Data Bundle - ₦6,000</option>
                            </select>
                          </div>

                          <button 
                            type="submit" 
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded transition text-xs"
                          >
                            Vend Airtime / Data
                          </button>
                        </form>
                      )}

                      {utilityType === 'cable' && (
                        <form onSubmit={handleVendCableTv} className="space-y-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">CABLE PROVIDER</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs focus:outline-none font-sans"
                              value={tvProvider}
                              onChange={(e) => setTvProvider(e.target.value)}
                            >
                              <option value="DSTV">DSTV Nigeria</option>
                              <option value="GOTV">GOTV Nigeria</option>
                              <option value="STARTIMES">StarTimes</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">SMARTCARD NUMBER</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Smartcard number"
                                className="flex-1 bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs text-white"
                                value={tvSmartcard}
                                onChange={(e) => setTvSmartcard(e.target.value)}
                                required
                              />
                              <button 
                                type="button"
                                onClick={handleVerifyCableTv}
                                disabled={tvVerifying}
                                className="px-3 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-[10px]"
                              >
                                {tvVerifying ? "..." : "Verify"}
                              </button>
                            </div>
                          </div>

                          {tvVerifiedName && (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded">
                              Cardholder Name: {tvVerifiedName}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">SELECT TV PACKAGE</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs focus:outline-none font-sans"
                              value={tvPackageCode}
                              onChange={(e) => setTvPackageCode(e.target.value)}
                            >
                              <option value="dstv_yanga">DSTV Yanga - ₦5,100 / mo</option>
                              <option value="dstv_compact">DSTV Compact - ₦15,700 / mo</option>
                              <option value="gotv_max">GOTV Max - ₦7,200 / mo</option>
                            </select>
                          </div>

                          <button 
                            type="submit" 
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-xs"
                          >
                            Vend Subscription
                          </button>

                          {tvResult && (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded text-center">
                              {tvResult}
                            </div>
                          )}
                        </form>
                      )}

                      {utilityType === 'betting' && (
                        <form onSubmit={handleVendBetting} className="space-y-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">BETTING PROVIDER</label>
                            <select 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded text-xs focus:outline-none font-sans"
                              value={betProvider}
                              onChange={(e) => setBetProvider(e.target.value)}
                            >
                              <option value="SportyBet">SportyBet</option>
                              <option value="Bet9ja">Bet9ja</option>
                              <option value="BetWay">BetWay</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">BETTING ACCOUNT ID</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Player Customer ID"
                                className="flex-1 bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs text-white"
                                value={betCustomerId}
                                onChange={(e) => setBetCustomerId(e.target.value)}
                                required
                              />
                              <button 
                                type="button"
                                onClick={handleVerifyBetId}
                                disabled={betVerifying}
                                className="px-3 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-[10px]"
                              >
                                {betVerifying ? "..." : "Verify"}
                              </button>
                            </div>
                          </div>

                          {betVerifiedName && (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded">
                              Player Name: {betVerifiedName}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500">TOPUP AMOUNT (NGN)</label>
                            <input 
                              type="number" 
                              className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs"
                              value={betAmount}
                              onChange={(e) => setBetAmount(e.target.value)}
                              required
                            />
                          </div>

                          <button 
                            type="submit" 
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-xs"
                          >
                            Vend Betting Topup
                          </button>

                          {betResult && (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded text-center">
                              {betResult}
                            </div>
                          )}
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Landlord Tab: Unmatched payments */}
              {landlordTab === 'unmatched' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">Unmatched Inflows</h3>
                    <p className="text-zinc-400 text-sm mt-1">Inbound transfers that cannot be mapped to any active agreement. Pending administrative mapping.</p>
                  </div>

                  <div className="border border-zinc-900 rounded-lg bg-zinc-900/10 overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-zinc-950 text-zinc-500 uppercase border-b border-zinc-900 font-mono">
                        <tr>
                          <th className="p-4">Reference</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Received Date</th>
                          <th className="p-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unmatchedPayments.map((p) => (
                          <tr key={p.id} className="border-b border-zinc-900 hover:bg-zinc-900/20">
                            <td className="p-4 font-medium text-white">{p.nombaReference}</td>
                            <td className="p-4 text-white font-bold">₦{p.amount.toLocaleString()}</td>
                            <td className="p-4 text-rose-400 uppercase font-semibold">{p.matchedStatus}</td>
                            <td className="p-4 text-zinc-400">{new Date(p.receivedAt).toLocaleString()}</td>
                            <td className="p-4">
                              <button 
                                onClick={() => alert("Mapping dialog triggered.")}
                                className="px-2.5 py-1 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded text-[11px] font-semibold"
                              >
                                Link Account
                              </button>
                            </td>
                          </tr>
                        ))}

                        {unmatchedPayments.length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-zinc-500">
                              Unmatched list is clean. All payments reconciled successfully.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Landlord Tab: Developer Sandbox */}
              {landlordTab === 'developer' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-emerald-400" />
                      Nomba Developer Sandbox
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">Interact with all 38+ Nomba API endpoints dynamically. Make live sandbox calls or inspect mocked response flows.</p>
                  </div>

                  {/* Webhook logs viewer tabs */}
                  <div className="border-b border-zinc-855 flex gap-4 text-xs font-mono">
                    <button 
                      onClick={() => setSimulatorSubTab('playground')}
                      className={`pb-3 font-semibold transition ${simulatorSubTab === 'playground' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                    >
                      [⚡] API Playground Explorer (38+ APIs)
                    </button>
                    <button 
                      onClick={() => setSimulatorSubTab('trigger')}
                      className={`pb-3 font-semibold transition ${simulatorSubTab === 'trigger' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                    >
                      [+] Webhook Simulator
                    </button>
                    <button 
                      onClick={() => setSimulatorSubTab('logs')}
                      className={`pb-3 font-semibold transition ${simulatorSubTab === 'logs' ? 'text-emerald-400 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                    >
                      [-] Event Logs ({webhookLogs.length})
                    </button>
                  </div>

                  {/* API Playground Sub-tab */}
                  {simulatorSubTab === 'playground' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-2 max-h-[550px] overflow-y-auto pr-2 border-r border-zinc-900">
                        {APIS_METADATA.map((api, idx) => (
                          <div 
                            key={api.name}
                            onClick={() => setSelectedApiIndex(idx)}
                            className={`p-3 border rounded-lg cursor-pointer transition text-left space-y-1.5 ${selectedApiIndex === idx ? 'bg-zinc-900 border-emerald-500/50' : 'bg-zinc-900/10 border-zinc-900 hover:border-zinc-800'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${api.method === 'POST' ? 'bg-blue-500/10 text-blue-400' : api.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {api.method}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500">{api.tag}</span>
                            </div>
                            <h4 className="font-bold text-xs text-white truncate">{api.name}</h4>
                            <p className="text-[9px] text-zinc-500 truncate">{api.url}</p>
                          </div>
                        ))}
                      </div>

                      <div className="lg:col-span-8 space-y-5">
                        {APIS_METADATA[selectedApiIndex] && (
                          <div className="space-y-4">
                            <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-lg space-y-2">
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${APIS_METADATA[selectedApiIndex].method === 'POST' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                  {APIS_METADATA[selectedApiIndex].method}
                                </span>
                                {APIS_METADATA[selectedApiIndex].name}
                              </h3>
                              <p className="text-zinc-400 text-xs">{APIS_METADATA[selectedApiIndex].description}</p>
                              <div className="bg-zinc-950 p-2 rounded text-[10px] font-mono text-zinc-500">
                                Endpoint: <span className="text-zinc-300 font-semibold">{APIS_METADATA[selectedApiIndex].url}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Request Payload JSON (Editable)</span>
                              <textarea 
                                className="w-full h-32 p-3 bg-zinc-950 border border-zinc-900 rounded font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-zinc-800 transition"
                                value={requestBodyInput}
                                onChange={(e) => setRequestBodyInput(e.target.value)}
                              />
                            </div>

                            <button 
                              onClick={handleExecutePlaygroundApi}
                              disabled={apiLoading}
                              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs rounded transition uppercase tracking-wider flex items-center gap-1.5"
                            >
                              <Send className="w-4 h-4" />
                              {apiLoading ? "Sending Request..." : "Run Sandbox API"}
                            </button>

                            {apiResponseOutput && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Response JSON Payload</span>
                                <pre className="p-4 bg-zinc-950 border border-zinc-900 text-zinc-300 text-[10px] rounded font-mono overflow-x-auto max-h-60">
                                  {JSON.stringify(apiResponseOutput, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Webhook logs list */}
                  {simulatorSubTab === 'logs' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {webhookLogs.map((log) => (
                          <div 
                            key={log.id} 
                            onClick={() => setSelectedLogId(log.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition text-left space-y-2 ${selectedLogId === log.id ? 'bg-zinc-900 border-emerald-500/50' : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-800'}`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              <span className={`px-1.5 py-0.2 rounded font-bold ${log.status === 200 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {log.status}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-xs">{log.eventType}</p>
                              <p className="text-zinc-500 font-mono text-[9px] truncate">Ref: {log.reference}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="lg:col-span-7 p-6 border border-zinc-900 bg-zinc-900/5 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto min-h-[400px]">
                        {(() => {
                          const logDetails = webhookLogs.find(l => l.id === selectedLogId);
                          if (!logDetails) {
                            return <div className="py-32 text-center text-zinc-600 font-sans text-xs">Select a transaction webhook log to inspect details.</div>;
                          }
                          return (
                            <div className="space-y-4 text-left">
                              <h4 className="font-bold text-zinc-400 border-b border-zinc-900 pb-2">WEBHOOK INGRESS PAYLOAD</h4>
                              {logDetails.payload && (
                                <pre className="bg-zinc-950 border border-zinc-900 p-2.5 rounded text-[10px] text-zinc-300 overflow-x-auto">
                                  {logDetails.payload}
                                </pre>
                              )}
                              <div>
                                <span className="text-zinc-500 block text-[9px]">Reconciliation Status</span>
                                <span className="text-emerald-400 font-bold">{logDetails.reconciliation}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* ROLE: Tenant Views                                          */}
          {/* ========================================================== */}
          {userRole === 'tenant' && (
            <div className="space-y-8 max-w-6xl">
              
              {/* Tenant Tab: My Lease Profile */}
              {tenantTab === 'my-rent' && (
                <div className="space-y-8">
                  {activeTenantTenancyObj ? (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-2xl font-bold">My Rental Profile</h2>
                        <p className="text-zinc-400 text-sm mt-1">Manage payments, check outstanding dues, and view payment history for your apartment.</p>
                      </div>

                      <div className="p-5 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-3 font-sans text-xs">
                        <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          Tenant Workspace Guide
                        </h3>
                        <p className="text-zinc-400 leading-relaxed">
                          Your tenant account is active. Here is how you can manage your lease assets:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-[11px] text-zinc-450">
                          <div className="space-y-1 p-3 bg-zinc-950/80 rounded border border-zinc-900">
                            <span className="text-emerald-400 font-bold text-xs block mb-0.5">Rent Checkout</span>
                            <p>Click **Pay Rent / Simulate Inflow** on the ledger card to pay dues securely using Card OTP or Flash Transfer payment methods.</p>
                          </div>
                          <div className="space-y-1 p-3 bg-zinc-950/80 rounded border border-zinc-900">
                            <span className="text-emerald-400 font-bold text-xs block mb-0.5">Explore Houses</span>
                            <p>Go to **Houses Market** to find more property listings. Settle purchase escrows or rent contracts in minutes.</p>
                          </div>
                          <div className="space-y-1 p-3 bg-zinc-950/80 rounded border border-zinc-900">
                            <span className="text-emerald-400 font-bold text-xs block mb-0.5">Receipts Vault</span>
                            <p>Visit **Receipts Locker** to view and download printable compliance receipts for all your utilities and rent payments.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 border border-zinc-900 bg-zinc-900/30 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4 font-mono text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-sans">Rented Property</span>
                            <h3 className="text-2xl font-bold text-white font-sans">{activeTenantTenancyObj.property.title}</h3>
                            <p className="text-zinc-400 text-sm font-medium font-sans">Landlord: {activeTenantTenancyObj.property.landlord.name}</p>
                          </div>

                          <div className="text-xs space-y-1.5 text-zinc-500">
                            <p>Virtual Account Number: <span className="text-emerald-400 font-semibold">{activeTenantTenancyObj.nombaVirtualAccountId}</span></p>
                            <p>Next Rent Due Date: <span className="text-white">{activeTenantTenancyObj.nextDueDate}</span></p>
                            
                            {/* Caretaker details */}
                            {activeTenantTenancyObj.property.caretakerName && (
                              <p className="p-2 bg-zinc-900/50 border border-zinc-800 rounded text-[11px] text-zinc-300">
                                Property Caretaker: <span className="font-bold text-white">{activeTenantTenancyObj.property.caretakerName}</span> ({activeTenantTenancyObj.property.caretakerPhone})
                              </p>
                            )}

                            {/* Meter details display & Link button */}
                            <div className="flex items-center gap-2 pt-2">
                              <span>Property Utility Meter:</span>
                              {activeTenantTenancyObj.property.meterNumber ? (
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                                  {activeTenantTenancyObj.property.meterProvider}: {activeTenantTenancyObj.property.meterNumber}
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setMeterModalPropertyId(activeTenantTenancyObj.property.id);
                                    setShowMeterModal(true);
                                  }}
                                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                                >
                                  Link Meter
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-lg flex flex-col items-center text-center space-y-3 shadow-inner">
                          <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Active Ledger Balance</span>
                          <span className={`text-3xl font-extrabold ${activeTenantTenancyObj.balance === 0 ? 'text-zinc-300' : (activeTenantTenancyObj.balance > 0 ? 'text-emerald-400' : 'text-rose-400')}`}>
                            {activeTenantTenancyObj.balance === 0 ? '₦0.00' : (activeTenantTenancyObj.balance > 0 ? `+₦${activeTenantTenancyObj.balance.toLocaleString()}` : `-₦${Math.abs(activeTenantTenancyObj.balance).toLocaleString()}`)}
                          </span>
                          <p className="text-zinc-500 text-[10px] max-w-xs font-mono uppercase tracking-wider">
                            {activeTenantTenancyObj.balance === 0 ? 'No outstanding balance due' : (activeTenantTenancyObj.balance > 0 ? 'Overpayment Applied as rent credit' : 'Arrears due for payment')}
                          </p>
                          <button 
                            onClick={() => {
                              setCheckoutTenancy(activeTenantTenancyObj);
                              setCheckoutOption('exact');
                              setPaymentStatus(null);
                              setPayMethod('flash');
                              setShowCheckout(true);
                            }}
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded transition shadow"
                          >
                            Pay Rent / Simulate Inflow
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="py-12 text-center border border-dashed border-zinc-900 bg-zinc-900/10 rounded-lg text-zinc-500 space-y-4">
                        <Building2 className="w-12 h-12 mx-auto text-zinc-800" />
                        <h4 className="text-sm font-bold text-white">No active lease linked to this email</h4>
                        <p className="text-xs max-w-md mx-auto">You can claim an already renting property by virtual account reference code below, or explore new listings in the market.</p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setTenantTab('marketplace')}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded transition"
                          >
                            Browse Houses Marketplace
                          </button>
                        </div>
                        
                        <form onSubmit={handleClaimTenancy} className="flex gap-2 max-w-sm mx-auto font-mono text-xs">
                          <input 
                            type="text" 
                            placeholder="Virtual Account reference"
                            className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded focus:outline-none"
                            value={claimVaNumber}
                            onChange={(e) => setClaimVaNumber(e.target.value)}
                            required
                          />
                          <button type="submit" className="px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold uppercase tracking-wider">Link</button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tenant Tab: Houses Marketplace */}
              {tenantTab === 'marketplace' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">Houses Marketplace</h3>
                      <p className="text-zinc-400 text-sm mt-1">Explore, rent, or purchase premium property listings listed directly by verified landlords.</p>
                    </div>

                    {/* Global FX Converter Widget */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg font-mono text-xs shrink-0">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-zinc-400">1 NGN =</span>
                      {mktFxLoading ? (
                        <span className="text-zinc-500 animate-pulse">...</span>
                      ) : (
                        <span className="text-white font-bold">{mktFxRate ? mktFxRate.toFixed(6) : '—'}</span>
                      )}
                      <select
                        className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
                        value={mktFxCurrency}
                        onChange={(e) => setMktFxCurrency(e.target.value)}
                      >
                        {FX_CURRENCIES.map(c => <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties
                      .filter(p => p.status === 'LISTED' || (p.status === 'LET' && p.availableUnits > 0))
                      .map(p => {
                        const convertedPrice = mktFxRate && p.price ? (p.price * mktFxRate).toFixed(2) : null;
                        const projections = (() => { try { return JSON.parse(p.annualProjections || '[]'); } catch { return []; } })();
                        return (
                          <div key={p.id} className="border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 rounded-xl flex flex-col overflow-hidden transition group">

                            {/* Property Image */}
                            {p.imageUrl ? (
                              <div className="relative h-44 overflow-hidden">
                                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" onError={(e) => e.target.parentElement.style.display='none'} />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                                <div className="absolute top-2 left-2 flex gap-1.5">
                                  <span className="px-2 py-0.5 bg-emerald-500/90 text-white rounded text-[9px] uppercase tracking-wider font-bold backdrop-blur">{p.type}</span>
                                  {p.isAssured && (
                                    <span className="px-2 py-0.5 bg-amber-500/90 text-white rounded text-[9px] uppercase tracking-wider font-bold flex items-center gap-1 backdrop-blur">
                                      <ShieldCheck className="w-2.5 h-2.5" /> Assured
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="h-32 bg-zinc-900 flex items-center justify-center relative">
                                <Building2 className="w-10 h-10 text-zinc-700" />
                                <div className="absolute top-2 left-2 flex gap-1.5">
                                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] uppercase tracking-wider font-bold">{p.type}</span>
                                  {p.isAssured && (
                                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[9px] uppercase tracking-wider font-bold flex items-center gap-1">
                                      <ShieldCheck className="w-2.5 h-2.5" /> Assured
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="p-4 flex flex-col gap-3 flex-1 font-mono text-xs">
                              <div>
                                <h4 className="font-bold text-sm text-white font-sans truncate">{p.title}</h4>
                                <p className="text-zinc-400 text-[11px] font-sans mt-0.5">{p.area || 'Lagos'} · {p.buildingType || 'Apartment'}</p>
                              </div>

                              {/* Price + FX */}
                              <div>
                                <p className="text-white text-xl font-extrabold font-sans">₦{p.price?.toLocaleString() || '—'}</p>
                                {convertedPrice && (
                                  <p className="text-emerald-400 text-[11px] font-sans">≈ {mktFxCurrency} {parseFloat(convertedPrice).toLocaleString()}</p>
                                )}
                                {p.paymentFrequency && (
                                  <span className="text-zinc-500 text-[10px]">per {p.paymentFrequency?.toLowerCase()}</span>
                                )}
                              </div>

                              {/* First Payment */}
                              {p.firstPaymentAmount && (
                                <div className="px-2 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded text-[10px] font-sans">
                                  <span className="text-zinc-400">First payment: </span>
                                  <span className="text-blue-400 font-bold">₦{parseFloat(p.firstPaymentAmount).toLocaleString()}</span>
                                </div>
                              )}

                              {/* Annual Projections */}
                              {projections.length > 0 && projections.some(v => v > 0) && (
                                <div className="space-y-1">
                                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> 5-Year Rent Projection</p>
                                  <div className="grid grid-cols-5 gap-1">
                                    {projections.map((v, i) => (
                                      <div key={i} className="text-center">
                                        <div className="text-[8px] text-zinc-600">Yr{i+1}</div>
                                        <div className="text-[9px] text-zinc-300 font-bold">₦{(v/1000).toFixed(0)}k</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Units left */}
                              <div className="text-[11px] text-zinc-400 font-sans flex items-center justify-between">
                                <span>Rooms / Flats:</span>
                                <span className="text-emerald-400 font-bold">{p.availableUnits ?? 1} of {p.totalUnits ?? 1} available</span>
                              </div>

                              <button
                                onClick={() => {
                                  const tempVa = "va_market_" + Math.random().toString(36).substring(2, 10);
                                  const mockTen = {
                                    id: "temp_market_lease_" + p.id,
                                    rentAmount: p.firstPaymentAmount ? parseFloat(p.firstPaymentAmount) : p.price,
                                    nombaVirtualAccountId: tempVa,
                                    property: p,
                                    isMarketplacePurchase: true
                                  };
                                  setCheckoutTenancy(mockTen);
                                  setCheckoutOption('exact');
                                  setPaymentStatus(null);
                                  setPayMethod('flash');
                                  setShowCheckout(true);
                                }}
                                className="mt-auto w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg font-sans transition uppercase tracking-wider text-center text-xs"
                              >
                                {p.type === 'RENT' ? 'Rent via Nomba' : 'Buy via Nomba Escrow'}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {properties.filter(p => p.status === 'LISTED' || (p.status === 'LET' && p.availableUnits > 0)).length === 0 && (
                      <p className="text-zinc-500 text-center py-20 lg:col-span-3">No houses listed in the market catalog at this time.</p>
                    )}
                  </div>
                </div>
              )}


              {/* Tenant Tab: Receipts Vault Locker */}
              {tenantTab === 'receipts' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">My Receipts Locker</h3>
                    <p className="text-zinc-400 text-sm mt-1">Access all your digital billing vouchers for rent, power vend, and TV services stored in your secure vault.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userReceipts.map(rec => (
                      <div 
                        key={rec.id} 
                        onClick={() => setSelectedReceipt(rec)}
                        className="p-5 border border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 rounded-lg cursor-pointer space-y-3 font-mono text-xs text-left transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rec.category === 'RENT' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {rec.category}
                          </span>
                          <span className="text-zinc-500 text-[10px]">{new Date(rec.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm truncate">{rec.title}</h4>
                        <div className="flex justify-between items-baseline pt-1">
                          <span className="text-zinc-500 text-[9px]">Amount Paid</span>
                          <span className="text-white font-bold text-base">₦{rec.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-zinc-500 text-[9px] truncate">Ref: {rec.reference}</p>
                      </div>
                    ))}

                    {userReceipts.length === 0 && (
                      <div className="py-20 text-center text-zinc-600 lg:col-span-3">Your receipts vault is currently empty. Complete checkout transactions to populate vouchers.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Tenant Tab: Locked Chat Room */}
              {tenantTab === 'chat' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">Property Locked Chatroom</h3>
                    <p className="text-zinc-400 text-sm mt-1">Direct communication threads securely locked between you and your landlord.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-zinc-900 rounded-xl overflow-hidden min-h-[500px]">
                    <div className="lg:col-span-4 border-r border-zinc-900 bg-zinc-900/10 p-4 space-y-2">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">My Leased Channels</p>
                      {activeChatroomProperties.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => setActiveChatPropertyId(p.id)}
                          className={`p-3 rounded-lg cursor-pointer transition font-mono text-xs ${activeChatPropertyId === p.id ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-400'}`}
                        >
                          <p className="font-bold truncate">{p.title}</p>
                          <p className="text-[9px] text-zinc-500 truncate">Caretaker: {p.caretakerName || 'None'}</p>
                        </div>
                      ))}
                      {activeChatroomProperties.length === 0 && (
                        <p className="text-zinc-600 text-center py-10 font-mono text-xs">No active leased properties found.</p>
                      )}
                    </div>

                    <div className="lg:col-span-8 flex flex-col justify-between h-[500px] bg-zinc-950/20">
                      {/* Messages body */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatLoading ? (
                          <p className="text-zinc-500 text-xs font-mono text-center py-20">Loading conversations...</p>
                        ) : chatMessages.map(msg => (
                          <div 
                            key={msg.id}
                            className={`flex flex-col max-w-[70%] font-mono text-xs p-3 rounded-lg ${msg.senderEmail === userProfile.email ? 'ml-auto bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'mr-auto bg-zinc-900 text-zinc-300 border border-zinc-850'}`}
                          >
                            <span className="text-[9px] text-zinc-500 block mb-1">{msg.senderEmail === userProfile.email ? "You" : msg.senderEmail}</span>
                            <p className="text-white">{msg.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Chat text input footer */}
                      <form onSubmit={handleSendChatMessage} className="p-4 border-t border-zinc-900 bg-zinc-950 flex gap-2">
                        <input 
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 bg-zinc-900 border border-zinc-855 rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 text-white"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                        />
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-bold text-xs"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ========================================================== */}
      {/* DIALOGS / MODALS / OVERLAYS                                */}
      {/* ========================================================== */}

      {/* MODAL: Rent Checkout Simulator */}
      {showCheckout && checkoutTenancy && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col justify-between">
            {/* Header */}
            <div className="p-6 border-b border-zinc-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Nomba Multi-Checkout Portal</h3>
                <span className="text-[10px] font-mono text-zinc-500">Secure Direct Card or Bank Flash Pay</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-4 flex-1">
              {paymentStatus === null ? (
                /* Payment form configure */
                <div className="space-y-4">
                  <div className="p-3 bg-zinc-900/30 rounded border border-zinc-900 font-mono text-[11px] space-y-1">
                    <p className="text-zinc-500">Property: <span className="text-white font-bold">{checkoutTenancy.property.title}</span></p>
                    <p className="text-zinc-500">Monthly Rent: <span className="text-white font-bold">₦{checkoutTenancy.rentAmount.toLocaleString()}</span></p>
                    <p className="text-zinc-500">Virtual Account: <span className="text-emerald-400 font-semibold">{checkoutTenancy.nombaVirtualAccountId}</span></p>
                  </div>

                  {/* Payment Method Switcher */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 block uppercase">SELECT PAYMENT METHOD</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" 
                        onClick={() => setPayMethod('flash')}
                        className={`py-2 rounded font-bold text-xs uppercase transition ${payMethod === 'flash' ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-850'}`}
                      >
                        Flash Account
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setPayMethod('card')}
                        className={`py-2 rounded font-bold text-xs uppercase transition ${payMethod === 'card' ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-850'}`}
                      >
                        Credit Card Pay
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-500 block uppercase">Choose Payment Amount Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" 
                        onClick={() => setCheckoutOption('exact')}
                        className={`py-1.5 rounded font-bold text-[11px] uppercase transition ${checkoutOption === 'exact' ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-400 border border-zinc-850'}`}
                      >
                        Exact Rent Due
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCheckoutOption('partial')}
                        className={`py-1.5 rounded font-bold text-[11px] uppercase transition ${checkoutOption === 'partial' ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-400 border border-zinc-850'}`}
                      >
                        Partial Pay
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCheckoutOption('overpaid')}
                        className={`py-1.5 rounded font-bold text-[11px] uppercase transition ${checkoutOption === 'overpaid' ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-400 border border-zinc-855'}`}
                      >
                        Overpay Rent
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCheckoutOption('custom')}
                        className={`py-1.5 rounded font-bold text-[11px] uppercase transition ${checkoutOption === 'custom' ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-400 border border-zinc-855'}`}
                      >
                        Custom Amount
                      </button>
                    </div>
                  </div>

                  {/* Card payment section (Saved or New) */}
                  {payMethod === 'card' && (
                    <div className="space-y-3 p-3 bg-zinc-900/10 border border-zinc-900 rounded font-sans text-xs">
                      {/* Saved Cards selector */}
                      {tokenizedCards.length > 0 && (
                        <div className="space-y-1 pb-2 border-b border-zinc-900">
                          <label className="text-[9px] font-mono text-zinc-500 block uppercase">PAY WITH SAVED CARD</label>
                          <div className="flex gap-2">
                            <select 
                              className="flex-1 bg-zinc-950 border border-zinc-800 p-2 rounded text-xs text-white focus:outline-none"
                              value={selectedSavedCard}
                              onChange={(e) => setSelectedSavedCard(e.target.value)}
                            >
                              <option value="">-- CHOOSE SAVED CARD --</option>
                              {tokenizedCards.map(c => (
                                <option key={c.id} value={c.cardToken}>{c.brand} ending in {c.last4} ({c.expiry})</option>
                              ))}
                            </select>
                            {selectedSavedCard && (
                              <button 
                                type="button"
                                onClick={() => handleRevokeCardToken(selectedSavedCard)}
                                className="p-2 bg-rose-950/20 border border-rose-900/50 hover:bg-rose-900/20 text-rose-400 rounded"
                                title="Revoke Authorization Token"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {!selectedSavedCard && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-zinc-500 block uppercase">INPUT NEW CARD DETAILS</span>
                          <input 
                            type="text" 
                            placeholder="CARDHOLDER NAME" 
                            className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded text-xs focus:outline-none"
                            value={checkoutCardForm.name}
                            onChange={(e) => setCheckoutCardForm({...checkoutCardForm, name: e.target.value})}
                          />
                          <input 
                            type="text" 
                            placeholder="16-DIGIT CARD NUMBER" 
                            className="w-full bg-zinc-950 border border-zinc-855 p-2 rounded text-xs focus:outline-none"
                            value={checkoutCardForm.number}
                            onChange={(e) => setCheckoutCardForm({...checkoutCardForm, number: e.target.value})}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              className="bg-zinc-950 border border-zinc-855 p-2 rounded text-xs focus:outline-none"
                              value={checkoutCardForm.expiry}
                              onChange={(e) => setCheckoutCardForm({...checkoutCardForm, expiry: e.target.value})}
                            />
                            <input 
                              type="password" 
                              placeholder="CVV" 
                              maxLength={3}
                              className="bg-zinc-950 border border-zinc-855 p-2 rounded text-xs focus:outline-none"
                              value={checkoutCardForm.cvv}
                              onChange={(e) => setCheckoutCardForm({...checkoutCardForm, cvv: e.target.value})}
                            />
                            <input 
                              type="password" 
                              placeholder="PIN" 
                              maxLength={4}
                              className="bg-zinc-950 border border-zinc-855 p-2 rounded text-xs focus:outline-none"
                              value={checkoutCardForm.pin}
                              onChange={(e) => setCheckoutCardForm({...checkoutCardForm, pin: e.target.value})}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Calculated Amount display */}
                  <div className="p-3 bg-zinc-950 rounded border border-zinc-900 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Pay Amount:</span>
                    <span className="text-base font-extrabold text-white">
                      {checkoutOption === 'exact' && `₦${checkoutTenancy.rentAmount.toLocaleString()}`}
                      {checkoutOption === 'partial' && `₦${(checkoutTenancy.rentAmount * 0.75).toLocaleString()}`}
                      {checkoutOption === 'overpaid' && `₦${(checkoutTenancy.rentAmount * 1.25).toLocaleString()}`}
                      {checkoutOption === 'custom' && (
                        <input 
                          type="number" 
                          placeholder="Amount in NGN"
                          className="bg-transparent border-b border-zinc-700 text-white font-extrabold focus:outline-none w-28 text-right pr-1"
                          value={customPayAmount}
                          onChange={(e) => setCustomPayAmount(e.target.value)}
                        />
                      )}
                    </span>
                  </div>
                </div>
              ) : paymentStatus === 'flash_details' && checkoutFlashAcct ? (
                /* Flash Details view */
                <div className="space-y-4 font-mono text-xs text-left">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                    Flash Bank Account Number Generated Successfully!
                  </div>
                  <div className="space-y-2 bg-zinc-950 p-4 border border-zinc-900 rounded">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">BANK NAME:</span>
                      <span className="text-white font-bold">{checkoutFlashAcct.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ACCOUNT NUMBER:</span>
                      <span className="text-white font-mono font-bold text-sm tracking-wider select-all">{checkoutFlashAcct.flashAccountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">BENEFICIARY:</span>
                      <span className="text-white font-semibold">Nomba / AcreWise Escrow</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">TRANSFER AMOUNT:</span>
                      <span className="text-emerald-400 font-bold">₦{checkoutOption === 'exact' ? checkoutTenancy.rentAmount.toLocaleString() : (checkoutOption === 'partial' ? (checkoutTenancy.rentAmount * 0.75).toLocaleString() : (checkoutOption === 'overpaid' ? (checkoutTenancy.rentAmount * 1.25).toLocaleString() : parseFloat(customPayAmount).toLocaleString()))}</span>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-zinc-500 flex gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <p>Copy the account details and perform a transfer. Once complete, click the confirm payment completion button below.</p>
                  </div>
                </div>
              ) : paymentStatus === 'otp_prompt' ? (
                /* Card OTP prompt */
                <div className="space-y-4 font-mono text-xs text-left">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    OTP Verification Code Required
                  </div>
                  <p className="text-zinc-400 text-[11px]">Enter the 6-digit confirmation code sent to your phone number +234*****32 to authenticate card charge.</p>
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500">VERIFICATION OTP</label>
                    <input 
                      type="password" 
                      placeholder="e.g. 123456" 
                      maxLength={6}
                      className="w-full bg-zinc-950 border border-zinc-900 p-2 rounded focus:outline-none text-xs text-white"
                      value={checkoutOtp}
                      onChange={(e) => setCheckoutOtp(e.target.value)}
                    />
                  </div>
                </div>
              ) : paymentStatus === 'success' ? (
                /* Success response */
                <div className="py-8 flex flex-col items-center text-center space-y-4 font-mono">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">Payment Approved</h4>
                    <p className="text-zinc-500 text-xs">Reconciliation Engine Completed Execution.</p>
                  </div>
                </div>
              ) : (
                /* Error response */
                <div className="py-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-base">Transaction Failed</h4>
                    <p className="text-zinc-500 text-xs">Internal gateway processing error.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-zinc-900 bg-zinc-900/10 flex gap-3">
              {paymentStatus === null ? (
                <>
                  <button 
                    disabled={isPaying}
                    onClick={handleCheckoutPortalPay}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-bold text-xs rounded transition uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    {isPaying ? 'Processing...' : 'Authorize Pay'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-bold text-xs rounded transition uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </>
              ) : paymentStatus === 'flash_details' ? (
                <>
                  <button 
                    onClick={async () => {
                      setIsPaying(true);
                      let amt = checkoutTenancy.rentAmount;
                      if (checkoutOption === 'partial') amt = checkoutTenancy.rentAmount * 0.75;
                      if (checkoutOption === 'overpaid') amt = checkoutTenancy.rentAmount * 1.25;
                      if (checkoutOption === 'custom') amt = parseFloat(customPayAmount) || 0;
                      
                      if (checkoutTenancy.isMarketplacePurchase) {
                        await handleMarketplaceCheckout(checkoutTenancy.property);
                      } else {
                        await executePaymentSimulation(amt, checkoutTenancy.nombaVirtualAccountId);
                      }
                      
                      setPaymentStatus('success');
                      setIsPaying(false);
                    }}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition uppercase tracking-wider"
                  >
                    I have Transferred Dues
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentStatus(null)}
                    className="flex-1 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs rounded transition uppercase tracking-wider"
                  >
                    Back
                  </button>
                </>
              ) : paymentStatus === 'otp_prompt' ? (
                <>
                  <button 
                    onClick={handleSubmitCardOtp}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition uppercase tracking-wider"
                  >
                    Submit OTP Code
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentStatus(null)}
                    className="flex-1 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs rounded transition uppercase tracking-wider"
                  >
                    Back
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setShowCheckout(false)}
                  className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Close Portal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create & List Property Form */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl w-full max-w-lg space-y-4 my-8">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold">List Property for Rent / Sale</h3>
            </div>

            <form onSubmit={handleListProperty} className="space-y-4 font-mono text-xs">

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 block uppercase">Property Title</label>
                <input type="text" placeholder="e.g. Eko Atlantic Towers, Apt 4B"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  value={newProp.title} onChange={(e) => setNewProp({ ...newProp, title: e.target.value })} required />
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 block uppercase">Property Image URL <span className="text-zinc-600">(optional)</span></label>
                <input type="url" placeholder="https://... link to photo of the property"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  value={newProp.imageUrl} onChange={(e) => setNewProp({ ...newProp, imageUrl: e.target.value })} />
                {newProp.imageUrl && (
                  <img src={newProp.imageUrl} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-zinc-700" onError={(e) => e.target.style.display='none'} />
                )}
              </div>

              {/* Type + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 block uppercase font-sans">Listing Type</label>
                  <select className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none font-sans"
                    value={newProp.type} onChange={(e) => setNewProp({ ...newProp, type: e.target.value })}>
                    <option value="RENT">RENT</option>
                    <option value="SALE">SALE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 block uppercase font-sans">Status</label>
                  <select className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none font-sans"
                    value={newProp.status} onChange={(e) => setNewProp({ ...newProp, status: e.target.value })}>
                    <option value="LISTED">LISTED (MARKETPLACE)</option>
                    <option value="LET">LET (RENTED)</option>
                    <option value="UNDER_ESCROW">UNDER_ESCROW</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>

              {/* Area + Building Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 block uppercase">Area / Location</label>
                  <input type="text" placeholder="e.g. Lekki Phase 1"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none"
                    value={newProp.area} onChange={(e) => setNewProp({ ...newProp, area: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 block uppercase">Building Type</label>
                  <input type="text" placeholder="e.g. Penthouse Mansion"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none"
                    value={newProp.buildingType} onChange={(e) => setNewProp({ ...newProp, buildingType: e.target.value })} required />
                </div>
              </div>

              {/* Price + Units */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 block uppercase">Listing Price (NGN)</label>
                  <input type="number" placeholder="Price amount"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none"
                    value={newProp.price} onChange={(e) => setNewProp({ ...newProp, price: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 block uppercase">Total Rooms / Flats</label>
                  <input type="number" placeholder="e.g. 8"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none"
                    value={newProp.totalUnits} onChange={(e) => setNewProp({ ...newProp, totalUnits: e.target.value })} required />
                </div>
              </div>

              {/* Rent Schedule (only for RENT type) */}
              {newProp.type === 'RENT' && (
                <div className="space-y-3 border border-zinc-800 rounded-lg p-3 bg-zinc-900/50">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Rent Schedule & Projections</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 block uppercase">First Payment (NGN)</label>
                      <input type="number" placeholder="e.g. 1200000"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500/50"
                        value={newProp.firstPaymentAmount} onChange={(e) => setNewProp({ ...newProp, firstPaymentAmount: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 block uppercase">Payment Frequency</label>
                      <select className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none font-sans"
                        value={newProp.paymentFrequency} onChange={(e) => setNewProp({ ...newProp, paymentFrequency: e.target.value })}>
                        <option value="MONTHLY">Monthly</option>
                        <option value="BIANNUAL">Every 6 Months</option>
                        <option value="ANNUAL">Annual</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 block uppercase">Annual Rent Projections — Year 1 → 5 (NGN)</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="space-y-0.5">
                          <span className="text-[9px] text-zinc-600 block text-center">Yr {i+1}</span>
                          <input type="number" placeholder="0"
                            className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-[10px] text-white focus:outline-none text-center"
                            value={newProp.annualProjections[i]}
                            onChange={(e) => {
                              const proj = [...newProp.annualProjections];
                              proj[i] = e.target.value;
                              setNewProp({ ...newProp, annualProjections: proj });
                            }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Ownership Document */}
              <div className="space-y-1 border border-zinc-800 rounded-lg p-3 bg-zinc-900/30">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <label className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Ownership Document URL <span className="text-zinc-600 font-normal">(optional — private)</span></label>
                </div>
                <p className="text-[10px] text-zinc-500 mb-1.5">Upload your deed / C of O to a secure URL. It will never be shown publicly — your listing will display an "Assured by AcreWise" badge.</p>
                <input type="url" placeholder="https://... link to ownership document"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-amber-500/50"
                  value={newProp.ownershipDocumentUrl} onChange={(e) => setNewProp({ ...newProp, ownershipDocumentUrl: e.target.value })} />
                {newProp.ownershipDocumentUrl && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-amber-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px]">This listing will be marked as "Assured by AcreWise"</span>
                  </div>
                )}
              </div>

              {/* Invite Tenant */}
              <div className="space-y-1 border-t border-zinc-900 pt-3">
                <label className="text-[10px] text-zinc-500 block uppercase">Invite Tenant Email (Optional)</label>
                <input type="email" placeholder="Link an already existing tenant email"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none"
                  value={inviteTenantEmail} onChange={(e) => setInviteTenantEmail(e.target.value)} />
              </div>

              <div className="flex gap-2 pt-1 font-sans">
                <button type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition uppercase tracking-wider">
                  List Property
                </button>
                <button type="button" onClick={() => setShowPropertyModal(false)}
                  className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded transition uppercase tracking-wider">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Link House Meter Form */}
      {showMeterModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg w-full max-w-md space-y-4">
            <div>
              <h3 className="text-lg font-bold">Link Utility Meter to Property</h3>
              <p className="text-zinc-400 text-xs mt-1">Bind a physical electricity/disco meter directly to this rental asset folder.</p>
            </div>
            
            <form onSubmit={handleLinkMeter} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">METER PROVIDER / DISCO</label>
                <select 
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 font-sans"
                  value={meterFormProvider}
                  onChange={(e) => setMeterFormProvider(e.target.value)}
                  required
                >
                  <option value="IKEDC">Ikeja Electric (IKEDC)</option>
                  <option value="EKEDC">Eko Electric (EKEDC)</option>
                  <option value="AEDC">Abuja Electric (AEDC)</option>
                  <option value="KEDCO">Kano Electric (KEDCO)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">METER SERIAL NUMBER</label>
                <input 
                  type="text" 
                  placeholder="11-digit Meter Number"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700"
                  value={meterFormNumber}
                  onChange={(e) => setMeterFormNumber(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 font-sans">
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Link Meter
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowMeterModal(false)}
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Assign Caretaker Form */}
      {showCaretakerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg w-full max-w-md space-y-4">
            <div>
              <h3 className="text-lg font-bold">Assign House Caretaker</h3>
              <p className="text-zinc-400 text-xs mt-1">Designate a building supervisor caretaker to coordinate maintenance requests.</p>
            </div>
            
            <form onSubmit={handleAssignCaretaker} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">CARETAKER FULL NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700"
                  value={caretakerForm.name}
                  onChange={(e) => setCaretakerForm({...caretakerForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">CARETAKER EMAIL</label>
                  <input 
                    type="email" 
                    placeholder="john@caretaker.com"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700"
                    value={caretakerForm.email}
                    onChange={(e) => setCaretakerForm({...caretakerForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">CARETAKER PHONE</label>
                  <input 
                    type="text" 
                    placeholder="+234 803..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none"
                    value={caretakerForm.phone}
                    onChange={(e) => setCaretakerForm({...caretakerForm, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 font-sans">
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Assign Caretaker
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCaretakerModal(false)}
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Receipt PDF Voucher */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-xl w-full max-w-md font-mono text-xs space-y-6">
            {/* Header */}
            <div className="text-center space-y-1.5 border-b border-zinc-900 pb-4">
              <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-400 uppercase tracking-widest text-sm">
                <ShieldCheck className="w-4 h-4" />
                ACREWISE TRANSACTION SLIP
              </div>
              <p className="text-zinc-500 text-[10px]">RECONCILED VIA NOMBA COMPLIANCE CORE</p>
            </div>

            {/* Voucher Details */}
            <div className="space-y-3.5 bg-zinc-900/10 p-4 border border-zinc-900 rounded-lg">
              <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                <span className="text-zinc-500">RECEIPT ID:</span>
                <span className="text-white font-bold">{selectedReceipt.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                <span className="text-zinc-500">CATEGORY:</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedReceipt.category}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                <span className="text-zinc-500">REFERENCE:</span>
                <span className="text-white font-semibold select-all">{selectedReceipt.reference}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                <span className="text-zinc-500">HOLDER:</span>
                <span className="text-white truncate">{selectedReceipt.tenantEmail}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-900/50 pb-2">
                <span className="text-zinc-500">TIMESTAMP:</span>
                <span className="text-white">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
              </div>
              
              <div className="pt-2">
                <span className="text-zinc-500 block mb-1">TRANSACTION DETAILS:</span>
                <p className="text-zinc-300 leading-normal bg-zinc-950 p-2.5 rounded border border-zinc-850">{selectedReceipt.details}</p>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-zinc-900">
                <span className="text-zinc-400 font-bold">TOTAL VALUE</span>
                <span className="text-emerald-400 font-extrabold text-lg">₦{selectedReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt Footer Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Simulating PDF Download...")}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 font-sans"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded transition font-sans"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Tenancy Form */}
      {showTenancyModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Establish Tenancy Agreement</h3>
            
            <form onSubmit={handleCreateTenancy} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 block uppercase">Link Property</label>
                <select 
                  value={newTenancy.propertyId}
                  onChange={(e) => setNewTenancy({ ...newTenancy, propertyId: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                  required
                >
                  <option value="">-- SELECT PROPERTY --</option>
                  {properties
                    .filter(p => p.landlord?.email === userProfile?.email && p.status !== 'SOLD' && !tenancies.some(t => t.property.id === p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.buildingType} - {p.area})</option>
                    ))}
                </select>
                {properties.filter(p => p.landlord?.email === userProfile?.email && p.status !== 'SOLD' && !tenancies.some(t => t.property.id === p.id)).length === 0 && (
                  <p className="text-[10px] text-amber-400 font-mono mt-1">⚠️ No available properties found for your account. Please list one first.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 block uppercase font-mono">Nomba Virtual Account ID (Unique)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. va_eko_atlantic_rent" 
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition font-mono"
                    value={newTenancy.nombaVirtualAccountId}
                    onChange={(e) => setNewTenancy({ ...newTenancy, nombaVirtualAccountId: e.target.value })}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={handleProvisionVirtualAccount}
                    disabled={isProvisioningVa}
                    className="px-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 rounded text-xs font-bold text-white transition whitespace-nowrap"
                  >
                    {isProvisioningVa ? "Provisioning..." : "Auto-Provision via Nomba"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 block uppercase">Rent Amount (NGN)</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    value={newTenancy.rentAmount}
                    onChange={(e) => setNewTenancy({ ...newTenancy, rentAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-500 block uppercase">Frequency</label>
                  <select 
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                    value={newTenancy.frequency}
                    onChange={(e) => setNewTenancy({ ...newTenancy, frequency: e.target.value })}
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="ANNUAL">ANNUAL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-500 block uppercase">Next Rent Due Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-zinc-700 transition"
                  value={newTenancy.nextDueDate}
                  onChange={(e) => setNewTenancy({ ...newTenancy, nextDueDate: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button 
                  type="submit" 
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Establish
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowTenancyModal(false)}
                  className="flex-1 py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
