#define CLEAR_BIT(a, bit) ((a) &= ~(1 << (bit)))
#define CHECK_BIT(a, bit) ((a) & (1 << (bit)))

#define RNG_MAX 4294967296

typedef char u8;

int randSeed = 10;
u8 grid[81];
u8 gridCopy[81];
u8 peerTable[81][20];

unsigned int rng(void) {
  unsigned int z = (randSeed += 0x6D2B79F5UL);
  z = (z ^ (z >> 15)) * (z | 1UL);
  z ^= z + (z ^ (z >> 7)) * (z | 61UL);
  return z ^ (z >> 14);
}

void shuffle(u8 *arr, int length) {
  for (int i = length - 1; i > 0; i--) {
    u8 j = rng() / ((RNG_MAX + 1u) / i);
    u8 tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

int generate(int depth) {
  u8 indices[9] = {0, 1, 2, 3, 4, 5, 6, 7, 8};
  for (int cellPos = depth; cellPos < 81; cellPos++) {
    if (grid[cellPos] == 0) {
      u8 *peers = peerTable[cellPos];
      int digitBitset = 0b111111111;

      for (int i = 0; i < 20; i++) {
        // peer digit
        u8 digit = grid[peers[i]];
        if (digit != 0) {
          CLEAR_BIT(digitBitset, digit - 1);
        }
      }
      shuffle(indices, 9);
      for (int i = 0; i < 9; i++) {
        // cell digit
        u8 digit = indices[i];
        if (CHECK_BIT(digitBitset, digit)) {
          grid[cellPos] = digit + 1;

          if (depth == 80 || generate(depth + 1)) {
            return 1;
          }
        }
      }
      grid[cellPos] = 0;
      return 0;
    }
  }
  return 0;
}

int solver(int depth, int *solutionCount) {
  if (*solutionCount > 1) {
    return 0;
  }

  for (int cellPos = 0; cellPos < 81; cellPos++) {
    if (gridCopy[cellPos] == 0) {
      u8 *peers = peerTable[cellPos];
      int digitBitset = 0b111111111;

      for (int i = 0; i < 20; i++) {
        // peer digit
        u8 digit = gridCopy[peers[i]];
        if (digit != 0) {
          CLEAR_BIT(digitBitset, digit - 1);
        }
      }

      for (int i = 0; i < 9; i++) {
        // cell digit
        if (CHECK_BIT(digitBitset, i)) {
          gridCopy[cellPos] = i + 1;
          if (depth == 81) {
            (*solutionCount)++;
            return 1;
          } else if (solver(depth + 1, solutionCount)) {
            return 1;
          }
        }
      }
      gridCopy[cellPos] = 0;
      return 0;
    }
  }

  return 0;
}

int hasSingleSolution(int cellCount) {
  int solutionCount = 0;
  solver(cellCount, &solutionCount);
  return solutionCount == 1;
}

void eliminate(int fillCount) {
  u8 cells[81];
  for (u8 i = 0; i < 81; i++) {
    cells[i] = i;
  }

  shuffle(cells, 81);
  for (int cellCount = 81, rounds = 3; cellCount > fillCount && rounds > 0;
       cellCount--) {
    u8 cellPos = cells[cellCount - 1];
    u8 removedDigit = grid[cellPos];
    grid[cellPos] = 0;
    __builtin_memcpy(gridCopy, grid, sizeof grid);

    if (!hasSingleSolution(cellCount)) {
      grid[cellPos] = removedDigit;
      rounds--;
      cellCount++;
    }
  }
}

void init() {
  u8 group[27][9];
  u8 foundPeers[81];

  __builtin_memset(grid, 0, sizeof grid);
  __builtin_memset(gridCopy, 0, sizeof gridCopy);
  __builtin_memset(peerTable, 0, sizeof peerTable);

  for (u8 i = 0; i < 9; i++) {
    for (u8 j = 0; j < 9; j++) {
      group[i][j] = j + i * 9;           // row
      group[i + 9][j] = i + j * 9;       // col
      group[i + 18][j] = j % 3           // select col in block
                         + (j / 3) * 9   // select row in block
                         + (i % 3) * 3   // select block vertically
                         + (i / 3) * 27; // select block horizontally
    }
  }
  for (int i = 0; i < 81; i++) {
    __builtin_memset(foundPeers, 0, sizeof foundPeers);
    int p = 0;
    for (int j = 0; j < 27; j++) {
      for (int k = 0; k < 9; k++) {
        if (group[j][k] == i) {
          goto found;
        }
      }
      continue;
    found:
      for (int k = 0; k < 9; k++) {
        u8 cell = group[j][k];
        if (foundPeers[cell] == 0 && cell != i) {
          foundPeers[cell] = 1;
          peerTable[i][p++] = cell;
        }
      }
    }
  }
}

void stringify() {
  for (int i = 0; i < 81; i++) {
    grid[i] += '0';
  }
}

void generateSudokuGrid(char *jsgrid, int fillCount, int seed) {
  randSeed = seed;
  init();
  generate(0);
  eliminate(fillCount);
  stringify();
  __builtin_memcpy(jsgrid, grid, 81);
}