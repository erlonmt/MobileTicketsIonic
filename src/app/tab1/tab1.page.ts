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
    this.senhaGerada = '';
    this.senhaService.novaSenha(tipo);
    let key = '';
    if (tipo === 'SG') {
      key = 'SG';
    } else if (tipo === 'SP') {
      key = 'SP';
    } else if (tipo === 'SE') {
      key = 'SE';
    }
    const arr = this.senhaService.senhaArray[key];
    if (arr && arr.length > 0) {
      this.senhaGerada = arr[arr.length - 1];
    }
  }
}
