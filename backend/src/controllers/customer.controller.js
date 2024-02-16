const { createCustomerDto, updateCustomerDto } = require("../dto/customer.dto");
const { CustomerNotFound } = require("../errors/customer.error");
const { OrgNotFound } = require("../errors/org.error");
const requestAsyncHandler = require("../handlers/requestAsync.handler");
const Customer = require("../models/customer.model");

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
  const filter = {
    org: req.params.orgId,
  };
  const search = req.query.search || "";
  if (search) filter.$text = { $search: search };
  const customers = await Customer.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({
    data: customers,
  });
});

exports.deleteCustomer = requestAsyncHandler(async (req, res) => {
  if (!req.params.customerId) throw new CustomerNotFound();
  const customer = await Customer.findOneAndDelete({
    _id: req.params.customerId,
    org: req.params.orgId,
  });
  if (!customer) throw new CustomerNotFound();
  return res.status(200).json({ message: "Customer deleted" });
});
