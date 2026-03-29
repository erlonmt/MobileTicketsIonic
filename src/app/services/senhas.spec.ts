import { TestBed } from '@angular/core/testing';

import { Senhas } from './senhas';

describe('Senhas', () => {
  let service: Senhas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Senhas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
