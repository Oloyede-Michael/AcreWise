import { gql } from '@apollo/client';

// --- QUERIES ---

// Fetches the structured list of all merchant pricing packages
export const GET_MERCHANT_PLANS = gql`
  query GetMerchantPlans {
    getMerchantPlans {
      id
      name
      amount
      frequency
    }
  }
`;

// Inspects a single subscription state machine ledger
export const GET_SUBSCRIPTION_DETAILS = gql`
  query GetSubscriptionDetails($id: ID!) {
    getSubscription(id: $id) {
      id
      status
      nextBillingDate
      customer {
        name
        email
      }
      plan {
        name
        amount
      }
    }
  }
`;

// --- MUTATIONS ---

// Creates a new billing tier definition
export const CREATE_PLAN = gql`
  mutation CreatePlan($input: CreatePlanInput!) {
    createPlan(input: $input) {
      id
      name
      amount
      frequency
    }
  }
`;

// Gracefully halts automated billing loops on an active profile
export const PAUSE_SUBSCRIPTION = gql`
  mutation PauseSubscription($id: ID!) {
    pauseSubscription(id: $id) {
      id
      status
    }
  }
`;

// Resumes automated billing operations on a suspended thread
export const RESUME_SUBSCRIPTION = gql`
  mutation ResumeSubscription($id: ID!) {
    resumeSubscription(id: $id) {
      id
      status
      nextBillingDate
    }
  }
`;
