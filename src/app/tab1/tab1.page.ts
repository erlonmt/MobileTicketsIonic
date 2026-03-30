import { Component } from '@angular/core';
import { SenhaService } from '../services/senhas';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  senhaGerada: string = '';

  constructor(private senhaService: SenhaService) {}

  pegarSenha(tipo: 'SP' | 'SG' | 'SE') {
    this.senhaService.novaSenha(tipo);
    this.senhaGerada = this.senhaService.inputNovaSenha;
  }
}
