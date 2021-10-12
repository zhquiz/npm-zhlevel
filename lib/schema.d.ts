export declare const sType: import("jsonschema-definer").BaseSchema<"character" | "vocabulary" | "sentence", true, Readonly<import("jsonschema-definer/dist/base").BaseJsonSchema>>;
export declare const sTranslation: import("jsonschema-definer").ObjectSchema<{
    [x: string]: string[];
}, true>;
export declare const sEntry: import("jsonschema-definer").ObjectSchema<{
    frequency?: number | undefined;
    level?: number | undefined;
    type: "character" | "vocabulary" | "sentence";
    entry: string[];
    reading: string[];
    english: string[];
    translation: {
        [x: string]: string[];
    };
    tag: string[];
    hLevel: number;
}, true>;
export declare const sHan: import("jsonschema-definer").StringSchema<string, true>;
export declare const sRadical: import("jsonschema-definer").ObjectSchema<{
    entry: string;
    sub: string[];
    sup: string[];
    var: string[];
}, true>;
export declare const sLibrary: import("jsonschema-definer").ObjectSchema<{
    type: "character" | "vocabulary" | "sentence";
    title: string;
    description: string;
    id: string;
    tag: string[];
    createdAt: string;
    updatedAt: string;
    isShared: boolean;
    entries: {}[];
}, true>;
//# sourceMappingURL=schema.d.ts.map