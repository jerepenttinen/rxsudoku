mod utils;

use std::collections::HashSet;

use derive_builder::Builder;
use sudoku::strategy::deduction::Deductions;
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;

use anyhow::anyhow;
use anyhow::Result;
use sudoku::strategy::Strategy;
use sudoku::strategy::StrategySolver;
use sudoku::Sudoku;

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

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct LockedCandidate {
    pub digit: usize,
    pub conflict_cells: Vec<usize>,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct HiddenSingle {
    pub cell: usize,
    pub digit: usize,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct NakedSingle {
    pub cell: usize,
    pub digit: usize,
}

#[derive(Builder)]
#[wasm_bindgen(getter_with_clone)]
pub struct Tip {
    #[builder(setter(into))]
    pub strategy: String,

    #[builder(setter(into, strip_option), default)]
    pub hidden_single: Option<HiddenSingle>,

    #[builder(setter(into, strip_option), default)]
    pub naked_single: Option<NakedSingle>,

    #[builder(setter(into, strip_option), default)]
    pub locked_candidate: Option<LockedCandidate>,
}

#[wasm_bindgen]
pub fn give_tip(grid: String, marks: Vec<i32>) -> Tip {
    if let Ok(deductions) = get_deductions(grid) {
        for deduction in deductions.iter() {
            match deduction {
                sudoku::strategy::Deduction::NakedSingles(cand) => {
                    return TipBuilder::default()
                        .strategy("NakedSingle")
                        .naked_single(NakedSingle {
                            cell: cand.cell.as_index(),
                            digit: cand.digit.get() as usize,
                        })
                        .build()
                        .unwrap()
                }
                sudoku::strategy::Deduction::HiddenSingles(cand, _) => {
                    return TipBuilder::default()
                        .strategy("HiddenSingle")
                        .hidden_single(HiddenSingle {
                            cell: cand.cell.as_index(),
                            digit: cand.digit.get() as usize,
                        })
                        .build()
                        .unwrap()
                }
                sudoku::strategy::Deduction::LockedCandidates {
                    digit,
                    miniline: _,
                    is_pointing: _,
                    conflicts,
                } => {
                    let digit_num = digit.get() as usize;
                    let cells: Vec<usize> = conflicts
                        .into_iter()
                        .map(|c| c.cell.as_index())
                        .filter(|i| (marks[i.clone()] & (1 << digit_num)) > 0)
                        .collect();
                    if cells.is_empty() {
                        continue;
                    }
                    return TipBuilder::default()
                        .strategy("LockedCandidate")
                        .locked_candidate(LockedCandidate {
                            digit: digit_num,
                            conflict_cells: cells,
                        })
                        .build()
                        .unwrap();
                }

                // sudoku::strategy::Deduction::Subsets {
                //     house,
                //     positions,
                //     digits,
                //     conflicts,
                // } => todo!(),
                // sudoku::strategy::Deduction::BasicFish {
                //     digit,
                //     lines,
                //     positions,
                //     conflicts,
                // } => todo!(),
                // sudoku::strategy::Deduction::Fish {
                //     digit,
                //     base,
                //     cover,
                //     conflicts,
                // } => todo!(),
                // sudoku::strategy::Deduction::Wing {
                //     hinge,
                //     hinge_digits,
                //     pincers,
                //     conflicts,
                // } => todo!(),
                _ => break,
            }
        }
    }
    // }
    TipBuilder::default().strategy("Unknown").build().unwrap()
}

fn get_deductions(grid: String) -> Result<Deductions> {
    let sudoku = Sudoku::from_str_line(grid.as_str())?;
    let solver = StrategySolver::from_sudoku(sudoku);
    if let Ok((_, deductions)) = solver.solve(&STRATEGIES) {
        Ok(deductions)
    } else {
        Err(anyhow!("Fail!"))
    }
}
