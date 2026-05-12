import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service'; // Mudamos de User para UserService

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});