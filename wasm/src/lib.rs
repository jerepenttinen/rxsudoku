mod utils;

use std::collections::HashSet;

use sudoku::strategy::deduction::Deductions;
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
    // Strategy::Jellyfish,        // 52
    Strategy::HiddenQuads, // 54
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
            return Grid {
                grid: sudoku.to_str_line().to_string(),
                difficulty: grade_deductions(deductions) as i32,
                // difficulty: deductions.iter().map(|d| score_strat(d.strategy())).sum(),
            };
        }
    }
}

#[wasm_bindgen]
pub fn generate_grid_of_grade(wanted: i32) -> Grid {
    set_panic_hook();
    loop {
        let sudoku = Sudoku::generate_with_symmetry(sudoku::Symmetry::None);

        let solver = StrategySolver::from_sudoku(sudoku);

        if let Ok((_, deductions)) = solver.solve(&STRATEGIES) {
            let grade = grade_deductions(deductions);
            if grade as i32 == wanted {
                println!("found grade {}\n", grade as i32);
                return Grid {
                    grid: sudoku.to_str_line().to_string(),
                    difficulty: grade as i32,
                };
            }
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub enum Grade {
    Beginner,
    Easy,
    Medium,
    Tricky,
    Hard,
}

fn grade_deductions(deductions: Deductions) -> Grade {
    let strategies: HashSet<i32> = deductions.iter().map(|d| d.strategy() as i32).collect();

    if strategies.contains(&(Strategy::XWing as i32))
        || strategies.contains(&(Strategy::Swordfish as i32))
        || strategies.contains(&(Strategy::HiddenQuads as i32))
    {
        return Grade::Hard;
    } else if strategies.contains(&(Strategy::NakedQuads as i32))
        || strategies.contains(&(Strategy::HiddenTriples as i32))
        || strategies.contains(&(Strategy::HiddenPairs as i32))
    {
        return Grade::Tricky;
    } else if strategies.contains(&(Strategy::NakedPairs as i32))
        || strategies.contains(&(Strategy::NakedTriples as i32))
    {
        return Grade::Medium;
    } else if strategies.contains(&(Strategy::LockedCandidates as i32)) {
        return Grade::Easy;
    } else {
        return Grade::Beginner;
    }
}

#[wasm_bindgen]
pub fn is_win(grid: String) -> bool {
    if let Ok(grid) = Sudoku::from_str_line(grid.as_str()) {
        return grid.is_solved();
    } else {
        // Ignore error like a genius
        return false;
    }
}
