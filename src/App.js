import React, { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  ArrowRightOutlined, ArrowUpOutlined, ArrowDownOutlined, ArrowLeftOutlined
} from '@ant-design/icons'

import styled from 'styled-components'
import { Form, Button, Modal, Input } from 'antd'

// import Firebase from './Firebase'

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
  height: 100vh;
  overflow: hidden;
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

// TODO Hookup to firebase for high scores

const boardSize = 16

const getRandomBoardPosition = () => {
  const min = 0
  const max = boardSize - 1
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const defaultGameState = {
  score: 0,
  gameOver: false,
  board: Array.from({ length: boardSize }, (v, i) => Array.from({ length: boardSize }, (v, i) => 0)),
  snakePosition: [[1, 1], [1, 2], [1, 3]],
  applePosition: [getRandomBoardPosition(), getRandomBoardPosition()]
}

const App = () => {
  const gameSpeed = 150

  const ticker = useRef()

  const clickSound = new Audio('./click.mp3')
  const crunchSound = new Audio('./crunch.mp3')
  const errorSound = new Audio('./error.mp3')
  clickSound.crossOrigin = 'anonymous'
  crunchSound.crossOrigin = 'anonymous'
  errorSound.crossOrigin = 'anonymous'

  // state
  const boardRef = useRef(null)
  const [direction, setDirection] = useState('right')
  const [gameState, setGameState] = useState(defaultGameState)

  // const [scores, setScores] = useState([])

  // const db = useRef(Firebase.firestore().collection('scores'))

  // const getScores = async () => {
  //   const scores = []

  //   const snapshot = await db.current.get()
  //   snapshot.forEach(doc => {
  //     scores.push(doc.data())
  //   })

  //   setScores(scores)
  // }

  const snakeIsAtCoords = (r, c) => {
    for (const s of gameState.snakePosition) {
      if (s[0] === r && s[1] === c) return true
    }
    return false
  }

  // const saveScoreAndRestart = (v) => {
  //   console.log(v)
  //   setDirection('right')
  //   setGameState(defaultGameState)
  // }

  // Print
  const printBoard = () => {
    let r = 0
    const result = []

    for (const row of gameState.board) {
      let c = 0
      for (const col of row) {
        if (snakeIsAtCoords(r, c)) result.push(<SnakeBody key={uuidv4()} />)
        else if (gameState.applePosition[0] === r && gameState.applePosition[1] === c) result.push(<Apple key={uuidv4()} />)
        else result.push(<EmptySpace key={uuidv4()} />)
        c++
      }
      r++
    }
    return result
  }

  // Effects
  useEffect(() => {
    const resetGame = () => {
      setDirection('right')
      setGameState(defaultGameState)
    }

    // movements
    const goRight = () => {
      const newSnakePosition = [...gameState.snakePosition]
      newSnakePosition.splice(0, 1)
      const newHead = [...newSnakePosition[newSnakePosition.length - 1]]
      newHead[1] += 1
      if (newHead[1] > boardSize - 1) newHead[1] = 0
      newSnakePosition.push(newHead)

      updateSnakeAndMaybeGrow(newSnakePosition, newHead)
    }

    const goLeft = () => {
      const newSnakePosition = [...gameState.snakePosition]
      newSnakePosition.splice(0, 1)
      const newHead = [...newSnakePosition[newSnakePosition.length - 1]]
      newHead[1] -= 1
      if (newHead[1] < 0) newHead[1] = boardSize - 1
      newSnakePosition.push(newHead)

      updateSnakeAndMaybeGrow(newSnakePosition, newHead)
    }

    const goUp = () => {
      const newSnakePosition = [...gameState.snakePosition]
      newSnakePosition.splice(0, 1)
      const newHead = [...newSnakePosition[newSnakePosition.length - 1]]
      newHead[0] -= 1
      if (newHead[0] < 0) newHead[0] = boardSize - 1
      newSnakePosition.push(newHead)

      updateSnakeAndMaybeGrow(newSnakePosition, newHead)
    }

    const goDown = () => {
      const newSnakePosition = [...gameState.snakePosition]
      newSnakePosition.splice(0, 1)
      const newHead = [...newSnakePosition[newSnakePosition.length - 1]]
      newHead[0] += 1
      if (newHead[0] > boardSize - 1) newHead[0] = 0
      newSnakePosition.push(newHead)

      updateSnakeAndMaybeGrow(newSnakePosition, newHead)
    }

    const updateSnakeAndMaybeGrow = (newSnakePosition, newHead) => {
      if (snakeIsAtCoords(newHead[0], newHead[1])) {
        errorSound.play()
        setGameState(oldGameState => ({ ...oldGameState, gameOver: true }))
        return
      }

      if (gameState.snakePosition[gameState.snakePosition.length - 1][0] === gameState.applePosition[0] && gameState.snakePosition[gameState.snakePosition.length - 1][1] === gameState.applePosition[1]) {
        crunchSound.play()
        newSnakePosition.push(newHead)
        const newScore = gameState.score + 1
        setGameState(oldGameState => ({
          ...oldGameState,
          score: newScore,
          applePosition: [getRandomBoardPosition(), getRandomBoardPosition()],
          snakePosition: newSnakePosition
        }))
        return
      }

      setGameState(oldGameState => ({ ...oldGameState, snakePosition: newSnakePosition }))
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

    ticker.current = setInterval(boardTick, gameSpeed)

    if (gameState.gameOver) {
      clearInterval(ticker.current)
      Modal.error({ onOk: () => resetGame(), okText: 'Try Again', title: 'Game Over', content: `Your score was ${gameState.score}` })
    }

    return () => clearInterval(ticker.current)
  }, [gameState, clickSound, errorSound, crunchSound, direction, snakeIsAtCoords])

  useEffect(() => {
    const handleKeyDown = (e) => {
      clickSound.play()
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

    boardRef.current.focus()
    document.addEventListener('keydown', handleKeyDown)
    // getScores()

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [clickSound])

  return (
    <>
      <AppContainer>
        <h1 style={{ gridArea: 'heading' }}>React Snake</h1>
        <h4 style={{ gridArea: 'score' }}>Score: {gameState.score}</h4>


        <BoardLayout ref={boardRef} style={{ gridArea: 'game' }} boardSize={boardSize} tabIndex='0'>
          {printBoard()}
        </BoardLayout>

        <Controls style={{ gridArea: 'controls' }}>
          <Button size='large' shape='circle' onClick={() => setDirection('up')} style={{ gridArea: 'up' }}><ArrowUpOutlined /></Button>
          <Button size='large' shape='circle' onClick={() => setDirection('left')} style={{ gridArea: 'left' }}><ArrowLeftOutlined /></Button>
          <Button size='large' shape='circle' onClick={() => setDirection('right')} style={{ gridArea: 'right' }}><ArrowRightOutlined /></Button>
          <Button size='large' shape='circle' onClick={() => setDirection('down')} style={{ gridArea: 'down' }}><ArrowDownOutlined /></Button>
        </Controls>
        <p>Use your arrow keys or the buttons above to play</p>
      </AppContainer>

      {/* <Modal
        visible={gameState.gameOver}
        closable={false}
        footer={null}
      >
        <Form onFinish={(v) => saveScoreAndRestart({ ...v, score: gameState.score })}>
          <h1>Game Over</h1>
          <h4>Your Score was: {gameState.score}</h4>
          <p>Record your name for posterity!</p>
          <Form.Item name='name' label='Name'>
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Play Again
            </Button>
          </Form.Item>

        </Form>
      </Modal> */}
    </>
  )
}

export default App
