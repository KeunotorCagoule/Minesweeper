// ---------------------------------------------------------------------------------------------------------------------
//!                                                       Imports
// ---------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------------ React --------------------------------------------------------
import { MouseEvent, useCallback, useState } from 'react';
// ---------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------------ Types --------------------------------------------------------
import { SetterOrUpdater } from 'recoil';
import { Difficulty, GridType } from '../../../types/game';
import { GameState } from '../../../types/gameState';
// ---------------------------------------------------------------------------------------------------------------------

// ------------------------------------------------------ Utils --------------------------------------------------------
import { discoverAroundCell, revealAllGrid, startGame } from '../../../utils/game';
// ---------------------------------------------------------------------------------------------------------------------

export const useActions = (grid: GridType, setGrid: React.Dispatch<React.SetStateAction<GridType>>, gameState: GameState, setGameState: SetterOrUpdater<GameState>) => {
	const [, updateGrid] = useState({});
	const forceUpdate = useCallback(() => updateGrid({}), []);

	const handleLeftClick = (ev: MouseEvent, rowIndex: number, colIndex: number) => {
		ev.preventDefault();

		if (grid[rowIndex][colIndex].hidden && !grid[rowIndex][colIndex].flag) {
			setGrid((prev) => {
				if (gameState.status === 'idle') {
					const { grid: newGrid, bombsCount } = startGame(prev, gameState.difficulty as Difficulty, true, rowIndex, colIndex);
					prev = newGrid;

					setGameState((prevGameState) => ({
						...prevGameState,
						status: 'playing',
						bombs: bombsCount,
					}));
				}

				if (prev[rowIndex][colIndex].value === 'bomb') {
					setGameState((prev) => ({
						...prev,
						endType: 'loose',
					}));
					return revealAllGrid(grid, true);
				}

				if (prev[rowIndex][colIndex].value === 'empty') {
					return discoverAroundCell(prev, rowIndex, colIndex);
				}

				prev[rowIndex][colIndex].hidden = false;
				return prev;
			});
			forceUpdate();
		}
	};

	const handleRightClick = (ev: MouseEvent, rowIndex: number, colIndex: number) => {
		ev.preventDefault();

		if (grid[rowIndex][colIndex].hidden) {
			setGrid((prev) => {
				if (gameState.status === 'idle') {
					const { grid: newGrid, bombsCount } = startGame(prev, gameState.difficulty as Difficulty, false);
					prev = newGrid;

					setGameState((prevGameState) => ({
						...prevGameState,
						status: 'playing',
						bombs: bombsCount,
					}));
				}

				return prev.map((row, idx) => {
					if (idx === rowIndex) {
						return row.map((col, idy) => {
							if (idy === colIndex) {
								setGameState((prevGameState) => ({
									...prevGameState,
									placedFlags: col.flag ? prevGameState.placedFlags - 1 : prevGameState.placedFlags + 1,
								}));

								return {
									...col,
									flag: !col.flag,
								};
							}
							return col;
						});
					}
					return row;
				});
			});
		}
	};

	return {
		handleLeftClick,
		handleRightClick,
	};
};
