import { Test, TestingModule } from '@nestjs/testing';
import * as Boards from 'src/modules/boards/interfaces/types';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { BoardFactory } from 'src/libs/test-utils/mocks/factories/board-factory.mock';
import { UseCase } from 'src/libs/interfaces/use-case.interface';
import { deleteBoardUseCase } from '../boards.providers';
import { DeleteBoardServiceInterface } from '../interfaces/services/delete.board.service.interface';
import { BoardRepositoryInterface } from '../repositories/board.repository.interface';
import { NotFoundException } from '@nestjs/common';
import DeleteBoardUseCaseDto from 'src/modules/boards/dto/useCase/delete-board.use-case';

const board = BoardFactory.create({
	dividedBoards: BoardFactory.createMany(2),
	slackEnable: true
});

describe('DeleteBoardUseCase', () => {
	let useCase: UseCase<DeleteBoardUseCaseDto, boolean>;
	let deleteBoardServiceMock: DeepMocked<DeleteBoardServiceInterface>;
	let boardRepositoryMock: DeepMocked<BoardRepositoryInterface>;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				deleteBoardUseCase,
				{
					provide: Boards.TYPES.services.DeleteBoardService,
					useValue: createMock<DeleteBoardServiceInterface>()
				},
				{
					provide: Boards.TYPES.repositories.BoardRepository,
					useValue: createMock<BoardRepositoryInterface>()
				}
			]
		}).compile();

		useCase = module.get(Boards.TYPES.applications.DeleteBoardUseCase);
		deleteBoardServiceMock = module.get(Boards.TYPES.services.DeleteBoardService);
		boardRepositoryMock = module.get(Boards.TYPES.repositories.BoardRepository);
	});

	beforeEach(() => {
		jest.clearAllMocks();
		boardRepositoryMock.getBoard.mockResolvedValue(board);
	});

	it('should be defined', () => {
		expect(useCase).toBeDefined();

		boardRepositoryMock.getBoard.mockResolvedValue(board);
	});

	describe('execute', () => {
		it('should return true if execute succeeds', async () => {
			deleteBoardServiceMock.deleteBoardBoardUsersAndSchedules.mockResolvedValue(true);

			await expect(
				useCase.execute({ boardId: 'boardId', completionHandler: jest.fn() })
			).resolves.toBe(true);
		});

		it('should throw notFoundException when board not found ', async () => {
			boardRepositoryMock.getBoard.mockResolvedValue(null);

			await expect(
				useCase.execute({ boardId: 'boardId', completionHandler: jest.fn() })
			).rejects.toThrow(NotFoundException);
		});

		it('should call completionHandler when execute board is deleted', async () => {
			deleteBoardServiceMock.deleteBoardBoardUsersAndSchedules.mockResolvedValue(true);
			const completionHandlerMock = jest.fn();

			await expect(
				useCase.execute({
					boardId: 'boardId',
					completionHandler: completionHandlerMock
				})
			).resolves.toBe(true);
			expect(completionHandlerMock).toBeCalled();
		});

		it("shouldn't call completionHandler when execute board isn't deleted", async () => {
			deleteBoardServiceMock.deleteBoardBoardUsersAndSchedules.mockResolvedValue(false);
			const completionHandlerMock = jest.fn();

			await expect(
				useCase.execute({
					boardId: 'boardId',
					completionHandler: completionHandlerMock
				})
			).resolves.toBe(false);
			expect(completionHandlerMock).not.toBeCalled();
		});
	});
});
