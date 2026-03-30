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
    const senhaSemGuiche = this.senhaService.chamarProximaSenha();

    if (senhaSemGuiche) {
      const senhaComGuiche = `${senhaSemGuiche} - G${this.guiche}`;
      this.senhaAtual = senhaComGuiche;
      
      this.senhaService.ultimasChamadas.push(senhaComGuiche);

      if (this.senhaService.ultimasChamadas.length > 5) {
        this.senhaService.ultimasChamadas.shift();
      }
    } else {
      alert('Nenhuma senha disponível');
    }
  }
}
