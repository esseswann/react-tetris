import { random } from 'lodash'

export const colors = [
  'F44336',
  '3F51B5',
  '009688',
  '4CAF50',
  'FFC107',
  'FF5722'
]

export const randomColor = () =>
  '#' + colors[random(0, colors.length - 1)]
