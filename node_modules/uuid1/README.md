# uuid1

Simple Node module that allows to generate time based UUIDs. 
This kind of UUIDs are very useful when it's needed to generate unique identifiers sortable by time.

## Usage
```javascript
var uuid1 = require('uuid1');

// Generate an UUID (as a string value)
console.log(uuid1.UUID1());
// Prints: 0033a313-c4db-7ccc-7080-a313c4db7080

// Generate an UUID from millis 
var currentMillis = Date.now();
console.log(uuid1.fromMillisUUID1(currentMillis));
// Prints: 0033a311-c34a-7bc0-8ad4-a311c34a8ad4

// Generate the max UUID from millis
console.log(uuid1.maxUUID1(currentMillis));
// Prints: 0033a311-c34a-9560-ffff-ffffffffffff

// Generate the min UUID from millis
console.log(uuid1.minUUID1(currentMillis));
// Prints: 0033a311-c34a-6e50-0000-000000000000
```

## Installing

Via [npm](http://github.com/isaacs/npm):

```bash
npm install uuid1
```

Via git:

```bash
git clone https://github.com/touchvie/node-uuid1.git
```