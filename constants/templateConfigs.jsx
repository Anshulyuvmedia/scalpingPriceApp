// src/constants/templateConfigs.jsx

// Pure JavaScript UUID v4 — works everywhere, no imports, no crypto needed
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Default leg factory
const defaultLeg = (overrides = {}) => {
    const base = {
        id: uuidv4(),
        isBuy: overrides.isBuy ? 'Buy' : 'Sell',
        isCE: overrides.isCE ? 'CE' : 'PE',
        isWeekly: 'Weekly',
        qty: 50,
        tpQty: 25,
        slQty: 25,
        firstSelection: 'ATM pt',
        secondSelection: 'ATM',
        tpSelection: 'TP pt',
        slSelection: 'SL pt',
        onSelection: 'On Price',
        onSelectionSec: 'On Price',
    };

    return { ...base, ...overrides };
};

// All your strategies
export const templateConfigs = {
    'Buy Call': [defaultLeg({ isBuy: true, isCE: true })],
    'Sell Put': [defaultLeg({ isBuy: false, isCE: false })],
    'Buy Put': [defaultLeg({ isBuy: true, isCE: false })],
    'Sell Call': [defaultLeg({ isBuy: false, isCE: true })],

    'Bull Call Spread': [
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'OTM' }),
    ],
    'Bull Put Spread': [
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'OTM' }),
    ],
    'Bear Put Spread': [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'OTM' }),
    ],
    'Bear Call Spread': [
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'OTM' }),
    ],

    'Short Straddle': [
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'ATM' }),
    ],
    'Short Strangle': [
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'OTM' }),
    ],
    'Iron Butterfly': [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'OTM' }),
    ],
    'Short Iron Condor': [
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'OTM' }),
    ],

    'Call Ratio Back Spread': [
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'OTM' }),
    ],
    'Put Ratio Back Spread': [
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'OTM' }),
    ],

    'Long Straddle': [
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'ATM' }),
    ],
    'Put Ratio Spread': [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'OTM' }),
    ],
    'Call Ratio Spread': [
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'OTM' }),
    ],
    'Long Iron Butterfly': [
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'ATM' }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'OTM' }),
    ],
    'Iron Strangle': [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'ITM' }),
    ],
    'Long Iron Condor': [
        defaultLeg({ isBuy: true, isCE: false, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: false, isCE: false, secondSelection: 'OTM' }),
        defaultLeg({ isBuy: false, isCE: true, secondSelection: 'ITM' }),
        defaultLeg({ isBuy: true, isCE: true, secondSelection: 'OTM' }),
    ],
};

// Public function used in StrategyDetailScreen
export const getTemplateLegs = (templateName) => {
    const config = templateConfigs[templateName];
    if (!config) return [];
    return config.map(leg => ({ ...leg, id: uuidv4() })); // Fresh ID every time
};