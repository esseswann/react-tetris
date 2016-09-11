import { keys, random } from 'lodash'

export const types = {
  'х': [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1],
  ],
  'у': [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
  ],
  'й': [
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ]
}
export const typeKeys = keys(types)
export const randomType = () => types[typeKeys[random(0, typeKeys.length - 1)]]
