import React from 'react'
import { types, typeKeys, randomType } from './types'
import { randomColor } from './colors'
import Block from './Block'
import { forEach,
         map,
         mapValues,
         keys,
         find,
         max,
         min,
         sum,
         uniqueId,
         toNumber,
         merge,
         omit,
         clone,
         reverse,
         sortBy,
         pickBy,
         filter,
         remove
        }
  from 'lodash'

const dic = {
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowRight: 'right',
  ArrowLeft:  'left',
}

const newError = (message) => {
  throw message
}

const column = (x, blocks) =>
  pickBy(blocks, block => block.x === x)

const row = (y, blocks) =>
  pickBy(blocks, block => block.y === y)

const transfer = (blocks, id, x, y) => {
  let newBlocks = merge({}, blocks)
  newBlocks[id].x = x
  newBlocks[id].y = y
  return newBlocks
}

const moveOne = (blocks, id, direction) => {
  let newPosition = {x: blocks[id].x, y: blocks[id].y}
  switch (direction) {
    case 'up':
      newPosition.y--
    break
    case 'down':
      newPosition.y++
    break
    case 'left':
      newPosition.x--
    break
    case 'right':
      newPosition.x++
    break
  }
  return transfer(blocks, id, newPosition.x, newPosition.y)
}

const move = (blocks, ids, direction) => {
  ids.length
    ? forEach(ids, id => blocks = moveOne(blocks, id, direction))
    : moveOne(blocks, ids, direction)
  return blocks
}

const Tetris = React.createClass({
  getInitialState() {
    return {
      width:  16,
      height: 24,
      size:   16,
      active: [],
      score:  0,
      blocks: {},
      speed:  1000,
    }
  },

  componentDidMount() {
    this.create()
    this.fall()
    window.addEventListener('keydown', this.listen)
  },

  listen(e) {
    if (dic[e.key] !== undefined)
      this.userMove(dic[e.key])
  },

  get(ids) {
    let result = {}
    ids.length
      ? forEach(ids, id => result[id] = this.state.blocks[id])
      : result = this.state.blocks[ids]
    return merge({}, result)
  },

  set(newBlocks, active = this.state.active) {
    const blocks = merge({}, this.state.blocks, newBlocks)
    this.intersects(active, blocks)
      ? this.gameOver()
      : this.setState({active, blocks})
  },

  create(type) {
    const color     = randomColor()
    let id          = max(map(keys(this.state.blocks), key => toNumber(key))) + 1 || 1
    const newBlocks = {}
    const active    = []
    forEach(randomType(), (row, y) =>
      forEach(row, (col, x) => {
          if (col) {
            active.push(id)
            newBlocks[id] = {color, x, y, parent: 1}
            id++
          }
        }))
    this.set(newBlocks, active)
  },

  transfer(id, x, y) {
    const blocks = transfer(this.state.blocks, id, x, y)
    this.intersects(id, blocks)
      ? myError(`Coordinates [${x}, ${y}] are occupied`)
      : this.setState({blocks})
  },

  intersects(ids, blocks) {
    const intersectsOne = (id) =>
      find(omit(blocks, id), block => block.x === blocks[id].x && block.y === blocks[id].y) ? true : false
    const outOfBounds = (id) => {
      const test = blocks[id].x > this.state.width - 1 || blocks[id].x < 0 || blocks[id].y > this.state.height - 1 || blocks[id].y < 0
      return test
    }

    const intersectsMany = () => {
      let result = false
      for (let id in ids) {
        if (intersectsOne(ids[id]) || outOfBounds(ids[id])) {
          result = true
          break
        }
      }

      return result
    }

    return ids.length
      ? intersectsMany()
      : intersectsOne(ids) || outOfBounds(ids)
  },

  move(ids, direction) {
    const blocks = move(this.state.blocks, ids, direction)
    if (this.intersects(ids, blocks)) {
      return false
    } else {
      this.setState({blocks})
      return true
    }
  },

  drop(toMove = this.state.active) {
    const sortedActive = reverse(sortBy(toMove, id => this.state.blocks[id].y))

    let blocks = merge({}, this.state.blocks)

    const nextPos = (x, y) => {
      const currentColumn = map(column(x, blocks), block => block.y)
      const lower         = remove(currentColumn, n => n > y)
      return min(lower) - 1 || this.state.height - 1
    }

    forEach(sortedActive, key =>
      blocks[key].y = nextPos(blocks[key].x, blocks[key].y)
    )
    this.set(blocks)
  },

  rotate(blocksToRotate = this.state.active) {
    const blockObjs = this.get(blocksToRotate)
    const xs = map(blockObjs, block => block.x)
    const ys = map(blockObjs, block => block.y)
    const x0 = sum(xs) / xs.length //(min(xs) + max(xs)) / 2
    const y0 = sum(ys) / ys.length //(min(ys) + max(ys)) / 2

    forEach(blocksToRotate, block => {
      const {x, y} = blockObjs[block]
      blockObjs[block].x = Math.round(x0 + ((x - x0) * Math.cos(Math.PI / 2)) - ((y - y0) * Math.sin(Math.PI / 2)))
      blockObjs[block].y = Math.round(y0 + ((x - x0) * Math.sin(Math.PI / 2)) - ((y - y0) * Math.cos(Math.PI / 2)))
    })

    let blocks       = merge({}, this.state.blocks, blockObjs)
    const blockKeys  = keys(blockObjs)

    // TODO Try to move block from obstacle
    // const directions = ['left', 'right', 'top']
    //
    // const check = (blocksToCheck, i) => {
    //   if (i <= 2)
    //     this.intersects(blockKeys, blocksToCheck)
    //       ? check(move(blocks, blockKeys, directions[i] + 1), i + 1)
    //       : blocks = blocksToCheck
    // }
    //
    // check(blocks, 0)
    if (this.intersects(blockKeys, blocks) === false)
      this.set(blocks)
  },

  fall() {
    const currentFall = () => {
      this.move(this.state.active, 'down') ||
     (this.drop(),
      this.create())
    }

    this.setState({motor: window.setInterval(currentFall, this.state.speed)})
  },

  gameOver() {
    window.clearInterval(this.state.motor)
    window.removeEventListener('keydown', this.listen)
    this.setState({motor: null})
  },

  newGame() {
    this.setState({
      active: [],
      score:  0,
      blocks: {}
    })
    this.create()
    this.fall()
  },

  userMove(direction) {
    switch (direction) {
      case 'up':
        this.rotate()
      break
      case 'down':
        this.drop()
        this.resolve()
        this.create()
      break
      default:
        this.move(this.state.active, direction)
    }
  },

  resolve() {
    const lastRow = keys(row(this.state.height - 1, this.state.blocks))
    if (lastRow.length === this.state.width) {
      this.setState({blocks: omit(this.state.blocks, lastRow)})
      this.move(keys(this.state.blocks), 'down')
      this.updateScore()
      this.resolve()
    }
  },

  updateScore(by = 1) {
    this.setState({score: this.state.score + by})
  },

  render() {
    return <div style={{display: 'flex'}}>
      <div style   = {{
        position:   'relative',
        background: '#004D40',
        width:      this.state.width * this.state.size,
        height:     this.state.height * this.state.size}}>
        {map(this.state.blocks, (block, key) =>
          <Block {...block} key={key} size={this.state.size} />)}
      </div>
      <div  style={{padding: '16px'}}>
        {this.state.motor
          ? <div>
              <h1>{this.state.score}</h1>
              <div style={{color: 'gray'}}>
                <div>← Left</div>
                <div>→ Right</div>
                <div>↑ Rotate</div>
                <div>↓ Drop</div>
            </div>
            </div>
          : <div>
              <h1>Game over</h1>
              <div>Score {this.state.score}</div>
              <div onClick={this.newGame}>New</div>
            </div>
          }
      </div>
    </div>
  }
})

export default Tetris
