class UmNotFound extends Error {
  constructor() {
    super();
    this.code = 404;
    this.name = "UmNotFound";
  }
}

class CannotRemoveDefaultUnit extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "CannotRemoveDefaultUnit";
  }
}

class UnitLinkedToProduct extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "UnitLinkedToProduct";
  }
}

class UnitLinkedToInvoice extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "UnitLinkedToInvoice";
  }
}

class UnitLinkedToPurchase extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "UnitLinkedToPurchase";
  }
}

class UnitLinkedToPurchaseOrder extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "UnitLinkedToPurchaseOrder";
  }
}

class UnitLinkedToProformaInvoice extends Error {
  constructor() {
    super();
    this.code = 400;
    this.name = "UnitLinkedToProformaInvoice";
  }
}

module.exports = {
  UmNotFound,
  CannotRemoveDefaultUnit,
  UnitLinkedToProduct,
  UnitLinkedToInvoice,
  UnitLinkedToPurchase,
  UnitLinkedToPurchaseOrder,
  UnitLinkedToProformaInvoice,
};
