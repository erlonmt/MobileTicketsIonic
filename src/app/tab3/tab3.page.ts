import { Component, inject } from '@angular/core';
import { ResumoRelatorio, SenhaService, StatusSenha, TipoSenha } from '../services/senhas';

type PeriodoRelatorio = 'diario' | 'mensal';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  periodoSelecionado: PeriodoRelatorio = 'diario';

  readonly tipos: { codigo: TipoSenha; nome: string }[] = [
    { codigo: 'SP', nome: 'Prioritária' },
    { codigo: 'SE', nome: 'Exame' },
    { codigo: 'SG', nome: 'Geral' },
  ];

  readonly senhasService = inject(SenhaService);

  get resumoAtual(): ResumoRelatorio {
    return this.periodoSelecionado === 'diario'
      ? this.senhasService.getResumoDiario()
      : this.senhasService.getResumoMensal();
  }

  rotuloStatus(status: StatusSenha): string {
    if (status === 'atendida') {
      return 'Atendida';
    }

    if (status === 'descartada') {
      return 'Descartada';
    }

    return 'Aguardando';
  }

  classeStatus(status: StatusSenha): string {
    return `status-${status}`;
  }
}
