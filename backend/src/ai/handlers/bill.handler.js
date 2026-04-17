const billService = require("../../services/bill.service");
const Invoice = require("../../models/invoice.model");
const Purchase = require("../../models/purchase.model");
const ProformaInvoice = require("../../models/proformaInvoice.model");
const PurchaseOrder = require("../../models/purchaseOrder.model");
const Quote = require("../../models/quotes.model");
const models = {
    invoices:  Invoice,
    purchases: Purchase,
    proformaInvoices: ProformaInvoice,
    purchaseOrders: PurchaseOrder,
    estimates : Quote,
    quotations : Quote,
}
const billHandler = {
    find_bill : async (params)=>{
        const Model = models[params.type];
        if(!Model) throw new Error("Invalid bill type");
        const filter = { org: params.org };
        if (params.billId) filter._id = params.billId;
        if (params.billNumber) filter.num = params.billNumber;
        return billService.getBill({ Bill : Model, filter });
    },
    create_bill : async (params)=>{
        const Model = models[params.type];
        if(!Model) throw new Error("Invalid bill type");                
        return "Bill created"
    }
}

module.exports = billHandler;