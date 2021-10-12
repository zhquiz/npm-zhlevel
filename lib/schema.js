"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sLibrary = exports.sRadical = exports.sHan = exports.sEntry = exports.sTranslation = exports.sType = void 0;
const jsonschema_definer_1 = __importDefault(require("jsonschema-definer"));
exports.sType = jsonschema_definer_1.default.string().enum('character', 'vocabulary', 'sentence');
exports.sTranslation = jsonschema_definer_1.default.object().additionalProperties(jsonschema_definer_1.default.list(jsonschema_definer_1.default.string()).minItems(1).uniqueItems());
exports.sEntry = jsonschema_definer_1.default.shape({
    type: exports.sType,
    entry: jsonschema_definer_1.default.list(jsonschema_definer_1.default.string()).minItems(1).uniqueItems(),
    reading: jsonschema_definer_1.default.list(jsonschema_definer_1.default.string()).minItems(1).uniqueItems(),
    english: jsonschema_definer_1.default.list(jsonschema_definer_1.default.string()).uniqueItems(),
    translation: exports.sTranslation,
    tag: jsonschema_definer_1.default.list(jsonschema_definer_1.default.string()).uniqueItems(),
    frequency: jsonschema_definer_1.default.number().optional(),
    level: jsonschema_definer_1.default.number().optional(),
    hLevel: jsonschema_definer_1.default.integer().minimum(1)
});
exports.sHan = jsonschema_definer_1.default.string().custom((s) => /^\p{sc=Han}$/u.test(s));
exports.sRadical = jsonschema_definer_1.default.shape({
    entry: exports.sHan,
    sub: jsonschema_definer_1.default.list(exports.sHan).uniqueItems(),
    sup: jsonschema_definer_1.default.list(exports.sHan).uniqueItems(),
    var: jsonschema_definer_1.default.list(exports.sHan).uniqueItems()
});
exports.sLibrary = jsonschema_definer_1.default.shape({
    id: jsonschema_definer_1.default.string().format('uuid'),
    createdAt: jsonschema_definer_1.default.string().format('date-time'),
    updatedAt: jsonschema_definer_1.default.string().format('date-time'),
    isShared: jsonschema_definer_1.default.boolean(),
    title: jsonschema_definer_1.default.string(),
    entries: jsonschema_definer_1.default.list(exports.sEntry.partial().required('entry').additionalProperties(true)).minItems(1),
    type: exports.sType,
    description: jsonschema_definer_1.default.string(),
    tag: jsonschema_definer_1.default.list(jsonschema_definer_1.default.string())
}).additionalProperties(true);
