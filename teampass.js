/*

shared pass
slow hash
common account names: admin, email, website, database, ...
version: can change with a button "next one"
color checksums
always have a lower, upper, digit, and special character

*/

hashCount = 100000
hashPrempt = 10000

log = console.log

if(typeof sha3_256 === "undefined") {
    sha3_256 = require("./sha3").sha3_256
}

// Bytes utils
// From https://github.com/ricmoo/aes-js/blob/583860cc04ca84e67b21bdffe9b9494da8fb0162/index.js

function checkInt(value) {
    return (parseInt(value) === value);
}

function checkInts(arrayish) {
    if (!checkInt(arrayish.length)) { return false; }

    for (var i = 0; i < arrayish.length; i++) {
        if (!checkInt(arrayish[i]) || arrayish[i] < 0 || arrayish[i] > 255) {
            return false;
        }
    }

    return true;
}

function coerceArray(arg, copy) {

    // ArrayBuffer view
    if (arg.buffer && ArrayBuffer.isView(arg) && arg.name === 'Uint8Array') {

        if (copy) {
            if (arg.slice) {
                arg = arg.slice();
            } else {
                arg = Array.prototype.slice.call(arg);
            }
        }

        return arg;
    }

    // It's an array; check it is a valid representation of a byte
    if (Array.isArray(arg)) {
        if (!checkInts(arg)) {
            throw new Error('Array contains invalid value: ' + arg);
        }

        return new Uint8Array(arg);
    }

    // Something else, but behaves like an array (maybe a Buffer? Arguments?)
    if (checkInt(arg.length) && checkInts(arg)) {
        return new Uint8Array(arg);
    }

    throw new Error('unsupported array-like object');
}

function createArray(length) {
    return new Uint8Array(length);
}

function copyArray(sourceArray, targetArray, targetStart, sourceStart, sourceEnd) {
    if (sourceStart != null || sourceEnd != null) {
        if (sourceArray.slice) {
            sourceArray = sourceArray.slice(sourceStart, sourceEnd);
        } else {
            sourceArray = Array.prototype.slice.call(sourceArray, sourceStart, sourceEnd);
        }
    }
    targetArray.set(sourceArray, targetStart);
}

function concatArray(a, b) {
    var out = new Uint8Array(a.length + b.length);
    out.set(a);
    out.set(b, a.length);
    return out
}

function utf8ToBytes(text) {
    var result = [], i = 0;
    text = encodeURI(text);
    while (i < text.length) {
        var c = text.charCodeAt(i++);

        // if it is a % sign, encode the following 2 bytes as a hex value
        if (c === 37) {
            result.push(parseInt(text.substr(i, 2), 16))
            i += 2;

        // otherwise, just the actual byte
        } else {
            result.push(c)
        }
    }

    return coerceArray(result);
}

function utf8FromBytes(bytes) {
    var result = [], i = 0;

    while (i < bytes.length) {
        var c = bytes[i];

        if (c < 128) {
            result.push(String.fromCharCode(c));
            i++;
        } else if (c > 191 && c < 224) {
            result.push(String.fromCharCode(((c & 0x1f) << 6) | (bytes[i + 1] & 0x3f)));
            i += 2;
        } else {
            result.push(String.fromCharCode(((c & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f)));
            i += 3;
        }
    }

    return result.join('');
}

function hexToBytes(text) {
    var result = [];
    for (var i = 0; i < text.length; i += 2) {
        result.push(parseInt(text.substr(i, 2), 16));
    }

    return result;
}

// http://ixti.net/development/javascript/2011/11/11/base64-encodedecode-of-utf8-in-browser-with-js.html
var _Hex = '0123456789abcdef';

function hexFromBytes(bytes) {
        var result = [];
        for (var i = 0; i < bytes.length; i++) {
            var v = bytes[i];
            result.push(_Hex[(v & 0xf0) >> 4] + _Hex[v & 0x0f]);
        }
        return result.join('');
}

function xor(aBytes, bBytes) {
    console.assert(aBytes.length === bBytes.length)
    var out = createArray(aBytes.length)
    for(var i = 0; i < out.length; i++) {
        out[i] = aBytes[i] ^ bBytes[i]
    }
    return out
}

function randomBytes(n) {
    var buf = new Uint8Array(n);
    window.crypto.getRandomValues(buf);
    return buf
}

// END bytes utils

var ivSize = 4

function encrypt(seedHex, clearUtf8) {
    var seedBytes = hexToBytes(seedHex)
    var ivBytes = randomBytes(ivSize)
    var clearBytes = utf8ToBytes(clearUtf8)
    var bits = clearBytes.length * 8
    var streamBytes = shake256.array(concatArray(seedBytes, ivBytes), bits)
    var cipherBytes = xor(streamBytes, clearBytes)
    var ivCipherBytes = concatArray(ivBytes, cipherBytes)
    console.log(seedBytes, ivBytes, clearBytes, cipherBytes, ivCipherBytes)
    var ivCipherHex = hexFromBytes(ivCipherBytes)
    return ivCipherHex
}

function decrypt(seedHex, ivCipherHex) {
    var seedBytes = hexToBytes(seedHex)
    var ivCipherBytes = hexToBytes(ivCipherHex)
    var ivBytes = ivCipherBytes.slice(0, ivSize)
    var cipherBytes = ivCipherBytes.slice(ivSize)
    var bits = cipherBytes.length * 8
    var streamBytes = shake256.array(concatArray(seedBytes, ivBytes), bits)
    var clearBytes = xor(streamBytes, cipherBytes)
    var clearUtf8 = utf8FromBytes(clearBytes)
    return clearUtf8
}


// 139 colors
//var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle"]; // ,"Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
// 16 colors
var CSS_COLOR_NAMES = ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b"];
var MAX_COLORS = CSS_COLOR_NAMES.length

function makeCode(s) {
    return sha3_256.array("code" + s)[0]
}

function makeColor(s) {
    return CSS_COLOR_NAMES[ makeCode(s) % MAX_COLORS ]
}

// 64 characters. 6 bits/char. 64 must divide 256 for uniformity.
CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-'

/** Passwords of 18 characters, or 108 bits. Add "+1" to pass silly password rules. */
function printable(bytes) {
    s = ""
    for(b of bytes.slice(0, 18)) {
        char = CHARS[ b % CHARS.length ]
        s += char
    }
    s += "+1"
    return s
}

/**
 * Must start with a letter and contain all types of characters.
 */
function validate(pass) {
    return true
}

function makeSeed(master) {
    h = sha3_256.buffer("teampass" + master)
    for(var i=2; i < hashCount; i++) {
        h = sha3_256.buffer(h);    
    }
    return sha3_256(h)
}

function makeSeedAsync(master, progressCb) {
    var h = sha3_256.buffer("teampass" + master)  // First hash, converting to buffer.
    var i = 2  // Count the first and last hashings.
    var nextStop = i

    function round() {
        nextStop += hashPrempt
        if(nextStop > hashCount) nextStop = hashCount;

        for(; i < nextStop; i++) {
            h = sha3_256.buffer(h);
        }

        if(i === hashCount) {
            // Finished!
            progressCb(null, sha3_256(h))  // Last hash, converting to string.
        } else {
            // Report progress and wait for the callback to start the next round
            progressCb(round, null)
        }
    }

    progressCb(round, null)
}

function makePass(seed, name) {
    return printable( sha3_256.array(seed + name) )
}

function makeKey(seed, name) {
    return "0x" + sha3_256("hex" + seed + name)
}

function makePin(seed, name) {
    var h = sha3_256.array("pin" + seed + name)
    var digits = []
    for(var i = 0; digits.length < 6 && i < h.length; i++) {
        // 250 is a multiple of 10. If the byte is greater, skip it and take the next one.
        if(h[i] < 250) {
            digits.push( h[i] % 10 )
        }
    }
    return digits.join("")
}

function selftest() {
    // Test
    master = "team-pbssword"
    console.log("Master:", master)
    console.log("Color:", makeColor(master))

    names = ["email", "website"]

    function cb(next, seed) {
        if(next) return next();

        for(name of names) {
            pass = makePass(seed, name)
            console.log(vName, "\t", pass)
        }
    }

    // Sync
    cb(null, makeSeed(master))
    // Async
    makeSeedAsync(master, cb)
}

if(typeof process !== "undefined") {
    selftest()
}