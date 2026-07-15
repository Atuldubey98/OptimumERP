class TaxNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "TaxNotFound";
  }
}

class CannotRemoveDefaultTax extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "CannotRemoveDefaultTax";
  }
}

class TaxLinkedToGroupedTax extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "TaxLinkedToGroupedTax";
  }
}

class TaxLinkedToInvoice extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "TaxLinkedToInvoice";
  }
}

class TaxLinkedToPurchase extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "TaxLinkedToPurchase";
  }
}

class TaxLinkedToPurchaseOrder extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "TaxLinkedToPurchaseOrder";
  }
}

class TaxLinkedToProformaInvoice extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "TaxLinkedToProformaInvoice";
  }
}

module.exports = {
  TaxNotFound,
  CannotRemoveDefaultTax,
  TaxLinkedToGroupedTax,
  TaxLinkedToInvoice,
  TaxLinkedToPurchase,
  TaxLinkedToPurchaseOrder,
  TaxLinkedToProformaInvoice,
};
