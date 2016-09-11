import React from 'react'

const Block = ({
  color = 'red',
  x     = 0,
  y     = 0,
  size  = 10}) =>
  <div style = {{
    position:   'absolute',
    background: color,
    left:       x * size,
    top:        y * size,
    width:      size,
    height:     size }}/>

export default Block
