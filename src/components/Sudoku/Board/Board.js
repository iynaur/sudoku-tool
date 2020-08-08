import React from 'react';
import Block from './Block/Block';
import AspectRatioBox from '../../UI/AspectRatio/AspectRatioBox';
import Arrow from './Arrow';
import styles from './Board.module.scss';
import * as positions from '../../../libs/position';

const Board = ({ availablePositions, cells, activeVal, activePos, cellClickedHandler, showAvail, isNoting, marks }) => {
  // active value
  if (activePos) {
    // no active value, then selected value is active value for board
    const { row, col } = activePos;
    activeVal = cells[row][col].value;
  }

  console.log(marks && marks.arrows);
  return (
    <AspectRatioBox ratio={1.0}>
      <div className={styles.SudokuBoard}>
        {marks &&
          marks.arrows &&
          marks.arrows.map(arrow => <Arrow key={`${arrow.startPos}-${arrow.endPos}`} {...arrow} />)}
        {positions.blockShape.map((rows, idx) => (
          <div key={idx} className={styles.Row}>
            {rows.map(b => (
              <Block
                key={b}
                block={b}
                cells={cells}
                activePos={activePos}
                activeVal={activeVal}
                availableCells={availablePositions}
                cellClickedHandler={cellClickedHandler}
                showAvail={showAvail}
                isNoting={isNoting}
                marks={marks}
              />
            ))}
          </div>
        ))}
      </div>
    </AspectRatioBox>
  );
};

export default Board;
