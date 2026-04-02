import { Component, inject } from '@angular/core';
import { SenhaService } from '../services/senhas';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {

  guiche: number = 1;
  senhaAtual: string = '';

  readonly senhaService = inject(SenhaService);

  chamar() {
    const senhaComGuiche = this.senhaService.chamarSenhaPainel(this.guiche);

    if (senhaComGuiche) {
      this.senhaAtual = senhaComGuiche;
    } else {
      alert('Nenhuma senha disponível');
    }
  }
}
