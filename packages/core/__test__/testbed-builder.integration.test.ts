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

    it('should invoke the Logger.log message on instantiation os the UserService', () => {
      const mockedLogger: StubbedInstance<Logger> = unitRef.get<Logger>(Logger);
      expect(mockedLogger.log).toHaveBeenNthCalledWith(1, 'Just logging a message');
      expect(mockedLogger.log).toHaveBeenNthCalledWith(2, 'UserService initialized');
    });

    it('should create a user successfully using UserDal.createUser and mock dependencies', () => {
      // Retrieve the UserDal instance from unitRef
      const userDal: UserDal = unitRef.get(UserDal);

      // Create a mock user object for testing
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
      };

      // Mock the behavior of UserVerificationService if necessary
      const userVerService: jest.Mocked<UserVerificationService> =
        unitRef.get(UserVerificationService);

      //

      // userVerificationServiceMock.verify.mockReturnValue(true); // Assuming the user is valid

      // Mock the behavior of DatabaseService if necessary
      // const databaseServiceMock = unitRef.get<DatabaseService>(DatabaseService);
      // Mock any relevant methods of DatabaseService, e.g., save, insert

      userVerService.verify.mockReturnValue(true);

      // Call createUser with the mock user
      const createdUser = userDal.createUser(mockUser);

      // Assert that the user is created successfully
      expect(createdUser).toEqual(mockUser);
      // Additional assertions can be added here to verify the interaction with the mocked dependencies
    });
  });
});
