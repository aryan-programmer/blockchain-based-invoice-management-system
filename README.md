# blockchain-based-invoice-management-system

A blockchain based invoice management system for vendors to track all their customers' invoices.

This project is the CLI API of the “blockchain-based-invoice-management-system”.

This application is to be used by manufacturers and vendors so as to keep a log of all their customers’ invoices.
Any shopkeeper can add an invoice, which will be signed by the shopkeeper’s private key, so as to prevent tampering by other shopkeepers. This invoice will be broadcasted to all the shopkeeper’s peers. 
Any vendor can mine the set of invoices in the pool of invoices. This will add the set of invoices to the block chain thereby confirming the invoices in the pool.

A vendor will only have to input the invoice details like the invoice number, the purchaser’s details and the product’s details. 
The purchase’s details are phone number, name, and whether or not the purchaser is an another vendor. 
The product details only need to be the name, quantity, cost, and tax percentage. 
An individual product’s tax price and total cost will be calculated by the application. The invoice’s grand total cost will also be automatically calculated.

## Getting started

First run:

```
yarn global add tsc
yarn install
```

To install all the dependencies
Then run:

```
tsc
```

To convert all the TS file to JS files.

### Generating keys

```
yarn app gen-keys --public-key-file-path <public-key-file=sign-public-key.pem> --private-key-file-path <private-key-file=sign-private-key.pem>
```

And then enter the password in the prompt shown.
Or input the password with `--password <password>`.

### Starting the server API

```
yarn app p2p --port <server-api-port> --p2p-port <p2p-socket-port> --peers ws:\\<peer-address>:<p2p-socket-port>[,ws:\\<peer-address>:<p2p-socket-port>...] --public-key-file-path <public-key-file=sign-public-key.pem> --private-key-file-path <private-key-file=sign-private-key.pem>
```

And then enter the password to decrypt the private key in the prompt then shown.
Or input the password with `--password <password>`.