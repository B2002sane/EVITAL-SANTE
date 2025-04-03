import { TestBed } from '@angular/core/testing';

import { DemandeDonService } from './demande-don.service';

describe('DemandeDonService', () => {
  let service: DemandeDonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemandeDonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
