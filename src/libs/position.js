// local position is position in block.
export const getDigitLocalPos = d => [Math.floor((d - 1) / 3), (d - 1) % 3];
const _baseArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const blockShape = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

export const indices = _baseArray;
export const blocks = _baseArray;
export const rows = _baseArray;
export const cols = _baseArray;

// (row, col)->block
export const rowColToBlock = (row, col) => Math.floor(row / 3) * 3 + Math.floor(col / 3);
// (row, col)-> index in block
export const blockRowColIndex = (row, col) => (row % 3) * 3 + (col % 3);
// rows of block
export const blockRows = block => {
  const start = Math.floor(block / 3) * 3;
  return [start, start + 1, start + 2];
};
// cols of block
export const blockCols = block => {
  const start = (block % 3) * 3;
  return [start, start + 1, start + 2];
};

export const newCells = valueFunc => {
  return rows.map(row => cols.map(col => valueFunc && valueFunc(row, col)));
};
export const copyCells = cells => {
  const copied = [...cells];
  for (const row of rows) {
    copied[row] = [...copied[row].map(v => ({ ...v }))];
  }
  return copied;
};

const _rowPositions = _baseArray.map(row =>
  _baseArray.map(col => ({
    key: `r${row}c${col}`,
    toString() {
      return this.key;
    },
    // left->right, top->bottom
    idx: row * 9 + col,
    // domains: row, col, block
    row,
    col,
    block: rowColToBlock(row, col),
  }))
);
export const rowPositions = _rowPositions;

// row positions without col
const _rowRelatedPositions = _baseArray.map(r => _baseArray.map(c => _rowPositions[r].filter(pos => pos.col !== c)));
const _colPositions = _baseArray.map(c => _baseArray.map(r => _rowPositions[r][c]));
export const colPositions = _colPositions;
// col positions without row
const _colRelatedPositions = _baseArray.map(c => _baseArray.map(r => _colPositions[c].filter(pos => pos.row !== r)));

// block positions 3x3
const _blockPositions = _baseArray.map(b => blockRows(b).map(row => _rowPositions[row].filter(pos => pos.block === b)));

const _blocFlattenkPositions = _baseArray.map(b => {
  const blockPoses = _blockPositions[b];
  return [...blockPoses[0], ...blockPoses[1], ...blockPoses[2]];
});
// block positions without it's row/col index
const _blockRelatedPositions = _baseArray.map(b =>
  _baseArray.map(i => _blocFlattenkPositions[b].filter((_, idx) => idx !== i))
);

// positions without row/col
const _relatedPositions = _baseArray.map(r =>
  _baseArray.map(c => {
    const b = rowColToBlock(r, c);
    const res = [];
    _rowPositions.forEach(rows =>
      rows.forEach(pos => {
        const { row, col, block } = pos;
        if (r === row && c === col && b === block) {
          return;
        }
        if (r === row || c === col || b === block) {
          res.push(pos);
        }
      })
    );
    return res;
  })
);

export const getPosition = (row, col) => _rowPositions[row][col];

export const getPosBlock = (row, col) => _rowPositions[row][col].block;

export const getBlockPositions = block => _blockPositions[block];
export const getBlockFlattenPositions = block => _blocFlattenkPositions[block];
export const getRowPositions = row => _rowPositions[row];
export const getColPositions = col => _colPositions[col];

export const getRelatedBlockPositions = ({ row, col, block }) =>
  _blockRelatedPositions[block === undefined ? rowColToBlock(row, col) : block][blockRowColIndex(row, col)];
export const getRelatedRowPositions = ({ row, col }) => _rowRelatedPositions[row][col];
export const getRelatedColPositions = ({ row, col }) => _colRelatedPositions[col][row];
export const getRelatedPositions = ({ row, col }) => _relatedPositions[row][col];

// all positions from left to right, top to bottom.
// used to iterate all positions
export const flattenPositions = _rowPositions.flat();

const _keyPositionMapping = {};
flattenPositions.forEach(pos => {
  _keyPositionMapping[pos.key] = pos;
});

export const getPositionByKey = key => _keyPositionMapping[key];

export const mapPositionsTo = f => _baseArray.map(row => _baseArray.map(col => f(row, col)));

export const getCell = (cells, pos) => cells[pos.row][pos.col];

const _intersection = (a, b) => {
  const sb = new Set(b);
  return a.filter(v => sb.has(v));
};

export const getCommonRelatedPositions = (...poses) => {
  switch (poses.length) {
    case 0:
      return [];
    case 1:
      return getRelatedPositions(poses[0]);
    default:
      const [pos, ...rposes] = poses;
      return _intersection(getRelatedPositions(pos), getCommonRelatedPositions(...rposes));
  }
};

const calcPosDistance = (aPos, bPos) => {
  const dRow = aPos.row - bPos.row;
  const dCol = aPos.col - bPos.col;
  return dRow * dRow + dCol * dCol;
};

export const findClosedPosPair = (aPoses, bPoses) => {
  if (aPoses.length === 1 && bPoses === 1) {
    return [aPoses[0], bPoses[0]];
  }

  let minDistance = Number.MAX_VALUE;
  let a = null;
  let b = null;
  for (const aPos of aPoses) {
    for (const bPos of bPoses) {
      const d = calcPosDistance(aPos, bPos);
      if (d < minDistance) {
        minDistance = d;
        a = aPos;
        b = bPos;
      }
    }
  }

  return [a, b];
};
