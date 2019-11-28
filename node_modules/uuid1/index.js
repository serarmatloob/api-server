var random = require('./random');
var repeat = require('repeat-string');

function digits(value, bytes) {
    
    // Converts the value to a string binary representation
    var binValueStr = value.toString(2);  
    
    // Generate an string with zero values    
    var zeroPad = repeat('0000', bytes);
    
    // Pad the binary value withe the zeros on the left
    binValueStr = zeroPad + binValueStr;
 
    // Take N bytes from the right, adding a '1' on the left
    binValueStr = '1' + binValueStr.substring(binValueStr.length - (4 * bytes), binValueStr.length);
    
    return parseInt(binValueStr, 2).toString(16).substring(1);   
}
        
function getTimeBasedBlocks(millis, addNanos) {
    
    // Convert millis to nanos
    var nanos = millis * 10000;
    
    // Add random nanoseconds
    if (addNanos !== 0) {
        nanos += addNanos;
    }
    
    // Convert the nanos to binary string
    var nanosBinString = nanos.toString(2);
    
    // Get firts block
    var timeBasedBlockValue = digits(parseInt(nanosBinString.substring(0, nanosBinString.length - 32), 2), 8);
    timeBasedBlockValue += '-';
    
    // Get second block
    timeBasedBlockValue += digits(parseInt(nanosBinString.substring(0, nanosBinString.length - 16), 2), 4);
    timeBasedBlockValue += '-';
    
    // Get third block: Random part
    timeBasedBlockValue += digits(parseInt(nanosBinString, 2), 4);
    
    return timeBasedBlockValue;
}

exports.UUID1 = function() {
    
    // Get the current millis
    var millis = Date.now();
    
    // Return the value
    return exports.fromMillisUUID1(millis);
}

exports.fromMillisUUID1 = function(millis) {
    
    // Generate the time based blocks adding a random number of nanoseconds
    var uuidString = getTimeBasedBlocks(millis, random.randomInt(0, 10000));
    uuidString += '-';

    // Convert millis to nanos
    var nanos = millis * 10000;
    
    // Add random nanoseconds
    var randomNanos = random.randomInt(0, 10000);
    nanos += randomNanos;
    
    // Convert the nanos to binary string
    var nanosBinString = nanos.toString(2);
    
    // Get forth block
    uuidString += digits(parseInt(nanosBinString, 2), 4);
    uuidString += '-';
    
    // Get ffith block
    uuidString += digits(parseInt(nanosBinString, 2), 12);
    
    return uuidString;
}

exports.maxUUID1 = function(millis) {
    
    // Generate the time based blocks
    var uuidString = getTimeBasedBlocks(millis, 9999);
    
    // Add the forth and fifth blocks
    uuidString += '-ffff-ffffffffffff';
    
    return uuidString;
}

exports.minUUID1 = function(millis) {
    
    // Generate the time based blocks
    var uuidString = getTimeBasedBlocks(millis, 0);
    
    // Add the forth and fifth blocks
    uuidString += '-0000-000000000000';
    
    return uuidString;
}