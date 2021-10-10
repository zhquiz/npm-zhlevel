"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePinyin = exports.Level = void 0;
const path_1 = __importDefault(require("path"));
const nodejieba_1 = __importDefault(require("nodejieba"));
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
//@ts-ignore
const chinese_to_pinyin_1 = __importDefault(require("chinese-to-pinyin"));
class Level {
    constructor() {
        this.db = (0, better_sqlite3_1.default)(path_1.default.join(__dirname, '../assets/zhlevel.db'), {
            readonly: true
        });
        this.V_LEVEL_POW = 3;
    }
    hLevel(v) {
        const raw = [...v.matchAll(/\p{sc=Han}/gu)].map((m) => m[0]);
        if (!raw.length) {
            return 0;
        }
        const segments = this.db
            .prepare(
        /* sql */ `
        SELECT "entry", hLevel "level" FROM zhlevel WHERE hLevel IS NOT NULL AND
        "entry" IN (${Array(raw.length).fill('?').join(',')})
        `)
            .all(...raw);
        if (segments.length < raw.length) {
            return 100;
        }
        return Math.max(...segments.map((et) => et.level));
    }
    vLevel(v) {
        const r = this.db
            .prepare(
        /* sql */ `
      SELECT vLevel "level" FROM zhlevel WHERE vLevel IS NOT NULL AND "entry" = ?
        `)
            .get(v);
        if (r) {
            return r.level;
        }
        const raw = [...new Set(nodejieba_1.default.cutForSearch(v))].filter((v) => /\p{sc=Han}/u.test(v));
        if (!raw.length) {
            return 0;
        }
        const segments = this.db
            .prepare(
        /* sql */ `
        SELECT "entry", vLevel "level" FROM zhlevel WHERE vLevel IS NOT NULL AND
        "entry" IN (${Array(raw.length).fill('?').join(',')})
        `)
            .all(...raw);
        if (!segments.length) {
            return 100;
        }
        const entriesMap = new Map();
        segments.map((et) => {
            entriesMap.set(et.entry[0], et.level);
        });
        return (([...entriesMap.values()].reduce((prev, c) => prev + c ** this.V_LEVEL_POW, 0) **
            (1 / this.V_LEVEL_POW) *
            raw.length) /
            (entriesMap.size * entriesMap.size));
    }
}
exports.Level = Level;
function makePinyin(entry) {
    return (0, chinese_to_pinyin_1.default)(entry, {
        toneToNumber: true,
        keepRest: true
    });
}
exports.makePinyin = makePinyin;
