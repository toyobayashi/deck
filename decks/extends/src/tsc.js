"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BaseError = /** @class */ (function (_super) {
    __extends(BaseError, _super);
    function BaseError(message) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        var Ctor = _newTarget;
        if (!(_this instanceof Ctor)) {
            // TypeScript compiler ES5 target
            Object.setPrototypeOf(_this, Ctor.prototype);
            if (typeof Error.captureStackTrace === 'function') {
                Error.captureStackTrace(_this, Ctor);
            }
        }
        return _this;
    }
    /** @virtual */
    BaseError.prototype.what = function () {
        return this.message;
    };
    return BaseError;
}(Error));
Object.defineProperty(BaseError.prototype, 'name', {
    configurable: true,
    writable: true,
    enumerable: false,
    value: 'BaseError'
});
