import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SenhaService {

  public senhasGeral: number = 0;
  public senhasPrior: number = 0;
  public senhasExame: number = 0;
  public senhasTotal: number = 0;

  // Arrays para armazenar as senhas emitidas por tipo
  public senhaArray: { [key: string]: string[] } = {
    SG: [],
    SP: [],
    SE: [],
  };

  public inputNovaSenha: string = '';

  somaGeral() {
    this.senhasGeral++;
    this.senhasTotal++;
  }

  somaPrior() {
    this.senhasPrior++;
    this.senhasTotal++;
  }

  somaExame() {
    this.senhasExame++;
    this.senhasTotal++;
  }

  novaSenha(tipoSenha: string = '') {
    let prefix = '';
    let key = '';
    if (tipoSenha == 'SG') {
      this.somaGeral();
      prefix = 'SG';
      key = 'SG';
    } else if (tipoSenha == 'SP') {
      this.somaPrior();
      prefix = 'SP';
      key = 'SP';
    } else if (tipoSenha == 'SE') {
      this.somaExame();
      prefix = 'SE';
      key = 'SE';
    } else {
      return; // tipo inválido
    }

    const now = new Date();
    this.inputNovaSenha =
      prefix +
      new Date().getFullYear().toString().substring(2, 4) +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '-' +
      (this.senhaArray[key].length + 1).toString().padStart(2, '0');

    this.senhaArray[key].push(this.inputNovaSenha);

    console.log(this.senhaArray);
  }
}
