/*!
 * Vue.js v2.7.16
 * (c) 2014-2026 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  var emptyObject = Object.freeze({});
  var isArray$1 = Array.isArray;
  // These helpers produce better VM code in JS engines due to their
  // explicitness and function inlining.
  function isUndef(v) {
      return v === undefined || v === null;
  }
  function isDef(v) {
      return v !== undefined && v !== null;
  }
  function isTrue(v) {
      return v === true;
  }
  function isFalse(v) {
      return v === false;
  }
  /**
   * Check if value is primitive.
   */
  function isPrimitive(value) {
      return (typeof value === 'string' ||
          typeof value === 'number' ||
          // $flow-disable-line
          typeof value === 'symbol' ||
          typeof value === 'boolean');
  }
  function isFunction$2(value) {
      return typeof value === 'function';
  }
  /**
   * Quick object check - this is primarily used to tell
   * objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject$1(obj) {
      return obj !== null && typeof obj === 'object';
  }
  /**
   * Get the raw type string of a value, e.g., [object Object].
   */
  var _toString = Object.prototype.toString;
  function toRawType(value) {
      return _toString.call(value).slice(8, -1);
  }
  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject$1(obj) {
      return _toString.call(obj) === '[object Object]';
  }
  function isRegExp$1(v) {
      return _toString.call(v) === '[object RegExp]';
  }
  /**
   * Check if val is a valid array index.
   */
  function isValidArrayIndex(val) {
      var n = parseFloat(String(val));
      return n >= 0 && Math.floor(n) === n && isFinite(val);
  }
  function isPromise(val) {
      return (isDef(val) &&
          typeof val.then === 'function' &&
          typeof val.catch === 'function');
  }
  /**
   * Convert a value to a string that is actually rendered.
   */
  function toString$1(val) {
      return val == null
          ? ''
          : Array.isArray(val) || (isPlainObject$1(val) && val.toString === _toString)
              ? JSON.stringify(val, replacer, 2)
              : String(val);
  }
  function replacer(_key, val) {
      // avoid circular deps from v3
      if (val && val.__v_isRef) {
          return val.value;
      }
      return val;
  }
  /**
   * Convert an input value to a number for persistence.
   * If the conversion fails, return original string.
   */
  function toNumber(val) {
      var n = parseFloat(val);
      return isNaN(n) ? val : n;
  }
  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   */
  function makeMap(str, expectsLowerCase) {
      var map = Object.create(null);
      var list = str.split(',');
      for (var i = 0; i < list.length; i++) {
          map[list[i]] = true;
      }
      return expectsLowerCase ? function (val) { return map[val.toLowerCase()]; } : function (val) { return map[val]; };
  }
  /**
   * Check if a tag is a built-in tag.
   */
  var isBuiltInTag = makeMap('slot,component', true);
  /**
   * Check if an attribute is a reserved attribute.
   */
  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');
  /**
   * Remove an item from an array.
   */
  function remove$2(arr, item) {
      var len = arr.length;
      if (len) {
          // fast path for the only / last item
          if (item === arr[len - 1]) {
              arr.length = len - 1;
              return;
          }
          var index = arr.indexOf(item);
          if (index > -1) {
              return arr.splice(index, 1);
          }
      }
  }
  /**
   * Check whether an object has the property.
   */
  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  function hasOwn(obj, key) {
      return hasOwnProperty$1.call(obj, key);
  }
  /**
   * Create a cached version of a pure function.
   */
  function cached(fn) {
      var cache = Object.create(null);
      return function cachedFn(str) {
          var hit = cache[str];
          return hit || (cache[str] = fn(str));
      };
  }
  /**
   * Camelize a hyphen-delimited string.
   */
  var camelizeRE = /-(\w)/g;
  var camelize = cached(function (str) {
      return str.replace(camelizeRE, function (_, c) { return (c ? c.toUpperCase() : ''); });
  });
  /**
   * Capitalize a string.
   */
  var capitalize = cached(function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
  });
  /**
   * Hyphenate a camelCase string.
   */
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cached(function (str) {
      return str.replace(hyphenateRE, '-$1').toLowerCase();
  });
  /**
   * Simple bind polyfill for environments that do not support it,
   * e.g., PhantomJS 1.x. Technically, we don't need this anymore
   * since native bind is now performant enough in most browsers.
   * But removing it would mean breaking code that was able to run in
   * PhantomJS 1.x, so this must be kept for backward compatibility.
   */
  /* istanbul ignore next */
  function polyfillBind(fn, ctx) {
      function boundFn(a) {
          var l = arguments.length;
          return l
              ? l > 1
                  ? fn.apply(ctx, arguments)
                  : fn.call(ctx, a)
              : fn.call(ctx);
      }
      boundFn._length = fn.length;
      return boundFn;
  }
  function nativeBind(fn, ctx) {
      return fn.bind(ctx);
  }
  // @ts-expect-error bind cannot be `undefined`
  var bind$2 = Function.prototype.bind ? nativeBind : polyfillBind;
  /**
   * Convert an Array-like object to a real Array.
   */
  function toArray$1(list, start) {
      start = start || 0;
      var i = list.length - start;
      var ret = new Array(i);
      while (i--) {
          ret[i] = list[i + start];
      }
      return ret;
  }
  /**
   * Mix properties into target object.
   */
  function extend$1(to, _from) {
      for (var key in _from) {
          to[key] = _from[key];
      }
      return to;
  }
  /**
   * Merge an Array of Objects into a single Object.
   */
  function toObject(arr) {
      var res = {};
      for (var i = 0; i < arr.length; i++) {
          if (arr[i]) {
              extend$1(res, arr[i]);
          }
      }
      return res;
  }
  /* eslint-disable no-unused-vars */
  /**
   * Perform no operation.
   * Stubbing args to make Flow happy without leaving useless transpiled code
   * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
   */
  function noop$1(a, b, c) { }
  /**
   * Always return false.
   */
  var no = function (a, b, c) { return false; };
  /* eslint-enable no-unused-vars */
  /**
   * Return the same value.
   */
  var identity = function (_) { return _; };
  /**
   * Generate a string containing static keys from compiler modules.
   */
  function genStaticKeys$1(modules) {
      return modules
          .reduce(function (keys, m) { return keys.concat(m.staticKeys || []); }, [])
          .join(',');
  }
  /**
   * Check if two values are loosely equal - that is,
   * if they are plain objects, do they have the same shape?
   */
  function looseEqual(a, b) {
      if (a === b)
          return true;
      var isObjectA = isObject$1(a);
      var isObjectB = isObject$1(b);
      if (isObjectA && isObjectB) {
          try {
              var isArrayA = Array.isArray(a);
              var isArrayB = Array.isArray(b);
              if (isArrayA && isArrayB) {
                  return (a.length === b.length &&
                      a.every(function (e, i) {
                          return looseEqual(e, b[i]);
                      }));
              }
              else if (a instanceof Date && b instanceof Date) {
                  return a.getTime() === b.getTime();
              }
              else if (!isArrayA && !isArrayB) {
                  var keysA = Object.keys(a);
                  var keysB = Object.keys(b);
                  return (keysA.length === keysB.length &&
                      keysA.every(function (key) {
                          return looseEqual(a[key], b[key]);
                      }));
              }
              else {
                  /* istanbul ignore next */
                  return false;
              }
          }
          catch (e) {
              /* istanbul ignore next */
              return false;
          }
      }
      else if (!isObjectA && !isObjectB) {
          return String(a) === String(b);
      }
      else {
          return false;
      }
  }
  /**
   * Return the first index at which a loosely equal value can be
   * found in the array (if value is a plain object, the array must
   * contain an object of the same shape), or -1 if it is not present.
   */
  function looseIndexOf(arr, val) {
      for (var i = 0; i < arr.length; i++) {
          if (looseEqual(arr[i], val))
              return i;
      }
      return -1;
  }
  /**
   * Ensure a function is called only once.
   */
  function once(fn) {
      var called = false;
      return function () {
          if (!called) {
              called = true;
              fn.apply(this, arguments);
          }
      };
  }
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#polyfill
  function hasChanged(x, y) {
      if (x === y) {
          return x === 0 && 1 / x !== 1 / y;
      }
      else {
          return x === x || y === y;
      }
  }

  var SSR_ATTR = 'data-server-rendered';
  var ASSET_TYPES = ['component', 'directive', 'filter'];
  var LIFECYCLE_HOOKS = [
      'beforeCreate',
      'created',
      'beforeMount',
      'mounted',
      'beforeUpdate',
      'updated',
      'beforeDestroy',
      'destroyed',
      'activated',
      'deactivated',
      'errorCaptured',
      'serverPrefetch',
      'renderTracked',
      'renderTriggered'
  ];

  var config = {
      /**
       * Option merge strategies (used in core/util/options)
       */
      // $flow-disable-line
      optionMergeStrategies: Object.create(null),
      /**
       * Whether to suppress warnings.
       */
      silent: false,
      /**
       * Show production mode tip message on boot?
       */
      productionTip: true,
      /**
       * Whether to enable devtools
       */
      devtools: true,
      /**
       * Whether to record perf
       */
      performance: false,
      /**
       * Axios default base URL
       */
      axiosBaseURL: '',
      /**
       * Axios default token
       */
      axiosToken: '',
      /**
       * Axios default timeout (ms)
       */
      axiosTimeout: 0,
      /**
       * Axios default headers
       */
      axiosHeaders: null,
      /**
       * Axios request interceptor
       */
      axiosRequestInterceptor: null,
      /**
       * Axios response interceptor
       */
      axiosResponseInterceptor: null,
      /**
       * Axios request error interceptor
       */
      axiosRequestErrorInterceptor: null,
      /**
       * Axios response error interceptor
       */
      axiosResponseErrorInterceptor: null,
      /**
       * Default component base path
       */
      componentPath: '/components',
      /**
       * Default component file extension
       */
      componentExtension: '.tpl',
      /**
       * Default fallback component name
       */
      componentFallback: 'component-notfound',
      /**
       * Auto-fetch components from server when not found
       * Enable automatic component resolution
       * Default: false - components must be explicitly loaded
       */
      autoFetchComponents: false,
      /**
       * Enable server-side bundling for async components
       */
      serverSide: false,
      /**
       * URL for the SSR bundler service
       */
      serverSideURL: '',
      /**
       * Socket/RTC configuration
       */
      socket: {
          enabled: false,
          broadcaster: 'pusher',
          key: '',
          host: '',
          port: 80,
          forceTLS: false,
          authEndpoint: '/broadcasting/auth'
      },
      /**
       * Enable Hot Module Replacement
       * When true, connects to HMR WebSocket server for hot reload
       */
      hmr: false,
      /**
       * File extensions to watch for HMR
       * Server will only watch files with these extensions
       */
      hmrFiles: ['css', 'vue', 'tpl', 'js'],
      /**
       * HMR WebSocket server port
       */
      hmrPort: 8003,
      /**
       * HMR WebSocket server host
       */
      hmrHost: 'localhost',
      /**
       * Use secure WebSocket (wss://) instead of ws://
       */
      hmrSecure: false,
      /**
       * Is enable async component
       */
      asyncComponent: false,
      /**
       * Error handler for watcher errors
       */
      errorHandler: null,
      /**
       * Warn handler for watcher warns
       */
      warnHandler: null,
      /**
       * Ignore certain custom elements
       */
      ignoredElements: [],
      /**
       * Custom user key aliases for v-on
       */
      // $flow-disable-line
      keyCodes: Object.create(null),
      /**
       * Check if a tag is reserved so that it cannot be registered as a
       * component. This is platform-dependent and may be overwritten.
       */
      isReservedTag: no,
      /**
       * Check if an attribute is reserved so that it cannot be used as a component
       * prop. This is platform-dependent and may be overwritten.
       */
      isReservedAttr: no,
      /**
       * Check if a tag is an unknown element.
       * Platform-dependent.
       */
      isUnknownElement: no,
      /**
       * Get the namespace of an element
       */
      getTagNamespace: noop$1,
      /**
       * Parse the real tag name for the specific platform.
       */
      parsePlatformTagName: identity,
      /**
       * Check if an attribute must be bound using property, e.g. value
       * Platform-dependent.
       */
      mustUseProp: no,
      /**
       * Perform updates asynchronously. Intended to be used by Vue Test Utils
       * This will significantly reduce performance if set to false.
       */
      async: true,
      /**
       * Exposed for legacy reasons
       */
      _lifecycleHooks: LIFECYCLE_HOOKS
  };

  /**
   * unicode letters used for parsing html tags, component names and property paths.
   * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
   * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
   */
  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
  /**
   * Check if a string starts with $ or _
   */
  function isReserved(str) {
      var c = (str + '').charCodeAt(0);
      return c === 0x24 || c === 0x5f;
  }
  /**
   * Define a property.
   */
  function def(obj, key, val, enumerable) {
      Object.defineProperty(obj, key, {
          value: val,
          enumerable: !!enumerable,
          writable: true,
          configurable: true
      });
  }
  /**
   * Parse simple path.
   */
  var bailRE = new RegExp("[^".concat(unicodeRegExp.source, ".$_\\d]"));
  function parsePath(path) {
      if (bailRE.test(path)) {
          return;
      }
      var segments = path.split('.');
      return function (obj) {
          for (var i = 0; i < segments.length; i++) {
              if (!obj)
                  return;
              obj = obj[segments[i]];
          }
          return obj;
      };
  }

  // can we use __proto__?
  var hasProto = '__proto__' in {};
  // Browser environment sniffing
  var inBrowser = typeof window !== 'undefined';
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  UA && UA.indexOf('android') > 0;
  var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
  UA && /chrome\/\d+/.test(UA) && !isEdge;
  UA && /phantomjs/.test(UA);
  var isFF = UA && UA.match(/firefox\/(\d+)/);
  // Firefox has a "watch" function on Object.prototype...
  // @ts-expect-error firebox support
  var nativeWatch = {}.watch;
  var supportsPassive = false;
  if (inBrowser) {
      try {
          var opts = {};
          Object.defineProperty(opts, 'passive', {
              get: function () {
                  /* istanbul ignore next */
                  supportsPassive = true;
              }
          }); // https://github.com/facebook/flow/issues/285
          window.addEventListener('test-passive', null, opts);
      }
      catch (e) { }
  }
  // this needs to be lazy-evaled because vue may be required before
  // vue-server-renderer can set VUE_ENV
  var _isServer;
  var isServerRendering = function () {
      if (_isServer === undefined) {
          /* istanbul ignore if */
          if (!inBrowser && typeof global !== 'undefined') {
              // detect presence of vue-server-renderer and avoid
              // Webpack shimming the process
              _isServer =
                  global['process'] && global['process'].env.VUE_ENV === 'server';
          }
          else {
              _isServer = false;
          }
      }
      return _isServer;
  };
  // detect devtools
  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
  /* istanbul ignore next */
  function isNative(Ctor) {
      return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
  }
  var hasSymbol = typeof Symbol !== 'undefined' &&
      isNative(Symbol) &&
      typeof Reflect !== 'undefined' &&
      isNative(Reflect.ownKeys);
  var _Set; // $flow-disable-line
  /* istanbul ignore if */ if (typeof Set !== 'undefined' && isNative(Set)) {
      // use native Set when available.
      _Set = Set;
  }
  else {
      // a non-standard Set polyfill that only works with primitive keys.
      _Set = /** @class */ (function () {
          function Set() {
              this.set = Object.create(null);
          }
          Set.prototype.has = function (key) {
              return this.set[key] === true;
          };
          Set.prototype.add = function (key) {
              this.set[key] = true;
          };
          Set.prototype.clear = function () {
              this.set = Object.create(null);
          };
          return Set;
      }());
  }

  var currentInstance = null;
  /**
   * This is exposed for compatibility with v3 (e.g. some functions in VueUse
   * relies on it). Do not use this internally, just use `currentInstance`.
   *
   * @internal this function needs manual type declaration because it relies
   * on previously manually authored types from Vue 2
   */
  function getCurrentInstance() {
      return currentInstance && { proxy: currentInstance };
  }
  /**
   * @internal
   */
  function setCurrentInstance(vm) {
      if (vm === void 0) { vm = null; }
      if (!vm)
          currentInstance && currentInstance._scope.off();
      currentInstance = vm;
      vm && vm._scope.on();
  }

  /**
   * @internal
   */
  var VNode = /** @class */ (function () {
      function VNode(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
          this.tag = tag;
          this.data = data;
          this.children = children;
          this.text = text;
          this.elm = elm;
          this.ns = undefined;
          this.context = context;
          this.fnContext = undefined;
          this.fnOptions = undefined;
          this.fnScopeId = undefined;
          this.key = data && data.key;
          this.componentOptions = componentOptions;
          this.componentInstance = undefined;
          this.parent = undefined;
          this.raw = false;
          this.isStatic = false;
          this.isRootInsert = true;
          this.isComment = false;
          this.isCloned = false;
          this.isOnce = false;
          this.asyncFactory = asyncFactory;
          this.asyncMeta = undefined;
          this.isAsyncPlaceholder = false;
      }
      Object.defineProperty(VNode.prototype, "child", {
          // DEPRECATED: alias for componentInstance for backwards compat.
          /* istanbul ignore next */
          get: function () {
              return this.componentInstance;
          },
          enumerable: false,
          configurable: true
      });
      return VNode;
  }());
  var createEmptyVNode = function (text) {
      if (text === void 0) { text = ''; }
      var node = new VNode();
      node.text = text;
      node.isComment = true;
      return node;
  };
  function createTextVNode(val) {
      return new VNode(undefined, undefined, undefined, String(val));
  }
  // optimized shallow clone
  // used for static nodes and slot nodes because they may be reused across
  // multiple renders, cloning them avoids errors when DOM manipulations rely
  // on their elm reference.
  function cloneVNode(vnode) {
      var cloned = new VNode(vnode.tag, vnode.data, 
      // #7975
      // clone children array to avoid mutating original in case of cloning
      // a child.
      vnode.children && vnode.children.slice(), vnode.text, vnode.elm, vnode.context, vnode.componentOptions, vnode.asyncFactory);
      cloned.ns = vnode.ns;
      cloned.isStatic = vnode.isStatic;
      cloned.key = vnode.key;
      cloned.isComment = vnode.isComment;
      cloned.fnContext = vnode.fnContext;
      cloned.fnOptions = vnode.fnOptions;
      cloned.fnScopeId = vnode.fnScopeId;
      cloned.asyncMeta = vnode.asyncMeta;
      cloned.isCloned = true;
      return cloned;
  }

  /* not type checking this file because flow doesn't play well with Proxy */
  var initProxy;
  {
      var allowedGlobals_1 = makeMap('Infinity,undefined,NaN,isFinite,isNaN,' +
          'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
          'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
          'require' // for Webpack/Browserify
      );
      var warnNonPresent_1 = function (target, key) {
          warn$2("Property or method \"".concat(key, "\" is not defined on the instance but ") +
              'referenced during render. Make sure that this property is reactive, ' +
              'either in the data option, or for class-based components, by ' +
              'initializing the property. ' +
              'See: https://v2.vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.', target);
      };
      var warnReservedPrefix_1 = function (target, key) {
          warn$2("Property \"".concat(key, "\" must be accessed with \"$data.").concat(key, "\" because ") +
              'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
              'prevent conflicts with Vue internals. ' +
              'See: https://v2.vuejs.org/v2/api/#data', target);
      };
      var hasProxy_1 = typeof Proxy !== 'undefined' && isNative(Proxy);
      if (hasProxy_1) {
          var isBuiltInModifier_1 = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
          config.keyCodes = new Proxy(config.keyCodes, {
              set: function (target, key, value) {
                  if (isBuiltInModifier_1(key)) {
                      warn$2("Avoid overwriting built-in modifier in config.keyCodes: .".concat(key));
                      return false;
                  }
                  else {
                      target[key] = value;
                      return true;
                  }
              }
          });
      }
      var hasHandler_1 = {
          has: function (target, key) {
              var has = key in target;
              var isAllowed = allowedGlobals_1(key) ||
                  (typeof key === 'string' &&
                      key.charAt(0) === '_' &&
                      !(key in target.$data));
              if (!has && !isAllowed) {
                  if (key in target.$data)
                      warnReservedPrefix_1(target, key);
                  else
                      warnNonPresent_1(target, key);
              }
              return has || !isAllowed;
          }
      };
      var getHandler_1 = {
          get: function (target, key) {
              if (typeof key === 'string' && !(key in target)) {
                  if (key in target.$data)
                      warnReservedPrefix_1(target, key);
                  else
                      warnNonPresent_1(target, key);
              }
              return target[key];
          }
      };
      initProxy = function initProxy(vm) {
          if (hasProxy_1) {
              // determine which proxy handler to use
              var options = vm.$options;
              var handlers = options.render && options.render._withStripped ? getHandler_1 : hasHandler_1;
              vm._renderProxy = new Proxy(vm, handlers);
          }
          else {
              vm._renderProxy = vm;
          }
      };
  }

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  function __generator(thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (g && (g = 0, op[0] && (_ = 0)), _) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  var uid$2 = 0;
  var pendingCleanupDeps = [];
  var cleanupDeps = function () {
      for (var i = 0; i < pendingCleanupDeps.length; i++) {
          var dep = pendingCleanupDeps[i];
          dep.subs = dep.subs.filter(function (s) { return s; });
          dep._pending = false;
      }
      pendingCleanupDeps.length = 0;
  };
  /**
   * A dep is an observable that can have multiple
   * directives subscribing to it.
   * @internal
   */
  var Dep = /** @class */ (function () {
      function Dep() {
          // pending subs cleanup
          this._pending = false;
          this.id = uid$2++;
          this.subs = [];
      }
      Dep.prototype.addSub = function (sub) {
          this.subs.push(sub);
      };
      Dep.prototype.removeSub = function (sub) {
          // #12696 deps with massive amount of subscribers are extremely slow to
          // clean up in Chromium
          // to workaround this, we unset the sub for now, and clear them on
          // next scheduler flush.
          this.subs[this.subs.indexOf(sub)] = null;
          if (!this._pending) {
              this._pending = true;
              pendingCleanupDeps.push(this);
          }
      };
      Dep.prototype.depend = function (info) {
          if (Dep.target) {
              Dep.target.addDep(this);
              if (info && Dep.target.onTrack) {
                  Dep.target.onTrack(__assign({ effect: Dep.target }, info));
              }
          }
      };
      Dep.prototype.notify = function (info) {
          // stabilize the subscriber list first
          var subs = this.subs.filter(function (s) { return s; });
          if (!config.async) {
              // subs aren't sorted in scheduler if not running async
              // we need to sort them now to make sure they fire in correct
              // order
              subs.sort(function (a, b) { return a.id - b.id; });
          }
          for (var i = 0, l = subs.length; i < l; i++) {
              var sub = subs[i];
              if (info) {
                  sub.onTrigger &&
                      sub.onTrigger(__assign({ effect: subs[i] }, info));
              }
              sub.update();
          }
      };
      return Dep;
  }());
  // The current target watcher being evaluated.
  // This is globally unique because only one watcher
  // can be evaluated at a time.
  Dep.target = null;
  var targetStack = [];
  function pushTarget(target) {
      targetStack.push(target);
      Dep.target = target;
  }
  function popTarget() {
      targetStack.pop();
      Dep.target = targetStack[targetStack.length - 1];
  }

  /*
   * not type checking this file because flow doesn't play well with
   * dynamically accessing methods on Array prototype
   */
  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);
  var methodsToPatch = [
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse'
  ];
  /**
   * Intercept mutating methods and emit events
   */
  methodsToPatch.forEach(function (method) {
      // cache original method
      var original = arrayProto[method];
      def(arrayMethods, method, function mutator() {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          var result = original.apply(this, args);
          var ob = this.__ob__;
          var inserted;
          switch (method) {
              case 'push':
              case 'unshift':
                  inserted = args;
                  break;
              case 'splice':
                  inserted = args.slice(2);
                  break;
          }
          if (inserted)
              ob.observeArray(inserted);
          // notify change
          {
              ob.dep.notify({
                  type: "array mutation" /* TriggerOpTypes.ARRAY_MUTATION */,
                  target: this,
                  key: method
              });
          }
          return result;
      });
  });

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
  var NO_INITIAL_VALUE = {};
  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  var shouldObserve = true;
  function toggleObserving(value) {
      shouldObserve = value;
  }
  // ssr mock dep
  var mockDep = {
      notify: noop$1,
      depend: noop$1,
      addSub: noop$1,
      removeSub: noop$1
  };
  /**
   * Observer class that is attached to each observed
   * object. Once attached, the observer converts the target
   * object's property keys into getter/setters that
   * collect dependencies and dispatch updates.
   */
  var Observer = /** @class */ (function () {
      function Observer(value, shallow, mock) {
          if (shallow === void 0) { shallow = false; }
          if (mock === void 0) { mock = false; }
          this.value = value;
          this.shallow = shallow;
          this.mock = mock;
          // this.value = value
          this.dep = mock ? mockDep : new Dep();
          this.vmCount = 0;
          def(value, '__ob__', this);
          if (isArray$1(value)) {
              if (!mock) {
                  if (hasProto) {
                      value.__proto__ = arrayMethods;
                      /* eslint-enable no-proto */
                  }
                  else {
                      for (var i = 0, l = arrayKeys.length; i < l; i++) {
                          var key = arrayKeys[i];
                          def(value, key, arrayMethods[key]);
                      }
                  }
              }
              if (!shallow) {
                  this.observeArray(value);
              }
          }
          else {
              /**
               * Walk through all properties and convert them into
               * getter/setters. This method should only be called when
               * value type is Object.
               */
              var keys = Object.keys(value);
              for (var i = 0; i < keys.length; i++) {
                  var key = keys[i];
                  defineReactive(value, key, NO_INITIAL_VALUE, undefined, shallow, mock);
              }
          }
      }
      /**
       * Observe a list of Array items.
       */
      Observer.prototype.observeArray = function (value) {
          for (var i = 0, l = value.length; i < l; i++) {
              observe(value[i], false, this.mock);
          }
      };
      return Observer;
  }());
  // helpers
  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  function observe(value, shallow, ssrMockReactivity) {
      if (value && hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
          return value.__ob__;
      }
      if (shouldObserve &&
          (ssrMockReactivity || !isServerRendering()) &&
          (isArray$1(value) || isPlainObject$1(value)) &&
          Object.isExtensible(value) &&
          !value.__v_skip /* ReactiveFlags.SKIP */ &&
          !isRef(value) &&
          !(value instanceof VNode)) {
          return new Observer(value, shallow, ssrMockReactivity);
      }
  }
  /**
   * Define a reactive property on an Object.
   */
  function defineReactive(obj, key, val, customSetter, shallow, mock, observeEvenIfShallow) {
      if (observeEvenIfShallow === void 0) { observeEvenIfShallow = false; }
      var dep = new Dep();
      var property = Object.getOwnPropertyDescriptor(obj, key);
      if (property && property.configurable === false) {
          return;
      }
      // cater for pre-defined getter/setters
      var getter = property && property.get;
      var setter = property && property.set;
      if ((!getter || setter) &&
          (val === NO_INITIAL_VALUE || arguments.length === 2)) {
          val = obj[key];
      }
      var childOb = shallow ? val && val.__ob__ : observe(val, false, mock);
      Object.defineProperty(obj, key, {
          enumerable: true,
          configurable: true,
          get: function reactiveGetter() {
              var value = getter ? getter.call(obj) : val;
              if (Dep.target) {
                  {
                      dep.depend({
                          target: obj,
                          type: "get" /* TrackOpTypes.GET */,
                          key: key
                      });
                  }
                  if (childOb) {
                      childOb.dep.depend();
                      if (isArray$1(value)) {
                          dependArray(value);
                      }
                  }
              }
              return isRef(value) && !shallow ? value.value : value;
          },
          set: function reactiveSetter(newVal) {
              var value = getter ? getter.call(obj) : val;
              if (!hasChanged(value, newVal)) {
                  return;
              }
              if (customSetter) {
                  customSetter();
              }
              if (setter) {
                  setter.call(obj, newVal);
              }
              else if (getter) {
                  // #7981: for accessor properties without setter
                  return;
              }
              else if (!shallow && isRef(value) && !isRef(newVal)) {
                  value.value = newVal;
                  return;
              }
              else {
                  val = newVal;
              }
              childOb = shallow ? newVal && newVal.__ob__ : observe(newVal, false, mock);
              {
                  dep.notify({
                      type: "set" /* TriggerOpTypes.SET */,
                      target: obj,
                      key: key,
                      newValue: newVal,
                      oldValue: value
                  });
              }
          }
      });
      return dep;
  }
  function set(target, key, val) {
      if ((isUndef(target) || isPrimitive(target))) {
          warn$2("Cannot set reactive property on undefined, null, or primitive value: ".concat(target));
      }
      if (isReadonly(target)) {
          warn$2("Set operation on key \"".concat(key, "\" failed: target is readonly."));
          return;
      }
      var ob = target.__ob__;
      if (isArray$1(target) && isValidArrayIndex(key)) {
          target.length = Math.max(target.length, key);
          target.splice(key, 1, val);
          // when mocking for SSR, array methods are not hijacked
          if (ob && !ob.shallow && ob.mock) {
              observe(val, false, true);
          }
          return val;
      }
      if (key in target && !(key in Object.prototype)) {
          target[key] = val;
          return val;
      }
      if (target._isVue || (ob && ob.vmCount)) {
          warn$2('Avoid adding reactive properties to a Vue instance or its root $data ' +
                  'at runtime - declare it upfront in the data option.');
          return val;
      }
      if (!ob) {
          target[key] = val;
          return val;
      }
      defineReactive(ob.value, key, val, undefined, ob.shallow, ob.mock);
      {
          ob.dep.notify({
              type: "add" /* TriggerOpTypes.ADD */,
              target: target,
              key: key,
              newValue: val,
              oldValue: undefined
          });
      }
      return val;
  }
  function del(target, key) {
      if ((isUndef(target) || isPrimitive(target))) {
          warn$2("Cannot delete reactive property on undefined, null, or primitive value: ".concat(target));
      }
      if (isArray$1(target) && isValidArrayIndex(key)) {
          target.splice(key, 1);
          return;
      }
      var ob = target.__ob__;
      if (target._isVue || (ob && ob.vmCount)) {
          warn$2('Avoid deleting properties on a Vue instance or its root $data ' +
                  '- just set it to null.');
          return;
      }
      if (isReadonly(target)) {
          warn$2("Delete operation on key \"".concat(key, "\" failed: target is readonly."));
          return;
      }
      if (!hasOwn(target, key)) {
          return;
      }
      delete target[key];
      if (!ob) {
          return;
      }
      {
          ob.dep.notify({
              type: "delete" /* TriggerOpTypes.DELETE */,
              target: target,
              key: key
          });
      }
  }
  /**
   * Collect dependencies on array elements when the array is touched, since
   * we cannot intercept array element access like property getters.
   */
  function dependArray(value) {
      for (var e = void 0, i = 0, l = value.length; i < l; i++) {
          e = value[i];
          if (e && e.__ob__) {
              e.__ob__.dep.depend();
          }
          if (isArray$1(e)) {
              dependArray(e);
          }
      }
  }

  function reactive(target) {
      makeReactive(target, false);
      return target;
  }
  /**
   * Return a shallowly-reactive copy of the original object, where only the root
   * level properties are reactive. It also does not auto-unwrap refs (even at the
   * root level).
   */
  function shallowReactive(target) {
      makeReactive(target, true);
      def(target, "__v_isShallow" /* ReactiveFlags.IS_SHALLOW */, true);
      return target;
  }
  function makeReactive(target, shallow) {
      // if trying to observe a readonly proxy, return the readonly version.
      if (!isReadonly(target)) {
          {
              if (isArray$1(target)) {
                  warn$2("Avoid using Array as root value for ".concat(shallow ? "shallowReactive()" : "reactive()", " as it cannot be tracked in watch() or watchEffect(). Use ").concat(shallow ? "shallowRef()" : "ref()", " instead. This is a Vue-2-only limitation."));
              }
              var existingOb = target && target.__ob__;
              if (existingOb && existingOb.shallow !== shallow) {
                  warn$2("Target is already a ".concat(existingOb.shallow ? "" : "non-", "shallow reactive object, and cannot be converted to ").concat(shallow ? "" : "non-", "shallow."));
              }
          }
          var ob = observe(target, shallow, isServerRendering() /* ssr mock reactivity */);
          if (!ob) {
              if (target == null || isPrimitive(target)) {
                  warn$2("value cannot be made reactive: ".concat(String(target)));
              }
              if (isCollectionType(target)) {
                  warn$2("Vue 2 does not support reactive collection types such as Map or Set.");
              }
          }
      }
  }
  function isReactive(value) {
      if (isReadonly(value)) {
          return isReactive(value["__v_raw" /* ReactiveFlags.RAW */]);
      }
      return !!(value && value.__ob__);
  }
  function isShallow(value) {
      return !!(value && value.__v_isShallow);
  }
  function isReadonly(value) {
      return !!(value && value.__v_isReadonly);
  }
  function isProxy(value) {
      return isReactive(value) || isReadonly(value);
  }
  function toRaw(observed) {
      var raw = observed && observed["__v_raw" /* ReactiveFlags.RAW */];
      return raw ? toRaw(raw) : observed;
  }
  function markRaw(value) {
      // non-extensible objects won't be observed anyway
      if (Object.isExtensible(value)) {
          def(value, "__v_skip" /* ReactiveFlags.SKIP */, true);
      }
      return value;
  }
  /**
   * @internal
   */
  function isCollectionType(value) {
      var type = toRawType(value);
      return (type === 'Map' || type === 'WeakMap' || type === 'Set' || type === 'WeakSet');
  }

  /**
   * @internal
   */
  var RefFlag = "__v_isRef";
  function isRef(r) {
      return !!(r && r.__v_isRef === true);
  }
  function ref$1(value) {
      return createRef(value, false);
  }
  function shallowRef(value) {
      return createRef(value, true);
  }
  function createRef(rawValue, shallow) {
      if (isRef(rawValue)) {
          return rawValue;
      }
      var ref = {};
      def(ref, RefFlag, true);
      def(ref, "__v_isShallow" /* ReactiveFlags.IS_SHALLOW */, shallow);
      def(ref, 'dep', defineReactive(ref, 'value', rawValue, null, shallow, isServerRendering()));
      return ref;
  }
  function triggerRef(ref) {
      if (!ref.dep) {
          warn$2("received object is not a triggerable ref.");
      }
      {
          ref.dep &&
              ref.dep.notify({
                  type: "set" /* TriggerOpTypes.SET */,
                  target: ref,
                  key: 'value'
              });
      }
  }
  function unref(ref) {
      return isRef(ref) ? ref.value : ref;
  }
  function proxyRefs(objectWithRefs) {
      if (isReactive(objectWithRefs)) {
          return objectWithRefs;
      }
      var proxy = {};
      var keys = Object.keys(objectWithRefs);
      for (var i = 0; i < keys.length; i++) {
          proxyWithRefUnwrap(proxy, objectWithRefs, keys[i]);
      }
      return proxy;
  }
  function proxyWithRefUnwrap(target, source, key) {
      Object.defineProperty(target, key, {
          enumerable: true,
          configurable: true,
          get: function () {
              var val = source[key];
              if (isRef(val)) {
                  return val.value;
              }
              else {
                  var ob = val && val.__ob__;
                  if (ob)
                      ob.dep.depend();
                  return val;
              }
          },
          set: function (value) {
              var oldValue = source[key];
              if (isRef(oldValue) && !isRef(value)) {
                  oldValue.value = value;
              }
              else {
                  source[key] = value;
              }
          }
      });
  }
  function customRef(factory) {
      var dep = new Dep();
      var _a = factory(function () {
          {
              dep.depend({
                  target: ref,
                  type: "get" /* TrackOpTypes.GET */,
                  key: 'value'
              });
          }
      }, function () {
          {
              dep.notify({
                  target: ref,
                  type: "set" /* TriggerOpTypes.SET */,
                  key: 'value'
              });
          }
      }), get = _a.get, set = _a.set;
      var ref = {
          get value() {
              return get();
          },
          set value(newVal) {
              set(newVal);
          }
      };
      def(ref, RefFlag, true);
      return ref;
  }
  function toRefs(object) {
      if (!isReactive(object)) {
          warn$2("toRefs() expects a reactive object but received a plain one.");
      }
      var ret = isArray$1(object) ? new Array(object.length) : {};
      for (var key in object) {
          ret[key] = toRef(object, key);
      }
      return ret;
  }
  function toRef(object, key, defaultValue) {
      var val = object[key];
      if (isRef(val)) {
          return val;
      }
      var ref = {
          get value() {
              var val = object[key];
              return val === undefined ? defaultValue : val;
          },
          set value(newVal) {
              object[key] = newVal;
          }
      };
      def(ref, RefFlag, true);
      return ref;
  }

  var rawToReadonlyFlag = "__v_rawToReadonly";
  var rawToShallowReadonlyFlag = "__v_rawToShallowReadonly";
  function readonly(target) {
      return createReadonly(target, false);
  }
  function createReadonly(target, shallow) {
      if (!isPlainObject$1(target)) {
          {
              if (isArray$1(target)) {
                  warn$2("Vue 2 does not support readonly arrays.");
              }
              else if (isCollectionType(target)) {
                  warn$2("Vue 2 does not support readonly collection types such as Map or Set.");
              }
              else {
                  warn$2("value cannot be made readonly: ".concat(typeof target));
              }
          }
          return target;
      }
      if (!Object.isExtensible(target)) {
          warn$2("Vue 2 does not support creating readonly proxy for non-extensible object.");
      }
      // already a readonly object
      if (isReadonly(target)) {
          return target;
      }
      // already has a readonly proxy
      var existingFlag = shallow ? rawToShallowReadonlyFlag : rawToReadonlyFlag;
      var existingProxy = target[existingFlag];
      if (existingProxy) {
          return existingProxy;
      }
      var proxy = Object.create(Object.getPrototypeOf(target));
      def(target, existingFlag, proxy);
      def(proxy, "__v_isReadonly" /* ReactiveFlags.IS_READONLY */, true);
      def(proxy, "__v_raw" /* ReactiveFlags.RAW */, target);
      if (isRef(target)) {
          def(proxy, RefFlag, true);
      }
      if (shallow || isShallow(target)) {
          def(proxy, "__v_isShallow" /* ReactiveFlags.IS_SHALLOW */, true);
      }
      var keys = Object.keys(target);
      for (var i = 0; i < keys.length; i++) {
          defineReadonlyProperty(proxy, target, keys[i], shallow);
      }
      return proxy;
  }
  function defineReadonlyProperty(proxy, target, key, shallow) {
      Object.defineProperty(proxy, key, {
          enumerable: true,
          configurable: true,
          get: function () {
              var val = target[key];
              return shallow || !isPlainObject$1(val) ? val : readonly(val);
          },
          set: function () {
              warn$2("Set operation on key \"".concat(key, "\" failed: target is readonly."));
          }
      });
  }
  /**
   * Returns a reactive-copy of the original object, where only the root level
   * properties are readonly, and does NOT unwrap refs nor recursively convert
   * returned properties.
   * This is used for creating the props proxy object for stateful components.
   */
  function shallowReadonly(target) {
      return createReadonly(target, true);
  }

  function computed(getterOrOptions, debugOptions) {
      var getter;
      var setter;
      var onlyGetter = isFunction$2(getterOrOptions);
      if (onlyGetter) {
          getter = getterOrOptions;
          setter = function () {
                  warn$2('Write operation failed: computed value is readonly');
              }
              ;
      }
      else {
          getter = getterOrOptions.get;
          setter = getterOrOptions.set;
      }
      var watcher = isServerRendering()
          ? null
          : new Watcher(currentInstance, getter, noop$1, { lazy: true });
      if (watcher && debugOptions) {
          watcher.onTrack = debugOptions.onTrack;
          watcher.onTrigger = debugOptions.onTrigger;
      }
      var ref = {
          // some libs rely on the presence effect for checking computed refs
          // from normal refs, but the implementation doesn't matter
          effect: watcher,
          get value() {
              if (watcher) {
                  if (watcher.dirty) {
                      watcher.evaluate();
                  }
                  if (Dep.target) {
                      if (Dep.target.onTrack) {
                          Dep.target.onTrack({
                              effect: Dep.target,
                              target: ref,
                              type: "get" /* TrackOpTypes.GET */,
                              key: 'value'
                          });
                      }
                      watcher.depend();
                  }
                  return watcher.value;
              }
              else {
                  return getter();
              }
          },
          set value(newVal) {
              setter(newVal);
          }
      };
      def(ref, RefFlag, true);
      def(ref, "__v_isReadonly" /* ReactiveFlags.IS_READONLY */, onlyGetter);
      return ref;
  }

  var mark;
  var measure;
  {
      var perf_1 = inBrowser && window.performance;
      /* istanbul ignore if */
      if (perf_1 &&
          // @ts-ignore
          perf_1.mark &&
          // @ts-ignore
          perf_1.measure &&
          // @ts-ignore
          perf_1.clearMarks &&
          // @ts-ignore
          perf_1.clearMeasures) {
          mark = function (tag) { return perf_1.mark(tag); };
          measure = function (name, startTag, endTag) {
              perf_1.measure(name, startTag, endTag);
              perf_1.clearMarks(startTag);
              perf_1.clearMarks(endTag);
              // perf.clearMeasures(name)
          };
      }
  }

  var normalizeEvent = cached(function (name) {
      var passive = name.charAt(0) === '&';
      name = passive ? name.slice(1) : name;
      var once = name.charAt(0) === '~'; // Prefixed last, checked first
      name = once ? name.slice(1) : name;
      var capture = name.charAt(0) === '!';
      name = capture ? name.slice(1) : name;
      return {
          name: name,
          once: once,
          capture: capture,
          passive: passive
      };
  });
  function createFnInvoker(fns, vm) {
      function invoker() {
          var fns = invoker.fns;
          if (isArray$1(fns)) {
              var cloned = fns.slice();
              for (var i = 0; i < cloned.length; i++) {
                  invokeWithErrorHandling(cloned[i], null, arguments, vm, "v-on handler");
              }
          }
          else {
              // return handler return value for single handlers
              return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler");
          }
      }
      invoker.fns = fns;
      return invoker;
  }
  function updateListeners(on, oldOn, add, remove, createOnceHandler, vm) {
      var name, cur, old, event;
      for (name in on) {
          cur = on[name];
          old = oldOn[name];
          event = normalizeEvent(name);
          if (isUndef(cur)) {
              warn$2("Invalid handler for event \"@".concat(event.name, "\": the bound value is undefined. ") +
                      "Check if you have defined this method in your component.", vm);
              // Replace with noop to avoid "reading _wrapper of undefined" error later in add/remove
              cur = on[name] = function () { };
          }
          else if (isUndef(old)) {
              if (isUndef(cur.fns)) {
                  cur = on[name] = createFnInvoker(cur, vm);
              }
              if (isTrue(event.once)) {
                  cur = on[name] = createOnceHandler(event.name, cur, event.capture);
              }
              add(event.name, cur, event.capture, event.passive, event.params);
          }
          else if (cur !== old) {
              old.fns = cur;
              on[name] = old;
          }
      }
      for (name in oldOn) {
          if (isUndef(on[name])) {
              event = normalizeEvent(name);
              remove(event.name, oldOn[name], event.capture);
          }
      }
  }

  function mergeVNodeHook(def, hookKey, hook) {
      if (def instanceof VNode) {
          def = def.data.hook || (def.data.hook = {});
      }
      var invoker;
      var oldHook = def[hookKey];
      function wrappedHook() {
          hook.apply(this, arguments);
          // important: remove merged hook to ensure it's called only once
          // and prevent memory leak
          remove$2(invoker.fns, wrappedHook);
      }
      if (isUndef(oldHook)) {
          // no existing hook
          invoker = createFnInvoker([wrappedHook]);
      }
      else {
          /* istanbul ignore if */
          if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
              // already a merged invoker
              invoker = oldHook;
              invoker.fns.push(wrappedHook);
          }
          else {
              // existing plain hook
              invoker = createFnInvoker([oldHook, wrappedHook]);
          }
      }
      invoker.merged = true;
      def[hookKey] = invoker;
  }

  function extractPropsFromVNodeData(data, Ctor, tag) {
      // we are only extracting raw values here.
      // validation and default values are handled in the child
      // component itself.
      var propOptions = Ctor.options.props;
      if (isUndef(propOptions)) {
          return;
      }
      var res = {};
      var attrs = data.attrs, props = data.props;
      if (isDef(attrs) || isDef(props)) {
          for (var key in propOptions) {
              var altKey = hyphenate(key);
              {
                  var keyInLowerCase = key.toLowerCase();
                  if (key !== keyInLowerCase && attrs && hasOwn(attrs, keyInLowerCase)) {
                      tip("Prop \"".concat(keyInLowerCase, "\" is passed to component ") +
                          "".concat(formatComponentName(
                          // @ts-expect-error tag is string
                          tag || Ctor), ", but the declared prop name is") +
                          " \"".concat(key, "\". ") +
                          "Note that HTML attributes are case-insensitive and camelCased " +
                          "props need to use their kebab-case equivalents when using in-DOM " +
                          "templates. You should probably use \"".concat(altKey, "\" instead of \"").concat(key, "\"."));
                  }
              }
              checkProp(res, props, key, altKey, true) ||
                  checkProp(res, attrs, key, altKey, false);
          }
      }
      return res;
  }
  function checkProp(res, hash, key, altKey, preserve) {
      if (isDef(hash)) {
          if (hasOwn(hash, key)) {
              res[key] = hash[key];
              if (!preserve) {
                  delete hash[key];
              }
              return true;
          }
          else if (hasOwn(hash, altKey)) {
              res[key] = hash[altKey];
              if (!preserve) {
                  delete hash[altKey];
              }
              return true;
          }
      }
      return false;
  }

  // The template compiler attempts to minimize the need for normalization by
  // statically analyzing the template at compile time.
  //
  // For plain HTML markup, normalization can be completely skipped because the
  // generated render function is guaranteed to return Array<VNode>. There are
  // two cases where extra normalization is needed:
  // 1. When the children contains components - because a functional component
  // may return an Array instead of a single root. In this case, just a simple
  // normalization is needed - if any child is an Array, we flatten the whole
  // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
  // because functional components already normalize their own children.
  function simpleNormalizeChildren(children) {
      for (var i = 0; i < children.length; i++) {
          if (isArray$1(children[i])) {
              return Array.prototype.concat.apply([], children);
          }
      }
      return children;
  }
  // 2. When the children contains constructs that always generated nested Arrays,
  // e.g. <template>, <slot>, v-for, or when the children is provided by user
  // with hand-written render functions / JSX. In such cases a full normalization
  // is needed to cater to all possible types of children values.
  function normalizeChildren(children) {
      return isPrimitive(children)
          ? [createTextVNode(children)]
          : isArray$1(children)
              ? normalizeArrayChildren(children)
              : undefined;
  }
  function isTextNode(node) {
      return isDef(node) && isDef(node.text) && isFalse(node.isComment);
  }
  function normalizeArrayChildren(children, nestedIndex) {
      var res = [];
      var i, c, lastIndex, last;
      for (i = 0; i < children.length; i++) {
          c = children[i];
          if (isUndef(c) || typeof c === 'boolean')
              continue;
          lastIndex = res.length - 1;
          last = res[lastIndex];
          //  nested
          if (isArray$1(c)) {
              if (c.length > 0) {
                  c = normalizeArrayChildren(c, "".concat(nestedIndex || '', "_").concat(i));
                  // merge adjacent text nodes
                  if (isTextNode(c[0]) && isTextNode(last)) {
                      res[lastIndex] = createTextVNode(last.text + c[0].text);
                      c.shift();
                  }
                  res.push.apply(res, c);
              }
          }
          else if (isPrimitive(c)) {
              if (isTextNode(last)) {
                  // merge adjacent text nodes
                  // this is necessary for SSR hydration because text nodes are
                  // essentially merged when rendered to HTML strings
                  res[lastIndex] = createTextVNode(last.text + c);
              }
              else if (c !== '') {
                  // convert primitive to vnode
                  res.push(createTextVNode(c));
              }
          }
          else {
              if (isTextNode(c) && isTextNode(last)) {
                  // merge adjacent text nodes
                  res[lastIndex] = createTextVNode(last.text + c.text);
              }
              else {
                  // default key for nested array children (likely generated by v-for)
                  if (isTrue(children._isVList) &&
                      isDef(c.tag) &&
                      isUndef(c.key) &&
                      isDef(nestedIndex)) {
                      c.key = "__vlist".concat(nestedIndex, "_").concat(i, "__");
                  }
                  res.push(c);
              }
          }
      }
      return res;
  }

  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2;
  // wrapper function for providing a more flexible interface
  // without getting yelled at by flow
  function createElement$1(context, tag, data, children, normalizationType, alwaysNormalize) {
      if (isArray$1(data) || isPrimitive(data)) {
          normalizationType = children;
          children = data;
          data = undefined;
      }
      if (isTrue(alwaysNormalize)) {
          normalizationType = ALWAYS_NORMALIZE;
      }
      return _createElement(context, tag, data, children, normalizationType);
  }
  function _createElement(context, tag, data, children, normalizationType) {
      if (isDef(data) && isDef(data.__ob__)) {
          warn$2("Avoid using observed data object as vnode data: ".concat(JSON.stringify(data), "\n") + 'Always create fresh vnode data objects in each render!', context);
          return createEmptyVNode();
      }
      // object syntax in v-bind
      if (isDef(data) && isDef(data.is)) {
          tag = data.is;
      }
      if (!tag) {
          // in case of component :is set to falsy value
          return createEmptyVNode();
      }
      // warn against non-primitive key
      if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
          warn$2('Avoid using non-primitive value as key, ' +
              'use string/number value instead.', context);
      }
      // support single function children as default scoped slot
      if (isArray$1(children) && isFunction$2(children[0])) {
          data = data || {};
          data.scopedSlots = { default: children[0] };
          children.length = 0;
      }
      if (normalizationType === ALWAYS_NORMALIZE) {
          children = normalizeChildren(children);
      }
      else if (normalizationType === SIMPLE_NORMALIZE) {
          children = simpleNormalizeChildren(children);
      }
      var vnode, ns;
      if (typeof tag === 'string') {
          var Ctor = void 0;
          ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
          if (config.isReservedTag(tag)) {
              // platform built-in elements
              if (isDef(data) &&
                  isDef(data.nativeOn) &&
                  data.tag !== 'component') {
                  warn$2("The .native modifier for v-on is only valid on components but it was used on <".concat(tag, ">."), context);
              }
              vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
          }
          else if ((!data || !data.pre) &&
              isDef((Ctor = resolveAsset(context.$options, 'components', tag)))) {
              // component
              vnode = createComponent(Ctor, data, context, children, tag);
          }
          else {
              // unknown or unlisted namespaced elements
              // check at runtime because it may get assigned a namespace when its
              // parent normalizes children
              vnode = new VNode(tag, data, children, undefined, undefined, context);
          }
      }
      else {
          // direct component options / constructor
          vnode = createComponent(tag, data, context, children);
      }
      if (isArray$1(vnode)) {
          return vnode;
      }
      else if (isDef(vnode)) {
          if (isDef(ns))
              applyNS(vnode, ns);
          if (isDef(data))
              registerDeepBindings(data);
          return vnode;
      }
      else {
          return createEmptyVNode();
      }
  }
  function applyNS(vnode, ns, force) {
      vnode.ns = ns;
      if (vnode.tag === 'foreignObject') {
          // use default namespace inside foreignObject
          ns = undefined;
          force = true;
      }
      if (isDef(vnode.children)) {
          for (var i = 0, l = vnode.children.length; i < l; i++) {
              var child = vnode.children[i];
              if (isDef(child.tag) &&
                  (isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
                  applyNS(child, ns, force);
              }
          }
      }
  }
  // ref #5318
  // necessary to ensure parent re-render when deep bindings like :style and
  // :class are used on slot nodes
  function registerDeepBindings(data) {
      if (isObject$1(data.style)) {
          traverse(data.style);
      }
      if (isObject$1(data.class)) {
          traverse(data.class);
      }
  }

  /**
   * Runtime helper for rendering v-for lists.
   */
  function renderList(val, render) {
      var ret = null, i, l, keys, key;
      if (isArray$1(val) || typeof val === 'string') {
          ret = new Array(val.length);
          for (i = 0, l = val.length; i < l; i++) {
              ret[i] = render(val[i], i);
          }
      }
      else if (typeof val === 'number') {
          ret = new Array(val);
          for (i = 0; i < val; i++) {
              ret[i] = render(i + 1, i);
          }
      }
      else if (isObject$1(val)) {
          if (hasSymbol && val[Symbol.iterator]) {
              ret = [];
              var iterator = val[Symbol.iterator]();
              var result = iterator.next();
              while (!result.done) {
                  ret.push(render(result.value, ret.length));
                  result = iterator.next();
              }
          }
          else {
              keys = Object.keys(val);
              ret = new Array(keys.length);
              for (i = 0, l = keys.length; i < l; i++) {
                  key = keys[i];
                  ret[i] = render(val[key], key, i);
              }
          }
      }
      if (!isDef(ret)) {
          ret = [];
      }
      ret._isVList = true;
      return ret;
  }

  /**
   * Runtime helper for rendering <slot>
   */
  function renderSlot(name, fallbackRender, props, bindObject) {
      var scopedSlotFn = this.$scopedSlots[name];
      var nodes;
      if (scopedSlotFn) {
          // scoped slot
          props = props || {};
          if (bindObject) {
              if (!isObject$1(bindObject)) {
                  warn$2('slot v-bind without argument expects an Object', this);
              }
              props = extend$1(extend$1({}, bindObject), props);
          }
          nodes =
              scopedSlotFn(props) ||
                  (isFunction$2(fallbackRender) ? fallbackRender() : fallbackRender);
      }
      else {
          nodes =
              this.$slots[name] ||
                  (isFunction$2(fallbackRender) ? fallbackRender() : fallbackRender);
      }
      var target = props && props.slot;
      if (target) {
          return this.$createElement('template', { slot: target }, nodes);
      }
      else {
          return nodes;
      }
  }

  /**
   * Runtime helper for resolving filters
   */
  function resolveFilter(id) {
      return resolveAsset(this.$options, 'filters', id, true) || identity;
  }

  function isKeyNotMatch(expect, actual) {
      if (isArray$1(expect)) {
          return expect.indexOf(actual) === -1;
      }
      else {
          return expect !== actual;
      }
  }
  /**
   * Runtime helper for checking keyCodes from config.
   * exposed as Vue.prototype._k
   * passing in eventKeyName as last argument separately for backwards compat
   */
  function checkKeyCodes(eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) {
      var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
      if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
          return isKeyNotMatch(builtInKeyName, eventKeyName);
      }
      else if (mappedKeyCode) {
          return isKeyNotMatch(mappedKeyCode, eventKeyCode);
      }
      else if (eventKeyName) {
          return hyphenate(eventKeyName) !== key;
      }
      return eventKeyCode === undefined;
  }

  /**
   * Runtime helper for merging v-bind="object" into a VNode's data.
   */
  function bindObjectProps(data, tag, value, asProp, isSync) {
      if (value) {
          if (!isObject$1(value)) {
              warn$2('v-bind without argument expects an Object or Array value', this);
          }
          else {
              if (isArray$1(value)) {
                  value = toObject(value);
              }
              var hash = void 0;
              var _loop_1 = function (key) {
                  if (key === 'class' || key === 'style' || isReservedAttribute(key)) {
                      hash = data;
                  }
                  else {
                      var type = data.attrs && data.attrs.type;
                      hash =
                          asProp || config.mustUseProp(tag, type, key)
                              ? data.domProps || (data.domProps = {})
                              : data.attrs || (data.attrs = {});
                  }
                  var camelizedKey = camelize(key);
                  var hyphenatedKey = hyphenate(key);
                  if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
                      hash[key] = value[key];
                      if (isSync) {
                          var on = data.on || (data.on = {});
                          on["update:".concat(key)] = function ($event) {
                              value[key] = $event;
                          };
                      }
                  }
              };
              for (var key in value) {
                  _loop_1(key);
              }
          }
      }
      return data;
  }

  /**
   * Runtime helper for rendering static trees.
   */
  function renderStatic(index, isInFor) {
      var cached = this._staticTrees || (this._staticTrees = []);
      var tree = cached[index];
      // if has already-rendered static tree and not inside v-for,
      // we can reuse the same tree.
      if (tree && !isInFor) {
          return tree;
      }
      // otherwise, render a fresh tree.
      tree = cached[index] = this.$options.staticRenderFns[index].call(this._renderProxy, this._c, this // for render fns generated for functional component templates
      );
      markStatic$1(tree, "__static__".concat(index), false);
      return tree;
  }
  /**
   * Runtime helper for v-once.
   * Effectively it means marking the node as static with a unique key.
   */
  function markOnce(tree, index, key) {
      markStatic$1(tree, "__once__".concat(index).concat(key ? "_".concat(key) : ""), true);
      return tree;
  }
  function markStatic$1(tree, key, isOnce) {
      if (isArray$1(tree)) {
          for (var i = 0; i < tree.length; i++) {
              if (tree[i] && typeof tree[i] !== 'string') {
                  markStaticNode(tree[i], "".concat(key, "_").concat(i), isOnce);
              }
          }
      }
      else {
          markStaticNode(tree, key, isOnce);
      }
  }
  function markStaticNode(node, key, isOnce) {
      node.isStatic = true;
      node.key = key;
      node.isOnce = isOnce;
  }

  function bindObjectListeners(data, value) {
      if (value) {
          if (!isPlainObject$1(value)) {
              warn$2('v-on without argument expects an Object value', this);
          }
          else {
              var on = (data.on = data.on ? extend$1({}, data.on) : {});
              for (var key in value) {
                  var existing = on[key];
                  var ours = value[key];
                  on[key] = existing ? [].concat(existing, ours) : ours;
              }
          }
      }
      return data;
  }

  function resolveScopedSlots(fns, res, 
  // the following are added in 2.6
  hasDynamicKeys, contentHashKey) {
      res = res || { $stable: !hasDynamicKeys };
      for (var i = 0; i < fns.length; i++) {
          var slot = fns[i];
          if (isArray$1(slot)) {
              resolveScopedSlots(slot, res, hasDynamicKeys);
          }
          else if (slot) {
              // marker for reverse proxying v-slot without scope on this.$slots
              // @ts-expect-error
              if (slot.proxy) {
                  // @ts-expect-error
                  slot.fn.proxy = true;
              }
              res[slot.key] = slot.fn;
          }
      }
      if (contentHashKey) {
          res.$key = contentHashKey;
      }
      return res;
  }

  // helper to process dynamic keys for dynamic arguments in v-bind and v-on.
  function bindDynamicKeys(baseObj, values) {
      for (var i = 0; i < values.length; i += 2) {
          var key = values[i];
          if (typeof key === 'string' && key) {
              baseObj[values[i]] = values[i + 1];
          }
          else if (key !== '' && key !== null) {
              // null is a special value for explicitly removing a binding
              warn$2("Invalid value for dynamic directive argument (expected string or null): ".concat(key), this);
          }
      }
      return baseObj;
  }
  // helper to dynamically append modifier runtime markers to event names.
  // ensure only append when value is already string, otherwise it will be cast
  // to string and cause the type check to miss.
  function prependModifier(value, symbol) {
      return typeof value === 'string' ? symbol + value : value;
  }

  function installRenderHelpers(target) {
      target._o = markOnce;
      target._n = toNumber;
      target._s = toString$1;
      target._l = renderList;
      target._t = renderSlot;
      target._q = looseEqual;
      target._i = looseIndexOf;
      target._m = renderStatic;
      target._f = resolveFilter;
      target._k = checkKeyCodes;
      target._b = bindObjectProps;
      target._v = createTextVNode;
      target._e = createEmptyVNode;
      target._u = resolveScopedSlots;
      target._g = bindObjectListeners;
      target._d = bindDynamicKeys;
      target._p = prependModifier;
  }

  /**
   * Runtime helper for resolving raw children VNodes into a slot object.
   */
  function resolveSlots(children, context) {
      if (!children || !children.length) {
          return {};
      }
      var slots = {};
      for (var i = 0, l = children.length; i < l; i++) {
          var child = children[i];
          var data = child.data;
          // remove slot attribute if the node is resolved as a Vue slot node
          if (data && data.attrs && data.attrs.slot) {
              delete data.attrs.slot;
          }
          // named slots should only be respected if the vnode was rendered in the
          // same context.
          if ((child.context === context || child.fnContext === context) &&
              data &&
              data.slot != null) {
              var name_1 = data.slot;
              var slot = slots[name_1] || (slots[name_1] = []);
              if (child.tag === 'template') {
                  slot.push.apply(slot, child.children || []);
              }
              else {
                  slot.push(child);
              }
          }
          else {
              (slots.default || (slots.default = [])).push(child);
          }
      }
      // ignore slots that contains only whitespace
      for (var name_2 in slots) {
          if (slots[name_2].every(isWhitespace)) {
              delete slots[name_2];
          }
      }
      return slots;
  }
  function isWhitespace(node) {
      return (node.isComment && !node.asyncFactory) || node.text === ' ';
  }

  function isAsyncPlaceholder(node) {
      // @ts-expect-error not really boolean type
      return node.isComment && node.asyncFactory;
  }

  function normalizeScopedSlots(ownerVm, scopedSlots, normalSlots, prevScopedSlots) {
      var res;
      var hasNormalSlots = Object.keys(normalSlots).length > 0;
      var isStable = scopedSlots ? !!scopedSlots.$stable : !hasNormalSlots;
      var key = scopedSlots && scopedSlots.$key;
      if (!scopedSlots) {
          res = {};
      }
      else if (scopedSlots._normalized) {
          // fast path 1: child component re-render only, parent did not change
          return scopedSlots._normalized;
      }
      else if (isStable &&
          prevScopedSlots &&
          prevScopedSlots !== emptyObject &&
          key === prevScopedSlots.$key &&
          !hasNormalSlots &&
          !prevScopedSlots.$hasNormal) {
          // fast path 2: stable scoped slots w/ no normal slots to proxy,
          // only need to normalize once
          return prevScopedSlots;
      }
      else {
          res = {};
          for (var key_1 in scopedSlots) {
              if (scopedSlots[key_1] && key_1[0] !== '$') {
                  res[key_1] = normalizeScopedSlot(ownerVm, normalSlots, key_1, scopedSlots[key_1]);
              }
          }
      }
      // expose normal slots on scopedSlots
      for (var key_2 in normalSlots) {
          if (!(key_2 in res)) {
              res[key_2] = proxyNormalSlot(normalSlots, key_2);
          }
      }
      // avoriaz seems to mock a non-extensible $scopedSlots object
      // and when that is passed down this would cause an error
      if (scopedSlots && Object.isExtensible(scopedSlots)) {
          scopedSlots._normalized = res;
      }
      def(res, '$stable', isStable);
      def(res, '$key', key);
      def(res, '$hasNormal', hasNormalSlots);
      return res;
  }
  function normalizeScopedSlot(vm, normalSlots, key, fn) {
      var normalized = function () {
          var cur = currentInstance;
          setCurrentInstance(vm);
          var res = arguments.length ? fn.apply(null, arguments) : fn({});
          res =
              res && typeof res === 'object' && !isArray$1(res)
                  ? [res] // single vnode
                  : normalizeChildren(res);
          var vnode = res && res[0];
          setCurrentInstance(cur);
          return res &&
              (!vnode ||
                  (res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode))) // #9658, #10391
              ? undefined
              : res;
      };
      // this is a slot using the new v-slot syntax without scope. although it is
      // compiled as a scoped slot, render fn users would expect it to be present
      // on this.$slots because the usage is semantically a normal slot.
      if (fn.proxy) {
          Object.defineProperty(normalSlots, key, {
              get: normalized,
              enumerable: true,
              configurable: true
          });
      }
      return normalized;
  }
  function proxyNormalSlot(slots, key) {
      return function () { return slots[key]; };
  }

  function initSetup(vm) {
      var options = vm.$options;
      var setup = options.setup;
      if (setup) {
          var ctx = (vm._setupContext = createSetupContext(vm));
          setCurrentInstance(vm);
          pushTarget();
          var setupResult = invokeWithErrorHandling(setup, null, [vm._props || shallowReactive({}), ctx], vm, "setup");
          popTarget();
          setCurrentInstance();
          if (isFunction$2(setupResult)) {
              // render function
              // @ts-ignore
              options.render = setupResult;
          }
          else if (isObject$1(setupResult)) {
              // bindings
              if (setupResult instanceof VNode) {
                  warn$2("setup() should not return VNodes directly - " +
                      "return a render function instead.");
              }
              vm._setupState = setupResult;
              // __sfc indicates compiled bindings from <script setup>
              if (!setupResult.__sfc) {
                  for (var key in setupResult) {
                      if (!isReserved(key)) {
                          proxyWithRefUnwrap(vm, setupResult, key);
                      }
                      else {
                          warn$2("Avoid using variables that start with _ or $ in setup().");
                      }
                  }
              }
              else {
                  // exposed for compiled render fn
                  var proxy = (vm._setupProxy = {});
                  for (var key in setupResult) {
                      if (key !== '__sfc') {
                          proxyWithRefUnwrap(proxy, setupResult, key);
                      }
                  }
              }
          }
          else if (setupResult !== undefined) {
              warn$2("setup() should return an object. Received: ".concat(setupResult === null ? 'null' : typeof setupResult));
          }
      }
  }
  function createSetupContext(vm) {
      var exposeCalled = false;
      return {
          get attrs() {
              if (!vm._attrsProxy) {
                  var proxy = (vm._attrsProxy = {});
                  def(proxy, '_v_attr_proxy', true);
                  syncSetupProxy(proxy, vm.$attrs, emptyObject, vm, '$attrs');
              }
              return vm._attrsProxy;
          },
          get listeners() {
              if (!vm._listenersProxy) {
                  var proxy = (vm._listenersProxy = {});
                  syncSetupProxy(proxy, vm.$listeners, emptyObject, vm, '$listeners');
              }
              return vm._listenersProxy;
          },
          get slots() {
              return initSlotsProxy(vm);
          },
          emit: bind$2(vm.$emit, vm),
          expose: function (exposed) {
              {
                  if (exposeCalled) {
                      warn$2("expose() should be called only once per setup().", vm);
                  }
                  exposeCalled = true;
              }
              if (exposed) {
                  Object.keys(exposed).forEach(function (key) {
                      return proxyWithRefUnwrap(vm, exposed, key);
                  });
              }
          }
      };
  }
  function syncSetupProxy(to, from, prev, instance, type) {
      var changed = false;
      for (var key in from) {
          if (!(key in to)) {
              changed = true;
              defineProxyAttr(to, key, instance, type);
          }
          else if (from[key] !== prev[key]) {
              changed = true;
          }
      }
      for (var key in to) {
          if (!(key in from)) {
              changed = true;
              delete to[key];
          }
      }
      return changed;
  }
  function defineProxyAttr(proxy, key, instance, type) {
      Object.defineProperty(proxy, key, {
          enumerable: true,
          configurable: true,
          get: function () {
              return instance[type][key];
          }
      });
  }
  function initSlotsProxy(vm) {
      if (!vm._slotsProxy) {
          syncSetupSlots((vm._slotsProxy = {}), vm.$scopedSlots);
      }
      return vm._slotsProxy;
  }
  function syncSetupSlots(to, from) {
      for (var key in from) {
          to[key] = from[key];
      }
      for (var key in to) {
          if (!(key in from)) {
              delete to[key];
          }
      }
  }
  /**
   * @internal use manual type def because public setup context type relies on
   * legacy VNode types
   */
  function useSlots() {
      return getContext().slots;
  }
  /**
   * @internal use manual type def because public setup context type relies on
   * legacy VNode types
   */
  function useAttrs() {
      return getContext().attrs;
  }
  /**
   * Vue 2 only
   * @internal use manual type def because public setup context type relies on
   * legacy VNode types
   */
  function useListeners() {
      return getContext().listeners;
  }
  function getContext() {
      if (!currentInstance) {
          warn$2("useContext() called without active instance.");
      }
      var vm = currentInstance;
      return vm._setupContext || (vm._setupContext = createSetupContext(vm));
  }
  /**
   * Runtime helper for merging default declarations. Imported by compiled code
   * only.
   * @internal
   */
  function mergeDefaults(raw, defaults) {
      var props = isArray$1(raw)
          ? raw.reduce(function (normalized, p) { return ((normalized[p] = {}), normalized); }, {})
          : raw;
      for (var key in defaults) {
          var opt = props[key];
          if (opt) {
              if (isArray$1(opt) || isFunction$2(opt)) {
                  props[key] = { type: opt, default: defaults[key] };
              }
              else {
                  opt.default = defaults[key];
              }
          }
          else if (opt === null) {
              props[key] = { default: defaults[key] };
          }
          else {
              warn$2("props default key \"".concat(key, "\" has no corresponding declaration."));
          }
      }
      return props;
  }

  function initRender(vm) {
      vm._vnode = null; // the root of the child tree
      vm._staticTrees = null; // v-once cached trees
      var options = vm.$options;
      var parentVnode = (vm.$vnode = options._parentVnode); // the placeholder node in parent tree
      var renderContext = parentVnode && parentVnode.context;
      vm.$slots = resolveSlots(options._renderChildren, renderContext);
      vm.$scopedSlots = parentVnode
          ? normalizeScopedSlots(vm.$parent, parentVnode.data.scopedSlots, vm.$slots)
          : emptyObject;
      // bind the createElement fn to this instance
      // so that we get proper render context inside it.
      // args order: tag, data, children, normalizationType, alwaysNormalize
      // internal version is used by render functions compiled from templates
      // @ts-expect-error
      vm._c = function (a, b, c, d) { return createElement$1(vm, a, b, c, d, false); };
      // normalization is always applied for the public version, used in
      // user-written render functions.
      // @ts-expect-error
      vm.$createElement = function (a, b, c, d) { return createElement$1(vm, a, b, c, d, true); };
      // $attrs & $listeners are exposed for easier HOC creation.
      // they need to be reactive so that HOCs using them are always updated
      var parentData = parentVnode && parentVnode.data;
      /* istanbul ignore else */
      {
          defineReactive(vm, '$attrs', (parentData && parentData.attrs) || emptyObject, function () {
              !isUpdatingChildComponent && warn$2("$attrs is readonly.", vm);
          }, true);
          defineReactive(vm, '$listeners', options._parentListeners || emptyObject, function () {
              !isUpdatingChildComponent && warn$2("$listeners is readonly.", vm);
          }, true);
      }
  }
  var currentRenderingInstance = null;
  function renderMixin(Vue) {
      // install runtime convenience helpers
      installRenderHelpers(Vue.prototype);
      Vue.prototype.$nextTick = function (fn) {
          return nextTick(fn, this);
      };
      Vue.prototype._render = function () {
          var vm = this;
          var _a = vm.$options, render = _a.render, _parentVnode = _a._parentVnode;
          if (_parentVnode && vm._isMounted) {
              vm.$scopedSlots = normalizeScopedSlots(vm.$parent, _parentVnode.data.scopedSlots, vm.$slots, vm.$scopedSlots);
              if (vm._slotsProxy) {
                  syncSetupSlots(vm._slotsProxy, vm.$scopedSlots);
              }
          }
          // set parent vnode. this allows render functions to have access
          // to the data on the placeholder node.
          vm.$vnode = _parentVnode;
          // Support for loadingTemplate (Vue 2 Steroids)
          var loadingTemplate = vm.$options.loadingTemplate;
          var finalRender = render;
          var originalStaticRenderFns = vm.$options.staticRenderFns;
          var swappedStaticTrees = false;
          var originalStaticTrees = null;
          if (vm.$loading && loadingTemplate) {
              if (!vm.$options._loadingRender) {
                  var baseCtor = vm.$options._base;
                  if (baseCtor && baseCtor.compile) {
                      try {
                          var compiled = baseCtor.compile(loadingTemplate);
                          vm.$options._loadingRender = compiled.render;
                          vm.$options._loadingStaticRenderFns = compiled.staticRenderFns;
                      }
                      catch (e) {
                          warn$2("Failed to compile loadingTemplate: ".concat(e.message), vm);
                      }
                  }
              }
              if (vm.$options._loadingRender) {
                  finalRender = vm.$options._loadingRender;
                  vm.$options.staticRenderFns = vm.$options._loadingStaticRenderFns;
                  // Swap static trees to avoid clashing with main template
                  swappedStaticTrees = true;
                  originalStaticTrees = vm._staticTrees;
                  if (!vm._loadingStaticTrees) {
                      vm._loadingStaticTrees = [];
                  }
                  vm._staticTrees = vm._loadingStaticTrees;
              }
          }
          // render self
          var prevInst = currentInstance;
          var prevRenderInst = currentRenderingInstance;
          var vnode;
          try {
              setCurrentInstance(vm);
              currentRenderingInstance = vm;
              vnode = finalRender.call(vm._renderProxy, vm.$createElement);
          }
          catch (e) {
              handleError(e, vm, "render");
              // return error render result,
              // or previous vnode to prevent render error causing blank component
              /* istanbul ignore else */
              if (vm.$options.renderError) {
                  try {
                      vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
                  }
                  catch (e) {
                      handleError(e, vm, "renderError");
                      vnode = vm._vnode;
                  }
              }
              else {
                  vnode = vm._vnode;
              }
          }
          finally {
              currentRenderingInstance = prevRenderInst;
              setCurrentInstance(prevInst);
              // Restore original static render functions and trees if swapped
              if (swappedStaticTrees) {
                  vm.$options.staticRenderFns = originalStaticRenderFns;
                  vm._staticTrees = originalStaticTrees;
              }
          }
          // if the returned array contains only a single node, allow it
          if (isArray$1(vnode) && vnode.length === 1) {
              vnode = vnode[0];
          }
          // return empty vnode in case the render function errored out
          if (!(vnode instanceof VNode)) {
              if (isArray$1(vnode)) {
                  warn$2('Multiple root nodes returned from render function. Render function ' +
                      'should return a single root node.', vm);
              }
              vnode = createEmptyVNode();
          }
          // set parent
          vnode.parent = _parentVnode;
          return vnode;
      };
  }

  function ensureCtor(comp, base) {
      if (comp.__esModule || (hasSymbol && comp[Symbol.toStringTag] === 'Module')) {
          comp = comp.default;
      }
      return isObject$1(comp) ? base.extend(comp) : comp;
  }
  function createAsyncPlaceholder(factory, data, context, children, tag) {
      var node = createEmptyVNode();
      node.asyncFactory = factory;
      node.asyncMeta = { data: data, context: context, children: children, tag: tag };
      return node;
  }
  function resolveAsyncComponent(factory, baseCtor) {
      if (isTrue(factory.error) && isDef(factory.errorComp)) {
          return factory.errorComp;
      }
      if (isDef(factory.resolved)) {
          return factory.resolved;
      }
      var owner = currentRenderingInstance;
      if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
          // already pending
          factory.owners.push(owner);
      }
      if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
          return factory.loadingComp;
      }
      if (owner && !isDef(factory.owners)) {
          var owners_1 = (factory.owners = [owner]);
          var sync_1 = true;
          var timerLoading_1 = null;
          var timerTimeout_1 = null;
          owner.$on('hook:destroyed', function () { return remove$2(owners_1, owner); });
          var forceRender_1 = function (renderCompleted) {
              for (var i = 0, l = owners_1.length; i < l; i++) {
                  owners_1[i].$forceUpdate();
              }
              if (renderCompleted) {
                  owners_1.length = 0;
                  if (timerLoading_1 !== null) {
                      clearTimeout(timerLoading_1);
                      timerLoading_1 = null;
                  }
                  if (timerTimeout_1 !== null) {
                      clearTimeout(timerTimeout_1);
                      timerTimeout_1 = null;
                  }
              }
          };
          var resolve = once(function (res) {
              // cache resolved
              factory.resolved = ensureCtor(res, baseCtor);
              // invoke callbacks only if this is not a synchronous resolve
              // (async resolves are shimmed as synchronous during SSR)
              if (!sync_1) {
                  forceRender_1(true);
              }
              else {
                  owners_1.length = 0;
              }
          });
          var reject_1 = once(function (reason) {
              warn$2("Failed to resolve async component: ".concat(String(factory)) +
                      (reason ? "\nReason: ".concat(reason) : ''));
              if (isDef(factory.errorComp)) {
                  factory.error = true;
                  forceRender_1(true);
              }
          });
          var res_1 = factory(resolve, reject_1);
          if (isObject$1(res_1)) {
              if (isPromise(res_1)) {
                  // () => Promise
                  if (isUndef(factory.resolved)) {
                      res_1.then(resolve, reject_1);
                  }
              }
              else if (isPromise(res_1.component)) {
                  res_1.component.then(resolve, reject_1);
                  if (isDef(res_1.error)) {
                      factory.errorComp = ensureCtor(res_1.error, baseCtor);
                  }
                  if (isDef(res_1.loading)) {
                      factory.loadingComp = ensureCtor(res_1.loading, baseCtor);
                      if (res_1.delay === 0) {
                          factory.loading = true;
                      }
                      else {
                          // @ts-expect-error NodeJS timeout type
                          timerLoading_1 = setTimeout(function () {
                              timerLoading_1 = null;
                              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                                  factory.loading = true;
                                  forceRender_1(false);
                              }
                          }, res_1.delay || 200);
                      }
                  }
                  if (isDef(res_1.timeout)) {
                      // @ts-expect-error NodeJS timeout type
                      timerTimeout_1 = setTimeout(function () {
                          timerTimeout_1 = null;
                          if (isUndef(factory.resolved)) {
                              reject_1("timeout (".concat(res_1.timeout, "ms)") );
                          }
                      }, res_1.timeout);
                  }
              }
          }
          sync_1 = false;
          // return in case resolved synchronously
          return factory.loading ? factory.loadingComp : factory.resolved;
      }
  }

  function getFirstComponentChild(children) {
      if (isArray$1(children)) {
          for (var i = 0; i < children.length; i++) {
              var c = children[i];
              if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
                  return c;
              }
          }
      }
  }

  /**
   * Proof of Concept: XML Props Parser
   * Extracts <props> from children and converts to propsData
   */
  function castValue(val) {
      if (typeof val === 'string') {
          var trimmed = val.trim();
          if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
              (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
              return parseOdooExpression(trimmed);
          }
          else if (trimmed === 'true') {
              return true;
          }
          else if (trimmed === 'false') {
              return false;
          }
          else if (trimmed !== '' && !isNaN(Number(trimmed))) {
              return Number(trimmed);
          }
          return val;
      }
      return val;
  }
  function extractXmlProps(children) {
      if (!children || !children.length)
          return undefined;
      var propsNodeIndex = -1;
      var props = {};
      // Find <props> node
      for (var i = 0; i < children.length; i++) {
          var node = children[i];
          if (node.tag && (node.tag.endsWith('props') || node.tag === 'props')) {
              propsNodeIndex = i;
              break;
          }
      }
      if (propsNodeIndex === -1)
          return undefined;
      var propsNode = children[propsNodeIndex];
      var propChildren = propsNode.children;
      if (propChildren) {
          var collectFields_1 = function (nodes) {
              nodes.forEach(function (child) {
                  if (!child.tag)
                      return;
                  var tagName = child.tag.replace(/^vue-component-\d+-/, '').toLowerCase();
                  var rawAttrs = child.data && child.data.attrs ? child.data.attrs : {};
                  // Smart Casting for attributes
                  var attrs = {};
                  for (var key in rawAttrs) {
                      attrs[key] = castValue(rawAttrs[key]);
                  }
                  if (tagName === 'field') {
                      var propName = 'fields';
                      if (!props[propName])
                          props[propName] = [];
                      props[propName].push(__assign({}, attrs));
                      // Browser might nest unknown self-closing tags
                      if (child.children) {
                          collectFields_1(child.children);
                      }
                  }
                  else {
                      // Normal tag
                      var propName = tagName;
                      var value = '';
                      if (child.children && child.children.length > 0) {
                          if (child.children.length === 1 && !child.children[0].tag) {
                              value = castValue(child.children[0].text);
                          }
                          else {
                              value = child.children;
                          }
                      }
                      else if (Object.keys(attrs).length > 0) {
                          value = __assign({}, attrs);
                      }
                      props[propName] = value;
                      // Even if not a field, check children for nested fields
                      // (Though this is less common for non-field tags)
                      if (child.children) {
                          collectFields_1(child.children);
                      }
                  }
              });
          };
          collectFields_1(propChildren);
      }
      // Remove the <props> node from children so it's not rendered in the slot
      children.splice(propsNodeIndex, 1);
      return Object.keys(props).length > 0 ? props : undefined;
  }
  /**
   * Flexible evaluator for Odoo-style expressions
   * Converts [a, 'b', c] to ["a", "b", "c"] by treating undefined variables as strings
   */
  function parseOdooExpression(str) {
      var trimmed = str.trim();
      try {
          // Use a Proxy to catch any undefined variable access and return it as a string
          // 'has' trap is critical for 'with' block to intercept all variable lookups
          var handler = {
              has: function () { return true; },
              get: function (target, prop) {
                  // Don't intercept symbols or internal properties
                  if (typeof prop === 'symbol' || prop.startsWith('__')) {
                      return undefined;
                  }
                  // Return the property name itself as the value
                  return prop;
              }
          };
          var proxy = new Proxy({}, handler);
          // Create a function that executes the expression with our proxy as the scope
          // We normalize single quotes to double quotes for the evaluation
          var expression = trimmed.replace(/'/g, '"');
          var evaluator = new Function('proxy', "with(proxy) { return ".concat(expression, " }"));
          return evaluator(proxy);
      }
      catch (e) {
          // If complex evaluation fails, fall back to the original string
          return str;
      }
  }

  function initEvents(vm) {
      vm._events = Object.create(null);
      vm._hasHookEvent = false;
      // init parent attached events
      var listeners = vm.$options._parentListeners;
      if (listeners) {
          updateComponentListeners(vm, listeners);
      }
  }
  var target$1;
  function add$1(event, fn) {
      target$1.$on(event, fn);
  }
  function remove$1(event, fn) {
      target$1.$off(event, fn);
  }
  function createOnceHandler$1(event, fn) {
      var _target = target$1;
      return function onceHandler() {
          var res = fn.apply(null, arguments);
          if (res !== null) {
              _target.$off(event, onceHandler);
          }
      };
  }
  function updateComponentListeners(vm, listeners, oldListeners) {
      target$1 = vm;
      updateListeners(listeners, oldListeners || {}, add$1, remove$1, createOnceHandler$1, vm);
      target$1 = undefined;
  }
  function eventsMixin(Vue) {
      var hookRE = /^hook:/;
      Vue.prototype.$on = function (event, fn) {
          var vm = this;
          if (isArray$1(event)) {
              for (var i = 0, l = event.length; i < l; i++) {
                  vm.$on(event[i], fn);
              }
          }
          else {
              (vm._events[event] || (vm._events[event] = [])).push(fn);
              // optimize hook:event cost by using a boolean flag marked at registration
              // instead of a hash lookup
              if (hookRE.test(event)) {
                  vm._hasHookEvent = true;
              }
          }
          return vm;
      };
      Vue.prototype.$once = function (event, fn) {
          var vm = this;
          function on() {
              vm.$off(event, on);
              fn.apply(vm, arguments);
          }
          on.fn = fn;
          vm.$on(event, on);
          return vm;
      };
      Vue.prototype.$off = function (event, fn) {
          var vm = this;
          // all
          if (!arguments.length) {
              vm._events = Object.create(null);
              return vm;
          }
          // array of events
          if (isArray$1(event)) {
              for (var i_1 = 0, l = event.length; i_1 < l; i_1++) {
                  vm.$off(event[i_1], fn);
              }
              return vm;
          }
          // specific event
          var cbs = vm._events[event];
          if (!cbs) {
              return vm;
          }
          if (!fn) {
              vm._events[event] = null;
              return vm;
          }
          // specific handler
          var cb;
          var i = cbs.length;
          while (i--) {
              cb = cbs[i];
              if (cb === fn || cb.fn === fn) {
                  cbs.splice(i, 1);
                  break;
              }
          }
          return vm;
      };
      Vue.prototype.$emit = function (event) {
          var vm = this;
          {
              var lowerCaseEvent = event.toLowerCase();
              if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
                  tip("Event \"".concat(lowerCaseEvent, "\" is emitted in component ") +
                      "".concat(formatComponentName(vm), " but the handler is registered for \"").concat(event, "\". ") +
                      "Note that HTML attributes are case-insensitive and you cannot use " +
                      "v-on to listen to camelCase events when using in-DOM templates. " +
                      "You should probably use \"".concat(hyphenate(event), "\" instead of \"").concat(event, "\"."));
              }
          }
          var cbs = vm._events[event];
          if (cbs) {
              cbs = cbs.length > 1 ? toArray$1(cbs) : cbs;
              var args = toArray$1(arguments, 1);
              var info = "event handler for \"".concat(event, "\"");
              for (var i = 0, l = cbs.length; i < l; i++) {
                  invokeWithErrorHandling(cbs[i], vm, args, vm, info);
              }
          }
          return vm;
      };
  }

  var activeEffectScope;
  var EffectScope = /** @class */ (function () {
      function EffectScope(detached) {
          if (detached === void 0) { detached = false; }
          this.detached = detached;
          /**
           * @internal
           */
          this.active = true;
          /**
           * @internal
           */
          this.effects = [];
          /**
           * @internal
           */
          this.cleanups = [];
          this.parent = activeEffectScope;
          if (!detached && activeEffectScope) {
              this.index =
                  (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
          }
      }
      EffectScope.prototype.run = function (fn) {
          if (this.active) {
              var currentEffectScope = activeEffectScope;
              try {
                  activeEffectScope = this;
                  return fn();
              }
              finally {
                  activeEffectScope = currentEffectScope;
              }
          }
          else {
              warn$2("cannot run an inactive effect scope.");
          }
      };
      /**
       * This should only be called on non-detached scopes
       * @internal
       */
      EffectScope.prototype.on = function () {
          activeEffectScope = this;
      };
      /**
       * This should only be called on non-detached scopes
       * @internal
       */
      EffectScope.prototype.off = function () {
          activeEffectScope = this.parent;
      };
      EffectScope.prototype.stop = function (fromParent) {
          if (this.active) {
              var i = void 0, l = void 0;
              for (i = 0, l = this.effects.length; i < l; i++) {
                  this.effects[i].teardown();
              }
              for (i = 0, l = this.cleanups.length; i < l; i++) {
                  this.cleanups[i]();
              }
              if (this.scopes) {
                  for (i = 0, l = this.scopes.length; i < l; i++) {
                      this.scopes[i].stop(true);
                  }
              }
              // nested scope, dereference from parent to avoid memory leaks
              if (!this.detached && this.parent && !fromParent) {
                  // optimized O(1) removal
                  var last = this.parent.scopes.pop();
                  if (last && last !== this) {
                      this.parent.scopes[this.index] = last;
                      last.index = this.index;
                  }
              }
              this.parent = undefined;
              this.active = false;
          }
      };
      return EffectScope;
  }());
  function effectScope(detached) {
      return new EffectScope(detached);
  }
  /**
   * @internal
   */
  function recordEffectScope(effect, scope) {
      if (scope === void 0) { scope = activeEffectScope; }
      if (scope && scope.active) {
          scope.effects.push(effect);
      }
  }
  function getCurrentScope() {
      return activeEffectScope;
  }
  function onScopeDispose(fn) {
      if (activeEffectScope) {
          activeEffectScope.cleanups.push(fn);
      }
      else {
          warn$2("onScopeDispose() is called when there is no active effect scope" +
              " to be associated with.");
      }
  }

  var activeInstance = null;
  var isUpdatingChildComponent = false;
  function setActiveInstance(vm) {
      var prevActiveInstance = activeInstance;
      activeInstance = vm;
      return function () {
          activeInstance = prevActiveInstance;
      };
  }
  function initLifecycle(vm) {
      var options = vm.$options;
      // locate first non-abstract parent
      var parent = options.parent;
      if (parent && !options.abstract) {
          while (parent.$options.abstract && parent.$parent) {
              parent = parent.$parent;
          }
          parent.$children.push(vm);
      }
      vm.$parent = parent;
      vm.$root = parent ? parent.$root : vm;
      vm.$children = [];
      vm.$refs = {};
      vm._provided = parent ? parent._provided : Object.create(null);
      vm._watcher = null;
      vm._inactive = null;
      vm._directInactive = false;
      vm._isMounted = false;
      vm._isDestroyed = false;
      vm._isBeingDestroyed = false;
  }
  function lifecycleMixin(Vue) {
      Vue.prototype._update = function (vnode, hydrating) {
          var vm = this;
          var prevEl = vm.$el;
          var prevVnode = vm._vnode;
          var restoreActiveInstance = setActiveInstance(vm);
          vm._vnode = vnode;
          // Vue.prototype.__patch__ is injected in entry points
          // based on the rendering backend used.
          if (!prevVnode) {
              // initial render
              vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
          }
          else {
              // updates
              vm.$el = vm.__patch__(prevVnode, vnode);
          }
          restoreActiveInstance();
          // update __vue__ reference
          if (prevEl) {
              prevEl.__vue__ = null;
          }
          if (vm.$el) {
              vm.$el.__vue__ = vm;
          }
          // if parent is an HOC, update its $el as well
          var wrapper = vm;
          while (wrapper &&
              wrapper.$vnode &&
              wrapper.$parent &&
              wrapper.$vnode === wrapper.$parent._vnode) {
              wrapper.$parent.$el = wrapper.$el;
              wrapper = wrapper.$parent;
          }
          // updated hook is called by the scheduler to ensure that children are
          // updated in a parent's updated hook.
      };
      Vue.prototype.$forceUpdate = function () {
          var vm = this;
          if (vm._watcher) {
              vm._watcher.update();
          }
      };
      Vue.prototype.$destroy = function () {
          var vm = this;
          if (vm._isBeingDestroyed) {
              return;
          }
          callHook$1(vm, 'beforeDestroy');
          vm._isBeingDestroyed = true;
          // Unregister this instance to prevent memory leaks
          unregisterVueInstance(vm);
          // remove self from parent
          var parent = vm.$parent;
          if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
              remove$2(parent.$children, vm);
          }
          // teardown scope. this includes both the render watcher and other
          // watchers created
          vm._scope.stop();
          // remove reference from data ob
          // frozen object may not have observer.
          if (vm._data.__ob__) {
              vm._data.__ob__.vmCount--;
          }
          // call the last hook...
          vm._isDestroyed = true;
          // invoke destroy hooks on current rendered tree
          vm.__patch__(vm._vnode, null);
          // fire destroyed hook
          callHook$1(vm, 'destroyed');
          // turn off all instance listeners.
          vm.$off();
          // remove __vue__ reference
          if (vm.$el) {
              vm.$el.__vue__ = null;
          }
          // release circular reference (#6759)
          if (vm.$vnode) {
              vm.$vnode.parent = null;
          }
      };
  }
  function mountComponent(vm, el, hydrating) {
      vm.$el = el;
      if (!vm.$options.render) {
          // @ts-expect-error invalid type
          vm.$options.render = createEmptyVNode;
          {
              /* istanbul ignore if */
              if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
                  vm.$options.el ||
                  el) {
                  warn$2('You are using the runtime-only build of Vue where the template ' +
                      'compiler is not available. Either pre-compile the templates into ' +
                      'render functions, or use the compiler-included build.', vm);
              }
              else {
                  warn$2('Failed to mount component: template or render function not defined.', vm);
              }
          }
      }
      callHook$1(vm, 'beforeMount');
      var updateComponent;
      /* istanbul ignore if */
      if (config.performance && mark) {
          updateComponent = function () {
              var name = vm._name;
              var id = vm._uid;
              var startTag = "vue-perf-start:".concat(id);
              var endTag = "vue-perf-end:".concat(id);
              mark(startTag);
              var vnode = vm._render();
              mark(endTag);
              measure("vue ".concat(name, " render"), startTag, endTag);
              mark(startTag);
              vm._update(vnode, hydrating);
              mark(endTag);
              measure("vue ".concat(name, " patch"), startTag, endTag);
          };
      }
      else {
          updateComponent = function () {
              vm._update(vm._render(), hydrating);
          };
      }
      var watcherOptions = {
          before: function () {
              if (vm._isMounted && !vm._isDestroyed) {
                  callHook$1(vm, 'beforeUpdate');
              }
          }
      };
      {
          watcherOptions.onTrack = function (e) { return callHook$1(vm, 'renderTracked', [e]); };
          watcherOptions.onTrigger = function (e) { return callHook$1(vm, 'renderTriggered', [e]); };
      }
      // we set this to vm._watcher inside the watcher's constructor
      // since the watcher's initial patch may call $forceUpdate (e.g. inside child
      // component's mounted hook), which relies on vm._watcher being already defined
      new Watcher(vm, updateComponent, noop$1, watcherOptions, true /* isRenderWatcher */);
      hydrating = false;
      // flush buffer for flush: "pre" watchers queued in setup()
      var preWatchers = vm._preWatchers;
      if (preWatchers) {
          for (var i = 0; i < preWatchers.length; i++) {
              preWatchers[i].run();
          }
      }
      // manually mounted instance, call mounted on self
      // mounted is called for render-created child components in its inserted hook
      if (vm.$vnode == null) {
          vm._isMounted = true;
          callHook$1(vm, 'mounted');
      }
      return vm;
  }
  function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
      {
          isUpdatingChildComponent = true;
      }
      // determine whether component has slot children
      // we need to do this before overwriting $options._renderChildren.
      // check if there are dynamic scopedSlots (hand-written or compiled but with
      // dynamic slot names). Static scoped slots compiled from template has the
      // "$stable" marker.
      var newScopedSlots = parentVnode.data.scopedSlots;
      var oldScopedSlots = vm.$scopedSlots;
      var hasDynamicScopedSlot = !!((newScopedSlots && !newScopedSlots.$stable) ||
          (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
          (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
          (!newScopedSlots && vm.$scopedSlots.$key));
      // Any static slot children from the parent may have changed during parent's
      // update. Dynamic scoped slots may also have changed. In such cases, a forced
      // update is necessary to ensure correctness.
      var needsForceUpdate = !!(renderChildren || // has new static slots
          vm.$options._renderChildren || // has old static slots
          hasDynamicScopedSlot);
      var prevVNode = vm.$vnode;
      vm.$options._parentVnode = parentVnode;
      vm.$vnode = parentVnode; // update vm's placeholder node without re-render
      if (vm._vnode) {
          // update child tree's parent
          vm._vnode.parent = parentVnode;
      }
      vm.$options._renderChildren = renderChildren;
      // update $attrs and $listeners hash
      // these are also reactive so they may trigger child update if the child
      // used them during render
      var attrs = parentVnode.data.attrs || emptyObject;
      if (vm._attrsProxy) {
          // force update if attrs are accessed and has changed since it may be
          // passed to a child component.
          if (syncSetupProxy(vm._attrsProxy, attrs, (prevVNode.data && prevVNode.data.attrs) || emptyObject, vm, '$attrs')) {
              needsForceUpdate = true;
          }
      }
      vm.$attrs = attrs;
      // update listeners
      listeners = listeners || emptyObject;
      var prevListeners = vm.$options._parentListeners;
      if (vm._listenersProxy) {
          syncSetupProxy(vm._listenersProxy, listeners, prevListeners || emptyObject, vm, '$listeners');
      }
      vm.$listeners = vm.$options._parentListeners = listeners;
      updateComponentListeners(vm, listeners, prevListeners);
      // update props
      if (propsData && vm.$options.props) {
          toggleObserving(false);
          var props = vm._props;
          var propKeys = vm.$options._propKeys || [];
          for (var i = 0; i < propKeys.length; i++) {
              var key = propKeys[i];
              var propOptions = vm.$options.props; // wtf flow?
              props[key] = validateProp(key, propOptions, propsData, vm);
          }
          toggleObserving(true);
          // keep a copy of raw propsData
          vm.$options.propsData = propsData;
      }
      // resolve slots + force update if has children
      if (needsForceUpdate) {
          vm.$slots = resolveSlots(renderChildren, parentVnode.context);
          vm.$forceUpdate();
      }
      {
          isUpdatingChildComponent = false;
      }
  }
  function isInInactiveTree(vm) {
      while (vm && (vm = vm.$parent)) {
          if (vm._inactive)
              return true;
      }
      return false;
  }
  function activateChildComponent(vm, direct) {
      if (direct) {
          vm._directInactive = false;
          if (isInInactiveTree(vm)) {
              return;
          }
      }
      else if (vm._directInactive) {
          return;
      }
      if (vm._inactive || vm._inactive === null) {
          vm._inactive = false;
          for (var i = 0; i < vm.$children.length; i++) {
              activateChildComponent(vm.$children[i]);
          }
          callHook$1(vm, 'activated');
      }
  }
  function deactivateChildComponent(vm, direct) {
      if (direct) {
          vm._directInactive = true;
          if (isInInactiveTree(vm)) {
              return;
          }
      }
      if (!vm._inactive) {
          vm._inactive = true;
          for (var i = 0; i < vm.$children.length; i++) {
              deactivateChildComponent(vm.$children[i]);
          }
          callHook$1(vm, 'deactivated');
      }
  }
  function callHook$1(vm, hook, args, setContext) {
      if (setContext === void 0) { setContext = true; }
      // #7573 disable dep collection when invoking lifecycle hooks
      pushTarget();
      var prevInst = currentInstance;
      var prevScope = getCurrentScope();
      setContext && setCurrentInstance(vm);
      var handlers = vm.$options[hook];
      var info = "".concat(hook, " hook");
      if (handlers) {
          for (var i = 0, j = handlers.length; i < j; i++) {
              invokeWithErrorHandling(handlers[i], vm, args || null, vm, info);
          }
      }
      if (vm._hasHookEvent) {
          vm.$emit('hook:' + hook);
      }
      if (setContext) {
          setCurrentInstance(prevInst);
          prevScope && prevScope.on();
      }
      popTarget();
  }

  var MAX_UPDATE_COUNT = 100;
  var queue = [];
  var activatedChildren = [];
  var has = {};
  var circular = {};
  var waiting = false;
  var flushing = false;
  var index$1 = 0;
  /**
   * Reset the scheduler's state.
   */
  function resetSchedulerState() {
      index$1 = queue.length = activatedChildren.length = 0;
      has = {};
      {
          circular = {};
      }
      waiting = flushing = false;
  }
  // Async edge case #6566 requires saving the timestamp when event listeners are
  // attached. However, calling performance.now() has a perf overhead especially
  // if the page has thousands of event listeners. Instead, we take a timestamp
  // every time the scheduler flushes and use that for all event listeners
  // attached during that flush.
  var currentFlushTimestamp = 0;
  // Async edge case fix requires storing an event listener's attach timestamp.
  var getNow = Date.now;
  // Determine what event timestamp the browser is using. Annoyingly, the
  // timestamp can either be hi-res (relative to page load) or low-res
  // (relative to UNIX epoch), so in order to compare time we have to use the
  // same timestamp type when saving the flush timestamp.
  // All IE versions use low-res event timestamps, and have problematic clock
  // implementations (#9632)
  if (inBrowser && !isIE) {
      var performance_1 = window.performance;
      if (performance_1 &&
          typeof performance_1.now === 'function' &&
          getNow() > document.createEvent('Event').timeStamp) {
          // if the event timestamp, although evaluated AFTER the Date.now(), is
          // smaller than it, it means the event is using a hi-res timestamp,
          // and we need to use the hi-res version for event listener timestamps as
          // well.
          getNow = function () { return performance_1.now(); };
      }
  }
  var sortCompareFn = function (a, b) {
      if (a.post) {
          if (!b.post)
              return 1;
      }
      else if (b.post) {
          return -1;
      }
      return a.id - b.id;
  };
  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue() {
      currentFlushTimestamp = getNow();
      flushing = true;
      var watcher, id;
      // Sort queue before flush.
      // This ensures that:
      // 1. Components are updated from parent to child. (because parent is always
      //    created before the child)
      // 2. A component's user watchers are run before its render watcher (because
      //    user watchers are created before the render watcher)
      // 3. If a component is destroyed during a parent component's watcher run,
      //    its watchers can be skipped.
      queue.sort(sortCompareFn);
      // do not cache length because more watchers might be pushed
      // as we run existing watchers
      for (index$1 = 0; index$1 < queue.length; index$1++) {
          watcher = queue[index$1];
          if (watcher.before) {
              watcher.before();
          }
          id = watcher.id;
          has[id] = null;
          watcher.run();
          // in dev build, check and stop circular updates.
          if (has[id] != null) {
              circular[id] = (circular[id] || 0) + 1;
              if (circular[id] > MAX_UPDATE_COUNT) {
                  warn$2('You may have an infinite update loop ' +
                      (watcher.user
                          ? "in watcher with expression \"".concat(watcher.expression, "\"")
                          : "in a component render function."), watcher.vm);
                  break;
              }
          }
      }
      // keep copies of post queues before resetting state
      var activatedQueue = activatedChildren.slice();
      var updatedQueue = queue.slice();
      resetSchedulerState();
      // call component updated and activated hooks
      callActivatedHooks(activatedQueue);
      callUpdatedHooks(updatedQueue);
      cleanupDeps();
      // devtool hook
      /* istanbul ignore if */
      if (devtools && config.devtools) {
          devtools.emit('flush');
      }
  }
  function callUpdatedHooks(queue) {
      var i = queue.length;
      while (i--) {
          var watcher = queue[i];
          var vm = watcher.vm;
          if (vm && vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
              callHook$1(vm, 'updated');
          }
      }
  }
  /**
   * Queue a kept-alive component that was activated during patch.
   * The queue will be processed after the entire tree has been patched.
   */
  function queueActivatedComponent(vm) {
      // setting _inactive to false here so that a render function can
      // rely on checking whether it's in an inactive tree (e.g. router-view)
      vm._inactive = false;
      activatedChildren.push(vm);
  }
  function callActivatedHooks(queue) {
      for (var i = 0; i < queue.length; i++) {
          queue[i]._inactive = true;
          activateChildComponent(queue[i], true /* true */);
      }
  }
  /**
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
   */
  function queueWatcher(watcher) {
      var id = watcher.id;
      if (has[id] != null) {
          return;
      }
      if (watcher === Dep.target && watcher.noRecurse) {
          return;
      }
      has[id] = true;
      if (!flushing) {
          queue.push(watcher);
      }
      else {
          // if already flushing, splice the watcher based on its id
          // if already past its id, it will be run next immediately.
          var i = queue.length - 1;
          while (i > index$1 && queue[i].id > watcher.id) {
              i--;
          }
          queue.splice(i + 1, 0, watcher);
      }
      // queue the flush
      if (!waiting) {
          waiting = true;
          if (!config.async) {
              flushSchedulerQueue();
              return;
          }
          nextTick(flushSchedulerQueue);
      }
  }

  var WATCHER = "watcher";
  var WATCHER_CB = "".concat(WATCHER, " callback");
  var WATCHER_GETTER = "".concat(WATCHER, " getter");
  var WATCHER_CLEANUP = "".concat(WATCHER, " cleanup");
  // Simple effect.
  function watchEffect(effect, options) {
      return doWatch(effect, null, options);
  }
  function watchPostEffect(effect, options) {
      return doWatch(effect, null, (__assign(__assign({}, options), { flush: 'post' }) ));
  }
  function watchSyncEffect(effect, options) {
      return doWatch(effect, null, (__assign(__assign({}, options), { flush: 'sync' }) ));
  }
  // initial value for watchers to trigger on undefined initial values
  var INITIAL_WATCHER_VALUE = {};
  // implementation
  function watch(source, cb, options) {
      if (typeof cb !== 'function') {
          warn$2("`watch(fn, options?)` signature has been moved to a separate API. " +
              "Use `watchEffect(fn, options?)` instead. `watch` now only " +
              "supports `watch(source, cb, options?) signature.");
      }
      return doWatch(source, cb, options);
  }
  function doWatch(source, cb, _a) {
      var _b = _a === void 0 ? emptyObject : _a, immediate = _b.immediate, deep = _b.deep, _c = _b.flush, flush = _c === void 0 ? 'pre' : _c, onTrack = _b.onTrack, onTrigger = _b.onTrigger;
      if (!cb) {
          if (immediate !== undefined) {
              warn$2("watch() \"immediate\" option is only respected when using the " +
                  "watch(source, callback, options?) signature.");
          }
          if (deep !== undefined) {
              warn$2("watch() \"deep\" option is only respected when using the " +
                  "watch(source, callback, options?) signature.");
          }
      }
      var warnInvalidSource = function (s) {
          warn$2("Invalid watch source: ".concat(s, ". A watch source can only be a getter/effect ") +
              "function, a ref, a reactive object, or an array of these types.");
      };
      var instance = currentInstance;
      var call = function (fn, type, args) {
          if (args === void 0) { args = null; }
          var res = invokeWithErrorHandling(fn, null, args, instance, type);
          if (deep && res && res.__ob__)
              res.__ob__.dep.depend();
          return res;
      };
      var getter;
      var forceTrigger = false;
      var isMultiSource = false;
      if (isRef(source)) {
          getter = function () { return source.value; };
          forceTrigger = isShallow(source);
      }
      else if (isReactive(source)) {
          getter = function () {
              source.__ob__.dep.depend();
              return source;
          };
          deep = true;
      }
      else if (isArray$1(source)) {
          isMultiSource = true;
          forceTrigger = source.some(function (s) { return isReactive(s) || isShallow(s); });
          getter = function () {
              return source.map(function (s) {
                  if (isRef(s)) {
                      return s.value;
                  }
                  else if (isReactive(s)) {
                      s.__ob__.dep.depend();
                      return traverse(s);
                  }
                  else if (isFunction$2(s)) {
                      return call(s, WATCHER_GETTER);
                  }
                  else {
                      warnInvalidSource(s);
                  }
              });
          };
      }
      else if (isFunction$2(source)) {
          if (cb) {
              // getter with cb
              getter = function () { return call(source, WATCHER_GETTER); };
          }
          else {
              // no cb -> simple effect
              getter = function () {
                  if (instance && instance._isDestroyed) {
                      return;
                  }
                  if (cleanup) {
                      cleanup();
                  }
                  return call(source, WATCHER, [onCleanup]);
              };
          }
      }
      else {
          getter = noop$1;
          warnInvalidSource(source);
      }
      if (cb && deep) {
          var baseGetter_1 = getter;
          getter = function () { return traverse(baseGetter_1()); };
      }
      var cleanup;
      var onCleanup = function (fn) {
          cleanup = watcher.onStop = function () {
              call(fn, WATCHER_CLEANUP);
          };
      };
      // in SSR there is no need to setup an actual effect, and it should be noop
      // unless it's eager
      if (isServerRendering()) {
          // we will also not call the invalidate callback (+ runner is not set up)
          onCleanup = noop$1;
          if (!cb) {
              getter();
          }
          else if (immediate) {
              call(cb, WATCHER_CB, [
                  getter(),
                  isMultiSource ? [] : undefined,
                  onCleanup
              ]);
          }
          return noop$1;
      }
      var watcher = new Watcher(currentInstance, getter, noop$1, {
          lazy: true
      });
      watcher.noRecurse = !cb;
      var oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
      // overwrite default run
      watcher.run = function () {
          if (!watcher.active) {
              return;
          }
          if (cb) {
              // watch(source, cb)
              var newValue = watcher.get();
              if (deep ||
                  forceTrigger ||
                  (isMultiSource
                      ? newValue.some(function (v, i) {
                          return hasChanged(v, oldValue[i]);
                      })
                      : hasChanged(newValue, oldValue))) {
                  // cleanup before running cb again
                  if (cleanup) {
                      cleanup();
                  }
                  call(cb, WATCHER_CB, [
                      newValue,
                      // pass undefined as the old value when it's changed for the first time
                      oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
                      onCleanup
                  ]);
                  oldValue = newValue;
              }
          }
          else {
              // watchEffect
              watcher.get();
          }
      };
      if (flush === 'sync') {
          watcher.update = watcher.run;
      }
      else if (flush === 'post') {
          watcher.post = true;
          watcher.update = function () { return queueWatcher(watcher); };
      }
      else {
          // pre
          watcher.update = function () {
              if (instance && instance === currentInstance && !instance._isMounted) {
                  // pre-watcher triggered before
                  var buffer = instance._preWatchers || (instance._preWatchers = []);
                  if (buffer.indexOf(watcher) < 0)
                      buffer.push(watcher);
              }
              else {
                  queueWatcher(watcher);
              }
          };
      }
      {
          watcher.onTrack = onTrack;
          watcher.onTrigger = onTrigger;
      }
      // initial run
      if (cb) {
          if (immediate) {
              watcher.run();
          }
          else {
              oldValue = watcher.get();
          }
      }
      else if (flush === 'post' && instance) {
          instance.$once('hook:mounted', function () { return watcher.get(); });
      }
      else {
          watcher.get();
      }
      return function () {
          watcher.teardown();
      };
  }

  function provide(key, value) {
      if (!currentInstance) {
          {
              warn$2("provide() can only be used inside setup().");
          }
      }
      else {
          // TS doesn't allow symbol as index type
          resolveProvided(currentInstance)[key] = value;
      }
  }
  function resolveProvided(vm) {
      // by default an instance inherits its parent's provides object
      // but when it needs to provide values of its own, it creates its
      // own provides object using parent provides object as prototype.
      // this way in `inject` we can simply look up injections from direct
      // parent and let the prototype chain do the work.
      var existing = vm._provided;
      var parentProvides = vm.$parent && vm.$parent._provided;
      if (parentProvides === existing) {
          return (vm._provided = Object.create(parentProvides));
      }
      else {
          return existing;
      }
  }
  function inject(key, defaultValue, treatDefaultAsFactory) {
      if (treatDefaultAsFactory === void 0) { treatDefaultAsFactory = false; }
      // fallback to `currentRenderingInstance` so that this can be called in
      // a functional component
      var instance = currentInstance;
      if (instance) {
          // #2400
          // to support `app.use` plugins,
          // fallback to appContext's `provides` if the instance is at root
          var provides = instance.$parent && instance.$parent._provided;
          if (provides && key in provides) {
              // TS doesn't allow symbol as index type
              return provides[key];
          }
          else if (arguments.length > 1) {
              return treatDefaultAsFactory && isFunction$2(defaultValue)
                  ? defaultValue.call(instance)
                  : defaultValue;
          }
          else {
              warn$2("injection \"".concat(String(key), "\" not found."));
          }
      }
      else {
          warn$2("inject() can only be used inside setup() or functional components.");
      }
  }

  /**
   * @internal this function needs manual public type declaration because it relies
   * on previously manually authored types from Vue 2
   */
  function h(type, props, children) {
      if (!currentInstance) {
          warn$2("globally imported h() can only be invoked when there is an active " +
                  "component instance, e.g. synchronously in a component's render or setup function.");
      }
      return createElement$1(currentInstance, type, props, children, 2, true);
  }

  function handleError(err, vm, info) {
      // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
      // See: https://github.com/vuejs/vuex/issues/1505
      pushTarget();
      try {
          if (vm) {
              var cur = vm;
              while ((cur = cur.$parent)) {
                  var hooks = cur.$options.errorCaptured;
                  if (hooks) {
                      for (var i = 0; i < hooks.length; i++) {
                          try {
                              var capture = hooks[i].call(cur, err, vm, info) === false;
                              if (capture)
                                  return;
                          }
                          catch (e) {
                              globalHandleError(e, cur, 'errorCaptured hook');
                          }
                      }
                  }
              }
          }
          globalHandleError(err, vm, info);
      }
      finally {
          popTarget();
      }
  }
  function invokeWithErrorHandling(handler, context, args, vm, info) {
      var res;
      try {
          res = args ? handler.apply(context, args) : handler.call(context);
          if (res && !res._isVue && isPromise(res) && !res._handled) {
              res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
              res._handled = true;
          }
      }
      catch (e) {
          handleError(e, vm, info);
      }
      return res;
  }
  function globalHandleError(err, vm, info) {
      if (config.errorHandler) {
          try {
              return config.errorHandler.call(null, err, vm, info);
          }
          catch (e) {
              // if the user intentionally throws the original error in the handler,
              // do not log it twice
              if (e !== err) {
                  logError(e, null, 'config.errorHandler');
              }
          }
      }
      logError(err, vm, info);
  }
  function logError(err, vm, info) {
      {
          var componentName = vm ? formatComponentName(vm, false) : '';
          var msg = "[Vue Error]".concat(componentName ? " in ".concat(componentName.replace(/[<>]/g, '')) : '', ": ").concat(err.toString(), " (found in ").concat(info, ")");
          // Log a prominent error message with component name
          if (typeof console !== 'undefined') {
              console.error('%c' + msg, 'color: red; font-weight: bold; font-size: 1.1em;');
          }
          warn$2("Error in ".concat(info, ": \"").concat(err.toString(), "\""), vm);
      }
      /* istanbul ignore else */
      if (inBrowser && typeof console !== 'undefined') {
          console.error(err);
      }
      else {
          throw err;
      }
  }

  /* globals MutationObserver */
  var isUsingMicroTask = false;
  var callbacks = [];
  var pending = false;
  function flushCallbacks() {
      pending = false;
      var copies = callbacks.slice(0);
      callbacks.length = 0;
      for (var i = 0; i < copies.length; i++) {
          copies[i]();
      }
  }
  // Here we have async deferring wrappers using microtasks.
  // In 2.5 we used (macro) tasks (in combination with microtasks).
  // However, it has subtle problems when state is changed right before repaint
  // (e.g. #6813, out-in transitions).
  // Also, using (macro) tasks in event handler would cause some weird behaviors
  // that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
  // So we now use microtasks everywhere, again.
  // A major drawback of this tradeoff is that there are some scenarios
  // where microtasks have too high a priority and fire in between supposedly
  // sequential events (e.g. #4521, #6690, which have workarounds)
  // or even between bubbling of the same event (#6566).
  var timerFunc;
  // The nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore next, $flow-disable-line */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
      var p_1 = Promise.resolve();
      timerFunc = function () {
          p_1.then(flushCallbacks);
          // In problematic UIWebViews, Promise.then doesn't completely break, but
          // it can get stuck in a weird state where callbacks are pushed into the
          // microtask queue but the queue isn't being flushed, until the browser
          // needs to do some other work, e.g. handle a timer. Therefore we can
          // "force" the microtask queue to be flushed by adding an empty timer.
          if (isIOS)
              setTimeout(noop$1);
      };
      isUsingMicroTask = true;
  }
  else if (!isIE &&
      typeof MutationObserver !== 'undefined' &&
      (isNative(MutationObserver) ||
          // PhantomJS and iOS 7.x
          MutationObserver.toString() === '[object MutationObserverConstructor]')) {
      // Use MutationObserver where native Promise is not available,
      // e.g. PhantomJS, iOS7, Android 4.4
      // (#6466 MutationObserver is unreliable in IE11)
      var counter_1 = 1;
      var observer = new MutationObserver(flushCallbacks);
      var textNode_1 = document.createTextNode(String(counter_1));
      observer.observe(textNode_1, {
          characterData: true
      });
      timerFunc = function () {
          counter_1 = (counter_1 + 1) % 2;
          textNode_1.data = String(counter_1);
      };
      isUsingMicroTask = true;
  }
  else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
      // Fallback to setImmediate.
      // Technically it leverages the (macro) task queue,
      // but it is still a better choice than setTimeout.
      timerFunc = function () {
          setImmediate(flushCallbacks);
      };
  }
  else {
      // Fallback to setTimeout.
      timerFunc = function () {
          setTimeout(flushCallbacks, 0);
      };
  }
  /**
   * @internal
   */
  function nextTick(cb, ctx) {
      var _resolve;
      callbacks.push(function () {
          if (cb) {
              try {
                  cb.call(ctx);
              }
              catch (e) {
                  handleError(e, ctx, 'nextTick');
              }
          }
          else if (_resolve) {
              _resolve(ctx);
          }
      });
      if (!pending) {
          pending = true;
          timerFunc();
      }
      // $flow-disable-line
      if (!cb && typeof Promise !== 'undefined') {
          return new Promise(function (resolve) {
              _resolve = resolve;
          });
      }
  }

  function useCssModule(name) {
      /* istanbul ignore else */
      {
          {
              warn$2("useCssModule() is not supported in the global build.");
          }
          return emptyObject;
      }
  }

  /**
   * Runtime helper for SFC's CSS variable injection feature.
   * @private
   */
  function useCssVars(getter) {
      if (!inBrowser && !false)
          return;
      var instance = currentInstance;
      if (!instance) {
          warn$2("useCssVars is called without current active component instance.");
          return;
      }
      watchPostEffect(function () {
          var el = instance.$el;
          var vars = getter(instance, instance._setupProxy);
          if (el && el.nodeType === 1) {
              var style = el.style;
              for (var key in vars) {
                  style.setProperty("--".concat(key), vars[key]);
              }
          }
      });
  }

  /**
   * v3-compatible async component API.
   * @internal the type is manually declared in <root>/types/v3-define-async-component.d.ts
   * because it relies on existing manual types
   */
  function defineAsyncComponent(source) {
      if (isFunction$2(source)) {
          source = { loader: source };
      }
      var loader = source.loader, loadingComponent = source.loadingComponent, errorComponent = source.errorComponent, _a = source.delay, delay = _a === void 0 ? 200 : _a, timeout = source.timeout, // undefined = never times out
      _b = source.suspensible, // undefined = never times out
      suspensible = _b === void 0 ? false : _b, // in Vue 3 default is true
      userOnError = source.onError;
      if (suspensible) {
          warn$2("The suspensible option for async components is not supported in Vue2. It is ignored.");
      }
      var pendingRequest = null;
      var retries = 0;
      var retry = function () {
          retries++;
          pendingRequest = null;
          return load();
      };
      var load = function () {
          var thisRequest;
          return (pendingRequest ||
              (thisRequest = pendingRequest =
                  loader()
                      .catch(function (err) {
                      err = err instanceof Error ? err : new Error(String(err));
                      if (userOnError) {
                          return new Promise(function (resolve, reject) {
                              var userRetry = function () { return resolve(retry()); };
                              var userFail = function () { return reject(err); };
                              userOnError(err, userRetry, userFail, retries + 1);
                          });
                      }
                      else {
                          throw err;
                      }
                  })
                      .then(function (comp) {
                      if (thisRequest !== pendingRequest && pendingRequest) {
                          return pendingRequest;
                      }
                      if (!comp) {
                          warn$2("Async component loader resolved to undefined. " +
                              "If you are using retry(), make sure to return its return value.");
                      }
                      // interop module default
                      if (comp &&
                          (comp.__esModule || comp[Symbol.toStringTag] === 'Module')) {
                          comp = comp.default;
                      }
                      if (comp && !isObject$1(comp) && !isFunction$2(comp)) {
                          throw new Error("Invalid async component load result: ".concat(comp));
                      }
                      return comp;
                  })));
      };
      return function () {
          var component = load();
          return {
              component: component,
              delay: delay,
              timeout: timeout,
              error: errorComponent,
              loading: loadingComponent
          };
      };
  }

  function createLifeCycle(hookName) {
      return function (fn, target) {
          if (target === void 0) { target = currentInstance; }
          if (!target) {
              warn$2("".concat(formatName(hookName), " is called when there is no active component instance to be ") +
                      "associated with. " +
                      "Lifecycle injection APIs can only be used during execution of setup().");
              return;
          }
          return injectHook(target, hookName, fn);
      };
  }
  function formatName(name) {
      if (name === 'beforeDestroy') {
          name = 'beforeUnmount';
      }
      else if (name === 'destroyed') {
          name = 'unmounted';
      }
      return "on".concat(name[0].toUpperCase() + name.slice(1));
  }
  function injectHook(instance, hookName, fn) {
      var options = instance.$options;
      options[hookName] = mergeLifecycleHook(options[hookName], fn);
  }
  var onBeforeMount = createLifeCycle('beforeMount');
  var onMounted = createLifeCycle('mounted');
  var onBeforeUpdate = createLifeCycle('beforeUpdate');
  var onUpdated = createLifeCycle('updated');
  var onBeforeUnmount = createLifeCycle('beforeDestroy');
  var onUnmounted = createLifeCycle('destroyed');
  var onActivated = createLifeCycle('activated');
  var onDeactivated = createLifeCycle('deactivated');
  var onServerPrefetch = createLifeCycle('serverPrefetch');
  var onRenderTracked = createLifeCycle('renderTracked');
  var onRenderTriggered = createLifeCycle('renderTriggered');
  var injectErrorCapturedHook = createLifeCycle('errorCaptured');
  function onErrorCaptured(hook, target) {
      if (target === void 0) { target = currentInstance; }
      injectErrorCapturedHook(hook, target);
  }

  /**
   * Note: also update dist/vue.runtime.mjs when adding new exports to this file.
   */
  var version = '2.7.16';
  /**
   * @internal type is manually declared in <root>/types/v3-define-component.d.ts
   */
  function defineComponent(options) {
      return options;
  }

  var vca = /*#__PURE__*/Object.freeze({
    __proto__: null,
    version: version,
    defineComponent: defineComponent,
    ref: ref$1,
    shallowRef: shallowRef,
    isRef: isRef,
    toRef: toRef,
    toRefs: toRefs,
    unref: unref,
    proxyRefs: proxyRefs,
    customRef: customRef,
    triggerRef: triggerRef,
    reactive: reactive,
    isReactive: isReactive,
    isReadonly: isReadonly,
    isShallow: isShallow,
    isProxy: isProxy,
    shallowReactive: shallowReactive,
    markRaw: markRaw,
    toRaw: toRaw,
    readonly: readonly,
    shallowReadonly: shallowReadonly,
    computed: computed,
    watch: watch,
    watchEffect: watchEffect,
    watchPostEffect: watchPostEffect,
    watchSyncEffect: watchSyncEffect,
    EffectScope: EffectScope,
    effectScope: effectScope,
    onScopeDispose: onScopeDispose,
    getCurrentScope: getCurrentScope,
    provide: provide,
    inject: inject,
    h: h,
    getCurrentInstance: getCurrentInstance,
    useSlots: useSlots,
    useAttrs: useAttrs,
    useListeners: useListeners,
    mergeDefaults: mergeDefaults,
    nextTick: nextTick,
    set: set,
    del: del,
    useCssModule: useCssModule,
    useCssVars: useCssVars,
    defineAsyncComponent: defineAsyncComponent,
    onBeforeMount: onBeforeMount,
    onMounted: onMounted,
    onBeforeUpdate: onBeforeUpdate,
    onUpdated: onUpdated,
    onBeforeUnmount: onBeforeUnmount,
    onUnmounted: onUnmounted,
    onActivated: onActivated,
    onDeactivated: onDeactivated,
    onServerPrefetch: onServerPrefetch,
    onRenderTracked: onRenderTracked,
    onRenderTriggered: onRenderTriggered,
    onErrorCaptured: onErrorCaptured
  });

  var seenObjects = new _Set();
  /**
   * Recursively traverse an object to evoke all converted
   * getters, so that every nested property inside the object
   * is collected as a "deep" dependency.
   */
  function traverse(val) {
      _traverse(val, seenObjects);
      seenObjects.clear();
      return val;
  }
  function _traverse(val, seen) {
      var i, keys;
      var isA = isArray$1(val);
      if ((!isA && !isObject$1(val)) ||
          val.__v_skip /* ReactiveFlags.SKIP */ ||
          Object.isFrozen(val) ||
          val instanceof VNode) {
          return;
      }
      if (val.__ob__) {
          var depId = val.__ob__.dep.id;
          if (seen.has(depId)) {
              return;
          }
          seen.add(depId);
      }
      if (isA) {
          i = val.length;
          while (i--)
              _traverse(val[i], seen);
      }
      else if (isRef(val)) {
          _traverse(val.value, seen);
      }
      else {
          keys = Object.keys(val);
          i = keys.length;
          while (i--)
              _traverse(val[keys[i]], seen);
      }
  }

  var uid$1 = 0;
  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   * @internal
   */
  var Watcher = /** @class */ (function () {
      function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
          recordEffectScope(this, 
          // if the active effect scope is manually created (not a component scope),
          // prioritize it
          activeEffectScope && !activeEffectScope._vm
              ? activeEffectScope
              : vm
                  ? vm._scope
                  : undefined);
          if ((this.vm = vm) && isRenderWatcher) {
              vm._watcher = this;
          }
          // options
          if (options) {
              this.deep = !!options.deep;
              this.user = !!options.user;
              this.lazy = !!options.lazy;
              this.sync = !!options.sync;
              this.before = options.before;
              {
                  this.onTrack = options.onTrack;
                  this.onTrigger = options.onTrigger;
              }
          }
          else {
              this.deep = this.user = this.lazy = this.sync = false;
          }
          this.cb = cb;
          this.id = ++uid$1; // uid for batching
          this.active = true;
          this.post = false;
          this.dirty = this.lazy; // for lazy watchers
          this.deps = [];
          this.newDeps = [];
          this.depIds = new _Set();
          this.newDepIds = new _Set();
          this.expression = expOrFn.toString() ;
          // parse expression for getter
          if (isFunction$2(expOrFn)) {
              this.getter = expOrFn;
          }
          else {
              this.getter = parsePath(expOrFn);
              if (!this.getter) {
                  this.getter = noop$1;
                  warn$2("Failed watching path: \"".concat(expOrFn, "\" ") +
                          'Watcher only accepts simple dot-delimited paths. ' +
                          'For full control, use a function instead.', vm);
              }
          }
          this.value = this.lazy ? undefined : this.get();
      }
      /**
       * Evaluate the getter, and re-collect dependencies.
       */
      Watcher.prototype.get = function () {
          pushTarget(this);
          var value;
          var vm = this.vm;
          try {
              value = this.getter.call(vm, vm);
          }
          catch (e) {
              if (this.user) {
                  handleError(e, vm, "getter for watcher \"".concat(this.expression, "\""));
              }
              else {
                  // Provide component context to handleError before throwing
                  handleError(e, vm, 'render');
                  throw e;
              }
          }
          finally {
              // "touch" every property so they are all tracked as
              // dependencies for deep watching
              if (this.deep) {
                  traverse(value);
              }
              popTarget();
              this.cleanupDeps();
          }
          return value;
      };
      /**
       * Add a dependency to this directive.
       */
      Watcher.prototype.addDep = function (dep) {
          var id = dep.id;
          if (!this.newDepIds.has(id)) {
              this.newDepIds.add(id);
              this.newDeps.push(dep);
              if (!this.depIds.has(id)) {
                  dep.addSub(this);
              }
          }
      };
      /**
       * Clean up for dependency collection.
       */
      Watcher.prototype.cleanupDeps = function () {
          var i = this.deps.length;
          while (i--) {
              var dep = this.deps[i];
              if (!this.newDepIds.has(dep.id)) {
                  dep.removeSub(this);
              }
          }
          var tmp = this.depIds;
          this.depIds = this.newDepIds;
          this.newDepIds = tmp;
          this.newDepIds.clear();
          tmp = this.deps;
          this.deps = this.newDeps;
          this.newDeps = tmp;
          this.newDeps.length = 0;
      };
      /**
       * Subscriber interface.
       * Will be called when a dependency changes.
       */
      Watcher.prototype.update = function () {
          /* istanbul ignore else */
          if (this.lazy) {
              this.dirty = true;
          }
          else if (this.sync) {
              this.run();
          }
          else {
              queueWatcher(this);
          }
      };
      /**
       * Scheduler job interface.
       * Will be called by the scheduler.
       */
      Watcher.prototype.run = function () {
          if (this.active) {
              var value = this.get();
              if (value !== this.value ||
                  // Deep watchers and watchers on Object/Arrays should fire even
                  // when the value is the same, because the value may
                  // have mutated.
                  isObject$1(value) ||
                  this.deep) {
                  // set new value
                  var oldValue = this.value;
                  this.value = value;
                  if (this.user) {
                      var info = "callback for watcher \"".concat(this.expression, "\"");
                      invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info);
                  }
                  else {
                      this.cb.call(this.vm, value, oldValue);
                  }
              }
          }
      };
      /**
       * Evaluate the value of the watcher.
       * This only gets called for lazy watchers.
       */
      Watcher.prototype.evaluate = function () {
          this.value = this.get();
          this.dirty = false;
      };
      /**
       * Depend on all deps collected by this watcher.
       */
      Watcher.prototype.depend = function () {
          var i = this.deps.length;
          while (i--) {
              this.deps[i].depend();
          }
      };
      /**
       * Remove self from all dependencies' subscriber list.
       */
      Watcher.prototype.teardown = function () {
          if (this.vm && !this.vm._isBeingDestroyed) {
              remove$2(this.vm._scope.effects, this);
          }
          if (this.active) {
              var i = this.deps.length;
              while (i--) {
                  this.deps[i].removeSub(this);
              }
              this.active = false;
              if (this.onStop) {
                  this.onStop();
              }
          }
      };
      return Watcher;
  }());

  var sharedPropertyDefinition = {
      enumerable: true,
      configurable: true,
      get: noop$1,
      set: noop$1
  };
  function proxy(target, sourceKey, key) {
      sharedPropertyDefinition.get = function proxyGetter() {
          return this[sourceKey][key];
      };
      sharedPropertyDefinition.set = function proxySetter(val) {
          this[sourceKey][key] = val;
      };
      Object.defineProperty(target, key, sharedPropertyDefinition);
  }
  /**
   * Initialize api option
   * Binds api methods to component instance and exposes as this.api
   */
  function initApi(vm) {
      vm.api = {};
      var apiOpts = vm.$options.api;
      if (apiOpts && typeof apiOpts === 'object') {
          Object.keys(apiOpts).forEach(function (key) {
              if (typeof apiOpts[key] === 'function') {
                  vm.api[key] = apiOpts[key].bind(vm);
              }
          });
      }
  }
  function initState(vm) {
      var opts = vm.$options;
      if (opts.props)
          initProps$1(vm, opts.props);
      // Initialize api namespace EARLY so it's available everywhere (created, mounted, hooks, etc.)
      initApi(vm);
      // Define $loading reaktivly
      defineReactive(vm, '$loading', false);
      // Composition API
      initSetup(vm);
      if (opts.methods)
          initMethods(vm, opts.methods);
      if (opts.data) {
          initData(vm);
      }
      else {
          var ob = observe((vm._data = {}));
          ob && ob.vmCount++;
      }
      if (opts.computed)
          initComputed$1(vm, opts.computed);
      if (opts.watch && opts.watch !== nativeWatch) {
          initWatch$1(vm, opts.watch);
      }
  }
  function initProps$1(vm, propsOptions) {
      var propsData = vm.$options.propsData || {};
      var props = (vm._props = shallowReactive({}));
      // cache prop keys so that future props updates can iterate using Array
      // instead of dynamic object key enumeration.
      var keys = (vm.$options._propKeys = []);
      var isRoot = !vm.$parent;
      // root instance props should be converted
      if (!isRoot) {
          toggleObserving(false);
      }
      var _loop_1 = function (key) {
          keys.push(key);
          var value = validateProp(key, propsOptions, propsData, vm);
          /* istanbul ignore else */
          {
              var hyphenatedKey = hyphenate(key);
              if (isReservedAttribute(hyphenatedKey) ||
                  config.isReservedAttr(hyphenatedKey)) {
                  warn$2("\"".concat(hyphenatedKey, "\" is a reserved attribute and cannot be used as component prop."), vm);
              }
              defineReactive(props, key, value, function () {
                  if (!isRoot && !isUpdatingChildComponent) {
                      warn$2("Avoid mutating a prop directly since the value will be " +
                          "overwritten whenever the parent component re-renders. " +
                          "Instead, use a data or computed property based on the prop's " +
                          "value. Prop being mutated: \"".concat(key, "\""), vm);
                  }
              }, true /* shallow */);
          }
          // static props are already proxied on the component's prototype
          // during Vue.extend(). We only need to proxy props defined at
          // instantiation here.
          if (!(key in vm)) {
              proxy(vm, "_props", key);
          }
      };
      for (var key in propsOptions) {
          _loop_1(key);
      }
      toggleObserving(true);
  }
  function initData(vm) {
      var data = vm.$options.data;
      data = vm._data = isFunction$2(data) ? getData(data, vm) : data || {};
      if (!isPlainObject$1(data)) {
          data = {};
          warn$2('data functions should return an object:\n' +
                  'https://v2.vuejs.org/v2/guide/components.html#data-Must-Be-a-Function', vm);
      }
      // proxy data on instance
      var keys = Object.keys(data);
      var props = vm.$options.props;
      var methods = vm.$options.methods;
      var i = keys.length;
      while (i--) {
          var key = keys[i];
          {
              if (methods && hasOwn(methods, key)) {
                  warn$2("Method \"".concat(key, "\" has already been defined as a data property."), vm);
              }
          }
          if (props && hasOwn(props, key)) {
              warn$2("The data property \"".concat(key, "\" is already declared as a prop. ") +
                      "Use prop default value instead.", vm);
          }
          else if (!isReserved(key)) {
              proxy(vm, "_data", key);
          }
      }
      // observe data
      var ob = observe(data);
      ob && ob.vmCount++;
  }
  function getData(data, vm) {
      // #7573 disable dep collection when invoking data getters
      pushTarget();
      try {
          return data.call(vm, vm);
      }
      catch (e) {
          handleError(e, vm, "data()");
          return {};
      }
      finally {
          popTarget();
      }
  }
  var computedWatcherOptions = { lazy: true };
  function initComputed$1(vm, computed) {
      // $flow-disable-line
      var watchers = (vm._computedWatchers = Object.create(null));
      // computed properties are just getters during SSR
      var isSSR = isServerRendering();
      for (var key in computed) {
          var userDef = computed[key];
          var getter = isFunction$2(userDef) ? userDef : userDef.get;
          if (getter == null) {
              warn$2("Getter is missing for computed property \"".concat(key, "\"."), vm);
          }
          if (!isSSR) {
              // create internal watcher for the computed property.
              watchers[key] = new Watcher(vm, getter || noop$1, noop$1, computedWatcherOptions);
          }
          // component-defined computed properties are already defined on the
          // component prototype. We only need to define computed properties defined
          // at instantiation here.
          if (!(key in vm)) {
              defineComputed(vm, key, userDef);
          }
          else {
              if (key in vm.$data) {
                  warn$2("The computed property \"".concat(key, "\" is already defined in data."), vm);
              }
              else if (vm.$options.props && key in vm.$options.props) {
                  warn$2("The computed property \"".concat(key, "\" is already defined as a prop."), vm);
              }
              else if (vm.$options.methods && key in vm.$options.methods) {
                  warn$2("The computed property \"".concat(key, "\" is already defined as a method."), vm);
              }
          }
      }
  }
  function defineComputed(target, key, userDef) {
      var shouldCache = !isServerRendering();
      if (isFunction$2(userDef)) {
          sharedPropertyDefinition.get = shouldCache
              ? createComputedGetter(key)
              : createGetterInvoker(userDef);
          sharedPropertyDefinition.set = noop$1;
      }
      else {
          sharedPropertyDefinition.get = userDef.get
              ? shouldCache && userDef.cache !== false
                  ? createComputedGetter(key)
                  : createGetterInvoker(userDef.get)
              : noop$1;
          sharedPropertyDefinition.set = userDef.set || noop$1;
      }
      if (sharedPropertyDefinition.set === noop$1) {
          sharedPropertyDefinition.set = function () {
              warn$2("Computed property \"".concat(key, "\" was assigned to but it has no setter."), this);
          };
      }
      Object.defineProperty(target, key, sharedPropertyDefinition);
  }
  function createComputedGetter(key) {
      return function computedGetter() {
          var watcher = this._computedWatchers && this._computedWatchers[key];
          if (watcher) {
              if (watcher.dirty) {
                  watcher.evaluate();
              }
              if (Dep.target) {
                  if (Dep.target.onTrack) {
                      Dep.target.onTrack({
                          effect: Dep.target,
                          target: this,
                          type: "get" /* TrackOpTypes.GET */,
                          key: key
                      });
                  }
                  watcher.depend();
              }
              return watcher.value;
          }
      };
  }
  function createGetterInvoker(fn) {
      return function computedGetter() {
          return fn.call(this, this);
      };
  }
  function initMethods(vm, methods) {
      var props = vm.$options.props;
      for (var key in methods) {
          {
              if (typeof methods[key] !== 'function') {
                  warn$2("Method \"".concat(key, "\" has type \"").concat(typeof methods[key], "\" in the component definition. ") +
                      "Did you reference the function correctly?", vm);
              }
              if (props && hasOwn(props, key)) {
                  warn$2("Method \"".concat(key, "\" has already been defined as a prop."), vm);
              }
              if (key in vm && isReserved(key)) {
                  warn$2("Method \"".concat(key, "\" conflicts with an existing Vue instance method. ") +
                      "Avoid defining component methods that start with _ or $.");
              }
          }
          vm[key] = typeof methods[key] !== 'function' ? noop$1 : bind$2(methods[key], vm);
      }
  }
  function initWatch$1(vm, watch) {
      for (var key in watch) {
          var handler = watch[key];
          if (isArray$1(handler)) {
              for (var i = 0; i < handler.length; i++) {
                  createWatcher(vm, key, handler[i]);
              }
          }
          else {
              createWatcher(vm, key, handler);
          }
      }
  }
  function createWatcher(vm, expOrFn, handler, options) {
      if (isPlainObject$1(handler)) {
          options = handler;
          handler = handler.handler;
      }
      if (typeof handler === 'string') {
          handler = vm[handler];
      }
      return vm.$watch(expOrFn, handler, options);
  }
  function stateMixin(Vue) {
      // flow somehow has problems with directly declared definition object
      // when using Object.defineProperty, so we have to procedurally build up
      // the object here.
      var dataDef = {};
      dataDef.get = function () {
          return this._data;
      };
      var propsDef = {};
      propsDef.get = function () {
          return this._props;
      };
      {
          dataDef.set = function () {
              warn$2('Avoid replacing instance root $data. ' +
                  'Use nested data properties instead.', this);
          };
          propsDef.set = function () {
              warn$2("$props is readonly.", this);
          };
      }
      Object.defineProperty(Vue.prototype, '$data', dataDef);
      Object.defineProperty(Vue.prototype, '$props', propsDef);
      Vue.prototype.$set = set;
      Vue.prototype.$delete = del;
      Vue.prototype.$watch = function (expOrFn, cb, options) {
          var vm = this;
          if (isPlainObject$1(cb)) {
              return createWatcher(vm, expOrFn, cb, options);
          }
          options = options || {};
          options.user = true;
          var watcher = new Watcher(vm, expOrFn, cb, options);
          if (options.immediate) {
              var info = "callback for immediate watcher \"".concat(watcher.expression, "\"");
              pushTarget();
              invokeWithErrorHandling(cb, vm, [watcher.value], vm, info);
              popTarget();
          }
          return function unwatchFn() {
              watcher.teardown();
          };
      };
  }

  function initProvide(vm) {
      var provideOption = vm.$options.provide;
      if (provideOption) {
          var provided = isFunction$2(provideOption)
              ? provideOption.call(vm)
              : provideOption;
          if (!isObject$1(provided)) {
              return;
          }
          var source = resolveProvided(vm);
          // IE9 doesn't support Object.getOwnPropertyDescriptors so we have to
          // iterate the keys ourselves.
          var keys = hasSymbol ? Reflect.ownKeys(provided) : Object.keys(provided);
          for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              Object.defineProperty(source, key, Object.getOwnPropertyDescriptor(provided, key));
          }
      }
  }
  function initInjections(vm) {
      var result = resolveInject(vm.$options.inject, vm);
      if (result) {
          toggleObserving(false);
          Object.keys(result).forEach(function (key) {
              /* istanbul ignore else */
              {
                  defineReactive(vm, key, result[key], function () {
                      warn$2("Avoid mutating an injected value directly since the changes will be " +
                          "overwritten whenever the provided component re-renders. " +
                          "injection being mutated: \"".concat(key, "\""), vm);
                  });
              }
          });
          toggleObserving(true);
      }
  }
  function resolveInject(inject, vm) {
      if (inject) {
          // inject is :any because flow is not smart enough to figure out cached
          var result = Object.create(null);
          var keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject);
          for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              // #6574 in case the inject object is observed...
              if (key === '__ob__')
                  continue;
              var provideKey = inject[key].from;
              if (provideKey in vm._provided) {
                  result[key] = vm._provided[provideKey];
              }
              else if ('default' in inject[key]) {
                  var provideDefault = inject[key].default;
                  result[key] = isFunction$2(provideDefault)
                      ? provideDefault.call(vm)
                      : provideDefault;
              }
              else {
                  warn$2("Injection \"".concat(key, "\" not found"), vm);
              }
          }
          return result;
      }
  }

  var Store = /** @class */ (function () {
      function Store(options) {
          this._getters = {};
          this._mutations = {};
          this._actions = {};
          this._modules = {};
          this._subscribers = [];
          // Create reactive state
          this._state = {};
          this._initState(options.state || {});
          // Register getters
          if (options.getters) {
              this._initGetters(options.getters);
          }
          // Register mutations
          if (options.mutations) {
              this._initMutations(options.mutations);
          }
          // Register actions
          if (options.actions) {
              this._initActions(options.actions);
          }
          // Register modules
          if (options.modules) {
              this._initModules(options.modules);
          }
          // Bind commit and dispatch to instance for destructuring
          this.commit = this.commit.bind(this);
          this.dispatch = this.dispatch.bind(this);
      }
      Object.defineProperty(Store.prototype, "state", {
          /**
           * Get reactive state
           */
          get: function () {
              return this._state;
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(Store.prototype, "stateSnapshot", {
          /**
           * Get state (shallow copy for devtools)
           */
          get: function () {
              return __assign({}, this._state);
          },
          enumerable: false,
          configurable: true
      });
      Object.defineProperty(Store.prototype, "getters", {
          /**
           * Getters proxy
           */
          get: function () {
              var _this = this;
              var gettersProxy = {};
              Object.keys(this._getters).forEach(function (key) {
                  Object.defineProperty(gettersProxy, key, {
                      get: function () { return _this._getters[key](_this._state, gettersProxy); }
                  });
              });
              return gettersProxy;
          },
          enumerable: false,
          configurable: true
      });
      /**
       * Initialize reactive state
       */
      Store.prototype._initState = function (state) {
          var _this = this;
          Object.keys(state).forEach(function (key) {
              defineReactive(_this._state, key, state[key]);
          });
          // Make entire state object reactive
          observe(this._state);
      };
      /**
       * Initialize getters
       */
      Store.prototype._initGetters = function (getters) {
          var _this = this;
          Object.keys(getters).forEach(function (key) {
              _this._getters[key] = getters[key];
          });
      };
      /**
       * Initialize mutations
       */
      Store.prototype._initMutations = function (mutations) {
          var _this = this;
          Object.keys(mutations).forEach(function (key) {
              _this._mutations[key] = mutations[key];
          });
      };
      /**
       * Initialize actions
       */
      Store.prototype._initActions = function (actions) {
          var _this = this;
          Object.keys(actions).forEach(function (key) {
              _this._actions[key] = actions[key];
          });
      };
      /**
       * Initialize modules
       */
      Store.prototype._initModules = function (modules) {
          var _this = this;
          Object.keys(modules).forEach(function (moduleName) {
              var moduleOptions = modules[moduleName];
              _this._modules[moduleName] = new Store(moduleOptions);
              // Register module state under module name
              if (!_this._state[moduleName]) {
                  defineReactive(_this._state, moduleName, _this._modules[moduleName].state);
              }
          });
      };
      /**
       * Commit a mutation
       * @param type - Mutation type (can be 'module/mutation' for modules)
       * @param payload - Payload for mutation
       */
      Store.prototype.commit = function (type, payload) {
          // Check if it's a module mutation
          if (type.includes('/')) {
              var _a = type.split('/'), moduleName = _a[0], mutationName = _a[1];
              if (this._modules[moduleName]) {
                  this._modules[moduleName].commit(mutationName, payload);
                  return;
              }
          }
          var mutation = this._mutations[type];
          if (!mutation) {
              warn$2("[Store] Unknown mutation: ".concat(type));
              return;
          }
          mutation(this._state, payload);
          this._notifySubscribers({ type: type, payload: payload }, this._state);
      };
      /**
       * Dispatch an action
       * @param type - Action type (can be 'module/action' for modules)
       * @param payload - Payload for action
       */
      Store.prototype.dispatch = function (type, payload) {
          // Check if it's a module action
          if (type.includes('/')) {
              var _a = type.split('/'), moduleName = _a[0], actionName = _a[1];
              if (this._modules[moduleName]) {
                  return this._modules[moduleName].dispatch(actionName, payload);
              }
          }
          var action = this._actions[type];
          if (!action) {
              warn$2("[Store] Unknown action: ".concat(type));
              return Promise.reject(new Error("Unknown action: ".concat(type)));
          }
          return Promise.resolve(action(this, payload));
      };
      /**
       * Get state value
       * @param path - Dot notation path (e.g., 'user.profile.name')
       */
      Store.prototype.getState = function (path) {
          var parts = path.split('.');
          var value = this._state;
          for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
              var part = parts_1[_i];
              if (value === undefined || value === null) {
                  return undefined;
              }
              value = value[part];
          }
          return value;
      };
      /**
       * Set state value
       * @param path - Dot notation path
       * @param value - New value
       */
      Store.prototype.setState = function (path, value) {
          var parts = path.split('.');
          var lastPart = parts.pop();
          var target = this._state;
          for (var _i = 0, parts_2 = parts; _i < parts_2.length; _i++) {
              var part = parts_2[_i];
              if (!target[part]) {
                  target[part] = {};
              }
              target = target[part];
          }
          target[lastPart] = value;
      };
      /**
       * Subscribe to mutations
       */
      Store.prototype.subscribe = function (fn) {
          var _this = this;
          this._subscribers.push(fn);
          return function () {
              var index = _this._subscribers.indexOf(fn);
              if (index > -1) {
                  _this._subscribers.splice(index, 1);
              }
          };
      };
      /**
       * Notify subscribers
       */
      Store.prototype._notifySubscribers = function (mutation, state) {
          this._subscribers.forEach(function (fn) { return fn(mutation, state); });
      };
      /**
       * Reset store to initial state
       */
      Store.prototype.reset = function () {
          if (config.store) {
              var options = config.store;
              this._initState(options.state || {});
              if (options.getters)
                  this._initGetters(options.getters);
              if (options.mutations)
                  this._initMutations(options.mutations);
              if (options.actions)
                  this._initActions(options.actions);
          }
      };
      return Store;
  }());
  /**
   * Create a store instance
   */
  function createStore(options) {
      return new Store(options);
  }
  /**
   * Helper: map state to computed properties
   * Usage: computed: { ...mapState(['count', 'user']) }
   */
  function mapState(paths) {
      var computed = {};
      if (Array.isArray(paths)) {
          paths.forEach(function (path) {
              computed[path] = function () {
                  var store = this.$store;
                  if (!store) {
                      warn$2('[mapState] $store not found');
                      return undefined;
                  }
                  return store.getState(path);
              };
          });
      }
      else {
          Object.keys(paths).forEach(function (key) {
              computed[key] = function () {
                  var store = this.$store;
                  if (!store) {
                      warn$2('[mapState] $store not found');
                      return undefined;
                  }
                  return store.getState(paths[key]);
              };
          });
      }
      return computed;
  }
  /**
   * Helper: map getters to computed properties
   * Usage: computed: { ...mapGetters(['isLoggedIn', 'currentUser']) }
   */
  function mapGetters(getterNames) {
      var computed = {};
      getterNames.forEach(function (name) {
          computed[name] = function () {
              var store = this.$store;
              if (!store) {
                  warn$2('[mapGetters] $store not found');
                  return undefined;
              }
              return store.getters[name];
          };
      });
      return computed;
  }
  /**
   * Helper: map mutations to methods
   * Usage: methods: { ...mapMutations(['increment', 'decrement']) }
   */
  function mapMutations(mutations) {
      var methods = {};
      if (Array.isArray(mutations)) {
          mutations.forEach(function (name) {
              methods[name] = function (payload) {
                  var store = this.$store;
                  if (store) {
                      store.commit(name, payload);
                  }
              };
          });
      }
      else {
          Object.keys(mutations).forEach(function (key) {
              methods[key] = function (payload) {
                  var store = this.$store;
                  if (store) {
                      store.commit(mutations[key], payload);
                  }
              };
          });
      }
      return methods;
  }
  /**
   * Helper: map actions to methods
   * Usage: methods: { ...mapActions(['fetchUser', 'updateProfile']) }
   */
  function mapActions(actions) {
      var methods = {};
      if (Array.isArray(actions)) {
          actions.forEach(function (name) {
              methods[name] = function (payload) {
                  var store = this.$store;
                  if (store) {
                      return store.dispatch(name, payload);
                  }
                  return Promise.reject(new Error('$store not found'));
              };
          });
      }
      else {
          Object.keys(actions).forEach(function (key) {
              methods[key] = function (payload) {
                  var store = this.$store;
                  if (store) {
                      return store.dispatch(actions[key], payload);
                  }
                  return Promise.reject(new Error('$store not found'));
              };
          });
      }
      return methods;
  }

  /**
   * Create a bound version of a function with a specified `this` context
   *
   * @param {Function} fn - The function to bind
   * @param {*} thisArg - The value to be passed as the `this` parameter
   * @returns {Function} A new function that will call the original function with the specified `this` context
   */
  function bind$1(fn, thisArg) {
    return function wrap() {
      return fn.apply(thisArg, arguments);
    };
  }

  // utils is a library of generic helper functions non-specific to axios

  const { toString } = Object.prototype;
  const { getPrototypeOf } = Object;
  const { iterator, toStringTag } = Symbol;

  const kindOf = ((cache) => (thing) => {
    const str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  })(Object.create(null));

  const kindOfTest = (type) => {
    type = type.toLowerCase();
    return (thing) => kindOf(thing) === type;
  };

  const typeOfTest = (type) => (thing) => typeof thing === type;

  /**
   * Determine if a value is a non-null object
   *
   * @param {Object} val The value to test
   *
   * @returns {boolean} True if value is an Array, otherwise false
   */
  const { isArray } = Array;

  /**
   * Determine if a value is undefined
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  const isUndefined = typeOfTest('undefined');

  /**
   * Determine if a value is a Buffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return (
      val !== null &&
      !isUndefined(val) &&
      val.constructor !== null &&
      !isUndefined(val.constructor) &&
      isFunction$1(val.constructor.isBuffer) &&
      val.constructor.isBuffer(val)
    );
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  const isArrayBuffer = kindOfTest('ArrayBuffer');

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    let result;
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
      result = ArrayBuffer.isView(val);
    } else {
      result = val && val.buffer && isArrayBuffer(val.buffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a String, otherwise false
   */
  const isString = typeOfTest('string');

  /**
   * Determine if a value is a Function
   *
   * @param {*} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  const isFunction$1 = typeOfTest('function');

  /**
   * Determine if a value is a Number
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Number, otherwise false
   */
  const isNumber = typeOfTest('number');

  /**
   * Determine if a value is an Object
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an Object, otherwise false
   */
  const isObject = (thing) => thing !== null && typeof thing === 'object';

  /**
   * Determine if a value is a Boolean
   *
   * @param {*} thing The value to test
   * @returns {boolean} True if value is a Boolean, otherwise false
   */
  const isBoolean$1 = (thing) => thing === true || thing === false;

  /**
   * Determine if a value is a plain Object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a plain Object, otherwise false
   */
  const isPlainObject = (val) => {
    if (kindOf(val) !== 'object') {
      return false;
    }

    const prototype = getPrototypeOf(val);
    return (
      (prototype === null ||
        prototype === Object.prototype ||
        Object.getPrototypeOf(prototype) === null) &&
      !(toStringTag in val) &&
      !(iterator in val)
    );
  };

  /**
   * Determine if a value is an empty object (safely handles Buffers)
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is an empty object, otherwise false
   */
  const isEmptyObject = (val) => {
    // Early return for non-objects or Buffers to prevent RangeError
    if (!isObject(val) || isBuffer(val)) {
      return false;
    }

    try {
      return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
    } catch (e) {
      // Fallback for any other objects that might cause RangeError with Object.keys()
      return false;
    }
  };

  /**
   * Determine if a value is a Date
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Date, otherwise false
   */
  const isDate = kindOfTest('Date');

  /**
   * Determine if a value is a File
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  const isFile = kindOfTest('File');

  /**
   * Determine if a value is a React Native Blob
   * React Native "blob": an object with a `uri` attribute. Optionally, it can
   * also have a `name` and `type` attribute to specify filename and content type
   *
   * @see https://github.com/facebook/react-native/blob/26684cf3adf4094eb6c405d345a75bf8c7c0bf88/Libraries/Network/FormData.js#L68-L71
   * 
   * @param {*} value The value to test
   * 
   * @returns {boolean} True if value is a React Native Blob, otherwise false
   */
  const isReactNativeBlob = (value) => {
    return !!(value && typeof value.uri !== 'undefined');
  };

  /**
   * Determine if environment is React Native
   * ReactNative `FormData` has a non-standard `getParts()` method
   * 
   * @param {*} formData The formData to test
   * 
   * @returns {boolean} True if environment is React Native, otherwise false
   */
  const isReactNative = (formData) => formData && typeof formData.getParts !== 'undefined';

  /**
   * Determine if a value is a Blob
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  const isBlob = kindOfTest('Blob');

  /**
   * Determine if a value is a FileList
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a File, otherwise false
   */
  const isFileList = kindOfTest('FileList');

  /**
   * Determine if a value is a Stream
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  const isStream = (val) => isObject(val) && isFunction$1(val.pipe);

  /**
   * Determine if a value is a FormData
   *
   * @param {*} thing The value to test
   *
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function getGlobal() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof self !== 'undefined') return self;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
  }

  const G = getGlobal();
  const FormDataCtor = typeof G.FormData !== 'undefined' ? G.FormData : undefined;

  const isFormData = (thing) => {
    let kind;
    return thing && (
      (FormDataCtor && thing instanceof FormDataCtor) || (
        isFunction$1(thing.append) && (
          (kind = kindOf(thing)) === 'formdata' ||
          // detect form-data instance
          (kind === 'object' && isFunction$1(thing.toString) && thing.toString() === '[object FormData]')
        )
      )
    );
  };

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  const isURLSearchParams = kindOfTest('URLSearchParams');

  const [isReadableStream, isRequest, isResponse, isHeaders] = [
    'ReadableStream',
    'Request',
    'Response',
    'Headers',
  ].map(kindOfTest);

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   *
   * @returns {String} The String freed of excess whitespace
   */
  const trim = (str) => {
    return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array<unknown>} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   *
   * @param {Object} [options]
   * @param {Boolean} [options.allOwnKeys = false]
   * @returns {any}
   */
  function forEach(obj, fn, { allOwnKeys = false } = {}) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    let i;
    let l;

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Buffer check
      if (isBuffer(obj)) {
        return;
      }

      // Iterate over object keys
      const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
      const len = keys.length;
      let key;

      for (i = 0; i < len; i++) {
        key = keys[i];
        fn.call(null, obj[key], key, obj);
      }
    }
  }

  /**
   * Finds a key in an object, case-insensitive, returning the actual key name.
   * Returns null if the object is a Buffer or if no match is found.
   *
   * @param {Object} obj - The object to search.
   * @param {string} key - The key to find (case-insensitive).
   * @returns {?string} The actual key name if found, otherwise null.
   */
  function findKey(obj, key) {
    if (isBuffer(obj)) {
      return null;
    }

    key = key.toLowerCase();
    const keys = Object.keys(obj);
    let i = keys.length;
    let _key;
    while (i-- > 0) {
      _key = keys[i];
      if (key === _key.toLowerCase()) {
        return _key;
      }
    }
    return null;
  }

  const _global = (() => {
    /*eslint no-undef:0*/
    if (typeof globalThis !== 'undefined') return globalThis;
    return typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;
  })();

  const isContextDefined = (context) => !isUndefined(context) && context !== _global;

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * const result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   *
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    const { caseless, skipUndefined } = (isContextDefined(this) && this) || {};
    const result = {};
    const assignValue = (val, key) => {
      // Skip dangerous property names to prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }

      const targetKey = (caseless && findKey(result, key)) || key;
      if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
        result[targetKey] = merge(result[targetKey], val);
      } else if (isPlainObject(val)) {
        result[targetKey] = merge({}, val);
      } else if (isArray(val)) {
        result[targetKey] = val.slice();
      } else if (!skipUndefined || !isUndefined(val)) {
        result[targetKey] = val;
      }
    };

    for (let i = 0, l = arguments.length; i < l; i++) {
      arguments[i] && forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   *
   * @param {Object} [options]
   * @param {Boolean} [options.allOwnKeys]
   * @returns {Object} The resulting value of object a
   */
  const extend = (a, b, thisArg, { allOwnKeys } = {}) => {
    forEach(
      b,
      (val, key) => {
        if (thisArg && isFunction$1(val)) {
          Object.defineProperty(a, key, {
            value: bind$1(val, thisArg),
            writable: true,
            enumerable: true,
            configurable: true,
          });
        } else {
          Object.defineProperty(a, key, {
            value: val,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      },
      { allOwnKeys }
    );
    return a;
  };

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   *
   * @returns {string} content value without BOM
   */
  const stripBOM = (content) => {
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }
    return content;
  };

  /**
   * Inherit the prototype methods from one constructor into another
   * @param {function} constructor
   * @param {function} superConstructor
   * @param {object} [props]
   * @param {object} [descriptors]
   *
   * @returns {void}
   */
  const inherits = (constructor, superConstructor, props, descriptors) => {
    constructor.prototype = Object.create(superConstructor.prototype, descriptors);
    Object.defineProperty(constructor.prototype, 'constructor', {
      value: constructor,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(constructor, 'super', {
      value: superConstructor.prototype,
    });
    props && Object.assign(constructor.prototype, props);
  };

  /**
   * Resolve object with deep prototype chain to a flat object
   * @param {Object} sourceObj source object
   * @param {Object} [destObj]
   * @param {Function|Boolean} [filter]
   * @param {Function} [propFilter]
   *
   * @returns {Object}
   */
  const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
    let props;
    let i;
    let prop;
    const merged = {};

    destObj = destObj || {};
    // eslint-disable-next-line no-eq-null,eqeqeq
    if (sourceObj == null) return destObj;

    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props.length;
      while (i-- > 0) {
        prop = props[i];
        if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
          destObj[prop] = sourceObj[prop];
          merged[prop] = true;
        }
      }
      sourceObj = filter !== false && getPrototypeOf(sourceObj);
    } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

    return destObj;
  };

  /**
   * Determines whether a string ends with the characters of a specified string
   *
   * @param {String} str
   * @param {String} searchString
   * @param {Number} [position= 0]
   *
   * @returns {boolean}
   */
  const endsWith = (str, searchString, position) => {
    str = String(str);
    if (position === undefined || position > str.length) {
      position = str.length;
    }
    position -= searchString.length;
    const lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };

  /**
   * Returns new array from array like object or null if failed
   *
   * @param {*} [thing]
   *
   * @returns {?Array}
   */
  const toArray = (thing) => {
    if (!thing) return null;
    if (isArray(thing)) return thing;
    let i = thing.length;
    if (!isNumber(i)) return null;
    const arr = new Array(i);
    while (i-- > 0) {
      arr[i] = thing[i];
    }
    return arr;
  };

  /**
   * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
   * thing passed in is an instance of Uint8Array
   *
   * @param {TypedArray}
   *
   * @returns {Array}
   */
  // eslint-disable-next-line func-names
  const isTypedArray = ((TypedArray) => {
    // eslint-disable-next-line func-names
    return (thing) => {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

  /**
   * For each entry in the object, call the function with the key and value.
   *
   * @param {Object<any, any>} obj - The object to iterate over.
   * @param {Function} fn - The function to call for each entry.
   *
   * @returns {void}
   */
  const forEachEntry = (obj, fn) => {
    const generator = obj && obj[iterator];

    const _iterator = generator.call(obj);

    let result;

    while ((result = _iterator.next()) && !result.done) {
      const pair = result.value;
      fn.call(obj, pair[0], pair[1]);
    }
  };

  /**
   * It takes a regular expression and a string, and returns an array of all the matches
   *
   * @param {string} regExp - The regular expression to match against.
   * @param {string} str - The string to search.
   *
   * @returns {Array<boolean>}
   */
  const matchAll = (regExp, str) => {
    let matches;
    const arr = [];

    while ((matches = regExp.exec(str)) !== null) {
      arr.push(matches);
    }

    return arr;
  };

  /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
  const isHTMLForm = kindOfTest('HTMLFormElement');

  const toCamelCase = (str) => {
    return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    });
  };

  /* Creating a function that will check if an object has a property. */
  const hasOwnProperty = (
    ({ hasOwnProperty }) =>
    (obj, prop) =>
      hasOwnProperty.call(obj, prop)
  )(Object.prototype);

  /**
   * Determine if a value is a RegExp object
   *
   * @param {*} val The value to test
   *
   * @returns {boolean} True if value is a RegExp object, otherwise false
   */
  const isRegExp = kindOfTest('RegExp');

  const reduceDescriptors = (obj, reducer) => {
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    const reducedDescriptors = {};

    forEach(descriptors, (descriptor, name) => {
      let ret;
      if ((ret = reducer(descriptor, name, obj)) !== false) {
        reducedDescriptors[name] = ret || descriptor;
      }
    });

    Object.defineProperties(obj, reducedDescriptors);
  };

  /**
   * Makes all methods read-only
   * @param {Object} obj
   */

  const freezeMethods = (obj) => {
    reduceDescriptors(obj, (descriptor, name) => {
      // skip restricted props in strict mode
      if (isFunction$1(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
        return false;
      }

      const value = obj[name];

      if (!isFunction$1(value)) return;

      descriptor.enumerable = false;

      if ('writable' in descriptor) {
        descriptor.writable = false;
        return;
      }

      if (!descriptor.set) {
        descriptor.set = () => {
          throw Error("Can not rewrite read-only method '" + name + "'");
        };
      }
    });
  };

  /**
   * Converts an array or a delimited string into an object set with values as keys and true as values.
   * Useful for fast membership checks.
   *
   * @param {Array|string} arrayOrString - The array or string to convert.
   * @param {string} delimiter - The delimiter to use if input is a string.
   * @returns {Object} An object with keys from the array or string, values set to true.
   */
  const toObjectSet = (arrayOrString, delimiter) => {
    const obj = {};

    const define = (arr) => {
      arr.forEach((value) => {
        obj[value] = true;
      });
    };

    isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

    return obj;
  };

  const noop = () => {};

  const toFiniteNumber = (value, defaultValue) => {
    return value != null && Number.isFinite((value = +value)) ? value : defaultValue;
  };

  /**
   * If the thing is a FormData object, return true, otherwise return false.
   *
   * @param {unknown} thing - The thing to check.
   *
   * @returns {boolean}
   */
  function isSpecCompliantForm(thing) {
    return !!(
      thing &&
      isFunction$1(thing.append) &&
      thing[toStringTag] === 'FormData' &&
      thing[iterator]
    );
  }

  /**
   * Recursively converts an object to a JSON-compatible object, handling circular references and Buffers.
   *
   * @param {Object} obj - The object to convert.
   * @returns {Object} The JSON-compatible object.
   */
  const toJSONObject = (obj) => {
    const stack = new Array(10);

    const visit = (source, i) => {
      if (isObject(source)) {
        if (stack.indexOf(source) >= 0) {
          return;
        }

        //Buffer check
        if (isBuffer(source)) {
          return source;
        }

        if (!('toJSON' in source)) {
          stack[i] = source;
          const target = isArray(source) ? [] : {};

          forEach(source, (value, key) => {
            const reducedValue = visit(value, i + 1);
            !isUndefined(reducedValue) && (target[key] = reducedValue);
          });

          stack[i] = undefined;

          return target;
        }
      }

      return source;
    };

    return visit(obj, 0);
  };

  /**
   * Determines if a value is an async function.
   *
   * @param {*} thing - The value to test.
   * @returns {boolean} True if value is an async function, otherwise false.
   */
  const isAsyncFn = kindOfTest('AsyncFunction');

  /**
   * Determines if a value is thenable (has then and catch methods).
   *
   * @param {*} thing - The value to test.
   * @returns {boolean} True if value is thenable, otherwise false.
   */
  const isThenable = (thing) =>
    thing &&
    (isObject(thing) || isFunction$1(thing)) &&
    isFunction$1(thing.then) &&
    isFunction$1(thing.catch);

  // original code
  // https://github.com/DigitalBrainJS/AxiosPromise/blob/16deab13710ec09779922131f3fa5954320f83ab/lib/utils.js#L11-L34

  /**
   * Provides a cross-platform setImmediate implementation.
   * Uses native setImmediate if available, otherwise falls back to postMessage or setTimeout.
   *
   * @param {boolean} setImmediateSupported - Whether setImmediate is supported.
   * @param {boolean} postMessageSupported - Whether postMessage is supported.
   * @returns {Function} A function to schedule a callback asynchronously.
   */
  const _setImmediate = ((setImmediateSupported, postMessageSupported) => {
    if (setImmediateSupported) {
      return setImmediate;
    }

    return postMessageSupported
      ? ((token, callbacks) => {
          _global.addEventListener(
            'message',
            ({ source, data }) => {
              if (source === _global && data === token) {
                callbacks.length && callbacks.shift()();
              }
            },
            false
          );

          return (cb) => {
            callbacks.push(cb);
            _global.postMessage(token, '*');
          };
        })(`axios@${Math.random()}`, [])
      : (cb) => setTimeout(cb);
  })(typeof setImmediate === 'function', isFunction$1(_global.postMessage));

  /**
   * Schedules a microtask or asynchronous callback as soon as possible.
   * Uses queueMicrotask if available, otherwise falls back to process.nextTick or _setImmediate.
   *
   * @type {Function}
   */
  const asap =
    typeof queueMicrotask !== 'undefined'
      ? queueMicrotask.bind(_global)
      : (typeof process !== 'undefined' && process.nextTick) || _setImmediate;

  // *********************

  const isIterable = (thing) => thing != null && isFunction$1(thing[iterator]);

  var utils$1 = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isBoolean: isBoolean$1,
    isObject,
    isPlainObject,
    isEmptyObject,
    isReadableStream,
    isRequest,
    isResponse,
    isHeaders,
    isUndefined,
    isDate,
    isFile,
    isReactNativeBlob,
    isReactNative,
    isBlob,
    isRegExp,
    isFunction: isFunction$1,
    isStream,
    isURLSearchParams,
    isTypedArray,
    isFileList,
    forEach,
    merge,
    extend,
    trim,
    stripBOM,
    inherits,
    toFlatObject,
    kindOf,
    kindOfTest,
    endsWith,
    toArray,
    forEachEntry,
    matchAll,
    isHTMLForm,
    hasOwnProperty,
    hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
    reduceDescriptors,
    freezeMethods,
    toObjectSet,
    toCamelCase,
    noop,
    toFiniteNumber,
    findKey,
    global: _global,
    isContextDefined,
    isSpecCompliantForm,
    toJSONObject,
    isAsyncFn,
    isThenable,
    setImmediate: _setImmediate,
    asap,
    isIterable,
  };

  class AxiosError extends Error {
    static from(error, code, config, request, response, customProps) {
      const axiosError = new AxiosError(error.message, code || error.code, config, request, response);
      axiosError.cause = error;
      axiosError.name = error.name;

      // Preserve status from the original error if not already set from response
      if (error.status != null && axiosError.status == null) {
        axiosError.status = error.status;
      }

      customProps && Object.assign(axiosError, customProps);
      return axiosError;
    }

      /**
       * Create an Error with the specified message, config, error code, request and response.
       *
       * @param {string} message The error message.
       * @param {string} [code] The error code (for example, 'ECONNABORTED').
       * @param {Object} [config] The config.
       * @param {Object} [request] The request.
       * @param {Object} [response] The response.
       *
       * @returns {Error} The created error.
       */
      constructor(message, code, config, request, response) {
        super(message);
        
        // Make message enumerable to maintain backward compatibility
        // The native Error constructor sets message as non-enumerable,
        // but axios < v1.13.3 had it as enumerable
        Object.defineProperty(this, 'message', {
            value: message,
            enumerable: true,
            writable: true,
            configurable: true
        });
        
        this.name = 'AxiosError';
        this.isAxiosError = true;
        code && (this.code = code);
        config && (this.config = config);
        request && (this.request = request);
        if (response) {
            this.response = response;
            this.status = response.status;
        }
      }

    toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: utils$1.toJSONObject(this.config),
        code: this.code,
        status: this.status,
      };
    }
  }

  // This can be changed to static properties as soon as the parser options in .eslint.cjs are updated.
  AxiosError.ERR_BAD_OPTION_VALUE = 'ERR_BAD_OPTION_VALUE';
  AxiosError.ERR_BAD_OPTION = 'ERR_BAD_OPTION';
  AxiosError.ECONNABORTED = 'ECONNABORTED';
  AxiosError.ETIMEDOUT = 'ETIMEDOUT';
  AxiosError.ERR_NETWORK = 'ERR_NETWORK';
  AxiosError.ERR_FR_TOO_MANY_REDIRECTS = 'ERR_FR_TOO_MANY_REDIRECTS';
  AxiosError.ERR_DEPRECATED = 'ERR_DEPRECATED';
  AxiosError.ERR_BAD_RESPONSE = 'ERR_BAD_RESPONSE';
  AxiosError.ERR_BAD_REQUEST = 'ERR_BAD_REQUEST';
  AxiosError.ERR_CANCELED = 'ERR_CANCELED';
  AxiosError.ERR_NOT_SUPPORT = 'ERR_NOT_SUPPORT';
  AxiosError.ERR_INVALID_URL = 'ERR_INVALID_URL';

  // eslint-disable-next-line strict
  var httpAdapter = null;

  /**
   * Determines if the given thing is a array or js object.
   *
   * @param {string} thing - The object or array to be visited.
   *
   * @returns {boolean}
   */
  function isVisitable(thing) {
    return utils$1.isPlainObject(thing) || utils$1.isArray(thing);
  }

  /**
   * It removes the brackets from the end of a string
   *
   * @param {string} key - The key of the parameter.
   *
   * @returns {string} the key without the brackets.
   */
  function removeBrackets(key) {
    return utils$1.endsWith(key, '[]') ? key.slice(0, -2) : key;
  }

  /**
   * It takes a path, a key, and a boolean, and returns a string
   *
   * @param {string} path - The path to the current key.
   * @param {string} key - The key of the current object being iterated over.
   * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
   *
   * @returns {string} The path to the current key.
   */
  function renderKey(path, key, dots) {
    if (!path) return key;
    return path
      .concat(key)
      .map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
      })
      .join(dots ? '.' : '');
  }

  /**
   * If the array is an array and none of its elements are visitable, then it's a flat array.
   *
   * @param {Array<any>} arr - The array to check
   *
   * @returns {boolean}
   */
  function isFlatArray(arr) {
    return utils$1.isArray(arr) && !arr.some(isVisitable);
  }

  const predicates = utils$1.toFlatObject(utils$1, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
  });

  /**
   * Convert a data object to FormData
   *
   * @param {Object} obj
   * @param {?Object} [formData]
   * @param {?Object} [options]
   * @param {Function} [options.visitor]
   * @param {Boolean} [options.metaTokens = true]
   * @param {Boolean} [options.dots = false]
   * @param {?Boolean} [options.indexes = false]
   *
   * @returns {Object}
   **/

  /**
   * It converts an object into a FormData object
   *
   * @param {Object<any, any>} obj - The object to convert to form data.
   * @param {string} formData - The FormData object to append to.
   * @param {Object<string, any>} options
   *
   * @returns
   */
  function toFormData(obj, formData, options) {
    if (!utils$1.isObject(obj)) {
      throw new TypeError('target must be an object');
    }

    // eslint-disable-next-line no-param-reassign
    formData = formData || new (FormData)();

    // eslint-disable-next-line no-param-reassign
    options = utils$1.toFlatObject(
      options,
      {
        metaTokens: true,
        dots: false,
        indexes: false,
      },
      false,
      function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !utils$1.isUndefined(source[option]);
      }
    );

    const metaTokens = options.metaTokens;
    // eslint-disable-next-line no-use-before-define
    const visitor = options.visitor || defaultVisitor;
    const dots = options.dots;
    const indexes = options.indexes;
    const _Blob = options.Blob || (typeof Blob !== 'undefined' && Blob);
    const useBlob = _Blob && utils$1.isSpecCompliantForm(formData);

    if (!utils$1.isFunction(visitor)) {
      throw new TypeError('visitor must be a function');
    }

    function convertValue(value) {
      if (value === null) return '';

      if (utils$1.isDate(value)) {
        return value.toISOString();
      }

      if (utils$1.isBoolean(value)) {
        return value.toString();
      }

      if (!useBlob && utils$1.isBlob(value)) {
        throw new AxiosError('Blob is not supported. Use a Buffer instead.');
      }

      if (utils$1.isArrayBuffer(value) || utils$1.isTypedArray(value)) {
        return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
      }

      return value;
    }

    /**
     * Default visitor.
     *
     * @param {*} value
     * @param {String|Number} key
     * @param {Array<String|Number>} path
     * @this {FormData}
     *
     * @returns {boolean} return true to visit the each prop of the value recursively
     */
    function defaultVisitor(value, key, path) {
      let arr = value;

      if (utils$1.isReactNative(formData) && utils$1.isReactNativeBlob(value)) {
        formData.append(renderKey(path, key, dots), convertValue(value));
        return false;
      }

      if (value && !path && typeof value === 'object') {
        if (utils$1.endsWith(key, '{}')) {
          // eslint-disable-next-line no-param-reassign
          key = metaTokens ? key : key.slice(0, -2);
          // eslint-disable-next-line no-param-reassign
          value = JSON.stringify(value);
        } else if (
          (utils$1.isArray(value) && isFlatArray(value)) ||
          ((utils$1.isFileList(value) || utils$1.endsWith(key, '[]')) && (arr = utils$1.toArray(value)))
        ) {
          // eslint-disable-next-line no-param-reassign
          key = removeBrackets(key);

          arr.forEach(function each(el, index) {
            !(utils$1.isUndefined(el) || el === null) &&
              formData.append(
                // eslint-disable-next-line no-nested-ternary
                indexes === true
                  ? renderKey([key], index, dots)
                  : indexes === null
                    ? key
                    : key + '[]',
                convertValue(el)
              );
          });
          return false;
        }
      }

      if (isVisitable(value)) {
        return true;
      }

      formData.append(renderKey(path, key, dots), convertValue(value));

      return false;
    }

    const stack = [];

    const exposedHelpers = Object.assign(predicates, {
      defaultVisitor,
      convertValue,
      isVisitable,
    });

    function build(value, path) {
      if (utils$1.isUndefined(value)) return;

      if (stack.indexOf(value) !== -1) {
        throw Error('Circular reference detected in ' + path.join('.'));
      }

      stack.push(value);

      utils$1.forEach(value, function each(el, key) {
        const result =
          !(utils$1.isUndefined(el) || el === null) &&
          visitor.call(formData, el, utils$1.isString(key) ? key.trim() : key, path, exposedHelpers);

        if (result === true) {
          build(el, path ? path.concat(key) : [key]);
        }
      });

      stack.pop();
    }

    if (!utils$1.isObject(obj)) {
      throw new TypeError('data must be an object');
    }

    build(obj);

    return formData;
  }

  /**
   * It encodes a string by replacing all characters that are not in the unreserved set with
   * their percent-encoded equivalents
   *
   * @param {string} str - The string to encode.
   *
   * @returns {string} The encoded string.
   */
  function encode$1(str) {
    const charMap = {
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '~': '%7E',
      '%20': '+',
      '%00': '\x00',
    };
    return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
      return charMap[match];
    });
  }

  /**
   * It takes a params object and converts it to a FormData object
   *
   * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
   * @param {Object<string, any>} options - The options object passed to the Axios constructor.
   *
   * @returns {void}
   */
  function AxiosURLSearchParams(params, options) {
    this._pairs = [];

    params && toFormData(params, this, options);
  }

  const prototype = AxiosURLSearchParams.prototype;

  prototype.append = function append(name, value) {
    this._pairs.push([name, value]);
  };

  prototype.toString = function toString(encoder) {
    const _encode = encoder
      ? function (value) {
          return encoder.call(this, value, encode$1);
        }
      : encode$1;

    return this._pairs
      .map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '')
      .join('&');
  };

  /**
   * It replaces URL-encoded forms of `:`, `$`, `,`, and spaces with
   * their plain counterparts (`:`, `$`, `,`, `+`).
   *
   * @param {string} val The value to be encoded.
   *
   * @returns {string} The encoded value.
   */
  function encode(val) {
    return encodeURIComponent(val)
      .replace(/%3A/gi, ':')
      .replace(/%24/g, '$')
      .replace(/%2C/gi, ',')
      .replace(/%20/g, '+');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @param {?(object|Function)} options
   *
   * @returns {string} The formatted url
   */
  function buildURL(url, params, options) {
    if (!params) {
      return url;
    }

    const _encode = (options && options.encode) || encode;

    const _options = utils$1.isFunction(options)
      ? {
          serialize: options,
        }
      : options;

    const serializeFn = _options && _options.serialize;

    let serializedParams;

    if (serializeFn) {
      serializedParams = serializeFn(params, _options);
    } else {
      serializedParams = utils$1.isURLSearchParams(params)
        ? params.toString()
        : new AxiosURLSearchParams(params, _options).toString(_encode);
    }

    if (serializedParams) {
      const hashmarkIndex = url.indexOf('#');

      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  }

  class InterceptorManager {
    constructor() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     * @param {Object} options The options for the interceptor, synchronous and runWhen
     *
     * @return {Number} An ID used to remove interceptor later
     */
    use(fulfilled, rejected, options) {
      this.handlers.push({
        fulfilled,
        rejected,
        synchronous: options ? options.synchronous : false,
        runWhen: options ? options.runWhen : null,
      });
      return this.handlers.length - 1;
    }

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     *
     * @returns {void}
     */
    eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    }

    /**
     * Clear all interceptors from the stack
     *
     * @returns {void}
     */
    clear() {
      if (this.handlers) {
        this.handlers = [];
      }
    }

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     *
     * @returns {void}
     */
    forEach(fn) {
      utils$1.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    }
  }

  var transitionalDefaults = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false,
    legacyInterceptorReqResOrdering: true,
  };

  var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

  var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

  var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

  var platform$1 = {
    isBrowser: true,
    classes: {
      URLSearchParams: URLSearchParams$1,
      FormData: FormData$1,
      Blob: Blob$1,
    },
    protocols: ['http', 'https', 'file', 'blob', 'url', 'data'],
  };

  const hasBrowserEnv = typeof window !== 'undefined' && typeof document !== 'undefined';

  const _navigator = (typeof navigator === 'object' && navigator) || undefined;

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   *
   * @returns {boolean}
   */
  const hasStandardBrowserEnv =
    hasBrowserEnv &&
    (!_navigator || ['ReactNative', 'NativeScript', 'NS'].indexOf(_navigator.product) < 0);

  /**
   * Determine if we're running in a standard browser webWorker environment
   *
   * Although the `isStandardBrowserEnv` method indicates that
   * `allows axios to run in a web worker`, the WebWorker will still be
   * filtered out due to its judgment standard
   * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
   * This leads to a problem when axios post `FormData` in webWorker
   */
  const hasStandardBrowserWebWorkerEnv = (() => {
    return (
      typeof WorkerGlobalScope !== 'undefined' &&
      // eslint-disable-next-line no-undef
      self instanceof WorkerGlobalScope &&
      typeof self.importScripts === 'function'
    );
  })();

  const origin = (hasBrowserEnv && window.location.href) || 'http://localhost';

  var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    hasBrowserEnv: hasBrowserEnv,
    hasStandardBrowserWebWorkerEnv: hasStandardBrowserWebWorkerEnv,
    hasStandardBrowserEnv: hasStandardBrowserEnv,
    navigator: _navigator,
    origin: origin
  });

  var platform = {
    ...utils,
    ...platform$1,
  };

  function toURLEncodedForm(data, options) {
    return toFormData(data, new platform.classes.URLSearchParams(), {
      visitor: function (value, key, path, helpers) {
        if (platform.isNode && utils$1.isBuffer(value)) {
          this.append(key, value.toString('base64'));
          return false;
        }

        return helpers.defaultVisitor.apply(this, arguments);
      },
      ...options,
    });
  }

  /**
   * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
   *
   * @param {string} name - The name of the property to get.
   *
   * @returns An array of strings.
   */
  function parsePropPath(name) {
    // foo[x][y][z]
    // foo.x.y.z
    // foo-x-y-z
    // foo x y z
    return utils$1.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
      return match[0] === '[]' ? '' : match[1] || match[0];
    });
  }

  /**
   * Convert an array to an object.
   *
   * @param {Array<any>} arr - The array to convert to an object.
   *
   * @returns An object with the same keys and values as the array.
   */
  function arrayToObject(arr) {
    const obj = {};
    const keys = Object.keys(arr);
    let i;
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = arr[key];
    }
    return obj;
  }

  /**
   * It takes a FormData object and returns a JavaScript object
   *
   * @param {string} formData The FormData object to convert to JSON.
   *
   * @returns {Object<string, any> | null} The converted object.
   */
  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      let name = path[index++];

      if (name === '__proto__') return true;

      const isNumericKey = Number.isFinite(+name);
      const isLast = index >= path.length;
      name = !name && utils$1.isArray(target) ? target.length : name;

      if (isLast) {
        if (utils$1.hasOwnProp(target, name)) {
          target[name] = [target[name], value];
        } else {
          target[name] = value;
        }

        return !isNumericKey;
      }

      if (!target[name] || !utils$1.isObject(target[name])) {
        target[name] = [];
      }

      const result = buildPath(path, value, target[name], index);

      if (result && utils$1.isArray(target[name])) {
        target[name] = arrayToObject(target[name]);
      }

      return !isNumericKey;
    }

    if (utils$1.isFormData(formData) && utils$1.isFunction(formData.entries)) {
      const obj = {};

      utils$1.forEachEntry(formData, (name, value) => {
        buildPath(parsePropPath(name), value, obj, 0);
      });

      return obj;
    }

    return null;
  }

  /**
   * It takes a string, tries to parse it, and if it fails, it returns the stringified version
   * of the input
   *
   * @param {any} rawValue - The value to be stringified.
   * @param {Function} parser - A function that parses a string into a JavaScript object.
   * @param {Function} encoder - A function that takes a value and returns a string.
   *
   * @returns {string} A stringified version of the rawValue.
   */
  function stringifySafely(rawValue, parser, encoder) {
    if (utils$1.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils$1.trim(rawValue);
      } catch (e) {
        if (e.name !== 'SyntaxError') {
          throw e;
        }
      }
    }

    return (encoder || JSON.stringify)(rawValue);
  }

  const defaults = {
    transitional: transitionalDefaults,

    adapter: ['xhr', 'http', 'fetch'],

    transformRequest: [
      function transformRequest(data, headers) {
        const contentType = headers.getContentType() || '';
        const hasJSONContentType = contentType.indexOf('application/json') > -1;
        const isObjectPayload = utils$1.isObject(data);

        if (isObjectPayload && utils$1.isHTMLForm(data)) {
          data = new FormData(data);
        }

        const isFormData = utils$1.isFormData(data);

        if (isFormData) {
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }

        if (
          utils$1.isArrayBuffer(data) ||
          utils$1.isBuffer(data) ||
          utils$1.isStream(data) ||
          utils$1.isFile(data) ||
          utils$1.isBlob(data) ||
          utils$1.isReadableStream(data)
        ) {
          return data;
        }
        if (utils$1.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils$1.isURLSearchParams(data)) {
          headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
          return data.toString();
        }

        let isFileList;

        if (isObjectPayload) {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }

          if (
            (isFileList = utils$1.isFileList(data)) ||
            contentType.indexOf('multipart/form-data') > -1
          ) {
            const _FormData = this.env && this.env.FormData;

            return toFormData(
              isFileList ? { 'files[]': data } : data,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }

        if (isObjectPayload || hasJSONContentType) {
          headers.setContentType('application/json', false);
          return stringifySafely(data);
        }

        return data;
      },
    ],

    transformResponse: [
      function transformResponse(data) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === 'json';

        if (utils$1.isResponse(data) || utils$1.isReadableStream(data)) {
          return data;
        }

        if (
          data &&
          utils$1.isString(data) &&
          ((forcedJSONParsing && !this.responseType) || JSONRequested)
        ) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;

          try {
            return JSON.parse(data, this.parseReviver);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      },
    ],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    env: {
      FormData: platform.classes.FormData,
      Blob: platform.classes.Blob,
    },

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },

    headers: {
      common: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': undefined,
      },
    },
  };

  utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], (method) => {
    defaults.headers[method] = {};
  });

  // RawAxiosHeaders whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  const ignoreDuplicateOf = utils$1.toObjectSet([
    'age',
    'authorization',
    'content-length',
    'content-type',
    'etag',
    'expires',
    'from',
    'host',
    'if-modified-since',
    'if-unmodified-since',
    'last-modified',
    'location',
    'max-forwards',
    'proxy-authorization',
    'referer',
    'retry-after',
    'user-agent',
  ]);

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} rawHeaders Headers needing to be parsed
   *
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = (rawHeaders) => {
    const parsed = {};
    let key;
    let val;
    let i;

    rawHeaders &&
      rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();

        if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
          return;
        }

        if (key === 'set-cookie') {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      });

    return parsed;
  };

  const $internals = Symbol('internals');

  function normalizeHeader(header) {
    return header && String(header).trim().toLowerCase();
  }

  function normalizeValue(value) {
    if (value === false || value == null) {
      return value;
    }

    return utils$1.isArray(value)
      ? value.map(normalizeValue)
      : String(value).replace(/[\r\n]+$/, '');
  }

  function parseTokens(str) {
    const tokens = Object.create(null);
    const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
    let match;

    while ((match = tokensRE.exec(str))) {
      tokens[match[1]] = match[2];
    }

    return tokens;
  }

  const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

  function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
    if (utils$1.isFunction(filter)) {
      return filter.call(this, value, header);
    }

    if (isHeaderNameFilter) {
      value = header;
    }

    if (!utils$1.isString(value)) return;

    if (utils$1.isString(filter)) {
      return value.indexOf(filter) !== -1;
    }

    if (utils$1.isRegExp(filter)) {
      return filter.test(value);
    }
  }

  function formatHeader(header) {
    return header
      .trim()
      .toLowerCase()
      .replace(/([a-z\d])(\w*)/g, (w, char, str) => {
        return char.toUpperCase() + str;
      });
  }

  function buildAccessors(obj, header) {
    const accessorName = utils$1.toCamelCase(' ' + header);

    ['get', 'set', 'has'].forEach((methodName) => {
      Object.defineProperty(obj, methodName + accessorName, {
        value: function (arg1, arg2, arg3) {
          return this[methodName].call(this, header, arg1, arg2, arg3);
        },
        configurable: true,
      });
    });
  }

  class AxiosHeaders {
    constructor(headers) {
      headers && this.set(headers);
    }

    set(header, valueOrRewrite, rewrite) {
      const self = this;

      function setHeader(_value, _header, _rewrite) {
        const lHeader = normalizeHeader(_header);

        if (!lHeader) {
          throw new Error('header name must be a non-empty string');
        }

        const key = utils$1.findKey(self, lHeader);

        if (
          !key ||
          self[key] === undefined ||
          _rewrite === true ||
          (_rewrite === undefined && self[key] !== false)
        ) {
          self[key || _header] = normalizeValue(_value);
        }
      }

      const setHeaders = (headers, _rewrite) =>
        utils$1.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

      if (utils$1.isPlainObject(header) || header instanceof this.constructor) {
        setHeaders(header, valueOrRewrite);
      } else if (utils$1.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
        setHeaders(parseHeaders(header), valueOrRewrite);
      } else if (utils$1.isObject(header) && utils$1.isIterable(header)) {
        let obj = {},
          dest,
          key;
        for (const entry of header) {
          if (!utils$1.isArray(entry)) {
            throw TypeError('Object iterator must return a key-value pair');
          }

          obj[(key = entry[0])] = (dest = obj[key])
            ? utils$1.isArray(dest)
              ? [...dest, entry[1]]
              : [dest, entry[1]]
            : entry[1];
        }

        setHeaders(obj, valueOrRewrite);
      } else {
        header != null && setHeader(valueOrRewrite, header, rewrite);
      }

      return this;
    }

    get(header, parser) {
      header = normalizeHeader(header);

      if (header) {
        const key = utils$1.findKey(this, header);

        if (key) {
          const value = this[key];

          if (!parser) {
            return value;
          }

          if (parser === true) {
            return parseTokens(value);
          }

          if (utils$1.isFunction(parser)) {
            return parser.call(this, value, key);
          }

          if (utils$1.isRegExp(parser)) {
            return parser.exec(value);
          }

          throw new TypeError('parser must be boolean|regexp|function');
        }
      }
    }

    has(header, matcher) {
      header = normalizeHeader(header);

      if (header) {
        const key = utils$1.findKey(this, header);

        return !!(
          key &&
          this[key] !== undefined &&
          (!matcher || matchHeaderValue(this, this[key], key, matcher))
        );
      }

      return false;
    }

    delete(header, matcher) {
      const self = this;
      let deleted = false;

      function deleteHeader(_header) {
        _header = normalizeHeader(_header);

        if (_header) {
          const key = utils$1.findKey(self, _header);

          if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
            delete self[key];

            deleted = true;
          }
        }
      }

      if (utils$1.isArray(header)) {
        header.forEach(deleteHeader);
      } else {
        deleteHeader(header);
      }

      return deleted;
    }

    clear(matcher) {
      const keys = Object.keys(this);
      let i = keys.length;
      let deleted = false;

      while (i--) {
        const key = keys[i];
        if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
          delete this[key];
          deleted = true;
        }
      }

      return deleted;
    }

    normalize(format) {
      const self = this;
      const headers = {};

      utils$1.forEach(this, (value, header) => {
        const key = utils$1.findKey(headers, header);

        if (key) {
          self[key] = normalizeValue(value);
          delete self[header];
          return;
        }

        const normalized = format ? formatHeader(header) : String(header).trim();

        if (normalized !== header) {
          delete self[header];
        }

        self[normalized] = normalizeValue(value);

        headers[normalized] = true;
      });

      return this;
    }

    concat(...targets) {
      return this.constructor.concat(this, ...targets);
    }

    toJSON(asStrings) {
      const obj = Object.create(null);

      utils$1.forEach(this, (value, header) => {
        value != null &&
          value !== false &&
          (obj[header] = asStrings && utils$1.isArray(value) ? value.join(', ') : value);
      });

      return obj;
    }

    [Symbol.iterator]() {
      return Object.entries(this.toJSON())[Symbol.iterator]();
    }

    toString() {
      return Object.entries(this.toJSON())
        .map(([header, value]) => header + ': ' + value)
        .join('\n');
    }

    getSetCookie() {
      return this.get('set-cookie') || [];
    }

    get [Symbol.toStringTag]() {
      return 'AxiosHeaders';
    }

    static from(thing) {
      return thing instanceof this ? thing : new this(thing);
    }

    static concat(first, ...targets) {
      const computed = new this(first);

      targets.forEach((target) => computed.set(target));

      return computed;
    }

    static accessor(header) {
      const internals =
        (this[$internals] =
        this[$internals] =
          {
            accessors: {},
          });

      const accessors = internals.accessors;
      const prototype = this.prototype;

      function defineAccessor(_header) {
        const lHeader = normalizeHeader(_header);

        if (!accessors[lHeader]) {
          buildAccessors(prototype, _header);
          accessors[lHeader] = true;
        }
      }

      utils$1.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

      return this;
    }
  }

  AxiosHeaders.accessor([
    'Content-Type',
    'Content-Length',
    'Accept',
    'Accept-Encoding',
    'User-Agent',
    'Authorization',
  ]);

  // reserved names hotfix
  utils$1.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
    let mapped = key[0].toUpperCase() + key.slice(1); // map `set` => `Set`
    return {
      get: () => value,
      set(headerValue) {
        this[mapped] = headerValue;
      },
    };
  });

  utils$1.freezeMethods(AxiosHeaders);

  /**
   * Transform the data for a request or a response
   *
   * @param {Array|Function} fns A single function or Array of functions
   * @param {?Object} response The response object
   *
   * @returns {*} The resulting transformed data
   */
  function transformData(fns, response) {
    const config = this || defaults;
    const context = response || config;
    const headers = AxiosHeaders.from(context.headers);
    let data = context.data;

    utils$1.forEach(fns, function transform(fn) {
      data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
    });

    headers.normalize();

    return data;
  }

  function isCancel(value) {
    return !!(value && value.__CANCEL__);
  }

  class CanceledError extends AxiosError {
    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @param {string=} message The message.
     * @param {Object=} config The config.
     * @param {Object=} request The request.
     *
     * @returns {CanceledError} The created error.
     */
    constructor(message, config, request) {
      super(message == null ? 'canceled' : message, AxiosError.ERR_CANCELED, config, request);
      this.name = 'CanceledError';
      this.__CANCEL__ = true;
    }
  }

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   *
   * @returns {object} The response.
   */
  function settle(resolve, reject, response) {
    const validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(
        new AxiosError(
          'Request failed with status code ' + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][
            Math.floor(response.status / 100) - 4
          ],
          response.config,
          response.request,
          response
        )
      );
    }
  }

  function parseProtocol(url) {
    const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return (match && match[1]) || '';
  }

  /**
   * Calculate data maxRate
   * @param {Number} [samplesCount= 10]
   * @param {Number} [min= 1000]
   * @returns {Function}
   */
  function speedometer(samplesCount, min) {
    samplesCount = samplesCount || 10;
    const bytes = new Array(samplesCount);
    const timestamps = new Array(samplesCount);
    let head = 0;
    let tail = 0;
    let firstSampleTS;

    min = min !== undefined ? min : 1000;

    return function push(chunkLength) {
      const now = Date.now();

      const startedAt = timestamps[tail];

      if (!firstSampleTS) {
        firstSampleTS = now;
      }

      bytes[head] = chunkLength;
      timestamps[head] = now;

      let i = tail;
      let bytesCount = 0;

      while (i !== head) {
        bytesCount += bytes[i++];
        i = i % samplesCount;
      }

      head = (head + 1) % samplesCount;

      if (head === tail) {
        tail = (tail + 1) % samplesCount;
      }

      if (now - firstSampleTS < min) {
        return;
      }

      const passed = startedAt && now - startedAt;

      return passed ? Math.round((bytesCount * 1000) / passed) : undefined;
    };
  }

  /**
   * Throttle decorator
   * @param {Function} fn
   * @param {Number} freq
   * @return {Function}
   */
  function throttle(fn, freq) {
    let timestamp = 0;
    let threshold = 1000 / freq;
    let lastArgs;
    let timer;

    const invoke = (args, now = Date.now()) => {
      timestamp = now;
      lastArgs = null;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn(...args);
    };

    const throttled = (...args) => {
      const now = Date.now();
      const passed = now - timestamp;
      if (passed >= threshold) {
        invoke(args, now);
      } else {
        lastArgs = args;
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            invoke(lastArgs);
          }, threshold - passed);
        }
      }
    };

    const flush = () => lastArgs && invoke(lastArgs);

    return [throttled, flush];
  }

  const progressEventReducer = (listener, isDownloadStream, freq = 3) => {
    let bytesNotified = 0;
    const _speedometer = speedometer(50, 250);

    return throttle((e) => {
      const loaded = e.loaded;
      const total = e.lengthComputable ? e.total : undefined;
      const progressBytes = loaded - bytesNotified;
      const rate = _speedometer(progressBytes);
      const inRange = loaded <= total;

      bytesNotified = loaded;

      const data = {
        loaded,
        total,
        progress: total ? loaded / total : undefined,
        bytes: progressBytes,
        rate: rate ? rate : undefined,
        estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
        event: e,
        lengthComputable: total != null,
        [isDownloadStream ? 'download' : 'upload']: true,
      };

      listener(data);
    }, freq);
  };

  const progressEventDecorator = (total, throttled) => {
    const lengthComputable = total != null;

    return [
      (loaded) =>
        throttled[0]({
          lengthComputable,
          total,
          loaded,
        }),
      throttled[1],
    ];
  };

  const asyncDecorator =
    (fn) =>
    (...args) =>
      utils$1.asap(() => fn(...args));

  var isURLSameOrigin = platform.hasStandardBrowserEnv
    ? ((origin, isMSIE) => (url) => {
        url = new URL(url, platform.origin);

        return (
          origin.protocol === url.protocol &&
          origin.host === url.host &&
          (isMSIE || origin.port === url.port)
        );
      })(
        new URL(platform.origin),
        platform.navigator && /(msie|trident)/i.test(platform.navigator.userAgent)
      )
    : () => true;

  var cookies = platform.hasStandardBrowserEnv
    ? // Standard browser envs support document.cookie
      {
        write(name, value, expires, path, domain, secure, sameSite) {
          if (typeof document === 'undefined') return;

          const cookie = [`${name}=${encodeURIComponent(value)}`];

          if (utils$1.isNumber(expires)) {
            cookie.push(`expires=${new Date(expires).toUTCString()}`);
          }
          if (utils$1.isString(path)) {
            cookie.push(`path=${path}`);
          }
          if (utils$1.isString(domain)) {
            cookie.push(`domain=${domain}`);
          }
          if (secure === true) {
            cookie.push('secure');
          }
          if (utils$1.isString(sameSite)) {
            cookie.push(`SameSite=${sameSite}`);
          }

          document.cookie = cookie.join('; ');
        },

        read(name) {
          if (typeof document === 'undefined') return null;
          const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
          return match ? decodeURIComponent(match[1]) : null;
        },

        remove(name) {
          this.write(name, '', Date.now() - 86400000, '/');
        },
      }
    : // Non-standard browser env (web workers, react-native) lack needed support.
      {
        write() {},
        read() {
          return null;
        },
        remove() {},
      };

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   *
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    if (typeof url !== 'string') {
      return false;
    }

    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  }

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   *
   * @returns {string} The combined URL
   */
  function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  }

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   *
   * @returns {string} The combined full path
   */
  function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
    let isRelativeUrl = !isAbsoluteURL(requestedURL);
    if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  }

  const headersToObject = (thing) => (thing instanceof AxiosHeaders ? { ...thing } : thing);

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   *
   * @returns {Object} New object resulting from merging config2 to config1
   */
  function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    const config = {};

    function getMergedValue(target, source, prop, caseless) {
      if (utils$1.isPlainObject(target) && utils$1.isPlainObject(source)) {
        return utils$1.merge.call({ caseless }, target, source);
      } else if (utils$1.isPlainObject(source)) {
        return utils$1.merge({}, source);
      } else if (utils$1.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    function mergeDeepProperties(a, b, prop, caseless) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(a, b, prop, caseless);
      } else if (!utils$1.isUndefined(a)) {
        return getMergedValue(undefined, a, prop, caseless);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(a, b) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(undefined, b);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(a, b) {
      if (!utils$1.isUndefined(b)) {
        return getMergedValue(undefined, b);
      } else if (!utils$1.isUndefined(a)) {
        return getMergedValue(undefined, a);
      }
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(a, b, prop) {
      if (prop in config2) {
        return getMergedValue(a, b);
      } else if (prop in config1) {
        return getMergedValue(undefined, a);
      }
    }

    const mergeMap = {
      url: valueFromConfig2,
      method: valueFromConfig2,
      data: valueFromConfig2,
      baseURL: defaultToConfig2,
      transformRequest: defaultToConfig2,
      transformResponse: defaultToConfig2,
      paramsSerializer: defaultToConfig2,
      timeout: defaultToConfig2,
      timeoutMessage: defaultToConfig2,
      withCredentials: defaultToConfig2,
      withXSRFToken: defaultToConfig2,
      adapter: defaultToConfig2,
      responseType: defaultToConfig2,
      xsrfCookieName: defaultToConfig2,
      xsrfHeaderName: defaultToConfig2,
      onUploadProgress: defaultToConfig2,
      onDownloadProgress: defaultToConfig2,
      decompress: defaultToConfig2,
      maxContentLength: defaultToConfig2,
      maxBodyLength: defaultToConfig2,
      beforeRedirect: defaultToConfig2,
      transport: defaultToConfig2,
      httpAgent: defaultToConfig2,
      httpsAgent: defaultToConfig2,
      cancelToken: defaultToConfig2,
      socketPath: defaultToConfig2,
      responseEncoding: defaultToConfig2,
      validateStatus: mergeDirectKeys,
      headers: (a, b, prop) =>
        mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true),
    };

    utils$1.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
      if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') return;
      const merge = utils$1.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
      const configValue = merge(config1[prop], config2[prop], prop);
      (utils$1.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
    });

    return config;
  }

  var resolveConfig = (config) => {
    const newConfig = mergeConfig({}, config);

    let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;

    newConfig.headers = headers = AxiosHeaders.from(headers);

    newConfig.url = buildURL(
      buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls),
      config.params,
      config.paramsSerializer
    );

    // HTTP basic authentication
    if (auth) {
      headers.set(
        'Authorization',
        'Basic ' +
          btoa(
            (auth.username || '') +
              ':' +
              (auth.password ? unescape(encodeURIComponent(auth.password)) : '')
          )
      );
    }

    if (utils$1.isFormData(data)) {
      if (platform.hasStandardBrowserEnv || platform.hasStandardBrowserWebWorkerEnv) {
        headers.setContentType(undefined); // browser handles it
      } else if (utils$1.isFunction(data.getHeaders)) {
        // Node.js FormData (like form-data package)
        const formHeaders = data.getHeaders();
        // Only set safe headers to avoid overwriting security headers
        const allowedHeaders = ['content-type', 'content-length'];
        Object.entries(formHeaders).forEach(([key, val]) => {
          if (allowedHeaders.includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
      }
    }

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.

    if (platform.hasStandardBrowserEnv) {
      withXSRFToken && utils$1.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));

      if (withXSRFToken || (withXSRFToken !== false && isURLSameOrigin(newConfig.url))) {
        // Add xsrf header
        const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies.read(xsrfCookieName);

        if (xsrfValue) {
          headers.set(xsrfHeaderName, xsrfValue);
        }
      }
    }

    return newConfig;
  };

  const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

  var xhrAdapter = isXHRAdapterSupported &&
    function (config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        const _config = resolveConfig(config);
        let requestData = _config.data;
        const requestHeaders = AxiosHeaders.from(_config.headers).normalize();
        let { responseType, onUploadProgress, onDownloadProgress } = _config;
        let onCanceled;
        let uploadThrottled, downloadThrottled;
        let flushUpload, flushDownload;

        function done() {
          flushUpload && flushUpload(); // flush events
          flushDownload && flushDownload(); // flush events

          _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);

          _config.signal && _config.signal.removeEventListener('abort', onCanceled);
        }

        let request = new XMLHttpRequest();

        request.open(_config.method.toUpperCase(), _config.url, true);

        // Set the request timeout in MS
        request.timeout = _config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          const responseHeaders = AxiosHeaders.from(
            'getAllResponseHeaders' in request && request.getAllResponseHeaders()
          );
          const responseData =
            !responseType || responseType === 'text' || responseType === 'json'
              ? request.responseText
              : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request,
          };

          settle(
            function _resolve(value) {
              resolve(value);
              done();
            },
            function _reject(err) {
              reject(err);
              done();
            },
            response
          );

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (
              request.status === 0 &&
              !(request.responseURL && request.responseURL.indexOf('file:') === 0)
            ) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError(event) {
          // Browsers deliver a ProgressEvent in XHR onerror
          // (message may be empty; when present, surface it)
          // See https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/error_event
          const msg = event && event.message ? event.message : 'Network Error';
          const err = new AxiosError(msg, AxiosError.ERR_NETWORK, config, request);
          // attach the underlying event for consumers who want details
          err.event = event || null;
          reject(err);
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = _config.timeout
            ? 'timeout of ' + _config.timeout + 'ms exceeded'
            : 'timeout exceeded';
          const transitional = _config.transitional || transitionalDefaults;
          if (_config.timeoutErrorMessage) {
            timeoutErrorMessage = _config.timeoutErrorMessage;
          }
          reject(
            new AxiosError(
              timeoutErrorMessage,
              transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
              config,
              request
            )
          );

          // Clean up request
          request = null;
        };

        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils$1.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }

        // Add withCredentials to request if needed
        if (!utils$1.isUndefined(_config.withCredentials)) {
          request.withCredentials = !!_config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = _config.responseType;
        }

        // Handle progress if needed
        if (onDownloadProgress) {
          [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
          request.addEventListener('progress', downloadThrottled);
        }

        // Not all browsers support upload events
        if (onUploadProgress && request.upload) {
          [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);

          request.upload.addEventListener('progress', uploadThrottled);

          request.upload.addEventListener('loadend', flushUpload);
        }

        if (_config.cancelToken || _config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = (cancel) => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
            request.abort();
            request = null;
          };

          _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
          if (_config.signal) {
            _config.signal.aborted
              ? onCanceled()
              : _config.signal.addEventListener('abort', onCanceled);
          }
        }

        const protocol = parseProtocol(_config.url);

        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(
            new AxiosError(
              'Unsupported protocol ' + protocol + ':',
              AxiosError.ERR_BAD_REQUEST,
              config
            )
          );
          return;
        }

        // Send the request
        request.send(requestData || null);
      });
    };

  const composeSignals = (signals, timeout) => {
    const { length } = (signals = signals ? signals.filter(Boolean) : []);

    if (timeout || length) {
      let controller = new AbortController();

      let aborted;

      const onabort = function (reason) {
        if (!aborted) {
          aborted = true;
          unsubscribe();
          const err = reason instanceof Error ? reason : this.reason;
          controller.abort(
            err instanceof AxiosError
              ? err
              : new CanceledError(err instanceof Error ? err.message : err)
          );
        }
      };

      let timer =
        timeout &&
        setTimeout(() => {
          timer = null;
          onabort(new AxiosError(`timeout of ${timeout}ms exceeded`, AxiosError.ETIMEDOUT));
        }, timeout);

      const unsubscribe = () => {
        if (signals) {
          timer && clearTimeout(timer);
          timer = null;
          signals.forEach((signal) => {
            signal.unsubscribe
              ? signal.unsubscribe(onabort)
              : signal.removeEventListener('abort', onabort);
          });
          signals = null;
        }
      };

      signals.forEach((signal) => signal.addEventListener('abort', onabort));

      const { signal } = controller;

      signal.unsubscribe = () => utils$1.asap(unsubscribe);

      return signal;
    }
  };

  const streamChunk = function* (chunk, chunkSize) {
    let len = chunk.byteLength;

    if (!chunkSize || len < chunkSize) {
      yield chunk;
      return;
    }

    let pos = 0;
    let end;

    while (pos < len) {
      end = pos + chunkSize;
      yield chunk.slice(pos, end);
      pos = end;
    }
  };

  const readBytes = async function* (iterable, chunkSize) {
    for await (const chunk of readStream(iterable)) {
      yield* streamChunk(chunk, chunkSize);
    }
  };

  const readStream = async function* (stream) {
    if (stream[Symbol.asyncIterator]) {
      yield* stream;
      return;
    }

    const reader = stream.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        yield value;
      }
    } finally {
      await reader.cancel();
    }
  };

  const trackStream = (stream, chunkSize, onProgress, onFinish) => {
    const iterator = readBytes(stream, chunkSize);

    let bytes = 0;
    let done;
    let _onFinish = (e) => {
      if (!done) {
        done = true;
        onFinish && onFinish(e);
      }
    };

    return new ReadableStream(
      {
        async pull(controller) {
          try {
            const { done, value } = await iterator.next();

            if (done) {
              _onFinish();
              controller.close();
              return;
            }

            let len = value.byteLength;
            if (onProgress) {
              let loadedBytes = (bytes += len);
              onProgress(loadedBytes);
            }
            controller.enqueue(new Uint8Array(value));
          } catch (err) {
            _onFinish(err);
            throw err;
          }
        },
        cancel(reason) {
          _onFinish(reason);
          return iterator.return();
        },
      },
      {
        highWaterMark: 2,
      }
    );
  };

  const DEFAULT_CHUNK_SIZE = 64 * 1024;

  const { isFunction } = utils$1;

  const globalFetchAPI = (({ Request, Response }) => ({
    Request,
    Response,
  }))(utils$1.global);

  const { ReadableStream: ReadableStream$1, TextEncoder } = utils$1.global;

  const test = (fn, ...args) => {
    try {
      return !!fn(...args);
    } catch (e) {
      return false;
    }
  };

  const factory = (env) => {
    env = utils$1.merge.call(
      {
        skipUndefined: true,
      },
      globalFetchAPI,
      env
    );

    const { fetch: envFetch, Request, Response } = env;
    const isFetchSupported = envFetch ? isFunction(envFetch) : typeof fetch === 'function';
    const isRequestSupported = isFunction(Request);
    const isResponseSupported = isFunction(Response);

    if (!isFetchSupported) {
      return false;
    }

    const isReadableStreamSupported = isFetchSupported && isFunction(ReadableStream$1);

    const encodeText =
      isFetchSupported &&
      (typeof TextEncoder === 'function'
        ? (
            (encoder) => (str) =>
              encoder.encode(str)
          )(new TextEncoder())
        : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));

    const supportsRequestStream =
      isRequestSupported &&
      isReadableStreamSupported &&
      test(() => {
        let duplexAccessed = false;

        const body = new ReadableStream$1();

        const hasContentType = new Request(platform.origin, {
          body,
          method: 'POST',
          get duplex() {
            duplexAccessed = true;
            return 'half';
          },
        }).headers.has('Content-Type');

        body.cancel();

        return duplexAccessed && !hasContentType;
      });

    const supportsResponseStream =
      isResponseSupported &&
      isReadableStreamSupported &&
      test(() => utils$1.isReadableStream(new Response('').body));

    const resolvers = {
      stream: supportsResponseStream && ((res) => res.body),
    };

    isFetchSupported &&
      (() => {
        ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach((type) => {
          !resolvers[type] &&
            (resolvers[type] = (res, config) => {
              let method = res && res[type];

              if (method) {
                return method.call(res);
              }

              throw new AxiosError(
                `Response type '${type}' is not supported`,
                AxiosError.ERR_NOT_SUPPORT,
                config
              );
            });
        });
      })();

    const getBodyLength = async (body) => {
      if (body == null) {
        return 0;
      }

      if (utils$1.isBlob(body)) {
        return body.size;
      }

      if (utils$1.isSpecCompliantForm(body)) {
        const _request = new Request(platform.origin, {
          method: 'POST',
          body,
        });
        return (await _request.arrayBuffer()).byteLength;
      }

      if (utils$1.isArrayBufferView(body) || utils$1.isArrayBuffer(body)) {
        return body.byteLength;
      }

      if (utils$1.isURLSearchParams(body)) {
        body = body + '';
      }

      if (utils$1.isString(body)) {
        return (await encodeText(body)).byteLength;
      }
    };

    const resolveBodyLength = async (headers, body) => {
      const length = utils$1.toFiniteNumber(headers.getContentLength());

      return length == null ? getBodyLength(body) : length;
    };

    return async (config) => {
      let {
        url,
        method,
        data,
        signal,
        cancelToken,
        timeout,
        onDownloadProgress,
        onUploadProgress,
        responseType,
        headers,
        withCredentials = 'same-origin',
        fetchOptions,
      } = resolveConfig(config);

      let _fetch = envFetch || fetch;

      responseType = responseType ? (responseType + '').toLowerCase() : 'text';

      let composedSignal = composeSignals(
        [signal, cancelToken && cancelToken.toAbortSignal()],
        timeout
      );

      let request = null;

      const unsubscribe =
        composedSignal &&
        composedSignal.unsubscribe &&
        (() => {
          composedSignal.unsubscribe();
        });

      let requestContentLength;

      try {
        if (
          onUploadProgress &&
          supportsRequestStream &&
          method !== 'get' &&
          method !== 'head' &&
          (requestContentLength = await resolveBodyLength(headers, data)) !== 0
        ) {
          let _request = new Request(url, {
            method: 'POST',
            body: data,
            duplex: 'half',
          });

          let contentTypeHeader;

          if (utils$1.isFormData(data) && (contentTypeHeader = _request.headers.get('content-type'))) {
            headers.setContentType(contentTypeHeader);
          }

          if (_request.body) {
            const [onProgress, flush] = progressEventDecorator(
              requestContentLength,
              progressEventReducer(asyncDecorator(onUploadProgress))
            );

            data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
          }
        }

        if (!utils$1.isString(withCredentials)) {
          withCredentials = withCredentials ? 'include' : 'omit';
        }

        // Cloudflare Workers throws when credentials are defined
        // see https://github.com/cloudflare/workerd/issues/902
        const isCredentialsSupported = isRequestSupported && 'credentials' in Request.prototype;

        const resolvedOptions = {
          ...fetchOptions,
          signal: composedSignal,
          method: method.toUpperCase(),
          headers: headers.normalize().toJSON(),
          body: data,
          duplex: 'half',
          credentials: isCredentialsSupported ? withCredentials : undefined,
        };

        request = isRequestSupported && new Request(url, resolvedOptions);

        let response = await (isRequestSupported
          ? _fetch(request, fetchOptions)
          : _fetch(url, resolvedOptions));

        const isStreamResponse =
          supportsResponseStream && (responseType === 'stream' || responseType === 'response');

        if (supportsResponseStream && (onDownloadProgress || (isStreamResponse && unsubscribe))) {
          const options = {};

          ['status', 'statusText', 'headers'].forEach((prop) => {
            options[prop] = response[prop];
          });

          const responseContentLength = utils$1.toFiniteNumber(response.headers.get('content-length'));

          const [onProgress, flush] =
            (onDownloadProgress &&
              progressEventDecorator(
                responseContentLength,
                progressEventReducer(asyncDecorator(onDownloadProgress), true)
              )) ||
            [];

          response = new Response(
            trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
              flush && flush();
              unsubscribe && unsubscribe();
            }),
            options
          );
        }

        responseType = responseType || 'text';

        let responseData = await resolvers[utils$1.findKey(resolvers, responseType) || 'text'](
          response,
          config
        );

        !isStreamResponse && unsubscribe && unsubscribe();

        return await new Promise((resolve, reject) => {
          settle(resolve, reject, {
            data: responseData,
            headers: AxiosHeaders.from(response.headers),
            status: response.status,
            statusText: response.statusText,
            config,
            request,
          });
        });
      } catch (err) {
        unsubscribe && unsubscribe();

        if (err && err.name === 'TypeError' && /Load failed|fetch/i.test(err.message)) {
          throw Object.assign(
            new AxiosError(
              'Network Error',
              AxiosError.ERR_NETWORK,
              config,
              request,
              err && err.response
            ),
            {
              cause: err.cause || err,
            }
          );
        }

        throw AxiosError.from(err, err && err.code, config, request, err && err.response);
      }
    };
  };

  const seedCache = new Map();

  const getFetch = (config) => {
    let env = (config && config.env) || {};
    const { fetch, Request, Response } = env;
    const seeds = [Request, Response, fetch];

    let len = seeds.length,
      i = len,
      seed,
      target,
      map = seedCache;

    while (i--) {
      seed = seeds[i];
      target = map.get(seed);

      target === undefined && map.set(seed, (target = i ? new Map() : factory(env)));

      map = target;
    }

    return target;
  };

  getFetch();

  /**
   * Known adapters mapping.
   * Provides environment-specific adapters for Axios:
   * - `http` for Node.js
   * - `xhr` for browsers
   * - `fetch` for fetch API-based requests
   *
   * @type {Object<string, Function|Object>}
   */
  const knownAdapters = {
    http: httpAdapter,
    xhr: xhrAdapter,
    fetch: {
      get: getFetch,
    },
  };

  // Assign adapter names for easier debugging and identification
  utils$1.forEach(knownAdapters, (fn, value) => {
    if (fn) {
      try {
        Object.defineProperty(fn, 'name', { value });
      } catch (e) {
        // eslint-disable-next-line no-empty
      }
      Object.defineProperty(fn, 'adapterName', { value });
    }
  });

  /**
   * Render a rejection reason string for unknown or unsupported adapters
   *
   * @param {string} reason
   * @returns {string}
   */
  const renderReason = (reason) => `- ${reason}`;

  /**
   * Check if the adapter is resolved (function, null, or false)
   *
   * @param {Function|null|false} adapter
   * @returns {boolean}
   */
  const isResolvedHandle = (adapter) =>
    utils$1.isFunction(adapter) || adapter === null || adapter === false;

  /**
   * Get the first suitable adapter from the provided list.
   * Tries each adapter in order until a supported one is found.
   * Throws an AxiosError if no adapter is suitable.
   *
   * @param {Array<string|Function>|string|Function} adapters - Adapter(s) by name or function.
   * @param {Object} config - Axios request configuration
   * @throws {AxiosError} If no suitable adapter is available
   * @returns {Function} The resolved adapter function
   */
  function getAdapter(adapters, config) {
    adapters = utils$1.isArray(adapters) ? adapters : [adapters];

    const { length } = adapters;
    let nameOrAdapter;
    let adapter;

    const rejectedReasons = {};

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      let id;

      adapter = nameOrAdapter;

      if (!isResolvedHandle(nameOrAdapter)) {
        adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];

        if (adapter === undefined) {
          throw new AxiosError(`Unknown adapter '${id}'`);
        }
      }

      if (adapter && (utils$1.isFunction(adapter) || (adapter = adapter.get(config)))) {
        break;
      }

      rejectedReasons[id || '#' + i] = adapter;
    }

    if (!adapter) {
      const reasons = Object.entries(rejectedReasons).map(
        ([id, state]) =>
          `adapter ${id} ` +
          (state === false ? 'is not supported by the environment' : 'is not available in the build')
      );

      let s = length
        ? reasons.length > 1
          ? 'since :\n' + reasons.map(renderReason).join('\n')
          : ' ' + renderReason(reasons[0])
        : 'as no adapter specified';

      throw new AxiosError(
        `There is no suitable adapter to dispatch the request ` + s,
        'ERR_NOT_SUPPORT'
      );
    }

    return adapter;
  }

  /**
   * Exports Axios adapters and utility to resolve an adapter
   */
  var adapters = {
    /**
     * Resolve an adapter from a list of adapter names or functions.
     * @type {Function}
     */
    getAdapter,

    /**
     * Exposes all known adapters
     * @type {Object<string, Function|Object>}
     */
    adapters: knownAdapters,
  };

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   *
   * @param {Object} config The config that is to be used for the request
   *
   * @returns {void}
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (config.signal && config.signal.aborted) {
      throw new CanceledError(null, config);
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    config.headers = AxiosHeaders.from(config.headers);

    // Transform request data
    config.data = transformData.call(config, config.transformRequest);

    if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
      config.headers.setContentType('application/x-www-form-urlencoded', false);
    }

    const adapter = adapters.getAdapter(config.adapter || defaults.adapter, config);

    return adapter(config).then(
      function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(config, config.transformResponse, response);

        response.headers = AxiosHeaders.from(response.headers);

        return response;
      },
      function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders.from(reason.response.headers);
          }
        }

        return Promise.reject(reason);
      }
    );
  }

  const VERSION = "1.14.0";

  const validators$1 = {};

  // eslint-disable-next-line func-names
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
    validators$1[type] = function validator(thing) {
      return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
  });

  const deprecatedWarnings = {};

  /**
   * Transitional option validator
   *
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   *
   * @returns {function}
   */
  validators$1.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return (
        '[Axios v' +
        VERSION +
        "] Transitional option '" +
        opt +
        "'" +
        desc +
        (message ? '. ' + message : '')
      );
    }

    // eslint-disable-next-line func-names
    return (value, opt, opts) => {
      if (validator === false) {
        throw new AxiosError(
          formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
          AxiosError.ERR_DEPRECATED
        );
      }

      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        // eslint-disable-next-line no-console
        console.warn(
          formatMessage(
            opt,
            ' has been deprecated since v' + version + ' and will be removed in the near future'
          )
        );
      }

      return validator ? validator(value, opt, opts) : true;
    };
  };

  validators$1.spelling = function spelling(correctSpelling) {
    return (value, opt) => {
      // eslint-disable-next-line no-console
      console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
      return true;
    };
  };

  /**
   * Assert object's properties type
   *
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   *
   * @returns {object}
   */

  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
      throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
    }
    const keys = Object.keys(options);
    let i = keys.length;
    while (i-- > 0) {
      const opt = keys[i];
      const validator = schema[opt];
      if (validator) {
        const value = options[opt];
        const result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError(
            'option ' + opt + ' must be ' + result,
            AxiosError.ERR_BAD_OPTION_VALUE
          );
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
      }
    }
  }

  var validator = {
    assertOptions,
    validators: validators$1,
  };

  const validators = validator.validators;

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   *
   * @return {Axios} A new instance of Axios
   */
  class Axios {
    constructor(instanceConfig) {
      this.defaults = instanceConfig || {};
      this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager(),
      };
    }

    /**
     * Dispatch a request
     *
     * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
     * @param {?Object} config
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    async request(configOrUrl, config) {
      try {
        return await this._request(configOrUrl, config);
      } catch (err) {
        if (err instanceof Error) {
          let dummy = {};

          Error.captureStackTrace ? Error.captureStackTrace(dummy) : (dummy = new Error());

          // slice off the Error: ... line
          const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, '') : '';
          try {
            if (!err.stack) {
              err.stack = stack;
              // match without the 2 top stack lines
            } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ''))) {
              err.stack += '\n' + stack;
            }
          } catch (e) {
            // ignore the case where "stack" is an un-writable property
          }
        }

        throw err;
      }
    }

    _request(configOrUrl, config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof configOrUrl === 'string') {
        config = config || {};
        config.url = configOrUrl;
      } else {
        config = configOrUrl || {};
      }

      config = mergeConfig(this.defaults, config);

      const { transitional, paramsSerializer, headers } = config;

      if (transitional !== undefined) {
        validator.assertOptions(
          transitional,
          {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean),
            legacyInterceptorReqResOrdering: validators.transitional(validators.boolean),
          },
          false
        );
      }

      if (paramsSerializer != null) {
        if (utils$1.isFunction(paramsSerializer)) {
          config.paramsSerializer = {
            serialize: paramsSerializer,
          };
        } else {
          validator.assertOptions(
            paramsSerializer,
            {
              encode: validators.function,
              serialize: validators.function,
            },
            true
          );
        }
      }

      // Set config.allowAbsoluteUrls
      if (config.allowAbsoluteUrls !== undefined) ; else if (this.defaults.allowAbsoluteUrls !== undefined) {
        config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
      } else {
        config.allowAbsoluteUrls = true;
      }

      validator.assertOptions(
        config,
        {
          baseUrl: validators.spelling('baseURL'),
          withXsrfToken: validators.spelling('withXSRFToken'),
        },
        true
      );

      // Set config.method
      config.method = (config.method || this.defaults.method || 'get').toLowerCase();

      // Flatten headers
      let contextHeaders = headers && utils$1.merge(headers.common, headers[config.method]);

      headers &&
        utils$1.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], (method) => {
          delete headers[method];
        });

      config.headers = AxiosHeaders.concat(contextHeaders, headers);

      // filter out skipped interceptors
      const requestInterceptorChain = [];
      let synchronousRequestInterceptors = true;
      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
          return;
        }

        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

        const transitional = config.transitional || transitionalDefaults;
        const legacyInterceptorReqResOrdering =
          transitional && transitional.legacyInterceptorReqResOrdering;

        if (legacyInterceptorReqResOrdering) {
          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        } else {
          requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        }
      });

      const responseInterceptorChain = [];
      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
      });

      let promise;
      let i = 0;
      let len;

      if (!synchronousRequestInterceptors) {
        const chain = [dispatchRequest.bind(this), undefined];
        chain.unshift(...requestInterceptorChain);
        chain.push(...responseInterceptorChain);
        len = chain.length;

        promise = Promise.resolve(config);

        while (i < len) {
          promise = promise.then(chain[i++], chain[i++]);
        }

        return promise;
      }

      len = requestInterceptorChain.length;

      let newConfig = config;

      while (i < len) {
        const onFulfilled = requestInterceptorChain[i++];
        const onRejected = requestInterceptorChain[i++];
        try {
          newConfig = onFulfilled(newConfig);
        } catch (error) {
          onRejected.call(this, error);
          break;
        }
      }

      try {
        promise = dispatchRequest.call(this, newConfig);
      } catch (error) {
        return Promise.reject(error);
      }

      i = 0;
      len = responseInterceptorChain.length;

      while (i < len) {
        promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
      }

      return promise;
    }

    getUri(config) {
      config = mergeConfig(this.defaults, config);
      const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
      return buildURL(fullPath, config.params, config.paramsSerializer);
    }
  }

  // Provide aliases for supported request methods
  utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function (url, config) {
      return this.request(
        mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data,
        })
      );
    };
  });

  utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        return this.request(
          mergeConfig(config || {}, {
            method,
            headers: isForm
              ? {
                  'Content-Type': 'multipart/form-data',
                }
              : {},
            url,
            data,
          })
        );
      };
    }

    Axios.prototype[method] = generateHTTPMethod();

    Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
  });

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @param {Function} executor The executor function.
   *
   * @returns {CancelToken}
   */
  class CancelToken {
    constructor(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      let resolvePromise;

      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      const token = this;

      // eslint-disable-next-line func-names
      this.promise.then((cancel) => {
        if (!token._listeners) return;

        let i = token._listeners.length;

        while (i-- > 0) {
          token._listeners[i](cancel);
        }
        token._listeners = null;
      });

      // eslint-disable-next-line func-names
      this.promise.then = (onfulfilled) => {
        let _resolve;
        // eslint-disable-next-line func-names
        const promise = new Promise((resolve) => {
          token.subscribe(resolve);
          _resolve = resolve;
        }).then(onfulfilled);

        promise.cancel = function reject() {
          token.unsubscribe(_resolve);
        };

        return promise;
      };

      executor(function cancel(message, config, request) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new CanceledError(message, config, request);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     */
    throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    }

    /**
     * Subscribe to the cancel signal
     */

    subscribe(listener) {
      if (this.reason) {
        listener(this.reason);
        return;
      }

      if (this._listeners) {
        this._listeners.push(listener);
      } else {
        this._listeners = [listener];
      }
    }

    /**
     * Unsubscribe from the cancel signal
     */

    unsubscribe(listener) {
      if (!this._listeners) {
        return;
      }
      const index = this._listeners.indexOf(listener);
      if (index !== -1) {
        this._listeners.splice(index, 1);
      }
    }

    toAbortSignal() {
      const controller = new AbortController();

      const abort = (err) => {
        controller.abort(err);
      };

      this.subscribe(abort);

      controller.signal.unsubscribe = () => this.unsubscribe(abort);

      return controller.signal;
    }

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    static source() {
      let cancel;
      const token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token,
        cancel,
      };
    }
  }

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  const args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   *
   * @returns {Function}
   */
  function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  }

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   *
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  function isAxiosError(payload) {
    return utils$1.isObject(payload) && payload.isAxiosError === true;
  }

  const HttpStatusCode = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
    WebServerIsDown: 521,
    ConnectionTimedOut: 522,
    OriginIsUnreachable: 523,
    TimeoutOccurred: 524,
    SslHandshakeFailed: 525,
    InvalidSslCertificate: 526,
  };

  Object.entries(HttpStatusCode).forEach(([key, value]) => {
    HttpStatusCode[value] = key;
  });

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   *
   * @returns {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    const context = new Axios(defaultConfig);
    const instance = bind$1(Axios.prototype.request, context);

    // Copy axios.prototype to instance
    utils$1.extend(instance, Axios.prototype, context, { allOwnKeys: true });

    // Copy context to instance
    utils$1.extend(instance, context, null, { allOwnKeys: true });

    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };

    return instance;
  }

  // Create the default instance to be exported
  const axios = createInstance(defaults);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios;

  // Expose Cancel & CancelToken
  axios.CanceledError = CanceledError;
  axios.CancelToken = CancelToken;
  axios.isCancel = isCancel;
  axios.VERSION = VERSION;
  axios.toFormData = toFormData;

  // Expose AxiosError class
  axios.AxiosError = AxiosError;

  // alias for CanceledError for backward compatibility
  axios.Cancel = axios.CanceledError;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };

  axios.spread = spread;

  // Expose isAxiosError
  axios.isAxiosError = isAxiosError;

  // Expose mergeConfig
  axios.mergeConfig = mergeConfig;

  axios.AxiosHeaders = AxiosHeaders;

  axios.formToJSON = (thing) => formDataToJSON(utils$1.isHTMLForm(thing) ? new FormData(thing) : thing);

  axios.getAdapter = adapters.getAdapter;

  axios.HttpStatusCode = HttpStatusCode;

  axios.default = axios;

  // Handle both default and named exports
  var axiosInstance = axios.default || axios;
  /**
   * Vue's integrated HTTP client based on Axios
   * This provides convenient HTTP methods directly on Vue instances
   */
  // Create default axios instance (for user requests - uses baseURL)
  var httpInstance = axiosInstance.create();
  // Create separate axios instance for component loading (NO baseURL)
  var componentInstance = axiosInstance.create();
  /**
   * Initialize HTTP client with default config
   * Called automatically when Vue is initialized
   */
  function initHttpClient() {
      // Set initial defaults
      if (config.axiosBaseURL) {
          httpInstance.defaults.baseURL = config.axiosBaseURL;
      }
      if (config.axiosTimeout) {
          httpInstance.defaults.timeout = config.axiosTimeout;
      }
      if (config.axiosHeaders) {
          Object.assign(httpInstance.defaults.headers.common, config.axiosHeaders);
      }
      if (config.axiosToken) {
          httpInstance.defaults.headers.common['Authorization'] = "Bearer ".concat(config.axiosToken);
      }
      // Add request interceptor for DYNAMIC config updates
      httpInstance.interceptors.request.use(function (requestConfig) {
          // Dynamically apply baseURL from config (allows changing it after Vue init)
          if (config.axiosBaseURL && !requestConfig.baseURL) {
              requestConfig.baseURL = config.axiosBaseURL;
          }
          // Dynamically apply token
          if (config.axiosToken && !requestConfig.headers['Authorization']) {
              requestConfig.headers['Authorization'] = "Bearer ".concat(config.axiosToken);
          }
          // Apply custom headers if provided in config
          if (config.axiosHeaders) {
              Object.assign(requestConfig.headers, config.axiosHeaders);
          }
          // Call custom request interceptor if defined
          if (config.axiosRequestInterceptor) {
              return config.axiosRequestInterceptor(requestConfig);
          }
          return requestConfig;
      }, function (error) {
          if (config.axiosRequestErrorInterceptor) {
              return config.axiosRequestErrorInterceptor(error);
          }
          return Promise.reject(error);
      });
      // Add response interceptor
      httpInstance.interceptors.response.use(function (response) {
          if (config.axiosResponseInterceptor) {
              return config.axiosResponseInterceptor(response);
          }
          return response;
      }, function (error) {
          if (config.axiosResponseErrorInterceptor) {
              return config.axiosResponseErrorInterceptor(error);
          }
          return Promise.reject(error);
      });
  }
  /**
   * Get the axios instance for user requests (uses baseURL)
   */
  function getHttpClient() {
      return httpInstance;
  }
  /**
   * Get the axios instance for component loading (NO baseURL)
   */
  function getComponentHttpClient() {
      return componentInstance;
  }
  /**
   * HTTP Methods for Vue instance
   * These methods will be added to Vue.prototype
   */
  /**
   * Make a GET request
   * @param url - Request URL
   * @param config - Axios request config
   */
  function httpGet(url, config) {
      return httpInstance.get(url, config);
  }
  /**
   * Make a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request config
   */
  function httpPost(url, data, config) {
      return httpInstance.post(url, data, config);
  }
  /**
   * Make a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request config
   */
  function httpPut(url, data, config) {
      return httpInstance.put(url, data, config);
  }
  /**
   * Make a PATCH request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Axios request config
   */
  function httpPatch(url, data, config) {
      return httpInstance.patch(url, data, config);
  }
  /**
   * Make a DELETE request
   * @param url - Request URL
   * @param config - Axios request config
   */
  function httpDelete(url, config) {
      return httpInstance.delete(url, config);
  }
  /**
   * Make a HEAD request
   * @param url - Request URL
   * @param config - Axios request config
   */
  function httpHead(url, config) {
      return httpInstance.head(url, config);
  }
  /**
   * Make an OPTIONS request
   * @param url - Request URL
   * @param config - Axios request config
   */
  function httpOptions(url, config) {
      return httpInstance.options(url, config);
  }
  /**
   * Make a POST request with form data
   * @param url - Request URL
   * @param data - Form data
   * @param config - Axios request config
   */
  function httpPostForm(url, data, config) {
      var formData = new FormData();
      if (data) {
          Object.keys(data).forEach(function (key) {
              formData.append(key, data[key]);
          });
      }
      return httpInstance.post(url, formData, __assign(__assign({}, config), { headers: __assign({ 'Content-Type': 'multipart/form-data' }, ((config === null || config === void 0 ? void 0 : config.headers) || {})) }));
  }
  /**
   * Make a PUT request with form data
   * @param url - Request URL
   * @param data - Form data
   * @param config - Axios request config
   */
  function httpPutForm(url, data, config) {
      var formData = new FormData();
      if (data) {
          Object.keys(data).forEach(function (key) {
              formData.append(key, data[key]);
          });
      }
      return httpInstance.put(url, formData, __assign(__assign({}, config), { headers: __assign({ 'Content-Type': 'multipart/form-data' }, ((config === null || config === void 0 ? void 0 : config.headers) || {})) }));
  }
  /**
   * Make a PATCH request with form data
   * @param url - Request URL
   * @param data - Form data
   * @param config - Axios request config
   */
  function httpPatchForm(url, data, config) {
      var formData = new FormData();
      if (data) {
          Object.keys(data).forEach(function (key) {
              formData.append(key, data[key]);
          });
      }
      return httpInstance.patch(url, formData, __assign(__assign({}, config), { headers: __assign({ 'Content-Type': 'multipart/form-data' }, ((config === null || config === void 0 ? void 0 : config.headers) || {})) }));
  }
  /**
   * Make a custom request
   * @param requestConfig - Full axios request config
   */
  function httpRequest(requestConfig) {
      return httpInstance(requestConfig);
  }
  /**
   * Add a request interceptor
   * @param onFulfilled - Success callback
   * @param onRejected - Error callback
   */
  function addRequestInterceptor(onFulfilled, onRejected) {
      return httpInstance.interceptors.request.use(onFulfilled, onRejected);
  }
  /**
   * Add a response interceptor
   * @param onFulfilled - Success callback
   * @param onRejected - Error callback
   */
  function addResponseInterceptor(onFulfilled, onRejected) {
      return httpInstance.interceptors.response.use(onFulfilled, onRejected);
  }
  /**
   * Remove an interceptor
   * @param type - Interceptor type (request or response)
   * @param id - Interceptor ID
   */
  function removeInterceptor(type, id) {
      if (type === 'request') {
          httpInstance.interceptors.request.eject(id);
      }
      else {
          httpInstance.interceptors.response.eject(id);
      }
  }

  // Specialized HTTP GET for components (NO baseURL)
  function getComponentHttp(url) {
      return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
              return [2 /*return*/, getComponentHttpClient().get(url)];
          });
      });
  }
  /**
   * Initialize async components on component instance
   * Called automatically when component is created
   */
  function initAsyncComponents(vm) {
      return __awaiter(this, void 0, void 0, function () {
          var asyncComponents, promises, componentsToBatch, _i, asyncComponents_1, item, name_1, path, options, segments, batchPaths;
          return __generator(this, function (_a) {
              switch (_a.label) {
                  case 0:
                      asyncComponents = vm.$options.asyncComponents;
                      if (!asyncComponents || !Array.isArray(asyncComponents)) {
                          return [2 /*return*/];
                      }
                      // If component has loadingTemplate, set $loading to true
                      if (vm.$options.loadingTemplate) {
                          vm.$loading = true;
                          debugLog("[initAsyncComponents] Set $loading=true for: ".concat(vm.$options.name || 'anonymous'));
                      }
                      debugLog("[initAsyncComponents] Initializing ".concat(asyncComponents.length, " async components for: ").concat(vm.$options.name || 'anonymous'));
                      promises = [];
                      componentsToBatch = [];
                      // Process each async component
                      for (_i = 0, asyncComponents_1 = asyncComponents; _i < asyncComponents_1.length; _i++) {
                          item = asyncComponents_1[_i];
                          name_1 = void 0;
                          path = void 0;
                          options = {};
                          // Handle string format: '/path/to/component-name' -> name is last segment
                          if (typeof item === 'string') {
                              path = item;
                              segments = path.split('/').filter(Boolean);
                              name_1 = segments[segments.length - 1].replace(/\.(tpl|vue|html)$/, '');
                          }
                          else if (typeof item === 'object') {
                              if (!item.name || !item.path) {
                                  warn$2('[initAsyncComponents] Each async component must have "name" and "path" properties');
                                  continue;
                              }
                              name_1 = item.name;
                              path = item.path;
                              options = item;
                          }
                          else {
                              warn$2('[initAsyncComponents] Invalid async component format');
                              continue;
                          }
                          if (hasDynamicComponent(name_1)) {
                              debugLog("[initAsyncComponents] \u23ED\uFE0F Skipped (already loaded): ".concat(name_1));
                              continue;
                          }
                          if (config.serverSide && config.serverSideURL) {
                              componentsToBatch.push({ name: name_1, path: path, options: options });
                          }
                          else {
                              promises.push(loadSingleAsyncComponent(name_1, path, options));
                          }
                      }
                      // Handle batching if serverSide is enabled
                      if (componentsToBatch.length > 0) {
                          batchPaths = componentsToBatch.map(function (c) { return c.path; });
                          debugLog("[initAsyncComponents] \uD83D\uDCE6 Batching ".concat(batchPaths.length, " components via SSR Bundler"));
                          promises.push(fetchBundledComponents(batchPaths));
                      }
                      if (!(promises.length > 0)) return [3 /*break*/, 6];
                      _a.label = 1;
                  case 1:
                      _a.trys.push([1, 3, 4, 5]);
                      return [4 /*yield*/, Promise.all(promises)];
                  case 2:
                      _a.sent();
                      debugLog("[initAsyncComponents] All async components loaded for: ".concat(vm.$options.name || 'anonymous'));
                      return [3 /*break*/, 5];
                  case 3:
                      _a.sent();
                      warn$2("[initAsyncComponents] One or more async components failed to load");
                      return [3 /*break*/, 5];
                  case 4:
                      if (vm.$loading) {
                          vm.$loading = false;
                      }
                      return [7 /*endfinally*/];
                  case 5: return [3 /*break*/, 7];
                  case 6:
                      if (vm.$loading) {
                          vm.$loading = false;
                      }
                      _a.label = 7;
                  case 7: return [2 /*return*/];
              }
          });
      });
  }
  /**
   * Parse component file yang berisi:
   * <script> module.exports = { ... } </script>
   * <template> ... </template>
   * <style> ... </style>
   */
  function parseComponentFile$1(content) {
      var result = {
          script: '',
          template: '',
          loadingTemplate: '',
          style: ''
      };
      // Extract <script> content
      var scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch && scriptMatch[1]) {
          result.script = scriptMatch[1].trim();
      }
      // Extract <template scope="loading"> content
      var loadingTemplateMatch = content.match(/<template\s+[^>]*scope=["']loading["'][^>]*>([\s\S]*?)<\/template>/i);
      if (loadingTemplateMatch) {
          result.loadingTemplate = loadingTemplateMatch[1].trim();
          // Remove the loading template from content to avoid it being picked up as the main template
          content = content.replace(loadingTemplateMatch[0], '');
      }
      // Extract <template> content (Robust nested matching)
      var templateStartMatch = content.match(/<template[^>]*>/i);
      if (templateStartMatch && typeof templateStartMatch.index === 'number') {
          var startIdx = templateStartMatch.index;
          var contentAfterStart = content.slice(startIdx + templateStartMatch[0].length);
          // Find the matching </template> by counting depth
          var depth = 1;
          var tagRegex = /<\/?template[^>]*>/gi;
          var match = void 0;
          while ((match = tagRegex.exec(contentAfterStart)) !== null) {
              if (match[0].toLowerCase().startsWith('</template')) {
                  depth--;
              }
              else {
                  depth++;
              }
              if (depth === 0) {
                  result.template = contentAfterStart.slice(0, match.index).trim();
                  break;
              }
          }
          // Fallback if balancing fails
          if (depth !== 0) {
              var fallbackMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
              if (fallbackMatch)
                  result.template = fallbackMatch[1].trim();
          }
      }
      // Extract <style> content
      var styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch && styleMatch[1]) {
          result.style = styleMatch[1].trim();
      }
      return result;
  }
  /**
   * Evaluate script content and extract component definition
   * Supports both:
   *   module.exports = { ... }  (CommonJS)
   *   export default { ... }     (ES Module)
   */
  function evaluateScript(scriptContent) {
      try {
          // Create a safe evaluation context
          var module_1 = { exports: {} };
          var exports_1 = module_1.exports;
          var result 
          // Check if script uses ES module export default pattern
          = void 0;
          // Check if script uses ES module export default pattern
          var hasExportDefault = /\bexport\s+default\b/.test(scriptContent);
          if (hasExportDefault) {
              // ES Module: rewrite export default → module.exports
              // Handles: export default { ... }, export default function ..., export default class ...
              var transformedScript = scriptContent
                  .replace(/\bexport\s+default\b/g, 'module.exports =')
                  .replace(/\bexport\s+const\b/g, 'const')
                  .replace(/\bexport\s+let\b/g, 'let')
                  .replace(/\bexport\s+var\b/g, 'var')
                  .replace(/\bexport\s+function\b/g, 'function')
                  .replace(/\bexport\s+class\b/g, 'class');
              var wrappedScript_1 = "(function(module, exports) {\n        ".concat(transformedScript, "\n      })");
              var fn_1 = eval(wrappedScript_1);
              fn_1(module_1, exports_1);
              return module_1.exports || {};
          }
          // CommonJS: module.exports = { ... }
          var wrappedScript = "(function(module, exports) {\n      ".concat(scriptContent, "\n    })");
          var fn = eval(wrappedScript);
          fn(module_1, exports_1);
          return module_1.exports || (typeof result === 'object' ? result : {});
      }
      catch (error) {
          warn$2("Failed to evaluate component script: ".concat(error));
          return {};
      }
  }
  /**
   * Fetch and register a dynamic component from server
   *
   * @param name - Component name
   * @param pathOrOptions - Path to component file or options object
   * @param optionsOrFallback - Options object or fallback component name
   */
  function fetchDynamicComponent(name, pathOrOptions, optionsOrFallback) {
      return __awaiter(this, void 0, void 0, function () {
          var componentName, path, options, configObj, extension, basePath, fullPath, response, content, result, script, template, style, loadingTemplate, componentDef, styleId, styleEl, error_2, fallbackName;
          return __generator(this, function (_a) {
              switch (_a.label) {
                  case 0:
                      options = {};
                      // Handle jika parameter pertama adalah object
                      if (typeof name === 'object' && name !== null) {
                          configObj = name;
                          componentName = configObj.name || '';
                          path = configObj.path || "/".concat(componentName).concat(config.componentExtension || '.tpl');
                          options = configObj;
                      }
                      else if (typeof name === 'string') {
                          // Parameter pertama adalah string name
                          componentName = name;
                          // Handle parameter kedua
                          if (typeof pathOrOptions === 'string') {
                              path = pathOrOptions;
                              options = typeof optionsOrFallback === 'string'
                                  ? { fallbackComponent: optionsOrFallback }
                                  : (optionsOrFallback || {});
                          }
                          else if (typeof pathOrOptions === 'object') {
                              path = pathOrOptions.path || "/".concat(name).concat(config.componentExtension || '.tpl');
                              options = pathOrOptions;
                          }
                          else {
                              path = "/".concat(name).concat(config.componentExtension || '.tpl');
                              options = {};
                          }
                      }
                      else {
                          warn$2('[fetchDynamicComponent] Invalid parameters');
                          return [2 /*return*/, false];
                      }
                      // Validate component name
                      if (!componentName) {
                          warn$2('[fetchDynamicComponent] Component name is required');
                          return [2 /*return*/, false];
                      }
                      extension = config.componentExtension || '.tpl';
                      // Tambahkan extension ke path jika belum ada
                      // Cek apakah path sudah berakhiran dengan extension
                      if (!path.endsWith(extension)) {
                          path = path + extension;
                      }
                      basePath = config.componentPath || '/components';
                      fullPath = path.startsWith('/') ? "".concat(basePath).concat(path) : "".concat(basePath, "/").concat(path);
                      debugLog("[fetchDynamicComponent] Component: ".concat(componentName));
                      debugLog("[fetchDynamicComponent] Fetching: ".concat(fullPath));
                      debugLog("[fetchDynamicComponent] Config - basePath: ".concat(basePath, ", extension: ").concat(extension));
                      debugLog("[fetchDynamicComponent] Final path with extension: ".concat(path));
                      _a.label = 1;
                  case 1:
                      _a.trys.push([1, 3, , 4]);
                      return [4 /*yield*/, getComponentHttp(fullPath)];
                  case 2:
                      response = _a.sent();
                      content = response.data;
                      result = parseComponentFile$1(content);
                      script = result.script, template = result.template, style = result.style, loadingTemplate = result.loadingTemplate;
                      componentDef = evaluateScript(script);
                      // Inject styles directly into head if exists
                      if (style) {
                          styleId = "style-".concat(componentName);
                          styleEl = document.getElementById(styleId);
                          if (!styleEl) {
                              styleEl = document.createElement('style');
                              styleEl.id = styleId;
                              document.head.appendChild(styleEl);
                          }
                          styleEl.textContent = style;
                          debugLog("[fetchDynamicComponent] Style injected for: ".concat(componentName));
                      }
                      // Set template if exists
                      if (template) {
                          componentDef.template = template;
                      }
                      // Set loading template if exists
                      if (loadingTemplate) {
                          componentDef.loadingTemplate = loadingTemplate;
                      }
                      // Register component globally
                      defineDynamicComponent(componentName, componentDef);
                      debugLog("[fetchDynamicComponent] \u2705 Registered: ".concat(componentName));
                      // Call onSuccess callback if provided
                      if (options.onSuccess) {
                          options.onSuccess(componentName, componentDef);
                      }
                      return [2 /*return*/, true];
                  case 3:
                      error_2 = _a.sent();
                      warn$2("[fetchDynamicComponent] Failed to load component \"".concat(componentName, "\" from ").concat(fullPath, ": ").concat(error_2.message));
                      fallbackName = options.fallbackComponent || config.componentFallback || 'component-notfound';
                      debugLog("[fetchDynamicComponent] Using fallback: ".concat(fallbackName));
                      // Check if fallback exists
                      if (hasDynamicComponent(fallbackName)) {
                          // Fallback already registered, just use it
                          debugLog("[fetchDynamicComponent] \u2705 Fallback available: ".concat(fallbackName));
                      }
                      else {
                          // Create default fallback component
                          defineDynamicComponent(fallbackName, {
                              template: "<div class=\"vue-component-notfound\">\n          <p style=\"color: #999; padding: 20px; border: 1px dashed #ccc; border-radius: 4px;\">\n            Component \"<strong>".concat(componentName, "</strong>\" not found\n          </p>\n        </div>")
                          });
                          debugLog("[fetchDynamicComponent] \u2705 Created default fallback: ".concat(fallbackName));
                      }
                      // Call onError callback if provided
                      if (options.onError) {
                          options.onError(componentName, error_2);
                      }
                      return [2 /*return*/, false];
                  case 4: return [2 /*return*/];
              }
          });
      });
  }
  /**
   * Fetch and register multiple dynamic components
   */
  function fetchDynamicComponents(components) {
      return __awaiter(this, void 0, void 0, function () {
          var successCount, _i, components_1, comp, success;
          return __generator(this, function (_a) {
              switch (_a.label) {
                  case 0:
                      successCount = 0;
                      _i = 0, components_1 = components;
                      _a.label = 1;
                  case 1:
                      if (!(_i < components_1.length)) return [3 /*break*/, 4];
                      comp = components_1[_i];
                      return [4 /*yield*/, fetchDynamicComponent(comp.name, comp.path)];
                  case 2:
                      success = _a.sent();
                      if (success) {
                          successCount++;
                      }
                      _a.label = 3;
                  case 3:
                      _i++;
                      return [3 /*break*/, 1];
                  case 4:
                      debugLog("[fetchDynamicComponents] Loaded ".concat(successCount, "/").concat(components.length, " components"));
                      return [2 /*return*/, successCount];
              }
          });
      });
  }
  /**
   * Load async component from custom path
   * Similar to fetchDynamicComponent but with full path control
   * Does NOT use config.componentPath - you have full control
   * BUT still uses config.componentExtension for auto-append
   *
   * Same parameter format as fetchDynamicComponent
   *
   * @param nameOrComponents - Component name (string) OR component object OR array of objects
   * @param pathOrOptions - Path (if nameOrComponents is string) OR options object
   * @param optionsOrFallback - Additional options or fallback component name
   *
   * @example
   * // Single component - String path
   * await this.loadAsyncComponent('my-comp', '/custom/path/component')
   *
   * // Single component - With options
   * await this.loadAsyncComponent('my-comp', '/custom/path/component', {
   *   extension: '.vue',
   *   fallbackComponent: 'notfound',
   *   onSuccess: (name, def) => console.log('Loaded:', name),
   *   onError: (name, error) => console.error('Failed:', name, error)
   * })
   *
   * // Single component - Object format
   * await this.loadAsyncComponent({
   *   name: 'my-comp',
   *   path: '/custom/path/component',
   *   extension: '.vue',
   *   fallbackComponent: 'notfound',
   *   onSuccess: (name, def) => console.log('Loaded:', name),
   *   onError: (name, error) => console.error('Failed:', name, error)
   * })
   *
   * // Multiple components - Array of objects
   * await this.loadAsyncComponent([
   *   { name: 'header', path: '/layout/header' },
   *   { name: 'footer', path: '/layout/footer', extension: '.vue' }
   * ])
   */
  function loadAsyncComponent(nameOrComponents, pathOrOptions, optionsOrFallback) {
      return __awaiter(this, void 0, void 0, function () {
          var name, path, options, obj;
          return __generator(this, function (_a) {
              // Handle array - multiple components
              if (Array.isArray(nameOrComponents)) {
                  return [2 /*return*/, loadMultipleAsyncComponents(nameOrComponents)];
              }
              options = {};
              if (typeof nameOrComponents === 'object' && nameOrComponents !== null) {
                  obj = nameOrComponents;
                  if (!obj.name || !obj.path) {
                      warn$2('[loadAsyncComponent] "name" and "path" are required in options object');
                      return [2 /*return*/, false];
                  }
                  name = obj.name;
                  path = obj.path;
                  options = obj;
              }
              else if (typeof nameOrComponents === 'string') {
                  // String format
                  name = nameOrComponents;
                  if (typeof pathOrOptions === 'string') {
                      path = pathOrOptions;
                      options = typeof optionsOrFallback === 'string'
                          ? { fallbackComponent: optionsOrFallback }
                          : (optionsOrFallback || {});
                  }
                  else if (typeof pathOrOptions === 'object') {
                      path = pathOrOptions.path || "/".concat(name).concat(options.extension || config.componentExtension || '.tpl');
                      options = pathOrOptions;
                  }
                  else {
                      path = "/".concat(name).concat(config.componentExtension || '.tpl');
                  }
              }
              else {
                  warn$2('[loadAsyncComponent] Invalid parameters');
                  return [2 /*return*/, false];
              }
              // Check if component is already registered
              if (hasDynamicComponent(name)) {
                  debugLog("[loadAsyncComponent] \u23ED\uFE0F Skipped (already loaded): ".concat(name));
                  return [2 /*return*/, true];
              }
              // If serverSide is enabled, use bundling even for single component
              if (config.serverSide && config.serverSideURL) {
                  debugLog("[loadAsyncComponent] \uD83D\uDCE6 Routing single component \"".concat(name, "\" via SSR Bundler"));
                  return [2 /*return*/, loadMultipleAsyncComponents([__assign({ name: name, path: path }, options)])];
              }
              return [2 /*return*/, loadSingleAsyncComponent(name, path, options)];
          });
      });
  }
  /**
   * Load single async component
   */
  function loadSingleAsyncComponent(name, path, options) {
      if (options === void 0) { options = {}; }
      return __awaiter(this, void 0, void 0, function () {
          var fullPath, shouldAppendExtension, ext, pathLen, extLen, hasExtension, pathEnd, response, content, result, script, template, style, loadingTemplate, componentDef, styleId, styleEl, error_3, fallbackName;
          return __generator(this, function (_a) {
              switch (_a.label) {
                  case 0:
                      // Validate inputs
                      if (!name) {
                          warn$2('[loadAsyncComponent] Component name is required');
                          return [2 /*return*/, false];
                      }
                      if (!path || typeof path !== 'string') {
                          warn$2('[loadAsyncComponent] Path must be a string');
                          return [2 /*return*/, false];
                      }
                      fullPath = path;
                      shouldAppendExtension = options.autoAppendExtension !== false;
                      if (shouldAppendExtension) {
                          ext = (options.extension || config.componentExtension || '.tpl');
                          pathLen = fullPath.length;
                          extLen = ext.length;
                          hasExtension = false;
                          if (pathLen >= extLen) {
                              pathEnd = fullPath.slice(pathLen - extLen);
                              hasExtension = (pathEnd === ext);
                          }
                          if (!hasExtension) {
                              fullPath = fullPath + ext;
                              debugLog('[loadAsyncComponent] Auto-appended extension: ' + ext);
                          }
                      }
                      debugLog('[loadAsyncComponent] Component: ' + name);
                      debugLog('[loadAsyncComponent] Original path: ' + path);
                      debugLog('[loadAsyncComponent] Full path: ' + fullPath);
                      _a.label = 1;
                  case 1:
                      _a.trys.push([1, 3, , 4]);
                      return [4 /*yield*/, getComponentHttp(fullPath)];
                  case 2:
                      response = _a.sent();
                      content = response.data;
                      result = parseComponentFile$1(content);
                      script = result.script, template = result.template, style = result.style, loadingTemplate = result.loadingTemplate;
                      componentDef = evaluateScript(script);
                      // Inject styles directly into head if exists
                      if (style) {
                          styleId = "style-".concat(name);
                          styleEl = document.getElementById(styleId);
                          if (!styleEl) {
                              styleEl = document.createElement('style');
                              styleEl.id = styleId;
                              document.head.appendChild(styleEl);
                          }
                          styleEl.textContent = style;
                          debugLog("[loadAsyncComponent] Style injected for: ".concat(name));
                      }
                      // Set template if exists
                      if (template) {
                          componentDef.template = template;
                      }
                      // Set loading template if exists
                      if (loadingTemplate) {
                          componentDef.loadingTemplate = loadingTemplate;
                      }
                      // Register component globally
                      defineDynamicComponent(name, componentDef);
                      debugLog('[loadAsyncComponent] ✅ Registered: ' + name);
                      // Call onSuccess callback if provided
                      if (options.onSuccess) {
                          options.onSuccess(name, componentDef);
                      }
                      return [2 /*return*/, true];
                  case 3:
                      error_3 = _a.sent();
                      warn$2('[loadAsyncComponent] Failed to load "' + name + '" from ' + fullPath + ': ' + error_3.message);
                      fallbackName = options.fallbackComponent || config.componentFallback || 'component-notfound';
                      debugLog('[loadAsyncComponent] Using fallback: ' + fallbackName);
                      // Check if fallback exists
                      if (hasDynamicComponent(fallbackName)) {
                          debugLog('[loadAsyncComponent] ✅ Fallback available: ' + fallbackName);
                      }
                      else {
                          // Create default fallback component
                          defineDynamicComponent(fallbackName, {
                              template: '<div class="vue-component-notfound">' +
                                  '<p style="color: #999; padding: 20px; border: 1px dashed #ccc; border-radius: 4px;">' +
                                  'Component "<strong>' + name + '</strong>" not found' +
                                  '</p></div>'
                          });
                          debugLog('[loadAsyncComponent] ✅ Created default fallback: ' + fallbackName);
                      }
                      // Call onError callback if provided
                      if (options.onError) {
                          options.onError(name, error_3);
                      }
                      return [2 /*return*/, false];
                  case 4: return [2 /*return*/];
              }
          });
      });
  }
  /**
   * Load multiple async components
   */
  function loadMultipleAsyncComponents(components) {
      return __awaiter(this, void 0, void 0, function () {
          var componentsToLoad, _i, components_2, comp, paths, success, successCount, _a, componentsToLoad_1, comp, success;
          return __generator(this, function (_b) {
              switch (_b.label) {
                  case 0:
                      componentsToLoad = [];
                      // Filter out already loaded components
                      for (_i = 0, components_2 = components; _i < components_2.length; _i++) {
                          comp = components_2[_i];
                          if (!comp.name || !comp.path) {
                              warn$2('[loadAsyncComponent] Each component must have "name" and "path" properties');
                              continue;
                          }
                          if (!hasDynamicComponent(comp.name)) {
                              componentsToLoad.push(comp);
                          }
                      }
                      if (componentsToLoad.length === 0) {
                          return [2 /*return*/, 0];
                      }
                      if (!(config.serverSide && config.serverSideURL)) return [3 /*break*/, 2];
                      paths = componentsToLoad.map(function (c) { return c.path; });
                      debugLog("[loadAsyncComponent] \uD83D\uDCE6 Batching ".concat(paths.length, " components via SSR Bundler"));
                      return [4 /*yield*/, fetchBundledComponents(paths)];
                  case 1:
                      success = _b.sent();
                      return [2 /*return*/, success ? componentsToLoad.length : 0];
                  case 2:
                      successCount = 0;
                      _a = 0, componentsToLoad_1 = componentsToLoad;
                      _b.label = 3;
                  case 3:
                      if (!(_a < componentsToLoad_1.length)) return [3 /*break*/, 6];
                      comp = componentsToLoad_1[_a];
                      return [4 /*yield*/, loadSingleAsyncComponent(comp.name, comp.path, comp)];
                  case 4:
                      success = _b.sent();
                      if (success) {
                          successCount++;
                      }
                      _b.label = 5;
                  case 5:
                      _a++;
                      return [3 /*break*/, 3];
                  case 6:
                      debugLog('[loadAsyncComponent] Loaded ' + successCount + '/' + components.length + ' components');
                      return [2 /*return*/, successCount];
              }
          });
      });
  }
  /**
   * Fetch multiple components as a single JS bundle from SSR Bundler
   */
  function fetchBundledComponents(paths) {
      return __awaiter(this, void 0, void 0, function () {
          var response, bundleJS, script, bundleId_1, error_4;
          return __generator(this, function (_a) {
              switch (_a.label) {
                  case 0:
                      if (!paths || paths.length === 0)
                          return [2 /*return*/, true];
                      if (!config.serverSideURL)
                          return [2 /*return*/, false];
                      _a.label = 1;
                  case 1:
                      _a.trys.push([1, 4, , 5]);
                      debugLog("[fetchBundledComponents] Requesting bundle for:", paths);
                      return [4 /*yield*/, fetch(config.serverSideURL, {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ components: paths })
                          })];
                  case 2:
                      response = _a.sent();
                      if (!response.ok) {
                          throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                      }
                      return [4 /*yield*/, response.text()
                          // Inject and execute the bundle script
                      ];
                  case 3:
                      bundleJS = _a.sent();
                      script = document.createElement('script');
                      bundleId_1 = "ssr-bundle-".concat(Date.now());
                      script.id = bundleId_1;
                      // Add sourceURL for better debugging in DevTools
                      script.textContent = bundleJS + "\n//# sourceURL=ssr-bundle.js";
                      document.head.appendChild(script);
                      // Clean up script tag after execution
                      setTimeout(function () {
                          var el = document.getElementById(bundleId_1);
                          if (el && el.parentNode) {
                              el.parentNode.removeChild(el);
                          }
                      }, 100);
                      debugLog("[fetchBundledComponents] \u2705 Bundle executed successfully");
                      return [2 /*return*/, true];
                  case 4:
                      error_4 = _a.sent();
                      warn$2("[fetchBundledComponents] \u274C Failed to load bundle: ".concat(error_4.message));
                      return [2 /*return*/, false];
                  case 5: return [2 /*return*/];
              }
          });
      });
  }

  /**
   * Vue 2 Built-in Hooks / Composables Helpers
   * Similar to VueUse but integrated into Vue 2 prototype
   */
  /**
   * Initialize hooks option
   */
  function initHooks(vm) {
      var hooks = vm.$options.hooks;
      if (typeof hooks === 'function') {
          // Execute hooks with component context
          hooks.call(vm);
      }
      else if (Array.isArray(hooks)) {
          hooks.forEach(function (hook) {
              hook.call(vm);
          });
      }
  }
  /**
   * Helper: Patch lifecycle hook safely
   */
  function patchLifecycleHook(vm, hookName, callback) {
      var existing = vm.$options[hookName];
      if (!existing) {
          vm.$options[hookName] = [callback];
      }
      else if (Array.isArray(existing)) {
          existing.push(callback);
      }
      else {
          // If it's a single function, convert to array
          vm.$options[hookName] = [existing, callback];
      }
  }
  /**
   * Install Hooks Plugin
   */
  function installHooks(Vue) {
      // 1. onClickOutside
      Vue.prototype.onClickOutside = function (refName, handler) {
          var _this = this;
          debugLog("[Hooks] Registering onClickOutside for ref: ".concat(refName));
          // We must wait for mounted because $refs are only available then
          patchLifecycleHook(this, 'mounted', function () {
              debugLog("[Hooks] mounted hook triggered for onClickOutside: ".concat(refName));
              var ref = _this.$refs[refName];
              if (!ref) {
                  warn$2("[Hooks] Ref \"".concat(refName, "\" not found for onClickOutside in component: ").concat(_this.$options.name || 'root'));
                  return;
              }
              var el = ref.$el || ref;
              debugLog("[Hooks] Element found for ref \"".concat(refName, "\":"), el);
              var listener = function (e) {
                  // If element is removed or not in document, don't trigger
                  if (!el || !document.contains(el))
                      return;
                  // Check if click was outside the element and its children
                  if (el !== e.target && !el.contains(e.target)) {
                      debugLog("[Hooks] Click detected outside \"".concat(refName, "\", triggering handler"));
                      handler.call(_this, e);
                  }
              };
              document.addEventListener('click', listener);
              debugLog("[Hooks] Click listener attached for \"".concat(refName, "\" (immediate)"));
              patchLifecycleHook(_this, 'beforeDestroy', function () {
                  document.removeEventListener('click', listener);
                  debugLog("[Hooks] Click listener removed for \"".concat(refName, "\""));
              });
          });
      };
      // 2. onWindowResize
      Vue.prototype.onWindowResize = function (handler, options) {
          var _this = this;
          var listener = function () { return handler.call(_this); };
          window.addEventListener('resize', listener);
          if (options === null || options === void 0 ? void 0 : options.immediate) {
              handler.call(this);
          }
          patchLifecycleHook(this, 'beforeDestroy', function () {
              window.removeEventListener('resize', listener);
          });
      };
      // 3. onScroll
      Vue.prototype.onScroll = function (selector, handler) {
          var _this = this;
          this.$nextTick(function () {
              var target = null;
              if (typeof selector === 'string') {
                  target = document.querySelector(selector);
              }
              else {
                  target = selector;
              }
              if (!target) {
                  warn$2("[Hooks] Scroll target not found: ".concat(selector));
                  return;
              }
              var listener = function (e) { return handler.call(_this, e); };
              target.addEventListener('scroll', listener);
              patchLifecycleHook(_this, 'beforeDestroy', function () {
                  target.removeEventListener('scroll', listener);
              });
          });
      };
      // 4. onKeyPress
      Vue.prototype.onKeyPress = function (key, handler) {
          var _this = this;
          var listener = function (e) {
              if (e.key === key || e.code === key) {
                  handler.call(_this, e);
              }
          };
          window.addEventListener('keydown', listener);
          patchLifecycleHook(this, 'beforeDestroy', function () {
              window.removeEventListener('keydown', listener);
          });
      };
      // 5. onEscape (Shorthand for onKeyPress)
      Vue.prototype.onEscape = function (handler) {
          this.onKeyPress('Escape', handler);
      };
      // 6. useDebounce (Returns debounced function)
      Vue.prototype.useDebounce = function (fn, delay) {
          if (delay === void 0) { delay = 300; }
          var timeout;
          return function () {
              var _this = this;
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              clearTimeout(timeout);
              timeout = setTimeout(function () { return fn.apply(_this, args); }, delay);
          };
      };
      // 7. useThrottle (Returns throttled function)
      Vue.prototype.useThrottle = function (fn, delay) {
          if (delay === void 0) { delay = 300; }
          var lastCall = 0;
          return function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              var now = Date.now();
              if (now - lastCall >= delay) {
                  lastCall = now;
                  return fn.apply(this, args);
              }
          };
      };
  }

  /**
   * Native RTC Driver for PDS Vue Core
   * Implements Pusher/Reverb protocol over native WebSockets
   */
  var RTCDriver = /** @class */ (function () {
      function RTCDriver() {
          this.socket = null;
          this.state = null;
          this.channels = {};
          this.eventListeners = {};
          this.reconnectAttempts = 0;
          this.maxReconnectAttempts = 10;
          this.pingInterval = null;
          this.internalListeners = {};
          this.initAttempts = 0;
          this.initialized = false;
          var globalVue = (typeof window !== 'undefined') ? window.Vue : null;
          if (globalVue && globalVue.observable) {
              this.state = globalVue.observable({
                  status: 'disconnected',
                  socketId: null
              });
          }
          else {
              this.state = {
                  status: 'disconnected',
                  socketId: null
              };
          }
      }
      RTCDriver.prototype.init = function () {
          var _this = this;
          var _a;
          if (this.initialized)
              return;
          // Ambil Vue secara global untuk memastikan referensi config sinkron
          var globalVue = (typeof window !== 'undefined') ? window.Vue : null;
          var socketConfig = ((_a = globalVue === null || globalVue === void 0 ? void 0 : globalVue.config) === null || _a === void 0 ? void 0 : _a.socket) || config.socket;
          if (socketConfig && socketConfig.enabled) {
              this.initialized = true;
              debugLog('[RTC] Socket enabled detected! Connecting to:', socketConfig.host);
              this.connect();
          }
          else if (this.initAttempts < 40) { // Coba selama 20 detik
              this.initAttempts++;
              setTimeout(function () { return _this.init(); }, 500);
          }
      };
      /**
       * Listen to internal RTC events (connected, disconnected, error, status)
       */
      RTCDriver.prototype.on = function (event, callback) {
          if (!this.internalListeners[event])
              this.internalListeners[event] = [];
          this.internalListeners[event].push(callback);
          return this;
      };
      RTCDriver.prototype.emit = function (event) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              args[_i - 1] = arguments[_i];
          }
          if (this.internalListeners[event]) {
              this.internalListeners[event].forEach(function (cb) { return cb.apply(void 0, args); });
          }
          // Also emit to window for legacy support
          if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent("rtc:".concat(event), { detail: args[0] }));
          }
      };
      RTCDriver.prototype.getSocketConfig = function () {
          var _a;
          var globalVue = (typeof window !== 'undefined') ? window.Vue : null;
          return ((_a = globalVue === null || globalVue === void 0 ? void 0 : globalVue.config) === null || _a === void 0 ? void 0 : _a.socket) || config.socket;
      };
      RTCDriver.prototype.connect = function () {
          if (this.state.status === 'connected' || this.state.status === 'connecting')
              return;
          // 1. Cek apakah sudah ada socket aktif di instance ini atau di window
          var existingSocket = this.socket || window.__PDS_RTC_WS_INSTANCE__;
          if (existingSocket) {
              if (existingSocket.readyState === WebSocket.OPEN || existingSocket.readyState === WebSocket.CONNECTING) {
                  debugLog('[RTC] Connection already active or connecting. Skipping.');
                  return;
              }
              // Jika ada tapi tertutup, bersihkan
              this.socket = null;
              window.__PDS_RTC_WS_INSTANCE__ = null;
          }
          var socketConfig = this.getSocketConfig();
          if (!socketConfig || !socketConfig.host)
              return;
          var protocol = socketConfig.encrypted ? 'wss' : 'ws';
          var port = socketConfig.port ? ":".concat(socketConfig.port) : '';
          var key = socketConfig.key;
          var version = '8.4.0-rc2';
          var url = "".concat(protocol, "://").concat(socketConfig.host).concat(port, "/app/").concat(key, "?protocol=7&client=js&version=").concat(version, "&flash=false");
          debugLog("[RTC] Connecting to ".concat(url, "..."));
          this.updateStatus('connecting');
          try {
              this.socket = new WebSocket(url);
              window.__PDS_RTC_WS_INSTANCE__ = this.socket;
              this.setupSocketListeners();
          }
          catch (e) {
              console.error('[RTC] Connection failed', e);
              this.handleReconnect();
          }
      };
      RTCDriver.prototype.updateStatus = function (newStatus) {
          this.state.status = newStatus;
          this.emit('status', newStatus);
          if (newStatus === 'connected')
              this.emit('connected', { socketId: this.state.socketId });
          if (newStatus === 'disconnected')
              this.emit('disconnected');
      };
      RTCDriver.prototype.setupSocketListeners = function () {
          var _this = this;
          if (!this.socket)
              return;
          this.socket.onopen = function () {
              debugLog('[RTC] WebSocket Opened, waiting for connection_established...');
              _this.reconnectAttempts = 0;
              _this.startPing();
          };
          this.socket.onmessage = function (event) {
              var data = JSON.parse(event.data);
              _this.handleMessage(data);
          };
          this.socket.onclose = function () {
              _this.updateStatus('disconnected');
              _this.stopPing();
              _this.handleReconnect();
          };
          this.socket.onerror = function (error) {
              console.error('[RTC] WebSocket Error', error);
              _this.emit('error', error);
          };
      };
      RTCDriver.prototype.handleMessage = function (data) {
          var _this = this;
          var _a;
          if (data.event === 'pusher:connection_established') {
              var content = JSON.parse(data.data);
              this.state.socketId = content.socket_id;
              debugLog("[RTC] Connection Established. Socket ID: ".concat(this.state.socketId));
              this.updateStatus('connected');
              // Re-subscribe HANYA setelah socketId siap
              Object.keys(this.channels).forEach(function (channelName) {
                  _this.authenticateChannel(channelName);
              });
          }
          else if (data.event === 'pusher:ping') {
              this.send('pusher:pong');
          }
          // Handle Presence Events
          if (data.event === 'pusher_internal:subscription_succeeded' && ((_a = data.channel) === null || _a === void 0 ? void 0 : _a.startsWith('presence-'))) {
              try {
                  var presenceData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                  if (presenceData.presence) {
                      var users = Object.values(presenceData.presence.hash).map(function (u) {
                          if (u && u.id !== undefined)
                              u.id = String(u.id);
                          return u;
                      });
                      debugLog("[RTC] Presence: ".concat(data.channel, " - ").concat(users.length, " users online"));
                      this.emit("presence:".concat(data.channel, ":here"), users);
                  }
              }
              catch (e) {
                  console.error('[RTC] Gagal parse presence here data', e);
              }
          }
          else if (data.event === 'pusher_internal:member_added' || data.event === 'member_added') {
              try {
                  var member = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                  var userInfo = __assign({}, (member.user_info || member.info || member));
                  var userId = member.user_id || userInfo.id;
                  if (userId !== undefined)
                      userInfo.id = String(userId);
                  debugLog("[RTC] Presence: User joining ".concat(data.channel), userInfo);
                  this.emit("presence:".concat(data.channel, ":joining"), userInfo);
              }
              catch (e) {
                  console.error('[RTC] Gagal parse presence joining data', e);
              }
          }
          else if (data.event === 'pusher_internal:member_removed' || data.event === 'member_removed') {
              try {
                  var member = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
                  var userInfo = __assign({}, (member.user_info || member.info || member));
                  var userId = member.user_id || userInfo.id;
                  if (userId !== undefined)
                      userInfo.id = String(userId);
                  debugLog("[RTC] Presence: User leaving ".concat(data.channel), userInfo);
                  this.emit("presence:".concat(data.channel, ":leaving"), userInfo);
              }
              catch (e) {
                  console.error('[RTC] Gagal parse presence leaving data', e);
              }
          }
          if (data.channel && this.eventListeners[data.channel]) {
              var eventName = data.event;
              if (this.eventListeners[data.channel][eventName]) {
                  try {
                      var payload_1 = typeof data.data === 'string' ? JSON.parse(data.data) : (data.data || {});
                      this.eventListeners[data.channel][eventName].forEach(function (cb) { return cb(payload_1); });
                  }
                  catch (e) {
                      console.error("[RTC] Gagal parse event payload untuk ".concat(eventName), e);
                  }
              }
          }
      };
      RTCDriver.prototype.handleReconnect = function () {
          var _this = this;
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.reconnectAttempts++;
              var delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
              debugLog("[RTC] Reconnecting in ".concat(delay, "ms (Attempt ").concat(this.reconnectAttempts, ")"));
              setTimeout(function () { return _this.connect(); }, delay);
          }
      };
      RTCDriver.prototype.startPing = function () {
          var _this = this;
          this.stopPing();
          this.pingInterval = setInterval(function () {
              _this.send('pusher:ping', {});
          }, 15000);
      };
      RTCDriver.prototype.stopPing = function () {
          if (this.pingInterval) {
              clearInterval(this.pingInterval);
              this.pingInterval = null;
          }
      };
      RTCDriver.prototype.send = function (event, data, channel) {
          if (data === void 0) { data = {}; }
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
              var payload = { event: event, data: data };
              if (channel)
                  payload.channel = channel;
              this.socket.send(JSON.stringify(payload));
          }
      };
      RTCDriver.prototype.channel = function (name) {
          var _this = this;
          var channelName = name;
          // Jangan double prefix jika sudah ada
          if (name.startsWith('private-') || name.startsWith('presence-')) {
              channelName = name;
          }
          if (!this.channels[channelName]) {
              this.channels[channelName] = true;
              if (this.state.status === 'connected' && this.state.socketId) {
                  this.sendSubscribe(channelName);
              }
          }
          var channelObj = {
              listen: function (event, callback) {
                  // Normalisasi event name (hapus titik di depan)
                  var normalizedEvent = event.startsWith('.') ? event.substring(1) : event;
                  if (!_this.eventListeners[channelName])
                      _this.eventListeners[channelName] = {};
                  if (!_this.eventListeners[channelName][normalizedEvent])
                      _this.eventListeners[channelName][normalizedEvent] = [];
                  _this.eventListeners[channelName][normalizedEvent].push(callback);
                  return channelObj;
              },
              stopListening: function (event, callback) {
                  if (_this.eventListeners[name] && _this.eventListeners[name][event]) {
                      if (callback) {
                          _this.eventListeners[name][event] = _this.eventListeners[name][event].filter(function (cb) { return cb !== callback; });
                      }
                      else {
                          delete _this.eventListeners[name][event];
                      }
                  }
                  return channelObj;
              },
              whisper: function (event, data) {
                  _this.send("client-".concat(event), data, name);
                  return channelObj;
              },
              listenForWhisper: function (event, callback) {
                  return channelObj.listen("client-".concat(event), callback);
              },
              error: function (callback) {
                  _this.on('error', callback);
                  return channelObj;
              }
          };
          return channelObj;
      };
      RTCDriver.prototype.join = function (name) {
          var _this = this;
          var presenceName = name;
          if (!name.startsWith('presence-')) {
              presenceName = "presence-".concat(name);
          }
          var channel = this.channel(presenceName);
          var presenceObj = __assign(__assign({}, channel), { here: function (callback) {
                  _this.on("presence:".concat(presenceName, ":here"), callback);
                  return presenceObj;
              }, joining: function (callback) {
                  _this.on("presence:".concat(presenceName, ":joining"), callback);
                  return presenceObj;
              }, leaving: function (callback) {
                  _this.on("presence:".concat(presenceName, ":leaving"), callback);
                  return presenceObj;
              }, error: function (callback) {
                  _this.on('error', callback);
                  return presenceObj;
              } });
          return presenceObj;
      };
      RTCDriver.prototype.leave = function (name) {
          var targetName = name;
          // Cari nama channel yang cocok (dengan atau tanpa prefix)
          if (!this.channels[targetName]) {
              if (this.channels["private-".concat(name)])
                  targetName = "private-".concat(name);
              else if (this.channels["presence-".concat(name)])
                  targetName = "presence-".concat(name);
          }
          if (this.channels[targetName]) {
              delete this.channels[targetName];
              delete this.eventListeners[targetName];
              this.sendUnsubscribe(targetName);
          }
          else {
              debugLog("[RTC] Warning: Attempted to leave channel ".concat(name, " but it was not subscribed."));
          }
      };
      RTCDriver.prototype.sendUnsubscribe = function (channelName) {
          debugLog("[RTC] Unsubscribing from channel: ".concat(channelName));
          this.send('pusher:unsubscribe', { channel: channelName });
      };
      RTCDriver.prototype.sendSubscribe = function (channelName) {
          if (channelName.startsWith('private-') || channelName.startsWith('presence-')) {
              this.authenticateChannel(channelName);
          }
          else {
              debugLog("[RTC] Subscribing to public channel: ".concat(channelName));
              this.send('pusher:subscribe', { channel: channelName });
          }
      };
      RTCDriver.prototype.authenticateChannel = function (channelName) {
          var _a;
          return __awaiter(this, void 0, void 0, function () {
              var globalVue, socketConfig, authEndpoint, response, authData, e_1;
              return __generator(this, function (_b) {
                  switch (_b.label) {
                      case 0:
                          if (!this.state.socketId) {
                              debugLog("[RTC] Delaying auth for ".concat(channelName, ", socketId not ready"));
                              return [2 /*return*/];
                          }
                          _b.label = 1;
                      case 1:
                          _b.trys.push([1, 3, , 4]);
                          globalVue = (typeof window !== 'undefined') ? window.Vue : null;
                          socketConfig = ((_a = globalVue === null || globalVue === void 0 ? void 0 : globalVue.config) === null || _a === void 0 ? void 0 : _a.socket) || config.socket;
                          authEndpoint = socketConfig.authEndpoint || '/broadcasting/auth';
                          debugLog("[RTC] Authenticating ".concat(channelName, "..."));
                          return [4 /*yield*/, httpPost(authEndpoint, {
                                  socket_id: this.state.socketId,
                                  channel_name: channelName
                              })
                              // Axios returns data in .data
                          ];
                      case 2:
                          response = _b.sent();
                          authData = response.data || response;
                          debugLog("[RTC] Authenticated ".concat(channelName));
                          this.send('pusher:subscribe', {
                              channel: channelName,
                              auth: authData.auth,
                              channel_data: authData.channel_data
                          });
                          return [3 /*break*/, 4];
                      case 3:
                          e_1 = _b.sent();
                          console.error("[RTC] Authentication failed for ".concat(channelName), e_1);
                          return [3 /*break*/, 4];
                      case 4: return [2 /*return*/];
                  }
              });
          });
      };
      RTCDriver.prototype.getStatus = function () {
          return this.state.status;
      };
      RTCDriver.prototype.getSocketId = function () {
          return this.state.socketId;
      };
      return RTCDriver;
  }());
  function getRtcClient() {
      var global = (typeof window !== 'undefined') ? window : {};
      if (!global.__PDS_RTC_INSTANCE__) {
          global.__PDS_RTC_INSTANCE__ = new RTCDriver();
      }
      return global.__PDS_RTC_INSTANCE__;
  }
  function initRtcClient() {
      var global = (typeof window !== 'undefined') ? window : {};
      if (global.__PDS_RTC_INIT_STARTED__)
          return;
      global.__PDS_RTC_INIT_STARTED__ = true;
      var rtc = getRtcClient();
      debugLog('[RTC] Native Driver Initialized');
      rtc.init();
      if (typeof window !== 'undefined') {
          global.HelperRTC = rtc;
      }
  }

  /**
   * Initialize RTC methods on Vue prototype
   * This provides convenient Real-time methods directly on Vue instances
   */
  function initRtc(Vue) {
      var rtc = getRtcClient();
      // Make the state reactive
      var reactiveState = Vue.observable(rtc.state);
      rtc.state = reactiveState; // Replace with reactive version
      /**
       * Get the global RTC client
       */
      Vue.prototype.$rtc = rtc;
      /**
       * Subscribe to a channel and listen for an event
       * Shortcut for this.$rtc.channel(name).listen(event, callback)
       * @param channel - Channel name
       * @param event - Event name
       * @param callback - Event handler
       */
      Vue.prototype.$listen = function (channel, event, callback) {
          return getRtcClient().channel(channel).listen(event, callback);
      };
      /**
       * Access a channel
       * @param name - Channel name
       */
      Vue.prototype.$channel = function (name) {
          return getRtcClient().channel(name);
      };
      /**
       * Access a private channel
       * @param name - Channel name
       */
      Vue.prototype.$private = function (name) {
          var privateName = name.startsWith('private-') ? name : "private-".concat(name);
          return getRtcClient().channel(privateName);
      };
      /**
       * Join a presence channel
       * @param name - Channel name
       */
      Vue.prototype.$join = function (name) {
          return getRtcClient().join(name);
      };
      /**
       * Leave a channel
       * @param name - Channel name
       */
      Vue.prototype.$leave = function (name) {
          return getRtcClient().leave(name);
      };
      /**
       * Laravel Echo Compatibility Alias
       */
      Vue.prototype.$echo = {
          channel: function (name) { return getRtcClient().channel(name); },
          private: function (name) {
              var privateName = name.startsWith('private-') ? name : "private-".concat(name);
              return getRtcClient().channel(privateName);
          },
          join: function (name) { return getRtcClient().join(name); },
          leave: function (name) { return getRtcClient().leave(name); }
      };
  }
  /**
   * Initialize rtc option in components
   * This allows defining rtc listeners in a dedicated 'rtc' block
   */
  function initRtcOptions(vm) {
      var rtc = vm.$options.rtc;
      if (typeof rtc === 'function') {
          rtc.call(vm);
      }
      else if (Array.isArray(rtc)) {
          rtc.forEach(function (fn) {
              fn.call(vm);
          });
      }
  }

  var uid = 0;
  function initMixin$1(Vue) {
      Vue.prototype._init = function (options) {
          var vm = this;
          // a uid
          vm._uid = uid++;
          var startTag, endTag;
          /* istanbul ignore if */
          if (config.performance && mark) {
              startTag = "vue-perf-start:".concat(vm._uid);
              endTag = "vue-perf-end:".concat(vm._uid);
              mark(startTag);
          }
          // a flag to mark this as a Vue instance without having to do instanceof
          // check
          vm._isVue = true;
          // avoid instances from being observed
          vm.__v_skip = true;
          // effect scope
          vm._scope = new EffectScope(true /* detached */);
          // #13134 edge case where a child component is manually created during the
          // render of a parent component
          vm._scope.parent = undefined;
          vm._scope._vm = true;
          // merge options
          if (options && options._isComponent) {
              // optimize internal component instantiation
              // since dynamic options merging is pretty slow, and none of the
              // internal component options needs special treatment.
              initInternalComponent(vm, options);
          }
          else {
              vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
          }
          /* istanbul ignore else */
          {
              initProxy(vm);
          }
          // expose real self
          vm._self = vm;
          // Initialize store if provided (BEFORE hooks and state)
          if (vm.$options.store) {
              vm.$store = vm.$options.store;
          }
          else if (config.store) {
              // Use global store if no store provided in options
              if (!Vue._globalStore) {
                  Vue._globalStore = createStore(config.store);
              }
              vm.$store = Vue._globalStore;
          }
          initLifecycle(vm);
          initEvents(vm);
          initRender(vm);
          callHook$1(vm, 'beforeCreate', undefined, false /* setContext */);
          initInjections(vm); // resolve injections before data/props
          initState(vm);
          initProvide(vm); // resolve provide after data/props
          // Initialize hooks (this will run the hooks function with 'this' context)
          initHooks(vm);
          // Initialize RTC options (this will run the rtc function with 'this' context)
          initRtcOptions(vm);
          callHook$1(vm, 'created');
          // Initialize async components if defined
          initAsyncComponents(vm);
          /* istanbul ignore if */
          if (config.performance && mark) {
              vm._name = formatComponentName(vm, false);
              mark(endTag);
              measure("vue ".concat(vm._name, " init"), startTag, endTag);
          }
          if (vm.$options.el) {
              vm.$mount(vm.$options.el);
          }
          // Register this instance for dynamic component updates
          registerVueInstance(vm);
      };
  }
  function initInternalComponent(vm, options) {
      var opts = (vm.$options = Object.create(vm.constructor.options));
      // doing this because it's faster than dynamic enumeration.
      var parentVnode = options._parentVnode;
      opts.parent = options.parent;
      opts._parentVnode = parentVnode;
      var vnodeComponentOptions = parentVnode.componentOptions;
      opts.propsData = vnodeComponentOptions.propsData;
      opts._parentListeners = vnodeComponentOptions.listeners;
      opts._renderChildren = vnodeComponentOptions.children;
      opts._componentTag = vnodeComponentOptions.tag;
      if (options.render) {
          opts.render = options.render;
          opts.staticRenderFns = options.staticRenderFns;
      }
  }
  function resolveConstructorOptions(Ctor) {
      var options = Ctor.options;
      if (Ctor.super) {
          var superOptions = resolveConstructorOptions(Ctor.super);
          var cachedSuperOptions = Ctor.superOptions;
          if (superOptions !== cachedSuperOptions) {
              // super option changed,
              // need to resolve new options.
              Ctor.superOptions = superOptions;
              // check if there are any late-modified/attached options (#4976)
              var modifiedOptions = resolveModifiedOptions(Ctor);
              // update base extend options
              if (modifiedOptions) {
                  extend$1(Ctor.extendOptions, modifiedOptions);
              }
              options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
              if (options.name) {
                  options.components[options.name] = Ctor;
              }
          }
      }
      return options;
  }
  function resolveModifiedOptions(Ctor) {
      var modified;
      var latest = Ctor.options;
      var sealed = Ctor.sealedOptions;
      for (var key in latest) {
          if (latest[key] !== sealed[key]) {
              if (!modified)
                  modified = {};
              modified[key] = latest[key];
          }
      }
      return modified;
  }

  function FunctionalRenderContext(data, props, children, parent, Ctor) {
      var _this = this;
      var options = Ctor.options;
      // ensure the createElement function in functional components
      // gets a unique context - this is necessary for correct named slot check
      var contextVm;
      if (hasOwn(parent, '_uid')) {
          contextVm = Object.create(parent);
          contextVm._original = parent;
      }
      else {
          // the context vm passed in is a functional context as well.
          // in this case we want to make sure we are able to get a hold to the
          // real context instance.
          contextVm = parent;
          // @ts-ignore
          parent = parent._original;
      }
      var isCompiled = isTrue(options._compiled);
      var needNormalization = !isCompiled;
      this.data = data;
      this.props = props;
      this.children = children;
      this.parent = parent;
      this.listeners = data.on || emptyObject;
      this.injections = resolveInject(options.inject, parent);
      this.slots = function () {
          if (!_this.$slots) {
              normalizeScopedSlots(parent, data.scopedSlots, (_this.$slots = resolveSlots(children, parent)));
          }
          return _this.$slots;
      };
      Object.defineProperty(this, 'scopedSlots', {
          enumerable: true,
          get: function () {
              return normalizeScopedSlots(parent, data.scopedSlots, this.slots());
          }
      });
      // support for compiled functional template
      if (isCompiled) {
          // exposing $options for renderStatic()
          this.$options = options;
          // pre-resolve slots for renderSlot()
          this.$slots = this.slots();
          this.$scopedSlots = normalizeScopedSlots(parent, data.scopedSlots, this.$slots);
      }
      if (options._scopeId) {
          this._c = function (a, b, c, d) {
              var vnode = createElement$1(contextVm, a, b, c, d, needNormalization);
              if (vnode && !isArray$1(vnode)) {
                  vnode.fnScopeId = options._scopeId;
                  vnode.fnContext = parent;
              }
              return vnode;
          };
      }
      else {
          this._c = function (a, b, c, d) {
              return createElement$1(contextVm, a, b, c, d, needNormalization);
          };
      }
  }
  installRenderHelpers(FunctionalRenderContext.prototype);
  function createFunctionalComponent(Ctor, propsData, data, contextVm, children) {
      var options = Ctor.options;
      var props = {};
      var propOptions = options.props;
      if (isDef(propOptions)) {
          for (var key in propOptions) {
              props[key] = validateProp(key, propOptions, propsData || emptyObject);
          }
      }
      else {
          if (isDef(data.attrs))
              mergeProps(props, data.attrs);
          if (isDef(data.props))
              mergeProps(props, data.props);
      }
      var renderContext = new FunctionalRenderContext(data, props, children, contextVm, Ctor);
      var vnode = options.render.call(null, renderContext._c, renderContext);
      if (vnode instanceof VNode) {
          return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext);
      }
      else if (isArray$1(vnode)) {
          var vnodes = normalizeChildren(vnode) || [];
          var res = new Array(vnodes.length);
          for (var i = 0; i < vnodes.length; i++) {
              res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
          }
          return res;
      }
  }
  function cloneAndMarkFunctionalResult(vnode, data, contextVm, options, renderContext) {
      // #7817 clone node before setting fnContext, otherwise if the node is reused
      // (e.g. it was from a cached normal slot) the fnContext causes named slots
      // that should not be matched to match.
      var clone = cloneVNode(vnode);
      clone.fnContext = contextVm;
      clone.fnOptions = options;
      {
          (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext =
              renderContext;
      }
      if (data.slot) {
          (clone.data || (clone.data = {})).slot = data.slot;
      }
      return clone;
  }
  function mergeProps(to, from) {
      for (var key in from) {
          to[camelize(key)] = from[key];
      }
  }

  function getComponentName(options) {
      return options.name || options.__name || options._componentTag;
  }
  // inline hooks to be invoked on component VNodes during patch
  var componentVNodeHooks = {
      init: function (vnode, hydrating) {
          if (vnode.componentInstance &&
              !vnode.componentInstance._isDestroyed &&
              vnode.data.keepAlive) {
              // kept-alive components, treat as a patch
              var mountedNode = vnode; // work around flow
              componentVNodeHooks.prepatch(mountedNode, mountedNode);
          }
          else {
              var child = (vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance));
              child.$mount(hydrating ? vnode.elm : undefined, hydrating);
          }
      },
      prepatch: function (oldVnode, vnode) {
          var options = vnode.componentOptions;
          var child = (vnode.componentInstance = oldVnode.componentInstance);
          updateChildComponent(child, options.propsData, // updated props
          options.listeners, // updated listeners
          vnode, // new parent vnode
          options.children // new children
          );
      },
      insert: function (vnode) {
          var context = vnode.context, componentInstance = vnode.componentInstance;
          if (!componentInstance._isMounted) {
              componentInstance._isMounted = true;
              callHook$1(componentInstance, 'mounted');
          }
          if (vnode.data.keepAlive) {
              if (context._isMounted) {
                  // vue-router#1212
                  // During updates, a kept-alive component's child components may
                  // change, so directly walking the tree here may call activated hooks
                  // on incorrect children. Instead we push them into a queue which will
                  // be processed after the whole patch process ended.
                  queueActivatedComponent(componentInstance);
              }
              else {
                  activateChildComponent(componentInstance, true /* direct */);
              }
          }
      },
      destroy: function (vnode) {
          var componentInstance = vnode.componentInstance;
          if (!componentInstance._isDestroyed) {
              if (!vnode.data.keepAlive) {
                  componentInstance.$destroy();
              }
              else {
                  deactivateChildComponent(componentInstance, true /* direct */);
              }
          }
      }
  };
  var hooksToMerge = Object.keys(componentVNodeHooks);
  function createComponent(Ctor, data, context, children, tag) {
      if (isUndef(Ctor)) {
          return;
      }
      var baseCtor = context.$options._base;
      // plain options object: turn it into a constructor
      if (isObject$1(Ctor)) {
          Ctor = baseCtor.extend(Ctor);
      }
      // if at this stage it's not a constructor or an async component factory,
      // reject.
      if (typeof Ctor !== 'function') {
          {
              warn$2("Invalid Component definition: ".concat(String(Ctor)), context);
          }
          return;
      }
      // async component
      var asyncFactory;
      // @ts-expect-error
      if (isUndef(Ctor.cid)) {
          asyncFactory = Ctor;
          Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
          if (Ctor === undefined) {
              // return a placeholder node for async component, which is rendered
              // as a comment node but preserves all the raw information for the node.
              // the information will be used for async server-rendering and hydration.
              return createAsyncPlaceholder(asyncFactory, data, context, children, tag);
          }
      }
      data = data || {};
      // resolve constructor options in case global mixins are applied after
      // component constructor creation
      resolveConstructorOptions(Ctor);
      // transform component v-model data into props & events
      if (isDef(data.model)) {
          // @ts-expect-error
          transformModel(Ctor.options, data);
      }
      // XML Props Support (Odoo Style)
      var xmlProps = extractXmlProps(children);
      if (isDef(xmlProps)) {
          data.props = extend$1(data.props || {}, xmlProps);
      }
      // extract props
      // @ts-expect-error
      var propsData = extractPropsFromVNodeData(data, Ctor, tag);
      // functional component
      // @ts-expect-error
      if (isTrue(Ctor.options.functional)) {
          return createFunctionalComponent(Ctor, propsData, data, context, children);
      }
      // extract listeners, since these needs to be treated as
      // child component listeners instead of DOM listeners
      var listeners = data.on;
      // replace with listeners with .native modifier
      // so it gets processed during parent component patch.
      data.on = data.nativeOn;
      // @ts-expect-error
      if (isTrue(Ctor.options.abstract)) {
          // abstract components do not keep anything
          // other than props & listeners & slot
          // work around flow
          var slot = data.slot;
          data = {};
          if (slot) {
              data.slot = slot;
          }
      }
      // install component management hooks onto the placeholder node
      installComponentHooks(data);
      // return a placeholder vnode
      // @ts-expect-error
      var name = getComponentName(Ctor.options) || tag;
      var vnode = new VNode(
      // @ts-expect-error
      "vue-component-".concat(Ctor.cid).concat(name ? "-".concat(name) : ''), data, undefined, undefined, undefined, context, 
      // @ts-expect-error
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }, asyncFactory);
      return vnode;
  }
  function createComponentInstanceForVnode(
  // we know it's MountedComponentVNode but flow doesn't
  vnode, 
  // activeInstance in lifecycle state
  parent) {
      var options = {
          _isComponent: true,
          _parentVnode: vnode,
          parent: parent
      };
      // check inline-template render functions
      var inlineTemplate = vnode.data.inlineTemplate;
      if (isDef(inlineTemplate)) {
          options.render = inlineTemplate.render;
          options.staticRenderFns = inlineTemplate.staticRenderFns;
      }
      return new vnode.componentOptions.Ctor(options);
  }
  function installComponentHooks(data) {
      var hooks = data.hook || (data.hook = {});
      for (var i = 0; i < hooksToMerge.length; i++) {
          var key = hooksToMerge[i];
          var existing = hooks[key];
          var toMerge = componentVNodeHooks[key];
          // @ts-expect-error
          if (existing !== toMerge && !(existing && existing._merged)) {
              hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge;
          }
      }
  }
  function mergeHook(f1, f2) {
      var merged = function (a, b) {
          // flow complains about extra args which is why we use any
          f1(a, b);
          f2(a, b);
      };
      merged._merged = true;
      return merged;
  }
  // transform component v-model info (value and callback) into
  // prop and event handler respectively.
  function transformModel(options, data) {
      var prop = (options.model && options.model.prop) || 'value';
      var event = (options.model && options.model.event) || 'input';
      (data.attrs || (data.attrs = {}))[prop] = data.model.value;
      var on = data.on || (data.on = {});
      var existing = on[event];
      var callback = data.model.callback;
      if (isDef(existing)) {
          if (isArray$1(existing)
              ? existing.indexOf(callback) === -1
              : existing !== callback) {
              on[event] = [callback].concat(existing);
          }
      }
      else {
          on[event] = callback;
      }
  }

  var warn$2 = noop$1;
  var tip = noop$1;
  var generateComponentTrace; // work around flow check
  var formatComponentName;
  {
      var hasConsole_1 = typeof console !== 'undefined';
      var classifyRE_1 = /(?:^|[-_])(\w)/g;
      var classify_1 = function (str) {
          return str.replace(classifyRE_1, function (c) { return c.toUpperCase(); }).replace(/[-_]/g, '');
      };
      warn$2 = function (msg, vm) {
          if (vm === void 0) { vm = currentInstance; }
          var trace = vm ? generateComponentTrace(vm) : '';
          var componentName = vm ? formatComponentName(vm, false) : '';
          var nameLabel = componentName ? "[".concat(componentName.replace(/[<>]/g, ''), "]") : '';
          if (config.warnHandler) {
              config.warnHandler.call(null, msg, vm, trace);
          }
          else if (hasConsole_1 && !config.silent) {
              console.error("[Vue warn]".concat(nameLabel, ": ").concat(msg).concat(trace));
          }
      };
      tip = function (msg, vm) {
          if (hasConsole_1 && !config.silent) {
              console.warn("[Vue tip]: ".concat(msg) + (vm ? generateComponentTrace(vm) : ''));
          }
      };
      formatComponentName = function (vm, includeFile) {
          if (vm.$root === vm) {
              return '<Root>';
          }
          var options = isFunction$2(vm) && vm.cid != null
              ? vm.options
              : vm._isVue
                  ? vm.$options || vm.constructor.options
                  : vm;
          var name = getComponentName(options);
          var file = options.__file;
          if (!name && file) {
              var match = file.match(/([^/\\]+)\.vue$/);
              name = match && match[1];
          }
          return ((name ? "<".concat(classify_1(name), ">") : "<Anonymous>") +
              (file && includeFile !== false ? " at ".concat(file) : ''));
      };
      var repeat_1 = function (str, n) {
          var res = '';
          while (n) {
              if (n % 2 === 1)
                  res += str;
              if (n > 1)
                  str += str;
              n >>= 1;
          }
          return res;
      };
      generateComponentTrace = function (vm) {
          if (vm._isVue && vm.$parent) {
              var tree = [];
              var currentRecursiveSequence = 0;
              while (vm) {
                  if (tree.length > 0) {
                      var last = tree[tree.length - 1];
                      if (last.constructor === vm.constructor) {
                          currentRecursiveSequence++;
                          vm = vm.$parent;
                          continue;
                      }
                      else if (currentRecursiveSequence > 0) {
                          tree[tree.length - 1] = [last, currentRecursiveSequence];
                          currentRecursiveSequence = 0;
                      }
                  }
                  tree.push(vm);
                  vm = vm.$parent;
              }
              return ('\n\nfound in\n\n' +
                  tree
                      .map(function (vm, i) {
                      return "".concat(i === 0 ? '---> ' : repeat_1(' ', 5 + i * 2)).concat(isArray$1(vm)
                          ? "".concat(formatComponentName(vm[0]), "... (").concat(vm[1], " recursive calls)")
                          : formatComponentName(vm));
                  })
                      .join('\n'));
          }
          else {
              return "\n\n(found in ".concat(formatComponentName(vm), ")");
          }
      };
  }

  /**
   * Debug logger for dynamic components
   * Only logs when devtools is enabled
   */
  var debugLog = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      if (config.devtools) {
          console.log.apply(console, args);
      }
  };
  /**
   * Global registry for dynamically registered components
   * This allows components to be resolved even after Vue instance initialization
   */
  var dynamicComponents = Object.create(null);
  /**
   * Keep track of all Vue instances for automatic re-rendering
   */
  var vueInstances = [];
  /**
   * Whether to automatically re-render when dynamic components are registered
   * Set to false if you want manual control over re-rendering
   */
  var autoForceUpdate = true;
  /**
   * Register a component globally so it can be resolved even after Vue instance init
   * This is different from Vue.component() - it works even after Vue instance is initialized
   * @param name - Component name
   * @param component - Component definition
   * @param options - Optional configuration (forceUpdate: boolean)
   */
  function defineDynamicComponent(name, component, options) {
      if (options === void 0) { options = {}; }
      dynamicComponents[name] = component;
      // Also register camelized and PascalCase variations
      var camelized = camelize(name);
      var pascal = capitalize(camelized);
      dynamicComponents[camelized] = component;
      dynamicComponents[pascal] = component;
      // Determine if we should force update
      var shouldForceUpdate = options.forceUpdate !== undefined ? options.forceUpdate : autoForceUpdate;
      debugLog("[Vue.defineDynamicComponent] Registered \"".concat(name, "\", found ").concat(vueInstances.length, " instances"));
      // Only re-render instances that actually need this component
      // This is more efficient than broadcasting to all instances
      if (shouldForceUpdate) {
          vueInstances.forEach(function (vm, index) {
              debugLog("[Vue.defineDynamicComponent] Instance ".concat(index, ": $forceUpdate=").concat(!!vm.$forceUpdate, ", _watcher=").concat(!!vm._watcher));
              if (vm && vm.$forceUpdate) {
                  // Call forceUpdate directly without nextTick for immediate effect
                  vm.$forceUpdate();
              }
          });
      }
      else {
          debugLog('[Vue.defineDynamicComponent] Auto forceUpdate disabled, skipping');
      }
  }
  /**
   * Register a Vue instance for automatic re-rendering when dynamic components are added
   * @param vm - Vue instance
   */
  function registerVueInstance(vm) {
      if (vm && !vueInstances.includes(vm)) {
          vueInstances.push(vm);
          debugLog("[Vue.registerInstance] Instance registered, total: ".concat(vueInstances.length));
      }
  }
  /**
   * Unregister a Vue instance
   * @param vm - Vue instance
   */
  function unregisterVueInstance(vm) {
      var index = vueInstances.indexOf(vm);
      if (index > -1) {
          vueInstances.splice(index, 1);
      }
  }
  /**
   * Check if a component exists in the global dynamic registry
   * @param id - Component name
   */
  function hasDynamicComponent(id) {
      return hasOwn(dynamicComponents, id) ||
          hasOwn(dynamicComponents, camelize(id)) ||
          hasOwn(dynamicComponents, capitalize(camelize(id)));
  }
  /**
   * Get a component from the global dynamic registry
   * @param id - Component name
   */
  function getDynamicComponent(id) {
      if (hasOwn(dynamicComponents, id))
          return dynamicComponents[id];
      var camelized = camelize(id);
      if (hasOwn(dynamicComponents, camelized))
          return dynamicComponents[camelized];
      var pascal = capitalize(camelized);
      if (hasOwn(dynamicComponents, pascal))
          return dynamicComponents[pascal];
      return undefined;
  }
  /**
   * Option overwriting strategies are functions that handle
   * how to merge a parent option value and a child option
   * value into the final value.
   */
  var strats = config.optionMergeStrategies;
  /**
   * Options with restrictions
   */
  {
      strats.el = strats.propsData = function (parent, child, vm, key) {
          if (!vm) {
              warn$2("option \"".concat(key, "\" can only be used during instance ") +
                  'creation with the `new` keyword.');
          }
          return defaultStrat(parent, child);
      };
  }
  /**
   * Helper that recursively merges two data objects together.
   */
  function mergeData(to, from, recursive) {
      if (recursive === void 0) { recursive = true; }
      if (!from)
          return to;
      var key, toVal, fromVal;
      var keys = hasSymbol
          ? Reflect.ownKeys(from)
          : Object.keys(from);
      for (var i = 0; i < keys.length; i++) {
          key = keys[i];
          // in case the object is already observed...
          if (key === '__ob__')
              continue;
          toVal = to[key];
          fromVal = from[key];
          if (!recursive || !hasOwn(to, key)) {
              set(to, key, fromVal);
          }
          else if (toVal !== fromVal &&
              isPlainObject$1(toVal) &&
              isPlainObject$1(fromVal)) {
              mergeData(toVal, fromVal);
          }
      }
      return to;
  }
  /**
   * Data
   */
  function mergeDataOrFn(parentVal, childVal, vm) {
      if (!vm) {
          // in a Vue.extend merge, both should be functions
          if (!childVal) {
              return parentVal;
          }
          if (!parentVal) {
              return childVal;
          }
          // when parentVal & childVal are both present,
          // we need to return a function that returns the
          // merged result of both functions... no need to
          // check if parentVal is a function here because
          // it has to be a function to pass previous merges.
          return function mergedDataFn() {
              return mergeData(isFunction$2(childVal) ? childVal.call(this, this) : childVal, isFunction$2(parentVal) ? parentVal.call(this, this) : parentVal);
          };
      }
      else {
          return function mergedInstanceDataFn() {
              // instance merge
              var instanceData = isFunction$2(childVal)
                  ? childVal.call(vm, vm)
                  : childVal;
              var defaultData = isFunction$2(parentVal)
                  ? parentVal.call(vm, vm)
                  : parentVal;
              if (instanceData) {
                  return mergeData(instanceData, defaultData);
              }
              else {
                  return defaultData;
              }
          };
      }
  }
  strats.data = function (parentVal, childVal, vm) {
      if (!vm) {
          if (childVal && typeof childVal !== 'function') {
              warn$2('The "data" option should be a function ' +
                      'that returns a per-instance value in component ' +
                      'definitions.', vm);
              return parentVal;
          }
          return mergeDataOrFn(parentVal, childVal);
      }
      return mergeDataOrFn(parentVal, childVal, vm);
  };
  /**
   * Hooks and props are merged as arrays.
   */
  function mergeLifecycleHook(parentVal, childVal) {
      var res = childVal
          ? parentVal
              ? parentVal.concat(childVal)
              : isArray$1(childVal)
                  ? childVal
                  : [childVal]
          : parentVal;
      return res ? dedupeHooks(res) : res;
  }
  function dedupeHooks(hooks) {
      var res = [];
      for (var i = 0; i < hooks.length; i++) {
          if (res.indexOf(hooks[i]) === -1) {
              res.push(hooks[i]);
          }
      }
      return res;
  }
  LIFECYCLE_HOOKS.forEach(function (hook) {
      strats[hook] = mergeLifecycleHook;
  });
  /**
   * Assets
   *
   * When a vm is present (instance creation), we need to do
   * a three-way merge between constructor options, instance
   * options and parent options.
   */
  function mergeAssets(parentVal, childVal, vm, key) {
      var res = Object.create(parentVal || null);
      if (childVal) {
          assertObjectType(key, childVal, vm);
          return extend$1(res, childVal);
      }
      else {
          return res;
      }
  }
  ASSET_TYPES.forEach(function (type) {
      strats[type + 's'] = mergeAssets;
  });
  /**
   * Watchers.
   *
   * Watchers hashes should not overwrite one
   * another, so we merge them as arrays.
   */
  strats.watch = function (parentVal, childVal, vm, key) {
      // work around Firefox's Object.prototype.watch...
      //@ts-expect-error work around
      if (parentVal === nativeWatch)
          parentVal = undefined;
      //@ts-expect-error work around
      if (childVal === nativeWatch)
          childVal = undefined;
      /* istanbul ignore if */
      if (!childVal)
          return Object.create(parentVal || null);
      {
          assertObjectType(key, childVal, vm);
      }
      if (!parentVal)
          return childVal;
      var ret = {};
      extend$1(ret, parentVal);
      for (var key_1 in childVal) {
          var parent_1 = ret[key_1];
          var child = childVal[key_1];
          if (parent_1 && !isArray$1(parent_1)) {
              parent_1 = [parent_1];
          }
          ret[key_1] = parent_1 ? parent_1.concat(child) : isArray$1(child) ? child : [child];
      }
      return ret;
  };
  /**
   * Other object hashes.
   */
  strats.props =
      strats.methods =
          strats.inject =
              strats.computed =
                  function (parentVal, childVal, vm, key) {
                      if (childVal && true) {
                          assertObjectType(key, childVal, vm);
                      }
                      if (!parentVal)
                          return childVal;
                      var ret = Object.create(null);
                      extend$1(ret, parentVal);
                      if (childVal)
                          extend$1(ret, childVal);
                      return ret;
                  };
  strats.provide = function (parentVal, childVal) {
      if (!parentVal)
          return childVal;
      return function () {
          var ret = Object.create(null);
          mergeData(ret, isFunction$2(parentVal) ? parentVal.call(this) : parentVal);
          if (childVal) {
              mergeData(ret, isFunction$2(childVal) ? childVal.call(this) : childVal, false // non-recursive
              );
          }
          return ret;
      };
  };
  /**
   * Default strategy.
   */
  var defaultStrat = function (parentVal, childVal) {
      return childVal === undefined ? parentVal : childVal;
  };
  /**
   * Validate component names
   */
  function checkComponents(options) {
      for (var key in options.components) {
          validateComponentName(key);
      }
  }
  function validateComponentName(name) {
      if (!new RegExp("^[a-zA-Z][\\-\\.0-9_".concat(unicodeRegExp.source, "]*$")).test(name)) {
          warn$2('Invalid component name: "' +
              name +
              '". Component names ' +
              'should conform to valid custom element name in html5 specification.');
      }
      if (isBuiltInTag(name) || config.isReservedTag(name)) {
          warn$2('Do not use built-in or reserved HTML elements as component ' +
              'id: ' +
              name);
      }
  }
  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps(options, vm) {
      var props = options.props;
      if (!props)
          return;
      var res = {};
      var i, val, name;
      if (isArray$1(props)) {
          i = props.length;
          while (i--) {
              val = props[i];
              if (typeof val === 'string') {
                  name = camelize(val);
                  res[name] = { type: null };
              }
              else {
                  warn$2('props must be strings when using array syntax.');
              }
          }
      }
      else if (isPlainObject$1(props)) {
          for (var key in props) {
              val = props[key];
              name = camelize(key);
              res[name] = isPlainObject$1(val) ? val : { type: val };
          }
      }
      else {
          warn$2("Invalid value for option \"props\": expected an Array or an Object, " +
              "but got ".concat(toRawType(props), "."), vm);
      }
      options.props = res;
  }
  /**
   * Normalize all injections into Object-based format
   */
  function normalizeInject(options, vm) {
      var inject = options.inject;
      if (!inject)
          return;
      var normalized = (options.inject = {});
      if (isArray$1(inject)) {
          for (var i = 0; i < inject.length; i++) {
              normalized[inject[i]] = { from: inject[i] };
          }
      }
      else if (isPlainObject$1(inject)) {
          for (var key in inject) {
              var val = inject[key];
              normalized[key] = isPlainObject$1(val)
                  ? extend$1({ from: key }, val)
                  : { from: val };
          }
      }
      else {
          warn$2("Invalid value for option \"inject\": expected an Array or an Object, " +
              "but got ".concat(toRawType(inject), "."), vm);
      }
  }
  /**
   * Normalize raw function directives into object format.
   */
  function normalizeDirectives$1(options) {
      var dirs = options.directives;
      if (dirs) {
          for (var key in dirs) {
              var def = dirs[key];
              if (isFunction$2(def)) {
                  dirs[key] = { bind: def, update: def };
              }
          }
      }
  }
  function assertObjectType(name, value, vm) {
      if (!isPlainObject$1(value)) {
          warn$2("Invalid value for option \"".concat(name, "\": expected an Object, ") +
              "but got ".concat(toRawType(value), "."), vm);
      }
  }
  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions(parent, child, vm) {
      {
          checkComponents(child);
      }
      if (isFunction$2(child)) {
          // @ts-expect-error
          child = child.options;
      }
      normalizeProps(child, vm);
      normalizeInject(child, vm);
      normalizeDirectives$1(child);
      // Apply extends and mixins on the child options,
      // but only if it is a raw options object that isn't
      // the result of another mergeOptions call.
      // Only merged options has the _base property.
      if (!child._base) {
          if (child.extends) {
              parent = mergeOptions(parent, child.extends, vm);
          }
          if (child.mixins) {
              for (var i = 0, l = child.mixins.length; i < l; i++) {
                  parent = mergeOptions(parent, child.mixins[i], vm);
              }
          }
      }
      var options = {};
      var key;
      for (key in parent) {
          mergeField(key);
      }
      for (key in child) {
          if (!hasOwn(parent, key)) {
              mergeField(key);
          }
      }
      function mergeField(key) {
          var strat = strats[key] || defaultStrat;
          options[key] = strat(parent[key], child[key], vm, key);
      }
      return options;
  }
  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset(options, type, id, warnMissing) {
      /* istanbul ignore if */
      if (typeof id !== 'string') {
          return;
      }
      var assets = options[type];
      // check local registration variations first
      if (hasOwn(assets, id))
          return assets[id];
      var camelizedId = camelize(id);
      if (hasOwn(assets, camelizedId))
          return assets[camelizedId];
      var PascalCaseId = capitalize(camelizedId);
      if (hasOwn(assets, PascalCaseId))
          return assets[PascalCaseId];
      // fallback to prototype chain
      var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
      // If not found in local assets, check global dynamic components registry
      // This allows components registered after Vue instance initialization
      if (!res && type === 'components') {
          var dynamicComponent = getDynamicComponent(id);
          if (dynamicComponent) {
              debugLog("[Vue.resolveAsset] \u2705 Found dynamic component \"".concat(id, "\""));
              return dynamicComponent;
          }
          else {
              debugLog("[Vue.resolveAsset] \u274C Not found \"".concat(id, "\", dynamic registry has:"), Object.keys(dynamicComponents));
              // AUTO FETCH: Try to fetch component from server if not found
              // Check component-level option first, fallback to global config
              // Default: true (unless explicitly set to false)
              var shouldAutoFetch = options.autoFetchComponents !== undefined
                  ? options.autoFetchComponents
                  : config.autoFetchComponents !== false;
              if (shouldAutoFetch) {
                  autoFetchComponent(id);
              }
          }
      }
      if (warnMissing && !res) {
          warn$2('Failed to resolve ' + type.slice(0, -1) + ': ' + id);
      }
      return res;
  }
  /**
   * Auto-fetch component from server when not found
   * This enables automatic component resolution
   */
  function autoFetchComponent(componentName) {
      // Skip if already fetching to prevent duplicate requests
      if (fetchingComponents.has(componentName)) {
          return;
      }
      fetchingComponents.add(componentName);
      debugLog("[Vue.autoFetchComponent] Auto-fetching: ".concat(componentName));
      // Parse component name to generate path
      // Example: 'input-text' -> '/input/input-text'
      var componentPath = "/".concat(componentName);
      // If component name contains '-', split and use first part as folder
      if (componentName.includes('-')) {
          var parts = componentName.split('-');
          var folder = parts[0]; // 'input'
          // Keep full component name 'input-text'
          componentPath = "/".concat(folder, "/").concat(componentName);
      }
      var basePath = config.componentPath || '/components';
      var extension = config.componentExtension || '.tpl';
      var fullPath = "".concat(basePath).concat(componentPath).concat(extension);
      debugLog("[Vue.autoFetchComponent] Generated path: ".concat(fullPath));
      // Fetch component file using native fetch API
      fetch(fullPath)
          .then(function (response) {
          if (!response.ok) {
              throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
          }
          return response.text();
      })
          .then(function (content) {
          // Parse file content
          var _a = parseComponentFile(content), script = _a.script, template = _a.template, loadingTemplate = _a.loadingTemplate, style = _a.style;
          // Evaluate script
          var componentDef = evaluateScriptContent(script);
          // Inject styles directly into head if exists
          if (style) {
              var styleId = "style-".concat(componentName);
              var styleEl = document.getElementById(styleId);
              if (!styleEl) {
                  styleEl = document.createElement('style');
                  styleEl.id = styleId;
                  document.head.appendChild(styleEl);
              }
              styleEl.textContent = style;
              debugLog("[Vue.autoFetchComponent] Style injected for: ".concat(componentName));
          }
          // Set template
          if (template) {
              componentDef.template = template;
          }
          // Set loading template if exists
          if (loadingTemplate) {
              componentDef.loadingTemplate = loadingTemplate;
          }
          // Register component globally
          defineDynamicComponent(componentName, componentDef);
          debugLog("[Vue.autoFetchComponent] \u2705 Auto-registered: ".concat(componentName));
          // Force update all instances
          vueInstances.forEach(function (vm) {
              if (vm && vm.$forceUpdate) {
                  vm.$forceUpdate();
              }
          });
      })
          .catch(function (error) {
          debugLog("[Vue.autoFetchComponent] \u274C Failed to auto-fetch: ".concat(componentName), error.message);
          // Create fallback component if not exists
          var fallbackName = config.componentFallback || 'component-notfound';
          if (!hasDynamicComponent(fallbackName)) {
              defineDynamicComponent(fallbackName, {
                  template: "<div class=\"vue-component-notfound\">\n            <p style=\"color: #999; padding: 20px; border: 1px dashed #ccc; border-radius: 4px;\">\n              Component \"<strong>".concat(componentName, "</strong>\" not found\n            </p>\n          </div>")
              });
              debugLog("[Vue.autoFetchComponent] \u2705 Created fallback: ".concat(fallbackName));
          }
      })
          .finally(function () {
          fetchingComponents.delete(componentName);
      });
  }
  /**
   * Track components that are currently being fetched
   */
  var fetchingComponents = new Set();
  /**
   * Parse component file content
   */
  function parseComponentFile(content) {
      var result = {
          script: '',
          template: '',
          loadingTemplate: '',
          style: ''
      };
      var scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch && scriptMatch[1]) {
          result.script = scriptMatch[1].trim();
      }
      // Extract <template scope="loading"> content
      var loadingTemplateMatch = content.match(/<template\s+[^>]*scope=["']loading["'][^>]*>([\s\S]*?)<\/template>/i);
      if (loadingTemplateMatch) {
          result.loadingTemplate = loadingTemplateMatch[1].trim();
          // Remove the loading template from content to avoid it being picked up as the main template
          content = content.replace(loadingTemplateMatch[0], '');
      }
      // Robust nested template matching
      var templateStartMatch = content.match(/<template[^>]*>/i);
      if (templateStartMatch && typeof templateStartMatch.index === 'number') {
          var startIdx = templateStartMatch.index;
          var contentAfterStart = content.slice(startIdx + templateStartMatch[0].length);
          var depth = 1;
          var tagRegex = /<\/?template[^>]*>/gi;
          var match = void 0;
          while ((match = tagRegex.exec(contentAfterStart)) !== null) {
              if (match[0].toLowerCase().startsWith('</template')) {
                  depth--;
              }
              else {
                  depth++;
              }
              if (depth === 0) {
                  result.template = contentAfterStart.slice(0, match.index).trim();
                  break;
              }
          }
          if (depth !== 0) {
              var fallbackMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
              if (fallbackMatch)
                  result.template = fallbackMatch[1].trim();
          }
      }
      var styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch && styleMatch[1]) {
          result.style = styleMatch[1].trim();
      }
      return result;
  }
  /**
   * Evaluate script content to get component definition
   */
  function evaluateScriptContent(scriptContent) {
      try {
          var module_1 = { exports: {} };
          var exports_1 = module_1.exports;
          var wrappedScript = "(function(module, exports) {\n      ".concat(scriptContent, "\n    })");
          var fn = eval(wrappedScript);
          fn(module_1, exports_1);
          return module_1.exports || {};
      }
      catch (error) {
          warn$2("[Vue.autoFetchComponent] Failed to evaluate script: ".concat(error));
          return {};
      }
  }

  function validateProp(key, propOptions, propsData, vm) {
      var prop = propOptions[key];
      var absent = !hasOwn(propsData, key);
      var value = propsData[key];
      // boolean casting
      var booleanIndex = getTypeIndex(Boolean, prop.type);
      if (booleanIndex > -1) {
          if (absent && !hasOwn(prop, 'default')) {
              value = false;
          }
          else if (value === '' || value === hyphenate(key)) {
              // only cast empty string / same name to boolean if
              // boolean has higher priority
              var stringIndex = getTypeIndex(String, prop.type);
              if (stringIndex < 0 || booleanIndex < stringIndex) {
                  value = true;
              }
          }
      }
      // check default value
      if (value === undefined) {
          value = getPropDefaultValue(vm, prop, key);
          // since the default value is a fresh copy,
          // make sure to observe it.
          var prevShouldObserve = shouldObserve;
          toggleObserving(true);
          observe(value);
          toggleObserving(prevShouldObserve);
      }
      {
          assertProp(prop, key, value, vm, absent);
      }
      return value;
  }
  /**
   * Get the default value of a prop.
   */
  function getPropDefaultValue(vm, prop, key) {
      // no default, return undefined
      if (!hasOwn(prop, 'default')) {
          return undefined;
      }
      var def = prop.default;
      // warn against non-factory defaults for Object & Array
      if (isObject$1(def)) {
          warn$2('Invalid default value for prop "' +
              key +
              '": ' +
              'Props with type Object/Array must use a factory function ' +
              'to return the default value.', vm);
      }
      // the raw prop value was also undefined from previous render,
      // return previous default value to avoid unnecessary watcher trigger
      if (vm &&
          vm.$options.propsData &&
          vm.$options.propsData[key] === undefined &&
          vm._props[key] !== undefined) {
          return vm._props[key];
      }
      // call factory function for non-Function types
      // a value is Function if its prototype is function even across different execution context
      return isFunction$2(def) && getType(prop.type) !== 'Function'
          ? def.call(vm)
          : def;
  }
  /**
   * Assert whether a prop is valid.
   */
  function assertProp(prop, name, value, vm, absent) {
      if (prop.required && absent) {
          warn$2('Missing required prop: "' + name + '"', vm);
          return;
      }
      if (value == null && !prop.required) {
          return;
      }
      var type = prop.type;
      var valid = !type || type === true;
      var expectedTypes = [];
      if (type) {
          if (!isArray$1(type)) {
              type = [type];
          }
          for (var i = 0; i < type.length && !valid; i++) {
              var assertedType = assertType(value, type[i], vm);
              expectedTypes.push(assertedType.expectedType || '');
              valid = assertedType.valid;
          }
      }
      var haveExpectedTypes = expectedTypes.some(function (t) { return t; });
      if (!valid && haveExpectedTypes) {
          warn$2(getInvalidTypeMessage(name, value, expectedTypes), vm);
          return;
      }
      var validator = prop.validator;
      if (validator) {
          if (!validator(value)) {
              warn$2('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
          }
      }
  }
  var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;
  function assertType(value, type, vm) {
      var valid;
      var expectedType = getType(type);
      if (simpleCheckRE.test(expectedType)) {
          var t = typeof value;
          valid = t === expectedType.toLowerCase();
          // for primitive wrapper objects
          if (!valid && t === 'object') {
              valid = value instanceof type;
          }
      }
      else if (expectedType === 'Object') {
          valid = isPlainObject$1(value);
      }
      else if (expectedType === 'Array') {
          valid = isArray$1(value);
      }
      else {
          try {
              valid = value instanceof type;
          }
          catch (e) {
              warn$2('Invalid prop type: "' + String(type) + '" is not a constructor', vm);
              valid = false;
          }
      }
      return {
          valid: valid,
          expectedType: expectedType
      };
  }
  var functionTypeCheckRE = /^\s*function (\w+)/;
  /**
   * Use function string name to check built-in types,
   * because a simple equality check will fail when running
   * across different vms / iframes.
   */
  function getType(fn) {
      var match = fn && fn.toString().match(functionTypeCheckRE);
      return match ? match[1] : '';
  }
  function isSameType(a, b) {
      return getType(a) === getType(b);
  }
  function getTypeIndex(type, expectedTypes) {
      if (!isArray$1(expectedTypes)) {
          return isSameType(expectedTypes, type) ? 0 : -1;
      }
      for (var i = 0, len = expectedTypes.length; i < len; i++) {
          if (isSameType(expectedTypes[i], type)) {
              return i;
          }
      }
      return -1;
  }
  function getInvalidTypeMessage(name, value, expectedTypes) {
      var message = "Invalid prop: type check failed for prop \"".concat(name, "\".") +
          " Expected ".concat(expectedTypes.map(capitalize).join(', '));
      var expectedType = expectedTypes[0];
      var receivedType = toRawType(value);
      // check if we need to specify expected value
      if (expectedTypes.length === 1 &&
          isExplicable(expectedType) &&
          isExplicable(typeof value) &&
          !isBoolean(expectedType, receivedType)) {
          message += " with value ".concat(styleValue(value, expectedType));
      }
      message += ", got ".concat(receivedType, " ");
      // check if we need to specify received value
      if (isExplicable(receivedType)) {
          message += "with value ".concat(styleValue(value, receivedType), ".");
      }
      return message;
  }
  function styleValue(value, type) {
      if (type === 'String') {
          return "\"".concat(value, "\"");
      }
      else if (type === 'Number') {
          return "".concat(Number(value));
      }
      else {
          return "".concat(value);
      }
  }
  var EXPLICABLE_TYPES = ['string', 'number', 'boolean'];
  function isExplicable(value) {
      return EXPLICABLE_TYPES.some(function (elem) { return value.toLowerCase() === elem; });
  }
  function isBoolean() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; });
  }

  function Vue(options) {
      if (!(this instanceof Vue)) {
          warn$2('Vue is a constructor and should be called with the `new` keyword');
      }
      this._init(options);
  }
  //@ts-expect-error Vue has function type
  initMixin$1(Vue);
  //@ts-expect-error Vue has function type
  stateMixin(Vue);
  //@ts-expect-error Vue has function type
  eventsMixin(Vue);
  //@ts-expect-error Vue has function type
  lifecycleMixin(Vue);
  //@ts-expect-error Vue has function type
  renderMixin(Vue);

  function initUse(Vue) {
      Vue.use = function (plugin) {
          var installedPlugins = this._installedPlugins || (this._installedPlugins = []);
          if (installedPlugins.indexOf(plugin) > -1) {
              return this;
          }
          // additional parameters
          var args = toArray$1(arguments, 1);
          args.unshift(this);
          if (isFunction$2(plugin.install)) {
              plugin.install.apply(plugin, args);
          }
          else if (isFunction$2(plugin)) {
              plugin.apply(null, args);
          }
          installedPlugins.push(plugin);
          return this;
      };
  }

  function initMixin(Vue) {
      Vue.mixin = function (mixin) {
          this.options = mergeOptions(this.options, mixin);
          return this;
      };
  }

  function initExtend(Vue) {
      /**
       * Each instance constructor, including Vue, has a unique
       * cid. This enables us to create wrapped "child
       * constructors" for prototypal inheritance and cache them.
       */
      Vue.cid = 0;
      var cid = 1;
      /**
       * Class inheritance
       */
      Vue.extend = function (extendOptions) {
          extendOptions = extendOptions || {};
          var Super = this;
          var SuperId = Super.cid;
          var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
          if (cachedCtors[SuperId]) {
              return cachedCtors[SuperId];
          }
          var name = getComponentName(extendOptions) || getComponentName(Super.options);
          if (name) {
              validateComponentName(name);
          }
          var Sub = function VueComponent(options) {
              this._init(options);
          };
          Sub.prototype = Object.create(Super.prototype);
          Sub.prototype.constructor = Sub;
          Sub.cid = cid++;
          Sub.options = mergeOptions(Super.options, extendOptions);
          Sub['super'] = Super;
          // For props and computed properties, we define the proxy getters on
          // the Vue instances at extension time, on the extended prototype. This
          // avoids Object.defineProperty calls for each instance created.
          if (Sub.options.props) {
              initProps(Sub);
          }
          if (Sub.options.computed) {
              initComputed(Sub);
          }
          // allow further extension/mixin/plugin usage
          Sub.extend = Super.extend;
          Sub.mixin = Super.mixin;
          Sub.use = Super.use;
          // create asset registers, so extended classes
          // can have their private assets too.
          ASSET_TYPES.forEach(function (type) {
              Sub[type] = Super[type];
          });
          // enable recursive self-lookup
          if (name) {
              Sub.options.components[name] = Sub;
          }
          // keep a reference to the super options at extension time.
          // later at instantiation we can check if Super's options have
          // been updated.
          Sub.superOptions = Super.options;
          Sub.extendOptions = extendOptions;
          Sub.sealedOptions = extend$1({}, Sub.options);
          // cache constructor
          cachedCtors[SuperId] = Sub;
          return Sub;
      };
  }
  function initProps(Comp) {
      var props = Comp.options.props;
      for (var key in props) {
          proxy(Comp.prototype, "_props", key);
      }
  }
  function initComputed(Comp) {
      var computed = Comp.options.computed;
      for (var key in computed) {
          defineComputed(Comp.prototype, key, computed[key]);
      }
  }

  function initAssetRegisters(Vue) {
      /**
       * Create asset registration methods.
       */
      ASSET_TYPES.forEach(function (type) {
          // @ts-expect-error function is not exact same type
          Vue[type] = function (id, definition) {
              if (!definition) {
                  return this.options[type + 's'][id];
              }
              else {
                  /* istanbul ignore if */
                  if (type === 'component') {
                      validateComponentName(id);
                  }
                  if (type === 'component' && isPlainObject$1(definition)) {
                      // @ts-expect-error
                      definition.name = definition.name || id;
                      definition = this.options._base.extend(definition);
                  }
                  if (type === 'directive' && isFunction$2(definition)) {
                      definition = { bind: definition, update: definition };
                  }
                  this.options[type + 's'][id] = definition;
                  return definition;
              }
          };
      });
  }

  function _getComponentName(opts) {
      return opts && (getComponentName(opts.Ctor.options) || opts.tag);
  }
  function matches(pattern, name) {
      if (isArray$1(pattern)) {
          return pattern.indexOf(name) > -1;
      }
      else if (typeof pattern === 'string') {
          return pattern.split(',').indexOf(name) > -1;
      }
      else if (isRegExp$1(pattern)) {
          return pattern.test(name);
      }
      /* istanbul ignore next */
      return false;
  }
  function pruneCache(keepAliveInstance, filter) {
      var cache = keepAliveInstance.cache, keys = keepAliveInstance.keys, _vnode = keepAliveInstance._vnode, $vnode = keepAliveInstance.$vnode;
      for (var key in cache) {
          var entry = cache[key];
          if (entry) {
              var name_1 = entry.name;
              if (name_1 && !filter(name_1)) {
                  pruneCacheEntry(cache, key, keys, _vnode);
              }
          }
      }
      $vnode.componentOptions.children = undefined;
  }
  function pruneCacheEntry(cache, key, keys, current) {
      var entry = cache[key];
      if (entry && (!current || entry.tag !== current.tag)) {
          // @ts-expect-error can be undefined
          entry.componentInstance.$destroy();
      }
      cache[key] = null;
      remove$2(keys, key);
  }
  var patternTypes = [String, RegExp, Array];
  // TODO defineComponent
  var KeepAlive = {
      name: 'keep-alive',
      abstract: true,
      props: {
          include: patternTypes,
          exclude: patternTypes,
          max: [String, Number]
      },
      methods: {
          cacheVNode: function () {
              var _a = this, cache = _a.cache, keys = _a.keys, vnodeToCache = _a.vnodeToCache, keyToCache = _a.keyToCache;
              if (vnodeToCache) {
                  var tag = vnodeToCache.tag, componentInstance = vnodeToCache.componentInstance, componentOptions = vnodeToCache.componentOptions;
                  cache[keyToCache] = {
                      name: _getComponentName(componentOptions),
                      tag: tag,
                      componentInstance: componentInstance
                  };
                  keys.push(keyToCache);
                  // prune oldest entry
                  if (this.max && keys.length > parseInt(this.max)) {
                      pruneCacheEntry(cache, keys[0], keys, this._vnode);
                  }
                  this.vnodeToCache = null;
              }
          }
      },
      created: function () {
          this.cache = Object.create(null);
          this.keys = [];
      },
      destroyed: function () {
          for (var key in this.cache) {
              pruneCacheEntry(this.cache, key, this.keys);
          }
      },
      mounted: function () {
          var _this = this;
          this.cacheVNode();
          this.$watch('include', function (val) {
              pruneCache(_this, function (name) { return matches(val, name); });
          });
          this.$watch('exclude', function (val) {
              pruneCache(_this, function (name) { return !matches(val, name); });
          });
      },
      updated: function () {
          this.cacheVNode();
      },
      render: function () {
          var slot = this.$slots.default;
          var vnode = getFirstComponentChild(slot);
          var componentOptions = vnode && vnode.componentOptions;
          if (componentOptions) {
              // check pattern
              var name_2 = _getComponentName(componentOptions);
              var _a = this, include = _a.include, exclude = _a.exclude;
              if (
              // not included
              (include && (!name_2 || !matches(include, name_2))) ||
                  // excluded
                  (exclude && name_2 && matches(exclude, name_2))) {
                  return vnode;
              }
              var _b = this, cache = _b.cache, keys = _b.keys;
              var key = vnode.key == null
                  ? // same constructor may get registered as different local components
                      // so cid alone is not enough (#3269)
                      componentOptions.Ctor.cid +
                          (componentOptions.tag ? "::".concat(componentOptions.tag) : '')
                  : vnode.key;
              if (cache[key]) {
                  vnode.componentInstance = cache[key].componentInstance;
                  // make current key freshest
                  remove$2(keys, key);
                  keys.push(key);
              }
              else {
                  // delay setting the cache until update
                  this.vnodeToCache = vnode;
                  this.keyToCache = key;
              }
              // @ts-expect-error can vnode.data can be undefined
              vnode.data.keepAlive = true;
          }
          return vnode || (slot && slot[0]);
      }
  };

  var builtInComponents = {
      KeepAlive: KeepAlive
  };

  /**
   * Initialize HTTP methods on Vue prototype
   * This provides convenient HTTP methods directly on Vue instances
   */
  function initHttp(Vue) {
      /**
       * Make a GET request
       * @param url - Request URL
       * @param config - Axios request config
       * @example
       * this.get('/api/users')
       * this.get('/api/users', { params: { page: 1 } })
       */
      Vue.prototype.get = function (url, config) {
          return httpGet(url, config);
      };
      /**
       * Make a POST request
       * @param url - Request URL
       * @param data - Request body data
       * @param config - Axios request config
       * @example
       * this.post('/api/users', { name: 'John' })
       */
      Vue.prototype.post = function (url, data, config) {
          return httpPost(url, data, config);
      };
      /**
       * Make a PUT request
       * @param url - Request URL
       * @param data - Request body data
       * @param config - Axios request config
       * @example
       * this.put('/api/users/1', { name: 'Jane' })
       */
      Vue.prototype.put = function (url, data, config) {
          return httpPut(url, data, config);
      };
      /**
       * Make a PATCH request
       * @param url - Request URL
       * @param data - Request body data
       * @param config - Axios request config
       * @example
       * this.patch('/api/users/1', { name: 'Jane' })
       */
      Vue.prototype.patch = function (url, data, config) {
          return httpPatch(url, data, config);
      };
      /**
       * Make a DELETE request
       * @param url - Request URL
       * @param config - Axios request config
       * @example
       * this.delete('/api/users/1')
       */
      Vue.prototype.delete = function (url, config) {
          return httpDelete(url, config);
      };
      /**
       * Make a HEAD request
       * @param url - Request URL
       * @param config - Axios request config
       * @example
       * this.head('/api/users')
       */
      Vue.prototype.head = function (url, config) {
          return httpHead(url, config);
      };
      /**
       * Make an OPTIONS request
       * @param url - Request URL
       * @param config - Axios request config
       * @example
       * this.options('/api/users')
       */
      Vue.prototype.options = function (url, config) {
          return httpOptions(url, config);
      };
      /**
       * Make a POST request with form data
       * @param url - Request URL
       * @param data - Form data
       * @param config - Axios request config
       * @example
       * this.postForm('/api/upload', { file: fileInput.files[0] })
       */
      Vue.prototype.postForm = function (url, data, config) {
          return httpPostForm(url, data, config);
      };
      /**
       * Make a PUT request with form data
       * @param url - Request URL
       * @param data - Form data
       * @param config - Axios request config
       * @example
       * this.putForm('/api/users/1/avatar', { avatar: fileInput.files[0] })
       */
      Vue.prototype.putForm = function (url, data, config) {
          return httpPutForm(url, data, config);
      };
      /**
       * Make a PATCH request with form data
       * @param url - Request URL
       * @param data - Form data
       * @param config - Axios request config
       * @example
       * this.patchForm('/api/users/1/avatar', { avatar: fileInput.files[0] })
       */
      Vue.prototype.patchForm = function (url, data, config) {
          return httpPatchForm(url, data, config);
      };
      /**
       * Make a custom HTTP request
       * @param config - Full axios request config
       * @example
       * this.request({ method: 'GET', url: '/api/users' })
       */
      Vue.prototype.request = function (config) {
          return httpRequest(config);
      };
      /**
       * Get the underlying axios instance
       * @example
       * this.$http.interceptors.request.use(...)
       */
      Vue.prototype.$http = getHttpClient();
      /**
       * Add a request interceptor
       * @param onFulfilled - Success callback
       * @param onRejected - Error callback
       * @example
       * this.$addRequestInterceptor((config) => {
       *   config.headers.Authorization = 'Bearer ' + getToken()
       *   return config
       * })
       */
      Vue.prototype.$addRequestInterceptor = function (onFulfilled, onRejected) {
          return addRequestInterceptor(onFulfilled, onRejected);
      };
      /**
       * Add a response interceptor
       * @param onFulfilled - Success callback
       * @param onRejected - Error callback
       * @example
       * this.$addResponseInterceptor((response) => {
       *   return response.data
       * })
       */
      Vue.prototype.$addResponseInterceptor = function (onFulfilled, onRejected) {
          return addResponseInterceptor(onFulfilled, onRejected);
      };
      /**
       * Remove an interceptor
       * @param type - Interceptor type (request or response)
       * @param id - Interceptor ID
       * @example
       * this.$removeInterceptor('request', interceptorId)
       */
      Vue.prototype.$removeInterceptor = function (type, id) {
          removeInterceptor(type, id);
      };
      /**
       * Fetch and register a dynamic component from server
       * @param name - Component name
       * @param pathOrOptions - Path to component file or options object
       * @param optionsOrFallback - Options object or fallback component name
       * @example
       * this.fetchDynamicComponent('input-text', '/input/input-text')
       * this.fetchDynamicComponent('input-text', '/input/input-text', 'component-notfound')
       * this.fetchDynamicComponent({ name: 'input-text', path: '/input/input-text', fallbackComponent: 'component-notfound' })
       */
      Vue.prototype.fetchDynamicComponent = function (name, pathOrOptions, optionsOrFallback) {
          return __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                  return [2 /*return*/, fetchDynamicComponent(name, pathOrOptions, optionsOrFallback)];
              });
          });
      };
      /**
       * Fetch and register multiple dynamic components
       * @param components - Array of component objects with name and path
       * @example
       * this.fetchDynamicComponents([
       *   { name: 'input-text', path: '/input/input-text' },
       *   { name: 'button-primary', path: '/button/button-primary' }
       * ])
       */
      Vue.prototype.fetchDynamicComponents = function (components) {
          return __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                  return [2 /*return*/, fetchDynamicComponents(components)];
              });
          });
      };
      /**
       * Load async component from custom path
       * Same parameter format as fetchDynamicComponent
       * @param nameOrComponents - Component name (string) OR component object OR array of objects
       * @param pathOrOptions - Path (if nameOrComponents is string) OR options object
       * @param optionsOrFallback - Additional options or fallback component name
       * @example
       * // String path + options
       * await this.loadAsyncComponent('my-comp', '/custom/path/component', { extension: '.vue' })
       *
       * // Options object with path
       * await this.loadAsyncComponent({
       *   name: 'my-comp',
       *   path: '/custom/path/component',
       *   extension: '.vue'
       * })
       *
       * // Multiple components - Array
       * await this.loadAsyncComponent([
       *   { name: 'header', path: '/layout/header' },
       *   { name: 'footer', path: '/layout/footer' }
       * ])
       */
      Vue.prototype.loadAsyncComponent = function (nameOrComponents, pathOrOptions, optionsOrFallback) {
          return __awaiter(this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                  return [2 /*return*/, loadAsyncComponent(nameOrComponents, pathOrOptions, optionsOrFallback)];
              });
          });
      };
  }

  /**
   * Get storage engine
   */
  function getEngine(type) {
      if (type === void 0) { type = 'local'; }
      try {
          var storage = type === 'local' ? window.localStorage : window.sessionStorage;
          // Test if storage is available
          var testKey = '__vue_storage_test__';
          storage.setItem(testKey, 'test');
          storage.removeItem(testKey);
          return storage;
      }
      catch (e) {
          warn$2("[Storage] ".concat(type, "Storage is not available: ").concat(e));
          // Fallback to in-memory storage
          var memory_1 = {};
          return {
              getItem: function (key) { return memory_1[key] || null; },
              setItem: function (key, value) { memory_1[key] = value; },
              removeItem: function (key) { delete memory_1[key]; },
              clear: function () { Object.keys(memory_1).forEach(function (k) { return delete memory_1[k]; }); },
              key: function (index) { return Object.keys(memory_1)[index]; },
              length: Object.keys(memory_1).length
          };
      }
  }
  /**
   * Watchers registry
   */
  var watchers = {};
  var watchInitialized = false;
  /**
   * Initialize storage event listener for cross-tab sync
   */
  function initWatch() {
      if (watchInitialized)
          return;
      watchInitialized = true;
      // Listen to storage events from other tabs
      window.addEventListener('storage', function (e) {
          if (e.key) {
              notifyWatchers(e.key, e.newValue, e.oldValue);
          }
      });
  }
  /**
   * Notify all watchers for a key
   */
  function notifyWatchers(key, newVal, oldVal) {
      var callbacks = watchers[key] || [];
      callbacks.forEach(function (cb) {
          try {
              var parsedNew = newVal !== null ? JSON.parse(newVal) : null;
              var parsedOld = oldVal !== null ? JSON.parse(oldVal) : null;
              cb(key, parsedNew, parsedOld);
          }
          catch (e) {
              cb(key, newVal, oldVal);
          }
      });
      // Also notify global watchers (wildcard)
      var globalCallbacks = watchers['*'] || [];
      globalCallbacks.forEach(function (cb) {
          try {
              var parsedNew = newVal !== null ? JSON.parse(newVal) : null;
              var parsedOld = oldVal !== null ? JSON.parse(oldVal) : null;
              cb(key, parsedNew, parsedOld);
          }
          catch (e) {
              cb(key, newVal, oldVal);
          }
      });
  }
  /**
   * Resolve key with namespace
   */
  function resolveKey(key, namespace) {
      return namespace ? "".concat(namespace).concat(key) : key;
  }
  /**
   * Get all keys with namespace
   */
  function getAllKeys(storage, namespace) {
      var keys = [];
      for (var i = 0; i < storage.length; i++) {
          var key = storage.key(i);
          if (key) {
              if (namespace && key.startsWith(namespace)) {
                  keys.push(key.slice(namespace.length));
              }
              else if (!namespace && !key.startsWith('__')) {
                  keys.push(key);
              }
          }
      }
      return keys;
  }
  /**
   * Check if item is expired
   */
  function isExpired(item) {
      if (!item.expires)
          return false;
      return Date.now() > item.expires;
  }
  /**
   * Storage Manager Class
   */
  var StorageManager = /** @class */ (function () {
      function StorageManager(options) {
          if (options === void 0) { options = {}; }
          this._namespace = '';
          this._storage = getEngine(options.type || 'local');
          this._namespace = options.namespace || '';
          this._serialize = options.serialize || JSON.stringify;
          this._deserialize = options.deserialize || JSON.parse;
      }
      /**
       * Get item from storage
       */
      StorageManager.prototype.get = function (key, defaultValue) {
          var fullKey = resolveKey(key, this._namespace);
          var raw = this._storage.getItem(fullKey);
          if (raw === null) {
              return defaultValue !== undefined ? defaultValue : null;
          }
          try {
              var item = this._deserialize(raw);
              // Check expiration
              if (isExpired(item)) {
                  this.remove(key);
                  return defaultValue !== undefined ? defaultValue : null;
              }
              return item.value;
          }
          catch (e) {
              warn$2("[Storage] Failed to deserialize \"".concat(key, "\": ").concat(e));
              return raw;
          }
      };
      /**
       * Set item to storage
       */
      StorageManager.prototype.set = function (key, value, options) {
          var fullKey = resolveKey(key, this._namespace);
          var oldRaw = this._storage.getItem(fullKey);
          var item = {
              value: value,
              expires: (options === null || options === void 0 ? void 0 : options.expires) ? Date.now() + options.expires : null,
              created: Date.now()
          };
          try {
              var serialized = this._serialize(item);
              this._storage.setItem(fullKey, serialized);
              debugLog("[Storage] Set: ".concat(key));
              // Notify watchers
              notifyWatchers(key, serialized, oldRaw);
          }
          catch (e) {
              if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                  warn$2("[Storage] Quota exceeded for key \"".concat(key, "\""));
              }
              else {
                  warn$2("[Storage] Failed to set \"".concat(key, "\": ").concat(e));
              }
          }
      };
      /**
       * Remove item from storage
       */
      StorageManager.prototype.remove = function (key) {
          var fullKey = resolveKey(key, this._namespace);
          var oldRaw = this._storage.getItem(fullKey);
          this._storage.removeItem(fullKey);
          debugLog("[Storage] Removed: ".concat(key));
          // Notify watchers
          notifyWatchers(key, null, oldRaw);
      };
      /**
       * Clear all items (with namespace support)
       */
      StorageManager.prototype.clear = function () {
          var _this = this;
          if (this._namespace) {
              // Only clear namespaced keys
              var keys = getAllKeys(this._storage);
              keys.forEach(function (key) { return _this.remove(key); });
          }
          else {
              this._storage.clear();
          }
          debugLog('[Storage] Cleared');
      };
      /**
       * Get all items
       */
      StorageManager.prototype.getAll = function () {
          var _this = this;
          var result = {};
          var keys = getAllKeys(this._storage, this._namespace);
          keys.forEach(function (key) {
              var value = _this.get(key);
              if (value !== null) {
                  result[key] = value;
              }
          });
          return result;
      };
      /**
       * Check if key exists
       */
      StorageManager.prototype.has = function (key) {
          var value = this.get(key);
          return value !== null;
      };
      /**
       * Get all keys
       */
      StorageManager.prototype.keys = function () {
          return getAllKeys(this._storage, this._namespace);
      };
      /**
       * Get storage size in bytes
       */
      StorageManager.prototype.size = function () {
          var total = 0;
          for (var i = 0; i < this._storage.length; i++) {
              var key = this._storage.key(i);
              if (key && (!this._namespace || key.startsWith(this._namespace))) {
                  total += (this._storage.getItem(key) || '').length * 2; // UTF-16
              }
          }
          return total;
      };
      /**
       * Set with expiration
       */
      StorageManager.prototype.setExpiring = function (key, value, milliseconds) {
          this.set(key, value, { expires: milliseconds });
      };
      /**
       * Get remaining time until expiration
       */
      StorageManager.prototype.getExpiresIn = function (key) {
          var fullKey = resolveKey(key, this._namespace);
          var raw = this._storage.getItem(fullKey);
          if (!raw)
              return null;
          try {
              var item = this._deserialize(raw);
              if (!item.expires)
                  return null;
              var remaining = item.expires - Date.now();
              return remaining > 0 ? remaining : null;
          }
          catch (e) {
              return null;
          }
      };
      /**
       * Touch key (update created time)
       */
      StorageManager.prototype.touch = function (key) {
          var value = this.get(key);
          if (value !== null) {
              var fullKey = resolveKey(key, this._namespace);
              var raw = this._storage.getItem(fullKey);
              if (!raw)
                  return;
              try {
                  var item = this._deserialize(raw);
                  item.created = Date.now();
                  this._storage.setItem(fullKey, this._serialize(item));
              }
              catch (e) {
                  warn$2("[Storage] Failed to touch \"".concat(key, "\": ").concat(e));
              }
          }
      };
      /**
       * Watch for changes
       */
      StorageManager.prototype.watch = function (keyOrKeys, callback) {
          initWatch();
          var keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
          keys.forEach(function (key) {
              if (!watchers[key]) {
                  watchers[key] = [];
              }
              watchers[key].push(callback);
          });
          // Return unwatch function
          return function () {
              keys.forEach(function (key) {
                  if (watchers[key]) {
                      var index = watchers[key].indexOf(callback);
                      if (index > -1) {
                          watchers[key].splice(index, 1);
                      }
                  }
              });
          };
      };
      /**
       * Watch all changes
       */
      StorageManager.prototype.watchAll = function (callback) {
          initWatch();
          if (!watchers['*']) {
              watchers['*'] = [];
          }
          watchers['*'].push(callback);
          return function () {
              if (watchers['*']) {
                  var index = watchers['*'].indexOf(callback);
                  if (index > -1) {
                      watchers['*'].splice(index, 1);
                  }
              }
          };
      };
      /**
       * Get storage engine
       */
      StorageManager.prototype.getEngine = function () {
          return this._storage;
      };
      /**
       * Check if storage is available
       */
      StorageManager.isAvailable = function (type) {
          if (type === void 0) { type = 'local'; }
          try {
              var testKey = '__vue_storage_test__';
              var storage = type === 'local' ? window.localStorage : window.sessionStorage;
              storage.setItem(testKey, 'test');
              storage.removeItem(testKey);
              return true;
          }
          catch (e) {
              return false;
          }
      };
      return StorageManager;
  }());
  /**
   * Create storage instance
   */
  function createStorage(options) {
      return new StorageManager(options);
  }
  /**
   * Default instances
   */
  var LocalStorage = new StorageManager({ type: 'local' });
  var SessionStorage = new StorageManager({ type: 'session' });
  /**
   * Install Storage plugin
   */
  function installStorage(Vue) {
      // Expose to Vue global
      Vue.storage = LocalStorage;
      Vue.sessionStorage = SessionStorage;
      Vue.createStorage = createStorage;
      // Add to Vue prototype
      Vue.prototype.$storage = LocalStorage;
      Vue.prototype.$sessionStorage = SessionStorage;
      // Expose StorageManager class
      Vue.StorageManager = StorageManager;
      debugLog('[Storage] Plugin installed');
  }

  /**
   * Global Reactive Store System
   * Uses a hidden Vue instance for robust reactivity and watching
   */
  var reactiveRegistry = {};
  var VueInstance = null;
  function initReactive(Vue) {
      VueInstance = Vue;
      /**
       * Helper to create a robust reactive store using a hidden VM
       */
      var createStore = function (initialValue) {
          // Execute factory function if provided
          var data = typeof initialValue === 'function' ? initialValue() : initialValue;
          // Use a hidden Vue instance to host the state
          // This is the most reliable way to get perfect reactivity in Vue 2
          var vm = new VueInstance({
              data: {
                  state: data
              }
          });
          // The reactive object is now vm.state
          var store = vm.state;
          // Add watch method that leverages native vm.$watch
          Object.defineProperty(store, 'watch', {
              value: function (path, cb, options) {
                  if (options === void 0) { options = {}; }
                  // Support passing 'deep' as a boolean for backward compatibility
                  var watchOptions = typeof options === 'boolean' ? { deep: options } : __assign({}, options);
                  // Force synchronous execution for snappy standalone behavior
                  watchOptions.sync = true;
                  // Watch the property inside our hidden VM
                  // We prefix with 'state.' because the data is wrapped in the 'state' property
                  return vm.$watch('state.' + path, cb, watchOptions);
              },
              enumerable: false,
              configurable: true
          });
          return store;
      };
      /**
       * Global reactive function (Polymorphic)
       * @param nameOrValue - Unique name (String) or Object for standard reactivity
       * @param initialValue - Initial data object (only for Named Store)
       * @param options - Configuration options
       */
      var reactiveFn = function (nameOrValue, initialValue, options) {
          // Case 1: Named Store (Global & Integrated)
          if (typeof nameOrValue === 'string' && initialValue !== undefined) {
              debugLog("[Reactive] Creating named reactive store: ".concat(nameOrValue));
              var store = createStore(initialValue);
              reactiveRegistry[nameOrValue] = store;
              return store;
          }
          // Case 2: Anonymous Reactive Object (Local only, but with .watch support)
          debugLog("[Reactive] Creating anonymous reactive object");
          return createStore(nameOrValue);
      };
      // Expose on window if available
      if (typeof window !== 'undefined') {
          window.reactive = reactiveFn;
      }
      // Expose on Vue globally
      Vue.reactive = reactiveFn;
      // Setup this.$reactive proxy on prototype
      Object.defineProperty(Vue.prototype, '$reactive', {
          get: function () {
              return new Proxy(reactiveRegistry, {
                  get: function (target, prop) {
                      if (typeof prop === 'string') {
                          return target[prop] || {};
                      }
                      return undefined;
                  }
              });
          }
      });
  }

  /**
   * Built-in Lightweight Routing System
   * Provides reactive access to current route state and navigation methods
   */
  function initRouter(Vue) {
      // Use our new reactive system to create a global route store
      // We don't use 'reactive' global function here directly to avoid circularity
      // but we can use the same logic or just use Vue.observable
      var parseRoute = function () {
          var fullPath = window.location.pathname + window.location.search + window.location.hash;
          var path = window.location.pathname;
          var hash = window.location.hash;
          var search = window.location.search;
          // Parse query
          var query = {};
          var searchParams = new URLSearchParams(search);
          searchParams.forEach(function (value, key) {
              query[key] = value;
          });
          // Parse path segments (path1, path2, etc.)
          var segments = path.split('/').filter(Boolean);
          var segmentData = {};
          for (var i = 1; i <= 5; i++) {
              segmentData["path".concat(i)] = segments[i - 1] || '';
          }
          return __assign(__assign({ path: path, hash: hash, query: query, fullPath: fullPath, segments: segments, current: path }, segmentData), { 
              // Placeholder for advanced router features
              params: {}, meta: {}, name: '', matched: [], redirectedFrom: null });
      };
      // Create the reactive route object
      // Since initReactive already set Vue.reactive, we can use it
      var routeState = Vue.reactive('route', parseRoute());
      /**
       * Navigation methods
       */
      var routerMethods = {
          push: function (location) {
              debugLog("[Router] Push:", location);
              if (typeof location === 'string') {
                  window.history.pushState({}, '', location);
              }
              else {
                  // Simple implementation for object-based navigation
                  // In a real router this would handle { name, params, query }
                  var loc = location;
                  var url = loc.path || window.location.pathname;
                  if (loc.query) {
                      var params = new URLSearchParams(loc.query);
                      url += '?' + params.toString();
                  }
                  if (loc.hash)
                      url += loc.hash;
                  window.history.pushState({}, '', url);
              }
              updateRoute();
          },
          replace: function (location) {
              debugLog("[Router] Replace:", location);
              if (typeof location === 'string') {
                  window.history.replaceState({}, '', location);
              }
              else {
                  var loc = location;
                  var url = loc.path || window.location.pathname;
                  if (loc.query) {
                      var params = new URLSearchParams(loc.query);
                      url += '?' + params.toString();
                  }
                  if (loc.hash)
                      url += loc.hash;
                  window.history.replaceState({}, '', url);
              }
              updateRoute();
          },
          back: function () {
              window.history.back();
          },
          forward: function () {
              window.history.forward();
          },
          go: function (n) {
              window.history.go(n);
          }
      };
      // Update function
      var updateRoute = function () {
          var newRoute = parseRoute();
          Object.keys(newRoute).forEach(function (key) {
              routeState[key] = newRoute[key];
          });
      };
      // Listen to browser events (Back/Forward)
      if (typeof window !== 'undefined') {
          window.addEventListener('popstate', updateRoute);
          window.addEventListener('hashchange', updateRoute);
          // IMPORTANT: Monkey-patch pushState and replaceState
          // Because browser doesn't trigger 'popstate' on manual history calls
          var originalPushState_1 = window.history.pushState;
          var originalReplaceState_1 = window.history.replaceState;
          window.history.pushState = function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              var result = originalPushState_1.apply(this, args);
              updateRoute();
              return result;
          };
          window.history.replaceState = function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                  args[_i] = arguments[_i];
              }
              var result = originalReplaceState_1.apply(this, args);
              updateRoute();
              return result;
          };
      }
      // Expose as $route on prototype
      // We combine the state and the methods
      Object.defineProperty(Vue.prototype, '$route', {
          get: function () {
              // Use a Proxy to handle both reactive state and navigation methods
              return new Proxy(routeState, {
                  get: function (target, prop) {
                      if (prop in routerMethods) {
                          return routerMethods[prop];
                      }
                      return target[prop];
                  }
              });
          }
      });
      // Also expose Vue.router for global access
      Vue.router = routerMethods;
  }

  /**
   * v-loading directive
   * Provides a premium loading overlay for any element
   */
  var SPINNER_HTML = "\n  <div class=\"v-loading-spinner\">\n    <svg viewBox=\"0 0 50 50\">\n      <circle class=\"path\" cx=\"25\" cy=\"25\" r=\"20\" fill=\"none\" stroke-width=\"5\"></circle>\n    </svg>\n  </div>\n";
  var STYLE_ID = 'vue-loading-directive-style';
  function injectStyles() {
      if (document.getElementById(STYLE_ID))
          return;
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = "\n    .v-loading-parent--relative {\n      position: relative !important;\n    }\n    .v-loading-mask {\n      position: absolute;\n      z-index: 2000;\n      background-color: rgba(255, 255, 255, 0.7);\n      margin: 0;\n      top: 0;\n      right: 0;\n      bottom: 0;\n      left: 0;\n      transition: opacity 0.3s;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      backdrop-filter: blur(2px);\n      border-radius: inherit;\n    }\n    .v-loading-spinner {\n      width: 42px;\n      height: 42px;\n    }\n    .v-loading-spinner svg {\n      animation: rotate 2s linear infinite;\n      height: 100%;\n      width: 100%;\n    }\n    .v-loading-spinner .path {\n      stroke: #6366f1;\n      stroke-linecap: round;\n      animation: dash 1.5s ease-in-out infinite;\n    }\n    @keyframes rotate {\n      100% { transform: rotate(360deg); }\n    }\n    @keyframes dash {\n      0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }\n      50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }\n      100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }\n    }\n  ";
      document.head.appendChild(style);
  }
  var LoadingDirective = {
      bind: function (el, binding) {
          injectStyles();
          var mask = document.createElement('div');
          mask.className = 'v-loading-mask';
          mask.innerHTML = SPINNER_HTML;
          mask.style.display = binding.value ? 'flex' : 'none';
          mask.style.opacity = binding.value ? '1' : '0';
          el.loadingMask = mask;
          if (binding.value) {
              el.classList.add('v-loading-parent--relative');
              el.appendChild(mask);
          }
      },
      update: function (el, binding) {
          if (binding.value !== binding.oldValue) {
              if (binding.value) {
                  el.classList.add('v-loading-parent--relative');
                  el.appendChild(el.loadingMask);
                  el.loadingMask.style.display = 'flex';
                  setTimeout(function () {
                      el.loadingMask.style.opacity = '1';
                  }, 0);
              }
              else {
                  el.loadingMask.style.opacity = '0';
                  setTimeout(function () {
                      if (!binding.value && el.loadingMask.parentNode === el) {
                          el.loadingMask.style.display = 'none';
                          el.removeChild(el.loadingMask);
                          el.classList.remove('v-loading-parent--relative');
                      }
                  }, 300);
              }
          }
      },
      unbind: function (el) {
          if (el.loadingMask && el.loadingMask.parentNode === el) {
              el.removeChild(el.loadingMask);
          }
          el.loadingMask = null;
      }
  };

  /**
   * Minimalist require() implementation for browser
   * Supports module.exports pattern with Sync/Async support
   */
  var moduleCache = {};
  /**
   * Normalizes the path and ensures it has a .js extension
   */
  function normalizePath(path) {
      var url = path;
      if (!url.endsWith('.js')) {
          url = "".concat(url, ".js");
      }
      // Ensure absolute path if it starts with /
      return url;
  }
  /**
   * Main require implementation (Synchronous)
   */
  function requireSync(path) {
      var url = normalizePath(path);
      if (moduleCache[url]) {
          return moduleCache[url];
      }
      try {
          // Use Sync XHR to support synchronous require in browser
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, false); // false = synchronous
          xhr.send();
          if (xhr.status !== 200) {
              throw new Error("Failed to load module ".concat(url, ": Status ").concat(xhr.status));
          }
          var code = xhr.responseText;
          return executeModule(url, code);
      }
      catch (err) {
          console.error("[Require] Error loading ".concat(url, ":"), err);
          return null;
      }
  }
  /**
   * Async version of require
   */
  function requireAsync(path) {
      return __awaiter(this, void 0, void 0, function () {
          var url, response, code, err_1;
          return __generator(this, function (_a) {
              switch (_a.label) {
                  case 0:
                      url = normalizePath(path);
                      if (moduleCache[url]) {
                          return [2 /*return*/, moduleCache[url]];
                      }
                      _a.label = 1;
                  case 1:
                      _a.trys.push([1, 4, , 5]);
                      return [4 /*yield*/, fetch(url)];
                  case 2:
                      response = _a.sent();
                      if (!response.ok)
                          throw new Error("Failed to load module: ".concat(url));
                      return [4 /*yield*/, response.text()];
                  case 3:
                      code = _a.sent();
                      return [2 /*return*/, executeModule(url, code)];
                  case 4:
                      err_1 = _a.sent();
                      console.error("[Require] Error loading ".concat(url, ":"), err_1);
                      throw err_1;
                  case 5: return [2 /*return*/];
              }
          });
      });
  }
  /**
   * Executes module code in an isolated context
   */
  function executeModule(url, code) {
      var module = { exports: {} };
      var exports = module.exports;
      try {
          // Append sourceURL for better debugging in DevTools
          var sourceMap = "\n//# sourceURL=".concat(window.location.origin).concat(url);
          var wrapper = new Function('module', 'exports', 'require', code + sourceMap);
          wrapper(module, exports, window.require);
          moduleCache[url] = module.exports;
          return module.exports;
      }
      catch (err) {
          console.error("[Require] Execution error in ".concat(url, ":"), err);
          throw err;
      }
  }
  /**
   * Initialize global require functions
   */
  function initRequire() {
      if (typeof window !== 'undefined' && !window.require) {
          window.require = requireSync;
          window.requireAsync = requireAsync;
          // Also expose to Vue prototype if needed
          var globalVue = window.Vue;
          if (globalVue) {
              globalVue.prototype.$require = requireSync;
              globalVue.prototype.$requireAsync = requireAsync;
          }
      }
  }
  // Auto-init immediately when module is loaded
  initRequire();

  /**
   * Vue 2 Steroids - HMR Client
   *
   * Hot Module Replacement client for Vue Steroids.
   * Menghubungkan ke HMR WebSocket server untuk hot-reload
   * komponen, style, dan script saat development.
   *
   * Alur:
   *   1. Connect ke WebSocket server (Vue.config.hmrHost:hmrPort)
   *   2. Kirim sinyal watch dengan extensions dari config
   *   3. Server kirim event saat file berubah
   *   4. Client handle: .tpl/.vue → re-register, .css → inject, .js → reload
   */
  var HMRClient = /** @class */ (function () {
      function HMRClient() {
          this.socket = null;
          this.connected = false;
          this.reconnectAttempts = 0;
          this.maxReconnectAttempts = 20;
          this.reconnectDelay = 1000;
          this.destroyed = false;
      }
      /**
       * Connect ke HMR WebSocket server
       */
      HMRClient.prototype.connect = function () {
          var _this = this;
          if (this.destroyed)
              return;
          if (!config.hmr)
              return;
          var protocol = config.hmrSecure ? 'wss' : 'ws';
          var url = "".concat(protocol, "://").concat(config.hmrHost, ":").concat(config.hmrPort);
          debugLog("[HMR] Connecting to ".concat(url, "..."));
          try {
              this.socket = new WebSocket(url);
              this.socket.onopen = function () {
                  _this.connected = true;
                  _this.reconnectAttempts = 0;
                  _this.reconnectDelay = 1000;
                  debugLog('[HMR] ✅ Connected to HMR server');
                  _this.sendWatchSignal();
              };
              this.socket.onmessage = function (event) {
                  try {
                      var data = JSON.parse(event.data);
                      _this.handleMessage(data);
                  }
                  catch (e) {
                      warn$2('[HMR] Invalid message from server: ' + (e === null || e === void 0 ? void 0 : e.message));
                  }
              };
              this.socket.onclose = function () {
                  _this.connected = false;
                  if (!_this.destroyed) {
                      debugLog('[HMR] ❌ Disconnected from HMR server');
                      _this.reconnect();
                  }
              };
              this.socket.onerror = function (event) {
                  warn$2('[HMR] Connection error: ' + JSON.stringify({ type: event.type }));
              };
          }
          catch (e) {
              warn$2('[HMR] Failed to create WebSocket connection');
              this.reconnect();
          }
      };
      /**
       * Kirim sinyal watch ke server
       * Client memberi tahu server file extensions apa yang perlu di-watch
       */
      HMRClient.prototype.sendWatchSignal = function () {
          var extensions = config.hmrFiles || ['css', 'vue', 'tpl', 'js'];
          this.send({
              type: 'watch',
              extensions: extensions
          });
          debugLog("[HMR] Sent watch signal for: ".concat(extensions.join(', ')));
      };
      /**
       * Handle pesan dari server
       */
      HMRClient.prototype.handleMessage = function (data) {
          var _a;
          switch (data.type) {
              case 'change':
                  if (data.file && data.ext) {
                      this.handleFileChange(data.file, data.ext, (_a = data.content) !== null && _a !== void 0 ? _a : undefined);
                  }
                  else {
                      warn$2("[HMR] Change event missing file or extension");
                  }
                  break;
              case 'connected':
                  debugLog("[HMR] Server acknowledged (clientId: ".concat(data.clientId, ")"));
                  break;
              case 'error':
                  warn$2("[HMR] Server error: ".concat(data.message || 'Unknown error'));
                  break;
              default:
                  debugLog("[HMR] Unknown message type: ".concat(data.type));
          }
      };
      /**
       * Handle perubahan file berdasarkan extension
       */
      HMRClient.prototype.handleFileChange = function (file, ext, content) {
          debugLog("[HMR] File changed: ".concat(file, " (").concat(ext, ")"));
          switch (ext) {
              case 'tpl':
                  this.handleComponentChange(file, content);
                  break;
              case 'vue':
                  this.handleComponentChange(file, content);
                  break;
              case 'css':
                  this.handleStyleChange(file, content);
                  break;
              case 'js':
                  this.handleScriptChange(file, content);
                  break;
              default:
                  debugLog("[HMR] Unhandled extension: ".concat(ext));
          }
      };
      /**
       * Handle perubahan .tpl atau .vue file
       * Re-register komponen + force update
       */
      HMRClient.prototype.handleComponentChange = function (file, content) {
          // Extract component name dari filename
          var name = this.getComponentName(file);
          if (!name) {
              warn$2("[HMR] Could not extract component name from: ".concat(file));
              return;
          }
          if (content) {
              // Parse konten file dan register ulang
              var parsed = parseComponentFile$1(content);
              if (parsed.script) {
                  try {
                      // Evaluate script
                      var module_1 = { exports: {} };
                      var exports_1 = module_1.exports;
                      // Support export default
                      var scriptContent = parsed.script;
                      if (/\bexport\s+default\b/.test(scriptContent)) {
                          scriptContent = scriptContent.replace(/\bexport\s+default\b/g, 'module.exports =');
                      }
                      var wrappedScript = "(function(module, exports) {\n            ".concat(scriptContent, "\n          })");
                      var fn = eval(wrappedScript);
                      fn(module_1, exports_1);
                      var componentDef = module_1.exports || {};
                      // Set template jika ada
                      if (parsed.template) {
                          componentDef.template = parsed.template;
                      }
                      if (parsed.loadingTemplate) {
                          componentDef.loadingTemplate = parsed.loadingTemplate;
                      }
                      // Tandai sebagai hot-reloaded
                      componentDef.__hmr = true;
                      // Re-register component
                      defineDynamicComponent(name, componentDef);
                      debugLog("[HMR] \uD83D\uDD04 Hot-reloaded component: ".concat(name));
                  }
                  catch (e) {
                      warn$2("[HMR] Failed to evaluate component script: ".concat(name, ": ").concat((e === null || e === void 0 ? void 0 : e.message) || 'Unknown error'));
                  }
              }
              else {
                  warn$2("[HMR] No script found in: ".concat(file));
              }
          }
          else {
              // Tanpa konten, fetch ulang dari server
              debugLog("[HMR] Fetching component from server: ".concat(name));
              fetchDynamicComponent(name, "/".concat(name).concat(config.componentExtension || '.tpl'));
          }
      };
      /**
       * Handle perubahan .css file
       * Inject/replace <style> tag
       */
      HMRClient.prototype.handleStyleChange = function (file, content) {
          if (!content) {
              debugLog("[HMR] No content for style: ".concat(file));
              return;
          }
          // Gunakan path file sebagai ID unik
          var styleId = "hmr-style-".concat(file.replace(/[^a-zA-Z0-9]/g, '-'));
          // Cari existing style tag atau buat baru
          var styleTag = document.getElementById(styleId);
          if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.id = styleId;
              document.head.appendChild(styleTag);
          }
          // Update content
          styleTag.textContent = content;
          debugLog("[HMR] \uD83C\uDFA8 Hot-reloaded style: ".concat(file));
      };
      /**
       * Handle perubahan .js file
       * Full page reload karena JS bisa mengubah state global
       */
      HMRClient.prototype.handleScriptChange = function (file, content) {
          debugLog("[HMR] \uD83D\uDD04 Script changed, full reload: ".concat(file));
          // Full page reload untuk keamanan state
          window.location.reload();
      };
      /**
       * Extract component name dari file path
       * Contoh:
       *   /components/input/input-text.tpl → input-text
       *   components/Button.vue → Button
       *   header.tpl → header
       */
      HMRClient.prototype.getComponentName = function (filePath) {
          // Hapus extension
          var name = filePath.replace(/\.(tpl|vue|html)$/i, '');
          // Ambil segmen terakhir
          var segments = name.split('/').filter(Boolean);
          name = segments[segments.length - 1] || '';
          // Kebab-case to PascalCase untuk component naming
          return name;
      };
      /**
       * Kirim pesan ke server
       */
      HMRClient.prototype.send = function (data) {
          if (this.socket && this.connected) {
              this.socket.send(JSON.stringify(data));
          }
      };
      /**
       * Reconnect dengan exponential backoff
       * 1s → 2s → 4s → 8s → 16s → 32s → 60s (max)
       */
      HMRClient.prototype.reconnect = function () {
          var _this = this;
          if (this.destroyed)
              return;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              warn$2('[HMR] Max reconnection attempts reached. Stopping HMR.');
              return;
          }
          this.reconnectAttempts++;
          var delay = Math.min(this.reconnectDelay, 60000);
          debugLog("[HMR] Reconnecting in ".concat(delay, "ms (attempt ").concat(this.reconnectAttempts, "/").concat(this.maxReconnectAttempts, ")"));
          setTimeout(function () {
              if (!_this.destroyed) {
                  _this.connect();
              }
          }, delay);
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s, 60s, 60s...
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, 60000);
      };
      /**
       * Disconnect dari server
       */
      HMRClient.prototype.disconnect = function () {
          this.destroyed = true;
          if (this.socket) {
              this.socket.close();
              this.socket = null;
          }
          this.connected = false;
          debugLog('[HMR] Disconnected');
      };
      return HMRClient;
  }());
  // =====================================================
  // HMR Client Manager
  // =====================================================
  var hmrInstance = null;
  /**
   * Inisialisasi HMR client
   * Dipanggil dari global-api/index.ts saat Vue.initGlobalAPI()
   *
   * Note: HMR client dibuat terlepas dari config.hmr value.
   * Jika config.hmr = false, client dibuat tapi tidak connect.
   * User bisa trigger connect manual via Vue.prototype.$hmr.connect()
   * atau set Vue.config.hmr = true, lalu panggil Vue.connectHMR()
   */
  function initHMR(Vue) {
      if (typeof window === 'undefined') {
          debugLog('[HMR] HMR not available in non-browser environment');
          return;
      }
      // Cek WebSocket availability
      if (typeof WebSocket === 'undefined') {
          warn$2('[HMR] WebSocket is not available in this browser');
          return;
      }
      // Buat instance HMR client SELALU (meski disabled)
      hmrInstance = new HMRClient();
      Vue.prototype.$hmr = hmrInstance;
      // Expose method untuk trigger connect manual
      Vue.connectHMR = function () {
          config.hmr = true;
          if (hmrInstance && !hmrInstance['connected']) {
              hmrInstance.connect();
          }
      };
      Vue.disconnectHMR = function () {
          config.hmr = false;
          if (hmrInstance) {
              hmrInstance.disconnect();
          }
      };
      // Tunda koneksi ke setTimeout (macrotask) agar user punya kesempatan
      // set Vue.config.hmr = true di <script> terpisah SEBELUM koneksi dilakukan.
      // Vue.nextTick (microtask) tidak bisa karena microtask jalan
      // setelah script tag saat ini, TAPI SEBELUM script tag berikutnya.
      // setTimeout(macrotask) jalan setelah SEMUA script tag selesai.
      setTimeout(function () {
          if (config.hmr) {
              hmrInstance.connect();
              debugLog("[HMR] Auto-connected (ws://".concat(config.hmrHost, ":").concat(config.hmrPort, ")"));
          }
          else {
              debugLog('[HMR] Client created (idle). Set config.hmr = true or call Vue.connectHMR() to connect');
          }
      }, 0);
  }

  function initGlobalAPI(Vue) {
      // config
      var configDef = {};
      configDef.get = function () { return config; };
      {
          configDef.set = function () {
              warn$2('Do not replace the Vue.config object, set individual fields instead.');
          };
      }
      Object.defineProperty(Vue, 'config', configDef);
      // exposed util methods.
      // NOTE: these are not considered part of the public API - avoid relying on
      // them unless you are aware of the risk.
      Vue.util = {
          warn: warn$2,
          extend: extend$1,
          mergeOptions: mergeOptions,
          defineReactive: defineReactive
      };
      Vue.set = set;
      Vue.delete = del;
      Vue.nextTick = nextTick;
      // 2.6 explicit observable API
      Vue.observable = function (obj) {
          observe(obj);
          return obj;
      };
      Vue.options = Object.create(null);
      ASSET_TYPES.forEach(function (type) {
          Vue.options[type + 's'] = Object.create(null);
      });
      // this is used to identify the "base" constructor to extend all plain-object
      // components with in Weex's multi-instance scenarios.
      Vue.options._base = Vue;
      extend$1(Vue.options.components, builtInComponents);
      initUse(Vue);
      initMixin(Vue);
      initExtend(Vue);
      initAssetRegisters(Vue);
      // Initialize HTTP client with config
      initHttpClient();
      // Add HTTP methods to Vue prototype
      initHttp(Vue);
      // Initialize RTC client (will auto-poll for config)
      initRtcClient();
      // Add RTC methods to Vue prototype
      initRtc(Vue);
      Vue.rtc = getRtcClient();
      // Initialize global store if config.store is provided
      if (config.store) {
          createStore(config.store);
          debugLog('[Vue.initGlobalAPI] Global store initialized');
      }
      Vue.Store = Store;
      Vue.createStore = createStore;
      Vue.mapState = mapState;
      Vue.mapGetters = mapGetters;
      Vue.mapMutations = mapMutations;
      Vue.mapActions = mapActions;
      Vue.loadAsyncComponent = loadAsyncComponent;
      // Install Storage plugin
      installStorage(Vue);
      debugLog('[Vue.initGlobalAPI] Storage plugin installed');
      // Install Hooks plugin
      installHooks(Vue);
      debugLog('[Vue.initGlobalAPI] Hooks plugin installed');
      // Add defineDynamicComponent as a global API
      // This allows components to be registered dynamically, even after Vue instance init
      Vue.defineDynamicComponent = defineDynamicComponent;
      Vue.dynamicComponent = defineDynamicComponent;
      debugLog('[Vue.initGlobalAPI] Vue.defineDynamicComponent registered');
      // Initialize standalone reactive system
      initReactive(Vue);
      debugLog('[Vue.initGlobalAPI] Standalone Reactive system initialized');
      // Initialize built-in router
      initRouter(Vue);
      debugLog('[Vue.initGlobalAPI] Built-in Router initialized');
      // Register global directives
      Vue.directive('loading', LoadingDirective);
      debugLog('[Vue.initGlobalAPI] v-loading directive registered');
      // Initialize require functionality
      initRequire();
      debugLog('[Vue.initGlobalAPI] Require system initialized');
      // Initialize HMR client (will auto-connect if config.hmr = true)
      initHMR(Vue);
      debugLog('[Vue.initGlobalAPI] HMR client initialized');
      // Register Portal components directly to avoid circular dependency issues
      var portalBusState = Vue.observable({ portals: {} });
      Vue.portalBus = portalBusState;
      Vue.component('Portal', {
          props: {
              to: String,
              disabled: Boolean
          },
          watch: {
              to: function (newTo, oldTo) {
                  var _a;
                  if (oldTo && ((_a = portalBusState.portals[oldTo]) === null || _a === void 0 ? void 0 : _a.owner) === this) {
                      this.$delete(portalBusState.portals, oldTo);
                  }
                  this.sendToBus();
              },
              disabled: function () {
                  this.sendToBus();
              }
          },
          methods: {
              sendToBus: function () {
                  var _this = this;
                  var _a;
                  if (this.disabled) {
                      if (this.to && ((_a = portalBusState.portals[this.to]) === null || _a === void 0 ? void 0 : _a.owner) === this) {
                          this.$delete(portalBusState.portals, this.to);
                      }
                  }
                  else {
                      this.$nextTick(function () {
                          if (_this.to) {
                              _this.$set(portalBusState.portals, _this.to, {
                                  vnodes: _this.$slots.default,
                                  owner: _this
                              });
                          }
                      });
                  }
              }
          },
          mounted: function () {
              this.sendToBus();
          },
          updated: function () {
              this.sendToBus();
          },
          beforeDestroy: function () {
              var _a;
              if (this.to && ((_a = portalBusState.portals[this.to]) === null || _a === void 0 ? void 0 : _a.owner) === this) {
                  this.$delete(portalBusState.portals, this.to);
              }
          },
          render: function (h) {
              return h();
          }
      });
      Vue.component('PortalTarget', {
          props: {
              name: {
                  type: String,
                  required: true
              },
              tag: {
                  type: String,
                  default: 'div'
              }
          },
          data: function () {
              return {
                  ownVNodes: []
              };
          },
          created: function () {
              var _this = this;
              this.$watch(function () { return portalBusState.portals[_this.name]; }, function (portalData) {
                  _this.ownVNodes = portalData ? portalData.vnodes : [];
              }, { immediate: true, deep: true });
          },
          render: function (h) {
              var vnodes = this.ownVNodes;
              if (vnodes && vnodes.length > 0) {
                  return h(this.tag, vnodes);
              }
              return h();
          }
      });
      debugLog('[Vue.initGlobalAPI] Portal components registered');
  }

  initGlobalAPI(Vue);
  Object.defineProperty(Vue.prototype, '$isServer', {
      get: isServerRendering
  });
  Object.defineProperty(Vue.prototype, '$ssrContext', {
      get: function () {
          /* istanbul ignore next */
          return this.$vnode && this.$vnode.ssrContext;
      }
  });
  // expose FunctionalRenderContext for ssr runtime helper installation
  Object.defineProperty(Vue, 'FunctionalRenderContext', {
      value: FunctionalRenderContext
  });
  Vue.version = version;

  // these are reserved for web because they are directly compiled away
  // during template compilation
  var isReservedAttr = makeMap('style,class');
  // attributes that should be using props for binding
  var acceptValue = makeMap('input,textarea,option,select,progress');
  var mustUseProp = function (tag, type, attr) {
      return ((attr === 'value' && acceptValue(tag) && type !== 'button') ||
          (attr === 'selected' && tag === 'option') ||
          (attr === 'checked' && tag === 'input') ||
          (attr === 'muted' && tag === 'video'));
  };
  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');
  var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');
  var convertEnumeratedValue = function (key, value) {
      return isFalsyAttrValue(value) || value === 'false'
          ? 'false'
          : // allow arbitrary string value for contenteditable
              key === 'contenteditable' && isValidContentEditableValue(value)
                  ? value
                  : 'true';
  };
  var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
      'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
      'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
      'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
      'required,reversed,scoped,seamless,selected,sortable,' +
      'truespeed,typemustmatch,visible');
  var xlinkNS = 'http://www.w3.org/1999/xlink';
  var isXlink = function (name) {
      return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
  };
  var getXlinkProp = function (name) {
      return isXlink(name) ? name.slice(6, name.length) : '';
  };
  var isFalsyAttrValue = function (val) {
      return val == null || val === false;
  };

  function genClassForVnode(vnode) {
      var data = vnode.data;
      var parentNode = vnode;
      var childNode = vnode;
      while (isDef(childNode.componentInstance)) {
          childNode = childNode.componentInstance._vnode;
          if (childNode && childNode.data) {
              data = mergeClassData(childNode.data, data);
          }
      }
      // @ts-expect-error parentNode.parent not VNodeWithData
      while (isDef((parentNode = parentNode.parent))) {
          if (parentNode && parentNode.data) {
              data = mergeClassData(data, parentNode.data);
          }
      }
      return renderClass(data.staticClass, data.class);
  }
  function mergeClassData(child, parent) {
      return {
          staticClass: concat(child.staticClass, parent.staticClass),
          class: isDef(child.class) ? [child.class, parent.class] : parent.class
      };
  }
  function renderClass(staticClass, dynamicClass) {
      if (isDef(staticClass) || isDef(dynamicClass)) {
          return concat(staticClass, stringifyClass(dynamicClass));
      }
      /* istanbul ignore next */
      return '';
  }
  function concat(a, b) {
      return a ? (b ? a + ' ' + b : a) : b || '';
  }
  function stringifyClass(value) {
      if (Array.isArray(value)) {
          return stringifyArray(value);
      }
      if (isObject$1(value)) {
          return stringifyObject(value);
      }
      if (typeof value === 'string') {
          return value;
      }
      /* istanbul ignore next */
      return '';
  }
  function stringifyArray(value) {
      var res = '';
      var stringified;
      for (var i = 0, l = value.length; i < l; i++) {
          if (isDef((stringified = stringifyClass(value[i]))) && stringified !== '') {
              if (res)
                  res += ' ';
              res += stringified;
          }
      }
      return res;
  }
  function stringifyObject(value) {
      var res = '';
      for (var key in value) {
          if (value[key]) {
              if (res)
                  res += ' ';
              res += key;
          }
      }
      return res;
  }

  var namespaceMap = {
      svg: 'http://www.w3.org/2000/svg',
      math: 'http://www.w3.org/1998/Math/MathML'
  };
  var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title,' +
      'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
      'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
      'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
      's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
      'embed,object,param,source,canvas,script,noscript,del,ins,' +
      'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
      'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
      'output,progress,select,textarea,' +
      'details,dialog,menu,menuitem,summary,' +
      'content,element,shadow,template,blockquote,iframe,tfoot,' +
      'props,field');
  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  var isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
      'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
      'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true);
  var isPreTag = function (tag) { return tag === 'pre'; };
  var isReservedTag = function (tag) {
      return isHTMLTag(tag) || isSVG(tag);
  };
  function getTagNamespace(tag) {
      if (isSVG(tag)) {
          return 'svg';
      }
      // basic support for MathML
      // note it doesn't support other MathML elements being component roots
      if (tag === 'math') {
          return 'math';
      }
  }
  var unknownElementCache = Object.create(null);
  function isUnknownElement(tag) {
      /* istanbul ignore if */
      if (!inBrowser) {
          return true;
      }
      if (isReservedTag(tag)) {
          return false;
      }
      tag = tag.toLowerCase();
      /* istanbul ignore if */
      if (unknownElementCache[tag] != null) {
          return unknownElementCache[tag];
      }
      var el = document.createElement(tag);
      if (tag.indexOf('-') > -1) {
          // https://stackoverflow.com/a/28210364/1070244
          return (unknownElementCache[tag] =
              el.constructor === window.HTMLUnknownElement ||
                  el.constructor === window.HTMLElement);
      }
      else {
          return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()));
      }
  }
  var isTextInputType = makeMap('text,number,password,search,email,tel,url');

  /**
   * Query an element selector if it's not an element already.
   */
  function query(el) {
      if (typeof el === 'string') {
          var selected = document.querySelector(el);
          if (!selected) {
              warn$2('Cannot find element: ' + el);
              return document.createElement('div');
          }
          return selected;
      }
      else {
          return el;
      }
  }

  function createElement(tagName, vnode) {
      var elm = document.createElement(tagName);
      if (tagName !== 'select') {
          return elm;
      }
      // false or null will remove the attribute but undefined will not
      if (vnode.data &&
          vnode.data.attrs &&
          vnode.data.attrs.multiple !== undefined) {
          elm.setAttribute('multiple', 'multiple');
      }
      return elm;
  }
  function createElementNS(namespace, tagName) {
      return document.createElementNS(namespaceMap[namespace], tagName);
  }
  function createTextNode(text) {
      return document.createTextNode(text);
  }
  function createComment(text) {
      return document.createComment(text);
  }
  function insertBefore(parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
  }
  function removeChild(node, child) {
      node.removeChild(child);
  }
  function appendChild(node, child) {
      node.appendChild(child);
  }
  function parentNode(node) {
      return node.parentNode;
  }
  function nextSibling(node) {
      return node.nextSibling;
  }
  function tagName(node) {
      return node.tagName;
  }
  function setTextContent(node, text) {
      node.textContent = text;
  }
  function setStyleScope(node, scopeId) {
      node.setAttribute(scopeId, '');
  }

  var nodeOps = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createElement: createElement,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
  });

  var ref = {
      create: function (_, vnode) {
          registerRef(vnode);
      },
      update: function (oldVnode, vnode) {
          if (oldVnode.data.ref !== vnode.data.ref) {
              registerRef(oldVnode, true);
              registerRef(vnode);
          }
      },
      destroy: function (vnode) {
          registerRef(vnode, true);
      }
  };
  function registerRef(vnode, isRemoval) {
      var ref = vnode.data.ref;
      if (!isDef(ref))
          return;
      var vm = vnode.context;
      var refValue = vnode.componentInstance || vnode.elm;
      var value = isRemoval ? null : refValue;
      var $refsValue = isRemoval ? undefined : refValue;
      if (isFunction$2(ref)) {
          invokeWithErrorHandling(ref, vm, [value], vm, "template ref function");
          return;
      }
      var isFor = vnode.data.refInFor;
      var _isString = typeof ref === 'string' || typeof ref === 'number';
      var _isRef = isRef(ref);
      var refs = vm.$refs;
      if (_isString || _isRef) {
          if (isFor) {
              var existing = _isString ? refs[ref] : ref.value;
              if (isRemoval) {
                  isArray$1(existing) && remove$2(existing, refValue);
              }
              else {
                  if (!isArray$1(existing)) {
                      if (_isString) {
                          refs[ref] = [refValue];
                          setSetupRef(vm, ref, refs[ref]);
                      }
                      else {
                          ref.value = [refValue];
                      }
                  }
                  else if (!existing.includes(refValue)) {
                      existing.push(refValue);
                  }
              }
          }
          else if (_isString) {
              if (isRemoval && refs[ref] !== refValue) {
                  return;
              }
              refs[ref] = $refsValue;
              setSetupRef(vm, ref, value);
          }
          else if (_isRef) {
              if (isRemoval && ref.value !== refValue) {
                  return;
              }
              ref.value = value;
          }
          else {
              warn$2("Invalid template ref type: ".concat(typeof ref));
          }
      }
  }
  function setSetupRef(_a, key, val) {
      var _setupState = _a._setupState;
      if (_setupState && hasOwn(_setupState, key)) {
          if (isRef(_setupState[key])) {
              _setupState[key].value = val;
          }
          else {
              _setupState[key] = val;
          }
      }
  }

  /**
   * Virtual DOM patching algorithm based on Snabbdom by
   * Simon Friis Vindum (@paldepind)
   * Licensed under the MIT License
   * https://github.com/paldepind/snabbdom/blob/master/LICENSE
   *
   * modified by Evan You (@yyx990803)
   *
   * Not type-checking this because this file is perf-critical and the cost
   * of making flow understand it is not worth it.
   */
  var emptyNode = new VNode('', {}, []);
  var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];
  function sameVnode(a, b) {
      return (a.key === b.key &&
          a.asyncFactory === b.asyncFactory &&
          ((a.tag === b.tag &&
              a.isComment === b.isComment &&
              isDef(a.data) === isDef(b.data) &&
              sameInputType(a, b)) ||
              (isTrue(a.isAsyncPlaceholder) && isUndef(b.asyncFactory.error))));
  }
  function sameInputType(a, b) {
      if (a.tag !== 'input')
          return true;
      var i;
      var typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type;
      var typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type;
      return typeA === typeB || (isTextInputType(typeA) && isTextInputType(typeB));
  }
  function createKeyToOldIdx(children, beginIdx, endIdx) {
      var i, key;
      var map = {};
      for (i = beginIdx; i <= endIdx; ++i) {
          key = children[i].key;
          if (isDef(key))
              map[key] = i;
      }
      return map;
  }
  function createPatchFunction(backend) {
      var i, j;
      var cbs = {};
      var modules = backend.modules, nodeOps = backend.nodeOps;
      for (i = 0; i < hooks.length; ++i) {
          cbs[hooks[i]] = [];
          for (j = 0; j < modules.length; ++j) {
              if (isDef(modules[j][hooks[i]])) {
                  cbs[hooks[i]].push(modules[j][hooks[i]]);
              }
          }
      }
      function emptyNodeAt(elm) {
          return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
      }
      function createRmCb(childElm, listeners) {
          function remove() {
              if (--remove.listeners === 0) {
                  removeNode(childElm);
              }
          }
          remove.listeners = listeners;
          return remove;
      }
      function removeNode(el) {
          var parent = nodeOps.parentNode(el);
          // element may have already been removed due to v-html / v-text
          if (isDef(parent)) {
              nodeOps.removeChild(parent, el);
          }
      }
      function isUnknownElement(vnode, inVPre) {
          return (!inVPre &&
              !vnode.ns &&
              !(config.ignoredElements.length &&
                  config.ignoredElements.some(function (ignore) {
                      return isRegExp$1(ignore)
                          ? ignore.test(vnode.tag)
                          : ignore === vnode.tag;
                  })) &&
              vnode.tag !== 'props' &&
              vnode.tag !== 'field' &&
              config.isUnknownElement(vnode.tag));
      }
      var creatingElmInVPre = 0;
      function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
          if (isDef(vnode.elm) && isDef(ownerArray)) {
              // This vnode was used in a previous render!
              // now it's used as a new node, overwriting its elm would cause
              // potential patch errors down the road when it's used as an insertion
              // reference node. Instead, we clone the node on-demand before creating
              // associated DOM element for it.
              vnode = ownerArray[index] = cloneVNode(vnode);
          }
          vnode.isRootInsert = !nested; // for transition enter check
          if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
              return;
          }
          var data = vnode.data;
          var children = vnode.children;
          var tag = vnode.tag;
          /**
           * We wanna know tag element name
           * Component created
           */
          if (isDef(tag)) {
              {
                  if (data && data.pre) {
                      creatingElmInVPre++;
                  }
                  if (isUnknownElement(vnode, creatingElmInVPre)) {
                      warn$2('Unknown custom element: <' +
                          tag +
                          '> - did you ' +
                          'register the component correctly? For recursive components, ' +
                          'make sure to provide the "name" option.', vnode.context);
                  }
              }
              vnode.elm = vnode.ns
                  ? nodeOps.createElementNS(vnode.ns, tag)
                  : nodeOps.createElement(tag, vnode);
              setScope(vnode);
              createChildren(vnode, children, insertedVnodeQueue);
              if (isDef(data)) {
                  invokeCreateHooks(vnode, insertedVnodeQueue);
              }
              insert(parentElm, vnode.elm, refElm);
              if (data && data.pre) {
                  creatingElmInVPre--;
              }
          }
          else if (isTrue(vnode.isComment)) {
              vnode.elm = nodeOps.createComment(vnode.text);
              insert(parentElm, vnode.elm, refElm);
          }
          else {
              vnode.elm = nodeOps.createTextNode(vnode.text);
              insert(parentElm, vnode.elm, refElm);
          }
      }
      function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
          var i = vnode.data;
          if (isDef(i)) {
              var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
              if (isDef((i = i.hook)) && isDef((i = i.init))) {
                  i(vnode, false /* hydrating */);
              }
              // after calling the init hook, if the vnode is a child component
              // it should've created a child instance and mounted it. the child
              // component also has set the placeholder vnode's elm.
              // in that case we can just return the element and be done.
              if (isDef(vnode.componentInstance)) {
                  initComponent(vnode, insertedVnodeQueue);
                  insert(parentElm, vnode.elm, refElm);
                  if (isTrue(isReactivated)) {
                      reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
                  }
                  return true;
              }
          }
      }
      function initComponent(vnode, insertedVnodeQueue) {
          if (isDef(vnode.data.pendingInsert)) {
              insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
              vnode.data.pendingInsert = null;
          }
          vnode.elm = vnode.componentInstance.$el;
          if (isPatchable(vnode)) {
              invokeCreateHooks(vnode, insertedVnodeQueue);
              setScope(vnode);
          }
          else {
              // empty component root.
              // skip all element-related modules except for ref (#3455)
              registerRef(vnode);
              // make sure to invoke the insert hook
              insertedVnodeQueue.push(vnode);
          }
      }
      function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
          var i;
          // hack for #4339: a reactivated component with inner transition
          // does not trigger because the inner node's created hooks are not called
          // again. It's not ideal to involve module-specific logic in here but
          // there doesn't seem to be a better way to do it.
          var innerNode = vnode;
          while (innerNode.componentInstance) {
              innerNode = innerNode.componentInstance._vnode;
              if (isDef((i = innerNode.data)) && isDef((i = i.transition))) {
                  for (i = 0; i < cbs.activate.length; ++i) {
                      cbs.activate[i](emptyNode, innerNode);
                  }
                  insertedVnodeQueue.push(innerNode);
                  break;
              }
          }
          // unlike a newly created component,
          // a reactivated keep-alive component doesn't insert itself
          insert(parentElm, vnode.elm, refElm);
      }
      function insert(parent, elm, ref) {
          if (isDef(parent)) {
              if (isDef(ref)) {
                  if (nodeOps.parentNode(ref) === parent) {
                      nodeOps.insertBefore(parent, elm, ref);
                  }
              }
              else {
                  nodeOps.appendChild(parent, elm);
              }
          }
      }
      function createChildren(vnode, children, insertedVnodeQueue) {
          if (isArray$1(children)) {
              {
                  checkDuplicateKeys(children);
              }
              for (var i_1 = 0; i_1 < children.length; ++i_1) {
                  createElm(children[i_1], insertedVnodeQueue, vnode.elm, null, true, children, i_1);
              }
          }
          else if (isPrimitive(vnode.text)) {
              nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
          }
      }
      function isPatchable(vnode) {
          while (vnode.componentInstance) {
              vnode = vnode.componentInstance._vnode;
          }
          return isDef(vnode.tag);
      }
      function invokeCreateHooks(vnode, insertedVnodeQueue) {
          for (var i_2 = 0; i_2 < cbs.create.length; ++i_2) {
              cbs.create[i_2](emptyNode, vnode);
          }
          i = vnode.data.hook; // Reuse variable
          if (isDef(i)) {
              if (isDef(i.create))
                  i.create(emptyNode, vnode);
              if (isDef(i.insert))
                  insertedVnodeQueue.push(vnode);
          }
      }
      // set scope id attribute for scoped CSS.
      // this is implemented as a special case to avoid the overhead
      // of going through the normal attribute patching process.
      function setScope(vnode) {
          var i;
          if (isDef((i = vnode.fnScopeId))) {
              nodeOps.setStyleScope(vnode.elm, i);
          }
          else {
              var ancestor = vnode;
              while (ancestor) {
                  if (isDef((i = ancestor.context)) && isDef((i = i.$options._scopeId))) {
                      nodeOps.setStyleScope(vnode.elm, i);
                  }
                  ancestor = ancestor.parent;
              }
          }
          // for slot content they should also get the scopeId from the host instance.
          if (isDef((i = activeInstance)) &&
              i !== vnode.context &&
              i !== vnode.fnContext &&
              isDef((i = i.$options._scopeId))) {
              nodeOps.setStyleScope(vnode.elm, i);
          }
      }
      function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
          for (; startIdx <= endIdx; ++startIdx) {
              createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
          }
      }
      function invokeDestroyHook(vnode) {
          var i, j;
          var data = vnode.data;
          if (isDef(data)) {
              if (isDef((i = data.hook)) && isDef((i = i.destroy)))
                  i(vnode);
              for (i = 0; i < cbs.destroy.length; ++i)
                  cbs.destroy[i](vnode);
          }
          if (isDef((i = vnode.children))) {
              for (j = 0; j < vnode.children.length; ++j) {
                  invokeDestroyHook(vnode.children[j]);
              }
          }
      }
      function removeVnodes(vnodes, startIdx, endIdx) {
          for (; startIdx <= endIdx; ++startIdx) {
              var ch = vnodes[startIdx];
              if (isDef(ch)) {
                  if (isDef(ch.tag)) {
                      removeAndInvokeRemoveHook(ch);
                      invokeDestroyHook(ch);
                  }
                  else {
                      // Text node
                      removeNode(ch.elm);
                  }
              }
          }
      }
      function removeAndInvokeRemoveHook(vnode, rm) {
          if (isDef(rm) || isDef(vnode.data)) {
              var i_3;
              var listeners = cbs.remove.length + 1;
              if (isDef(rm)) {
                  // we have a recursively passed down rm callback
                  // increase the listeners count
                  rm.listeners += listeners;
              }
              else {
                  // directly removing
                  rm = createRmCb(vnode.elm, listeners);
              }
              // recursively invoke hooks on child component root node
              if (isDef((i_3 = vnode.componentInstance)) &&
                  isDef((i_3 = i_3._vnode)) &&
                  isDef(i_3.data)) {
                  removeAndInvokeRemoveHook(i_3, rm);
              }
              for (i_3 = 0; i_3 < cbs.remove.length; ++i_3) {
                  cbs.remove[i_3](vnode, rm);
              }
              if (isDef((i_3 = vnode.data.hook)) && isDef((i_3 = i_3.remove))) {
                  i_3(vnode, rm);
              }
              else {
                  rm();
              }
          }
          else {
              removeNode(vnode.elm);
          }
      }
      function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
          var oldStartIdx = 0;
          var newStartIdx = 0;
          var oldEndIdx = oldCh.length - 1;
          var oldStartVnode = oldCh[0];
          var oldEndVnode = oldCh[oldEndIdx];
          var newEndIdx = newCh.length - 1;
          var newStartVnode = newCh[0];
          var newEndVnode = newCh[newEndIdx];
          var oldKeyToIdx, idxInOld, vnodeToMove, refElm;
          // removeOnly is a special flag used only by <transition-group>
          // to ensure removed elements stay in correct relative positions
          // during leaving transitions
          var canMove = !removeOnly;
          {
              checkDuplicateKeys(newCh);
          }
          while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
              if (isUndef(oldStartVnode)) {
                  oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
              }
              else if (isUndef(oldEndVnode)) {
                  oldEndVnode = oldCh[--oldEndIdx];
              }
              else if (sameVnode(oldStartVnode, newStartVnode)) {
                  patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                  oldStartVnode = oldCh[++oldStartIdx];
                  newStartVnode = newCh[++newStartIdx];
              }
              else if (sameVnode(oldEndVnode, newEndVnode)) {
                  patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
                  oldEndVnode = oldCh[--oldEndIdx];
                  newEndVnode = newCh[--newEndIdx];
              }
              else if (sameVnode(oldStartVnode, newEndVnode)) {
                  // Vnode moved right
                  patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
                  canMove &&
                      nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                  oldStartVnode = oldCh[++oldStartIdx];
                  newEndVnode = newCh[--newEndIdx];
              }
              else if (sameVnode(oldEndVnode, newStartVnode)) {
                  // Vnode moved left
                  patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                  canMove &&
                      nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                  oldEndVnode = oldCh[--oldEndIdx];
                  newStartVnode = newCh[++newStartIdx];
              }
              else {
                  if (isUndef(oldKeyToIdx))
                      oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                  idxInOld = isDef(newStartVnode.key)
                      ? oldKeyToIdx[newStartVnode.key]
                      : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
                  if (isUndef(idxInOld)) {
                      // New element
                      createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                  }
                  else {
                      vnodeToMove = oldCh[idxInOld];
                      if (sameVnode(vnodeToMove, newStartVnode)) {
                          patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                          oldCh[idxInOld] = undefined;
                          canMove &&
                              nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
                      }
                      else {
                          // same key but different element. treat as new element
                          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                      }
                  }
                  newStartVnode = newCh[++newStartIdx];
              }
          }
          if (oldStartIdx > oldEndIdx) {
              refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
              addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
          }
          else if (newStartIdx > newEndIdx) {
              removeVnodes(oldCh, oldStartIdx, oldEndIdx);
          }
      }
      function checkDuplicateKeys(children) {
          var seenKeys = {};
          for (var i_4 = 0; i_4 < children.length; i_4++) {
              var vnode = children[i_4];
              var key = vnode.key;
              if (isDef(key)) {
                  if (seenKeys[key]) {
                      warn$2("Duplicate keys detected: '".concat(key, "'. This may cause an update error."), vnode.context);
                  }
                  else {
                      seenKeys[key] = true;
                  }
              }
          }
      }
      function findIdxInOld(node, oldCh, start, end) {
          for (var i_5 = start; i_5 < end; i_5++) {
              var c = oldCh[i_5];
              if (isDef(c) && sameVnode(node, c))
                  return i_5;
          }
      }
      function patchVnode(oldVnode, vnode, insertedVnodeQueue, ownerArray, index, removeOnly) {
          if (oldVnode === vnode) {
              return;
          }
          if (isDef(vnode.elm) && isDef(ownerArray)) {
              // clone reused vnode
              vnode = ownerArray[index] = cloneVNode(vnode);
          }
          var elm = (vnode.elm = oldVnode.elm);
          if (isTrue(oldVnode.isAsyncPlaceholder)) {
              if (isDef(vnode.asyncFactory.resolved)) {
                  hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
              }
              else {
                  vnode.isAsyncPlaceholder = true;
              }
              return;
          }
          // reuse element for static trees.
          // note we only do this if the vnode is cloned -
          // if the new node is not cloned it means the render functions have been
          // reset by the hot-reload-api and we need to do a proper re-render.
          if (isTrue(vnode.isStatic) &&
              isTrue(oldVnode.isStatic) &&
              vnode.key === oldVnode.key &&
              (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
              vnode.componentInstance = oldVnode.componentInstance;
              return;
          }
          var i;
          var data = vnode.data;
          if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
              i(oldVnode, vnode);
          }
          var oldCh = oldVnode.children;
          var ch = vnode.children;
          if (isDef(data) && isPatchable(vnode)) {
              for (i = 0; i < cbs.update.length; ++i)
                  cbs.update[i](oldVnode, vnode);
              if (isDef((i = data.hook)) && isDef((i = i.update)))
                  i(oldVnode, vnode);
          }
          if (isUndef(vnode.text)) {
              if (isDef(oldCh) && isDef(ch)) {
                  if (oldCh !== ch)
                      updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
              }
              else if (isDef(ch)) {
                  {
                      checkDuplicateKeys(ch);
                  }
                  if (isDef(oldVnode.text))
                      nodeOps.setTextContent(elm, '');
                  addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
              }
              else if (isDef(oldCh)) {
                  removeVnodes(oldCh, 0, oldCh.length - 1);
              }
              else if (isDef(oldVnode.text)) {
                  nodeOps.setTextContent(elm, '');
              }
          }
          else if (oldVnode.text !== vnode.text) {
              nodeOps.setTextContent(elm, vnode.text);
          }
          if (isDef(data)) {
              if (isDef((i = data.hook)) && isDef((i = i.postpatch)))
                  i(oldVnode, vnode);
          }
      }
      function invokeInsertHook(vnode, queue, initial) {
          // delay insert hooks for component root nodes, invoke them after the
          // element is really inserted
          if (isTrue(initial) && isDef(vnode.parent)) {
              vnode.parent.data.pendingInsert = queue;
          }
          else {
              for (var i_6 = 0; i_6 < queue.length; ++i_6) {
                  queue[i_6].data.hook.insert(queue[i_6]);
              }
          }
      }
      var hydrationBailed = false;
      // list of modules that can skip create hook during hydration because they
      // are already rendered on the client or has no need for initialization
      // Note: style is excluded because it relies on initial clone for future
      // deep updates (#7063).
      var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');
      // Note: this is a browser-only function so we can assume elms are DOM nodes.
      function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
          var i;
          var tag = vnode.tag, data = vnode.data, children = vnode.children;
          inVPre = inVPre || (data && data.pre);
          vnode.elm = elm;
          if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
              vnode.isAsyncPlaceholder = true;
              return true;
          }
          // assert node match
          {
              if (!assertNodeMatch(elm, vnode, inVPre)) {
                  return false;
              }
          }
          if (isDef(data)) {
              if (isDef((i = data.hook)) && isDef((i = i.init)))
                  i(vnode, true /* hydrating */);
              if (isDef((i = vnode.componentInstance))) {
                  // child component. it should have hydrated its own tree.
                  initComponent(vnode, insertedVnodeQueue);
                  return true;
              }
          }
          if (isDef(tag)) {
              if (isDef(children)) {
                  // empty element, allow client to pick up and populate children
                  if (!elm.hasChildNodes()) {
                      createChildren(vnode, children, insertedVnodeQueue);
                  }
                  else {
                      // v-html and domProps: innerHTML
                      if (isDef((i = data)) &&
                          isDef((i = i.domProps)) &&
                          isDef((i = i.innerHTML))) {
                          if (i !== elm.innerHTML) {
                              /* istanbul ignore if */
                              if (typeof console !== 'undefined' &&
                                  !hydrationBailed) {
                                  hydrationBailed = true;
                                  console.warn('Parent: ', elm);
                                  console.warn('server innerHTML: ', i);
                                  console.warn('client innerHTML: ', elm.innerHTML);
                              }
                              return false;
                          }
                      }
                      else {
                          // iterate and compare children lists
                          var childrenMatch = true;
                          var childNode = elm.firstChild;
                          for (var i_7 = 0; i_7 < children.length; i_7++) {
                              if (!childNode ||
                                  !hydrate(childNode, children[i_7], insertedVnodeQueue, inVPre)) {
                                  childrenMatch = false;
                                  break;
                              }
                              childNode = childNode.nextSibling;
                          }
                          // if childNode is not null, it means the actual childNodes list is
                          // longer than the virtual children list.
                          if (!childrenMatch || childNode) {
                              /* istanbul ignore if */
                              if (typeof console !== 'undefined' &&
                                  !hydrationBailed) {
                                  hydrationBailed = true;
                                  console.warn('Parent: ', elm);
                                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                              }
                              return false;
                          }
                      }
                  }
              }
              if (isDef(data)) {
                  var fullInvoke = false;
                  for (var key in data) {
                      if (!isRenderedModule(key)) {
                          fullInvoke = true;
                          invokeCreateHooks(vnode, insertedVnodeQueue);
                          break;
                      }
                  }
                  if (!fullInvoke && data['class']) {
                      // ensure collecting deps for deep class bindings for future updates
                      traverse(data['class']);
                  }
              }
          }
          else if (elm.data !== vnode.text) {
              elm.data = vnode.text;
          }
          return true;
      }
      function assertNodeMatch(node, vnode, inVPre) {
          if (isDef(vnode.tag)) {
              return (vnode.tag.indexOf('vue-component') === 0 ||
                  (!isUnknownElement(vnode, inVPre) &&
                      vnode.tag.toLowerCase() ===
                          (node.tagName && node.tagName.toLowerCase())));
          }
          else {
              return node.nodeType === (vnode.isComment ? 8 : 3);
          }
      }
      return function patch(oldVnode, vnode, hydrating, removeOnly) {
          if (isUndef(vnode)) {
              if (isDef(oldVnode))
                  invokeDestroyHook(oldVnode);
              return;
          }
          var isInitialPatch = false;
          var insertedVnodeQueue = [];
          if (isUndef(oldVnode)) {
              // empty mount (likely as component), create new root element
              isInitialPatch = true;
              createElm(vnode, insertedVnodeQueue);
          }
          else {
              var isRealElement = isDef(oldVnode.nodeType);
              if (!isRealElement && sameVnode(oldVnode, vnode)) {
                  // patch existing root node
                  patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
              }
              else {
                  if (isRealElement) {
                      // mounting to a real element
                      // check if this is server-rendered content and if we can perform
                      // a successful hydration.
                      if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                          oldVnode.removeAttribute(SSR_ATTR);
                          hydrating = true;
                      }
                      if (isTrue(hydrating)) {
                          if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                              invokeInsertHook(vnode, insertedVnodeQueue, true);
                              return oldVnode;
                          }
                          else {
                              warn$2('The client-side rendered virtual DOM tree is not matching ' +
                                  'server-rendered content. This is likely caused by incorrect ' +
                                  'HTML markup, for example nesting block-level elements inside ' +
                                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                                  'full client-side render.');
                          }
                      }
                      // either not server-rendered, or hydration failed.
                      // create an empty node and replace it
                      oldVnode = emptyNodeAt(oldVnode);
                  }
                  // replacing existing element
                  var oldElm = oldVnode.elm;
                  var parentElm = nodeOps.parentNode(oldElm);
                  // create new node
                  createElm(vnode, insertedVnodeQueue, 
                  // extremely rare edge case: do not insert if old element is in a
                  // leaving transition. Only happens when combining transition +
                  // keep-alive + HOCs. (#4590)
                  oldElm._leaveCb ? null : parentElm, nodeOps.nextSibling(oldElm));
                  // update parent placeholder node element, recursively
                  if (isDef(vnode.parent)) {
                      var ancestor = vnode.parent;
                      var patchable = isPatchable(vnode);
                      while (ancestor) {
                          for (var i_8 = 0; i_8 < cbs.destroy.length; ++i_8) {
                              cbs.destroy[i_8](ancestor);
                          }
                          ancestor.elm = vnode.elm;
                          if (patchable) {
                              for (var i_9 = 0; i_9 < cbs.create.length; ++i_9) {
                                  cbs.create[i_9](emptyNode, ancestor);
                              }
                              // #6513
                              // invoke insert hooks that may have been merged by create hooks.
                              // e.g. for directives that uses the "inserted" hook.
                              var insert_1 = ancestor.data.hook.insert;
                              if (insert_1.merged) {
                                  // start at index 1 to avoid re-invoking component mounted hook
                                  // clone insert hooks to avoid being mutated during iteration.
                                  // e.g. for customed directives under transition group.
                                  var cloned = insert_1.fns.slice(1);
                                  for (var i_10 = 0; i_10 < cloned.length; i_10++) {
                                      cloned[i_10]();
                                  }
                              }
                          }
                          else {
                              registerRef(ancestor);
                          }
                          ancestor = ancestor.parent;
                      }
                  }
                  // destroy old node
                  if (isDef(parentElm)) {
                      removeVnodes([oldVnode], 0, 0);
                  }
                  else if (isDef(oldVnode.tag)) {
                      invokeDestroyHook(oldVnode);
                  }
              }
          }
          invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
          return vnode.elm;
      };
  }

  var directives$1 = {
      create: updateDirectives,
      update: updateDirectives,
      destroy: function unbindDirectives(vnode) {
          // @ts-expect-error emptyNode is not VNodeWithData
          updateDirectives(vnode, emptyNode);
      }
  };
  function updateDirectives(oldVnode, vnode) {
      if (oldVnode.data.directives || vnode.data.directives) {
          _update(oldVnode, vnode);
      }
  }
  function _update(oldVnode, vnode) {
      var isCreate = oldVnode === emptyNode;
      var isDestroy = vnode === emptyNode;
      var oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context);
      var newDirs = normalizeDirectives(vnode.data.directives, vnode.context);
      var dirsWithInsert = [];
      var dirsWithPostpatch = [];
      var key, oldDir, dir;
      for (key in newDirs) {
          oldDir = oldDirs[key];
          dir = newDirs[key];
          if (!oldDir) {
              // new directive, bind
              callHook(dir, 'bind', vnode, oldVnode);
              if (dir.def && dir.def.inserted) {
                  dirsWithInsert.push(dir);
              }
          }
          else {
              // existing directive, update
              dir.oldValue = oldDir.value;
              dir.oldArg = oldDir.arg;
              callHook(dir, 'update', vnode, oldVnode);
              if (dir.def && dir.def.componentUpdated) {
                  dirsWithPostpatch.push(dir);
              }
          }
      }
      if (dirsWithInsert.length) {
          var callInsert = function () {
              for (var i = 0; i < dirsWithInsert.length; i++) {
                  callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode);
              }
          };
          if (isCreate) {
              mergeVNodeHook(vnode, 'insert', callInsert);
          }
          else {
              callInsert();
          }
      }
      if (dirsWithPostpatch.length) {
          mergeVNodeHook(vnode, 'postpatch', function () {
              for (var i = 0; i < dirsWithPostpatch.length; i++) {
                  callHook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
              }
          });
      }
      if (!isCreate) {
          for (key in oldDirs) {
              if (!newDirs[key]) {
                  // no longer present, unbind
                  callHook(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
              }
          }
      }
  }
  var emptyModifiers = Object.create(null);
  function normalizeDirectives(dirs, vm) {
      var res = Object.create(null);
      if (!dirs) {
          // $flow-disable-line
          return res;
      }
      var i, dir;
      for (i = 0; i < dirs.length; i++) {
          dir = dirs[i];
          if (!dir.modifiers) {
              // $flow-disable-line
              dir.modifiers = emptyModifiers;
          }
          res[getRawDirName(dir)] = dir;
          if (vm._setupState && vm._setupState.__sfc) {
              var setupDef = dir.def || resolveAsset(vm, '_setupState', 'v-' + dir.name);
              if (typeof setupDef === 'function') {
                  dir.def = {
                      bind: setupDef,
                      update: setupDef,
                  };
              }
              else {
                  dir.def = setupDef;
              }
          }
          dir.def = dir.def || resolveAsset(vm.$options, 'directives', dir.name, true);
      }
      // $flow-disable-line
      return res;
  }
  function getRawDirName(dir) {
      return (dir.rawName || "".concat(dir.name, ".").concat(Object.keys(dir.modifiers || {}).join('.')));
  }
  function callHook(dir, hook, vnode, oldVnode, isDestroy) {
      var fn = dir.def && dir.def[hook];
      if (fn) {
          try {
              fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
          }
          catch (e) {
              handleError(e, vnode.context, "directive ".concat(dir.name, " ").concat(hook, " hook"));
          }
      }
  }

  var baseModules = [ref, directives$1];

  function updateAttrs(oldVnode, vnode) {
      var opts = vnode.componentOptions;
      if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
          return;
      }
      if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
          return;
      }
      var key, cur, old;
      var elm = vnode.elm;
      var oldAttrs = oldVnode.data.attrs || {};
      var attrs = vnode.data.attrs || {};
      // clone observed objects, as the user probably wants to mutate it
      if (isDef(attrs.__ob__) || isTrue(attrs._v_attr_proxy)) {
          attrs = vnode.data.attrs = extend$1({}, attrs);
      }
      for (key in attrs) {
          cur = attrs[key];
          old = oldAttrs[key];
          if (old !== cur) {
              setAttr(elm, key, cur, vnode.data.pre);
          }
      }
      // #4391: in IE9, setting type can reset value for input[type=radio]
      // #6666: IE/Edge forces progress value down to 1 before setting a max
      /* istanbul ignore if */
      if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
          setAttr(elm, 'value', attrs.value);
      }
      for (key in oldAttrs) {
          if (isUndef(attrs[key])) {
              if (isXlink(key)) {
                  elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
              }
              else if (!isEnumeratedAttr(key)) {
                  elm.removeAttribute(key);
              }
          }
      }
  }
  function setAttr(el, key, value, isInPre) {
      if (isInPre || el.tagName.indexOf('-') > -1) {
          baseSetAttr(el, key, value);
      }
      else if (isBooleanAttr(key)) {
          // set attribute for blank value
          // e.g. <option disabled>Select one</option>
          if (isFalsyAttrValue(value)) {
              el.removeAttribute(key);
          }
          else {
              // technically allowfullscreen is a boolean attribute for <iframe>,
              // but Flash expects a value of "true" when used on <embed> tag
              value = key === 'allowfullscreen' && el.tagName === 'EMBED' ? 'true' : key;
              el.setAttribute(key, value);
          }
      }
      else if (isEnumeratedAttr(key)) {
          el.setAttribute(key, convertEnumeratedValue(key, value));
      }
      else if (isXlink(key)) {
          if (isFalsyAttrValue(value)) {
              el.removeAttributeNS(xlinkNS, getXlinkProp(key));
          }
          else {
              el.setAttributeNS(xlinkNS, key, value);
          }
      }
      else {
          baseSetAttr(el, key, value);
      }
  }
  function baseSetAttr(el, key, value) {
      if (isFalsyAttrValue(value)) {
          el.removeAttribute(key);
      }
      else {
          // #7138: IE10 & 11 fires input event when setting placeholder on
          // <textarea>... block the first input event and remove the blocker
          // immediately.
          /* istanbul ignore if */
          if (isIE &&
              !isIE9 &&
              el.tagName === 'TEXTAREA' &&
              key === 'placeholder' &&
              value !== '' &&
              !el.__ieph) {
              var blocker_1 = function (e) {
                  e.stopImmediatePropagation();
                  el.removeEventListener('input', blocker_1);
              };
              el.addEventListener('input', blocker_1);
              // $flow-disable-line
              el.__ieph = true; /* IE placeholder patched */
          }
          el.setAttribute(key, value);
      }
  }
  var attrs = {
      create: updateAttrs,
      update: updateAttrs
  };

  function updateClass(oldVnode, vnode) {
      var el = vnode.elm;
      var data = vnode.data;
      var oldData = oldVnode.data;
      if (isUndef(data.staticClass) &&
          isUndef(data.class) &&
          (isUndef(oldData) ||
              (isUndef(oldData.staticClass) && isUndef(oldData.class)))) {
          return;
      }
      var cls = genClassForVnode(vnode);
      // handle transition classes
      var transitionClass = el._transitionClasses;
      if (isDef(transitionClass)) {
          cls = concat(cls, stringifyClass(transitionClass));
      }
      // set the class
      if (cls !== el._prevClass) {
          el.setAttribute('class', cls);
          el._prevClass = cls;
      }
  }
  var klass$1 = {
      create: updateClass,
      update: updateClass
  };

  var validDivisionCharRE = /[\w).+\-_$\]]/;
  function parseFilters(exp) {
      var inSingle = false;
      var inDouble = false;
      var inTemplateString = false;
      var inRegex = false;
      var curly = 0;
      var square = 0;
      var paren = 0;
      var lastFilterIndex = 0;
      var c, prev, i, expression, filters;
      for (i = 0; i < exp.length; i++) {
          prev = c;
          c = exp.charCodeAt(i);
          if (inSingle) {
              if (c === 0x27 && prev !== 0x5c)
                  inSingle = false;
          }
          else if (inDouble) {
              if (c === 0x22 && prev !== 0x5c)
                  inDouble = false;
          }
          else if (inTemplateString) {
              if (c === 0x60 && prev !== 0x5c)
                  inTemplateString = false;
          }
          else if (inRegex) {
              if (c === 0x2f && prev !== 0x5c)
                  inRegex = false;
          }
          else if (c === 0x7c && // pipe
              exp.charCodeAt(i + 1) !== 0x7c &&
              exp.charCodeAt(i - 1) !== 0x7c &&
              !curly &&
              !square &&
              !paren) {
              if (expression === undefined) {
                  // first filter, end of expression
                  lastFilterIndex = i + 1;
                  expression = exp.slice(0, i).trim();
              }
              else {
                  pushFilter();
              }
          }
          else {
              switch (c) {
                  case 0x22:
                      inDouble = true;
                      break; // "
                  case 0x27:
                      inSingle = true;
                      break; // '
                  case 0x60:
                      inTemplateString = true;
                      break; // `
                  case 0x28:
                      paren++;
                      break; // (
                  case 0x29:
                      paren--;
                      break; // )
                  case 0x5b:
                      square++;
                      break; // [
                  case 0x5d:
                      square--;
                      break; // ]
                  case 0x7b:
                      curly++;
                      break; // {
                  case 0x7d:
                      curly--;
                      break; // }
              }
              if (c === 0x2f) {
                  // /
                  var j = i - 1;
                  var p 
                  // find first non-whitespace prev char
                  = void 0;
                  // find first non-whitespace prev char
                  for (; j >= 0; j--) {
                      p = exp.charAt(j);
                      if (p !== ' ')
                          break;
                  }
                  if (!p || !validDivisionCharRE.test(p)) {
                      inRegex = true;
                  }
              }
          }
      }
      if (expression === undefined) {
          expression = exp.slice(0, i).trim();
      }
      else if (lastFilterIndex !== 0) {
          pushFilter();
      }
      function pushFilter() {
          (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
          lastFilterIndex = i + 1;
      }
      if (filters) {
          for (i = 0; i < filters.length; i++) {
              expression = wrapFilter(expression, filters[i]);
          }
      }
      return expression;
  }
  function wrapFilter(exp, filter) {
      var i = filter.indexOf('(');
      if (i < 0) {
          // _f: resolveFilter
          return "_f(\"".concat(filter, "\")(").concat(exp, ")");
      }
      else {
          var name_1 = filter.slice(0, i);
          var args = filter.slice(i + 1);
          return "_f(\"".concat(name_1, "\")(").concat(exp).concat(args !== ')' ? ',' + args : args);
      }
  }

  /* eslint-disable no-unused-vars */
  function baseWarn(msg, range) {
      console.error("[Vue compiler]: ".concat(msg));
  }
  /* eslint-enable no-unused-vars */
  function pluckModuleFunction(modules, key) {
      return modules ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; }) : [];
  }
  function addProp(el, name, value, range, dynamic) {
      (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
      el.plain = false;
  }
  function addAttr(el, name, value, range, dynamic) {
      var attrs = dynamic
          ? el.dynamicAttrs || (el.dynamicAttrs = [])
          : el.attrs || (el.attrs = []);
      attrs.push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
      el.plain = false;
  }
  // add a raw attr (use this in preTransforms)
  function addRawAttr(el, name, value, range) {
      el.attrsMap[name] = value;
      el.attrsList.push(rangeSetItem({ name: name, value: value }, range));
  }
  function addDirective(el, name, rawName, value, arg, isDynamicArg, modifiers, range) {
      (el.directives || (el.directives = [])).push(rangeSetItem({
          name: name,
          rawName: rawName,
          value: value,
          arg: arg,
          isDynamicArg: isDynamicArg,
          modifiers: modifiers
      }, range));
      el.plain = false;
  }
  function prependModifierMarker(symbol, name, dynamic) {
      return dynamic ? "_p(".concat(name, ",\"").concat(symbol, "\")") : symbol + name; // mark the event as captured
  }
  function addHandler(el, name, value, modifiers, important, warn, range, dynamic) {
      modifiers = modifiers || emptyObject;
      // warn prevent and passive modifier
      /* istanbul ignore if */
      if (warn && modifiers.prevent && modifiers.passive) {
          warn("passive and prevent can't be used together. " +
              "Passive handler can't prevent default event.", range);
      }
      // normalize click.right and click.middle since they don't actually fire
      // this is technically browser-specific, but at least for now browsers are
      // the only target envs that have right/middle clicks.
      if (modifiers.right) {
          if (dynamic) {
              name = "(".concat(name, ")==='click'?'contextmenu':(").concat(name, ")");
          }
          else if (name === 'click') {
              name = 'contextmenu';
              delete modifiers.right;
          }
      }
      else if (modifiers.middle) {
          if (dynamic) {
              name = "(".concat(name, ")==='click'?'mouseup':(").concat(name, ")");
          }
          else if (name === 'click') {
              name = 'mouseup';
          }
      }
      // check capture modifier
      if (modifiers.capture) {
          delete modifiers.capture;
          name = prependModifierMarker('!', name, dynamic);
      }
      if (modifiers.once) {
          delete modifiers.once;
          name = prependModifierMarker('~', name, dynamic);
      }
      /* istanbul ignore if */
      if (modifiers.passive) {
          delete modifiers.passive;
          name = prependModifierMarker('&', name, dynamic);
      }
      var events;
      if (modifiers.native) {
          delete modifiers.native;
          events = el.nativeEvents || (el.nativeEvents = {});
      }
      else {
          events = el.events || (el.events = {});
      }
      var newHandler = rangeSetItem({ value: value.trim(), dynamic: dynamic }, range);
      if (modifiers !== emptyObject) {
          newHandler.modifiers = modifiers;
      }
      var handlers = events[name];
      /* istanbul ignore if */
      if (Array.isArray(handlers)) {
          important ? handlers.unshift(newHandler) : handlers.push(newHandler);
      }
      else if (handlers) {
          events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
      }
      else {
          events[name] = newHandler;
      }
      el.plain = false;
  }
  function getRawBindingAttr(el, name) {
      return (el.rawAttrsMap[':' + name] ||
          el.rawAttrsMap['v-bind:' + name] ||
          el.rawAttrsMap[name]);
  }
  function getBindingAttr(el, name, getStatic) {
      var dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name);
      if (dynamicValue != null) {
          return parseFilters(dynamicValue);
      }
      else if (getStatic !== false) {
          var staticValue = getAndRemoveAttr(el, name);
          if (staticValue != null) {
              return JSON.stringify(staticValue);
          }
      }
  }
  // note: this only removes the attr from the Array (attrsList) so that it
  // doesn't get processed by processAttrs.
  // By default it does NOT remove it from the map (attrsMap) because the map is
  // needed during codegen.
  function getAndRemoveAttr(el, name, removeFromMap) {
      var val;
      if ((val = el.attrsMap[name]) != null) {
          var list = el.attrsList;
          for (var i = 0, l = list.length; i < l; i++) {
              if (list[i].name === name) {
                  list.splice(i, 1);
                  break;
              }
          }
      }
      if (removeFromMap) {
          delete el.attrsMap[name];
      }
      return val;
  }
  function getAndRemoveAttrByRegex(el, name) {
      var list = el.attrsList;
      for (var i = 0, l = list.length; i < l; i++) {
          var attr = list[i];
          if (name.test(attr.name)) {
              list.splice(i, 1);
              return attr;
          }
      }
  }
  function rangeSetItem(item, range) {
      if (range) {
          if (range.start != null) {
              item.start = range.start;
          }
          if (range.end != null) {
              item.end = range.end;
          }
      }
      return item;
  }

  /**
   * Cross-platform code generation for component v-model
   */
  function genComponentModel(el, value, modifiers) {
      var _a = modifiers || {}, number = _a.number, trim = _a.trim;
      var baseValueExpression = '$$v';
      var valueExpression = baseValueExpression;
      if (trim) {
          valueExpression =
              "(typeof ".concat(baseValueExpression, " === 'string'") +
                  "? ".concat(baseValueExpression, ".trim()") +
                  ": ".concat(baseValueExpression, ")");
      }
      if (number) {
          valueExpression = "_n(".concat(valueExpression, ")");
      }
      var assignment = genAssignmentCode(value, valueExpression);
      el.model = {
          value: "(".concat(value, ")"),
          expression: JSON.stringify(value),
          callback: "function (".concat(baseValueExpression, ") {").concat(assignment, "}")
      };
  }
  /**
   * Cross-platform codegen helper for generating v-model value assignment code.
   */
  function genAssignmentCode(value, assignment) {
      var res = parseModel(value);
      if (res.key === null) {
          return "".concat(value, "=").concat(assignment);
      }
      else {
          return "$set(".concat(res.exp, ", ").concat(res.key, ", ").concat(assignment, ")");
      }
  }
  /**
   * Parse a v-model expression into a base path and a final key segment.
   * Handles both dot-path and possible square brackets.
   *
   * Possible cases:
   *
   * - test
   * - test[key]
   * - test[test1[key]]
   * - test["a"][key]
   * - xxx.test[a[a].test1[key]]
   * - test.xxx.a["asa"][test1[key]]
   *
   */
  var len, str, chr, index, expressionPos, expressionEndPos;
  function parseModel(val) {
      // Fix https://github.com/vuejs/vue/pull/7730
      // allow v-model="obj.val " (trailing whitespace)
      val = val.trim();
      len = val.length;
      if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
          index = val.lastIndexOf('.');
          if (index > -1) {
              return {
                  exp: val.slice(0, index),
                  key: '"' + val.slice(index + 1) + '"'
              };
          }
          else {
              return {
                  exp: val,
                  key: null
              };
          }
      }
      str = val;
      index = expressionPos = expressionEndPos = 0;
      while (!eof()) {
          chr = next();
          /* istanbul ignore if */
          if (isStringStart(chr)) {
              parseString(chr);
          }
          else if (chr === 0x5b) {
              parseBracket(chr);
          }
      }
      return {
          exp: val.slice(0, expressionPos),
          key: val.slice(expressionPos + 1, expressionEndPos)
      };
  }
  function next() {
      return str.charCodeAt(++index);
  }
  function eof() {
      return index >= len;
  }
  function isStringStart(chr) {
      return chr === 0x22 || chr === 0x27;
  }
  function parseBracket(chr) {
      var inBracket = 1;
      expressionPos = index;
      while (!eof()) {
          chr = next();
          if (isStringStart(chr)) {
              parseString(chr);
              continue;
          }
          if (chr === 0x5b)
              inBracket++;
          if (chr === 0x5d)
              inBracket--;
          if (inBracket === 0) {
              expressionEndPos = index;
              break;
          }
      }
  }
  function parseString(chr) {
      var stringQuote = chr;
      while (!eof()) {
          chr = next();
          if (chr === stringQuote) {
              break;
          }
      }
  }

  var warn$1;
  // in some cases, the event used has to be determined at runtime
  // so we used some reserved tokens during compile.
  var RANGE_TOKEN = '__r';
  var CHECKBOX_RADIO_TOKEN = '__c';
  function model$1(el, dir, _warn) {
      warn$1 = _warn;
      var value = dir.value;
      var modifiers = dir.modifiers;
      var tag = el.tag;
      var type = el.attrsMap.type;
      {
          // inputs with type="file" are read only and setting the input's
          // value will throw an error.
          if (tag === 'input' && type === 'file') {
              warn$1("<".concat(el.tag, " v-model=\"").concat(value, "\" type=\"file\">:\n") +
                  "File inputs are read only. Use a v-on:change listener instead.", el.rawAttrsMap['v-model']);
          }
      }
      if (el.component) {
          genComponentModel(el, value, modifiers);
          // component v-model doesn't need extra runtime
          return false;
      }
      else if (tag === 'select') {
          genSelect(el, value, modifiers);
      }
      else if (tag === 'input' && type === 'checkbox') {
          genCheckboxModel(el, value, modifiers);
      }
      else if (tag === 'input' && type === 'radio') {
          genRadioModel(el, value, modifiers);
      }
      else if (tag === 'input' || tag === 'textarea') {
          genDefaultModel(el, value, modifiers);
      }
      else if (!config.isReservedTag(tag)) {
          genComponentModel(el, value, modifiers);
          // component v-model doesn't need extra runtime
          return false;
      }
      else {
          warn$1("<".concat(el.tag, " v-model=\"").concat(value, "\">: ") +
              "v-model is not supported on this element type. " +
              "If you are working with contenteditable, it's recommended to " +
              'wrap a library dedicated for that purpose inside a custom component.', el.rawAttrsMap['v-model']);
      }
      // ensure runtime directive metadata
      return true;
  }
  function genCheckboxModel(el, value, modifiers) {
      var number = modifiers && modifiers.number;
      var valueBinding = getBindingAttr(el, 'value') || 'null';
      var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
      var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
      addProp(el, 'checked', "Array.isArray(".concat(value, ")") +
          "?_i(".concat(value, ",").concat(valueBinding, ")>-1") +
          (trueValueBinding === 'true'
              ? ":(".concat(value, ")")
              : ":_q(".concat(value, ",").concat(trueValueBinding, ")")));
      addHandler(el, 'change', "var $$a=".concat(value, ",") +
          '$$el=$event.target,' +
          "$$c=$$el.checked?(".concat(trueValueBinding, "):(").concat(falseValueBinding, ");") +
          'if(Array.isArray($$a)){' +
          "var $$v=".concat(number ? '_n(' + valueBinding + ')' : valueBinding, ",") +
          '$$i=_i($$a,$$v);' +
          "if($$el.checked){$$i<0&&(".concat(genAssignmentCode(value, '$$a.concat([$$v])'), ")}") +
          "else{$$i>-1&&(".concat(genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))'), ")}") +
          "}else{".concat(genAssignmentCode(value, '$$c'), "}"), null, true);
  }
  function genRadioModel(el, value, modifiers) {
      var number = modifiers && modifiers.number;
      var valueBinding = getBindingAttr(el, 'value') || 'null';
      valueBinding = number ? "_n(".concat(valueBinding, ")") : valueBinding;
      addProp(el, 'checked', "_q(".concat(value, ",").concat(valueBinding, ")"));
      addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
  }
  function genSelect(el, value, modifiers) {
      var number = modifiers && modifiers.number;
      var selectedVal = "Array.prototype.filter" +
          ".call($event.target.options,function(o){return o.selected})" +
          ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
          "return ".concat(number ? '_n(val)' : 'val', "})");
      var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
      var code = "var $$selectedVal = ".concat(selectedVal, ";");
      code = "".concat(code, " ").concat(genAssignmentCode(value, assignment));
      addHandler(el, 'change', code, null, true);
  }
  function genDefaultModel(el, value, modifiers) {
      var type = el.attrsMap.type;
      // warn if v-bind:value conflicts with v-model
      // except for inputs with v-bind:type
      {
          var value_1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
          var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
          if (value_1 && !typeBinding) {
              var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
              warn$1("".concat(binding, "=\"").concat(value_1, "\" conflicts with v-model on the same element ") +
                  'because the latter already expands to a value binding internally', el.rawAttrsMap[binding]);
          }
      }
      var _a = modifiers || {}, lazy = _a.lazy, number = _a.number, trim = _a.trim;
      var needCompositionGuard = !lazy && type !== 'range';
      var event = lazy ? 'change' : type === 'range' ? RANGE_TOKEN : 'input';
      var valueExpression = '$event.target.value';
      if (trim) {
          valueExpression = "$event.target.value.trim()";
      }
      if (number) {
          valueExpression = "_n(".concat(valueExpression, ")");
      }
      var code = genAssignmentCode(value, valueExpression);
      if (needCompositionGuard) {
          code = "if($event.target.composing)return;".concat(code);
      }
      addProp(el, 'value', "(".concat(value, ")"));
      addHandler(el, event, code, null, true);
      if (trim || number) {
          addHandler(el, 'blur', '$forceUpdate()');
      }
  }

  // normalize v-model event tokens that can only be determined at runtime.
  // it's important to place the event as the first in the array because
  // the whole point is ensuring the v-model callback gets called before
  // user-attached handlers.
  function normalizeEvents(on) {
      /* istanbul ignore if */
      if (isDef(on[RANGE_TOKEN])) {
          // IE input[type=range] only supports `change` event
          var event_1 = isIE ? 'change' : 'input';
          on[event_1] = [].concat(on[RANGE_TOKEN], on[event_1] || []);
          delete on[RANGE_TOKEN];
      }
      // This was originally intended to fix #4521 but no longer necessary
      // after 2.5. Keeping it for backwards compat with generated code from < 2.4
      /* istanbul ignore if */
      if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
          on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
          delete on[CHECKBOX_RADIO_TOKEN];
      }
  }
  var target;
  function createOnceHandler(event, handler, capture) {
      var _target = target; // save current target element in closure
      return function onceHandler() {
          var res = handler.apply(null, arguments);
          if (res !== null) {
              remove(event, onceHandler, capture, _target);
          }
      };
  }
  // #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
  // implementation and does not fire microtasks in between event propagation, so
  // safe to exclude.
  var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);
  function add(name, handler, capture, passive) {
      // async edge case #6566: inner click event triggers patch, event handler
      // attached to outer element during patch, and triggered again. This
      // happens because browsers fire microtask ticks between event propagation.
      // the solution is simple: we save the timestamp when a handler is attached,
      // and the handler would only fire if the event passed to it was fired
      // AFTER it was attached.
      if (useMicrotaskFix) {
          var attachedTimestamp_1 = currentFlushTimestamp;
          var original_1 = handler;
          //@ts-expect-error
          handler = original_1._wrapper = function (e) {
              if (
              // no bubbling, should always fire.
              // this is just a safety net in case event.timeStamp is unreliable in
              // certain weird environments...
              e.target === e.currentTarget ||
                  // event is fired after handler attachment
                  e.timeStamp >= attachedTimestamp_1 ||
                  // bail for environments that have buggy event.timeStamp implementations
                  // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
                  // #9681 QtWebEngine event.timeStamp is negative value
                  e.timeStamp <= 0 ||
                  // #9448 bail if event is fired in another document in a multi-page
                  // electron/nw.js app, since event.timeStamp will be using a different
                  // starting reference
                  e.target.ownerDocument !== document) {
                  return original_1.apply(this, arguments);
              }
          };
      }
      target.addEventListener(name, handler, supportsPassive ? { capture: capture, passive: passive } : capture);
  }
  function remove(name, handler, capture, _target) {
      if (handler) {
          (_target || target).removeEventListener(name, 
          //@ts-expect-error
          handler._wrapper || handler, capture);
      }
  }
  function updateDOMListeners(oldVnode, vnode) {
      if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
          return;
      }
      var on = vnode.data.on || {};
      var oldOn = oldVnode.data.on || {};
      // vnode is empty when removing all listeners,
      // and use old vnode dom element
      target = vnode.elm || oldVnode.elm;
      normalizeEvents(on);
      updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context);
      target = undefined;
  }
  var events = {
      create: updateDOMListeners,
      update: updateDOMListeners,
      // @ts-expect-error emptyNode has actually data
      destroy: function (vnode) { return updateDOMListeners(vnode, emptyNode); }
  };

  var svgContainer;
  function updateDOMProps(oldVnode, vnode) {
      if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
          return;
      }
      var key, cur;
      var elm = vnode.elm;
      var oldProps = oldVnode.data.domProps || {};
      var props = vnode.data.domProps || {};
      // clone observed objects, as the user probably wants to mutate it
      if (isDef(props.__ob__) || isTrue(props._v_attr_proxy)) {
          props = vnode.data.domProps = extend$1({}, props);
      }
      for (key in oldProps) {
          if (!(key in props)) {
              elm[key] = '';
          }
      }
      for (key in props) {
          cur = props[key];
          // ignore children if the node has textContent or innerHTML,
          // as these will throw away existing DOM nodes and cause removal errors
          // on subsequent patches (#3360)
          if (key === 'textContent' || key === 'innerHTML') {
              if (vnode.children)
                  vnode.children.length = 0;
              if (cur === oldProps[key])
                  continue;
              // #6601 work around Chrome version <= 55 bug where single textNode
              // replaced by innerHTML/textContent retains its parentNode property
              if (elm.childNodes.length === 1) {
                  elm.removeChild(elm.childNodes[0]);
              }
          }
          if (key === 'value' && elm.tagName !== 'PROGRESS') {
              // store value as _value as well since
              // non-string values will be stringified
              elm._value = cur;
              // avoid resetting cursor position when value is the same
              var strCur = isUndef(cur) ? '' : String(cur);
              if (shouldUpdateValue(elm, strCur)) {
                  elm.value = strCur;
              }
          }
          else if (key === 'innerHTML' &&
              isSVG(elm.tagName) &&
              isUndef(elm.innerHTML)) {
              // IE doesn't support innerHTML for SVG elements
              svgContainer = svgContainer || document.createElement('div');
              svgContainer.innerHTML = "<svg>".concat(cur, "</svg>");
              var svg = svgContainer.firstChild;
              while (elm.firstChild) {
                  elm.removeChild(elm.firstChild);
              }
              while (svg.firstChild) {
                  elm.appendChild(svg.firstChild);
              }
          }
          else if (
          // skip the update if old and new VDOM state is the same.
          // `value` is handled separately because the DOM value may be temporarily
          // out of sync with VDOM state due to focus, composition and modifiers.
          // This  #4521 by skipping the unnecessary `checked` update.
          cur !== oldProps[key]) {
              // some property updates can throw
              // e.g. `value` on <progress> w/ non-finite value
              try {
                  elm[key] = cur;
              }
              catch (e) { }
          }
      }
  }
  function shouldUpdateValue(elm, checkVal) {
      return (
      //@ts-expect-error
      !elm.composing &&
          (elm.tagName === 'OPTION' ||
              isNotInFocusAndDirty(elm, checkVal) ||
              isDirtyWithModifiers(elm, checkVal)));
  }
  function isNotInFocusAndDirty(elm, checkVal) {
      // return true when textbox (.number and .trim) loses focus and its value is
      // not equal to the updated value
      var notInFocus = true;
      // #6157
      // work around IE bug when accessing document.activeElement in an iframe
      try {
          notInFocus = document.activeElement !== elm;
      }
      catch (e) { }
      return notInFocus && elm.value !== checkVal;
  }
  function isDirtyWithModifiers(elm, newVal) {
      var value = elm.value;
      var modifiers = elm._vModifiers; // injected by v-model runtime
      if (isDef(modifiers)) {
          if (modifiers.number) {
              return toNumber(value) !== toNumber(newVal);
          }
          if (modifiers.trim) {
              return value.trim() !== newVal.trim();
          }
      }
      return value !== newVal;
  }
  var domProps = {
      create: updateDOMProps,
      update: updateDOMProps
  };

  var parseStyleText = cached(function (cssText) {
      var res = {};
      var listDelimiter = /;(?![^(]*\))/g;
      var propertyDelimiter = /:(.+)/;
      cssText.split(listDelimiter).forEach(function (item) {
          if (item) {
              var tmp = item.split(propertyDelimiter);
              tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
          }
      });
      return res;
  });
  // merge static and dynamic style data on the same vnode
  function normalizeStyleData(data) {
      var style = normalizeStyleBinding(data.style);
      // static style is pre-processed into an object during compilation
      // and is always a fresh object, so it's safe to merge into it
      return data.staticStyle ? extend$1(data.staticStyle, style) : style;
  }
  // normalize possible array / string values into Object
  function normalizeStyleBinding(bindingStyle) {
      if (Array.isArray(bindingStyle)) {
          return toObject(bindingStyle);
      }
      if (typeof bindingStyle === 'string') {
          return parseStyleText(bindingStyle);
      }
      return bindingStyle;
  }
  /**
   * parent component style should be after child's
   * so that parent component's style could override it
   */
  function getStyle(vnode, checkChild) {
      var res = {};
      var styleData;
      if (checkChild) {
          var childNode = vnode;
          while (childNode.componentInstance) {
              childNode = childNode.componentInstance._vnode;
              if (childNode &&
                  childNode.data &&
                  (styleData = normalizeStyleData(childNode.data))) {
                  extend$1(res, styleData);
              }
          }
      }
      if ((styleData = normalizeStyleData(vnode.data))) {
          extend$1(res, styleData);
      }
      var parentNode = vnode;
      // @ts-expect-error parentNode.parent not VNodeWithData
      while ((parentNode = parentNode.parent)) {
          if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
              extend$1(res, styleData);
          }
      }
      return res;
  }

  var cssVarRE = /^--/;
  var importantRE = /\s*!important$/;
  var setProp = function (el, name, val) {
      /* istanbul ignore if */
      if (cssVarRE.test(name)) {
          el.style.setProperty(name, val);
      }
      else if (importantRE.test(val)) {
          el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
      }
      else {
          var normalizedName = normalize(name);
          if (Array.isArray(val)) {
              // Support values array created by autoprefixer, e.g.
              // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
              // Set them one by one, and the browser will only set those it can recognize
              for (var i = 0, len = val.length; i < len; i++) {
                  el.style[normalizedName] = val[i];
              }
          }
          else {
              el.style[normalizedName] = val;
          }
      }
  };
  var vendorNames = ['Webkit', 'Moz', 'ms'];
  var emptyStyle;
  var normalize = cached(function (prop) {
      emptyStyle = emptyStyle || document.createElement('div').style;
      prop = camelize(prop);
      if (prop !== 'filter' && prop in emptyStyle) {
          return prop;
      }
      var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
      for (var i = 0; i < vendorNames.length; i++) {
          var name_1 = vendorNames[i] + capName;
          if (name_1 in emptyStyle) {
              return name_1;
          }
      }
  });
  function updateStyle(oldVnode, vnode) {
      var data = vnode.data;
      var oldData = oldVnode.data;
      if (isUndef(data.staticStyle) &&
          isUndef(data.style) &&
          isUndef(oldData.staticStyle) &&
          isUndef(oldData.style)) {
          return;
      }
      var cur, name;
      var el = vnode.elm;
      var oldStaticStyle = oldData.staticStyle;
      var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};
      // if static style exists, stylebinding already merged into it when doing normalizeStyleData
      var oldStyle = oldStaticStyle || oldStyleBinding;
      var style = normalizeStyleBinding(vnode.data.style) || {};
      // store normalized style under a different key for next diff
      // make sure to clone it if it's reactive, since the user likely wants
      // to mutate it.
      vnode.data.normalizedStyle = isDef(style.__ob__) ? extend$1({}, style) : style;
      var newStyle = getStyle(vnode, true);
      for (name in oldStyle) {
          if (isUndef(newStyle[name])) {
              setProp(el, name, '');
          }
      }
      for (name in newStyle) {
          cur = newStyle[name];
          // ie9 setting to null has no effect, must use empty string
          setProp(el, name, cur == null ? '' : cur);
      }
  }
  var style$1 = {
      create: updateStyle,
      update: updateStyle
  };

  var whitespaceRE$1 = /\s+/;
  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function addClass(el, cls) {
      /* istanbul ignore if */
      if (!cls || !(cls = cls.trim())) {
          return;
      }
      /* istanbul ignore else */
      if (el.classList) {
          if (cls.indexOf(' ') > -1) {
              cls.split(whitespaceRE$1).forEach(function (c) { return el.classList.add(c); });
          }
          else {
              el.classList.add(cls);
          }
      }
      else {
          var cur = " ".concat(el.getAttribute('class') || '', " ");
          if (cur.indexOf(' ' + cls + ' ') < 0) {
              el.setAttribute('class', (cur + cls).trim());
          }
      }
  }
  /**
   * Remove class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function removeClass(el, cls) {
      /* istanbul ignore if */
      if (!cls || !(cls = cls.trim())) {
          return;
      }
      /* istanbul ignore else */
      if (el.classList) {
          if (cls.indexOf(' ') > -1) {
              cls.split(whitespaceRE$1).forEach(function (c) { return el.classList.remove(c); });
          }
          else {
              el.classList.remove(cls);
          }
          if (!el.classList.length) {
              el.removeAttribute('class');
          }
      }
      else {
          var cur = " ".concat(el.getAttribute('class') || '', " ");
          var tar = ' ' + cls + ' ';
          while (cur.indexOf(tar) >= 0) {
              cur = cur.replace(tar, ' ');
          }
          cur = cur.trim();
          if (cur) {
              el.setAttribute('class', cur);
          }
          else {
              el.removeAttribute('class');
          }
      }
  }

  function resolveTransition(def) {
      if (!def) {
          return;
      }
      /* istanbul ignore else */
      if (typeof def === 'object') {
          var res = {};
          if (def.css !== false) {
              extend$1(res, autoCssTransition(def.name || 'v'));
          }
          extend$1(res, def);
          return res;
      }
      else if (typeof def === 'string') {
          return autoCssTransition(def);
      }
  }
  var autoCssTransition = cached(function (name) {
      return {
          enterClass: "".concat(name, "-enter"),
          enterToClass: "".concat(name, "-enter-to"),
          enterActiveClass: "".concat(name, "-enter-active"),
          leaveClass: "".concat(name, "-leave"),
          leaveToClass: "".concat(name, "-leave-to"),
          leaveActiveClass: "".concat(name, "-leave-active")
      };
  });
  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';
  // Transition property/event sniffing
  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';
  if (hasTransition) {
      /* istanbul ignore if */
      if (window.ontransitionend === undefined &&
          window.onwebkittransitionend !== undefined) {
          transitionProp = 'WebkitTransition';
          transitionEndEvent = 'webkitTransitionEnd';
      }
      if (window.onanimationend === undefined &&
          window.onwebkitanimationend !== undefined) {
          animationProp = 'WebkitAnimation';
          animationEndEvent = 'webkitAnimationEnd';
      }
  }
  // binding to window is necessary to make hot reload work in IE in strict mode
  var raf = inBrowser
      ? window.requestAnimationFrame
          ? window.requestAnimationFrame.bind(window)
          : setTimeout
      : /* istanbul ignore next */ function (/* istanbul ignore next */ fn) { return fn(); };
  function nextFrame(fn) {
      raf(function () {
          // @ts-expect-error
          raf(fn);
      });
  }
  function addTransitionClass(el, cls) {
      var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
      if (transitionClasses.indexOf(cls) < 0) {
          transitionClasses.push(cls);
          addClass(el, cls);
      }
  }
  function removeTransitionClass(el, cls) {
      if (el._transitionClasses) {
          remove$2(el._transitionClasses, cls);
      }
      removeClass(el, cls);
  }
  function whenTransitionEnds(el, expectedType, cb) {
      var _a = getTransitionInfo(el, expectedType), type = _a.type, timeout = _a.timeout, propCount = _a.propCount;
      if (!type)
          return cb();
      var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
      var ended = 0;
      var end = function () {
          el.removeEventListener(event, onEnd);
          cb();
      };
      var onEnd = function (e) {
          if (e.target === el) {
              if (++ended >= propCount) {
                  end();
              }
          }
      };
      setTimeout(function () {
          if (ended < propCount) {
              end();
          }
      }, timeout + 1);
      el.addEventListener(event, onEnd);
  }
  var transformRE = /\b(transform|all)(,|$)/;
  function getTransitionInfo(el, expectedType) {
      var styles = window.getComputedStyle(el);
      // JSDOM may return undefined for transition properties
      var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
      var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
      var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
      var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
      var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
      var animationTimeout = getTimeout(animationDelays, animationDurations);
      var type;
      var timeout = 0;
      var propCount = 0;
      /* istanbul ignore if */
      if (expectedType === TRANSITION) {
          if (transitionTimeout > 0) {
              type = TRANSITION;
              timeout = transitionTimeout;
              propCount = transitionDurations.length;
          }
      }
      else if (expectedType === ANIMATION) {
          if (animationTimeout > 0) {
              type = ANIMATION;
              timeout = animationTimeout;
              propCount = animationDurations.length;
          }
      }
      else {
          timeout = Math.max(transitionTimeout, animationTimeout);
          type =
              timeout > 0
                  ? transitionTimeout > animationTimeout
                      ? TRANSITION
                      : ANIMATION
                  : null;
          propCount = type
              ? type === TRANSITION
                  ? transitionDurations.length
                  : animationDurations.length
              : 0;
      }
      var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + 'Property']);
      return {
          type: type,
          timeout: timeout,
          propCount: propCount,
          hasTransform: hasTransform
      };
  }
  function getTimeout(delays, durations) {
      /* istanbul ignore next */
      while (delays.length < durations.length) {
          delays = delays.concat(delays);
      }
      return Math.max.apply(null, durations.map(function (d, i) {
          return toMs(d) + toMs(delays[i]);
      }));
  }
  // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
  // in a locale-dependent way, using a comma instead of a dot.
  // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
  // as a floor function) causing unexpected behaviors
  function toMs(s) {
      return Number(s.slice(0, -1).replace(',', '.')) * 1000;
  }

  function enter(vnode, toggleDisplay) {
      var el = vnode.elm;
      // call leave callback now
      if (isDef(el._leaveCb)) {
          el._leaveCb.cancelled = true;
          el._leaveCb();
      }
      var data = resolveTransition(vnode.data.transition);
      if (isUndef(data)) {
          return;
      }
      /* istanbul ignore if */
      if (isDef(el._enterCb) || el.nodeType !== 1) {
          return;
      }
      var css = data.css, type = data.type, enterClass = data.enterClass, enterToClass = data.enterToClass, enterActiveClass = data.enterActiveClass, appearClass = data.appearClass, appearToClass = data.appearToClass, appearActiveClass = data.appearActiveClass, beforeEnter = data.beforeEnter, enter = data.enter, afterEnter = data.afterEnter, enterCancelled = data.enterCancelled, beforeAppear = data.beforeAppear, appear = data.appear, afterAppear = data.afterAppear, appearCancelled = data.appearCancelled, duration = data.duration;
      // activeInstance will always be the <transition> component managing this
      // transition. One edge case to check is when the <transition> is placed
      // as the root node of a child component. In that case we need to check
      // <transition>'s parent for appear check.
      var context = activeInstance;
      var transitionNode = activeInstance.$vnode;
      while (transitionNode && transitionNode.parent) {
          context = transitionNode.context;
          transitionNode = transitionNode.parent;
      }
      var isAppear = !context._isMounted || !vnode.isRootInsert;
      if (isAppear && !appear && appear !== '') {
          return;
      }
      var startClass = isAppear && appearClass ? appearClass : enterClass;
      var activeClass = isAppear && appearActiveClass ? appearActiveClass : enterActiveClass;
      var toClass = isAppear && appearToClass ? appearToClass : enterToClass;
      var beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
      var enterHook = isAppear ? (isFunction$2(appear) ? appear : enter) : enter;
      var afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
      var enterCancelledHook = isAppear
          ? appearCancelled || enterCancelled
          : enterCancelled;
      var explicitEnterDuration = toNumber(isObject$1(duration) ? duration.enter : duration);
      if (explicitEnterDuration != null) {
          checkDuration(explicitEnterDuration, 'enter', vnode);
      }
      var expectsCSS = css !== false && !isIE9;
      var userWantsControl = getHookArgumentsLength(enterHook);
      var cb = (el._enterCb = once(function () {
          if (expectsCSS) {
              removeTransitionClass(el, toClass);
              removeTransitionClass(el, activeClass);
          }
          // @ts-expect-error
          if (cb.cancelled) {
              if (expectsCSS) {
                  removeTransitionClass(el, startClass);
              }
              enterCancelledHook && enterCancelledHook(el);
          }
          else {
              afterEnterHook && afterEnterHook(el);
          }
          el._enterCb = null;
      }));
      if (!vnode.data.show) {
          // remove pending leave element on enter by injecting an insert hook
          mergeVNodeHook(vnode, 'insert', function () {
              var parent = el.parentNode;
              var pendingNode = parent && parent._pending && parent._pending[vnode.key];
              if (pendingNode &&
                  pendingNode.tag === vnode.tag &&
                  pendingNode.elm._leaveCb) {
                  pendingNode.elm._leaveCb();
              }
              enterHook && enterHook(el, cb);
          });
      }
      // start enter transition
      beforeEnterHook && beforeEnterHook(el);
      if (expectsCSS) {
          addTransitionClass(el, startClass);
          addTransitionClass(el, activeClass);
          nextFrame(function () {
              removeTransitionClass(el, startClass);
              // @ts-expect-error
              if (!cb.cancelled) {
                  addTransitionClass(el, toClass);
                  if (!userWantsControl) {
                      if (isValidDuration(explicitEnterDuration)) {
                          setTimeout(cb, explicitEnterDuration);
                      }
                      else {
                          whenTransitionEnds(el, type, cb);
                      }
                  }
              }
          });
      }
      if (vnode.data.show) {
          toggleDisplay && toggleDisplay();
          enterHook && enterHook(el, cb);
      }
      if (!expectsCSS && !userWantsControl) {
          cb();
      }
  }
  function leave(vnode, rm) {
      var el = vnode.elm;
      // call enter callback now
      if (isDef(el._enterCb)) {
          el._enterCb.cancelled = true;
          el._enterCb();
      }
      var data = resolveTransition(vnode.data.transition);
      if (isUndef(data) || el.nodeType !== 1) {
          return rm();
      }
      /* istanbul ignore if */
      if (isDef(el._leaveCb)) {
          return;
      }
      var css = data.css, type = data.type, leaveClass = data.leaveClass, leaveToClass = data.leaveToClass, leaveActiveClass = data.leaveActiveClass, beforeLeave = data.beforeLeave, leave = data.leave, afterLeave = data.afterLeave, leaveCancelled = data.leaveCancelled, delayLeave = data.delayLeave, duration = data.duration;
      var expectsCSS = css !== false && !isIE9;
      var userWantsControl = getHookArgumentsLength(leave);
      var explicitLeaveDuration = toNumber(isObject$1(duration) ? duration.leave : duration);
      if (isDef(explicitLeaveDuration)) {
          checkDuration(explicitLeaveDuration, 'leave', vnode);
      }
      var cb = (el._leaveCb = once(function () {
          if (el.parentNode && el.parentNode._pending) {
              el.parentNode._pending[vnode.key] = null;
          }
          if (expectsCSS) {
              removeTransitionClass(el, leaveToClass);
              removeTransitionClass(el, leaveActiveClass);
          }
          // @ts-expect-error
          if (cb.cancelled) {
              if (expectsCSS) {
                  removeTransitionClass(el, leaveClass);
              }
              leaveCancelled && leaveCancelled(el);
          }
          else {
              rm();
              afterLeave && afterLeave(el);
          }
          el._leaveCb = null;
      }));
      if (delayLeave) {
          delayLeave(performLeave);
      }
      else {
          performLeave();
      }
      function performLeave() {
          // the delayed leave may have already been cancelled
          // @ts-expect-error
          if (cb.cancelled) {
              return;
          }
          // record leaving element
          if (!vnode.data.show && el.parentNode) {
              (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] =
                  vnode;
          }
          beforeLeave && beforeLeave(el);
          if (expectsCSS) {
              addTransitionClass(el, leaveClass);
              addTransitionClass(el, leaveActiveClass);
              nextFrame(function () {
                  removeTransitionClass(el, leaveClass);
                  // @ts-expect-error
                  if (!cb.cancelled) {
                      addTransitionClass(el, leaveToClass);
                      if (!userWantsControl) {
                          if (isValidDuration(explicitLeaveDuration)) {
                              setTimeout(cb, explicitLeaveDuration);
                          }
                          else {
                              whenTransitionEnds(el, type, cb);
                          }
                      }
                  }
              });
          }
          leave && leave(el, cb);
          if (!expectsCSS && !userWantsControl) {
              cb();
          }
      }
  }
  // only used in dev mode
  function checkDuration(val, name, vnode) {
      if (typeof val !== 'number') {
          warn$2("<transition> explicit ".concat(name, " duration is not a valid number - ") +
              "got ".concat(JSON.stringify(val), "."), vnode.context);
      }
      else if (isNaN(val)) {
          warn$2("<transition> explicit ".concat(name, " duration is NaN - ") +
              'the duration expression might be incorrect.', vnode.context);
      }
  }
  function isValidDuration(val) {
      return typeof val === 'number' && !isNaN(val);
  }
  /**
   * Normalize a transition hook's argument length. The hook may be:
   * - a merged hook (invoker) with the original in .fns
   * - a wrapped component method (check ._length)
   * - a plain function (.length)
   */
  function getHookArgumentsLength(fn) {
      if (isUndef(fn)) {
          return false;
      }
      // @ts-expect-error
      var invokerFns = fn.fns;
      if (isDef(invokerFns)) {
          // invoker
          return getHookArgumentsLength(Array.isArray(invokerFns) ? invokerFns[0] : invokerFns);
      }
      else {
          // @ts-expect-error
          return (fn._length || fn.length) > 1;
      }
  }
  function _enter(_, vnode) {
      if (vnode.data.show !== true) {
          enter(vnode);
      }
  }
  var transition = inBrowser
      ? {
          create: _enter,
          activate: _enter,
          remove: function (vnode, rm) {
              /* istanbul ignore else */
              if (vnode.data.show !== true) {
                  // @ts-expect-error
                  leave(vnode, rm);
              }
              else {
                  rm();
              }
          }
      }
      : {};

  var platformModules = [attrs, klass$1, events, domProps, style$1, transition];

  // the directive module should be applied last, after all
  // built-in modules have been applied.
  var modules$1 = platformModules.concat(baseModules);
  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules$1 });

  /**
   * Not type checking this file because flow doesn't like attaching
   * properties to Elements.
   */
  /* istanbul ignore if */
  if (isIE9) {
      // http://www.matts411.com/post/internet-explorer-9-oninput/
      document.addEventListener('selectionchange', function () {
          var el = document.activeElement;
          // @ts-expect-error
          if (el && el.vmodel) {
              trigger(el, 'input');
          }
      });
  }
  var directive = {
      inserted: function (el, binding, vnode, oldVnode) {
          if (vnode.tag === 'select') {
              // #6903
              if (oldVnode.elm && !oldVnode.elm._vOptions) {
                  mergeVNodeHook(vnode, 'postpatch', function () {
                      directive.componentUpdated(el, binding, vnode);
                  });
              }
              else {
                  setSelected(el, binding, vnode.context);
              }
              el._vOptions = [].map.call(el.options, getValue);
          }
          else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
              el._vModifiers = binding.modifiers;
              if (!binding.modifiers.lazy) {
                  el.addEventListener('compositionstart', onCompositionStart);
                  el.addEventListener('compositionend', onCompositionEnd);
                  // Safari < 10.2 & UIWebView doesn't fire compositionend when
                  // switching focus before confirming composition choice
                  // this also fixes the issue where some browsers e.g. iOS Chrome
                  // fires "change" instead of "input" on autocomplete.
                  el.addEventListener('change', onCompositionEnd);
                  /* istanbul ignore if */
                  if (isIE9) {
                      el.vmodel = true;
                  }
              }
          }
      },
      componentUpdated: function (el, binding, vnode) {
          if (vnode.tag === 'select') {
              setSelected(el, binding, vnode.context);
              // in case the options rendered by v-for have changed,
              // it's possible that the value is out-of-sync with the rendered options.
              // detect such cases and filter out values that no longer has a matching
              // option in the DOM.
              var prevOptions_1 = el._vOptions;
              var curOptions_1 = (el._vOptions = [].map.call(el.options, getValue));
              if (curOptions_1.some(function (o, i) { return !looseEqual(o, prevOptions_1[i]); })) {
                  // trigger change event if
                  // no matching option found for at least one value
                  var needReset = el.multiple
                      ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions_1); })
                      : binding.value !== binding.oldValue &&
                          hasNoMatchingOption(binding.value, curOptions_1);
                  if (needReset) {
                      trigger(el, 'change');
                  }
              }
          }
      }
  };
  function setSelected(el, binding, vm) {
      actuallySetSelected(el, binding, vm);
      /* istanbul ignore if */
      if (isIE || isEdge) {
          setTimeout(function () {
              actuallySetSelected(el, binding, vm);
          }, 0);
      }
  }
  function actuallySetSelected(el, binding, vm) {
      var value = binding.value;
      var isMultiple = el.multiple;
      if (isMultiple && !Array.isArray(value)) {
          warn$2("<select multiple v-model=\"".concat(binding.expression, "\"> ") +
                  "expects an Array value for its binding, but got ".concat(Object.prototype.toString
                      .call(value)
                      .slice(8, -1)), vm);
          return;
      }
      var selected, option;
      for (var i = 0, l = el.options.length; i < l; i++) {
          option = el.options[i];
          if (isMultiple) {
              selected = looseIndexOf(value, getValue(option)) > -1;
              if (option.selected !== selected) {
                  option.selected = selected;
              }
          }
          else {
              if (looseEqual(getValue(option), value)) {
                  if (el.selectedIndex !== i) {
                      el.selectedIndex = i;
                  }
                  return;
              }
          }
      }
      if (!isMultiple) {
          el.selectedIndex = -1;
      }
  }
  function hasNoMatchingOption(value, options) {
      return options.every(function (o) { return !looseEqual(o, value); });
  }
  function getValue(option) {
      return '_value' in option ? option._value : option.value;
  }
  function onCompositionStart(e) {
      e.target.composing = true;
  }
  function onCompositionEnd(e) {
      // prevent triggering an input event for no reason
      if (!e.target.composing)
          return;
      e.target.composing = false;
      trigger(e.target, 'input');
  }
  function trigger(el, type) {
      var e = document.createEvent('HTMLEvents');
      e.initEvent(type, true, true);
      el.dispatchEvent(e);
  }

  // recursively search for possible transition defined inside the component root
  function locateNode(vnode) {
      // @ts-expect-error
      return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
          ? locateNode(vnode.componentInstance._vnode)
          : vnode;
  }
  var show = {
      bind: function (el, _a, vnode) {
          var value = _a.value;
          vnode = locateNode(vnode);
          var transition = vnode.data && vnode.data.transition;
          var originalDisplay = (el.__vOriginalDisplay =
              el.style.display === 'none' ? '' : el.style.display);
          if (value && transition) {
              vnode.data.show = true;
              enter(vnode, function () {
                  el.style.display = originalDisplay;
              });
          }
          else {
              el.style.display = value ? originalDisplay : 'none';
          }
      },
      update: function (el, _a, vnode) {
          var value = _a.value, oldValue = _a.oldValue;
          /* istanbul ignore if */
          if (!value === !oldValue)
              return;
          vnode = locateNode(vnode);
          var transition = vnode.data && vnode.data.transition;
          if (transition) {
              vnode.data.show = true;
              if (value) {
                  enter(vnode, function () {
                      el.style.display = el.__vOriginalDisplay;
                  });
              }
              else {
                  leave(vnode, function () {
                      el.style.display = 'none';
                  });
              }
          }
          else {
              el.style.display = value ? el.__vOriginalDisplay : 'none';
          }
      },
      unbind: function (el, binding, vnode, oldVnode, isDestroy) {
          if (!isDestroy) {
              el.style.display = el.__vOriginalDisplay;
          }
      }
  };

  var platformDirectives = {
      model: directive,
      show: show
  };

  // Provides transition support for a single element/component.
  var transitionProps = {
      name: String,
      appear: Boolean,
      css: Boolean,
      mode: String,
      type: String,
      enterClass: String,
      leaveClass: String,
      enterToClass: String,
      leaveToClass: String,
      enterActiveClass: String,
      leaveActiveClass: String,
      appearClass: String,
      appearActiveClass: String,
      appearToClass: String,
      duration: [Number, String, Object]
  };
  // in case the child is also an abstract component, e.g. <keep-alive>
  // we want to recursively retrieve the real component to be rendered
  function getRealChild(vnode) {
      var compOptions = vnode && vnode.componentOptions;
      if (compOptions && compOptions.Ctor.options.abstract) {
          return getRealChild(getFirstComponentChild(compOptions.children));
      }
      else {
          return vnode;
      }
  }
  function extractTransitionData(comp) {
      var data = {};
      var options = comp.$options;
      // props
      for (var key in options.propsData) {
          data[key] = comp[key];
      }
      // events.
      // extract listeners and pass them directly to the transition methods
      var listeners = options._parentListeners;
      for (var key in listeners) {
          data[camelize(key)] = listeners[key];
      }
      return data;
  }
  function placeholder(h, rawChild) {
      // @ts-expect-error
      if (/\d-keep-alive$/.test(rawChild.tag)) {
          return h('keep-alive', {
              props: rawChild.componentOptions.propsData
          });
      }
  }
  function hasParentTransition(vnode) {
      while ((vnode = vnode.parent)) {
          if (vnode.data.transition) {
              return true;
          }
      }
  }
  function isSameChild(child, oldChild) {
      return oldChild.key === child.key && oldChild.tag === child.tag;
  }
  var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };
  var isVShowDirective = function (d) { return d.name === 'show'; };
  var Transition = {
      name: 'transition',
      props: transitionProps,
      abstract: true,
      render: function (h) {
          var _this = this;
          var children = this.$slots.default;
          if (!children) {
              return;
          }
          // filter out text nodes (possible whitespaces)
          children = children.filter(isNotTextNode);
          /* istanbul ignore if */
          if (!children.length) {
              return;
          }
          // warn multiple elements
          if (children.length > 1) {
              warn$2('<transition> can only be used on a single element. Use ' +
                  '<transition-group> for lists.', this.$parent);
          }
          var mode = this.mode;
          // warn invalid mode
          if (mode && mode !== 'in-out' && mode !== 'out-in') {
              warn$2('invalid <transition> mode: ' + mode, this.$parent);
          }
          var rawChild = children[0];
          // if this is a component root node and the component's
          // parent container node also has transition, skip.
          if (hasParentTransition(this.$vnode)) {
              return rawChild;
          }
          // apply transition data to child
          // use getRealChild() to ignore abstract components e.g. keep-alive
          var child = getRealChild(rawChild);
          /* istanbul ignore if */
          if (!child) {
              return rawChild;
          }
          if (this._leaving) {
              return placeholder(h, rawChild);
          }
          // ensure a key that is unique to the vnode type and to this transition
          // component instance. This key will be used to remove pending leaving nodes
          // during entering.
          var id = "__transition-".concat(this._uid, "-");
          child.key =
              child.key == null
                  ? child.isComment
                      ? id + 'comment'
                      : id + child.tag
                  : isPrimitive(child.key)
                      ? String(child.key).indexOf(id) === 0
                          ? child.key
                          : id + child.key
                      : child.key;
          var data = ((child.data || (child.data = {})).transition =
              extractTransitionData(this));
          var oldRawChild = this._vnode;
          var oldChild = getRealChild(oldRawChild);
          // mark v-show
          // so that the transition module can hand over the control to the directive
          if (child.data.directives && child.data.directives.some(isVShowDirective)) {
              child.data.show = true;
          }
          if (oldChild &&
              oldChild.data &&
              !isSameChild(child, oldChild) &&
              !isAsyncPlaceholder(oldChild) &&
              // #6687 component root is a comment node
              !(oldChild.componentInstance &&
                  oldChild.componentInstance._vnode.isComment)) {
              // replace old child transition data with fresh one
              // important for dynamic transitions!
              var oldData = (oldChild.data.transition = extend$1({}, data));
              // handle transition mode
              if (mode === 'out-in') {
                  // return placeholder node and queue update when leave finishes
                  this._leaving = true;
                  mergeVNodeHook(oldData, 'afterLeave', function () {
                      _this._leaving = false;
                      _this.$forceUpdate();
                  });
                  return placeholder(h, rawChild);
              }
              else if (mode === 'in-out') {
                  if (isAsyncPlaceholder(child)) {
                      return oldRawChild;
                  }
                  var delayedLeave_1;
                  var performLeave = function () {
                      delayedLeave_1();
                  };
                  mergeVNodeHook(data, 'afterEnter', performLeave);
                  mergeVNodeHook(data, 'enterCancelled', performLeave);
                  mergeVNodeHook(oldData, 'delayLeave', function (leave) {
                      delayedLeave_1 = leave;
                  });
              }
          }
          return rawChild;
      }
  };

  // Provides transition support for list items.
  var props = extend$1({
      tag: String,
      moveClass: String
  }, transitionProps);
  delete props.mode;
  var TransitionGroup = {
      props: props,
      beforeMount: function () {
          var _this = this;
          var update = this._update;
          this._update = function (vnode, hydrating) {
              var restoreActiveInstance = setActiveInstance(_this);
              // force removing pass
              _this.__patch__(_this._vnode, _this.kept, false, // hydrating
              true // removeOnly (!important, avoids unnecessary moves)
              );
              _this._vnode = _this.kept;
              restoreActiveInstance();
              update.call(_this, vnode, hydrating);
          };
      },
      render: function (h) {
          var tag = this.tag || this.$vnode.data.tag || 'span';
          var map = Object.create(null);
          var prevChildren = (this.prevChildren = this.children);
          var rawChildren = this.$slots.default || [];
          var children = (this.children = []);
          var transitionData = extractTransitionData(this);
          for (var i = 0; i < rawChildren.length; i++) {
              var c = rawChildren[i];
              if (c.tag) {
                  if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
                      children.push(c);
                      map[c.key] = c;
                      (c.data || (c.data = {})).transition = transitionData;
                  }
                  else {
                      var opts = c.componentOptions;
                      var name_1 = opts
                          ? getComponentName(opts.Ctor.options) || opts.tag || ''
                          : c.tag;
                      warn$2("<transition-group> children must be keyed: <".concat(name_1, ">"));
                  }
              }
          }
          if (prevChildren) {
              var kept = [];
              var removed = [];
              for (var i = 0; i < prevChildren.length; i++) {
                  var c = prevChildren[i];
                  c.data.transition = transitionData;
                  // @ts-expect-error .getBoundingClientRect is not typed in Node
                  c.data.pos = c.elm.getBoundingClientRect();
                  if (map[c.key]) {
                      kept.push(c);
                  }
                  else {
                      removed.push(c);
                  }
              }
              this.kept = h(tag, null, kept);
              this.removed = removed;
          }
          return h(tag, null, children);
      },
      updated: function () {
          var children = this.prevChildren;
          var moveClass = this.moveClass || (this.name || 'v') + '-move';
          if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
              return;
          }
          // we divide the work into three loops to avoid mixing DOM reads and writes
          // in each iteration - which helps prevent layout thrashing.
          children.forEach(callPendingCbs);
          children.forEach(recordPosition);
          children.forEach(applyTranslation);
          // force reflow to put everything in position
          // assign to this to avoid being removed in tree-shaking
          // $flow-disable-line
          this._reflow = document.body.offsetHeight;
          children.forEach(function (c) {
              if (c.data.moved) {
                  var el_1 = c.elm;
                  var s = el_1.style;
                  addTransitionClass(el_1, moveClass);
                  s.transform = s.WebkitTransform = s.transitionDuration = '';
                  el_1.addEventListener(transitionEndEvent, (el_1._moveCb = function cb(e) {
                      if (e && e.target !== el_1) {
                          return;
                      }
                      if (!e || /transform$/.test(e.propertyName)) {
                          el_1.removeEventListener(transitionEndEvent, cb);
                          el_1._moveCb = null;
                          removeTransitionClass(el_1, moveClass);
                      }
                  }));
              }
          });
      },
      methods: {
          hasMove: function (el, moveClass) {
              /* istanbul ignore if */
              if (!hasTransition) {
                  return false;
              }
              /* istanbul ignore if */
              if (this._hasMove) {
                  return this._hasMove;
              }
              // Detect whether an element with the move class applied has
              // CSS transitions. Since the element may be inside an entering
              // transition at this very moment, we make a clone of it and remove
              // all other transition classes applied to ensure only the move class
              // is applied.
              var clone = el.cloneNode();
              if (el._transitionClasses) {
                  el._transitionClasses.forEach(function (cls) {
                      removeClass(clone, cls);
                  });
              }
              addClass(clone, moveClass);
              clone.style.display = 'none';
              this.$el.appendChild(clone);
              var info = getTransitionInfo(clone);
              this.$el.removeChild(clone);
              return (this._hasMove = info.hasTransform);
          }
      }
  };
  function callPendingCbs(c) {
      /* istanbul ignore if */
      if (c.elm._moveCb) {
          c.elm._moveCb();
      }
      /* istanbul ignore if */
      if (c.elm._enterCb) {
          c.elm._enterCb();
      }
  }
  function recordPosition(c) {
      c.data.newPos = c.elm.getBoundingClientRect();
  }
  function applyTranslation(c) {
      var oldPos = c.data.pos;
      var newPos = c.data.newPos;
      var dx = oldPos.left - newPos.left;
      var dy = oldPos.top - newPos.top;
      if (dx || dy) {
          c.data.moved = true;
          var s = c.elm.style;
          s.transform = s.WebkitTransform = "translate(".concat(dx, "px,").concat(dy, "px)");
          s.transitionDuration = '0s';
      }
  }

  var platformComponents = {
      Transition: Transition,
      TransitionGroup: TransitionGroup
  };

  // install platform specific utils
  Vue.config.mustUseProp = mustUseProp;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.isReservedAttr = isReservedAttr;
  Vue.config.getTagNamespace = getTagNamespace;
  Vue.config.isUnknownElement = isUnknownElement;
  // install platform runtime directives & components
  extend$1(Vue.options.directives, platformDirectives);
  extend$1(Vue.options.components, platformComponents);
  // install platform patch function
  Vue.prototype.__patch__ = inBrowser ? patch : noop$1;
  // public mount method
  Vue.prototype.$mount = function (el, hydrating) {
      el = el && inBrowser ? query(el) : undefined;
      return mountComponent(this, el, hydrating);
  };
  // devtools global hook
  /* istanbul ignore next */
  if (inBrowser) {
      setTimeout(function () {
          if (config.devtools) {
              if (devtools) {
                  devtools.emit('init', Vue);
              }
              else {
                  // @ts-expect-error
                  console[console.info ? 'info' : 'log']('Download the Vue Devtools extension for a better development experience:\n' +
                      'https://github.com/vuejs/vue-devtools');
              }
          }
          if (config.productionTip !== false &&
              typeof console !== 'undefined') {
              // @ts-expect-error
              console[console.info ? 'info' : 'log']("You are running Vue in development mode.\n" +
                  "Make sure to turn on production mode when deploying for production.\n" +
                  "See more tips at https://vuejs.org/guide/deployment.html");
          }
      }, 0);
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
  var buildRegex = cached(function (delimiters) {
      var open = delimiters[0].replace(regexEscapeRE, '\\$&');
      var close = delimiters[1].replace(regexEscapeRE, '\\$&');
      return new RegExp(open + '((?:.|\\n)+?)' + close, 'g');
  });
  function parseText(text, delimiters) {
      //@ts-expect-error
      var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
      if (!tagRE.test(text)) {
          return;
      }
      var tokens = [];
      var rawTokens = [];
      var lastIndex = (tagRE.lastIndex = 0);
      var match, index, tokenValue;
      while ((match = tagRE.exec(text))) {
          index = match.index;
          // push text token
          if (index > lastIndex) {
              rawTokens.push((tokenValue = text.slice(lastIndex, index)));
              tokens.push(JSON.stringify(tokenValue));
          }
          // tag token
          var exp = parseFilters(match[1].trim());
          tokens.push("_s(".concat(exp, ")"));
          rawTokens.push({ '@binding': exp });
          lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
          rawTokens.push((tokenValue = text.slice(lastIndex)));
          tokens.push(JSON.stringify(tokenValue));
      }
      return {
          expression: tokens.join('+'),
          tokens: rawTokens
      };
  }

  function transformNode$1(el, options) {
      var warn = options.warn || baseWarn;
      var staticClass = getAndRemoveAttr(el, 'class');
      if (staticClass) {
          var res = parseText(staticClass, options.delimiters);
          if (res) {
              warn("class=\"".concat(staticClass, "\": ") +
                  'Interpolation inside attributes has been removed. ' +
                  'Use v-bind or the colon shorthand instead. For example, ' +
                  'instead of <div class="{{ val }}">, use <div :class="val">.', el.rawAttrsMap['class']);
          }
      }
      if (staticClass) {
          el.staticClass = JSON.stringify(staticClass.replace(/\s+/g, ' ').trim());
      }
      var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
      if (classBinding) {
          el.classBinding = classBinding;
      }
  }
  function genData$2(el) {
      var data = '';
      if (el.staticClass) {
          data += "staticClass:".concat(el.staticClass, ",");
      }
      if (el.classBinding) {
          data += "class:".concat(el.classBinding, ",");
      }
      return data;
  }
  var klass = {
      staticKeys: ['staticClass'],
      transformNode: transformNode$1,
      genData: genData$2
  };

  function transformNode(el, options) {
      var warn = options.warn || baseWarn;
      var staticStyle = getAndRemoveAttr(el, 'style');
      if (staticStyle) {
          /* istanbul ignore if */
          {
              var res = parseText(staticStyle, options.delimiters);
              if (res) {
                  warn("style=\"".concat(staticStyle, "\": ") +
                      'Interpolation inside attributes has been removed. ' +
                      'Use v-bind or the colon shorthand instead. For example, ' +
                      'instead of <div style="{{ val }}">, use <div :style="val">.', el.rawAttrsMap['style']);
              }
          }
          el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
      }
      var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
      if (styleBinding) {
          el.styleBinding = styleBinding;
      }
  }
  function genData$1(el) {
      var data = '';
      if (el.staticStyle) {
          data += "staticStyle:".concat(el.staticStyle, ",");
      }
      if (el.styleBinding) {
          data += "style:(".concat(el.styleBinding, "),");
      }
      return data;
  }
  var style = {
      staticKeys: ['staticStyle'],
      transformNode: transformNode,
      genData: genData$1
  };

  var decoder;
  var he = {
      decode: function (html) {
          decoder = decoder || document.createElement('div');
          decoder.innerHTML = html;
          return decoder.textContent;
      }
  };

  var isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
      'link,meta,param,source,track,wbr');
  // Elements that you can, intentionally, leave open
  // (and which close themselves)
  var canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source');
  // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
  // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
  var isNonPhrasingTag = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
      'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
      'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
      'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
      'title,tr,track');

  /**
   * Not type-checking this file because it's mostly vendor code.
   */
  // Regular Expressions for parsing tags and attributes
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z".concat(unicodeRegExp.source, "]*");
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  var doctype = /^<!DOCTYPE [^>]+>/i;
  // #7298: escape - to avoid being passed as HTML comment when inlined in page
  var comment = /^<!\--/;
  var conditionalComment = /^<!\[/;
  // Special Elements (can contain anything)
  var isPlainTextElement = makeMap('script,style,textarea', true);
  var reCache = {};
  var decodingMap = {
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&amp;': '&',
      '&#10;': '\n',
      '&#9;': '\t',
      '&#39;': "'"
  };
  var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
  var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;
  // #5992
  var isIgnoreNewlineTag = makeMap('pre,textarea', true);
  var shouldIgnoreFirstNewline = function (tag, html) {
      return tag && isIgnoreNewlineTag(tag) && html[0] === '\n';
  };
  function decodeAttr(value, shouldDecodeNewlines) {
      var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
      return value.replace(re, function (match) { return decodingMap[match]; });
  }
  function parseHTML(html, options) {
      var stack = [];
      var expectHTML = options.expectHTML;
      var isUnaryTag = options.isUnaryTag || no;
      var canBeLeftOpenTag = options.canBeLeftOpenTag || no;
      var index = 0;
      var last, lastTag;
      var _loop_1 = function () {
          last = html;
          // Make sure we're not in a plaintext content element like script/style
          if (!lastTag || !isPlainTextElement(lastTag)) {
              var textEnd = html.indexOf('<');
              if (textEnd === 0) {
                  // Comment:
                  if (comment.test(html)) {
                      var commentEnd = html.indexOf('-->');
                      if (commentEnd >= 0) {
                          if (options.shouldKeepComment && options.comment) {
                              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
                          }
                          advance(commentEnd + 3);
                          return "continue";
                      }
                  }
                  // https://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                  if (conditionalComment.test(html)) {
                      var conditionalEnd = html.indexOf(']>');
                      if (conditionalEnd >= 0) {
                          advance(conditionalEnd + 2);
                          return "continue";
                      }
                  }
                  // Doctype:
                  var doctypeMatch = html.match(doctype);
                  if (doctypeMatch) {
                      advance(doctypeMatch[0].length);
                      return "continue";
                  }
                  // End tag:
                  var endTagMatch = html.match(endTag);
                  if (endTagMatch) {
                      var curIndex = index;
                      advance(endTagMatch[0].length);
                      parseEndTag(endTagMatch[1], curIndex, index);
                      return "continue";
                  }
                  // Start tag:
                  var startTagMatch = parseStartTag();
                  if (startTagMatch) {
                      handleStartTag(startTagMatch);
                      if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
                          advance(1);
                      }
                      return "continue";
                  }
              }
              var text = void 0, rest = void 0, next = void 0;
              if (textEnd >= 0) {
                  rest = html.slice(textEnd);
                  while (!endTag.test(rest) &&
                      !startTagOpen.test(rest) &&
                      !comment.test(rest) &&
                      !conditionalComment.test(rest)) {
                      // < in plain text, be forgiving and treat it as text
                      next = rest.indexOf('<', 1);
                      if (next < 0)
                          break;
                      textEnd += next;
                      rest = html.slice(textEnd);
                  }
                  text = html.substring(0, textEnd);
              }
              if (textEnd < 0) {
                  text = html;
              }
              if (text) {
                  advance(text.length);
              }
              if (options.chars && text) {
                  options.chars(text, index - text.length, index);
              }
          }
          else {
              var endTagLength_1 = 0;
              var stackedTag_1 = lastTag.toLowerCase();
              var reStackedTag = reCache[stackedTag_1] ||
                  (reCache[stackedTag_1] = new RegExp('([\\s\\S]*?)(</' + stackedTag_1 + '[^>]*>)', 'i'));
              var rest = html.replace(reStackedTag, function (all, text, endTag) {
                  endTagLength_1 = endTag.length;
                  if (!isPlainTextElement(stackedTag_1) && stackedTag_1 !== 'noscript') {
                      text = text
                          .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
                          .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
                  }
                  if (shouldIgnoreFirstNewline(stackedTag_1, text)) {
                      text = text.slice(1);
                  }
                  if (options.chars) {
                      options.chars(text);
                  }
                  return '';
              });
              index += html.length - rest.length;
              html = rest;
              parseEndTag(stackedTag_1, index - endTagLength_1, index);
          }
          if (html === last) {
              options.chars && options.chars(html);
              if (!stack.length && options.warn) {
                  options.warn("Mal-formatted tag at end of template: \"".concat(html, "\""), {
                      start: index + html.length
                  });
              }
              return "break";
          }
      };
      while (html) {
          var state_1 = _loop_1();
          if (state_1 === "break")
              break;
      }
      // Clean up any remaining tags
      parseEndTag();
      function advance(n) {
          index += n;
          html = html.substring(n);
      }
      function parseStartTag() {
          var start = html.match(startTagOpen);
          if (start) {
              var match = {
                  tagName: start[1],
                  attrs: [],
                  start: index
              };
              advance(start[0].length);
              var end = void 0, attr = void 0;
              while (!(end = html.match(startTagClose)) &&
                  (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
                  attr.start = index;
                  advance(attr[0].length);
                  attr.end = index;
                  match.attrs.push(attr);
              }
              if (end) {
                  match.unarySlash = end[1];
                  advance(end[0].length);
                  match.end = index;
                  return match;
              }
          }
      }
      function handleStartTag(match) {
          var tagName = match.tagName;
          var unarySlash = match.unarySlash;
          if (expectHTML) {
              if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                  parseEndTag(lastTag);
              }
              if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
                  parseEndTag(tagName);
              }
          }
          var unary = isUnaryTag(tagName) || !!unarySlash;
          var l = match.attrs.length;
          var attrs = new Array(l);
          for (var i = 0; i < l; i++) {
              var args = match.attrs[i];
              var value = args[3] || args[4] || args[5] || '';
              var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
                  ? options.shouldDecodeNewlinesForHref
                  : options.shouldDecodeNewlines;
              attrs[i] = {
                  name: args[1],
                  value: decodeAttr(value, shouldDecodeNewlines)
              };
              if (options.outputSourceRange) {
                  attrs[i].start = args.start + args[0].match(/^\s*/).length;
                  attrs[i].end = args.end;
              }
          }
          if (!unary) {
              stack.push({
                  tag: tagName,
                  lowerCasedTag: tagName.toLowerCase(),
                  attrs: attrs,
                  start: match.start,
                  end: match.end
              });
              lastTag = tagName;
          }
          if (options.start) {
              options.start(tagName, attrs, unary, match.start, match.end);
          }
      }
      function parseEndTag(tagName, start, end) {
          var pos, lowerCasedTagName;
          if (start == null)
              start = index;
          if (end == null)
              end = index;
          // Find the closest opened tag of the same type
          if (tagName) {
              lowerCasedTagName = tagName.toLowerCase();
              for (pos = stack.length - 1; pos >= 0; pos--) {
                  if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                      break;
                  }
              }
          }
          else {
              // If no tag name is provided, clean shop
              pos = 0;
          }
          if (pos >= 0) {
              // Close all the open elements, up the stack
              for (var i = stack.length - 1; i >= pos; i--) {
                  if ((i > pos || !tagName) && options.warn) {
                      options.warn("tag <".concat(stack[i].tag, "> has no matching end tag."), {
                          start: stack[i].start,
                          end: stack[i].end
                      });
                  }
                  if (options.end) {
                      options.end(stack[i].tag, start, end);
                  }
              }
              // Remove the open elements from the stack
              stack.length = pos;
              lastTag = pos && stack[pos - 1].tag;
          }
          else if (lowerCasedTagName === 'br') {
              if (options.start) {
                  options.start(tagName, [], true, start, end);
              }
          }
          else if (lowerCasedTagName === 'p') {
              if (options.start) {
                  options.start(tagName, [], false, start, end);
              }
              if (options.end) {
                  options.end(tagName, start, end);
              }
          }
      }
  }

  var onRE = /^@|^v-on:/;
  var dirRE = /^v-|^@|^:|^#/;
  var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
  var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
  var stripParensRE = /^\(|\)$/g;
  var dynamicArgRE = /^\[.*\]$/;
  var argRE = /:(.*)$/;
  var bindRE = /^:|^\.|^v-bind:/;
  var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;
  var slotRE = /^v-slot(:|$)|^#/;
  var lineBreakRE = /[\r\n]/;
  var whitespaceRE = /[ \f\t\r\n]+/g;
  var invalidAttributeRE = /[\s"'<>\/=]/;
  var decodeHTMLCached = cached(he.decode);
  var emptySlotScopeToken = "_empty_";
  // configurable state
  var warn;
  var delimiters;
  var transforms;
  var preTransforms;
  var postTransforms;
  var platformIsPreTag;
  var platformMustUseProp;
  var platformGetTagNamespace;
  var maybeComponent;
  function createASTElement(tag, attrs, parent) {
      return {
          type: 1,
          tag: tag,
          attrsList: attrs,
          attrsMap: makeAttrsMap(attrs),
          rawAttrsMap: {},
          parent: parent,
          children: []
      };
  }
  /**
   * Convert HTML string to AST.
   */
  function parse(template, options) {
      warn = options.warn || baseWarn;
      platformIsPreTag = options.isPreTag || no;
      platformMustUseProp = options.mustUseProp || no;
      platformGetTagNamespace = options.getTagNamespace || no;
      var isReservedTag = options.isReservedTag || no;
      maybeComponent = function (el) {
          return !!(el.component ||
              el.attrsMap[':is'] ||
              el.attrsMap['v-bind:is'] ||
              !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag)));
      };
      transforms = pluckModuleFunction(options.modules, 'transformNode');
      preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
      postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
      delimiters = options.delimiters;
      var stack = [];
      var preserveWhitespace = options.preserveWhitespace !== false;
      var whitespaceOption = options.whitespace;
      var root;
      var currentParent;
      var inVPre = false;
      var inPre = false;
      var warned = false;
      function warnOnce(msg, range) {
          if (!warned) {
              warned = true;
              warn(msg, range);
          }
      }
      function closeElement(element) {
          trimEndingWhitespace(element);
          if (!inVPre && !element.processed) {
              element = processElement(element, options);
          }
          // tree management
          if (!stack.length && element !== root) {
              // allow root elements with v-if, v-else-if and v-else
              if (root.if && (element.elseif || element.else)) {
                  {
                      checkRootConstraints(element);
                  }
                  addIfCondition(root, {
                      exp: element.elseif,
                      block: element
                  });
              }
              else {
                  warnOnce("Component template should contain exactly one root element. " +
                      "If you are using v-if on multiple elements, " +
                      "use v-else-if to chain them instead.", { start: element.start });
              }
          }
          if (currentParent && !element.forbidden) {
              if (element.elseif || element.else) {
                  processIfConditions(element, currentParent);
              }
              else {
                  if (element.slotScope) {
                      // scoped slot
                      // keep it in the children list so that v-else(-if) conditions can
                      // find it as the prev node.
                      var name_1 = element.slotTarget || '"default"';
                      (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name_1] = element;
                  }
                  currentParent.children.push(element);
                  element.parent = currentParent;
              }
          }
          // final children cleanup
          // filter out scoped slots
          element.children = element.children.filter(function (c) { return !c.slotScope; });
          // remove trailing whitespace node again
          trimEndingWhitespace(element);
          // check pre state
          if (element.pre) {
              inVPre = false;
          }
          if (platformIsPreTag(element.tag)) {
              inPre = false;
          }
          // apply post-transforms
          for (var i = 0; i < postTransforms.length; i++) {
              postTransforms[i](element, options);
          }
      }
      function trimEndingWhitespace(el) {
          // remove trailing whitespace node
          if (!inPre) {
              var lastNode = void 0;
              while ((lastNode = el.children[el.children.length - 1]) &&
                  lastNode.type === 3 &&
                  lastNode.text === ' ') {
                  el.children.pop();
              }
          }
      }
      function checkRootConstraints(el) {
          if (el.tag === 'slot' || el.tag === 'template') {
              warnOnce("Cannot use <".concat(el.tag, "> as component root element because it may ") +
                  'contain multiple nodes.', { start: el.start });
          }
          if (el.attrsMap.hasOwnProperty('v-for')) {
              warnOnce('Cannot use v-for on stateful component root element because ' +
                  'it renders multiple elements.', el.rawAttrsMap['v-for']);
          }
      }
      parseHTML(template, {
          warn: warn,
          expectHTML: options.expectHTML,
          isUnaryTag: options.isUnaryTag,
          canBeLeftOpenTag: options.canBeLeftOpenTag,
          shouldDecodeNewlines: options.shouldDecodeNewlines,
          shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
          shouldKeepComment: options.comments,
          outputSourceRange: options.outputSourceRange,
          start: function (tag, attrs, unary, start, end) {
              // check namespace.
              // inherit parent ns if there is one
              var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);
              // handle IE svg bug
              /* istanbul ignore if */
              if (isIE && ns === 'svg') {
                  attrs = guardIESVGBug(attrs);
              }
              var element = createASTElement(tag, attrs, currentParent);
              if (ns) {
                  element.ns = ns;
              }
              {
                  if (options.outputSourceRange) {
                      element.start = start;
                      element.end = end;
                      element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
                          cumulated[attr.name] = attr;
                          return cumulated;
                      }, {});
                  }
                  attrs.forEach(function (attr) {
                      if (invalidAttributeRE.test(attr.name)) {
                          warn("Invalid dynamic argument expression: attribute names cannot contain " +
                              "spaces, quotes, <, >, / or =.", options.outputSourceRange
                              ? {
                                  start: attr.start + attr.name.indexOf("["),
                                  end: attr.start + attr.name.length
                              }
                              : undefined);
                      }
                  });
              }
              if (isForbiddenTag(element) && !isServerRendering()) {
                  element.forbidden = true;
                  warn('Templates should only be responsible for mapping the state to the ' +
                          'UI. Avoid placing tags with side-effects in your templates, such as ' +
                          "<".concat(tag, ">") +
                          ', as they will not be parsed.', { start: element.start });
              }
              // apply pre-transforms
              for (var i = 0; i < preTransforms.length; i++) {
                  element = preTransforms[i](element, options) || element;
              }
              if (!inVPre) {
                  processPre(element);
                  if (element.pre) {
                      inVPre = true;
                  }
              }
              if (platformIsPreTag(element.tag)) {
                  inPre = true;
              }
              if (inVPre) {
                  processRawAttrs(element);
              }
              else if (!element.processed) {
                  // structural directives
                  processFor(element);
                  processIf(element);
                  processOnce(element);
              }
              if (!root) {
                  root = element;
                  {
                      checkRootConstraints(root);
                  }
              }
              if (!unary) {
                  currentParent = element;
                  stack.push(element);
              }
              else {
                  closeElement(element);
              }
          },
          end: function (tag, start, end) {
              var element = stack[stack.length - 1];
              // pop stack
              stack.length -= 1;
              currentParent = stack[stack.length - 1];
              if (options.outputSourceRange) {
                  element.end = end;
              }
              closeElement(element);
          },
          chars: function (text, start, end) {
              if (!currentParent) {
                  {
                      if (text === template) {
                          warnOnce('Component template requires a root element, rather than just text.', { start: start });
                      }
                      else if ((text = text.trim())) {
                          warnOnce("text \"".concat(text, "\" outside root element will be ignored."), {
                              start: start
                          });
                      }
                  }
                  return;
              }
              // IE textarea placeholder bug
              /* istanbul ignore if */
              if (isIE &&
                  currentParent.tag === 'textarea' &&
                  currentParent.attrsMap.placeholder === text) {
                  return;
              }
              var children = currentParent.children;
              if (inPre || text.trim()) {
                  text = isTextTag(currentParent)
                      ? text
                      : decodeHTMLCached(text);
              }
              else if (!children.length) {
                  // remove the whitespace-only node right after an opening tag
                  text = '';
              }
              else if (whitespaceOption) {
                  if (whitespaceOption === 'condense') {
                      // in condense mode, remove the whitespace node if it contains
                      // line break, otherwise condense to a single space
                      text = lineBreakRE.test(text) ? '' : ' ';
                  }
                  else {
                      text = ' ';
                  }
              }
              else {
                  text = preserveWhitespace ? ' ' : '';
              }
              if (text) {
                  if (!inPre && whitespaceOption === 'condense') {
                      // condense consecutive whitespaces into single space
                      text = text.replace(whitespaceRE, ' ');
                  }
                  var res = void 0;
                  var child = void 0;
                  if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
                      child = {
                          type: 2,
                          expression: res.expression,
                          tokens: res.tokens,
                          text: text
                      };
                  }
                  else if (text !== ' ' ||
                      !children.length ||
                      children[children.length - 1].text !== ' ') {
                      child = {
                          type: 3,
                          text: text
                      };
                  }
                  if (child) {
                      if (options.outputSourceRange) {
                          child.start = start;
                          child.end = end;
                      }
                      children.push(child);
                  }
              }
          },
          comment: function (text, start, end) {
              // adding anything as a sibling to the root node is forbidden
              // comments should still be allowed, but ignored
              if (currentParent) {
                  var child = {
                      type: 3,
                      text: text,
                      isComment: true
                  };
                  if (options.outputSourceRange) {
                      child.start = start;
                      child.end = end;
                  }
                  currentParent.children.push(child);
              }
          }
      });
      return root;
  }
  function processPre(el) {
      if (getAndRemoveAttr(el, 'v-pre') != null) {
          el.pre = true;
      }
  }
  function processRawAttrs(el) {
      var list = el.attrsList;
      var len = list.length;
      if (len) {
          var attrs = (el.attrs = new Array(len));
          for (var i = 0; i < len; i++) {
              attrs[i] = {
                  name: list[i].name,
                  value: JSON.stringify(list[i].value)
              };
              if (list[i].start != null) {
                  attrs[i].start = list[i].start;
                  attrs[i].end = list[i].end;
              }
          }
      }
      else if (!el.pre) {
          // non root node in pre blocks with no attributes
          el.plain = true;
      }
  }
  function processElement(element, options) {
      processKey(element);
      // determine whether this is a plain element after
      // removing structural attributes
      element.plain =
          !element.key && !element.scopedSlots && !element.attrsList.length;
      processRef(element);
      processSlotContent(element);
      processSlotOutlet(element);
      processComponent(element);
      for (var i = 0; i < transforms.length; i++) {
          element = transforms[i](element, options) || element;
      }
      processAttrs(element);
      return element;
  }
  function processKey(el) {
      var exp = getBindingAttr(el, 'key');
      if (exp) {
          {
              if (el.tag === 'template') {
                  warn("<template> cannot be keyed. Place the key on real elements instead.", getRawBindingAttr(el, 'key'));
              }
              if (el.for) {
                  var iterator = el.iterator2 || el.iterator1;
                  var parent_1 = el.parent;
                  if (iterator &&
                      iterator === exp &&
                      parent_1 &&
                      parent_1.tag === 'transition-group') {
                      warn("Do not use v-for index as key on <transition-group> children, " +
                          "this is the same as not using keys.", getRawBindingAttr(el, 'key'), true /* tip */);
                  }
              }
          }
          el.key = exp;
      }
  }
  function processRef(el) {
      var ref = getBindingAttr(el, 'ref');
      if (ref) {
          el.ref = ref;
          el.refInFor = checkInFor(el);
      }
  }
  function processFor(el) {
      var exp;
      if ((exp = getAndRemoveAttr(el, 'v-for'))) {
          var res = parseFor(exp);
          if (res) {
              extend$1(el, res);
          }
          else {
              warn("Invalid v-for expression: ".concat(exp), el.rawAttrsMap['v-for']);
          }
      }
  }
  function parseFor(exp) {
      var inMatch = exp.match(forAliasRE);
      if (!inMatch)
          return;
      var res = {};
      res.for = inMatch[2].trim();
      var alias = inMatch[1].trim().replace(stripParensRE, '');
      var iteratorMatch = alias.match(forIteratorRE);
      if (iteratorMatch) {
          res.alias = alias.replace(forIteratorRE, '').trim();
          res.iterator1 = iteratorMatch[1].trim();
          if (iteratorMatch[2]) {
              res.iterator2 = iteratorMatch[2].trim();
          }
      }
      else {
          res.alias = alias;
      }
      return res;
  }
  function processIf(el) {
      var exp = getAndRemoveAttr(el, 'v-if');
      if (exp) {
          el.if = exp;
          addIfCondition(el, {
              exp: exp,
              block: el
          });
      }
      else {
          if (getAndRemoveAttr(el, 'v-else') != null) {
              el.else = true;
          }
          var elseif = getAndRemoveAttr(el, 'v-else-if');
          if (elseif) {
              el.elseif = elseif;
          }
      }
  }
  function processIfConditions(el, parent) {
      var prev = findPrevElement(parent.children);
      if (prev && prev.if) {
          addIfCondition(prev, {
              exp: el.elseif,
              block: el
          });
      }
      else {
          warn("v-".concat(el.elseif ? 'else-if="' + el.elseif + '"' : 'else', " ") +
              "used on element <".concat(el.tag, "> without corresponding v-if."), el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']);
      }
  }
  function findPrevElement(children) {
      var i = children.length;
      while (i--) {
          if (children[i].type === 1) {
              return children[i];
          }
          else {
              if (children[i].text !== ' ') {
                  warn("text \"".concat(children[i].text.trim(), "\" between v-if and v-else(-if) ") +
                      "will be ignored.", children[i]);
              }
              children.pop();
          }
      }
  }
  function addIfCondition(el, condition) {
      if (!el.ifConditions) {
          el.ifConditions = [];
      }
      el.ifConditions.push(condition);
  }
  function processOnce(el) {
      var once = getAndRemoveAttr(el, 'v-once');
      if (once != null) {
          el.once = true;
      }
  }
  // handle content being passed to a component as slot,
  // e.g. <template slot="xxx">, <div slot-scope="xxx">
  function processSlotContent(el) {
      var slotScope;
      if (el.tag === 'template') {
          slotScope = getAndRemoveAttr(el, 'scope');
          /* istanbul ignore if */
          if (slotScope) {
              warn("the \"scope\" attribute for scoped slots have been deprecated and " +
                  "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
                  "can also be used on plain elements in addition to <template> to " +
                  "denote scoped slots.", el.rawAttrsMap['scope'], true);
          }
          el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
      }
      else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
          /* istanbul ignore if */
          if (el.attrsMap['v-for']) {
              warn("Ambiguous combined usage of slot-scope and v-for on <".concat(el.tag, "> ") +
                  "(v-for takes higher priority). Use a wrapper <template> for the " +
                  "scoped slot to make it clearer.", el.rawAttrsMap['slot-scope'], true);
          }
          el.slotScope = slotScope;
      }
      // slot="xxx"
      var slotTarget = getBindingAttr(el, 'slot');
      if (slotTarget) {
          el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
          el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
          // preserve slot as an attribute for native shadow DOM compat
          // only for non-scoped slots.
          if (el.tag !== 'template' && !el.slotScope) {
              addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
          }
      }
      // 2.6 v-slot syntax
      {
          if (el.tag === 'template') {
              // v-slot on <template>
              var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
              if (slotBinding) {
                  {
                      if (el.slotTarget || el.slotScope) {
                          warn("Unexpected mixed usage of different slot syntaxes.", el);
                      }
                      if (el.parent && !maybeComponent(el.parent)) {
                          warn("<template v-slot> can only appear at the root level inside " +
                              "the receiving component", el);
                      }
                  }
                  var _a = getSlotName(slotBinding), name_2 = _a.name, dynamic = _a.dynamic;
                  el.slotTarget = name_2;
                  el.slotTargetDynamic = dynamic;
                  el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
              }
          }
          else {
              // v-slot on component, denotes default slot
              var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
              if (slotBinding) {
                  {
                      if (!maybeComponent(el)) {
                          warn("v-slot can only be used on components or <template>.", slotBinding);
                      }
                      if (el.slotScope || el.slotTarget) {
                          warn("Unexpected mixed usage of different slot syntaxes.", el);
                      }
                      if (el.scopedSlots) {
                          warn("To avoid scope ambiguity, the default slot should also use " +
                              "<template> syntax when there are other named slots.", slotBinding);
                      }
                  }
                  // add the component's children to its default slot
                  var slots = el.scopedSlots || (el.scopedSlots = {});
                  var _b = getSlotName(slotBinding), name_3 = _b.name, dynamic = _b.dynamic;
                  var slotContainer_1 = (slots[name_3] = createASTElement('template', [], el));
                  slotContainer_1.slotTarget = name_3;
                  slotContainer_1.slotTargetDynamic = dynamic;
                  slotContainer_1.children = el.children.filter(function (c) {
                      if (!c.slotScope) {
                          c.parent = slotContainer_1;
                          return true;
                      }
                  });
                  slotContainer_1.slotScope = slotBinding.value || emptySlotScopeToken;
                  // remove children as they are returned from scopedSlots now
                  el.children = [];
                  // mark el non-plain so data gets generated
                  el.plain = false;
              }
          }
      }
  }
  function getSlotName(binding) {
      var name = binding.name.replace(slotRE, '');
      if (!name) {
          if (binding.name[0] !== '#') {
              name = 'default';
          }
          else {
              warn("v-slot shorthand syntax requires a slot name.", binding);
          }
      }
      return dynamicArgRE.test(name)
          ? // dynamic [name]
              { name: name.slice(1, -1), dynamic: true }
          : // static name
              { name: "\"".concat(name, "\""), dynamic: false };
  }
  // handle <slot/> outlets
  function processSlotOutlet(el) {
      if (el.tag === 'slot') {
          el.slotName = getBindingAttr(el, 'name');
          if (el.key) {
              warn("`key` does not work on <slot> because slots are abstract outlets " +
                  "and can possibly expand into multiple elements. " +
                  "Use the key on a wrapping element instead.", getRawBindingAttr(el, 'key'));
          }
      }
  }
  function processComponent(el) {
      var binding;
      if ((binding = getBindingAttr(el, 'is'))) {
          el.component = binding;
      }
      if (getAndRemoveAttr(el, 'inline-template') != null) {
          el.inlineTemplate = true;
      }
  }
  function processAttrs(el) {
      var list = el.attrsList;
      var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
      for (i = 0, l = list.length; i < l; i++) {
          name = rawName = list[i].name;
          value = list[i].value;
          if (dirRE.test(name)) {
              // mark element as dynamic
              el.hasBindings = true;
              // modifiers
              modifiers = parseModifiers(name.replace(dirRE, ''));
              // support .foo shorthand syntax for the .prop modifier
              if (modifiers) {
                  name = name.replace(modifierRE, '');
              }
              if (bindRE.test(name)) {
                  // v-bind
                  name = name.replace(bindRE, '');
                  value = parseFilters(value);
                  isDynamic = dynamicArgRE.test(name);
                  if (isDynamic) {
                      name = name.slice(1, -1);
                  }
                  if (value.trim().length === 0) {
                      warn("The value for a v-bind expression cannot be empty. Found in \"v-bind:".concat(name, "\""));
                  }
                  if (modifiers) {
                      if (modifiers.prop && !isDynamic) {
                          name = camelize(name);
                          if (name === 'innerHtml')
                              name = 'innerHTML';
                      }
                      if (modifiers.camel && !isDynamic) {
                          name = camelize(name);
                      }
                      if (modifiers.sync) {
                          syncGen = genAssignmentCode(value, "$event");
                          if (!isDynamic) {
                              addHandler(el, "update:".concat(camelize(name)), syncGen, null, false, warn, list[i]);
                              if (hyphenate(name) !== camelize(name)) {
                                  addHandler(el, "update:".concat(hyphenate(name)), syncGen, null, false, warn, list[i]);
                              }
                          }
                          else {
                              // handler w/ dynamic event name
                              addHandler(el, "\"update:\"+(".concat(name, ")"), syncGen, null, false, warn, list[i], true // dynamic
                              );
                          }
                      }
                  }
                  if ((modifiers && modifiers.prop) ||
                      (!el.component && platformMustUseProp(el.tag, el.attrsMap.type, name))) {
                      addProp(el, name, value, list[i], isDynamic);
                  }
                  else {
                      addAttr(el, name, value, list[i], isDynamic);
                  }
              }
              else if (onRE.test(name)) {
                  // v-on
                  name = name.replace(onRE, '');
                  isDynamic = dynamicArgRE.test(name);
                  if (isDynamic) {
                      name = name.slice(1, -1);
                  }
                  addHandler(el, name, value, modifiers, false, warn, list[i], isDynamic);
              }
              else {
                  // normal directives
                  name = name.replace(dirRE, '');
                  // parse arg
                  var argMatch = name.match(argRE);
                  var arg = argMatch && argMatch[1];
                  isDynamic = false;
                  if (arg) {
                      name = name.slice(0, -(arg.length + 1));
                      if (dynamicArgRE.test(arg)) {
                          arg = arg.slice(1, -1);
                          isDynamic = true;
                      }
                  }
                  addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
                  if (name === 'model') {
                      checkForAliasModel(el, value);
                  }
              }
          }
          else {
              // literal attribute
              {
                  var res = parseText(value, delimiters);
                  if (res) {
                      warn("".concat(name, "=\"").concat(value, "\": ") +
                          'Interpolation inside attributes has been removed. ' +
                          'Use v-bind or the colon shorthand instead. For example, ' +
                          'instead of <div id="{{ val }}">, use <div :id="val">.', list[i]);
                  }
              }
              addAttr(el, name, JSON.stringify(value), list[i]);
              // #6887 firefox doesn't update muted state if set via attribute
              // even immediately after element creation
              if (!el.component &&
                  name === 'muted' &&
                  platformMustUseProp(el.tag, el.attrsMap.type, name)) {
                  addProp(el, name, 'true', list[i]);
              }
          }
      }
  }
  function checkInFor(el) {
      var parent = el;
      while (parent) {
          if (parent.for !== undefined) {
              return true;
          }
          parent = parent.parent;
      }
      return false;
  }
  function parseModifiers(name) {
      var match = name.match(modifierRE);
      if (match) {
          var ret_1 = {};
          match.forEach(function (m) {
              ret_1[m.slice(1)] = true;
          });
          return ret_1;
      }
  }
  function makeAttrsMap(attrs) {
      var map = {};
      for (var i = 0, l = attrs.length; i < l; i++) {
          if (map[attrs[i].name] && !isIE && !isEdge) {
              warn('duplicate attribute: ' + attrs[i].name, attrs[i]);
          }
          map[attrs[i].name] = attrs[i].value;
      }
      return map;
  }
  // for script (e.g. type="x/template") or style, do not decode content
  function isTextTag(el) {
      return el.tag === 'script' || el.tag === 'style';
  }
  function isForbiddenTag(el) {
      return (el.tag === 'style' ||
          (el.tag === 'script' &&
              (!el.attrsMap.type || el.attrsMap.type === 'text/javascript')));
  }
  var ieNSBug = /^xmlns:NS\d+/;
  var ieNSPrefix = /^NS\d+:/;
  /* istanbul ignore next */
  function guardIESVGBug(attrs) {
      var res = [];
      for (var i = 0; i < attrs.length; i++) {
          var attr = attrs[i];
          if (!ieNSBug.test(attr.name)) {
              attr.name = attr.name.replace(ieNSPrefix, '');
              res.push(attr);
          }
      }
      return res;
  }
  function checkForAliasModel(el, value) {
      var _el = el;
      while (_el) {
          if (_el.for && _el.alias === value) {
              warn("<".concat(el.tag, " v-model=\"").concat(value, "\">: ") +
                  "You are binding v-model directly to a v-for iteration alias. " +
                  "This will not be able to modify the v-for source array because " +
                  "writing to the alias is like modifying a function local variable. " +
                  "Consider using an array of objects and use v-model on an object property instead.", el.rawAttrsMap['v-model']);
          }
          _el = _el.parent;
      }
  }

  /**
   * Expand input[v-model] with dynamic type bindings into v-if-else chains
   * Turn this:
   *   <input v-model="data[type]" :type="type">
   * into this:
   *   <input v-if="type === 'checkbox'" type="checkbox" v-model="data[type]">
   *   <input v-else-if="type === 'radio'" type="radio" v-model="data[type]">
   *   <input v-else :type="type" v-model="data[type]">
   */
  function preTransformNode(el, options) {
      if (el.tag === 'input') {
          var map = el.attrsMap;
          if (!map['v-model']) {
              return;
          }
          var typeBinding = void 0;
          if (map[':type'] || map['v-bind:type']) {
              typeBinding = getBindingAttr(el, 'type');
          }
          if (!map.type && !typeBinding && map['v-bind']) {
              typeBinding = "(".concat(map['v-bind'], ").type");
          }
          if (typeBinding) {
              var ifCondition = getAndRemoveAttr(el, 'v-if', true);
              var ifConditionExtra = ifCondition ? "&&(".concat(ifCondition, ")") : "";
              var hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
              var elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
              // 1. checkbox
              var branch0 = cloneASTElement(el);
              // process for on the main node
              processFor(branch0);
              addRawAttr(branch0, 'type', 'checkbox');
              processElement(branch0, options);
              branch0.processed = true; // prevent it from double-processed
              branch0.if = "(".concat(typeBinding, ")==='checkbox'") + ifConditionExtra;
              addIfCondition(branch0, {
                  exp: branch0.if,
                  block: branch0
              });
              // 2. add radio else-if condition
              var branch1 = cloneASTElement(el);
              getAndRemoveAttr(branch1, 'v-for', true);
              addRawAttr(branch1, 'type', 'radio');
              processElement(branch1, options);
              addIfCondition(branch0, {
                  exp: "(".concat(typeBinding, ")==='radio'") + ifConditionExtra,
                  block: branch1
              });
              // 3. other
              var branch2 = cloneASTElement(el);
              getAndRemoveAttr(branch2, 'v-for', true);
              addRawAttr(branch2, ':type', typeBinding);
              processElement(branch2, options);
              addIfCondition(branch0, {
                  exp: ifCondition,
                  block: branch2
              });
              if (hasElse) {
                  branch0.else = true;
              }
              else if (elseIfCondition) {
                  branch0.elseif = elseIfCondition;
              }
              return branch0;
          }
      }
  }
  function cloneASTElement(el) {
      return createASTElement(el.tag, el.attrsList.slice(), el.parent);
  }
  var model = {
      preTransformNode: preTransformNode
  };

  var modules = [klass, style, model];

  function text(el, dir) {
      if (dir.value) {
          addProp(el, 'textContent', "_s(".concat(dir.value, ")"), dir);
      }
  }

  function html(el, dir) {
      if (dir.value) {
          addProp(el, 'innerHTML', "_s(".concat(dir.value, ")"), dir);
      }
  }

  var directives = {
      model: model$1,
      text: text,
      html: html
  };

  var baseOptions = {
      expectHTML: true,
      modules: modules,
      directives: directives,
      isPreTag: isPreTag,
      isUnaryTag: isUnaryTag,
      mustUseProp: mustUseProp,
      canBeLeftOpenTag: canBeLeftOpenTag,
      isReservedTag: isReservedTag,
      getTagNamespace: getTagNamespace,
      staticKeys: genStaticKeys$1(modules)
  };

  var isStaticKey;
  var isPlatformReservedTag;
  var genStaticKeysCached = cached(genStaticKeys);
  /**
   * Goal of the optimizer: walk the generated template AST tree
   * and detect sub-trees that are purely static, i.e. parts of
   * the DOM that never needs to change.
   *
   * Once we detect these sub-trees, we can:
   *
   * 1. Hoist them into constants, so that we no longer need to
   *    create fresh nodes for them on each re-render;
   * 2. Completely skip them in the patching process.
   */
  function optimize(root, options) {
      if (!root)
          return;
      isStaticKey = genStaticKeysCached(options.staticKeys || '');
      isPlatformReservedTag = options.isReservedTag || no;
      // first pass: mark all non-static nodes.
      markStatic(root);
      // second pass: mark static roots.
      markStaticRoots(root, false);
  }
  function genStaticKeys(keys) {
      return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
          (keys ? ',' + keys : ''));
  }
  function markStatic(node) {
      node.static = isStatic(node);
      if (node.type === 1) {
          // do not make component slot content static. this avoids
          // 1. components not able to mutate slot nodes
          // 2. static slot content fails for hot-reloading
          if (!isPlatformReservedTag(node.tag) &&
              node.tag !== 'slot' &&
              node.attrsMap['inline-template'] == null) {
              return;
          }
          for (var i = 0, l = node.children.length; i < l; i++) {
              var child = node.children[i];
              markStatic(child);
              if (!child.static) {
                  node.static = false;
              }
          }
          if (node.ifConditions) {
              for (var i = 1, l = node.ifConditions.length; i < l; i++) {
                  var block = node.ifConditions[i].block;
                  markStatic(block);
                  if (!block.static) {
                      node.static = false;
                  }
              }
          }
      }
  }
  function markStaticRoots(node, isInFor) {
      if (node.type === 1) {
          if (node.static || node.once) {
              node.staticInFor = isInFor;
          }
          // For a node to qualify as a static root, it should have children that
          // are not just static text. Otherwise the cost of hoisting out will
          // outweigh the benefits and it's better off to just always render it fresh.
          if (node.static &&
              node.children.length &&
              !(node.children.length === 1 && node.children[0].type === 3)) {
              node.staticRoot = true;
              return;
          }
          else {
              node.staticRoot = false;
          }
          if (node.children) {
              for (var i = 0, l = node.children.length; i < l; i++) {
                  markStaticRoots(node.children[i], isInFor || !!node.for);
              }
          }
          if (node.ifConditions) {
              for (var i = 1, l = node.ifConditions.length; i < l; i++) {
                  markStaticRoots(node.ifConditions[i].block, isInFor);
              }
          }
      }
  }
  function isStatic(node) {
      if (node.type === 2) {
          // expression
          return false;
      }
      if (node.type === 3) {
          // text
          return true;
      }
      return !!(node.pre ||
          (!node.hasBindings && // no dynamic bindings
              !node.if &&
              !node.for && // not v-if or v-for or v-else
              !isBuiltInTag(node.tag) && // not a built-in
              isPlatformReservedTag(node.tag) && // not a component
              !isDirectChildOfTemplateFor(node) &&
              Object.keys(node).every(isStaticKey)));
  }
  function isDirectChildOfTemplateFor(node) {
      while (node.parent) {
          node = node.parent;
          if (node.tag !== 'template') {
              return false;
          }
          if (node.for) {
              return true;
          }
      }
      return false;
  }

  var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
  var fnInvokeRE = /\([^)]*?\);*$/;
  var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;
  // KeyboardEvent.keyCode aliases
  var keyCodes = {
      esc: 27,
      tab: 9,
      enter: 13,
      space: 32,
      up: 38,
      left: 37,
      right: 39,
      down: 40,
      delete: [8, 46]
  };
  // KeyboardEvent.key aliases
  var keyNames = {
      // #7880: IE11 and Edge use `Esc` for Escape key name.
      esc: ['Esc', 'Escape'],
      tab: 'Tab',
      enter: 'Enter',
      // #9112: IE11 uses `Spacebar` for Space key name.
      space: [' ', 'Spacebar'],
      // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
      up: ['Up', 'ArrowUp'],
      left: ['Left', 'ArrowLeft'],
      right: ['Right', 'ArrowRight'],
      down: ['Down', 'ArrowDown'],
      // #9112: IE11 uses `Del` for Delete key name.
      delete: ['Backspace', 'Delete', 'Del']
  };
  // #4868: modifiers that prevent the execution of the listener
  // need to explicitly return null so that we can determine whether to remove
  // the listener for .once
  var genGuard = function (condition) { return "if(".concat(condition, ")return null;"); };
  var modifierCode = {
      stop: '$event.stopPropagation();',
      prevent: '$event.preventDefault();',
      self: genGuard("$event.target !== $event.currentTarget"),
      ctrl: genGuard("!$event.ctrlKey"),
      shift: genGuard("!$event.shiftKey"),
      alt: genGuard("!$event.altKey"),
      meta: genGuard("!$event.metaKey"),
      left: genGuard("'button' in $event && $event.button !== 0"),
      middle: genGuard("'button' in $event && $event.button !== 1"),
      right: genGuard("'button' in $event && $event.button !== 2")
  };
  function genHandlers(events, isNative) {
      var prefix = isNative ? 'nativeOn:' : 'on:';
      var staticHandlers = "";
      var dynamicHandlers = "";
      for (var name_1 in events) {
          var handlerCode = genHandler(events[name_1]);
          //@ts-expect-error
          if (events[name_1] && events[name_1].dynamic) {
              dynamicHandlers += "".concat(name_1, ",").concat(handlerCode, ",");
          }
          else {
              staticHandlers += "\"".concat(name_1, "\":").concat(handlerCode, ",");
          }
      }
      staticHandlers = "{".concat(staticHandlers.slice(0, -1), "}");
      if (dynamicHandlers) {
          return prefix + "_d(".concat(staticHandlers, ",[").concat(dynamicHandlers.slice(0, -1), "])");
      }
      else {
          return prefix + staticHandlers;
      }
  }
  function genHandler(handler) {
      if (!handler) {
          return 'function(){}';
      }
      if (Array.isArray(handler)) {
          return "[".concat(handler.map(function (handler) { return genHandler(handler); }).join(','), "]");
      }
      var isMethodPath = simplePathRE.test(handler.value);
      var isFunctionExpression = fnExpRE.test(handler.value);
      var isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));
      if (!handler.modifiers) {
          if (isMethodPath || isFunctionExpression) {
              return handler.value;
          }
          return "function($event){".concat(isFunctionInvocation ? "return ".concat(handler.value) : handler.value, "}"); // inline statement
      }
      else {
          var code = '';
          var genModifierCode = '';
          var keys = [];
          var _loop_1 = function (key) {
              if (modifierCode[key]) {
                  genModifierCode += modifierCode[key];
                  // left/right
                  if (keyCodes[key]) {
                      keys.push(key);
                  }
              }
              else if (key === 'exact') {
                  var modifiers_1 = handler.modifiers;
                  genModifierCode += genGuard(['ctrl', 'shift', 'alt', 'meta']
                      .filter(function (keyModifier) { return !modifiers_1[keyModifier]; })
                      .map(function (keyModifier) { return "$event.".concat(keyModifier, "Key"); })
                      .join('||'));
              }
              else {
                  keys.push(key);
              }
          };
          for (var key in handler.modifiers) {
              _loop_1(key);
          }
          if (keys.length) {
              code += genKeyFilter(keys);
          }
          // Make sure modifiers like prevent and stop get executed after key filtering
          if (genModifierCode) {
              code += genModifierCode;
          }
          var handlerCode = isMethodPath
              ? "return ".concat(handler.value, ".apply(null, arguments)")
              : isFunctionExpression
                  ? "return (".concat(handler.value, ").apply(null, arguments)")
                  : isFunctionInvocation
                      ? "return ".concat(handler.value)
                      : handler.value;
          return "function($event){".concat(code).concat(handlerCode, "}");
      }
  }
  function genKeyFilter(keys) {
      return (
      // make sure the key filters only apply to KeyboardEvents
      // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
      // key events that do not have keyCode property...
      "if(!$event.type.indexOf('key')&&" +
          "".concat(keys.map(genFilterCode).join('&&'), ")return null;"));
  }
  function genFilterCode(key) {
      var keyVal = parseInt(key, 10);
      if (keyVal) {
          return "$event.keyCode!==".concat(keyVal);
      }
      var keyCode = keyCodes[key];
      var keyName = keyNames[key];
      return ("_k($event.keyCode," +
          "".concat(JSON.stringify(key), ",") +
          "".concat(JSON.stringify(keyCode), ",") +
          "$event.key," +
          "".concat(JSON.stringify(keyName)) +
          ")");
  }

  function on(el, dir) {
      if (dir.modifiers) {
          warn$2("v-on without argument does not support modifiers.");
      }
      el.wrapListeners = function (code) { return "_g(".concat(code, ",").concat(dir.value, ")"); };
  }

  function bind(el, dir) {
      el.wrapData = function (code) {
          return "_b(".concat(code, ",'").concat(el.tag, "',").concat(dir.value, ",").concat(dir.modifiers && dir.modifiers.prop ? 'true' : 'false').concat(dir.modifiers && dir.modifiers.sync ? ',true' : '', ")");
      };
  }

  var baseDirectives = {
      on: on,
      bind: bind,
      cloak: noop$1
  };

  var CodegenState = /** @class */ (function () {
      function CodegenState(options) {
          this.options = options;
          this.warn = options.warn || baseWarn;
          this.transforms = pluckModuleFunction(options.modules, 'transformCode');
          this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
          this.directives = extend$1(extend$1({}, baseDirectives), options.directives);
          var isReservedTag = options.isReservedTag || no;
          this.maybeComponent = function (el) {
              return !!el.component || !isReservedTag(el.tag);
          };
          this.onceId = 0;
          this.staticRenderFns = [];
          this.pre = false;
      }
      return CodegenState;
  }());
  function generate(ast, options) {
      var state = new CodegenState(options);
      // fix #11483, Root level <script> tags should not be rendered.
      var code = ast
          ? ast.tag === 'script'
              ? 'null'
              : genElement(ast, state)
          : '_c("div")';
      return {
          render: "with(this){return ".concat(code, "}"),
          staticRenderFns: state.staticRenderFns
      };
  }
  function genElement(el, state) {
      if (el.parent) {
          el.pre = el.pre || el.parent.pre;
      }
      if (el.staticRoot && !el.staticProcessed) {
          return genStatic(el, state);
      }
      else if (el.once && !el.onceProcessed) {
          return genOnce(el, state);
      }
      else if (el.for && !el.forProcessed) {
          return genFor(el, state);
      }
      else if (el.if && !el.ifProcessed) {
          return genIf(el, state);
      }
      else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
          return genChildren(el, state) || 'void 0';
      }
      else if (el.tag === 'slot') {
          return genSlot(el, state);
      }
      else {
          // component or element
          var code = void 0;
          if (el.component) {
              code = genComponent(el.component, el, state);
          }
          else {
              var data = void 0;
              var maybeComponent = state.maybeComponent(el);
              if (!el.plain || (el.pre && maybeComponent)) {
                  data = genData(el, state);
              }
              var tag 
              // check if this is a component in <script setup>
              = void 0;
              // check if this is a component in <script setup>
              var bindings = state.options.bindings;
              if (maybeComponent && bindings && bindings.__isScriptSetup !== false) {
                  tag = checkBindingType(bindings, el.tag);
              }
              if (!tag)
                  tag = "'".concat(el.tag, "'");
              var children = el.inlineTemplate ? null : genChildren(el, state, true);
              code = "_c(".concat(tag).concat(data ? ",".concat(data) : '' // data
              ).concat(children ? ",".concat(children) : '' // children
              , ")");
          }
          // module transforms
          for (var i = 0; i < state.transforms.length; i++) {
              code = state.transforms[i](el, code);
          }
          return code;
      }
  }
  function checkBindingType(bindings, key) {
      var camelName = camelize(key);
      var PascalName = capitalize(camelName);
      var checkType = function (type) {
          if (bindings[key] === type) {
              return key;
          }
          if (bindings[camelName] === type) {
              return camelName;
          }
          if (bindings[PascalName] === type) {
              return PascalName;
          }
      };
      var fromConst = checkType("setup-const" /* BindingTypes.SETUP_CONST */) ||
          checkType("setup-reactive-const" /* BindingTypes.SETUP_REACTIVE_CONST */);
      if (fromConst) {
          return fromConst;
      }
      var fromMaybeRef = checkType("setup-let" /* BindingTypes.SETUP_LET */) ||
          checkType("setup-ref" /* BindingTypes.SETUP_REF */) ||
          checkType("setup-maybe-ref" /* BindingTypes.SETUP_MAYBE_REF */);
      if (fromMaybeRef) {
          return fromMaybeRef;
      }
  }
  // hoist static sub-trees out
  function genStatic(el, state) {
      el.staticProcessed = true;
      // Some elements (templates) need to behave differently inside of a v-pre
      // node.  All pre nodes are static roots, so we can use this as a location to
      // wrap a state change and reset it upon exiting the pre node.
      var originalPreState = state.pre;
      if (el.pre) {
          state.pre = el.pre;
      }
      state.staticRenderFns.push("with(this){return ".concat(genElement(el, state), "}"));
      state.pre = originalPreState;
      return "_m(".concat(state.staticRenderFns.length - 1).concat(el.staticInFor ? ',true' : '', ")");
  }
  // v-once
  function genOnce(el, state) {
      el.onceProcessed = true;
      if (el.if && !el.ifProcessed) {
          return genIf(el, state);
      }
      else if (el.staticInFor) {
          var key = '';
          var parent_1 = el.parent;
          while (parent_1) {
              if (parent_1.for) {
                  key = parent_1.key;
                  break;
              }
              parent_1 = parent_1.parent;
          }
          if (!key) {
              state.warn("v-once can only be used inside v-for that is keyed. ", el.rawAttrsMap['v-once']);
              return genElement(el, state);
          }
          return "_o(".concat(genElement(el, state), ",").concat(state.onceId++, ",").concat(key, ")");
      }
      else {
          return genStatic(el, state);
      }
  }
  function genIf(el, state, altGen, altEmpty) {
      el.ifProcessed = true; // avoid recursion
      return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty);
  }
  function genIfConditions(conditions, state, altGen, altEmpty) {
      if (!conditions.length) {
          return altEmpty || '_e()';
      }
      var condition = conditions.shift();
      if (condition.exp) {
          return "(".concat(condition.exp, ")?").concat(genTernaryExp(condition.block), ":").concat(genIfConditions(conditions, state, altGen, altEmpty));
      }
      else {
          return "".concat(genTernaryExp(condition.block));
      }
      // v-if with v-once should generate code like (a)?_m(0):_m(1)
      function genTernaryExp(el) {
          return altGen
              ? altGen(el, state)
              : el.once
                  ? genOnce(el, state)
                  : genElement(el, state);
      }
  }
  function genFor(el, state, altGen, altHelper) {
      var exp = el.for;
      var alias = el.alias;
      var iterator1 = el.iterator1 ? ",".concat(el.iterator1) : '';
      var iterator2 = el.iterator2 ? ",".concat(el.iterator2) : '';
      if (state.maybeComponent(el) &&
          el.tag !== 'slot' &&
          el.tag !== 'template' &&
          !el.key) {
          state.warn("<".concat(el.tag, " v-for=\"").concat(alias, " in ").concat(exp, "\">: component lists rendered with ") +
              "v-for should have explicit keys. " +
              "See https://v2.vuejs.org/v2/guide/list.html#key for more info.", el.rawAttrsMap['v-for'], true /* tip */);
      }
      el.forProcessed = true; // avoid recursion
      return ("".concat(altHelper || '_l', "((").concat(exp, "),") +
          "function(".concat(alias).concat(iterator1).concat(iterator2, "){") +
          "return ".concat((altGen || genElement)(el, state)) +
          '})');
  }
  function genData(el, state) {
      var data = '{';
      // directives first.
      // directives may mutate the el's other properties before they are generated.
      var dirs = genDirectives(el, state);
      if (dirs)
          data += dirs + ',';
      // key
      if (el.key) {
          data += "key:".concat(el.key, ",");
      }
      // ref
      if (el.ref) {
          data += "ref:".concat(el.ref, ",");
      }
      if (el.refInFor) {
          data += "refInFor:true,";
      }
      // pre
      if (el.pre) {
          data += "pre:true,";
      }
      // record original tag name for components using "is" attribute
      if (el.component) {
          data += "tag:\"".concat(el.tag, "\",");
      }
      // module data generation functions
      for (var i = 0; i < state.dataGenFns.length; i++) {
          data += state.dataGenFns[i](el);
      }
      // attributes
      if (el.attrs) {
          data += "attrs:".concat(genProps(el.attrs), ",");
      }
      // DOM props
      if (el.props) {
          data += "domProps:".concat(genProps(el.props), ",");
      }
      // event handlers
      if (el.events) {
          data += "".concat(genHandlers(el.events, false), ",");
      }
      if (el.nativeEvents) {
          data += "".concat(genHandlers(el.nativeEvents, true), ",");
      }
      // slot target
      // only for non-scoped slots
      if (el.slotTarget && !el.slotScope) {
          data += "slot:".concat(el.slotTarget, ",");
      }
      // scoped slots
      if (el.scopedSlots) {
          data += "".concat(genScopedSlots(el, el.scopedSlots, state), ",");
      }
      // component v-model
      if (el.model) {
          data += "model:{value:".concat(el.model.value, ",callback:").concat(el.model.callback, ",expression:").concat(el.model.expression, "},");
      }
      // inline-template
      if (el.inlineTemplate) {
          var inlineTemplate = genInlineTemplate(el, state);
          if (inlineTemplate) {
              data += "".concat(inlineTemplate, ",");
          }
      }
      data = data.replace(/,$/, '') + '}';
      // v-bind dynamic argument wrap
      // v-bind with dynamic arguments must be applied using the same v-bind object
      // merge helper so that class/style/mustUseProp attrs are handled correctly.
      if (el.dynamicAttrs) {
          data = "_b(".concat(data, ",\"").concat(el.tag, "\",").concat(genProps(el.dynamicAttrs), ")");
      }
      // v-bind data wrap
      if (el.wrapData) {
          data = el.wrapData(data);
      }
      // v-on data wrap
      if (el.wrapListeners) {
          data = el.wrapListeners(data);
      }
      return data;
  }
  function genDirectives(el, state) {
      var dirs = el.directives;
      if (!dirs)
          return;
      var res = 'directives:[';
      var hasRuntime = false;
      var i, l, dir, needRuntime;
      for (i = 0, l = dirs.length; i < l; i++) {
          dir = dirs[i];
          needRuntime = true;
          var gen = state.directives[dir.name];
          if (gen) {
              // compile-time directive that manipulates AST.
              // returns true if it also needs a runtime counterpart.
              needRuntime = !!gen(el, dir, state.warn);
          }
          if (needRuntime) {
              hasRuntime = true;
              res += "{name:\"".concat(dir.name, "\",rawName:\"").concat(dir.rawName, "\"").concat(dir.value
                  ? ",value:(".concat(dir.value, "),expression:").concat(JSON.stringify(dir.value))
                  : '').concat(dir.arg ? ",arg:".concat(dir.isDynamicArg ? dir.arg : "\"".concat(dir.arg, "\"")) : '').concat(dir.modifiers ? ",modifiers:".concat(JSON.stringify(dir.modifiers)) : '', "},");
          }
      }
      if (hasRuntime) {
          return res.slice(0, -1) + ']';
      }
  }
  function genInlineTemplate(el, state) {
      var ast = el.children[0];
      if ((el.children.length !== 1 || ast.type !== 1)) {
          state.warn('Inline-template components must have exactly one child element.', { start: el.start });
      }
      if (ast && ast.type === 1) {
          var inlineRenderFns = generate(ast, state.options);
          return "inlineTemplate:{render:function(){".concat(inlineRenderFns.render, "},staticRenderFns:[").concat(inlineRenderFns.staticRenderFns
              .map(function (code) { return "function(){".concat(code, "}"); })
              .join(','), "]}");
      }
  }
  function genScopedSlots(el, slots, state) {
      // by default scoped slots are considered "stable", this allows child
      // components with only scoped slots to skip forced updates from parent.
      // but in some cases we have to bail-out of this optimization
      // for example if the slot contains dynamic names, has v-if or v-for on them...
      var needsForceUpdate = el.for ||
          Object.keys(slots).some(function (key) {
              var slot = slots[key];
              return (slot.slotTargetDynamic || slot.if || slot.for || containsSlotChild(slot) // is passing down slot from parent which may be dynamic
              );
          });
      // #9534: if a component with scoped slots is inside a conditional branch,
      // it's possible for the same component to be reused but with different
      // compiled slot content. To avoid that, we generate a unique key based on
      // the generated code of all the slot contents.
      var needsKey = !!el.if;
      // OR when it is inside another scoped slot or v-for (the reactivity may be
      // disconnected due to the intermediate scope variable)
      // #9438, #9506
      // TODO: this can be further optimized by properly analyzing in-scope bindings
      // and skip force updating ones that do not actually use scope variables.
      if (!needsForceUpdate) {
          var parent_2 = el.parent;
          while (parent_2) {
              if ((parent_2.slotScope && parent_2.slotScope !== emptySlotScopeToken) ||
                  parent_2.for) {
                  needsForceUpdate = true;
                  break;
              }
              if (parent_2.if) {
                  needsKey = true;
              }
              parent_2 = parent_2.parent;
          }
      }
      var generatedSlots = Object.keys(slots)
          .map(function (key) { return genScopedSlot(slots[key], state); })
          .join(',');
      return "scopedSlots:_u([".concat(generatedSlots, "]").concat(needsForceUpdate ? ",null,true" : "").concat(!needsForceUpdate && needsKey ? ",null,false,".concat(hash(generatedSlots)) : "", ")");
  }
  function hash(str) {
      var hash = 5381;
      var i = str.length;
      while (i) {
          hash = (hash * 33) ^ str.charCodeAt(--i);
      }
      return hash >>> 0;
  }
  function containsSlotChild(el) {
      if (el.type === 1) {
          if (el.tag === 'slot') {
              return true;
          }
          return el.children.some(containsSlotChild);
      }
      return false;
  }
  function genScopedSlot(el, state) {
      var isLegacySyntax = el.attrsMap['slot-scope'];
      if (el.if && !el.ifProcessed && !isLegacySyntax) {
          return genIf(el, state, genScopedSlot, "null");
      }
      if (el.for && !el.forProcessed) {
          return genFor(el, state, genScopedSlot);
      }
      var slotScope = el.slotScope === emptySlotScopeToken ? "" : String(el.slotScope);
      var fn = "function(".concat(slotScope, "){") +
          "return ".concat(el.tag === 'template'
              ? el.if && isLegacySyntax
                  ? "(".concat(el.if, ")?").concat(genChildren(el, state) || 'undefined', ":undefined")
                  : genChildren(el, state) || 'undefined'
              : genElement(el, state), "}");
      // reverse proxy v-slot without scope on this.$slots
      var reverseProxy = slotScope ? "" : ",proxy:true";
      return "{key:".concat(el.slotTarget || "\"default\"", ",fn:").concat(fn).concat(reverseProxy, "}");
  }
  function genChildren(el, state, checkSkip, altGenElement, altGenNode) {
      var children = el.children;
      if (children.length) {
          var el_1 = children[0];
          // optimize single v-for
          if (children.length === 1 &&
              el_1.for &&
              el_1.tag !== 'template' &&
              el_1.tag !== 'slot') {
              var normalizationType_1 = checkSkip
                  ? state.maybeComponent(el_1)
                      ? ",1"
                      : ",0"
                  : "";
              return "".concat((altGenElement || genElement)(el_1, state)).concat(normalizationType_1);
          }
          var normalizationType = checkSkip
              ? getNormalizationType(children, state.maybeComponent)
              : 0;
          var gen_1 = altGenNode || genNode;
          return "[".concat(children.map(function (c) { return gen_1(c, state); }).join(','), "]").concat(normalizationType ? ",".concat(normalizationType) : '');
      }
  }
  // determine the normalization needed for the children array.
  // 0: no normalization needed
  // 1: simple normalization needed (possible 1-level deep nested array)
  // 2: full normalization needed
  function getNormalizationType(children, maybeComponent) {
      var res = 0;
      for (var i = 0; i < children.length; i++) {
          var el = children[i];
          if (el.type !== 1) {
              continue;
          }
          if (needsNormalization(el) ||
              (el.ifConditions &&
                  el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
              res = 2;
              break;
          }
          if (maybeComponent(el) ||
              (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
              res = 1;
          }
      }
      return res;
  }
  function needsNormalization(el) {
      return el.for !== undefined || el.tag === 'template' || el.tag === 'slot';
  }
  function genNode(node, state) {
      if (node.type === 1) {
          return genElement(node, state);
      }
      else if (node.type === 3 && node.isComment) {
          return genComment(node);
      }
      else {
          return genText(node);
      }
  }
  function genText(text) {
      return "_v(".concat(text.type === 2
          ? text.expression // no need for () because already wrapped in _s()
          : transformSpecialNewlines(JSON.stringify(text.text)), ")");
  }
  function genComment(comment) {
      return "_e(".concat(JSON.stringify(comment.text), ")");
  }
  function genSlot(el, state) {
      var slotName = el.slotName || '"default"';
      var children = genChildren(el, state);
      var res = "_t(".concat(slotName).concat(children ? ",function(){return ".concat(children, "}") : '');
      var attrs = el.attrs || el.dynamicAttrs
          ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) { return ({
              // slot props are camelized
              name: camelize(attr.name),
              value: attr.value,
              dynamic: attr.dynamic
          }); }))
          : null;
      var bind = el.attrsMap['v-bind'];
      if ((attrs || bind) && !children) {
          res += ",null";
      }
      if (attrs) {
          res += ",".concat(attrs);
      }
      if (bind) {
          res += "".concat(attrs ? '' : ',null', ",").concat(bind);
      }
      return res + ')';
  }
  // componentName is el.component, take it as argument to shun flow's pessimistic refinement
  function genComponent(componentName, el, state) {
      var children = el.inlineTemplate ? null : genChildren(el, state, true);
      return "_c(".concat(componentName, ",").concat(genData(el, state)).concat(children ? ",".concat(children) : '', ")");
  }
  function genProps(props) {
      var staticProps = "";
      var dynamicProps = "";
      for (var i = 0; i < props.length; i++) {
          var prop = props[i];
          var value = transformSpecialNewlines(prop.value);
          if (prop.dynamic) {
              dynamicProps += "".concat(prop.name, ",").concat(value, ",");
          }
          else {
              staticProps += "\"".concat(prop.name, "\":").concat(value, ",");
          }
      }
      staticProps = "{".concat(staticProps.slice(0, -1), "}");
      if (dynamicProps) {
          return "_d(".concat(staticProps, ",[").concat(dynamicProps.slice(0, -1), "])");
      }
      else {
          return staticProps;
      }
  }
  // #3895, #4268
  function transformSpecialNewlines(text) {
      return text.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }

  // these keywords should not appear inside expressions, but operators like
  // typeof, instanceof and in are allowed
  var prohibitedKeywordRE = new RegExp('\\b' +
      ('do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
          'super,throw,while,yield,delete,export,import,return,switch,default,' +
          'extends,finally,continue,debugger,function,arguments')
          .split(',')
          .join('\\b|\\b') +
      '\\b');
  // these unary operators should not be used as property/method names
  var unaryOperatorsRE = new RegExp('\\b' +
      'delete,typeof,void'.split(',').join('\\s*\\([^\\)]*\\)|\\b') +
      '\\s*\\([^\\)]*\\)');
  // strip strings in expressions
  var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;
  // detect problematic expressions in a template
  function detectErrors(ast, warn) {
      if (ast) {
          checkNode(ast, warn);
      }
  }
  function checkNode(node, warn) {
      if (node.type === 1) {
          for (var name_1 in node.attrsMap) {
              if (dirRE.test(name_1)) {
                  var value = node.attrsMap[name_1];
                  if (value) {
                      var range = node.rawAttrsMap[name_1];
                      if (name_1 === 'v-for') {
                          checkFor(node, "v-for=\"".concat(value, "\""), warn, range);
                      }
                      else if (name_1 === 'v-slot' || name_1[0] === '#') {
                          checkFunctionParameterExpression(value, "".concat(name_1, "=\"").concat(value, "\""), warn, range);
                      }
                      else if (onRE.test(name_1)) {
                          checkEvent(value, "".concat(name_1, "=\"").concat(value, "\""), warn, range);
                      }
                      else {
                          checkExpression(value, "".concat(name_1, "=\"").concat(value, "\""), warn, range);
                      }
                  }
              }
          }
          if (node.children) {
              for (var i = 0; i < node.children.length; i++) {
                  checkNode(node.children[i], warn);
              }
          }
      }
      else if (node.type === 2) {
          checkExpression(node.expression, node.text, warn, node);
      }
  }
  function checkEvent(exp, text, warn, range) {
      var stripped = exp.replace(stripStringRE, '');
      var keywordMatch = stripped.match(unaryOperatorsRE);
      if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') {
          warn("avoid using JavaScript unary operator as property name: " +
              "\"".concat(keywordMatch[0], "\" in expression ").concat(text.trim()), range);
      }
      checkExpression(exp, text, warn, range);
  }
  function checkFor(node, text, warn, range) {
      checkExpression(node.for || '', text, warn, range);
      checkIdentifier(node.alias, 'v-for alias', text, warn, range);
      checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
      checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
  }
  function checkIdentifier(ident, type, text, warn, range) {
      if (typeof ident === 'string') {
          try {
              new Function("var ".concat(ident, "=_"));
          }
          catch (e) {
              warn("invalid ".concat(type, " \"").concat(ident, "\" in expression: ").concat(text.trim()), range);
          }
      }
  }
  function checkExpression(exp, text, warn, range) {
      try {
          new Function("return ".concat(exp));
      }
      catch (e) {
          var keywordMatch = exp
              .replace(stripStringRE, '')
              .match(prohibitedKeywordRE);
          if (keywordMatch) {
              warn("avoid using JavaScript keyword as property name: " +
                  "\"".concat(keywordMatch[0], "\"\n  Raw expression: ").concat(text.trim()), range);
          }
          else {
              warn("invalid expression: ".concat(e.message, " in\n\n") +
                  "    ".concat(exp, "\n\n") +
                  "  Raw expression: ".concat(text.trim(), "\n"), range);
          }
      }
  }
  function checkFunctionParameterExpression(exp, text, warn, range) {
      try {
          new Function(exp, '');
      }
      catch (e) {
          warn("invalid function parameter expression: ".concat(e.message, " in\n\n") +
              "    ".concat(exp, "\n\n") +
              "  Raw expression: ".concat(text.trim(), "\n"), range);
      }
  }

  var range = 2;
  function generateCodeFrame(source, start, end) {
      if (start === void 0) { start = 0; }
      if (end === void 0) { end = source.length; }
      var lines = source.split(/\r?\n/);
      var count = 0;
      var res = [];
      for (var i = 0; i < lines.length; i++) {
          count += lines[i].length + 1;
          if (count >= start) {
              for (var j = i - range; j <= i + range || end > count; j++) {
                  if (j < 0 || j >= lines.length)
                      continue;
                  res.push("".concat(j + 1).concat(repeat(" ", 3 - String(j + 1).length), "|  ").concat(lines[j]));
                  var lineLength = lines[j].length;
                  if (j === i) {
                      // push underline
                      var pad = start - (count - lineLength) + 1;
                      var length_1 = end > count ? lineLength - pad : end - start;
                      res.push("   |  " + repeat(" ", pad) + repeat("^", length_1));
                  }
                  else if (j > i) {
                      if (end > count) {
                          var length_2 = Math.min(end - count, lineLength);
                          res.push("   |  " + repeat("^", length_2));
                      }
                      count += lineLength + 1;
                  }
              }
              break;
          }
      }
      return res.join('\n');
  }
  function repeat(str, n) {
      var result = '';
      if (n > 0) {
          // eslint-disable-next-line no-constant-condition
          while (true) {
              // eslint-disable-line
              if (n & 1)
                  result += str;
              n >>>= 1;
              if (n <= 0)
                  break;
              str += str;
          }
      }
      return result;
  }

  function createFunction(code, errors) {
      try {
          return new Function(code);
      }
      catch (err) {
          errors.push({ err: err, code: code });
          return noop$1;
      }
  }
  function createCompileToFunctionFn(compile) {
      var cache = Object.create(null);
      return function compileToFunctions(template, options, vm) {
          options = extend$1({}, options);
          var warn = options.warn || warn$2;
          delete options.warn;
          /* istanbul ignore if */
          {
              // detect possible CSP restriction
              try {
                  new Function('return 1');
              }
              catch (e) {
                  if (e.toString().match(/unsafe-eval|CSP/)) {
                      warn('It seems you are using the standalone build of Vue.js in an ' +
                          'environment with Content Security Policy that prohibits unsafe-eval. ' +
                          'The template compiler cannot work in this environment. Consider ' +
                          'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
                          'templates into render functions.');
                  }
              }
          }
          // check cache
          var key = options.delimiters
              ? String(options.delimiters) + template
              : template;
          if (cache[key]) {
              return cache[key];
          }
          // compile
          var compiled = compile(template, options);
          // check compilation errors/tips
          {
              if (compiled.errors && compiled.errors.length) {
                  if (options.outputSourceRange) {
                      compiled.errors.forEach(function (e) {
                          warn("Error compiling template:\n\n".concat(e.msg, "\n\n") +
                              generateCodeFrame(template, e.start, e.end), vm);
                      });
                  }
                  else {
                      warn("Error compiling template:\n\n".concat(template, "\n\n") +
                          compiled.errors.map(function (e) { return "- ".concat(e); }).join('\n') +
                          '\n', vm);
                  }
              }
              if (compiled.tips && compiled.tips.length) {
                  if (options.outputSourceRange) {
                      compiled.tips.forEach(function (e) { return tip(e.msg, vm); });
                  }
                  else {
                      compiled.tips.forEach(function (msg) { return tip(msg, vm); });
                  }
              }
          }
          // turn code into functions
          var res = {};
          var fnGenErrors = [];
          res.render = createFunction(compiled.render, fnGenErrors);
          res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
              return createFunction(code, fnGenErrors);
          });
          // check function generation errors.
          // this should only happen if there is a bug in the compiler itself.
          // mostly for codegen development use
          /* istanbul ignore if */
          {
              if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
                  warn("Failed to generate render function:\n\n" +
                      fnGenErrors
                          .map(function (_a) {
                          var err = _a.err, code = _a.code;
                          return "".concat(err.toString(), " in\n\n").concat(code, "\n");
                      })
                          .join('\n'), vm);
              }
          }
          return (cache[key] = res);
      };
  }

  function createCompilerCreator(baseCompile) {
      return function createCompiler(baseOptions) {
          function compile(template, options) {
              var finalOptions = Object.create(baseOptions);
              var errors = [];
              var tips = [];
              var warn = function (msg, range, tip) {
                  (tip ? tips : errors).push(msg);
              };
              if (options) {
                  if (options.outputSourceRange) {
                      // $flow-disable-line
                      var leadingSpaceLength_1 = template.match(/^\s*/)[0].length;
                      warn = function (msg, range, tip) {
                          var data = typeof msg === 'string' ? { msg: msg } : msg;
                          if (range) {
                              if (range.start != null) {
                                  data.start = range.start + leadingSpaceLength_1;
                              }
                              if (range.end != null) {
                                  data.end = range.end + leadingSpaceLength_1;
                              }
                          }
                          (tip ? tips : errors).push(data);
                      };
                  }
                  // merge custom modules
                  if (options.modules) {
                      finalOptions.modules = (baseOptions.modules || []).concat(options.modules);
                  }
                  // merge custom directives
                  if (options.directives) {
                      finalOptions.directives = extend$1(Object.create(baseOptions.directives || null), options.directives);
                  }
                  // copy other options
                  for (var key in options) {
                      if (key !== 'modules' && key !== 'directives') {
                          finalOptions[key] = options[key];
                      }
                  }
              }
              finalOptions.warn = warn;
              var compiled = baseCompile(template.trim(), finalOptions);
              {
                  detectErrors(compiled.ast, warn);
              }
              compiled.errors = errors;
              compiled.tips = tips;
              return compiled;
          }
          return {
              compile: compile,
              compileToFunctions: createCompileToFunctionFn(compile)
          };
      };
  }

  // `createCompilerCreator` allows creating compilers that use alternative
  // parser/optimizer/codegen, e.g the SSR optimizing compiler.
  // Here we just export a default compiler using the default parts.
  var createCompiler = createCompilerCreator(function baseCompile(template, options) {
      var ast = parse(template.trim(), options);
      if (options.optimize !== false) {
          optimize(ast, options);
      }
      var code = generate(ast, options);
      return {
          ast: ast,
          render: code.render,
          staticRenderFns: code.staticRenderFns
      };
  });

  var _a = createCompiler(baseOptions), compileToFunctions = _a.compileToFunctions;

  // check whether current browser encodes a char inside attribute values
  var div;
  function getShouldDecode(href) {
      div = div || document.createElement('div');
      div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
      return div.innerHTML.indexOf('&#10;') > 0;
  }
  // #3663: IE encodes newlines inside attribute values while other browsers don't
  var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
  // #6828: chrome encodes content in a[href]
  var shouldDecodeNewlinesForHref = inBrowser
      ? getShouldDecode(true)
      : false;

  var idToTemplate = cached(function (id) {
      var el = query(id);
      return el && el.innerHTML;
  });
  var mount = Vue.prototype.$mount;
  Vue.prototype.$mount = function (el, hydrating) {
      el = el && query(el);
      /* istanbul ignore if */
      if (el === document.body || el === document.documentElement) {
          warn$2("Do not mount Vue to <html> or <body> - mount to normal elements instead.");
          return this;
      }
      var options = this.$options;
      // resolve template/el and convert to render function
      if (!options.render) {
          var template = options.template;
          if (template) {
              if (typeof template === 'string') {
                  if (template.charAt(0) === '#') {
                      template = idToTemplate(template);
                      /* istanbul ignore if */
                      if (!template) {
                          warn$2("Template element not found or is empty: ".concat(options.template), this);
                      }
                  }
              }
              else if (template.nodeType) {
                  template = template.innerHTML;
              }
              else {
                  {
                      warn$2('invalid template option:' + template, this);
                  }
                  return this;
              }
          }
          else if (el) {
              // @ts-expect-error
              template = getOuterHTML(el);
          }
          if (template) {
              /* istanbul ignore if */
              if (config.performance && mark) {
                  mark('compile');
              }
              var _a = compileToFunctions(template, {
                  outputSourceRange: true,
                  shouldDecodeNewlines: shouldDecodeNewlines,
                  shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
                  delimiters: options.delimiters,
                  comments: options.comments
              }, this), render = _a.render, staticRenderFns = _a.staticRenderFns;
              options.render = render;
              options.staticRenderFns = staticRenderFns;
              /* istanbul ignore if */
              if (config.performance && mark) {
                  mark('compile end');
                  measure("vue ".concat(this._name, " compile"), 'compile', 'compile end');
              }
          }
      }
      return mount.call(this, el, hydrating);
  };
  /**
   * Get outerHTML of elements, taking care
   * of SVG elements in IE as well.
   */
  function getOuterHTML(el) {
      if (el.outerHTML) {
          return el.outerHTML;
      }
      else {
          var container = document.createElement('div');
          container.appendChild(el.cloneNode(true));
          return container.innerHTML;
      }
  }
  Vue.compile = compileToFunctions;

  // export type EffectScheduler = (...args: any[]) => any
  /**
   * @internal since we are not exposing this in Vue 2, it's used only for
   * internal testing.
   */
  function effect(fn, scheduler) {
      var watcher = new Watcher(currentInstance, fn, noop$1, {
          sync: true
      });
      if (scheduler) {
          watcher.update = function () {
              scheduler(function () { return watcher.run(); });
          };
      }
  }

  extend$1(Vue, vca);
  Vue.effect = effect;

  return Vue;

}));
