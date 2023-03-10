mod utils;

use derive_builder::Builder;
use sudoku::strategy::deduction::Deductions;
use utils::set_panic_hook;
use wasm_bindgen::prelude::*;

use anyhow::anyhow;
use anyhow::Result;
use sudoku::board::Candidate;
use sudoku::board::positions::{CellAt, HouseType, LineType};
use sudoku::strategy::Strategy;
use sudoku::strategy::Strategy::*;
use sudoku::strategy::StrategySolver;
use sudoku::Sudoku;

const STRATEGIES: &[Strategy] = &[
    // difficulty as assigned by
    // SudokuExplainer
    NakedSingles,     // 23
    HiddenSingles,    // 15
    LockedCandidates, // 28
    NakedPairs,       // 30
    XWing,            // 32
    HiddenPairs,      // 34
    NakedTriples,     // 36
    Swordfish,        // 38
    HiddenTriples,    // 40
    NakedQuads,       // 50
    // Strategy::Jellyfish,        // 52
    HiddenQuads, // 54
];

#[wasm_bindgen(getter_with_clone)]
pub struct Grid {
    pub grid: String,
    pub difficulty: Grade,
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
                difficulty: grade_deductions(deductions),
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
                return Grid {
                    grid: sudoku.to_str_line().to_string(),
                    difficulty: grade,
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
    let strategies: usize = deductions.iter().fold(0, |a, d| a | (1 << d.strategy() as usize));

    let has = |s: Strategy| -> bool {
        return (strategies & (1 << (s as usize))) != 0;
    };

    return if has(XWing) || has(Swordfish) || has(HiddenQuads) {
        Grade::Hard
    } else if has(NakedQuads) || has(HiddenTriples) || has(HiddenPairs) {
        Grade::Tricky
    } else if has(NakedPairs) || has(NakedTriples) {
        Grade::Medium
    } else if has(LockedCandidates) {
        Grade::Easy
    } else {
        Grade::Beginner
    };
}

#[wasm_bindgen]
pub fn is_win(grid: String) -> bool {
    return if let Ok(grid) = Sudoku::from_str_line(grid.as_str()) {
        grid.is_solved()
    } else {
        // Ignore error like a genius
        false
    };
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct LockedCandidate {
    pub digit: usize,
    pub conflict_cells: Vec<usize>,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Single {
    pub cell: usize,
    pub digit: usize,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct Subset {
    pub positions: Vec<usize>,
    pub digits: Vec<usize>,
    pub conflict_cells: Vec<usize>,
    pub conflict_digits: Vec<usize>,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone)]
pub struct Fish {
    pub is_row: bool,
    pub digit: usize,
    pub positions: Vec<usize>,
    pub conflict_cells: Vec<usize>,
    pub conflict_digits: Vec<usize>,
}

#[derive(Builder)]
#[wasm_bindgen(getter_with_clone)]
pub struct Tip {
    #[builder(setter(into))]
    pub strategy: String,

    #[builder(setter(into, strip_option), default)]
    pub single: Option<Single>,

    #[builder(setter(into, strip_option), default)]
    pub locked_candidate: Option<LockedCandidate>,

    #[builder(setter(into, strip_option), default)]
    pub subset: Option<Subset>,

    #[builder(setter(into, strip_option), default)]
    pub fish: Option<Fish>,
}

#[wasm_bindgen]
pub fn give_tip(grid: String, marks: Vec<i32>) -> Tip {
    if let Ok(deductions) = get_deductions(grid.as_str()) {
        for deduction in deductions.iter() {
            match deduction {
                sudoku::strategy::Deduction::NakedSingles(candidate) => {
                    return TipBuilder::default()
                        .strategy("NakedSingles")
                        .single(Single {
                            cell: candidate.cell.as_index(),
                            digit: candidate.digit.get() as usize,
                        })
                        .build()
                        .unwrap();
                }
                sudoku::strategy::Deduction::HiddenSingles(candidate, ..) => {
                    return TipBuilder::default()
                        .strategy("HiddenSingles")
                        .single(Single {
                            cell: candidate.cell.as_index(),
                            digit: candidate.digit.get() as usize,
                        })
                        .build()
                        .unwrap();
                }
                sudoku::strategy::Deduction::LockedCandidates {
                    digit, conflicts, ..
                } => {
                    let digit_num = digit.get() as usize;
                    let cells = conflicts_to_cells(conflicts, marks.as_ref());

                    if cells.is_empty() {
                        continue;
                    }
                    return TipBuilder::default()
                        .strategy("LockedCandidates")
                        .locked_candidate(LockedCandidate {
                            digit: digit_num,
                            conflict_cells: cells.iter().map(|s| s.cell).collect(),
                        })
                        .build()
                        .unwrap();
                }

                sudoku::strategy::Deduction::Subsets {
                    house,
                    positions,
                    digits,
                    conflicts,
                } => {
                    let cells = conflicts_to_cells(conflicts, marks.as_ref());

                    if cells.is_empty() {
                        continue;
                    }

                    return TipBuilder::default()
                        .strategy(strategy_to_name(deduction.strategy()))
                        .subset(
                            Subset {
                                positions: positions.into_iter().map(|p| house.cell_at(p).as_index()).collect(),
                                digits: digits.into_iter().map(|d| d.get() as usize).collect(),
                                conflict_cells: cells.iter().map(|s| s.cell).collect(),
                                conflict_digits: cells.iter().map(|s| s.digit).collect(),
                            }
                        )
                        .build()
                        .unwrap();
                }
                sudoku::strategy::Deduction::BasicFish {
                    digit,
                    lines,
                    positions,
                    conflicts,
                } => {
                    let cells = conflicts_to_cells(conflicts, marks.as_ref());

                    if cells.is_empty() {
                        continue;
                    }

                    let trans_positions: Vec<usize> = lines
                        .into_iter()
                        .zip(positions.into_iter())
                        .map(|(line, pos)| line.cell_at(pos).as_index())
                        .collect();

                    let is_row = match lines.into_iter().next().unwrap().categorize() {
                        LineType::Row(_) => true,
                        LineType::Col(_) => false
                    };

                    return TipBuilder::default()
                        .strategy(strategy_to_name(deduction.strategy()))
                        .fish(Fish {
                            is_row,
                            digit: digit.get() as usize,
                            positions: trans_positions,
                            conflict_cells: cells.iter().map(|s| s.cell).collect(),
                            conflict_digits: cells.iter().map(|s| s.digit).collect(),
                        })
                        .build()
                        .unwrap();
                }
                sudoku::strategy::Deduction::Fish {
                    digit,
                    base,
                    conflicts,
                    ..
                } => {
                    let cells = conflicts_to_cells(conflicts, marks.as_ref());

                    if cells.is_empty() {
                        continue;
                    }
                    let trans_positions: Vec<usize> = base
                        .into_iter()
                        .flat_map(|b| b.cells().into_iter().map(|c| c.get() as usize))
                        .collect();

                    let is_row = match base.into_iter().next().unwrap().categorize() {
                        HouseType::Row(_) => true,
                        HouseType::Col(_) => false,
                        HouseType::Block(_) => unreachable!(),
                    };

                    return TipBuilder::default()
                        .strategy(strategy_to_name(deduction.strategy()))
                        .fish(Fish {
                            is_row,
                            digit: digit.get() as usize,
                            positions: trans_positions,
                            conflict_cells: cells.iter().map(|s| s.cell).collect(),
                            conflict_digits: cells.iter().map(|s| s.digit).collect(),
                        })
                        .build()
                        .unwrap();
                },
                _ => break,
            }
        }
    }

    TipBuilder::default().strategy(
        if let Ok(solution_exists) = has_solution(grid.as_str()) {
            if solution_exists {
                "Unknown"
            } else {
                "Unsolvable"
            }
        } else {
            "Invalid"
        }
    ).build().unwrap()
}

fn has_solution(grid: &str) -> Result<bool> {
    let sudoku = Sudoku::from_str_line(grid)?;
     Ok(sudoku.is_uniquely_solvable())
}

fn get_deductions(grid: &str) -> Result<Deductions> {
    let sudoku = Sudoku::from_str_line(grid)?;
    let solver = StrategySolver::from_sudoku(sudoku);
    if let Ok((_, deductions)) = solver.solve(&STRATEGIES) {
        Ok(deductions)
    } else {
        Err(anyhow!("Fail!"))
    }
}


fn strategy_to_name(strategy: Strategy) -> String {
    match strategy {
        NakedSingles => "NakedSingles",
        HiddenSingles => "HiddenSingles",
        LockedCandidates => "LockedCandidates",
        NakedPairs => "NakedPairs",
        NakedTriples => "NakedTriples",
        NakedQuads => "NakedQuads",
        HiddenPairs => "HiddenPairs",
        HiddenTriples => "HiddenTriples",
        HiddenQuads => "HiddenQuads",
        XWing => "XWing",
        Swordfish => "Swordfish",
        Jellyfish => "Jellyfish",
        XyWing => "XyWing",
        XyzWing => "XyzWing",
        MutantSwordfish => "MutantSwordfish",
        MutantJellyfish => "MutantJellyfish",
        AvoidableRectangles => "AvoidableRectangles",
        _ => "Unknown"
    }.into()
}

struct Solu {
    cell: usize,
    digit: usize,
}

fn conflicts_to_cells(conflicts: &[Candidate], marks: &Vec<i32>) -> Vec<Solu> {
    conflicts
        .into_iter()
        .map(|c| Solu { cell: c.cell.as_index(), digit: c.digit.get() as usize })
        .filter(|s| (marks[s.cell] & (1 << s.digit)) > 0)
        .collect()
}
