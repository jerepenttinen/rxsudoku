mod utils;

use utils::set_panic_hook;
use wasm_bindgen::prelude::*;

use sudoku::strategy::Strategy;
use sudoku::strategy::StrategySolver;
use sudoku::Sudoku;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

const STRATEGIES: &[Strategy] = &[
    // difficulty as assigned by
    // SudokuExplainer
    Strategy::NakedSingles,     // 23
    Strategy::HiddenSingles,    // 15
    Strategy::LockedCandidates, // 28
    Strategy::NakedPairs,       // 30
    Strategy::XWing,            // 32
    Strategy::HiddenPairs,      // 34
    Strategy::NakedTriples,     // 36
    Strategy::Swordfish,        // 38
    Strategy::HiddenTriples,    // 40
    Strategy::NakedQuads,       // 50
    Strategy::Jellyfish,        // 52
    Strategy::HiddenQuads,      // 54
];

#[wasm_bindgen(getter_with_clone)]
pub struct Grid {
    pub grid: String,
    pub difficulty: i32,
}

#[wasm_bindgen]
pub fn generate_grid() -> Grid {
    set_panic_hook();
    loop {
        let sudoku = Sudoku::generate();

        let solver = StrategySolver::from_sudoku(sudoku);

        if let Ok((_, deductions)) = solver.solve(&STRATEGIES) {
            let grid = Grid {
                grid: sudoku.to_str_line().to_string(),
                difficulty: deductions.iter().map(|d| score_strat(d.strategy())).sum(),
            };

            // let line: &str = &sudoku.to_str_line();

            // return line.into();
            // return serde_wasm_bindgen::to_value(&grid).unwrap();
            return grid;
        }
    }
}

fn score_strat(strategy: Strategy) -> i32 {
    return match strategy {
        Strategy::NakedSingles => 23,
        Strategy::HiddenSingles => 15,
        Strategy::LockedCandidates => 28,
        Strategy::NakedPairs => 30,
        Strategy::NakedTriples => 36,
        Strategy::NakedQuads => 50,
        Strategy::HiddenPairs => 34,
        Strategy::HiddenTriples => 40,
        Strategy::HiddenQuads => 54,
        Strategy::XWing => 32,
        Strategy::Swordfish => 38,
        Strategy::Jellyfish => 52,
        _ => todo!(),
    };
}
