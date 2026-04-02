import { Component, inject } from '@angular/core';
import { SenhaService } from '../services/senhas';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  senhaGerada: string = '';

  private readonly senhaService = inject(SenhaService);

  pegarSenha(tipo: 'SP' | 'SG' | 'SE') {
    this.senhaGerada = '';
    this.senhaService.novaSenha(tipo);
    const arr = this.senhaService.senhaArray[tipo];
    if (arr && arr.length > 0) {
      this.senhaGerada = arr[arr.length - 1];
    }
  }
}
