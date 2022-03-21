var Component = /*#__PURE__*/ (function () {
  'use strict'

  function Component () {
    if (!(this instanceof Component)) {
      throw new TypeError(
        'Class constructor Component ' +
        "cannot be invoked without 'new'")
    }
  }

  initializePrototype(Component)

  return Component
})()