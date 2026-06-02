import { Injectable } from '@angular/core';

export type TipoSenha = 'SP' | 'SE' | 'SG';
export type StatusSenha = 'aguardando' | 'atendida' | 'descartada';

export interface TotaisPorTipo {
  SP: number;
  SE: number;
  SG: number;
}

export interface FilasSenhas {
  SP: string[];
  SE: string[];
  SG: string[];
}

export interface SenhaRegistro {
  codigo: string;
  tipo: TipoSenha;
  sequencia: number;
  dataEmissao: Date;
  dataAtendimento: Date | null;
  guiche: number | null;
  tempoAtendimento: number | null;
  status: StatusSenha;
  motivoDescarte: string | null;
  descartarSemAtendimento: boolean;
}

export interface ChamadaPainel {
  codigo: string;
  tipo: TipoSenha;
  guiche: number;
  horaAtendimento: Date;
  tempoAtendimento: number;
}

export interface ResumoRelatorio {
  titulo: string;
  periodo: string;
  totalEmitidas: number;
  totalAtendidas: number;
  totalDescartadas: number;
  totalAguardando: number;
  emitidasPorTipo: TotaisPorTipo;
  atendidasPorTipo: TotaisPorTipo;
  temposMediosPorTipo: TotaisPorTipo;
  registros: SenhaRegistro[];
}

interface FilasRegistros {
  SP: SenhaRegistro[];
  SE: SenhaRegistro[];
  SG: SenhaRegistro[];
}

@Injectable({
  providedIn: 'root',
})
export class SenhaService {

  readonly inicioExpediente = 7;
  readonly fimExpediente = 17;
  readonly tipos: TipoSenha[] = ['SP', 'SE', 'SG'];

  public horarioAtual: Date = this.criarHorarioDoDia(new Date(), this.inicioExpediente);
  public ultimasChamadas: ChamadaPainel[] = [];
  public atendimentos: ChamadaPainel[] = [];
  public emissoes: SenhaRegistro[] = [];
  public registros: SenhaRegistro[] = [];

  private expedienteAberto = true;
  private ultimoTipoChamado: TipoSenha | null = null;
  private sequencias: TotaisPorTipo = this.criarTotaisZerados();
  private filas: FilasRegistros = this.criarFilasVazias();

  get expedienteAtivo(): boolean {
    return this.expedienteAberto && this.horarioAtual.getTime() < this.fimDoExpediente.getTime();
  }

  get statusExpediente(): string {
    if (this.expedienteAtivo) {
      return 'Aberto';
    }

    return 'Encerrado';
  }

  get senhaArray(): FilasSenhas {
    return {
      SP: this.filas.SP.map((senha) => senha.codigo),
      SE: this.filas.SE.map((senha) => senha.codigo),
      SG: this.filas.SG.map((senha) => senha.codigo),
    };
  }

  get senhasTotal(): number {
    return this.registros.length;
  }

  get senhasGeral(): number {
    return this.totalEmitidasPorTipo('SG');
  }

  get senhasPrior(): number {
    return this.totalEmitidasPorTipo('SP');
  }

  get senhasExame(): number {
    return this.totalEmitidasPorTipo('SE');
  }

  get atendidosPorTipo(): TotaisPorTipo {
    return this.montarTotaisPorStatus('atendida');
  }

  get pendentesPorTipo(): TotaisPorTipo {
    return this.montarTotaisPorStatus('aguardando');
  }

  get descartadasPorTipo(): TotaisPorTipo {
    return this.montarTotaisPorStatus('descartada');
  }

  novaSenha(tipoSenha: TipoSenha): SenhaRegistro | null {
    this.verificarEncerramentoAutomatico();

    if (!this.expedienteAtivo) {
      return null;
    }

    this.sequencias[tipoSenha] += 1;

    const registro: SenhaRegistro = {
      codigo: this.gerarCodigoSenha(tipoSenha, this.sequencias[tipoSenha]),
      tipo: tipoSenha,
      sequencia: this.sequencias[tipoSenha],
      dataEmissao: new Date(this.horarioAtual),
      dataAtendimento: null,
      guiche: null,
      tempoAtendimento: null,
      status: 'aguardando',
      motivoDescarte: null,
      descartarSemAtendimento: this.deveDescartarSemAtendimento(),
    };

    this.registros.push(registro);
    this.emissoes.push(registro);
    this.filas[tipoSenha].push(registro);
    this.avancarRelogio(1);

    return registro;
  }

  chamarSenhaPainel(guiche: number): ChamadaPainel | null {
    this.verificarEncerramentoAutomatico();

    if (!this.expedienteAtivo) {
      return null;
    }

    const senhaSelecionada = this.selecionarProximaSenha();

    if (!senhaSelecionada) {
      return null;
    }

    const tempoAtendimento = this.gerarTempoAtendimento(senhaSelecionada.tipo);
    const horaAtendimento = new Date(this.horarioAtual);

    senhaSelecionada.status = 'atendida';
    senhaSelecionada.guiche = guiche;
    senhaSelecionada.tempoAtendimento = tempoAtendimento;
    senhaSelecionada.dataAtendimento = horaAtendimento;
    this.ultimoTipoChamado = senhaSelecionada.tipo;

    const chamada: ChamadaPainel = {
      codigo: senhaSelecionada.codigo,
      tipo: senhaSelecionada.tipo,
      guiche,
      horaAtendimento,
      tempoAtendimento,
    };

    this.atendimentos.push(chamada);
    this.ultimasChamadas.unshift(chamada);
    this.ultimasChamadas = this.ultimasChamadas.slice(0, 5);

    this.avancarRelogio(tempoAtendimento);

    return chamada;
  }

  encerrarExpediente(): void {
    if (!this.expedienteAberto && this.totalAguardando() === 0) {
      return;
    }

    for (const tipo of this.tipos) {
      for (const senha of this.filas[tipo]) {
        if (senha.status === 'aguardando') {
          this.descartarSenha(senha, 'Expediente encerrado às 17:00');
        }
      }
    }

    this.filas = this.criarFilasVazias();
    this.expedienteAberto = false;
    this.horarioAtual = new Date(this.fimDoExpediente);
  }

  iniciarNovoExpediente(): void {
    this.encerrarExpediente();

    const proximoDia = new Date(this.horarioAtual);
    proximoDia.setDate(proximoDia.getDate() + 1);
    this.horarioAtual = this.criarHorarioDoDia(proximoDia, this.inicioExpediente);
    this.sequencias = this.criarTotaisZerados();
    this.filas = this.criarFilasVazias();
    this.ultimoTipoChamado = null;
    this.expedienteAberto = true;
  }

  mediaTempo(tipo: TipoSenha | string): number {
    if (!this.ehTipoSenha(tipo)) {
      return 0;
    }

    return this.calcularMediaTempo(this.registros, tipo);
  }

  getTotalAtendidosPorTipo(tipo: TipoSenha): number {
    return this.atendidosPorTipo[tipo];
  }

  getTotalAtendimentos(): number {
    return this.registros.filter((senha) => senha.status === 'atendida').length;
  }

  getResumoDiario(): ResumoRelatorio {
    const registros = this.registros.filter((senha) => this.mesmoDia(senha.dataEmissao, this.horarioAtual));
    return this.montarResumo('Relatório diário', this.formatarDataCurta(this.horarioAtual), registros);
  }

  getResumoMensal(): ResumoRelatorio {
    const registros = this.registros.filter((senha) => this.mesmoMes(senha.dataEmissao, this.horarioAtual));
    return this.montarResumo('Relatório mensal', this.formatarMesAno(this.horarioAtual), registros);
  }

  totalAguardando(): number {
    return this.registros.filter((senha) => senha.status === 'aguardando').length;
  }

  gerarTempoAtendimento(tipo: TipoSenha): number {
    if (tipo === 'SP') {
      return this.randomEntre(10, 20);
    }

    if (tipo === 'SG') {
      return this.randomEntre(2, 8);
    }

    return Math.random() <= 0.95 ? 1 : 5;
  }

  private selecionarProximaSenha(): SenhaRegistro | null {
    const ordem = this.ordemDeChamada();

    for (const tipo of ordem) {
      const senha = this.retirarProximaSenhaAtendivel(tipo);

      if (senha) {
        return senha;
      }
    }

    return null;
  }

  private retirarProximaSenhaAtendivel(tipo: TipoSenha): SenhaRegistro | null {
    const fila = this.filas[tipo];

    while (fila.length > 0) {
      const senha = fila.shift();

      if (!senha || senha.status !== 'aguardando') {
        continue;
      }

      if (senha.descartarSemAtendimento) {
        this.descartarSenha(senha, 'Cliente não compareceu ao guichê');
        continue;
      }

      return senha;
    }

    return null;
  }

  private ordemDeChamada(): TipoSenha[] {
    if (this.ultimoTipoChamado === 'SP') {
      return ['SE', 'SG', 'SP'];
    }

    return ['SP', 'SE', 'SG'];
  }

  private descartarSenha(senha: SenhaRegistro, motivo: string): void {
    senha.status = 'descartada';
    senha.guiche = null;
    senha.tempoAtendimento = null;
    senha.dataAtendimento = null;
    senha.motivoDescarte = motivo;
  }

  private montarResumo(titulo: string, periodo: string, registros: SenhaRegistro[]): ResumoRelatorio {
    const registrosOrdenados = [...registros].sort((a, b) => b.dataEmissao.getTime() - a.dataEmissao.getTime());

    return {
      titulo,
      periodo,
      totalEmitidas: registros.length,
      totalAtendidas: registros.filter((senha) => senha.status === 'atendida').length,
      totalDescartadas: registros.filter((senha) => senha.status === 'descartada').length,
      totalAguardando: registros.filter((senha) => senha.status === 'aguardando').length,
      emitidasPorTipo: this.montarTotais(registros),
      atendidasPorTipo: this.montarTotais(registros.filter((senha) => senha.status === 'atendida')),
      temposMediosPorTipo: {
        SP: this.calcularMediaTempo(registros, 'SP'),
        SE: this.calcularMediaTempo(registros, 'SE'),
        SG: this.calcularMediaTempo(registros, 'SG'),
      },
      registros: registrosOrdenados,
    };
  }

  private montarTotais(registros: SenhaRegistro[]): TotaisPorTipo {
    const totais = this.criarTotaisZerados();

    for (const senha of registros) {
      totais[senha.tipo] += 1;
    }

    return totais;
  }

  private montarTotaisPorStatus(status: StatusSenha): TotaisPorTipo {
    return this.montarTotais(this.registros.filter((senha) => senha.status === status));
  }

  private totalEmitidasPorTipo(tipo: TipoSenha): number {
    return this.registros.filter((senha) => senha.tipo === tipo).length;
  }

  private calcularMediaTempo(registros: SenhaRegistro[], tipo: TipoSenha): number {
    const atendidas = registros.filter((senha) => senha.tipo === tipo && senha.tempoAtendimento !== null);

    if (atendidas.length === 0) {
      return 0;
    }

    const soma = atendidas.reduce((total, senha) => total + (senha.tempoAtendimento ?? 0), 0);
    return Number((soma / atendidas.length).toFixed(1));
  }

  private gerarCodigoSenha(tipo: TipoSenha, sequencia: number): string {
    return `${this.formatarDataCodigo(this.horarioAtual)}-${tipo}${sequencia.toString().padStart(3, '0')}`;
  }

  private formatarDataCodigo(data: Date): string {
    const ano = data.getFullYear().toString().slice(-2);
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');

    return `${ano}${mes}${dia}`;
  }

  private formatarDataCurta(data: Date): string {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  private formatarMesAno(data: Date): string {
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear();

    return `${mes}/${ano}`;
  }

  private avancarRelogio(minutos: number): void {
    this.horarioAtual = new Date(this.horarioAtual.getTime() + minutos * 60_000);
    this.verificarEncerramentoAutomatico();
  }

  private verificarEncerramentoAutomatico(): void {
    if (this.expedienteAberto && this.horarioAtual.getTime() >= this.fimDoExpediente.getTime()) {
      this.encerrarExpediente();
    }
  }

  private get fimDoExpediente(): Date {
    return this.criarHorarioDoDia(this.horarioAtual, this.fimExpediente);
  }

  private deveDescartarSemAtendimento(): boolean {
    const numeroDaEmissao = this.registros.length + 1;
    return numeroDaEmissao % 20 === 0;
  }

  private randomEntre(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private mesmoDia(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  private mesmoMes(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }

  private criarHorarioDoDia(data: Date, hora: number): Date {
    const horario = new Date(data);
    horario.setHours(hora, 0, 0, 0);

    return horario;
  }

  private criarTotaisZerados(): TotaisPorTipo {
    return { SP: 0, SE: 0, SG: 0 };
  }

  private criarFilasVazias(): FilasRegistros {
    return { SP: [], SE: [], SG: [] };
  }

  private ehTipoSenha(valor: string): valor is TipoSenha {
    return valor === 'SP' || valor === 'SE' || valor === 'SG';
  }
}
