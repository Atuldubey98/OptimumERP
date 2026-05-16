const propertiesService = require("./property.service");
const cacheService = require("./cache.service");

const PLANS_CACHE_KEY = "plans:list";

const getPlans = async () => {
    return cacheService.getOrSet(PLANS_CACHE_KEY, async () => {
        const plansConfig = await propertiesService.getPlansConfig();
        const systemPlans = plansConfig.value;
        const systemEntities = {
            "contacts": "Contacts",
            "expenses": "Expenses",
            "expenseCategories": "Expense Categories",
            "invoices": "Invoices",
            "purchases": "Purchases",
            "purchaseOrders": "Purchase Orders",
            "products": "Products",
            "parties": "Parties",
            "productCategories": "Product Categories",
            "proformaInvoices": "Proforma Invoices",
            "quotes": "Quotes",
            "organizationUsers": "Organization Users",
            "taxes": "Taxes",
            "ums": "Units of Measure",
            "paymentVouchers": "Payment Vouchers",
            "recurringInvoices": "Recurring Invoices",
        }
        const systemFeatures = {
            "import_bulk": "Import Bulk",
            "smtp": "SMTP",
            "ai_integration": "AI Integration",
            "byok": "BYOK",
            "bot": "Bot",
            "recurring_invoice": "Recurring Invoice",
        }
        const makeLimitsLinesArr = (limits) => {
            return Object.entries(systemEntities).map(([key]) => {
                const limit = limits[key];
                const limitText = (limit !== undefined && limit !== null) ? limit : "No Limit";
                return {
                    label: `${systemEntities[key]} ${limitText}`,
                    available: limit !== 0,
                };
            })
        }
        const makeFeatureList = (features) => {
            return Object.entries(systemFeatures).map(([key]) => {
                const available = !!features[key];
                return {
                    label: systemFeatures[key],
                    available,
                };
            })
        }
        return Object.keys(systemPlans).map((key) => {
            const plan = systemPlans[key];
            return {
                key,
                name: plan.name,
                price: plan.price,
                featureList: [
                    ...makeLimitsLinesArr(plan.limits || {}),
                    ...makeFeatureList(plan.features || {}),
                ],
            };
        });
    }, { ttl: cacheService.TTL.veryLong });
};

module.exports = { getPlans };