(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@mapray/mapray-js')) :
typeof define === 'function' && define.amd ? define(['@mapray/mapray-js'], factory) :
(global = global || self, global.maprayui = factory(global.mapray));
}(this, (function (mapray) { 'use strict';

mapray = mapray && mapray.hasOwnProperty('default') ? mapray['default'] : mapray;

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var check = function (it) {
  return it && it.Math == Math && it;
}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


var global_1 = // eslint-disable-next-line no-undef
check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func
Function('return this')();

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var descriptors = !fails(function () {
  return Object.defineProperty({}, 1, {
    get: function () {
      return 7;
    }
  })[1] != 7;
});

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({
  1: 2
}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;
var objectPropertyIsEnumerable = {
  f: f
};

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var toString = {}.toString;

var classofRaw = function (it) {
  return toString.call(it).slice(8, -1);
};

var split = ''.split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

var indexedObject = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

var toIndexedObject = function (it) {
  return indexedObject(requireObjectCoercible(it));
};

var isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string

var toPrimitive = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var hasOwnProperty = {}.hasOwnProperty;

var has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

var EXISTS = isObject(document$1) && isObject(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

var ie8DomDefine = !descriptors && !fails(function () {
  return Object.defineProperty(documentCreateElement('div'), 'a', {
    get: function () {
      return 7;
    }
  }).a != 7;
});

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (ie8DomDefine) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) {
    /* empty */
  }
  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
};
var objectGetOwnPropertyDescriptor = {
  f: f$1
};

var anObject = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  }

  return it;
};

var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty

var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (ie8DomDefine) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) {
    /* empty */
  }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};
var objectDefineProperty = {
  f: f$2
};

var createNonEnumerableProperty = descriptors ? function (object, key, value) {
  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var setGlobal = function (key, value) {
  try {
    createNonEnumerableProperty(global_1, key, value);
  } catch (error) {
    global_1[key] = value;
  }

  return value;
};

var SHARED = '__core-js_shared__';
var store = global_1[SHARED] || setGlobal(SHARED, {});
var sharedStore = store;

var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

if (typeof sharedStore.inspectSource != 'function') {
  sharedStore.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource = sharedStore.inspectSource;

var WeakMap = global_1.WeakMap;
var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

var shared = createCommonjsModule(function (module) {
  (module.exports = function (key, value) {
    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.6.4',
    mode:  'global',
    copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
  });
});

var id = 0;
var postfix = Math.random();

var uid = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

var keys = shared('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid(key));
};

var hiddenKeys = {};

var WeakMap$1 = global_1.WeakMap;
var set, get, has$1;

var enforce = function (it) {
  return has$1(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;

    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    }

    return state;
  };
};

if (nativeWeakMap) {
  var store$1 = new WeakMap$1();
  var wmget = store$1.get;
  var wmhas = store$1.has;
  var wmset = store$1.set;

  set = function (it, metadata) {
    wmset.call(store$1, it, metadata);
    return metadata;
  };

  get = function (it) {
    return wmget.call(store$1, it) || {};
  };

  has$1 = function (it) {
    return wmhas.call(store$1, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;

  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };

  get = function (it) {
    return has(it, STATE) ? it[STATE] : {};
  };

  has$1 = function (it) {
    return has(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has$1,
  enforce: enforce,
  getterFor: getterFor
};

var redefine = createCommonjsModule(function (module) {
  var getInternalState = internalState.get;
  var enforceInternalState = internalState.enforce;
  var TEMPLATE = String(String).split('String');
  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;

    if (typeof value == 'function') {
      if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
      enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }

    if (O === global_1) {
      if (simple) O[key] = value;else setGlobal(key, value);
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }

    if (simple) O[key] = value;else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
  });
});

var path = global_1;

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace]) : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
};

var ceil = Math.ceil;
var floor = Math.floor; // `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger

var toInteger = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

var min = Math.min; // `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength

var toLength = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min; // Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

var toAbsoluteIndex = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
};

var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value; // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare

    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++]; // eslint-disable-next-line no-self-compare

      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
    } else for (; length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    }
    return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

var indexOf = arrayIncludes.indexOf;

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;

  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys


  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }

  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames

var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return objectKeysInternal(O, hiddenKeys$1);
};

var objectGetOwnPropertyNames = {
  f: f$3
};

var f$4 = Object.getOwnPropertySymbols;
var objectGetOwnPropertySymbols = {
  f: f$4
};

var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = objectGetOwnPropertyNames.f(anObject(it));
  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var copyConstructorProperties = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = objectDefineProperty.f;
  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true : value == NATIVE ? false : typeof detection == 'function' ? fails(detection) : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';
var isForced_1 = isForced;

var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/

var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

  if (GLOBAL) {
    target = global_1;
  } else if (STATIC) {
    target = global_1[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global_1[TARGET] || {}).prototype;
  }

  if (target) for (key in source) {
    sourceProperty = source[key];

    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];

    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    } // add a flag to not completely full polyfills


    if (options.sham || targetProperty && targetProperty.sham) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    } // extend global


    redefine(target, key, sourceProperty, options);
  }
};

// `Math.sign` method implementation
// https://tc39.github.io/ecma262/#sec-math.sign
var mathSign = Math.sign || function sign(x) {
  // eslint-disable-next-line no-self-compare
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};

// https://tc39.github.io/ecma262/#sec-math.sign

_export({
  target: 'Math',
  stat: true
}, {
  sign: mathSign
});

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

var GeoMath = mapray.GeoMath;
var GeoPoint = mapray.GeoPoint;
/**
 * @summary 標準Maprayビューワ
 *
 * @class StandardUIViewer
 * @extends {mapray.RenderCallback}
 */

var StandardUIViewer =
/*#__PURE__*/
function (_mapray$RenderCallbac) {
  _inherits(StandardUIViewer, _mapray$RenderCallbac);

  /**
   * @summary コンストラクタ
   * @param {string|Element}              container                               ビューワ作成先のコンテナ（IDまたは要素）
   * @param {string}                      access_token                            アクセストークン
   * @param {object}                      options                                 生成オプション
   * @param {mapray.DemProvider}          options.dem_provider                    DEMプロバイダ
   * @param {mapray.ImageProvider}        options.image_provider                  画像プロバイダ
   * @param {array}                       options.layers                          地図レイヤー配列
   * @param {mapray.Viewer.RenderMode}    options.render_mode                     レンダリングモード
   * @param {mapray.DebugStats}           options.debug_stats                     デバッグ統計オブジェクト
   * @param {mapray.Attributionontroller} options.attribution_controller          著作権表示の表示制御
   * @param {object}                      options.camera_position                 カメラ位置
   * @param {number}                      options.camera_position.latitude        緯度（度）
   * @param {number}                      options.camera_position.longitude       経度（度）
   * @param {number}                      options.camera_position.height          高さ（m）
   * @param {object}                      options.lookat_position                 注視点位置
   * @param {number}                      options.lookat_position.latitude        緯度（度）
   * @param {number}                      options.lookat_position.longitude       経度（度）
   * @param {number}                      options.lookat_position.height          高さ（m）
   * @param {object}                      options.camera_parameter                カメラパラメータ
   * @param {number}                      options.camera_parameter.fov            画角（度）
   * @param {number}                      options.camera_parameter.near           近接平面距離（m）
   * @param {number}                      options.camera_parameter.far            遠方平面距離（m）
   * @param {number}                      options.camera_parameter.speed_factor   移動速度係数
   * @memberof StandardUIViewer
   */
  function StandardUIViewer(container, access_token, options) {
    var _this;

    _classCallCheck(this, StandardUIViewer);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(StandardUIViewer).call(this));

    _this.createViewer(container, access_token, options); // カメラパラメータ


    _this._camera_parameter = {
      latitude: 0,
      // 緯度
      longitude: 0,
      // 経度
      height: 0,
      // 高度
      pitch: 0,
      // 上下（X軸）回転
      yaw: 0,
      // 左右（Z軸）回転
      fov: 0,
      // 画角
      near: 0,
      // 近接平面距離
      far: 0 // 遠方平面距離

    }; // カメラパラメータの初期化

    _this._initCameraParameter(options);

    _this._operation_mode = StandardUIViewer.OperationMode.NONE; // 操作モード

    _this._mouse_down_position = GeoMath.createVector2f(); // マウスダウンした位置

    _this._pre_mouse_position = GeoMath.createVector2f(); // 直前のマウス位置

    _this._rotate_center = GeoMath.createVector3(); // 回転中心

    _this._translate_drag = GeoMath.createVector2f(); // 平行移動の移動量（マウスの移動量）

    _this._rotate_drag = GeoMath.createVector2f(); // 回転の移動量（マウスの移動量）

    _this._free_rotate_drag = GeoMath.createVector2f(); // 自由回転の移動量（マウスの移動量）

    _this._height_drag = GeoMath.createVector2f(); // 高度変更の移動量（マウスの移動量）

    _this._zoom_wheel = 0; // 視線方向への移動量（ホイールの移動量）

    _this._fovy_key = 0; // 画角変更の指定回数

    _this._default_fov = StandardUIViewer.DEFAULT_CAMERA_PARAMETER.fov; // リセット用の画角

    _this._key_mode = false; // キー操作中

    return _this;
  }
  /**
   * @summary ビューワの作成
   * @param {string|Element}              container                               ビューワ作成先のコンテナ（IDまたは要素）
   * @param {string}                      access_token                            アクセストークン
   * @param {object}                      options                                 生成オプション
   * @param {mapray.DemProvider}          options.dem_provider                    DEMプロバイダ
   * @param {mapray.ImageProvider}        options.image_provider                  画像プロバイダ
   * @param {array}                       options.layers                          地図レイヤー配列
   * @param {mapray.Viewer.RenderMode}    options.render_mode                     レンダリングモード
   * @param {mapray.DebugStats}           options.debug_stats                     デバッグ統計オブジェクト
   * @param {mapray.Attributionontroller} options.attribution_controller          著作権表示の表示制御
   */


  _createClass(StandardUIViewer, [{
    key: "createViewer",
    value: function createViewer(container, access_token, options) {
      if (this._viewer) {
        this.destroy();
      }

      this._viewer = new mapray.Viewer(container, {
        dem_provider: this._createDemProvider(access_token, options),
        image_provider: this._createImageProvider(options),
        layers: options && options.layers || null,
        render_callback: this,
        render_mode: options && options.render_mode || mapray.Viewer.RenderMode.SURFACE,
        debug_stats: options && options.debug_stats || null,
        attribution_controller: options && options.attribution_controller || null
      }); // 右クリックメニューの無効化

      var element = this._viewer._canvas_element;
      element.setAttribute("oncontextmenu", "return false;"); // イベントリスナーの追加

      this._addEventListener();

      return this._viewer;
    }
    /**
     * @summary 破棄関数
     * 
     * @memberof StandardUIViewer
     */

  }, {
    key: "destroy",
    value: function destroy() {
      if (!this._viewer) {
        return;
      }

      this._removeEventListener();

      this._viewer.destroy();

      this._viewer = null;
    }
    /**
     * @summary ビューワ
     * @type {mapray.viewer}
     * @readonly
     * @memberof StandardUIViewer
     */

  }, {
    key: "_createDemProvider",

    /**
     * @summary DEMプロバイダの生成
     *
     * @param {string}                      access_token            アクセストークン
     * @param {object}                      options                 生成オプション
     * @param {mapray.DemProvider}          options.dem_provider    DEMプロバイダ
     * @returns {mapray.DemProvider}                                DEMプロバイダ
     * @memberof StandardUIViewer
     */
    value: function _createDemProvider(access_token, options) {
      return options && options.dem_provider || new mapray.CloudDemProvider(access_token);
    }
    /**
     * @summary 画像プロバイダの生成
     *
     * @param {object}                      options                 生成オプション
     * @param {mapray.ImageProvider}        options.image_provider  画像プロバイダ
     * @returns {mapray.ImageProvider}                              画像プロバイダ 
     * @memberof StandardUIViewer
     */

  }, {
    key: "_createImageProvider",
    value: function _createImageProvider(options) {
      return options && options.image_provider || new mapray.StandardImageProvider("https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/", ".jpg", 256, 2, 18);
    }
    /**
     * @summary カメラパラメータの初期化
     *
     * @param {object}                      options.camera_position                 カメラ位置
     * @param {number}                      options.camera_position.latitude        緯度（度）
     * @param {number}                      options.camera_position.longitude       経度（度）
     * @param {number}                      options.camera_position.height          高さ（m）
     * @param {object}                      options.lookat_position                 注視点位置
     * @param {number}                      options.lookat_position.latitude        緯度（度）
     * @param {number}                      options.lookat_position.longitude       経度（度）
     * @param {number}                      options.lookat_position.height          高さ（m）
     * @param {object}                      options.camera_parameter                カメラパラメータ
     * @param {number}                      options.camera_parameter.fov            画角（度）
     * @param {number}                      options.camera_parameter.near           近接平面距離（m）
     * @param {number}                      options.camera_parameter.far            遠方平面距離（m）
     * @param {number}                      options.camera_parameter.speed_factor   移動速度係数
     * @memberof StandardUIViewer
     */

  }, {
    key: "_initCameraParameter",
    value: function _initCameraParameter(options) {
      var camera_position = options && options.camera_position || StandardUIViewer.DEFAULT_CAMERA_POSITION;
      var lookat_position = options && options.lookat_position || StandardUIViewer.DEFAULT_LOOKAT_POSITION;
      var camera_parameter = options && options.camera_parameter || StandardUIViewer.DEFAULT_CAMERA_PARAMETER; // カメラ位置の設定

      this.setCameraPosition(camera_position); //　注視点位置の設定

      this.setLookAtPosition(lookat_position); // カメラパラメータの設定

      this.setCameraParameter(camera_parameter); // カメラ姿勢の確定

      this._updateViewerCamera();
    }
    /**
     * @summary イベントリスナーの追加
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_addEventListener",
    value: function _addEventListener() {
      var canvas = this._viewer._canvas_element;
      var self = this;
      window.addEventListener("blur", function (event) {
        self._onBlur(event);
      }, {
        passive: false
      });
      canvas.addEventListener("mousedown", function (event) {
        self._onMouseDown(event);
      }, {
        passive: false
      });
      document.addEventListener("mousemove", function (event) {
        self._onMouseMove(event);
      }, {
        passive: false
      });
      document.addEventListener("mouseup", function (event) {
        self._onMouseUp(event);
      }, {
        passive: false
      });
      document.addEventListener("wheel", function (event) {
        self._onMouseWheel(event);
      }, {
        passive: false
      });
      document.addEventListener("keydown", function (event) {
        self._onKeyDown(event);
      }, {
        passive: false
      });
      document.addEventListener("keyup", function (event) {
        self._onKeyUp(event);
      }, {
        passive: false
      });
    }
    /**
     * @summary イベントリスナーの削除
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_removeEventListener",
    value: function _removeEventListener() {
      var canvas = this._viewer._canvas_element;
      var self = this;
      window.removeEventListener("blur", function (event) {
        self._onBlur(event);
      }, {
        passive: false
      });
      canvas.removeEventListener("mousedown", function (event) {
        self._onMouseDown(event);
      }, {
        passive: false
      });
      document.removeEventListener("mousemove", function (event) {
        self._onMouseMove(event);
      }, {
        passive: false
      });
      document.removeEventListener("mouseup", function (event) {
        self._onMouseUp(event);
      }, {
        passive: false
      });
      document.removeEventListener("wheel", function (event) {
        self._onMouseWheel(event);
      }, {
        passive: false
      });
      document.removeEventListener("keydown", function (event) {
        self._onKeyDown(event);
      }, {
        passive: false
      });
      document.removeEventListener("keyup", function (event) {
        self._onKeyUp(event);
      }, {
        passive: false
      });
    }
    /**
     * @summary レンダリングループ開始の処理
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "onStart",
    value: function onStart() {}
    /**
     * @summary レンダリングループ終了の処理
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "onStop",
    value: function onStop() {}
    /**
     * @summary フレームレンダリング前の処理
     *
     * @param {number} delta_time  全フレームからの経過時間（秒）
     * @memberof StandardUIViewer
     */

  }, {
    key: "onUpdateFrame",
    value: function onUpdateFrame(delta_time) {
      // 平行移動
      this._translation(delta_time); // 回転


      this._rotation(); // 自由回転


      this._freeRotation(delta_time); // 高さ変更


      this._translationOfHeight(); //　視線方向移動


      this._translationOfEyeDirection(); // 画角変更


      this._changeFovy(); // 高度補正


      this._correctAltitude(); // クリップ範囲の更新


      this._updateClipPlane(); // カメラ姿勢の確定


      this._updateViewerCamera();
    }
    /**
     * @summary カメラの位置・向きの更新
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_updateViewerCamera",
    value: function _updateViewerCamera() {
      var camera = this._viewer.camera;
      var camera_geoPoint = new GeoPoint(this._camera_parameter.longitude, this._camera_parameter.latitude, this._camera_parameter.height);
      var camera_matrix = camera_geoPoint.getMlocsToGocsMatrix(GeoMath.createMatrix());
      var pitch_matrix = GeoMath.rotation_matrix([1, 0, 0], this._camera_parameter.pitch, GeoMath.createMatrix());
      var yaw_matrix = GeoMath.rotation_matrix([0, 0, 1], this._camera_parameter.yaw, GeoMath.createMatrix());
      var eye_matrix = GeoMath.mul_AA(yaw_matrix, pitch_matrix, GeoMath.createMatrix());
      camera.view_to_gocs = GeoMath.mul_AA(camera_matrix, eye_matrix, GeoMath.createMatrix());
      camera.fov = this._camera_parameter.fov;
      camera.near = this._camera_parameter.near;
      camera.far = this._camera_parameter.far;
    }
    /**
     * @summary クリップ範囲の更新
     * 
     * @memberof StandardUIViewer
     */

  }, {
    key: "_updateClipPlane",
    value: function _updateClipPlane() {
      // 地表面の標高
      var elevation = this._viewer.getElevation(this._camera_parameter.latitude, this._camera_parameter.longitude);

      var altitude = Math.max(this._camera_parameter.height - elevation, StandardUIViewer.MINIMUM_HEIGHT);
      this._camera_parameter.near = Math.max(altitude * StandardUIViewer.NEAR_FACTOR, StandardUIViewer.MINIMUM_NEAR);
      this._camera_parameter.far = Math.max(this._camera_parameter.near * StandardUIViewer.FAR_FACTOR, StandardUIViewer.MINIMUM_FAR);
    }
    /**
     * @summary 高度の補正（地表面以下にならないようにする）
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_correctAltitude",
    value: function _correctAltitude() {
      var elevation = this._viewer.getElevation(this._camera_parameter.latitude, this._camera_parameter.longitude);

      this._camera_parameter.height = Math.max(this._camera_parameter.height, elevation + StandardUIViewer.MINIMUM_HEIGHT);
    }
    /**
     * @summary フォーカスが外れた時のイベント
     *
     * @param {Event} event  イベントデータ
     * @memberof StandardUIViewer
     */

  }, {
    key: "_onBlur",
    value: function _onBlur(event) {
      event.preventDefault();

      this._resetEventParameter();
    }
    /**
     * @summary マウスを押した時のイベント
     *
     * @param {MouseEvent} event  マウスイベントデータ
     * @memberof StandardUIViewer
     */

  }, {
    key: "_onMouseDown",
    value: function _onMouseDown(event) {
      event.preventDefault();
      var mouse_position = [event.clientX, event.clientY];
      this._mouse_down_position = mouse_position;
      this._pre_mouse_position = mouse_position; // 左ボタン

      if (event.button == 0) {
        if (event.shiftKey) {
          this._operation_mode = StandardUIViewer.OperationMode.ROTATE;
          var camera = this._viewer.camera;
          var ray = camera.getCanvasRay(this._mouse_down_position);
          this._rotate_center = this._viewer.getRayIntersection(ray);
        } else if (event.ctrlKey) {
          this._operation_mode = StandardUIViewer.OperationMode.FREE_ROTATE;
        } else {
          this._operation_mode = StandardUIViewer.OperationMode.TRANSLATE;
        }
      } // 中ボタン
      else if (event.button == 1) {
          this._operation_mode = StandardUIViewer.OperationMode.ROTATE;
          var camera = this._viewer.camera;
          var ray = camera.getCanvasRay(this._mouse_down_position);
          this._rotate_center = this._viewer.getRayIntersection(ray);
        } // 右ボタン
        else if (event.button == 2) {
            this._operation_mode = StandardUIViewer.OperationMode.HEIGHT_TRANSLATE;
          }
    }
    /**
     * @summary マウスを動かした時のイベント
     *
     * @param {MouseEvent} event  マウスイベントデータ
     * @memberof StandardUIViewer
     */

  }, {
    key: "_onMouseMove",
    value: function _onMouseMove(event) {
      event.preventDefault();
      var mouse_position = [event.clientX, event.clientY]; //　平行移動

      if (this._operation_mode == StandardUIViewer.OperationMode.TRANSLATE) {
        this._translate_drag[0] += mouse_position[0] - this._pre_mouse_position[0];
        this._translate_drag[1] += mouse_position[1] - this._pre_mouse_position[1];
      } //　回転移動
      else if (this._operation_mode == StandardUIViewer.OperationMode.ROTATE) {
          this._rotate_drag[0] += mouse_position[0] - this._pre_mouse_position[0];
          this._rotate_drag[1] += mouse_position[1] - this._pre_mouse_position[1];
        } else if (this._operation_mode == StandardUIViewer.OperationMode.FREE_ROTATE) {
          this._free_rotate_drag[0] += mouse_position[0] - this._pre_mouse_position[0];
          this._free_rotate_drag[1] += mouse_position[1] - this._pre_mouse_position[1];
        } // 高度変更
        else if (this._operation_mode == StandardUIViewer.OperationMode.HEIGHT_TRANSLATE) {
            // 横方向は平行移動する
            this._translate_drag[0] += mouse_position[0] - this._pre_mouse_position[0];
            this._height_drag[1] += mouse_position[1] - this._pre_mouse_position[1];
          } // マウス位置の更新


      this._pre_mouse_position = mouse_position;
    }
    /**
     * @summary マウスを上げた時のイベント
     *
     * @param {MouseEvent} event  マウスイベントデータ
     * @memberof StandardUIViewer
     */

  }, {
    key: "_onMouseUp",
    value: function _onMouseUp(event) {
      event.preventDefault();

      this._resetEventParameter();
    }
    /**
     * @summary マウスホイールを動かした時のイベント
     *
     * @param {MouseWheelEvent} event
     * @memberof StandardUIViewer
     */

  }, {
    key: "_onMouseWheel",
    value: function _onMouseWheel(event) {
      event.preventDefault();
      var mouse_position = [event.clientX, event.clientY];
      this._mouse_down_position = mouse_position;
      var zoom = 0;
      zoom = -1 * Math.sign(event.deltaY) * Math.ceil(Math.abs(event.deltaY) / 100);
      this._zoom_wheel += zoom;
    }
    /**
     * @summary キーを押した時のイベント
     *
     * @param {KeyboardEvent} event
     * @memberof StandardUIViewer
     */

  }, {
    key: "_onKeyDown",
    value: function _onKeyDown(event) {
      event.preventDefault();

      switch (event.key) {
        // [c] 画角の拡大
        case "c":
        case "C":
          this._operation_mode = StandardUIViewer.OperationMode.CHANGE_FOVY;
          this._fovy_key = 1;
          break;
        // [z] 画角の縮小

        case "z":
        case "Z":
          this._operation_mode = StandardUIViewer.OperationMode.CHANGE_FOVY;
          this._fovy_key = -1;
          break;
        // [x] 画角の初期化

        case "x":
        case "X":
          this._camera_parameter.fov = this._default_fov;
          break;
        // ↑ 前進

        case "ArrowUp":
          // 画面中央を移動基準にする
          var canvas = this._viewer.canvas_element;
          var mouse_position = [canvas.width / 2, canvas.height / 2];
          this._mouse_down_position = mouse_position;
          this._translate_drag[1] = 100;
          this._key_mode = true;
          break;
        // ↓ 後退

        case "ArrowDown":
          // 画面中央を移動基準にする
          var canvas = this._viewer.canvas_element;
          var mouse_position = [canvas.width / 2, canvas.height / 2];
          this._mouse_down_position = mouse_position;
          this._translate_drag[1] = -100;
          this._key_mode = true;
          break;
        // ← 左回転

        case "ArrowLeft":
          // 画面中央を移動基準にする
          this._free_rotate_drag[0] = 100;
          this._key_mode = true;
          break;

        case "ArrowRight":
          // 画面中央を移動基準にする
          this._free_rotate_drag[0] = -100;
          this._key_mode = true;
          break;
      }
    }
    /**
     * @summary キーを挙げた時のイベント
     *
     * @param {KeyboardEvent} event
     * @memberof StandardUIViewer
     */

  }, {
    key: "_onKeyUp",
    value: function _onKeyUp(event) {
      event.preventDefault();

      switch (event.key) {
        // [c] 画角の拡大
        case "c":
        case "C":
          this._operation_mode = StandardUIViewer.OperationMode.NONE;
          this._fovy_key = 0;
          break;
        // [z] 画角の縮小

        case "z":
        case "Z":
          this._operation_mode = StandardUIViewer.OperationMode.NONE;
          this._fovy_key = 0;
          break;
        // ↑ 前進

        case "ArrowUp":
          this._operation_mode = StandardUIViewer.OperationMode.NONE;
          this._translate_drag[1] = 0;
          this._key_mode = false;
          break;
        // ↓ 後退

        case "ArrowDown":
          this._operation_mode = StandardUIViewer.OperationMode.NONE;
          this._translate_drag[1] = 0;
          this._key_mode = false;
          break;
        // ← 左回転

        case "ArrowLeft":
          this._operation_mode = StandardUIViewer.OperationMode.NONE;
          this._free_rotate_drag[0] = 0;
          this._key_mode = false;
          break;

        case "ArrowRight":
          this._operation_mode = StandardUIViewer.OperationMode.NONE;
          this._free_rotate_drag[0] = 0;
          this._key_mode = false;
          break;
      }
    }
    /**
     * @summary イベントパラメータの初期化
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_resetEventParameter",
    value: function _resetEventParameter() {
      this._translate_drag[0] = 0;
      this._translate_drag[1] = 0;
      this._rotate_drag[0] = 0;
      this._rotate_drag[1] = 0;
      this._free_rotate_drag[0] = 0;
      this._free_rotate_drag[1] = 0;
      this._height_drag[0] = 0;
      this._height_drag[1] = 0;
      this._operation_mode = StandardUIViewer.OperationMode.NONE;
    }
    /**
     * @カメラの平行移動
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_translation",
    value: function _translation(delta_time) {
      if (this._translate_drag[0] != 0 || this._translate_drag[1] != 0) {
        if (this._key_mode) {
          this._translate_drag[0] *= delta_time;
          this._translate_drag[1] *= delta_time;
        }

        var camera = this._viewer.camera;
        var ray = camera.getCanvasRay(this._mouse_down_position);

        var start_position = this._viewer.getRayIntersection(ray);

        var end_mouse_position = [this._mouse_down_position[0] + this._translate_drag[0], this._mouse_down_position[1] + this._translate_drag[1]];
        ray = camera.getCanvasRay(end_mouse_position);

        var end_position = this._viewer.getRayIntersection(ray);

        if (start_position == null || end_position == null) {
          return;
        }

        var start_spherical_position = new mapray.GeoPoint();
        start_spherical_position.setFromGocs(start_position);
        var end_spherical_position = new mapray.GeoPoint();
        end_spherical_position.setFromGocs(end_position); // 球とレイの交点計算

        var variable_A = Math.pow(this._getVectorLength(ray.direction), 2);
        var variable_B = 2 * GeoMath.dot3(ray.position, ray.direction);
        var variable_C = Math.pow(this._getVectorLength(ray.position), 2) - Math.pow(start_spherical_position.altitude + GeoMath.EARTH_RADIUS, 2);
        var variable_D = variable_B * variable_B - 4 * variable_A * variable_C; // カメラより選択した場所の高度が高い、交点が取れない場合は補正しない

        if (start_spherical_position.altitude < this._camera_parameter.height && end_spherical_position.altitude < this._camera_parameter.height && variable_D > 0) {
          var variable_t1 = (-variable_B + Math.sqrt(variable_D)) / 2 * variable_A;
          var variable_t2 = (-variable_B - Math.sqrt(variable_D)) / 2 * variable_A;
          var variable_t = Math.min(variable_t1, variable_t2);
          end_position[0] = ray.position[0] + variable_t * ray.direction[0];
          end_position[1] = ray.position[1] + variable_t * ray.direction[1];
          end_position[2] = ray.position[2] + variable_t * ray.direction[2];
          end_spherical_position.setFromGocs(end_position);
        }

        var delta_latitude = end_spherical_position.latitude - start_spherical_position.latitude;
        var delta_longitude = end_spherical_position.longitude - start_spherical_position.longitude;
        this._camera_parameter.latitude -= delta_latitude;
        this._camera_parameter.longitude -= delta_longitude;
        this._translate_drag[0] = 0;
        this._translate_drag[1] = 0; // マウスダウンの位置を更新する

        this._mouse_down_position = this._pre_mouse_position;
      }
    }
    /**
     * @summary カメラの回転（回転中心指定）
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_rotation",
    value: function _rotation() {
      if (this._rotate_drag[0] != 0 || this._rotate_drag[1] != 0) {
        if (this._rotate_center == null) {
          this._rotate_drag[0] = 0;
          this._rotate_drag[1] = 0;
          return;
        }

        var camera = this._viewer.camera;
        var camera_direction = GeoMath.createVector3();
        camera_direction[0] = camera.view_to_gocs[12] - this._rotate_center[0];
        camera_direction[1] = camera.view_to_gocs[13] - this._rotate_center[1];
        camera_direction[2] = camera.view_to_gocs[14] - this._rotate_center[2];
        var center_geoPoint = new mapray.GeoPoint();
        center_geoPoint.setFromGocs(this._rotate_center);
        var center_matrix = center_geoPoint.getMlocsToGocsMatrix(GeoMath.createMatrix());
        var rotate_axis = GeoMath.createVector3();
        rotate_axis[0] = center_matrix[8];
        rotate_axis[1] = center_matrix[9];
        rotate_axis[2] = center_matrix[10];
        rotate_axis = GeoMath.normalize3(rotate_axis, GeoMath.createVector3()); // カメラ自身を回転

        var yaw_angle = -this._rotate_drag[0] / 10;
        var pitch_angle = -this._rotate_drag[1] / 10;

        var rotated_direction = this._rotateVector(camera_direction, rotate_axis, yaw_angle);

        var after_pitch = GeoMath.clamp(this._camera_parameter.pitch + pitch_angle, 0, 90);

        if (after_pitch != this._camera_parameter.pitch) {
          rotate_axis[0] = camera.view_to_gocs[0];
          rotate_axis[1] = camera.view_to_gocs[1];
          rotate_axis[2] = camera.view_to_gocs[2];
          rotated_direction = this._rotateVector(rotated_direction, rotate_axis, pitch_angle);
        }

        var new_position = GeoMath.createVector3();
        new_position[0] = this._rotate_center[0] + rotated_direction[0];
        new_position[1] = this._rotate_center[1] + rotated_direction[1];
        new_position[2] = this._rotate_center[2] + rotated_direction[2];
        var new_spherical_position = new mapray.GeoPoint();
        new_spherical_position.setFromGocs(new_position);
        this._camera_parameter.latitude = new_spherical_position.latitude;
        this._camera_parameter.longitude = new_spherical_position.longitude;
        this._camera_parameter.height = new_spherical_position.altitude;
        this._camera_parameter.yaw += yaw_angle;
        this._camera_parameter.pitch = after_pitch;
        this._rotate_drag[0] = 0;
        this._rotate_drag[1] = 0;
      }
    }
    /**
     * @summary カメラの回転（自由回転）
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_freeRotation",
    value: function _freeRotation(delta_time) {
      if (this._free_rotate_drag[0] != 0 || this._free_rotate_drag[1] != 0) {
        if (this._key_mode) {
          this._free_rotate_drag[0] *= delta_time;
          this._free_rotate_drag[1] *= delta_time;
        } // カメラ自身を回転


        var yaw_angle = this._free_rotate_drag[0] / 10;
        var pitch_angle = this._free_rotate_drag[1] / 10;
        var after_pitch = GeoMath.clamp(this._camera_parameter.pitch + pitch_angle, 0, 90);
        this._camera_parameter.yaw += yaw_angle;
        this._camera_parameter.pitch = after_pitch;
        this._free_rotate_drag[0] = 0;
        this._free_rotate_drag[1] = 0;
      }
    }
    /**
     * @summary 高度変更
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_translationOfHeight",
    value: function _translationOfHeight() {
      if (this._height_drag[0] != 0 || this._height_drag[1] != 0) {
        var height_drag = this._height_drag[1];
        var factor = GeoMath.gudermannian((this._camera_parameter.height - 50000) / 10000) + Math.PI / 2;
        var delta_height = height_drag * 100 * factor;
        this._camera_parameter.height += delta_height;
        this._height_drag[0] = 0;
        this._height_drag[1] = 0;
      }
    }
    /**
     * @summary 視線方向への移動
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_translationOfEyeDirection",
    value: function _translationOfEyeDirection() {
      if (this._zoom_wheel != 0) {
        var camera = this._viewer.camera; // 移動中心

        var ray = camera.getCanvasRay(this._mouse_down_position);

        var translation_center = this._viewer.getRayIntersection(ray);

        if (translation_center == null) {
          this._zoom_wheel = 0;
          return;
        }

        var center_spherical_position = new mapray.GeoPoint();
        center_spherical_position.setFromGocs(translation_center);
        var factor = 1.0; // 30,000m以上は線形にする

        if (this._camera_parameter.height > 30000) {
          factor = Math.abs(this._camera_parameter.height - center_spherical_position.altitude) / 30000;
        } else {
          // マウスカーソルの下の地表面から2次曲線の傾きを求める（地表面で係数が収束するように）
          var gradient = 3 / Math.pow(center_spherical_position.altitude / 1000 - 30, 2); // 30,000mを基点にする。

          var km_height = this._camera_parameter.height / 1000 - 30;
          var param = gradient * Math.pow(km_height, 2) * km_height / Math.abs(km_height);
          factor = GeoMath.gudermannian(param) + Math.PI / 2;
        }

        var velocity = this._zoom_wheel * this._camera_parameter.speed_factor * factor;
        var translation_vector = GeoMath.createVector3();
        translation_vector[0] = translation_center[0] - camera.view_to_gocs[12];
        translation_vector[1] = translation_center[1] - camera.view_to_gocs[13];
        translation_vector[2] = translation_center[2] - camera.view_to_gocs[14];
        var translation_direction = GeoMath.createVector3();
        GeoMath.normalize3(translation_vector, translation_direction);
        var new_camera_gocs_position = GeoMath.createVector3();
        new_camera_gocs_position[0] = camera.view_to_gocs[12] + velocity * translation_direction[0];
        new_camera_gocs_position[1] = camera.view_to_gocs[13] + velocity * translation_direction[1];
        new_camera_gocs_position[2] = camera.view_to_gocs[14] + velocity * translation_direction[2]; // 移動中心を超える場合はこれ以上移動しない

        var new_position_vector = GeoMath.createVector3();
        new_position_vector[0] = new_camera_gocs_position[0] - camera.view_to_gocs[12];
        new_position_vector[1] = new_camera_gocs_position[1] - camera.view_to_gocs[13];
        new_position_vector[2] = new_camera_gocs_position[2] - camera.view_to_gocs[14];

        if (this._zoom_wheel < 0 || this._getVectorLength(translation_vector) > this._getVectorLength(new_position_vector)) {
          var new_camera_spherical_position = new mapray.GeoPoint();
          new_camera_spherical_position.setFromGocs(new_camera_gocs_position);
          this._camera_parameter.latitude = new_camera_spherical_position.latitude;
          this._camera_parameter.longitude = new_camera_spherical_position.longitude;
          this._camera_parameter.height = new_camera_spherical_position.altitude;
        }

        this._zoom_wheel = 0;
      }
    }
    /**
     * @summary 画角変更
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "_changeFovy",
    value: function _changeFovy() {
      var tanθh = Math.tan(0.5 * this._camera_parameter.fov * GeoMath.DEGREE);
      var θ = 2 * Math.atan(tanθh * Math.pow(StandardUIViewer.FOV_FACTOR, -this._fovy_key));
      var range = StandardUIViewer.FOV_RANGE;
      this._camera_parameter.fov = GeoMath.clamp(θ / GeoMath.DEGREE, range.min, range.max);
      this._fovy_key = 0;
    }
    /**
     * @カメラ位置の設定
     *
     * @param {object}  position            カメラ位置
     * @param {number}  position.latitude   緯度
     * @param {number}  position.longitude  経度
     * @param {number}  position.height     高さ
     * @memberof StandardUIViewer
     */

  }, {
    key: "setCameraPosition",
    value: function setCameraPosition(position) {
      this._camera_parameter.latitude = position.latitude;
      this._camera_parameter.longitude = position.longitude;
      this._camera_parameter.height = position.height; // 最低高度補正

      if (this._camera_parameter.height < StandardUIViewer.MINIMUM_HEIGHT) {
        this._camera_parameter.height = StandardUIViewer.MINIMUM_HEIGHT;
      }
    }
    /**
     * @注視点の設定
     *
     * @param {object}  position            カメラ位置
     * @param {number}  position.latitude   緯度
     * @param {number}  position.longitude  経度
     * @param {number}  position.height     高さ
     * @memberof StandardUIViewer
     */

  }, {
    key: "setLookAtPosition",
    value: function setLookAtPosition(position) {
      // 現在の視線方向を取得
      var current_camera_geoPoint = new GeoPoint(this._camera_parameter.longitude, this._camera_parameter.latitude, this._camera_parameter.height);
      var current_camera_matrix = current_camera_geoPoint.getMlocsToGocsMatrix(GeoMath.createMatrix());
      var current_y_direction = GeoMath.createVector3();
      current_y_direction[0] = current_camera_matrix[4];
      current_y_direction[1] = current_camera_matrix[5];
      current_y_direction[2] = current_camera_matrix[6];
      var target_camera_geoPoint = new GeoPoint(position.longitude, position.latitude, position.height);
      var target_camera_matrix = target_camera_geoPoint.getMlocsToGocsMatrix(GeoMath.createMatrix());
      var target_camera_direction = GeoMath.createVector3();
      target_camera_direction[0] = target_camera_matrix[12] - current_camera_matrix[12];
      target_camera_direction[1] = target_camera_matrix[13] - current_camera_matrix[13];
      target_camera_direction[2] = target_camera_matrix[14] - current_camera_matrix[14];
      current_y_direction = GeoMath.normalize3(current_y_direction, GeoMath.createVector3());
      target_camera_direction = GeoMath.normalize3(target_camera_direction, GeoMath.createVector3());
      var rotate_axis = GeoMath.createVector3();
      rotate_axis[0] = current_camera_matrix[8];
      rotate_axis[1] = current_camera_matrix[9];
      rotate_axis[2] = current_camera_matrix[10];

      var yaw_angle = this._calculateAngle(rotate_axis, current_y_direction, target_camera_direction);

      this._camera_parameter.yaw = yaw_angle;
      var current_camera_direction = GeoMath.createVector3();
      current_camera_direction[0] = current_camera_matrix[8];
      current_camera_direction[1] = current_camera_matrix[9];
      current_camera_direction[2] = current_camera_matrix[10];
      rotate_axis[0] = current_camera_matrix[0];
      rotate_axis[1] = current_camera_matrix[1];
      rotate_axis[2] = current_camera_matrix[2];
      target_camera_direction[0] = -1 * target_camera_direction[0];
      target_camera_direction[1] = -1 * target_camera_direction[1];
      target_camera_direction[2] = -1 * target_camera_direction[2];
      this._camera_parameter.pitch = GeoMath.clamp(Math.abs(this._calculateAngle(rotate_axis, current_camera_direction, target_camera_direction)), 0, 90);
    }
    /**
     * @summary カメラパラメータの設定
     *
     * @param {object}  parameter               カメラパラメータ
     * @param {number}  parameter.fov           画角
     * @param {number}  parameter.near          近接平面距離
     * @param {number}  parameter.far           遠方平面距離
     * @param {number}  parameter.speed_factor  移動速度係数
     * @memberof StandardUIViewer
     */

  }, {
    key: "setCameraParameter",
    value: function setCameraParameter(parameter) {
      if (parameter.fov) {
        this._camera_parameter.fov = parameter.fov;
        this._default_fov = parameter.fov;
      }

      if (parameter.near) {
        this._camera_parameter.near = parameter.near;
      }

      if (parameter.far) {
        this._camera_parameter.far = parameter.far;
      }

      if (parameter.speed_factor) {
        this._camera_parameter.speed_factor = parameter.speed_factor;
      }
    }
    /**
     * @summary レイヤの取得
     *
     * @param {number} index    レイヤ番号
     * @returns {mapray.Layer}  レイヤ
     * @memberof StandardUIViewer
     */

  }, {
    key: "getLayer",
    value: function getLayer(index) {
      return this._viewer.layers.getLayer(index);
    }
    /**
     * @summary レイヤ数の取得
     *
     * @returns {number}    レイヤ数
     * @memberof StandardUIViewer
     */

  }, {
    key: "getLayerNum",
    value: function getLayerNum() {
      return this._viewer.layers.num_layers();
    }
    /**
     * @summary レイヤの追加（末尾）
     *
     * @param {object}               layer                  作成するレイヤのプロパティ
     * @param {mapray.ImageProvider} layer.image_provider   画像プロバイダ
     * @param {boolean}              layer.visibility       可視性フラグ
     * @param {number}               layer.opacity          不透明度
     * @memberof StandardUIViewer
     */

  }, {
    key: "addLayer",
    value: function addLayer(layer) {
      this._viewer.layers.add(layer);
    }
    /**
     * @summary レイヤの追加（任意）
     *
     * @param {number}               index                  挿入場所
     * @param {object}               layer                  作成するレイヤのプロパティ
     * @param {mapray.ImageProvider} layer.image_provider   画像プロバイダ
     * @param {boolean}              layer.visibility       可視性フラグ
     * @param {number}               layer.opacity          不透明度
     * @memberof StandardUIViewer
     */

  }, {
    key: "insertLayer",
    value: function insertLayer(index, layer) {
      this._viewer.layers.insert(index, layer);
    }
    /**
     * @summary レイヤの削除
     *
     * @param {number} index    レイヤ番号
     * @memberof StandardUIViewer
     */

  }, {
    key: "removeLayer",
    value: function removeLayer(index) {
      this._viewer.layers.remove(index);
    }
    /**
     * @summary レイヤの全削除
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "clearLayer",
    value: function clearLayer() {
      this._viewer.layers.clear();
    }
    /**
     * @summary エンティティの取得
     *
     * @param {number} index     エンティティ番号
     * @returns {mapray.Entity}  エンティティ
     * @memberof StandardUIViewer
     */

  }, {
    key: "getEntity",
    value: function getEntity(index) {
      return this._viewer.scene.getEntity(index);
    }
    /**
     * @summary エンティティ数の取得
     *
     * @returns {number}    エンティティ数
     * @memberof StandardUIViewer
     */

  }, {
    key: "getEntityNum",
    value: function getEntityNum() {
      return this._viewer.scene.num_entities();
    }
    /**
     * @summary エンティティの追加
     *
     * @param {mapray.Entity} entity    エンティティ
     * @memberof StandardUIViewer
     */

  }, {
    key: "addEntity",
    value: function addEntity(entity) {
      this._viewer.scene.addEntity(entity);
    }
    /**
     * @summary エンティティの削除
     *
     * @param {mapray.Entity} entity    エンティティ
     * @memberof StandardUIViewer
     */

  }, {
    key: "removeEntity",
    value: function removeEntity(entity) {
      this._viewer.scene.removeEntity(entity);
    }
    /**
     * @summary エンティティの全削除
     *
     * @memberof StandardUIViewer
     */

  }, {
    key: "clearEntity",
    value: function clearEntity() {
      this._viewer.scene.clearEntity();
    }
    /**
     * @summary 3次元ベクトルの長さの算出
     *
     * @param {mapray.Vector3} vector   対象ベクトル
     * @returns {number}                長さ
     * @memberof StandardUIViewer
     */

  }, {
    key: "_getVectorLength",
    value: function _getVectorLength(vector) {
      return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2) + Math.pow(vector[2], 2));
    }
    /**
     * @summary 3次元ベクトルの任意軸の回転
     *
     * @param {mapray.Vector3} vector   対象ベクトル
     * @param {mapray.Vector3} axis     回転軸
     * @param {number}         angle    回転角度（deg.）
     * @returns {mapray.Vector3}        回転後ベクトル
     * @memberof StandardUIViewer
     */

  }, {
    key: "_rotateVector",
    value: function _rotateVector(vector, axis, angle) {
      var rotate_matrix = GeoMath.rotation_matrix(axis, angle, GeoMath.createMatrix());
      var target_vector = GeoMath.createVector3();
      target_vector[0] = vector[0] * rotate_matrix[0] + vector[1] * rotate_matrix[4] + vector[2] * rotate_matrix[8] + rotate_matrix[12];
      target_vector[1] = vector[0] * rotate_matrix[1] + vector[1] * rotate_matrix[5] + vector[2] * rotate_matrix[9] + rotate_matrix[13];
      target_vector[2] = vector[0] * rotate_matrix[2] + vector[1] * rotate_matrix[6] + vector[2] * rotate_matrix[10] + rotate_matrix[14];
      return target_vector;
    }
    /**
     * @summary 任意軸回りの回転角度の算出
     *
     * @param {mapray.Vector3} axis             回転軸
     * @param {mapray.Vector3} basis_vector     基準ベクトル
     * @param {mapray.Vector3} target_vector    目標ベクトル
     * @returns {number}                        回転角度（deg.）
     * @memberof StandardUIViewer
     */

  }, {
    key: "_calculateAngle",
    value: function _calculateAngle(axis, basis_vector, target_vector) {
      var a_vector = GeoMath.createVector3();
      var dot_value = GeoMath.dot3(axis, basis_vector);

      for (var i = 0; i < 3; i++) {
        a_vector[i] = basis_vector[i] - dot_value * axis[i];
      }

      var b_vector = GeoMath.createVector3();
      dot_value = GeoMath.dot3(axis, target_vector);

      for (var i = 0; i < 3; i++) {
        b_vector[i] = target_vector[i] - dot_value * axis[i];
      }

      GeoMath.normalize3(a_vector, a_vector);
      GeoMath.normalize3(b_vector, b_vector);

      if (Math.abs(this._getVectorLength(a_vector) < 1.0e-6) || Math.abs(this._getVectorLength(b_vector) < 1.0e-6)) {
        angle = 0;
      } else {
        var angle = Math.acos(GeoMath.clamp(GeoMath.dot3(a_vector, b_vector) / (this._getVectorLength(a_vector) * this._getVectorLength(b_vector)), -1, 1)) / GeoMath.DEGREE;
        var cross_vector = GeoMath.cross3(a_vector, b_vector, GeoMath.createVector3());
        cross_vector = GeoMath.normalize3(cross_vector, GeoMath.createVector3());

        if (GeoMath.dot3(axis, cross_vector) < 0) {
          angle *= -1;
        }
      }

      return angle;
    }
  }, {
    key: "viewer",
    get: function get() {
      return this._viewer;
    }
  }]);

  return StandardUIViewer;
}(mapray.RenderCallback);

var OperationMode = {
  NONE: "NONE",
  TRANSLATE: "TRANSLATE",
  ROTATE: "ROTATE",
  FREE_ROTATE: "FREE_ROTATE",
  EYE_TRANSLATE: "EYE_TRANSLATE",
  HEIGHT_TRANSLATE: "HEIGHT_TRANSLATE",
  CHANGE_FOVY: "CHANGE_FOVY"
};
{
  StandardUIViewer.OperationMode = OperationMode; // カメラ位置の初期値（本栖湖付近）

  StandardUIViewer.DEFAULT_CAMERA_POSITION = {
    latitude: 35.475968,
    longitude: 138.573161,
    height: 2000
  }; // 注視点位置の初期値（富士山付近）

  StandardUIViewer.DEFAULT_LOOKAT_POSITION = {
    latitude: 35.360626,
    longitude: 138.727363,
    height: 2000
  }; // カメラパラメータの初期値

  StandardUIViewer.DEFAULT_CAMERA_PARAMETER = {
    fov: 60,
    near: 30,
    far: 500000,
    speed_factor: 5000
  }; // カメラと地表面までの最低距離

  StandardUIViewer.MINIMUM_HEIGHT = 15; // 最小近接平面距離

  StandardUIViewer.MINIMUM_NEAR = 1.0; // 最小遠方平面距離

  StandardUIViewer.MINIMUM_FAR = 500000; // 高度からの近接平面距離を計算するための係数

  StandardUIViewer.NEAR_FACTOR = 0.5; // 近接平面距離からの遠方平面距離を計算するための係数

  StandardUIViewer.FAR_FACTOR = 10000; // 画角の適用範囲

  StandardUIViewer.FOV_RANGE = {
    min: 5,
    max: 120
  }; // 画角の倍率　θ' = 2 atan(tan(θ/2)*f)

  StandardUIViewer.FOV_FACTOR = 1.148698354997035;
}

/**
 * Mapray UI関連の機能が含まれる名前空間
 * @namespace maprayui
 */

var maprayui = {
  StandardUIViewer: StandardUIViewer
};

return maprayui;

})));
//# sourceMappingURL=maprayui.js.map
