require("core-js/modules/es6.function.name.js");
require("core-js/modules/es6.array.map.js");
require("core-js/modules/es6.math.sign.js");
require("core-js/modules/es6.array.filter.js");
require("core-js/modules/es6.regexp.split.js");
require("core-js/modules/es6.symbol.js");
require("core-js/modules/es6.array.from.js");
require("core-js/modules/es6.string.iterator.js");
require("core-js/modules/es6.object.to-string.js");
require("core-js/modules/es6.array.iterator.js");
require("core-js/modules/web.dom.iterable.js");
require("core-js/modules/es6.promise.js");
require("core-js/modules/es6.array.slice.js");
var $2K9WE$picomodal = require("picomodal");
require("core-js/modules/es6.number.constructor.js");
require("core-js/modules/es6.array.find.js");
require("core-js/modules/es6.string.includes.js");
require("core-js/modules/es7.array.includes.js");
require("core-js/modules/es6.object.get-prototype-of.js");
require("core-js/modules/es6.reflect.construct.js");
var $2K9WE$events = require("events");
require("core-js/modules/es6.regexp.to-string.js");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}














var $eed7ea189d937794$var$colorMarkers = null;
if (typeof L != 'undefined') $eed7ea189d937794$var$colorMarkers = {
    blueIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    }),
    goldIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    }),
    redIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    }),
    greenIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    }),
    orangeIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    }),
    yellowIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    }),
    violetIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    }),
    greyIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    }),
    blackIcon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        iconSize: [
            25,
            41
        ],
        iconAnchor: [
            12,
            41
        ],
        popupAnchor: [
            1,
            -34
        ],
        shadowSize: [
            41,
            41
        ]
    })
};
function $eed7ea189d937794$export$bead366a0263e1bd(color) {
    switch(color){
        case "green":
            return $eed7ea189d937794$var$colorMarkers.greenIcon;
        case "black":
            return $eed7ea189d937794$var$colorMarkers.blackIcon;
        case "blue":
            return $eed7ea189d937794$var$colorMarkers.blueIcon;
        case "grey":
            return $eed7ea189d937794$var$colorMarkers.greyIcon;
        case "violet":
            return $eed7ea189d937794$var$colorMarkers.violetIcon;
        case "yellow":
            return $eed7ea189d937794$var$colorMarkers.yellowIcon;
        case "red":
            return $eed7ea189d937794$var$colorMarkers.redIcon;
        case "orange":
            return $eed7ea189d937794$var$colorMarkers.orangeIcon;
        case "gold":
            return $eed7ea189d937794$var$colorMarkers.goldIcon;
        default:
            return new L.Icon.Default();
    }
}

































function $6be315c4bb6cad33$var$_newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) throw new TypeError("Cannot instantiate an arrow function");
}
function $6be315c4bb6cad33$var$_classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}
function $6be315c4bb6cad33$var$_defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function $6be315c4bb6cad33$var$_createClass(Constructor, protoProps, staticProps) {
    if (protoProps) $6be315c4bb6cad33$var$_defineProperties(Constructor.prototype, protoProps);
    if (staticProps) $6be315c4bb6cad33$var$_defineProperties(Constructor, staticProps);
    return Constructor;
}
function $6be315c4bb6cad33$var$_defineProperty(obj, key, value) {
    if (key in obj) Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
    });
    else obj[key] = value;
    return obj;
}
var $6be315c4bb6cad33$export$b1060344d92088c9 = /*#__PURE__*/ function() {
    function $6be315c4bb6cad33$export$b1060344d92088c9(query) {
        $6be315c4bb6cad33$var$_classCallCheck(this, $6be315c4bb6cad33$export$b1060344d92088c9);
        $6be315c4bb6cad33$var$_defineProperty(this, "queryObject", void 0);
        this.queryObject = query;
    }
    /**
   * Returns a string for a sensorthings server query
   * @param main defaults to true, used for specifying if the queries should be appended to the end or added inside the brackets
   * @returns link prefix
   */ $6be315c4bb6cad33$var$_createClass($6be315c4bb6cad33$export$b1060344d92088c9, [
        {
            key: "toString",
            value: function toString() {
                var _this = this;
                var main = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
                var url = this.queryObject.entityType;
                var prefix = []; // Adding id if present
                if (this.queryObject.id) {
                    if (main) {
                        url = "".concat(url, "(").concat(this.queryObject.id, ")");
                        delete this.queryObject.id;
                    } else //If not in main, no other attributes can be added
                    return "".concat(this.queryObject.entityType, "(").concat(this.queryObject.id, ")");
                }
                if (this.queryObject.pathSuffix) url = "".concat(url, "/").concat(this.queryObject.pathSuffix);
                for(var key in this.queryObject){
                    //Remove empty properties
                    if (!this.queryObject[key] && this.queryObject[key] != 0) continue; //Select
                    if (key == 'select') {
                        prefix.push("$select=".concat(this.queryObject.select.join(',')));
                        continue;
                    } //Expand
                    if (key == 'expand') {
                        prefix.push("$expand=".concat(this.queryObject.expand.map((function(queryObject) {
                            $6be315c4bb6cad33$var$_newArrowCheck(this, _this);
                            return new $6be315c4bb6cad33$export$b1060344d92088c9(queryObject).toString(false);
                        }).bind(this)).join(',')));
                        continue;
                    } //Every other property
                    if (key != 'entityType' && key != 'pathSuffix') prefix.push("$".concat(key, "=").concat(this.queryObject[key].toString()));
                } //Check if a prefix is present
                if (prefix.length == 0) return url;
                 //Return right url string
                if (main) return "".concat(url, "?").concat(prefix.join('&'));
                else return "".concat(url, "(").concat(prefix.join(';'), ")");
            }
        }
    ]);
    return $6be315c4bb6cad33$export$b1060344d92088c9;
}();


function $a3151f3127292a4a$var$_toConsumableArray(arr) {
    return $a3151f3127292a4a$var$_arrayWithoutHoles(arr) || $a3151f3127292a4a$var$_iterableToArray(arr) || $a3151f3127292a4a$var$_unsupportedIterableToArray(arr) || $a3151f3127292a4a$var$_nonIterableSpread();
}
function $a3151f3127292a4a$var$_nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function $a3151f3127292a4a$var$_unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return $a3151f3127292a4a$var$_arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return $a3151f3127292a4a$var$_arrayLikeToArray(o, minLen);
}
function $a3151f3127292a4a$var$_iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function $a3151f3127292a4a$var$_arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return $a3151f3127292a4a$var$_arrayLikeToArray(arr);
}
function $a3151f3127292a4a$var$_arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function $a3151f3127292a4a$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) resolve(value);
    else Promise.resolve(value).then(_next, _throw);
}
function $a3151f3127292a4a$var$_asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                $a3151f3127292a4a$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                $a3151f3127292a4a$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function $a3151f3127292a4a$var$_classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}
function $a3151f3127292a4a$var$_defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function $a3151f3127292a4a$var$_createClass(Constructor, protoProps, staticProps) {
    if (protoProps) $a3151f3127292a4a$var$_defineProperties(Constructor.prototype, protoProps);
    if (staticProps) $a3151f3127292a4a$var$_defineProperties(Constructor, staticProps);
    return Constructor;
}
function $a3151f3127292a4a$var$_defineProperty(obj, key, value) {
    if (key in obj) Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
    });
    else obj[key] = value;
    return obj;
}
var $a3151f3127292a4a$export$63ca1fabe621078 = /*#__PURE__*/ function() {
    function $a3151f3127292a4a$export$63ca1fabe621078(baseUrl) {
        $a3151f3127292a4a$var$_classCallCheck(this, $a3151f3127292a4a$export$63ca1fabe621078);
        $a3151f3127292a4a$var$_defineProperty(this, "baseUrl", void 0);
        this.baseUrl = baseUrl;
    }
    $a3151f3127292a4a$var$_createClass($a3151f3127292a4a$export$63ca1fabe621078, [
        {
            key: "getGeoJson",
            value: function getGeoJson(query) {
                var _this = this;
                var limit = query.top; //Only query the given top elements, if a top value is present
                if (query.top == undefined || query.top == null) query.top = 10000;
                 //Clone
                query = JSON.parse(JSON.stringify(query));
                return new Promise(/*#__PURE__*/ function() {
                    var _ref = $a3151f3127292a4a$var$_asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee(resolve, reject) {
                        var url, data, link, response, _data$value$dataArray, _data$value;
                        return regeneratorRuntime.wrap(function _callee$(_context) {
                            while(true)switch(_context.prev = _context.next){
                                case 0:
                                    _context.prev = 0;
                                    //Generate url
                                    url = "".concat(_this.baseUrl, "/").concat(new $6be315c4bb6cad33$export$b1060344d92088c9(query).toString()); //get data
                                    _context.next = 4;
                                    return fetch(url);
                                case 4:
                                    _context.next = 6;
                                    return _context.sent.json();
                                case 6:
                                    data = _context.sent;
                                    if (data.value[0] && data.value[0].dataArray) data.value = data.value[0];
                                    link = data['@iot.nextLink']; //Get data as long as a next link is present
                                case 9:
                                    if (!(link && (limit == undefined || data.value.length && data.value.length < limit || data.value.dataArray && data.value.dataArray.length < limit))) {
                                        _context.next = 19;
                                        break;
                                    }
                                    _context.next = 12;
                                    return fetch(link);
                                case 12:
                                    _context.next = 14;
                                    return _context.sent.json();
                                case 14:
                                    response = _context.sent;
                                    if (response.value[0] && response.value[0].dataArray) (_data$value$dataArray = data.value.dataArray).push.apply(_data$value$dataArray, $a3151f3127292a4a$var$_toConsumableArray(response.value[0].dataArray));
                                    else //Push data in existing value array
                                    (_data$value = data.value).push.apply(_data$value, $a3151f3127292a4a$var$_toConsumableArray(response.value));
                                     //Update next link
                                    link = response['@iot.nextLink'];
                                    _context.next = 9;
                                    break;
                                case 19:
                                    resolve(data);
                                    _context.next = 25;
                                    break;
                                case 22:
                                    _context.prev = 22;
                                    _context.t0 = _context["catch"](0);
                                    reject(_context.t0);
                                case 25:
                                case "end":
                                    return _context.stop();
                            }
                        }, _callee, null, [
                            [
                                0,
                                22
                            ]
                        ]);
                    }));
                    return function(_x, _x2) {
                        return _ref.apply(this, arguments);
                    };
                }());
            }
        }
    ]);
    return $a3151f3127292a4a$export$63ca1fabe621078;
}();


function $7d3fb054ca11f795$var$_typeof(obj1) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") $7d3fb054ca11f795$var$_typeof = function _typeof(obj) {
        return typeof obj;
    };
    else $7d3fb054ca11f795$var$_typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    return $7d3fb054ca11f795$var$_typeof(obj1);
}
function $7d3fb054ca11f795$var$_newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) throw new TypeError("Cannot instantiate an arrow function");
}
function $7d3fb054ca11f795$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) resolve(value);
    else Promise.resolve(value).then(_next, _throw);
}
function $7d3fb054ca11f795$var$_asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                $7d3fb054ca11f795$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                $7d3fb054ca11f795$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function $7d3fb054ca11f795$var$_createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
        if (Array.isArray(o) || (it = $7d3fb054ca11f795$var$_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            var F = function F() {
            };
            return {
                s: F,
                n: function n() {
                    if (i >= o.length) return {
                        done: true
                    };
                    return {
                        done: false,
                        value: o[i++]
                    };
                },
                e: function e(_e) {
                    throw _e;
                },
                f: F
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return {
        s: function s() {
            it = it.call(o);
        },
        n: function n() {
            var step = it.next();
            normalCompletion = step.done;
            return step;
        },
        e: function e(_e2) {
            didErr = true;
            err = _e2;
        },
        f: function f() {
            try {
                if (!normalCompletion && it["return"] != null) it["return"]();
            } finally{
                if (didErr) throw err;
            }
        }
    };
}
function $7d3fb054ca11f795$var$_unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return $7d3fb054ca11f795$var$_arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return $7d3fb054ca11f795$var$_arrayLikeToArray(o, minLen);
}
function $7d3fb054ca11f795$var$_arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function $7d3fb054ca11f795$var$_classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}
function $7d3fb054ca11f795$var$_defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function $7d3fb054ca11f795$var$_createClass(Constructor, protoProps, staticProps) {
    if (protoProps) $7d3fb054ca11f795$var$_defineProperties(Constructor.prototype, protoProps);
    if (staticProps) $7d3fb054ca11f795$var$_defineProperties(Constructor, staticProps);
    return Constructor;
}
function $7d3fb054ca11f795$var$_inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) throw new TypeError("Super expression must either be null or a function");
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) $7d3fb054ca11f795$var$_setPrototypeOf(subClass, superClass);
}
function $7d3fb054ca11f795$var$_setPrototypeOf(o1, p1) {
    $7d3fb054ca11f795$var$_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return $7d3fb054ca11f795$var$_setPrototypeOf(o1, p1);
}
function $7d3fb054ca11f795$var$_createSuper(Derived) {
    var hasNativeReflectConstruct = $7d3fb054ca11f795$var$_isNativeReflectConstruct();
    return function _createSuperInternal() {
        var Super = $7d3fb054ca11f795$var$_getPrototypeOf(Derived), result;
        if (hasNativeReflectConstruct) {
            var NewTarget = $7d3fb054ca11f795$var$_getPrototypeOf(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
        } else result = Super.apply(this, arguments);
        return $7d3fb054ca11f795$var$_possibleConstructorReturn(this, result);
    };
}
function $7d3fb054ca11f795$var$_possibleConstructorReturn(self, call) {
    if (call && ($7d3fb054ca11f795$var$_typeof(call) === "object" || typeof call === "function")) return call;
    else if (call !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
    return $7d3fb054ca11f795$var$_assertThisInitialized(self);
}
function $7d3fb054ca11f795$var$_assertThisInitialized(self) {
    if (self === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return self;
}
function $7d3fb054ca11f795$var$_isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
        }));
        return true;
    } catch (e) {
        return false;
    }
}
function $7d3fb054ca11f795$var$_getPrototypeOf(o2) {
    $7d3fb054ca11f795$var$_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return $7d3fb054ca11f795$var$_getPrototypeOf(o2);
}
function $7d3fb054ca11f795$var$_defineProperty(obj, key, value) {
    if (key in obj) Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
    });
    else obj[key] = value;
    return obj;
}
var $7d3fb054ca11f795$export$57b87f3e07d4bb90 = /*#__PURE__*/ function(_EventEmitter) {
    $7d3fb054ca11f795$var$_inherits($7d3fb054ca11f795$export$57b87f3e07d4bb90, _EventEmitter);
    var _super = $7d3fb054ca11f795$var$_createSuper($7d3fb054ca11f795$export$57b87f3e07d4bb90);
    //Stores the cached geojson
    function $7d3fb054ca11f795$export$57b87f3e07d4bb90(config) {
        var _this;
        $7d3fb054ca11f795$var$_classCallCheck(this, $7d3fb054ca11f795$export$57b87f3e07d4bb90);
        _this = _super.call(this);
        $7d3fb054ca11f795$var$_defineProperty($7d3fb054ca11f795$var$_assertThisInitialized(_this), "config", void 0);
        $7d3fb054ca11f795$var$_defineProperty($7d3fb054ca11f795$var$_assertThisInitialized(_this), "api", void 0);
        $7d3fb054ca11f795$var$_defineProperty($7d3fb054ca11f795$var$_assertThisInitialized(_this), "cache", void 0);
        _this.cache = [];
        _this.config = config;
        _this.api = new $a3151f3127292a4a$export$63ca1fabe621078(config.baseUrl);
        return _this;
    }
    /**
   * Converts the longitude to a OSM tile number
   * @param lon longitude
   * @param zoom current zoom level
   * @returns OSM tile number
   */ $7d3fb054ca11f795$var$_createClass($7d3fb054ca11f795$export$57b87f3e07d4bb90, [
        {
            key: "long2tile",
            value: function long2tile(lon, zoom) {
                return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
            }
        },
        {
            key: "lat2tile",
            value: function lat2tile(lat, zoom) {
                return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
            }
        },
        {
            key: "tile2long",
            value: function tile2long(x, z) {
                return x / Math.pow(2, z) * 360 - 180;
            }
        },
        {
            key: "tile2lat",
            value: function tile2lat(y, z) {
                var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
                return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
            }
        },
        {
            key: "coordinatesToOsm",
            value: function coordinatesToOsm(coordinate, zoom) {
                var lat = this.tile2long(this.long2tile(coordinate.lat, zoom), zoom);
                var lng = this.tile2lat(this.lat2tile(coordinate.lng, zoom), zoom);
                return {
                    lat: lat,
                    lng: lng
                };
            }
        },
        {
            key: "coordinatesToOsmBottom",
            value: function coordinatesToOsmBottom(coordinate, zoom) {
                var lat = this.tile2long(this.long2tile(coordinate.lat, zoom) + 1, zoom);
                var lng = this.tile2lat(this.lat2tile(coordinate.lng, zoom) + 1, zoom);
                return {
                    lat: lat,
                    lng: lng
                };
            }
        },
        {
            key: "getOSMBoundingBox",
            value: function getOSMBoundingBox(zoomLevel, boundingBox) {
                var topleft = {
                    lat: 0,
                    lng: 0
                };
                var bottomright = {
                    lat: 0,
                    lng: 0
                };
                var latTop = this.long2tile(boundingBox[0], zoomLevel);
                var longTop = this.lat2tile(boundingBox[1], zoomLevel);
                topleft.lat = this.tile2long(latTop + 1, zoomLevel);
                topleft.lng = this.tile2lat(longTop, zoomLevel);
                var latBottom = this.long2tile(boundingBox[2], zoomLevel);
                var longBottom = this.lat2tile(boundingBox[3], zoomLevel); //Getting the bottom right corner of the tile
                bottomright.lat = this.tile2long(latBottom, zoomLevel);
                bottomright.lng = this.tile2lat(longBottom + 1, zoomLevel);
                return [
                    topleft.lat,
                    topleft.lng,
                    bottomright.lat,
                    bottomright.lng
                ];
            }
        },
        {
            key: "getQuery",
            value: function getQuery(zoom) {
                //Check if it is a QueryObject
                if ("entityType" in this.config.queryObject) return this.config.queryObject;
                else {
                    //Get all queries
                    var range = this.config.queryObject; //Iterate through all
                    var _iterator = $7d3fb054ca11f795$var$_createForOfIteratorHelper(range), _step;
                    try {
                        for(_iterator.s(); !(_step = _iterator.n()).done;){
                            var rangeQuery = _step.value;
                            if (isNaN(Number(rangeQuery.zoomLevel))) {
                                //Object
                                var zoomObject = rangeQuery.zoomLevel; //to must not be specified
                                if (zoomObject.to) {
                                    //Check if it is in the given range
                                    if (zoom >= zoomObject.from && zoom <= zoomObject.to) return rangeQuery.query;
                                } else {
                                    //Check if it is greater than specified
                                    if (zoom >= zoomObject.from) return rangeQuery.query;
                                }
                            } else {
                                //Number
                                var number = rangeQuery.zoomLevel;
                                if (number == zoom) return rangeQuery.query;
                            }
                        }
                    } catch (err) {
                        _iterator.e(err);
                    } finally{
                        _iterator.f();
                    }
                    throw new Error("No Query specified for the zoomLevel: " + zoom);
                }
            }
        },
        {
            key: "getLayerData",
            value: function() {
                var _getLayerData = $7d3fb054ca11f795$var$_asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee2(zoom, boundingBox) {
                    var _this2 = this;
                    var correctedQuery, top, bottom, recs, promises, x, _loop, y, counts, toMarker;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while(true)switch(_context2.prev = _context2.next){
                            case 0:
                                //If all data is cached, no event would be emitted
                                this.emitChange(zoom); //Removing the reference to config.queryObject 
                                correctedQuery = JSON.parse(JSON.stringify(this.getQuery(zoom))); //Checking if the queried entityType is things
                                if (!(correctedQuery.entityType == 'Things')) {
                                    _context2.next = 7;
                                    break;
                                }
                                correctedQuery.select = [
                                    'id'
                                ];
                                correctedQuery.expand = [
                                    {
                                        entityType: "Locations"
                                    }
                                ];
                                _context2.next = 12;
                                break;
                            case 7:
                                if (!(correctedQuery.entityType == 'FeaturesOfInterest')) {
                                    _context2.next = 11;
                                    break;
                                }
                                //If it is a FeaturesOfInterest
                                correctedQuery.select = [
                                    'feature'
                                ];
                                _context2.next = 12;
                                break;
                            case 11:
                                throw new Error("Only Things and FeaturesOfInterest are supported");
                            case 12:
                                //Only query the count not the data
                                correctedQuery.count = true;
                                correctedQuery.top = 0; //Get the coordinates of the top left and bottom right
                                top = {
                                    lat: this.lat2tile(boundingBox[1], zoom),
                                    lng: this.long2tile(boundingBox[0], zoom)
                                };
                                bottom = {
                                    lat: this.lat2tile(boundingBox[3], zoom),
                                    lng: this.long2tile(boundingBox[2], zoom)
                                };
                                recs = [];
                                promises = []; //Iterate all OSM tiles
                                for(x = bottom.lng; x <= top.lng; x++){
                                    _loop = function _loop() {
                                        var _this3 = this;
                                        //Get top and bottom coordinates
                                        var T = {
                                            lat: _this2.tile2lat(y, zoom),
                                            lng: _this2.tile2long(x, zoom)
                                        };
                                        var B = {
                                            lat: _this2.tile2lat(y + 1, zoom),
                                            lng: _this2.tile2long(x + 1, zoom)
                                        }; //Clone the query object
                                        var QUERYCOPY = JSON.parse(JSON.stringify(correctedQuery)); //Get the ST filter
                                        var GEOFILTER = $7d3fb054ca11f795$var$polygonToFilter([
                                            [
                                                [
                                                    T.lng,
                                                    T.lat
                                                ],
                                                [
                                                    T.lng,
                                                    B.lat
                                                ],
                                                [
                                                    B.lng,
                                                    B.lat
                                                ],
                                                [
                                                    B.lng,
                                                    T.lat
                                                ],
                                                [
                                                    T.lng,
                                                    T.lat
                                                ]
                                            ]
                                        ], QUERYCOPY.entityType); //Append it to old filter if given
                                        if (QUERYCOPY.filter) QUERYCOPY.filter = "(".concat(QUERYCOPY.filter, ") and ").concat(GEOFILTER);
                                        else QUERYCOPY.filter = GEOFILTER;
                                         //Create a geojson polygon with tbe given coordinates
                                        var feature = {
                                            "type": "Feature",
                                            "geometry": {
                                                "type": "Polygon",
                                                "coordinates": [
                                                    [
                                                        [
                                                            T.lng,
                                                            T.lat
                                                        ],
                                                        [
                                                            T.lng,
                                                            B.lat
                                                        ],
                                                        [
                                                            B.lng,
                                                            B.lat
                                                        ],
                                                        [
                                                            B.lng,
                                                            T.lat
                                                        ],
                                                        [
                                                            T.lng,
                                                            T.lat
                                                        ]
                                                    ]
                                                ]
                                            },
                                            "properties": {
                                                "count": 0
                                            }
                                        }; //Check if a polygon is already present
                                        var existing = _this2.getCached(zoom).features.find((function(feature2) {
                                            $7d3fb054ca11f795$var$_newArrowCheck(this, _this3);
                                            return $7d3fb054ca11f795$var$compare_features(feature, feature2);
                                        }).bind(this)); //Check if polygon is cached
                                        if (!existing) promises.push(new Promise(/*#__PURE__*/ function() {
                                            var _ref = $7d3fb054ca11f795$var$_asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee(resolve, reject) {
                                                var data;
                                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                                    while(true)switch(_context.prev = _context.next){
                                                        case 0:
                                                            if (!(_this2.config.cluster || _this2.config.cluster == undefined)) {
                                                                _context.next = 22;
                                                                break;
                                                            }
                                                            _context.prev = 1;
                                                            _context.next = 4;
                                                            return _this2.api.getGeoJson(QUERYCOPY);
                                                        case 4:
                                                            data = _context.sent;
                                                            _context.next = 18;
                                                            break;
                                                        case 7:
                                                            _context.prev = 7;
                                                            _context.t0 = _context["catch"](1);
                                                            _context.prev = 9;
                                                            _context.next = 12;
                                                            return _this2.api.getGeoJson(QUERYCOPY);
                                                        case 12:
                                                            data = _context.sent;
                                                            _context.next = 18;
                                                            break;
                                                        case 15:
                                                            _context.prev = 15;
                                                            _context.t1 = _context["catch"](9);
                                                            console.error("Failed to fetch data", _context.t1);
                                                        case 18:
                                                            feature.properties.count = data["@iot.count"];
                                                            _this2.addToCache(zoom, feature);
                                                            _context.next = 23;
                                                            break;
                                                        case 22:
                                                            //Don't get the data if clustering is disabled
                                                            _this2.addToCache(zoom, feature, false);
                                                        case 23:
                                                            resolve(feature);
                                                        case 24:
                                                        case "end":
                                                            return _context.stop();
                                                    }
                                                }, _callee, null, [
                                                    [
                                                        1,
                                                        7
                                                    ],
                                                    [
                                                        9,
                                                        15
                                                    ]
                                                ]);
                                            }));
                                            return function(_x3, _x4) {
                                                return _ref.apply(this, arguments);
                                            };
                                        }()));
                                    };
                                    for(y = top.lat; y <= bottom.lat; y++)_loop();
                                }
                                _context2.next = 21;
                                return Promise.all(promises);
                            case 21:
                                counts = _context2.sent;
                                //Push all features to the recs array
                                counts.forEach((function(feature) {
                                    $7d3fb054ca11f795$var$_newArrowCheck(this, _this2);
                                    recs.push(feature);
                                }).bind(this));
                                toMarker = []; //Iterate all polygons
                                recs.forEach((function(feature) {
                                    $7d3fb054ca11f795$var$_newArrowCheck(this, _this2);
                                    //Check if markers should be loaded
                                    if (feature.properties.count < this.config.clusterMin || this.config.cluster == false) toMarker.push(feature.geometry.coordinates);
                                }).bind(this)); //Load markers
                                _context2.next = 27;
                                return this.getMarkers(toMarker, zoom);
                            case 27:
                            case "end":
                                return _context2.stop();
                        }
                    }, _callee2, this);
                }));
                function getLayerData(_x, _x2) {
                    return _getLayerData.apply(this, arguments);
                }
                return getLayerData;
            }()
        },
        {
            key: "getMarkers",
            value: function() {
                var _getMarkers = $7d3fb054ca11f795$var$_asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee4(toMarker, zoom) {
                    var _this4 = this;
                    var markerQuery, datastreamQuery, promises, _iterator2, _step2, cord, query;
                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                        while(true)switch(_context4.prev = _context4.next){
                            case 0:
                                if (!(toMarker.length != 0)) {
                                    _context4.next = 10;
                                    break;
                                }
                                //Remove reference to config.queryObject
                                markerQuery = JSON.parse(JSON.stringify(this.getQuery(zoom)));
                                markerQuery.top = 1000;
                                if (markerQuery.entityType == "Things") {
                                    //Check if expand is specified in the queryObject
                                    if (!markerQuery.expand) markerQuery.expand = []; //Check if a queryObject to expand the datastream with id and name is specified
                                    datastreamQuery = markerQuery.expand.find((function(expand) {
                                        $7d3fb054ca11f795$var$_newArrowCheck(this, _this4);
                                        return expand.entityType == 'Datastreams';
                                    }).bind(this)); //Check if a datastream query is specified
                                    if (!datastreamQuery) //Add expand
                                    markerQuery.expand.push({
                                        entityType: "Datastreams",
                                        select: [
                                            "id",
                                            "name",
                                            "unitOfMeasurement"
                                        ],
                                        expand: [
                                            {
                                                entityType: 'ObservedProperty'
                                            }
                                        ]
                                    });
                                    else {
                                        if (!datastreamQuery.select) datastreamQuery.select = [
                                            "id",
                                            "name",
                                            "unitOfMeasurement"
                                        ];
                                        if (!datastreamQuery.select.includes("id")) datastreamQuery.select.push("id");
                                        if (!datastreamQuery.select.includes("name")) datastreamQuery.select.push("name");
                                        if (!datastreamQuery.select.includes("unitOfMeasurement")) datastreamQuery.select.push("unitOfMeasurement");
                                    } //Check if the Location was expanded
                                    if (!markerQuery.expand.some((function(expand) {
                                        $7d3fb054ca11f795$var$_newArrowCheck(this, _this4);
                                        return expand.entityType == 'Locations';
                                    }).bind(this))) markerQuery.expand.push({
                                        entityType: "Locations"
                                    });
                                } else {
                                    //Add feature to select, if it queries for the FeaturesOfInterest
                                    if (markerQuery.select && !markerQuery.select.includes('feature')) markerQuery.select.push('feature');
                                    if (!markerQuery.expand) markerQuery.expand = [
                                        {
                                            entityType: 'Observations',
                                            top: 1,
                                            expand: [
                                                {
                                                    entityType: 'Datastream',
                                                    select: [
                                                        'unitOfMeasurement',
                                                        'id'
                                                    ],
                                                    expand: [
                                                        {
                                                            entityType: 'ObservedProperty'
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ];
                                } //If a filter is already specified, append the geometry query to the old filter
                                if (markerQuery.filter) markerQuery.filter = "(".concat(markerQuery.filter, ") and ");
                                promises = []; //Iterate all polygons of the toMarker array
                                _iterator2 = $7d3fb054ca11f795$var$_createForOfIteratorHelper(toMarker);
                                try {
                                    for(_iterator2.s(); !(_step2 = _iterator2.n()).done;){
                                        cord = _step2.value;
                                        //Deep clone
                                        query = JSON.parse(JSON.stringify(markerQuery));
                                        if (!query.filter) query.filter = ""; //Apply filter
                                        query.filter += $7d3fb054ca11f795$var$polygonToFilter(cord, query.entityType); //Get data
                                        promises.push(new Promise(/*#__PURE__*/ function() {
                                            var _ref2 = $7d3fb054ca11f795$var$_asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee3(resolve, reject) {
                                                var _this5 = this;
                                                var markers;
                                                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                                    while(true)switch(_context3.prev = _context3.next){
                                                        case 0:
                                                            _context3.prev = 0;
                                                            _context3.next = 3;
                                                            return _this4.api.getGeoJson(query);
                                                        case 3:
                                                            markers = _context3.sent;
                                                            _context3.next = 17;
                                                            break;
                                                        case 6:
                                                            _context3.prev = 6;
                                                            _context3.t0 = _context3["catch"](0);
                                                            _context3.prev = 8;
                                                            _context3.next = 11;
                                                            return _this4.api.getGeoJson(query);
                                                        case 11:
                                                            markers = _context3.sent;
                                                            _context3.next = 17;
                                                            break;
                                                        case 14:
                                                            _context3.prev = 14;
                                                            _context3.t1 = _context3["catch"](8);
                                                            console.error("Failed to fetch data", _context3.t1);
                                                        case 17:
                                                            markers.value.forEach((function(marker) {
                                                                var _this6 = this;
                                                                $7d3fb054ca11f795$var$_newArrowCheck(this, _this5);
                                                                //Get the geoJson of the marker
                                                                var geoJson; //Check for the entityType
                                                                if (markerQuery.entityType == 'Things') geoJson = marker.Locations[0].location;
                                                                else geoJson = marker.feature; //Fix the geojson if it is not nested in a feature, because openlayers wouldn't save the properties 
                                                                if (geoJson.type != "Feature") geoJson = {
                                                                    "type": "Feature",
                                                                    "geometry": geoJson,
                                                                    "properties": geoJson.properties
                                                                };
                                                                 //Delete the Locations, so they are not in the geojson's properties
                                                                delete marker.Locations; //Add the properties
                                                                geoJson.properties = marker; //add getData object if not present
                                                                if (!marker.getData) marker.getData = []; //Check for the entityType
                                                                if (markerQuery.entityType == 'Things') {
                                                                    //Iterate through the datastreams
                                                                    var _iterator3 = $7d3fb054ca11f795$var$_createForOfIteratorHelper(marker.Datastreams), _step3;
                                                                    try {
                                                                        for(_iterator3.s(); !(_step3 = _iterator3.n()).done;){
                                                                            var datastream = _step3.value;
                                                                            _this4.addGetDataCallback(datastream, marker);
                                                                        }
                                                                    } catch (err) {
                                                                        _iterator3.e(err);
                                                                    } finally{
                                                                        _iterator3.f();
                                                                    }
                                                                } else {
                                                                    //Get the datastream of the FeatureOfInterest
                                                                    var DATASTREAM = marker.Observations[0].Datastream;
                                                                    _this4.addGetDataCallback(DATASTREAM, marker);
                                                                } //Check if the marker is already in the cache
                                                                if (!_this4.getCached(zoom).features.some((function(feature) {
                                                                    $7d3fb054ca11f795$var$_newArrowCheck(this, _this6);
                                                                    return $7d3fb054ca11f795$var$compare_features(geoJson, feature);
                                                                }).bind(this))) _this4.addToCache(zoom, geoJson);
                                                            }).bind(this));
                                                            resolve();
                                                        case 19:
                                                        case "end":
                                                            return _context3.stop();
                                                    }
                                                }, _callee3, this, [
                                                    [
                                                        0,
                                                        6
                                                    ],
                                                    [
                                                        8,
                                                        14
                                                    ]
                                                ]);
                                            }));
                                            return function(_x7, _x8) {
                                                return _ref2.apply(this, arguments);
                                            };
                                        }()));
                                    } //Await all promises
                                } catch (err) {
                                    _iterator2.e(err);
                                } finally{
                                    _iterator2.f();
                                }
                                _context4.next = 10;
                                return Promise.all(promises);
                            case 10:
                            case "end":
                                return _context4.stop();
                        }
                    }, _callee4, this);
                }));
                function getMarkers(_x5, _x6) {
                    return _getMarkers.apply(this, arguments);
                }
                return getMarkers;
            }()
        },
        {
            key: "addGetDataCallback",
            value: function addGetDataCallback(datastream, marker) {
                if (datastream) {
                    //Get the id
                    var id = datastream['@iot.id']; //Get the unit
                    var unitOfMeasurement = datastream.unitOfMeasurement; //Add the function, with the id as the key
                    marker.getData.push({
                        observedProperty: datastream.ObservedProperty.name,
                        getData: (function(configureQuery) {
                            var _this7 = this;
                            //Add query
                            var datastreamQuery = {
                                entityType: "Datastreams",
                                id: id,
                                pathSuffix: 'Observations'
                            }; //Use the return value of the callback function
                            datastreamQuery = configureQuery(datastreamQuery);
                            return new Promise(/*#__PURE__*/ function() {
                                var _ref3 = $7d3fb054ca11f795$var$_asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee5(resolve, reject) {
                                    var data;
                                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                                        while(true)switch(_context5.prev = _context5.next){
                                            case 0:
                                                _context5.next = 2;
                                                return _this7.api.getGeoJson(datastreamQuery);
                                            case 2:
                                                data = _context5.sent;
                                                //Add unit to the data object
                                                data.unitOfMeasurement = unitOfMeasurement;
                                                resolve(data);
                                            case 5:
                                            case "end":
                                                return _context5.stop();
                                        }
                                    }, _callee5);
                                }));
                                return function(_x9, _x10) {
                                    return _ref3.apply(this, arguments);
                                };
                            }());
                        }).bind(this)
                    });
                }
            }
        },
        {
            key: "getCached",
            value: function getCached(zoom) {
                if (this.config.cachingDuration) this.cache = this.cache.filter((function(cache) {
                    //Clone date
                    var date = new Date(cache.timestamp); //Add caching time
                    date.setSeconds(cache.timestamp.getSeconds() + this.config.cachingDuration); //Check if date should be removed
                    return date > new Date();
                }).bind(this));
                var toReturn = {
                    "type": "FeatureCollection",
                    "features": [],
                    zoom: zoom
                }; //Get all geojsons with the given zoom level
                var _iterator4 = $7d3fb054ca11f795$var$_createForOfIteratorHelper(this.cache), _step4;
                try {
                    for(_iterator4.s(); !(_step4 = _iterator4.n()).done;){
                        var cache1 = _step4.value;
                        if (cache1.zoom == zoom) toReturn.features.push(cache1.geoJson);
                    }
                } catch (err) {
                    _iterator4.e(err);
                } finally{
                    _iterator4.f();
                }
                return toReturn;
            }
        },
        {
            key: "addToCache",
            value: function addToCache(zoom, geoJson) {
                var emitEvent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
                this.cache.push({
                    geoJson: geoJson,
                    zoom: zoom,
                    timestamp: new Date()
                });
                if (emitEvent) this.emitChange(zoom);
            }
        },
        {
            key: "emitChange",
            value: function emitChange(zoom) {
                var _this8 = this;
                var toReturn = this.getCached(zoom); //Remove cluster that should not be displayed, but still cached
                toReturn.features = this.getCached(zoom).features.filter((function(feature) {
                    var _feature$properties, _feature$properties2, _feature$properties3;
                    $7d3fb054ca11f795$var$_newArrowCheck(this, _this8);
                    //Check if count is present, if not return the value
                    if (((_feature$properties = feature.properties) === null || _feature$properties === void 0 ? void 0 : _feature$properties.count) == undefined) return true; //Check if clustering is disabled
                    if (this.config.cluster == false) return ((_feature$properties2 = feature.properties) === null || _feature$properties2 === void 0 ? void 0 : _feature$properties2.count) == undefined; //Return only the polygons with a higher count as specified
                    return ((_feature$properties3 = feature.properties) === null || _feature$properties3 === void 0 ? void 0 : _feature$properties3.count) >= this.config.clusterMin;
                }).bind(this));
                this.emit('change', toReturn);
            }
        }
    ]);
    return $7d3fb054ca11f795$export$57b87f3e07d4bb90;
}($2K9WE$events.EventEmitter);
/**
 * 
 * @param f1 feature to be compared
 * @param f2 feature to be compared
 * @returns true if the features are the same
 */ function $7d3fb054ca11f795$var$compare_features(f1, f2) {
    var _f1$properties, _f2$properties, _f1$properties2, _f2$properties2;
    //Check if the type is the same
    if (f1.type != f2.type) return false;
    if ((_f1$properties = f1.properties) !== null && _f1$properties !== void 0 && _f1$properties['@iot.id'] || (_f2$properties = f2.properties) !== null && _f2$properties !== void 0 && _f2$properties['@iot.id']) return ((_f1$properties2 = f1.properties) === null || _f1$properties2 === void 0 ? void 0 : _f1$properties2['@iot.id']) == ((_f2$properties2 = f2.properties) === null || _f2$properties2 === void 0 ? void 0 : _f2$properties2['@iot.id']); //If feature is a point, the coordinates can be compared directly
    if (f1.coordinates) return $7d3fb054ca11f795$var$polygon_compare(f1.coordinates, f2.coordinates); //If it is a polygon or something else, the coordinates need to be gotten from the geometry object
    return $7d3fb054ca11f795$var$polygon_compare(f1.geometry.coordinates, f2.geometry.coordinates);
}
/**
 * Deep comparing two arrays
 * @param a1 Array to be compared
 * @param a2 Array to be compared
 * @returns true if the same
 */ function $7d3fb054ca11f795$var$polygon_compare(a1, a2) {
    //return a1.length === a2.length && a1.every(function (value: any, index: number) { return value === a2[index] })
    //return JSON.stringify(a1) === JSON.stringify(a2);
    if (!a2) return false; // compare lengths - can save a lot of time 
    if (a1.length != a2.length) return false;
    for(var i = 0, l = a1.length; i < l; i++){
        // Check if we have nested arrays
        if (a1[i] instanceof Array && a2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!$7d3fb054ca11f795$var$polygon_compare(a1[i], a2[i])) return false;
        } else if (a1[i] != a2[i]) // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
    }
    return true;
}
/**
 * Converts a polygon into a valid filter for a sensorthings API
 * @param multipolygon polygon or multipolygon to convert
 * @returns valid filter
 */ function $7d3fb054ca11f795$var$polygonToFilter(multipolygon, entityType) {
    var _this9 = this;
    return multipolygon.map((function(polygon) {
        var _this10 = this;
        $7d3fb054ca11f795$var$_newArrowCheck(this, _this9);
        //Check if polygon is a multipolygon
        if (polygon[0][0][0] != undefined) //Multipolygon
        polygon = polygon[0];
        return "geo.intersects(".concat(entityType == 'Things' ? 'Locations/location' : 'feature', ",geography'POLYGON ((").concat(polygon.map((function(array) {
            $7d3fb054ca11f795$var$_newArrowCheck(this, _this10);
            return array.join(' ');
        }).bind(this)).join(','), "))')");
    }).bind(this)).join(' or ');
} /**
 * Cached objects
 */ 


function $882b6d93070905b3$var$_slicedToArray(arr, i) {
    return $882b6d93070905b3$var$_arrayWithHoles(arr) || $882b6d93070905b3$var$_iterableToArrayLimit(arr, i) || $882b6d93070905b3$var$_unsupportedIterableToArray(arr, i) || $882b6d93070905b3$var$_nonIterableRest();
}
function $882b6d93070905b3$var$_nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function $882b6d93070905b3$var$_iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function $882b6d93070905b3$var$_arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}
function $882b6d93070905b3$var$_toConsumableArray(arr) {
    return $882b6d93070905b3$var$_arrayWithoutHoles(arr) || $882b6d93070905b3$var$_iterableToArray(arr) || $882b6d93070905b3$var$_unsupportedIterableToArray(arr) || $882b6d93070905b3$var$_nonIterableSpread();
}
function $882b6d93070905b3$var$_nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function $882b6d93070905b3$var$_unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return $882b6d93070905b3$var$_arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return $882b6d93070905b3$var$_arrayLikeToArray(o, minLen);
}
function $882b6d93070905b3$var$_iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function $882b6d93070905b3$var$_arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return $882b6d93070905b3$var$_arrayLikeToArray(arr);
}
function $882b6d93070905b3$var$_arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function $882b6d93070905b3$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) resolve(value);
    else Promise.resolve(value).then(_next, _throw);
}
function $882b6d93070905b3$var$_asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                $882b6d93070905b3$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                $882b6d93070905b3$var$asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function $882b6d93070905b3$var$_newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) throw new TypeError("Cannot instantiate an arrow function");
}
//Add the style of the loader
$882b6d93070905b3$var$addCss(".loader{border:16px solid #f3f3f3;border-top:16px solid #3498db;border-radius:50%;width:60px;height:60px;left:0;right:0;top:0;margin:auto;bottom:0;position:fixed;animation:spin 2s linear infinite}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}"); //Leaflet
if (typeof L !== "undefined") {
    var $882b6d93070905b3$var$countLayer;
    var $882b6d93070905b3$var$geojsonLayer; //Extend a LayerGroup
    L.Stam = L.LayerGroup.extend({
        initialize: function initialize(config) {
            var mapInterface = new $7d3fb054ca11f795$export$57b87f3e07d4bb90(config);
            var highlight;
            var cache = {
                type: 'FeatureCollection',
                features: []
            }; //Default style
            var style = {
                'default': {
                    'opacity': 0,
                    'fillOpacity': 0
                },
                'highlight': {
                    'color': 'red',
                    'opacity': 1
                }
            }; //Used for setting the style of a polygon when it is hovered
            var setHighlight = function setHighlight(layer) {
                var _this = this, _config$clusterStyle;
                // Check if something's highlighted, if so unset highlight
                if (highlight) unsetHighlight(highlight);
                 //Get the style from the config
                var configStyle = typeof config.clusterStyle == 'function' ? (function(feature) {
                    var _feature$_clusterStyl;
                    $882b6d93070905b3$var$_newArrowCheck(this, _this);
                    if (!feature._clusterStyleCache) feature._clusterStyleCache = {
                        style: config.clusterStyle(feature)
                    };
                    return (_feature$_clusterStyl = feature._clusterStyleCache.style) === null || _feature$_clusterStyl === void 0 ? void 0 : _feature$_clusterStyl.polygon.hover;
                }).bind(this)(layer.feature) : (_config$clusterStyle = config.clusterStyle) === null || _config$clusterStyle === void 0 ? void 0 : _config$clusterStyle.polygon.hover; //Add a transparent background, if no background was set
                $882b6d93070905b3$var$addTransparentBackground(configStyle); // Set highlight style on layer and store to variable
                layer.setStyle(configStyle !== null && configStyle !== void 0 ? configStyle : style.highlight);
                highlight = layer;
            }; //Remove the style after the mouse hovered over a polygon
            var unsetHighlight = function unsetHighlight(layer) {
                var _this2 = this, _config$clusterStyle2;
                //Get the style from the config
                var configStyle = typeof config.clusterStyle == 'function' ? (function(feature) {
                    var _feature$_clusterStyl2;
                    $882b6d93070905b3$var$_newArrowCheck(this, _this2);
                    if (!feature._clusterStyleCache) feature._clusterStyleCache = {
                        style: config.clusterStyle(feature)
                    };
                    return (_feature$_clusterStyl2 = feature._clusterStyleCache.style) === null || _feature$_clusterStyl2 === void 0 ? void 0 : _feature$_clusterStyl2.polygon["default"];
                }).bind(this)(layer.feature) : (_config$clusterStyle2 = config.clusterStyle) === null || _config$clusterStyle2 === void 0 ? void 0 : _config$clusterStyle2.polygon["default"]; //Add a transparent background, if no background was set
                $882b6d93070905b3$var$addTransparentBackground(configStyle); // Set default style and clear variable
                layer.setStyle(configStyle !== null && configStyle !== void 0 ? configStyle : style["default"]);
                highlight = null;
            }; //Called when the layer is added to the map
            this.on('add', function() {
                var _this3 = this;
                if (this._map != undefined) {
                    var map = this._map;
                    var zoom = map.getZoom();
                    $882b6d93070905b3$var$countLayer = L.layerGroup(); //Called on every feature of the map
                    var onEachFeature = (function onEachFeature(feature1, layer) {
                        var _feature$geometry, _this4 = this;
                        $882b6d93070905b3$var$_newArrowCheck(this, _this3);
                        //Check if a polygon is cluster generated by the library and a polygon
                        if (((_feature$geometry = feature1.geometry) === null || _feature$geometry === void 0 ? void 0 : _feature$geometry.type) == 'Polygon' && feature1.properties.count) {
                            var _config$clusterStyle3;
                            //Check for mouse hover
                            layer.on('mouseover', function() {
                                if (config.clusterMouseOver) config.clusterMouseOver(feature1); //Highlight the polygon with the given style
                                setHighlight(layer);
                            });
                            layer.on('mouseout', function() {
                                unsetHighlight(layer);
                            });
                            layer.on('click', function() {
                                //Configure a click on the cluster, if nothing is configured or nothing returned, the map zooms to the bounds of the polygon 
                                if (config.clusterClick) return config.clusterClick(feature1);
                                map.fitBounds(layer.getBounds());
                            }); //Get the style from the config
                            var configStyle = typeof config.clusterStyle == 'function' ? (function(feature) {
                                var _feature$_clusterStyl3;
                                $882b6d93070905b3$var$_newArrowCheck(this, _this4);
                                if (!feature._clusterStyleCache) feature._clusterStyleCache = {
                                    style: config.clusterStyle(feature)
                                };
                                return (_feature$_clusterStyl3 = feature._clusterStyleCache.style) === null || _feature$_clusterStyl3 === void 0 ? void 0 : _feature$_clusterStyl3.polygon["default"];
                            }).bind(this)(layer.feature) : (_config$clusterStyle3 = config.clusterStyle) === null || _config$clusterStyle3 === void 0 ? void 0 : _config$clusterStyle3.polygon["default"]; //Add a transparent background, if no background was set
                            $882b6d93070905b3$var$addTransparentBackground(configStyle); //Set the default style of a polygon
                            layer.setStyle(configStyle !== null && configStyle !== void 0 ? configStyle : style["default"]); //Get the bounds and calculate the center of the polygon
                            var bounds = layer.getBounds();
                            var lat = (bounds._northEast.lat + bounds._southWest.lat) / 2;
                            var lng = (bounds._northEast.lng + bounds._southWest.lng) / 2; //Position a circle in the center
                            var circle = L.circleMarker(L.latLng(lat, lng), {
                                radius: 127 / 3
                            }); //Add the count of things inside the polygon to the circle
                            circle.bindTooltip("<span>".concat(feature1.properties.count, "</span>"), {
                                permanent: true,
                                direction: "center",
                                className: 'count'
                            }); //Add the circle to the countLayer
                            $882b6d93070905b3$var$countLayer.addLayer(circle);
                        } else {
                            var defaultPopup = true; //Add a click event to the markers
                            layer.on('click', function() {
                                if (!layer.getPopup()) {
                                    //Bind popup with functions return if present
                                    if (config.markerClick) {
                                        var out = config.markerClick(feature1);
                                        if (out) {
                                            defaultPopup = false;
                                            layer.bindPopup(out).openPopup();
                                        }
                                    }
                                    if (defaultPopup) {
                                        //Default behavior 
                                        var div = document.createElement('div');
                                        $882b6d93070905b3$var$createDefaultPopup(div, feature1, config);
                                        layer.bindPopup(div).openPopup();
                                    }
                                } else layer.getPopup().openPopup();
                            });
                            layer.on('mouseover', function() {
                                if (config.markerMouseOver) return config.markerMouseOver(feature1);
                            });
                        }
                    }).bind(this); //Used for marker styling
                    var pointToLayer = function pointToLayer(feature, latlng) {
                        var _this5 = this;
                        //Check if style function is async
                        if (typeof config.markerStyle == 'function' && config.markerStyle.constructor.name === "AsyncFunction") {
                            var marker = L.marker(latlng); //Add marker to layerGroup when done
                            config.markerStyle(feature).then((function(color) {
                                $882b6d93070905b3$var$_newArrowCheck(this, _this5);
                                marker.setIcon($eed7ea189d937794$export$bead366a0263e1bd(color));
                            }).bind(this));
                            return marker;
                        } else {
                            //Marker coloring
                            var marker = L.marker(latlng, {
                                icon: typeof config.markerStyle == 'function' ? $eed7ea189d937794$export$bead366a0263e1bd(config.markerStyle(feature)) : typeof config.markerStyle == 'string' ? $eed7ea189d937794$export$bead366a0263e1bd(config.markerStyle) : new L.Icon.Default()
                            });
                            return marker;
                        }
                    }; // The polygonStyle should only be applied to Locations for Features from the STA service
                    // not to generated squares
                    var styleFunction = undefined;
                    if (typeof config.polygonStyle == 'function') styleFunction = (function styleFunction(feature) {
                        var _feature$geometry2;
                        $882b6d93070905b3$var$_newArrowCheck(this, _this3);
                        if (((_feature$geometry2 = feature.geometry) === null || _feature$geometry2 === void 0 ? void 0 : _feature$geometry2.type) == 'Polygon' && feature.properties.count) return undefined;
                        if (!feature._polygonStyleCache) //Add to object to prevent recall, if style function returns undefined
                        feature._polygonStyleCache = {
                            style: config.polygonStyle(feature)
                        };
                        return feature._polygonStyleCache.style;
                    }).bind(this);
                    else if (config.polygonStyle) styleFunction = function styleFunction(feature) {
                        var _feature$geometry3;
                        if (((_feature$geometry3 = feature.geometry) === null || _feature$geometry3 === void 0 ? void 0 : _feature$geometry3.type) == 'Polygon' && feature.properties.count) return undefined;
                        return config.polygonStyle;
                    };
                     //Called when the LayerGroup was added to the map, then the LayerGroup's super class is done initiating 
                    map.on('layeradd', function() {
                        map.off('layeradd'); //Create a geojson layer
                        /* geojsonLayer = L.geoJSON(null, {
               onEachFeature,
               pointToLayer,
               style: config.clusterStyle
             });*/ $882b6d93070905b3$var$geojsonLayer = L.realtime(function(resolve, reject) {
                            resolve(cache);
                        }, {
                            onEachFeature: onEachFeature,
                            pointToLayer: pointToLayer,
                            getFeatureId: function getFeatureId(geojson) {
                                //Prevent style reset
                                if (highlight) setHighlight(highlight); //Return id if possible
                                if (geojson.properties['@iot.id']) return geojson.properties['@iot.id'];
                                var flatten = geojson.geometry.coordinates.flat(3);
                                if (geojson.properties.count) return flatten.join('/');
                                else //Create id from coordinates
                                return "".concat(flatten[0], "/").concat(flatten[1]);
                            },
                            style: styleFunction,
                            interval: 500
                        }); //Add count and geojson layer
                        this.addLayer($882b6d93070905b3$var$countLayer);
                        this.addLayer($882b6d93070905b3$var$geojsonLayer); //Initiate the layer group with the current bounds and zoom level
                        var bounds = map.getBounds();
                        mapInterface.getLayerData(map.getZoom(), [
                            bounds._northEast.lng,
                            bounds._northEast.lat,
                            bounds._southWest.lng,
                            bounds._southWest.lat
                        ]);
                    });
                    mapInterface.on('change', (function(geojson) {
                        if (geojson.zoom == zoom) /*
              //Clear layer on change
              geojsonLayer.clearLayers();
              //Add the new data
              geojsonLayer.addData(geojson);
              //Force cluster layer clearing
              clearCluster = true;*/ cache = geojson;
                    }).bind(this)); //Called when zoom ended or the map was moved. The geojson layer is removed and a new one added, because the loaded geojson's are cached inside the MapInterface
                    map.on('moveend', function() {
                        //Update the zoom variable if the zoom was changed
                        if (zoom != map.getZoom()) {
                            zoom = map.getZoom();
                            $882b6d93070905b3$var$countLayer.clearLayers();
                        } //Set flag to true so that the cluster labels are removed
                        var bounds = map.getBounds(); //add a new layer and remove all old layers
                        mapInterface.getLayerData(map.getZoom(), [
                            bounds._northEast.lng,
                            bounds._northEast.lat,
                            bounds._southWest.lng,
                            bounds._southWest.lat
                        ]);
                    });
                }
            });
        }
    });
    L.stam = function(config) {
        return new L.Stam(config);
    }; //Adding custom css to head, so that the count tooltipp's background is transparent
    $882b6d93070905b3$var$addCss('.leaflet-tooltip.count {background-color: transparent;border: transparent;  box-shadow: none;  font-weight: bold;font-size: 20px;}');
}
if (typeof ol != "undefined") {
    //Adding css style for the marker popup
    $882b6d93070905b3$var$addCss(".ol-popup{position:absolute;min-width:180px;background-color:#fff;-webkit-filter:drop-shadow(0 1px 4px rgba(0, 0, 0, .2));filter:drop-shadow(0 1px 4px rgba(0, 0, 0, .2));padding:15px;border-radius:10px;border:1px solid #ccc;bottom:40px;left:-50px}.ol-popup:after,.ol-popup:before{top:100%;border:solid transparent;content:\" \";height:0;width:0;position:absolute;pointer-events:none}.ol-popup:after{border-top-color:#fff;border-width:10px;left:48px;margin-left:-10px}.ol-popup:before{border-top-color:#ccc;border-width:11px;left:48px;margin-left:-11px}.ol-popup-closer{text-decoration:none;position:absolute;top:2px;right:8px}.ol-popup-closer:after{content:\"\u2716\"}"); //Since ol 6 ol.inherits was removed
    var $882b6d93070905b3$var$ol_ext_inherits = function ol_ext_inherits(child, parent) {
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
    };
    var $882b6d93070905b3$var$zoom;
    var $882b6d93070905b3$var$olmap;
    /**
   * STAM implementation for openLayers
   * @param config STAM configuration object
   */ var $882b6d93070905b3$var$ol_layer_stam = function ol_layer_stam(config) {
        var _this7 = this;
        //Get map instance from config
        $882b6d93070905b3$var$olmap = config.map; //Init LayerGroup
        ol.layer.Group.call(this, config); //Get current zoom level and remove all decimal places
        $882b6d93070905b3$var$zoom = $882b6d93070905b3$var$olmap.getView().getZoom().toFixed(0);
        var mapInterface = new $7d3fb054ca11f795$export$57b87f3e07d4bb90(config);
        var clearCircles = false;
        var circleLayer = new ol.layer.Vector({
            source: new ol.source.Vector()
        }); //Create the vectorLayer with the geojson vector source
        var vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
            // features,
            style: function style(feature2) {
                var _this6 = this;
                if (clearCircles) {
                    clearCircles = false;
                    circleLayer.getSource().clear();
                } //Check the feature type
                if (feature2.getGeometry().getType() == "Point") {
                    //Check if it is a async function
                    if (typeof config.markerStyle == 'function' && config.markerStyle.constructor.name === "AsyncFunction") {
                        //Get the color an set the style
                        config.markerStyle($882b6d93070905b3$var$olToGeoJSON(feature2)).then((function(color) {
                            $882b6d93070905b3$var$_newArrowCheck(this, _this6);
                            feature2.setStyle(new ol.style.Style({
                                image: new ol.style.Icon({
                                    anchor: [
                                        0.5,
                                        1
                                    ],
                                    scale: 0.5,
                                    anchorXUnits: 'fraction',
                                    anchorYUnits: 'fraction',
                                    //Call function if present, with the feature, if not use the color name if present. Default is blue
                                    src: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-".concat(color, ".png")
                                })
                            }));
                        }).bind(this));
                        return null;
                    } //Add the marker image
                    var style = new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [
                                0.5,
                                1
                            ],
                            scale: 0.5,
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'fraction',
                            //Call function if present, with the feature, if not use the color name if present. Default is blue
                            src: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-".concat(typeof config.markerStyle == 'function' ? config.markerStyle($882b6d93070905b3$var$olToGeoJSON(feature2)) : config.markerStyle ? config.markerStyle : 'blue', ".png")
                        })
                    });
                    return style;
                } else {
                    var _style, _style2, _polygonStyle;
                    //Get extends of cluster
                    var cords = feature2.getGeometry().getExtent(); //Calculate middle
                    var _long = (cords[0] + cords[2]) / 2;
                    var lat = (cords[1] + cords[3]) / 2; //Get style from config
                    var style = typeof config.clusterStyle == 'function' ? (function(feature) {
                        $882b6d93070905b3$var$_newArrowCheck(this, _this6);
                        if (!feature._clusterStyleCache) feature._clusterStyleCache = {
                            style: config.clusterStyle($882b6d93070905b3$var$olToGeoJSON(feature))
                        };
                        return feature._clusterStyleCache.style;
                    }).bind(this)(feature2) : config.clusterStyle; //Get the individual styles
                    var circleStyle = (_style = style) === null || _style === void 0 ? void 0 : _style.circle;
                    var polygonStyle = (_style2 = style) === null || _style2 === void 0 ? void 0 : _style2.polygon["default"];
                    if (feature2.get('count') != undefined) {
                        //Add circle with text
                        var circle = new ol.Feature({
                            geometry: new ol.geom.Circle([
                                _long,
                                lat
                            ], (cords[2] - cords[0]) / 6),
                            name: 'cluster'
                        }); //Create the text style
                        var text = new ol.style.Text({
                            font: "30px Calibri,sans-serif",
                            fill: new ol.style.Fill({
                                color: '#000'
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#fff',
                                width: 2
                            }),
                            text: "".concat(feature2.get('count'))
                        }); //Add circle style, if present
                        if (circleStyle) {
                            var style = $882b6d93070905b3$var$pathToOl(circleStyle);
                            style.setText(text);
                            circle.setStyle(style);
                        } else circle.setStyle(new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                width: 2,
                                color: 'red',
                                radius: 1
                            }),
                            text: text
                        }));
                         //Add circle to circle layer
                        circleLayer.getSource().addFeature(circle);
                    } //Convert path to openLayers style
                    if (polygonStyle) polygonStyle = $882b6d93070905b3$var$pathToOl(polygonStyle);
                     //Use config style if preset
                    return (_polygonStyle = polygonStyle) !== null && _polygonStyle !== void 0 ? _polygonStyle : new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: '#3399CC',
                            width: 1.25
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255,255,255,0.4)'
                        })
                    });
                }
            }
        }); //Create a layergroup out of the circle layer and GeoJson layer
        var layer = new ol.layer.Group({
            layers: [
                circleLayer,
                vectorLayer
            ]
        }); //Add layer to the map
        $882b6d93070905b3$var$olmap.addLayer(layer); //Create a geojson format with the current projection
        var format = new ol.format.GeoJSON({
            featureProjection: $882b6d93070905b3$var$olmap.getView().getProjection().getCode()
        }); //Fetch the geojson
        mapInterface.on('change', (function(geoJson) {
            $882b6d93070905b3$var$_newArrowCheck(this, _this7);
            if (geoJson.zoom == $882b6d93070905b3$var$zoom) {
                //Clear the geojson layer
                vectorLayer.getSource().clear(); //Force circle layer clear
                clearCircles = true; //Create the geojson and add it to the source
                vectorLayer.getSource().addFeatures(format.readFeatures(geoJson));
            }
        }).bind(this)); //If popup is not in the html dom, add it
        if (!document.getElementById('popup')) document.writeln("<div id=\"popup\" class=\"ol-popup\">\n      <a href=\"#\" id=\"popup-closer\" class=\"ol-popup-closer\"></a>\n      <div id=\"popup-content\"></div>\n      </div>");
         //Creating the popup
        var container = document.getElementById('popup'), content_element = document.getElementById('popup-content'), closer = document.getElementById('popup-closer'); //Marker close event
        closer.onclick = function() {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        }; //Create overlay for popup
        var overlay = new ol.Overlay({
            element: container,
            autoPan: true,
            offset: [
                0,
                -10
            ]
        }); //Add popup to map
        $882b6d93070905b3$var$olmap.addOverlay(overlay);
        var selected = null;
        var defaultHighlightStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.7)'
            }),
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 3
            })
        });
        var last = null;
        $882b6d93070905b3$var$olmap.on('pointermove', function(e) {
            //Get the hovered feature
            var hit = $882b6d93070905b3$var$olmap.forEachFeatureAtPixel(e.pixel, function(f) {
                var _this8 = this;
                //Check if it is a cluster
                if (f.get('count')) {
                    //Set last clicked element if not set
                    if (last != f) {
                        last = f; //Call mouse over, but only once per marker
                        if (config.clusterMouseOver) config.clusterMouseOver($882b6d93070905b3$var$olToGeoJSON(f));
                    } //Remove style of old selected, if the current selected is a new one
                    if (selected != f) {
                        var _selected;
                        (_selected = selected) === null || _selected === void 0 || _selected.setStyle(undefined);
                        selected = f;
                    }
                    var style; //Set config style if present
                    if (config.clusterStyle) {
                        var clusterStyle = typeof config.clusterStyle == 'function' ? (function(feature) {
                            $882b6d93070905b3$var$_newArrowCheck(this, _this8);
                            if (!feature._clusterStyleCache) feature._clusterStyleCache = {
                                style: config.clusterStyle($882b6d93070905b3$var$olToGeoJSON(feature))
                            };
                            return feature._clusterStyleCache.style.polygon.hover;
                        }).bind(this)(f) : config.clusterStyle.polygon.hover;
                        style = $882b6d93070905b3$var$pathToOl(clusterStyle);
                    } else var style = defaultHighlightStyle;
                    f.setStyle(style);
                } else {
                    //Check if it is a marker
                    if (f.get('@iot.id')) //Call function only once per marker
                    {
                        if (last != f) {
                            last = f; //Call callback
                            if (config.markerMouseOver) config.markerMouseOver($882b6d93070905b3$var$olToGeoJSON(f));
                        }
                    }
                }
                return f;
            }); //Check if something was hovered over
            if (hit) //Set cursor to pointer
            this.getTargetElement().style.cursor = 'pointer';
            else {
                //Remove style from old selected
                if (selected) {
                    var _selected2;
                    (_selected2 = selected) === null || _selected2 === void 0 || _selected2.setStyle(undefined);
                    selected = null;
                } //Remove cursor style
                this.getTargetElement().style.cursor = '';
            }
        }); //Map onclick
        $882b6d93070905b3$var$olmap.on('click', function(evt) {
            //Get the clicked feature
            var feature3 = $882b6d93070905b3$var$olmap.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            }); //Check if feature was clicked
            if (feature3) {
                //Marker was clicked
                if (feature3.get('@iot.id') != undefined) {
                    var geometry = feature3.getGeometry();
                    var content; //Check type
                    if (typeof config.markerClick == 'function') content = config.markerClick($882b6d93070905b3$var$olToGeoJSON(feature3));
                     //If no content, just insert the default content
                    if (!content) $882b6d93070905b3$var$createDefaultPopup(content_element, $882b6d93070905b3$var$olToGeoJSON(feature3), config);
                    else content_element.innerHTML = content;
                    if (geometry.getType() == "Point") overlay.setPosition(geometry.getCoordinates());
                    else {
                        var cords = evt.pixel;
                        cords[1] = cords[1] + 36;
                        overlay.setPosition($882b6d93070905b3$var$olmap.getCoordinateFromPixel(cords));
                    }
                } else //Cluster was clicked
                if (feature3.get('count') != undefined) {
                    if (typeof config.clusterClick == 'function') config === null || config === void 0 || config.clusterClick($882b6d93070905b3$var$olToGeoJSON(feature3));
                    else $882b6d93070905b3$var$olmap.getView().fit(feature3.getGeometry().getExtent(), $882b6d93070905b3$var$olmap.getSize(), {
                        duration: 1000
                    });
                }
            }
        }); //Add listener to moveend, called when moving and zooming;
        $882b6d93070905b3$var$olmap.on("moveend", function() {
            //Check if zoom level was changed
            if ($882b6d93070905b3$var$zoom != $882b6d93070905b3$var$olmap.getView().getZoom()) $882b6d93070905b3$var$zoom = $882b6d93070905b3$var$olmap.getView().getZoom().toFixed(0);
             //always add new layer, because the geojson is cached inside MapInterface.ts
            $882b6d93070905b3$var$addSTAMLayer(mapInterface, $882b6d93070905b3$var$zoom, config, $882b6d93070905b3$var$olmap);
        });
    }; //Inherit the layer group from openLayers
    $882b6d93070905b3$var$ol_ext_inherits($882b6d93070905b3$var$ol_layer_stam, ol.layer.Group); //Add the layer to ol.layer.STAM
    ol.layer.STAM = $882b6d93070905b3$var$ol_layer_stam;
}
/**
 * Helper function, to set the background of an element to transparent, if nothing was set. 
 * This is necessary due to the behavior of leaflet, to set the background to the border color, if no fill color was set
 * @param configStyle The config to edit
 */ function $882b6d93070905b3$var$addTransparentBackground(configStyle) {
    if (configStyle && !configStyle.fillColor) configStyle.fillColor = 'rgba(255,0,0,0.0)';
}
/**
 * Adds the default body to a popup
 * @param content_element popup content element
 * @param feature GeoJSON feature that was clicked
 */ function $882b6d93070905b3$var$createDefaultPopup(content_element, feature, config) {
    content_element.innerHTML = '<h3>' + feature.properties.name + '</h3>';
    var list = document.createElement('ul'); //Iterate all ObservedProperties
    feature.properties.getData.forEach(function(obj) {
        //Create new list element
        var li = document.createElement('li');
        li.innerText = obj.observedProperty; //Set cursor style on hover
        li.setAttribute('style', "cursor: pointer");
        if (typeof Plotly != 'undefined') li.onclick = function() {
            //Create new popup
            ($parcel$interopDefault($2K9WE$picomodal))({
                width: '70%',
                content: '',
                modalId: 'pico-1'
            }).beforeClose(function() {
                Plotly.purge("pico-1"); //Remove pico-1 element from the DOM
                document.getElementById("pico-1").remove();
            }).afterShow(/*#__PURE__*/ function() {
                var _ref = $882b6d93070905b3$var$_asyncToGenerator(/*#__PURE__*/ regeneratorRuntime.mark(function _callee(modal) {
                    var _this9 = this;
                    var loader, reverse, result, x, y, Datastream, trace1, data, layout;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while(true)switch(_context.prev = _context.next){
                            case 0:
                                //Set overflow to hidden, so no scrollbar is shown
                                modal.modalElem().style.overflow = 'hidden'; //Set height to 50%
                                modal.modalElem().style.height = '50%'; //Create loader div
                                loader = document.createElement('div'); //Set class to loader
                                loader.classList.add('loader'); //Add loader to modal
                                modal.modalElem().appendChild(loader);
                                reverse = false; //Get data
                                _context.next = 8;
                                return obj.getData(function(query) {
                                    //Get the dataArray
                                    query.resultFormat = 'dataArray';
                                    query.orderby = 'phenomenonTime asc';
                                    if (config.plot) {
                                        var operator = 'gt'; //Check if offset is present
                                        //Check if offset is present
                                        if (config.plot.offset) {
                                            //Set top to the offset
                                            query.top = Math.abs(config.plot.offset); //Check if number is negative
                                            //Check if number is negative
                                            if (Math.sign(config.plot.offset) == -1) {
                                                //Reverse array after getting the data, due to the orderby
                                                reverse = true; //Reverse order to get the last $top observations
                                                //Reverse order to get the last $top observations
                                                query.orderby = 'phenomenonTime desc'; //Change operator to lower than
                                                //Change operator to lower than
                                                operator = 'lt';
                                            } //Add filter
                                            //Add filter
                                            query.filter = "phenomenonTime ".concat(operator, " ").concat(config.plot.startDate.toISOString());
                                        } else //Check if end data is present
                                        if (config.plot.endDate) //Filter for startDate and endDate
                                        query.filter = "(phenomenonTime gt ".concat(config.plot.startDate.toISOString(), ") and (phenomenonTime lt ").concat(config.plot.endDate.toISOString(), ")");
                                    }
                                    return query;
                                });
                            case 8:
                                result = _context.sent;
                                //SHOW diagram
                                x = [];
                                y = []; //Get datastream
                                Datastream = result.value; //Reverse array if necessary
                                if (reverse) Datastream.dataArray = Datastream.dataArray.reverse();
                                 //Check if data was returned
                                if (Datastream.dataArray) Datastream.dataArray.forEach((function(Observation) {
                                    $882b6d93070905b3$var$_newArrowCheck(this, _this9);
                                    //Split data if a timespan was entered, and add both to the x array
                                    if (Observation[1].indexOf('/') != -1) {
                                        x.push(Observation[1].split('/')[0]);
                                        x.push(Observation[1].split('/')[1]);
                                        y.push(Observation[2]);
                                    } else //Time is not a timespan
                                    x.push(Observation[1]);
                                    y.push(Observation[2]);
                                }).bind(this));
                                 //Create trace
                                trace1 = {
                                    x: x,
                                    y: y,
                                    type: 'scatter'
                                };
                                data = [
                                    trace1
                                ]; //Set both axis to autorange and add the unit as a title
                                layout = {
                                    xaxis: {
                                        autorange: true
                                    },
                                    yaxis: {
                                        autorange: true,
                                        title: {
                                            text: result.unitOfMeasurement.name
                                        }
                                    },
                                    autosize: true
                                }; //Remove loader
                                loader.remove(); //Add new plot
                                Plotly.newPlot('pico-1', data, layout, {
                                    responsive: true
                                });
                            case 19:
                            case "end":
                                return _context.stop();
                        }
                    }, _callee, this);
                }));
                return function(_x) {
                    return _ref.apply(this, arguments);
                };
            }()).show();
        };
         //Append to list
        list.appendChild(li);
    }); //Append list to popup
    content_element.appendChild(list);
}
/**
 * Creates a stam layer
 * @param mapInterface mapInterface instance
 * @param zoom current zoom level
 * @returns a promise that resolves with an openLayers vectorLayer that contains the geoJson
 */ function $882b6d93070905b3$var$addSTAMLayer(mapInterface, zoom, config, map) {
    var bounds; //Check it the projection is EPSG 4326
    if ($882b6d93070905b3$var$olmap.getView().getProjection().getCode() == "EPSG:4326") bounds = $882b6d93070905b3$var$olmap.getView().calculateExtent();
    else {
        var _bounds, _bounds2;
        //If not convert the bounding box to EPSG 4326
        var zw = $882b6d93070905b3$var$olmap.getView().calculateExtent();
        var code = $882b6d93070905b3$var$olmap.getView().getProjection().getCode();
        bounds = [];
        (_bounds = bounds).push.apply(_bounds, $882b6d93070905b3$var$_toConsumableArray(new ol.geom.Point([
            zw[2],
            zw[3]
        ]).transform(code, 'EPSG:4326').getCoordinates()));
        (_bounds2 = bounds).push.apply(_bounds2, $882b6d93070905b3$var$_toConsumableArray(new ol.geom.Point([
            zw[0],
            zw[1]
        ]).transform(code, 'EPSG:4326').getCoordinates()));
    }
    mapInterface.getLayerData(zoom, bounds);
}
/**
 * Converts a ol feature to a geoJson
 * @param feature ol feature
 */ function $882b6d93070905b3$var$olToGeoJSON(feature) {
    return {
        type: feature.getGeometry().getType(),
        properties: feature.getProperties(),
        geometry: {
            type: 'Point',
            coordinates: feature.getGeometry().getCoordinates()
        }
    };
}
/**
 * Helper function to convert a Path object to a valid openLayers style
 * @param path Path to convert
 */ function $882b6d93070905b3$var$pathToOl(path) {
    var _path$color, _path$weight;
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: $882b6d93070905b3$var$colorWithAlpha((_path$color = path === null || path === void 0 ? void 0 : path.color) !== null && _path$color !== void 0 ? _path$color : 'red', path === null || path === void 0 ? void 0 : path.opacity),
            width: (_path$weight = path === null || path === void 0 ? void 0 : path.weight) !== null && _path$weight !== void 0 ? _path$weight : 1
        }),
        fill: new ol.style.Fill({
            color: path !== null && path !== void 0 && path.fillColor ? $882b6d93070905b3$var$colorWithAlpha(path === null || path === void 0 ? void 0 : path.fillColor, path === null || path === void 0 ? void 0 : path.fillOpacity) : 'rgba(0, 0, 0, 0)'
        })
    });
}
/**
 * Adds a alpha value to a color
 * @param color Color string or hex
 * @param alpha Alpha value from 0 to 1
 */ function $882b6d93070905b3$var$colorWithAlpha(color) {
    var alpha = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    //Convert color to rgb
    var _Array$from = Array.from(ol.color.asArray(color)), _Array$from2 = $882b6d93070905b3$var$_slicedToArray(_Array$from, 3), r = _Array$from2[0], g = _Array$from2[1], b = _Array$from2[2]; //Add alpha
    return ol.color.asString([
        r,
        g,
        b,
        alpha
    ]);
}
/**
 * Add css to the document
 * @param css Css string
 */ function $882b6d93070905b3$var$addCss(css) {
    var head = document.head || document.getElementsByTagName('head')[0], style = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    if (style.styleSheet) // This is required for IE8 and below.
    style.styleSheet.cssText = css;
    else style.appendChild(document.createTextNode(css));
}


//# sourceMappingURL=index.js.map
