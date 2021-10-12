import S from 'jsonschema-definer'

export const sType = S.string().enum('character', 'vocabulary', 'sentence')

export const sTranslation = S.object().additionalProperties(
  S.list(S.string()).minItems(1).uniqueItems()
)

export const sEntry = S.shape({
  type: sType,
  entry: S.list(S.string()).minItems(1).uniqueItems(),
  reading: S.list(S.string()).minItems(1).uniqueItems(),
  english: S.list(S.string()).uniqueItems(),
  translation: sTranslation,
  tag: S.list(S.string()).uniqueItems(),
  frequency: S.number().optional(),
  level: S.number().optional(),
  hLevel: S.integer().minimum(1)
})

export const sHan = S.string().custom((s) => /^\p{sc=Han}$/u.test(s))

export const sRadical = S.shape({
  entry: sHan,
  sub: S.list(sHan).uniqueItems(),
  sup: S.list(sHan).uniqueItems(),
  var: S.list(sHan).uniqueItems()
})

export const sLibrary = S.shape({
  id: S.string().format('uuid'),
  createdAt: S.string().format('date-time'),
  updatedAt: S.string().format('date-time'),
  isShared: S.boolean(),
  title: S.string(),
  entries: S.list(
    sEntry.partial().required('entry').additionalProperties(true)
  ).minItems(1),
  type: sType,
  description: S.string(),
  tag: S.list(S.string())
}).additionalProperties(true)
