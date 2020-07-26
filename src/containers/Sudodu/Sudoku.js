import React, { useState, useCallback } from 'react';
import Button from '../../components/UI/Button/Button';
import NewGame from './NewGame';
import Board from '../../components/Sudoku/Board/Board';
import Controls from '../../components/Sudoku/Controls/Controls';
import Modal from '../../components/UI/Modal/Modal';
import QRCode from 'qrcode.react';
import styles from './Sudoku.module.scss';
import * as sudoku from '../../libs/sudoku';

const initialPuzzle = `
090000000
000800230
006004070
500083100
600090003
001560007
010200700
084001000
000000020
`;

const Sudoku = () => {
  const [showShare, setShowShare] = useState(false);
  const [isNewGame, setIsNewGame] = useState(false);
  const [newGameError, setNewGameError] = useState(null);
  const [initialValues, setInitialValues] = useState(() => {
    try {
      // get puzzle from url search parameter: puzzle
      const puzzle =
        new URLSearchParams(window.location.search).get('puzzle') ||
        initialPuzzle;
      return sudoku.parsePuzzle(puzzle);
    } catch (error) {
      console.error('parse error:', error);
      return sudoku.parsePuzzle(initialPuzzle);
    }
  });
  const [values, setValues] = useState(initialValues);
  const [showAvail, setShowAvail] = useState(false);
  const [isNoting, setIsNoting] = useState(false);
  // {pos:[row, col], val:0}
  const [activeState, setActiveState] = useState({ pos: null, val: 0 });
  const { pos: activePos, val: activeVal } = activeState;

  // handlers
  const startNewGameHandler = useCallback(() => {
    setIsNewGame(true);
  }, []);

  const cancelNewGameHandler = useCallback(() => {
    setIsNewGame(false);
  }, []);

  const newGameHandler = useCallback(puzzle => {
    try {
      const values = sudoku.parsePuzzle(puzzle);
      setInitialValues(values);
      setValues(values);
      setIsNewGame(false);
      // deselect
      setActiveState({ pos: null, val: 0 });
    } catch (error) {
      setNewGameError(error);
    }
  }, []);

  const cellClickedHandler = useCallback(
    (row, col) => {
      if (activeVal !== 0) {
        // place or note
        setValues(sudoku.updateValues(isNoting, row, col, activeVal));
      } else {
        // select position
        setActiveState(({ pos: curActivePos }) => {
          let pos = [row, col];
          if (curActivePos) {
            const [curRow, curCol] = curActivePos;
            if (row === curRow && col === curCol) {
              // cancel current selected
              pos = null;
            }
          }
          return { pos, val: 0 };
        });
      }
    },
    [activeVal, isNoting]
  );

  const digitClickedHandler = useCallback(
    d => {
      if (activePos) {
        // place or note
        const [activeRow, activeCol] = activePos;
        setValues(sudoku.updateValues(isNoting, activeRow, activeCol, d));
      } else {
        // active a value
        setActiveState(({ val: curActiveVal }) => {
          let val = d;
          if (curActiveVal === d) {
            // cancel active
            val = 0;
          }
          return { pos: null, val };
        });
      }
    },
    [activePos, isNoting]
  );

  const resetHandler = useCallback(() => {
    if (!window.confirm || window.confirm('Are you sure to reset?')) {
      setValues(initialValues);
      // deselect
      setActiveState({ pos: null, val: 0 });
    }
  }, [initialValues]);

  const eraseValueHandler = useCallback(() => {
    if (activePos) {
      const [activeRow, activeCol] = activePos;
      setValues(curValues => {
        const oldValue = curValues[activeRow][activeCol];
        if (oldValue.origin) {
          // can't erase origin value
          return curValues;
        }

        // clear placed and noted value.
        return sudoku.updateValues(curValues, activeRow, activeCol, new Set());
      });
    }
  }, [activePos]);

  const deselectHandler = useCallback(() => {
    setActiveState({ pos: null, val: 0 });
  }, []);

  const toggleShowAvailHandler = useCallback(() => {
    setShowAvail(showAvail => !showAvail);
  }, []);

  const toggleIsNotingHandler = useCallback(() => {
    setIsNoting(isNoting => !isNoting);
  }, []);

  const autoNoteHandler = useCallback(() => {
    setValues(sudoku.autoNote);
  }, []);

  const autoPlaceHandler = useCallback(() => {
    setValues(sudoku.autoPlace);
  }, []);

  const pointingHandler = useCallback(() => {
    setValues(sudoku.pointing);
  }, []);

  const claimingHandler = useCallback(() => {
    setValues(sudoku.claiming);
  }, []);

  let content = null;
  if (isNewGame) {
    content = (
      <NewGame
        cancelNewGameHandler={cancelNewGameHandler}
        newGameHandler={newGameHandler}
        error={newGameError}
      />
    );
  } else {
    let shareContent = null;
    if (showShare) {
      const url = new URL(window.location);
      const puzzle = sudoku.stringify(values);
      url.search = '?puzzle=' + puzzle;
      shareContent = (
        <div className={styles.QRCode}>
          <QRCode size={256} value={url.toString()} />
          <p>{puzzle}</p>
        </div>
      );
    }

    content = (
      <>
        <Modal show={showShare} close={() => setShowShare(false)}>
          {shareContent}
        </Modal>
        <div className={styles.Menu}>
          <Button onClick={startNewGameHandler}>New</Button>
          <Button onClick={() => setShowShare(true)}>Share</Button>
        </div>
        <div className={styles.Board}>
          <Board
            values={values}
            activeVal={activeVal}
            activePos={activePos}
            cellClickedHandler={cellClickedHandler}
            showAvail={showAvail}
            isNoting={isNoting}
          />
        </div>
        <div className={styles.Controls}>
          <Controls
            values={values}
            activePos={activePos}
            activeVal={activeVal}
            digitClickedHandler={digitClickedHandler}
            showAvail={showAvail}
            isNoting={isNoting}
            resetHandler={resetHandler}
            eraseValueHandler={eraseValueHandler}
            deselectHandler={deselectHandler}
            toggleShowAvailHandler={toggleShowAvailHandler}
            toggleIsNotingHandler={toggleIsNotingHandler}
            autoNoteHandler={autoNoteHandler}
            autoPlaceHandler={autoPlaceHandler}
            pointingHandler={pointingHandler}
            claimingHandler={claimingHandler}
          />
        </div>
        <div className={styles.Info}></div>
      </>
    );
  }

  return <div className={styles.Sudoku}>{content}</div>;
};

export default Sudoku;