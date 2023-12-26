import { TestBedBuilder, UnitReference, UnitTestBed } from '../src';
import { UnitBuilder } from '../src/services/testbed-builder';
import { UnitMocker } from '../src/services/unit-mocker';
import { FakeAdapter } from './assets/integration.assets';
import { mock } from './assets/mock.static';
import {
  Logger,
  Repository,
  UserApiService,
  UserDal,
  UserService,
  UserVerificationService,
  HttpClient,
  UserDigestService,
  ApiService,
  DatabaseService,
} from './injectables-registry.fixture';
import { StubbedInstance } from '@automock/types';
import Mocked = jest.Mocked;

describe('UserService TestBed Builder Integration Test', () => {
  let unitBuilder: TestBedBuilder<UserService>;
  const loggerMock = { warn: jest.fn() } as Partial<Console>;

  beforeAll(() => {
    unitBuilder = UnitBuilder.create<UserService>(
      mock,
      new UnitMocker(mock, loggerMock as Console, FakeAdapter)
    )(UserService);
  });

  describe('creating a testbed builder with some mock overrides', () => {
    let userServiceAsIfItWasUnderTest: UserService;
    let unitRef: UnitReference;

    beforeAll(() => {
      const testBed = unitBuilder
        .expose(UserApiService)
        .expose(UserDal)
        .mock(Logger)
        .using({ log: jest.fn().mockReturnValue('overridden') })
        .mock<Repository>('Repository')
        .using({ find: () => ['overridden'] })
        .compile();

      userServiceAsIfItWasUnderTest = testBed.unit;
      unitRef = testBed.unitRef;
    });

    it('should instantiate UserService with all dependencies properly resolved', () => {
      expect(userServiceAsIfItWasUnderTest).toBeInstanceOf(UserService);
    });

    it('should log messages using the overridden Logger.log method when UserService is initialized', () => {
      const mockedLogger: StubbedInstance<Logger> = unitRef.get<Logger>(Logger);
      expect(mockedLogger.log).toHaveBeenNthCalledWith(1, 'Just logging a message');
      expect(mockedLogger.log).toHaveBeenNthCalledWith(2, 'UserService initialized');
    });

    it('should create a user successfully using UserDal.createUser and mock dependencies', () => {
      // Retrieve the UserDal instance from unitRef
      const userDal: UserDal = unitRef.pick(UserDal);

      // Create a mock user object for testing
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
      };

      // Mock the behavior of UserVerificationService if necessary
      const userVerService = unitRef.get(UserVerificationService);

      userVerService.verify.mockReturnValue(true);

      // Call createUser with the mock user
      const createdUser = userDal.createUser(mockUser);

      // Assert that the user is created successfully
      expect(createdUser).toEqual(mockUser);
    });
  });
});
