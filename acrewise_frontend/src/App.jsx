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
import { callNimApi } from '../nimApi.js';

const CONFIG = {
  subAccountId: import.meta.env.VITE_NOMBA_SUB_ACCOUNT_ID || ''
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // landing, login, dashboard
  const [userRole, setUserRole] = useState('tenant'); // landlord, tenant (restricted by userProfile.role)

  function navigateTo(view, path) {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
    }
    setCurrentView(view);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateViewFromPath = () => {
      const path = window.location.pathname;
      if (path === '/auth') {
        setCurrentView('login');
      } else if (path === '/checkout/complete') {
        setCurrentView('dashboard');
      } else {
        setCurrentView('landing');
      }
    };

    updateViewFromPath();
    window.addEventListener('popstate', updateViewFromPath);
    return () => window.removeEventListener('popstate', updateViewFromPath);
  }, []);

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
  const [escrowActionLoading, setEscrowActionLoading] = useState(null); // escrow id being actioned
  const [escrowConfirm, setEscrowConfirm] = useState(null); // { txn, action: 'release' | 'reject' }
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
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // null, redirecting, verifying, success, error
  const [checkoutOrderRef, setCheckoutOrderRef] = useState('');

  useEffect(() => {
    if (window.location.pathname !== '/checkout/complete') return;
    try {
      const pending = JSON.parse(sessionStorage.getItem('acrewise_pending_checkout') || 'null');
      const returnedOrderRef = new URLSearchParams(window.location.search).get('orderReference');
      if (pending) {
        setUserProfile(pending.userProfile || null);
        setUserRole(pending.userRole || 'tenant');
        setCheckoutTenancy(pending.checkoutTenancy || null);
        setCheckoutOrderRef(returnedOrderRef || pending.checkoutOrderRef || '');
        setPaymentStatus(null);
        setShowCheckout(true);
      }
    } catch (err) {
      console.error('Could not restore pending checkout:', err);
    }
  }, []);

  // Tokenized Saved Cards
  const [tokenizedCards, setTokenizedCards] = useState([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState('');

  // POS Terminals State
  const [posTerminals, setPosTerminals] = useState([]);
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

  // Nomba API console tabs
  const [simulatorSubTab, setSimulatorSubTab] = useState('playground');
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [webhookLogs] = useState([]);

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
  const [newProp, setNewProp] = useState({ title: '', type: 'RENT', status: 'LISTED', area: 'Lekki', buildingType: 'Penthouse', price: '2400000', totalUnits: '1', landlordName: 'Chinedu Okafor', landlordEmail: 'chinedu@acrewise.com', landlordPhone: '+2348031234567', imageBase64: null, firstPaymentAmount: '', paymentFrequency: 'ANNUAL', annualProjections: ['', '', '', '', ''], ownershipDocumentUrl: '' });
  const [propImagePreview, setPropImagePreview] = useState(null); // Object URL for local preview

  function handlePropImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPropImagePreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = (ev) => setNewProp(prev => ({ ...prev, imageBase64: ev.target.result }));
    reader.readAsDataURL(file);
  }
  const [newTenancy, setNewTenancy] = useState({ propertyId: '', tenantId: '', rentAmount: '1200000', frequency: 'MONTHLY', nextDueDate: '2026-08-01', nombaVirtualAccountId: '' });

  // Marketplace FX Converter
  const [mktFxRate, setMktFxRate] = useState(null);
  const [mktFxCurrency, setMktFxCurrency] = useState('USD');
  const [mktFxLoading, setMktFxLoading] = useState(false);

  const FX_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD'];

  async function fetchMarketplaceRate(currency) {
    setMktFxLoading(true);
    try {
      const data = await executeNombaApi({
        name: 'Fetch Nomba exchange rates',
        method: 'GET',
        url: `/v1/global-payout/exchange-rates?from=NGN&to=${encodeURIComponent(currency)}`
      });
      const rate = data.data?.rates?.[0];
      setMktFxRate(rate ? parseFloat(String(rate.midRate || rate.askRate || '').replace(/[^0-9.]/g, '')) : null);
    } catch {
      setMktFxRate(null);
    }
    setMktFxLoading(false);
  }

  useEffect(() => { fetchMarketplaceRate(mktFxCurrency); }, [mktFxCurrency]);

  // Environmental Analysis via NVIDIA NIM AI
  const [envAnalysis, setEnvAnalysis] = useState({
    open: false, // modal open
    property: null, // property being analyzed
    loading: false, // waiting for AI
    report: null, // { security, flood, electricity, neighborhood, overall }
    error: null,
  });

  async function handleEnvAnalysis(property) {
    setEnvAnalysis({ open: true, property, loading: true, report: null, error: null });

    const location = [property.area, property.buildingType, 'Nigeria'].filter(Boolean).join(', ');
    const prompt = `You are a Nigerian real estate environmental analyst. Analyze the location: "${location}" for a ${property.type === 'RENT' ? 'rental' : 'sale'} property listed as "${property.title}".

Respond ONLY with a valid JSON object with exactly these five fields (no markdown, no code blocks, raw JSON only):
{
 "security": "2-3 sentence honest assessment of security/crime levels in this area",
 "flood": "2-3 sentence assessment of flood risk — mention rainy season, drainage, proximity to waterways if relevant",
 "electricity": "2-3 sentence assessment of power supply reliability, typical outage hours, whether the area has estate generators or PHCN issues",
 "neighborhood": "2-3 sentence description of the neighborhood vibe, social class, nearby amenities, roads and transport",
 "overall": "One short verdict sentence (e.g. 'Good for families, moderate security, invest in a generator')"
}`;

    try {
      const raw = await callNimApi({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      });

      // Strip any accidental markdown code fences
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setEnvAnalysis(prev => ({ ...prev, loading: false, report: parsed }));
    } catch (err) {
      console.error('[EnvAnalysis] Error:', err);
      setEnvAnalysis(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch environmental analysis. Try again.',
      }));
    }
  }

  // --- REST / Nomba production API helpers ---

  useEffect(() => {
    if (APIS_METADATA[selectedApiIndex]) {
      setRequestBodyInput(JSON.stringify(APIS_METADATA[selectedApiIndex].requestBody, null, 2));
    }
  }, [selectedApiIndex]);

  async function executeNombaApi({ name, method, url, body = {} }) {
    const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, method, url, body })
    });
    const data = await res.json();
    if (!res.ok || data?.code !== '00') {
      throw new Error(data?.description || `Nomba request failed (${res.status})`);
    }
    return data;
  }

  async function provisionNombaVirtualAccount(accountName, accountRef) {
    const data = await executeNombaApi({
      name: 'Create production virtual account',
      method: 'POST',
      url: CONFIG.subAccountId ? `/v1/accounts/virtual/${CONFIG.subAccountId}` : '/v1/accounts/virtual',
      body: {
        accountRef,
        accountName
      }
    });
    return data.data;
  }

  async function handleExecutePlaygroundApi() {
    setApiLoading(true);
    setApiResponseOutput(null);
    const api = APIS_METADATA[selectedApiIndex];

    let bodyObj = {};
    try {
      bodyObj = JSON.parse(requestBodyInput || '{}');
    } catch (e) {
      alert("Invalid JSON format.");
      setApiLoading(false);
      return;
    }

    try {
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: api.name,
          method: api.method,
          url: api.url,
          body: bodyObj,
        })
      });
      const data = await res.json();
      setApiResponseOutput(data);
    } catch (err) {
      setApiResponseOutput({ error: "Failed to connect to Nomba production API." });
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
      const res = await fetch(API_BASE + '/graphql', {
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
 nombaOrderReference
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
 nombaOrderReference
 nombaTransactionReference
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
      const va1 = await provisionNombaVirtualAccount('AcreWise Demo Tenant One', `acrewise_demo_${Date.now()}_one`);
      const t1Mutation = `
 mutation {
 createTenancy(
 propertyId: "${p1.listProperty.id}",
 tenantId: "tenant@acrewise.com",
 rentAmount: 1200000.0,
 frequency: "MONTHLY",
 nextDueDate: "2026-08-01",
 nombaVirtualAccountId: "${va1.bankAccountNumber}"
 ) { id }
 }
 `;
      await fetchGraphQL(t1Mutation);
    }

    if (p2 && p2.listProperty) {
      const va2 = await provisionNombaVirtualAccount('AcreWise Demo Tenant Two', `acrewise_demo_${Date.now()}_two`);
      const t2Mutation = `
 mutation {
 createTenancy(
 propertyId: "${p2.listProperty.id}",
 tenantId: "tenant2@acrewise.com",
 rentAmount: 3500000.0,
 frequency: "ANNUAL",
 nextDueDate: "2026-07-15",
 nombaVirtualAccountId: "${va2.bankAccountNumber}"
 ) { id }
 }
 `;
      await fetchGraphQL(t2Mutation);
    }

    if (p3 && p3.listProperty) {
      const va3 = await provisionNombaVirtualAccount('AcreWise Demo Escrow Buyer', `acrewise_demo_${Date.now()}_escrow`);
      const eMutation = `
 mutation {
 createEscrowTransaction(
 propertyId: "${p3.listProperty.id}",
 buyerId: "buyer@acrewise.com",
 amountHeld: 45000000.0,
 nombaVirtualAccountId: "${va3.bankAccountNumber}"
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
    const mutation = `mutation { claimTenancy(tenancyId: "${matched.id}", tenantId: "${userProfile.email}") { id tenantId } }`;
    const data = await fetchGraphQL(mutation);
    if (data?.claimTenancy) {
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
      const projStr = JSON.stringify(newProp.annualProjections.map(v => parseFloat(v) || 0));
      const hasOwnerDoc = newProp.ownershipDocumentUrl && newProp.ownershipDocumentUrl.trim();

      // Send imageBase64 via variables to safely handle large payloads
      const propMutation = `
 mutation ListProperty(
 $landlordId: ID!, $title: String!, $type: String!, $status: String!,
 $area: String!, $buildingType: String!, $price: Float!, $totalUnits: Int,
 $imageUrl: String, $firstPaymentAmount: Float, $paymentFrequency: String,
 $annualProjections: String, $ownershipDocumentUrl: String
 ) {
 listProperty(
 landlordId: $landlordId, title: $title, type: $type, status: $status,
 area: $area, buildingType: $buildingType, price: $price, totalUnits: $totalUnits,
 imageUrl: $imageUrl, firstPaymentAmount: $firstPaymentAmount,
 paymentFrequency: $paymentFrequency, annualProjections: $annualProjections,
 ownershipDocumentUrl: $ownershipDocumentUrl
 ) { id }
 }
 `;
      const propVars = {
        landlordId,
        title: newProp.title,
        type: newProp.type,
        status: newProp.status,
        area: newProp.area,
        buildingType: newProp.buildingType,
        price: parseFloat(newProp.price),
        totalUnits: parseInt(newProp.totalUnits) || 1,
        imageUrl: newProp.imageBase64 || null,
        firstPaymentAmount: newProp.firstPaymentAmount ? parseFloat(newProp.firstPaymentAmount) : null,
        paymentFrequency: newProp.paymentFrequency,
        annualProjections: projStr,
        ownershipDocumentUrl: hasOwnerDoc ? newProp.ownershipDocumentUrl : null,
      };
      const propData = await fetchGraphQL(propMutation, propVars);
      if (propData && propData.listProperty) {
        const propId = propData.listProperty.id;
        if (inviteTenantEmail) {
          const virtualAccount = await provisionNombaVirtualAccount(
            `AcreWise ${inviteTenantEmail.toLowerCase()}`,
            `acrewise_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
          );
          const tenancyMutation = `
 mutation {
 createTenancy(
 propertyId: "${propId}",
 tenantId: "${inviteTenantEmail.toLowerCase()}",
 rentAmount: ${parseFloat(newProp.price)},
 frequency: "${newProp.paymentFrequency}",
 nextDueDate: "2026-08-01",
 nombaVirtualAccountId: "${virtualAccount.bankAccountNumber}"
 ) { id }
 }
 `;
          await fetchGraphQL(tenancyMutation);
          setInviteTenantEmail('');
        }
        setShowPropertyModal(false);
        setPropImagePreview(null);
        setNewProp(prev => ({ ...prev, imageBase64: null }));
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

  // Provision a real Nomba virtual account for a tenancy.
  async function handleProvisionVirtualAccount() {
    setIsProvisioningVa(true);
    try {
      const data = await provisionNombaVirtualAccount(
        `AcreWise ${userProfile?.email || 'Tenant'}`,
        `acrewise_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      );
      setNewTenancy({ ...newTenancy, nombaVirtualAccountId: data.bankAccountNumber });
      alert(`Successfully provisioned virtual account! \nAccount Number: ${data.bankAccountNumber}\nBank Name: ${data.bankName}`);
    } catch (err) {
      alert(`Virtual account provisioning failed: ${err.message}`);
    }
    setIsProvisioningVa(false);
  }

  // Fetch POS terminals assigned to Sub account
  async function fetchNombaTerminals() {
    setFetchingTerminals(true);
    const terminalsSpec = APIS_METADATA.find(a => a.name === "Fetch terminals assigned to a sub account");
    try {
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: terminalsSpec.name,
          method: terminalsSpec.method,
          url: CONFIG.subAccountId ? `/v1/terminals/sub-account/${CONFIG.subAccountId}` : '/v1/terminals',
          body: {},
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        const terminals = Array.isArray(data.data) ? data.data : data.data?.results || [];
        const mapped = terminals.map((term) => ({
          id: term.id || term.terminalId,
          terminalId: term.terminalId,
          serialNumber: term.serialNumber,
          status: term.status,
          dateAssigned: term.dateAssigned || term.createdAt
        }));
        setPosTerminals(mapped);
        alert("Successfully synced POS Terminal rosters from Nomba.");
      }
    } catch (err) {
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
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
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
        })
      });
      const data = await res.json();
      if (data && data.code === "00") {
        setPayoutVerifiedName(data.data.accountName);
        await fetchGraphQL(`mutation { updateLandlordPayoutDetails(email: "${userProfile.email}", bankAccountNumber: "${payoutAcctNumber}", bankCode: "${payoutBankCode}") { email } }`);
      } else {
        alert("Verification failed. Check account credentials.");
      }
    } catch (err) {
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
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: transferSpec.name,
          method: transferSpec.method,
          url: CONFIG.subAccountId ? `/v2/transfers/bank/${CONFIG.subAccountId}` : '/v2/transfers/bank',
          body: {
            amount: parseFloat(payoutAmount),
            accountNumber: payoutAcctNumber,
            accountName: payoutVerifiedName,
            bankCode: payoutBankCode,
            merchantTxRef: "UNQ_" + Math.random().toString(36).substring(2, 10),
            senderName: userProfile?.name || userProfile?.email || "AcreWise",
            narration: "AcreWise Rent Payout"
          },
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
    } catch (err) {
      alert("Transfer failed.");
    }
    setLoading(false);
  }

  // FX Convert rates lookup
  async function handleFxConvert() {
    setLoading(true);
    try {
      const data = await executeNombaApi({
        name: 'Convert money with Nomba',
        method: 'POST',
        url: '/v1/global-payout/money/convert',
        body: {
          amount: parseFloat(fxAmount),
          currency: 'NGN',
          destinationCurrency: fxTargetCurrency,
          transactionType: 'EXCHANGE',
          sourceCountryIsoCode: 'NG'
        }
      });
      setFxExchangeId(data.data?.exchangeRateId);
      setFxRate(data.data?.toAmount ? data.data.toAmount / parseFloat(fxAmount) : null);
      setFxStep(2);
    } catch (err) {
      alert(`FX conversion quote failed: ${err.message}`);
    }
    setLoading(false);
  }

  // Confirm FX conversion
  async function handleConfirmFx() {
    setLoading(true);
    try {
      const data = await executeNombaApi({
        name: 'Authorize Nomba exchange',
        method: 'POST',
        url: '/v1/global-payout/exchange/authorize',
        body: {
          amount: parseFloat(fxAmount),
          sourceCurrency: 'NGN',
          destinationCurrency: fxTargetCurrency,
          senderName: userProfile?.name || userProfile?.email || 'AcreWise Customer',
          receiverName: userProfile?.name || userProfile?.email || 'AcreWise Customer',
          sourceCountryIsoCode: 'NG',
          destinationCountryIsoCode: 'NG',
          authCode: fxOtp,
          narration: 'AcreWise currency conversion',
          lockedExchangeRateId: fxExchangeId
        }
      });
      if (data?.code === '00') {
        const reference = data.data?.wtTransactionId || fxExchangeId;
        setFxResult(`Exchange submitted. Reference: ${reference}. Status: ${data.data?.status || 'PROCESSING'}.`);

        // Save Receipt
        await saveReceipt("Currency Conversion", "RENT", parseFloat(fxAmount), reference, `Converted NGN to ${fxTargetCurrency} at rate ${fxRate}`);

        setFxStep(1);
        setFxOtp('');
      }
    } catch (err) {
      alert(`FX authorization failed: ${err.message}`);
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
    try {
      const data = await executeNombaApi({
        name: 'Fetch electricity customer information',
        method: 'GET',
        url: `/v1/bill/electricity/lookup?customerId=${encodeURIComponent(meterNumber)}&disco=${encodeURIComponent(discoCode)}`
      });
      setMeterOwner(typeof data.data === 'string' ? data.data : `Verified meter ${meterNumber}`);
    } catch (err) {
      setMeterOwner('');
      alert(`Meter verification failed: ${err.message}`);
    }
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
    try {
      const data = await executeNombaApi({
        name: 'Vend electricity via Nomba',
        method: 'POST',
        url: '/v1/bill/electricity',
        body: {
          disco: discoCode.toLowerCase(),
          merchantTxRef: `acrewise_${Date.now()}`,
          payerName: userProfile?.name || userProfile?.email || 'AcreWise Customer',
          amount: parseInt(utilityAmount, 10),
          customerId: meterNumber,
          meterType: 'PREPAID'
        }
      });
      const result = data.data || {};
      const token = result.meta?.phcnVendToken || 'Pending delivery';
      const reference = result.meta?.merchantTxRef || result.id;
      setUtilityToken(token);
      await saveReceipt('Electricity Token Purchase', 'UTILITY', parseFloat(utilityAmount), reference, `Electricity disco: ${discoCode}. Meter: ${meterNumber}. Token: ${token}`);
      alert(`Electricity request completed. Token: ${token}`);
    } catch (err) {
      alert(`Electricity vending failed: ${err.message}`);
    }
    setLoading(false);
  }

  // Buy Airtime/Data
  async function handleVendAirtime(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = airtimePlan === 'airtime' ? 3000 : airtimePlan === 'data_large' ? 6000 : 3000;
      const data = await executeNombaApi({
        name: airtimePlan === 'airtime' ? 'Vend airtime via Nomba' : 'Vend data via Nomba',
        method: 'POST',
        url: airtimePlan === 'airtime' ? '/v1/bill/topup' : '/v1/bill/data',
        body: {
          amount,
          phoneNumber: airtimePhone,
          network: airtimeCarrier,
          merchantTxRef: `acrewise_${Date.now()}`,
          senderName: userProfile?.name || userProfile?.email || 'AcreWise Customer'
        }
      });
      const result = data.data || {};
      const reference = result.meta?.merchantTxRef || result.id;
      await saveReceipt('Mobile Airtime / Data', 'UTILITY', amount, reference, `Vended to ${airtimePhone} under plan: ${airtimePlan}`);
      alert(`${airtimePlan === 'airtime' ? 'Airtime' : 'Data'} request completed. Status: ${result.status || data.description}`);
      setAirtimePhone('');
    } catch (err) {
      alert(`Airtime/data vending failed: ${err.message}`);
    }
    setLoading(false);
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
    try {
      const data = await executeNombaApi({
        name: tvSpec?.name || 'Fetch cable TV customer information',
        method: 'GET',
        url: `/v1/bill/cabletv/lookup?customerId=${encodeURIComponent(tvSmartcard)}&cableTvType=${encodeURIComponent(tvProvider.toLowerCase())}`
      });
      setTvVerifiedName(typeof data.data === 'string' ? data.data : data.data?.name || 'Verified customer');
    } catch (err) {
      alert(`Cable TV verification failed: ${err.message}`);
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
    try {
      const amount = tvPackageCode === 'dstv_compact' ? 15700 : tvPackageCode === 'gotv_max' ? 7200 : 5100;
      const data = await executeNombaApi({
        name: tvVendSpec?.name || 'Vend cable TV subscription',
        method: 'POST',
        url: '/v1/bill/cabletv',
        body: {
          cableTvType: tvProvider.toLowerCase(),
          merchantTxRef: `acrewise_${Date.now()}`,
          payerName: userProfile?.name || userProfile?.email || 'AcreWise Customer',
          amount,
          customerId: tvSmartcard
        }
      });
      const reference = data.data?.meta?.merchantTxRef || data.data?.id;
      setTvResult(`Cable TV request completed. Reference: ${reference}`);
      await saveReceipt('Cable TV Subscription', 'CABLE', amount, reference, `Vended to Smartcard: ${tvSmartcard} (${tvProvider})`);
      setTvSmartcard('');
      setTvVerifiedName('');
    } catch (err) {
      alert(`Cable TV vending failed: ${err.message}`);
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
    try {
      const data = await executeNombaApi({
        name: betVerifySpec?.name || 'Fetch betting customer information',
        method: 'GET',
        url: `/v1/bill/betting/lookup?providerId=${encodeURIComponent(betProvider.toLowerCase())}&customerId=${encodeURIComponent(betCustomerId)}`
      });
      setBetVerifiedName(typeof data.data === 'string' ? data.data : data.data?.customerName || 'Verified customer');
    } catch (err) {
      alert(`Betting customer verification failed: ${err.message}`);
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
    try {
      const data = await executeNombaApi({
        name: betVendSpec?.name || 'Vend betting wallet top up',
        method: 'POST',
        url: '/v1/bill/betting',
        body: {
          bettingProvider: betProvider.toLowerCase(),
          merchantTxRef: `acrewise_${Date.now()}`,
          phoneNumber: userProfile?.phone || '',
          payerName: userProfile?.name || userProfile?.email || 'AcreWise Customer',
          amount: parseInt(betAmount, 10),
          customerId: betCustomerId
        }
      });
      const reference = data.data?.meta?.merchantTxRef || data.data?.id;
      setBetResult(`Betting wallet request completed. Reference: ${reference}`);
      await saveReceipt('Betting Wallet Credit', 'BETTING', parseFloat(betAmount), reference, `Credited betting account: ${betCustomerId} (${betProvider})`);
      setBetCustomerId('');
      setBetVerifiedName('');
    } catch (err) {
      alert(`Betting payment failed: ${err.message}`);
    }
    setLoading(false);
  }

  // Revoke tokenized card credentials
  async function handleRevokeCardToken(tokenId) {
    if (confirm("Are you sure you want to revoke this saved card tokenized authorization?")) {
      const delCardSpec = APIS_METADATA.find(a => a.name === "Delete tokenized card data");
      try {
        await fetch(API_BASE + '/api/nomba-sandbox/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: delCardSpec.name,
            method: delCardSpec.method,
            url: delCardSpec.url,
            body: { cardToken: tokenId },
          })
        });
        setTokenizedCards(prev => prev.filter(c => c.cardToken !== tokenId));
        alert("Card token revoked successfully and card details removed.");
      } catch (err) {
        alert("Failed to delete tokenized card.");
      }
    }
  }

  // Checkout modal pay — creates a real Nomba online checkout order and redirects
  async function handleCheckoutPortalPay() {
    let amt = checkoutTenancy.rentAmount;
    if (checkoutOption === 'partial') amt = checkoutTenancy.rentAmount * 0.75;
    if (checkoutOption === 'overpaid') amt = checkoutTenancy.rentAmount * 1.25;
    if (checkoutOption === 'custom') amt = parseFloat(customPayAmount) || 0;

    setIsPaying(true);

    const orderRef = "ord_" + Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
    setCheckoutOrderRef(orderRef);

    const callbackUrl = import.meta.env.VITE_CHECKOUT_CALLBACK_URL || `${window.location.origin}/checkout/complete`;
    const checkoutOrderSpec = APIS_METADATA.find(a => a.name === "Create an online checkout order");

    let preparedCheckoutTenancy = checkoutTenancy;
    try {
      if (checkoutTenancy.isMarketplacePurchase && !checkoutTenancy.escrowPrepared) {
        const accountData = await provisionNombaVirtualAccount(
          `${userProfile?.name || 'AcreWise Tenant'} ${checkoutTenancy.property.type === 'SALE' ? 'Escrow' : 'Rent'}`,
          `acrewise_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
        );
        const virtualAccountId = accountData.bankAccountNumber;
        const property = checkoutTenancy.property;
        const mutation = property.type === 'SALE'
          ? `mutation { createEscrowTransaction(propertyId: "${property.id}", buyerId: "${userProfile.email}", amountHeld: ${property.price}, nombaVirtualAccountId: "${virtualAccountId}", nombaOrderReference: "${orderRef}") { id status } }`
          : `mutation { createTenancy(propertyId: "${property.id}", tenantId: "${userProfile.email}", rentAmount: ${property.price}, frequency: "${property.paymentFrequency || 'MONTHLY'}", nextDueDate: "2026-08-01", nombaVirtualAccountId: "${virtualAccountId}", nombaOrderReference: "${orderRef}") { id } }`;
        const prepared = await fetchGraphQL(mutation);
        if (!prepared?.createEscrowTransaction && !prepared?.createTenancy) {
          throw new Error('Could not prepare the property transaction before checkout.');
        }
        preparedCheckoutTenancy = {
          ...checkoutTenancy,
          nombaVirtualAccountId: virtualAccountId,
          escrowPrepared: true,
          escrowId: prepared.createEscrowTransaction?.id
        };
        setCheckoutTenancy(preparedCheckoutTenancy);
      }
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: checkoutOrderSpec.name,
          method: checkoutOrderSpec.method,
          url: checkoutOrderSpec.url,
          body: {
            order: {
              amount: Number(amt).toFixed(2),
              currency: "NGN",
              orderReference: orderRef,
              callbackUrl: callbackUrl,
              customerEmail: userProfile?.email || "customer@acrewise.com",
              customerId: userProfile?.email || "customer@acrewise.com",
              accountId: CONFIG.subAccountId || undefined
            }
          },
        })
      });
      const data = await res.json();
      const checkoutLink = data?.data?.checkoutLink || data?.data?.checkoutUrl;
      if (res.ok && data?.code === "00" && checkoutLink) {
        if (!checkoutTenancy.isMarketplacePurchase && checkoutTenancy.id) {
          const linked = await fetchGraphQL(`mutation { linkTenancyOrder(tenancyId: "${preparedCheckoutTenancy.id}", orderReference: "${orderRef}") { id nombaOrderReference } }`);
          if (!linked?.linkTenancyOrder) {
            throw new Error('Could not link the Nomba order to this lease agreement.');
          }
        }
        sessionStorage.setItem('acrewise_pending_checkout', JSON.stringify({
          checkoutTenancy: preparedCheckoutTenancy,
          checkoutOrderRef: orderRef,
          userProfile,
          userRole
        }));
        setPaymentStatus('redirecting');
        // Short delay so the user sees the status before redirect
        setTimeout(() => {
          window.location.href = checkoutLink;
        }, 800);
      } else {
        setPaymentStatus('error');
      }
    } catch (err) {
      if (preparedCheckoutTenancy?.escrowPrepared && preparedCheckoutTenancy.property?.type === 'SALE') {
        await fetchGraphQL(`mutation { rejectEscrow(id: "${preparedCheckoutTenancy.escrowId || ''}") { id } }`).catch(() => null);
      }
      setPaymentStatus('error');
    }
    setIsPaying(false);
  }

  // Verify order status after returning from Nomba checkout
  async function handleVerifyCheckoutOrder() {
    if (!checkoutOrderRef) return;
    setIsPaying(true);
    const amt = checkoutTenancy.rentAmount;
    const orderSpec = APIS_METADATA.find(a => a.name && a.name.includes("Get Order details"));
    try {
      const res = await fetch(API_BASE + '/api/nomba-sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orderSpec.name,
          method: "GET",
          url: `/v1/checkout/order/${checkoutOrderRef}`,
          body: {},
        })
      });
      const data = await res.json();
      const orderStatus = data?.data?.status || data?.data?.order?.status || data?.data?.order?.paymentStatus;
      if (data?.code === "00" && ['PAID', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED'].includes(String(orderStatus).toUpperCase())) {
        setPaymentStatus('success');
        if (checkoutTenancy.isMarketplacePurchase) {
          await handleMarketplaceCheckout(checkoutTenancy.property, checkoutOrderRef);
        } else {
          // The signed Nomba webhook is the source of reconciliation truth.
          // Never fabricate a webhook from the browser after checkout.
          await loadData();
          await saveReceipt(
            "Rent Payment",
            "RENT",
            amt,
            checkoutOrderRef,
            `Nomba checkout payment confirmed for ${checkoutTenancy.property?.title || checkoutTenancy.nombaVirtualAccountId}`
          );
        }
        sessionStorage.removeItem('acrewise_pending_checkout');
      } else {
        alert("Payment has not been confirmed yet. Please try again or check your Nomba transaction history.");
      }
    } catch (err) {
      alert("Could not verify order status. Please check your Nomba transaction history.");
    }
    setIsPaying(false);
  }

  // Tenant rent/buy house from marketplace
  async function handleMarketplaceCheckout(propObj, orderReference) {
    setLoading(true);
    try {
    if (checkoutTenancy?.escrowPrepared) {
      await saveReceipt(
        propObj.type === 'SALE' ? 'House Purchase Escrow Deposit' : 'Rent First Payment',
        propObj.type === 'SALE' ? 'PURCHASE' : 'RENT',
        checkoutTenancy.rentAmount,
        orderReference,
        `Nomba checkout payment confirmed for ${propObj.title}.`
      );
      await loadData();
      alert(`Checkout Completed! ${propObj.type === 'SALE' ? 'Purchase escrow is now awaiting handover.' : 'Lease agreement is active.'}`);
      return;
    }

    const rentAmount = propObj.price;
    const isSale = propObj.type === 'SALE';
    const accountData = await provisionNombaVirtualAccount(
      `${userProfile?.name || 'AcreWise Tenant'} ${propObj.type === 'SALE' ? 'Escrow' : 'Rent'}`,
      `acrewise_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    );
    const nombaVirtualAccountId = accountData.bankAccountNumber;

    // Create new tenancy/escrow
    if (isSale) {
      const eMutation = `
 mutation {
 createEscrowTransaction(
 propertyId: "${propObj.id}",
 buyerId: "${userProfile.email}",
 amountHeld: ${rentAmount},
 nombaVirtualAccountId: "${nombaVirtualAccountId}",
 nombaOrderReference: "${orderReference}"
 ) { id status }
 }
 `;
      const escrowData = await fetchGraphQL(eMutation);
      if (!escrowData?.createEscrowTransaction) {
        throw new Error('Could not create the purchase escrow record.');
      }
      await saveReceipt("House Purchase Escrow Deposit", "PURCHASE", rentAmount, orderReference, `Escrow deposit confirmed for: ${propObj.title}. Funds will be released to landlord upon handover confirmation.`);
    } else {
      const freq = propObj.paymentFrequency || 'MONTHLY';
      const tMutation = `
 mutation {
 createTenancy(
 propertyId: "${propObj.id}",
 tenantId: "${userProfile.email}",
 rentAmount: ${rentAmount},
 frequency: "${freq}",
 nextDueDate: "2026-08-01",
 nombaVirtualAccountId: "${nombaVirtualAccountId}",
 nombaOrderReference: "${orderReference}"
 ) { id }
 }
 `;
      const tenancyData = await fetchGraphQL(tMutation);
      if (!tenancyData?.createTenancy) {
        throw new Error('Could not create the lease agreement.');
      }
      await saveReceipt("Rent First Payment", "RENT", rentAmount, orderReference, `First rent payment confirmed for: ${propObj.title}. Auto-subscription active — next payment due per ${freq.toLowerCase()} schedule.`);
    }

    await loadData();
    alert(`Checkout Completed! House successfully secured.`);
    } catch (err) {
      alert(`Post-payment settlement setup failed: ${err.message}`);
      await loadData();
    } finally {
      setLoading(false);
    }
  }

  // Landlord: Release or Reject an escrow transaction
  async function handleEscrowAction(txn, action) {
    setEscrowActionLoading(txn.id);
    try {
      if (action === 'release') {
        const result = await fetchGraphQL(`mutation { releaseEscrow(id: "${txn.id}") { id status releasedAt nombaTransactionReference } }`);
        if (!result?.releaseEscrow) throw new Error('Escrow release was not confirmed by the server.');
        await saveReceipt(
          "Escrow Funds Released",
          "PURCHASE",
          txn.amountHeld,
          result.releaseEscrow.nombaTransactionReference || txn.nombaOrderReference || txn.id,
          `Escrow released for: ${txn.property.title}. Buyer: ${txn.buyerId}. Nomba transfer confirmed.`
        );
        alert(`Escrow released. ₦${txn.amountHeld.toLocaleString()} was sent through Nomba.`);
      } else {
        const result = await fetchGraphQL(`mutation { rejectEscrow(id: "${txn.id}") { id status } }`);
        if (!result?.rejectEscrow) throw new Error('Escrow rejection was not confirmed by the server.');
        alert(`Escrow rejected and the property was relisted after Nomba processing.`);
      }
      await loadData();
    } catch (err) {
      alert(`Escrow action failed: ${err.message}`);
    }
    setEscrowActionLoading(null);
    setEscrowConfirm(null);
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
      <div className="min-h-screen text-gray-900 flex flex-col justify-between font-sans relative overflow-x-hidden bg-slate-50">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-mono tracking-wider font-bold text-lg text-slate-900">
              <div className="w-3 h-3 bg-slate-700 rounded-full animate-pulse"></div>
              ACREWISE
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#how-it-works" className=" transition">How it works</a>
            <a href="#why-acrewise" className=" transition">Why Acrewise</a>
            <a href="#faq" className=" transition">FAQ</a>
          </nav>
          <button onClick={() => navigateTo('login', '/auth')} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded tracking-wide transition">
            GET STARTED
          </button>
        </header>

        <main className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_25%)] pointer-events-none" />

          <section className="relative pt-16 px-6 md:px-16 lg:px-24">
            <div className="grid gap-16 lg:grid-cols-2 items-center max-w-7xl mx-auto">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-[0.18em]">
                  <Sparkles className="w-3.5 h-3.5" />
                  BUILT FOR PROPERTY PAYMENTS
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                    One platform for escrow, rent automation, and landlord finance workflows.
                  </h1>
                  <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                    Acrewise blends virtual account orchestration, reconciliation workflows, and tenant billing into a single dashboard so landlords and tenants move from payment friction to financial clarity.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigateTo('login', '/auth')} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase rounded-xl transition">
                    Get Started
                  </button>
                  <a href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:border-slate-400 transition">
                    See how it works
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-3xl bg-white/80 border border-slate-200 px-4 py-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Speed</p>
                    <p className="mt-3 font-semibold text-slate-900">Secure Nomba onboarding in minutes</p>
                  </div>
                  <div className="rounded-3xl bg-white/80 border border-slate-200 px-4 py-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Scale</p>
                    <p className="mt-3 font-semibold text-slate-900">Multi-tenant leasing & payouts</p>
                  </div>
                  <div className="rounded-3xl bg-white/80 border border-slate-200 px-4 py-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Visibility</p>
                    <p className="mt-3 font-semibold text-slate-900">Reconciled rent and bill history</p>
                  </div>
                  <div className="rounded-3xl bg-white/80 border border-slate-200 px-4 py-5 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Compliance</p>
                    <p className="mt-3 font-semibold text-slate-900">Audit-ready escrow settlement</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-400/30 via-white/0 to-sky-300/10 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-900/10">
                  <img src="/dashboard_image.jpg" alt="Acrewise dashboard preview" className="w-full h-full object-cover min-h-[420px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                </div>
                <div className="mt-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live platform highlights</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-950/5 p-4">
                      <p className="text-sm font-semibold text-slate-900">Automated receipts</p>
                      <p className="mt-2 text-sm text-slate-500">Instant tenant payment tracking and proof of settlement.</p>
                    </div>
                    <div className="rounded-3xl bg-slate-950/5 p-4">
                      <p className="text-sm font-semibold text-slate-900">Virtual account reconciliation</p>
                      <p className="mt-2 text-sm text-slate-500">Assign, match, and settle rent automatically per lease.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="relative py-24 px-6 md:px-16 lg:px-24 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mx-auto max-w-2xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-700 font-semibold">How it works</p>
                <h2 className="mt-4 text-4xl font-bold text-slate-900">From onboarding to escrow settlement in three simple steps.</h2>
                <p className="mt-4 text-slate-600 leading-relaxed">Acrewise abstracts the complexity of payment routing, reconciliation, and tenant communication so you can manage your portfolio confidently.</p>
              </div>
              <div className="mt-16 grid gap-8 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="text-slate-700 text-2xl font-bold">1</div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">Activate accounts</h3>
                  <p className="mt-3 text-slate-600">Provision virtual accounts, link tenants, and automate rent request generation.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="text-slate-700 text-2xl font-bold">2</div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">Collect & reconcile</h3>
                  <p className="mt-3 text-slate-600">Match incoming payments to leases and keep every transaction reconciled with your ledger.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="text-slate-700 text-2xl font-bold">3</div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">Release funds</h3>
                  <p className="mt-3 text-slate-600">Manage escrow approvals, vendor payouts, and tenant refunds from a single console.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="why-acrewise" className="py-24 px-6 md:px-16 lg:px-24">
            <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500 font-semibold">Why Acrewise</p>
                <h2 className="text-4xl font-bold text-slate-900">Designed for modern landlords and property operators.</h2>
                <p className="text-slate-600 leading-relaxed">Acrewise combines payment orchestration, leasing intelligence, and automated tenant reconciliation into a platform built to reduce manual work and improve cashflow visibility.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">One dashboard for every rent flow</h3>
                  <p className="mt-3 text-slate-600">See rent collections, escrow status, and payout schedules from a single pane.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Compliance-ready records</h3>
                  <p className="mt-3 text-slate-600">Keep payment history and escrow approvals organized for audit and regulatory needs.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Tenant-first payments</h3>
                  <p className="mt-3 text-slate-600">Help tenants pay confidently with clear virtual account references and automated receipts.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Built for scale</h3>
                  <p className="mt-3 text-slate-600">Grow to dozens or hundreds of properties with centralized reconciliation and finance workflows.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" className="py-24 px-6 md:px-16 lg:px-24 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mx-auto max-w-2xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-700 font-semibold">Frequently asked questions</p>
                <h2 className="mt-4 text-4xl font-bold text-slate-900">Answers for property managers and finance teams.</h2>
              </div>
              <div className="mt-16 grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Can I onboard existing tenants?</h3>
                  <p className="mt-3 text-slate-600">Yes. Acrewise supports existing tenants, linking them to virtual accounts and reconciling payments against active leases.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Does Acrewise manage escrow settlements?</h3>
                  <p className="mt-3 text-slate-600">Absolutely. Lease receipts can be held in escrow and released only when agreed conditions are met.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Can I reconcile payments automatically?</h3>
                  <p className="mt-3 text-slate-600">Yes. Incoming payments are matched to invoices and leases using virtual account metadata.</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">How do I get started?</h3>
                  <p className="mt-3 text-slate-600">Click the Get Started button, then log in to your Acrewise console to provision accounts and configure your first property.</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-gray-200 bg-white/90 backdrop-blur-md px-6 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-xs text-slate-500 font-mono">INTEGRATIONS & COMPATIBILITY</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:flex gap-8 md:gap-12 opacity-60">
              <span className="font-semibold text-sm text-slate-700">NOMBA WEBHOOKS</span>
              <span className="font-semibold text-sm text-slate-700">POSTGRES CORE</span>
              <span className="font-semibold text-sm text-slate-700">REDIS IDEMPOTENCY</span>
              <span className="font-semibold text-sm text-slate-700">GRAPHQL ENDPOINTS</span>
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
      <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col items-center justify-center p-6"
        style={{ backgroundImage: `radial-gradient(circle at top, rgba(226, 232, 240, 0.5), transparent)` }}>
        <div className="w-full max-w-md p-8 border border-gray-200 bg-white backdrop-blur rounded-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 font-mono font-bold tracking-wider text-slate-700 text-lg">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full animate-ping"></div>
              ACREWISE CONSOLE
            </div>
            <h2 className="text-xl font-bold">Secure Access Gate</h2>
            <p className="text-gray-400 text-xs font-mono">Profile Registration and Role Provisioning</p>
          </div>

          <div className="flex border-b border-gray-200 text-xs font-mono">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 pb-2 font-bold uppercase transition ${authMode === 'login' ? 'text-slate-700 border-b-2 border-slate-300' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 pb-2 font-bold uppercase transition ${authMode === 'register' ? 'text-slate-700 border-b-2 border-slate-300' : 'text-gray-400 hover:text-gray-700'}`}
            >
              Register Profile
            </button>
          </div>

          <form onSubmit={handleUserProfileLogin} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 block">PROFILE EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="e.g. landlord@reflow.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-slate-300 transition"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {authMode === 'register' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 block">SELECT ACCESS ROLE</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegisterRole('TENANT')}
                      className={`py-2.5 border rounded font-mono text-xs transition uppercase ${registerRole === 'TENANT' ? 'bg-gray-100 text-slate-700 border-slate-300/30' : 'bg-slate-50 text-zinc-650 border-gray-200 hover:border-gray-200'}`}
                    >
                      Renting Tenant
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterRole('LANDLORD')}
                      className={`py-2.5 border rounded font-mono text-xs transition uppercase ${registerRole === 'LANDLORD' ? 'bg-gray-100 text-slate-700 border-slate-300/30' : 'bg-slate-50 text-zinc-650 border-gray-200 hover:border-gray-200'}`}
                    >
                      Property Landlord
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 block">FULL NAME (OPTIONAL)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Chinedu Okafor"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-slate-300 transition"
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
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2"
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
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex overflow-hidden">

      {/* Left Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-slate-50 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Area */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono font-bold tracking-wider text-slate-700">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
              ACREWISE
            </div>
            <span className="px-1.5 py-0.5 border border-slate-300 bg-slate-800/10 text-slate-700 rounded text-[9px] font-mono tracking-widest uppercase">Console</span>
          </div>

          {/* User profile session widget */}
          <div className="p-4 border-b border-gray-200 bg-white text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <div className="w-7 h-7 rounded-full bg-slate-800/10 border border-slate-300 flex items-center justify-center font-bold text-slate-700 uppercase">
                {userProfile?.name?.charAt(0)}
              </div>
              <div className="truncate">
                <p className="font-bold text-gray-900 leading-tight truncate">{userProfile?.name}</p>
                <p className="text-[9px] text-gray-400 truncate">{userProfile?.email}</p>
              </div>
            </div>

            {/* Upgrade banner if Tenant */}
            {userProfile?.role === 'TENANT' ? (
              <button
                onClick={handleUpgradeProfile}
                className="w-full py-1 bg-slate-800/10 hover:bg-slate-800/20 border border-slate-300 text-slate-700 text-[10px] font-bold uppercase rounded transition tracking-wider"
              >
                Upgrade to Landlord
              </button>
            ) : (
              <div className="px-2 py-0.5 bg-slate-800/10 border border-slate-300 text-slate-700 text-[9px] text-center font-bold rounded uppercase tracking-wider">
                👑 Landlord Authorized
              </div>
            )}
          </div>

          {/* Role Switcher Widget */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block mb-2">ACTIVE WORKSPACE ROLE</span>
            <div className="flex items-center justify-between p-1 bg-slate-50 border border-gray-200 rounded-lg">
              <button
                onClick={() => {
                  if (userProfile?.role !== 'LANDLORD') {
                    alert("Landlord core workspace locked. Upgrade your profile to unlock Landlord switch!");
                    return;
                  }
                  setUserRole('landlord');
                }}
                className={`flex-1 py-1 text-center font-bold text-xs rounded transition uppercase tracking-wider ${userRole === 'landlord' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Landlord
              </button>
              <button
                onClick={() => setUserRole('tenant')}
                className={`flex-1 py-1 text-center font-bold text-xs rounded transition uppercase tracking-wider ${userRole === 'tenant' ? 'bg-slate-900 text-white' : 'text-gray-400 hover:text-gray-700'}`}
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
                <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-gray-400 uppercase">Landlord Dashboard</p>
                <div className="mt-2 space-y-0.5">
                  <button
                    onClick={() => setLandlordTab('overview')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'overview' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <Compass className="w-4 h-4" />
                    Overview
                  </button>
                  <button
                    onClick={() => setLandlordTab('properties')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'properties' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <Building2 className="w-4 h-4" />
                    Properties Hub
                  </button>
                  <button
                    onClick={() => setLandlordTab('leases')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'leases' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <Users className="w-4 h-4" />
                    Lease Agreements
                  </button>
                  <button
                    onClick={() => setLandlordTab('escrow')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'escrow' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <Coins className="w-4 h-4" />
                    Purchase Escrows
                  </button>
                  <button
                    onClick={() => setLandlordTab('payouts')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'payouts' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Payouts & Utilities
                  </button>
                  <button
                    onClick={() => setLandlordTab('terminals')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'terminals' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <SmartphoneNfc className="w-4 h-4" />
                    POS Terminals
                  </button>
                  <button
                    onClick={() => setLandlordTab('chat')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'chat' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Tenant Chats
                  </button>
                  <button
                    onClick={() => setLandlordTab('unmatched')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'unmatched' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Unmatched Inflows
                  </button>
                  <button
                    onClick={() => setLandlordTab('developer')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${landlordTab === 'developer' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <Terminal className="w-4 h-4" />
                    Nomba Production API
                  </button>
                </div>
              </div>
            ) : (
              /* TENANT SIDEBAR NAV */
              <div>
                <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-gray-400 uppercase">Tenant Services</p>
                <div className="mt-2 space-y-0.5">
                  <button
                    onClick={() => setTenantTab('my-rent')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${tenantTab === 'my-rent' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <Building2 className="w-4 h-4" />
                    My Lease Ledger
                  </button>
                  <button
                    onClick={() => setTenantTab('marketplace')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${tenantTab === 'marketplace' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <Compass className="w-4 h-4" />
                    Rent / Buy Marketplace
                  </button>
                  <button
                    onClick={() => setTenantTab('receipts')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${tenantTab === 'receipts' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
                  >
                    <Receipt className="w-4 h-4" />
                    Receipts Locker
                  </button>
                  <button
                    onClick={() => setTenantTab('chat')}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2.5 transition font-medium ${tenantTab === 'chat' ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 '}`}
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
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => loadData()}
            className="w-full text-left px-3 py-1.5 hover:bg-white shadow-sm border border-gray-200 rounded text-xs text-gray-400 flex items-center gap-2 hover:text-gray-900 transition font-mono"
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
            className="w-full text-left px-3 py-1.5 hover:bg-rose-950/20 rounded text-xs text-gray-400 flex items-center gap-2 hover:text-rose-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 px-8 flex items-center justify-between bg-slate-50/50 backdrop-blur">
          <div className="flex items-center gap-4 w-96">
            {userRole === 'tenant' && (
              <div className="flex items-center gap-2">
                <label className="text-gray-400 font-mono text-[10px] uppercase">Select Active Tenancy:</label>
                <select
                  className="bg-white shadow-sm border border-gray-200 border border-gray-200 rounded px-2.5 py-1 text-xs text-gray-900"
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

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-2xl bg-white border border-gray-200 text-slate-600 hover:bg-slate-100 transition">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-2xl bg-white border border-gray-200 text-slate-600 hover:bg-slate-100 transition">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-2xl bg-white border border-gray-200 text-slate-600 hover:bg-slate-100 transition">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-gray-400 font-mono text-[10px]">
              Active User: <span className="text-slate-700 font-bold">{userProfile?.email}</span>
            </span>
          </div>
        </header>

        {/* Dynamic Inner Layout Body */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* ========================================================== */}
          {/* ROLE: Landlord Views */}
          {/* ========================================================== */}
          {userRole === 'landlord' && (
            <div className="space-y-8 max-w-6xl">

              {/* Landlord Tab: Overview */}
              {landlordTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold">Landlord Overview</h2>
                    <p className="text-gray-500 text-sm mt-1">Real-time status of rent cash flows, arrears ledger, properties, and purchase escrow holdings.</p>
                  </div>

                  <div className="p-5 bg-white shadow-sm border border-gray-200/40 border border-gray-200 rounded-xl space-y-3 font-sans text-xs">
                    <h3 className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-700" />
                      AcreWise Step-by-Step Console Guide
                    </h3>
                    <p className="text-gray-500 leading-relaxed">
                      AcreWise coordinates property assets, tenancies, utilities, and payouts through authenticated Nomba production services. Here is how to navigate:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-[11px] text-zinc-450">
                      <div className="space-y-1 p-3 bg-slate-50/80 rounded border border-gray-200">
                        <span className="text-slate-700 font-bold text-xs block mb-0.5">1. List & Market</span>
                        <p>Go to **Properties Hub** to list properties. Tenants can browse these houses, link their physical electricity meters, and buy/rent them via secure card checkouts.</p>
                      </div>
                      <div className="space-y-1 p-3 bg-slate-50/80 rounded border border-gray-200">
                        <span className="text-slate-700 font-bold text-xs block mb-0.5">2. Payouts & Utilities</span>
                        <p>Under **Payouts & Utilities**, execute payouts from sub-accounts, swap NGN to global USD/GBP currencies, and vend power or TV package tokens.</p>
                      </div>
                      <div className="space-y-1 p-3 bg-slate-50/80 rounded border border-gray-200">
                        <span className="text-slate-700 font-bold text-xs block mb-0.5">3. Live Audits</span>
                        <p>Access secure chat threads locked per property, check synced POS terminal devices, and inspect chronological transaction receipt logs inside the vault locker.</p>
                      </div>
                    </div>
                  </div>

                  {properties.length === 0 && (
                    <div className="p-6 border border-dashed border-slate-300/30 bg-slate-800/5 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-gray-900">Database is currently empty</h4>
                        <p className="text-gray-500 text-xs font-mono">Initialize the console with default properties, landlords, leases, and escrows to test features.</p>
                      </div>
                      <button
                        onClick={() => seedDemoData()}
                        className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded transition shrink-0"
                      >
                        Seed Demo Dataset
                      </button>
                    </div>
                  )}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 border border-gray-200 bg-white shadow-sm border border-gray-200/30 rounded-lg space-y-2">
                      <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider block">Properties Owned</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{properties.length}</span>
                      </div>
                    </div>
                    <div className="p-5 border border-gray-200 bg-white shadow-sm border border-gray-200/30 rounded-lg space-y-2">
                      <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider block">Leased Tenants</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{tenancies.length}</span>
                      </div>
                    </div>
                    <div className="p-5 border border-gray-200 bg-white shadow-sm border border-gray-200/30 rounded-lg space-y-2 text-rose-400">
                      <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider block">Total Rent Arrears</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">₦{totalActiveArrears.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="p-5 border border-gray-200 bg-white shadow-sm border border-gray-200/30 rounded-lg space-y-2 text-slate-700">
                      <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider block">Est. Monthly Roll</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">₦{totalRentAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Tenancies Ledger Summary */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-widest">Agreement Overviews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tenancies.map(t => (
                        <div key={t.id} className="p-5 border border-gray-200 bg-white shadow-sm border border-gray-200/30 hover:border-gray-200 transition rounded-lg space-y-4">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 truncate">{t.property.title}</h4>
                            <p className="text-[10px] font-mono text-gray-400">Tenant: {t.tenantId}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2.5 rounded border border-gray-200">
                            <div>
                              <span className="text-gray-400 block text-[9px]">Rent amount</span>
                              <span className="font-bold text-gray-900">₦{t.rentAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[9px]">Balance</span>
                              <span className={`font-bold ${t.balance === 0 ? 'text-gray-700' : (t.balance > 0 ? 'text-slate-700' : 'text-rose-400')}`}>
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
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded transition flex items-center gap-1.5"
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
                        <div key={p.id} className="p-5 border border-gray-200 bg-white shadow-sm border border-gray-200/30 hover:border-gray-200 rounded-lg flex flex-col justify-between gap-4 transition">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-gray-400">Area: {p.area || 'N/A'}</span>
                              <span className="text-amber-400 flex items-center gap-0.5">8 <Star className="w-3 h-3 fill-amber-400" /></span>
                            </div>
                            <h4 className="font-bold text-base text-gray-900">{p.title}</h4>
                            <p className="text-gray-500 text-xs font-mono">Type: {p.buildingType || 'Apartment'} | Value: ₦{p.price?.toLocaleString() || '0'}</p>
                            <div className="text-[11px] text-zinc-405 font-mono flex items-center justify-between">
                              <span>Rooms / Flats:</span>
                              <span className="text-slate-700 font-semibold">{p.availableUnits != null ? p.availableUnits : 1} of {p.totalUnits != null ? p.totalUnits : 1} available</span>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-semibold text-gray-700 rounded uppercase">{p.type}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${p.status === 'SOLD' ? 'bg-gray-100 text-gray-500 border border-gray-300' :
                                p.status === 'LET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  p.status === 'LISTED' ? 'bg-slate-800/10 text-slate-700 border border-slate-300' :
                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>{p.status}</span>
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase ${p.verificationStatus === 'VERIFIED' ? 'bg-slate-800/10 text-slate-700' : 'bg-amber-500/10 text-amber-400'}`}>{p.verificationStatus}</span>
                            </div>
                          </div>

                          <div className="border-t border-gray-200/80 pt-3 text-[11px] font-mono space-y-2">
                            <div className="flex justify-between text-gray-400">
                              <span>Virtual Account:</span>
                              <span className="text-gray-700">{vaId}</span>
                            </div>

                            {/* Caretaker details */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Caretaker:</span>
                              {p.caretakerName ? (
                                <span className="text-gray-700 font-semibold">{p.caretakerName}</span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setCaretakerPropId(p.id);
                                    setShowCaretakerModal(true);
                                  }}
                                  className="text-[10px] font-bold text-slate-700 underline"
                                >
                                  Assign Caretaker
                                </button>
                              )}
                            </div>

                            {/* Meter details display & Link button */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">Utility Meter:</span>
                              {p.meterNumber ? (
                                <span className="text-slate-700 font-bold bg-slate-800/10 px-2 py-0.5 rounded text-[10px]">
                                  {p.meterProvider}: {p.meterNumber}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setMeterModalPropertyId(p.id);
                                    setShowMeterModal(true);
                                  }}
                                  className="text-[10px] font-bold text-slate-700 underline"
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
                      className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Link Lease Agreement
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenancies.map(t => (
                      <div key={t.id} className="p-5 border border-gray-200 bg-white shadow-sm border border-gray-200/30 rounded-lg space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-gray-400">Ref: {t.id.substring(0, 8)}</span>
                          <h4 className="font-bold text-base">{t.property.title}</h4>
                          <p className="text-gray-500 text-xs truncate">Tenant Email: {t.tenantId}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-50 p-3 border border-gray-200 rounded">
                          <div>
                            <span className="text-gray-400 block text-[9px] uppercase">Rent Fee</span>
                            <span className="text-gray-900 font-bold">₦{t.rentAmount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px] uppercase">Frequency</span>
                            <span className="text-gray-900 font-semibold">{t.frequency}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-gray-400 block text-[9px] uppercase">Next Due Date</span>
                            <span className="text-gray-900">{t.nextDueDate}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-gray-400 block text-[9px] uppercase">Balance</span>
                            <span className={`font-bold ${t.balance === 0 ? 'text-gray-700' : (t.balance > 0 ? 'text-slate-700' : 'text-rose-400')}`}>
                              {t.balance === 0 ? 'Balanced' : (t.balance > 0 ? `+₦${t.balance.toLocaleString()}` : `-₦${Math.abs(t.balance).toLocaleString()}`)}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono flex items-center justify-between text-gray-400">
                          <span>Nomba Virtual Account:</span>
                          <span className="text-slate-700 font-semibold">{t.nombaVirtualAccountId}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Landlord Tab: Escrows */}
              {landlordTab === 'escrow' && (
                <div className="space-y-6">
                  {/* Explanation banner */}
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Lock className="w-4 h-4" />
                      What is a Purchase Escrow?
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      When a tenant buys a <strong className="text-gray-900">SALE</strong> property via AcreWise, their payment is not sent directly to you. Instead it is held securely in a Nomba virtual account (escrow). The funds sit in <strong className="text-gray-900">HELD</strong> state until you confirm the handover of keys / documents. You then click <strong className="text-slate-700">Release Funds</strong> — money is disbursed to your account and the property is marked <strong className="text-gray-900">SOLD</strong>. If there is a dispute, you can <strong className="text-red-400">Reject</strong> to cancel and relist the property.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Purchase Escrows</h3>
                      <p className="text-gray-500 text-sm mt-1">Buyer secure deposits pending your confirmation.</p>
                    </div>
                    <div className="px-4 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded-lg font-mono text-xs">
                      <span className="text-gray-400">Total Held: </span>
                      <span className="text-gray-900 font-bold">₦{escrowTxns.filter(e => e.status === 'HELD').reduce((s, e) => s + e.amountHeld, 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {escrowTxns.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 rounded-xl space-y-3 text-center">
                      <Lock className="w-10 h-10 text-zinc-700" />
                      <p className="text-gray-400 text-sm">No escrow transactions yet.</p>
                      <p className="text-zinc-600 text-xs max-w-xs">When a buyer pays for a SALE property on the marketplace, the escrow record will appear here for you to release or reject.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {escrowTxns.map((e) => {
                      const isActioning = escrowActionLoading === e.id;
                      const statusColors = {
                        HELD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        PENDING_PAYMENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        RELEASED: 'bg-slate-800/10 text-slate-700 border-slate-300',
                        REFUNDED: 'bg-red-500/10 text-red-400 border-red-500/20',
                      };
                      return (
                        <div key={e.id} className="border border-gray-200 bg-white rounded-xl overflow-hidden">
                          {/* Property image if available */}
                          {e.property?.imageUrl && (
                            <img src={e.property.imageUrl} alt={e.property.title} className="w-full h-32 object-cover" />
                          )}
                          <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusColors[e.status] || 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                                {e.status}
                              </span>
                              <span className="text-zinc-600 font-mono text-[10px]">#{e.id.substring(0, 8)}</span>
                            </div>

                            <div>
                              <h4 className="font-bold text-base text-gray-900">{e.property.title}</h4>
                              <p className="text-gray-400 text-xs mt-0.5">{e.property.area} · {e.property.buildingType}</p>
                            </div>

                            <div className="space-y-1.5 font-mono text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Buyer</span>
                                <span className="text-gray-700">{e.buyerId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Nomba Order</span>
                                <span className="text-gray-500 truncate max-w-[180px]">{e.nombaOrderReference || e.nombaVirtualAccountId}</span>
                              </div>
                              <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                                <span className="text-gray-400">Amount Held</span>
                                <span className="font-bold text-gray-900 text-base">₦{e.amountHeld.toLocaleString()}</span>
                              </div>
                            </div>

                            {(e.status === 'HELD' || e.status === 'PENDING_PAYMENT') && (
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                  disabled={isActioning || e.status !== 'HELD'}
                                  onClick={() => setEscrowConfirm({ txn: e, action: 'release' })}
                                  className="py-2 bg-slate-800 disabled:opacity-50 text-gray-900 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                                >
                                  {isActioning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                  {e.status === 'HELD' ? 'Release Funds' : 'Awaiting Payment'}
                                </button>
                                <button
                                  disabled={isActioning}
                                  onClick={() => setEscrowConfirm({ txn: e, action: 'reject' })}
                                  className="py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 disabled:opacity-50 text-red-400 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                  Reject
                                </button>
                              </div>
                            )}
                            {e.status === 'RELEASED' && (
                              <div className="flex items-center gap-1.5 text-slate-700 text-xs font-mono">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Funds disbursed — property sold
                              </div>
                            )}
                            {e.status === 'REFUNDED' && (
                              <div className="flex items-center gap-1.5 text-red-400 text-xs font-mono">
                                <ShieldAlert className="w-3.5 h-3.5" /> Rejected — property relisted
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Escrow Confirm Modal */}
                  {escrowConfirm && (
                    <div className="fixed inset-0 z-50 bg-white backdrop-blur flex items-center justify-center p-4">
                      <div className="bg-slate-50 border border-gray-200 rounded-xl p-6 w-full max-w-sm space-y-4">
                        <div className={`flex items-center gap-2 font-bold text-base ${escrowConfirm.action === 'release' ? 'text-slate-700' : 'text-red-400'}`}>
                          {escrowConfirm.action === 'release' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                          {escrowConfirm.action === 'release' ? 'Release Escrow Funds' : 'Reject Escrow'}
                        </div>
                        <p className="text-gray-500 text-sm">
                          {escrowConfirm.action === 'release'
                            ? `Release ₦${escrowConfirm.txn.amountHeld.toLocaleString()} to your account and mark "${escrowConfirm.txn.property.title}" as SOLD?`
                            : `Cancel this escrow and relist "${escrowConfirm.txn.property.title}" on the marketplace?`
                          }
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEscrowAction(escrowConfirm.txn, escrowConfirm.action)}
                            disabled={escrowActionLoading !== null}
                            className={`flex-1 py-2 font-bold text-xs rounded-lg transition ${escrowConfirm.action === 'release' ? 'bg-slate-900 text-white' : 'bg-red-500 hover:bg-red-600 text-gray-900'}`}
                          >
                            {escrowActionLoading ? 'Processing...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setEscrowConfirm(null)}
                            className="flex-1 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 text-gray-700 font-bold text-xs rounded-lg transition hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Landlord Tab: POS Terminals */}
              {landlordTab === 'terminals' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">POS Terminals Assignment</h3>
                      <p className="text-gray-500 text-sm mt-1">Monitor in-person payment devices assigned to your landlord account folders.</p>
                    </div>
                    <button
                      onClick={fetchNombaTerminals}
                      disabled={fetchingTerminals}
                      className="px-4 py-2 bg-slate-800 disabled:bg-gray-100 text-gray-900 font-bold text-xs rounded transition flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${fetchingTerminals ? 'animate-spin' : ''}`} />
                      Sync Nomba Terminals
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {posTerminals.map(term => (
                      <div key={term.id} className="p-5 border border-gray-200 bg-white shadow-sm border border-gray-200/30 rounded-lg space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800/10 text-slate-700 font-bold border border-slate-300">{term.status}</span>
                          <span className="text-gray-400">Device POS</span>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px]">TERMINAL ID</p>
                          <p className="text-gray-900 text-base font-bold">{term.terminalId}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-[10px]">SERIAL NUMBER</p>
                          <p className="text-gray-700 font-semibold">{term.serialNumber}</p>
                        </div>
                        <div className="border-t border-gray-200 pt-2 flex justify-between text-gray-400 text-[10px]">
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
                    <p className="text-gray-500 text-sm mt-1">Direct communication threads securely locked between you and your active tenants.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-gray-200 rounded-xl overflow-hidden min-h-[500px]">
                    <div className="lg:col-span-4 border-r border-gray-200 bg-white shadow-sm border border-gray-200/10 p-4 space-y-2">
                      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-2">Active Channels</p>
                      {activeChatroomProperties.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setActiveChatPropertyId(p.id)}
                          className={`p-3 rounded-lg cursor-pointer transition font-mono text-xs ${activeChatPropertyId === p.id ? 'bg-slate-800/10 border border-slate-300 text-slate-700' : 'bg-slate-50 border border-gray-200 hover:border-gray-200 text-gray-500'}`}
                        >
                          <p className="font-bold truncate">{p.title}</p>
                          <p className="text-[9px] text-gray-400 truncate">Area: {p.area}</p>
                        </div>
                      ))}
                      {activeChatroomProperties.length === 0 && (
                        <p className="text-zinc-600 text-center py-10 font-mono text-xs">No active leased properties found.</p>
                      )}
                    </div>

                    <div className="lg:col-span-8 flex flex-col justify-between h-[500px] bg-slate-50/20">
                      {/* Messages body */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatLoading ? (
                          <p className="text-gray-400 text-xs font-mono text-center py-20">Loading conversations...</p>
                        ) : chatMessages.map(msg => (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[70%] font-mono text-xs p-3 rounded-lg ${msg.senderEmail === userProfile.email ? 'ml-auto bg-slate-800/10 text-slate-500 border border-slate-300' : 'mr-auto bg-white shadow-sm border border-gray-200 text-gray-700 border border-gray-200'}`}
                          >
                            <span className="text-[9px] text-gray-400 block mb-1">{msg.senderEmail === userProfile.email ? "You" : msg.senderEmail}</span>
                            <p className="text-gray-900">{msg.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Chat text input footer */}
                      <form onSubmit={handleSendChatMessage} className="p-4 border-t border-gray-200 bg-slate-50 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 bg-white shadow-sm border border-gray-200 border border-zinc-855 rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-300 text-gray-900"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 text-white rounded font-bold text-xs"
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
                    <p className="text-gray-500 text-sm mt-1">Verify landlord accounts, perform payouts, swap currencies via exchange rates, and vend property utility meters.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Section A: Bank Payout */}
                    <div className="p-6 border border-gray-200 bg-white shadow-sm border border-gray-200/10 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                        <ArrowLeftRight className="w-5 h-5 text-slate-700" />
                        <h3 className="font-bold text-sm text-gray-900">Bank Payout (Subaccount)</h3>
                      </div>

                      <form onSubmit={handleConfirmPayout} className="space-y-3 font-mono text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">SELECT RECIPIENT BANK</label>
                          <select
                            className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs focus:outline-none font-sans"
                            value={payoutBankCode}
                            onChange={(e) => setPayoutBankCode(e.target.value)}
                          >
                            <option value="058">Guaranty Trust Bank (058)</option>
                            <option value="011">First Bank of Nigeria (011)</option>
                            <option value="053">Nombank MFB (053)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">ACCOUNT NUMBER</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="10-digit number"
                              maxLength={10}
                              className="flex-1 bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs"
                              value={payoutAcctNumber}
                              onChange={(e) => setPayoutAcctNumber(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={handleBankLookup}
                              disabled={payoutVerifying}
                              className="px-3 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded hover:bg-gray-100 transition text-[10px] font-bold"
                            >
                              {payoutVerifying ? "Verifying..." : "Lookup"}
                            </button>
                          </div>
                        </div>

                        {payoutVerifiedName && (
                          <div className="p-2 bg-slate-800/10 border border-slate-300 text-slate-700 text-[10px] rounded">
                            Verified Name: {payoutVerifiedName}
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">AMOUNT (NGN)</label>
                          <input
                            type="number"
                            placeholder="Amount in NGN"
                            className="w-full bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-400">SECURITY PIN (4 DIGITS)</label>
                          <input
                            type="password"
                            placeholder="••••"
                            maxLength={4}
                            className="w-full bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs"
                            value={payoutPin}
                            onChange={(e) => setPayoutPin(e.target.value)}
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-slate-900 text-white font-bold rounded transition"
                        >
                          Execute Bank Payout
                        </button>
                      </form>
                    </div>

                    {/* Section B: Forex exchange */}
                    <div className="p-6 border border-gray-200 bg-white shadow-sm border border-gray-200/10 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                        <Coins className="w-5 h-5 text-slate-700" />
                        <h3 className="font-bold text-sm text-gray-900">Global Forex Exchange</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 p-3 border border-gray-200 rounded">
                        <div>
                          <span className="text-gray-400 block">NGN / USD Rate</span>
                          <span className="text-slate-700 font-bold">₦1,495.50</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">NGN / GBP Rate</span>
                          <span className="text-slate-700 font-bold">₦1,890.20</span>
                        </div>
                      </div>

                      {fxStep === 1 ? (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">FROM CURRENCY</label>
                            <input
                              type="text"
                              value="NGN"
                              disabled
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs text-gray-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">TARGET CURRENCY</label>
                            <select
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs focus:outline-none font-sans"
                              value={fxTargetCurrency}
                              onChange={(e) => setFxTargetCurrency(e.target.value)}
                            >
                              <option value="USD">USD - US Dollar</option>
                              <option value="GBP">GBP - British Pound</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">CONVERT AMOUNT (NGN)</label>
                            <input
                              type="number"
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs"
                              value={fxAmount}
                              onChange={(e) => setFxAmount(e.target.value)}
                            />
                          </div>

                          <button
                            onClick={handleFxConvert}
                            className="w-full py-2 bg-slate-900 text-white font-bold rounded transition"
                          >
                            Calculate Conversion
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="p-3 bg-slate-50 rounded border border-gray-200 text-[11px] space-y-1">
                            <p className="text-gray-500">Exchange Reference: <span className="text-gray-900 font-bold">{fxExchangeId}</span></p>
                            <p className="text-gray-500">Exchange Rate: <span className="text-slate-700 font-bold">{fxRate}</span></p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">ENTER FX AUTHORIZATION OTP</label>
                            <input
                              type="password"
                              placeholder="6-digit verification code"
                              maxLength={6}
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs"
                              value={fxOtp}
                              onChange={(e) => setFxOtp(e.target.value)}
                            />
                          </div>
                          <button
                            onClick={handleConfirmFx}
                            className="w-full py-2 bg-slate-900 text-white font-bold rounded transition"
                          >
                            Confirm Exchange Conversion
                          </button>
                        </div>
                      )}

                      {fxResult && (
                        <div className="p-2.5 bg-slate-800/10 border border-slate-300 text-slate-700 text-[10px] rounded font-mono">
                          {fxResult}
                        </div>
                      )}
                    </div>

                    {/* Section C: Utility Vending */}
                    <div className="p-6 border border-gray-200 bg-white shadow-sm border border-gray-200/10 rounded-lg space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
                        <Zap className="w-5 h-5 text-slate-700" />
                        <h3 className="font-bold text-sm text-gray-900">Utility & Bill Payments</h3>
                      </div>

                      {/* Four-way bill switcher */}
                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 border border-gray-200 rounded">
                        <button
                          onClick={() => setUtilityType('electricity')}
                          className={`py-1.5 text-center text-[9px] font-bold rounded uppercase ${utilityType === 'electricity' ? 'bg-gray-100 text-slate-700' : 'text-gray-400'}`}
                        >
                          Power
                        </button>
                        <button
                          onClick={() => setUtilityType('airtime')}
                          className={`py-1.5 text-center text-[9px] font-bold rounded uppercase ${utilityType === 'airtime' ? 'bg-gray-100 text-slate-700' : 'text-gray-400'}`}
                        >
                          Airtime
                        </button>
                        <button
                          onClick={() => setUtilityType('cable')}
                          className={`py-1.5 text-center text-[9px] font-bold rounded uppercase ${utilityType === 'cable' ? 'bg-gray-100 text-slate-700' : 'text-gray-400'}`}
                        >
                          Cable
                        </button>
                        <button
                          onClick={() => setUtilityType('betting')}
                          className={`py-1.5 text-center text-[9px] font-bold rounded uppercase ${utilityType === 'betting' ? 'bg-gray-100 text-slate-700' : 'text-gray-400'}`}
                        >
                          Betting
                        </button>
                      </div>

                      {utilityType === 'electricity' && (
                        <form onSubmit={handleVendElectricity} className="space-y-3 font-mono text-xs">
                          {/* Autofill selector */}
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">AUTO-FILL FROM PROPERTY METER</label>
                            <select
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs text-gray-900"
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
                            <label className="text-[9px] text-gray-400">ELECTRICITY DISCO</label>
                            <select
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs focus:outline-none"
                              value={discoCode}
                              onChange={(e) => setDiscoCode(e.target.value)}
                            >
                              <option value="IKEDC">Ikeja Electricity (IKEDC)</option>
                              <option value="EKEDC">Eko Electricity (EKEDC)</option>
                              <option value="KEDCO">Kano Electricity (KEDCO)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">METER NUMBER</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Meter serial number"
                                className="flex-1 bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs text-gray-900"
                                value={meterNumber}
                                onChange={(e) => setMeterNumber(e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={handleCheckMeter}
                                className="px-3 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded hover:bg-gray-100 text-[10px]"
                              >
                                Check
                              </button>
                            </div>
                          </div>

                          {meterOwner && (
                            <div className="text-[9px] text-slate-700">
                              {meterOwner}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">AMOUNT (NGN)</label>
                            <input
                              type="number"
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs"
                              value={utilityAmount}
                              onChange={(e) => setUtilityAmount(e.target.value)}
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-slate-900 text-white font-bold rounded transition text-xs"
                          >
                            Vend Token
                          </button>

                          {utilityToken && (
                            <div className="p-3 bg-slate-50 border border-gray-200 rounded font-bold text-center tracking-wider text-slate-700 text-xs mt-2 select-all font-mono">
                              METER TOKEN: {utilityToken}
                            </div>
                          )}
                        </form>
                      )}

                      {utilityType === 'airtime' && (
                        <form onSubmit={handleVendAirtime} className="space-y-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">NETWORK OPERATOR</label>
                            <select
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs focus:outline-none"
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
                            <label className="text-[9px] text-gray-400">PHONE NUMBER</label>
                            <input
                              type="text"
                              placeholder="e.g. +2348030000000"
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs"
                              value={airtimePhone}
                              onChange={(e) => setAirtimePhone(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">VENDING PLAN</label>
                            <select
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs focus:outline-none"
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
                            className="w-full py-2 bg-slate-900 text-white font-bold rounded transition text-xs"
                          >
                            Vend Airtime / Data
                          </button>
                        </form>
                      )}

                      {utilityType === 'cable' && (
                        <form onSubmit={handleVendCableTv} className="space-y-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">CABLE PROVIDER</label>
                            <select
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs focus:outline-none font-sans"
                              value={tvProvider}
                              onChange={(e) => setTvProvider(e.target.value)}
                            >
                              <option value="DSTV">DSTV Nigeria</option>
                              <option value="GOTV">GOTV Nigeria</option>
                              <option value="STARTIMES">StarTimes</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">SMARTCARD NUMBER</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Smartcard number"
                                className="flex-1 bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs text-gray-900"
                                value={tvSmartcard}
                                onChange={(e) => setTvSmartcard(e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                onClick={handleVerifyCableTv}
                                disabled={tvVerifying}
                                className="px-3 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded hover:bg-gray-100 text-[10px]"
                              >
                                {tvVerifying ? "..." : "Verify"}
                              </button>
                            </div>
                          </div>

                          {tvVerifiedName && (
                            <div className="p-2 bg-slate-800/10 border border-slate-300 text-slate-700 text-[10px] rounded">
                              Cardholder Name: {tvVerifiedName}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">SELECT TV PACKAGE</label>
                            <select
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs focus:outline-none font-sans"
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
                            className="w-full py-2 bg-slate-900 text-white font-bold rounded text-xs"
                          >
                            Vend Subscription
                          </button>

                          {tvResult && (
                            <div className="p-2 bg-slate-800/10 border border-slate-300 text-slate-700 text-[10px] rounded text-center">
                              {tvResult}
                            </div>
                          )}
                        </form>
                      )}

                      {utilityType === 'betting' && (
                        <form onSubmit={handleVendBetting} className="space-y-3 font-mono text-xs">
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">BETTING PROVIDER</label>
                            <select
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded text-xs focus:outline-none font-sans"
                              value={betProvider}
                              onChange={(e) => setBetProvider(e.target.value)}
                            >
                              <option value="SportyBet">SportyBet</option>
                              <option value="Bet9ja">Bet9ja</option>
                              <option value="BetWay">BetWay</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">BETTING ACCOUNT ID</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Player Customer ID"
                                className="flex-1 bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs text-gray-900"
                                value={betCustomerId}
                                onChange={(e) => setBetCustomerId(e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                onClick={handleVerifyBetId}
                                disabled={betVerifying}
                                className="px-3 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded hover:bg-gray-100 text-[10px]"
                              >
                                {betVerifying ? "..." : "Verify"}
                              </button>
                            </div>
                          </div>

                          {betVerifiedName && (
                            <div className="p-2 bg-slate-800/10 border border-slate-300 text-slate-700 text-[10px] rounded">
                              Player Name: {betVerifiedName}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-400">TOPUP AMOUNT (NGN)</label>
                            <input
                              type="number"
                              className="w-full bg-slate-50 border border-gray-200 p-2 rounded focus:outline-none text-xs"
                              value={betAmount}
                              onChange={(e) => setBetAmount(e.target.value)}
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2 bg-slate-900 text-white font-bold rounded text-xs"
                          >
                            Vend Betting Topup
                          </button>

                          {betResult && (
                            <div className="p-2 bg-slate-800/10 border border-slate-300 text-slate-700 text-[10px] rounded text-center">
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
                    <p className="text-gray-500 text-sm mt-1">Inbound transfers that cannot be mapped to any active agreement. Pending administrative mapping.</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg bg-white shadow-sm border border-gray-200/10 overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-50 text-gray-400 uppercase border-b border-gray-200 font-mono">
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
                          <tr key={p.id} className="border-b border-gray-200 hover:bg-white">
                            <td className="p-4 font-medium text-gray-900">{p.nombaReference}</td>
                            <td className="p-4 text-gray-900 font-bold">₦{p.amount.toLocaleString()}</td>
                            <td className="p-4 text-rose-400 uppercase font-semibold">{p.matchedStatus}</td>
                            <td className="p-4 text-gray-500">{new Date(p.receivedAt).toLocaleString()}</td>
                            <td className="p-4">
                              <button
                                onClick={() => alert("Mapping dialog triggered.")}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded text-[11px] font-semibold"
                              >
                                Link Account
                              </button>
                            </td>
                          </tr>
                        ))}

                        {unmatchedPayments.length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-gray-400">
                              Unmatched list is clean. All payments reconciled successfully.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Landlord Tab: Nomba Production API */}
              {landlordTab === 'developer' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-slate-700" />
                      Nomba Production API
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Execute authenticated Nomba API requests using the deployed production account.</p>
                  </div>

                  {/* Webhook logs viewer tabs */}
                  <div className="border-b border-zinc-855 flex gap-4 text-xs font-mono">
                    <button
                      onClick={() => setSimulatorSubTab('playground')}
                      className={`pb-3 font-semibold transition ${simulatorSubTab === 'playground' ? 'text-slate-700 border-b-2 border-slate-300' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      [⚡] API Playground Explorer (38+ APIs)
                    </button>
                    <button
                      onClick={() => setSimulatorSubTab('logs')}
                      className={`pb-3 font-semibold transition ${simulatorSubTab === 'logs' ? 'text-slate-700 border-b-2 border-slate-300' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      [-] Event Logs ({webhookLogs.length})
                    </button>
                  </div>

                  {/* API Playground Sub-tab */}
                  {simulatorSubTab === 'playground' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-4 space-y-2 max-h-[550px] overflow-y-auto pr-2 border-r border-gray-200">
                        {APIS_METADATA.map((api, idx) => (
                          <div
                            key={api.name}
                            onClick={() => setSelectedApiIndex(idx)}
                            className={`p-3 border rounded-lg cursor-pointer transition text-left space-y-1.5 ${selectedApiIndex === idx ? 'bg-white shadow-sm border border-gray-200 border-slate-300/50' : 'bg-white shadow-sm border border-gray-200/10 border-gray-200 hover:border-gray-200'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${api.method === 'POST' ? 'bg-blue-500/10 text-blue-400' : api.method === 'GET' ? 'bg-slate-800/10 text-slate-700' : 'bg-rose-500/10 text-rose-400'}`}>
                                {api.method}
                              </span>
                              <span className="text-[9px] font-mono text-gray-400">{api.tag}</span>
                            </div>
                            <h4 className="font-bold text-xs text-gray-900 truncate">{api.name}</h4>
                            <p className="text-[9px] text-gray-400 truncate">{api.url}</p>
                          </div>
                        ))}
                      </div>

                      <div className="lg:col-span-8 space-y-5">
                        {APIS_METADATA[selectedApiIndex] && (
                          <div className="space-y-4">
                            <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-2">
                              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${APIS_METADATA[selectedApiIndex].method === 'POST' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800/10 text-slate-700'}`}>
                                  {APIS_METADATA[selectedApiIndex].method}
                                </span>
                                {APIS_METADATA[selectedApiIndex].name}
                              </h3>
                              <p className="text-gray-500 text-xs">{APIS_METADATA[selectedApiIndex].description}</p>
                              <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-gray-400">
                                Endpoint: <span className="text-gray-700 font-semibold">{APIS_METADATA[selectedApiIndex].url}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Request Payload JSON (Editable)</span>
                              <textarea
                                className="w-full h-32 p-3 bg-slate-50 border border-gray-200 rounded font-mono text-[10px] text-gray-700 focus:outline-none focus:border-gray-200 transition"
                                value={requestBodyInput}
                                onChange={(e) => setRequestBodyInput(e.target.value)}
                              />
                            </div>

                            <button
                              onClick={handleExecutePlaygroundApi}
                              disabled={apiLoading}
                              className="px-5 py-2.5 bg-slate-800 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 font-bold text-xs rounded transition uppercase tracking-wider flex items-center gap-1.5"
                            >
                              <Send className="w-4 h-4" />
                              {apiLoading ? "Sending Request..." : "Run Production API"}
                            </button>

                            {apiResponseOutput && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Response JSON Payload</span>
                                <pre className="p-4 bg-slate-50 border border-gray-200 text-gray-700 text-[10px] rounded font-mono overflow-x-auto max-h-60">
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
                            className={`p-4 border rounded-lg cursor-pointer transition text-left space-y-2 ${selectedLogId === log.id ? 'bg-white shadow-sm border border-gray-200 border-slate-300/50' : 'bg-white border-gray-200 hover:border-gray-200'}`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                              <span className={`px-1.5 py-0.2 rounded font-bold ${log.status === 200 ? 'bg-slate-800/10 text-slate-700' : 'bg-rose-500/10 text-rose-400'}`}>
                                {log.status}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-xs">{log.eventType}</p>
                              <p className="text-gray-400 font-mono text-[9px] truncate">Ref: {log.reference}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="lg:col-span-7 p-6 border border-gray-200 bg-white shadow-sm border border-gray-200/5 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto min-h-[400px]">
                        {(() => {
                          const logDetails = webhookLogs.find(l => l.id === selectedLogId);
                          if (!logDetails) {
                            return <div className="py-32 text-center text-zinc-600 font-sans text-xs">Select a transaction webhook log to inspect details.</div>;
                          }
                          return (
                            <div className="space-y-4 text-left">
                              <h4 className="font-bold text-gray-500 border-b border-gray-200 pb-2">WEBHOOK INGRESS PAYLOAD</h4>
                              {logDetails.payload && (
                                <pre className="bg-slate-50 border border-gray-200 p-2.5 rounded text-[10px] text-gray-700 overflow-x-auto">
                                  {logDetails.payload}
                                </pre>
                              )}
                              <div>
                                <span className="text-gray-400 block text-[9px]">Reconciliation Status</span>
                                <span className="text-slate-700 font-bold">{logDetails.reconciliation}</span>
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
          {/* ROLE: Tenant Views */}
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
                        <p className="text-gray-500 text-sm mt-1">Manage payments, check outstanding dues, and view payment history for your apartment.</p>
                      </div>

                      <div className="p-5 bg-white shadow-sm border border-gray-200/40 border border-gray-200 rounded-xl space-y-3 font-sans text-xs">
                        <h3 className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-slate-700" />
                          Tenant Workspace Guide
                        </h3>
                        <p className="text-gray-500 leading-relaxed">
                          Your tenant account is active. Here is how you can manage your lease assets:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-[11px] text-zinc-450">
                          <div className="space-y-1 p-3 bg-slate-50/80 rounded border border-gray-200">
                            <span className="text-slate-700 font-bold text-xs block mb-0.5">Rent Checkout</span>
                          <p>Click **Pay Rent via Nomba** on the ledger card to pay dues through the hosted Nomba checkout.</p>
                          </div>
                          <div className="space-y-1 p-3 bg-slate-50/80 rounded border border-gray-200">
                            <span className="text-slate-700 font-bold text-xs block mb-0.5">Explore Houses</span>
                            <p>Go to **Houses Market** to find more property listings. Settle purchase escrows or rent contracts in minutes.</p>
                          </div>
                          <div className="space-y-1 p-3 bg-slate-50/80 rounded border border-gray-200">
                            <span className="text-slate-700 font-bold text-xs block mb-0.5">Receipts Vault</span>
                            <p>Visit **Receipts Locker** to view and download printable compliance receipts for all your utilities and rent payments.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 border border-gray-200 bg-white shadow-sm border border-gray-200/30 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4 font-mono text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-sans">Rented Property</span>
                            <h3 className="text-2xl font-bold text-gray-900 font-sans">{activeTenantTenancyObj.property.title}</h3>
                            <p className="text-gray-500 text-sm font-medium font-sans">Landlord: {activeTenantTenancyObj.property.landlord.name}</p>
                          </div>

                          <div className="text-xs space-y-1.5 text-gray-400">
                            <p>Virtual Account Number: <span className="text-slate-700 font-semibold">{activeTenantTenancyObj.nombaVirtualAccountId}</span></p>
                            <p>Next Rent Due Date: <span className="text-gray-900">{activeTenantTenancyObj.nextDueDate}</span></p>

                            {/* Caretaker details */}
                            {activeTenantTenancyObj.property.caretakerName && (
                              <p className="p-2 bg-white shadow-sm border border-gray-200/50 border border-gray-200 rounded text-[11px] text-gray-700">
                                Property Caretaker: <span className="font-bold text-gray-900">{activeTenantTenancyObj.property.caretakerName}</span> ({activeTenantTenancyObj.property.caretakerPhone})
                              </p>
                            )}

                            {/* Meter details display & Link button */}
                            <div className="flex items-center gap-2 pt-2">
                              <span>Property Utility Meter:</span>
                              {activeTenantTenancyObj.property.meterNumber ? (
                                <span className="text-slate-700 font-bold bg-slate-800/10 px-2 py-0.5 rounded text-[10px]">
                                  {activeTenantTenancyObj.property.meterProvider}: {activeTenantTenancyObj.property.meterNumber}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setMeterModalPropertyId(activeTenantTenancyObj.property.id);
                                    setShowMeterModal(true);
                                  }}
                                  className="text-[10px] font-bold text-slate-700 underline"
                                >
                                  Link Meter
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50 border border-gray-200 rounded-lg flex flex-col items-center text-center space-y-3 shadow-inner">
                          <span className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">Active Ledger Balance</span>
                          <span className={`text-3xl font-extrabold ${activeTenantTenancyObj.balance === 0 ? 'text-gray-700' : (activeTenantTenancyObj.balance > 0 ? 'text-slate-700' : 'text-rose-400')}`}>
                            {activeTenantTenancyObj.balance === 0 ? '₦0.00' : (activeTenantTenancyObj.balance > 0 ? `+₦${activeTenantTenancyObj.balance.toLocaleString()}` : `-₦${Math.abs(activeTenantTenancyObj.balance).toLocaleString()}`)}
                          </span>
                          <p className="text-gray-400 text-[10px] max-w-xs font-mono uppercase tracking-wider">
                            {activeTenantTenancyObj.balance === 0 ? 'No outstanding balance due' : (activeTenantTenancyObj.balance > 0 ? 'Overpayment Applied as rent credit' : 'Arrears due for payment')}
                          </p>
                          <button
                            onClick={() => {
                              setCheckoutTenancy(activeTenantTenancyObj);
                              setCheckoutOption('exact');
                              setPaymentStatus(null);
                              setShowCheckout(true);
                            }}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded transition shadow"
                          >
                            Pay Rent via Nomba
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="py-12 text-center border border-dashed border-gray-200 bg-white shadow-sm border border-gray-200/10 rounded-lg text-gray-400 space-y-4">
                        <Building2 className="w-12 h-12 mx-auto text-zinc-800" />
                        <h4 className="text-sm font-bold text-gray-900">No active lease linked to this email</h4>
                        <p className="text-xs max-w-md mx-auto">You can claim an already renting property by virtual account reference code below, or explore new listings in the market.</p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setTenantTab('marketplace')}
                            className="px-6 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded transition"
                          >
                            Browse Houses Marketplace
                          </button>
                        </div>

                        <form onSubmit={handleClaimTenancy} className="flex gap-2 max-w-sm mx-auto font-mono text-xs">
                          <input
                            type="text"
                            placeholder="Virtual Account reference"
                            className="flex-1 bg-slate-50 border border-gray-200 px-3 py-2 rounded focus:outline-none"
                            value={claimVaNumber}
                            onChange={(e) => setClaimVaNumber(e.target.value)}
                            required
                          />
                          <button type="submit" className="px-4 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold uppercase tracking-wider">Link</button>
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
                      <p className="text-gray-500 text-sm mt-1">Explore, rent, or purchase premium property listings listed directly by verified landlords.</p>
                    </div>

                    {/* Global FX Converter Widget */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded-lg font-mono text-xs shrink-0">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-slate-700" />
                      <span className="text-gray-500">1 {mktFxCurrency} = ₦</span>
                      {mktFxLoading ? (
                        <span className="text-gray-400 animate-pulse">...</span>
                      ) : (
                        <span className="text-gray-900 font-bold">{mktFxRate ? mktFxRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}</span>
                      )}
                      <select
                        className="bg-transparent text-slate-700 font-bold focus:outline-none cursor-pointer"
                        value={mktFxCurrency}
                        onChange={(e) => setMktFxCurrency(e.target.value)}
                      >
                        {FX_CURRENCIES.map(c => <option key={c} value={c} className="bg-white shadow-sm border border-gray-200 text-gray-900">{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {properties
                      .filter(p => p.status === 'LISTED' || (p.status === 'LET' && p.availableUnits > 0))
                      .map(p => {
                        const convertedPrice = mktFxRate && p.price ? (p.price / mktFxRate).toFixed(2) : null;
                        const projections = (() => { try { return JSON.parse(p.annualProjections || '[]'); } catch { return []; } })();
                        return (
                          <div key={p.id} className="border border-gray-200 bg-white hover:border-gray-300 rounded-xl flex flex-col overflow-hidden transition group">

                            {/* Property Image */}
                            {p.imageUrl ? (
                              <div className="relative h-44 overflow-hidden">
                                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" onError={(e) => e.target.parentElement.style.display = 'none'} />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                                <div className="absolute top-2 left-2 flex gap-1.5">
                                  <span className="px-2 py-0.5 bg-slate-800/90 text-gray-900 rounded text-[9px] uppercase tracking-wider font-bold backdrop-blur">{p.type}</span>
                                  {p.isAssured && (
                                    <span className="px-2 py-0.5 bg-amber-500/90 text-gray-900 rounded text-[9px] uppercase tracking-wider font-bold flex items-center gap-1 backdrop-blur">
                                      <ShieldCheck className="w-2.5 h-2.5" /> Assured
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="h-32 bg-white shadow-sm border border-gray-200 flex items-center justify-center relative">
                                <Building2 className="w-10 h-10 text-zinc-700" />
                                <div className="absolute top-2 left-2 flex gap-1.5">
                                  <span className="px-2 py-0.5 bg-slate-800/10 border border-slate-300 text-slate-700 rounded text-[9px] uppercase tracking-wider font-bold">{p.type}</span>
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
                                <h4 className="font-bold text-sm text-gray-900 font-sans truncate">{p.title}</h4>
                                <p className="text-gray-500 text-[11px] font-sans mt-0.5">{p.area || 'Lagos'} · {p.buildingType || 'Apartment'}</p>
                              </div>

                              {/* Price + FX */}
                              <div>
                                <p className="text-gray-900 text-xl font-extrabold font-sans">₦{p.price?.toLocaleString() || '—'}</p>
                                {convertedPrice && (
                                  <p className="text-slate-700 text-[11px] font-sans">≈ {mktFxCurrency} {parseFloat(convertedPrice).toLocaleString()}</p>
                                )}
                                {p.paymentFrequency && (
                                  <span className="text-gray-400 text-[10px]">per {p.paymentFrequency?.toLowerCase()}</span>
                                )}
                              </div>

                              {/* First Payment */}
                              {p.firstPaymentAmount && (
                                <div className="px-2 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded text-[10px] font-sans">
                                  <span className="text-gray-500">First payment: </span>
                                  <span className="text-blue-400 font-bold">₦{parseFloat(p.firstPaymentAmount).toLocaleString()}</span>
                                </div>
                              )}

                              {/* Annual Projections */}
                              {projections.length > 0 && projections.some(v => v > 0) && (
                                <div className="space-y-1">
                                  <p className="text-[9px] text-gray-400 uppercase tracking-wider flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> 5-Year Rent Projection</p>
                                  <div className="grid grid-cols-5 gap-1">
                                    {projections.map((v, i) => (
                                      <div key={i} className="text-center">
                                        <div className="text-[8px] text-zinc-600">Yr{i + 1}</div>
                                        <div className="text-[9px] text-gray-700 font-bold">₦{(v / 1000).toFixed(0)}k</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Units left */}
                              <div className="text-[11px] text-gray-500 font-sans flex items-center justify-between">
                                <span>Rooms / Flats:</span>
                                <span className="text-slate-700 font-bold">{p.availableUnits ?? 1} of {p.totalUnits ?? 1} available</span>
                              </div>

                              <button
                                onClick={() => {
                                  const checkoutTenancy = {
                                    id: "temp_market_lease_" + p.id,
                                    rentAmount: p.firstPaymentAmount ? parseFloat(p.firstPaymentAmount) : p.price,
                                    nombaVirtualAccountId: '',
                                    property: p,
                                    isMarketplacePurchase: true
                                  };
                                  setCheckoutTenancy(checkoutTenancy);
                                  setCheckoutOption('exact');
                                  setPaymentStatus(null);
                                  setShowCheckout(true);
                                }}
                                className="mt-auto w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg font-sans transition uppercase tracking-wider text-center text-xs"
                              >
                                {p.type === 'RENT' ? 'Rent via Nomba' : 'Buy via Nomba Escrow'}
                              </button>

                              {/* Environmental Analysis Button */}
                              <button
                                onClick={() => handleEnvAnalysis(p)}
                                className="w-full py-2 bg-white shadow-sm border border-gray-200 hover:bg-gray-100 border border-gray-300 hover:border-slate-400/40 text-gray-700 font-semibold rounded-lg font-sans transition text-xs flex items-center justify-center gap-1.5"
                              >
                                <Activity className="w-3.5 h-3.5" />
                                Check Environmental Analysis
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {properties.filter(p => p.status === 'LISTED' || (p.status === 'LET' && p.availableUnits > 0)).length === 0 && (
                      <p className="text-gray-400 text-center py-20 lg:col-span-3">No houses listed in the market catalog at this time.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ENVIRONMENTAL ANALYSIS MODAL */}
              {envAnalysis.open && (
                <div className="fixed inset-0 z-50 bg-white/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                  <div className="bg-slate-50 border border-gray-200 rounded-2xl w-full max-w-lg my-8 overflow-hidden">

                    {/* Modal Header */}
                    <div className="p-5 border-b border-gray-200 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm mb-0.5">
                          <Activity className="w-4 h-4" />
                          Environmental Analysis
                        </div>
                        <p className="text-gray-900 font-semibold text-base">{envAnalysis.property?.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{envAnalysis.property?.area} · {envAnalysis.property?.buildingType}</p>
                      </div>
                      <button
                        onClick={() => setEnvAnalysis(prev => ({ ...prev, open: false }))}
                        className="text-zinc-600 hover:text-gray-900 transition text-lg leading-none mt-0.5"
                      >✕</button>
                    </div>

                    {/* Loading */}
                    {envAnalysis.loading && (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full border-2 border-gray-200" />
                          <div className="w-12 h-12 rounded-full border-2 border-t-slate-400 animate-spin absolute inset-0" />
                        </div>
                        <div className="text-center">
                          <p className="text-gray-700 text-sm font-semibold">Analyzing environment...</p>
                          <p className="text-zinc-600 text-xs mt-1">Powered by NVIDIA Nemotron AI</p>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {envAnalysis.error && !envAnalysis.loading && (
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-red-400">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-sm font-semibold">Analysis Failed</span>
                        </div>
                        <p className="text-gray-500 text-sm">{envAnalysis.error}</p>
                        <button
                          onClick={() => handleEnvAnalysis(envAnalysis.property)}
                          className="px-4 py-2 bg-white shadow-sm border border-gray-200 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition"
                        >Try Again</button>
                      </div>
                    )}

                    {/* Report */}
                    {envAnalysis.report && !envAnalysis.loading && (() => {
                      const r = envAnalysis.report;
                      const sections = [
                        { key: 'security', label: 'Security', icon: ShieldCheck, color: 'amber' },
                        { key: 'flood', label: 'Flood Risk', icon: Activity, color: 'blue' },
                        { key: 'electricity', label: 'Electricity', icon: Zap, color: 'yellow' },
                        { key: 'neighborhood', label: 'Neighborhood', icon: Compass, color: 'emerald' },
                      ];
                      const colorMap = {
                        amber: { text: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/20' },
                        blue: { text: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/20' },
                        yellow: { text: 'text-yellow-400', bg: 'bg-yellow-500/8', border: 'border-yellow-500/20' },
                        emerald: { text: 'text-slate-700', bg: 'bg-slate-800/8', border: 'border-slate-300' },
                      };
                      return (
                        <div className="p-5 space-y-3">
                          {sections.map(({ key, label, icon: Icon, color }) => {
                            const c = colorMap[color];
                            return (
                              <div key={key} className={`p-3.5 rounded-xl border ${c.bg} ${c.border}`}>
                                <div className={`flex items-center gap-1.5 ${c.text} font-bold text-xs mb-1.5 uppercase tracking-wider`}>
                                  <Icon className="w-3.5 h-3.5" />
                                  {label}
                                </div>
                                <p className="text-gray-700 text-xs leading-relaxed">{r[key]}</p>
                              </div>
                            );
                          })}

                          {/* Overall verdict */}
                          {r.overall && (
                            <div className="mt-2 px-3 py-2.5 bg-white shadow-sm border border-gray-200 border border-gray-300 rounded-xl flex items-start gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-slate-700 mt-0.5 shrink-0" />
                              <p className="text-zinc-200 text-xs font-semibold">{r.overall}</p>
                            </div>
                          )}

                          {/* Powered by */}
                          <p className="text-zinc-600 text-[10px] text-center pt-1 font-mono">Powered by NVIDIA Nemotron · AI-generated · Not a substitute for physical inspection</p>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              )}

              {/* Tenant Tab: Receipts Vault Locker */}
              {tenantTab === 'receipts' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">My Receipts Locker</h3>
                    <p className="text-gray-500 text-sm mt-1">Access all your digital billing vouchers for rent, power vend, and TV services stored in your secure vault.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userReceipts.map(rec => (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedReceipt(rec)}
                        className="p-5 border border-gray-200 bg-white hover:border-gray-200 rounded-lg cursor-pointer space-y-3 font-mono text-xs text-left transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${rec.category === 'RENT' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800/10 text-slate-700'}`}>
                            {rec.category}
                          </span>
                          <span className="text-gray-400 text-[10px]">{new Date(rec.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm truncate">{rec.title}</h4>
                        <div className="flex justify-between items-baseline pt-1">
                          <span className="text-gray-400 text-[9px]">Amount Paid</span>
                          <span className="text-gray-900 font-bold text-base">₦{rec.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-gray-400 text-[9px] truncate">Ref: {rec.reference}</p>
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
                    <p className="text-gray-500 text-sm mt-1">Direct communication threads securely locked between you and your landlord.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-gray-200 rounded-xl overflow-hidden min-h-[500px]">
                    <div className="lg:col-span-4 border-r border-gray-200 bg-white shadow-sm border border-gray-200/10 p-4 space-y-2">
                      <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-2">My Leased Channels</p>
                      {activeChatroomProperties.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setActiveChatPropertyId(p.id)}
                          className={`p-3 rounded-lg cursor-pointer transition font-mono text-xs ${activeChatPropertyId === p.id ? 'bg-slate-800/10 border border-slate-300 text-slate-700' : 'bg-slate-50 border border-gray-200 hover:border-gray-200 text-gray-500'}`}
                        >
                          <p className="font-bold truncate">{p.title}</p>
                          <p className="text-[9px] text-gray-400 truncate">Caretaker: {p.caretakerName || 'None'}</p>
                        </div>
                      ))}
                      {activeChatroomProperties.length === 0 && (
                        <p className="text-zinc-600 text-center py-10 font-mono text-xs">No active leased properties found.</p>
                      )}
                    </div>

                    <div className="lg:col-span-8 flex flex-col justify-between h-[500px] bg-slate-50/20">
                      {/* Messages body */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatLoading ? (
                          <p className="text-gray-400 text-xs font-mono text-center py-20">Loading conversations...</p>
                        ) : chatMessages.map(msg => (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[70%] font-mono text-xs p-3 rounded-lg ${msg.senderEmail === userProfile.email ? 'ml-auto bg-slate-800/10 text-slate-500 border border-slate-300' : 'mr-auto bg-white shadow-sm border border-gray-200 text-gray-700 border border-gray-200'}`}
                          >
                            <span className="text-[9px] text-gray-400 block mb-1">{msg.senderEmail === userProfile.email ? "You" : msg.senderEmail}</span>
                            <p className="text-gray-900">{msg.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Chat text input footer */}
                      <form onSubmit={handleSendChatMessage} className="p-4 border-t border-gray-200 bg-slate-50 flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 bg-white shadow-sm border border-gray-200 border border-zinc-855 rounded px-3 py-2 text-xs focus:outline-none focus:border-gray-300 text-gray-900"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 text-white rounded font-bold text-xs"
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
      {/* DIALOGS / MODALS / OVERLAYS */}
      {/* ========================================================== */}

      {/* MODAL: Nomba Online Checkout */}
      {showCheckout && checkoutTenancy && (
        <div className="fixed inset-0 z-50 bg-white backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-gray-200 rounded-xl w-full max-w-md overflow-hidden flex flex-col justify-between">
            <div className="p-6 border-b border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800/10 flex items-center justify-center text-slate-700">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Nomba Online Checkout</h3>
                <span className="text-[10px] font-mono text-gray-400">Secured by Nomba Payment Gateway</span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1">
              {paymentStatus === null ? (
                <div className="space-y-4">
                  <div className="p-3 bg-white shadow-sm border border-gray-200/30 rounded border border-gray-200 font-mono text-[11px] space-y-1">
                    <p className="text-gray-400">Property: <span className="text-gray-900 font-bold">{checkoutTenancy.property?.title || 'N/A'}</span></p>
                    <p className="text-gray-400">Amount Due: <span className="text-gray-900 font-bold">₦{checkoutTenancy.rentAmount?.toLocaleString() || '0'}</span></p>
                    <p className="text-gray-400">Reference: <span className="text-slate-700 font-semibold">{checkoutTenancy.nombaVirtualAccountId}</span></p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-400 block uppercase">Choose Payment Amount Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setCheckoutOption('exact')}
                        className={`py-1.5 rounded font-bold text-[11px] uppercase transition ${checkoutOption === 'exact' ? 'bg-gray-100 text-slate-700 border border-slate-300' : 'bg-white shadow-sm border border-gray-200 text-gray-500 border border-gray-200'}`}>Exact Rent Due</button>
                      {!checkoutTenancy.isMarketplacePurchase && <>
                      <button type="button" onClick={() => setCheckoutOption('partial')}
                        className={`py-1.5 rounded font-bold text-[11px] uppercase transition ${checkoutOption === 'partial' ? 'bg-gray-100 text-slate-700 border border-slate-300' : 'bg-white shadow-sm border border-gray-200 text-gray-500 border border-gray-200'}`}>Partial Pay</button>
                      <button type="button" onClick={() => setCheckoutOption('overpaid')}
                        className={`py-1.5 rounded font-bold text-[11px] uppercase transition ${checkoutOption === 'overpaid' ? 'bg-gray-100 text-slate-700 border border-slate-300' : 'bg-white shadow-sm border border-gray-200 text-gray-500 border border-zinc-855'}`}>Overpay Rent</button>
                      <button type="button" onClick={() => setCheckoutOption('custom')}
                        className={`py-1.5 rounded font-bold text-[11px] uppercase transition ${checkoutOption === 'custom' ? 'bg-gray-100 text-slate-700 border border-slate-300' : 'bg-white shadow-sm border border-gray-200 text-gray-500 border border-zinc-855'}`}>Custom Amount</button>
                      </>}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-gray-200 flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Pay Amount:</span>
                    <span className="text-base font-extrabold text-gray-900">
                      {checkoutOption === 'exact' && `₦${checkoutTenancy.rentAmount.toLocaleString()}`}
                      {checkoutOption === 'partial' && `₦${(checkoutTenancy.rentAmount * 0.75).toLocaleString()}`}
                      {checkoutOption === 'overpaid' && `₦${(checkoutTenancy.rentAmount * 1.25).toLocaleString()}`}
                      {checkoutOption === 'custom' && (
                        <input type="number" placeholder="Amount in NGN"
                          className="bg-transparent border-b border-gray-300 text-gray-900 font-extrabold focus:outline-none w-28 text-right pr-1"
                          value={customPayAmount} onChange={(e) => setCustomPayAmount(e.target.value)} />
                      )}
                    </span>
                  </div>
                </div>
              ) : paymentStatus === 'redirecting' ? (
                <div className="py-8 flex flex-col items-center text-center space-y-4 font-mono">
                  <div className="w-12 h-12 rounded-full bg-slate-800/10 text-slate-700 flex items-center justify-center border border-slate-300">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-base">Redirecting to Nomba</h4>
                    <p className="text-gray-400 text-xs">You are being securely redirected to Nomba's payment page.</p>
                  </div>
                  <p className="text-[10px] text-gray-400">Order Ref: {checkoutOrderRef}</p>
                </div>
              ) : paymentStatus === 'success' ? (
                <div className="py-8 flex flex-col items-center text-center space-y-4 font-mono">
                  <div className="w-12 h-12 rounded-full bg-slate-800/10 text-slate-700 flex items-center justify-center border border-slate-300">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-base">Payment Approved</h4>
                    <p className="text-gray-400 text-xs">Reconciliation Engine Completed Execution.</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-900 text-base">Transaction Failed</h4>
                    <p className="text-gray-400 text-xs">Could not create checkout order. Please try again.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-white shadow-sm border border-gray-200/10 flex gap-3">
              {paymentStatus === null ? (
                <>
                  <button disabled={isPaying} onClick={handleCheckoutPortalPay}
                    className="flex-1 py-2 bg-slate-800 disabled:bg-zinc-700 disabled:text-gray-500 text-gray-900 font-bold text-xs rounded transition uppercase tracking-wider flex items-center justify-center gap-1.5">
                    {isPaying ? 'Creating Order...' : 'Pay with Nomba'}
                  </button>
                  <button type="button" onClick={() => setShowCheckout(false)}
                    className="flex-1 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded transition uppercase tracking-wider">Cancel</button>
                </>
              ) : paymentStatus === 'success' ? (
                <button onClick={() => setShowCheckout(false)}
                  className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded transition uppercase tracking-wider">Close Portal</button>
              ) : (
                <>
                  <button onClick={() => setPaymentStatus(null)}
                    className="flex-1 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded transition uppercase tracking-wider">Back</button>
                  {checkoutOrderRef && (
                    <button disabled={isPaying} onClick={handleVerifyCheckoutOrder}
                      className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded transition uppercase tracking-wider">
                      {isPaying ? 'Verifying...' : 'Verify Payment'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Create & List Property Form */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 bg-white backdrop-blur flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 border border-gray-200 p-6 rounded-xl w-full max-w-lg space-y-4 my-8">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-bold">List Property for Rent / Sale</h3>
            </div>

            <form onSubmit={handleListProperty} className="space-y-4 font-mono text-xs">

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block uppercase">Property Title</label>
                <input type="text" placeholder="e.g. Eko Atlantic Towers, Apt 4B"
                  className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-slate-300/50"
                  value={newProp.title} onChange={(e) => setNewProp({ ...newProp, title: e.target.value })} required />
              </div>

              {/* Photo Upload from device */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 block uppercase">Property Photo <span className="text-zinc-600">(optional)</span></label>
                <label
                  htmlFor="prop-image-upload"
                  className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-gray-300 hover:border-slate-400/50 rounded-lg cursor-pointer bg-white shadow-sm border border-gray-200/50 transition group"
                >
                  {propImagePreview ? (
                    <img src={propImagePreview} alt="preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-slate-800/10 flex items-center justify-center transition">
                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-slate-700" />
                      </div>
                      <span className="text-[11px] text-gray-400 group-hover:text-gray-500 font-sans">Click to upload photo from device</span>
                      <span className="text-[9px] text-zinc-600">JPG, PNG, WEBP — max 5MB</span>
                    </>
                  )}
                </label>
                <input
                  id="prop-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePropImageSelect}
                />
                {propImagePreview && (
                  <button type="button" onClick={() => { setPropImagePreview(null); setNewProp(p => ({ ...p, imageBase64: null })); }}
                    className="text-[10px] text-red-400 hover:text-red-300 font-sans mt-0.5">
                    Remove photo
                  </button>
                )}
              </div>

              {/* Type + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block uppercase font-sans">Listing Type</label>
                  <select className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none font-sans"
                    value={newProp.type} onChange={(e) => setNewProp({ ...newProp, type: e.target.value })}>
                    <option value="RENT">RENT</option>
                    <option value="SALE">SALE</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block uppercase font-sans">Status</label>
                  <select className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none font-sans"
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
                  <label className="text-[10px] text-gray-400 block uppercase">Area / Location</label>
                  <input type="text" placeholder="e.g. Lekki Phase 1"
                    className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none"
                    value={newProp.area} onChange={(e) => setNewProp({ ...newProp, area: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block uppercase">Building Type</label>
                  <input type="text" placeholder="e.g. Penthouse Mansion"
                    className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none"
                    value={newProp.buildingType} onChange={(e) => setNewProp({ ...newProp, buildingType: e.target.value })} required />
                </div>
              </div>

              {/* Price + Units */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block uppercase">Listing Price (NGN)</label>
                  <input type="number" placeholder="Price amount"
                    className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none"
                    value={newProp.price} onChange={(e) => setNewProp({ ...newProp, price: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block uppercase">Total Rooms / Flats</label>
                  <input type="number" placeholder="e.g. 8"
                    className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none"
                    value={newProp.totalUnits} onChange={(e) => setNewProp({ ...newProp, totalUnits: e.target.value })} required />
                </div>
              </div>

              {/* Rent Schedule (only for RENT type) */}
              {newProp.type === 'RENT' && (
                <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-white shadow-sm border border-gray-200/50">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Rent Schedule & Projections</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block uppercase">First Payment (NGN)</label>
                      <input type="number" placeholder="e.g. 1200000"
                        className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-slate-300/50"
                        value={newProp.firstPaymentAmount} onChange={(e) => setNewProp({ ...newProp, firstPaymentAmount: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 block uppercase">Payment Frequency</label>
                      <select className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none font-sans"
                        value={newProp.paymentFrequency} onChange={(e) => setNewProp({ ...newProp, paymentFrequency: e.target.value })}>
                        <option value="MONTHLY">Monthly</option>
                        <option value="BIANNUAL">Every 6 Months</option>
                        <option value="ANNUAL">Annual</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block uppercase">Annual Rent Projections — Year 1 → 5 (NGN)</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-0.5">
                          <span className="text-[9px] text-zinc-600 block text-center">Yr {i + 1}</span>
                          <input type="number" placeholder="0"
                            className="w-full px-2 py-1.5 bg-white shadow-sm border border-gray-200 border border-gray-300 rounded text-[10px] text-gray-900 focus:outline-none text-center"
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
              <div className="space-y-1 border border-gray-200 rounded-lg p-3 bg-white shadow-sm border border-gray-200/30">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <label className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Ownership Document URL <span className="text-zinc-600 font-normal">(optional — private)</span></label>
                </div>
                <p className="text-[10px] text-gray-400 mb-1.5">Upload your deed / C of O to a secure URL. It will never be shown publicly — your listing will display an "Assured by AcreWise" badge.</p>
                <input type="url" placeholder="https://... link to ownership document"
                  className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-300 rounded text-xs text-gray-900 focus:outline-none focus:border-amber-500/50"
                  value={newProp.ownershipDocumentUrl} onChange={(e) => setNewProp({ ...newProp, ownershipDocumentUrl: e.target.value })} />
                {newProp.ownershipDocumentUrl && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-amber-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px]">This listing will be marked as "Assured by AcreWise"</span>
                  </div>
                )}
              </div>

              {/* Invite Tenant */}
              <div className="space-y-1 border-t border-gray-200 pt-3">
                <label className="text-[10px] text-gray-400 block uppercase">Invite Tenant Email (Optional)</label>
                <input type="email" placeholder="Link an already existing tenant email"
                  className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none"
                  value={inviteTenantEmail} onChange={(e) => setInviteTenantEmail(e.target.value)} />
              </div>

              <div className="flex gap-2 pt-1 font-sans">
                <button type="submit"
                  className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs rounded transition uppercase tracking-wider">
                  List Property
                </button>
                <button type="button" onClick={() => setShowPropertyModal(false)}
                  className="flex-1 py-2.5 bg-white shadow-sm border border-gray-200 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded transition uppercase tracking-wider">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Link House Meter Form */}
      {showMeterModal && (
        <div className="fixed inset-0 z-50 bg-white/75 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-gray-200 p-6 rounded-lg w-full max-w-md space-y-4">
            <div>
              <h3 className="text-lg font-bold">Link Utility Meter to Property</h3>
              <p className="text-gray-500 text-xs mt-1">Bind a physical electricity/disco meter directly to this rental asset folder.</p>
            </div>

            <form onSubmit={handleLinkMeter} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400">METER PROVIDER / DISCO</label>
                <select
                  className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300 font-sans"
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
                <label className="text-[10px] text-gray-400">METER SERIAL NUMBER</label>
                <input
                  type="text"
                  placeholder="11-digit Meter Number"
                  className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300"
                  value={meterFormNumber}
                  onChange={(e) => setMeterFormNumber(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-3 font-sans">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Link Meter
                </button>
                <button
                  type="button"
                  onClick={() => setShowMeterModal(false)}
                  className="flex-1 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded transition uppercase tracking-wider"
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
        <div className="fixed inset-0 z-50 bg-white/75 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-gray-200 p-6 rounded-lg w-full max-w-md space-y-4">
            <div>
              <h3 className="text-lg font-bold">Assign House Caretaker</h3>
              <p className="text-gray-500 text-xs mt-1">Designate a building supervisor caretaker to coordinate maintenance requests.</p>
            </div>

            <form onSubmit={handleAssignCaretaker} className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400">CARETAKER FULL NAME</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300"
                  value={caretakerForm.name}
                  onChange={(e) => setCaretakerForm({ ...caretakerForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400">CARETAKER EMAIL</label>
                  <input
                    type="email"
                    placeholder="john@caretaker.com"
                    className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300"
                    value={caretakerForm.email}
                    onChange={(e) => setCaretakerForm({ ...caretakerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400">CARETAKER PHONE</label>
                  <input
                    type="text"
                    placeholder="+234 803..."
                    className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none"
                    value={caretakerForm.phone}
                    onChange={(e) => setCaretakerForm({ ...caretakerForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 font-sans">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Assign Caretaker
                </button>
                <button
                  type="button"
                  onClick={() => setShowCaretakerModal(false)}
                  className="flex-1 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded transition uppercase tracking-wider"
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
        <div className="fixed inset-0 z-50 bg-white/85 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-gray-200 p-8 rounded-xl w-full max-w-md font-mono text-xs space-y-6">
            {/* Header */}
            <div className="text-center space-y-1.5 border-b border-gray-200 pb-4">
              <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 uppercase tracking-widest text-sm">
                <ShieldCheck className="w-4 h-4" />
                ACREWISE TRANSACTION SLIP
              </div>
              <p className="text-gray-400 text-[10px]">RECONCILED VIA NOMBA COMPLIANCE CORE</p>
            </div>

            {/* Voucher Details */}
            <div className="space-y-3.5 bg-white shadow-sm border border-gray-200/10 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400">RECEIPT ID:</span>
                <span className="text-gray-900 font-bold">{selectedReceipt.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400">CATEGORY:</span>
                <span className="text-slate-700 font-bold uppercase">{selectedReceipt.category}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400">REFERENCE:</span>
                <span className="text-gray-900 font-semibold select-all">{selectedReceipt.reference}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400">HOLDER:</span>
                <span className="text-gray-900 truncate">{selectedReceipt.tenantEmail}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-400">TIMESTAMP:</span>
                <span className="text-gray-900">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
              </div>

              <div className="pt-2">
                <span className="text-gray-400 block mb-1">TRANSACTION DETAILS:</span>
                <p className="text-gray-700 leading-normal bg-slate-50 p-2.5 rounded border border-gray-200">{selectedReceipt.details}</p>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-gray-200">
                <span className="text-gray-500 font-bold">TOTAL VALUE</span>
                <span className="text-slate-700 font-extrabold text-lg">₦{selectedReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt Footer Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => alert("Simulating PDF Download...")}
                className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 font-sans"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded transition font-sans"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Tenancy Form */}
      {showTenancyModal && (
        <div className="fixed inset-0 z-50 bg-white/75 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-slate-50 border border-gray-200 p-6 rounded-lg w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Establish Tenancy Agreement</h3>

            <form onSubmit={handleCreateTenancy} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">Link Property</label>
                <select
                  value={newTenancy.propertyId}
                  onChange={(e) => setNewTenancy({ ...newTenancy, propertyId: e.target.value })}
                  className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300 transition"
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
                <label className="text-[10px] font-mono text-gray-400 block uppercase font-mono">Nomba Virtual Account ID (Unique)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. va_eko_atlantic_rent"
                    className="flex-1 px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300 transition font-mono"
                    value={newTenancy.nombaVirtualAccountId}
                    onChange={(e) => setNewTenancy({ ...newTenancy, nombaVirtualAccountId: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleProvisionVirtualAccount}
                    disabled={isProvisioningVa}
                    className="px-3 bg-slate-800 disabled:bg-gray-100 disabled:text-gray-400 rounded text-xs font-bold text-gray-900 transition whitespace-nowrap"
                  >
                    {isProvisioningVa ? "Provisioning..." : "Auto-Provision via Nomba"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 block uppercase">Rent Amount (NGN)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300 transition"
                    value={newTenancy.rentAmount}
                    onChange={(e) => setNewTenancy({ ...newTenancy, rentAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-gray-400 block uppercase">Frequency</label>
                  <select
                    className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300 transition"
                    value={newTenancy.frequency}
                    onChange={(e) => setNewTenancy({ ...newTenancy, frequency: e.target.value })}
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="ANNUAL">ANNUAL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">Next Rent Due Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 rounded text-xs text-gray-900 focus:outline-none focus:border-gray-300 transition"
                  value={newTenancy.nextDueDate}
                  onChange={(e) => setNewTenancy({ ...newTenancy, nextDueDate: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded transition uppercase tracking-wider"
                >
                  Establish
                </button>
                <button
                  type="button"
                  onClick={() => setShowTenancyModal(false)}
                  className="flex-1 py-2 bg-white shadow-sm border border-gray-200 border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded transition uppercase tracking-wider"
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
