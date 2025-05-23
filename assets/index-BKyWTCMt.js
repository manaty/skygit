var _a;
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
function derived(fn) {
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
  var token2 = { effect: null, ran: false };
  context.l.r1.push(token2);
  token2.effect = render_effect(() => {
    deps();
    if (token2.ran) return;
    token2.ran = true;
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
    for (var token2 of context.l.r1) {
      var effect2 = token2.effect;
      if ((effect2.f & CLEAN) !== 0) {
        set_signal_status(effect2, MAYBE_DIRTY);
      }
      if (check_dirtiness(effect2)) {
        update_effect(effect2);
      }
      token2.ran = false;
    }
    context.l.r2.v = false;
  });
}
function render_effect(fn) {
  return create_effect(RENDER_EFFECT, fn, true);
}
function template_effect(fn, thunks = [], d = derived) {
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
    for (const transition of transitions) {
      transition.stop();
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
    for (var transition of transitions) {
      transition.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect2, transitions, local) {
  if ((effect2.f & INERT) !== 0) return;
  effect2.f ^= INERT;
  if (effect2.transitions !== null) {
    for (const transition of effect2.transitions) {
      if (transition.is_global || local) {
        transitions.push(transition);
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
    for (const transition of effect2.transitions) {
      if (transition.is_global || local) {
        transition.in();
      }
    }
  }
}
let micro_tasks = [];
let idle_tasks = [];
function run_micro_tasks() {
  var tasks = micro_tasks;
  micro_tasks = [];
  run_all(tasks);
}
function run_idle_tasks() {
  var tasks = idle_tasks;
  idle_tasks = [];
  run_all(tasks);
}
function queue_micro_task(fn) {
  if (micro_tasks.length === 0) {
    queueMicrotask(run_micro_tasks);
  }
  micro_tasks.push(fn);
}
function flush_tasks() {
  if (micro_tasks.length > 0) {
    run_micro_tasks();
  }
  if (idle_tasks.length > 0) {
    run_idle_tasks();
  }
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
function flushSync(fn) {
  var result;
  flush_tasks();
  while (queued_root_effects.length > 0) {
    is_flushing = true;
    flush_queued_root_effects();
    flush_tasks();
  }
  return (
    /** @type {T} */
    result
  );
}
async function tick() {
  await Promise.resolve();
  flushSync();
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
      component = Component(anchor_node, props) || {};
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
function element(node, get_tag, is_svg, render_fn, get_namespace, location) {
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
    const d = /* @__PURE__ */ derived(() => {
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
function subscribe_to_store(store, run2, invalidate) {
  if (store == null) {
    run2(void 0);
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
    var derived_getter = (immutable ? derived : derived_safe_equal)(
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
  var current_value = /* @__PURE__ */ derived(() => {
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
}
const currentRoute = writable("home");
const currentContent = writable(null);
const syncState = writable({
  phase: "streaming",
  // 'streaming' | 'discovery' | 'idle'
  paused: true,
  loadedCount: 0,
  totalCount: null
});
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
async function deriveKeyFromToken(token2) {
  const enc = new TextEncoder();
  const keyData = enc.encode(token2);
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
async function encryptJSON(token2, data) {
  const key = await deriveKeyFromToken(token2);
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
async function decryptJSON(token2, base64) {
  const combined = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const key = await deriveKeyFromToken(token2);
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
const BASE_API$1 = "https://api.github.com";
const REPO_NAME = "skygit-config";
function getHeaders(token2) {
  return {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json"
  };
}
let _cachedUserPromise = null;
async function getGitHubUsername(token2) {
  if (_cachedUserPromise) return _cachedUserPromise;
  _cachedUserPromise = (async () => {
    const res = await fetch(`${BASE_API$1}/user`, { headers: getHeaders(token2) });
    if (!res.ok) {
      _cachedUserPromise = null;
      throw new Error("Failed to fetch GitHub user");
    }
    const user = await res.json();
    return user.login;
  })();
  return _cachedUserPromise;
}
async function checkSkyGitRepoExists(token2, username) {
  const res = await fetch(`https://api.github.com/repos/${username}/${REPO_NAME}`, {
    headers: getHeaders(token2)
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
async function createSkyGitRepo(token2) {
  const headers2 = {
    Authorization: `token ${token2}`,
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
async function commitRepoToGitHub(token2, repo, maxRetries = 2) {
  const username = await getGitHubUsername(token2);
  const filePath = `repositories/${repo.owner}-${repo.name}.json`;
  const inFlight = _pendingRepoCommits.get(filePath);
  if (inFlight) return inFlight;
  const headers2 = {
    Authorization: `token ${token2}`,
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
        body: JSON.stringify(body)
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
async function streamPersistedReposFromGitHub(token2) {
  const username = await getGitHubUsername(token2);
  const path = `https://api.github.com/repos/${username}/skygit-config/contents/repositories`;
  const headers2 = {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json"
  };
  const res = await fetch(path, { headers: headers2 });
  if (res.status === 404) {
    const { paused: paused2 } = get(syncState);
    syncState.set({ phase: "idle", loadedCount: 0, totalCount: 0, paused: paused2 });
    return;
  }
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to load repository list: ${error}`);
  }
  const files = await res.json();
  const jsonFiles = files.filter((f) => f.name.endsWith(".json"));
  const { paused } = get(syncState);
  syncState.set({
    phase: "streaming",
    loadedCount: 0,
    totalCount: jsonFiles.length,
    paused
  });
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
async function streamPersistedConversationsFromGitHub(token2) {
  const username = await getGitHubUsername(token2);
  const url = `https://api.github.com/repos/${username}/skygit-config/contents/conversations`;
  const headers2 = {
    Authorization: `token ${token2}`,
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
async function deleteRepoFromGitHub(token2, repo) {
  const username = await getGitHubUsername(token2);
  const path = `repositories/${repo.owner}-${repo.name}.json`;
  const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
    headers: {
      Authorization: `token ${token2}`,
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
      Authorization: `token ${token2}`,
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
async function activateMessagingForRepo(token2, repo) {
  const headers2 = {
    Authorization: `token ${token2}`,
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
  await commitRepoToGitHub(token2, repo);
}
async function updateRepoMessagingConfig(token2, repo) {
  const headers2 = {
    Authorization: `token ${token2}`,
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
async function getSecretsMap(token2) {
  const username = await getGitHubUsername(token2);
  const url = `https://api.github.com/repos/${username}/skygit-config/contents/secrets.json`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token2}`,
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
async function saveSecretsMap(token2, secrets, sha = null) {
  const username = await getGitHubUsername(token2);
  const url = `https://api.github.com/repos/${username}/skygit-config/contents/secrets.json`;
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(secrets, null, 2))));
  if (!sha) {
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${token2}`,
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
      Authorization: `token ${token2}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify(body)
  });
  if (!saveRes.ok) {
    const err = await saveRes.text();
    throw new Error(`Failed to write secrets.json: ${err}`);
  }
}
async function storeEncryptedCredentials(token2, repo) {
  const url = repo.config.storage_info.url;
  const credentials = repo.config.storage_info.credentials;
  if (!credentials || Object.keys(credentials).length === 0) {
    return;
  }
  const encrypted = await encryptJSON(token2, credentials);
  const { secrets, sha } = await getSecretsMap(token2);
  secrets[url] = encrypted;
  await saveSecretsMap(token2, secrets, sha);
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
  const token2 = localStorage.getItem("skygit_token");
  if (!token2) return;
  const batch = [...commitQueue];
  commitQueue = [];
  clearTimeout(commitTimer);
  commitTimer = null;
  for (const repo of batch) {
    try {
      await commitRepoToGitHub(token2, repo);
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
async function validateToken(token2) {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${token2}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
function saveToken(token2) {
  localStorage.setItem("skygit_token", token2);
}
function loadStoredToken() {
  return localStorage.getItem("skygit_token");
}
const LOCAL_KEY = "skygit_conversations";
const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
const conversations = writable(saved);
const selectedConversation = writable(null);
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
        return {
          ...c,
          messages: [...c.messages || [], message],
          updatedAt: message.timestamp || Date.now()
        };
      }
      return c;
    });
    return { ...map, [repoName]: updatedList };
  });
  selectedConversation.update((current) => {
    if ((current == null ? void 0 : current.id) === convoId && (current == null ? void 0 : current.repo) === repoName) {
      return {
        ...current,
        messages: [...current.messages || [], message],
        updatedAt: message.timestamp || Date.now()
      };
    }
    return current;
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
async function discoverConversations(token2, repo) {
  const headers2 = {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json"
  };
  const path = `https://api.github.com/repos/${repo.full_name}/contents/.messages`;
  const res = await fetch(path, { headers: headers2 });
  if (!res.ok) return;
  const files = await res.json();
  const convoFiles = files.filter(
    (f) => (f.name.startsWith("conversation-") || f.name.includes("_")) && f.name.endsWith(".json")
  );
  const convos = [];
  for (const f of convoFiles) {
    let conversationId = null;
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
        conversationId = decoded.id;
        meta.id = conversationId;
        meta.title = decoded.title;
        meta.createdAt = decoded.createdAt;
        meta.updatedAt = decoded.updatedAt || decoded.createdAt;
      }
    } catch (err) {
      console.warn("[SkyGit] Failed to load conversation content:", err);
      if (f.name.startsWith("conversation-")) {
        conversationId = f.name.replace("conversation-", "").replace(".json", "");
        meta.id = conversationId;
      }
    }
    if (!conversationId) {
      console.warn("[SkyGit] Could not determine conversation ID for file:", f.name);
      continue;
    }
    convos.push(meta);
  }
  setConversationsForRepo(repo.full_name, convos);
  repo.conversations = convos.map((c) => c.id);
  await commitRepoToGitHub(token2, repo);
}
async function commitToSkyGitConversations(token2, conversation) {
  console.log("[SkyGit] 📝 commitToSkyGitConversations() called");
  console.log("⏩ Payload:", conversation);
  const username = await getGitHubUsername(token2);
  const safeRepo = conversation.repo.replace(/\W+/g, "_");
  const safeTitle = conversation.title.replace(/\W+/g, "_");
  const path = `conversations/${safeRepo}_${safeTitle}.json`;
  const content = btoa(JSON.stringify(conversation, null, 2));
  let sha = null;
  try {
    const checkRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
      headers: {
        Authorization: `token ${token2}`,
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
      Authorization: `token ${token2}`,
      Accept: "application/vnd.github+json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errMsg = await res.text();
    throw new Error(`[SkyGit] Failed to commit to skygit-config: ${res.status} ${errMsg}`);
  }
}
async function createConversation(token2, repo, title) {
  console.log("[SkyGit] 🔧 createConversation called for:", repo.full_name, "with title:", title);
  await getGitHubUsername(token2);
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
          Authorization: `token ${token2}`,
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
      Authorization: `token ${token2}`,
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
    await commitToSkyGitConversations(token2, content);
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
const headers = (token2) => ({
  Authorization: `token ${token2}`,
  Accept: "application/vnd.github+json"
});
let cancelRequested = false;
function cancelDiscovery() {
  cancelRequested = true;
}
async function discoverAllRepos(token2) {
  cancelRequested = false;
  const seen2 = /* @__PURE__ */ new Set();
  const allRepos = [];
  const userRepos = await fetchAllPaginated("https://api.github.com/user/repos", headers(token2));
  allRepos.push(...userRepos);
  syncState.update((s) => ({ ...s, totalCount: allRepos.length }));
  const orgs = await fetchAllPaginated("https://api.github.com/user/orgs", headers(token2));
  for (const org of orgs) {
    if (cancelRequested) return;
    const orgRepos = await fetchAllPaginated(`https://api.github.com/orgs/${org.login}/repos`, headers(token2));
    allRepos.push(...orgRepos);
    syncState.update((s) => ({ ...s, totalCount: allRepos.length }));
  }
  for (const repo of allRepos) {
    if (cancelRequested) return;
    const fullName = repo.full_name;
    if (seen2.has(fullName)) {
      syncState.update((s) => ({ ...s, loadedCount: s.loadedCount + 1 }));
      continue;
    }
    seen2.add(fullName);
    const hasMessages = await checkMessagesDirectory(token2, fullName);
    const hasDiscussions = typeof repo.has_discussions === "boolean" ? repo.has_discussions : false;
    const enrichedRepo = {
      name: repo.name,
      owner: repo.owner.login,
      full_name: fullName,
      url: repo.html_url,
      private: repo.private,
      has_messages: hasMessages,
      has_discussions: hasDiscussions,
      config: null
    };
    if (enrichedRepo.has_messages) {
      try {
        const configRes = await fetch(
          `https://api.github.com/repos/${fullName}/contents/.messages/config.json`,
          { headers: headers(token2) }
        );
        if (configRes.ok) {
          const cfg = await configRes.json();
          enrichedRepo.config = JSON.parse(atob(cfg.content));
        }
      } catch (e) {
        console.warn(`[SkyGit] Invalid config.json in ${fullName}`, e);
      }
      await discoverConversations(token2, enrichedRepo);
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
  syncState.update((s) => ({ ...s, phase: "idle" }));
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
async function checkMessagesDirectory(token2, fullName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${fullName}/contents/.messages`, {
      headers: headers(token2)
    });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}
const settingsStore = writable({
  config: null,
  secrets: {},
  secretsSha: null,
  cleanupMode: false
});
async function initializeStartupState(token2) {
  const username = await getGitHubUsername(token2);
  const headers2 = {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json"
  };
  const settings = {
    config: null,
    secrets: {},
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
            decrypted[url] = await decryptJSON(token2, encrypted);
          } catch (err) {
            console.warn(`[SkyGit] Failed to decrypt secret for ${url}:`, err);
          }
        }
        settings.secrets = decrypted;
        settings.secretsSha = file.sha;
      } catch (decryptErr) {
        console.warn("[SkyGit] Failed to parse or decrypt secrets.json:", decryptErr);
        console.warn("[SkyGit] Content preview:", file.content.slice(0, 50));
        settings.secrets = {};
        settings.secretsSha = file.sha;
      }
    } else if (res.status !== 404) {
      console.warn("[SkyGit] Failed to load secrets.json:", await res.text());
    }
  } catch (e) {
    console.warn("[SkyGit] Error loading secrets.json:", e);
  }
  settingsStore.set(settings);
  try {
    console.log("[SkyGit] Streaming saved repos...");
    await streamPersistedReposFromGitHub(token2);
  } catch (e) {
    console.warn("[SkyGit] Failed to stream repos:", e);
  }
  try {
    console.log("[SkyGit] Streaming saved conversations...");
    const conversations2 = await streamPersistedConversationsFromGitHub(token2) || [];
    const grouped = {};
    for (const convo of conversations2) {
      if (!grouped[convo.repo]) grouped[convo.repo] = [];
      grouped[convo.repo].push({
        id: convo.id,
        title: convo.title,
        name: `${convo.repo.replace(/\W+/g, "_")}_${convo.title.replace(/\W+/g, "_")}.json`,
        path: `.messages/${convo.repo.replace(/\W+/g, "_")}_${convo.title.replace(/\W+/g, "_")}.json`,
        repo: convo.repo
      });
    }
    for (const repoName in grouped) {
      setConversationsForRepo(repoName, grouped[repoName]);
    }
  } catch (e) {
    console.warn("[SkyGit] Failed to stream conversations:", e);
  }
}
let queue = /* @__PURE__ */ new Set();
let timers = /* @__PURE__ */ new Map();
const BATCH_SIZE = 10;
function queueConversationForCommit(repoName, convoId) {
  const key = `${repoName}::${convoId}`;
  queue.add(key);
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
  const keys = specificKeys || Array.from(queue);
  if (keys.length === 0) return;
  const token2 = localStorage.getItem("skygit_token");
  if (!token2) return;
  await getGitHubUsername(token2);
  const convoMap = get(conversations);
  for (const key of keys) {
    queue.delete(key);
    timers.delete(key);
    const [repoName, convoId] = key.split("::");
    const convos = convoMap[repoName] || [];
    const convoMeta = convos.find((c) => c.id === convoId);
    if (!convoMeta || !convoMeta.messages || convoMeta.messages.length === 0) {
      console.warn("[SkyGit] Skipped empty or missing conversation:", key);
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
      await commitToSkyGitConversations(token2, conversation);
      const safeRepo = conversation.repo.replace(/[\/\\]/g, "_").replace(/\W+/g, "_");
      const safeTitle = conversation.title.replace(/\W+/g, "_");
      let filename = `${safeRepo}_${safeTitle}.json`;
      let path = `.messages/${filename}`;
      const payload = btoa(JSON.stringify(conversation, null, 2));
      let sha = null;
      let counter = 1;
      while (true) {
        try {
          const checkRes = await fetch(`https://api.github.com/repos/${repoName}/contents/${path}`, {
            headers: {
              Authorization: `token ${token2}`,
              Accept: "application/vnd.github+json"
            }
          });
          if (checkRes.ok) {
            const existing = await checkRes.json();
            const existingContent = JSON.parse(atob(existing.content));
            if (existingContent.id === conversation.id) {
              sha = existing.sha;
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
      const body = {
        message: `Update conversation ${conversation.id}`,
        content: payload,
        ...sha && { sha }
      };
      const res = await fetch(`https://api.github.com/repos/${repoName}/contents/${path}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${token2}`,
          Accept: "application/vnd.github+json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`[SkyGit] Failed to commit to target repo ${repoName}:`, err);
      }
    } catch (err) {
      console.error("[SkyGit] Conversation commit failed:", err);
    }
  }
}
function hasPendingConversationCommits() {
  return queue.size > 0;
}
var root_1$7 = /* @__PURE__ */ template(`<p class="text-red-500 text-sm"> </p>`);
var root_2$5 = /* @__PURE__ */ template(`<span class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Authenticating…`, 1);
var root$c = /* @__PURE__ */ template(`<div class="space-y-4 max-w-md mx-auto mt-20 p-6 bg-white rounded shadow"><h2 class="text-xl font-semibold">Enter your GitHub Personal Access Token</h2> <input type="text" placeholder="ghp_..." class="w-full border p-2 rounded"> <!> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full flex items-center justify-center disabled:opacity-50"><!></button> <p class="text-sm text-gray-500">Don’t have a token? <a class="text-blue-600 underline" target="_blank" href="https://github.com/settings/tokens/new?scopes=repo,read:user&amp;description=SkyGit">Generate one here</a></p></div>`);
function LoginWithPAT($$anchor, $$props) {
  push($$props, false);
  let onSubmit = prop($$props, "onSubmit", 8);
  let error = prop($$props, "error", 8, null);
  let token2 = /* @__PURE__ */ mutable_source("");
  let loading = /* @__PURE__ */ mutable_source(false);
  async function handleSubmit() {
    if (get$1(loading)) return;
    set(loading, true);
    await onSubmit()(get$1(token2));
    set(loading, false);
  }
  init();
  var div = root$c();
  var input = sibling(child(div), 2);
  var node = sibling(input, 2);
  {
    var consequent = ($$anchor2) => {
      var p = root_1$7();
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
      var fragment = root_2$5();
      append($$anchor2, fragment);
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
  template_effect(() => {
    input.disabled = get$1(loading);
    button.disabled = get$1(loading);
  });
  bind_value(input, () => get$1(token2), ($$value) => set(token2, $$value));
  event("click", button, handleSubmit);
  append($$anchor, div);
  pop();
}
var root_1$6 = /* @__PURE__ */ template(`<span class="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Creating...`, 1);
var root$b = /* @__PURE__ */ template(`<div class="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow space-y-4"><h2 class="text-xl font-bold">Repository Creation</h2> <p>SkyGit needs to create a private GitHub repository in your account called <strong><code>skygit-config</code></strong>.</p> <p>This repository will store your conversation metadata and settings.</p> <div class="flex space-x-4 mt-6"><button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center disabled:opacity-50"><!></button> <button class="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button></div></div>`);
function RepoConsent($$anchor, $$props) {
  push($$props, false);
  let onApprove = prop($$props, "onApprove", 8);
  let onReject = prop($$props, "onReject", 8);
  let loading = /* @__PURE__ */ mutable_source(false);
  async function handleApprove() {
    if (get$1(loading)) return;
    set(loading, true);
    await onApprove()();
    set(loading, false);
  }
  init();
  var div = root$b();
  var div_1 = sibling(child(div), 6);
  var button = child(div_1);
  var node = child(button);
  {
    var consequent = ($$anchor2) => {
      var fragment = root_1$6();
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
var root$a = /* @__PURE__ */ ns_template(`<svg><!><!></svg>`);
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
  var svg = root$a();
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
const presencePolling = writable({});
function setPollingState(repoFullName2, active) {
  presencePolling.update((m) => ({ ...m, [repoFullName2]: active }));
}
var root_3$5 = /* @__PURE__ */ template(`<span title="Presence paused" class="mt-0.5">⏸️</span>`);
var root_4$2 = /* @__PURE__ */ template(`<span title="Presence active" class="mt-0.5">▶️</span>`);
var root_5$3 = /* @__PURE__ */ template(`<p class="text-xs text-gray-400 italic truncate mt-1"> </p>`);
var root_6$3 = /* @__PURE__ */ template(`<p class="text-xs text-gray-300 italic mt-1">No messages yet.</p>`);
var root_2$4 = /* @__PURE__ */ template(`<button class="px-3 py-2 hover:bg-blue-50 rounded cursor-pointer text-left flex gap-2 items-start"><!> <div class="flex-1"><p class="text-sm font-medium truncate"> </p> <p class="text-xs text-gray-500 truncate"> </p> <!></div></button>`);
var root_7$4 = /* @__PURE__ */ template(`<p class="text-xs text-gray-400 italic px-3 py-4">No conversations yet.</p>`);
var root$9 = /* @__PURE__ */ template(`<div class="flex flex-col gap-1 mt-2"><!> <!></div>`);
function SidebarChats($$anchor, $$props) {
  push($$props, false);
  const allConversations = /* @__PURE__ */ mutable_source();
  let convoMap = /* @__PURE__ */ mutable_source({});
  let pollingMap = /* @__PURE__ */ mutable_source({});
  conversations.subscribe((value) => set(convoMap, value));
  presencePolling.subscribe((m) => set(pollingMap, m));
  function openConversation(convo) {
    currentContent.set(convo);
    selectedConversation.set(convo);
    currentRoute.set("chats");
  }
  legacy_pre_effect(() => get$1(convoMap), () => {
    set(allConversations, Object.values(get$1(convoMap)).flat().sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    }));
  });
  legacy_pre_effect_reset();
  init();
  var div = root$9();
  var node = child(div);
  each(node, 1, () => get$1(allConversations), (convo) => convo.id, ($$anchor2, convo) => {
    var fragment = comment();
    var node_1 = first_child(fragment);
    key_block(node_1, () => `${get$1(convo).id}-${get$1(pollingMap)[get$1(convo).repo]}`, ($$anchor3) => {
      var button = root_2$4();
      var node_2 = child(button);
      {
        var consequent = ($$anchor4) => {
          var span = root_3$5();
          append($$anchor4, span);
        };
        var alternate = ($$anchor4) => {
          var span_1 = root_4$2();
          append($$anchor4, span_1);
        };
        if_block(node_2, ($$render) => {
          if (get$1(pollingMap)[get$1(convo).repo] === false) $$render(consequent);
          else $$render(alternate, false);
        });
      }
      var div_1 = sibling(node_2, 2);
      var p = child(div_1);
      var text2 = child(p);
      var p_1 = sibling(p, 2);
      var text_1 = child(p_1);
      var node_3 = sibling(p_1, 2);
      {
        var consequent_1 = ($$anchor4) => {
          var p_2 = root_5$3();
          var text_2 = child(p_2);
          template_effect(
            ($0) => set_text(text_2, $0),
            [
              () => get$1(convo).messages.at(-1).content
            ],
            derived_safe_equal
          );
          append($$anchor4, p_2);
        };
        var alternate_1 = ($$anchor4) => {
          var p_3 = root_6$3();
          append($$anchor4, p_3);
        };
        if_block(node_3, ($$render) => {
          if (get$1(convo).messages && get$1(convo).messages.length > 0) $$render(consequent_1);
          else $$render(alternate_1, false);
        });
      }
      template_effect(
        ($0) => {
          set_text(text2, $0);
          set_text(text_1, get$1(convo).repo);
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
    var consequent_2 = ($$anchor2) => {
      var p_4 = root_7$4();
      append($$anchor2, p_4);
    };
    if_block(node_4, ($$render) => {
      if (get$1(allConversations).length === 0) $$render(consequent_2);
    });
  }
  append($$anchor, div);
  pop();
}
var root_1$5 = /* @__PURE__ */ template(`<div class="flex items-center justify-between mb-3 text-sm text-gray-500"><div class="flex items-center gap-2"><!> <span> </span></div> <button class="text-blue-600 text-xs underline"> </button></div>`);
var root_3$4 = /* @__PURE__ */ template(`<div class="flex justify-end mb-3"><!> <span> </span> <button class="text-blue-600 text-xs underline"> </button></div>`);
var root_5$2 = /* @__PURE__ */ template(`<div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-3"><div class="text-xs text-gray-400">✔️ Discovery complete</div> <div class="flex gap-2"><button class="text-blue-600 text-xs underline">🔄 Sync</button> <button class="text-blue-600 text-xs underline">🔍 Discover</button></div></div>`);
var root_8$1 = /* @__PURE__ */ template(`<span class="ml-2 text-xs text-red-600 font-semibold">Discussions disabled</span>`);
var root_7$3 = /* @__PURE__ */ template(`<li class="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"><div class="text-sm truncate"><button class="font-medium text-blue-700 hover:underline cursor-pointer"> </button> <p class="text-xs text-gray-500"> <!></p></div> <button aria-label="Remove repo"><!></button></li>`);
var root_6$2 = /* @__PURE__ */ template(`<ul class="space-y-2"></ul>`);
var root_9$2 = /* @__PURE__ */ template(`<p class="text-sm text-gray-400 italic mt-2">No matching repositories found.</p>`);
var root_10$2 = /* @__PURE__ */ template(`<div class="mt-3 text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-1">Some repositories have Discussions disabled. Enable Discussions in your GitHub repo settings to use messaging features.</div>`);
var root$8 = /* @__PURE__ */ template(`<!> <div class="flex flex-wrap gap-3 text-xs text-gray-700 mb-3"><label><input type="checkbox"> 🔒 Private</label> <label><input type="checkbox"> 🌐 Public</label> <label><input type="checkbox"> 💬 With Messages</label> <label><input type="checkbox"> No Messages</label></div> <!> <!>`, 1);
function SidebarRepos($$anchor, $$props) {
  push($$props, false);
  const filteredRepos = /* @__PURE__ */ mutable_source();
  const hasAnyNoDiscussions = /* @__PURE__ */ mutable_source();
  let search = prop($$props, "search", 8, "");
  let repos = /* @__PURE__ */ mutable_source([]);
  let state2 = /* @__PURE__ */ mutable_source();
  let container = /* @__PURE__ */ mutable_source();
  let showPrivate = /* @__PURE__ */ mutable_source(true);
  let showPublic = /* @__PURE__ */ mutable_source(true);
  let showWithMessages = /* @__PURE__ */ mutable_source(true);
  let showWithoutMessages = /* @__PURE__ */ mutable_source(true);
  repoList.subscribe((value) => set(repos, value));
  syncState.subscribe((s) => set(state2, s));
  function toggleStreamPause() {
    syncState.update((s) => ({ ...s, paused: !s.paused }));
  }
  function toggleDiscoveryPause() {
    if (get$1(state2).paused) {
      syncState.update((s) => ({ ...s, paused: false }));
      const token2 = localStorage.getItem("skygit_token");
      if (token2) discoverAllRepos(token2);
    } else {
      cancelDiscovery();
      syncState.update((s) => ({ ...s, paused: true }));
    }
  }
  async function removeRepo(fullName) {
    const repo = get$1(repos).find((r2) => r2.full_name === fullName);
    if (!repo) return;
    repoList.update((list) => list.filter((r2) => r2.full_name !== fullName));
    try {
      const token2 = localStorage.getItem("skygit_token");
      await deleteRepoFromGitHub(token2, repo);
      console.log(`[SkyGit] Deleted ${fullName} from GitHub`);
    } catch (e) {
      console.warn(`[SkyGit] Failed to delete ${fullName} from GitHub:`, e);
    }
  }
  async function triggerSync() {
    const token2 = localStorage.getItem("skygit_token");
    if (token2) {
      syncState.update((s) => ({
        ...s,
        phase: "streaming",
        paused: false,
        loadedCount: 0
      }));
      await streamPersistedReposFromGitHub(token2);
    }
  }
  async function triggerDiscovery() {
    const token2 = localStorage.getItem("skygit_token");
    if (token2) {
      syncState.update((s) => ({ ...s, phase: "discovery", paused: false }));
      discoverAllRepos(token2);
    }
  }
  function showRepo(repo) {
    selectedRepo.set(repo);
    currentContent.set(repo);
  }
  legacy_pre_effect(
    () => (get$1(repos), deep_read_state(search()), get$1(showPrivate), get$1(showPublic), get$1(showWithMessages), get$1(showWithoutMessages)),
    () => {
      set(filteredRepos, get$1(repos).filter((repo) => {
        const q = search().toLowerCase();
        const matchesSearch = repo.full_name.toLowerCase().includes(q) || repo.name.toLowerCase().includes(q) || repo.owner.toLowerCase().includes(q);
        const matchesPrivacy = repo.private && get$1(showPrivate) || !repo.private && get$1(showPublic);
        const matchesMessages = repo.has_messages && get$1(showWithMessages) || !repo.has_messages && get$1(showWithoutMessages);
        return matchesSearch && matchesPrivacy && matchesMessages;
      }));
    }
  );
  legacy_pre_effect(() => get$1(filteredRepos), () => {
    filteredCount.set(get$1(filteredRepos).length);
  });
  legacy_pre_effect(() => get$1(repos), () => {
    set(hasAnyNoDiscussions, get$1(repos).some((r2) => !r2.has_discussions));
  });
  legacy_pre_effect_reset();
  init();
  var fragment = root$8();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1$5();
      var div_1 = child(div);
      var node_1 = child(div_1);
      Loader_circle(node_1, { class: "w-4 h-4 animate-spin text-blue-500" });
      var span = sibling(node_1, 2);
      var text2 = child(span);
      var button = sibling(div_1, 2);
      var text_1 = child(button);
      template_effect(() => {
        set_text(text2, `Syncing: ${get$1(state2).loadedCount ?? ""}/${get$1(state2).totalCount ?? "?"}`);
        set_text(text_1, get$1(state2).paused ? "Resume Syncing" : "Pause Syncing");
      });
      event("click", button, toggleStreamPause);
      append($$anchor2, div);
    };
    var alternate = ($$anchor2, $$elseif) => {
      {
        var consequent_1 = ($$anchor3) => {
          var div_2 = root_3$4();
          var node_2 = child(div_2);
          Loader_circle(node_2, { class: "w-4 h-4 animate-spin text-blue-500" });
          var span_1 = sibling(node_2, 2);
          var text_2 = child(span_1);
          var button_1 = sibling(span_1, 2);
          var text_3 = child(button_1);
          template_effect(() => {
            set_text(text_2, `Discov.: ${get$1(state2).loadedCount ?? ""}/${get$1(state2).totalCount ?? "?"}`);
            set_text(text_3, get$1(state2).paused ? "Resume Discovery" : "Pause Discovery");
          });
          event("click", button_1, toggleDiscoveryPause);
          append($$anchor3, div_2);
        };
        var alternate_1 = ($$anchor3, $$elseif2) => {
          {
            var consequent_2 = ($$anchor4) => {
              var div_3 = root_5$2();
              var div_4 = sibling(child(div_3), 2);
              var button_2 = child(div_4);
              var button_3 = sibling(button_2, 2);
              event("click", button_2, triggerSync);
              event("click", button_3, triggerDiscovery);
              append($$anchor4, div_3);
            };
            if_block(
              $$anchor3,
              ($$render) => {
                if (get$1(state2).phase === "idle") $$render(consequent_2);
              },
              $$elseif2
            );
          }
        };
        if_block(
          $$anchor2,
          ($$render) => {
            if (get$1(state2).phase === "discovery") $$render(consequent_1);
            else $$render(alternate_1, false);
          },
          $$elseif
        );
      }
    };
    if_block(node, ($$render) => {
      if (get$1(state2).phase === "streaming") $$render(consequent);
      else $$render(alternate, false);
    });
  }
  var div_5 = sibling(node, 2);
  var label = child(div_5);
  var input = child(label);
  var label_1 = sibling(label, 2);
  var input_1 = child(label_1);
  var label_2 = sibling(label_1, 2);
  var input_2 = child(label_2);
  var label_3 = sibling(label_2, 2);
  var input_3 = child(label_3);
  var node_3 = sibling(div_5, 2);
  {
    var consequent_4 = ($$anchor2) => {
      var ul = root_6$2();
      each(ul, 5, () => get$1(filteredRepos), (repo) => repo.full_name, ($$anchor3, repo) => {
        var li = root_7$3();
        var div_6 = child(li);
        var button_4 = child(div_6);
        var text_4 = child(button_4);
        var p = sibling(button_4, 2);
        var text_5 = child(p);
        var node_4 = sibling(text_5);
        {
          var consequent_3 = ($$anchor4) => {
            var span_2 = root_8$1();
            append($$anchor4, span_2);
          };
          if_block(node_4, ($$render) => {
            if (!get$1(repo).has_discussions) $$render(consequent_3);
          });
        }
        bind_this(div_6, ($$value) => set(container, $$value), () => get$1(container));
        var button_5 = sibling(div_6, 2);
        var node_5 = child(button_5);
        Trash_2(node_5, {
          class: "w-4 h-4 text-red-500 hover:text-red-700"
        });
        template_effect(() => {
          set_text(text_4, get$1(repo).full_name);
          set_text(text_5, `${(get$1(repo).has_messages ? " | 💬 .messages" : " | no messaging") ?? ""} `);
        });
        event("click", button_4, () => showRepo(get$1(repo)));
        event("click", button_5, () => removeRepo(get$1(repo).full_name));
        append($$anchor3, li);
      });
      append($$anchor2, ul);
    };
    var alternate_2 = ($$anchor2) => {
      var p_1 = root_9$2();
      append($$anchor2, p_1);
    };
    if_block(node_3, ($$render) => {
      if (get$1(filteredRepos).length > 0) $$render(consequent_4);
      else $$render(alternate_2, false);
    });
  }
  var node_6 = sibling(node_3, 2);
  {
    var consequent_5 = ($$anchor2) => {
      var div_7 = root_10$2();
      append($$anchor2, div_7);
    };
    if_block(node_6, ($$render) => {
      if (get$1(hasAnyNoDiscussions)) $$render(consequent_5);
    });
  }
  bind_checked(input, () => get$1(showPrivate), ($$value) => set(showPrivate, $$value));
  bind_checked(input_1, () => get$1(showPublic), ($$value) => set(showPublic, $$value));
  bind_checked(input_2, () => get$1(showWithMessages), ($$value) => set(showWithMessages, $$value));
  bind_checked(input_3, () => get$1(showWithoutMessages), ($$value) => set(showWithoutMessages, $$value));
  append($$anchor, fragment);
  pop();
}
var root$7 = /* @__PURE__ */ template(`<p class="text-sm text-gray-500">[Calls history will appear here]</p>`);
function SidebarCalls($$anchor) {
  var p = root$7();
  append($$anchor, p);
}
var root$6 = /* @__PURE__ */ template(`<p class="text-sm text-gray-500">[Contacts  will appear here]</p>`);
function SidebarContacts($$anchor) {
  var p = root$6();
  append($$anchor, p);
}
var root$5 = /* @__PURE__ */ template(`<p class="text-sm text-gray-500">[Notifications will show here]</p>`);
function SidebarNotifications($$anchor) {
  var p = root$5();
  append($$anchor, p);
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
var root_1$4 = /* @__PURE__ */ template(`<div class="absolute top-12 right-0 w-40 bg-white border border-gray-200 rounded shadow-md text-sm z-50"><button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button> <button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Help</button> <hr> <button class="block w-full text-left px-4 py-2 hover:bg-gray-100">Log out</button></div>`);
var root_3$3 = /* @__PURE__ */ template(`<div class="absolute top-0 right-1 -mt-1 -mr-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow"> </div>`);
var root_2$3 = /* @__PURE__ */ template(`<button type="button"><div><!></div> <!> </button>`);
var root$4 = /* @__PURE__ */ template(`<div class="p-4 relative h-full overflow-y-auto"><div class="flex items-center justify-between mb-4 relative"><div class="flex items-center gap-3"><img class="w-10 h-10 rounded-full" alt="avatar"> <div><p class="font-semibold"> </p> <p class="text-xs text-gray-500"> </p></div></div> <button class="text-gray-500 hover:text-gray-700 text-lg font-bold" aria-label="Open menu">⋯</button> <!></div> <div class="relative mb-4"><input type="text" placeholder="" class="w-full pl-10 pr-3 py-2 rounded bg-gray-100 text-sm border border-gray-300 focus:outline-none"> <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M10 2a8 8 0 015.29 13.71l4.5 4.5a1 1 0 01-1.42 1.42l-4.5-4.5A8 8 0 1110 2zm0 2a6 6 0 100 12A6 6 0 0010 4z"></path></svg></div> <div class="flex justify-around mb-4 text-xs text-center"></div> <div><!></div></div>`);
function Sidebar($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $currentRoute = () => store_get(currentRoute, "$currentRoute", $$stores);
  const $filteredCount = () => store_get(filteredCount, "$filteredCount", $$stores);
  let user = /* @__PURE__ */ mutable_source(null);
  let menuOpen = /* @__PURE__ */ mutable_source(false);
  let searchQuery = /* @__PURE__ */ mutable_source("");
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
  var div = root$4();
  var div_1 = child(div);
  var div_2 = child(div_1);
  var img = child(div_2);
  var div_3 = sibling(img, 2);
  var p = child(div_3);
  var text2 = child(p);
  var p_1 = sibling(p, 2);
  var text_1 = child(p_1);
  var button = sibling(div_2, 2);
  var node = sibling(button, 2);
  {
    var consequent = ($$anchor2) => {
      var div_4 = root_1$4();
      var button_1 = child(div_4);
      var button_2 = sibling(button_1, 6);
      action(div_4, ($$node, $$action_arg) => clickOutside == null ? void 0 : clickOutside($$node, $$action_arg), () => closeMenu);
      event("click", button_1, goToSettings);
      event("click", button_2, function(...$$args) {
        logoutUser == null ? void 0 : logoutUser.apply(this, $$args);
      });
      append($$anchor2, div_4);
    };
    if_block(node, ($$render) => {
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
    var button_3 = root_2$3();
    let classes;
    var div_7 = child(button_3);
    var node_1 = child(div_7);
    Icon2()(node_1, { class: "w-5 h-5" });
    var node_2 = sibling(div_7, 2);
    {
      var consequent_1 = ($$anchor3) => {
        var div_8 = root_3$3();
        var text_2 = child(div_8);
        template_effect(() => set_text(text_2, $filteredCount()));
        append($$anchor3, div_8);
      };
      if_block(node_2, ($$render) => {
        if (id() === "repos" && get$1(searchQuery).trim() !== "") $$render(consequent_1);
      });
    }
    var text_3 = sibling(node_2);
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
  var node_3 = child(div_9);
  {
    var consequent_2 = ($$anchor2) => {
      SidebarChats($$anchor2, {});
    };
    var alternate = ($$anchor2, $$elseif) => {
      {
        var consequent_3 = ($$anchor3) => {
          SidebarRepos($$anchor3, {
            get search() {
              return get$1(searchQuery);
            }
          });
        };
        var alternate_1 = ($$anchor3, $$elseif2) => {
          {
            var consequent_4 = ($$anchor4) => {
              SidebarCalls($$anchor4);
            };
            var alternate_2 = ($$anchor4, $$elseif3) => {
              {
                var consequent_5 = ($$anchor5) => {
                  SidebarContacts($$anchor5);
                };
                var alternate_3 = ($$anchor5, $$elseif4) => {
                  {
                    var consequent_6 = ($$anchor6) => {
                      SidebarNotifications($$anchor6);
                    };
                    if_block(
                      $$anchor5,
                      ($$render) => {
                        if ($currentRoute() === "notifications") $$render(consequent_6);
                      },
                      $$elseif4
                    );
                  }
                };
                if_block(
                  $$anchor4,
                  ($$render) => {
                    if ($currentRoute() === "contacts") $$render(consequent_5);
                    else $$render(alternate_3, false);
                  },
                  $$elseif3
                );
              }
            };
            if_block(
              $$anchor3,
              ($$render) => {
                if ($currentRoute() === "calls") $$render(consequent_4);
                else $$render(alternate_2, false);
              },
              $$elseif2
            );
          }
        };
        if_block(
          $$anchor2,
          ($$render) => {
            if ($currentRoute() === "repos") $$render(consequent_3);
            else $$render(alternate_1, false);
          },
          $$elseif
        );
      }
    };
    if_block(node_3, ($$render) => {
      if ($currentRoute() === "chats") $$render(consequent_2);
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
  bind_value(input, () => get$1(searchQuery), ($$value) => set(searchQuery, $$value));
  append($$anchor, div);
  pop();
  $$cleanup();
}
var root_1$3 = /* @__PURE__ */ template(`<button class="p-2 text-gray-700 text-xl rounded bg-white shadow" aria-label="Open sidebar">←</button>`);
var root$3 = /* @__PURE__ */ template(`<div class="layout svelte-scw01y"><div class="p-2 md:hidden"><!></div> <div><!></div> <div><!></div></div>`);
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
  var div = root$3();
  var div_1 = child(div);
  var node = child(div_1);
  {
    var consequent = ($$anchor2) => {
      var button = root_1$3();
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
var root_1$2 = /* @__PURE__ */ template(`<p class="text-gray-400 italic text-center mt-20">Welcome to skygit.</p>`);
function Home($$anchor) {
  Layout($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var p = root_1$2();
      append($$anchor2, p);
    },
    $$slots: { default: true }
  });
}
var root_6$1 = /* @__PURE__ */ template(`<button title="Save">💾</button>`);
var root_7$2 = /* @__PURE__ */ template(`<button title="Edit">✏️</button>`);
var root_5$1 = /* @__PURE__ */ template(`<button title="Hide">🙈</button> <!>`, 1);
var root_8 = /* @__PURE__ */ template(`<button title="Reveal">👁️</button>`);
var root_12$1 = /* @__PURE__ */ template(`<label class="block mb-2"><span class="font-semibold"> </span> <input class="w-full border px-2 py-1 rounded text-xs"></label>`);
var root_10$1 = /* @__PURE__ */ template(`<label class="block mb-2"><span class="font-semibold">Type</span> <select disabled class="w-full border px-2 py-1 rounded text-xs bg-gray-100 text-gray-500"><option> </option></select></label> <!>`, 1);
var root_13$1 = /* @__PURE__ */ template(`<pre class="text-xs text-gray-700 bg-white border rounded p-2"> </pre>`);
var root_9$1 = /* @__PURE__ */ template(`<tr class="bg-gray-50 text-xs"><td colspan="4" class="p-3"><!></td></tr>`);
var root_2$2 = /* @__PURE__ */ template(`<tr class="border-t"><td class="p-2 align-top"> </td><td class="p-2 font-mono text-xs text-gray-500"> </td><td class="p-2 text-xs text-gray-700"><!></td><td class="p-2 space-x-3 text-sm"><!> <button title="Delete">🗑️</button></td></tr> <!>`, 1);
var root_14$2 = /* @__PURE__ */ template(`<div class="grid md:grid-cols-3 gap-4"><label>Access Key ID: <input class="w-full border px-2 py-1 rounded text-sm"></label> <label>Secret Access Key: <input class="w-full border px-2 py-1 rounded text-sm"></label> <label>Region: <input class="w-full border px-2 py-1 rounded text-sm"></label></div>`);
var root_16$1 = /* @__PURE__ */ template(`<div class="grid md:grid-cols-3 gap-4"><label>Client ID: <input class="w-full border px-2 py-1 rounded text-sm"></label> <label>Client Secret: <input class="w-full border px-2 py-1 rounded text-sm"></label> <label>Refresh Token: <input class="w-full border px-2 py-1 rounded text-sm"></label></div>`);
var root_1$1 = /* @__PURE__ */ template(`<div class="p-6 max-w-4xl mx-auto space-y-6"><h2 class="text-2xl font-semibold text-gray-800">🔐 Credential Manager</h2> <table class="w-full text-sm border rounded overflow-hidden shadow"><thead class="bg-gray-100 text-left"><tr><th class="p-2">URL</th><th class="p-2">Encrypted Preview</th><th class="p-2">Type</th><th class="p-2">Actions</th></tr></thead><tbody></tbody></table> <div class="border-t pt-4 space-y-2"><h3 class="text-lg font-semibold text-gray-700">➕ Add Credential</h3> <div class="grid md:grid-cols-2 gap-4"><label>URL: <input placeholder="https://my-storage.com/path" class="w-full border px-2 py-1 rounded text-sm"></label> <label>Type: <select class="w-full border px-2 py-1 rounded text-sm"><option>S3</option><option>Google Drive</option></select></label></div> <!> <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">💾 Add Credential</button></div> <div class="border-t pt-4 space-y-2"><h3 class="text-lg font-semibold text-gray-700">App Settings</h3> <label class="flex items-center space-x-2"><input type="checkbox"> <span>Cleanup mode (delete old presence channels)</span></label></div></div>`);
function Settings($$anchor, $$props) {
  push($$props, false);
  let secrets = /* @__PURE__ */ mutable_source({});
  let decrypted = /* @__PURE__ */ mutable_source({});
  let revealed = /* @__PURE__ */ mutable_source(/* @__PURE__ */ new Set());
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
  const token2 = localStorage.getItem("skygit_token");
  onMount(async () => {
    set(cleanupMode, get(settingsStore).cleanupMode || false);
    if (!token2) return;
    const result = await getSecretsMap(token2);
    set(secrets, result.secrets);
    sha = result.sha;
  });
  async function reveal(url) {
    try {
      if (!get$1(decrypted)[url]) {
        mutate(decrypted, get$1(decrypted)[url] = await decryptJSON(token2, get$1(secrets)[url]));
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
    const encrypted = await encryptJSON(token2, get$1(editCredentials));
    mutate(secrets, get$1(secrets)[url] = encrypted);
    set(secrets, { ...get$1(secrets) });
    mutate(decrypted, get$1(decrypted)[url] = get$1(editCredentials));
    set(decrypted, { ...get$1(decrypted) });
    set(revealed, new Set(get$1(revealed)).add(url));
    set(editing, null);
    await saveSecretsMap(token2, get$1(secrets), sha);
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
    await saveSecretsMap(token2, get$1(secrets), sha);
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
    const encrypted = await encryptJSON(token2, template2);
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
    await saveSecretsMap(token2, get$1(secrets), sha);
  }
  function saveCleanupMode() {
    settingsStore.update((s) => ({ ...s, cleanupMode: get$1(cleanupMode) }));
    localStorage.setItem("skygit_cleanup_mode", get$1(cleanupMode) ? "true" : "false");
  }
  init();
  Layout($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var div = root_1$1();
      var table = sibling(child(div), 2);
      var tbody = sibling(child(table));
      each(tbody, 5, () => Object.entries(get$1(secrets)), index, ($$anchor3, $$item) => {
        let url = () => get$1($$item)[0];
        let value = () => get$1($$item)[1];
        var fragment_1 = root_2$2();
        var tr = first_child(fragment_1);
        var td = child(tr);
        var text$1 = child(td);
        var td_1 = sibling(td);
        var text_1 = child(td_1);
        var td_2 = sibling(td_1);
        var node = child(td_2);
        {
          var consequent = ($$anchor4) => {
            var text_2 = text();
            template_effect(() => set_text(text_2, get$1(decrypted)[url()].type === "s3" ? "S3" : "Google Drive"));
            append($$anchor4, text_2);
          };
          var alternate = ($$anchor4) => {
            var text_3 = text("?");
            append($$anchor4, text_3);
          };
          if_block(node, ($$render) => {
            if (get$1(decrypted)[url()]) $$render(consequent);
            else $$render(alternate, false);
          });
        }
        var td_3 = sibling(td_2);
        var node_1 = child(td_3);
        {
          var consequent_2 = ($$anchor4) => {
            var fragment_3 = root_5$1();
            var button = first_child(fragment_3);
            var node_2 = sibling(button, 2);
            {
              var consequent_1 = ($$anchor5) => {
                var button_1 = root_6$1();
                event("click", button_1, () => saveEdit(url()));
                append($$anchor5, button_1);
              };
              var alternate_1 = ($$anchor5) => {
                var button_2 = root_7$2();
                event("click", button_2, () => startEdit(url()));
                append($$anchor5, button_2);
              };
              if_block(node_2, ($$render) => {
                if (get$1(editing) === url()) $$render(consequent_1);
                else $$render(alternate_1, false);
              });
            }
            event("click", button, () => hide(url()));
            append($$anchor4, fragment_3);
          };
          var alternate_2 = ($$anchor4) => {
            var button_3 = root_8();
            event("click", button_3, () => reveal(url()));
            append($$anchor4, button_3);
          };
          if_block(node_1, ($$render) => {
            if (get$1(revealed).has(url())) $$render(consequent_2);
            else $$render(alternate_2, false);
          });
        }
        var button_4 = sibling(node_1, 2);
        var node_3 = sibling(tr, 2);
        {
          var consequent_5 = ($$anchor4) => {
            var tr_1 = root_9$1();
            var td_4 = child(tr_1);
            var node_4 = child(td_4);
            {
              var consequent_4 = ($$anchor5) => {
                var fragment_4 = root_10$1();
                var label = first_child(fragment_4);
                var select = sibling(child(label), 2);
                var option = child(select);
                var option_value = {};
                var text_4 = child(option);
                var node_5 = sibling(label, 2);
                each(node_5, 1, () => Object.entries(get$1(editCredentials)), index, ($$anchor6, $$item2) => {
                  let key = () => get$1($$item2)[0];
                  var fragment_5 = comment();
                  var node_6 = first_child(fragment_5);
                  {
                    var consequent_3 = ($$anchor7) => {
                      var label_1 = root_12$1();
                      var span = child(label_1);
                      var text_5 = child(span);
                      var input = sibling(span, 2);
                      template_effect(() => set_text(text_5, key()));
                      bind_value(input, () => get$1(editCredentials)[key()], ($$value) => mutate(editCredentials, get$1(editCredentials)[key()] = $$value));
                      append($$anchor7, label_1);
                    };
                    if_block(node_6, ($$render) => {
                      if (key() !== "type") $$render(consequent_3);
                    });
                  }
                  append($$anchor6, fragment_5);
                });
                template_effect(() => {
                  if (option_value !== (option_value = get$1(editCredentials).type)) {
                    option.value = null == (option.__value = get$1(editCredentials).type) ? "" : get$1(editCredentials).type;
                  }
                  set_text(text_4, get$1(editCredentials).type);
                });
                append($$anchor5, fragment_4);
              };
              var alternate_3 = ($$anchor5) => {
                var pre = root_13$1();
                var text_6 = child(pre);
                template_effect(
                  ($0) => set_text(text_6, `${$0 ?? ""}
                                    `),
                  [
                    () => JSON.stringify(get$1(decrypted)[url()], null, 2)
                  ],
                  derived_safe_equal
                );
                append($$anchor5, pre);
              };
              if_block(node_4, ($$render) => {
                if (get$1(editing) === url()) $$render(consequent_4);
                else $$render(alternate_3, false);
              });
            }
            append($$anchor4, tr_1);
          };
          if_block(node_3, ($$render) => {
            if (get$1(revealed).has(url())) $$render(consequent_5);
          });
        }
        template_effect(
          ($0) => {
            set_text(text$1, url());
            set_text(text_1, `${$0 ?? ""}...`);
          },
          [() => value().slice(0, 20)],
          derived_safe_equal
        );
        event("click", button_4, () => deleteCredential(url()));
        append($$anchor3, fragment_1);
      });
      var div_1 = sibling(table, 2);
      var div_2 = sibling(child(div_1), 2);
      var label_2 = child(div_2);
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
      var node_7 = sibling(div_2, 2);
      {
        var consequent_6 = ($$anchor3) => {
          var div_3 = root_14$2();
          var label_4 = child(div_3);
          var input_2 = sibling(child(label_4));
          var label_5 = sibling(label_4, 2);
          var input_3 = sibling(child(label_5));
          var label_6 = sibling(label_5, 2);
          var input_4 = sibling(child(label_6));
          bind_value(input_2, () => get$1(newCredentials).accessKeyId, ($$value) => mutate(newCredentials, get$1(newCredentials).accessKeyId = $$value));
          bind_value(input_3, () => get$1(newCredentials).secretAccessKey, ($$value) => mutate(newCredentials, get$1(newCredentials).secretAccessKey = $$value));
          bind_value(input_4, () => get$1(newCredentials).region, ($$value) => mutate(newCredentials, get$1(newCredentials).region = $$value));
          append($$anchor3, div_3);
        };
        var alternate_4 = ($$anchor3, $$elseif) => {
          {
            var consequent_7 = ($$anchor4) => {
              var div_4 = root_16$1();
              var label_7 = child(div_4);
              var input_5 = sibling(child(label_7));
              var label_8 = sibling(label_7, 2);
              var input_6 = sibling(child(label_8));
              var label_9 = sibling(label_8, 2);
              var input_7 = sibling(child(label_9));
              bind_value(input_5, () => get$1(newCredentials).client_id, ($$value) => mutate(newCredentials, get$1(newCredentials).client_id = $$value));
              bind_value(input_6, () => get$1(newCredentials).client_secret, ($$value) => mutate(newCredentials, get$1(newCredentials).client_secret = $$value));
              bind_value(input_7, () => get$1(newCredentials).refresh_token, ($$value) => mutate(newCredentials, get$1(newCredentials).refresh_token = $$value));
              append($$anchor4, div_4);
            };
            if_block(
              $$anchor3,
              ($$render) => {
                if (get$1(newType) === "google_drive") $$render(consequent_7);
              },
              $$elseif
            );
          }
        };
        if_block(node_7, ($$render) => {
          if (get$1(newType) === "s3") $$render(consequent_6);
          else $$render(alternate_4, false);
        });
      }
      var button_5 = sibling(node_7, 2);
      var div_5 = sibling(div_1, 2);
      var label_10 = sibling(child(div_5), 2);
      var input_8 = child(label_10);
      bind_value(input_1, () => get$1(newUrl), ($$value) => set(newUrl, $$value));
      bind_select_value(select_1, () => get$1(newType), ($$value) => set(newType, $$value));
      event("click", button_5, addCredential);
      bind_checked(input_8, () => get$1(cleanupMode), ($$value) => set(cleanupMode, $$value));
      event("change", input_8, saveCleanupMode);
      append($$anchor2, div);
    },
    $$slots: { default: true }
  });
  pop();
}
var root_2$1 = /* @__PURE__ */ template(`<div class="bg-blue-100 p-2 rounded shadow text-sm"><div class="font-semibold text-blue-800"> </div> <div> </div> <div class="text-xs text-gray-500"> </div></div>`);
var root_3$2 = /* @__PURE__ */ template(`<p class="text-center text-gray-400 italic mt-10">No messages yet.</p>`);
var root$2 = /* @__PURE__ */ template(`<div class="p-4 space-y-3"><!></div>`);
function MessageList($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $selectedConversationStore = () => store_get(selectedConversation, "$selectedConversationStore", $$stores);
  const $authStore = () => store_get(authStore, "$authStore", $$stores);
  const effectiveConversation = /* @__PURE__ */ mutable_source();
  const messages = /* @__PURE__ */ mutable_source();
  const currentUsername = /* @__PURE__ */ mutable_source();
  let conversation = prop($$props, "conversation", 8, null);
  function getDisplaySender(sender) {
    return sender === get$1(currentUsername) ? "You" : sender;
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
  legacy_pre_effect(() => $authStore(), () => {
    var _a2, _b;
    set(currentUsername, (_b = (_a2 = $authStore()) == null ? void 0 : _a2.user) == null ? void 0 : _b.login);
  });
  legacy_pre_effect_reset();
  init();
  var div = root$2();
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var fragment = comment();
      var node_1 = first_child(fragment);
      each(node_1, 1, () => get$1(messages), (msg) => msg.id || msg.timestamp, ($$anchor3, msg) => {
        var div_1 = root_2$1();
        var div_2 = child(div_1);
        var text2 = child(div_2);
        var div_3 = sibling(div_2, 2);
        var text_1 = child(div_3);
        var div_4 = sibling(div_3, 2);
        var text_2 = child(div_4);
        template_effect(
          ($0, $1) => {
            set_text(text2, $0);
            set_text(text_1, get$1(msg).content);
            set_text(text_2, $1);
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
    var alternate = ($$anchor2) => {
      var p = root_3$2();
      append($$anchor2, p);
    };
    if_block(node, ($$render) => {
      if (get$1(messages).length > 0) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  append($$anchor, div);
  pop();
  $$cleanup();
}
const KEY = "skygit_context_id";
function getContextId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
const BASE_API = "https://api.github.com";
let unloadRegistered = false;
async function getDiscussionNodeId(token2, repoFullName2, discussionNumber) {
  const [owner, name] = repoFullName2.split("/");
  const data = await ghGraphQL(token2, `
    query($owner:String!,$name:String!,$number:Int!){
      repository(owner:$owner,name:$name){ discussion(number:$number){ id } }
    }`, { owner, name, number: discussionNumber });
  return data.repository.discussion.id;
}
async function addDiscussionCommentGQL(token2, discussionId, bodyStr) {
  await ghGraphQL(token2, `
    mutation($id:ID!,$body:String!){
      addDiscussionComment(input:{discussionId:$id,body:$body}){ clientMutationId }
    }`, { id: discussionId, body: bodyStr });
}
async function updateDiscussionCommentGQL(token2, commentId, bodyStr) {
  await ghGraphQL(token2, `
    mutation($cid:ID!,$body:String!){
      updateDiscussionComment(input:{commentId:$cid,body:$body}){ clientMutationId }
    }`, { cid: commentId, body: bodyStr });
}
async function deleteDiscussionCommentGQL(token2, commentId) {
  await ghGraphQL(
    token2,
    `
    mutation($cid:ID!){ deleteDiscussionComment(input:{id:$cid}){ clientMutationId } }`,
    { cid: commentId }
  );
}
async function deleteDiscussionGQL(token2, discussionNodeId) {
  await ghGraphQL(
    token2,
    `
    mutation($id:ID!){ deleteDiscussion(input:{id:$id}){ clientMutationId } }`,
    { id: discussionNodeId }
  );
}
async function ghGraphQL(token2, query, variables = {}) {
  const res = await fetch(`${BASE_API}/graphql`, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token2}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) {
    const text2 = await res.text();
    throw new Error(`GraphQL API error (${res.status}): ${text2}`);
  }
  const json = await res.json();
  if (json.errors && json.errors.length) {
    throw new Error(`GraphQL API returned errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}
function cacheKey(repoFullName2) {
  return `skygit_presence_discussion_${repoFullName2}`;
}
async function getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode = false) {
  var _a2;
  if (!cleanupMode && typeof window !== "undefined") {
    const cached = localStorage.getItem(cacheKey(repoFullName2));
    if (cached) {
      try {
        const res = await fetch(`${BASE_API}/repos/${repoFullName2}/discussions/${cached}`, {
          headers: { Authorization: `token ${token2}` }
        });
        if (res.ok) {
          return Number(cached);
        }
        localStorage.removeItem(cacheKey(repoFullName2));
      } catch (_) {
      }
    }
  }
  const headers2 = {
    Authorization: `token ${token2}`,
    /*
     * For Discussions endpoints we must request the **inertia** preview
     * or GitHub responds with 404 as if the route does not exist.
     */
    Accept: "application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json"
  };
  const discussionsUrl = `${BASE_API}/repos/${repoFullName2}/discussions?per_page=100`;
  let discussions = [];
  try {
    let page = 1;
    while (true) {
      const res = await fetch(`${discussionsUrl}&page=${page}`, { headers: headers2 });
      if (!res.ok) break;
      const arr = await res.json();
      discussions = discussions.concat(arr);
      if (arr.length < 100) break;
      page++;
    }
  } catch (_) {
  }
  const presenceList = discussions.filter((d) => d.title === "SkyGit Presence Channel");
  if (presenceList.length) {
    const chosen = presenceList[0];
    if (cleanupMode && presenceList.length > 1) {
      for (const dup of presenceList.slice(1)) {
        try {
          await deleteDiscussionGQL(token2, dup.node_id);
        } catch (_) {
        }
      }
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(cacheKey(repoFullName2), chosen.number);
    }
    return chosen.number;
  }
  let categoryId;
  try {
    const categoriesRes = await fetch(`${BASE_API}/repos/${repoFullName2}/discussions/categories`, { headers: headers2 });
    if (categoriesRes.ok) {
      const categories = await categoriesRes.json();
      if (categories.length) {
        categoryId = ((_a2 = categories.find((c) => c.slug === "general")) == null ? void 0 : _a2.id) || categories[0].id;
      }
    }
  } catch (_) {
  }
  if (!categoryId) {
    const [owner, name] = repoFullName2.split("/");
    try {
      const data = await ghGraphQL(token2, `
        query($owner:String!,$name:String!){
          repository(owner:$owner,name:$name){
            discussionCategories(first:50){ nodes{ id slug name } }
          }
        }`, { owner, name });
      const cats = data.repository.discussionCategories.nodes;
      if (cats.length) {
        const general = cats.find((c) => c.slug === "general");
        categoryId = (general || cats[0]).id;
      }
    } catch (e) {
      console.warn("[SkyGit][Presence] GraphQL categories fallback failed", e);
    }
  }
  if (!categoryId) {
    throw new Error("Failed to resolve a discussion category id");
  }
  if (typeof categoryId === "string" && categoryId.startsWith("DIC_")) {
    const [owner, name] = repoFullName2.split("/");
    const mutation = `
      mutation($repoId:ID!,$catId:ID!,$title:String!,$body:String!){
        createDiscussion(input:{repositoryId:$repoId,categoryId:$catId,title:$title,body:$body}){
          discussion{ number }
        }
      }`;
    const repoData = await ghGraphQL(token2, `query($owner:String!,$name:String!){repository(owner:$owner,name:$name){id}}`, { owner, name });
    const repoId = repoData.repository.id;
    const data = await ghGraphQL(token2, mutation, {
      repoId,
      catId: categoryId,
      title: "SkyGit Presence Channel",
      body: "Discussion used by SkyGit for presence signaling. Safe to ignore."
    });
    return cacheReturn(data.createDiscussion.discussion.number);
  }
  function cacheReturn(num) {
    if (typeof window !== "undefined") {
      localStorage.setItem(cacheKey(repoFullName2), num);
    }
    return num;
  }
  const createRes = await fetch(discussionsUrl, {
    method: "POST",
    headers: { ...headers2, "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "SkyGit Presence Channel",
      body: "Discussion used by SkyGit for presence signaling. Safe to ignore.",
      category_id: categoryId
    })
  });
  if (!createRes.ok) {
    if (createRes.status === 422 || createRes.status === 409) {
      const retryRes = await fetch(discussionsUrl, { headers: headers2 });
      if (retryRes.ok) {
        const list = await retryRes.json();
        const found = list.find((d) => d.title === "SkyGit Presence Channel");
        if (found) return cacheReturn(found.number);
      }
    }
    throw new Error("Failed to create presence discussion");
  }
  const created = await createRes.json();
  return cacheReturn(created.number);
}
function presenceEquals(a, b) {
  const omit = (o) => {
    const { last_seen, ...rest } = o;
    return rest;
  };
  return JSON.stringify(omit(a)) === JSON.stringify(omit(b));
}
async function postPresenceComment(token2, repoFullName2, username, sessionId2, signaling_info = null, cleanupMode = false) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode);
  const headers2 = {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json"
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName2}/discussions/${discussionNumber}/comments`;
  let cachedDiscussionId = null;
  async function discussionId() {
    if (cachedDiscussionId) return cachedDiscussionId;
    cachedDiscussionId = await getDiscussionNodeId(token2, repoFullName2, discussionNumber);
    return cachedDiscussionId;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let join_timestamp = now;
  let res = await fetch(commentsUrl, { headers: headers2 });
  let comments = [];
  if (!res.ok && res.status === 404) {
    clearCachedDiscussion(repoFullName2);
    const freshNum = await getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode);
    if (freshNum !== discussionNumber) {
      discussionNumber = freshNum;
      cachedDiscussionId = null;
      res = await fetch(`${BASE_API}/repos/${repoFullName2}/discussions/${discussionNumber}/comments`, { headers: headers2 });
    }
  }
  if (res.ok) {
    comments = await res.json();
  }
  const contextId = getContextId();
  let cacheId = null;
  if (typeof window !== "undefined") {
    cacheId = localStorage.getItem(commentCacheKey());
  }
  if (cacheId && !comments.some((c) => String(c.id) === cacheId)) {
    try {
      const cRes = await fetch(`${BASE_API}/repos/${repoFullName2}/discussions/comments/${cacheId}`, { headers: headers2 });
      if (cRes.ok) {
        const single = await cRes.json();
        comments.push(single);
      } else {
        if (typeof window !== "undefined") localStorage.removeItem(commentCacheKey());
        cacheId = null;
      }
    } catch (_) {
    }
  }
  function commentCacheKey() {
    return `skygit_presence_comment_${repoFullName2}_${contextId}`;
  }
  const myComments = comments.filter((c) => {
    try {
      const body = JSON.parse(c.body);
      return body.username === username && body.context_id === contextId;
    } catch {
      return false;
    }
  });
  const myComment = myComments.find((c) => {
    try {
      return JSON.parse(c.body).session_id === sessionId2;
    } catch {
      return false;
    }
  });
  for (const c of myComments) {
    if (!myComment) break;
    if (c.id === myComment.id) continue;
    try {
      await deleteDiscussionCommentGQL(token2, c.node_id);
    } catch (_) {
      await fetch(`${commentsUrl}/${c.id}`, { method: "DELETE", headers: headers2 });
    }
    if (typeof window !== "undefined" && String(c.id) === localStorage.getItem(commentCacheKey())) {
      localStorage.removeItem(commentCacheKey());
    }
  }
  if (myComment) {
    try {
      const existing = JSON.parse(myComment.body);
      if (existing.join_timestamp) {
        join_timestamp = existing.join_timestamp;
      }
    } catch {
    }
  }
  const presenceBody = {
    username,
    context_id: contextId,
    session_id: sessionId2,
    join_timestamp,
    last_seen: now,
    signaling_info
  };
  let shouldUpdate = false;
  if (myComment) {
    let existing;
    try {
      existing = JSON.parse(myComment.body);
    } catch (e) {
      existing = {};
    }
    const lastSeenGap = Math.abs(new Date(now) - new Date(existing.last_seen));
    if (!presenceEquals(existing, presenceBody) || lastSeenGap > 3e4) {
      shouldUpdate = true;
    }
  }
  if (myComment && shouldUpdate) {
    try {
      await updateDiscussionCommentGQL(token2, myComment.node_id, JSON.stringify(presenceBody));
      if (typeof window !== "undefined") localStorage.setItem(commentCacheKey(), String(myComment.id));
    } catch (e) {
      const updateUrl = `${commentsUrl}/${myComment.id}`;
      await fetch(updateUrl, {
        method: "PATCH",
        headers: { ...headers2, "Content-Type": "application/json" },
        body: JSON.stringify({ body: JSON.stringify(presenceBody) })
      });
      if (typeof window !== "undefined") localStorage.setItem(commentCacheKey(), String(myComment.id));
    }
    if (!unloadRegistered) registerBeforeUnload(repoFullName2, myComment.id);
  } else if (!myComment) {
    try {
      const did = await discussionId();
      await addDiscussionCommentGQL(token2, did, JSON.stringify(presenceBody));
      const listRes = await fetch(commentsUrl, { headers: headers2 });
      if (listRes.ok) {
        const list = await listRes.json();
        const created = list.find((c) => {
          try {
            const body = JSON.parse(c.body);
            return body.session_id === sessionId2 && body.context_id === contextId;
          } catch {
            return false;
          }
        });
        if (created && typeof window !== "undefined") {
          localStorage.setItem(commentCacheKey(), String(created.id));
          if (!unloadRegistered) registerBeforeUnload(repoFullName2, created.id);
        }
      }
    } catch (_) {
      await fetch(commentsUrl, {
        method: "POST",
        headers: { ...headers2, "Content-Type": "application/json" },
        body: JSON.stringify({ body: JSON.stringify(presenceBody) })
      });
      try {
        const created = await fetch(commentsUrl + "?per_page=1", { headers: headers2 });
        if (created.ok) {
          const arr = await created.json();
          if (arr.length && typeof window !== "undefined") {
            localStorage.setItem(commentCacheKey(), String(arr[0].id));
          }
        }
      } catch (_2) {
      }
    }
  }
  const tenMin = 10 * 60 * 1e3;
  for (const c of myComments) {
    if (myComment && c.id === myComment.id) continue;
    try {
      const body = JSON.parse(c.body);
      const age = Date.now() - new Date(body.last_seen || body.join_timestamp).getTime();
      if (age > tenMin) {
        await deleteDiscussionCommentGQL(token2, c.node_id);
        if (typeof window !== "undefined" && cacheId === String(c.id)) {
          localStorage.removeItem(commentCacheKey());
        }
      }
    } catch (_) {
    }
  }
}
function registerBeforeUnload(repoFullName2, commentId) {
  if (typeof window === "undefined" || unloadRegistered) return;
  unloadRegistered = true;
  window.addEventListener("beforeunload", () => {
    const url = `${BASE_API}/repos/${repoFullName2}/discussions/comments/${commentId}`;
    const bodyData = { body: JSON.stringify({ left_at: (/* @__PURE__ */ new Date()).toISOString() }) };
    fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `token ${localStorage.getItem("skygit_token") || ""}`,
        Accept: "application/vnd.github+json, application/vnd.github.inertia-preview+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData),
      keepalive: true
    }).catch(() => {
    });
  });
}
async function markPeerForPendingRemoval(token2, repoFullName2, peerUsername, peerSessionId, removerUsername, cleanupMode = false) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode);
  const headers2 = {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json"
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName2}/discussions/${discussionNumber}/comments`;
  let res = await fetch(commentsUrl, { headers: headers2 });
  if (!res.ok && res.status === 404) {
    clearCachedDiscussion(repoFullName2);
    const freshNum = await getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode);
    if (freshNum !== discussionNumber) {
      discussionNumber = freshNum;
      res = await fetch(`${BASE_API}/repos/${repoFullName2}/discussions/${discussionNumber}/comments`, { headers: headers2 });
    }
  }
  if (!res.ok) return;
  const comments = await res.json();
  const peerComment = comments.find((c) => {
    try {
      const body = JSON.parse(c.body);
      return body.username === peerUsername && body.session_id === peerSessionId;
    } catch (e) {
      return false;
    }
  });
  if (peerComment) {
    let body;
    try {
      body = JSON.parse(peerComment.body);
    } catch (e) {
      body = {};
    }
    body.pendingRemovalBy = removerUsername;
    body.pendingRemovalAt = (/* @__PURE__ */ new Date()).toISOString();
    try {
      await updateDiscussionCommentGQL(token2, peerComment.node_id, JSON.stringify(body));
    } catch (_) {
      const updateUrl = `${commentsUrl}/${peerComment.id}`;
      await fetch(updateUrl, {
        method: "PATCH",
        headers: { ...headers2, "Content-Type": "application/json" },
        body: JSON.stringify({ body: JSON.stringify(body) })
      });
    }
    console.debug("[SkyGit][Presence] marked peer for pending removal", peerUsername, peerSessionId);
  }
}
async function cleanupStalePeerPresence(token2, repoFullName2, peerUsername, peerSessionId, cleanupMode = false) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode);
  const headers2 = {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json"
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName2}/discussions/${discussionNumber}/comments`;
  let res = await fetch(commentsUrl, { headers: headers2 });
  if (!res.ok && res.status === 404) {
    clearCachedDiscussion(repoFullName2);
    const freshNum = await getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode);
    if (freshNum !== discussionNumber) {
      discussionNumber = freshNum;
      res = await fetch(`${BASE_API}/repos/${repoFullName2}/discussions/${discussionNumber}/comments`, { headers: headers2 });
    }
  }
  if (!res.ok) return;
  const comments = await res.json();
  const peerComment = comments.find((c) => {
    try {
      const body = JSON.parse(c.body);
      return body.username === peerUsername && body.session_id === peerSessionId;
    } catch (e) {
      return false;
    }
  });
  if (peerComment) {
    let body;
    try {
      body = JSON.parse(peerComment.body);
    } catch (e) {
      body = {};
    }
    if (body.pendingRemovalBy && body.pendingRemovalAt) {
      const age = Date.now() - new Date(body.pendingRemovalAt).getTime();
      if (age > 6e4) {
        try {
          await deleteDiscussionCommentGQL(token2, peerComment.node_id);
        } catch (_) {
          const delUrl = `${commentsUrl}/${peerComment.id}`;
          await fetch(delUrl, { method: "DELETE", headers: headers2 });
        }
        console.debug("[SkyGit][Presence] deleted stale peer presence", peerUsername, peerSessionId);
      }
    }
  }
}
async function pollPresenceFromDiscussion(token2, repoFullName2, cleanupMode = false) {
  const discussionNumber = await getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode);
  const headers2 = {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json, application/vnd.github.squirrel-girl-preview+json"
  };
  const commentsUrl = `${BASE_API}/repos/${repoFullName2}/discussions/${discussionNumber}/comments`;
  let res = await fetch(commentsUrl, { headers: headers2 });
  if (!res.ok && res.status === 404) {
    clearCachedDiscussion(repoFullName2);
    const freshNum = await getOrCreatePresenceDiscussion(token2, repoFullName2, cleanupMode);
    if (freshNum !== discussionNumber) {
      discussionNumber = freshNum;
      res = await fetch(`${BASE_API}/repos/${repoFullName2}/discussions/${discussionNumber}/comments`, { headers: headers2 });
    }
  }
  if (!res.ok) {
    console.warn("[SkyGit][Presence] pollPresenceFromDiscussion failed", res.status, res.statusText);
    return [];
  }
  const comments = await res.json();
  const now = Date.now();
  const rawPresence = comments.map((c) => {
    try {
      return JSON.parse(c.body);
    } catch (e) {
      return null;
    }
  }).filter(Boolean).filter((p) => p.last_seen && now - new Date(p.last_seen).getTime() < 2 * 60 * 1e3);
  const dedup = {};
  for (const p of rawPresence) {
    const existing = dedup[p.session_id];
    if (!existing || new Date(p.last_seen) > new Date(existing.last_seen)) {
      dedup[p.session_id] = p;
    }
  }
  const presence = Object.values(dedup);
  console.log("[SkyGit][Presence] pollPresenceFromDiscussion got peers", presence);
  return presence;
}
async function postHeartbeat(token2, repoFullName2, username, sessionId2, signaling_info = null, cleanupMode = false) {
  await postPresenceComment(token2, repoFullName2, username, sessionId2, signaling_info, cleanupMode);
}
async function pollPresence(token2, repoFullName2, cleanupMode = false) {
  return await pollPresenceFromDiscussion(token2, repoFullName2, cleanupMode);
}
async function deleteOwnPresenceComment(token2, repoFullName2) {
  if (typeof window === "undefined") return;
  const key = `skygit_presence_comment_${repoFullName2}_${getContextId()}`;
  const commentId = localStorage.getItem(key);
  if (!commentId) return;
  const headers2 = {
    Authorization: `token ${token2}`,
    Accept: "application/vnd.github+json, application/vnd.github.inertia-preview+json, application/vnd.github.squirrel-girl-preview+json"
  };
  try {
    await fetch(
      `${BASE_API}/repos/${repoFullName2}/discussions/comments/${commentId}`,
      { method: "DELETE", headers: headers2 }
    );
  } catch (e) {
    console.warn("[SkyGit][Presence] failed to delete own presence comment", e);
  }
  localStorage.removeItem(key);
}
function getIceServers() {
  const { config, secrets } = get(settingsStore) || {};
  let servers = [{ urls: "stun:stun.l.google.com:19302" }];
  if (config && config.ice_servers) {
    const extras = Array.isArray(config.ice_servers) ? config.ice_servers : [config.ice_servers];
    servers = servers.concat(extras);
  }
  if (secrets && secrets.turn) {
    const t = secrets.turn;
    if (t.urls) servers.push(t);
  }
  if (typeof window !== "undefined" && window.skygitTurnServer) {
    servers.push(window.skygitTurnServer);
  }
  return servers;
}
class SkyGitWebRTC {
  constructor({ token: token2, repoFullName: repoFullName2, peerUsername, isPersistent = false, onSignal, onRemoteStream, onDataChannelMessage, onFileReceived, onFileReceiveProgress, onFileSendProgress }) {
    this.token = token2;
    this.repoFullName = repoFullName2;
    this.peerUsername = peerUsername;
    this.isPersistent = isPersistent;
    this.onSignal = onSignal;
    this.onRemoteStream = onRemoteStream;
    this.onDataChannelMessage = onDataChannelMessage;
    this.onFileReceived = onFileReceived;
    this.onFileReceiveProgress = onFileReceiveProgress;
    this.onFileSendProgress = onFileSendProgress;
    this.peerConnection = null;
    this.dataChannel = null;
    this.remoteDataChannel = null;
    this.signalingCallback = null;
    this.fileTransfers = {};
  }
  async start(isInitiator, offerSignal = null) {
    const iceServers = getIceServers();
    this.peerConnection = new RTCPeerConnection({ iceServers });
    this.peerConnection.onicecandidate = (event2) => {
      if (event2.candidate && this.signalingCallback) {
        this.signalingCallback({ type: "ice", candidate: event2.candidate });
      }
    };
    this.peerConnection.ontrack = (event2) => {
      if (this.onRemoteStream) this.onRemoteStream(event2.streams[0]);
    };
    this.peerConnection.ondatachannel = (event2) => {
      this.remoteDataChannel = event2.channel;
      this.setupDataChannel(event2.channel);
    };
    if (isInitiator) {
      this.dataChannel = this.peerConnection.createDataChannel("skygit");
      this.setupDataChannel(this.dataChannel);
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      if (this.signalingCallback) this.signalingCallback({ type: "offer", sdp: offer });
    } else if (offerSignal) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSignal.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      if (this.signalingCallback) this.signalingCallback({ type: "answer", sdp: answer });
    }
  }
  setupDataChannel(channel) {
    channel.onopen = () => {
    };
    channel.onclose = () => {
    };
    channel.onerror = (e) => {
    };
    this._setupDataChannelHandlers();
  }
  _setupDataChannelHandlers() {
    if (this.dataChannel) {
      this.dataChannel.onmessage = (event2) => {
        try {
          const msg = JSON.parse(event2.data);
          this.handleDataChannelMessage(msg);
        } catch (e) {
          console.error("Invalid data channel message:", event2.data);
        }
      };
    }
  }
  handleDataChannelMessage(msg) {
    if (msg.type === "screen-share") {
      if (typeof window !== "undefined" && window.skygitOnScreenShare) {
        window.skygitOnScreenShare(msg.active, msg.meta);
      }
      return;
    }
    if (msg.type === "media-status") {
      if (typeof window !== "undefined" && window.skygitOnMediaStatus) {
        window.skygitOnMediaStatus({ micOn: msg.micOn, cameraOn: msg.cameraOn });
      }
      return;
    }
    if (msg.type && msg.type.startsWith("file-")) {
      this.handleFileMessage(msg);
    } else {
      if (this.onDataChannelMessage) {
        this.onDataChannelMessage(msg);
      }
    }
  }
  async handleSignal(signal) {
    if (signal.type === "offer") {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      if (this.signalingCallback) this.signalingCallback({ type: "answer", sdp: answer });
    } else if (signal.type === "answer") {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    } else if (signal.type === "ice") {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
    if (this.onSignal) this.onSignal(signal);
  }
  send(message) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(JSON.stringify(message));
    }
  }
  sendScreenShareSignal(active, meta = {}) {
    this.send({ type: "screen-share", active, meta });
  }
  sendFile(file) {
    const id = crypto.randomUUID();
    const chunkSize = 16 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const meta = { type: "file-meta", id, name: file.name, size: file.size, totalChunks };
    this.send(meta);
    let offset = 0, seq = 0;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target.readyState !== FileReader.DONE) return;
      const arr = new Uint8Array(e.target.result);
      this.send({ type: "file-chunk", id, seq, data: Array.from(arr) });
      seq++;
      offset += chunkSize;
      if (typeof this.onFileSendProgress === "function") {
        this.onFileSendProgress(meta, seq, totalChunks);
      }
      if (offset < file.size) {
        readNext();
      } else {
        this.send({ type: "file-end", id });
        if (typeof this.onFileSendProgress === "function") {
          this.onFileSendProgress(meta, totalChunks, totalChunks);
        }
      }
    };
    const readNext = () => {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    readNext();
  }
  handleFileMessage(msg) {
    if (msg.type === "file-meta") {
      this.fileTransfers[msg.id] = { meta: msg, chunks: [], received: 0 };
      if (typeof this.onFileReceiveProgress === "function") {
        this.onFileReceiveProgress(msg, 0, msg.totalChunks);
      }
    } else if (msg.type === "file-chunk") {
      const transfer = this.fileTransfers[msg.id];
      if (transfer) {
        transfer.chunks[msg.seq] = new Uint8Array(msg.data);
        transfer.received++;
        if (typeof this.onFileReceiveProgress === "function") {
          this.onFileReceiveProgress(transfer.meta, transfer.received, transfer.meta.totalChunks);
        }
      }
    } else if (msg.type === "file-end") {
      const transfer = this.fileTransfers[msg.id];
      if (transfer) {
        const blob = new Blob(transfer.chunks, { type: "application/octet-stream" });
        if (this.onFileReceived) this.onFileReceived(transfer.meta, blob);
        if (typeof this.onFileReceiveProgress === "function") {
          this.onFileReceiveProgress(transfer.meta, transfer.meta.totalChunks, transfer.meta.totalChunks);
        }
        delete this.fileTransfers[msg.id];
      }
    }
  }
  // Replace the outgoing video track with a new one (for screen sharing)
  replaceVideoTrack(newTrack) {
    if (!this.peerConnection) return;
    const senders = this.peerConnection.getSenders();
    const videoSender = senders.find((s) => s.track && s.track.kind === "video");
    if (videoSender) {
      videoSender.replaceTrack(newTrack);
    }
  }
  stop() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.remoteDataChannel) {
      this.remoteDataChannel.close();
      this.remoteDataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
const peerConnections = writable({});
const onlinePeers = writable([]);
let localUsername = null;
let repoFullName = null;
let token = null;
let sessionId = null;
function getLocalSessionId() {
  return sessionId;
}
let heartbeatInterval = null;
let presencePollInterval = null;
let leaderCommitInterval = null;
function shutdownPeerManager() {
  stopPresence();
  peerConnections.set({});
  onlinePeers.set([]);
  clearInterval(leaderCommitInterval);
  leaderCommitInterval = null;
  _currentInit = { token: null, repoFullName: null, username: null };
}
let _currentInit = { token: null, repoFullName: null, username: null };
function initializePeerManager({ _token, _repoFullName, _username, _sessionId }) {
  if (_currentInit.token === _token && _currentInit.repoFullName === _repoFullName && _currentInit.username === _username) {
    return;
  }
  _currentInit = { token: _token, repoFullName: _repoFullName, username: _username };
  stopPresence();
  peerConnections.set({});
  onlinePeers.set([]);
  console.log("[SkyGit][Presence] initializePeerManager:", { _token, _repoFullName, _username, _sessionId });
  token = _token;
  repoFullName = _repoFullName;
  localUsername = _username;
  sessionId = _sessionId;
  pollPresence(token, repoFullName, get(settingsStore).cleanupMode).then((peers) => {
    console.log("[SkyGit][Presence] initial peers:", peers);
    const filteredPeers = peers.filter((p) => p.username !== localUsername);
    onlinePeers.set(filteredPeers);
    handlePeerDiscovery(peers);
    maybeStartLeaderCommitInterval();
    maybeMergeQueueOnLeaderChange();
    if (isLeader(peers, sessionId)) {
      startLeaderPresence();
    } else {
      startNonLeaderPresenceMonitor();
    }
  }).catch((e) => {
    console.error("[SkyGit][Presence] initial poll error", e);
  });
}
function startLeaderPresence() {
  console.log("[SkyGit][Presence] startLeaderPresence (leader) for repo:", repoFullName, "as", localUsername, "session", sessionId);
  postHeartbeat(token, repoFullName, localUsername, sessionId, null, get(settingsStore).cleanupMode);
  heartbeatInterval = setInterval(() => {
    postHeartbeat(token, repoFullName, localUsername, sessionId, null, get(settingsStore).cleanupMode);
  }, 3e4);
  presencePollInterval = setInterval(async () => {
    const peers = await pollPresence(token, repoFullName, get(settingsStore).cleanupMode);
    console.log("[SkyGit][Presence] [Leader] polled peers:", peers);
    onlinePeers.set(peers.filter((p) => p.session_id !== sessionId));
    handlePeerDiscovery(peers);
    maybeStartLeaderCommitInterval();
    maybeMergeQueueOnLeaderChange();
  }, 5e3);
}
function startNonLeaderPresenceMonitor() {
  console.log("[SkyGit][Presence] startNonLeaderPresenceMonitor for repo:", repoFullName, "as", localUsername, "session", sessionId);
  const poll = async () => {
    const peers = await pollPresence(token, repoFullName, get(settingsStore).cleanupMode);
    console.log("[SkyGit][Presence] [Non-Leader] polled peers:", peers);
    onlinePeers.set(peers.filter((p) => p.session_id !== sessionId));
    handlePeerDiscovery(peers);
  };
  poll().catch((e) => console.error("[SkyGit][Presence] non-leader initial poll error", e));
  presencePollInterval = setInterval(() => {
    poll().catch((e) => console.error("[SkyGit][Presence] non-leader poll error", e));
  }, 5e3);
  const unsub = peerConnections.subscribe((conns) => {
    const isConnected = Object.values(conns).some((c) => c.status === "connected");
    if (isConnected && presencePollInterval) {
      console.log("[SkyGit][Presence] [Non-Leader] connected to leader, stopping presence polling");
      clearInterval(presencePollInterval);
      presencePollInterval = null;
      unsub();
    }
  });
}
function stopPresence() {
  console.log("[SkyGit][Presence] stopPresence");
  clearInterval(heartbeatInterval);
  clearInterval(presencePollInterval);
}
async function handlePeerDiscovery(peers) {
  peerConnections.update((existing) => {
    const updated = { ...existing };
    const leader = getCurrentLeader(peers, sessionId);
    if (sessionId === leader) {
      for (const peer of peers) {
        if (peer.session_id === sessionId) continue;
        if (!updated[peer.session_id]) {
          updated[peer.session_id] = { status: "connecting", conn: null, username: peer.username };
          connectToPeer(peer, updated);
        }
      }
      Object.keys(updated).forEach((sid) => {
        if (sid === sessionId) return;
        if (!peers.some((p) => p.session_id === sid)) {
          if (updated[sid].conn) updated[sid].conn.stop();
          delete updated[sid];
        }
      });
    } else {
      const leaderPeer = peers.find((p) => p.session_id === leader);
      Object.keys(updated).forEach((sid) => {
        if (sid !== leader) {
          if (updated[sid].conn) updated[sid].conn.stop();
          delete updated[sid];
        }
      });
      if (leaderPeer && !updated[leader]) {
        updated[leader] = { status: "connecting", conn: null, username: leaderPeer.username };
        connectToPeer(leaderPeer, updated);
      }
    }
    return updated;
  });
  for (const peer of peers) {
    if (peer.session_id === sessionId) continue;
    const conns = get(peerConnections);
    const isConnected = conns[peer.session_id] && conns[peer.session_id].status === "connected";
    if (!isConnected) {
      markPeerForPendingRemoval(token, repoFullName, peer.username, peer.session_id, localUsername, get(settingsStore).cleanupMode);
      setTimeout(() => {
        cleanupStalePeerPresence(token, repoFullName, peer.username, peer.session_id, get(settingsStore).cleanupMode);
      }, 6e4);
    }
  }
}
function getCurrentLeader(peers, localSessionId) {
  const ids = peers.map((p) => p.session_id).concat(localSessionId);
  return ids.sort()[0];
}
function isLeader(peers, localSessionId) {
  return getCurrentLeader(peers, localSessionId) === localSessionId;
}
function handleChatMessage(msg, fromUsername) {
  if (!msg || !msg.conversationId || !msg.content) return;
  appendMessage(msg.conversationId, repoFullName, {
    id: msg.id || crypto.randomUUID(),
    sender: fromUsername,
    content: msg.content,
    timestamp: msg.timestamp || Date.now()
  });
  const peersList = get(onlinePeers);
  if (isLeader(peersList, sessionId)) {
    queueConversationForCommit(repoFullName, msg.conversationId);
    peerConnections.update((conns) => {
      Object.values(conns).forEach(({ conn, username }) => {
        if (username !== fromUsername && conn && conn.dataChannel) {
          conn.send({ type: "chat", ...msg });
        }
      });
      return conns;
    });
  }
}
function handlePresenceMessage(msg, fromUsername) {
  if (msg && Array.isArray(msg.onlinePeers)) {
    onlinePeers.set(msg.onlinePeers);
  }
}
function handleSignalMessage(msg, fromUsername) {
  if (!msg || !msg.subtype) return;
  peerConnections.update((conns) => {
    const found = Object.values(conns).find((c) => c.username === fromUsername);
    const peer = found == null ? void 0 : found.conn;
    if (peer && typeof peer.handleSignal === "function") {
      peer.handleSignal(msg);
    }
    return conns;
  });
}
function handleFileReceived(meta, blob, received, total) {
  if (typeof window !== "undefined" && window.skygitFileReceiveProgress) {
    window.skygitFileReceiveProgress(meta, received, total);
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = meta.name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2e3);
}
async function connectToPeer(peer, updated) {
  const conn = new SkyGitWebRTC({
    token,
    repoFullName,
    peerUsername: peer.username,
    isPersistent: true,
    onRemoteStream: () => {
    },
    onSignal: (signal) => {
      postHeartbeat(token, repoFullName, localUsername, sessionId, signal, get(settingsStore).cleanupMode);
    },
    onDataChannelMessage: (msg) => {
      if (!msg || typeof msg !== "object") return;
      switch (msg.type) {
        case "chat":
          handleChatMessage(msg, peer.username);
          break;
        case "presence":
          handlePresenceMessage(msg, peer.username);
          break;
        case "signal":
          handleSignalMessage(msg, peer.username);
          break;
        default:
          console.log("Unknown message type:", msg);
          break;
      }
    },
    onFileReceived: (meta, blob) => {
      handleFileReceived(meta, blob, meta.totalChunks, meta.totalChunks);
    },
    onFileReceiveProgress: (meta, received, total) => {
      if (typeof window !== "undefined" && window.skygitFileReceiveProgress) {
        window.skygitFileReceiveProgress(meta, received, total);
      }
    },
    onFileSendProgress: (meta, sent, total) => {
      if (typeof window !== "undefined" && window.skygitFileSendProgress) {
        window.skygitFileSendProgress(meta, sent, total);
      }
    }
  });
  conn.onFileReceived = (meta, blob) => {
    handleFileReceived(meta, blob, meta.totalChunks, meta.totalChunks);
  };
  conn.onFileReceiveProgress = (meta, received, total) => {
    if (typeof window !== "undefined" && window.skygitFileReceiveProgress) {
      window.skygitFileReceiveProgress(meta, received, total);
    }
  };
  conn.signalingCallback = (signal) => {
    postHeartbeat(
      token,
      repoFullName,
      localUsername,
      sessionId,
      signal,
      get(settingsStore).cleanupMode
    );
  };
  const remoteHasOffer = peer.signaling_info && peer.signaling_info.type === "offer" && peer.signaling_info.sdp;
  const isInitiator = !remoteHasOffer;
  const remoteOffer = remoteHasOffer ? peer.signaling_info : null;
  await conn.start(isInitiator, remoteOffer);
  updated[peer.session_id] = { conn, status: "connected", username: peer.username };
  peerConnections.set(updated);
}
function maybeStartLeaderCommitInterval() {
  const peers = get(onlinePeers);
  const amLeader = isLeader(peers, sessionId);
  if (amLeader) {
    if (!leaderCommitInterval) {
      leaderCommitInterval = setInterval(() => {
        const currentPeers = get(onlinePeers);
        if (isLeader(currentPeers, sessionId)) {
          flushConversationCommitQueue();
        }
      }, 10 * 60 * 1e3);
      window.addEventListener("beforeunload", leaderBeforeUnloadHandler);
    }
  } else if (leaderCommitInterval) {
    clearInterval(leaderCommitInterval);
    leaderCommitInterval = null;
    window.removeEventListener("beforeunload", leaderBeforeUnloadHandler);
  }
}
function leaderBeforeUnloadHandler(e) {
  const peers = get(onlinePeers);
  if (isLeader(peers, sessionId)) {
    flushConversationCommitQueue();
  }
}
let lastLeaderStatus = false;
function maybeMergeQueueOnLeaderChange() {
  const peers = get(onlinePeers);
  const amLeader = isLeader(peers, sessionId);
  if (amLeader && !lastLeaderStatus) {
    flushConversationCommitQueue();
  }
  lastLeaderStatus = amLeader;
}
function sendMessageToPeer(peerSessionId, message) {
  peerConnections.update((conns) => {
    if (conns[peerSessionId] && conns[peerSessionId].conn && conns[peerSessionId].conn.dataChannel) {
      conns[peerSessionId].conn.send(message);
    }
    return conns;
  });
}
function broadcastMessage(message) {
  peerConnections.update((conns) => {
    Object.values(conns).forEach(({ conn }) => {
      if (conn && conn.dataChannel) {
        conn.send(message);
      }
    });
    return conns;
  });
}
var root$1 = /* @__PURE__ */ template(`<div class="flex items-center gap-2"><input type="text" placeholder="Type a message..." class="flex-1 border rounded px-3 py-2 text-sm"> <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">Send</button></div>`);
function MessageInput($$anchor, $$props) {
  push($$props, false);
  let conversation = prop($$props, "conversation", 8);
  let message = /* @__PURE__ */ mutable_source("");
  function send() {
    var _a2;
    if (!get$1(message).trim()) return;
    const auth = get(authStore);
    const username = (_a2 = auth.user) == null ? void 0 : _a2.login;
    const newMessage = {
      id: crypto.randomUUID(),
      // optionally add an ID
      sender: username || "Unknown",
      content: get$1(message).trim(),
      timestamp: Date.now()
    };
    appendMessage(conversation().id, conversation().repo, newMessage);
    const peersList = get(onlinePeers);
    const localSid = getLocalSessionId();
    const leader = getCurrentLeader(peersList, localSid);
    const chatMsg = {
      id: newMessage.id,
      conversationId: conversation().id,
      content: newMessage.content,
      timestamp: newMessage.timestamp
    };
    if (localSid === leader) {
      broadcastMessage({ type: "chat", ...chatMsg });
      queueConversationForCommit(conversation().repo, conversation().id);
    } else {
      sendMessageToPeer(leader, { type: "chat", ...chatMsg });
    }
    set(message, "");
  }
  init();
  var div = root$1();
  var input = child(div);
  var button = sibling(input, 2);
  bind_value(input, () => get$1(message), ($$value) => set(message, $$value));
  event("keydown", input, (e) => e.key === "Enter" && send());
  event("click", button, send);
  append($$anchor, div);
  pop();
}
var root_3$1 = /* @__PURE__ */ template(`<div class="flex flex-col items-center justify-center h-full"><div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 mb-6 rounded shadow max-w-xl w-full flex flex-col items-center"><strong class="mb-2 text-lg">Discussions are disabled for this repository.</strong> <div class="mb-2 text-center">You cannot send or view messages for this conversation until Discussions are re-enabled in your repository's GitHub settings.</div> <a target="_blank" class="underline text-blue-700 font-semibold mb-2">Open GitHub Settings</a> <div class="flex gap-2"><button class="px-3 py-1 bg-yellow-300 hover:bg-yellow-400 rounded font-bold" aria-label="Dismiss notification">Dismiss</button> <button class="px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded font-bold" aria-label="Refresh Discussions status">Refresh</button></div></div></div>`);
var root_7$1 = /* @__PURE__ */ template(`<span class="inline-flex items-center gap-1 text-xs text-gray-500"><span class="w-3 h-3 rounded-full bg-gray-400"></span> You</span>`);
var root_10 = /* @__PURE__ */ template(`<span class="inline-flex items-center gap-1 text-xs text-green-600"><span class="w-3 h-3 rounded-full bg-green-500"></span> </span>`);
var root_11$1 = /* @__PURE__ */ template(`<span class="inline-flex items-center gap-1 text-xs text-blue-600"><span class="w-3 h-3 rounded-full bg-blue-500"></span> </span>`);
var root_13 = /* @__PURE__ */ template(`<span class="inline-flex items-center gap-1 text-xs text-yellow-600"><span class="w-3 h-3 rounded-full bg-yellow-500"></span> </span>`);
var root_14$1 = /* @__PURE__ */ template(`<span class="inline-flex items-center gap-1 text-xs text-gray-400"><span class="w-3 h-3 rounded-full bg-gray-300"></span> </span>`);
var root_15 = /* @__PURE__ */ template(`<button class="bg-red-500 text-white px-3 py-1 rounded text-xs">End Call</button>`);
var root_25 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center items-center py-2"><span class="bg-yellow-300 text-black px-2 py-1 rounded font-bold text-xs">Remote is sharing their screen<!>!</span></div>`);
var root_29 = /* @__PURE__ */ template(`<button class="bg-yellow-100 border px-3 py-1 rounded">🔄 Change Screen Source</button>`);
var root_30 = /* @__PURE__ */ template(`<span>🎤</span>`);
var root_31 = /* @__PURE__ */ template(`<span>🔇</span>`);
var root_32 = /* @__PURE__ */ template(`<span>📷</span>`);
var root_33 = /* @__PURE__ */ template(`<span>🚫📷</span>`);
var root_34 = /* @__PURE__ */ template(`<span>⏹️ Stop Recording</span>`);
var root_35 = /* @__PURE__ */ template(`<span>⏺️ Start Recording</span>`);
var root_36 = /* @__PURE__ */ template(`<div class="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 animate-pulse"><span>⏺️ Recording...</span></div>`);
var root_37 = /* @__PURE__ */ template(`<div class="fixed top-16 right-4 z-50 bg-yellow-400 text-black px-4 py-2 rounded shadow-lg flex items-center gap-2"><span>⚠️ Peer is recording</span></div>`);
var root_16 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center items-center py-4 gap-4"><div><div class="text-xs text-gray-400 mb-1">Local Video</div> <video autoplay playsinline="" width="200" height="150" style="background: #222;"><track kind="captions"></video> <div class="flex flex-row gap-2 justify-center mt-1"><span class="text-xs"><!></span> <span class="text-xs"><!></span></div></div> <div><div class="text-xs text-gray-400 mb-1">Remote Video</div> <video autoplay playsinline="" width="200" height="150" style="background: #222;"><track kind="captions"></video> <div class="flex flex-row gap-2 justify-center mt-1"><span class="text-xs"><!></span> <span class="text-xs"><!></span></div></div></div> <!> <div class="flex flex-row items-center gap-3 justify-center mt-2"><label class="bg-gray-100 border px-3 py-1 rounded cursor-pointer">📎 Share File <input type="file" style="display:none"></label> <button class="bg-blue-100 border px-3 py-1 rounded"><!></button> <!> <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1"><!></button> <button class="bg-gray-200 border px-3 py-1 rounded flex items-center gap-1"><!></button> <button class="bg-red-200 border px-3 py-1 rounded flex items-center gap-1 font-bold"><!></button></div> <!> <!>`, 3);
var root_39 = /* @__PURE__ */ template(`<div class="fixed z-50 flex flex-col items-end cursor-move" tabindex="-1" aria-hidden="true"><div class="bg-white border shadow-lg rounded-lg p-2 flex flex-col items-center relative"><button class="absolute top-1 right-1 text-gray-400 hover:text-black text-lg font-bold px-1" style="z-index:2;" title="Close Preview">×</button> <div class="text-xs text-gray-500 mb-1">Screen Share Preview</div> <video autoplay playsinline="" width="160" height="100" style="border-radius: 0.5rem; background: #222;"><track kind="captions"></video></div></div>`, 2);
var root_40 = /* @__PURE__ */ template(`<button class="fixed bottom-6 right-6 z-50 bg-white border shadow rounded-full px-3 py-2 text-xs font-bold hover:bg-blue-100">Show Screen Preview</button>`);
var root_41 = /* @__PURE__ */ template(`<div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"><div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3"><div class="font-bold mb-2">Select what to share</div> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Entire Screen</button> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Application Window</button> <button class="bg-gray-200 rounded px-3 py-2 hover:bg-blue-100">Browser Tab</button> <button class="mt-2 text-sm text-gray-500 hover:text-black">Cancel</button></div></div>`);
var root_42 = /* @__PURE__ */ template(`<div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"><div class="bg-white rounded-lg shadow-lg p-6 min-w-[260px] flex flex-col gap-3"><div class="font-bold mb-2">Choose upload destination</div> <button class="bg-blue-200 rounded px-3 py-2 hover:bg-blue-300">Google Drive</button> <button class="bg-yellow-200 rounded px-3 py-2 hover:bg-yellow-300">S3</button> <button class="mt-2 text-sm text-gray-500 hover:text-black">Cancel</button></div></div>`);
var root_4$1 = /* @__PURE__ */ template(`<div class="flex flex-col h-full"><div class="flex items-center justify-between px-4 py-2 border-b"><div><h2 class="text-xl font-semibold"> </h2> <button class="ml-4 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200"> </button> <button class="ml-2 text-xs px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200" title="Commit and push messages now">💾 Commit Now</button> <p class="text-sm text-gray-500"> </p></div> <div class="text-sm text-gray-500"> </div> <div class="ml-4 flex flex-wrap gap-3 items-center"><!> <!></div></div> <!> <!> <!> <!> <div class="flex-1 overflow-y-auto"><!></div> <div class="border-t p-4"><!></div></div>`);
var root_43 = /* @__PURE__ */ template(`<p class="text-gray-400 italic text-center mt-20">Select a conversation from the sidebar to view it.</p>`);
function Chats($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $peerConnections = () => store_get(peerConnections, "$peerConnections", $$stores);
  const $onlinePeers = () => store_get(onlinePeers, "$onlinePeers", $$stores);
  const $selectedConversationStore = () => store_get(selectedConversation, "$selectedConversationStore", $$stores);
  let selectedConversation$1 = /* @__PURE__ */ mutable_source(null);
  let callActive = /* @__PURE__ */ mutable_source(false);
  let localStream = /* @__PURE__ */ mutable_source(null);
  let remoteStream = /* @__PURE__ */ mutable_source(null);
  let currentCallPeer = null;
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
    const token2 = localStorage.getItem("skygit_token");
    const auth = get(authStore);
    const username = (_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login;
    if (!token2 || !username) return;
    if (get$1(pollingActive)) {
      setPollingState(repoFullName2, false);
      shutdownPeerManager();
    } else {
      setPollingState(repoFullName2, true);
      initializePeerManager({
        _token: token2,
        _repoFullName: repoFullName2,
        _username: username,
        _sessionId: crypto.randomUUID()
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
  let showDiscussionsDisabledAlert = /* @__PURE__ */ mutable_source(false);
  let repoDiscussionsUrl = /* @__PURE__ */ mutable_source("");
  async function refreshDiscussionsStatus(repoFullName2) {
    const token2 = localStorage.getItem("skygit_token");
    if (!token2 || !repoFullName2) return null;
    try {
      const res = await fetch(`https://api.github.com/repos/${repoFullName2}`, { headers: { Authorization: `token ${token2}` } });
      if (res.ok) {
        const data = await res.json();
        repoList.update((list) => {
          return list.map((r2) => r2.full_name === repoFullName2 ? { ...r2, has_discussions: data.has_discussions } : r2);
        });
        return data.has_discussions;
      }
    } catch (e) {
      console.warn("Failed to refresh Discussions status", e);
    }
    return null;
  }
  currentContent.subscribe((value) => {
    var _a2;
    console.log("[SkyGit][Presence] currentContent changed:", value);
    set(selectedConversation$1, value);
    selectedConversation.set(value);
    set(showDiscussionsDisabledAlert, false);
    set(repoDiscussionsUrl, "");
    const token2 = localStorage.getItem("skygit_token");
    const auth = get(authStore);
    const username = ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.login) || null;
    const repo = get$1(selectedConversation$1) ? get$1(selectedConversation$1).repo : null;
    console.log("[SkyGit][Presence] authStore value:", auth);
    console.log("[SkyGit][Presence] onConversationSelect: token", token2, "username", username, "repo", repo, "selectedConversation", get$1(selectedConversation$1));
    (async () => {
      if (token2 && get$1(selectedConversation$1) && (!get$1(selectedConversation$1).messages || !get$1(selectedConversation$1).messages.length)) {
        try {
          const headers2 = {
            Authorization: `token ${token2}`,
            Accept: "application/vnd.github+json"
          };
          let convoPath = get$1(selectedConversation$1).path || `.messages/conversation-${get$1(selectedConversation$1).id}.json`;
          let url = `https://api.github.com/repos/${get$1(selectedConversation$1).repo}/contents/${convoPath}`;
          let res = await fetch(url, { headers: headers2 });
          if (!res.ok && get$1(selectedConversation$1).path) {
            convoPath = `.messages/conversation-${get$1(selectedConversation$1).id}.json`;
            url = `https://api.github.com/repos/${get$1(selectedConversation$1).repo}/contents/${convoPath}`;
            res = await fetch(url, { headers: headers2 });
          }
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
          }
        } catch (err) {
          console.warn("[SkyGit] Failed to fetch conversation contents", err);
        }
      }
    })();
    if (token2 && username && repo) {
      const map = get(presencePolling);
      set(pollingActive, map[repo] !== false);
      if (get$1(pollingActive)) {
        initializePeerManager({
          _token: token2,
          _repoFullName: repo,
          _username: username,
          _sessionId: crypto.randomUUID()
        });
      } else {
        shutdownPeerManager();
      }
    }
    if (get$1(selectedConversation$1) && get$1(selectedConversation$1).repo) {
      const repo2 = getRepoByFullName(get$1(selectedConversation$1).repo);
      console.log("[SkyGit][DEBUG] Lookup repo:", get$1(selectedConversation$1).repo, "Result:", repo2, "has_discussions:", repo2 == null ? void 0 : repo2.has_discussions);
      if (repo2 && repo2.has_discussions === false) {
        refreshDiscussionsStatus(get$1(selectedConversation$1).repo).then((isEnabled) => {
          if (isEnabled) {
            set(showDiscussionsDisabledAlert, false);
          } else {
            set(showDiscussionsDisabledAlert, true);
          }
        });
      }
    }
  });
  function endCall() {
    set(callActive, false);
    currentCallPeer = null;
    if (get$1(localStream)) {
      get$1(localStream).getTracks().forEach((t) => t.stop());
      set(localStream, null);
    }
    set(remoteStream, null);
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
      set(localStream, get$1(screenShareStream));
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
    set(localStream, localCameraStream);
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
      set(localStream, newStream);
      newStream.getVideoTracks()[0].onended = stopScreenShare;
    } catch (err) {
      console.error("Change screen source error:", err);
    }
  }
  function toggleMic() {
    set(micOn, !get$1(micOn));
    if (get$1(localStream)) {
      get$1(localStream).getAudioTracks().forEach((track) => track.enabled = get$1(micOn));
    }
    sendMediaStatus();
  }
  function toggleCamera() {
    set(cameraOn, !get$1(cameraOn));
    if (get$1(localStream)) {
      get$1(localStream).getVideoTracks().forEach((track) => track.enabled = get$1(cameraOn));
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
    if (!get$1(localStream)) return;
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(get$1(localStream), { mimeType: "video/webm; codecs=vp9" });
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
  async function uploadToS3(blob, cred) {
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
      link2 = await uploadToS3(blob, cred);
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
    params.append("client_id", cred.client_id);
    params.append("client_secret", cred.client_secret);
    params.append("refresh_token", cred.refresh_token);
    params.append("grant_type", "refresh_token");
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });
    if (!res.ok) throw new Error("Failed to get Google access token");
    const data = await res.json();
    return data.access_token;
  }
  function cleanupPresence() {
    const token2 = localStorage.getItem("skygit_token");
    const repo = get$1(selectedConversation$1) ? get$1(selectedConversation$1).repo : null;
    if (token2 && repo) {
      deleteOwnPresenceComment(token2, repo);
    }
  }
  window.addEventListener("beforeunload", cleanupPresence);
  legacy_pre_effect(
    () => (get$1(localVideoEl), get$1(localStream)),
    () => {
      if (get$1(localVideoEl) && get$1(localStream)) {
        mutate(localVideoEl, get$1(localVideoEl).srcObject = get$1(localStream));
      }
    }
  );
  legacy_pre_effect(
    () => (get$1(remoteVideoEl), get$1(remoteStream)),
    () => {
      if (get$1(remoteVideoEl) && get$1(remoteStream)) {
        mutate(remoteVideoEl, get$1(remoteVideoEl).srcObject = get$1(remoteStream));
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
  legacy_pre_effect_reset();
  init();
  Layout($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      {
        var consequent_25 = ($$anchor3) => {
          var fragment_2 = comment();
          var node_1 = first_child(fragment_2);
          {
            var consequent = ($$anchor4) => {
              var div = root_3$1();
              var div_1 = child(div);
              var a = sibling(child(div_1), 4);
              var div_2 = sibling(a, 2);
              var button = child(div_2);
              var button_1 = sibling(button, 2);
              template_effect(() => set_attribute(a, "href", get$1(repoDiscussionsUrl)));
              event("click", button, () => set(showDiscussionsDisabledAlert, false));
              event("click", button_1, async () => {
                await refreshDiscussionsStatus(get$1(selectedConversation$1).repo);
              });
              append($$anchor4, div);
            };
            var alternate = ($$anchor4) => {
              var div_3 = root_4$1();
              var div_4 = child(div_3);
              var div_5 = child(div_4);
              var h2 = child(div_5);
              var text$1 = child(h2);
              var button_2 = sibling(h2, 2);
              var text_1 = child(button_2);
              var button_3 = sibling(button_2, 2);
              var p_1 = sibling(button_3, 2);
              var text_2 = child(p_1);
              var div_6 = sibling(div_5, 2);
              var text_3 = child(div_6);
              var div_7 = sibling(div_6, 2);
              var node_2 = child(div_7);
              {
                var consequent_5 = ($$anchor5) => {
                  var fragment_3 = comment();
                  var node_3 = first_child(fragment_3);
                  each(node_3, 1, () => get$1(selectedConversation$1).participants, (uname) => uname, ($$anchor6, uname) => {
                    var fragment_4 = comment();
                    var node_4 = first_child(fragment_4);
                    {
                      var consequent_1 = ($$anchor7) => {
                        var span = root_7$1();
                        append($$anchor7, span);
                      };
                      var alternate_1 = ($$anchor7) => {
                        var fragment_5 = comment();
                        var node_5 = first_child(fragment_5);
                        {
                          var consequent_3 = ($$anchor8) => {
                            var fragment_6 = comment();
                            var node_6 = first_child(fragment_6);
                            {
                              var consequent_2 = ($$anchor9) => {
                                var span_1 = root_10();
                                var text_4 = sibling(child(span_1));
                                template_effect(() => set_text(text_4, ` ${get$1(uname) ?? ""}`));
                                append($$anchor9, span_1);
                              };
                              var alternate_2 = ($$anchor9) => {
                                var span_2 = root_11$1();
                                var text_5 = sibling(child(span_2));
                                template_effect(() => set_text(text_5, ` ${get$1(uname) ?? ""}`));
                                append($$anchor9, span_2);
                              };
                              if_block(node_6, ($$render) => {
                                if ($peerConnections()[get$1(uname)].status === "connected") $$render(consequent_2);
                                else $$render(alternate_2, false);
                              });
                            }
                            append($$anchor8, fragment_6);
                          };
                          var alternate_3 = ($$anchor8, $$elseif) => {
                            {
                              var consequent_4 = ($$anchor9) => {
                                var span_3 = root_13();
                                var text_6 = sibling(child(span_3));
                                template_effect(() => set_text(text_6, ` ${get$1(uname) ?? ""}`));
                                append($$anchor9, span_3);
                              };
                              var alternate_4 = ($$anchor9) => {
                                var span_4 = root_14$1();
                                var text_7 = sibling(child(span_4));
                                template_effect(() => set_text(text_7, ` ${get$1(uname) ?? ""}`));
                                append($$anchor9, span_4);
                              };
                              if_block(
                                $$anchor8,
                                ($$render) => {
                                  if ($onlinePeers().find((p) => p.username === get$1(uname))) $$render(consequent_4);
                                  else $$render(alternate_4, false);
                                },
                                $$elseif
                              );
                            }
                          };
                          if_block(node_5, ($$render) => {
                            if ($peerConnections()[get$1(uname)]) $$render(consequent_3);
                            else $$render(alternate_3, false);
                          });
                        }
                        append($$anchor7, fragment_5);
                      };
                      if_block(node_4, ($$render) => {
                        if (get$1(uname) === get(authStore).user.login) $$render(consequent_1);
                        else $$render(alternate_1, false);
                      });
                    }
                    append($$anchor6, fragment_4);
                  });
                  append($$anchor5, fragment_3);
                };
                if_block(node_2, ($$render) => {
                  if (get$1(selectedConversation$1).participants) $$render(consequent_5);
                });
              }
              var node_7 = sibling(node_2, 2);
              {
                var consequent_6 = ($$anchor5) => {
                  var button_4 = root_15();
                  event("click", button_4, endCall);
                  append($$anchor5, button_4);
                };
                if_block(node_7, ($$render) => {
                  if (get$1(callActive)) $$render(consequent_6);
                });
              }
              var node_8 = sibling(div_4, 2);
              {
                var consequent_20 = ($$anchor5) => {
                  var fragment_7 = root_16();
                  var div_8 = first_child(fragment_7);
                  var div_9 = child(div_8);
                  var video = sibling(child(div_9), 2);
                  video.muted = true;
                  bind_this(video, ($$value) => set(localVideoEl, $$value), () => get$1(localVideoEl));
                  var div_10 = sibling(video, 2);
                  var span_5 = child(div_10);
                  var node_9 = child(span_5);
                  {
                    var consequent_7 = ($$anchor6) => {
                      var text_8 = text("🎤 Mic On");
                      append($$anchor6, text_8);
                    };
                    var alternate_5 = ($$anchor6) => {
                      var text_9 = text("🔇 Mic Off");
                      append($$anchor6, text_9);
                    };
                    if_block(node_9, ($$render) => {
                      if (get$1(micOn)) $$render(consequent_7);
                      else $$render(alternate_5, false);
                    });
                  }
                  var span_6 = sibling(span_5, 2);
                  var node_10 = child(span_6);
                  {
                    var consequent_8 = ($$anchor6) => {
                      var text_10 = text("📷 Cam On");
                      append($$anchor6, text_10);
                    };
                    var alternate_6 = ($$anchor6) => {
                      var text_11 = text("🚫📷 Cam Off");
                      append($$anchor6, text_11);
                    };
                    if_block(node_10, ($$render) => {
                      if (get$1(cameraOn)) $$render(consequent_8);
                      else $$render(alternate_6, false);
                    });
                  }
                  var div_11 = sibling(div_9, 2);
                  var video_1 = sibling(child(div_11), 2);
                  bind_this(video_1, ($$value) => set(remoteVideoEl, $$value), () => get$1(remoteVideoEl));
                  var div_12 = sibling(video_1, 2);
                  var span_7 = child(div_12);
                  var node_11 = child(span_7);
                  {
                    var consequent_9 = ($$anchor6) => {
                      var text_12 = text("🎤 Mic On");
                      append($$anchor6, text_12);
                    };
                    var alternate_7 = ($$anchor6) => {
                      var text_13 = text("🔇 Mic Off");
                      append($$anchor6, text_13);
                    };
                    if_block(node_11, ($$render) => {
                      if (get$1(remoteMicOn)) $$render(consequent_9);
                      else $$render(alternate_7, false);
                    });
                  }
                  var span_8 = sibling(span_7, 2);
                  var node_12 = child(span_8);
                  {
                    var consequent_10 = ($$anchor6) => {
                      var text_14 = text("📷 Cam On");
                      append($$anchor6, text_14);
                    };
                    var alternate_8 = ($$anchor6) => {
                      var text_15 = text("🚫📷 Cam Off");
                      append($$anchor6, text_15);
                    };
                    if_block(node_12, ($$render) => {
                      if (get$1(remoteCameraOn)) $$render(consequent_10);
                      else $$render(alternate_8, false);
                    });
                  }
                  var node_13 = sibling(div_8, 2);
                  {
                    var consequent_12 = ($$anchor6) => {
                      var div_13 = root_25();
                      var span_9 = child(div_13);
                      var node_14 = sibling(child(span_9));
                      {
                        var consequent_11 = ($$anchor7) => {
                          var text_16 = text("(with audio)");
                          append($$anchor7, text_16);
                        };
                        if_block(node_14, ($$render) => {
                          var _a2;
                          if ((_a2 = get$1(remoteScreenShareMeta)) == null ? void 0 : _a2.audio) $$render(consequent_11);
                        });
                      }
                      append($$anchor6, div_13);
                    };
                    if_block(node_13, ($$render) => {
                      if (get$1(remoteScreenSharing)) $$render(consequent_12);
                    });
                  }
                  var div_14 = sibling(node_13, 2);
                  var label = child(div_14);
                  var input = sibling(child(label));
                  var button_5 = sibling(label, 2);
                  var node_15 = child(button_5);
                  {
                    var consequent_13 = ($$anchor6) => {
                      var text_17 = text("🛑 Stop Sharing");
                      append($$anchor6, text_17);
                    };
                    var alternate_9 = ($$anchor6) => {
                      var text_18 = text("🖥️ Share Screen");
                      append($$anchor6, text_18);
                    };
                    if_block(node_15, ($$render) => {
                      if (get$1(screenSharing)) $$render(consequent_13);
                      else $$render(alternate_9, false);
                    });
                  }
                  var node_16 = sibling(button_5, 2);
                  {
                    var consequent_14 = ($$anchor6) => {
                      var button_6 = root_29();
                      event("click", button_6, changeScreenSource);
                      append($$anchor6, button_6);
                    };
                    if_block(node_16, ($$render) => {
                      if (get$1(screenSharing)) $$render(consequent_14);
                    });
                  }
                  var button_7 = sibling(node_16, 2);
                  var node_17 = child(button_7);
                  {
                    var consequent_15 = ($$anchor6) => {
                      var span_10 = root_30();
                      append($$anchor6, span_10);
                    };
                    var alternate_10 = ($$anchor6) => {
                      var span_11 = root_31();
                      append($$anchor6, span_11);
                    };
                    if_block(node_17, ($$render) => {
                      if (get$1(micOn)) $$render(consequent_15);
                      else $$render(alternate_10, false);
                    });
                  }
                  var button_8 = sibling(button_7, 2);
                  var node_18 = child(button_8);
                  {
                    var consequent_16 = ($$anchor6) => {
                      var span_12 = root_32();
                      append($$anchor6, span_12);
                    };
                    var alternate_11 = ($$anchor6) => {
                      var span_13 = root_33();
                      append($$anchor6, span_13);
                    };
                    if_block(node_18, ($$render) => {
                      if (get$1(cameraOn)) $$render(consequent_16);
                      else $$render(alternate_11, false);
                    });
                  }
                  var button_9 = sibling(button_8, 2);
                  var node_19 = child(button_9);
                  {
                    var consequent_17 = ($$anchor6) => {
                      var span_14 = root_34();
                      append($$anchor6, span_14);
                    };
                    var alternate_12 = ($$anchor6) => {
                      var span_15 = root_35();
                      append($$anchor6, span_15);
                    };
                    if_block(node_19, ($$render) => {
                      if (get$1(recording)) $$render(consequent_17);
                      else $$render(alternate_12, false);
                    });
                  }
                  var node_20 = sibling(div_14, 2);
                  {
                    var consequent_18 = ($$anchor6) => {
                      var div_15 = root_36();
                      append($$anchor6, div_15);
                    };
                    if_block(node_20, ($$render) => {
                      if (get$1(recording)) $$render(consequent_18);
                    });
                  }
                  var node_21 = sibling(node_20, 2);
                  {
                    var consequent_19 = ($$anchor6) => {
                      var div_16 = root_37();
                      append($$anchor6, div_16);
                    };
                    if_block(node_21, ($$render) => {
                      if (get$1(remoteRecording)) $$render(consequent_19);
                    });
                  }
                  template_effect(() => {
                    set_attribute(button_7, "title", get$1(micOn) ? "Mute Mic" : "Unmute Mic");
                    set_attribute(button_8, "title", get$1(cameraOn) ? "Turn Off Camera" : "Turn On Camera");
                    set_attribute(button_9, "title", get$1(recording) ? "Stop Recording" : "Start Recording");
                  });
                  event("change", input, handleFileInput);
                  event("click", button_5, function(...$$args) {
                    var _a2;
                    (_a2 = get$1(screenSharing) ? stopScreenShare : openShareTypeModal) == null ? void 0 : _a2.apply(this, $$args);
                  });
                  event("click", button_7, toggleMic);
                  event("click", button_8, toggleCamera);
                  event("click", button_9, function(...$$args) {
                    var _a2;
                    (_a2 = get$1(recording) ? stopRecording : startRecording) == null ? void 0 : _a2.apply(this, $$args);
                  });
                  append($$anchor5, fragment_7);
                };
                if_block(node_8, ($$render) => {
                  if (get$1(callActive)) $$render(consequent_20);
                });
              }
              var node_22 = sibling(node_8, 2);
              {
                var consequent_22 = ($$anchor5) => {
                  var fragment_8 = comment();
                  var node_23 = first_child(fragment_8);
                  {
                    var consequent_21 = ($$anchor6) => {
                      var div_17 = root_39();
                      var div_18 = child(div_17);
                      var button_10 = child(div_18);
                      var video_2 = sibling(button_10, 4);
                      video_2.muted = true;
                      bind_this(video_2, ($$value) => set(screenSharePreviewEl, $$value), () => get$1(screenSharePreviewEl));
                      bind_this(div_17, ($$value) => set(previewRef, $$value), () => get$1(previewRef));
                      template_effect(() => set_style(div_17, `left: ${get$1(previewPos).x ?? ""}px; top: ${get$1(previewPos).y ?? ""}px; min-width: 180px; min-height: 120px; user-select: none;`));
                      event("click", button_10, stopPropagation(closePreview));
                      event("mousedown", div_17, onPreviewMouseDown);
                      append($$anchor6, div_17);
                    };
                    var alternate_13 = ($$anchor6) => {
                      var button_11 = root_40();
                      event("click", button_11, reopenPreview);
                      append($$anchor6, button_11);
                    };
                    if_block(node_23, ($$render) => {
                      if (get$1(previewVisible)) $$render(consequent_21);
                      else $$render(alternate_13, false);
                    });
                  }
                  append($$anchor5, fragment_8);
                };
                if_block(node_22, ($$render) => {
                  if (get$1(screenSharing) && get$1(screenShareStream)) $$render(consequent_22);
                });
              }
              var node_24 = sibling(node_22, 2);
              {
                var consequent_23 = ($$anchor5) => {
                  var div_19 = root_41();
                  var div_20 = child(div_19);
                  var button_12 = sibling(child(div_20), 2);
                  var button_13 = sibling(button_12, 2);
                  var button_14 = sibling(button_13, 2);
                  var button_15 = sibling(button_14, 2);
                  event("click", button_12, () => selectShareType("screen"));
                  event("click", button_13, () => selectShareType("window"));
                  event("click", button_14, () => selectShareType("tab"));
                  event("click", button_15, closeShareTypeModal);
                  append($$anchor5, div_19);
                };
                if_block(node_24, ($$render) => {
                  if (get$1(showShareTypeModal)) $$render(consequent_23);
                });
              }
              var node_25 = sibling(node_24, 2);
              {
                var consequent_24 = ($$anchor5) => {
                  var div_21 = root_42();
                  var div_22 = child(div_21);
                  var button_16 = sibling(child(div_22), 2);
                  var button_17 = sibling(button_16, 2);
                  var button_18 = sibling(button_17, 2);
                  event("click", button_16, () => {
                    set(uploadDestination, "google_drive");
                  });
                  event("click", button_17, () => {
                    set(uploadDestination, "s3");
                  });
                  event("click", button_18, resetUploadDestination);
                  append($$anchor5, div_21);
                };
                if_block(node_25, ($$render) => {
                  if (get$1(showUploadDestinationModal)) $$render(consequent_24);
                });
              }
              var div_23 = sibling(node_25, 2);
              var node_26 = child(div_23);
              const expression = /* @__PURE__ */ derived_safe_equal(() => $selectedConversationStore() || get$1(selectedConversation$1));
              MessageList(node_26, {
                get conversation() {
                  return get$1(expression);
                }
              });
              var div_24 = sibling(div_23, 2);
              var node_27 = child(div_24);
              const expression_1 = /* @__PURE__ */ derived_safe_equal(() => $selectedConversationStore() || get$1(selectedConversation$1));
              MessageInput(node_27, {
                get conversation() {
                  return get$1(expression_1);
                }
              });
              template_effect(() => {
                var _a2;
                set_text(text$1, get$1(selectedConversation$1).title);
                set_attribute(button_2, "title", get$1(pollingActive) ? "Pause presence polling" : "Start presence polling");
                set_text(text_1, get$1(pollingActive) ? "⏸ Pause Presence" : "▶ Start Presence");
                set_text(text_2, get$1(selectedConversation$1).repo);
                set_text(text_3, `${((_a2 = get$1(selectedConversation$1).participants) == null ? void 0 : _a2.length) ?? 0} participants`);
              });
              event("click", button_2, togglePresence);
              event("click", button_3, forceCommitConversation);
              append($$anchor4, div_3);
            };
            if_block(node_1, ($$render) => {
              if (get$1(showDiscussionsDisabledAlert)) $$render(consequent);
              else $$render(alternate, false);
            });
          }
          append($$anchor3, fragment_2);
        };
        var alternate_14 = ($$anchor3) => {
          var p_2 = root_43();
          append($$anchor3, p_2);
        };
        if_block(node, ($$render) => {
          if (get$1(selectedConversation$1)) $$render(consequent_25);
          else $$render(alternate_14, false);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  pop();
  $$cleanup();
}
var root = /* @__PURE__ */ template(`<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"><div class="bg-white p-4 rounded shadow-md w-96"><h2 class="text-lg font-semibold mb-2">New Conversation</h2> <input placeholder="Conversation title" class="w-full border px-3 py-2 rounded mb-4"> <div class="flex justify-end gap-2"><button class="bg-gray-200 px-3 py-1 rounded">Cancel</button> <button class="bg-blue-600 text-white px-3 py-1 rounded">Create</button></div></div></div>`);
function NewConversationModal($$anchor, $$props) {
  push($$props, false);
  const dispatch = createEventDispatcher();
  let title = /* @__PURE__ */ mutable_source("");
  function submit() {
    if (!get$1(title).trim()) {
      alert("Title is required.");
      return;
    }
    dispatch("create", { title: get$1(title).trim() });
    set(title, "");
  }
  function cancel() {
    dispatch("cancel");
  }
  init();
  var div = root();
  var div_1 = child(div);
  var input = sibling(child(div_1), 2);
  var div_2 = sibling(input, 2);
  var button = child(div_2);
  var button_1 = sibling(button, 2);
  bind_value(input, () => get$1(title), ($$value) => set(title, $$value));
  event("click", button, cancel);
  event("click", button_1, submit);
  append($$anchor, div);
  pop();
}
var root_3 = /* @__PURE__ */ template(`<span class="text-green-700 font-semibold">✅ Enabled</span>`);
var root_5 = /* @__PURE__ */ template(`<span> </span>`);
var root_4 = /* @__PURE__ */ template(`<span class="text-red-600 font-semibold">Disabled</span> <button class="ml-2 text-xs text-blue-600 underline">Enable Discussions</button> <button class="ml-2 text-xs text-gray-500 underline">Refresh</button> <!> <div class="text-xs text-gray-500 mt-2">To enable messaging, activate Discussions in your GitHub repo settings. After enabling, click Refresh.</div>`, 1);
var root_7 = /* @__PURE__ */ ns_template(`<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Activating...`, 1);
var root_6 = /* @__PURE__ */ template(`<button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded flex items-center gap-2"><!></button>`);
var root_9 = /* @__PURE__ */ template(`<div class="mt-6 text-center"><button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm opacity-50 cursor-not-allowed" disabled>💬 New Conversation (Enable Discussions first)</button></div>`);
var root_12 = /* @__PURE__ */ template(`<option> </option>`);
var root_11 = /* @__PURE__ */ template(`<div class="mt-6 border-t pt-4 space-y-3"><h3 class="text-lg font-semibold text-gray-800">🛠️ Messaging Config</h3> <div class="grid gap-2 text-sm text-gray-700"><label>Commit frequency (min): <input type="number" class="w-full border px-2 py-1 rounded"></label> <label>Binary storage type: <select class="w-full border px-2 py-1 rounded"><option>gitfs</option><option>s3</option><option>google_drive</option></select></label> <label>Storage URL: <select class="w-full border px-2 py-1 rounded"><option disabled>— Select a credential —</option><!></select></label></div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">💾 Save Configuration</button></div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">💬 New Conversation</button> <!>`, 1);
var root_2 = /* @__PURE__ */ template(`<div class="p-6 space-y-4 bg-white shadow rounded max-w-3xl mx-auto mt-6"><h2 class="text-2xl font-semibold text-blue-700"> </h2> <div class="text-sm text-gray-700 space-y-1"><div><strong>Name:</strong> </div> <div><strong>Owner:</strong> </div> <div><strong>GitHub:</strong> <a target="_blank" class="text-blue-600 underline hover:text-blue-800"> </a></div> <div><strong>Visibility:</strong> </div> <div><strong>Messaging:</strong> </div> <div><strong>Discussions:</strong> <!></div></div> <!> <!></div>`);
var root_14 = /* @__PURE__ */ template(`<p class="text-gray-400 italic text-center mt-20">Select a repository from the sidebar to view its details.</p>`);
function Repos($$anchor, $$props) {
  push($$props, false);
  let credentials = /* @__PURE__ */ mutable_source([]);
  let repo = /* @__PURE__ */ mutable_source();
  let activating = /* @__PURE__ */ mutable_source(false);
  let showModal = /* @__PURE__ */ mutable_source(false);
  let refreshMsg = /* @__PURE__ */ mutable_source("");
  let refreshMsgTimeout;
  selectedRepo.subscribe((r2) => set(repo, r2));
  onMount(async () => {
    const token2 = localStorage.getItem("skygit_token");
    if (!token2) return;
    try {
      const { secrets } = await getSecretsMap(token2);
      const urls = Object.keys(secrets);
      const list = [];
      for (const url of urls) {
        try {
          const decrypted = await decryptJSON(token2, secrets[url]);
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
    const token2 = localStorage.getItem("skygit_token");
    if (!get$1(repo) || !token2) return;
    set(activating, true);
    try {
      await activateMessagingForRepo(token2, get$1(repo));
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
    const token2 = localStorage.getItem("skygit_token");
    if (!token2 || !get$1(repo)) return;
    try {
      await updateRepoMessagingConfig(token2, get$1(repo));
      alert("✅ Messaging config updated.");
      try {
        await storeEncryptedCredentials(token2, get$1(repo));
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
    const token2 = localStorage.getItem("skygit_token");
    console.log("[SkyGit] 🧪 handleCreate() called with title:", title);
    await createConversation(token2, get$1(repo), title);
    set(showModal, false);
  }
  function handleCancel() {
    set(showModal, false);
  }
  function openDiscussionsSettings() {
    if (!get$1(repo)) return;
    const url = `https://github.com/${get$1(repo).full_name}/settings/discussions`;
    window.open(url, "_blank");
  }
  async function refreshRepo() {
    const token2 = localStorage.getItem("skygit_token");
    if (!token2 || !get$1(repo)) return;
    const res = await fetch(`https://api.github.com/repos/${get$1(repo).full_name}`, { headers: { Authorization: `token ${token2}` } });
    if (res.ok) {
      const data = await res.json();
      const wasDisabled = !get$1(repo).has_discussions;
      mutate(repo, get$1(repo).has_discussions = data.has_discussions);
      selectedRepo.set({ ...get$1(repo) });
      repoList.update((list) => list.map((r2) => r2.full_name === get$1(repo).full_name ? { ...get$1(repo) } : r2));
      await tick();
      if (wasDisabled && get$1(repo).has_discussions) {
        set(refreshMsg, "✅ Discussions enabled! You can now use messaging.");
      } else if (!get$1(repo).has_discussions) {
        set(refreshMsg, "❌ Discussions are still disabled.");
      } else {
        set(refreshMsg, "");
      }
      clearTimeout(refreshMsgTimeout);
      refreshMsgTimeout = setTimeout(
        () => {
          set(refreshMsg, "");
        },
        4e3
      );
    }
  }
  init();
  Layout($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = comment();
      var node = first_child(fragment_1);
      {
        var consequent_7 = ($$anchor3) => {
          var div = root_2();
          var h2 = child(div);
          var text$1 = child(h2);
          var div_1 = sibling(h2, 2);
          var div_2 = child(div_1);
          var text_1 = sibling(child(div_2));
          var div_3 = sibling(div_2, 2);
          var text_2 = sibling(child(div_3));
          var div_4 = sibling(div_3, 2);
          var a = sibling(child(div_4), 2);
          var text_3 = child(a);
          var div_5 = sibling(div_4, 2);
          var text_4 = sibling(child(div_5));
          var div_6 = sibling(div_5, 2);
          var text_5 = sibling(child(div_6));
          var div_7 = sibling(div_6, 2);
          var node_1 = sibling(child(div_7), 2);
          {
            var consequent = ($$anchor4) => {
              var span = root_3();
              append($$anchor4, span);
            };
            var alternate = ($$anchor4) => {
              var fragment_2 = root_4();
              var button = sibling(first_child(fragment_2), 2);
              var button_1 = sibling(button, 2);
              var node_2 = sibling(button_1, 2);
              {
                var consequent_1 = ($$anchor5) => {
                  var span_1 = root_5();
                  let classes;
                  var text_6 = child(span_1);
                  template_effect(
                    ($0) => {
                      classes = set_class(span_1, 1, "ml-2 text-xs font-semibold", null, classes, $0);
                      set_text(text_6, get$1(refreshMsg));
                    },
                    [
                      () => ({
                        "text-green-700": get$1(refreshMsg).startsWith("✅"),
                        "text-red-600": get$1(refreshMsg).startsWith("❌")
                      })
                    ],
                    derived_safe_equal
                  );
                  append($$anchor5, span_1);
                };
                if_block(node_2, ($$render) => {
                  if (get$1(refreshMsg)) $$render(consequent_1);
                });
              }
              event("click", button, openDiscussionsSettings);
              event("click", button_1, refreshRepo);
              append($$anchor4, fragment_2);
            };
            if_block(node_1, ($$render) => {
              if (get$1(repo).has_discussions) $$render(consequent);
              else $$render(alternate, false);
            });
          }
          var node_3 = sibling(div_1, 2);
          {
            var consequent_3 = ($$anchor4) => {
              var button_2 = root_6();
              var node_4 = child(button_2);
              {
                var consequent_2 = ($$anchor5) => {
                  var fragment_3 = root_7();
                  append($$anchor5, fragment_3);
                };
                var alternate_1 = ($$anchor5) => {
                  var text_7 = text("💬 Activate Messaging");
                  append($$anchor5, text_7);
                };
                if_block(node_4, ($$render) => {
                  if (get$1(activating)) $$render(consequent_2);
                  else $$render(alternate_1, false);
                });
              }
              template_effect(() => button_2.disabled = get$1(activating));
              event("click", button_2, activateMessaging);
              append($$anchor4, button_2);
            };
            if_block(node_3, ($$render) => {
              if (!get$1(repo).has_messages) $$render(consequent_3);
            });
          }
          var node_5 = sibling(node_3, 2);
          {
            var consequent_4 = ($$anchor4) => {
              var div_8 = root_9();
              append($$anchor4, div_8);
            };
            var alternate_2 = ($$anchor4, $$elseif) => {
              {
                var consequent_6 = ($$anchor5) => {
                  var fragment_4 = root_11();
                  var div_9 = first_child(fragment_4);
                  var div_10 = sibling(child(div_9), 2);
                  var label = child(div_10);
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
                  var node_6 = sibling(option_3);
                  each(node_6, 1, () => get$1(credentials).filter((c) => c.type === get$1(repo).config.binary_storage_type), index, ($$anchor6, cred) => {
                    var option_4 = root_12();
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
                  var button_3 = sibling(div_10, 2);
                  var button_4 = sibling(div_9, 2);
                  var node_7 = sibling(button_4, 2);
                  {
                    var consequent_5 = ($$anchor6) => {
                      NewConversationModal($$anchor6, {
                        $$events: { create: handleCreate, cancel: handleCancel }
                      });
                    };
                    if_block(node_7, ($$render) => {
                      if (get$1(showModal)) $$render(consequent_5);
                    });
                  }
                  bind_value(input, () => get$1(repo).config.commit_frequency_min, ($$value) => mutate(repo, get$1(repo).config.commit_frequency_min = $$value));
                  bind_select_value(select, () => get$1(repo).config.binary_storage_type, ($$value) => mutate(repo, get$1(repo).config.binary_storage_type = $$value));
                  bind_select_value(select_1, () => get$1(repo).config.storage_info.url, ($$value) => mutate(repo, get$1(repo).config.storage_info.url = $$value));
                  event("click", button_3, saveConfig);
                  event("click", button_4, () => set(showModal, true));
                  append($$anchor5, fragment_4);
                };
                if_block(
                  $$anchor4,
                  ($$render) => {
                    if (get$1(repo).has_messages && get$1(repo).config) $$render(consequent_6);
                  },
                  $$elseif
                );
              }
            };
            if_block(node_5, ($$render) => {
              if (!get$1(repo).has_discussions) $$render(consequent_4);
              else $$render(alternate_2, false);
            });
          }
          template_effect(() => {
            set_text(text$1, get$1(repo).full_name);
            set_text(text_1, ` ${get$1(repo).name ?? ""}`);
            set_text(text_2, ` ${get$1(repo).owner ?? ""}`);
            set_attribute(a, "href", get$1(repo).url);
            set_text(text_3, get$1(repo).url);
            set_text(text_4, ` ${(get$1(repo).private ? "🔒 Private" : "🌐 Public") ?? ""}`);
            set_text(text_5, ` ${(get$1(repo).has_messages ? "💬 Available" : "🚫 Not enabled") ?? ""}`);
          });
          append($$anchor3, div);
        };
        var alternate_3 = ($$anchor3) => {
          var p = root_14();
          append($$anchor3, p);
        };
        if_block(node, ($$render) => {
          if (get$1(repo)) $$render(consequent_7);
          else $$render(alternate_3, false);
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  pop();
}
var root_1 = /* @__PURE__ */ template(`<p class="text-center mt-20">Loading...</p>`);
function App($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $currentRoute = () => store_get(currentRoute, "$currentRoute", $$stores);
  const $syncState = () => store_get(syncState, "$syncState", $$stores);
  let token2 = /* @__PURE__ */ mutable_source(null);
  let user = null;
  let loginError = /* @__PURE__ */ mutable_source("");
  authStore.subscribe((auth) => {
    if (!auth.isLoggedIn) {
      currentRoute.set("login");
      set(token2, null);
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
    set(token2, t);
    user = validatedUser;
    saveToken(t);
    authStore.set({
      isLoggedIn: true,
      token: get$1(token2),
      user
    });
    const hasRepo = await checkSkyGitRepoExists(get$1(token2), user.login);
    if (hasRepo) {
      currentRoute.set("home");
      await initializeRepoState();
    } else {
      currentRoute.set("consent");
    }
  }
  async function approveRepo() {
    await createSkyGitRepo(get$1(token2));
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
      await initializeStartupState(get$1(token2));
    } catch (e) {
      console.warn("[SkyGit] Failed to initialize startup state:", e);
    }
  }
  window.addEventListener("beforeunload", (e) => {
    const hasPending = hasPendingConversationCommits() || hasPendingRepoCommits();
    if (hasPending) {
      flushConversationCommitQueue();
      flushRepoCommitQueue();
      e.preventDefault();
      e.returnValue = "";
    }
  });
  legacy_pre_effect(
    () => ($currentRoute(), $syncState(), get$1(token2)),
    () => {
      if ($currentRoute() === "home" && $syncState().phase === "idle" && !$syncState().paused) {
        try {
          discoverAllRepos(get$1(token2));
        } catch (e) {
          console.warn("[SkyGit] Repo discovery failed:", e);
        }
      }
    }
  );
  legacy_pre_effect_reset();
  init();
  var fragment = comment();
  var node = first_child(fragment);
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
    if_block(node, ($$render) => {
      if ($currentRoute() === "loading") $$render(consequent);
      else $$render(alternate, false);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
mount(App, {
  target: document.getElementById("app")
});
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
//# sourceMappingURL=index-BKyWTCMt.js.map
