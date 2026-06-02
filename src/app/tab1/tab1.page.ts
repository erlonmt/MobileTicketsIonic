import { Component, inject } from '@angular/core';
import { SenhaRegistro, SenhaService, TipoSenha } from '../services/senhas';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {

  senhaGerada: SenhaRegistro | null = null;
  mensagem = 'Selecione um tipo de atendimento';

  readonly senhaService = inject(SenhaService);

  pegarSenha(tipo: TipoSenha): void {
    const senha = this.senhaService.novaSenha(tipo);

    if (!senha) {
      this.senhaGerada = null;
      this.mensagem = 'Expediente encerrado. As senhas restantes foram descartadas.';
      return;
    }

    this.senhaGerada = senha;
    this.mensagem = `Senha ${senha.codigo} emitida às ${this.formatarHora(senha.dataEmissao)}`;
  }

  private formatarHora(data: Date): string {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
