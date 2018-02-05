/*

shared pass
slow hash
common account names: admin, email, website, database, ...
version: can change with a button "next one"
color checksums
always have a lower, upper, digit, and special character

*/

hashCount = 100000



log = console.log

if(typeof sha3_256 === "undefined") {
    sha3_256 = require("./sha3").sha3_256
}

function hash_slow(x) {
    h = sha3_256.buffer(x)
    for(var i=2; i < hashCount; i++) {
        h = sha3_256.buffer(h);
    }
    return sha3_256(h)
}

function toVName(name, version) {
    return name + (version || "")
}

// 139 colors
//var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle"]; // ,"Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
// 16 colors
var CSS_COLOR_NAMES = ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b"];
var MAX_COLORS = CSS_COLOR_NAMES.length

function makeColor(s) {
    code = 0
    for(var i=0; i<s.length; i++) {
        code += s.charCodeAt(i) * (100+i)
    }
    return CSS_COLOR_NAMES[ code % MAX_COLORS ]
}

// 64 chars
CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-'

function printable(bytes) {
    s = ""
    for(b of bytes.slice(0, 20)) {
        char = CHARS[ b % CHARS.length ]
        s += char
    }
    return s
}

/**
 * Must start with a letter and contain all types of characters.
 */
function validate(pass) {
    return true
}

function makeSeed(master) {
    return hash_slow(master)
}

function makePass(seed, name) {
    //return seed +" | "+ name
    return printable( sha3_256.array(seed + name) )
}

if(typeof process !== "undefined") {
    // Test
    shared = "team-pbssword"
    console.log("Color:", makeColor(shared))

    names = ["email", "website"]
    version = 0
    seed = hash_slow(shared)

    for(name of names) {
        vName = toVName(name, version)
        pass = makePass(seed, vName)
        console.log(vName, "\t", pass)
    }
}
