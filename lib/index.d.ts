import sqlite3 from 'better-sqlite3';
export declare class Level {
    db: sqlite3.Database;
    V_LEVEL_POW: number;
    close(): void;
    hLevel(v: string): number;
    vLevel(v: string): any;
}
export declare class Frequency {
    lang: string;
    db: sqlite3.Database;
    constructor(lang?: string);
    close(): void;
    vFreq<K extends string = string>(...vs: K[]): Promise<any>;
}
export declare function makePinyin(entry: string): any;
//# sourceMappingURL=index.d.ts.map