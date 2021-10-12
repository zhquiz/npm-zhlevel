import path from 'path'

import axios from 'axios'
import sqlite3 from 'better-sqlite3'
//@ts-ignore
import toPinyin from 'chinese-to-pinyin'
import jieba from 'nodejieba'

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

export class Frequency {
  db: sqlite3.Database = sqlite3(path.join(__dirname, '../assets/frequency.db'))

  constructor(public lang = 'zh') {
    this.db.exec(/* sql */ `
    CREATE TABLE IF NOT EXISTS "frequency" (
      "entry"       TEXT NOT NULL,
      "lang"        TEXT NOT NULL,
      "frequency"   FLOAT NOT NULL,
      PRIMARY KEY ("entry", "lang")
    );
    `)
  }

  async vFreq<K extends string = string>(...vs: K[]) {
    if (!vs.length) {
      return {}
    }

    const out1 = this.db
      .prepare(
        /* sql */ `
    SELECT "entry", "frequency" FROM "frequency" WHERE "lang" = ? "entry" IN (${Array(
      vs.length
    ).fill('?')})
    `
      )
      .all(this.lang, ...vs)
      .reduce(
        (prev, r: { entry: string; frequency: number }) => ({
          ...prev,
          [r.entry]: r.frequency
        }),
        {}
      )

    vs = vs.filter((v) => !out1[v])

    if (!vs.length) {
      return out1
    }

    const { data: out2 } = await axios.post(
      `https://cdn.zhquiz.cc/api/wordfreq?lang=${encodeURIComponent(
        this.lang
      )}`,
      {
        q: vs
      }
    )

    if (Object.keys(out2).length) {
      const stmt = this.db.prepare(/* sql */ `
      INSERT INTO "frequency" ("entry", "frequency", "lang")
      VALUES (@entry, @frequency, @lang)
      `)

      this.db.transaction(() => {
        Object.entries(out2).map(([k, v]) => {
          stmt.run({
            entry: k,
            frequency: v,
            lang: this.lang
          })
        })
      })()
    }

    return {
      ...out1,
      ...out2
    }
  }
}

export function makePinyin(entry: string) {
  return toPinyin(entry, {
    toneToNumber: true,
    keepRest: true
  })
}
