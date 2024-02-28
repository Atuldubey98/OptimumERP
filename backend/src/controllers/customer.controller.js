const { createCustomerDto, updateCustomerDto } = require("../dto/customer.dto");
const {
  CustomerNotFound,
  CustomerNotDelete,
} = require("../errors/customer.error");
const { OrgNotFound } = require("../errors/org.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Customer = require("../models/customer.model");
const Invoice = require("../models/invoice.model");
const Quotation = require("../models/quotes.model");

exports.createCustomer = requestAsyncHandler(async (req, res) => {
  const orgId = req.params.orgId;
  if (!orgId) throw new OrgNotFound();
  const body = await createCustomerDto.validateAsync({
    ...req.body,
    org: orgId,
  });
  const customer = new Customer(body);
  await customer.save();
  return res.status(201).json({ message: "Customer created !" });
});

exports.updateCustomer = requestAsyncHandler(async (req, res) => {
  if (!req.params.customerId) throw new CustomerNotFound();
  const body = await updateCustomerDto.validateAsync(req.body);
  const updatedCustomer = await Customer.findOneAndUpdate(
    { _id: req.params.customerId, org: req.params.orgId },
    body
  );
  if (!updatedCustomer) throw new CustomerNotFound();
  return res.status(200).json({ message: "Customer updated !" });
});

exports.getCustomer = requestAsyncHandler(async (req, res) => {
  if (!req.params.customerId) throw new CustomerNotFound();
  const customer = await Customer.findOne({
    _id: req.params.customerId,
    org: req.params.orgId,
  });
  if (!customer) throw new CustomerNotFound();
  return res.status(200).json({ data: customer });
});

exports.getAllCustomer = requestAsyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search || "";
  if (search) filter.$text = { $search: search };

  const totalCustomers = await Customer.countDocuments(filter);
  const totalPages = Math.ceil(totalCustomers / limit);

  const skip = (page - 1) * limit;

  const customers = await Customer.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    page,
    limit,
    totalPages,
    total: totalCustomers,
    data: customers,
  });
});

exports.deleteCustomer = requestAsyncHandler(async (req, res) => {
  if (!req.params.customerId) throw new CustomerNotFound();
  const invoice = await Invoice.findOneAndDelete({
    customer: req.params.customerId,
    org: req.params.orgId,
  });
  if (invoice) throw new CustomerNotDelete({ reason: `Invoice is linked` });
  const quotation = await Quotation.findOneAndDelete({
    customer: req.params.customerId,
    org: req.params.orgId,
  });
  if (quotation) throw new CustomerNotDelete({ reason: `Quotation is linked` });
  const customer = await Customer.findOneAndDelete({
    _id: req.params.customerId,
    org: req.params.orgId,
  });
  if (!customer) throw new CustomerNotFound();
  return res.status(200).json({ message: "Customer deleted" });
});
