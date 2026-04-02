import { Component, inject } from '@angular/core';
import { SenhaService } from '../services/senhas';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  readonly senhasService = inject(SenhaService);

}
