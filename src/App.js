import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  ArrowRightOutlined, ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined
} from '@ant-design/icons'

import styled from 'styled-components'
import { Button, Modal } from 'antd'

const BoardLayout = styled.div`
    display: grid;
    border: 3px solid black;
    grid-template-columns: ${props => `repeat(${props.boardSize}, 1fr)`};
    width: 20rem;
    height: 20rem;
    
    grid-gap: 1px;
    align-self: center;
    justify-self: center;
  `
const StyledButton = styled(Button)`

  // font-size: 4rem;
  // background: white;
  // border: none;
  // cursor: pointer;
`

const SnakeBody = styled.div`
    background: black;
    padding: 1px solid white;
  `
const Apple = styled.div`
    background: red;

  `
const EmptySpace = styled.div`
    background: white;
  `
const AppContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto 1fr auto auto 1fr ;
  align-items: center;
  justify-items: center;
  align-content: center;
  grid-gap: 1rem;
  grid-template-areas:
  "heading"
  "score"
  "game"
  "controls"
  "."
  ;
`
const Controls = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-areas: 
  ". up ."
  "left . right"
  ". down ."
  ;
`

function App () {
  let ticker
  const boardSize = 16
  const gameSpeed = 200
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const resetGame = () => {
    setDirection('right')
    setScore(0)
    setSnakePosition([[1, 1], [1, 2], [1, 3]])
    setApplePosition([getRandomBoardPosition(), getRandomBoardPosition()])
    setGameOver(false)
    // ticker = setInterval(boardTick, gameSpeed)
    // window.location.reload()
  }

  const getRandomBoardPosition = () => {
    const min = 0
    const max = boardSize - 1
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const boardRef = useRef(null)

  const board = Array.from({ length: boardSize }, (v, i) => Array.from({ length: boardSize }, (v, i) => 0))

  const [snakePosition, setSnakePosition] = useState([[1, 1], [1, 2], [1, 3]])

  const [direction, setDirection] = useState('right')

  const [applePosition, setApplePosition] = useState([getRandomBoardPosition(), getRandomBoardPosition()])

  const updateSnakeAndMaybeGrow = (newSnakePosition, newHead) => {
    if (snakeIsAtCoords(newHead[0], newHead[1])) {
      setGameOver(true)
    }

    if (snakePosition[0][0] === applePosition[0] && snakePosition[0][1] === applePosition[1]) {
      newSnakePosition.push(newHead)
      setApplePosition([getRandomBoardPosition(), getRandomBoardPosition()])
      const newScore = score + 1
      setScore(newScore)
    }

    setSnakePosition(newSnakePosition)
  }

  const goRight = () => {
    const newSnakePosition = [...snakePosition]
    newSnakePosition.splice(0, 1)
    const newHead = [...newSnakePosition[newSnakePosition.length - 1]]
    newHead[1] += 1
    if (newHead[1] > boardSize - 1) newHead[1] = 0
    newSnakePosition.push(newHead)

    updateSnakeAndMaybeGrow(newSnakePosition, newHead)
  }

  const goLeft = () => {
    const newSnakePosition = [...snakePosition]
    newSnakePosition.splice(0, 1)
    const newHead = [...newSnakePosition[newSnakePosition.length - 1]]
    newHead[1] -= 1
    if (newHead[1] < 0) newHead[1] = boardSize - 1
    newSnakePosition.push(newHead)

    updateSnakeAndMaybeGrow(newSnakePosition, newHead)
  }

  const goUp = () => {
    const newSnakePosition = [...snakePosition]
    newSnakePosition.splice(0, 1)
    const newHead = [...newSnakePosition[newSnakePosition.length - 1]]
    newHead[0] -= 1
    if (newHead[0] < 0) newHead[0] = boardSize - 1
    newSnakePosition.push(newHead)

    updateSnakeAndMaybeGrow(newSnakePosition, newHead)
  }

  const goDown = () => {
    const newSnakePosition = [...snakePosition]
    newSnakePosition.splice(0, 1)
    const newHead = [...newSnakePosition[newSnakePosition.length - 1]]
    newHead[0] += 1
    if (newHead[0] > boardSize - 1) newHead[0] = 0
    newSnakePosition.push(newHead)

    updateSnakeAndMaybeGrow(newSnakePosition, newHead)
  }

  const boardTick = () => {
    switch (direction) {
      case 'right':
        goRight()
        break
      case 'down':
        goDown()
        break
      case 'left':
        goLeft()
        break
      case 'up':
        goUp()
        break
      default:
        break
    }
  }

  useEffect(() => {
    ticker = setInterval(boardTick, gameSpeed)

    if (gameOver) clearInterval(ticker)

    return () => clearInterval(ticker)
  }, [boardTick, gameOver])

  useEffect(() => {
    boardRef.current.focus()
    // document.addEventListener('onKeyDown')
    document.addEventListener('keydown', handleKeyDown)
    // onKeyDown = {(e) => handleKeyDown(e.key)
  }, [])

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
        setDirection('up')
        break
      case 'ArrowRight':
        setDirection('right')
        break
      case 'ArrowDown':
        setDirection('down')
        break
      case 'ArrowLeft':
        setDirection('left')
        break
    }
  }

  const snakeIsAtCoords = (r, c) => {
    for (const s of snakePosition) {
      if (s[0] === r && s[1] === c) return true
    }
    return false
  }

  const printBoard = () => {
    let r = 0

    const result = []

    for (const row of board) {
      let c = 0
      for (const col of row) {
        if (snakeIsAtCoords(r, c)) result.push(<SnakeBody key={uuidv4()} />)

        else if (applePosition[0] === r && applePosition[1] === c) result.push(<Apple key={uuidv4()} />)

        else result.push(<EmptySpace key={uuidv4()} />)

        c++
      }
      r++
    }

    return result
  }

  return (
    <>
      <AppContainer>
        <h1 style={{ gridArea: 'heading' }}>Sn8k M8</h1>
        <h4 style={{ gridArea: 'score' }}>{score}</h4>

        <BoardLayout ref={boardRef} style={{ gridArea: 'game' }} boardSize={boardSize} tabIndex='0'>
          {printBoard()}
        </BoardLayout>

        <Controls style={{ gridArea: 'controls' }}>

          <StyledButton size='large' shape='circle' onClick={() => setDirection('up')} style={{ gridArea: 'up' }}><ArrowUpOutlined /></StyledButton>
          <StyledButton size='large' shape='circle' onClick={() => setDirection('left')} style={{ gridArea: 'left' }}><ArrowLeftOutlined /></StyledButton>
          <StyledButton size='large' shape='circle' onClick={() => setDirection('right')} style={{ gridArea: 'right' }}><ArrowRightOutlined /></StyledButton>
          <StyledButton size='large' shape='circle' onClick={() => setDirection('down')} style={{ gridArea: 'down' }}><ArrowDownOutlined /></StyledButton>
        </Controls>
      </AppContainer>

      <Modal
        title='Game Over'
        visible={gameOver}
        onOk={resetGame}
      />
    </>
  )
}

export default App
