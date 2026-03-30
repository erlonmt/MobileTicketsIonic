import { Component } from '@angular/core';
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

  constructor(public senhaService: SenhaService) {}

  chamar() {
    const senhaComGuiche = this.senhaService.chamarSenhaPainel();

    if (senhaComGuiche) {
      this.senhaAtual = senhaComGuiche;
    } else {
      alert('Nenhuma senha disponível');
    }
  }
}
