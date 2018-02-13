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

function toVName(name, version) {
    return name + (version || "")
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

function encrypt(keyHex, ivUtf8, clearUtf8) {
    console.assert(keyHex.length == 64);
    var keyBytes = aesjs.utils.hex.toBytes(keyHex);
    var ivBytes = sha3_256.array("iv" + ivUtf8).slice(0, 16);
    var clearBytes = aesjs.utils.utf8.toBytes(clearUtf8);
    var paddedBytes = aesjs.padding.pkcs7.pad(clearBytes);
    var aesCtr = new aesjs.ModeOfOperation.cbc(keyBytes, ivBytes);
    var cipherBytes = aesCtr.encrypt(paddedBytes);
    var cipherHex = aesjs.utils.hex.fromBytes(cipherBytes);
    return cipherHex;
}

function decrypt(keyHex, ivUtf8, cipherHex) {
    console.assert(keyHex.length == 64);
    var keyBytes = aesjs.utils.hex.toBytes(keyHex);
    var ivBytes = sha3_256.array("iv" + ivUtf8).slice(0, 16);
    var cipherBytes = aesjs.utils.hex.toBytes(cipherHex);
    var aesCtr = new aesjs.ModeOfOperation.cbc(keyBytes, ivBytes);
    var paddedBytes = aesCtr.decrypt(cipherBytes);
    var clearBytes = aesjs.padding.pkcs7.strip(paddedBytes);
    var clearUtf8 = aesjs.utils.utf8.fromBytes(clearBytes);
    return clearUtf8
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
    version = 0

    function cb(next, seed) {
        if(next) return next();

        for(name of names) {
            vName = toVName(name, version)
            pass = makePass(seed, vName)
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