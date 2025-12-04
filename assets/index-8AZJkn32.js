var __typeError = (msg) => {
  throw TypeError(msg);
};
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var _a, __, __2, __22, __3;
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
const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const RENDER_EFFECT = 1 << 3;
const BLOCK_EFFECT = 1 << 4;
const BRANCH_EFFECT = 1 << 5;
const ROOT_EFFECT = 1 << 6;
const BOUNDARY_EFFECT = 1 << 7;
const UNOWNED = 1 << 8;
const DISCONNECTED = 1 << 9;
const CLEAN = 1 << 10;
const DIRTY = 1 << 11;
const MAYBE_DIRTY = 1 << 12;
const INERT = 1 << 13;
const DESTROYED = 1 << 14;
const EFFECT_RAN = 1 << 15;
const EFFECT_TRANSPARENT = 1 << 16;
const LEGACY_DERIVED_PROP = 1 << 17;
const HEAD_EFFECT = 1 << 19;
const EFFECT_HAS_DERIVED = 1 << 20;
const EFFECT_IS_UPDATING = 1 << 21;
const STATE_SYMBOL = Symbol("$state");
const LEGACY_PROPS = Symbol("legacy props");
const LOADING_ATTR_SYMBOL = Symbol("");
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function not_equal(a, b) {
  return a !== b;
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
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
function props_invalid_value(key) {
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
let legacy_mode_flag = false;
let tracing_mode_flag = false;
function enable_legacy_mode_flag() {
  legacy_mode_flag = true;
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
function lifecycle_outside_component(name) {
  {
    throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
  }
}
let component_context = null;
function set_component_context(context) {
  component_context = context;
}
function push(props, runes = false, fn) {
  var ctx = component_context = {
    p: component_context,
    c: null,
    d: false,
    e: null,
    m: false,
    s: props,
    x: null,
    l: null
  };
  if (legacy_mode_flag && !runes) {
    component_context.l = {
      s: null,
      u: null,
      r1: [],
      r2: source(false)
    };
  }
  teardown(() => {
    ctx.d = true;
  });
}
function pop(component) {
  const context_stack_item = component_context;
  if (context_stack_item !== null) {
    const component_effects = context_stack_item.e;
    if (component_effects !== null) {
      var previous_effect = active_effect;
      var previous_reaction = active_reaction;
      context_stack_item.e = null;
      try {
        for (var i = 0; i < component_effects.length; i++) {
          var component_effect = component_effects[i];
          set_active_effect(component_effect.effect);
          set_active_reaction(component_effect.reaction);
          effect(component_effect.fn);
        }
      } finally {
        set_active_effect(previous_effect);
        set_active_reaction(previous_reaction);
      }
    }
    component_context = context_stack_item.p;
    context_stack_item.m = true;
  }
  return (
    /** @type {T} */
    {}
  );
}
function is_runes() {
  return !legacy_mode_flag || component_context !== null && component_context.l === null;
}
function proxy(value, prev) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
    return value;
  }
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) {
    return value;
  }
  var sources = /* @__PURE__ */ new Map();
  var is_proxied_array = is_array(value);
  var version = state(0);
  var reaction = active_reaction;
  var with_parent = (fn) => {
    var previous_reaction = active_reaction;
    set_active_reaction(reaction);
    var result;
    {
      result = fn();
    }
    set_active_reaction(previous_reaction);
    return result;
  };
  if (is_proxied_array) {
    sources.set("length", state(
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
          s = with_parent(() => state(descriptor.value));
          sources.set(prop2, s);
        } else {
          set(
            s,
            with_parent(() => proxy(descriptor.value))
          );
        }
        return true;
      },
      deleteProperty(target, prop2) {
        var s = sources.get(prop2);
        if (s === void 0) {
          if (prop2 in target) {
            sources.set(
              prop2,
              with_parent(() => state(UNINITIALIZED))
            );
          }
        } else {
          if (is_proxied_array && typeof prop2 === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop2);
            if (Number.isInteger(n) && n < ls.v) {
              set(ls, n);
            }
          }
          set(s, UNINITIALIZED);
          update_version(version);
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
          s = with_parent(() => state(proxy(exists ? target[prop2] : UNINITIALIZED)));
          sources.set(prop2, s);
        }
        if (s !== void 0) {
          var v = get$1(s);
          return v === UNINITIALIZED ? void 0 : v;
        }
        return Reflect.get(target, prop2, receiver);
      },
      getOwnPropertyDescriptor(target, prop2) {
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor && "value" in descriptor) {
          var s = sources.get(prop2);
          if (s) descriptor.value = get$1(s);
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
            s = with_parent(() => state(has ? proxy(target[prop2]) : UNINITIALIZED));
            sources.set(prop2, s);
          }
          var value2 = get$1(s);
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
              other_s = with_parent(() => state(UNINITIALIZED));
              sources.set(i + "", other_s);
            }
          }
        }
        if (s === void 0) {
          if (!has || ((_a2 = get_descriptor(target, prop2)) == null ? void 0 : _a2.writable)) {
            s = with_parent(() => state(void 0));
            set(
              s,
              with_parent(() => proxy(value2))
            );
            sources.set(prop2, s);
          }
        } else {
          has = s.v !== UNINITIALIZED;
          set(
            s,
            with_parent(() => proxy(value2))
          );
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
          update_version(version);
        }
        return true;
      },
      ownKeys(target) {
        get$1(version);
        var own_keys = Reflect.ownKeys(target).filter((key2) => {
          var source3 = sources.get(key2);
          return source3 === void 0 || source3.v !== UNINITIALIZED;
        });
        for (var [key, source2] of sources) {
          if (source2.v !== UNINITIALIZED && !(key in target)) {
            own_keys.push(key);
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
function update_version(signal, d = 1) {
  set(signal, signal.v + d);
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
const old_values = /* @__PURE__ */ new Map();
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
function state(v, stack) {
  const s = source(v);
  push_reaction_value(s);
  return s;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable = false) {
  var _a2;
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  if (legacy_mode_flag && component_context !== null && component_context.l !== null) {
    ((_a2 = component_context.l).s ?? (_a2.s = [])).push(s);
  }
  return s;
}
function mutate(source2, value) {
  set(
    source2,
    untrack(() => get$1(source2))
  );
  return value;
}
function set(source2, value, should_proxy = false) {
  if (active_reaction !== null && !untracking && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT)) !== 0 && !(reaction_sources == null ? void 0 : reaction_sources.includes(source2))) {
    state_unsafe_mutation();
  }
  let new_value = should_proxy ? proxy(value) : value;
  return internal_set(source2, new_value);
}
function internal_set(source2, value) {
  if (!source2.equals(value)) {
    var old_value = source2.v;
    if (is_destroying_effect) {
      old_values.set(source2, value);
    } else {
      old_values.set(source2, old_value);
    }
    source2.v = value;
    source2.wv = increment_write_version();
    mark_reactions(source2, DIRTY);
    if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
      if (untracked_writes === null) {
        set_untracked_writes([source2]);
      } else {
        untracked_writes.push(source2);
      }
    }
  }
  return value;
}
function update(source2, d = 1) {
  var value = get$1(source2);
  var result = d === 1 ? value++ : value--;
  set(source2, value);
  return result;
}
function mark_reactions(signal, status) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var runes = is_runes();
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags = reaction.f;
    if ((flags & DIRTY) !== 0) continue;
    if (!runes && reaction === active_effect) continue;
    set_signal_status(reaction, status);
    if ((flags & (CLEAN | UNOWNED)) !== 0) {
      if ((flags & DERIVED) !== 0) {
        mark_reactions(
          /** @type {Derived} */
          reaction,
          MAYBE_DIRTY
        );
      } else {
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
}
let hydrating = false;
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
  return first_child_getter.call(node);
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return next_sibling_getter.call(node);
}
function child(node, is_text) {
  {
    return /* @__PURE__ */ get_first_child(node);
  }
}
function first_child(fragment, is_text) {
  {
    var first = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ get_first_child(
        /** @type {Node} */
        fragment
      )
    );
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
// @__NO_SIDE_EFFECTS__
function derived$1(fn) {
  var flags = DERIVED | DIRTY;
  var parent_derived = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
    /** @type {Derived} */
    active_reaction
  ) : null;
  if (active_effect === null || parent_derived !== null && (parent_derived.f & UNOWNED) !== 0) {
    flags |= UNOWNED;
  } else {
    active_effect.f |= EFFECT_HAS_DERIVED;
  }
  const signal = {
    ctx: component_context,
    deps: null,
    effects: null,
    equals,
    f: flags,
    fn,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: parent_derived ?? active_effect
  };
  return signal;
}
// @__NO_SIDE_EFFECTS__
function derived_safe_equal(fn) {
  const signal = /* @__PURE__ */ derived$1(fn);
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
function get_derived_parent_effect(derived2) {
  var parent = derived2.parent;
  while (parent !== null) {
    if ((parent.f & DERIVED) === 0) {
      return (
        /** @type {Effect} */
        parent
      );
    }
    parent = parent.parent;
  }
  return null;
}
function execute_derived(derived2) {
  var value;
  var prev_active_effect = active_effect;
  set_active_effect(get_derived_parent_effect(derived2));
  {
    try {
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
  var status = (skip_reaction || (derived2.f & UNOWNED) !== 0) && derived2.deps !== null ? MAYBE_DIRTY : CLEAN;
  set_signal_status(derived2, status);
  if (!derived2.equals(value)) {
    derived2.v = value;
    derived2.wv = increment_write_version();
  }
}
function validate_effect(rune) {
  if (active_effect === null && active_reaction === null) {
    effect_orphan();
  }
  if (active_reaction !== null && (active_reaction.f & UNOWNED) !== 0 && active_effect === null) {
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
function create_effect(type, fn, sync, push2 = true) {
  var parent = active_effect;
  var effect2 = {
    ctx: component_context,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: type | DIRTY,
    first: null,
    fn,
    last: null,
    next: null,
    parent,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0
  };
  if (sync) {
    try {
      update_effect(effect2);
      effect2.f |= EFFECT_RAN;
    } catch (e) {
      destroy_effect(effect2);
      throw e;
    }
  } else if (fn !== null) {
    schedule_effect(effect2);
  }
  var inert = sync && effect2.deps === null && effect2.first === null && effect2.nodes_start === null && effect2.teardown === null && (effect2.f & (EFFECT_HAS_DERIVED | BOUNDARY_EFFECT)) === 0;
  if (!inert && push2) {
    if (parent !== null) {
      push_effect(effect2, parent);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        active_reaction
      );
      (derived2.effects ?? (derived2.effects = [])).push(effect2);
    }
  }
  return effect2;
}
function teardown(fn) {
  const effect2 = create_effect(RENDER_EFFECT, null, false);
  set_signal_status(effect2, CLEAN);
  effect2.teardown = fn;
  return effect2;
}
function user_effect(fn) {
  validate_effect();
  var defer = active_effect !== null && (active_effect.f & BRANCH_EFFECT) !== 0 && component_context !== null && !component_context.m;
  if (defer) {
    var context = (
      /** @type {ComponentContext} */
      component_context
    );
    (context.e ?? (context.e = [])).push({
      fn,
      effect: active_effect,
      reaction: active_reaction
    });
  } else {
    var signal = effect(fn);
    return signal;
  }
}
function user_pre_effect(fn) {
  validate_effect();
  return render_effect(fn);
}
function component_root(fn) {
  const effect2 = create_effect(ROOT_EFFECT, fn, true);
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
  return create_effect(EFFECT, fn, false);
}
function legacy_pre_effect(deps, fn) {
  var context = (
    /** @type {ComponentContextLegacy} */
    component_context
  );
  var token = { effect: null, ran: false };
  context.l.r1.push(token);
  token.effect = render_effect(() => {
    deps();
    if (token.ran) return;
    token.ran = true;
    set(context.l.r2, true);
    untrack(fn);
  });
}
function legacy_pre_effect_reset() {
  var context = (
    /** @type {ComponentContextLegacy} */
    component_context
  );
  render_effect(() => {
    if (!get$1(context.l.r2)) return;
    for (var token of context.l.r1) {
      var effect2 = token.effect;
      if ((effect2.f & CLEAN) !== 0) {
        set_signal_status(effect2, MAYBE_DIRTY);
      }
      if (check_dirtiness(effect2)) {
        update_effect(effect2);
      }
      token.ran = false;
    }
    context.l.r2.v = false;
  });
}
function render_effect(fn) {
  return create_effect(RENDER_EFFECT, fn, true);
}
function template_effect(fn, thunks = [], d = derived$1) {
  const deriveds = thunks.map(d);
  const effect2 = () => fn(...deriveds.map(get$1));
  return block(effect2);
}
function block(fn, flags = 0) {
  return create_effect(RENDER_EFFECT | BLOCK_EFFECT | flags, fn, true);
}
function branch(fn, push2 = true) {
  return create_effect(RENDER_EFFECT | BRANCH_EFFECT, fn, true, push2);
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
  if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes_start !== null) {
    var node = effect2.nodes_start;
    var end = effect2.nodes_end;
    while (node !== null) {
      var next = node === end ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ get_next_sibling(node)
      );
      node.remove();
      node = next;
    }
    removed = true;
  }
  destroy_effect_children(effect2, remove_dom && !removed);
  remove_reactions(effect2, 0);
  set_signal_status(effect2, DESTROYED);
  var transitions = effect2.transitions;
  if (transitions !== null) {
    for (const transition2 of transitions) {
      transition2.stop();
    }
  }
  execute_effect_teardown(effect2);
  var parent = effect2.parent;
  if (parent !== null && parent.first !== null) {
    unlink_effect(effect2);
  }
  effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes_start = effect2.nodes_end = null;
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
function pause_effect(effect2, callback) {
  var transitions = [];
  pause_children(effect2, transitions, true);
  run_out_transitions(transitions, () => {
    destroy_effect(effect2);
    if (callback) callback();
  });
}
function run_out_transitions(transitions, fn) {
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
  if (effect2.transitions !== null) {
    for (const transition2 of effect2.transitions) {
      if (transition2.is_global || local) {
        transitions.push(transition2);
      }
    }
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    pause_children(child2, transitions, transparent ? local : false);
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
    effect2.f ^= CLEAN;
  }
  if (check_dirtiness(effect2)) {
    set_signal_status(effect2, DIRTY);
    schedule_effect(effect2);
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    resume_children(child2, transparent ? local : false);
    child2 = sibling2;
  }
  if (effect2.transitions !== null) {
    for (const transition2 of effect2.transitions) {
      if (transition2.is_global || local) {
        transition2.in();
      }
    }
  }
}
let micro_tasks = [];
function run_micro_tasks() {
  var tasks = micro_tasks;
  micro_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (micro_tasks.length === 0) {
    queueMicrotask(run_micro_tasks);
  }
  micro_tasks.push(fn);
}
let is_throwing_error = false;
let is_flushing = false;
let last_scheduled_effect = null;
let is_updating_effect = false;
let is_destroying_effect = false;
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
let queued_root_effects = [];
let dev_effect_stack = [];
let active_reaction = null;
let untracking = false;
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
let active_effect = null;
function set_active_effect(effect2) {
  active_effect = effect2;
}
let reaction_sources = null;
function set_reaction_sources(sources) {
  reaction_sources = sources;
}
function push_reaction_value(value) {
  if (active_reaction !== null && active_reaction.f & EFFECT_IS_UPDATING) {
    if (reaction_sources === null) {
      set_reaction_sources([value]);
    } else {
      reaction_sources.push(value);
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
let skip_reaction = false;
let captured_signals = null;
function increment_write_version() {
  return ++write_version;
}
function check_dirtiness(reaction) {
  var _a2;
  var flags = reaction.f;
  if ((flags & DIRTY) !== 0) {
    return true;
  }
  if ((flags & MAYBE_DIRTY) !== 0) {
    var dependencies = reaction.deps;
    var is_unowned = (flags & UNOWNED) !== 0;
    if (dependencies !== null) {
      var i;
      var dependency;
      var is_disconnected = (flags & DISCONNECTED) !== 0;
      var is_unowned_connected = is_unowned && active_effect !== null && !skip_reaction;
      var length = dependencies.length;
      if (is_disconnected || is_unowned_connected) {
        var derived2 = (
          /** @type {Derived} */
          reaction
        );
        var parent = derived2.parent;
        for (i = 0; i < length; i++) {
          dependency = dependencies[i];
          if (is_disconnected || !((_a2 = dependency == null ? void 0 : dependency.reactions) == null ? void 0 : _a2.includes(derived2))) {
            (dependency.reactions ?? (dependency.reactions = [])).push(derived2);
          }
        }
        if (is_disconnected) {
          derived2.f ^= DISCONNECTED;
        }
        if (is_unowned_connected && parent !== null && (parent.f & UNOWNED) === 0) {
          derived2.f ^= UNOWNED;
        }
      }
      for (i = 0; i < length; i++) {
        dependency = dependencies[i];
        if (check_dirtiness(
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
    }
    if (!is_unowned || active_effect !== null && !skip_reaction) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function propagate_error(error, effect2) {
  var current = effect2;
  while (current !== null) {
    if ((current.f & BOUNDARY_EFFECT) !== 0) {
      try {
        current.fn(error);
        return;
      } catch {
        current.f ^= BOUNDARY_EFFECT;
      }
    }
    current = current.parent;
  }
  is_throwing_error = false;
  throw error;
}
function should_rethrow_error(effect2) {
  return (effect2.f & DESTROYED) === 0 && (effect2.parent === null || (effect2.parent.f & BOUNDARY_EFFECT) === 0);
}
function handle_error(error, effect2, previous_effect, component_context2) {
  if (is_throwing_error) {
    if (previous_effect === null) {
      is_throwing_error = false;
    }
    if (should_rethrow_error(effect2)) {
      throw error;
    }
    return;
  }
  if (previous_effect !== null) {
    is_throwing_error = true;
  }
  {
    propagate_error(error, effect2);
    return;
  }
}
function schedule_possible_effect_self_invalidation(signal, effect2, root2 = true) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  for (var i = 0; i < reactions.length; i++) {
    var reaction = reactions[i];
    if (reaction_sources == null ? void 0 : reaction_sources.includes(signal)) continue;
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
  var previous_skip_reaction = skip_reaction;
  var previous_reaction_sources = reaction_sources;
  var previous_component_context = component_context;
  var previous_untracking = untracking;
  var flags = reaction.f;
  new_deps = /** @type {null | Value[]} */
  null;
  skipped_deps = 0;
  untracked_writes = null;
  skip_reaction = (flags & UNOWNED) !== 0 && (untracking || !is_updating_effect || active_reaction === null);
  active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  reaction_sources = null;
  set_component_context(reaction.ctx);
  untracking = false;
  read_version++;
  reaction.f |= EFFECT_IS_UPDATING;
  try {
    var result = (
      /** @type {Function} */
      (0, reaction.fn)()
    );
    var deps = reaction.deps;
    if (new_deps !== null) {
      var i;
      remove_reactions(reaction, skipped_deps);
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) {
          deps[skipped_deps + i] = new_deps[i];
        }
      } else {
        reaction.deps = deps = new_deps;
      }
      if (!skip_reaction) {
        for (i = skipped_deps; i < deps.length; i++) {
          ((_a2 = deps[i]).reactions ?? (_a2.reactions = [])).push(reaction);
        }
      }
    } else if (deps !== null && skipped_deps < deps.length) {
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
    if (previous_reaction !== null) {
      read_version++;
      if (untracked_writes !== null) {
        if (previous_untracked_writes === null) {
          previous_untracked_writes = untracked_writes;
        } else {
          previous_untracked_writes.push(.../** @type {Source[]} */
          untracked_writes);
        }
      }
    }
    return result;
  } finally {
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    skip_reaction = previous_skip_reaction;
    reaction_sources = previous_reaction_sources;
    set_component_context(previous_component_context);
    untracking = previous_untracking;
    reaction.f ^= EFFECT_IS_UPDATING;
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
  (new_deps === null || !new_deps.includes(dependency))) {
    set_signal_status(dependency, MAYBE_DIRTY);
    if ((dependency.f & (UNOWNED | DISCONNECTED)) === 0) {
      dependency.f ^= DISCONNECTED;
    }
    destroy_derived_effects(
      /** @type {Derived} **/
      dependency
    );
    remove_reactions(
      /** @type {Derived} **/
      dependency,
      0
    );
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
  var flags = effect2.f;
  if ((flags & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var previous_effect = active_effect;
  var previous_component_context = component_context;
  var was_updating_effect = is_updating_effect;
  active_effect = effect2;
  is_updating_effect = true;
  try {
    if ((flags & BLOCK_EFFECT) !== 0) {
      destroy_block_effect_children(effect2);
    } else {
      destroy_effect_children(effect2);
    }
    execute_effect_teardown(effect2);
    var teardown2 = update_reaction(effect2);
    effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
    effect2.wv = write_version;
    var deps = effect2.deps;
    var dep;
    if (DEV && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && deps !== null) ;
    if (DEV) ;
  } catch (error) {
    handle_error(error, effect2, previous_effect, previous_component_context || effect2.ctx);
  } finally {
    is_updating_effect = was_updating_effect;
    active_effect = previous_effect;
  }
}
function infinite_loop_guard() {
  try {
    effect_update_depth_exceeded();
  } catch (error) {
    if (last_scheduled_effect !== null) {
      {
        handle_error(error, last_scheduled_effect, null);
      }
    } else {
      throw error;
    }
  }
}
function flush_queued_root_effects() {
  var was_updating_effect = is_updating_effect;
  try {
    var flush_count = 0;
    is_updating_effect = true;
    while (queued_root_effects.length > 0) {
      if (flush_count++ > 1e3) {
        infinite_loop_guard();
      }
      var root_effects = queued_root_effects;
      var length = root_effects.length;
      queued_root_effects = [];
      for (var i = 0; i < length; i++) {
        var collected_effects = process_effects(root_effects[i]);
        flush_queued_effects(collected_effects);
      }
    }
  } finally {
    is_flushing = false;
    is_updating_effect = was_updating_effect;
    last_scheduled_effect = null;
    old_values.clear();
  }
}
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  for (var i = 0; i < length; i++) {
    var effect2 = effects[i];
    if ((effect2.f & (DESTROYED | INERT)) === 0) {
      try {
        if (check_dirtiness(effect2)) {
          update_effect(effect2);
          if (effect2.deps === null && effect2.first === null && effect2.nodes_start === null) {
            if (effect2.teardown === null) {
              unlink_effect(effect2);
            } else {
              effect2.fn = null;
            }
          }
        }
      } catch (error) {
        handle_error(error, effect2, null, effect2.ctx);
      }
    }
  }
}
function schedule_effect(signal) {
  if (!is_flushing) {
    is_flushing = true;
    queueMicrotask(flush_queued_root_effects);
  }
  var effect2 = last_scheduled_effect = signal;
  while (effect2.parent !== null) {
    effect2 = effect2.parent;
    var flags = effect2.f;
    if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((flags & CLEAN) === 0) return;
      effect2.f ^= CLEAN;
    }
  }
  queued_root_effects.push(effect2);
}
function process_effects(root2) {
  var effects = [];
  var effect2 = root2;
  while (effect2 !== null) {
    var flags = effect2.f;
    var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
    var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;
    if (!is_skippable_branch && (flags & INERT) === 0) {
      if ((flags & EFFECT) !== 0) {
        effects.push(effect2);
      } else if (is_branch) {
        effect2.f ^= CLEAN;
      } else {
        var previous_active_reaction = active_reaction;
        try {
          active_reaction = effect2;
          if (check_dirtiness(effect2)) {
            update_effect(effect2);
          }
        } catch (error) {
          handle_error(error, effect2, null, effect2.ctx);
        } finally {
          active_reaction = previous_active_reaction;
        }
      }
      var child2 = effect2.first;
      if (child2 !== null) {
        effect2 = child2;
        continue;
      }
    }
    var parent = effect2.parent;
    effect2 = effect2.next;
    while (effect2 === null && parent !== null) {
      effect2 = parent.next;
      parent = parent.parent;
    }
  }
  return effects;
}
function get$1(signal) {
  var flags = signal.f;
  var is_derived = (flags & DERIVED) !== 0;
  if (captured_signals !== null) {
    captured_signals.add(signal);
  }
  if (active_reaction !== null && !untracking) {
    if (!(reaction_sources == null ? void 0 : reaction_sources.includes(signal))) {
      var deps = active_reaction.deps;
      if (signal.rv < read_version) {
        signal.rv = read_version;
        if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
          skipped_deps++;
        } else if (new_deps === null) {
          new_deps = [signal];
        } else if (!skip_reaction || !new_deps.includes(signal)) {
          new_deps.push(signal);
        }
      }
    }
  } else if (is_derived && /** @type {Derived} */
  signal.deps === null && /** @type {Derived} */
  signal.effects === null) {
    var derived2 = (
      /** @type {Derived} */
      signal
    );
    var parent = derived2.parent;
    if (parent !== null && (parent.f & UNOWNED) === 0) {
      derived2.f ^= UNOWNED;
    }
  }
  if (is_derived) {
    derived2 = /** @type {Derived} */
    signal;
    if (check_dirtiness(derived2)) {
      update_derived(derived2);
    }
  }
  if (is_destroying_effect && old_values.has(signal)) {
    return old_values.get(signal);
  }
  return signal.v;
}
function capture_signals(fn) {
  var previous_captured_signals = captured_signals;
  captured_signals = /* @__PURE__ */ new Set();
  var captured = captured_signals;
  var signal;
  try {
    untrack(fn);
    if (previous_captured_signals !== null) {
      for (signal of captured_signals) {
        previous_captured_signals.add(signal);
      }
    }
  } finally {
    captured_signals = previous_captured_signals;
  }
  return captured;
}
function invalidate_inner_signals(fn) {
  var captured = capture_signals(() => untrack(fn));
  for (var signal of captured) {
    if ((signal.f & LEGACY_DERIVED_PROP) !== 0) {
      for (
        const dep of
        /** @type {Derived} */
        signal.deps || []
      ) {
        if ((dep.f & DERIVED) === 0) {
          internal_set(dep, dep.v);
        }
      }
    } else {
      internal_set(signal, signal.v);
    }
  }
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
const STATUS_MASK = -7169;
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function deep_read_state(value) {
  if (typeof value !== "object" || !value || value instanceof EventTarget) {
    return;
  }
  if (STATE_SYMBOL in value) {
    deep_read(value);
  } else if (!Array.isArray(value)) {
    for (let key in value) {
      const prop2 = value[key];
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
    for (let key in value) {
      try {
        deep_read(value[key], visited);
      } catch (e) {
      }
    }
    const proto = get_prototype_of(value);
    if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
      const descriptors = get_descriptors(proto);
      for (let key in descriptors) {
        const get2 = descriptors[key].get;
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
function is_delegated(event_name) {
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
      // In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
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
function event(event_name, dom, handler, capture, passive) {
  var options = { capture, passive };
  var target_handler = create_event(event_name, dom, handler, options);
  if (dom === document.body || dom === window || dom === document) {
    teardown(() => {
      dom.removeEventListener(event_name, target_handler, options);
    });
  }
}
function delegate(events) {
  for (var i = 0; i < events.length; i++) {
    all_registered_events.add(events[i]);
  }
  for (var fn of root_event_handles) {
    fn(events);
  }
}
function handle_event_propagation(event2) {
  var _a2;
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
  var path_idx = 0;
  var handled_at = event2.__root;
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2.__root = handler_element;
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
        var delegated = current_target["__" + event_name];
        if (delegated != null && (!/** @type {any} */
        current_target.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
        // -> the target could not have been disabled because it emits the event in the first place
        event2.target === current_target)) {
          if (is_array(delegated)) {
            var [fn, ...data] = delegated;
            fn.apply(current_target, [event2, ...data]);
          } else {
            delegated.call(current_target, event2);
          }
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
    event2.__root = handler_element;
    delete event2.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function create_fragment_from_html(html) {
  var elem = document.createElement("template");
  elem.innerHTML = html;
  return elem.content;
}
function assign_nodes(start, end) {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  if (effect2.nodes_start === null) {
    effect2.nodes_start = start;
    effect2.nodes_end = end;
  }
}
// @__NO_SIDE_EFFECTS__
function template(content, flags) {
  var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      if (!is_fragment) node = /** @type {Node} */
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
function ns_template(content, flags, ns = "svg") {
  var has_start = !content.startsWith("<!>");
  var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
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
            /** @type {Node} */
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
  var str = value == null ? "" : typeof value === "object" ? value + "" : value;
  if (str !== (text2.__t ?? (text2.__t = text2.nodeValue))) {
    text2.__t = str;
    text2.nodeValue = str + "";
  }
}
function mount(component, options) {
  return _mount(component, options);
}
const document_listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context, intro = true }) {
  init_operations();
  var registered_events = /* @__PURE__ */ new Set();
  var event_handle = (events2) => {
    for (var i = 0; i < events2.length; i++) {
      var event_name = events2[i];
      if (registered_events.has(event_name)) continue;
      registered_events.add(event_name);
      var passive = is_passive_event(event_name);
      target.addEventListener(event_name, handle_event_propagation, { passive });
      var n = document_listeners.get(event_name);
      if (n === void 0) {
        document.addEventListener(event_name, handle_event_propagation, { passive });
        document_listeners.set(event_name, 1);
      } else {
        document_listeners.set(event_name, n + 1);
      }
    }
  };
  event_handle(array_from(all_registered_events));
  root_event_handles.add(event_handle);
  var component = void 0;
  var unmount = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    branch(() => {
      if (context) {
        push({});
        var ctx = (
          /** @type {ComponentContext} */
          component_context
        );
        ctx.c = context;
      }
      if (events) {
        props.$$events = events;
      }
      should_intro = intro;
      component = Component(anchor_node, props) || {};
      should_intro = true;
      if (context) {
        pop();
      }
    });
    return () => {
      var _a2;
      for (var event_name of registered_events) {
        target.removeEventListener(event_name, handle_event_propagation);
        var n = (
          /** @type {number} */
          document_listeners.get(event_name)
        );
        if (--n === 0) {
          document.removeEventListener(event_name, handle_event_propagation);
          document_listeners.delete(event_name);
        } else {
          document_listeners.set(event_name, n);
        }
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) {
        (_a2 = anchor_node.parentNode) == null ? void 0 : _a2.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component, unmount);
  return component;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
function if_block(node, fn, [root_index, hydrate_index] = [0, 0]) {
  var anchor = node;
  var consequent_effect = null;
  var alternate_effect = null;
  var condition = UNINITIALIZED;
  var flags = root_index > 0 ? EFFECT_TRANSPARENT : 0;
  var has_branch = false;
  const set_branch = (fn2, flag = true) => {
    has_branch = true;
    update_branch(flag, fn2);
  };
  const update_branch = (new_condition, fn2) => {
    if (condition === (condition = new_condition)) return;
    if (condition) {
      if (consequent_effect) {
        resume_effect(consequent_effect);
      } else if (fn2) {
        consequent_effect = branch(() => fn2(anchor));
      }
      if (alternate_effect) {
        pause_effect(alternate_effect, () => {
          alternate_effect = null;
        });
      }
    } else {
      if (alternate_effect) {
        resume_effect(alternate_effect);
      } else if (fn2) {
        alternate_effect = branch(() => fn2(anchor, [root_index + 1, hydrate_index]));
      }
      if (consequent_effect) {
        pause_effect(consequent_effect, () => {
          consequent_effect = null;
        });
      }
    }
  };
  block(() => {
    has_branch = false;
    fn(set_branch);
    if (!has_branch) {
      update_branch(null, null);
    }
  }, flags);
}
function key_block(node, get_key, render_fn) {
  var anchor = node;
  var key = UNINITIALIZED;
  var effect2;
  var changed = is_runes() ? not_equal : safe_not_equal;
  block(() => {
    if (changed(key, key = get_key())) {
      if (effect2) {
        pause_effect(effect2);
      }
      effect2 = branch(() => render_fn(anchor));
    }
  });
}
function index(_, i) {
  return i;
}
function pause_effects(state2, items, controlled_anchor, items_map) {
  var transitions = [];
  var length = items.length;
  for (var i = 0; i < length; i++) {
    pause_children(items[i].e, transitions, true);
  }
  var is_controlled = length > 0 && transitions.length === 0 && controlled_anchor !== null;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      /** @type {Element} */
      controlled_anchor.parentNode
    );
    clear_text_content(parent_node);
    parent_node.append(
      /** @type {Element} */
      controlled_anchor
    );
    items_map.clear();
    link(state2, items[0].prev, items[length - 1].next);
  }
  run_out_transitions(transitions, () => {
    for (var i2 = 0; i2 < length; i2++) {
      var item = items[i2];
      if (!is_controlled) {
        items_map.delete(item.k);
        link(state2, item.prev, item.next);
      }
      destroy_effect(item.e, !is_controlled);
    }
  });
}
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var state2 = { flags, items: /* @__PURE__ */ new Map(), first: null };
  var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      node
    );
    anchor = parent_node.appendChild(create_text());
  }
  var fallback = null;
  var was_empty = false;
  var each_array = /* @__PURE__ */ derived_safe_equal(() => {
    var collection = get_collection();
    return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
  });
  block(() => {
    var array = get$1(each_array);
    var length = array.length;
    if (was_empty && length === 0) {
      return;
    }
    was_empty = length === 0;
    {
      reconcile(array, state2, anchor, render_fn, flags, get_key, get_collection);
    }
    if (fallback_fn !== null) {
      if (length === 0) {
        if (fallback) {
          resume_effect(fallback);
        } else {
          fallback = branch(() => fallback_fn(anchor));
        }
      } else if (fallback !== null) {
        pause_effect(fallback, () => {
          fallback = null;
        });
      }
    }
    get$1(each_array);
  });
}
function reconcile(array, state2, anchor, render_fn, flags, get_key, get_collection) {
  var _a2, _b, _c, _d;
  var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
  var should_update = (flags & (EACH_ITEM_REACTIVE | EACH_INDEX_REACTIVE)) !== 0;
  var length = array.length;
  var items = state2.items;
  var first = state2.first;
  var current = first;
  var seen2;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key;
  var item;
  var i;
  if (is_animated) {
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key = get_key(value, i);
      item = items.get(key);
      if (item !== void 0) {
        (_a2 = item.a) == null ? void 0 : _a2.measure();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).add(item);
      }
    }
  }
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key = get_key(value, i);
    item = items.get(key);
    if (item === void 0) {
      var child_anchor = current ? (
        /** @type {TemplateNode} */
        current.e.nodes_start
      ) : anchor;
      prev = create_item(
        child_anchor,
        state2,
        prev,
        prev === null ? state2.first : prev.next,
        value,
        key,
        i,
        render_fn,
        flags,
        get_collection
      );
      items.set(key, prev);
      matched = [];
      stashed = [];
      current = prev.next;
      continue;
    }
    if (should_update) {
      update_item(item, value, i, flags);
    }
    if ((item.e.f & INERT) !== 0) {
      resume_effect(item.e);
      if (is_animated) {
        (_b = item.a) == null ? void 0 : _b.unfix();
        (to_animate ?? (to_animate = /* @__PURE__ */ new Set())).delete(item);
      }
    }
    if (item !== current) {
      if (seen2 !== void 0 && seen2.has(item)) {
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
            seen2.delete(stashed[j]);
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
          seen2.delete(item);
          move(item, current, anchor);
          link(state2, item.prev, item.next);
          link(state2, item, prev === null ? state2.first : prev.next);
          link(state2, prev, item);
          prev = item;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current.k !== key) {
        if ((current.e.f & INERT) === 0) {
          (seen2 ?? (seen2 = /* @__PURE__ */ new Set())).add(current);
        }
        stashed.push(current);
        current = current.next;
      }
      if (current === null) {
        continue;
      }
      item = current;
    }
    matched.push(item);
    prev = item;
    current = item.next;
  }
  if (current !== null || seen2 !== void 0) {
    var to_destroy = seen2 === void 0 ? [] : array_from(seen2);
    while (current !== null) {
      if ((current.e.f & INERT) === 0) {
        to_destroy.push(current);
      }
      current = current.next;
    }
    var destroy_length = to_destroy.length;
    if (destroy_length > 0) {
      var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
      if (is_animated) {
        for (i = 0; i < destroy_length; i += 1) {
          (_c = to_destroy[i].a) == null ? void 0 : _c.measure();
        }
        for (i = 0; i < destroy_length; i += 1) {
          (_d = to_destroy[i].a) == null ? void 0 : _d.fix();
        }
      }
      pause_effects(state2, to_destroy, controlled_anchor, items);
    }
  }
  if (is_animated) {
    queue_micro_task(() => {
      var _a3;
      if (to_animate === void 0) return;
      for (item of to_animate) {
        (_a3 = item.a) == null ? void 0 : _a3.apply();
      }
    });
  }
  active_effect.first = state2.first && state2.first.e;
  active_effect.last = prev && prev.e;
}
function update_item(item, value, index2, type) {
  if ((type & EACH_ITEM_REACTIVE) !== 0) {
    internal_set(item.v, value);
  }
  if ((type & EACH_INDEX_REACTIVE) !== 0) {
    internal_set(
      /** @type {Value<number>} */
      item.i,
      index2
    );
  } else {
    item.i = index2;
  }
}
function create_item(anchor, state2, prev, next, value, key, index2, render_fn, flags, get_collection) {
  var reactive = (flags & EACH_ITEM_REACTIVE) !== 0;
  var mutable = (flags & EACH_ITEM_IMMUTABLE) === 0;
  var v = reactive ? mutable ? /* @__PURE__ */ mutable_source(value) : source(value) : value;
  var i = (flags & EACH_INDEX_REACTIVE) === 0 ? index2 : source(index2);
  var item = {
    i,
    v,
    k: key,
    a: null,
    // @ts-expect-error
    e: null,
    prev,
    next
  };
  try {
    item.e = branch(() => render_fn(anchor, v, i, get_collection), hydrating);
    item.e.prev = prev && prev.e;
    item.e.next = next && next.e;
    if (prev === null) {
      state2.first = item;
    } else {
      prev.next = item;
      prev.e.next = item.e;
    }
    if (next !== null) {
      next.prev = item;
      next.e.prev = item.e;
    }
    return item;
  } finally {
  }
}
function move(item, next, anchor) {
  var end = item.next ? (
    /** @type {TemplateNode} */
    item.next.e.nodes_start
  ) : anchor;
  var dest = next ? (
    /** @type {TemplateNode} */
    next.e.nodes_start
  ) : anchor;
  var node = (
    /** @type {TemplateNode} */
    item.e.nodes_start
  );
  while (node !== end) {
    var next_node = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ get_next_sibling(node)
    );
    dest.before(node);
    node = next_node;
  }
}
function link(state2, prev, next) {
  if (prev === null) {
    state2.first = next;
  } else {
    prev.next = next;
    prev.e.next = next && next.e;
  }
  if (next !== null) {
    next.prev = prev;
    next.e.prev = prev && prev.e;
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
function element(node, get_tag, is_svg, render_fn, get_namespace, location2) {
  var tag;
  var current_tag;
  var element2 = null;
  var anchor = (
    /** @type {TemplateNode} */
    node
  );
  var effect2;
  block(() => {
    const next_tag = get_tag() || null;
    var ns = NAMESPACE_SVG;
    if (next_tag === tag) return;
    if (effect2) {
      if (next_tag === null) {
        pause_effect(effect2, () => {
          effect2 = null;
          current_tag = null;
        });
      } else if (next_tag === current_tag) {
        resume_effect(effect2);
      } else {
        destroy_effect(effect2);
        set_should_intro(false);
      }
    }
    if (next_tag && next_tag !== current_tag) {
      effect2 = branch(() => {
        element2 = document.createElementNS(ns, next_tag);
        assign_nodes(element2, element2);
        if (render_fn) {
          var child_anchor = (
            /** @type {TemplateNode} */
            element2.appendChild(create_text())
          );
          render_fn(element2, child_anchor);
        }
        active_effect.nodes_end = element2;
        anchor.before(element2);
      });
    }
    tag = next_tag;
    if (tag) current_tag = tag;
    set_should_intro(true);
  }, EFFECT_TRANSPARENT);
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
    for (var key in directives) {
      if (directives[key]) {
        classname = classname ? classname + " " + key : key;
      } else if (classname.length) {
        var len = key.length;
        var a = 0;
        while ((a = classname.indexOf(key, a)) >= 0) {
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
  for (var key in styles) {
    var value = styles[key];
    if (value != null && value !== "") {
      css += " " + key + ": " + value + separator;
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
  if (prev !== value) {
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
    for (var key in next_classes) {
      var is_present = !!next_classes[key];
      if (prev_classes == null || is_present !== !!prev_classes[key]) {
        dom.classList.toggle(key, is_present);
      }
    }
  }
  return next_classes;
}
function update_styles(dom, prev = {}, next, priority) {
  for (var key in next) {
    var value = next[key];
    if (prev[key] !== value) {
      if (next[key] == null) {
        dom.style.removeProperty(key);
      } else {
        dom.style.setProperty(key, value, priority);
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
const CLASS = Symbol("class");
const STYLE = Symbol("style");
const IS_CUSTOM_ELEMENT = Symbol("is custom element");
const IS_HTML = Symbol("is html");
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
function set_attributes(element2, prev, next, css_hash, skip_warning = false) {
  var attributes = get_attributes(element2);
  var is_custom_element = attributes[IS_CUSTOM_ELEMENT];
  var preserve_attribute_case = !attributes[IS_HTML];
  var current = prev || {};
  var is_option_element = element2.tagName === "OPTION";
  for (var key in prev) {
    if (!(key in next)) {
      next[key] = null;
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
  for (const key2 in next) {
    let value = next[key2];
    if (is_option_element && key2 === "value" && value == null) {
      element2.value = element2.__value = "";
      current[key2] = value;
      continue;
    }
    if (key2 === "class") {
      var is_html = element2.namespaceURI === "http://www.w3.org/1999/xhtml";
      set_class(element2, is_html, value, css_hash, prev == null ? void 0 : prev[CLASS], next[CLASS]);
      current[key2] = value;
      current[CLASS] = next[CLASS];
      continue;
    }
    if (key2 === "style") {
      set_style(element2, value, prev == null ? void 0 : prev[STYLE], next[STYLE]);
      current[key2] = value;
      current[STYLE] = next[STYLE];
      continue;
    }
    var prev_value = current[key2];
    if (value === prev_value) continue;
    current[key2] = value;
    var prefix = key2[0] + key2[1];
    if (prefix === "$$") continue;
    if (prefix === "on") {
      const opts = {};
      const event_handle_key = "$$" + key2;
      let event_name = key2.slice(2);
      var delegated = is_delegated(event_name);
      if (is_capture_event(event_name)) {
        event_name = event_name.slice(0, -7);
        opts.capture = true;
      }
      if (!delegated && prev_value) {
        if (value != null) continue;
        element2.removeEventListener(event_name, current[event_handle_key], opts);
        current[event_handle_key] = null;
      }
      if (value != null) {
        if (!delegated) {
          let handle2 = function(evt) {
            current[key2].call(this, evt);
          };
          var handle = handle2;
          current[event_handle_key] = create_event(event_name, element2, handle2, opts);
        } else {
          element2[`__${event_name}`] = value;
          delegate([event_name]);
        }
      } else if (delegated) {
        element2[`__${event_name}`] = void 0;
      }
    } else if (key2 === "style") {
      set_attribute(element2, key2, value);
    } else if (key2 === "autofocus") {
      autofocus(
        /** @type {HTMLElement} */
        element2,
        Boolean(value)
      );
    } else if (!is_custom_element && (key2 === "__value" || key2 === "value" && value != null)) {
      element2.value = element2.__value = value;
    } else if (key2 === "selected" && is_option_element) {
      set_selected(
        /** @type {HTMLOptionElement} */
        element2,
        value
      );
    } else {
      var name = key2;
      if (!preserve_attribute_case) {
        name = normalize_attribute(name);
      }
      var is_default = name === "defaultValue" || name === "defaultChecked";
      if (value == null && !is_custom_element && !is_default) {
        attributes[key2] = null;
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
          element2.removeAttribute(key2);
        }
      } else if (is_default || setters.includes(name) && (is_custom_element || typeof value !== "string")) {
        element2[name] = value;
      } else if (typeof value !== "function") {
        set_attribute(element2, name, value);
      }
    }
  }
  return current;
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
  var setters = setters_cache.get(element2.nodeName);
  if (setters) return setters;
  setters_cache.set(element2.nodeName, setters = []);
  var descriptors;
  var proto = element2;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key in descriptors) {
      if (descriptors[key].set) {
        setters.push(key);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
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
function transition(flags, element2, get_fn, get_params) {
  var is_intro = (flags & TRANSITION_IN) !== 0;
  var is_outro = (flags & TRANSITION_OUT) !== 0;
  var is_both = is_intro && is_outro;
  var is_global = (flags & TRANSITION_GLOBAL) !== 0;
  var direction = is_both ? "both" : is_intro ? "in" : "out";
  var current_options;
  var inert = element2.inert;
  var overflow = element2.style.overflow;
  var intro;
  var outro;
  function get_options() {
    var previous_reaction = active_reaction;
    var previous_effect = active_effect;
    set_active_reaction(null);
    set_active_effect(null);
    try {
      return current_options ?? (current_options = get_fn()(element2, (get_params == null ? void 0 : get_params()) ?? /** @type {P} */
      {}, {
        direction
      }));
    } finally {
      set_active_reaction(previous_reaction);
      set_active_effect(previous_effect);
    }
  }
  var transition2 = {
    is_global,
    in() {
      var _a2;
      element2.inert = inert;
      if (!is_intro) {
        outro == null ? void 0 : outro.abort();
        (_a2 = outro == null ? void 0 : outro.reset) == null ? void 0 : _a2.call(outro);
        return;
      }
      if (!is_outro) {
        intro == null ? void 0 : intro.abort();
      }
      dispatch_event(element2, "introstart");
      intro = animate(element2, get_options(), outro, 1, () => {
        dispatch_event(element2, "introend");
        intro == null ? void 0 : intro.abort();
        intro = current_options = void 0;
        element2.style.overflow = overflow;
      });
    },
    out(fn) {
      if (!is_outro) {
        fn == null ? void 0 : fn();
        current_options = void 0;
        return;
      }
      element2.inert = true;
      dispatch_event(element2, "outrostart");
      outro = animate(element2, get_options(), intro, 0, () => {
        dispatch_event(element2, "outroend");
        fn == null ? void 0 : fn();
      });
    },
    stop: () => {
      intro == null ? void 0 : intro.abort();
      outro == null ? void 0 : outro.abort();
    }
  };
  var e = (
    /** @type {Effect} */
    active_effect
  );
  (e.transitions ?? (e.transitions = [])).push(transition2);
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
      run2 = !block2 || (block2.f & EFFECT_RAN) !== 0;
    }
    if (run2) {
      effect(() => {
        untrack(() => transition2.in());
      });
    }
  }
}
function animate(element2, options, counterpart, t2, on_finish) {
  var is_intro = t2 === 1;
  if (is_function(options)) {
    var a;
    var aborted = false;
    queue_micro_task(() => {
      if (aborted) return;
      var o = options({ direction: is_intro ? "in" : "out" });
      a = animate(element2, o, counterpart, t2, on_finish);
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
  if (!(options == null ? void 0 : options.duration)) {
    on_finish();
    return {
      abort: noop,
      deactivate: noop,
      reset: noop,
      t: () => t2
    };
  }
  const { delay = 0, css, tick, easing = linear$1 } = options;
  var keyframes = [];
  if (is_intro && counterpart === void 0) {
    if (tick) {
      tick(0, 1);
    }
    if (css) {
      var styles = css_to_keyframe(css(0, 1));
      keyframes.push(styles, styles);
    }
  }
  var get_t = () => 1 - t2;
  var animation = element2.animate(keyframes, { duration: delay });
  animation.onfinish = () => {
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
      if (tick) {
        loop(() => {
          if (animation.playState !== "running") return false;
          var t3 = get_t();
          tick(t3, 1 - t3);
          return true;
        });
      }
    }
    animation = element2.animate(keyframes2, { duration, fill: "forwards" });
    animation.onfinish = () => {
      get_t = () => t2;
      tick == null ? void 0 : tick(t2, 1 - t2);
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
        tick == null ? void 0 : tick(1, 0);
      }
    },
    t: () => get_t()
  };
}
function bind_value(input, get2, set2 = get2) {
  var runes = is_runes();
  listen_to_event_and_reset_event(input, "input", (is_reset) => {
    var value = is_reset ? input.defaultValue : input.value;
    value = is_numberlike_input(input) ? to_number(value) : value;
    set2(value);
    if (runes && value !== (value = get2())) {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      input.value = value ?? "";
      if (end !== null) {
        input.selectionStart = start;
        input.selectionEnd = Math.min(end, input.value.length);
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
  }
  render_effect(() => {
    var value = get2();
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
function select_option(select, value, mounting) {
  if (select.multiple) {
    return select_options(select, value);
  }
  for (var option of select.options) {
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
function init_select(select, get_value) {
  effect(() => {
    var observer = new MutationObserver(() => {
      var value = select.__value;
      select_option(select, value);
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
    return () => {
      observer.disconnect();
    };
  });
}
function bind_select_value(select, get2, set2 = get2) {
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
  });
  effect(() => {
    var value = get2();
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
function select_options(select, value) {
  for (var option of select.options) {
    option.selected = ~value.indexOf(get_option_value(option));
  }
}
function get_option_value(option) {
  if ("__value" in option) {
    return option.__value;
  } else {
    return option.value;
  }
}
function is_bound_this(bound_value, element_or_component) {
  return bound_value === element_or_component || (bound_value == null ? void 0 : bound_value[STATE_SYMBOL]) === element_or_component;
}
function bind_this(element_or_component = {}, update2, get_value, get_parts) {
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
      queue_micro_task(() => {
        if (parts && is_bound_this(get_value(...parts), element_or_component)) {
          update2(null, ...parts);
        }
      });
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
    const d = /* @__PURE__ */ derived$1(() => {
      let changed = false;
      const props2 = context.s;
      for (const key in props2) {
        if (props2[key] !== prev[key]) {
          prev[key] = props2[key];
          changed = true;
        }
      }
      if (changed) version++;
      return version;
    });
    props = () => get$1(d);
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
    for (const signal of context.l.s) get$1(signal);
  }
  props();
}
function bubble_event($$props, event2) {
  var _a2;
  var events = (
    /** @type {Record<string, Function[] | Function>} */
    (_a2 = $$props.$$events) == null ? void 0 : _a2[event2.type]
  );
  var callbacks = is_array(events) ? events.slice() : events == null ? [] : [events];
  for (var fn of callbacks) {
    fn.call(this, event2);
  }
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
function derived(stores, fn, initial_value) {
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
function get(store) {
  let value;
  subscribe_to_store(store, (_) => value = _)();
  return value;
}
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
    return get(store);
  }
  return get$1(entry.source);
}
function store_set(store, value) {
  store.set(value);
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
function capture_store_binding(fn) {
  var previous_is_store_binding = is_store_binding;
  try {
    is_store_binding = false;
    return [fn(), is_store_binding];
  } finally {
    is_store_binding = previous_is_store_binding;
  }
}
const legacy_rest_props_handler = {
  get(target, key) {
    if (target.exclude.includes(key)) return;
    get$1(target.version);
    return key in target.special ? target.special[key]() : target.props[key];
  },
  set(target, key, value) {
    if (!(key in target.special)) {
      target.special[key] = prop(
        {
          get [key]() {
            return target.props[key];
          }
        },
        /** @type {string} */
        key,
        PROPS_IS_UPDATED
      );
    }
    target.special[key](value);
    update(target.version);
    return true;
  },
  getOwnPropertyDescriptor(target, key) {
    if (target.exclude.includes(key)) return;
    if (key in target.props) {
      return {
        enumerable: true,
        configurable: true,
        value: target.props[key]
      };
    }
  },
  deleteProperty(target, key) {
    if (target.exclude.includes(key)) return true;
    target.exclude.push(key);
    update(target.version);
    return true;
  },
  has(target, key) {
    if (target.exclude.includes(key)) return false;
    return key in target.props;
  },
  ownKeys(target) {
    return Reflect.ownKeys(target.props).filter((key) => !target.exclude.includes(key));
  }
};
function legacy_rest_props(props, exclude) {
  return new Proxy({ props, exclude, special: {}, version: source(0) }, legacy_rest_props_handler);
}
const spread_props_handler = {
  get(target, key) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (typeof p === "object" && p !== null && key in p) return p[key];
    }
  },
  set(target, key, value) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      const desc = get_descriptor(p, key);
      if (desc && desc.set) {
        desc.set(value);
        return true;
      }
    }
    return false;
  },
  getOwnPropertyDescriptor(target, key) {
    let i = target.props.length;
    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (typeof p === "object" && p !== null && key in p) {
        const descriptor = get_descriptor(p, key);
        if (descriptor && !descriptor.configurable) {
          descriptor.configurable = true;
        }
        return descriptor;
      }
    }
  },
  has(target, key) {
    if (key === STATE_SYMBOL || key === LEGACY_PROPS) return false;
    for (let p of target.props) {
      if (is_function(p)) p = p();
      if (p != null && key in p) return true;
    }
    return false;
  },
  ownKeys(target) {
    const keys = [];
    for (let p of target.props) {
      if (is_function(p)) p = p();
      for (const key in p) {
        if (!keys.includes(key)) keys.push(key);
      }
    }
    return keys;
  }
};
function spread_props(...props) {
  return new Proxy({ props }, spread_props_handler);
}
function has_destroyed_component_ctx(current_value) {
  var _a2;
  return ((_a2 = current_value.ctx) == null ? void 0 : _a2.d) ?? false;
}
function prop(props, key, flags, fallback) {
  var _a2;
  var immutable = (flags & PROPS_IS_IMMUTABLE) !== 0;
  var runes = !legacy_mode_flag || (flags & PROPS_IS_RUNES) !== 0;
  var bindable = (flags & PROPS_IS_BINDABLE) !== 0;
  var lazy = (flags & PROPS_IS_LAZY_INITIAL) !== 0;
  var is_store_sub = false;
  var prop_value;
  if (bindable) {
    [prop_value, is_store_sub] = capture_store_binding(() => (
      /** @type {V} */
      props[key]
    ));
  } else {
    prop_value = /** @type {V} */
    props[key];
  }
  var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
  var setter = bindable && (((_a2 = get_descriptor(props, key)) == null ? void 0 : _a2.set) ?? (is_entry_props && key in props && ((v) => props[key] = v))) || void 0;
  var fallback_value = (
    /** @type {V} */
    fallback
  );
  var fallback_dirty = true;
  var fallback_used = false;
  var get_fallback = () => {
    fallback_used = true;
    if (fallback_dirty) {
      fallback_dirty = false;
      if (lazy) {
        fallback_value = untrack(
          /** @type {() => V} */
          fallback
        );
      } else {
        fallback_value = /** @type {V} */
        fallback;
      }
    }
    return fallback_value;
  };
  if (prop_value === void 0 && fallback !== void 0) {
    if (setter && runes) {
      props_invalid_value();
    }
    prop_value = get_fallback();
    if (setter) setter(prop_value);
  }
  var getter;
  if (runes) {
    getter = () => {
      var value = (
        /** @type {V} */
        props[key]
      );
      if (value === void 0) return get_fallback();
      fallback_dirty = true;
      fallback_used = false;
      return value;
    };
  } else {
    var derived_getter = (immutable ? derived$1 : derived_safe_equal)(
      () => (
        /** @type {V} */
        props[key]
      )
    );
    derived_getter.f |= LEGACY_DERIVED_PROP;
    getter = () => {
      var value = get$1(derived_getter);
      if (value !== void 0) fallback_value = /** @type {V} */
      void 0;
      return value === void 0 ? fallback_value : value;
    };
  }
  if ((flags & PROPS_IS_UPDATED) === 0) {
    return getter;
  }
  if (setter) {
    var legacy_parent = props.$$legacy;
    return function(value, mutation) {
      if (arguments.length > 0) {
        if (!runes || !mutation || legacy_parent || is_store_sub) {
          setter(mutation ? getter() : value);
        }
        return value;
      } else {
        return getter();
      }
    };
  }
  var from_child = false;
  var was_from_child = false;
  var inner_current_value = /* @__PURE__ */ mutable_source(prop_value);
  var current_value = /* @__PURE__ */ derived$1(() => {
    var parent_value = getter();
    var child_value = get$1(inner_current_value);
    if (from_child) {
      from_child = false;
      was_from_child = true;
      return child_value;
    }
    was_from_child = false;
    return inner_current_value.v = parent_value;
  });
  if (bindable) {
    get$1(current_value);
  }
  if (!immutable) current_value.equals = safe_equals;
  return function(value, mutation) {
    if (captured_signals !== null) {
      from_child = was_from_child;
      getter();
      get$1(inner_current_value);
    }
    if (arguments.length > 0) {
      const new_value = mutation ? get$1(current_value) : runes && bindable ? proxy(value) : value;
      if (!current_value.equals(new_value)) {
        from_child = true;
        set(inner_current_value, new_value);
        if (fallback_used && fallback_value !== void 0) {
          fallback_value = new_value;
        }
        if (has_destroyed_component_ctx(current_value)) {
          return value;
        }
        untrack(() => get$1(current_value));
      }
      return value;
    }
    if (has_destroyed_component_ctx(current_value)) {
      return current_value.v;
    }
    return get$1(current_value);
  };
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
        /** @type {any} */
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
  ((_a = window.__svelte ?? (window.__svelte = {})).v ?? (_a.v = /* @__PURE__ */ new Set())).add(PUBLIC_VERSION);
}
enable_legacy_mode_flag();
function getOrCreateSessionId(repoFullName2) {
  const storageKey = `skygit_session_${repoFullName2}`;
  let sessionId2 = sessionStorage.getItem(storageKey);
  if (!sessionId2) {
    sessionId2 = crypto.randomUUID();
    sessionStorage.setItem(storageKey, sessionId2);
    console.log("[SessionManager] Created new session ID for repo:", repoFullName2, "ID:", sessionId2);
  } else {
    console.log("[SessionManager] Using existing session ID for repo:", repoFullName2, "ID:", sessionId2);
  }
  return sessionId2;
}
function clearAllSessionIds() {
  const keys = Object.keys(sessionStorage);
  keys.forEach((key) => {
    if (key.startsWith("skygit_session_")) {
      sessionStorage.removeItem(key);
    }
  });
  console.log("[SessionManager] Cleared all session IDs");
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
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/skygit/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    let allSettled2 = function(promises) {
      return Promise.all(
        promises.map(
          (p) => Promise.resolve(p).then(
            (value) => ({ status: "fulfilled", value }),
            (reason) => ({ status: "rejected", reason })
          )
        )
      );
    };
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = allSettled2(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link2 = document.createElement("link");
        link2.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link2.as = "script";
        }
        link2.crossOrigin = "";
        link2.href = dep;
        if (cspNonce) {
          link2.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link2);
        if (isCss) {
          return new Promise((res, rej) => {
            link2.addEventListener("load", res);
            link2.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
async function deriveKeyFromToken(token) {
  const enc = new TextEncoder();
  const keyData = enc.encode(token);
  const hash = await crypto.subtle.digest("SHA-256", keyData);
  const key = await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}
async function encryptJSON(token, data) {
  const key = await deriveKeyFromToken(token);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
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
  const key = await deriveKeyFromToken(token);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  const dec = new TextDecoder();
  const text2 = dec.decode(decrypted);
  return JSON.parse(text2);
}
const _pendingRepoCommits = /* @__PURE__ */ new Map();
const _lastRepoPayload = /* @__PURE__ */ new Map();
const BASE_API = "https://api.github.com";
const REPO_NAME = "skygit-config";
function getHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };
}
let _cachedUserPromise = null;
async function getGitHubUsername(token) {
  if (_cachedUserPromise) return _cachedUserPromise;
  _cachedUserPromise = (async () => {
    const res = await fetch(`${BASE_API}/user`, { headers: getHeaders(token) });
    if (!res.ok) {
      _cachedUserPromise = null;
      throw new Error("Failed to fetch GitHub user");
    }
    const user = await res.json();
    return user.login;
  })();
  return _cachedUserPromise;
}
async function checkSkyGitRepoExists(token, username) {
  const res = await fetch(`https://api.github.com/repos/${username}/${REPO_NAME}`, {
    headers: getHeaders(token)
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
  const headers2 = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };
  const repoRes = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: headers2,
    body: JSON.stringify({
      name: "skygit-config",
      private: true,
      description: "Configuration repo for SkyGit",
      auto_init: true
      // creates an initial commit (README.md)
    })
  });
  if (!repoRes.ok) {
    if (repoRes.status === 422) {
      console.warn("[SkyGit] Repo creation failed (422), assuming it exists. Fetching...");
      const userRes = await fetch("https://api.github.com/user", { headers: headers2 });
      if (userRes.ok) {
        const user = await userRes.json();
        const existingRes = await fetch(`https://api.github.com/repos/${user.login}/skygit-config`, { headers: headers2 });
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
  const configContent = {
    created: (/* @__PURE__ */ new Date()).toISOString(),
    encryption: false,
    media: "github",
    commitPolicy: "manual"
  };
  const configBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(configContent, null, 2))));
  await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/config.json`, {
    method: "PUT",
    headers: headers2,
    body: JSON.stringify({
      message: "Initialize SkyGit config",
      content: configBase64
    })
  });
  await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/.messages/.gitkeep`, {
    method: "PUT",
    headers: headers2,
    body: JSON.stringify({
      message: "Create .messages folder",
      content: btoa("")
    })
  });
  return repo;
}
async function commitRepoToGitHub(token, repo, maxRetries = 2) {
  const username = await getGitHubUsername(token);
  const filePath = `repositories/${repo.owner}-${repo.name}.json`;
  const inFlight = _pendingRepoCommits.get(filePath);
  if (inFlight) return inFlight;
  const headers2 = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
  };
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(repo, null, 2))));
  const lastKey = _lastRepoPayload.get(filePath);
  if (lastKey === content) {
    return;
  }
  let attempts = 0;
  let lastErr = null;
  const doCommitCore = async () => {
    while (attempts <= maxRetries) {
      let sha = null;
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${filePath}`, { headers: headers2 });
        if (checkRes.ok) {
          const existing = await checkRes.json();
          sha = existing.sha;
        }
      } catch (_) {
      }
      const body = {
        message: `Update repo ${repo.full_name}`,
        content,
        ...sha && { sha }
      };
      const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${filePath}`, {
        method: "PUT",
        headers: headers2,
        body: JSON.stringify(body),
        keepalive: true
      });
      if (res.ok) {
        _lastRepoPayload.set(filePath, content);
        return;
      }
      const errText = await res.text();
      lastErr = errText;
      if (res.status === 409) {
        attempts += 1;
        continue;
      }
      break;
    }
    throw new Error(`GitHub commit failed: ${lastErr}`);
  };
  const p = doCommitCore().finally(() => _pendingRepoCommits.delete(filePath));
  _pendingRepoCommits.set(filePath, p);
  return p;
}
async function streamPersistedReposFromGitHub(token) {
  const username = await getGitHubUsername(token);
  const path = `https://api.github.com/repos/${username}/skygit-config/contents/repositories`;
  const headers2 = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };
  const res = await fetch(path, { headers: headers2 });
  if (res.status === 404) {
    const { paused: paused2 } = get(syncState);
    syncState.update((s) => ({
      ...s,
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
  const jsonFiles = files.filter((f) => f.name.endsWith(".json"));
  const { paused } = get(syncState);
  syncState.update((s) => ({
    ...s,
    phase: "streaming",
    loadedCount: 0,
    totalCount: jsonFiles.length,
    paused: false
  }));
  for (const file of jsonFiles) {
    let paused2 = false;
    syncState.subscribe((s) => paused2 = s.paused)();
    if (paused2) break;
    try {
      const contentRes = await fetch(file.url, { headers: headers2 });
      if (!contentRes.ok) {
        console.warn(`[SkyGit] Skipped missing repo file: ${file.name} (${contentRes.status})`);
        continue;
      }
      const meta = await contentRes.json();
      const decoded = atob(meta.content);
      const data = JSON.parse(decoded);
      syncRepoListFromGitHub([data]);
      syncState.update((s) => ({
        ...s,
        loadedCount: s.loadedCount + 1
      }));
    } catch (e) {
      console.warn(`[SkyGit] Skipped malformed repo file: ${file.name}`, e);
      continue;
    }
  }
  syncState.update((s) => ({ ...s, phase: "idle" }));
}
async function streamPersistedConversationsFromGitHub(token) {
  const username = await getGitHubUsername(token);
  const url = `https://api.github.com/repos/${username}/skygit-config/contents/conversations`;
  const headers2 = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };
  const res = await fetch(url, { headers: headers2 });
  if (res.status === 404) return;
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to load conversations: ${error}`);
  }
  const files = await res.json();
  const jsonFiles = files.filter((f) => f.name.endsWith(".json"));
  const conversations2 = [];
  for (const file of jsonFiles) {
    const res2 = await fetch(file.url, { headers: headers2 });
    if (!res2.ok) continue;
    const meta = await res2.json();
    const decoded = JSON.parse(atob(meta.content));
    conversations2.push(decoded);
  }
  return conversations2;
}
async function deleteRepoFromGitHub(token, repo) {
  const username = await getGitHubUsername(token);
  const path = `repositories/${repo.owner}-${repo.name}.json`;
  const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json"
    }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Unable to locate repo file for deletion: ${err}`);
  }
  const file = await res.json();
  const deleteRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json"
    },
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
async function activateMessagingForRepo(token, repo) {
  const headers2 = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };
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
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));
  if (_lastRepoPayload.get(uniqueKey) === base64) {
    return;
  }
  const inFlight = _pendingRepoCommits.get(uniqueKey);
  if (inFlight) return inFlight;
  const apiUrl = `https://api.github.com/repos/${repo.full_name}/contents/${configPath}`;
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
  const headers2 = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json"
  };
  const config = repo.config;
  const configPath = `.messages/config.json`;
  const uniqueKey = `${repo.full_name}/${configPath}`;
  const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));
  const configRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${configPath}`, {
    headers: headers2
  });
  let sha = null;
  if (configRes.ok) {
    const existing = await configRes.json();
    sha = existing.sha;
  }
  const commitPromise = fetch(`https://api.github.com/repos/${repo.full_name}/contents/${configPath}`, {
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
    _lastRepoPayload.set(uniqueKey, base64);
  }).finally(() => {
    _pendingRepoCommits.delete(uniqueKey);
  });
  _pendingRepoCommits.set(uniqueKey, commitPromise);
  await commitPromise;
  const { queueRepoForCommit: queueRepoForCommit2 } = await __vitePreload(async () => {
    const { queueRepoForCommit: queueRepoForCommit3 } = await Promise.resolve().then(() => repoStore);
    return { queueRepoForCommit: queueRepoForCommit3 };
  }, true ? void 0 : void 0);
  await queueRepoForCommit2(repo);
}
async function getSecretsMap(token) {
  const username = await getGitHubUsername(token);
  const url = `https://api.github.com/repos/${username}/skygit-config/contents/secrets.json`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json"
    }
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
  const url = `https://api.github.com/repos/${username}/skygit-config/contents/secrets.json`;
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(secrets, null, 2))));
  if (!sha) {
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json"
      }
    });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    } else if (res.status !== 404) {
      const err = await res.text();
      throw new Error(`Failed to check secrets.json: ${err}`);
    }
  }
  const body = {
    message: "Update secrets.json",
    content,
    ...sha && { sha }
  };
  const saveRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify(body)
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
  if (!credentials || Object.keys(credentials).length === 0) {
    return;
  }
  const encrypted = await encryptJSON(token, credentials);
  const { secrets, sha } = await getSecretsMap(token);
  secrets[url] = encrypted;
  await saveSecretsMap(token, secrets, sha);
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
const repoStore = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  filteredCount,
  flushRepoCommitQueue,
  getRepoByFullName,
  hasPendingRepoCommits,
  queueRepoForCommit,
  repoList,
  selectedRepo,
  syncRepoListFromGitHub
}, Symbol.toStringTag, { value: "Module" }));
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
function setConversationsForRepo(repoFullName2, list) {
  conversations.update((map) => ({
    ...map,
    [repoFullName2]: list
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
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}
const randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const native = { randomUUID };
function v4(options, buf, offset) {
  var _a2;
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
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
  console.log("[SkyGit] 🗑️ removeFromSkyGitConversations() called");
  console.log("⏩ Conversation to remove:", conversation);
  try {
    const username = await getGitHubUsername(token);
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
      console.log("[SkyGit] Conversation file not found in skygit-config, nothing to remove");
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
    } else {
      console.log("[SkyGit] ✅ Successfully removed conversation from skygit-config");
    }
  } catch (error) {
    console.warn("[SkyGit] Error removing conversation from skygit-config:", error);
  }
}
async function commitToSkyGitConversations(token, conversation, usernameOverride = null) {
  console.log("[SkyGit] 📝 commitToSkyGitConversations() called");
  console.log("⏩ Payload:", conversation);
  const username = usernameOverride || await getGitHubUsername(token);
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
  console.log("[SkyGit] 🔧 createConversation called for:", repo.full_name, "with title:", title);
  await getGitHubUsername(token);
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
    console.log("[SkyGit] 📤 Now committing to skygit-config...");
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
  const state2 = get(syncState);
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
  const seen2 = /* @__PURE__ */ new Set();
  for (const repo of repos) {
    if (cancelRequested) break;
    const fullName = repo.full_name;
    if (seen2.has(fullName)) {
      syncState.update((s) => ({ ...s, loadedCount: s.loadedCount + 1 }));
      continue;
    }
    seen2.add(fullName);
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
    console.log("[SkyGit] ✅ Loaded conversations from localStorage");
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
    console.log("[SkyGit] Streaming saved repos...");
    await streamPersistedReposFromGitHub(token);
  } catch (e) {
    console.warn("[SkyGit] Failed to stream repos:", e);
  }
  try {
    console.log("[SkyGit] Streaming saved conversations...");
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
          console.log(`[SkyGit] Conversation "${convo.title}" no longer exists in ${convo.repo}, marking for cleanup`);
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
    if (invalidConversations.length > 0) {
      console.log(`[SkyGit] Cleaned up ${invalidConversations.length} deleted conversation(s) from skygit-config`);
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
  const key = `${repoName}::${convoId}`;
  if (!queue.has(key)) {
    queue.add(key);
    saveQueue();
  }
  if (queue.size >= BATCH_SIZE) {
    flushConversationCommitQueue();
    return;
  }
  const delay = getCommitDelayForRepo(repoName);
  if (!timers.has(key)) {
    const timer = setTimeout(() => {
      flushConversationCommitQueue([key]);
      timers.delete(key);
    }, delay);
    timers.set(key, timer);
  }
}
function getCommitDelayForRepo(repoName) {
  var _a2;
  const repos = get(repoList);
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
  const auth = get(authStore);
  const username = ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login) || await getGitHubUsername(token);
  const convoMap = get(conversations);
  for (const key of keysToProcess) {
    const timer = timers.get(key);
    if (timer) {
      clearTimeout(timer);
      timers.delete(key);
    }
    const [repoName, convoId] = key.split("::");
    const convos = convoMap[repoName] || [];
    const convoMeta = convos.find((c) => c.id === convoId);
    if (!convoMeta || !convoMeta.messages || convoMeta.messages.length === 0) {
      console.warn("[SkyGit] Skipped empty or missing conversation:", key);
      if (convoMeta) {
        queue.delete(key);
        saveQueue();
      }
      continue;
    }
    const hasPending = convoMeta.messages.some((m) => m.pending);
    if (!hasPending) {
      console.log("[SkyGit] No pending messages for", key, "removing from queue");
      queue.delete(key);
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
        console.log("[SkyGit] Successfully committed conversation:", key);
        queue.delete(key);
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
var root$f = /* @__PURE__ */ ns_template(`<svg><!><!></svg>`);
function Icon($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
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
  var svg = root$f();
  let attributes;
  var node = child(svg);
  each(node, 1, iconNode, index, ($$anchor2, $$item) => {
    let tag = () => get$1($$item)[0];
    let attrs = () => get$1($$item)[1];
    var fragment = comment();
    var node_1 = first_child(fragment);
    element(node_1, tag, true, ($$element, $$anchor3) => {
      let attributes_1;
      template_effect(() => attributes_1 = set_attributes($$element, attributes_1, { ...attrs() }));
    });
    append($$anchor2, fragment);
  });
  var node_2 = sibling(node);
  slot(node_2, $$props, "default", {});
  template_effect(
    ($0, $1) => attributes = set_attributes(svg, attributes, {
      ...defaultAttributes,
      ...$$restProps,
      width: size(),
      height: size(),
      stroke: color(),
      "stroke-width": $0,
      class: $1
    }),
    [
      () => absoluteStrokeWidth() ? Number(strokeWidth()) * 24 / Number(size()) : strokeWidth(),
      () => mergeClasses("lucide-icon", "lucide", name() ? `lucide-${name()}` : "", $$sanitized_props.class)
    ],
    derived_safe_equal
  );
  append($$anchor, svg);
  pop();
}
function Bell($$anchor, $$props) {
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      { "d": "M10.268 21a2 2 0 0 0 3.464 0" }
    ],
    [
      "path",
      {
        "d": "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "bell" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    ["path", { "d": "M8 2v4" }],
    ["path", { "d": "M16 2v4" }],
    [
      "rect",
      {
        "width": "18",
        "height": "18",
        "x": "3",
        "y": "4",
        "rx": "2"
      }
    ],
    ["path", { "d": "M3 10h18" }]
  ];
  Icon($$anchor, spread_props({ name: "calendar" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$anchor, spread_props({ name: "check" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "10" }
    ],
    [
      "line",
      {
        "x1": "12",
        "x2": "12",
        "y1": "8",
        "y2": "12"
      }
    ],
    [
      "line",
      {
        "x1": "12",
        "x2": "12.01",
        "y1": "16",
        "y2": "16"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "circle-alert" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "10" }
    ],
    [
      "path",
      { "d": "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }
    ],
    ["path", { "d": "M12 17h.01" }]
  ];
  Icon($$anchor, spread_props({ name: "circle-help" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "10" }
    ],
    ["polyline", { "points": "12 6 12 12 16 14" }]
  ];
  Icon($$anchor, spread_props({ name: "clock" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "ellipse",
      { "cx": "12", "cy": "5", "rx": "9", "ry": "3" }
    ],
    ["path", { "d": "M3 5V19A9 3 0 0 0 21 19V5" }],
    ["path", { "d": "M3 12A9 3 0 0 0 21 12" }]
  ];
  Icon($$anchor, spread_props({ name: "database" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "10" }
    ],
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "2" }
    ]
  ];
  Icon($$anchor, spread_props({ name: "disc" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      }
    ],
    ["polyline", { "points": "7 10 12 15 17 10" }],
    [
      "line",
      {
        "x1": "12",
        "x2": "12",
        "y1": "15",
        "y2": "3"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "download" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
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
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
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
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
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
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "folder" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "circle",
      { "cx": "12", "cy": "12", "r": "10" }
    ],
    ["path", { "d": "M12 16v-4" }],
    ["path", { "d": "M12 8h.01" }]
  ];
  Icon($$anchor, spread_props({ name: "info" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      { "d": "M21 12a9 9 0 1 1-6.219-8.56" }
    ]
  ];
  Icon($$anchor, spread_props({ name: "loader-circle" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      { "d": "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" }
    ]
  ];
  Icon($$anchor, spread_props({ name: "message-circle" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "line",
      {
        "x1": "2",
        "x2": "22",
        "y1": "2",
        "y2": "22"
      }
    ],
    [
      "path",
      { "d": "M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" }
    ],
    ["path", { "d": "M5 10v2a7 7 0 0 0 12 5" }],
    [
      "path",
      { "d": "M15 9.34V5a3 3 0 0 0-5.68-1.33" }
    ],
    ["path", { "d": "M9 9v3a3 3 0 0 0 5.12 2.12" }],
    [
      "line",
      {
        "x1": "12",
        "x2": "12",
        "y1": "19",
        "y2": "22"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "mic-off" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"
      }
    ],
    ["path", { "d": "M19 10v2a7 7 0 0 1-14 0v-2" }],
    [
      "line",
      {
        "x1": "12",
        "x2": "12",
        "y1": "19",
        "y2": "22"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "mic" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      { "d": "M17 17H4a2 2 0 0 1-2-2V5c0-1.5 1-2 1-2" }
    ],
    ["path", { "d": "M22 15V5a2 2 0 0 0-2-2H9" }],
    ["path", { "d": "M8 21h8" }],
    ["path", { "d": "M12 17v4" }],
    ["path", { "d": "m2 2 20 20" }]
  ];
  Icon($$anchor, spread_props({ name: "monitor-off" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "rect",
      {
        "width": "20",
        "height": "14",
        "x": "2",
        "y": "3",
        "rx": "2"
      }
    ],
    [
      "line",
      {
        "x1": "8",
        "x2": "16",
        "y1": "21",
        "y2": "21"
      }
    ],
    [
      "line",
      {
        "x1": "12",
        "x2": "12",
        "y1": "17",
        "y2": "21"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "monitor" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "rect",
      {
        "x": "16",
        "y": "16",
        "width": "6",
        "height": "6",
        "rx": "1"
      }
    ],
    [
      "rect",
      {
        "x": "2",
        "y": "16",
        "width": "6",
        "height": "6",
        "rx": "1"
      }
    ],
    [
      "rect",
      {
        "x": "9",
        "y": "2",
        "width": "6",
        "height": "6",
        "rx": "1"
      }
    ],
    [
      "path",
      {
        "d": "M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"
      }
    ],
    ["path", { "d": "M12 12V8" }]
  ];
  Icon($$anchor, spread_props({ name: "network" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
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
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"
      }
    ],
    [
      "line",
      {
        "x1": "22",
        "x2": "2",
        "y1": "2",
        "y2": "22"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "phone-off" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "phone" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
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
    [
      "line",
      {
        "x1": "6",
        "x2": "6.01",
        "y1": "6",
        "y2": "6"
      }
    ],
    [
      "line",
      {
        "x1": "6",
        "x2": "6.01",
        "y1": "18",
        "y2": "18"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "server" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "shield" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "rect",
      {
        "width": "18",
        "height": "18",
        "x": "3",
        "y": "3",
        "rx": "2"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "square" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    ["path", { "d": "M3 6h18" }],
    [
      "path",
      { "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }
    ],
    [
      "path",
      { "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }
    ],
    [
      "line",
      {
        "x1": "10",
        "x2": "10",
        "y1": "11",
        "y2": "17"
      }
    ],
    [
      "line",
      {
        "x1": "14",
        "x2": "14",
        "y1": "11",
        "y2": "17"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "trash-2" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
      }
    ],
    ["polyline", { "points": "17 8 12 3 7 8" }],
    [
      "line",
      {
        "x1": "12",
        "x2": "12",
        "y1": "3",
        "y2": "15"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "upload" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      }
    ],
    ["circle", { "cx": "9", "cy": "7", "r": "4" }],
    ["path", { "d": "M22 21v-2a4 4 0 0 0-3-3.87" }],
    ["path", { "d": "M16 3.13a4 4 0 0 1 0 7.75" }]
  ];
  Icon($$anchor, spread_props({ name: "users" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
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
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    [
      "path",
      {
        "d": "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"
      }
    ],
    [
      "rect",
      {
        "x": "2",
        "y": "6",
        "width": "14",
        "height": "12",
        "rx": "2"
      }
    ]
  ];
  Icon($$anchor, spread_props({ name: "video" }, () => $$sanitized_props, {
    iconNode,
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
  const $$sanitized_props = legacy_rest_props($$props, [
    "children",
    "$$slots",
    "$$events",
    "$$legacy"
  ]);
  const iconNode = [
    ["path", { "d": "M18 6 6 18" }],
    ["path", { "d": "m6 6 12 12" }]
  ];
  Icon($$anchor, spread_props({ name: "x" }, () => $$sanitized_props, {
    iconNode,
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
var root_1$g = /* @__PURE__ */ template(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div> <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]"><button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><!></button> <h2 class="text-2xl font-bold mb-6 text-gray-800">How to create a GitHub Token</h2> <div class="space-y-6 text-gray-600"><div class="flex gap-4"><div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</div> <div><p class="font-medium text-gray-800 mb-1">Go to Developer Settings</p> <p class="text-sm">Navigate to <a href="https://github.com/settings/tokens" target="_blank" class="text-blue-600 hover:underline inline-flex items-center gap-1">GitHub Settings <!></a> and select <strong>Personal access tokens (Classic)</strong>.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div> <div><p class="font-medium text-gray-800 mb-1">Generate New Token</p> <p class="text-sm">Click <strong>Generate new token</strong> and select <strong>Generate new token (classic)</strong>.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">3</div> <div class="flex-1"><p class="font-medium text-gray-800 mb-1">Select Scopes</p> <p class="text-sm mb-2">Give your token a name (e.g., "SkyGit") and check
                            the following permissions:</p> <div class="bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm font-mono flex items-center justify-between group"><div class="space-y-1"><div class="flex items-center gap-2"><span class="text-green-600">✓</span> <span>repo</span></div> <div class="flex items-center gap-2"><span class="text-green-600">✓</span> <span>read:user</span></div></div></div></div></div> <div class="flex gap-4"><div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">4</div> <div><p class="font-medium text-gray-800 mb-1">Copy & Paste</p> <p class="text-sm">Scroll to the bottom, click <strong>Generate token</strong>, and copy the token (starts with <code>ghp_</code>). Paste it into the login field.</p></div></div></div> <div class="mt-8 pt-6 border-t flex justify-end"><button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Got it</button></div></div></div>`);
function PatHelpModal($$anchor, $$props) {
  let isOpen = prop($$props, "isOpen", 8, false);
  let onClose = prop($$props, "onClose", 8);
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$g();
      var div_1 = child(div);
      var div_2 = sibling(div_1, 2);
      var button = child(div_2);
      var node_1 = child(button);
      X(node_1, { size: 24 });
      var div_3 = sibling(button, 4);
      var div_4 = child(div_3);
      var div_5 = sibling(child(div_4), 2);
      var p = sibling(child(div_5), 2);
      var a = sibling(child(p));
      var node_2 = sibling(child(a));
      External_link(node_2, { size: 12 });
      var div_6 = sibling(div_3, 2);
      var button_1 = child(div_6);
      event("click", div_1, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button_1, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      transition(1, div_2, () => scale, () => ({ start: 0.95 }));
      transition(3, div, () => fade);
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (isOpen()) $$render(consequent);
    });
  }
  append($$anchor, fragment);
}
var root_1$f = /* @__PURE__ */ template(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div> <div class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]"><button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><!></button> <h2 class="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"><!> How SkyGit Works</h2> <div class="space-y-8 text-gray-600"><div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">Where is my data stored?</h3> <p class="text-sm leading-relaxed">SkyGit is <strong>serverless</strong>. We do not
                            have a database. <br><br> All your data (conversations, settings, metadata) is
                            stored directly in <strong>your own GitHub repositories</strong>.</p> <ul class="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-600"><li>Global settings: stored in a private <code>skygit-config</code> repo in your account.</li> <li>Chat messages: stored in a hidden <code>.messages/</code> folder inside each specific repository.</li></ul></div></div> <div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">Who can see my messages?</h3> <p class="text-sm leading-relaxed">Since data is stored in your GitHub repos, <strong>access is controlled by GitHub permissions</strong>. <br> Only people who have access to the repository (collaborators)
                            can see the messages associated with it. If the repo
                            is private, your chats are private.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">What about the PeerJS Server?</h3> <p class="text-sm leading-relaxed">We use a PeerJS server solely for <strong>signaling</strong> (discovery). <br> It helps peers find each other to establish a connection. <br><br> <strong>No chat content or video streams pass through
                                this server.</strong> <br> Only your Peer ID (derived from your username) and connection
                            metadata are temporarily processed to handshake.</p></div></div> <div class="flex gap-4"><div class="flex-shrink-0 mt-1"><div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><!></div></div> <div><h3 class="font-bold text-gray-800 text-lg mb-2">Real-time Communication</h3> <p class="text-sm leading-relaxed">Once connected, all chats, audio, and video calls
                            are transmitted <strong>directly between peers</strong> (Peer-to-Peer) using WebRTC. <br> This traffic is encrypted end-to-end by standard WebRTC
                            protocols and does not touch any central server.</p></div></div></div> <div class="mt-8 pt-6 border-t flex justify-end"><button class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">Close</button></div></div></div>`);
function HowItWorksModal($$anchor, $$props) {
  let isOpen = prop($$props, "isOpen", 8, false);
  let onClose = prop($$props, "onClose", 8);
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$f();
      var div_1 = child(div);
      var div_2 = sibling(div_1, 2);
      var button = child(div_2);
      var node_1 = child(button);
      X(node_1, { size: 24 });
      var h2 = sibling(button, 2);
      var node_2 = child(h2);
      Shield(node_2, { class: "text-blue-600" });
      var div_3 = sibling(h2, 2);
      var div_4 = child(div_3);
      var div_5 = child(div_4);
      var div_6 = child(div_5);
      var node_3 = child(div_6);
      Database(node_3, { size: 20 });
      var div_7 = sibling(div_4, 2);
      var div_8 = child(div_7);
      var div_9 = child(div_8);
      var node_4 = child(div_9);
      Shield(node_4, { size: 20 });
      var div_10 = sibling(div_7, 2);
      var div_11 = child(div_10);
      var div_12 = child(div_11);
      var node_5 = child(div_12);
      Server(node_5, { size: 20 });
      var div_13 = sibling(div_10, 2);
      var div_14 = child(div_13);
      var div_15 = child(div_14);
      var node_6 = child(div_15);
      Network(node_6, { size: 20 });
      var div_16 = sibling(div_3, 2);
      var button_1 = child(div_16);
      event("click", div_1, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button_1, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      transition(1, div_2, () => scale, () => ({ start: 0.95 }));
      transition(3, div, () => fade);
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (isOpen()) $$render(consequent);
    });
  }
  append($$anchor, fragment);
}
var root_1$e = /* @__PURE__ */ template(`<p class="text-red-500 text-sm"> </p>`);
var root_2$c = /* @__PURE__ */ template(`<span class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Authenticating…`, 1);
var root$e = /* @__PURE__ */ template(`<div class="space-y-4 max-w-md mx-auto mt-20 p-6 bg-white rounded shadow"><h2 class="text-xl font-semibold">Enter your GitHub Personal Access Token</h2> <input type="text" placeholder="ghp_..." class="w-full border p-2 rounded"> <!> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full flex items-center justify-center disabled:opacity-50"><!></button> <p class="text-sm text-gray-500 flex flex-col gap-2"><span>Don’t have a token? <a class="text-blue-600 underline" target="_blank" href="https://github.com/settings/tokens/new?scopes=repo,read:user&amp;description=SkyGit">Generate one here</a></span> <button class="text-gray-500 hover:text-gray-700 text-sm underline text-left flex items-center gap-1"><!> How to create a token?</button> <button class="text-gray-500 hover:text-gray-700 text-sm underline text-left flex items-center gap-1"><!> How SkyGit works?</button></p></div> <!> <!>`, 1);
function LoginWithPAT($$anchor, $$props) {
  push($$props, false);
  let onSubmit = prop($$props, "onSubmit", 8);
  let error = prop($$props, "error", 8, null);
  let token = /* @__PURE__ */ mutable_source("");
  let loading = /* @__PURE__ */ mutable_source(false);
  let showHelp = /* @__PURE__ */ mutable_source(false);
  let showHowItWorks = /* @__PURE__ */ mutable_source(false);
  async function handleSubmit() {
    if (get$1(loading)) return;
    set(loading, true);
    await onSubmit()(get$1(token));
    set(loading, false);
  }
  init();
  var fragment = root$e();
  var div = first_child(fragment);
  var input = sibling(child(div), 2);
  var node = sibling(input, 2);
  {
    var consequent = ($$anchor2) => {
      var p = root_1$e();
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
      var fragment_1 = root_2$c();
      append($$anchor2, fragment_1);
    };
    var alternate = ($$anchor2) => {
      var text_1 = text("Authenticate");
      append($$anchor2, text_1);
    };
    if_block(node_1, ($$render) => {
      if (get$1(loading)) $$render(consequent_1);
      else $$render(alternate, false);
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
      return get$1(showHelp);
    },
    onClose: () => set(showHelp, false)
  });
  var node_5 = sibling(node_4, 2);
  HowItWorksModal(node_5, {
    get isOpen() {
      return get$1(showHowItWorks);
    },
    onClose: () => set(showHowItWorks, false)
  });
  template_effect(() => {
    input.disabled = get$1(loading);
    button.disabled = get$1(loading);
  });
  bind_value(input, () => get$1(token), ($$value) => set(token, $$value));
  event("click", button, handleSubmit);
  event("click", button_1, () => set(showHelp, true));
  event("click", button_2, () => set(showHowItWorks, true));
  append($$anchor, fragment);
  pop();
}
var root_1$d = /* @__PURE__ */ template(`<span class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Creating...`, 1);
var root$d = /* @__PURE__ */ template(`<div class="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow space-y-4"><h2 class="text-xl font-bold">Repository Creation</h2> <p>SkyGit needs to create a private GitHub repository in your account called <strong><code>skygit-config</code></strong>.</p> <p>This repository will store your conversation metadata and settings.</p> <div class="flex space-x-4 mt-6"><button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"><!></button> <button class="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button></div></div>`);
function RepoConsent($$anchor, $$props) {
  push($$props, false);
  let onApprove = prop($$props, "onApprove", 8);
  let onReject = prop($$props, "onReject", 8);
  let loading = /* @__PURE__ */ mutable_source(false);
  async function handleApprove() {
    if (get$1(loading)) return;
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
  var div = root$d();
  var div_1 = sibling(child(div), 6);
  var button = child(div_1);
  var node = child(button);
  {
    var consequent = ($$anchor2) => {
      var fragment = root_1$d();
      append($$anchor2, fragment);
    };
    var alternate = ($$anchor2) => {
      var text$1 = text("I Accept");
      append($$anchor2, text$1);
    };
    if_block(node, ($$render) => {
      if (get$1(loading)) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  var button_1 = sibling(button, 2);
  template_effect(() => {
    button.disabled = get$1(loading);
    button_1.disabled = get$1(loading);
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
function setPollingState(repoFullName2, active) {
  presencePolling.update((m) => ({ ...m, [repoFullName2]: active }));
}
var root_1$c = /* @__PURE__ */ template(`<option> </option>`);
var root_2$b = /* @__PURE__ */ template(`<option> </option>`);
var root_5$6 = /* @__PURE__ */ template(`<span title="Presence paused" class="mt-0.5">⏸️</span>`);
var root_6$6 = /* @__PURE__ */ template(`<span title="Presence active" class="mt-0.5">▶️</span>`);
var root_7$6 = /* @__PURE__ */ template(`<p class="text-xs text-gray-400 italic truncate mt-1"> </p>`);
var root_8$6 = /* @__PURE__ */ template(`<p class="text-xs text-gray-300 italic mt-1">No messages yet.</p>`);
var root_4$6 = /* @__PURE__ */ template(`<button class="px-3 py-2 hover:bg-blue-50 rounded cursor-pointer text-left flex gap-2 items-start"><!> <div class="flex-1"><p class="text-sm font-medium truncate"> </p> <p class="text-xs text-gray-500 truncate"> </p> <!></div></button>`);
var root_9$6 = /* @__PURE__ */ template(`<p class="text-xs text-gray-400 italic px-3 py-4"><!></p>`);
var root$c = /* @__PURE__ */ template(`<div class="mt-2 space-y-2"><div class="px-3 flex flex-col gap-2"><label class="text-xs text-gray-500">Organization <select class="mt-1 w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"></select></label> <label class="text-xs text-gray-500">Repository <select class="mt-1 w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"></select></label></div> <div class="flex flex-col gap-1"><!> <!></div></div>`);
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
  conversations.subscribe((value) => set(convoMap, value));
  presencePolling.subscribe((m) => set(pollingMap, m));
  function openConversation(convo) {
    currentContent.set(convo);
    selectedConversation.set(convo);
    currentRoute.set("chats");
  }
  const orgFromRepo = (repo) => (repo == null ? void 0 : repo.includes("/")) ? repo.split("/")[0] : repo || "";
  legacy_pre_effect(() => get$1(convoMap), () => {
    set(allConversations, Object.values(get$1(convoMap)).flat().sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    }));
  });
  legacy_pre_effect(() => get$1(allConversations), () => {
    set(orgOptions, [
      "all",
      ...Array.from(new Set(get$1(allConversations).map((convo) => orgFromRepo(convo.repo)).filter((org) => org && org.trim() !== "")))
    ]);
  });
  legacy_pre_effect(
    () => (get$1(allConversations), get$1(selectedOrg)),
    () => {
      set(repoOptions, [
        "all",
        ...Array.from(new Set(get$1(allConversations).filter((convo) => get$1(selectedOrg) === "all" || orgFromRepo(convo.repo) === get$1(selectedOrg)).map((convo) => convo.repo).filter((repo) => repo && repo.trim() !== "")))
      ]);
    }
  );
  legacy_pre_effect(
    () => (get$1(selectedOrg), get$1(previousOrg), get$1(selectedRepo2), get$1(repoOptions)),
    () => {
      if (get$1(selectedOrg) !== get$1(previousOrg)) {
        set(selectedRepo2, "all");
        set(previousOrg, get$1(selectedOrg));
      }
      if (!get$1(repoOptions).includes(get$1(selectedRepo2))) {
        set(selectedRepo2, "all");
      }
    }
  );
  legacy_pre_effect(
    () => (get$1(allConversations), get$1(selectedOrg), get$1(selectedRepo2)),
    () => {
      set(scopedConversations, get$1(allConversations).filter((convo) => {
        const org = orgFromRepo(convo.repo);
        if (get$1(selectedOrg) !== "all" && org !== get$1(selectedOrg)) return false;
        if (get$1(selectedRepo2) !== "all" && convo.repo !== get$1(selectedRepo2)) return false;
        return true;
      }));
    }
  );
  legacy_pre_effect(
    () => (get$1(scopedConversations), deep_read_state(search())),
    () => {
      set(filteredConversations, get$1(scopedConversations).filter((convo) => {
        if (!search() || search().trim() === "") return true;
        const query = search().toLowerCase();
        const title = (convo.title || `Conversation ${convo.id.slice(0, 6)}`).toLowerCase();
        const repo = convo.repo.toLowerCase();
        const fullName = `${repo}/${title}`;
        return title.includes(query) || repo.includes(query) || fullName.includes(query);
      }));
    }
  );
  legacy_pre_effect(
    () => (get$1(filteredConversations), currentContent),
    () => {
      const currentSelection = get(selectedConversation);
      if (currentSelection && !get$1(filteredConversations).some((c) => c.id === currentSelection.id)) {
        selectedConversation.set(null);
        const currentContentValue = get(currentContent);
        if (currentContentValue && currentContentValue.id === currentSelection.id) {
          currentContent.set(null);
        }
      }
    }
  );
  legacy_pre_effect(
    () => (deep_read_state(search()), get$1(previousSearch), get$1(filteredConversations)),
    () => {
      if (search() !== get$1(previousSearch)) {
        if (get$1(previousSearch) === "" && search().trim() !== "") {
          selectedConversation.set(null);
          currentContent.set(null);
        }
        if (search().trim() !== "" && get$1(filteredConversations).length === 1) {
          setTimeout(
            () => {
              const onlyConvo = get$1(filteredConversations)[0];
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
  var div = root$c();
  var div_1 = child(div);
  var label = child(div_1);
  var select = sibling(child(label));
  template_effect(() => {
    get$1(selectedOrg);
    invalidate_inner_signals(() => {
      get$1(orgOptions);
    });
  });
  each(select, 5, () => get$1(orgOptions), index, ($$anchor2, org) => {
    var option = root_1$c();
    var option_value = {};
    var text2 = child(option);
    template_effect(() => {
      if (option_value !== (option_value = get$1(org))) {
        option.value = null == (option.__value = get$1(org)) ? "" : get$1(org);
      }
      set_text(text2, get$1(org) === "all" ? "All organizations" : get$1(org));
    });
    append($$anchor2, option);
  });
  var label_1 = sibling(label, 2);
  var select_1 = sibling(child(label_1));
  template_effect(() => {
    get$1(selectedRepo2);
    invalidate_inner_signals(() => {
      get$1(repoOptions);
    });
  });
  each(select_1, 5, () => get$1(repoOptions), index, ($$anchor2, repo) => {
    var option_1 = root_2$b();
    var option_1_value = {};
    var text_1 = child(option_1);
    template_effect(() => {
      if (option_1_value !== (option_1_value = get$1(repo))) {
        option_1.value = null == (option_1.__value = get$1(repo)) ? "" : get$1(repo);
      }
      set_text(text_1, get$1(repo) === "all" ? "All repositories" : get$1(repo));
    });
    append($$anchor2, option_1);
  });
  var div_2 = sibling(div_1, 2);
  var node = child(div_2);
  each(node, 1, () => get$1(filteredConversations), (convo) => convo.id, ($$anchor2, convo) => {
    var fragment = comment();
    var node_1 = first_child(fragment);
    key_block(node_1, () => `${get$1(convo).id}-${get$1(pollingMap)[get$1(convo).repo]}`, ($$anchor3) => {
      var button = root_4$6();
      var node_2 = child(button);
      {
        var consequent = ($$anchor4) => {
          var span = root_5$6();
          append($$anchor4, span);
        };
        var alternate = ($$anchor4) => {
          var span_1 = root_6$6();
          append($$anchor4, span_1);
        };
        if_block(node_2, ($$render) => {
          if (get$1(pollingMap)[get$1(convo).repo] === false) $$render(consequent);
          else $$render(alternate, false);
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
          var p_2 = root_7$6();
          var text_4 = child(p_2);
          template_effect(
            ($0) => set_text(text_4, $0),
            [
              () => get$1(convo).messages.at(-1).content
            ],
            derived_safe_equal
          );
          append($$anchor4, p_2);
        };
        var alternate_1 = ($$anchor4) => {
          var p_3 = root_8$6();
          append($$anchor4, p_3);
        };
        if_block(node_3, ($$render) => {
          if (get$1(convo).messages && get$1(convo).messages.length > 0) $$render(consequent_1);
          else $$render(alternate_1, false);
        });
      }
      template_effect(
        ($0) => {
          set_text(text_2, $0);
          set_text(text_3, get$1(convo).repo);
        },
        [
          () => get$1(convo).title || `Conversation ${get$1(convo).id.slice(0, 6)}`
        ],
        derived_safe_equal
      );
      event("click", button, () => openConversation(get$1(convo)));
      append($$anchor3, button);
    });
    append($$anchor2, fragment);
  });
  var node_4 = sibling(node, 2);
  {
    var consequent_3 = ($$anchor2) => {
      var p_4 = root_9$6();
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
          if (get$1(allConversations).length === 0) $$render(consequent_2);
          else $$render(alternate_2, false);
        });
      }
      append($$anchor2, p_4);
    };
    if_block(node_4, ($$render) => {
      if (get$1(filteredConversations).length === 0) $$render(consequent_3);
    });
  }
  bind_select_value(select, () => get$1(selectedOrg), ($$value) => set(selectedOrg, $$value));
  bind_select_value(select_1, () => get$1(selectedRepo2), ($$value) => set(selectedRepo2, $$value));
  append($$anchor, div);
  pop();
}
var root_1$b = /* @__PURE__ */ template(`<button class="border border-slate-300 text-xs px-3 py-2 rounded text-slate-600 hover:bg-slate-100">⏱ Scan all automatically</button>`);
var root_2$a = /* @__PURE__ */ template(`<div class="flex items-center justify-between mb-3 text-sm text-gray-500"><div class="flex items-center gap-2"><!> <span> </span></div> <button class="text-blue-600 text-xs underline"> </button></div>`);
var root_4$5 = /* @__PURE__ */ template(`<div class="flex flex-col gap-2 mb-3 text-sm text-gray-500"><div class="flex items-center gap-2"><!> <span> </span></div> <button class="self-start text-blue-600 text-xs underline">Cancel discovery</button></div>`);
var root_9$5 = /* @__PURE__ */ template(`<span class="ml-1 text-green-600"> </span>`);
var root_8$5 = /* @__PURE__ */ template(`Select an organization below to scan its repositories. <!>`, 1);
var root_6$5 = /* @__PURE__ */ template(`<div class="mb-3 text-xs text-gray-500"><!></div>`);
var root_11$2 = /* @__PURE__ */ template(`<div class="mb-3 text-xs text-green-600"> </div>`);
var root_14$2 = /* @__PURE__ */ template(`<img class="w-6 h-6 rounded-full">`);
var root_15$2 = /* @__PURE__ */ template(`<p class="mt-1 text-xs text-gray-500"> </p>`);
var root_13$2 = /* @__PURE__ */ template(`<li class="px-3 py-2 text-sm text-gray-700"><button class="w-full flex items-center gap-2 text-blue-600 hover:text-blue-800 disabled:opacity-40"><!> <span class="truncate"> </span></button> <!></li>`);
var root_12$2 = /* @__PURE__ */ template(`<div class="mb-4 border border-gray-200 rounded-lg overflow-hidden"><div class="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">Discovery targets</div> <ul class="divide-y divide-gray-200"></ul></div>`);
var root_17$2 = /* @__PURE__ */ ns_template(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`);
var root_18$3 = /* @__PURE__ */ ns_template(`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>`);
var root_19$2 = /* @__PURE__ */ template(`<option> </option>`);
var root_16$2 = /* @__PURE__ */ template(`<div class="mb-3 flex gap-2"><button class="p-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center"><!></button> <select class="flex-1 text-sm border border-gray-300 rounded px-2 py-1 bg-white"><option> </option><!></select></div>`);
var root_25$2 = /* @__PURE__ */ template(`<span title="Google Drive storage configured">📁</span>`);
var root_27$1 = /* @__PURE__ */ template(`<span title="S3 storage configured">🪣</span>`);
var root_23$2 = /* @__PURE__ */ template(`<div><div class="text-sm truncate flex-1"><button> </button> <span class="text-xs text-gray-500 ml-1"> <!></span></div> <button aria-label="Remove repo" class="opacity-0 hover:opacity-100 transition-opacity"><!></button></div>`);
var root_22$1 = /* @__PURE__ */ template(`<div class="bg-white"></div>`);
var root_21$1 = /* @__PURE__ */ template(`<div class="border border-gray-200 rounded-lg overflow-hidden"><button class="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"><div class="flex items-center gap-2"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg> <span class="font-medium text-sm"> </span> <span class="text-xs text-gray-500"> </span></div></button> <!></div>`);
var root_20 = /* @__PURE__ */ template(`<div class="space-y-2"></div>`);
var root_28$1 = /* @__PURE__ */ template(`<p class="text-sm text-gray-400 italic mt-2">No matching repositories found.</p>`);
var root$b = /* @__PURE__ */ template(`<div class="mb-3 space-y-2"><div class="flex flex-col gap-2"><button class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded">📦 Sync saved repos</button> <div class="flex flex-col sm:flex-row gap-2"><button class="bg-slate-200 hover:bg-slate-300 text-xs px-3 py-2 rounded text-slate-900">🔍 Discover organizations</button> <!></div></div> <p class="text-xs text-gray-500 leading-relaxed">Sync pulls the latest repository snapshots from your <code class="bg-gray-100 px-1 rounded">skygit-config</code> repo. Discovery scans GitHub organizations (including your personal account) for new repositories to mirror here.</p></div> <!> <!> <!> <div class="flex flex-wrap gap-3 text-xs text-gray-700 mb-3"><label><input type="checkbox"> 🔒 Private</label> <label><input type="checkbox"> 🌐 Public</label> <label><input type="checkbox"> 💬 With Messages</label> <label><input type="checkbox"> No Messages</label></div> <!>`, 1);
function SidebarRepos($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $selectedRepo = () => store_get(selectedRepo, "$selectedRepo", $$stores);
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
    const repo = get$1(repos).find((r2) => r2.full_name === fullName);
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
      syncState.update((s) => ({
        ...s,
        phase: "streaming",
        paused: false,
        loadedCount: 0
      }));
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
    var _a2, _b;
    const match = (_b = (_a2 = get$1(state2)) == null ? void 0 : _a2.organizations) == null ? void 0 : _b.find((org) => org.id === id);
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
    if (get$1(collapsedOrgs).has(org)) {
      get$1(collapsedOrgs).delete(org);
    } else {
      get$1(collapsedOrgs).add(org);
    }
    set(collapsedOrgs, get$1(collapsedOrgs));
  }
  function toggleAllOrgs() {
    const orgs = Object.keys(get$1(groupedRepos));
    const hasExpanded = orgs.some((org) => !get$1(collapsedOrgs).has(org));
    if (hasExpanded) {
      orgs.forEach((org) => get$1(collapsedOrgs).add(org));
    } else {
      get$1(collapsedOrgs).clear();
    }
    set(collapsedOrgs, get$1(collapsedOrgs));
  }
  legacy_pre_effect(
    () => (get$1(repos), deep_read_state(search()), get$1(showPrivate), get$1(showPublic), get$1(showWithMessages), get$1(showWithoutMessages), get$1(selectedOrg)),
    () => {
      set(filteredRepos, get$1(repos).filter((repo) => {
        const q = search().toLowerCase();
        const matchesSearch = repo.full_name.toLowerCase().includes(q) || repo.name.toLowerCase().includes(q) || repo.owner.toLowerCase().includes(q);
        const matchesPrivacy = repo.private && get$1(showPrivate) || !repo.private && get$1(showPublic);
        const matchesMessages = repo.has_messages && get$1(showWithMessages) || !repo.has_messages && get$1(showWithoutMessages);
        const matchesOrg = get$1(selectedOrg) === "all" || repo.owner === get$1(selectedOrg);
        return matchesSearch && matchesPrivacy && matchesMessages && matchesOrg;
      }));
    }
  );
  legacy_pre_effect(() => get$1(filteredRepos), () => {
    filteredCount.set(get$1(filteredRepos).length);
  });
  legacy_pre_effect(() => get$1(repos), () => {
    set(organizations, [
      ...new Set(get$1(repos).map((r2) => r2.owner))
    ].sort());
  });
  legacy_pre_effect(() => get$1(filteredRepos), () => {
    set(groupedRepos, get$1(filteredRepos).reduce(
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
  legacy_pre_effect(() => get$1(repos), () => {
    set(orgCounts, get$1(repos).reduce(
      (counts, repo) => {
        counts[repo.owner] = (counts[repo.owner] || 0) + 1;
        return counts;
      },
      {}
    ));
  });
  legacy_pre_effect(
    () => (get$1(groupedRepos), get$1(collapsedOrgs)),
    () => {
      set(allCollapsed, Object.keys(get$1(groupedRepos)).length > 0 && Object.keys(get$1(groupedRepos)).every((org) => get$1(collapsedOrgs).has(org)));
    }
  );
  legacy_pre_effect_reset();
  init();
  var fragment = root$b();
  var div = first_child(fragment);
  var div_1 = child(div);
  var button = child(div_1);
  var div_2 = sibling(button, 2);
  var button_1 = child(div_2);
  var node = sibling(button_1, 2);
  {
    var consequent = ($$anchor2) => {
      var button_2 = root_1$b();
      event("click", button_2, runFullDiscovery);
      append($$anchor2, button_2);
    };
    if_block(node, ($$render) => {
      if (get$1(state2).organizations.length > 1) $$render(consequent);
    });
  }
  var node_1 = sibling(div, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_3 = root_2$a();
      var div_4 = child(div_3);
      var node_2 = child(div_4);
      Loader_circle(node_2, { class: "w-4 h-4 animate-spin text-blue-500" });
      var span = sibling(node_2, 2);
      var text2 = child(span);
      var button_3 = sibling(div_4, 2);
      var text_1 = child(button_3);
      template_effect(() => {
        set_text(text2, `Syncing saved repos: ${get$1(state2).loadedCount ?? ""}/${get$1(state2).totalCount ?? "?"}`);
        set_text(text_1, get$1(state2).paused ? "Resume sync" : "Pause sync");
      });
      event("click", button_3, function(...$$args) {
        var _a2;
        (_a2 = get$1(state2).paused ? resumeSyncing : pauseSyncing) == null ? void 0 : _a2.apply(this, $$args);
      });
      append($$anchor2, div_3);
    };
    var alternate = ($$anchor2, $$elseif) => {
      {
        var consequent_2 = ($$anchor3) => {
          var div_5 = root_4$5();
          var div_6 = child(div_5);
          var node_3 = child(div_6);
          Loader_circle(node_3, { class: "w-4 h-4 animate-spin text-blue-500" });
          var span_1 = sibling(node_3, 2);
          var text_2 = child(span_1);
          var button_4 = sibling(div_6, 2);
          template_effect(
            ($0) => set_text(text_2, `Scanning ${$0 ?? ""}: ${get$1(state2).loadedCount ?? ""}/${get$1(state2).totalCount ?? "?"}`),
            [
              () => labelForOrg(get$1(state2).currentOrg)
            ],
            derived_safe_equal
          );
          event("click", button_4, cancelRepoScan);
          append($$anchor3, div_5);
        };
        var alternate_1 = ($$anchor3, $$elseif2) => {
          {
            var consequent_5 = ($$anchor4) => {
              var div_7 = root_6$5();
              var node_4 = child(div_7);
              {
                var consequent_3 = ($$anchor5) => {
                  var text_3 = text("Looking up accessible organizations…");
                  append($$anchor5, text_3);
                };
                var alternate_2 = ($$anchor5) => {
                  var fragment_1 = root_8$5();
                  var node_5 = sibling(first_child(fragment_1));
                  {
                    var consequent_4 = ($$anchor6) => {
                      var span_2 = root_9$5();
                      var text_4 = child(span_2);
                      template_effect(() => set_text(text_4, `✓ Last scanned: ${get$1(state2).lastCompletedOrg ?? ""}`));
                      append($$anchor6, span_2);
                    };
                    if_block(node_5, ($$render) => {
                      if (get$1(state2).lastCompletedOrg) $$render(consequent_4);
                    });
                  }
                  append($$anchor5, fragment_1);
                };
                if_block(node_4, ($$render) => {
                  if (get$1(state2).organizations.length === 0) $$render(consequent_3);
                  else $$render(alternate_2, false);
                });
              }
              append($$anchor4, div_7);
            };
            var alternate_3 = ($$anchor4) => {
              var fragment_2 = comment();
              var node_6 = first_child(fragment_2);
              {
                var consequent_6 = ($$anchor5) => {
                  var div_8 = root_11$2();
                  var text_5 = child(div_8);
                  template_effect(() => set_text(text_5, `✓ Finished scanning ${get$1(state2).lastCompletedOrg ?? ""}`));
                  append($$anchor5, div_8);
                };
                if_block(node_6, ($$render) => {
                  if (get$1(state2).lastCompletedOrg) $$render(consequent_6);
                });
              }
              append($$anchor4, fragment_2);
            };
            if_block(
              $$anchor3,
              ($$render) => {
                if (get$1(state2).phase === "discover-orgs") $$render(consequent_5);
                else $$render(alternate_3, false);
              },
              $$elseif2
            );
          }
        };
        if_block(
          $$anchor2,
          ($$render) => {
            if (get$1(state2).phase === "discover-repos") $$render(consequent_2);
            else $$render(alternate_1, false);
          },
          $$elseif
        );
      }
    };
    if_block(node_1, ($$render) => {
      if (get$1(state2).phase === "streaming") $$render(consequent_1);
      else $$render(alternate, false);
    });
  }
  var node_7 = sibling(node_1, 2);
  {
    var consequent_9 = ($$anchor2) => {
      var div_9 = root_12$2();
      var ul = sibling(child(div_9), 2);
      each(ul, 5, () => get$1(state2).organizations, index, ($$anchor3, org) => {
        var li = root_13$2();
        var button_5 = child(li);
        var node_8 = child(button_5);
        {
          var consequent_7 = ($$anchor4) => {
            var img = root_14$2();
            template_effect(() => {
              set_attribute(img, "src", get$1(org).avatar_url);
              set_attribute(img, "alt", get$1(org).label);
            });
            append($$anchor4, img);
          };
          if_block(node_8, ($$render) => {
            if (get$1(org).avatar_url) $$render(consequent_7);
          });
        }
        var span_3 = sibling(node_8, 2);
        var text_6 = child(span_3);
        var node_9 = sibling(button_5, 2);
        {
          var consequent_8 = ($$anchor4) => {
            var p = root_15$2();
            var text_7 = child(p);
            template_effect(() => set_text(text_7, `Scanning ${get$1(state2).loadedCount ?? ""}/${get$1(state2).totalCount ?? "?"}…`));
            append($$anchor4, p);
          };
          if_block(node_9, ($$render) => {
            if (get$1(state2).phase === "discover-repos" && get$1(state2).currentOrg === get$1(org).id) $$render(consequent_8);
          });
        }
        template_effect(
          ($0) => {
            button_5.disabled = get$1(state2).phase === "discover-repos";
            set_text(text_6, $0);
          },
          [() => labelForOrg(get$1(org).id)],
          derived_safe_equal
        );
        event("click", button_5, () => {
          discoverOrgRepos(get$1(org).id);
          set(collapsedOrgs, new Set(Object.keys(get$1(groupedRepos))));
        });
        append($$anchor3, li);
      });
      append($$anchor2, div_9);
    };
    if_block(node_7, ($$render) => {
      if (get$1(state2).organizations.length > 0) $$render(consequent_9);
    });
  }
  var node_10 = sibling(node_7, 2);
  {
    var consequent_11 = ($$anchor2) => {
      var div_10 = root_16$2();
      var button_6 = child(div_10);
      var node_11 = child(button_6);
      {
        var consequent_10 = ($$anchor3) => {
          var svg = root_17$2();
          append($$anchor3, svg);
        };
        var alternate_4 = ($$anchor3) => {
          var svg_1 = root_18$3();
          append($$anchor3, svg_1);
        };
        if_block(node_11, ($$render) => {
          if (get$1(allCollapsed)) $$render(consequent_10);
          else $$render(alternate_4, false);
        });
      }
      var select = sibling(button_6, 2);
      template_effect(() => {
        get$1(selectedOrg);
        invalidate_inner_signals(() => {
          get$1(repos);
          get$1(organizations);
          get$1(orgCounts);
        });
      });
      var option = child(select);
      option.value = null == (option.__value = "all") ? "" : "all";
      var text_8 = child(option);
      var node_12 = sibling(option);
      each(node_12, 1, () => get$1(organizations), index, ($$anchor3, org) => {
        var option_1 = root_19$2();
        var option_1_value = {};
        var text_9 = child(option_1);
        template_effect(() => {
          if (option_1_value !== (option_1_value = get$1(org))) {
            option_1.value = null == (option_1.__value = get$1(org)) ? "" : get$1(org);
          }
          set_text(text_9, `${get$1(org) ?? ""} (${get$1(orgCounts)[get$1(org)] || 0})`);
        });
        append($$anchor3, option_1);
      });
      template_effect(() => {
        set_attribute(button_6, "title", get$1(allCollapsed) ? "Expand all organizations" : "Collapse all organizations");
        set_text(text_8, `All organizations (${get$1(repos).length ?? ""})`);
      });
      event("click", button_6, toggleAllOrgs);
      bind_select_value(select, () => get$1(selectedOrg), ($$value) => set(selectedOrg, $$value));
      append($$anchor2, div_10);
    };
    if_block(node_10, ($$render) => {
      if (get$1(organizations).length > 1) $$render(consequent_11);
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
      var div_12 = root_20();
      each(div_12, 5, () => Object.entries(get$1(groupedRepos)).sort((a, b) => a[0].localeCompare(b[0])), index, ($$anchor3, $$item) => {
        let org = () => get$1($$item)[0];
        let orgRepos = () => get$1($$item)[1];
        var div_13 = root_21$1();
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
            var div_15 = root_22$1();
            each(div_15, 5, orgRepos, (repo) => repo.full_name, ($$anchor5, repo) => {
              var div_16 = root_23$2();
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
                      var span_7 = root_25$2();
                      append($$anchor7, span_7);
                    };
                    var alternate_5 = ($$anchor7, $$elseif) => {
                      {
                        var consequent_13 = ($$anchor8) => {
                          var span_8 = root_27$1();
                          append($$anchor8, span_8);
                        };
                        if_block(
                          $$anchor7,
                          ($$render) => {
                            if (get$1(repo).config.binary_storage_type === "s3") $$render(consequent_13);
                          },
                          $$elseif
                        );
                      }
                    };
                    if_block(node_16, ($$render) => {
                      if (get$1(repo).config.binary_storage_type === "google_drive") $$render(consequent_12);
                      else $$render(alternate_5, false);
                    });
                  }
                  append($$anchor6, fragment_3);
                };
                if_block(node_15, ($$render) => {
                  var _a2, _b;
                  if ((_b = (_a2 = get$1(repo).config) == null ? void 0 : _a2.storage_info) == null ? void 0 : _b.url) $$render(consequent_14);
                });
              }
              var button_9 = sibling(div_17, 2);
              var node_17 = child(button_9);
              Trash_2(node_17, {
                class: "w-4 h-4 text-red-500 hover:text-red-700"
              });
              template_effect(() => {
                var _a2, _b;
                set_class(div_16, 1, `flex items-center justify-between px-3 py-2 hover:bg-blue-50 border-t border-gray-100 ${(((_a2 = $selectedRepo()) == null ? void 0 : _a2.full_name) === get$1(repo).full_name ? "bg-blue-100" : "") ?? ""}`);
                set_class(button_8, 1, `font-medium hover:underline cursor-pointer ${(((_b = $selectedRepo()) == null ? void 0 : _b.full_name) === get$1(repo).full_name ? "text-blue-900 font-semibold" : "text-blue-700") ?? ""}`);
                set_text(text_12, get$1(repo).name);
                set_text(text_13, `${(get$1(repo).private ? "🔒" : "🌐") ?? ""}
                                        ${(get$1(repo).has_messages ? "💬" : "") ?? ""} `);
              });
              event("click", button_8, () => showRepo(get$1(repo)));
              event("click", button_9, () => removeRepo(get$1(repo).full_name));
              append($$anchor5, div_16);
            });
            append($$anchor4, div_15);
          };
          if_block(node_14, ($$render) => {
            if (!get$1(collapsedOrgs).has(org())) $$render(consequent_15);
          });
        }
        template_effect(
          ($0) => {
            set_class(svg_2, 0, `w-4 h-4 text-gray-500 transition-transform ${$0 ?? ""}`);
            set_text(text_10, org());
            set_text(text_11, `(${orgRepos().length ?? ""} of ${get$1(orgCounts)[org()] || 0})`);
          },
          [
            () => get$1(collapsedOrgs).has(org()) ? "" : "rotate-90"
          ],
          derived_safe_equal
        );
        event("click", button_7, () => toggleOrgCollapse(org()));
        append($$anchor3, div_13);
      });
      append($$anchor2, div_12);
    };
    var alternate_6 = ($$anchor2) => {
      var p_1 = root_28$1();
      append($$anchor2, p_1);
    };
    if_block(node_13, ($$render) => {
      if (get$1(filteredRepos).length > 0) $$render(consequent_16);
      else $$render(alternate_6, false);
    });
  }
  event("click", button, triggerSync);
  event("click", button_1, discoverOrgs);
  bind_checked(input, () => get$1(showPrivate), ($$value) => set(showPrivate, $$value));
  bind_checked(input_1, () => get$1(showPublic), ($$value) => set(showPublic, $$value));
  bind_checked(input_2, () => get$1(showWithMessages), ($$value) => set(showWithMessages, $$value));
  bind_checked(input_3, () => get$1(showWithoutMessages), ($$value) => set(showWithoutMessages, $$value));
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root$a = /* @__PURE__ */ template(`<p class="text-sm text-gray-500">[Calls history will appear here]</p>`);
function SidebarCalls($$anchor) {
  var p = root$a();
  append($$anchor, p);
}
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
      const key = this.unpack();
      map[key] = this.unpack();
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
  return Object.keys(data).reduce(function(accumulator, key) {
    const isObj = isObject(data[key]);
    const value = isObj ? compactObject(data[key]) : data[key];
    const isEmptyObject = isObj && !Object.keys(value).length;
    if (value === void 0 || isEmptyObject) {
      return accumulator;
    }
    return Object.assign(accumulator, { [key]: value });
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
    Object.keys(c).forEach((key) => {
      if (key === "require" || key === "advanced" || key === "mediaSource") {
        return;
      }
      const r2 = typeof c[key] === "object" ? c[key] : { ideal: c[key] };
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
          oc[oldname_("min", key)] = r2.ideal;
          cc.optional.push(oc);
          oc = {};
          oc[oldname_("max", key)] = r2.ideal;
          cc.optional.push(oc);
        } else {
          oc[oldname_("", key)] = r2.ideal;
          cc.optional.push(oc);
        }
      }
      if (r2.exact !== void 0 && typeof r2.exact !== "number") {
        cc.mandatory = cc.mandatory || {};
        cc.mandatory[oldname_("", key)] = r2.exact;
      } else {
        ["min", "max"].forEach((mix) => {
          if (r2[mix] !== void 0) {
            cc.mandatory = cc.mandatory || {};
            cc.mandatory[oldname_(mix, key)] = r2[mix];
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
      const component = candidate.component;
      if (component === "rtp") {
        sdp2.push(1);
      } else if (component === "rtcp") {
        sdp2.push(2);
      } else {
        sdp2.push(component);
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
      let sessionId2;
      const version = sessVer !== void 0 ? sessVer : 2;
      if (sessId) {
        sessionId2 = sessId;
      } else {
        sessionId2 = SDPUtils2.generateSessionId();
      }
      const user = sessUser || "thisisadapterortc";
      return "v=0\r\no=" + user + " " + sessionId2 + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
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
      for (const key in parsedCandidate) {
        if (!(key in nativeCandidate)) {
          Object.defineProperty(
            nativeCandidate,
            key,
            { value: parsedCandidate[key] }
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
$c4dcfd1d1ea86647$var$EventEmitter.prototype.listeners = function listeners(event2) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2, handlers = this._events[evt];
  if (!handlers) return [];
  if (handlers.fn) return [
    handlers.fn
  ];
  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) ee[i] = handlers[i].fn;
  return ee;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.listenerCount = function listenerCount(event2) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2, listeners2 = this._events[evt];
  if (!listeners2) return 0;
  if (listeners2.fn) return 1;
  return listeners2.length;
};
$c4dcfd1d1ea86647$var$EventEmitter.prototype.emit = function emit(event2, a1, a2, a3, a4, a5) {
  var evt = $c4dcfd1d1ea86647$var$prefix ? $c4dcfd1d1ea86647$var$prefix + event2 : event2;
  if (!this._events[evt]) return false;
  var listeners2 = this._events[evt], len = arguments.length, args, i;
  if (listeners2.fn) {
    if (listeners2.once) this.removeListener(event2, listeners2.fn, void 0, true);
    switch (len) {
      case 1:
        return listeners2.fn.call(listeners2.context), true;
      case 2:
        return listeners2.fn.call(listeners2.context, a1), true;
      case 3:
        return listeners2.fn.call(listeners2.context, a1, a2), true;
      case 4:
        return listeners2.fn.call(listeners2.context, a1, a2, a3), true;
      case 5:
        return listeners2.fn.call(listeners2.context, a1, a2, a3, a4), true;
      case 6:
        return listeners2.fn.call(listeners2.context, a1, a2, a3, a4, a5), true;
    }
    for (i = 1, args = new Array(len - 1); i < len; i++) args[i - 1] = arguments[i];
    listeners2.fn.apply(listeners2.context, args);
  } else {
    var length = listeners2.length, j;
    for (i = 0; i < length; i++) {
      if (listeners2[i].once) this.removeListener(event2, listeners2[i].fn, void 0, true);
      switch (len) {
        case 1:
          listeners2[i].fn.call(listeners2[i].context);
          break;
        case 2:
          listeners2[i].fn.call(listeners2[i].context, a1);
          break;
        case 3:
          listeners2[i].fn.call(listeners2[i].context, a1, a2);
          break;
        case 4:
          listeners2[i].fn.call(listeners2[i].context, a1, a2, a3);
          break;
        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) args[j - 1] = arguments[j];
          listeners2[i].fn.apply(listeners2[i].context, args);
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
  var listeners2 = this._events[evt];
  if (listeners2.fn) {
    if (listeners2.fn === fn && (!once2 || listeners2.once) && (!context || listeners2.context === context)) $c4dcfd1d1ea86647$var$clearEvent(this, evt);
  } else {
    for (var i = 0, events = [], length = listeners2.length; i < length; i++) if (listeners2[i].fn !== fn || once2 && !listeners2[i].once || context && listeners2[i].context !== context) events.push(listeners2[i]);
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
  constructor(secure, host, port, path, key, pingInterval = 5e3) {
    super();
    this.pingInterval = pingInterval;
    this._disconnected = true;
    this._messagesQueue = [];
    const wsProtocol = secure ? "wss://" : "ws://";
    this._baseUrl = wsProtocol + host + ":" + port + path + "peerjs?key=" + key;
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
    const { host, port, path, key } = this._options;
    const url = new URL(`${protocol}://${host}:${port}${path}${key}/${method}`);
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
const peerConnections = writable({});
const onlinePeers = writable([]);
const typingUsers = writable({});
let localPeer = null;
let localUsername = null;
let repoFullName = null;
let sessionId = null;
let leaderCommitInterval = null;
let failedConnections = /* @__PURE__ */ new Set();
function generatePeerId(repoFullName2, username, sessionId2) {
  const base = `${repoFullName2.replace("/", "-")}-${username}-${sessionId2}`;
  return base.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
}
function getLocalPeerId() {
  return localPeer == null ? void 0 : localPeer.id;
}
function shutdownPeerManager() {
  console.log("[PeerJS] Shutting down peer manager");
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
  if (leadershipPeer) {
    leadershipPeer.destroy();
    leadershipPeer = null;
  }
  if (connectedToLeader) {
    connectedToLeader.close();
    connectedToLeader = null;
  }
  isCurrentLeader = false;
  peerRegistry.clear();
  const conns = get(peerConnections);
  Object.entries(conns).forEach(([peerId, { conn }]) => {
    console.log("[PeerJS] Closing connection to:", peerId);
    if (conn && conn.open) {
      conn.close();
    }
  });
  if (localPeer) {
    localPeer.destroy();
    localPeer = null;
  }
  peerConnections.set({});
  onlinePeers.set([]);
  typingUsers.set({});
  failedConnections.clear();
  if (leaderCommitInterval) {
    clearInterval(leaderCommitInterval);
    leaderCommitInterval = null;
  }
  console.log("[PeerJS] Shutdown complete");
}
function initializePeerManager({ _token, _repoFullName, _username, _sessionId }) {
  console.log("[PeerJS] Initializing peer manager:", { _repoFullName, _username, _sessionId });
  if (localPeer && repoFullName === _repoFullName && sessionId === _sessionId && localPeer.open) {
    console.log("[PeerJS] Already connected to this repo with same session, skipping initialization");
    return;
  }
  if (localPeer) {
    console.log("[PeerJS] Switching from", repoFullName, "to", _repoFullName, "or session changed");
    shutdownPeerManager();
  }
  localUsername = _username;
  repoFullName = _repoFullName;
  sessionId = _sessionId;
  const peerId = generatePeerId(repoFullName, localUsername, sessionId);
  console.log("[PeerJS] Generated peer ID:", peerId);
  localPeer = new $416260bce337df90$export$ecd1fc136c422448(peerId, {
    debug: 2,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    }
  });
  localPeer.on("open", (id) => {
    console.log("[PeerJS] Connected to PeerJS server with ID:", id);
    startPeerDiscovery();
    initializeCallHandling();
  });
  localPeer.on("connection", (conn) => {
    console.log("[PeerJS] ✅ Incoming connection from:", conn.peer, "metadata:", conn.metadata);
    handleIncomingConnection(conn);
  });
  localPeer.on("error", (err) => {
    console.error("[PeerJS] Peer error:", err);
  });
  localPeer.on("disconnected", () => {
    console.log("[PeerJS] Disconnected from PeerJS server");
  });
  localPeer.on("close", () => {
    console.log("[PeerJS] Peer connection closed");
  });
}
function startPeerDiscovery() {
  console.log("[PeerJS] Peer manager initialized for repo:", repoFullName);
  console.log("[PeerJS] Peer ID:", localPeer.id);
  initializeDiscoverySystem();
}
let isCurrentLeader = false;
let leadershipPeer = null;
let connectedToLeader = null;
let peerRegistry = /* @__PURE__ */ new Map();
let healthCheckInterval = null;
async function initializeDiscoverySystem() {
  var _a2;
  const auth = get(authStore);
  if (!((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login)) {
    console.log("[Discovery] No GitHub auth available");
    return;
  }
  const orgId = repoFullName.split("/")[0];
  const leaderId = `skygit_discovery_${orgId}`;
  console.log("[Discovery] Initializing for org:", orgId, "Leader ID:", leaderId);
  loadContacts(orgId);
  const connected = await tryConnectToLeader(leaderId);
  console.log("[Discovery] Connection attempt result:", connected);
  if (!connected) {
    console.log("[Discovery] No leader found, attempting to become leader");
    await attemptLeadership(leaderId, orgId);
  }
  console.log("[Discovery] Starting health check system");
  startHealthCheckSystem(orgId);
}
async function tryConnectToLeader(leaderId) {
  console.log("[Discovery] Attempting to connect to leader:", leaderId);
  try {
    const conn = await connectToPeerWithTimeout(leaderId, 3e3);
    if (conn) {
      console.log("[Discovery] ✅ Connected to leader");
      connectedToLeader = conn;
      setupLeaderConnection(conn);
      return true;
    }
  } catch (error) {
    console.log("[Discovery] Leader unavailable:", error.message);
  }
  return false;
}
function connectToPeerWithTimeout(peerId, timeout = 5e3) {
  return new Promise((resolve, reject) => {
    const conn = localPeer.connect(peerId, {
      metadata: { username: localUsername, type: "discovery" }
    });
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        conn.close();
        reject(new Error("Connection timeout"));
      }
    }, timeout);
    conn.on("open", () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(conn);
      }
    });
    conn.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}
async function attemptLeadership(leaderId, orgId) {
  console.log("[Discovery] Attempting to claim leadership:", leaderId);
  try {
    const success = await claimLeadershipSlot(leaderId, orgId);
    if (success) {
      console.log("[Discovery] 👑 Became leader");
      isCurrentLeader = true;
    } else {
      console.log("[Discovery] Leadership already taken, operating as regular peer");
    }
  } catch (error) {
    console.log("[Discovery] Failed to claim leadership:", error.message);
  }
}
function claimLeadershipSlot(leaderId, orgId) {
  return new Promise((resolve, reject) => {
    const leader = new $416260bce337df90$export$ecd1fc136c422448(leaderId, {
      debug: 0
      // Reduce PeerJS debug noise
    });
    let resolved = false;
    const claimTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        leader.destroy();
        reject(new Error("Leadership claim timeout"));
      }
    }, 5e3);
    leader.on("open", (id) => {
      if (!resolved && id === leaderId) {
        resolved = true;
        clearTimeout(claimTimeout);
        leadershipPeer = leader;
        setupLeadershipRole();
        resolve(true);
      }
    });
    leader.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(claimTimeout);
        if (err.type === "unavailable-id") {
          resolve(false);
        } else {
          reject(err);
        }
      }
    });
  });
}
function setupLeadershipRole(orgId) {
  console.log("[Discovery] Setting up leadership responsibilities");
  peerRegistry.set(localPeer.id, {
    username: localUsername,
    conversations: [repoFullName],
    lastSeen: Date.now(),
    connection: null,
    // Leaders don't have a connection to themselves
    isLeader: true
  });
  console.log("[Discovery] Leader registered self in peer registry");
  leadershipPeer.on("connection", (conn) => {
    console.log("[Discovery] New peer connected to leader:", conn.peer);
    setupPeerConnection(conn);
  });
  startLeaderMaintenanceTasks();
}
function setupPeerConnection(conn) {
  conn.on("open", () => {
    console.log("[Discovery] Peer connection opened:", conn.peer);
  });
  conn.on("data", (data) => {
    handleLeaderMessage(data, conn);
  });
  conn.on("close", () => {
    console.log("[Discovery] Peer disconnected:", conn.peer);
    peerRegistry.delete(conn.peer);
    broadcastPeerListUpdate();
  });
  conn.on("error", (err) => {
    console.warn("[Discovery] Peer connection error:", err);
    peerRegistry.delete(conn.peer);
  });
}
function handleLeaderMessage(data, conn) {
  switch (data.type) {
    case "register":
      console.log("[Discovery] Registering peer:", conn.peer, "username:", data.username);
      peerRegistry.set(conn.peer, {
        username: data.username,
        conversations: data.conversations || [],
        lastSeen: Date.now(),
        connection: conn,
        isLeader: false
      });
      sendPeerRegistry(conn);
      broadcastPeerListUpdate();
      break;
    case "request_peers":
      sendPeerRegistry(conn);
      break;
    case "update_conversations":
      const peerInfo = peerRegistry.get(conn.peer);
      if (peerInfo) {
        peerInfo.conversations = data.conversations;
        peerInfo.lastSeen = Date.now();
      }
      break;
    case "heartbeat":
      const peer = peerRegistry.get(conn.peer);
      if (peer) {
        peer.lastSeen = Date.now();
      }
      break;
  }
}
function sendPeerRegistry(conn) {
  const peerList = Array.from(peerRegistry.entries()).map(([peerId, info]) => ({
    peerId,
    username: info.username,
    conversations: info.conversations,
    isLeader: info.isLeader || false,
    lastSeen: info.lastSeen
  }));
  console.log(`[Discovery] Sending complete peer registry to ${conn.peer}:`, peerList);
  conn.send({
    type: "peer_registry",
    peers: peerList,
    orgId: repoFullName.split("/")[0]
  });
}
function sendPeerList(conn, conversationFilter) {
  const filteredPeers = Array.from(peerRegistry.entries()).filter(([peerId, info]) => {
    return true;
  }).map(([peerId, info]) => ({
    peerId,
    username: info.username,
    conversations: info.conversations,
    isLeader: info.isLeader || false
  }));
  console.log(`[Discovery] Sending peer list to ${conn.peer}:`, filteredPeers);
  conn.send({
    type: "peer_list",
    peers: filteredPeers
  });
}
function broadcastPeerListUpdate() {
  for (const [peerId, info] of peerRegistry.entries()) {
    if (info.connection && info.connection.open) {
      sendPeerList(info.connection);
    }
  }
}
function startLeaderMaintenanceTasks() {
  setInterval(() => {
    performLeaderMaintenance();
  }, 3e4);
}
function performLeaderMaintenance() {
  const now2 = Date.now();
  const STALE_THRESHOLD = 6e4;
  console.log("[Discovery] Performing leader maintenance, current peers:", peerRegistry.size);
  for (const [peerId, info] of peerRegistry.entries()) {
    if (peerId !== localPeer.id && now2 - info.lastSeen > STALE_THRESHOLD) {
      console.log("[Discovery] Removing stale peer:", peerId);
      peerRegistry.delete(peerId);
      if (info.connection && info.connection.open) {
        info.connection.close();
      }
    }
  }
}
function stepDownFromLeadership() {
  console.log("[Discovery] Stepping down from leadership");
  for (const [peerId, info] of peerRegistry.entries()) {
    if (info.connection && info.connection.open) {
      info.connection.send({
        type: "leadership_change",
        message: "Leader stepping down, reconnect to discovery system"
      });
    }
  }
  if (leadershipPeer) {
    leadershipPeer.destroy();
    leadershipPeer = null;
  }
  isCurrentLeader = false;
  peerRegistry.clear();
}
function startHealthCheckSystem(orgId) {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  healthCheckInterval = setInterval(() => {
    if (isCurrentLeader) {
      return;
    } else if (connectedToLeader) {
      checkLeaderHealth(orgId);
    } else {
      tryReconnectToLeader(orgId);
    }
  }, 1e4);
}
function checkLeaderHealth(orgId) {
  if (!connectedToLeader || connectedToLeader.open === false) {
    console.log("[Discovery] Leader connection lost, attempting reconnection");
    connectedToLeader = null;
    tryReconnectToLeader(orgId);
    return;
  }
  try {
    connectedToLeader.send({
      type: "heartbeat",
      timestamp: Date.now()
    });
  } catch (error) {
    console.warn("[Discovery] Failed to send heartbeat to leader:", error);
    connectedToLeader = null;
    tryReconnectToLeader(orgId);
  }
}
async function tryReconnectToLeader(orgId) {
  const leaderId = `skygit_discovery_${orgId}`;
  const connected = await tryConnectToLeader(leaderId);
  if (!connected) {
    console.log("[Discovery] No leader available, attempting to become leader");
    await attemptLeadership(leaderId, orgId);
  }
}
function setupLeaderConnection(conn) {
  console.log("[Discovery] Setting up connection to leader");
  conn.on("data", (data) => {
    handleLeaderResponse(data);
  });
  conn.on("close", () => {
    console.log("[Discovery] Leader connection closed");
    connectedToLeader = null;
  });
  conn.on("error", (err) => {
    console.warn("[Discovery] Leader connection error:", err);
    connectedToLeader = null;
  });
  registerWithLeader(conn);
}
function registerWithLeader(conn) {
  conn.send({
    type: "register",
    username: localUsername,
    conversations: [repoFullName],
    // Register for this repo's conversations
    timestamp: Date.now()
  });
}
function handleLeaderResponse(data) {
  switch (data.type) {
    case "peer_registry":
      console.log("[Discovery] Received peer registry:", data.peers, "for org:", data.orgId);
      updateKnownPeers(data.peers);
      storePeerRegistry(data.peers, data.orgId);
      connectToOrgPeers(data.peers);
      break;
    case "peer_list":
      console.log("[Discovery] Received peer list:", data.peers);
      updateKnownPeers(data.peers);
      break;
    case "leadership_change":
      console.log("[Discovery] Leadership change detected, reconnecting");
      connectedToLeader = null;
      const orgId = repoFullName.split("/")[0];
      setTimeout(() => tryReconnectToLeader(orgId), 1e3);
      break;
  }
}
function storePeerRegistry(peers, orgId) {
  const orgPeers = peers.map((peer) => ({
    peerId: peer.peerId,
    username: peer.username,
    conversations: peer.conversations,
    isLeader: peer.isLeader,
    lastSeen: peer.lastSeen,
    online: true
    // Assume online since received from leader
  }));
  const key = `skygit_peers_${orgId}`;
  localStorage.setItem(key, JSON.stringify(orgPeers));
  console.log("[Discovery] Stored", orgPeers.length, "peers for org:", orgId);
  orgPeers.forEach((peer) => {
    updateContact(peer.username, {
      peerId: peer.peerId,
      username: peer.username,
      conversations: peer.conversations,
      isLeader: peer.isLeader,
      lastSeen: peer.lastSeen,
      online: false
      // Will be updated when actual connections are made
    });
  });
}
function connectToOrgPeers(peers) {
  console.log("[Discovery] Connecting to all org peers:", peers.length);
  for (const peer of peers) {
    if (peer.peerId !== localPeer.id) {
      const conns = get(peerConnections);
      if (!conns[peer.peerId] && !failedConnections.has(peer.peerId)) {
        console.log("[Discovery] 🔄 Connecting to org peer:", peer.peerId, "username:", peer.username);
        connectToPeer(peer.peerId, peer.username);
      } else if (conns[peer.peerId]) {
        console.log("[Discovery] Already connected to peer:", peer.peerId);
      } else {
        console.log("[Discovery] Skipping failed peer:", peer.peerId);
      }
    }
  }
}
function updateKnownPeers(peers) {
  console.log("[Discovery] Processing peer list, found", peers.length, "peers");
  for (const peer of peers) {
    console.log("[Discovery] Processing peer:", peer.peerId, "username:", peer.username, "isLeader:", peer.isLeader);
    if (peer.peerId !== localPeer.id) {
      const conns = get(peerConnections);
      if (!conns[peer.peerId] && !failedConnections.has(peer.peerId)) {
        console.log("[Discovery] 🔄 Connecting to discovered peer:", peer.peerId, "username:", peer.username);
        connectToPeer(peer.peerId, peer.username);
      } else if (conns[peer.peerId]) {
        console.log("[Discovery] Already connected to peer:", peer.peerId);
      } else {
        console.log("[Discovery] Skipping failed peer:", peer.peerId);
      }
    } else {
      console.log("[Discovery] Skipping self:", peer.peerId);
    }
  }
}
function handleIncomingConnection(conn) {
  var _a2;
  console.log("[PeerJS] Setting up incoming connection from:", conn.peer);
  console.log("[PeerJS] Connection metadata:", conn.metadata);
  const username = ((_a2 = conn.metadata) == null ? void 0 : _a2.username) || "Unknown";
  conn.on("open", () => {
    console.log("[PeerJS] ✅ Incoming connection opened from:", conn.peer, "username:", username);
    addPeerConnection(conn, username);
  });
  conn.on("data", (data) => {
    console.log("[PeerJS] Received data from:", conn.peer, data);
    handlePeerMessage(data, conn.peer, username);
  });
  conn.on("close", () => {
    console.log("[PeerJS] Incoming connection closed from:", conn.peer);
    removePeerConnection(conn.peer);
  });
  conn.on("error", (err) => {
    console.error("[PeerJS] ❌ Incoming connection error from:", conn.peer, err);
    removePeerConnection(conn.peer);
  });
}
function connectToPeer(targetPeerId, username) {
  console.log("[PeerJS] Connecting to peer:", targetPeerId, "username:", username);
  console.log("[PeerJS] Local peer ID:", localPeer == null ? void 0 : localPeer.id, "Local peer open:", localPeer == null ? void 0 : localPeer.open);
  if (!localPeer) {
    console.error("[PeerJS] Local peer not initialized");
    return;
  }
  if (!localPeer.open) {
    console.error("[PeerJS] Local peer not connected to signaling server yet");
    return;
  }
  const conns = get(peerConnections);
  if (conns[targetPeerId]) {
    console.log("[PeerJS] Already have connection to:", targetPeerId);
    return;
  }
  console.log("[PeerJS] Initiating connection to:", targetPeerId);
  const conn = localPeer.connect(targetPeerId, {
    metadata: {
      username: localUsername,
      repo: repoFullName,
      sessionId
    }
  });
  console.log("[PeerJS] Connection object created:", conn);
  conn.on("open", () => {
    console.log("[PeerJS] ✅ Outgoing connection opened to:", targetPeerId);
    addPeerConnection(conn, username);
  });
  conn.on("data", (data) => {
    console.log("[PeerJS] Received data from:", targetPeerId, data);
    handlePeerMessage(data, targetPeerId, username);
  });
  conn.on("close", () => {
    console.log("[PeerJS] Outgoing connection closed to:", targetPeerId);
    removePeerConnection(targetPeerId);
  });
  conn.on("error", (err) => {
    console.error("[PeerJS] ❌ Outgoing connection error to:", targetPeerId, err);
    removePeerConnection(targetPeerId);
    failedConnections.add(targetPeerId);
    setTimeout(() => {
      failedConnections.delete(targetPeerId);
    }, 6e4);
  });
  return conn;
}
function addPeerConnection(conn, username = null) {
  var _a2;
  const peerId = conn.peer;
  const extractedUsername = username || ((_a2 = conn.metadata) == null ? void 0 : _a2.username) || "Unknown";
  console.log("[PeerJS] Adding peer connection:", peerId, "username:", extractedUsername);
  peerConnections.update((conns) => {
    conns[peerId] = {
      conn,
      status: "connected",
      username: extractedUsername
    };
    return conns;
  });
  updateContact(extractedUsername, {
    online: true,
    lastSeen: Date.now(),
    peerId
  });
  updateOnlinePeers();
  syncConversationsWithPeer(peerId);
}
function syncConversationsWithPeer(peerId) {
  console.log("[PeerJS] Starting conversation sync with peer:", peerId);
  const conversationsMap = get(conversations);
  const repoConversations = conversationsMap[repoFullName] || [];
  repoConversations.forEach((conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage.hash) {
        console.log("[PeerJS] Requesting sync for conversation:", conversation.id, "last hash:", lastMessage.hash);
        requestMessageSync(peerId, conversation.id, lastMessage.hash);
      }
    }
  });
}
function removePeerConnection(peerId) {
  var _a2;
  console.log("[PeerJS] Removing peer connection:", peerId);
  const conns = get(peerConnections);
  const username = (_a2 = conns[peerId]) == null ? void 0 : _a2.username;
  peerConnections.update((conns2) => {
    delete conns2[peerId];
    return conns2;
  });
  typingUsers.update((users) => {
    delete users[peerId];
    return users;
  });
  if (username) {
    updateContact(username, {
      online: false,
      lastSeen: Date.now()
    });
  }
  if (isCurrentLeader && peerRegistry.has(peerId)) {
    console.log("[Discovery] Removing disconnected peer from registry:", peerId);
    peerRegistry.delete(peerId);
    broadcastPeerListUpdate();
  }
  failedConnections.add(peerId);
  setTimeout(() => {
    failedConnections.delete(peerId);
  }, 5e3);
  updateOnlinePeers();
}
function updateOnlinePeers() {
  const conns = get(peerConnections);
  const peers = Object.entries(conns).map(([peerId, { username }]) => ({
    session_id: peerId,
    username,
    last_seen: Date.now()
  }));
  onlinePeers.set(peers);
}
function handlePeerMessage(data, fromPeerId, fromUsername = null) {
  var _a2;
  const username = fromUsername || ((_a2 = get(peerConnections)[fromPeerId]) == null ? void 0 : _a2.username) || "Unknown";
  console.log("[PeerJS] Handling message from:", username, data);
  if (!data || typeof data !== "object") {
    console.warn("[PeerJS] Invalid message format:", data);
    return;
  }
  switch (data.type) {
    case "chat":
      handleChatMessage(data, username, fromPeerId);
      break;
    case "presence":
      handlePresenceMessage(data, username);
      break;
    case "typing":
      handleTypingMessage(data, username, fromPeerId);
      break;
    case "sync_request":
      handleSyncRequest(data, fromPeerId);
      break;
    case "sync_request_chain":
      handleSyncRequestWithChain(data, fromPeerId);
      break;
    case "sync_response":
      handleSyncResponse(data, fromPeerId);
      break;
    case "sync_needs_chain":
      if (data.conversationId) {
        const conversationsMap = get(conversations);
        const repoConversations = conversationsMap[repoFullName] || [];
        const conversation = repoConversations.find((c) => c.id === data.conversationId);
        if (conversation && conversation.messages) {
          const hashChain = getRecentHashes(conversation.messages, 100);
          requestSyncWithHashChain(fromPeerId, data.conversationId, hashChain);
        }
      }
      break;
    case "messages_committed":
      handleCommittedMessages(data, fromPeerId);
      break;
    default:
      console.log("[PeerJS] Unknown message type:", data.type);
      break;
  }
}
function handleChatMessage(msg, fromUsername, fromPeerId) {
  console.log("[PeerJS] Received chat message from", fromUsername, "(", fromPeerId, "):", msg);
  if (!msg || !msg.conversationId || !msg.content) {
    console.warn("[PeerJS] Invalid chat message format:", msg);
    return;
  }
  if (fromPeerId === localPeer.id) {
    console.log("[PeerJS] Ignoring message from same session");
    return;
  }
  const messageData = {
    id: msg.id || crypto.randomUUID(),
    sender: fromUsername,
    content: msg.content,
    timestamp: msg.timestamp || Date.now(),
    hash: msg.hash || null,
    in_response_to: msg.in_response_to || null
  };
  appendMessage(msg.conversationId, repoFullName, messageData);
  setLastMessage(fromUsername, messageData);
  updateContact(fromUsername, {
    online: true,
    lastSeen: Date.now()
  });
  if (isLeader()) {
    console.log("[PeerJS] Queueing message for commit (I am leader)");
    queueConversationForCommit(repoFullName, msg.conversationId);
  } else {
    console.log("[PeerJS] Skipping commit queue (not leader), current leader:", getCurrentLeader());
  }
}
function handlePresenceMessage(msg, fromUsername) {
  console.log("[PeerJS] Received presence message from", fromUsername, ":", msg);
}
function handleTypingMessage(msg, fromUsername, fromPeerId) {
  console.log("[PeerJS] Received typing message from", fromUsername, "(", fromPeerId, "):", msg);
  if (!msg || typeof msg.isTyping !== "boolean") {
    console.warn("[PeerJS] Invalid typing message format:", msg);
    return;
  }
  typingUsers.update((users) => {
    const updated = { ...users };
    if (msg.isTyping) {
      updated[fromPeerId] = {
        isTyping: true,
        lastTypingTime: Date.now(),
        username: fromUsername
      };
    } else {
      delete updated[fromPeerId];
    }
    return updated;
  });
  if (msg.isTyping) {
    setTimeout(() => {
      typingUsers.update((users) => {
        const updated = { ...users };
        const userTyping = updated[fromPeerId];
        if (userTyping && Date.now() - userTyping.lastTypingTime >= 3e3) {
          delete updated[fromPeerId];
        }
        return updated;
      });
    }, 3e3);
  }
}
function sendMessageToPeer(peerId, message) {
  console.log("[PeerJS] Sending message to peer:", peerId, message);
  const conns = get(peerConnections);
  const peerConn = conns[peerId];
  if (peerConn && peerConn.conn) {
    peerConn.conn.send(message);
    console.log("[PeerJS] Message sent successfully");
  } else {
    console.warn("[PeerJS] No connection found for peer:", peerId);
  }
}
function broadcastMessage(message, conversationId = null) {
  console.log("[PeerJS] Broadcasting message:", message, "to conversation:", conversationId);
  const conns = get(peerConnections);
  const participantPeers = getConversationParticipants(conversationId);
  console.log("[PeerJS] Conversation participants:", participantPeers);
  console.log("[PeerJS] Available connections:", Object.keys(conns));
  if (participantPeers.length === 0) {
    console.warn("[PeerJS] No participants found for conversation:", conversationId);
    return;
  }
  let sentCount = 0;
  Object.entries(conns).forEach(([peerId, { conn, status, username }]) => {
    const isParticipant = participantPeers.some(
      (p) => p.peerId === peerId || p.username === username
    );
    if (!isParticipant) {
      console.log("[PeerJS] Skipping non-participant:", peerId, username);
      return;
    }
    console.log("[PeerJS] Attempting to send to participant:", peerId, "status:", status, "connection open:", conn == null ? void 0 : conn.open);
    if (conn && status === "connected" && conn.open) {
      try {
        conn.send(message);
        console.log("[PeerJS] ✅ Message sent to participant:", peerId, username);
        sentCount++;
      } catch (err) {
        console.error("[PeerJS] ❌ Failed to send message to:", peerId, err);
      }
    } else {
      console.warn("[PeerJS] ⚠️ Skipping participant (not connected):", peerId, "status:", status);
    }
  });
  console.log("[PeerJS] Message broadcast completed. Sent to", sentCount, "participants");
}
function broadcastToAllPeers(message) {
  console.log("[PeerJS] Broadcasting to all connected peers:", message);
  const conns = get(peerConnections);
  const peerCount = Object.keys(conns).length;
  if (peerCount === 0) {
    console.warn("[PeerJS] No peer connections available for broadcasting!");
    return;
  }
  Object.entries(conns).forEach(([peerId, { conn, status }]) => {
    if (conn && status === "connected" && conn.open) {
      try {
        conn.send(message);
        console.log("[PeerJS] ✅ Message sent to:", peerId);
      } catch (err) {
        console.error("[PeerJS] ❌ Failed to send message to:", peerId, err);
      }
    }
  });
}
function getConversationParticipants(conversationId) {
  if (!conversationId) {
    console.warn("[PeerJS] No conversation ID provided, broadcasting to all peers");
    const conns2 = get(peerConnections);
    return Object.entries(conns2).map(([peerId, { username }]) => ({
      peerId,
      username
    }));
  }
  try {
    const conversationsMap = get(conversations);
    const repoConversations = conversationsMap[repoFullName] || [];
    const conversation = repoConversations.find((c) => c.id === conversationId);
    if (conversation && conversation.participants) {
      console.log("[PeerJS] Found conversation participants:", conversation.participants);
      const conns2 = get(peerConnections);
      const participantPeers = [];
      conversation.participants.forEach((username) => {
        const connEntry = Object.entries(conns2).find(
          ([peerId, { username: connUsername }]) => connUsername === username
        );
        if (connEntry) {
          participantPeers.push({
            peerId: connEntry[0],
            username
          });
        } else {
          participantPeers.push({
            peerId: null,
            username
          });
        }
      });
      return participantPeers;
    }
  } catch (error) {
    console.error("[PeerJS] Failed to get conversation participants from store:", error);
  }
  const orgId = repoFullName == null ? void 0 : repoFullName.split("/")[0];
  if (orgId) {
    try {
      const key = `skygit_peers_${orgId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const peers = JSON.parse(stored);
        console.log("[PeerJS] Using all org peers as participants:", peers.length);
        return peers.map((peer) => ({
          peerId: peer.peerId,
          username: peer.username
        }));
      }
    } catch (error) {
      console.error("[PeerJS] Failed to get org peers:", error);
    }
  }
  console.log("[PeerJS] Using all connected peers as participants");
  const conns = get(peerConnections);
  return Object.entries(conns).map(([peerId, { username }]) => ({
    peerId,
    username
  }));
}
function getCurrentLeader() {
  const conns = get(peerConnections);
  const allPeerIds = [localPeer == null ? void 0 : localPeer.id, ...Object.keys(conns)].filter(Boolean);
  return allPeerIds.sort()[0];
}
function isLeader() {
  return getCurrentLeader() === (localPeer == null ? void 0 : localPeer.id);
}
function maybeStartLeaderCommitInterval() {
  const conns = get(peerConnections);
  const hasPeers = Object.keys(conns).length > 0;
  if (isLeader() && hasPeers) {
    if (!leaderCommitInterval) {
      console.log("[PeerJS] Starting leader commit interval");
      leaderCommitInterval = setInterval(() => {
        if (isLeader()) {
          flushConversationCommitQueue();
        }
      }, 10 * 60 * 1e3);
    }
  } else if (leaderCommitInterval) {
    console.log("[PeerJS] Stopping leader commit interval - no peers or not leader");
    clearInterval(leaderCommitInterval);
    leaderCommitInterval = null;
  }
}
peerConnections.subscribe(() => {
  maybeStartLeaderCommitInterval();
});
function requestMessageSync(peerId, conversationId, lastHash) {
  console.log("[PeerJS] Requesting message sync from peer:", peerId, "conversation:", conversationId, "lastHash:", lastHash);
  const message = {
    type: "sync_request",
    conversationId,
    lastHash,
    timestamp: Date.now()
  };
  sendMessageToPeer(peerId, message);
}
function requestSyncWithHashChain(peerId, conversationId, hashChain) {
  console.log("[PeerJS] Requesting sync with hash chain from peer:", peerId, "chain length:", hashChain.length);
  const message = {
    type: "sync_request_chain",
    conversationId,
    hashChain,
    // Array of last 100 hashes, newest first
    timestamp: Date.now()
  };
  sendMessageToPeer(peerId, message);
}
function handleSyncRequest(msg, fromPeerId) {
  console.log("[PeerJS] Received sync request from", fromPeerId, "for conversation:", msg.conversationId);
  if (!msg.conversationId || !msg.lastHash) {
    console.warn("[PeerJS] Invalid sync request format:", msg);
    return;
  }
  const conversationsMap = get(conversations);
  const repoConversations = conversationsMap[repoFullName] || [];
  const conversation = repoConversations.find((c) => c.id === msg.conversationId);
  if (!conversation || !conversation.messages) {
    console.warn("[PeerJS] Conversation not found:", msg.conversationId);
    sendMessageToPeer(fromPeerId, {
      type: "sync_response",
      conversationId: msg.conversationId,
      messages: [],
      error: "Conversation not found"
    });
    return;
  }
  const lastHashIndex = conversation.messages.findIndex((m) => m.hash === msg.lastHash);
  if (lastHashIndex === -1) {
    console.warn("[PeerJS] Hash not found in conversation:", msg.lastHash);
    sendMessageToPeer(fromPeerId, {
      type: "sync_needs_chain",
      conversationId: msg.conversationId,
      error: "Hash not found, please send hash chain"
    });
    return;
  }
  const messagesToSend = conversation.messages.slice(lastHashIndex + 1);
  console.log("[PeerJS] Sending", messagesToSend.length, "messages after hash:", msg.lastHash);
  sendMessageToPeer(fromPeerId, {
    type: "sync_response",
    conversationId: msg.conversationId,
    messages: messagesToSend
  });
}
function handleSyncRequestWithChain(msg, fromPeerId) {
  console.log("[PeerJS] Received sync request with hash chain from", fromPeerId);
  if (!msg.conversationId || !msg.hashChain || !Array.isArray(msg.hashChain)) {
    console.warn("[PeerJS] Invalid sync chain request format:", msg);
    return;
  }
  const conversationsMap = get(conversations);
  const repoConversations = conversationsMap[repoFullName] || [];
  const conversation = repoConversations.find((c) => c.id === msg.conversationId);
  if (!conversation || !conversation.messages) {
    console.warn("[PeerJS] Conversation not found:", msg.conversationId);
    sendMessageToPeer(fromPeerId, {
      type: "sync_response",
      conversationId: msg.conversationId,
      messages: [],
      error: "Conversation not found"
    });
    return;
  }
  const ourHashes = getRecentHashes(conversation.messages, 100);
  const commonHash = findCommonAncestor(msg.hashChain, ourHashes);
  if (!commonHash) {
    console.warn("[PeerJS] No common ancestor found with peer");
    sendMessageToPeer(fromPeerId, {
      type: "sync_response",
      conversationId: msg.conversationId,
      messages: conversation.messages,
      fullSync: true
    });
    return;
  }
  const commonIndex = conversation.messages.findIndex((m) => m.hash === commonHash);
  const messagesToSend = conversation.messages.slice(commonIndex + 1);
  console.log("[PeerJS] Found common ancestor:", commonHash, "sending", messagesToSend.length, "messages");
  sendMessageToPeer(fromPeerId, {
    type: "sync_response",
    conversationId: msg.conversationId,
    messages: messagesToSend,
    commonAncestor: commonHash
  });
}
function handleSyncResponse(msg, fromPeerId) {
  var _a2;
  console.log("[PeerJS] Received sync response from", fromPeerId, "with", ((_a2 = msg.messages) == null ? void 0 : _a2.length) || 0, "messages");
  if (!msg.conversationId || !msg.messages) {
    console.warn("[PeerJS] Invalid sync response format:", msg);
    return;
  }
  const validMessages = msg.messages.filter((message) => message.content && message.sender).map((message) => ({
    id: message.id || crypto.randomUUID(),
    sender: message.sender,
    content: message.content,
    timestamp: message.timestamp || Date.now(),
    hash: message.hash || null,
    in_response_to: message.in_response_to || null
  }));
  if (validMessages.length > 0) {
    appendMessages(msg.conversationId, repoFullName, validMessages);
    if (isLeader()) {
      console.log("[PeerJS] Queueing synced messages for commit (I am leader)");
      queueConversationForCommit(repoFullName, msg.conversationId);
    }
  }
}
function broadcastTypingStatus(isTyping) {
  const message = {
    type: "typing",
    isTyping,
    timestamp: Date.now()
  };
  broadcastToAllPeers(message);
}
function updateMyConversations(conversations2) {
  if (isCurrentLeader && peerRegistry.has(localPeer.id)) {
    const myInfo = peerRegistry.get(localPeer.id);
    myInfo.conversations = conversations2;
    myInfo.lastSeen = Date.now();
    console.log("[Discovery] Leader updated own conversations:", conversations2);
  }
  if (connectedToLeader && connectedToLeader.open) {
    connectedToLeader.send({
      type: "update_conversations",
      conversations: conversations2
    });
    console.log("[Discovery] Notified leader of conversation update:", conversations2);
  }
}
committedEvents.subscribe((event2) => {
  if (!event2) return;
  console.log("[PeerJS] Broadcasting committed messages:", event2);
  broadcastToAllPeers({
    type: "messages_committed",
    repoName: event2.repoName,
    conversationId: event2.convoId,
    messageIds: event2.messageIds,
    timestamp: Date.now()
  });
});
function handleCommittedMessages(msg, fromPeerId) {
  console.log("[PeerJS] Received committed messages notification from:", fromPeerId, msg);
  if (msg.repoName && msg.conversationId && msg.messageIds) {
    markMessagesCommitted(msg.conversationId, msg.repoName, msg.messageIds);
  }
}
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (isCurrentLeader) {
      stepDownFromLeadership();
    }
    shutdownPeerManager();
  });
}
let currentCall = null;
function initializeCallHandling() {
  if (!localPeer) return;
  localPeer.on("call", async (call) => {
    console.log("[PeerJS] Incoming call from:", call.peer);
    if (get(callStatus) !== "idle") {
      console.log("[PeerJS] Already in a call, rejecting incoming call");
      call.close();
      return;
    }
    callStatus.set("incoming");
    remotePeerId.set(call.peer);
    currentCall = call;
    call.on("close", () => {
      console.log("[PeerJS] Call closed remotely");
      endCall();
    });
    call.on("error", (err) => {
      console.error("[PeerJS] Call error:", err);
      endCall();
    });
  });
}
async function startCall(peerId, video = true) {
  console.log("[PeerJS] Starting call to:", peerId, "video:", video);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video,
      audio: true
    });
    localStream.set(stream);
    callStatus.set("calling");
    remotePeerId.set(peerId);
    isVideoEnabled.set(video);
    const call = localPeer.call(peerId, stream, {
      metadata: {
        username: localUsername,
        type: "call"
      }
    });
    currentCall = call;
    setupCallEvents(call);
  } catch (err) {
    console.error("[PeerJS] Failed to get local stream:", err);
    alert("Could not access camera/microphone. Please check permissions.");
    resetCallState();
  }
}
async function answerCall() {
  console.log("[PeerJS] Answering call");
  if (!currentCall) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localStream.set(stream);
    currentCall.answer(stream);
    setupCallEvents(currentCall);
  } catch (err) {
    console.error("[PeerJS] Failed to get local stream for answer:", err);
    alert("Could not access camera/microphone. Please check permissions.");
    endCall();
  }
}
function setupCallEvents(call) {
  call.on("stream", (stream) => {
    console.log("[PeerJS] Received remote stream");
    remoteStream.set(stream);
    callStatus.set("connected");
    callStartTime.set(Date.now());
  });
  call.on("close", () => {
    console.log("[PeerJS] Call closed");
    endCall();
  });
  call.on("error", (err) => {
    console.error("[PeerJS] Call error:", err);
    endCall();
  });
}
function endCall() {
  console.log("[PeerJS] Ending call");
  if (currentCall) {
    currentCall.close();
    currentCall = null;
  }
  const lStream = get(localStream);
  if (lStream) {
    lStream.getTracks().forEach((track) => track.stop());
  }
  resetCallState();
}
function toggleAudio() {
  const stream = get(localStream);
  if (stream) {
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      isAudioEnabled.set(audioTrack.enabled);
    }
  }
}
function toggleVideo() {
  const stream = get(localStream);
  if (stream) {
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      isVideoEnabled.set(videoTrack.enabled);
    }
  }
}
async function toggleScreenShare() {
  const currentStream = get(localStream);
  const sharing = get(isScreenSharing);
  if (sharing) {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      const newVideoTrack = cameraStream.getVideoTracks()[0];
      const oldVideoTrack = currentStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        currentStream.removeTrack(oldVideoTrack);
      }
      currentStream.addTrack(newVideoTrack);
      if (currentCall && currentCall.peerConnection) {
        const senders = currentCall.peerConnection.getSenders();
        const videoSender = senders.find((s) => {
          var _a2;
          return ((_a2 = s.track) == null ? void 0 : _a2.kind) === "video";
        });
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }
      isScreenSharing.set(false);
      console.log("[PeerJS] Switched back to camera");
    } catch (err) {
      console.error("[PeerJS] Failed to switch back to camera:", err);
    }
  } else {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrack.onended = () => {
        toggleScreenShare();
      };
      const oldVideoTrack = currentStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        currentStream.removeTrack(oldVideoTrack);
      }
      currentStream.addTrack(screenTrack);
      if (currentCall && currentCall.peerConnection) {
        const senders = currentCall.peerConnection.getSenders();
        const videoSender = senders.find((s) => {
          var _a2;
          return ((_a2 = s.track) == null ? void 0 : _a2.kind) === "video";
        });
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        }
      }
      isScreenSharing.set(true);
      console.log("[PeerJS] Started screen sharing");
    } catch (err) {
      console.error("[PeerJS] Failed to start screen sharing:", err);
    }
  }
}
const contacts = writable({});
const lastMessages = writable({});
function loadContacts(orgId) {
  try {
    const key = `skygit_peers_${orgId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const peers = JSON.parse(stored);
      const contactMap = {};
      peers.forEach((peer) => {
        contactMap[peer.username] = {
          peerId: peer.peerId,
          username: peer.username,
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
  const conns = get(peerConnections);
  const currentContacts = get(contacts);
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
  contacts.update((contacts2) => ({
    ...contacts2,
    [username]: {
      ...contacts2[username],
      ...contactData
    }
  }));
}
function setLastMessage(username, message) {
  lastMessages.update((messages) => ({
    ...messages,
    [username]: {
      content: message.content,
      timestamp: message.timestamp,
      sender: message.sender
    }
  }));
}
const sortedContacts = derived(
  [contacts, lastMessages, peerConnections],
  ([$contacts, $lastMessages, $peerConnections]) => {
    const contactList = Object.values($contacts);
    contactList.forEach((contact) => {
      const conn = Object.values($peerConnections).find((c) => c.username === contact.username);
      contact.online = (conn == null ? void 0 : conn.status) === "connected";
      contact.userAgent = (conn == null ? void 0 : conn.userAgent) || 0;
    });
    return contactList.sort((a, b) => {
      var _a2, _b;
      if (a.online !== b.online) {
        return b.online - a.online;
      }
      const aLastMsg = ((_a2 = $lastMessages[a.username]) == null ? void 0 : _a2.timestamp) || 0;
      const bLastMsg = ((_b = $lastMessages[b.username]) == null ? void 0 : _b.timestamp) || 0;
      if (aLastMsg !== bLastMsg) {
        return bLastMsg - aLastMsg;
      }
      return a.username.localeCompare(b.username);
    });
  }
);
var root_2$9 = /* @__PURE__ */ template(`<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>`);
var root_3$7 = /* @__PURE__ */ template(`<div class="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></div>`);
var root_4$4 = /* @__PURE__ */ template(`<div class="absolute -top-1 -right-1 w-4 h-4 text-yellow-500"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></div>`);
var root_5$5 = /* @__PURE__ */ template(`<span class="text-green-600">online</span>`);
var root_6$4 = /* @__PURE__ */ template(`<span> </span>`);
var root_1$a = /* @__PURE__ */ template(`<div class="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"><div class="relative flex-shrink-0"><img> <!> <!></div> <div class="flex-1 min-w-0"><div class="flex items-center justify-between"><div class="font-medium text-gray-900 truncate"> </div> <div class="text-xs text-gray-500 flex items-center gap-1"><!></div></div> <div class="flex items-center justify-between text-sm text-gray-500"><div class="truncate"> <!></div></div></div></div>`);
var root_8$4 = /* @__PURE__ */ template(`<div class="text-center py-8"><div class="text-gray-400 mb-2"><svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div> <p class="text-sm text-gray-500">No contacts found</p> <p class="text-xs text-gray-400 mt-1">Connect to peers to see contacts</p></div>`);
var root$9 = /* @__PURE__ */ template(`<div class="space-y-2"></div>`);
function SidebarContacts($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $sortedContacts = () => store_get(sortedContacts, "$sortedContacts", $$stores);
  let currentOrgId = "";
  onMount(() => {
    const repos = get(repoList);
    if (repos.length > 0) {
      currentOrgId = repos[0].full_name.split("/")[0];
      loadContacts(currentOrgId);
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
  function getConversationCount(contact) {
    var _a2;
    return ((_a2 = contact.conversations) == null ? void 0 : _a2.length) || 0;
  }
  init();
  var div = root$9();
  each(
    div,
    5,
    $sortedContacts,
    (contact) => contact.username,
    ($$anchor2, contact) => {
      var div_1 = root_1$a();
      var div_2 = child(div_1);
      var img = child(div_2);
      var node = sibling(img, 2);
      {
        var consequent = ($$anchor3) => {
          var div_3 = root_2$9();
          append($$anchor3, div_3);
        };
        var alternate = ($$anchor3) => {
          var div_4 = root_3$7();
          append($$anchor3, div_4);
        };
        if_block(node, ($$render) => {
          if (get$1(contact).online) $$render(consequent);
          else $$render(alternate, false);
        });
      }
      var node_1 = sibling(node, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var div_5 = root_4$4();
          append($$anchor3, div_5);
        };
        if_block(node_1, ($$render) => {
          if (get$1(contact).isLeader) $$render(consequent_1);
        });
      }
      var div_6 = sibling(div_2, 2);
      var div_7 = child(div_6);
      var div_8 = child(div_7);
      var text$1 = child(div_8);
      var div_9 = sibling(div_8, 2);
      var node_2 = child(div_9);
      {
        var consequent_2 = ($$anchor3) => {
          var span = root_5$5();
          append($$anchor3, span);
        };
        var alternate_1 = ($$anchor3) => {
          var span_1 = root_6$4();
          var text_1 = child(span_1);
          template_effect(
            ($0) => set_text(text_1, $0),
            [
              () => formatLastSeen(get$1(contact).lastSeen)
            ],
            derived_safe_equal
          );
          append($$anchor3, span_1);
        };
        if_block(node_2, ($$render) => {
          if (get$1(contact).online) $$render(consequent_2);
          else $$render(alternate_1, false);
        });
      }
      var div_10 = sibling(div_7, 2);
      var div_11 = child(div_10);
      var text_2 = child(div_11);
      var node_3 = sibling(text_2);
      {
        var consequent_3 = ($$anchor3) => {
          var text_3 = text();
          template_effect(() => set_text(text_3, `• ${get$1(contact).userAgent ?? ""} UA`));
          append($$anchor3, text_3);
        };
        if_block(node_3, ($$render) => {
          if (get$1(contact).userAgent > 0) $$render(consequent_3);
        });
      }
      template_effect(
        ($0) => {
          set_attribute(img, "src", `https://github.com/${get$1(contact).username ?? ""}.png`);
          set_attribute(img, "alt", get$1(contact).username);
          set_class(img, 1, `w-10 h-10 rounded-full ${(get$1(contact).online ? "" : "grayscale opacity-60") ?? ""}`);
          set_text(text$1, get$1(contact).username);
          set_text(text_2, `${$0 ?? ""} conversations `);
        },
        [
          () => getConversationCount(get$1(contact))
        ],
        derived_safe_equal
      );
      append($$anchor2, div_1);
    },
    ($$anchor2) => {
      var div_12 = root_8$4();
      append($$anchor2, div_12);
    }
  );
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root$8 = /* @__PURE__ */ template(`<p class="text-sm text-gray-500">[Notifications will show here]</p>`);
function SidebarNotifications($$anchor) {
  var p = root$8();
  append($$anchor, p);
}
function ChatsFilterCounter($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $conversations = () => store_get(conversations, "$conversations", $$stores);
  const $searchQuery = () => store_get(searchQuery, "$searchQuery", $$stores);
  const allConversations = /* @__PURE__ */ mutable_source();
  const filteredConversations = /* @__PURE__ */ mutable_source();
  legacy_pre_effect(() => $conversations(), () => {
    set(allConversations, Object.values($conversations()).flat());
  });
  legacy_pre_effect(
    () => (get$1(allConversations), $searchQuery()),
    () => {
      set(filteredConversations, get$1(allConversations).filter((convo) => {
        if (!$searchQuery() || $searchQuery().trim() === "") return true;
        const query = $searchQuery().toLowerCase();
        const title = (convo.title || `Conversation ${convo.id.slice(0, 6)}`).toLowerCase();
        const repo = convo.repo.toLowerCase();
        const fullName = `${repo}/${title}`;
        return title.includes(query) || repo.includes(query) || fullName.includes(query);
      }));
    }
  );
  legacy_pre_effect(
    () => get$1(filteredConversations),
    () => {
      filteredChatsCount.set(get$1(filteredConversations).length);
    }
  );
  legacy_pre_effect_reset();
  init();
  pop();
  $$cleanup();
}
function ReposFilterCounter($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $repoList = () => store_get(repoList, "$repoList", $$stores);
  const $searchQuery = () => store_get(searchQuery, "$searchQuery", $$stores);
  const $currentRoute = () => store_get(currentRoute, "$currentRoute", $$stores);
  const filteredRepos = /* @__PURE__ */ mutable_source();
  legacy_pre_effect(() => ($repoList(), $searchQuery()), () => {
    set(filteredRepos, $repoList().filter((repo) => {
      if (!$searchQuery() || $searchQuery().trim() === "") return true;
      const q = $searchQuery().toLowerCase();
      return repo.full_name.toLowerCase().includes(q) || repo.name.toLowerCase().includes(q) || repo.owner.toLowerCase().includes(q);
    }));
  });
  legacy_pre_effect(
    () => ($currentRoute(), get$1(filteredRepos)),
    () => {
      if ($currentRoute() !== "repos") {
        filteredCount.set(get$1(filteredRepos).length);
      }
    }
  );
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
var root_1$9 = /* @__PURE__ */ template(`<div class="absolute top-12 right-0 w-40 bg-white border border-gray-200 rounded shadow-md text-sm z-50"><button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button> <button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Help</button> <hr> <button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Log out</button></div>`);
var root_4$3 = /* @__PURE__ */ template(`<div class="absolute top-0 right-1 -mt-1 -mr-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow"> </div>`);
var root_2$8 = /* @__PURE__ */ template(`<button type="button"><div><!></div> <!> </button>`);
var root$7 = /* @__PURE__ */ template(`<div class="p-4 relative h-full overflow-y-auto"><!> <!> <div class="flex items-center justify-between mb-4 relative"><div class="flex items-center gap-3"><img class="w-10 h-10 rounded-full" alt="avatar"> <div><p class="font-semibold"> </p> <p class="text-xs text-gray-500"> </p></div></div> <button class="text-gray-500 hover:text-gray-700 text-lg font-bold" aria-label="Open menu">⋯</button> <!></div> <div class="relative mb-4"><input type="text" placeholder="Search repos and chats..." class="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-sm border border-gray-300 focus:outline-none"> <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M10 2a8 8 0 015.29 13.71l4.5 4.5a1 1 0 01-1.42 1.42l-4.5-4.5A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z"></path></svg></div> <div class="flex justify-around mb-4 text-xs text-center"></div> <div><!></div></div>`);
function Sidebar($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $searchQuery = () => store_get(searchQuery, "$searchQuery", $$stores);
  const $currentRoute = () => store_get(currentRoute, "$currentRoute", $$stores);
  const $filteredCount = () => store_get(filteredCount, "$filteredCount", $$stores);
  const $filteredChatsCount = () => store_get(filteredChatsCount, "$filteredChatsCount", $$stores);
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
    {
      id: "chats",
      icon: Message_circle,
      label: "Chats"
    },
    { id: "repos", icon: Folder, label: "Repos" },
    { id: "calls", icon: Phone, label: "Calls" },
    {
      id: "contacts",
      icon: Users,
      label: "Contacts"
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifs"
    }
  ];
  function toggleMenu() {
    set(menuOpen, !get$1(menuOpen));
  }
  function closeMenu() {
    set(menuOpen, false);
  }
  init();
  var div = root$7();
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
      var div_4 = root_1$9();
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
      if (get$1(menuOpen)) $$render(consequent);
    });
  }
  var div_5 = sibling(div_1, 2);
  var input = child(div_5);
  var div_6 = sibling(div_5, 2);
  each(div_6, 5, () => tabs, index, ($$anchor2, $$item) => {
    let id = () => get$1($$item).id;
    let Icon2 = () => get$1($$item).icon;
    let label = () => get$1($$item).label;
    var button_3 = root_2$8();
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
            var div_8 = root_4$3();
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
      if_block(node_4, ($$render) => {
        if ($searchQuery().trim() !== "") $$render(consequent_2);
      });
    }
    var text_3 = sibling(node_4);
    template_effect(
      ($0) => {
        classes = set_class(button_3, 1, "relative flex flex-col items-center text-xs focus:outline-none", null, classes, $0);
        set_class(div_7, 1, `w-10 h-10 rounded-full flex items-center justify-center ${$currentRoute() === id() ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 hover:text-blue-600"}`);
        set_text(text_3, ` ${label() ?? ""}`);
      },
      [
        () => ({
          "text-blue-600": $currentRoute() === id()
        })
      ],
      derived_safe_equal
    );
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
    var alternate = ($$anchor2, $$elseif) => {
      {
        var consequent_4 = ($$anchor3) => {
          SidebarRepos($$anchor3, {
            get search() {
              return $searchQuery();
            }
          });
        };
        var alternate_1 = ($$anchor3, $$elseif2) => {
          {
            var consequent_5 = ($$anchor4) => {
              SidebarCalls($$anchor4);
            };
            var alternate_2 = ($$anchor4, $$elseif3) => {
              {
                var consequent_6 = ($$anchor5) => {
                  SidebarContacts($$anchor5, {});
                };
                var alternate_3 = ($$anchor5, $$elseif4) => {
                  {
                    var consequent_7 = ($$anchor6) => {
                      SidebarNotifications($$anchor6);
                    };
                    if_block(
                      $$anchor5,
                      ($$render) => {
                        if ($currentRoute() === "notifications") $$render(consequent_7);
                      },
                      $$elseif4
                    );
                  }
                };
                if_block(
                  $$anchor4,
                  ($$render) => {
                    if ($currentRoute() === "contacts") $$render(consequent_6);
                    else $$render(alternate_3, false);
                  },
                  $$elseif3
                );
              }
            };
            if_block(
              $$anchor3,
              ($$render) => {
                if ($currentRoute() === "calls") $$render(consequent_5);
                else $$render(alternate_2, false);
              },
              $$elseif2
            );
          }
        };
        if_block(
          $$anchor2,
          ($$render) => {
            if ($currentRoute() === "repos") $$render(consequent_4);
            else $$render(alternate_1, false);
          },
          $$elseif
        );
      }
    };
    if_block(node_6, ($$render) => {
      if ($currentRoute() === "chats") $$render(consequent_3);
      else $$render(alternate, false);
    });
  }
  template_effect(() => {
    var _a2, _b, _c, _d;
    set_attribute(img, "src", (_a2 = get$1(user)) == null ? void 0 : _a2.avatar_url);
    set_text(text2, ((_b = get$1(user)) == null ? void 0 : _b.name) || ((_c = get$1(user)) == null ? void 0 : _c.login));
    set_text(text_1, `@${((_d = get$1(user)) == null ? void 0 : _d.login) ?? ""}`);
  });
  event("click", button, toggleMenu);
  bind_value(input, $searchQuery, ($$value) => store_set(searchQuery, $$value));
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root_1$8 = /* @__PURE__ */ template(`<button class="p-2 text-gray-700 text-xl rounded bg-white shadow" aria-label="Open sidebar">←</button>`);
var root$6 = /* @__PURE__ */ template(`<div class="layout svelte-scw01y"><div class="p-2 md:hidden"><!></div> <div><!></div> <div><!></div></div>`);
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
  var div = root$6();
  var div_1 = child(div);
  var node = child(div_1);
  {
    var consequent = ($$anchor2) => {
      var button = root_1$8();
      event("click", button, () => set(sidebarVisible, true));
      append($$anchor2, button);
    };
    if_block(node, ($$render) => {
      if (!get$1(sidebarVisible)) $$render(consequent);
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
  template_effect(
    ($0, $1) => {
      classes = set_class(div_2, 1, "sidebar md:block svelte-scw01y", null, classes, $0);
      classes_1 = set_class(div_3, 1, "main w-full svelte-scw01y", null, classes_1, $1);
    },
    [
      () => ({
        hidden: !get$1(sidebarVisible),
        open: get$1(sidebarVisible)
      }),
      () => ({ hidden: get$1(sidebarVisible) })
    ],
    derived_safe_equal
  );
  append($$anchor, div);
  pop();
}
var root_1$7 = /* @__PURE__ */ template(`<p class="text-gray-400 italic text-center mt-20">Welcome to skygit.</p>`);
function Home($$anchor) {
  Layout($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var p = root_1$7();
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
var root_2$7 = /* @__PURE__ */ template(`<div class="space-y-4"><h4 class="text-xl font-semibold">Welcome! Let's set up Google Drive</h4> <p class="text-gray-600">We'll guide you through creating your own Google Cloud project to enable file uploads and storage. It's free and takes about 10 minutes.</p> <div class="bg-blue-50 border border-blue-200 rounded-lg p-4"><h5 class="font-semibold text-blue-900 mb-2">What you'll get:</h5> <ul class="list-disc list-inside text-sm text-blue-800 space-y-1"><li>Your own Google Drive integration</li> <li>Full control over permissions</li> <li>No daily limits or restrictions</li> <li>Works permanently (no token expiration)</li></ul></div> <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-4"><p class="text-sm text-green-800"><strong>✓ Free to use:</strong> Google Cloud offers a generous free tier that's more than enough for personal use.</p></div></div>`);
var root_3$6 = /* @__PURE__ */ template(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 1: Create a Google Cloud Project</h4> <ol class="space-y-4"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div class="flex-1"><p class="font-medium">Go to Google Cloud Console</p> <a href="https://console.cloud.google.com/projectcreate" target="_blank" class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Open Cloud Console <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div class="flex-1"><p class="font-medium">Create a new project</p> <p class="text-sm text-gray-600 mt-1">Project name suggestion:</p> <div class="flex items-center gap-2 mt-2"><code class="bg-gray-100 px-3 py-1 rounded">SkyGit-Drive</code> <button class="text-blue-600 hover:text-blue-700 text-sm"><!></button></div></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span> <div class="flex-1"><p class="font-medium">Click "CREATE" and wait for the project to be created</p> <p class="text-sm text-gray-600 mt-1">This usually takes 10-30 seconds</p></div></li></ol></div>`);
var root_6$3 = /* @__PURE__ */ template(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 2: Enable Google Drive API</h4> <ol class="space-y-4"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div class="flex-1"><p class="font-medium">Open the API Library</p> <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Open Drive API Page <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div class="flex-1"><p class="font-medium">Click the blue "ENABLE" button</p> <p class="text-sm text-gray-600 mt-1">If it says "MANAGE" instead, the API is already enabled!</p></div></li></ol></div>`);
var root_7$5 = /* @__PURE__ */ template(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 3: Configure OAuth Consent Screen</h4> <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4"><p class="text-sm text-blue-800"><strong>Navigation help:</strong> In Google Cloud Console, look for the hamburger menu (☰) in the top-left corner. 
                            Click it, then find "APIs & Services" → "OAuth consent screen"</p></div> <ol class="space-y-4"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div class="flex-1"><p class="font-medium">Go to OAuth consent screen</p> <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Open OAuth Consent Screen <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div class="flex-1"><p class="font-medium">Configure the OAuth consent screen</p> <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mt-2 text-sm"><p class="font-semibold text-yellow-800 mb-1">If you don't see the "External" option:</p> <ul class="text-yellow-700 space-y-1"><li>• You may already have configured it - click "EDIT APP" instead</li> <li>• Or select "External" if this is your first time</li> <li>• If you only see "Internal", you're using a workspace account - select it and continue</li></ul></div></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span> <div class="flex-1"><p class="font-medium">Fill in the required fields:</p> <ul class="text-sm text-gray-600 mt-1 space-y-1"><li>• App name: <code class="bg-gray-100 px-1">SkyGit Drive</code></li> <li>• User support email: Your email</li> <li>• Developer contact: Your email</li></ul> <p class="text-sm text-gray-500 mt-2">Click "SAVE AND CONTINUE" through all steps</p></div></li></ol></div>`);
var root_8$3 = /* @__PURE__ */ template(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 4: Create OAuth Client ID</h4> <ol class="space-y-4"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div class="flex-1"><p class="font-medium">Go to Credentials page</p> <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">Open Credentials <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div class="flex-1"><p class="font-medium">Click "+ CREATE CREDENTIALS" → "OAuth client ID"</p></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span> <div class="flex-1"><p class="font-medium">Configure the client:</p> <ul class="text-sm text-gray-600 mt-1 space-y-1"><li>• Application type: <strong>Web application</strong></li> <li>• Name: <code class="bg-gray-100 px-1">SkyGit Web Client</code></li></ul></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</span> <div class="flex-1"><p class="font-medium">Add these Authorized redirect URIs:</p> <div class="space-y-2 mt-2"><div class="bg-green-50 border border-green-200 rounded p-2 text-xs"><p class="font-semibold text-green-800">✓ Add these two essential URIs:</p></div> <div class="flex items-center gap-2"><code class="bg-gray-100 px-3 py-1 rounded text-sm">https://developers.google.com/oauthplayground</code> <button class="text-blue-600 hover:text-blue-700 text-sm"><!></button> <span class="text-xs text-gray-600">(for easy setup)</span></div> <div class="flex items-center gap-2"><code class="bg-gray-100 px-3 py-1 rounded text-sm"> </code> <button class="text-blue-600 hover:text-blue-700 text-sm"><!></button> <span class="text-xs text-gray-600">(current app)</span></div> <p class="text-xs text-gray-600 mt-2">Click "+ ADD URI" after adding each one, then click "SAVE" at the bottom</p> <div class="bg-blue-50 border border-blue-200 rounded p-2 text-xs mt-3"><p class="text-blue-800"><strong>Note:</strong> We're detecting your app is running at <code> </code>. 
                                            If you deploy to a different URL later, you'll need to add that URL too.</p></div></div></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">5</span> <div class="flex-1"><p class="font-medium">Click "CREATE"</p> <p class="text-sm text-gray-600 mt-1">A popup will show your credentials - keep it open!</p></div></li></ol></div>`);
var root_14$1 = /* @__PURE__ */ template(
  `<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"><p class="font-medium text-blue-900 mb-2">Now let's get your refresh token:</p> <div class="bg-green-50 border border-green-200 rounded p-3 mb-3"><p class="text-sm text-green-800 font-semibold mb-1">💡 Recommended: Skip to Step 7</p> <p class="text-xs text-green-700">The OAuth Playground method (Step 7) is easier and more reliable. <button class="underline font-semibold">Jump to Step 7 →</button></p></div> <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3"><p class="text-sm text-yellow-800 font-semibold mb-1">⚠️ Manual method requires patience</p> <p class="text-xs text-yellow-700">New OAuth clients can take 15-30 minutes to activate. The method below may fail with "unauthorized_client" if your client is too new.</p></div> <ol class="space-y-2 text-sm text-blue-800"><li>1. Copy the authorization URL below</li> <li>2. Paste it in a new browser tab</li> <li>3. Sign in and grant permissions</li> <li>4. You'll be redirected back to this app</li> <li>5. Copy the code from the URL (after "code=" and before "&scope=")</li></ol> <div class="mt-3 space-y-2"><p class="text-sm font-semibold text-gray-700">Authorization URL for your current app:</p> <div class="p-3 bg-gray-100 rounded font-mono text-xs break-all"> </div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"><!></button></div> <div class="mt-4 bg-red-50 border border-red-200 rounded p-3"><p class="text-sm font-semibold text-red-800 mb-1">Getting "unauthorized_client" error?</p> <ol class="text-xs text-red-700 space-y-1"><li>1. <strong>Wait 15-30 minutes</strong> - Google needs time to activate new OAuth clients</li> <li>2. Double-check your Client ID is correct (copy it again from Google Console)</li> <li>3. Make sure OAuth consent screen is configured and published</li> <li>4. Try using the OAuth Playground method instead (see Step 7)</li></ol></div> <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3"><p class="text-sm font-semibold text-yellow-800 mb-1">⏰ Timing is important!</p> <p class="text-xs text-yellow-700">New OAuth clients can take 5-30 minutes to become active. If you just created your client, 
                                    take a break and try again later. The OAuth Playground method (Step 7) often works faster.</p></div></div> <div class="mt-4"><label class="block text-sm font-medium text-gray-700 mb-1">Authorization Code</label> <textarea placeholder="Paste the code from the URL here" class="w-full border px-3 py-2 rounded font-mono text-sm" rows="3"></textarea> <div class="bg-gray-50 border border-gray-200 rounded p-3 mt-2 text-xs"><p class="font-semibold text-gray-700 mb-1">Example URL after authorization:</p> <code class="text-gray-600">http://localhost/?code=<span class="text-blue-600 font-bold">4/0AY0e-g7...</span>&scope=https://www.googleapis.com/auth/drive.file</code> <p class="mt-2 text-gray-700">Copy only the blue part (the code between "code=" and "&scope=")</p></div></div>`,
  1
);
var root_17$1 = /* @__PURE__ */ template(`<p class="text-sm text-gray-600">Please enter your Client ID and Client Secret above to continue.</p>`);
var root_13$1 = /* @__PURE__ */ template(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 5: Get Your Refresh Token</h4> <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"><p class="text-sm text-yellow-800">Copy your Client ID and Client Secret from the popup window first!</p></div> <div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Client ID</label> <input type="text" placeholder="Paste your Client ID here" class="w-full border px-3 py-2 rounded"></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">Client Secret</label> <input type="text" placeholder="Paste your Client Secret here" class="w-full border px-3 py-2 rounded"></div></div> <!></div>`);
var root_18$2 = /* @__PURE__ */ template(`<div class="space-y-4"><h4 class="text-xl font-semibold">Alternative Method: Use OAuth Playground with Your Credentials</h4> <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4"><p class="text-green-800 font-semibold mb-2">Easier Option: Use Google's OAuth Playground</p> <ol class="text-sm text-green-700 space-y-2"><li>1. Go to <a href="https://developers.google.com/oauthplayground" target="_blank" class="underline">OAuth Playground</a></li> <li>2. Click the gear icon (⚙️) in the top right</li> <li>3. Check "Use your own OAuth credentials"</li> <li>4. Enter your Client ID and Client Secret</li> <li>5. In the left panel, find "Drive API v3" and select: <code class="bg-green-100 px-1">https://www.googleapis.com/auth/drive.file</code></li> <li>6. Click "Authorize APIs" and sign in</li> <li>7. Click "Exchange authorization code for tokens"</li> <li>8. Copy the "Refresh token" from the response</li></ol> <div class="mt-3 p-2 bg-yellow-100 rounded"><p class="text-xs text-yellow-800"><strong>Note:</strong> You must add <code>https://developers.google.com/oauthplayground</code> as an authorized redirect URI in your OAuth client settings first!</p></div></div> <div class="bg-blue-50 border border-blue-200 rounded-lg p-4"><p class="text-blue-800 mb-3">Since we can't exchange the authorization code in the browser, you'll need to use a desktop tool or script.</p> <p class="font-medium text-blue-900 mb-2">Option 1: Python Script</p> <pre class="bg-white p-3 rounded text-xs overflow-x-auto"><code> </code></pre> <button class="mt-2 text-blue-600 hover:text-blue-700 text-sm"><!></button> <p class="text-sm text-blue-800 mt-4">Run this script with your authorization code to get the refresh token.</p></div> <div class="mt-6"><label class="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label> <input type="text" placeholder="Paste your refresh token here" class="w-full border px-3 py-2 rounded"></div></div>`);
var root_22 = /* @__PURE__ */ template(`<div class="bg-green-50 border border-green-200 rounded-lg p-4"><p class="text-green-800 font-medium">✅ Great! You have all the required credentials.</p></div>`);
var root_21 = /* @__PURE__ */ template(`<div class="space-y-4"><h4 class="text-xl font-semibold">Step 6: Create Google Drive Folder</h4> <p class="text-gray-600">Finally, let's create a folder for SkyGit files:</p> <ol class="space-y-3"><li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span> <div><a href="https://drive.google.com" target="_blank" class="text-blue-600 underline">Open Google Drive</a></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span> <div>Create a new folder named: <code class="bg-gray-100 px-2 py-1 rounded"> </code></div></li> <li class="flex gap-3"><span class="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span> <div>Open the folder and copy its URL</div></li></ol> <div class="mt-4"><label class="block text-sm font-medium text-gray-700 mb-1">Google Drive Folder URL</label> <input type="text" placeholder="https://drive.google.com/drive/folders/..." class="w-full border px-3 py-2 rounded"></div> <!></div>`);
var root_23$1 = /* @__PURE__ */ template(`<button></button>`);
var root_24$1 = /* @__PURE__ */ template(`<button class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Next →</button>`);
var root_25$1 = /* @__PURE__ */ template(`<button class="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">Complete Setup</button>`);
var root_1$6 = /* @__PURE__ */ template(`<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"><div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between"><h3 class="text-lg font-semibold">Google Drive Setup - Create Your Own App</h3> <button class="text-gray-500 hover:text-gray-700"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="p-6"><!> <!> <!> <!> <!> <!> <!> <!></div> <div class="sticky bottom-0 bg-white border-t p-4 flex justify-between"><button class="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">← Previous</button> <div class="flex gap-2"></div> <!></div></div></div>`);
function GoogleDriveSetupGuide($$anchor, $$props) {
  push($$props, false);
  let show = prop($$props, "show", 8, false);
  const dispatch = createEventDispatcher();
  let currentStep = /* @__PURE__ */ mutable_source(1);
  let copiedSteps = /* @__PURE__ */ mutable_source({});
  let credentials = /* @__PURE__ */ mutable_source({
    client_id: "",
    client_secret: "",
    refresh_token: "",
    folder_url: ""
  });
  async function copyToClipboard(text2, stepId) {
    try {
      await navigator.clipboard.writeText(text2);
      mutate(copiedSteps, get$1(copiedSteps)[stepId] = true);
      set(copiedSteps, get$1(copiedSteps));
      setTimeout(
        () => {
          mutate(copiedSteps, get$1(copiedSteps)[stepId] = false);
          set(copiedSteps, get$1(copiedSteps));
        },
        2e3
      );
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }
  function getSuggestedFolderName() {
    var _a2;
    const auth = get(authStore);
    const username = ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login) || "user";
    return `SkyGit-${username}`;
  }
  function getCurrentAppUrl() {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? ":" + port : ""}`;
  }
  function handleComplete() {
    dispatch("complete", get$1(credentials));
  }
  function handleClose() {
    dispatch("close");
  }
  init();
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_16 = ($$anchor2) => {
      var div = root_1$6();
      var div_1 = child(div);
      var div_2 = child(div_1);
      var button = sibling(child(div_2), 2);
      var div_3 = sibling(div_2, 2);
      var node_1 = child(div_3);
      {
        var consequent = ($$anchor3) => {
          var div_4 = root_2$7();
          append($$anchor3, div_4);
        };
        if_block(node_1, ($$render) => {
          if (get$1(currentStep) === 1) $$render(consequent);
        });
      }
      var node_2 = sibling(node_1, 2);
      {
        var consequent_2 = ($$anchor3) => {
          var div_5 = root_3$6();
          var ol = sibling(child(div_5), 2);
          var li = sibling(child(ol), 2);
          var div_6 = sibling(child(li), 2);
          var div_7 = sibling(child(div_6), 4);
          var button_1 = sibling(child(div_7), 2);
          var node_3 = child(button_1);
          {
            var consequent_1 = ($$anchor4) => {
              var text_1 = text("✓ Copied!");
              append($$anchor4, text_1);
            };
            var alternate = ($$anchor4) => {
              var text_2 = text("📋 Copy");
              append($$anchor4, text_2);
            };
            if_block(node_3, ($$render) => {
              if (get$1(copiedSteps)["projectName"]) $$render(consequent_1);
              else $$render(alternate, false);
            });
          }
          event("click", button_1, () => copyToClipboard("SkyGit-Drive", "projectName"));
          append($$anchor3, div_5);
        };
        if_block(node_2, ($$render) => {
          if (get$1(currentStep) === 2) $$render(consequent_2);
        });
      }
      var node_4 = sibling(node_2, 2);
      {
        var consequent_3 = ($$anchor3) => {
          var div_8 = root_6$3();
          append($$anchor3, div_8);
        };
        if_block(node_4, ($$render) => {
          if (get$1(currentStep) === 3) $$render(consequent_3);
        });
      }
      var node_5 = sibling(node_4, 2);
      {
        var consequent_4 = ($$anchor3) => {
          var div_9 = root_7$5();
          append($$anchor3, div_9);
        };
        if_block(node_5, ($$render) => {
          if (get$1(currentStep) === 4) $$render(consequent_4);
        });
      }
      var node_6 = sibling(node_5, 2);
      {
        var consequent_7 = ($$anchor3) => {
          var div_10 = root_8$3();
          var ol_1 = sibling(child(div_10), 2);
          var li_1 = sibling(child(ol_1), 6);
          var div_11 = sibling(child(li_1), 2);
          var div_12 = sibling(child(div_11), 2);
          var div_13 = sibling(child(div_12), 2);
          var button_2 = sibling(child(div_13), 2);
          var node_7 = child(button_2);
          {
            var consequent_5 = ($$anchor4) => {
              var text_3 = text("✓ Copied!");
              append($$anchor4, text_3);
            };
            var alternate_1 = ($$anchor4) => {
              var text_4 = text("📋 Copy");
              append($$anchor4, text_4);
            };
            if_block(node_7, ($$render) => {
              if (get$1(copiedSteps)["redirectUri1"]) $$render(consequent_5);
              else $$render(alternate_1, false);
            });
          }
          var div_14 = sibling(div_13, 2);
          var code = child(div_14);
          var text_5 = child(code);
          var button_3 = sibling(code, 2);
          var node_8 = child(button_3);
          {
            var consequent_6 = ($$anchor4) => {
              var text_6 = text("✓ Copied!");
              append($$anchor4, text_6);
            };
            var alternate_2 = ($$anchor4) => {
              var text_7 = text("📋 Copy");
              append($$anchor4, text_7);
            };
            if_block(node_8, ($$render) => {
              if (get$1(copiedSteps)["redirectUri2"]) $$render(consequent_6);
              else $$render(alternate_2, false);
            });
          }
          var div_15 = sibling(div_14, 4);
          var p = child(div_15);
          var code_1 = sibling(child(p), 2);
          var text_8 = child(code_1);
          template_effect(
            ($0, $1) => {
              set_text(text_5, $0);
              set_text(text_8, $1);
            },
            [getCurrentAppUrl, getCurrentAppUrl],
            derived_safe_equal
          );
          event("click", button_2, () => copyToClipboard("https://developers.google.com/oauthplayground", "redirectUri1"));
          event("click", button_3, () => copyToClipboard(getCurrentAppUrl(), "redirectUri2"));
          append($$anchor3, div_10);
        };
        if_block(node_6, ($$render) => {
          if (get$1(currentStep) === 5) $$render(consequent_7);
        });
      }
      var node_9 = sibling(node_6, 2);
      {
        var consequent_10 = ($$anchor3) => {
          var div_16 = root_13$1();
          var div_17 = sibling(child(div_16), 4);
          var div_18 = child(div_17);
          var input = sibling(child(div_18), 2);
          var div_19 = sibling(div_18, 2);
          var input_1 = sibling(child(div_19), 2);
          var node_10 = sibling(div_17, 2);
          {
            var consequent_9 = ($$anchor4) => {
              var fragment_1 = root_14$1();
              var div_20 = first_child(fragment_1);
              var div_21 = sibling(child(div_20), 2);
              var p_1 = sibling(child(div_21), 2);
              var button_4 = sibling(child(p_1));
              var div_22 = sibling(div_21, 6);
              var div_23 = sibling(child(div_22), 2);
              var text_9 = child(div_23);
              var button_5 = sibling(div_23, 2);
              var node_11 = child(button_5);
              {
                var consequent_8 = ($$anchor5) => {
                  var text_10 = text("✓ Copied!");
                  append($$anchor5, text_10);
                };
                var alternate_3 = ($$anchor5) => {
                  var text_11 = text("📋 Copy URL");
                  append($$anchor5, text_11);
                };
                if_block(node_11, ($$render) => {
                  if (get$1(copiedSteps)["authUrl1"]) $$render(consequent_8);
                  else $$render(alternate_3, false);
                });
              }
              template_effect(
                ($0) => set_text(text_9, $0),
                [
                  () => `https://accounts.google.com/o/oauth2/v2/auth?client_id=${get$1(credentials).client_id}&redirect_uri=${encodeURIComponent(getCurrentAppUrl())}&response_type=code&scope=https://www.googleapis.com/auth/drive.file&access_type=offline&prompt=consent`
                ],
                derived_safe_equal
              );
              event("click", button_4, () => set(currentStep, 7));
              event("click", button_5, () => copyToClipboard(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${get$1(credentials).client_id}&redirect_uri=${encodeURIComponent(getCurrentAppUrl())}&response_type=code&scope=https://www.googleapis.com/auth/drive.file&access_type=offline&prompt=consent`, "authUrl1"));
              append($$anchor4, fragment_1);
            };
            var alternate_4 = ($$anchor4) => {
              var p_2 = root_17$1();
              append($$anchor4, p_2);
            };
            if_block(node_10, ($$render) => {
              if (get$1(credentials).client_id && get$1(credentials).client_secret) $$render(consequent_9);
              else $$render(alternate_4, false);
            });
          }
          bind_value(input, () => get$1(credentials).client_id, ($$value) => mutate(credentials, get$1(credentials).client_id = $$value));
          bind_value(input_1, () => get$1(credentials).client_secret, ($$value) => mutate(credentials, get$1(credentials).client_secret = $$value));
          append($$anchor3, div_16);
        };
        if_block(node_9, ($$render) => {
          if (get$1(currentStep) === 6) $$render(consequent_10);
        });
      }
      var node_12 = sibling(node_9, 2);
      {
        var consequent_12 = ($$anchor3) => {
          var div_24 = root_18$2();
          var div_25 = sibling(child(div_24), 4);
          var pre = sibling(child(div_25), 4);
          var code_2 = child(pre);
          var text_12 = child(code_2);
          var button_6 = sibling(pre, 2);
          var node_13 = child(button_6);
          {
            var consequent_11 = ($$anchor4) => {
              var text_13 = text("✓ Copied!");
              append($$anchor4, text_13);
            };
            var alternate_5 = ($$anchor4) => {
              var text_14 = text("📋 Copy Script");
              append($$anchor4, text_14);
            };
            if_block(node_13, ($$render) => {
              if (get$1(copiedSteps)["pythonScript"]) $$render(consequent_11);
              else $$render(alternate_5, false);
            });
          }
          var div_26 = sibling(div_25, 2);
          var input_2 = sibling(child(div_26), 2);
          template_effect(() => set_text(text_12, `import requests

CLIENT_ID = "${get$1(credentials).client_id || "YOUR_CLIENT_ID"}"
CLIENT_SECRET = "${get$1(credentials).client_secret || "YOUR_CLIENT_SECRET"}"
AUTH_CODE = "YOUR_AUTH_CODE"

response = requests.post('https://oauth2.googleapis.com/token', data={
    'code': AUTH_CODE,
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
    'redirect_uri': 'http://localhost',
    'grant_type': 'authorization_code'
})

print(response.json())`));
          event("click", button_6, () => copyToClipboard(`import requests

CLIENT_ID = "${get$1(credentials).client_id || "YOUR_CLIENT_ID"}"
CLIENT_SECRET = "${get$1(credentials).client_secret || "YOUR_CLIENT_SECRET"}"
AUTH_CODE = "YOUR_AUTH_CODE"

response = requests.post('https://oauth2.googleapis.com/token', data={
    'code': AUTH_CODE,
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
    'redirect_uri': 'http://localhost',
    'grant_type': 'authorization_code'
})

print(response.json())`, "pythonScript"));
          bind_value(input_2, () => get$1(credentials).refresh_token, ($$value) => mutate(credentials, get$1(credentials).refresh_token = $$value));
          append($$anchor3, div_24);
        };
        if_block(node_12, ($$render) => {
          if (get$1(currentStep) === 7) $$render(consequent_12);
        });
      }
      var node_14 = sibling(node_12, 2);
      {
        var consequent_14 = ($$anchor3) => {
          var div_27 = root_21();
          var ol_2 = sibling(child(div_27), 4);
          var li_2 = sibling(child(ol_2), 2);
          var div_28 = sibling(child(li_2), 2);
          var code_3 = sibling(child(div_28));
          var text_15 = child(code_3);
          var div_29 = sibling(ol_2, 2);
          var input_3 = sibling(child(div_29), 2);
          var node_15 = sibling(div_29, 2);
          {
            var consequent_13 = ($$anchor4) => {
              var div_30 = root_22();
              append($$anchor4, div_30);
            };
            if_block(node_15, ($$render) => {
              if (get$1(credentials).client_id && get$1(credentials).client_secret && get$1(credentials).refresh_token && get$1(credentials).folder_url) $$render(consequent_13);
            });
          }
          template_effect(($0) => set_text(text_15, $0), [getSuggestedFolderName], derived_safe_equal);
          bind_value(input_3, () => get$1(credentials).folder_url, ($$value) => mutate(credentials, get$1(credentials).folder_url = $$value));
          append($$anchor3, div_27);
        };
        if_block(node_14, ($$render) => {
          if (get$1(currentStep) === 8) $$render(consequent_14);
        });
      }
      var div_31 = sibling(div_3, 2);
      var button_7 = child(div_31);
      var div_32 = sibling(button_7, 2);
      each(div_32, 4, () => [1, 2, 3, 4, 5, 6, 7, 8], index, ($$anchor3, step) => {
        var button_8 = root_23$1();
        template_effect(() => set_class(button_8, 1, `w-2 h-2 rounded-full ${(get$1(currentStep) >= step ? "bg-blue-600" : "bg-gray-300") ?? ""}`));
        event("click", button_8, () => set(currentStep, step));
        append($$anchor3, button_8);
      });
      var node_16 = sibling(div_32, 2);
      {
        var consequent_15 = ($$anchor3) => {
          var button_9 = root_24$1();
          event("click", button_9, () => set(currentStep, Math.min(8, get$1(currentStep) + 1)));
          append($$anchor3, button_9);
        };
        var alternate_6 = ($$anchor3) => {
          var button_10 = root_25$1();
          template_effect(() => button_10.disabled = !get$1(credentials).client_id || !get$1(credentials).client_secret || !get$1(credentials).refresh_token || !get$1(credentials).folder_url);
          event("click", button_10, handleComplete);
          append($$anchor3, button_10);
        };
        if_block(node_16, ($$render) => {
          if (get$1(currentStep) < 8) $$render(consequent_15);
          else $$render(alternate_6, false);
        });
      }
      template_effect(() => button_7.disabled = get$1(currentStep) === 1);
      event("click", button, handleClose);
      event("click", button_7, () => set(currentStep, Math.max(1, get$1(currentStep) - 1)));
      append($$anchor2, div);
    };
    if_block(node, ($$render) => {
      if (show()) $$render(consequent_16);
    });
  }
  append($$anchor, fragment);
  pop();
}
var root_2$6 = /* @__PURE__ */ template(`<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"><h3 class="text-lg font-semibold text-yellow-800 mb-2">⚠️ Configuration Repository Issue</h3> <p class="text-yellow-700 mb-3">The <code class="bg-yellow-100 px-1 rounded">skygit-config</code> repository is required to store your credentials securely.</p> <div class="space-y-3"><button class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded disabled:opacity-50"> </button> <div class="text-sm text-yellow-700"><p class="font-semibold mb-1">If you see "repository already exists" error:</p> <ol class="list-decimal list-inside space-y-1 ml-2"><li>Check if the repo exists at: <a target="_blank" class="underline"> </a></li> <li>If it exists but you can't access it, check your PAT has "repo" scope</li> <li>If you deleted it recently, wait a few minutes or rename it first</li> <li>Try visiting the repo directly and delete it if needed</li></ol></div></div></div>`);
var root_8$2 = /* @__PURE__ */ template(`<button title="Save">💾</button>`);
var root_9$4 = /* @__PURE__ */ template(`<button title="Edit">✏️</button>`);
var root_7$4 = /* @__PURE__ */ template(`<button title="Hide">🙈</button> <!>`, 1);
var root_10$4 = /* @__PURE__ */ template(`<button title="Reveal">👁️</button>`);
var root_14 = /* @__PURE__ */ template(`<label class="block mb-2"><span class="font-semibold"> </span> <input class="w-full border px-2 py-1 rounded text-xs"></label>`);
var root_12$1 = /* @__PURE__ */ template(`<label class="block mb-2"><span class="font-semibold">Type</span> <select disabled class="w-full border px-2 py-1 rounded text-xs bg-gray-100 text-gray-500"><option> </option></select></label> <!>`, 1);
var root_15$1 = /* @__PURE__ */ template(`<pre class="text-xs text-gray-700 bg-white border rounded p-2"> </pre>`);
var root_11$1 = /* @__PURE__ */ template(`<tr class="bg-gray-50 text-xs"><td colspan="4" class="p-3"><!></td></tr>`);
var root_4$2 = /* @__PURE__ */ template(`<tr class="border-t"><td class="p-2 align-top"> </td><td class="p-2 font-mono text-xs text-gray-500"> </td><td class="p-2 text-xs text-gray-700"><!></td><td class="p-2 space-x-3 text-sm"><!> <button title="Delete">🗑️</button></td></tr> <!>`, 1);
var root_16$1 = /* @__PURE__ */ template(`<div class="grid md:grid-cols-3 gap-4"><label>Access Key ID: <input class="w-full border px-2 py-1 rounded text-sm"></label> <label>Secret Access Key: <input class="w-full border px-2 py-1 rounded text-sm"></label> <label>Region: <input class="w-full border px-2 py-1 rounded text-sm"></label></div>`);
var root_18$1 = /* @__PURE__ */ template(`<div class="space-y-4"><div class="bg-blue-50 border border-blue-200 rounded p-4"><h4 class="font-semibold text-blue-900 mb-2">🔗 Connect Google Drive</h4> <p class="text-sm text-blue-800 mb-3">Set up your own Google Drive integration for file uploads and storage.</p> <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg> Set Up Google Drive</button></div> <div class="text-sm text-gray-600"><p class="mb-2">Or enter credentials manually if you already have them:</p> <div class="grid md:grid-cols-3 gap-4"><label>Client ID: <input placeholder="e.g., 123456789.apps.googleusercontent.com" class="w-full border px-2 py-1 rounded text-sm"></label> <label>Client Secret: <input placeholder="e.g., GOCSPX-..." class="w-full border px-2 py-1 rounded text-sm"></label> <label>Refresh Token: <input placeholder="e.g., 1//0g..." class="w-full border px-2 py-1 rounded text-sm"></label></div></div></div>`);
var root_3$5 = /* @__PURE__ */ template(`<table class="w-full text-sm border rounded overflow-hidden shadow"><thead class="bg-gray-100 text-left"><tr><th class="p-2">URL</th><th class="p-2">Encrypted Preview</th><th class="p-2">Type</th><th class="p-2">Actions</th></tr></thead><tbody></tbody></table> <div class="border-t pt-4 space-y-2"><h3 class="text-lg font-semibold text-gray-700">➕ Add Credential</h3> <div class="grid md:grid-cols-2 gap-4"><label>URL: <input placeholder="https://my-storage.com/path" class="w-full border px-2 py-1 rounded text-sm"></label> <label>Type: <select class="w-full border px-2 py-1 rounded text-sm"><option>S3</option><option>Google Drive</option></select></label></div> <!> <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">💾 Add Credential</button></div> <div class="border-t pt-4 space-y-2"><h3 class="text-lg font-semibold text-gray-700">App Settings</h3> <label class="flex items-center space-x-2"><input type="checkbox"> <span>Cleanup mode (delete old presence channels)</span></label></div>`, 1);
var root_1$5 = /* @__PURE__ */ template(`<div class="p-6 max-w-4xl mx-auto space-y-6"><h2 class="text-2xl font-semibold text-gray-800">🔐 Credential Manager</h2> <!></div>`);
var root$5 = /* @__PURE__ */ template(`<!> <!>`, 1);
function Settings($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $authStore = () => store_get(authStore, "$authStore", $$stores);
  let secrets = /* @__PURE__ */ mutable_source({});
  let decrypted = /* @__PURE__ */ mutable_source({});
  let revealed = /* @__PURE__ */ mutable_source(/* @__PURE__ */ new Set());
  let repoExists = /* @__PURE__ */ mutable_source(true);
  let creatingRepo = /* @__PURE__ */ mutable_source(false);
  let editing = /* @__PURE__ */ mutable_source(null);
  let newUrl = /* @__PURE__ */ mutable_source("");
  let newType = /* @__PURE__ */ mutable_source("s3");
  let newCredentials = /* @__PURE__ */ mutable_source({
    type: "s3",
    accessKeyId: "",
    secretAccessKey: "",
    region: ""
  });
  let editCredentials = /* @__PURE__ */ mutable_source({});
  let sha = null;
  let cleanupMode = /* @__PURE__ */ mutable_source(false);
  const token = localStorage.getItem("skygit_token");
  onMount(async () => {
    set(cleanupMode, get(settingsStore).cleanupMode || false);
    if (!token) return;
    try {
      const username = await getGitHubUsername(token);
      console.log("[Settings] Checking repo for user:", username);
      set(repoExists, await checkSkyGitRepoExists(token, username));
      if (!get$1(repoExists)) {
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
      if (!get$1(decrypted)[url]) {
        mutate(decrypted, get$1(decrypted)[url] = await decryptJSON(token, get$1(secrets)[url]));
      }
      set(revealed, new Set(get$1(revealed)).add(url));
    } catch (e) {
      alert("❌ Failed to decrypt.");
    }
  }
  function hide(url) {
    set(revealed, new Set([...get$1(revealed)].filter((item) => item !== url)));
    if (get$1(editing) === url) set(editing, null);
  }
  function startEdit(url) {
    if (!get$1(revealed).has(url)) {
      set(revealed, new Set(get$1(revealed)).add(url));
    }
    set(editing, url);
    set(editCredentials, { ...get$1(decrypted)[url] });
  }
  async function saveEdit(url) {
    const encrypted = await encryptJSON(token, get$1(editCredentials));
    mutate(secrets, get$1(secrets)[url] = encrypted);
    set(secrets, { ...get$1(secrets) });
    mutate(decrypted, get$1(decrypted)[url] = get$1(editCredentials));
    set(decrypted, { ...get$1(decrypted) });
    set(revealed, new Set(get$1(revealed)).add(url));
    set(editing, null);
    const savedSha = await saveSecretsMap(token, get$1(secrets), sha);
    sha = savedSha ?? sha;
    settingsStore.update((s) => ({
      ...s,
      encryptedSecrets: { ...get$1(secrets) },
      decrypted: { ...get$1(decrypted) },
      secrets: { ...get$1(decrypted) },
      secretsSha: sha
    }));
  }
  async function deleteCredential(url) {
    if (!confirm(`Are you sure you want to delete the credential for:
${url}?`)) return;
    delete get$1(secrets)[url];
    set(secrets, { ...get$1(secrets) });
    delete get$1(decrypted)[url];
    set(decrypted, { ...get$1(decrypted) });
    set(revealed, new Set([...get$1(revealed)].filter((item) => item !== url)));
    if (get$1(editing) === url) set(editing, null);
    const savedSha = await saveSecretsMap(token, get$1(secrets), sha);
    sha = savedSha ?? sha;
    settingsStore.update((s) => ({
      ...s,
      encryptedSecrets: { ...get$1(secrets) },
      decrypted: { ...get$1(decrypted) },
      secrets: { ...get$1(decrypted) },
      secretsSha: sha
    }));
  }
  async function addCredential() {
    if (!get$1(newUrl) || !get$1(newType)) return;
    const template2 = get$1(newType) === "s3" ? {
      type: "s3",
      accessKeyId: get$1(newCredentials).accessKeyId || "",
      secretAccessKey: get$1(newCredentials).secretAccessKey || "",
      region: get$1(newCredentials).region || ""
    } : {
      type: "google_drive",
      client_id: get$1(newCredentials).client_id || "",
      client_secret: get$1(newCredentials).client_secret || "",
      refresh_token: get$1(newCredentials).refresh_token || ""
    };
    const encrypted = await encryptJSON(token, template2);
    mutate(secrets, get$1(secrets)[get$1(newUrl)] = encrypted);
    set(secrets, { ...get$1(secrets) });
    mutate(decrypted, get$1(decrypted)[get$1(newUrl)] = template2);
    set(decrypted, { ...get$1(decrypted) });
    set(revealed, new Set(get$1(revealed)).add(get$1(newUrl)));
    set(newUrl, "");
    set(newType, "s3");
    set(newCredentials, {
      type: "s3",
      accessKeyId: "",
      secretAccessKey: "",
      region: ""
    });
    const savedSha = await saveSecretsMap(token, get$1(secrets), sha);
    sha = savedSha ?? sha;
    settingsStore.update((s) => ({
      ...s,
      encryptedSecrets: { ...get$1(secrets) },
      decrypted: { ...get$1(decrypted) },
      secrets: { ...get$1(decrypted) },
      secretsSha: sha
    }));
  }
  function saveCleanupMode() {
    settingsStore.update((s) => ({ ...s, cleanupMode: get$1(cleanupMode) }));
    localStorage.setItem("skygit_cleanup_mode", get$1(cleanupMode) ? "true" : "false");
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
  var fragment = root$5();
  var node = first_child(fragment);
  Layout(node, {
    children: ($$anchor2, $$slotProps) => {
      var div = root_1$5();
      var node_1 = sibling(child(div), 2);
      {
        var consequent = ($$anchor3) => {
          var div_1 = root_2$6();
          var div_2 = sibling(child(div_1), 4);
          var button = child(div_2);
          var text2 = child(button);
          var div_3 = sibling(button, 2);
          var ol = sibling(child(div_3), 2);
          var li = child(ol);
          var a = sibling(child(li));
          var text_1 = child(a);
          template_effect(() => {
            var _a2, _b, _c, _d;
            button.disabled = get$1(creatingRepo);
            set_text(text2, get$1(creatingRepo) ? "Creating..." : "Create Repository");
            set_attribute(a, "href", `https://github.com/${((_b = (_a2 = $authStore()) == null ? void 0 : _a2.user) == null ? void 0 : _b.login) || "YOUR_USERNAME"}/skygit-config`);
            set_text(text_1, `github.com/${((_d = (_c = $authStore()) == null ? void 0 : _c.user) == null ? void 0 : _d.login) || "YOUR_USERNAME"}/skygit-config`);
          });
          event("click", button, createRepo);
          append($$anchor3, div_1);
        };
        var alternate = ($$anchor3) => {
          var fragment_1 = root_3$5();
          var table = first_child(fragment_1);
          var tbody = sibling(child(table));
          each(tbody, 5, () => Object.entries(get$1(secrets)), index, ($$anchor4, $$item) => {
            let url = () => get$1($$item)[0];
            let value = () => get$1($$item)[1];
            var fragment_2 = root_4$2();
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
                template_effect(() => set_text(text_4, get$1(decrypted)[url()].type === "s3" ? "S3" : "Google Drive"));
                append($$anchor5, text_4);
              };
              var alternate_1 = ($$anchor5) => {
                var text_5 = text("?");
                append($$anchor5, text_5);
              };
              if_block(node_2, ($$render) => {
                if (get$1(decrypted)[url()]) $$render(consequent_1);
                else $$render(alternate_1, false);
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
                    var button_2 = root_8$2();
                    event("click", button_2, () => saveEdit(url()));
                    append($$anchor6, button_2);
                  };
                  var alternate_2 = ($$anchor6) => {
                    var button_3 = root_9$4();
                    event("click", button_3, () => startEdit(url()));
                    append($$anchor6, button_3);
                  };
                  if_block(node_4, ($$render) => {
                    if (get$1(editing) === url()) $$render(consequent_2);
                    else $$render(alternate_2, false);
                  });
                }
                event("click", button_1, () => hide(url()));
                append($$anchor5, fragment_4);
              };
              var alternate_3 = ($$anchor5) => {
                var button_4 = root_10$4();
                event("click", button_4, () => reveal(url()));
                append($$anchor5, button_4);
              };
              if_block(node_3, ($$render) => {
                if (get$1(revealed).has(url())) $$render(consequent_3);
                else $$render(alternate_3, false);
              });
            }
            var button_5 = sibling(node_3, 2);
            var node_5 = sibling(tr, 2);
            {
              var consequent_6 = ($$anchor5) => {
                var tr_1 = root_11$1();
                var td_4 = child(tr_1);
                var node_6 = child(td_4);
                {
                  var consequent_5 = ($$anchor6) => {
                    var fragment_5 = root_12$1();
                    var label = first_child(fragment_5);
                    var select = sibling(child(label), 2);
                    var option = child(select);
                    var option_value = {};
                    var text_6 = child(option);
                    var node_7 = sibling(label, 2);
                    each(node_7, 1, () => Object.entries(get$1(editCredentials)), index, ($$anchor7, $$item2) => {
                      let key = () => get$1($$item2)[0];
                      var fragment_6 = comment();
                      var node_8 = first_child(fragment_6);
                      {
                        var consequent_4 = ($$anchor8) => {
                          var label_1 = root_14();
                          var span = child(label_1);
                          var text_7 = child(span);
                          var input = sibling(span, 2);
                          template_effect(() => set_text(text_7, key()));
                          bind_value(input, () => get$1(editCredentials)[key()], ($$value) => mutate(editCredentials, get$1(editCredentials)[key()] = $$value));
                          append($$anchor8, label_1);
                        };
                        if_block(node_8, ($$render) => {
                          if (key() !== "type") $$render(consequent_4);
                        });
                      }
                      append($$anchor7, fragment_6);
                    });
                    template_effect(() => {
                      if (option_value !== (option_value = get$1(editCredentials).type)) {
                        option.value = null == (option.__value = get$1(editCredentials).type) ? "" : get$1(editCredentials).type;
                      }
                      set_text(text_6, get$1(editCredentials).type);
                    });
                    append($$anchor6, fragment_5);
                  };
                  var alternate_4 = ($$anchor6) => {
                    var pre = root_15$1();
                    var text_8 = child(pre);
                    template_effect(
                      ($0) => set_text(text_8, `${$0 ?? ""}
                                    `),
                      [
                        () => JSON.stringify(get$1(decrypted)[url()], null, 2)
                      ],
                      derived_safe_equal
                    );
                    append($$anchor6, pre);
                  };
                  if_block(node_6, ($$render) => {
                    if (get$1(editing) === url()) $$render(consequent_5);
                    else $$render(alternate_4, false);
                  });
                }
                append($$anchor5, tr_1);
              };
              if_block(node_5, ($$render) => {
                if (get$1(revealed).has(url())) $$render(consequent_6);
              });
            }
            template_effect(
              ($0) => {
                set_text(text_2, url());
                set_text(text_3, `${$0 ?? ""}...`);
              },
              [() => value().slice(0, 20)],
              derived_safe_equal
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
          template_effect(() => {
            get$1(newType);
            invalidate_inner_signals(() => {
            });
          });
          var option_1 = child(select_1);
          option_1.value = null == (option_1.__value = "s3") ? "" : "s3";
          var option_2 = sibling(option_1);
          option_2.value = null == (option_2.__value = "google_drive") ? "" : "google_drive";
          var node_9 = sibling(div_5, 2);
          {
            var consequent_7 = ($$anchor4) => {
              var div_6 = root_16$1();
              var label_4 = child(div_6);
              var input_2 = sibling(child(label_4));
              var label_5 = sibling(label_4, 2);
              var input_3 = sibling(child(label_5));
              var label_6 = sibling(label_5, 2);
              var input_4 = sibling(child(label_6));
              bind_value(input_2, () => get$1(newCredentials).accessKeyId, ($$value) => mutate(newCredentials, get$1(newCredentials).accessKeyId = $$value));
              bind_value(input_3, () => get$1(newCredentials).secretAccessKey, ($$value) => mutate(newCredentials, get$1(newCredentials).secretAccessKey = $$value));
              bind_value(input_4, () => get$1(newCredentials).region, ($$value) => mutate(newCredentials, get$1(newCredentials).region = $$value));
              append($$anchor4, div_6);
            };
            var alternate_5 = ($$anchor4, $$elseif) => {
              {
                var consequent_8 = ($$anchor5) => {
                  var div_7 = root_18$1();
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
                  bind_value(input_5, () => get$1(newCredentials).client_id, ($$value) => mutate(newCredentials, get$1(newCredentials).client_id = $$value));
                  bind_value(input_6, () => get$1(newCredentials).client_secret, ($$value) => mutate(newCredentials, get$1(newCredentials).client_secret = $$value));
                  bind_value(input_7, () => get$1(newCredentials).refresh_token, ($$value) => mutate(newCredentials, get$1(newCredentials).refresh_token = $$value));
                  append($$anchor5, div_7);
                };
                if_block(
                  $$anchor4,
                  ($$render) => {
                    if (get$1(newType) === "google_drive") $$render(consequent_8);
                  },
                  $$elseif
                );
              }
            };
            if_block(node_9, ($$render) => {
              if (get$1(newType) === "s3") $$render(consequent_7);
              else $$render(alternate_5, false);
            });
          }
          var button_7 = sibling(node_9, 2);
          var div_11 = sibling(div_4, 2);
          var label_10 = sibling(child(div_11), 2);
          var input_8 = child(label_10);
          bind_value(input_1, () => get$1(newUrl), ($$value) => set(newUrl, $$value));
          bind_select_value(select_1, () => get$1(newType), ($$value) => set(newType, $$value));
          event("click", button_7, addCredential);
          bind_checked(input_8, () => get$1(cleanupMode), ($$value) => set(cleanupMode, $$value));
          event("change", input_8, saveCleanupMode);
          append($$anchor3, fragment_1);
        };
        if_block(node_1, ($$render) => {
          if (!get$1(repoExists)) $$render(consequent);
          else $$render(alternate, false);
        });
      }
      append($$anchor2, div);
    },
    $$slots: { default: true }
  });
  var node_10 = sibling(node, 2);
  GoogleDriveSetupGuide(node_10, {
    get show() {
      return get$1(showGoogleGuide);
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
var root_3$4 = /* @__PURE__ */ template(`<div class="bg-blue-50 p-2 rounded mb-2 text-xs border-l-2 border-blue-300"><div class="font-semibold text-blue-700"> </div> <div class="text-gray-600 truncate"> </div></div>`);
var root_5$4 = /* @__PURE__ */ template(`<span> </span>`);
var root_7$3 = /* @__PURE__ */ template(`<a target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-blue-700 text-sm transition-colors"><!> <span class="max-w-[200px] truncate"> </span> <!></a>`);
var root_8$1 = /* @__PURE__ */ template(`<span class="inline-flex items-center gap-1 text-orange-500" title="Pending sync"><!> Pending</span>`);
var root_9$3 = /* @__PURE__ */ template(`<span class="inline-flex items-center gap-1 text-green-500" title="Synced"><!> Synced</span>`);
var root_10$3 = /* @__PURE__ */ template(`<button class="text-xs text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Reply</button>`);
var root_2$5 = /* @__PURE__ */ template(`<div class="bg-blue-100 p-2 rounded shadow text-sm flex gap-3 group relative"><div class="flex-shrink-0"><img class="w-8 h-8 rounded-full"></div> <div class="flex-1"><!> <div class="font-semibold text-blue-800"> </div> <div class="space-y-1"></div> <div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2 text-xs text-gray-500"><!> <span class="text-gray-400">•</span> <span> </span></div> <!></div></div></div>`);
var root_11 = /* @__PURE__ */ template(`<p class="text-center text-gray-400 italic mt-10">No messages yet.</p>`);
var root$4 = /* @__PURE__ */ template(`<div class="p-4 space-y-3"><!></div>`);
function MessageList($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $selectedConversationStore = () => store_get(selectedConversation, "$selectedConversationStore", $$stores);
  const $authStore = () => store_get(authStore, "$authStore", $$stores);
  const effectiveConversation = /* @__PURE__ */ mutable_source();
  const messages = /* @__PURE__ */ mutable_source();
  const sortedMessages = /* @__PURE__ */ mutable_source();
  const messageMap = /* @__PURE__ */ mutable_source();
  const currentUsername = /* @__PURE__ */ mutable_source();
  let conversation = prop($$props, "conversation", 8, null);
  const dispatch = createEventDispatcher();
  function getDisplaySender(sender) {
    return sender === get$1(currentUsername) ? "You" : sender;
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
      parts.push({
        type: "file",
        fileName: match[1],
        url: match[2]
      });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex)
      });
    }
    return parts.length > 0 ? parts : [{ type: "text", content }];
  }
  legacy_pre_effect(
    () => (deep_read_state(conversation()), $selectedConversationStore()),
    () => {
      set(effectiveConversation, conversation() || $selectedConversationStore());
    }
  );
  legacy_pre_effect(() => get$1(effectiveConversation), () => {
    var _a2;
    set(messages, ((_a2 = get$1(effectiveConversation)) == null ? void 0 : _a2.messages) ?? []);
  });
  legacy_pre_effect(() => get$1(messages), () => {
    set(sortedMessages, [...get$1(messages)].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  });
  legacy_pre_effect(() => get$1(messages), () => {
    set(messageMap, get$1(messages).reduce(
      (map, msg) => {
        if (msg.hash) map[msg.hash] = msg;
        return map;
      },
      {}
    ));
  });
  legacy_pre_effect(() => $authStore(), () => {
    var _a2, _b;
    set(currentUsername, (_b = (_a2 = $authStore()) == null ? void 0 : _a2.user) == null ? void 0 : _b.login);
  });
  legacy_pre_effect_reset();
  init();
  var div = root$4();
  var node = child(div);
  {
    var consequent_5 = ($$anchor2) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      each(node_1, 3, () => get$1(sortedMessages), (msg, index2) => `${msg.id || msg.timestamp}-${msg.sender}-${index2}`, ($$anchor3, msg) => {
        var div_1 = root_2$5();
        var div_2 = child(div_1);
        var img = child(div_2);
        var div_3 = sibling(div_2, 2);
        var node_2 = child(div_3);
        {
          var consequent = ($$anchor4) => {
            var div_4 = root_3$4();
            var div_5 = child(div_4);
            var text2 = child(div_5);
            var div_6 = sibling(div_5, 2);
            var text_1 = child(div_6);
            template_effect(
              ($0) => {
                set_text(text2, $0);
                set_text(text_1, get$1(messageMap)[get$1(msg).in_response_to].content);
              },
              [
                () => getDisplaySender(get$1(messageMap)[get$1(msg).in_response_to].sender)
              ],
              derived_safe_equal
            );
            append($$anchor4, div_4);
          };
          if_block(node_2, ($$render) => {
            if (get$1(msg).in_response_to && get$1(messageMap)[get$1(msg).in_response_to]) $$render(consequent);
          });
        }
        var div_7 = sibling(node_2, 2);
        var text_2 = child(div_7);
        var div_8 = sibling(div_7, 2);
        each(div_8, 5, () => parseMessageContent(get$1(msg).content), index, ($$anchor4, part) => {
          var fragment_1 = comment();
          var node_3 = first_child(fragment_1);
          {
            var consequent_1 = ($$anchor5) => {
              var span = root_5$4();
              var text_3 = child(span);
              template_effect(() => set_text(text_3, get$1(part).content));
              append($$anchor5, span);
            };
            var alternate = ($$anchor5, $$elseif) => {
              {
                var consequent_2 = ($$anchor6) => {
                  var a_1 = root_7$3();
                  var node_4 = child(a_1);
                  File_text(node_4, { class: "w-4 h-4" });
                  var span_1 = sibling(node_4, 2);
                  var text_4 = child(span_1);
                  var node_5 = sibling(span_1, 2);
                  External_link(node_5, { class: "w-3 h-3" });
                  template_effect(() => {
                    set_attribute(a_1, "href", get$1(part).url);
                    set_text(text_4, get$1(part).fileName);
                  });
                  append($$anchor6, a_1);
                };
                if_block(
                  $$anchor5,
                  ($$render) => {
                    if (get$1(part).type === "file") $$render(consequent_2);
                  },
                  $$elseif
                );
              }
            };
            if_block(node_3, ($$render) => {
              if (get$1(part).type === "text") $$render(consequent_1);
              else $$render(alternate, false);
            });
          }
          append($$anchor4, fragment_1);
        });
        var div_9 = sibling(div_8, 2);
        var div_10 = child(div_9);
        var node_6 = child(div_10);
        {
          var consequent_3 = ($$anchor4) => {
            var span_2 = root_8$1();
            var node_7 = child(span_2);
            Clock(node_7, { class: "w-3 h-3" });
            append($$anchor4, span_2);
          };
          var alternate_1 = ($$anchor4) => {
            var span_3 = root_9$3();
            var node_8 = child(span_3);
            Check(node_8, { class: "w-3 h-3" });
            append($$anchor4, span_3);
          };
          if_block(node_6, ($$render) => {
            if (get$1(msg).pending) $$render(consequent_3);
            else $$render(alternate_1, false);
          });
        }
        var span_4 = sibling(node_6, 4);
        var text_5 = child(span_4);
        var node_9 = sibling(div_10, 2);
        {
          var consequent_4 = ($$anchor4) => {
            var button = root_10$3();
            event("click", button, () => handleReply(get$1(msg)));
            append($$anchor4, button);
          };
          if_block(node_9, ($$render) => {
            if (get$1(msg).hash) $$render(consequent_4);
          });
        }
        template_effect(
          ($0, $1) => {
            set_attribute(img, "src", `https://github.com/${get$1(msg).sender ?? ""}.png`);
            set_attribute(img, "alt", get$1(msg).sender);
            set_text(text_2, $0);
            set_text(text_5, $1);
          },
          [
            () => getDisplaySender(get$1(msg).sender),
            () => new Date(get$1(msg).timestamp).toLocaleString()
          ],
          derived_safe_equal
        );
        append($$anchor3, div_1);
      });
      append($$anchor2, fragment);
    };
    var alternate_2 = ($$anchor2) => {
      var p = root_11();
      append($$anchor2, p);
    };
    if_block(node, ($$render) => {
      if (get$1(sortedMessages).length > 0) $$render(consequent_5);
      else $$render(alternate_2, false);
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
  const key = `${prefix}/${timestamp}_${safeName}`;
  const formData = new FormData();
  formData.append("key", key);
  formData.append("file", file);
  const response = await fetch(`https://${bucket}.s3.amazonaws.com/`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    throw new Error("Failed to upload file to S3");
  }
  return {
    url: `https://${bucket}.s3.amazonaws.com/${key}`,
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
  var _a2, _b, _c;
  if (!((_a2 = repo.config) == null ? void 0 : _a2.binary_storage_type) || !((_c = (_b = repo.config) == null ? void 0 : _b.storage_info) == null ? void 0 : _c.url)) {
    throw new Error("No storage configured for this repository");
  }
  const storageType = repo.config.binary_storage_type;
  const configUrl = repo.config.storage_info.url;
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
var root_1$4 = /* @__PURE__ */ template(`<div class="bg-gray-100 px-3 py-2 rounded text-sm flex items-center justify-between"><div class="flex-1"><div class="text-xs text-gray-500 mb-1"> </div> <div class="text-gray-700 truncate"> </div></div> <button class="ml-2 text-gray-500 hover:text-gray-700"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
var root_2$4 = /* @__PURE__ */ template(`<div class="bg-blue-50 px-3 py-2 rounded text-sm flex items-center justify-between"><div class="flex items-center gap-2 flex-1"><!> <span class="text-blue-700 truncate"> </span> <span class="text-xs text-blue-500"> </span></div> <button class="ml-2 text-blue-500 hover:text-blue-700"><!></button></div>`);
var root_3$3 = /* @__PURE__ */ template(`<input type="file" class="hidden"> <button class="text-gray-500 hover:text-gray-700 p-2" title="Attach file"><!></button>`, 1);
var root$3 = /* @__PURE__ */ template(`<div class="space-y-2"><!> <!> <div class="flex items-center gap-2"><!> <button class="text-gray-500 hover:text-gray-700 p-2"><!></button> <input type="text" class="flex-1 border rounded px-3 py-2 text-sm"> <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50"> </button></div></div>`);
function MessageInput($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $onlinePeers = () => store_get(onlinePeers, "$onlinePeers", $$stores);
  const hasStorageConfigured = /* @__PURE__ */ mutable_source();
  const localPeerId = /* @__PURE__ */ mutable_source();
  const availablePeers = /* @__PURE__ */ mutable_source();
  let conversation = prop($$props, "conversation", 8);
  let replyingTo = prop($$props, "replyingTo", 12, null);
  let repo = prop($$props, "repo", 8, null);
  let message = /* @__PURE__ */ mutable_source("");
  let typingTimeout = null;
  let isTyping = false;
  let fileInput = /* @__PURE__ */ mutable_source();
  let uploadingFile = /* @__PURE__ */ mutable_source(false);
  let selectedFile = /* @__PURE__ */ mutable_source(null);
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
    if (get$1(fileInput)) {
      mutate(fileInput, get$1(fileInput).value = "");
    }
  }
  async function send() {
    var _a2, _b;
    if (!get$1(message).trim() && !get$1(selectedFile)) return;
    const auth = get(authStore);
    const username = (_a2 = auth.user) == null ? void 0 : _a2.login;
    const token = auth.token;
    let fileUrl = null;
    let fileName = null;
    if (get$1(selectedFile) && repo()) {
      set(uploadingFile, true);
      try {
        const uploadResult = await uploadFile(get$1(selectedFile), repo(), token);
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
    let messageContent = get$1(message).trim();
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
      in_response_to: ((_b = replyingTo()) == null ? void 0 : _b.hash) || null,
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
    if (isTyping) {
      isTyping = false;
      broadcastTypingStatus(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
    set(message, "");
    replyingTo(null);
    set(selectedFile, null);
    if (get$1(fileInput)) {
      mutate(fileInput, get$1(fileInput).value = "");
    }
  }
  function initiateCall() {
    if (get$1(availablePeers).length > 0) {
      startCall(get$1(availablePeers)[0].session_id);
    } else {
      alert("No online peers to call in this conversation.");
    }
  }
  legacy_pre_effect(() => deep_read_state(repo()), () => {
    var _a2, _b, _c, _d, _e;
    set(hasStorageConfigured, ((_b = (_a2 = repo()) == null ? void 0 : _a2.config) == null ? void 0 : _b.binary_storage_type) && ((_e = (_d = (_c = repo()) == null ? void 0 : _c.config) == null ? void 0 : _d.storage_info) == null ? void 0 : _e.url));
  });
  legacy_pre_effect(() => getLocalPeerId, () => {
    set(localPeerId, getLocalPeerId());
  });
  legacy_pre_effect(
    () => ($onlinePeers(), get$1(localPeerId), deep_read_state(conversation())),
    () => {
      var _a2;
      console.log("[Call Debug] onlinePeers:", $onlinePeers());
      console.log("[Call Debug] localPeerId:", get$1(localPeerId));
      console.log("[Call Debug] conversation.participants:", (_a2 = conversation()) == null ? void 0 : _a2.participants);
    }
  );
  legacy_pre_effect(
    () => ($onlinePeers(), get$1(localPeerId), deep_read_state(conversation())),
    () => {
      set(availablePeers, $onlinePeers().filter((p) => {
        var _a2, _b;
        if (p.session_id === get$1(localPeerId)) return false;
        if (((_b = (_a2 = conversation()) == null ? void 0 : _a2.participants) == null ? void 0 : _b.length) > 0) {
          return conversation().participants.includes(p.username);
        }
        return true;
      }));
    }
  );
  legacy_pre_effect(() => get$1(availablePeers), () => {
    console.log("[Call Debug] availablePeers:", get$1(availablePeers));
  });
  legacy_pre_effect_reset();
  init();
  var div = root$3();
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var div_1 = root_1$4();
      var div_2 = child(div_1);
      var div_3 = child(div_2);
      var text2 = child(div_3);
      var div_4 = sibling(div_3, 2);
      var text_1 = child(div_4);
      var button = sibling(div_2, 2);
      template_effect(() => {
        set_text(text2, `Replying to ${replyingTo().sender ?? ""}`);
        set_text(text_1, replyingTo().content);
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
      var div_5 = root_2$4();
      var div_6 = child(div_5);
      var node_2 = child(div_6);
      Paperclip(node_2, { class: "w-4 h-4 text-blue-600" });
      var span = sibling(node_2, 2);
      var text_2 = child(span);
      var span_1 = sibling(span, 2);
      var text_3 = child(span_1);
      var button_1 = sibling(div_6, 2);
      var node_3 = child(button_1);
      X(node_3, { class: "w-4 h-4" });
      template_effect(
        ($0) => {
          set_text(text_2, get$1(selectedFile).name);
          set_text(text_3, `(${$0 ?? ""} KB)`);
          button_1.disabled = get$1(uploadingFile);
        },
        [
          () => (get$1(selectedFile).size / 1024).toFixed(1)
        ],
        derived_safe_equal
      );
      event("click", button_1, removeSelectedFile);
      append($$anchor2, div_5);
    };
    if_block(node_1, ($$render) => {
      if (get$1(selectedFile)) $$render(consequent_1);
    });
  }
  var div_7 = sibling(node_1, 2);
  var node_4 = child(div_7);
  {
    var consequent_3 = ($$anchor2) => {
      var fragment = root_3$3();
      var input = first_child(fragment);
      bind_this(input, ($$value) => set(fileInput, $$value), () => get$1(fileInput));
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
          if (get$1(uploadingFile)) $$render(consequent_2);
          else $$render(alternate, false);
        });
      }
      template_effect(() => {
        input.disabled = get$1(uploadingFile);
        button_2.disabled = get$1(uploadingFile);
      });
      event("change", input, handleFileSelect);
      event("click", button_2, () => get$1(fileInput).click());
      append($$anchor2, fragment);
    };
    if_block(node_4, ($$render) => {
      if (get$1(hasStorageConfigured)) $$render(consequent_3);
    });
  }
  var button_3 = sibling(node_4, 2);
  var node_6 = child(button_3);
  const expression = /* @__PURE__ */ derived_safe_equal(() => get$1(availablePeers).length > 0 ? "text-green-600" : "text-gray-300");
  Video(node_6, {
    get class() {
      return `w-5 h-5 ${get$1(expression) ?? ""}`;
    }
  });
  var input_1 = sibling(button_3, 2);
  var button_4 = sibling(input_1, 2);
  var text_4 = child(button_4);
  template_effect(
    ($0) => {
      set_attribute(button_3, "title", get$1(availablePeers).length > 0 ? `Call ${get$1(availablePeers)[0].username}` : "No peers online");
      button_3.disabled = get$1(availablePeers).length === 0;
      set_attribute(input_1, "placeholder", replyingTo() ? "Type your reply..." : "Type a message...");
      input_1.disabled = get$1(uploadingFile);
      button_4.disabled = $0;
      set_text(text_4, get$1(uploadingFile) ? "Uploading..." : "Send");
    },
    [
      () => get$1(uploadingFile) || !get$1(message).trim() && !get$1(selectedFile)
    ],
    derived_safe_equal
  );
  event("click", button_3, initiateCall);
  bind_value(input_1, () => get$1(message), ($$value) => set(message, $$value));
  event("keydown", input_1, (e) => e.key === "Enter" && !e.shiftKey && send());
  event("input", input_1, handleTyping);
  event("click", button_4, send);
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root_3$2 = /* @__PURE__ */ template(`<button class="hover:text-blue-600 cursor-pointer underline"> </button>`);
var root_7$2 = /* @__PURE__ */ ns_template(`<svg class="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3z"></path><path d="M1 6h18l-2 6H3L1 6z"></path></svg>`);
var root_8 = /* @__PURE__ */ template(`<div class="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse"><div class="flex gap-0.5"><div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 0ms;"></div> <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 150ms;"></div> <div class="w-1 h-1 bg-white rounded-full animate-bounce" style="animation-delay: 300ms;"></div></div></div>`);
var root_6$2 = /* @__PURE__ */ template(`<div class="relative"><img class="w-6 h-6 rounded-full border-2 border-white"> <!> <!></div>`);
var root_5$3 = /* @__PURE__ */ template(`<div class="flex items-center"></div>`);
var root_9$2 = /* @__PURE__ */ template(`<button class="bg-red-500 text-white px-3 py-1 rounded text-xs">End Call</button>`);
var root_19$1 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center items-center py-2"><span class="bg-yellow-300 text-black px-2 py-1 rounded font-bold text-xs">Remote is sharing their screen<!>!</span></div>`);
var root_23 = /* @__PURE__ */ template(`<button class="bg-yellow-100 border px-3 py-1 rounded">🔄 Change Screen Source</button>`);
var root_24 = /* @__PURE__ */ template(`<span>🎤</span>`);
var root_25 = /* @__PURE__ */ template(`<span>🔇</span>`);
var root_26 = /* @__PURE__ */ template(`<span>📷</span>`);
var root_27 = /* @__PURE__ */ template(`<span>🚫📷</span>`);
var root_28 = /* @__PURE__ */ template(`<span>⏹️ Stop Recording</span>`);
var root_29 = /* @__PURE__ */ template(`<span>⏺️ Start Recording</span>`);
var root_30 = /* @__PURE__ */ template(`<div class="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 animate-pulse"><span>⏺️ Recording...</span></div>`);
var root_31 = /* @__PURE__ */ template(`<div class="fixed top-16 right-4 z-50 bg-yellow-400 text-black px-4 py-2 rounded shadow-lg flex items-center gap-2"><span>⚠️ Peer is recording</span></div>`);
var root_10$2 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center items-center py-4 gap-4"><div><div class="text-xs text-gray-400 mb-1">Local Video</div> <video autoplay playsinline="" width="200" height="150" style="background: #222;"><track kind="captions"></video> <div class="flex flex-row gap-2 justify-center mt-1"><span class="text-xs"><!></span> <span class="text-xs"><!></span></div></div> <div><div class="text-xs text-gray-400 mb-1">Remote Video</div> <video autoplay playsinline="" width="200" height="150" style="background: #222;"><track kind="captions"></video> <div class="flex flex-row gap-2 justify-center mt-1"><span class="text-xs"><!></span> <span class="text-xs"><!></span></div></div></div> <!> <div class="flex flex-row items-center gap-3 justify-center mt-2"><label class="bg-gray-100 border px-3 py-1 rounded cursor-pointer">📎 Share File <input type="file" style="display:none"></label> <button class="bg-blue-100 border px-3 py-1 rounded"><!></button> <!> <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1"><!></button> <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1"><!></button> <button class="bg-red-200 border px-3 py-1 rounded flex items-center gap-1 font-bold"><!></button></div> <!> <!>`, 3);
var root_33 = /* @__PURE__ */ template(`<div class="fixed z-50 flex flex-col items-end cursor-move" tabindex="-1" aria-hidden="true"><div class="bg-white border shadow-lg rounded-lg p-2 flex flex-col items-center relative"><button class="absolute top-1 right-1 text-gray-400 hover:text-black text-lg font-bold px-1" style="z-index:2;" title="Close Preview">×</button> <div class="text-xs text-gray-500 mb-1">Screen Share Preview</div> <video autoplay playsinline="" width="160" height="100" style="border-radius: 0.5rem; background: #222;"><track kind="captions"></video></div></div>`, 2);
var root_34 = /* @__PURE__ */ template(`<button class="fixed bottom-6 right-6 z-50 bg-white border shadow rounded-full px-3 py-2 text-xs font-bold hover:bg-blue-100">Show Screen Preview</button>`);
var root_35 = /* @__PURE__ */ template(`<div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"><div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3"><div class="font-bold mb-2">Select what to share</div> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Entire Screen</button> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Application Window</button> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Browser Tab</button> <button class="mt-2 text-sm text-gray-500 hover:text-black">Cancel</button></div></div>`);
var root_36 = /* @__PURE__ */ template(`<div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"><div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3"><div class="font-bold mb-2">Choose upload destination</div> <button class="bg-blue-200 rounded px-3 py-2 hover:bg-blue-300">Google Drive</button> <button class="bg-yellow-200 rounded px-3 py-2 hover:bg-yellow-300">S3</button> <button class="mt-2 text-sm text-gray-500 hover:text-black">Cancel</button></div></div>`);
var root_2$3 = /* @__PURE__ */ template(`<div class="flex flex-col h-full"><div class="flex items-center justify-between px-4 py-2 border-b"><div><h2 class="text-xl font-semibold"> </h2> <button class="ml-4 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"> </button> <button class="ml-2 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200" title="Commit and push messages now">💾 Commit Now</button> <p class="text-sm text-gray-500"> </p></div> <div class="text-sm text-gray-500"><!></div> <div class="ml-4 flex items-center gap-3"><!> <!></div></div> <!> <!> <!> <!> <div class="flex-1 overflow-y-auto"><!></div> <div class="border-t p-4"><!></div></div>`);
var root_37 = /* @__PURE__ */ template(`<p class="text-gray-400 italic text-center mt-20">Select a conversation from the sidebar to view it.</p>`);
var root_44 = /* @__PURE__ */ ns_template(`<svg class="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v1h4V5a2 2 0 00-2-2zM3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3z"></path><path d="M1 6h18l-2 6H3L1 6z"></path></svg>`);
var root_45 = /* @__PURE__ */ template(`<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>`);
var root_46 = /* @__PURE__ */ template(`<span class="text-xs text-gray-500"> </span>`);
var root_43 = /* @__PURE__ */ template(`<div><div class="flex items-center gap-3"><div class="relative"><img> <!> <!></div> <span> <!></span></div> <div class="ml-auto text-xs text-gray-500"><!></div></div>`);
var root_39 = /* @__PURE__ */ template(`<!> <!>`, 1);
var root_38 = /* @__PURE__ */ template(`<div class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"><div class="bg-white rounded-lg p-6 max-w-md w-full mx-4"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Participants</h3> <button class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="space-y-2"><!></div></div></div>`);
var root$2 = /* @__PURE__ */ template(`<!> <!>`, 1);
function Chats($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $peerConnections = () => store_get(peerConnections, "$peerConnections", $$stores);
  const $typingUsers = () => store_get(typingUsers, "$typingUsers", $$stores);
  const $selectedConversationStore = () => store_get(selectedConversation, "$selectedConversationStore", $$stores);
  const $onlinePeers = () => store_get(onlinePeers, "$onlinePeers", $$stores);
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
  let showShareTypeModal = /* @__PURE__ */ mutable_source(false);
  let previewVisible = /* @__PURE__ */ mutable_source(true);
  let micOn = /* @__PURE__ */ mutable_source(true);
  let cameraOn = /* @__PURE__ */ mutable_source(true);
  let remoteMicOn = /* @__PURE__ */ mutable_source(true);
  let remoteCameraOn = /* @__PURE__ */ mutable_source(true);
  let recording = /* @__PURE__ */ mutable_source(false);
  let remoteRecording = /* @__PURE__ */ mutable_source(false);
  let replyingTo = /* @__PURE__ */ mutable_source(null);
  let pollingActive = /* @__PURE__ */ mutable_source(true);
  const unsubscribePolling = presencePolling.subscribe((map) => {
    if (get$1(selectedConversation$1) && get$1(selectedConversation$1).repo) {
      set(pollingActive, map[get$1(selectedConversation$1).repo] !== false);
    }
  });
  let mediaRecorder = null;
  let recordedChunks = [];
  let previewPos = /* @__PURE__ */ mutable_source({ x: 0, y: 0 });
  let previewDragging = false;
  let previewOffset = { x: 0, y: 0 };
  let previewRef = /* @__PURE__ */ mutable_source();
  let uploadDestination = /* @__PURE__ */ mutable_source(null);
  let showUploadDestinationModal = /* @__PURE__ */ mutable_source(false);
  let localVideoEl = /* @__PURE__ */ mutable_source();
  let remoteVideoEl = /* @__PURE__ */ mutable_source();
  let screenSharePreviewEl = /* @__PURE__ */ mutable_source();
  function openShareTypeModal() {
    set(showShareTypeModal, true);
  }
  function closeShareTypeModal() {
    set(showShareTypeModal, false);
  }
  function selectShareType(type) {
    set(showShareTypeModal, false);
    startScreenShare(true, type);
  }
  function onPreviewMouseDown(e) {
    previewDragging = true;
    previewOffset = {
      x: e.clientX - get$1(previewPos).x,
      y: e.clientY - get$1(previewPos).y
    };
    document.addEventListener("mousemove", onPreviewMouseMove);
    document.addEventListener("mouseup", onPreviewMouseUp);
  }
  function onPreviewMouseMove(e) {
    if (!previewDragging) return;
    mutate(previewPos, get$1(previewPos).x = e.clientX - previewOffset.x);
    mutate(previewPos, get$1(previewPos).y = e.clientY - previewOffset.y);
  }
  function onPreviewMouseUp() {
    previewDragging = false;
    document.removeEventListener("mousemove", onPreviewMouseMove);
    document.removeEventListener("mouseup", onPreviewMouseUp);
  }
  function closePreview() {
    set(previewVisible, false);
  }
  function reopenPreview() {
    set(previewVisible, true);
  }
  function resetUploadDestination() {
    set(uploadDestination, null);
    set(showUploadDestinationModal, false);
  }
  function togglePresence() {
    var _a2;
    if (!get$1(selectedConversation$1)) return;
    const repoFullName2 = get$1(selectedConversation$1).repo;
    const token = localStorage.getItem("skygit_token");
    const auth = get(authStore);
    const username = (_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login;
    if (!token || !username) return;
    if (get$1(pollingActive)) {
      setPollingState(repoFullName2, false);
      shutdownPeerManager();
    } else {
      setPollingState(repoFullName2, true);
      const sessionId2 = getOrCreateSessionId(repoFullName2);
      console.log("[SkyGit] Using session ID for toggle:", sessionId2);
      initializePeerManager({
        _token: token,
        _repoFullName: repoFullName2,
        _username: username,
        _sessionId: sessionId2
      });
    }
  }
  function forceCommitConversation() {
    if (!get$1(selectedConversation$1)) return;
    const key = `${get$1(selectedConversation$1).repo}::${get$1(selectedConversation$1).id}`;
    flushConversationCommitQueue([key]);
  }
  onDestroy(() => {
    unsubscribePolling();
  });
  async function chooseUploadDestinationIfNeeded() {
    let repo = get$1(selectedConversation$1) && get$1(selectedConversation$1).repo;
    let decrypted = get(settingsStore).decrypted;
    let repoS3 = null, repoDrive = null, userS3 = null, userDrive = null;
    if (repo && window.selectedRepo && window.selectedRepo.config) {
      const url = window.selectedRepo.config.storage_info && window.selectedRepo.config.storage_info.url;
      if (url && decrypted[url]) {
        if (decrypted[url].type === "s3") repoS3 = decrypted[url];
        if (decrypted[url].type === "google_drive") repoDrive = decrypted[url];
      }
    }
    for (const url in decrypted) {
      if (decrypted[url].type === "s3" && !repoS3) userS3 = decrypted[url];
      if (decrypted[url].type === "google_drive" && !repoDrive) userDrive = decrypted[url];
    }
    const available = [];
    if (repoS3 || userS3) available.push("s3");
    if (repoDrive || userDrive) available.push("google_drive");
    if (available.length === 2) {
      set(showUploadDestinationModal, true);
      return new Promise((resolve) => {
        const interval = setInterval(
          () => {
            if (get$1(uploadDestination)) {
              set(showUploadDestinationModal, false);
              clearInterval(interval);
              resolve(get$1(uploadDestination));
            }
          },
          100
        );
      });
    } else if (available.length === 1) {
      return available[0];
    } else {
      return null;
    }
  }
  peerConnections.subscribe((update2) => {
    Object.entries(update2).filter(([_sid, info]) => info.status === "connected").map(([sid, info]) => ({ session_id: sid, username: info.username }));
  });
  currentContent.subscribe((value) => {
    var _a2;
    console.log("[SkyGit][Presence] currentContent changed:", value);
    set(selectedConversation$1, value);
    selectedConversation.set(value);
    if (value && value.repo) {
      set(currentRepo, getRepoByFullName(value.repo));
    } else {
      set(currentRepo, null);
    }
    const token = localStorage.getItem("skygit_token");
    const auth = get(authStore);
    const username = ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login) || null;
    const repo = get$1(selectedConversation$1) ? get$1(selectedConversation$1).repo : null;
    console.log("[SkyGit][Presence] authStore value:", auth);
    console.log("[SkyGit][Presence] onConversationSelect: token", token, "username", username, "repo", repo, "selectedConversation", get$1(selectedConversation$1));
    (async () => {
      if (token && get$1(selectedConversation$1) && get$1(selectedConversation$1).repo && get$1(selectedConversation$1).id && (!get$1(selectedConversation$1).messages || !get$1(selectedConversation$1).messages.length)) {
        try {
          const headers2 = {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github+json"
          };
          const convoPath = get$1(selectedConversation$1).path;
          const url = `https://api.github.com/repos/${get$1(selectedConversation$1).repo}/contents/${convoPath}`;
          const res = await fetch(url, { headers: headers2 });
          if (res.ok) {
            const blob = await res.json();
            const decoded = JSON.parse(atob(blob.content));
            if (decoded && Array.isArray(decoded.messages)) {
              const updatedConversation = {
                ...get$1(selectedConversation$1),
                messages: decoded.messages,
                path: convoPath
                // Update to the path that actually worked
              };
              set(selectedConversation$1, updatedConversation);
              selectedConversation.set(updatedConversation);
              conversations.update((map) => {
                const list = map[updatedConversation.repo] || [];
                const updated = list.map((c) => c.id === updatedConversation.id ? updatedConversation : c);
                return { ...map, [updatedConversation.repo]: updated };
              });
            }
          } else if (res.status === 404) {
            console.warn("[SkyGit] Conversation file was deleted from GitHub");
            const removedConversation = get$1(selectedConversation$1);
            const conversationTitle = (removedConversation == null ? void 0 : removedConversation.title) || "Unknown";
            if (removedConversation) {
              conversations.update((map) => {
                const list = map[removedConversation.repo] || [];
                const filtered = list.filter((c) => c.id !== removedConversation.id);
                return { ...map, [removedConversation.repo]: filtered };
              });
            }
            set(selectedConversation$1, null);
            selectedConversation.set(null);
            currentRoute.set("chats");
            currentContent.set(null);
            const token2 = get(authStore).token;
            if (token2 && removedConversation) {
              removeFromSkyGitConversations(token2, removedConversation);
            }
            alert(`Conversation "${conversationTitle}" was deleted from the repository and has been removed from your local list.`);
          } else {
            console.warn("[SkyGit] Failed to load conversation, status:", res.status);
            const updatedConversation = {
              ...get$1(selectedConversation$1),
              messages: []
            };
            set(selectedConversation$1, updatedConversation);
            selectedConversation.set(updatedConversation);
          }
        } catch (err) {
          console.warn("[SkyGit] Failed to fetch conversation contents", err);
        }
      }
    })();
    if (token && username && repo) {
      const map = get(presencePolling);
      set(pollingActive, map[repo] !== false);
      if (get$1(pollingActive)) {
        const sessionId2 = getOrCreateSessionId(repo);
        console.log("[SkyGit] Using session ID:", sessionId2);
        console.log("[SkyGit] Session ID timestamp:", Date.now());
        console.log("[SkyGit] Session ID length:", sessionId2.length);
        initializePeerManager({
          _token: token,
          _repoFullName: repo,
          _username: username,
          _sessionId: sessionId2
        });
        setTimeout(
          () => {
            updateMyConversations([repo]);
          },
          2e3
        );
      } else {
        shutdownPeerManager();
      }
    }
  });
  function endCall2() {
    set(callActive, false);
    currentCallPeer = null;
    if (get$1(localStream2)) {
      get$1(localStream2).getTracks().forEach((t) => t.stop());
      set(localStream2, null);
    }
    set(remoteStream2, null);
    if (currentCallPeer) {
      sendMessageToPeer(currentCallPeer, {
        type: "signal",
        subtype: "call-end",
        conversationId: get$1(selectedConversation$1).id
      });
    }
  }
  function handleFileInput(event2) {
    const file = event2.target.files[0];
    if (!file || !get$1(callActive) || !currentCallPeer) return;
    peerConnections.update((conns) => {
      var _a2;
      const peer = (_a2 = conns[currentCallPeer]) == null ? void 0 : _a2.conn;
      if (peer && typeof peer.sendFile === "function") {
        peer.sendFile(file);
      }
      return conns;
    });
  }
  async function startScreenShare(withAudio = true, type = "screen") {
    try {
      let displayMediaOptions = { video: true, audio: withAudio };
      if (type === "tab") {
        displayMediaOptions = {
          video: { displaySurface: "browser", cursor: "always" },
          audio: withAudio
        };
      } else if (type === "window") {
        displayMediaOptions = {
          video: { displaySurface: "window", cursor: "always" },
          audio: withAudio
        };
      } else if (type === "screen") {
        displayMediaOptions = {
          video: { displaySurface: "monitor", cursor: "always" },
          audio: withAudio
        };
      }
      set(screenShareStream, await navigator.mediaDevices.getDisplayMedia(displayMediaOptions));
      set(screenSharing, true);
      peerConnections.update((conns) => {
        var _a2;
        const peer = (_a2 = conns[currentCallPeer]) == null ? void 0 : _a2.conn;
        if (peer && peer.replaceVideoTrack) {
          peer.replaceVideoTrack(get$1(screenShareStream).getVideoTracks()[0]);
          if (peer.sendScreenShareSignal) {
            peer.sendScreenShareSignal(true, { audio: withAudio });
          }
        }
        return conns;
      });
      set(localStream2, get$1(screenShareStream));
      get$1(screenShareStream).getVideoTracks()[0].onended = stopScreenShare;
    } catch (err) {
      console.error("Screen share error:", err);
    }
  }
  function stopScreenShare() {
    if (get$1(screenShareStream)) {
      get$1(screenShareStream).getTracks().forEach((track) => track.stop());
      set(screenShareStream, null);
    }
    set(screenSharing, false);
    peerConnections.update((conns) => {
      var _a2;
      const peer = (_a2 = conns[currentCallPeer]) == null ? void 0 : _a2.conn;
      if (peer && peer.replaceVideoTrack && localCameraStream) ;
      return conns;
    });
    set(localStream2, localCameraStream);
  }
  async function changeScreenSource() {
    if (!get$1(screenSharing)) return;
    try {
      const newStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      peerConnections.update((conns) => {
        var _a2;
        const peer = (_a2 = conns[currentCallPeer]) == null ? void 0 : _a2.conn;
        if (peer && peer.replaceVideoTrack) {
          peer.replaceVideoTrack(newStream.getVideoTracks()[0]);
        }
        return conns;
      });
      if (get$1(screenShareStream)) get$1(screenShareStream).getTracks().forEach((track) => track.stop());
      set(screenShareStream, newStream);
      set(localStream2, newStream);
      newStream.getVideoTracks()[0].onended = stopScreenShare;
    } catch (err) {
      console.error("Change screen source error:", err);
    }
  }
  function toggleMic() {
    set(micOn, !get$1(micOn));
    if (get$1(localStream2)) {
      get$1(localStream2).getAudioTracks().forEach((track) => track.enabled = get$1(micOn));
    }
    sendMediaStatus();
  }
  function toggleCamera() {
    set(cameraOn, !get$1(cameraOn));
    if (get$1(localStream2)) {
      get$1(localStream2).getVideoTracks().forEach((track) => track.enabled = get$1(cameraOn));
    }
    sendMediaStatus();
  }
  function sendMediaStatus() {
    peerConnections.update((conns) => {
      var _a2;
      const peer = (_a2 = conns[currentCallPeer]) == null ? void 0 : _a2.conn;
      if (peer && peer.send) {
        peer.send({
          type: "media-status",
          micOn: get$1(micOn),
          cameraOn: get$1(cameraOn)
        });
      }
      return conns;
    });
  }
  function notifyRecordingStatus(status) {
    peerConnections.update((conns) => {
      var _a2;
      const peer = (_a2 = conns[currentCallPeer]) == null ? void 0 : _a2.conn;
      if (peer && peer.send) {
        peer.send({ type: "recording-status", recording: status });
      }
      return conns;
    });
  }
  function startRecording() {
    if (!get$1(localStream2)) return;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(get$1(localStream2), { mimeType: "video/webm; codecs=vp9" });
    mediaRecorder.ondataavailable = (event2) => {
      if (event2.data.size > 0) recordedChunks.push(event2.data);
    };
    mediaRecorder.onstop = handleRecordingStop;
    mediaRecorder.start();
    set(recording, true);
    notifyRecordingStatus(true);
  }
  function stopRecording() {
    if (mediaRecorder && get$1(recording)) {
      mediaRecorder.stop();
      set(recording, false);
      notifyRecordingStatus(false);
    }
  }
  async function handleRecordingStop() {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    await uploadAndShareRecording(blob);
  }
  if (typeof window !== "undefined") {
    window.skygitOnRecordingStatus = (status) => {
      set(remoteRecording, !!status.recording);
    };
  }
  if (typeof window !== "undefined") {
    window.skygitOnScreenShare = (active, meta) => {
      set(remoteScreenSharing, active);
      set(remoteScreenShareMeta, meta || null);
    };
  }
  if (typeof window !== "undefined") {
    window.skygitOnMediaStatus = (status) => {
      if (typeof status.micOn === "boolean") set(remoteMicOn, status.micOn);
      if (typeof status.cameraOn === "boolean") set(remoteCameraOn, status.cameraOn);
    };
  }
  if (typeof window !== "undefined") {
    window.skygitFileReceiveProgress = (meta, received, total) => {
      meta.name;
      if (received === total) {
        setTimeout(
          () => {
          },
          3e3
        );
      }
    };
    window.skygitFileSendProgress = (meta, sent, total) => {
      if (sent === total) {
        setTimeout(
          () => {
          },
          2e3
        );
      }
    };
  }
  async function uploadToS32(blob, cred) {
    const fileName = `skygit-recording-${Date.now()}.webm`;
    const bucket = cred.bucket;
    const region = cred.region;
    if (!bucket || !region) {
      alert("S3 credential missing bucket or region.");
      return null;
    }
    const endpoint = cred.endpoint || `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
    const putRes = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "video/webm" },
      body: blob
    });
    if (!putRes.ok) {
      alert("Failed to upload to S3. (If this is a private bucket, you must implement AWS Signature v4 client-side or use a backend proxy.)");
      return null;
    }
    const publicUrl = endpoint.split("?")[0];
    return publicUrl;
  }
  async function uploadAndShareRecording(blob) {
    let decrypted = get(settingsStore).decrypted;
    let repo = get$1(selectedConversation$1) && get$1(selectedConversation$1).repo;
    let repoS3 = null, repoDrive = null, userS3 = null, userDrive = null;
    if (repo && window.selectedRepo && window.selectedRepo.config) {
      const url = window.selectedRepo.config.storage_info && window.selectedRepo.config.storage_info.url;
      if (url && decrypted[url]) {
        if (decrypted[url].type === "s3") repoS3 = decrypted[url];
        if (decrypted[url].type === "google_drive") repoDrive = decrypted[url];
      }
    }
    for (const url in decrypted) {
      if (decrypted[url].type === "s3" && !repoS3) userS3 = decrypted[url];
      if (decrypted[url].type === "google_drive" && !repoDrive) userDrive = decrypted[url];
    }
    let cred = null;
    let destination = await chooseUploadDestinationIfNeeded();
    if (!destination) {
      alert("No upload destination (S3 or Google Drive) configured.");
      return;
    }
    if (destination === "s3") cred = repoS3 || userS3;
    if (destination === "google_drive") cred = repoDrive || userDrive;
    let link2 = null;
    if (destination === "s3") {
      link2 = await uploadToS32(blob, cred);
    } else if (destination === "google_drive") {
      link2 = await uploadAndShareRecordingGoogleDrive(blob, cred);
    }
    if (link2) {
      sendMessageToPeer(currentCallPeer, {
        type: "chat",
        content: `📹 Recording: ${link2}`
      });
      alert("Recording uploaded and link shared!");
    }
  }
  async function uploadAndShareRecordingGoogleDrive(blob, cred) {
    let accessToken;
    try {
      accessToken = await getGoogleAccessToken(cred);
    } catch (e) {
      alert("Google Drive authentication failed: " + e.message);
      return null;
    }
    const metadata = {
      name: `SkyGit Recording ${(/* @__PURE__ */ new Date()).toISOString()}.webm`,
      mimeType: "video/webm"
    };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", blob);
    const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: { Authorization: "Bearer " + accessToken },
      body: form
    });
    if (!uploadRes.ok) {
      alert("Failed to upload to Google Drive");
      return null;
    }
    const fileData = await uploadRes.json();
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "reader", type: "anyone" })
    });
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}?fields=webViewLink,webContentLink`, {
      headers: { Authorization: "Bearer " + accessToken }
    });
    const meta = await metaRes.json();
    return meta.webViewLink || meta.webContentLink;
  }
  async function getGoogleAccessToken(cred) {
    const params = new URLSearchParams();
    if (cred.client_id) params.append("client_id", cred.client_id);
    if (cred.client_secret) params.append("client_secret", cred.client_secret);
    params.append("refresh_token", cred.refresh_token);
    params.append("grant_type", "refresh_token");
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
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
  let syncInterval = /* @__PURE__ */ mutable_source(null);
  async function syncMessagesFromGitHub() {
    if (!get$1(selectedConversation$1) || !get$1(selectedConversation$1).path || !get$1(selectedConversation$1).repo) return;
    const token = localStorage.getItem("skygit_token");
    if (!token) return;
    try {
      const headers2 = {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json"
      };
      const url = `https://api.github.com/repos/${get$1(selectedConversation$1).repo}/contents/${get$1(selectedConversation$1).path}`;
      const res = await fetch(url, { headers: headers2 });
      if (res.ok) {
        const blob = await res.json();
        const remoteConversation = JSON.parse(atob(blob.content));
        if (remoteConversation && Array.isArray(remoteConversation.messages)) {
          const localMessages = get$1(selectedConversation$1).messages || [];
          const messageMap = /* @__PURE__ */ new Map();
          localMessages.forEach((msg) => {
            if (msg.id) messageMap.set(msg.id, msg);
          });
          remoteConversation.messages.forEach((msg) => {
            if (msg.id) messageMap.set(msg.id, msg);
          });
          const mergedMessages = Array.from(messageMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          if (mergedMessages.length > localMessages.length) {
            console.log(`[SkyGit] Synced ${mergedMessages.length - localMessages.length} new messages from GitHub`);
            const updatedConversation = {
              ...get$1(selectedConversation$1),
              messages: mergedMessages,
              participants: Array.from(/* @__PURE__ */ new Set([
                ...get$1(selectedConversation$1).participants || [],
                ...remoteConversation.participants || []
              ]))
            };
            set(selectedConversation$1, updatedConversation);
            selectedConversation.set(updatedConversation);
            conversations.update((map) => {
              const list = map[updatedConversation.repo] || [];
              const updated = list.map((c) => c.id === updatedConversation.id ? updatedConversation : c);
              return { ...map, [updatedConversation.repo]: updated };
            });
          }
        }
      }
    } catch (err) {
      console.warn("[SkyGit] Failed to sync messages from GitHub:", err);
    }
  }
  function cleanupPresence() {
    shutdownPeerManager();
    if (get$1(syncInterval)) clearInterval(get$1(syncInterval));
  }
  window.addEventListener("beforeunload", cleanupPresence);
  onDestroy(() => {
    if (get$1(syncInterval)) clearInterval(get$1(syncInterval));
  });
  legacy_pre_effect(
    () => (get$1(localVideoEl), get$1(localStream2)),
    () => {
      if (get$1(localVideoEl) && get$1(localStream2)) {
        mutate(localVideoEl, get$1(localVideoEl).srcObject = get$1(localStream2));
      }
    }
  );
  legacy_pre_effect(
    () => (get$1(remoteVideoEl), get$1(remoteStream2)),
    () => {
      if (get$1(remoteVideoEl) && get$1(remoteStream2)) {
        mutate(remoteVideoEl, get$1(remoteVideoEl).srcObject = get$1(remoteStream2));
      }
    }
  );
  legacy_pre_effect(
    () => (get$1(screenSharePreviewEl), get$1(screenShareStream)),
    () => {
      if (get$1(screenSharePreviewEl) && get$1(screenShareStream)) {
        mutate(screenSharePreviewEl, get$1(screenSharePreviewEl).srcObject = get$1(screenShareStream));
      }
    }
  );
  legacy_pre_effect(
    () => (get$1(selectedConversation$1), get$1(pollingActive), get$1(syncInterval)),
    () => {
      if (get$1(selectedConversation$1) && get$1(pollingActive)) {
        if (get$1(syncInterval)) clearInterval(get$1(syncInterval));
        set(syncInterval, setInterval(syncMessagesFromGitHub, 1e4));
        syncMessagesFromGitHub();
      } else {
        if (get$1(syncInterval)) {
          clearInterval(get$1(syncInterval));
          set(syncInterval, null);
        }
      }
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
        var consequent_24 = ($$anchor3) => {
          var div = root_2$3();
          var div_1 = child(div);
          var div_2 = child(div_1);
          var h2 = child(div_2);
          var text$1 = child(h2);
          var button = sibling(h2, 2);
          var text_1 = child(button);
          var button_1 = sibling(button, 2);
          var p_1 = sibling(button_1, 2);
          var text_2 = child(p_1);
          var div_3 = sibling(div_2, 2);
          var node_2 = child(div_3);
          {
            var consequent = ($$anchor4) => {
              var button_2 = root_3$2();
              const connectedUserAgents = /* @__PURE__ */ derived_safe_equal(() => Object.entries($peerConnections()).filter(([peerId, conn]) => conn.status === "connected").length + 1);
              const connectedUsers = /* @__PURE__ */ derived_safe_equal(() => (/* @__PURE__ */ new Set([
                get(authStore).user.login,
                ...Object.values($peerConnections()).filter((conn) => conn.status === "connected").map((conn) => conn.username)
              ])).size);
              const allKnownUsers = /* @__PURE__ */ derived_safe_equal(() => get$1(connectedUsers));
              var text_3 = child(button_2);
              template_effect(() => set_text(text_3, `participants ${get$1(connectedUsers) ?? ""}/${get$1(allKnownUsers) ?? ""} • ua: ${get$1(connectedUserAgents) ?? ""}`));
              event("click", button_2, () => set(showParticipantModal, true));
              append($$anchor4, button_2);
            };
            if_block(node_2, ($$render) => {
              $$render(consequent);
            });
          }
          var div_4 = sibling(div_3, 2);
          var node_3 = child(div_4);
          {
            var consequent_4 = ($$anchor4) => {
              var fragment_2 = comment();
              const connectedSessions = /* @__PURE__ */ derived_safe_equal(() => [
                {
                  username: get(authStore).user.login,
                  sessionId: getLocalPeerId(),
                  isLocal: true
                },
                ...Object.entries($peerConnections()).filter(([peerId, conn]) => conn.status === "connected").map(([peerId, conn]) => ({
                  username: conn.username,
                  sessionId: peerId,
                  isLocal: false
                }))
              ]);
              const currentLeader = /* @__PURE__ */ derived_safe_equal(getCurrentLeader);
              var node_4 = first_child(fragment_2);
              {
                var consequent_3 = ($$anchor5) => {
                  var div_5 = root_5$3();
                  each(div_5, 7, () => get$1(connectedSessions), (session) => session.sessionId, ($$anchor6, session, index2) => {
                    var div_6 = root_6$2();
                    var img = child(div_6);
                    var node_5 = sibling(img, 2);
                    {
                      var consequent_1 = ($$anchor7) => {
                        var svg = root_7$2();
                        append($$anchor7, svg);
                      };
                      if_block(node_5, ($$render) => {
                        if (get$1(currentLeader) && get$1(currentLeader) === get$1(session).sessionId) $$render(consequent_1);
                      });
                    }
                    var node_6 = sibling(node_5, 2);
                    {
                      var consequent_2 = ($$anchor7) => {
                        var div_7 = root_8();
                        append($$anchor7, div_7);
                      };
                      if_block(node_6, ($$render) => {
                        var _a2;
                        if (!get$1(session).isLocal && ((_a2 = $typingUsers()[get$1(session).sessionId]) == null ? void 0 : _a2.isTyping)) $$render(consequent_2);
                      });
                    }
                    template_effect(
                      ($0) => {
                        set_style(div_6, `margin-left: ${(get$1(index2) > 0 ? "-8px" : "0") ?? ""}; z-index: ${get$1(connectedSessions).length - get$1(index2)};`);
                        set_attribute(img, "src", `https://github.com/${get$1(session).username ?? ""}.png`);
                        set_attribute(img, "alt", get$1(session).username);
                        set_attribute(img, "title", `${(get$1(session).isLocal ? "You" : get$1(session).username) ?? ""} ${$0 ?? ""}`);
                      },
                      [
                        () => get$1(session).isLocal ? "" : `(${get$1(session).sessionId.slice(-4)})`
                      ],
                      derived_safe_equal
                    );
                    append($$anchor6, div_6);
                  });
                  template_effect(
                    ($0) => set_style(div_5, `width: ${$0 ?? ""}px;`),
                    [
                      () => Math.min(get$1(connectedSessions).length * 16 + 16, 80)
                    ],
                    derived_safe_equal
                  );
                  append($$anchor5, div_5);
                };
                if_block(node_4, ($$render) => {
                  if (get$1(connectedSessions).length > 0) $$render(consequent_3);
                });
              }
              append($$anchor4, fragment_2);
            };
            if_block(node_3, ($$render) => {
              $$render(consequent_4);
            });
          }
          var node_7 = sibling(node_3, 2);
          {
            var consequent_5 = ($$anchor4) => {
              var button_3 = root_9$2();
              event("click", button_3, endCall2);
              append($$anchor4, button_3);
            };
            if_block(node_7, ($$render) => {
              if (get$1(callActive)) $$render(consequent_5);
            });
          }
          var node_8 = sibling(div_1, 2);
          {
            var consequent_19 = ($$anchor4) => {
              var fragment_3 = root_10$2();
              var div_8 = first_child(fragment_3);
              var div_9 = child(div_8);
              var video = sibling(child(div_9), 2);
              video.muted = true;
              bind_this(video, ($$value) => set(localVideoEl, $$value), () => get$1(localVideoEl));
              var div_10 = sibling(video, 2);
              var span = child(div_10);
              var node_9 = child(span);
              {
                var consequent_6 = ($$anchor5) => {
                  var text_4 = text("🎤 Mic On");
                  append($$anchor5, text_4);
                };
                var alternate = ($$anchor5) => {
                  var text_5 = text("🔇 Mic Off");
                  append($$anchor5, text_5);
                };
                if_block(node_9, ($$render) => {
                  if (get$1(micOn)) $$render(consequent_6);
                  else $$render(alternate, false);
                });
              }
              var span_1 = sibling(span, 2);
              var node_10 = child(span_1);
              {
                var consequent_7 = ($$anchor5) => {
                  var text_6 = text("📷 Cam On");
                  append($$anchor5, text_6);
                };
                var alternate_1 = ($$anchor5) => {
                  var text_7 = text("🚫📷 Cam Off");
                  append($$anchor5, text_7);
                };
                if_block(node_10, ($$render) => {
                  if (get$1(cameraOn)) $$render(consequent_7);
                  else $$render(alternate_1, false);
                });
              }
              var div_11 = sibling(div_9, 2);
              var video_1 = sibling(child(div_11), 2);
              bind_this(video_1, ($$value) => set(remoteVideoEl, $$value), () => get$1(remoteVideoEl));
              var div_12 = sibling(video_1, 2);
              var span_2 = child(div_12);
              var node_11 = child(span_2);
              {
                var consequent_8 = ($$anchor5) => {
                  var text_8 = text("🎤 Mic On");
                  append($$anchor5, text_8);
                };
                var alternate_2 = ($$anchor5) => {
                  var text_9 = text("🔇 Mic Off");
                  append($$anchor5, text_9);
                };
                if_block(node_11, ($$render) => {
                  if (get$1(remoteMicOn)) $$render(consequent_8);
                  else $$render(alternate_2, false);
                });
              }
              var span_3 = sibling(span_2, 2);
              var node_12 = child(span_3);
              {
                var consequent_9 = ($$anchor5) => {
                  var text_10 = text("📷 Cam On");
                  append($$anchor5, text_10);
                };
                var alternate_3 = ($$anchor5) => {
                  var text_11 = text("🚫📷 Cam Off");
                  append($$anchor5, text_11);
                };
                if_block(node_12, ($$render) => {
                  if (get$1(remoteCameraOn)) $$render(consequent_9);
                  else $$render(alternate_3, false);
                });
              }
              var node_13 = sibling(div_8, 2);
              {
                var consequent_11 = ($$anchor5) => {
                  var div_13 = root_19$1();
                  var span_4 = child(div_13);
                  var node_14 = sibling(child(span_4));
                  {
                    var consequent_10 = ($$anchor6) => {
                      var text_12 = text("(with audio)");
                      append($$anchor6, text_12);
                    };
                    if_block(node_14, ($$render) => {
                      var _a2;
                      if ((_a2 = get$1(remoteScreenShareMeta)) == null ? void 0 : _a2.audio) $$render(consequent_10);
                    });
                  }
                  append($$anchor5, div_13);
                };
                if_block(node_13, ($$render) => {
                  if (get$1(remoteScreenSharing)) $$render(consequent_11);
                });
              }
              var div_14 = sibling(node_13, 2);
              var label = child(div_14);
              var input = sibling(child(label));
              var button_4 = sibling(label, 2);
              var node_15 = child(button_4);
              {
                var consequent_12 = ($$anchor5) => {
                  var text_13 = text("🛑 Stop Sharing");
                  append($$anchor5, text_13);
                };
                var alternate_4 = ($$anchor5) => {
                  var text_14 = text("🖥️ Share Screen");
                  append($$anchor5, text_14);
                };
                if_block(node_15, ($$render) => {
                  if (get$1(screenSharing)) $$render(consequent_12);
                  else $$render(alternate_4, false);
                });
              }
              var node_16 = sibling(button_4, 2);
              {
                var consequent_13 = ($$anchor5) => {
                  var button_5 = root_23();
                  event("click", button_5, changeScreenSource);
                  append($$anchor5, button_5);
                };
                if_block(node_16, ($$render) => {
                  if (get$1(screenSharing)) $$render(consequent_13);
                });
              }
              var button_6 = sibling(node_16, 2);
              var node_17 = child(button_6);
              {
                var consequent_14 = ($$anchor5) => {
                  var span_5 = root_24();
                  append($$anchor5, span_5);
                };
                var alternate_5 = ($$anchor5) => {
                  var span_6 = root_25();
                  append($$anchor5, span_6);
                };
                if_block(node_17, ($$render) => {
                  if (get$1(micOn)) $$render(consequent_14);
                  else $$render(alternate_5, false);
                });
              }
              var button_7 = sibling(button_6, 2);
              var node_18 = child(button_7);
              {
                var consequent_15 = ($$anchor5) => {
                  var span_7 = root_26();
                  append($$anchor5, span_7);
                };
                var alternate_6 = ($$anchor5) => {
                  var span_8 = root_27();
                  append($$anchor5, span_8);
                };
                if_block(node_18, ($$render) => {
                  if (get$1(cameraOn)) $$render(consequent_15);
                  else $$render(alternate_6, false);
                });
              }
              var button_8 = sibling(button_7, 2);
              var node_19 = child(button_8);
              {
                var consequent_16 = ($$anchor5) => {
                  var span_9 = root_28();
                  append($$anchor5, span_9);
                };
                var alternate_7 = ($$anchor5) => {
                  var span_10 = root_29();
                  append($$anchor5, span_10);
                };
                if_block(node_19, ($$render) => {
                  if (get$1(recording)) $$render(consequent_16);
                  else $$render(alternate_7, false);
                });
              }
              var node_20 = sibling(div_14, 2);
              {
                var consequent_17 = ($$anchor5) => {
                  var div_15 = root_30();
                  append($$anchor5, div_15);
                };
                if_block(node_20, ($$render) => {
                  if (get$1(recording)) $$render(consequent_17);
                });
              }
              var node_21 = sibling(node_20, 2);
              {
                var consequent_18 = ($$anchor5) => {
                  var div_16 = root_31();
                  append($$anchor5, div_16);
                };
                if_block(node_21, ($$render) => {
                  if (get$1(remoteRecording)) $$render(consequent_18);
                });
              }
              template_effect(() => {
                set_attribute(button_6, "title", get$1(micOn) ? "Mute Mic" : "Unmute Mic");
                set_attribute(button_7, "title", get$1(cameraOn) ? "Turn Off Camera" : "Turn On Camera");
                set_attribute(button_8, "title", get$1(recording) ? "Stop Recording" : "Start Recording");
              });
              event("change", input, handleFileInput);
              event("click", button_4, function(...$$args) {
                var _a2;
                (_a2 = get$1(screenSharing) ? stopScreenShare : openShareTypeModal) == null ? void 0 : _a2.apply(this, $$args);
              });
              event("click", button_6, toggleMic);
              event("click", button_7, toggleCamera);
              event("click", button_8, function(...$$args) {
                var _a2;
                (_a2 = get$1(recording) ? stopRecording : startRecording) == null ? void 0 : _a2.apply(this, $$args);
              });
              append($$anchor4, fragment_3);
            };
            if_block(node_8, ($$render) => {
              if (get$1(callActive)) $$render(consequent_19);
            });
          }
          var node_22 = sibling(node_8, 2);
          {
            var consequent_21 = ($$anchor4) => {
              var fragment_4 = comment();
              var node_23 = first_child(fragment_4);
              {
                var consequent_20 = ($$anchor5) => {
                  var div_17 = root_33();
                  var div_18 = child(div_17);
                  var button_9 = child(div_18);
                  var video_2 = sibling(button_9, 4);
                  video_2.muted = true;
                  bind_this(video_2, ($$value) => set(screenSharePreviewEl, $$value), () => get$1(screenSharePreviewEl));
                  bind_this(div_17, ($$value) => set(previewRef, $$value), () => get$1(previewRef));
                  template_effect(() => set_style(div_17, `left: ${get$1(previewPos).x ?? ""}px; top: ${get$1(previewPos).y ?? ""}px; min-width: 180px; min-height: 120px; user-select: none;`));
                  event("click", button_9, stopPropagation(closePreview));
                  event("mousedown", div_17, onPreviewMouseDown);
                  append($$anchor5, div_17);
                };
                var alternate_8 = ($$anchor5) => {
                  var button_10 = root_34();
                  event("click", button_10, reopenPreview);
                  append($$anchor5, button_10);
                };
                if_block(node_23, ($$render) => {
                  if (get$1(previewVisible)) $$render(consequent_20);
                  else $$render(alternate_8, false);
                });
              }
              append($$anchor4, fragment_4);
            };
            if_block(node_22, ($$render) => {
              if (get$1(screenSharing) && get$1(screenShareStream)) $$render(consequent_21);
            });
          }
          var node_24 = sibling(node_22, 2);
          {
            var consequent_22 = ($$anchor4) => {
              var div_19 = root_35();
              var div_20 = child(div_19);
              var button_11 = sibling(child(div_20), 2);
              var button_12 = sibling(button_11, 2);
              var button_13 = sibling(button_12, 2);
              var button_14 = sibling(button_13, 2);
              event("click", button_11, () => selectShareType("screen"));
              event("click", button_12, () => selectShareType("window"));
              event("click", button_13, () => selectShareType("tab"));
              event("click", button_14, closeShareTypeModal);
              append($$anchor4, div_19);
            };
            if_block(node_24, ($$render) => {
              if (get$1(showShareTypeModal)) $$render(consequent_22);
            });
          }
          var node_25 = sibling(node_24, 2);
          {
            var consequent_23 = ($$anchor4) => {
              var div_21 = root_36();
              var div_22 = child(div_21);
              var button_15 = sibling(child(div_22), 2);
              var button_16 = sibling(button_15, 2);
              var button_17 = sibling(button_16, 2);
              event("click", button_15, () => {
                set(uploadDestination, "google_drive");
              });
              event("click", button_16, () => {
                set(uploadDestination, "s3");
              });
              event("click", button_17, resetUploadDestination);
              append($$anchor4, div_21);
            };
            if_block(node_25, ($$render) => {
              if (get$1(showUploadDestinationModal)) $$render(consequent_23);
            });
          }
          var div_23 = sibling(node_25, 2);
          var node_26 = child(div_23);
          const expression = /* @__PURE__ */ derived_safe_equal(() => $selectedConversationStore() || get$1(selectedConversation$1));
          MessageList(node_26, {
            get conversation() {
              return get$1(expression);
            },
            $$events: {
              reply: (e) => set(replyingTo, e.detail)
            }
          });
          var div_24 = sibling(div_23, 2);
          var node_27 = child(div_24);
          const expression_1 = /* @__PURE__ */ derived_safe_equal(() => $selectedConversationStore() || get$1(selectedConversation$1));
          MessageInput(node_27, {
            get conversation() {
              return get$1(expression_1);
            },
            get repo() {
              return get$1(currentRepo);
            },
            get replyingTo() {
              return get$1(replyingTo);
            },
            set replyingTo($$value) {
              set(replyingTo, $$value);
            },
            $$legacy: true
          });
          template_effect(() => {
            set_text(text$1, get$1(selectedConversation$1).title);
            set_attribute(button, "title", get$1(pollingActive) ? "Pause presence polling" : "Start presence polling");
            set_text(text_1, get$1(pollingActive) ? "⏸ Pause Presence" : "▶ Start Presence");
            set_text(text_2, get$1(selectedConversation$1).repo);
          });
          event("click", button, togglePresence);
          event("click", button_1, forceCommitConversation);
          append($$anchor3, div);
        };
        var alternate_9 = ($$anchor3) => {
          var p_2 = root_37();
          append($$anchor3, p_2);
        };
        if_block(node_1, ($$render) => {
          if (get$1(selectedConversation$1)) $$render(consequent_24);
          else $$render(alternate_9, false);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  var node_28 = sibling(node, 2);
  {
    var consequent_31 = ($$anchor2) => {
      var div_25 = root_38();
      var div_26 = child(div_25);
      var div_27 = child(div_26);
      var button_18 = sibling(child(div_27), 2);
      var div_28 = sibling(div_27, 2);
      var node_29 = child(div_28);
      {
        var consequent_30 = ($$anchor3) => {
          var fragment_5 = root_39();
          const currentUsername = /* @__PURE__ */ derived_safe_equal(() => get(authStore).user.login);
          const currentLeader = /* @__PURE__ */ derived_safe_equal(getCurrentLeader);
          const allUsers = /* @__PURE__ */ derived_safe_equal(() => /* @__PURE__ */ new Set([
            get$1(currentUsername),
            ...Object.values($peerConnections()).map((conn) => conn.username),
            ...$onlinePeers().map((p) => p.username)
          ]));
          const userAgentCounts = /* @__PURE__ */ derived_safe_equal(() => ({}));
          var node_30 = first_child(fragment_5);
          each(node_30, 1, () => Object.values($peerConnections()), index, ($$anchor4, conn) => {
            var fragment_6 = comment();
            var node_31 = first_child(fragment_6);
            {
              var consequent_25 = ($$anchor5) => {
                var text_15 = text();
                template_effect(() => set_text(text_15, get$1(userAgentCounts)[get$1(conn).username] = get$1(userAgentCounts)[get$1(conn).username] + 1));
                append($$anchor5, text_15);
              };
              var alternate_10 = ($$anchor5) => {
                var text_16 = text();
                template_effect(() => set_text(text_16, get$1(userAgentCounts)[get$1(conn).username] = 1));
                append($$anchor5, text_16);
              };
              if_block(node_31, ($$render) => {
                if (get$1(userAgentCounts)[get$1(conn).username]) $$render(consequent_25);
                else $$render(alternate_10, false);
              });
            }
            append($$anchor4, fragment_6);
          });
          var text_17 = sibling(node_30);
          var node_32 = sibling(text_17);
          each(node_32, 1, () => Array.from(get$1(allUsers)), index, ($$anchor4, username) => {
            var div_29 = root_43();
            const isConnected = /* @__PURE__ */ derived_safe_equal(() => get$1(username) === get$1(currentUsername) || Object.values($peerConnections()).some((conn) => conn.username === get$1(username) && conn.status === "connected"));
            const isCurrentLeader2 = /* @__PURE__ */ derived_safe_equal(() => get$1(currentLeader) && (get$1(username) === get$1(currentUsername) && get$1(currentLeader) === getLocalPeerId() || Object.entries($peerConnections()).some(([peerId, conn]) => conn.username === get$1(username) && get$1(currentLeader) === peerId)));
            const uaCount = /* @__PURE__ */ derived_safe_equal(() => get$1(userAgentCounts)[get$1(username)] || 0);
            var div_30 = child(div_29);
            var div_31 = child(div_30);
            var img_1 = child(div_31);
            var node_33 = sibling(img_1, 2);
            {
              var consequent_26 = ($$anchor5) => {
                var svg_1 = root_44();
                append($$anchor5, svg_1);
              };
              if_block(node_33, ($$render) => {
                if (get$1(isCurrentLeader2)) $$render(consequent_26);
              });
            }
            var node_34 = sibling(node_33, 2);
            {
              var consequent_27 = ($$anchor5) => {
                var div_32 = root_45();
                append($$anchor5, div_32);
              };
              if_block(node_34, ($$render) => {
                if (get$1(isConnected)) $$render(consequent_27);
              });
            }
            var span_11 = sibling(div_31, 2);
            var text_18 = child(span_11);
            var node_35 = sibling(text_18);
            {
              var consequent_28 = ($$anchor5) => {
                var span_12 = root_46();
                var text_19 = child(span_12);
                template_effect(() => set_text(text_19, `(${get$1(uaCount) ?? ""})`));
                append($$anchor5, span_12);
              };
              if_block(node_35, ($$render) => {
                if (get$1(uaCount) > 1) $$render(consequent_28);
              });
            }
            var div_33 = sibling(div_30, 2);
            var node_36 = child(div_33);
            {
              var consequent_29 = ($$anchor5) => {
                var text_20 = text("Online");
                append($$anchor5, text_20);
              };
              var alternate_11 = ($$anchor5) => {
                var text_21 = text("Offline");
                append($$anchor5, text_21);
              };
              if_block(node_36, ($$render) => {
                if (get$1(isConnected)) $$render(consequent_29);
                else $$render(alternate_11, false);
              });
            }
            template_effect(() => {
              set_class(div_29, 1, `flex items-center gap-3 p-2 rounded ${(get$1(isConnected) ? "bg-green-50" : "bg-gray-50") ?? ""}`);
              set_attribute(img_1, "src", `https://github.com/${get$1(username) ?? ""}.png`);
              set_attribute(img_1, "alt", get$1(username));
              set_class(img_1, 1, `w-8 h-8 rounded-full ${(get$1(isConnected) ? "" : "grayscale opacity-60") ?? ""}`);
              set_class(span_11, 1, `font-medium ${(get$1(isConnected) ? "text-green-800" : "text-gray-600") ?? ""}`);
              set_text(text_18, `${(get$1(username) === get$1(currentUsername) ? "You" : get$1(username)) ?? ""} `);
            });
            append($$anchor4, div_29);
          });
          template_effect(() => set_text(text_17, ` ${(get$1(userAgentCounts)[get$1(currentUsername)] = (get$1(userAgentCounts)[get$1(currentUsername)] || 0) + 1) ?? ""} `));
          append($$anchor3, fragment_5);
        };
        if_block(node_29, ($$render) => {
          $$render(consequent_30);
        });
      }
      event("click", button_18, () => set(showParticipantModal, false));
      event("click", div_26, stopPropagation(function($$arg) {
        bubble_event.call(this, $$props, $$arg);
      }));
      event("click", div_25, () => set(showParticipantModal, false));
      append($$anchor2, div_25);
    };
    if_block(node_28, ($$render) => {
      if (get$1(showParticipantModal)) $$render(consequent_31);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
var root_1$3 = /* @__PURE__ */ ns_template(`<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Creating...`, 1);
var root$1 = /* @__PURE__ */ template(`<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><div class="bg-white p-4 rounded shadow-md w-96"><h2 class="text-lg font-semibold mb-2">New Conversation</h2> <input placeholder="Conversation title" class="w-full border px-3 py-2 rounded mb-4"> <div class="flex justify-end gap-2"><button class="bg-gray-200 px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button> <button class="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><!></button></div></div></div>`);
function NewConversationModal($$anchor, $$props) {
  push($$props, false);
  const dispatch = createEventDispatcher();
  let loading = prop($$props, "loading", 8, false);
  let title = /* @__PURE__ */ mutable_source("");
  function submit() {
    if (!get$1(title).trim()) {
      alert("Title is required.");
      return;
    }
    if (loading()) return;
    dispatch("create", { title: get$1(title).trim() });
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
      else $$render(alternate, false);
    });
  }
  template_effect(
    ($0) => {
      input.disabled = loading();
      button.disabled = loading();
      button_1.disabled = $0;
    },
    [
      () => loading() || !get$1(title).trim()
    ],
    derived_safe_equal
  );
  bind_value(input, () => get$1(title), ($$value) => set(title, $$value));
  event("keydown", input, handleKeydown);
  event("click", button, cancel);
  event("click", button_1, submit);
  append($$anchor, div);
  pop();
}
var root_3$1 = /* @__PURE__ */ template(`<div class="flex border-b"><button>Repository Details</button> <button> </button></div>`);
var root_5$2 = /* @__PURE__ */ template(`<button class="ml-2 text-xs text-blue-600 underline hover:text-blue-800">View conversations</button>`);
var root_7$1 = /* @__PURE__ */ ns_template(`<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Activating...`, 1);
var root_6$1 = /* @__PURE__ */ template(`<button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"><!></button>`);
var root_10$1 = /* @__PURE__ */ template(`<option> </option>`);
var root_9$1 = /* @__PURE__ */ template(`<div class="mt-6 border-t pt-4 space-y-3"><h3 class="text-lg font-semibold text-gray-800">🛠️ Messaging Config</h3> <div class="grid gap-2 text-sm text-gray-700"><label>Commit frequency (min): <input type="number" class="w-full border px-2 py-1 rounded"></label> <label>Binary storage type: <select class="w-full border px-2 py-1 rounded"><option>gitfs</option><option>s3</option><option>google_drive</option></select></label> <label>Storage URL: <select class="w-full border px-2 py-1 rounded"><option disabled>— Select a credential —</option><!></select></label></div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">💾 Save Configuration</button></div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">💬 New Conversation</button> <!>`, 1);
var root_4$1 = /* @__PURE__ */ template(`<div class="text-sm text-gray-700 space-y-1"><div><strong>Name:</strong> </div> <div><strong>Owner:</strong> </div> <div><strong>GitHub:</strong> <a target="_blank" class="text-blue-600 underline hover:text-blue-800"> </a></div> <div><strong>Visibility:</strong> </div> <div><strong>Messaging:</strong> <!></div></div> <!> <!>`, 1);
var root_13 = /* @__PURE__ */ template(`<div class="flex items-center justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>`);
var root_15 = /* @__PURE__ */ template(`<p class="text-gray-400 italic text-center py-8">No files have been uploaded to this repository yet.</p>`);
var root_18 = /* @__PURE__ */ template(`<span> </span>`);
var root_17 = /* @__PURE__ */ template(`<div class="border rounded-lg p-3 hover:bg-gray-50 transition-colors"><div class="flex items-start justify-between"><div class="flex items-start gap-3"><!> <div><a target="_blank" rel="noopener noreferrer" class="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"> <!></a> <div class="flex items-center gap-4 text-sm text-gray-500 mt-1"><span> </span> <span class="flex items-center gap-1"><!> </span> <!></div></div></div> <span class="text-xs text-gray-400"> </span></div></div>`);
var root_16 = /* @__PURE__ */ template(`<div class="space-y-2"></div>`);
var root_12 = /* @__PURE__ */ template(`<div class="space-y-4"><!> <div class="mt-4 text-center"><button class="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50">Refresh Files</button></div></div>`);
var root_2$2 = /* @__PURE__ */ template(`<div class="p-6 space-y-4 bg-white shadow rounded max-w-3xl mx-auto mt-6"><h2 class="text-2xl font-semibold text-blue-700"> </h2> <!> <!> <!></div>`);
var root_19 = /* @__PURE__ */ template(`<p class="text-gray-400 italic text-center mt-20">Select a repository from the sidebar to view its details.</p>`);
function Repos($$anchor, $$props) {
  push($$props, false);
  let credentials = /* @__PURE__ */ mutable_source([]);
  let repo = /* @__PURE__ */ mutable_source();
  let activating = /* @__PURE__ */ mutable_source(false);
  let showModal = /* @__PURE__ */ mutable_source(false);
  let creatingConversation = /* @__PURE__ */ mutable_source(false);
  let activeTab = /* @__PURE__ */ mutable_source("details");
  let repoFiles = /* @__PURE__ */ mutable_source([]);
  let loadingFiles = /* @__PURE__ */ mutable_source(false);
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
    if (!get$1(repo) || !token) return;
    set(activating, true);
    try {
      await activateMessagingForRepo(token, get$1(repo));
      mutate(repo, get$1(repo).has_messages = true);
      __vitePreload(async () => {
        const { selectedRepo: selectedRepo2 } = await Promise.resolve().then(() => repoStore);
        return { selectedRepo: selectedRepo2 };
      }, true ? void 0 : void 0).then(({ selectedRepo: selectedRepo2 }) => {
        selectedRepo2.set({ ...get$1(repo) });
      });
    } catch (e) {
      alert("Failed to activate messaging.");
      console.warn(e);
    } finally {
      set(activating, false);
    }
  }
  async function saveConfig() {
    const token = localStorage.getItem("skygit_token");
    if (!token || !get$1(repo)) return;
    try {
      await updateRepoMessagingConfig(token, get$1(repo));
      alert("✅ Messaging config updated.");
      try {
        await storeEncryptedCredentials(token, get$1(repo));
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
    console.log("[SkyGit] 🧪 handleCreate() called with title:", title);
    set(creatingConversation, true);
    try {
      await createConversation(token, get$1(repo), title);
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
    if (!get$1(repo)) return;
    searchQuery.set(get$1(repo).full_name);
    selectedConversation.set(null);
    currentContent.set(null);
    currentRoute.set("chats");
  }
  async function loadFiles() {
    if (!get$1(repo) || get$1(loadingFiles)) return;
    set(loadingFiles, true);
    const token = localStorage.getItem("skygit_token");
    try {
      set(repoFiles, await getRepositoryFiles(token, get$1(repo)));
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
  legacy_pre_effect(() => (get$1(repo), get$1(activeTab)), () => {
    if (get$1(repo)) {
      set(repoFiles, []);
      if (get$1(activeTab) === "files") {
        loadFiles();
      }
    }
  });
  legacy_pre_effect(
    () => (get$1(activeTab), get$1(repo), get$1(repoFiles)),
    () => {
      if (get$1(activeTab) === "files" && get$1(repo) && get$1(repoFiles).length === 0) {
        loadFiles();
      }
    }
  );
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
                set_class(button, 1, `px-4 py-2 text-sm font-medium ${(get$1(activeTab) === "details" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700") ?? ""}`);
                set_class(button_1, 1, `px-4 py-2 text-sm font-medium ${(get$1(activeTab) === "files" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700") ?? ""}`);
                set_text(text_1, `Files (${get$1(repoFiles).length ?? ""})`);
              });
              event("click", button, () => set(activeTab, "details"));
              event("click", button_1, () => set(activeTab, "files"));
              append($$anchor4, div_1);
            };
            if_block(node_1, ($$render) => {
              if (get$1(repo).has_messages) $$render(consequent);
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
                  if (get$1(repo).has_messages) $$render(consequent_1);
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
                      if (get$1(activating)) $$render(consequent_2);
                      else $$render(alternate, false);
                    });
                  }
                  template_effect(() => button_3.disabled = get$1(activating));
                  event("click", button_3, activateMessaging);
                  append($$anchor5, button_3);
                };
                if_block(node_4, ($$render) => {
                  if (!get$1(repo).has_messages) $$render(consequent_3);
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
                  template_effect(() => {
                    get$1(repo);
                    invalidate_inner_signals(() => {
                    });
                  });
                  var option = child(select);
                  option.value = null == (option.__value = "gitfs") ? "" : "gitfs";
                  var option_1 = sibling(option);
                  option_1.value = null == (option_1.__value = "s3") ? "" : "s3";
                  var option_2 = sibling(option_1);
                  option_2.value = null == (option_2.__value = "google_drive") ? "" : "google_drive";
                  var label_2 = sibling(label_1, 2);
                  var select_1 = sibling(child(label_2));
                  template_effect(() => {
                    get$1(repo);
                    invalidate_inner_signals(() => {
                      get$1(credentials);
                    });
                  });
                  var option_3 = child(select_1);
                  option_3.value = null == (option_3.__value = "") ? "" : "";
                  var node_7 = sibling(option_3);
                  each(node_7, 1, () => get$1(credentials).filter((c) => c.type === get$1(repo).config.binary_storage_type), index, ($$anchor6, cred) => {
                    var option_4 = root_10$1();
                    var option_4_value = {};
                    var text_8 = child(option_4);
                    template_effect(() => {
                      if (option_4_value !== (option_4_value = get$1(cred).url)) {
                        option_4.value = null == (option_4.__value = get$1(cred).url) ? "" : get$1(cred).url;
                      }
                      set_text(text_8, get$1(cred).url);
                    });
                    append($$anchor6, option_4);
                  });
                  var button_4 = sibling(div_9, 2);
                  var button_5 = sibling(div_8, 2);
                  var node_8 = sibling(button_5, 2);
                  {
                    var consequent_4 = ($$anchor6) => {
                      NewConversationModal($$anchor6, {
                        get loading() {
                          return get$1(creatingConversation);
                        },
                        $$events: { create: handleCreate, cancel: handleCancel }
                      });
                    };
                    if_block(node_8, ($$render) => {
                      if (get$1(showModal)) $$render(consequent_4);
                    });
                  }
                  bind_value(input, () => get$1(repo).config.commit_frequency_min, ($$value) => mutate(repo, get$1(repo).config.commit_frequency_min = $$value));
                  bind_select_value(select, () => get$1(repo).config.binary_storage_type, ($$value) => mutate(repo, get$1(repo).config.binary_storage_type = $$value));
                  bind_select_value(select_1, () => get$1(repo).config.storage_info.url, ($$value) => mutate(repo, get$1(repo).config.storage_info.url = $$value));
                  event("click", button_4, saveConfig);
                  event("click", button_5, () => set(showModal, true));
                  append($$anchor5, fragment_4);
                };
                if_block(node_6, ($$render) => {
                  if (get$1(repo).has_messages && get$1(repo).config) $$render(consequent_5);
                });
              }
              template_effect(() => {
                set_text(text_2, ` ${get$1(repo).name ?? ""}`);
                set_text(text_3, ` ${get$1(repo).owner ?? ""}`);
                set_attribute(a, "href", get$1(repo).url);
                set_text(text_4, get$1(repo).url);
                set_text(text_5, ` ${(get$1(repo).private ? "🔒 Private" : "🌐 Public") ?? ""}`);
                set_text(text_6, ` ${(get$1(repo).has_messages ? "💬 Available" : "🚫 Not enabled") ?? ""} `);
              });
              append($$anchor4, fragment_2);
            };
            if_block(node_2, ($$render) => {
              if (!get$1(repo).has_messages || get$1(activeTab) === "details") $$render(consequent_6);
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
                var alternate_1 = ($$anchor5, $$elseif) => {
                  {
                    var consequent_8 = ($$anchor6) => {
                      var p = root_15();
                      append($$anchor6, p);
                    };
                    var alternate_2 = ($$anchor6) => {
                      var div_12 = root_16();
                      each(div_12, 5, () => get$1(repoFiles), index, ($$anchor7, file) => {
                        var div_13 = root_17();
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
                          var consequent_9 = ($$anchor8) => {
                            var span_2 = root_18();
                            var text_12 = child(span_2);
                            template_effect(() => set_text(text_12, get$1(file).mimeType));
                            append($$anchor8, span_2);
                          };
                          if_block(node_14, ($$render) => {
                            if (get$1(file).mimeType) $$render(consequent_9);
                          });
                        }
                        var span_3 = sibling(div_15, 2);
                        var text_13 = child(span_3);
                        template_effect(
                          ($0, $1) => {
                            set_attribute(a_1, "href", get$1(file).fileUrl);
                            set_text(text_9, `${get$1(file).fileName ?? ""} `);
                            set_text(text_10, $0);
                            set_text(text_11, ` ${$1 ?? ""}`);
                            set_text(text_13, get$1(file).storageType === "google_drive" ? "📁" : "🪣");
                          },
                          [
                            () => formatFileSize(get$1(file).fileSize),
                            () => new Date(get$1(file).uploadedAt).toLocaleDateString()
                          ],
                          derived_safe_equal
                        );
                        append($$anchor7, div_13);
                      });
                      append($$anchor6, div_12);
                    };
                    if_block(
                      $$anchor5,
                      ($$render) => {
                        if (get$1(repoFiles).length === 0) $$render(consequent_8);
                        else $$render(alternate_2, false);
                      },
                      $$elseif
                    );
                  }
                };
                if_block(node_10, ($$render) => {
                  if (get$1(loadingFiles)) $$render(consequent_7);
                  else $$render(alternate_1, false);
                });
              }
              var div_18 = sibling(node_10, 2);
              var button_6 = child(div_18);
              template_effect(() => button_6.disabled = get$1(loadingFiles));
              event("click", button_6, loadFiles);
              append($$anchor4, div_10);
            };
            if_block(node_9, ($$render) => {
              if (get$1(repo).has_messages && get$1(activeTab) === "files") $$render(consequent_10);
            });
          }
          template_effect(() => set_text(text$1, get$1(repo).full_name));
          append($$anchor3, div);
        };
        var alternate_3 = ($$anchor3) => {
          var p_1 = root_19();
          append($$anchor3, p_1);
        };
        if_block(node, ($$render) => {
          if (get$1(repo)) $$render(consequent_11);
          else $$render(alternate_3, false);
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
    console.log("[Recorder] Started recording");
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
      console.log("[Recorder] Stopped recording");
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
var root_2$1 = /* @__PURE__ */ template(`<div class="bg-blue-50 p-3 rounded-lg border border-blue-100"><p class="text-sm text-blue-800 font-medium mb-2">Cloud Storage Detected</p> <div class="text-xs text-blue-600 mb-2">Repository is linked to <strong class="uppercase"> </strong>.</div> <label class="block text-xs font-medium text-blue-800 mb-1">Destination Location</label> <input type="text" class="w-full border border-blue-200 rounded px-2 py-1 text-xs bg-white text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none"> <p class="text-[10px] text-blue-500 mt-1"><!></p></div>`);
var root_5$1 = /* @__PURE__ */ template(`<div class="bg-gray-50 p-3 rounded-lg border border-gray-200"><p class="text-sm text-gray-800 font-medium mb-2">Git Repository Storage</p> <div class="text-xs text-gray-600 mb-2">No external cloud storage configured. File will be
                            saved to the <strong>Git repository</strong>.</div> <label class="block text-xs font-medium text-gray-700 mb-1">Folder Path</label> <input type="text" class="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white text-gray-700 focus:ring-1 focus:ring-gray-500 outline-none" placeholder="recordings"> <div class="mt-2 flex items-start gap-2 text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100"><!> <div><strong>Limits:</strong> Max 50MB per file. Max
                                1GB total repo size. <br>Large files may slow down the repository.</div></div></div>`);
var root_6 = /* @__PURE__ */ template(`<div class="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2 text-red-700 text-sm"><!> <span> </span></div>`);
var root_7 = /* @__PURE__ */ template(`<span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Uploading...`, 1);
var root_9 = /* @__PURE__ */ template(`<!> Saved!`, 1);
var root_10 = /* @__PURE__ */ template(`<!> Save to Cloud`, 1);
var root_1$2 = /* @__PURE__ */ template(`<div class="fixed inset-0 z-[60] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div> <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 overflow-hidden"><button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><!></button> <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><!> Save Recording</h2> <div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Filename</label> <input type="text" class="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"></div> <!> <!> <div class="grid grid-cols-2 gap-3 mt-6"><button class="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"><!> Download</button> <button><!></button></div></div></div></div>`);
function SaveRecordingModal($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $selectedConversation = () => store_get(selectedConversation, "$selectedConversation", $$stores);
  const $authStore = () => store_get(authStore, "$authStore", $$stores);
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
    recorder.downloadRecording(blob(), get$1(fileName));
    onClose()();
  }
  async function handleUpload() {
    if (!blob() || !get$1(repo)) return;
    set(uploading, true);
    set(error, null);
    try {
      const file = new File([blob()], get$1(fileName), { type: "video/webm" });
      const token = $authStore().token;
      const result = await uploadFile(file, get$1(repo), token, get$1(storageUrl));
      set(uploadSuccess, true);
      setTimeout(
        () => {
          onClose()();
          set(uploadSuccess, false);
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
  legacy_pre_effect(
    () => ($selectedConversation(), getRepoByFullName),
    () => {
      set(repo, $selectedConversation() ? getRepoByFullName($selectedConversation().repo) : null);
    }
  );
  legacy_pre_effect(() => get$1(repo), () => {
    var _a2, _b;
    set(storageType, ((_b = (_a2 = get$1(repo)) == null ? void 0 : _a2.config) == null ? void 0 : _b.binary_storage_type) || "gitfs");
  });
  legacy_pre_effect(() => get$1(storageType), () => {
    set(hasCloudStorage, get$1(storageType) === "s3" || get$1(storageType) === "google_drive");
  });
  legacy_pre_effect(() => get$1(storageType), () => {
    set(isGitFS, get$1(storageType) === "gitfs");
  });
  legacy_pre_effect(() => (get$1(repo), get$1(isGitFS)), () => {
    var _a2, _b, _c;
    if ((_c = (_b = (_a2 = get$1(repo)) == null ? void 0 : _a2.config) == null ? void 0 : _b.storage_info) == null ? void 0 : _c.url) {
      set(storageUrl, get$1(repo).config.storage_info.url);
    } else if (get$1(isGitFS)) {
      set(storageUrl, "recordings");
    }
  });
  legacy_pre_effect_reset();
  init();
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_5 = ($$anchor2) => {
      var div = root_1$2();
      var div_1 = child(div);
      var div_2 = sibling(div_1, 2);
      var button = child(div_2);
      var node_1 = child(button);
      X(node_1, { size: 24 });
      var h2 = sibling(button, 2);
      var node_2 = child(h2);
      File_video(node_2, { class: "text-blue-600" });
      var div_3 = sibling(h2, 2);
      var div_4 = child(div_3);
      var input = sibling(child(div_4), 2);
      var node_3 = sibling(div_4, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var div_5 = root_2$1();
          var div_6 = sibling(child(div_5), 2);
          var strong = sibling(child(div_6));
          var text$1 = child(strong);
          var input_1 = sibling(div_6, 4);
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
              if (get$1(storageType) === "google_drive") $$render(consequent);
              else $$render(alternate, false);
            });
          }
          template_effect(
            ($0) => set_text(text$1, $0),
            [
              () => get$1(storageType).replace("_", " ")
            ],
            derived_safe_equal
          );
          bind_value(input_1, () => get$1(storageUrl), ($$value) => set(storageUrl, $$value));
          append($$anchor3, div_5);
        };
        var alternate_1 = ($$anchor3) => {
          var div_7 = root_5$1();
          var input_2 = sibling(child(div_7), 6);
          var div_8 = sibling(input_2, 2);
          var node_5 = child(div_8);
          Circle_alert(node_5, { size: 12, class: "mt-0.5 shrink-0" });
          bind_value(input_2, () => get$1(storageUrl), ($$value) => set(storageUrl, $$value));
          append($$anchor3, div_7);
        };
        if_block(node_3, ($$render) => {
          if (get$1(hasCloudStorage)) $$render(consequent_1);
          else $$render(alternate_1, false);
        });
      }
      var node_6 = sibling(node_3, 2);
      {
        var consequent_2 = ($$anchor3) => {
          var div_9 = root_6();
          var node_7 = child(div_9);
          Circle_alert(node_7, { size: 16, class: "mt-0.5 shrink-0" });
          var span = sibling(node_7, 2);
          var text_3 = child(span);
          template_effect(() => set_text(text_3, get$1(error)));
          append($$anchor3, div_9);
        };
        if_block(node_6, ($$render) => {
          if (get$1(error)) $$render(consequent_2);
        });
      }
      var div_10 = sibling(node_6, 2);
      var button_1 = child(div_10);
      var node_8 = child(button_1);
      Download(node_8, { size: 18 });
      var button_2 = sibling(button_1, 2);
      var node_9 = child(button_2);
      {
        var consequent_3 = ($$anchor3) => {
          var fragment_1 = root_7();
          append($$anchor3, fragment_1);
        };
        var alternate_2 = ($$anchor3, $$elseif) => {
          {
            var consequent_4 = ($$anchor4) => {
              var fragment_2 = root_9();
              var node_10 = first_child(fragment_2);
              Check(node_10, { size: 18 });
              append($$anchor4, fragment_2);
            };
            var alternate_3 = ($$anchor4) => {
              var fragment_3 = root_10();
              var node_11 = first_child(fragment_3);
              Upload(node_11, { size: 18 });
              append($$anchor4, fragment_3);
            };
            if_block(
              $$anchor3,
              ($$render) => {
                if (get$1(uploadSuccess)) $$render(consequent_4);
                else $$render(alternate_3, false);
              },
              $$elseif
            );
          }
        };
        if_block(node_9, ($$render) => {
          if (get$1(uploading)) $$render(consequent_3);
          else $$render(alternate_2, false);
        });
      }
      template_effect(() => {
        set_class(button_2, 1, `flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white
                ${(get$1(hasCloudStorage) ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700") ?? ""}`);
        button_2.disabled = get$1(uploading) || get$1(uploadSuccess);
      });
      event("click", div_1, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      event("click", button, function(...$$args) {
        var _a2;
        (_a2 = onClose()) == null ? void 0 : _a2.apply(this, $$args);
      });
      bind_value(input, () => get$1(fileName), ($$value) => set(fileName, $$value));
      event("click", button_1, handleDownload);
      event("click", button_2, handleUpload);
      transition(1, div_2, () => scale, () => ({ start: 0.95 }));
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
var root_2 = /* @__PURE__ */ template(`<div class="bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 border border-gray-700"><div class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center animate-pulse"><!></div> <div class="text-center"><h3 class="text-2xl font-bold text-white">Incoming Call</h3> <p class="text-gray-400 mt-2"> </p></div> <div class="flex gap-4 mt-4"><button class="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors" title="Decline"><!></button> <button class="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors animate-bounce" title="Answer"><!></button></div></div>`);
var root_4 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex items-center justify-center flex-col gap-4"><div class="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center animate-pulse"><!></div> <p class="text-xl text-gray-300"> </p></div>`);
var root_5 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex items-center justify-center bg-gray-800"><!></div>`);
var root_3 = /* @__PURE__ */ template(`<div class="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col p-4"><div class="flex-1 relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800"><!> <video autoplay playsinline="" class="w-full h-full object-cover"></video> <div class="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-700"><video autoplay playsinline="" class="w-full h-full object-cover transform scale-x-[-1]"></video> <!></div> <div class="absolute top-4 left-4 bg-black/50 backdrop-blur px-4 py-2 rounded-lg text-white"><p class="font-medium"> </p> <p class="text-sm text-gray-300"> </p></div></div> <div class="h-20 flex items-center justify-center gap-6 mt-4"><button><!></button> <button class="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg scale-110"><!></button> <button><!></button> <button><!></button> <button><!></button></div></div>`, 2);
var root_1$1 = /* @__PURE__ */ template(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><!></div> <!>`, 1);
function CallOverlay($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $isRecording = () => store_get(isRecording, "$isRecording", $$stores);
  const $remoteStream = () => store_get(remoteStream, "$remoteStream", $$stores);
  const $localStream = () => store_get(localStream, "$localStream", $$stores);
  const $callStatus = () => store_get(callStatus, "$callStatus", $$stores);
  const $callStartTime = () => store_get(callStartTime, "$callStartTime", $$stores);
  const $remotePeerId = () => store_get(remotePeerId, "$remotePeerId", $$stores);
  const $isVideoEnabled = () => store_get(isVideoEnabled, "$isVideoEnabled", $$stores);
  const $isAudioEnabled = () => store_get(isAudioEnabled, "$isAudioEnabled", $$stores);
  const $isScreenSharing = () => store_get(isScreenSharing, "$isScreenSharing", $$stores);
  let localVideoEl = /* @__PURE__ */ mutable_source();
  let remoteVideoEl = /* @__PURE__ */ mutable_source();
  let showSaveModal = /* @__PURE__ */ mutable_source(false);
  let recordedBlob = /* @__PURE__ */ mutable_source(null);
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
    clearInterval(get$1(durationInterval));
    set(durationInterval, null);
    set(duration, "00:00");
  }
  onDestroy(() => {
    stopTimer();
  });
  legacy_pre_effect(() => ($localStream(), get$1(localVideoEl)), () => {
    if ($localStream() && get$1(localVideoEl)) {
      mutate(localVideoEl, get$1(localVideoEl).srcObject = $localStream());
    }
  });
  legacy_pre_effect(() => ($remoteStream(), get$1(remoteVideoEl)), () => {
    if ($remoteStream() && get$1(remoteVideoEl)) {
      mutate(remoteVideoEl, get$1(remoteVideoEl).srcObject = $remoteStream());
    }
  });
  legacy_pre_effect(
    () => ($callStatus(), get$1(durationInterval)),
    () => {
      if ($callStatus() === "connected" && !get$1(durationInterval)) {
        startTimer();
      } else if ($callStatus() !== "connected" && get$1(durationInterval)) {
        stopTimer();
      }
    }
  );
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
          event("click", button, function(...$$args) {
            endCall == null ? void 0 : endCall.apply(this, $$args);
          });
          event("click", button_1, function(...$$args) {
            answerCall == null ? void 0 : answerCall.apply(this, $$args);
          });
          transition(1, div_1, () => fly, () => ({ y: 20 }));
          append($$anchor3, div_1);
        };
        var alternate = ($$anchor3) => {
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
          bind_this(video, ($$value) => set(remoteVideoEl, $$value), () => get$1(remoteVideoEl));
          var div_9 = sibling(video, 2);
          var video_1 = child(div_9);
          video_1.muted = true;
          bind_this(video_1, ($$value) => set(localVideoEl, $$value), () => get$1(localVideoEl));
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
            var alternate_1 = ($$anchor4) => {
              Mic_off($$anchor4, { size: 24 });
            };
            if_block(node_9, ($$render) => {
              if ($isAudioEnabled()) $$render(consequent_3);
              else $$render(alternate_1, false);
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
            var alternate_2 = ($$anchor4) => {
              Video_off($$anchor4, { size: 24 });
            };
            if_block(node_11, ($$render) => {
              if ($isVideoEnabled()) $$render(consequent_4);
              else $$render(alternate_2, false);
            });
          }
          var button_5 = sibling(button_4, 2);
          var node_12 = child(button_5);
          {
            var consequent_5 = ($$anchor4) => {
              Monitor_off($$anchor4, { size: 24 });
            };
            var alternate_3 = ($$anchor4) => {
              Monitor($$anchor4, { size: 24 });
            };
            if_block(node_12, ($$render) => {
              if ($isScreenSharing()) $$render(consequent_5);
              else $$render(alternate_3, false);
            });
          }
          var button_6 = sibling(button_5, 2);
          var node_13 = child(button_6);
          {
            var consequent_6 = ($$anchor4) => {
              Square($$anchor4, { size: 24 });
            };
            var alternate_4 = ($$anchor4) => {
              Disc($$anchor4, { size: 24 });
            };
            if_block(node_13, ($$render) => {
              if ($isRecording()) $$render(consequent_6);
              else $$render(alternate_4, false);
            });
          }
          template_effect(() => {
            set_text(text_2, $remotePeerId());
            set_text(text_3, get$1(duration));
            set_class(button_2, 1, `p-4 rounded-full ${($isAudioEnabled() ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600") ?? ""} text-white transition-colors`);
            set_class(button_4, 1, `p-4 rounded-full ${($isVideoEnabled() ? "bg-gray-700 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600") ?? ""} text-white transition-colors`);
            set_class(button_5, 1, `p-4 rounded-full ${($isScreenSharing() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-700 hover:bg-gray-600") ?? ""} text-white transition-colors`);
            set_attribute(button_5, "title", $isScreenSharing() ? "Stop sharing" : "Share screen");
            set_class(button_6, 1, `p-4 rounded-full ${($isRecording() ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-gray-700 hover:bg-gray-600") ?? ""} text-white transition-colors`);
            set_attribute(button_6, "title", $isRecording() ? "Stop recording" : "Record call");
          });
          event("click", button_2, function(...$$args) {
            toggleAudio == null ? void 0 : toggleAudio.apply(this, $$args);
          });
          event("click", button_3, function(...$$args) {
            endCall == null ? void 0 : endCall.apply(this, $$args);
          });
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
          else $$render(alternate, false);
        });
      }
      var node_14 = sibling(div, 2);
      SaveRecordingModal(node_14, {
        get isOpen() {
          return get$1(showSaveModal);
        },
        get blob() {
          return get$1(recordedBlob);
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
var root_1 = /* @__PURE__ */ template(`<p class="text-center mt-20">Loading...</p>`);
var root = /* @__PURE__ */ template(`<!> <!>`, 1);
function App($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $currentRoute = () => store_get(currentRoute, "$currentRoute", $$stores);
  const $syncState = () => store_get(syncState, "$syncState", $$stores);
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
    authStore.set({
      isLoggedIn: true,
      token: get$1(token),
      user
    });
    const hasRepo = await checkSkyGitRepoExists(get$1(token), user.login);
    if (hasRepo) {
      currentRoute.set("home");
      await initializeRepoState();
    } else {
      currentRoute.set("consent");
    }
  }
  async function approveRepo() {
    await createSkyGitRepo(get$1(token));
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
      await initializeStartupState(get$1(token));
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
    () => ($currentRoute(), $syncState(), get$1(token)),
    () => {
      if ($currentRoute() === "home" && $syncState().phase === "idle" && !$syncState().paused) {
        try {
          discoverAllRepos(get$1(token));
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
    var alternate = ($$anchor2, $$elseif) => {
      {
        var consequent_1 = ($$anchor3) => {
          LoginWithPAT($$anchor3, {
            onSubmit: loginWithToken,
            get error() {
              return get$1(loginError);
            }
          });
        };
        var alternate_1 = ($$anchor3, $$elseif2) => {
          {
            var consequent_2 = ($$anchor4) => {
              RepoConsent($$anchor4, { onApprove: approveRepo, onReject: rejectRepo });
            };
            var alternate_2 = ($$anchor4, $$elseif3) => {
              {
                var consequent_3 = ($$anchor5) => {
                  Settings($$anchor5, {});
                };
                var alternate_3 = ($$anchor5, $$elseif4) => {
                  {
                    var consequent_4 = ($$anchor6) => {
                      Chats($$anchor6, {});
                    };
                    var alternate_4 = ($$anchor6, $$elseif5) => {
                      {
                        var consequent_5 = ($$anchor7) => {
                          Repos($$anchor7, {});
                        };
                        var alternate_5 = ($$anchor7) => {
                          Home($$anchor7);
                        };
                        if_block(
                          $$anchor6,
                          ($$render) => {
                            if ($currentRoute() === "repos") $$render(consequent_5);
                            else $$render(alternate_5, false);
                          },
                          $$elseif5
                        );
                      }
                    };
                    if_block(
                      $$anchor5,
                      ($$render) => {
                        if ($currentRoute() === "chats") $$render(consequent_4);
                        else $$render(alternate_4, false);
                      },
                      $$elseif4
                    );
                  }
                };
                if_block(
                  $$anchor4,
                  ($$render) => {
                    if ($currentRoute() === "settings") $$render(consequent_3);
                    else $$render(alternate_3, false);
                  },
                  $$elseif3
                );
              }
            };
            if_block(
              $$anchor3,
              ($$render) => {
                if ($currentRoute() === "consent") $$render(consequent_2);
                else $$render(alternate_2, false);
              },
              $$elseif2
            );
          }
        };
        if_block(
          $$anchor2,
          ($$render) => {
            if ($currentRoute() === "login") $$render(consequent_1);
            else $$render(alternate_1, false);
          },
          $$elseif
        );
      }
    };
    if_block(node_1, ($$render) => {
      if ($currentRoute() === "loading") $$render(consequent);
      else $$render(alternate, false);
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
//# sourceMappingURL=index-8AZJkn32.js.map
