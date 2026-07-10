export const APIS_METADATA = [
  {
    name: "Obtain access token",
    method: "POST",
    url: "/v1/auth/token/issue",
    tag: "Authenticate",
    description: "Issue an OAuth2 bearer access token using your client credentials.",
    requestBody: {
      grant_type: "client_credentials",
      client_id: "${NOMBA_CLIENT_KEY}",
      client_secret: "${NOMBA_SECRET_KEY}"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        access_token: "eyJhbGciOi...",
        expires_in: 86400,
        token_type: "Bearer"
      }
    }
  },
  {
    name: "Refresh an expired token",
    method: "POST",
    url: "/v1/auth/token/refresh",
    tag: "Authenticate",
    description: "Refresh an expired OAuth2 bearer access token.",
    requestBody: {
      refreshToken: "ref_01ae883fbb..."
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        access_token: "eyJhbGciOi...",
        expires_in: 86400
      }
    }
  },
  {
    name: "Revoke an access_token",
    method: "POST",
    url: "/v1/auth/token/revoke",
    tag: "Authenticate",
    description: "Revoke an active access token.",
    requestBody: {
      token: "eyJhbGciOi..."
    },
    responseBody: {
      code: "00",
      description: "Token revoked successfully."
    }
  },
  {
    name: "Fetch parent account details",
    method: "GET",
    url: "/v1/accounts",
    tag: "Accounts",
    description: "Fetch parent account profile details.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        accountId: "f666ef9b-888e-4799-85ce-acb505b28023",
        accountName: "AcreWise Parent Corp",
        email: "finance@acrewise.com",
        phone: "+23480000000"
      }
    }
  },
  {
    name: "Fetch sub account details",
    method: "GET",
    url: "/v1/accounts/sub-account/5a6c217c-010f-4c90-9517-382c9ec46595",
    tag: "Accounts",
    description: "Fetch sub-account profile details.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        subAccountId: "5a6c217c-010f-4c90-9517-382c9ec46595",
        name: "Lekki Operations Subaccount",
        parentAccountId: "f666ef9b-888e-4799-85ce-acb505b28023",
        status: "ACTIVE"
      }
    }
  },
  {
    name: "Fetch parent account balance",
    method: "GET",
    url: "/v1/accounts/balance",
    tag: "Accounts",
    description: "Fetch balances on parent wallet accounts.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        balance: 14500000.5,
        currency: "NGN",
        lockedBalance: 500000.0
      }
    }
  },
  {
    name: "Fetch sub account balance",
    method: "GET",
    url: "/v1/accounts/balance/5a6c217c-010f-4c90-9517-382c9ec46595",
    tag: "Accounts",
    description: "Fetch balances on a sub-account wallet.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        subAccountId: "5a6c217c-010f-4c90-9517-382c9ec46595",
        balance: 2350000.0,
        currency: "NGN"
      }
    }
  },
  {
    name: "Create virtual account",
    method: "POST",
    url: "/v1/accounts/virtual",
    tag: "Virtual Accounts",
    description: "Create a virtual account to receive payments on the parent account.",
    requestBody: {
      accountRef: "1oWbJQQHLyQqqf1SwxjSpudeA21",
      accountName: "Daniel Scorsese",
      bvn: "12345678"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        createdAt: "2026-07-05T07:09:06.900Z",
        accountHolderId: "01a10aeb-d989-460a-bbde-9842f2b4320f",
        accountRef: "1oWbJQQHLyQqqf1SwxjSpudeA21",
        accountName: "Daniel Scorsese",
        bankName: "Nombank MFB",
        bankAccountNumber: "9391076543",
        bankAccountName: "Nomba/Daniel Scorsese",
        currency: "NGN"
      }
    }
  },
  {
    name: "Create virtual account for a sub account",
    method: "POST",
    url: "/v1/accounts/virtual/5a6c217c-010f-4c90-9517-382c9ec46595",
    tag: "Virtual Accounts",
    description: "Create a virtual account to receive payments scoped to a sub account.",
    requestBody: {
      accountRef: "ref_lekki_villa_rent_102",
      accountName: "Lekki Tenant 102",
      bvn: "12345678"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        createdAt: "2026-07-05T07:11:00.000Z",
        accountHolderId: "01a10aeb-d989-460a-bbde-9842f2b4320f",
        accountRef: "ref_lekki_villa_rent_102",
        accountName: "Lekki Tenant 102",
        bankName: "Nombank MFB",
        bankAccountNumber: "9391076544",
        bankAccountName: "Nomba/Lekki Tenant 102",
        currency: "NGN"
      }
    }
  },
  {
    name: "Filter virtual accounts",
    method: "POST",
    url: "/v1/accounts/virtual/filter",
    tag: "Virtual Accounts",
    description: "Query and filter provisioned virtual accounts.",
    requestBody: {
      page: 0,
      size: 10,
      bankAccountNumber: "9391076543"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        results: [
          {
            accountNumber: "9391076543",
            accountName: "Daniel Scorsese",
            bankName: "Nombank MFB"
          }
        ]
      }
    }
  },
  {
    name: "Fetch a virtual account",
    method: "GET",
    url: "/v1/accounts/virtual/9391076543",
    tag: "Virtual Accounts",
    description: "Fetch single virtual account details.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        bankAccountNumber: "9391076543",
        accountName: "Daniel Scorsese",
        bankName: "Nombank MFB",
        currency: "NGN"
      }
    }
  },
  {
    name: "Update a virtual account",
    method: "PUT",
    url: "/v1/accounts/virtual/9391076543",
    tag: "Virtual Accounts",
    description: "Update virtual account properties (e.g. expectedAmount).",
    requestBody: {
      expectedAmount: 500000.0
    },
    responseBody: {
      code: "00",
      description: "Success"
    }
  },
  {
    name: "Expire a virtual account",
    method: "DELETE",
    url: "/v1/accounts/virtual/9391076543",
    tag: "Virtual Accounts",
    description: "Expire/delete a virtual account.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Virtual account expired successfully."
    }
  },
  {
    name: "Create an online checkout order",
    method: "POST",
    url: "/v1/checkout/order",
    tag: "Online Checkout",
    description: "Create an online checkout order to receive card payments.",
    requestBody: {
      order: {
        amount: "15000.00",
        currency: "NGN",
        orderReference: "order_ref_102",
        callbackUrl: "https://webhook.site/test",
        customerEmail: "customer@example.com",
        customerId: "cust_123"
      }
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        checkoutLink: "https://checkout.nomba.com/pay/checkout_order_441a",
        orderReference: "order_ref_102"
      }
    }
  },
  {
    name: "Charge a customer using tokenized card data",
    method: "POST",
    url: "/v1/checkout/charge/token",
    tag: "Online Checkout",
    description: "Charge a customer utilizing saved/tokenized card information.",
    requestBody: {
      cardToken: "tok_card_0029a1",
      amount: 12000.0,
      currency: "NGN"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        transactionId: "tx_token_charge_99812",
        status: "SUCCESS"
      }
    }
  },
  {
    name: "List tokenized cards",
    method: "GET",
    url: "/v1/checkout/cards",
    tag: "Online Checkout",
    description: "List all tokenized cards associated with the parent account.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        cards: [
          { cardToken: "tok_card_0029a1", brand: "VISA", last4: "4321", expiry: "12/28" }
        ]
      }
    }
  },
  {
    name: "Update tokenized card data",
    method: "POST",
    url: "/v1/checkout/cards/update",
    tag: "Online Checkout",
    description: "Update billing/expiry attributes of tokenized card data.",
    requestBody: {
      cardToken: "tok_card_0029a1",
      email: "new_billing_email@gmail.com"
    },
    responseBody: {
      code: "00",
      description: "Success"
    }
  },
  {
    name: "Delete tokenized card data",
    method: "DELETE",
    url: "/v1/checkout/cards/tok_card_0029a1",
    tag: "Online Checkout",
    description: "Revoke and delete tokenized card references.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Card token deleted successfully."
    }
  },
  {
    name: "Fetch checkout transaction",
    method: "GET",
    url: "/v1/checkout/transaction/tx_token_charge_99812",
    tag: "Online Checkout",
    description: "Inspect single checkout transaction details.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        transactionId: "tx_token_charge_99812",
        amount: 12000.0,
        status: "SUCCESS"
      }
    }
  },
  {
    name: "Refund checkout transaction",
    method: "POST",
    url: "/v1/checkout/refund",
    tag: "Online Checkout",
    description: "Refund an online checkout transaction.",
    requestBody: {
      transactionId: "tx_token_charge_99812",
      amount: 12000.0
    },
    responseBody: {
      code: "00",
      description: "Refund processed successfully."
    }
  },
  {
    name: "Cancel Checkout Order",
    method: "POST",
    url: "/v1/checkout/order/cancel",
    tag: "Online Checkout",
    description: "Cancel an active checkout order.",
    requestBody: {
      orderId: "checkout_order_441a"
    },
    responseBody: {
      code: "00",
      description: "Order cancelled successfully."
    }
  },
  {
    name: "Get Order details based on the generated Order reference",
    method: "GET",
    url: "/v1/checkout/order/order_ref_102",
    tag: "Charge",
    description: "Query details of a checkout order using the reference.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        orderId: "checkout_order_441a",
        amount: 15000.0,
        status: "PENDING_PAYMENT"
      }
    }
  },
  {
    name: "Submit customer card details",
    method: "POST",
    url: "/v1/checkout/charge/card",
    tag: "Charge",
    description: "Initiate checkout charge with direct card values.",
    requestBody: {
      cardNumber: "4111222233334444",
      cvv: "123",
      expiry: "12/28"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        authType: "OTP_REQUIRED",
        reference: "ref_card_init_92910"
      }
    }
  },
  {
    name: "Submit customer card OTP",
    method: "POST",
    url: "/v1/checkout/charge/card/otp",
    tag: "Charge",
    description: "Authenticate checkout charge with customer card OTP.",
    requestBody: {
      reference: "ref_card_init_92910",
      otp: "123456"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        status: "SUCCESS",
        transactionId: "tx_card_charge_00291"
      }
    }
  },
  {
    name: "Resend OTP to customer's phone",
    method: "POST",
    url: "/v1/checkout/charge/card/otp/resend",
    tag: "Charge",
    description: "Request resend of OTP to the customer's phone.",
    requestBody: {
      reference: "ref_card_init_92910"
    },
    responseBody: {
      code: "00",
      description: "OTP resent successfully."
    }
  },
  {
    name: "Fetch checkout transaction details",
    method: "POST",
    url: "/v1/checkout/transaction/query",
    tag: "Charge",
    description: "Requery dynamic transaction statuses.",
    requestBody: {
      transactionId: "tx_card_charge_00291"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        transactionId: "tx_card_charge_00291",
        status: "SUCCESS",
        amount: 15000.0
      }
    }
  },
  {
    name: "Fetch checkout Flash account number for transfer payment.",
    method: "GET",
    url: "/v1/checkout/get-checkout-kta/order_ref_102",
    tag: "Charge",
    description: "Generate a flash virtual account reference dynamically for checkout.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        flashAccountNumber: "9391087712",
        bankName: "Nombank MFB",
        amount: 15000.0
      }
    }
  },
  {
    name: "Request OTP before saving a user's card",
    method: "POST",
    url: "/v1/checkout/cards/save/otp",
    tag: "Charge",
    description: "Validate client token via OTP before tokenizing details.",
    requestBody: {
      email: "finance@acrewise.com"
    },
    responseBody: {
      code: "00",
      description: "OTP sent successfully."
    }
  },
  {
    name: "Request OTP to validate a user before fetching saved cards",
    method: "POST",
    url: "/v1/checkout/cards/fetch/otp",
    tag: "Charge",
    description: "Issue security OTP authentication before listing cards.",
    requestBody: {
      email: "finance@acrewise.com"
    },
    responseBody: {
      code: "00",
      description: "OTP sent successfully."
    }
  },
  {
    name: "Submit user OTP",
    method: "POST",
    url: "/v1/checkout/cards/otp/submit",
    tag: "Charge",
    description: "Submit authentication OTP validation results.",
    requestBody: {
      otp: "123456"
    },
    responseBody: {
      code: "00",
      description: "OTP validated successfully."
    }
  },
  {
    name: "Get user saved cards",
    method: "GET",
    url: "/v1/checkout/cards/saved",
    tag: "Charge",
    description: "Inspect customer card details stored under compliance.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        savedCards: [
          { token: "tok_saved_99", maskedPan: "4111********1111", brand: "VISA" }
        ]
      }
    }
  },
  {
    name: "Cancel Checkout transaction",
    method: "POST",
    url: "/v1/checkout/transaction/cancel",
    tag: "Charge",
    description: "Abort checkout transaction processing.",
    requestBody: {
      transactionId: "tx_card_charge_00291"
    },
    responseBody: {
      code: "00",
      description: "Transaction aborted successfully."
    }
  },
  {
    name: "Perform bank account lookup",
    method: "POST",
    url: "/v1/transfers/bank/lookup",
    tag: "Transfers",
    description: "Verify recipient bank account coordinates before payout.",
    requestBody: {
      accountNumber: "0554772814",
      bankCode: "058"
    },
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        accountNumber: "0554772814",
        accountName: "M.A Animashaun"
      }
    }
  },
  {
    name: "Fetch bank codes and names",
    method: "GET",
    url: "/v1/transfers/banks",
    tag: "Transfers",
    description: "Fetch the list of supported Nigerian banks.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        results: [
          { code: "058", name: "Guaranty Trust Bank" },
          { code: "011", name: "First Bank of Nigeria" },
          { code: "053", name: "Nombank MFB" }
        ]
      }
    }
  },
  {
    name: "Perform bank account transfer from the parent account",
    method: "POST",
    url: "/v2/transfers/bank",
    tag: "Transfers",
    description: "Perform bank account transfer from the parent account wallet.",
    requestBody: {
      amount: 3500.0,
      accountNumber: "0554772814",
      accountName: "M.A Animashaun",
      bankCode: "058",
      merchantTxRef: "UNQ_123abGGhh5546",
      senderName: "Nightly Post",
      narration: "Testing Payment"
    },
    responseBody: {
      code: "200",
      description: "SUCCESS",
      message: "Success",
      status: true,
      data: {
        amount: "3500.0",
        fee: 50.0,
        timeCreated: "2026-03-08T14:17:13.634Z",
        id: "API-TRANSFER-C24AD-a6443bf0-011c-4bc2-b739-4a2e33e2a27b",
        type: "transfer",
        status: "SUCCESS"
      }
    }
  },
  {
    name: "Perform bank account transfer from the sub account",
    method: "POST",
    url: "/v2/transfers/bank/5a6c217c-010f-4c90-9517-382c9ec46595",
    tag: "Transfers",
    description: "Perform bank account transfer from the sub account wallet.",
    requestBody: {
      subAccountId: "5a6c217c-010f-4c90-9517-382c9ec46595",
      amount: 250000.0,
      accountNumber: "0554772814",
      accountName: "M.A Animashaun",
      bankCode: "058",
      merchantTxRef: "UNQ_sub_992182",
      narration: "Rent Payout"
    },
    responseBody: {
      code: "200",
      description: "SUCCESS",
      data: {
        amount: "250000.0",
        fee: 50.0,
        timeCreated: "2026-07-05T12:00:00.000Z",
        id: "API-TRANSFER-SUB-9982a",
        status: "SUCCESS"
      }
    }
  },
  {
    name: "Perform wallet account transfer from parent account",
    method: "POST",
    url: "/v1/transfers/wallet",
    tag: "Transfers",
    description: "Transfer funds from parent account to another Nomba wallet.",
    requestBody: {
      recipientWalletId: "wall_9918",
      amount: 15000.0
    },
    responseBody: {
      code: "00",
      description: "Wallet transfer completed successfully."
    }
  },
  {
    name: "Perform wallet account transfer from sub account",
    method: "POST",
    url: "/v1/transfers/wallet/sub-account",
    tag: "Transfers",
    description: "Transfer funds from sub-account to another Nomba wallet.",
    requestBody: {
      subAccountId: "5a6c217c-010f-4c90-9517-382c9ec46595",
      recipientWalletId: "wall_9918",
      amount: 10000.0
    },
    responseBody: {
      code: "00",
      description: "Wallet transfer completed successfully."
    }
  },
  {
    name: "Confirm a transaction's status by sessionId",
    method: "GET",
    url: "/v1/transactions/requery/session_ref_0029",
    tag: "Requery",
    description: "Requery status of a transaction using the sessionId.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        sessionId: "session_ref_0029",
        status: "SUCCESS",
        amount: 3500.0
      }
    }
  },
  {
    name: "Fetch transactions on the parent account",
    method: "GET",
    url: "/v1/transactions",
    tag: "Transactions",
    description: "Retrieve chronological transaction logs of the parent account.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        results: [
          { transactionId: "tx_nomba_rec_4021", amount: 1200000.0, type: "deposit", status: "SUCCESS" }
        ]
      }
    }
  },
  {
    name: "Fetch a single transaction on the parent account",
    method: "GET",
    url: "/v1/transactions/tx_nomba_rec_4021",
    tag: "Transactions",
    description: "Inspect single transaction logs by ID.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        transactionId: "tx_nomba_rec_4021",
        amount: 1200000.0,
        type: "deposit",
        status: "SUCCESS"
      }
    }
  },
  {
    name: "Fetch a single transaction on a sub account",
    method: "GET",
    url: "/v1/transactions/accounts/5a6c217c-010f-4c90-9517-382c9ec46595",
    tag: "Transactions",
    description: "Inspect sub-account transaction logs by ID.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        transactionId: "tx_nomba_rec_8819",
        amount: 1000000.0,
        type: "deposit",
        status: "SUCCESS"
      }
    }
  },
  {
    name: "Fetch credit debit transactions on the parent account",
    method: "GET",
    url: "/v1/transactions/bank",
    tag: "Transactions",
    description: "Retrieve double-entry ledger summaries on parent account.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        records: [
          { id: "led_01", amount: 12000.0, entryType: "CREDIT", timestamp: "2026-07-05T12:00:00Z" }
        ]
      }
    }
  },
  {
    name: "Convert money",
    method: "POST",
    url: "/v1/global-payout/money/convert",
    tag: "Global Payout",
    description: "Perform foreign exchange conversions dynamically.",
    requestBody: {
      fromCurrency: "NGN",
      toCurrency: "USD",
      amount: 100000.0
    },
    responseBody: {
      code: "00",
      description: "FX conversion processing initialized.",
      data: {
        exchangeId: "fx_conv_9921",
        rate: 0.00067
      }
    }
  },
  {
    name: "Fetch exchange rates",
    method: "GET",
    url: "/v1/global-payout/exchange-rates?from=NGN&to=USD",
    tag: "Global Payout",
    description: "Fetch live exchange rates for payout currencies.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        rates: {
          "USD": 1495.5,
          "GBP": 1890.2
        }
      }
    }
  },
  {
    name: "Fetch transaction",
    method: "GET",
    url: "/v1/global-payout/transactions/fx_conv_9921",
    tag: "Global Payout",
    description: "Query foreign exchange transaction status.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        exchangeId: "fx_conv_9921",
        status: "COMPLETED"
      }
    }
  },
  {
    name: "Authorize exchange",
    method: "POST",
    url: "/v1/global-payout/exchange/authorize",
    tag: "Global Payout",
    description: "Submit authorization OTP for exchange execution.",
    requestBody: {
      exchangeId: "fx_conv_9921",
      otp: "654321"
    },
    responseBody: {
      code: "00",
      description: "FX conversion authorized successfully."
    }
  },
  {
    name: "authorizetransfer",
    method: "POST",
    url: "/v1/transfers/authorize",
    tag: "Global Payout",
    description: "Submit transfer authorization constraints.",
    requestBody: {
      transferId: "API-TRANSFER-SUB-9982a",
      pin: "2209"
    },
    responseBody: {
      code: "00",
      description: "Transfer authorized successfully."
    }
  },
  {
    name: "Payment methods",
    method: "GET",
    url: "/v1/global-payout/payment-methods",
    tag: "Global Payout",
    description: "Retrieve supported payout channels.",
    requestBody: {},
    responseBody: {
      code: "00",
      description: "Success",
      data: {
        channels: ["bank_transfer", "mobile_money"]
      }
    }
  }
];
