/*

shared pass
slow hash
pass names
common names: admin, email, website, database, facebook, ...
version: can change with a button "next one"
a color as checksum
always have a lower, upper, digit, and special character

seed = hash_slow( shared )
pass = hash( name + version )

20:15
*/
log = console.log

if(typeof sha3_256 === "undefined") {
    sha3_256 = require("./sha3").sha3_256
}

function hash(x) {
    return sha3_256.array(x)
}

function hash_slow(x) {
    return hash(x + "_slow")
}

function toVName(name, version) {
    return name + (version || "")
}

// 139 colors
var CSS_COLOR_NAMES = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle"]; // ,"Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

function makeColor(pass) {
    code = 0
    for(var i=0; i<pass.length; i++) {
        code += pass.charCodeAt(i) * (100+i)
    }
    index = code % CSS_COLOR_NAMES.length
    return CSS_COLOR_NAMES[ index ]
}

// 89 chars
CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&()*+,-./:;<=>?@[]_{|}'

function printable(bytes) {
    s = ""
    for(b of bytes) {
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

function makePass(seed, name) {
    //return seed +" | "+ name
    return printable( hash(seed + name) )
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
