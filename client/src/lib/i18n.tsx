'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

const translations = {
  en: {
    // Auth
    appName: 'Manoj Vaishnav Hotel & Mishthan Bhandar',
    restaurantAddress: 'Gaushala Chowk, Gausala Rd, nearby Hanuman Mandir, Chakmahila, Sitamarhi, Bihar 843302',
    restaurantMobile: '9199056693',
    signInTitle: 'Sign in to your account',
    emailLabel: 'Email / Worker ID',
    passwordLabel: 'Password',
    signingIn: 'Signing in...',
    signInBtn: 'Sign In',
    invalidCredentials: 'Invalid credentials',

    // Sidebar & Navigation
    newOrder: 'New Order',
    myOrders: 'My Orders',
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    reports: 'Reports',
    workers: 'Workers',
    logout: 'Logout',
    roleOwner: 'Owner',
    roleWorker: 'Worker',

    // Workers Management
    manageWorkers: 'Manage cashiers and POS login credentials',
    addWorker: 'Add Worker',
    editWorker: 'Edit Worker',
    addNewWorker: 'Add New Worker',
    workerIdLabel: 'Worker ID (Used for login)',
    workerNameLabel: 'Worker Name',
    workerEmailLabel: 'Email (Optional)',
    workerPasswordLabel: 'Password (Min 6 characters)',
    deleteWorkerTitle: 'Delete Worker Account',
    deleteWorkerConfirm: 'Are you sure you want to delete worker',

    // Inventory Management
    inventory: 'Inventory',
    manageInventory: 'Track raw materials, stock levels, and supplier logs',
    addMaterial: 'Add Material',
    editMaterial: 'Edit Material',
    addNewMaterial: 'Add New Raw Material',
    materialNameLabel: 'Material Name',
    quantityLabel: 'Quantity',
    unitLabel: 'Unit (e.g. Kg, Liters, Pcs)',
    sellerNameLabel: 'Seller / Supplier Name',
    costPriceLabel: 'Unit Cost Price (₹)',
    minStockLabel: 'Alert Threshold (Low Stock Alert)',
    notesLabel: 'Notes / Remarks (Optional)',
    totalInventoryCost: 'Total Inventory Cost',
    lowStockAlerts: 'Low Stock Alerts',
    totalSuppliers: 'Total Sellers',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    deleteMaterialTitle: 'Delete Material Item',
    deleteMaterialConfirm: 'Are you sure you want to delete material',
    takeStock: 'Take Stock',
    dispatchSuccess: 'Stock taken successfully!',
    dispatchTitle: 'Inventory Consumption',
    dispatchedBy: 'Taken By',
    insufficientStock: 'Insufficient stock available!',
    materialLabel: 'Select Raw Material',
    dispatchQtyLabel: 'Quantity to Take',
    usageLogs: 'Usage History',
    stockList: 'Stock List',
    dispatchHistory: 'Usage History (Recent)',

    // Billing / New Order
    hiUser: 'Hi',
    selectItemsDesc: 'select items to add to the cart',
    searchProducts: 'Search products...',
    allCategories: 'All',
    categorySnacks: 'Snacks',
    categoryBeverages: 'Beverages',
    categorySweets: 'Sweets',
    categoryMainCourse: 'Main Course',
    categoryBreads: 'Breads',
    categoryDesserts: 'Desserts',
    categoryOther: 'Other',
    noProductsFound: 'No products found',
    tryDifferentSearch: 'Try a different search term or category',
    cart: 'Cart',
    clear: 'Clear',
    cartEmpty: 'Your cart is empty',
    cartEmptyDesc: 'Tap products to add them',
    subtotal: 'Subtotal',
    extraCharge: 'Extra Charge',
    totalBill: 'Total Bill',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    upi: 'UPI',
    card: 'Card',
    placeOrder: 'Place Order',
    placingOrder: 'Placing Order...',
    orderPlaced: 'Order Placed!',
    orderNum: 'Order #',
    autoDismiss: 'This message will dismiss automatically',
    addExtraCharge: '+ Add Extra / Misc Charges',
    hideExtraCharge: '− Hide Extra Charges',
    labelExtraCharge: 'Label (e.g. Packing, Tip)',
    amountExtraCharge: 'Amount (₹)',
    viewOrderMobile: 'View Order',

    // My Orders
    todayOrdersBy: "Today's orders by",
    refresh: 'Refresh',
    totalEarnings: 'Total Earnings',
    tableOrderNum: 'Order #',
    tableTime: 'Time',
    tableItems: 'Items',
    tableTotal: 'Total',
    tablePayment: 'Payment',
    noOrdersYet: 'No orders yet today',
    ordersPlacedWillAppear: 'Orders placed from the billing screen will appear here',
    showing: 'Showing',
    orderWord: 'order',
    ordersWord: 'orders',

    // Dashboard
    dashboardSummary: 'Real-time sales & payment performance',
    todayRevenue: "Today's Revenue",
    totalOrders: 'Total Orders',
    cashCollection: 'Cash Collection',
    upiCollection: 'UPI Collection',
    cardCollection: 'Card Collection',
    weeklySalesTrend: 'Weekly Sales Trend (Last 7 Days)',
    paymentDistribution: 'Payment Distribution',
    revenueText: 'Revenue',

    // Products Management
    manageMenuItems: 'Manage your menu items and availability',
    addProduct: 'Add Product',
    editProduct: 'Edit Product',
    addNewProduct: 'Add New Product',
    searchProductsPlaceholder: 'Search products...',
    allCategoriesFilter: 'All Categories',
    tableImage: 'Image',
    tableName: 'Name',
    tableCategory: 'Category',
    tablePrice: 'Price',
    tableStatus: 'Status',
    tableActions: 'Actions',
    available: 'Available',
    unavailable: 'Unavailable',
    soldOut: 'Sold Out',
    productNameLabel: 'Product Name',
    priceLabel: 'Price (₹)',
    imageUrlLabel: 'Product Image URL (Optional)',
    imageUrlDesc: 'Leave blank to auto-use category defaults like /images/snacks.png',
    saveBtn: 'Save',
    cancelBtn: 'Cancel',
    updatingBtn: 'Saving...',
    deleteProductTitle: 'Delete Product',
    deleteConfirmMsg: 'Are you sure you want to delete',
    deleteConfirmSuffix: '? This action cannot be undone.',
    deleteBtn: 'Delete',
    deletingBtn: 'Deleting...',

    // Orders History (Owner)
    viewFilterOrders: 'View and filter all orders placed in the system',
    searchOrderPlaceholder: 'Search order number...',
    allPayments: 'All Payments',
    clearFilters: 'Clear Filters',
    dateAndTime: 'Date & Time',
    workerCashier: 'Worker (Cashier)',
    action: 'Action',
    details: 'Details',
    orderItems: 'Order Items',
    grandTotal: 'Grand Total',
    noOrdersFoundFilter: 'No orders found with current filters',

    // Reports
    dailyReport: 'Daily Report',
    monthlyReport: 'Monthly Report',
    selectDate: 'Select Date',
    selectMonth: 'Select Month',
    selectYear: 'Select Year',
    revenueBreakdown: 'Revenue Breakdown',
    dailyBreakdownTable: 'Daily Sales Breakdown',
    dateLabel: 'Date',
    earningsLabel: 'Earnings',
  },
  hi: {
    // Auth
    appName: 'मनोज वैष्णव होटल & मिष्ठान भंडार',
    restaurantAddress: 'गौशाला चौक, गौशाला रोड, हनुमान मंदिर के पास, चकमहिला, सीतामढ़ी, बिहार 843302',
    restaurantMobile: '9199056693',
    signInTitle: 'अपने खाते में लॉगिन करें',
    emailLabel: 'ईमेल या कर्मचारी आईडी',
    passwordLabel: 'पासवर्ड',
    signingIn: 'लॉगिन हो रहा है...',
    signInBtn: 'लॉगिन करें',
    invalidCredentials: 'गलत ईमेल या पासवर्ड',

    // Sidebar & Navigation
    newOrder: 'नया ऑर्डर',
    myOrders: 'मेरे ऑर्डर्स',
    dashboard: 'डैशबोर्ड',
    products: 'उत्पाद प्रबंधन',
    orders: 'ऑर्डर इतिहास',
    reports: 'सेल्स रिपोर्ट्स',
    workers: 'कर्मचारी प्रबंधन',
    logout: 'लॉगआउट',
    roleOwner: 'मालिक (Owner)',
    roleWorker: 'कर्मचारी (Worker)',

    // Workers Management
    manageWorkers: 'अपने कैशियर और लॉगिन क्रेडेंशियल प्रबंधित करें',
    addWorker: 'कर्मचारी जोड़ें',
    editWorker: 'कर्मचारी संपादित करें',
    addNewWorker: 'नया कर्मचारी जोड़ें',
    workerIdLabel: 'कर्मचारी आईडी (लॉगिन के लिए)',
    workerNameLabel: 'कर्मचारी का नाम',
    workerEmailLabel: 'ईमेल (वैकल्पिक)',
    workerPasswordLabel: 'पासवर्ड (कम से कम 6 अक्षर)',
    deleteWorkerTitle: 'कर्मचारी खाता हटाएं',
    deleteWorkerConfirm: 'क्या आप वाकई कर्मचारी',

    // Inventory Management
    inventory: 'स्टॉक प्रबंधन',
    manageInventory: 'कच्चा माल, स्टॉक स्तर और आपूर्तिकर्ता (Seller) विवरण ट्रैक करें',
    addMaterial: 'सामग्री जोड़ें',
    editMaterial: 'सामग्री संपादित करें',
    addNewMaterial: 'नई कच्ची सामग्री जोड़ें',
    materialNameLabel: 'सामग्री का नाम',
    quantityLabel: 'मात्रा (Quantity)',
    unitLabel: 'इकाई (जैसे कि किलोग्राम, घोषित इकाई)',
    sellerNameLabel: 'विक्रेता / सप्लायर का नाम',
    costPriceLabel: 'इकाई लागत मूल्य (₹)',
    minStockLabel: 'अलर्ट सीमा (कम स्टॉक होने पर)',
    notesLabel: 'विवरण / टिप्पणी (वैकल्पिक)',
    totalInventoryCost: 'कुल स्टॉक लागत मूल्य',
    lowStockAlerts: 'कम स्टॉक अलर्ट संख्या',
    totalSuppliers: 'कुल विक्रेता (Sellers)',
    inStock: 'स्टॉक में है',
    lowStock: 'स्टॉक कम है',
    outOfStock: 'स्टॉक खत्म है',
    deleteMaterialTitle: 'सामग्री हटाएं',
    deleteMaterialConfirm: 'क्या आप वाकई सामग्री',
    takeStock: 'स्टॉक निकालें',
    dispatchSuccess: 'स्टॉक सफलतापूर्वक निकाला गया!',
    dispatchTitle: 'स्टॉक खपतः',
    dispatchedBy: 'किसने निकाला',
    insufficientStock: 'स्टॉक में पर्याप्त मात्रा नहीं है!',
    materialLabel: 'कच्ची सामग्री चुनें',
    dispatchQtyLabel: 'निकालने की मात्रा',
    usageLogs: 'खपत इतिहास',
    stockList: 'स्टॉक सूची',
    dispatchHistory: 'सामग्री खपत का इतिहास (हाल ही का)',

    // Billing / New Order
    hiUser: 'नमस्ते',
    selectItemsDesc: 'कार्ट में आइटम जोड़ने के लिए चयन करें',
    searchProducts: 'उत्पाद खोजें...',
    allCategories: 'सभी',
    categorySnacks: 'स्नैक्स',
    categoryBeverages: 'पेय पदार्थ',
    categorySweets: 'मिठाइयाँ',
    categoryMainCourse: 'मुख्य भोजन',
    categoryBreads: 'रोटियाँ',
    categoryDesserts: 'डेसर्ट',
    categoryOther: 'अन्य',
    noProductsFound: 'कोई उत्पाद नहीं मिला',
    tryDifferentSearch: 'कोई दूसरा नाम या श्रेणी खोजें',
    cart: 'कार्ट',
    clear: 'साफ़ करें',
    cartEmpty: 'आपकी कार्ट खाली है',
    cartEmptyDesc: 'जोड़ने के लिए उत्पाद पर टैप करें',
    subtotal: 'उप-योग (Subtotal)',
    extraCharge: 'अतिरिक्त शुल्क',
    totalBill: 'कुल बिल',
    paymentMethod: 'भुगतान का तरीका',
    cash: 'नकद (Cash)',
    upi: 'यूपीआई (UPI)',
    card: 'कार्ड (Card)',
    placeOrder: 'ऑर्डर सबमिट करें',
    placingOrder: 'ऑर्डर सबमिट हो रहा है...',
    orderPlaced: 'ऑर्डर सफल रहा!',
    orderNum: 'ऑर्डर संख्या #',
    autoDismiss: 'यह संदेश अपने आप बंद हो जाएगा',
    addExtraCharge: '+ अतिरिक्त शुल्क जोड़ें',
    hideExtraCharge: '− अतिरिक्त शुल्क छुपाएं',
    labelExtraCharge: 'विवरण (जैसे पैकिंग, टिप)',
    amountExtraCharge: 'राशि (₹)',
    viewOrderMobile: 'ऑर्डर देखें',

    // My Orders
    todayOrdersBy: 'आज के ऑर्डर्स -',
    refresh: 'ताज़ा करें',
    totalEarnings: 'कुल कमाई',
    tableOrderNum: 'ऑर्डर #',
    tableTime: 'समय',
    tableItems: 'आइटम',
    tableTotal: 'कुल योग',
    tablePayment: 'भुगतान',
    noOrdersYet: 'आज अभी तक कोई ऑर्डर नहीं हुआ',
    ordersPlacedWillAppear: 'बिलिंग स्क्रीन से सबमिट किए गए ऑर्डर यहाँ दिखाई देंगे',
    showing: 'दिखाए जा रहे हैं',
    orderWord: 'ऑर्डर',
    ordersWord: 'ऑर्डर',

    // Dashboard
    dashboardSummary: 'वास्तविक समय में बिक्री और भुगतान विवरण',
    todayRevenue: 'आज का कुल राजस्व',
    totalOrders: 'कुल ऑर्डर्स संख्या',
    cashCollection: 'नकद संग्रह (Cash)',
    upiCollection: 'यूपीआई संग्रह (UPI)',
    cardCollection: 'कार्ड संग्रह (Card)',
    weeklySalesTrend: 'साप्ताहिक बिक्री का रुझान (पिछले 7 दिन)',
    paymentDistribution: 'भुगतान का वितरण',
    revenueText: 'राजस्व',

    // Products Management
    manageMenuItems: 'अपने मेनू आइटम और उनकी उपलब्धता प्रबंधित करें',
    addProduct: 'उत्पाद जोड़ें',
    editProduct: 'उत्पाद संपादित करें',
    addNewProduct: 'नया उत्पाद जोड़ें',
    searchProductsPlaceholder: 'उत्पाद खोजें...',
    allCategoriesFilter: 'सभी श्रेणियां',
    tableImage: 'छवि',
    tableName: 'नाम',
    tableCategory: 'श्रेणी',
    tablePrice: 'कीमत',
    tableStatus: 'स्थिति',
    tableActions: 'क्रियाएं',
    available: 'उपलब्ध',
    unavailable: 'अनुपलब्ध',
    soldOut: 'बिक गया',
    productNameLabel: 'उत्पाद का नाम',
    priceLabel: 'कीमत (₹)',
    imageUrlLabel: 'उत्पाद छवि लिंक (वैकल्पिक)',
    imageUrlDesc: 'श्रेणी के डिफ़ॉल्ट चित्र का उपयोग करने के लिए इसे खाली छोड़ दें',
    saveBtn: 'सहेजें',
    cancelBtn: 'रद्द करें',
    updatingBtn: 'सहेजा जा रहा है...',
    deleteProductTitle: 'उत्पाद हटाएं',
    deleteConfirmMsg: 'क्या आप वाकई उत्पाद',
    deleteConfirmSuffix: 'को हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।',
    deleteBtn: 'हटाएं',
    deletingBtn: 'हटाया जा रहा है...',

    // Orders History (Owner)
    viewFilterOrders: 'सिस्टम में किए गए सभी ऑर्डर्स देखें और फ़िल्टर करें',
    searchOrderPlaceholder: 'ऑर्डर नंबर खोजें...',
    allPayments: 'सभी भुगतान',
    clearFilters: 'फ़िल्टर साफ़ करें',
    dateAndTime: 'दिनांक और समय',
    workerCashier: 'कर्मचारी (कैशियर)',
    action: 'एक्शन',
    details: 'विवरण',
    orderItems: 'ऑर्डर किए गए आइटम',
    grandTotal: 'कुल योग',
    noOrdersFoundFilter: 'चयनित फ़िल्टर के साथ कोई ऑर्डर नहीं मिला',

    // Reports
    dailyReport: 'दैनिक रिपोर्ट',
    monthlyReport: 'मासिक रिपोर्ट',
    selectDate: 'तारीख चुनें',
    selectMonth: 'महीना चुनें',
    selectYear: 'वर्ष चुनें',
    revenueBreakdown: 'राजस्व विवरण',
    dailyBreakdownTable: 'दैनिक बिक्री विवरण',
    dateLabel: 'तारीख',
    earningsLabel: 'कमाई',
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on client-side
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage === 'en' || savedLanguage === 'hi') {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
