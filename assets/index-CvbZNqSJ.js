var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __publicField = (obj, key2, value) => __defNormalProp(obj, typeof key2 !== "symbol" ? key2 + "" : key2, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _a, _commit_callbacks, _discard_callbacks, _fork_commit_callbacks, _pending, _blocking_pending, _deferred, _roots, _new_effects, _dirty_effects, _maybe_dirty_effects, _skipped_branches, _unskipped_branches, _decrement_queued, _blockers, _Batch_instances, is_deferred_fn, is_blocked_fn, process_fn, traverse_fn, defer_effects_fn, commit_fn, _anchor, _hydrate_open, _props, _children, _effect, _main_effect, _pending_effect, _failed_effect, _offscreen_fragment, _local_pending_count, _pending_count, _pending_count_update_queued, _dirty_effects2, _maybe_dirty_effects2, _effect_pending, _effect_pending_subscriber, _Boundary_instances, hydrate_resolved_content_fn, hydrate_failed_content_fn, hydrate_pending_content_fn, render_fn, resolve_fn, run_fn, update_pending_count_fn, handle_error_fn, _b, _batches, _onscreen, _offscreen, _outroing, _transition, _commit, _discard, _c, __, __2, __22, __3;
function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k in e) {
        if (k !== "default" && !(k in n)) {
          const d = Object.getOwnPropertyDescriptor(e, k);
          if (d) {
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: () => e[k]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
}
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link2 of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link2);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link2) {
    const fetchOpts = {};
    if (link2.integrity) fetchOpts.integrity = link2.integrity;
    if (link2.referrerPolicy) fetchOpts.referrerPolicy = link2.referrerPolicy;
    if (link2.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link2.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link2) {
    if (link2.ep)
      return;
    link2.ep = true;
    const fetchOpts = getFetchOpts(link2);
    fetch(link2.href, fetchOpts);
  }
})();
const DEV = false;
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
function is_function(thing) {
  return typeof thing === "function";
}
const noop = () => {
};
function run(fn) {
  return fn();
}
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]();
  }
}
function deferred() {
  var resolve;
  var reject;
  var promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
function to_array(value, n) {
  if (Array.isArray(value)) {
    return value;
  }
  if (!(Symbol.iterator in value)) {
    return Array.from(value);
  }
  const array = [];
  for (const element2 of value) {
    array.push(element2);
    if (array.length === n) break;
  }
  return array;
}
const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const RENDER_EFFECT = 1 << 3;
const MANAGED_EFFECT = 1 << 24;
const BLOCK_EFFECT = 1 << 4;
const BRANCH_EFFECT = 1 << 5;
const ROOT_EFFECT = 1 << 6;
const BOUNDARY_EFFECT = 1 << 7;
const CONNECTED = 1 << 9;
const CLEAN = 1 << 10;
const DIRTY = 1 << 11;
const MAYBE_DIRTY = 1 << 12;
const INERT = 1 << 13;
const DESTROYED = 1 << 14;
const REACTION_RAN = 1 << 15;
const DESTROYING = 1 << 25;
const EFFECT_TRANSPARENT = 1 << 16;
const EAGER_EFFECT = 1 << 17;
const HEAD_EFFECT = 1 << 18;
const EFFECT_PRESERVED = 1 << 19;
const USER_EFFECT = 1 << 20;
const EFFECT_OFFSCREEN = 1 << 25;
const WAS_MARKED = 1 << 16;
const REACTION_IS_UPDATING = 1 << 21;
const ASYNC = 1 << 22;
const ERROR_VALUE = 1 << 23;
const STATE_SYMBOL = Symbol("$state");
const LEGACY_PROPS = Symbol("legacy props");
const LOADING_ATTR_SYMBOL = Symbol("");
const STALE_REACTION = new class StaleReactionError extends Error {
  constructor() {
    super(...arguments);
    __publicField(this, "name", "StaleReactionError");
    __publicField(this, "message", "The reaction that called `getAbortSignal()` was re-run or destroyed");
  }
}();
const IS_XHTML = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!((_a = globalThis.document) == null ? void 0 : _a.contentType) && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
function lifecycle_outside_component(name) {
  {
    throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
  }
}
function async_derived_orphan() {
  {
    throw new Error(`https://svelte.dev/e/async_derived_orphan`);
  }
}
function each_key_duplicate(a, b, value) {
  {
    throw new Error(`https://svelte.dev/e/each_key_duplicate`);
  }
}
function effect_in_teardown(rune) {
  {
    throw new Error(`https://svelte.dev/e/effect_in_teardown`);
  }
}
function effect_in_unowned_derived() {
  {
    throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
  }
}
function effect_orphan(rune) {
  {
    throw new Error(`https://svelte.dev/e/effect_orphan`);
  }
}
function effect_update_depth_exceeded() {
  {
    throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
  }
}
function props_invalid_value(key2) {
  {
    throw new Error(`https://svelte.dev/e/props_invalid_value`);
  }
}
function state_descriptors_fixed() {
  {
    throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
  }
}
function state_prototype_fixed() {
  {
    throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
  }
}
function state_unsafe_mutation() {
  {
    throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
  }
}
function svelte_boundary_reset_onerror() {
  {
    throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
  }
}
const EACH_ITEM_REACTIVE = 1;
const EACH_INDEX_REACTIVE = 1 << 1;
const EACH_IS_CONTROLLED = 1 << 2;
const EACH_IS_ANIMATED = 1 << 3;
const EACH_ITEM_IMMUTABLE = 1 << 4;
const PROPS_IS_IMMUTABLE = 1;
const PROPS_IS_RUNES = 1 << 1;
const PROPS_IS_UPDATED = 1 << 2;
const PROPS_IS_BINDABLE = 1 << 3;
const PROPS_IS_LAZY_INITIAL = 1 << 4;
const TRANSITION_IN = 1;
const TRANSITION_OUT = 1 << 1;
const TRANSITION_GLOBAL = 1 << 2;
const TEMPLATE_FRAGMENT = 1;
const TEMPLATE_USE_IMPORT_NODE = 1 << 1;
const UNINITIALIZED = Symbol();
const NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
const NAMESPACE_SVG = "http://www.w3.org/2000/svg";
const ATTACHMENT_KEY = "@attach";
function derived_inert() {
  {
    console.warn(`https://svelte.dev/e/derived_inert`);
  }
}
function select_multiple_invalid_value() {
  {
    console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
  }
}
function svelte_boundary_reset_noop() {
  {
    console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
  }
}
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
}
let legacy_mode_flag = false;
let tracing_mode_flag = false;
function enable_legacy_mode_flag() {
  legacy_mode_flag = true;
}
let component_context = null;
function set_component_context(context) {
  component_context = context;
}
function push(props, runes = false, fn) {
  component_context = {
    p: component_context,
    i: false,
    c: null,
    e: null,
    s: props,
    x: null,
    r: (
      /** @type {Effect} */
      active_effect
    ),
    l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
  };
}
function pop(component2) {
  var context = (
    /** @type {ComponentContext} */
    component_context
  );
  var effects = context.e;
  if (effects !== null) {
    context.e = null;
    for (var fn of effects) {
      create_user_effect(fn);
    }
  }
  context.i = true;
  component_context = context.p;
  return (
    /** @type {T} */
    {}
  );
}
function is_runes() {
  return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
let micro_tasks = [];
function run_micro_tasks() {
  var tasks = micro_tasks;
  micro_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (micro_tasks.length === 0 && !is_flushing_sync) {
    var tasks = micro_tasks;
    queueMicrotask(() => {
      if (tasks === micro_tasks) run_micro_tasks();
    });
  }
  micro_tasks.push(fn);
}
function flush_tasks() {
  while (micro_tasks.length > 0) {
    run_micro_tasks();
  }
}
function handle_error(error) {
  var effect2 = active_effect;
  if (effect2 === null) {
    active_reaction.f |= ERROR_VALUE;
    return error;
  }
  if ((effect2.f & REACTION_RAN) === 0 && (effect2.f & EFFECT) === 0) {
    throw error;
  }
  invoke_error_boundary(error, effect2);
}
function invoke_error_boundary(error, effect2) {
  while (effect2 !== null) {
    if ((effect2.f & BOUNDARY_EFFECT) !== 0) {
      if ((effect2.f & REACTION_RAN) === 0) {
        throw error;
      }
      try {
        effect2.b.error(error);
        return;
      } catch (e) {
        error = e;
      }
    }
    effect2 = effect2.parent;
  }
  throw error;
}
const STATUS_MASK = -7169;
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function update_derived_status(derived2) {
  if ((derived2.f & CONNECTED) !== 0 || derived2.deps === null) {
    set_signal_status(derived2, CLEAN);
  } else {
    set_signal_status(derived2, MAYBE_DIRTY);
  }
}
function clear_marked(deps) {
  if (deps === null) return;
  for (const dep of deps) {
    if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
      continue;
    }
    dep.f ^= WAS_MARKED;
    clear_marked(
      /** @type {Derived} */
      dep.deps
    );
  }
}
function defer_effect(effect2, dirty_effects, maybe_dirty_effects) {
  if ((effect2.f & DIRTY) !== 0) {
    dirty_effects.add(effect2);
  } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
    maybe_dirty_effects.add(effect2);
  }
  clear_marked(effect2.deps);
  set_signal_status(effect2, CLEAN);
}
function subscribe_to_store(store, run2, invalidate) {
  if (store == null) {
    run2(void 0);
    if (invalidate) invalidate(void 0);
    return noop;
  }
  const unsub = untrack(
    () => store.subscribe(
      run2,
      // @ts-expect-error
      invalidate
    )
  );
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
const subscriber_queue = [];
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop = null;
  const subscribers = /* @__PURE__ */ new Set();
  function set2(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update2(fn) {
    set2(fn(
      /** @type {T} */
      value
    ));
  }
  function subscribe(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set2, update2) || noop;
    }
    run2(
      /** @type {T} */
      value
    );
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set: set2, update: update2, subscribe };
}
function derived$1(stores, fn, initial_value) {
  const single = !Array.isArray(stores);
  const stores_array = single ? [stores] : stores;
  if (!stores_array.every(Boolean)) {
    throw new Error("derived() expects stores as input, got a falsy value");
  }
  const auto = fn.length < 2;
  return readable(initial_value, (set2, update2) => {
    let started = false;
    const values = [];
    let pending = 0;
    let cleanup = noop;
    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set2, update2);
      if (auto) {
        set2(result);
      } else {
        cleanup = typeof result === "function" ? result : noop;
      }
    };
    const unsubscribers = stores_array.map(
      (store, i) => subscribe_to_store(
        store,
        (value) => {
          values[i] = value;
          pending &= ~(1 << i);
          if (started) {
            sync();
          }
        },
        () => {
          pending |= 1 << i;
        }
      )
    );
    started = true;
    sync();
    return function stop() {
      run_all(unsubscribers);
      cleanup();
      started = false;
    };
  });
}
function get$1(store) {
  let value;
  subscribe_to_store(store, (_) => value = _)();
  return value;
}
let legacy_is_updating_store = false;
let is_store_binding = false;
let IS_UNMOUNTED = Symbol();
function store_get(store, store_name, stores) {
  const entry = stores[store_name] ?? (stores[store_name] = {
    store: null,
    source: /* @__PURE__ */ mutable_source(void 0),
    unsubscribe: noop
  });
  if (entry.store !== store && !(IS_UNMOUNTED in stores)) {
    entry.unsubscribe();
    entry.store = store ?? null;
    if (store == null) {
      entry.source.v = void 0;
      entry.unsubscribe = noop;
    } else {
      var is_synchronous_callback = true;
      entry.unsubscribe = subscribe_to_store(store, (v) => {
        if (is_synchronous_callback) {
          entry.source.v = v;
        } else {
          set(entry.source, v);
        }
      });
      is_synchronous_callback = false;
    }
  }
  if (store && IS_UNMOUNTED in stores) {
    return get$1(store);
  }
  return get(entry.source);
}
function store_set(store, value) {
  update_with_flag(store, value);
  return value;
}
function setup_stores() {
  const stores = {};
  function cleanup() {
    teardown(() => {
      for (var store_name in stores) {
        const ref = stores[store_name];
        ref.unsubscribe();
      }
      define_property(stores, IS_UNMOUNTED, {
        enumerable: false,
        value: true
      });
    });
  }
  return [stores, cleanup];
}
function update_with_flag(store, value) {
  legacy_is_updating_store = true;
  try {
    store.set(value);
  } finally {
    legacy_is_updating_store = false;
  }
}
function capture_store_binding(fn) {
  var previous_is_store_binding = is_store_binding;
  try {
    is_store_binding = false;
    return [fn(), is_store_binding];
  } finally {
    is_store_binding = previous_is_store_binding;
  }
}
const batches = /* @__PURE__ */ new Set();
let current_batch = null;
let batch_values = null;
let last_scheduled_effect = null;
let is_flushing_sync = false;
let is_processing = false;
let collected_effects = null;
let legacy_updates = null;
var flush_count = 0;
let uid = 1;
const _Batch = class _Batch {
  constructor() {
    __privateAdd(this, _Batch_instances);
    __publicField(this, "id", uid++);
    /**
     * The current values of any signals that are updated in this batch.
     * Tuple format: [value, is_derived] (note: is_derived is false for deriveds, too, if they were overridden via assignment)
     * They keys of this map are identical to `this.#previous`
     * @type {Map<Value, [any, boolean]>}
     */
    __publicField(this, "current", /* @__PURE__ */ new Map());
    /**
     * The values of any signals (sources and deriveds) that are updated in this batch _before_ those updates took place.
     * They keys of this map are identical to `this.#current`
     * @type {Map<Value, any>}
     */
    __publicField(this, "previous", /* @__PURE__ */ new Map());
    /**
     * When the batch is committed (and the DOM is updated), we need to remove old branches
     * and append new ones by calling the functions added inside (if/each/key/etc) blocks
     * @type {Set<(batch: Batch) => void>}
     */
    __privateAdd(this, _commit_callbacks, /* @__PURE__ */ new Set());
    /**
     * If a fork is discarded, we need to destroy any effects that are no longer needed
     * @type {Set<(batch: Batch) => void>}
     */
    __privateAdd(this, _discard_callbacks, /* @__PURE__ */ new Set());
    /**
     * Callbacks that should run only when a fork is committed.
     * @type {Set<(batch: Batch) => void>}
     */
    __privateAdd(this, _fork_commit_callbacks, /* @__PURE__ */ new Set());
    /**
     * Async effects that are currently in flight
     * @type {Map<Effect, number>}
     */
    __privateAdd(this, _pending, /* @__PURE__ */ new Map());
    /**
     * Async effects that are currently in flight, _not_ inside a pending boundary
     * @type {Map<Effect, number>}
     */
    __privateAdd(this, _blocking_pending, /* @__PURE__ */ new Map());
    /**
     * A deferred that resolves when the batch is committed, used with `settled()`
     * TODO replace with Promise.withResolvers once supported widely enough
     * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
     */
    __privateAdd(this, _deferred, null);
    /**
     * The root effects that need to be flushed
     * @type {Effect[]}
     */
    __privateAdd(this, _roots, []);
    /**
     * Effects created while this batch was active.
     * @type {Effect[]}
     */
    __privateAdd(this, _new_effects, []);
    /**
     * Deferred effects (which run after async work has completed) that are DIRTY
     * @type {Set<Effect>}
     */
    __privateAdd(this, _dirty_effects, /* @__PURE__ */ new Set());
    /**
     * Deferred effects that are MAYBE_DIRTY
     * @type {Set<Effect>}
     */
    __privateAdd(this, _maybe_dirty_effects, /* @__PURE__ */ new Set());
    /**
     * A map of branches that still exist, but will be destroyed when this batch
     * is committed — we skip over these during `process`.
     * The value contains child effects that were dirty/maybe_dirty before being reset,
     * so they can be rescheduled if the branch survives.
     * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
     */
    __privateAdd(this, _skipped_branches, /* @__PURE__ */ new Map());
    /**
     * Inverse of #skipped_branches which we need to tell prior batches to unskip them when committing
     * @type {Set<Effect>}
     */
    __privateAdd(this, _unskipped_branches, /* @__PURE__ */ new Set());
    __publicField(this, "is_fork", false);
    __privateAdd(this, _decrement_queued, false);
    /** @type {Set<Batch>} */
    __privateAdd(this, _blockers, /* @__PURE__ */ new Set());
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(effect2) {
    if (!__privateGet(this, _skipped_branches).has(effect2)) {
      __privateGet(this, _skipped_branches).set(effect2, { d: [], m: [] });
    }
    __privateGet(this, _unskipped_branches).delete(effect2);
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   * @param {(e: Effect) => void} callback
   */
  unskip_effect(effect2, callback = (e) => this.schedule(e)) {
    var tracked = __privateGet(this, _skipped_branches).get(effect2);
    if (tracked) {
      __privateGet(this, _skipped_branches).delete(effect2);
      for (var e of tracked.d) {
        set_signal_status(e, DIRTY);
        callback(e);
      }
      for (e of tracked.m) {
        set_signal_status(e, MAYBE_DIRTY);
        callback(e);
      }
    }
    __privateGet(this, _unskipped_branches).add(effect2);
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Value} source
   * @param {any} value
   * @param {boolean} [is_derived]
   */
  capture(source2, value, is_derived = false) {
    if (source2.v !== UNINITIALIZED && !this.previous.has(source2)) {
      this.previous.set(source2, source2.v);
    }
    if ((source2.f & ERROR_VALUE) === 0) {
      this.current.set(source2, [value, is_derived]);
      batch_values == null ? void 0 : batch_values.set(source2, value);
    }
    if (!this.is_fork) {
      source2.v = value;
    }
  }
  activate() {
    current_batch = this;
  }
  deactivate() {
    current_batch = null;
    batch_values = null;
  }
  flush() {
    try {
      is_processing = true;
      current_batch = this;
      __privateMethod(this, _Batch_instances, process_fn).call(this);
    } finally {
      flush_count = 0;
      last_scheduled_effect = null;
      collected_effects = null;
      legacy_updates = null;
      is_processing = false;
      current_batch = null;
      batch_values = null;
      old_values.clear();
    }
  }
  discard() {
    for (const fn of __privateGet(this, _discard_callbacks)) fn(this);
    __privateGet(this, _discard_callbacks).clear();
    __privateGet(this, _fork_commit_callbacks).clear();
    batches.delete(this);
  }
  /**
   * @param {Effect} effect
   */
  register_created_effect(effect2) {
    __privateGet(this, _new_effects).push(effect2);
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   */
  increment(blocking, effect2) {
    let pending_count = __privateGet(this, _pending).get(effect2) ?? 0;
    __privateGet(this, _pending).set(effect2, pending_count + 1);
    if (blocking) {
      let blocking_pending_count = __privateGet(this, _blocking_pending).get(effect2) ?? 0;
      __privateGet(this, _blocking_pending).set(effect2, blocking_pending_count + 1);
    }
  }
  /**
   * @param {boolean} blocking
   * @param {Effect} effect
   * @param {boolean} skip - whether to skip updates (because this is triggered by a stale reaction)
   */
  decrement(blocking, effect2, skip) {
    let pending_count = __privateGet(this, _pending).get(effect2) ?? 0;
    if (pending_count === 1) {
      __privateGet(this, _pending).delete(effect2);
    } else {
      __privateGet(this, _pending).set(effect2, pending_count - 1);
    }
    if (blocking) {
      let blocking_pending_count = __privateGet(this, _blocking_pending).get(effect2) ?? 0;
      if (blocking_pending_count === 1) {
        __privateGet(this, _blocking_pending).delete(effect2);
      } else {
        __privateGet(this, _blocking_pending).set(effect2, blocking_pending_count - 1);
      }
    }
    if (__privateGet(this, _decrement_queued) || skip) return;
    __privateSet(this, _decrement_queued, true);
    queue_micro_task(() => {
      __privateSet(this, _decrement_queued, false);
      this.flush();
    });
  }
  /**
   * @param {Set<Effect>} dirty_effects
   * @param {Set<Effect>} maybe_dirty_effects
   */
  transfer_effects(dirty_effects, maybe_dirty_effects) {
    for (const e of dirty_effects) {
      __privateGet(this, _dirty_effects).add(e);
    }
    for (const e of maybe_dirty_effects) {
      __privateGet(this, _maybe_dirty_effects).add(e);
    }
    dirty_effects.clear();
    maybe_dirty_effects.clear();
  }
  /** @param {(batch: Batch) => void} fn */
  oncommit(fn) {
    __privateGet(this, _commit_callbacks).add(fn);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(fn) {
    __privateGet(this, _discard_callbacks).add(fn);
  }
  /** @param {(batch: Batch) => void} fn */
  on_fork_commit(fn) {
    __privateGet(this, _fork_commit_callbacks).add(fn);
  }
  run_fork_commit_callbacks() {
    for (const fn of __privateGet(this, _fork_commit_callbacks)) fn(this);
    __privateGet(this, _fork_commit_callbacks).clear();
  }
  settled() {
    return (__privateGet(this, _deferred) ?? __privateSet(this, _deferred, deferred())).promise;
  }
  static ensure() {
    if (current_batch === null) {
      const batch = current_batch = new _Batch();
      if (!is_processing) {
        batches.add(current_batch);
        if (!is_flushing_sync) {
          queue_micro_task(() => {
            if (current_batch !== batch) {
              return;
            }
            batch.flush();
          });
        }
      }
    }
    return current_batch;
  }
  apply() {
    {
      batch_values = null;
      return;
    }
  }
  /**
   *
   * @param {Effect} effect
   */
  schedule(effect2) {
    var _a2;
    last_scheduled_effect = effect2;
    if (((_a2 = effect2.b) == null ? void 0 : _a2.is_pending) && (effect2.f & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 && (effect2.f & REACTION_RAN) === 0) {
      effect2.b.defer_effect(effect2);
      return;
    }
    var e = effect2;
    while (e.parent !== null) {
      e = e.parent;
      var flags2 = e.f;
      if (collected_effects !== null && e === active_effect) {
        if ((active_reaction === null || (active_reaction.f & DERIVED) === 0) && !legacy_is_updating_store) {
          return;
        }
      }
      if ((flags2 & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
        if ((flags2 & CLEAN) === 0) {
          return;
        }
        e.f ^= CLEAN;
      }
    }
    __privateGet(this, _roots).push(e);
  }
};
_commit_callbacks = new WeakMap();
_discard_callbacks = new WeakMap();
_fork_commit_callbacks = new WeakMap();
_pending = new WeakMap();
_blocking_pending = new WeakMap();
_deferred = new WeakMap();
_roots = new WeakMap();
_new_effects = new WeakMap();
_dirty_effects = new WeakMap();
_maybe_dirty_effects = new WeakMap();
_skipped_branches = new WeakMap();
_unskipped_branches = new WeakMap();
_decrement_queued = new WeakMap();
_blockers = new WeakMap();
_Batch_instances = new WeakSet();
is_deferred_fn = function() {
  return this.is_fork || __privateGet(this, _blocking_pending).size > 0;
};
is_blocked_fn = function() {
  for (const batch of __privateGet(this, _blockers)) {
    for (const effect2 of __privateGet(batch, _blocking_pending).keys()) {
      var skipped = false;
      var e = effect2;
      while (e.parent !== null) {
        if (__privateGet(this, _skipped_branches).has(e)) {
          skipped = true;
          break;
        }
        e = e.parent;
      }
      if (!skipped) {
        return true;
      }
    }
  }
  return false;
};
process_fn = function() {
  var _a2, _b2;
  if (flush_count++ > 1e3) {
    batches.delete(this);
    infinite_loop_guard();
  }
  if (!__privateMethod(this, _Batch_instances, is_deferred_fn).call(this)) {
    for (const e of __privateGet(this, _dirty_effects)) {
      __privateGet(this, _maybe_dirty_effects).delete(e);
      set_signal_status(e, DIRTY);
      this.schedule(e);
    }
    for (const e of __privateGet(this, _maybe_dirty_effects)) {
      set_signal_status(e, MAYBE_DIRTY);
      this.schedule(e);
    }
  }
  const roots = __privateGet(this, _roots);
  __privateSet(this, _roots, []);
  this.apply();
  var effects = collected_effects = [];
  var render_effects = [];
  var updates = legacy_updates = [];
  for (const root2 of roots) {
    try {
      __privateMethod(this, _Batch_instances, traverse_fn).call(this, root2, effects, render_effects);
    } catch (e) {
      reset_all(root2);
      throw e;
    }
  }
  current_batch = null;
  if (updates.length > 0) {
    var batch = _Batch.ensure();
    for (const e of updates) {
      batch.schedule(e);
    }
  }
  collected_effects = null;
  legacy_updates = null;
  if (__privateMethod(this, _Batch_instances, is_deferred_fn).call(this) || __privateMethod(this, _Batch_instances, is_blocked_fn).call(this)) {
    __privateMethod(this, _Batch_instances, defer_effects_fn).call(this, render_effects);
    __privateMethod(this, _Batch_instances, defer_effects_fn).call(this, effects);
    for (const [e, t] of __privateGet(this, _skipped_branches)) {
      reset_branch(e, t);
    }
  } else {
    if (__privateGet(this, _pending).size === 0) {
      batches.delete(this);
    }
    __privateGet(this, _dirty_effects).clear();
    __privateGet(this, _maybe_dirty_effects).clear();
    for (const fn of __privateGet(this, _commit_callbacks)) fn(this);
    __privateGet(this, _commit_callbacks).clear();
    flush_queued_effects(render_effects);
    flush_queued_effects(effects);
    (_a2 = __privateGet(this, _deferred)) == null ? void 0 : _a2.resolve();
  }
  var next_batch = (
    /** @type {Batch | null} */
    /** @type {unknown} */
    current_batch
  );
  if (__privateGet(this, _roots).length > 0) {
    const batch2 = next_batch ?? (next_batch = this);
    __privateGet(batch2, _roots).push(...__privateGet(this, _roots).filter((r2) => !__privateGet(batch2, _roots).includes(r2)));
  }
  if (next_batch !== null) {
    batches.add(next_batch);
    __privateMethod(_b2 = next_batch, _Batch_instances, process_fn).call(_b2);
  }
};
/**
 * Traverse the effect tree, executing effects or stashing
 * them for later execution as appropriate
 * @param {Effect} root
 * @param {Effect[]} effects
 * @param {Effect[]} render_effects
 */
traverse_fn = function(root2, effects, render_effects) {
  root2.f ^= CLEAN;
  var effect2 = root2.first;
  while (effect2 !== null) {
    var flags2 = effect2.f;
    var is_branch = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
    var is_skippable_branch = is_branch && (flags2 & CLEAN) !== 0;
    var skip = is_skippable_branch || (flags2 & INERT) !== 0 || __privateGet(this, _skipped_branches).has(effect2);
    if (!skip && effect2.fn !== null) {
      if (is_branch) {
        effect2.f ^= CLEAN;
      } else if ((flags2 & EFFECT) !== 0) {
        effects.push(effect2);
      } else if (is_dirty(effect2)) {
        if ((flags2 & BLOCK_EFFECT) !== 0) __privateGet(this, _maybe_dirty_effects).add(effect2);
        update_effect(effect2);
      }
      var child2 = effect2.first;
      if (child2 !== null) {
        effect2 = child2;
        continue;
      }
    }
    while (effect2 !== null) {
      var next = effect2.next;
      if (next !== null) {
        effect2 = next;
        break;
      }
      effect2 = effect2.parent;
    }
  }
};
/**
 * @param {Effect[]} effects
 */
defer_effects_fn = function(effects) {
  for (var i = 0; i < effects.length; i += 1) {
    defer_effect(effects[i], __privateGet(this, _dirty_effects), __privateGet(this, _maybe_dirty_effects));
  }
};
commit_fn = function() {
  var _a2, _b2, _c2;
  for (const batch of batches) {
    var is_earlier = batch.id < this.id;
    var sources = [];
    for (const [source3, [value, is_derived]] of this.current) {
      if (batch.current.has(source3)) {
        var batch_value = (
          /** @type {[any, boolean]} */
          batch.current.get(source3)[0]
        );
        if (is_earlier && value !== batch_value) {
          batch.current.set(source3, [value, is_derived]);
        } else {
          continue;
        }
      }
      sources.push(source3);
    }
    var others = [...batch.current.keys()].filter((s) => !this.current.has(s));
    if (others.length === 0) {
      if (is_earlier) {
        batch.discard();
      }
    } else if (sources.length > 0) {
      if (is_earlier) {
        for (const unskipped of __privateGet(this, _unskipped_branches)) {
          batch.unskip_effect(unskipped, (e) => {
            var _a3;
            if ((e.f & (BLOCK_EFFECT | ASYNC)) !== 0) {
              batch.schedule(e);
            } else {
              __privateMethod(_a3 = batch, _Batch_instances, defer_effects_fn).call(_a3, [e]);
            }
          });
        }
      }
      batch.activate();
      var marked = /* @__PURE__ */ new Set();
      var checked = /* @__PURE__ */ new Map();
      for (var source2 of sources) {
        mark_effects(source2, others, marked, checked);
      }
      checked = /* @__PURE__ */ new Map();
      var current_unequal = [...batch.current.keys()].filter(
        (c) => this.current.has(c) ? (
          /** @type {[any, boolean]} */
          this.current.get(c)[0] !== c
        ) : true
      );
      for (const effect2 of __privateGet(this, _new_effects)) {
        if ((effect2.f & (DESTROYED | INERT | EAGER_EFFECT)) === 0 && depends_on(effect2, current_unequal, checked)) {
          if ((effect2.f & (ASYNC | BLOCK_EFFECT)) !== 0) {
            set_signal_status(effect2, DIRTY);
            batch.schedule(effect2);
          } else {
            __privateGet(batch, _dirty_effects).add(effect2);
          }
        }
      }
      if (__privateGet(batch, _roots).length > 0) {
        batch.apply();
        for (var root2 of __privateGet(batch, _roots)) {
          __privateMethod(_a2 = batch, _Batch_instances, traverse_fn).call(_a2, root2, [], []);
        }
        __privateSet(batch, _roots, []);
      }
      batch.deactivate();
    }
  }
  for (const batch of batches) {
    if (__privateGet(batch, _blockers).has(this)) {
      __privateGet(batch, _blockers).delete(this);
      if (__privateGet(batch, _blockers).size === 0 && !__privateMethod(_b2 = batch, _Batch_instances, is_deferred_fn).call(_b2)) {
        batch.activate();
        __privateMethod(_c2 = batch, _Batch_instances, process_fn).call(_c2);
      }
    }
  }
};
let Batch = _Batch;
function flushSync(fn) {
  var was_flushing_sync = is_flushing_sync;
  is_flushing_sync = true;
  try {
    var result;
    if (fn) ;
    while (true) {
      flush_tasks();
      if (current_batch === null) {
        return (
          /** @type {T} */
          result
        );
      }
      current_batch.flush();
    }
  } finally {
    is_flushing_sync = was_flushing_sync;
  }
}
function infinite_loop_guard() {
  try {
    effect_update_depth_exceeded();
  } catch (error) {
    invoke_error_boundary(error, last_scheduled_effect);
  }
}
let eager_block_effects = null;
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  var i = 0;
  while (i < length) {
    var effect2 = effects[i++];
    if ((effect2.f & (DESTROYED | INERT)) === 0 && is_dirty(effect2)) {
      eager_block_effects = /* @__PURE__ */ new Set();
      update_effect(effect2);
      if (effect2.deps === null && effect2.first === null && effect2.nodes === null && effect2.teardown === null && effect2.ac === null) {
        unlink_effect(effect2);
      }
      if ((eager_block_effects == null ? void 0 : eager_block_effects.size) > 0) {
        old_values.clear();
        for (const e of eager_block_effects) {
          if ((e.f & (DESTROYED | INERT)) !== 0) continue;
          const ordered_effects = [e];
          let ancestor = e.parent;
          while (ancestor !== null) {
            if (eager_block_effects.has(ancestor)) {
              eager_block_effects.delete(ancestor);
              ordered_effects.push(ancestor);
            }
            ancestor = ancestor.parent;
          }
          for (let j = ordered_effects.length - 1; j >= 0; j--) {
            const e2 = ordered_effects[j];
            if ((e2.f & (DESTROYED | INERT)) !== 0) continue;
            update_effect(e2);
          }
        }
        eager_block_effects.clear();
      }
    }
  }
  eager_block_effects = null;
}
function mark_effects(value, sources, marked, checked) {
  if (marked.has(value)) return;
  marked.add(value);
  if (value.reactions !== null) {
    for (const reaction of value.reactions) {
      const flags2 = reaction.f;
      if ((flags2 & DERIVED) !== 0) {
        mark_effects(
          /** @type {Derived} */
          reaction,
          sources,
          marked,
          checked
        );
      } else if ((flags2 & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags2 & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
        set_signal_status(reaction, DIRTY);
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
}
function depends_on(reaction, sources, checked) {
  const depends = checked.get(reaction);
  if (depends !== void 0) return depends;
  if (reaction.deps !== null) {
    for (const dep of reaction.deps) {
      if (includes.call(sources, dep)) {
        return true;
      }
      if ((dep.f & DERIVED) !== 0 && depends_on(
        /** @type {Derived} */
        dep,
        sources,
        checked
      )) {
        checked.set(
          /** @type {Derived} */
          dep,
          true
        );
        return true;
      }
    }
  }
  checked.set(reaction, false);
  return false;
}
function schedule_effect(effect2) {
  current_batch.schedule(effect2);
}
function reset_branch(effect2, tracked) {
  if ((effect2.f & BRANCH_EFFECT) !== 0 && (effect2.f & CLEAN) !== 0) {
    return;
  }
  if ((effect2.f & DIRTY) !== 0) {
    tracked.d.push(effect2);
  } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
    tracked.m.push(effect2);
  }
  set_signal_status(effect2, CLEAN);
  var e = effect2.first;
  while (e !== null) {
    reset_branch(e, tracked);
    e = e.next;
  }
}
function reset_all(effect2) {
  set_signal_status(effect2, CLEAN);
  var e = effect2.first;
  while (e !== null) {
    reset_all(e);
    e = e.next;
  }
}
function createSubscriber(start) {
  let subscribers = 0;
  let version = source(0);
  let stop;
  return () => {
    if (effect_tracking()) {
      get(version);
      render_effect(() => {
        if (subscribers === 0) {
          stop = untrack(() => start(() => increment(version)));
        }
        subscribers += 1;
        return () => {
          queue_micro_task(() => {
            subscribers -= 1;
            if (subscribers === 0) {
              stop == null ? void 0 : stop();
              stop = void 0;
              increment(version);
            }
          });
        };
      });
    }
  };
}
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
function boundary(node, props, children, transform_error) {
  new Boundary(node, props, children, transform_error);
}
class Boundary {
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(node, props, children, transform_error) {
    __privateAdd(this, _Boundary_instances);
    /** @type {Boundary | null} */
    __publicField(this, "parent");
    __publicField(this, "is_pending", false);
    /**
     * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
     * Inherited from parent boundary, or defaults to identity.
     * @type {(error: unknown) => unknown}
     */
    __publicField(this, "transform_error");
    /** @type {TemplateNode} */
    __privateAdd(this, _anchor);
    /** @type {TemplateNode | null} */
    __privateAdd(this, _hydrate_open, null);
    /** @type {BoundaryProps} */
    __privateAdd(this, _props);
    /** @type {((anchor: Node) => void)} */
    __privateAdd(this, _children);
    /** @type {Effect} */
    __privateAdd(this, _effect);
    /** @type {Effect | null} */
    __privateAdd(this, _main_effect, null);
    /** @type {Effect | null} */
    __privateAdd(this, _pending_effect, null);
    /** @type {Effect | null} */
    __privateAdd(this, _failed_effect, null);
    /** @type {DocumentFragment | null} */
    __privateAdd(this, _offscreen_fragment, null);
    __privateAdd(this, _local_pending_count, 0);
    __privateAdd(this, _pending_count, 0);
    __privateAdd(this, _pending_count_update_queued, false);
    /** @type {Set<Effect>} */
    __privateAdd(this, _dirty_effects2, /* @__PURE__ */ new Set());
    /** @type {Set<Effect>} */
    __privateAdd(this, _maybe_dirty_effects2, /* @__PURE__ */ new Set());
    /**
     * A source containing the number of pending async deriveds/expressions.
     * Only created if `$effect.pending()` is used inside the boundary,
     * otherwise updating the source results in needless `Batch.ensure()`
     * calls followed by no-op flushes
     * @type {Source<number> | null}
     */
    __privateAdd(this, _effect_pending, null);
    __privateAdd(this, _effect_pending_subscriber, createSubscriber(() => {
      __privateSet(this, _effect_pending, source(__privateGet(this, _local_pending_count)));
      return () => {
        __privateSet(this, _effect_pending, null);
      };
    }));
    var _a2;
    __privateSet(this, _anchor, node);
    __privateSet(this, _props, props);
    __privateSet(this, _children, (anchor) => {
      var effect2 = (
        /** @type {Effect} */
        active_effect
      );
      effect2.b = this;
      effect2.f |= BOUNDARY_EFFECT;
      children(anchor);
    });
    this.parent = /** @type {Effect} */
    active_effect.b;
    this.transform_error = transform_error ?? ((_a2 = this.parent) == null ? void 0 : _a2.transform_error) ?? ((e) => e);
    __privateSet(this, _effect, block(() => {
      {
        __privateMethod(this, _Boundary_instances, render_fn).call(this);
      }
    }, flags));
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(effect2) {
    defer_effect(effect2, __privateGet(this, _dirty_effects2), __privateGet(this, _maybe_dirty_effects2));
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!__privateGet(this, _props).pending;
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   * @param {Batch} batch
   */
  update_pending_count(d, batch) {
    __privateMethod(this, _Boundary_instances, update_pending_count_fn).call(this, d, batch);
    __privateSet(this, _local_pending_count, __privateGet(this, _local_pending_count) + d);
    if (!__privateGet(this, _effect_pending) || __privateGet(this, _pending_count_update_queued)) return;
    __privateSet(this, _pending_count_update_queued, true);
    queue_micro_task(() => {
      __privateSet(this, _pending_count_update_queued, false);
      if (__privateGet(this, _effect_pending)) {
        internal_set(__privateGet(this, _effect_pending), __privateGet(this, _local_pending_count));
      }
    });
  }
  get_effect_pending() {
    __privateGet(this, _effect_pending_subscriber).call(this);
    return get(
      /** @type {Source<number>} */
      __privateGet(this, _effect_pending)
    );
  }
  /** @param {unknown} error */
  error(error) {
    if (!__privateGet(this, _props).onerror && !__privateGet(this, _props).failed) {
      throw error;
    }
    if (current_batch == null ? void 0 : current_batch.is_fork) {
      if (__privateGet(this, _main_effect)) current_batch.skip_effect(__privateGet(this, _main_effect));
      if (__privateGet(this, _pending_effect)) current_batch.skip_effect(__privateGet(this, _pending_effect));
      if (__privateGet(this, _failed_effect)) current_batch.skip_effect(__privateGet(this, _failed_effect));
      current_batch.on_fork_commit(() => {
        __privateMethod(this, _Boundary_instances, handle_error_fn).call(this, error);
      });
    } else {
      __privateMethod(this, _Boundary_instances, handle_error_fn).call(this, error);
    }
  }
}
_anchor = new WeakMap();
_hydrate_open = new WeakMap();
_props = new WeakMap();
_children = new WeakMap();
_effect = new WeakMap();
_main_effect = new WeakMap();
_pending_effect = new WeakMap();
_failed_effect = new WeakMap();
_offscreen_fragment = new WeakMap();
_local_pending_count = new WeakMap();
_pending_count = new WeakMap();
_pending_count_update_queued = new WeakMap();
_dirty_effects2 = new WeakMap();
_maybe_dirty_effects2 = new WeakMap();
_effect_pending = new WeakMap();
_effect_pending_subscriber = new WeakMap();
_Boundary_instances = new WeakSet();
hydrate_resolved_content_fn = function() {
  try {
    __privateSet(this, _main_effect, branch(() => __privateGet(this, _children).call(this, __privateGet(this, _anchor))));
  } catch (error) {
    this.error(error);
  }
};
/**
 * @param {unknown} error The deserialized error from the server's hydration comment
 */
hydrate_failed_content_fn = function(error) {
  const failed = __privateGet(this, _props).failed;
  if (!failed) return;
  __privateSet(this, _failed_effect, branch(() => {
    failed(
      __privateGet(this, _anchor),
      () => error,
      () => () => {
      }
    );
  }));
};
hydrate_pending_content_fn = function() {
  const pending = __privateGet(this, _props).pending;
  if (!pending) return;
  this.is_pending = true;
  __privateSet(this, _pending_effect, branch(() => pending(__privateGet(this, _anchor))));
  queue_micro_task(() => {
    var fragment = __privateSet(this, _offscreen_fragment, document.createDocumentFragment());
    var anchor = create_text();
    fragment.append(anchor);
    __privateSet(this, _main_effect, __privateMethod(this, _Boundary_instances, run_fn).call(this, () => {
      return branch(() => __privateGet(this, _children).call(this, anchor));
    }));
    if (__privateGet(this, _pending_count) === 0) {
      __privateGet(this, _anchor).before(fragment);
      __privateSet(this, _offscreen_fragment, null);
      pause_effect(
        /** @type {Effect} */
        __privateGet(this, _pending_effect),
        () => {
          __privateSet(this, _pending_effect, null);
        }
      );
      __privateMethod(this, _Boundary_instances, resolve_fn).call(
        this,
        /** @type {Batch} */
        current_batch
      );
    }
  });
};
render_fn = function() {
  try {
    this.is_pending = this.has_pending_snippet();
    __privateSet(this, _pending_count, 0);
    __privateSet(this, _local_pending_count, 0);
    __privateSet(this, _main_effect, branch(() => {
      __privateGet(this, _children).call(this, __privateGet(this, _anchor));
    }));
    if (__privateGet(this, _pending_count) > 0) {
      var fragment = __privateSet(this, _offscreen_fragment, document.createDocumentFragment());
      move_effect(__privateGet(this, _main_effect), fragment);
      const pending = (
        /** @type {(anchor: Node) => void} */
        __privateGet(this, _props).pending
      );
      __privateSet(this, _pending_effect, branch(() => pending(__privateGet(this, _anchor))));
    } else {
      __privateMethod(this, _Boundary_instances, resolve_fn).call(
        this,
        /** @type {Batch} */
        current_batch
      );
    }
  } catch (error) {
    this.error(error);
  }
};
/**
 * @param {Batch} batch
 */
resolve_fn = function(batch) {
  this.is_pending = false;
  batch.transfer_effects(__privateGet(this, _dirty_effects2), __privateGet(this, _maybe_dirty_effects2));
};
/**
 * @template T
 * @param {() => T} fn
 */
run_fn = function(fn) {
  var previous_effect = active_effect;
  var previous_reaction = active_reaction;
  var previous_ctx = component_context;
  set_active_effect(__privateGet(this, _effect));
  set_active_reaction(__privateGet(this, _effect));
  set_component_context(__privateGet(this, _effect).ctx);
  try {
    Batch.ensure();
    return fn();
  } catch (e) {
    handle_error(e);
    return null;
  } finally {
    set_active_effect(previous_effect);
    set_active_reaction(previous_reaction);
    set_component_context(previous_ctx);
  }
};
/**
 * Updates the pending count associated with the currently visible pending snippet,
 * if any, such that we can replace the snippet with content once work is done
 * @param {1 | -1} d
 * @param {Batch} batch
 */
update_pending_count_fn = function(d, batch) {
  var _a2;
  if (!this.has_pending_snippet()) {
    if (this.parent) {
      __privateMethod(_a2 = this.parent, _Boundary_instances, update_pending_count_fn).call(_a2, d, batch);
    }
    return;
  }
  __privateSet(this, _pending_count, __privateGet(this, _pending_count) + d);
  if (__privateGet(this, _pending_count) === 0) {
    __privateMethod(this, _Boundary_instances, resolve_fn).call(this, batch);
    if (__privateGet(this, _pending_effect)) {
      pause_effect(__privateGet(this, _pending_effect), () => {
        __privateSet(this, _pending_effect, null);
      });
    }
    if (__privateGet(this, _offscreen_fragment)) {
      __privateGet(this, _anchor).before(__privateGet(this, _offscreen_fragment));
      __privateSet(this, _offscreen_fragment, null);
    }
  }
};
/**
 * @param {unknown} error
 */
handle_error_fn = function(error) {
  if (__privateGet(this, _main_effect)) {
    destroy_effect(__privateGet(this, _main_effect));
    __privateSet(this, _main_effect, null);
  }
  if (__privateGet(this, _pending_effect)) {
    destroy_effect(__privateGet(this, _pending_effect));
    __privateSet(this, _pending_effect, null);
  }
  if (__privateGet(this, _failed_effect)) {
    destroy_effect(__privateGet(this, _failed_effect));
    __privateSet(this, _failed_effect, null);
  }
  var onerror = __privateGet(this, _props).onerror;
  let failed = __privateGet(this, _props).failed;
  var did_reset = false;
  var calling_on_error = false;
  const reset = () => {
    if (did_reset) {
      svelte_boundary_reset_noop();
      return;
    }
    did_reset = true;
    if (calling_on_error) {
      svelte_boundary_reset_onerror();
    }
    if (__privateGet(this, _failed_effect) !== null) {
      pause_effect(__privateGet(this, _failed_effect), () => {
        __privateSet(this, _failed_effect, null);
      });
    }
    __privateMethod(this, _Boundary_instances, run_fn).call(this, () => {
      __privateMethod(this, _Boundary_instances, render_fn).call(this);
    });
  };
  const handle_error_result = (transformed_error) => {
    try {
      calling_on_error = true;
      onerror == null ? void 0 : onerror(transformed_error, reset);
      calling_on_error = false;
    } catch (error2) {
      invoke_error_boundary(error2, __privateGet(this, _effect) && __privateGet(this, _effect).parent);
    }
    if (failed) {
      __privateSet(this, _failed_effect, __privateMethod(this, _Boundary_instances, run_fn).call(this, () => {
        try {
          return branch(() => {
            var effect2 = (
              /** @type {Effect} */
              active_effect
            );
            effect2.b = this;
            effect2.f |= BOUNDARY_EFFECT;
            failed(
              __privateGet(this, _anchor),
              () => transformed_error,
              () => reset
            );
          });
        } catch (error2) {
          invoke_error_boundary(
            error2,
            /** @type {Effect} */
            __privateGet(this, _effect).parent
          );
          return null;
        }
      }));
    }
  };
  queue_micro_task(() => {
    var result;
    try {
      result = this.transform_error(error);
    } catch (e) {
      invoke_error_boundary(e, __privateGet(this, _effect) && __privateGet(this, _effect).parent);
      return;
    }
    if (result !== null && typeof result === "object" && typeof /** @type {any} */
    result.then === "function") {
      result.then(
        handle_error_result,
        /** @param {unknown} e */
        (e) => invoke_error_boundary(e, __privateGet(this, _effect) && __privateGet(this, _effect).parent)
      );
    } else {
      handle_error_result(result);
    }
  });
};
function flatten(blockers, sync, async, fn) {
  const d = is_runes() ? derived : derived_safe_equal;
  var pending = blockers.filter((b) => !b.settled);
  if (async.length === 0 && pending.length === 0) {
    fn(sync.map(d));
    return;
  }
  var parent = (
    /** @type {Effect} */
    active_effect
  );
  var restore = capture();
  var blocker_promise = pending.length === 1 ? pending[0].promise : pending.length > 1 ? Promise.all(pending.map((b) => b.promise)) : null;
  function finish(values) {
    restore();
    try {
      fn(values);
    } catch (error) {
      if ((parent.f & DESTROYED) === 0) {
        invoke_error_boundary(error, parent);
      }
    }
    unset_context();
  }
  if (async.length === 0) {
    blocker_promise.then(() => finish(sync.map(d)));
    return;
  }
  var decrement_pending = increment_pending();
  function run2() {
    Promise.all(async.map((expression) => /* @__PURE__ */ async_derived(expression))).then((result) => finish([...sync.map(d), ...result])).catch((error) => invoke_error_boundary(error, parent)).finally(() => decrement_pending());
  }
  if (blocker_promise) {
    blocker_promise.then(() => {
      restore();
      run2();
      unset_context();
    });
  } else {
    run2();
  }
}
function capture() {
  var previous_effect = (
    /** @type {Effect} */
    active_effect
  );
  var previous_reaction = active_reaction;
  var previous_component_context = component_context;
  var previous_batch = (
    /** @type {Batch} */
    current_batch
  );
  return function restore(activate_batch = true) {
    set_active_effect(previous_effect);
    set_active_reaction(previous_reaction);
    set_component_context(previous_component_context);
    if (activate_batch && (previous_effect.f & DESTROYED) === 0) {
      previous_batch == null ? void 0 : previous_batch.activate();
      previous_batch == null ? void 0 : previous_batch.apply();
    }
  };
}
function unset_context(deactivate_batch = true) {
  set_active_effect(null);
  set_active_reaction(null);
  set_component_context(null);
  if (deactivate_batch) current_batch == null ? void 0 : current_batch.deactivate();
}
function increment_pending() {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  var boundary2 = (
    /** @type {Boundary} */
    effect2.b
  );
  var batch = (
    /** @type {Batch} */
    current_batch
  );
  var blocking = boundary2.is_rendered();
  boundary2.update_pending_count(1, batch);
  batch.increment(blocking, effect2);
  return (skip = false) => {
    boundary2.update_pending_count(-1, batch);
    batch.decrement(blocking, effect2, skip);
  };
}
// @__NO_SIDE_EFFECTS__
function derived(fn) {
  var flags2 = DERIVED | DIRTY;
  if (active_effect !== null) {
    active_effect.f |= EFFECT_PRESERVED;
  }
  const signal = {
    ctx: component_context,
    deps: null,
    effects: null,
    equals,
    f: flags2,
    fn,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      UNINITIALIZED
    ),
    wv: 0,
    parent: active_effect,
    ac: null
  };
  return signal;
}
// @__NO_SIDE_EFFECTS__
function async_derived(fn, label, location2) {
  let parent = (
    /** @type {Effect | null} */
    active_effect
  );
  if (parent === null) {
    async_derived_orphan();
  }
  var promise = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  );
  var signal = source(
    /** @type {V} */
    UNINITIALIZED
  );
  var should_suspend = !active_reaction;
  var deferreds = /* @__PURE__ */ new Map();
  async_effect(() => {
    var _a2;
    var effect2 = (
      /** @type {Effect} */
      active_effect
    );
    var d = deferred();
    promise = d.promise;
    try {
      Promise.resolve(fn()).then(d.resolve, d.reject).finally(unset_context);
    } catch (error) {
      d.reject(error);
      unset_context();
    }
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    if (should_suspend) {
      if ((effect2.f & REACTION_RAN) !== 0) {
        var decrement_pending = increment_pending();
      }
      if (
        /** @type {Boundary} */
        parent.b.is_rendered()
      ) {
        (_a2 = deferreds.get(batch)) == null ? void 0 : _a2.reject(STALE_REACTION);
        deferreds.delete(batch);
      } else {
        for (const d2 of deferreds.values()) {
          d2.reject(STALE_REACTION);
        }
        deferreds.clear();
      }
      deferreds.set(batch, d);
    }
    const handler = (value, error = void 0) => {
      if (decrement_pending) {
        var skip = error === STALE_REACTION;
        decrement_pending(skip);
      }
      if (error === STALE_REACTION || (effect2.f & DESTROYED) !== 0) {
        return;
      }
      batch.activate();
      if (error) {
        signal.f |= ERROR_VALUE;
        internal_set(signal, error);
      } else {
        if ((signal.f & ERROR_VALUE) !== 0) {
          signal.f ^= ERROR_VALUE;
        }
        internal_set(signal, value);
        for (const [b, d2] of deferreds) {
          deferreds.delete(b);
          if (b === batch) break;
          d2.reject(STALE_REACTION);
        }
      }
      batch.deactivate();
    };
    d.promise.then(handler, (e) => handler(null, e || "unknown"));
  });
  teardown(() => {
    for (const d of deferreds.values()) {
      d.reject(STALE_REACTION);
    }
  });
  return new Promise((fulfil) => {
    function next(p) {
      function go() {
        if (p === promise) {
          fulfil(signal);
        } else {
          next(promise);
        }
      }
      p.then(go, go);
    }
    next(promise);
  });
}
// @__NO_SIDE_EFFECTS__
function user_derived(fn) {
  const d = /* @__PURE__ */ derived(fn);
  push_reaction_value(d);
  return d;
}
// @__NO_SIDE_EFFECTS__
function derived_safe_equal(fn) {
  const signal = /* @__PURE__ */ derived(fn);
  signal.equals = safe_equals;
  return signal;
}
function destroy_derived_effects(derived2) {
  var effects = derived2.effects;
  if (effects !== null) {
    derived2.effects = null;
    for (var i = 0; i < effects.length; i += 1) {
      destroy_effect(
        /** @type {Effect} */
        effects[i]
      );
    }
  }
}
function execute_derived(derived2) {
  var value;
  var prev_active_effect = active_effect;
  var parent = derived2.parent;
  if (!is_destroying_effect && parent !== null && (parent.f & (DESTROYED | INERT)) !== 0) {
    derived_inert();
    return derived2.v;
  }
  set_active_effect(parent);
  {
    try {
      derived2.f &= ~WAS_MARKED;
      destroy_derived_effects(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
    }
  }
  return value;
}
function update_derived(derived2) {
  var value = execute_derived(derived2);
  if (!derived2.equals(value)) {
    derived2.wv = increment_write_version();
    if (!(current_batch == null ? void 0 : current_batch.is_fork) || derived2.deps === null) {
      if (current_batch !== null) {
        current_batch.capture(derived2, value, true);
      } else {
        derived2.v = value;
      }
      if (derived2.deps === null) {
        set_signal_status(derived2, CLEAN);
        return;
      }
    }
  }
  if (is_destroying_effect) {
    return;
  }
  if (batch_values !== null) {
    if (effect_tracking() || (current_batch == null ? void 0 : current_batch.is_fork)) {
      batch_values.set(derived2, value);
    }
  } else {
    update_derived_status(derived2);
  }
}
function freeze_derived_effects(derived2) {
  var _a2, _b2;
  if (derived2.effects === null) return;
  for (const e of derived2.effects) {
    if (e.teardown || e.ac) {
      (_a2 = e.teardown) == null ? void 0 : _a2.call(e);
      (_b2 = e.ac) == null ? void 0 : _b2.abort(STALE_REACTION);
      e.teardown = noop;
      e.ac = null;
      remove_reactions(e, 0);
      destroy_effect_children(e);
    }
  }
}
function unfreeze_derived_effects(derived2) {
  if (derived2.effects === null) return;
  for (const e of derived2.effects) {
    if (e.teardown) {
      update_effect(e);
    }
  }
}
let eager_effects = /* @__PURE__ */ new Set();
const old_values = /* @__PURE__ */ new Map();
let eager_effects_deferred = false;
function source(v, stack) {
  var signal = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  return signal;
}
// @__NO_SIDE_EFFECTS__
function state(v, stack) {
  const s = source(v);
  push_reaction_value(s);
  return s;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable = false, trackable = true) {
  var _a2;
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
    ((_a2 = component_context.l).s ?? (_a2.s = [])).push(s);
  }
  return s;
}
function mutate(source2, value) {
  set(
    source2,
    untrack(() => get(source2))
  );
  return value;
}
function set(source2, value, should_proxy = false) {
  if (active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !includes.call(current_sources, source2))) {
    state_unsafe_mutation();
  }
  let new_value = should_proxy ? proxy(value) : value;
  return internal_set(source2, new_value, legacy_updates);
}
function internal_set(source2, value, updated_during_traversal = null) {
  if (!source2.equals(value)) {
    old_values.set(source2, is_destroying_effect ? value : source2.v);
    var batch = Batch.ensure();
    batch.capture(source2, value);
    if ((source2.f & DERIVED) !== 0) {
      const derived2 = (
        /** @type {Derived} */
        source2
      );
      if ((source2.f & DIRTY) !== 0) {
        execute_derived(derived2);
      }
      if (batch_values === null) {
        update_derived_status(derived2);
      }
    }
    source2.wv = increment_write_version();
    mark_reactions(source2, DIRTY, updated_during_traversal);
    if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
      if (untracked_writes === null) {
        set_untracked_writes([source2]);
      } else {
        untracked_writes.push(source2);
      }
    }
    if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
      flush_eager_effects();
    }
  }
  return value;
}
function flush_eager_effects() {
  eager_effects_deferred = false;
  for (const effect2 of eager_effects) {
    if ((effect2.f & CLEAN) !== 0) {
      set_signal_status(effect2, MAYBE_DIRTY);
    }
    if (is_dirty(effect2)) {
      update_effect(effect2);
    }
  }
  eager_effects.clear();
}
function update(source2, d = 1) {
  var value = get(source2);
  var result = d === 1 ? value++ : value--;
  set(source2, value);
  return result;
}
function increment(source2) {
  set(source2, source2.v + 1);
}
function mark_reactions(signal, status, updated_during_traversal) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var runes = is_runes();
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags2 = reaction.f;
    if (!runes && reaction === active_effect) continue;
    var not_dirty = (flags2 & DIRTY) === 0;
    if (not_dirty) {
      set_signal_status(reaction, status);
    }
    if ((flags2 & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        reaction
      );
      batch_values == null ? void 0 : batch_values.delete(derived2);
      if ((flags2 & WAS_MARKED) === 0) {
        if (flags2 & CONNECTED && (active_effect === null || (active_effect.f & REACTION_IS_UPDATING) === 0)) {
          reaction.f |= WAS_MARKED;
        }
        mark_reactions(derived2, MAYBE_DIRTY, updated_during_traversal);
      }
    } else if (not_dirty) {
      var effect2 = (
        /** @type {Effect} */
        reaction
      );
      if ((flags2 & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
        eager_block_effects.add(effect2);
      }
      if (updated_during_traversal !== null) {
        updated_during_traversal.push(effect2);
      } else {
        schedule_effect(effect2);
      }
    }
  }
}
function proxy(value) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
    return value;
  }
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) {
    return value;
  }
  var sources = /* @__PURE__ */ new Map();
  var is_proxied_array = is_array(value);
  var version = /* @__PURE__ */ state(0);
  var parent_version = update_version;
  var with_parent = (fn) => {
    if (update_version === parent_version) {
      return fn();
    }
    var reaction = active_reaction;
    var version2 = update_version;
    set_active_reaction(null);
    set_update_version(parent_version);
    var result = fn();
    set_active_reaction(reaction);
    set_update_version(version2);
    return result;
  };
  if (is_proxied_array) {
    sources.set("length", /* @__PURE__ */ state(
      /** @type {any[]} */
      value.length
    ));
  }
  return new Proxy(
    /** @type {any} */
    value,
    {
      defineProperty(_, prop2, descriptor) {
        if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
          state_descriptors_fixed();
        }
        var s = sources.get(prop2);
        if (s === void 0) {
          with_parent(() => {
            var s2 = /* @__PURE__ */ state(descriptor.value);
            sources.set(prop2, s2);
            return s2;
          });
        } else {
          set(s, descriptor.value, true);
        }
        return true;
      },
      deleteProperty(target, prop2) {
        var s = sources.get(prop2);
        if (s === void 0) {
          if (prop2 in target) {
            const s2 = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED));
            sources.set(prop2, s2);
            increment(version);
          }
        } else {
          set(s, UNINITIALIZED);
          increment(version);
        }
        return true;
      },
      get(target, prop2, receiver) {
        var _a2;
        if (prop2 === STATE_SYMBOL) {
          return value;
        }
        var s = sources.get(prop2);
        var exists = prop2 in target;
        if (s === void 0 && (!exists || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable))) {
          s = with_parent(() => {
            var p = proxy(exists ? target[prop2] : UNINITIALIZED);
            var s2 = /* @__PURE__ */ state(p);
            return s2;
          });
          sources.set(prop2, s);
        }
        if (s !== void 0) {
          var v = get(s);
          return v === UNINITIALIZED ? void 0 : v;
        }
        return Reflect.get(target, prop2, receiver);
      },
      getOwnPropertyDescriptor(target, prop2) {
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor && "value" in descriptor) {
          var s = sources.get(prop2);
          if (s) descriptor.value = get(s);
        } else if (descriptor === void 0) {
          var source2 = sources.get(prop2);
          var value2 = source2 == null ? void 0 : source2.v;
          if (source2 !== void 0 && value2 !== UNINITIALIZED) {
            return {
              enumerable: true,
              configurable: true,
              value: value2,
              writable: true
            };
          }
        }
        return descriptor;
      },
      has(target, prop2) {
        var _a2;
        if (prop2 === STATE_SYMBOL) {
          return true;
        }
        var s = sources.get(prop2);
        var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
        if (s !== void 0 || active_effect !== null && (!has || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable))) {
          if (s === void 0) {
            s = with_parent(() => {
              var p = has ? proxy(target[prop2]) : UNINITIALIZED;
              var s2 = /* @__PURE__ */ state(p);
              return s2;
            });
            sources.set(prop2, s);
          }
          var value2 = get(s);
          if (value2 === UNINITIALIZED) {
            return false;
          }
        }
        return has;
      },
      set(target, prop2, value2, receiver) {
        var _a2;
        var s = sources.get(prop2);
        var has = prop2 in target;
        if (is_proxied_array && prop2 === "length") {
          for (var i = value2; i < /** @type {Source<number>} */
          s.v; i += 1) {
            var other_s = sources.get(i + "");
            if (other_s !== void 0) {
              set(other_s, UNINITIALIZED);
            } else if (i in target) {
              other_s = with_parent(() => /* @__PURE__ */ state(UNINITIALIZED));
              sources.set(i + "", other_s);
            }
          }
        }
        if (s === void 0) {
          if (!has || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable)) {
            s = with_parent(() => /* @__PURE__ */ state(void 0));
            set(s, proxy(value2));
            sources.set(prop2, s);
          }
        } else {
          has = s.v !== UNINITIALIZED;
          var p = with_parent(() => proxy(value2));
          set(s, p);
        }
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor == null ? void 0 : descriptor.set) {
          descriptor.set.call(receiver, value2);
        }
        if (!has) {
          if (is_proxied_array && typeof prop2 === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop2);
            if (Number.isInteger(n) && n >= ls.v) {
              set(ls, n + 1);
            }
          }
          increment(version);
        }
        return true;
      },
      ownKeys(target) {
        get(version);
        var own_keys = Reflect.ownKeys(target).filter((key3) => {
          var source3 = sources.get(key3);
          return source3 === void 0 || source3.v !== UNINITIALIZED;
        });
        for (var [key2, source2] of sources) {
          if (source2.v !== UNINITIALIZED && !(key2 in target)) {
            own_keys.push(key2);
          }
        }
        return own_keys;
      },
      setPrototypeOf() {
        state_prototype_fixed();
      }
    }
  );
}
function get_proxied_value(value) {
  try {
    if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
      return value[STATE_SYMBOL];
    }
  } catch {
  }
  return value;
}
function is(a, b) {
  return Object.is(get_proxied_value(a), get_proxied_value(b));
}
var $window;
var is_firefox;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
  if ($window !== void 0) {
    return;
  }
  $window = window;
  is_firefox = /Firefox/.test(navigator.userAgent);
  var element_prototype = Element.prototype;
  var node_prototype = Node.prototype;
  var text_prototype = Text.prototype;
  first_child_getter = get_descriptor(node_prototype, "firstChild").get;
  next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
  if (is_extensible(element_prototype)) {
    element_prototype.__click = void 0;
    element_prototype.__className = void 0;
    element_prototype.__attributes = null;
    element_prototype.__style = void 0;
    element_prototype.__e = void 0;
  }
  if (is_extensible(text_prototype)) {
    text_prototype.__t = void 0;
  }
}
function create_text(value = "") {
  return document.createTextNode(value);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(node) {
  return (
    /** @type {TemplateNode | null} */
    first_child_getter.call(node)
  );
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return (
    /** @type {TemplateNode | null} */
    next_sibling_getter.call(node)
  );
}
function child(node, is_text) {
  {
    return /* @__PURE__ */ get_first_child(node);
  }
}
function first_child(node, is_text = false) {
  {
    var first = /* @__PURE__ */ get_first_child(node);
    if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
    return first;
  }
}
function sibling(node, count = 1, is_text = false) {
  let next_sibling = node;
  while (count--) {
    next_sibling = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(next_sibling);
  }
  {
    return next_sibling;
  }
}
function clear_text_content(node) {
  node.textContent = "";
}
function should_defer_append() {
  return false;
}
function create_element(tag, namespace, is2) {
  let options = void 0;
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(namespace ?? NAMESPACE_HTML, tag, options)
  );
}
function autofocus(dom, value) {
  if (value) {
    const body = document.body;
    dom.autofocus = true;
    queue_micro_task(() => {
      if (document.activeElement === body) {
        dom.focus();
      }
    });
  }
}
let listening_to_form_reset = false;
function add_form_reset_listener() {
  if (!listening_to_form_reset) {
    listening_to_form_reset = true;
    document.addEventListener(
      "reset",
      (evt) => {
        Promise.resolve().then(() => {
          var _a2;
          if (!evt.defaultPrevented) {
            for (
              const e of
              /**@type {HTMLFormElement} */
              evt.target.elements
            ) {
              (_a2 = e.__on_r) == null ? void 0 : _a2.call(e);
            }
          }
        });
      },
      // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
      { capture: true }
    );
  }
}
function without_reactive_context(fn) {
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    return fn();
  } finally {
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function listen_to_event_and_reset_event(element2, event2, handler, on_reset = handler) {
  element2.addEventListener(event2, () => without_reactive_context(handler));
  const prev = element2.__on_r;
  if (prev) {
    element2.__on_r = () => {
      prev();
      on_reset(true);
    };
  } else {
    element2.__on_r = () => on_reset(true);
  }
  add_form_reset_listener();
}
function validate_effect(rune) {
  if (active_effect === null) {
    if (active_reaction === null) {
      effect_orphan();
    }
    effect_in_unowned_derived();
  }
  if (is_destroying_effect) {
    effect_in_teardown();
  }
}
function push_effect(effect2, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect2;
  } else {
    parent_last.next = effect2;
    effect2.prev = parent_last;
    parent_effect.last = effect2;
  }
}
function create_effect(type, fn) {
  var parent = active_effect;
  if (parent !== null && (parent.f & INERT) !== 0) {
    type |= INERT;
  }
  var effect2 = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: type | DIRTY | CONNECTED,
    first: null,
    fn,
    last: null,
    next: null,
    parent,
    b: parent && parent.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  current_batch == null ? void 0 : current_batch.register_created_effect(effect2);
  var e = effect2;
  if ((type & EFFECT) !== 0) {
    if (collected_effects !== null) {
      collected_effects.push(effect2);
    } else {
      Batch.ensure().schedule(effect2);
    }
  } else if (fn !== null) {
    try {
      update_effect(effect2);
    } catch (e2) {
      destroy_effect(effect2);
      throw e2;
    }
    if (e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && // either `null`, or a singular child
    (e.f & EFFECT_PRESERVED) === 0) {
      e = e.first;
      if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
        e.f |= EFFECT_TRANSPARENT;
      }
    }
  }
  if (e !== null) {
    e.parent = parent;
    if (parent !== null) {
      push_effect(e, parent);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
      var derived2 = (
        /** @type {Derived} */
        active_reaction
      );
      (derived2.effects ?? (derived2.effects = [])).push(e);
    }
  }
  return effect2;
}
function effect_tracking() {
  return active_reaction !== null && !untracking;
}
function teardown(fn) {
  const effect2 = create_effect(RENDER_EFFECT, null);
  set_signal_status(effect2, CLEAN);
  effect2.teardown = fn;
  return effect2;
}
function user_effect(fn) {
  validate_effect();
  var flags2 = (
    /** @type {Effect} */
    active_effect.f
  );
  var defer = !active_reaction && (flags2 & BRANCH_EFFECT) !== 0 && (flags2 & REACTION_RAN) === 0;
  if (defer) {
    var context = (
      /** @type {ComponentContext} */
      component_context
    );
    (context.e ?? (context.e = [])).push(fn);
  } else {
    return create_user_effect(fn);
  }
}
function create_user_effect(fn) {
  return create_effect(EFFECT | USER_EFFECT, fn);
}
function user_pre_effect(fn) {
  validate_effect();
  return create_effect(RENDER_EFFECT | USER_EFFECT, fn);
}
function component_root(fn) {
  Batch.ensure();
  const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
  return (options = {}) => {
    return new Promise((fulfil) => {
      if (options.outro) {
        pause_effect(effect2, () => {
          destroy_effect(effect2);
          fulfil(void 0);
        });
      } else {
        destroy_effect(effect2);
        fulfil(void 0);
      }
    });
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn);
}
function legacy_pre_effect(deps, fn) {
  var context = (
    /** @type {ComponentContextLegacy} */
    component_context
  );
  var token = { effect: null, ran: false, deps };
  context.l.$.push(token);
  token.effect = render_effect(() => {
    deps();
    if (token.ran) return;
    token.ran = true;
    var effect2 = (
      /** @type {Effect} */
      active_effect
    );
    try {
      set_active_effect(effect2.parent);
      untrack(fn);
    } finally {
      set_active_effect(effect2);
    }
  });
}
function legacy_pre_effect_reset() {
  var context = (
    /** @type {ComponentContextLegacy} */
    component_context
  );
  render_effect(() => {
    for (var token of context.l.$) {
      token.deps();
      var effect2 = token.effect;
      if ((effect2.f & CLEAN) !== 0 && effect2.deps !== null) {
        set_signal_status(effect2, MAYBE_DIRTY);
      }
      if (is_dirty(effect2)) {
        update_effect(effect2);
      }
      token.ran = false;
    }
  });
}
function async_effect(fn) {
  return create_effect(ASYNC | EFFECT_PRESERVED, fn);
}
function render_effect(fn, flags2 = 0) {
  return create_effect(RENDER_EFFECT | flags2, fn);
}
function template_effect(fn, sync = [], async = [], blockers = []) {
  flatten(blockers, sync, async, (values) => {
    create_effect(RENDER_EFFECT, () => fn(...values.map(get)));
  });
}
function block(fn, flags2 = 0) {
  var effect2 = create_effect(BLOCK_EFFECT | flags2, fn);
  return effect2;
}
function managed(fn, flags2 = 0) {
  var effect2 = create_effect(MANAGED_EFFECT | flags2, fn);
  return effect2;
}
function branch(fn) {
  return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn);
}
function execute_effect_teardown(effect2) {
  var teardown2 = effect2.teardown;
  if (teardown2 !== null) {
    const previously_destroying_effect = is_destroying_effect;
    const previous_reaction = active_reaction;
    set_is_destroying_effect(true);
    set_active_reaction(null);
    try {
      teardown2.call(null);
    } finally {
      set_is_destroying_effect(previously_destroying_effect);
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect2 = signal.first;
  signal.first = signal.last = null;
  while (effect2 !== null) {
    const controller = effect2.ac;
    if (controller !== null) {
      without_reactive_context(() => {
        controller.abort(STALE_REACTION);
      });
    }
    var next = effect2.next;
    if ((effect2.f & ROOT_EFFECT) !== 0) {
      effect2.parent = null;
    } else {
      destroy_effect(effect2, remove_dom);
    }
    effect2 = next;
  }
}
function destroy_block_effect_children(signal) {
  var effect2 = signal.first;
  while (effect2 !== null) {
    var next = effect2.next;
    if ((effect2.f & BRANCH_EFFECT) === 0) {
      destroy_effect(effect2);
    }
    effect2 = next;
  }
}
function destroy_effect(effect2, remove_dom = true) {
  var removed = false;
  if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes !== null && effect2.nodes.end !== null) {
    remove_effect_dom(
      effect2.nodes.start,
      /** @type {TemplateNode} */
      effect2.nodes.end
    );
    removed = true;
  }
  set_signal_status(effect2, DESTROYING);
  destroy_effect_children(effect2, remove_dom && !removed);
  remove_reactions(effect2, 0);
  var transitions = effect2.nodes && effect2.nodes.t;
  if (transitions !== null) {
    for (const transition2 of transitions) {
      transition2.stop();
    }
  }
  execute_effect_teardown(effect2);
  effect2.f ^= DESTROYING;
  effect2.f |= DESTROYED;
  var parent = effect2.parent;
  if (parent !== null && parent.first !== null) {
    unlink_effect(effect2);
  }
  effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes = effect2.ac = effect2.b = null;
}
function remove_effect_dom(node, end) {
  while (node !== null) {
    var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
    node.remove();
    node = next;
  }
}
function unlink_effect(effect2) {
  var parent = effect2.parent;
  var prev = effect2.prev;
  var next = effect2.next;
  if (prev !== null) prev.next = next;
  if (next !== null) next.prev = prev;
  if (parent !== null) {
    if (parent.first === effect2) parent.first = next;
    if (parent.last === effect2) parent.last = prev;
  }
}
function pause_effect(effect2, callback, destroy = true) {
  var transitions = [];
  pause_children(effect2, transitions, true);
  var fn = () => {
    if (destroy) destroy_effect(effect2);
    if (callback) callback();
  };
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition2 of transitions) {
      transition2.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect2, transitions, local) {
  if ((effect2.f & INERT) !== 0) return;
  effect2.f ^= INERT;
  var t = effect2.nodes && effect2.nodes.t;
  if (t !== null) {
    for (const transition2 of t) {
      if (transition2.is_global || local) {
        transitions.push(transition2);
      }
    }
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    if ((child2.f & ROOT_EFFECT) === 0) {
      var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (child2.f & BRANCH_EFFECT) !== 0 && (effect2.f & BLOCK_EFFECT) !== 0;
      pause_children(child2, transitions, transparent ? local : false);
    }
    child2 = sibling2;
  }
}
function resume_effect(effect2) {
  resume_children(effect2, true);
}
function resume_children(effect2, local) {
  if ((effect2.f & INERT) === 0) return;
  effect2.f ^= INERT;
  if ((effect2.f & CLEAN) === 0) {
    set_signal_status(effect2, DIRTY);
    Batch.ensure().schedule(effect2);
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    resume_children(child2, transparent ? local : false);
    child2 = sibling2;
  }
  var t = effect2.nodes && effect2.nodes.t;
  if (t !== null) {
    for (const transition2 of t) {
      if (transition2.is_global || local) {
        transition2.in();
      }
    }
  }
}
function move_effect(effect2, fragment) {
  if (!effect2.nodes) return;
  var node = effect2.nodes.start;
  var end = effect2.nodes.end;
  while (node !== null) {
    var next = node === end ? null : /* @__PURE__ */ get_next_sibling(node);
    fragment.append(node);
    node = next;
  }
}
let captured_signals = null;
function capture_signals(fn) {
  var previous_captured_signals = captured_signals;
  try {
    captured_signals = /* @__PURE__ */ new Set();
    untrack(fn);
    if (previous_captured_signals !== null) {
      for (var signal of captured_signals) {
        previous_captured_signals.add(signal);
      }
    }
    return captured_signals;
  } finally {
    captured_signals = previous_captured_signals;
  }
}
function invalidate_inner_signals(fn) {
  for (var signal of capture_signals(fn)) {
    internal_set(signal, signal.v);
  }
}
let is_updating_effect = false;
let is_destroying_effect = false;
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
let active_reaction = null;
let untracking = false;
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
let active_effect = null;
function set_active_effect(effect2) {
  active_effect = effect2;
}
let current_sources = null;
function push_reaction_value(value) {
  if (active_reaction !== null && true) {
    if (current_sources === null) {
      current_sources = [value];
    } else {
      current_sources.push(value);
    }
  }
}
let new_deps = null;
let skipped_deps = 0;
let untracked_writes = null;
function set_untracked_writes(value) {
  untracked_writes = value;
}
let write_version = 1;
let read_version = 0;
let update_version = read_version;
function set_update_version(value) {
  update_version = value;
}
function increment_write_version() {
  return ++write_version;
}
function is_dirty(reaction) {
  var flags2 = reaction.f;
  if ((flags2 & DIRTY) !== 0) {
    return true;
  }
  if (flags2 & DERIVED) {
    reaction.f &= ~WAS_MARKED;
  }
  if ((flags2 & MAYBE_DIRTY) !== 0) {
    var dependencies = (
      /** @type {Value[]} */
      reaction.deps
    );
    var length = dependencies.length;
    for (var i = 0; i < length; i++) {
      var dependency = dependencies[i];
      if (is_dirty(
        /** @type {Derived} */
        dependency
      )) {
        update_derived(
          /** @type {Derived} */
          dependency
        );
      }
      if (dependency.wv > reaction.wv) {
        return true;
      }
    }
    if ((flags2 & CONNECTED) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    batch_values === null) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function schedule_possible_effect_self_invalidation(signal, effect2, root2 = true) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  if (current_sources !== null && includes.call(current_sources, signal)) {
    return;
  }
  for (var i = 0; i < reactions.length; i++) {
    var reaction = reactions[i];
    if ((reaction.f & DERIVED) !== 0) {
      schedule_possible_effect_self_invalidation(
        /** @type {Derived} */
        reaction,
        effect2,
        false
      );
    } else if (effect2 === reaction) {
      if (root2) {
        set_signal_status(reaction, DIRTY);
      } else if ((reaction.f & CLEAN) !== 0) {
        set_signal_status(reaction, MAYBE_DIRTY);
      }
      schedule_effect(
        /** @type {Effect} */
        reaction
      );
    }
  }
}
function update_reaction(reaction) {
  var _a2;
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_sources = current_sources;
  var previous_component_context = component_context;
  var previous_untracking = untracking;
  var previous_update_version = update_version;
  var flags2 = reaction.f;
  new_deps = /** @type {null | Value[]} */
  null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  current_sources = null;
  set_component_context(reaction.ctx);
  untracking = false;
  update_version = ++read_version;
  if (reaction.ac !== null) {
    without_reactive_context(() => {
      reaction.ac.abort(STALE_REACTION);
    });
    reaction.ac = null;
  }
  try {
    reaction.f |= REACTION_IS_UPDATING;
    var fn = (
      /** @type {Function} */
      reaction.fn
    );
    var result = fn();
    reaction.f |= REACTION_RAN;
    var deps = reaction.deps;
    var is_fork = current_batch == null ? void 0 : current_batch.is_fork;
    if (new_deps !== null) {
      var i;
      if (!is_fork) {
        remove_reactions(reaction, skipped_deps);
      }
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) {
          deps[skipped_deps + i] = new_deps[i];
        }
      } else {
        reaction.deps = deps = new_deps;
      }
      if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
        for (i = skipped_deps; i < deps.length; i++) {
          ((_a2 = deps[i]).reactions ?? (_a2.reactions = [])).push(reaction);
        }
      }
    } else if (!is_fork && deps !== null && skipped_deps < deps.length) {
      remove_reactions(reaction, skipped_deps);
      deps.length = skipped_deps;
    }
    if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
      for (i = 0; i < /** @type {Source[]} */
      untracked_writes.length; i++) {
        schedule_possible_effect_self_invalidation(
          untracked_writes[i],
          /** @type {Effect} */
          reaction
        );
      }
    }
    if (previous_reaction !== null && previous_reaction !== reaction) {
      read_version++;
      if (previous_reaction.deps !== null) {
        for (let i2 = 0; i2 < previous_skipped_deps; i2 += 1) {
          previous_reaction.deps[i2].rv = read_version;
        }
      }
      if (previous_deps !== null) {
        for (const dep of previous_deps) {
          dep.rv = read_version;
        }
      }
      if (untracked_writes !== null) {
        if (previous_untracked_writes === null) {
          previous_untracked_writes = untracked_writes;
        } else {
          previous_untracked_writes.push(.../** @type {Source[]} */
          untracked_writes);
        }
      }
    }
    if ((reaction.f & ERROR_VALUE) !== 0) {
      reaction.f ^= ERROR_VALUE;
    }
    return result;
  } catch (error) {
    return handle_error(error);
  } finally {
    reaction.f ^= REACTION_IS_UPDATING;
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    current_sources = previous_sources;
    set_component_context(previous_component_context);
    untracking = previous_untracking;
    update_version = previous_update_version;
  }
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index2 = index_of.call(reactions, signal);
    if (index2 !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) {
        reactions = dependency.reactions = null;
      } else {
        reactions[index2] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !includes.call(new_deps, dependency))) {
    var derived2 = (
      /** @type {Derived} */
      dependency
    );
    if ((derived2.f & CONNECTED) !== 0) {
      derived2.f ^= CONNECTED;
      derived2.f &= ~WAS_MARKED;
    }
    if (derived2.v !== UNINITIALIZED) {
      update_derived_status(derived2);
    }
    freeze_derived_effects(derived2);
    remove_reactions(derived2, 0);
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null) return;
  for (var i = start_index; i < dependencies.length; i++) {
    remove_reaction(signal, dependencies[i]);
  }
}
function update_effect(effect2) {
  var flags2 = effect2.f;
  if ((flags2 & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var previous_effect = active_effect;
  var was_updating_effect = is_updating_effect;
  active_effect = effect2;
  is_updating_effect = true;
  try {
    if ((flags2 & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
      destroy_block_effect_children(effect2);
    } else {
      destroy_effect_children(effect2);
    }
    execute_effect_teardown(effect2);
    var teardown2 = update_reaction(effect2);
    effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
    effect2.wv = write_version;
    var dep;
    if (DEV && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && effect2.deps !== null) ;
  } finally {
    is_updating_effect = was_updating_effect;
    active_effect = previous_effect;
  }
}
async function tick() {
  await Promise.resolve();
  flushSync();
}
function get(signal) {
  var flags2 = signal.f;
  var is_derived = (flags2 & DERIVED) !== 0;
  captured_signals == null ? void 0 : captured_signals.add(signal);
  if (active_reaction !== null && !untracking) {
    var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
    if (!destroyed && (current_sources === null || !includes.call(current_sources, signal))) {
      var deps = active_reaction.deps;
      if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
        if (signal.rv < read_version) {
          signal.rv = read_version;
          if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
            skipped_deps++;
          } else if (new_deps === null) {
            new_deps = [signal];
          } else {
            new_deps.push(signal);
          }
        }
      } else {
        (active_reaction.deps ?? (active_reaction.deps = [])).push(signal);
        var reactions = signal.reactions;
        if (reactions === null) {
          signal.reactions = [active_reaction];
        } else if (!includes.call(reactions, active_reaction)) {
          reactions.push(active_reaction);
        }
      }
    }
  }
  if (is_destroying_effect && old_values.has(signal)) {
    return old_values.get(signal);
  }
  if (is_derived) {
    var derived2 = (
      /** @type {Derived} */
      signal
    );
    if (is_destroying_effect) {
      var value = derived2.v;
      if ((derived2.f & CLEAN) === 0 && derived2.reactions !== null || depends_on_old_values(derived2)) {
        value = execute_derived(derived2);
      }
      old_values.set(derived2, value);
      return value;
    }
    var should_connect = (derived2.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & CONNECTED) !== 0);
    var is_new = (derived2.f & REACTION_RAN) === 0;
    if (is_dirty(derived2)) {
      if (should_connect) {
        derived2.f |= CONNECTED;
      }
      update_derived(derived2);
    }
    if (should_connect && !is_new) {
      unfreeze_derived_effects(derived2);
      reconnect(derived2);
    }
  }
  if (batch_values == null ? void 0 : batch_values.has(signal)) {
    return batch_values.get(signal);
  }
  if ((signal.f & ERROR_VALUE) !== 0) {
    throw signal.v;
  }
  return signal.v;
}
function reconnect(derived2) {
  derived2.f |= CONNECTED;
  if (derived2.deps === null) return;
  for (const dep of derived2.deps) {
    (dep.reactions ?? (dep.reactions = [])).push(derived2);
    if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
      unfreeze_derived_effects(
        /** @type {Derived} */
        dep
      );
      reconnect(
        /** @type {Derived} */
        dep
      );
    }
  }
}
function depends_on_old_values(derived2) {
  if (derived2.v === UNINITIALIZED) return true;
  if (derived2.deps === null) return false;
  for (const dep of derived2.deps) {
    if (old_values.has(dep)) {
      return true;
    }
    if ((dep.f & DERIVED) !== 0 && depends_on_old_values(
      /** @type {Derived} */
      dep
    )) {
      return true;
    }
  }
  return false;
}
function untrack(fn) {
  var previous_untracking = untracking;
  try {
    untracking = true;
    return fn();
  } finally {
    untracking = previous_untracking;
  }
}
function deep_read_state(value) {
  if (typeof value !== "object" || !value || value instanceof EventTarget) {
    return;
  }
  if (STATE_SYMBOL in value) {
    deep_read(value);
  } else if (!Array.isArray(value)) {
    for (let key2 in value) {
      const prop2 = value[key2];
      if (typeof prop2 === "object" && prop2 && STATE_SYMBOL in prop2) {
        deep_read(prop2);
      }
    }
  }
}
function deep_read(value, visited = /* @__PURE__ */ new Set()) {
  if (typeof value === "object" && value !== null && // We don't want to traverse DOM elements
  !(value instanceof EventTarget) && !visited.has(value)) {
    visited.add(value);
    if (value instanceof Date) {
      value.getTime();
    }
    for (let key2 in value) {
      try {
        deep_read(value[key2], visited);
      } catch (e) {
      }
    }
    const proto = get_prototype_of(value);
    if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
      const descriptors = get_descriptors(proto);
      for (let key2 in descriptors) {
        const get2 = descriptors[key2].get;
        if (get2) {
          try {
            get2.call(value);
          } catch (e) {
          }
        }
      }
    }
  }
}
function is_capture_event(name) {
  return name.endsWith("capture") && name !== "gotpointercapture" && name !== "lostpointercapture";
}
const DELEGATED_EVENTS = [
  "beforeinput",
  "click",
  "change",
  "dblclick",
  "contextmenu",
  "focusin",
  "focusout",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pointerdown",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "touchend",
  "touchmove",
  "touchstart"
];
function can_delegate_event(event_name) {
  return DELEGATED_EVENTS.includes(event_name);
}
const ATTRIBUTE_ALIASES = {
  // no `class: 'className'` because we handle that separately
  formnovalidate: "formNoValidate",
  ismap: "isMap",
  nomodule: "noModule",
  playsinline: "playsInline",
  readonly: "readOnly",
  defaultvalue: "defaultValue",
  defaultchecked: "defaultChecked",
  srcobject: "srcObject",
  novalidate: "noValidate",
  allowfullscreen: "allowFullscreen",
  disablepictureinpicture: "disablePictureInPicture",
  disableremoteplayback: "disableRemotePlayback"
};
function normalize_attribute(name) {
  name = name.toLowerCase();
  return ATTRIBUTE_ALIASES[name] ?? name;
}
const PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}
const event_symbol = Symbol("events");
const all_registered_events = /* @__PURE__ */ new Set();
const root_event_handles = /* @__PURE__ */ new Set();
function create_event(event_name, dom, handler, options = {}) {
  function target_handler(event2) {
    if (!options.capture) {
      handle_event_propagation.call(dom, event2);
    }
    if (!event2.cancelBubble) {
      return without_reactive_context(() => {
        return handler == null ? void 0 : handler.call(this, event2);
      });
    }
  }
  if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
    queue_micro_task(() => {
      dom.addEventListener(event_name, target_handler, options);
    });
  } else {
    dom.addEventListener(event_name, target_handler, options);
  }
  return target_handler;
}
function event(event_name, dom, handler, capture2, passive) {
  var options = { capture: capture2, passive };
  var target_handler = create_event(event_name, dom, handler, options);
  if (dom === document.body || // @ts-ignore
  dom === window || // @ts-ignore
  dom === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  dom instanceof HTMLMediaElement) {
    teardown(() => {
      dom.removeEventListener(event_name, target_handler, options);
    });
  }
}
function delegated(event_name, element2, handler) {
  (element2[event_symbol] ?? (element2[event_symbol] = {}))[event_name] = handler;
}
function delegate(events) {
  for (var i = 0; i < events.length; i++) {
    all_registered_events.add(events[i]);
  }
  for (var fn of root_event_handles) {
    fn(events);
  }
}
let last_propagated_event = null;
function handle_event_propagation(event2) {
  var _a2, _b2;
  var handler_element = this;
  var owner_document = (
    /** @type {Node} */
    handler_element.ownerDocument
  );
  var event_name = event2.type;
  var path = ((_a2 = event2.composedPath) == null ? void 0 : _a2.call(event2)) || [];
  var current_target = (
    /** @type {null | Element} */
    path[0] || event2.target
  );
  last_propagated_event = event2;
  var path_idx = 0;
  var handled_at = last_propagated_event === event2 && event2[event_symbol];
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2[event_symbol] = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx;
    }
  }
  current_target = /** @type {Element} */
  path[path_idx] || event2.target;
  if (current_target === handler_element) return;
  define_property(event2, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
      current_target.host || null;
      try {
        var delegated2 = (_b2 = current_target[event_symbol]) == null ? void 0 : _b2[event_name];
        if (delegated2 != null && (!/** @type {any} */
        current_target.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
        // -> the target could not have been disabled because it emits the event in the first place
        event2.target === current_target)) {
          delegated2.call(current_target, event2);
        }
      } catch (error) {
        if (throw_error) {
          other_errors.push(error);
        } else {
          throw_error = error;
        }
      }
      if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
        break;
      }
      current_target = parent_element;
    }
    if (throw_error) {
      for (let error of other_errors) {
        queueMicrotask(() => {
          throw error;
        });
      }
      throw throw_error;
    }
  } finally {
    event2[event_symbol] = handler_element;
    delete event2.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
const policy = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  ((_b = globalThis == null ? void 0 : globalThis.window) == null ? void 0 : _b.trustedTypes) && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (html) => {
      return html;
    }
  })
);
function create_trusted_html(html) {
  return (
    /** @type {string} */
    (policy == null ? void 0 : policy.createHTML(html)) ?? html
  );
}
function create_fragment_from_html(html) {
  var elem = create_element("template");
  elem.innerHTML = create_trusted_html(html.replaceAll("<!>", "<!---->"));
  return elem.content;
}
function assign_nodes(start, end) {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  if (effect2.nodes === null) {
    effect2.nodes = { start, end, a: null, t: null };
  }
}
// @__NO_SIDE_EFFECTS__
function from_html(content, flags2) {
  var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      if (!is_fragment) node = /** @type {TemplateNode} */
      /* @__PURE__ */ get_first_child(node);
    }
    var clone = (
      /** @type {TemplateNode} */
      use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
    );
    if (is_fragment) {
      var start = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(clone)
      );
      var end = (
        /** @type {TemplateNode} */
        clone.lastChild
      );
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
// @__NO_SIDE_EFFECTS__
function from_namespace(content, flags2, ns = "svg") {
  var has_start = !content.startsWith("<!>");
  var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
  var wrapped = `<${ns}>${has_start ? content : "<!>" + content}</${ns}>`;
  var node;
  return () => {
    if (!node) {
      var fragment = (
        /** @type {DocumentFragment} */
        create_fragment_from_html(wrapped)
      );
      var root2 = (
        /** @type {Element} */
        /* @__PURE__ */ get_first_child(fragment)
      );
      if (is_fragment) {
        node = document.createDocumentFragment();
        while (/* @__PURE__ */ get_first_child(root2)) {
          node.appendChild(
            /** @type {TemplateNode} */
            /* @__PURE__ */ get_first_child(root2)
          );
        }
      } else {
        node = /** @type {Element} */
        /* @__PURE__ */ get_first_child(root2);
      }
    }
    var clone = (
      /** @type {TemplateNode} */
      node.cloneNode(true)
    );
    if (is_fragment) {
      var start = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_first_child(clone)
      );
      var end = (
        /** @type {TemplateNode} */
        clone.lastChild
      );
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
// @__NO_SIDE_EFFECTS__
function from_svg(content, flags2) {
  return /* @__PURE__ */ from_namespace(content, flags2, "svg");
}
function text(value = "") {
  {
    var t = create_text(value + "");
    assign_nodes(t, t);
    return t;
  }
}
function comment() {
  var frag = document.createDocumentFragment();
  var start = document.createComment("");
  var anchor = create_text();
  frag.append(start, anchor);
  assign_nodes(start, anchor);
  return frag;
}
function append(anchor, dom) {
  if (anchor === null) {
    return;
  }
  anchor.before(
    /** @type {Node} */
    dom
  );
}
let should_intro = true;
function set_should_intro(value) {
  should_intro = value;
}
function set_text(text2, value) {
  var str = value == null ? "" : typeof value === "object" ? `${value}` : value;
  if (str !== (text2.__t ?? (text2.__t = text2.nodeValue))) {
    text2.__t = str;
    text2.nodeValue = `${str}`;
  }
}
function mount(component2, options) {
  return _mount(component2, options);
}
const listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
  init_operations();
  var component2 = void 0;
  var unmount = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    boundary(
      /** @type {TemplateNode} */
      anchor_node,
      {
        pending: () => {
        }
      },
      (anchor_node2) => {
        push({});
        var ctx = (
          /** @type {ComponentContext} */
          component_context
        );
        if (context) ctx.c = context;
        if (events) {
          props.$$events = events;
        }
        should_intro = intro;
        component2 = Component(anchor_node2, props) || {};
        should_intro = true;
        pop();
      },
      transformError
    );
    var registered_events = /* @__PURE__ */ new Set();
    var event_handle = (events2) => {
      for (var i = 0; i < events2.length; i++) {
        var event_name = events2[i];
        if (registered_events.has(event_name)) continue;
        registered_events.add(event_name);
        var passive = is_passive_event(event_name);
        for (const node of [target, document]) {
          var counts = listeners.get(node);
          if (counts === void 0) {
            counts = /* @__PURE__ */ new Map();
            listeners.set(node, counts);
          }
          var count = counts.get(event_name);
          if (count === void 0) {
            node.addEventListener(event_name, handle_event_propagation, { passive });
            counts.set(event_name, 1);
          } else {
            counts.set(event_name, count + 1);
          }
        }
      }
    };
    event_handle(array_from(all_registered_events));
    root_event_handles.add(event_handle);
    return () => {
      var _a2;
      for (var event_name of registered_events) {
        for (const node of [target, document]) {
          var counts = (
            /** @type {Map<string, number>} */
            listeners.get(node)
          );
          var count = (
            /** @type {number} */
            counts.get(event_name)
          );
          if (--count == 0) {
            node.removeEventListener(event_name, handle_event_propagation);
            counts.delete(event_name);
            if (counts.size === 0) {
              listeners.delete(node);
            }
          } else {
            counts.set(event_name, count);
          }
        }
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) {
        (_a2 = anchor_node.parentNode) == null ? void 0 : _a2.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component2, unmount);
  return component2;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
class BranchManager {
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(anchor, transition2 = true) {
    /** @type {TemplateNode} */
    __publicField(this, "anchor");
    /** @type {Map<Batch, Key>} */
    __privateAdd(this, _batches, /* @__PURE__ */ new Map());
    /**
     * Map of keys to effects that are currently rendered in the DOM.
     * These effects are visible and actively part of the document tree.
     * Example:
     * ```
     * {#if condition}
     * 	foo
     * {:else}
     * 	bar
     * {/if}
     * ```
     * Can result in the entries `true->Effect` and `false->Effect`
     * @type {Map<Key, Effect>}
     */
    __privateAdd(this, _onscreen, /* @__PURE__ */ new Map());
    /**
     * Similar to #onscreen with respect to the keys, but contains branches that are not yet
     * in the DOM, because their insertion is deferred.
     * @type {Map<Key, Branch>}
     */
    __privateAdd(this, _offscreen, /* @__PURE__ */ new Map());
    /**
     * Keys of effects that are currently outroing
     * @type {Set<Key>}
     */
    __privateAdd(this, _outroing, /* @__PURE__ */ new Set());
    /**
     * Whether to pause (i.e. outro) on change, or destroy immediately.
     * This is necessary for `<svelte:element>`
     */
    __privateAdd(this, _transition, true);
    /**
     * @param {Batch} batch
     */
    __privateAdd(this, _commit, (batch) => {
      if (!__privateGet(this, _batches).has(batch)) return;
      var key2 = (
        /** @type {Key} */
        __privateGet(this, _batches).get(batch)
      );
      var onscreen = __privateGet(this, _onscreen).get(key2);
      if (onscreen) {
        resume_effect(onscreen);
        __privateGet(this, _outroing).delete(key2);
      } else {
        var offscreen = __privateGet(this, _offscreen).get(key2);
        if (offscreen) {
          __privateGet(this, _onscreen).set(key2, offscreen.effect);
          __privateGet(this, _offscreen).delete(key2);
          offscreen.fragment.lastChild.remove();
          this.anchor.before(offscreen.fragment);
          onscreen = offscreen.effect;
        }
      }
      for (const [b, k] of __privateGet(this, _batches)) {
        __privateGet(this, _batches).delete(b);
        if (b === batch) {
          break;
        }
        const offscreen2 = __privateGet(this, _offscreen).get(k);
        if (offscreen2) {
          destroy_effect(offscreen2.effect);
          __privateGet(this, _offscreen).delete(k);
        }
      }
      for (const [k, effect2] of __privateGet(this, _onscreen)) {
        if (k === key2 || __privateGet(this, _outroing).has(k)) continue;
        const on_destroy = () => {
          const keys = Array.from(__privateGet(this, _batches).values());
          if (keys.includes(k)) {
            var fragment = document.createDocumentFragment();
            move_effect(effect2, fragment);
            fragment.append(create_text());
            __privateGet(this, _offscreen).set(k, { effect: effect2, fragment });
          } else {
            destroy_effect(effect2);
          }
          __privateGet(this, _outroing).delete(k);
          __privateGet(this, _onscreen).delete(k);
        };
        if (__privateGet(this, _transition) || !onscreen) {
          __privateGet(this, _outroing).add(k);
          pause_effect(effect2, on_destroy, false);
        } else {
          on_destroy();
        }
      }
    });
    /**
     * @param {Batch} batch
     */
    __privateAdd(this, _discard, (batch) => {
      __privateGet(this, _batches).delete(batch);
      const keys = Array.from(__privateGet(this, _batches).values());
      for (const [k, branch2] of __privateGet(this, _offscreen)) {
        if (!keys.includes(k)) {
          destroy_effect(branch2.effect);
          __privateGet(this, _offscreen).delete(k);
        }
      }
    });
    this.anchor = anchor;
    __privateSet(this, _transition, transition2);
  }
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(key2, fn) {
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    if (fn && !__privateGet(this, _onscreen).has(key2) && !__privateGet(this, _offscreen).has(key2)) {
      if (defer) {
        var fragment = document.createDocumentFragment();
        var target = create_text();
        fragment.append(target);
        __privateGet(this, _offscreen).set(key2, {
          effect: branch(() => fn(target)),
          fragment
        });
      } else {
        __privateGet(this, _onscreen).set(
          key2,
          branch(() => fn(this.anchor))
        );
      }
    }
    __privateGet(this, _batches).set(batch, key2);
    if (defer) {
      for (const [k, effect2] of __privateGet(this, _onscreen)) {
        if (k === key2) {
          batch.unskip_effect(effect2);
        } else {
          batch.skip_effect(effect2);
        }
      }
      for (const [k, branch2] of __privateGet(this, _offscreen)) {
        if (k === key2) {
          batch.unskip_effect(branch2.effect);
        } else {
          batch.skip_effect(branch2.effect);
        }
      }
      batch.oncommit(__privateGet(this, _commit));
      batch.ondiscard(__privateGet(this, _discard));
    } else {
      __privateGet(this, _commit).call(this, batch);
    }
  }
}
_batches = new WeakMap();
_onscreen = new WeakMap();
_offscreen = new WeakMap();
_outroing = new WeakMap();
_transition = new WeakMap();
_commit = new WeakMap();
_discard = new WeakMap();
function if_block(node, fn, elseif = false) {
  var branches = new BranchManager(node);
  var flags2 = elseif ? EFFECT_TRANSPARENT : 0;
  function update_branch(key2, fn2) {
    branches.ensure(key2, fn2);
  }
  block(() => {
    var has_branch = false;
    fn((fn2, key2 = 0) => {
      has_branch = true;
      update_branch(key2, fn2);
    });
    if (!has_branch) {
      update_branch(-1, null);
    }
  }, flags2);
}
const NAN = Symbol("NaN");
function key(node, get_key, render_fn2) {
  var branches = new BranchManager(node);
  var legacy = !is_runes();
  block(() => {
    var key2 = get_key();
    if (key2 !== key2) {
      key2 = /** @type {any} */
      NAN;
    }
    if (legacy && key2 !== null && typeof key2 === "object") {
      key2 = /** @type {V} */
      {};
    }
    branches.ensure(key2, render_fn2);
  });
}
function index(_, i) {
  return i;
}
function pause_effects(state2, to_destroy, controlled_anchor) {
  var transitions = [];
  var length = to_destroy.length;
  var group;
  var remaining = to_destroy.length;
  for (var i = 0; i < length; i++) {
    let effect2 = to_destroy[i];
    pause_effect(
      effect2,
      () => {
        if (group) {
          group.pending.delete(effect2);
          group.done.add(effect2);
          if (group.pending.size === 0) {
            var groups = (
              /** @type {Set<EachOutroGroup>} */
              state2.outrogroups
            );
            destroy_effects(state2, array_from(group.done));
            groups.delete(group);
            if (groups.size === 0) {
              state2.outrogroups = null;
            }
          }
        } else {
          remaining -= 1;
        }
      },
      false
    );
  }
  if (remaining === 0) {
    var fast_path = transitions.length === 0 && controlled_anchor !== null;
    if (fast_path) {
      var anchor = (
        /** @type {Element} */
        controlled_anchor
      );
      var parent_node = (
        /** @type {Element} */
        anchor.parentNode
      );
      clear_text_content(parent_node);
      parent_node.append(anchor);
      state2.items.clear();
    }
    destroy_effects(state2, to_destroy, !fast_path);
  } else {
    group = {
      pending: new Set(to_destroy),
      done: /* @__PURE__ */ new Set()
    };
    (state2.outrogroups ?? (state2.outrogroups = /* @__PURE__ */ new Set())).add(group);
  }
}
function destroy_effects(state2, to_destroy, remove_dom = true) {
  var preserved_effects;
  if (state2.pending.size > 0) {
    preserved_effects = /* @__PURE__ */ new Set();
    for (const keys of state2.pending.values()) {
      for (const key2 of keys) {
        preserved_effects.add(
          /** @type {EachItem} */
          state2.items.get(key2).e
        );
      }
    }
  }
  for (var i = 0; i < to_destroy.length; i++) {
    var e = to_destroy[i];
    if (preserved_effects == null ? void 0 : preserved_effects.has(e)) {
      e.f |= EFFECT_OFFSCREEN;
      const fragment = document.createDocumentFragment();
      move_effect(e, fragment);
    } else {
      destroy_effect(to_destroy[i], remove_dom);
    }
  }
}
var offscreen_anchor;
function each(node, flags2, get_collection, get_key, render_fn2, fallback_fn = null) {
  var anchor = node;
  var items = /* @__PURE__ */ new Map();
  var is_controlled = (flags2 & EACH_IS_CONTROLLED) !== 0;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      node
    );
    anchor = parent_node.appendChild(create_text());
  }
  var fallback = null;
  var each_array = /* @__PURE__ */ derived_safe_equal(() => {
    var collection = get_collection();
    return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
  });
  var array;
  var pending = /* @__PURE__ */ new Map();
  var first_run = true;
  function commit(batch) {
    if ((state2.effect.f & DESTROYED) !== 0) {
      return;
    }
    state2.pending.delete(batch);
    state2.fallback = fallback;
    reconcile(state2, array, anchor, flags2, get_key);
    if (fallback !== null) {
      if (array.length === 0) {
        if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
          resume_effect(fallback);
        } else {
          fallback.f ^= EFFECT_OFFSCREEN;
          move(fallback, null, anchor);
        }
      } else {
        pause_effect(fallback, () => {
          fallback = null;
        });
      }
    }
  }
  function discard(batch) {
    state2.pending.delete(batch);
  }
  var effect2 = block(() => {
    array = /** @type {V[]} */
    get(each_array);
    var length = array.length;
    var keys = /* @__PURE__ */ new Set();
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    for (var index2 = 0; index2 < length; index2 += 1) {
      var value = array[index2];
      var key2 = get_key(value, index2);
      var item = first_run ? null : items.get(key2);
      if (item) {
        if (item.v) internal_set(item.v, value);
        if (item.i) internal_set(item.i, index2);
        if (defer) {
          batch.unskip_effect(item.e);
        }
      } else {
        item = create_item(
          items,
          first_run ? anchor : offscreen_anchor ?? (offscreen_anchor = create_text()),
          value,
          key2,
          index2,
          render_fn2,
          flags2,
          get_collection
        );
        if (!first_run) {
          item.e.f |= EFFECT_OFFSCREEN;
        }
        items.set(key2, item);
      }
      keys.add(key2);
    }
    if (length === 0 && fallback_fn && !fallback) {
      if (first_run) {
        fallback = branch(() => fallback_fn(anchor));
      } else {
        fallback = branch(() => fallback_fn(offscreen_anchor ?? (offscreen_anchor = create_text())));
        fallback.f |= EFFECT_OFFSCREEN;
      }
    }
    if (length > keys.size) {
      {
        each_key_duplicate();
      }
    }
    if (!first_run) {
      pending.set(batch, keys);
      if (defer) {
        for (const [key3, item2] of items) {
          if (!keys.has(key3)) {
            batch.skip_effect(item2.e);
          }
        }
        batch.oncommit(commit);
        batch.ondiscard(discard);
      } else {
        commit(batch);
      }
    }
    get(each_array);
  });
  var state2 = { effect: effect2, items, pending, outrogroups: null, fallback };
  first_run = false;
}
function skip_to_branch(effect2) {
  while (effect2 !== null && (effect2.f & BRANCH_EFFECT) === 0) {
    effect2 = effect2.next;
  }
  return effect2;
}
function reconcile(state2, array, anchor, flags2, get_key) {
  var _a2, _b2, _c2, _d, _e, _f, _g, _h, _i;
  var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
  var length = array.length;
  var items = state2.items;
  var current = skip_to_branch(state2.effect.first);
  var seen;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key2;
  var effect2;
  var i;
  if (is_animated) {
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key2 = get_key(value, i);
      effect2 = /** @type {EachItem} */
      items.get(key2).e;
      if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
        (_b2 = (_a2 = effect2.nodes) == null ? void 0 : _a2.a) == null ? void 0 : _b2.measure();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).add(effect2);
      }
    }
  }
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key2 = get_key(value, i);
    effect2 = /** @type {EachItem} */
    items.get(key2).e;
    if (state2.outrogroups !== null) {
      for (const group of state2.outrogroups) {
        group.pending.delete(effect2);
        group.done.delete(effect2);
      }
    }
    if ((effect2.f & INERT) !== 0) {
      resume_effect(effect2);
      if (is_animated) {
        (_d = (_c2 = effect2.nodes) == null ? void 0 : _c2.a) == null ? void 0 : _d.unfix();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).delete(effect2);
      }
    }
    if ((effect2.f & EFFECT_OFFSCREEN) !== 0) {
      effect2.f ^= EFFECT_OFFSCREEN;
      if (effect2 === current) {
        move(effect2, null, anchor);
      } else {
        var next = prev ? prev.next : current;
        if (effect2 === state2.effect.last) {
          state2.effect.last = effect2.prev;
        }
        if (effect2.prev) effect2.prev.next = effect2.next;
        if (effect2.next) effect2.next.prev = effect2.prev;
        link(state2, prev, effect2);
        link(state2, effect2, next);
        move(effect2, next, anchor);
        prev = effect2;
        matched = [];
        stashed = [];
        current = skip_to_branch(prev.next);
        continue;
      }
    }
    if (effect2 !== current) {
      if (seen !== void 0 && seen.has(effect2)) {
        if (matched.length < stashed.length) {
          var start = stashed[0];
          var j;
          prev = start.prev;
          var a = matched[0];
          var b = matched[matched.length - 1];
          for (j = 0; j < matched.length; j += 1) {
            move(matched[j], start, anchor);
          }
          for (j = 0; j < stashed.length; j += 1) {
            seen.delete(stashed[j]);
          }
          link(state2, a.prev, b.next);
          link(state2, prev, a);
          link(state2, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen.delete(effect2);
          move(effect2, current, anchor);
          link(state2, effect2.prev, effect2.next);
          link(state2, effect2, prev === null ? state2.effect.first : prev.next);
          link(state2, prev, effect2);
          prev = effect2;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current !== effect2) {
        (seen ?? (seen = /* @__PURE__ */ new Set())).add(current);
        stashed.push(current);
        current = skip_to_branch(current.next);
      }
      if (current === null) {
        continue;
      }
    }
    if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
      matched.push(effect2);
    }
    prev = effect2;
    current = skip_to_branch(effect2.next);
  }
  if (state2.outrogroups !== null) {
    for (const group of state2.outrogroups) {
      if (group.pending.size === 0) {
        destroy_effects(state2, array_from(group.done));
        (_e = state2.outrogroups) == null ? void 0 : _e.delete(group);
      }
    }
    if (state2.outrogroups.size === 0) {
      state2.outrogroups = null;
    }
  }
  if (current !== null || seen !== void 0) {
    var to_destroy = [];
    if (seen !== void 0) {
      for (effect2 of seen) {
        if ((effect2.f & INERT) === 0) {
          to_destroy.push(effect2);
        }
      }
    }
    while (current !== null) {
      if ((current.f & INERT) === 0 && current !== state2.fallback) {
        to_destroy.push(current);
      }
      current = skip_to_branch(current.next);
    }
    var destroy_length = to_destroy.length;
    if (destroy_length > 0) {
      var controlled_anchor = (flags2 & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
      if (is_animated) {
        for (i = 0; i < destroy_length; i += 1) {
          (_g = (_f = to_destroy[i].nodes) == null ? void 0 : _f.a) == null ? void 0 : _g.measure();
        }
        for (i = 0; i < destroy_length; i += 1) {
          (_i = (_h = to_destroy[i].nodes) == null ? void 0 : _h.a) == null ? void 0 : _i.fix();
        }
      }
      pause_effects(state2, to_destroy, controlled_anchor);
    }
  }
  if (is_animated) {
    queue_micro_task(() => {
      var _a3, _b3;
      if (to_animate === void 0) return;
      for (effect2 of to_animate) {
        (_b3 = (_a3 = effect2.nodes) == null ? void 0 : _a3.a) == null ? void 0 : _b3.apply();
      }
    });
  }
}
function create_item(items, anchor, value, key2, index2, render_fn2, flags2, get_collection) {
  var v = (flags2 & EACH_ITEM_REACTIVE) !== 0 ? (flags2 & EACH_ITEM_IMMUTABLE) === 0 ? /* @__PURE__ */ mutable_source(value, false, false) : source(value) : null;
  var i = (flags2 & EACH_INDEX_REACTIVE) !== 0 ? source(index2) : null;
  return {
    v,
    i,
    e: branch(() => {
      render_fn2(anchor, v ?? value, i ?? index2, get_collection);
      return () => {
        items.delete(key2);
      };
    })
  };
}
function move(effect2, next, anchor) {
  if (!effect2.nodes) return;
  var node = effect2.nodes.start;
  var end = effect2.nodes.end;
  var dest = next && (next.f & EFFECT_OFFSCREEN) === 0 ? (
    /** @type {EffectNodes} */
    next.nodes.start
  ) : anchor;
  while (node !== null) {
    var next_node = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(node)
    );
    dest.before(node);
    if (node === end) {
      return;
    }
    node = next_node;
  }
}
function link(state2, prev, next) {
  if (prev === null) {
    state2.effect.first = next;
  } else {
    prev.next = next;
  }
  if (next === null) {
    state2.effect.last = prev;
  } else {
    next.prev = prev;
  }
}
function slot(anchor, $$props, name, slot_props, fallback_fn) {
  var _a2;
  var slot_fn = (_a2 = $$props.$$slots) == null ? void 0 : _a2[name];
  var is_interop = false;
  if (slot_fn === true) {
    slot_fn = $$props["children"];
    is_interop = true;
  }
  if (slot_fn === void 0) ;
  else {
    slot_fn(anchor, is_interop ? () => slot_props : slot_props);
  }
}
function component(node, get_component, render_fn2) {
  var branches = new BranchManager(node);
  block(() => {
    var component2 = get_component() ?? null;
    branches.ensure(component2, component2 && ((target) => render_fn2(target, component2)));
  }, EFFECT_TRANSPARENT);
}
const now = () => performance.now();
const raf = {
  // don't access requestAnimationFrame eagerly outside method
  // this allows basic testing of user code without JSDOM
  // bunder will eval and remove ternary when the user's app is built
  tick: (
    /** @param {any} _ */
    (_) => requestAnimationFrame(_)
  ),
  now: () => now(),
  tasks: /* @__PURE__ */ new Set()
};
function run_tasks() {
  const now2 = raf.now();
  raf.tasks.forEach((task) => {
    if (!task.c(now2)) {
      raf.tasks.delete(task);
      task.f();
    }
  });
  if (raf.tasks.size !== 0) {
    raf.tick(run_tasks);
  }
}
function loop(callback) {
  let task;
  if (raf.tasks.size === 0) {
    raf.tick(run_tasks);
  }
  return {
    promise: new Promise((fulfill) => {
      raf.tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      raf.tasks.delete(task);
    }
  };
}
function dispatch_event(element2, type) {
  without_reactive_context(() => {
    element2.dispatchEvent(new CustomEvent(type));
  });
}
function css_property_to_camelcase(style) {
  if (style === "float") return "cssFloat";
  if (style === "offset") return "cssOffset";
  if (style.startsWith("--")) return style;
  const parts = style.split("-");
  if (parts.length === 1) return parts[0];
  return parts[0] + parts.slice(1).map(
    /** @param {any} word */
    (word) => word[0].toUpperCase() + word.slice(1)
  ).join("");
}
function css_to_keyframe(css) {
  const keyframe = {};
  const parts = css.split(";");
  for (const part of parts) {
    const [property, value] = part.split(":");
    if (!property || value === void 0) break;
    const formatted_property = css_property_to_camelcase(property.trim());
    keyframe[formatted_property] = value.trim();
  }
  return keyframe;
}
const linear$1 = (t) => t;
function transition(flags2, element2, get_fn, get_params) {
  var _a2;
  var is_intro = (flags2 & TRANSITION_IN) !== 0;
  var is_outro = (flags2 & TRANSITION_OUT) !== 0;
  var is_both = is_intro && is_outro;
  var is_global = (flags2 & TRANSITION_GLOBAL) !== 0;
  var direction = is_both ? "both" : is_intro ? "in" : "out";
  var current_options;
  var inert = element2.inert;
  var overflow = element2.style.overflow;
  var intro;
  var outro;
  function get_options() {
    return without_reactive_context(() => {
      return current_options ?? (current_options = get_fn()(element2, (get_params == null ? void 0 : get_params()) ?? /** @type {P} */
      {}, {
        direction
      }));
    });
  }
  var transition2 = {
    is_global,
    in() {
      var _a3;
      element2.inert = inert;
      if (!is_intro) {
        outro == null ? void 0 : outro.abort();
        (_a3 = outro == null ? void 0 : outro.reset) == null ? void 0 : _a3.call(outro);
        return;
      }
      if (!is_outro) {
        intro == null ? void 0 : intro.abort();
      }
      intro = animate(
        element2,
        get_options(),
        outro,
        1,
        () => {
          dispatch_event(element2, "introstart");
        },
        () => {
          dispatch_event(element2, "introend");
          intro == null ? void 0 : intro.abort();
          intro = current_options = void 0;
          element2.style.overflow = overflow;
        }
      );
    },
    out(fn) {
      if (!is_outro) {
        fn == null ? void 0 : fn();
        current_options = void 0;
        return;
      }
      element2.inert = true;
      outro = animate(
        element2,
        get_options(),
        intro,
        0,
        () => {
          dispatch_event(element2, "outrostart");
        },
        () => {
          dispatch_event(element2, "outroend");
          fn == null ? void 0 : fn();
        }
      );
    },
    stop: () => {
      intro == null ? void 0 : intro.abort();
      outro == null ? void 0 : outro.abort();
    }
  };
  var e = (
    /** @type {Effect & { nodes: EffectNodes }} */
    active_effect
  );
  ((_a2 = e.nodes).t ?? (_a2.t = [])).push(transition2);
  if (is_intro && should_intro) {
    var run2 = is_global;
    if (!run2) {
      var block2 = (
        /** @type {Effect | null} */
        e.parent
      );
      while (block2 && (block2.f & EFFECT_TRANSPARENT) !== 0) {
        while (block2 = block2.parent) {
          if ((block2.f & BLOCK_EFFECT) !== 0) break;
        }
      }
      run2 = !block2 || (block2.f & REACTION_RAN) !== 0;
    }
    if (run2) {
      effect(() => {
        untrack(() => transition2.in());
      });
    }
  }
}
function animate(element2, options, counterpart, t2, on_begin, on_finish) {
  var is_intro = t2 === 1;
  if (is_function(options)) {
    var a;
    var aborted = false;
    queue_micro_task(() => {
      if (aborted) return;
      var o = options({ direction: is_intro ? "in" : "out" });
      a = animate(element2, o, counterpart, t2, on_begin, on_finish);
    });
    return {
      abort: () => {
        aborted = true;
        a == null ? void 0 : a.abort();
      },
      deactivate: () => a.deactivate(),
      reset: () => a.reset(),
      t: () => a.t()
    };
  }
  counterpart == null ? void 0 : counterpart.deactivate();
  if (!(options == null ? void 0 : options.duration) && !(options == null ? void 0 : options.delay)) {
    on_begin();
    on_finish();
    return {
      abort: noop,
      deactivate: noop,
      reset: noop,
      t: () => t2
    };
  }
  const { delay = 0, css, tick: tick2, easing = linear$1 } = options;
  var keyframes = [];
  if (is_intro && counterpart === void 0) {
    if (tick2) {
      tick2(0, 1);
    }
    if (css) {
      var styles = css_to_keyframe(css(0, 1));
      keyframes.push(styles, styles);
    }
  }
  var get_t = () => 1 - t2;
  var animation = element2.animate(keyframes, { duration: delay, fill: "forwards" });
  animation.onfinish = () => {
    animation.cancel();
    on_begin();
    var t1 = (counterpart == null ? void 0 : counterpart.t()) ?? 1 - t2;
    counterpart == null ? void 0 : counterpart.abort();
    var delta = t2 - t1;
    var duration = (
      /** @type {number} */
      options.duration * Math.abs(delta)
    );
    var keyframes2 = [];
    if (duration > 0) {
      var needs_overflow_hidden = false;
      if (css) {
        var n = Math.ceil(duration / (1e3 / 60));
        for (var i = 0; i <= n; i += 1) {
          var t = t1 + delta * easing(i / n);
          var styles2 = css_to_keyframe(css(t, 1 - t));
          keyframes2.push(styles2);
          needs_overflow_hidden || (needs_overflow_hidden = styles2.overflow === "hidden");
        }
      }
      if (needs_overflow_hidden) {
        element2.style.overflow = "hidden";
      }
      get_t = () => {
        var time = (
          /** @type {number} */
          /** @type {globalThis.Animation} */
          animation.currentTime
        );
        return t1 + delta * easing(time / duration);
      };
      if (tick2) {
        loop(() => {
          if (animation.playState !== "running") return false;
          var t3 = get_t();
          tick2(t3, 1 - t3);
          return true;
        });
      }
    }
    animation = element2.animate(keyframes2, { duration, fill: "forwards" });
    animation.onfinish = () => {
      get_t = () => t2;
      tick2 == null ? void 0 : tick2(t2, 1 - t2);
      on_finish();
    };
  };
  return {
    abort: () => {
      if (animation) {
        animation.cancel();
        animation.effect = null;
        animation.onfinish = noop;
      }
    },
    deactivate: () => {
      on_finish = noop;
    },
    reset: () => {
      if (t2 === 0) {
        tick2 == null ? void 0 : tick2(1, 0);
      }
    },
    t: () => get_t()
  };
}
function element(node, get_tag, is_svg, render_fn2, get_namespace, location2) {
  var element2 = null;
  var anchor = (
    /** @type {TemplateNode} */
    node
  );
  var branches = new BranchManager(anchor, false);
  block(() => {
    const next_tag = get_tag() || null;
    var ns = NAMESPACE_SVG;
    if (next_tag === null) {
      branches.ensure(null, null);
      set_should_intro(true);
      return;
    }
    branches.ensure(next_tag, (anchor2) => {
      if (next_tag) {
        element2 = create_element(next_tag, ns);
        assign_nodes(element2, element2);
        if (render_fn2) {
          var child_anchor = element2.appendChild(create_text());
          render_fn2(element2, child_anchor);
        }
        active_effect.nodes.end = element2;
        anchor2.before(element2);
      }
    });
    set_should_intro(true);
    return () => {
      if (next_tag) {
        set_should_intro(false);
      }
    };
  }, EFFECT_TRANSPARENT);
  teardown(() => {
    set_should_intro(true);
  });
}
function action(dom, action2, get_value) {
  effect(() => {
    var payload = untrack(() => action2(dom, get_value == null ? void 0 : get_value()) || {});
    if (get_value && (payload == null ? void 0 : payload.update)) {
      var inited = false;
      var prev = (
        /** @type {any} */
        {}
      );
      render_effect(() => {
        var value = get_value();
        deep_read_state(value);
        if (inited && safe_not_equal(prev, value)) {
          prev = value;
          payload.update(value);
        }
      });
      inited = true;
    }
    if (payload == null ? void 0 : payload.destroy) {
      return () => (
        /** @type {Function} */
        payload.destroy()
      );
    }
  });
}
function attach(node, get_fn) {
  var fn = void 0;
  var e;
  managed(() => {
    if (fn !== (fn = get_fn())) {
      if (e) {
        destroy_effect(e);
        e = null;
      }
      if (fn) {
        e = branch(() => {
          effect(() => (
            /** @type {(node: Element) => void} */
            fn(node)
          ));
        });
      }
    }
  });
}
function r(e) {
  var t, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx$1() {
  for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
  return n;
}
function clsx(value) {
  if (typeof value === "object") {
    return clsx$1(value);
  } else {
    return value ?? "";
  }
}
const whitespace = [..." 	\n\r\f \v\uFEFF"];
function to_class(value, hash, directives) {
  var classname = value == null ? "" : "" + value;
  if (hash) {
    classname = classname ? classname + " " + hash : hash;
  }
  if (directives) {
    for (var key2 of Object.keys(directives)) {
      if (directives[key2]) {
        classname = classname ? classname + " " + key2 : key2;
      } else if (classname.length) {
        var len = key2.length;
        var a = 0;
        while ((a = classname.indexOf(key2, a)) >= 0) {
          var b = a + len;
          if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
            classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
          } else {
            a = b;
          }
        }
      }
    }
  }
  return classname === "" ? null : classname;
}
function append_styles(styles, important = false) {
  var separator = important ? " !important;" : ";";
  var css = "";
  for (var key2 of Object.keys(styles)) {
    var value = styles[key2];
    if (value != null && value !== "") {
      css += " " + key2 + ": " + value + separator;
    }
  }
  return css;
}
function to_css_name(name) {
  if (name[0] !== "-" || name[1] !== "-") {
    return name.toLowerCase();
  }
  return name;
}
function to_style(value, styles) {
  if (styles) {
    var new_style = "";
    var normal_styles;
    var important_styles;
    if (Array.isArray(styles)) {
      normal_styles = styles[0];
      important_styles = styles[1];
    } else {
      normal_styles = styles;
    }
    if (value) {
      value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
      var in_str = false;
      var in_apo = 0;
      var in_comment = false;
      var reserved_names = [];
      if (normal_styles) {
        reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
      }
      if (important_styles) {
        reserved_names.push(...Object.keys(important_styles).map(to_css_name));
      }
      var start_index = 0;
      var name_index = -1;
      const len = value.length;
      for (var i = 0; i < len; i++) {
        var c = value[i];
        if (in_comment) {
          if (c === "/" && value[i - 1] === "*") {
            in_comment = false;
          }
        } else if (in_str) {
          if (in_str === c) {
            in_str = false;
          }
        } else if (c === "/" && value[i + 1] === "*") {
          in_comment = true;
        } else if (c === '"' || c === "'") {
          in_str = c;
        } else if (c === "(") {
          in_apo++;
        } else if (c === ")") {
          in_apo--;
        }
        if (!in_comment && in_str === false && in_apo === 0) {
          if (c === ":" && name_index === -1) {
            name_index = i;
          } else if (c === ";" || i === len - 1) {
            if (name_index !== -1) {
              var name = to_css_name(value.substring(start_index, name_index).trim());
              if (!reserved_names.includes(name)) {
                if (c !== ";") {
                  i++;
                }
                var property = value.substring(start_index, i).trim();
                new_style += " " + property + ";";
              }
            }
            start_index = i + 1;
            name_index = -1;
          }
        }
      }
    }
    if (normal_styles) {
      new_style += append_styles(normal_styles);
    }
    if (important_styles) {
      new_style += append_styles(important_styles, true);
    }
    new_style = new_style.trim();
    return new_style === "" ? null : new_style;
  }
  return value == null ? null : String(value);
}
function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
  var prev = dom.__className;
  if (prev !== value || prev === void 0) {
    var next_class_name = to_class(value, hash, next_classes);
    {
      if (next_class_name == null) {
        dom.removeAttribute("class");
      } else if (is_html) {
        dom.className = next_class_name;
      } else {
        dom.setAttribute("class", next_class_name);
      }
    }
    dom.__className = value;
  } else if (next_classes && prev_classes !== next_classes) {
    for (var key2 in next_classes) {
      var is_present = !!next_classes[key2];
      if (prev_classes == null || is_present !== !!prev_classes[key2]) {
        dom.classList.toggle(key2, is_present);
      }
    }
  }
  return next_classes;
}
function update_styles(dom, prev = {}, next, priority) {
  for (var key2 in next) {
    var value = next[key2];
    if (prev[key2] !== value) {
      if (next[key2] == null) {
        dom.style.removeProperty(key2);
      } else {
        dom.style.setProperty(key2, value, priority);
      }
    }
  }
}
function set_style(dom, value, prev_styles, next_styles) {
  var prev = dom.__style;
  if (prev !== value) {
    var next_style_attr = to_style(value, next_styles);
    {
      if (next_style_attr == null) {
        dom.removeAttribute("style");
      } else {
        dom.style.cssText = next_style_attr;
      }
    }
    dom.__style = value;
  } else if (next_styles) {
    if (Array.isArray(next_styles)) {
      update_styles(dom, prev_styles == null ? void 0 : prev_styles[0], next_styles[0]);
      update_styles(dom, prev_styles == null ? void 0 : prev_styles[1], next_styles[1], "important");
    } else {
      update_styles(dom, prev_styles, next_styles);
    }
  }
  return next_styles;
}
function select_option(select, value, mounting = false) {
  if (select.multiple) {
    if (value == void 0) {
      return;
    }
    if (!is_array(value)) {
      return select_multiple_invalid_value();
    }
    for (var option of select.options) {
      option.selected = value.includes(get_option_value(option));
    }
    return;
  }
  for (option of select.options) {
    var option_value = get_option_value(option);
    if (is(option_value, value)) {
      option.selected = true;
      return;
    }
  }
  if (!mounting || value !== void 0) {
    select.selectedIndex = -1;
  }
}
function init_select(select) {
  var observer = new MutationObserver(() => {
    select_option(select, select.__value);
  });
  observer.observe(select, {
    // Listen to option element changes
    childList: true,
    subtree: true,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: true,
    attributeFilter: ["value"]
  });
  teardown(() => {
    observer.disconnect();
  });
}
function bind_select_value(select, get2, set2 = get2) {
  var batches2 = /* @__PURE__ */ new WeakSet();
  var mounting = true;
  listen_to_event_and_reset_event(select, "change", (is_reset) => {
    var query = is_reset ? "[selected]" : ":checked";
    var value;
    if (select.multiple) {
      value = [].map.call(select.querySelectorAll(query), get_option_value);
    } else {
      var selected_option = select.querySelector(query) ?? // will fall back to first non-disabled option if no option is selected
      select.querySelector("option:not([disabled])");
      value = selected_option && get_option_value(selected_option);
    }
    set2(value);
    select.__value = value;
    if (current_batch !== null) {
      batches2.add(current_batch);
    }
  });
  effect(() => {
    var value = get2();
    if (select === document.activeElement) {
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      if (batches2.has(batch)) {
        return;
      }
    }
    select_option(select, value, mounting);
    if (mounting && value === void 0) {
      var selected_option = select.querySelector(":checked");
      if (selected_option !== null) {
        value = get_option_value(selected_option);
        set2(value);
      }
    }
    select.__value = value;
    mounting = false;
  });
  init_select(select);
}
function get_option_value(option) {
  if ("__value" in option) {
    return option.__value;
  } else {
    return option.value;
  }
}
const CLASS = Symbol("class");
const STYLE = Symbol("style");
const IS_CUSTOM_ELEMENT = Symbol("is custom element");
const IS_HTML = Symbol("is html");
const OPTION_TAG = IS_XHTML ? "option" : "OPTION";
const SELECT_TAG = IS_XHTML ? "select" : "SELECT";
const PROGRESS_TAG = IS_XHTML ? "progress" : "PROGRESS";
function set_value(element2, value) {
  var attributes = get_attributes(element2);
  if (attributes.value === (attributes.value = // treat null and undefined the same for the initial value
  value ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  element2.value === value && (value !== 0 || element2.nodeName !== PROGRESS_TAG)) {
    return;
  }
  element2.value = value ?? "";
}
function set_selected(element2, selected) {
  if (selected) {
    if (!element2.hasAttribute("selected")) {
      element2.setAttribute("selected", "");
    }
  } else {
    element2.removeAttribute("selected");
  }
}
function set_attribute(element2, attribute, value, skip_warning) {
  var attributes = get_attributes(element2);
  if (attributes[attribute] === (attributes[attribute] = value)) return;
  if (attribute === "loading") {
    element2[LOADING_ATTR_SYMBOL] = value;
  }
  if (value == null) {
    element2.removeAttribute(attribute);
  } else if (typeof value !== "string" && get_setters(element2).includes(attribute)) {
    element2[attribute] = value;
  } else {
    element2.setAttribute(attribute, value);
  }
}
function set_attributes(element2, prev, next, css_hash, should_remove_defaults = false, skip_warning = false) {
  var attributes = get_attributes(element2);
  var is_custom_element = attributes[IS_CUSTOM_ELEMENT];
  var preserve_attribute_case = !attributes[IS_HTML];
  var current = prev || {};
  var is_option_element = element2.nodeName === OPTION_TAG;
  for (var key2 in prev) {
    if (!(key2 in next)) {
      next[key2] = null;
    }
  }
  if (next.class) {
    next.class = clsx(next.class);
  } else if (next[CLASS]) {
    next.class = null;
  }
  if (next[STYLE]) {
    next.style ?? (next.style = null);
  }
  var setters = get_setters(element2);
  for (const key3 in next) {
    let value = next[key3];
    if (is_option_element && key3 === "value" && value == null) {
      element2.value = element2.__value = "";
      current[key3] = value;
      continue;
    }
    if (key3 === "class") {
      var is_html = element2.namespaceURI === "http://www.w3.org/1999/xhtml";
      set_class(element2, is_html, value, css_hash, prev == null ? void 0 : prev[CLASS], next[CLASS]);
      current[key3] = value;
      current[CLASS] = next[CLASS];
      continue;
    }
    if (key3 === "style") {
      set_style(element2, value, prev == null ? void 0 : prev[STYLE], next[STYLE]);
      current[key3] = value;
      current[STYLE] = next[STYLE];
      continue;
    }
    var prev_value = current[key3];
    if (value === prev_value && !(value === void 0 && element2.hasAttribute(key3))) {
      continue;
    }
    current[key3] = value;
    var prefix = key3[0] + key3[1];
    if (prefix === "$$") continue;
    if (prefix === "on") {
      const opts = {};
      const event_handle_key = "$$" + key3;
      let event_name = key3.slice(2);
      var is_delegated = can_delegate_event(event_name);
      if (is_capture_event(event_name)) {
        event_name = event_name.slice(0, -7);
        opts.capture = true;
      }
      if (!is_delegated && prev_value) {
        if (value != null) continue;
        element2.removeEventListener(event_name, current[event_handle_key], opts);
        current[event_handle_key] = null;
      }
      if (is_delegated) {
        delegated(event_name, element2, value);
        delegate([event_name]);
      } else if (value != null) {
        let handle2 = function(evt) {
          current[key3].call(this, evt);
        };
        var handle = handle2;
        current[event_handle_key] = create_event(event_name, element2, handle2, opts);
      }
    } else if (key3 === "style") {
      set_attribute(element2, key3, value);
    } else if (key3 === "autofocus") {
      autofocus(
        /** @type {HTMLElement} */
        element2,
        Boolean(value)
      );
    } else if (!is_custom_element && (key3 === "__value" || key3 === "value" && value != null)) {
      element2.value = element2.__value = value;
    } else if (key3 === "selected" && is_option_element) {
      set_selected(
        /** @type {HTMLOptionElement} */
        element2,
        value
      );
    } else {
      var name = key3;
      if (!preserve_attribute_case) {
        name = normalize_attribute(name);
      }
      var is_default = name === "defaultValue" || name === "defaultChecked";
      if (value == null && !is_custom_element && !is_default) {
        attributes[key3] = null;
        if (name === "value" || name === "checked") {
          let input = (
            /** @type {HTMLInputElement} */
            element2
          );
          const use_default = prev === void 0;
          if (name === "value") {
            let previous = input.defaultValue;
            input.removeAttribute(name);
            input.defaultValue = previous;
            input.value = input.__value = use_default ? previous : null;
          } else {
            let previous = input.defaultChecked;
            input.removeAttribute(name);
            input.defaultChecked = previous;
            input.checked = use_default ? previous : false;
          }
        } else {
          element2.removeAttribute(key3);
        }
      } else if (is_default || setters.includes(name) && (is_custom_element || typeof value !== "string")) {
        element2[name] = value;
        if (name in attributes) attributes[name] = UNINITIALIZED;
      } else if (typeof value !== "function") {
        set_attribute(element2, name, value);
      }
    }
  }
  return current;
}
function attribute_effect(element2, fn, sync = [], async = [], blockers = [], css_hash, should_remove_defaults = false, skip_warning = false) {
  flatten(blockers, sync, async, (values) => {
    var prev = void 0;
    var effects = {};
    var is_select = element2.nodeName === SELECT_TAG;
    var inited = false;
    managed(() => {
      var next = fn(...values.map(get));
      var current = set_attributes(
        element2,
        prev,
        next,
        css_hash,
        should_remove_defaults,
        skip_warning
      );
      if (inited && is_select && "value" in next) {
        select_option(
          /** @type {HTMLSelectElement} */
          element2,
          next.value
        );
      }
      for (let symbol of Object.getOwnPropertySymbols(effects)) {
        if (!next[symbol]) destroy_effect(effects[symbol]);
      }
      for (let symbol of Object.getOwnPropertySymbols(next)) {
        var n = next[symbol];
        if (symbol.description === ATTACHMENT_KEY && (!prev || n !== prev[symbol])) {
          if (effects[symbol]) destroy_effect(effects[symbol]);
          effects[symbol] = branch(() => attach(element2, () => n));
        }
        current[symbol] = n;
      }
      prev = current;
    });
    if (is_select) {
      var select = (
        /** @type {HTMLSelectElement} */
        element2
      );
      effect(() => {
        select_option(
          select,
          /** @type {Record<string | symbol, any>} */
          prev.value,
          true
        );
        init_select(select);
      });
    }
    inited = true;
  });
}
function get_attributes(element2) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    element2.__attributes ?? (element2.__attributes = {
      [IS_CUSTOM_ELEMENT]: element2.nodeName.includes("-"),
      [IS_HTML]: element2.namespaceURI === NAMESPACE_HTML
    })
  );
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(element2) {
  var cache_key = element2.getAttribute("is") || element2.nodeName;
  var setters = setters_cache.get(cache_key);
  if (setters) return setters;
  setters_cache.set(cache_key, setters = []);
  var descriptors;
  var proto = element2;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key2 in descriptors) {
      if (descriptors[key2].set) {
        setters.push(key2);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
}
function bind_value(input, get2, set2 = get2) {
  var batches2 = /* @__PURE__ */ new WeakSet();
  listen_to_event_and_reset_event(input, "input", async (is_reset) => {
    var value = is_reset ? input.defaultValue : input.value;
    value = is_numberlike_input(input) ? to_number(value) : value;
    set2(value);
    if (current_batch !== null) {
      batches2.add(current_batch);
    }
    await tick();
    if (value !== (value = get2())) {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      var length = input.value.length;
      input.value = value ?? "";
      if (end !== null) {
        var new_length = input.value.length;
        if (start === end && end === length && new_length > length) {
          input.selectionStart = new_length;
          input.selectionEnd = new_length;
        } else {
          input.selectionStart = start;
          input.selectionEnd = Math.min(end, new_length);
        }
      }
    }
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the updated value from the input instead.
    // If defaultValue is set, then value == defaultValue
    // TODO Svelte 6: remove input.value check and set to empty string?
    untrack(get2) == null && input.value
  ) {
    set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
    if (current_batch !== null) {
      batches2.add(current_batch);
    }
  }
  render_effect(() => {
    var value = get2();
    if (input === document.activeElement) {
      var batch = (
        /** @type {Batch} */
        current_batch
      );
      if (batches2.has(batch)) {
        return;
      }
    }
    if (is_numberlike_input(input) && value === to_number(input.value)) {
      return;
    }
    if (input.type === "date" && !value && !input.value) {
      return;
    }
    if (value !== input.value) {
      input.value = value ?? "";
    }
  });
}
function bind_checked(input, get2, set2 = get2) {
  listen_to_event_and_reset_event(input, "change", (is_reset) => {
    var value = is_reset ? input.defaultChecked : input.checked;
    set2(value);
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the update value from the input instead.
    // If defaultChecked is set, then checked == defaultChecked
    untrack(get2) == null
  ) {
    set2(input.checked);
  }
  render_effect(() => {
    var value = get2();
    input.checked = Boolean(value);
  });
}
function is_numberlike_input(input) {
  var type = input.type;
  return type === "number" || type === "range";
}
function to_number(value) {
  return value === "" ? null : +value;
}
function is_bound_this(bound_value, element_or_component) {
  return bound_value === element_or_component || (bound_value == null ? void 0 : bound_value[STATE_SYMBOL]) === element_or_component;
}
function bind_this(element_or_component = {}, update2, get_value, get_parts) {
  var component_effect = (
    /** @type {ComponentContext} */
    component_context.r
  );
  var parent = (
    /** @type {Effect} */
    active_effect
  );
  effect(() => {
    var old_parts;
    var parts;
    render_effect(() => {
      old_parts = parts;
      parts = [];
      untrack(() => {
        if (element_or_component !== get_value(...parts)) {
          update2(element_or_component, ...parts);
          if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
            update2(null, ...old_parts);
          }
        }
      });
    });
    return () => {
      let p = parent;
      while (p !== component_effect && p.parent !== null && p.parent.f & DESTROYING) {
        p = p.parent;
      }
      const teardown2 = () => {
        if (parts && is_bound_this(get_value(...parts), element_or_component)) {
          update2(null, ...parts);
        }
      };
      const original_teardown = p.teardown;
      p.teardown = () => {
        teardown2();
        original_teardown == null ? void 0 : original_teardown();
      };
    };
  });
  return element_or_component;
}
function stopPropagation(fn) {
  return function(...args) {
    var event2 = (
      /** @type {Event} */
      args[0]
    );
    event2.stopPropagation();
    return fn == null ? void 0 : fn.apply(this, args);
  };
}
function init(immutable = false) {
  const context = (
    /** @type {ComponentContextLegacy} */
    component_context
  );
  const callbacks = context.l.u;
  if (!callbacks) return;
  let props = () => deep_read_state(context.s);
  if (immutable) {
    let version = 0;
    let prev = (
      /** @type {Record<string, any>} */
      {}
    );
    const d = /* @__PURE__ */ derived(() => {
      let changed = false;
      const props2 = context.s;
      for (const key2 in props2) {
        if (props2[key2] !== prev[key2]) {
          prev[key2] = props2[key2];
          changed = true;
        }
      }
      if (changed) version++;
      return version;
    });
    props = () => get(d);
  }
  if (callbacks.b.length) {
    user_pre_effect(() => {
      observe_all(context, props);
      run_all(callbacks.b);
    });
  }
  user_effect(() => {
    const fns = untrack(() => callbacks.m.map(run));
    return () => {
      for (const fn of fns) {
        if (typeof fn === "function") {
          fn();
        }
      }
    };
  });
  if (callbacks.a.length) {
    user_effect(() => {
      observe_all(context, props);
      run_all(callbacks.a);
    });
  }
}
function observe_all(context, props) {
  if (context.l.s) {
    for (const signal of context.l.s) get(signal);
  }
  props();
}
const legacy_rest_props_handler = {
  get(target, key2) {
    if (target.exclude.includes(key2)) return;
    get(target.version);
    return key2 in target.special ? target.special[key2]() : target.props[key2];
  },
  set(target, key2, value) {
    if (!(key2 in target.special)) {
      var previous_effect = active_effect;
      try {
        set_active_effect(target.parent_effect);
        target.special[key2] = prop(
          {
            get [key2]() {
              return target.props[key2];
            }
          },
          /** @type {string} */
          key2,
          PROPS_IS_UPDATED
        );
      } finally {
        set_active_effect(previous_effect);
      }
    }
    target.special[key2](value);
    update(target.version);
    return true;
  },
  getOwnPropertyDescriptor(target, key2) {
    if (target.exclude.includes(key2)) return;
    if (key2 in target.props) {
      return {
        enumerable: true,
        configurable: true,
        value: target.props[key2]
      };
    }
  },
  deleteProperty(target, key2) {
    if (target.exclude.includes(key2)) return true;
    target.exclude.push(key2);
    update(target.version);
    return true;
  },
  has(target, key2) {
    if (target.exclude.includes(key2)) return false;
    return key2 in target.props;
  },
  ownKeys(target) {
    return Reflect.ownKeys(target.props).filter((key2) => !target.exclude.includes(key2));
  }
};
function legacy_rest_props(props, exclude) {
  return new Proxy(
    {
      props,
      exclude,
      special: {},
      version: source(0),
      // TODO this is only necessary because we need to track component
      // destruction inside `prop`, because of `bind:this`, but it
      // seems likely that we can simplify `bind:this` instead
      parent_effect: (
        /** @type {Effect} */
        active_effect
      )
    },
    legacy_rest_props_handler
  );
}
const spread_props_handler = {
  get(target, key2) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (typeof p === "object" && p !== null && key2 in p) return p[key2];
    }
  },
  set(target, key2, value) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      const desc = get_descriptor(p, key2);
      if (desc && desc.set) {
        desc.set(value);
        return true;
      }
    }
    return false;
  },
  getOwnPropertyDescriptor(target, key2) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (typeof p === "object" && p !== null && key2 in p) {
        const descriptor = get_descriptor(p, key2);
        if (descriptor && !descriptor.configurable) {
          descriptor.configurable = true;
        }
        return descriptor;
      }
    }
  },
  has(target, key2) {
    if (key2 === STATE_SYMBOL || key2 === LEGACY_PROPS) return false;
    for (let p of target.props) {
      if (is_function(p)) p = p();
      if (p != null && key2 in p) return true;
    }
    return false;
  },
  ownKeys(target) {
    const keys = [];
    for (let p of target.props) {
      if (is_function(p)) p = p();
      if (!p) continue;
      for (const key2 in p) {
        if (!keys.includes(key2)) keys.push(key2);
      }
      for (const key2 of Object.getOwnPropertySymbols(p)) {
        if (!keys.includes(key2)) keys.push(key2);
      }
    }
    return keys;
  }
};
function spread_props(...props) {
  return new Proxy({ props }, spread_props_handler);
}
function prop(props, key2, flags2, fallback) {
  var _a2;
  var runes = !legacy_mode_flag || (flags2 & PROPS_IS_RUNES) !== 0;
  var bindable = (flags2 & PROPS_IS_BINDABLE) !== 0;
  var lazy = (flags2 & PROPS_IS_LAZY_INITIAL) !== 0;
  var fallback_value = (
    /** @type {V} */
    fallback
  );
  var fallback_dirty = true;
  var get_fallback = () => {
    if (fallback_dirty) {
      fallback_dirty = false;
      fallback_value = lazy ? untrack(
        /** @type {() => V} */
        fallback
      ) : (
        /** @type {V} */
        fallback
      );
    }
    return fallback_value;
  };
  let setter;
  if (bindable) {
    var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
    setter = ((_a2 = get_descriptor(props, key2)) == null ? void 0 : _a2.set) ?? (is_entry_props && key2 in props ? (v) => props[key2] = v : void 0);
  }
  var initial_value;
  var is_store_sub = false;
  if (bindable) {
    [initial_value, is_store_sub] = capture_store_binding(() => (
      /** @type {V} */
      props[key2]
    ));
  } else {
    initial_value = /** @type {V} */
    props[key2];
  }
  if (initial_value === void 0 && fallback !== void 0) {
    initial_value = get_fallback();
    if (setter) {
      if (runes) props_invalid_value();
      setter(initial_value);
    }
  }
  var getter;
  if (runes) {
    getter = () => {
      var value = (
        /** @type {V} */
        props[key2]
      );
      if (value === void 0) return get_fallback();
      fallback_dirty = true;
      return value;
    };
  } else {
    getter = () => {
      var value = (
        /** @type {V} */
        props[key2]
      );
      if (value !== void 0) {
        fallback_value = /** @type {V} */
        void 0;
      }
      return value === void 0 ? fallback_value : value;
    };
  }
  if (runes && (flags2 & PROPS_IS_UPDATED) === 0) {
    return getter;
  }
  if (setter) {
    var legacy_parent = props.$$legacy;
    return (
      /** @type {() => V} */
      function(value, mutation) {
        if (arguments.length > 0) {
          if (!runes || !mutation || legacy_parent || is_store_sub) {
            setter(mutation ? getter() : value);
          }
          return value;
        }
        return getter();
      }
    );
  }
  var overridden = false;
  var d = ((flags2 & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
    overridden = false;
    return getter();
  });
  if (bindable) get(d);
  var parent_effect = (
    /** @type {Effect} */
    active_effect
  );
  return (
    /** @type {() => V} */
    function(value, mutation) {
      if (arguments.length > 0) {
        const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
        set(d, new_value);
        overridden = true;
        if (fallback_value !== void 0) {
          fallback_value = new_value;
        }
        return value;
      }
      if (is_destroying_effect && overridden || (parent_effect.f & DESTROYED) !== 0) {
        return d.v;
      }
      return get(d);
    }
  );
}
function onMount(fn) {
  if (component_context === null) {
    lifecycle_outside_component();
  }
  if (legacy_mode_flag && component_context.l !== null) {
    init_update_callbacks(component_context).m.push(fn);
  } else {
    user_effect(() => {
      const cleanup = untrack(fn);
      if (typeof cleanup === "function") return (
        /** @type {() => void} */
        cleanup
      );
    });
  }
}
function onDestroy(fn) {
  if (component_context === null) {
    lifecycle_outside_component();
  }
  onMount(() => () => untrack(fn));
}
function create_custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  return new CustomEvent(type, { detail, bubbles, cancelable });
}
function createEventDispatcher() {
  const active_component_context = component_context;
  if (active_component_context === null) {
    lifecycle_outside_component();
  }
  return (type, detail, options) => {
    var _a2;
    const events = (
      /** @type {Record<string, Function | Function[]>} */
      (_a2 = active_component_context.s.$$events) == null ? void 0 : _a2[
        /** @type {string} */
        type
      ]
    );
    if (events) {
      const callbacks = is_array(events) ? events.slice() : [events];
      const event2 = create_custom_event(
        /** @type {string} */
        type,
        detail,
        options
      );
      for (const fn of callbacks) {
        fn.call(active_component_context.x, event2);
      }
      return !event2.defaultPrevented;
    }
    return true;
  };
}
function init_update_callbacks(context) {
  var l = (
    /** @type {ComponentContextLegacy} */
    context.l
  );
  return l.u ?? (l.u = { a: [], b: [], m: [] });
}
const PUBLIC_VERSION = "5";
if (typeof window !== "undefined") {
  ((_c = window.__svelte ?? (window.__svelte = {})).v ?? (_c.v = /* @__PURE__ */ new Set())).add(PUBLIC_VERSION);
}
enable_legacy_mode_flag();
function getOrCreateSessionId(repoFullName) {
  const storageKey = `skygit_session_${repoFullName}`;
  let sessionId = sessionStorage.getItem(storageKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(storageKey, sessionId);
  }
  return sessionId;
}
function clearAllSessionIds() {
  const keys = Object.keys(sessionStorage);
  keys.forEach((key2) => {
    if (key2.startsWith("skygit_session_")) {
      sessionStorage.removeItem(key2);
    }
  });
}
const authStore = writable({
  isLoggedIn: false,
  token: null,
  user: null
});
function logoutUser() {
  authStore.set({
    isLoggedIn: false,
    token: null,
    user: null
  });
  localStorage.removeItem("skygit_token");
  clearAllSessionIds();
}
const currentRoute = writable("home");
const currentContent = writable(null);
const initialState = {
  phase: "idle",
  // 'streaming' | 'discover-orgs' | 'discover-repos' | 'idle'
  paused: true,
  loadedCount: 0,
  totalCount: null,
  organizations: [],
  currentOrg: null,
  userLogin: null,
  lastCompletedOrg: null
};
const syncState = writable(initialState);
const GITHUB_API_BASE_URL = "https://api.github.com";
const SKYGIT_CONFIG_REPO_NAME = "skygit-config";
function getGitHubHeaders(token, extraHeaders = {}) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    ...extraHeaders
  };
}
function encodeJsonBase64(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value, null, 2))));
}
function encodeEmptyBase64() {
  return btoa("");
}
function buildGitHubApiUrl(path) {
  return `${GITHUB_API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
function buildRepoUrl(owner, repoName) {
  return buildGitHubApiUrl(`repos/${owner}/${repoName}`);
}
function buildRepoContentsUrl(repoFullName, path = "") {
  const suffix = path ? `/${path}` : "";
  return buildGitHubApiUrl(`repos/${repoFullName}/contents${suffix}`);
}
function buildSkyGitConfigContentsUrl(username, path = "") {
  return buildRepoContentsUrl(`${username}/${SKYGIT_CONFIG_REPO_NAME}`, path);
}
function buildPersistedRepoPath(repo) {
  return `repositories/${repo.owner}-${repo.name}.json`;
}
let cachedUserPromise = null;
function createSkyGitRepoPayload() {
  return {
    name: SKYGIT_CONFIG_REPO_NAME,
    private: true,
    description: "Configuration repo for SkyGit",
    auto_init: true
  };
}
function createInitialSkyGitConfig(created = (/* @__PURE__ */ new Date()).toISOString()) {
  return {
    created,
    encryption: false,
    media: "github",
    commitPolicy: "manual"
  };
}
async function getGitHubUsername(token) {
  if (cachedUserPromise) return cachedUserPromise;
  cachedUserPromise = (async () => {
    const res = await fetch(buildGitHubApiUrl("user"), { headers: getGitHubHeaders(token) });
    if (!res.ok) {
      cachedUserPromise = null;
      throw new Error("Failed to fetch GitHub user");
    }
    const user = await res.json();
    return user.login;
  })();
  return cachedUserPromise;
}
async function checkSkyGitRepoExists(token, username) {
  const res = await fetch(buildRepoUrl(username, SKYGIT_CONFIG_REPO_NAME), {
    headers: getGitHubHeaders(token)
  });
  if (res.status === 404) {
    return false;
  }
  if (!res.ok) {
    await res.text();
    throw new Error("Error checking repo existence");
  }
  return true;
}
async function createSkyGitRepo(token) {
  const headers2 = getGitHubHeaders(token);
  const repoRes = await fetch(buildGitHubApiUrl("user/repos"), {
    method: "POST",
    headers: headers2,
    body: JSON.stringify(createSkyGitRepoPayload())
  });
  if (!repoRes.ok) {
    if (repoRes.status === 422) {
      console.warn("[SkyGit] Repo creation failed (422), assuming it exists. Fetching...");
      const userRes = await fetch(buildGitHubApiUrl("user"), { headers: headers2 });
      if (userRes.ok) {
        const user = await userRes.json();
        const existingRes = await fetch(buildRepoUrl(user.login, SKYGIT_CONFIG_REPO_NAME), { headers: headers2 });
        if (existingRes.ok) {
          return await existingRes.json();
        }
      }
    }
    const error = await repoRes.text();
    throw new Error(`Failed to create repo: ${error}`);
  }
  const repo = await repoRes.json();
  const username = repo.owner.login;
  const configBase64 = encodeJsonBase64(createInitialSkyGitConfig());
  await fetch(buildSkyGitConfigContentsUrl(username, "config.json"), {
    method: "PUT",
    headers: headers2,
    body: JSON.stringify({
      message: "Initialize SkyGit config",
      content: configBase64
    })
  });
  await fetch(buildSkyGitConfigContentsUrl(username, ".messages/.gitkeep"), {
    method: "PUT",
    headers: headers2,
    body: JSON.stringify({
      message: "Create .messages folder",
      content: encodeEmptyBase64()
    })
  });
  return repo;
}
const pendingGitHubWrites = /* @__PURE__ */ new Map();
const lastGitHubPayloads = /* @__PURE__ */ new Map();
function createRepoCommitBody(repo, content, sha = null) {
  return {
    message: `Update repo ${repo.full_name}`,
    content,
    ...sha && { sha }
  };
}
function getPendingGitHubWrite(key2) {
  return pendingGitHubWrites.get(key2);
}
function setPendingGitHubWrite(key2, promise) {
  pendingGitHubWrites.set(key2, promise);
}
function clearPendingGitHubWrite(key2) {
  pendingGitHubWrites.delete(key2);
}
function getLastGitHubPayload(key2) {
  return lastGitHubPayloads.get(key2);
}
function setLastGitHubPayload(key2, content) {
  lastGitHubPayloads.set(key2, content);
}
async function commitRepoToGitHub(token, repo, maxRetries = 2) {
  const username = await getGitHubUsername(token);
  const filePath = buildPersistedRepoPath(repo);
  const inFlight = getPendingGitHubWrite(filePath);
  if (inFlight) return inFlight;
  const headers2 = getGitHubHeaders(token, { "Content-Type": "application/json" });
  const content = encodeJsonBase64(repo);
  if (getLastGitHubPayload(filePath) === content) {
    return;
  }
  let attempts = 0;
  let lastErr = null;
  const doCommitCore = async () => {
    while (attempts <= maxRetries) {
      let sha = null;
      try {
        const checkRes = await fetch(buildSkyGitConfigContentsUrl(username, filePath), { headers: headers2 });
        if (checkRes.ok) {
          const existing = await checkRes.json();
          sha = existing.sha;
        }
      } catch (_) {
      }
      const res = await fetch(buildSkyGitConfigContentsUrl(username, filePath), {
        method: "PUT",
        headers: headers2,
        body: JSON.stringify(createRepoCommitBody(repo, content, sha)),
        keepalive: true
      });
      if (res.ok) {
        setLastGitHubPayload(filePath, content);
        return;
      }
      lastErr = await res.text();
      if (res.status === 409) {
        attempts += 1;
        continue;
      }
      break;
    }
    throw new Error(`GitHub commit failed: ${lastErr}`);
  };
  const promise = doCommitCore().finally(() => clearPendingGitHubWrite(filePath));
  setPendingGitHubWrite(filePath, promise);
  return promise;
}
function filterGitHubJsonFiles(files) {
  return files.filter((file) => file.name.endsWith(".json"));
}
function decodeGitHubJsonContent(content) {
  return JSON.parse(atob(content));
}
async function streamPersistedReposFromGitHub(token) {
  const username = await getGitHubUsername(token);
  const path = buildSkyGitConfigContentsUrl(username, "repositories");
  const headers2 = getGitHubHeaders(token);
  const res = await fetch(path, { headers: headers2 });
  if (res.status === 404) {
    syncState.update((state2) => ({
      ...state2,
      phase: "idle",
      loadedCount: 0,
      totalCount: 0,
      paused: true
    }));
    return;
  }
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to load repository list: ${error}`);
  }
  const files = await res.json();
  const jsonFiles = filterGitHubJsonFiles(files);
  syncState.update((state2) => ({
    ...state2,
    phase: "streaming",
    loadedCount: 0,
    totalCount: jsonFiles.length,
    paused: false
  }));
  for (const file of jsonFiles) {
    let paused = false;
    syncState.subscribe((state2) => paused = state2.paused)();
    if (paused) break;
    try {
      const contentRes = await fetch(file.url, { headers: headers2 });
      if (!contentRes.ok) {
        console.warn(`[SkyGit] Skipped missing repo file: ${file.name} (${contentRes.status})`);
        continue;
      }
      const meta = await contentRes.json();
      const data = decodeGitHubJsonContent(meta.content);
      syncRepoListFromGitHub([data]);
      syncState.update((state2) => ({
        ...state2,
        loadedCount: state2.loadedCount + 1
      }));
    } catch (error) {
      console.warn(`[SkyGit] Skipped malformed repo file: ${file.name}`, error);
      continue;
    }
  }
  syncState.update((state2) => ({ ...state2, phase: "idle" }));
}
async function streamPersistedConversationsFromGitHub(token) {
  const username = await getGitHubUsername(token);
  const url = buildSkyGitConfigContentsUrl(username, "conversations");
  const headers2 = getGitHubHeaders(token);
  const res = await fetch(url, { headers: headers2 });
  if (res.status === 404) return;
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to load conversations: ${error}`);
  }
  const files = await res.json();
  const jsonFiles = filterGitHubJsonFiles(files);
  const conversations2 = [];
  for (const file of jsonFiles) {
    const contentRes = await fetch(file.url, { headers: headers2 });
    if (!contentRes.ok) continue;
    const meta = await contentRes.json();
    conversations2.push(decodeGitHubJsonContent(meta.content));
  }
  return conversations2;
}
async function deleteRepoFromGitHub(token, repo) {
  const username = await getGitHubUsername(token);
  const path = buildPersistedRepoPath(repo);
  const headers2 = getGitHubHeaders(token);
  const res = await fetch(buildSkyGitConfigContentsUrl(username, path), { headers: headers2 });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Unable to locate repo file for deletion: ${err}`);
  }
  const file = await res.json();
  const deleteRes = await fetch(buildSkyGitConfigContentsUrl(username, path), {
    method: "DELETE",
    headers: headers2,
    body: JSON.stringify({
      message: `Remove repo ${repo.full_name}`,
      sha: file.sha
    })
  });
  if (!deleteRes.ok) {
    const err = await deleteRes.text();
    throw new Error(`Failed to delete repo file: ${err}`);
  }
}
async function deriveKeyFromToken(token) {
  const enc = new TextEncoder();
  const keyData = enc.encode(token);
  const hash = await crypto.subtle.digest("SHA-256", keyData);
  const key2 = await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return key2;
}
async function encryptJSON(token, data) {
  const key2 = await deriveKeyFromToken(token);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key2,
    encoded
  );
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}
async function decryptJSON(token, base64) {
  const combined = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const key2 = await deriveKeyFromToken(token);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key2,
    ciphertext
  );
  const dec = new TextDecoder();
  const text2 = dec.decode(decrypted);
  return JSON.parse(text2);
}
function createSecretsFileBody(secrets, sha = null) {
  return {
    message: "Update secrets.json",
    content: encodeJsonBase64(secrets),
    ...sha && { sha }
  };
}
function shouldStoreEncryptedCredentials(repo) {
  const credentials = repo.config.storage_info.credentials;
  return Boolean(credentials && Object.keys(credentials).length > 0);
}
async function getSecretsMap(token) {
  const username = await getGitHubUsername(token);
  const url = buildSkyGitConfigContentsUrl(username, "secrets.json");
  const res = await fetch(url, {
    headers: getGitHubHeaders(token)
  });
  if (res.status === 404) return { secrets: {}, sha: null };
  const json = await res.json();
  return {
    secrets: JSON.parse(atob(json.content)),
    sha: json.sha
  };
}
async function saveSecretsMap(token, secrets, sha = null) {
  var _a2;
  const username = await getGitHubUsername(token);
  const url = buildSkyGitConfigContentsUrl(username, "secrets.json");
  if (!sha) {
    const res = await fetch(url, {
      headers: getGitHubHeaders(token)
    });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    } else if (res.status !== 404) {
      const err = await res.text();
      throw new Error(`Failed to check secrets.json: ${err}`);
    }
  }
  const saveRes = await fetch(url, {
    method: "PUT",
    headers: getGitHubHeaders(token),
    body: JSON.stringify(createSecretsFileBody(secrets, sha))
  });
  if (!saveRes.ok) {
    const err = await saveRes.text();
    throw new Error(`Failed to write secrets.json: ${err}`);
  }
  const result = await saveRes.json().catch(() => null);
  return ((_a2 = result == null ? void 0 : result.content) == null ? void 0 : _a2.sha) ?? sha ?? null;
}
async function storeEncryptedCredentials(token, repo) {
  const url = repo.config.storage_info.url;
  const credentials = repo.config.storage_info.credentials;
  if (!shouldStoreEncryptedCredentials(repo)) {
    return;
  }
  const encrypted = await encryptJSON(token, credentials);
  const { secrets, sha } = await getSecretsMap(token);
  secrets[url] = encrypted;
  await saveSecretsMap(token, secrets, sha);
}
async function activateMessagingForRepo(token, repo) {
  const headers2 = getGitHubHeaders(token);
  const config = {
    commit_frequency_min: 1440,
    binary_storage_type: "gitfs",
    storage_info: {
      type: "gitfs",
      url: ""
    }
  };
  const configPath = `.messages/config.json`;
  const uniqueKey = `${repo.full_name}/${configPath}`;
  const base64 = encodeJsonBase64(config);
  if (getLastGitHubPayload(uniqueKey) === base64) {
    return;
  }
  const inFlight = getPendingGitHubWrite(uniqueKey);
  if (inFlight) return inFlight;
  const apiUrl = buildRepoContentsUrl(repo.full_name, configPath);
  let sha = null;
  try {
    const res = await fetch(apiUrl, { headers: headers2 });
    if (res.ok) {
      const existing = await res.json();
      sha = existing.sha;
    } else if (res.status !== 404) {
      const err = await res.text();
      throw new Error(`Failed to check if config.json exists: ${err}`);
    }
  } catch (e) {
    console.warn("Error checking for config.json", e);
  }
  const saveRes = await fetch(apiUrl, {
    method: "PUT",
    headers: headers2,
    body: JSON.stringify({
      message: "Activate messaging: add .messages/config.json",
      content: base64,
      ...sha && { sha }
      // only add sha if updating
    })
  });
  if (!saveRes.ok) {
    const err = await saveRes.text();
    throw new Error(`Failed to commit config.json: ${err}`);
  }
  repo.has_messages = true;
  repo.config = config;
  await commitRepoToGitHub(token, repo);
}
async function updateRepoMessagingConfig(token, repo) {
  const headers2 = getGitHubHeaders(token);
  const config = repo.config;
  const configPath = `.messages/config.json`;
  const uniqueKey = `${repo.full_name}/${configPath}`;
  const base64 = encodeJsonBase64(config);
  const configRes = await fetch(buildRepoContentsUrl(repo.full_name, configPath), {
    headers: headers2
  });
  let sha = null;
  if (configRes.ok) {
    const existing = await configRes.json();
    sha = existing.sha;
  }
  const commitPromise = fetch(buildRepoContentsUrl(repo.full_name, configPath), {
    method: "PUT",
    headers: headers2,
    body: JSON.stringify({
      message: `Update messaging config`,
      content: base64,
      ...sha && { sha }
    })
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to update config.json: ${err}`);
    }
    setLastGitHubPayload(uniqueKey, base64);
  }).finally(() => {
    clearPendingGitHubWrite(uniqueKey);
  });
  setPendingGitHubWrite(uniqueKey, commitPromise);
  await commitPromise;
  await queueRepoForCommit(repo);
}
const LOCAL_KEY$1 = "skygit_repos";
const COMMIT_DELAY = 5 * 60 * 1e3;
const BATCH_SIZE$1 = 10;
let commitQueue = [];
let commitTimer = null;
const saved$1 = JSON.parse(localStorage.getItem(LOCAL_KEY$1) || "[]");
const repoList = writable(saved$1);
const filteredCount = writable(0);
const selectedRepo = writable(null);
repoList.subscribe((list) => {
  localStorage.setItem(LOCAL_KEY$1, JSON.stringify(list));
});
function queueRepoForCommit(repo) {
  repoList.update((list) => {
    const idx = list.findIndex((r2) => r2.full_name === repo.full_name);
    if (idx >= 0) {
      const newList = [...list];
      newList[idx] = repo;
      return newList;
    }
    return [...list, repo];
  });
  const alreadyQueued = commitQueue.some((r2) => r2.full_name === repo.full_name);
  if (!alreadyQueued) {
    commitQueue.push(repo);
  }
  if (commitQueue.length >= BATCH_SIZE$1) {
    flushRepoCommitQueue();
    return;
  }
  if (!commitTimer) {
    commitTimer = setTimeout(flushRepoCommitQueue, COMMIT_DELAY);
  }
}
async function flushRepoCommitQueue() {
  if (commitQueue.length === 0) return;
  const token = localStorage.getItem("skygit_token");
  if (!token) return;
  const batch = [...commitQueue];
  commitQueue = [];
  clearTimeout(commitTimer);
  commitTimer = null;
  for (const repo of batch) {
    try {
      await commitRepoToGitHub(token, repo);
      console.log("[SkyGit] Repo committed:", repo.full_name);
    } catch (err) {
      console.error("[SkyGit] Failed to commit repo:", repo.full_name, err);
    }
  }
}
function syncRepoListFromGitHub(repoArray) {
  repoList.update((current) => {
    const currentMap = new Map(current.map((r2) => [r2.full_name, r2]));
    for (const repo of repoArray) {
      currentMap.set(repo.full_name, repo);
    }
    const merged = Array.from(currentMap.values());
    localStorage.setItem("skygit_repos", JSON.stringify(merged));
    return merged;
  });
}
function hasPendingRepoCommits() {
  return commitQueue.length > 0;
}
function getRepoByFullName(fullName) {
  let found;
  repoList.update((list) => {
    found = list.find((r2) => r2.full_name === fullName || r2.name === fullName);
    return list;
  });
  return found;
}
async function validateToken(token) {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
function saveToken(token) {
  localStorage.setItem("skygit_token", token);
}
function loadStoredToken() {
  return localStorage.getItem("skygit_token");
}
const LOCAL_KEY = "skygit_conversations";
const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
const conversations = writable(saved);
const selectedConversation = writable(null);
const filteredChatsCount = writable(0);
const committedEvents = writable(null);
conversations.subscribe((map) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
});
function setConversationsForRepo(repoFullName, list) {
  conversations.update((map) => ({
    ...map,
    [repoFullName]: list
  }));
}
function addConversation(convoMeta, repo) {
  conversations.update((map) => {
    const list = map[repo.full_name] || [];
    return {
      ...map,
      [repo.full_name]: [...list, convoMeta]
    };
  });
  if (!repo.conversations) repo.conversations = [];
  if (!repo.conversations.includes(convoMeta.id)) {
    repo.conversations.push(convoMeta.id);
  }
}
function appendMessage(convoId, repoName, message) {
  conversations.update((map) => {
    const list = map[repoName] || [];
    const updatedList = list.map((c) => {
      if (!c || typeof c !== "object") return c;
      if (c.id === convoId) {
        const existingMessages = c.messages || [];
        const isDuplicate = existingMessages.some(
          (m) => m.id && m.id === message.id || m.hash && m.hash === message.hash || m.timestamp === message.timestamp && m.sender === message.sender && m.content === message.content
        );
        if (isDuplicate) {
          console.log("[ConversationStore] Skipping duplicate message:", message.id || message.hash);
          return c;
        }
        return {
          ...c,
          messages: [...existingMessages, { pending: true, ...message }],
          updatedAt: message.timestamp || Date.now()
        };
      }
      return c;
    });
    return { ...map, [repoName]: updatedList };
  });
  selectedConversation.update((current) => {
    if ((current == null ? void 0 : current.id) === convoId && (current == null ? void 0 : current.repo) === repoName) {
      const existingMessages = current.messages || [];
      const isDuplicate = existingMessages.some(
        (m) => m.id && m.id === message.id || m.hash && m.hash === message.hash || m.timestamp === message.timestamp && m.sender === message.sender && m.content === message.content
      );
      if (isDuplicate) {
        return current;
      }
      return {
        ...current,
        messages: [...existingMessages, { pending: true, ...message }],
        updatedAt: message.timestamp || Date.now()
      };
    }
    return current;
  });
}
function appendMessages(convoId, repoName, messages) {
  if (!messages || messages.length === 0) return;
  conversations.update((map) => {
    const list = map[repoName] || [];
    const updatedList = list.map((c) => {
      if (!c || typeof c !== "object") return c;
      if (c.id === convoId) {
        const existingMessages = c.messages || [];
        const existingIds = new Set(existingMessages.map((m) => m.id).filter(Boolean));
        const existingHashes = new Set(existingMessages.map((m) => m.hash).filter(Boolean));
        const existingKeys = new Set(existingMessages.map(
          (m) => `${m.timestamp}-${m.sender}-${m.content}`
        ));
        const newMessages = messages.filter((message) => {
          const isDuplicate = message.id && existingIds.has(message.id) || message.hash && existingHashes.has(message.hash) || existingKeys.has(`${message.timestamp}-${message.sender}-${message.content}`);
          if (isDuplicate) {
            console.log("[ConversationStore] Skipping duplicate in batch:", message.id || message.hash);
          }
          return !isDuplicate;
        });
        if (newMessages.length === 0) {
          return c;
        }
        const taggedMessages = newMessages.map((msg) => ({ pending: msg.pending ?? false, ...msg }));
        const allMessages = [...existingMessages, ...taggedMessages].sort(
          (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
        );
        return {
          ...c,
          messages: allMessages,
          updatedAt: Math.max(...newMessages.map((m) => m.timestamp || Date.now()))
        };
      }
      return c;
    });
    return { ...map, [repoName]: updatedList };
  });
  selectedConversation.update((current) => {
    if ((current == null ? void 0 : current.id) === convoId && (current == null ? void 0 : current.repo) === repoName) {
      const existingMessages = current.messages || [];
      const existingIds = new Set(existingMessages.map((m) => m.id).filter(Boolean));
      const existingHashes = new Set(existingMessages.map((m) => m.hash).filter(Boolean));
      const existingKeys = new Set(existingMessages.map(
        (m) => `${m.timestamp}-${m.sender}-${m.content}`
      ));
      const newMessages = messages.filter((message) => {
        const isDuplicate = message.id && existingIds.has(message.id) || message.hash && existingHashes.has(message.hash) || existingKeys.has(`${message.timestamp}-${message.sender}-${message.content}`);
        return !isDuplicate;
      });
      if (newMessages.length === 0) {
        return current;
      }
      const taggedMessages = newMessages.map((msg) => ({ pending: msg.pending ?? false, ...msg }));
      const allMessages = [...existingMessages, ...taggedMessages].sort(
        (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
      );
      return {
        ...current,
        messages: allMessages,
        updatedAt: Math.max(...newMessages.map((m) => m.timestamp || Date.now()))
      };
    }
    return current;
  });
}
function markMessagesCommitted(convoId, repoName, messageIds) {
  if (!messageIds || messageIds.length === 0) return;
  const idSet = new Set(messageIds.filter(Boolean));
  conversations.update((map) => {
    const list = map[repoName] || [];
    const updatedList = list.map((c) => {
      if (!c || typeof c !== "object" || c.id !== convoId) return c;
      const updatedMessages = (c.messages || []).map(
        (msg) => idSet.has(msg.id) ? { ...msg, pending: false } : msg
      );
      return { ...c, messages: updatedMessages };
    });
    return { ...map, [repoName]: updatedList };
  });
  selectedConversation.update((current) => {
    if (!current || current.id !== convoId || current.repo !== repoName) return current;
    const updatedMessages = (current.messages || []).map(
      (msg) => idSet.has(msg.id) ? { ...msg, pending: false } : msg
    );
    return { ...current, messages: updatedMessages };
  });
}
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
const rnds8 = new Uint8Array(16);
function rng() {
  return crypto.getRandomValues(rnds8);
}
function v4(options, buf, offset) {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return _v4(options);
}
function _v4(options, buf, offset) {
  var _a2;
  options = options || {};
  const rnds = options.random ?? ((_a2 = options.rng) == null ? void 0 : _a2.call(options)) ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  return unsafeStringify(rnds);
}
async function discoverConversations(token, repo) {
  const headers2 = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };
  const path = `https://api.github.com/repos/${repo.full_name}/contents/.messages`;
  const res = await fetch(path, { headers: headers2 });
  if (!res.ok) return;
  const files = await res.json();
  const convoFiles = files.filter(
    (f) => f.name.includes("_") && f.name.endsWith(".json")
  );
  const convos = [];
  for (const f of convoFiles) {
    const meta = {
      name: f.name,
      path: f.path,
      repo: repo.full_name
    };
    try {
      const fileRes = await fetch(f.url, { headers: headers2 });
      if (fileRes.ok) {
        const blob = await fileRes.json();
        const decoded = JSON.parse(atob(blob.content));
        meta.id = decoded.id;
        meta.title = decoded.title;
        meta.createdAt = decoded.createdAt;
        meta.updatedAt = decoded.updatedAt || decoded.createdAt;
      } else {
        console.warn("[SkyGit] Could not load conversation file:", f.name);
        continue;
      }
    } catch (err) {
      console.warn("[SkyGit] Failed to load conversation content:", err);
      continue;
    }
    convos.push(meta);
  }
  setConversationsForRepo(repo.full_name, convos);
  repo.conversations = convos.map((c) => c.id);
  await commitRepoToGitHub(token, repo);
}
async function removeFromSkyGitConversations(token, conversation) {
  try {
    const username = (await getGitHubUsername(token)).toLowerCase();
    const safeRepo = conversation.repo.replace(/\W+/g, "_");
    const safeTitle = conversation.title.replace(/\W+/g, "_");
    const path = `conversations/${safeRepo}_${safeTitle}.json`;
    const checkRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json"
      }
    });
    if (!checkRes.ok) {
      return;
    }
    const existing = await checkRes.json();
    const sha = existing.sha;
    const deleteRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: `Remove deleted conversation ${conversation.id}`,
        sha
      })
    });
    if (!deleteRes.ok) {
      const errMsg = await deleteRes.text();
      console.warn(`[SkyGit] Failed to remove conversation from skygit-config: ${deleteRes.status} ${errMsg}`);
    }
  } catch (error) {
    console.warn("[SkyGit] Error removing conversation from skygit-config:", error);
  }
}
async function commitToSkyGitConversations(token, conversation, usernameOverride = null) {
  const username = (usernameOverride || await getGitHubUsername(token)).toLowerCase();
  const safeRepo = conversation.repo.replace(/\W+/g, "_");
  const safeTitle = conversation.title.replace(/\W+/g, "_");
  const path = `conversations/${safeRepo}_${safeTitle}.json`;
  const sanitized = {
    ...conversation,
    messages: (conversation.messages || []).map(({ pending, ...rest }) => rest)
  };
  const content = btoa(JSON.stringify(sanitized, null, 2));
  let sha = null;
  try {
    const checkRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json"
      }
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch (_) {
  }
  const body = {
    message: `Add conversation ${conversation.id}`,
    content,
    ...sha && { sha }
  };
  const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify(body),
    keepalive: true
  });
  if (!res.ok) {
    const errMsg = await res.text();
    throw new Error(`[SkyGit] Failed to commit to skygit-config: ${res.status} ${errMsg}`);
  }
}
async function createConversation(token, repo, title) {
  (await getGitHubUsername(token)).toLowerCase();
  const id = v4();
  const safeRepo = repo.full_name.replace(/[\/\\]/g, "_").replace(/\W+/g, "_");
  const safeTitle = title.replace(/\W+/g, "_");
  let filename = `${safeRepo}_${safeTitle}.json`;
  let path = `.messages/${filename}`;
  let counter = 1;
  while (true) {
    try {
      const checkRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json"
        }
      });
      if (checkRes.ok) {
        const existing = await checkRes.json();
        const existingContent = JSON.parse(atob(existing.content));
        if (existingContent.id !== id) {
          filename = `${safeRepo}_${safeTitle}_${counter}.json`;
          path = `.messages/${filename}`;
          counter++;
          continue;
        }
      }
      break;
    } catch (_) {
      break;
    }
  }
  const content = {
    id,
    repo: repo.full_name,
    title,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    participants: [],
    messages: []
  };
  const base64 = btoa(JSON.stringify(content));
  const res = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify({
      message: `Create new conversation ${id}`,
      content: base64
    })
  });
  if (!res.ok) {
    const errMsg = await res.text();
    throw new Error(`[SkyGit] Failed to write conversation to ${repo.full_name}: ${res.status} ${errMsg}`);
  }
  try {
    await commitToSkyGitConversations(token, content);
  } catch (err) {
    console.warn("[SkyGit] Failed to mirror conversation to skygit-config:", err);
  }
  const convoMeta = {
    id,
    name: filename,
    path,
    repo: repo.full_name,
    title
  };
  addConversation(convoMeta, repo);
}
const headers = (token) => ({
  Authorization: `token ${token}`,
  Accept: "application/vnd.github+json"
});
let cancelRequested = false;
const PERSONAL_KEY = "__personal__";
function cancelDiscovery() {
  cancelRequested = true;
  syncState.update((s) => ({ ...s, paused: true }));
}
async function discoverAllRepos(token) {
  cancelRequested = false;
  const organizations = await discoverOrganizations(token);
  for (const org of organizations) {
    if (cancelRequested) break;
    await discoverReposForOrg(token, org.id);
  }
  syncState.update((s) => ({
    ...s,
    phase: "idle",
    currentOrg: null,
    paused: true
  }));
}
async function discoverOrganizations(token) {
  cancelRequested = false;
  syncState.update((s) => ({
    ...s,
    phase: "discover-orgs",
    paused: false,
    loadedCount: 0,
    totalCount: null,
    currentOrg: null,
    lastCompletedOrg: null,
    organizations: []
  }));
  const authHeaders = headers(token);
  const userRes = await fetch("https://api.github.com/user", { headers: authHeaders });
  const user = userRes.ok ? await userRes.json() : null;
  const orgs = await fetchAllPaginated("https://api.github.com/user/orgs", authHeaders);
  const organizations = [];
  if (user == null ? void 0 : user.login) {
    organizations.push({
      id: PERSONAL_KEY,
      login: user.login,
      type: "user",
      label: `${user.login} (personal)`,
      avatar_url: user.avatar_url
    });
  }
  for (const org of orgs) {
    organizations.push({
      id: org.login,
      login: org.login,
      type: "org",
      label: org.login,
      avatar_url: org.avatar_url
    });
  }
  syncState.update((s) => ({
    ...s,
    phase: "discover-orgs",
    organizations,
    userLogin: (user == null ? void 0 : user.login) ?? s.userLogin
  }));
  return organizations;
}
async function discoverReposForOrg(token, orgId) {
  cancelRequested = false;
  const state2 = get$1(syncState);
  const target = state2.organizations.find((org) => org.id === orgId || org.login === orgId);
  if (!target) {
    console.warn("[SkyGit] Requested discovery for unknown organization:", orgId);
    return;
  }
  syncState.update((s) => ({
    ...s,
    phase: "discover-repos",
    paused: false,
    loadedCount: 0,
    totalCount: null,
    currentOrg: target.id
  }));
  const authHeaders = headers(token);
  let repos;
  if (target.type === "user") {
    repos = await fetchAllPaginated("https://api.github.com/user/repos", authHeaders);
    repos = repos.filter((repo) => {
      var _a2;
      return ((_a2 = repo.owner) == null ? void 0 : _a2.login) === state2.userLogin;
    });
  } else {
    repos = await fetchAllPaginated(`https://api.github.com/orgs/${target.login}/repos`, authHeaders);
  }
  syncState.update((s) => ({
    ...s,
    totalCount: repos.length
  }));
  const seen = /* @__PURE__ */ new Set();
  for (const repo of repos) {
    if (cancelRequested) break;
    const fullName = repo.full_name;
    if (seen.has(fullName)) {
      syncState.update((s) => ({ ...s, loadedCount: s.loadedCount + 1 }));
      continue;
    }
    seen.add(fullName);
    const hasMessages = await checkMessagesDirectory(token, fullName);
    const enrichedRepo = {
      name: repo.name,
      owner: repo.owner.login,
      full_name: fullName,
      url: repo.html_url,
      private: repo.private,
      has_messages: hasMessages,
      config: null
    };
    if (enrichedRepo.has_messages) {
      try {
        const configRes = await fetch(
          `https://api.github.com/repos/${fullName}/contents/.messages/config.json`,
          { headers: authHeaders }
        );
        if (configRes.ok) {
          const cfg = await configRes.json();
          enrichedRepo.config = JSON.parse(atob(cfg.content));
        }
      } catch (e) {
        console.warn(`[SkyGit] Invalid config.json in ${fullName}`, e);
      }
      await discoverConversations(token, enrichedRepo);
    }
    syncState.update((s) => ({
      ...s,
      loadedCount: s.loadedCount + 1
    }));
    queueRepoForCommit(enrichedRepo);
  }
  try {
    await flushRepoCommitQueue();
  } catch (e) {
    console.warn("[SkyGit] Failed to flush repo commit queue:", e);
  }
  syncState.update((s) => ({
    ...s,
    phase: "discover-orgs",
    paused: true,
    loadedCount: 0,
    totalCount: null,
    currentOrg: null,
    lastCompletedOrg: target.label || target.login
  }));
}
async function fetchAllPaginated(url, headers2) {
  let results = [];
  let page = 1;
  let done = false;
  while (!done) {
    const res = await fetch(`${url}?per_page=100&page=${page}`, { headers: headers2 });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      results = results.concat(data);
      done = data.length < 100;
      page++;
    } else {
      done = true;
    }
  }
  return results;
}
async function checkMessagesDirectory(token, fullName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}/contents/.messages`, {
      headers: headers(token)
    });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}
const settingsStore = writable({
  config: null,
  secrets: {},
  decrypted: {},
  encryptedSecrets: {},
  secretsSha: null,
  cleanupMode: false
});
async function initializeStartupState(token) {
  const username = await getGitHubUsername(token);
  const headers2 = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };
  const settings = {
    config: null,
    secrets: {},
    decrypted: {},
    encryptedSecrets: {},
    secretsSha: null,
    cleanupMode: localStorage.getItem("skygit_cleanup_mode") === "true"
  };
  try {
    const localConvos = JSON.parse(localStorage.getItem("skygit_conversations") || "{}");
    for (const repoName in localConvos) {
      setConversationsForRepo(repoName, localConvos[repoName]);
    }
  } catch (e) {
    console.warn("[SkyGit] Failed to load local conversations:", e);
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/config.json`, { headers: headers2 });
    if (res.ok) {
      const file = await res.json();
      settings.config = JSON.parse(atob(file.content));
    } else if (res.status !== 404) {
      console.warn("[SkyGit] Failed to load config.json:", await res.text());
    }
  } catch (e) {
    console.warn("[SkyGit] Error loading config.json:", e);
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/secrets.json`, { headers: headers2 });
    if (res.ok) {
      const file = await res.json();
      try {
        const plaintext = JSON.parse(atob(file.content));
        const decrypted = {};
        for (const [url, encrypted] of Object.entries(plaintext)) {
          try {
            decrypted[url] = await decryptJSON(token, encrypted);
          } catch (err) {
            console.warn(`[SkyGit] Failed to decrypt secret for ${url}:`, err);
          }
        }
        settings.encryptedSecrets = plaintext;
        settings.decrypted = decrypted;
        settings.secrets = decrypted;
        settings.secretsSha = file.sha;
      } catch (decryptErr) {
        console.warn("[SkyGit] Failed to parse or decrypt secrets.json:", decryptErr);
        console.warn("[SkyGit] Content preview:", file.content.slice(0, 50));
        settings.encryptedSecrets = {};
        settings.decrypted = {};
        settings.secrets = {};
        settings.secretsSha = file.sha;
      }
    } else if (res.status === 404) {
      settings.encryptedSecrets = {};
      settings.decrypted = {};
      settings.secrets = {};
      settings.secretsSha = null;
    } else {
      console.warn("[SkyGit] Failed to load secrets.json:", await res.text());
    }
  } catch (e) {
    console.warn("[SkyGit] Error loading secrets.json:", e);
  }
  settingsStore.set(settings);
  try {
    await streamPersistedReposFromGitHub(token);
  } catch (e) {
    console.warn("[SkyGit] Failed to stream repos:", e);
  }
  try {
    const conversations2 = await streamPersistedConversationsFromGitHub(token) || [];
    const grouped = {};
    const invalidConversations = [];
    for (const convo of conversations2) {
      const [owner, repo] = convo.repo.split("/");
      const safeRepo = convo.repo.replace(/\W+/g, "_");
      const safeTitle = convo.title.replace(/\W+/g, "_");
      const conversationPath = `.messages/${safeRepo}_${safeTitle}.json`;
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${conversationPath}`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github+json"
          }
        });
        if (checkRes.status === 404) {
          invalidConversations.push(convo);
          continue;
        }
      } catch (error) {
        console.warn(`[SkyGit] Error checking conversation ${convo.title} in ${convo.repo}:`, error);
      }
      if (!grouped[convo.repo]) grouped[convo.repo] = [];
      grouped[convo.repo].push({
        id: convo.id,
        title: convo.title,
        name: `${convo.repo.replace(/\W+/g, "_")}_${convo.title.replace(/\W+/g, "_")}.json`,
        path: `.messages/${convo.repo.replace(/\W+/g, "_")}_${convo.title.replace(/\W+/g, "_")}.json`,
        repo: convo.repo
      });
    }
    for (const invalidConvo of invalidConversations) {
      try {
        await removeFromSkyGitConversations(token, invalidConvo);
      } catch (error) {
        console.warn(`[SkyGit] Failed to remove invalid conversation ${invalidConvo.title}:`, error);
      }
    }
    for (const repoName in grouped) {
      setConversationsForRepo(repoName, grouped[repoName]);
    }
  } catch (e) {
    console.warn("[SkyGit] Failed to stream conversations:", e);
  }
}
const QUEUE_STORAGE_KEY = "skygit_commit_queue";
let savedQueue = [];
try {
  savedQueue = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) || "[]");
} catch (e) {
  console.warn("[SkyGit] Failed to load commit queue from storage:", e);
}
let queue = new Set(savedQueue);
let timers = /* @__PURE__ */ new Map();
const BATCH_SIZE = 10;
function saveQueue() {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(Array.from(queue)));
  } catch (e) {
    console.warn("[SkyGit] Failed to save commit queue to storage:", e);
  }
}
function queueConversationForCommit(repoName, convoId) {
  const key2 = `${repoName}::${convoId}`;
  if (!queue.has(key2)) {
    queue.add(key2);
    saveQueue();
  }
  if (queue.size >= BATCH_SIZE) {
    flushConversationCommitQueue();
    return;
  }
  const delay = getCommitDelayForRepo(repoName);
  if (!timers.has(key2)) {
    const timer = setTimeout(() => {
      flushConversationCommitQueue([key2]);
      timers.delete(key2);
    }, delay);
    timers.set(key2, timer);
  }
}
function getCommitDelayForRepo(repoName) {
  var _a2;
  const repos = get$1(repoList);
  const repo = repos.find((r2) => r2.full_name === repoName);
  const mins = ((_a2 = repo == null ? void 0 : repo.config) == null ? void 0 : _a2.commit_frequency_min) ?? 5;
  return mins * 60 * 1e3;
}
async function flushConversationCommitQueue(specificKeys = null) {
  var _a2;
  const keysToProcess = specificKeys || Array.from(queue);
  if (keysToProcess.length === 0) return;
  const token = localStorage.getItem("skygit_token");
  if (!token) return;
  const auth = get$1(authStore);
  const username = ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login) || await getGitHubUsername(token);
  const convoMap = get$1(conversations);
  for (const key2 of keysToProcess) {
    const timer = timers.get(key2);
    if (timer) {
      clearTimeout(timer);
      timers.delete(key2);
    }
    const [repoName, convoId] = key2.split("::");
    const convos = convoMap[repoName] || [];
    const convoMeta = convos.find((c) => c.id === convoId);
    if (!convoMeta || !convoMeta.messages || convoMeta.messages.length === 0) {
      console.warn("[SkyGit] Skipped empty or missing conversation:", key2);
      if (convoMeta) {
        queue.delete(key2);
        saveQueue();
      }
      continue;
    }
    const hasPending = convoMeta.messages.some((m) => m.pending);
    if (!hasPending) {
      console.log("[SkyGit] No pending messages for", key2, "removing from queue");
      queue.delete(key2);
      saveQueue();
      continue;
    }
    const conversation = {
      id: convoMeta.id,
      repo: repoName,
      title: convoMeta.title || `Conversation ${convoMeta.id}`,
      createdAt: convoMeta.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      participants: convoMeta.participants || [],
      messages: convoMeta.messages
    };
    try {
      const safeRepo = conversation.repo.replace(/[\/\\]/g, "_").replace(/\W+/g, "_");
      const safeTitle = conversation.title.replace(/\W+/g, "_");
      let filename = `${safeRepo}_${safeTitle}.json`;
      let path = `.messages/${filename}`;
      let sha = null;
      let remoteConversation = null;
      let counter = 1;
      while (true) {
        try {
          const checkRes = await fetch(`https://api.github.com/repos/${repoName}/contents/${path}`, {
            headers: {
              Authorization: `token ${token}`,
              Accept: "application/vnd.github+json"
            }
          });
          if (checkRes.ok) {
            const existing = await checkRes.json();
            const existingContent = JSON.parse(atob(existing.content));
            if (existingContent.id === conversation.id) {
              sha = existing.sha;
              remoteConversation = existingContent;
              break;
            } else {
              filename = `${safeRepo}_${safeTitle}_${counter}.json`;
              path = `.messages/${filename}`;
              counter++;
              continue;
            }
          } else {
            break;
          }
        } catch (_) {
          break;
        }
      }
      let finalConversation = conversation;
      if (remoteConversation && remoteConversation.messages) {
        const messageMap = /* @__PURE__ */ new Map();
        remoteConversation.messages.forEach((msg) => {
          if (msg.id) {
            messageMap.set(msg.id, msg);
          }
        });
        conversation.messages.forEach((msg) => {
          if (msg.id) {
            messageMap.set(msg.id, msg);
          }
        });
        const mergedMessages = Array.from(messageMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        finalConversation = {
          ...conversation,
          messages: mergedMessages,
          participants: Array.from(/* @__PURE__ */ new Set([
            ...remoteConversation.participants || [],
            ...conversation.participants || []
          ]))
        };
        console.log(`[SkyGit] Merged ${remoteConversation.messages.length} remote + ${conversation.messages.length} local = ${mergedMessages.length} total messages`);
      }
      const committedMessages = (finalConversation.messages || []).map((msg) => ({ pending: false, ...msg }));
      finalConversation = {
        ...finalConversation,
        messages: committedMessages
      };
      const serializedConversation = {
        ...finalConversation,
        messages: finalConversation.messages.map(({ pending, ...rest }) => rest)
      };
      const payload = btoa(JSON.stringify(serializedConversation, null, 2));
      const body = {
        message: `Update conversation ${conversation.id}`,
        content: payload,
        ...sha && { sha }
      };
      const res = await fetch(`https://api.github.com/repos/${repoName}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json"
        },
        body: JSON.stringify(body),
        keepalive: true
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`[SkyGit] Failed to commit to target repo ${repoName}:`, err);
        throw new Error(`GitHub commit failed: ${res.status} ${err}`);
      } else {
        console.log("[SkyGit] Successfully committed conversation:", key2);
        queue.delete(key2);
        saveQueue();
        try {
          await commitToSkyGitConversations(token, serializedConversation, username);
        } catch (mirrorErr) {
          console.warn("[SkyGit] Failed to mirror to skygit-config (non-critical):", mirrorErr);
        }
        conversations.update((map) => {
          const list = map[repoName] || [];
          const updatedList = list.map((c) => {
            if (c.id === convoId) {
              return {
                ...c,
                messages: finalConversation.messages,
                participants: finalConversation.participants,
                updatedAt: Date.now()
              };
            }
            return c;
          });
          return { ...map, [repoName]: updatedList };
        });
        markMessagesCommitted(convoId, repoName, finalConversation.messages.map((m) => m.id));
        committedEvents.set({
          repoName,
          convoId,
          messageIds: finalConversation.messages.map((m) => m.id)
        });
      }
    } catch (err) {
      console.error("[SkyGit] Conversation commit failed, keeping in queue:", err);
    }
  }
}
function hasPendingConversationCommits() {
  return queue.size > 0;
}
/**
 * @license lucide-svelte v0.485.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
var root$n = /* @__PURE__ */ from_svg(`<svg><!><!></svg>`);
function Icon($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  const $$restProps = legacy_rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  push($$props, false);
  let name = prop($$props, "name", 8, void 0);
  let color = prop($$props, "color", 8, "currentColor");
  let size = prop($$props, "size", 8, 24);
  let strokeWidth = prop($$props, "strokeWidth", 8, 2);
  let absoluteStrokeWidth = prop($$props, "absoluteStrokeWidth", 8, false);
  let iconNode = prop($$props, "iconNode", 24, () => []);
  const mergeClasses = (...classes) => classes.filter((className, index2, array) => {
    return Boolean(className) && array.indexOf(className) === index2;
  }).join(" ");
  init();
  var svg = root$n();
  attribute_effect(
    svg,
    ($0, $1) => ({
      ...defaultAttributes,
      ...$$restProps,
      width: size(),
      height: size(),
      stroke: color(),
      "stroke-width": $0,
      class: $1
    }),
    [
      () => (deep_read_state(absoluteStrokeWidth()), deep_read_state(strokeWidth()), deep_read_state(size()), untrack(() => absoluteStrokeWidth() ? Number(strokeWidth()) * 24 / Number(size()) : strokeWidth())),
      () => (deep_read_state(name()), deep_read_state($$sanitized_props), untrack(() => mergeClasses("lucide-icon", "lucide", name() ? `lucide-${name()}` : "", $$sanitized_props.class)))
    ]
  );
  var node = child(svg);
  each(node, 1, iconNode, index, ($$anchor2, $$item) => {
    var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 2));
    let tag = () => get($$array)[0];
    let attrs = () => get($$array)[1];
    var fragment = comment();
    var node_1 = first_child(fragment);
    element(node_1, tag, true, ($$element, $$anchor3) => {
      attribute_effect($$element, () => ({ ...attrs() }));
    });
    append($$anchor2, fragment);
  });
  var node_2 = sibling(node);
  slot(node_2, $$props, "default", {});
  append($$anchor, svg);
  pop();
}
function Bell($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M10.268 21a2 2 0 0 0 3.464 0" }],
    [
      "path",
      {
        "d": "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "bell" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Calendar($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M8 2v4" }],
    ["path", { "d": "M16 2v4" }],
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "4", "rx": "2" }
    ],
    ["path", { "d": "M3 10h18" }]
  ];
  Icon($$anchor, spread_props({ name: "calendar" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Check_check($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M18 6 7 17l-5-5" }],
    ["path", { "d": "m22 10-7.5 7.5L13 16" }]
  ];
  Icon($$anchor, spread_props({ name: "check-check" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Check($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$anchor, spread_props({ name: "check" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Circle_alert($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["line", { "x1": "12", "x2": "12", "y1": "8", "y2": "12" }],
    [
      "line",
      { "x1": "12", "x2": "12.01", "y1": "16", "y2": "16" }
    ]
  ];
  Icon($$anchor, spread_props({ name: "circle-alert" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Circle_help($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["path", { "d": "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
    ["path", { "d": "M12 17h.01" }]
  ];
  Icon($$anchor, spread_props({ name: "circle-help" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Clock($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["polyline", { "points": "12 6 12 12 16 14" }]
  ];
  Icon($$anchor, spread_props({ name: "clock" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Database($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["ellipse", { "cx": "12", "cy": "5", "rx": "9", "ry": "3" }],
    ["path", { "d": "M3 5V19A9 3 0 0 0 21 19V5" }],
    ["path", { "d": "M3 12A9 3 0 0 0 21 12" }]
  ];
  Icon($$anchor, spread_props({ name: "database" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Disc($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["circle", { "cx": "12", "cy": "12", "r": "2" }]
  ];
  Icon($$anchor, spread_props({ name: "disc" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Download($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
    ["polyline", { "points": "7 10 12 15 17 10" }],
    ["line", { "x1": "12", "x2": "12", "y1": "15", "y2": "3" }]
  ];
  Icon($$anchor, spread_props({ name: "download" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function External_link($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M15 3h6v6" }],
    ["path", { "d": "M10 14 21 3" }],
    [
      "path",
      {
        "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "external-link" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function File_text($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
      }
    ],
    ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }],
    ["path", { "d": "M10 9H8" }],
    ["path", { "d": "M16 13H8" }],
    ["path", { "d": "M16 17H8" }]
  ];
  Icon($$anchor, spread_props({ name: "file-text" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function File_video($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
      }
    ],
    ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }],
    ["path", { "d": "m10 11 5 3-5 3v-6Z" }]
  ];
  Icon($$anchor, spread_props({ name: "file-video" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Folder($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "folder" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Hard_drive($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["line", { "x1": "22", "x2": "2", "y1": "12", "y2": "12" }],
    [
      "path",
      {
        "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
      }
    ],
    ["line", { "x1": "6", "x2": "6.01", "y1": "16", "y2": "16" }],
    [
      "line",
      { "x1": "10", "x2": "10.01", "y1": "16", "y2": "16" }
    ]
  ];
  Icon($$anchor, spread_props({ name: "hard-drive" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Info($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "10" }],
    ["path", { "d": "M12 16v-4" }],
    ["path", { "d": "M12 8h.01" }]
  ];
  Icon($$anchor, spread_props({ name: "info" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Loader_circle($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]];
  Icon($$anchor, spread_props({ name: "loader-circle" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Message_circle($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [["path", { "d": "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }]];
  Icon($$anchor, spread_props({ name: "message-circle" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Message_square($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "message-square" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Mic_off($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["line", { "x1": "2", "x2": "22", "y1": "2", "y2": "22" }],
    ["path", { "d": "M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" }],
    ["path", { "d": "M5 10v2a7 7 0 0 0 12 5" }],
    ["path", { "d": "M15 9.34V5a3 3 0 0 0-5.68-1.33" }],
    ["path", { "d": "M9 9v3a3 3 0 0 0 5.12 2.12" }],
    ["line", { "x1": "12", "x2": "12", "y1": "19", "y2": "22" }]
  ];
  Icon($$anchor, spread_props({ name: "mic-off" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Mic($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      { "d": "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" }
    ],
    ["path", { "d": "M19 10v2a7 7 0 0 1-14 0v-2" }],
    ["line", { "x1": "12", "x2": "12", "y1": "19", "y2": "22" }]
  ];
  Icon($$anchor, spread_props({ name: "mic" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Monitor_off($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M17 17H4a2 2 0 0 1-2-2V5c0-1.5 1-2 1-2" }],
    ["path", { "d": "M22 15V5a2 2 0 0 0-2-2H9" }],
    ["path", { "d": "M8 21h8" }],
    ["path", { "d": "M12 17v4" }],
    ["path", { "d": "m2 2 20 20" }]
  ];
  Icon($$anchor, spread_props({ name: "monitor-off" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Monitor($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "rect",
      { "width": "20", "height": "14", "x": "2", "y": "3", "rx": "2" }
    ],
    ["line", { "x1": "8", "x2": "16", "y1": "21", "y2": "21" }],
    ["line", { "x1": "12", "x2": "12", "y1": "17", "y2": "21" }]
  ];
  Icon($$anchor, spread_props({ name: "monitor" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Network($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "rect",
      { "x": "16", "y": "16", "width": "6", "height": "6", "rx": "1" }
    ],
    [
      "rect",
      { "x": "2", "y": "16", "width": "6", "height": "6", "rx": "1" }
    ],
    [
      "rect",
      { "x": "9", "y": "2", "width": "6", "height": "6", "rx": "1" }
    ],
    ["path", { "d": "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" }],
    ["path", { "d": "M12 12V8" }]
  ];
  Icon($$anchor, spread_props({ name: "network" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Paperclip($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M13.234 20.252 21 12.3" }],
    [
      "path",
      {
        "d": "m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "paperclip" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Phone_incoming($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["polyline", { "points": "16 2 16 8 22 8" }],
    ["line", { "x1": "22", "x2": "16", "y1": "2", "y2": "8" }],
    [
      "path",
      {
        "d": "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "phone-incoming" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Phone_missed($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["line", { "x1": "22", "x2": "16", "y1": "2", "y2": "8" }],
    ["line", { "x1": "16", "x2": "22", "y1": "2", "y2": "8" }],
    [
      "path",
      {
        "d": "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "phone-missed" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Phone_off($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"
      }
    ],
    ["line", { "x1": "22", "x2": "2", "y1": "2", "y2": "22" }]
  ];
  Icon($$anchor, spread_props({ name: "phone-off" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Phone_outgoing($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["polyline", { "points": "22 8 22 2 16 2" }],
    ["line", { "x1": "16", "x2": "22", "y1": "8", "y2": "2" }],
    [
      "path",
      {
        "d": "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "phone-outgoing" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Phone($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "phone" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Refresh_cw($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      { "d": "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }
    ],
    ["path", { "d": "M21 3v5h-5" }],
    [
      "path",
      { "d": "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }
    ],
    ["path", { "d": "M8 16H3v5" }]
  ];
  Icon($$anchor, spread_props({ name: "refresh-cw" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Search($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["circle", { "cx": "11", "cy": "11", "r": "8" }],
    ["path", { "d": "m21 21-4.3-4.3" }]
  ];
  Icon($$anchor, spread_props({ name: "search" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Server($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "rect",
      {
        "width": "20",
        "height": "8",
        "x": "2",
        "y": "2",
        "rx": "2",
        "ry": "2"
      }
    ],
    [
      "rect",
      {
        "width": "20",
        "height": "8",
        "x": "2",
        "y": "14",
        "rx": "2",
        "ry": "2"
      }
    ],
    ["line", { "x1": "6", "x2": "6.01", "y1": "6", "y2": "6" }],
    ["line", { "x1": "6", "x2": "6.01", "y1": "18", "y2": "18" }]
  ];
  Icon($$anchor, spread_props({ name: "server" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Shield($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "shield" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Square($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "3", "rx": "2" }
    ]
  ];
  Icon($$anchor, spread_props({ name: "square" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Star($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "star" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Trash_2($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M3 6h18" }],
    ["path", { "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }],
    ["path", { "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
    ["line", { "x1": "10", "x2": "10", "y1": "11", "y2": "17" }],
    ["line", { "x1": "14", "x2": "14", "y1": "11", "y2": "17" }]
  ];
  Icon($$anchor, spread_props({ name: "trash-2" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Upload($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
    ["polyline", { "points": "17 8 12 3 7 8" }],
    ["line", { "x1": "12", "x2": "12", "y1": "3", "y2": "15" }]
  ];
  Icon($$anchor, spread_props({ name: "upload" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function User_plus($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["circle", { "cx": "9", "cy": "7", "r": "4" }],
    ["line", { "x1": "19", "x2": "19", "y1": "8", "y2": "14" }],
    ["line", { "x1": "22", "x2": "16", "y1": "11", "y2": "11" }]
  ];
  Icon($$anchor, spread_props({ name: "user-plus" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Users($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["circle", { "cx": "9", "cy": "7", "r": "4" }],
    ["path", { "d": "M22 21v-2a4 4 0 0 0-3-3.87" }],
    ["path", { "d": "M16 3.13a4 4 0 0 1 0 7.75" }]
  ];
  Icon($$anchor, spread_props({ name: "users" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Video_off($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196"
      }
    ],
    [
      "path",
      {
        "d": "M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"
      }
    ],
    ["path", { "d": "m2 2 20 20" }]
  ];
  Icon($$anchor, spread_props({ name: "video-off" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function Video($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    [
      "path",
      {
        "d": "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"
      }
    ],
    [
      "rect",
      { "x": "2", "y": "6", "width": "14", "height": "12", "rx": "2" }
    ]
  ];
  Icon($$anchor, spread_props({ name: "video" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
function X($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, ["children", "$$slots", "$$events", "$$legacy"]);
  /**
   * @license lucide-svelte v0.485.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon($$anchor, spread_props({ name: "x" }, () => $$sanitized_props, {
    get iconNode() {
      return iconNode;
    },
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      slot(node, $$props, "default", {});
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  }));
}
const linear = (x) => x;
function cubic_out(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function split_css_unit(value) {
  const split = typeof value === "string" && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
  return split ? [parseFloat(split[1]), split[2] || "px"] : [
    /** @type {number} */
    value,
    "px"
  ];
}
function fade(node, { delay = 0, duration = 400, easing = linear } = {}) {
  const o = +getComputedStyle(node).opacity;
  return {
    delay,
    duration,
    easing,
    css: (t) => `opacity: ${t * o}`
  };
}
function fly(node, { delay = 0, duration = 400, easing = cubic_out, x = 0, y = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const od = target_opacity * (1 - opacity);
  const [x_value, x_unit] = split_css_unit(x);
  const [y_value, y_unit] = split_css_unit(y);
  return {
    delay,
    duration,
    easing,
    css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x_value}${x_unit}, ${(1 - t) * y_value}${y_unit});
			opacity: ${target_opacity - od * u}`
  };
}
function scale(node, { delay = 0, duration = 400, easing = cubic_out, start = 0, opacity = 0 } = {}) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === "none" ? "" : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
  };
}
var root_1$o = /* @__PURE__ */ from_html(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Dismiss token help"></button> <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]"><button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close token help"><!></button> <h2 class="text-2xl font-bold mb-6 text-gray-800">How to create a GitHub Token</h2> <div class="space-y-6 text-gray-600"><div class="flex gap-4"><div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div> <div><p class="font-medium text-gray-800 mb-1">Go to Developer Settings</p> <p class="text-sm">Navigate to <a href="https://github.com/settings/tokens" target="_blank" class="text-blue-600 hover:underline inline-flex items-center gap-1">GitHub Settings <!></a> and select <strong>Personal access tokens (Classic)</strong>.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div> <div><p class="font-medium text-gray-800 mb-1">Generate New Token</p> <p class="text-sm">Click <strong>Generate new token</strong> and select <strong>Generate new token (classic)</strong>.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div> <div class="flex-1"><p class="font-medium text-gray-800 mb-1">Select Scopes</p> <p class="text-sm mb-2">Give your token a name (e.g., "SkyGit") and check
                            the following permissions:</p> <div class="bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm font-mono flex items-center justify-between group"><div class="space-y-1"><div class="flex items-center gap-2"><span class="text-green-600">✓</span> <span>repo</span></div> <div class="flex items-center gap-2"><span class="text-green-600">✓</span> <span>read:user</span></div></div></div></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">4</div> <div><p class="font-medium text-gray-800 mb-1">Copy & Paste</p> <p class="text-sm">Scroll to the bottom, click <strong>Generate token</strong>, and copy the token (starts with <code>ghp_</code>). Paste it into the login field.</p></div></div></div> <div class="mt-8 pt-6 border-t flex justify-end"><button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Got it</button></div></div></div>`);
function PatHelpModal($$anchor, $$props) {
  let isOpen = prop($$props, "isOpen", 8, false);
  let onClose = prop($$props, "onClose", 8);
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$o();
      var button = child(div);
      var div_1 = sibling(button, 2);
      var button_1 = child(div_1);
      var node_1 = child(button_1);
      X(node_1, { size: 24 });
      var div_2 = sibling(button_1, 4);
      var div_3 = child(div_2);
      var div_4 = sibling(child(div_3), 2);
      var p = sibling(child(div_4), 2);
      var a = sibling(child(p));
      var node_2 = sibling(child(a));
      External_link(node_2, { size: 12 });
      var div_5 = sibling(div_2, 2);
      var button_2 = child(div_5);
      event("click", button, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button_1, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button_2, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      transition(1, div_1, () => scale, () => ({ start: 0.95 }));
      transition(3, div, () => fade);
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (isOpen()) $$render(consequent);
    });
  }
  append($$anchor, fragment);
}
var root_1$n = /* @__PURE__ */ from_html(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Dismiss how SkyGit works modal"></button> <div class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]"><button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close how SkyGit works modal"><!></button> <h2 class="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"><!> How SkyGit Works</h2> <div class="space-y-8 text-gray-600"><div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">Where is my data stored?</h3> <p class="text-sm leading-relaxed">SkyGit is <strong>serverless</strong>. We do not
                            have a database. <br/><br/> All your data (conversations, settings, metadata) is
                            stored directly in <strong>your own GitHub repositories</strong>.</p> <ul class="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-600"><li>Global settings: stored in a private <code>skygit-config</code> repo in your account.</li> <li>Chat messages: stored in a hidden <code>.messages/</code> folder inside each specific repository.</li></ul></div></div> <div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">Who can see my messages?</h3> <p class="text-sm leading-relaxed">Since data is stored in your GitHub repos, <strong>access is controlled by GitHub permissions</strong>. <br/> Only people who have access to the repository (collaborators)
                            can see the messages associated with it. If the repo
                            is private, your chats are private.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">What about the PeerJS Server?</h3> <p class="text-sm leading-relaxed">We use a PeerJS server solely for <strong>signaling</strong> (discovery). <br/> It helps peers find each other to establish a connection. <br/><br/> <strong>No chat content or video streams pass through
                                this server.</strong> <br/> Only your Peer ID (derived from your username) and connection
                            metadata are temporarily processed to handshake.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">Real-time Communication</h3> <p class="text-sm leading-relaxed">Once connected, all chats, audio, and video calls
                            are transmitted <strong>directly between peers</strong> (Peer-to-Peer) using WebRTC. <br/> This traffic is encrypted end-to-end by standard WebRTC
                            protocols and does not touch any central server.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">File & Recording Storage</h3> <p class="text-sm leading-relaxed">You can save call recordings and shared files to:</p> <ul class="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-600"><li><strong>S3 / Google Drive</strong>: Configure
                                external cloud storage in Settings for large
                                files.</li> <li><strong>Git Repository (GitFS)</strong>: No
                                setup needed! Small files (up to 50MB) are saved
                                directly in your repo.</li></ul> <p class="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-100"><strong>GitFS Limits:</strong> Max 50MB per file, max
                            1GB total repo size.</p></div></div></div> <div class="mt-8 pt-6 border-t flex justify-end"><button class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">Close</button></div></div></div>`);
function HowItWorksModal($$anchor, $$props) {
  let isOpen = prop($$props, "isOpen", 8, false);
  let onClose = prop($$props, "onClose", 8);
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$n();
      var button = child(div);
      var div_1 = sibling(button, 2);
      var button_1 = child(div_1);
      var node_1 = child(button_1);
      X(node_1, { size: 24 });
      var h2 = sibling(button_1, 2);
      var node_2 = child(h2);
      Shield(node_2, { class: "text-blue-600" });
      var div_2 = sibling(h2, 2);
      var div_3 = child(div_2);
      var div_4 = child(div_3);
      var div_5 = child(div_4);
      var node_3 = child(div_5);
      Database(node_3, { size: 20 });
      var div_6 = sibling(div_3, 2);
      var div_7 = child(div_6);
      var div_8 = child(div_7);
      var node_4 = child(div_8);
      Shield(node_4, { size: 20 });
      var div_9 = sibling(div_6, 2);
      var div_10 = child(div_9);
      var div_11 = child(div_10);
      var node_5 = child(div_11);
      Server(node_5, { size: 20 });
      var div_12 = sibling(div_9, 2);
      var div_13 = child(div_12);
      var div_14 = child(div_13);
      var node_6 = child(div_14);
      Network(node_6, { size: 20 });
      var div_15 = sibling(div_12, 2);
      var div_16 = child(div_15);
      var div_17 = child(div_16);
      var node_7 = child(div_17);
      Hard_drive(node_7, { size: 20 });
      var div_18 = sibling(div_2, 2);
      var button_2 = child(div_18);
      event("click", button, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button_1, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button_2, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      transition(1, div_1, () => scale, () => ({ start: 0.95 }));
      transition(3, div, () => fade);
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (isOpen()) $$render(consequent);
    });
  }
  append($$anchor, fragment);
}
var root_1$m = /* @__PURE__ */ from_html(`<p class="text-red-500 text-sm"> </p>`);
var root_2$j = /* @__PURE__ */ from_html(`<span class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Authenticating…`, 1);
var root$m = /* @__PURE__ */ from_html(
  `<div class="space-y-4 max-w-md mx-auto mt-20 p-6 bg-white rounded shadow"><h2 class="text-xl font-semibold">Enter your GitHub Personal Access Token</h2> <p class="text-sm text-gray-600">Your token is stored in this browser and used directly with the GitHub API.
    Use the minimum scopes SkyGit needs.</p> <label class="block text-sm font-medium text-gray-700" for="github-token">GitHub Personal Access Token</label> <input id="github-token" type="password" autocomplete="current-password" placeholder="ghp_..." class="w-full border p-2 rounded"/> <!> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full flex items-center justify-center disabled:opacity-50"><!></button> <p class="text-sm text-gray-500 flex flex-col gap-2"><span>Don’t have a token? <a class="text-blue-600 underline" target="_blank" href="https://github.com/settings/tokens/new?scopes=repo,read:user&amp;description=SkyGit">Generate one here</a></span> <button class="text-gray-500 hover:text-gray-700 text-sm underline text-left flex items-center gap-1"><!> How to create a token?</button> <button class="text-gray-500 hover:text-gray-700 text-sm underline text-left flex items-center gap-1"><!> How SkyGit works?</button></p></div> <!> <!>`,
  1
);
function LoginWithPAT($$anchor, $$props) {
  push($$props, false);
  let onSubmit = prop($$props, "onSubmit", 8);
  let error = prop($$props, "error", 8, null);
  let token = /* @__PURE__ */ mutable_source("");
  let loading = /* @__PURE__ */ mutable_source(false);
  let showHelp = /* @__PURE__ */ mutable_source(false);
  let showHowItWorks = /* @__PURE__ */ mutable_source(false);
  async function handleSubmit() {
    if (get(loading)) return;
    set(loading, true);
    await onSubmit()(get(token));
    set(loading, false);
  }
  init();
  var fragment = root$m();
  var div = first_child(fragment);
  var input = sibling(child(div), 6);
  var node = sibling(input, 2);
  {
    var consequent = ($$anchor2) => {
      var p = root_1$m();
      var text2 = child(p);
      template_effect(() => set_text(text2, error()));
      append($$anchor2, p);
    };
    if_block(node, ($$render) => {
      if (error()) $$render(consequent);
    });
  }
  var button = sibling(node, 2);
  var node_1 = child(button);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment_1 = root_2$j();
      append($$anchor2, fragment_1);
    };
    var alternate = ($$anchor2) => {
      var text_1 = text("Authenticate");
      append($$anchor2, text_1);
    };
    if_block(node_1, ($$render) => {
      if (get(loading)) $$render(consequent_1);
      else $$render(alternate, -1);
    });
  }
  var p_1 = sibling(button, 2);
  var button_1 = sibling(child(p_1), 2);
  var node_2 = child(button_1);
  Circle_help(node_2, { size: 14 });
  var button_2 = sibling(button_1, 2);
  var node_3 = child(button_2);
  Info(node_3, { size: 14 });
  var node_4 = sibling(div, 2);
  PatHelpModal(node_4, {
    get isOpen() {
      return get(showHelp);
    },
    onClose: () => set(showHelp, false)
  });
  var node_5 = sibling(node_4, 2);
  HowItWorksModal(node_5, {
    get isOpen() {
      return get(showHowItWorks);
    },
    onClose: () => set(showHowItWorks, false)
  });
  template_effect(() => {
    input.disabled = get(loading);
    button.disabled = get(loading);
  });
  bind_value(input, () => get(token), ($$value) => set(token, $$value));
  event("click", button, handleSubmit);
  event("click", button_1, () => set(showHelp, true));
  event("click", button_2, () => set(showHowItWorks, true));
  append($$anchor, fragment);
  pop();
}
var root_1$l = /* @__PURE__ */ from_html(`<span class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Creating...`, 1);
var root$l = /* @__PURE__ */ from_html(`<div class="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow space-y-4"><h2 class="text-xl font-bold">Repository Creation</h2> <p>SkyGit needs to create a private GitHub repository in your account called <strong><code>skygit-config</code></strong>.</p> <p>This repository will store your conversation metadata and settings.</p> <div class="flex space-x-4 mt-6"><button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"><!></button> <button class="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button></div></div>`);
function RepoConsent($$anchor, $$props) {
  push($$props, false);
  let onApprove = prop($$props, "onApprove", 8);
  let onReject = prop($$props, "onReject", 8);
  let loading = /* @__PURE__ */ mutable_source(false);
  async function handleApprove() {
    if (get(loading)) return;
    set(loading, true);
    try {
      await onApprove()();
    } catch (err) {
      console.error("Repo creation failed:", err);
      alert("Failed to create repository: " + err.message);
    } finally {
      set(loading, false);
    }
  }
  init();
  var div = root$l();
  var div_1 = sibling(child(div), 6);
  var button = child(div_1);
  var node = child(button);
  {
    var consequent = ($$anchor2) => {
      var fragment = root_1$l();
      append($$anchor2, fragment);
    };
    var alternate = ($$anchor2) => {
      var text$1 = text("I Accept");
      append($$anchor2, text$1);
    };
    if_block(node, ($$render) => {
      if (get(loading)) $$render(consequent);
      else $$render(alternate, -1);
    });
  }
  var button_1 = sibling(button, 2);
  template_effect(() => {
    button.disabled = get(loading);
    button_1.disabled = get(loading);
  });
  event("click", button, handleApprove);
  event("click", button_1, function(...$$args) {
    var _a2;
    (_a2 = onReject()) == null ? void 0 : _a2.apply(this, $$args);
  });
  append($$anchor, div);
  pop();
}
const searchQuery = writable("");
const presencePolling = writable({});
function setPollingState(repoFullName, active) {
  presencePolling.update((m) => ({ ...m, [repoFullName]: active }));
}
var root_1$k = /* @__PURE__ */ from_html(`<option> </option>`);
var root_2$i = /* @__PURE__ */ from_html(`<option> </option>`);
var root_5$9 = /* @__PURE__ */ from_html(`<span title="Presence paused" class="mt-0.5">⏸️</span>`);
var root_6$8 = /* @__PURE__ */ from_html(`<span title="Presence active" class="mt-0.5">▶️</span>`);
var root_7$9 = /* @__PURE__ */ from_html(`<p class="text-xs text-gray-400 italic truncate mt-1"> </p>`);
var root_8$7 = /* @__PURE__ */ from_html(`<p class="text-xs text-gray-300 italic mt-1">No messages yet.</p>`);
var root_4$b = /* @__PURE__ */ from_html(`<button class="px-3 py-2 hover:bg-blue-50 rounded cursor-pointer text-left flex gap-2 items-start"><!> <div class="flex-1"><p class="text-sm font-medium truncate"> </p> <p class="text-xs text-gray-500 truncate"> </p> <!></div></button>`);
var root_9$a = /* @__PURE__ */ from_html(`<p class="text-xs text-gray-400 italic px-3 py-4"><!></p>`);
var root$k = /* @__PURE__ */ from_html(`<div class="mt-2 space-y-2"><div class="px-3 flex flex-col gap-2"><label class="text-xs text-gray-500">Organization <select class="mt-1 w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"></select></label> <label class="text-xs text-gray-500">Repository <select class="mt-1 w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"></select></label></div> <div class="flex flex-col gap-1"><!> <!></div></div>`);
function SidebarChats($$anchor, $$props) {
  push($$props, false);
  const allConversations = /* @__PURE__ */ mutable_source();
  const orgOptions = /* @__PURE__ */ mutable_source();
  const repoOptions = /* @__PURE__ */ mutable_source();
  const scopedConversations = /* @__PURE__ */ mutable_source();
  const filteredConversations = /* @__PURE__ */ mutable_source();
  let search = prop($$props, "search", 8, "");
  let convoMap = /* @__PURE__ */ mutable_source({});
  let pollingMap = /* @__PURE__ */ mutable_source({});
  let previousSearch = /* @__PURE__ */ mutable_source("");
  let selectedOrg = /* @__PURE__ */ mutable_source("all");
  let selectedRepo2 = /* @__PURE__ */ mutable_source("all");
  let previousOrg = /* @__PURE__ */ mutable_source("all");
  let repos = /* @__PURE__ */ mutable_source([]);
  let lastDiscoveredRepoChat = /* @__PURE__ */ mutable_source(null);
  conversations.subscribe((value) => set(convoMap, value));
  repoList.subscribe((value) => set(repos, value));
  presencePolling.subscribe((m) => set(pollingMap, m));
  function openConversation(convo) {
    currentContent.set(convo);
    selectedConversation.set(convo);
    currentRoute.set("chats");
  }
  const orgFromRepo = (repo) => (repo == null ? void 0 : repo.includes("/")) ? repo.split("/")[0] : repo || "";
  legacy_pre_effect(() => get(convoMap), () => {
    set(allConversations, Object.values(get(convoMap)).flat().sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    }));
  });
  legacy_pre_effect(() => get(allConversations), () => {
    set(orgOptions, [
      "all",
      ...Array.from(new Set(get(allConversations).map((convo) => orgFromRepo(convo.repo)).filter((org) => org && org.trim() !== "")))
    ]);
  });
  legacy_pre_effect(() => (get(allConversations), get(selectedOrg)), () => {
    set(repoOptions, [
      "all",
      ...Array.from(new Set(get(allConversations).filter((convo) => get(selectedOrg) === "all" || orgFromRepo(convo.repo) === get(selectedOrg)).map((convo) => convo.repo).filter((repo) => repo && repo.trim() !== "")))
    ]);
  });
  legacy_pre_effect(
    () => (get(selectedOrg), get(previousOrg), get(selectedRepo2), get(repoOptions)),
    () => {
      if (get(selectedOrg) !== get(previousOrg)) {
        set(selectedRepo2, "all");
        set(previousOrg, get(selectedOrg));
      }
      if (!get(repoOptions).includes(get(selectedRepo2))) {
        set(selectedRepo2, "all");
      }
    }
  );
  legacy_pre_effect(
    () => (get(selectedRepo2), get(lastDiscoveredRepoChat), get(repos), discoverConversations),
    () => {
      if (get(selectedRepo2) !== "all" && get(selectedRepo2) !== get(lastDiscoveredRepoChat)) {
        set(lastDiscoveredRepoChat, get(selectedRepo2));
        const repo = get(repos).find((r2) => r2.full_name === get(selectedRepo2));
        const token = localStorage.getItem("skygit_token");
        if (repo && token) {
          discoverConversations(token, repo).catch((err) => console.warn("[SkyGit] Failed to auto-discover conversations:", err));
        }
      }
    }
  );
  legacy_pre_effect(
    () => (get(allConversations), get(selectedOrg), get(selectedRepo2)),
    () => {
      set(scopedConversations, get(allConversations).filter((convo) => {
        const org = orgFromRepo(convo.repo);
        if (get(selectedOrg) !== "all" && org !== get(selectedOrg)) return false;
        if (get(selectedRepo2) !== "all" && convo.repo !== get(selectedRepo2)) return false;
        return true;
      }));
    }
  );
  legacy_pre_effect(() => (get(scopedConversations), deep_read_state(search())), () => {
    set(filteredConversations, get(scopedConversations).filter((convo) => {
      if (!search() || search().trim() === "") return true;
      const query = search().toLowerCase();
      const title = (convo.title || `Conversation ${convo.id.slice(0, 6)}`).toLowerCase();
      const repo = convo.repo.toLowerCase();
      const fullName = `${repo}/${title}`;
      return title.includes(query) || repo.includes(query) || fullName.includes(query);
    }));
  });
  legacy_pre_effect(
    () => (get(filteredConversations), currentContent),
    () => {
      const currentSelection = get$1(selectedConversation);
      if (currentSelection && !get(filteredConversations).some((c) => c.id === currentSelection.id)) {
        selectedConversation.set(null);
        const currentContentValue = get$1(currentContent);
        if (currentContentValue && currentContentValue.id === currentSelection.id) {
          currentContent.set(null);
        }
      }
    }
  );
  legacy_pre_effect(
    () => (deep_read_state(search()), get(previousSearch), get(filteredConversations)),
    () => {
      if (search() !== get(previousSearch)) {
        if (get(previousSearch) === "" && search().trim() !== "") {
          selectedConversation.set(null);
          currentContent.set(null);
        }
        if (search().trim() !== "" && get(filteredConversations).length === 1) {
          setTimeout(
            () => {
              const onlyConvo = get(filteredConversations)[0];
              selectedConversation.set(onlyConvo);
              currentContent.set(onlyConvo);
            },
            50
          );
        }
        set(previousSearch, search());
      }
    }
  );
  legacy_pre_effect_reset();
  init();
  var div = root$k();
  var div_1 = child(div);
  var label = child(div_1);
  var select = sibling(child(label));
  each(select, 5, () => get(orgOptions), index, ($$anchor2, org) => {
    var option = root_1$k();
    var text2 = child(option);
    var option_value = {};
    template_effect(() => {
      set_text(text2, get(org) === "all" ? "All organizations" : get(org));
      if (option_value !== (option_value = get(org))) {
        option.value = (option.__value = get(org)) ?? "";
      }
    });
    append($$anchor2, option);
  });
  var label_1 = sibling(label, 2);
  var select_1 = sibling(child(label_1));
  each(select_1, 5, () => get(repoOptions), index, ($$anchor2, repo) => {
    var option_1 = root_2$i();
    var text_1 = child(option_1);
    var option_1_value = {};
    template_effect(() => {
      set_text(text_1, get(repo) === "all" ? "All repositories" : get(repo));
      if (option_1_value !== (option_1_value = get(repo))) {
        option_1.value = (option_1.__value = get(repo)) ?? "";
      }
    });
    append($$anchor2, option_1);
  });
  var div_2 = sibling(div_1, 2);
  var node = child(div_2);
  each(node, 1, () => get(filteredConversations), (convo) => convo.id, ($$anchor2, convo) => {
    var fragment = comment();
    var node_1 = first_child(fragment);
    key(
      node_1,
      () => (get(convo), get(pollingMap), untrack(() => `${get(convo).id}-${get(pollingMap)[get(convo).repo]}`)),
      ($$anchor3) => {
        var button = root_4$b();
        var node_2 = child(button);
        {
          var consequent = ($$anchor4) => {
            var span = root_5$9();
            append($$anchor4, span);
          };
          var alternate = ($$anchor4) => {
            var span_1 = root_6$8();
            append($$anchor4, span_1);
          };
          if_block(node_2, ($$render) => {
            if (get(pollingMap), get(convo), untrack(() => get(pollingMap)[get(convo).repo] === false)) $$render(consequent);
            else $$render(alternate, -1);
          });
        }
        var div_3 = sibling(node_2, 2);
        var p = child(div_3);
        var text_2 = child(p);
        var p_1 = sibling(p, 2);
        var text_3 = child(p_1);
        var node_3 = sibling(p_1, 2);
        {
          var consequent_1 = ($$anchor4) => {
            var p_2 = root_7$9();
            var text_4 = child(p_2);
            template_effect(($0) => set_text(text_4, $0), [
              () => (get(convo), untrack(() => get(convo).messages.at(-1).content))
            ]);
            append($$anchor4, p_2);
          };
          var alternate_1 = ($$anchor4) => {
            var p_3 = root_8$7();
            append($$anchor4, p_3);
          };
          if_block(node_3, ($$render) => {
            if (get(convo), untrack(() => get(convo).messages && get(convo).messages.length > 0)) $$render(consequent_1);
            else $$render(alternate_1, -1);
          });
        }
        template_effect(
          ($0) => {
            set_text(text_2, $0);
            set_text(text_3, (get(convo), untrack(() => get(convo).repo)));
          },
          [
            () => (get(convo), untrack(() => get(convo).title || `Conversation ${get(convo).id.slice(0, 6)}`))
          ]
        );
        event("click", button, () => openConversation(get(convo)));
        append($$anchor3, button);
      }
    );
    append($$anchor2, fragment);
  });
  var node_4 = sibling(node, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var p_4 = root_9$a();
      var node_5 = child(p_4);
      {
        var consequent_2 = ($$anchor3) => {
          var text_5 = text("No conversations yet.");
          append($$anchor3, text_5);
        };
        var alternate_2 = ($$anchor3) => {
          var text_6 = text();
          template_effect(() => set_text(text_6, `No conversations match "${search() ?? ""}".`));
          append($$anchor3, text_6);
        };
        if_block(node_5, ($$render) => {
          if (get(allConversations), untrack(() => get(allConversations).length === 0)) $$render(consequent_2);
          else $$render(alternate_2, -1);
        });
      }
      append($$anchor2, p_4);
    };
    if_block(node_4, ($$render) => {
      if (get(filteredConversations), untrack(() => get(filteredConversations).length === 0)) $$render(consequent_3);
    });
  }
  bind_select_value(select, () => get(selectedOrg), ($$value) => set(selectedOrg, $$value));
  bind_select_value(select_1, () => get(selectedRepo2), ($$value) => set(selectedRepo2, $$value));
  append($$anchor, div);
  pop();
}
var root_1$j = /* @__PURE__ */ from_html(`<button class="border border-slate-300 text-xs px-3 py-2 rounded text-slate-600 hover:bg-slate-100">⏱ Scan all automatically</button>`);
var root_2$h = /* @__PURE__ */ from_html(`<div class="flex items-center justify-between mb-3 text-sm text-gray-500"><div class="flex items-center gap-2"><!> <span> </span></div> <button class="text-blue-600 text-xs underline"> </button></div>`);
var root_3$b = /* @__PURE__ */ from_html(`<div class="flex flex-col gap-2 mb-3 text-sm text-gray-500"><div class="flex items-center gap-2"><!> <span> </span></div> <button class="self-start text-blue-600 text-xs underline">Cancel discovery</button></div>`);
var root_7$8 = /* @__PURE__ */ from_html(`<span class="ml-1 text-green-600"> </span>`);
var root_6$7 = /* @__PURE__ */ from_html(`Select an organization below to scan its repositories. <!>`, 1);
var root_4$a = /* @__PURE__ */ from_html(`<div class="mb-3 text-xs text-gray-500"><!></div>`);
var root_9$9 = /* @__PURE__ */ from_html(`<div class="mb-3 text-xs text-green-600"> </div>`);
var root_12$3 = /* @__PURE__ */ from_html(`<img class="w-6 h-6 rounded-full"/>`);
var root_13$3 = /* @__PURE__ */ from_html(`<p class="mt-1 text-xs text-gray-500"> </p>`);
var root_11$1 = /* @__PURE__ */ from_html(`<li class="px-3 py-2 text-sm text-gray-700"><button class="w-full flex items-center gap-2 text-blue-600 hover:text-blue-800 disabled:opacity-40"><!> <span class="truncate"> </span></button> <!></li>`);
var root_10$4 = /* @__PURE__ */ from_html(`<div class="mb-4 border border-gray-200 rounded-lg overflow-hidden"><div class="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">Discovery targets</div> <ul class="divide-y divide-gray-200"></ul></div>`);
var root_15$4 = /* @__PURE__ */ from_svg(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`);
var root_16$4 = /* @__PURE__ */ from_svg(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`);
var root_17$4 = /* @__PURE__ */ from_html(`<option> </option>`);
var root_14$4 = /* @__PURE__ */ from_html(`<div class="mb-3 flex gap-2"><button class="p-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"><!></button> <select class="flex-1 text-sm border border-gray-300 rounded px-2 py-1 bg-white"><option> </option><!></select></div>`);
var root_23$1 = /* @__PURE__ */ from_html(`<span title="Google Drive storage configured">📁</span>`);
var root_24$1 = /* @__PURE__ */ from_html(`<span title="S3 storage configured">🪣</span>`);
var root_21$1 = /* @__PURE__ */ from_html(`<div><div class="text-sm truncate flex-1"><button> </button> <span class="text-xs text-gray-500 ml-1"> <!></span></div> <button aria-label="Remove repo" class="opacity-0 hover:opacity-100 transition-opacity"><!></button></div>`);
var root_20$1 = /* @__PURE__ */ from_html(`<div class="bg-white"></div>`);
var root_19$1 = /* @__PURE__ */ from_html(`<div class="border border-gray-200 rounded-lg overflow-hidden"><button class="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"><div class="flex items-center gap-2"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg> <span class="font-medium text-sm"> </span> <span class="text-xs text-gray-500"> </span></div></button> <!></div>`);
var root_18$3 = /* @__PURE__ */ from_html(`<div class="space-y-2"></div>`);
var root_25$1 = /* @__PURE__ */ from_html(`<p class="text-sm text-gray-400 italic mt-2">No matching repositories found.</p>`);
var root$j = /* @__PURE__ */ from_html(`<div class="mb-3 space-y-2"><div class="flex flex-col gap-2"><button class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded">📦 Sync saved repos</button> <div class="flex flex-col sm:flex-row gap-2"><button class="bg-slate-200 hover:bg-slate-300 text-xs px-3 py-2 rounded text-slate-900">🔍 Discover organizations</button> <!></div></div> <p class="text-xs text-gray-500 leading-relaxed">Sync pulls the latest repository snapshots from your <code class="bg-gray-100 px-1 rounded">skygit-config</code> repo. Discovery scans GitHub organizations (including your personal account) for new repositories to mirror here.</p></div> <!> <!> <!> <div class="flex flex-wrap gap-3 text-xs text-gray-700 mb-3"><label><input type="checkbox"/> 🔒 Private</label> <label><input type="checkbox"/> 🌐 Public</label> <label><input type="checkbox"/> 💬 With Messages</label> <label><input type="checkbox"/> No Messages</label></div> <!>`, 1);
function SidebarRepos($$anchor, $$props) {
  push($$props, false);
  const $selectedRepo = () => store_get(selectedRepo, "$selectedRepo", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  const filteredRepos = /* @__PURE__ */ mutable_source();
  const organizations = /* @__PURE__ */ mutable_source();
  const groupedRepos = /* @__PURE__ */ mutable_source();
  const orgCounts = /* @__PURE__ */ mutable_source();
  const allCollapsed = /* @__PURE__ */ mutable_source();
  let search = prop($$props, "search", 8, "");
  let repos = /* @__PURE__ */ mutable_source([]);
  let state2 = /* @__PURE__ */ mutable_source();
  let showPrivate = /* @__PURE__ */ mutable_source(true);
  let showPublic = /* @__PURE__ */ mutable_source(true);
  let showWithMessages = /* @__PURE__ */ mutable_source(true);
  let showWithoutMessages = /* @__PURE__ */ mutable_source(true);
  let selectedOrg = /* @__PURE__ */ mutable_source("all");
  let collapsedOrgs = /* @__PURE__ */ mutable_source(/* @__PURE__ */ new Set());
  repoList.subscribe((value) => set(repos, value));
  syncState.subscribe((s) => set(state2, s));
  async function removeRepo(fullName) {
    const repo = get(repos).find((r2) => r2.full_name === fullName);
    if (!repo) return;
    repoList.update((list) => list.filter((r2) => r2.full_name !== fullName));
    try {
      const token = localStorage.getItem("skygit_token");
      await deleteRepoFromGitHub(token, repo);
      console.log(`[SkyGit] Deleted ${fullName} from GitHub`);
    } catch (e) {
      console.warn(`[SkyGit] Failed to delete ${fullName} from GitHub:`, e);
    }
  }
  async function triggerSync() {
    const token = localStorage.getItem("skygit_token");
    if (token) {
      syncState.update((s) => ({ ...s, phase: "streaming", paused: false, loadedCount: 0 }));
      await streamPersistedReposFromGitHub(token);
    }
  }
  async function discoverOrgs() {
    const token = localStorage.getItem("skygit_token");
    if (!token) return;
    await discoverOrganizations(token);
  }
  async function discoverOrgRepos(orgId) {
    const token = localStorage.getItem("skygit_token");
    if (!token) return;
    await discoverReposForOrg(token, orgId);
  }
  async function runFullDiscovery() {
    const token = localStorage.getItem("skygit_token");
    if (!token) return;
    await discoverAllRepos(token);
  }
  function cancelRepoScan() {
    cancelDiscovery();
  }
  function labelForOrg(id) {
    var _a2, _b2;
    const match = (_b2 = (_a2 = get(state2)) == null ? void 0 : _a2.organizations) == null ? void 0 : _b2.find((org) => org.id === id);
    return match ? match.label : id;
  }
  function pauseSyncing() {
    syncState.update((s) => ({ ...s, paused: true }));
  }
  async function resumeSyncing() {
    const token = localStorage.getItem("skygit_token");
    if (!token) return;
    await streamPersistedReposFromGitHub(token);
  }
  function showRepo(repo) {
    selectedRepo.set(repo);
    currentContent.set(repo);
  }
  function toggleOrgCollapse(org) {
    if (get(collapsedOrgs).has(org)) {
      get(collapsedOrgs).delete(org);
    } else {
      get(collapsedOrgs).add(org);
    }
    set(
      collapsedOrgs,
      // Trigger reactivity
      get(collapsedOrgs)
    );
  }
  function toggleAllOrgs() {
    const orgs = Object.keys(get(groupedRepos));
    const hasExpanded = orgs.some((org) => !get(collapsedOrgs).has(org));
    if (hasExpanded) {
      orgs.forEach((org) => get(collapsedOrgs).add(org));
    } else {
      get(collapsedOrgs).clear();
    }
    set(
      collapsedOrgs,
      // Trigger reactivity
      get(collapsedOrgs)
    );
  }
  legacy_pre_effect(
    () => (get(repos), deep_read_state(search()), get(showPrivate), get(showPublic), get(showWithMessages), get(showWithoutMessages), get(selectedOrg)),
    () => {
      set(filteredRepos, get(repos).filter((repo) => {
        const q = search().toLowerCase();
        const matchesSearch = repo.full_name.toLowerCase().includes(q) || repo.name.toLowerCase().includes(q) || repo.owner.toLowerCase().includes(q);
        const matchesPrivacy = repo.private && get(showPrivate) || !repo.private && get(showPublic);
        const matchesMessages = repo.has_messages && get(showWithMessages) || !repo.has_messages && get(showWithoutMessages);
        const matchesOrg = get(selectedOrg) === "all" || repo.owner === get(selectedOrg);
        return matchesSearch && matchesPrivacy && matchesMessages && matchesOrg;
      }));
    }
  );
  legacy_pre_effect(() => get(filteredRepos), () => {
    filteredCount.set(get(filteredRepos).length);
  });
  legacy_pre_effect(() => get(repos), () => {
    set(organizations, [...new Set(get(repos).map((r2) => r2.owner))].sort());
  });
  legacy_pre_effect(() => get(filteredRepos), () => {
    set(groupedRepos, get(filteredRepos).reduce(
      (groups, repo) => {
        const org = repo.owner;
        if (!groups[org]) {
          groups[org] = [];
        }
        groups[org].push(repo);
        return groups;
      },
      {}
    ));
  });
  legacy_pre_effect(() => get(repos), () => {
    set(orgCounts, get(repos).reduce(
      (counts, repo) => {
        counts[repo.owner] = (counts[repo.owner] || 0) + 1;
        return counts;
      },
      {}
    ));
  });
  legacy_pre_effect(() => (get(groupedRepos), get(collapsedOrgs)), () => {
    set(allCollapsed, Object.keys(get(groupedRepos)).length > 0 && Object.keys(get(groupedRepos)).every((org) => get(collapsedOrgs).has(org)));
  });
  legacy_pre_effect_reset();
  init();
  var fragment = root$j();
  var div = first_child(fragment);
  var div_1 = child(div);
  var button = child(div_1);
  var div_2 = sibling(button, 2);
  var button_1 = child(div_2);
  var node = sibling(button_1, 2);
  {
    var consequent = ($$anchor2) => {
      var button_2 = root_1$j();
      event("click", button_2, runFullDiscovery);
      append($$anchor2, button_2);
    };
    if_block(node, ($$render) => {
      if (get(state2), untrack(() => get(state2).organizations.length > 1)) $$render(consequent);
    });
  }
  var node_1 = sibling(div, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_3 = root_2$h();
      var div_4 = child(div_3);
      var node_2 = child(div_4);
      Loader_circle(node_2, { class: "w-4 h-4 animate-spin text-blue-500" });
      var span = sibling(node_2, 2);
      var text2 = child(span);
      var button_3 = sibling(div_4, 2);
      var text_1 = child(button_3);
      template_effect(() => {
        set_text(text2, `Syncing saved repos: ${(get(state2), untrack(() => get(state2).loadedCount)) ?? ""}/${(get(state2), untrack(() => get(state2).totalCount ?? "?")) ?? ""}`);
        set_text(text_1, (get(state2), untrack(() => get(state2).paused ? "Resume sync" : "Pause sync")));
      });
      event("click", button_3, function(...$$args) {
        var _a2;
        (_a2 = get(state2).paused ? resumeSyncing : pauseSyncing) == null ? void 0 : _a2.apply(this, $$args);
      });
      append($$anchor2, div_3);
    };
    var consequent_2 = ($$anchor2) => {
      var div_5 = root_3$b();
      var div_6 = child(div_5);
      var node_3 = child(div_6);
      Loader_circle(node_3, { class: "w-4 h-4 animate-spin text-blue-500" });
      var span_1 = sibling(node_3, 2);
      var text_2 = child(span_1);
      var button_4 = sibling(div_6, 2);
      template_effect(
        ($0) => set_text(text_2, `Scanning ${$0 ?? ""}: ${(get(state2), untrack(() => get(state2).loadedCount)) ?? ""}/${(get(state2), untrack(() => get(state2).totalCount ?? "?")) ?? ""}`),
        [
          () => (get(state2), untrack(() => labelForOrg(get(state2).currentOrg)))
        ]
      );
      event("click", button_4, cancelRepoScan);
      append($$anchor2, div_5);
    };
    var consequent_5 = ($$anchor2) => {
      var div_7 = root_4$a();
      var node_4 = child(div_7);
      {
        var consequent_3 = ($$anchor3) => {
          var text_3 = text("Looking up accessible organizations…");
          append($$anchor3, text_3);
        };
        var alternate = ($$anchor3) => {
          var fragment_1 = root_6$7();
          var node_5 = sibling(first_child(fragment_1));
          {
            var consequent_4 = ($$anchor4) => {
              var span_2 = root_7$8();
              var text_4 = child(span_2);
              template_effect(() => set_text(text_4, `✓ Last scanned: ${(get(state2), untrack(() => get(state2).lastCompletedOrg)) ?? ""}`));
              append($$anchor4, span_2);
            };
            if_block(node_5, ($$render) => {
              if (get(state2), untrack(() => get(state2).lastCompletedOrg)) $$render(consequent_4);
            });
          }
          append($$anchor3, fragment_1);
        };
        if_block(node_4, ($$render) => {
          if (get(state2), untrack(() => get(state2).organizations.length === 0)) $$render(consequent_3);
          else $$render(alternate, -1);
        });
      }
      append($$anchor2, div_7);
    };
    var alternate_1 = ($$anchor2) => {
      var fragment_2 = comment();
      var node_6 = first_child(fragment_2);
      {
        var consequent_6 = ($$anchor3) => {
          var div_8 = root_9$9();
          var text_5 = child(div_8);
          template_effect(() => set_text(text_5, `✓ Finished scanning ${(get(state2), untrack(() => get(state2).lastCompletedOrg)) ?? ""}`));
          append($$anchor3, div_8);
        };
        if_block(node_6, ($$render) => {
          if (get(state2), untrack(() => get(state2).lastCompletedOrg)) $$render(consequent_6);
        });
      }
      append($$anchor2, fragment_2);
    };
    if_block(node_1, ($$render) => {
      if (get(state2), untrack(() => get(state2).phase === "streaming")) $$render(consequent_1);
      else if (get(state2), untrack(() => get(state2).phase === "discover-repos")) $$render(consequent_2, 1);
      else if (get(state2), untrack(() => get(state2).phase === "discover-orgs")) $$render(consequent_5, 2);
      else $$render(alternate_1, -1);
    });
  }
  var node_7 = sibling(node_1, 2);
  {
    var consequent_9 = ($$anchor2) => {
      var div_9 = root_10$4();
      var ul = sibling(child(div_9), 2);
      each(ul, 5, () => (get(state2), untrack(() => get(state2).organizations)), index, ($$anchor3, org) => {
        var li = root_11$1();
        var button_5 = child(li);
        var node_8 = child(button_5);
        {
          var consequent_7 = ($$anchor4) => {
            var img = root_12$3();
            template_effect(() => {
              set_attribute(img, "src", (get(org), untrack(() => get(org).avatar_url)));
              set_attribute(img, "alt", (get(org), untrack(() => get(org).label)));
            });
            append($$anchor4, img);
          };
          if_block(node_8, ($$render) => {
            if (get(org), untrack(() => get(org).avatar_url)) $$render(consequent_7);
          });
        }
        var span_3 = sibling(node_8, 2);
        var text_6 = child(span_3);
        var node_9 = sibling(button_5, 2);
        {
          var consequent_8 = ($$anchor4) => {
            var p = root_13$3();
            var text_7 = child(p);
            template_effect(() => set_text(text_7, `Scanning ${(get(state2), untrack(() => get(state2).loadedCount)) ?? ""}/${(get(state2), untrack(() => get(state2).totalCount ?? "?")) ?? ""}…`));
            append($$anchor4, p);
          };
          if_block(node_9, ($$render) => {
            if (get(state2), get(org), untrack(() => get(state2).phase === "discover-repos" && get(state2).currentOrg === get(org).id)) $$render(consequent_8);
          });
        }
        template_effect(
          ($0) => {
            button_5.disabled = (get(state2), untrack(() => get(state2).phase === "discover-repos"));
            set_text(text_6, $0);
          },
          [
            () => (get(org), untrack(() => labelForOrg(get(org).id)))
          ]
        );
        event("click", button_5, () => {
          discoverOrgRepos(get(org).id);
          set(collapsedOrgs, new Set(Object.keys(get(groupedRepos))));
        });
        append($$anchor3, li);
      });
      append($$anchor2, div_9);
    };
    if_block(node_7, ($$render) => {
      if (get(state2), untrack(() => get(state2).organizations.length > 0)) $$render(consequent_9);
    });
  }
  var node_10 = sibling(node_7, 2);
  {
    var consequent_11 = ($$anchor2) => {
      var div_10 = root_14$4();
      var button_6 = child(div_10);
      var node_11 = child(button_6);
      {
        var consequent_10 = ($$anchor3) => {
          var svg = root_15$4();
          append($$anchor3, svg);
        };
        var alternate_2 = ($$anchor3) => {
          var svg_1 = root_16$4();
          append($$anchor3, svg_1);
        };
        if_block(node_11, ($$render) => {
          if (get(allCollapsed)) $$render(consequent_10);
          else $$render(alternate_2, -1);
        });
      }
      var select = sibling(button_6, 2);
      var option = child(select);
      var text_8 = child(option);
      option.value = option.__value = "all";
      var node_12 = sibling(option);
      each(node_12, 1, () => get(organizations), index, ($$anchor3, org) => {
        var option_1 = root_17$4();
        var text_9 = child(option_1);
        var option_1_value = {};
        template_effect(() => {
          set_text(text_9, `${get(org) ?? ""} (${(get(orgCounts), get(org), untrack(() => get(orgCounts)[get(org)] || 0)) ?? ""})`);
          if (option_1_value !== (option_1_value = get(org))) {
            option_1.value = (option_1.__value = get(org)) ?? "";
          }
        });
        append($$anchor3, option_1);
      });
      template_effect(() => {
        set_attribute(button_6, "title", get(allCollapsed) ? "Expand all organizations" : "Collapse all organizations");
        set_text(text_8, `All organizations (${(get(repos), untrack(() => get(repos).length)) ?? ""})`);
      });
      event("click", button_6, toggleAllOrgs);
      bind_select_value(select, () => get(selectedOrg), ($$value) => set(selectedOrg, $$value));
      append($$anchor2, div_10);
    };
    if_block(node_10, ($$render) => {
      if (get(organizations), untrack(() => get(organizations).length > 1)) $$render(consequent_11);
    });
  }
  var div_11 = sibling(node_10, 2);
  var label = child(div_11);
  var input = child(label);
  var label_1 = sibling(label, 2);
  var input_1 = child(label_1);
  var label_2 = sibling(label_1, 2);
  var input_2 = child(label_2);
  var label_3 = sibling(label_2, 2);
  var input_3 = child(label_3);
  var node_13 = sibling(div_11, 2);
  {
    var consequent_16 = ($$anchor2) => {
      var div_12 = root_18$3();
      each(
        div_12,
        5,
        () => (get(groupedRepos), untrack(() => Object.entries(get(groupedRepos)).sort((a, b) => a[0].localeCompare(b[0])))),
        index,
        ($$anchor3, $$item) => {
          var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 2));
          let org = () => get($$array)[0];
          let orgRepos = () => get($$array)[1];
          var div_13 = root_19$1();
          var button_7 = child(div_13);
          var div_14 = child(button_7);
          var svg_2 = child(div_14);
          var span_4 = sibling(svg_2, 2);
          var text_10 = child(span_4);
          var span_5 = sibling(span_4, 2);
          var text_11 = child(span_5);
          var node_14 = sibling(button_7, 2);
          {
            var consequent_15 = ($$anchor4) => {
              var div_15 = root_20$1();
              each(div_15, 5, orgRepos, (repo) => repo.full_name, ($$anchor5, repo) => {
                var div_16 = root_21$1();
                var div_17 = child(div_16);
                var button_8 = child(div_17);
                var text_12 = child(button_8);
                var span_6 = sibling(button_8, 2);
                var text_13 = child(span_6);
                var node_15 = sibling(text_13);
                {
                  var consequent_14 = ($$anchor6) => {
                    var fragment_3 = comment();
                    var node_16 = first_child(fragment_3);
                    {
                      var consequent_12 = ($$anchor7) => {
                        var span_7 = root_23$1();
                        append($$anchor7, span_7);
                      };
                      var consequent_13 = ($$anchor7) => {
                        var span_8 = root_24$1();
                        append($$anchor7, span_8);
                      };
                      if_block(node_16, ($$render) => {
                        if (get(repo), untrack(() => get(repo).config.binary_storage_type === "google_drive")) $$render(consequent_12);
                        else if (get(repo), untrack(() => get(repo).config.binary_storage_type === "s3")) $$render(consequent_13, 1);
                      });
                    }
                    append($$anchor6, fragment_3);
                  };
                  if_block(node_15, ($$render) => {
                    if (get(repo), untrack(() => {
                      var _a2, _b2;
                      return (_b2 = (_a2 = get(repo).config) == null ? void 0 : _a2.storage_info) == null ? void 0 : _b2.url;
                    })) $$render(consequent_14);
                  });
                }
                var button_9 = sibling(div_17, 2);
                var node_17 = child(button_9);
                Trash_2(node_17, { class: "w-4 h-4 text-red-500 hover:text-red-700" });
                template_effect(() => {
                  set_class(div_16, 1, `flex items-center justify-between px-3 py-2 hover:bg-blue-50 border-t border-gray-100 ${($selectedRepo(), get(repo), untrack(() => {
                    var _a2;
                    return ((_a2 = $selectedRepo()) == null ? void 0 : _a2.full_name) === get(repo).full_name ? "bg-blue-100" : "";
                  })) ?? ""}`);
                  set_class(button_8, 1, `font-medium hover:underline cursor-pointer ${($selectedRepo(), get(repo), untrack(() => {
                    var _a2;
                    return ((_a2 = $selectedRepo()) == null ? void 0 : _a2.full_name) === get(repo).full_name ? "text-blue-900 font-semibold" : "text-blue-700";
                  })) ?? ""}`);
                  set_text(text_12, (get(repo), untrack(() => get(repo).name)));
                  set_text(text_13, `${(get(repo), untrack(() => get(repo).private ? "🔒" : "🌐")) ?? ""}
                                        ${(get(repo), untrack(() => get(repo).has_messages ? "💬" : "")) ?? ""} `);
                });
                event("click", button_8, () => showRepo(get(repo)));
                event("click", button_9, () => removeRepo(get(repo).full_name));
                append($$anchor5, div_16);
              });
              append($$anchor4, div_15);
            };
            var d = /* @__PURE__ */ user_derived(() => (get(collapsedOrgs), org(), untrack(() => !get(collapsedOrgs).has(org()))));
            if_block(node_14, ($$render) => {
              if (get(d)) $$render(consequent_15);
            });
          }
          template_effect(
            ($0) => {
              set_class(svg_2, 0, `w-4 h-4 text-gray-500 transition-transform ${$0 ?? ""}`);
              set_text(text_10, org());
              set_text(text_11, `(${(orgRepos(), untrack(() => orgRepos().length)) ?? ""} of ${(get(orgCounts), org(), untrack(() => get(orgCounts)[org()] || 0)) ?? ""})`);
            },
            [
              () => (get(collapsedOrgs), org(), untrack(() => get(collapsedOrgs).has(org()) ? "" : "rotate-90"))
            ]
          );
          event("click", button_7, () => toggleOrgCollapse(org()));
          append($$anchor3, div_13);
        }
      );
      append($$anchor2, div_12);
    };
    var alternate_3 = ($$anchor2) => {
      var p_1 = root_25$1();
      append($$anchor2, p_1);
    };
    if_block(node_13, ($$render) => {
      if (get(filteredRepos), untrack(() => get(filteredRepos).length > 0)) $$render(consequent_16);
      else $$render(alternate_3, -1);
    });
  }
  event("click", button, triggerSync);
  event("click", button_1, discoverOrgs);
  bind_checked(input, () => get(showPrivate), ($$value) => set(showPrivate, $$value));
  bind_checked(input_1, () => get(showPublic), ($$value) => set(showPublic, $$value));
  bind_checked(input_2, () => get(showWithMessages), ($$value) => set(showWithMessages, $$value));
  bind_checked(input_3, () => get(showWithoutMessages), ($$value) => set(showWithoutMessages, $$value));
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
const CALL_HISTORY_PATH = "call-history.json";
const REPO_NAME$2 = "skygit-config";
async function getCallHistory(token, username) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME$2}/contents/${CALL_HISTORY_PATH}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      console.error("[CallHistory] Failed to fetch call history");
      return [];
    }
    const data = await response.json();
    const content = JSON.parse(atob(data.content));
    return content.calls || [];
  } catch (error) {
    console.error("[CallHistory] Error fetching call history:", error);
    return [];
  }
}
async function addCallToHistory(token, username, callRecord) {
  try {
    let existingCalls = [];
    let sha = null;
    const getResponse = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME$2}/contents/${CALL_HISTORY_PATH}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
      const content2 = JSON.parse(atob(data.content));
      existingCalls = content2.calls || [];
    }
    const newCalls = [callRecord, ...existingCalls];
    const limitedCalls = newCalls.slice(0, 100);
    const content = btoa(JSON.stringify({ calls: limitedCalls }, null, 2));
    const putBody = {
      message: `Add call record: ${callRecord.type} with ${callRecord.remotePeer}`,
      content
    };
    if (sha) {
      putBody.sha = sha;
    }
    const putResponse = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME$2}/contents/${CALL_HISTORY_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(putBody)
      }
    );
    if (!putResponse.ok) {
      console.error("[CallHistory] Failed to save call record");
    } else {
      console.log("[CallHistory] Call record saved successfully");
    }
  } catch (error) {
    console.error("[CallHistory] Error saving call record:", error);
  }
}
function createCallRecord({
  remotePeer,
  type = "video",
  // 'video' | 'audio'
  direction = "outgoing",
  // 'incoming' | 'outgoing' | 'missed'
  startTime,
  endTime,
  duration,
  // in seconds
  recordingUrl = null,
  repoContext = null
  // which repo/conversation the call was from
}) {
  return {
    id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    remotePeer,
    type,
    direction,
    startTime: startTime || (/* @__PURE__ */ new Date()).toISOString(),
    endTime: endTime || (/* @__PURE__ */ new Date()).toISOString(),
    duration: duration || 0,
    recordingUrl,
    repoContext,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
var root_1$i = /* @__PURE__ */ from_html(`<div class="flex items-center justify-center py-8"><div class="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>`);
var root_2$g = /* @__PURE__ */ from_html(`<div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg"> </div>`);
var root_3$a = /* @__PURE__ */ from_html(`<div class="text-center py-8 text-gray-500"><!> <p class="text-sm">No calls yet</p> <p class="text-xs mt-1">Your call history will appear here</p></div>`);
var root_7$7 = /* @__PURE__ */ from_html(`<span>•</span> <span class="flex items-center gap-1"><!> </span>`, 1);
var root_8$6 = /* @__PURE__ */ from_html(`<div class="text-xs text-gray-400 mt-1 truncate"> </div>`);
var root_9$8 = /* @__PURE__ */ from_html(`<a target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">Recording</a>`);
var root_5$8 = /* @__PURE__ */ from_html(`<div class="bg-white border rounded-lg p-3 hover:bg-gray-50 transition-colors"><div class="flex items-start gap-3"><div class="flex-shrink-0 mt-1"><!></div> <div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="font-medium text-gray-800 truncate"> </span> <!></div> <div class="flex items-center gap-2 text-xs text-gray-500 mt-1"><span> </span> <!></div> <!></div> <!></div></div>`);
var root_4$9 = /* @__PURE__ */ from_html(`<div class="space-y-2"></div>`);
var root$i = /* @__PURE__ */ from_html(`<div class="p-4"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2"><!> Call History</h2> <button class="text-sm text-blue-600 hover:text-blue-800">Refresh</button></div> <!></div>`);
function SidebarCalls($$anchor, $$props) {
  push($$props, false);
  const $authStore = () => store_get(authStore, "$authStore", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  let calls = /* @__PURE__ */ mutable_source([]);
  let loading = /* @__PURE__ */ mutable_source(true);
  let error = /* @__PURE__ */ mutable_source(null);
  onMount(async () => {
    await fetchCallHistory();
  });
  async function fetchCallHistory() {
    var _a2;
    set(loading, true);
    set(error, null);
    const auth = $authStore();
    if (!(auth == null ? void 0 : auth.token) || !((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
      set(loading, false);
      return;
    }
    try {
      set(calls, await getCallHistory(auth.token, auth.user.login));
    } catch (err) {
      console.error("[SidebarCalls] Failed to fetch call history:", err);
      set(error, "Failed to load call history");
    } finally {
      set(loading, false);
    }
  }
  function formatDuration(seconds) {
    if (!seconds || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now2 = /* @__PURE__ */ new Date();
    const diff = now2 - date;
    if (diff < 864e5) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diff < 6048e5) {
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  }
  function getDirectionIcon(direction) {
    switch (direction) {
      case "incoming":
        return Phone_incoming;
      case "outgoing":
        return Phone_outgoing;
      case "missed":
        return Phone_missed;
      default:
        return Phone;
    }
  }
  function getDirectionColor(direction) {
    switch (direction) {
      case "incoming":
        return "text-green-600";
      case "outgoing":
        return "text-blue-600";
      case "missed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }
  init();
  var div = root$i();
  var div_1 = child(div);
  var h2 = child(div_1);
  var node = child(h2);
  Phone(node, { size: 20, class: "text-blue-600" });
  var button = sibling(h2, 2);
  var node_1 = sibling(div_1, 2);
  {
    var consequent = ($$anchor2) => {
      var div_2 = root_1$i();
      append($$anchor2, div_2);
    };
    var consequent_1 = ($$anchor2) => {
      var div_3 = root_2$g();
      var text2 = child(div_3);
      template_effect(() => set_text(text2, get(error)));
      append($$anchor2, div_3);
    };
    var consequent_2 = ($$anchor2) => {
      var div_4 = root_3$a();
      var node_2 = child(div_4);
      Phone(node_2, { size: 48, class: "mx-auto mb-3 opacity-30" });
      append($$anchor2, div_4);
    };
    var alternate = ($$anchor2) => {
      var div_5 = root_4$9();
      each(div_5, 5, () => get(calls), (call) => call.id, ($$anchor3, call) => {
        var div_6 = root_5$8();
        var div_7 = child(div_6);
        var div_8 = child(div_7);
        var node_3 = child(div_8);
        {
          let $0 = /* @__PURE__ */ derived_safe_equal(() => getDirectionColor(get(call).direction));
          component(node_3, () => getDirectionIcon(get(call).direction), ($$anchor4, $$component) => {
            $$component($$anchor4, {
              size: 18,
              get class() {
                return get($0);
              }
            });
          });
        }
        var div_9 = sibling(div_8, 2);
        var div_10 = child(div_9);
        var span = child(div_10);
        var text_1 = child(span);
        var node_4 = sibling(span, 2);
        {
          var consequent_3 = ($$anchor4) => {
            Video($$anchor4, { size: 14, class: "text-gray-400" });
          };
          if_block(node_4, ($$render) => {
            if (get(call).type === "video") $$render(consequent_3);
          });
        }
        var div_11 = sibling(div_10, 2);
        var span_1 = child(div_11);
        var text_2 = child(span_1);
        var node_5 = sibling(span_1, 2);
        {
          var consequent_4 = ($$anchor4) => {
            var fragment_1 = root_7$7();
            var span_2 = sibling(first_child(fragment_1), 2);
            var node_6 = child(span_2);
            Clock(node_6, { size: 10 });
            var text_3 = sibling(node_6);
            template_effect(($0) => set_text(text_3, ` ${$0 ?? ""}`), [() => formatDuration(get(call).duration)]);
            append($$anchor4, fragment_1);
          };
          if_block(node_5, ($$render) => {
            if (get(call).duration > 0) $$render(consequent_4);
          });
        }
        var node_7 = sibling(div_11, 2);
        {
          var consequent_5 = ($$anchor4) => {
            var div_12 = root_8$6();
            var text_4 = child(div_12);
            template_effect(() => set_text(text_4, get(call).repoContext));
            append($$anchor4, div_12);
          };
          if_block(node_7, ($$render) => {
            if (get(call).repoContext) $$render(consequent_5);
          });
        }
        var node_8 = sibling(div_9, 2);
        {
          var consequent_6 = ($$anchor4) => {
            var a = root_9$8();
            template_effect(() => set_attribute(a, "href", get(call).recordingUrl));
            append($$anchor4, a);
          };
          if_block(node_8, ($$render) => {
            if (get(call).recordingUrl) $$render(consequent_6);
          });
        }
        template_effect(
          ($0) => {
            set_text(text_1, get(call).remotePeer);
            set_text(text_2, $0);
          },
          [() => formatDate(get(call).startTime)]
        );
        append($$anchor3, div_6);
      });
      append($$anchor2, div_5);
    };
    if_block(node_1, ($$render) => {
      if (get(loading)) $$render(consequent);
      else if (get(error)) $$render(consequent_1, 1);
      else if (get(calls).length === 0) $$render(consequent_2, 2);
      else $$render(alternate, -1);
    });
  }
  event("click", button, fetchCallHistory);
  append($$anchor, div);
  pop();
  $$cleanup();
}
const peerConnections = writable({});
const onlinePeers = writable([]);
const typingUsers = writable({});
const contacts = writable({});
const lastMessages = writable({});
function loadContacts(orgId) {
  try {
    const key2 = `skygit_peers_${orgId}`;
    const stored = localStorage.getItem(key2);
    if (stored) {
      const peers = JSON.parse(stored);
      const contactMap = {};
      peers.forEach((peer) => {
        contactMap[peer.username.toLowerCase()] = {
          peerId: peer.peerId,
          username: peer.username.toLowerCase(),
          conversations: peer.conversations || [],
          isLeader: peer.isLeader || false,
          lastSeen: peer.lastSeen,
          online: false
          // Will be updated from peerConnections
        };
      });
      contacts.set(contactMap);
      console.log("[Contacts] Loaded", peers.length, "contacts for org:", orgId);
    }
  } catch (error) {
    console.error("[Contacts] Failed to load contacts:", error);
  }
}
function updateContactsOnlineStatus() {
  const conns = get$1(peerConnections);
  const currentContacts = get$1(contacts);
  const updated = { ...currentContacts };
  Object.keys(updated).forEach((username) => {
    updated[username].online = false;
  });
  Object.values(conns).forEach(({ username, status }) => {
    if (updated[username] && status === "connected") {
      updated[username].online = true;
    }
  });
  contacts.set(updated);
}
function updateContact(username, contactData) {
  const lowerUser = username.toLowerCase();
  contacts.update((contacts2) => ({
    ...contacts2,
    [lowerUser]: {
      ...contacts2[lowerUser],
      ...contactData,
      username: lowerUser
      // Ensure username is consistent
    }
  }));
}
function setLastMessage(username, message) {
  const lowerUser = username.toLowerCase();
  lastMessages.update((messages) => ({
    ...messages,
    [lowerUser]: {
      content: message.content,
      timestamp: message.timestamp,
      sender: message.sender
    }
  }));
}
const sortedContacts = derived$1(
  [contacts, lastMessages, peerConnections],
  ([$contacts, $lastMessages, $peerConnections]) => {
    const contactList = Object.values($contacts);
    contactList.forEach((contact) => {
      const conn = Object.values($peerConnections).find((c) => c.username === contact.username);
      contact.online = (conn == null ? void 0 : conn.status) === "connected";
      contact.userAgent = (conn == null ? void 0 : conn.userAgent) || 0;
    });
    return contactList.sort((a, b) => {
      var _a2, _b2;
      if (a.online !== b.online) {
        return b.online - a.online;
      }
      const aLastMsg = ((_a2 = $lastMessages[a.username]) == null ? void 0 : _a2.timestamp) || 0;
      const bLastMsg = ((_b2 = $lastMessages[b.username]) == null ? void 0 : _b2.timestamp) || 0;
      if (aLastMsg !== bLastMsg) {
        return bLastMsg - aLastMsg;
      }
      return a.username.localeCompare(b.username);
    });
  }
);
class $e8379818650e2442$export$93654d4f2d6cd524 {
  constructor() {
    this.encoder = new TextEncoder();
    this._pieces = [];
    this._parts = [];
  }
  append_buffer(data) {
    this.flush();
    this._parts.push(data);
  }
  append(data) {
    this._pieces.push(data);
  }
  flush() {
    if (this._pieces.length > 0) {
      const buf = new Uint8Array(this._pieces);
      this._parts.push(buf);
      this._pieces = [];
    }
  }
  toArrayBuffer() {
    const buffer = [];
    for (const part of this._parts) buffer.push(part);
    return $e8379818650e2442$var$concatArrayBuffers(buffer).buffer;
  }
}
function $e8379818650e2442$var$concatArrayBuffers(bufs) {
  let size = 0;
  for (const buf of bufs) size += buf.byteLength;
  const result = new Uint8Array(size);
  let offset = 0;
  for (const buf of bufs) {
    const view = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    result.set(view, offset);
    offset += buf.byteLength;
  }
  return result;
}
function $0cfd7828ad59115f$export$417857010dc9287f(data) {
  const unpacker = new $0cfd7828ad59115f$var$Unpacker(data);
  return unpacker.unpack();
}
function $0cfd7828ad59115f$export$2a703dbb0cb35339(data) {
  const packer = new $0cfd7828ad59115f$export$b9ec4b114aa40074();
  const res = packer.pack(data);
  if (res instanceof Promise) return res.then(() => packer.getBuffer());
  return packer.getBuffer();
}
class $0cfd7828ad59115f$var$Unpacker {
  constructor(data) {
    this.index = 0;
    this.dataBuffer = data;
    this.dataView = new Uint8Array(this.dataBuffer);
    this.length = this.dataBuffer.byteLength;
  }
  unpack() {
    const type = this.unpack_uint8();
    if (type < 128) return type;
    else if ((type ^ 224) < 32) return (type ^ 224) - 32;
    let size;
    if ((size = type ^ 160) <= 15) return this.unpack_raw(size);
    else if ((size = type ^ 176) <= 15) return this.unpack_string(size);
    else if ((size = type ^ 144) <= 15) return this.unpack_array(size);
    else if ((size = type ^ 128) <= 15) return this.unpack_map(size);
    switch (type) {
      case 192:
        return null;
      case 193:
        return void 0;
      case 194:
        return false;
      case 195:
        return true;
      case 202:
        return this.unpack_float();
      case 203:
        return this.unpack_double();
      case 204:
        return this.unpack_uint8();
      case 205:
        return this.unpack_uint16();
      case 206:
        return this.unpack_uint32();
      case 207:
        return this.unpack_uint64();
      case 208:
        return this.unpack_int8();
      case 209:
        return this.unpack_int16();
      case 210:
        return this.unpack_int32();
      case 211:
        return this.unpack_int64();
      case 212:
        return void 0;
      case 213:
        return void 0;
      case 214:
        return void 0;
      case 215:
        return void 0;
      case 216:
        size = this.unpack_uint16();
        return this.unpack_string(size);
      case 217:
        size = this.unpack_uint32();
        return this.unpack_string(size);
      case 218:
        size = this.unpack_uint16();
        return this.unpack_raw(size);
      case 219:
        size = this.unpack_uint32();
        return this.unpack_raw(size);
      case 220:
        size = this.unpack_uint16();
        return this.unpack_array(size);
      case 221:
        size = this.unpack_uint32();
        return this.unpack_array(size);
      case 222:
        size = this.unpack_uint16();
        return this.unpack_map(size);
      case 223:
        size = this.unpack_uint32();
        return this.unpack_map(size);
    }
  }
  unpack_uint8() {
    const byte = this.dataView[this.index] & 255;
    this.index++;
    return byte;
  }
  unpack_uint16() {
    const bytes = this.read(2);
    const uint16 = (bytes[0] & 255) * 256 + (bytes[1] & 255);
    this.index += 2;
    return uint16;
  }
  unpack_uint32() {
    const bytes = this.read(4);
    const uint32 = ((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3];
    this.index += 4;
    return uint32;
  }
  unpack_uint64() {
    const bytes = this.read(8);
    const uint64 = ((((((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3]) * 256 + bytes[4]) * 256 + bytes[5]) * 256 + bytes[6]) * 256 + bytes[7];
    this.index += 8;
    return uint64;
  }
  unpack_int8() {
    const uint8 = this.unpack_uint8();
    return uint8 < 128 ? uint8 : uint8 - 256;
  }
  unpack_int16() {
    const uint16 = this.unpack_uint16();
    return uint16 < 32768 ? uint16 : uint16 - 65536;
  }
  unpack_int32() {
    const uint32 = this.unpack_uint32();
    return uint32 < 2 ** 31 ? uint32 : uint32 - 2 ** 32;
  }
  unpack_int64() {
    const uint64 = this.unpack_uint64();
    return uint64 < 2 ** 63 ? uint64 : uint64 - 2 ** 64;
  }
  unpack_raw(size) {
    if (this.length < this.index + size) throw new Error(`BinaryPackFailure: index is out of range ${this.index} ${size} ${this.length}`);
    const buf = this.dataBuffer.slice(this.index, this.index + size);
    this.index += size;
    return buf;
  }
  unpack_string(size) {
    const bytes = this.read(size);
    let i = 0;
    let str = "";
    let c;
    let code;
    while (i < size) {
      c = bytes[i];
      if (c < 160) {
        code = c;
        i++;
      } else if ((c ^ 192) < 32) {
        code = (c & 31) << 6 | bytes[i + 1] & 63;
        i += 2;
      } else if ((c ^ 224) < 16) {
        code = (c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63;
        i += 3;
      } else {
        code = (c & 7) << 18 | (bytes[i + 1] & 63) << 12 | (bytes[i + 2] & 63) << 6 | bytes[i + 3] & 63;
        i += 4;
      }
      str += String.fromCodePoint(code);
    }
    this.index += size;
    return str;
  }
  unpack_array(size) {
    const objects = new Array(size);
    for (let i = 0; i < size; i++) objects[i] = this.unpack();
    return objects;
  }
  unpack_map(size) {
    const map = {};
    for (let i = 0; i < size; i++) {
      const key2 = this.unpack();
      map[key2] = this.unpack();
    }
    return map;
  }
  unpack_float() {
    const uint32 = this.unpack_uint32();
    const sign = uint32 >> 31;
    const exp = (uint32 >> 23 & 255) - 127;
    const fraction = uint32 & 8388607 | 8388608;
    return (sign === 0 ? 1 : -1) * fraction * 2 ** (exp - 23);
  }
  unpack_double() {
    const h32 = this.unpack_uint32();
    const l32 = this.unpack_uint32();
    const sign = h32 >> 31;
    const exp = (h32 >> 20 & 2047) - 1023;
    const hfrac = h32 & 1048575 | 1048576;
    const frac = hfrac * 2 ** (exp - 20) + l32 * 2 ** (exp - 52);
    return (sign === 0 ? 1 : -1) * frac;
  }
  read(length) {
    const j = this.index;
    if (j + length <= this.length) return this.dataView.subarray(j, j + length);
    else throw new Error("BinaryPackFailure: read index out of range");
  }
}
class $0cfd7828ad59115f$export$b9ec4b114aa40074 {
  getBuffer() {
    return this._bufferBuilder.toArrayBuffer();
  }
  pack(value) {
    if (typeof value === "string") this.pack_string(value);
    else if (typeof value === "number") {
      if (Math.floor(value) === value) this.pack_integer(value);
      else this.pack_double(value);
    } else if (typeof value === "boolean") {
      if (value === true) this._bufferBuilder.append(195);
      else if (value === false) this._bufferBuilder.append(194);
    } else if (value === void 0) this._bufferBuilder.append(192);
    else if (typeof value === "object") {
      if (value === null) this._bufferBuilder.append(192);
      else {
        const constructor = value.constructor;
        if (value instanceof Array) {
          const res = this.pack_array(value);
          if (res instanceof Promise) return res.then(() => this._bufferBuilder.flush());
        } else if (value instanceof ArrayBuffer) this.pack_bin(new Uint8Array(value));
        else if ("BYTES_PER_ELEMENT" in value) {
          const v = value;
          this.pack_bin(new Uint8Array(v.buffer, v.byteOffset, v.byteLength));
        } else if (value instanceof Date) this.pack_string(value.toString());
        else if (value instanceof Blob) return value.arrayBuffer().then((buffer) => {
          this.pack_bin(new Uint8Array(buffer));
          this._bufferBuilder.flush();
        });
        else if (constructor == Object || constructor.toString().startsWith("class")) {
          const res = this.pack_object(value);
          if (res instanceof Promise) return res.then(() => this._bufferBuilder.flush());
        } else throw new Error(`Type "${constructor.toString()}" not yet supported`);
      }
    } else throw new Error(`Type "${typeof value}" not yet supported`);
    this._bufferBuilder.flush();
  }
  pack_bin(blob) {
    const length = blob.length;
    if (length <= 15) this.pack_uint8(160 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(218);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(219);
      this.pack_uint32(length);
    } else throw new Error("Invalid length");
    this._bufferBuilder.append_buffer(blob);
  }
  pack_string(str) {
    const encoded = this._textEncoder.encode(str);
    const length = encoded.length;
    if (length <= 15) this.pack_uint8(176 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(216);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(217);
      this.pack_uint32(length);
    } else throw new Error("Invalid length");
    this._bufferBuilder.append_buffer(encoded);
  }
  pack_array(ary) {
    const length = ary.length;
    if (length <= 15) this.pack_uint8(144 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(220);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(221);
      this.pack_uint32(length);
    } else throw new Error("Invalid length");
    const packNext = (index2) => {
      if (index2 < length) {
        const res = this.pack(ary[index2]);
        if (res instanceof Promise) return res.then(() => packNext(index2 + 1));
        return packNext(index2 + 1);
      }
    };
    return packNext(0);
  }
  pack_integer(num) {
    if (num >= -32 && num <= 127) this._bufferBuilder.append(num & 255);
    else if (num >= 0 && num <= 255) {
      this._bufferBuilder.append(204);
      this.pack_uint8(num);
    } else if (num >= -128 && num <= 127) {
      this._bufferBuilder.append(208);
      this.pack_int8(num);
    } else if (num >= 0 && num <= 65535) {
      this._bufferBuilder.append(205);
      this.pack_uint16(num);
    } else if (num >= -32768 && num <= 32767) {
      this._bufferBuilder.append(209);
      this.pack_int16(num);
    } else if (num >= 0 && num <= 4294967295) {
      this._bufferBuilder.append(206);
      this.pack_uint32(num);
    } else if (num >= -2147483648 && num <= 2147483647) {
      this._bufferBuilder.append(210);
      this.pack_int32(num);
    } else if (num >= -9223372036854776e3 && num <= 9223372036854776e3) {
      this._bufferBuilder.append(211);
      this.pack_int64(num);
    } else if (num >= 0 && num <= 18446744073709552e3) {
      this._bufferBuilder.append(207);
      this.pack_uint64(num);
    } else throw new Error("Invalid integer");
  }
  pack_double(num) {
    let sign = 0;
    if (num < 0) {
      sign = 1;
      num = -num;
    }
    const exp = Math.floor(Math.log(num) / Math.LN2);
    const frac0 = num / 2 ** exp - 1;
    const frac1 = Math.floor(frac0 * 2 ** 52);
    const b32 = 2 ** 32;
    const h32 = sign << 31 | exp + 1023 << 20 | frac1 / b32 & 1048575;
    const l32 = frac1 % b32;
    this._bufferBuilder.append(203);
    this.pack_int32(h32);
    this.pack_int32(l32);
  }
  pack_object(obj) {
    const keys = Object.keys(obj);
    const length = keys.length;
    if (length <= 15) this.pack_uint8(128 + length);
    else if (length <= 65535) {
      this._bufferBuilder.append(222);
      this.pack_uint16(length);
    } else if (length <= 4294967295) {
      this._bufferBuilder.append(223);
      this.pack_uint32(length);
    } else throw new Error("Invalid length");
    const packNext = (index2) => {
      if (index2 < keys.length) {
        const prop2 = keys[index2];
        if (obj.hasOwnProperty(prop2)) {
          this.pack(prop2);
          const res = this.pack(obj[prop2]);
          if (res instanceof Promise) return res.then(() => packNext(index2 + 1));
        }
        return packNext(index2 + 1);
      }
    };
    return packNext(0);
  }
  pack_uint8(num) {
    this._bufferBuilder.append(num);
  }
  pack_uint16(num) {
    this._bufferBuilder.append(num >> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_uint32(num) {
    const n = num & 4294967295;
    this._bufferBuilder.append((n & 4278190080) >>> 24);
    this._bufferBuilder.append((n & 16711680) >>> 16);
    this._bufferBuilder.append((n & 65280) >>> 8);
    this._bufferBuilder.append(n & 255);
  }
  pack_uint64(num) {
    const high = num / 2 ** 32;
    const low = num % 2 ** 32;
    this._bufferBuilder.append((high & 4278190080) >>> 24);
    this._bufferBuilder.append((high & 16711680) >>> 16);
    this._bufferBuilder.append((high & 65280) >>> 8);
    this._bufferBuilder.append(high & 255);
    this._bufferBuilder.append((low & 4278190080) >>> 24);
    this._bufferBuilder.append((low & 16711680) >>> 16);
    this._bufferBuilder.append((low & 65280) >>> 8);
    this._bufferBuilder.append(low & 255);
  }
  pack_int8(num) {
    this._bufferBuilder.append(num & 255);
  }
  pack_int16(num) {
    this._bufferBuilder.append((num & 65280) >> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_int32(num) {
    this._bufferBuilder.append(num >>> 24 & 255);
    this._bufferBuilder.append((num & 16711680) >>> 16);
    this._bufferBuilder.append((num & 65280) >>> 8);
    this._bufferBuilder.append(num & 255);
  }
  pack_int64(num) {
    const high = Math.floor(num / 2 ** 32);
    const low = num % 2 ** 32;
    this._bufferBuilder.append((high & 4278190080) >>> 24);
    this._bufferBuilder.append((high & 16711680) >>> 16);
    this._bufferBuilder.append((high & 65280) >>> 8);
    this._bufferBuilder.append(high & 255);
    this._bufferBuilder.append((low & 4278190080) >>> 24);
    this._bufferBuilder.append((low & 16711680) >>> 16);
    this._bufferBuilder.append((low & 65280) >>> 8);
    this._bufferBuilder.append(low & 255);
  }
  constructor() {
    this._bufferBuilder = new $e8379818650e2442$export$93654d4f2d6cd524();
    this._textEncoder = new TextEncoder();
  }
}
let logDisabled_ = true;
let deprecationWarnings_ = true;
function extractVersion(uastring, expr, pos) {
  const match = uastring.match(expr);
  return match && match.length >= pos && parseFloat(match[pos], 10);
}
function wrapPeerConnectionEvent(window2, eventNameToWrap, wrapper) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  const nativeAddEventListener = proto.addEventListener;
  proto.addEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap) {
      return nativeAddEventListener.apply(this, arguments);
    }
    const wrappedCallback = (e) => {
      const modifiedEvent = wrapper(e);
      if (modifiedEvent) {
        if (cb.handleEvent) {
          cb.handleEvent(modifiedEvent);
        } else {
          cb(modifiedEvent);
        }
      }
    };
    this._eventMap = this._eventMap || {};
    if (!this._eventMap[eventNameToWrap]) {
      this._eventMap[eventNameToWrap] = /* @__PURE__ */ new Map();
    }
    this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
    return nativeAddEventListener.apply(this, [
      nativeEventName,
      wrappedCallback
    ]);
  };
  const nativeRemoveEventListener = proto.removeEventListener;
  proto.removeEventListener = function(nativeEventName, cb) {
    if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    if (!this._eventMap[eventNameToWrap].has(cb)) {
      return nativeRemoveEventListener.apply(this, arguments);
    }
    const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
    this._eventMap[eventNameToWrap].delete(cb);
    if (this._eventMap[eventNameToWrap].size === 0) {
      delete this._eventMap[eventNameToWrap];
    }
    if (Object.keys(this._eventMap).length === 0) {
      delete this._eventMap;
    }
    return nativeRemoveEventListener.apply(this, [
      nativeEventName,
      unwrappedCb
    ]);
  };
  Object.defineProperty(proto, "on" + eventNameToWrap, {
    get() {
      return this["_on" + eventNameToWrap];
    },
    set(cb) {
      if (this["_on" + eventNameToWrap]) {
        this.removeEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap]
        );
        delete this["_on" + eventNameToWrap];
      }
      if (cb) {
        this.addEventListener(
          eventNameToWrap,
          this["_on" + eventNameToWrap] = cb
        );
      }
    },
    enumerable: true,
    configurable: true
  });
}
function disableLog(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  logDisabled_ = bool;
  return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
}
function disableWarnings(bool) {
  if (typeof bool !== "boolean") {
    return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
  }
  deprecationWarnings_ = !bool;
  return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
}
function log() {
  if (typeof window === "object") {
    if (logDisabled_) {
      return;
    }
    if (typeof console !== "undefined" && typeof console.log === "function") {
      console.log.apply(console, arguments);
    }
  }
}
function deprecated(oldMethod, newMethod) {
  if (!deprecationWarnings_) {
    return;
  }
  console.warn(oldMethod + " is deprecated, please use " + newMethod + " instead.");
}
function detectBrowser(window2) {
  const result = { browser: null, version: null };
  if (typeof window2 === "undefined" || !window2.navigator || !window2.navigator.userAgent) {
    result.browser = "Not a browser.";
    return result;
  }
  const { navigator: navigator2 } = window2;
  if (navigator2.userAgentData && navigator2.userAgentData.brands) {
    const chromium = navigator2.userAgentData.brands.find((brand) => {
      return brand.brand === "Chromium";
    });
    if (chromium) {
      return { browser: "chrome", version: parseInt(chromium.version, 10) };
    }
  }
  if (navigator2.mozGetUserMedia) {
    result.browser = "firefox";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /Firefox\/(\d+)\./,
      1
    ));
  } else if (navigator2.webkitGetUserMedia || window2.isSecureContext === false && window2.webkitRTCPeerConnection) {
    result.browser = "chrome";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /Chrom(e|ium)\/(\d+)\./,
      2
    ));
  } else if (window2.RTCPeerConnection && navigator2.userAgent.match(/AppleWebKit\/(\d+)\./)) {
    result.browser = "safari";
    result.version = parseInt(extractVersion(
      navigator2.userAgent,
      /AppleWebKit\/(\d+)\./,
      1
    ));
    result.supportsUnifiedPlan = window2.RTCRtpTransceiver && "currentDirection" in window2.RTCRtpTransceiver.prototype;
    result._safariVersion = extractVersion(
      navigator2.userAgent,
      /Version\/(\d+(\.?\d+))/,
      1
    );
  } else {
    result.browser = "Not a supported browser.";
    return result;
  }
  return result;
}
function isObject(val) {
  return Object.prototype.toString.call(val) === "[object Object]";
}
function compactObject(data) {
  if (!isObject(data)) {
    return data;
  }
  return Object.keys(data).reduce(function(accumulator, key2) {
    const isObj = isObject(data[key2]);
    const value = isObj ? compactObject(data[key2]) : data[key2];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === void 0 || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, { [key2]: value });
  }, {});
}
function walkStats(stats, base, resultSet) {
  if (!base || resultSet.has(base.id)) {
    return;
  }
  resultSet.set(base.id, base);
  Object.keys(base).forEach((name) => {
    if (name.endsWith("Id")) {
      walkStats(stats, stats.get(base[name]), resultSet);
    } else if (name.endsWith("Ids")) {
      base[name].forEach((id) => {
        walkStats(stats, stats.get(id), resultSet);
      });
    }
  });
}
function filterStats(result, track, outbound) {
  const streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
  const filteredResult = /* @__PURE__ */ new Map();
  if (track === null) {
    return filteredResult;
  }
  const trackStats = [];
  result.forEach((value) => {
    if (value.type === "track" && value.trackIdentifier === track.id) {
      trackStats.push(value);
    }
  });
  trackStats.forEach((trackStat) => {
    result.forEach((stats) => {
      if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
        walkStats(result, stats, filteredResult);
      }
    });
  });
  return filteredResult;
}
const logging = log;
function shimGetUserMedia$2(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  if (!navigator2.mediaDevices) {
    return;
  }
  const constraintsToChrome_ = function(c) {
    if (typeof c !== "object" || c.mandatory || c.optional) {
      return c;
    }
    const cc = {};
    Object.keys(c).forEach((key2) => {
      if (key2 === "require" || key2 === "advanced" || key2 === "mediaSource") {
        return;
      }
      const r2 = typeof c[key2] === "object" ? c[key2] : { ideal: c[key2] };
      if (r2.exact !== void 0 && typeof r2.exact === "number") {
        r2.min = r2.max = r2.exact;
      }
      const oldname_ = function(prefix, name) {
        if (prefix) {
          return prefix + name.charAt(0).toUpperCase() + name.slice(1);
        }
        return name === "deviceId" ? "sourceId" : name;
      };
      if (r2.ideal !== void 0) {
        cc.optional = cc.optional || [];
        let oc = {};
        if (typeof r2.ideal === "number") {
          oc[oldname_("min", key2)] = r2.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_("max", key2)] = r2.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_("", key2)] = r2.ideal;
          cc.optional.push(oc);
        }
      }
      if (r2.exact !== void 0 && typeof r2.exact !== "number") {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_("", key2)] = r2.exact;
      } else {
        ["min", "max"].forEach((mix) => {
          if (r2[mix] !== void 0) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key2)] = r2[mix];
          }
        });
      }
    });
    if (c.advanced) {
      cc.optional = (cc.optional || []).concat(c.advanced);
    }
    return cc;
  };
  const shimConstraints_ = function(constraints, func) {
    if (browserDetails.version >= 61) {
      return func(constraints);
    }
    constraints = JSON.parse(JSON.stringify(constraints));
    if (constraints && typeof constraints.audio === "object") {
      const remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      constraints = JSON.parse(JSON.stringify(constraints));
      remap(constraints.audio, "autoGainControl", "googAutoGainControl");
      remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
      constraints.audio = constraintsToChrome_(constraints.audio);
    }
    if (constraints && typeof constraints.video === "object") {
      let face = constraints.video.facingMode;
      face = face && (typeof face === "object" ? face : { ideal: face });
      const getSupportedFacingModeLies = browserDetails.version < 66;
      if (face && (face.exact === "user" || face.exact === "environment" || face.ideal === "user" || face.ideal === "environment") && !(navigator2.mediaDevices.getSupportedConstraints && navigator2.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
        delete constraints.video.facingMode;
        let matches;
        if (face.exact === "environment" || face.ideal === "environment") {
          matches = ["back", "rear"];
        } else if (face.exact === "user" || face.ideal === "user") {
          matches = ["front"];
        }
        if (matches) {
          return navigator2.mediaDevices.enumerateDevices().then((devices) => {
            devices = devices.filter((d) => d.kind === "videoinput");
            let dev = devices.find((d) => matches.some((match) => d.label.toLowerCase().includes(match)));
            if (!dev && devices.length && matches.includes("back")) {
              dev = devices[devices.length - 1];
            }
            if (dev) {
              constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
            }
            constraints.video = constraintsToChrome_(constraints.video);
            logging("chrome: " + JSON.stringify(constraints));
            return func(constraints);
          });
        }
      }
      constraints.video = constraintsToChrome_(constraints.video);
    }
    logging("chrome: " + JSON.stringify(constraints));
    return func(constraints);
  };
  const shimError_ = function(e) {
    if (browserDetails.version >= 64) {
      return e;
    }
    return {
      name: {
        PermissionDeniedError: "NotAllowedError",
        PermissionDismissedError: "NotAllowedError",
        InvalidStateError: "NotAllowedError",
        DevicesNotFoundError: "NotFoundError",
        ConstraintNotSatisfiedError: "OverconstrainedError",
        TrackStartError: "NotReadableError",
        MediaDeviceFailedDueToShutdown: "NotAllowedError",
        MediaDeviceKillSwitchOn: "NotAllowedError",
        TabCaptureError: "AbortError",
        ScreenCaptureError: "AbortError",
        DeviceCaptureError: "AbortError"
      }[e.name] || e.name,
      message: e.message,
      constraint: e.constraint || e.constraintName,
      toString() {
        return this.name + (this.message && ": ") + this.message;
      }
    };
  };
  const getUserMedia_ = function(constraints, onSuccess, onError) {
    shimConstraints_(constraints, (c) => {
      navigator2.webkitGetUserMedia(c, onSuccess, (e) => {
        if (onError) {
          onError(shimError_(e));
        }
      });
    });
  };
  navigator2.getUserMedia = getUserMedia_.bind(navigator2);
  if (navigator2.mediaDevices.getUserMedia) {
    const origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(cs) {
      return shimConstraints_(cs, (c) => origGetUserMedia(c).then((stream) => {
        if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          throw new DOMException("", "NotFoundError");
        }
        return stream;
      }, (e) => Promise.reject(shimError_(e))));
    };
  }
}
function shimMediaStream(window2) {
  window2.MediaStream = window2.MediaStream || window2.webkitMediaStream;
}
function shimOnTrack$1(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("ontrack" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "ontrack", {
      get() {
        return this._ontrack;
      },
      set(f) {
        if (this._ontrack) {
          this.removeEventListener("track", this._ontrack);
        }
        this.addEventListener("track", this._ontrack = f);
      },
      enumerable: true,
      configurable: true
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      if (!this._ontrackpoly) {
        this._ontrackpoly = (e) => {
          e.stream.addEventListener("addtrack", (te) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r2) => r2.track && r2.track.id === te.track.id);
            } else {
              receiver = { track: te.track };
            }
            const event2 = new Event("track");
            event2.track = te.track;
            event2.receiver = receiver;
            event2.transceiver = { receiver };
            event2.streams = [e.stream];
            this.dispatchEvent(event2);
          });
          e.stream.getTracks().forEach((track) => {
            let receiver;
            if (window2.RTCPeerConnection.prototype.getReceivers) {
              receiver = this.getReceivers().find((r2) => r2.track && r2.track.id === track.id);
            } else {
              receiver = { track };
            }
            const event2 = new Event("track");
            event2.track = track;
            event2.receiver = receiver;
            event2.transceiver = { receiver };
            event2.streams = [e.stream];
            this.dispatchEvent(event2);
          });
        };
        this.addEventListener("addstream", this._ontrackpoly);
      }
      return origSetRemoteDescription.apply(this, arguments);
    };
  } else {
    wrapPeerConnectionEvent(window2, "track", (e) => {
      if (!e.transceiver) {
        Object.defineProperty(
          e,
          "transceiver",
          { value: { receiver: e.receiver } }
        );
      }
      return e;
    });
  }
}
function shimGetSendersWithDtmf(window2) {
  if (typeof window2 === "object" && window2.RTCPeerConnection && !("getSenders" in window2.RTCPeerConnection.prototype) && "createDTMFSender" in window2.RTCPeerConnection.prototype) {
    const shimSenderWithDtmf = function(pc, track) {
      return {
        track,
        get dtmf() {
          if (this._dtmf === void 0) {
            if (track.kind === "audio") {
              this._dtmf = pc.createDTMFSender(track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        },
        _pc: pc
      };
    };
    if (!window2.RTCPeerConnection.prototype.getSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        this._senders = this._senders || [];
        return this._senders.slice();
      };
      const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
        let sender = origAddTrack.apply(this, arguments);
        if (!sender) {
          sender = shimSenderWithDtmf(this, track);
          this._senders.push(sender);
        }
        return sender;
      };
      const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
      window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
        origRemoveTrack.apply(this, arguments);
        const idx = this._senders.indexOf(sender);
        if (idx !== -1) {
          this._senders.splice(idx, 1);
        }
      };
    }
    const origAddStream = window2.RTCPeerConnection.prototype.addStream;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._senders = this._senders || [];
      origAddStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        this._senders.push(shimSenderWithDtmf(this, track));
      });
    };
    const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._senders = this._senders || [];
      origRemoveStream.apply(this, [stream]);
      stream.getTracks().forEach((track) => {
        const sender = this._senders.find((s) => s.track === track);
        if (sender) {
          this._senders.splice(this._senders.indexOf(sender), 1);
        }
      });
    };
  } else if (typeof window2 === "object" && window2.RTCPeerConnection && "getSenders" in window2.RTCPeerConnection.prototype && "createDTMFSender" in window2.RTCPeerConnection.prototype && window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
    Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
      get() {
        if (this._dtmf === void 0) {
          if (this.track.kind === "audio") {
            this._dtmf = this._pc.createDTMFSender(this.track);
          } else {
            this._dtmf = null;
          }
        }
        return this._dtmf;
      }
    });
  }
}
function shimSenderReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender && window2.RTCRtpReceiver)) {
    return;
  }
  if (!("getStats" in window2.RTCRtpSender.prototype)) {
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => sender._pc = this);
        return senders;
      };
    }
    const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window2.RTCRtpSender.prototype.getStats = function getStats() {
      const sender = this;
      return this._pc.getStats().then((result) => (
        /* Note: this will include stats of all senders that
         *   send a track with the same id as sender.track as
         *   it is not possible to identify the RTCRtpSender.
         */
        filterStats(result, sender.track, true)
      ));
    };
  }
  if (!("getStats" in window2.RTCRtpReceiver.prototype)) {
    const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        const receivers = origGetReceivers.apply(this, []);
        receivers.forEach((receiver) => receiver._pc = this);
        return receivers;
      };
    }
    wrapPeerConnectionEvent(window2, "track", (e) => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window2.RTCRtpReceiver.prototype.getStats = function getStats() {
      const receiver = this;
      return this._pc.getStats().then((result) => filterStats(result, receiver.track, false));
    };
  }
  if (!("getStats" in window2.RTCRtpSender.prototype && "getStats" in window2.RTCRtpReceiver.prototype)) {
    return;
  }
  const origGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    if (arguments.length > 0 && arguments[0] instanceof window2.MediaStreamTrack) {
      const track = arguments[0];
      let sender;
      let receiver;
      let err;
      this.getSenders().forEach((s) => {
        if (s.track === track) {
          if (sender) {
            err = true;
          } else {
            sender = s;
          }
        }
      });
      this.getReceivers().forEach((r2) => {
        if (r2.track === track) {
          if (receiver) {
            err = true;
          } else {
            receiver = r2;
          }
        }
        return r2.track === track;
      });
      if (err || sender && receiver) {
        return Promise.reject(new DOMException(
          "There are more than one sender or receiver for the track.",
          "InvalidAccessError"
        ));
      } else if (sender) {
        return sender.getStats();
      } else if (receiver) {
        return receiver.getStats();
      }
      return Promise.reject(new DOMException(
        "There is no sender or receiver for the track.",
        "InvalidAccessError"
      ));
    }
    return origGetStats.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrackWithNative(window2) {
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    return Object.keys(this._shimmedLocalStreams).map((streamId) => this._shimmedLocalStreams[streamId][0]);
  };
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (!stream) {
      return origAddTrack.apply(this, arguments);
    }
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    const sender = origAddTrack.apply(this, arguments);
    if (!this._shimmedLocalStreams[stream.id]) {
      this._shimmedLocalStreams[stream.id] = [stream, sender];
    } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
      this._shimmedLocalStreams[stream.id].push(sender);
    }
    return sender;
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
    });
    const existingSenders = this.getSenders();
    origAddStream.apply(this, arguments);
    const newSenders = this.getSenders().filter((newSender) => existingSenders.indexOf(newSender) === -1);
    this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    delete this._shimmedLocalStreams[stream.id];
    return origRemoveStream.apply(this, arguments);
  };
  const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    if (sender) {
      Object.keys(this._shimmedLocalStreams).forEach((streamId) => {
        const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
        if (idx !== -1) {
          this._shimmedLocalStreams[streamId].splice(idx, 1);
        }
        if (this._shimmedLocalStreams[streamId].length === 1) {
          delete this._shimmedLocalStreams[streamId];
        }
      });
    }
    return origRemoveTrack.apply(this, arguments);
  };
}
function shimAddTrackRemoveTrack(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (window2.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
    return shimAddTrackRemoveTrackWithNative(window2);
  }
  const origGetLocalStreams = window2.RTCPeerConnection.prototype.getLocalStreams;
  window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
    const nativeStreams = origGetLocalStreams.apply(this);
    this._reverseStreams = this._reverseStreams || {};
    return nativeStreams.map((stream) => this._reverseStreams[stream.id]);
  };
  const origAddStream = window2.RTCPeerConnection.prototype.addStream;
  window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    stream.getTracks().forEach((track) => {
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
    });
    if (!this._reverseStreams[stream.id]) {
      const newStream = new window2.MediaStream(stream.getTracks());
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      stream = newStream;
    }
    origAddStream.apply(this, [stream]);
  };
  const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
    delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
    delete this._streams[stream.id];
  };
  window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    const streams = [].slice.call(arguments, 1);
    if (streams.length !== 1 || !streams[0].getTracks().find((t) => t === track)) {
      throw new DOMException(
        "The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.",
        "NotSupportedError"
      );
    }
    const alreadyExists = this.getSenders().find((s) => s.track === track);
    if (alreadyExists) {
      throw new DOMException(
        "Track already exists.",
        "InvalidAccessError"
      );
    }
    this._streams = this._streams || {};
    this._reverseStreams = this._reverseStreams || {};
    const oldStream = this._streams[stream.id];
    if (oldStream) {
      oldStream.addTrack(track);
      Promise.resolve().then(() => {
        this.dispatchEvent(new Event("negotiationneeded"));
      });
    } else {
      const newStream = new window2.MediaStream([track]);
      this._streams[stream.id] = newStream;
      this._reverseStreams[newStream.id] = stream;
      this.addStream(newStream);
    }
    return this.getSenders().find((s) => s.track === track);
  };
  function replaceInternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(
        new RegExp(internalStream.id, "g"),
        externalStream.id
      );
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  function replaceExternalStreamId(pc, description) {
    let sdp2 = description.sdp;
    Object.keys(pc._reverseStreams || []).forEach((internalId) => {
      const externalStream = pc._reverseStreams[internalId];
      const internalStream = pc._streams[externalStream.id];
      sdp2 = sdp2.replace(
        new RegExp(externalStream.id, "g"),
        internalStream.id
      );
    });
    return new RTCSessionDescription({
      type: description.type,
      sdp: sdp2
    });
  }
  ["createOffer", "createAnswer"].forEach(function(method) {
    const nativeMethod = window2.RTCPeerConnection.prototype[method];
    const methodObj = { [method]() {
      const args = arguments;
      const isLegacyCall = arguments.length && typeof arguments[0] === "function";
      if (isLegacyCall) {
        return nativeMethod.apply(this, [
          (description) => {
            const desc = replaceInternalStreamId(this, description);
            args[0].apply(null, [desc]);
          },
          (err) => {
            if (args[1]) {
              args[1].apply(null, err);
            }
          },
          arguments[2]
        ]);
      }
      return nativeMethod.apply(this, arguments).then((description) => replaceInternalStreamId(this, description));
    } };
    window2.RTCPeerConnection.prototype[method] = methodObj[method];
  });
  const origSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    if (!arguments.length || !arguments[0].type) {
      return origSetLocalDescription.apply(this, arguments);
    }
    arguments[0] = replaceExternalStreamId(this, arguments[0]);
    return origSetLocalDescription.apply(this, arguments);
  };
  const origLocalDescription = Object.getOwnPropertyDescriptor(
    window2.RTCPeerConnection.prototype,
    "localDescription"
  );
  Object.defineProperty(
    window2.RTCPeerConnection.prototype,
    "localDescription",
    {
      get() {
        const description = origLocalDescription.get.apply(this);
        if (description.type === "") {
          return description;
        }
        return replaceInternalStreamId(this, description);
      }
    }
  );
  window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
    if (this.signalingState === "closed") {
      throw new DOMException(
        "The RTCPeerConnection's signalingState is 'closed'.",
        "InvalidStateError"
      );
    }
    if (!sender._pc) {
      throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
    }
    const isLocal = sender._pc === this;
    if (!isLocal) {
      throw new DOMException(
        "Sender was not created by this connection.",
        "InvalidAccessError"
      );
    }
    this._streams = this._streams || {};
    let stream;
    Object.keys(this._streams).forEach((streamid) => {
      const hasTrack = this._streams[streamid].getTracks().find((track) => sender.track === track);
      if (hasTrack) {
        stream = this._streams[streamid];
      }
    });
    if (stream) {
      if (stream.getTracks().length === 1) {
        this.removeStream(this._reverseStreams[stream.id]);
      } else {
        stream.removeTrack(sender.track);
      }
      this.dispatchEvent(new Event("negotiationneeded"));
    }
  };
}
function shimPeerConnection$1(window2, browserDetails) {
  if (!window2.RTCPeerConnection && window2.webkitRTCPeerConnection) {
    window2.RTCPeerConnection = window2.webkitRTCPeerConnection;
  }
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
}
function fixNegotiationNeeded(window2, browserDetails) {
  wrapPeerConnectionEvent(window2, "negotiationneeded", (e) => {
    const pc = e.target;
    if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b") {
      if (pc.signalingState !== "stable") {
        return;
      }
    }
    return e;
  });
}
const chromeShim = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  fixNegotiationNeeded,
  shimAddTrackRemoveTrack,
  shimAddTrackRemoveTrackWithNative,
  shimGetSendersWithDtmf,
  shimGetUserMedia: shimGetUserMedia$2,
  shimMediaStream,
  shimOnTrack: shimOnTrack$1,
  shimPeerConnection: shimPeerConnection$1,
  shimSenderReceiverGetStats
}, Symbol.toStringTag, { value: "Module" }));
function shimGetUserMedia$1(window2, browserDetails) {
  const navigator2 = window2 && window2.navigator;
  const MediaStreamTrack = window2 && window2.MediaStreamTrack;
  navigator2.getUserMedia = function(constraints, onSuccess, onError) {
    deprecated(
      "navigator.getUserMedia",
      "navigator.mediaDevices.getUserMedia"
    );
    navigator2.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
  if (!(browserDetails.version > 55 && "autoGainControl" in navigator2.mediaDevices.getSupportedConstraints())) {
    const remap = function(obj, a, b) {
      if (a in obj && !(b in obj)) {
        obj[b] = obj[a];
        delete obj[a];
      }
    };
    const nativeGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(c) {
      if (typeof c === "object" && typeof c.audio === "object") {
        c = JSON.parse(JSON.stringify(c));
        remap(c.audio, "autoGainControl", "mozAutoGainControl");
        remap(c.audio, "noiseSuppression", "mozNoiseSuppression");
      }
      return nativeGetUserMedia(c);
    };
    if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
      const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
      MediaStreamTrack.prototype.getSettings = function() {
        const obj = nativeGetSettings.apply(this, arguments);
        remap(obj, "mozAutoGainControl", "autoGainControl");
        remap(obj, "mozNoiseSuppression", "noiseSuppression");
        return obj;
      };
    }
    if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
      const nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
      MediaStreamTrack.prototype.applyConstraints = function(c) {
        if (this.kind === "audio" && typeof c === "object") {
          c = JSON.parse(JSON.stringify(c));
          remap(c, "autoGainControl", "mozAutoGainControl");
          remap(c, "noiseSuppression", "mozNoiseSuppression");
        }
        return nativeApplyConstraints.apply(this, [c]);
      };
    }
  }
}
function shimGetDisplayMedia(window2, preferredMediaSource) {
  if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
    return;
  }
  if (!window2.navigator.mediaDevices) {
    return;
  }
  window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
    if (!(constraints && constraints.video)) {
      const err = new DOMException("getDisplayMedia without video constraints is undefined");
      err.name = "NotFoundError";
      err.code = 8;
      return Promise.reject(err);
    }
    if (constraints.video === true) {
      constraints.video = { mediaSource: preferredMediaSource };
    } else {
      constraints.video.mediaSource = preferredMediaSource;
    }
    return window2.navigator.mediaDevices.getUserMedia(constraints);
  };
}
function shimOnTrack(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimPeerConnection(window2, browserDetails) {
  if (typeof window2 !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
    return;
  }
  if (!window2.RTCPeerConnection && window2.mozRTCPeerConnection) {
    window2.RTCPeerConnection = window2.mozRTCPeerConnection;
  }
  if (browserDetails.version < 53) {
    ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
        return nativeMethod.apply(this, arguments);
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
  }
  const modernStatsTypes = {
    inboundrtp: "inbound-rtp",
    outboundrtp: "outbound-rtp",
    candidatepair: "candidate-pair",
    localcandidate: "local-candidate",
    remotecandidate: "remote-candidate"
  };
  const nativeGetStats = window2.RTCPeerConnection.prototype.getStats;
  window2.RTCPeerConnection.prototype.getStats = function getStats() {
    const [selector, onSucc, onErr] = arguments;
    return nativeGetStats.apply(this, [selector || null]).then((stats) => {
      if (browserDetails.version < 53 && !onSucc) {
        try {
          stats.forEach((stat) => {
            stat.type = modernStatsTypes[stat.type] || stat.type;
          });
        } catch (e) {
          if (e.name !== "TypeError") {
            throw e;
          }
          stats.forEach((stat, i) => {
            stats.set(i, Object.assign({}, stat, {
              type: modernStatsTypes[stat.type] || stat.type
            }));
          });
        }
      }
      return stats;
    }).then(onSucc, onErr);
  };
}
function shimSenderGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpSender.prototype) {
    return;
  }
  const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
  if (origGetSenders) {
    window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
      const senders = origGetSenders.apply(this, []);
      senders.forEach((sender) => sender._pc = this);
      return senders;
    };
  }
  const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
  if (origAddTrack) {
    window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
      const sender = origAddTrack.apply(this, arguments);
      sender._pc = this;
      return sender;
    };
  }
  window2.RTCRtpSender.prototype.getStats = function getStats() {
    return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
  };
}
function shimReceiverGetStats(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
    return;
  }
  if (window2.RTCRtpSender && "getStats" in window2.RTCRtpReceiver.prototype) {
    return;
  }
  const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
  if (origGetReceivers) {
    window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
      const receivers = origGetReceivers.apply(this, []);
      receivers.forEach((receiver) => receiver._pc = this);
      return receivers;
    };
  }
  wrapPeerConnectionEvent(window2, "track", (e) => {
    e.receiver._pc = e.srcElement;
    return e;
  });
  window2.RTCRtpReceiver.prototype.getStats = function getStats() {
    return this._pc.getStats(this.track);
  };
}
function shimRemoveStream(window2) {
  if (!window2.RTCPeerConnection || "removeStream" in window2.RTCPeerConnection.prototype) {
    return;
  }
  window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
    deprecated("removeStream", "removeTrack");
    this.getSenders().forEach((sender) => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.removeTrack(sender);
      }
    });
  };
}
function shimRTCDataChannel(window2) {
  if (window2.DataChannel && !window2.RTCDataChannel) {
    window2.RTCDataChannel = window2.DataChannel;
  }
}
function shimAddTransceiver(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origAddTransceiver = window2.RTCPeerConnection.prototype.addTransceiver;
  if (origAddTransceiver) {
    window2.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
      this.setParametersPromises = [];
      let sendEncodings = arguments[1] && arguments[1].sendEncodings;
      if (sendEncodings === void 0) {
        sendEncodings = [];
      }
      sendEncodings = [...sendEncodings];
      const shouldPerformCheck = sendEncodings.length > 0;
      if (shouldPerformCheck) {
        sendEncodings.forEach((encodingParam) => {
          if ("rid" in encodingParam) {
            const ridRegex = /^[a-z0-9]{0,16}$/i;
            if (!ridRegex.test(encodingParam.rid)) {
              throw new TypeError("Invalid RID value provided.");
            }
          }
          if ("scaleResolutionDownBy" in encodingParam) {
            if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1)) {
              throw new RangeError("scale_resolution_down_by must be >= 1.0");
            }
          }
          if ("maxFramerate" in encodingParam) {
            if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
              throw new RangeError("max_framerate must be >= 0.0");
            }
          }
        });
      }
      const transceiver = origAddTransceiver.apply(this, arguments);
      if (shouldPerformCheck) {
        const { sender } = transceiver;
        const params = sender.getParameters();
        if (!("encodings" in params) || // Avoid being fooled by patched getParameters() below.
        params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
          params.encodings = sendEncodings;
          sender.sendEncodings = sendEncodings;
          this.setParametersPromises.push(
            sender.setParameters(params).then(() => {
              delete sender.sendEncodings;
            }).catch(() => {
              delete sender.sendEncodings;
            })
          );
        }
      }
      return transceiver;
    };
  }
}
function shimGetParameters(window2) {
  if (!(typeof window2 === "object" && window2.RTCRtpSender)) {
    return;
  }
  const origGetParameters = window2.RTCRtpSender.prototype.getParameters;
  if (origGetParameters) {
    window2.RTCRtpSender.prototype.getParameters = function getParameters() {
      const params = origGetParameters.apply(this, arguments);
      if (!("encodings" in params)) {
        params.encodings = [].concat(this.sendEncodings || [{}]);
      }
      return params;
    };
  }
}
function shimCreateOffer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateOffer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimCreateAnswer(window2) {
  if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
    return;
  }
  const origCreateAnswer = window2.RTCPeerConnection.prototype.createAnswer;
  window2.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
    if (this.setParametersPromises && this.setParametersPromises.length) {
      return Promise.all(this.setParametersPromises).then(() => {
        return origCreateAnswer.apply(this, arguments);
      }).finally(() => {
        this.setParametersPromises = [];
      });
    }
    return origCreateAnswer.apply(this, arguments);
  };
}
const firefoxShim = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  shimAddTransceiver,
  shimCreateAnswer,
  shimCreateOffer,
  shimGetDisplayMedia,
  shimGetParameters,
  shimGetUserMedia: shimGetUserMedia$1,
  shimOnTrack,
  shimPeerConnection,
  shimRTCDataChannel,
  shimReceiverGetStats,
  shimRemoveStream,
  shimSenderGetStats
}, Symbol.toStringTag, { value: "Module" }));
function shimLocalStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getLocalStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      return this._localStreams;
    };
  }
  if (!("addStream" in window2.RTCPeerConnection.prototype)) {
    const _addTrack = window2.RTCPeerConnection.prototype.addTrack;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      if (!this._localStreams.includes(stream)) {
        this._localStreams.push(stream);
      }
      stream.getAudioTracks().forEach((track) => _addTrack.call(
        this,
        track,
        stream
      ));
      stream.getVideoTracks().forEach((track) => _addTrack.call(
        this,
        track,
        stream
      ));
    };
    window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, ...streams) {
      if (streams) {
        streams.forEach((stream) => {
          if (!this._localStreams) {
            this._localStreams = [stream];
          } else if (!this._localStreams.includes(stream)) {
            this._localStreams.push(stream);
          }
        });
      }
      return _addTrack.apply(this, arguments);
    };
  }
  if (!("removeStream" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      if (!this._localStreams) {
        this._localStreams = [];
      }
      const index2 = this._localStreams.indexOf(stream);
      if (index2 === -1) {
        return;
      }
      this._localStreams.splice(index2, 1);
      const tracks = stream.getTracks();
      this.getSenders().forEach((sender) => {
        if (tracks.includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
  }
}
function shimRemoteStreamsAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  if (!("getRemoteStreams" in window2.RTCPeerConnection.prototype)) {
    window2.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
      return this._remoteStreams ? this._remoteStreams : [];
    };
  }
  if (!("onaddstream" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(f) {
        if (this._onaddstream) {
          this.removeEventListener("addstream", this._onaddstream);
          this.removeEventListener("track", this._onaddstreampoly);
        }
        this.addEventListener("addstream", this._onaddstream = f);
        this.addEventListener("track", this._onaddstreampoly = (e) => {
          e.streams.forEach((stream) => {
            if (!this._remoteStreams) {
              this._remoteStreams = [];
            }
            if (this._remoteStreams.includes(stream)) {
              return;
            }
            this._remoteStreams.push(stream);
            const event2 = new Event("addstream");
            event2.stream = stream;
            this.dispatchEvent(event2);
          });
        });
      }
    });
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      const pc = this;
      if (!this._onaddstreampoly) {
        this.addEventListener("track", this._onaddstreampoly = function(e) {
          e.streams.forEach((stream) => {
            if (!pc._remoteStreams) {
              pc._remoteStreams = [];
            }
            if (pc._remoteStreams.indexOf(stream) >= 0) {
              return;
            }
            pc._remoteStreams.push(stream);
            const event2 = new Event("addstream");
            event2.stream = stream;
            pc.dispatchEvent(event2);
          });
        });
      }
      return origSetRemoteDescription.apply(pc, arguments);
    };
  }
}
function shimCallbacksAPI(window2) {
  if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
    return;
  }
  const prototype = window2.RTCPeerConnection.prototype;
  const origCreateOffer = prototype.createOffer;
  const origCreateAnswer = prototype.createAnswer;
  const setLocalDescription = prototype.setLocalDescription;
  const setRemoteDescription = prototype.setRemoteDescription;
  const addIceCandidate = prototype.addIceCandidate;
  prototype.createOffer = function createOffer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateOffer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
    const options = arguments.length >= 2 ? arguments[2] : arguments[0];
    const promise = origCreateAnswer.apply(this, [options]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  let withCallback = function(description, successCallback, failureCallback) {
    const promise = setLocalDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setLocalDescription = withCallback;
  withCallback = function(description, successCallback, failureCallback) {
    const promise = setRemoteDescription.apply(this, [description]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.setRemoteDescription = withCallback;
  withCallback = function(candidate, successCallback, failureCallback) {
    const promise = addIceCandidate.apply(this, [candidate]);
    if (!failureCallback) {
      return promise;
    }
    promise.then(successCallback, failureCallback);
    return Promise.resolve();
  };
  prototype.addIceCandidate = withCallback;
}
function shimGetUserMedia(window2) {
  const navigator2 = window2 && window2.navigator;
  if (navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    const mediaDevices = navigator2.mediaDevices;
    const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
    navigator2.mediaDevices.getUserMedia = (constraints) => {
      return _getUserMedia(shimConstraints(constraints));
    };
  }
  if (!navigator2.getUserMedia && navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
    navigator2.getUserMedia = (function getUserMedia(constraints, cb, errcb) {
      navigator2.mediaDevices.getUserMedia(constraints).then(cb, errcb);
    }).bind(navigator2);
  }
}
function shimConstraints(constraints) {
  if (constraints && constraints.video !== void 0) {
    return Object.assign(
      {},
      constraints,
      { video: compactObject(constraints.video) }
    );
  }
  return constraints;
}
function shimRTCIceServerUrls(window2) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  const OrigPeerConnection = window2.RTCPeerConnection;
  window2.RTCPeerConnection = function RTCPeerConnection2(pcConfig, pcConstraints) {
    if (pcConfig && pcConfig.iceServers) {
      const newIceServers = [];
      for (let i = 0; i < pcConfig.iceServers.length; i++) {
        let server = pcConfig.iceServers[i];
        if (server.urls === void 0 && server.url) {
          deprecated("RTCIceServer.url", "RTCIceServer.urls");
          server = JSON.parse(JSON.stringify(server));
          server.urls = server.url;
          delete server.url;
          newIceServers.push(server);
        } else {
          newIceServers.push(pcConfig.iceServers[i]);
        }
      }
      pcConfig.iceServers = newIceServers;
    }
    return new OrigPeerConnection(pcConfig, pcConstraints);
  };
  window2.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
  if ("generateCertificate" in OrigPeerConnection) {
    Object.defineProperty(window2.RTCPeerConnection, "generateCertificate", {
      get() {
        return OrigPeerConnection.generateCertificate;
      }
    });
  }
}
function shimTrackEventTransceiver(window2) {
  if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
    Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      }
    });
  }
}
function shimCreateOfferLegacy(window2) {
  const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
  window2.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
    if (offerOptions) {
      if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
        offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
      }
      const audioTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "audio");
      if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
        if (audioTransceiver.direction === "sendrecv") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("sendonly");
          } else {
            audioTransceiver.direction = "sendonly";
          }
        } else if (audioTransceiver.direction === "recvonly") {
          if (audioTransceiver.setDirection) {
            audioTransceiver.setDirection("inactive");
          } else {
            audioTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
        this.addTransceiver("audio", { direction: "recvonly" });
      }
      if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
        offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
      }
      const videoTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "video");
      if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
        if (videoTransceiver.direction === "sendrecv") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("sendonly");
          } else {
            videoTransceiver.direction = "sendonly";
          }
        } else if (videoTransceiver.direction === "recvonly") {
          if (videoTransceiver.setDirection) {
            videoTransceiver.setDirection("inactive");
          } else {
            videoTransceiver.direction = "inactive";
          }
        }
      } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
        this.addTransceiver("video", { direction: "recvonly" });
      }
    }
    return origCreateOffer.apply(this, arguments);
  };
}
function shimAudioContext(window2) {
  if (typeof window2 !== "object" || window2.AudioContext) {
    return;
  }
  window2.AudioContext = window2.webkitAudioContext;
}
const safariShim = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  shimAudioContext,
  shimCallbacksAPI,
  shimConstraints,
  shimCreateOfferLegacy,
  shimGetUserMedia,
  shimLocalStreamsAPI,
  shimRTCIceServerUrls,
  shimRemoteStreamsAPI,
  shimTrackEventTransceiver
}, Symbol.toStringTag, { value: "Module" }));
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var sdp$1 = { exports: {} };
var hasRequiredSdp;
function requireSdp() {
  if (hasRequiredSdp) return sdp$1.exports;
  hasRequiredSdp = 1;
  (function(module) {
    const SDPUtils2 = {};
    SDPUtils2.generateIdentifier = function() {
      return Math.random().toString(36).substring(2, 12);
    };
    SDPUtils2.localCName = SDPUtils2.generateIdentifier();
    SDPUtils2.splitLines = function(blob) {
      return blob.trim().split("\n").map((line) => line.trim());
    };
    SDPUtils2.splitSections = function(blob) {
      const parts = blob.split("\nm=");
      return parts.map((part, index2) => (index2 > 0 ? "m=" + part : part).trim() + "\r\n");
    };
    SDPUtils2.getDescription = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      return sections && sections[0];
    };
    SDPUtils2.getMediaSections = function(blob) {
      const sections = SDPUtils2.splitSections(blob);
      sections.shift();
      return sections;
    };
    SDPUtils2.matchPrefix = function(blob, prefix) {
      return SDPUtils2.splitLines(blob).filter((line) => line.indexOf(prefix) === 0);
    };
    SDPUtils2.parseCandidate = function(line) {
      let parts;
      if (line.indexOf("a=candidate:") === 0) {
        parts = line.substring(12).split(" ");
      } else {
        parts = line.substring(10).split(" ");
      }
      const candidate = {
        foundation: parts[0],
        component: { 1: "rtp", 2: "rtcp" }[parts[1]] || parts[1],
        protocol: parts[2].toLowerCase(),
        priority: parseInt(parts[3], 10),
        ip: parts[4],
        address: parts[4],
        // address is an alias for ip.
        port: parseInt(parts[5], 10),
        // skip parts[6] == 'typ'
        type: parts[7]
      };
      for (let i = 8; i < parts.length; i += 2) {
        switch (parts[i]) {
          case "raddr":
            candidate.relatedAddress = parts[i + 1];
            break;
          case "rport":
            candidate.relatedPort = parseInt(parts[i + 1], 10);
            break;
          case "tcptype":
            candidate.tcpType = parts[i + 1];
            break;
          case "ufrag":
            candidate.ufrag = parts[i + 1];
            candidate.usernameFragment = parts[i + 1];
            break;
          default:
            if (candidate[parts[i]] === void 0) {
              candidate[parts[i]] = parts[i + 1];
            }
            break;
        }
      }
      return candidate;
    };
    SDPUtils2.writeCandidate = function(candidate) {
      const sdp2 = [];
      sdp2.push(candidate.foundation);
      const component2 = candidate.component;
      if (component2 === "rtp") {
        sdp2.push(1);
      } else if (component2 === "rtcp") {
        sdp2.push(2);
      } else {
        sdp2.push(component2);
      }
      sdp2.push(candidate.protocol.toUpperCase());
      sdp2.push(candidate.priority);
      sdp2.push(candidate.address || candidate.ip);
      sdp2.push(candidate.port);
      const type = candidate.type;
      sdp2.push("typ");
      sdp2.push(type);
      if (type !== "host" && candidate.relatedAddress && candidate.relatedPort) {
        sdp2.push("raddr");
        sdp2.push(candidate.relatedAddress);
        sdp2.push("rport");
        sdp2.push(candidate.relatedPort);
      }
      if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
        sdp2.push("tcptype");
        sdp2.push(candidate.tcpType);
      }
      if (candidate.usernameFragment || candidate.ufrag) {
        sdp2.push("ufrag");
        sdp2.push(candidate.usernameFragment || candidate.ufrag);
      }
      return "candidate:" + sdp2.join(" ");
    };
    SDPUtils2.parseIceOptions = function(line) {
      return line.substring(14).split(" ");
    };
    SDPUtils2.parseRtpMap = function(line) {
      let parts = line.substring(9).split(" ");
      const parsed = {
        payloadType: parseInt(parts.shift(), 10)
        // was: id
      };
      parts = parts[0].split("/");
      parsed.name = parts[0];
      parsed.clockRate = parseInt(parts[1], 10);
      parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
      parsed.numChannels = parsed.channels;
      return parsed;
    };
    SDPUtils2.writeRtpMap = function(codec) {
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      const channels = codec.channels || codec.numChannels || 1;
      return "a=rtpmap:" + pt + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
    };
    SDPUtils2.parseExtmap = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        id: parseInt(parts[0], 10),
        direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
        uri: parts[1],
        attributes: parts.slice(2).join(" ")
      };
    };
    SDPUtils2.writeExtmap = function(headerExtension) {
      return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + (headerExtension.attributes ? " " + headerExtension.attributes : "") + "\r\n";
    };
    SDPUtils2.parseFmtp = function(line) {
      const parsed = {};
      let kv;
      const parts = line.substring(line.indexOf(" ") + 1).split(";");
      for (let j = 0; j < parts.length; j++) {
        kv = parts[j].trim().split("=");
        parsed[kv[0].trim()] = kv[1];
      }
      return parsed;
    };
    SDPUtils2.writeFmtp = function(codec) {
      let line = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.parameters && Object.keys(codec.parameters).length) {
        const params = [];
        Object.keys(codec.parameters).forEach((param) => {
          if (codec.parameters[param] !== void 0) {
            params.push(param + "=" + codec.parameters[param]);
          } else {
            params.push(param);
          }
        });
        line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
      }
      return line;
    };
    SDPUtils2.parseRtcpFb = function(line) {
      const parts = line.substring(line.indexOf(" ") + 1).split(" ");
      return {
        type: parts.shift(),
        parameter: parts.join(" ")
      };
    };
    SDPUtils2.writeRtcpFb = function(codec) {
      let lines = "";
      let pt = codec.payloadType;
      if (codec.preferredPayloadType !== void 0) {
        pt = codec.preferredPayloadType;
      }
      if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
        codec.rtcpFeedback.forEach((fb) => {
          lines += "a=rtcp-fb:" + pt + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
        });
      }
      return lines;
    };
    SDPUtils2.parseSsrcMedia = function(line) {
      const sp = line.indexOf(" ");
      const parts = {
        ssrc: parseInt(line.substring(7, sp), 10)
      };
      const colon = line.indexOf(":", sp);
      if (colon > -1) {
        parts.attribute = line.substring(sp + 1, colon);
        parts.value = line.substring(colon + 1);
      } else {
        parts.attribute = line.substring(sp + 1);
      }
      return parts;
    };
    SDPUtils2.parseSsrcGroup = function(line) {
      const parts = line.substring(13).split(" ");
      return {
        semantics: parts.shift(),
        ssrcs: parts.map((ssrc) => parseInt(ssrc, 10))
      };
    };
    SDPUtils2.getMid = function(mediaSection) {
      const mid = SDPUtils2.matchPrefix(mediaSection, "a=mid:")[0];
      if (mid) {
        return mid.substring(6);
      }
    };
    SDPUtils2.parseFingerprint = function(line) {
      const parts = line.substring(14).split(" ");
      return {
        algorithm: parts[0].toLowerCase(),
        // algorithm is case-sensitive in Edge.
        value: parts[1].toUpperCase()
        // the definition is upper-case in RFC 4572.
      };
    };
    SDPUtils2.getDtlsParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=fingerprint:"
      );
      return {
        role: "auto",
        fingerprints: lines.map(SDPUtils2.parseFingerprint)
      };
    };
    SDPUtils2.writeDtlsParameters = function(params, setupType) {
      let sdp2 = "a=setup:" + setupType + "\r\n";
      params.fingerprints.forEach((fp) => {
        sdp2 += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
      });
      return sdp2;
    };
    SDPUtils2.parseCryptoLine = function(line) {
      const parts = line.substring(9).split(" ");
      return {
        tag: parseInt(parts[0], 10),
        cryptoSuite: parts[1],
        keyParams: parts[2],
        sessionParams: parts.slice(3)
      };
    };
    SDPUtils2.writeCryptoLine = function(parameters) {
      return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils2.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
    };
    SDPUtils2.parseCryptoKeyParams = function(keyParams) {
      if (keyParams.indexOf("inline:") !== 0) {
        return null;
      }
      const parts = keyParams.substring(7).split("|");
      return {
        keyMethod: "inline",
        keySalt: parts[0],
        lifeTime: parts[1],
        mkiValue: parts[2] ? parts[2].split(":")[0] : void 0,
        mkiLength: parts[2] ? parts[2].split(":")[1] : void 0
      };
    };
    SDPUtils2.writeCryptoKeyParams = function(keyParams) {
      return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
    };
    SDPUtils2.getCryptoParameters = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=crypto:"
      );
      return lines.map(SDPUtils2.parseCryptoLine);
    };
    SDPUtils2.getIceParameters = function(mediaSection, sessionpart) {
      const ufrag = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=ice-ufrag:"
      )[0];
      const pwd = SDPUtils2.matchPrefix(
        mediaSection + sessionpart,
        "a=ice-pwd:"
      )[0];
      if (!(ufrag && pwd)) {
        return null;
      }
      return {
        usernameFragment: ufrag.substring(12),
        password: pwd.substring(10)
      };
    };
    SDPUtils2.writeIceParameters = function(params) {
      let sdp2 = "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
      if (params.iceLite) {
        sdp2 += "a=ice-lite\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseRtpParameters = function(mediaSection) {
      const description = {
        codecs: [],
        headerExtensions: [],
        fecMechanisms: [],
        rtcp: []
      };
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      description.profile = mline[2];
      for (let i = 3; i < mline.length; i++) {
        const pt = mline[i];
        const rtpmapline = SDPUtils2.matchPrefix(
          mediaSection,
          "a=rtpmap:" + pt + " "
        )[0];
        if (rtpmapline) {
          const codec = SDPUtils2.parseRtpMap(rtpmapline);
          const fmtps = SDPUtils2.matchPrefix(
            mediaSection,
            "a=fmtp:" + pt + " "
          );
          codec.parameters = fmtps.length ? SDPUtils2.parseFmtp(fmtps[0]) : {};
          codec.rtcpFeedback = SDPUtils2.matchPrefix(
            mediaSection,
            "a=rtcp-fb:" + pt + " "
          ).map(SDPUtils2.parseRtcpFb);
          description.codecs.push(codec);
          switch (codec.name.toUpperCase()) {
            case "RED":
            case "ULPFEC":
              description.fecMechanisms.push(codec.name.toUpperCase());
              break;
          }
        }
      }
      SDPUtils2.matchPrefix(mediaSection, "a=extmap:").forEach((line) => {
        description.headerExtensions.push(SDPUtils2.parseExtmap(line));
      });
      const wildcardRtcpFb = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-fb:* ").map(SDPUtils2.parseRtcpFb);
      description.codecs.forEach((codec) => {
        wildcardRtcpFb.forEach((fb) => {
          const duplicate = codec.rtcpFeedback.find((existingFeedback) => {
            return existingFeedback.type === fb.type && existingFeedback.parameter === fb.parameter;
          });
          if (!duplicate) {
            codec.rtcpFeedback.push(fb);
          }
        });
      });
      return description;
    };
    SDPUtils2.writeRtpDescription = function(kind, caps) {
      let sdp2 = "";
      sdp2 += "m=" + kind + " ";
      sdp2 += caps.codecs.length > 0 ? "9" : "0";
      sdp2 += " " + (caps.profile || "UDP/TLS/RTP/SAVPF") + " ";
      sdp2 += caps.codecs.map((codec) => {
        if (codec.preferredPayloadType !== void 0) {
          return codec.preferredPayloadType;
        }
        return codec.payloadType;
      }).join(" ") + "\r\n";
      sdp2 += "c=IN IP4 0.0.0.0\r\n";
      sdp2 += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
      caps.codecs.forEach((codec) => {
        sdp2 += SDPUtils2.writeRtpMap(codec);
        sdp2 += SDPUtils2.writeFmtp(codec);
        sdp2 += SDPUtils2.writeRtcpFb(codec);
      });
      let maxptime = 0;
      caps.codecs.forEach((codec) => {
        if (codec.maxptime > maxptime) {
          maxptime = codec.maxptime;
        }
      });
      if (maxptime > 0) {
        sdp2 += "a=maxptime:" + maxptime + "\r\n";
      }
      if (caps.headerExtensions) {
        caps.headerExtensions.forEach((extension) => {
          sdp2 += SDPUtils2.writeExtmap(extension);
        });
      }
      return sdp2;
    };
    SDPUtils2.parseRtpEncodingParameters = function(mediaSection) {
      const encodingParameters = [];
      const description = SDPUtils2.parseRtpParameters(mediaSection);
      const hasRed = description.fecMechanisms.indexOf("RED") !== -1;
      const hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
      const ssrcs = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((parts) => parts.attribute === "cname");
      const primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
      let secondarySsrc;
      const flows = SDPUtils2.matchPrefix(mediaSection, "a=ssrc-group:FID").map((line) => {
        const parts = line.substring(17).split(" ");
        return parts.map((part) => parseInt(part, 10));
      });
      if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
        secondarySsrc = flows[0][1];
      }
      description.codecs.forEach((codec) => {
        if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
          let encParam = {
            ssrc: primarySsrc,
            codecPayloadType: parseInt(codec.parameters.apt, 10)
          };
          if (primarySsrc && secondarySsrc) {
            encParam.rtx = { ssrc: secondarySsrc };
          }
          encodingParameters.push(encParam);
          if (hasRed) {
            encParam = JSON.parse(JSON.stringify(encParam));
            encParam.fec = {
              ssrc: primarySsrc,
              mechanism: hasUlpfec ? "red+ulpfec" : "red"
            };
            encodingParameters.push(encParam);
          }
        }
      });
      if (encodingParameters.length === 0 && primarySsrc) {
        encodingParameters.push({
          ssrc: primarySsrc
        });
      }
      let bandwidth = SDPUtils2.matchPrefix(mediaSection, "b=");
      if (bandwidth.length) {
        if (bandwidth[0].indexOf("b=TIAS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(7), 10);
        } else if (bandwidth[0].indexOf("b=AS:") === 0) {
          bandwidth = parseInt(bandwidth[0].substring(5), 10) * 1e3 * 0.95 - 50 * 40 * 8;
        } else {
          bandwidth = void 0;
        }
        encodingParameters.forEach((params) => {
          params.maxBitrate = bandwidth;
        });
      }
      return encodingParameters;
    };
    SDPUtils2.parseRtcpParameters = function(mediaSection) {
      const rtcpParameters = {};
      const remoteSsrc = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((obj) => obj.attribute === "cname")[0];
      if (remoteSsrc) {
        rtcpParameters.cname = remoteSsrc.value;
        rtcpParameters.ssrc = remoteSsrc.ssrc;
      }
      const rsize = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-rsize");
      rtcpParameters.reducedSize = rsize.length > 0;
      rtcpParameters.compound = rsize.length === 0;
      const mux = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-mux");
      rtcpParameters.mux = mux.length > 0;
      return rtcpParameters;
    };
    SDPUtils2.writeRtcpParameters = function(rtcpParameters) {
      let sdp2 = "";
      if (rtcpParameters.reducedSize) {
        sdp2 += "a=rtcp-rsize\r\n";
      }
      if (rtcpParameters.mux) {
        sdp2 += "a=rtcp-mux\r\n";
      }
      if (rtcpParameters.ssrc !== void 0 && rtcpParameters.cname) {
        sdp2 += "a=ssrc:" + rtcpParameters.ssrc + " cname:" + rtcpParameters.cname + "\r\n";
      }
      return sdp2;
    };
    SDPUtils2.parseMsid = function(mediaSection) {
      let parts;
      const spec = SDPUtils2.matchPrefix(mediaSection, "a=msid:");
      if (spec.length === 1) {
        parts = spec[0].substring(7).split(" ");
        return { stream: parts[0], track: parts[1] };
      }
      const planB = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map((line) => SDPUtils2.parseSsrcMedia(line)).filter((msidParts) => msidParts.attribute === "msid");
      if (planB.length > 0) {
        parts = planB[0].value.split(" ");
        return { stream: parts[0], track: parts[1] };
      }
    };
    SDPUtils2.parseSctpDescription = function(mediaSection) {
      const mline = SDPUtils2.parseMLine(mediaSection);
      const maxSizeLine = SDPUtils2.matchPrefix(mediaSection, "a=max-message-size:");
      let maxMessageSize;
      if (maxSizeLine.length > 0) {
        maxMessageSize = parseInt(maxSizeLine[0].substring(19), 10);
      }
      if (isNaN(maxMessageSize)) {
        maxMessageSize = 65536;
      }
      const sctpPort = SDPUtils2.matchPrefix(mediaSection, "a=sctp-port:");
      if (sctpPort.length > 0) {
        return {
          port: parseInt(sctpPort[0].substring(12), 10),
          protocol: mline.fmt,
          maxMessageSize
        };
      }
      const sctpMapLines = SDPUtils2.matchPrefix(mediaSection, "a=sctpmap:");
      if (sctpMapLines.length > 0) {
        const parts = sctpMapLines[0].substring(10).split(" ");
        return {
          port: parseInt(parts[0], 10),
          protocol: parts[1],
          maxMessageSize
        };
      }
    };
    SDPUtils2.writeSctpDescription = function(media, sctp) {
      let output = [];
      if (media.protocol !== "DTLS/SCTP") {
        output = [
          "m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n",
          "c=IN IP4 0.0.0.0\r\n",
          "a=sctp-port:" + sctp.port + "\r\n"
        ];
      } else {
        output = [
          "m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n",
          "c=IN IP4 0.0.0.0\r\n",
          "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"
        ];
      }
      if (sctp.maxMessageSize !== void 0) {
        output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
      }
      return output.join("");
    };
    SDPUtils2.generateSessionId = function() {
      return Math.random().toString().substr(2, 22);
    };
    SDPUtils2.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
      let sessionId;
      const version = sessVer !== void 0 ? sessVer : 2;
      if (sessId) {
        sessionId = sessId;
      } else {
        sessionId = SDPUtils2.generateSessionId();
      }
      const user = sessUser || "thisisadapterortc";
      return "v=0\r\no=" + user + " " + sessionId + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
    };
    SDPUtils2.getDirection = function(mediaSection, sessionpart) {
      const lines = SDPUtils2.splitLines(mediaSection);
      for (let i = 0; i < lines.length; i++) {
        switch (lines[i]) {
          case "a=sendrecv":
          case "a=sendonly":
          case "a=recvonly":
          case "a=inactive":
            return lines[i].substring(2);
        }
      }
      if (sessionpart) {
        return SDPUtils2.getDirection(sessionpart);
      }
      return "sendrecv";
    };
    SDPUtils2.getKind = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const mline = lines[0].split(" ");
      return mline[0].substring(2);
    };
    SDPUtils2.isRejected = function(mediaSection) {
      return mediaSection.split(" ", 2)[1] === "0";
    };
    SDPUtils2.parseMLine = function(mediaSection) {
      const lines = SDPUtils2.splitLines(mediaSection);
      const parts = lines[0].substring(2).split(" ");
      return {
        kind: parts[0],
        port: parseInt(parts[1], 10),
        protocol: parts[2],
        fmt: parts.slice(3).join(" ")
      };
    };
    SDPUtils2.parseOLine = function(mediaSection) {
      const line = SDPUtils2.matchPrefix(mediaSection, "o=")[0];
      const parts = line.substring(2).split(" ");
      return {
        username: parts[0],
        sessionId: parts[1],
        sessionVersion: parseInt(parts[2], 10),
        netType: parts[3],
        addressType: parts[4],
        address: parts[5]
      };
    };
    SDPUtils2.isValidSDP = function(blob) {
      if (typeof blob !== "string" || blob.length === 0) {
        return false;
      }
      const lines = SDPUtils2.splitLines(blob);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
          return false;
        }
      }
      return true;
    };
    {
      module.exports = SDPUtils2;
    }
  })(sdp$1);
  return sdp$1.exports;
}
var sdpExports = requireSdp();
const SDPUtils = /* @__PURE__ */ getDefaultExportFromCjs(sdpExports);
const sdp = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: SDPUtils
}, [sdpExports]);
function shimRTCIceCandidate(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "foundation" in window2.RTCIceCandidate.prototype) {
    return;
  }
  const NativeRTCIceCandidate = window2.RTCIceCandidate;
  window2.RTCIceCandidate = function RTCIceCandidate(args) {
    if (typeof args === "object" && args.candidate && args.candidate.indexOf("a=") === 0) {
      args = JSON.parse(JSON.stringify(args));
      args.candidate = args.candidate.substring(2);
    }
    if (args.candidate && args.candidate.length) {
      const nativeCandidate = new NativeRTCIceCandidate(args);
      const parsedCandidate = SDPUtils.parseCandidate(args.candidate);
      for (const key2 in parsedCandidate) {
        if (!(key2 in nativeCandidate)) {
          Object.defineProperty(
            nativeCandidate,
            key2,
            { value: parsedCandidate[key2] }
          );
        }
      }
      nativeCandidate.toJSON = function toJSON() {
        return {
          candidate: nativeCandidate.candidate,
          sdpMid: nativeCandidate.sdpMid,
          sdpMLineIndex: nativeCandidate.sdpMLineIndex,
          usernameFragment: nativeCandidate.usernameFragment
        };
      };
      return nativeCandidate;
    }
    return new NativeRTCIceCandidate(args);
  };
  window2.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      Object.defineProperty(e, "candidate", {
        value: new window2.RTCIceCandidate(e.candidate),
        writable: "false"
      });
    }
    return e;
  });
}
function shimRTCIceCandidateRelayProtocol(window2) {
  if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "relayProtocol" in window2.RTCIceCandidate.prototype) {
    return;
  }
  wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
    if (e.candidate) {
      const parsedCandidate = SDPUtils.parseCandidate(e.candidate.candidate);
      if (parsedCandidate.type === "relay") {
        e.candidate.relayProtocol = {
          0: "tls",
          1: "tcp",
          2: "udp"
        }[parsedCandidate.priority >> 24];
      }
    }
    return e;
  });
}
function shimMaxMessageSize(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (!("sctp" in window2.RTCPeerConnection.prototype)) {
    Object.defineProperty(window2.RTCPeerConnection.prototype, "sctp", {
      get() {
        return typeof this._sctp === "undefined" ? null : this._sctp;
      }
    });
  }
  const sctpInDescription = function(description) {
    if (!description || !description.sdp) {
      return false;
    }
    const sections = SDPUtils.splitSections(description.sdp);
    sections.shift();
    return sections.some((mediaSection) => {
      const mLine = SDPUtils.parseMLine(mediaSection);
      return mLine && mLine.kind === "application" && mLine.protocol.indexOf("SCTP") !== -1;
    });
  };
  const getRemoteFirefoxVersion = function(description) {
    const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
    if (match === null || match.length < 2) {
      return -1;
    }
    const version = parseInt(match[1], 10);
    return version !== version ? -1 : version;
  };
  const getCanSendMaxMessageSize = function(remoteIsFirefox) {
    let canSendMaxMessageSize = 65536;
    if (browserDetails.browser === "firefox") {
      if (browserDetails.version < 57) {
        if (remoteIsFirefox === -1) {
          canSendMaxMessageSize = 16384;
        } else {
          canSendMaxMessageSize = 2147483637;
        }
      } else if (browserDetails.version < 60) {
        canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
      } else {
        canSendMaxMessageSize = 2147483637;
      }
    }
    return canSendMaxMessageSize;
  };
  const getMaxMessageSize = function(description, remoteIsFirefox) {
    let maxMessageSize = 65536;
    if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
      maxMessageSize = 65535;
    }
    const match = SDPUtils.matchPrefix(
      description.sdp,
      "a=max-message-size:"
    );
    if (match.length > 0) {
      maxMessageSize = parseInt(match[0].substring(19), 10);
    } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
      maxMessageSize = 2147483637;
    }
    return maxMessageSize;
  };
  const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
    this._sctp = null;
    if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
      const { sdpSemantics } = this.getConfiguration();
      if (sdpSemantics === "plan-b") {
        Object.defineProperty(this, "sctp", {
          get() {
            return typeof this._sctp === "undefined" ? null : this._sctp;
          },
          enumerable: true,
          configurable: true
        });
      }
    }
    if (sctpInDescription(arguments[0])) {
      const isFirefox = getRemoteFirefoxVersion(arguments[0]);
      const canSendMMS = getCanSendMaxMessageSize(isFirefox);
      const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);
      let maxMessageSize;
      if (canSendMMS === 0 && remoteMMS === 0) {
        maxMessageSize = Number.POSITIVE_INFINITY;
      } else if (canSendMMS === 0 || remoteMMS === 0) {
        maxMessageSize = Math.max(canSendMMS, remoteMMS);
      } else {
        maxMessageSize = Math.min(canSendMMS, remoteMMS);
      }
      const sctp = {};
      Object.defineProperty(sctp, "maxMessageSize", {
        get() {
          return maxMessageSize;
        }
      });
      this._sctp = sctp;
    }
    return origSetRemoteDescription.apply(this, arguments);
  };
}
function shimSendThrowTypeError(window2) {
  if (!(window2.RTCPeerConnection && "createDataChannel" in window2.RTCPeerConnection.prototype)) {
    return;
  }
  function wrapDcSend(dc, pc) {
    const origDataChannelSend = dc.send;
    dc.send = function send() {
      const data = arguments[0];
      const length = data.length || data.size || data.byteLength;
      if (dc.readyState === "open" && pc.sctp && length > pc.sctp.maxMessageSize) {
        throw new TypeError("Message too large (can send a maximum of " + pc.sctp.maxMessageSize + " bytes)");
      }
      return origDataChannelSend.apply(dc, arguments);
    };
  }
  const origCreateDataChannel = window2.RTCPeerConnection.prototype.createDataChannel;
  window2.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
    const dataChannel = origCreateDataChannel.apply(this, arguments);
    wrapDcSend(dataChannel, this);
    return dataChannel;
  };
  wrapPeerConnectionEvent(window2, "datachannel", (e) => {
    wrapDcSend(e.channel, e.target);
    return e;
  });
}
function shimConnectionState(window2) {
  if (!window2.RTCPeerConnection || "connectionState" in window2.RTCPeerConnection.prototype) {
    return;
  }
  const proto = window2.RTCPeerConnection.prototype;
  Object.defineProperty(proto, "connectionState", {
    get() {
      return {
        completed: "connected",
        checking: "connecting"
      }[this.iceConnectionState] || this.iceConnectionState;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(proto, "onconnectionstatechange", {
    get() {
      return this._onconnectionstatechange || null;
    },
    set(cb) {
      if (this._onconnectionstatechange) {
        this.removeEventListener(
          "connectionstatechange",
          this._onconnectionstatechange
        );
        delete this._onconnectionstatechange;
      }
      if (cb) {
        this.addEventListener(
          "connectionstatechange",
          this._onconnectionstatechange = cb
        );
      }
    },
    enumerable: true,
    configurable: true
  });
  ["setLocalDescription", "setRemoteDescription"].forEach((method) => {
    const origMethod = proto[method];
    proto[method] = function() {
      if (!this._connectionstatechangepoly) {
        this._connectionstatechangepoly = (e) => {
          const pc = e.target;
          if (pc._lastConnectionState !== pc.connectionState) {
            pc._lastConnectionState = pc.connectionState;
            const newEvent = new Event("connectionstatechange", e);
            pc.dispatchEvent(newEvent);
          }
          return e;
        };
        this.addEventListener(
          "iceconnectionstatechange",
          this._connectionstatechangepoly
        );
      }
      return origMethod.apply(this, arguments);
    };
  });
}
function removeExtmapAllowMixed(window2, browserDetails) {
  if (!window2.RTCPeerConnection) {
    return;
  }
  if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
    return;
  }
  if (browserDetails.browser === "safari" && browserDetails._safariVersion >= 13.1) {
    return;
  }
  const nativeSRD = window2.RTCPeerConnection.prototype.setRemoteDescription;
  window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
    if (desc && desc.sdp && desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
      const sdp2 = desc.sdp.split("\n").filter((line) => {
        return line.trim() !== "a=extmap-allow-mixed";
      }).join("\n");
      if (window2.RTCSessionDescription && desc instanceof window2.RTCSessionDescription) {
        arguments[0] = new window2.RTCSessionDescription({
          type: desc.type,
          sdp: sdp2
        });
      } else {
        desc.sdp = sdp2;
      }
    }
    return nativeSRD.apply(this, arguments);
  };
}
function shimAddIceCandidateNullOrEmpty(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeAddIceCandidate = window2.RTCPeerConnection.prototype.addIceCandidate;
  if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
    if (!arguments[0]) {
      if (arguments[1]) {
        arguments[1].apply(null);
      }
      return Promise.resolve();
    }
    if ((browserDetails.browser === "chrome" && browserDetails.version < 78 || browserDetails.browser === "firefox" && browserDetails.version < 68 || browserDetails.browser === "safari") && arguments[0] && arguments[0].candidate === "") {
      return Promise.resolve();
    }
    return nativeAddIceCandidate.apply(this, arguments);
  };
}
function shimParameterlessSetLocalDescription(window2, browserDetails) {
  if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
    return;
  }
  const nativeSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
  if (!nativeSetLocalDescription || nativeSetLocalDescription.length === 0) {
    return;
  }
  window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
    let desc = arguments[0] || {};
    if (typeof desc !== "object" || desc.type && desc.sdp) {
      return nativeSetLocalDescription.apply(this, arguments);
    }
    desc = { type: desc.type, sdp: desc.sdp };
    if (!desc.type) {
      switch (this.signalingState) {
        case "stable":
        case "have-local-offer":
        case "have-remote-pranswer":
          desc.type = "offer";
          break;
        default:
          desc.type = "answer";
          break;
      }
    }
    if (desc.sdp || desc.type !== "offer" && desc.type !== "answer") {
      return nativeSetLocalDescription.apply(this, [desc]);
    }
    const func = desc.type === "offer" ? this.createOffer : this.createAnswer;
    return func.apply(this).then((d) => nativeSetLocalDescription.apply(this, [d]));
  };
}
const commonShim = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  removeExtmapAllowMixed,
  shimAddIceCandidateNullOrEmpty,
  shimConnectionState,
  shimMaxMessageSize,
  shimParameterlessSetLocalDescription,
  shimRTCIceCandidate,
  shimRTCIceCandidateRelayProtocol,
  shimSendThrowTypeError
}, Symbol.toStringTag, { value: "Module" }));
function adapterFactory({ window: window2 } = {}, options = {
  shimChrome: true,
  shimFirefox: true,
  shimSafari: true
}) {
  const logging2 = log;
  const browserDetails = detectBrowser(window2);
  const adapter2 = {
    browserDetails,
    commonShim,
    extractVersion,
    disableLog,
    disableWarnings,
    // Expose sdp as a convenience. For production apps include directly.
    sdp
  };
  switch (browserDetails.browser) {
    case "chrome":
      if (!chromeShim || !shimPeerConnection$1 || !options.shimChrome) {
        logging2("Chrome shim is not included in this adapter release.");
        return adapter2;
      }
      if (browserDetails.version === null) {
        logging2("Chrome shim can not determine version, not shimming.");
        return adapter2;
      }
      logging2("adapter.js shimming chrome.");
      adapter2.browserShim = chromeShim;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2);
      shimGetUserMedia$2(window2, browserDetails);
      shimMediaStream(window2);
      shimPeerConnection$1(window2, browserDetails);
      shimOnTrack$1(window2);
      shimAddTrackRemoveTrack(window2, browserDetails);
      shimGetSendersWithDtmf(window2);
      shimSenderReceiverGetStats(window2);
      fixNegotiationNeeded(window2, browserDetails);
      shimRTCIceCandidate(window2);
      shimRTCIceCandidateRelayProtocol(window2);
      shimConnectionState(window2);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    case "firefox":
      if (!firefoxShim || !shimPeerConnection || !options.shimFirefox) {
        logging2("Firefox shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming firefox.");
      adapter2.browserShim = firefoxShim;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2);
      shimGetUserMedia$1(window2, browserDetails);
      shimPeerConnection(window2, browserDetails);
      shimOnTrack(window2);
      shimRemoveStream(window2);
      shimSenderGetStats(window2);
      shimReceiverGetStats(window2);
      shimRTCDataChannel(window2);
      shimAddTransceiver(window2);
      shimGetParameters(window2);
      shimCreateOffer(window2);
      shimCreateAnswer(window2);
      shimRTCIceCandidate(window2);
      shimConnectionState(window2);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2);
      break;
    case "safari":
      if (!safariShim || !options.shimSafari) {
        logging2("Safari shim is not included in this adapter release.");
        return adapter2;
      }
      logging2("adapter.js shimming safari.");
      adapter2.browserShim = safariShim;
      shimAddIceCandidateNullOrEmpty(window2, browserDetails);
      shimParameterlessSetLocalDescription(window2);
      shimRTCIceServerUrls(window2);
      shimCreateOfferLegacy(window2);
      shimCallbacksAPI(window2);
      shimLocalStreamsAPI(window2);
      shimRemoteStreamsAPI(window2);
      shimTrackEventTransceiver(window2);
      shimGetUserMedia(window2);
      shimAudioContext(window2);
      shimRTCIceCandidate(window2);
      shimRTCIceCandidateRelayProtocol(window2);
      shimMaxMessageSize(window2, browserDetails);
      shimSendThrowTypeError(window2);
      removeExtmapAllowMixed(window2, browserDetails);
      break;
    default:
      logging2("Unsupported browser!");
      break;
  }
  return adapter2;
}
const adapter = adapterFactory({ window: typeof window === "undefined" ? void 0 : window });
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, { get: v, set: s, enumerable: true, configurable: true });
}
class $fcbcc7538a6776d5$export$f1c5f4c9cb95390b {
  constructor() {
    this.chunkedMTU = 16300;
    this._dataCount = 1;
    this.chunk = (blob) => {
      const chunks = [];
      const size = blob.byteLength;
      const total = Math.ceil(size / this.chunkedMTU);
      let index2 = 0;
      let start = 0;
      while (start < size) {
        const end = Math.min(size, start + this.chunkedMTU);
        const b = blob.slice(start, end);
        const chunk = {
          __peerData: this._dataCount,
          n: index2,
          data: b,
          total
        };
        chunks.push(chunk);
        start = end;
        index2++;
      }
      this._dataCount++;
      return chunks;
    };
  }
}
function $fcbcc7538a6776d5$export$52c89ebcdc4f53f2(bufs) {
  let size = 0;
  for (const buf of bufs) size += buf.byteLength;
  const result = new Uint8Array(size);
  let offset = 0;
  for (const buf of bufs) {
    result.set(buf, offset);
    offset += buf.byteLength;
  }
  return result;
}
const $fb63e766cfafaab9$var$webRTCAdapter = (
  //@ts-ignore
  adapter.default || adapter
);
const $fb63e766cfafaab9$export$25be9502477c137d = new class {
  isWebRTCSupported() {
    return typeof RTCPeerConnection !== "undefined";
  }
  isBrowserSupported() {
    const browser = this.getBrowser();
    const version = this.getVersion();
    const validBrowser = this.supportedBrowsers.includes(browser);
    if (!validBrowser) return false;
    if (browser === "chrome") return version >= this.minChromeVersion;
    if (browser === "firefox") return version >= this.minFirefoxVersion;
    if (browser === "safari") return !this.isIOS && version >= this.minSafariVersion;
    return false;
  }
  getBrowser() {
    return $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.browser;
  }
  getVersion() {
    return $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.version || 0;
  }
  isUnifiedPlanSupported() {
    const browser = this.getBrowser();
    const version = $fb63e766cfafaab9$var$webRTCAdapter.browserDetails.version || 0;
    if (browser === "chrome" && version < this.minChromeVersion) return false;
    if (browser === "firefox" && version >= this.minFirefoxVersion) return true;
    if (!window.RTCRtpTransceiver || !("currentDirection" in RTCRtpTransceiver.prototype)) return false;
    let tempPc;
    let supported = false;
    try {
      tempPc = new RTCPeerConnection();
      tempPc.addTransceiver("audio");
      supported = true;
    } catch (e) {
    } finally {
      if (tempPc) tempPc.close();
    }
    return supported;
  }
  toString() {
    return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;
  }
  constructor() {
    this.isIOS = typeof navigator !== "undefined" ? [
      "iPad",
      "iPhone",
      "iPod"
    ].includes(navigator.platform) : false;
    this.supportedBrowsers = [
      "firefox",
      "chrome",
      "safari"
    ];
    this.minFirefoxVersion = 59;
    this.minChromeVersion = 72;
    this.minSafariVersion = 605;
  }
}();
const $9a84a32bf0bf36bb$export$f35f128fd59ea256 = (id) => {
  return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(id);
};
const $0e5fd1585784c252$export$4e61f672936bec77 = () => Math.random().toString(36).slice(2);
const $4f4134156c446392$var$DEFAULT_CONFIG = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
    {
      urls: [
        "turn:eu-0.turn.peerjs.com:3478",
        "turn:us-0.turn.peerjs.com:3478"
      ],
      username: "peerjs",
      credential: "peerjsp"
    }
  ],
  sdpSemantics: "unified-plan"
};
class $4f4134156c446392$export$f8f26dd395d7e1bd extends $fcbcc7538a6776d5$export$f1c5f4c9cb95390b {
  noop() {
  }
  blobToArrayBuffer(blob, cb) {
    const fr = new FileReader();
    fr.onload = function(evt) {
      if (evt.target) cb(evt.target.result);
    };
    fr.readAsArrayBuffer(blob);
    return fr;
  }
  binaryStringToArrayBuffer(binary) {
    const byteArray = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) byteArray[i] = binary.charCodeAt(i) & 255;
    return byteArray.buffer;
  }
  isSecure() {
    return location.protocol === "https:";
  }
  constructor(...args) {
    super(...args);
    this.CLOUD_HOST = "0.peerjs.com";
    this.CLOUD_PORT = 443;
    this.chunkedBrowsers = {
      Chrome: 1,
      chrome: 1
    };
    this.defaultConfig = $4f4134156c446392$var$DEFAULT_CONFIG;
    this.browser = $fb63e766cfafaab9$export$25be9502477c137d.getBrowser();
    this.browserVersion = $fb63e766cfafaab9$export$25be9502477c137d.getVersion();
    this.pack = $0cfd7828ad59115f$export$2a703dbb0cb35339;
    this.unpack = $0cfd7828ad59115f$export$417857010dc9287f;
    this.supports = function() {
      const supported = {
        browser: $fb63e766cfafaab9$export$25be9502477c137d.isBrowserSupported(),
        webRTC: $fb63e766cfafaab9$export$25be9502477c137d.isWebRTCSupported(),
        audioVideo: false,
        data: false,
        binaryBlob: false,
        reliable: false
      };
      if (!supported.webRTC) return supported;
      let pc;
      try {
        pc = new RTCPeerConnection($4f4134156c446392$var$DEFAULT_CONFIG);
        supported.audioVideo = true;
        let dc;
        try {
          dc = pc.createDataChannel("_PEERJSTEST", {
            ordered: true
          });
          supported.data = true;
          supported.reliable = !!dc.ordered;
          try {
            dc.binaryType = "blob";
            supported.binaryBlob = !(0, $fb63e766cfafaab9$export$25be9502477c137d).isIOS;
          } catch (e) {
          }
        } catch (e) {
        } finally {
          if (dc) dc.close();
        }
      } catch (e) {
      } finally {
        if (pc) pc.close();
      }
      return supported;
    }();
    this.validateId = $9a84a32bf0bf36bb$export$f35f128fd59ea256;
    this.randomToken = $0e5fd1585784c252$export$4e61f672936bec77;
  }
}
const $4f4134156c446392$export$7debb50ef11d5e0b = new $4f4134156c446392$export$f8f26dd395d7e1bd();
const $257947e92926277a$var$LOG_PREFIX = "PeerJS: ";
var $257947e92926277a$export$243e62d78d3b544d;
(function(LogLevel) {
  LogLevel[LogLevel["Disabled"] = 0] = "Disabled";
  LogLevel[LogLevel["Errors"] = 1] = "Errors";
  LogLevel[LogLevel["Warnings"] = 2] = "Warnings";
  LogLevel[LogLevel["All"] = 3] = "All";
})($257947e92926277a$export$243e62d78d3b544d || ($257947e92926277a$export$243e62d78d3b544d = {}));
class $257947e92926277a$var$Logger {
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(logLevel) {
    this._logLevel = logLevel;
  }
  log(...args) {
    if (this._logLevel >= 3) this._print(3, ...args);
  }
  warn(...args) {
    if (this._logLevel >= 2) this._print(2, ...args);
  }
  error(...args) {
    if (this._logLevel >= 1) this._print(1, ...args);
  }
  setLogFunction(fn) {
    this._print = fn;
  }
  _print(logLevel, ...rest) {
    const copy = [
      $257947e92926277a$var$LOG_PREFIX,
      ...rest
    ];
    for (const i in copy) if (copy[i] instanceof Error) copy[i] = "(" + copy[i].name + ") " + copy[i].message;
    if (logLevel >= 3) console.log(...copy);
    else if (logLevel >= 2) console.warn("WARNING", ...copy);
    else if (logLevel >= 1) console.error("ERROR", ...copy);
  }
  constructor() {
    this._logLevel = 0;
  }
}
var $257947e92926277a$export$2e2bcd8739ae039 = new $257947e92926277a$var$Logger();
var $c4dcfd1d1ea86647$exports = {};
var $c4dcfd1d1ea86647$var$has = Object.prototype.hasOwnProperty, $c4dcfd1d1ea86647$var$prefix = "~";
function $c4dcfd1d1ea86647$var$Events() {
}
if (Object.create) {
  $c4dcfd1d1ea86647$var$Events.prototype = /* @__PURE__ */ Object.create(null);
  if (!new $c4dcfd1d1ea86647$var$Events().__proto__) $c4dcfd1d1ea86647$var$prefix = false;
}
function $c4dcfd1d1ea86647$var$EE(fn, context, once2) {
  this.fn = fn;
  this.context = context;
  this.once = once2 || false;
}
function $c4dcfd1d1ea86647$var$addListener(emitter, event2, fn, context, once2) {
  if (typeof fn !== "function") throw new TypeError("The listener must be a function");
  var listener = new $c4dcfd1d1ea86647$var$EE(fn, context || emitter, once2), evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2;
  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [
    emitter._events[evt],
    listener
  ];
  return emitter;
}
function $c4dcfd1d1ea86647$var$clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new $c4dcfd1d1ea86647$var$Events();
  else delete emitter._events[evt];
}
function $c4dcfd1d1ea86647$var$EventEmitter() {
  this._events = new $c4dcfd1d1ea86647$var$Events();
  this._eventsCount = 0;
}
$c4dcfd1d1ea86647$var$EventEmitter.prototype.eventNames = function eventNames() {
  var names = [], events, name;
  if (this._eventsCount === 0) return names;
  for (name in events = this._events) if ($c4dcfd1d1ea86647$var$has.call(events, name)) names.push($c4dcfd1d1ea86647$var$prefix ? name.slice(1) : name);
  if (Object.getOwnPropertySymbols) return names.concat(Object.getOwnPropertySymbols(events));
  return names;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.listeners = function listeners2(event2) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2, handlers = this._events[evt];
  if (!handlers) return [];
  if (handlers.fn) return [
    handlers.fn
  ];
  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) ee[i] = handlers[i].fn;
  return ee;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.listenerCount = function listenerCount(event2) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2, listeners3 = this._events[evt];
  if (!listeners3) return 0;
  if (listeners3.fn) return 1;
  return listeners3.length;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.emit = function emit(event2, a1, a2, a3, a4, a5) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2;
  if (!this._events[evt]) return false;
  var listeners3 = this._events[evt], len = arguments.length, args, i;
  if (listeners3.fn) {
    if (listeners3.once) this.removeListener(event2, listeners3.fn, void 0, true);
    switch (len) {
      case 1:
        return listeners3.fn.call(listeners3.context), true;
      case 2:
        return listeners3.fn.call(listeners3.context, a1), true;
      case 3:
        return listeners3.fn.call(listeners3.context, a1, a2), true;
      case 4:
        return listeners3.fn.call(listeners3.context, a1, a2, a3), true;
      case 5:
        return listeners3.fn.call(listeners3.context, a1, a2, a3, a4), true;
      case 6:
        return listeners3.fn.call(listeners3.context, a1, a2, a3, a4, a5), true;
    }
    for (i = 1, args = new Array(len - 1); i < len; i++) args[i - 1] = arguments[i];
    listeners3.fn.apply(listeners3.context, args);
  } else {
    var length = listeners3.length, j;
    for (i = 0; i < length; i++) {
      if (listeners3[i].once) this.removeListener(event2, listeners3[i].fn, void 0, true);
      switch (len) {
        case 1:
          listeners3[i].fn.call(listeners3[i].context);
          break;
        case 2:
          listeners3[i].fn.call(listeners3[i].context, a1);
          break;
        case 3:
          listeners3[i].fn.call(listeners3[i].context, a1, a2);
          break;
        case 4:
          listeners3[i].fn.call(listeners3[i].context, a1, a2, a3);
          break;
        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) args[j - 1] = arguments[j];
          listeners3[i].fn.apply(listeners3[i].context, args);
      }
    }
  }
  return true;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.on = function on(event2, fn, context) {
  return $c4dcfd1d1ea86647$var$addListener(this, event2, fn, context, false);
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.once = function once(event2, fn, context) {
  return $c4dcfd1d1ea86647$var$addListener(this, event2, fn, context, true);
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.removeListener = function removeListener(event2, fn, context, once2) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2;
  if (!this._events[evt]) return this;
  if (!fn) {
    $c4dcfd1d1ea86647$var$clearEvent(this, evt);
    return this;
  }
  var listeners3 = this._events[evt];
  if (listeners3.fn) {
    if (listeners3.fn === fn && (!once2 || listeners3.once) && (!context || listeners3.context === context)) $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  } else {
    for (var i = 0, events = [], length = listeners3.length; i < length; i++) if (listeners3[i].fn !== fn || once2 && !listeners3[i].once || context && listeners3[i].context !== context) events.push(listeners3[i]);
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  }
  return this;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.removeAllListeners = function removeAllListeners(event2) {
  var evt;
  if (event2) {
    evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2;
    if (this._events[evt]) $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  } else {
    this._events = new $c4dcfd1d1ea86647$var$Events();
    this._eventsCount = 0;
  }
  return this;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.off = $c4dcfd1d1ea86647$var$EventEmitter.prototype.removeListener;
$c4dcfd1d1ea86647$var$EventEmitter.prototype.addListener = $c4dcfd1d1ea86647$var$EventEmitter.prototype.on;
$c4dcfd1d1ea86647$var$EventEmitter.prefixed = $c4dcfd1d1ea86647$var$prefix;
$c4dcfd1d1ea86647$var$EventEmitter.EventEmitter = $c4dcfd1d1ea86647$var$EventEmitter;
$c4dcfd1d1ea86647$exports = $c4dcfd1d1ea86647$var$EventEmitter;
var $78455e22dea96b8c$exports = {};
$parcel$export($78455e22dea96b8c$exports, "ConnectionType", () => $78455e22dea96b8c$export$3157d57b4135e3bc);
$parcel$export($78455e22dea96b8c$exports, "PeerErrorType", () => $78455e22dea96b8c$export$9547aaa2e39030ff);
$parcel$export($78455e22dea96b8c$exports, "BaseConnectionErrorType", () => $78455e22dea96b8c$export$7974935686149686);
$parcel$export($78455e22dea96b8c$exports, "DataConnectionErrorType", () => $78455e22dea96b8c$export$49ae800c114df41d);
$parcel$export($78455e22dea96b8c$exports, "SerializationType", () => $78455e22dea96b8c$export$89f507cf986a947);
$parcel$export($78455e22dea96b8c$exports, "SocketEventType", () => $78455e22dea96b8c$export$3b5c4a4b6354f023);
$parcel$export($78455e22dea96b8c$exports, "ServerMessageType", () => $78455e22dea96b8c$export$adb4a1754da6f10d);
var $78455e22dea96b8c$export$3157d57b4135e3bc;
(function(ConnectionType) {
  ConnectionType["Data"] = "data";
  ConnectionType["Media"] = "media";
})($78455e22dea96b8c$export$3157d57b4135e3bc || ($78455e22dea96b8c$export$3157d57b4135e3bc = {}));
var $78455e22dea96b8c$export$9547aaa2e39030ff;
(function(PeerErrorType) {
  PeerErrorType["BrowserIncompatible"] = "browser-incompatible";
  PeerErrorType["Disconnected"] = "disconnected";
  PeerErrorType["InvalidID"] = "invalid-id";
  PeerErrorType["InvalidKey"] = "invalid-key";
  PeerErrorType["Network"] = "network";
  PeerErrorType["PeerUnavailable"] = "peer-unavailable";
  PeerErrorType["SslUnavailable"] = "ssl-unavailable";
  PeerErrorType["ServerError"] = "server-error";
  PeerErrorType["SocketError"] = "socket-error";
  PeerErrorType["SocketClosed"] = "socket-closed";
  PeerErrorType["UnavailableID"] = "unavailable-id";
  PeerErrorType["WebRTC"] = "webrtc";
})($78455e22dea96b8c$export$9547aaa2e39030ff || ($78455e22dea96b8c$export$9547aaa2e39030ff = {}));
var $78455e22dea96b8c$export$7974935686149686;
(function(BaseConnectionErrorType) {
  BaseConnectionErrorType["NegotiationFailed"] = "negotiation-failed";
  BaseConnectionErrorType["ConnectionClosed"] = "connection-closed";
})($78455e22dea96b8c$export$7974935686149686 || ($78455e22dea96b8c$export$7974935686149686 = {}));
var $78455e22dea96b8c$export$49ae800c114df41d;
(function(DataConnectionErrorType) {
  DataConnectionErrorType["NotOpenYet"] = "not-open-yet";
  DataConnectionErrorType["MessageToBig"] = "message-too-big";
})($78455e22dea96b8c$export$49ae800c114df41d || ($78455e22dea96b8c$export$49ae800c114df41d = {}));
var $78455e22dea96b8c$export$89f507cf986a947;
(function(SerializationType) {
  SerializationType["Binary"] = "binary";
  SerializationType["BinaryUTF8"] = "binary-utf8";
  SerializationType["JSON"] = "json";
  SerializationType["None"] = "raw";
})($78455e22dea96b8c$export$89f507cf986a947 || ($78455e22dea96b8c$export$89f507cf986a947 = {}));
var $78455e22dea96b8c$export$3b5c4a4b6354f023;
(function(SocketEventType) {
  SocketEventType["Message"] = "message";
  SocketEventType["Disconnected"] = "disconnected";
  SocketEventType["Error"] = "error";
  SocketEventType["Close"] = "close";
})($78455e22dea96b8c$export$3b5c4a4b6354f023 || ($78455e22dea96b8c$export$3b5c4a4b6354f023 = {}));
var $78455e22dea96b8c$export$adb4a1754da6f10d;
(function(ServerMessageType) {
  ServerMessageType["Heartbeat"] = "HEARTBEAT";
  ServerMessageType["Candidate"] = "CANDIDATE";
  ServerMessageType["Offer"] = "OFFER";
  ServerMessageType["Answer"] = "ANSWER";
  ServerMessageType["Open"] = "OPEN";
  ServerMessageType["Error"] = "ERROR";
  ServerMessageType["IdTaken"] = "ID-TAKEN";
  ServerMessageType["InvalidKey"] = "INVALID-KEY";
  ServerMessageType["Leave"] = "LEAVE";
  ServerMessageType["Expire"] = "EXPIRE";
})($78455e22dea96b8c$export$adb4a1754da6f10d || ($78455e22dea96b8c$export$adb4a1754da6f10d = {}));
var $f5f881ec4575f1fc$exports = {};
$f5f881ec4575f1fc$exports = JSON.parse('{"name":"peerjs","version":"1.5.4","keywords":["peerjs","webrtc","p2p","rtc"],"description":"PeerJS client","homepage":"https://peerjs.com","bugs":{"url":"https://github.com/peers/peerjs/issues"},"repository":{"type":"git","url":"https://github.com/peers/peerjs"},"license":"MIT","contributors":["Michelle Bu <michelle@michellebu.com>","afrokick <devbyru@gmail.com>","ericz <really.ez@gmail.com>","Jairo <kidandcat@gmail.com>","Jonas Gloning <34194370+jonasgloning@users.noreply.github.com>","Jairo Caro-Accino Viciana <jairo@galax.be>","Carlos Caballero <carlos.caballero.gonzalez@gmail.com>","hc <hheennrryy@gmail.com>","Muhammad Asif <capripio@gmail.com>","PrashoonB <prashoonbhattacharjee@gmail.com>","Harsh Bardhan Mishra <47351025+HarshCasper@users.noreply.github.com>","akotynski <aleksanderkotbury@gmail.com>","lmb <i@lmb.io>","Jairooo <jairocaro@msn.com>","Moritz Stückler <moritz.stueckler@gmail.com>","Simon <crydotsnakegithub@gmail.com>","Denis Lukov <denismassters@gmail.com>","Philipp Hancke <fippo@andyet.net>","Hans Oksendahl <hansoksendahl@gmail.com>","Jess <jessachandler@gmail.com>","khankuan <khankuan@gmail.com>","DUODVK <kurmanov.work@gmail.com>","XiZhao <kwang1imsa@gmail.com>","Matthias Lohr <matthias@lohr.me>","=frank tree <=frnktrb@googlemail.com>","Andre Eckardt <aeckardt@outlook.com>","Chris Cowan <agentme49@gmail.com>","Alex Chuev <alex@chuev.com>","alxnull <alxnull@e.mail.de>","Yemel Jardi <angel.jardi@gmail.com>","Ben Parnell <benjaminparnell.94@gmail.com>","Benny Lichtner <bennlich@gmail.com>","fresheneesz <bitetrudpublic@gmail.com>","bob.barstead@exaptive.com <bob.barstead@exaptive.com>","chandika <chandika@gmail.com>","emersion <contact@emersion.fr>","Christopher Van <cvan@users.noreply.github.com>","eddieherm <edhermoso@gmail.com>","Eduardo Pinho <enet4mikeenet@gmail.com>","Evandro Zanatta <ezanatta@tray.net.br>","Gardner Bickford <gardner@users.noreply.github.com>","Gian Luca <gianluca.cecchi@cynny.com>","PatrickJS <github@gdi2290.com>","jonnyf <github@jonathanfoss.co.uk>","Hizkia Felix <hizkifw@gmail.com>","Hristo Oskov <hristo.oskov@gmail.com>","Isaac Madwed <i.madwed@gmail.com>","Ilya Konanykhin <ilya.konanykhin@gmail.com>","jasonbarry <jasbarry@me.com>","Jonathan Burke <jonathan.burke.1311@googlemail.com>","Josh Hamit <josh.hamit@gmail.com>","Jordan Austin <jrax86@gmail.com>","Joel Wetzell <jwetzell@yahoo.com>","xizhao <kevin.wang@cloudera.com>","Alberto Torres <kungfoobar@gmail.com>","Jonathan Mayol <mayoljonathan@gmail.com>","Jefferson Felix <me@jsfelix.dev>","Rolf Erik Lekang <me@rolflekang.com>","Kevin Mai-Husan Chia <mhchia@users.noreply.github.com>","Pepijn de Vos <pepijndevos@gmail.com>","JooYoung <qkdlql@naver.com>","Tobias Speicher <rootcommander@gmail.com>","Steve Blaurock <sblaurock@gmail.com>","Kyrylo Shegeda <shegeda@ualberta.ca>","Diwank Singh Tomer <singh@diwank.name>","Sören Balko <Soeren.Balko@gmail.com>","Arpit Solanki <solankiarpit1997@gmail.com>","Yuki Ito <yuki@gnnk.net>","Artur Zayats <zag2art@gmail.com>"],"funding":{"type":"opencollective","url":"https://opencollective.com/peer"},"collective":{"type":"opencollective","url":"https://opencollective.com/peer"},"files":["dist/*"],"sideEffects":["lib/global.ts","lib/supports.ts"],"main":"dist/bundler.cjs","module":"dist/bundler.mjs","browser-minified":"dist/peerjs.min.js","browser-unminified":"dist/peerjs.js","browser-minified-msgpack":"dist/serializer.msgpack.mjs","types":"dist/types.d.ts","engines":{"node":">= 14"},"targets":{"types":{"source":"lib/exports.ts"},"main":{"source":"lib/exports.ts","sourceMap":{"inlineSources":true}},"module":{"source":"lib/exports.ts","includeNodeModules":["eventemitter3"],"sourceMap":{"inlineSources":true}},"browser-minified":{"context":"browser","outputFormat":"global","optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"},"source":"lib/global.ts"},"browser-unminified":{"context":"browser","outputFormat":"global","optimize":false,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 80, safari >= 15"},"source":"lib/global.ts"},"browser-minified-msgpack":{"context":"browser","outputFormat":"esmodule","isLibrary":true,"optimize":true,"engines":{"browsers":"chrome >= 83, edge >= 83, firefox >= 102, safari >= 15"},"source":"lib/dataconnection/StreamConnection/MsgPack.ts"}},"scripts":{"contributors":"git-authors-cli --print=false && prettier --write package.json && git add package.json package-lock.json && git commit -m \\"chore(contributors): update and sort contributors list\\"","check":"tsc --noEmit && tsc -p e2e/tsconfig.json --noEmit","watch":"parcel watch","build":"rm -rf dist && parcel build","prepublishOnly":"npm run build","test":"jest","test:watch":"jest --watch","coverage":"jest --coverage --collectCoverageFrom=\\"./lib/**\\"","format":"prettier --write .","format:check":"prettier --check .","semantic-release":"semantic-release","e2e":"wdio run e2e/wdio.local.conf.ts","e2e:bstack":"wdio run e2e/wdio.bstack.conf.ts"},"devDependencies":{"@parcel/config-default":"^2.9.3","@parcel/packager-ts":"^2.9.3","@parcel/transformer-typescript-tsc":"^2.9.3","@parcel/transformer-typescript-types":"^2.9.3","@semantic-release/changelog":"^6.0.1","@semantic-release/git":"^10.0.1","@swc/core":"^1.3.27","@swc/jest":"^0.2.24","@types/jasmine":"^4.3.4","@wdio/browserstack-service":"^8.11.2","@wdio/cli":"^8.11.2","@wdio/globals":"^8.11.2","@wdio/jasmine-framework":"^8.11.2","@wdio/local-runner":"^8.11.2","@wdio/spec-reporter":"^8.11.2","@wdio/types":"^8.10.4","http-server":"^14.1.1","jest":"^29.3.1","jest-environment-jsdom":"^29.3.1","mock-socket":"^9.0.0","parcel":"^2.9.3","prettier":"^3.0.0","semantic-release":"^21.0.0","ts-node":"^10.9.1","typescript":"^5.0.0","wdio-geckodriver-service":"^5.0.1"},"dependencies":{"@msgpack/msgpack":"^2.8.0","eventemitter3":"^4.0.7","peerjs-js-binarypack":"^2.1.0","webrtc-adapter":"^9.0.0"},"alias":{"process":false,"buffer":false}}');
class $8f5bfa60836d261d$export$4798917dbf149b79 extends $c4dcfd1d1ea86647$exports.EventEmitter {
  constructor(secure, host, port, path, key2, pingInterval = 5e3) {
    super();
    this.pingInterval = pingInterval;
    this._disconnected = true;
    this._messagesQueue = [];
    const wsProtocol = secure ? "wss://" : "ws://";
    this._baseUrl = wsProtocol + host + ":" + port + path + "peerjs?key=" + key2;
  }
  start(id, token) {
    this._id = id;
    const wsUrl = `${this._baseUrl}&id=${id}&token=${token}`;
    if (!!this._socket || !this._disconnected) return;
    this._socket = new WebSocket(wsUrl + "&version=" + $f5f881ec4575f1fc$exports.version);
    this._disconnected = false;
    this._socket.onmessage = (event2) => {
      let data;
      try {
        data = JSON.parse(event2.data);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Server message received:", data);
      } catch (e) {
        $257947e92926277a$export$2e2bcd8739ae039.log("Invalid server message", event2.data);
        return;
      }
      this.emit($78455e22dea96b8c$export$3b5c4a4b6354f023.Message, data);
    };
    this._socket.onclose = (event2) => {
      if (this._disconnected) return;
      $257947e92926277a$export$2e2bcd8739ae039.log("Socket closed.", event2);
      this._cleanup();
      this._disconnected = true;
      this.emit($78455e22dea96b8c$export$3b5c4a4b6354f023.Disconnected);
    };
    this._socket.onopen = () => {
      if (this._disconnected) return;
      this._sendQueuedMessages();
      $257947e92926277a$export$2e2bcd8739ae039.log("Socket open");
      this._scheduleHeartbeat();
    };
  }
  _scheduleHeartbeat() {
    this._wsPingTimer = setTimeout(() => {
      this._sendHeartbeat();
    }, this.pingInterval);
  }
  _sendHeartbeat() {
    if (!this._wsOpen()) {
      $257947e92926277a$export$2e2bcd8739ae039.log(`Cannot send heartbeat, because socket closed`);
      return;
    }
    const message = JSON.stringify({
      type: $78455e22dea96b8c$export$adb4a1754da6f10d.Heartbeat
    });
    this._socket.send(message);
    this._scheduleHeartbeat();
  }
  /** Is the websocket currently open? */
  _wsOpen() {
    return !!this._socket && this._socket.readyState === 1;
  }
  /** Send queued messages. */
  _sendQueuedMessages() {
    const copiedQueue = [
      ...this._messagesQueue
    ];
    this._messagesQueue = [];
    for (const message of copiedQueue) this.send(message);
  }
  /** Exposed send for DC & Peer. */
  send(data) {
    if (this._disconnected) return;
    if (!this._id) {
      this._messagesQueue.push(data);
      return;
    }
    if (!data.type) {
      this.emit($78455e22dea96b8c$export$3b5c4a4b6354f023.Error, "Invalid message");
      return;
    }
    if (!this._wsOpen()) return;
    const message = JSON.stringify(data);
    this._socket.send(message);
  }
  close() {
    if (this._disconnected) return;
    this._cleanup();
    this._disconnected = true;
  }
  _cleanup() {
    if (this._socket) {
      this._socket.onopen = this._socket.onmessage = this._socket.onclose = null;
      this._socket.close();
      this._socket = void 0;
    }
    clearTimeout(this._wsPingTimer);
  }
}
class $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a {
  constructor(connection) {
    this.connection = connection;
  }
  /** Returns a PeerConnection object set up correctly (for data, media). */
  startConnection(options) {
    const peerConnection = this._startPeerConnection();
    this.connection.peerConnection = peerConnection;
    if (this.connection.type === $78455e22dea96b8c$export$3157d57b4135e3bc.Media && options._stream) this._addTracksToConnection(options._stream, peerConnection);
    if (options.originator) {
      const dataConnection = this.connection;
      const config = {
        ordered: !!options.reliable
      };
      const dataChannel = peerConnection.createDataChannel(dataConnection.label, config);
      dataConnection._initializeDataChannel(dataChannel);
      this._makeOffer();
    } else this.handleSDP("OFFER", options.sdp);
  }
  /** Start a PC. */
  _startPeerConnection() {
    $257947e92926277a$export$2e2bcd8739ae039.log("Creating RTCPeerConnection.");
    const peerConnection = new RTCPeerConnection(this.connection.provider.options.config);
    this._setupListeners(peerConnection);
    return peerConnection;
  }
  /** Set up various WebRTC listeners. */
  _setupListeners(peerConnection) {
    const peerId = this.connection.peer;
    const connectionId = this.connection.connectionId;
    const connectionType = this.connection.type;
    const provider = this.connection.provider;
    $257947e92926277a$export$2e2bcd8739ae039.log("Listening for ICE candidates.");
    peerConnection.onicecandidate = (evt) => {
      if (!evt.candidate || !evt.candidate.candidate) return;
      $257947e92926277a$export$2e2bcd8739ae039.log(`Received ICE candidates for ${peerId}:`, evt.candidate);
      provider.socket.send({
        type: $78455e22dea96b8c$export$adb4a1754da6f10d.Candidate,
        payload: {
          candidate: evt.candidate,
          type: connectionType,
          connectionId
        },
        dst: peerId
      });
    };
    peerConnection.oniceconnectionstatechange = () => {
      switch (peerConnection.iceConnectionState) {
        case "failed":
          $257947e92926277a$export$2e2bcd8739ae039.log("iceConnectionState is failed, closing connections to " + peerId);
          this.connection.emitError($78455e22dea96b8c$export$7974935686149686.NegotiationFailed, "Negotiation of connection to " + peerId + " failed.");
          this.connection.close();
          break;
        case "closed":
          $257947e92926277a$export$2e2bcd8739ae039.log("iceConnectionState is closed, closing connections to " + peerId);
          this.connection.emitError($78455e22dea96b8c$export$7974935686149686.ConnectionClosed, "Connection to " + peerId + " closed.");
          this.connection.close();
          break;
        case "disconnected":
          $257947e92926277a$export$2e2bcd8739ae039.log("iceConnectionState changed to disconnected on the connection with " + peerId);
          break;
        case "completed":
          peerConnection.onicecandidate = () => {
          };
          break;
      }
      this.connection.emit("iceStateChanged", peerConnection.iceConnectionState);
    };
    $257947e92926277a$export$2e2bcd8739ae039.log("Listening for data channel");
    peerConnection.ondatachannel = (evt) => {
      $257947e92926277a$export$2e2bcd8739ae039.log("Received data channel");
      const dataChannel = evt.channel;
      const connection = provider.getConnection(peerId, connectionId);
      connection._initializeDataChannel(dataChannel);
    };
    $257947e92926277a$export$2e2bcd8739ae039.log("Listening for remote stream");
    peerConnection.ontrack = (evt) => {
      $257947e92926277a$export$2e2bcd8739ae039.log("Received remote stream");
      const stream = evt.streams[0];
      const connection = provider.getConnection(peerId, connectionId);
      if (connection.type === $78455e22dea96b8c$export$3157d57b4135e3bc.Media) {
        const mediaConnection = connection;
        this._addStreamToMediaConnection(stream, mediaConnection);
      }
    };
  }
  cleanup() {
    $257947e92926277a$export$2e2bcd8739ae039.log("Cleaning up PeerConnection to " + this.connection.peer);
    const peerConnection = this.connection.peerConnection;
    if (!peerConnection) return;
    this.connection.peerConnection = null;
    peerConnection.onicecandidate = peerConnection.oniceconnectionstatechange = peerConnection.ondatachannel = peerConnection.ontrack = () => {
    };
    const peerConnectionNotClosed = peerConnection.signalingState !== "closed";
    let dataChannelNotClosed = false;
    const dataChannel = this.connection.dataChannel;
    if (dataChannel) dataChannelNotClosed = !!dataChannel.readyState && dataChannel.readyState !== "closed";
    if (peerConnectionNotClosed || dataChannelNotClosed) peerConnection.close();
  }
  async _makeOffer() {
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    try {
      const offer = await peerConnection.createOffer(this.connection.options.constraints);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Created offer.");
      if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function") offer.sdp = this.connection.options.sdpTransform(offer.sdp) || offer.sdp;
      try {
        await peerConnection.setLocalDescription(offer);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Set localDescription:", offer, `for:${this.connection.peer}`);
        let payload = {
          sdp: offer,
          type: this.connection.type,
          connectionId: this.connection.connectionId,
          metadata: this.connection.metadata
        };
        if (this.connection.type === (0, $78455e22dea96b8c$export$3157d57b4135e3bc).Data) {
          const dataConnection = this.connection;
          payload = {
            ...payload,
            label: dataConnection.label,
            reliable: dataConnection.reliable,
            serialization: dataConnection.serialization
          };
        }
        provider.socket.send({
          type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Offer,
          payload,
          dst: this.connection.peer
        });
      } catch (err) {
        if (err != "OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer") {
          provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
          (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
        }
      }
    } catch (err_1) {
      provider.emitError($78455e22dea96b8c$export$9547aaa2e39030ff.WebRTC, err_1);
      $257947e92926277a$export$2e2bcd8739ae039.log("Failed to createOffer, ", err_1);
    }
  }
  async _makeAnswer() {
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    try {
      const answer = await peerConnection.createAnswer();
      (0, $257947e92926277a$export$2e2bcd8739ae039).log("Created answer.");
      if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function") answer.sdp = this.connection.options.sdpTransform(answer.sdp) || answer.sdp;
      try {
        await peerConnection.setLocalDescription(answer);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Set localDescription:`, answer, `for:${this.connection.peer}`);
        provider.socket.send({
          type: (0, $78455e22dea96b8c$export$adb4a1754da6f10d).Answer,
          payload: {
            sdp: answer,
            type: this.connection.type,
            connectionId: this.connection.connectionId
          },
          dst: this.connection.peer
        });
      } catch (err) {
        provider.emitError((0, $78455e22dea96b8c$export$9547aaa2e39030ff).WebRTC, err);
        (0, $257947e92926277a$export$2e2bcd8739ae039).log("Failed to setLocalDescription, ", err);
      }
    } catch (err_1) {
      provider.emitError($78455e22dea96b8c$export$9547aaa2e39030ff.WebRTC, err_1);
      $257947e92926277a$export$2e2bcd8739ae039.log("Failed to create answer, ", err_1);
    }
  }
  /** Handle an SDP. */
  async handleSDP(type, sdp2) {
    sdp2 = new RTCSessionDescription(sdp2);
    const peerConnection = this.connection.peerConnection;
    const provider = this.connection.provider;
    $257947e92926277a$export$2e2bcd8739ae039.log("Setting remote description", sdp2);
    const self = this;
    try {
      await peerConnection.setRemoteDescription(sdp2);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Set remoteDescription:${type} for:${this.connection.peer}`);
      if (type === "OFFER") await self._makeAnswer();
    } catch (err) {
      provider.emitError($78455e22dea96b8c$export$9547aaa2e39030ff.WebRTC, err);
      $257947e92926277a$export$2e2bcd8739ae039.log("Failed to setRemoteDescription, ", err);
    }
  }
  /** Handle a candidate. */
  async handleCandidate(ice) {
    $257947e92926277a$export$2e2bcd8739ae039.log(`handleCandidate:`, ice);
    try {
      await this.connection.peerConnection.addIceCandidate(ice);
      (0, $257947e92926277a$export$2e2bcd8739ae039).log(`Added ICE candidate for:${this.connection.peer}`);
    } catch (err) {
      this.connection.provider.emitError($78455e22dea96b8c$export$9547aaa2e39030ff.WebRTC, err);
      $257947e92926277a$export$2e2bcd8739ae039.log("Failed to handleCandidate, ", err);
    }
  }
  _addTracksToConnection(stream, peerConnection) {
    $257947e92926277a$export$2e2bcd8739ae039.log(`add tracks from stream ${stream.id} to peer connection`);
    if (!peerConnection.addTrack) return $257947e92926277a$export$2e2bcd8739ae039.error(`Your browser does't support RTCPeerConnection#addTrack. Ignored.`);
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  }
  _addStreamToMediaConnection(stream, mediaConnection) {
    $257947e92926277a$export$2e2bcd8739ae039.log(`add stream ${stream.id} to media connection ${mediaConnection.connectionId}`);
    mediaConnection.addStream(stream);
  }
}
class $23779d1881157a18$export$6a678e589c8a4542 extends $c4dcfd1d1ea86647$exports.EventEmitter {
  /**
  * Emits a typed error message.
  *
  * @internal
  */
  emitError(type, err) {
    $257947e92926277a$export$2e2bcd8739ae039.error("Error:", err);
    this.emit("error", new $23779d1881157a18$export$98871882f492de82(`${type}`, err));
  }
}
class $23779d1881157a18$export$98871882f492de82 extends Error {
  /**
  * @internal
  */
  constructor(type, err) {
    if (typeof err === "string") super(err);
    else {
      super();
      Object.assign(this, err);
    }
    this.type = type;
  }
}
class $5045192fc6d387ba$export$23a2a68283c24d80 extends $23779d1881157a18$export$6a678e589c8a4542 {
  /**
  * Whether the media connection is active (e.g. your call has been answered).
  * You can check this if you want to set a maximum wait time for a one-sided call.
  */
  get open() {
    return this._open;
  }
  constructor(peer, provider, options) {
    super();
    this.peer = peer;
    this.provider = provider;
    this.options = options;
    this._open = false;
    this.metadata = options.metadata;
  }
}
const _$5c1d08c7c57da9a3$export$4a84e95a2324ac29 = class _$5c1d08c7c57da9a3$export$4a84e95a2324ac29 extends $5045192fc6d387ba$export$23a2a68283c24d80 {
  /**
  * For media connections, this is always 'media'.
  */
  get type() {
    return $78455e22dea96b8c$export$3157d57b4135e3bc.Media;
  }
  get localStream() {
    return this._localStream;
  }
  get remoteStream() {
    return this._remoteStream;
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this._localStream = this.options._stream;
    this.connectionId = this.options.connectionId || _$5c1d08c7c57da9a3$export$4a84e95a2324ac29.ID_PREFIX + $4f4134156c446392$export$7debb50ef11d5e0b.randomToken();
    this._negotiator = new $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a(this);
    if (this._localStream) this._negotiator.startConnection({
      _stream: this._localStream,
      originator: true
    });
  }
  /** Called by the Negotiator when the DataChannel is ready. */
  _initializeDataChannel(dc) {
    this.dataChannel = dc;
    this.dataChannel.onopen = () => {
      $257947e92926277a$export$2e2bcd8739ae039.log(`DC#${this.connectionId} dc connection success`);
      this.emit("willCloseOnRemote");
    };
    this.dataChannel.onclose = () => {
      $257947e92926277a$export$2e2bcd8739ae039.log(`DC#${this.connectionId} dc closed for:`, this.peer);
      this.close();
    };
  }
  addStream(remoteStream2) {
    $257947e92926277a$export$2e2bcd8739ae039.log("Receiving stream", remoteStream2);
    this._remoteStream = remoteStream2;
    super.emit("stream", remoteStream2);
  }
  /**
  * @internal
  */
  handleMessage(message) {
    const type = message.type;
    const payload = message.payload;
    switch (message.type) {
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Answer:
        this._negotiator.handleSDP(type, payload.sdp);
        this._open = true;
        break;
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Candidate:
        this._negotiator.handleCandidate(payload.candidate);
        break;
      default:
        $257947e92926277a$export$2e2bcd8739ae039.warn(`Unrecognized message type:${type} from peer:${this.peer}`);
        break;
    }
  }
  /**
       * When receiving a {@apilink PeerEvents | `call`} event on a peer, you can call
       * `answer` on the media connection provided by the callback to accept the call
       * and optionally send your own media stream.
  
       *
       * @param stream A WebRTC media stream.
       * @param options
       * @returns
       */
  answer(stream, options = {}) {
    if (this._localStream) {
      $257947e92926277a$export$2e2bcd8739ae039.warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
      return;
    }
    this._localStream = stream;
    if (options && options.sdpTransform) this.options.sdpTransform = options.sdpTransform;
    this._negotiator.startConnection({
      ...this.options._payload,
      _stream: stream
    });
    const messages = this.provider._getMessages(this.connectionId);
    for (const message of messages) this.handleMessage(message);
    this._open = true;
  }
  /**
  * Exposed functionality for users.
  */
  /**
  * Closes the media connection.
  */
  close() {
    if (this._negotiator) {
      this._negotiator.cleanup();
      this._negotiator = null;
    }
    this._localStream = null;
    this._remoteStream = null;
    if (this.provider) {
      this.provider._removeConnection(this);
      this.provider = null;
    }
    if (this.options && this.options._stream) this.options._stream = null;
    if (!this.open) return;
    this._open = false;
    super.emit("close");
  }
};
__ = new WeakMap();
__privateAdd(_$5c1d08c7c57da9a3$export$4a84e95a2324ac29, __, _$5c1d08c7c57da9a3$export$4a84e95a2324ac29.ID_PREFIX = "mc_");
let $5c1d08c7c57da9a3$export$4a84e95a2324ac29 = _$5c1d08c7c57da9a3$export$4a84e95a2324ac29;
class $abf266641927cd89$export$2c4e825dc9120f87 {
  constructor(_options) {
    this._options = _options;
  }
  _buildRequest(method) {
    const protocol = this._options.secure ? "https" : "http";
    const { host, port, path, key: key2 } = this._options;
    const url = new URL(`${protocol}://${host}:${port}${path}${key2}/${method}`);
    url.searchParams.set("ts", `${Date.now()}${Math.random()}`);
    url.searchParams.set("version", $f5f881ec4575f1fc$exports.version);
    return fetch(url.href, {
      referrerPolicy: this._options.referrerPolicy
    });
  }
  /** Get a unique ID from the server via XHR and initialize with it. */
  async retrieveId() {
    try {
      const response = await this._buildRequest("id");
      if (response.status !== 200) throw new Error(`Error. Status:${response.status}`);
      return response.text();
    } catch (error) {
      $257947e92926277a$export$2e2bcd8739ae039.error("Error retrieving ID", error);
      let pathError = "";
      if (this._options.path === "/" && this._options.host !== $4f4134156c446392$export$7debb50ef11d5e0b.CLOUD_HOST) pathError = " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer.";
      throw new Error("Could not get an ID from the server." + pathError);
    }
  }
  /** @deprecated */
  async listAllPeers() {
    try {
      const response = await this._buildRequest("peers");
      if (response.status !== 200) {
        if (response.status === 401) {
          let helpfulError = "";
          if (this._options.host === (0, $4f4134156c446392$export$7debb50ef11d5e0b).CLOUD_HOST) helpfulError = "It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.";
          else helpfulError = "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.";
          throw new Error("It doesn't look like you have permission to list peers IDs. " + helpfulError);
        }
        throw new Error(`Error. Status:${response.status}`);
      }
      return response.json();
    } catch (error) {
      $257947e92926277a$export$2e2bcd8739ae039.error("Error retrieving list peers", error);
      throw new Error("Could not get list peers from the server." + error);
    }
  }
}
const _$6366c4ca161bc297$export$d365f7ad9d7df9c9 = class _$6366c4ca161bc297$export$d365f7ad9d7df9c9 extends $5045192fc6d387ba$export$23a2a68283c24d80 {
  get type() {
    return $78455e22dea96b8c$export$3157d57b4135e3bc.Data;
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this.connectionId = this.options.connectionId || _$6366c4ca161bc297$export$d365f7ad9d7df9c9.ID_PREFIX + $0e5fd1585784c252$export$4e61f672936bec77();
    this.label = this.options.label || this.connectionId;
    this.reliable = !!this.options.reliable;
    this._negotiator = new $b82fb8fc0514bfc1$export$89e6bb5ad64bf4a(this);
    this._negotiator.startConnection(this.options._payload || {
      originator: true,
      reliable: this.reliable
    });
  }
  /** Called by the Negotiator when the DataChannel is ready. */
  _initializeDataChannel(dc) {
    this.dataChannel = dc;
    this.dataChannel.onopen = () => {
      $257947e92926277a$export$2e2bcd8739ae039.log(`DC#${this.connectionId} dc connection success`);
      this._open = true;
      this.emit("open");
    };
    this.dataChannel.onmessage = (e) => {
      $257947e92926277a$export$2e2bcd8739ae039.log(`DC#${this.connectionId} dc onmessage:`, e.data);
    };
    this.dataChannel.onclose = () => {
      $257947e92926277a$export$2e2bcd8739ae039.log(`DC#${this.connectionId} dc closed for:`, this.peer);
      this.close();
    };
  }
  /**
  * Exposed functionality for users.
  */
  /** Allows user to close connection. */
  close(options) {
    if (options == null ? void 0 : options.flush) {
      this.send({
        __peerData: {
          type: "close"
        }
      });
      return;
    }
    if (this._negotiator) {
      this._negotiator.cleanup();
      this._negotiator = null;
    }
    if (this.provider) {
      this.provider._removeConnection(this);
      this.provider = null;
    }
    if (this.dataChannel) {
      this.dataChannel.onopen = null;
      this.dataChannel.onmessage = null;
      this.dataChannel.onclose = null;
      this.dataChannel = null;
    }
    if (!this.open) return;
    this._open = false;
    super.emit("close");
  }
  /** Allows user to send data. */
  send(data, chunked = false) {
    if (!this.open) {
      this.emitError($78455e22dea96b8c$export$49ae800c114df41d.NotOpenYet, "Connection is not open. You should listen for the `open` event before sending messages.");
      return;
    }
    return this._send(data, chunked);
  }
  async handleMessage(message) {
    const payload = message.payload;
    switch (message.type) {
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Answer:
        await this._negotiator.handleSDP(message.type, payload.sdp);
        break;
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Candidate:
        await this._negotiator.handleCandidate(payload.candidate);
        break;
      default:
        $257947e92926277a$export$2e2bcd8739ae039.warn("Unrecognized message type:", message.type, "from peer:", this.peer);
        break;
    }
  }
};
__2 = new WeakMap();
__22 = new WeakMap();
__privateAdd(_$6366c4ca161bc297$export$d365f7ad9d7df9c9, __2, _$6366c4ca161bc297$export$d365f7ad9d7df9c9.ID_PREFIX = "dc_");
__privateAdd(_$6366c4ca161bc297$export$d365f7ad9d7df9c9, __22, _$6366c4ca161bc297$export$d365f7ad9d7df9c9.MAX_BUFFERED_AMOUNT = 8388608);
let $6366c4ca161bc297$export$d365f7ad9d7df9c9 = _$6366c4ca161bc297$export$d365f7ad9d7df9c9;
class $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b extends $6366c4ca161bc297$export$d365f7ad9d7df9c9 {
  get bufferSize() {
    return this._bufferSize;
  }
  _initializeDataChannel(dc) {
    super._initializeDataChannel(dc);
    this.dataChannel.binaryType = "arraybuffer";
    this.dataChannel.addEventListener("message", (e) => this._handleDataMessage(e));
  }
  _bufferedSend(msg) {
    if (this._buffering || !this._trySend(msg)) {
      this._buffer.push(msg);
      this._bufferSize = this._buffer.length;
    }
  }
  // Returns true if the send succeeds.
  _trySend(msg) {
    if (!this.open) return false;
    if (this.dataChannel.bufferedAmount > $6366c4ca161bc297$export$d365f7ad9d7df9c9.MAX_BUFFERED_AMOUNT) {
      this._buffering = true;
      setTimeout(() => {
        this._buffering = false;
        this._tryBuffer();
      }, 50);
      return false;
    }
    try {
      this.dataChannel.send(msg);
    } catch (e) {
      $257947e92926277a$export$2e2bcd8739ae039.error(`DC#:${this.connectionId} Error when sending:`, e);
      this._buffering = true;
      this.close();
      return false;
    }
    return true;
  }
  // Try to send the first message in the buffer.
  _tryBuffer() {
    if (!this.open) return;
    if (this._buffer.length === 0) return;
    const msg = this._buffer[0];
    if (this._trySend(msg)) {
      this._buffer.shift();
      this._bufferSize = this._buffer.length;
      this._tryBuffer();
    }
  }
  close(options) {
    if (options == null ? void 0 : options.flush) {
      this.send({
        __peerData: {
          type: "close"
        }
      });
      return;
    }
    this._buffer = [];
    this._bufferSize = 0;
    super.close();
  }
  constructor(...args) {
    super(...args);
    this._buffer = [];
    this._bufferSize = 0;
    this._buffering = false;
  }
}
class $9fcfddb3ae148f88$export$f0a5a64d5bb37108 extends $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b {
  close(options) {
    super.close(options);
    this._chunkedData = {};
  }
  constructor(peerId, provider, options) {
    super(peerId, provider, options);
    this.chunker = new $fcbcc7538a6776d5$export$f1c5f4c9cb95390b();
    this.serialization = $78455e22dea96b8c$export$89f507cf986a947.Binary;
    this._chunkedData = {};
  }
  // Handles a DataChannel message.
  _handleDataMessage({ data }) {
    const deserializedData = $0cfd7828ad59115f$export$417857010dc9287f(data);
    const peerData = deserializedData["__peerData"];
    if (peerData) {
      if (peerData.type === "close") {
        this.close();
        return;
      }
      this._handleChunk(deserializedData);
      return;
    }
    this.emit("data", deserializedData);
  }
  _handleChunk(data) {
    const id = data.__peerData;
    const chunkInfo = this._chunkedData[id] || {
      data: [],
      count: 0,
      total: data.total
    };
    chunkInfo.data[data.n] = new Uint8Array(data.data);
    chunkInfo.count++;
    this._chunkedData[id] = chunkInfo;
    if (chunkInfo.total === chunkInfo.count) {
      delete this._chunkedData[id];
      const data2 = $fcbcc7538a6776d5$export$52c89ebcdc4f53f2(chunkInfo.data);
      this._handleDataMessage({
        data: data2
      });
    }
  }
  _send(data, chunked) {
    const blob = $0cfd7828ad59115f$export$2a703dbb0cb35339(data);
    if (blob instanceof Promise) return this._send_blob(blob);
    if (!chunked && blob.byteLength > this.chunker.chunkedMTU) {
      this._sendChunks(blob);
      return;
    }
    this._bufferedSend(blob);
  }
  async _send_blob(blobPromise) {
    const blob = await blobPromise;
    if (blob.byteLength > this.chunker.chunkedMTU) {
      this._sendChunks(blob);
      return;
    }
    this._bufferedSend(blob);
  }
  _sendChunks(blob) {
    const blobs = this.chunker.chunk(blob);
    $257947e92926277a$export$2e2bcd8739ae039.log(`DC#${this.connectionId} Try to send ${blobs.length} chunks...`);
    for (const blob2 of blobs) this.send(blob2, true);
  }
}
class $bbaee3f15f714663$export$6f88fe47d32c9c94 extends $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b {
  _handleDataMessage({ data }) {
    super.emit("data", data);
  }
  _send(data, _chunked) {
    this._bufferedSend(data);
  }
  constructor(...args) {
    super(...args);
    this.serialization = $78455e22dea96b8c$export$89f507cf986a947.None;
  }
}
class $817f931e3f9096cf$export$48880ac635f47186 extends $a229bedbcaa6ca23$export$ff7c9d4c11d94e8b {
  // Handles a DataChannel message.
  _handleDataMessage({ data }) {
    const deserializedData = this.parse(this.decoder.decode(data));
    const peerData = deserializedData["__peerData"];
    if (peerData && peerData.type === "close") {
      this.close();
      return;
    }
    this.emit("data", deserializedData);
  }
  _send(data, _chunked) {
    const encodedData = this.encoder.encode(this.stringify(data));
    if (encodedData.byteLength >= $4f4134156c446392$export$7debb50ef11d5e0b.chunkedMTU) {
      this.emitError($78455e22dea96b8c$export$49ae800c114df41d.MessageToBig, "Message too big for JSON channel");
      return;
    }
    this._bufferedSend(encodedData);
  }
  constructor(...args) {
    super(...args);
    this.serialization = $78455e22dea96b8c$export$89f507cf986a947.JSON;
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.stringify = JSON.stringify;
    this.parse = JSON.parse;
  }
}
const _$416260bce337df90$export$ecd1fc136c422448 = class _$416260bce337df90$export$ecd1fc136c422448 extends $23779d1881157a18$export$6a678e589c8a4542 {
  /**
  * The brokering ID of this peer
  *
  * If no ID was specified in {@apilink Peer | the constructor},
  * this will be `undefined` until the {@apilink PeerEvents | `open`} event is emitted.
  */
  get id() {
    return this._id;
  }
  get options() {
    return this._options;
  }
  get open() {
    return this._open;
  }
  /**
  * @internal
  */
  get socket() {
    return this._socket;
  }
  /**
  * A hash of all connections associated with this peer, keyed by the remote peer's ID.
  * @deprecated
  * Return type will change from Object to Map<string,[]>
  */
  get connections() {
    const plainConnections = /* @__PURE__ */ Object.create(null);
    for (const [k, v] of this._connections) plainConnections[k] = v;
    return plainConnections;
  }
  /**
  * true if this peer and all of its connections can no longer be used.
  */
  get destroyed() {
    return this._destroyed;
  }
  /**
  * false if there is an active connection to the PeerServer.
  */
  get disconnected() {
    return this._disconnected;
  }
  constructor(id, options) {
    super();
    this._serializers = {
      raw: $bbaee3f15f714663$export$6f88fe47d32c9c94,
      json: $817f931e3f9096cf$export$48880ac635f47186,
      binary: $9fcfddb3ae148f88$export$f0a5a64d5bb37108,
      "binary-utf8": $9fcfddb3ae148f88$export$f0a5a64d5bb37108,
      default: $9fcfddb3ae148f88$export$f0a5a64d5bb37108
    };
    this._id = null;
    this._lastServerId = null;
    this._destroyed = false;
    this._disconnected = false;
    this._open = false;
    this._connections = /* @__PURE__ */ new Map();
    this._lostMessages = /* @__PURE__ */ new Map();
    let userId;
    if (id && id.constructor == Object) options = id;
    else if (id) userId = id.toString();
    options = {
      debug: 0,
      host: $4f4134156c446392$export$7debb50ef11d5e0b.CLOUD_HOST,
      port: $4f4134156c446392$export$7debb50ef11d5e0b.CLOUD_PORT,
      path: "/",
      key: _$416260bce337df90$export$ecd1fc136c422448.DEFAULT_KEY,
      token: $4f4134156c446392$export$7debb50ef11d5e0b.randomToken(),
      config: $4f4134156c446392$export$7debb50ef11d5e0b.defaultConfig,
      referrerPolicy: "strict-origin-when-cross-origin",
      serializers: {},
      ...options
    };
    this._options = options;
    this._serializers = {
      ...this._serializers,
      ...this.options.serializers
    };
    if (this._options.host === "/") this._options.host = window.location.hostname;
    if (this._options.path) {
      if (this._options.path[0] !== "/") this._options.path = "/" + this._options.path;
      if (this._options.path[this._options.path.length - 1] !== "/") this._options.path += "/";
    }
    if (this._options.secure === void 0 && this._options.host !== $4f4134156c446392$export$7debb50ef11d5e0b.CLOUD_HOST) this._options.secure = $4f4134156c446392$export$7debb50ef11d5e0b.isSecure();
    else if (this._options.host == $4f4134156c446392$export$7debb50ef11d5e0b.CLOUD_HOST) this._options.secure = true;
    if (this._options.logFunction) $257947e92926277a$export$2e2bcd8739ae039.setLogFunction(this._options.logFunction);
    $257947e92926277a$export$2e2bcd8739ae039.logLevel = this._options.debug || 0;
    this._api = new $abf266641927cd89$export$2c4e825dc9120f87(options);
    this._socket = this._createServerConnection();
    if (!$4f4134156c446392$export$7debb50ef11d5e0b.supports.audioVideo && !$4f4134156c446392$export$7debb50ef11d5e0b.supports.data) {
      this._delayedAbort($78455e22dea96b8c$export$9547aaa2e39030ff.BrowserIncompatible, "The current browser does not support WebRTC");
      return;
    }
    if (!!userId && !$4f4134156c446392$export$7debb50ef11d5e0b.validateId(userId)) {
      this._delayedAbort($78455e22dea96b8c$export$9547aaa2e39030ff.InvalidID, `ID "${userId}" is invalid`);
      return;
    }
    if (userId) this._initialize(userId);
    else this._api.retrieveId().then((id2) => this._initialize(id2)).catch((error) => this._abort($78455e22dea96b8c$export$9547aaa2e39030ff.ServerError, error));
  }
  _createServerConnection() {
    const socket = new $8f5bfa60836d261d$export$4798917dbf149b79(this._options.secure, this._options.host, this._options.port, this._options.path, this._options.key, this._options.pingInterval);
    socket.on($78455e22dea96b8c$export$3b5c4a4b6354f023.Message, (data) => {
      this._handleMessage(data);
    });
    socket.on($78455e22dea96b8c$export$3b5c4a4b6354f023.Error, (error) => {
      this._abort($78455e22dea96b8c$export$9547aaa2e39030ff.SocketError, error);
    });
    socket.on($78455e22dea96b8c$export$3b5c4a4b6354f023.Disconnected, () => {
      if (this.disconnected) return;
      this.emitError($78455e22dea96b8c$export$9547aaa2e39030ff.Network, "Lost connection to server.");
      this.disconnect();
    });
    socket.on($78455e22dea96b8c$export$3b5c4a4b6354f023.Close, () => {
      if (this.disconnected) return;
      this._abort($78455e22dea96b8c$export$9547aaa2e39030ff.SocketClosed, "Underlying socket is already closed.");
    });
    return socket;
  }
  /** Initialize a connection with the server. */
  _initialize(id) {
    this._id = id;
    this.socket.start(id, this._options.token);
  }
  /** Handles messages from the server. */
  _handleMessage(message) {
    const type = message.type;
    const payload = message.payload;
    const peerId = message.src;
    switch (type) {
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Open:
        this._lastServerId = this.id;
        this._open = true;
        this.emit("open", this.id);
        break;
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Error:
        this._abort($78455e22dea96b8c$export$9547aaa2e39030ff.ServerError, payload.msg);
        break;
      case $78455e22dea96b8c$export$adb4a1754da6f10d.IdTaken:
        this._abort($78455e22dea96b8c$export$9547aaa2e39030ff.UnavailableID, `ID "${this.id}" is taken`);
        break;
      case $78455e22dea96b8c$export$adb4a1754da6f10d.InvalidKey:
        this._abort($78455e22dea96b8c$export$9547aaa2e39030ff.InvalidKey, `API KEY "${this._options.key}" is invalid`);
        break;
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Leave:
        $257947e92926277a$export$2e2bcd8739ae039.log(`Received leave message from ${peerId}`);
        this._cleanupPeer(peerId);
        this._connections.delete(peerId);
        break;
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Expire:
        this.emitError($78455e22dea96b8c$export$9547aaa2e39030ff.PeerUnavailable, `Could not connect to peer ${peerId}`);
        break;
      case $78455e22dea96b8c$export$adb4a1754da6f10d.Offer: {
        const connectionId = payload.connectionId;
        let connection = this.getConnection(peerId, connectionId);
        if (connection) {
          connection.close();
          $257947e92926277a$export$2e2bcd8739ae039.warn(`Offer received for existing Connection ID:${connectionId}`);
        }
        if (payload.type === $78455e22dea96b8c$export$3157d57b4135e3bc.Media) {
          const mediaConnection = new $5c1d08c7c57da9a3$export$4a84e95a2324ac29(peerId, this, {
            connectionId,
            _payload: payload,
            metadata: payload.metadata
          });
          connection = mediaConnection;
          this._addConnection(peerId, connection);
          this.emit("call", mediaConnection);
        } else if (payload.type === $78455e22dea96b8c$export$3157d57b4135e3bc.Data) {
          const dataConnection = new this._serializers[payload.serialization](peerId, this, {
            connectionId,
            _payload: payload,
            metadata: payload.metadata,
            label: payload.label,
            serialization: payload.serialization,
            reliable: payload.reliable
          });
          connection = dataConnection;
          this._addConnection(peerId, connection);
          this.emit("connection", dataConnection);
        } else {
          $257947e92926277a$export$2e2bcd8739ae039.warn(`Received malformed connection type:${payload.type}`);
          return;
        }
        const messages = this._getMessages(connectionId);
        for (const message2 of messages) connection.handleMessage(message2);
        break;
      }
      default: {
        if (!payload) {
          $257947e92926277a$export$2e2bcd8739ae039.warn(`You received a malformed message from ${peerId} of type ${type}`);
          return;
        }
        const connectionId = payload.connectionId;
        const connection = this.getConnection(peerId, connectionId);
        if (connection && connection.peerConnection)
          connection.handleMessage(message);
        else if (connectionId)
          this._storeMessage(connectionId, message);
        else $257947e92926277a$export$2e2bcd8739ae039.warn("You received an unrecognized message:", message);
        break;
      }
    }
  }
  /** Stores messages without a set up connection, to be claimed later. */
  _storeMessage(connectionId, message) {
    if (!this._lostMessages.has(connectionId)) this._lostMessages.set(connectionId, []);
    this._lostMessages.get(connectionId).push(message);
  }
  /**
  * Retrieve messages from lost message store
  * @internal
  */
  //TODO Change it to private
  _getMessages(connectionId) {
    const messages = this._lostMessages.get(connectionId);
    if (messages) {
      this._lostMessages.delete(connectionId);
      return messages;
    }
    return [];
  }
  /**
  * Connects to the remote peer specified by id and returns a data connection.
  * @param peer The brokering ID of the remote peer (their {@apilink Peer.id}).
  * @param options for specifying details about Peer Connection
  */
  connect(peer, options = {}) {
    options = {
      serialization: "default",
      ...options
    };
    if (this.disconnected) {
      $257947e92926277a$export$2e2bcd8739ae039.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available.");
      this.emitError($78455e22dea96b8c$export$9547aaa2e39030ff.Disconnected, "Cannot connect to new Peer after disconnecting from server.");
      return;
    }
    const dataConnection = new this._serializers[options.serialization](peer, this, options);
    this._addConnection(peer, dataConnection);
    return dataConnection;
  }
  /**
  * Calls the remote peer specified by id and returns a media connection.
  * @param peer The brokering ID of the remote peer (their peer.id).
  * @param stream The caller's media stream
  * @param options Metadata associated with the connection, passed in by whoever initiated the connection.
  */
  call(peer, stream, options = {}) {
    if (this.disconnected) {
      $257947e92926277a$export$2e2bcd8739ae039.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect.");
      this.emitError($78455e22dea96b8c$export$9547aaa2e39030ff.Disconnected, "Cannot connect to new Peer after disconnecting from server.");
      return;
    }
    if (!stream) {
      $257947e92926277a$export$2e2bcd8739ae039.error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
      return;
    }
    const mediaConnection = new $5c1d08c7c57da9a3$export$4a84e95a2324ac29(peer, this, {
      ...options,
      _stream: stream
    });
    this._addConnection(peer, mediaConnection);
    return mediaConnection;
  }
  /** Add a data/media connection to this peer. */
  _addConnection(peerId, connection) {
    $257947e92926277a$export$2e2bcd8739ae039.log(`add connection ${connection.type}:${connection.connectionId} to peerId:${peerId}`);
    if (!this._connections.has(peerId)) this._connections.set(peerId, []);
    this._connections.get(peerId).push(connection);
  }
  //TODO should be private
  _removeConnection(connection) {
    const connections = this._connections.get(connection.peer);
    if (connections) {
      const index2 = connections.indexOf(connection);
      if (index2 !== -1) connections.splice(index2, 1);
    }
    this._lostMessages.delete(connection.connectionId);
  }
  /** Retrieve a data/media connection for this peer. */
  getConnection(peerId, connectionId) {
    const connections = this._connections.get(peerId);
    if (!connections) return null;
    for (const connection of connections) {
      if (connection.connectionId === connectionId) return connection;
    }
    return null;
  }
  _delayedAbort(type, message) {
    setTimeout(() => {
      this._abort(type, message);
    }, 0);
  }
  /**
  * Emits an error message and destroys the Peer.
  * The Peer is not destroyed if it's in a disconnected state, in which case
  * it retains its disconnected state and its existing connections.
  */
  _abort(type, message) {
    $257947e92926277a$export$2e2bcd8739ae039.error("Aborting!");
    this.emitError(type, message);
    if (!this._lastServerId) this.destroy();
    else this.disconnect();
  }
  /**
  * Destroys the Peer: closes all active connections as well as the connection
  * to the server.
  *
  * :::caution
  * This cannot be undone; the respective peer object will no longer be able
  * to create or receive any connections, its ID will be forfeited on the server,
  * and all of its data and media connections will be closed.
  * :::
  */
  destroy() {
    if (this.destroyed) return;
    $257947e92926277a$export$2e2bcd8739ae039.log(`Destroy peer with ID:${this.id}`);
    this.disconnect();
    this._cleanup();
    this._destroyed = true;
    this.emit("close");
  }
  /** Disconnects every connection on this peer. */
  _cleanup() {
    for (const peerId of this._connections.keys()) {
      this._cleanupPeer(peerId);
      this._connections.delete(peerId);
    }
    this.socket.removeAllListeners();
  }
  /** Closes all connections to this peer. */
  _cleanupPeer(peerId) {
    const connections = this._connections.get(peerId);
    if (!connections) return;
    for (const connection of connections) connection.close();
  }
  /**
  * Disconnects the Peer's connection to the PeerServer. Does not close any
  *  active connections.
  * Warning: The peer can no longer create or accept connections after being
  *  disconnected. It also cannot reconnect to the server.
  */
  disconnect() {
    if (this.disconnected) return;
    const currentId = this.id;
    $257947e92926277a$export$2e2bcd8739ae039.log(`Disconnect peer with ID:${currentId}`);
    this._disconnected = true;
    this._open = false;
    this.socket.close();
    this._lastServerId = currentId;
    this._id = null;
    this.emit("disconnected", currentId);
  }
  /** Attempts to reconnect with the same ID.
  *
  * Only {@apilink Peer.disconnect | disconnected peers} can be reconnected.
  * Destroyed peers cannot be reconnected.
  * If the connection fails (as an example, if the peer's old ID is now taken),
  * the peer's existing connections will not close, but any associated errors events will fire.
  */
  reconnect() {
    if (this.disconnected && !this.destroyed) {
      $257947e92926277a$export$2e2bcd8739ae039.log(`Attempting reconnection to server with ID ${this._lastServerId}`);
      this._disconnected = false;
      this._initialize(this._lastServerId);
    } else if (this.destroyed) throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");
    else if (!this.disconnected && !this.open)
      $257947e92926277a$export$2e2bcd8739ae039.error("In a hurry? We're still trying to make the initial connection!");
    else throw new Error(`Peer ${this.id} cannot reconnect because it is not disconnected from the server!`);
  }
  /**
  * Get a list of available peer IDs. If you're running your own server, you'll
  * want to set allow_discovery: true in the PeerServer options. If you're using
  * the cloud server, email team@peerjs.com to get the functionality enabled for
  * your key.
  */
  listAllPeers(cb = (_) => {
  }) {
    this._api.listAllPeers().then((peers) => cb(peers)).catch((error) => this._abort($78455e22dea96b8c$export$9547aaa2e39030ff.ServerError, error));
  }
};
__3 = new WeakMap();
__privateAdd(_$416260bce337df90$export$ecd1fc136c422448, __3, _$416260bce337df90$export$ecd1fc136c422448.DEFAULT_KEY = "peerjs");
let $416260bce337df90$export$ecd1fc136c422448 = _$416260bce337df90$export$ecd1fc136c422448;
const PEER_STALE_THRESHOLD_MS = 6e4;
const LEADER_MAINTENANCE_INTERVAL_MS = 3e4;
const LEADER_HEALTH_CHECK_INTERVAL_MS = 1e4;
const LEADERSHIP_RECONNECT_DELAY_MS = 1e3;
function generatePeerId(repoFullName, username, sessionId) {
  const base = `${repoFullName.replace("/", "-")}-${username}-${sessionId}`;
  return base.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
}
function getOrgId(repoFullName) {
  return repoFullName.split("/")[0];
}
function buildLeaderId(orgId) {
  return `skygit_discovery_${orgId}`;
}
function createDiscoveryConnectionMetadata(username) {
  return {
    username,
    type: "discovery"
  };
}
function createDiscoveryBootstrap(auth, repoFullName) {
  var _a2;
  if (!((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) return null;
  const orgId = getOrgId(repoFullName);
  return {
    orgId,
    leaderId: buildLeaderId(orgId)
  };
}
function buildPeerRegistryList(peerRegistry) {
  return Array.from(peerRegistry.entries()).map(([peerId, info]) => ({
    peerId,
    username: info.username,
    conversations: info.conversations,
    isLeader: info.isLeader || false,
    lastSeen: info.lastSeen
  }));
}
function buildFilteredPeerList(peerRegistry, conversationFilter) {
  return Array.from(peerRegistry.entries()).filter(([, info]) => {
    if (conversationFilter) {
      return info.conversations.some((conversation) => conversation === conversationFilter);
    }
    return true;
  }).map(([peerId, info]) => ({
    peerId,
    username: info.username,
    conversations: info.conversations,
    isLeader: info.isLeader || false
  }));
}
function toStoredOrgPeers(peers) {
  return peers.map((peer) => ({
    peerId: peer.peerId,
    username: peer.username.toLowerCase(),
    conversations: peer.conversations,
    isLeader: peer.isLeader,
    lastSeen: peer.lastSeen,
    online: true
  }));
}
function persistOrgPeerRegistry(storage, orgId, peers) {
  const orgPeers = toStoredOrgPeers(peers);
  storage.setItem(`skygit_peers_${orgId}`, JSON.stringify(orgPeers));
  return orgPeers;
}
function getStoredPeerContactUpdateEntries(orgPeers) {
  return orgPeers.map((peer) => [
    peer.username,
    createStoredPeerContactUpdate(peer)
  ]);
}
function persistOrgPeerRegistryContacts(storage, orgId, peers, updateContact2) {
  const orgPeers = persistOrgPeerRegistry(storage, orgId, peers);
  getStoredPeerContactUpdateEntries(orgPeers).forEach(([username, contactUpdate]) => {
    updateContact2(username, contactUpdate);
  });
  return orgPeers;
}
function createLeaderRegistryEntry(username, repoFullName, now2 = Date.now()) {
  return {
    username,
    conversations: [repoFullName],
    lastSeen: now2,
    connection: null,
    isLeader: true
  };
}
function createRegisteredPeerEntry(data, connection, now2 = Date.now()) {
  return {
    username: data.username,
    conversations: data.conversations || [],
    lastSeen: now2,
    connection,
    isLeader: false
  };
}
function registerPeerInRegistry(peerRegistry, peerId, message, connection, now2 = Date.now()) {
  const entry = createRegisteredPeerEntry(message, connection, now2);
  peerRegistry.set(peerId, entry);
  return entry;
}
function updatePeerRegistryConversations(peerRegistry, peerId, conversations2, now2 = Date.now()) {
  const peerInfo = peerRegistry.get(peerId);
  if (!peerInfo) return false;
  peerInfo.conversations = conversations2;
  peerInfo.lastSeen = now2;
  return true;
}
function touchPeerRegistryHeartbeat(peerRegistry, peerId, now2 = Date.now()) {
  const peerInfo = peerRegistry.get(peerId);
  if (!peerInfo) return false;
  peerInfo.lastSeen = now2;
  return true;
}
function removePeerFromRegistry(peerRegistry, peerId) {
  return peerRegistry.delete(peerId);
}
function removeDisconnectedPeerFromLeaderRegistry(peerRegistry, peerId, isCurrentLeader, broadcastPeerListUpdate, log2 = () => {
}) {
  if (!isCurrentLeader || !peerRegistry.has(peerId)) return false;
  log2("[Discovery] Removing disconnected peer from registry:", peerId);
  removePeerFromRegistry(peerRegistry, peerId);
  broadcastPeerListUpdate();
  return true;
}
function createPeerRegistryMessage(peers, orgId) {
  return {
    type: "peer_registry",
    peers,
    orgId
  };
}
function createPeerListMessage(peers) {
  return {
    type: "peer_list",
    peers
  };
}
function sendPeerRegistrySnapshot(connection, peerRegistry, orgId) {
  const peerList = buildPeerRegistryList(peerRegistry);
  connection.send(createPeerRegistryMessage(peerList, orgId));
  return peerList;
}
function sendFilteredPeerListSnapshot(connection, peerRegistry, conversationFilter) {
  const filteredPeers = buildFilteredPeerList(peerRegistry, conversationFilter);
  connection.send(createPeerListMessage(filteredPeers));
  return filteredPeers;
}
function createRegisterWithLeaderMessage(username, repoFullName, timestamp = Date.now()) {
  return {
    type: "register",
    username,
    conversations: [repoFullName],
    timestamp
  };
}
function sendRegisterWithLeader(connection, username, repoFullName) {
  const message = createRegisterWithLeaderMessage(username, repoFullName);
  connection.send(message);
  return message;
}
function createHeartbeatMessage(timestamp = Date.now()) {
  return {
    type: "heartbeat",
    timestamp
  };
}
function createLeadershipChangeMessage() {
  return {
    type: "leadership_change",
    message: "Leader stepping down, reconnect to discovery system"
  };
}
function createStoredPeerContactUpdate(peer) {
  return {
    peerId: peer.peerId,
    username: peer.username,
    conversations: peer.conversations,
    isLeader: peer.isLeader,
    lastSeen: peer.lastSeen,
    online: false
  };
}
function getPeerConnectionStatus(peer, localPeerId, connections, failedConnections) {
  if (peer.peerId === localPeerId) {
    return "self";
  }
  if (connections[peer.peerId]) {
    return "connected";
  }
  if (failedConnections.has(peer.peerId)) {
    return "failed";
  }
  return "available";
}
function groupPeersByConnectionStatus(peers, localPeerId, connections, failedConnections) {
  return peers.reduce((groups, peer) => {
    const status = getPeerConnectionStatus(peer, localPeerId, connections, failedConnections);
    groups[status].push(peer);
    return groups;
  }, {
    available: [],
    connected: [],
    failed: [],
    self: []
  });
}
function processDiscoveredPeerConnections({
  peers,
  localPeerId,
  connections,
  failedConnections,
  sourceLabel,
  connectToPeer,
  log: log2 = () => {
  },
  includeSelfLog = false
}) {
  const groupedPeers = groupPeersByConnectionStatus(peers, localPeerId, connections, failedConnections);
  groupedPeers.available.forEach((peer) => {
    log2(`[Discovery] Connecting to ${sourceLabel}:`, peer.peerId, "username:", peer.username);
    connectToPeer(peer.peerId, peer.username);
  });
  groupedPeers.connected.forEach((peer) => {
    log2("[Discovery] Already connected to peer:", peer.peerId);
  });
  groupedPeers.failed.forEach((peer) => {
    log2("[Discovery] Skipping failed peer:", peer.peerId);
  });
  if (includeSelfLog) {
    groupedPeers.self.forEach((peer) => {
      log2("[Discovery] Skipping self:", peer.peerId);
    });
  }
  return groupedPeers;
}
function bindConnectionEvents(connection, handlers = {}) {
  if (handlers.open) {
    connection.on("open", handlers.open);
  }
  if (handlers.data) {
    connection.on("data", handlers.data);
  }
  if (handlers.close) {
    connection.on("close", handlers.close);
  }
  if (handlers.error) {
    connection.on("error", handlers.error);
  }
  return connection;
}
function bindPeerDataConnection(connection, handlers = {}) {
  const peerId = handlers.peerId || connection.peer;
  const username = handlers.username;
  const connectionHandlers = {};
  if (handlers.open) {
    connectionHandlers.open = () => handlers.open(peerId, username);
  }
  if (handlers.data) {
    connectionHandlers.data = (data) => handlers.data(data, peerId, username);
  }
  if (handlers.close) {
    connectionHandlers.close = () => handlers.close(peerId, username);
  }
  if (handlers.error) {
    connectionHandlers.error = (error) => handlers.error(error, peerId, username);
  }
  return bindConnectionEvents(connection, connectionHandlers);
}
function bindLeaderConnectionEvents(connection, handlers = {}) {
  var _a2, _b2;
  (_a2 = handlers.log) == null ? void 0 : _a2.call(handlers, "[Discovery] Setting up connection to leader");
  bindConnectionEvents(connection, {
    data: handlers.data,
    close: () => {
      var _a3, _b3;
      (_a3 = handlers.log) == null ? void 0 : _a3.call(handlers, "[Discovery] Leader connection closed");
      (_b3 = handlers.disconnected) == null ? void 0 : _b3.call(handlers);
    },
    error: (error) => {
      var _a3, _b3;
      (_a3 = handlers.warn) == null ? void 0 : _a3.call(handlers, "[Discovery] Leader connection error:", error);
      (_b3 = handlers.disconnected) == null ? void 0 : _b3.call(handlers, error);
    }
  });
  (_b2 = handlers.register) == null ? void 0 : _b2.call(handlers, connection);
  return connection;
}
function bindPeerEvents(peer, handlers = {}) {
  Object.entries(handlers).forEach(([eventName, handler]) => {
    if (handler) {
      peer.on(eventName, handler);
    }
  });
  return peer;
}
function shouldRejectIncomingCall(callStatus2) {
  return callStatus2 !== "idle";
}
function isAnswerAlreadyInProgress(callStatus2) {
  return callStatus2 === "connected" || callStatus2 === "connecting";
}
function createCallMetadata(username) {
  return {
    metadata: {
      username,
      type: "call"
    }
  };
}
function applyIncomingCallState({ callStatus: callStatus2, remotePeerId: remotePeerId2 }, call) {
  callStatus2.set("incoming");
  remotePeerId2.set(call.peer);
}
function applyOutgoingCallState({ localStream: localStream2, callStatus: callStatus2, remotePeerId: remotePeerId2, isVideoEnabled: isVideoEnabled2 }, stream, peerId, video) {
  localStream2.set(stream);
  callStatus2.set("calling");
  remotePeerId2.set(peerId);
  isVideoEnabled2.set(video);
}
function applyAnsweredCallState({ localStream: localStream2 }, stream, call) {
  localStream2.set(stream);
  call.answer(stream);
}
function applyRemoteStreamState({ remoteStream: remoteStream2, callStatus: callStatus2, callStartTime: callStartTime2 }, stream, now2 = Date.now()) {
  remoteStream2.set(stream);
  callStatus2.set("connected");
  callStartTime2.set(now2);
}
function bindCallLifecycleEvents(call, handlers = {}) {
  Object.entries(handlers).forEach(([eventName, handler]) => {
    if (handler) {
      call.on(eventName, handler);
    }
  });
  return call;
}
function closeCallQuietly(call, onError = () => {
}) {
  if (!call) return;
  try {
    call.close();
  } catch (error) {
    onError(error);
  }
}
function closeCurrentCall(call) {
  if (!call) return null;
  call.off("close");
  call.off("error");
  call.close();
  return null;
}
function toggleFirstAudioTrack(stream) {
  var _a2;
  const audioTrack = (_a2 = stream == null ? void 0 : stream.getAudioTracks) == null ? void 0 : _a2.call(stream)[0];
  if (!audioTrack) return null;
  audioTrack.enabled = !audioTrack.enabled;
  return audioTrack.enabled;
}
function toggleFirstVideoTrack(stream) {
  var _a2;
  const videoTrack = (_a2 = stream == null ? void 0 : stream.getVideoTracks) == null ? void 0 : _a2.call(stream)[0];
  if (!videoTrack) return null;
  videoTrack.enabled = !videoTrack.enabled;
  return videoTrack.enabled;
}
function createScreenShareEndedHandler(toggleScreenShare2) {
  return () => {
    toggleScreenShare2();
  };
}
function createCallMediaConstraints(video = true) {
  return {
    video,
    audio: true
  };
}
function createCameraVideoConstraints() {
  return {
    video: true,
    audio: false
  };
}
function createScreenShareConstraints() {
  return {
    video: true,
    audio: false
  };
}
function stopStreamTracks(stream) {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
    track.enabled = false;
  });
}
function replaceStreamVideoTrack(stream, newVideoTrack) {
  var _a2;
  const oldVideoTrack = (_a2 = stream == null ? void 0 : stream.getVideoTracks) == null ? void 0 : _a2.call(stream)[0];
  if (oldVideoTrack) {
    oldVideoTrack.stop();
    stream.removeTrack(oldVideoTrack);
  }
  stream.addTrack(newVideoTrack);
}
async function replaceCallVideoSender(call, newVideoTrack) {
  var _a2, _b2;
  const senders = ((_b2 = (_a2 = call == null ? void 0 : call.peerConnection) == null ? void 0 : _a2.getSenders) == null ? void 0 : _b2.call(_a2)) || [];
  const videoSender = senders.find((sender) => {
    var _a3;
    return ((_a3 = sender.track) == null ? void 0 : _a3.kind) === "video";
  });
  if (videoSender) {
    await videoSender.replaceTrack(newVideoTrack);
    return true;
  }
  return false;
}
async function switchCallToCamera({ mediaDevices, currentStream, currentCall }) {
  const cameraStream = await mediaDevices.getUserMedia(createCameraVideoConstraints());
  const newVideoTrack = cameraStream.getVideoTracks()[0];
  replaceStreamVideoTrack(currentStream, newVideoTrack);
  await replaceCallVideoSender(currentCall, newVideoTrack);
  return newVideoTrack;
}
async function switchCallToScreenShare({ mediaDevices, currentStream, currentCall, onScreenShareEnded }) {
  const screenStream = await mediaDevices.getDisplayMedia(createScreenShareConstraints());
  const screenTrack = screenStream.getVideoTracks()[0];
  screenTrack.onended = onScreenShareEnded;
  replaceStreamVideoTrack(currentStream, screenTrack);
  await replaceCallVideoSender(currentCall, screenTrack);
  return screenTrack;
}
function bindIncomingCallHandling(localPeer, {
  getCallStatus,
  stores,
  getCurrentCall,
  setCurrentCall,
  endCall: endCall2,
  log: log2 = () => {
  },
  warn = () => {
  },
  reportError = () => {
  }
}) {
  if (!localPeer) return null;
  return bindPeerEvents(localPeer, {
    call: async (call) => {
      handleIncomingPeerCall({
        call,
        callStatus: getCallStatus(),
        stores,
        currentCall: getCurrentCall(),
        setCurrentCall,
        endCall: endCall2,
        log: log2,
        warn,
        reportError
      });
    }
  });
}
function handleIncomingPeerCall({
  call,
  callStatus: callStatus2,
  stores,
  currentCall,
  setCurrentCall,
  endCall: endCall2,
  log: log2 = () => {
  },
  warn = () => {
  },
  reportError = () => {
  }
}) {
  log2("[PeerJS] Incoming call from:", call.peer);
  if (shouldRejectIncomingCall(callStatus2)) {
    log2("[PeerJS] Already in a call, rejecting incoming call");
    call.close();
    return "rejected";
  }
  applyIncomingCallState(stores, call);
  if (currentCall) {
    warn("[PeerJS] Closing zombie call before accepting new one");
    closeCallQuietly(currentCall, (error) => warn("Failed to close zombie call:", error));
  }
  setCurrentCall(call);
  bindActiveCallEvents(call, {
    stores,
    endCall: endCall2,
    closeLog: "[PeerJS] Call closed remotely",
    log: log2,
    reportError
  });
  return "incoming";
}
async function startOutgoingPeerCall({
  localPeer,
  peerId,
  video = true,
  mediaDevices,
  localUsername,
  stores,
  setCurrentCall,
  setupCallEvents,
  alertUser = () => {
  },
  resetCallState: resetCallState2,
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  log2("[PeerJS] Starting call to:", peerId, "video:", video);
  try {
    const stream = await mediaDevices.getUserMedia(createCallMediaConstraints(video));
    applyOutgoingCallState(stores, stream, peerId, video);
    const call = localPeer.call(peerId, stream, createCallMetadata(localUsername));
    setCurrentCall(call);
    setupCallEvents(call);
    return call;
  } catch (error) {
    reportError("[PeerJS] Failed to get local stream:", error);
    alertUser("Could not access camera/microphone. Please check permissions.");
    resetCallState2();
    return null;
  }
}
async function answerIncomingPeerCall({
  currentCall,
  callStatus: callStatus2,
  mediaDevices,
  stores,
  setupCallEvents,
  endCall: endCall2,
  alertUser = () => {
  },
  log: log2 = () => {
  },
  warn = () => {
  },
  reportError = () => {
  }
}) {
  log2("[PeerJS] Answering call");
  if (!currentCall) return "missing";
  if (isAnswerAlreadyInProgress(callStatus2)) {
    warn("[PeerJS] Already connected or connecting, ignoring answerCall");
    return "already_answered";
  }
  try {
    const stream = await mediaDevices.getUserMedia(createCallMediaConstraints(true));
    applyAnsweredCallState(stores, stream, currentCall);
    setupCallEvents(currentCall);
    return "answered";
  } catch (error) {
    reportError("[PeerJS] Failed to get local stream for answer:", error);
    alertUser("Could not access camera/microphone. Please check permissions.");
    endCall2();
    return "failed";
  }
}
function bindActiveCallEvents(call, {
  stores,
  endCall: endCall2,
  closeLog = "[PeerJS] Call closed",
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  return bindCallLifecycleEvents(call, {
    stream: (stream) => {
      log2("[PeerJS] Received remote stream");
      applyRemoteStreamState(stores, stream);
    },
    close: () => {
      log2(closeLog);
      endCall2();
    },
    error: (error) => {
      reportError("[PeerJS] Call error:", error);
      endCall2();
    }
  });
}
function endPeerCall({
  currentCall,
  setCurrentCall,
  localStream: localStream2,
  remoteStream: remoteStream2,
  resetCallState: resetCallState2,
  log: log2 = () => {
  }
}) {
  log2("[PeerJS] Ending call");
  if (currentCall) {
    setCurrentCall(closeCurrentCall(currentCall));
  }
  stopStreamTracks(localStream2);
  stopStreamTracks(remoteStream2);
  resetCallState2();
}
function togglePeerAudio(stream, setAudioEnabled) {
  const enabled = toggleFirstAudioTrack(stream);
  if (enabled !== null) {
    setAudioEnabled(enabled);
  }
  return enabled;
}
function togglePeerVideo(stream, setVideoEnabled) {
  const enabled = toggleFirstVideoTrack(stream);
  if (enabled !== null) {
    setVideoEnabled(enabled);
  }
  return enabled;
}
async function togglePeerScreenShare({
  sharing,
  mediaDevices,
  currentStream,
  currentCall,
  setScreenSharing,
  toggleScreenShare: toggleScreenShare2,
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  if (sharing) {
    try {
      await switchCallToCamera({
        mediaDevices,
        currentStream,
        currentCall
      });
      setScreenSharing(false);
      log2("[PeerJS] Switched back to camera");
      return "camera";
    } catch (error) {
      reportError("[PeerJS] Failed to switch back to camera:", error);
      return "camera_failed";
    }
  }
  try {
    await switchCallToScreenShare({
      mediaDevices,
      currentStream,
      currentCall,
      onScreenShareEnded: createScreenShareEndedHandler(toggleScreenShare2)
    });
    setScreenSharing(true);
    log2("[PeerJS] Started screen sharing");
    return "screen";
  } catch (error) {
    reportError("[PeerJS] Failed to start screen sharing:", error);
    return "screen_failed";
  }
}
function createPeerCallController({
  getLocalPeer,
  getLocalUsername,
  getMediaDevices,
  getAlertUser,
  getStoreValue,
  stores,
  resetCallState: resetCallState2,
  bindIncomingCalls = bindIncomingCallHandling,
  startOutgoingCall = startOutgoingPeerCall,
  answerIncomingCall = answerIncomingPeerCall,
  bindActiveCall = bindActiveCallEvents,
  endCallSession = endPeerCall,
  toggleAudioTrack = togglePeerAudio,
  toggleVideoTrack = togglePeerVideo,
  toggleScreenShareTrack = togglePeerScreenShare,
  log: log2 = () => {
  },
  warn = () => {
  },
  reportError = () => {
  }
}) {
  let currentCall = null;
  const setCurrentCall = (call) => {
    currentCall = call;
  };
  const initializeCallHandling = () => bindIncomingCalls(getLocalPeer(), {
    getCallStatus: () => getStoreValue(stores.callStatus),
    stores: {
      callStatus: stores.callStatus,
      remotePeerId: stores.remotePeerId
    },
    getCurrentCall: () => currentCall,
    setCurrentCall,
    endCall: endCall2,
    log: log2,
    warn,
    reportError
  });
  const setupCallEvents = (call) => bindActiveCall(call, {
    stores: {
      remoteStream: stores.remoteStream,
      callStatus: stores.callStatus,
      callStartTime: stores.callStartTime
    },
    endCall: endCall2,
    log: log2,
    reportError
  });
  const startCall2 = (peerId, video = true) => startOutgoingCall({
    localPeer: getLocalPeer(),
    peerId,
    video,
    mediaDevices: getMediaDevices(),
    localUsername: getLocalUsername(),
    stores: {
      localStream: stores.localStream,
      callStatus: stores.callStatus,
      remotePeerId: stores.remotePeerId,
      isVideoEnabled: stores.isVideoEnabled
    },
    setCurrentCall,
    setupCallEvents,
    alertUser: getAlertUser(),
    resetCallState: resetCallState2,
    log: log2,
    reportError
  });
  const answerCall2 = () => answerIncomingCall({
    currentCall,
    callStatus: getStoreValue(stores.callStatus),
    mediaDevices: getMediaDevices(),
    stores: {
      localStream: stores.localStream
    },
    setupCallEvents,
    endCall: endCall2,
    alertUser: getAlertUser(),
    log: log2,
    warn,
    reportError
  });
  function endCall2() {
    return endCallSession({
      currentCall,
      setCurrentCall,
      localStream: getStoreValue(stores.localStream),
      remoteStream: getStoreValue(stores.remoteStream),
      resetCallState: resetCallState2,
      log: log2
    });
  }
  const toggleAudio2 = () => toggleAudioTrack(
    getStoreValue(stores.localStream),
    (enabled) => stores.isAudioEnabled.set(enabled)
  );
  const toggleVideo2 = () => toggleVideoTrack(
    getStoreValue(stores.localStream),
    (enabled) => stores.isVideoEnabled.set(enabled)
  );
  const toggleScreenShare2 = () => toggleScreenShareTrack({
    sharing: getStoreValue(stores.isScreenSharing),
    mediaDevices: getMediaDevices(),
    currentStream: getStoreValue(stores.localStream),
    currentCall,
    setScreenSharing: (sharing) => stores.isScreenSharing.set(sharing),
    toggleScreenShare: toggleScreenShare2,
    log: log2,
    reportError
  });
  return {
    initializeCallHandling,
    startCall: startCall2,
    answerCall: answerCall2,
    setupCallEvents,
    endCall: endCall2,
    toggleAudio: toggleAudio2,
    toggleVideo: toggleVideo2,
    toggleScreenShare: toggleScreenShare2,
    getCurrentCall: () => currentCall
  };
}
function buildOnlinePeerRows(connections, now2 = Date.now()) {
  return Object.entries(connections).map(([peerId, { username }]) => ({
    session_id: peerId,
    username,
    last_seen: now2
  }));
}
function canSendToConnection(peerConnection) {
  return Boolean(
    (peerConnection == null ? void 0 : peerConnection.conn) && peerConnection.status === "connected" && peerConnection.conn.open
  );
}
function isConversationParticipant(peerId, username, participants) {
  return participants.some((participant) => participant.peerId === peerId || participant.username === username);
}
function getConversationBroadcastTargets(connections, participants) {
  return Object.entries(connections).filter(([peerId, { username }]) => isConversationParticipant(peerId, username, participants)).map(([peerId, peerConnection]) => ({
    peerId,
    ...peerConnection
  }));
}
function getAllBroadcastTargets(connections) {
  return Object.entries(connections).map(([peerId, peerConnection]) => ({
    peerId,
    ...peerConnection
  }));
}
function sendToPeerConnection(connections, peerId, message) {
  const peerConnection = connections == null ? void 0 : connections[peerId];
  if (!(peerConnection == null ? void 0 : peerConnection.conn)) return false;
  peerConnection.conn.send(message);
  return true;
}
function getNonParticipantPeers(connections, participants) {
  return Object.entries(connections).filter(([peerId, { username }]) => !isConversationParticipant(peerId, username, participants)).map(([peerId, { username }]) => ({ peerId, username }));
}
function sendToBroadcastTargets(targets, message, onError = () => {
}) {
  let sentCount = 0;
  targets.forEach(({ peerId, conn, status }) => {
    if (!canSendToConnection({ conn, status })) return;
    try {
      conn.send(message);
      sentCount += 1;
    } catch (error) {
      onError(error, peerId);
    }
  });
  return sentCount;
}
function broadcastToConversationParticipants({
  connections,
  participants,
  message,
  conversationId,
  log: log2 = () => {
  },
  warn = () => {
  },
  error = () => {
  }
}) {
  log2("[PeerJS] Conversation participants:", participants);
  log2("[PeerJS] Available connections:", Object.keys(connections));
  if (participants.length === 0) {
    warn("[PeerJS] No participants found for conversation:", conversationId);
    return 0;
  }
  const participantTargets = getConversationBroadcastTargets(connections, participants);
  getNonParticipantPeers(connections, participants).forEach(({ peerId, username }) => {
    log2("[PeerJS] Skipping non-participant:", peerId, username);
  });
  participantTargets.forEach(({ peerId, conn, status }) => {
    log2("[PeerJS] Attempting to send to participant:", peerId, "status:", status, "connection open:", conn == null ? void 0 : conn.open);
    if (!canSendToConnection({ conn, status })) {
      warn("[PeerJS] ⚠️ Skipping participant (not connected):", peerId, "status:", status);
    }
  });
  const sentCount = sendToBroadcastTargets(participantTargets, message, (sendError, peerId) => {
    error("[PeerJS] ❌ Failed to send message to:", peerId, sendError);
  });
  log2("[PeerJS] Message broadcast completed. Sent to", sentCount, "participants");
  return sentCount;
}
function broadcastToAllConnections({
  connections,
  message,
  log: log2 = () => {
  },
  warn = () => {
  },
  error = () => {
  }
}) {
  const peerCount = Object.keys(connections).length;
  if (peerCount === 0) {
    warn("[PeerJS] No peer connections available for broadcasting!");
    return 0;
  }
  const sentCount = sendToBroadcastTargets(getAllBroadcastTargets(connections), message, (sendError, peerId) => {
    error("[PeerJS] ❌ Failed to send message to:", peerId, sendError);
  });
  log2("[PeerJS] Broadcast completed. Sent to", sentCount, "peers");
  return sentCount;
}
function createPeerConnectionMetadata(username, repoFullName, sessionId) {
  return {
    username,
    repo: repoFullName,
    sessionId
  };
}
function getConnectionUsername(connection, fallbackUsername = null) {
  var _a2;
  return fallbackUsername || ((_a2 = connection.metadata) == null ? void 0 : _a2.username) || "Unknown";
}
function createPeerConnectionEntry(connection, username) {
  return {
    conn: connection,
    status: "connected",
    username
  };
}
function createOnlineContactUpdate(peerId, now2 = Date.now()) {
  return {
    online: true,
    lastSeen: now2,
    peerId
  };
}
function createOfflineContactUpdate(now2 = Date.now()) {
  return {
    online: false,
    lastSeen: now2
  };
}
const OUTGOING_CONNECTION_RETRY_DELAY_MS = 6e4;
const REMOVED_CONNECTION_RETRY_DELAY_MS = 5e3;
function getLocalPeerConnectionReadiness(localPeer) {
  if (!localPeer) return "missing";
  if (!localPeer.open) return "closed";
  return "ready";
}
function hasPeerConnection(connections, peerId) {
  return Boolean(connections == null ? void 0 : connections[peerId]);
}
function addPeerConnectionToState(connections, peerId, entry) {
  connections[peerId] = entry;
  return connections;
}
function getPeerConnectionUsername(connections, peerId) {
  var _a2;
  return ((_a2 = connections == null ? void 0 : connections[peerId]) == null ? void 0 : _a2.username) || null;
}
function removePeerConnectionFromState(connections, peerId) {
  delete connections[peerId];
  return connections;
}
function removePeerTypingUser(typingUsers2, peerId) {
  delete typingUsers2[peerId];
  return typingUsers2;
}
function markPeerConnectionFailed(failedConnections, peerId, delayMs, setTimeoutFn = setTimeout) {
  failedConnections.add(peerId);
  return setTimeoutFn(() => {
    failedConnections.delete(peerId);
  }, delayMs);
}
function processOpenedPeerConnection({
  connection,
  username = null,
  updatePeerConnections,
  updateContact: updateContact2,
  updateOnlinePeers,
  syncConversationsWithPeer,
  log: log2 = () => {
  }
}) {
  const peerId = connection.peer;
  const extractedUsername = getConnectionUsername(connection, username);
  log2("[PeerJS] Adding peer connection:", peerId, "username:", extractedUsername);
  updatePeerConnections((connections) => addPeerConnectionToState(connections, peerId, createPeerConnectionEntry(connection, extractedUsername)));
  updateContact2(extractedUsername, createOnlineContactUpdate(peerId));
  updateOnlinePeers();
  syncConversationsWithPeer(peerId);
  return {
    peerId,
    username: extractedUsername
  };
}
function processClosedPeerConnection({
  peerId,
  connections,
  updatePeerConnections,
  updateTypingUsers,
  updateContact: updateContact2,
  updateOnlinePeers,
  peerRegistry,
  isCurrentLeader,
  broadcastPeerListUpdate,
  failedConnections,
  retryDelayMs = REMOVED_CONNECTION_RETRY_DELAY_MS,
  log: log2 = () => {
  }
}) {
  const username = getPeerConnectionUsername(connections, peerId);
  updatePeerConnections((currentConnections) => removePeerConnectionFromState(currentConnections, peerId));
  updateTypingUsers((users) => removePeerTypingUser(users, peerId));
  if (username) {
    updateContact2(username, createOfflineContactUpdate());
  }
  removeDisconnectedPeerFromLeaderRegistry(peerRegistry, peerId, isCurrentLeader, broadcastPeerListUpdate, log2);
  markPeerConnectionFailed(failedConnections, peerId, retryDelayMs);
  updateOnlinePeers();
  return username;
}
function getConversationSyncRequests(repoConversations) {
  return (repoConversations || []).filter((conversation) => {
    var _a2;
    return ((_a2 = conversation.messages) == null ? void 0 : _a2.length) > 0;
  }).map((conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return {
      conversationId: conversation.id,
      lastHash: lastMessage.hash
    };
  }).filter((request) => request.lastHash);
}
function sendConversationSyncRequests(peerId, conversationsMap, repoFullName, requestMessageSync, log2 = () => {
}) {
  const repoConversations = (conversationsMap == null ? void 0 : conversationsMap[repoFullName]) || [];
  const requests = getConversationSyncRequests(repoConversations);
  requests.forEach(({ conversationId, lastHash }) => {
    log2("[PeerJS] Requesting sync for conversation:", conversationId, "last hash:", lastHash);
    requestMessageSync(peerId, conversationId, lastHash);
  });
  return requests;
}
function getIncomingConnectionUsername(connection) {
  var _a2;
  return (((_a2 = connection.metadata) == null ? void 0 : _a2.username) || "Unknown").toLowerCase();
}
function bindIncomingPeerDataConnection(connection, {
  addPeerConnection,
  handlePeerMessage,
  removePeerConnection,
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  log2("[PeerJS] Setting up incoming connection from:", connection.peer);
  log2("[PeerJS] Connection metadata:", connection.metadata);
  return bindPeerDataConnection(connection, {
    username: getIncomingConnectionUsername(connection),
    open: (peerId, peerUsername) => {
      log2("[PeerJS] ✅ Incoming connection opened from:", peerId, "username:", peerUsername);
      addPeerConnection(connection, peerUsername);
    },
    data: (data, peerId, peerUsername) => {
      log2("[PeerJS] Received data from:", peerId, data);
      handlePeerMessage(data, peerId, peerUsername);
    },
    close: (peerId) => {
      log2("[PeerJS] Incoming connection closed from:", peerId);
      removePeerConnection(peerId);
    },
    error: (error, peerId) => {
      reportError("[PeerJS] ❌ Incoming connection error from:", peerId, error);
      removePeerConnection(peerId);
    }
  });
}
function bindOutgoingPeerDataConnection(connection, {
  peerId,
  username,
  addPeerConnection,
  handlePeerMessage,
  removePeerConnection,
  failedConnections,
  retryDelayMs = OUTGOING_CONNECTION_RETRY_DELAY_MS,
  failedConnectionScheduler = setTimeout,
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  return bindPeerDataConnection(connection, {
    peerId,
    username,
    open: (targetPeerId, peerUsername) => {
      log2("[PeerJS] ✅ Outgoing connection opened to:", targetPeerId);
      addPeerConnection(connection, peerUsername);
    },
    data: (data, targetPeerId, peerUsername) => {
      log2("[PeerJS] Received data from:", targetPeerId, data);
      handlePeerMessage(data, targetPeerId, peerUsername);
    },
    close: (targetPeerId) => {
      log2("[PeerJS] Outgoing connection closed to:", targetPeerId);
      removePeerConnection(targetPeerId);
    },
    error: (error, targetPeerId) => {
      reportError("[PeerJS] ❌ Outgoing connection error to:", targetPeerId, error);
      removePeerConnection(targetPeerId);
      markPeerConnectionFailed(failedConnections, targetPeerId, retryDelayMs, failedConnectionScheduler);
    }
  });
}
function connectToOutgoingPeer({
  localPeer,
  targetPeerId,
  username,
  connections,
  localUsername,
  repoFullName,
  sessionId,
  addPeerConnection,
  handlePeerMessage,
  removePeerConnection,
  failedConnections,
  failedConnectionScheduler,
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  log2("[PeerJS] Connecting to peer:", targetPeerId, "username:", username);
  log2("[PeerJS] Local peer ID:", localPeer == null ? void 0 : localPeer.id, "Local peer open:", localPeer == null ? void 0 : localPeer.open);
  const readiness = getLocalPeerConnectionReadiness(localPeer);
  if (readiness === "missing") {
    reportError("[PeerJS] Local peer not initialized");
    return void 0;
  }
  if (readiness === "closed") {
    reportError("[PeerJS] Local peer not connected to signaling server yet");
    return void 0;
  }
  if (hasPeerConnection(connections, targetPeerId)) {
    log2("[PeerJS] Already have connection to:", targetPeerId);
    return void 0;
  }
  log2("[PeerJS] Initiating connection to:", targetPeerId);
  const connection = localPeer.connect(targetPeerId, {
    metadata: createPeerConnectionMetadata(localUsername, repoFullName, sessionId)
  });
  log2("[PeerJS] Connection object created:", connection);
  bindOutgoingPeerDataConnection(connection, {
    peerId: targetPeerId,
    username,
    addPeerConnection,
    handlePeerMessage,
    removePeerConnection,
    failedConnections,
    failedConnectionScheduler,
    log: log2,
    reportError
  });
  return connection;
}
function createPeerConnectionController({
  getLocalPeer,
  getLocalUsername,
  getRepoFullName,
  getSessionId,
  getConnections,
  getConversations,
  getPeerRegistry,
  getCurrentDiscoveryLeader,
  getFailedConnections,
  updatePeerConnections,
  setOnlinePeers,
  updateTypingUsers,
  updateContact: updateContact2,
  requestMessageSync,
  handlePeerMessage,
  broadcastPeerListUpdate,
  bindIncomingConnection = bindIncomingPeerDataConnection,
  connectOutgoingPeer = connectToOutgoingPeer,
  processOpenedConnection = processOpenedPeerConnection,
  processClosedConnection = processClosedPeerConnection,
  buildOnlineRows = buildOnlinePeerRows,
  sendSyncRequests = sendConversationSyncRequests,
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  const updateOnlinePeers = () => {
    setOnlinePeers(buildOnlineRows(getConnections()));
  };
  const syncConversationsWithPeer = (peerId) => {
    log2("[PeerJS] Starting conversation sync with peer:", peerId);
    sendSyncRequests(peerId, getConversations(), getRepoFullName(), requestMessageSync, log2);
  };
  const addPeerConnection = (connection, username = null) => processOpenedConnection({
    connection,
    username,
    updatePeerConnections,
    updateContact: updateContact2,
    updateOnlinePeers,
    syncConversationsWithPeer,
    log: log2
  });
  const removePeerConnection = (peerId) => {
    log2("[PeerJS] Removing peer connection:", peerId);
    return processClosedConnection({
      peerId,
      connections: getConnections(),
      updatePeerConnections,
      updateTypingUsers,
      updateContact: updateContact2,
      updateOnlinePeers,
      peerRegistry: getPeerRegistry(),
      isCurrentLeader: getCurrentDiscoveryLeader(),
      broadcastPeerListUpdate,
      failedConnections: getFailedConnections(),
      log: log2
    });
  };
  const handleIncomingConnection = (connection) => bindIncomingConnection(connection, {
    addPeerConnection,
    handlePeerMessage,
    removePeerConnection,
    log: log2,
    reportError
  });
  const connectToPeer = (targetPeerId, username) => connectOutgoingPeer({
    localPeer: getLocalPeer(),
    targetPeerId,
    username,
    connections: getConnections(),
    localUsername: getLocalUsername(),
    repoFullName: getRepoFullName(),
    sessionId: getSessionId(),
    addPeerConnection,
    handlePeerMessage,
    removePeerConnection,
    failedConnections: getFailedConnections(),
    log: log2,
    reportError
  });
  return {
    updateOnlinePeers,
    syncConversationsWithPeer,
    addPeerConnection,
    removePeerConnection,
    handleIncomingConnection,
    connectToPeer
  };
}
function createUpdateConversationsMessage(conversations2) {
  return {
    type: "update_conversations",
    conversations: conversations2
  };
}
function createCommittedMessagesMessage(event2, timestamp = Date.now()) {
  return {
    type: "messages_committed",
    repoName: event2.repoName,
    conversationId: event2.convoId,
    messageIds: event2.messageIds,
    timestamp
  };
}
function isValidCommittedMessagesMessage(message) {
  return Boolean((message == null ? void 0 : message.repoName) && message.conversationId && message.messageIds);
}
function shouldBroadcastCommittedEvent(event2) {
  return Boolean(event2);
}
function broadcastCommittedEvent(event2, broadcastMessage2, createMessage = createCommittedMessagesMessage) {
  broadcastMessage2(createMessage(event2));
}
function applyCommittedMessagesNotification(message, markCommitted) {
  if (!isValidCommittedMessagesMessage(message)) return false;
  markCommitted(message.conversationId, message.repoName, message.messageIds);
  return true;
}
function subscribeCommittedMessageBroadcasts({
  committedEvents: committedEvents2,
  broadcastToAllPeers,
  log: log2 = () => {
  }
}) {
  return committedEvents2.subscribe((event2) => {
    if (!shouldBroadcastCommittedEvent(event2)) return false;
    log2("[PeerJS] Broadcasting committed messages:", event2);
    broadcastCommittedEvent(event2, broadcastToAllPeers, createCommittedMessagesMessage);
    return true;
  });
}
function processCommittedMessagesMessage({
  message,
  fromPeerId,
  markMessagesCommitted: markMessagesCommitted2,
  log: log2 = () => {
  }
}) {
  log2("[PeerJS] Received committed messages notification from:", fromPeerId, message);
  return applyCommittedMessagesNotification(message, markMessagesCommitted2);
}
const LEADER_COMMIT_INTERVAL_MS = 10 * 60 * 1e3;
function getCurrentLeaderId(localPeerId, connections) {
  return [localPeerId, ...Object.keys(connections || {})].filter(Boolean).sort()[0];
}
function isLocalPeerLeader(localPeerId, connections) {
  return getCurrentLeaderId(localPeerId, connections) === localPeerId;
}
function shouldRunLeaderCommitInterval(localPeerId, connections) {
  return isLocalPeerLeader(localPeerId, connections) && Object.keys(connections || {}).length > 0;
}
function startLeaderCommitTimer(flushCommitQueue, isStillLeader, setIntervalFn = setInterval) {
  return setIntervalFn(() => {
    if (isStillLeader()) {
      flushCommitQueue();
    }
  }, LEADER_COMMIT_INTERVAL_MS);
}
function stopLeaderCommitTimer(timer, clearIntervalFn = clearInterval) {
  if (timer) {
    clearIntervalFn(timer);
  }
  return null;
}
function refreshLeaderCommitInterval({
  localPeerId,
  connections,
  currentInterval,
  flushCommitQueue,
  isStillLeader,
  startTimer = startLeaderCommitTimer,
  stopTimer = stopLeaderCommitTimer,
  log: log2 = () => {
  }
}) {
  if (shouldRunLeaderCommitInterval(localPeerId, connections)) {
    if (!currentInterval) {
      log2("[PeerJS] Starting leader commit interval");
      return startTimer(flushCommitQueue, isStillLeader);
    }
    return currentInterval;
  }
  if (currentInterval) {
    log2("[PeerJS] Stopping leader commit interval - no peers or not leader");
    return stopTimer(currentInterval);
  }
  return currentInterval;
}
function applyLeaderConversationUpdate(peerRegistry, localPeerId, conversations2, now2 = Date.now()) {
  if (!peerRegistry.has(localPeerId)) return false;
  const localInfo = peerRegistry.get(localPeerId);
  localInfo.conversations = conversations2;
  localInfo.lastSeen = now2;
  return true;
}
function shouldNotifyLeaderOfConversations(leaderConnection) {
  return Boolean(leaderConnection == null ? void 0 : leaderConnection.open);
}
function notifyLeaderOfConversations(leaderConnection, conversations2, createMessage) {
  leaderConnection.send(createMessage(conversations2));
}
function processLocalConversationUpdate({
  conversations: conversations2,
  isCurrentLeader,
  peerRegistry,
  localPeerId,
  leaderConnection,
  createUpdateMessage,
  log: log2 = () => {
  }
}) {
  const result = {
    updatedLeaderRegistry: false,
    notifiedLeader: false
  };
  if (isCurrentLeader && applyLeaderConversationUpdate(peerRegistry, localPeerId, conversations2)) {
    log2("[Discovery] Leader updated own conversations:", conversations2);
    result.updatedLeaderRegistry = true;
  }
  if (shouldNotifyLeaderOfConversations(leaderConnection)) {
    notifyLeaderOfConversations(leaderConnection, conversations2, createUpdateMessage);
    log2("[Discovery] Notified leader of conversation update:", conversations2);
    result.notifiedLeader = true;
  }
  return result;
}
function createPeerConversationController({
  getLocalPeerId: getLocalPeerId2,
  getConnections,
  getCurrentDiscoveryLeader,
  getPeerRegistry,
  getLeaderConnection,
  flushCommitQueue,
  clearTimer: clearTimer2 = stopLeaderCommitTimer,
  committedEvents: committedEvents2,
  broadcastToAllPeers,
  createUpdateMessage = createUpdateConversationsMessage,
  processConversationUpdate = processLocalConversationUpdate,
  refreshCommitInterval = refreshLeaderCommitInterval,
  getLeaderId = getCurrentLeaderId,
  checkLocalLeader = isLocalPeerLeader,
  subscribeCommittedBroadcasts = subscribeCommittedMessageBroadcasts,
  log: log2 = () => {
  }
}) {
  let leaderCommitInterval = null;
  const getCurrentLeader2 = () => getLeaderId(getLocalPeerId2(), getConnections());
  const isLeader = () => checkLocalLeader(getLocalPeerId2(), getConnections());
  const refreshLeaderInterval = () => {
    leaderCommitInterval = refreshCommitInterval({
      localPeerId: getLocalPeerId2(),
      connections: getConnections(),
      currentInterval: leaderCommitInterval,
      flushCommitQueue,
      isStillLeader: isLeader,
      log: log2
    });
    return leaderCommitInterval;
  };
  const subscribePeerConnectionChanges = (peerConnections2) => peerConnections2.subscribe(() => {
    refreshLeaderInterval();
  });
  const stopLeaderCommitInterval = () => {
    leaderCommitInterval = clearTimer2(leaderCommitInterval);
    return leaderCommitInterval;
  };
  const updateMyConversations2 = (conversations2) => processConversationUpdate({
    conversations: conversations2,
    isCurrentLeader: getCurrentDiscoveryLeader(),
    peerRegistry: getPeerRegistry(),
    localPeerId: getLocalPeerId2(),
    leaderConnection: getLeaderConnection(),
    createUpdateMessage,
    log: log2
  });
  const subscribeCommittedMessages = () => subscribeCommittedBroadcasts({
    committedEvents: committedEvents2,
    broadcastToAllPeers,
    log: log2
  });
  return {
    getCurrentLeader: getCurrentLeader2,
    isLeader,
    refreshLeaderInterval,
    subscribePeerConnectionChanges,
    stopLeaderCommitInterval,
    updateMyConversations: updateMyConversations2,
    subscribeCommittedMessages
  };
}
function connectPeerWithTimeout(peer, peerId, metadata, timeout = 5e3) {
  return new Promise((resolve, reject) => {
    const conn = peer.connect(peerId, { metadata });
    let settled = false;
    const settle = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback();
    };
    const timer = setTimeout(() => {
      settle(() => {
        conn.close();
        reject(new Error("Connection timeout"));
      });
    }, timeout);
    conn.on("open", () => {
      settle(() => resolve(conn));
    });
    conn.on("error", (error) => {
      settle(() => reject(error));
    });
  });
}
const LEADERSHIP_CLAIM_TIMEOUT_MS = 5e3;
function createLeadershipPeerOptions() {
  return {
    debug: 0
  };
}
function getLeadershipClaimErrorResult(error) {
  return (error == null ? void 0 : error.type) === "unavailable-id" ? "taken" : "error";
}
function claimPeerLeadershipSlot({
  PeerClass,
  leaderId,
  onLeadershipPeer,
  onLeadershipSetup,
  timeoutMs = LEADERSHIP_CLAIM_TIMEOUT_MS,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout
}) {
  return new Promise((resolve, reject) => {
    const leader = new PeerClass(leaderId, createLeadershipPeerOptions());
    let resolved = false;
    const settle = (callback) => {
      if (resolved) return;
      resolved = true;
      clearTimeoutFn(claimTimeout);
      callback();
    };
    const claimTimeout = setTimeoutFn(() => {
      settle(() => {
        leader.destroy();
        reject(new Error("Leadership claim timeout"));
      });
    }, timeoutMs);
    leader.on("open", (id) => {
      if (id !== leaderId) return;
      settle(() => {
        onLeadershipPeer(leader);
        onLeadershipSetup();
        resolve(true);
      });
    });
    leader.on("error", (error) => {
      settle(() => {
        if (getLeadershipClaimErrorResult(error) === "taken") {
          resolve(false);
          return;
        }
        reject(error);
      });
    });
  });
}
async function initializePeerDiscoverySession({
  auth,
  repoFullName,
  createDiscoveryBootstrap: createDiscoveryBootstrap2,
  loadContacts: loadContacts2,
  connectToLeader,
  attemptLeadership,
  startHealthCheckSystem,
  log: log2 = () => {
  }
}) {
  const discovery = createDiscoveryBootstrap2(auth, repoFullName);
  if (!discovery) {
    log2("[Discovery] No GitHub auth available");
    return {
      status: "missing_auth"
    };
  }
  const { orgId, leaderId } = discovery;
  log2("[Discovery] Initializing for org:", orgId, "Leader ID:", leaderId);
  loadContacts2(orgId);
  const connected = await connectToLeader(leaderId);
  log2("[Discovery] Connection attempt result:", connected);
  if (!connected) {
    log2("[Discovery] No leader found, attempting to become leader");
    await attemptLeadership(leaderId, orgId);
  }
  log2("[Discovery] Starting health check system");
  startHealthCheckSystem(orgId);
  return {
    status: connected ? "connected_to_leader" : "leadership_attempted",
    orgId,
    leaderId,
    connected
  };
}
async function connectToDiscoveryLeader({
  leaderId,
  connectToPeer,
  setupLeaderConnection,
  setConnectedToLeader,
  log: log2 = () => {
  }
}) {
  log2("[Discovery] Attempting to connect to leader:", leaderId);
  try {
    const connection = await connectToPeer(leaderId, 3e3);
    if (connection) {
      log2("[Discovery] ✅ Connected to leader");
      setConnectedToLeader(connection);
      setupLeaderConnection(connection);
      return true;
    }
  } catch (error) {
    log2("[Discovery] Leader unavailable:", error.message);
  }
  return false;
}
async function attemptDiscoveryLeadership({
  leaderId,
  orgId,
  claimLeadershipSlot,
  setCurrentLeader,
  log: log2 = () => {
  }
}) {
  log2("[Discovery] Attempting to claim leadership:", leaderId);
  try {
    const success = await claimLeadershipSlot(leaderId, orgId);
    if (success) {
      log2("[Discovery] 👑 Became leader");
      setCurrentLeader(true);
      return "leader";
    }
    log2("[Discovery] Leadership already taken, operating as regular peer");
    return "peer";
  } catch (error) {
    log2("[Discovery] Failed to claim leadership:", error.message);
    return "failed";
  }
}
function createDiscoverySessionOrchestrator({
  getAuth,
  getRepoFullName,
  getLocalPeer,
  getLocalUsername,
  PeerClass,
  loadContacts: loadContacts2,
  setupLeaderConnection,
  setupLeadershipRole,
  startHealthCheckSystem,
  setConnectedToLeader,
  setLeadershipPeer,
  setCurrentLeader,
  createDiscoveryBootstrap: buildDiscoveryBootstrap = createDiscoveryBootstrap,
  createDiscoveryConnectionMetadata: buildConnectionMetadata = createDiscoveryConnectionMetadata,
  connectPeer = connectPeerWithTimeout,
  claimLeadership = claimPeerLeadershipSlot,
  log: log2 = () => {
  }
}) {
  const connectToPeer = (peerId, timeout = 5e3) => connectPeer(
    getLocalPeer(),
    peerId,
    buildConnectionMetadata(getLocalUsername()),
    timeout
  );
  const connectToLeader = (leaderId) => connectToDiscoveryLeader({
    leaderId,
    connectToPeer,
    setupLeaderConnection,
    setConnectedToLeader,
    log: log2
  });
  const claimLeadershipSlot = (leaderId, orgId) => claimLeadership({
    PeerClass,
    leaderId,
    onLeadershipPeer: setLeadershipPeer,
    onLeadershipSetup: () => setupLeadershipRole(orgId)
  });
  const attemptLeadership = (leaderId, orgId) => attemptDiscoveryLeadership({
    leaderId,
    orgId,
    claimLeadershipSlot,
    setCurrentLeader,
    log: log2
  });
  const initialize = () => initializePeerDiscoverySession({
    auth: getAuth(),
    repoFullName: getRepoFullName(),
    createDiscoveryBootstrap: buildDiscoveryBootstrap,
    loadContacts: loadContacts2,
    connectToLeader,
    attemptLeadership,
    startHealthCheckSystem,
    log: log2
  });
  return {
    initialize,
    connectToLeader,
    attemptLeadership
  };
}
function isSameOpenPeerSession(peer, currentRepo, currentSessionId, nextRepo, nextSessionId) {
  return Boolean((peer == null ? void 0 : peer.open) && currentRepo === nextRepo && currentSessionId === nextSessionId);
}
function normalizePeerUsername(username) {
  return String(username || "").toLowerCase();
}
function createPeerJsOptions() {
  return {
    debug: 2,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    }
  };
}
function createPeerManagerSession(repoFullName, username, sessionId, peerIdBuilder) {
  const normalizedUsername = normalizePeerUsername(username);
  return {
    repoFullName,
    username: normalizedUsername,
    sessionId,
    peerId: peerIdBuilder(repoFullName, normalizedUsername, sessionId),
    peerOptions: createPeerJsOptions()
  };
}
function clearTimer(timer, clearIntervalFn = clearInterval) {
  if (timer) {
    clearIntervalFn(timer);
  }
  return null;
}
function closeOpenConnections(connections, onClosing = () => {
}) {
  Object.entries(connections || {}).forEach(([peerId, entry]) => {
    const conn = entry == null ? void 0 : entry.conn;
    onClosing(peerId, conn);
    if (conn == null ? void 0 : conn.open) {
      conn.close();
    }
  });
}
function closeConnection(connection) {
  if (connection) {
    connection.close();
  }
  return null;
}
function destroyPeer(peer) {
  if (peer) {
    peer.destroy();
  }
  return null;
}
function resetPeerStores({ peerConnections: peerConnections2, onlinePeers: onlinePeers2, typingUsers: typingUsers2 }) {
  peerConnections2.set({});
  onlinePeers2.set([]);
  typingUsers2.set({});
}
function startLeaderMaintenanceTimer(performMaintenance, setIntervalFn = setInterval) {
  return setIntervalFn(performMaintenance, LEADER_MAINTENANCE_INTERVAL_MS);
}
function pruneStalePeerRegistry(peerRegistry, localPeerId, now2 = Date.now(), staleThresholdMs = PEER_STALE_THRESHOLD_MS) {
  const removedPeers = [];
  for (const [peerId, info] of peerRegistry.entries()) {
    if (peerId === localPeerId) continue;
    if (now2 - (info.lastSeen || 0) > staleThresholdMs) {
      peerRegistry.delete(peerId);
      removedPeers.push({ peerId, info });
    }
  }
  return removedPeers;
}
function closeRemovedPeerConnections(removedPeers) {
  removedPeers.forEach(({ info }) => {
    var _a2;
    if ((_a2 = info.connection) == null ? void 0 : _a2.open) {
      info.connection.close();
    }
  });
}
function notifyLeadershipChange(peerRegistry, message) {
  peerRegistry.forEach((info) => {
    var _a2;
    if ((_a2 = info.connection) == null ? void 0 : _a2.open) {
      info.connection.send(message);
    }
  });
}
function performLeaderRegistryMaintenance({
  peerRegistry,
  localPeerId,
  now: now2 = Date.now(),
  staleThresholdMs = PEER_STALE_THRESHOLD_MS,
  closeConnections = closeRemovedPeerConnections,
  log: log2 = () => {
  }
}) {
  log2("[Discovery] Performing leader maintenance, current peers:", peerRegistry.size);
  const removedPeers = pruneStalePeerRegistry(peerRegistry, localPeerId, now2, staleThresholdMs);
  removedPeers.forEach(({ peerId }) => log2("[Discovery] Removing stale peer:", peerId));
  closeConnections(removedPeers);
  return removedPeers;
}
function stepDownFromDiscoveryLeadership({
  peerRegistry,
  leadershipPeer,
  leadershipChangeMessage,
  destroyPeer: destroyPeer2,
  setLeadershipPeer,
  setCurrentLeader,
  log: log2 = () => {
  }
}) {
  log2("[Discovery] Stepping down from leadership");
  notifyLeadershipChange(peerRegistry, leadershipChangeMessage);
  const nextLeadershipPeer = destroyPeer2(leadershipPeer);
  setLeadershipPeer(nextLeadershipPeer);
  setCurrentLeader(false);
  peerRegistry.clear();
  return nextLeadershipPeer;
}
function startLeaderHealthTimer(checkHealth, setIntervalFn = setInterval) {
  return setIntervalFn(checkHealth, LEADER_HEALTH_CHECK_INTERVAL_MS);
}
function getLeaderHealthAction(isCurrentLeader, connectedToLeader) {
  if (isCurrentLeader) return "skip";
  if (connectedToLeader) return "heartbeat";
  return "reconnect";
}
function handleLeaderHealthTick({
  isCurrentLeader,
  connectedToLeader,
  checkLeaderHealth,
  reconnectToLeader
}) {
  const action2 = getLeaderHealthAction(isCurrentLeader, connectedToLeader);
  if (action2 === "skip") return action2;
  if (action2 === "heartbeat") {
    checkLeaderHealth();
    return action2;
  }
  reconnectToLeader();
  return action2;
}
function isLeaderConnectionOpen(connection) {
  return Boolean(connection && connection.open !== false);
}
function sendLeaderHeartbeat(connection, message) {
  connection.send(message);
}
function checkDiscoveryLeaderHealth({
  connectedToLeader,
  heartbeatMessage,
  reconnectToLeader,
  setConnectedToLeader,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  if (!isLeaderConnectionOpen(connectedToLeader)) {
    log2("[Discovery] Leader connection lost, attempting reconnection");
    setConnectedToLeader(null);
    reconnectToLeader();
    return "reconnect";
  }
  try {
    sendLeaderHeartbeat(connectedToLeader, heartbeatMessage);
    return "heartbeat";
  } catch (error) {
    warn("[Discovery] Failed to send heartbeat to leader:", error);
    setConnectedToLeader(null);
    reconnectToLeader();
    return "reconnect";
  }
}
async function reconnectToDiscoveryLeader({
  orgId,
  buildLeaderId: buildLeaderId2,
  connectToLeader,
  attemptLeadership,
  log: log2 = () => {
  }
}) {
  const leaderId = buildLeaderId2(orgId);
  const connected = await connectToLeader(leaderId);
  if (!connected) {
    log2("[Discovery] No leader available, attempting to become leader");
    await attemptLeadership(leaderId, orgId);
  }
  return {
    leaderId,
    connected
  };
}
function scheduleLeaderReconnect(reconnect2, delayMs, setTimeoutFn = setTimeout) {
  return setTimeoutFn(reconnect2, delayMs);
}
function createLeaderHealthController({
  getCurrentLeader: getCurrentLeader2,
  getConnectedToLeader,
  getPeerRegistry,
  getLeadershipPeer,
  getHealthCheckInterval,
  setHealthCheckInterval,
  buildLeaderId: buildLeaderId2,
  createHeartbeatMessage: createHeartbeatMessage2,
  createLeadershipChangeMessage: createLeadershipChangeMessage2,
  destroyPeer: destroyPeer2,
  setConnectedToLeader,
  setLeadershipPeer,
  setCurrentLeader,
  connectToLeader,
  attemptLeadership,
  clearTimer: clearTimer2,
  startHealthTimer = startLeaderHealthTimer,
  handleHealthTick = handleLeaderHealthTick,
  checkLeaderHealth = checkDiscoveryLeaderHealth,
  reconnectLeader = reconnectToDiscoveryLeader,
  stepDownLeadership = stepDownFromDiscoveryLeadership,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  const reconnectToLeader = (orgId) => reconnectLeader({
    orgId,
    buildLeaderId: buildLeaderId2,
    connectToLeader,
    attemptLeadership,
    log: log2
  });
  const runLeaderHealthCheck = (orgId) => checkLeaderHealth({
    connectedToLeader: getConnectedToLeader(),
    heartbeatMessage: createHeartbeatMessage2(),
    reconnectToLeader: () => reconnectToLeader(orgId),
    setConnectedToLeader,
    log: log2,
    warn
  });
  const startHealthCheckSystem = (orgId) => {
    setHealthCheckInterval(clearTimer2(getHealthCheckInterval()));
    const nextInterval = startHealthTimer(() => {
      handleHealthTick({
        isCurrentLeader: getCurrentLeader2(),
        connectedToLeader: getConnectedToLeader(),
        checkLeaderHealth: () => runLeaderHealthCheck(orgId),
        reconnectToLeader: () => reconnectToLeader(orgId)
      });
    });
    setHealthCheckInterval(nextInterval);
    return nextInterval;
  };
  const stepDownFromLeadership = () => stepDownLeadership({
    peerRegistry: getPeerRegistry(),
    leadershipPeer: getLeadershipPeer(),
    leadershipChangeMessage: createLeadershipChangeMessage2(),
    destroyPeer: destroyPeer2,
    setLeadershipPeer,
    setCurrentLeader,
    log: log2
  });
  return {
    startHealthCheckSystem,
    checkLeaderHealth: runLeaderHealthCheck,
    reconnectToLeader,
    stepDownFromLeadership
  };
}
function sendCompletePeerRegistry(connection, peerRegistry, orgId, log2 = () => {
}) {
  const peerList = sendPeerRegistrySnapshot(connection, peerRegistry, orgId);
  log2(`[Discovery] Sending complete peer registry to ${connection.peer}:`, peerList);
  return peerList;
}
function sendDiscoveryPeerList(connection, peerRegistry, conversationFilter, log2 = () => {
}) {
  const filteredPeers = sendFilteredPeerListSnapshot(connection, peerRegistry, conversationFilter);
  log2(`[Discovery] Sending peer list to ${connection.peer}:`, filteredPeers);
  return filteredPeers;
}
function broadcastDiscoveryPeerListUpdate(peerRegistry, sendPeerList) {
  var _a2;
  const notifiedPeerIds = [];
  for (const [peerId, info] of peerRegistry.entries()) {
    if ((_a2 = info.connection) == null ? void 0 : _a2.open) {
      sendPeerList(info.connection);
      notifiedPeerIds.push(peerId);
    }
  }
  return notifiedPeerIds;
}
function getDiscoveryMessageType(message) {
  if (!message || typeof message !== "object") {
    return null;
  }
  return message.type || null;
}
function dispatchDiscoveryMessage(message, handlers, onUnknown = () => {
}) {
  const messageType = getDiscoveryMessageType(message);
  if (!messageType) {
    return "invalid";
  }
  const handler = handlers[messageType];
  if (!handler) {
    onUnknown(messageType);
    return "unknown";
  }
  handler(message);
  return messageType;
}
function handleLeaderDiscoveryResponse(data, handlers = {}) {
  const log2 = handlers.log || (() => {
  });
  return dispatchDiscoveryMessage(data, {
    peer_registry: (message) => {
      var _a2, _b2, _c2;
      log2("[Discovery] Received peer registry:", message.peers, "for org:", message.orgId);
      (_a2 = handlers.updateKnownPeers) == null ? void 0 : _a2.call(handlers, message.peers);
      (_b2 = handlers.storePeerRegistry) == null ? void 0 : _b2.call(handlers, message.peers, message.orgId);
      (_c2 = handlers.connectToOrgPeers) == null ? void 0 : _c2.call(handlers, message.peers);
    },
    peer_list: (message) => {
      var _a2;
      log2("[Discovery] Received peer list:", message.peers);
      (_a2 = handlers.updateKnownPeers) == null ? void 0 : _a2.call(handlers, message.peers);
    },
    leadership_change: () => {
      var _a2;
      log2("[Discovery] Leadership change detected, reconnecting");
      (_a2 = handlers.onLeadershipChange) == null ? void 0 : _a2.call(handlers);
    }
  }, (messageType) => {
    log2("[Discovery] Unknown leader response type:", messageType);
  });
}
function processLeaderPeerMessage({
  data,
  connection,
  peerRegistry,
  sendPeerRegistry,
  broadcastPeerListUpdate,
  log: log2 = () => {
  }
}) {
  return dispatchDiscoveryMessage(data, {
    register: (message) => {
      log2("[Discovery] Registering peer:", connection.peer, "username:", message.username);
      registerPeerInRegistry(peerRegistry, connection.peer, message, connection);
      sendPeerRegistry(connection);
      broadcastPeerListUpdate();
    },
    request_peers: () => {
      sendPeerRegistry(connection);
    },
    update_conversations: (message) => {
      updatePeerRegistryConversations(peerRegistry, connection.peer, message.conversations);
    },
    heartbeat: () => {
      touchPeerRegistryHeartbeat(peerRegistry, connection.peer);
    }
  }, (messageType) => {
    log2("[Discovery] Unknown leader message type:", messageType);
  });
}
function setupDiscoveryLeadershipRole({
  leadershipPeer,
  localPeerId,
  localUsername,
  repoFullName,
  peerRegistry,
  setupPeerConnection,
  startLeaderMaintenanceTasks,
  log: log2 = () => {
  }
}) {
  log2("[Discovery] Setting up leadership responsibilities");
  peerRegistry.set(localPeerId, createLeaderRegistryEntry(localUsername, repoFullName));
  log2("[Discovery] Leader registered self in peer registry");
  bindPeerEvents(leadershipPeer, {
    connection: (connection) => {
      log2("[Discovery] New peer connected to leader:", connection.peer);
      setupPeerConnection(connection);
    }
  });
  startLeaderMaintenanceTasks();
  return peerRegistry.get(localPeerId);
}
function bindDiscoveryPeerConnection({
  connection,
  peerRegistry,
  handleLeaderMessage,
  broadcastPeerListUpdate,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  return bindConnectionEvents(connection, {
    open: () => {
      log2("[Discovery] Peer connection opened:", connection.peer);
    },
    data: (data) => {
      handleLeaderMessage(data, connection);
    },
    close: () => {
      log2("[Discovery] Peer disconnected:", connection.peer);
      removePeerFromRegistry(peerRegistry, connection.peer);
      broadcastPeerListUpdate();
    },
    error: (error) => {
      warn("[Discovery] Peer connection error:", error);
      removePeerFromRegistry(peerRegistry, connection.peer);
    }
  });
}
function createDiscoveryLeaderRoleController({
  getLeadershipPeer,
  getLocalPeerId: getLocalPeerId2,
  getLocalUsername,
  getRepoFullName,
  peerRegistry,
  getOrgId: getOrgId2,
  staleThresholdMs,
  setupLeadershipRole = setupDiscoveryLeadershipRole,
  bindPeerConnection = bindDiscoveryPeerConnection,
  processLeaderMessage = processLeaderPeerMessage,
  sendRegistry = sendCompletePeerRegistry,
  sendPeerListSnapshot = sendDiscoveryPeerList,
  broadcastPeerList = broadcastDiscoveryPeerListUpdate,
  startMaintenanceTimer = startLeaderMaintenanceTimer,
  performMaintenance = performLeaderRegistryMaintenance,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  const sendPeerRegistry = (connection) => sendRegistry(
    connection,
    peerRegistry,
    getOrgId2(getRepoFullName()),
    log2
  );
  const sendPeerList = (connection, conversationFilter) => sendPeerListSnapshot(
    connection,
    peerRegistry,
    conversationFilter,
    log2
  );
  const broadcastPeerListUpdate = () => broadcastPeerList(peerRegistry, sendPeerList);
  const handleLeaderMessage = (data, connection) => processLeaderMessage({
    data,
    connection,
    peerRegistry,
    sendPeerRegistry,
    broadcastPeerListUpdate,
    log: log2
  });
  const setupPeerConnection = (connection) => bindPeerConnection({
    connection,
    peerRegistry,
    handleLeaderMessage,
    broadcastPeerListUpdate,
    log: log2,
    warn
  });
  const runMaintenance = () => performMaintenance({
    peerRegistry,
    localPeerId: getLocalPeerId2(),
    staleThresholdMs,
    log: log2
  });
  const startMaintenanceTasks = () => startMaintenanceTimer(runMaintenance);
  const setupRole = () => setupLeadershipRole({
    leadershipPeer: getLeadershipPeer(),
    localPeerId: getLocalPeerId2(),
    localUsername: getLocalUsername(),
    repoFullName: getRepoFullName(),
    peerRegistry,
    setupPeerConnection,
    startLeaderMaintenanceTasks: startMaintenanceTasks,
    log: log2
  });
  return {
    setupLeadershipRole: setupRole,
    setupPeerConnection,
    handleLeaderMessage,
    sendPeerRegistry,
    sendPeerList,
    broadcastPeerListUpdate,
    startLeaderMaintenanceTasks: startMaintenanceTasks,
    performLeaderMaintenance: runMaintenance
  };
}
function storeDiscoveredPeerRegistry({
  storage,
  orgId,
  peers,
  updateContact: updateContact2,
  log: log2 = () => {
  }
}) {
  const orgPeers = persistOrgPeerRegistryContacts(storage, orgId, peers, updateContact2);
  log2("[Discovery] Stored", orgPeers.length, "peers for org:", orgId);
  return orgPeers;
}
function connectToReceivedOrgPeers({
  peers,
  localPeerId,
  connections,
  failedConnections,
  connectToPeer,
  log: log2 = () => {
  }
}) {
  log2("[Discovery] Connecting to all org peers:", peers.length);
  return processDiscoveredPeerConnections({
    peers,
    localPeerId,
    connections,
    failedConnections,
    sourceLabel: "org peer",
    connectToPeer,
    log: log2
  });
}
function updateKnownPeerConnections({
  peers,
  localPeerId,
  connections,
  failedConnections,
  connectToPeer,
  log: log2 = () => {
  }
}) {
  log2("[Discovery] Processing peer list, found", peers.length, "peers");
  peers.forEach((peer) => {
    log2("[Discovery] Processing peer:", peer.peerId, "username:", peer.username, "isLeader:", peer.isLeader);
  });
  return processDiscoveredPeerConnections({
    peers,
    localPeerId,
    connections,
    failedConnections,
    sourceLabel: "discovered peer",
    connectToPeer,
    log: log2,
    includeSelfLog: true
  });
}
function createLeaderConnectionController({
  getRepoFullName,
  getLocalUsername,
  getLocalPeerId: getLocalPeerId2,
  getConnections,
  getFailedConnections,
  getStorage,
  getOrgId: getOrgId2,
  updateContact: updateContact2,
  connectToPeer,
  reconnectToLeader,
  setConnectedToLeader,
  reconnectDelayMs,
  bindLeaderConnection = bindLeaderConnectionEvents,
  sendRegister = sendRegisterWithLeader,
  handleLeaderResponse = handleLeaderDiscoveryResponse,
  storeRegistry = storeDiscoveredPeerRegistry,
  connectOrgPeers = connectToReceivedOrgPeers,
  updateKnownPeers = updateKnownPeerConnections,
  scheduleReconnect = setTimeout,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  const registerWithLeader = (connection) => sendRegister(connection, getLocalUsername(), getRepoFullName());
  const storePeerRegistry = (peers, orgId) => storeRegistry({
    storage: getStorage(),
    orgId,
    peers,
    updateContact: updateContact2,
    log: log2
  });
  const connectToOrgPeers = (peers) => connectOrgPeers({
    peers,
    localPeerId: getLocalPeerId2(),
    connections: getConnections(),
    failedConnections: getFailedConnections(),
    connectToPeer,
    log: log2
  });
  const updateKnownPeerList = (peers) => updateKnownPeers({
    peers,
    localPeerId: getLocalPeerId2(),
    connections: getConnections(),
    failedConnections: getFailedConnections(),
    connectToPeer,
    log: log2
  });
  const handleResponse = (data) => handleLeaderResponse(data, {
    updateKnownPeers: updateKnownPeerList,
    storePeerRegistry,
    connectToOrgPeers,
    onLeadershipChange: () => {
      setConnectedToLeader(null);
      scheduleReconnect(() => reconnectToLeader(getOrgId2(getRepoFullName())), reconnectDelayMs);
    },
    log: log2
  });
  const setupLeaderConnection = (connection) => bindLeaderConnection(connection, {
    data: handleResponse,
    disconnected: () => {
      setConnectedToLeader(null);
    },
    register: registerWithLeader,
    log: log2,
    warn
  });
  return {
    setupLeaderConnection,
    registerWithLeader,
    handleLeaderResponse: handleResponse,
    storePeerRegistry,
    connectToOrgPeers,
    updateKnownPeers: updateKnownPeerList
  };
}
function createPeerDiscoveryController({
  PeerClass,
  getAuth,
  getLocalPeer,
  getLocalPeerId: getLocalPeerId2,
  getLocalUsername,
  getRepoFullName,
  getConnections,
  getFailedConnections,
  getStorage,
  loadContacts: loadContacts2,
  updateContact: updateContact2,
  connectToPeer,
  createLeaderRole = createDiscoveryLeaderRoleController,
  createLeaderConnection = createLeaderConnectionController,
  createDiscoverySession = createDiscoverySessionOrchestrator,
  createLeaderHealth = createLeaderHealthController,
  clearTimerFn = clearTimer,
  closeConnectionFn = closeConnection,
  destroyPeerFn = destroyPeer,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  let isCurrentLeader = false;
  let leadershipPeer = null;
  let connectedToLeader = null;
  const peerRegistry = /* @__PURE__ */ new Map();
  let healthCheckInterval = null;
  let leaderHealth = null;
  const setConnectedToLeader = (connection) => {
    connectedToLeader = connection;
  };
  const setLeadershipPeer = (peer) => {
    leadershipPeer = peer;
  };
  const setCurrentLeader = (isLeader) => {
    isCurrentLeader = isLeader;
  };
  const leaderRole = createLeaderRole({
    getLeadershipPeer: () => leadershipPeer,
    getLocalPeerId: getLocalPeerId2,
    getLocalUsername,
    getRepoFullName,
    peerRegistry,
    getOrgId,
    staleThresholdMs: PEER_STALE_THRESHOLD_MS,
    log: log2,
    warn
  });
  const reconnectToLeader = (orgId) => leaderHealth.reconnectToLeader(orgId);
  const leaderConnection = createLeaderConnection({
    getRepoFullName,
    getLocalUsername,
    getLocalPeerId: getLocalPeerId2,
    getConnections,
    getFailedConnections,
    getStorage,
    getOrgId,
    updateContact: updateContact2,
    connectToPeer,
    reconnectToLeader,
    setConnectedToLeader,
    reconnectDelayMs: LEADERSHIP_RECONNECT_DELAY_MS,
    scheduleReconnect: scheduleLeaderReconnect,
    log: log2,
    warn
  });
  const discoverySession = createDiscoverySession({
    getAuth,
    getRepoFullName,
    getLocalPeer,
    getLocalUsername,
    PeerClass,
    loadContacts: loadContacts2,
    setupLeaderConnection: leaderConnection.setupLeaderConnection,
    setupLeadershipRole: leaderRole.setupLeadershipRole,
    startHealthCheckSystem: (orgId) => leaderHealth.startHealthCheckSystem(orgId),
    setConnectedToLeader,
    setLeadershipPeer,
    setCurrentLeader,
    log: log2
  });
  leaderHealth = createLeaderHealth({
    getCurrentLeader: () => isCurrentLeader,
    getConnectedToLeader: () => connectedToLeader,
    getPeerRegistry: () => peerRegistry,
    getLeadershipPeer: () => leadershipPeer,
    getHealthCheckInterval: () => healthCheckInterval,
    setHealthCheckInterval: (interval) => {
      healthCheckInterval = interval;
    },
    buildLeaderId,
    createHeartbeatMessage,
    createLeadershipChangeMessage,
    destroyPeer: destroyPeerFn,
    setConnectedToLeader,
    setLeadershipPeer,
    setCurrentLeader,
    connectToLeader: discoverySession.connectToLeader,
    attemptLeadership: discoverySession.attemptLeadership,
    clearTimer: clearTimerFn,
    log: log2,
    warn
  });
  const initializeDiscoverySystem = () => discoverySession.initialize();
  const stepDownFromLeadership = () => leaderHealth.stepDownFromLeadership();
  const shutdownDiscovery = () => {
    healthCheckInterval = clearTimerFn(healthCheckInterval);
    leadershipPeer = destroyPeerFn(leadershipPeer);
    connectedToLeader = closeConnectionFn(connectedToLeader);
    isCurrentLeader = false;
    peerRegistry.clear();
  };
  return {
    initializeDiscoverySystem,
    reconnectToLeader,
    stepDownFromLeadership,
    shutdownDiscovery,
    broadcastPeerListUpdate: leaderRole.broadcastPeerListUpdate,
    getPeerRegistry: () => peerRegistry,
    getConnectedToLeader: () => connectedToLeader,
    isCurrentLeader: () => isCurrentLeader
  };
}
async function computeMessageHash(previousHash, author, content) {
  const input = `${previousHash || "genesis"}|${author}|${content}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.substring(0, 16);
}
function getPreviousMessageHash(messages) {
  if (!messages || messages.length === 0) {
    return null;
  }
  const lastMessage = messages[messages.length - 1];
  return lastMessage.hash || null;
}
function findCommonAncestor(localHashes, remoteHashes) {
  const remoteSet = new Set(remoteHashes);
  for (const hash of localHashes) {
    if (remoteSet.has(hash)) {
      return hash;
    }
  }
  return null;
}
function getRecentHashes(messages, count = 100) {
  if (!messages || messages.length === 0) return [];
  return messages.slice(-count).reverse().map((m) => m.hash).filter((h) => h);
}
const HASH_CHAIN_LIMIT = 100;
function createSyncRequest(conversationId, lastHash, timestamp = Date.now()) {
  return {
    type: "sync_request",
    conversationId,
    lastHash,
    timestamp
  };
}
function createSyncRequestChain(conversationId, hashChain, timestamp = Date.now()) {
  return {
    type: "sync_request_chain",
    conversationId,
    hashChain,
    timestamp
  };
}
function createSyncChainRequestForNeed(message, conversationsMap, repoFullName, timestamp = Date.now()) {
  if (!(message == null ? void 0 : message.conversationId)) return null;
  const conversation = findRepoConversation(conversationsMap, repoFullName, message.conversationId);
  if (!(conversation == null ? void 0 : conversation.messages)) return null;
  return createSyncRequestChain(
    message.conversationId,
    getRecentHashes(conversation.messages, HASH_CHAIN_LIMIT),
    timestamp
  );
}
function findRepoConversation(conversationsMap, repoFullName, conversationId) {
  const repoConversations = (conversationsMap == null ? void 0 : conversationsMap[repoFullName]) || [];
  return repoConversations.find((conversation) => conversation.id === conversationId);
}
function isValidSyncRequestMessage(message) {
  return Boolean((message == null ? void 0 : message.conversationId) && (message == null ? void 0 : message.lastHash));
}
function isValidSyncChainRequestMessage(message) {
  return Boolean((message == null ? void 0 : message.conversationId) && Array.isArray(message == null ? void 0 : message.hashChain));
}
function isValidSyncResponseMessage(message) {
  return Boolean((message == null ? void 0 : message.conversationId) && (message == null ? void 0 : message.messages));
}
function createConversationNotFoundSyncResponse(conversationId) {
  return {
    type: "sync_response",
    conversationId,
    messages: [],
    error: "Conversation not found"
  };
}
function createSyncNeedsChainResponse(conversationId) {
  return {
    type: "sync_needs_chain",
    conversationId,
    error: "Hash not found, please send hash chain"
  };
}
function createSyncResponseAfterHash(conversation, conversationId, lastHash) {
  if (!(conversation == null ? void 0 : conversation.messages)) {
    return createConversationNotFoundSyncResponse(conversationId);
  }
  const lastHashIndex = conversation.messages.findIndex((message) => message.hash === lastHash);
  if (lastHashIndex === -1) {
    return createSyncNeedsChainResponse(conversationId);
  }
  return {
    type: "sync_response",
    conversationId,
    messages: conversation.messages.slice(lastHashIndex + 1)
  };
}
function createSyncResponseForRequest(message, conversation) {
  return createSyncResponseAfterHash(conversation, message.conversationId, message.lastHash);
}
function createSyncResponseFromHashChain(conversation, conversationId, hashChain) {
  if (!(conversation == null ? void 0 : conversation.messages)) {
    return createConversationNotFoundSyncResponse(conversationId);
  }
  const ourHashes = getRecentHashes(conversation.messages, HASH_CHAIN_LIMIT);
  const commonHash = findCommonAncestor(hashChain, ourHashes);
  if (!commonHash) {
    return {
      type: "sync_response",
      conversationId,
      messages: conversation.messages,
      fullSync: true
    };
  }
  const commonIndex = conversation.messages.findIndex((message) => message.hash === commonHash);
  return {
    type: "sync_response",
    conversationId,
    messages: conversation.messages.slice(commonIndex + 1),
    commonAncestor: commonHash
  };
}
function createSyncResponseForChainRequest(message, conversation) {
  return createSyncResponseFromHashChain(conversation, message.conversationId, message.hashChain);
}
function normalizeSyncMessages(messages, createId = () => crypto.randomUUID(), now2 = () => Date.now()) {
  return messages.filter((message) => message.content && message.sender).map((message) => ({
    id: message.id || createId(),
    sender: message.sender,
    content: message.content,
    timestamp: message.timestamp || now2(),
    hash: message.hash || null,
    in_response_to: message.in_response_to || null
  }));
}
function getNormalizedSyncResponseMessages(message) {
  if (!isValidSyncResponseMessage(message)) return null;
  return normalizeSyncMessages(message.messages);
}
function getSyncResponseDeliveryType(response) {
  if ((response == null ? void 0 : response.error) === "Conversation not found") {
    return "conversation_not_found";
  }
  if ((response == null ? void 0 : response.type) === "sync_needs_chain") {
    return "sync_needs_chain";
  }
  if (response == null ? void 0 : response.fullSync) {
    return "full_sync";
  }
  return "messages";
}
function deliverSyncResponse(peerId, response, sendMessageToPeer2, deliveryHandlers = {}) {
  var _a2;
  const deliveryType = getSyncResponseDeliveryType(response);
  (_a2 = deliveryHandlers[deliveryType]) == null ? void 0 : _a2.call(deliveryHandlers, response);
  sendMessageToPeer2(peerId, response);
  return deliveryType;
}
function processSyncNeedsChainMessage({
  message,
  fromPeerId,
  conversationsMap,
  repoFullName,
  sendMessageToPeer: sendMessageToPeer2
}) {
  const request = createSyncChainRequestForNeed(message, conversationsMap, repoFullName);
  if (request) {
    sendMessageToPeer2(fromPeerId, request);
  }
  return request;
}
function processSyncRequestMessage({
  message,
  fromPeerId,
  conversationsMap,
  repoFullName,
  sendMessageToPeer: sendMessageToPeer2,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  log2("[PeerJS] Received sync request from", fromPeerId, "for conversation:", message.conversationId);
  if (!isValidSyncRequestMessage(message)) {
    warn("[PeerJS] Invalid sync request format:", message);
    return "invalid";
  }
  const conversation = findRepoConversation(conversationsMap, repoFullName, message.conversationId);
  const response = createSyncResponseForRequest(message, conversation);
  return deliverSyncResponse(fromPeerId, response, sendMessageToPeer2, {
    conversation_not_found: () => warn("[PeerJS] Conversation not found:", message.conversationId),
    sync_needs_chain: () => warn("[PeerJS] Hash not found in conversation:", message.lastHash),
    messages: () => log2("[PeerJS] Sending", response.messages.length, "messages after hash:", message.lastHash)
  });
}
function processSyncChainRequestMessage({
  message,
  fromPeerId,
  conversationsMap,
  repoFullName,
  sendMessageToPeer: sendMessageToPeer2,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  log2("[PeerJS] Received sync request with hash chain from", fromPeerId);
  if (!isValidSyncChainRequestMessage(message)) {
    warn("[PeerJS] Invalid sync chain request format:", message);
    return "invalid";
  }
  const conversation = findRepoConversation(conversationsMap, repoFullName, message.conversationId);
  const response = createSyncResponseForChainRequest(message, conversation);
  return deliverSyncResponse(fromPeerId, response, sendMessageToPeer2, {
    conversation_not_found: () => warn("[PeerJS] Conversation not found:", message.conversationId),
    full_sync: () => warn("[PeerJS] No common ancestor found with peer"),
    messages: () => log2("[PeerJS] Found common ancestor:", response.commonAncestor, "sending", response.messages.length, "messages")
  });
}
function processSyncResponseMessage({
  message,
  repoFullName,
  appendMessages: appendMessages2,
  isLeader,
  queueConversationForCommit: queueConversationForCommit2,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  if (!isValidSyncResponseMessage(message)) {
    warn("[PeerJS] Invalid sync response format:", message);
    return "invalid";
  }
  const validMessages = getNormalizedSyncResponseMessages(message);
  if (validMessages.length === 0) {
    return "empty";
  }
  appendMessages2(message.conversationId, repoFullName, validMessages);
  if (isLeader()) {
    log2("[PeerJS] Queueing synced messages for commit (I am leader)");
    queueConversationForCommit2(repoFullName, message.conversationId);
    return "queued";
  }
  return "appended";
}
const TYPING_CLEAR_DELAY_MS = 3e3;
function isValidTypingMessage(message) {
  return Boolean(message && typeof message.isTyping === "boolean");
}
function applyTypingStatus(users, fromPeerId, fromUsername, isTyping, now2 = Date.now()) {
  const updated = { ...users };
  if (isTyping) {
    updated[fromPeerId] = {
      isTyping: true,
      lastTypingTime: now2,
      username: fromUsername
    };
  } else {
    delete updated[fromPeerId];
  }
  return updated;
}
function clearExpiredTypingStatus(users, fromPeerId, now2 = Date.now(), maxAge = TYPING_CLEAR_DELAY_MS) {
  const updated = { ...users };
  const userTyping = updated[fromPeerId];
  if (userTyping && now2 - userTyping.lastTypingTime >= maxAge) {
    delete updated[fromPeerId];
  }
  return updated;
}
function createTypingStatusMessage(isTyping, timestamp = Date.now()) {
  return {
    type: "typing",
    isTyping,
    timestamp
  };
}
function processIncomingTypingMessage({
  message,
  fromUsername,
  fromPeerId,
  updateTypingUsers,
  setTimeoutFn = setTimeout,
  now: now2 = Date.now,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  if (!isValidTypingMessage(message)) {
    warn("[PeerJS] Invalid typing message format:", message);
    return "invalid";
  }
  updateTypingUsers((users) => applyTypingStatus(users, fromPeerId, fromUsername, message.isTyping, now2()));
  if (message.isTyping) {
    setTimeoutFn(() => {
      updateTypingUsers((users) => clearExpiredTypingStatus(users, fromPeerId));
    }, TYPING_CLEAR_DELAY_MS);
    log2("[PeerJS] Scheduled typing status clear for:", fromPeerId);
    return "typing";
  }
  return "not_typing";
}
function sendPeerMessage({
  peerId,
  message,
  connections,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  log2("[PeerJS] Sending message to peer:", peerId, message);
  if (sendToPeerConnection(connections, peerId, message)) {
    log2("[PeerJS] Message sent successfully");
    return true;
  }
  warn("[PeerJS] No connection found for peer:", peerId);
  return false;
}
function broadcastPeerMessage({
  message,
  conversationId = null,
  connections,
  participants,
  log: log2 = () => {
  },
  warn = () => {
  },
  error = () => {
  }
}) {
  log2("[PeerJS] Broadcasting message:", message, "to conversation:", conversationId);
  return broadcastToConversationParticipants({
    connections,
    participants,
    message,
    conversationId,
    log: log2,
    warn,
    error
  });
}
function broadcastPeerMessageToAll({
  message,
  connections,
  log: log2 = () => {
  },
  warn = () => {
  },
  error = () => {
  }
}) {
  log2("[PeerJS] Broadcasting to all connected peers:", message);
  return broadcastToAllConnections({
    connections,
    message,
    log: log2,
    warn,
    error
  });
}
function requestPeerMessageSync({
  peerId,
  conversationId,
  lastHash,
  sendMessageToPeer: sendMessageToPeer2,
  log: log2 = () => {
  }
}) {
  log2("[PeerJS] Requesting message sync from peer:", peerId, "conversation:", conversationId, "lastHash:", lastHash);
  const request = createSyncRequest(conversationId, lastHash);
  sendMessageToPeer2(peerId, request);
  return request;
}
function requestPeerSyncWithHashChain({
  peerId,
  conversationId,
  hashChain,
  sendMessageToPeer: sendMessageToPeer2,
  log: log2 = () => {
  }
}) {
  log2("[PeerJS] Requesting sync with hash chain from peer:", peerId, "chain length:", hashChain.length);
  const request = createSyncRequestChain(conversationId, hashChain);
  sendMessageToPeer2(peerId, request);
  return request;
}
function broadcastPeerTypingStatus(isTyping, broadcastToAllPeers) {
  const message = createTypingStatusMessage(isTyping);
  broadcastToAllPeers(message);
  return message;
}
function getConnectedParticipants(connections) {
  return Object.entries(connections).map(([peerId, { username }]) => ({
    peerId,
    username
  }));
}
function getConversationStoreParticipants(conversation, connections) {
  if (!(conversation == null ? void 0 : conversation.participants)) {
    return null;
  }
  return conversation.participants.map((username) => {
    const connEntry = Object.entries(connections).find(([, { username: connUsername }]) => connUsername === username);
    return {
      peerId: connEntry ? connEntry[0] : null,
      username
    };
  });
}
function getStoredOrgParticipants(storage, orgId) {
  if (!orgId) {
    return null;
  }
  const stored = storage.getItem(`skygit_peers_${orgId}`);
  if (!stored) {
    return null;
  }
  return JSON.parse(stored).map((peer) => ({
    peerId: peer.peerId,
    username: peer.username
  }));
}
function findConversationParticipants(conversationsMap, repoFullName, conversationId, connections) {
  const repoConversations = (conversationsMap == null ? void 0 : conversationsMap[repoFullName]) || [];
  const conversation = repoConversations.find((item) => item.id === conversationId);
  if (!(conversation == null ? void 0 : conversation.participants)) {
    return null;
  }
  return getConversationStoreParticipants(conversation, connections);
}
function getParticipantFallbackOrgId(repoFullName, getOrgId2) {
  return repoFullName ? getOrgId2(repoFullName) : null;
}
function resolveConversationParticipants({
  conversationId,
  connections,
  conversationsMap,
  repoFullName,
  storage,
  getOrgId: getOrgId2,
  log: log2 = () => {
  },
  warn = () => {
  },
  error = () => {
  }
}) {
  if (!conversationId) {
    warn("[PeerJS] No conversation ID provided, broadcasting to all peers");
    return getConnectedParticipants(connections);
  }
  try {
    const participantRows = findConversationParticipants(conversationsMap, repoFullName, conversationId, connections);
    if (participantRows) {
      log2("[PeerJS] Found conversation participants:", participantRows);
      return participantRows;
    }
  } catch (participantsError) {
    error("[PeerJS] Failed to get conversation participants from store:", participantsError);
  }
  const orgId = getParticipantFallbackOrgId(repoFullName, getOrgId2);
  if (orgId) {
    try {
      const storedParticipants = getStoredOrgParticipants(storage, orgId);
      if (storedParticipants) {
        log2("[PeerJS] Using all org peers as participants:", storedParticipants.length);
        return storedParticipants;
      }
    } catch (storageError) {
      error("[PeerJS] Failed to get org peers:", storageError);
    }
  }
  log2("[PeerJS] Using all connected peers as participants");
  return getConnectedParticipants(connections);
}
function createPeerMessageActionsController({
  getConnections,
  getConversations,
  getRepoFullName,
  getStorage,
  getOrgId: getOrgId2,
  sendMessage = sendPeerMessage,
  broadcastMessageToParticipants = broadcastPeerMessage,
  broadcastMessageToAll = broadcastPeerMessageToAll,
  requestMessageSyncAction = requestPeerMessageSync,
  requestSyncWithHashChainAction = requestPeerSyncWithHashChain,
  broadcastTypingAction = broadcastPeerTypingStatus,
  resolveParticipants = resolveConversationParticipants,
  log: log2 = () => {
  },
  warn = () => {
  },
  error = () => {
  }
}) {
  const getConversationParticipants = (conversationId) => resolveParticipants({
    conversationId,
    connections: getConnections(),
    conversationsMap: getConversations(),
    repoFullName: getRepoFullName(),
    storage: getStorage(),
    getOrgId: getOrgId2,
    log: log2,
    warn,
    error
  });
  const sendMessageToPeer2 = (peerId, message) => sendMessage({
    peerId,
    message,
    connections: getConnections(),
    log: log2,
    warn
  });
  const broadcastMessage2 = (message, conversationId = null) => broadcastMessageToParticipants({
    connections: getConnections(),
    participants: getConversationParticipants(conversationId),
    message,
    conversationId,
    log: log2,
    warn,
    error
  });
  const broadcastToAllPeers = (message) => broadcastMessageToAll({
    connections: getConnections(),
    message,
    log: log2,
    warn,
    error
  });
  const requestMessageSync = (peerId, conversationId, lastHash) => requestMessageSyncAction({
    peerId,
    conversationId,
    lastHash,
    sendMessageToPeer: sendMessageToPeer2,
    log: log2
  });
  const requestSyncWithHashChain = (peerId, conversationId, hashChain) => requestSyncWithHashChainAction({
    peerId,
    conversationId,
    hashChain,
    sendMessageToPeer: sendMessageToPeer2,
    log: log2
  });
  const broadcastTypingStatus2 = (isTyping) => broadcastTypingAction(isTyping, broadcastToAllPeers);
  return {
    getConversationParticipants,
    sendMessageToPeer: sendMessageToPeer2,
    broadcastMessage: broadcastMessage2,
    broadcastToAllPeers,
    requestMessageSync,
    requestSyncWithHashChain,
    broadcastTypingStatus: broadcastTypingStatus2
  };
}
function isValidChatMessage(message) {
  return Boolean((message == null ? void 0 : message.conversationId) && message.content);
}
function shouldIgnoreChatMessage(fromPeerId, localPeerId) {
  return fromPeerId === localPeerId;
}
function createIncomingChatMessage(message, fromUsername, createId = () => crypto.randomUUID(), now2 = () => Date.now()) {
  return {
    id: message.id || createId(),
    sender: fromUsername,
    content: message.content,
    timestamp: message.timestamp || now2(),
    hash: message.hash || null,
    in_response_to: message.in_response_to || null
  };
}
function processIncomingPeerChatMessage({
  message,
  fromUsername,
  fromPeerId,
  localPeerId,
  repoFullName,
  appendMessage: appendMessage2,
  setLastMessage: setLastMessage2,
  updateContact: updateContact2,
  isLeader,
  getCurrentLeader: getCurrentLeader2,
  queueConversationForCommit: queueConversationForCommit2,
  now: now2 = () => Date.now(),
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  if (!isValidChatMessage(message)) {
    warn("[PeerJS] Invalid chat message format:", message);
    return "invalid";
  }
  if (shouldIgnoreChatMessage(fromPeerId, localPeerId)) {
    log2("[PeerJS] Ignoring message from same session");
    return "ignored";
  }
  const messageData = createIncomingChatMessage(message, fromUsername, void 0, now2);
  appendMessage2(message.conversationId, repoFullName, messageData);
  setLastMessage2(fromUsername, messageData);
  updateContact2(fromUsername, {
    online: true,
    lastSeen: now2()
  });
  if (isLeader()) {
    log2("[PeerJS] Queueing message for commit (I am leader)");
    queueConversationForCommit2(repoFullName, message.conversationId);
    return "queued";
  }
  log2("[PeerJS] Skipping commit queue (not leader), current leader:", getCurrentLeader2());
  return "not_leader";
}
function getPeerMessageType(message) {
  if (!message || typeof message !== "object") {
    return null;
  }
  return message.type || null;
}
function dispatchPeerMessage(message, handlers, onUnknown = () => {
}) {
  const messageType = getPeerMessageType(message);
  if (!messageType) {
    return "invalid";
  }
  const handler = handlers[messageType];
  if (!handler) {
    onUnknown(messageType);
    return "unknown";
  }
  handler(message);
  return messageType;
}
function getPeerMessageSenderUsername(connections, fromPeerId, fromUsername = null, fallback = "Unknown") {
  var _a2;
  return fromUsername || ((_a2 = connections == null ? void 0 : connections[fromPeerId]) == null ? void 0 : _a2.username) || fallback;
}
function processPeerDataMessage({
  data,
  fromPeerId,
  fromUsername = null,
  connections,
  handlers,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  const username = getPeerMessageSenderUsername(connections, fromPeerId, fromUsername);
  log2("[PeerJS] Handling message from:", username, data);
  if (!getPeerMessageType(data)) {
    warn("[PeerJS] Invalid message format:", data);
    return {
      status: "invalid",
      username
    };
  }
  const status = dispatchPeerMessage(data, {
    chat: (message) => handlers.chat(message, username, fromPeerId),
    presence: (message) => handlers.presence(message, username, fromPeerId),
    typing: (message) => handlers.typing(message, username, fromPeerId),
    sync_request: (message) => handlers.syncRequest(message, fromPeerId),
    sync_request_chain: (message) => handlers.syncRequestChain(message, fromPeerId),
    sync_response: (message) => handlers.syncResponse(message, fromPeerId),
    sync_needs_chain: (message) => handlers.syncNeedsChain(message, fromPeerId),
    messages_committed: (message) => handlers.messagesCommitted(message, fromPeerId)
  }, (messageType) => {
    log2("[PeerJS] Unknown message type:", messageType);
  });
  return {
    status,
    username
  };
}
function createPeerMessageController({
  getConnections,
  getConversations,
  getLocalPeerId: getLocalPeerId2,
  getRepoFullName,
  appendMessage: appendMessage2,
  appendMessages: appendMessages2,
  setLastMessage: setLastMessage2,
  updateContact: updateContact2,
  updateTypingUsers,
  isLeader,
  getCurrentLeader: getCurrentLeader2,
  queueConversationForCommit: queueConversationForCommit2,
  sendMessageToPeer: sendMessageToPeer2,
  markMessagesCommitted: markMessagesCommitted2,
  processDataMessage = processPeerDataMessage,
  processChatMessage = processIncomingPeerChatMessage,
  processTypingMessage = processIncomingTypingMessage,
  processSyncNeedsChain = processSyncNeedsChainMessage,
  processSyncRequest = processSyncRequestMessage,
  processSyncChainRequest = processSyncChainRequestMessage,
  processSyncResponse = processSyncResponseMessage,
  processCommittedMessages = processCommittedMessagesMessage,
  log: log2 = () => {
  },
  warn = () => {
  }
}) {
  const handleSyncNeedsChain = (message, fromPeerId) => processSyncNeedsChain({
    message,
    fromPeerId,
    conversationsMap: getConversations(),
    repoFullName: getRepoFullName(),
    sendMessageToPeer: sendMessageToPeer2
  });
  const handleChatMessage = (message, fromUsername, fromPeerId) => {
    log2("[PeerJS] Received chat message from", fromUsername, "(", fromPeerId, "):", message);
    return processChatMessage({
      message,
      fromUsername,
      fromPeerId,
      localPeerId: getLocalPeerId2(),
      repoFullName: getRepoFullName(),
      appendMessage: appendMessage2,
      setLastMessage: setLastMessage2,
      updateContact: updateContact2,
      isLeader,
      getCurrentLeader: getCurrentLeader2,
      queueConversationForCommit: queueConversationForCommit2,
      log: log2,
      warn
    });
  };
  const handlePresenceMessage = (message, fromUsername) => {
    log2("[PeerJS] Received presence message from", fromUsername, ":", message);
  };
  const handleTypingMessage = (message, fromUsername, fromPeerId) => {
    log2("[PeerJS] Received typing message from", fromUsername, "(", fromPeerId, "):", message);
    return processTypingMessage({
      message,
      fromUsername,
      fromPeerId,
      updateTypingUsers,
      log: log2,
      warn
    });
  };
  const handleSyncRequest = (message, fromPeerId) => processSyncRequest({
    message,
    fromPeerId,
    conversationsMap: getConversations(),
    repoFullName: getRepoFullName(),
    sendMessageToPeer: sendMessageToPeer2,
    log: log2,
    warn
  });
  const handleSyncRequestWithChain = (message, fromPeerId) => processSyncChainRequest({
    message,
    fromPeerId,
    conversationsMap: getConversations(),
    repoFullName: getRepoFullName(),
    sendMessageToPeer: sendMessageToPeer2,
    log: log2,
    warn
  });
  const handleSyncResponse = (message, fromPeerId) => {
    var _a2;
    log2("[PeerJS] Received sync response from", fromPeerId, "with", ((_a2 = message.messages) == null ? void 0 : _a2.length) || 0, "messages");
    return processSyncResponse({
      message,
      repoFullName: getRepoFullName(),
      appendMessages: appendMessages2,
      isLeader,
      queueConversationForCommit: queueConversationForCommit2,
      log: log2,
      warn
    });
  };
  const handleCommittedMessages = (message, fromPeerId) => processCommittedMessages({
    message,
    fromPeerId,
    markMessagesCommitted: markMessagesCommitted2,
    log: log2
  });
  const handlePeerMessage = (data, fromPeerId, fromUsername = null) => processDataMessage({
    data,
    fromPeerId,
    fromUsername,
    connections: getConnections(),
    handlers: {
      chat: handleChatMessage,
      presence: handlePresenceMessage,
      typing: handleTypingMessage,
      syncRequest: handleSyncRequest,
      syncRequestChain: handleSyncRequestWithChain,
      syncResponse: handleSyncResponse,
      syncNeedsChain: handleSyncNeedsChain,
      messagesCommitted: handleCommittedMessages
    },
    log: log2,
    warn
  });
  return {
    handlePeerMessage,
    handleChatMessage,
    handlePresenceMessage,
    handleTypingMessage,
    handleSyncNeedsChain,
    handleSyncRequest,
    handleSyncRequestWithChain,
    handleSyncResponse,
    handleCommittedMessages
  };
}
function bindPeerManagerEvents(peer, {
  startPeerDiscovery,
  initializeCallHandling,
  handleIncomingConnection,
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  return bindPeerEvents(peer, {
    open: (id) => {
      log2("[PeerJS] Connected to PeerJS server with ID:", id);
      startPeerDiscovery();
      initializeCallHandling();
    },
    connection: (connection) => {
      log2("[PeerJS] ✅ Incoming connection from:", connection.peer, "metadata:", connection.metadata);
      handleIncomingConnection(connection);
    },
    error: (error) => {
      reportError("[PeerJS] Peer error:", error);
    },
    disconnected: () => {
      log2("[PeerJS] Disconnected from PeerJS server");
    },
    close: () => {
      log2("[PeerJS] Peer connection closed");
    }
  });
}
function createPeerManagerLifecycleController({
  PeerClass,
  generatePeerId: generatePeerId2,
  getLocalPeer,
  setLocalPeer,
  getLocalUsername,
  setLocalUsername,
  getRepoFullName,
  setRepoFullName,
  getSessionId,
  setSessionId,
  getHealthCheckInterval,
  setHealthCheckInterval,
  getLeadershipPeer,
  setLeadershipPeer,
  getConnectedToLeader,
  setConnectedToLeader,
  setCurrentLeader,
  getPeerRegistry,
  getPeerConnections,
  peerStores: peerStores2,
  getFailedConnections,
  shutdownDiscovery,
  stopLeaderCommitInterval,
  startPeerDiscovery,
  initializeCallHandling,
  handleIncomingConnection,
  bindManagerEvents = bindPeerManagerEvents,
  createSession = createPeerManagerSession,
  isSameSession = isSameOpenPeerSession,
  closeTimer = clearTimer,
  closeOpenPeerConnections = closeOpenConnections,
  closeLeaderConnection = closeConnection,
  destroyPeerInstance = destroyPeer,
  resetStores = resetPeerStores,
  log: log2 = () => {
  },
  reportError = () => {
  }
}) {
  const getLocalSessionId = () => getSessionId();
  const getLocalPeerId2 = () => {
    var _a2;
    return (_a2 = getLocalPeer()) == null ? void 0 : _a2.id;
  };
  const shutdownPeerManager2 = () => {
    if (shutdownDiscovery) {
      shutdownDiscovery();
    } else {
      setHealthCheckInterval(closeTimer(getHealthCheckInterval()));
      setLeadershipPeer(destroyPeerInstance(getLeadershipPeer()));
      setConnectedToLeader(closeLeaderConnection(getConnectedToLeader()));
      setCurrentLeader(false);
      getPeerRegistry().clear();
    }
    closeOpenPeerConnections(getPeerConnections());
    setLocalPeer(destroyPeerInstance(getLocalPeer()));
    resetStores(peerStores2);
    getFailedConnections().clear();
    stopLeaderCommitInterval();
  };
  const initializePeerManager2 = ({ _token, _repoFullName, _username, _sessionId }) => {
    log2("[PeerJS] Initializing peer manager:", { _repoFullName, _username, _sessionId });
    if (isSameSession(getLocalPeer(), getRepoFullName(), getSessionId(), _repoFullName, _sessionId)) {
      log2("[PeerJS] Already connected to this repo with same session, skipping initialization");
      return "same_session";
    }
    if (getLocalPeer()) {
      log2("[PeerJS] Switching from", getRepoFullName(), "to", _repoFullName, "or session changed");
      shutdownPeerManager2();
    }
    const nextSession = createSession(_repoFullName, _username, _sessionId, generatePeerId2);
    setLocalUsername(nextSession.username);
    setRepoFullName(nextSession.repoFullName);
    setSessionId(nextSession.sessionId);
    log2("[PeerJS] Generated peer ID:", nextSession.peerId);
    const peer = new PeerClass(nextSession.peerId, nextSession.peerOptions);
    setLocalPeer(peer);
    bindManagerEvents(peer, {
      startPeerDiscovery,
      initializeCallHandling,
      handleIncomingConnection,
      log: log2,
      reportError
    });
    return peer;
  };
  return {
    getLocalSessionId,
    getLocalPeerId: getLocalPeerId2,
    shutdownPeerManager: shutdownPeerManager2,
    initializePeerManager: initializePeerManager2
  };
}
function createPeerManagerRuntime({
  PeerClass,
  authStore: authStore2,
  conversations: conversations2,
  committedEvents: committedEvents2,
  appendMessage: appendMessage2,
  appendMessages: appendMessages2,
  markMessagesCommitted: markMessagesCommitted2,
  queueConversationForCommit: queueConversationForCommit2,
  flushConversationCommitQueue: flushConversationCommitQueue2,
  loadContacts: loadContacts2,
  updateContact: updateContact2,
  setLastMessage: setLastMessage2,
  peerStores: peerStores2,
  callStores,
  resetCallState: resetCallState2,
  getStoreValue = get$1,
  getStorage = () => localStorage,
  getMediaDevices = () => navigator.mediaDevices,
  getAlertUser = () => alert,
  log: log2 = console.log,
  warn = console.warn,
  reportError = console.error
}) {
  const { peerConnections: peerConnections2, onlinePeers: onlinePeers2, typingUsers: typingUsers2 } = peerStores2;
  let localPeer = null;
  let localUsername = null;
  let repoFullName = null;
  let sessionId = null;
  let failedConnections = /* @__PURE__ */ new Set();
  let connectionController = null;
  const getConnections = () => getStoreValue(peerConnections2);
  const getConversations = () => getStoreValue(conversations2);
  function startPeerDiscovery() {
    log2("[PeerJS] Peer manager initialized for repo:", repoFullName);
    log2("[PeerJS] Peer ID:", localPeer.id);
    initializeDiscoverySystem();
  }
  const discoveryController = createPeerDiscoveryController({
    PeerClass,
    getAuth: () => getStoreValue(authStore2),
    getLocalPeer: () => localPeer,
    getLocalPeerId: () => localPeer.id,
    getLocalUsername: () => localUsername,
    getRepoFullName: () => repoFullName,
    getConnections,
    getFailedConnections: () => failedConnections,
    getStorage,
    loadContacts: loadContacts2,
    updateContact: updateContact2,
    connectToPeer,
    log: log2,
    warn
  });
  const messageActions = createPeerMessageActionsController({
    getConnections,
    getConversations,
    getRepoFullName: () => repoFullName,
    getStorage,
    getOrgId,
    log: log2,
    warn,
    error: reportError
  });
  const conversationController = createPeerConversationController({
    getLocalPeerId: () => localPeer == null ? void 0 : localPeer.id,
    getConnections,
    getCurrentDiscoveryLeader: discoveryController.isCurrentLeader,
    getPeerRegistry: discoveryController.getPeerRegistry,
    getLeaderConnection: discoveryController.getConnectedToLeader,
    flushCommitQueue: flushConversationCommitQueue2,
    committedEvents: committedEvents2,
    broadcastToAllPeers: messageActions.broadcastToAllPeers,
    log: log2
  });
  const callController = createPeerCallController({
    getLocalPeer: () => localPeer,
    getLocalUsername: () => localUsername,
    getMediaDevices,
    getAlertUser,
    getStoreValue,
    stores: callStores,
    resetCallState: resetCallState2,
    log: log2,
    warn,
    reportError
  });
  const messageController = createPeerMessageController({
    getConnections,
    getConversations,
    getLocalPeerId: () => localPeer == null ? void 0 : localPeer.id,
    getRepoFullName: () => repoFullName,
    appendMessage: appendMessage2,
    appendMessages: appendMessages2,
    setLastMessage: setLastMessage2,
    updateContact: updateContact2,
    updateTypingUsers: typingUsers2.update,
    isLeader: conversationController.isLeader,
    getCurrentLeader: conversationController.getCurrentLeader,
    queueConversationForCommit: queueConversationForCommit2,
    sendMessageToPeer: messageActions.sendMessageToPeer,
    markMessagesCommitted: markMessagesCommitted2,
    log: log2,
    warn
  });
  connectionController = createPeerConnectionController({
    getLocalPeer: () => localPeer,
    getLocalUsername: () => localUsername,
    getRepoFullName: () => repoFullName,
    getSessionId: () => sessionId,
    getConnections,
    getConversations,
    getPeerRegistry: discoveryController.getPeerRegistry,
    getCurrentDiscoveryLeader: discoveryController.isCurrentLeader,
    getFailedConnections: () => failedConnections,
    updatePeerConnections: peerConnections2.update,
    setOnlinePeers: onlinePeers2.set,
    updateTypingUsers: typingUsers2.update,
    updateContact: updateContact2,
    requestMessageSync: messageActions.requestMessageSync,
    handlePeerMessage: messageController.handlePeerMessage,
    broadcastPeerListUpdate: discoveryController.broadcastPeerListUpdate,
    log: log2,
    reportError
  });
  const lifecycleController = createPeerManagerLifecycleController({
    PeerClass,
    generatePeerId,
    getLocalPeer: () => localPeer,
    setLocalPeer: (peer) => {
      localPeer = peer;
    },
    getLocalUsername: () => localUsername,
    setLocalUsername: (username) => {
      localUsername = username;
    },
    getRepoFullName: () => repoFullName,
    setRepoFullName: (repoName) => {
      repoFullName = repoName;
    },
    getSessionId: () => sessionId,
    setSessionId: (nextSessionId) => {
      sessionId = nextSessionId;
    },
    shutdownDiscovery: discoveryController.shutdownDiscovery,
    getPeerConnections: getConnections,
    peerStores: peerStores2,
    getFailedConnections: () => failedConnections,
    stopLeaderCommitInterval: conversationController.stopLeaderCommitInterval,
    startPeerDiscovery,
    initializeCallHandling,
    handleIncomingConnection,
    log: log2,
    reportError
  });
  async function initializeDiscoverySystem() {
    await discoveryController.initializeDiscoverySystem();
  }
  async function tryReconnectToLeader(orgId) {
    await discoveryController.reconnectToLeader(orgId);
  }
  function getLocalSessionId() {
    return lifecycleController.getLocalSessionId();
  }
  function getLocalPeerId2() {
    return lifecycleController.getLocalPeerId();
  }
  function shutdownPeerManager2() {
    return lifecycleController.shutdownPeerManager();
  }
  function initializePeerManager2(options) {
    return lifecycleController.initializePeerManager(options);
  }
  function handleIncomingConnection(conn) {
    return connectionController.handleIncomingConnection(conn);
  }
  function connectToPeer(targetPeerId, username) {
    return connectionController.connectToPeer(targetPeerId, username);
  }
  function handlePeerMessage(data, fromPeerId, fromUsername = null) {
    return messageController.handlePeerMessage(data, fromPeerId, fromUsername);
  }
  function sendMessageToPeer2(peerId, message) {
    return messageActions.sendMessageToPeer(peerId, message);
  }
  function broadcastMessage2(message, conversationId = null) {
    return messageActions.broadcastMessage(message, conversationId);
  }
  function broadcastToAllPeers(message) {
    return messageActions.broadcastToAllPeers(message);
  }
  function getCurrentLeader2() {
    return conversationController.getCurrentLeader();
  }
  function isLeader() {
    return conversationController.isLeader();
  }
  conversationController.subscribePeerConnectionChanges(peerConnections2);
  function requestMessageSync(peerId, conversationId, lastHash) {
    return messageActions.requestMessageSync(peerId, conversationId, lastHash);
  }
  function requestSyncWithHashChain(peerId, conversationId, hashChain) {
    return messageActions.requestSyncWithHashChain(peerId, conversationId, hashChain);
  }
  function broadcastTypingStatus2(isTyping) {
    return messageActions.broadcastTypingStatus(isTyping);
  }
  function updateMyConversations2(conversations3) {
    return conversationController.updateMyConversations(conversations3);
  }
  conversationController.subscribeCommittedMessages();
  function bindWindowUnload(targetWindow = typeof window !== "undefined" ? window : null) {
    if (!targetWindow) {
      return () => {
      };
    }
    const handleBeforeUnload = () => {
      if (discoveryController.isCurrentLeader()) {
        discoveryController.stepDownFromLeadership();
      }
      shutdownPeerManager2();
    };
    targetWindow.addEventListener("beforeunload", handleBeforeUnload);
    return () => targetWindow.removeEventListener("beforeunload", handleBeforeUnload);
  }
  function initializeCallHandling() {
    return callController.initializeCallHandling();
  }
  async function startCall2(peerId, video = true) {
    return callController.startCall(peerId, video);
  }
  async function answerCall2() {
    return callController.answerCall();
  }
  function endCall2() {
    return callController.endCall();
  }
  function toggleAudio2() {
    return callController.toggleAudio();
  }
  function toggleVideo2() {
    return callController.toggleVideo();
  }
  async function toggleScreenShare2() {
    return callController.toggleScreenShare();
  }
  return {
    getLocalSessionId,
    getLocalPeerId: getLocalPeerId2,
    shutdownPeerManager: shutdownPeerManager2,
    initializePeerManager: initializePeerManager2,
    connectToPeer,
    handlePeerMessage,
    sendMessageToPeer: sendMessageToPeer2,
    broadcastMessage: broadcastMessage2,
    broadcastToAllPeers,
    getCurrentLeader: getCurrentLeader2,
    isLeader,
    requestMessageSync,
    requestSyncWithHashChain,
    broadcastTypingStatus: broadcastTypingStatus2,
    updateMyConversations: updateMyConversations2,
    tryReconnectToLeader,
    bindWindowUnload,
    initializeCallHandling,
    startCall: startCall2,
    answerCall: answerCall2,
    endCall: endCall2,
    toggleAudio: toggleAudio2,
    toggleVideo: toggleVideo2,
    toggleScreenShare: toggleScreenShare2
  };
}
const callStatus = writable("idle");
const remoteStream = writable(null);
const localStream = writable(null);
const remotePeerId = writable(null);
const isVideoEnabled = writable(true);
const isAudioEnabled = writable(true);
const isScreenSharing = writable(false);
const isRecording = writable(false);
const callStartTime = writable(null);
function resetCallState() {
  callStatus.set("idle");
  remoteStream.set(null);
  localStream.set(null);
  remotePeerId.set(null);
  isVideoEnabled.set(true);
  isAudioEnabled.set(true);
  isScreenSharing.set(false);
  isRecording.set(false);
  callStartTime.set(null);
}
function createPeerManagerRuntimeDependencies({ PeerClass, peerStores: peerStores2 }) {
  return {
    PeerClass,
    authStore,
    conversations,
    committedEvents,
    appendMessage,
    appendMessages,
    markMessagesCommitted,
    queueConversationForCommit,
    flushConversationCommitQueue,
    loadContacts,
    updateContact,
    setLastMessage,
    peerStores: peerStores2,
    callStores: {
      callStatus,
      localStream,
      remoteStream,
      remotePeerId,
      isVideoEnabled,
      isAudioEnabled,
      isScreenSharing,
      callStartTime
    },
    resetCallState
  };
}
const peerStores = { peerConnections, onlinePeers, typingUsers };
const runtime = createPeerManagerRuntime(createPeerManagerRuntimeDependencies({
  PeerClass: $416260bce337df90$export$ecd1fc136c422448,
  peerStores
}));
runtime.bindWindowUnload();
function getLocalPeerId() {
  return runtime.getLocalPeerId();
}
function shutdownPeerManager() {
  return runtime.shutdownPeerManager();
}
function initializePeerManager(options) {
  return runtime.initializePeerManager(options);
}
function sendMessageToPeer(peerId, message) {
  return runtime.sendMessageToPeer(peerId, message);
}
function broadcastMessage(message, conversationId = null) {
  return runtime.broadcastMessage(message, conversationId);
}
function getCurrentLeader() {
  return runtime.getCurrentLeader();
}
function broadcastTypingStatus(isTyping) {
  return runtime.broadcastTypingStatus(isTyping);
}
function updateMyConversations(conversations2) {
  return runtime.updateMyConversations(conversations2);
}
async function startCall(peerId, video = true) {
  return runtime.startCall(peerId, video);
}
async function answerCall() {
  return runtime.answerCall();
}
function endCall() {
  return runtime.endCall();
}
function toggleAudio() {
  return runtime.toggleAudio();
}
function toggleVideo() {
  return runtime.toggleVideo();
}
async function toggleScreenShare() {
  return runtime.toggleScreenShare();
}
const CONTACTS_PATH = "contacts.json";
const REPO_NAME$1 = "skygit-config";
async function getSavedContacts(token, username) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME$1}/contents/${CONTACTS_PATH}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (response.status === 404) {
      return { contacts: [], favorites: [] };
    }
    if (!response.ok) {
      console.error("[Contacts] Failed to fetch contacts");
      return { contacts: [], favorites: [] };
    }
    const data = await response.json();
    return JSON.parse(atob(data.content));
  } catch (error) {
    console.error("[Contacts] Error fetching contacts:", error);
    return { contacts: [], favorites: [] };
  }
}
async function saveContacts(token, username, contactsData) {
  try {
    let sha = null;
    const getResponse = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME$1}/contents/${CONTACTS_PATH}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
    }
    const content = btoa(JSON.stringify(contactsData, null, 2));
    const putBody = {
      message: "Update contacts",
      content
    };
    if (sha) putBody.sha = sha;
    const putResponse = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME$1}/contents/${CONTACTS_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(putBody)
      }
    );
    return putResponse.ok;
  } catch (error) {
    console.error("[Contacts] Error saving contacts:", error);
    return false;
  }
}
async function addContact(token, username, contactUsername, nickname = null) {
  const data = await getSavedContacts(token, username);
  if (data.contacts.find((c) => c.username === contactUsername)) {
    return { success: false, error: "Contact already exists" };
  }
  data.contacts.push({
    username: contactUsername,
    nickname,
    addedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  const success = await saveContacts(token, username, data);
  return { success, error: success ? null : "Failed to save contact" };
}
async function toggleFavorite(token, username, contactUsername) {
  const data = await getSavedContacts(token, username);
  if (data.favorites.includes(contactUsername)) {
    data.favorites = data.favorites.filter((f) => f !== contactUsername);
  } else {
    data.favorites.push(contactUsername);
  }
  return await saveContacts(token, username, data);
}
async function searchGitHubUsers(token, query) {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=10`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.items.map((user) => ({
      username: user.login,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url
    }));
  } catch (error) {
    console.error("[Contacts] Error searching users:", error);
    return [];
  }
}
var root_3$9 = /* @__PURE__ */ from_html(`<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>`);
var root_4$8 = /* @__PURE__ */ from_html(`<span class="text-green-600">Online</span>`);
var root_2$f = /* @__PURE__ */ from_html(`<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 group"><div class="relative flex-shrink-0"><img class="w-10 h-10 rounded-full"/> <!></div> <div class="flex-1 min-w-0"><div class="font-medium text-gray-900 truncate"> </div> <div class="text-xs text-gray-500"><!></div></div> <div class="hidden group-hover:flex items-center gap-1"><button class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Call"><!></button> <button class="p-1.5 text-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 rounded" title="Remove from favorites"><!></button></div></div>`);
var root_1$h = /* @__PURE__ */ from_html(`<div><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><!> Favorites</h3> <div class="space-y-1"></div></div>`);
var root_7$6 = /* @__PURE__ */ from_html(`<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 group"><div class="relative flex-shrink-0"><img class="w-10 h-10 rounded-full"/> <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div></div> <div class="flex-1 min-w-0"><div class="font-medium text-gray-900 truncate"> </div> <div class="text-xs text-green-600">Online</div></div> <div class="hidden group-hover:flex items-center gap-1"><button class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Call"><!></button> <button class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded" title="Add to favorites"><!></button></div></div>`);
var root_6$6 = /* @__PURE__ */ from_html(`<div><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"> </h3> <div class="space-y-1"></div></div>`);
var root_9$7 = /* @__PURE__ */ from_html(`<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 group opacity-60"><div class="relative flex-shrink-0"><img class="w-10 h-10 rounded-full grayscale"/> <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div></div> <div class="flex-1 min-w-0"><div class="font-medium text-gray-900 truncate"> </div> <div class="text-xs text-gray-500"> </div></div> <div class="hidden group-hover:flex items-center gap-1"><button class="p-1.5 text-gray-300 cursor-not-allowed rounded" disabled="" title="User is offline"><!></button> <button class="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded" title="Add to favorites"><!></button></div></div>`);
var root_8$5 = /* @__PURE__ */ from_html(`<div><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"> </h3> <div class="space-y-1"></div></div>`);
var root_12$2 = /* @__PURE__ */ from_html(`<div class="text-center py-8"><!> <p class="text-sm text-gray-500">No contacts found</p> <p class="text-xs text-gray-400 mt-1">Connect to peers to see contacts</p> <button class="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"><!> Add Contact</button></div>`);
var root_14$3 = /* @__PURE__ */ from_html(`<div class="flex items-center justify-center py-4"><div class="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>`);
var root_16$3 = /* @__PURE__ */ from_html(`<div class="flex items-center gap-3 p-2 rounded-lg border hover:border-blue-300"><img class="w-10 h-10 rounded-full"/> <div class="flex-1"><div class="font-medium"> </div></div> <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Add</button></div>`);
var root_15$3 = /* @__PURE__ */ from_html(`<div class="space-y-2"></div>`);
var root_17$3 = /* @__PURE__ */ from_html(`<p class="text-center text-gray-500 py-4">No users found</p>`);
var root_18$2 = /* @__PURE__ */ from_html(`<p class="text-center text-gray-400 py-4 text-sm">Type at least 2 characters to search</p>`);
var root_13$2 = /* @__PURE__ */ from_html(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Dismiss add contact modal"></button> <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6"><button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close add contact modal"><!></button> <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><!> Add Contact</h2> <div class="relative mb-4"><!> <input type="text" placeholder="Search GitHub users..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/></div> <div class="max-h-64 overflow-y-auto"><!></div></div></div>`);
var root$h = /* @__PURE__ */ from_html(`<div class="p-4"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2"><!> Contacts</h2> <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Add contact"><!></button></div> <div class="space-y-4"><!> <!> <!> <!></div></div> <!>`, 1);
function SidebarContacts($$anchor, $$props) {
  push($$props, false);
  const $sortedContacts = () => store_get(sortedContacts, "$sortedContacts", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  const mergedContacts = /* @__PURE__ */ mutable_source();
  const favoriteContacts = /* @__PURE__ */ mutable_source();
  const onlineContacts = /* @__PURE__ */ mutable_source();
  const offlineContacts = /* @__PURE__ */ mutable_source();
  let currentOrgId = "";
  let savedContacts = /* @__PURE__ */ mutable_source({ contacts: [], favorites: [] });
  let searchQuery2 = /* @__PURE__ */ mutable_source("");
  let searchResults = /* @__PURE__ */ mutable_source([]);
  let searching = /* @__PURE__ */ mutable_source(false);
  let showAddModal = /* @__PURE__ */ mutable_source(false);
  onMount(async () => {
    var _a2;
    const repos = get$1(repoList);
    if (repos.length > 0) {
      currentOrgId = repos[0].full_name.split("/")[0];
      loadContacts(currentOrgId);
    }
    const auth = get$1(authStore);
    if ((auth == null ? void 0 : auth.token) && ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
      set(savedContacts, await getSavedContacts(auth.token, auth.user.login));
    }
    const interval = setInterval(updateContactsOnlineStatus, 5e3);
    return () => clearInterval(interval);
  });
  function formatLastSeen(timestamp) {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now2 = /* @__PURE__ */ new Date();
    const diffMs = now2 - date;
    const diffMins = Math.floor(diffMs / 6e4);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  }
  async function handleCall(contact) {
    if (contact.online) {
      const sessionId = contact.session_id || `${contact.username}_default`;
      startCall(sessionId);
    }
  }
  async function handleToggleFavorite(contact) {
    var _a2;
    const auth = get$1(authStore);
    if ((auth == null ? void 0 : auth.token) && ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
      await toggleFavorite(auth.token, auth.user.login, contact.username);
      set(savedContacts, await getSavedContacts(auth.token, auth.user.login));
    }
  }
  async function handleAddContact(username) {
    var _a2;
    const auth = get$1(authStore);
    if ((auth == null ? void 0 : auth.token) && ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
      await addContact(auth.token, auth.user.login, username);
      set(savedContacts, await getSavedContacts(auth.token, auth.user.login));
      set(showAddModal, false);
      set(searchQuery2, "");
      set(searchResults, []);
    }
  }
  async function handleSearch() {
    if (get(searchQuery2).length < 2) {
      set(searchResults, []);
      return;
    }
    set(searching, true);
    const auth = get$1(authStore);
    if (auth == null ? void 0 : auth.token) {
      set(searchResults, await searchGitHubUsers(auth.token, get(searchQuery2)));
    }
    set(searching, false);
  }
  let searchTimeout = /* @__PURE__ */ mutable_source();
  legacy_pre_effect(() => ($sortedContacts(), get(savedContacts)), () => {
    set(mergedContacts, $sortedContacts().map((contact) => {
      var _a2;
      return {
        ...contact,
        isSaved: get(savedContacts).contacts.some((c) => c.username.toLowerCase() === contact.username.toLowerCase()),
        isFavorite: get(savedContacts).favorites.some((f) => f.toLowerCase() === contact.username.toLowerCase()),
        nickname: (_a2 = get(savedContacts).contacts.find((c) => c.username.toLowerCase() === contact.username.toLowerCase())) == null ? void 0 : _a2.nickname
      };
    }));
  });
  legacy_pre_effect(() => get(mergedContacts), () => {
    set(favoriteContacts, get(mergedContacts).filter((c) => c.isFavorite));
  });
  legacy_pre_effect(() => get(mergedContacts), () => {
    set(onlineContacts, get(mergedContacts).filter((c) => c.online && !c.isFavorite));
  });
  legacy_pre_effect(() => get(mergedContacts), () => {
    set(offlineContacts, get(mergedContacts).filter((c) => !c.online && !c.isFavorite));
  });
  legacy_pre_effect(() => get(searchTimeout), () => {
    clearTimeout(get(searchTimeout));
    set(searchTimeout, setTimeout(handleSearch, 300));
  });
  legacy_pre_effect_reset();
  init();
  var fragment = root$h();
  var div = first_child(fragment);
  var div_1 = child(div);
  var h2 = child(div_1);
  var node = child(h2);
  Users(node, { size: 20, class: "text-blue-600" });
  var button = sibling(h2, 2);
  var node_1 = child(button);
  User_plus(node_1, { size: 20 });
  var div_2 = sibling(div_1, 2);
  var node_2 = child(div_2);
  {
    var consequent_2 = ($$anchor2) => {
      var div_3 = root_1$h();
      var h3 = child(div_3);
      var node_3 = child(h3);
      Star(node_3, { size: 12, class: "text-yellow-500" });
      var div_4 = sibling(h3, 2);
      each(div_4, 5, () => get(favoriteContacts), (contact) => contact.username, ($$anchor3, contact) => {
        var div_5 = root_2$f();
        var div_6 = child(div_5);
        var img = child(div_6);
        var node_4 = sibling(img, 2);
        {
          var consequent = ($$anchor4) => {
            var div_7 = root_3$9();
            append($$anchor4, div_7);
          };
          if_block(node_4, ($$render) => {
            if (get(contact), untrack(() => get(contact).online)) $$render(consequent);
          });
        }
        var div_8 = sibling(div_6, 2);
        var div_9 = child(div_8);
        var text$1 = child(div_9);
        var div_10 = sibling(div_9, 2);
        var node_5 = child(div_10);
        {
          var consequent_1 = ($$anchor4) => {
            var span = root_4$8();
            append($$anchor4, span);
          };
          var alternate = ($$anchor4) => {
            var text_1 = text();
            template_effect(($0) => set_text(text_1, $0), [
              () => (get(contact), untrack(() => formatLastSeen(get(contact).lastSeen)))
            ]);
            append($$anchor4, text_1);
          };
          if_block(node_5, ($$render) => {
            if (get(contact), untrack(() => get(contact).online)) $$render(consequent_1);
            else $$render(alternate, -1);
          });
        }
        var div_11 = sibling(div_8, 2);
        var button_1 = child(div_11);
        var node_6 = child(button_1);
        Phone(node_6, { size: 16 });
        var button_2 = sibling(button_1, 2);
        var node_7 = child(button_2);
        Star(node_7, { size: 16, fill: "currentColor" });
        template_effect(() => {
          set_attribute(img, "src", `https://github.com/${(get(contact), untrack(() => get(contact).username)) ?? ""}.png`);
          set_attribute(img, "alt", (get(contact), untrack(() => get(contact).username)));
          set_text(text$1, (get(contact), untrack(() => get(contact).nickname || get(contact).username)));
          button_1.disabled = (get(contact), untrack(() => !get(contact).online));
        });
        event("click", button_1, stopPropagation(() => handleCall(get(contact))));
        event("click", button_2, stopPropagation(() => handleToggleFavorite(get(contact))));
        append($$anchor3, div_5);
      });
      append($$anchor2, div_3);
    };
    if_block(node_2, ($$render) => {
      if (get(favoriteContacts), untrack(() => get(favoriteContacts).length > 0)) $$render(consequent_2);
    });
  }
  var node_8 = sibling(node_2, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var div_12 = root_6$6();
      var h3_1 = child(div_12);
      var text_2 = child(h3_1);
      var div_13 = sibling(h3_1, 2);
      each(div_13, 5, () => get(onlineContacts), (contact) => contact.username, ($$anchor3, contact) => {
        var div_14 = root_7$6();
        var div_15 = child(div_14);
        var img_1 = child(div_15);
        var div_16 = sibling(div_15, 2);
        var div_17 = child(div_16);
        var text_3 = child(div_17);
        var div_18 = sibling(div_16, 2);
        var button_3 = child(div_18);
        var node_9 = child(button_3);
        Phone(node_9, { size: 16 });
        var button_4 = sibling(button_3, 2);
        var node_10 = child(button_4);
        Star(node_10, { size: 16 });
        template_effect(() => {
          set_attribute(img_1, "src", `https://github.com/${(get(contact), untrack(() => get(contact).username)) ?? ""}.png`);
          set_attribute(img_1, "alt", (get(contact), untrack(() => get(contact).username)));
          set_text(text_3, (get(contact), untrack(() => get(contact).username)));
        });
        event("click", button_3, stopPropagation(() => handleCall(get(contact))));
        event("click", button_4, stopPropagation(() => handleToggleFavorite(get(contact))));
        append($$anchor3, div_14);
      });
      template_effect(() => set_text(text_2, `Online (${(get(onlineContacts), untrack(() => get(onlineContacts).length)) ?? ""})`));
      append($$anchor2, div_12);
    };
    if_block(node_8, ($$render) => {
      if (get(onlineContacts), untrack(() => get(onlineContacts).length > 0)) $$render(consequent_3);
    });
  }
  var node_11 = sibling(node_8, 2);
  {
    var consequent_5 = ($$anchor2) => {
      var div_19 = root_8$5();
      var h3_2 = child(div_19);
      var text_4 = child(h3_2);
      var div_20 = sibling(h3_2, 2);
      each(div_20, 5, () => get(offlineContacts), (contact) => contact.username, ($$anchor3, contact) => {
        var div_21 = root_9$7();
        var div_22 = child(div_21);
        var img_2 = child(div_22);
        var div_23 = sibling(div_22, 2);
        var div_24 = child(div_23);
        var text_5 = child(div_24);
        var div_25 = sibling(div_24, 2);
        var text_6 = child(div_25);
        var div_26 = sibling(div_23, 2);
        var button_5 = child(div_26);
        var node_12 = child(button_5);
        Phone(node_12, { size: 16 });
        var button_6 = sibling(button_5, 2);
        var node_13 = child(button_6);
        {
          var consequent_4 = ($$anchor4) => {
            Star($$anchor4, { size: 16, fill: "currentColor", class: "text-yellow-400" });
          };
          var alternate_1 = ($$anchor4) => {
            Star($$anchor4, { size: 16 });
          };
          if_block(node_13, ($$render) => {
            if (get(contact), untrack(() => get(contact).isFavorite)) $$render(consequent_4);
            else $$render(alternate_1, -1);
          });
        }
        template_effect(
          ($0) => {
            set_attribute(img_2, "src", `https://github.com/${(get(contact), untrack(() => get(contact).username)) ?? ""}.png`);
            set_attribute(img_2, "alt", (get(contact), untrack(() => get(contact).username)));
            set_text(text_5, (get(contact), untrack(() => get(contact).username)));
            set_text(text_6, $0);
          },
          [
            () => (get(contact), untrack(() => formatLastSeen(get(contact).lastSeen)))
          ]
        );
        event("click", button_6, stopPropagation(() => handleToggleFavorite(get(contact))));
        append($$anchor3, div_21);
      });
      template_effect(() => set_text(text_4, `Offline (${(get(offlineContacts), untrack(() => get(offlineContacts).length)) ?? ""})`));
      append($$anchor2, div_19);
    };
    if_block(node_11, ($$render) => {
      if (get(offlineContacts), untrack(() => get(offlineContacts).length > 0)) $$render(consequent_5);
    });
  }
  var node_14 = sibling(node_11, 2);
  {
    var consequent_6 = ($$anchor2) => {
      var div_27 = root_12$2();
      var node_15 = child(div_27);
      Users(node_15, { size: 48, class: "mx-auto mb-3 text-gray-300" });
      var button_7 = sibling(node_15, 6);
      var node_16 = child(button_7);
      User_plus(node_16, { size: 16, class: "inline mr-1" });
      event("click", button_7, () => set(showAddModal, true));
      append($$anchor2, div_27);
    };
    if_block(node_14, ($$render) => {
      if (get(mergedContacts), untrack(() => get(mergedContacts).length === 0)) $$render(consequent_6);
    });
  }
  var node_17 = sibling(div, 2);
  {
    var consequent_10 = ($$anchor2) => {
      var div_28 = root_13$2();
      var button_8 = child(div_28);
      var div_29 = sibling(button_8, 2);
      var button_9 = child(div_29);
      var node_18 = child(button_9);
      X(node_18, { size: 24 });
      var h2_1 = sibling(button_9, 2);
      var node_19 = child(h2_1);
      User_plus(node_19, { class: "text-blue-600" });
      var div_30 = sibling(h2_1, 2);
      var node_20 = child(div_30);
      Search(node_20, {
        size: 18,
        class: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      });
      var input = sibling(node_20, 2);
      var div_31 = sibling(div_30, 2);
      var node_21 = child(div_31);
      {
        var consequent_7 = ($$anchor3) => {
          var div_32 = root_14$3();
          append($$anchor3, div_32);
        };
        var consequent_8 = ($$anchor3) => {
          var div_33 = root_15$3();
          each(div_33, 5, () => get(searchResults), (user) => user.username, ($$anchor4, user) => {
            var div_34 = root_16$3();
            var img_3 = child(div_34);
            var div_35 = sibling(img_3, 2);
            var div_36 = child(div_35);
            var text_7 = child(div_36);
            var button_10 = sibling(div_35, 2);
            template_effect(() => {
              set_attribute(img_3, "src", (get(user), untrack(() => get(user).avatarUrl)));
              set_attribute(img_3, "alt", (get(user), untrack(() => get(user).username)));
              set_text(text_7, (get(user), untrack(() => get(user).username)));
            });
            event("click", button_10, () => handleAddContact(get(user).username));
            append($$anchor4, div_34);
          });
          append($$anchor3, div_33);
        };
        var consequent_9 = ($$anchor3) => {
          var p = root_17$3();
          append($$anchor3, p);
        };
        var alternate_2 = ($$anchor3) => {
          var p_1 = root_18$2();
          append($$anchor3, p_1);
        };
        if_block(node_21, ($$render) => {
          if (get(searching)) $$render(consequent_7);
          else if (get(searchResults), untrack(() => get(searchResults).length > 0)) $$render(consequent_8, 1);
          else if (get(searchQuery2), untrack(() => get(searchQuery2).length >= 2)) $$render(consequent_9, 2);
          else $$render(alternate_2, -1);
        });
      }
      event("click", button_8, () => set(showAddModal, false));
      event("click", button_9, () => set(showAddModal, false));
      bind_value(input, () => get(searchQuery2), ($$value) => set(searchQuery2, $$value));
      append($$anchor2, div_28);
    };
    if_block(node_17, ($$render) => {
      if (get(showAddModal)) $$render(consequent_10);
    });
  }
  event("click", button, () => set(showAddModal, true));
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
const NOTIFICATIONS_PATH = "notifications.json";
const REPO_NAME = "skygit-config";
async function getNotifications(token, username) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (response.status === 404) {
      return { notifications: [], unreadCount: 0 };
    }
    if (!response.ok) {
      console.error("[Notifications] Failed to fetch");
      return { notifications: [], unreadCount: 0 };
    }
    const data = await response.json();
    const content = JSON.parse(atob(data.content));
    const unreadCount = content.notifications.filter((n) => !n.read).length;
    return { ...content, unreadCount };
  } catch (error) {
    console.error("[Notifications] Error:", error);
    return { notifications: [], unreadCount: 0 };
  }
}
async function sendNotification(token, recipientUsername, notification) {
  try {
    let existingNotifications = [];
    let sha = null;
    const getResponse = await fetch(
      `https://api.github.com/repos/${recipientUsername}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
      const content2 = JSON.parse(atob(data.content));
      existingNotifications = content2.notifications || [];
    } else if (getResponse.status !== 404) {
      console.warn("[Notifications] Cannot access recipient repo - they may not have SkyGit set up");
      return { success: false, error: "Cannot access recipient notifications" };
    }
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ...notification,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      read: false
    };
    const allNotifications = [newNotification, ...existingNotifications];
    const limitedNotifications = allNotifications.slice(0, 50);
    const content = btoa(JSON.stringify({ notifications: limitedNotifications }, null, 2));
    const putBody = {
      message: `Notification from ${notification.from}: ${notification.type}`,
      content
    };
    if (sha) putBody.sha = sha;
    const putResponse = await fetch(
      `https://api.github.com/repos/${recipientUsername}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(putBody)
      }
    );
    if (!putResponse.ok) {
      console.error("[Notifications] Failed to send notification");
      return { success: false, error: "Failed to send notification" };
    }
    return { success: true };
  } catch (error) {
    console.error("[Notifications] Error sending:", error);
    return { success: false, error: error.message };
  }
}
async function markAsRead(token, username, notificationId) {
  try {
    const data = await getNotifications(token, username);
    const notification = data.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
    return await saveNotifications(token, username, data.notifications);
  } catch (error) {
    console.error("[Notifications] Error marking as read:", error);
    return false;
  }
}
async function markAllAsRead(token, username) {
  try {
    const data = await getNotifications(token, username);
    data.notifications.forEach((n) => n.read = true);
    return await saveNotifications(token, username, data.notifications);
  } catch (error) {
    console.error("[Notifications] Error marking all as read:", error);
    return false;
  }
}
async function clearNotifications(token, username) {
  return await saveNotifications(token, username, []);
}
async function saveNotifications(token, username, notifications) {
  try {
    let sha = null;
    const getResponse = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    );
    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
    }
    const content = btoa(JSON.stringify({ notifications }, null, 2));
    const putBody = {
      message: "Update notifications",
      content
    };
    if (sha) putBody.sha = sha;
    const putResponse = await fetch(
      `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(putBody)
      }
    );
    return putResponse.ok;
  } catch (error) {
    console.error("[Notifications] Error saving:", error);
    return false;
  }
}
function createMessageNotification(fromUsername, preview) {
  return {
    type: "message",
    from: fromUsername,
    message: `New message from ${fromUsername}`,
    preview: preview == null ? void 0 : preview.substring(0, 50)
  };
}
var root_1$g = /* @__PURE__ */ from_html(`<span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"> </span>`);
var root_2$e = /* @__PURE__ */ from_html(`<button class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded" title="Mark all as read"><!></button> <button class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Clear all"><!></button>`, 1);
var root_3$8 = /* @__PURE__ */ from_html(`<div class="flex items-center justify-center py-8"><div class="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>`);
var root_4$7 = /* @__PURE__ */ from_html(`<div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg"> </div>`);
var root_5$7 = /* @__PURE__ */ from_html(`<div class="text-center py-8 text-gray-500"><!> <p class="text-sm">No notifications</p> <p class="text-xs mt-1">You're all caught up!</p></div>`);
var root_8$4 = /* @__PURE__ */ from_html(`<div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>`);
var root_9$6 = /* @__PURE__ */ from_html(`<p class="text-xs text-gray-500 mt-1 truncate"> </p>`);
var root_7$5 = /* @__PURE__ */ from_html(`<button type="button"><div class="flex-shrink-0 mt-0.5"><!></div> <div class="flex-1 min-w-0"><div class="flex items-start justify-between gap-2"><p> </p> <!></div> <!> <p class="text-xs text-gray-400 mt-1"> </p></div></button>`);
var root_6$5 = /* @__PURE__ */ from_html(`<div class="space-y-2"></div>`);
var root$g = /* @__PURE__ */ from_html(`<div class="p-4"><div class="flex items-center justify-between mb-4"><h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2"><!> Notifications <!></h2> <div class="flex items-center gap-1"><button class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Refresh"><!></button> <!></div></div> <!></div>`);
function SidebarNotifications($$anchor, $$props) {
  push($$props, false);
  let notifications = /* @__PURE__ */ mutable_source([]);
  let unreadCount = /* @__PURE__ */ mutable_source(0);
  let loading = /* @__PURE__ */ mutable_source(true);
  let error = /* @__PURE__ */ mutable_source(null);
  onMount(async () => {
    await fetchNotifications();
    const interval = setInterval(fetchNotifications, 3e4);
    return () => clearInterval(interval);
  });
  async function fetchNotifications() {
    var _a2;
    const auth = get$1(authStore);
    if (!(auth == null ? void 0 : auth.token) || !((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
      set(loading, false);
      return;
    }
    try {
      const data = await getNotifications(auth.token, auth.user.login);
      set(notifications, data.notifications);
      set(unreadCount, data.unreadCount);
      set(error, null);
    } catch (err) {
      console.error("[Notifications] Failed to fetch:", err);
      set(error, "Failed to load notifications");
    } finally {
      set(loading, false);
    }
  }
  async function handleMarkAsRead(notificationId) {
    var _a2;
    const auth = get$1(authStore);
    if ((auth == null ? void 0 : auth.token) && ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
      await markAsRead(auth.token, auth.user.login, notificationId);
      await fetchNotifications();
    }
  }
  async function handleMarkAllAsRead() {
    var _a2;
    const auth = get$1(authStore);
    if ((auth == null ? void 0 : auth.token) && ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
      await markAllAsRead(auth.token, auth.user.login);
      await fetchNotifications();
    }
  }
  async function handleClearAll() {
    var _a2;
    if (!confirm("Clear all notifications?")) return;
    const auth = get$1(authStore);
    if ((auth == null ? void 0 : auth.token) && ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
      await clearNotifications(auth.token, auth.user.login);
      await fetchNotifications();
    }
  }
  function getIcon(type) {
    switch (type) {
      case "missed_call":
        return Phone_missed;
      case "contact_request":
        return User_plus;
      case "message":
        return Message_square;
      default:
        return Bell;
    }
  }
  function getIconColor(type) {
    switch (type) {
      case "missed_call":
        return "text-red-500";
      case "contact_request":
        return "text-blue-500";
      case "message":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  }
  function formatTime(dateString) {
    const date = new Date(dateString);
    const now2 = /* @__PURE__ */ new Date();
    const diff = now2 - date;
    if (diff < 6e4) return "Just now";
    if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
    if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
    return date.toLocaleDateString();
  }
  init();
  var div = root$g();
  var div_1 = child(div);
  var h2 = child(div_1);
  var node = child(h2);
  Bell(node, { size: 20, class: "text-blue-600" });
  var node_1 = sibling(node, 2);
  {
    var consequent = ($$anchor2) => {
      var span = root_1$g();
      var text2 = child(span);
      template_effect(() => set_text(text2, get(unreadCount)));
      append($$anchor2, span);
    };
    if_block(node_1, ($$render) => {
      if (get(unreadCount) > 0) $$render(consequent);
    });
  }
  var div_2 = sibling(h2, 2);
  var button = child(div_2);
  var node_2 = child(button);
  Refresh_cw(node_2, { size: 16 });
  var node_3 = sibling(button, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment = root_2$e();
      var button_1 = first_child(fragment);
      var node_4 = child(button_1);
      Check_check(node_4, { size: 16 });
      var button_2 = sibling(button_1, 2);
      var node_5 = child(button_2);
      Trash_2(node_5, { size: 16 });
      event("click", button_1, handleMarkAllAsRead);
      event("click", button_2, handleClearAll);
      append($$anchor2, fragment);
    };
    if_block(node_3, ($$render) => {
      if (get(notifications).length > 0) $$render(consequent_1);
    });
  }
  var node_6 = sibling(div_1, 2);
  {
    var consequent_2 = ($$anchor2) => {
      var div_3 = root_3$8();
      append($$anchor2, div_3);
    };
    var consequent_3 = ($$anchor2) => {
      var div_4 = root_4$7();
      var text_1 = child(div_4);
      template_effect(() => set_text(text_1, get(error)));
      append($$anchor2, div_4);
    };
    var consequent_4 = ($$anchor2) => {
      var div_5 = root_5$7();
      var node_7 = child(div_5);
      Bell(node_7, { size: 48, class: "mx-auto mb-3 opacity-30" });
      append($$anchor2, div_5);
    };
    var alternate = ($$anchor2) => {
      var div_6 = root_6$5();
      each(div_6, 5, () => get(notifications), (notification) => notification.id, ($$anchor3, notification) => {
        var button_3 = root_7$5();
        var div_7 = child(button_3);
        var node_8 = child(div_7);
        {
          let $0 = /* @__PURE__ */ derived_safe_equal(() => getIconColor(get(notification).type));
          component(node_8, () => getIcon(get(notification).type), ($$anchor4, $$component) => {
            $$component($$anchor4, {
              size: 18,
              get class() {
                return get($0);
              }
            });
          });
        }
        var div_8 = sibling(div_7, 2);
        var div_9 = child(div_8);
        var p = child(div_9);
        var text_2 = child(p);
        var node_9 = sibling(p, 2);
        {
          var consequent_5 = ($$anchor4) => {
            var div_10 = root_8$4();
            append($$anchor4, div_10);
          };
          if_block(node_9, ($$render) => {
            if (!get(notification).read) $$render(consequent_5);
          });
        }
        var node_10 = sibling(div_9, 2);
        {
          var consequent_6 = ($$anchor4) => {
            var p_1 = root_9$6();
            var text_3 = child(p_1);
            template_effect(() => set_text(text_3, `"${get(notification).preview ?? ""}"`));
            append($$anchor4, p_1);
          };
          if_block(node_10, ($$render) => {
            if (get(notification).preview) $$render(consequent_6);
          });
        }
        var p_2 = sibling(node_10, 2);
        var text_4 = child(p_2);
        template_effect(
          ($0) => {
            set_class(button_3, 1, `w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer
            ${get(notification).read ? "bg-white border-gray-200" : "bg-blue-50 border-blue-200"}`);
            set_class(p, 1, `text-sm text-gray-800 ${get(notification).read ? "" : "font-medium"}`);
            set_text(text_2, get(notification).message);
            set_text(text_4, $0);
          },
          [() => formatTime(get(notification).createdAt)]
        );
        event("click", button_3, () => !get(notification).read && handleMarkAsRead(get(notification).id));
        append($$anchor3, button_3);
      });
      append($$anchor2, div_6);
    };
    if_block(node_6, ($$render) => {
      if (get(loading)) $$render(consequent_2);
      else if (get(error)) $$render(consequent_3, 1);
      else if (get(notifications).length === 0) $$render(consequent_4, 2);
      else $$render(alternate, -1);
    });
  }
  event("click", button, fetchNotifications);
  append($$anchor, div);
  pop();
}
function ChatsFilterCounter($$anchor, $$props) {
  push($$props, false);
  const $conversations = () => store_get(conversations, "$conversations", $$stores);
  const $searchQuery = () => store_get(searchQuery, "$searchQuery", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  const allConversations = /* @__PURE__ */ mutable_source();
  const filteredConversations = /* @__PURE__ */ mutable_source();
  legacy_pre_effect(() => $conversations(), () => {
    set(allConversations, Object.values($conversations()).flat());
  });
  legacy_pre_effect(() => (get(allConversations), $searchQuery()), () => {
    set(filteredConversations, get(allConversations).filter((convo) => {
      if (!$searchQuery() || $searchQuery().trim() === "") return true;
      const query = $searchQuery().toLowerCase();
      const title = (convo.title || `Conversation ${convo.id.slice(0, 6)}`).toLowerCase();
      const repo = convo.repo.toLowerCase();
      const fullName = `${repo}/${title}`;
      return title.includes(query) || repo.includes(query) || fullName.includes(query);
    }));
  });
  legacy_pre_effect(() => get(filteredConversations), () => {
    filteredChatsCount.set(get(filteredConversations).length);
  });
  legacy_pre_effect_reset();
  init();
  pop();
  $$cleanup();
}
function ReposFilterCounter($$anchor, $$props) {
  push($$props, false);
  const $repoList = () => store_get(repoList, "$repoList", $$stores);
  const $searchQuery = () => store_get(searchQuery, "$searchQuery", $$stores);
  const $currentRoute = () => store_get(currentRoute, "$currentRoute", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  const filteredRepos = /* @__PURE__ */ mutable_source();
  legacy_pre_effect(() => ($repoList(), $searchQuery()), () => {
    set(filteredRepos, $repoList().filter((repo) => {
      if (!$searchQuery() || $searchQuery().trim() === "") return true;
      const q = $searchQuery().toLowerCase();
      return repo.full_name.toLowerCase().includes(q) || repo.name.toLowerCase().includes(q) || repo.owner.toLowerCase().includes(q);
    }));
  });
  legacy_pre_effect(() => ($currentRoute(), get(filteredRepos)), () => {
    if ($currentRoute() !== "repos") {
      filteredCount.set(get(filteredRepos).length);
    }
  });
  legacy_pre_effect_reset();
  init();
  pop();
  $$cleanup();
}
function clickOutside(node, callback) {
  const handleClick = (event2) => {
    if (!node.contains(event2.target)) {
      callback();
    }
  };
  document.addEventListener("click", handleClick, true);
  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    }
  };
}
var root_1$f = /* @__PURE__ */ from_html(`<div class="absolute top-12 right-0 w-40 bg-white border border-gray-200 rounded shadow-md text-sm z-50"><button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button> <button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Help</button> <hr/> <button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Log out</button></div>`);
var root_4$6 = /* @__PURE__ */ from_html(`<div class="absolute top-0 right-1 -mt-1 -mr-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow"> </div>`);
var root_2$d = /* @__PURE__ */ from_html(`<button type="button"><div><!></div> <!> </button>`);
var root$f = /* @__PURE__ */ from_html(`<div class="p-4 relative h-full overflow-y-auto"><!> <!> <div class="flex items-center justify-between mb-4 relative"><div class="flex items-center gap-3"><img class="w-10 h-10 rounded-full" alt="avatar"/> <div><p class="font-semibold"> </p> <p class="text-xs text-gray-500"> </p></div></div> <button class="text-gray-500 hover:text-gray-700 text-lg font-bold" aria-label="Open menu">⋯</button> <!></div> <div class="relative mb-4"><input type="text" placeholder="Search repos and chats..." class="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-sm border border-gray-300 focus:outline-none"/> <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M10 2a8 8 0 015.29 13.71l4.5 4.5a1 1 0 01-1.42 1.42l-4.5-4.5A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z"></path></svg></div> <div class="flex justify-around mb-4 text-xs text-center"></div> <div><!></div></div>`);
function Sidebar($$anchor, $$props) {
  push($$props, false);
  const $searchQuery = () => store_get(searchQuery, "$searchQuery", $$stores);
  const $currentRoute = () => store_get(currentRoute, "$currentRoute", $$stores);
  const $filteredCount = () => store_get(filteredCount, "$filteredCount", $$stores);
  const $filteredChatsCount = () => store_get(filteredChatsCount, "$filteredChatsCount", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  let user = /* @__PURE__ */ mutable_source(null);
  let menuOpen = /* @__PURE__ */ mutable_source(false);
  function goToSettings() {
    currentRoute.set("settings");
  }
  function setActiveTab(tabId) {
    currentRoute.set(tabId);
  }
  authStore.subscribe((auth) => {
    set(user, auth.user);
  });
  const tabs = [
    { id: "chats", icon: Message_circle, label: "Chats" },
    { id: "repos", icon: Folder, label: "Repos" },
    { id: "calls", icon: Phone, label: "Calls" },
    { id: "contacts", icon: Users, label: "Contacts" },
    { id: "notifications", icon: Bell, label: "Notifs" }
  ];
  function toggleMenu() {
    set(menuOpen, !get(menuOpen));
  }
  function closeMenu() {
    set(menuOpen, false);
  }
  init();
  var div = root$f();
  var node = child(div);
  ChatsFilterCounter(node, {});
  var node_1 = sibling(node, 2);
  ReposFilterCounter(node_1, {});
  var div_1 = sibling(node_1, 2);
  var div_2 = child(div_1);
  var img = child(div_2);
  var div_3 = sibling(img, 2);
  var p = child(div_3);
  var text2 = child(p);
  var p_1 = sibling(p, 2);
  var text_1 = child(p_1);
  var button = sibling(div_2, 2);
  var node_2 = sibling(button, 2);
  {
    var consequent = ($$anchor2) => {
      var div_4 = root_1$f();
      var button_1 = child(div_4);
      var button_2 = sibling(button_1, 6);
      action(div_4, ($$node, $$action_arg) => clickOutside == null ? void 0 : clickOutside($$node, $$action_arg), () => closeMenu);
      event("click", button_1, goToSettings);
      event("click", button_2, function(...$$args) {
        logoutUser == null ? void 0 : logoutUser.apply(this, $$args);
      });
      append($$anchor2, div_4);
    };
    if_block(node_2, ($$render) => {
      if (get(menuOpen)) $$render(consequent);
    });
  }
  var div_5 = sibling(div_1, 2);
  var input = child(div_5);
  var div_6 = sibling(div_5, 2);
  each(div_6, 5, () => tabs, index, ($$anchor2, $$item) => {
    let id = () => get($$item).id;
    let Icon2 = () => get($$item).icon;
    let label = () => get($$item).label;
    var button_3 = root_2$d();
    let classes;
    var div_7 = child(button_3);
    var node_3 = child(div_7);
    Icon2()(node_3, { class: "w-5 h-5" });
    var node_4 = sibling(div_7, 2);
    {
      var consequent_2 = ($$anchor3) => {
        var fragment = comment();
        var node_5 = first_child(fragment);
        {
          var consequent_1 = ($$anchor4) => {
            var div_8 = root_4$6();
            var text_2 = child(div_8);
            template_effect(() => set_text(text_2, id() === "repos" ? $filteredCount() : $filteredChatsCount()));
            append($$anchor4, div_8);
          };
          if_block(node_5, ($$render) => {
            if (id() === "repos" && $filteredCount() > 0 || id() === "chats" && $filteredChatsCount() > 0) $$render(consequent_1);
          });
        }
        append($$anchor3, fragment);
      };
      var d = /* @__PURE__ */ user_derived(() => $searchQuery().trim() !== "");
      if_block(node_4, ($$render) => {
        if (get(d)) $$render(consequent_2);
      });
    }
    var text_3 = sibling(node_4);
    template_effect(() => {
      classes = set_class(button_3, 1, "relative flex flex-col items-center text-xs focus:outline-none", null, classes, { "text-blue-600": $currentRoute() === id() });
      set_class(div_7, 1, `w-10 h-10 rounded-full flex items-center justify-center ${$currentRoute() === id() ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 hover:text-blue-600"}`);
      set_text(text_3, ` ${label() ?? ""}`);
    });
    event("click", button_3, () => setActiveTab(id()));
    append($$anchor2, button_3);
  });
  var div_9 = sibling(div_6, 2);
  var node_6 = child(div_9);
  {
    var consequent_3 = ($$anchor2) => {
      SidebarChats($$anchor2, {
        get search() {
          return $searchQuery();
        }
      });
    };
    var consequent_4 = ($$anchor2) => {
      SidebarRepos($$anchor2, {
        get search() {
          return $searchQuery();
        }
      });
    };
    var consequent_5 = ($$anchor2) => {
      SidebarCalls($$anchor2, {});
    };
    var consequent_6 = ($$anchor2) => {
      SidebarContacts($$anchor2, {});
    };
    var consequent_7 = ($$anchor2) => {
      SidebarNotifications($$anchor2, {});
    };
    if_block(node_6, ($$render) => {
      if ($currentRoute() === "chats") $$render(consequent_3);
      else if ($currentRoute() === "repos") $$render(consequent_4, 1);
      else if ($currentRoute() === "calls") $$render(consequent_5, 2);
      else if ($currentRoute() === "contacts") $$render(consequent_6, 3);
      else if ($currentRoute() === "notifications") $$render(consequent_7, 4);
    });
  }
  template_effect(() => {
    var _a2, _b2, _c2, _d;
    set_attribute(img, "src", (_a2 = get(user)) == null ? void 0 : _a2.avatar_url);
    set_text(text2, ((_b2 = get(user)) == null ? void 0 : _b2.name) || ((_c2 = get(user)) == null ? void 0 : _c2.login));
    set_text(text_1, `@${((_d = get(user)) == null ? void 0 : _d.login) ?? ""}`);
  });
  event("click", button, toggleMenu);
  bind_value(input, $searchQuery, ($$value) => store_set(searchQuery, $$value));
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root_1$e = /* @__PURE__ */ from_html(`<button class="p-2 text-gray-700 text-xl rounded bg-white shadow" aria-label="Open sidebar">←</button>`);
var root$e = /* @__PURE__ */ from_html(`<div class="layout svelte-1325jhu"><div class="p-2 md:hidden"><!></div> <div><!></div> <div><!></div></div>`);
function Layout($$anchor, $$props) {
  push($$props, false);
  let sidebarVisible = /* @__PURE__ */ mutable_source(false);
  function handleSidebarToggle(event2) {
    set(sidebarVisible, event2.detail.open);
  }
  authStore.subscribe((auth) => {
    auth.user;
  });
  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        set(sidebarVisible, false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });
  currentContent.subscribe((content) => {
    if (content && window.innerWidth < 768) {
      set(sidebarVisible, false);
    }
  });
  init();
  var div = root$e();
  var div_1 = child(div);
  var node = child(div_1);
  {
    var consequent = ($$anchor2) => {
      var button = root_1$e();
      event("click", button, () => set(sidebarVisible, true));
      append($$anchor2, button);
    };
    if_block(node, ($$render) => {
      if (!get(sidebarVisible)) $$render(consequent);
    });
  }
  var div_2 = sibling(div_1, 2);
  let classes;
  var node_1 = child(div_2);
  Sidebar(node_1, { $$events: { toggle: handleSidebarToggle } });
  var div_3 = sibling(div_2, 2);
  let classes_1;
  var node_2 = child(div_3);
  slot(node_2, $$props, "default", {});
  template_effect(() => {
    classes = set_class(div_2, 1, "sidebar md:block svelte-1325jhu", null, classes, { hidden: !get(sidebarVisible), open: get(sidebarVisible) });
    classes_1 = set_class(div_3, 1, "main w-full svelte-1325jhu", null, classes_1, { hidden: get(sidebarVisible) });
  });
  append($$anchor, div);
  pop();
}
var root_1$d = /* @__PURE__ */ from_html(`<p class="text-gray-400 italic text-center mt-20">Welcome to skygit.</p>`);
function Home($$anchor) {
  Layout($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var p = root_1$d();
      append($$anchor2, p);
    },
    $$slots: { default: true }
  });
}
function handleGoogleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state2 = params.get("state");
  const error = params.get("error");
  if (error) {
    if (window.opener) {
      window.opener.postMessage({
        type: "google-auth-error",
        error
      }, window.location.origin);
    }
    return;
  }
  if (code && state2) {
    if (window.opener) {
      window.opener.postMessage({
        type: "google-auth-success",
        code,
        state: state2
      }, window.location.origin);
    }
  }
}
function isOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  return params.has("code") && params.has("state");
}
const GOOGLE_DRIVE_SETUP_STEPS = [1, 2, 3, 4, 5, 6, 7, 8];
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const GOOGLE_OAUTH_PLAYGROUND_URL = "https://developers.google.com/oauthplayground";
function createInitialGoogleDriveCredentials() {
  return {
    client_id: "",
    client_secret: "",
    refresh_token: "",
    folder_url: ""
  };
}
function getSuggestedGoogleDriveFolderName(auth) {
  var _a2;
  const username = ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login) || "user";
  return `SkyGit-${username}`;
}
function getAppBaseUrl(location2) {
  const { protocol, hostname, port } = location2;
  return `${protocol}//${hostname}${port ? ":" + port : ""}`;
}
function buildGoogleDriveAuthorizationUrl({ clientId, redirectUri }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_DRIVE_SCOPE,
    access_type: "offline",
    prompt: "consent"
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
function buildGoogleDriveTokenExchangeScript({
  clientId = "YOUR_CLIENT_ID",
  clientSecret = "YOUR_CLIENT_SECRET",
  authorizationCode = "YOUR_AUTH_CODE"
} = {}) {
  return `import requests

CLIENT_ID = "${clientId || "YOUR_CLIENT_ID"}"
CLIENT_SECRET = "${clientSecret || "YOUR_CLIENT_SECRET"}"
AUTH_CODE = "${authorizationCode || "YOUR_AUTH_CODE"}"

response = requests.post('https://oauth2.googleapis.com/token', data={
    'code': AUTH_CODE,
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
    'redirect_uri': 'http://localhost',
    'grant_type': 'authorization_code'
})

print(response.json())`;
}
function isGoogleDriveSetupComplete(credentials) {
  return Boolean(
    credentials.client_id && credentials.client_secret && credentials.refresh_token && credentials.folder_url
  );
}
var root_1$c = /* @__PURE__ */ from_html(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 3: Configure OAuth Consent Screen</h4> <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4"><p class="text-sm text-blue-800"><strong>Navigation help:</strong> In Google Cloud Console, look for the hamburger menu (☰) in the top-left corner. 
                Click it, then find "APIs & Services" → "OAuth consent screen"</p></div> <ol class="space-y-4"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div class="flex-1"><p class="font-medium">Go to OAuth consent screen</p> <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Open OAuth Consent Screen <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div class="flex-1"><p class="font-medium">Configure the OAuth consent screen</p> <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2 text-sm"><p class="font-semibold text-yellow-800 mb-1">If you don't see the "External" option:</p> <ul class="text-yellow-700 space-y-1"><li>• You may already have configured it - click "EDIT APP" instead</li> <li>• Or select "External" if this is your first time</li> <li>• If you only see "Internal", you're using a workspace account - select it and continue</li></ul></div></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span> <div class="flex-1"><p class="font-medium">Fill in the required fields:</p> <ul class="text-sm text-gray-600 mt-1 space-y-1"><li>• App name: <code class="bg-gray-100 px-1">SkyGit Drive</code></li> <li>• User support email: Your email</li> <li>• Developer contact: Your email</li></ul> <p class="text-sm text-gray-500 mt-2">Click "SAVE AND CONTINUE" through all steps</p></div></li></ol></div>`);
var root_2$c = /* @__PURE__ */ from_html(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 4: Create OAuth Client ID</h4> <ol class="space-y-4"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div class="flex-1"><p class="font-medium">Go to Credentials page</p> <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Open Credentials <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div class="flex-1"><p class="font-medium">Click "+ CREATE CREDENTIALS" → "OAuth client ID"</p></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span> <div class="flex-1"><p class="font-medium">Configure the client:</p> <ul class="text-sm text-gray-600 mt-1 space-y-1"><li>• Application type: <strong>Web application</strong></li> <li>• Name: <code class="bg-gray-100 px-1">SkyGit Web Client</code></li></ul></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span> <div class="flex-1"><p class="font-medium">Add these Authorized redirect URIs:</p> <div class="space-y-2 mt-2"><div class="bg-green-50 border border-green-200 rounded p-2 text-xs"><p class="font-semibold text-green-800">✓ Add these two essential URIs:</p></div> <div class="flex items-center gap-2"><code class="bg-gray-100 px-3 py-1 rounded text-sm"> </code> <button class="text-blue-600 hover:text-blue-700 text-sm"><!></button> <span class="text-xs text-gray-600">(for easy setup)</span></div> <div class="flex items-center gap-2"><code class="bg-gray-100 px-3 py-1 rounded text-sm"> </code> <button class="text-blue-600 hover:text-blue-700 text-sm"><!></button> <span class="text-xs text-gray-600">(current app)</span></div> <p class="text-xs text-gray-600 mt-2">Click "+ ADD URI" after adding each one, then click "SAVE" at the bottom</p> <div class="bg-blue-50 border border-blue-200 rounded p-2 text-xs mt-3"><p class="text-blue-800"><strong>Note:</strong> We're detecting your app is running at <code> </code>. 
                                If you deploy to a different URL later, you'll need to add that URL too.</p></div></div></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</span> <div class="flex-1"><p class="font-medium">Click "CREATE"</p> <p class="text-sm text-gray-600 mt-1">A popup will show your credentials - keep it open!</p></div></li></ol></div>`);
var root$d = /* @__PURE__ */ from_html(`<!> <!>`, 1);
function GoogleDriveSetupCloudConfigSteps($$anchor, $$props) {
  push($$props, false);
  let currentStep = prop($$props, "currentStep", 8, 1);
  let currentAppUrl = prop($$props, "currentAppUrl", 8, "");
  let copiedSteps = prop($$props, "copiedSteps", 24, () => ({}));
  let copyToClipboard = prop($$props, "copyToClipboard", 8, () => {
  });
  init();
  var fragment = root$d();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$c();
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (currentStep() === 4) $$render(consequent);
    });
  }
  var node_1 = sibling(node, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var div_1 = root_2$c();
      var ol = sibling(child(div_1), 2);
      var li = sibling(child(ol), 6);
      var div_2 = sibling(child(li), 2);
      var div_3 = sibling(child(div_2), 2);
      var div_4 = sibling(child(div_3), 2);
      var code = child(div_4);
      var text$1 = child(code);
      var button = sibling(code, 2);
      var node_2 = child(button);
      {
        var consequent_1 = ($$anchor3) => {
          var text_1 = text("✓ Copied!");
          append($$anchor3, text_1);
        };
        var alternate = ($$anchor3) => {
          var text_2 = text("📋 Copy");
          append($$anchor3, text_2);
        };
        if_block(node_2, ($$render) => {
          if (deep_read_state(copiedSteps()), untrack(() => copiedSteps()["redirectUri1"])) $$render(consequent_1);
          else $$render(alternate, -1);
        });
      }
      var div_5 = sibling(div_4, 2);
      var code_1 = child(div_5);
      var text_3 = child(code_1);
      var button_1 = sibling(code_1, 2);
      var node_3 = child(button_1);
      {
        var consequent_2 = ($$anchor3) => {
          var text_4 = text("✓ Copied!");
          append($$anchor3, text_4);
        };
        var alternate_1 = ($$anchor3) => {
          var text_5 = text("📋 Copy");
          append($$anchor3, text_5);
        };
        if_block(node_3, ($$render) => {
          if (deep_read_state(copiedSteps()), untrack(() => copiedSteps()["redirectUri2"])) $$render(consequent_2);
          else $$render(alternate_1, -1);
        });
      }
      var div_6 = sibling(div_5, 4);
      var p = child(div_6);
      var code_2 = sibling(child(p), 2);
      var text_6 = child(code_2);
      template_effect(() => {
        set_text(text$1, GOOGLE_OAUTH_PLAYGROUND_URL);
        set_text(text_3, currentAppUrl());
        set_text(text_6, currentAppUrl());
      });
      event("click", button, () => copyToClipboard()(GOOGLE_OAUTH_PLAYGROUND_URL, "redirectUri1"));
      event("click", button_1, () => copyToClipboard()(currentAppUrl(), "redirectUri2"));
      append($$anchor2, div_1);
    };
    if_block(node_1, ($$render) => {
      if (currentStep() === 5) $$render(consequent_3);
    });
  }
  append($$anchor, fragment);
  pop();
}
var root_2$b = /* @__PURE__ */ from_html(
  `<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"><p class="font-medium text-blue-900 mb-2">Now let's get your refresh token:</p> <div class="bg-green-50 border border-green-200 rounded p-3 mb-3"><p class="text-sm text-green-800 font-semibold mb-1">💡 Recommended: Skip to Step 7</p> <p class="text-xs text-green-700">The OAuth Playground method (Step 7) is easier and more reliable. <button class="underline font-semibold">Jump to Step 7 →</button></p></div> <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3"><p class="text-sm text-yellow-800 font-semibold mb-1">⚠️ Manual method requires patience</p> <p class="text-xs text-yellow-700">New OAuth clients can take 15-30 minutes to activate. The method below may fail with "unauthorized_client" if your client is too new.</p></div> <ol class="space-y-2 text-sm text-blue-800"><li>1. Copy the authorization URL below</li> <li>2. Paste it in a new browser tab</li> <li>3. Sign in and grant permissions</li> <li>4. You'll be redirected back to this app</li> <li>5. Copy the code from the URL (after "code=" and before "&scope=")</li></ol> <div class="mt-3 space-y-2"><p class="text-sm font-semibold text-gray-700">Authorization URL for your current app:</p> <div class="p-3 bg-gray-100 rounded font-mono text-xs break-all"> </div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"><!></button></div> <div class="mt-4 bg-red-50 border border-red-200 rounded p-3"><p class="text-sm font-semibold text-red-800 mb-1">Getting "unauthorized_client" error?</p> <ol class="text-xs text-red-700 space-y-1"><li>1. <strong>Wait 15-30 minutes</strong> - Google needs time to activate new OAuth clients</li> <li>2. Double-check your Client ID is correct (copy it again from Google Console)</li> <li>3. Make sure OAuth consent screen is configured and published</li> <li>4. Try using the OAuth Playground method instead (see Step 7)</li></ol></div> <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3"><p class="text-sm font-semibold text-yellow-800 mb-1">⏰ Timing is important!</p> <p class="text-xs text-yellow-700">New OAuth clients can take 5-30 minutes to become active. If you just created your client, 
                        take a break and try again later. The OAuth Playground method (Step 7) often works faster.</p></div></div> <div class="mt-4"><label for="google-authorization-code" class="block text-sm font-medium text-gray-700 mb-1">Authorization Code</label> <textarea id="google-authorization-code" placeholder="Paste the code from the URL here" class="w-full border px-3 py-2 rounded font-mono text-sm" rows="3"></textarea> <div class="bg-gray-50 border border-gray-200 rounded p-3 mt-2 text-xs"><p class="font-semibold text-gray-700 mb-1">Example URL after authorization:</p> <code class="text-gray-600">http://localhost/?code=<span class="text-blue-600 font-bold">4/0AY0e-g7...</span>&scope=https://www.googleapis.com/auth/drive.file</code> <p class="mt-2 text-gray-700">Copy only the blue part (the code between "code=" and "&scope=")</p></div></div>`,
  1
);
var root_5$6 = /* @__PURE__ */ from_html(`<p class="text-sm text-gray-600">Please enter your Client ID and Client Secret above to continue.</p>`);
var root_1$b = /* @__PURE__ */ from_html(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 5: Get Your Refresh Token</h4> <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"><p class="text-sm text-yellow-800">Copy your Client ID and Client Secret from the popup window first!</p></div> <div class="space-y-4"><div><label for="google-client-id" class="block text-sm font-medium text-gray-700 mb-1">Client ID</label> <input id="google-client-id" type="text" placeholder="Paste your Client ID here" class="w-full border px-3 py-2 rounded"/></div> <div><label for="google-client-secret" class="block text-sm font-medium text-gray-700 mb-1">Client Secret</label> <input id="google-client-secret" type="text" placeholder="Paste your Client Secret here" class="w-full border px-3 py-2 rounded"/></div></div> <!></div>`);
var root_6$4 = /* @__PURE__ */ from_html(`<div class="space-y-4"><h4 class="text-xl font-semibold">Alternative Method: Use OAuth Playground with Your Credentials</h4> <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"><p class="text-green-800 font-semibold mb-2">Easier Option: Use Google's OAuth Playground</p> <ol class="text-sm text-green-700 space-y-2"><li>1. Go to <a target="_blank" class="underline">OAuth Playground</a></li> <li>2. Click the gear icon (⚙️) in the top right</li> <li>3. Check "Use your own OAuth credentials"</li> <li>4. Enter your Client ID and Client Secret</li> <li>5. In the left panel, find "Drive API v3" and select: <code class="bg-green-100 px-1">https://www.googleapis.com/auth/drive.file</code></li> <li>6. Click "Authorize APIs" and sign in</li> <li>7. Click "Exchange authorization code for tokens"</li> <li>8. Copy the "Refresh token" from the response</li></ol> <div class="mt-3 p-2 bg-yellow-100 rounded"><p class="text-xs text-yellow-800"><strong>Note:</strong> You must add <code>https://developers.google.com/oauthplayground</code> as an authorized redirect URI in your OAuth client settings first!</p></div></div> <div class="bg-blue-50 border border-blue-200 rounded-lg p-4"><p class="text-blue-800 mb-3">Since we can't exchange the authorization code in the browser, you'll need to use a desktop tool or script.</p> <p class="font-medium text-blue-900 mb-2">Option 1: Python Script</p> <pre class="bg-white p-3 rounded text-xs overflow-x-auto"><code> </code></pre> <button class="mt-2 text-blue-600 hover:text-blue-700 text-sm"><!></button> <p class="text-sm text-blue-800 mt-4">Run this script with your authorization code to get the refresh token.</p></div> <div class="mt-6"><label for="google-refresh-token" class="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label> <input id="google-refresh-token" type="text" placeholder="Paste your refresh token here" class="w-full border px-3 py-2 rounded"/></div></div>`);
var root_10$3 = /* @__PURE__ */ from_html(`<div class="bg-green-50 border border-green-200 rounded-lg p-4"><p class="text-green-800 font-medium">✅ Great! You have all the required credentials.</p></div>`);
var root_9$5 = /* @__PURE__ */ from_html(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 6: Create Google Drive Folder</h4> <p class="text-gray-600">Finally, let's create a folder for SkyGit files:</p> <ol class="space-y-3"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div><a href="https://drive.google.com" target="_blank" class="text-blue-600 underline">Open Google Drive</a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div>Create a new folder named: <code class="bg-gray-100 px-2 py-1 rounded"> </code></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span> <div>Open the folder and copy its URL</div></li></ol> <div class="mt-4"><label for="google-drive-folder-url" class="block text-sm font-medium text-gray-700 mb-1">Google Drive Folder URL</label> <input id="google-drive-folder-url" type="text" placeholder="https://drive.google.com/drive/folders/..." class="w-full border px-3 py-2 rounded"/></div> <!></div>`);
var root$c = /* @__PURE__ */ from_html(`<!> <!> <!>`, 1);
function GoogleDriveSetupCredentialSteps($$anchor, $$props) {
  push($$props, false);
  let currentStep = prop($$props, "currentStep", 8, 1);
  let credentials = prop($$props, "credentials", 24, () => ({}));
  let copiedSteps = prop($$props, "copiedSteps", 24, () => ({}));
  let authorizationUrl = prop($$props, "authorizationUrl", 8, "");
  let tokenExchangeScript = prop($$props, "tokenExchangeScript", 8, "");
  let setupComplete = prop($$props, "setupComplete", 8, false);
  let suggestedFolderName = prop($$props, "suggestedFolderName", 8, "SkyGit-user");
  let copyToClipboard = prop($$props, "copyToClipboard", 8, () => {
  });
  let onStepChange = prop($$props, "onStepChange", 8, () => {
  });
  let onCredentialsChange = prop($$props, "onCredentialsChange", 8, () => {
  });
  function updateCredential(key2, value) {
    onCredentialsChange()({ ...credentials(), [key2]: value });
  }
  init();
  var fragment = root$c();
  var node = first_child(fragment);
  {
    var consequent_2 = ($$anchor2) => {
      var div = root_1$b();
      var div_1 = sibling(child(div), 4);
      var div_2 = child(div_1);
      var input = sibling(child(div_2), 2);
      var div_3 = sibling(div_2, 2);
      var input_1 = sibling(child(div_3), 2);
      var node_1 = sibling(div_1, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var fragment_1 = root_2$b();
          var div_4 = first_child(fragment_1);
          var div_5 = sibling(child(div_4), 2);
          var p = sibling(child(div_5), 2);
          var button = sibling(child(p));
          var div_6 = sibling(div_5, 6);
          var div_7 = sibling(child(div_6), 2);
          var text$1 = child(div_7);
          var button_1 = sibling(div_7, 2);
          var node_2 = child(button_1);
          {
            var consequent = ($$anchor4) => {
              var text_1 = text("✓ Copied!");
              append($$anchor4, text_1);
            };
            var alternate = ($$anchor4) => {
              var text_2 = text("📋 Copy URL");
              append($$anchor4, text_2);
            };
            if_block(node_2, ($$render) => {
              if (deep_read_state(copiedSteps()), untrack(() => copiedSteps()["authUrl1"])) $$render(consequent);
              else $$render(alternate, -1);
            });
          }
          template_effect(() => set_text(text$1, authorizationUrl()));
          event("click", button, () => onStepChange()(7));
          event("click", button_1, () => copyToClipboard()(authorizationUrl(), "authUrl1"));
          append($$anchor3, fragment_1);
        };
        var alternate_1 = ($$anchor3) => {
          var p_1 = root_5$6();
          append($$anchor3, p_1);
        };
        if_block(node_1, ($$render) => {
          if (deep_read_state(credentials()), untrack(() => credentials().client_id && credentials().client_secret)) $$render(consequent_1);
          else $$render(alternate_1, -1);
        });
      }
      template_effect(() => {
        set_value(input, (deep_read_state(credentials()), untrack(() => credentials().client_id)));
        set_value(input_1, (deep_read_state(credentials()), untrack(() => credentials().client_secret)));
      });
      event("input", input, (event2) => updateCredential("client_id", event2.currentTarget.value));
      event("input", input_1, (event2) => updateCredential("client_secret", event2.currentTarget.value));
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (currentStep() === 6) $$render(consequent_2);
    });
  }
  var node_3 = sibling(node, 2);
  {
    var consequent_4 = ($$anchor2) => {
      var div_8 = root_6$4();
      var div_9 = sibling(child(div_8), 2);
      var ol = sibling(child(div_9), 2);
      var li = child(ol);
      var a = sibling(child(li));
      var div_10 = sibling(div_9, 2);
      var pre = sibling(child(div_10), 4);
      var code = child(pre);
      var text_3 = child(code);
      var button_2 = sibling(pre, 2);
      var node_4 = child(button_2);
      {
        var consequent_3 = ($$anchor3) => {
          var text_4 = text("✓ Copied!");
          append($$anchor3, text_4);
        };
        var alternate_2 = ($$anchor3) => {
          var text_5 = text("📋 Copy Script");
          append($$anchor3, text_5);
        };
        if_block(node_4, ($$render) => {
          if (deep_read_state(copiedSteps()), untrack(() => copiedSteps()["pythonScript"])) $$render(consequent_3);
          else $$render(alternate_2, -1);
        });
      }
      var div_11 = sibling(div_10, 2);
      var input_2 = sibling(child(div_11), 2);
      template_effect(() => {
        set_attribute(a, "href", GOOGLE_OAUTH_PLAYGROUND_URL);
        set_text(text_3, tokenExchangeScript());
        set_value(input_2, (deep_read_state(credentials()), untrack(() => credentials().refresh_token)));
      });
      event("click", button_2, () => copyToClipboard()(tokenExchangeScript(), "pythonScript"));
      event("input", input_2, (event2) => updateCredential("refresh_token", event2.currentTarget.value));
      append($$anchor2, div_8);
    };
    if_block(node_3, ($$render) => {
      if (currentStep() === 7) $$render(consequent_4);
    });
  }
  var node_5 = sibling(node_3, 2);
  {
    var consequent_6 = ($$anchor2) => {
      var div_12 = root_9$5();
      var ol_1 = sibling(child(div_12), 4);
      var li_1 = sibling(child(ol_1), 2);
      var div_13 = sibling(child(li_1), 2);
      var code_1 = sibling(child(div_13));
      var text_6 = child(code_1);
      var div_14 = sibling(ol_1, 2);
      var input_3 = sibling(child(div_14), 2);
      var node_6 = sibling(div_14, 2);
      {
        var consequent_5 = ($$anchor3) => {
          var div_15 = root_10$3();
          append($$anchor3, div_15);
        };
        if_block(node_6, ($$render) => {
          if (setupComplete()) $$render(consequent_5);
        });
      }
      template_effect(() => {
        set_text(text_6, suggestedFolderName());
        set_value(input_3, (deep_read_state(credentials()), untrack(() => credentials().folder_url)));
      });
      event("input", input_3, (event2) => updateCredential("folder_url", event2.currentTarget.value));
      append($$anchor2, div_12);
    };
    if_block(node_5, ($$render) => {
      if (currentStep() === 8) $$render(consequent_6);
    });
  }
  append($$anchor, fragment);
  pop();
}
var root$b = /* @__PURE__ */ from_html(`<div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between"><h3 class="text-lg font-semibold">Google Drive Setup - Create Your Own App</h3> <button type="button" class="text-gray-500 hover:text-gray-700" aria-label="Close Google Drive setup guide"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
function GoogleDriveSetupHeader($$anchor, $$props) {
  let onClose = prop($$props, "onClose", 8, () => {
  });
  var div = root$b();
  var button = sibling(child(div), 2);
  event("click", button, function(...$$args) {
    var _a2;
    (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
  });
  append($$anchor, div);
}
var root_1$a = /* @__PURE__ */ from_html(`<div class="space-y-4"><h4 class="text-xl font-semibold">Welcome! Let's set up Google Drive</h4> <p class="text-gray-600">We'll guide you through creating your own Google Cloud project to enable file uploads and storage. It's free and takes about 10 minutes.</p> <div class="bg-blue-50 border border-blue-200 rounded-lg p-4"><h5 class="font-semibold text-blue-900 mb-2">What you'll get:</h5> <ul class="list-disc list-inside text-sm text-blue-800 space-y-1"><li>Your own Google Drive integration</li> <li>Full control over permissions</li> <li>No daily limits or restrictions</li> <li>Works permanently (no token expiration)</li></ul></div> <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-4"><p class="text-sm text-green-800"><strong>✓ Free to use:</strong> Google Cloud offers a generous free tier that's more than enough for personal use.</p></div></div>`);
var root_2$a = /* @__PURE__ */ from_html(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 1: Create a Google Cloud Project</h4> <ol class="space-y-4"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div class="flex-1"><p class="font-medium">Go to Google Cloud Console</p> <a href="https://console.cloud.google.com/projectcreate" target="_blank" class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Open Cloud Console <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div class="flex-1"><p class="font-medium">Create a new project</p> <p class="text-sm text-gray-600 mt-1">Project name suggestion:</p> <div class="flex items-center gap-2 mt-2"><code class="bg-gray-100 px-3 py-1 rounded">SkyGit-Drive</code> <button class="text-blue-600 hover:text-blue-700 text-sm"><!></button></div></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span> <div class="flex-1"><p class="font-medium">Click "CREATE" and wait for the project to be created</p> <p class="text-sm text-gray-600 mt-1">This usually takes 10-30 seconds</p></div></li></ol></div>`);
var root_5$5 = /* @__PURE__ */ from_html(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 2: Enable Google Drive API</h4> <ol class="space-y-4"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div class="flex-1"><p class="font-medium">Open the API Library</p> <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Open Drive API Page <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div class="flex-1"><p class="font-medium">Click the blue "ENABLE" button</p> <p class="text-sm text-gray-600 mt-1">If it says "MANAGE" instead, the API is already enabled!</p></div></li></ol></div>`);
var root$a = /* @__PURE__ */ from_html(`<!> <!> <!>`, 1);
function GoogleDriveSetupIntroSteps($$anchor, $$props) {
  push($$props, false);
  let currentStep = prop($$props, "currentStep", 8, 1);
  let copiedSteps = prop($$props, "copiedSteps", 24, () => ({}));
  let copyToClipboard = prop($$props, "copyToClipboard", 8, () => {
  });
  init();
  var fragment = root$a();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$a();
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (currentStep() === 1) $$render(consequent);
    });
  }
  var node_1 = sibling(node, 2);
  {
    var consequent_2 = ($$anchor2) => {
      var div_1 = root_2$a();
      var ol = sibling(child(div_1), 2);
      var li = sibling(child(ol), 2);
      var div_2 = sibling(child(li), 2);
      var div_3 = sibling(child(div_2), 4);
      var button = sibling(child(div_3), 2);
      var node_2 = child(button);
      {
        var consequent_1 = ($$anchor3) => {
          var text$1 = text("✓ Copied!");
          append($$anchor3, text$1);
        };
        var alternate = ($$anchor3) => {
          var text_1 = text("📋 Copy");
          append($$anchor3, text_1);
        };
        if_block(node_2, ($$render) => {
          if (deep_read_state(copiedSteps()), untrack(() => copiedSteps()["projectName"])) $$render(consequent_1);
          else $$render(alternate, -1);
        });
      }
      event("click", button, () => copyToClipboard()("SkyGit-Drive", "projectName"));
      append($$anchor2, div_1);
    };
    if_block(node_1, ($$render) => {
      if (currentStep() === 2) $$render(consequent_2);
    });
  }
  var node_3 = sibling(node_1, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var div_4 = root_5$5();
      append($$anchor2, div_4);
    };
    if_block(node_3, ($$render) => {
      if (currentStep() === 3) $$render(consequent_3);
    });
  }
  append($$anchor, fragment);
  pop();
}
var root_1$9 = /* @__PURE__ */ from_html(`<button type="button"></button>`);
var root_2$9 = /* @__PURE__ */ from_html(`<button class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Next →</button>`);
var root_3$7 = /* @__PURE__ */ from_html(`<button class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Complete Setup</button>`);
var root$9 = /* @__PURE__ */ from_html(`<div class="sticky bottom-0 bg-white border-t p-4 flex justify-between"><button class="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">← Previous</button> <div class="flex gap-2"></div> <!></div>`);
function GoogleDriveSetupNavigation($$anchor, $$props) {
  push($$props, false);
  let currentStep = prop($$props, "currentStep", 24, () => GOOGLE_DRIVE_SETUP_STEPS[0]);
  let setupComplete = prop($$props, "setupComplete", 8, false);
  let onPrevious = prop($$props, "onPrevious", 8, () => {
  });
  let onNext = prop($$props, "onNext", 8, () => {
  });
  let onStepChange = prop($$props, "onStepChange", 8, () => {
  });
  let onComplete = prop($$props, "onComplete", 8, () => {
  });
  init();
  var div = root$9();
  var button = child(div);
  var div_1 = sibling(button, 2);
  each(div_1, 5, () => GOOGLE_DRIVE_SETUP_STEPS, index, ($$anchor2, step) => {
    var button_1 = root_1$9();
    template_effect(() => {
      set_class(button_1, 1, `w-2 h-2 rounded-full ${currentStep() >= get(step) ? "bg-blue-600" : "bg-gray-300"}`);
      set_attribute(button_1, "aria-label", `Go to Google Drive setup step ${get(step) ?? ""}`);
    });
    event("click", button_1, () => onStepChange()(get(step)));
    append($$anchor2, button_1);
  });
  var node = sibling(div_1, 2);
  {
    var consequent = ($$anchor2) => {
      var button_2 = root_2$9();
      event("click", button_2, function(...$$args) {
        var _a2;
        (_a2 = onNext()) == null ? void 0 : _a2.apply(this, $$args);
      });
      append($$anchor2, button_2);
    };
    var alternate = ($$anchor2) => {
      var button_3 = root_3$7();
      template_effect(() => button_3.disabled = !setupComplete());
      event("click", button_3, function(...$$args) {
        var _a2;
        (_a2 = onComplete()) == null ? void 0 : _a2.apply(this, $$args);
      });
      append($$anchor2, button_3);
    };
    if_block(node, ($$render) => {
      if (deep_read_state(currentStep()), deep_read_state(GOOGLE_DRIVE_SETUP_STEPS), untrack(() => currentStep() < GOOGLE_DRIVE_SETUP_STEPS[GOOGLE_DRIVE_SETUP_STEPS.length - 1])) $$render(consequent);
      else $$render(alternate, -1);
    });
  }
  template_effect(() => button.disabled = (deep_read_state(currentStep()), deep_read_state(GOOGLE_DRIVE_SETUP_STEPS), untrack(() => currentStep() === GOOGLE_DRIVE_SETUP_STEPS[0])));
  event("click", button, function(...$$args) {
    var _a2;
    (_a2 = onPrevious()) == null ? void 0 : _a2.apply(this, $$args);
  });
  append($$anchor, div);
  pop();
}
var root_1$8 = /* @__PURE__ */ from_html(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"><!> <div class="p-6"><!> <!> <!></div> <!></div></div>`);
function GoogleDriveSetupGuide($$anchor, $$props) {
  push($$props, false);
  const currentAppUrl = /* @__PURE__ */ mutable_source();
  const authorizationUrl = /* @__PURE__ */ mutable_source();
  const tokenExchangeScript = /* @__PURE__ */ mutable_source();
  const setupComplete = /* @__PURE__ */ mutable_source();
  let show = prop($$props, "show", 8, false);
  const dispatch = createEventDispatcher();
  let currentStep = /* @__PURE__ */ mutable_source(GOOGLE_DRIVE_SETUP_STEPS[0]);
  let copiedSteps = /* @__PURE__ */ mutable_source({});
  let credentials = /* @__PURE__ */ mutable_source(createInitialGoogleDriveCredentials());
  async function copyToClipboard(text2, stepId) {
    try {
      await navigator.clipboard.writeText(text2);
      mutate(copiedSteps, get(copiedSteps)[stepId] = true);
      set(copiedSteps, get(copiedSteps));
      setTimeout(
        () => {
          mutate(copiedSteps, get(copiedSteps)[stepId] = false);
          set(copiedSteps, get(copiedSteps));
        },
        2e3
      );
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }
  function getSuggestedFolderName() {
    const auth = get$1(authStore);
    return getSuggestedGoogleDriveFolderName(auth);
  }
  function getCurrentAppUrl() {
    return getAppBaseUrl(window.location);
  }
  function handleComplete() {
    dispatch("complete", get(credentials));
  }
  function handleClose() {
    dispatch("close");
  }
  function goToPreviousStep() {
    set(currentStep, Math.max(GOOGLE_DRIVE_SETUP_STEPS[0], get(currentStep) - 1));
  }
  function goToNextStep() {
    set(currentStep, Math.min(GOOGLE_DRIVE_SETUP_STEPS[GOOGLE_DRIVE_SETUP_STEPS.length - 1], get(currentStep) + 1));
  }
  function goToStep(step) {
    set(currentStep, step);
  }
  function handleCredentialsChange(nextCredentials) {
    set(credentials, nextCredentials);
  }
  legacy_pre_effect(() => {
  }, () => {
    set(currentAppUrl, getCurrentAppUrl());
  });
  legacy_pre_effect(
    () => (get(credentials), get(currentAppUrl)),
    () => {
      set(authorizationUrl, buildGoogleDriveAuthorizationUrl({
        clientId: get(credentials).client_id,
        redirectUri: get(currentAppUrl)
      }));
    }
  );
  legacy_pre_effect(() => get(credentials), () => {
    set(tokenExchangeScript, buildGoogleDriveTokenExchangeScript({
      clientId: get(credentials).client_id,
      clientSecret: get(credentials).client_secret
    }));
  });
  legacy_pre_effect(() => get(credentials), () => {
    set(setupComplete, isGoogleDriveSetupComplete(get(credentials)));
  });
  legacy_pre_effect_reset();
  init();
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$8();
      var div_1 = child(div);
      var node_1 = child(div_1);
      GoogleDriveSetupHeader(node_1, { onClose: handleClose });
      var div_2 = sibling(node_1, 2);
      var node_2 = child(div_2);
      GoogleDriveSetupIntroSteps(node_2, {
        get currentStep() {
          return get(currentStep);
        },
        get copiedSteps() {
          return get(copiedSteps);
        },
        copyToClipboard
      });
      var node_3 = sibling(node_2, 2);
      GoogleDriveSetupCloudConfigSteps(node_3, {
        get currentStep() {
          return get(currentStep);
        },
        get currentAppUrl() {
          return get(currentAppUrl);
        },
        get copiedSteps() {
          return get(copiedSteps);
        },
        copyToClipboard
      });
      var node_4 = sibling(node_3, 2);
      {
        let $0 = /* @__PURE__ */ derived_safe_equal(() => untrack(getSuggestedFolderName));
        GoogleDriveSetupCredentialSteps(node_4, {
          get currentStep() {
            return get(currentStep);
          },
          get credentials() {
            return get(credentials);
          },
          get copiedSteps() {
            return get(copiedSteps);
          },
          get authorizationUrl() {
            return get(authorizationUrl);
          },
          get tokenExchangeScript() {
            return get(tokenExchangeScript);
          },
          get setupComplete() {
            return get(setupComplete);
          },
          get suggestedFolderName() {
            return get($0);
          },
          copyToClipboard,
          onStepChange: goToStep,
          onCredentialsChange: handleCredentialsChange
        });
      }
      var node_5 = sibling(div_2, 2);
      GoogleDriveSetupNavigation(node_5, {
        get currentStep() {
          return get(currentStep);
        },
        get setupComplete() {
          return get(setupComplete);
        },
        onPrevious: goToPreviousStep,
        onNext: goToNextStep,
        onStepChange: goToStep,
        onComplete: handleComplete
      });
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (show()) $$render(consequent);
    });
  }
  append($$anchor, fragment);
  pop();
}
var root_2$8 = /* @__PURE__ */ from_html(`<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"><h3 class="text-lg font-semibold text-yellow-800 mb-2">⚠️ Configuration Repository Issue</h3> <p class="text-yellow-700 mb-3">The <code class="bg-yellow-100 px-1 rounded">skygit-config</code> repository is required to store your credentials securely.</p> <div class="space-y-3"><button class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded disabled:opacity-50"> </button> <div class="text-sm text-yellow-700"><p class="font-semibold mb-1">If you see "repository already exists" error:</p> <ol class="list-decimal list-inside space-y-1 ml-2"><li>Check if the repo exists at: <a target="_blank" class="underline"> </a></li> <li>If it exists but you can't access it, check your PAT has "repo" scope</li> <li>If you deleted it recently, wait a few minutes or rename it first</li> <li>Try visiting the repo directly and delete it if needed</li></ol></div></div></div>`);
var root_8$3 = /* @__PURE__ */ from_html(`<button title="Save">💾</button>`);
var root_9$4 = /* @__PURE__ */ from_html(`<button title="Edit">✏️</button>`);
var root_7$4 = /* @__PURE__ */ from_html(`<button title="Hide">🙈</button> <!>`, 1);
var root_10$2 = /* @__PURE__ */ from_html(`<button title="Reveal">👁️</button>`);
var root_14$2 = /* @__PURE__ */ from_html(`<label class="block mb-2"><span class="font-semibold"> </span> <input class="w-full border px-2 py-1 rounded text-xs"/></label>`);
var root_12$1 = /* @__PURE__ */ from_html(`<label class="block mb-2"><span class="font-semibold">Type</span> <select disabled="" class="w-full border px-2 py-1 rounded text-xs bg-gray-100 text-gray-500"><option> </option></select></label> <!>`, 1);
var root_15$2 = /* @__PURE__ */ from_html(`<pre class="text-xs text-gray-700 bg-white border rounded p-2"> </pre>`);
var root_11 = /* @__PURE__ */ from_html(`<tr class="bg-gray-50 text-xs"><td colspan="4" class="p-3"><!></td></tr>`);
var root_4$5 = /* @__PURE__ */ from_html(`<tr class="border-t"><td class="p-2 align-top"> </td><td class="p-2 font-mono text-xs text-gray-500"> </td><td class="p-2 text-xs text-gray-700"><!></td><td class="p-2 space-x-3 text-sm"><!> <button title="Delete">🗑️</button></td></tr> <!>`, 1);
var root_16$2 = /* @__PURE__ */ from_html(`<div class="grid md:grid-cols-3 gap-4"><label>Access Key ID: <input class="w-full border px-2 py-1 rounded text-sm"/></label> <label>Secret Access Key: <input class="w-full border px-2 py-1 rounded text-sm"/></label> <label>Region: <input class="w-full border px-2 py-1 rounded text-sm"/></label></div>`);
var root_17$2 = /* @__PURE__ */ from_html(`<div class="space-y-4"><div class="bg-blue-50 border border-blue-200 rounded p-4"><h4 class="font-semibold text-blue-900 mb-2">🔗 Connect Google Drive</h4> <p class="text-sm text-blue-800 mb-3">Set up your own Google Drive integration for file uploads and storage.</p> <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg> Set Up Google Drive</button></div> <div class="text-sm text-gray-600"><p class="mb-2">Or enter credentials manually if you already have them:</p> <div class="grid md:grid-cols-3 gap-4"><label>Client ID: <input placeholder="e.g., 123456789.apps.googleusercontent.com" class="w-full border px-2 py-1 rounded text-sm"/></label> <label>Client Secret: <input placeholder="e.g., GOCSPX-..." class="w-full border px-2 py-1 rounded text-sm"/></label> <label>Refresh Token: <input placeholder="e.g., 1//0g..." class="w-full border px-2 py-1 rounded text-sm"/></label></div></div></div>`);
var root_3$6 = /* @__PURE__ */ from_html(`<table class="w-full text-sm border rounded overflow-hidden shadow"><thead class="bg-gray-100 text-left"><tr><th class="p-2">URL</th><th class="p-2">Encrypted Preview</th><th class="p-2">Type</th><th class="p-2">Actions</th></tr></thead><tbody></tbody></table> <div class="border-t pt-4 space-y-2"><h3 class="text-lg font-semibold text-gray-700">➕ Add Credential</h3> <div class="grid md:grid-cols-2 gap-4"><label>URL: <input placeholder="https://my-storage.com/path" class="w-full border px-2 py-1 rounded text-sm"/></label> <label>Type: <select class="w-full border px-2 py-1 rounded text-sm"><option>S3</option><option>Google Drive</option></select></label></div> <!> <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">💾 Add Credential</button></div> <div class="border-t pt-4 space-y-2"><h3 class="text-lg font-semibold text-gray-700">App Settings</h3> <label class="flex items-center space-x-2"><input type="checkbox"/> <span>Cleanup mode (delete old presence channels)</span></label></div>`, 1);
var root_1$7 = /* @__PURE__ */ from_html(`<div class="p-6 max-w-4xl mx-auto space-y-6"><h2 class="text-2xl font-semibold text-gray-800">🔐 Credential Manager</h2> <!></div>`);
var root$8 = /* @__PURE__ */ from_html(`<!> <!>`, 1);
function Settings($$anchor, $$props) {
  push($$props, false);
  const $authStore = () => store_get(authStore, "$authStore", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  let secrets = /* @__PURE__ */ mutable_source({});
  let decrypted = /* @__PURE__ */ mutable_source({});
  let revealed = /* @__PURE__ */ mutable_source(/* @__PURE__ */ new Set());
  let repoExists = /* @__PURE__ */ mutable_source(true);
  let creatingRepo = /* @__PURE__ */ mutable_source(false);
  let editing = /* @__PURE__ */ mutable_source(null);
  let newUrl = /* @__PURE__ */ mutable_source("");
  let newType = /* @__PURE__ */ mutable_source("s3");
  let newCredentials = /* @__PURE__ */ mutable_source({ type: "s3", accessKeyId: "", secretAccessKey: "", region: "" });
  let editCredentials = /* @__PURE__ */ mutable_source({});
  let sha = null;
  let cleanupMode = /* @__PURE__ */ mutable_source(false);
  const token = localStorage.getItem("skygit_token");
  onMount(async () => {
    set(cleanupMode, get$1(settingsStore).cleanupMode || false);
    if (!token) return;
    try {
      const username = await getGitHubUsername(token);
      console.log("[Settings] Checking repo for user:", username);
      set(repoExists, await checkSkyGitRepoExists(token, username));
      if (!get(repoExists)) {
        console.warn("[Settings] skygit-config repository not found");
        console.log("[Settings] Checking repo at:", `https://github.com/${username}/skygit-config`);
        return;
      }
      console.log("[Settings] Repository exists, loading secrets...");
    } catch (error) {
      console.error("[Settings] Error checking repo:", error);
      set(repoExists, false);
      return;
    }
    const result = await getSecretsMap(token);
    set(secrets, result.secrets);
    sha = result.sha;
  });
  async function createRepo() {
    set(creatingRepo, true);
    try {
      await createSkyGitRepo(token);
      set(repoExists, true);
      const result = await getSecretsMap(token);
      set(secrets, result.secrets);
      sha = result.sha;
    } catch (error) {
      console.error("Failed to create skygit-config repo:", error);
      alert("Failed to create repository: " + error.message);
    } finally {
      set(creatingRepo, false);
    }
  }
  async function reveal(url) {
    try {
      if (!get(decrypted)[url]) {
        mutate(decrypted, get(decrypted)[url] = await decryptJSON(token, get(secrets)[url]));
      }
      set(revealed, new Set(get(revealed)).add(url));
    } catch (e) {
      alert("❌ Failed to decrypt.");
    }
  }
  function hide(url) {
    set(revealed, new Set([...get(revealed)].filter((item) => item !== url)));
    if (get(editing) === url) set(editing, null);
  }
  function startEdit(url) {
    if (!get(revealed).has(url)) {
      set(revealed, new Set(get(revealed)).add(url));
    }
    set(editing, url);
    set(editCredentials, { ...get(decrypted)[url] });
  }
  async function saveEdit(url) {
    const encrypted = await encryptJSON(token, get(editCredentials));
    mutate(secrets, get(secrets)[url] = encrypted);
    set(secrets, { ...get(
      secrets
      // trigger reactivity
    ) });
    mutate(decrypted, get(decrypted)[url] = get(editCredentials));
    set(decrypted, { ...get(decrypted) });
    set(revealed, new Set(get(revealed)).add(url));
    set(editing, null);
    const savedSha = await saveSecretsMap(token, get(secrets), sha);
    sha = savedSha ?? sha;
    settingsStore.update((s) => ({
      ...s,
      encryptedSecrets: { ...get(secrets) },
      decrypted: { ...get(decrypted) },
      secrets: { ...get(decrypted) },
      secretsSha: sha
    }));
  }
  async function deleteCredential(url) {
    if (!confirm(`Are you sure you want to delete the credential for:
${url}?`)) return;
    delete get(secrets)[url];
    set(secrets, { ...get(
      secrets
      // trigger reactivity
    ) });
    delete get(decrypted)[url];
    set(decrypted, { ...get(decrypted) });
    set(revealed, new Set([...get(revealed)].filter((item) => item !== url)));
    if (get(editing) === url) set(editing, null);
    const savedSha = await saveSecretsMap(token, get(secrets), sha);
    sha = savedSha ?? sha;
    settingsStore.update((s) => ({
      ...s,
      encryptedSecrets: { ...get(secrets) },
      decrypted: { ...get(decrypted) },
      secrets: { ...get(decrypted) },
      secretsSha: sha
    }));
  }
  async function addCredential() {
    if (!get(newUrl) || !get(newType)) return;
    const template = get(newType) === "s3" ? {
      type: "s3",
      accessKeyId: get(newCredentials).accessKeyId || "",
      secretAccessKey: get(newCredentials).secretAccessKey || "",
      region: get(newCredentials).region || ""
    } : {
      type: "google_drive",
      client_id: get(newCredentials).client_id || "",
      client_secret: get(newCredentials).client_secret || "",
      refresh_token: get(newCredentials).refresh_token || ""
    };
    const encrypted = await encryptJSON(token, template);
    mutate(secrets, get(secrets)[get(newUrl)] = encrypted);
    set(secrets, { ...get(
      secrets
      // trigger reactivity
    ) });
    mutate(decrypted, get(decrypted)[get(newUrl)] = template);
    set(decrypted, { ...get(decrypted) });
    set(revealed, new Set(get(revealed)).add(get(newUrl)));
    set(newUrl, "");
    set(newType, "s3");
    set(newCredentials, { type: "s3", accessKeyId: "", secretAccessKey: "", region: "" });
    const savedSha = await saveSecretsMap(token, get(secrets), sha);
    sha = savedSha ?? sha;
    settingsStore.update((s) => ({
      ...s,
      encryptedSecrets: { ...get(secrets) },
      decrypted: { ...get(decrypted) },
      secrets: { ...get(decrypted) },
      secretsSha: sha
    }));
  }
  function saveCleanupMode() {
    settingsStore.update((s) => ({ ...s, cleanupMode: get(cleanupMode) }));
    localStorage.setItem("skygit_cleanup_mode", get(cleanupMode) ? "true" : "false");
  }
  let showGoogleGuide = /* @__PURE__ */ mutable_source(false);
  function handleGoogleSetupComplete(event2) {
    const creds = event2.detail;
    set(newUrl, creds.folder_url);
    set(newType, "google_drive");
    set(newCredentials, {
      type: "google_drive",
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token
    });
    set(showGoogleGuide, false);
  }
  init();
  var fragment = root$8();
  var node = first_child(fragment);
  Layout(node, {
    children: ($$anchor2, $$slotProps) => {
      var div = root_1$7();
      var node_1 = sibling(child(div), 2);
      {
        var consequent = ($$anchor3) => {
          var div_1 = root_2$8();
          var div_2 = sibling(child(div_1), 4);
          var button = child(div_2);
          var text2 = child(button);
          var div_3 = sibling(button, 2);
          var ol = sibling(child(div_3), 2);
          var li = child(ol);
          var a = sibling(child(li));
          var text_1 = child(a);
          template_effect(() => {
            var _a2, _b2, _c2, _d;
            button.disabled = get(creatingRepo);
            set_text(text2, get(creatingRepo) ? "Creating..." : "Create Repository");
            set_attribute(a, "href", `https://github.com/${(((_b2 = (_a2 = $authStore()) == null ? void 0 : _a2.user) == null ? void 0 : _b2.login) || "YOUR_USERNAME") ?? ""}/skygit-config`);
            set_text(text_1, `github.com/${(((_d = (_c2 = $authStore()) == null ? void 0 : _c2.user) == null ? void 0 : _d.login) || "YOUR_USERNAME") ?? ""}/skygit-config`);
          });
          event("click", button, createRepo);
          append($$anchor3, div_1);
        };
        var alternate_4 = ($$anchor3) => {
          var fragment_1 = root_3$6();
          var table = first_child(fragment_1);
          var tbody = sibling(child(table));
          each(tbody, 5, () => Object.entries(get(secrets)), index, ($$anchor4, $$item) => {
            var $$array = /* @__PURE__ */ user_derived(() => to_array(get($$item), 2));
            let url = () => get($$array)[0];
            let value = () => get($$array)[1];
            var fragment_2 = root_4$5();
            var tr = first_child(fragment_2);
            var td = child(tr);
            var text_2 = child(td);
            var td_1 = sibling(td);
            var text_3 = child(td_1);
            var td_2 = sibling(td_1);
            var node_2 = child(td_2);
            {
              var consequent_1 = ($$anchor5) => {
                var text_4 = text();
                template_effect(() => set_text(text_4, get(decrypted)[url()].type === "s3" ? "S3" : "Google Drive"));
                append($$anchor5, text_4);
              };
              var alternate = ($$anchor5) => {
                var text_5 = text("?");
                append($$anchor5, text_5);
              };
              if_block(node_2, ($$render) => {
                if (get(decrypted)[url()]) $$render(consequent_1);
                else $$render(alternate, -1);
              });
            }
            var td_3 = sibling(td_2);
            var node_3 = child(td_3);
            {
              var consequent_3 = ($$anchor5) => {
                var fragment_4 = root_7$4();
                var button_1 = first_child(fragment_4);
                var node_4 = sibling(button_1, 2);
                {
                  var consequent_2 = ($$anchor6) => {
                    var button_2 = root_8$3();
                    event("click", button_2, () => saveEdit(url()));
                    append($$anchor6, button_2);
                  };
                  var alternate_1 = ($$anchor6) => {
                    var button_3 = root_9$4();
                    event("click", button_3, () => startEdit(url()));
                    append($$anchor6, button_3);
                  };
                  if_block(node_4, ($$render) => {
                    if (get(editing) === url()) $$render(consequent_2);
                    else $$render(alternate_1, -1);
                  });
                }
                event("click", button_1, () => hide(url()));
                append($$anchor5, fragment_4);
              };
              var d = /* @__PURE__ */ user_derived(() => get(revealed).has(url()));
              var alternate_2 = ($$anchor5) => {
                var button_4 = root_10$2();
                event("click", button_4, () => reveal(url()));
                append($$anchor5, button_4);
              };
              if_block(node_3, ($$render) => {
                if (get(d)) $$render(consequent_3);
                else $$render(alternate_2, -1);
              });
            }
            var button_5 = sibling(node_3, 2);
            var node_5 = sibling(tr, 2);
            {
              var consequent_6 = ($$anchor5) => {
                var tr_1 = root_11();
                var td_4 = child(tr_1);
                var node_6 = child(td_4);
                {
                  var consequent_5 = ($$anchor6) => {
                    var fragment_5 = root_12$1();
                    var label = first_child(fragment_5);
                    var select = sibling(child(label), 2);
                    var option = child(select);
                    var text_6 = child(option);
                    var option_value = {};
                    var node_7 = sibling(label, 2);
                    each(node_7, 1, () => Object.entries(get(editCredentials)), index, ($$anchor7, $$item2) => {
                      var $$array_1 = /* @__PURE__ */ user_derived(() => to_array(get($$item2), 2));
                      let key2 = () => get($$array_1)[0];
                      var fragment_6 = comment();
                      var node_8 = first_child(fragment_6);
                      {
                        var consequent_4 = ($$anchor8) => {
                          var label_1 = root_14$2();
                          var span = child(label_1);
                          var text_7 = child(span);
                          var input = sibling(span, 2);
                          template_effect(() => set_text(text_7, key2()));
                          bind_value(input, () => get(editCredentials)[key2()], ($$value) => mutate(editCredentials, get(editCredentials)[key2()] = $$value));
                          append($$anchor8, label_1);
                        };
                        if_block(node_8, ($$render) => {
                          if (key2() !== "type") $$render(consequent_4);
                        });
                      }
                      append($$anchor7, fragment_6);
                    });
                    template_effect(() => {
                      set_text(text_6, get(editCredentials).type);
                      if (option_value !== (option_value = get(editCredentials).type)) {
                        option.__value = get(editCredentials).type;
                      }
                    });
                    append($$anchor6, fragment_5);
                  };
                  var alternate_3 = ($$anchor6) => {
                    var pre = root_15$2();
                    var text_8 = child(pre);
                    template_effect(
                      ($0) => set_text(text_8, `${$0 ?? ""}
                                    `),
                      [() => JSON.stringify(get(decrypted)[url()], null, 2)]
                    );
                    append($$anchor6, pre);
                  };
                  if_block(node_6, ($$render) => {
                    if (get(editing) === url()) $$render(consequent_5);
                    else $$render(alternate_3, -1);
                  });
                }
                append($$anchor5, tr_1);
              };
              var d_1 = /* @__PURE__ */ user_derived(() => get(revealed).has(url()));
              if_block(node_5, ($$render) => {
                if (get(d_1)) $$render(consequent_6);
              });
            }
            template_effect(
              ($0) => {
                set_text(text_2, url());
                set_text(text_3, `${$0 ?? ""}...`);
              },
              [() => value().slice(0, 20)]
            );
            event("click", button_5, () => deleteCredential(url()));
            append($$anchor4, fragment_2);
          });
          var div_4 = sibling(table, 2);
          var div_5 = sibling(child(div_4), 2);
          var label_2 = child(div_5);
          var input_1 = sibling(child(label_2));
          var label_3 = sibling(label_2, 2);
          var select_1 = sibling(child(label_3));
          var option_1 = child(select_1);
          option_1.value = option_1.__value = "s3";
          var option_2 = sibling(option_1);
          option_2.value = option_2.__value = "google_drive";
          var node_9 = sibling(div_5, 2);
          {
            var consequent_7 = ($$anchor4) => {
              var div_6 = root_16$2();
              var label_4 = child(div_6);
              var input_2 = sibling(child(label_4));
              var label_5 = sibling(label_4, 2);
              var input_3 = sibling(child(label_5));
              var label_6 = sibling(label_5, 2);
              var input_4 = sibling(child(label_6));
              bind_value(input_2, () => get(newCredentials).accessKeyId, ($$value) => mutate(newCredentials, get(newCredentials).accessKeyId = $$value));
              bind_value(input_3, () => get(newCredentials).secretAccessKey, ($$value) => mutate(newCredentials, get(newCredentials).secretAccessKey = $$value));
              bind_value(input_4, () => get(newCredentials).region, ($$value) => mutate(newCredentials, get(newCredentials).region = $$value));
              append($$anchor4, div_6);
            };
            var consequent_8 = ($$anchor4) => {
              var div_7 = root_17$2();
              var div_8 = child(div_7);
              var button_6 = sibling(child(div_8), 4);
              var div_9 = sibling(div_8, 2);
              var div_10 = sibling(child(div_9), 2);
              var label_7 = child(div_10);
              var input_5 = sibling(child(label_7));
              var label_8 = sibling(label_7, 2);
              var input_6 = sibling(child(label_8));
              var label_9 = sibling(label_8, 2);
              var input_7 = sibling(child(label_9));
              event("click", button_6, () => set(showGoogleGuide, true));
              bind_value(input_5, () => get(newCredentials).client_id, ($$value) => mutate(newCredentials, get(newCredentials).client_id = $$value));
              bind_value(input_6, () => get(newCredentials).client_secret, ($$value) => mutate(newCredentials, get(newCredentials).client_secret = $$value));
              bind_value(input_7, () => get(newCredentials).refresh_token, ($$value) => mutate(newCredentials, get(newCredentials).refresh_token = $$value));
              append($$anchor4, div_7);
            };
            if_block(node_9, ($$render) => {
              if (get(newType) === "s3") $$render(consequent_7);
              else if (get(newType) === "google_drive") $$render(consequent_8, 1);
            });
          }
          var button_7 = sibling(node_9, 2);
          var div_11 = sibling(div_4, 2);
          var label_10 = sibling(child(div_11), 2);
          var input_8 = child(label_10);
          bind_value(input_1, () => get(newUrl), ($$value) => set(newUrl, $$value));
          bind_select_value(select_1, () => get(newType), ($$value) => set(newType, $$value));
          event("click", button_7, addCredential);
          bind_checked(input_8, () => get(cleanupMode), ($$value) => set(cleanupMode, $$value));
          event("change", input_8, saveCleanupMode);
          append($$anchor3, fragment_1);
        };
        if_block(node_1, ($$render) => {
          if (!get(repoExists)) $$render(consequent);
          else $$render(alternate_4, -1);
        });
      }
      append($$anchor2, div);
    },
    $$slots: { default: true }
  });
  var node_10 = sibling(node, 2);
  GoogleDriveSetupGuide(node_10, {
    get show() {
      return get(showGoogleGuide);
    },
    $$events: {
      complete: handleGoogleSetupComplete,
      close: () => set(showGoogleGuide, false)
    }
  });
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root_3$5 = /* @__PURE__ */ from_html(`<div class="bg-blue-50 p-2 rounded mb-2 text-xs border-l-2 border-blue-300"><div class="font-semibold text-blue-700"> </div> <div class="text-gray-600 truncate"> </div></div>`);
var root_5$4 = /* @__PURE__ */ from_html(`<span> </span>`);
var root_6$3 = /* @__PURE__ */ from_html(`<a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-blue-700 text-sm transition-colors"><!> <span class="max-w-[200px] truncate"> </span> <!></a>`);
var root_7$3 = /* @__PURE__ */ from_html(`<span class="inline-flex items-center gap-1 text-orange-500" title="Pending sync"><!> Pending</span>`);
var root_8$2 = /* @__PURE__ */ from_html(`<span class="inline-flex items-center gap-1 text-green-500" title="Synced"><!> Synced</span>`);
var root_9$3 = /* @__PURE__ */ from_html(`<button class="text-xs text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Reply</button>`);
var root_2$7 = /* @__PURE__ */ from_html(`<div class="bg-blue-100 p-2 rounded shadow text-sm flex gap-3 group relative"><div class="flex-shrink-0"><img class="w-8 h-8 rounded-full"/></div> <div class="flex-1"><!> <div class="font-semibold text-blue-800"> </div> <div class="space-y-1"></div> <div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2 text-xs text-gray-500"><!> <span class="text-gray-400">•</span> <span> </span></div> <!></div></div></div>`);
var root_10$1 = /* @__PURE__ */ from_html(`<p class="text-center text-gray-400 italic mt-10">No messages yet.</p>`);
var root$7 = /* @__PURE__ */ from_html(`<div class="p-4 space-y-3"><!></div>`);
function MessageList($$anchor, $$props) {
  push($$props, false);
  const $selectedConversationStore = () => store_get(selectedConversation, "$selectedConversationStore", $$stores);
  const $authStore = () => store_get(authStore, "$authStore", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  const effectiveConversation = /* @__PURE__ */ mutable_source();
  const messages = /* @__PURE__ */ mutable_source();
  const sortedMessages = /* @__PURE__ */ mutable_source();
  const messageMap = /* @__PURE__ */ mutable_source();
  const currentUsername = /* @__PURE__ */ mutable_source();
  let conversation = prop($$props, "conversation", 8, null);
  const dispatch = createEventDispatcher();
  function getDisplaySender(sender) {
    return sender === get(currentUsername) ? "You" : sender;
  }
  function handleReply(message) {
    dispatch("reply", message);
  }
  function parseMessageContent(content) {
    const filePattern = /\[📎\s*([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = filePattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index)
        });
      }
      parts.push({ type: "file", fileName: match[1], url: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({ type: "text", content: content.substring(lastIndex) });
    }
    return parts.length > 0 ? parts : [{ type: "text", content }];
  }
  legacy_pre_effect(
    () => (deep_read_state(conversation()), $selectedConversationStore()),
    () => {
      set(effectiveConversation, conversation() || $selectedConversationStore());
    }
  );
  legacy_pre_effect(() => get(effectiveConversation), () => {
    var _a2;
    set(messages, ((_a2 = get(effectiveConversation)) == null ? void 0 : _a2.messages) ?? []);
  });
  legacy_pre_effect(() => get(messages), () => {
    set(sortedMessages, [...get(messages)].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  });
  legacy_pre_effect(() => get(messages), () => {
    set(messageMap, get(messages).reduce(
      (map, msg) => {
        if (msg.hash) map[msg.hash] = msg;
        return map;
      },
      {}
    ));
  });
  legacy_pre_effect(() => $authStore(), () => {
    var _a2, _b2;
    set(currentUsername, (_b2 = (_a2 = $authStore()) == null ? void 0 : _a2.user) == null ? void 0 : _b2.login);
  });
  legacy_pre_effect_reset();
  init();
  var div = root$7();
  var node = child(div);
  {
    var consequent_5 = ($$anchor2) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      each(node_1, 3, () => get(sortedMessages), (msg, index2) => `${msg.id || msg.timestamp}-${msg.sender}-${index2}`, ($$anchor3, msg) => {
        var div_1 = root_2$7();
        var div_2 = child(div_1);
        var img = child(div_2);
        var div_3 = sibling(div_2, 2);
        var node_2 = child(div_3);
        {
          var consequent = ($$anchor4) => {
            var div_4 = root_3$5();
            var div_5 = child(div_4);
            var text2 = child(div_5);
            var div_6 = sibling(div_5, 2);
            var text_1 = child(div_6);
            template_effect(
              ($0) => {
                set_text(text2, $0);
                set_text(text_1, (get(messageMap), get(msg), untrack(() => get(messageMap)[get(msg).in_response_to].content)));
              },
              [
                () => (get(messageMap), get(msg), untrack(() => getDisplaySender(get(messageMap)[get(msg).in_response_to].sender)))
              ]
            );
            append($$anchor4, div_4);
          };
          if_block(node_2, ($$render) => {
            if (get(msg), get(messageMap), untrack(() => get(msg).in_response_to && get(messageMap)[get(msg).in_response_to])) $$render(consequent);
          });
        }
        var div_7 = sibling(node_2, 2);
        var text_2 = child(div_7);
        var div_8 = sibling(div_7, 2);
        each(
          div_8,
          5,
          () => (get(msg), untrack(() => parseMessageContent(get(msg).content))),
          index,
          ($$anchor4, part) => {
            var fragment_1 = comment();
            var node_3 = first_child(fragment_1);
            {
              var consequent_1 = ($$anchor5) => {
                var span = root_5$4();
                var text_3 = child(span);
                template_effect(() => set_text(text_3, (get(part), untrack(() => get(part).content))));
                append($$anchor5, span);
              };
              var consequent_2 = ($$anchor5) => {
                var a_1 = root_6$3();
                var node_4 = child(a_1);
                File_text(node_4, { class: "w-4 h-4" });
                var span_1 = sibling(node_4, 2);
                var text_4 = child(span_1);
                var node_5 = sibling(span_1, 2);
                External_link(node_5, { class: "w-3 h-3" });
                template_effect(() => {
                  set_attribute(a_1, "href", (get(part), untrack(() => get(part).url)));
                  set_text(text_4, (get(part), untrack(() => get(part).fileName)));
                });
                append($$anchor5, a_1);
              };
              if_block(node_3, ($$render) => {
                if (get(part), untrack(() => get(part).type === "text")) $$render(consequent_1);
                else if (get(part), untrack(() => get(part).type === "file")) $$render(consequent_2, 1);
              });
            }
            append($$anchor4, fragment_1);
          }
        );
        var div_9 = sibling(div_8, 2);
        var div_10 = child(div_9);
        var node_6 = child(div_10);
        {
          var consequent_3 = ($$anchor4) => {
            var span_2 = root_7$3();
            var node_7 = child(span_2);
            Clock(node_7, { class: "w-3 h-3" });
            append($$anchor4, span_2);
          };
          var alternate = ($$anchor4) => {
            var span_3 = root_8$2();
            var node_8 = child(span_3);
            Check(node_8, { class: "w-3 h-3" });
            append($$anchor4, span_3);
          };
          if_block(node_6, ($$render) => {
            if (get(msg), untrack(() => get(msg).pending)) $$render(consequent_3);
            else $$render(alternate, -1);
          });
        }
        var span_4 = sibling(node_6, 4);
        var text_5 = child(span_4);
        var node_9 = sibling(div_10, 2);
        {
          var consequent_4 = ($$anchor4) => {
            var button = root_9$3();
            event("click", button, () => handleReply(get(msg)));
            append($$anchor4, button);
          };
          if_block(node_9, ($$render) => {
            if (get(msg), untrack(() => get(msg).hash)) $$render(consequent_4);
          });
        }
        template_effect(
          ($0, $1) => {
            set_attribute(img, "src", `https://github.com/${(get(msg), untrack(() => get(msg).sender)) ?? ""}.png`);
            set_attribute(img, "alt", (get(msg), untrack(() => get(msg).sender)));
            set_text(text_2, $0);
            set_text(text_5, $1);
          },
          [
            () => (get(msg), untrack(() => getDisplaySender(get(msg).sender))),
            () => (get(msg), untrack(() => new Date(get(msg).timestamp).toLocaleString()))
          ]
        );
        append($$anchor3, div_1);
      });
      append($$anchor2, fragment);
    };
    var alternate_1 = ($$anchor2) => {
      var p = root_10$1();
      append($$anchor2, p);
    };
    if_block(node, ($$render) => {
      if (get(sortedMessages), untrack(() => get(sortedMessages).length > 0)) $$render(consequent_5);
      else $$render(alternate_1, -1);
    });
  }
  append($$anchor, div);
  pop();
  $$cleanup();
}
async function uploadToGoogleDrive(file, credentials, folderUrl) {
  const folderId = extractGoogleDriveFolderId(folderUrl);
  const tokenParams = new URLSearchParams();
  tokenParams.append("refresh_token", credentials.refresh_token);
  tokenParams.append("grant_type", "refresh_token");
  if (credentials.client_id) tokenParams.append("client_id", credentials.client_id);
  if (credentials.client_secret) tokenParams.append("client_secret", credentials.client_secret);
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams
  });
  const tokenJson = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok) {
    console.error("Token refresh failed:", tokenJson);
    if ((tokenJson == null ? void 0 : tokenJson.error) === "invalid_grant") {
      throw new Error(
        "Google rejected the stored refresh token. This usually means it was revoked or does not match the configured OAuth client. Please re-authorize your Google Drive credentials in Settings."
      );
    }
    throw new Error(`Failed to refresh access token: ${JSON.stringify(tokenJson)}`);
  }
  const { access_token } = tokenJson;
  const metadata = {
    name: file.name,
    parents: [folderId]
  };
  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", file);
  const uploadResponse = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`
    },
    body: formData
  });
  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file to Google Drive");
  }
  const result = await uploadResponse.json();
  const shareResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      role: "reader",
      type: "anyone"
    })
  });
  if (!shareResponse.ok) {
    console.warn("Failed to make file public, it will still be accessible to the uploader");
  }
  return {
    url: result.webViewLink,
    fileId: result.id,
    fileName: result.name
  };
}
async function uploadToS3(file, credentials, bucketUrl) {
  const { bucket, prefix } = parseS3Url(bucketUrl);
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key2 = `${prefix}/${timestamp}_${safeName}`;
  const formData = new FormData();
  formData.append("key", key2);
  formData.append("file", file);
  const response = await fetch(`https://${bucket}.s3.amazonaws.com/`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    throw new Error("Failed to upload file to S3");
  }
  return {
    url: `https://${bucket}.s3.amazonaws.com/${key2}`,
    fileName: file.name
  };
}
async function uploadToGitFS(file, repo, token, folderPath = "recordings") {
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large for GitFS. Limit is 50MB, your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
  }
  const MAX_REPO_SIZE_KB = 1e3 * 1024;
  const repoDetails = await fetch(`https://api.github.com/repos/${repo.full_name}`, {
    headers: {
      "Authorization": `token ${token}`,
      "Accept": "application/vnd.github.v3+json"
    }
  }).then((res) => res.json());
  if (repoDetails.size > MAX_REPO_SIZE_KB) {
    throw new Error(`Repository is too large (${(repoDetails.size / 1024).toFixed(2)}MB). Limit is 1GB. Please use S3 or Google Drive.`);
  }
  const buffer = await file.arrayBuffer();
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  const content = btoa(binary);
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const cleanPath = folderPath.replace(/^\//, "");
  const path = `${cleanPath}/${timestamp}_${safeName}`;
  const response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Upload recording: ${file.name}`,
      content
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Failed to upload to GitFS: ${err.message}`);
  }
  const data = await response.json();
  return {
    url: data.content.html_url,
    // Link to file in GitHub UI
    fileName: file.name,
    fileId: data.content.sha
  };
}
function extractGoogleDriveFolderId(url) {
  const match = url.match(/folders\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error("Invalid Google Drive folder URL");
  }
  return match[1];
}
function parseS3Url(url) {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/").filter(Boolean);
  if (urlObj.hostname.includes("s3")) {
    return {
      bucket: urlObj.hostname.split(".")[0],
      prefix: pathParts.join("/")
    };
  } else {
    return {
      bucket: pathParts[0],
      prefix: pathParts.slice(1).join("/")
    };
  }
}
async function uploadFile(file, repo, token, destinationUrl = null) {
  var _a2, _b2, _c2;
  const storageType = ((_a2 = repo.config) == null ? void 0 : _a2.binary_storage_type) || "gitfs";
  const configUrl = ((_c2 = (_b2 = repo.config) == null ? void 0 : _b2.storage_info) == null ? void 0 : _c2.url) || "recordings";
  const targetUrl = destinationUrl || configUrl;
  let credentials = null;
  if (storageType !== "gitfs") {
    const { secrets } = await getSecretsMap(token);
    const encryptedCreds = secrets[configUrl];
    if (!encryptedCreds) {
      throw new Error("No credentials found for storage URL");
    }
    credentials = await decryptJSON(token, encryptedCreds);
  }
  let result;
  if (storageType === "google_drive") {
    result = await uploadToGoogleDrive(file, credentials, targetUrl);
  } else if (storageType === "s3") {
    result = await uploadToS3(file, credentials, targetUrl);
  } else if (storageType === "gitfs") {
    result = await uploadToGitFS(file, repo, token, targetUrl || "recordings");
  } else {
    throw new Error(`Unsupported storage type: ${storageType}`);
  }
  await recordFileUpload(token, repo, {
    fileName: result.fileName,
    fileUrl: result.url,
    fileSize: file.size,
    mimeType: file.type,
    uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
    storageType
  });
  return result;
}
async function recordFileUpload(token, repo, fileMetadata) {
  const path = `.skygit/files/${Date.now()}_${fileMetadata.fileName}.json`;
  const content = btoa(JSON.stringify(fileMetadata, null, 2));
  const response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Upload file: ${fileMetadata.fileName}`,
      content
    })
  });
  if (!response.ok) {
    console.warn("Failed to record file upload metadata");
  }
}
async function getRepositoryFiles(token, repo) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/.skygit/files`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json"
      }
    });
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error("Failed to fetch files");
    }
    const files = await response.json();
    const fileMetadata = [];
    for (const file of files) {
      if (file.name.endsWith(".json")) {
        try {
          const contentResponse = await fetch(file.download_url);
          const metadata = await contentResponse.json();
          fileMetadata.push(metadata);
        } catch (e) {
          console.warn("Failed to parse file metadata:", file.name);
        }
      }
    }
    return fileMetadata.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  } catch (error) {
    console.error("Failed to get repository files:", error);
    return [];
  }
}
function getAvailableCallPeers(onlinePeers2, localPeerId, conversation) {
  return onlinePeers2.filter((peer) => {
    var _a2;
    if (peer.session_id === localPeerId) return false;
    if (((_a2 = conversation == null ? void 0 : conversation.participants) == null ? void 0 : _a2.length) > 0) {
      return conversation.participants.includes(peer.username);
    }
    return true;
  });
}
var root_1$6 = /* @__PURE__ */ from_html(`<div class="bg-gray-100 px-3 py-2 rounded text-sm flex items-center justify-between"><div class="flex-1"><div class="text-xs text-gray-500 mb-1"> </div> <div class="text-gray-700 truncate"> </div></div> <button class="ml-2 text-gray-500 hover:text-gray-700" aria-label="Cancel reply"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
var root_2$6 = /* @__PURE__ */ from_html(`<div class="bg-blue-50 px-3 py-2 rounded text-sm flex items-center justify-between"><div class="flex items-center gap-2 flex-1"><!> <span class="text-blue-700 truncate"> </span> <span class="text-xs text-blue-500"> </span></div> <button class="ml-2 text-blue-500 hover:text-blue-700" aria-label="Remove selected file"><!></button></div>`);
var root_3$4 = /* @__PURE__ */ from_html(`<input type="file" class="hidden"/> <button class="text-gray-500 hover:text-gray-700 p-2" title="Attach file"><!></button>`, 1);
var root_8$1 = /* @__PURE__ */ from_html(`<span class="w-2 h-2 bg-green-500 rounded-full ml-auto"></span>`);
var root_7$2 = /* @__PURE__ */ from_html(`<button><img class="w-6 h-6 rounded-full"/> <span class="font-medium text-sm"> </span> <!></button>`);
var root_6$2 = /* @__PURE__ */ from_html(`<div class="absolute bottom-full left-0 mb-1 w-64 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"></div>`);
var root$6 = /* @__PURE__ */ from_html(`<div class="space-y-2"><!> <!> <div class="flex items-center gap-2"><!> <button class="text-gray-500 hover:text-gray-700 p-2"><!></button> <div class="relative flex-1"><input type="text" class="w-full border rounded px-3 py-2 text-sm"/> <!></div> <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50"> </button></div></div>`);
function MessageInput($$anchor, $$props) {
  push($$props, false);
  const $sortedContacts = () => store_get(sortedContacts, "$sortedContacts", $$stores);
  const $onlinePeers = () => store_get(onlinePeers, "$onlinePeers", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  const mentionSuggestions = /* @__PURE__ */ mutable_source();
  const hasStorageConfigured = /* @__PURE__ */ mutable_source();
  const localPeerId = /* @__PURE__ */ mutable_source();
  const availablePeers = /* @__PURE__ */ mutable_source();
  let conversation = prop($$props, "conversation", 8);
  let replyingTo = prop(
    $$props,
    "replyingTo",
    12,
    null
    // Message being replied to
  );
  let repo = prop(
    $$props,
    "repo",
    8,
    null
    // Repository info for file uploads
  );
  let message = /* @__PURE__ */ mutable_source("");
  let typingTimeout = null;
  let isTyping = false;
  let fileInput = /* @__PURE__ */ mutable_source();
  let uploadingFile = /* @__PURE__ */ mutable_source(false);
  let selectedFile = /* @__PURE__ */ mutable_source(null);
  let inputElement = /* @__PURE__ */ mutable_source();
  let showMentionPopup = /* @__PURE__ */ mutable_source(false);
  let mentionQuery = /* @__PURE__ */ mutable_source("");
  let mentionStartIndex = -1;
  let selectedMentionIndex = /* @__PURE__ */ mutable_source(0);
  function handleTyping() {
    if (!isTyping) {
      isTyping = true;
      broadcastTypingStatus(true);
    }
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    typingTimeout = setTimeout(
      () => {
        isTyping = false;
        broadcastTypingStatus(false);
      },
      2e3
    );
  }
  async function handleFileSelect(event2) {
    const file = event2.target.files[0];
    if (file) {
      set(selectedFile, file);
    }
  }
  async function removeSelectedFile() {
    set(selectedFile, null);
    if (get(fileInput)) {
      mutate(fileInput, get(fileInput).value = "");
    }
  }
  function handleMentionInput(event2) {
    var _a2;
    const value = get(message);
    const cursorPos = ((_a2 = get(inputElement)) == null ? void 0 : _a2.selectionStart) || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && textAfterAt.length <= 20) {
        set(mentionQuery, textAfterAt);
        mentionStartIndex = lastAtIndex;
        set(showMentionPopup, true);
        set(selectedMentionIndex, 0);
        return;
      }
    }
    set(showMentionPopup, false);
    set(mentionQuery, "");
  }
  function selectMention(username) {
    var _a2;
    const before = get(message).substring(0, mentionStartIndex);
    const after = get(message).substring(mentionStartIndex + get(mentionQuery).length + 1);
    set(message, `${before}@${username} ${after}`);
    set(showMentionPopup, false);
    set(mentionQuery, "");
    (_a2 = get(inputElement)) == null ? void 0 : _a2.focus();
  }
  function handleMentionKeydown(event2) {
    if (!get(showMentionPopup) || get(mentionSuggestions).length === 0) return;
    if (event2.key === "ArrowDown") {
      event2.preventDefault();
      set(selectedMentionIndex, (get(selectedMentionIndex) + 1) % get(mentionSuggestions).length);
    } else if (event2.key === "ArrowUp") {
      event2.preventDefault();
      set(selectedMentionIndex, (get(selectedMentionIndex) - 1 + get(mentionSuggestions).length) % get(mentionSuggestions).length);
    } else if (event2.key === "Tab" || event2.key === "Enter") {
      if (get(showMentionPopup) && get(mentionSuggestions).length > 0) {
        event2.preventDefault();
        selectMention(get(mentionSuggestions)[get(selectedMentionIndex)].username);
      }
    } else if (event2.key === "Escape") {
      set(showMentionPopup, false);
    }
  }
  function extractMentions(text2) {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text2)) !== null) {
      mentions.push(match[1]);
    }
    return [...new Set(mentions)];
  }
  async function notifyMentionedUsers(messageContent, senderUsername, token) {
    const mentions = extractMentions(messageContent);
    for (const mentionedUser of mentions) {
      if (mentionedUser.toLowerCase() === senderUsername.toLowerCase()) continue;
      const notification = createMessageNotification(senderUsername, messageContent.substring(0, 100));
      notification.type = "mention";
      notification.message = `${senderUsername} mentioned you`;
      try {
        await sendNotification(token, mentionedUser, notification);
      } catch (err) {
        console.warn(`[Mention] Could not notify ${mentionedUser}:`, err);
      }
    }
  }
  async function send() {
    var _a2, _b2, _c2;
    if (!get(message).trim() && !get(selectedFile)) return;
    const auth = get$1(authStore);
    const username = (_b2 = (_a2 = auth.user) == null ? void 0 : _a2.login) == null ? void 0 : _b2.toLowerCase();
    const token = auth.token;
    let fileUrl = null;
    let fileName = null;
    if (get(selectedFile) && repo()) {
      set(uploadingFile, true);
      try {
        const uploadResult = await uploadFile(get(selectedFile), repo(), token);
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
      } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to upload file: " + error.message);
        set(uploadingFile, false);
        return;
      }
      set(uploadingFile, false);
    }
    let messageContent = get(message).trim();
    if (fileUrl) {
      const fileLink = `[📎 ${fileName}](${fileUrl})`;
      messageContent = messageContent ? `${messageContent}

${fileLink}` : fileLink;
    }
    if (!messageContent) return;
    const previousHash = getPreviousMessageHash(conversation().messages || []);
    const messageHash = await computeMessageHash(previousHash, username || "Unknown", messageContent);
    const newMessage = {
      id: crypto.randomUUID(),
      sender: username || "Unknown",
      content: messageContent,
      timestamp: Date.now(),
      hash: messageHash,
      in_response_to: ((_c2 = replyingTo()) == null ? void 0 : _c2.hash) || null,
      // Include reply reference if replying
      attachment: fileUrl ? { url: fileUrl, fileName } : null,
      pending: true
    };
    appendMessage(conversation().id, conversation().repo, newMessage);
    const chatMsg = {
      id: newMessage.id,
      conversationId: conversation().id,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      hash: newMessage.hash,
      in_response_to: newMessage.in_response_to,
      attachment: newMessage.attachment
    };
    broadcastMessage({ type: "chat", ...chatMsg }, conversation().id);
    queueConversationForCommit(conversation().repo, conversation().id);
    notifyMentionedUsers(messageContent, username, token);
    if (isTyping) {
      isTyping = false;
      broadcastTypingStatus(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
    set(message, "");
    set(showMentionPopup, false);
    replyingTo(
      null
      // Clear reply reference
    );
    set(selectedFile, null);
    if (get(fileInput)) {
      mutate(fileInput, get(fileInput).value = "");
    }
  }
  function initiateCall() {
    if (get(availablePeers).length > 0) {
      startCall(get(availablePeers)[0].session_id);
    } else {
      alert("No online peers to call in this conversation.");
    }
  }
  legacy_pre_effect(() => ($sortedContacts(), get(mentionQuery)), () => {
    set(mentionSuggestions, $sortedContacts().filter((c) => c.username.toLowerCase().includes(get(mentionQuery).toLowerCase())).slice(0, 5));
  });
  legacy_pre_effect(() => deep_read_state(repo()), () => {
    var _a2, _b2, _c2, _d, _e;
    set(hasStorageConfigured, ((_b2 = (_a2 = repo()) == null ? void 0 : _a2.config) == null ? void 0 : _b2.binary_storage_type) && ((_e = (_d = (_c2 = repo()) == null ? void 0 : _c2.config) == null ? void 0 : _d.storage_info) == null ? void 0 : _e.url));
  });
  legacy_pre_effect(() => getLocalPeerId, () => {
    set(localPeerId, getLocalPeerId());
  });
  legacy_pre_effect(
    () => ($onlinePeers(), get(localPeerId), deep_read_state(conversation())),
    () => {
      set(availablePeers, getAvailableCallPeers($onlinePeers(), get(localPeerId), conversation()));
    }
  );
  legacy_pre_effect_reset();
  init();
  var div = root$6();
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var div_1 = root_1$6();
      var div_2 = child(div_1);
      var div_3 = child(div_2);
      var text_1 = child(div_3);
      var div_4 = sibling(div_3, 2);
      var text_2 = child(div_4);
      var button = sibling(div_2, 2);
      template_effect(() => {
        set_text(text_1, `Replying to ${(deep_read_state(replyingTo()), untrack(() => replyingTo().sender)) ?? ""}`);
        set_text(text_2, (deep_read_state(replyingTo()), untrack(() => replyingTo().content)));
      });
      event("click", button, () => replyingTo(null));
      append($$anchor2, div_1);
    };
    if_block(node, ($$render) => {
      if (replyingTo()) $$render(consequent);
    });
  }
  var node_1 = sibling(node, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_5 = root_2$6();
      var div_6 = child(div_5);
      var node_2 = child(div_6);
      Paperclip(node_2, { class: "w-4 h-4 text-blue-600" });
      var span = sibling(node_2, 2);
      var text_3 = child(span);
      var span_1 = sibling(span, 2);
      var text_4 = child(span_1);
      var button_1 = sibling(div_6, 2);
      var node_3 = child(button_1);
      X(node_3, { class: "w-4 h-4" });
      template_effect(
        ($0) => {
          set_text(text_3, (get(selectedFile), untrack(() => get(selectedFile).name)));
          set_text(text_4, `(${$0 ?? ""} KB)`);
          button_1.disabled = get(uploadingFile);
        },
        [
          () => (get(selectedFile), untrack(() => (get(selectedFile).size / 1024).toFixed(1)))
        ]
      );
      event("click", button_1, removeSelectedFile);
      append($$anchor2, div_5);
    };
    if_block(node_1, ($$render) => {
      if (get(selectedFile)) $$render(consequent_1);
    });
  }
  var div_7 = sibling(node_1, 2);
  var node_4 = child(div_7);
  {
    var consequent_3 = ($$anchor2) => {
      var fragment = root_3$4();
      var input = first_child(fragment);
      bind_this(input, ($$value) => set(fileInput, $$value), () => get(fileInput));
      var button_2 = sibling(input, 2);
      var node_5 = child(button_2);
      {
        var consequent_2 = ($$anchor3) => {
          Loader_circle($$anchor3, { class: "w-5 h-5 animate-spin" });
        };
        var alternate = ($$anchor3) => {
          Paperclip($$anchor3, { class: "w-5 h-5" });
        };
        if_block(node_5, ($$render) => {
          if (get(uploadingFile)) $$render(consequent_2);
          else $$render(alternate, -1);
        });
      }
      template_effect(() => {
        input.disabled = get(uploadingFile);
        button_2.disabled = get(uploadingFile);
      });
      event("change", input, handleFileSelect);
      event("click", button_2, () => get(fileInput).click());
      append($$anchor2, fragment);
    };
    if_block(node_4, ($$render) => {
      if (get(hasStorageConfigured)) $$render(consequent_3);
    });
  }
  var button_3 = sibling(node_4, 2);
  var node_6 = child(button_3);
  {
    let $0 = /* @__PURE__ */ derived_safe_equal(() => (get(availablePeers), untrack(() => get(availablePeers).length > 0 ? "text-green-600" : "text-gray-300")));
    Video(node_6, {
      get class() {
        return `w-5 h-5 ${get($0) ?? ""}`;
      }
    });
  }
  var div_8 = sibling(button_3, 2);
  var input_1 = child(div_8);
  bind_this(input_1, ($$value) => set(inputElement, $$value), () => get(inputElement));
  var node_7 = sibling(input_1, 2);
  {
    var consequent_5 = ($$anchor2) => {
      var div_9 = root_6$2();
      each(div_9, 7, () => get(mentionSuggestions), (suggestion) => suggestion.username, ($$anchor3, suggestion, i) => {
        var button_4 = root_7$2();
        var img = child(button_4);
        var span_2 = sibling(img, 2);
        var text_5 = child(span_2);
        var node_8 = sibling(span_2, 2);
        {
          var consequent_4 = ($$anchor4) => {
            var span_3 = root_8$1();
            append($$anchor4, span_3);
          };
          if_block(node_8, ($$render) => {
            if (get(suggestion), untrack(() => get(suggestion).online)) $$render(consequent_4);
          });
        }
        template_effect(() => {
          set_class(button_4, 1, `w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left
                ${get(i) === get(selectedMentionIndex) ? "bg-blue-50" : ""}`);
          set_attribute(img, "src", `https://github.com/${(get(suggestion), untrack(() => get(suggestion).username)) ?? ""}.png`);
          set_attribute(img, "alt", (get(suggestion), untrack(() => get(suggestion).username)));
          set_text(text_5, `@${(get(suggestion), untrack(() => get(suggestion).username)) ?? ""}`);
        });
        event("click", button_4, () => selectMention(get(suggestion).username));
        append($$anchor3, button_4);
      });
      append($$anchor2, div_9);
    };
    if_block(node_7, ($$render) => {
      if (get(showMentionPopup), get(mentionSuggestions), untrack(() => get(showMentionPopup) && get(mentionSuggestions).length > 0)) $$render(consequent_5);
    });
  }
  var button_5 = sibling(div_8, 2);
  var text_6 = child(button_5);
  template_effect(
    ($0) => {
      set_attribute(button_3, "title", (get(availablePeers), untrack(() => get(availablePeers).length > 0 ? `Call ${get(availablePeers)[0].username}` : "No peers online")));
      button_3.disabled = (get(availablePeers), untrack(() => get(availablePeers).length === 0));
      set_attribute(input_1, "placeholder", replyingTo() ? "Type your reply... (@ to mention)" : "Type a message... (@ to mention)");
      input_1.disabled = get(uploadingFile);
      button_5.disabled = $0;
      set_text(text_6, get(uploadingFile) ? "Uploading..." : "Send");
    },
    [
      () => (get(uploadingFile), get(message), get(selectedFile), untrack(() => get(uploadingFile) || !get(message).trim() && !get(selectedFile)))
    ]
  );
  event("click", button_3, initiateCall);
  bind_value(input_1, () => get(message), ($$value) => set(message, $$value));
  event("keydown", input_1, (e) => {
    handleMentionKeydown(e);
    if (e.key === "Enter" && !e.shiftKey && !get(showMentionPopup)) send();
  });
  event("input", input_1, (e) => {
    handleTyping();
    handleMentionInput();
  });
  event("click", button_5, send);
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root_9$2 = /* @__PURE__ */ from_html(`<div class="flex flex-row justify-center items-center py-2"><span class="bg-yellow-300 text-black px-2 py-1 rounded font-bold text-xs">Remote is sharing their screen<!>!</span></div>`);
var root_13$1 = /* @__PURE__ */ from_html(`<button class="bg-yellow-100 border px-3 py-1 rounded">🔄 Change Screen Source</button>`);
var root_14$1 = /* @__PURE__ */ from_html(`<span>🎤</span>`);
var root_15$1 = /* @__PURE__ */ from_html(`<span>🔇</span>`);
var root_16$1 = /* @__PURE__ */ from_html(`<span>📷</span>`);
var root_17$1 = /* @__PURE__ */ from_html(`<span>🚫📷</span>`);
var root_18$1 = /* @__PURE__ */ from_html(`<span>⏹️ Stop Recording</span>`);
var root_19 = /* @__PURE__ */ from_html(`<span>⏺️ Start Recording</span>`);
var root_20 = /* @__PURE__ */ from_html(`<div class="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 animate-pulse"><span>⏺️ Recording...</span></div>`);
var root_21 = /* @__PURE__ */ from_html(`<div class="fixed top-16 right-4 z-50 bg-yellow-400 text-black px-4 py-2 rounded shadow-lg flex items-center gap-2"><span>⚠️ Peer is recording</span></div>`);
var root_23 = /* @__PURE__ */ from_html(`<div class="fixed z-50 flex flex-col items-end cursor-move" tabindex="-1" aria-hidden="true"><div class="bg-white border shadow-lg rounded-lg p-2 flex flex-col items-center relative"><button class="absolute top-1 right-1 text-gray-400 hover:text-black text-lg font-bold px-1" style="z-index:2;" title="Close Preview">×</button> <div class="text-xs text-gray-500 mb-1">Screen Share Preview</div> <video autoplay="" playsinline="" width="160" height="100" style="border-radius: 0.5rem; background: #222;"><track kind="captions"/></video></div></div>`, 2);
var root_24 = /* @__PURE__ */ from_html(`<button class="fixed bottom-6 right-6 z-50 bg-white border shadow rounded-full px-3 py-2 text-xs font-bold hover:bg-blue-100">Show Screen Preview</button>`);
var root_25 = /* @__PURE__ */ from_html(`<div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"><div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3"><div class="font-bold mb-2">Select what to share</div> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Entire Screen</button> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Application Window</button> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Browser Tab</button> <button class="mt-2 text-sm text-gray-500 hover:text-black">Cancel</button></div></div>`);
var root_26 = /* @__PURE__ */ from_html(`<div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"><div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3"><div class="font-bold mb-2">Choose upload destination</div> <button class="bg-blue-200 rounded px-3 py-2 hover:bg-blue-300">Google Drive</button> <button class="bg-yellow-200 rounded px-3 py-2 hover:bg-yellow-300">S3</button> <button class="mt-2 text-sm text-gray-500 hover:text-black">Cancel</button></div></div>`);
var root$5 = /* @__PURE__ */ from_html(`<div class="flex flex-row justify-center items-center py-4 gap-4"><div><div class="text-xs text-gray-400 mb-1">Local Video</div> <video autoplay="" playsinline="" width="200" height="150" style="background: #222;"><track kind="captions"/></video> <div class="flex flex-row gap-2 justify-center mt-1"><span class="text-xs"><!></span> <span class="text-xs"><!></span></div></div> <div><div class="text-xs text-gray-400 mb-1">Remote Video</div> <video autoplay="" playsinline="" width="200" height="150" style="background: #222;"><track kind="captions"/></video> <div class="flex flex-row gap-2 justify-center mt-1"><span class="text-xs"><!></span> <span class="text-xs"><!></span></div></div></div> <!> <div class="flex flex-row items-center gap-3 justify-center mt-2"><label class="bg-gray-100 border px-3 py-1 rounded cursor-pointer">📎 Share File <input type="file" style="display:none"/></label> <button class="bg-blue-100 border px-3 py-1 rounded"><!></button> <!> <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1"><!></button> <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1"><!></button> <button class="bg-red-200 border px-3 py-1 rounded flex items-center gap-1 font-bold"><!></button></div> <!> <!> <!> <!> <!>`, 3);
function ConversationCallPanel($$anchor, $$props) {
  push($$props, false);
  let localStream2 = prop($$props, "localStream", 8, null);
  let remoteStream2 = prop($$props, "remoteStream", 8, null);
  let micOn = prop($$props, "micOn", 8, true);
  let cameraOn = prop($$props, "cameraOn", 8, true);
  let remoteMicOn = prop($$props, "remoteMicOn", 8, true);
  let remoteCameraOn = prop($$props, "remoteCameraOn", 8, true);
  let remoteScreenSharing = prop($$props, "remoteScreenSharing", 8, false);
  let remoteScreenShareMeta = prop($$props, "remoteScreenShareMeta", 8, null);
  let screenSharing = prop($$props, "screenSharing", 8, false);
  let screenShareStream = prop($$props, "screenShareStream", 8, null);
  let previewVisible = prop($$props, "previewVisible", 8, true);
  let previewPos = prop($$props, "previewPos", 24, () => ({ x: 0, y: 0 }));
  let recording = prop($$props, "recording", 8, false);
  let remoteRecording = prop($$props, "remoteRecording", 8, false);
  let showShareTypeModal = prop($$props, "showShareTypeModal", 8, false);
  let showUploadDestinationModal = prop($$props, "showUploadDestinationModal", 8, false);
  let onFileInput = prop($$props, "onFileInput", 8, () => {
  });
  let onOpenShareTypeModal = prop($$props, "onOpenShareTypeModal", 8, () => {
  });
  let onCloseShareTypeModal = prop($$props, "onCloseShareTypeModal", 8, () => {
  });
  let onSelectShareType = prop($$props, "onSelectShareType", 8, () => {
  });
  let onStopScreenShare = prop($$props, "onStopScreenShare", 8, () => {
  });
  let onChangeScreenSource = prop($$props, "onChangeScreenSource", 8, () => {
  });
  let onToggleMic = prop($$props, "onToggleMic", 8, () => {
  });
  let onToggleCamera = prop($$props, "onToggleCamera", 8, () => {
  });
  let onToggleRecording = prop($$props, "onToggleRecording", 8, () => {
  });
  let onPreviewMouseDown = prop($$props, "onPreviewMouseDown", 8, () => {
  });
  let onClosePreview = prop($$props, "onClosePreview", 8, () => {
  });
  let onReopenPreview = prop($$props, "onReopenPreview", 8, () => {
  });
  let onSelectUploadDestination = prop($$props, "onSelectUploadDestination", 8, () => {
  });
  let onResetUploadDestination = prop($$props, "onResetUploadDestination", 8, () => {
  });
  let localVideoEl = /* @__PURE__ */ mutable_source();
  let remoteVideoEl = /* @__PURE__ */ mutable_source();
  let screenSharePreviewEl = /* @__PURE__ */ mutable_source();
  legacy_pre_effect(() => (get(localVideoEl), deep_read_state(localStream2())), () => {
    if (get(localVideoEl) && localStream2()) {
      mutate(localVideoEl, get(localVideoEl).srcObject = localStream2());
    }
  });
  legacy_pre_effect(() => (get(remoteVideoEl), deep_read_state(remoteStream2())), () => {
    if (get(remoteVideoEl) && remoteStream2()) {
      mutate(remoteVideoEl, get(remoteVideoEl).srcObject = remoteStream2());
    }
  });
  legacy_pre_effect(
    () => (get(screenSharePreviewEl), deep_read_state(screenShareStream())),
    () => {
      if (get(screenSharePreviewEl) && screenShareStream()) {
        mutate(screenSharePreviewEl, get(screenSharePreviewEl).srcObject = screenShareStream());
      }
    }
  );
  legacy_pre_effect_reset();
  init();
  var fragment = root$5();
  var div = first_child(fragment);
  var div_1 = child(div);
  var video = sibling(child(div_1), 2);
  video.muted = true;
  bind_this(video, ($$value) => set(localVideoEl, $$value), () => get(localVideoEl));
  var div_2 = sibling(video, 2);
  var span = child(div_2);
  var node = child(span);
  {
    var consequent = ($$anchor2) => {
      var text$1 = text("🎤 Mic On");
      append($$anchor2, text$1);
    };
    var alternate = ($$anchor2) => {
      var text_1 = text("🔇 Mic Off");
      append($$anchor2, text_1);
    };
    if_block(node, ($$render) => {
      if (micOn()) $$render(consequent);
      else $$render(alternate, -1);
    });
  }
  var span_1 = sibling(span, 2);
  var node_1 = child(span_1);
  {
    var consequent_1 = ($$anchor2) => {
      var text_2 = text("📷 Cam On");
      append($$anchor2, text_2);
    };
    var alternate_1 = ($$anchor2) => {
      var text_3 = text("🚫📷 Cam Off");
      append($$anchor2, text_3);
    };
    if_block(node_1, ($$render) => {
      if (cameraOn()) $$render(consequent_1);
      else $$render(alternate_1, -1);
    });
  }
  var div_3 = sibling(div_1, 2);
  var video_1 = sibling(child(div_3), 2);
  bind_this(video_1, ($$value) => set(remoteVideoEl, $$value), () => get(remoteVideoEl));
  var div_4 = sibling(video_1, 2);
  var span_2 = child(div_4);
  var node_2 = child(span_2);
  {
    var consequent_2 = ($$anchor2) => {
      var text_4 = text("🎤 Mic On");
      append($$anchor2, text_4);
    };
    var alternate_2 = ($$anchor2) => {
      var text_5 = text("🔇 Mic Off");
      append($$anchor2, text_5);
    };
    if_block(node_2, ($$render) => {
      if (remoteMicOn()) $$render(consequent_2);
      else $$render(alternate_2, -1);
    });
  }
  var span_3 = sibling(span_2, 2);
  var node_3 = child(span_3);
  {
    var consequent_3 = ($$anchor2) => {
      var text_6 = text("📷 Cam On");
      append($$anchor2, text_6);
    };
    var alternate_3 = ($$anchor2) => {
      var text_7 = text("🚫📷 Cam Off");
      append($$anchor2, text_7);
    };
    if_block(node_3, ($$render) => {
      if (remoteCameraOn()) $$render(consequent_3);
      else $$render(alternate_3, -1);
    });
  }
  var node_4 = sibling(div, 2);
  {
    var consequent_5 = ($$anchor2) => {
      var div_5 = root_9$2();
      var span_4 = child(div_5);
      var node_5 = sibling(child(span_4));
      {
        var consequent_4 = ($$anchor3) => {
          var text_8 = text("(with audio)");
          append($$anchor3, text_8);
        };
        if_block(node_5, ($$render) => {
          if (deep_read_state(remoteScreenShareMeta()), untrack(() => {
            var _a2;
            return (_a2 = remoteScreenShareMeta()) == null ? void 0 : _a2.audio;
          })) $$render(consequent_4);
        });
      }
      append($$anchor2, div_5);
    };
    if_block(node_4, ($$render) => {
      if (remoteScreenSharing()) $$render(consequent_5);
    });
  }
  var div_6 = sibling(node_4, 2);
  var label = child(div_6);
  var input = sibling(child(label));
  var button = sibling(label, 2);
  var node_6 = child(button);
  {
    var consequent_6 = ($$anchor2) => {
      var text_9 = text("🛑 Stop Sharing");
      append($$anchor2, text_9);
    };
    var alternate_4 = ($$anchor2) => {
      var text_10 = text("🖥️ Share Screen");
      append($$anchor2, text_10);
    };
    if_block(node_6, ($$render) => {
      if (screenSharing()) $$render(consequent_6);
      else $$render(alternate_4, -1);
    });
  }
  var node_7 = sibling(button, 2);
  {
    var consequent_7 = ($$anchor2) => {
      var button_1 = root_13$1();
      event("click", button_1, function(...$$args) {
        var _a2;
        (_a2 = onChangeScreenSource()) == null ? void 0 : _a2.apply(this, $$args);
      });
      append($$anchor2, button_1);
    };
    if_block(node_7, ($$render) => {
      if (screenSharing()) $$render(consequent_7);
    });
  }
  var button_2 = sibling(node_7, 2);
  var node_8 = child(button_2);
  {
    var consequent_8 = ($$anchor2) => {
      var span_5 = root_14$1();
      append($$anchor2, span_5);
    };
    var alternate_5 = ($$anchor2) => {
      var span_6 = root_15$1();
      append($$anchor2, span_6);
    };
    if_block(node_8, ($$render) => {
      if (micOn()) $$render(consequent_8);
      else $$render(alternate_5, -1);
    });
  }
  var button_3 = sibling(button_2, 2);
  var node_9 = child(button_3);
  {
    var consequent_9 = ($$anchor2) => {
      var span_7 = root_16$1();
      append($$anchor2, span_7);
    };
    var alternate_6 = ($$anchor2) => {
      var span_8 = root_17$1();
      append($$anchor2, span_8);
    };
    if_block(node_9, ($$render) => {
      if (cameraOn()) $$render(consequent_9);
      else $$render(alternate_6, -1);
    });
  }
  var button_4 = sibling(button_3, 2);
  var node_10 = child(button_4);
  {
    var consequent_10 = ($$anchor2) => {
      var span_9 = root_18$1();
      append($$anchor2, span_9);
    };
    var alternate_7 = ($$anchor2) => {
      var span_10 = root_19();
      append($$anchor2, span_10);
    };
    if_block(node_10, ($$render) => {
      if (recording()) $$render(consequent_10);
      else $$render(alternate_7, -1);
    });
  }
  var node_11 = sibling(div_6, 2);
  {
    var consequent_11 = ($$anchor2) => {
      var div_7 = root_20();
      append($$anchor2, div_7);
    };
    if_block(node_11, ($$render) => {
      if (recording()) $$render(consequent_11);
    });
  }
  var node_12 = sibling(node_11, 2);
  {
    var consequent_12 = ($$anchor2) => {
      var div_8 = root_21();
      append($$anchor2, div_8);
    };
    if_block(node_12, ($$render) => {
      if (remoteRecording()) $$render(consequent_12);
    });
  }
  var node_13 = sibling(node_12, 2);
  {
    var consequent_14 = ($$anchor2) => {
      var fragment_1 = comment();
      var node_14 = first_child(fragment_1);
      {
        var consequent_13 = ($$anchor3) => {
          var div_9 = root_23();
          var div_10 = child(div_9);
          var button_5 = child(div_10);
          var video_2 = sibling(button_5, 4);
          video_2.muted = true;
          bind_this(video_2, ($$value) => set(screenSharePreviewEl, $$value), () => get(screenSharePreviewEl));
          template_effect(() => set_style(div_9, `left: ${(deep_read_state(previewPos()), untrack(() => previewPos().x)) ?? ""}px; top: ${(deep_read_state(previewPos()), untrack(() => previewPos().y)) ?? ""}px; min-width: 180px; min-height: 120px; user-select: none;`));
          event("click", button_5, stopPropagation(function(...$$args) {
            var _a2;
            (_a2 = onClosePreview()) == null ? void 0 : _a2.apply(this, $$args);
          }));
          event("mousedown", div_9, function(...$$args) {
            var _a2;
            (_a2 = onPreviewMouseDown()) == null ? void 0 : _a2.apply(this, $$args);
          });
          append($$anchor3, div_9);
        };
        var alternate_8 = ($$anchor3) => {
          var button_6 = root_24();
          event("click", button_6, function(...$$args) {
            var _a2;
            (_a2 = onReopenPreview()) == null ? void 0 : _a2.apply(this, $$args);
          });
          append($$anchor3, button_6);
        };
        if_block(node_14, ($$render) => {
          if (previewVisible()) $$render(consequent_13);
          else $$render(alternate_8, -1);
        });
      }
      append($$anchor2, fragment_1);
    };
    if_block(node_13, ($$render) => {
      if (screenSharing() && screenShareStream()) $$render(consequent_14);
    });
  }
  var node_15 = sibling(node_13, 2);
  {
    var consequent_15 = ($$anchor2) => {
      var div_11 = root_25();
      var div_12 = child(div_11);
      var button_7 = sibling(child(div_12), 2);
      var button_8 = sibling(button_7, 2);
      var button_9 = sibling(button_8, 2);
      var button_10 = sibling(button_9, 2);
      event("click", button_7, () => onSelectShareType()("screen"));
      event("click", button_8, () => onSelectShareType()("window"));
      event("click", button_9, () => onSelectShareType()("tab"));
      event("click", button_10, function(...$$args) {
        var _a2;
        (_a2 = onCloseShareTypeModal()) == null ? void 0 : _a2.apply(this, $$args);
      });
      append($$anchor2, div_11);
    };
    if_block(node_15, ($$render) => {
      if (showShareTypeModal()) $$render(consequent_15);
    });
  }
  var node_16 = sibling(node_15, 2);
  {
    var consequent_16 = ($$anchor2) => {
      var div_13 = root_26();
      var div_14 = child(div_13);
      var button_11 = sibling(child(div_14), 2);
      var button_12 = sibling(button_11, 2);
      var button_13 = sibling(button_12, 2);
      event("click", button_11, () => onSelectUploadDestination()("google_drive"));
      event("click", button_12, () => onSelectUploadDestination()("s3"));
      event("click", button_13, function(...$$args) {
        var _a2;
        (_a2 = onResetUploadDestination()) == null ? void 0 : _a2.apply(this, $$args);
      });
      append($$anchor2, div_13);
    };
    if_block(node_16, ($$render) => {
      if (showUploadDestinationModal()) $$render(consequent_16);
    });
  }
  template_effect(() => {
    set_attribute(button_2, "title", micOn() ? "Mute Mic" : "Unmute Mic");
    set_attribute(button_3, "title", cameraOn() ? "Turn Off Camera" : "Turn On Camera");
    set_attribute(button_4, "title", recording() ? "Stop Recording" : "Start Recording");
  });
  event("change", input, function(...$$args) {
    var _a2;
    (_a2 = onFileInput()) == null ? void 0 : _a2.apply(this, $$args);
  });
  event("click", button, function(...$$args) {
    var _a2;
    (_a2 = screenSharing() ? onStopScreenShare() : onOpenShareTypeModal()) == null ? void 0 : _a2.apply(this, $$args);
  });
  event("click", button_2, function(...$$args) {
    var _a2;
    (_a2 = onToggleMic()) == null ? void 0 : _a2.apply(this, $$args);
  });
  event("click", button_3, function(...$$args) {
    var _a2;
    (_a2 = onToggleCamera()) == null ? void 0 : _a2.apply(this, $$args);
  });
  event("click", button_4, function(...$$args) {
    var _a2;
    (_a2 = onToggleRecording()) == null ? void 0 : _a2.apply(this, $$args);
  });
  append($$anchor, fragment);
  pop();
}
function buildParticipantRows({
  currentUsername,
  currentLeader = null,
  localPeerId = null,
  peerConnections: peerConnections2 = {},
  onlinePeers: onlinePeers2 = []
}) {
  const userAgentCounts = Object.values(peerConnections2).reduce((counts, conn) => {
    counts[conn.username] = (counts[conn.username] || 0) + 1;
    return counts;
  }, {});
  if (currentUsername) {
    userAgentCounts[currentUsername] = (userAgentCounts[currentUsername] || 0) + 1;
  }
  const usernames = Array.from(new Set([
    currentUsername,
    ...Object.values(peerConnections2).map((conn) => conn.username),
    ...onlinePeers2.map((peer) => peer.username)
  ].filter(Boolean)));
  return usernames.map((username) => {
    const connected = username === currentUsername || Object.values(peerConnections2).some(
      (conn) => conn.username === username && conn.status === "connected"
    );
    const leader = Boolean(currentLeader && (username === currentUsername && currentLeader === localPeerId || Object.entries(peerConnections2).some(
      ([peerId, conn]) => conn.username === username && currentLeader === peerId
    )));
    return {
      username,
      displayName: username === currentUsername ? "You" : username,
      connected,
      leader,
      userAgentCount: userAgentCounts[username] || 0
    };
  });
}
function buildConnectedSessions({
  currentUsername,
  localPeerId = null,
  peerConnections: peerConnections2 = {}
}) {
  return [
    {
      username: currentUsername,
      sessionId: localPeerId,
      isLocal: true
    },
    ...Object.entries(peerConnections2).filter(([, conn]) => conn.status === "connected").map(([peerId, conn]) => ({
      username: conn.username,
      sessionId: peerId,
      isLocal: false
    }))
  ].filter((session) => session.username && session.sessionId);
}
function getConnectedParticipantSummary({
  currentUsername,
  peerConnections: peerConnections2 = {}
}) {
  const connectedRemoteConnections = Object.values(peerConnections2).filter((conn) => conn.status === "connected");
  const connectedUsers = new Set([
    currentUsername,
    ...connectedRemoteConnections.map((conn) => conn.username)
  ].filter(Boolean));
  return {
    connectedUserAgents: connectedRemoteConnections.length + (currentUsername ? 1 : 0),
    connectedUsers: connectedUsers.size,
    allKnownUsers: connectedUsers.size
  };
}
var root_3$3 = /* @__PURE__ */ from_svg(`<svg class="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3z"></path><path d="M1 6h18l-2 6H3L1 6z"></path></svg>`);
var root_4$4 = /* @__PURE__ */ from_html(`<div class="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse"><div class="flex gap-0.5"><div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 0ms;"></div> <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 150ms;"></div> <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 300ms;"></div></div></div>`);
var root_2$5 = /* @__PURE__ */ from_html(`<div class="relative"><img class="w-6 h-6 rounded-full border-2 border-white"/> <!> <!></div>`);
var root_1$5 = /* @__PURE__ */ from_html(`<div class="flex items-center"></div>`);
var root_5$3 = /* @__PURE__ */ from_html(`<button class="bg-red-500 text-white px-3 py-1 rounded text-xs">End Call</button>`);
var root$4 = /* @__PURE__ */ from_html(`<div class="flex items-center justify-between px-4 py-2 border-b"><div><h2 class="text-xl font-semibold"> </h2> <button class="ml-4 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"> </button> <button class="ml-2 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200" title="Commit and push messages now">💾 Commit Now</button> <p class="text-sm text-gray-500"> </p></div> <div class="text-sm text-gray-500"><button class="hover:text-blue-600 cursor-pointer underline"> </button></div> <div class="ml-4 flex items-center gap-3"><!> <!></div></div>`);
function ConversationHeader($$anchor, $$props) {
  push($$props, false);
  const connectedSessions = /* @__PURE__ */ mutable_source();
  const participantSummary = /* @__PURE__ */ mutable_source();
  let conversation = prop($$props, "conversation", 8);
  let currentUsername = prop($$props, "currentUsername", 8);
  let localPeerId = prop($$props, "localPeerId", 8, null);
  let currentLeader = prop($$props, "currentLeader", 8, null);
  let peerConnections2 = prop($$props, "peerConnections", 24, () => ({}));
  let typingUsers2 = prop($$props, "typingUsers", 24, () => ({}));
  let pollingActive = prop($$props, "pollingActive", 8, true);
  let callActive = prop($$props, "callActive", 8, false);
  let onTogglePresence = prop($$props, "onTogglePresence", 8);
  let onForceCommit = prop($$props, "onForceCommit", 8);
  let onShowParticipants = prop($$props, "onShowParticipants", 8);
  let onEndCall = prop($$props, "onEndCall", 8);
  legacy_pre_effect(
    () => (deep_read_state(currentUsername()), deep_read_state(localPeerId()), deep_read_state(peerConnections2())),
    () => {
      set(connectedSessions, buildConnectedSessions({
        currentUsername: currentUsername(),
        localPeerId: localPeerId(),
        peerConnections: peerConnections2()
      }));
    }
  );
  legacy_pre_effect(
    () => (deep_read_state(currentUsername()), deep_read_state(peerConnections2())),
    () => {
      set(participantSummary, getConnectedParticipantSummary({
        currentUsername: currentUsername(),
        peerConnections: peerConnections2()
      }));
    }
  );
  legacy_pre_effect_reset();
  init();
  var div = root$4();
  var div_1 = child(div);
  var h2 = child(div_1);
  var text2 = child(h2);
  var button = sibling(h2, 2);
  var text_1 = child(button);
  var button_1 = sibling(button, 2);
  var p = sibling(button_1, 2);
  var text_2 = child(p);
  var div_2 = sibling(div_1, 2);
  var button_2 = child(div_2);
  var text_3 = child(button_2);
  var div_3 = sibling(div_2, 2);
  var node = child(div_3);
  {
    var consequent_2 = ($$anchor2) => {
      var div_4 = root_1$5();
      each(div_4, 7, () => get(connectedSessions), (session) => session.sessionId, ($$anchor3, session, index2) => {
        var div_5 = root_2$5();
        var img = child(div_5);
        var node_1 = sibling(img, 2);
        {
          var consequent = ($$anchor4) => {
            var svg = root_3$3();
            append($$anchor4, svg);
          };
          if_block(node_1, ($$render) => {
            if (deep_read_state(currentLeader()), get(session), untrack(() => currentLeader() && currentLeader() === get(session).sessionId)) $$render(consequent);
          });
        }
        var node_2 = sibling(node_1, 2);
        {
          var consequent_1 = ($$anchor4) => {
            var div_6 = root_4$4();
            append($$anchor4, div_6);
          };
          if_block(node_2, ($$render) => {
            if (get(session), deep_read_state(typingUsers2()), untrack(() => {
              var _a2;
              return !get(session).isLocal && ((_a2 = typingUsers2()[get(session).sessionId]) == null ? void 0 : _a2.isTyping);
            })) $$render(consequent_1);
          });
        }
        template_effect(
          ($0) => {
            set_style(div_5, `margin-left: ${get(index2) > 0 ? "-8px" : "0"}; z-index: ${(get(connectedSessions), deep_read_state(get(index2)), untrack(() => get(connectedSessions).length - get(index2))) ?? ""};`);
            set_attribute(img, "src", `https://github.com/${(get(session), untrack(() => get(session).username)) ?? ""}.png`);
            set_attribute(img, "alt", (get(session), untrack(() => get(session).username)));
            set_attribute(img, "title", `${(get(session), untrack(() => get(session).isLocal ? "You" : get(session).username)) ?? ""} ${$0 ?? ""}`);
          },
          [
            () => (get(session), untrack(() => get(session).isLocal ? "" : `(${get(session).sessionId.slice(-4)})`))
          ]
        );
        append($$anchor3, div_5);
      });
      template_effect(($0) => set_style(div_4, `width: ${$0 ?? ""}px;`), [
        () => (get(connectedSessions), untrack(() => Math.min(get(connectedSessions).length * 16 + 16, 80)))
      ]);
      append($$anchor2, div_4);
    };
    if_block(node, ($$render) => {
      if (get(connectedSessions), untrack(() => get(connectedSessions).length > 0)) $$render(consequent_2);
    });
  }
  var node_3 = sibling(node, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var button_3 = root_5$3();
      event("click", button_3, function(...$$args) {
        var _a2;
        (_a2 = onEndCall()) == null ? void 0 : _a2.apply(this, $$args);
      });
      append($$anchor2, button_3);
    };
    if_block(node_3, ($$render) => {
      if (callActive()) $$render(consequent_3);
    });
  }
  template_effect(() => {
    set_text(text2, (deep_read_state(conversation()), untrack(() => conversation().title)));
    set_attribute(button, "title", pollingActive() ? "Pause presence polling" : "Start presence polling");
    set_text(text_1, pollingActive() ? "⏸ Pause Presence" : "▶ Start Presence");
    set_text(text_2, (deep_read_state(conversation()), untrack(() => conversation().repo)));
    set_text(text_3, `participants ${(get(participantSummary), untrack(() => get(participantSummary).connectedUsers)) ?? ""}/${(get(participantSummary), untrack(() => get(participantSummary).allKnownUsers)) ?? ""} • ua: ${(get(participantSummary), untrack(() => get(participantSummary).connectedUserAgents)) ?? ""}`);
  });
  event("click", button, function(...$$args) {
    var _a2;
    (_a2 = onTogglePresence()) == null ? void 0 : _a2.apply(this, $$args);
  });
  event("click", button_1, function(...$$args) {
    var _a2;
    (_a2 = onForceCommit()) == null ? void 0 : _a2.apply(this, $$args);
  });
  event("click", button_2, function(...$$args) {
    var _a2;
    (_a2 = onShowParticipants()) == null ? void 0 : _a2.apply(this, $$args);
  });
  append($$anchor, div);
  pop();
}
var root_2$4 = /* @__PURE__ */ from_svg(`<svg class="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3z"></path><path d="M1 6h18l-2 6H3L1 6z"></path></svg>`);
var root_3$2 = /* @__PURE__ */ from_html(`<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>`);
var root_4$3 = /* @__PURE__ */ from_html(`<span class="text-xs text-gray-500"> </span>`);
var root_1$4 = /* @__PURE__ */ from_html(`<div><div class="flex items-center gap-3"><div class="relative"><img/> <!> <!></div> <span> <!></span></div> <div class="ml-auto text-xs text-gray-500"> </div></div>`);
var root$3 = /* @__PURE__ */ from_html(`<div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"><button type="button" class="absolute inset-0 cursor-default" aria-label="Dismiss participants modal"></button> <div class="relative bg-white rounded-lg p-6 max-w-md w-full mx-4"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Participants</h3> <button type="button" class="text-gray-400 hover:text-gray-600" aria-label="Close participants modal"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="space-y-2"></div></div></div>`);
function ParticipantsModal($$anchor, $$props) {
  push($$props, false);
  const participantRows = /* @__PURE__ */ mutable_source();
  let currentUsername = prop($$props, "currentUsername", 8);
  let currentLeader = prop($$props, "currentLeader", 8, null);
  let localPeerId = prop($$props, "localPeerId", 8, null);
  let peerConnections2 = prop($$props, "peerConnections", 24, () => ({}));
  let onlinePeers2 = prop($$props, "onlinePeers", 24, () => []);
  let onClose = prop($$props, "onClose", 8);
  legacy_pre_effect(
    () => (deep_read_state(currentUsername()), deep_read_state(currentLeader()), deep_read_state(localPeerId()), deep_read_state(peerConnections2()), deep_read_state(onlinePeers2())),
    () => {
      set(participantRows, buildParticipantRows({
        currentUsername: currentUsername(),
        currentLeader: currentLeader(),
        localPeerId: localPeerId(),
        peerConnections: peerConnections2(),
        onlinePeers: onlinePeers2()
      }));
    }
  );
  legacy_pre_effect_reset();
  init();
  var div = root$3();
  var button = child(div);
  var div_1 = sibling(button, 2);
  var div_2 = child(div_1);
  var button_1 = sibling(child(div_2), 2);
  var div_3 = sibling(div_2, 2);
  each(div_3, 5, () => get(participantRows), (participant) => participant.username, ($$anchor2, participant) => {
    var div_4 = root_1$4();
    var div_5 = child(div_4);
    var div_6 = child(div_5);
    var img = child(div_6);
    var node = sibling(img, 2);
    {
      var consequent = ($$anchor3) => {
        var svg = root_2$4();
        append($$anchor3, svg);
      };
      if_block(node, ($$render) => {
        if (get(participant), untrack(() => get(participant).leader)) $$render(consequent);
      });
    }
    var node_1 = sibling(node, 2);
    {
      var consequent_1 = ($$anchor3) => {
        var div_7 = root_3$2();
        append($$anchor3, div_7);
      };
      if_block(node_1, ($$render) => {
        if (get(participant), untrack(() => get(participant).connected)) $$render(consequent_1);
      });
    }
    var span = sibling(div_6, 2);
    var text2 = child(span);
    var node_2 = sibling(text2);
    {
      var consequent_2 = ($$anchor3) => {
        var span_1 = root_4$3();
        var text_1 = child(span_1);
        template_effect(() => set_text(text_1, `(${(get(participant), untrack(() => get(participant).userAgentCount)) ?? ""})`));
        append($$anchor3, span_1);
      };
      if_block(node_2, ($$render) => {
        if (get(participant), untrack(() => get(participant).userAgentCount > 1)) $$render(consequent_2);
      });
    }
    var div_8 = sibling(div_5, 2);
    var text_2 = child(div_8);
    template_effect(() => {
      set_class(div_4, 1, `flex items-center gap-3 p-2 rounded ${(get(participant), untrack(() => get(participant).connected ? "bg-green-50" : "bg-gray-50")) ?? ""}`);
      set_attribute(img, "src", `https://github.com/${(get(participant), untrack(() => get(participant).username)) ?? ""}.png`);
      set_attribute(img, "alt", (get(participant), untrack(() => get(participant).username)));
      set_class(img, 1, `w-8 h-8 rounded-full ${(get(participant), untrack(() => get(participant).connected ? "" : "grayscale opacity-60")) ?? ""}`);
      set_class(span, 1, `font-medium ${(get(participant), untrack(() => get(participant).connected ? "text-green-800" : "text-gray-600")) ?? ""}`);
      set_text(text2, `${(get(participant), untrack(() => get(participant).displayName)) ?? ""} `);
      set_text(text_2, (get(participant), untrack(() => get(participant).connected ? "Online" : "Offline")));
    });
    append($$anchor2, div_4);
  });
  event("click", button, function(...$$args) {
    var _a2;
    (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
  });
  event("click", button_1, function(...$$args) {
    var _a2;
    (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
  });
  append($$anchor, div);
  pop();
}
function createConversationCommitQueueKey(conversation) {
  if (!(conversation == null ? void 0 : conversation.repo) || !(conversation == null ? void 0 : conversation.id)) {
    return null;
  }
  return `${conversation.repo}::${conversation.id}`;
}
function forceCommitSelectedConversation({
  conversation,
  flushQueue
}) {
  const key2 = createConversationCommitQueueKey(conversation);
  if (!key2) {
    return { status: "skipped" };
  }
  flushQueue([key2]);
  return { status: "queued", key: key2 };
}
function shouldLoadConversationMessages(conversation, token) {
  return Boolean(
    token && (conversation == null ? void 0 : conversation.repo) && (conversation == null ? void 0 : conversation.id) && (!conversation.messages || conversation.messages.length === 0)
  );
}
function createConversationContentRequest(conversation, token) {
  const path = conversation.path;
  return {
    path,
    url: `https://api.github.com/repos/${conversation.repo}/contents/${path}`,
    options: {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json"
      }
    }
  };
}
async function fetchConversationMessages({
  conversation,
  token,
  fetchFn = fetch,
  decodeBase64 = atob
}) {
  const request = createConversationContentRequest(conversation, token);
  const response = await fetchFn(request.url, request.options);
  if (response.ok) {
    const blob = await response.json();
    const decoded = JSON.parse(decodeBase64(blob.content));
    return {
      status: "loaded",
      messages: Array.isArray(decoded == null ? void 0 : decoded.messages) ? decoded.messages : null,
      path: request.path
    };
  }
  if (response.status === 404) {
    return { status: "deleted" };
  }
  return {
    status: "error",
    httpStatus: response.status
  };
}
function updateConversationInStore(conversationsStore, updatedConversation) {
  conversationsStore.update((map) => {
    const list = map[updatedConversation.repo] || [];
    const updated = list.map(
      (conversation) => conversation.id === updatedConversation.id ? updatedConversation : conversation
    );
    return { ...map, [updatedConversation.repo]: updated };
  });
}
function removeConversationFromStore(conversationsStore, conversation) {
  conversationsStore.update((map) => {
    const list = map[conversation.repo] || [];
    const filtered = list.filter((item) => item.id !== conversation.id);
    return { ...map, [conversation.repo]: filtered };
  });
}
async function loadSelectedConversationContents({
  conversation,
  token,
  authToken,
  conversationsStore,
  selectedConversationStore,
  currentRouteStore,
  currentContentStore,
  setSelectedConversation,
  removeFromSkyGitConversations: removeFromSkyGitConversations2,
  alertUser = alert,
  fetchMessages = fetchConversationMessages,
  warn = console.warn
}) {
  if (!shouldLoadConversationMessages(conversation, token)) {
    return { status: "skipped", conversation };
  }
  try {
    const result = await fetchMessages({ conversation, token });
    if (result.status === "loaded" && result.messages) {
      const updatedConversation = {
        ...conversation,
        messages: result.messages,
        path: result.path
      };
      setSelectedConversation(updatedConversation);
      selectedConversationStore.set(updatedConversation);
      updateConversationInStore(conversationsStore, updatedConversation);
      return { status: "loaded", conversation: updatedConversation };
    }
    if (result.status === "deleted") {
      warn("[SkyGit] Conversation file was deleted from GitHub");
      const conversationTitle = (conversation == null ? void 0 : conversation.title) || "Unknown";
      removeConversationFromStore(conversationsStore, conversation);
      setSelectedConversation(null);
      selectedConversationStore.set(null);
      currentRouteStore.set("chats");
      currentContentStore.set(null);
      if (authToken && conversation) {
        removeFromSkyGitConversations2(authToken, conversation);
      }
      alertUser(`Conversation "${conversationTitle}" was deleted from the repository and has been removed from your local list.`);
      return { status: "deleted", conversation: null };
    }
    warn("[SkyGit] Failed to load conversation, status:", result.httpStatus);
    const fallbackConversation = {
      ...conversation,
      messages: []
    };
    setSelectedConversation(fallbackConversation);
    selectedConversationStore.set(fallbackConversation);
    return { status: "fallback", conversation: fallbackConversation };
  } catch (error) {
    warn("[SkyGit] Failed to fetch conversation contents", error);
    return { status: "failed", conversation, error };
  }
}
function getConversationRouteRepo(conversation, getRepoByFullName2) {
  return (conversation == null ? void 0 : conversation.repo) ? getRepoByFullName2(conversation.repo) : null;
}
function applyConversationRouteSelection({
  conversation,
  selectedConversationStore,
  getRepoByFullName: getRepoByFullName2
}) {
  selectedConversationStore.set(conversation);
  return {
    selectedConversation: conversation,
    currentRepo: getConversationRouteRepo(conversation, getRepoByFullName2)
  };
}
function registerSkyGitBrowserCallbacks({
  windowRef = typeof window !== "undefined" ? window : null,
  onRecordingStatus,
  onScreenShare,
  onMediaStatus,
  onFileReceiveProgress,
  onFileSendProgress
}) {
  if (!windowRef) return () => {
  };
  const callbacks = {
    skygitOnRecordingStatus: onRecordingStatus,
    skygitOnScreenShare: onScreenShare,
    skygitOnMediaStatus: onMediaStatus,
    skygitFileReceiveProgress: onFileReceiveProgress,
    skygitFileSendProgress: onFileSendProgress
  };
  for (const [name, callback] of Object.entries(callbacks)) {
    windowRef[name] = callback;
  }
  return () => {
    for (const [name, callback] of Object.entries(callbacks)) {
      if (windowRef[name] === callback) {
        delete windowRef[name];
      }
    }
  };
}
function calculateTransferPercent(completed, total) {
  if (!Number.isFinite(completed) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(completed / total * 100)));
}
function createFileReceiveProgressState(meta, received, total, calculatePercent = calculateTransferPercent) {
  return {
    name: meta.name,
    progress: { received, total },
    percent: calculatePercent(received, total)
  };
}
function createFileSendProgressState(sent, total, calculatePercent = calculateTransferPercent) {
  return {
    percent: calculatePercent(sent, total)
  };
}
function isTransferComplete(done, total) {
  return done === total;
}
function applyConversationFileReceiveProgress({
  meta,
  received,
  total,
  setReceiveState,
  clearReceiveState,
  schedule = globalThis.setTimeout,
  clearDelay = 3e3,
  calculatePercent = calculateTransferPercent
}) {
  setReceiveState(createFileReceiveProgressState(meta, received, total, calculatePercent));
  if (isTransferComplete(received, total)) {
    schedule(clearReceiveState, clearDelay);
  }
}
function applyConversationFileSendProgress({
  sent,
  total,
  setSendState,
  clearSendState,
  schedule = globalThis.setTimeout,
  clearDelay = 2e3,
  calculatePercent = calculateTransferPercent
}) {
  setSendState(createFileSendProgressState(sent, total, calculatePercent));
  if (isTransferComplete(sent, total)) {
    schedule(clearSendState, clearDelay);
  }
}
function createConversationBrowserEventHandlers({
  setRemoteRecording,
  setRemoteScreenShare,
  setRemoteMediaStatus,
  setReceiveState,
  clearReceiveState,
  setSendState,
  clearSendState,
  applyReceiveProgress = applyConversationFileReceiveProgress,
  applySendProgress = applyConversationFileSendProgress
}) {
  return {
    onRecordingStatus: (status) => {
      setRemoteRecording(!!status.recording);
    },
    onScreenShare: (active, meta) => {
      setRemoteScreenShare(active, meta || null);
    },
    onMediaStatus: (status) => {
      setRemoteMediaStatus(status);
    },
    onFileReceiveProgress: (meta, received, total) => {
      applyReceiveProgress({
        meta,
        received,
        total,
        setReceiveState,
        clearReceiveState
      });
    },
    onFileSendProgress: (_meta, sent, total) => {
      applySendProgress({
        sent,
        total,
        setSendState,
        clearSendState
      });
    }
  };
}
function mergeRemoteConversation(localConversation, remoteConversation) {
  if (!remoteConversation || !Array.isArray(remoteConversation.messages)) {
    return null;
  }
  const localMessages = localConversation.messages || [];
  const messageMap = /* @__PURE__ */ new Map();
  localMessages.forEach((message) => {
    if (message.id) messageMap.set(message.id, message);
  });
  remoteConversation.messages.forEach((message) => {
    if (message.id) messageMap.set(message.id, message);
  });
  const mergedMessages = Array.from(messageMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  if (mergedMessages.length <= localMessages.length) {
    return null;
  }
  return {
    ...localConversation,
    messages: mergedMessages,
    participants: Array.from(/* @__PURE__ */ new Set([
      ...localConversation.participants || [],
      ...remoteConversation.participants || []
    ]))
  };
}
async function fetchAndMergeConversation({
  conversation,
  token,
  fetchImpl = fetch
}) {
  if (!(conversation == null ? void 0 : conversation.path) || !(conversation == null ? void 0 : conversation.repo) || !token) return null;
  const res = await fetchImpl(`https://api.github.com/repos/${conversation.repo}/contents/${conversation.path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json"
    }
  });
  if (!res.ok) return null;
  const blob = await res.json();
  const remoteConversation = JSON.parse(atob(blob.content));
  return mergeRemoteConversation(conversation, remoteConversation);
}
function createConversationSyncController({
  sync,
  intervalMs = 1e4,
  setTimer = setInterval,
  clearTimer: clearTimer2 = clearInterval
}) {
  let timer = null;
  function stop() {
    if (timer) {
      clearTimer2(timer);
      timer = null;
    }
  }
  function start() {
    if (timer) return;
    timer = setTimer(sync, intervalMs);
    sync();
  }
  return {
    start,
    stop,
    isRunning: () => Boolean(timer)
  };
}
function getConversationSyncKey(conversation, pollingActive) {
  if (!conversation || !pollingActive) {
    return null;
  }
  return `${conversation.repo}::${conversation.path}`;
}
function applyConversationSyncKeyChange({
  currentKey,
  nextKey,
  syncController
}) {
  if (nextKey === currentKey) {
    return currentKey;
  }
  syncController.stop();
  if (nextKey) {
    syncController.start();
  }
  return nextKey;
}
function replaceConversationInRepoList(conversationList = [], updatedConversation) {
  return conversationList.map((conversation) => conversation.id === updatedConversation.id ? updatedConversation : conversation);
}
function countSyncedMessages(updatedConversation, previousConversation) {
  return (updatedConversation.messages || []).length - ((previousConversation == null ? void 0 : previousConversation.messages) || []).length;
}
function applySyncedConversationToStores({
  updatedConversation,
  previousConversation,
  conversationsStore,
  selectedConversationStore,
  setSelectedConversation,
  log: log2 = () => {
  }
}) {
  if (!updatedConversation) {
    return { status: "skipped" };
  }
  const messageDelta = countSyncedMessages(updatedConversation, previousConversation);
  log2(`[SkyGit] Synced ${messageDelta} new messages from GitHub`);
  setSelectedConversation(updatedConversation);
  selectedConversationStore.set(updatedConversation);
  conversationsStore.update((map) => {
    const list = map[updatedConversation.repo] || [];
    return {
      ...map,
      [updatedConversation.repo]: replaceConversationInRepoList(list, updatedConversation)
    };
  });
  return { status: "applied", messageDelta };
}
async function uploadRecordingToS3(blob, cred, fetchImpl = fetch) {
  const fileName = `skygit-recording-${Date.now()}.webm`;
  const bucket = cred == null ? void 0 : cred.bucket;
  const region = cred == null ? void 0 : cred.region;
  if (!bucket || !region) {
    throw new Error("S3 credential missing bucket or region.");
  }
  const endpoint = cred.endpoint || `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
  const putRes = await fetchImpl(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "video/webm" },
    body: blob
  });
  if (!putRes.ok) {
    throw new Error("Failed to upload to S3. Private buckets need signed URLs or a backend proxy.");
  }
  return endpoint.split("?")[0];
}
async function getGoogleAccessToken(cred, fetchImpl = fetch) {
  const params = new URLSearchParams();
  if (cred.client_id) params.append("client_id", cred.client_id);
  if (cred.client_secret) params.append("client_secret", cred.client_secret);
  params.append("refresh_token", cred.refresh_token);
  params.append("grant_type", "refresh_token");
  const res = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if ((data == null ? void 0 : data.error) === "invalid_grant") {
      throw new Error("Stored Google Drive refresh token is no longer valid. Please reconnect your Google Drive credential.");
    }
    throw new Error(`Failed to get Google access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}
async function uploadRecordingToGoogleDrive(blob, cred, fetchImpl = fetch) {
  const accessToken = await getGoogleAccessToken(cred, fetchImpl);
  const metadata = {
    name: `SkyGit Recording ${(/* @__PURE__ */ new Date()).toISOString()}.webm`,
    mimeType: "video/webm"
  };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob);
  const uploadRes = await fetchImpl("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: { Authorization: "Bearer " + accessToken },
    body: form
  });
  if (!uploadRes.ok) {
    throw new Error("Failed to upload to Google Drive");
  }
  const fileData = await uploadRes.json();
  await fetchImpl(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role: "reader", type: "anyone" })
  });
  const metaRes = await fetchImpl(`https://www.googleapis.com/drive/v3/files/${fileData.id}?fields=webViewLink,webContentLink`, {
    headers: { Authorization: "Bearer " + accessToken }
  });
  const meta = await metaRes.json();
  return meta.webViewLink || meta.webContentLink;
}
function getConversationPresenceContext({ conversation, token, auth }) {
  var _a2;
  return {
    repoFullName: (conversation == null ? void 0 : conversation.repo) || null,
    token,
    username: ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login) || null
  };
}
function isPresencePollingActive(pollingMap, repoFullName) {
  return repoFullName ? pollingMap[repoFullName] !== false : true;
}
function startConversationPresence({
  repoFullName,
  token,
  username,
  getSessionId,
  initializePeerManager: initializePeerManager2,
  updateMyConversations: updateMyConversations2,
  schedule = globalThis.setTimeout
}) {
  if (!repoFullName || !token || !username) {
    return { status: "skipped" };
  }
  const sessionId = getSessionId(repoFullName);
  initializePeerManager2({
    _token: token,
    _repoFullName: repoFullName,
    _username: username,
    _sessionId: sessionId
  });
  const timeoutId = schedule(() => {
    updateMyConversations2([repoFullName]);
  }, 2e3);
  return { status: "started", sessionId, timeoutId };
}
function applyConversationPresencePolling({
  repoFullName,
  token,
  username,
  pollingMap,
  getSessionId,
  initializePeerManager: initializePeerManager2,
  updateMyConversations: updateMyConversations2,
  shutdownPeerManager: shutdownPeerManager2,
  schedule
}) {
  if (!repoFullName || !token || !username) {
    return { status: "skipped", pollingActive: true };
  }
  const pollingActive = isPresencePollingActive(pollingMap, repoFullName);
  if (!pollingActive) {
    shutdownPeerManager2();
    return { status: "stopped", pollingActive };
  }
  return {
    ...startConversationPresence({
      repoFullName,
      token,
      username,
      getSessionId,
      initializePeerManager: initializePeerManager2,
      updateMyConversations: updateMyConversations2,
      schedule
    }),
    pollingActive
  };
}
function toggleConversationPresence({
  repoFullName,
  token,
  username,
  pollingActive,
  setPollingState: setPollingState2,
  getSessionId,
  initializePeerManager: initializePeerManager2,
  updateMyConversations: updateMyConversations2,
  shutdownPeerManager: shutdownPeerManager2,
  schedule
}) {
  if (!repoFullName || !token || !username) {
    return { status: "skipped" };
  }
  if (pollingActive) {
    setPollingState2(repoFullName, false);
    shutdownPeerManager2();
    return { status: "stopped", pollingActive: false };
  }
  setPollingState2(repoFullName, true);
  return {
    ...startConversationPresence({
      repoFullName,
      token,
      username,
      getSessionId,
      initializePeerManager: initializePeerManager2,
      updateMyConversations: updateMyConversations2,
      schedule
    }),
    pollingActive: true
  };
}
function createRecordingBlob(chunks, {
  BlobCtor = globalThis.Blob,
  type = "video/webm"
} = {}) {
  return new BlobCtor(chunks, { type });
}
function createConversationMediaRecorder({
  stream,
  MediaRecorderCtor = globalThis.MediaRecorder,
  mimeType = "video/webm; codecs=vp9",
  onDataAvailable,
  onStop
}) {
  const recorder2 = new MediaRecorderCtor(stream, { mimeType });
  recorder2.ondataavailable = onDataAvailable;
  recorder2.onstop = onStop;
  return recorder2;
}
function createConversationRecordingController({
  getLocalStream,
  uploadRecording,
  notifyRecordingStatus = () => {
  },
  onRecordingChange = () => {
  },
  createRecorder = createConversationMediaRecorder,
  createBlob = createRecordingBlob
}) {
  let mediaRecorder = null;
  let recordedChunks = [];
  let recording = false;
  async function handleRecordingStop() {
    const blob = createBlob(recordedChunks);
    recordedChunks = [];
    await uploadRecording(blob);
  }
  function start() {
    const stream = getLocalStream();
    if (!stream) {
      return false;
    }
    recordedChunks = [];
    mediaRecorder = createRecorder({
      stream,
      onDataAvailable: (event2) => {
        var _a2;
        if (((_a2 = event2.data) == null ? void 0 : _a2.size) > 0) {
          recordedChunks.push(event2.data);
        }
      },
      onStop: handleRecordingStop
    });
    mediaRecorder.start();
    recording = true;
    onRecordingChange(true);
    notifyRecordingStatus(true);
    return true;
  }
  function stop() {
    if (!mediaRecorder || !recording) {
      return false;
    }
    recording = false;
    onRecordingChange(false);
    notifyRecordingStatus(false);
    mediaRecorder.stop();
    return true;
  }
  return {
    start,
    stop,
    isRecording: () => recording
  };
}
function getRecordingUploadCredentials(decryptedSecrets = {}, repoConfig = null) {
  var _a2;
  const credentials = {
    s3: null,
    google_drive: null
  };
  const repoCredentialUrl = (_a2 = repoConfig == null ? void 0 : repoConfig.storage_info) == null ? void 0 : _a2.url;
  const repoCredential = repoCredentialUrl ? decryptedSecrets[repoCredentialUrl] : null;
  if ((repoCredential == null ? void 0 : repoCredential.type) === "s3") {
    credentials.s3 = repoCredential;
  }
  if ((repoCredential == null ? void 0 : repoCredential.type) === "google_drive") {
    credentials.google_drive = repoCredential;
  }
  for (const secret of Object.values(decryptedSecrets)) {
    if ((secret == null ? void 0 : secret.type) === "s3" && !credentials.s3) {
      credentials.s3 = secret;
    }
    if ((secret == null ? void 0 : secret.type) === "google_drive" && !credentials.google_drive) {
      credentials.google_drive = secret;
    }
  }
  const availableDestinations = Object.entries(credentials).filter(([, credential]) => Boolean(credential)).map(([destination]) => destination);
  return {
    availableDestinations,
    credentials
  };
}
function createRecordingMessage(link2) {
  return {
    type: "chat",
    content: `📹 Recording: ${link2}`
  };
}
async function uploadRecordingToDestination({
  blob,
  destination,
  credentials,
  uploadToS3: uploadToS32,
  uploadToGoogleDrive: uploadToGoogleDrive2
}) {
  if (destination === "s3") {
    return uploadToS32(blob, credentials);
  }
  if (destination === "google_drive") {
    return uploadToGoogleDrive2(blob, credentials);
  }
  return null;
}
async function uploadAndShareConversationRecording({
  blob,
  decryptedSettings,
  repoConfig,
  chooseUploadDestination,
  uploadToS3: uploadToS32,
  uploadToGoogleDrive: uploadToGoogleDrive2,
  sendMessageToPeer: sendMessageToPeer2,
  currentCallPeer,
  alertUser = alert,
  getCredentials = getRecordingUploadCredentials,
  createMessage = createRecordingMessage
}) {
  const { credentials } = getCredentials(decryptedSettings, repoConfig);
  const destination = await chooseUploadDestination();
  if (!destination) {
    alertUser("No upload destination (S3 or Google Drive) configured.");
    return { status: "missing_destination" };
  }
  try {
    const link2 = await uploadRecordingToDestination({
      blob,
      destination,
      credentials: credentials[destination],
      uploadToS3: uploadToS32,
      uploadToGoogleDrive: uploadToGoogleDrive2
    });
    if (!link2) {
      return { status: "unsupported_destination", destination };
    }
    sendMessageToPeer2(currentCallPeer, createMessage(link2));
    alertUser("Recording uploaded and link shared!");
    return { status: "shared", destination, link: link2 };
  } catch (error) {
    alertUser(error.message);
    return { status: "failed", destination, error };
  }
}
function chooseRecordingUploadDestination(availableDestinations, requestChoice) {
  if (availableDestinations.length === 0) return null;
  if (availableDestinations.length === 1) return availableDestinations[0];
  return requestChoice();
}
function createUploadDestinationChoiceState() {
  return {
    destination: null,
    showModal: false,
    resolveChoice: null
  };
}
function requestUploadDestinationChoice({
  state: state2,
  setState
}) {
  if (state2.resolveChoice) {
    state2.resolveChoice(null);
  }
  return new Promise((resolve) => {
    setState({
      destination: null,
      showModal: true,
      resolveChoice: resolve
    });
  });
}
function selectUploadDestinationChoice(state2, destination) {
  if (state2.resolveChoice) {
    state2.resolveChoice(destination);
  }
  return {
    destination,
    showModal: false,
    resolveChoice: null
  };
}
function resetUploadDestinationChoice(state2) {
  if (state2.resolveChoice) {
    state2.resolveChoice(null);
  }
  return createUploadDestinationChoiceState();
}
function createDisplayMediaOptions(withAudio = true, type = "screen") {
  const surfaces = {
    tab: "browser",
    window: "window",
    screen: "monitor"
  };
  return {
    video: {
      displaySurface: surfaces[type] || surfaces.screen,
      cursor: "always"
    },
    audio: withAudio
  };
}
function getCurrentCallPeer(connections, currentCallPeer) {
  var _a2;
  return ((_a2 = connections == null ? void 0 : connections[currentCallPeer]) == null ? void 0 : _a2.conn) || null;
}
function replacePeerVideoTrack(peer, stream) {
  var _a2;
  const videoTrack = (_a2 = stream == null ? void 0 : stream.getVideoTracks) == null ? void 0 : _a2.call(stream)[0];
  if ((peer == null ? void 0 : peer.replaceVideoTrack) && videoTrack) {
    peer.replaceVideoTrack(videoTrack);
    return videoTrack;
  }
  return null;
}
function sendScreenShareSignal(peer, active, meta) {
  if (peer == null ? void 0 : peer.sendScreenShareSignal) {
    peer.sendScreenShareSignal(active, meta);
    return true;
  }
  return false;
}
async function startConversationScreenShare({
  mediaDevices,
  withAudio = true,
  type = "screen",
  updatePeerConnections,
  currentCallPeer,
  onEnded
}) {
  const stream = await mediaDevices.getDisplayMedia(createDisplayMediaOptions(withAudio, type));
  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.onended = onEnded;
  }
  updatePeerConnections((connections) => {
    const peer = getCurrentCallPeer(connections, currentCallPeer);
    replacePeerVideoTrack(peer, stream);
    sendScreenShareSignal(peer, true, { audio: withAudio });
    return connections;
  });
  return stream;
}
function stopConversationScreenShare({
  screenShareStream,
  localCameraStream,
  updatePeerConnections,
  currentCallPeer
}) {
  stopStreamTracks(screenShareStream);
  updatePeerConnections((connections) => {
    const peer = getCurrentCallPeer(connections, currentCallPeer);
    replacePeerVideoTrack(peer, localCameraStream);
    sendScreenShareSignal(peer, false);
    return connections;
  });
  return localCameraStream;
}
async function changeConversationScreenSource({
  mediaDevices,
  updatePeerConnections,
  currentCallPeer,
  previousStream,
  onEnded
}) {
  const stream = await mediaDevices.getDisplayMedia(createDisplayMediaOptions(true, "screen"));
  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.onended = onEnded;
  }
  updatePeerConnections((connections) => {
    replacePeerVideoTrack(getCurrentCallPeer(connections, currentCallPeer), stream);
    return connections;
  });
  stopStreamTracks(previousStream);
  return stream;
}
function getConversationPeer(connections, currentCallPeer) {
  var _a2;
  return ((_a2 = connections == null ? void 0 : connections[currentCallPeer]) == null ? void 0 : _a2.conn) || null;
}
function sendPeerPayload({
  updatePeerConnections,
  currentCallPeer,
  message
}) {
  let sent = false;
  updatePeerConnections((connections) => {
    const peer = getConversationPeer(connections, currentCallPeer);
    if (peer == null ? void 0 : peer.send) {
      peer.send(message);
      sent = true;
    }
    return connections;
  });
  return sent;
}
function sendConversationMediaStatus({
  updatePeerConnections,
  currentCallPeer,
  micOn,
  cameraOn
}) {
  return sendPeerPayload({
    updatePeerConnections,
    currentCallPeer,
    message: { type: "media-status", micOn, cameraOn }
  });
}
function sendConversationRecordingStatus({
  updatePeerConnections,
  currentCallPeer,
  recording
}) {
  return sendPeerPayload({
    updatePeerConnections,
    currentCallPeer,
    message: { type: "recording-status", recording }
  });
}
function sendConversationFile({
  updatePeerConnections,
  currentCallPeer,
  file
}) {
  let sent = false;
  updatePeerConnections((connections) => {
    const peer = getConversationPeer(connections, currentCallPeer);
    if (peer == null ? void 0 : peer.sendFile) {
      peer.sendFile(file);
      sent = true;
    }
    return connections;
  });
  return sent;
}
function createPreviewDragState(position = { x: 0, y: 0 }) {
  return {
    position: { ...position },
    dragging: false,
    offset: { x: 0, y: 0 },
    visible: true
  };
}
function startPreviewDrag(state2, event2) {
  return {
    ...state2,
    dragging: true,
    offset: {
      x: event2.clientX - state2.position.x,
      y: event2.clientY - state2.position.y
    }
  };
}
function movePreviewDrag(state2, event2) {
  if (!state2.dragging) {
    return state2;
  }
  return {
    ...state2,
    position: {
      x: event2.clientX - state2.offset.x,
      y: event2.clientY - state2.offset.y
    }
  };
}
function stopPreviewDrag(state2) {
  return {
    ...state2,
    dragging: false
  };
}
function setPreviewVisibility(state2, visible) {
  return {
    ...state2,
    visible
  };
}
function createConversationCallSignal(subtype, conversationId) {
  return {
    type: "signal",
    subtype,
    conversationId
  };
}
function stopConversationLocalStream(stream) {
  if (!stream) {
    return false;
  }
  stream.getTracks().forEach((track) => track.stop());
  return true;
}
function endConversationCallSession({
  currentCallPeer,
  conversationId,
  localStream: localStream2,
  sendMessageToPeer: sendMessageToPeer2,
  stopLocalStream = stopConversationLocalStream
}) {
  const stoppedLocalStream = stopLocalStream(localStream2);
  const shouldNotifyPeer = !!currentCallPeer && !!conversationId;
  if (shouldNotifyPeer) {
    sendMessageToPeer2(currentCallPeer, createConversationCallSignal("call-end", conversationId));
  }
  return {
    status: "ended",
    callActive: false,
    currentCallPeer: null,
    localStream: null,
    remoteStream: null,
    notifiedPeer: shouldNotifyPeer,
    stoppedLocalStream
  };
}
function setStreamTracksEnabled(stream, kind, enabled) {
  const getTracks = kind === "audio" ? stream == null ? void 0 : stream.getAudioTracks : stream == null ? void 0 : stream.getVideoTracks;
  if (!getTracks) {
    return 0;
  }
  const tracks = getTracks.call(stream);
  tracks.forEach((track) => {
    track.enabled = enabled;
  });
  return tracks.length;
}
function toggleConversationMicState({
  micOn,
  cameraOn,
  localStream: localStream2,
  sendStatus
}) {
  const nextMicOn = !micOn;
  const updatedTracks = setStreamTracksEnabled(localStream2, "audio", nextMicOn);
  sendStatus({ micOn: nextMicOn, cameraOn });
  return {
    micOn: nextMicOn,
    cameraOn,
    updatedTracks
  };
}
function toggleConversationCameraState({
  micOn,
  cameraOn,
  localStream: localStream2,
  sendStatus
}) {
  const nextCameraOn = !cameraOn;
  const updatedTracks = setStreamTracksEnabled(localStream2, "video", nextCameraOn);
  sendStatus({ micOn, cameraOn: nextCameraOn });
  return {
    micOn,
    cameraOn: nextCameraOn,
    updatedTracks
  };
}
function getConversationInputFile(event2) {
  var _a2, _b2;
  return ((_b2 = (_a2 = event2 == null ? void 0 : event2.target) == null ? void 0 : _a2.files) == null ? void 0 : _b2[0]) || null;
}
function createConversationFileSendState(file) {
  return {
    fileToSend: file,
    fileSending: true,
    fileSendPercent: 0
  };
}
function startConversationFileSend({
  event: event2,
  callActive,
  currentCallPeer,
  sendFile
}) {
  const file = getConversationInputFile(event2);
  if (!file || !callActive || !currentCallPeer) {
    return { status: "skipped" };
  }
  sendFile(file);
  return {
    status: "started",
    ...createConversationFileSendState(file)
  };
}
function createConversationShareTypeState(type = "screen") {
  return {
    type,
    showModal: false
  };
}
function openConversationShareTypeModal(state2) {
  return {
    ...state2,
    showModal: true
  };
}
function closeConversationShareTypeModal(state2) {
  return {
    ...state2,
    showModal: false
  };
}
function selectConversationShareType(state2, type) {
  return {
    ...state2,
    type,
    showModal: false
  };
}
var root_2$3 = /* @__PURE__ */ from_html(`<div class="flex flex-col h-full"><!> <!> <div class="flex-1 overflow-y-auto"><!></div> <div class="border-t p-4"><!></div></div>`);
var root_4$2 = /* @__PURE__ */ from_html(`<p class="text-gray-400 italic text-center mt-20">Select a conversation from the sidebar to view it.</p>`);
var root$2 = /* @__PURE__ */ from_html(`<!> <!>`, 1);
function Chats($$anchor, $$props) {
  push($$props, false);
  const $peerConnections = () => store_get(peerConnections, "$peerConnections", $$stores);
  const $typingUsers = () => store_get(typingUsers, "$typingUsers", $$stores);
  const $selectedConversationStore = () => store_get(selectedConversation, "$selectedConversationStore", $$stores);
  const $onlinePeers = () => store_get(onlinePeers, "$onlinePeers", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  const showShareTypeModal = /* @__PURE__ */ mutable_source();
  const previewVisible = /* @__PURE__ */ mutable_source();
  const previewPos = /* @__PURE__ */ mutable_source();
  const showUploadDestinationModal = /* @__PURE__ */ mutable_source();
  let selectedConversation$1 = /* @__PURE__ */ mutable_source(null);
  let callActive = /* @__PURE__ */ mutable_source(false);
  let currentRepo = /* @__PURE__ */ mutable_source(null);
  let localStream2 = /* @__PURE__ */ mutable_source(null);
  let remoteStream2 = /* @__PURE__ */ mutable_source(null);
  let currentCallPeer = null;
  let showParticipantModal = /* @__PURE__ */ mutable_source(false);
  let screenSharing = /* @__PURE__ */ mutable_source(false);
  let screenShareStream = /* @__PURE__ */ mutable_source(null);
  let localCameraStream = null;
  let remoteScreenSharing = /* @__PURE__ */ mutable_source(false);
  let remoteScreenShareMeta = /* @__PURE__ */ mutable_source(null);
  let shareTypeState = /* @__PURE__ */ mutable_source(createConversationShareTypeState());
  let previewState = /* @__PURE__ */ mutable_source(createPreviewDragState());
  let micOn = /* @__PURE__ */ mutable_source(true);
  let cameraOn = /* @__PURE__ */ mutable_source(true);
  let remoteMicOn = /* @__PURE__ */ mutable_source(true);
  let remoteCameraOn = /* @__PURE__ */ mutable_source(true);
  let recording = /* @__PURE__ */ mutable_source(false);
  let remoteRecording = /* @__PURE__ */ mutable_source(false);
  let replyingTo = /* @__PURE__ */ mutable_source(
    null
    // Track message being replied to
  );
  let pollingActive = /* @__PURE__ */ mutable_source(true);
  const unsubscribePolling = presencePolling.subscribe((map) => {
    if (get(selectedConversation$1) && get(selectedConversation$1).repo) {
      set(pollingActive, map[get(
        selectedConversation$1
        // default true
      ).repo] !== false);
    }
  });
  let uploadDestinationChoice = /* @__PURE__ */ mutable_source(createUploadDestinationChoiceState());
  let unregisterBrowserCallbacks = () => {
  };
  function openShareTypeModal() {
    set(shareTypeState, openConversationShareTypeModal(get(shareTypeState)));
  }
  function closeShareTypeModal() {
    set(shareTypeState, closeConversationShareTypeModal(get(shareTypeState)));
  }
  function selectShareType(type) {
    set(shareTypeState, selectConversationShareType(get(shareTypeState), type));
    startScreenShare(true, type);
  }
  function onPreviewMouseDown(e) {
    set(previewState, startPreviewDrag(get(previewState), e));
    document.addEventListener("mousemove", onPreviewMouseMove);
    document.addEventListener("mouseup", onPreviewMouseUp);
  }
  function onPreviewMouseMove(e) {
    set(previewState, movePreviewDrag(get(previewState), e));
  }
  function onPreviewMouseUp() {
    set(previewState, stopPreviewDrag(get(previewState)));
    document.removeEventListener("mousemove", onPreviewMouseMove);
    document.removeEventListener("mouseup", onPreviewMouseUp);
  }
  function closePreview() {
    set(previewState, setPreviewVisibility(get(previewState), false));
  }
  function reopenPreview() {
    set(previewState, setPreviewVisibility(get(previewState), true));
  }
  function resetUploadDestination() {
    set(uploadDestinationChoice, resetUploadDestinationChoice(get(uploadDestinationChoice)));
  }
  function selectUploadDestination(destination) {
    set(uploadDestinationChoice, selectUploadDestinationChoice(get(uploadDestinationChoice), destination));
  }
  function togglePresence() {
    const { repoFullName, token, username } = getConversationPresenceContext({
      conversation: get(selectedConversation$1),
      token: localStorage.getItem("skygit_token"),
      auth: get$1(authStore)
    });
    const result = toggleConversationPresence({
      repoFullName,
      token,
      username,
      pollingActive: get(pollingActive),
      setPollingState,
      getSessionId: getOrCreateSessionId,
      initializePeerManager,
      updateMyConversations,
      shutdownPeerManager
    });
    if (typeof result.pollingActive === "boolean") {
      set(pollingActive, result.pollingActive);
    }
  }
  function forceCommitConversation() {
    forceCommitSelectedConversation({
      conversation: get(selectedConversation$1),
      flushQueue: flushConversationCommitQueue
    });
  }
  async function chooseUploadDestinationIfNeeded() {
    var _a2;
    const { availableDestinations } = getRecordingUploadCredentials(get$1(settingsStore).decrypted, (_a2 = get(currentRepo)) == null ? void 0 : _a2.config);
    return chooseRecordingUploadDestination(availableDestinations, () => {
      return requestUploadDestinationChoice({
        state: get(uploadDestinationChoice),
        setState: (value) => {
          set(uploadDestinationChoice, value);
        }
      });
    });
  }
  const unsubscribeCurrentContent = currentContent.subscribe((value) => {
    const selection = applyConversationRouteSelection({
      conversation: value,
      selectedConversationStore: selectedConversation,
      getRepoByFullName
    });
    set(selectedConversation$1, selection.selectedConversation);
    set(currentRepo, selection.currentRepo);
    const auth = get$1(authStore);
    const { repoFullName, token, username } = getConversationPresenceContext({
      conversation: get(selectedConversation$1),
      token: localStorage.getItem("skygit_token"),
      auth
    });
    loadSelectedConversationContents({
      conversation: get(selectedConversation$1),
      token,
      authToken: get$1(authStore).token,
      conversationsStore: conversations,
      selectedConversationStore: selectedConversation,
      currentRouteStore: currentRoute,
      currentContentStore: currentContent,
      setSelectedConversation: (value2) => {
        set(selectedConversation$1, value2);
      },
      removeFromSkyGitConversations,
      alertUser: alert,
      warn: console.warn
    });
    const presenceResult = applyConversationPresencePolling({
      repoFullName,
      token,
      username,
      pollingMap: get$1(presencePolling),
      getSessionId: getOrCreateSessionId,
      initializePeerManager,
      updateMyConversations,
      shutdownPeerManager
    });
    if (typeof presenceResult.pollingActive === "boolean") {
      set(pollingActive, presenceResult.pollingActive);
    }
  });
  function endCall2() {
    var _a2;
    const result = endConversationCallSession({
      currentCallPeer,
      conversationId: (_a2 = get(selectedConversation$1)) == null ? void 0 : _a2.id,
      localStream: get(localStream2),
      sendMessageToPeer
    });
    set(callActive, result.callActive);
    currentCallPeer = result.currentCallPeer;
    set(localStream2, result.localStream);
    set(remoteStream2, result.remoteStream);
  }
  function handleFileInput(event2) {
    const result = startConversationFileSend({
      event: event2,
      callActive: get(callActive),
      currentCallPeer,
      sendFile: (file) => sendConversationFile({
        updatePeerConnections: peerConnections.update,
        currentCallPeer,
        file
      })
    });
    if (result.status !== "started") return;
    result.fileToSend;
    result.fileSending;
    result.fileSendPercent;
  }
  async function startScreenShare(withAudio = true, type = "screen") {
    try {
      set(screenShareStream, await startConversationScreenShare({
        mediaDevices: navigator.mediaDevices,
        withAudio,
        type,
        updatePeerConnections: peerConnections.update,
        currentCallPeer,
        onEnded: stopScreenShare
      }));
      set(screenSharing, true);
      set(localStream2, get(screenShareStream));
    } catch (err) {
      console.error("Screen share error:", err);
    }
  }
  function stopScreenShare() {
    set(localStream2, stopConversationScreenShare({
      screenShareStream: get(screenShareStream),
      localCameraStream,
      updatePeerConnections: peerConnections.update,
      currentCallPeer
    }));
    set(screenShareStream, null);
    set(screenSharing, false);
  }
  async function changeScreenSource() {
    if (!get(screenSharing)) return;
    try {
      const newStream = await changeConversationScreenSource({
        mediaDevices: navigator.mediaDevices,
        updatePeerConnections: peerConnections.update,
        currentCallPeer,
        previousStream: get(screenShareStream),
        onEnded: stopScreenShare
      });
      set(screenShareStream, newStream);
      set(localStream2, newStream);
    } catch (err) {
      console.error("Change screen source error:", err);
    }
  }
  function toggleMic() {
    const nextState = toggleConversationMicState({
      micOn: get(micOn),
      cameraOn: get(cameraOn),
      localStream: get(localStream2),
      sendStatus: sendMediaStatus
    });
    set(micOn, nextState.micOn);
  }
  function toggleCamera() {
    const nextState = toggleConversationCameraState({
      micOn: get(micOn),
      cameraOn: get(cameraOn),
      localStream: get(localStream2),
      sendStatus: sendMediaStatus
    });
    set(cameraOn, nextState.cameraOn);
  }
  function sendMediaStatus(status = { micOn: get(micOn), cameraOn: get(cameraOn) }) {
    sendConversationMediaStatus({
      updatePeerConnections: peerConnections.update,
      currentCallPeer,
      micOn: status.micOn,
      cameraOn: status.cameraOn
    });
  }
  function notifyRecordingStatus(status) {
    sendConversationRecordingStatus({
      updatePeerConnections: peerConnections.update,
      currentCallPeer,
      recording: status
    });
  }
  const recordingController = createConversationRecordingController({
    getLocalStream: () => get(localStream2),
    uploadRecording: uploadAndShareRecording,
    notifyRecordingStatus,
    onRecordingChange: (status) => {
      set(recording, status);
    }
  });
  function startRecording() {
    recordingController.start();
  }
  function stopRecording() {
    recordingController.stop();
  }
  unregisterBrowserCallbacks = registerSkyGitBrowserCallbacks(createConversationBrowserEventHandlers({
    setRemoteRecording: (value) => {
      set(remoteRecording, value);
    },
    setRemoteScreenShare: (active, meta) => {
      set(remoteScreenSharing, active);
      set(remoteScreenShareMeta, meta);
    },
    setRemoteMediaStatus: (status) => {
      if (typeof status.micOn === "boolean") set(remoteMicOn, status.micOn);
      if (typeof status.cameraOn === "boolean") set(remoteCameraOn, status.cameraOn);
    },
    setReceiveState: ({ name, progress, percent }) => {
    },
    clearReceiveState: () => {
    },
    setSendState: ({ percent }) => {
    },
    clearSendState: () => {
    }
  }));
  async function uploadAndShareRecording(blob) {
    var _a2;
    await uploadAndShareConversationRecording({
      blob,
      decryptedSettings: get$1(settingsStore).decrypted,
      repoConfig: (_a2 = get(currentRepo)) == null ? void 0 : _a2.config,
      chooseUploadDestination: chooseUploadDestinationIfNeeded,
      uploadToS3: uploadRecordingToS3,
      uploadToGoogleDrive: uploadRecordingToGoogleDrive,
      sendMessageToPeer,
      currentCallPeer,
      alertUser: alert
    });
  }
  async function syncMessagesFromGitHub() {
    const token = localStorage.getItem("skygit_token");
    try {
      const updatedConversation = await fetchAndMergeConversation({ conversation: get(selectedConversation$1), token });
      applySyncedConversationToStores({
        updatedConversation,
        previousConversation: get(selectedConversation$1),
        conversationsStore: conversations,
        selectedConversationStore: selectedConversation,
        setSelectedConversation: (value) => {
          set(selectedConversation$1, value);
        },
        log: console.log
      });
    } catch (err) {
      console.warn("[SkyGit] Failed to sync messages from GitHub:", err);
    }
  }
  const syncController = createConversationSyncController({ sync: syncMessagesFromGitHub });
  let syncKey = /* @__PURE__ */ mutable_source(null);
  function cleanupPresence() {
    shutdownPeerManager();
    syncController.stop();
  }
  window.addEventListener("beforeunload", cleanupPresence);
  onDestroy(() => {
    unsubscribePolling();
    unsubscribeCurrentContent();
    window.removeEventListener("beforeunload", cleanupPresence);
    syncController.stop();
    unregisterBrowserCallbacks();
  });
  legacy_pre_effect(() => get(shareTypeState), () => {
    set(showShareTypeModal, get(shareTypeState).showModal);
  });
  legacy_pre_effect(() => get(previewState), () => {
    set(previewVisible, get(previewState).visible);
  });
  legacy_pre_effect(() => get(previewState), () => {
    set(previewPos, get(previewState).position);
  });
  legacy_pre_effect(() => get(uploadDestinationChoice), () => {
    set(showUploadDestinationModal, get(uploadDestinationChoice).showModal);
  });
  legacy_pre_effect(
    () => (get(syncKey), get(selectedConversation$1), get(pollingActive)),
    () => {
      set(syncKey, applyConversationSyncKeyChange({
        currentKey: get(syncKey),
        nextKey: getConversationSyncKey(get(selectedConversation$1), get(pollingActive)),
        syncController
      }));
    }
  );
  legacy_pre_effect_reset();
  init();
  var fragment = root$2();
  var node = first_child(fragment);
  Layout(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node_1 = first_child(fragment_1);
      {
        var consequent_1 = ($$anchor3) => {
          var div = root_2$3();
          var node_2 = child(div);
          {
            let $0 = /* @__PURE__ */ derived_safe_equal(() => (deep_read_state(get$1), deep_read_state(authStore), untrack(() => get$1(authStore).user.login)));
            let $1 = /* @__PURE__ */ derived_safe_equal(() => (deep_read_state(getLocalPeerId), untrack(getLocalPeerId)));
            let $2 = /* @__PURE__ */ derived_safe_equal(() => (deep_read_state(getCurrentLeader), untrack(getCurrentLeader)));
            ConversationHeader(node_2, {
              get conversation() {
                return get(selectedConversation$1);
              },
              get currentUsername() {
                return get($0);
              },
              get localPeerId() {
                return get($1);
              },
              get currentLeader() {
                return get($2);
              },
              get peerConnections() {
                return $peerConnections();
              },
              get typingUsers() {
                return $typingUsers();
              },
              get pollingActive() {
                return get(pollingActive);
              },
              get callActive() {
                return get(callActive);
              },
              onTogglePresence: togglePresence,
              onForceCommit: forceCommitConversation,
              onShowParticipants: () => set(showParticipantModal, true),
              onEndCall: endCall2
            });
          }
          var node_3 = sibling(node_2, 2);
          {
            var consequent = ($$anchor4) => {
              {
                let $0 = /* @__PURE__ */ derived_safe_equal(() => get(recording) ? stopRecording : startRecording);
                ConversationCallPanel($$anchor4, {
                  get localStream() {
                    return get(localStream2);
                  },
                  get remoteStream() {
                    return get(remoteStream2);
                  },
                  get micOn() {
                    return get(micOn);
                  },
                  get cameraOn() {
                    return get(cameraOn);
                  },
                  get remoteMicOn() {
                    return get(remoteMicOn);
                  },
                  get remoteCameraOn() {
                    return get(remoteCameraOn);
                  },
                  get remoteScreenSharing() {
                    return get(remoteScreenSharing);
                  },
                  get remoteScreenShareMeta() {
                    return get(remoteScreenShareMeta);
                  },
                  get screenSharing() {
                    return get(screenSharing);
                  },
                  get screenShareStream() {
                    return get(screenShareStream);
                  },
                  get previewVisible() {
                    return get(previewVisible);
                  },
                  get previewPos() {
                    return get(previewPos);
                  },
                  get recording() {
                    return get(recording);
                  },
                  get remoteRecording() {
                    return get(remoteRecording);
                  },
                  get showShareTypeModal() {
                    return get(showShareTypeModal);
                  },
                  get showUploadDestinationModal() {
                    return get(showUploadDestinationModal);
                  },
                  onFileInput: handleFileInput,
                  onOpenShareTypeModal: openShareTypeModal,
                  onCloseShareTypeModal: closeShareTypeModal,
                  onSelectShareType: selectShareType,
                  onStopScreenShare: stopScreenShare,
                  onChangeScreenSource: changeScreenSource,
                  onToggleMic: toggleMic,
                  onToggleCamera: toggleCamera,
                  get onToggleRecording() {
                    return get($0);
                  },
                  onPreviewMouseDown,
                  onClosePreview: closePreview,
                  onReopenPreview: reopenPreview,
                  onSelectUploadDestination: selectUploadDestination,
                  onResetUploadDestination: resetUploadDestination
                });
              }
            };
            if_block(node_3, ($$render) => {
              if (get(callActive)) $$render(consequent);
            });
          }
          var div_1 = sibling(node_3, 2);
          var node_4 = child(div_1);
          {
            let $0 = /* @__PURE__ */ derived_safe_equal(() => $selectedConversationStore() || get(selectedConversation$1));
            MessageList(node_4, {
              get conversation() {
                return get($0);
              },
              $$events: { reply: (e) => set(replyingTo, e.detail) }
            });
          }
          var div_2 = sibling(div_1, 2);
          var node_5 = child(div_2);
          {
            let $0 = /* @__PURE__ */ derived_safe_equal(() => $selectedConversationStore() || get(selectedConversation$1));
            MessageInput(node_5, {
              get conversation() {
                return get($0);
              },
              get repo() {
                return get(currentRepo);
              },
              get replyingTo() {
                return get(replyingTo);
              },
              set replyingTo($$value) {
                set(replyingTo, $$value);
              },
              $$legacy: true
            });
          }
          append($$anchor3, div);
        };
        var alternate = ($$anchor3) => {
          var p = root_4$2();
          append($$anchor3, p);
        };
        if_block(node_1, ($$render) => {
          if (get(selectedConversation$1)) $$render(consequent_1);
          else $$render(alternate, -1);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  var node_6 = sibling(node, 2);
  {
    var consequent_2 = ($$anchor2) => {
      {
        let $0 = /* @__PURE__ */ derived_safe_equal(() => (deep_read_state(get$1), deep_read_state(authStore), untrack(() => get$1(authStore).user.login)));
        let $1 = /* @__PURE__ */ derived_safe_equal(() => (deep_read_state(getCurrentLeader), untrack(getCurrentLeader)));
        let $2 = /* @__PURE__ */ derived_safe_equal(() => (deep_read_state(getLocalPeerId), untrack(getLocalPeerId)));
        ParticipantsModal($$anchor2, {
          get currentUsername() {
            return get($0);
          },
          get currentLeader() {
            return get($1);
          },
          get localPeerId() {
            return get($2);
          },
          get peerConnections() {
            return $peerConnections();
          },
          get onlinePeers() {
            return $onlinePeers();
          },
          onClose: () => set(showParticipantModal, false)
        });
      }
    };
    if_block(node_6, ($$render) => {
      if (get(showParticipantModal)) $$render(consequent_2);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root_1$3 = /* @__PURE__ */ from_svg(`<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Creating...`, 1);
var root$1 = /* @__PURE__ */ from_html(`<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><div class="bg-white p-4 rounded shadow-md w-96"><h2 class="text-lg font-semibold mb-2">New Conversation</h2> <input placeholder="Conversation title" class="w-full border px-3 py-2 rounded mb-4"/> <div class="flex justify-end gap-2"><button class="bg-gray-200 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button> <button class="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><!></button></div></div></div>`);
function NewConversationModal($$anchor, $$props) {
  push($$props, false);
  const dispatch = createEventDispatcher();
  let loading = prop($$props, "loading", 8, false);
  let title = /* @__PURE__ */ mutable_source("");
  function submit() {
    if (!get(title).trim()) {
      alert("Title is required.");
      return;
    }
    if (loading()) return;
    dispatch("create", { title: get(title).trim() });
  }
  function cancel() {
    if (loading()) return;
    dispatch("cancel");
  }
  function handleKeydown(event2) {
    if (event2.key === "Enter" && !loading()) {
      submit();
    }
  }
  init();
  var div = root$1();
  var div_1 = child(div);
  var input = sibling(child(div_1), 2);
  var div_2 = sibling(input, 2);
  var button = child(div_2);
  var button_1 = sibling(button, 2);
  var node = child(button_1);
  {
    var consequent = ($$anchor2) => {
      var fragment = root_1$3();
      append($$anchor2, fragment);
    };
    var alternate = ($$anchor2) => {
      var text$1 = text("Create");
      append($$anchor2, text$1);
    };
    if_block(node, ($$render) => {
      if (loading()) $$render(consequent);
      else $$render(alternate, -1);
    });
  }
  template_effect(
    ($0) => {
      input.disabled = loading();
      button.disabled = loading();
      button_1.disabled = $0;
    },
    [
      () => (deep_read_state(loading()), get(title), untrack(() => loading() || !get(title).trim()))
    ]
  );
  bind_value(input, () => get(title), ($$value) => set(title, $$value));
  event("keydown", input, handleKeydown);
  event("click", button, cancel);
  event("click", button_1, submit);
  append($$anchor, div);
  pop();
}
var root_3$1 = /* @__PURE__ */ from_html(`<div class="flex border-b"><button>Repository Details</button> <button> </button></div>`);
var root_5$2 = /* @__PURE__ */ from_html(`<button class="ml-2 text-xs text-blue-600 underline hover:text-blue-800">View conversations</button>`);
var root_7$1 = /* @__PURE__ */ from_svg(`<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Activating...`, 1);
var root_6$1 = /* @__PURE__ */ from_html(`<button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"><!></button>`);
var root_10 = /* @__PURE__ */ from_html(`<option> </option>`);
var root_9$1 = /* @__PURE__ */ from_html(`<div class="mt-6 border-t pt-4 space-y-3"><h3 class="text-lg font-semibold text-gray-800">🛠️ Messaging Config</h3> <div class="grid gap-2 text-sm text-gray-700"><label>Commit frequency (min): <input type="number" class="w-full border px-2 py-1 rounded"/></label> <label>Binary storage type: <select class="w-full border px-2 py-1 rounded"><option>gitfs</option><option>s3</option><option>google_drive</option></select></label> <label>Storage URL: <select class="w-full border px-2 py-1 rounded"><option disabled="">— Select a credential —</option><!></select></label></div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">💾 Save Configuration</button></div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">💬 New Conversation</button> <!>`, 1);
var root_4$1 = /* @__PURE__ */ from_html(`<div class="text-sm text-gray-700 space-y-1"><div><strong>Name:</strong> </div> <div><strong>Owner:</strong> </div> <div><strong>GitHub:</strong> <a target="_blank" class="text-blue-600 underline hover:text-blue-800"> </a></div> <div><strong>Visibility:</strong> </div> <div><strong>Messaging:</strong> <!></div></div> <!> <!>`, 1);
var root_13 = /* @__PURE__ */ from_html(`<div class="flex items-center justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>`);
var root_14 = /* @__PURE__ */ from_html(`<p class="text-gray-400 italic text-center py-8">No files have been uploaded to this repository yet.</p>`);
var root_17 = /* @__PURE__ */ from_html(`<span> </span>`);
var root_16 = /* @__PURE__ */ from_html(`<div class="border rounded-lg p-3 hover:bg-gray-50 transition-colors"><div class="flex items-start justify-between"><div class="flex items-start gap-3"><!> <div><a target="_blank" rel="noopener noreferrer" class="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"> <!></a> <div class="flex items-center gap-4 text-sm text-gray-500 mt-1"><span> </span> <span class="flex items-center gap-1"><!> </span> <!></div></div></div> <span class="text-xs text-gray-400"> </span></div></div>`);
var root_15 = /* @__PURE__ */ from_html(`<div class="space-y-2"></div>`);
var root_12 = /* @__PURE__ */ from_html(`<div class="space-y-4"><!> <div class="mt-4 text-center"><button class="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50">Refresh Files</button></div></div>`);
var root_2$2 = /* @__PURE__ */ from_html(`<div class="p-6 space-y-4 bg-white shadow rounded max-w-3xl mx-auto mt-6"><h2 class="text-2xl font-semibold text-blue-700"> </h2> <!> <!> <!></div>`);
var root_18 = /* @__PURE__ */ from_html(`<p class="text-gray-400 italic text-center mt-20">Select a repository from the sidebar to view its details.</p>`);
function Repos($$anchor, $$props) {
  push($$props, false);
  let credentials = /* @__PURE__ */ mutable_source([]);
  let repo = /* @__PURE__ */ mutable_source();
  let activating = /* @__PURE__ */ mutable_source(false);
  let showModal = /* @__PURE__ */ mutable_source(false);
  let creatingConversation = /* @__PURE__ */ mutable_source(false);
  let activeTab = /* @__PURE__ */ mutable_source(
    "details"
    // 'details' or 'files'
  );
  let repoFiles = /* @__PURE__ */ mutable_source([]);
  let loadingFiles = /* @__PURE__ */ mutable_source(false);
  let lastDiscoveredRepo = /* @__PURE__ */ mutable_source(null);
  selectedRepo.subscribe((r2) => set(repo, r2));
  onMount(async () => {
    const token = localStorage.getItem("skygit_token");
    if (!token) return;
    try {
      const { secrets } = await getSecretsMap(token);
      const urls = Object.keys(secrets);
      const list = [];
      for (const url of urls) {
        try {
          const decrypted = await decryptJSON(token, secrets[url]);
          list.push({ url, ...decrypted });
        } catch (e) {
          console.warn("Failed to decrypt", url, e);
        }
      }
      set(credentials, list);
    } catch (e) {
      console.warn("Could not load secrets", e);
    }
  });
  async function activateMessaging() {
    const token = localStorage.getItem("skygit_token");
    if (!get(repo) || !token) return;
    set(activating, true);
    try {
      await activateMessagingForRepo(token, get(repo));
      mutate(repo, get(repo).has_messages = true), invalidate_inner_signals(() => {
        get(credentials);
      });
      selectedRepo.set({ ...get(repo) });
    } catch (e) {
      alert("Failed to activate messaging.");
      console.warn(e);
    } finally {
      set(activating, false);
    }
  }
  async function saveConfig() {
    const token = localStorage.getItem("skygit_token");
    if (!token || !get(repo)) return;
    try {
      await updateRepoMessagingConfig(token, get(repo));
      alert("✅ Messaging config updated.");
      try {
        await storeEncryptedCredentials(token, get(repo));
      } catch (e) {
        alert("❌ Failed to store credential.");
        console.warn(e);
      }
    } catch (e) {
      alert("❌ Failed to update config.");
      console.warn(e);
    }
  }
  async function handleCreate(event2) {
    const title = event2.detail.title;
    const token = localStorage.getItem("skygit_token");
    set(creatingConversation, true);
    try {
      await createConversation(token, get(repo), title);
      set(showModal, false);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to create conversation. Please try again.");
    } finally {
      set(creatingConversation, false);
    }
  }
  function handleCancel() {
    set(showModal, false);
  }
  function viewConversations() {
    if (!get(repo)) return;
    searchQuery.set(get(repo).full_name);
    selectedConversation.set(null);
    currentContent.set(null);
    currentRoute.set("chats");
  }
  async function loadFiles() {
    if (!get(repo) || get(loadingFiles)) return;
    set(loadingFiles, true);
    const token = localStorage.getItem("skygit_token");
    try {
      set(repoFiles, await getRepositoryFiles(token, get(repo)));
    } catch (error) {
      console.error("Failed to load files:", error);
      set(repoFiles, []);
    } finally {
      set(loadingFiles, false);
    }
  }
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }
  legacy_pre_effect(
    () => (get(repo), get(lastDiscoveredRepo), discoverConversations),
    () => {
      if (get(repo) && get(repo).has_messages && get(repo).full_name !== get(lastDiscoveredRepo)) {
        set(lastDiscoveredRepo, get(repo).full_name);
        const token = localStorage.getItem("skygit_token");
        if (token) {
          discoverConversations(token, get(repo)).catch((err) => console.warn("[SkyGit] Failed to auto-discover conversations:", err));
        }
      }
    }
  );
  legacy_pre_effect(() => (get(repo), get(activeTab)), () => {
    if (get(repo)) {
      set(repoFiles, []);
      if (get(activeTab) === "files") {
        loadFiles();
      }
    }
  });
  legacy_pre_effect(() => (get(activeTab), get(repo), get(repoFiles)), () => {
    if (get(activeTab) === "files" && get(repo) && get(repoFiles).length === 0) {
      loadFiles();
    }
  });
  legacy_pre_effect_reset();
  init();
  Layout($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      {
        var consequent_11 = ($$anchor3) => {
          var div = root_2$2();
          var h2 = child(div);
          var text$1 = child(h2);
          var node_1 = sibling(h2, 2);
          {
            var consequent = ($$anchor4) => {
              var div_1 = root_3$1();
              var button = child(div_1);
              var button_1 = sibling(button, 2);
              var text_1 = child(button_1);
              template_effect(() => {
                set_class(button, 1, `px-4 py-2 text-sm font-medium ${get(activeTab) === "details" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`);
                set_class(button_1, 1, `px-4 py-2 text-sm font-medium ${get(activeTab) === "files" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`);
                set_text(text_1, `Files (${(get(repoFiles), untrack(() => get(repoFiles).length)) ?? ""})`);
              });
              event("click", button, () => set(activeTab, "details"));
              event("click", button_1, () => set(activeTab, "files"));
              append($$anchor4, div_1);
            };
            if_block(node_1, ($$render) => {
              if (get(repo), untrack(() => get(repo).has_messages)) $$render(consequent);
            });
          }
          var node_2 = sibling(node_1, 2);
          {
            var consequent_6 = ($$anchor4) => {
              var fragment_2 = root_4$1();
              var div_2 = first_child(fragment_2);
              var div_3 = child(div_2);
              var text_2 = sibling(child(div_3));
              var div_4 = sibling(div_3, 2);
              var text_3 = sibling(child(div_4));
              var div_5 = sibling(div_4, 2);
              var a = sibling(child(div_5), 2);
              var text_4 = child(a);
              var div_6 = sibling(div_5, 2);
              var text_5 = sibling(child(div_6));
              var div_7 = sibling(div_6, 2);
              var text_6 = sibling(child(div_7));
              var node_3 = sibling(text_6);
              {
                var consequent_1 = ($$anchor5) => {
                  var button_2 = root_5$2();
                  event("click", button_2, viewConversations);
                  append($$anchor5, button_2);
                };
                if_block(node_3, ($$render) => {
                  if (get(repo), untrack(() => get(repo).has_messages)) $$render(consequent_1);
                });
              }
              var node_4 = sibling(div_2, 2);
              {
                var consequent_3 = ($$anchor5) => {
                  var button_3 = root_6$1();
                  var node_5 = child(button_3);
                  {
                    var consequent_2 = ($$anchor6) => {
                      var fragment_3 = root_7$1();
                      append($$anchor6, fragment_3);
                    };
                    var alternate = ($$anchor6) => {
                      var text_7 = text("💬 Activate Messaging");
                      append($$anchor6, text_7);
                    };
                    if_block(node_5, ($$render) => {
                      if (get(activating)) $$render(consequent_2);
                      else $$render(alternate, -1);
                    });
                  }
                  template_effect(() => button_3.disabled = get(activating));
                  event("click", button_3, activateMessaging);
                  append($$anchor5, button_3);
                };
                if_block(node_4, ($$render) => {
                  if (get(repo), untrack(() => !get(repo).has_messages)) $$render(consequent_3);
                });
              }
              var node_6 = sibling(node_4, 2);
              {
                var consequent_5 = ($$anchor5) => {
                  var fragment_4 = root_9$1();
                  var div_8 = first_child(fragment_4);
                  var div_9 = sibling(child(div_8), 2);
                  var label = child(div_9);
                  var input = sibling(child(label));
                  var label_1 = sibling(label, 2);
                  var select = sibling(child(label_1));
                  var option = child(select);
                  option.value = option.__value = "gitfs";
                  var option_1 = sibling(option);
                  option_1.value = option_1.__value = "s3";
                  var option_2 = sibling(option_1);
                  option_2.value = option_2.__value = "google_drive";
                  var label_2 = sibling(label_1, 2);
                  var select_1 = sibling(child(label_2));
                  var option_3 = child(select_1);
                  option_3.value = option_3.__value = "";
                  var node_7 = sibling(option_3);
                  each(
                    node_7,
                    1,
                    () => (get(credentials), get(repo), untrack(() => get(credentials).filter((c) => c.type === get(repo).config.binary_storage_type))),
                    index,
                    ($$anchor6, cred) => {
                      var option_4 = root_10();
                      var text_8 = child(option_4);
                      var option_4_value = {};
                      template_effect(() => {
                        set_text(text_8, (get(cred), untrack(() => get(cred).url)));
                        if (option_4_value !== (option_4_value = (get(cred), untrack(() => get(cred).url)))) {
                          option_4.value = (option_4.__value = (get(cred), untrack(() => get(cred).url))) ?? "";
                        }
                      });
                      append($$anchor6, option_4);
                    }
                  );
                  var button_4 = sibling(div_9, 2);
                  var button_5 = sibling(div_8, 2);
                  var node_8 = sibling(button_5, 2);
                  {
                    var consequent_4 = ($$anchor6) => {
                      NewConversationModal($$anchor6, {
                        get loading() {
                          return get(creatingConversation);
                        },
                        $$events: { create: handleCreate, cancel: handleCancel }
                      });
                    };
                    if_block(node_8, ($$render) => {
                      if (get(showModal)) $$render(consequent_4);
                    });
                  }
                  bind_value(input, () => get(repo).config.commit_frequency_min, ($$value) => (mutate(repo, get(repo).config.commit_frequency_min = $$value), invalidate_inner_signals(() => {
                    get(credentials);
                  })));
                  bind_select_value(select, () => get(repo).config.binary_storage_type, ($$value) => (mutate(repo, get(repo).config.binary_storage_type = $$value), invalidate_inner_signals(() => {
                    get(credentials);
                  })));
                  bind_select_value(select_1, () => get(repo).config.storage_info.url, ($$value) => (mutate(repo, get(repo).config.storage_info.url = $$value), invalidate_inner_signals(() => {
                    get(credentials);
                  })));
                  event("click", button_4, saveConfig);
                  event("click", button_5, () => set(showModal, true));
                  append($$anchor5, fragment_4);
                };
                if_block(node_6, ($$render) => {
                  if (get(repo), untrack(() => get(repo).has_messages && get(repo).config)) $$render(consequent_5);
                });
              }
              template_effect(() => {
                set_text(text_2, ` ${(get(repo), untrack(() => get(repo).name)) ?? ""}`);
                set_text(text_3, ` ${(get(repo), untrack(() => get(repo).owner)) ?? ""}`);
                set_attribute(a, "href", (get(repo), untrack(() => get(repo).url)));
                set_text(text_4, (get(repo), untrack(() => get(repo).url)));
                set_text(text_5, ` ${(get(repo), untrack(() => get(repo).private ? "🔒 Private" : "🌐 Public")) ?? ""}`);
                set_text(text_6, ` ${(get(repo), untrack(() => get(repo).has_messages ? "💬 Available" : "🚫 Not enabled")) ?? ""} `);
              });
              append($$anchor4, fragment_2);
            };
            if_block(node_2, ($$render) => {
              if (get(repo), get(activeTab), untrack(() => !get(repo).has_messages || get(activeTab) === "details")) $$render(consequent_6);
            });
          }
          var node_9 = sibling(node_2, 2);
          {
            var consequent_10 = ($$anchor4) => {
              var div_10 = root_12();
              var node_10 = child(div_10);
              {
                var consequent_7 = ($$anchor5) => {
                  var div_11 = root_13();
                  append($$anchor5, div_11);
                };
                var consequent_8 = ($$anchor5) => {
                  var p = root_14();
                  append($$anchor5, p);
                };
                var alternate_1 = ($$anchor5) => {
                  var div_12 = root_15();
                  each(div_12, 5, () => get(repoFiles), index, ($$anchor6, file) => {
                    var div_13 = root_16();
                    var div_14 = child(div_13);
                    var div_15 = child(div_14);
                    var node_11 = child(div_15);
                    File_text(node_11, { class: "w-5 h-5 text-gray-400 mt-0.5" });
                    var div_16 = sibling(node_11, 2);
                    var a_1 = child(div_16);
                    var text_9 = child(a_1);
                    var node_12 = sibling(text_9);
                    External_link(node_12, { class: "w-3 h-3" });
                    var div_17 = sibling(a_1, 2);
                    var span = child(div_17);
                    var text_10 = child(span);
                    var span_1 = sibling(span, 2);
                    var node_13 = child(span_1);
                    Calendar(node_13, { class: "w-3 h-3" });
                    var text_11 = sibling(node_13);
                    var node_14 = sibling(span_1, 2);
                    {
                      var consequent_9 = ($$anchor7) => {
                        var span_2 = root_17();
                        var text_12 = child(span_2);
                        template_effect(() => set_text(text_12, (get(file), untrack(() => get(file).mimeType))));
                        append($$anchor7, span_2);
                      };
                      if_block(node_14, ($$render) => {
                        if (get(file), untrack(() => get(file).mimeType)) $$render(consequent_9);
                      });
                    }
                    var span_3 = sibling(div_15, 2);
                    var text_13 = child(span_3);
                    template_effect(
                      ($0, $1) => {
                        set_attribute(a_1, "href", (get(file), untrack(() => get(file).fileUrl)));
                        set_text(text_9, `${(get(file), untrack(() => get(file).fileName)) ?? ""} `);
                        set_text(text_10, $0);
                        set_text(text_11, ` ${$1 ?? ""}`);
                        set_text(text_13, (get(file), untrack(() => get(file).storageType === "google_drive" ? "📁" : "🪣")));
                      },
                      [
                        () => (get(file), untrack(() => formatFileSize(get(file).fileSize))),
                        () => (get(file), untrack(() => new Date(get(file).uploadedAt).toLocaleDateString()))
                      ]
                    );
                    append($$anchor6, div_13);
                  });
                  append($$anchor5, div_12);
                };
                if_block(node_10, ($$render) => {
                  if (get(loadingFiles)) $$render(consequent_7);
                  else if (get(repoFiles), untrack(() => get(repoFiles).length === 0)) $$render(consequent_8, 1);
                  else $$render(alternate_1, -1);
                });
              }
              var div_18 = sibling(node_10, 2);
              var button_6 = child(div_18);
              template_effect(() => button_6.disabled = get(loadingFiles));
              event("click", button_6, loadFiles);
              append($$anchor4, div_10);
            };
            if_block(node_9, ($$render) => {
              if (get(repo), get(activeTab), untrack(() => get(repo).has_messages && get(activeTab) === "files")) $$render(consequent_10);
            });
          }
          template_effect(() => set_text(text$1, (get(repo), untrack(() => get(repo).full_name))));
          append($$anchor3, div);
        };
        var alternate_2 = ($$anchor3) => {
          var p_1 = root_18();
          append($$anchor3, p_1);
        };
        if_block(node, ($$render) => {
          if (get(repo)) $$render(consequent_11);
          else $$render(alternate_2, -1);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  pop();
}
class CallRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }
  startRecording(remoteStream2, localStream2) {
    this.recordedChunks = [];
    const combinedStream = new MediaStream();
    remoteStream2.getTracks().forEach((track) => {
      combinedStream.addTrack(track);
    });
    localStream2.getAudioTracks().forEach((track) => {
      combinedStream.addTrack(track);
    });
    try {
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp8,opus"
      });
    } catch (e) {
      console.warn("VP8/Opus not supported, trying default mimeType");
      this.mediaRecorder = new MediaRecorder(combinedStream);
    }
    this.mediaRecorder.ondataavailable = (event2) => {
      if (event2.data.size > 0) {
        this.recordedChunks.push(event2.data);
      }
    };
    this.mediaRecorder.start();
  }
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject("No active recorder");
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: "video/webm"
        });
        this.recordedChunks = [];
        this.mediaRecorder = null;
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }
  downloadRecording(blob, filename = "call-recording.webm") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
const recorder = new CallRecorder();
var root_2$1 = /* @__PURE__ */ from_html(`<div class="bg-blue-50 p-3 rounded-lg border border-blue-100"><p class="text-sm text-blue-800 font-medium mb-2">Cloud Storage Detected</p> <div class="text-xs text-blue-600 mb-2">Repository is linked to <strong class="uppercase"> </strong>.</div> <label for="recording-storage-url" class="block text-xs font-medium text-blue-800 mb-1">Destination Location</label> <input id="recording-storage-url" type="text" class="w-full border border-blue-200 rounded px-2 py-1 text-xs bg-white text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"/> <p class="text-[10px] text-blue-500 mt-1"><!></p></div>`);
var root_5$1 = /* @__PURE__ */ from_html(`<div class="bg-gray-50 p-3 rounded-lg border border-gray-200"><p class="text-sm text-gray-800 font-medium mb-2">Git Repository Storage</p> <div class="text-xs text-gray-600 mb-2">No external cloud storage configured. File will be
                            saved to the <strong>Git repository</strong>.</div> <label for="recording-folder-path" class="block text-xs font-medium text-gray-700 mb-1">Folder Path</label> <input id="recording-folder-path" type="text" class="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-700 focus:ring-1 focus:ring-gray-500 outline-none" placeholder="recordings"/> <div class="mt-2 flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100"><!> <div><strong>Limits:</strong> Max 50MB per file. Max
                                1GB total repo size. <br/>Large files may slow down the repository.</div></div></div>`);
var root_6 = /* @__PURE__ */ from_html(`<div class="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2 text-red-700 text-sm"><!> <span> </span></div>`);
var root_7 = /* @__PURE__ */ from_html(`<span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Uploading...`, 1);
var root_8 = /* @__PURE__ */ from_html(`<!> Saved!`, 1);
var root_9 = /* @__PURE__ */ from_html(`<!> Save to Cloud`, 1);
var root_1$2 = /* @__PURE__ */ from_html(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4"><button type="button" class="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Dismiss save recording modal"></button> <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 overflow-hidden"><button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close save recording modal"><!></button> <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><!> Save Recording</h2> <div class="space-y-4"><div><label for="recording-file-name" class="block text-sm font-medium text-gray-700 mb-1">Filename</label> <input id="recording-file-name" type="text" class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/></div> <!> <!> <div class="grid grid-cols-2 gap-3 mt-6"><button class="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"><!> Download</button> <button><!></button></div></div></div></div>`);
function SaveRecordingModal($$anchor, $$props) {
  push($$props, false);
  const $selectedConversation = () => store_get(selectedConversation, "$selectedConversation", $$stores);
  const $authStore = () => store_get(authStore, "$authStore", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  const repo = /* @__PURE__ */ mutable_source();
  const storageType = /* @__PURE__ */ mutable_source();
  const hasCloudStorage = /* @__PURE__ */ mutable_source();
  const isGitFS = /* @__PURE__ */ mutable_source();
  let isOpen = prop($$props, "isOpen", 8, false);
  let blob = prop($$props, "blob", 8, null);
  let onClose = prop($$props, "onClose", 8);
  let uploading = /* @__PURE__ */ mutable_source(false);
  let uploadSuccess = /* @__PURE__ */ mutable_source(false);
  let error = /* @__PURE__ */ mutable_source(null);
  let fileName = /* @__PURE__ */ mutable_source(`recording-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}.webm`);
  let storageUrl = /* @__PURE__ */ mutable_source("");
  async function handleDownload() {
    recorder.downloadRecording(blob(), get(fileName));
    onClose()();
  }
  async function handleUpload() {
    if (!blob() || !get(repo)) return;
    set(uploading, true);
    set(error, null);
    try {
      const file = new File([blob()], get(fileName), { type: "video/webm" });
      const token = $authStore().token;
      const result = await uploadFile(file, get(repo), token, get(storageUrl));
      set(uploadSuccess, true);
      setTimeout(
        () => {
          onClose()();
          set(
            uploadSuccess,
            false
            // reset for next time
          );
        },
        2e3
      );
    } catch (err) {
      console.error("Upload failed:", err);
      set(error, err.message);
    } finally {
      set(uploading, false);
    }
  }
  legacy_pre_effect(() => ($selectedConversation(), getRepoByFullName), () => {
    set(repo, $selectedConversation() ? getRepoByFullName($selectedConversation().repo) : null);
  });
  legacy_pre_effect(() => get(repo), () => {
    var _a2, _b2;
    set(storageType, ((_b2 = (_a2 = get(repo)) == null ? void 0 : _a2.config) == null ? void 0 : _b2.binary_storage_type) || "gitfs");
  });
  legacy_pre_effect(() => get(storageType), () => {
    set(hasCloudStorage, get(storageType) === "s3" || get(storageType) === "google_drive");
  });
  legacy_pre_effect(() => get(storageType), () => {
    set(isGitFS, get(storageType) === "gitfs");
  });
  legacy_pre_effect(() => (get(repo), get(isGitFS)), () => {
    var _a2, _b2, _c2;
    if ((_c2 = (_b2 = (_a2 = get(repo)) == null ? void 0 : _a2.config) == null ? void 0 : _b2.storage_info) == null ? void 0 : _c2.url) {
      set(storageUrl, get(repo).config.storage_info.url);
    } else if (get(isGitFS)) {
      set(
        storageUrl,
        "recordings"
        // Default folder for GitFS
      );
    }
  });
  legacy_pre_effect_reset();
  init();
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_5 = ($$anchor2) => {
      var div = root_1$2();
      var button = child(div);
      var div_1 = sibling(button, 2);
      var button_1 = child(div_1);
      var node_1 = child(button_1);
      X(node_1, { size: 24 });
      var h2 = sibling(button_1, 2);
      var node_2 = child(h2);
      File_video(node_2, { class: "text-blue-600" });
      var div_2 = sibling(h2, 2);
      var div_3 = child(div_2);
      var input = sibling(child(div_3), 2);
      var node_3 = sibling(div_3, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var div_4 = root_2$1();
          var div_5 = sibling(child(div_4), 2);
          var strong = sibling(child(div_5));
          var text$1 = child(strong);
          var input_1 = sibling(div_5, 4);
          var p = sibling(input_1, 2);
          var node_4 = child(p);
          {
            var consequent = ($$anchor4) => {
              var text_1 = text("Paste a Google Drive Folder URL to save\n                                elsewhere.");
              append($$anchor4, text_1);
            };
            var alternate = ($$anchor4) => {
              var text_2 = text("Edit the S3 URL (s3://bucket/prefix) to change\n                                folder.");
              append($$anchor4, text_2);
            };
            if_block(node_4, ($$render) => {
              if (get(storageType) === "google_drive") $$render(consequent);
              else $$render(alternate, -1);
            });
          }
          template_effect(($0) => set_text(text$1, $0), [
            () => (get(storageType), untrack(() => get(storageType).replace("_", " ")))
          ]);
          bind_value(input_1, () => get(storageUrl), ($$value) => set(storageUrl, $$value));
          append($$anchor3, div_4);
        };
        var alternate_1 = ($$anchor3) => {
          var div_6 = root_5$1();
          var input_2 = sibling(child(div_6), 6);
          var div_7 = sibling(input_2, 2);
          var node_5 = child(div_7);
          Circle_alert(node_5, { size: 12, class: "mt-0.5 shrink-0" });
          bind_value(input_2, () => get(storageUrl), ($$value) => set(storageUrl, $$value));
          append($$anchor3, div_6);
        };
        if_block(node_3, ($$render) => {
          if (get(hasCloudStorage)) $$render(consequent_1);
          else $$render(alternate_1, -1);
        });
      }
      var node_6 = sibling(node_3, 2);
      {
        var consequent_2 = ($$anchor3) => {
          var div_8 = root_6();
          var node_7 = child(div_8);
          Circle_alert(node_7, { size: 16, class: "mt-0.5 shrink-0" });
          var span = sibling(node_7, 2);
          var text_3 = child(span);
          template_effect(() => set_text(text_3, get(error)));
          append($$anchor3, div_8);
        };
        if_block(node_6, ($$render) => {
          if (get(error)) $$render(consequent_2);
        });
      }
      var div_9 = sibling(node_6, 2);
      var button_2 = child(div_9);
      var node_8 = child(button_2);
      Download(node_8, { size: 18 });
      var button_3 = sibling(button_2, 2);
      var node_9 = child(button_3);
      {
        var consequent_3 = ($$anchor3) => {
          var fragment_1 = root_7();
          append($$anchor3, fragment_1);
        };
        var consequent_4 = ($$anchor3) => {
          var fragment_2 = root_8();
          var node_10 = first_child(fragment_2);
          Check(node_10, { size: 18 });
          append($$anchor3, fragment_2);
        };
        var alternate_2 = ($$anchor3) => {
          var fragment_3 = root_9();
          var node_11 = first_child(fragment_3);
          Upload(node_11, { size: 18 });
          append($$anchor3, fragment_3);
        };
        if_block(node_9, ($$render) => {
          if (get(uploading)) $$render(consequent_3);
          else if (get(uploadSuccess)) $$render(consequent_4, 1);
          else $$render(alternate_2, -1);
        });
      }
      template_effect(() => {
        set_class(button_3, 1, `flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white
                ${get(hasCloudStorage) ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`);
        button_3.disabled = get(uploading) || get(uploadSuccess);
      });
      event("click", button, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button_1, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      bind_value(input, () => get(fileName), ($$value) => set(fileName, $$value));
      event("click", button_2, handleDownload);
      event("click", button_3, handleUpload);
      transition(1, div_1, () => scale, () => ({ start: 0.95 }));
      transition(3, div, () => fade);
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (isOpen()) $$render(consequent_5);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root_2 = /* @__PURE__ */ from_html(`<div class="bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 border border-gray-700"><div class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center animate-pulse"><!></div> <div class="text-center"><h3 class="text-2xl font-bold text-white">Incoming Call</h3> <p class="text-gray-400 mt-2"> </p></div> <div class="flex gap-4 mt-4"><button class="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors" title="Decline"><!></button> <button class="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors animate-bounce" title="Answer"><!></button></div></div>`);
var root_4 = /* @__PURE__ */ from_html(`<div class="absolute inset-0 flex items-center justify-center flex-col gap-4"><div class="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center animate-pulse"><!></div> <p class="text-xl text-gray-300"> </p></div>`);
var root_5 = /* @__PURE__ */ from_html(`<div class="absolute inset-0 flex items-center justify-center bg-gray-800"><!></div>`);
var root_3 = /* @__PURE__ */ from_html(`<div class="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col p-4"><div class="flex-1 relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800"><!> <video autoplay="" playsinline="" class="w-full h-full object-cover"><track kind="captions"/></video> <div class="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-700"><video autoplay="" playsinline="" class="w-full h-full object-cover transform scale-x-[-1]"><track kind="captions"/></video> <!></div> <div class="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-white"><p class="font-medium"> </p> <p class="text-sm text-gray-300"> </p></div></div> <div class="h-20 flex items-center justify-center gap-6 mt-4"><button><!></button> <button class="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg scale-110"><!></button> <button><!></button> <button><!></button> <button><!></button></div></div>`, 2);
var root_1$1 = /* @__PURE__ */ from_html(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><!></div> <!>`, 1);
function CallOverlay($$anchor, $$props) {
  push($$props, false);
  const $callStatus = () => store_get(callStatus, "$callStatus", $$stores);
  const $isRecording = () => store_get(isRecording, "$isRecording", $$stores);
  const $remoteStream = () => store_get(remoteStream, "$remoteStream", $$stores);
  const $localStream = () => store_get(localStream, "$localStream", $$stores);
  const $callStartTime = () => store_get(callStartTime, "$callStartTime", $$stores);
  const $remotePeerId = () => store_get(remotePeerId, "$remotePeerId", $$stores);
  const $isVideoEnabled = () => store_get(isVideoEnabled, "$isVideoEnabled", $$stores);
  const $isAudioEnabled = () => store_get(isAudioEnabled, "$isAudioEnabled", $$stores);
  const $isScreenSharing = () => store_get(isScreenSharing, "$isScreenSharing", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  let localVideoEl = /* @__PURE__ */ mutable_source();
  let remoteVideoEl = /* @__PURE__ */ mutable_source();
  let showSaveModal = /* @__PURE__ */ mutable_source(false);
  let recordedBlob = /* @__PURE__ */ mutable_source(null);
  let callDirection = /* @__PURE__ */ mutable_source(
    "outgoing"
    // Track if call was incoming or outgoing
  );
  async function endCall$1() {
    var _a2;
    const auth = get$1(authStore);
    const conversation = get$1(selectedConversation);
    const startTime = get$1(callStartTime);
    const peer = get$1(remotePeerId);
    const status = get$1(callStatus);
    if ((auth == null ? void 0 : auth.token) && ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login) && startTime && peer) {
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1e3);
      if (status === "connected" || durationSeconds > 0) {
        const callRecord = createCallRecord({
          remotePeer: peer,
          type: "video",
          direction: get(callDirection),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          duration: durationSeconds,
          repoContext: (conversation == null ? void 0 : conversation.repo) || null
        });
        addCallToHistory(auth.token, auth.user.login, callRecord);
      }
    }
    endCall();
  }
  async function toggleRecording() {
    if ($isRecording()) {
      const blob = await recorder.stopRecording();
      set(recordedBlob, blob);
      set(showSaveModal, true);
      isRecording.set(false);
    } else {
      if ($remoteStream() && $localStream()) {
        recorder.startRecording($remoteStream(), $localStream());
        isRecording.set(true);
      }
    }
  }
  let durationInterval = /* @__PURE__ */ mutable_source();
  let duration = /* @__PURE__ */ mutable_source("00:00");
  function startTimer() {
    const start = $callStartTime() || Date.now();
    set(durationInterval, setInterval(
      () => {
        const diff = Math.floor((Date.now() - start) / 1e3);
        const mins = Math.floor(diff / 60).toString().padStart(2, "0");
        const secs = (diff % 60).toString().padStart(2, "0");
        set(duration, `${mins}:${secs}`);
      },
      1e3
    ));
  }
  function stopTimer() {
    clearInterval(get(durationInterval));
    set(durationInterval, null);
    set(duration, "00:00");
  }
  onDestroy(() => {
    stopTimer();
  });
  legacy_pre_effect(() => $callStatus(), () => {
    if ($callStatus() === "incoming") {
      set(callDirection, "incoming");
    } else if ($callStatus() === "calling") {
      set(callDirection, "outgoing");
    }
  });
  legacy_pre_effect(() => ($localStream(), get(localVideoEl)), () => {
    if ($localStream() && get(localVideoEl)) {
      mutate(localVideoEl, get(localVideoEl).srcObject = $localStream());
    }
  });
  legacy_pre_effect(() => ($remoteStream(), get(remoteVideoEl)), () => {
    if ($remoteStream() && get(remoteVideoEl)) {
      mutate(remoteVideoEl, get(remoteVideoEl).srcObject = $remoteStream());
    }
  });
  legacy_pre_effect(() => ($callStatus(), get(durationInterval)), () => {
    if ($callStatus() === "connected" && !get(durationInterval)) {
      startTimer();
    } else if ($callStatus() !== "connected" && get(durationInterval)) {
      stopTimer();
    }
  });
  legacy_pre_effect_reset();
  init();
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_7 = ($$anchor2) => {
      var fragment_1 = root_1$1();
      var div = first_child(fragment_1);
      var node_1 = child(div);
      {
        var consequent = ($$anchor3) => {
          var div_1 = root_2();
          var div_2 = child(div_1);
          var node_2 = child(div_2);
          Phone(node_2, { size: 48, class: "text-white" });
          var div_3 = sibling(div_2, 2);
          var p = sibling(child(div_3), 2);
          var text2 = child(p);
          var div_4 = sibling(div_3, 2);
          var button = child(div_4);
          var node_3 = child(button);
          Phone_off(node_3, { size: 32 });
          var button_1 = sibling(button, 2);
          var node_4 = child(button_1);
          Phone(node_4, { size: 32 });
          template_effect(() => set_text(text2, $remotePeerId() || "Unknown Caller"));
          event("click", button, endCall$1);
          event("click", button_1, function(...$$args) {
            answerCall == null ? void 0 : answerCall.apply(this, $$args);
          });
          transition(1, div_1, () => fly, () => ({ y: 20 }));
          append($$anchor3, div_1);
        };
        var alternate_4 = ($$anchor3) => {
          var div_5 = root_3();
          var div_6 = child(div_5);
          var node_5 = child(div_6);
          {
            var consequent_1 = ($$anchor4) => {
              var div_7 = root_4();
              var div_8 = child(div_7);
              var node_6 = child(div_8);
              Phone(node_6, { size: 40, class: "text-gray-400" });
              var p_1 = sibling(div_8, 2);
              var text_1 = child(p_1);
              template_effect(() => set_text(text_1, `Calling ${$remotePeerId() ?? ""}...`));
              append($$anchor4, div_7);
            };
            if_block(node_5, ($$render) => {
              if ($callStatus() === "calling") $$render(consequent_1);
            });
          }
          var video = sibling(node_5, 2);
          bind_this(video, ($$value) => set(remoteVideoEl, $$value), () => get(remoteVideoEl));
          var div_9 = sibling(video, 2);
          var video_1 = child(div_9);
          video_1.muted = true;
          bind_this(video_1, ($$value) => set(localVideoEl, $$value), () => get(localVideoEl));
          var node_7 = sibling(video_1, 2);
          {
            var consequent_2 = ($$anchor4) => {
              var div_10 = root_5();
              var node_8 = child(div_10);
              Video_off(node_8, { size: 24, class: "text-gray-500" });
              append($$anchor4, div_10);
            };
            if_block(node_7, ($$render) => {
              if (!$isVideoEnabled()) $$render(consequent_2);
            });
          }
          var div_11 = sibling(div_9, 2);
          var p_2 = child(div_11);
          var text_2 = child(p_2);
          var p_3 = sibling(p_2, 2);
          var text_3 = child(p_3);
          var div_12 = sibling(div_6, 2);
          var button_2 = child(div_12);
          var node_9 = child(button_2);
          {
            var consequent_3 = ($$anchor4) => {
              Mic($$anchor4, { size: 24 });
            };
            var alternate = ($$anchor4) => {
              Mic_off($$anchor4, { size: 24 });
            };
            if_block(node_9, ($$render) => {
              if ($isAudioEnabled()) $$render(consequent_3);
              else $$render(alternate, -1);
            });
          }
          var button_3 = sibling(button_2, 2);
          var node_10 = child(button_3);
          Phone_off(node_10, { size: 32 });
          var button_4 = sibling(button_3, 2);
          var node_11 = child(button_4);
          {
            var consequent_4 = ($$anchor4) => {
              Video($$anchor4, { size: 24 });
            };
            var alternate_1 = ($$anchor4) => {
              Video_off($$anchor4, { size: 24 });
            };
            if_block(node_11, ($$render) => {
              if ($isVideoEnabled()) $$render(consequent_4);
              else $$render(alternate_1, -1);
            });
          }
          var button_5 = sibling(button_4, 2);
          var node_12 = child(button_5);
          {
            var consequent_5 = ($$anchor4) => {
              Monitor_off($$anchor4, { size: 24 });
            };
            var alternate_2 = ($$anchor4) => {
              Monitor($$anchor4, { size: 24 });
            };
            if_block(node_12, ($$render) => {
              if ($isScreenSharing()) $$render(consequent_5);
              else $$render(alternate_2, -1);
            });
          }
          var button_6 = sibling(button_5, 2);
          var node_13 = child(button_6);
          {
            var consequent_6 = ($$anchor4) => {
              Square($$anchor4, { size: 24 });
            };
            var alternate_3 = ($$anchor4) => {
              Disc($$anchor4, { size: 24 });
            };
            if_block(node_13, ($$render) => {
              if ($isRecording()) $$render(consequent_6);
              else $$render(alternate_3, -1);
            });
          }
          template_effect(() => {
            set_text(text_2, $remotePeerId());
            set_text(text_3, get(duration));
            set_class(button_2, 1, `p-4 rounded-full ${$isAudioEnabled() ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"} text-white transition-colors`);
            set_class(button_4, 1, `p-4 rounded-full ${$isVideoEnabled() ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"} text-white transition-colors`);
            set_class(button_5, 1, `p-4 rounded-full ${$isScreenSharing() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-700 hover:bg-gray-600"} text-white transition-colors`);
            set_attribute(button_5, "title", $isScreenSharing() ? "Stop sharing" : "Share screen");
            set_class(button_6, 1, `p-4 rounded-full ${$isRecording() ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-gray-700 hover:bg-gray-600"} text-white transition-colors`);
            set_attribute(button_6, "title", $isRecording() ? "Stop recording" : "Record call");
          });
          event("click", button_2, function(...$$args) {
            toggleAudio == null ? void 0 : toggleAudio.apply(this, $$args);
          });
          event("click", button_3, endCall$1);
          event("click", button_4, function(...$$args) {
            toggleVideo == null ? void 0 : toggleVideo.apply(this, $$args);
          });
          event("click", button_5, function(...$$args) {
            toggleScreenShare == null ? void 0 : toggleScreenShare.apply(this, $$args);
          });
          event("click", button_6, toggleRecording);
          append($$anchor3, div_5);
        };
        if_block(node_1, ($$render) => {
          if ($callStatus() === "incoming") $$render(consequent);
          else $$render(alternate_4, -1);
        });
      }
      var node_14 = sibling(div, 2);
      SaveRecordingModal(node_14, {
        get isOpen() {
          return get(showSaveModal);
        },
        get blob() {
          return get(recordedBlob);
        },
        onClose: () => {
          set(showSaveModal, false);
          set(recordedBlob, null);
        }
      });
      transition(3, div, () => fade);
      append($$anchor2, fragment_1);
    };
    if_block(node, ($$render) => {
      if ($callStatus() !== "idle") $$render(consequent_7);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root_1 = /* @__PURE__ */ from_html(`<p class="text-center mt-20">Loading...</p>`);
var root = /* @__PURE__ */ from_html(`<!> <!>`, 1);
function App($$anchor, $$props) {
  push($$props, false);
  const $currentRoute = () => store_get(currentRoute, "$currentRoute", $$stores);
  const $syncState = () => store_get(syncState, "$syncState", $$stores);
  const [$$stores, $$cleanup] = setup_stores();
  let token = /* @__PURE__ */ mutable_source(null);
  let user = null;
  let loginError = /* @__PURE__ */ mutable_source("");
  authStore.subscribe((auth) => {
    if (!auth.isLoggedIn) {
      currentRoute.set("login");
      set(token, null);
      user = null;
    }
  });
  onMount(() => {
    const stored = loadStoredToken();
    if (stored) loginWithToken(stored);
    else currentRoute.set("login");
  });
  async function loginWithToken(t) {
    set(loginError, "");
    const validatedUser = await validateToken(t);
    if (!validatedUser) {
      localStorage.removeItem("skygit_token");
      set(loginError, "Invalid token. Please check your PAT and try again.");
      currentRoute.set("login");
      return;
    }
    set(token, t);
    user = validatedUser;
    saveToken(t);
    authStore.set({ isLoggedIn: true, token: get(token), user });
    const hasRepo = await checkSkyGitRepoExists(get(token), user.login);
    if (hasRepo) {
      currentRoute.set("home");
      await initializeRepoState();
    } else {
      currentRoute.set("consent");
    }
  }
  async function approveRepo() {
    await createSkyGitRepo(get(token));
    currentRoute.set("home");
    await initializeRepoState();
  }
  function rejectRepo() {
    localStorage.removeItem("skygit_token");
    currentRoute.set("login");
  }
  async function initializeRepoState() {
    try {
      console.log("[SkyGit] Initializing app state...");
      await initializeStartupState(get(token));
    } catch (e) {
      console.warn("[SkyGit] Failed to initialize startup state:", e);
    }
  }
  const flushQueuesSync = () => {
    if (hasPendingConversationCommits()) {
      flushConversationCommitQueue().catch(() => {
      });
    }
    if (hasPendingRepoCommits()) {
      flushRepoCommitQueue().catch(() => {
      });
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", (e) => {
      if (hasPendingConversationCommits() || hasPendingRepoCommits()) {
        flushQueuesSync();
        e.preventDefault();
        e.returnValue = "";
      }
    });
    window.addEventListener("pagehide", (e) => {
      if (!e.persisted) {
        flushQueuesSync();
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        if (hasPendingConversationCommits() || hasPendingRepoCommits()) {
          console.log("[SkyGit] Tab hidden, proactively flushing commit queue");
          flushQueuesSync();
        }
      }
    });
  }
  legacy_pre_effect(
    () => ($currentRoute(), $syncState(), get(token)),
    () => {
      if ($currentRoute() === "home" && $syncState().phase === "idle" && !$syncState().paused) {
        try {
          discoverAllRepos(get(token));
        } catch (e) {
          console.warn("[SkyGit] Repo discovery failed:", e);
        }
      }
    }
  );
  legacy_pre_effect_reset();
  init();
  var fragment = root();
  var node = first_child(fragment);
  CallOverlay(node, {});
  var node_1 = sibling(node, 2);
  {
    var consequent = ($$anchor2) => {
      var p = root_1();
      append($$anchor2, p);
    };
    var consequent_1 = ($$anchor2) => {
      LoginWithPAT($$anchor2, {
        onSubmit: loginWithToken,
        get error() {
          return get(loginError);
        }
      });
    };
    var consequent_2 = ($$anchor2) => {
      RepoConsent($$anchor2, { onApprove: approveRepo, onReject: rejectRepo });
    };
    var consequent_3 = ($$anchor2) => {
      Settings($$anchor2, {});
    };
    var consequent_4 = ($$anchor2) => {
      Chats($$anchor2, {});
    };
    var consequent_5 = ($$anchor2) => {
      Repos($$anchor2, {});
    };
    var alternate = ($$anchor2) => {
      Home($$anchor2);
    };
    if_block(node_1, ($$render) => {
      if ($currentRoute() === "loading") $$render(consequent);
      else if ($currentRoute() === "login") $$render(consequent_1, 1);
      else if ($currentRoute() === "consent") $$render(consequent_2, 2);
      else if ($currentRoute() === "settings") $$render(consequent_3, 3);
      else if ($currentRoute() === "chats") $$render(consequent_4, 4);
      else if ($currentRoute() === "repos") $$render(consequent_5, 5);
      else $$render(alternate, -1);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
if (isOAuthCallback()) {
  handleGoogleAuthCallback();
  document.getElementById("app").innerHTML = '<div style="padding: 2rem; text-align: center;">Completing Google authentication...</div>';
} else {
  mount(App, {
    target: document.getElementById("app")
  });
}
if ("serviceWorker" in navigator) {
  const swUrl = `${"/skygit/"}sw.js`;
  navigator.serviceWorker.register(swUrl, {
    scope: "/skygit/"
  });
}
if ("serviceWorker" in navigator) {
  const swUrl = `${"/skygit/"}sw.js`;
  navigator.serviceWorker.register(swUrl, {
    scope: "/skygit/"
  });
}
//# sourceMappingURL=index-CvbZNqSJ.js.map
