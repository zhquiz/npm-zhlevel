import path from 'path'

import jieba from 'nodejieba'
import sqlite3 from 'better-sqlite3'
//@ts-ignore
import toPinyin from 'chinese-to-pinyin'

export class Level {
  db: sqlite3.Database = sqlite3(path.join(__dirname, '../assets/zhlevel.db'), {
    readonly: true
  })

  V_LEVEL_POW = 3

  hLevel(v: string) {
    const raw = [...v.matchAll(/\p{sc=Han}/gu)].map((m) => m[0])
    if (!raw.length) {
      return 0
    }

    const segments = this.db
      .prepare(
        /* sql */ `
        SELECT "entry", hLevel "level" FROM zhlevel WHERE hLevel IS NOT NULL AND
        "entry" IN (${Array(raw.length).fill('?').join(',')})
        `
      )
      .all(...raw)

    if (segments.length < raw.length) {
      return 100
    }

    return Math.max(...segments.map((et) => et.level))
  }

  vLevel(v: string) {
    const r = this.db
      .prepare(
        /* sql */ `
      SELECT vLevel "level" FROM zhlevel WHERE vLevel IS NOT NULL AND "entry" = ?
        `
      )
      .get(v)

    if (r) {
      return r.level
    }

    const raw = [...new Set(jieba.cutForSearch(v))].filter((v) =>
      /\p{sc=Han}/u.test(v)
    )
    if (!raw.length) {
      return 0
    }

    const segments = this.db
      .prepare(
        /* sql */ `
        SELECT "entry", vLevel "level" FROM zhlevel WHERE vLevel IS NOT NULL AND
        "entry" IN (${Array(raw.length).fill('?').join(',')})
        `
      )
      .all(...raw)

    if (!segments.length) {
      return 100
    }

    const entriesMap = new Map<string, number>()
    segments.map((et) => {
      entriesMap.set(et.entry[0]!, et.level)
    })

    return (
      ([...entriesMap.values()].reduce(
        (prev, c) => prev + c ** this.V_LEVEL_POW,
        0
      ) **
        (1 / this.V_LEVEL_POW) *
        raw.length) /
      (entriesMap.size * entriesMap.size)
    )
  }
}

export function makePinyin(entry: string) {
  return toPinyin(entry, {
    toneToNumber: true,
    keepRest: true
  })
}
