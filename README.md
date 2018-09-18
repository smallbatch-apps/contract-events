# Ethereum Contract Events

## Quick Usage Guide

**Install from NPM:** `npm i contract-events`.

**Import and initalise object:**

```javascript
let DebugEvents = require('contract-events');
let debugEvents = new DebugEvents(Flight);
```

**Actual Usage in code**

```javascript
const tx = await flight.book(1, {from: customer});

debugEvents.setTx(tx);

let bookingEvents = debugEvents.getEvent('SeatBooked'); // or 
let bookingEvents = debugEvents.setTx(tx).getEvent('SeatBooked');
``` 

## The Purpose

Smart Contracts on the Ethereum network are not easily debugged. The application state of the EVM is difficult to inspect or debug. There’s no 	`console.log` or equivalent for the most basic of outputting to determine changes, values, or arguments. This makes debugging and development difficult, as it can be unclear why a modifier failed, etc.

To help pierce a hole in the black box that is the EVM, it can be useful to emit events. These events provide some way to surface data, either for debugging, or for testing.

```javascript
emit SeatBooked(flightId, seatOwner, seatUuid);
```

By emitting this event we are able to confirm that the uuid is what we expected, that the purchaser is as expected. If each `book()` function emits several SeatBooked events we can confirm the number of bookings, etc.

## More detailed usage instructions and examples

Current solutions for viewing or decoding the events from Ethereum are far from intuitive. Usage of this library is much simpler.

Initialise the class at the top of the test file.

```javascript
let debugEvents = new DebugEvents(Flight);
```

And it can be used to easily check transactions. Note that the transaction remains the same until replaced using setTx, so it can be queried for different events.

```javascript
let bookingEvents = debugEvents.setTx(tx).getEvent('SeatBooked');
```

Output:

```javascript
{ 
  event: 'SeatBooked',
  flightId: 'JQ570',
  owner: '0x8950bdd216b3aaa3a293bda2e0b76dc735caf89d',
  uuid: 'f151a5ab-f8b3-423b-bac0-e2e7d743194f'
}
```

This output is vastly more useful for debugging, as well as less surprising and awkward for unit testing. Data from the events can be asserted on, used for further requests of the contract.

The API is very flexible:

```javascript
const tx = await token.buy(3, {from: customer, value: TOKEN_PRICE * 3});

const purchaseEvents = debugEvents.setTx(tx).getEvents('TokenPurchase');
const balanceEvent = debugEvents.getEvent('BalanceUpdated');
const allEvents = debugEvents.getEvents();

assert.equal(purchaseEvents.length, 3);
assert.equal(purchaseEvents[0].owner, customer);
assert.isTrue(purchaseEvents[0].approved);
assert.equal(balanceEvent.newBalance, 3);
assert.equal(allEvents.length, 4);

```

## Installation and setup

This has been greatly simplified. There should be only a single command and no setup.

```bash
npm i contract-events
```

## Why use this instead of OpenZeppelin’s decodeLogs.js test helper?
I looked for something that did what I wanted and thought I found it in decodeLogs. But with all due respect to the OZ people, the developer ergonomics are awful.

```javascript
decodeLogs(logs, contract, address)
```
Usage seems obvious enough given my Flight contract as an example.

```javascript
const tx = await flight.book(1, {from: customer, value: SEAT_PRICE});

const decoded = decodeLogs(tx.logs, Flight, Flight.address);
```
This seems ok - if verbose. Why do I have to pass in Flight.address when I'm already passing in Flight? But it actually doesn’t work. This function expects `tx.receipts.logs` for *reasons*.

The output isn’t any better.

```bash
[ { logIndex: 0,
    transactionIndex: 0,
    transactionHash: '0x1b935adf8b4f893f7db12abb55ae6c94c5f9ae44c427a42f7ab5bc9175d30691',
    blockHash: '0x609df9952faa1bd1913b17d256b3018b6c00dca130c5fbc2419ba4519361c359',
    blockNumber: 1182,
    address: '0xb1beb80a44c5c07ce61b9b93bd3724adb77b3ce1',
    type: 'mined',
    event: 'SeatBooked',
    args:
     { flightId: '0x4a51353730000000000000000000000000000000000000000000000000000000',
       owner: '0x8950bdd216b3aaa3a293bda2e0b76dc735caf89d',
       uuid: '0x6663346632626136000000000000000000000000000000000000000000000000' } } 
]
```

Intuitive. It simply didn't solve the problem for me.
